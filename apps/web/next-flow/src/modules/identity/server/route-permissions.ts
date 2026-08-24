import "server-only";

import { redirect } from "next/navigation";

import { sanitizeInternalPath } from "@/lib/auth/redirect";

import type { AccessContext } from "./access-context";
import type { PermissionScope } from "./authorize-permission";
import { PERMISSIONS, type PermissionCode } from "./permissions";

export interface RoutePermissionRequirement {
  prefix: string;
  permission: PermissionCode;
  scope: PermissionScope;
}

export const INTERNAL_ROUTE_PERMISSION_REQUIREMENTS = [
  {
    prefix: "/staff",
    permission: PERMISSIONS.operationsStaffAccess,
    scope: "branch",
  },
  {
    prefix: "/kitchen",
    permission: PERMISSIONS.operationsKitchenAccess,
    scope: "branch",
  },
  {
    prefix: "/cashier",
    permission: PERMISSIONS.operationsCashierAccess,
    scope: "branch",
  },
  {
    prefix: "/admin",
    permission: PERMISSIONS.managementAdminAccess,
    scope: "tenant",
  },
] as const satisfies readonly RoutePermissionRequirement[];

export function getRoutePermissionRequirement(
  pathname: string,
): RoutePermissionRequirement | null {
  return (
    INTERNAL_ROUTE_PERMISSION_REQUIREMENTS.find(
      ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? null
  );
}

function forbiddenRedirect(nextPath: string, unavailable = false): never {
  const safeNext = sanitizeInternalPath(nextPath);
  const params = new URLSearchParams({ next: safeNext });
  if (unavailable) params.set("state", "unavailable");
  redirect(`/forbidden?${params.toString()}`);
}

export async function requireRoutePermission(
  pathname: string,
): Promise<AccessContext | null> {
  const requirement = getRoutePermissionRequirement(pathname);
  if (!requirement) return null;

  const [{ requireCurrentAccessContext }, { authorizePermission }] = await Promise.all([
    import("./current-access"),
    import("./authorize-permission"),
  ]);
  const context = await requireCurrentAccessContext({
    requireBranch: requirement.scope === "branch",
    nextPath: pathname,
  });
  const decision = await authorizePermission(
    context,
    requirement.permission,
    requirement.scope,
  );

  if (decision.status === "allowed") return context;
  forbiddenRedirect(pathname, decision.status === "unavailable");
}
