import { afterAll, describe, expect, it } from "vitest";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import {
  addCustomerCartItem,
  CustomerCommandError,
  removeCustomerCartItem,
  submitCustomerOrder,
  updateCustomerCartItem,
  withCustomerDataTransaction,
} from "@/modules/customer-data/server";
import type { CustomerCommandDependencies } from "@/modules/customer-data/server/commands/runtime";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

const contextA: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000051",
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
  capabilityId: "70000000-0000-4000-8000-000000000052",
});

function dependenciesFor(context: CustomerContext): CustomerCommandDependencies {
  return {
    getCurrentCustomerContext: async () => ({ status: "resolved", context }),
    withCustomerDataTransaction,
  };
}

const depsA = dependenciesFor(contextA);
const depsAOtherCustomer = dependenciesFor(contextAOtherCustomer);

async function createCartWithSeedItem(quantity = 1) {
  return withCustomerDataTransaction(contextA, async ({ repositories }) => {
    const cart = await repositories.carts.createActive();
    return repositories.carts.addItem(cart.id, {
      menuItemId: "00000000-0000-0000-0000-0000000000aa",
      quantity,
      modifierChoiceIds: ["00000000-0000-0000-0000-0000000000a9"],
      specialRequest: "less ice",
    });
  });
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P03/R04 customer command flow",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("orchestrates scoped add, update, and remove mutations", async () => {
      const initial = await withCustomerDataTransaction(contextA, ({ repositories }) =>
        repositories.carts.createActive(),
      );

      const added = await addCustomerCartItem(
        {
          cartId: initial.id,
          menuItemId: "00000000-0000-0000-0000-0000000000aa",
          quantity: 1,
          modifierChoiceIds: ["00000000-0000-0000-0000-0000000000a9"],
          specialRequest: "  no lid  ",
        },
        depsA,
      );
      expect(added.items).toHaveLength(1);
      expect(added.items[0]?.specialRequest).toBe("no lid");

      const updated = await updateCustomerCartItem(
        {
          cartId: initial.id,
          cartItemId: added.items[0]!.id,
          quantity: 3,
        },
        depsA,
      );
      expect(updated.items[0]?.quantity).toBe(3);

      const removed = await removeCustomerCartItem(
        { cartId: initial.id, cartItemId: added.items[0]!.id },
        depsA,
      );
      expect(removed.items).toHaveLength(0);
    });

    it("atomically submits one owned cart from persisted snapshots", async () => {
      const cart = await createCartWithSeedItem(2);
      const order = await submitCustomerOrder(
        { cartId: cart.id, customerNote: "  table side please  " },
        depsA,
      );

      expect(order.status).toBe("PENDING_CONFIRMATION");
      expect(order.customerStatus).toBe("SENT");
      expect(order.sourceCartId).toBe(cart.id);
      expect(order.orderNumber).toMatch(/^FF-[0-9A-F]{12}$/);
      expect(order.subtotalMinor).toBe("25000");
      expect(order.currency).toBe("THB");
      expect(order.submittedAt).toBeInstanceOf(Date);

      const persisted = await withCustomerDataTransaction(contextA, async ({ trx, repositories }) => {
        const convertedCart = await repositories.carts.requireById(cart.id);
        const submittedOrder = await trx
          .selectFrom("foodflow.orders")
          .select([
            "status",
            "customer_status as customerStatus",
            "submitted_at as submittedAt",
            "customer_note as customerNote",
            "submission_key as submissionKey",
          ])
          .where("tenant_id", "=", contextA.tenantId)
          .where("id", "=", order.id)
          .executeTakeFirstOrThrow();
        return { convertedCart, submittedOrder };
      });

      expect(persisted.convertedCart.status).toBe("SUBMITTED");
      expect(persisted.submittedOrder).toMatchObject({
        status: "PENDING_CONFIRMATION",
        customerStatus: "SENT",
        customerNote: "table side please",
        submissionKey: `order:${order.id}`,
      });
      expect(persisted.submittedOrder.submittedAt).not.toBeNull();
    });

    it("rejects empty cart submission without persisting an order", async () => {
      const cart = await withCustomerDataTransaction(contextA, ({ repositories }) =>
        repositories.carts.createActive(),
      );

      await expect(submitCustomerOrder({ cartId: cart.id }, depsA)).rejects.toMatchObject({
        code: "CUSTOMER_COMMAND_CART_EMPTY",
      });

      const count = await withCustomerDataTransaction(contextA, ({ trx }) =>
        trx
          .selectFrom("foodflow.orders")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("tenant_id", "=", contextA.tenantId)
          .where("source_cart_id", "=", cart.id)
          .executeTakeFirstOrThrow(),
      );
      expect(count.count).toBe("0");
    });

    it("does not disclose another capability's cart", async () => {
      const cart = await createCartWithSeedItem();
      await expect(
        submitCustomerOrder({ cartId: cart.id }, depsAOtherCustomer),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_NOT_FOUND" });
    });

    it("rejects a second submission after the cart becomes terminal", async () => {
      const cart = await createCartWithSeedItem();
      await submitCustomerOrder({ cartId: cart.id }, depsA);

      await expect(submitCustomerOrder({ cartId: cart.id }, depsA)).rejects.toBeInstanceOf(
        CustomerCommandError,
      );
      await expect(submitCustomerOrder({ cartId: cart.id }, depsA)).rejects.toMatchObject({
        code: "CUSTOMER_COMMAND_CART_NOT_EDITABLE",
      });
    });
  },
);
