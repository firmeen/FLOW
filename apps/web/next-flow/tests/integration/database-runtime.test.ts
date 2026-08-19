import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { destroyDatabaseRuntimeForTests, getDatabaseRuntime } from "@/server/db/client";
import { checkDatabaseHealth } from "@/server/db/health";
import { withIdentityTransaction } from "@/server/db/identity-transaction";
import { withTenantTransaction } from "@/server/db/transaction";

const tenantA = "00000000-0000-0000-0000-0000000000a1";
const tenantB = "00000000-0000-0000-0000-0000000000b1";
const branchA1 = "00000000-0000-0000-0000-0000000000a3";
const branchA2 = "00000000-0000-0000-0000-0000000000ac";
const branchB1 = "00000000-0000-0000-0000-0000000000b3";
const tableA1 = "00000000-0000-0000-0000-0000000000a5";
const tableA2 = "00000000-0000-0000-0000-0000000000ad";

const actorTenantWideA = "30000000-0000-4000-8000-0000000000a1";
const actorBranchA1 = "30000000-0000-4000-8000-0000000000a2";
const actorBranchA2 = "30000000-0000-4000-8000-0000000000a3";
const actorSuspendedUser = "30000000-0000-4000-8000-0000000000a4";
const actorInvitedMembership = "30000000-0000-4000-8000-0000000000a5";
const actorSuspendedMembership = "30000000-0000-4000-8000-0000000000a6";
const actorRevokedMembership = "30000000-0000-4000-8000-0000000000a7";
const actorBranchB1 = "30000000-0000-4000-8000-0000000000b1";

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
      const branchRows = await trx.selectFrom("app.branches").select("id").execute();
      const organizationRows = await trx.selectFrom("app.organizations").select("id").execute();

      return {
        role: role.rows[0]?.current_role,
        context: context.rows[0],
        branchRows,
        organizationRows,
      };
    });

    expect(result.role).toBe("flow_runtime");
    expect(result.context).toEqual({ tenant_id: tenantA, actor_id: null });
    expect(result.branchRows).toEqual([]);
    expect(result.organizationRows).toEqual([]);
  });

  it("denies actorless runtime writes even with valid tenant context", async () => {
    await expect(
      withTenantTransaction({ tenantId: tenantA }, async (trx) => {
        await trx
          .insertInto("app.organizations")
          .values({
            id: "70000000-0000-4000-8000-000000000001",
            slug: "forbidden-actorless-write",
            name: "Forbidden Actorless Write",
            legal_name: null,
            default_currency: "THB",
            timezone: "Asia/Bangkok",
          })
          .execute();
      }),
    ).rejects.toBeDefined();
  });

  it("allows a real tenant-wide actor to read tenant and both same-tenant branches", async () => {
    const result = await withTenantTransaction(
      { tenantId: tenantA, actorId: actorTenantWideA },
      async (trx) => {
        const organizations = await trx
          .selectFrom("app.organizations")
          .select("id")
          .orderBy("id")
          .execute();
        const branches = await trx
          .selectFrom("app.branches")
          .select("id")
          .where("tenant_id", "=", tenantA)
          .orderBy("id")
          .execute();

        return {
          organizations: organizations.map((row) => row.id),
          branches: branches.map((row) => row.id),
        };
      },
    );

    expect(result.organizations).toEqual([tenantA]);
    expect(result.branches).toEqual([branchA1, branchA2].sort());
  });

  it("allows a real branch actor only on its exact branch and keeps tenant-wide rows closed", async () => {
    const result = await withTenantTransaction(
      { tenantId: tenantA, branchId: branchA1, actorId: actorBranchA1 },
      async (trx) => {
        const organizations = await trx.selectFrom("app.organizations").select("id").execute();
        const branches = await trx
          .selectFrom("app.branches")
          .select("id")
          .where("tenant_id", "=", tenantA)
          .orderBy("id")
          .execute();
        const tables = await trx
          .selectFrom("foodflow.restaurant_tables")
          .select("id")
          .where("tenant_id", "=", tenantA)
          .orderBy("id")
          .execute();

        return {
          organizations,
          branches: branches.map((row) => row.id),
          tables: tables.map((row) => row.id),
        };
      },
    );

    expect(result.organizations).toEqual([]);
    expect(result.branches).toEqual([branchA1]);
    expect(result.tables).toEqual([tableA1]);
  });

  it("denies the same branch actor on another branch in the same tenant", async () => {
    const result = await withTenantTransaction(
      { tenantId: tenantA, branchId: branchA2, actorId: actorBranchA1 },
      async (trx) => {
        const branches = await trx
          .selectFrom("app.branches")
          .select("id")
          .where("id", "=", branchA2)
          .execute();
        const tables = await trx
          .selectFrom("foodflow.restaurant_tables")
          .select("id")
          .where("id", "=", tableA2)
          .execute();
        return { branches, tables };
      },
    );

    expect(result.branches).toEqual([]);
    expect(result.tables).toEqual([]);
  });

  it("isolates real actors across tenants while allowing the valid Tenant B actor", async () => {
    const denied = await withTenantTransaction(
      { tenantId: tenantB, branchId: branchB1, actorId: actorBranchA1 },
      async (trx) =>
        trx.selectFrom("app.branches").select("id").where("id", "=", branchB1).execute(),
    );

    const allowed = await withTenantTransaction(
      { tenantId: tenantB, branchId: branchB1, actorId: actorBranchB1 },
      async (trx) =>
        trx.selectFrom("app.branches").select("id").where("id", "=", branchB1).execute(),
    );

    expect(denied).toEqual([]);
    expect(allowed.map((row) => row.id)).toEqual([branchB1]);
  });

  it("denies suspended users and non-active membership states", async () => {
    const deniedActors = [
      actorSuspendedUser,
      actorInvitedMembership,
      actorSuspendedMembership,
      actorRevokedMembership,
    ];

    for (const actorId of deniedActors) {
      const rows = await withTenantTransaction(
        { tenantId: tenantA, branchId: branchA1, actorId },
        async (trx) =>
          trx.selectFrom("app.branches").select("id").where("id", "=", branchA1).execute(),
      );
      expect(rows).toEqual([]);
    }
  });

  it("does not leak tenant or actor context across sequential pooled transactions", async () => {
    const first = await withTenantTransaction(
      { tenantId: tenantA, branchId: branchA2, actorId: actorBranchA2 },
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

    const second = await withTenantTransaction(
      { tenantId: tenantB, branchId: branchB1, actorId: actorBranchB1 },
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

    expect(first).toEqual({ tenant_id: tenantA, branch_id: branchA2, actor_id: actorBranchA2 });
    expect(second).toEqual({ tenant_id: tenantB, branch_id: branchB1, actor_id: actorBranchB1 });
  });

  it("rolls back transaction-local context and restores the database role", async () => {
    await expect(
      withTenantTransaction(
        { tenantId: tenantA, branchId: branchA1, actorId: actorBranchA1 },
        async (trx) => {
          await sql`select set_config('app.r04_rollback_probe', 'set', true)`.execute(trx);
          throw new Error("rollback requested");
        },
      ),
    ).rejects.toThrow("rollback requested");

    const { db } = getDatabaseRuntime();
    const rawRole = await sql<{ current_role: string }>`select current_role`.execute(db);
    expect(rawRole.rows[0]?.current_role).not.toBe("flow_runtime");

    const next = await withTenantTransaction(
      { tenantId: tenantB, branchId: branchB1, actorId: actorBranchB1 },
      async (trx) => {
        const result = await sql<{
          probe: string | null;
          actor_id: string | null;
        }>`select nullif(current_setting('app.r04_rollback_probe', true), '') as probe,
                 private.current_actor_id() as actor_id`.execute(trx);
        return result.rows[0];
      },
    );

    expect(next).toEqual({ probe: null, actor_id: actorBranchB1 });
  });

  it("keeps concurrent real-actor transactions isolated", async () => {
    const run = (tenantId: string, branchId: string, actorId: string) =>
      withTenantTransaction({ tenantId, branchId, actorId }, async (trx) => {
        const context = await sql<{
          tenant_id: string | null;
          branch_id: string | null;
          actor_id: string | null;
        }>`select private.current_tenant_id() as tenant_id,
                 private.current_branch_id() as branch_id,
                 private.current_actor_id() as actor_id
          from (select pg_sleep(0.05)) as delay`.execute(trx);
        const branches = await trx.selectFrom("app.branches").select("id").orderBy("id").execute();
        return { context: context.rows[0], branches: branches.map((row) => row.id) };
      });

    const [a, b] = await Promise.all([
      run(tenantA, branchA1, actorBranchA1),
      run(tenantB, branchB1, actorBranchB1),
    ]);

    expect(a).toEqual({
      context: { tenant_id: tenantA, branch_id: branchA1, actor_id: actorBranchA1 },
      branches: [branchA1],
    });
    expect(b).toEqual({
      context: { tenant_id: tenantB, branch_id: branchB1, actor_id: actorBranchB1 },
      branches: [branchB1],
    });
  });

  it("runs flow_identity with a real app.users.id and limits identity rows to the actor", async () => {
    const result = await withIdentityTransaction(actorTenantWideA, async (trx) => {
      const role = await sql<{ current_role: string }>`select current_role`.execute(trx);
      const context = await sql<{ actor_id: string | null }>`
        select private.current_actor_id() as actor_id
      `.execute(trx);
      const users = await trx.selectFrom("app.users").select("id").orderBy("id").execute();
      const memberships = await trx
        .selectFrom("app.memberships")
        .select(["id", "user_id"])
        .orderBy("id")
        .execute();

      return {
        role: role.rows[0]?.current_role,
        actorId: context.rows[0]?.actor_id,
        users,
        memberships,
      };
    });

    expect(result.role).toBe("flow_identity");
    expect(result.actorId).toBe(actorTenantWideA);
    expect(result.users.map((row) => row.id)).toEqual([actorTenantWideA]);
    expect(result.memberships).toEqual([
      { id: "60000000-0000-4000-8000-0000000000a1", user_id: actorTenantWideA },
    ]);
  });
});
