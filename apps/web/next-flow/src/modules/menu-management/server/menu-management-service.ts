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
  ManagedMenuAvailability,
  ManagedMenuCategory,
  ManagedMenuItem,
  ManagedMenuItemStatus,
  ManagedRestaurant,
  MenuManagementSnapshot,
  UpdateManagedMenuItemInput,
} from "../types";

export type MenuManagementErrorCode =
  | "MENU_MANAGEMENT_FORBIDDEN"
  | "MENU_MANAGEMENT_INVALID_INPUT"
  | "MENU_MANAGEMENT_NOT_FOUND"
  | "MENU_MANAGEMENT_CONFLICT"
  | "MENU_MANAGEMENT_UNAVAILABLE";

export class MenuManagementError extends Error {
  constructor(
    readonly code: MenuManagementErrorCode,
    cause?: unknown,
  ) {
    super(code, cause === undefined ? undefined : { cause });
    this.name = "MenuManagementError";
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUS_SET = new Set<ManagedMenuItemStatus>([
  "DRAFT",
  "ACTIVE",
  "SOLD_OUT",
  "HIDDEN",
  "ARCHIVED",
]);
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

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function requiredText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return normalized;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > maxLength) throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  return normalized;
}

function positiveInteger(value: unknown, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > max) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value;
}

function moneyMinor(value: unknown): string {
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value.replace(/^0+(?=\d)/, "");
}

function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value;
}

