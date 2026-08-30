import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import { cancelOperationalOrder } from "@/modules/order-operations/server/order-exception-service";
import {
  markOperationalOrderReady,
  startPreparingOperationalOrder,
} from "@/modules/order-operations/server/order-lifecycle-service";
import {
  executeOperationalOrderProductionControl,
} from "@/modules/order-operations/server/order-production-control-service";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const actorId = "b2000000-0000-4000-8000-000000000001";
const roleId = "b2000000-0000-4000-8000-000000000002";
const membershipId = "b2000000-0000-4000-8000-000000000003";

const orderIds = {
  priority: "b3000000-0000-4000-8000-000000000001",
  defer: "b3000000-0000-4000-8000-000000000002",
  remake: "b3000000-0000-4000-8000-000000000003",
  remakeRace: "b3000000-0000-4000-8000-000000000004",
  viewOnly: "b3000000-0000-4000-8000-000000000005",
  sibling: "b3000000-0000-4000-8000-000000000006",
  cancelDeferred: "b3000000-0000-4000-8000-000000000007",
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
  id: string;
  orderNumber: string;
  status: "ACCEPTED" | "READY";
  branchId?: string;
  tableId?: string;
}) {
  return {
    id: input.id,
    tenant_id: fixture.tenants.a,
    restaurant_id: "00000000-0000-0000-0000-0000000000a2",
    branch_id: input.branchId ?? fixture.branches.a1,
    table_id: input.tableId ?? "00000000-0000-0000-0000-0000000000a5",
    table_session_id: null,
    order_number: input.orderNumber,
    status: input.status,
    customer_status: input.status === "READY" ? "COMING_TO_TABLE" : "CONFIRMED",
    subtotal_minor: "10000",
    currency: "THB",
    customer_note: null,
    submission_key: `p04-r05-${input.id}`,
    submitted_at: new Date("2040-05-01T00:00:00Z"),
    accepted_at: new Date("2040-05-01T00:00:01Z"),
    preparing_at: input.status === "READY" ? new Date("2040-05-01T00:00:02Z") : null,
    ready_at: input.status === "READY" ? new Date("2040-05-01T00:00:03Z") : null,
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

async function load(orderId: string) {
  const { db } = getDatabaseRuntime();
  const order = await db
    .selectFrom("foodflow.orders")
    .select([
      "status",
      "customer_status as customerStatus",
      "priority_code as priorityCode",
      "priority_reason as priorityReason",
      "prioritized_at as prioritizedAt",
      "defer_reason as deferReason",
      "deferred_at as deferredAt",
      "deferred_until as deferredUntil",
      "remake_count as remakeCount",
      "last_remake_reason as lastRemakeReason",
      "remake_requested_at as remakeRequestedAt",
    ])
    .where("id", "=", orderId)
    .executeTakeFirstOrThrow();
  const events = await db
    .selectFrom("foodflow.order_events")
    .select(["event_type as eventType", "from_status as fromStatus", "to_status as toStatus", "actor_id as actorId", "reason"])
    .where("order_id", "=", orderId)
    .orderBy("occurred_at", "asc")
    .execute();
  return { order, events };
}

function expectConflict(outcome: PromiseSettledResult<unknown>) {
  expect(outcome.status).toBe("rejected");
  if (outcome.status === "rejected") {
    expect(outcome.reason).toMatchObject({ code: "ORDER_CONTROL_CONFLICT" });
  }
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R05 production controls",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();
      await db.insertInto("app.users").values({
        id: actorId,
        email: "p04-r05-actor@flow.test",
        display_name: "P04 R05 Actor",
        status: "ACTIVE",
      }).execute();
      await db.insertInto("app.roles").values({
        id: roleId,
        tenant_id: fixture.tenants.a,
        code: "P04_R05_ORDER_MANAGER",
        name: "P04 R05 Order Manager",
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
        orderFixture({ id: orderIds.priority, orderNumber: "P04-R05-PRIORITY", status: "ACCEPTED" }),
        orderFixture({ id: orderIds.defer, orderNumber: "P04-R05-DEFER", status: "ACCEPTED" }),
        orderFixture({ id: orderIds.remake, orderNumber: "P04-R05-REMAKE", status: "READY" }),
        orderFixture({ id: orderIds.remakeRace, orderNumber: "P04-R05-REMAKE-RACE", status: "READY" }),
        orderFixture({ id: orderIds.viewOnly, orderNumber: "P04-R05-VIEW", status: "ACCEPTED" }),
        orderFixture({
          id: orderIds.sibling,
          orderNumber: "P04-R05-A2",
          status: "ACCEPTED",
          branchId: fixture.branches.a2,
          tableId: "00000000-0000-0000-0000-0000000000ad",
        }),
        orderFixture({ id: orderIds.cancelDeferred, orderNumber: "P04-R05-CANCEL-DEFER", status: "ACCEPTED" }),
      ]).execute();
    });

    afterAll(async () => {
      const { db } = getDatabaseRuntime();
      await db.deleteFrom("foodflow.order_events").where("order_id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("foodflow.orders").where("id", "in", Object.values(orderIds)).execute();
      await db.deleteFrom("app.memberships").where("id", "=", membershipId).execute();
      await db.deleteFrom("app.role_permissions").where("role_id", "=", roleId).execute();
      await db.deleteFrom("app.roles").where("id", "=", roleId).execute();
      await db.deleteFrom("app.users").where("id", "=", actorId).execute();
      await destroyDatabaseRuntimeForTests();
    });

    it("sets and clears urgent priority without changing lifecycle/customer state", async () => {
      const set = await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.priority,
        action: "SET_PRIORITY",
        reasonCode: "WAIT_TIME",
      });
      expect(set).toMatchObject({
        status: "ACCEPTED",
        customerStatus: "CONFIRMED",
        priority: "URGENT",
        priorityReason: "WAIT_TIME",
      });
      const urgent = await load(orderIds.priority);
      expect(urgent.events.at(-1)).toMatchObject({
        eventType: "ORDER_PRIORITY_SET",
        fromStatus: "ACCEPTED",
        toStatus: "ACCEPTED",
        actorId,
        reason: "WAIT_TIME",
      });

      const cleared = await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.priority,
        action: "CLEAR_PRIORITY",
      });
      expect(cleared.priority).toBe("NORMAL");
      expect(cleared.priorityReason).toBeNull();
      const normal = await load(orderIds.priority);
      expect(normal.order.status).toBe("ACCEPTED");
      expect(normal.order.customerStatus).toBe("CONFIRMED");
      expect(normal.events.at(-1)?.eventType).toBe("ORDER_PRIORITY_CLEARED");
    });

    it("blocks normal lifecycle while deferred and allows progress after explicit resume", async () => {
      const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.defer,
        action: "DEFER_ORDER",
        reasonCode: "INGREDIENT_WAIT",
        deferredUntil: until,
      });
      await expect(startPreparingOperationalOrder(context, orderIds.defer)).rejects.toMatchObject({
        code: "ORDER_LIFECYCLE_CONFLICT",
      });
      const deferred = await load(orderIds.defer);
      expect(deferred.order.status).toBe("ACCEPTED");
      expect(deferred.order.deferReason).toBe("INGREDIENT_WAIT");
      expect(deferred.events.at(-1)?.eventType).toBe("ORDER_DEFERRED");

      await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.defer,
        action: "RESUME_ORDER",
      });
      const progressed = await startPreparingOperationalOrder(context, orderIds.defer);
      expect(progressed.status).toBe("PREPARING");
      const resumed = await load(orderIds.defer);
      expect(resumed.order.deferReason).toBeNull();
      expect(resumed.events.map((event) => event.eventType)).toContain("ORDER_RESUMED");
    });

    it("routes READY through bounded REMAKE then reuses the normal lifecycle", async () => {
      const requested = await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.remake,
        action: "REQUEST_REMAKE",
        reasonCode: "QUALITY_ISSUE",
      });
      expect(requested).toMatchObject({
        status: "REMAKE",
        customerStatus: "PREPARING",
        remakeCount: 1,
        lastRemakeReason: "QUALITY_ISSUE",
      });
      const started = await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.remake,
        action: "START_REMAKE",
      });
      expect(started.status).toBe("PREPARING");
      const readyAgain = await markOperationalOrderReady(context, orderIds.remake);
      expect(readyAgain.status).toBe("READY");
      const state = await load(orderIds.remake);
      expect(state.order.remakeCount).toBe(1);
      expect(state.events.map((event) => event.eventType)).toEqual([
        "ORDER_REMAKE_REQUESTED",
        "ORDER_REMAKE_STARTED",
        "ORDER_READY",
      ]);
    });

    it("allows only one concurrent remake request to increment the aggregate", async () => {
      const outcomes = await Promise.allSettled([
        executeOperationalOrderProductionControl(context, {
          orderId: orderIds.remakeRace,
          action: "REQUEST_REMAKE",
          reasonCode: "STAFF_ERROR",
        }),
        executeOperationalOrderProductionControl(context, {
          orderId: orderIds.remakeRace,
          action: "REQUEST_REMAKE",
          reasonCode: "QUALITY_ISSUE",
        }),
      ]);
      expect(outcomes.filter((outcome) => outcome.status === "fulfilled")).toHaveLength(1);
      expectConflict(outcomes.find((outcome) => outcome.status === "rejected")!);
      const state = await load(orderIds.remakeRace);
      expect(state.order.remakeCount).toBe(1);
      expect(state.events.filter((event) => event.eventType === "ORDER_REMAKE_REQUESTED")).toHaveLength(1);
    });

    it("keeps order.view separate from order.manage and hides sibling-branch selectors", async () => {
      await expect(
        executeOperationalOrderProductionControl(viewOnlyContext, {
          orderId: orderIds.viewOnly,
          action: "SET_PRIORITY",
          reasonCode: "WAIT_TIME",
        }),
      ).rejects.toMatchObject({ code: "ORDER_CONTROL_FORBIDDEN" });

      await expect(
        executeOperationalOrderProductionControl(context, {
          orderId: orderIds.sibling,
          action: "SET_PRIORITY",
          reasonCode: "WAIT_TIME",
        }),
      ).rejects.toMatchObject({ code: "ORDER_CONTROL_NOT_FOUND" });
    });

    it("cancellation terminates a deferred order with coherent cleared current control state", async () => {
      await executeOperationalOrderProductionControl(context, {
        orderId: orderIds.cancelDeferred,
        action: "DEFER_ORDER",
        reasonCode: "CAPACITY",
        deferredUntil: null,
      });
      await cancelOperationalOrder(context, orderIds.cancelDeferred, "OPERATIONAL_ERROR");
      const state = await load(orderIds.cancelDeferred);
      expect(state.order.status).toBe("CANCELLED");
      expect(state.order.priorityCode).toBe("NORMAL");
      expect(state.order.deferReason).toBeNull();
      expect(state.order.deferredAt).toBeNull();
    });
  },
);
