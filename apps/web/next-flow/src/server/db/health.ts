import "server-only";

import { sql } from "kysely";

import { getDatabaseRuntime } from "./client";

export interface DatabaseHealthResult {
  healthy: boolean;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthResult> {
  try {
    const { db } = getDatabaseRuntime();
    await sql`select 1`.execute(db);
    return { healthy: true };
  } catch {
    return { healthy: false };
  }
}
