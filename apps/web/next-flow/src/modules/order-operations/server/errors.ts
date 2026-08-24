import "server-only";

export type OperationalOrderReadErrorCode =
  | "ORDER_QUEUE_INVALID_QUERY"
  | "ORDER_QUEUE_NOT_FOUND"
  | "ORDER_QUEUE_FORBIDDEN"
  | "ORDER_QUEUE_UNAVAILABLE"
  | "ORDER_QUEUE_INVARIANT_VIOLATION";

export class OperationalOrderReadError extends Error {
  readonly code: OperationalOrderReadErrorCode;

  constructor(code: OperationalOrderReadErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = "OperationalOrderReadError";
    this.code = code;
  }
}

export function isOperationalOrderReadError(
  value: unknown,
): value is OperationalOrderReadError {
  return value instanceof OperationalOrderReadError;
}
