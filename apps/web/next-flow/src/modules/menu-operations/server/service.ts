import "server-only";

import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type { StaffMenuAvailability, StaffMenuControlItem, StaffMenuControlSnapshot } from "../types";
import { MenuOperationError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AVAILABILITY = new Set<StaffMenuAvailability>(["ACTIVE", "SOLD_OUT"]);
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

function itemId(value: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new MenuOperationError("MENU_INVALID_REQUEST");
  return normalized;
}

export function parseStaffMenuAvailability(value: unknown): StaffMenuAvailability {
  if (typeof value !== "string" || !AVAILABILITY.has(value as StaffMenuAvailability)) {
    throw new MenuOperationError("MENU_INVALID_REQUEST");
  }
  return value as StaffMenuAvailability;
}

function mapItem(row: {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  thaiName: string | null;
  priceMinor: string | number | bigint;
  currency: string;
  status: string;
  station: string;
  updatedAt: Date | string;
}): StaffMenuControlItem {
  return Object.freeze({
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    name: row.name,
    thaiName: row.thaiName,
    priceMinor: Number(row.priceMinor),
    currency: row.currency,
    status: row.status,
    station: row.station,
    updatedAt: (row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt)).toISOString(),
  });
}

export async function loadStaffMenuControl(): Promise<StaffMenuControlSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.operationsStaffAccess,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new MenuOperationError("MENU_FORBIDDEN");
        const branch = await trx
          .selectFrom("app.branches")
          .select("restaurant_id")
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", context.branchId)
          .executeTakeFirstOrThrow();
        const rows = await trx
          .selectFrom("foodflow.menu_items as item")
          .innerJoin("foodflow.menu_categories as category", (join) =>
            join
              .onRef("category.tenant_id", "=", "item.tenant_id")
              .onRef("category.restaurant_id", "=", "item.restaurant_id")
              .onRef("category.id", "=", "item.category_id"),
          )
          .select([
            "item.id as id",
            "item.category_id as categoryId",
            "category.name as categoryName",
            "item.name as name",
            "item.thai_name as thaiName",
            "item.base_price_minor as priceMinor",
            "item.currency as currency",
            "item.status as status",
            "item.preparation_station as station",
            "item.updated_at as updatedAt",
          ])
          .where("item.tenant_id", "=", context.tenantId)
          .where("item.restaurant_id", "=", branch.restaurant_id)
          .where("item.archived_at", "is", null)
          .where("item.status", "in", ["ACTIVE", "SOLD_OUT", "HIDDEN", "DRAFT"])
          .orderBy("category.display_order", "asc")
          .orderBy("item.display_order", "asc")
          .orderBy("item.name", "asc")
          .execute();
        const categories = Array.from(new Map(rows.map((row) => [row.categoryId, Object.freeze({ id: row.categoryId, name: row.categoryName })])).values());
        return Object.freeze({
          generatedAt: new Date().toISOString(),
          items: Object.freeze(rows.map(mapItem)),
          categories: Object.freeze(categories),
        });
      },
    );
  } catch (error) {
    if (error instanceof MenuOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new MenuOperationError("MENU_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new MenuOperationError("MENU_UNAVAILABLE", error);
    throw new MenuOperationError("MENU_UNAVAILABLE", error);
  }
}

export async function setStaffMenuAvailability(
  rawItemId: string,
  status: StaffMenuAvailability,
): Promise<StaffMenuControlItem> {
  const normalizedId = itemId(rawItemId);
  const normalizedStatus = parseStaffMenuAvailability(status);
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.operationsStaffAccess,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new MenuOperationError("MENU_FORBIDDEN");
        const branch = await trx
          .selectFrom("app.branches")
          .select("restaurant_id")
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", context.branchId)
          .executeTakeFirstOrThrow();

        let locked: { id: string; status: string; published_at: Date | null } | undefined;
        try {
          const result = await sql<{ id: string; status: string; published_at: Date | null }>`
            select id, status, published_at
            from foodflow.menu_items
            where tenant_id = ${context.tenantId}::uuid
              and restaurant_id = ${branch.restaurant_id}::uuid
              and id = ${normalizedId}::uuid
              and archived_at is null
            for update nowait
          `.execute(trx);
          locked = result.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) throw new MenuOperationError("MENU_CONFLICT", error);
          throw error;
        }
        if (!locked) throw new MenuOperationError("MENU_NOT_FOUND");
        if (!["ACTIVE", "SOLD_OUT"].includes(locked.status)) throw new MenuOperationError("MENU_CONFLICT");

        const now = new Date();
        await trx
          .updateTable("foodflow.menu_items")
          .set({
            status: normalizedStatus,
            published_at: normalizedStatus === "ACTIVE" ? (locked.published_at ?? now) : locked.published_at,
            updated_at: now,
          })
          .where("tenant_id", "=", context.tenantId)
          .where("restaurant_id", "=", branch.restaurant_id)
          .where("id", "=", normalizedId)
          .execute();

        const row = await trx
          .selectFrom("foodflow.menu_items as item")
          .innerJoin("foodflow.menu_categories as category", (join) =>
            join.onRef("category.tenant_id", "=", "item.tenant_id").onRef("category.id", "=", "item.category_id"),
          )
          .select([
            "item.id as id", "item.category_id as categoryId", "category.name as categoryName",
            "item.name as name", "item.thai_name as thaiName", "item.base_price_minor as priceMinor",
            "item.currency as currency", "item.status as status", "item.preparation_station as station", "item.updated_at as updatedAt",
          ])
          .where("item.id", "=", normalizedId)
          .executeTakeFirstOrThrow();
        return mapItem(row);
      },
    );
  } catch (error) {
    if (error instanceof MenuOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new MenuOperationError("MENU_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new MenuOperationError("MENU_UNAVAILABLE", error);
    throw new MenuOperationError("MENU_UNAVAILABLE", error);
  }
}
