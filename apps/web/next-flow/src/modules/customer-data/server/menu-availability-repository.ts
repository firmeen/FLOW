import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type { CustomerDatabaseContext } from "./context";

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
}
