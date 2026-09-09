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
  ManagedBranchSettings,
  ManagementSettingsSnapshot,
  UpdateManagedBranchSettingsInput,
} from "../types";

export type ManagementSettingsErrorCode =
  | "MANAGEMENT_SETTINGS_FORBIDDEN"
  | "MANAGEMENT_SETTINGS_INVALID_INPUT"
  | "MANAGEMENT_SETTINGS_NOT_FOUND"
  | "MANAGEMENT_SETTINGS_CONFLICT"
  | "MANAGEMENT_SETTINGS_UNAVAILABLE";

export class ManagementSettingsError extends Error {
  constructor(readonly code: ManagementSettingsErrorCode, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "ManagementSettingsError";
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
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }
  return value;
}

function boundedInteger(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max) {
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }
  return value;
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

async function selectBranchSettings(
  trx: DatabaseTransaction,
  tenantId: string,
  branchId: string,
): Promise<ManagedBranchSettings | null> {
  const row = await trx
    .selectFrom("app.branches as branch")
    .innerJoin("app.restaurants as restaurant", (join) =>
      join
        .onRef("restaurant.tenant_id", "=", "branch.tenant_id")
        .onRef("restaurant.id", "=", "branch.restaurant_id"),
    )
    .innerJoin("app.branch_settings as settings", (join) =>
      join
        .onRef("settings.tenant_id", "=", "branch.tenant_id")
        .onRef("settings.branch_id", "=", "branch.id"),
    )
    .select([
      "branch.id as branchId",
      "branch.name as branchName",
      "branch.code as branchCode",
      "branch.restaurant_id as restaurantId",
      "restaurant.name as restaurantName",
      "branch.is_open as isOpen",
      "settings.currency as currency",
      "settings.timezone as timezone",
      "settings.service_charge_enabled as serviceChargeEnabled",
      "settings.service_charge_bps as serviceChargeBps",
      "settings.vat_enabled as vatEnabled",
      "settings.vat_bps as vatBps",
      "settings.default_preparation_minutes as defaultPreparationMinutes",
      "settings.updated_at as updatedAt",
    ])
    .where("branch.tenant_id", "=", tenantId)
    .where("branch.id", "=", branchId)
    .executeTakeFirst();

  return row
    ? Object.freeze({
        ...row,
        updatedAt: iso(row.updatedAt),
      })
    : null;
}

export async function loadManagementSettings(): Promise<ManagementSettingsSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.settingsView,
      "tenant",
      async (trx, context) => {
        const branches = await trx
          .selectFrom("app.branches")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .orderBy("name", "asc")
          .execute();
        const resolved = await Promise.all(
          branches.map((branch) => selectBranchSettings(trx, context.tenantId, branch.id)),
        );
        return Object.freeze({
          branches: Object.freeze(
            resolved.filter((branch): branch is ManagedBranchSettings => Boolean(branch)),
          ),
        });
      },
    );
  } catch (error) {
    if (error instanceof ManagementSettingsError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementSettingsError("MANAGEMENT_SETTINGS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementSettingsError("MANAGEMENT_SETTINGS_UNAVAILABLE", error);
    }
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_UNAVAILABLE", error);
  }
}

export async function updateManagedBranchSettings(
  branchIdInput: string,
  input: UpdateManagedBranchSettingsInput,
): Promise<ManagedBranchSettings> {
  const branchId = uuid(branchIdInput);
  const allowed = new Set([
    "isOpen",
    "serviceChargeEnabled",
    "serviceChargeBps",
    "vatEnabled",
    "vatBps",
    "defaultPreparationMinutes",
  ]);
  if (Object.keys(input).length === 0 || Object.keys(input).some((key) => !allowed.has(key))) {
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.settingsManage,
      "tenant",
      async (trx, context) => {
        try {
          const lock = await sql<{ id: string }>`
            select id
            from app.branch_settings
            where tenant_id = ${context.tenantId}::uuid
              and branch_id = ${branchId}::uuid
            for update nowait
          `.execute(trx);
          if (!lock.rows[0]) throw new ManagementSettingsError("MANAGEMENT_SETTINGS_NOT_FOUND");
        } catch (error) {
          if (error instanceof ManagementSettingsError) throw error;
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new ManagementSettingsError("MANAGEMENT_SETTINGS_CONFLICT", error);
          }
          throw error;
        }

        const settingsPatch: Record<string, unknown> = { updated_at: new Date() };
        if (input.serviceChargeEnabled !== undefined) {
          if (typeof input.serviceChargeEnabled !== "boolean") {
            throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
          }
          settingsPatch.service_charge_enabled = input.serviceChargeEnabled;
        }
        if (input.serviceChargeBps !== undefined) {
          settingsPatch.service_charge_bps = boundedInteger(input.serviceChargeBps, 10_000);
        }
        if (input.vatEnabled !== undefined) {
          if (typeof input.vatEnabled !== "boolean") {
            throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
          }
          settingsPatch.vat_enabled = input.vatEnabled;
        }
        if (input.vatBps !== undefined) {
          settingsPatch.vat_bps = boundedInteger(input.vatBps, 10_000);
        }
        if (input.defaultPreparationMinutes !== undefined) {
          settingsPatch.default_preparation_minutes = boundedInteger(
            input.defaultPreparationMinutes,
            24 * 60,
          );
        }

        if (input.isOpen !== undefined) {
          if (typeof input.isOpen !== "boolean") {
            throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
          }
          await trx
            .updateTable("app.branches")
            .set({ is_open: input.isOpen, updated_at: new Date() })
            .where("tenant_id", "=", context.tenantId)
            .where("id", "=", branchId)
            .executeTakeFirstOrThrow();
        }

        await trx
          .updateTable("app.branch_settings")
          .set(settingsPatch)
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", branchId)
          .executeTakeFirstOrThrow();

        const updated = await selectBranchSettings(trx, context.tenantId, branchId);
        if (!updated) throw new ManagementSettingsError("MANAGEMENT_SETTINGS_NOT_FOUND");

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: branchId,
            restaurant_id: updated.restaurantId,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "BRANCH_SETTINGS",
            entity_id: branchId,
            action: "BRANCH_SETTINGS_UPDATED",
            summary: `Branch settings updated for ${updated.branchName}`,
            reason: null,
            metadata: JSON.stringify({
              isOpen: updated.isOpen,
              serviceChargeEnabled: updated.serviceChargeEnabled,
              serviceChargeBps: updated.serviceChargeBps,
              vatEnabled: updated.vatEnabled,
              vatBps: updated.vatBps,
              defaultPreparationMinutes: updated.defaultPreparationMinutes,
            }),
            correlation_id: null,
          })
          .execute();

        return updated;
      },
    );
  } catch (error) {
    if (error instanceof ManagementSettingsError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementSettingsError("MANAGEMENT_SETTINGS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementSettingsError("MANAGEMENT_SETTINGS_UNAVAILABLE", error);
    }
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_UNAVAILABLE", error);
  }
}
