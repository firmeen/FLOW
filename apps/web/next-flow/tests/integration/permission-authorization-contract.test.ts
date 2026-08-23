import { afterAll, describe, expect, it, vi } from "vitest";

import {
  AuthorizationDeniedError,
  authorizePermission,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const contexts = {
  ownerA1: {
    actorId: fixture.users.ownerA,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: "60000000-0000-4000-8000-0000000000a1",
    roleId: "50000000-0000-4000-8000-0000000000a1",
    scope: "TENANT",
  },
  staffA1: {
    actorId: fixture.users.staffA1,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: "60000000-0000-4000-8000-0000000000a2",
    roleId: "50000000-0000-4000-8000-0000000000a2",
    scope: "BRANCH",
  },
  staffA1ForgedA2: {
    actorId: fixture.users.staffA1,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a2,
    membershipId: "60000000-0000-4000-8000-0000000000a2",
    roleId: "50000000-0000-4000-8000-0000000000a2",
    scope: "BRANCH",
  },
  kitchenA1: {
    actorId: fixture.users.kitchenA1,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a1,
    membershipId: "60000000-0000-4000-8000-0000000000a8",
    roleId: "50000000-0000-4000-8000-0000000000a3",
    scope: "BRANCH",
  },
  cashierA2: {
    actorId: fixture.users.cashierA2,
    tenantId: fixture.tenants.a,
    branchId: fixture.branches.a2,
    membershipId: "60000000-0000-4000-8000-0000000000a9",
    roleId: "50000000-0000-4000-8000-0000000000a4",
    scope: "BRANCH",
  },
  staffB1: {
    actorId: fixture.users.staffB1,
    tenantId: fixture.tenants.b,
    branchId: fixture.branches.b1,
    membershipId: "60000000-0000-4000-8000-0000000000b1",
    roleId: "50000000-0000-4000-8000-0000000000b1",
    scope: "BRANCH",
  },
} satisfies Record<string, AccessContext>;

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P02/R05 permission authorization contract",
  () => {
    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("enforces the staff, kitchen, cashier and admin capability matrix", async () => {
      await expect(
        authorizePermission(
          contexts.staffA1,
          PERMISSIONS.operationsStaffAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(
          contexts.staffA1,
          PERMISSIONS.operationsKitchenAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "denied" });
      await expect(
        authorizePermission(
          contexts.kitchenA1,
          PERMISSIONS.operationsKitchenAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(
          contexts.cashierA2,
          PERMISSIONS.operationsCashierAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(
          contexts.ownerA1,
          PERMISSIONS.managementAdminAccess,
          "tenant",
        ),
      ).resolves.toEqual({ status: "allowed" });
    });

    it("keeps command permissions independent from route-shell permissions", async () => {
      await expect(
        authorizePermission(
          contexts.cashierA2,
          PERMISSIONS.merchantPaymentCollect,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(
          contexts.cashierA2,
          PERMISSIONS.merchantPaymentVoid,
          "branch",
        ),
      ).resolves.toEqual({ status: "denied" });
      await expect(
        authorizePermission(
          contexts.kitchenA1,
          PERMISSIONS.kitchenManage,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(
          contexts.staffA1,
          PERMISSIONS.kitchenManage,
          "branch",
        ),
      ).resolves.toEqual({ status: "denied" });
    });

    it("fails closed for sibling-branch and cross-tenant permission checks", async () => {
      await expect(
        authorizePermission(
          contexts.staffA1ForgedA2,
          PERMISSIONS.operationsStaffAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "denied" });
      await expect(
        authorizePermission(
          contexts.staffB1,
          PERMISSIONS.operationsStaffAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "allowed" });
      await expect(
        authorizePermission(
          {
            ...contexts.staffB1,
            tenantId: fixture.tenants.a,
            branchId: fixture.branches.a1,
          },
          PERMISSIONS.operationsStaffAccess,
          "branch",
        ),
      ).resolves.toEqual({ status: "denied" });
    });

    it("never executes a denied command callback", async () => {
      const callback = vi.fn(async () => "mutated");

      await expect(
        withAuthorizedAccessTransaction(
          contexts.staffA1,
          PERMISSIONS.kitchenManage,
          "branch",
          callback,
        ),
      ).rejects.toBeInstanceOf(AuthorizationDeniedError);
      expect(callback).not.toHaveBeenCalled();
    });

    it("executes an allowed callback inside the authorized transaction", async () => {
      const result = await withAuthorizedAccessTransaction(
        contexts.cashierA2,
        PERMISSIONS.merchantPaymentCollect,
        "branch",
        async (_trx, context) => ({
          actorId: context.actorId,
          tenantId: context.tenantId,
          branchId: context.branchId,
        }),
      );

      expect(result).toEqual({
        actorId: fixture.users.cashierA2,
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a2,
      });
    });
  },
);
