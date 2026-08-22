import "server-only";

import { sql } from "kysely";

import { withAuthenticationTransaction } from "@/server/db/authentication-transaction";

import { AuthenticationThrottleError, IdentityInputError } from "./errors";
import {
  LOGIN_BLOCK_SECONDS,
  LOGIN_FAILURE_LIMIT,
  LOGIN_FAILURE_WINDOW_SECONDS,
  LOGIN_THROTTLE_DIGEST_PATTERN,
} from "./policy";
import type { LoginThrottleState } from "./types";

interface ThrottleRow {
  failure_count: number;
  window_started_at: Date;
  blocked_until: Date | null;
  is_blocked: boolean;
}

function validateDigest(digest: unknown): string {
  if (typeof digest !== "string" || !LOGIN_THROTTLE_DIGEST_PATTERN.test(digest)) {
    throw new IdentityInputError("Invalid throttle subject");
  }
  return digest;
}

function mapState(row: ThrottleRow): LoginThrottleState {
  return {
    failureCount: Number(row.failure_count),
    windowStartedAt: new Date(row.window_started_at),
    blockedUntil: row.blocked_until ? new Date(row.blocked_until) : null,
    isBlocked: Boolean(row.is_blocked),
  };
}

export async function readLoginThrottle(subjectDigest: unknown, observedAt = new Date()): Promise<LoginThrottleState | null> {
  const digest = validateDigest(subjectDigest);
  try {
    return await withAuthenticationTransaction(async (trx) => {
      const result = await sql<ThrottleRow>`select * from private.get_login_throttle(${digest}, ${observedAt})`.execute(trx);
      return result.rows[0] ? mapState(result.rows[0]) : null;
    });
  } catch (error) {
    throw new AuthenticationThrottleError(error);
  }
}

export async function recordLoginFailure(subjectDigest: unknown, observedAt = new Date()): Promise<LoginThrottleState> {
  const digest = validateDigest(subjectDigest);
  try {
    return await withAuthenticationTransaction(async (trx) => {
      const result = await sql<ThrottleRow>`
        select * from private.record_login_failure(
          ${digest}, ${observedAt}, ${LOGIN_FAILURE_LIMIT},
          ${LOGIN_FAILURE_WINDOW_SECONDS}, ${LOGIN_BLOCK_SECONDS}
        )
      `.execute(trx);
      const row = result.rows[0];
      if (!row) throw new Error("Throttle mutation returned no state");
      return mapState(row);
    });
  } catch (error) {
    throw new AuthenticationThrottleError(error);
  }
}

export async function clearLoginFailures(subjectDigest: unknown): Promise<void> {
  const digest = validateDigest(subjectDigest);
  try {
    await withAuthenticationTransaction(async (trx) => {
      await sql`select private.clear_login_failures(${digest})`.execute(trx);
    });
  } catch (error) {
    throw new AuthenticationThrottleError(error);
  }
}
