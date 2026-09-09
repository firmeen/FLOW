import "server-only";

import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import type { DatabaseTransaction } from "@/server/db/types";

import type {
  CreateManagedRoleInput,
  ManagedPermissionView,
  ManagedRoleView,
  ManagedTeamMember,
  ManagedMembershipStatus,
  TeamAccessSnapshot,
  UpdateManagedMembershipInput,
  UpdateManagedRoleInput,
} from "../types";

export type TeamAccessErrorCode =
  | "TEAM_ACCESS_FORBIDDEN"
  | "TEAM_ACCESS_INVALID_INPUT"
  | "TEAM_ACCESS_NOT_FOUND"
  | "TEAM_ACCESS_CONFLICT"
  | "TEAM_ACCESS_SELF_LOCKOUT"
  | "TEAM_ACCESS_SYSTEM_ROLE"
  | "TEAM_ACCESS_UNAVAILABLE";

export class TeamAccessError extends Error {
  constructor(readonly code: TeamAccessErrorCode, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "TeamAccessError";
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]{1,63}$/;
const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";
const MEMBERSHIP_STATUSES = new Set<Exclude<ManagedMembershipStatus, "INVITED">>([
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
]);

function postgresCode(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 6; depth += 1) {
    if (!current || typeof current !== "object") return null;
    const candidate = current as { readonly code?: unknown; readonly cause?: unknown };
    if (typeof candidate.code === "string") return candidate.code;
    current = candidate.cause;
  }
  return null;
}

function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return value;
}

function roleName(value: unknown): string {
  if (typeof value !== "string") throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  const normalized = value.trim();
  if (!normalized || normalized.length > 100) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return normalized;
}

function roleCode(value: unknown): string {
  if (typeof value !== "string") throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (!ROLE_CODE_PATTERN.test(normalized)) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return normalized;
}

function membershipStatus(value: unknown): Exclude<ManagedMembershipStatus, "INVITED"> {
  if (typeof value !== "string" || !MEMBERSHIP_STATUSES.has(value as Exclude<ManagedMembershipStatus, "INVITED">)) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return value as Exclude<ManagedMembershipStatus, "INVITED">;
}

function permissionCodes(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length > 100 || value.some((code) => typeof code !== "string" || !code.trim())) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return Object.freeze(Array.from(new Set(value.map((code) => code.trim()))));
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

async function selectRolePermissionCodes(
  trx: DatabaseTransaction,
  roleId: string,
): Promise<readonly string[]> {
  const rows = await trx
    .selectFrom("app.role_permissions as link")
    .innerJoin("app.permissions as permission", "permission.id", "link.permission_id")
    .select("permission.code as code")
    .where("link.role_id", "=", roleId)
    .orderBy("permission.code", "asc")
    .execute();
  return Object.freeze(rows.map((row) => row.code));
}

async function selectRole(
  trx: DatabaseTransaction,
  tenantId: string,
  roleId: string,
): Promise<ManagedRoleView | null> {
  const row = await trx
    .selectFrom("app.roles")
    .select(["id", "code", "name", "system"])
    .where("tenant_id", "=", tenantId)
    .where("id", "=", roleId)
    .executeTakeFirst();
  if (!row) return null;
  const [codes, count] = await Promise.all([
    selectRolePermissionCodes(trx, roleId),
    trx
      .selectFrom("app.memberships")
      .select((expression) => expression.fn.countAll<number>().as("count"))
      .where("tenant_id", "=", tenantId)
      .where("role_id", "=", roleId)
      .where("status", "in", ["INVITED", "ACTIVE", "SUSPENDED"])
      .executeTakeFirst(),
  ]);
  return Object.freeze({
    ...row,
    permissionCodes: codes,
    memberCount: Number(count?.count ?? 0),
  });
}

