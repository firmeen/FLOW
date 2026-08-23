import "server-only";

import {
  createAccessContext,
  type AccessContext,
  type AccessResolution,
  type AccessSelector,
  type WorkspaceOption,
} from "./access-context";
import { listActorWorkspaces } from "./workspace-repository";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AccessContextResolverDependencies {
  listWorkspaces(actorId: string): Promise<WorkspaceOption[]>;
}

const defaultDependencies: AccessContextResolverDependencies = {
  listWorkspaces: listActorWorkspaces,
};

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function uniqueMemberships(options: readonly WorkspaceOption[]): WorkspaceOption[] {
  const byMembership = new Map<string, WorkspaceOption>();
  for (const option of options) byMembership.set(option.membershipId, option);
  return [...byMembership.values()];
}

function chooseAuthority(
  options: readonly WorkspaceOption[],
): WorkspaceOption | null | "AMBIGUOUS" {
  const tenantWide = uniqueMemberships(
    options.filter((option) => option.authorityScope === "TENANT"),
  );
  if (tenantWide.length === 1) return tenantWide[0];
  if (tenantWide.length > 1) return "AMBIGUOUS";

  const branchBound = uniqueMemberships(
    options.filter((option) => option.authorityScope === "BRANCH"),
  );
  if (branchBound.length === 1) return branchBound[0];
  if (branchBound.length > 1) return "AMBIGUOUS";
  return null;
}

function resolved(
  actorId: string,
  authority: WorkspaceOption,
  branchId: string | null,
): AccessResolution {
  const context: AccessContext = {
    actorId,
    tenantId: authority.tenantId,
    branchId,
    membershipId: authority.membershipId,
    roleId: authority.roleId,
    scope: branchId ? "BRANCH" : "TENANT",
  };

  return { status: "resolved", context: createAccessContext(context) };
}

export function createAccessContextResolver(
  dependencies: AccessContextResolverDependencies = defaultDependencies,
) {
  return async function resolveAccessContext(
    selector: AccessSelector,
  ): Promise<AccessResolution> {
    if (!isUuid(selector.actorId)) return { status: "invalid_selection" };
    if (selector.tenantId != null && !isUuid(selector.tenantId)) {
      return { status: "invalid_selection" };
    }
    if (selector.branchId != null && !isUuid(selector.branchId)) {
      return { status: "invalid_selection" };
    }
    if (selector.branchId && !selector.tenantId) {
      return { status: "invalid_selection" };
    }

    let options: WorkspaceOption[];
    try {
      options = await dependencies.listWorkspaces(selector.actorId);
    } catch {
      return { status: "unavailable" };
    }

    if (options.length === 0) return { status: "no_access" };

    const tenantIds = unique(options.map((option) => option.tenantId));
    let tenantId = selector.tenantId ?? null;

    if (!tenantId) {
      if (tenantIds.length !== 1) {
        return { status: "selection_required", options };
      }
      tenantId = tenantIds[0];
    } else if (!tenantIds.includes(tenantId)) {
      return { status: "invalid_selection" };
    }

    const tenantOptions = options.filter((option) => option.tenantId === tenantId);
    if (tenantOptions.length === 0) return { status: "invalid_selection" };

    if (selector.branchId) {
      const branchOptions = tenantOptions.filter(
        (option) => option.branchId === selector.branchId,
      );
      if (branchOptions.length === 0) return { status: "invalid_selection" };

      const authority = chooseAuthority(branchOptions);
      if (!authority || authority === "AMBIGUOUS") {
        return { status: "invalid_selection" };
      }
      return resolved(selector.actorId, authority, selector.branchId);
    }

    const tenantWideAuthorities = uniqueMemberships(
      tenantOptions.filter((option) => option.authorityScope === "TENANT"),
    );

    if (tenantWideAuthorities.length > 1) {
      return { status: "invalid_selection" };
    }

    if (tenantWideAuthorities.length === 1 && !selector.requireBranch) {
      return resolved(selector.actorId, tenantWideAuthorities[0], null);
    }

    const branchIds = unique(
      tenantOptions.flatMap((option) => (option.branchId ? [option.branchId] : [])),
    );

    if (branchIds.length === 0) {
      return selector.requireBranch
        ? { status: "no_access" }
        : tenantWideAuthorities.length === 1
          ? resolved(selector.actorId, tenantWideAuthorities[0], null)
          : { status: "no_access" };
    }

    if (branchIds.length > 1) {
      return { status: "selection_required", options: tenantOptions };
    }

    const branchId = branchIds[0];
    const branchOptions = tenantOptions.filter((option) => option.branchId === branchId);
    const authority = chooseAuthority(branchOptions);
    if (!authority || authority === "AMBIGUOUS") {
      return { status: "invalid_selection" };
    }

    return resolved(selector.actorId, authority, branchId);
  };
}

export const resolveAccessContext = createAccessContextResolver();
