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

export type OperationalOrderLifecycleErrorCode =
  | "ORDER_LIFECYCLE_INVALID_REQUEST"
  | "ORDER_LIFECYCLE_FORBIDDEN"
  | "ORDER_LIFECYCLE_NOT_FOUND"
  | "ORDER_LIFECYCLE_CONFLICT"
  | "ORDER_LIFECYCLE_INVARIANT_VIOLATION"
  | "ORDER_LIFECYCLE_UNAVAILABLE";

export class OperationalOrderLifecycleError extends Error {
  readonly code: OperationalOrderLifecycleErrorCode;

  constructor(code: OperationalOrderLifecycleErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = "OperationalOrderLifecycleError";
    this.code = code;
  }
}

export function isOperationalOrderLifecycleError(
  value: unknown,
): value is OperationalOrderLifecycleError {
  return value instanceof OperationalOrderLifecycleError;
}

export type OperationalOrderExceptionErrorCode =
  | "ORDER_EXCEPTION_INVALID_REQUEST"
  | "ORDER_EXCEPTION_FORBIDDEN"
  | "ORDER_EXCEPTION_NOT_FOUND"
  | "ORDER_EXCEPTION_CONFLICT"
  | "ORDER_EXCEPTION_INVARIANT_VIOLATION"
  | "ORDER_EXCEPTION_UNAVAILABLE";

export class OperationalOrderExceptionError extends Error {
  readonly code: OperationalOrderExceptionErrorCode;

  constructor(code: OperationalOrderExceptionErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = "OperationalOrderExceptionError";
    this.code = code;
  }
}

export function isOperationalOrderExceptionError(
  value: unknown,
): value is OperationalOrderExceptionError {
  return value instanceof OperationalOrderExceptionError;
}
