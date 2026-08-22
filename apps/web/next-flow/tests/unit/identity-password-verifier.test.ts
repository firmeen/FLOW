import { describe, expect, it } from "vitest";

import {
  CredentialEncodingError,
  IdentityInputError,
  UnsupportedCredentialAlgorithmError,
} from "@/modules/identity/server/errors";
import { MAX_PASSWORD_INPUT_LENGTH } from "@/modules/identity/server/policy";
import { performDummyPasswordVerification, verifyPassword } from "@/modules/identity/server/password-verifier";

describe("password verifier", () => {
  it("rejects unsupported algorithms", async () => {
    await expect(verifyPassword("test-only", "bcrypt", "ignored")).rejects.toBeInstanceOf(
      UnsupportedCredentialAlgorithmError,
    );
  });

  it("rejects malformed encodings", async () => {
    await expect(verifyPassword("test-only", "scrypt-v1", "bad")).rejects.toBeInstanceOf(
      CredentialEncodingError,
    );
  });

  it("bounds password input before KDF work", async () => {
    await expect(
      verifyPassword("x".repeat(MAX_PASSWORD_INPUT_LENGTH + 1), "scrypt-v1", "bad"),
    ).rejects.toBeInstanceOf(IdentityInputError);
  });

  it("executes the dummy KDF path without exposing a candidate", async () => {
    await expect(performDummyPasswordVerification("unknown-user-test-password")).resolves.toBeUndefined();
  });
});
