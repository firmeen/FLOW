import "server-only";

import { sql } from "kysely";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import { getDatabaseRuntime } from "@/server/db/client";
import type { DatabaseTransaction } from "@/server/db/types";

import {
  toCustomerDatabaseContext,
  type CustomerDatabaseContext,
} from "./context";
import {
  createCustomerRepositories,
  type CustomerRepositories,
} from "./repositories";

export interface CustomerDataTransactionScope {
  readonly trx: DatabaseTransaction;
  readonly context: CustomerDatabaseContext;
  readonly repositories: CustomerRepositories;
}

export async function withCustomerDataTransaction<T>(
  customerContext: CustomerContext,
  callback: (scope: CustomerDataTransactionScope) => Promise<T>,
): Promise<T> {
  const context = toCustomerDatabaseContext(customerContext);
  const { db } = getDatabaseRuntime();

  return db.transaction().execute(async (trx) => {
    await sql`set local role flow_customer_runtime`.execute(trx);
    await sql`select set_config('app.tenant_id', ${context.tenantId}, true)`.execute(trx);
    await sql`select set_config('app.restaurant_id', ${context.restaurantId}, true)`.execute(trx);
    await sql`select set_config('app.branch_id', ${context.branchId}, true)`.execute(trx);
    await sql`select set_config('app.table_id', ${context.tableId}, true)`.execute(trx);
    await sql`select set_config('app.customer_capability_id', ${context.capabilityId}, true)`.execute(trx);
    await sql`select set_config('app.table_session_id', ${context.tableSessionId ?? ""}, true)`.execute(trx);
    await sql`select set_config('app.actor_id', '', true)`.execute(trx);

    const scope = Object.freeze({
      trx,
      context,
      repositories: createCustomerRepositories(trx, context),
    });

    return callback(scope);
  });
}
