import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type {
  OperationalOrderAmendmentChangeCategory,
  OperationalOrderCancellationReasonCode,
  OperationalOrderCancellableStatus,
  TrustedOperationalOrderContext,
} from "./types";

export interface OperationalOrderExceptionOrderRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly customerNote: string | null;
  readonly subtotalMinor: string;
  readonly currency: string;
}

export interface OperationalOrderExceptionItemRow {
  readonly id: string;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly lineTotalMinor: string;
  readonly specialRequest: string | null;
}

export interface OperationalOrderExceptionModifierRow {
  readonly orderItemId: string;
  readonly priceDeltaMinor: string;
}

export interface OperationalOrderAmendmentMutationRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly changedAt: Date;
}

export interface OperationalOrderCancellationMutationRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly cancelledAt: Date;
}

export interface OperationalOrderScopedStateRow {
  readonly status: string;
}

export class OperationalOrderExceptionRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: TrustedOperationalOrderContext,
  ) {}

  async lockAcceptedOrder(
    orderId: string,
  ): Promise<OperationalOrderExceptionOrderRow | null> {
    const row = await this.trx
      .selectFrom("foodflow.orders")
      .select([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "customer_note as customerNote",
        "subtotal_minor as subtotalMinor",
        "currency",
      ])
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", "ACCEPTED")
      .forUpdate()
      .executeTakeFirst();

    return (row as OperationalOrderExceptionOrderRow | undefined) ?? null;
  }

  async findScopedState(orderId: string): Promise<OperationalOrderScopedStateRow | null> {
    const row = await this.trx
      .selectFrom("foodflow.orders")
      .select("status")
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .executeTakeFirst();

    return row ?? null;
  }

  async listItems(orderId: string): Promise<readonly OperationalOrderExceptionItemRow[]> {
    return this.trx
      .selectFrom("foodflow.order_items")
      .select([
        "id",
        "quantity",
        "unit_price_minor as unitPriceMinor",
        "line_total_minor as lineTotalMinor",
        "special_request as specialRequest",
      ])
      .where("tenant_id", "=", this.context.tenantId)
      .where("order_id", "=", orderId)
      .orderBy("id", "asc")
      .execute() as Promise<readonly OperationalOrderExceptionItemRow[]>;
  }

  async listModifiers(
    itemIds: readonly string[],
  ): Promise<readonly OperationalOrderExceptionModifierRow[]> {
    if (itemIds.length === 0) return [];

    return this.trx
      .selectFrom("foodflow.order_item_modifiers")
      .select([
        "order_item_id as orderItemId",
        "price_delta_minor as priceDeltaMinor",
      ])
      .where("tenant_id", "=", this.context.tenantId)
      .where("order_item_id", "in", itemIds)
      .orderBy("order_item_id", "asc")
      .orderBy("id", "asc")
      .execute() as Promise<readonly OperationalOrderExceptionModifierRow[]>;
  }

  async updateItem(
    orderId: string,
    itemId: string,
    input: {
      readonly quantity: number;
      readonly lineTotalMinor: string;
      readonly specialRequest: string | null;
    },
  ): Promise<boolean> {
    const result = await this.trx
      .updateTable("foodflow.order_items")
      .set({
        quantity: input.quantity,
        line_total_minor: input.lineTotalMinor,
        special_request: input.specialRequest,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("order_id", "=", orderId)
      .where("id", "=", itemId)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) === 1;
  }

  async removeItem(orderId: string, itemId: string): Promise<boolean> {
    await this.trx
      .deleteFrom("foodflow.order_item_modifiers")
      .where("tenant_id", "=", this.context.tenantId)
      .where("order_item_id", "=", itemId)
      .execute();

    const result = await this.trx
      .deleteFrom("foodflow.order_items")
      .where("tenant_id", "=", this.context.tenantId)
      .where("order_id", "=", orderId)
      .where("id", "=", itemId)
      .executeTakeFirst();

    return Number(result.numDeletedRows) === 1;
  }

  async finalizeAmendment(input: {
    readonly orderId: string;
    readonly subtotalMinor: string;
    readonly customerNoteProvided: boolean;
    readonly customerNote: string | null;
    readonly changeCategory: OperationalOrderAmendmentChangeCategory;
  }): Promise<OperationalOrderAmendmentMutationRow | null> {
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: "CHANGED",
        customer_status: "SENT",
        subtotal_minor: input.subtotalMinor,
        modified_by_staff: this.context.actorId,
        ...(input.customerNoteProvided ? { customer_note: input.customerNote } : {}),
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", input.orderId)
      .where("status", "=", "ACCEPTED")
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "subtotal_minor as subtotalMinor",
        "currency",
      ])
      .executeTakeFirst();

    if (!row) return null;

    const event = await this.trx
      .insertInto("foodflow.order_events")
      .values({
        tenant_id: this.context.tenantId,
        branch_id: this.context.branchId,
        order_id: row.id,
        event_type: "ORDER_CHANGED",
        from_status: "ACCEPTED",
        to_status: "CHANGED",
        actor_id: this.context.actorId,
        reason: input.changeCategory,
        occurred_at: sql<Date>`clock_timestamp()`,
      })
      .returning("occurred_at as changedAt")
      .executeTakeFirstOrThrow();

    return {
      ...row,
      changedAt: event.changedAt,
    } as OperationalOrderAmendmentMutationRow;
  }

  async readCancellationSource(orderId: string): Promise<OperationalOrderScopedStateRow | null> {
    return this.findScopedState(orderId);
  }

  async cancel(
    orderId: string,
    sourceStatus: OperationalOrderCancellableStatus,
    reasonCode: OperationalOrderCancellationReasonCode,
  ): Promise<OperationalOrderCancellationMutationRow | null> {
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: "CANCELLED",
        customer_status: "CANCELLED",
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", sourceStatus)
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
      ])
      .executeTakeFirst();

    if (!row) return null;

    const event = await this.trx
      .insertInto("foodflow.order_events")
      .values({
        tenant_id: this.context.tenantId,
        branch_id: this.context.branchId,
        order_id: row.id,
        event_type: "ORDER_CANCELLED",
        from_status: sourceStatus,
        to_status: "CANCELLED",
        actor_id: this.context.actorId,
        reason: reasonCode,
        occurred_at: sql<Date>`clock_timestamp()`,
      })
      .returning("occurred_at as cancelledAt")
      .executeTakeFirstOrThrow();

    return {
      ...row,
      cancelledAt: event.cancelledAt,
    } as OperationalOrderCancellationMutationRow;
  }
}