async function selectMember(
  trx: DatabaseTransaction,
  tenantId: string,
  membershipId: string,
): Promise<ManagedTeamMember | null> {
  const row = await trx
    .selectFrom("app.memberships as membership")
    .innerJoin("app.users as user", "user.id", "membership.user_id")
    .innerJoin("app.roles as role", (join) =>
      join.onRef("role.id", "=", "membership.role_id").onRef("role.tenant_id", "=", "membership.tenant_id"),
    )
    .leftJoin("app.branches as branch", (join) =>
      join.onRef("branch.id", "=", "membership.branch_id").onRef("branch.tenant_id", "=", "membership.tenant_id"),
    )
    .select([
      "membership.id as membershipId",
      "membership.user_id as userId",
      "user.display_name as displayName",
      "user.email as email",
      "user.status as userStatus",
      "membership.status as membershipStatus",
      "membership.role_id as roleId",
      "role.code as roleCode",
      "role.name as roleName",
      "membership.branch_id as branchId",
      "branch.name as branchName",
      "membership.created_at as createdAt",
    ])
    .where("membership.tenant_id", "=", tenantId)
    .where("membership.id", "=", membershipId)
    .executeTakeFirst();
  if (!row) return null;
  return Object.freeze({
    ...row,
    membershipStatus: row.membershipStatus as ManagedMembershipStatus,
    authorityScope: row.branchId ? "BRANCH" : "TENANT",
    createdAt: iso(row.createdAt),
  });
}

async function resolvePermissionIds(
  trx: DatabaseTransaction,
  codes: readonly string[],
): Promise<readonly string[]> {
  if (codes.length === 0) return Object.freeze([]);
  const rows = await trx
    .selectFrom("app.permissions")
    .select(["id", "code"])
    .where("code", "in", [...codes])
    .execute();
  if (rows.length !== codes.length) throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  return Object.freeze(rows.map((row) => row.id));
}

export async function loadTeamAccessSnapshot(): Promise<TeamAccessSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.memberView,
      "tenant",
      async (trx, context) => {
        const [membershipIds, roleIds, permissionRows] = await Promise.all([
          trx
            .selectFrom("app.memberships")
            .select("id")
            .where("tenant_id", "=", context.tenantId)
            .orderBy("created_at", "asc")
            .execute(),
          trx
            .selectFrom("app.roles")
            .select("id")
            .where("tenant_id", "=", context.tenantId)
            .orderBy("name", "asc")
            .execute(),
          trx
            .selectFrom("app.permissions")
            .select(["code", "description"])
            .orderBy("code", "asc")
            .execute(),
        ]);

        const [members, roles] = await Promise.all([
          Promise.all(membershipIds.map((row) => selectMember(trx, context.tenantId, row.id))),
          Promise.all(roleIds.map((row) => selectRole(trx, context.tenantId, row.id))),
        ]);

        return Object.freeze({
          members: Object.freeze(members.filter((member): member is ManagedTeamMember => Boolean(member))),
          roles: Object.freeze(roles.filter((role): role is ManagedRoleView => Boolean(role))),
          permissions: Object.freeze(permissionRows.map((row) => Object.freeze(row as ManagedPermissionView))),
        });
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}

export async function updateManagedMembership(
  membershipIdInput: string,
  input: UpdateManagedMembershipInput,
): Promise<ManagedTeamMember> {
  const membershipId = uuid(membershipIdInput);
  const allowed = new Set(["roleId", "status"]);
  if (Object.keys(input).length === 0 || Object.keys(input).some((key) => !allowed.has(key))) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.memberManage,
      "tenant",
      async (trx, context) => {
        let locked: { id: string; user_id: string; role_id: string; status: string } | undefined;
        try {
          const result = await sql<{ id: string; user_id: string; role_id: string; status: string }>`
            select id, user_id, role_id, status
            from app.memberships
            where tenant_id = ${context.tenantId}::uuid
              and id = ${membershipId}::uuid
            for update nowait
          `.execute(trx);
          locked = result.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new TeamAccessError("TEAM_ACCESS_CONFLICT", error);
          }
          throw error;
        }
        if (!locked) throw new TeamAccessError("TEAM_ACCESS_NOT_FOUND");

        const nextRoleId = input.roleId === undefined ? locked.role_id : uuid(input.roleId);
        const nextStatus = input.status === undefined ? locked.status : membershipStatus(input.status);
        if (locked.user_id === context.actorId && (nextRoleId !== locked.role_id || nextStatus !== "ACTIVE")) {
          throw new TeamAccessError("TEAM_ACCESS_SELF_LOCKOUT");
        }

        const role = await trx
          .selectFrom("app.roles")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", nextRoleId)
          .executeTakeFirst();
        if (!role) throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");

        await trx
          .updateTable("app.memberships")
          .set({ role_id: nextRoleId, status: nextStatus, updated_at: new Date() })
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", membershipId)
          .executeTakeFirstOrThrow();

        const updated = await selectMember(trx, context.tenantId, membershipId);
        if (!updated) throw new TeamAccessError("TEAM_ACCESS_NOT_FOUND");
        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: updated.branchId,
            restaurant_id: null,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "MEMBERSHIP",
            entity_id: membershipId,
            action: "MEMBERSHIP_UPDATED",
            summary: `Access updated for ${updated.displayName}`,
            reason: null,
            metadata: JSON.stringify({ roleCode: updated.roleCode, status: updated.membershipStatus }),
            correlation_id: null,
          })
          .execute();
        return updated;
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}

