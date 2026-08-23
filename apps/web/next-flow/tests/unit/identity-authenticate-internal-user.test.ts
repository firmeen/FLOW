import { describe, expect, it, vi } from "vitest";

import {
  createInternalAuthenticator,
  type InternalAuthenticationDependencies,
} from "@/modules/identity/server/authenticate-internal-user";
import { IdentityInputError } from "@/modules/identity/server/errors";

const candidate = {
  userId: "30000000-0000-4000-8000-0000000000a1",
  normalizedEmail: "owner.a@flow.test",
  passwordHash: "scrypt-v1$16384$8$1$Zmxvdy10ZXN0LXNhbHQ=$AAAAAAAAAAAAAAAAAAAAAA==",
  algorithm: "scrypt-v1" as const,
  passwordChangedAt: new Date("2026-08-22T00:00:00.000Z"),
};

function makeDependencies(
  overrides: Partial<InternalAuthenticationDependencies> = {},
): InternalAuthenticationDependencies {
  return {
    normalizeEmail: vi.fn(() => "owner.a@flow.test"),
    deriveThrottleSubject: vi.fn(() => "a".repeat(64)),
    readThrottle: vi.fn(async () => null),
    findCandidate: vi.fn(async () => candidate),
    verify: vi.fn(async () => true),
    verifyDummy: vi.fn(async () => undefined),
    recordFailure: vi.fn(async () => ({
      failureCount: 1,
      windowStartedAt: new Date("2026-08-22T00:00:00.000Z"),
      blockedUntil: null,
      isBlocked: false,
    })),
    clearFailures: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("P02/R03 internal authentication orchestrator", () => {
  it("returns only real user identity after successful verification", async () => {
    const dependencies = makeDependencies();
    const authenticate = createInternalAuthenticator(dependencies);

    const result = await authenticate("  OWNER.A@FLOW.TEST  ", "correct-password");

    expect(result).toEqual({
      status: "authenticated",
      user: { id: candidate.userId, email: candidate.normalizedEmail },
    });
    expect(dependencies.readThrottle).toHaveBeenCalledWith("a".repeat(64));
    expect(dependencies.findCandidate).toHaveBeenCalledWith(candidate.normalizedEmail);
    expect(dependencies.verify).toHaveBeenCalledWith(
      "correct-password",
      "scrypt-v1",
      candidate.passwordHash,
    );
    expect(dependencies.verifyDummy).not.toHaveBeenCalled();
    expect(dependencies.recordFailure).not.toHaveBeenCalled();
    expect(dependencies.clearFailures).toHaveBeenCalledWith("a".repeat(64));
  });

  it("runs dummy KDF and records exactly one failure when no candidate exists", async () => {
    const dependencies = makeDependencies({
      findCandidate: vi.fn(async () => null),
    });
    const authenticate = createInternalAuthenticator(dependencies);

    await expect(authenticate("unknown@flow.test", "wrong-password")).resolves.toEqual({
      status: "rejected",
      reason: "invalid-credentials",
    });
    expect(dependencies.verifyDummy).toHaveBeenCalledTimes(1);
    expect(dependencies.verify).not.toHaveBeenCalled();
    expect(dependencies.recordFailure).toHaveBeenCalledTimes(1);
    expect(dependencies.clearFailures).not.toHaveBeenCalled();
  });

  it("records one failure for a wrong password", async () => {
    const dependencies = makeDependencies({
      verify: vi.fn(async () => false),
    });
    const authenticate = createInternalAuthenticator(dependencies);

    await expect(authenticate(candidate.normalizedEmail, "wrong-password")).resolves.toEqual({
      status: "rejected",
      reason: "invalid-credentials",
    });
    expect(dependencies.verify).toHaveBeenCalledTimes(1);
    expect(dependencies.verifyDummy).not.toHaveBeenCalled();
    expect(dependencies.recordFailure).toHaveBeenCalledTimes(1);
  });

  it("rejects an active block before credential lookup or KDF", async () => {
    const dependencies = makeDependencies({
      readThrottle: vi.fn(async () => ({
        failureCount: 5,
        windowStartedAt: new Date("2026-08-22T00:00:00.000Z"),
        blockedUntil: new Date("2026-08-22T00:15:00.000Z"),
        isBlocked: true,
      })),
    });
    const authenticate = createInternalAuthenticator(dependencies);

    await expect(authenticate(candidate.normalizedEmail, "correct-password")).resolves.toEqual({
      status: "rejected",
      reason: "blocked",
    });
    expect(dependencies.findCandidate).not.toHaveBeenCalled();
    expect(dependencies.verify).not.toHaveBeenCalled();
    expect(dependencies.verifyDummy).not.toHaveBeenCalled();
    expect(dependencies.recordFailure).not.toHaveBeenCalled();
    expect(dependencies.clearFailures).not.toHaveBeenCalled();
  });

  it("rejects malformed identity input without touching persistence", async () => {
    const dependencies = makeDependencies({
      normalizeEmail: vi.fn(() => {
        throw new IdentityInputError();
      }),
    });
    const authenticate = createInternalAuthenticator(dependencies);

    await expect(authenticate("not-an-email", "password")).resolves.toEqual({
      status: "rejected",
      reason: "invalid-credentials",
    });
    expect(dependencies.readThrottle).not.toHaveBeenCalled();
  });

  it("fails closed when throttle subject derivation fails", async () => {
    const dependencies = makeDependencies({
      deriveThrottleSubject: vi.fn(() => {
        throw new Error("digest unavailable");
      }),
    });
    const authenticate = createInternalAuthenticator(dependencies);

    await expect(authenticate(candidate.normalizedEmail, "password")).resolves.toEqual({
      status: "unavailable",
    });
    expect(dependencies.readThrottle).not.toHaveBeenCalled();
    expect(dependencies.findCandidate).not.toHaveBeenCalled();
  });

  it("fails closed when authentication infrastructure fails", async () => {
    const dependencies = makeDependencies({
      readThrottle: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
    });
    const authenticate = createInternalAuthenticator(dependencies);

    await expect(authenticate(candidate.normalizedEmail, "password")).resolves.toEqual({
      status: "unavailable",
    });
    expect(dependencies.findCandidate).not.toHaveBeenCalled();
  });
});
