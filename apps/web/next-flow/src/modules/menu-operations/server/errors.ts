import "server-only";

export type MenuOperationErrorCode =
  | "MENU_INVALID_REQUEST"
  | "MENU_FORBIDDEN"
  | "MENU_NOT_FOUND"
  | "MENU_CONFLICT"
  | "MENU_UNAVAILABLE";

export class MenuOperationError extends Error {
  readonly code: MenuOperationErrorCode;
  readonly cause?: unknown;

  constructor(code: MenuOperationErrorCode, cause?: unknown) {
    super(code);
    this.name = "MenuOperationError";
    this.code = code;
    this.cause = cause;
  }
}

export function toMenuOperationError(error: unknown): MenuOperationError {
  return error instanceof MenuOperationError ? error : new MenuOperationError("MENU_UNAVAILABLE", error);
}
