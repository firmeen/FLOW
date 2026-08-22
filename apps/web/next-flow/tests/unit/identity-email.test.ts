import { describe, expect, it } from "vitest";

import { normalizeLoginEmail } from "@/modules/identity/server/email";
import { IdentityInputError } from "@/modules/identity/server/errors";
import { MAX_LOGIN_EMAIL_LENGTH } from "@/modules/identity/server/policy";

describe("normalizeLoginEmail", () => {
  it("normalizes case and surrounding whitespace deterministically", () => {
    expect(normalizeLoginEmail(" Owner@Flow.Test ")).toBe("owner@flow.test");
    expect(normalizeLoginEmail(normalizeLoginEmail("OWNER@FLOW.TEST"))).toBe("owner@flow.test");
  });

  it.each(["", "   ", "not-an-email", null, undefined, 42])("rejects invalid identity input", (input) => {
    expect(() => normalizeLoginEmail(input)).toThrow(IdentityInputError);
  });

  it("rejects unreasonably large input", () => {
    expect(() => normalizeLoginEmail(`${"a".repeat(MAX_LOGIN_EMAIL_LENGTH)}@x`)).toThrow(IdentityInputError);
  });
});
