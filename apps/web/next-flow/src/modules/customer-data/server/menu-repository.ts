import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type { CustomerDatabaseContext } from "./context";
import type {
  CustomerMenuBadgeView,
  CustomerMenuItemView,
  CustomerMenuView,
  CustomerModifierChoiceView,
  CustomerModifierGroupView,
} from "./types";

export class CustomerMenuRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: CustomerDatabaseContext,
  ) {}

  async listAvailable(): Promise<CustomerMenuView> {
    const categories = await this.trx
      .selectFrom("foodflow.menu_categories as category")
      .select([
        "category.id",
        "category.name",
        "category.thai_name as thaiName",
        "category.description",
        "category.cover_image_url as coverImageUrl",
        "category.display_order as displayOrder",
      ])
      .where("category.tenant_id", "=", this.context.tenantId)
      .where("category.restaurant_id", "=", this.context.restaurantId)
      .where("category.active", "=", true)
      .where("category.archived_at", "is", null)
      .orderBy("category.display_order", "asc")
      .orderBy("category.id", "asc")
      .execute();

    const items = await this.trx
      .selectFrom("foodflow.menu_items as item")
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
        "item.id",
        "item.category_id as categoryId",
        "item.name",
        "item.thai_name as thaiName",
        "item.description",
        "item.thai_description as thaiDescription",
        "item.image_url as imageUrl",
        "item.base_price_minor as basePriceMinor",
        "item.currency",
        "item.vegetarian",
        "item.display_order as displayOrder",
      ])
      .where("item.tenant_id", "=", this.context.tenantId)
      .where("item.restaurant_id", "=", this.context.restaurantId)
      .where("item.status", "=", "ACTIVE")
      .where("item.archived_at", "is", null)
      .where("category.active", "=", true)
      .where("category.archived_at", "is", null)
      .where("availability.active", "=", true)
      .where(
        sql<boolean>`(
          availability.type = 'ALWAYS'
          or (
            availability.type = 'SCHEDULED'
            and exists (
              select 1
              from foodflow.menu_availability_windows as availability_window
              where availability_window.tenant_id = item.tenant_id
                and availability_window.restaurant_id = item.restaurant_id
                and availability_window.availability_id = availability.id
                and (
                  (
                    availability_window.start_time < availability_window.end_time
                    and availability_window.day_of_week = upper(trim(to_char(timezone(availability.timezone, now()), 'Day')))
                    and timezone(availability.timezone, now())::time >= availability_window.start_time
                    and timezone(availability.timezone, now())::time < availability_window.end_time
                  )
                  or (
                    availability_window.start_time > availability_window.end_time
                    and (
                      (
                        availability_window.day_of_week = upper(trim(to_char(timezone(availability.timezone, now()), 'Day')))
                        and timezone(availability.timezone, now())::time >= availability_window.start_time
                      )
                      or (
                        availability_window.day_of_week = upper(trim(to_char(timezone(availability.timezone, now()) - interval '1 day', 'Day')))
                        and timezone(availability.timezone, now())::time < availability_window.end_time
                      )
                    )
                  )
                )
            )
          )
        )`,
      )
      .orderBy("item.display_order", "asc")
      .orderBy("item.id", "asc")
      .execute();

    const badges = await this.trx
      .selectFrom("foodflow.menu_badges as badge")
      .select(["badge.id", "badge.name", "badge.color", "badge.icon"])
      .where("badge.tenant_id", "=", this.context.tenantId)
      .where("badge.restaurant_id", "=", this.context.restaurantId)
      .where("badge.active", "=", true)
      .orderBy("badge.name", "asc")
      .orderBy("badge.id", "asc")
      .execute();

    const itemBadgeLinks = await this.trx
      .selectFrom("foodflow.menu_item_badges as link")
      .select(["link.menu_item_id as itemId", "link.badge_id as badgeId"])
      .where("link.tenant_id", "=", this.context.tenantId)
      .where("link.restaurant_id", "=", this.context.restaurantId)
      .execute();

    const groups = await this.trx
      .selectFrom("foodflow.modifier_groups as group")
      .select([
        "group.id",
        "group.name",
        "group.thai_name as thaiName",
        "group.kind",
        "group.required",
        "group.minimum_selections as minimumSelections",
        "group.maximum_selections as maximumSelections",
        "group.display_order as displayOrder",
      ])
      .where("group.tenant_id", "=", this.context.tenantId)
      .where("group.restaurant_id", "=", this.context.restaurantId)
      .where("group.active", "=", true)
      .orderBy("group.display_order", "asc")
      .orderBy("group.id", "asc")
      .execute();

    const choices = await this.trx
      .selectFrom("foodflow.modifier_choices as choice")
      .select([
        "choice.id",
        "choice.modifier_group_id as groupId",
        "choice.name",
        "choice.thai_name as thaiName",
        "choice.price_delta_minor as priceDeltaMinor",
        "choice.display_order as displayOrder",
      ])
      .where("choice.tenant_id", "=", this.context.tenantId)
      .where("choice.restaurant_id", "=", this.context.restaurantId)
      .where("choice.active", "=", true)
      .orderBy("choice.display_order", "asc")
      .orderBy("choice.id", "asc")
      .execute();

    const itemGroupLinks = await this.trx
      .selectFrom("foodflow.menu_item_modifier_groups as link")
      .select([
        "link.menu_item_id as itemId",
        "link.modifier_group_id as groupId",
      ])
      .where("link.tenant_id", "=", this.context.tenantId)
      .where("link.restaurant_id", "=", this.context.restaurantId)
      .execute();

    const badgesById = new Map<string, CustomerMenuBadgeView>(
      badges.map((badge) => [badge.id, Object.freeze(badge)]),
    );
    const badgeIdsByItem = new Map<string, string[]>();
    for (const link of itemBadgeLinks) {
      const current = badgeIdsByItem.get(link.itemId) ?? [];
      current.push(link.badgeId);
      badgeIdsByItem.set(link.itemId, current);
    }

    const choicesByGroup = new Map<string, CustomerModifierChoiceView[]>();
    for (const choice of choices) {
      const current = choicesByGroup.get(choice.groupId) ?? [];
      current.push(
        Object.freeze({
          id: choice.id,
          name: choice.name,
          thaiName: choice.thaiName,
          priceDeltaMinor: choice.priceDeltaMinor,
          displayOrder: choice.displayOrder,
        }),
      );
      choicesByGroup.set(choice.groupId, current);
    }

    const groupsById = new Map<string, CustomerModifierGroupView>();
    for (const group of groups) {
      groupsById.set(
        group.id,
        Object.freeze({
          ...group,
          choices: Object.freeze(choicesByGroup.get(group.id) ?? []),
        }),
      );
    }
    const groupIdsByItem = new Map<string, string[]>();
    for (const link of itemGroupLinks) {
      const current = groupIdsByItem.get(link.itemId) ?? [];
      current.push(link.groupId);
      groupIdsByItem.set(link.itemId, current);
    }

    const mappedItems: CustomerMenuItemView[] = items.map((item) =>
      Object.freeze({
        ...item,
        badges: Object.freeze(
          (badgeIdsByItem.get(item.id) ?? [])
            .map((id) => badgesById.get(id))
            .filter((badge): badge is CustomerMenuBadgeView => Boolean(badge)),
        ),
        modifierGroups: Object.freeze(
          (groupIdsByItem.get(item.id) ?? [])
            .map((id) => groupsById.get(id))
            .filter((group): group is CustomerModifierGroupView => Boolean(group)),
        ),
      }),
    );

    return Object.freeze({
      categories: Object.freeze(categories.map((category) => Object.freeze(category))),
      items: Object.freeze(mappedItems),
    });
  }
}
