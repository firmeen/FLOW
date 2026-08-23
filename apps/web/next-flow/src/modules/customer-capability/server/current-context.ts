import "server-only";

import { cookies } from "next/headers";

import { verifyCustomerCapability } from "./capability-codec";
import { CUSTOMER_CAPABILITY_COOKIE_NAME } from "./config";
import { validateCustomerCapabilityScope } from "./repository";
import type { CustomerContextResolution } from "./types";

export async function getCurrentCustomerContext(): Promise<CustomerContextResolution> {
  const token = (await cookies()).get(CUSTOMER_CAPABILITY_COOKIE_NAME)?.value;
  if (!token) return { status: "missing" };

  const verified = verifyCustomerCapability(token);
  if (verified.status !== "valid") return verified;

  try {
    const entry = await validateCustomerCapabilityScope(verified.claims);
    if (!entry) return { status: "revoked" };

    return {
      status: "resolved",
      context: Object.freeze({
        capabilityId: verified.claims.capabilityId,
        tenantId: verified.claims.tenantId,
        restaurantId: verified.claims.restaurantId,
        restaurantSlug: entry.restaurantSlug,
        restaurantName: entry.restaurantName,
        branchId: verified.claims.branchId,
        branchName: entry.branchName,
        tableId: verified.claims.tableId,
        tableCode: entry.tableCode,
        tableLabel: entry.tableLabel,
        tableSessionId: verified.claims.tableSessionId,
        issuedAt: verified.claims.issuedAt,
        expiresAt: verified.claims.expiresAt,
        version: verified.claims.version,
      }),
    };
  } catch {
    return { status: "unavailable" };
  }
}
