import "server-only";

import type {
  CustomerCartAggregate,
  CustomerSubmittedOrder,
} from "../persistence-types";
import {
  addCustomerCartItem,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "../commands/cart-commands";
import { submitCustomerOrder } from "../commands/submit-order";
import {
  customerCommandDependenciesForScope,
  type CustomerCommandDependencies,
} from "../commands/runtime";
import type {
  AddCartItemCommandInput,
  RemoveCartItemCommandInput,
  SubmitOrderCommandInput,
  UpdateCartItemCommandInput,
} from "../commands/types";
import {
  MAX_CUSTOMER_NOTE_LENGTH,
  MAX_SPECIAL_REQUEST_LENGTH,
  normalizeOptionalCommandText,
  requireCommandQuantity,
  requireCommandUuid,
  requireModifierChoiceIds,
} from "../commands/validation";
import { CustomerCommandError } from "../commands/errors";
import { executeIdempotentCustomerCommand } from "./execute-idempotent-command";
import type { IdempotentCustomerCommandResult } from "./types";

function serializeJson(value: unknown): unknown {
  const serialized = JSON.stringify(value);
  if (!serialized) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
  }
  return JSON.parse(serialized) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deserializeCart(value: unknown): CustomerCartAggregate {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.status !== "string" ||
    typeof value.subtotalMinor !== "string" ||
    !Array.isArray(value.items)
  ) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
  }
  return value as unknown as CustomerCartAggregate;
}

function deserializeSubmittedOrder(value: unknown): CustomerSubmittedOrder {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.sourceCartId !== "string" ||
    typeof value.orderNumber !== "string" ||
    value.status !== "PENDING_CONFIRMATION" ||
    value.customerStatus !== "SENT" ||
    typeof value.submittedAt !== "string" ||
    typeof value.subtotalMinor !== "string" ||
    typeof value.currency !== "string"
  ) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
  }

  const submittedAt = new Date(value.submittedAt);
  if (Number.isNaN(submittedAt.getTime())) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT");
  }

  return Object.freeze({
    id: value.id,
    sourceCartId: value.sourceCartId,
    orderNumber: value.orderNumber,
    status: "PENDING_CONFIRMATION" as const,
    customerStatus: "SENT" as const,
    submittedAt,
    subtotalMinor: value.subtotalMinor,
    currency: value.currency,
  });
}

function lowerUuid(value: unknown): string {
  return requireCommandUuid(value).toLowerCase();
}

export async function addCustomerCartItemIdempotent(
  input: AddCartItemCommandInput,
  idempotencyKey: string,
  dependencies?: CustomerCommandDependencies,
): Promise<IdempotentCustomerCommandResult<CustomerCartAggregate>> {
  const normalized = Object.freeze({
    cartId: lowerUuid(input.cartId),
    menuItemId: lowerUuid(input.menuItemId),
    quantity: requireCommandQuantity(input.quantity),
    modifierChoiceIds: Object.freeze(
      requireModifierChoiceIds(input.modifierChoiceIds)
        .map((id) => id.toLowerCase())
        .sort(),
    ),
    specialRequest: normalizeOptionalCommandText(
      input.specialRequest,
      MAX_SPECIAL_REQUEST_LENGTH,
    ),
  });

  return executeIdempotentCustomerCommand({
    command: "CART_ADD_ITEM",
    idempotencyKey,
    fingerprintSource: normalized,
    successStatus: 200,
    dependencies,
    execute: ({ scope, customerContext }) =>
      addCustomerCartItem(
        normalized,
        customerCommandDependenciesForScope(customerContext, scope),
      ),
    serializeResult: serializeJson,
    deserializeResult: deserializeCart,
    resource: (cart) => ({ type: "cart", id: cart.id }),
  });
}

export async function updateCustomerCartItemIdempotent(
  input: UpdateCartItemCommandInput,
  idempotencyKey: string,
  dependencies?: CustomerCommandDependencies,
): Promise<IdempotentCustomerCommandResult<CustomerCartAggregate>> {
  const normalized = Object.freeze({
    cartId: lowerUuid(input.cartId),
    cartItemId: lowerUuid(input.cartItemId),
    quantity: requireCommandQuantity(input.quantity),
  });

  return executeIdempotentCustomerCommand({
    command: "CART_UPDATE_ITEM",
    idempotencyKey,
    fingerprintSource: normalized,
    successStatus: 200,
    dependencies,
    execute: ({ scope, customerContext }) =>
      updateCustomerCartItem(
        normalized,
        customerCommandDependenciesForScope(customerContext, scope),
      ),
    serializeResult: serializeJson,
    deserializeResult: deserializeCart,
    resource: (cart) => ({ type: "cart", id: cart.id }),
  });
}

export async function removeCustomerCartItemIdempotent(
  input: RemoveCartItemCommandInput,
  idempotencyKey: string,
  dependencies?: CustomerCommandDependencies,
): Promise<IdempotentCustomerCommandResult<CustomerCartAggregate>> {
  const normalized = Object.freeze({
    cartId: lowerUuid(input.cartId),
    cartItemId: lowerUuid(input.cartItemId),
  });

  return executeIdempotentCustomerCommand({
    command: "CART_REMOVE_ITEM",
    idempotencyKey,
    fingerprintSource: normalized,
    successStatus: 200,
    dependencies,
    execute: ({ scope, customerContext }) =>
      removeCustomerCartItem(
        normalized,
        customerCommandDependenciesForScope(customerContext, scope),
      ),
    serializeResult: serializeJson,
    deserializeResult: deserializeCart,
    resource: (cart) => ({ type: "cart", id: cart.id }),
  });
}

export async function submitCustomerOrderIdempotent(
  input: SubmitOrderCommandInput,
  idempotencyKey: string,
  dependencies?: CustomerCommandDependencies,
): Promise<IdempotentCustomerCommandResult<CustomerSubmittedOrder>> {
  const normalized = Object.freeze({
    cartId: lowerUuid(input.cartId),
    customerNote: normalizeOptionalCommandText(
      input.customerNote,
      MAX_CUSTOMER_NOTE_LENGTH,
    ),
  });

  return executeIdempotentCustomerCommand({
    command: "ORDER_SUBMIT",
    idempotencyKey,
    fingerprintSource: normalized,
    successStatus: 201,
    dependencies,
    execute: ({ scope, customerContext }) =>
      submitCustomerOrder(
        normalized,
        customerCommandDependenciesForScope(customerContext, scope),
      ),
    serializeResult: serializeJson,
    deserializeResult: deserializeSubmittedOrder,
    resource: (order) => ({ type: "order", id: order.id }),
  });
}
