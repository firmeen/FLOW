import "server-only";

import { CustomerDataError } from "../errors";

export type CustomerCommandErrorCode =
  | "CUSTOMER_COMMAND_INVALID_INPUT"
  | "CUSTOMER_COMMAND_CONTEXT_REQUIRED"
  | "CUSTOMER_COMMAND_CONTEXT_REVOKED"
  | "CUSTOMER_COMMAND_NOT_FOUND"
  | "CUSTOMER_COMMAND_CONFLICT"
  | "CUSTOMER_COMMAND_CART_NOT_EDITABLE"
  | "CUSTOMER_COMMAND_CART_EMPTY"
  | "CUSTOMER_COMMAND_ITEM_UNAVAILABLE"
  | "CUSTOMER_COMMAND_UNAVAILABLE";

const SAFE_MESSAGES: Record<CustomerCommandErrorCode, string> = {
  CUSTOMER_COMMAND_INVALID_INPUT: "The request is invalid.",
  CUSTOMER_COMMAND_CONTEXT_REQUIRED: "Customer entry is required.",
  CUSTOMER_COMMAND_CONTEXT_REVOKED: "Customer entry is no longer valid.",
  CUSTOMER_COMMAND_NOT_FOUND: "The requested resource is unavailable.",
  CUSTOMER_COMMAND_CONFLICT: "The request conflicts with current state.",
  CUSTOMER_COMMAND_CART_NOT_EDITABLE: "The cart is no longer editable.",
  CUSTOMER_COMMAND_CART_EMPTY: "The cart is empty.",
  CUSTOMER_COMMAND_ITEM_UNAVAILABLE: "One or more cart items are unavailable.",
  CUSTOMER_COMMAND_UNAVAILABLE: "The request is temporarily unavailable.",
};

export class CustomerCommandError extends Error {
  readonly code: CustomerCommandErrorCode;

  constructor(code: CustomerCommandErrorCode, cause?: unknown) {
    super(SAFE_MESSAGES[code], { cause });
    this.name = "CustomerCommandError";
    this.code = code;
  }
}

function postgresCode(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

export function toCustomerCommandError(
  error: unknown,
  invariantCode: CustomerCommandErrorCode = "CUSTOMER_COMMAND_CONFLICT",
): CustomerCommandError {
  if (error instanceof CustomerCommandError) return error;

  if (postgresCode(error) === "23505") {
    return new CustomerCommandError("CUSTOMER_COMMAND_CONFLICT", error);
  }

  if (error instanceof CustomerDataError) {
    switch (error.code) {
      case "CUSTOMER_CONTEXT_REQUIRED":
        return new CustomerCommandError("CUSTOMER_COMMAND_CONTEXT_REQUIRED", error);
      case "CUSTOMER_RESOURCE_NOT_FOUND":
      case "CUSTOMER_SCOPE_DENIED":
        return new CustomerCommandError("CUSTOMER_COMMAND_NOT_FOUND", error);
      case "CUSTOMER_DATA_INVARIANT_VIOLATION":
        return new CustomerCommandError(invariantCode, error);
      case "CUSTOMER_DATA_UNAVAILABLE":
        return new CustomerCommandError("CUSTOMER_COMMAND_UNAVAILABLE", error);
    }
  }

  return new CustomerCommandError("CUSTOMER_COMMAND_UNAVAILABLE", error);
}
