import { afterAll, afterEach, describe, expect, it } from "vitest";

import { authenticateInternalUser } from "@/modules/identity/server/authenticate-internal-user";
import { clearLoginFailures, readLoginThrottle, recordLoginFailure } from "@/modules/identity/server/login-throttle";
import { normalizeLoginEmail } from "@/modules/identity/server/email";
import { deriveLoginThrottleSubject } from "@/modules/identity/server/throttle-subject";
import { LOGIN_FAILURE_LIMIT } from "@/modules/identity/server/policy";
import { destroyDatabaseRuntimeForTests } from "@/server/db/client";

import { identityFixtures as fixture } from "../fixtures/identity";

const touchedSubjects = new Set<string>();

function subjectFor(email: string) {
  const subject = deriveLoginThrottleSubject(normalizeLoginEmail(email));
  touchedSubjects.add(subject);
  return subject;
}

describe.runIf(Boolean(process.env.DATABASE_URL))(
  "P02/R03 live internal authentication contract",
  () => {
    afterEach(async () => {
      for (const subject of touchedSubjects) {
        await clearLoginFailures(subject);
      }
      touchedSubjects.clear();
    });

    afterAll(async () => {
      await destroyDatabaseRuntimeForTests();
    });

    it("authenticates a real owner UUID through normalized database credentials", async () => {
      subjectFor(fixture.emails.ownerA);

      await expect(
        authenticateInternalUser("  OWNER.A@FLOW.TEST  ", fixture.passwords.ownerA),
      ).resolves.toEqual({
        status: "authenticated",
        user: {
          id: fixture.users.ownerA,
          email: fixture.emails.ownerA,
        },
      });
    });

    it("authenticates a credential-bearing user without membership", async () => {
      subjectFor(fixture.emails.noMembershipA1);

      const result = await authenticateInternalUser(
        fixture.emails.noMembershipA1,
        fixture.passwords.noMembershipA1,
      );

      expect(result).toEqual({
        status: "authenticated",
        user: {
          id: fixture.users.noMembershipA1,
          email: fixture.emails.noMembershipA1,
        },
      });
      expect(result).not.toHaveProperty("tenantId");
      expect(result).not.toHaveProperty("branchId");
      expect(result).not.toHaveProperty("permissions");
    });

    it("rejects suspended, disabled, missing-credential, and unknown identities generically", async () => {
      for (const email of [
        fixture.emails.suspendedA1,
        fixture.emails.disabledCredentialA1,
        fixture.emails.noCredentialA1,
        "unknown@flow.test",
      ]) {
        subjectFor(email);
        await expect(authenticateInternalUser(email, "not-a-valid-password")).resolves.toEqual({
          status: "rejected",
          reason: "invalid-credentials",
        });
      }
    });

    it("records one failure for wrong password and clears it after success", async () => {
      const subject = subjectFor(fixture.emails.staffA1);
      await clearLoginFailures(subject);

      await expect(
        authenticateInternalUser(fixture.emails.staffA1, `${fixture.passwords.staffA1}-wrong`),
      ).resolves.toEqual({
        status: "rejected",
        reason: "invalid-credentials",
      });
      expect((await readLoginThrottle(subject))?.failureCount).toBe(1);

      await expect(
        authenticateInternalUser(fixture.emails.staffA1, fixture.passwords.staffA1),
      ).resolves.toEqual({
        status: "authenticated",
        user: {
          id: fixture.users.staffA1,
          email: fixture.emails.staffA1,
        },
      });
      expect(await readLoginThrottle(subject)).toBeNull();
    });

    it("rejects an actively blocked identity before valid-password authentication", async () => {
      const subject = subjectFor(fixture.emails.staffA2);
      await clearLoginFailures(subject);

      for (let attempt = 0; attempt < LOGIN_FAILURE_LIMIT; attempt += 1) {
        await recordLoginFailure(subject);
      }
      expect((await readLoginThrottle(subject))?.isBlocked).toBe(true);

      await expect(
        authenticateInternalUser(fixture.emails.staffA2, fixture.passwords.staffA2),
      ).resolves.toEqual({
        status: "rejected",
        reason: "blocked",
      });
    });
  },
);