function status(value: unknown): ManagedMenuItemStatus {
  if (typeof value !== "string" || !STATUS_SET.has(value as ManagedMenuItemStatus)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value as ManagedMenuItemStatus;
}

async function assertRestaurantResource(
  trx: DatabaseTransaction,
  tenantId: string,
  restaurantId: string,
  categoryId: string | undefined,
  availabilityId: string | undefined,
): Promise<void> {
  if (categoryId) {
    const category = await trx
      .selectFrom("foodflow.menu_categories")
      .select("id")
      .where("tenant_id", "=", tenantId)
      .where("restaurant_id", "=", restaurantId)
      .where("id", "=", categoryId)
      .where("archived_at", "is", null)
      .executeTakeFirst();
    if (!category) throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }

  if (availabilityId) {
    const availability = await trx
      .selectFrom("foodflow.menu_availabilities")
      .select("id")
      .where("tenant_id", "=", tenantId)
      .where("restaurant_id", "=", restaurantId)
      .where("id", "=", availabilityId)
      .executeTakeFirst();
    if (!availability) throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
}

function mapItem(row: {
  id: string;
  restaurantId: string;
  restaurantName: string;
  categoryId: string;
  categoryName: string;
  availabilityId: string;
  availabilityName: string;
  name: string;
  thaiName: string | null;
  description: string;
  thaiDescription: string | null;
  imageUrl: string | null;
  basePriceMinor: string;
  currency: string;
  preparationStation: string;
  estimatedPreparationMinutes: number;
  vegetarian: boolean;
  status: string;
  displayOrder: number;
  publishedAt: Date | string | null;
  archivedAt: Date | string | null;
  updatedAt: Date | string;
}): ManagedMenuItem {
  return Object.freeze({
    ...row,
    status: row.status as ManagedMenuItemStatus,
    publishedAt: iso(row.publishedAt),
    archivedAt: iso(row.archivedAt),
    updatedAt: iso(row.updatedAt) ?? new Date(0).toISOString(),
  });
}

async function selectManagedItem(
  trx: DatabaseTransaction,
  tenantId: string,
  itemId: string,
): Promise<ManagedMenuItem | null> {
  const row = await trx
    .selectFrom("foodflow.menu_items as item")
    .innerJoin("app.restaurants as restaurant", (join) =>
      join
        .onRef("restaurant.tenant_id", "=", "item.tenant_id")
        .onRef("restaurant.id", "=", "item.restaurant_id"),
    )
    .innerJoin("foodflow.menu_categories as category", (join) =>
      join
        .onRef("category.tenant_id", "=", "item.tenant_id")
        .onRef("category.restaurant_id", "=", "item.restaurant_id")
        .onRef("category.id", "=", "item.category_id"),
    )
    .innerJoin("foodflow.menu_availabilities as availability", (join) =>
      join
        .onRef("availability.tenant_id", "=", "item.tenant_id")
        .onRef("availability.restaurant_id", "=", "item.restaurant_id")
        .onRef("availability.id", "=", "item.availability_id"),
    )
    .select([
      "item.id as id",
      "item.restaurant_id as restaurantId",
      "restaurant.name as restaurantName",
      "item.category_id as categoryId",
      "category.name as categoryName",
      "item.availability_id as availabilityId",
      "availability.name as availabilityName",
      "item.name as name",
      "item.thai_name as thaiName",
      "item.description as description",
      "item.thai_description as thaiDescription",
      "item.image_url as imageUrl",
      "item.base_price_minor as basePriceMinor",
      "item.currency as currency",
      "item.preparation_station as preparationStation",
      "item.estimated_preparation_minutes as estimatedPreparationMinutes",
      "item.vegetarian as vegetarian",
      "item.status as status",
      "item.display_order as displayOrder",
      "item.published_at as publishedAt",
      "item.archived_at as archivedAt",
      "item.updated_at as updatedAt",
    ])
    .where("item.tenant_id", "=", tenantId)
    .where("item.id", "=", itemId)
    .executeTakeFirst();

  return row ? mapItem(row) : null;
}

export async function loadMenuManagementSnapshot(): Promise<MenuManagementSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.menuView,
      "tenant",
      async (trx, context) => {
        const [restaurants, categories, availabilities, items] = await Promise.all([
          trx
            .selectFrom("app.restaurants")
            .select(["id", "name", "currency", "timezone"])
            .where("tenant_id", "=", context.tenantId)
            .orderBy("name", "asc")
            .execute(),
          trx
            .selectFrom("foodflow.menu_categories")
            .select([
              "id",
              "restaurant_id as restaurantId",
              "name",
              "thai_name as thaiName",
              "active",
              "display_order as displayOrder",
            ])
            .where("tenant_id", "=", context.tenantId)
            .where("archived_at", "is", null)
            .orderBy("restaurant_id", "asc")
            .orderBy("display_order", "asc")
            .execute(),
          trx
            .selectFrom("foodflow.menu_availabilities")
            .select([
              "id",
              "restaurant_id as restaurantId",
              "name",
              "type",
              "timezone",
              "active",
            ])
            .where("tenant_id", "=", context.tenantId)
            .orderBy("restaurant_id", "asc")
            .orderBy("name", "asc")
            .execute(),
          trx
            .selectFrom("foodflow.menu_items")
            .select("id")
            .where("tenant_id", "=", context.tenantId)
            .orderBy("restaurant_id", "asc")
            .orderBy("display_order", "asc")
            .orderBy("id", "asc")
            .execute(),
        ]);

        const detailedItems = await Promise.all(
          items.map((item) => selectManagedItem(trx, context.tenantId, item.id)),
        );

        return Object.freeze({
          restaurants: Object.freeze(restaurants.map((row) => Object.freeze(row as ManagedRestaurant))),
          categories: Object.freeze(categories.map((row) => Object.freeze(row as ManagedMenuCategory))),
          availabilities: Object.freeze(
            availabilities.map((row) => Object.freeze(row as ManagedMenuAvailability)),
          ),
          items: Object.freeze(detailedItems.filter((item): item is ManagedMenuItem => Boolean(item))),
        });
      },
    );
  } catch (error) {
    if (error instanceof MenuManagementError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new MenuManagementError("MENU_MANAGEMENT_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new MenuManagementError("MENU_MANAGEMENT_UNAVAILABLE", error);
    }
    throw new MenuManagementError("MENU_MANAGEMENT_UNAVAILABLE", error);
  }
}

