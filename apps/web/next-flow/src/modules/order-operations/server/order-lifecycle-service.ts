import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { withAuthorizedAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { OperationalOrderLifecycleError } from "./errors";
import {
  OperationalOrderLifecycleRepository,
  type OperationalOrderLifecycleMutationRow,
} from "./order-lifecycle-repository";
import {
  OPERATIONAL_ORDER_LIFECYCLE_ACTIONS,
  type OperationalOrderLifecycleAction,
  type OperationalOrderLifecycleCommand,
  type OperationalOrderLifecycleResult,
  type OperationalOrderLifecycleTransitionSpec,
  type TrustedOperationalOrderContext,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTION_SET = new Set<string>(OPERATIONAL_ORDER_LIFECYCLE_ACTIONS);

export const LIFECYCLE_TRANSITIONS = Object.freeze({
  START_PREPARING: Object.freeze({
    action: "START_PREPARING",
    from: "ACCEPTED",
    to: "PREPARING",
    customerStatus: "PREPARING",
    eventType: "ORDER_PREPARING",
    timestampColumn: "preparing_at",
  }),
  MARK_READY: Object.freeze({
    action: "MARK_READY",
    from: "PREPARING",
    to: "READY",
    customerStatus: "COMING_TO_TABLE",
    eventType: "ORDER_READY",
    timestampColumn: "ready_at",
  }),
  MARK_SERVED: Object.freeze({
    action: "MARK_SERVED",
    from: "READY",
    to: "SERVED",
    customerStatus: "SERVED",
    eventType: "ORDER_SERVED",
    timestampColumn: "served_at",
  }),
} satisfies Record<OperationalOrderLifecycleAction, OperationalOrderLifecycleTransitionSpec>);

function invalidRequest(cause?: unknown): never {
  throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_INVALID_REQUEST", cause);
}

function assertOrderId(value: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) invalidRequest();
  return normalized;
}

function assertAction(value: unknown): OperationalOrderLifecycleAction {
  if (typeof value !== "string" || !ACTION_SET.has(value)) invalidRequest();
  return value as OperationalOrderLifecycleAction;
}

export function parseOperationalOrderLifecycleRequest(
  orderId: string,
  body: Record<string, unknown>,
): OperationalOrderLifecycleCommand {
  if (Object.keys(body).some((key) => key !== "action")) invalidRequest();
  return Object.freeze({
    orderId: assertOrderId(orderId),
    action: assertAction(body.action),
  });
}

function trustedContext(context: AccessContext): TrustedOperationalOrderContext {
  if (!context.branchId) {
    throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_FORBIDDEN");
  }
  return Object.freeze({
    actorId: context.actorId,
    tenantId: context.tenantId,
    branchId: context.branchId,
  });
}

function transitionTimestamp(
  row: OperationalOrderLifecycleMutationRow,
  spec: OperationalOrderLifecycleTransitionSpec,
): Date {
  const value =
    spec.timestampColumn === "preparing_at"
      ? row.preparingAt
      : spec.timestampColumn === "ready_at"
        ? row.readyAt
        : row.servedAt;
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_INVARIANT_VIOLATION");
  }
  return value;
}

export function mapOperationalOrderLifecycleResult(
  spec: OperationalOrderLifecycleTransitionSpec,
  row: OperationalOrderLifecycleMutationRow,
): OperationalOrderLifecycleResult {
  if (
    row.status !== spec.to ||
    row.customerStatus !== spec.customerStatus ||
    !row.id ||
    !row.orderNumber
  ) {
    throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_INVARIANT_VIOLATION");
  }

  return Object.freeze({
    orderId: row.id,
    orderNumber: row.orderNumber,
    action: spec.action,
    fromStatus: spec.from,
    status: spec.to,
    customerStatus: spec.customerStatus,
    transitionedAt: transitionTimestamp(row, spec).toISOString(),
  });
}

export async function transitionOperationalOrderLifecycle(
  context: AccessContext,
  command: OperationalOrderLifecycleCommand,
): Promise<OperationalOrderLifecycleResult> {
  const normalizedCommand = Object.freeze({
    orderId: assertOrderId(command.orderId),
    action: assertAction(command.action),
  });
  const spec = LIFECYCLE_TRANSITIONS[normalizedCommand.action];

  try {
    return await withAuthorizedAccessTransaction(
      context,
      PERMISSIONS.orderManage,
      "branch",
      async (trx, authorizedContext) => {
        const repository = new OperationalOrderLifecycleRepository(
          trx,
          trustedContext(authorizedContext),
        );
        const row = await repository.transition(normalizedCommand.orderId, spec);
        if (!row) {
          const current = await repository.findScopedState(normalizedCommand.orderId);
          if (!current) {
            throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_NOT_FOUND");
          }
          throw new OperationalOrderLifecycleError(
            "ORDER_LIFECYCLE_CONFLICT",
            current.status,
          );
        }
        return mapOperationalOrderLifecycleResult(spec, row);
      },
    );
  } catch (error) {
    if (error instanceof OperationalOrderLifecycleError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_UNAVAILABLE", error);
    }
    throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_UNAVAILABLE", error);
  }
}

export async function startPreparingOperationalOrder(
  context: AccessContext,
  orderId: string,
): Promise<OperationalOrderLifecycleResult> {
  return transitionOperationalOrderLifecycle(
    context,
    Object.freeze({ orderId: assertOrderId(orderId), action: "START_PREPARING" }),
  );
}

export async function markOperationalOrderReady(
  context: AccessContext,
  orderId: string,
): Promise<OperationalOrderLifecycleResult> {
  return transitionOperationalOrderLifecycle(
    context,
    Object.freeze({ orderId: assertOrderId(orderId), action: "MARK_READY" }),
  );
}

export async function markOperationalOrderServed(
  context: AccessContext,
  orderId: string,
): Promise<OperationalOrderLifecycleResult> {
  return transitionOperationalOrderLifecycle(
    context,
    Object.freeze({ orderId: assertOrderId(orderId), action: "MARK_SERVED" }),
  );
}
