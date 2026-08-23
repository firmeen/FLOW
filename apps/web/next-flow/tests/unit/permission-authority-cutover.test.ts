import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../src/${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("P02/R05 live permission authority", () => {
  it.each([
    ["app/(operations)/staff/layout.tsx", "/staff"],
    ["app/(operations)/kitchen/layout.tsx", "/kitchen"],
    ["app/(operations)/cashier/layout.tsx", "/cashier"],
    ["app/(management)/admin/layout.tsx", "/admin"],
  ] as const)("guards %s before rendering its privileged route family", (file, path) => {
    const layout = source(file);
    expect(layout).toContain("requireRoutePermission");
    expect(layout).toContain(`requireRoutePermission(\"${path}\")`);
  });

  it("keeps permission authority out of Auth.js session and proxy", () => {
    const auth = source("auth.ts");
    const config = source("auth.config.ts");
    const proxy = source("proxy.ts");
    const combined = `${auth}\n${config}`;

    expect(combined).not.toMatch(/permission(s)?\s*:/);
    expect(combined).not.toContain("rolePermissions");
    expect(proxy).not.toContain("actor_has_permission");
    expect(proxy).not.toContain("getDatabaseRuntime");
    expect(proxy).not.toContain("authorizePermission");
  });

  it("keeps route permission mapping server-authoritative", () => {
    const routeAuth = source("modules/identity/server/route-permissions.ts");
    expect(routeAuth).toContain("requireCurrentAccessContext");
    expect(routeAuth).toContain("authorizePermission");
    expect(routeAuth).not.toContain("localStorage");
    expect(routeAuth).not.toContain("roleId ===");
  });

  it("provides an atomic server command boundary rather than trusting route access", () => {
    const commandAuth = source("modules/identity/server/authorized-transaction.ts");
    const commandMap = source("modules/identity/server/command-permissions.ts");
    expect(commandAuth).toContain("authorizePermissionInTransaction");
    expect(commandAuth).toContain("AuthorizationDeniedError");
    expect(commandAuth).toContain("withTenantTransaction");
    expect(commandMap).toContain("withAuthorizedCurrentAccessTransaction");
    expect(commandAuth).not.toContain("localStorage");
    expect(commandMap).not.toContain("roleId ===");
  });
});
