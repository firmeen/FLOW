import "server-only";

import { CustomerCommandError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_CART_ITEM_QUANTITY = 99;
export const MAX_MODIFIER_CHOICES = 32;
export const MAX_SPECIAL_REQUEST_LENGTH = 500;
export const MAX_CUSTOMER_NOTE_LENGTH = 1000;

export function requireCommandUuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
  return value;
}

export function requireCommandQuantity(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > MAX_CART_ITEM_QUANTITY
  ) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
  return value;
}

export function normalizeOptionalCommandText(
  value: unknown,
  maxLength: number,
): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
  return normalized.length > 0 ? normalized : null;
}

export function requireModifierChoiceIds(value: unknown): readonly string[] {
  if (value === undefined) return Object.freeze([]);
  if (!Array.isArray(value) || value.length > MAX_MODIFIER_CHOICES) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }

  const ids = value.map((choiceId) => requireCommandUuid(choiceId));
  if (new Set(ids).size !== ids.length) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
  return Object.freeze(ids);
}
