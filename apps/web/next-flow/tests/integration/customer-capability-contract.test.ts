import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  issueCustomerCapability,
  verifyCustomerCapability,
} from "@/modules/customer-capability/server/capability-codec";
import { resolveCustomerEntry } from "@/modules/customer-capability/server/entry-resolver";
import { validateCustomerCapabilityScope } from "@/modules/customer-capability/server/repository";
import type { CustomerCapabilityClaims } from "@/modules/customer-capability/server/types";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

const ids = {
  tenantA: "00000000-0000-0000-0000-0000000000a1",
  restaurantA: "00000000-0000-0000-0000-0000000000a2",
  branchA1: "00000000-0000-0000-0000-0000000000a3",
  branchA2: "00000000-0000-0000-0000-0000000000ac",
  tableA1: "00000000-0000-0000-0000-0000000000a5",
  tenantB: "00000000-0000-0000-0000-0000000000b1",
  tableSession: "70000000-0000-4000-8000-000000000002",
} as const;

function withClaim(
  claims: CustomerCapabilityClaims,
  patch: Partial<CustomerCapabilityClaims>,
): CustomerCapabilityClaims {
  return { ...claims, ...patch };
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P03/R01 customer capability database contract",
  () => {
    beforeAll(() => {
      process.env.CUSTOMER_CAPABILITY_SECRET =
        "p03-r01-customer-capability-integration-secret-0001";
    });

    afterAll(async () => {
      delete process.env.CUSTOMER_CAPABILITY_SECRET;
      await destroyDatabaseRuntimeForTests();
    });

    it("resolves one active public entry and binds the signed scope to server IDs", async () => {
      const resolution = await resolveCustomerEntry("restaurant-a", "T-A1");
      expect(resolution.status).toBe("resolved");
      if (resolution.status !== "resolved") return;

      expect(resolution.entry).toMatchObject({
        tenantId: ids.tenantA,
        restaurantId: ids.restaurantA,
        branchId: ids.branchA1,
        tableId: ids.tableA1,
        restaurantSlug: "restaurant-a",
        tableCode: "T-A1",
      });

      const issued = issueCustomerCapability(resolution.entry, 2_000_000_000);
      const verified = verifyCustomerCapability(issued.token, 2_000_000_001);
      expect(verified.status).toBe("valid");
      if (verified.status !== "valid") return;

      await expect(validateCustomerCapabilityScope(verified.claims)).resolves.toMatchObject({
        tenantId: ids.tenantA,
        branchId: ids.branchA1,
        tableId: ids.tableA1,
      });
    });

    it("denies sibling-branch and cross-tenant scope substitution", async () => {
      const resolution = await resolveCustomerEntry("restaurant-a", "T-A1");
      expect(resolution.status).toBe("resolved");
      if (resolution.status !== "resolved") return;
      const claims = issueCustomerCapability(resolution.entry, 2_000_000_000).claims;

      await expect(
        validateCustomerCapabilityScope(withClaim(claims, { branchId: ids.branchA2 })),
      ).resolves.toBeNull();
      await expect(
        validateCustomerCapabilityScope(withClaim(claims, { tenantId: ids.tenantB })),
      ).resolves.toBeNull();
    });

    it("revokes effective capability use when the table becomes inactive", async () => {
      const resolution = await resolveCustomerEntry("restaurant-a", "T-A1");
      expect(resolution.status).toBe("resolved");
      if (resolution.status !== "resolved") return;
      const claims = issueCustomerCapability(resolution.entry, 2_000_000_000).claims;
      const { db } = getDatabaseRuntime();

      try {
        await db
          .updateTable("foodflow.restaurant_tables")
          .set({ active: false })
          .where("id", "=", ids.tableA1)
          .execute();

        await expect(validateCustomerCapabilityScope(claims)).resolves.toBeNull();
        await expect(resolveCustomerEntry("restaurant-a", "T-A1")).resolves.toEqual({
          status: "invalid",
        });
      } finally {
        await db
          .updateTable("foodflow.restaurant_tables")
          .set({ active: true })
          .where("id", "=", ids.tableA1)
          .execute();
      }
    });

    it("binds an active table session and revokes it immediately after closure", async () => {
      const { db } = getDatabaseRuntime();
      await db
        .insertInto("foodflow.table_sessions")
        .values({
          id: ids.tableSession,
          tenant_id: ids.tenantA,
          branch_id: ids.branchA1,
          table_id: ids.tableA1,
          session_number: "P03-R01-TEST-SESSION",
          status: "ACTIVE",
          guest_count: 1,
        })
        .execute();

      try {
        const resolution = await resolveCustomerEntry("restaurant-a", "T-A1");
        expect(resolution.status).toBe("resolved");
        if (resolution.status !== "resolved") return;
        expect(resolution.entry.tableSessionId).toBe(ids.tableSession);

        const claims = issueCustomerCapability(resolution.entry, 2_000_000_000).claims;
        await expect(validateCustomerCapabilityScope(claims)).resolves.toMatchObject({
          tableSessionId: ids.tableSession,
        });

        await db
          .updateTable("foodflow.table_sessions")
          .set({ status: "CLOSED", closed_at: new Date() })
          .where("id", "=", ids.tableSession)
          .execute();

        await expect(validateCustomerCapabilityScope(claims)).resolves.toBeNull();
      } finally {
        await db
          .deleteFrom("foodflow.table_sessions")
          .where("id", "=", ids.tableSession)
          .execute();
      }
    });

    it("returns one generic invalid state for unknown public selectors", async () => {
      await expect(resolveCustomerEntry("restaurant-a", "UNKNOWN")).resolves.toEqual({
        status: "invalid",
      });
      await expect(resolveCustomerEntry("restaurant-b", "T-A1")).resolves.toEqual({
        status: "invalid",
      });
    });
  },
);
