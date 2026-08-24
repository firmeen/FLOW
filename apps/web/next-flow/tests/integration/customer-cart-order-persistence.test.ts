import { afterAll, describe, expect, it } from "vitest";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import {
  CustomerDataError,
  withCustomerDataTransaction,
  type CustomerCartAggregate,
  type PersistDraftOrderInput,
} from "@/modules/customer-data/server";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

const contextA: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000031",
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

const contextAOtherCustomer: CustomerContext = Object.freeze({
  ...contextA,
  capabilityId: "70000000-0000-4000-8000-000000000032",
});

const contextB: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000033",
  tenantId: "00000000-0000-0000-0000-0000000000b1",
  restaurantId: "00000000-0000-0000-0000-0000000000b2",
  restaurantSlug: "restaurant-b",
  restaurantName: "Restaurant B",
  branchId: "00000000-0000-0000-0000-0000000000b3",
  branchName: "Branch B1",
  tableId: "00000000-0000-0000-0000-0000000000b5",
  tableCode: "T-B1",
  tableLabel: "Table B1",
  tableSessionId: null,
  issuedAt: 2_000_000_000,
  expiresAt: 2_000_014_400,
  version: 1,
});

function draftInputFromCart(cart: CustomerCartAggregate): PersistDraftOrderInput {
  return Object.freeze({
    sourceCartId: cart.id,
    customerNote: "No straw",
    items: cart.items.map((item) =>
      Object.freeze({
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemThaiName: item.menuItemThaiName,
        preparationStation: item.preparationStation,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        currency: item.currency,
        specialRequest: item.specialRequest,
        modifiers: item.modifiers.map((modifier) =>
          Object.freeze({
            modifierGroupId: modifier.modifierGroupId,
            modifierChoiceId: modifier.modifierChoiceId,
            modifierGroupName: modifier.modifierGroupName,
            modifierChoiceName: modifier.modifierChoiceName,
            priceDeltaMinor: modifier.priceDeltaMinor,
          }),
        ),
      }),
    ),
  });
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P03/R03 customer cart and order persistence",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("persists an owned cart with server-snapshotted item and modifier pricing", async () => {
      const cart = await withCustomerDataTransaction(contextA, async ({ repositories }) => {
        const created = await repositories.carts.createActive();
        return repositories.carts.addItem(created.id, {
          menuItemId: "00000000-0000-0000-0000-0000000000aa",
          quantity: 2,
          specialRequest: "  less ice  ",
          modifierChoiceIds: ["00000000-0000-0000-0000-0000000000a9"],
        });
      });

      expect(cart.status).toBe("DRAFT");
      expect(cart.currency).toBe("THB");
      expect(cart.subtotalMinor).toBe("25000");
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toMatchObject({
        menuItemName: "Seed Item A",
        quantity: 2,
        unitPriceMinor: "10000",
        specialRequest: "less ice",
        lineTotalMinor: "25000",
      });
      expect(cart.items[0]?.modifiers[0]).toMatchObject({
        modifierGroupName: "Milk",
        modifierChoiceName: "Oat Milk",
        priceDeltaMinor: "2500",
      });
    });

    it("treats same-table carts from another capability and another tenant as inaccessible", async () => {
      const cartId = await withCustomerDataTransaction(contextA, async ({ repositories }) => {
        const cart = await repositories.carts.createActive();
        return cart.id;
      });

      await expect(
        withCustomerDataTransaction(contextAOtherCustomer, ({ repositories }) =>
          repositories.carts.findById(cartId),
        ),
      ).resolves.toBeNull();

      await expect(
        withCustomerDataTransaction(contextB, ({ repositories }) =>
          repositories.carts.findById(cartId),
        ),
      ).resolves.toBeNull();
    });

    it("rejects modifier choices that are outside the selected menu item relationship", async () => {
      await expect(
        withCustomerDataTransaction(contextA, async ({ repositories }) => {
          const cart = await repositories.carts.createActive();
          await repositories.carts.addItem(cart.id, {
            menuItemId: "00000000-0000-0000-0000-0000000000aa",
            quantity: 1,
            modifierChoiceIds: ["00000000-0000-0000-0000-0000000000b9"],
          });
        }),
      ).rejects.toBeInstanceOf(CustomerDataError);
    });

    it("rolls back cart and item persistence atomically", async () => {
      let cartId: string | null = null;
      await expect(
        withCustomerDataTransaction(contextA, async ({ repositories }) => {
          const cart = await repositories.carts.createActive();
          cartId = cart.id;
          await repositories.carts.addItem(cart.id, {
            menuItemId: "00000000-0000-0000-0000-0000000000aa",
            quantity: 1,
          });
          throw new Error("rollback R03 persistence");
        }),
      ).rejects.toThrow("rollback R03 persistence");

      expect(cartId).not.toBeNull();
      await expect(
        withCustomerDataTransaction(contextA, ({ repositories }) =>
          repositories.carts.findById(cartId!),
        ),
      ).resolves.toBeNull();
    });

    it("persists one DRAFT order with immutable item/modifier snapshots from an owned cart", async () => {
      const result = await withCustomerDataTransaction(contextA, async ({ repositories }) => {
        const cart = await repositories.carts.createActive();
        const populated = await repositories.carts.addItem(cart.id, {
          menuItemId: "00000000-0000-0000-0000-0000000000aa",
          quantity: 2,
          modifierChoiceIds: ["00000000-0000-0000-0000-0000000000a9"],
        });
        const order = await repositories.orders.persistDraft(draftInputFromCart(populated));
        return { cart: populated, order };
      });

      expect(result.order.status).toBe("DRAFT");
      expect(result.order.sourceCartId).toBe(result.cart.id);
      expect(result.order.subtotalMinor).toBe("25000");
      expect(result.order.currency).toBe("THB");
      expect(result.order.tableSessionId).toBeNull();
      expect(result.order.items).toHaveLength(1);
      expect(result.order.items[0]).toMatchObject({
        menuItemName: "Seed Item A",
        quantity: 2,
        unitPriceMinor: "10000",
        lineTotalMinor: "25000",
      });
      expect(result.order.items[0]?.modifiers[0]).toMatchObject({
        modifierGroupName: "Milk",
        modifierChoiceName: "Oat Milk",
        priceDeltaMinor: "2500",
      });
    });

    it("prevents one source cart from being persisted as more than one order", async () => {
      await expect(
        withCustomerDataTransaction(contextA, async ({ repositories }) => {
          const cart = await repositories.carts.createActive();
          const populated = await repositories.carts.addItem(cart.id, {
            menuItemId: "00000000-0000-0000-0000-0000000000aa",
            quantity: 1,
          });
          const input = draftInputFromCart(populated);
          await repositories.orders.persistDraft(input);
          await repositories.orders.persistDraft(input);
        }),
      ).rejects.toBeTruthy();
    });

    it("makes terminal cart state storage-only and prevents later item mutation", async () => {
      await expect(
        withCustomerDataTransaction(contextA, async ({ repositories }) => {
          const cart = await repositories.carts.createActive();
          const populated = await repositories.carts.addItem(cart.id, {
            menuItemId: "00000000-0000-0000-0000-0000000000aa",
            quantity: 1,
          });
          await repositories.carts.markConverted(populated.id);
          await repositories.carts.updateItemQuantity(
            populated.id,
            populated.items[0]!.id,
            2,
          );
        }),
      ).rejects.toBeInstanceOf(CustomerDataError);
    });
  },
);
