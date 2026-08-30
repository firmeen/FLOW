import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type {
  OperationalOrderCursor,
  OperationalOrderQueueFilter,
  TrustedOperationalOrderContext,
} from "./types";

export interface OperationalOrderQueueRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly customerCapabilityId: string | null;
  readonly tableId: string;
  readonly tableLabel: string | null;
  readonly submittedAt: Date;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly lineCount: number;
  readonly unitCount: number;
  readonly customerNote: string | null;
  readonly priorityCode: string;
  readonly priorityReason: string | null;
  readonly prioritizedAt: Date | null;
  readonly deferReason: string | null;
  readonly deferredAt: Date | null;
  readonly deferredUntil: Date | null;
  readonly remakeCount: number;
  readonly lastRemakeReason: string | null;
  readonly remakeRequestedAt: Date | null;
  readonly deferRank: number;
  readonly priorityRank: number;
}

export interface OperationalOrderDetailItemRow {
  readonly id: string;
  readonly menuItemId: string | null;
  readonly menuItemName: string;
  readonly menuItemThaiName: string | null;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly lineTotalMinor: string;
  readonly specialRequest: string | null;
  readonly preparationStation: string;
}

export interface OperationalOrderDetailModifierRow {
  readonly id: string;
  readonly orderItemId: string;
  readonly modifierGroupId: string | null;
  readonly modifierGroupName: string;
  readonly modifierChoiceId: string | null;
  readonly modifierChoiceName: string;
  readonly priceDeltaMinor: string;
}

const DEFER_RANK = sql<number>`case when "order".deferred_at is null then 0 else 1 end`;
const PRIORITY_RANK = sql<number>`case when "order".priority_code = 'URGENT' then 0 else 1 end`;

