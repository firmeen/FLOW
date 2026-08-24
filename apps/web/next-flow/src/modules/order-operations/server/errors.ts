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

export type OperationalOrderDecisionErrorCode =
  | "ORDER_DECISION_INVALID_REQUEST"
  | "ORDER_DECISION_FORBIDDEN"
  | "ORDER_DECISION_NOT_FOUND"
  | "ORDER_DECISION_CONFLICT"
  | "ORDER_DECISION_INVARIANT_VIOLATION"
  | "ORDER_DECISION_UNAVAILABLE";

export class OperationalOrderDecisionError extends Error {
  readonly code: OperationalOrderDecisionErrorCode;

  constructor(code: OperationalOrderDecisionErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = "OperationalOrderDecisionError";
    this.code = code;
  }
}

export function isOperationalOrderDecisionError(
  value: unknown,
): value is OperationalOrderDecisionError {
  return value instanceof OperationalOrderDecisionError;
}
