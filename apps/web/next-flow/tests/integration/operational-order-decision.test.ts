import { afterAll, beforeAll, describe, expect, it } from "vitest";

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

const decisionRoleId = "92000000-0000-4000-8000-000000000001";
const actorOneId = "92000000-0000-4000-8000-000000000002";
const actorTwoId = "92000000-0000-4000-8000-000000000003";
const actorOneMembershipId = "92000000-0000-4000-8000-000000000004";
const actorTwoMembershipId = "92000000-0000-4000-8000-000000000005";

const orderIds = {
  accept: "93000000-0000-4000-8000-000000000001",
  reject: "93000000-0000-4000-8000-000000000002",
  retry: "93000000-0000-4000-8000-000000000003",
  changed: "93000000-0000-4000-8000-000000000004",
  concurrent: "93000000-0000-4000-8000-000000000005",
  siblingBranch: "93000000-0000-4000-8000-000000000006",
  otherTenant: "93000000-0000-4000-8000-000000000007",
  viewOnly: "93000000-0000-4000-8000-000000000008",
} as const;

const contexts = {
  actorOne: {
    actorId: actorOneId,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: actorOneMembershipId,
    roleId: decisionRoleId,
    scope: "BRANCH",
  },
  actorTwo: {
    actorId: actorTwoId,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: actorTwoMembershipId,
    roleId: decisionRoleId,
    scope: "BRANCH",
  },
  viewOnlyA1: {
    actorId: fixture.users.staffA1,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: "60000000-0000-4000-8000-0000000000a2",
    roleId: "50000000-0000-4000-8000-0000000000a2",
    scope: "BRANCH",
  },
} satisfies Record<string, AccessContext>;

