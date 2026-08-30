import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { withAuthorizedAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { OperationalOrderProductionControlError } from "./errors";
import {
  OperationalOrderProductionControlRepository,
  type OperationalOrderProductionControlMutation,
  type OperationalOrderProductionControlRow,
} from "./order-production-control-repository";
import {
  MAX_OPERATIONAL_ORDER_REMAKE_COUNT,
  OPERATIONAL_ORDER_DEFER_ELIGIBLE_STATUSES,
  OPERATIONAL_ORDER_DEFER_REASONS,
  OPERATIONAL_ORDER_PRIORITY_ELIGIBLE_STATUSES,
  OPERATIONAL_ORDER_PRIORITY_REASONS,
  OPERATIONAL_ORDER_PRODUCTION_CONTROL_ACTIONS,
  OPERATIONAL_ORDER_REMAKE_REASONS,
  OPERATIONAL_ORDER_REMAKE_SOURCE_STATUSES,
  OPERATIONAL_ORDER_STATUSES,
  type OperationalOrderDeferEligibleStatus,
  type OperationalOrderDeferReasonCode,
  type OperationalOrderPriorityEligibleStatus,
  type OperationalOrderPriorityReasonCode,
  type OperationalOrderProductionControlAction,
  type OperationalOrderProductionControlCommand,
  type OperationalOrderProductionControlResult,
  type OperationalOrderRemakeReasonCode,
  type OperationalOrderRemakeSourceStatus,
  type OperationalOrderStatus,
  type TrustedOperationalOrderContext,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTION_SET = new Set<string>(OPERATIONAL_ORDER_PRODUCTION_CONTROL_ACTIONS);
const STATUS_SET = new Set<string>(OPERATIONAL_ORDER_STATUSES);
const PRIORITY_REASON_SET = new Set<string>(OPERATIONAL_ORDER_PRIORITY_REASONS);
const PRIORITY_STATUS_SET = new Set<string>(OPERATIONAL_ORDER_PRIORITY_ELIGIBLE_STATUSES);
const DEFER_REASON_SET = new Set<string>(OPERATIONAL_ORDER_DEFER_REASONS);
const DEFER_STATUS_SET = new Set<string>(OPERATIONAL_ORDER_DEFER_ELIGIBLE_STATUSES);
const REMAKE_REASON_SET = new Set<string>(OPERATIONAL_ORDER_REMAKE_REASONS);
const REMAKE_SOURCE_SET = new Set<string>(OPERATIONAL_ORDER_REMAKE_SOURCE_STATUSES);
const MAX_DEFER_HORIZON_MS = 24 * 60 * 60 * 1000;

export const MAX_OPERATIONAL_ORDER_DEFER_HOURS = 24;

function invalidRequest(cause?: unknown): never {
  throw new OperationalOrderProductionControlError("ORDER_CONTROL_INVALID_REQUEST", cause);
}

function invariantViolation(cause?: unknown): never {
  throw new OperationalOrderProductionControlError("ORDER_CONTROL_INVARIANT_VIOLATION", cause);
}

function conflict(cause?: unknown): never {
  throw new OperationalOrderProductionControlError("ORDER_CONTROL_CONFLICT", cause);
}

function assertOrderId(value: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) invalidRequest();
  return normalized;
}

function assertOnlyKeys(body: Record<string, unknown>, allowed: readonly string[]): void {
  const allowedSet = new Set(allowed);
  if (Object.keys(body).some((key) => !allowedSet.has(key))) invalidRequest();
}

function assertAction(value: unknown): OperationalOrderProductionControlAction {
  if (typeof value !== "string" || !ACTION_SET.has(value)) invalidRequest();
  return value as OperationalOrderProductionControlAction;
}

function priorityReason(value: unknown): OperationalOrderPriorityReasonCode {
  if (typeof value !== "string" || !PRIORITY_REASON_SET.has(value)) invalidRequest();
  return value as OperationalOrderPriorityReasonCode;
}

function deferReason(value: unknown): OperationalOrderDeferReasonCode {
  if (typeof value !== "string" || !DEFER_REASON_SET.has(value)) invalidRequest();
  return value as OperationalOrderDeferReasonCode;
}

function remakeReason(value: unknown): OperationalOrderRemakeReasonCode {
  if (typeof value !== "string" || !REMAKE_REASON_SET.has(value)) invalidRequest();
  return value as OperationalOrderRemakeReasonCode;
}

function deferredUntil(value: unknown, nowMs: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") invalidRequest();
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || !/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    invalidRequest();
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || parsed <= nowMs || parsed > nowMs + MAX_DEFER_HORIZON_MS) {
    invalidRequest();
  }
  return new Date(parsed).toISOString();
}

