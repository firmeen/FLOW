import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";

import { findActiveCredentialCandidateByEmail } from "@/modules/identity/server/credential-repository";
import { verifyPassword } from "@/modules/identity/server/password-verifier";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";
import { withTenantTransaction } from "@/server/db/transaction";

import { identityFixtures as fixture } from "../fixtures/identity";

describe.runIf(Boolean(process.env.DATABASE_URL))("P02/R02 identity authorization contract", () => {
  afterAll(async () => {
    await destroyDatabaseRuntimeForTests();
  });

  it("resolves and verifies deterministic positive credential fixtures", async () => {
    const cases = [
      [fixture.emails.ownerA, fixture.users.ownerA, fixture.passwords.ownerA],
      [fixture.emails.staffA1, fixture.users.staffA1, fixture.passwords.staffA1],
      [fixture.emails.staffA2, fixture.users.staffA2, fixture.passwords.staffA2],
      [fixture.emails.kitchenA1, fixture.users.kitchenA1, fixture.passwords.kitchenA1],
      [fixture.emails.cashierA2, fixture.users.cashierA2, fixture.passwords.cashierA2],
      [fixture.emails.staffB1, fixture.users.staffB1, fixture.passwords.staffB1],
    ] as const;

    for (const [email, userId, password] of cases) {
      const candidate = await findActiveCredentialCandidateByEmail(email);
      expect(candidate?.userId).toBe(userId);
      expect(candidate?.normalizedEmail).toBe(email);
      expect(candidate?.algorithm).toBe("scrypt-v1");
      expect(candidate && (await verifyPassword(password, candidate.algorithm, candidate.passwordHash))).toBe(true);
      expect(candidate && (await verifyPassword(`${password}-wrong`, candidate.algorithm, candidate.passwordHash))).toBe(false);
    }
  });

  it("normalizes login email before pre-auth lookup", async () => {
    const candidate = await findActiveCredentialCandidateByEmail("  OWNER.A@FLOW.TEST  ");
    expect(candidate?.userId).toBe(fixture.users.ownerA);
    expect(candidate?.normalizedEmail).toBe(fixture.emails.ownerA);
  });

  it("denies suspended, disabled, missing-credential and unknown identities at pre-auth lookup", async () => {
    for (const email of [
      fixture.emails.suspendedA1,
      fixture.emails.disabledCredentialA1,
      fixture.emails.noCredentialA1,
      "unknown@flow.test",
    ]) {
      await expect(findActiveCredentialCandidateByEmail(email)).resolves.toBeNull();
    }
  });

  it("proves credential eligibility does not grant workspace authorization", async () => {
    const candidate = await findActiveCredentialCandidateByEmail(fixture.emails.noMembershipA1);
    expect(candidate?.userId).toBe(fixture.users.noMembershipA1);
    expect(candidate && (await verifyPassword(fixture.passwords.noMembershipA1, candidate.algorithm, candidate.passwordHash))).toBe(true);

    const branches = await withTenantTransaction(
      {
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a1,
        actorId: fixture.users.noMembershipA1,
      },
      (trx) => trx.selectFrom("app.branches").select("id").execute(),
    );
    expect(branches).toEqual([]);
  });

  it("keeps staff authorization exact to Branch A1", async () => {
    const result = await withTenantTransaction(
      {
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a1,
        actorId: fixture.users.staffA1,
      },
      async (trx) => {
        const allowed = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'operations.staff.access',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a1}::uuid
          ) as allowed
        `.execute(trx);
        const sibling = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'order.view',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a2}::uuid
          ) as allowed
        `.execute(trx);
        return { allowed: allowed.rows[0]?.allowed, sibling: sibling.rows[0]?.allowed };
      },
    );

    expect(result).toEqual({ allowed: true, sibling: false });
  });

  it("keeps kitchen and cashier capabilities separated by role and branch", async () => {
    const kitchen = await withTenantTransaction(
      {
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a1,
        actorId: fixture.users.kitchenA1,
      },
      async (trx) => {
        const kitchenPermission = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'kitchen.manage',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a1}::uuid
          ) as allowed
        `.execute(trx);
        const cashierPermission = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'operations.cashier.access',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a1}::uuid
          ) as allowed
        `.execute(trx);
        return {
          kitchen: kitchenPermission.rows[0]?.allowed,
          cashier: cashierPermission.rows[0]?.allowed,
        };
      },
    );

    const cashier = await withTenantTransaction(
      {
        tenantId: fixture.tenants.a,
        branchId: fixture.branches.a2,
        actorId: fixture.users.cashierA2,
      },
      async (trx) => {
        const collect = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'merchant_payment.collect',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a2}::uuid
          ) as allowed
        `.execute(trx);
        const kitchenPermission = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'operations.kitchen.access',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a2}::uuid
          ) as allowed
        `.execute(trx);
        return {
          collect: collect.rows[0]?.allowed,
          kitchen: kitchenPermission.rows[0]?.allowed,
        };
      },
    );

    expect(kitchen).toEqual({ kitchen: true, cashier: false });
    expect(cashier).toEqual({ collect: true, kitchen: false });
  });

  it("keeps Tenant B authorization isolated from Tenant A", async () => {
    const result = await withTenantTransaction(
      {
        tenantId: fixture.tenants.b,
        branchId: fixture.branches.b1,
        actorId: fixture.users.staffB1,
      },
      async (trx) => {
        const own = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'operations.staff.access',
            ${fixture.tenants.b}::uuid,
            ${fixture.branches.b1}::uuid
          ) as allowed
        `.execute(trx);
        const tenantA = await sql<{ allowed: boolean }>`
          select private.actor_has_permission(
            'operations.staff.access',
            ${fixture.tenants.a}::uuid,
            ${fixture.branches.a1}::uuid
          ) as allowed
        `.execute(trx);
        return { own: own.rows[0]?.allowed, tenantA: tenantA.rows[0]?.allowed };
      },
    );

    expect(result).toEqual({ own: true, tenantA: false });
  });
});
