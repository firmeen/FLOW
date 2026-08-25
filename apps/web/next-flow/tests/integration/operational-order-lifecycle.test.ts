import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import {
  markOperationalOrderReady,
  markOperationalOrderServed,
  startPreparingOperationalOrder,
} from "@/modules/order-operations/server/order-lifecycle-service";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const actorId = "97000000-0000-4000-8000-000000000001";
const roleId = "97000000-0000-4000-8000-000000000002";
const membershipId = "97000000-0000-4000-8000-000000000003";

const orderIds = {
  happy: "98000000-0000-4000-8000-000000000001",
  acceptedSkip: "98000000-0000-4000-8000-000000000002",
  preparingSkip: "98000000-0000-4000-8000-000000000003",
  rejected: "98000000-0000-4000-8000-000000000004",
  race: "98000000-0000-4000-8000-000000000005",
  rollback: "98000000-0000-4000-8000-000000000006",
  siblingBranch: "98000000-0000-4000-8000-000000000007",
  otherTenant: "98000000-0000-4000-8000-000000000008",
  revoked: "98000000-0000-4000-8000-000000000009",
  viewOnly: "98000000-0000-4000-8000-00000000000a",
} as const;

const context = {
  actorId,
  tenantId: fixture.tenants.a,
  branchId: fixture.branches.a1,
  membershipId,
  roleId,
  scope: "BRANCH",
} satisfies AccessContext;

const viewOnlyContext = {
  actorId: fixture.users.staffA1,
  tenantId: fixture.tenants.a,
  branchId: fixture.branches.a1,
  membershipId: "60000000-0000-4000-8000-0000000000a2",
  roleId: "50000000-0000-4000-8000-0000000000a2",
  scope: "BRANCH",
} satisfies AccessContext;

function orderFixture(input: {
  readonly id: string;
  readonly orderNumber: string;
  readonly tenantId?: string;
  readonly restaurantId?: string;
  readonly branchId?: string;
  readonly tableId?: string;
  readonly status?: "ACCEPTED" | "PREPARING" | "READY" | "REJECTED";
}) {
  const status = input.status ?? "ACCEPTED";
  const acceptedAt = status === "REJECTED" ? null : new Date("2040-03-01T00:00:00Z");
  const preparingAt =
    status === "PREPARING" || status === "READY"
      ? new Date("2040-03-01T00:01:00Z")
      : null;
  const readyAt = status === "READY" ? new Date("2040-03-01T00:02:00Z") : null;
  const customerStatus =
    status === "ACCEPTED"
      ? "CONFIRMED"
      : status === "PREPARING"
        ? "PREPARING"
        : status === "READY"
          ? "COMING_TO_TABLE"
          : "REJECTED";

  return {
    id: input.id,
    tenant_id: input.tenantId ?? fixture.tenants.a,
    restaurant_id: input.restaurantId ?? "00000000-0000-0000-0000-0000000000a2",
    branch_id: input.branchId ?? fixture.branches.a1,
    table_id: input.tableId ?? "00000000-0000-0000-0000-0000000000a5",
    table_session_id: null,
    order_number: input.orderNumber,
    status,
    customer_status: customerStatus,
    subtotal_minor: "10000",
    currency: "THB",
    customer_note: null,
    submission_key: `p04-r03-${input.id}`,
    submitted_at: new Date("2040-03-01T00:00:00Z"),
    accepted_at: acceptedAt,
    preparing_at: preparingAt,
    ready_at: readyAt,
    served_at: null,
    paid_at: null,
    closed_at: null,
    rejected_at: status === "REJECTED" ? new Date("2040-03-01T00:00:30Z") : null,
    rejection_reason: status === "REJECTED" ? "INVALID_ORDER" : null,
    modified_by_staff: null,
    source_cart_id: null,
    customer_capability_id: null,
  } as const;
}

async function loadState(orderId: string) {
  const { db } = getDatabaseRuntime();
  const order = await db
    .selectFrom("foodflow.orders")
    .select([
      "status",
      "customer_status as customerStatus",
      "accepted_at as acceptedAt",
      "preparing_at as preparingAt",
      "ready_at as readyAt",
      "served_at as servedAt",
      "modified_by_staff as modifiedByStaff",
    ])
    .where("id", "=", orderId)
    .executeTakeFirstOrThrow();
  const events = await db
    .selectFrom("foodflow.order_events")
    .select([
      "event_type as eventType",
      "from_status as fromStatus",
      "to_status as toStatus",
      "actor_id as actorId",
      "occurred_at as occurredAt",
    ])
    .where("order_id", "=", orderId)
    .orderBy("occurred_at", "asc")
    .execute();
  return { order, events };
}

