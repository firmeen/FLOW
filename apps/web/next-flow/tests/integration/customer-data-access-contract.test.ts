import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
import {
  loadCustomerStorefrontSnapshot,
  withCustomerDataTransaction,
} from "@/modules/customer-data/server";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";
import { withTenantTransaction } from "@/server/db/transaction";

const contextA: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000021",
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

const contextB: CustomerContext = Object.freeze({
  capabilityId: "70000000-0000-4000-8000-000000000022",
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

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P03/R02 customer data access contract",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("sets customer role and authority transaction-locally without a staff actor", async () => {
      const observed = await withCustomerDataTransaction(contextA, async ({ trx }) => {
        const result = await sql<{
          role_name: string;
          tenant_id: string;
          restaurant_id: string;
          branch_id: string;
          table_id: string;
          capability_id: string;
          actor_id: string;
        }>`
          select
            current_user as role_name,
            current_setting('app.tenant_id', true) as tenant_id,
            current_setting('app.restaurant_id', true) as restaurant_id,
            current_setting('app.branch_id', true) as branch_id,
            current_setting('app.table_id', true) as table_id,
            current_setting('app.customer_capability_id', true) as capability_id,
            current_setting('app.actor_id', true) as actor_id
        `.execute(trx);
        return result.rows[0];
      });

      expect(observed).toEqual({
        role_name: "flow_customer_runtime",
        tenant_id: contextA.tenantId,
        restaurant_id: contextA.restaurantId,
        branch_id: contextA.branchId,
        table_id: contextA.tableId,
        capability_id: contextA.capabilityId,
        actor_id: "",
      });
    });

    it("returns customer-safe storefront and menu views for each tenant only", async () => {
      const [snapshotA, snapshotB] = await Promise.all([
        loadCustomerStorefrontSnapshot(contextA),
        loadCustomerStorefrontSnapshot(contextB),
      ]);

      expect(snapshotA.status).toBe("ok");
      expect(snapshotB.status).toBe("ok");
      if (snapshotA.status !== "ok" || snapshotB.status !== "ok") return;

      expect(snapshotA.data.storefront).toMatchObject({
        restaurantName: "Restaurant A",
        branchName: "Branch A1",
        tableCode: "T-A1",
      });
      expect(snapshotA.data.menu.categories.map((category) => category.name)).toEqual([
        "Seed Category A",
      ]);
      expect(snapshotA.data.menu.items.map((item) => item.name)).toEqual(["Seed Item A"]);
      expect(snapshotA.data.menu.items[0]?.basePriceMinor).toBe("10000");
      expect(snapshotA.data.menu.items[0]?.modifierGroups[0]?.choices[0]).toMatchObject({
        name: "Oat Milk",
        priceDeltaMinor: "2500",
      });

      expect(snapshotB.data.storefront).toMatchObject({
        restaurantName: "Restaurant B",
        branchName: "Branch B1",
        tableCode: "T-B1",
      });
      expect(snapshotB.data.menu.items.map((item) => item.name)).toEqual(["Seed Item B"]);
      expect(JSON.stringify(snapshotA.data)).not.toContain("Seed Item B");
      expect(JSON.stringify(snapshotB.data)).not.toContain("Seed Item A");
      expect(JSON.stringify(snapshotA.data)).not.toContain("membership");
    });

    it("fails closed when trusted scope fields contradict one another", async () => {
      const forged = Object.freeze({
        ...contextA,
        restaurantId: contextB.restaurantId,
      });
      await expect(loadCustomerStorefrontSnapshot(forged)).resolves.toEqual({
        status: "unavailable",
      });
    });

    it("clears customer scope on rollback before the next tenant transaction", async () => {
      await expect(
        withCustomerDataTransaction(contextA, async ({ trx }) => {
          const result = await sql<{ tenant_id: string }>`
            select current_setting('app.tenant_id', true) as tenant_id
          `.execute(trx);
          expect(result.rows[0]?.tenant_id).toBe(contextA.tenantId);
          throw new Error("deliberate rollback");
        }),
      ).rejects.toThrow("deliberate rollback");

      const next = await withCustomerDataTransaction(contextB, async ({ trx }) => {
        const result = await sql<{ tenant_id: string; role_name: string }>`
          select
            current_setting('app.tenant_id', true) as tenant_id,
            current_user as role_name
        `.execute(trx);
        return result.rows[0];
      });
      expect(next).toEqual({
        tenant_id: contextB.tenantId,
        role_name: "flow_customer_runtime",
      });
    });

    it("keeps staff and customer transaction roles separate on the shared pool", async () => {
      const staffRole = await withTenantTransaction(
        {
          tenantId: contextA.tenantId,
          branchId: contextA.branchId,
          actorId: "30000000-0000-4000-8000-0000000000a2",
        },
        async (trx) => {
          const result = await sql<{ role_name: string }>`select current_user as role_name`.execute(
            trx,
          );
          return result.rows[0]?.role_name;
        },
      );
      const customerRole = await withCustomerDataTransaction(contextA, async ({ trx }) => {
        const result = await sql<{ role_name: string; actor_id: string }>`
          select current_user as role_name, current_setting('app.actor_id', true) as actor_id
        `.execute(trx);
        return result.rows[0];
      });

      expect(staffRole).toBe("flow_runtime");
      expect(customerRole).toEqual({
        role_name: "flow_customer_runtime",
        actor_id: "",
      });

      const { db } = getDatabaseRuntime();
      const outside = await sql<{ role_name: string }>`select current_user as role_name`.execute(db);
      expect(outside.rows[0]?.role_name).not.toBe("flow_customer_runtime");
    });
  },
);
