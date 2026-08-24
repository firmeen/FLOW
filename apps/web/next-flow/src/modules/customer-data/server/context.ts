import "server-only";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import { validateUuid } from "@/server/db/context";

export interface CustomerDatabaseContext {
  readonly tenantId: string;
  readonly restaurantId: string;
  readonly branchId: string;
  readonly capabilityId: string;
  readonly tableId: string;
  readonly tableSessionId: string | null;
}

export function toCustomerDatabaseContext(
  context: CustomerContext,
): CustomerDatabaseContext {
  return Object.freeze({
    tenantId: validateUuid(context.tenantId, "tenantId"),
    restaurantId: validateUuid(context.restaurantId, "restaurantId"),
    branchId: validateUuid(context.branchId, "branchId"),
    capabilityId: validateUuid(context.capabilityId, "capabilityId"),
    tableId: validateUuid(context.tableId, "tableId"),
    tableSessionId: context.tableSessionId
      ? validateUuid(context.tableSessionId, "tableSessionId")
      : null,
  });
}
