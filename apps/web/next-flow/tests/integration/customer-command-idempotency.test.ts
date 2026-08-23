import { afterAll, describe, expect, it } from "vitest";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import {
  addCustomerCartItemIdempotent,
  removeCustomerCartItemIdempotent,
  submitCustomerOrderIdempotent,
  withCustomerDataTransaction,
} from "@/modules/customer-data/server";
import type { CustomerCommandDependencies } from "@/modules/customer-data/server/commands/runtime";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

const SEED_MENU_ITEM_ID = "00000000-0000-0000-0000-0000000000aa";
const SEED_MODIFIER_CHOICE_ID = "00000000-0000-0000-0000-0000000000a9";

const contextA: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000071",
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
  capabilityId: "70000000-0000-4000-8000-000000000072",
});

function dependenciesFor(context: CustomerContext): CustomerCommandDependencies {
  return {
    getCurrentCustomerContext: async () => ({ status: "resolved", context }),
    withCustomerDataTransaction,
  };
}

const depsA = dependenciesFor(contextA);
const depsOther = dependenciesFor(contextAOtherCustomer);

async function createEmptyCart(context: CustomerContext) {
  return withCustomerDataTransaction(context, ({ repositories }) =>
    repositories.carts.createActive(),
  );
}

async function createPopulatedCart(context: CustomerContext) {
  return withCustomerDataTransaction(context, async ({ repositories }) => {
    const cart = await repositories.carts.createActive();
    return repositories.carts.addItem(cart.id, {
      menuItemId: SEED_MENU_ITEM_ID,
      quantity: 1,
      modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
      specialRequest: "less ice",
    });
  });
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P03/R05 customer command idempotency and replay",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("executes one add mutation and replays the original result", async () => {
      const cart = await createEmptyCart(contextA);
      const key = "10000000-0000-4000-8000-000000000011";
      const input = {
        cartId: cart.id,
        menuItemId: SEED_MENU_ITEM_ID,
        quantity: 2,
        modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
        specialRequest: "  no straw  ",
      };

      const first = await addCustomerCartItemIdempotent(input, key, depsA);
      const replay = await addCustomerCartItemIdempotent(input, key, depsA);

      expect(first.replayed).toBe(false);
      expect(replay.replayed).toBe(true);
      expect(replay.data).toEqual(first.data);

      const count = await withCustomerDataTransaction(contextA, ({ trx }) =>
        trx
          .selectFrom("foodflow.cart_items")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("tenant_id", "=", contextA.tenantId)
          .where("cart_id", "=", cart.id)
          .executeTakeFirstOrThrow(),
      );
      expect(count.count).toBe("1");
    });

    it("rejects the same request identity when the semantic payload changes", async () => {
      const cart = await createEmptyCart(contextA);
      const key = "10000000-0000-4000-8000-000000000012";
      await addCustomerCartItemIdempotent(
        {
          cartId: cart.id,
          menuItemId: SEED_MENU_ITEM_ID,
          quantity: 1,
          modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
        },
        key,
        depsA,
      );

      await expect(
        addCustomerCartItemIdempotent(
          {
            cartId: cart.id,
            menuItemId: SEED_MENU_ITEM_ID,
            quantity: 2,
            modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
          },
          key,
          depsA,
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_IDEMPOTENCY_MISMATCH" });
    });

    it("replays a successful remove after the item no longer exists", async () => {
      const cart = await createPopulatedCart(contextA);
      const itemId = cart.items[0]!.id;
      const key = "10000000-0000-4000-8000-000000000013";

      const first = await removeCustomerCartItemIdempotent(
        { cartId: cart.id, cartItemId: itemId },
        key,
        depsA,
      );
      const replay = await removeCustomerCartItemIdempotent(
        { cartId: cart.id, cartItemId: itemId },
        key,
        depsA,
      );

      expect(first.data.items).toHaveLength(0);
      expect(replay.replayed).toBe(true);
      expect(replay.data).toEqual(first.data);

      await expect(
        removeCustomerCartItemIdempotent(
          { cartId: cart.id, cartItemId: itemId },
          "10000000-0000-4000-8000-000000000014",
          depsA,
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_NOT_FOUND" });
    });

    it("recovers a committed submit result after an ambiguous response loss", async () => {
      const cart = await createPopulatedCart(contextA);
      const key = "10000000-0000-4000-8000-000000000015";
      const input = { cartId: cart.id, customerNote: "  window side  " };

      // The first logical result is intentionally ignored to model an HTTP response
      // disappearing after the database transaction commits.
      const committed = await submitCustomerOrderIdempotent(input, key, depsA);
      const recovered = await submitCustomerOrderIdempotent(input, key, depsA);

      expect(committed.replayed).toBe(false);
      expect(recovered.replayed).toBe(true);
      expect(recovered.data.id).toBe(committed.data.id);
      expect(recovered.data.orderNumber).toBe(committed.data.orderNumber);
      expect(recovered.data.submittedAt.toISOString()).toBe(
        committed.data.submittedAt.toISOString(),
      );

      const state = await withCustomerDataTransaction(contextA, async ({ trx, repositories }) => {
        const converted = await repositories.carts.requireById(cart.id);
        const orders = await trx
          .selectFrom("foodflow.orders")
          .select(["id", "status"])
          .where("tenant_id", "=", contextA.tenantId)
          .where("source_cart_id", "=", cart.id)
          .execute();
        return { converted, orders };
      });
      expect(state.converted.status).toBe("SUBMITTED");
      expect(state.orders).toEqual([
        expect.objectContaining({ id: committed.data.id, status: "PENDING_CONFIRMATION" }),
      ]);
    });

    it("serializes two concurrent identical first-use requests to one mutation", async () => {
      const cart = await createEmptyCart(contextA);
      const key = "10000000-0000-4000-8000-000000000016";
      const input = {
        cartId: cart.id,
        menuItemId: SEED_MENU_ITEM_ID,
        quantity: 1,
        modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
      };

      const results = await Promise.all([
        addCustomerCartItemIdempotent(input, key, depsA),
        addCustomerCartItemIdempotent(input, key, depsA),
      ]);
      expect(results.filter((result) => result.replayed)).toHaveLength(1);
      expect(results.filter((result) => !result.replayed)).toHaveLength(1);

      const count = await withCustomerDataTransaction(contextA, ({ trx }) =>
        trx
          .selectFrom("foodflow.cart_items")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("tenant_id", "=", contextA.tenantId)
          .where("cart_id", "=", cart.id)
          .executeTakeFirstOrThrow(),
      );
      expect(count.count).toBe("1");
    });

    it("scopes the same raw key independently to different capabilities", async () => {
      const cartA = await createEmptyCart(contextA);
      const cartB = await createEmptyCart(contextAOtherCustomer);
      const key = "10000000-0000-4000-8000-000000000017";

      const [resultA, resultB] = await Promise.all([
        addCustomerCartItemIdempotent(
          {
            cartId: cartA.id,
            menuItemId: SEED_MENU_ITEM_ID,
            quantity: 1,
            modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
          },
          key,
          depsA,
        ),
        addCustomerCartItemIdempotent(
          {
            cartId: cartB.id,
            menuItemId: SEED_MENU_ITEM_ID,
            quantity: 1,
            modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
          },
          key,
          depsOther,
        ),
      ]);

      expect(resultA.replayed).toBe(false);
      expect(resultB.replayed).toBe(false);
      expect(resultA.data.id).toBe(cartA.id);
      expect(resultB.data.id).toBe(cartB.id);
    });
  },
);
