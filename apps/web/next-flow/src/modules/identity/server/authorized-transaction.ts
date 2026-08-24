import "server-only";

import { withTenantTransaction } from "@/server/db/transaction";
import type { DatabaseTransaction } from "@/server/db/types";

import {
  toAuthorizedDatabaseRequestContext,
  type AccessContext,
} from "./access-context";
import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
  authorizePermissionInTransaction,
  type PermissionScope,
} from "./authorize-permission";
import type { CurrentAccessOptions } from "./current-access";
import type { PermissionCode } from "./permissions";

export type AuthorizedTransactionCallback<T> = (
  trx: DatabaseTransaction,
  context: AccessContext,
) => Promise<T>;

export async function withAuthorizedAccessTransaction<T>(
  context: AccessContext,
  permission: PermissionCode,
  scope: PermissionScope,
  callback: AuthorizedTransactionCallback<T>,
): Promise<T> {
  return withTenantTransaction(
    toAuthorizedDatabaseRequestContext(context),
    async (trx) => {
      const decision = await authorizePermissionInTransaction(
        trx,
        context,
        permission,
        scope,
      );

      if (decision.status === "denied") {
        throw new AuthorizationDeniedError(permission);
      }
      if (decision.status === "unavailable") {
        throw new AuthorizationUnavailableError(permission);
      }

      return callback(trx, context);
    },
  );
}

export async function withAuthorizedCurrentAccessTransaction<T>(
  permission: PermissionCode,
  scope: PermissionScope,
  callback: AuthorizedTransactionCallback<T>,
  options: CurrentAccessOptions = {},
): Promise<T> {
  const { requireCurrentAccessContext } = await import("./current-access");
  const context = await requireCurrentAccessContext({
    ...options,
    requireBranch: scope === "branch",
  });

  return withAuthorizedAccessTransaction(
    context,
    permission,
    scope,
    callback,
  );
}
