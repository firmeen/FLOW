import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type { CustomerDatabaseContext } from "./context";

export interface CustomerMenuSelectionInput {
  readonly menuItemId: string;
  readonly modifierChoiceIds: readonly string[];
}

export class CustomerMenuAvailabilityRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: CustomerDatabaseContext,
  ) {}

  async areItemsCurrentlyAvailable(menuItemIds: readonly string[]): Promise<boolean> {
    const ids = Array.from(new Set(menuItemIds));
    if (ids.length === 0) return true;

    const rows = await this.trx
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
      .select("item.id")
      .where("item.tenant_id", "=", this.context.tenantId)
      .where("item.restaurant_id", "=", this.context.restaurantId)
      .where("item.id", "in", ids)
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
      .execute();

    return new Set(rows.map((row) => row.id)).size === ids.length;
  }

  async areModifierSelectionsCurrentlyValid(
    selections: readonly CustomerMenuSelectionInput[],
  ): Promise<boolean> {
    if (selections.length === 0) return true;

    const menuItemIds = Array.from(new Set(selections.map((selection) => selection.menuItemId)));
    const choiceIds = Array.from(
      new Set(selections.flatMap((selection) => [...selection.modifierChoiceIds])),
    );

    const groupRows = await this.trx
      .selectFrom("foodflow.menu_item_modifier_groups as link")
      .innerJoin("foodflow.modifier_groups as modifier_group", (join) =>
        join
          .onRef("modifier_group.tenant_id", "=", "link.tenant_id")
          .onRef("modifier_group.restaurant_id", "=", "link.restaurant_id")
          .onRef("modifier_group.id", "=", "link.modifier_group_id"),
      )
      .select([
        "link.menu_item_id as menuItemId",
        "modifier_group.id as groupId",
        "modifier_group.required",
        "modifier_group.minimum_selections as minimumSelections",
        "modifier_group.maximum_selections as maximumSelections",
      ])
      .where("link.tenant_id", "=", this.context.tenantId)
      .where("link.restaurant_id", "=", this.context.restaurantId)
      .where("link.menu_item_id", "in", menuItemIds)
      .where("modifier_group.active", "=", true)
      .execute();

    const choiceRows = choiceIds.length
      ? await this.trx
          .selectFrom("foodflow.menu_item_modifier_groups as link")
          .innerJoin("foodflow.modifier_groups as modifier_group", (join) =>
            join
              .onRef("modifier_group.tenant_id", "=", "link.tenant_id")
              .onRef("modifier_group.restaurant_id", "=", "link.restaurant_id")
              .onRef("modifier_group.id", "=", "link.modifier_group_id"),
          )
          .innerJoin("foodflow.modifier_choices as choice", (join) =>
            join
              .onRef("choice.tenant_id", "=", "link.tenant_id")
              .onRef("choice.restaurant_id", "=", "link.restaurant_id")
              .onRef("choice.modifier_group_id", "=", "link.modifier_group_id"),
          )
          .select([
            "link.menu_item_id as menuItemId",
            "choice.id as choiceId",
            "choice.modifier_group_id as groupId",
          ])
          .where("link.tenant_id", "=", this.context.tenantId)
          .where("link.restaurant_id", "=", this.context.restaurantId)
          .where("link.menu_item_id", "in", menuItemIds)
          .where("choice.id", "in", choiceIds)
          .where("choice.active", "=", true)
          .where("modifier_group.active", "=", true)
          .execute()
      : [];

    for (const selection of selections) {
      const selected = new Set(selection.modifierChoiceIds);
      if (selected.size !== selection.modifierChoiceIds.length) return false;

      const groups = groupRows.filter((row) => row.menuItemId === selection.menuItemId);
      const matchingChoices = choiceRows.filter(
        (row) => row.menuItemId === selection.menuItemId && selected.has(row.choiceId),
      );
      if (new Set(matchingChoices.map((row) => row.choiceId)).size !== selected.size) {
        return false;
      }

      const counts = new Map<string, number>();
      for (const choice of matchingChoices) {
        counts.set(choice.groupId, (counts.get(choice.groupId) ?? 0) + 1);
      }

      for (const group of groups) {
        const count = counts.get(group.groupId) ?? 0;
        const minimum = group.required
          ? Math.max(1, group.minimumSelections)
          : group.minimumSelections;
        if (count < minimum || count > group.maximumSelections) return false;
      }
    }

    return true;
  }
}
