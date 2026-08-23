import { afterAll, describe, expect, it } from "vitest";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import {
  addCustomerCartItem,
  submitCustomerOrder,
  withCustomerDataTransaction,
} from "@/modules/customer-data/server";
import type { CustomerCommandDependencies } from "@/modules/customer-data/server/commands/runtime";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

const context: CustomerContext = Object.freeze({
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

const dependencies: CustomerCommandDependencies = {
  getCurrentCustomerContext: async () => ({ status: "resolved", context }),
  withCustomerDataTransaction,
};

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P03/R04 modifier command validation",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("rejects add intent missing a currently required modifier", async () => {
      const cart = await withCustomerDataTransaction(context, ({ repositories }) =>
        repositories.carts.createActive(),
      );

      await expect(
        addCustomerCartItem(
          {
            cartId: cart.id,
            menuItemId: "00000000-0000-0000-0000-0000000000aa",
            quantity: 1,
            modifierChoiceIds: [],
          },
          dependencies,
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_INVALID_INPUT" });
    });

    it("rejects submission of a legacy/incomplete DRAFT cart", async () => {
      const cart = await withCustomerDataTransaction(context, async ({ repositories }) => {
        const created = await repositories.carts.createActive();
        return repositories.carts.addItem(created.id, {
          menuItemId: "00000000-0000-0000-0000-0000000000aa",
          quantity: 1,
          modifierChoiceIds: [],
        });
      });

      await expect(submitCustomerOrder({ cartId: cart.id }, dependencies)).rejects.toMatchObject({
        code: "CUSTOMER_COMMAND_ITEM_UNAVAILABLE",
      });
    });
  },
);
