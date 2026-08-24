import { identityFixtures } from "../fixtures/identity";

export const E2E_AUTH = {
  email: identityFixtures.emails.ownerA,
  password: identityFixtures.passwords.ownerA,
  authSecret: "flow-browser-check-auth-secret-change-before-production",
  customerCapabilitySecret:
    "flow-browser-check-customer-capability-secret-change-before-production",
  workspace: {
    tenantId: identityFixtures.tenants.a,
    branchId: identityFixtures.branches.a1,
  },
} as const;
