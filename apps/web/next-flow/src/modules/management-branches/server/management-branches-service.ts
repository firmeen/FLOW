import "server-only";

import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type {
  ManagedBranchProfile,
  ManagementBranchesSnapshot,
  UpdateManagedBranchProfileInput,
} from "../types";

export type ManagementBranchesErrorCode =
  | "MANAGEMENT_BRANCHES_FORBIDDEN"
  | "MANAGEMENT_BRANCHES_INVALID_INPUT"
  | "MANAGEMENT_BRANCHES_NOT_FOUND"
  | "MANAGEMENT_BRANCHES_CONFLICT"
  | "MANAGEMENT_BRANCHES_UNAVAILABLE";

export class ManagementBranchesError extends Error {
  constructor(readonly code: ManagementBranchesErrorCode, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "ManagementBranchesError";
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";

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
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }
  return value;
}

function requiredText(value: unknown, max: number): string {
  if (typeof value !== "string") throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  const normalized = value.trim();
  if (!normalized || normalized.length > max) {
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }
  return normalized;
}

function optionalText(value: unknown, max: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  const normalized = value.trim();
  if (normalized.length > max) throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  return normalized || null;
}

function countryCode(value: unknown): string | null {
  const normalized = optionalText(value, 2);
  if (normalized === null) return null;
  const upper = normalized.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  return upper;
}

function email(value: unknown): string | null {
  const normalized = optionalText(value, 254);
  if (normalized === null) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }
  return normalized.toLowerCase();
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

async function selectBranch(
  trx: Parameters<Parameters<typeof withAuthorizedCurrentAccessTransaction>[2]>[0],
  tenantId: string,
  branchId: string,
): Promise<ManagedBranchProfile | null> {
  const row = await trx
    .selectFrom("app.branches as branch")
    .innerJoin("app.restaurants as restaurant", (join) =>
      join
        .onRef("restaurant.tenant_id", "=", "branch.tenant_id")
        .onRef("restaurant.id", "=", "branch.restaurant_id"),
    )
    .select([
      "branch.id as id",
      "branch.restaurant_id as restaurantId",
      "restaurant.name as restaurantName",
      "branch.name as name",
      "branch.code as code",
      "branch.address_line1 as addressLine1",
      "branch.address_line2 as addressLine2",
      "branch.district as district",
      "branch.city as city",
      "branch.postal_code as postalCode",
      "branch.country_code as countryCode",
      "branch.phone as phone",
      "branch.email as email",
      "branch.is_open as isOpen",
      "branch.updated_at as updatedAt",
    ])
    .where("branch.tenant_id", "=", tenantId)
    .where("branch.id", "=", branchId)
    .executeTakeFirst();
  return row ? Object.freeze({ ...row, updatedAt: iso(row.updatedAt) }) : null;
}

export async function loadManagementBranches(): Promise<ManagementBranchesSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.settingsView,
      "tenant",
      async (trx, context) => {
        const ids = await trx
          .selectFrom("app.branches")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .orderBy("name", "asc")
          .execute();
        const branches = await Promise.all(
          ids.map((row) => selectBranch(trx, context.tenantId, row.id)),
        );
        return Object.freeze({
          branches: Object.freeze(
            branches.filter((branch): branch is ManagedBranchProfile => Boolean(branch)),
          ),
        });
      },
    );
  } catch (error) {
    if (error instanceof ManagementBranchesError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementBranchesError("MANAGEMENT_BRANCHES_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementBranchesError("MANAGEMENT_BRANCHES_UNAVAILABLE", error);
    }
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_UNAVAILABLE", error);
  }
}

export async function updateManagedBranchProfile(
  branchIdInput: string,
  input: UpdateManagedBranchProfileInput,
): Promise<ManagedBranchProfile> {
  const branchId = uuid(branchIdInput);
  const allowed = new Set([
    "name",
    "addressLine1",
    "addressLine2",
    "district",
    "city",
    "postalCode",
    "countryCode",
    "phone",
    "email",
  ]);
  if (Object.keys(input).length === 0 || Object.keys(input).some((key) => !allowed.has(key))) {
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.settingsManage,
      "tenant",
      async (trx, context) => {
        let locked: { id: string; restaurant_id: string } | undefined;
        try {
          const result = await sql<{ id: string; restaurant_id: string }>`
            select id, restaurant_id
            from app.branches
            where tenant_id = ${context.tenantId}::uuid
              and id = ${branchId}::uuid
            for update nowait
          `.execute(trx);
          locked = result.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new ManagementBranchesError("MANAGEMENT_BRANCHES_CONFLICT", error);
          }
          throw error;
        }
        if (!locked) throw new ManagementBranchesError("MANAGEMENT_BRANCHES_NOT_FOUND");

        const patch: Record<string, unknown> = { updated_at: new Date() };
        if (input.name !== undefined) patch.name = requiredText(input.name, 140);
        if (input.addressLine1 !== undefined) patch.address_line1 = optionalText(input.addressLine1, 240);
        if (input.addressLine2 !== undefined) patch.address_line2 = optionalText(input.addressLine2, 240);
        if (input.district !== undefined) patch.district = optionalText(input.district, 120);
        if (input.city !== undefined) patch.city = optionalText(input.city, 120);
        if (input.postalCode !== undefined) patch.postal_code = optionalText(input.postalCode, 24);
        if (input.countryCode !== undefined) patch.country_code = countryCode(input.countryCode);
        if (input.phone !== undefined) patch.phone = optionalText(input.phone, 40);
        if (input.email !== undefined) patch.email = email(input.email);

        await trx
          .updateTable("app.branches")
          .set(patch)
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", branchId)
          .executeTakeFirstOrThrow();

        const updated = await selectBranch(trx, context.tenantId, branchId);
        if (!updated) throw new ManagementBranchesError("MANAGEMENT_BRANCHES_NOT_FOUND");

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: branchId,
            restaurant_id: locked.restaurant_id,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "BRANCH_PROFILE",
            entity_id: branchId,
            action: "BRANCH_PROFILE_UPDATED",
            summary: `Branch profile updated for ${updated.name}`,
            reason: null,
            metadata: JSON.stringify({ city: updated.city, countryCode: updated.countryCode }),
            correlation_id: null,
          })
          .execute();

        return updated;
      },
    );
  } catch (error) {
    if (error instanceof ManagementBranchesError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementBranchesError("MANAGEMENT_BRANCHES_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementBranchesError("MANAGEMENT_BRANCHES_UNAVAILABLE", error);
    }
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_UNAVAILABLE", error);
  }
}
