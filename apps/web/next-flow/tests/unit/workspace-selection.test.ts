import { describe, expect, it } from "vitest";

import {
  decodeWorkspaceSelection,
  encodeWorkspaceSelection,
} from "@/modules/identity/server/workspace-selection";

const tenantId = "00000000-0000-0000-0000-0000000000a1";
const branchId = "00000000-0000-0000-0000-0000000000a3";

describe("P02/R04 workspace selection hint", () => {
  it("serializes only minimal tenant and branch selectors", () => {
    const encoded = encodeWorkspaceSelection({ tenantId, branchId });
    expect(encoded).toBe(`v1.${tenantId}.${branchId}`);
    expect(encoded).not.toContain("permission");
    expect(encoded).not.toContain("role");
  });

  it("round-trips tenant-only selection", () => {
    expect(decodeWorkspaceSelection(encodeWorkspaceSelection({ tenantId, branchId: null }))).toEqual({
      tenantId,
      branchId: null,
    });
  });

  it("rejects malformed or forged selector values before resolution", () => {
    expect(decodeWorkspaceSelection("garbage")).toBeNull();
    expect(decodeWorkspaceSelection(`v1.not-a-uuid.${branchId}`)).toBeNull();
    expect(decodeWorkspaceSelection(`v1.${tenantId}.not-a-uuid`)).toBeNull();
    expect(decodeWorkspaceSelection(`v2.${tenantId}.${branchId}`)).toBeNull();
  });
});
