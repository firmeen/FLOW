import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { issueCustomerCapability } from "@/modules/customer-capability/server/capability-codec";
import { resolveCustomerEntry } from "@/modules/customer-capability/server/entry-resolver";
import type { CustomerContext } from "@/modules/customer-capability/server/types";
import { validateCustomerCapability } from "@/modules/customer-capability/server/validate-customer-capability";
import {
  addCustomerCartItemIdempotent,
  loadCustomerStorefrontSnapshot,
  submitCustomerOrderIdempotent,
  updateCustomerCartItemIdempotent,
  withCustomerDataTransaction,
} from "@/modules/customer-data/server";
import type { CustomerCommandDependencies } from "@/modules/customer-data/server/commands/runtime";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

const SEED_MENU_ITEM_ID = "00000000-0000-0000-0000-0000000000aa";
const SEED_MODIFIER_CHOICE_ID = "00000000-0000-0000-0000-0000000000a9";

const contextA: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000081",
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

const contextAOtherCapability: CustomerContext = Object.freeze({
  ...contextA,
  capabilityId: "70000000-0000-4000-8000-000000000082",
});

const contextB: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000083",
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

function dependenciesFor(context: CustomerContext): CustomerCommandDependencies {
  return {
    getCurrentCustomerContext: async () => ({ status: "resolved", context }),
    withCustomerDataTransaction,
  };
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
  "P03/R06 integrated customer data plane acceptance",
  () => {
    beforeAll(() => {
      process.env.CUSTOMER_CAPABILITY_SECRET =
        "p03-r06-customer-data-plane-acceptance-secret-0001";
    });

    afterAll(async () => {
      delete process.env.CUSTOMER_CAPABILITY_SECRET;
      await destroyDatabaseRuntimeForTests();
    });

    it("proves direct entry -> capability -> immutable context -> scoped storefront read", async () => {
      const resolution = await resolveCustomerEntry("restaurant-a", "T-A1");
      expect(resolution.status).toBe("resolved");
      if (resolution.status !== "resolved") return;

      const issued = issueCustomerCapability(resolution.entry);
      const validated = await validateCustomerCapability(issued.token);
      expect(validated.status).toBe("resolved");
      if (validated.status !== "resolved") return;

      expect(Object.isFrozen(validated.context)).toBe(true);
      expect(Object.keys(validated.context)).not.toContain("actorId");
      expect(Object.keys(validated.context)).not.toContain("permissions");
      expect(validated.context).toMatchObject({
        tenantId: contextA.tenantId,
        restaurantId: contextA.restaurantId,
        branchId: contextA.branchId,
        tableId: contextA.tableId,
      });

      const snapshot = await loadCustomerStorefrontSnapshot(validated.context);
      expect(snapshot.status).toBe("ok");
      if (snapshot.status !== "ok") return;
      expect(snapshot.data.storefront).toMatchObject({
        restaurantName: "Restaurant A",
        branchName: "Branch A1",
        tableCode: "T-A1",
      });
      expect(snapshot.data.menu.items.map((item) => item.name)).toEqual(["Seed Item A"]);
      expect(JSON.stringify(snapshot.data)).not.toContain("Seed Item B");
    });

    it("proves server-authoritative cart snapshots, exact replay, mismatch denial and scope isolation", async () => {
      const depsA = dependenciesFor(contextA);
      const cart = await withCustomerDataTransaction(contextA, ({ repositories }) =>
        repositories.carts.createActive(),
      );
      const key = "10000000-0000-4000-8000-000000000081";
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
      expect(first.data.currency).toBe("THB");
      expect(first.data.subtotalMinor).toBe("25000");
      expect(first.data.items[0]).toMatchObject({
        menuItemName: "Seed Item A",
        unitPriceMinor: "10000",
        quantity: 2,
        specialRequest: "no straw",
      });
      expect(first.data.items[0]?.modifiers[0]).toMatchObject({
        modifierGroupName: "Milk",
        modifierChoiceName: "Oat Milk",
        priceDeltaMinor: "2500",
      });

      await expect(
        addCustomerCartItemIdempotent(
          { ...input, quantity: 3 },
          key,
          depsA,
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_IDEMPOTENCY_MISMATCH" });

      await expect(
        addCustomerCartItemIdempotent(
          {
            cartId: cart.id,
            menuItemId: SEED_MENU_ITEM_ID,
            quantity: 1,
            modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
          },
          "10000000-0000-4000-8000-000000000082",
          dependenciesFor(contextAOtherCapability),
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_NOT_FOUND" });

      await expect(
        addCustomerCartItemIdempotent(
          {
            cartId: cart.id,
            menuItemId: SEED_MENU_ITEM_ID,
            quantity: 1,
            modifierChoiceIds: [SEED_MODIFIER_CHOICE_ID],
          },
          "10000000-0000-4000-8000-000000000083",
          dependenciesFor(contextB),
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_NOT_FOUND" });

      const rowCount = await withCustomerDataTransaction(contextA, ({ trx }) =>
        trx
          .selectFrom("foodflow.cart_items")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("tenant_id", "=", contextA.tenantId)
          .where("cart_id", "=", cart.id)
          .executeTakeFirstOrThrow(),
      );
      expect(rowCount.count).toBe("1");
    });

    it("proves update replay stays deterministic without widening ownership", async () => {
      const depsA = dependenciesFor(contextA);
      const cart = await createPopulatedCart(contextA);
      const itemId = cart.items[0]!.id;
      const key = "10000000-0000-4000-8000-000000000084";

      const first = await updateCustomerCartItemIdempotent(
        { cartId: cart.id, cartItemId: itemId, quantity: 3 },
        key,
        depsA,
      );
      const replay = await updateCustomerCartItemIdempotent(
        { cartId: cart.id, cartItemId: itemId, quantity: 3 },
        key,
        depsA,
      );

      expect(first.replayed).toBe(false);
      expect(replay.replayed).toBe(true);
      expect(replay.data).toEqual(first.data);
      expect(first.data.items[0]?.quantity).toBe(3);

      await expect(
        updateCustomerCartItemIdempotent(
          { cartId: cart.id, cartItemId: itemId, quantity: 4 },
          key,
          depsA,
        ),
      ).rejects.toMatchObject({ code: "CUSTOMER_COMMAND_IDEMPOTENCY_MISMATCH" });
    });

    it("proves atomic submit and ambiguous-response recovery return one durable order", async () => {
      const depsA = dependenciesFor(contextA);
      const cart = await createPopulatedCart(contextA);
      const key = "10000000-0000-4000-8000-000000000085";
      const input = { cartId: cart.id, customerNote: "  table side  " };

      const committed = await submitCustomerOrderIdempotent(input, key, depsA);
      const recovered = await submitCustomerOrderIdempotent(input, key, depsA);

      expect(committed.replayed).toBe(false);
      expect(recovered.replayed).toBe(true);
      expect(recovered.data.id).toBe(committed.data.id);
      expect(recovered.data.orderNumber).toBe(committed.data.orderNumber);
      expect(recovered.data.submittedAt.toISOString()).toBe(
        committed.data.submittedAt.toISOString(),
      );

      const durable = await withCustomerDataTransaction(contextA, async ({ trx, repositories }) => {
        const sourceCart = await repositories.carts.requireById(cart.id);
        const orders = await trx
          .selectFrom("foodflow.orders")
          .select(["id", "status", "customer_status", "source_cart_id"])
          .where("tenant_id", "=", contextA.tenantId)
          .where("source_cart_id", "=", cart.id)
          .execute();
        return { sourceCart, orders };
      });

      expect(durable.sourceCart.status).toBe("SUBMITTED");
      expect(durable.orders).toEqual([
        expect.objectContaining({
          id: committed.data.id,
          source_cart_id: cart.id,
          status: "PENDING_CONFIRMATION",
          customer_status: "SENT",
        }),
      ]);
    });

    it("proves concurrent identical submit requests serialize to one execution and one replay", async () => {
      const cart = await createPopulatedCart(contextA);
      const key = "10000000-0000-4000-8000-000000000086";
      const input = { cartId: cart.id, customerNote: "concurrent submit" };
      const depsA = dependenciesFor(contextA);

      const results = await Promise.all([
        submitCustomerOrderIdempotent(input, key, depsA),
        submitCustomerOrderIdempotent(input, key, depsA),
      ]);

      expect(results.filter((result) => result.replayed)).toHaveLength(1);
      expect(results.filter((result) => !result.replayed)).toHaveLength(1);
      expect(results[0]!.data.id).toBe(results[1]!.data.id);

      const count = await withCustomerDataTransaction(contextA, ({ trx }) =>
        trx
          .selectFrom("foodflow.orders")
          .select((eb) => eb.fn.countAll<string>().as("count"))
          .where("tenant_id", "=", contextA.tenantId)
          .where("source_cart_id", "=", cart.id)
          .executeTakeFirstOrThrow(),
      );
      expect(count.count).toBe("1");
    });

    it("proves customer database authority is transaction-local and excludes staff actor identity", async () => {
      const observed = await withCustomerDataTransaction(contextA, async ({ trx }) => {
        const result = await sql<{
          role_name: string;
          tenant_id: string;
          branch_id: string;
          capability_id: string;
          actor_id: string;
        }>`
          select
            current_user as role_name,
            current_setting('app.tenant_id', true) as tenant_id,
            current_setting('app.branch_id', true) as branch_id,
            current_setting('app.customer_capability_id', true) as capability_id,
            current_setting('app.actor_id', true) as actor_id
        `.execute(trx);
        return result.rows[0];
      });

      expect(observed).toEqual({
        role_name: "flow_customer_runtime",
        tenant_id: contextA.tenantId,
        branch_id: contextA.branchId,
        capability_id: contextA.capabilityId,
        actor_id: "",
      });
    });
  },
);
