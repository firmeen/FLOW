import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { issueCustomerCapability } from "@/modules/customer-capability/server/capability-codec";
import { resolveCustomerEntry } from "@/modules/customer-capability/server/entry-resolver";
import { validateCustomerCapabilityScope } from "@/modules/customer-capability/server/repository";
import type { CustomerCapabilityClaims } from "@/modules/customer-capability/server/types";
import { validateCustomerCapability } from "@/modules/customer-capability/server/validate-customer-capability";
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
  revocationTable: "70000000-0000-4000-8000-000000000010",
  sessionTable: "70000000-0000-4000-8000-000000000011",
  tableSession: "70000000-0000-4000-8000-000000000012",
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

    it("resolves one active public entry and returns immutable server-authoritative context", async () => {
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

      const issued = issueCustomerCapability(resolution.entry);
      const validated = await validateCustomerCapability(issued.token);
      expect(validated.status).toBe("resolved");
      if (validated.status !== "resolved") return;
      expect(validated.context).toMatchObject({
        tenantId: ids.tenantA,
        restaurantId: ids.restaurantA,
        branchId: ids.branchA1,
        tableId: ids.tableA1,
        restaurantSlug: "restaurant-a",
        tableCode: "T-A1",
      });
      expect(Object.isFrozen(validated.context)).toBe(true);
      expect(Object.keys(validated.context)).not.toContain("actorId");
      expect(Object.keys(validated.context)).not.toContain("permissions");
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

    it("revokes effective capability use when its table becomes inactive", async () => {
      const { db } = getDatabaseRuntime();
      await db
        .insertInto("foodflow.restaurant_tables")
        .values({
          id: ids.revocationTable,
          tenant_id: ids.tenantA,
          branch_id: ids.branchA1,
          code: "P03-R01-REVOKE",
          label: "P03 R01 Revocation Table",
          seats: 1,
          qr_code: "test://p03-r01-revoke",
          active: true,
        })
        .execute();

      try {
        const resolution = await resolveCustomerEntry("restaurant-a", "P03-R01-REVOKE");
        expect(resolution.status).toBe("resolved");
        if (resolution.status !== "resolved") return;
        const claims = issueCustomerCapability(resolution.entry, 2_000_000_000).claims;

        await db
          .updateTable("foodflow.restaurant_tables")
          .set({ active: false })
          .where("id", "=", ids.revocationTable)
          .execute();

        await expect(validateCustomerCapabilityScope(claims)).resolves.toBeNull();
        await expect(
          resolveCustomerEntry("restaurant-a", "P03-R01-REVOKE"),
        ).resolves.toEqual({ status: "invalid" });
      } finally {
        await db
          .deleteFrom("foodflow.restaurant_tables")
          .where("id", "=", ids.revocationTable)
          .execute();
      }
    });

    it("revokes table-only scope when a session opens and revokes session scope on closure", async () => {
      const { db } = getDatabaseRuntime();
      await db
        .insertInto("foodflow.restaurant_tables")
        .values({
          id: ids.sessionTable,
          tenant_id: ids.tenantA,
          branch_id: ids.branchA1,
          code: "P03-R01-SESSION",
          label: "P03 R01 Session Table",
          seats: 1,
          qr_code: "test://p03-r01-session",
          active: true,
        })
        .execute();

      try {
        const tableOnlyResolution = await resolveCustomerEntry(
          "restaurant-a",
          "P03-R01-SESSION",
        );
        expect(tableOnlyResolution.status).toBe("resolved");
        if (tableOnlyResolution.status !== "resolved") return;
        expect(tableOnlyResolution.entry.tableSessionId).toBeNull();
        const tableOnlyClaims = issueCustomerCapability(
          tableOnlyResolution.entry,
          2_000_000_000,
        ).claims;

        await db
          .insertInto("foodflow.table_sessions")
          .values({
            id: ids.tableSession,
            tenant_id: ids.tenantA,
            branch_id: ids.branchA1,
            table_id: ids.sessionTable,
            session_number: "P03-R01-TEST-SESSION",
            status: "ACTIVE",
            guest_count: 1,
          })
          .execute();

        await expect(validateCustomerCapabilityScope(tableOnlyClaims)).resolves.toBeNull();

        const sessionResolution = await resolveCustomerEntry(
          "restaurant-a",
          "P03-R01-SESSION",
        );
        expect(sessionResolution.status).toBe("resolved");
        if (sessionResolution.status !== "resolved") return;
        expect(sessionResolution.entry.tableSessionId).toBe(ids.tableSession);
        const sessionClaims = issueCustomerCapability(
          sessionResolution.entry,
          2_000_000_100,
        ).claims;
        await expect(validateCustomerCapabilityScope(sessionClaims)).resolves.toMatchObject({
          tableSessionId: ids.tableSession,
        });

        await db
          .updateTable("foodflow.table_sessions")
          .set({ status: "CLOSED", closed_at: new Date() })
          .where("id", "=", ids.tableSession)
          .execute();

        await expect(validateCustomerCapabilityScope(sessionClaims)).resolves.toBeNull();
      } finally {
        await db
          .deleteFrom("foodflow.table_sessions")
          .where("id", "=", ids.tableSession)
          .execute();
        await db
          .deleteFrom("foodflow.restaurant_tables")
          .where("id", "=", ids.sessionTable)
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
