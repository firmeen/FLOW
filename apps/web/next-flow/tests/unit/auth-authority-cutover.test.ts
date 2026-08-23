import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function sourceUrl(relativePath: string) {
  return new URL(`../../src/${relativePath}`, import.meta.url);
}

function source(relativePath: string) {
  return readFileSync(fileURLToPath(sourceUrl(relativePath)), "utf8");
}

function sourceExists(relativePath: string) {
  return existsSync(fileURLToPath(sourceUrl(relativePath)));
}

describe("P02/R06 authentication authority cleanup", () => {
  it("physically removes the legacy shared-auth runtime sources", () => {
    expect(sourceExists("lib/auth/config.ts")).toBe(false);
    expect(sourceExists("lib/auth/token.ts")).toBe(false);
    expect(sourceExists("app/api/auth/login/route.ts")).toBe(false);
  });

  it("keeps Auth.js as the sole protected session authority", () => {
    const sessionSource = source("lib/auth/session.ts");
    const proxySource = source("proxy.ts");

    expect(sessionSource).toContain("return auth()");
    expect(sessionSource).toContain("signOut({ redirect: false })");
    expect(sessionSource).not.toContain("foodflow_session");
    expect(sessionSource).not.toContain("SESSION_COOKIE_NAME");
    expect(sessionSource).not.toContain("createSessionToken");
    expect(proxySource).toContain("NextAuth(authConfig).auth");
    expect(proxySource).not.toContain("verifySession");
    expect(proxySource).not.toContain("getDatabaseRuntime");
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
