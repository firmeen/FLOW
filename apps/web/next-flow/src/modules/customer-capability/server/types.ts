import "server-only";

export const CUSTOMER_CAPABILITY_VERSION = 1 as const;

export interface CustomerCapabilityClaims {
  version: typeof CUSTOMER_CAPABILITY_VERSION;
  capabilityId: string;
  tenantId: string;
  restaurantId: string;
  branchId: string;
  tableId: string;
  tableSessionId: string | null;
  issuedAt: number;
  expiresAt: number;
}

export interface CustomerContext {
  readonly capabilityId: string;
  readonly tenantId: string;
  readonly restaurantId: string;
  readonly restaurantSlug: string;
  readonly restaurantName: string;
  readonly branchId: string;
  readonly branchName: string;
  readonly tableId: string;
  readonly tableCode: string;
  readonly tableLabel: string;
  readonly tableSessionId: string | null;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly version: typeof CUSTOMER_CAPABILITY_VERSION;
}

export interface ResolvedCustomerEntry {
  tenantId: string;
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  branchId: string;
  branchName: string;
  tableId: string;
  tableCode: string;
  tableLabel: string;
  tableSessionId: string | null;
}

export type CustomerContextResolution =
  | { status: "resolved"; context: CustomerContext }
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "revoked" }
  | { status: "unavailable" };

export type CustomerEntryResolution =
  | { status: "resolved"; entry: ResolvedCustomerEntry }
  | { status: "invalid" }
  | { status: "unavailable" };
