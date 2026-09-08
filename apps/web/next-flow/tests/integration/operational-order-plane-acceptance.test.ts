import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import { acceptOperationalOrder, decideOperationalOrder } from "@/modules/order-operations/server/order-decision-service";
import { amendOperationalOrder, cancelOperationalOrder } from "@/modules/order-operations/server/order-exception-service";
import {
  markOperationalOrderReady,
  markOperationalOrderServed,
  startPreparingOperationalOrder,
} from "@/modules/order-operations/server/order-lifecycle-service";
import { executeOperationalOrderProductionControl } from "@/modules/order-operations/server/order-production-control-service";
import {
  getOperationalOrderDetail,
  listOperationalOrderQueue,
  parseOperationalOrderQueueSearchParams,
} from "@/modules/order-operations/server/order-queue-service";
import { destroyDatabaseRuntimeForTests, getDatabaseRuntime } from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const ACTOR_ID = "c2000000-0000-4000-8000-000000000001";
const ROLE_ID = "c2000000-0000-4000-8000-000000000002";
const MEMBERSHIP_ID = "c2000000-0000-4000-8000-000000000003";
const A_RESTAURANT = "00000000-0000-0000-0000-0000000000a2";
const B_RESTAURANT = "00000000-0000-0000-0000-0000000000b2";
const A1_TABLE = "00000000-0000-0000-0000-0000000000a5";
const A2_TABLE = "00000000-0000-0000-0000-0000000000ad";
const B1_TABLE = "00000000-0000-0000-0000-0000000000b5";

const orderIds = {
  normal: "c6000000-0000-4000-8000-000000000001",
  amend: "c6000000-0000-4000-8000-000000000002",
  production: "c6000000-0000-4000-8000-000000000003",
  cancel: "c6000000-0000-4000-8000-000000000004",
  remake: "c6000000-0000-4000-8000-000000000005",
  viewOnly: "c6000000-0000-4000-8000-000000000006",
  sibling: "c6000000-0000-4000-8000-000000000007",
  otherTenant: "c6000000-0000-4000-8000-000000000008",
  qUrgentActive: "c6000000-0000-4000-8000-000000000011",
  qNormalActive: "c6000000-0000-4000-8000-000000000012",
  qUrgentDeferred: "c6000000-0000-4000-8000-000000000013",
  qNormalDeferred: "c6000000-0000-4000-8000-000000000014",
  raceAcceptCancel: "c6000000-0000-4000-8000-000000000021",
  raceDeferLifecycle: "c6000000-0000-4000-8000-000000000022",
  raceRemakeServe: "c6000000-0000-4000-8000-000000000023",
  rollbackDecision: "c6000000-0000-4000-8000-000000000031",
  rollbackControl: "c6000000-0000-4000-8000-000000000032",
} as const;

const itemIds = {
  normal: "c7000000-0000-4000-8000-000000000001",
  amendOne: "c7000000-0000-4000-8000-000000000002",
  amendTwo: "c7000000-0000-4000-8000-000000000003",
} as const;
const MODIFIER_ID = "c8000000-0000-4000-8000-000000000001";

