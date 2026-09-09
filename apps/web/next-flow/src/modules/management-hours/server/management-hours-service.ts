import "server-only";

import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type {
  ManagedBranchHours,
  ManagedOpeningWindow,
  ManagementHoursSnapshot,
  OpeningDay,
  UpdateManagedOpeningWindowInput,
} from "../types";

export type ManagementHoursErrorCode =
  | "MANAGEMENT_HOURS_FORBIDDEN"
  | "MANAGEMENT_HOURS_INVALID_INPUT"
  | "MANAGEMENT_HOURS_NOT_FOUND"
  | "MANAGEMENT_HOURS_CONFLICT"
  | "MANAGEMENT_HOURS_UNAVAILABLE";

export class ManagementHoursError extends Error {
  constructor(readonly code: ManagementHoursErrorCode, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "ManagementHoursError";
  }
}

const DAYS: readonly OpeningDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const DAY_SET = new Set<OpeningDay>(DAYS);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
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
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
  return value;
}

function day(value: unknown): OpeningDay {
  if (typeof value !== "string" || !DAY_SET.has(value as OpeningDay)) {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
  return value as OpeningDay;
}

function time(value: unknown, closed: boolean): string | null {
  if (closed) return null;
  if (typeof value !== "string" || !TIME_PATTERN.test(value)) {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
  return value;
}

function blankWindow(dayValue: OpeningDay): ManagedOpeningWindow {
  return Object.freeze({
    id: null,
    day: dayValue,
    isClosed: true,
    startTime: null,
    endTime: null,
  });
}

export async function loadManagementHours(): Promise<ManagementHoursSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.settingsView,
      "tenant",
      async (trx, context) => {
        const branches = await trx
          .selectFrom("app.branches as branch")
          .innerJoin("app.branch_settings as settings", (join) =>
            join
              .onRef("settings.tenant_id", "=", "branch.tenant_id")
              .onRef("settings.branch_id", "=", "branch.id"),
          )
          .select([
            "branch.id as branchId",
            "branch.name as branchName",
            "branch.code as branchCode",
            "settings.timezone as timezone",
          ])
          .where("branch.tenant_id", "=", context.tenantId)
          .orderBy("branch.name", "asc")
          .execute();

        const rows = await trx
          .selectFrom("app.branch_opening_hours")
          .select([
            "id",
            "branch_id as branchId",
            "day_of_week as day",
            "is_closed as isClosed",
            "start_time as startTime",
            "end_time as endTime",
          ])
          .where("tenant_id", "=", context.tenantId)
          .where("display_order", "=", 0)
          .execute();

        const byBranch = new Map<string, Map<OpeningDay, ManagedOpeningWindow>>();
        for (const row of rows) {
          const map = byBranch.get(row.branchId) ?? new Map<OpeningDay, ManagedOpeningWindow>();
          const rowDay = row.day as OpeningDay;
          map.set(
            rowDay,
            Object.freeze({
              id: row.id,
              day: rowDay,
              isClosed: row.isClosed,
              startTime: row.startTime,
              endTime: row.endTime,
            }),
          );
          byBranch.set(row.branchId, map);
        }

        return Object.freeze({
          branches: Object.freeze(
            branches.map(
              (branch) =>
                Object.freeze({
                  ...branch,
                  windows: Object.freeze(
                    DAYS.map((dayValue) => byBranch.get(branch.branchId)?.get(dayValue) ?? blankWindow(dayValue)),
                  ),
                }) as ManagedBranchHours,
            ),
          ),
        });
      },
    );
  } catch (error) {
    if (error instanceof ManagementHoursError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementHoursError("MANAGEMENT_HOURS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementHoursError("MANAGEMENT_HOURS_UNAVAILABLE", error);
    }
    throw new ManagementHoursError("MANAGEMENT_HOURS_UNAVAILABLE", error);
  }
}

export async function updateManagedOpeningWindow(
  branchIdInput: string,
  input: UpdateManagedOpeningWindowInput,
): Promise<ManagedOpeningWindow> {
  const branchId = uuid(branchIdInput);
  const nextDay = day(input.day);
  if (typeof input.isClosed !== "boolean") {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
  const startTime = time(input.startTime, input.isClosed);
  const endTime = time(input.endTime, input.isClosed);
  if (!input.isClosed && startTime === endTime) {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.settingsManage,
      "tenant",
      async (trx, context) => {
        try {
          const lock = await sql<{ id: string }>`
            select id
            from app.branches
            where tenant_id = ${context.tenantId}::uuid
              and id = ${branchId}::uuid
            for update nowait
          `.execute(trx);
          if (!lock.rows[0]) throw new ManagementHoursError("MANAGEMENT_HOURS_NOT_FOUND");
        } catch (error) {
          if (error instanceof ManagementHoursError) throw error;
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new ManagementHoursError("MANAGEMENT_HOURS_CONFLICT", error);
          }
          throw error;
        }

        const row = await trx
          .insertInto("app.branch_opening_hours")
          .values({
            tenant_id: context.tenantId,
            branch_id: branchId,
            day_of_week: nextDay,
            is_closed: input.isClosed,
            start_time: startTime,
            end_time: endTime,
            display_order: 0,
          })
          .onConflict((conflict) =>
            conflict
              .columns(["tenant_id", "branch_id", "day_of_week", "display_order"])
              .doUpdateSet({
                is_closed: input.isClosed,
                start_time: startTime,
                end_time: endTime,
              }),
          )
          .returning([
            "id",
            "day_of_week as day",
            "is_closed as isClosed",
            "start_time as startTime",
            "end_time as endTime",
          ])
          .executeTakeFirstOrThrow();

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: branchId,
            restaurant_id: null,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "BRANCH_OPENING_HOURS",
            entity_id: row.id,
            action: "BRANCH_OPENING_HOURS_UPDATED",
            summary: `${nextDay} opening hours updated`,
            reason: null,
            metadata: JSON.stringify({
              day: nextDay,
              isClosed: input.isClosed,
              startTime,
              endTime,
            }),
            correlation_id: null,
          })
          .execute();

        return Object.freeze({
          id: row.id,
          day: row.day as OpeningDay,
          isClosed: row.isClosed,
          startTime: row.startTime,
          endTime: row.endTime,
        });
      },
    );
  } catch (error) {
    if (error instanceof ManagementHoursError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementHoursError("MANAGEMENT_HOURS_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementHoursError("MANAGEMENT_HOURS_UNAVAILABLE", error);
    }
    throw new ManagementHoursError("MANAGEMENT_HOURS_UNAVAILABLE", error);
  }
}