export async function createManagedRole(input: CreateManagedRoleInput): Promise<ManagedRoleView> {
  const name = roleName(input.name);
  const code = roleCode(input.code);
  const codes = permissionCodes(input.permissionCodes ?? []);

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.roleManage,
      "tenant",
      async (trx, context) => {
        const ids = await resolvePermissionIds(trx, codes);
        const created = await trx
          .insertInto("app.roles")
          .values({ tenant_id: context.tenantId, code, name, system: false })
          .returning("id")
          .executeTakeFirstOrThrow();
        if (ids.length) {
          await trx
            .insertInto("app.role_permissions")
            .values(ids.map((permissionId) => ({ role_id: created.id, permission_id: permissionId })))
            .execute();
        }
        await trx
          .insertInto("audit.events")
          .values({ tenant_id: context.tenantId, branch_id: null, restaurant_id: null, actor_id: context.actorId, actor_name_snapshot: null, entity_type: "ROLE", entity_id: created.id, action: "ROLE_CREATED", summary: `Role ${name} created`, reason: null, metadata: JSON.stringify({ code, permissionCodes: codes }), correlation_id: null })
          .execute();
        const role = await selectRole(trx, context.tenantId, created.id);
        if (!role) throw new TeamAccessError("TEAM_ACCESS_NOT_FOUND");
        return role;
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (postgresCode(error) === "23505") throw new TeamAccessError("TEAM_ACCESS_CONFLICT", error);
    if (error instanceof AuthorizationDeniedError) throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}

export async function updateManagedRole(
  roleIdInput: string,
  input: UpdateManagedRoleInput,
): Promise<ManagedRoleView> {
  const roleId = uuid(roleIdInput);
  const allowed = new Set(["name", "permissionCodes"]);
  if (Object.keys(input).length === 0 || Object.keys(input).some((key) => !allowed.has(key))) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.roleManage,
      "tenant",
      async (trx, context) => {
        let locked: { id: string; system: boolean; name: string } | undefined;
        try {
          const result = await sql<{ id: string; system: boolean; name: string }>`
            select id, system, name
            from app.roles
            where tenant_id = ${context.tenantId}::uuid
              and id = ${roleId}::uuid
            for update nowait
          `.execute(trx);
          locked = result.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new TeamAccessError("TEAM_ACCESS_CONFLICT", error);
          }
          throw error;
        }
        if (!locked) throw new TeamAccessError("TEAM_ACCESS_NOT_FOUND");
        if (locked.system) throw new TeamAccessError("TEAM_ACCESS_SYSTEM_ROLE");

        if (input.name !== undefined) {
          await trx
            .updateTable("app.roles")
            .set({ name: roleName(input.name) })
            .where("tenant_id", "=", context.tenantId)
            .where("id", "=", roleId)
            .executeTakeFirstOrThrow();
        }

        if (input.permissionCodes !== undefined) {
          const codes = permissionCodes(input.permissionCodes);
          const ids = await resolvePermissionIds(trx, codes);
          await trx.deleteFrom("app.role_permissions").where("role_id", "=", roleId).execute();
          if (ids.length) {
            await trx
              .insertInto("app.role_permissions")
              .values(ids.map((permissionId) => ({ role_id: roleId, permission_id: permissionId })))
              .execute();
          }
        }

        const updated = await selectRole(trx, context.tenantId, roleId);
        if (!updated) throw new TeamAccessError("TEAM_ACCESS_NOT_FOUND");
        await trx
          .insertInto("audit.events")
          .values({ tenant_id: context.tenantId, branch_id: null, restaurant_id: null, actor_id: context.actorId, actor_name_snapshot: null, entity_type: "ROLE", entity_id: roleId, action: "ROLE_UPDATED", summary: `Role ${updated.name} updated`, reason: null, metadata: JSON.stringify({ permissionCodes: updated.permissionCodes }), correlation_id: null })
          .execute();
        return updated;
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}
