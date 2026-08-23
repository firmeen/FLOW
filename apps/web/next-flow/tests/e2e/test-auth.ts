import { identityFixtures } from "../fixtures/identity";

export const E2E_AUTH = {
  email: identityFixtures.emails.ownerA,
  password: identityFixtures.passwords.ownerA,
  authSecret: "flow-browser-check-auth-secret-change-before-production",
} as const;
