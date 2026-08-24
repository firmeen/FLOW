import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  AuthorizationDeniedError,
  authorizePermission,
} from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import {
  getOperationalOrderDetail,
  listOperationalOrderQueue,
  parseOperationalOrderQueueSearchParams,
} from "@/modules/order-operations/server/order-queue-service";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const orderIds = {
  a1First: "81000000-0000-4000-8000-000000000001",
  a1Second: "81000000-0000-4000-8000-000000000002",
  a1Third: "81000000-0000-4000-8000-000000000003",
  a2: "81000000-0000-4000-8000-000000000004",
  b1: "81000000-0000-4000-8000-000000000005",
} as const;

const itemId = "82000000-0000-4000-8000-000000000001";
const modifierId = "83000000-0000-4000-8000-000000000001";
const routeOnlyUserId = "84000000-0000-4000-8000-000000000001";
const routeOnlyRoleId = "84000000-0000-4000-8000-000000000002";
const routeOnlyMembershipId = "84000000-0000-4000-8000-000000000003";

const contexts = {
  staffA1: {
    actorId: fixture.users.staffA1,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: "60000000-0000-4000-8000-0000000000a2",
    roleId: "50000000-0000-4000-8000-0000000000a2",
    scope: "BRANCH",
  },
  staffA2: {
    actorId: fixture.users.staffA2,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a2,
    membershipId: "60000000-0000-4000-8000-0000000000a3",
    roleId: "50000000-0000-4000-8000-0000000000a2",
    scope: "BRANCH",
  },
  kitchenA1: {
    actorId: fixture.users.kitchenA1,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: "60000000-0000-4000-8000-0000000000a8",
    roleId: "50000000-0000-4000-8000-0000000000a3",
    scope: "BRANCH",
  },
  staffB1: {
    actorId: fixture.users.staffB1,
    tenantId: fixture.tenants.b,
    branchId: fixture.branches.b1,
    membershipId: "60000000-0000-4000-8000-0000000000b1",
    roleId: "50000000-0000-4000-8000-0000000000b1",
    scope: "BRANCH",
  },
  routeOnlyA1: {
    actorId: routeOnlyUserId,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: routeOnlyMembershipId,
    roleId: routeOnlyRoleId,
    scope: "BRANCH",
  },
} satisfies Record<string, AccessContext>;

function queueFilter(query = "") {
  return parseOperationalOrderQueueSearchParams(new URLSearchParams(query));
}