function orderFixture(input: {
  id: string;
  tenantId: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  orderNumber: string;
  status?: "PENDING_CONFIRMATION" | "CHANGED";
}) {
  return {
    id: input.id,
    tenant_id: input.tenantId,
    restaurant_id: input.restaurantId,
    branch_id: input.branchId,
    table_id: input.tableId,
    table_session_id: null,
    order_number: input.orderNumber,
    status: input.status ?? "PENDING_CONFIRMATION",
    customer_status: "SENT",
    subtotal_minor: "10000",
    currency: "THB",
    customer_note: null,
    submission_key: `p04-r02-${input.id}`,
    submitted_at: new Date("2040-02-01T00:00:00Z"),
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

async function loadDecisionState(orderId: string) {
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

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R02 operational order decisions",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();

      await db
        .insertInto("app.users")
        .values([
          {
            id: actorOneId,
            email: "p04-r02-actor-one@flow.test",
            display_name: "P04 R02 Actor One",
            status: "ACTIVE",
          },
          {
            id: actorTwoId,
            email: "p04-r02-actor-two@flow.test",
            display_name: "P04 R02 Actor Two",
            status: "ACTIVE",
          },
        ])
        .execute();
      await db
        .insertInto("app.roles")
        .values({
          id: decisionRoleId,
          tenant_id: fixture.tenants.a,
          code: "P04_R02_ORDER_DECIDER",
          name: "P04 R02 Order Decider",
          system: false,
        })
        .execute();

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
      await db
        .insertInto("app.role_permissions")
        .values(
          permissions.map((permission) => ({
            role_id: decisionRoleId,
            permission_id: permission.id,
          })),
        )
        .execute();
      await db
        .insertInto("app.memberships")
        .values([
          {
            id: actorOneMembershipId,
            tenant_id: fixture.tenants.a,
            user_id: actorOneId,
            role_id: decisionRoleId,
            branch_id: fixture.branches.a1,
            status: "ACTIVE",
          },
          {
            id: actorTwoMembershipId,
            tenant_id: fixture.tenants.a,
            user_id: actorTwoId,
            role_id: decisionRoleId,
            branch_id: fixture.branches.a1,
            status: "ACTIVE",
          },
        ])
        .execute();

      await db
        .insertInto("foodflow.orders")
        .values([
          orderFixture({
            id: orderIds.accept,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-R02-ACCEPT",
          }),
          orderFixture({
            id: orderIds.reject,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-R02-REJECT",
          }),
          orderFixture({
            id: orderIds.retry,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-R02-RETRY",
          }),
          orderFixture({
            id: orderIds.changed,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-R02-CHANGED",
            status: "CHANGED",
          }),
          orderFixture({
            id: orderIds.concurrent,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-R02-RACE",
          }),
          orderFixture({
            id: orderIds.siblingBranch,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a2,
            tableId: "00000000-0000-0000-0000-0000000000ad",
            orderNumber: "P04-R02-A2",
          }),
          orderFixture({
            id: orderIds.otherTenant,
            tenantId: fixture.tenants.b,
            restaurantId: "00000000-0000-0000-0000-0000000000b2",
            branchId: fixture.branches.b1,
            tableId: "00000000-0000-0000-0000-0000000000b5",
            orderNumber: "P04-R02-B1",
          }),
          orderFixture({
            id: orderIds.viewOnly,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-R02-VIEW",
          }),
        ])
        .execute();
    });

    afterAll(async () => {
      const { db } = getDatabaseRuntime();
      await db
        .deleteFrom("foodflow.order_events")
        .where("order_id", "in", Object.values(orderIds))
        .execute();
      await db
        .deleteFrom("foodflow.orders")
        .where("id", "in", Object.values(orderIds))
        .execute();
      await db
        .deleteFrom("app.memberships")
        .where("id", "in", [actorOneMembershipId, actorTwoMembershipId])
        .execute();
      await db
        .deleteFrom("app.role_permissions")
        .where("role_id", "=", decisionRoleId)
        .execute();
      await db.deleteFrom("app.roles").where("id", "=", decisionRoleId).execute();
      await db
        .deleteFrom("app.users")
        .where("id", "in", [actorOneId, actorTwoId])
        .execute();
      await destroyDatabaseRuntimeForTests();
    });

    it("accepts one pending order with server-derived actor and durable decision evidence", async () => {
      const result = await acceptOperationalOrder(contexts.actorOne, orderIds.accept);
      const state = await loadDecisionState(orderIds.accept);

      expect(result).toMatchObject({
        orderId: orderIds.accept,
        decision: "ACCEPT",
        status: "ACCEPTED",
        customerStatus: "CONFIRMED",
        reasonCode: null,
      });
      expect(state.order.status).toBe("ACCEPTED");
      expect(state.order.customerStatus).toBe("CONFIRMED");
      expect(state.order.acceptedAt).toBeInstanceOf(Date);
      expect(state.order.rejectedAt).toBeNull();
      expect(state.order.rejectionReason).toBeNull();
      expect(state.order.modifiedByStaff).toBe(actorOneId);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toMatchObject({
        eventType: "ORDER_ACCEPTED",
        fromStatus: "PENDING_CONFIRMATION",
        toStatus: "ACCEPTED",
        actorId: actorOneId,
        reason: null,
      });
      expect(state.events[0]?.occurredAt).toEqual(state.order.acceptedAt);
    });

    it("rejects one pending order with bounded reason and no payment or kitchen side effect", async () => {
      const result = await rejectOperationalOrder(
        contexts.actorOne,
        orderIds.reject,
        "ITEM_UNAVAILABLE",
      );
      const state = await loadDecisionState(orderIds.reject);
      const { db } = getDatabaseRuntime();
      const kitchen = await db
        .selectFrom("foodflow.kitchen_tickets")
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .where("order_id", "=", orderIds.reject)
        .executeTakeFirstOrThrow();
      const allocations = await db
        .selectFrom("payments.payment_allocations")
        .select((eb) => eb.fn.countAll<string>().as("count"))
        .where("order_id", "=", orderIds.reject)
        .executeTakeFirstOrThrow();

      expect(result).toMatchObject({
        orderId: orderIds.reject,
        decision: "REJECT",
        status: "REJECTED",
        customerStatus: "REJECTED",
        reasonCode: "ITEM_UNAVAILABLE",
      });
      expect(state.order.status).toBe("REJECTED");
      expect(state.order.customerStatus).toBe("REJECTED");
      expect(state.order.acceptedAt).toBeNull();
      expect(state.order.rejectedAt).toBeInstanceOf(Date);
      expect(state.order.rejectionReason).toBe("ITEM_UNAVAILABLE");
      expect(state.order.modifiedByStaff).toBe(actorOneId);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toMatchObject({
        eventType: "ORDER_REJECTED",
        fromStatus: "PENDING_CONFIRMATION",
        toStatus: "REJECTED",
        actorId: actorOneId,
        reason: "ITEM_UNAVAILABLE",
      });
      expect(kitchen.count).toBe("0");
      expect(allocations.count).toBe("0");
    });

    it("keeps view-only staff read authority separate from order.manage", async () => {
      await expect(
        acceptOperationalOrder(contexts.viewOnlyA1, orderIds.viewOnly),
      ).rejects.toMatchObject({ code: "ORDER_DECISION_FORBIDDEN" });

      const state = await loadDecisionState(orderIds.viewOnly);
      expect(state.order.status).toBe("PENDING_CONFIRMATION");
      expect(state.events).toHaveLength(0);
    });

    it("does not disclose sibling-branch or cross-tenant order selectors", async () => {
      for (const orderId of [orderIds.siblingBranch, orderIds.otherTenant]) {
        await expect(
          acceptOperationalOrder(contexts.actorOne, orderId),
        ).rejects.toMatchObject({ code: "ORDER_DECISION_NOT_FOUND" });
      }
    });

    it("keeps CHANGED review-only until a later authoritative re-decision policy exists", async () => {
      await expect(
        acceptOperationalOrder(contexts.actorOne, orderIds.changed),
      ).rejects.toMatchObject({ code: "ORDER_DECISION_CONFLICT" });

      const state = await loadDecisionState(orderIds.changed);
      expect(state.order.status).toBe("CHANGED");
      expect(state.events).toHaveLength(0);
    });

    it("treats same-decision retry as conflict without replacing the original evidence", async () => {
      const first = await acceptOperationalOrder(contexts.actorOne, orderIds.retry);
      await expect(
        acceptOperationalOrder(contexts.actorTwo, orderIds.retry),
      ).rejects.toMatchObject({ code: "ORDER_DECISION_CONFLICT" });

      const state = await loadDecisionState(orderIds.retry);
      expect(state.order.status).toBe("ACCEPTED");
      expect(state.order.modifiedByStaff).toBe(actorOneId);
      expect(state.order.acceptedAt?.toISOString()).toBe(first.decidedAt);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]?.actorId).toBe(actorOneId);
    });

    it("allows exactly one winner for concurrent accept-versus-reject", async () => {
      const outcomes = await Promise.allSettled([
        acceptOperationalOrder(contexts.actorOne, orderIds.concurrent),
        rejectOperationalOrder(contexts.actorTwo, orderIds.concurrent, "CAPACITY_LIMIT"),
      ]);
      const fulfilled = outcomes.filter(
        (outcome): outcome is PromiseFulfilledResult<Awaited<ReturnType<typeof acceptOperationalOrder>>> =>
          outcome.status === "fulfilled",
      );
      const rejected = outcomes.filter(
        (outcome): outcome is PromiseRejectedResult => outcome.status === "rejected",
      );

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect(rejected[0]?.reason).toMatchObject({ code: "ORDER_DECISION_CONFLICT" });

      const state = await loadDecisionState(orderIds.concurrent);
      expect(["ACCEPTED", "REJECTED"]).toContain(state.order.status);
      expect(state.events).toHaveLength(1);
      expect(state.events[0]?.actorId).toBe(state.order.modifiedByStaff);
      expect(state.events[0]?.toStatus).toBe(state.order.status);
    });
  },
);
