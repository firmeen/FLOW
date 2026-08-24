import "server-only";

import { sql } from "kysely";

import type { DatabaseTransaction } from "@/server/db/types";

import type {
  OperationalOrderRejectionReasonCode,
  TrustedOperationalOrderContext,
} from "./types";

export interface OperationalOrderDecisionMutationRow {
  readonly id: string;
  readonly orderNumber: string;
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
      .where("status", "=", "PENDING_CONFIRMATION")
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
      eventType: "ORDER_ACCEPTED",
      toStatus: "ACCEPTED",
      reason: null,
      occurredAt: row.decidedAt,
    });

    return row as OperationalOrderDecisionMutationRow;
  }

  async reject(
    orderId: string,
    reasonCode: OperationalOrderRejectionReasonCode,
  ): Promise<OperationalOrderDecisionMutationRow | null> {
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
      .where("status", "=", "PENDING_CONFIRMATION")
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
      eventType: "ORDER_REJECTED",
      toStatus: "REJECTED",
      reason: reasonCode,
      occurredAt: row.decidedAt,
    });

    return row as OperationalOrderDecisionMutationRow;
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

  private async recordDecisionEvent(input: {
    readonly orderId: string;
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
        from_status: "PENDING_CONFIRMATION",
        to_status: input.toStatus,
        actor_id: this.context.actorId,
        reason: input.reason,
        occurred_at: input.occurredAt,
      })
      .execute();
  }
}
