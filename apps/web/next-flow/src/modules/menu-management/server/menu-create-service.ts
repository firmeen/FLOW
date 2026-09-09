import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { MenuManagementError } from "./menu-management-service";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface CreateManagedMenuItemInput {
  readonly restaurantId: string;
  readonly categoryId: string;
  readonly availabilityId: string;
  readonly name: string;
  readonly thaiName?: string | null;
  readonly description?: string;
  readonly thaiDescription?: string | null;
  readonly imageUrl?: string | null;
  readonly basePriceMinor: string;
  readonly preparationStation: string;
  readonly estimatedPreparationMinutes?: number;
  readonly vegetarian?: boolean;
}

export interface CreateManagedMenuItemResult {
  readonly id: string;
  readonly status: "DRAFT";
  readonly restaurantId: string;
  readonly name: string;
}

function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value;
}

function text(value: unknown, max: number, required = true): string | null {
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

function minor(value: unknown): string {
  if (typeof value !== "string" || !/^\d{1,12}$/.test(value)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value.replace(/^0+(?=\d)/, "");
}

export async function createManagedMenuItem(
  input: CreateManagedMenuItemInput,
): Promise<CreateManagedMenuItemResult> {
  const restaurantId = uuid(input.restaurantId);
  const categoryId = uuid(input.categoryId);
  const availabilityId = uuid(input.availabilityId);
  const name = text(input.name, 140) as string;
  const preparationStation = text(input.preparationStation, 80) as string;
  const description = (text(input.description ?? "", 1200, false) ?? "") as string;
  const thaiName = text(input.thaiName, 140, false);
  const thaiDescription = text(input.thaiDescription, 1200, false);
  const imageUrl = text(input.imageUrl, 1200, false);
  const basePriceMinor = minor(input.basePriceMinor);
  const estimatedPreparationMinutes = input.estimatedPreparationMinutes ?? 0;
  if (!Number.isInteger(estimatedPreparationMinutes) || estimatedPreparationMinutes < 0 || estimatedPreparationMinutes > 1440) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  const vegetarian = input.vegetarian ?? false;
  if (typeof vegetarian !== "boolean") throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.menuManage,
      "tenant",
      async (trx, context) => {
        const restaurant = await trx
          .selectFrom("app.restaurants")
          .select(["id", "currency"])
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", restaurantId)
          .executeTakeFirst();
        if (!restaurant) throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");

        const category = await trx
          .selectFrom("foodflow.menu_categories")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .where("restaurant_id", "=", restaurantId)
          .where("id", "=", categoryId)
          .where("archived_at", "is", null)
          .executeTakeFirst();
        const availability = await trx
          .selectFrom("foodflow.menu_availabilities")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .where("restaurant_id", "=", restaurantId)
          .where("id", "=", availabilityId)
          .executeTakeFirst();
        if (!category || !availability) {
          throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
        }

        const maxOrder = await trx
          .selectFrom("foodflow.menu_items")
          .select((expression) => expression.fn.max<number>("display_order").as("maxOrder"))
          .where("tenant_id", "=", context.tenantId)
          .where("restaurant_id", "=", restaurantId)
          .where("category_id", "=", categoryId)
          .executeTakeFirst();

        const row = await trx
          .insertInto("foodflow.menu_items")
          .values({
            tenant_id: context.tenantId,
            restaurant_id: restaurantId,
            category_id: categoryId,
            availability_id: availabilityId,
            name,
            thai_name: thaiName,
            description,
            thai_description: thaiDescription,
            image_url: imageUrl,
            image_key: null,
            base_price_minor: basePriceMinor,
            currency: restaurant.currency,
            preparation_station: preparationStation,
            estimated_preparation_minutes: estimatedPreparationMinutes,
            status: "DRAFT",
            vegetarian,
            display_order: (maxOrder?.maxOrder ?? -1) + 1,
            published_at: null,
            archived_at: null,
          })
          .returning(["id", "restaurant_id as restaurantId", "name", "status"])
          .executeTakeFirstOrThrow();

        await trx
          .insertInto("audit.events")
          .values({
            tenant_id: context.tenantId,
            branch_id: null,
            restaurant_id: restaurantId,
            actor_id: context.actorId,
            actor_name_snapshot: null,
            entity_type: "MENU_ITEM",
            entity_id: row.id,
            action: "MENU_ITEM_CREATED",
            summary: `Draft menu item ${row.name} created`,
            reason: null,
            metadata: JSON.stringify({ status: "DRAFT" }),
            correlation_id: null,
          })
          .execute();

        return Object.freeze({
          id: row.id,
          status: "DRAFT" as const,
          restaurantId: row.restaurantId,
          name: row.name,
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
