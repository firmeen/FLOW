import "server-only";

export type AccessScope = "TENANT" | "BRANCH";

export interface WorkspaceOption {
  membershipId: string;
  tenantId: string;
  roleId: string;
  authorityScope: AccessScope;
  tenantName: string;
  branchId: string | null;
  branchName: string | null;
  branchCode: string | null;
}

export interface AccessContext {
  actorId: string;
  tenantId: string;
  branchId: string | null;
  membershipId: string;
  roleId: string;
  scope: AccessScope;
}

export interface AccessSelector {
  actorId: string;
  tenantId?: string | null;
  branchId?: string | null;
  requireBranch?: boolean;
}

export type AccessResolution =
  | { status: "resolved"; context: AccessContext }
  | { status: "selection_required"; options: readonly WorkspaceOption[] }
  | { status: "no_access" }
  | { status: "invalid_selection" }
  | { status: "unavailable" };

export interface AuthorizedDatabaseRequestContext {
  tenantId: string;
  actorId: string;
  branchId?: string;
}

export function createAccessContext(input: AccessContext): Readonly<AccessContext> {
  return Object.freeze({ ...input });
}

export function toAuthorizedDatabaseRequestContext(
  context: AccessContext,
): AuthorizedDatabaseRequestContext {
  return {
    tenantId: context.tenantId,
    actorId: context.actorId,
    ...(context.branchId ? { branchId: context.branchId } : {}),
  };
}
