import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type {
  OperationalOrderDecisionSourceStatus,
  OperationalOrderRejectionReasonCode,
  TrustedOperationalOrderContext,
} from "./types";

const DECISION_SOURCE_STATUSES = new Set<string>(["PENDING_CONFIRMATION", "CHANGED"]);

export interface OperationalOrderDecisionMutationRow {
  readonly id: string;
  readonly orderNumber: string;
  readonly fromStatus: OperationalOrderDecisionSourceStatus;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly decidedAt: Date;
  readonly rejectionReason: string | null;
}

interface OperationalOrderScopedStateRow {
  readonly status: string;
}

export class OperationalOrderDecisionRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: TrustedOperationalOrderContext,
  ) {}

  async accept(orderId: string): Promise<OperationalOrderDecisionMutationRow | null> {
    const sourceStatus = await this.readDecisionSource(orderId);
    if (!sourceStatus) return null;

    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: "ACCEPTED",
        customer_status: "CONFIRMED",
        accepted_at: sql<Date>`clock_timestamp()`,
        modified_by_staff: this.context.actorId,
        rejection_reason: null,
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
        "accepted_at as decidedAt",
        "rejection_reason as rejectionReason",
      ])
      .executeTakeFirst();

    if (!row) return null;
    if (!(row.decidedAt instanceof Date)) {
      throw new Error("Accepted order is missing database decision timestamp");
    }

    await this.recordDecisionEvent({
      orderId: row.id,
      fromStatus: sourceStatus,
      eventType: "ORDER_ACCEPTED",
      toStatus: "ACCEPTED",
      reason: null,
      occurredAt: row.decidedAt,
    });

    return { ...row, fromStatus: sourceStatus } as OperationalOrderDecisionMutationRow;
  }

  async reject(
    orderId: string,
    reasonCode: OperationalOrderRejectionReasonCode,
  ): Promise<OperationalOrderDecisionMutationRow | null> {
    const sourceStatus = await this.readDecisionSource(orderId);
    if (!sourceStatus) return null;

    const row = await this.trx
      .updateTable("foodflow.orders")
      .set({
        status: "REJECTED",
        customer_status: "REJECTED",
        rejected_at: sql<Date>`clock_timestamp()`,
        modified_by_staff: this.context.actorId,
        rejection_reason: reasonCode,
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
        "rejected_at as decidedAt",
        "rejection_reason as rejectionReason",
      ])
      .executeTakeFirst();

    if (!row) return null;
    if (!(row.decidedAt instanceof Date)) {
      throw new Error("Rejected order is missing database decision timestamp");
    }

    await this.recordDecisionEvent({
      orderId: row.id,
      fromStatus: sourceStatus,
      eventType: "ORDER_REJECTED",
      toStatus: "REJECTED",
      reason: reasonCode,
      occurredAt: row.decidedAt,
    });

    return { ...row, fromStatus: sourceStatus } as OperationalOrderDecisionMutationRow;
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

  private async readDecisionSource(
    orderId: string,
  ): Promise<OperationalOrderDecisionSourceStatus | null> {
    const current = await this.findScopedState(orderId);
    if (!current || !DECISION_SOURCE_STATUSES.has(current.status)) return null;
    return current.status as OperationalOrderDecisionSourceStatus;
  }

  private async recordDecisionEvent(input: {
    readonly orderId: string;
    readonly fromStatus: OperationalOrderDecisionSourceStatus;
    readonly eventType: "ORDER_ACCEPTED" | "ORDER_REJECTED";
    readonly toStatus: "ACCEPTED" | "REJECTED";
    readonly reason: OperationalOrderRejectionReasonCode | null;
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
        reason: input.reason,
        occurred_at: input.occurredAt,
      })
      .execute();
  }
}
