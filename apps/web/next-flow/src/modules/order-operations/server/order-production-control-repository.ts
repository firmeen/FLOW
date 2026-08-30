import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type {
  OperationalOrderDeferReasonCode,
  OperationalOrderPriorityReasonCode,
  OperationalOrderRemakeReasonCode,
  OperationalOrderRemakeSourceStatus,
  OperationalOrderStatus,
  TrustedOperationalOrderContext,
} from "./types";

export interface OperationalOrderProductionControlRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly priorityCode: string;
  readonly priorityReason: string | null;
  readonly prioritizedAt: Date | null;
  readonly deferReason: string | null;
  readonly deferredAt: Date | null;
  readonly deferredUntil: Date | null;
  readonly remakeCount: number;
  readonly lastRemakeReason: string | null;
  readonly remakeRequestedAt: Date | null;
}

export interface OperationalOrderProductionControlMutation {
  readonly row: OperationalOrderProductionControlRow;
  readonly controlledAt: Date;
}

export class OperationalOrderProductionControlRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: TrustedOperationalOrderContext,
  ) {}

  async lockScopedOrder(orderId: string): Promise<OperationalOrderProductionControlRow | null> {
    const row = await this.trx
      .selectFrom("foodflow.orders")
      .select([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
      ])
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .forUpdate()
      .executeTakeFirst();

    return (row as OperationalOrderProductionControlRow | undefined) ?? null;
  }

  async setPriority(
    orderId: string,
    status: OperationalOrderStatus,
    reasonCode: OperationalOrderPriorityReasonCode,
  ): Promise<OperationalOrderProductionControlMutation | null> {
    const timestamp = sql<Date>`clock_timestamp()`;
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        priority_code: "URGENT",
        priority_reason: reasonCode,
        prioritized_at: timestamp,
        prioritized_by_staff: this.context.actorId,
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", status)
      .where("priority_code", "=", "NORMAL")
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
      ])
      .executeTakeFirst();
    if (!row?.prioritizedAt) return null;
    await this.appendEvent(row.id, "ORDER_PRIORITY_SET", row.status, row.status, reasonCode, row.prioritizedAt);
    return { row: row as OperationalOrderProductionControlRow, controlledAt: row.prioritizedAt };
  }

  async clearPriority(
    orderId: string,
    status: OperationalOrderStatus,
  ): Promise<OperationalOrderProductionControlMutation | null> {
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        priority_code: "NORMAL",
        priority_reason: null,
        prioritized_at: null,
        prioritized_by_staff: null,
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", status)
      .where("priority_code", "=", "URGENT")
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
      ])
      .executeTakeFirst();
    if (!row) return null;
    const controlledAt = await this.appendEventNow(row.id, "ORDER_PRIORITY_CLEARED", row.status, row.status, null);
    return { row: row as OperationalOrderProductionControlRow, controlledAt };
  }

  async defer(
    orderId: string,
    status: OperationalOrderStatus,
    reasonCode: OperationalOrderDeferReasonCode,
    deferredUntil: Date | null,
  ): Promise<OperationalOrderProductionControlMutation | null> {
    const timestamp = sql<Date>`clock_timestamp()`;
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        defer_reason: reasonCode,
        deferred_at: timestamp,
        deferred_until: deferredUntil,
        deferred_by_staff: this.context.actorId,
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", status)
      .where("defer_reason", "is", null)
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
      ])
      .executeTakeFirst();
    if (!row?.deferredAt) return null;
    await this.appendEvent(row.id, "ORDER_DEFERRED", row.status, row.status, reasonCode, row.deferredAt);
    return { row: row as OperationalOrderProductionControlRow, controlledAt: row.deferredAt };
  }

  async resume(
    orderId: string,
    status: OperationalOrderStatus,
  ): Promise<OperationalOrderProductionControlMutation | null> {
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        defer_reason: null,
        deferred_at: null,
        deferred_until: null,
        deferred_by_staff: null,
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", status)
      .where("defer_reason", "is not", null)
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
      ])
      .executeTakeFirst();
    if (!row) return null;
    const controlledAt = await this.appendEventNow(row.id, "ORDER_RESUMED", row.status, row.status, null);
    return { row: row as OperationalOrderProductionControlRow, controlledAt };
  }

  async requestRemake(
    orderId: string,
    sourceStatus: OperationalOrderRemakeSourceStatus,
    reasonCode: OperationalOrderRemakeReasonCode,
  ): Promise<OperationalOrderProductionControlMutation | null> {
    const timestamp = sql<Date>`clock_timestamp()`;
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: "REMAKE",
        customer_status: "PREPARING",
        remake_count: sql<number>`remake_count + 1`,
        last_remake_reason: reasonCode,
        remake_requested_at: timestamp,
        remake_requested_by_staff: this.context.actorId,
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", sourceStatus)
      .where("defer_reason", "is", null)
      .where("remake_count", "<", 3)
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
      ])
      .executeTakeFirst();
    if (!row?.remakeRequestedAt) return null;
    await this.appendEvent(
      row.id,
      "ORDER_REMAKE_REQUESTED",
      sourceStatus,
      "REMAKE",
      reasonCode,
      row.remakeRequestedAt,
    );
    return { row: row as OperationalOrderProductionControlRow, controlledAt: row.remakeRequestedAt };
  }

  async startRemake(
    orderId: string,
  ): Promise<OperationalOrderProductionControlMutation | null> {
    const timestamp = sql<Date>`clock_timestamp()`;
    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: "PREPARING",
        customer_status: "PREPARING",
        preparing_at: timestamp,
        modified_by_staff: this.context.actorId,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", "REMAKE")
      .where("defer_reason", "is", null)
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "priority_code as priorityCode",
        "priority_reason as priorityReason",
        "prioritized_at as prioritizedAt",
        "defer_reason as deferReason",
        "deferred_at as deferredAt",
        "deferred_until as deferredUntil",
        "remake_count as remakeCount",
        "last_remake_reason as lastRemakeReason",
        "remake_requested_at as remakeRequestedAt",
        "preparing_at as controlledAt",
      ])
      .executeTakeFirst();
    if (!row?.controlledAt) return null;
    await this.appendEvent(row.id, "ORDER_REMAKE_STARTED", "REMAKE", "PREPARING", null, row.controlledAt);
    const { controlledAt, ...controlRow } = row;
    return { row: controlRow as OperationalOrderProductionControlRow, controlledAt };
  }

  private async appendEventNow(
    orderId: string,
    eventType: string,
    fromStatus: string,
    toStatus: string,
    reason: string | null,
  ): Promise<Date> {
    const row = await this.trx
      .insertInto("foodflow.order_events")
      .values({
        tenant_id: this.context.tenantId,
        branch_id: this.context.branchId,
        order_id: orderId,
        event_type: eventType,
        from_status: fromStatus,
        to_status: toStatus,
        actor_id: this.context.actorId,
        reason,
        occurred_at: sql<Date>`clock_timestamp()`,
      })
      .returning("occurred_at as occurredAt")
      .executeTakeFirstOrThrow();
    return row.occurredAt;
  }

  private async appendEvent(
    orderId: string,
    eventType: string,
    fromStatus: string,
    toStatus: string,
    reason: string | null,
    occurredAt: Date,
  ): Promise<void> {
    await this.trx
      .insertInto("foodflow.order_events")
      .values({
        tenant_id: this.context.tenantId,
        branch_id: this.context.branchId,
        order_id: orderId,
        event_type: eventType,
        from_status: fromStatus,
        to_status: toStatus,
        actor_id: this.context.actorId,
        reason,
        occurred_at: occurredAt,
      })
      .execute();
  }
}
