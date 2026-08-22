import "server-only";

import { IdentityInputError } from "./errors";
import { MAX_LOGIN_EMAIL_LENGTH } from "./policy";

export function normalizeLoginEmail(input: unknown): string {
  if (typeof input !== "string" || input.length > MAX_LOGIN_EMAIL_LENGTH) {
    throw new IdentityInputError();
  }

  const normalized = input.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    throw new IdentityInputError();
  }

  return normalized;
}
