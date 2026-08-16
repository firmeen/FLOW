import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { destroyDatabaseRuntimeForTests, getDatabaseRuntime } from "@/server/db/client";
import { checkDatabaseHealth } from "@/server/db/health";
import { withTenantTransaction } from "@/server/db/transaction";

const tenantA = "00000000-0000-0000-0000-0000000000a1";
const tenantB = "00000000-0000-0000-0000-0000000000b1";
const branchA = "00000000-0000-0000-0000-0000000000a3";
const branchB = "00000000-0000-0000-0000-0000000000b3";

describe.runIf(Boolean(process.env.DATABASE_URL))("database runtime", () => {
  beforeAll(() => {
    process.env.DATABASE_POOL_MAX = "1";
  });

  afterAll(async () => {
    await destroyDatabaseRuntimeForTests();
  });

  it("reports database health without exposing tenant data", async () => {
    await expect(checkDatabaseHealth()).resolves.toEqual({ healthy: true });
  });

  it("runs typed queries under flow_runtime and tenant RLS", async () => {
    const names = await withTenantTransaction({ tenantId: tenantA }, async (trx) => {
      const role = await sql<{ current_role: string }>`select current_role`.execute(trx);
      expect(role.rows[0]?.current_role).toBe("flow_runtime");

      const rows = await trx
        .selectFrom("foodflow.menu_items")
        .select(["name", "tenant_id"])
        .orderBy("name")
        .execute();
      return rows;
    });

    expect(names).toEqual([{ name: "Seed Item A", tenant_id: tenantA }]);
  });

  it("denies cross-tenant writes", async () => {
    await expect(
      withTenantTransaction({ tenantId: tenantA }, async (trx) => {
        await trx
          .insertInto("app.restaurants")
          .values({
            tenant_id: tenantB,
            name: "Forbidden",
            legal_name: null,
            slug: "forbidden-cross-tenant",
            logo_url: null,
            currency: "THB",
            timezone: "Asia/Bangkok",
          })
          .execute();
      }),
    ).rejects.toBeDefined();
  });

  it("does not leak tenant context across a reused pooled connection", async () => {
    const first = await withTenantTransaction({ tenantId: tenantA }, async (trx) => {
      return trx.selectFrom("foodflow.menu_items").select("tenant_id").execute();
    });
    const second = await withTenantTransaction({ tenantId: tenantB }, async (trx) => {
      return trx.selectFrom("foodflow.menu_items").select("tenant_id").execute();
    });

    expect(first.every((row) => row.tenant_id === tenantA)).toBe(true);
    expect(second.every((row) => row.tenant_id === tenantB)).toBe(true);
  });

  it("rolls back callback writes and clears local role/context", async () => {
    const slug = "phase3-rollback-proof";

    await expect(
      withTenantTransaction({ tenantId: tenantA }, async (trx) => {
        await trx
          .insertInto("app.restaurants")
          .values({
            tenant_id: tenantA,
            name: "Rollback Proof",
            legal_name: null,
            slug,
            logo_url: null,
            currency: "THB",
            timezone: "Asia/Bangkok",
          })
          .execute();
        throw new Error("rollback requested");
      }),
    ).rejects.toThrow("rollback requested");

    const { db } = getDatabaseRuntime();
    const rawRole = await sql<{ current_role: string }>`select current_role`.execute(db);
    expect(rawRole.rows[0]?.current_role).not.toBe("flow_runtime");

    const rows = await withTenantTransaction({ tenantId: tenantA }, (trx) =>
      trx.selectFrom("app.restaurants").select("slug").where("slug", "=", slug).execute(),
    );
    expect(rows).toHaveLength(0);
  });

  it("preserves branch and actor context transaction-locally", async () => {
    const context = await withTenantTransaction(
      { tenantId: tenantA, branchId: branchA, actorId: tenantA },
      async (trx) => {
        const result = await sql<{
          tenant_id: string | null;
          branch_id: string | null;
          actor_id: string | null;
        }>`select private.current_tenant_id() as tenant_id,
                 private.current_branch_id() as branch_id,
                 private.current_actor_id() as actor_id`.execute(trx);
        return result.rows[0];
      },
    );

    expect(context).toEqual({ tenant_id: tenantA, branch_id: branchA, actor_id: tenantA });

    const next = await withTenantTransaction(
      { tenantId: tenantB, branchId: branchB },
      async (trx) => {
        const result = await sql<{ branch_id: string | null; actor_id: string | null }>`select private.current_branch_id() as branch_id,
                 private.current_actor_id() as actor_id`.execute(trx);
        return result.rows[0];
      },
    );

    expect(next).toEqual({ branch_id: branchB, actor_id: null });
  });

  it("keeps concurrent tenant transactions isolated", async () => {
    const [a, b] = await Promise.all([
      withTenantTransaction({ tenantId: tenantA }, (trx) =>
        trx.selectFrom("foodflow.menu_items").select("tenant_id").execute(),
      ),
      withTenantTransaction({ tenantId: tenantB }, (trx) =>
        trx.selectFrom("foodflow.menu_items").select("tenant_id").execute(),
      ),
    ]);

    expect(a.every((row) => row.tenant_id === tenantA)).toBe(true);
    expect(b.every((row) => row.tenant_id === tenantB)).toBe(true);
  });
});
