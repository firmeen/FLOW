import "server-only";

import { sql } from "kysely";

import { withCustomerEntryTransaction } from "@/server/db/customer-entry-transaction";

import type {
  CustomerCapabilityClaims,
  ResolvedCustomerEntry,
} from "./types";

interface CustomerEntryRow {
  tenant_id: string;
  restaurant_id: string;
  restaurant_slug: string;
  restaurant_name: string;
  branch_id: string;
  branch_name: string;
  table_id: string;
  table_code: string;
  table_label: string;
  table_session_id: string | null;
}

function mapRow(row: CustomerEntryRow): ResolvedCustomerEntry {
  return {
    tenantId: row.tenant_id,
    restaurantId: row.restaurant_id,
    restaurantSlug: row.restaurant_slug,
    restaurantName: row.restaurant_name,
    branchId: row.branch_id,
    branchName: row.branch_name,
    tableId: row.table_id,
    tableCode: row.table_code,
    tableLabel: row.table_label,
    tableSessionId: row.table_session_id,
  };
}

export async function resolveCustomerEntryFromDatabase(
  restaurantSlug: string,
  tableCode: string,
): Promise<ResolvedCustomerEntry | null> {
  return withCustomerEntryTransaction(async (trx) => {
    const result = await sql<CustomerEntryRow>`
      select *
      from private.resolve_customer_entry(${restaurantSlug}, ${tableCode})
    `.execute(trx);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  });
}

export async function validateCustomerCapabilityScope(
  claims: CustomerCapabilityClaims,
): Promise<ResolvedCustomerEntry | null> {
  return withCustomerEntryTransaction(async (trx) => {
    const result = await sql<CustomerEntryRow>`
      select *
      from private.validate_customer_capability_scope(
        ${claims.tenantId}::uuid,
        ${claims.restaurantId}::uuid,
        ${claims.branchId}::uuid,
        ${claims.tableId}::uuid,
        ${claims.tableSessionId}::uuid
      )
    `.execute(trx);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  });
}