function orderFixture(input: {
  id: string;
  tenantId: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  orderNumber: string;
  submittedAt: string;
  capabilityId?: string | null;
  status?: "PENDING_CONFIRMATION" | "CHANGED";
  subtotalMinor?: string;
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
    subtotal_minor: input.subtotalMinor ?? "12500",
    currency: "THB",
    customer_note: input.id === orderIds.a1First ? "Historic customer note" : null,
    submission_key: `p04-r01-${input.id}`,
    submitted_at: new Date(input.submittedAt),
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
    customer_capability_id: input.capabilityId ?? null,
  } as const;
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P04/R01 operational order queue",
  () => {
    beforeAll(async () => {
      const { db } = getDatabaseRuntime();

      await db
        .insertInto("app.users")
        .values({
          id: routeOnlyUserId,
          email: "p04-route-only@flow.test",
          display_name: "P04 Route Only",
          status: "ACTIVE",
        })
        .execute();
      await db
        .insertInto("app.roles")
        .values({
          id: routeOnlyRoleId,
          tenant_id: fixture.tenants.a,
          code: "P04_ROUTE_ONLY",
          name: "P04 Route Only",
          system: false,
        })
        .execute();
      const routePermission = await db
        .selectFrom("app.permissions")
        .select("id")
        .where("code", "=", PERMISSIONS.operationsStaffAccess)
        .executeTakeFirstOrThrow();
      await db
        .insertInto("app.role_permissions")
        .values({ role_id: routeOnlyRoleId, permission_id: routePermission.id })
        .execute();
      await db
        .insertInto("app.memberships")
        .values({
          id: routeOnlyMembershipId,
          tenant_id: fixture.tenants.a,
          user_id: routeOnlyUserId,
          role_id: routeOnlyRoleId,
          branch_id: fixture.branches.a1,
          status: "ACTIVE",
        })
        .execute();

      await db
        .insertInto("foodflow.orders")
        .values([
          orderFixture({
            id: orderIds.a1First,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-A1-001",
            submittedAt: "2040-01-01T00:00:00Z",
            capabilityId: "85000000-0000-4000-8000-000000000001",
          }),
          orderFixture({
            id: orderIds.a1Second,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-A1-002",
            submittedAt: "2040-01-01T00:00:00Z",
            capabilityId: "85000000-0000-4000-8000-000000000002",
          }),
          orderFixture({
            id: orderIds.a1Third,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a1,
            tableId: "00000000-0000-0000-0000-0000000000a5",
            orderNumber: "P04-A1-003",
            submittedAt: "2040-01-01T00:01:00Z",
            capabilityId: "85000000-0000-4000-8000-000000000003",
            status: "CHANGED",
          }),
          orderFixture({
            id: orderIds.a2,
            tenantId: fixture.tenants.a,
            restaurantId: "00000000-0000-0000-0000-0000000000a2",
            branchId: fixture.branches.a2,
            tableId: "00000000-0000-0000-0000-0000000000ad",
            orderNumber: "P04-A2-001",
            submittedAt: "2040-01-01T00:00:30Z",
            capabilityId: null,
          }),
          orderFixture({
            id: orderIds.b1,
            tenantId: fixture.tenants.b,
            restaurantId: "00000000-0000-0000-0000-0000000000b2",
            branchId: fixture.branches.b1,
            tableId: "00000000-0000-0000-0000-0000000000b5",
            orderNumber: "P04-B1-001",
            submittedAt: "2040-01-01T00:00:45Z",
            capabilityId: "85000000-0000-4000-8000-000000000005",
          }),
        ])
        .execute();

      await db
        .insertInto("foodflow.order_items")
        .values({
          id: itemId,
          tenant_id: fixture.tenants.a,
          order_id: orderIds.a1First,
          menu_item_id: null,
          menu_item_name: "Historic Noodles 2040",
          menu_item_thai_name: "เส้นประวัติ 2040",
          quantity: 2,
          unit_price_minor: "5000",
          line_total_minor: "12500",
          special_request: "Keep snapshot request",
          preparation_station: "MAIN_KITCHEN",
        })
        .execute();
      await db
        .insertInto("foodflow.order_item_modifiers")
        .values({
          id: modifierId,
          tenant_id: fixture.tenants.a,
          order_item_id: itemId,
          modifier_group_id: null,
          modifier_group_name: "Historic Add-on",
          modifier_choice_id: null,
          modifier_choice_name: "Archived Choice",
          price_delta_minor: "2500",
        })
        .execute();
    });

    afterAll(async () => {
      const { db } = getDatabaseRuntime();
      await db.deleteFrom("foodflow.order_item_modifiers").where("id", "=", modifierId).execute();
      await db.deleteFrom("foodflow.order_items").where("id", "=", itemId).execute();
      await db
        .deleteFrom("foodflow.orders")
        .where("id", "in", Object.values(orderIds))
        .execute();
      await db
        .deleteFrom("app.memberships")
        .where("id", "=", routeOnlyMembershipId)
        .execute();
      await db
        .deleteFrom("app.role_permissions")
        .where("role_id", "=", routeOnlyRoleId)
        .execute();
      await db.deleteFrom("app.roles").where("id", "=", routeOnlyRoleId).execute();
      await db.deleteFrom("app.users").where("id", "=", routeOnlyUserId).execute();
      await destroyDatabaseRuntimeForTests();
    });

    it("reads only durable submitted orders from the trusted staff branch", async () => {
      const page = await listOperationalOrderQueue(
        contexts.staffA1,
        queueFilter("submittedAfter=2039-12-31T00%3A00%3A00Z&submittedBefore=2040-01-02T00%3A00%3A00Z"),
      );

      expect(page.orders.map((order) => order.id)).toEqual([
        orderIds.a1First,
        orderIds.a1Second,
        orderIds.a1Third,
      ]);
      expect(page.orders.some((order) => order.id === orderIds.a2)).toBe(false);
      expect(page.orders.some((order) => order.id === orderIds.b1)).toBe(false);
      expect(page.orders[0]).toMatchObject({
        orderNumber: "P04-A1-001",
        status: "PENDING_CONFIRMATION",
        source: "CUSTOMER_WEB",
        orderingMode: "DINE_IN",
        tableLabel: "Table A1",
        subtotalMinor: "12500",
        currency: "THB",
        lineCount: 1,
        unitCount: 2,
      });
      expect(page.orders[0]).not.toHaveProperty("customerCapabilityId");
      expect(page.orders[0]).not.toHaveProperty("submissionKey");
    });

    it("uses deterministic keyset pagination with no overlap at equal timestamps", async () => {
      const first = await listOperationalOrderQueue(
        contexts.staffA1,
        queueFilter("submittedAfter=2039-12-31T00%3A00%3A00Z&submittedBefore=2040-01-02T00%3A00%3A00Z&limit=2"),
      );
      expect(first.orders.map((order) => order.id)).toEqual([
        orderIds.a1First,
        orderIds.a1Second,
      ]);
      expect(first.nextCursor).not.toBeNull();

      const second = await listOperationalOrderQueue(
        contexts.staffA1,
        queueFilter(
          `submittedAfter=2039-12-31T00%3A00%3A00Z&submittedBefore=2040-01-02T00%3A00%3A00Z&limit=2&cursor=${encodeURIComponent(first.nextCursor!)}`,
        ),
      );
      expect(second.orders.map((order) => order.id)).toEqual([orderIds.a1Third]);
      expect(second.nextCursor).toBeNull();
    });

    it("returns historical item and modifier snapshots without exposing customer bearer ownership", async () => {
      const detail = await getOperationalOrderDetail(contexts.staffA1, orderIds.a1First);

      expect(detail.customerNote).toBe("Historic customer note");
      expect(detail.items).toHaveLength(1);
      expect(detail.items[0]).toMatchObject({
        menuItemId: null,
        menuItemName: "Historic Noodles 2040",
        menuItemThaiName: "เส้นประวัติ 2040",
        quantity: 2,
        unitPriceMinor: "5000",
        lineTotalMinor: "12500",
        specialRequest: "Keep snapshot request",
      });
      expect(detail.items[0]?.modifiers[0]).toMatchObject({
        modifierGroupName: "Historic Add-on",
        modifierChoiceName: "Archived Choice",
        priceDeltaMinor: "2500",
      });
      expect(detail).not.toHaveProperty("customerCapabilityId");
      expect(detail).not.toHaveProperty("submissionKey");
    });

    it("maps sibling-branch and cross-tenant detail selectors to not found", async () => {
      for (const orderId of [orderIds.a2, orderIds.b1]) {
        await expect(
          getOperationalOrderDetail(contexts.staffA1, orderId),
        ).rejects.toMatchObject({ code: "ORDER_QUEUE_NOT_FOUND" });
      }

      const a2Page = await listOperationalOrderQueue(
        contexts.staffA2,
        queueFilter("submittedAfter=2039-12-31T00%3A00%3A00Z&submittedBefore=2040-01-02T00%3A00%3A00Z"),
      );
      expect(a2Page.orders.map((order) => order.id)).toEqual([orderIds.a2]);
      expect(a2Page.orders[0]?.source).toBe("UNKNOWN");

      const b1Page = await listOperationalOrderQueue(
        contexts.staffB1,
        queueFilter("submittedAfter=2039-12-31T00%3A00%3A00Z&submittedBefore=2040-01-02T00%3A00%3A00Z"),
      );
      expect(b1Page.orders.map((order) => order.id)).toEqual([orderIds.b1]);
    });

    it("requires the staff route capability independently from order.view", async () => {
      await expect(
        authorizePermission(contexts.staffA1, PERMISSIONS.operationsStaffAccess, "branch"),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(contexts.kitchenA1, PERMISSIONS.orderView, "branch"),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(contexts.kitchenA1, PERMISSIONS.operationsStaffAccess, "branch"),
      ).resolves.toEqual({ status: "denied" });
    });

    it("does not let route-shell permission substitute for order.view", async () => {
      await expect(
        authorizePermission(contexts.routeOnlyA1, PERMISSIONS.operationsStaffAccess, "branch"),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(contexts.routeOnlyA1, PERMISSIONS.orderView, "branch"),
      ).resolves.toEqual({ status: "denied" });
      await expect(
        listOperationalOrderQueue(
          contexts.routeOnlyA1,
          queueFilter("submittedAfter=2039-12-31T00%3A00%3A00Z"),
        ),
      ).rejects.toBeInstanceOf(AuthorizationDeniedError);
    });
  },
);
