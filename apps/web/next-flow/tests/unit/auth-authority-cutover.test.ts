import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(`../../src/${relativePath}`, import.meta.url)),
    "utf8",
  );
}

describe("P02/R03 authentication authority cutover", () => {
  it("removes legacy cookie and token verification from the protected proxy", () => {
    const proxySource = source("proxy.ts");

    expect(proxySource).toContain("NextAuth(authConfig).auth");
    expect(proxySource).not.toContain("SESSION_COOKIE_NAME");
    expect(proxySource).not.toContain("verifySession");
    expect(proxySource).not.toContain("foodflow_session");
  });

  it("retires the legacy shared-credential login endpoint", () => {
    const routeSource = source("app/api/auth/login/route.ts");

    expect(routeSource).toContain("status: 410");
    expect(routeSource).not.toContain("credentialsMatch");
    expect(routeSource).not.toContain("getInternalAuthConfig");
    expect(routeSource).not.toContain("createSession()");
  });

  it("keeps workspace and permission authority out of Auth.js configuration", () => {
    const authSource = source("auth.ts");
    const configSource = source("auth.config.ts");
    const combined = `${authSource}\n${configSource}`;

    expect(combined).not.toMatch(/tenantId|branchId|membershipId|permission(s)?\s*:/);
    expect(combined).not.toContain("FOODFLOW_INTERNAL_EMAIL");
    expect(combined).not.toContain("FOODFLOW_INTERNAL_PASSWORD");
    expect(combined).not.toContain("FOODFLOW_SESSION_SECRET");
  });
});
