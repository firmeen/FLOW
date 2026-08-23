import { describe, expect, it } from "vitest";

import { normalizeLoginEmail } from "@/modules/identity/server/email";
import { deriveLoginThrottleSubject } from "@/modules/identity/server/throttle-subject";

describe("P02/R03 login throttle subject", () => {
  it("is deterministic, lowercase, and 64 hexadecimal characters", () => {
    const digest = deriveLoginThrottleSubject("owner.a@flow.test");

    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(deriveLoginThrottleSubject("owner.a@flow.test")).toBe(digest);
  });

  it("uses the normalized identifier as its authority", () => {
    const canonical = normalizeLoginEmail("owner.a@flow.test");
    const variant = normalizeLoginEmail("  OWNER.A@FLOW.TEST  ");

    expect(deriveLoginThrottleSubject(variant)).toBe(
      deriveLoginThrottleSubject(canonical),
    );
  });

  it("separates different normalized identities", () => {
    expect(deriveLoginThrottleSubject("owner.a@flow.test")).not.toBe(
      deriveLoginThrottleSubject("staff.a1@flow.test"),
    );
  });
});
