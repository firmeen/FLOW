import { describe, expect, it } from "vitest";

import { PERMISSIONS } from "@/modules/identity/server/permissions";
import { getRoutePermissionRequirement } from "@/modules/identity/server/route-permissions";

describe("P02/R05 route permission mapping", () => {
  it.each([
    ["/staff", PERMISSIONS.operationsStaffAccess, "branch"],
    ["/staff/orders", PERMISSIONS.operationsStaffAccess, "branch"],
    ["/kitchen", PERMISSIONS.operationsKitchenAccess, "branch"],
    ["/cashier", PERMISSIONS.operationsCashierAccess, "branch"],
    ["/admin", PERMISSIONS.managementAdminAccess, "tenant"],
    ["/admin/settings", PERMISSIONS.managementAdminAccess, "tenant"],
  ] as const)("maps %s to its canonical permission", (path, permission, scope) => {
    expect(getRoutePermissionRequirement(path)).toMatchObject({
      permission,
      scope,
    });
  });

  it("does not turn public or auth routes into internal permission surfaces", () => {
    expect(getRoutePermissionRequirement("/")).toBeNull();
    expect(getRoutePermissionRequirement("/login")).toBeNull();
    expect(getRoutePermissionRequirement("/workspace")).toBeNull();
    expect(getRoutePermissionRequirement("/r/demo/table/T05")).toBeNull();
  });
});
