import "server-only";

import { createHash } from "node:crypto";

import { LOGIN_THROTTLE_DIGEST_PATTERN } from "./policy";

const LOGIN_THROTTLE_DOMAIN = "flow:internal-login:v1";

export function deriveLoginThrottleSubject(normalizedEmail: string): string {
  const digest = createHash("sha256")
    .update(`${LOGIN_THROTTLE_DOMAIN}\u0000${normalizedEmail}`, "utf8")
    .digest("hex");

  if (!LOGIN_THROTTLE_DIGEST_PATTERN.test(digest)) {
    throw new Error("Login throttle subject derivation failed");
  }

  return digest;
}
