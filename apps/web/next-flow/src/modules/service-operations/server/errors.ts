import "server-only";

export type ServiceOperationErrorCode =
  | "SERVICE_REQUEST_INVALID_INPUT"
  | "SERVICE_REQUEST_CONTEXT_REQUIRED"
  | "SERVICE_REQUEST_CONTEXT_REVOKED"
  | "SERVICE_REQUEST_FORBIDDEN"
  | "SERVICE_REQUEST_NOT_FOUND"
  | "SERVICE_REQUEST_CONFLICT"
  | "SERVICE_REQUEST_SESSION_REQUIRED"
  | "SERVICE_REQUEST_UNAVAILABLE";

export class ServiceOperationError extends Error {
  readonly code: ServiceOperationErrorCode;

  constructor(code: ServiceOperationErrorCode, cause?: unknown) {
    super(code, { cause });
    this.name = "ServiceOperationError";
    this.code = code;
  }
}

export function toServiceOperationError(error: unknown): ServiceOperationError {
  return error instanceof ServiceOperationError
    ? error
    : new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
}