export async function updateManagedMenuItem(
  itemIdInput: string,
  input: UpdateManagedMenuItemInput,
): Promise<ManagedMenuItem> {
  const itemId = uuid(itemIdInput);
  const allowedKeys = new Set([
    "name",
    "thaiName",
    "description",
    "thaiDescription",
    "imageUrl",
    "basePriceMinor",
    "categoryId",
    "availabilityId",
    "preparationStation",
    "estimatedPreparationMinutes",
    "vegetarian",
    "status",
    "displayOrder",
  ]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key)) || Object.keys(input).length === 0) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.menuManage,
      "tenant",
      async (trx, context) => {
        let locked: { id: string; restaurant_id: string; status: string } | undefined;
        try {
          const result = await sql<{ id: string; restaurant_id: string; status: string }>`
            select id, restaurant_id, status
            from foodflow.menu_items
            where tenant_id = ${context.tenantId}::uuid
              and id = ${itemId}::uuid
            for update nowait
          `.execute(trx);
          locked = result.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new MenuManagementError("MENU_MANAGEMENT_CONFLICT", error);
          }
          throw error;
        }
        if (!locked) throw new MenuManagementError("MENU_MANAGEMENT_NOT_FOUND");

        const categoryId = input.categoryId === undefined ? undefined : uuid(input.categoryId);
        const availabilityId =
          input.availabilityId === undefined ? undefined : uuid(input.availabilityId);
        await assertRestaurantResource(
          trx,
          context.tenantId,
          locked.restaurant_id,
          categoryId,
          availabilityId,
        );

        const nextStatus = input.status === undefined ? undefined : status(input.status);
        const patch: Record<string, unknown> = {};
        if (input.name !== undefined) patch.name = requiredText(input.name, 140);
        if (input.thaiName !== undefined) patch.thai_name = optionalText(input.thaiName, 140);
        if (input.description !== undefined) patch.description = requiredText(input.description, 1200);
        if (input.thaiDescription !== undefined) {
          patch.thai_description = optionalText(input.thaiDescription, 1200);
        }
        if (input.imageUrl !== undefined) patch.image_url = optionalText(input.imageUrl, 1200);
        if (input.basePriceMinor !== undefined) patch.base_price_minor = moneyMinor(input.basePriceMinor);
        if (categoryId !== undefined) patch.category_id = categoryId;
        if (availabilityId !== undefined) patch.availability_id = availabilityId;
        if (input.preparationStation !== undefined) {
          patch.preparation_station = requiredText(input.preparationStation, 80);
        }
        if (input.estimatedPreparationMinutes !== undefined) {
          patch.estimated_preparation_minutes = positiveInteger(
            input.estimatedPreparationMinutes,
            24 * 60,
          );
        }
        if (input.vegetarian !== undefined) {
          if (typeof input.vegetarian !== "boolean") {
            throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
          }
          patch.vegetarian = input.vegetarian;
        }
        if (input.displayOrder !== undefined) {
          patch.display_order = positiveInteger(input.displayOrder, 1_000_000);
        }
        if (nextStatus !== undefined) {
          patch.status = nextStatus;
          if (nextStatus === "ACTIVE" && locked.status !== "ACTIVE") {
            patch.published_at = new Date();
            patch.archived_at = null;
          }
          if (nextStatus === "ARCHIVED") patch.archived_at = new Date();
          if (nextStatus !== "ARCHIVED" && locked.status === "ARCHIVED") patch.archived_at = null;
        }

        patch.updated_at = new Date();
        await trx
          .updateTable("foodflow.menu_items")
          .set(patch)
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", itemId)
          .executeTakeFirstOrThrow();

        const updated = await selectManagedItem(trx, context.tenantId, itemId);
        if (!updated) throw new MenuManagementError("MENU_MANAGEMENT_NOT_FOUND");

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: null,
            restaurant_id: locked.restaurant_id,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "MENU_ITEM",
            entity_id: itemId,
            action: "MENU_ITEM_UPDATED",
            summary: `Menu item ${updated.name} updated`,
            reason: null,
            metadata: JSON.stringify({ status: updated.status }),
            correlation_id: null,
          })
          .execute();

        return updated;
      },
    );
  } catch (error) {
    if (error instanceof MenuManagementError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new MenuManagementError("MENU_MANAGEMENT_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new MenuManagementError("MENU_MANAGEMENT_UNAVAILABLE", error);
    }
    throw new MenuManagementError("MENU_MANAGEMENT_UNAVAILABLE", error);
  }
}
