import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type {
  OperationalOrderLifecycleTransitionSpec,
  TrustedOperationalOrderContext,
} from "./types";

export interface OperationalOrderLifecycleMutationRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly preparingAt: Date | null;
  readonly readyAt: Date | null;
  readonly servedAt: Date | null;
}

export interface OperationalOrderLifecycleScopedStateRow {
  readonly status: string;
}

export class OperationalOrderLifecycleRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: TrustedOperationalOrderContext,
  ) {}

  async transition(
    orderId: string,
    spec: OperationalOrderLifecycleTransitionSpec,
  ): Promise<OperationalOrderLifecycleMutationRow | null> {
    const timestamp = sql<Date>`clock_timestamp()`;
    const timestampPatch =
      spec.timestampColumn === "preparing_at"
        ? { preparing_at: timestamp }
        : spec.timestampColumn === "ready_at"
          ? { ready_at: timestamp }
          : { served_at: timestamp };

    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: spec.to,
        customer_status: spec.customerStatus,
        modified_by_staff: this.context.actorId,
        ...timestampPatch,
      })
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .where("status", "=", spec.from)
      .returning([
        "id",
        "order_number as orderNumber",
        "status",
        "customer_status as customerStatus",
        "preparing_at as preparingAt",
        "ready_at as readyAt",
        "served_at as servedAt",
      ])
      .executeTakeFirst();

    if (!row) return null;
    const transitionedAt = this.pickTransitionTimestamp(row, spec);
    await this.recordLifecycleEvent({
      orderId: row.id,
      eventType: spec.eventType,
      fromStatus: spec.from,
      toStatus: spec.to,
      occurredAt: transitionedAt,
    });

    return row as OperationalOrderLifecycleMutationRow;
  }

  async findScopedState(
    orderId: string,
  ): Promise<OperationalOrderLifecycleScopedStateRow | null> {
    const row = await this.trx
      .selectFrom("foodflow.orders")
      .select("status")
      .where("tenant_id", "=", this.context.tenantId)
      .where("branch_id", "=", this.context.branchId)
      .where("id", "=", orderId)
      .executeTakeFirst();
    return row ?? null;
  }

  private pickTransitionTimestamp(
    row: {
      readonly preparingAt: Date | null;
      readonly readyAt: Date | null;
      readonly servedAt: Date | null;
    },
    spec: OperationalOrderLifecycleTransitionSpec,
  ): Date {
    const value =
      spec.timestampColumn === "preparing_at"
        ? row.preparingAt
        : spec.timestampColumn === "ready_at"
          ? row.readyAt
          : row.servedAt;

    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new Error("Lifecycle transition is missing database timestamp evidence");
    }
    return value;
  }

  private async recordLifecycleEvent(input: {
    readonly orderId: string;
    readonly eventType: "ORDER_PREPARING" | "ORDER_READY" | "ORDER_SERVED";
    readonly fromStatus: "ACCEPTED" | "PREPARING" | "READY";
    readonly toStatus: "PREPARING" | "READY" | "SERVED";
    readonly occurredAt: Date;
  }): Promise<void> {
    await this.trx
      .insertInto("foodflow.order_events")
      .values({
        tenant_id: this.context.tenantId,
        branch_id: this.context.branchId,
        order_id: input.orderId,
        event_type: input.eventType,
        from_status: input.fromStatus,
        to_status: input.toStatus,
        actor_id: this.context.actorId,
        reason: null,
        occurred_at: input.occurredAt,
      })
      .execute();
  }
}