export function parseOperationalOrderProductionControlRequest(
  orderId: string,
  body: Record<string, unknown>,
  nowMs = Date.now(),
): OperationalOrderProductionControlCommand {
  const normalizedOrderId = assertOrderId(orderId);
  const action = assertAction(body.action);

  switch (action) {
    case "SET_PRIORITY":
      assertOnlyKeys(body, ["action", "reasonCode"]);
      return Object.freeze({
        orderId: normalizedOrderId,
        action,
        reasonCode: priorityReason(body.reasonCode),
      });
    case "CLEAR_PRIORITY":
      assertOnlyKeys(body, ["action"]);
      return Object.freeze({ orderId: normalizedOrderId, action });
    case "DEFER_ORDER":
      assertOnlyKeys(body, ["action", "reasonCode", "deferredUntil"]);
      return Object.freeze({
        orderId: normalizedOrderId,
        action,
        reasonCode: deferReason(body.reasonCode),
        deferredUntil: deferredUntil(body.deferredUntil, nowMs),
      });
    case "RESUME_ORDER":
      assertOnlyKeys(body, ["action"]);
      return Object.freeze({ orderId: normalizedOrderId, action });
    case "REQUEST_REMAKE":
      assertOnlyKeys(body, ["action", "reasonCode"]);
      return Object.freeze({
        orderId: normalizedOrderId,
        action,
        reasonCode: remakeReason(body.reasonCode),
      });
    case "START_REMAKE":
      assertOnlyKeys(body, ["action"]);
      return Object.freeze({ orderId: normalizedOrderId, action });
  }
}

function trustedContext(context: AccessContext): TrustedOperationalOrderContext {
  if (!context.branchId) {
    throw new OperationalOrderProductionControlError("ORDER_CONTROL_FORBIDDEN");
  }
  return Object.freeze({
    actorId: context.actorId,
    tenantId: context.tenantId,
    branchId: context.branchId,
  });
}

function assertStatus(value: string): OperationalOrderStatus {
  if (!STATUS_SET.has(value)) invariantViolation();
  return value as OperationalOrderStatus;
}

function iso(value: Date | null): string | null {
  if (value === null) return null;
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) invariantViolation();
  return value.toISOString();
}

function assertControlRow(row: OperationalOrderProductionControlRow): void {
  assertStatus(row.status);
  if (row.priorityCode !== "NORMAL" && row.priorityCode !== "URGENT") invariantViolation();
  if (row.priorityReason !== null && !PRIORITY_REASON_SET.has(row.priorityReason)) invariantViolation();
  if (row.deferReason !== null && !DEFER_REASON_SET.has(row.deferReason)) invariantViolation();
  if (row.lastRemakeReason !== null && !REMAKE_REASON_SET.has(row.lastRemakeReason)) {
    invariantViolation();
  }
  if (
    !Number.isInteger(row.remakeCount) ||
    row.remakeCount < 0 ||
    row.remakeCount > MAX_OPERATIONAL_ORDER_REMAKE_COUNT
  ) {
    invariantViolation();
  }
  if (row.priorityCode === "URGENT" && (!row.priorityReason || !row.prioritizedAt)) {
    invariantViolation();
  }
  if (row.priorityCode === "NORMAL" && (row.priorityReason || row.prioritizedAt)) {
    invariantViolation();
  }
  if (Boolean(row.deferReason) !== Boolean(row.deferredAt)) invariantViolation();
}

