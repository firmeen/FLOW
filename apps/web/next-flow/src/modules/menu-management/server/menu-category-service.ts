import "server-only";

import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { MenuManagementError } from "./menu-management-service";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";

export interface ManagedCategoryMutationResult {
  readonly id: string;
  readonly restaurantId: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly description: string | null;
  readonly coverImageUrl: string | null;
  readonly active: boolean;
  readonly displayOrder: number;
  readonly archived: boolean;
}

export interface CreateManagedCategoryInput {
  readonly restaurantId: string;
  readonly name: string;
  readonly thaiName?: string | null;
  readonly description?: string | null;
  readonly coverImageUrl?: string | null;
}

export interface UpdateManagedCategoryInput {
  readonly name?: string;
  readonly thaiName?: string | null;
  readonly description?: string | null;
  readonly coverImageUrl?: string | null;
  readonly active?: boolean;
  readonly displayOrder?: number;
  readonly archived?: boolean;
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
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value;
}

function text(value: unknown, max: number, required = false): string | null {
  if (value === null || value === undefined || value === "") {
    if (required) throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
    return null;
  }
  if (typeof value !== "string") throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  const normalized = value.trim();
  if ((!normalized && required) || normalized.length > max) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return normalized || null;
}

async function mapCategory(
  tenantId: string,
  categoryId: string,
  trx: Parameters<Parameters<typeof withAuthorizedCurrentAccessTransaction>[2]>[0],
): Promise<ManagedCategoryMutationResult> {
  const row = await trx
    .selectFrom("foodflow.menu_categories")
    .select([
      "id",
      "restaurant_id as restaurantId",
      "name",
      "thai_name as thaiName",
      "description",
      "cover_image_url as coverImageUrl",
      "active",
      "display_order as displayOrder",
      "archived_at as archivedAt",
    ])
    .where("tenant_id", "=", tenantId)
    .where("id", "=", categoryId)
    .executeTakeFirst();
  if (!row) throw new MenuManagementError("MENU_MANAGEMENT_NOT_FOUND");
  return Object.freeze({
    id: row.id,
    restaurantId: row.restaurantId,
    name: row.name,
    thaiName: row.thaiName,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    active: row.active,
    displayOrder: row.displayOrder,
    archived: Boolean(row.archivedAt),
  });
}

export async function createManagedCategory(
  input: CreateManagedCategoryInput,
): Promise<ManagedCategoryMutationResult> {
  const restaurantId = uuid(input.restaurantId);
  const name = text(input.name, 120, true) as string;
  const thaiName = text(input.thaiName, 120);
  const description = text(input.description, 800);
  const coverImageUrl = text(input.coverImageUrl, 1200);

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.menuManage,
      "tenant",
      async (trx, context) => {
        const restaurant = await trx
          .selectFrom("app.restaurants")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", restaurantId)
          .executeTakeFirst();
        if (!restaurant) throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");

        const maxOrder = await trx
          .selectFrom("foodflow.menu_categories")
          .select((expression) => expression.fn.max<number>("display_order").as("maxOrder"))
          .where("tenant_id", "=", context.tenantId)
          .where("restaurant_id", "=", restaurantId)
          .where("archived_at", "is", null)
          .executeTakeFirst();

        const created = await trx
          .insertInto("foodflow.menu_categories")
          .values({
            tenant_id: context.tenantId,
            restaurant_id: restaurantId,
            name,
            thai_name: thaiName,
            description,
            cover_image_url: coverImageUrl,
            display_order: (maxOrder?.maxOrder ?? -1) + 1,
            active: true,
            archived_at: null,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: null,
            restaurant_id: restaurantId,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "MENU_CATEGORY",
            entity_id: created.id,
            action: "MENU_CATEGORY_CREATED",
            summary: `Menu category ${name} created`,
            reason: null,
            metadata: null,
            correlation_id: null,
          })
          .execute();

        return mapCategory(context.tenantId, created.id, trx);
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

export async function updateManagedCategory(
  categoryIdInput: string,
  input: UpdateManagedCategoryInput,
): Promise<ManagedCategoryMutationResult> {
  const categoryId = uuid(categoryIdInput);
  const allowed = new Set([
    "name",
    "thaiName",
    "description",
    "coverImageUrl",
    "active",
    "displayOrder",
    "archived",
  ]);
  if (Object.keys(input).length === 0 || Object.keys(input).some((key) => !allowed.has(key))) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.menuManage,
      "tenant",
      async (trx, context) => {
        let locked: { id: string; restaurant_id: string } | undefined;
        try {
          const result = await sql<{ id: string; restaurant_id: string }>`
            select id, restaurant_id
            from foodflow.menu_categories
            where tenant_id = ${context.tenantId}::uuid
              and id = ${categoryId}::uuid
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

        const patch: Record<string, unknown> = { updated_at: new Date() };
        if (input.name !== undefined) patch.name = text(input.name, 120, true);
        if (input.thaiName !== undefined) patch.thai_name = text(input.thaiName, 120);
        if (input.description !== undefined) patch.description = text(input.description, 800);
        if (input.coverImageUrl !== undefined) patch.cover_image_url = text(input.coverImageUrl, 1200);
        if (input.active !== undefined) {
          if (typeof input.active !== "boolean") throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
          patch.active = input.active;
        }
        if (input.displayOrder !== undefined) {
          if (!Number.isInteger(input.displayOrder) || input.displayOrder < 0 || input.displayOrder > 1_000_000) {
            throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
          }
          patch.display_order = input.displayOrder;
        }
        if (input.archived !== undefined) {
          if (typeof input.archived !== "boolean") throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
          patch.archived_at = input.archived ? new Date() : null;
          if (input.archived) patch.active = false;
        }

        await trx
          .updateTable("foodflow.menu_categories")
          .set(patch)
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", categoryId)
          .executeTakeFirstOrThrow();

        const updated = await mapCategory(context.tenantId, categoryId, trx);
        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: null,
            restaurant_id: locked.restaurant_id,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "MENU_CATEGORY",
            entity_id: categoryId,
            action: "MENU_CATEGORY_UPDATED",
            summary: `Menu category ${updated.name} updated`,
            reason: null,
            metadata: JSON.stringify({ active: updated.active, archived: updated.archived }),
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
