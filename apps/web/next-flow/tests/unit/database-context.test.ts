import { describe, expect, it } from "vitest";

import {
  DatabaseContextError,
  validateActorId,
  validateDatabaseContext,
  validateUuid,
} from "@/server/db/context";

describe("database request context", () => {
  it("accepts canonical PostgreSQL UUID values used by deterministic fixtures", () => {
    const context = {
      tenantId: "00000000-0000-0000-0000-0000000000a1",
      branchId: "00000000-0000-0000-0000-0000000000a3",
      actorId: "30000000-0000-4000-8000-0000000000a2",
    };

    expect(validateDatabaseContext(context)).toEqual(context);
  });

  it("validates actor identifiers independently from tenant context", () => {
    expect(validateActorId("30000000-0000-4000-8000-0000000000a1")).toBe(
      "30000000-0000-4000-8000-0000000000a1",
    );
  });

  it("rejects malformed UUID values", () => {
    expect(() => validateUuid("not-a-uuid", "tenantId")).toThrow(DatabaseContextError);
    expect(() => validateActorId("not-an-actor")).toThrow("actorId must be a valid UUID.");
  });
});
