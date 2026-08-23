import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  issueCustomerCapability,
  verifyCustomerCapability,
} from "@/modules/customer-capability/server/capability-codec";
import {
  CUSTOMER_CAPABILITY_COOKIE_NAME,
  CUSTOMER_CAPABILITY_MAX_AGE_SECONDS,
  customerCapabilityCookieOptions,
} from "@/modules/customer-capability/server/config";
import {
  buildCustomerEntryPath,
  buildCustomerExchangePath,
  parseCustomerEntrySelector,
} from "@/modules/customer-capability/server/entry-selector";
import type { ResolvedCustomerEntry } from "@/modules/customer-capability/server/types";

const TEST_SECRET = "p03-r01-customer-capability-test-secret-00000001";

const entry: ResolvedCustomerEntry = {
  tenantId: "00000000-0000-0000-0000-0000000000a1",
  restaurantId: "00000000-0000-0000-0000-0000000000a2",
  restaurantSlug: "restaurant-a",
  restaurantName: "Restaurant A",
  branchId: "00000000-0000-0000-0000-0000000000a3",
  branchName: "Branch A1",
  tableId: "00000000-0000-0000-0000-0000000000a5",
  tableCode: "T-A1",
  tableLabel: "Table A1",
  tableSessionId: null,
};

beforeEach(() => {
  process.env.CUSTOMER_CAPABILITY_SECRET = TEST_SECRET;
});

afterEach(() => {
  delete process.env.CUSTOMER_CAPABILITY_SECRET;
});

describe("P03/R01 customer capability", () => {
  it("issues a bounded customer-only capability and verifies it", () => {
    const now = 2_000_000_000;
    const issued = issueCustomerCapability(entry, now);
    const verified = verifyCustomerCapability(issued.token, now + 1);

    expect(issued.claims.expiresAt - issued.claims.issuedAt).toBe(
      CUSTOMER_CAPABILITY_MAX_AGE_SECONDS,
    );
    expect(issued.claims).toMatchObject({
      tenantId: entry.tenantId,
      restaurantId: entry.restaurantId,
      branchId: entry.branchId,
      tableId: entry.tableId,
      tableSessionId: null,
      version: 1,
    });
    expect(Object.keys(issued.claims)).not.toContain("actorId");
    expect(Object.keys(issued.claims)).not.toContain("roleId");
    expect(Object.keys(issued.claims)).not.toContain("permissions");
    expect(verified.status).toBe("valid");
  });

  it("fails closed for tampering, expiry, secret rotation, and missing configuration", () => {
    const now = 2_000_000_000;
    const issued = issueCustomerCapability(entry, now);
    const parts = issued.token.split(".");
    const tamperedPayload = `${parts[0]}.${parts[1].slice(0, -1)}A.${parts[2]}`;

    expect(verifyCustomerCapability(tamperedPayload, now + 1)).toEqual({
      status: "invalid",
    });
    expect(
      verifyCustomerCapability(issued.token, now + CUSTOMER_CAPABILITY_MAX_AGE_SECONDS),
    ).toEqual({ status: "expired" });

    process.env.CUSTOMER_CAPABILITY_SECRET = `${TEST_SECRET}-rotated`;
    expect(verifyCustomerCapability(issued.token, now + 1)).toEqual({
      status: "invalid",
    });

    delete process.env.CUSTOMER_CAPABILITY_SECRET;
    expect(verifyCustomerCapability(issued.token, now + 1)).toEqual({
      status: "unavailable",
    });
    expect(() => issueCustomerCapability(entry, now)).toThrow(
      "Customer capability signing is not configured.",
    );
  });

  it("keeps public selectors narrow and customer transport separate", () => {
    expect(parseCustomerEntrySelector(" Restaurant-A ", " T-A1 ")).toEqual({
      restaurantSlug: "restaurant-a",
      tableCode: "T-A1",
    });
    expect(parseCustomerEntrySelector("restaurant-a", "../admin")).toBeNull();
    expect(parseCustomerEntrySelector("https://example.com", "T-A1")).toBeNull();

    const selector = { restaurantSlug: "restaurant-a", tableCode: "T-A1" };
    expect(buildCustomerEntryPath(selector)).toBe("/r/restaurant-a/table/T-A1");
    expect(buildCustomerExchangePath(selector)).toBe(
      "/api/customer/entry?restaurantSlug=restaurant-a&tableCode=T-A1",
    );

    const options = customerCapabilityCookieOptions(2_000_000_100);
    expect(CUSTOMER_CAPABILITY_COOKIE_NAME).toBe("flow_customer_capability_v1");
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(CUSTOMER_CAPABILITY_MAX_AGE_SECONDS);
  });
});
