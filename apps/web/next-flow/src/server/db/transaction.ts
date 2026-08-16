import "server-only";

import { sql } from "kysely";

import { getDatabaseRuntime } from "./client";
import { validateDatabaseContext, type DatabaseRequestContext } from "./context";
import type { DatabaseTransaction } from "./types";

export async function withTenantTransaction<T>(
  context: DatabaseRequestContext,
  callback: (trx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const validated = validateDatabaseContext(context);
  const { db } = getDatabaseRuntime();

  return db.transaction().execute(async (trx) => {
    await sql`set local role flow_runtime`.execute(trx);
    await sql`select set_config('app.tenant_id', ${validated.tenantId}, true)`.execute(trx);
    await sql`select set_config('app.branch_id', ${validated.branchId ?? ""}, true)`.execute(trx);
    await sql`select set_config('app.actor_id', ${validated.actorId ?? ""}, true)`.execute(trx);

    return callback(trx);
  });
}