export class OperationalOrderQueueRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: TrustedOperationalOrderContext,
  ) {}

  async list(
    filter: Required<Pick<OperationalOrderQueueFilter, "statuses" | "limit">> &
      Omit<OperationalOrderQueueFilter, "statuses" | "limit" | "cursor"> & {
        readonly cursor: OperationalOrderCursor | null;
      },
  ): Promise<readonly OperationalOrderQueueRow[]> {
    let query = this.trx
      .selectFrom("foodflow.orders as order")
      .leftJoin("foodflow.restaurant_tables as table", (join) =>
        join
          .onRef("table.tenant_id", "=", "order.tenant_id")
          .onRef("table.branch_id", "=", "order.branch_id")
          .onRef("table.id", "=", "order.table_id"),
      )
      .leftJoin("foodflow.order_items as item", (join) =>
        join
          .onRef("item.tenant_id", "=", "order.tenant_id")
          .onRef("item.order_id", "=", "order.id"),
      )
      .select([
        "order.id as id",
        "order.order_number as orderNumber",
        "order.status as status",
        "order.customer_status as customerStatus",
        "order.customer_capability_id as customerCapabilityId",
        "order.table_id as tableId",
        "table.label as tableLabel",
        "order.submitted_at as submittedAt",
        "order.subtotal_minor as subtotalMinor",
        "order.currency as currency",
        "order.customer_note as customerNote",
        "order.priority_code as priorityCode",
        "order.priority_reason as priorityReason",
        "order.prioritized_at as prioritizedAt",
        "order.defer_reason as deferReason",
        "order.deferred_at as deferredAt",
        "order.deferred_until as deferredUntil",
        "order.remake_count as remakeCount",
        "order.last_remake_reason as lastRemakeReason",
        "order.remake_requested_at as remakeRequestedAt",
        DEFER_RANK.as("deferRank"),
        PRIORITY_RANK.as("priorityRank"),
        sql<number>`count(item.id)::int`.as("lineCount"),
        sql<number>`coalesce(sum(item.quantity), 0)::int`.as("unitCount"),
      ])
      .where("order.tenant_id", "=", this.context.tenantId)
      .where("order.branch_id", "=", this.context.branchId)
      .where("order.submitted_at", "is not", null)
      .where("order.status", "in", filter.statuses)
      .groupBy([
        "order.id",
        "order.order_number",
        "order.status",
        "order.customer_status",
        "order.customer_capability_id",
        "order.table_id",
        "table.label",
        "order.submitted_at",
        "order.subtotal_minor",
        "order.currency",
        "order.customer_note",
        "order.priority_code",
        "order.priority_reason",
        "order.prioritized_at",
        "order.defer_reason",
        "order.deferred_at",
        "order.deferred_until",
        "order.remake_count",
        "order.last_remake_reason",
        "order.remake_requested_at",
      ]);

    if (filter.source === "CUSTOMER_WEB") {
      query = query.where("order.customer_capability_id", "is not", null);
    } else if (filter.source === "UNKNOWN") {
      query = query.where("order.customer_capability_id", "is", null);
    }

    if (filter.submittedAfter) {
      query = query.where("order.submitted_at", ">=", new Date(filter.submittedAfter));
    }
    if (filter.submittedBefore) {
      query = query.where("order.submitted_at", "<=", new Date(filter.submittedBefore));
    }
    if (filter.cursor) {
      const cursorTime = new Date(filter.cursor.submittedAt);
      const cursor = filter.cursor;
      query = query.where(
        sql<boolean>`(
          ${DEFER_RANK} > ${cursor.deferRank}
          or (${DEFER_RANK} = ${cursor.deferRank} and ${PRIORITY_RANK} > ${cursor.priorityRank})
          or (${DEFER_RANK} = ${cursor.deferRank} and ${PRIORITY_RANK} = ${cursor.priorityRank} and "order".submitted_at > ${cursorTime})
          or (${DEFER_RANK} = ${cursor.deferRank} and ${PRIORITY_RANK} = ${cursor.priorityRank} and "order".submitted_at = ${cursorTime} and "order".id > ${cursor.id})
        )`,
      );
    }

    return query
      .orderBy(DEFER_RANK, "asc")
      .orderBy(PRIORITY_RANK, "asc")
      .orderBy("order.submitted_at", "asc")
      .orderBy("order.id", "asc")
      .limit(filter.limit + 1)
      .execute() as Promise<readonly OperationalOrderQueueRow[]>;
  }

  async countIncoming(): Promise<number> {
    const row = await this.trx
      .selectFrom("foodflow.orders as order")
      .select(sql<number>`count(*)::int`.as("count"))
      .where("order.tenant_id", "=", this.context.tenantId)
      .where("order.branch_id", "=", this.context.branchId)
      .where("order.status", "=", "PENDING_CONFIRMATION")
      .where("order.submitted_at", "is not", null)
      .executeTakeFirst();

    return row?.count ?? 0;
  }

  async findDetailHeader(orderId: string): Promise<OperationalOrderQueueRow | null> {
    const row = await this.trx
      .selectFrom("foodflow.orders as order")
      .leftJoin("foodflow.restaurant_tables as table", (join) =>
        join
          .onRef("table.tenant_id", "=", "order.tenant_id")
          .onRef("table.branch_id", "=", "order.branch_id")
          .onRef("table.id", "=", "order.table_id"),
      )
      .leftJoin("foodflow.order_items as item", (join) =>
        join
          .onRef("item.tenant_id", "=", "order.tenant_id")
          .onRef("item.order_id", "=", "order.id"),
      )
      .select([
        "order.id as id",
        "order.order_number as orderNumber",
        "order.status as status",
        "order.customer_status as customerStatus",
        "order.customer_capability_id as customerCapabilityId",
        "order.table_id as tableId",
        "table.label as tableLabel",
        "order.submitted_at as submittedAt",
        "order.subtotal_minor as subtotalMinor",
        "order.currency as currency",
        "order.customer_note as customerNote",
        "order.priority_code as priorityCode",
        "order.priority_reason as priorityReason",
        "order.prioritized_at as prioritizedAt",
        "order.defer_reason as deferReason",
        "order.deferred_at as deferredAt",
        "order.deferred_until as deferredUntil",
        "order.remake_count as remakeCount",
        "order.last_remake_reason as lastRemakeReason",
        "order.remake_requested_at as remakeRequestedAt",
        DEFER_RANK.as("deferRank"),
        PRIORITY_RANK.as("priorityRank"),
        sql<number>`count(item.id)::int`.as("lineCount"),
        sql<number>`coalesce(sum(item.quantity), 0)::int`.as("unitCount"),
      ])
      .where("order.tenant_id", "=", this.context.tenantId)
      .where("order.branch_id", "=", this.context.branchId)
      .where("order.id", "=", orderId)
      .where("order.submitted_at", "is not", null)
      .groupBy([
        "order.id",
        "order.order_number",
        "order.status",
        "order.customer_status",
        "order.customer_capability_id",
        "order.table_id",
        "table.label",
        "order.submitted_at",
        "order.subtotal_minor",
        "order.currency",
        "order.customer_note",
        "order.priority_code",
        "order.priority_reason",
        "order.prioritized_at",
        "order.defer_reason",
        "order.deferred_at",
        "order.deferred_until",
        "order.remake_count",
        "order.last_remake_reason",
        "order.remake_requested_at",
      ])
      .executeTakeFirst();

    return (row as OperationalOrderQueueRow | undefined) ?? null;
  }

  async listDetailItems(orderId: string): Promise<readonly OperationalOrderDetailItemRow[]> {
    return this.trx
      .selectFrom("foodflow.order_items as item")
      .select([
        "item.id as id",
        "item.menu_item_id as menuItemId",
        "item.menu_item_name as menuItemName",
        "item.menu_item_thai_name as menuItemThaiName",
        "item.quantity as quantity",
        "item.unit_price_minor as unitPriceMinor",
        "item.line_total_minor as lineTotalMinor",
        "item.special_request as specialRequest",
        "item.preparation_station as preparationStation",
      ])
      .where("item.tenant_id", "=", this.context.tenantId)
      .where("item.order_id", "=", orderId)
      .orderBy("item.created_at", "asc")
      .orderBy("item.id", "asc")
      .execute() as Promise<readonly OperationalOrderDetailItemRow[]>;
  }

  async listDetailModifiers(
    itemIds: readonly string[],
  ): Promise<readonly OperationalOrderDetailModifierRow[]> {
    if (itemIds.length === 0) return [];

    return this.trx
      .selectFrom("foodflow.order_item_modifiers as modifier")
      .select([
        "modifier.id as id",
        "modifier.order_item_id as orderItemId",
        "modifier.modifier_group_id as modifierGroupId",
        "modifier.modifier_group_name as modifierGroupName",
        "modifier.modifier_choice_id as modifierChoiceId",
        "modifier.modifier_choice_name as modifierChoiceName",
        "modifier.price_delta_minor as priceDeltaMinor",
      ])
      .where("modifier.tenant_id", "=", this.context.tenantId)
      .where("modifier.order_item_id", "in", itemIds)
      .orderBy("modifier.created_at", "asc")
      .orderBy("modifier.id", "asc")
      .execute() as Promise<readonly OperationalOrderDetailModifierRow[]>;
  }
}
