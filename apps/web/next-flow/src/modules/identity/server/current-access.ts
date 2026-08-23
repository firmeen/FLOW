import "server-only";

import { redirect } from "next/navigation";

import { sanitizeInternalPath } from "@/lib/auth/redirect";
import { getInternalSession } from "@/lib/auth/session";
import { withTenantTransaction } from "@/server/db/transaction";
import type { DatabaseTransaction } from "@/server/db/types";

import {
  toAuthorizedDatabaseRequestContext,
  type AccessContext,
  type AccessResolution,
} from "./access-context";
import { resolveAccessContext } from "./resolve-access-context";
import { readWorkspaceSelection } from "./workspace-selection";

export type CurrentAccessResolution =
  | { status: "unauthenticated" }
  | AccessResolution;

export interface CurrentAccessOptions {
  requireBranch?: boolean;
  nextPath?: string;
}

export async function getCurrentAccessResolution(
  options: CurrentAccessOptions = {},
): Promise<CurrentAccessResolution> {
  const session = await getInternalSession();
  const actorId = session?.user?.id;
  if (!actorId) return { status: "unauthenticated" };

  const selection = await readWorkspaceSelection();
  return resolveAccessContext({
    actorId,
    tenantId: selection?.tenantId,
    branchId: selection?.branchId,
    requireBranch: options.requireBranch ?? true,
  });
}

export async function getCurrentAccessContext(
  options: CurrentAccessOptions = {},
): Promise<AccessContext | null> {
  const result = await getCurrentAccessResolution(options);
  return result.status === "resolved" ? result.context : null;
}

function workspaceRedirect(nextPath: string, state?: "no-access" | "unavailable"): never {
  const safeNext = sanitizeInternalPath(nextPath);
  const params = new URLSearchParams({ next: safeNext });
  if (state) params.set("state", state);
  redirect(`/workspace?${params.toString()}`);
}

export async function requireCurrentAccessContext(
  options: CurrentAccessOptions = {},
): Promise<AccessContext> {
  const nextPath = options.nextPath ?? "/staff";
  const result = await getCurrentAccessResolution(options);

  if (result.status === "resolved") return result.context;
  if (result.status === "unauthenticated") {
    redirect(`/login?next=${encodeURIComponent(sanitizeInternalPath(nextPath))}`);
  }
  if (result.status === "no_access") workspaceRedirect(nextPath, "no-access");
  if (result.status === "unavailable") workspaceRedirect(nextPath, "unavailable");
  workspaceRedirect(nextPath);
}

export async function withCurrentAccessTransaction<T>(
  callback: (trx: DatabaseTransaction, context: AccessContext) => Promise<T>,
  options: CurrentAccessOptions = {},
): Promise<T> {
  const context = await requireCurrentAccessContext(options);
  return withTenantTransaction(
    toAuthorizedDatabaseRequestContext(context),
    (trx) => callback(trx, context),
  );
}
