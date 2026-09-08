import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type { TrustedOperationalOrderContext } from "./types";

const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";

export class OperationalOrderMutationBusyError extends Error {
  constructor(cause?: unknown) {
    super("Operational order mutation is already in progress", { cause });
    this.name = "OperationalOrderMutationBusyError";
  }
}

function postgresErrorCode(error: unknown): string | null {
  let current: unknown = error;

  for (let depth = 0; depth < 6; depth += 1) {
    if (!current || typeof current !== "object") return null;

    const candidate = current as { readonly code?: unknown; readonly cause?: unknown };
    if (typeof candidate.code === "string") return candidate.code;
    current = candidate.cause;
  }

  return null;
}

export async function acquireOperationalOrderMutationLock(
  trx: DatabaseTransaction,
  context: TrustedOperationalOrderContext,
  orderId: string,
): Promise<boolean> {
  try {
    const result = await sql<{ readonly id: string }>`
      select id
      from foodflow.orders
      where tenant_id = ${context.tenantId}::uuid
        and branch_id = ${context.branchId}::uuid
        and id = ${orderId}::uuid
      for update nowait
    `.execute(trx);

    return result.rows.length === 1;
  } catch (error) {
    if (postgresErrorCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
      throw new OperationalOrderMutationBusyError(error);
    }
    throw error;
  }
}
