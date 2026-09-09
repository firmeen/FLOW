import "server-only";

export type KitchenOperationErrorCode =
  | "KITCHEN_INVALID_REQUEST"
  | "KITCHEN_FORBIDDEN"
  | "KITCHEN_NOT_FOUND"
  | "KITCHEN_CONFLICT"
  | "KITCHEN_UNAVAILABLE";

export class KitchenOperationError extends Error {
  readonly code: KitchenOperationErrorCode;
  readonly cause?: unknown;

  constructor(code: KitchenOperationErrorCode, cause?: unknown) {
    super(code);
    this.name = "KitchenOperationError";
    this.code = code;
    this.cause = cause;
  }
}

export function toKitchenOperationError(error: unknown): KitchenOperationError {
  return error instanceof KitchenOperationError
    ? error
    : new KitchenOperationError("KITCHEN_UNAVAILABLE", error);
}
