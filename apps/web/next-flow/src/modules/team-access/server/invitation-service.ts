import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { sql } from "kysely";

import { normalizeLoginEmail } from "@/modules/identity/server/email";
import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type {
  CreateTeamInvitationInput,
  CreatedTeamInvitation,
  ManagedInvitationView,
  TeamInvitationWorkspace,
} from "../types";
import { TeamAccessError } from "./team-access-service";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";
const MIN_EXPIRY_HOURS = 1;
const MAX_EXPIRY_HOURS = 14 * 24;
const DEFAULT_EXPIRY_HOURS = 72;

interface InvitationRow {
  id: string;
  email: string;
  display_name: string;
  role_id: string;
  role_code: string;
  role_name: string;
  branch_id: string | null;
  branch_code: string | null;
  branch_name: string | null;
  expires_at: Date | string;
  created_at: Date | string;
  accepted_at: Date | string | null;
  revoked_at: Date | string | null;
}

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

function displayName(value: unknown): string {
  if (typeof value !== "string") throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  const normalized = value.trim();
  if (!normalized || normalized.length > 100) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return normalized;
}

function expiryHours(value: unknown): number {
  if (value === undefined) return DEFAULT_EXPIRY_HOURS;
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < MIN_EXPIRY_HOURS ||
    value > MAX_EXPIRY_HOURS
  ) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return value;
}

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE");
  return parsed.toISOString();
}

function mapInvitation(row: InvitationRow, now = Date.now()): ManagedInvitationView {
  const acceptedAt = iso(row.accepted_at);
  const revokedAt = iso(row.revoked_at);
  const expiresAt = iso(row.expires_at);
  const createdAt = iso(row.created_at);
  if (!expiresAt || !createdAt) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE");

  const status: ManagedInvitationView["status"] = acceptedAt
    ? "ACCEPTED"
    : revokedAt
      ? "REVOKED"
      : Date.parse(expiresAt) <= now
        ? "EXPIRED"
        : "PENDING";

  return Object.freeze({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    roleId: row.role_id,
    roleCode: row.role_code,
    roleName: row.role_name,
    branchId: row.branch_id,
    branchCode: row.branch_code,
    branchName: row.branch_name,
    status,
    expiresAt,
    createdAt,
    acceptedAt,
    revokedAt,
  });
}

async function selectInvitation(
  trx: Parameters<Parameters<typeof withAuthorizedCurrentAccessTransaction>[2]>[0],
  tenantId: string,
  invitationId: string,
): Promise<ManagedInvitationView | null> {
  const result = await sql<InvitationRow>`
    select
      invitation.id,
      invitation.email,
      invitation.display_name,
      invitation.role_id,
      role.code as role_code,
      role.name as role_name,
      invitation.branch_id,
      branch.code as branch_code,
      branch.name as branch_name,
      invitation.expires_at,
      invitation.created_at,
      invitation.accepted_at,
      invitation.revoked_at
    from private.team_invitations invitation
    join app.roles role
      on role.tenant_id = invitation.tenant_id
     and role.id = invitation.role_id
    left join app.branches branch
      on branch.tenant_id = invitation.tenant_id
     and branch.id = invitation.branch_id
    where invitation.tenant_id = ${tenantId}::uuid
      and invitation.id = ${invitationId}::uuid
  `.execute(trx);
  return result.rows[0] ? mapInvitation(result.rows[0]) : null;
}

function digestToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function loadTeamInvitationWorkspace(): Promise<TeamInvitationWorkspace> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.memberInvite,
      "tenant",
      async (trx, context) => {
        const [roles, branches, invitationResult] = await Promise.all([
          trx
            .selectFrom("app.roles")
            .select(["id", "code", "name"])
            .where("tenant_id", "=", context.tenantId)
            .orderBy("system", "desc")
            .orderBy("name", "asc")
            .execute(),
          trx
            .selectFrom("app.branches")
            .select(["id", "code", "name"])
            .where("tenant_id", "=", context.tenantId)
            .orderBy("name", "asc")
            .execute(),
          sql<InvitationRow>`
            select
              invitation.id,
              invitation.email,
              invitation.display_name,
              invitation.role_id,
              role.code as role_code,
              role.name as role_name,
              invitation.branch_id,
              branch.code as branch_code,
              branch.name as branch_name,
              invitation.expires_at,
              invitation.created_at,
              invitation.accepted_at,
              invitation.revoked_at
            from private.team_invitations invitation
            join app.roles role
              on role.tenant_id = invitation.tenant_id
             and role.id = invitation.role_id
            left join app.branches branch
              on branch.tenant_id = invitation.tenant_id
             and branch.id = invitation.branch_id
            where invitation.tenant_id = ${context.tenantId}::uuid
            order by invitation.created_at desc
            limit 100
          `.execute(trx),
        ]);

        return Object.freeze({
          invitations: Object.freeze(invitationResult.rows.map((row) => mapInvitation(row))),
          roles: Object.freeze(roles.map((role) => Object.freeze(role))),
          branches: Object.freeze(branches.map((branch) => Object.freeze(branch))),
        });
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    }
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}

