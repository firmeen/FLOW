import "server-only";

import { withCurrentCustomerCommandTransaction } from "./commands/runtime";

export interface CustomerVisibleOrderSummary {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly submittedAt: string | null;
  readonly acceptedAt: string | null;
  readonly preparingAt: string | null;
  readonly readyAt: string | null;
  readonly servedAt: string | null;
  readonly rejectedAt: string | null;
  readonly closedAt: string | null;
}

function iso(value: Date | null): string | null {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : null;
}

export async function listCurrentCustomerOrders(): Promise<readonly CustomerVisibleOrderSummary[]> {
  return withCurrentCustomerCommandTransaction(async ({ trx, context }) => {
    const rows = await trx
      .selectFrom("foodflow.orders")
      .select([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "subtotal_minor as subtotalMinor",
        "currency",
        "submitted_at as submittedAt",
        "accepted_at as acceptedAt",
        "preparing_at as preparingAt",
        "ready_at as readyAt",
        "served_at as servedAt",
        "rejected_at as rejectedAt",
        "closed_at as closedAt",
      ])
      .where("tenant_id", "=", context.tenantId)
      .where("restaurant_id", "=", context.restaurantId)
      .where("branch_id", "=", context.branchId)
      .where("table_id", "=", context.tableId)
      .where("customer_capability_id", "=", context.capabilityId)
      .where("status", "!=", "DRAFT")
      .orderBy("submitted_at", "desc")
      .orderBy("id", "desc")
      .limit(20)
      .execute();

    return Object.freeze(
      rows.map((row) =>
        Object.freeze({
          id: row.id,
          orderNumber: row.orderNumber,
          status: row.status,
          customerStatus: row.customerStatus,
          subtotalMinor: String(row.subtotalMinor),
          currency: row.currency,
          submittedAt: iso(row.submittedAt),
          acceptedAt: iso(row.acceptedAt),
          preparingAt: iso(row.preparingAt),
          readyAt: iso(row.readyAt),
          servedAt: iso(row.servedAt),
          rejectedAt: iso(row.rejectedAt),
          closedAt: iso(row.closedAt),
        }),
      ),
    );
  });
}
