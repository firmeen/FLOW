import { afterEach, describe, expect, it } from "vitest";

import {
  DatabaseConfigurationError,
  getDatabaseConfig,
} from "@/server/db/config";

describe("database config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("fails lazily without DATABASE_URL", () => {
    expect(() => getDatabaseConfig({})).toThrow(DatabaseConfigurationError);
  });

  it("does not include a configured secret URL in validation errors", () => {
    const secretUrl = "postgresql://user:secret@example.invalid:5432/postgres";
    try {
      getDatabaseConfig({ DATABASE_URL: secretUrl, DATABASE_POOL_MAX: "nope" });
      throw new Error("expected config validation to fail");
    } catch (error) {
      expect(String(error)).not.toContain(secretUrl);
      expect(String(error)).not.toContain("secret");
    }
  });

  it("normalizes valid pool settings", () => {
    const result = getDatabaseConfig({
      DATABASE_URL: "postgresql://local.invalid/postgres",
      DATABASE_POOL_MAX: "2",
      DATABASE_CONNECTION_TIMEOUT_MS: "3000",
      DATABASE_IDLE_TIMEOUT_MS: "9000",
    });

    expect(result.poolMax).toBe(2);
    expect(result.connectionTimeoutMillis).toBe(3000);
    expect(result.idleTimeoutMillis).toBe(9000);
  });
});
