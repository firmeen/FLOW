import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { destroyDatabaseRuntimeForTests, getDatabaseRuntime } from "@/server/db/client";
import { checkDatabaseHealth } from "@/server/db/health";
import { withTenantTransaction } from "@/server/db/transaction";

const tenantA = "00000000-0000-0000-0000-0000000000a1";
const tenantB = "00000000-0000-0000-0000-0000000000b1";
const branchA = "00000000-0000-0000-0000-0000000000a3";
const branchB = "00000000-0000-0000-0000-0000000000b3";
const actorProbe = "00000000-0000-0000-0000-0000000000f1";

describe.runIf(Boolean(process.env.DATABASE_URL))("database runtime", () => {
  beforeAll(() => {
    process.env.DATABASE_POOL_MAX = "2";
  });

  afterAll(async () => {
    await destroyDatabaseRuntimeForTests();
  });

  it("reports database health without exposing tenant data", async () => {
    await expect(checkDatabaseHealth()).resolves.toEqual({ healthy: true });
  });

  it("runs under flow_runtime with tenant context and actorless default denial", async () => {
    const result = await withTenantTransaction({ tenantId: tenantA }, async (trx) => {
      const role = await sql<{ current_role: string }>`select current_role`.execute(trx);
      const context = await sql<{ tenant_id: string | null; actor_id: string | null }>`
        select private.current_tenant_id() as tenant_id,
               private.current_actor_id() as actor_id
      `.execute(trx);
      const menuRows = await trx.selectFrom("foodflow.menu_items").select("tenant_id").execute();
      const organizationRows = await trx.selectFrom("app.organizations").select("id").execute();

      return {
        role: role.rows[0]?.current_role,
        context: context.rows[0],
        menuRows,
        organizationRows,
      };
    });

    expect(result.role).toBe("flow_runtime");
    expect(result.context).toEqual({ tenant_id: tenantA, actor_id: null });
    expect(result.menuRows).toEqual([]);
    expect(result.organizationRows).toEqual([]);
  });

  it("denies actorless runtime writes even with valid tenant context", async () => {
    await expect(
      withTenantTransaction({ tenantId: tenantA }, async (trx) => {
        await trx
          .insertInto("app.restaurants")
          .values({
            tenant_id: tenantA,
            name: "Forbidden Actorless Write",
            legal_name: null,
            slug: "forbidden-actorless-write",
            logo_url: null,
            currency: "THB",
            timezone: "Asia/Bangkok",
          })
          .execute();
      }),
    ).rejects.toBeDefined();
  });

  it("does not leak tenant context across sequential pooled transactions", async () => {
    const first = await withTenantTransaction({ tenantId: tenantA }, async (trx) => {
      const result = await sql<{ tenant_id: string | null; actor_id: string | null }>`
        select private.current_tenant_id() as tenant_id,
               private.current_actor_id() as actor_id
      `.execute(trx);
      return result.rows[0];
    });

    const second = await withTenantTransaction({ tenantId: tenantB }, async (trx) => {
      const result = await sql<{ tenant_id: string | null; actor_id: string | null }>`
        select private.current_tenant_id() as tenant_id,
               private.current_actor_id() as actor_id
      `.execute(trx);
      return result.rows[0];
    });

    expect(first).toEqual({ tenant_id: tenantA, actor_id: null });
    expect(second).toEqual({ tenant_id: tenantB, actor_id: null });
  });

  it("rolls back transaction-local context and restores the database role", async () => {
    await expect(
      withTenantTransaction({ tenantId: tenantA }, async (trx) => {
        await sql`select set_config('app.r03_rollback_probe', 'set', true)`.execute(trx);
        throw new Error("rollback requested");
      }),
    ).rejects.toThrow("rollback requested");

    const { db } = getDatabaseRuntime();
    const rawRole = await sql<{ current_role: string }>`select current_role`.execute(db);
    expect(rawRole.rows[0]?.current_role).not.toBe("flow_runtime");

    const next = await withTenantTransaction({ tenantId: tenantA }, async (trx) => {
      const result = await sql<{ probe: string | null }>`
        select nullif(current_setting('app.r03_rollback_probe', true), '') as probe
      `.execute(trx);
      return result.rows[0]?.probe ?? null;
    });

    expect(next).toBeNull();
  });

  it("preserves branch and actor context transaction-locally", async () => {
    const context = await withTenantTransaction(
      { tenantId: tenantA, branchId: branchA, actorId: actorProbe },
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

    expect(context).toEqual({ tenant_id: tenantA, branch_id: branchA, actor_id: actorProbe });

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
    const run = (tenantId: string) =>
      withTenantTransaction({ tenantId }, async (trx) => {
        const result = await sql<{ tenant_id: string | null; actor_id: string | null }>`
          select private.current_tenant_id() as tenant_id,
                 private.current_actor_id() as actor_id
          from (select pg_sleep(0.05)) as delay
        `.execute(trx);
        return result.rows[0];
      });

    const [a, b] = await Promise.all([run(tenantA), run(tenantB)]);

    expect(a).toEqual({ tenant_id: tenantA, actor_id: null });
    expect(b).toEqual({ tenant_id: tenantB, actor_id: null });
  });
});
