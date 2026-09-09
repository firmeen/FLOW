import "server-only";

import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type {
  ManagementBranchPulse,
  ManagementOverview,
  ManagementRecentPayment,
  ManagementServiceSignal,
} from "../types";
import { ManagementOperationError } from "./errors";

function asNumber(value: string | number | bigint | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function iso(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

export async function loadManagementOverview(): Promise<ManagementOverview> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.managementAdminAccess,
      "tenant",
      async (trx, context) => {
        const tenant = await trx
          .selectFrom("app.organizations")
          .select(["id", "name"])
          .where("id", "=", context.tenantId)
          .executeTakeFirstOrThrow();
        const branches = await trx
          .selectFrom("app.branches")
          .select(["id", "restaurant_id as restaurantId", "code", "name", "is_open as isOpen"])
          .where("tenant_id", "=", context.tenantId)
          .orderBy("name", "asc")
          .execute();

        const sessionCounts = await trx
          .selectFrom("foodflow.table_sessions")
          .select(["branch_id as branchId", sql<number>`count(*)::int`.as("count")])
          .where("tenant_id", "=", context.tenantId)
          .where("status", "in", ["ACTIVE", "BILL_REQUESTED", "PAYMENT_PENDING"])
          .groupBy("branch_id")
          .execute();
        const orderCounts = await trx
          .selectFrom("foodflow.orders")
          .select(["branch_id as branchId", sql<number>`count(*)::int`.as("count")])
          .where("tenant_id", "=", context.tenantId)
          .where("status", "in", ["PENDING_CONFIRMATION", "CHANGED", "ACCEPTED", "PREPARING", "READY", "REMAKE", "PAYMENT_PENDING"])
          .groupBy("branch_id")
          .execute();
        const serviceCounts = await trx
          .selectFrom("foodflow.service_requests")
          .select(["branch_id as branchId", sql<number>`count(*)::int`.as("count")])
          .where("tenant_id", "=", context.tenantId)
          .where("status", "in", ["OPEN", "ACKNOWLEDGED"])
          .groupBy("branch_id")
          .execute();
        const revenueRows = await trx
          .selectFrom("payments.payments")
          .select(["branch_id as branchId", sql<string>`coalesce(sum(total_minor), 0)::bigint`.as("total")])
          .where("tenant_id", "=", context.tenantId)
          .where("status", "=", "RECORDED")
          .where("recorded_at", ">=", sql<Date>`now() - interval '24 hours'`)
          .groupBy("branch_id")
          .execute();
        const soldOutRows = await trx
          .selectFrom("foodflow.menu_items")
          .select(["restaurant_id as restaurantId", sql<number>`count(*)::int`.as("count")])
          .where("tenant_id", "=", context.tenantId)
          .where("status", "=", "SOLD_OUT")
          .where("archived_at", "is", null)
          .groupBy("restaurant_id")
          .execute();

        const sessionMap = new Map(sessionCounts.map((row) => [row.branchId, asNumber(row.count)]));
        const orderMap = new Map(orderCounts.map((row) => [row.branchId, asNumber(row.count)]));
        const serviceMap = new Map(serviceCounts.map((row) => [row.branchId, asNumber(row.count)]));
        const revenueMap = new Map(revenueRows.map((row) => [row.branchId, asNumber(row.total)]));
        const soldOutMap = new Map(soldOutRows.map((row) => [row.restaurantId, asNumber(row.count)]));

        const branchPulse: ManagementBranchPulse[] = branches.map((branch) => Object.freeze({
          id: branch.id,
          code: branch.code,
          name: branch.name,
          isOpen: branch.isOpen,
          activeSessions: sessionMap.get(branch.id) ?? 0,
          activeOrders: orderMap.get(branch.id) ?? 0,
          openServiceRequests: serviceMap.get(branch.id) ?? 0,
          soldOutItems: soldOutMap.get(branch.restaurantId) ?? 0,
          revenue24hMinor: revenueMap.get(branch.id) ?? 0,
        }));

        const recentPaymentRows = await trx
          .selectFrom("payments.payments as payment")
          .innerJoin("app.branches as branch", (join) =>
            join.onRef("branch.tenant_id", "=", "payment.tenant_id").onRef("branch.id", "=", "payment.branch_id"),
          )
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join.onRef("table.tenant_id", "=", "payment.tenant_id").onRef("table.id", "=", "payment.table_id"),
          )
          .select([
            "payment.id as id", "payment.reference as reference", "branch.name as branchName", "table.label as tableLabel",
            "payment.method as method", "payment.status as status", "payment.total_minor as totalMinor", "payment.recorded_at as recordedAt",
          ])
          .where("payment.tenant_id", "=", context.tenantId)
          .orderBy("payment.recorded_at", "desc")
          .limit(10)
          .execute();
        const recentPayments: ManagementRecentPayment[] = recentPaymentRows.map((row) => Object.freeze({
          id: row.id,
          reference: row.reference,
          branchName: row.branchName,
          tableLabel: row.tableLabel,
          method: row.method,
          status: row.status,
          totalMinor: asNumber(row.totalMinor),
          recordedAt: iso(row.recordedAt),
        }));

        const serviceRows = await trx
          .selectFrom("foodflow.service_requests as request")
          .innerJoin("app.branches as branch", (join) =>
            join.onRef("branch.tenant_id", "=", "request.tenant_id").onRef("branch.id", "=", "request.branch_id"),
          )
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join.onRef("table.tenant_id", "=", "request.tenant_id").onRef("table.id", "=", "request.table_id"),
          )
          .select([
            "request.id as id", "branch.name as branchName", "table.label as tableLabel", "request.type as type",
            "request.status as status", "request.priority as priority", "request.requested_at as requestedAt",
          ])
          .where("request.tenant_id", "=", context.tenantId)
          .where("request.status", "in", ["OPEN", "ACKNOWLEDGED"])
          .orderBy("request.priority", "desc")
          .orderBy("request.requested_at", "asc")
          .limit(12)
          .execute();
        const serviceSignals: ManagementServiceSignal[] = serviceRows.map((row) => Object.freeze({
          id: row.id,
          branchName: row.branchName,
          tableLabel: row.tableLabel,
          type: row.type,
          status: row.status,
          priority: row.priority,
          requestedAt: iso(row.requestedAt),
        }));

        return Object.freeze({
          generatedAt: new Date().toISOString(),
          tenantName: tenant.name,
          metrics: Object.freeze({
            branches: branchPulse.length,
            openBranches: branchPulse.filter((branch) => branch.isOpen).length,
            activeSessions: branchPulse.reduce((sum, branch) => sum + branch.activeSessions, 0),
            activeOrders: branchPulse.reduce((sum, branch) => sum + branch.activeOrders, 0),
            openServiceRequests: branchPulse.reduce((sum, branch) => sum + branch.openServiceRequests, 0),
            soldOutItems: branchPulse.reduce((sum, branch) => sum + branch.soldOutItems, 0),
            revenue24hMinor: branchPulse.reduce((sum, branch) => sum + branch.revenue24hMinor, 0),
          }),
          branches: Object.freeze(branchPulse),
          recentPayments: Object.freeze(recentPayments),
          serviceSignals: Object.freeze(serviceSignals),
        });
      },
    );
  } catch (error) {
    if (error instanceof ManagementOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new ManagementOperationError("MANAGEMENT_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new ManagementOperationError("MANAGEMENT_UNAVAILABLE", error);
    throw new ManagementOperationError("MANAGEMENT_UNAVAILABLE", error);
  }
}
