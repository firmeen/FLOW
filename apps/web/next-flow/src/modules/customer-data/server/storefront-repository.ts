import "server-only";

import type { DatabaseTransaction } from "@/server/db/types";

import type { CustomerDatabaseContext } from "./context";
import { CustomerDataError } from "./errors";
import type { CustomerStorefrontView } from "./types";

export class CustomerStorefrontRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: CustomerDatabaseContext,
  ) {}

  async getCurrent(): Promise<CustomerStorefrontView> {
    const row = await this.trx
      .selectFrom("app.branches as branch")
      .innerJoin("app.restaurants as restaurant", (join) =>
        join
          .onRef("restaurant.tenant_id", "=", "branch.tenant_id")
          .onRef("restaurant.id", "=", "branch.restaurant_id"),
      )
      .innerJoin("foodflow.restaurant_tables as table", (join) =>
        join
          .onRef("table.tenant_id", "=", "branch.tenant_id")
          .onRef("table.branch_id", "=", "branch.id"),
      )
      .select([
        "restaurant.id as restaurantId",
        "restaurant.name as restaurantName",
        "branch.id as branchId",
        "branch.name as branchName",
        "branch.code as branchCode",
        "branch.is_open as isOpen",
        "table.id as tableId",
        "table.code as tableCode",
        "table.label as tableLabel",
      ])
      .where("branch.tenant_id", "=", this.context.tenantId)
      .where("branch.restaurant_id", "=", this.context.restaurantId)
      .where("branch.id", "=", this.context.branchId)
      .where("table.id", "=", this.context.tableId)
      .where("table.active", "=", true)
      .executeTakeFirst();

    if (!row) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    return Object.freeze(row);
  }
}
