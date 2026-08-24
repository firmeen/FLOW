import "server-only";

import { createHash } from "node:crypto";

import { CustomerCommandError } from "../commands/errors";
import type { CustomerIdempotencyCommand } from "./types";

const IDEMPOTENCY_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FINGERPRINT_VERSION = 1 as const;

type CanonicalValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

function canonicalize(value: unknown): CanonicalValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
    }
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => canonicalize(entry)));
  }
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
    }

    const source = value as Record<string, unknown>;
    const result: Record<string, CanonicalValue> = {};
    for (const key of Object.keys(source).sort()) {
      if (source[key] === undefined) {
        throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
      }
      result[key] = canonicalize(source[key]);
    }
    return Object.freeze(result);
  }

  throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function normalizeCustomerIdempotencyKey(value: unknown): string {
  if (value === undefined || value === null) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_KEY_REQUIRED");
  }
  if (typeof value !== "string") {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_KEY_INVALID");
  }

  const normalized = value.trim().toLowerCase();
  if (!IDEMPOTENCY_KEY_PATTERN.test(normalized)) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_KEY_INVALID");
  }
  return normalized;
}

export function digestCustomerIdempotencyKey(normalizedKey: string): string {
  return sha256(`flow-customer-idempotency-key:v1:${normalizedKey}`);
}

export function createCustomerCommandFingerprint(
  command: CustomerIdempotencyCommand,
  normalizedIntent: unknown,
): string {
  const canonical = canonicalize({
    command,
    intent: normalizedIntent,
    version: FINGERPRINT_VERSION,
  });
  return sha256(JSON.stringify(canonical));
}
