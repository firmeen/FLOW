import { describe, expect, it } from "vitest";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import {
  CustomerDataError,
  toCustomerDataError,
  toCustomerDatabaseContext,
} from "@/modules/customer-data/server";

const context: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000021",
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
  issuedAt: 2_000_000_000,
  expiresAt: 2_000_014_400,
  version: 1,
});

describe("P03/R02 customer data context", () => {
  it("derives an immutable DB scope from validated CustomerContext only", () => {
    const dbContext = toCustomerDatabaseContext(context);

    expect(dbContext).toEqual({
      tenantId: context.tenantId,
      restaurantId: context.restaurantId,
      branchId: context.branchId,
      capabilityId: context.capabilityId,
      tableId: context.tableId,
      tableSessionId: null,
    });
    expect(Object.isFrozen(dbContext)).toBe(true);
    expect(Object.keys(dbContext)).not.toContain("actorId");
    expect(Object.keys(dbContext)).not.toContain("roleId");
    expect(Object.keys(dbContext)).not.toContain("permissions");
    expect(Object.keys(dbContext)).not.toContain("restaurantSlug");
  });

  it("rejects malformed authority fields before a database transaction begins", () => {
    expect(() =>
      toCustomerDatabaseContext({ ...context, branchId: "not-a-uuid" }),
    ).toThrow("branchId must be a valid UUID");
  });

  it("redacts infrastructure details behind stable customer data errors", () => {
    const source = new Error("password=secret syntax error at SELECT internal_table");
    const mapped = toCustomerDataError(source);

    expect(mapped).toBeInstanceOf(CustomerDataError);
    expect(mapped.code).toBe("CUSTOMER_DATA_UNAVAILABLE");
    expect(mapped.message).toBe("Customer data is temporarily unavailable.");
    expect(mapped.message).not.toContain("secret");
    expect(mapped.cause).toBe(source);
  });
});
