import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { credentialsMatch, getInternalAuthConfig } from "@/lib/auth/config";
import { createSessionToken, verifySession } from "@/lib/auth/token";

const originalEnvironment = {
  email: process.env.FOODFLOW_INTERNAL_EMAIL,
  password: process.env.FOODFLOW_INTERNAL_PASSWORD,
  secret: process.env.FOODFLOW_SESSION_SECRET,
};

beforeEach(() => {
  process.env.FOODFLOW_INTERNAL_EMAIL = "owner@flow.test";
  process.env.FOODFLOW_INTERNAL_PASSWORD = "test-password";
  process.env.FOODFLOW_SESSION_SECRET =
    "test-only-session-secret-with-at-least-thirty-two-characters";
});

afterAll(() => {
  for (const [name, value] of Object.entries({
    FOODFLOW_INTERNAL_EMAIL: originalEnvironment.email,
    FOODFLOW_INTERNAL_PASSWORD: originalEnvironment.password,
    FOODFLOW_SESSION_SECRET: originalEnvironment.secret,
  })) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("temporary internal auth boundary", () => {
  it("round-trips a signed session and rejects a tampered token", async () => {
    const { token, session } = await createSessionToken();

    await expect(verifySession(token)).resolves.toEqual(session);
    await expect(verifySession(`${token}tampered`)).resolves.toBeNull();
  });

  it("compares the configured email case-insensitively and the password exactly", () => {
    const config = getInternalAuthConfig();
    expect(config).not.toBeNull();
    if (!config) return;

    expect(credentialsMatch("OWNER@FLOW.TEST", "test-password", config)).toBe(
      true,
    );
    expect(credentialsMatch("owner@flow.test", "wrong-password", config)).toBe(
      false,
    );
  });
});
