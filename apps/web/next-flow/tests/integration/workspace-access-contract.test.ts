import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { toAuthorizedDatabaseRequestContext } from "@/modules/identity/server/access-context";
import { resolveAccessContext } from "@/modules/identity/server/resolve-access-context";
import { listActorWorkspaces } from "@/modules/identity/server/workspace-repository";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";
import { withTenantTransaction } from "@/server/db/transaction";

import { identityFixtures as fixture } from "../fixtures/identity";

const revocationActor = "30000000-0000-4000-8000-0000000000e4";
const revocationMembership = "60000000-0000-4000-8000-0000000000e4";
const staffRole = "50000000-0000-4000-8000-0000000000a2";
const managerRole = "50000000-0000-4000-8000-0000000000a1";

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P02/R04 workspace access contract",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("discovers only current actor-authorized workspace choices", async () => {
      const owner = await listActorWorkspaces(fixture.users.ownerA);
      expect(owner.map((workspace) => workspace.tenantId)).toEqual([
        fixture.tenants.a,
        fixture.tenants.a,
      ]);
      expect(owner.map((workspace) => workspace.branchId)).toEqual([
        fixture.branches.a1,
        fixture.branches.a2,
      ]);
      expect(owner.every((workspace) => workspace.authorityScope === "TENANT")).toBe(true);

      const staffA1 = await listActorWorkspaces(fixture.users.staffA1);
      expect(staffA1).toHaveLength(1);
      expect(staffA1[0]).toMatchObject({
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a1,
        authorityScope: "BRANCH",
      });

      const staffB1 = await listActorWorkspaces(fixture.users.staffB1);
      expect(staffB1).toHaveLength(1);
      expect(staffB1[0]).toMatchObject({
        tenantId: fixture.tenants.b,
        branchId: fixture.branches.b1,
      });

      for (const actorId of [
        fixture.users.noMembershipA1,
        fixture.users.invitedA1,
        fixture.users.suspendedMembershipA1,
        fixture.users.revokedA1,
        fixture.users.suspendedA1,
      ]) {
        await expect(listActorWorkspaces(actorId)).resolves.toEqual([]);
      }
    });

    it("maps only a resolved AccessContext into transaction-local actor/tenant/branch state", async () => {
      const resolution = await resolveAccessContext({
        actorId: fixture.users.staffA1,
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a1,
        requireBranch: true,
      });
      expect(resolution.status).toBe("resolved");
      if (resolution.status !== "resolved") return;

      const observed = await withTenantTransaction(
        toAuthorizedDatabaseRequestContext(resolution.context),
        async (trx) => {
          const result = await sql<{
            actor_id: string;
            tenant_id: string;
            branch_id: string;
          }>`
            select
              current_setting('app.actor_id', true) as actor_id,
              current_setting('app.tenant_id', true) as tenant_id,
              current_setting('app.branch_id', true) as branch_id
          `.execute(trx);
          return result.rows[0];
        },
      );

      expect(observed).toEqual({
        actor_id: fixture.users.staffA1,
        tenant_id: fixture.tenants.a,
        branch_id: fixture.branches.a1,
      });

      await expect(
        resolveAccessContext({
          actorId: fixture.users.staffA1,
          tenantId: fixture.tenants.a,
          branchId: fixture.branches.a2,
          requireBranch: true,
        }),
      ).resolves.toEqual({ status: "invalid_selection" });
    });

    it("reflects membership revocation and role changes on the next resolution", async () => {
      const { db } = getDatabaseRuntime();

      await db
        .insertInto("app.users")
        .values({
          id: revocationActor,
          email: "r04-revocation@workspace.test",
          display_name: "R04 Revocation Actor",
          status: "ACTIVE",
        })
        .onConflict((conflict) => conflict.column("id").doNothing())
        .execute();
      await db
        .insertInto("app.memberships")
        .values({
          id: revocationMembership,
          tenant_id: fixture.tenants.a,
          user_id: revocationActor,
          role_id: staffRole,
          branch_id: fixture.branches.a1,
          status: "ACTIVE",
        })
        .onConflict((conflict) => conflict.column("id").doNothing())
        .execute();

      try {
        const initial = await resolveAccessContext({
          actorId: revocationActor,
          tenantId: fixture.tenants.a,
          branchId: fixture.branches.a1,
          requireBranch: true,
        });
        expect(initial.status).toBe("resolved");
        if (initial.status === "resolved") expect(initial.context.roleId).toBe(staffRole);

        await db
          .updateTable("app.memberships")
          .set({ status: "REVOKED" })
          .where("id", "=", revocationMembership)
          .execute();

        await expect(
          resolveAccessContext({
            actorId: revocationActor,
            tenantId: fixture.tenants.a,
            branchId: fixture.branches.a1,
            requireBranch: true,
          }),
        ).resolves.toEqual({ status: "no_access" });

        await db
          .updateTable("app.memberships")
          .set({ status: "ACTIVE", role_id: managerRole })
          .where("id", "=", revocationMembership)
          .execute();

        const changed = await resolveAccessContext({
          actorId: revocationActor,
          tenantId: fixture.tenants.a,
          branchId: fixture.branches.a1,
          requireBranch: true,
        });
        expect(changed.status).toBe("resolved");
        if (changed.status === "resolved") expect(changed.context.roleId).toBe(managerRole);
      } finally {
        await db
          .deleteFrom("app.memberships")
          .where("id", "=", revocationMembership)
          .execute();
        await db.deleteFrom("app.users").where("id", "=", revocationActor).execute();
      }
    });
  },
);
