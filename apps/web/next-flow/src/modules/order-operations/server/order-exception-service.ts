import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { withAuthorizedAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { OperationalOrderExceptionError } from "./errors";
import {
  acquireOperationalOrderMutationLock,
  OperationalOrderMutationBusyError,
} from "./order-mutation-lock";
import {
  OperationalOrderExceptionRepository,
  type OperationalOrderAmendmentMutationRow,
  type OperationalOrderCancellationMutationRow,
  type OperationalOrderExceptionItemRow,
  type OperationalOrderExceptionModifierRow,
} from "./order-exception-repository";
import {
  OPERATIONAL_ORDER_AMENDMENT_CHANGE_CATEGORIES,
  OPERATIONAL_ORDER_CANCELLABLE_STATUSES,
  OPERATIONAL_ORDER_CANCELLATION_REASONS,
  type OperationalOrderAmendmentChangeCategory,
  type OperationalOrderAmendmentResult,
  type OperationalOrderCancellationReasonCode,
  type OperationalOrderCancellationResult,
  type OperationalOrderCancellableStatus,
  type OperationalOrderExceptionCommand,
  type OperationalOrderExceptionResult,
  type OperationalOrderItemAmendment,
  type TrustedOperationalOrderContext,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NONNEGATIVE_INTEGER_PATTERN = /^\d+$/;
const SIGNED_INTEGER_PATTERN = /^-?\d+$/;
const CANCELLATION_REASON_SET = new Set<string>(OPERATIONAL_ORDER_CANCELLATION_REASONS);
const CANCELLABLE_STATUS_SET = new Set<string>(OPERATIONAL_ORDER_CANCELLABLE_STATUSES);
const AMENDMENT_CATEGORY_SET = new Set<string>(OPERATIONAL_ORDER_AMENDMENT_CHANGE_CATEGORIES);
const ZERO_BIGINT = BigInt(0);
const MAX_BIGINT = BigInt("9223372036854775807");

export const MAX_OPERATIONAL_ORDER_AMENDMENT_ITEMS = 50;
export const MAX_OPERATIONAL_ORDER_QUANTITY = 99;
export const MAX_OPERATIONAL_ORDER_CUSTOMER_NOTE_LENGTH = 2_000;
export const MAX_OPERATIONAL_ORDER_SPECIAL_REQUEST_LENGTH = 1_000;

function invalidRequest(cause?: unknown): never {
  throw new OperationalOrderExceptionError("ORDER_EXCEPTION_INVALID_REQUEST", cause);
}

function invariantViolation(cause?: unknown): never {
  throw new OperationalOrderExceptionError("ORDER_EXCEPTION_INVARIANT_VIOLATION", cause);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function assertOrderId(value: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) invalidRequest();
  return normalized;
}

function normalizeBoundedText(
  value: unknown,
  maxLength: number,
): string | null {
  if (value === null) return null;
  if (typeof value !== "string") invalidRequest();
  const normalized = value.trim();
  if (normalized.length > maxLength) invalidRequest();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeOperationalOrderCancellationReason(
  value: unknown,
): OperationalOrderCancellationReasonCode {
  if (typeof value !== "string") invalidRequest();
  const normalized = value.trim();
  if (!CANCELLATION_REASON_SET.has(normalized)) invalidRequest();
  return normalized as OperationalOrderCancellationReasonCode;
}

function parseItemAmendment(value: unknown): OperationalOrderItemAmendment {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalidRequest();
  const input = value as Record<string, unknown>;
  const allowed = new Set(["itemId", "quantity", "specialRequest", "remove"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) invalidRequest();

  if (typeof input.itemId !== "string") invalidRequest();
  const itemId = assertOrderId(input.itemId);
  const quantityProvided = hasOwn(input, "quantity");
  const specialRequestProvided = hasOwn(input, "specialRequest");
  const removeProvided = hasOwn(input, "remove");

  if (removeProvided) {
    if (input.remove !== true || quantityProvided || specialRequestProvided) invalidRequest();
    return Object.freeze({ itemId, remove: true });
  }

  if (!quantityProvided && !specialRequestProvided) invalidRequest();

  let quantity: number | undefined;
  if (quantityProvided) {
    if (
      typeof input.quantity !== "number" ||
      !Number.isInteger(input.quantity) ||
      input.quantity < 1 ||
      input.quantity > MAX_OPERATIONAL_ORDER_QUANTITY
    ) {
      invalidRequest();
    }
    quantity = input.quantity;
  }

  const specialRequest = specialRequestProvided
    ? normalizeBoundedText(input.specialRequest, MAX_OPERATIONAL_ORDER_SPECIAL_REQUEST_LENGTH)
    : undefined;

  return Object.freeze({
    itemId,
    ...(quantityProvided ? { quantity } : {}),
    ...(specialRequestProvided ? { specialRequest } : {}),
  });
}

export function parseOperationalOrderExceptionRequest(
  orderId: string,
  body: Record<string, unknown>,
): OperationalOrderExceptionCommand {
  const normalizedOrderId = assertOrderId(orderId);

  if (body.action === "AMEND") {
    const allowed = new Set(["action", "customerNote", "itemChanges"]);
    if (Object.keys(body).some((key) => !allowed.has(key))) invalidRequest();

    const customerNoteProvided = hasOwn(body, "customerNote");
    const customerNote = customerNoteProvided
      ? normalizeBoundedText(body.customerNote, MAX_OPERATIONAL_ORDER_CUSTOMER_NOTE_LENGTH)
      : undefined;

    let itemChanges: readonly OperationalOrderItemAmendment[] = [];
    if (hasOwn(body, "itemChanges")) {
      if (!Array.isArray(body.itemChanges)) invalidRequest();
      if (body.itemChanges.length > MAX_OPERATIONAL_ORDER_AMENDMENT_ITEMS) invalidRequest();
      itemChanges = Object.freeze(body.itemChanges.map(parseItemAmendment));
    }

    if (!customerNoteProvided && itemChanges.length === 0) invalidRequest();

    const seen = new Set<string>();
    for (const change of itemChanges) {
      if (seen.has(change.itemId)) invalidRequest();
      seen.add(change.itemId);
    }

    return Object.freeze({
      orderId: normalizedOrderId,
      action: "AMEND",
      ...(customerNoteProvided ? { customerNote } : {}),
      itemChanges,
    });
  }

  if (body.action === "CANCEL") {
    if (Object.keys(body).some((key) => key !== "action" && key !== "reasonCode")) {
      invalidRequest();
    }
    return Object.freeze({
      orderId: normalizedOrderId,
      action: "CANCEL",
      reasonCode: normalizeOperationalOrderCancellationReason(body.reasonCode),
    });
  }

  invalidRequest();
}

function trustedContext(context: AccessContext): TrustedOperationalOrderContext {
  if (!context.branchId) {
    throw new OperationalOrderExceptionError("ORDER_EXCEPTION_FORBIDDEN");
  }
  return Object.freeze({
    actorId: context.actorId,
    tenantId: context.tenantId,
    branchId: context.branchId,
  });
}

function parseNonnegativeMinor(value: string): bigint {
  const normalized = String(value);
  if (!NONNEGATIVE_INTEGER_PATTERN.test(normalized)) invariantViolation();
  const parsed = BigInt(normalized);
  if (parsed > MAX_BIGINT) invariantViolation();
  return parsed;
}

function parseSignedMinor(value: string): bigint {
  const normalized = String(value);
  if (!SIGNED_INTEGER_PATTERN.test(normalized)) invariantViolation();
  const parsed = BigInt(normalized);
  if (parsed > MAX_BIGINT || parsed < -MAX_BIGINT) invariantViolation();
  return parsed;
}

function calculateLineTotal(
  item: OperationalOrderExceptionItemRow,
  modifiers: readonly OperationalOrderExceptionModifierRow[],
  quantity: number,
): bigint {
  const unitPrice = parseNonnegativeMinor(item.unitPriceMinor);
  const modifierDelta = modifiers
    .filter((modifier) => modifier.orderItemId === item.id)
    .reduce((sum, modifier) => sum + parseSignedMinor(modifier.priceDeltaMinor), ZERO_BIGINT);
  const unitTotal = unitPrice + modifierDelta;
  if (unitTotal < ZERO_BIGINT) invariantViolation();
  const lineTotal = unitTotal * BigInt(quantity);
  if (lineTotal < ZERO_BIGINT || lineTotal > MAX_BIGINT) invariantViolation();
  return lineTotal;
}

function assertExistingMoneyInvariant(
  orderSubtotalMinor: string,
  items: readonly OperationalOrderExceptionItemRow[],
  modifiers: readonly OperationalOrderExceptionModifierRow[],
): void {
  let subtotal = ZERO_BIGINT;
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) invariantViolation();
    const expected = calculateLineTotal(item, modifiers, item.quantity);
    if (parseNonnegativeMinor(item.lineTotalMinor) !== expected) invariantViolation();
    subtotal += expected;
    if (subtotal > MAX_BIGINT) invariantViolation();
  }
  if (parseNonnegativeMinor(orderSubtotalMinor) !== subtotal) invariantViolation();
}

function aggregateChangeCategory(
  categories: ReadonlySet<OperationalOrderAmendmentChangeCategory>,
): OperationalOrderAmendmentChangeCategory {
  if (categories.size === 0) invalidRequest();
  if (categories.size > 1) return "MULTIPLE_FIELDS";
  const value = [...categories][0];
  if (!value || !AMENDMENT_CATEGORY_SET.has(value)) invariantViolation();
  return value;
}

export function mapOperationalOrderAmendmentResult(
  row: OperationalOrderAmendmentMutationRow,
  changeCategory: OperationalOrderAmendmentChangeCategory,
): OperationalOrderAmendmentResult {
  if (
    row.status !== "CHANGED" ||
    row.customerStatus !== "SENT" ||
    !row.id ||
    !row.orderNumber ||
    !/^[A-Z]{3}$/.test(row.currency) ||
    !AMENDMENT_CATEGORY_SET.has(changeCategory) ||
    !(row.changedAt instanceof Date) ||
    Number.isNaN(row.changedAt.getTime())
  ) {
    invariantViolation();
  }
  parseNonnegativeMinor(row.subtotalMinor);

  return Object.freeze({
    orderId: row.id,
    orderNumber: row.orderNumber,
    action: "AMEND",
    fromStatus: "ACCEPTED",
    status: "CHANGED",
    customerStatus: "SENT",
    subtotalMinor: String(row.subtotalMinor),
    currency: row.currency,
    changeCategory,
    changedAt: row.changedAt.toISOString(),
  });
}

export function mapOperationalOrderCancellationResult(
  sourceStatus: OperationalOrderCancellableStatus,
  reasonCode: OperationalOrderCancellationReasonCode,
  row: OperationalOrderCancellationMutationRow,
): OperationalOrderCancellationResult {
  if (
    !CANCELLABLE_STATUS_SET.has(sourceStatus) ||
    !CANCELLATION_REASON_SET.has(reasonCode) ||
    row.status !== "CANCELLED" ||
    row.customerStatus !== "CANCELLED" ||
    !row.id ||
    !row.orderNumber ||
    !(row.cancelledAt instanceof Date) ||
    Number.isNaN(row.cancelledAt.getTime())
  ) {
    invariantViolation();
  }

  return Object.freeze({
    orderId: row.id,
    orderNumber: row.orderNumber,
    action: "CANCEL",
    fromStatus: sourceStatus,
    status: "CANCELLED",
    customerStatus: "CANCELLED",
    reasonCode,
    cancelledAt: row.cancelledAt.toISOString(),
  });
}

async function executeAmendment(
  repository: OperationalOrderExceptionRepository,
  command: Extract<OperationalOrderExceptionCommand, { readonly action: "AMEND" }>,
): Promise<OperationalOrderAmendmentResult> {
  const order = await repository.lockAcceptedOrder(command.orderId);
  if (!order) {
    const current = await repository.findScopedState(command.orderId);
    if (!current) throw new OperationalOrderExceptionError("ORDER_EXCEPTION_NOT_FOUND");
    throw new OperationalOrderExceptionError("ORDER_EXCEPTION_CONFLICT", current.status);
  }

  const items = await repository.listItems(command.orderId);
  if (items.length === 0) invariantViolation();
  const modifiers = await repository.listModifiers(items.map((item) => item.id));
  assertExistingMoneyInvariant(order.subtotalMinor, items, modifiers);

  const itemById = new Map(items.map((item) => [item.id, item] as const));
  for (const change of command.itemChanges) {
    if (!itemById.has(change.itemId)) {
      throw new OperationalOrderExceptionError("ORDER_EXCEPTION_NOT_FOUND");
    }
  }

  const categories = new Set<OperationalOrderAmendmentChangeCategory>();
  const customerNoteProvided = hasOwn(command, "customerNote");
  const desiredCustomerNote = customerNoteProvided ? (command.customerNote ?? null) : order.customerNote;
  if (customerNoteProvided && desiredCustomerNote !== order.customerNote) {
    categories.add("CUSTOMER_NOTE");
  }

  const changesById = new Map(command.itemChanges.map((change) => [change.itemId, change] as const));
  const removals = new Set<string>();
  let subtotal = ZERO_BIGINT;

  for (const item of items) {
    const change = changesById.get(item.id);
    if (change?.remove === true) {
      removals.add(item.id);
      categories.add("ITEM_REMOVED");
      continue;
    }

    const quantity = change?.quantity ?? item.quantity;
    const specialRequest =
      change && hasOwn(change, "specialRequest")
        ? (change.specialRequest ?? null)
        : item.specialRequest;

    if (quantity !== item.quantity) categories.add("ITEM_QUANTITY");
    if (specialRequest !== item.specialRequest) categories.add("ITEM_SPECIAL_REQUEST");

    const lineTotal = calculateLineTotal(item, modifiers, quantity);
    subtotal += lineTotal;
    if (subtotal > MAX_BIGINT) invariantViolation();

    if (quantity !== item.quantity || specialRequest !== item.specialRequest) {
      const updated = await repository.updateItem(command.orderId, item.id, {
        quantity,
        lineTotalMinor: lineTotal.toString(),
        specialRequest,
      });
      if (!updated) invariantViolation();
    }
  }

  if (removals.size === items.length) invalidRequest();
  for (const itemId of [...removals].sort()) {
    const removed = await repository.removeItem(command.orderId, itemId);
    if (!removed) invariantViolation();
  }

  const changeCategory = aggregateChangeCategory(categories);
  const row = await repository.finalizeAmendment({
    orderId: command.orderId,
    subtotalMinor: subtotal.toString(),
    customerNoteProvided,
    customerNote: desiredCustomerNote,
    changeCategory,
  });
  if (!row) throw new OperationalOrderExceptionError("ORDER_EXCEPTION_CONFLICT");
  return mapOperationalOrderAmendmentResult(row, changeCategory);
}

async function executeCancellation(
  repository: OperationalOrderExceptionRepository,
  command: Extract<OperationalOrderExceptionCommand, { readonly action: "CANCEL" }>,
): Promise<OperationalOrderCancellationResult> {
  const observed = await repository.readCancellationSource(command.orderId);
  if (!observed) throw new OperationalOrderExceptionError("ORDER_EXCEPTION_NOT_FOUND");
  if (!CANCELLABLE_STATUS_SET.has(observed.status)) {
    throw new OperationalOrderExceptionError("ORDER_EXCEPTION_CONFLICT", observed.status);
  }
  const sourceStatus = observed.status as OperationalOrderCancellableStatus;
  const row = await repository.cancel(command.orderId, sourceStatus, command.reasonCode);
  if (!row) {
    const current = await repository.findScopedState(command.orderId);
    if (!current) throw new OperationalOrderExceptionError("ORDER_EXCEPTION_NOT_FOUND");
    throw new OperationalOrderExceptionError("ORDER_EXCEPTION_CONFLICT", current.status);
  }
  return mapOperationalOrderCancellationResult(sourceStatus, command.reasonCode, row);
}

export async function executeOperationalOrderException(
  context: AccessContext,
  command: OperationalOrderExceptionCommand,
): Promise<OperationalOrderExceptionResult> {
  const normalizedOrderId = assertOrderId(command.orderId);

  try {
    return await withAuthorizedAccessTransaction(
      context,
      PERMISSIONS.orderManage,
      "branch",
      async (trx, authorizedContext) => {
        const scopedContext = trustedContext(authorizedContext);
        const locked = await acquireOperationalOrderMutationLock(
          trx,
          scopedContext,
          normalizedOrderId,
        );
        if (!locked) {
          throw new OperationalOrderExceptionError("ORDER_EXCEPTION_NOT_FOUND");
        }

        const repository = new OperationalOrderExceptionRepository(trx, scopedContext);
        const normalizedCommand = Object.freeze({ ...command, orderId: normalizedOrderId });
        return normalizedCommand.action === "AMEND"
          ? executeAmendment(repository, normalizedCommand)
          : executeCancellation(repository, normalizedCommand);
      },
    );
  } catch (error) {
    if (error instanceof OperationalOrderExceptionError) throw error;
    if (error instanceof OperationalOrderMutationBusyError) {
      throw new OperationalOrderExceptionError("ORDER_EXCEPTION_CONFLICT", error);
    }
    if (error instanceof AuthorizationDeniedError) {
      throw new OperationalOrderExceptionError("ORDER_EXCEPTION_FORBIDDEN", error);
    }
    if (error instanceof AuthorizationUnavailableError) {
      throw new OperationalOrderExceptionError("ORDER_EXCEPTION_UNAVAILABLE", error);
    }
    throw new OperationalOrderExceptionError("ORDER_EXCEPTION_UNAVAILABLE", error);
  }
}

export async function amendOperationalOrder(
  context: AccessContext,
  orderId: string,
  input: Omit<Extract<OperationalOrderExceptionCommand, { readonly action: "AMEND" }>, "orderId" | "action">,
): Promise<OperationalOrderAmendmentResult> {
  return executeOperationalOrderException(
    context,
    Object.freeze({ orderId: assertOrderId(orderId), action: "AMEND", ...input }),
  ) as Promise<OperationalOrderAmendmentResult>;
}

export async function cancelOperationalOrder(
  context: AccessContext,
  orderId: string,
  reasonCode: OperationalOrderCancellationReasonCode,
): Promise<OperationalOrderCancellationResult> {
  return executeOperationalOrderException(
    context,
    Object.freeze({
      orderId: assertOrderId(orderId),
      action: "CANCEL",
      reasonCode: normalizeOperationalOrderCancellationReason(reasonCode),
    }),
  ) as Promise<OperationalOrderCancellationResult>;
}
