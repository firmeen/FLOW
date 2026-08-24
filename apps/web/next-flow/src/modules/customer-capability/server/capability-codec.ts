import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { validateUuid } from "@/server/db/context";

import {
  CUSTOMER_CAPABILITY_AUDIENCE,
  CUSTOMER_CAPABILITY_ISSUER,
  CUSTOMER_CAPABILITY_MAX_AGE_SECONDS,
  getCustomerCapabilitySecret,
} from "./config";
import {
  CUSTOMER_CAPABILITY_VERSION,
  type CustomerCapabilityClaims,
  type ResolvedCustomerEntry,
} from "./types";

interface CapabilityPayload {
  iss: string;
  aud: string;
  v: number;
  jti: string;
  tenantId: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableSessionId: string | null;
  iat: number;
  exp: number;
}

const HEADER = Buffer.from(JSON.stringify({ alg: "HS256", typ: "FLOW-CAP" })).toString(
  "base64url",
);
const MAX_TOKEN_LENGTH = 4096;

function sign(unsigned: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(unsigned).digest();
}

function parsePayload(encoded: string): CapabilityPayload | null {
  try {
    const value = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<CapabilityPayload>;
    if (
      value.iss !== CUSTOMER_CAPABILITY_ISSUER ||
      value.aud !== CUSTOMER_CAPABILITY_AUDIENCE ||
      value.v !== CUSTOMER_CAPABILITY_VERSION ||
      typeof value.jti !== "string" ||
      typeof value.tenantId !== "string" ||
      typeof value.restaurantId !== "string" ||
      typeof value.branchId !== "string" ||
      typeof value.tableId !== "string" ||
      (value.tableSessionId !== null && typeof value.tableSessionId !== "string") ||
      typeof value.iat !== "number" ||
      !Number.isInteger(value.iat) ||
      typeof value.exp !== "number" ||
      !Number.isInteger(value.exp)
    ) {
      return null;
    }

    validateUuid(value.jti, "capabilityId");
    validateUuid(value.tenantId, "tenantId");
    validateUuid(value.restaurantId, "restaurantId");
    validateUuid(value.branchId, "branchId");
    validateUuid(value.tableId, "tableId");
    if (value.tableSessionId) validateUuid(value.tableSessionId, "tableSessionId");

    return value as CapabilityPayload;
  } catch {
    return null;
  }
}

export function issueCustomerCapability(
  entry: ResolvedCustomerEntry,
  nowSeconds = Math.floor(Date.now() / 1000),
): { token: string; claims: CustomerCapabilityClaims } {
  const secret = getCustomerCapabilitySecret();
  const payload: CapabilityPayload = {
    iss: CUSTOMER_CAPABILITY_ISSUER,
    aud: CUSTOMER_CAPABILITY_AUDIENCE,
    v: CUSTOMER_CAPABILITY_VERSION,
    jti: randomUUID(),
    tenantId: validateUuid(entry.tenantId, "tenantId"),
    restaurantId: validateUuid(entry.restaurantId, "restaurantId"),
    branchId: validateUuid(entry.branchId, "branchId"),
    tableId: validateUuid(entry.tableId, "tableId"),
    tableSessionId: entry.tableSessionId
      ? validateUuid(entry.tableSessionId, "tableSessionId")
      : null,
    iat: nowSeconds,
    exp: nowSeconds + CUSTOMER_CAPABILITY_MAX_AGE_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsigned = `${HEADER}.${encodedPayload}`;
  const token = `${unsigned}.${sign(unsigned, secret).toString("base64url")}`;

  return {
    token,
    claims: {
      version: CUSTOMER_CAPABILITY_VERSION,
      capabilityId: payload.jti,
      tenantId: payload.tenantId,
      restaurantId: payload.restaurantId,
      branchId: payload.branchId,
      tableId: payload.tableId,
      tableSessionId: payload.tableSessionId,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    },
  };
}

export type CapabilityVerification =
  | { status: "valid"; claims: CustomerCapabilityClaims }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "unavailable" };

export function verifyCustomerCapability(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): CapabilityVerification {
  if (!token || token.length > MAX_TOKEN_LENGTH) return { status: "invalid" };

  let secret: string;
  try {
    secret = getCustomerCapabilitySecret();
  } catch {
    return { status: "unavailable" };
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== HEADER) return { status: "invalid" };

  const unsigned = `${parts[0]}.${parts[1]}`;
  let suppliedSignature: Buffer;
  try {
    suppliedSignature = Buffer.from(parts[2], "base64url");
  } catch {
    return { status: "invalid" };
  }
  const expectedSignature = sign(unsigned, secret);
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return { status: "invalid" };
  }

  const payload = parsePayload(parts[1]);
  if (!payload || payload.iat > nowSeconds + 60 || payload.exp <= payload.iat) {
    return { status: "invalid" };
  }
  if (payload.exp <= nowSeconds) return { status: "expired" };

  return {
    status: "valid",
    claims: {
      version: CUSTOMER_CAPABILITY_VERSION,
      capabilityId: payload.jti,
      tenantId: payload.tenantId,
      restaurantId: payload.restaurantId,
      branchId: payload.branchId,
      tableId: payload.tableId,
      tableSessionId: payload.tableSessionId,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    },
  };
}
