import { describe, expect, it, vi } from "vitest";

import type { WorkspaceOption } from "@/modules/identity/server/access-context";
import { createAccessContextResolver } from "@/modules/identity/server/resolve-access-context";

const actorId = "30000000-0000-4000-8000-0000000000a2";
const tenantA = "00000000-0000-0000-0000-0000000000a1";
const tenantB = "00000000-0000-0000-0000-0000000000b1";
const branchA1 = "00000000-0000-0000-0000-0000000000a3";
const branchA2 = "00000000-0000-0000-0000-0000000000ac";
const branchB1 = "00000000-0000-0000-0000-0000000000b3";
const staffRole = "50000000-0000-4000-8000-0000000000a2";
const managerRole = "50000000-0000-4000-8000-0000000000a1";

function option(
  overrides: Partial<WorkspaceOption> = {},
): WorkspaceOption {
  return {
    membershipId: "60000000-0000-4000-8000-0000000000a2",
    tenantId: tenantA,
    roleId: staffRole,
    authorityScope: "BRANCH",
    tenantName: "Tenant A",
    branchId: branchA1,
    branchName: "Branch A1",
    branchCode: "A1",
    ...overrides,
  };
}

function resolver(workspaces: WorkspaceOption[]) {
  return createAccessContextResolver({
    listWorkspaces: vi.fn(async () => workspaces),
  });
}

describe("P02/R04 access context resolver", () => {
  it("auto-resolves one exact branch without broadening scope", async () => {
    const result = await resolver([option()])({ actorId, requireBranch: true });
    expect(result).toEqual({
      status: "resolved",
      context: {
        actorId,
        tenantId: tenantA,
        branchId: branchA1,
        membershipId: "60000000-0000-4000-8000-0000000000a2",
        roleId: staffRole,
        scope: "BRANCH",
      },
    });
  });

  it("keeps tenant-wide authority tenant-only when branch is not required", async () => {
    const result = await resolver([
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
      }),
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
        branchId: branchA2,
        branchName: "Branch A2",
        branchCode: "A2",
      }),
    ])({ actorId, tenantId: tenantA, requireBranch: false });

    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.context).toMatchObject({
        actorId,
        tenantId: tenantA,
        branchId: null,
        roleId: managerRole,
        scope: "TENANT",
      });
    }
  });

  it("requires explicit branch selection for tenant-wide authority with multiple branches", async () => {
    const workspaces = [
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
      }),
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
        branchId: branchA2,
        branchName: "Branch A2",
        branchCode: "A2",
      }),
    ];

    const result = await resolver(workspaces)({ actorId, requireBranch: true });
    expect(result.status).toBe("selection_required");
  });

  it("resolves an explicitly selected tenant-wide branch using server-derived membership and role", async () => {
    const workspaces = [
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
      }),
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
        branchId: branchA2,
        branchName: "Branch A2",
        branchCode: "A2",
      }),
    ];

    const result = await resolver(workspaces)({
      actorId,
      tenantId: tenantA,
      branchId: branchA2,
      requireBranch: true,
    });

    expect(result.status).toBe("resolved");
    if (result.status === "resolved") {
      expect(result.context).toMatchObject({
        tenantId: tenantA,
        branchId: branchA2,
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        scope: "BRANCH",
      });
      expect(result.context).not.toHaveProperty("permissions");
    }
  });

  it("rejects malformed and cross-tenant selectors", async () => {
    const resolve = resolver([option()]);
    await expect(resolve({ actorId: "forged", requireBranch: true })).resolves.toEqual({
      status: "invalid_selection",
    });
    await expect(
      resolve({ actorId, tenantId: tenantB, branchId: branchB1, requireBranch: true }),
    ).resolves.toEqual({ status: "invalid_selection" });
  });

  it("rejects sibling branch selection for an exact-branch member", async () => {
    await expect(
      resolver([option()])({
        actorId,
        tenantId: tenantA,
        branchId: branchA2,
        requireBranch: true,
      }),
    ).resolves.toEqual({ status: "invalid_selection" });
  });

  it("requires tenant selection when the actor has multiple tenants", async () => {
    const workspaces = [
      option(),
      option({
        membershipId: "60000000-0000-4000-8000-0000000000b1",
        tenantId: tenantB,
        roleId: "50000000-0000-4000-8000-0000000000b1",
        tenantName: "Tenant B",
        branchId: branchB1,
        branchName: "Branch B1",
        branchCode: "B1",
      }),
    ];
    const result = await resolver(workspaces)({ actorId, requireBranch: true });
    expect(result.status).toBe("selection_required");
  });

  it("returns no access for an authenticated actor with no current membership", async () => {
    await expect(resolver([])({ actorId, requireBranch: true })).resolves.toEqual({
      status: "no_access",
    });
  });

  it("fails closed when workspace discovery is unavailable", async () => {
    const resolve = createAccessContextResolver({
      listWorkspaces: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
    });
    await expect(resolve({ actorId, requireBranch: true })).resolves.toEqual({
      status: "unavailable",
    });
  });

  it("rejects ambiguous duplicate tenant-wide authority instead of picking one", async () => {
    const workspaces = [
      option({
        membershipId: "60000000-0000-4000-8000-0000000000a1",
        roleId: managerRole,
        authorityScope: "TENANT",
      }),
      option({
        membershipId: "60000000-0000-4000-8000-0000000000ff",
        roleId: managerRole,
        authorityScope: "TENANT",
      }),
    ];
    await expect(
      resolver(workspaces)({ actorId, tenantId: tenantA, requireBranch: false }),
    ).resolves.toEqual({ status: "invalid_selection" });
  });
});
