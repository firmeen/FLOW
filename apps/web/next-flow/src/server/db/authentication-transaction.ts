import "server-only";

import { sql } from "kysely";

import { getDatabaseRuntime } from "./client";
import type { DatabaseTransaction } from "./types";

export async function withAuthenticationTransaction<T>(
  callback: (trx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  const { db } = getDatabaseRuntime();

  return db.transaction().execute(async (trx) => {
    await sql`set local role flow_authenticator`.execute(trx);
    return callback(trx);
  });
}
