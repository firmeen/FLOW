import "server-only";

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { getDatabaseConfig } from "./config";
import type { Database } from "./generated/database";

interface DatabaseRuntime {
  pool: Pool;
  db: Kysely<Database>;
}

declare global {
  var __flowDatabaseRuntime: DatabaseRuntime | undefined;
}

function createRuntime(): DatabaseRuntime {
  const config = getDatabaseConfig();
  const pool = new Pool({
    connectionString: config.connectionString,
    max: config.poolMax,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    idleTimeoutMillis: config.idleTimeoutMillis,
  });

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });

  return { pool, db };
}

export function getDatabaseRuntime(): DatabaseRuntime {
  if (process.env.NODE_ENV === "development") {
    globalThis.__flowDatabaseRuntime ??= createRuntime();
    return globalThis.__flowDatabaseRuntime;
  }

  globalThis.__flowDatabaseRuntime ??= createRuntime();
  return globalThis.__flowDatabaseRuntime;
}

export async function destroyDatabaseRuntimeForTests(): Promise<void> {
  const runtime = globalThis.__flowDatabaseRuntime;
  if (!runtime) return;
  await runtime.db.destroy();
  globalThis.__flowDatabaseRuntime = undefined;
}
