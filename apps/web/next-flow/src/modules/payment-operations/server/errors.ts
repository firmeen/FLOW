import "server-only";

export type PaymentOperationErrorCode =
  | "PAYMENT_INVALID_REQUEST"
  | "PAYMENT_FORBIDDEN"
  | "PAYMENT_NOT_FOUND"
  | "PAYMENT_CONFLICT"
  | "PAYMENT_EMPTY_BILL"
  | "PAYMENT_UNAVAILABLE";

export class PaymentOperationError extends Error {
  readonly code: PaymentOperationErrorCode;
  readonly cause?: unknown;

  constructor(code: PaymentOperationErrorCode, cause?: unknown) {
    super(code);
    this.name = "PaymentOperationError";
    this.code = code;
    this.cause = cause;
  }
}

export function toPaymentOperationError(error: unknown): PaymentOperationError {
  return error instanceof PaymentOperationError
    ? error
    : new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
}