async function dropInjectedFailureTrigger() {
  const { db } = getDatabaseRuntime();
  await sql`drop trigger if exists p04_r03_fail_lifecycle_event on foodflow.order_events`.execute(db);
  await sql`drop function if exists private.p04_r03_fail_lifecycle_event()`.execute(db);
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R03 operational order lifecycle",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();
      await db
        .insertInto("app.users")
        .values({
          id: actorId,
          email: "p04-r03-lifecycle@flow.test",
          display_name: "P04 R03 Lifecycle Actor",
          status: "ACTIVE",
        })
        .execute();
      await db
        .insertInto("app.roles")
        .values({
          id: roleId,
          tenant_id: fixture.tenants.a,
          code: "P04_R03_LIFECYCLE",
          name: "P04 R03 Lifecycle",
          system: false,
        })
        .execute();

      const permissions = await db
        .selectFrom("app.permissions")
        .select(["id", "code"])
        .where("code", "in", [PERMISSIONS.orderManage, PERMISSIONS.orderView])
        .execute();
      expect(permissions).toHaveLength(2);
      await db
        .insertInto("app.role_permissions")
        .values(
          permissions.map((permission) => ({
            role_id: roleId,
            permission_id: permission.id,
          })),
        )
        .execute();
      await db
        .insertInto("app.memberships")
        .values({
          id: membershipId,
          tenant_id: fixture.tenants.a,
          user_id: actorId,
          role_id: roleId,
          branch_id: fixture.branches.a1,
          status: "ACTIVE",
        })
        .execute();

      await db
        .insertInto("foodflow.orders")
        .values([
          orderFixture({ id: orderIds.happy, orderNumber: "P04-R03-HAPPY" }),
          orderFixture({ id: orderIds.acceptedSkip, orderNumber: "P04-R03-ACCEPTED-SKIP" }),
          orderFixture({
            id: orderIds.preparingSkip,
            orderNumber: "P04-R03-PREPARING-SKIP",
            status: "PREPARING",
          }),
          orderFixture({
            id: orderIds.rejected,
            orderNumber: "P04-R03-REJECTED",
            status: "REJECTED",
          }),
          orderFixture({ id: orderIds.race, orderNumber: "P04-R03-RACE" }),
          orderFixture({ id: orderIds.rollback, orderNumber: "P04-R03-ROLLBACK" }),
          orderFixture({
            id: orderIds.siblingBranch,
            orderNumber: "P04-R03-A2",
            branchId: fixture.branches.a2,
            tableId: "00000000-0000-0000-0000-0000000000ad",
          }),
          orderFixture({
            id: orderIds.otherTenant,
            orderNumber: "P04-R03-B1",
            tenantId: fixture.tenants.b,
            restaurantId: "00000000-0000-0000-0000-0000000000b2",
            branchId: fixture.branches.b1,
            tableId: "00000000-0000-0000-0000-0000000000b5",
          }),
          orderFixture({ id: orderIds.revoked, orderNumber: "P04-R03-REVOKED" }),
          orderFixture({ id: orderIds.viewOnly, orderNumber: "P04-R03-VIEW" }),
        ])
        .execute();
    });

    afterAll(async () => {
      const { db } = getDatabaseRuntime();
      await dropInjectedFailureTrigger();
      await db
        .deleteFrom("foodflow.order_events")
        .where("order_id", "in", Object.values(orderIds))
        .execute();
      await db
        .deleteFrom("foodflow.orders")
        .where("id", "in", Object.values(orderIds))
        .execute();
      await db.deleteFrom("app.memberships").where("id", "=", membershipId).execute();
      await db.deleteFrom("app.role_permissions").where("role_id", "=", roleId).execute();
      await db.deleteFrom("app.roles").where("id", "=", roleId).execute();
      await db.deleteFrom("app.users").where("id", "=", actorId).execute();
      await destroyDatabaseRuntimeForTests();
    });

    it("progresses ACCEPTED -> PREPARING -> READY -> SERVED with durable evidence", async () => {
      const preparing = await startPreparingOperationalOrder(context, orderIds.happy);
      expect(preparing).toMatchObject({
        action: "START_PREPARING",
        fromStatus: "ACCEPTED",
        status: "PREPARING",
        customerStatus: "PREPARING",
      });

      const ready = await markOperationalOrderReady(context, orderIds.happy);
      expect(ready).toMatchObject({
        action: "MARK_READY",
        fromStatus: "PREPARING",
        status: "READY",
        customerStatus: "COMING_TO_TABLE",
      });

      const served = await markOperationalOrderServed(context, orderIds.happy);
      expect(served).toMatchObject({
        action: "MARK_SERVED",
        fromStatus: "READY",
        status: "SERVED",
        customerStatus: "SERVED",
      });

      const state = await loadState(orderIds.happy);
      expect(state.order.status).toBe("SERVED");
      expect(state.order.customerStatus).toBe("SERVED");
      expect(state.order.acceptedAt).toEqual(new Date("2040-03-01T00:00:00Z"));
      expect(state.order.preparingAt).toBeInstanceOf(Date);
      expect(state.order.readyAt).toBeInstanceOf(Date);
      expect(state.order.servedAt).toBeInstanceOf(Date);
      expect(state.order.modifiedByStaff).toBe(actorId);
      expect(state.events.map((event) => event.eventType)).toEqual([
        "ORDER_PREPARING",
        "ORDER_READY",
        "ORDER_SERVED",
      ]);
      expect(state.events.map((event) => [event.fromStatus, event.toStatus])).toEqual([
        ["ACCEPTED", "PREPARING"],
        ["PREPARING", "READY"],
        ["READY", "SERVED"],
      ]);
      expect(state.events.every((event) => event.actorId === actorId)).toBe(true);
    });

    it("rejects skipped and terminal transitions without writing evidence", async () => {
      await expect(
        markOperationalOrderReady(context, orderIds.acceptedSkip),
      ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_CONFLICT" });
      await expect(
        markOperationalOrderServed(context, orderIds.preparingSkip),
      ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_CONFLICT" });
      await expect(
        startPreparingOperationalOrder(context, orderIds.rejected),
      ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_CONFLICT" });

      for (const orderId of [orderIds.acceptedSkip, orderIds.preparingSkip, orderIds.rejected]) {
        const state = await loadState(orderId);
        expect(state.events).toHaveLength(0);
      }
    });

    it("requires order.manage independently of order.view", async () => {
      await expect(
        startPreparingOperationalOrder(viewOnlyContext, orderIds.viewOnly),
      ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_FORBIDDEN" });
      const state = await loadState(orderIds.viewOnly);
      expect(state.order.status).toBe("ACCEPTED");
      expect(state.events).toHaveLength(0);
    });

    it("does not disclose sibling-branch or cross-tenant order selectors", async () => {
      for (const orderId of [orderIds.siblingBranch, orderIds.otherTenant]) {
        await expect(
          startPreparingOperationalOrder(context, orderId),
        ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_NOT_FOUND" });
      }
    });

    it("revokes lifecycle authority on the next permission evaluation", async () => {
      const { db } = getDatabaseRuntime();
      await db
        .updateTable("app.memberships")
        .set({ status: "REVOKED" })
        .where("id", "=", membershipId)
        .execute();
      try {
        await expect(
          startPreparingOperationalOrder(context, orderIds.revoked),
        ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_FORBIDDEN" });
      } finally {
        await db
          .updateTable("app.memberships")
          .set({ status: "ACTIVE" })
          .where("id", "=", membershipId)
          .execute();
      }
    });

    it("allows exactly one winner for concurrent duplicate lifecycle actions", async () => {
      const outcomes = await Promise.allSettled([
        startPreparingOperationalOrder(context, orderIds.race),
        startPreparingOperationalOrder(context, orderIds.race),
      ]);
      expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
      const rejected = outcomes.filter(
        (outcome): outcome is PromiseRejectedResult => outcome.status === "rejected",
      );
      expect(rejected).toHaveLength(1);
      expect(rejected[0]?.reason).toMatchObject({ code: "ORDER_LIFECYCLE_CONFLICT" });

      const state = await loadState(orderIds.race);
      expect(state.order.status).toBe("PREPARING");
      expect(state.events).toHaveLength(1);
      expect(state.events[0]?.eventType).toBe("ORDER_PREPARING");
    });

    it("rolls back the lifecycle update when event evidence cannot be appended", async () => {
      const { db } = getDatabaseRuntime();
      await dropInjectedFailureTrigger();
      await sql`
        create function private.p04_r03_fail_lifecycle_event()
        returns trigger
        language plpgsql
        set search_path = pg_catalog
        as $$
        begin
          if new.order_id = '98000000-0000-4000-8000-000000000006'::uuid then
            raise exception 'p04 r03 injected lifecycle evidence failure';
          end if;
          return new;
        end
        $$
      `.execute(db);
      await sql`
        create trigger p04_r03_fail_lifecycle_event
        before insert on foodflow.order_events
        for each row execute function private.p04_r03_fail_lifecycle_event()
      `.execute(db);

      try {
        await expect(
          startPreparingOperationalOrder(context, orderIds.rollback),
        ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_UNAVAILABLE" });

        const state = await loadState(orderIds.rollback);
        expect(state.order).toMatchObject({
          status: "ACCEPTED",
          customerStatus: "CONFIRMED",
          preparingAt: null,
          readyAt: null,
          servedAt: null,
          modifiedByStaff: null,
        });
        expect(state.events).toHaveLength(0);
      } finally {
        await dropInjectedFailureTrigger();
      }
    });
  },
);
