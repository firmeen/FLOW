import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import {
  acceptOperationalOrder,
  rejectOperationalOrder,
} from "@/modules/order-operations/server/order-decision-service";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const actorId = "95000000-0000-4000-8000-000000000001";
const roleId = "95000000-0000-4000-8000-000000000002";
const membershipId = "95000000-0000-4000-8000-000000000003";

const orderIds = {
  manageOnly: "96000000-0000-4000-8000-000000000001",
  ineligible: "96000000-0000-4000-8000-000000000002",
  acceptRace: "96000000-0000-4000-8000-000000000003",
  rejectRace: "96000000-0000-4000-8000-000000000004",
  rollback: "96000000-0000-4000-8000-000000000005",
} as const;

const context = {
  actorId,
  tenantId: fixture.tenants.a,
  branchId: fixture.branches.a1,
  membershipId,
  roleId,
  scope: "BRANCH",
} satisfies AccessContext;

function orderFixture(id: string, orderNumber: string) {
  return {
    id,
    tenant_id: fixture.tenants.a,
    restaurant_id: "00000000-0000-0000-0000-0000000000a2",
    branch_id: fixture.branches.a1,
    table_id: "00000000-0000-0000-0000-0000000000a5",
    table_session_id: null,
    order_number: orderNumber,
    status: "PENDING_CONFIRMATION",
    customer_status: "SENT",
    subtotal_minor: "10000",
    currency: "THB",
    customer_note: null,
    submission_key: `p04-r02-hardening-${id}`,
    submitted_at: new Date("2040-02-02T00:00:00Z"),
    accepted_at: null,
    preparing_at: null,
    ready_at: null,
    served_at: null,
    paid_at: null,
    closed_at: null,
    rejected_at: null,
    rejection_reason: null,
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
      "rejected_at as rejectedAt",
      "rejection_reason as rejectionReason",
      "modified_by_staff as modifiedByStaff",
    ])
    .where("id", "=", orderId)
    .executeTakeFirstOrThrow();
  const events = await db
    .selectFrom("foodflow.order_events")
    .select(["event_type as eventType", "actor_id as actorId", "reason"])
    .where("order_id", "=", orderId)
    .execute();
  return { order, events };
}

function expectOneConflict(outcomes: readonly PromiseSettledResult<unknown>[]) {
  const fulfilled = outcomes.filter((outcome) => outcome.status === "fulfilled");
  const rejected = outcomes.filter((outcome) => outcome.status === "rejected");

  expect(fulfilled).toHaveLength(1);
  expect(rejected).toHaveLength(1);
  expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
    code: "ORDER_DECISION_CONFLICT",
  });
}

