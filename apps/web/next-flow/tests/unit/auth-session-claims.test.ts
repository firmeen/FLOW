import { describe, expect, it } from "vitest";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

import {
  exposeAuthenticatedIdentity,
  persistAuthenticatedIdentity,
} from "@/modules/identity/server/session-claims";

describe("P02/R03 Auth.js session claims", () => {
  it("persists only the authenticated subject and normalized email", () => {
    const token: JWT = { name: null, email: null, picture: null, sub: undefined };
    const user: User = {
      id: "30000000-0000-4000-8000-0000000000a1",
      email: "owner.a@flow.test",
    };

    const result = persistAuthenticatedIdentity(token, user);

    expect(result.sub).toBe(user.id);
    expect(result.email).toBe(user.email);
    expect(result).not.toHaveProperty("tenantId");
    expect(result).not.toHaveProperty("branchId");
    expect(result).not.toHaveProperty("roles");
    expect(result).not.toHaveProperty("permissions");
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("throttleDigest");
  });

  it("exposes the real application UUID without workspace authority", () => {
    const session: Session = {
      expires: "2026-08-23T08:00:00.000Z",
      user: {
        id: "stale-id",
        email: "stale@flow.test",
      },
    };
    const token: JWT = {
      sub: "30000000-0000-4000-8000-0000000000a2",
      email: "staff.a1@flow.test",
    };

    const result = exposeAuthenticatedIdentity(session, token);

    expect(result.user?.id).toBe(token.sub);
    expect(result.user?.email).toBe(token.email);
    expect(result.user).not.toHaveProperty("tenantId");
    expect(result.user).not.toHaveProperty("branchId");
    expect(result.user).not.toHaveProperty("roles");
    expect(result.user).not.toHaveProperty("permissions");
  });
});