export async function createTeamInvitation(
  input: CreateTeamInvitationInput,
): Promise<CreatedTeamInvitation> {
  const allowed = new Set(["email", "displayName", "roleId", "branchId", "expiresInHours"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }

  let email: string;
  try {
    email = normalizeLoginEmail(input.email);
  } catch (error) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT", error);
  }
  const name = displayName(input.displayName);
  const roleId = uuid(input.roleId);
  const branchId = input.branchId === null || input.branchId === undefined ? null : uuid(input.branchId);
  const hours = expiryHours(input.expiresInHours);
  const token = randomBytes(32).toString("base64url");
  const tokenDigest = digestToken(token);

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.memberInvite,
      "tenant",
      async (trx, context) => {
        const role = await trx
          .selectFrom("app.roles")
          .select(["id", "code", "name"])
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", roleId)
          .executeTakeFirst();
        if (!role) throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");

        let branch: { id: string; code: string; name: string } | null = null;
        if (branchId) {
          branch =
            (await trx
              .selectFrom("app.branches")
              .select(["id", "code", "name"])
              .where("tenant_id", "=", context.tenantId)
              .where("id", "=", branchId)
              .executeTakeFirst()) ?? null;
          if (!branch) throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
        }

        const existingMembership = await trx
          .selectFrom("app.memberships as membership")
          .innerJoin("app.users as user", "user.id", "membership.user_id")
          .select("membership.id")
          .where("membership.tenant_id", "=", context.tenantId)
          .where("membership.role_id", "=", roleId)
          .where("membership.branch_id", branchId === null ? "is" : "=", branchId)
          .where("membership.status", "=", "ACTIVE")
          .where("user.normalized_email", "=", email)
          .executeTakeFirst();
        if (existingMembership) throw new TeamAccessError("TEAM_ACCESS_CONFLICT");

        await sql`
          update private.team_invitations
          set revoked_at = now(), updated_at = now()
          where tenant_id = ${context.tenantId}::uuid
            and normalized_email = ${email}
            and accepted_at is null
            and revoked_at is null
        `.execute(trx);

        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        const inserted = await sql<{ id: string }>`
          insert into private.team_invitations (
            tenant_id,
            email,
            display_name,
            role_id,
            branch_id,
            token_digest,
            invited_by,
            expires_at
          ) values (
            ${context.tenantId}::uuid,
            ${email},
            ${name},
            ${roleId}::uuid,
            ${branchId}::uuid,
            ${tokenDigest},
            ${context.actorId}::uuid,
            ${expiresAt}
          )
          returning id
        `.execute(trx);
        const invitationId = inserted.rows[0]?.id;
        if (!invitationId) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE");

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: branchId,
            restaurant_id: null,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "TEAM_INVITATION",
            entity_id: invitationId,
            action: "TEAM_INVITATION_CREATED",
            summary: `Invitation created for ${email}`,
            reason: null,
            metadata: JSON.stringify({ roleCode: role.code, branchCode: branch?.code ?? null, expiresInHours: hours }),
            correlation_id: null,
          })
          .execute();

        const invitation = await selectInvitation(trx, context.tenantId, invitationId);
        if (!invitation) throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE");
        return Object.freeze({ invitation, token });
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (postgresCode(error) === "23505") {
      throw new TeamAccessError("TEAM_ACCESS_CONFLICT", error);
    }
    if (error instanceof AuthorizationDeniedError) {
      throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    }
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}

export async function revokeTeamInvitation(invitationIdInput: string): Promise<ManagedInvitationView> {
  const invitationId = uuid(invitationIdInput);
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.memberInvite,
      "tenant",
      async (trx, context) => {
        let locked:
          | { id: string; email: string; accepted_at: Date | null; revoked_at: Date | null }
          | undefined;
        try {
          const result = await sql<{
            id: string;
            email: string;
            accepted_at: Date | null;
            revoked_at: Date | null;
          }>`
            select id, email, accepted_at, revoked_at
            from private.team_invitations
            where tenant_id = ${context.tenantId}::uuid
              and id = ${invitationId}::uuid
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
        if (locked.accepted_at || locked.revoked_at) {
          throw new TeamAccessError("TEAM_ACCESS_CONFLICT");
        }

        await sql`
          update private.team_invitations
          set revoked_at = now(), updated_at = now()
          where tenant_id = ${context.tenantId}::uuid
            and id = ${invitationId}::uuid
        `.execute(trx);

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: null,
            restaurant_id: null,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "TEAM_INVITATION",
            entity_id: invitationId,
            action: "TEAM_INVITATION_REVOKED",
            summary: `Invitation revoked for ${locked.email}`,
            reason: null,
            metadata: null,
            correlation_id: null,
          })
          .execute();

        const invitation = await selectInvitation(trx, context.tenantId, invitationId);
        if (!invitation) throw new TeamAccessError("TEAM_ACCESS_NOT_FOUND");
        return invitation;
      },
    );
  } catch (error) {
    if (error instanceof TeamAccessError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new TeamAccessError("TEAM_ACCESS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
    }
    throw new TeamAccessError("TEAM_ACCESS_UNAVAILABLE", error);
  }
}
