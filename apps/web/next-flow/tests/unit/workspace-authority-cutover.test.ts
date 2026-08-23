import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../src/${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("P02/R04 workspace authority cutover", () => {
  it("revalidates workspace selectors before persisting them", () => {
    const routeSource = source("app/api/auth/workspace/route.ts");

    expect(routeSource).toContain("resolveAccessContext");
    expect(routeSource).toContain('result.status !== "resolved"');
    expect(routeSource).toContain("persistWorkspaceSelection");
    expect(routeSource).not.toContain("roleId:");
    expect(routeSource).not.toContain("permissions");
  });

  it("requires current AccessContext at protected server layouts", () => {
    const operations = source("app/(operations)/layout.tsx");
    const management = source("app/(management)/layout.tsx");

    expect(operations).toContain("requireCurrentAccessContext");
    expect(management).toContain("requireCurrentAccessContext");
    expect(operations).not.toContain("requireInternalSession");
    expect(management).not.toContain("requireInternalSession");
  });

  it("keeps proxy authentication-only and free of workspace database authority", () => {
    const proxySource = source("proxy.ts");

    expect(proxySource).not.toContain("workspace");
    expect(proxySource).not.toContain("withIdentityTransaction");
    expect(proxySource).not.toContain("withTenantTransaction");
    expect(proxySource).not.toContain("memberships");
  });

  it("maps only server-resolved access context into tenant transactions", () => {
    const currentAccess = source("modules/identity/server/current-access.ts");

    expect(currentAccess).toContain("resolveAccessContext");
    expect(currentAccess).toContain("toAuthorizedDatabaseRequestContext");
    expect(currentAccess).toContain("withTenantTransaction");
    expect(currentAccess).not.toContain("permission");
  });
});
