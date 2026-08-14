import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import { makeOrderItems } from "@/services/repositories/helpers";
import { submitOrder } from "@/services/repositories/order-repository";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

describe("demo order boundary", () => {
  it("rejects a modifier group that is not attached to the menu item", () => {
    const state = createDemoState(referenceDate);

    expect(() =>
      makeOrderItems(state, [
        {
          menuItemId: "menu-yuzu",
          quantity: 1,
          modifiers: [
            {
              modifierGroupId: "modifier-milk",
              modifierChoiceId: "choice-milk-oat",
            },
          ],
        },
      ]),
    ).toThrow("does not belong to this item");
  });

  it("rejects a duplicate modifier choice", () => {
    const state = createDemoState(referenceDate);
    const duplicateChoice = {
      modifierGroupId: "modifier-milk",
      modifierChoiceId: "choice-milk-oat",
    };

    expect(() =>
      makeOrderItems(state, [
        {
          menuItemId: "menu-uji-matcha",
          quantity: 1,
          modifiers: [duplicateChoice, duplicateChoice],
        },
      ]),
    ).toThrow("cannot be selected twice");
  });

  it("returns the existing order for a repeated demo submission key", () => {
    const state = createDemoState(referenceDate);
    const input = {
      tableId: "table-t06",
      submissionKey: "stable-demo-operation",
      items: [{ menuItemId: "menu-yuzu", quantity: 1 }],
    };

    const first = submitOrder(state, input);
    const repeated = submitOrder(first.state, input);

    expect(first.value.duplicate).toBe(false);
    expect(repeated.value).toEqual({
      orderId: first.value.orderId,
      duplicate: true,
    });
    expect(repeated.state.orders).toHaveLength(first.state.orders.length);
  });
});
