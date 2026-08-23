import "server-only";

import { sql } from "kysely";

import { withIdentityTransaction } from "@/server/db/identity-transaction";

import type { AccessScope, WorkspaceOption } from "./access-context";

interface WorkspaceRow {
  membership_id: string;
  tenant_id: string;
  role_id: string;
  authority_scope: string;
  tenant_name: string;
  branch_id: string | null;
  branch_name: string | null;
  branch_code: string | null;
}

export class WorkspaceRepositoryError extends Error {
  constructor(cause?: unknown) {
    super("Workspace discovery failed", { cause });
    this.name = "WorkspaceRepositoryError";
  }
}

function mapAuthorityScope(value: string): AccessScope {
  if (value === "TENANT" || value === "BRANCH") return value;
  throw new WorkspaceRepositoryError(
    new Error(`Unexpected workspace authority scope: ${value}`),
  );
}

function mapWorkspace(row: WorkspaceRow): WorkspaceOption {
  const authorityScope = mapAuthorityScope(row.authority_scope);
  if (authorityScope === "BRANCH" && !row.branch_id) {
    throw new WorkspaceRepositoryError(
      new Error("Branch-bound membership returned without a branch"),
    );
  }

  return {
    membershipId: row.membership_id,
    tenantId: row.tenant_id,
    roleId: row.role_id,
    authorityScope,
    tenantName: row.tenant_name,
    branchId: row.branch_id,
    branchName: row.branch_name,
    branchCode: row.branch_code,
  };
}

export async function listActorWorkspaces(actorId: string): Promise<WorkspaceOption[]> {
  try {
    return await withIdentityTransaction(actorId, async (trx) => {
      const result = await sql<WorkspaceRow>`
        select * from private.list_actor_workspaces()
      `.execute(trx);

      return result.rows.map(mapWorkspace);
    });
  } catch (error) {
    if (error instanceof WorkspaceRepositoryError) throw error;
    throw new WorkspaceRepositoryError(error);
  }
}