async function dropInjectedFailureTrigger() {
  const { db } = getDatabaseRuntime();
  await sql`drop trigger if exists p04_r02_fail_decision_event on foodflow.order_events`.execute(
    db,
  );
  await sql`drop function if exists private.p04_r02_fail_decision_event()`.execute(db);
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R02 operational order decision hardening",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();

      await db
        .insertInto("app.users")
        .values({
          id: actorId,
          email: "p04-r02-manage-only@flow.test",
          display_name: "P04 R02 Manage Only",
          status: "ACTIVE",
        })
        .execute();
      await db
        .insertInto("app.roles")
        .values({
          id: roleId,
          tenant_id: fixture.tenants.a,
          code: "P04_R02_MANAGE_ONLY",
          name: "P04 R02 Manage Only",
          system: false,
        })
        .execute();

      const orderManage = await db
        .selectFrom("app.permissions")
        .select("id")
        .where("code", "=", PERMISSIONS.orderManage)
        .executeTakeFirstOrThrow();
      await db
        .insertInto("app.role_permissions")
        .values({ role_id: roleId, permission_id: orderManage.id })
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
          orderFixture(orderIds.manageOnly, "P04-R02-MANAGE-ONLY"),
          orderFixture(orderIds.ineligible, "P04-R02-INELIGIBLE"),
          orderFixture(orderIds.acceptRace, "P04-R02-ACCEPT-RACE"),
          orderFixture(orderIds.rejectRace, "P04-R02-REJECT-RACE"),
          orderFixture(orderIds.rollback, "P04-R02-ROLLBACK"),
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

    it("uses order.manage as the command authority independently of the staff route shell", async () => {
      const result = await acceptOperationalOrder(context, orderIds.manageOnly);
      const state = await loadState(orderIds.manageOnly);

      expect(result).toMatchObject({
        orderId: orderIds.manageOnly,
        decision: "ACCEPT",
        status: "ACCEPTED",
        customerStatus: "CONFIRMED",
      });
      expect(state.order.modifiedByStaff).toBe(actorId);
      expect(state.events).toHaveLength(1);
    });

    it("fails closed for every non-pending persisted operational status", async () => {
      const { db } = getDatabaseRuntime();
      const ineligibleStatuses = [
        "ACCEPTED",
        "REJECTED",
        "PREPARING",
        "READY",
        "SERVED",
        "PAYMENT_PENDING",
        "PAID",
        "CLOSED",
        "CANCELLED",
        "CHANGED",
        "REMAKE",
        "VOIDED",
      ] as const;

      for (const status of ineligibleStatuses) {
        await db
          .updateTable("foodflow.orders")
          .set({
            status,
            accepted_at: null,
            rejected_at: null,
            rejection_reason: null,
            modified_by_staff: null,
          })
          .where("id", "=", orderIds.ineligible)
          .execute();

        await expect(
          acceptOperationalOrder(context, orderIds.ineligible),
        ).rejects.toMatchObject({ code: "ORDER_DECISION_CONFLICT" });
        await expect(
          rejectOperationalOrder(context, orderIds.ineligible, "INVALID_ORDER"),
        ).rejects.toMatchObject({ code: "ORDER_DECISION_CONFLICT" });
      }

      const state = await loadState(orderIds.ineligible);
      expect(state.events).toHaveLength(0);
      expect(state.order.modifiedByStaff).toBeNull();
    });

    it("allows exactly one acceptance on concurrent same-action retries", async () => {
      const outcomes = await Promise.allSettled([
        acceptOperationalOrder(context, orderIds.acceptRace),
        acceptOperationalOrder(context, orderIds.acceptRace),
      ]);
      expectOneConflict(outcomes);

      const state = await loadState(orderIds.acceptRace);
      expect(state.order.status).toBe("ACCEPTED");
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toMatchObject({
        eventType: "ORDER_ACCEPTED",
        actorId,
        reason: null,
      });
    });

    it("allows exactly one rejection on concurrent same-action retries", async () => {
      const outcomes = await Promise.allSettled([
        rejectOperationalOrder(context, orderIds.rejectRace, "STORE_CLOSING"),
        rejectOperationalOrder(context, orderIds.rejectRace, "STORE_CLOSING"),
      ]);
      expectOneConflict(outcomes);

      const state = await loadState(orderIds.rejectRace);
      expect(state.order.status).toBe("REJECTED");
      expect(state.order.rejectionReason).toBe("STORE_CLOSING");
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toMatchObject({
        eventType: "ORDER_REJECTED",
        actorId,
        reason: "STORE_CLOSING",
      });
    });

    it("rolls back the order update when durable decision evidence cannot be appended", async () => {
      const { db } = getDatabaseRuntime();
      await dropInjectedFailureTrigger();
      await sql`
        create function private.p04_r02_fail_decision_event()
        returns trigger
        language plpgsql
        set search_path = pg_catalog
        as $$
        begin
          if new.order_id = '96000000-0000-4000-8000-000000000005'::uuid then
            raise exception 'p04 r02 injected decision evidence failure';
          end if;
          return new;
        end
        $$
      `.execute(db);
      await sql`
        create trigger p04_r02_fail_decision_event
        before insert on foodflow.order_events
        for each row execute function private.p04_r02_fail_decision_event()
      `.execute(db);

      try {
        await expect(
          acceptOperationalOrder(context, orderIds.rollback),
        ).rejects.toMatchObject({ code: "ORDER_DECISION_UNAVAILABLE" });

        const state = await loadState(orderIds.rollback);
        expect(state.order).toMatchObject({
          status: "PENDING_CONFIRMATION",
          customerStatus: "SENT",
          acceptedAt: null,
          rejectedAt: null,
          rejectionReason: null,
          modifiedByStaff: null,
        });
        expect(state.events).toHaveLength(0);
      } finally {
        await dropInjectedFailureTrigger();
      }
    });
  },
);
