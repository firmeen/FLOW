import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import {
  amendOperationalOrder,
  cancelOperationalOrder,
} from "@/modules/order-operations/server/order-exception-service";
import { decideOperationalOrder } from "@/modules/order-operations/server/order-decision-service";
import { startPreparingOperationalOrder } from "@/modules/order-operations/server/order-lifecycle-service";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const actorId = "a2000000-0000-4000-8000-000000000001";
const roleId = "a2000000-0000-4000-8000-000000000002";
const membershipId = "a2000000-0000-4000-8000-000000000003";

const orderIds = {
  amend: "a3000000-0000-4000-8000-000000000001",
  changedReject: "a3000000-0000-4000-8000-000000000002",
  cancelPending: "a3000000-0000-4000-8000-000000000003",
  cancelChanged: "a3000000-0000-4000-8000-000000000004",
  cancelAccepted: "a3000000-0000-4000-8000-000000000005",
  cancelPreparing: "a3000000-0000-4000-8000-000000000006",
  cancelReady: "a3000000-0000-4000-8000-000000000007",
  cancelServed: "a3000000-0000-4000-8000-000000000008",
  viewOnly: "a3000000-0000-4000-8000-000000000009",
  sibling: "a3000000-0000-4000-8000-00000000000a",
  otherTenant: "a3000000-0000-4000-8000-00000000000b",
  revoke: "a3000000-0000-4000-8000-00000000000c",
  permission: "a3000000-0000-4000-8000-00000000000d",
  amendRace: "a3000000-0000-4000-8000-00000000000e",
  cancelRace: "a3000000-0000-4000-8000-00000000000f",
  lifecycleRace: "a3000000-0000-4000-8000-000000000010",
  changedRace: "a3000000-0000-4000-8000-000000000011",
  amendRollback: "a3000000-0000-4000-8000-000000000012",
  cancelRollback: "a3000000-0000-4000-8000-000000000013",
} as const;

const itemIds = {
  amendOne: "a4000000-0000-4000-8000-000000000001",
  amendTwo: "a4000000-0000-4000-8000-000000000002",
  amendRace: "a4000000-0000-4000-8000-000000000003",
  amendRollback: "a4000000-0000-4000-8000-000000000004",
} as const;

const modifierId = "a5000000-0000-4000-8000-000000000001";

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

function customerStatusFor(status: string): string {
  switch (status) {
    case "PENDING_CONFIRMATION":
    case "CHANGED":
      return "SENT";
    case "ACCEPTED":
      return "CONFIRMED";
    case "PREPARING":
      return "PREPARING";
    case "READY":
      return "COMING_TO_TABLE";
    case "SERVED":
      return "SERVED";
    default:
      return "SENT";
  }
}

function orderFixture(input: {
  id: string;
  tenantId?: string;
  branchId?: string;
  restaurantId?: string;
  tableId?: string;
  orderNumber: string;
  status?: string;
  subtotalMinor?: string;
  customerNote?: string | null;
}) {
  const status = input.status ?? "ACCEPTED";
  return {
    id: input.id,
    tenant_id: input.tenantId ?? fixture.tenants.a,
    restaurant_id: input.restaurantId ?? "00000000-0000-0000-0000-0000000000a2",
    branch_id: input.branchId ?? fixture.branches.a1,
    table_id: input.tableId ?? "00000000-0000-0000-0000-0000000000a5",
    table_session_id: null,
    order_number: input.orderNumber,
    status,
    customer_status: customerStatusFor(status),
    subtotal_minor: input.subtotalMinor ?? "10000",
    currency: "THB",
    customer_note: input.customerNote ?? null,
    submission_key: `p04-r04-${input.id}`,
    submitted_at: new Date("2040-04-01T00:00:00Z"),
    accepted_at: status === "ACCEPTED" ? new Date("2040-04-01T00:00:01Z") : null,
    preparing_at: status === "PREPARING" ? new Date("2040-04-01T00:00:02Z") : null,
    ready_at: status === "READY" ? new Date("2040-04-01T00:00:03Z") : null,
    served_at: status === "SERVED" ? new Date("2040-04-01T00:00:04Z") : null,
    paid_at: null,
    closed_at: null,
    rejected_at: null,
    rejection_reason: null,
    modified_by_staff: null,
    source_cart_id: null,
    customer_capability_id: null,
  } as const;
}

