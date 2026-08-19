import "server-only";

import { sql } from "kysely";

import { getDatabaseRuntime } from "./client";
import { validateActorId } from "./context";
import type { DatabaseTransaction } from "./types";

export async function withIdentityTransaction<T>(
  actorId: string,
  callback: (trx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const validatedActorId = validateActorId(actorId);
  const { db } = getDatabaseRuntime();

  return db.transaction().execute(async (trx) => {
    await sql`set local role flow_identity`.execute(trx);
    await sql`select set_config('app.actor_id', ${validatedActorId}, true)`.execute(trx);
    return callback(trx);
  });
}
