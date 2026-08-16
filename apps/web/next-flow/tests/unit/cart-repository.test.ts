import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import {
  addCartItem,
  clearCart,
  removeCartItem,
  updateCartItem,
} from "@/services/repositories/state-repository";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

const basicLine = {
  menuItemId: "menu-yuzu",
  quantity: 1,
  modifiers: [],
  specialRequest: undefined,
};

describe("cart repository", () => {
  it("creates a cart and appends multiple items without changing another table", () => {
    const initial = createDemoState(referenceDate);
    const first = addCartItem(initial, "table-t06", basicLine);
    const second = addCartItem(first, "table-t06", {
      ...basicLine,
      menuItemId: "menu-gyudon",
      quantity: 2,
    });
    const otherTable = addCartItem(second, "table-t07", basicLine);

    expect(first.carts["table-t06"]?.items).toHaveLength(1);
    expect(second.carts["table-t06"]?.items).toHaveLength(2);
    expect(otherTable.carts["table-t06"]?.items).toEqual(
      second.carts["table-t06"]?.items,
    );
    expect(otherTable.carts["table-t07"]?.items).toHaveLength(1);
    expect(otherTable).not.toBe(second);
    expect(initial.carts["table-t06"]).toBeUndefined();
  });

  it("updates quantity, modifiers, and special request while keeping quantity at least one", () => {
    const added = addCartItem(
      createDemoState(referenceDate),
      "table-t06",
      basicLine,
    );
    const lineId = added.carts["table-t06"]!.items[0].id;
    const updated = updateCartItem(added, "table-t06", lineId, {
      quantity: 3,
      modifiers: [
        {
          modifierGroupId: "modifier-pair-drink",
          modifierChoiceId: "choice-addon-yuzu",
        },
      ],
      specialRequest: "  sauce on the side  ",
    });
    const clamped = updateCartItem(updated, "table-t06", lineId, {
      quantity: 0,
    });

    expect(updated.carts["table-t06"]!.items[0]).toMatchObject({
      quantity: 3,
      modifiers: [
        {
          modifierGroupId: "modifier-pair-drink",
          modifierChoiceId: "choice-addon-yuzu",
        },
      ],
      specialRequest: "  sauce on the side  ",
    });
    expect(clamped.carts["table-t06"]!.items[0].quantity).toBe(1);
  });

  it("preserves cart contents when an unknown line is updated", () => {
    const added = addCartItem(
      createDemoState(referenceDate),
      "table-t06",
      basicLine,
    );
    const beforeItems = added.carts["table-t06"]!.items;
    const result = updateCartItem(added, "table-t06", "missing-line", {
      quantity: 4,
    });

    expect(result.carts["table-t06"]!.items).toEqual(beforeItems);
  });

  it("removes a line and clears only the requested table cart", () => {
    let state = addCartItem(
      createDemoState(referenceDate),
      "table-t06",
      basicLine,
    );
    state = addCartItem(state, "table-t07", basicLine);
    const lineId = state.carts["table-t06"]!.items[0].id;

    const removed = removeCartItem(state, "table-t06", lineId);
    expect(removed.carts["table-t06"]!.items).toHaveLength(0);
    expect(removed.carts["table-t07"]!.items).toHaveLength(1);

    const cleared = clearCart(state, "table-t06");
    expect(cleared.carts["table-t06"]).toBeUndefined();
    expect(cleared.carts["table-t07"]!.items).toHaveLength(1);
  });

  it("updates cart timestamps on cart mutations", () => {
    const added = addCartItem(
      createDemoState(referenceDate),
      "table-t06",
      basicLine,
    );
    const lineId = added.carts["table-t06"]!.items[0].id;
    const updated = updateCartItem(added, "table-t06", lineId, {
      quantity: 2,
    });

    expect(added.carts["table-t06"]!.updatedAt).toBeTruthy();
    expect(updated.carts["table-t06"]!.updatedAt).toBeTruthy();
    expect(new Date(updated.carts["table-t06"]!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(added.carts["table-t06"]!.updatedAt).getTime(),
    );
  });
});
