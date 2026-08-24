import "server-only";

export type CustomerDataErrorCode =
  | "CUSTOMER_CONTEXT_REQUIRED"
  | "CUSTOMER_RESOURCE_NOT_FOUND"
  | "CUSTOMER_SCOPE_DENIED"
  | "CUSTOMER_DATA_UNAVAILABLE"
  | "CUSTOMER_DATA_INVARIANT_VIOLATION";

const SAFE_MESSAGES: Record<CustomerDataErrorCode, string> = {
  CUSTOMER_CONTEXT_REQUIRED: "A verified customer context is required.",
  CUSTOMER_RESOURCE_NOT_FOUND: "The requested customer resource is unavailable.",
  CUSTOMER_SCOPE_DENIED: "The requested customer resource is unavailable.",
  CUSTOMER_DATA_UNAVAILABLE: "Customer data is temporarily unavailable.",
  CUSTOMER_DATA_INVARIANT_VIOLATION: "Customer data is temporarily unavailable.",
};

export class CustomerDataError extends Error {
  readonly code: CustomerDataErrorCode;

  constructor(code: CustomerDataErrorCode, cause?: unknown) {
    super(SAFE_MESSAGES[code], { cause });
    this.name = "CustomerDataError";
    this.code = code;
  }
}

export function toCustomerDataError(error: unknown): CustomerDataError {
  if (error instanceof CustomerDataError) return error;
  return new CustomerDataError("CUSTOMER_DATA_UNAVAILABLE", error);
}

export type CustomerDataResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_found" }
  | { status: "unavailable" };

export function toCustomerDataResult<T>(error: unknown): CustomerDataResult<T> {
  const mapped = toCustomerDataError(error);
  if (
    mapped.code === "CUSTOMER_RESOURCE_NOT_FOUND" ||
    mapped.code === "CUSTOMER_SCOPE_DENIED"
  ) {
    return { status: "not_found" };
  }
  return { status: "unavailable" };
}