const managerContext = {
  actorId: ACTOR_ID,
  tenantId: fixture.tenants.a,
  branchId: fixture.branches.a1,
  membershipId: MEMBERSHIP_ID,
  roleId: ROLE_ID,
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

function filter(query: string) {
  return parseOperationalOrderQueueSearchParams(new URLSearchParams(query));
}

function customerStatus(status: string) {
  if (status === "ACCEPTED") return "CONFIRMED";
  if (status === "PREPARING") return "PREPARING";
  if (status === "READY") return "COMING_TO_TABLE";
  if (status === "SERVED") return "SERVED";
  return "SENT";
}

function order(input: {
  id: string;
  number: string;
  status?: "PENDING_CONFIRMATION" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED";
  tenantId?: string;
  restaurantId?: string;
  branchId?: string;
  tableId?: string;
  submittedAt?: string;
  subtotal?: string;
  note?: string | null;
}) {
  const status = input.status ?? "PENDING_CONFIRMATION";
  const progressed = ["ACCEPTED", "PREPARING", "READY", "SERVED"].includes(status);
  return {
    id: input.id,
    tenant_id: input.tenantId ?? fixture.tenants.a,
    restaurant_id: input.restaurantId ?? A_RESTAURANT,
    branch_id: input.branchId ?? fixture.branches.a1,
    table_id: input.tableId ?? A1_TABLE,
    table_session_id: null,
    order_number: input.number,
    status,
    customer_status: customerStatus(status),
    subtotal_minor: input.subtotal ?? "0",
    currency: "THB",
    customer_note: input.note ?? null,
    submission_key: `p04-r06-${input.id}`,
    submitted_at: new Date(input.submittedAt ?? "2040-06-01T00:00:00Z"),
    accepted_at: progressed ? new Date("2040-06-01T00:00:01Z") : null,
    preparing_at: ["PREPARING", "READY", "SERVED"].includes(status)
      ? new Date("2040-06-01T00:00:02Z")
      : null,
    ready_at: ["READY", "SERVED"].includes(status) ? new Date("2040-06-01T00:00:03Z") : null,
    served_at: status === "SERVED" ? new Date("2040-06-01T00:00:04Z") : null,
    paid_at: null,
    closed_at: null,
    rejected_at: null,
    rejection_reason: null,
    modified_by_staff: null,
    source_cart_id: null,
    customer_capability_id: null,
  } as const;
}

async function state(orderId: string) {
  const { db } = getDatabaseRuntime();
  const aggregate = await db
    .selectFrom("foodflow.orders")
    .select([
      "status",
      "customer_status as customerStatus",
      "subtotal_minor as subtotalMinor",
      "priority_code as priorityCode",
      "priority_reason as priorityReason",
      "prioritized_at as prioritizedAt",
      "defer_reason as deferReason",
      "deferred_at as deferredAt",
      "deferred_until as deferredUntil",
      "remake_count as remakeCount",
      "last_remake_reason as lastRemakeReason",
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
  return { aggregate, events };
}

function oneWinner(outcomes: readonly PromiseSettledResult<unknown>[]) {
  expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
  expect(outcomes.filter((outcome) => outcome.status === "rejected")).toHaveLength(1);
}

async function dropFailureTrigger() {
  const { db } = getDatabaseRuntime();
  await sql`drop trigger if exists p04_r06_fail_event on foodflow.order_events`.execute(db);
  await sql`drop function if exists private.p04_r06_fail_event()`.execute(db);
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R06 integrated operational order-plane acceptance",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();
      await db.insertInto("app.users").values({
        id: ACTOR_ID,
        email: "p04-r06-order-manager@flow.test",
        display_name: "P04 R06 Order Manager",
        status: "ACTIVE",
      }).execute();
      await db.insertInto("app.roles").values({
        id: ROLE_ID,
        tenant_id: fixture.tenants.a,
        code: "P04_R06_ORDER_MANAGER",
        name: "P04 R06 Order Manager",
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
        permissions.map((permission) => ({ role_id: ROLE_ID, permission_id: permission.id })),
      ).execute();
      await db.insertInto("app.memberships").values({
        id: MEMBERSHIP_ID,
        tenant_id: fixture.tenants.a,
        user_id: ACTOR_ID,
        role_id: ROLE_ID,
        branch_id: fixture.branches.a1,
        status: "ACTIVE",
      }).execute();

      await db.insertInto("foodflow.orders").values([
        order({ id: orderIds.normal, number: "P04-R06-NORMAL", subtotal: "10000", note: "durable note" }),
        order({ id: orderIds.amend, number: "P04-R06-AMEND", status: "ACCEPTED", subtotal: "20500", note: "old note" }),
        order({ id: orderIds.production, number: "P04-R06-PRODUCTION", status: "ACCEPTED" }),
        order({ id: orderIds.cancel, number: "P04-R06-CANCEL", status: "ACCEPTED" }),
        order({ id: orderIds.remake, number: "P04-R06-REMAKE", status: "READY" }),
        order({ id: orderIds.viewOnly, number: "P04-R06-VIEW-ONLY", status: "ACCEPTED" }),
        order({ id: orderIds.sibling, number: "P04-R06-A2", branchId: fixture.branches.a2, tableId: A2_TABLE }),
        order({
          id: orderIds.otherTenant,
          number: "P04-R06-B1",
          tenantId: fixture.tenants.b,
          restaurantId: B_RESTAURANT,
          branchId: fixture.branches.b1,
          tableId: B1_TABLE,
        }),
        order({ id: orderIds.qUrgentActive, number: "P04-R06-Q-UA", status: "ACCEPTED", submittedAt: "2042-06-01T00:00:00Z" }),
        order({ id: orderIds.qNormalActive, number: "P04-R06-Q-NA", status: "ACCEPTED", submittedAt: "2042-06-01T00:00:00Z" }),
        order({ id: orderIds.qUrgentDeferred, number: "P04-R06-Q-UD", status: "ACCEPTED", submittedAt: "2042-06-01T00:00:00Z" }),
        order({ id: orderIds.qNormalDeferred, number: "P04-R06-Q-ND", status: "ACCEPTED", submittedAt: "2042-06-01T00:00:00Z" }),
        order({ id: orderIds.raceAcceptCancel, number: "P04-R06-RACE-DECISION" }),
        order({ id: orderIds.raceDeferLifecycle, number: "P04-R06-RACE-DEFER", status: "ACCEPTED" }),
        order({ id: orderIds.raceRemakeServe, number: "P04-R06-RACE-REMAKE", status: "READY" }),
        order({ id: orderIds.rollbackDecision, number: "P04-R06-ROLLBACK-DECISION" }),
        order({ id: orderIds.rollbackControl, number: "P04-R06-ROLLBACK-CONTROL", status: "ACCEPTED" }),
      ]).execute();

      await db.insertInto("foodflow.order_items").values([
        {
          id: itemIds.normal,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.normal,
          menu_item_id: null,
          menu_item_name: "R06 Durable Item",
          menu_item_thai_name: "รายการทดสอบ R06",
          quantity: 1,
          unit_price_minor: "10000",
          line_total_minor: "10000",
          special_request: "plain text only",
          preparation_station: "KITCHEN",
        },
        {
          id: itemIds.amendOne,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.amend,
          menu_item_id: null,
          menu_item_name: "R06 Snapshot One",
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
          menu_item_name: "R06 Snapshot Two",
          menu_item_thai_name: null,
          quantity: 2,
          unit_price_minor: "5000",
          line_total_minor: "10000",
          special_request: "old request",
          preparation_station: "BAR",
        },
      ]).execute();
      await db.insertInto("foodflow.order_item_modifiers").values({
        id: MODIFIER_ID,
        tenant_id: fixture.tenants.a,
        order_item_id: itemIds.amendOne,
        modifier_group_id: null,
        modifier_group_name: "R06 Snapshot Add-on",
        modifier_choice_id: null,
        modifier_choice_name: "Extra",
        price_delta_minor: "500",
      }).execute();
    });

    afterAll(async () => {
      const { db } = getDatabaseRuntime();
      await dropFailureTrigger();
      await db.deleteFrom("foodflow.order_events").where("order_id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("foodflow.order_item_modifiers").where("id", "=", MODIFIER_ID).execute();
      await db.deleteFrom("foodflow.order_items").where("order_id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("foodflow.orders").where("id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("app.memberships").where("id", "=", MEMBERSHIP_ID).execute();
      await db.deleteFrom("app.role_permissions").where("role_id", "=", ROLE_ID).execute();
      await db.deleteFrom("app.roles").where("id", "=", ROLE_ID).execute();
      await db.deleteFrom("app.users").where("id", "=", ACTOR_ID).execute();
      await destroyDatabaseRuntimeForTests();
    });

    it("proves durable branch-scoped queue/detail and PENDING -> ACCEPTED -> PREPARING -> READY -> SERVED", async () => {
      const page = await listOperationalOrderQueue(
        managerContext,
        filter("status=PENDING_CONFIRMATION&submittedAfter=2040-05-31T00%3A00%3A00Z&submittedBefore=2040-06-02T00%3A00%3A00Z&limit=50"),
      );
      expect(page.orders.map((value) => value.id)).toContain(orderIds.normal);
      expect(page.orders.map((value) => value.id)).not.toContain(orderIds.sibling);
      expect(page.orders.map((value) => value.id)).not.toContain(orderIds.otherTenant);

      const initial = await getOperationalOrderDetail(managerContext, orderIds.normal);
      expect(initial).toMatchObject({ status: "PENDING_CONFIRMATION", subtotalMinor: "10000", customerNote: "durable note" });
      expect(initial.items[0]).toMatchObject({ menuItemName: "R06 Durable Item", quantity: 1, unitPriceMinor: "10000" });
      expect(initial).not.toHaveProperty("customerCapabilityId");
      expect(initial).not.toHaveProperty("submissionKey");

      await acceptOperationalOrder(managerContext, orderIds.normal);
      await startPreparingOperationalOrder(managerContext, orderIds.normal);
      await markOperationalOrderReady(managerContext, orderIds.normal);
      await markOperationalOrderServed(managerContext, orderIds.normal);

      const final = await getOperationalOrderDetail(managerContext, orderIds.normal);
      expect(final).toMatchObject({ status: "SERVED", customerStatus: "SERVED", priority: "NORMAL" });
      const persisted = await state(orderIds.normal);
      expect(persisted.aggregate.modifiedByStaff).toBe(ACTOR_ID);
      expect(persisted.events.map((event) => event.eventType)).toEqual([
        "ORDER_ACCEPTED",
        "ORDER_PREPARING",
        "ORDER_READY",
        "ORDER_SERVED",
      ]);
      expect(persisted.events.every((event) => event.actorId === ACTOR_ID)).toBe(true);
    });

    it("proves snapshot-authoritative amendment, CHANGED review gate and lifecycle re-entry", async () => {
      const amended = await amendOperationalOrder(managerContext, orderIds.amend, {
        customerNote: null,
        itemChanges: [
          { itemId: itemIds.amendOne, quantity: 2, specialRequest: "ไม่ใส่หอม" },
          { itemId: itemIds.amendTwo, remove: true },
        ],
      });
      expect(amended).toMatchObject({ status: "CHANGED", subtotalMinor: "21000", changeCategory: "MULTIPLE_FIELDS" });
      await expect(startPreparingOperationalOrder(managerContext, orderIds.amend)).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_CONFLICT" });

      const changed = await getOperationalOrderDetail(managerContext, orderIds.amend);
      expect(changed.items).toHaveLength(1);
      expect(changed.items[0]).toMatchObject({
        id: itemIds.amendOne,
        quantity: 2,
        unitPriceMinor: "10000",
        lineTotalMinor: "21000",
        specialRequest: "ไม่ใส่หอม",
      });
      expect(changed.items[0]?.modifiers[0]).toMatchObject({ priceDeltaMinor: "500" });

      await decideOperationalOrder(managerContext, { orderId: orderIds.amend, decision: "ACCEPT", reasonCode: null });
      await startPreparingOperationalOrder(managerContext, orderIds.amend);
      const persisted = await state(orderIds.amend);
      expect(persisted.aggregate.subtotalMinor).toBe("21000");
      expect(persisted.events.map((event) => event.eventType)).toEqual([
        "ORDER_CHANGED",
        "ORDER_ACCEPTED",
        "ORDER_PREPARING",
      ]);
    });

    it("proves priority/defer/resume composition and terminal cleanup", async () => {
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.production,
        action: "SET_PRIORITY",
        reasonCode: "WAIT_TIME",
      });
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.production,
        action: "DEFER_ORDER",
        reasonCode: "INGREDIENT_WAIT",
        deferredUntil: null,
      });
      await expect(startPreparingOperationalOrder(managerContext, orderIds.production)).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_CONFLICT" });
      await executeOperationalOrderProductionControl(managerContext, { orderId: orderIds.production, action: "RESUME_ORDER" });
      await startPreparingOperationalOrder(managerContext, orderIds.production);
      await markOperationalOrderReady(managerContext, orderIds.production);
      expect(await getOperationalOrderDetail(managerContext, orderIds.production)).toMatchObject({ status: "READY", priority: "URGENT", deferred: false });
      await markOperationalOrderServed(managerContext, orderIds.production);
      expect(await getOperationalOrderDetail(managerContext, orderIds.production)).toMatchObject({ status: "SERVED", priority: "NORMAL", deferred: false });
    });

    it("proves cancellation clears active priority/defer state without deleting historical events", async () => {
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.cancel,
        action: "SET_PRIORITY",
        reasonCode: "CUSTOMER_ESCALATION",
      });
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.cancel,
        action: "DEFER_ORDER",
        reasonCode: "CAPACITY",
        deferredUntil: null,
      });
      await cancelOperationalOrder(managerContext, orderIds.cancel, "CUSTOMER_REQUEST");
      const persisted = await state(orderIds.cancel);
      expect(persisted.aggregate).toMatchObject({
        status: "CANCELLED",
        priorityCode: "NORMAL",
        priorityReason: null,
        deferReason: null,
        deferredAt: null,
        deferredUntil: null,
      });
      expect(persisted.events.map((event) => event.eventType)).toEqual([
        "ORDER_PRIORITY_SET",
        "ORDER_DEFERRED",
        "ORDER_CANCELLED",
      ]);
    });

    it("proves remake is bounded at three and reuses the canonical lifecycle", async () => {
      for (let count = 1; count <= 3; count += 1) {
        const requested = await executeOperationalOrderProductionControl(managerContext, {
          orderId: orderIds.remake,
          action: "REQUEST_REMAKE",
          reasonCode: count === 1 ? "QUALITY_ISSUE" : "CUSTOMER_REQUEST",
        });
        expect(requested).toMatchObject({ status: "REMAKE", remakeCount: count });
        await executeOperationalOrderProductionControl(managerContext, { orderId: orderIds.remake, action: "START_REMAKE" });
        await markOperationalOrderReady(managerContext, orderIds.remake);
        await markOperationalOrderServed(managerContext, orderIds.remake);
      }
      await expect(
        executeOperationalOrderProductionControl(managerContext, {
          orderId: orderIds.remake,
          action: "REQUEST_REMAKE",
          reasonCode: "OTHER",
        }),
      ).rejects.toMatchObject({ code: "ORDER_CONTROL_CONFLICT" });
      const persisted = await state(orderIds.remake);
      expect(persisted.aggregate).toMatchObject({ status: "SERVED", remakeCount: 3, lastRemakeReason: "CUSTOMER_REQUEST" });
      expect(persisted.events.filter((event) => event.eventType === "ORDER_REMAKE_REQUESTED")).toHaveLength(3);
    });

    it("proves production ranking and v2 keyset pagination are deterministic", async () => {
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.qUrgentActive,
        action: "SET_PRIORITY",
        reasonCode: "WAIT_TIME",
      });
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.qUrgentDeferred,
        action: "SET_PRIORITY",
        reasonCode: "WAIT_TIME",
      });
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.qUrgentDeferred,
        action: "DEFER_ORDER",
        reasonCode: "CAPACITY",
        deferredUntil: null,
      });
      await executeOperationalOrderProductionControl(managerContext, {
        orderId: orderIds.qNormalDeferred,
        action: "DEFER_ORDER",
        reasonCode: "CAPACITY",
        deferredUntil: null,
      });

      const query = "status=ACCEPTED&submittedAfter=2042-05-31T00%3A00%3A00Z&submittedBefore=2042-06-02T00%3A00%3A00Z";
      const all = await listOperationalOrderQueue(managerContext, filter(`${query}&limit=50`));
      expect(all.orders.map((value) => value.id)).toEqual([
        orderIds.qUrgentActive,
        orderIds.qNormalActive,
        orderIds.qUrgentDeferred,
        orderIds.qNormalDeferred,
      ]);

      const first = await listOperationalOrderQueue(managerContext, filter(`${query}&limit=2`));
      expect(first.nextCursor).not.toBeNull();
      const second = await listOperationalOrderQueue(
        managerContext,
        filter(`${query}&limit=2&cursor=${encodeURIComponent(first.nextCursor!)}`),
      );
      expect([...first.orders, ...second.orders].map((value) => value.id)).toEqual([
        orderIds.qUrgentActive,
        orderIds.qNormalActive,
        orderIds.qUrgentDeferred,
        orderIds.qNormalDeferred,
      ]);
      expect(second.nextCursor).toBeNull();
    });

    it("proves order.view/order.manage separation, permission freshness and cross-scope denial", async () => {
      await expect(getOperationalOrderDetail(viewOnlyContext, orderIds.viewOnly)).resolves.toMatchObject({ id: orderIds.viewOnly });
      await expect(
        executeOperationalOrderProductionControl(viewOnlyContext, {
          orderId: orderIds.viewOnly,
          action: "SET_PRIORITY",
          reasonCode: "WAIT_TIME",
        }),
      ).rejects.toMatchObject({ code: "ORDER_CONTROL_FORBIDDEN" });

      for (const orderId of [orderIds.sibling, orderIds.otherTenant]) {
        await expect(getOperationalOrderDetail(managerContext, orderId)).rejects.toMatchObject({ code: "ORDER_QUEUE_NOT_FOUND" });
        await expect(
          executeOperationalOrderProductionControl(managerContext, {
            orderId,
            action: "SET_PRIORITY",
            reasonCode: "WAIT_TIME",
          }),
        ).rejects.toMatchObject({ code: "ORDER_CONTROL_NOT_FOUND" });
      }

      const { db } = getDatabaseRuntime();
      await db.updateTable("app.memberships").set({ status: "REVOKED" }).where("id", "=", MEMBERSHIP_ID).execute();
      try {
        await expect(
          executeOperationalOrderProductionControl(managerContext, {
            orderId: orderIds.viewOnly,
            action: "SET_PRIORITY",
            reasonCode: "WAIT_TIME",
          }),
        ).rejects.toMatchObject({ code: "ORDER_CONTROL_FORBIDDEN" });
      } finally {
        await db.updateTable("app.memberships").set({ status: "ACTIVE" }).where("id", "=", MEMBERSHIP_ID).execute();
      }
    });

    it("proves cross-round races have one durable winner", async () => {
      const decision = await Promise.allSettled([
        acceptOperationalOrder(managerContext, orderIds.raceAcceptCancel),
        cancelOperationalOrder(managerContext, orderIds.raceAcceptCancel, "STAFF_REQUEST"),
      ]);
      oneWinner(decision);
      expect((await state(orderIds.raceAcceptCancel)).events).toHaveLength(1);

      const deferLifecycle = await Promise.allSettled([
        executeOperationalOrderProductionControl(managerContext, {
          orderId: orderIds.raceDeferLifecycle,
          action: "DEFER_ORDER",
          reasonCode: "CAPACITY",
          deferredUntil: null,
        }),
        startPreparingOperationalOrder(managerContext, orderIds.raceDeferLifecycle),
      ]);
      oneWinner(deferLifecycle);
      const deferState = await state(orderIds.raceDeferLifecycle);
      expect(
        (deferState.aggregate.status === "ACCEPTED" && deferState.aggregate.deferReason === "CAPACITY") ||
          (deferState.aggregate.status === "PREPARING" && deferState.aggregate.deferReason === null),
      ).toBe(true);
      expect(deferState.events).toHaveLength(1);

      const remakeServe = await Promise.allSettled([
        executeOperationalOrderProductionControl(managerContext, {
          orderId: orderIds.raceRemakeServe,
          action: "REQUEST_REMAKE",
          reasonCode: "QUALITY_ISSUE",
        }),
        markOperationalOrderServed(managerContext, orderIds.raceRemakeServe),
      ]);
      oneWinner(remakeServe);
      expect((await state(orderIds.raceRemakeServe)).events).toHaveLength(1);
    });

    it("proves event failure rolls aggregate mutations back", async () => {
      const { db } = getDatabaseRuntime();
      await dropFailureTrigger();
      await sql`
        create function private.p04_r06_fail_event()
        returns trigger
        language plpgsql
        set search_path = pg_catalog
        as $$
        begin
          if new.order_id in (
            'c6000000-0000-4000-8000-000000000031'::uuid,
            'c6000000-0000-4000-8000-000000000032'::uuid
          ) then
            raise exception 'p04 r06 injected event failure';
          end if;
          return new;
        end
        $$
      `.execute(db);
      await sql`
        create trigger p04_r06_fail_event
        before insert on foodflow.order_events
        for each row execute function private.p04_r06_fail_event()
      `.execute(db);

      try {
        await expect(acceptOperationalOrder(managerContext, orderIds.rollbackDecision)).rejects.toMatchObject({ code: "ORDER_DECISION_UNAVAILABLE" });
        await expect(
          executeOperationalOrderProductionControl(managerContext, {
            orderId: orderIds.rollbackControl,
            action: "SET_PRIORITY",
            reasonCode: "WAIT_TIME",
          }),
        ).rejects.toMatchObject({ code: "ORDER_CONTROL_UNAVAILABLE" });

        const decisionState = await state(orderIds.rollbackDecision);
        expect(decisionState.aggregate).toMatchObject({ status: "PENDING_CONFIRMATION", modifiedByStaff: null });
        expect(decisionState.events).toHaveLength(0);

        const controlState = await state(orderIds.rollbackControl);
        expect(controlState.aggregate).toMatchObject({
          status: "ACCEPTED",
          priorityCode: "NORMAL",
          priorityReason: null,
          prioritizedAt: null,
          modifiedByStaff: null,
        });
        expect(controlState.events).toHaveLength(0);
      } finally {
        await dropFailureTrigger();
      }
    });
  },
);