async function loadOrderState(orderId: string) {
  const { db } = getDatabaseRuntime();
  const order = await db
    .selectFrom("foodflow.orders")
    .select([
      "status",
      "customer_status as customerStatus",
      "subtotal_minor as subtotalMinor",
      "customer_note as customerNote",
      "accepted_at as acceptedAt",
      "rejected_at as rejectedAt",
      "rejection_reason as rejectionReason",
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
      "reason",
      "occurred_at as occurredAt",
    ])
    .where("order_id", "=", orderId)
    .orderBy("occurred_at", "asc")
    .execute();
  return { order, events };
}

async function dropFailureTrigger() {
  const { db } = getDatabaseRuntime();
  await sql`drop trigger if exists p04_r04_fail_exception_event on foodflow.order_events`.execute(db);
  await sql`drop function if exists private.p04_r04_fail_exception_event()`.execute(db);
}

function expectOneWinner(
  outcomes: readonly PromiseSettledResult<unknown>[],
  allowedConflictCodes: readonly string[],
) {
  const fulfilled = outcomes.filter((outcome) => outcome.status === "fulfilled");
  const rejected = outcomes.filter((outcome) => outcome.status === "rejected") as PromiseRejectedResult[];
  expect(fulfilled).toHaveLength(1);
  expect(rejected).toHaveLength(1);
  expect(allowedConflictCodes).toContain(rejected[0]?.reason?.code);
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R04 controlled order amendment and cancellation",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();

      await db.insertInto("app.users").values({
        id: actorId,
        email: "p04-r04-actor@flow.test",
        display_name: "P04 R04 Actor",
        status: "ACTIVE",
      }).execute();
      await db.insertInto("app.roles").values({
        id: roleId,
        tenant_id: fixture.tenants.a,
        code: "P04_R04_ORDER_MANAGER",
        name: "P04 R04 Order Manager",
        system: false,
      }).execute();

      const permissions = await db
        .selectFrom("app.permissions")
        .select(["id", "code"])
        .where("code", "in", [
          PERMISSIONS.operationsStaffAccess,
          PERMISSIONS.orderView,
          PERMISSIONS.orderManage,
        ])
        .execute();
      expect(permissions).toHaveLength(3);
      await db.insertInto("app.role_permissions").values(
        permissions.map((permission) => ({ role_id: roleId, permission_id: permission.id })),
      ).execute();
      await db.insertInto("app.memberships").values({
        id: membershipId,
        tenant_id: fixture.tenants.a,
        user_id: actorId,
        role_id: roleId,
        branch_id: fixture.branches.a1,
        status: "ACTIVE",
      }).execute();

      await db.insertInto("foodflow.orders").values([
        orderFixture({ id: orderIds.amend, orderNumber: "P04-R04-AMEND", subtotalMinor: "20500", customerNote: "old note" }),
        orderFixture({ id: orderIds.changedReject, orderNumber: "P04-R04-CHANGED-REJECT", status: "CHANGED" }),
        orderFixture({ id: orderIds.cancelPending, orderNumber: "P04-R04-CANCEL-PENDING", status: "PENDING_CONFIRMATION" }),
        orderFixture({ id: orderIds.cancelChanged, orderNumber: "P04-R04-CANCEL-CHANGED", status: "CHANGED" }),
        orderFixture({ id: orderIds.cancelAccepted, orderNumber: "P04-R04-CANCEL-ACCEPTED" }),
        orderFixture({ id: orderIds.cancelPreparing, orderNumber: "P04-R04-CANCEL-PREPARING", status: "PREPARING" }),
        orderFixture({ id: orderIds.cancelReady, orderNumber: "P04-R04-CANCEL-READY", status: "READY" }),
        orderFixture({ id: orderIds.cancelServed, orderNumber: "P04-R04-CANCEL-SERVED", status: "SERVED" }),
        orderFixture({ id: orderIds.viewOnly, orderNumber: "P04-R04-VIEW-ONLY" }),
        orderFixture({
          id: orderIds.sibling,
          orderNumber: "P04-R04-A2",
          branchId: fixture.branches.a2,
          tableId: "00000000-0000-0000-0000-0000000000ad",
        }),
        orderFixture({
          id: orderIds.otherTenant,
          orderNumber: "P04-R04-B1",
          tenantId: fixture.tenants.b,
          branchId: fixture.branches.b1,
          restaurantId: "00000000-0000-0000-0000-0000000000b2",
          tableId: "00000000-0000-0000-0000-0000000000b5",
        }),
        orderFixture({ id: orderIds.revoke, orderNumber: "P04-R04-REVOKE" }),
        orderFixture({ id: orderIds.permission, orderNumber: "P04-R04-PERMISSION" }),
        orderFixture({ id: orderIds.amendRace, orderNumber: "P04-R04-AMEND-RACE", subtotalMinor: "10000" }),
        orderFixture({ id: orderIds.cancelRace, orderNumber: "P04-R04-CANCEL-RACE" }),
        orderFixture({ id: orderIds.lifecycleRace, orderNumber: "P04-R04-LIFECYCLE-RACE" }),
        orderFixture({ id: orderIds.changedRace, orderNumber: "P04-R04-CHANGED-RACE", status: "CHANGED" }),
        orderFixture({ id: orderIds.amendRollback, orderNumber: "P04-R04-AMEND-ROLLBACK", subtotalMinor: "10000" }),
        orderFixture({ id: orderIds.cancelRollback, orderNumber: "P04-R04-CANCEL-ROLLBACK" }),
      ]).execute();

      await db.insertInto("foodflow.order_items").values([
        {
          id: itemIds.amendOne,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.amend,
          menu_item_id: null,
          menu_item_name: "Snapshot One",
          menu_item_thai_name: null,
          quantity: 1,
          unit_price_minor: "10000",
          line_total_minor: "10500",
          special_request: null,
          preparation_station: "KITCHEN",
        },
        {
          id: itemIds.amendTwo,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.amend,
          menu_item_id: null,
          menu_item_name: "Snapshot Two",
          menu_item_thai_name: null,
          quantity: 2,
          unit_price_minor: "5000",
          line_total_minor: "10000",
          special_request: "old request",
          preparation_station: "BAR",
        },
        {
          id: itemIds.amendRace,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.amendRace,
          menu_item_id: null,
          menu_item_name: "Race Snapshot",
          menu_item_thai_name: null,
          quantity: 1,
          unit_price_minor: "10000",
          line_total_minor: "10000",
          special_request: null,
          preparation_station: "KITCHEN",
        },
        {
          id: itemIds.amendRollback,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.amendRollback,
          menu_item_id: null,
          menu_item_name: "Rollback Snapshot",
          menu_item_thai_name: null,
          quantity: 1,
          unit_price_minor: "10000",
          line_total_minor: "10000",
          special_request: null,
          preparation_station: "KITCHEN",
        },
      ]).execute();

      await db.insertInto("foodflow.order_item_modifiers").values({
        id: modifierId,
        tenant_id: fixture.tenants.a,
        order_item_id: itemIds.amendOne,
        modifier_group_id: null,
        modifier_group_name: "Snapshot Add-on",
        modifier_choice_id: null,
        modifier_choice_name: "Extra",
        price_delta_minor: "500",
      }).execute();
    });

    afterAll(async () => {
      const { db } = getDatabaseRuntime();
      await dropFailureTrigger();
      await db.deleteFrom("foodflow.order_events").where("order_id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("foodflow.order_item_modifiers").where("id", "=", modifierId).execute();
      await db.deleteFrom("foodflow.order_items").where("order_id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("foodflow.orders").where("id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("app.memberships").where("id", "=", membershipId).execute();
      await db.deleteFrom("app.role_permissions").where("role_id", "=", roleId).execute();
      await db.deleteFrom("app.roles").where("id", "=", roleId).execute();
      await db.deleteFrom("app.users").where("id", "=", actorId).execute();
      await destroyDatabaseRuntimeForTests();
    });

    it("amends only persisted ACCEPTED snapshots, recalculates money, and requires CHANGED re-review", async () => {
      const result = await amendOperationalOrder(context, orderIds.amend, {
        customerNote: null,
        itemChanges: [
          { itemId: itemIds.amendOne, quantity: 2, specialRequest: "no onion" },
          { itemId: itemIds.amendTwo, remove: true },
        ],
      });

      expect(result).toMatchObject({
        orderId: orderIds.amend,
        status: "CHANGED",
        customerStatus: "SENT",
        subtotalMinor: "21000",
        currency: "THB",
        changeCategory: "MULTIPLE_FIELDS",
      });

      const { db } = getDatabaseRuntime();
      const state = await loadOrderState(orderIds.amend);
      const items = await db
        .selectFrom("foodflow.order_items")
        .select(["id", "quantity", "line_total_minor as lineTotalMinor", "special_request as specialRequest", "unit_price_minor as unitPriceMinor"])
        .where("order_id", "=", orderIds.amend)
        .execute();
      const modifiers = await db
        .selectFrom("foodflow.order_item_modifiers")
        .select(["order_item_id as orderItemId", "price_delta_minor as priceDeltaMinor"])
        .where("tenant_id", "=", fixture.tenants.a)
        .where("order_item_id", "in", [itemIds.amendOne, itemIds.amendTwo])
        .execute();

      expect(state.order).toMatchObject({
        status: "CHANGED",
        customerStatus: "SENT",
        subtotalMinor: "21000",
        customerNote: null,
        modifiedByStaff: actorId,
      });
      expect(items).toEqual([
        expect.objectContaining({
          id: itemIds.amendOne,
          quantity: 2,
          lineTotalMinor: "21000",
          specialRequest: "no onion",
          unitPriceMinor: "10000",
        }),
      ]);
      expect(modifiers).toEqual([
        expect.objectContaining({ orderItemId: itemIds.amendOne, priceDeltaMinor: "500" }),
      ]);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toMatchObject({
        eventType: "ORDER_CHANGED",
        fromStatus: "ACCEPTED",
        toStatus: "CHANGED",
        actorId,
        reason: "MULTIPLE_FIELDS",
      });
      expect(state.events[0]?.occurredAt).toBeInstanceOf(Date);

      await expect(startPreparingOperationalOrder(context, orderIds.amend)).rejects.toMatchObject({
        code: "ORDER_LIFECYCLE_CONFLICT",
      });

      const reviewed = await decideOperationalOrder(context, {
        orderId: orderIds.amend,
        decision: "ACCEPT",
        reasonCode: null,
      });
      expect(reviewed).toMatchObject({ fromStatus: "CHANGED", status: "ACCEPTED" });
      const afterReview = await loadOrderState(orderIds.amend);
      expect(afterReview.events.at(-1)).toMatchObject({
        eventType: "ORDER_ACCEPTED",
        fromStatus: "CHANGED",
        toStatus: "ACCEPTED",
        actorId,
      });
      expect(afterReview.order.acceptedAt).toBeInstanceOf(Date);
    });

    it("supports explicit CHANGED rejection without inventing a new decision target", async () => {
      const result = await decideOperationalOrder(context, {
        orderId: orderIds.changedReject,
        decision: "REJECT",
        reasonCode: "ITEM_UNAVAILABLE",
      });
      expect(result).toMatchObject({
        fromStatus: "CHANGED",
        status: "REJECTED",
        customerStatus: "REJECTED",
        reasonCode: "ITEM_UNAVAILABLE",
      });
      const state = await loadOrderState(orderIds.changedReject);
      expect(state.order.rejectionReason).toBe("ITEM_UNAVAILABLE");
      expect(state.events[0]).toMatchObject({
        eventType: "ORDER_REJECTED",
        fromStatus: "CHANGED",
        toStatus: "REJECTED",
      });
    });

    it("cancels exactly the five R04 eligible source states with durable reason evidence", async () => {
      const cases = [
        [orderIds.cancelPending, "PENDING_CONFIRMATION"],
        [orderIds.cancelChanged, "CHANGED"],
        [orderIds.cancelAccepted, "ACCEPTED"],
        [orderIds.cancelPreparing, "PREPARING"],
        [orderIds.cancelReady, "READY"],
      ] as const;

      for (const [orderId, fromStatus] of cases) {
        const result = await cancelOperationalOrder(context, orderId, "CUSTOMER_REQUEST");
        expect(result).toMatchObject({
          fromStatus,
          status: "CANCELLED",
          customerStatus: "CANCELLED",
          reasonCode: "CUSTOMER_REQUEST",
        });
        const state = await loadOrderState(orderId);
        expect(state.order).toMatchObject({
          status: "CANCELLED",
          customerStatus: "CANCELLED",
          modifiedByStaff: actorId,
        });
        expect(state.events).toHaveLength(1);
        expect(state.events[0]).toMatchObject({
          eventType: "ORDER_CANCELLED",
          fromStatus,
          toStatus: "CANCELLED",
          actorId,
          reason: "CUSTOMER_REQUEST",
        });
        expect(state.events[0]?.occurredAt).toBeInstanceOf(Date);
      }

      await expect(
        cancelOperationalOrder(context, orderIds.cancelServed, "OTHER"),
      ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_CONFLICT" });
      expect((await loadOrderState(orderIds.cancelServed)).events).toHaveLength(0);
    });

    it("keeps order.view separate from order.manage and hides sibling/cross-tenant selectors", async () => {
      await expect(
        cancelOperationalOrder(viewOnlyContext, orderIds.viewOnly, "STAFF_REQUEST"),
      ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_FORBIDDEN" });

      for (const orderId of [orderIds.sibling, orderIds.otherTenant]) {
        await expect(
          cancelOperationalOrder(context, orderId, "STAFF_REQUEST"),
        ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_NOT_FOUND" });
      }
    });

    it("re-evaluates membership and permission authority on the next exception command", async () => {
      const { db } = getDatabaseRuntime();
      await db.updateTable("app.memberships").set({ status: "REVOKED" }).where("id", "=", membershipId).execute();
      await expect(
        cancelOperationalOrder(context, orderIds.revoke, "STAFF_REQUEST"),
      ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_FORBIDDEN" });
      await db.updateTable("app.memberships").set({ status: "ACTIVE" }).where("id", "=", membershipId).execute();

      const managePermission = await db
        .selectFrom("app.permissions")
        .select("id")
        .where("code", "=", PERMISSIONS.orderManage)
        .executeTakeFirstOrThrow();
      await db.deleteFrom("app.role_permissions")
        .where("role_id", "=", roleId)
        .where("permission_id", "=", managePermission.id)
        .execute();
      await expect(
        cancelOperationalOrder(context, orderIds.permission, "STAFF_REQUEST"),
      ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_FORBIDDEN" });
      await db.insertInto("app.role_permissions").values({
        role_id: roleId,
        permission_id: managePermission.id,
      }).execute();
    });

    it("allows exactly one amendment winner and leaves no duplicate evidence", async () => {
      const outcomes = await Promise.allSettled([
        amendOperationalOrder(context, orderIds.amendRace, {
          itemChanges: [{ itemId: itemIds.amendRace, quantity: 2 }],
        }),
        amendOperationalOrder(context, orderIds.amendRace, {
          itemChanges: [{ itemId: itemIds.amendRace, specialRequest: "second editor" }],
        }),
      ]);
      expectOneWinner(outcomes, ["ORDER_EXCEPTION_CONFLICT"]);
      const state = await loadOrderState(orderIds.amendRace);
      expect(state.order.status).toBe("CHANGED");
      expect(state.events.filter((event) => event.eventType === "ORDER_CHANGED")).toHaveLength(1);
    });

    it("allows exactly one cancellation winner", async () => {
      const outcomes = await Promise.allSettled([
        cancelOperationalOrder(context, orderIds.cancelRace, "STAFF_REQUEST"),
        cancelOperationalOrder(context, orderIds.cancelRace, "CUSTOMER_REQUEST"),
      ]);
      expectOneWinner(outcomes, ["ORDER_EXCEPTION_CONFLICT"]);
      const state = await loadOrderState(orderIds.cancelRace);
      expect(state.order.status).toBe("CANCELLED");
      expect(state.events.filter((event) => event.eventType === "ORDER_CANCELLED")).toHaveLength(1);
    });

    it("makes cancellation compete with the exact R03 source transition", async () => {
      const outcomes = await Promise.allSettled([
        cancelOperationalOrder(context, orderIds.lifecycleRace, "STAFF_REQUEST"),
        startPreparingOperationalOrder(context, orderIds.lifecycleRace),
      ]);
      expectOneWinner(outcomes, ["ORDER_EXCEPTION_CONFLICT", "ORDER_LIFECYCLE_CONFLICT"]);
      const state = await loadOrderState(orderIds.lifecycleRace);
      expect(["CANCELLED", "PREPARING"]).toContain(state.order.status);
      expect(state.events).toHaveLength(1);
    });

    it("makes CHANGED re-decision compete with cancellation without last-write-wins", async () => {
      const outcomes = await Promise.allSettled([
        decideOperationalOrder(context, {
          orderId: orderIds.changedRace,
          decision: "ACCEPT",
          reasonCode: null,
        }),
        cancelOperationalOrder(context, orderIds.changedRace, "STAFF_REQUEST"),
      ]);
      expectOneWinner(outcomes, ["ORDER_EXCEPTION_CONFLICT", "ORDER_DECISION_CONFLICT"]);
      const state = await loadOrderState(orderIds.changedRace);
      expect(["ACCEPTED", "CANCELLED"]).toContain(state.order.status);
      expect(state.events).toHaveLength(1);
    });

    it("rolls amendment and cancellation aggregates back when event evidence cannot persist", async () => {
      const { db } = getDatabaseRuntime();
      await dropFailureTrigger();
      await sql`
        create function private.p04_r04_fail_exception_event()
        returns trigger
        language plpgsql
        set search_path = pg_catalog
        as $$
        begin
          if new.order_id in (
            'a3000000-0000-4000-8000-000000000012'::uuid,
            'a3000000-0000-4000-8000-000000000013'::uuid
          ) and new.event_type in ('ORDER_CHANGED', 'ORDER_CANCELLED') then
            raise exception 'p04 r04 injected exception evidence failure';
          end if;
          return new;
        end
        $$
      `.execute(db);
      await sql`
        create trigger p04_r04_fail_exception_event
        before insert on foodflow.order_events
        for each row execute function private.p04_r04_fail_exception_event()
      `.execute(db);

      try {
        await expect(
          amendOperationalOrder(context, orderIds.amendRollback, {
            itemChanges: [{ itemId: itemIds.amendRollback, quantity: 3 }],
          }),
        ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_UNAVAILABLE" });
        const amendState = await loadOrderState(orderIds.amendRollback);
        const amendItem = await db
          .selectFrom("foodflow.order_items")
          .select(["quantity", "line_total_minor as lineTotalMinor"])
          .where("id", "=", itemIds.amendRollback)
          .executeTakeFirstOrThrow();
        expect(amendState.order).toMatchObject({ status: "ACCEPTED", subtotalMinor: "10000" });
        expect(amendItem).toMatchObject({ quantity: 1, lineTotalMinor: "10000" });
        expect(amendState.events).toHaveLength(0);

        await expect(
          cancelOperationalOrder(context, orderIds.cancelRollback, "OPERATIONAL_ERROR"),
        ).rejects.toMatchObject({ code: "ORDER_EXCEPTION_UNAVAILABLE" });
        const cancelState = await loadOrderState(orderIds.cancelRollback);
        expect(cancelState.order).toMatchObject({ status: "ACCEPTED", customerStatus: "CONFIRMED" });
        expect(cancelState.events).toHaveLength(0);
      } finally {
        await dropFailureTrigger();
      }
    });

    it("does not create payment or kitchen side effects", async () => {
      const { db } = getDatabaseRuntime();
      const kitchen = await db
        .selectFrom("foodflow.kitchen_tickets")
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .where("order_id", "in", Object.values(orderIds))
        .executeTakeFirstOrThrow();
      const allocations = await db
        .selectFrom("payments.payment_allocations")
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .where("order_id", "in", Object.values(orderIds))
        .executeTakeFirstOrThrow();
      expect(kitchen.count).toBe("0");
      expect(allocations.count).toBe("0");
    });
  },
);
