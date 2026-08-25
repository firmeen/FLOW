import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { withAuthorizedAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { OperationalOrderDecisionError } from "./errors";
import {
  OperationalOrderDecisionRepository,
  type OperationalOrderDecisionMutationRow,
} from "./order-decision-repository";
import {
  OPERATIONAL_ORDER_DECISION_SOURCE_STATUSES,
  OPERATIONAL_ORDER_REJECTION_REASONS,
  type OperationalOrderDecisionCommand,
  type OperationalOrderDecisionResult,
  type OperationalOrderDecisionSourceStatus,
  type OperationalOrderRejectionReasonCode,
  type TrustedOperationalOrderContext,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REJECTION_REASON_SET = new Set<string>(OPERATIONAL_ORDER_REJECTION_REASONS);
const DECISION_SOURCE_SET = new Set<string>(OPERATIONAL_ORDER_DECISION_SOURCE_STATUSES);
const INITIAL_DECISION_SOURCES = ["PENDING_CONFIRMATION"] as const satisfies readonly OperationalOrderDecisionSourceStatus[];
const REVIEW_DECISION_SOURCES = OPERATIONAL_ORDER_DECISION_SOURCE_STATUSES;

function invalidRequest(cause?: unknown): never {
  throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST", cause);
}

function assertOrderId(orderId: string): string {
  const normalized = orderId.trim();
  if (!UUID_PATTERN.test(normalized)) invalidRequest();
  return normalized;
}

export function normalizeOperationalOrderRejectionReason(
  value: unknown,
): OperationalOrderRejectionReasonCode {
  if (typeof value !== "string") invalidRequest();
  const normalized = value.trim();
  if (!REJECTION_REASON_SET.has(normalized)) invalidRequest();
  return normalized as OperationalOrderRejectionReasonCode;
}

export function parseOperationalOrderDecisionRequest(
  orderId: string,
  body: Record<string, unknown>,
): OperationalOrderDecisionCommand {
  const normalizedOrderId = assertOrderId(orderId);
  const action = body.action;

  if (action === "ACCEPT") {
    if (Object.keys(body).some((key) => key !== "action")) invalidRequest();
    return Object.freeze({
      orderId: normalizedOrderId,
      decision: "ACCEPT",
      reasonCode: null,
    });
  }

  if (action === "REJECT") {
    if (Object.keys(body).some((key) => key !== "action" && key !== "reasonCode")) {
      invalidRequest();
    }
    return Object.freeze({
      orderId: normalizedOrderId,
      decision: "REJECT",
      reasonCode: normalizeOperationalOrderRejectionReason(body.reasonCode),
    });
  }

  invalidRequest();
}

function trustedContext(context: AccessContext): TrustedOperationalOrderContext {
  if (!context.branchId) {
    throw new OperationalOrderDecisionError("ORDER_DECISION_FORBIDDEN");
  }
  return Object.freeze({
    actorId: context.actorId,
    tenantId: context.tenantId,
    branchId: context.branchId,
  });
}

function assertDecisionSource(value: string): OperationalOrderDecisionSourceStatus {
  if (!DECISION_SOURCE_SET.has(value)) {
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVARIANT_VIOLATION");
  }
  return value as OperationalOrderDecisionSourceStatus;
}

export function mapOperationalOrderDecisionResult(
  decision: "ACCEPT" | "REJECT",
  row: OperationalOrderDecisionMutationRow,
): OperationalOrderDecisionResult {
  if (!(row.decidedAt instanceof Date) || Number.isNaN(row.decidedAt.getTime())) {
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVARIANT_VIOLATION");
  }
  const fromStatus = assertDecisionSource(row.fromStatus);

  if (decision === "ACCEPT") {
    if (
      row.status !== "ACCEPTED" ||
      row.customerStatus !== "CONFIRMED" ||
      row.rejectionReason !== null
    ) {
      throw new OperationalOrderDecisionError("ORDER_DECISION_INVARIANT_VIOLATION");
    }
    return Object.freeze({
      orderId: row.id,
      orderNumber: row.orderNumber,
      decision,
      fromStatus,
      status: "ACCEPTED",
      customerStatus: "CONFIRMED",
      decidedAt: row.decidedAt.toISOString(),
      reasonCode: null,
    });
  }

  if (
    row.status !== "REJECTED" ||
    row.customerStatus !== "REJECTED" ||
    !row.rejectionReason ||
    !REJECTION_REASON_SET.has(row.rejectionReason)
  ) {
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVARIANT_VIOLATION");
  }

  return Object.freeze({
    orderId: row.id,
    orderNumber: row.orderNumber,
    decision,
    fromStatus,
    status: "REJECTED",
    customerStatus: "REJECTED",
    decidedAt: row.decidedAt.toISOString(),
    reasonCode: row.rejectionReason as OperationalOrderRejectionReasonCode,
  });
}

async function executeOperationalOrderDecision(
  context: AccessContext,
  command: OperationalOrderDecisionCommand,
  allowedSources: readonly OperationalOrderDecisionSourceStatus[],
): Promise<OperationalOrderDecisionResult> {
  try {
    return await withAuthorizedAccessTransaction(
      context,
      PERMISSIONS.orderManage,
      "branch",
      async (trx, authorizedContext) => {
        const repository = new OperationalOrderDecisionRepository(
          trx,
          trustedContext(authorizedContext),
        );
        const row =
          command.decision === "ACCEPT"
            ? await repository.accept(command.orderId, allowedSources)
            : await repository.reject(command.orderId, command.reasonCode, allowedSources);

        if (!row) {
          const current = await repository.findScopedState(command.orderId);
          if (!current) {
            throw new OperationalOrderDecisionError("ORDER_DECISION_NOT_FOUND");
          }
          throw new OperationalOrderDecisionError("ORDER_DECISION_CONFLICT", current.status);
        }

        return mapOperationalOrderDecisionResult(command.decision, row);
      },
    );
  } catch (error) {
    if (error instanceof OperationalOrderDecisionError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new OperationalOrderDecisionError("ORDER_DECISION_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new OperationalOrderDecisionError("ORDER_DECISION_UNAVAILABLE", error);
    }
    throw new OperationalOrderDecisionError("ORDER_DECISION_UNAVAILABLE", error);
  }
}

export async function acceptOperationalOrder(
  context: AccessContext,
  orderId: string,
): Promise<OperationalOrderDecisionResult> {
  return executeOperationalOrderDecision(
    context,
    Object.freeze({
      orderId: assertOrderId(orderId),
      decision: "ACCEPT",
      reasonCode: null,
    }),
    INITIAL_DECISION_SOURCES,
  );
}

export async function rejectOperationalOrder(
  context: AccessContext,
  orderId: string,
  reasonCode: OperationalOrderRejectionReasonCode,
): Promise<OperationalOrderDecisionResult> {
  return executeOperationalOrderDecision(
    context,
    Object.freeze({
      orderId: assertOrderId(orderId),
      decision: "REJECT",
      reasonCode: normalizeOperationalOrderRejectionReason(reasonCode),
    }),
    INITIAL_DECISION_SOURCES,
  );
}

export async function decideOperationalOrder(
  context: AccessContext,
  command: OperationalOrderDecisionCommand,
): Promise<OperationalOrderDecisionResult> {
  const normalizedCommand: OperationalOrderDecisionCommand =
    command.decision === "ACCEPT"
      ? Object.freeze({
          orderId: assertOrderId(command.orderId),
          decision: "ACCEPT",
          reasonCode: null,
        })
      : Object.freeze({
          orderId: assertOrderId(command.orderId),
          decision: "REJECT",
          reasonCode: normalizeOperationalOrderRejectionReason(command.reasonCode),
        });
  return executeOperationalOrderDecision(context, normalizedCommand, REVIEW_DECISION_SOURCES);
}
