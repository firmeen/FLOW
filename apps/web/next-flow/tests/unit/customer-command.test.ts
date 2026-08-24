import { describe, expect, it } from "vitest";

import {
  CustomerCommandError,
  toCustomerCommandError,
} from "@/modules/customer-data/server/commands/errors";
import {
  assertCustomerCommandSameOrigin,
  customerCommandFailure,
} from "@/modules/customer-data/server/commands/http";
import {
  MAX_CUSTOMER_NOTE_LENGTH,
  MAX_SPECIAL_REQUEST_LENGTH,
  normalizeOptionalCommandText,
  requireCommandQuantity,
  requireCommandUuid,
  requireModifierChoiceIds,
} from "@/modules/customer-data/server/commands/validation";
import { CustomerDataError } from "@/modules/customer-data/server/errors";

describe("P03/R04 customer command validation", () => {
  it("rejects invalid selectors and quantity bounds", () => {
    expect(() => requireCommandUuid("not-a-uuid")).toThrow(CustomerCommandError);
    expect(() => requireCommandQuantity(0)).toThrow(CustomerCommandError);
    expect(() => requireCommandQuantity(-1)).toThrow(CustomerCommandError);
    expect(() => requireCommandQuantity(100)).toThrow(CustomerCommandError);
    expect(() => requireCommandQuantity(1.5)).toThrow(CustomerCommandError);
    expect(requireCommandQuantity(99)).toBe(99);
  });

  it("rejects duplicate/excessive modifiers and oversized free text", () => {
    const id = "00000000-0000-0000-0000-000000000001";
    expect(() => requireModifierChoiceIds([id, id])).toThrow(CustomerCommandError);
    expect(() => requireModifierChoiceIds(Array.from({ length: 33 }, () => id))).toThrow(
      CustomerCommandError,
    );
    expect(() =>
      normalizeOptionalCommandText("x".repeat(MAX_SPECIAL_REQUEST_LENGTH + 1), MAX_SPECIAL_REQUEST_LENGTH),
    ).toThrow(CustomerCommandError);
    expect(() =>
      normalizeOptionalCommandText("x".repeat(MAX_CUSTOMER_NOTE_LENGTH + 1), MAX_CUSTOMER_NOTE_LENGTH),
    ).toThrow(CustomerCommandError);
    expect(normalizeOptionalCommandText("  note  ", MAX_CUSTOMER_NOTE_LENGTH)).toBe("note");
  });

  it("maps storage and database failures without leaking raw details", async () => {
    expect(
      toCustomerCommandError(new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND")).code,
    ).toBe("CUSTOMER_COMMAND_NOT_FOUND");
    expect(
      toCustomerCommandError(new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION")).code,
    ).toBe("CUSTOMER_COMMAND_CONFLICT");

    const raw = Object.assign(new Error("duplicate orders_one_per_source_cart"), {
      code: "23505",
      constraint: "orders_one_per_source_cart",
    });
    const response = customerCommandFailure(raw);
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: { code: "CUSTOMER_COMMAND_CONFLICT" },
    });
  });

  it("rejects cross-origin mutation requests", () => {
    const request = new Request("https://flow.test/api/customer/cart", {
      method: "POST",
      headers: { origin: "https://attacker.test" },
    });
    expect(() => assertCustomerCommandSameOrigin(request)).toThrow(CustomerCommandError);
  });
});
