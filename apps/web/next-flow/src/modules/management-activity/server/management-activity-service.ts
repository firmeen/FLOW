import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type {
  ManagementActivityEvent,
  ManagementActivitySnapshot,
} from "../types";

export type ManagementActivityErrorCode =
  | "MANAGEMENT_ACTIVITY_FORBIDDEN"
  | "MANAGEMENT_ACTIVITY_UNAVAILABLE";

export class ManagementActivityError extends Error {
  constructor(readonly code: ManagementActivityErrorCode, cause?: unknown) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "ManagementActivityError";
  }
}

function iso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

export async function loadManagementActivity(): Promise<ManagementActivitySnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.auditView,
      "tenant",
      async (trx, context) => {
        const rows = await trx
          .selectFrom("audit.events as event")
          .leftJoin("app.branches as branch", (join) =>
            join
              .onRef("branch.tenant_id", "=", "event.tenant_id")
              .onRef("branch.id", "=", "event.branch_id"),
          )
          .select([
            "event.id as id",
            "event.action as action",
            "event.summary as summary",
            "event.entity_type as entityType",
            "event.entity_id as entityId",
            "event.actor_id as actorId",
            "event.actor_name_snapshot as actorName",
            "event.restaurant_id as restaurantId",
            "event.branch_id as branchId",
            "branch.name as branchName",
            "event.reason as reason",
            "event.occurred_at as occurredAt",
          ])
          .where("event.tenant_id", "=", context.tenantId)
          .orderBy("event.occurred_at", "desc")
          .orderBy("event.id", "desc")
          .limit(150)
          .execute();

        return Object.freeze({
          events: Object.freeze(
            rows.map(
              (row) =>
                Object.freeze({
                  ...row,
                  occurredAt: iso(row.occurredAt),
                }) as ManagementActivityEvent,
            ),
          ),
        });
      },
    );
  } catch (error) {
    if (error instanceof ManagementActivityError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new ManagementActivityError("MANAGEMENT_ACTIVITY_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new ManagementActivityError("MANAGEMENT_ACTIVITY_UNAVAILABLE", error);
    }
    throw new ManagementActivityError("MANAGEMENT_ACTIVITY_UNAVAILABLE", error);
  }
}
