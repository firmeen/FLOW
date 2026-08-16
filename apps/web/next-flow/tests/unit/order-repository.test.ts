import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import { makeOrderItems } from "@/services/repositories/helpers";
import { submitOrder } from "@/services/repositories/order-repository";
import { addCartItem } from "@/services/repositories/state-repository";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");
const saturdayInBangkok = new Date("2026-08-15T05:00:00.000Z");
const mondayInBangkok = new Date("2026-08-17T05:00:00.000Z");

const milk = {
  modifierGroupId: "modifier-milk",
  modifierChoiceId: "choice-milk-oat",
};

describe("order item validation boundary", () => {
  it("creates valid item snapshots with authoritative quantity, modifier price, and special request", () => {
    const state = createDemoState(referenceDate);
    const [item] = makeOrderItems(
      state,
      [
        {
          menuItemId: "menu-uji-matcha",
          quantity: 2,
          modifiers: [milk],
          specialRequest: "  less sweet please  ",
        },
      ],
      referenceDate,
    );

    expect(item).toMatchObject({
      menuItemId: "menu-uji-matcha",
      menuItemName: "Uji Signature Matcha",
      quantity: 2,
      unitPrice: 195,
      lineTotal: 390,
      specialRequest: "less sweet please",
    });
    expect(item.modifiers[0]).toMatchObject({
      modifierGroupId: "modifier-milk",
      modifierGroupName: "Milk Option",
      modifierChoiceId: "choice-milk-oat",
      modifierChoiceName: "Australian Oat Milk",
      priceDelta: 25,
    });
  });

  it("supports multiple items and multiple modifier groups", () => {
    const state = createDemoState(referenceDate);
    const items = makeOrderItems(
      state,
      [
        { menuItemId: "menu-yuzu", quantity: 1 },
        {
          menuItemId: "menu-steak-jaew",
          quantity: 1,
          modifiers: [
            {
              modifierGroupId: "modifier-steak-doneness",
              modifierChoiceId: "choice-doneness-2",
            },
            {
              modifierGroupId: "modifier-pair-drink",
              modifierChoiceId: "choice-addon-yuzu",
            },
          ],
        },
      ],
      referenceDate,
    );

    expect(items).toHaveLength(2);
    expect(items[1].unitPrice).toBe(428);
    expect(items[1].modifiers).toHaveLength(2);
  });

  it.each([
    [0, "zero"],
    [-1, "negative"],
    [1.5, "fractional"],
  ])("rejects %s quantity (%s)", (quantity) => {
    const state = createDemoState(referenceDate);
    expect(() =>
      makeOrderItems(
        state,
        [{ menuItemId: "menu-yuzu", quantity }],
        referenceDate,
      ),
    ).toThrow();
  });

  it("rejects empty orders and unknown menu items", () => {
    const state = createDemoState(referenceDate);
    expect(() => makeOrderItems(state, [], referenceDate)).toThrow();
    expect(() =>
      makeOrderItems(
        state,
        [{ menuItemId: "menu-does-not-exist", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
  });

  it("rejects inactive and sold-out items", () => {
    const state = createDemoState(referenceDate);
    const inactive = {
      ...state,
      menuItems: state.menuItems.map((item) =>
        item.id === "menu-yuzu" ? { ...item, status: "HIDDEN" as const } : item,
      ),
    };

    expect(() =>
      makeOrderItems(
        inactive,
        [{ menuItemId: "menu-yuzu", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
    expect(() =>
      makeOrderItems(
        state,
        [{ menuItemId: "menu-lychee", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
  });

  it("rejects an item whose category is inactive or archived", () => {
    const state = createDemoState(referenceDate);
    const inactiveCategory = {
      ...state,
      categories: state.categories.map((category) =>
        category.id === "cat-drinks" ? { ...category, active: false } : category,
      ),
    };
    const archivedCategory = {
      ...state,
      categories: state.categories.map((category) =>
        category.id === "cat-drinks"
          ? { ...category, archivedAt: referenceDate.toISOString() }
          : category,
      ),
    };

    expect(() =>
      makeOrderItems(
        inactiveCategory,
        [{ menuItemId: "menu-yuzu", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
    expect(() =>
      makeOrderItems(
        archivedCategory,
        [{ menuItemId: "menu-yuzu", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
  });

  it("enforces schedule availability at final validation", () => {
    const state = createDemoState(referenceDate);

    expect(() =>
      makeOrderItems(
        state,
        [{ menuItemId: "menu-beef-ramen", quantity: 1 }],
        mondayInBangkok,
      ),
    ).toThrow();
    expect(
      makeOrderItems(
        state,
        [{ menuItemId: "menu-beef-ramen", quantity: 1 }],
        saturdayInBangkok,
      ),
    ).toHaveLength(1);
  });

  it("rejects missing or inactive availability rules", () => {
    const state = createDemoState(referenceDate);
    const missingRule = {
      ...state,
      menuAvailabilities: state.menuAvailabilities.filter(
        (rule) => rule.id !== "availability-always",
      ),
    };
    const inactiveRule = {
      ...state,
      menuAvailabilities: state.menuAvailabilities.map((rule) =>
        rule.id === "availability-always" ? { ...rule, active: false } : rule,
      ),
    };

    expect(() =>
      makeOrderItems(
        missingRule,
        [{ menuItemId: "menu-yuzu", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
    expect(() =>
      makeOrderItems(
        inactiveRule,
        [{ menuItemId: "menu-yuzu", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow();
  });

  it("rejects a modifier group that is not attached to the menu item", () => {
    const state = createDemoState(referenceDate);

    expect(() =>
      makeOrderItems(
        state,
        [
          {
            menuItemId: "menu-yuzu",
            quantity: 1,
            modifiers: [milk],
          },
        ],
        referenceDate,
      ),
    ).toThrow("does not belong to this item");
  });

  it("rejects an invalid modifier choice and inactive modifier data", () => {
    const state = createDemoState(referenceDate);
    expect(() =>
      makeOrderItems(
        state,
        [
          {
            menuItemId: "menu-uji-matcha",
            quantity: 1,
            modifiers: [
              {
                modifierGroupId: "modifier-milk",
                modifierChoiceId: "choice-missing",
              },
            ],
          },
        ],
        referenceDate,
      ),
    ).toThrow();

    const inactiveGroup = {
      ...state,
      modifierGroups: state.modifierGroups.map((group) =>
        group.id === "modifier-milk" ? { ...group, active: false } : group,
      ),
    };
    expect(() =>
      makeOrderItems(
        inactiveGroup,
        [{ menuItemId: "menu-uji-matcha", quantity: 1, modifiers: [milk] }],
        referenceDate,
      ),
    ).toThrow();

    const inactiveChoice = {
      ...state,
      modifierGroups: state.modifierGroups.map((group) =>
        group.id === "modifier-milk"
          ? {
              ...group,
              choices: group.choices.map((choice) =>
                choice.id === "choice-milk-oat"
                  ? { ...choice, active: false }
                  : choice,
              ),
            }
          : group,
      ),
    };
    expect(() =>
      makeOrderItems(
        inactiveChoice,
        [{ menuItemId: "menu-uji-matcha", quantity: 1, modifiers: [milk] }],
        referenceDate,
      ),
    ).toThrow();
  });

  it("rejects duplicate, missing required, and excessive modifier selections", () => {
    const state = createDemoState(referenceDate);
    expect(() =>
      makeOrderItems(
        state,
        [
          {
            menuItemId: "menu-uji-matcha",
            quantity: 1,
            modifiers: [milk, milk],
          },
        ],
        referenceDate,
      ),
    ).toThrow("cannot be selected twice");

    expect(() =>
      makeOrderItems(
        state,
        [{ menuItemId: "menu-uji-matcha", quantity: 1 }],
        referenceDate,
      ),
    ).toThrow("Milk Option");

    expect(() =>
      makeOrderItems(
        state,
        [
          {
            menuItemId: "menu-gyudon",
            quantity: 1,
            modifiers: [
              {
                modifierGroupId: "modifier-pair-drink",
                modifierChoiceId: "choice-addon-yuzu",
              },
              {
                modifierGroupId: "modifier-pair-drink",
                modifierChoiceId: "choice-addon-lychee",
              },
            ],
          },
        ],
        referenceDate,
      ),
    ).toThrow("Too many selections");
  });

  it("normalizes empty special requests to undefined", () => {
    const state = createDemoState(referenceDate);
    const [item] = makeOrderItems(
      state,
      [
        {
          menuItemId: "menu-yuzu",
          quantity: 1,
          specialRequest: "   ",
        },
      ],
      referenceDate,
    );
    expect(item.specialRequest).toBeUndefined();
  });
});

describe("order submission boundary", () => {
  it("creates the order/session associations, snapshots items, clears only its cart, and audits creation", () => {
    let state = createDemoState(referenceDate);
    state = addCartItem(state, "table-t06", {
      menuItemId: "menu-uji-matcha",
      quantity: 2,
      modifiers: [milk],
      specialRequest: "  no syrup  ",
    });
    state = addCartItem(state, "table-t07", {
      menuItemId: "menu-yuzu",
      quantity: 1,
      modifiers: [],
    });

    const result = submitOrder(state, {
      tableId: "table-t06",
      submissionKey: "submit-regression-001",
      items: [
        {
          menuItemId: "menu-uji-matcha",
          quantity: 2,
          modifiers: [milk],
          specialRequest: "  no syrup  ",
        },
      ],
    });
    const order = result.state.orders.find(
      (candidate) => candidate.id === result.value.orderId,
    )!;
    const session = result.state.tableSessions.find(
      (candidate) => candidate.id === order.tableSessionId,
    )!;

    expect(result.value.duplicate).toBe(false);
    expect(order).toMatchObject({
      tableId: "table-t06",
      status: "PENDING_CONFIRMATION",
      customerStatus: "SENT",
      subtotal: 390,
      submissionKey: "submit-regression-001",
    });
    expect(order.items[0]).toMatchObject({
      menuItemName: "Uji Signature Matcha",
      unitPrice: 195,
      lineTotal: 390,
      specialRequest: "no syrup",
    });
    expect(session.orderIds).toContain(order.id);
    expect(result.state.carts["table-t06"]).toBeUndefined();
    expect(result.state.carts["table-t07"]?.items).toHaveLength(1);
    expect(
      result.state.auditEvents.some(
        (event) => event.action === "ORDER_CREATED" && event.entityId === order.id,
      ),
    ).toBe(true);
  });

  it("preserves the original state and cart when final validation fails", () => {
    let state = createDemoState(referenceDate);
    state = addCartItem(state, "table-t06", {
      menuItemId: "menu-uji-matcha",
      quantity: 1,
      modifiers: [],
    });
    const ordersBefore = state.orders.length;
    const sessionsBefore = state.tableSessions.length;

    expect(() =>
      submitOrder(state, {
        tableId: "table-t06",
        submissionKey: "invalid-required-modifier",
        items: [{ menuItemId: "menu-uji-matcha", quantity: 1 }],
      }),
    ).toThrow();

    expect(state.orders).toHaveLength(ordersBefore);
    expect(state.tableSessions).toHaveLength(sessionsBefore);
    expect(state.carts["table-t06"]?.items).toHaveLength(1);
  });

  it("returns the existing order for a repeated submission key without duplicating session references", () => {
    const state = createDemoState(referenceDate);
    const input = {
      tableId: "table-t06",
      submissionKey: "stable-demo-operation",
      items: [{ menuItemId: "menu-yuzu", quantity: 1 }],
    };

    const first = submitOrder(state, input);
    const repeated = submitOrder(first.state, input);
    const order = first.state.orders.find(
      (candidate) => candidate.id === first.value.orderId,
    )!;
    const session = repeated.state.tableSessions.find(
      (candidate) => candidate.id === order.tableSessionId,
    )!;

    expect(first.value.duplicate).toBe(false);
    expect(repeated.value).toEqual({
      orderId: first.value.orderId,
      duplicate: true,
    });
    expect(repeated.state.orders).toHaveLength(first.state.orders.length);
    expect(session.orderIds.filter((id) => id === order.id)).toHaveLength(1);
  });

  it("freezes price and modifier snapshots after later menu changes", () => {
    const state = createDemoState(referenceDate);
    const result = submitOrder(state, {
      tableId: "table-t06",
      submissionKey: "snapshot-contract",
      items: [
        {
          menuItemId: "menu-uji-matcha",
          quantity: 1,
          modifiers: [milk],
        },
      ],
    });
    const order = result.state.orders.find(
      (candidate) => candidate.id === result.value.orderId,
    )!;
    const mutatedCatalog = {
      ...result.state,
      menuItems: result.state.menuItems.map((item) =>
        item.id === "menu-uji-matcha" ? { ...item, basePrice: 999 } : item,
      ),
      modifierGroups: result.state.modifierGroups.map((group) =>
        group.id === "modifier-milk"
          ? {
              ...group,
              name: "Renamed Milk",
              choices: group.choices.map((choice) =>
                choice.id === "choice-milk-oat"
                  ? { ...choice, name: "Renamed Oat", priceDelta: 99 }
                  : choice,
              ),
            }
          : group,
      ),
    };

    const stored = mutatedCatalog.orders.find(
      (candidate) => candidate.id === order.id,
    )!.items[0];
    expect(stored.unitPrice).toBe(195);
    expect(stored.modifiers[0]).toMatchObject({
      modifierGroupName: "Milk Option",
      modifierChoiceName: "Australian Oat Milk",
      priceDelta: 25,
    });
  });
});
