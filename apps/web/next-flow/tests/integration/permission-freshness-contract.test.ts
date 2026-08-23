import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { authorizePermission } from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import {
  destroyDatabaseRuntimeForTests,
  getDatabaseRuntime,
} from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const CASHIER_ROLE_ID = "50000000-0000-4000-8000-0000000000a4";
const CASHIER_MEMBERSHIP_ID = "60000000-0000-4000-8000-0000000000a9";

const cashierContext: AccessContext = {
  actorId: fixture.users.cashierA2,
  tenantId: fixture.tenants.a,
  branchId: fixture.branches.a2,
  membershipId: CASHIER_MEMBERSHIP_ID,
  roleId: CASHIER_ROLE_ID,
  scope: "BRANCH",
};

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P02/R05 live permission freshness",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("reflects permission removal on the next evaluation without changing session identity", async () => {
      await expect(
        authorizePermission(
          cashierContext,
          PERMISSIONS.merchantPaymentCollect,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });

      const { db } = getDatabaseRuntime();
      await sql`
        delete from app.role_permissions rp
        using app.permissions p
        where rp.permission_id = p.id
          and rp.role_id = ${CASHIER_ROLE_ID}::uuid
          and p.code = ${PERMISSIONS.merchantPaymentCollect}
      `.execute(db);

      try {
        await expect(
          authorizePermission(
            cashierContext,
            PERMISSIONS.merchantPaymentCollect,
            "branch",
          ),
        ).resolves.toEqual({ status: "denied" });
      } finally {
        await sql`
          insert into app.role_permissions (role_id, permission_id)
          select ${CASHIER_ROLE_ID}::uuid, p.id
          from app.permissions p
          where p.code = ${PERMISSIONS.merchantPaymentCollect}
          on conflict do nothing
        `.execute(db);
      }

      await expect(
        authorizePermission(
          cashierContext,
          PERMISSIONS.merchantPaymentCollect,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
    });
  },
);