export function mapOperationalOrderProductionControlResult(
  action: OperationalOrderProductionControlAction,
  mutation: OperationalOrderProductionControlMutation,
): OperationalOrderProductionControlResult {
  assertControlRow(mutation.row);
  if (!(mutation.controlledAt instanceof Date) || Number.isNaN(mutation.controlledAt.getTime())) {
    invariantViolation();
  }

  return Object.freeze({
    orderId: mutation.row.id,
    orderNumber: mutation.row.orderNumber,
    action,
    status: assertStatus(mutation.row.status),
    customerStatus: mutation.row.customerStatus,
    priority: mutation.row.priorityCode as "NORMAL" | "URGENT",
    priorityReason: mutation.row.priorityReason as OperationalOrderPriorityReasonCode | null,
    prioritizedAt: iso(mutation.row.prioritizedAt),
    deferred: mutation.row.deferReason !== null,
    deferReason: mutation.row.deferReason as OperationalOrderDeferReasonCode | null,
    deferredAt: iso(mutation.row.deferredAt),
    deferredUntil: iso(mutation.row.deferredUntil),
    remakeCount: mutation.row.remakeCount,
    lastRemakeReason: mutation.row.lastRemakeReason as OperationalOrderRemakeReasonCode | null,
    remakeRequestedAt: iso(mutation.row.remakeRequestedAt),
    controlledAt: mutation.controlledAt.toISOString(),
  });
}

async function executeLockedControl(
  repository: OperationalOrderProductionControlRepository,
  command: OperationalOrderProductionControlCommand,
): Promise<OperationalOrderProductionControlMutation> {
  const current = await repository.lockScopedOrder(command.orderId);
  if (!current) throw new OperationalOrderProductionControlError("ORDER_CONTROL_NOT_FOUND");
  const status = assertStatus(current.status);

  switch (command.action) {
    case "SET_PRIORITY": {
      if (!PRIORITY_STATUS_SET.has(status) || current.priorityCode !== "NORMAL") conflict(status);
      const mutation = await repository.setPriority(
        command.orderId,
        status as OperationalOrderPriorityEligibleStatus,
        command.reasonCode,
      );
      if (!mutation) conflict(status);
      return mutation;
    }
    case "CLEAR_PRIORITY": {
      if (!PRIORITY_STATUS_SET.has(status) || current.priorityCode !== "URGENT") conflict(status);
      const mutation = await repository.clearPriority(command.orderId, status);
      if (!mutation) conflict(status);
      return mutation;
    }
    case "DEFER_ORDER": {
      if (!DEFER_STATUS_SET.has(status) || current.deferReason !== null) conflict(status);
      const mutation = await repository.defer(
        command.orderId,
        status as OperationalOrderDeferEligibleStatus,
        command.reasonCode,
        command.deferredUntil ? new Date(command.deferredUntil) : null,
      );
      if (!mutation) conflict(status);
      return mutation;
    }
    case "RESUME_ORDER": {
      if (!DEFER_STATUS_SET.has(status) || current.deferReason === null) conflict(status);
      const mutation = await repository.resume(command.orderId, status);
      if (!mutation) conflict(status);
      return mutation;
    }
    case "REQUEST_REMAKE": {
      if (
        !REMAKE_SOURCE_SET.has(status) ||
        current.deferReason !== null ||
        current.remakeCount >= MAX_OPERATIONAL_ORDER_REMAKE_COUNT
      ) {
        conflict(status);
      }
      const mutation = await repository.requestRemake(
        command.orderId,
        status as OperationalOrderRemakeSourceStatus,
        command.reasonCode,
      );
      if (!mutation) conflict(status);
      return mutation;
    }
    case "START_REMAKE": {
      if (status !== "REMAKE" || current.deferReason !== null) conflict(status);
      const mutation = await repository.startRemake(command.orderId);
      if (!mutation) conflict(status);
      return mutation;
    }
  }
}

export async function executeOperationalOrderProductionControl(
  context: AccessContext,
  command: OperationalOrderProductionControlCommand,
): Promise<OperationalOrderProductionControlResult> {
  const normalizedOrderId = assertOrderId(command.orderId);
  const normalizedCommand = Object.freeze({ ...command, orderId: normalizedOrderId });

  try {
    return await withAuthorizedAccessTransaction(
      context,
      PERMISSIONS.orderManage,
      "branch",
      async (trx, authorizedContext) => {
        const repository = new OperationalOrderProductionControlRepository(
          trx,
          trustedContext(authorizedContext),
        );
        const mutation = await executeLockedControl(repository, normalizedCommand);
        return mapOperationalOrderProductionControlResult(normalizedCommand.action, mutation);
      },
    );
  } catch (error) {
    if (error instanceof OperationalOrderProductionControlError) throw error;
    if (error instanceof AuthorizationDeniedError) {
      throw new OperationalOrderProductionControlError("ORDER_CONTROL_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new OperationalOrderProductionControlError("ORDER_CONTROL_UNAVAILABLE", error);
    }
    throw new OperationalOrderProductionControlError("ORDER_CONTROL_UNAVAILABLE", error);
  }
}
