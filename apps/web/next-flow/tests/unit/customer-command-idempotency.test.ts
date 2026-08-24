import { describe, expect, it } from "vitest";

import { CustomerCommandError } from "@/modules/customer-data/server";
import {
  createCustomerCommandFingerprint,
  digestCustomerIdempotencyKey,
  normalizeCustomerIdempotencyKey,
} from "@/modules/customer-data/server/idempotency/fingerprint";

describe("P03/R05 customer command idempotency primitives", () => {
  it("requires a bounded UUID v4 request identity", () => {
    expect(() => normalizeCustomerIdempotencyKey(undefined)).toThrowError(
      expect.objectContaining({ code: "CUSTOMER_COMMAND_IDEMPOTENCY_KEY_REQUIRED" }),
    );
    expect(() => normalizeCustomerIdempotencyKey("not-a-key")).toThrowError(
      expect.objectContaining({ code: "CUSTOMER_COMMAND_IDEMPOTENCY_KEY_INVALID" }),
    );

    expect(
      normalizeCustomerIdempotencyKey("  10000000-0000-4000-8000-000000000001  "),
    ).toBe("10000000-0000-4000-8000-000000000001");
  });

  it("digests the request identity without persisting the raw key", () => {
    const key = normalizeCustomerIdempotencyKey(
      "10000000-0000-4000-8000-000000000002",
    );
    const digest = digestCustomerIdempotencyKey(key);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(digest).not.toContain(key);
  });

  it("fingerprints equivalent object field ordering identically", () => {
    const left = createCustomerCommandFingerprint("CART_UPDATE_ITEM", {
      cartId: "71000000-0000-4000-8000-000000000001",
      cartItemId: "71100000-0000-4000-8000-000000000001",
      quantity: 2,
    });
    const right = createCustomerCommandFingerprint("CART_UPDATE_ITEM", {
      quantity: 2,
      cartItemId: "71100000-0000-4000-8000-000000000001",
      cartId: "71000000-0000-4000-8000-000000000001",
    });
    expect(left).toBe(right);
  });

  it("changes the fingerprint when semantic intent changes", () => {
    const base = {
      cartId: "71000000-0000-4000-8000-000000000001",
      cartItemId: "71100000-0000-4000-8000-000000000001",
      quantity: 2,
    };
    expect(createCustomerCommandFingerprint("CART_UPDATE_ITEM", base)).not.toBe(
      createCustomerCommandFingerprint("CART_UPDATE_ITEM", { ...base, quantity: 3 }),
    );
    expect(createCustomerCommandFingerprint("CART_UPDATE_ITEM", base)).not.toBe(
      createCustomerCommandFingerprint("CART_REMOVE_ITEM", {
        cartId: base.cartId,
        cartItemId: base.cartItemId,
      }),
    );
  });

  it("fails closed when fingerprint source cannot be canonicalized", () => {
    expect(() =>
      createCustomerCommandFingerprint("ORDER_SUBMIT", { submittedAt: new Date() }),
    ).toThrowError(CustomerCommandError);
  });
});
