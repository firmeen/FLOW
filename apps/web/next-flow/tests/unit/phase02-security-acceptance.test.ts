import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appRoot = fileURLToPath(new URL("../..", import.meta.url));
const sourceRoot = join(appRoot, "src");

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function read(relativePath: string) {
  return readFileSync(join(appRoot, relativePath), "utf8");
}

describe("P02/R06 final identity and authorization acceptance", () => {
  it("contains no legacy shared credential or legacy cookie authority in runtime source", () => {
    const runtimeSource = sourceFiles(sourceRoot)
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");

    for (const retiredAuthority of [
      "FOODFLOW_INTERNAL_EMAIL",
      "FOODFLOW_INTERNAL_PASSWORD",
      "FOODFLOW_SESSION_SECRET",
      "foodflow_session",
      "credentialsMatch",
      "createSessionToken",
      "INTERNAL_SESSION_TYPE",
      "INTERNAL_USER_ID",
    ]) {
      expect(runtimeSource).not.toContain(retiredAuthority);
    }
  });

  it("keeps the replacement authority chain explicit", () => {
    expect(read("src/auth.ts")).toContain("authenticateInternalUser");
    expect(read("src/lib/auth/session.ts")).toContain("return auth()");
    expect(read("src/modules/identity/server/current-access.ts")).toContain(
      "requireCurrentAccessContext",
    );
    expect(read("src/modules/identity/server/authorize-permission.ts")).toContain(
      "private.actor_has_permission",
    );
    expect(read("src/modules/identity/server/authorized-transaction.ts")).toContain(
      "authorizePermissionInTransaction",
    );
  });

  it("keeps obsolete auth environment variables out of the deployment template", () => {
    const env = read(".env.example");
    expect(env).toContain("AUTH_SECRET=");
    expect(env).toContain("AUTH_TRUST_HOST=true");
    expect(env).not.toContain("FOODFLOW_INTERNAL_EMAIL");
    expect(env).not.toContain("FOODFLOW_INTERNAL_PASSWORD");
    expect(env).not.toContain("FOODFLOW_SESSION_SECRET");
  });

  it("keeps permission evaluation out of the authentication proxy", () => {
    const proxy = read("src/proxy.ts");
    expect(proxy).toContain("NextAuth(authConfig).auth");
    expect(proxy).not.toContain("actor_has_permission");
    expect(proxy).not.toContain("authorizePermission");
    expect(proxy).not.toContain("getDatabaseRuntime");
  });
});
