import "server-only";

export type ManagementOperationErrorCode = "MANAGEMENT_FORBIDDEN" | "MANAGEMENT_UNAVAILABLE";

export class ManagementOperationError extends Error {
  readonly code: ManagementOperationErrorCode;
  readonly cause?: unknown;

  constructor(code: ManagementOperationErrorCode, cause?: unknown) {
    super(code);
    this.name = "ManagementOperationError";
    this.code = code;
    this.cause = cause;
  }
}

export function toManagementOperationError(error: unknown): ManagementOperationError {
  return error instanceof ManagementOperationError ? error : new ManagementOperationError("MANAGEMENT_UNAVAILABLE", error);
}
