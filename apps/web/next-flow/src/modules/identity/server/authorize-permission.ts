import "server-only";

import { sql } from "kysely";

import { withTenantTransaction } from "@/server/db/transaction";
import type { DatabaseTransaction } from "@/server/db/types";

import {
  toAuthorizedDatabaseRequestContext,
  type AccessContext,
} from "./access-context";
import type { PermissionCode } from "./permissions";

export type PermissionScope = "tenant" | "branch";

export type PermissionDecision =
  | { status: "allowed" }
  | { status: "denied" }
  | { status: "unavailable" };

export class AuthorizationDeniedError extends Error {
  readonly permission: PermissionCode;

  constructor(permission: PermissionCode) {
    super("Authorization denied");
    this.name = "AuthorizationDeniedError";
    this.permission = permission;
  }
}

export class AuthorizationUnavailableError extends Error {
  readonly permission: PermissionCode;

  constructor(permission: PermissionCode, cause?: unknown) {
    super("Authorization service unavailable", { cause });
    this.name = "AuthorizationUnavailableError";
    this.permission = permission;
  }
}

function targetBranchId(
  context: AccessContext,
  scope: PermissionScope,
): string | null | undefined {
  if (scope === "tenant") return null;
  return context.branchId ?? undefined;
}

export async function authorizePermissionInTransaction(
  trx: DatabaseTransaction,
  context: AccessContext,
  permission: PermissionCode,
  scope: PermissionScope,
): Promise<PermissionDecision> {
  const branchId = targetBranchId(context, scope);
  if (scope === "branch" && !branchId) {
    return { status: "denied" };
  }

  try {
    const result = await sql<{ allowed: boolean }>`
      select private.actor_has_permission(
        ${permission},
        ${context.tenantId}::uuid,
        ${branchId ?? null}::uuid
      ) as allowed
    `.execute(trx);

    return result.rows[0]?.allowed === true
      ? { status: "allowed" }
      : { status: "denied" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function authorizePermission(
  context: AccessContext,
  permission: PermissionCode,
  scope: PermissionScope,
): Promise<PermissionDecision> {
  try {
    return await withTenantTransaction(
      toAuthorizedDatabaseRequestContext(context),
      (trx) => authorizePermissionInTransaction(trx, context, permission, scope),
    );
  } catch {
    return { status: "unavailable" };
  }
}
