import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
  authorizePermission,
} from "@/modules/identity/server/authorize-permission";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { getCurrentAccessResolution } from "@/modules/identity/server/current-access";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import {
  OperationalOrderDecisionError,
  OperationalOrderExceptionError,
  OperationalOrderLifecycleError,
  OperationalOrderProductionControlError,
  OperationalOrderReadError,
  isOperationalOrderDecisionError,
  isOperationalOrderExceptionError,
  isOperationalOrderLifecycleError,
  isOperationalOrderProductionControlError,
  isOperationalOrderReadError,
} from "./errors";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
} as const;

export const MAX_OPERATIONAL_ORDER_DECISION_BODY_BYTES = 8 * 1024;
export const MAX_OPERATIONAL_ORDER_LIFECYCLE_BODY_BYTES = 4 * 1024;
export const MAX_OPERATIONAL_ORDER_EXCEPTION_BODY_BYTES = 8 * 1024;
export const MAX_OPERATIONAL_ORDER_PRODUCTION_CONTROL_BODY_BYTES = 4 * 1024;

export interface OperationalOrderApiErrorBody {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

function apiError(status: number, code: string, message: string): Response {
  return Response.json(
    { ok: false, error: { code, message } } satisfies OperationalOrderApiErrorBody,
    { status, headers: NO_STORE_HEADERS },
  );
}

export function operationalOrderApiSuccess<T>(data: T): Response {
  return Response.json({ ok: true, data }, { status: 200, headers: NO_STORE_HEADERS });
}

function assertSameOrigin(request: Request, invalidRequest: (cause?: unknown) => never): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch (error) {
    invalidRequest(error);
  }

  if (origin !== requestOrigin) invalidRequest();
}

async function readBoundedJsonObject(
  request: Request,
  maxBytes: number,
  invalidRequest: (cause?: unknown) => never,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("application/json")) {
    invalidRequest();
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number(contentLength);
    if (!Number.isFinite(bytes) || bytes < 0 || bytes > maxBytes) invalidRequest();
  }

  let text: string;
  try {
    text = await request.text();
  } catch (error) {
    invalidRequest(error);
  }

  if (new TextEncoder().encode(text).byteLength > maxBytes) invalidRequest();

  let value: unknown;
  try {
    value = JSON.parse(text) as unknown;
  } catch (error) {
    invalidRequest(error);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) invalidRequest();
  return value as Record<string, unknown>;
}

export function assertOperationalOrderDecisionSameOrigin(request: Request): void {
  assertSameOrigin(request, (cause?: unknown): never => {
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST", cause);
  });
}

export async function readOperationalOrderDecisionJson(
  request: Request,
): Promise<Record<string, unknown>> {
  return readBoundedJsonObject(
    request,
    MAX_OPERATIONAL_ORDER_DECISION_BODY_BYTES,
    (cause?: unknown): never => {
      throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST", cause);
    },
  );
}

export function assertOperationalOrderLifecycleSameOrigin(request: Request): void {
  assertSameOrigin(request, (cause?: unknown): never => {
    throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_INVALID_REQUEST", cause);
  });
}

export async function readOperationalOrderLifecycleJson(
  request: Request,
): Promise<Record<string, unknown>> {
  return readBoundedJsonObject(
    request,
    MAX_OPERATIONAL_ORDER_LIFECYCLE_BODY_BYTES,
    (cause?: unknown): never => {
      throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_INVALID_REQUEST", cause);
    },
  );
}

export function assertOperationalOrderExceptionSameOrigin(request: Request): void {
  assertSameOrigin(request, (cause?: unknown): never => {
    throw new OperationalOrderExceptionError("ORDER_EXCEPTION_INVALID_REQUEST", cause);
  });
}

export async function readOperationalOrderExceptionJson(
  request: Request,
): Promise<Record<string, unknown>> {
  return readBoundedJsonObject(
    request,
    MAX_OPERATIONAL_ORDER_EXCEPTION_BODY_BYTES,
    (cause?: unknown): never => {
      throw new OperationalOrderExceptionError("ORDER_EXCEPTION_INVALID_REQUEST", cause);
    },
  );
}

export function assertOperationalOrderProductionControlSameOrigin(request: Request): void {
  assertSameOrigin(request, (cause?: unknown): never => {
    throw new OperationalOrderProductionControlError("ORDER_CONTROL_INVALID_REQUEST", cause);
  });
}

export async function readOperationalOrderProductionControlJson(
  request: Request,
): Promise<Record<string, unknown>> {
  return readBoundedJsonObject(
    request,
    MAX_OPERATIONAL_ORDER_PRODUCTION_CONTROL_BODY_BYTES,
    (cause?: unknown): never => {
      throw new OperationalOrderProductionControlError("ORDER_CONTROL_INVALID_REQUEST", cause);
    },
  );
}

export async function authorizeOperationalOrderRouteContext(
  context: AccessContext,
): Promise<AccessContext> {
  if (!context.branchId) throw new OperationalOrderReadError("ORDER_QUEUE_FORBIDDEN");

  const decision = await authorizePermission(
    context,
    PERMISSIONS.operationsStaffAccess,
    "branch",
  );
  if (decision.status === "denied") {
    throw new OperationalOrderReadError("ORDER_QUEUE_FORBIDDEN");
  }
  if (decision.status === "unavailable") {
    throw new OperationalOrderReadError("ORDER_QUEUE_UNAVAILABLE");
  }
  return context;
}

export async function requireOperationalOrderRouteContext(): Promise<AccessContext> {
  const resolution = await getCurrentAccessResolution({ requireBranch: true });
  if (resolution.status === "unauthenticated") {
    throw new OperationalOrderReadError("ORDER_QUEUE_FORBIDDEN", "unauthenticated");
  }
  if (resolution.status === "unavailable") {
    throw new OperationalOrderReadError("ORDER_QUEUE_UNAVAILABLE");
  }
  if (resolution.status !== "resolved") {
    throw new OperationalOrderReadError("ORDER_QUEUE_FORBIDDEN");
  }
  return authorizeOperationalOrderRouteContext(resolution.context);
}

export function operationalOrderApiFailure(error: unknown): Response {
  if (isOperationalOrderProductionControlError(error)) {
    switch (error.code) {
      case "ORDER_CONTROL_INVALID_REQUEST":
        return apiError(400, error.code, "The production control request is invalid.");
      case "ORDER_CONTROL_FORBIDDEN":
        return apiError(403, error.code, "Production control access is not permitted.");
      case "ORDER_CONTROL_NOT_FOUND":
        return apiError(404, error.code, "The order was not found.");
      case "ORDER_CONTROL_CONFLICT":
        return apiError(409, error.code, "The order is no longer eligible for that production control.");
      case "ORDER_CONTROL_INVARIANT_VIOLATION":
        return apiError(500, error.code, "The production control could not be applied safely.");
      case "ORDER_CONTROL_UNAVAILABLE":
        return apiError(503, error.code, "Production controls are temporarily unavailable.");
    }
  }

  if (isOperationalOrderExceptionError(error)) {
    switch (error.code) {
      case "ORDER_EXCEPTION_INVALID_REQUEST":
        return apiError(400, error.code, "The order exception request is invalid.");
      case "ORDER_EXCEPTION_FORBIDDEN":
        return apiError(403, error.code, "Order exception access is not permitted.");
      case "ORDER_EXCEPTION_NOT_FOUND":
        return apiError(404, error.code, "The order or selected order item was not found.");
      case "ORDER_EXCEPTION_CONFLICT":
        return apiError(409, error.code, "The order is no longer eligible for that exception action.");
      case "ORDER_EXCEPTION_INVARIANT_VIOLATION":
        return apiError(500, error.code, "The order exception could not be applied safely.");
      case "ORDER_EXCEPTION_UNAVAILABLE":
        return apiError(503, error.code, "Order exception handling is temporarily unavailable.");
    }
  }

  if (isOperationalOrderLifecycleError(error)) {
    switch (error.code) {
      case "ORDER_LIFECYCLE_INVALID_REQUEST":
        return apiError(400, error.code, "The order lifecycle request is invalid.");
      case "ORDER_LIFECYCLE_FORBIDDEN":
        return apiError(403, error.code, "Order lifecycle access is not permitted.");
      case "ORDER_LIFECYCLE_NOT_FOUND":
        return apiError(404, error.code, "The order was not found.");
      case "ORDER_LIFECYCLE_CONFLICT":
        return apiError(409, error.code, "The order is no longer eligible for that lifecycle action.");
      case "ORDER_LIFECYCLE_INVARIANT_VIOLATION":
      case "ORDER_LIFECYCLE_UNAVAILABLE":
        return apiError(503, "ORDER_LIFECYCLE_UNAVAILABLE", "Order lifecycle is temporarily unavailable.");
    }
  }

  if (isOperationalOrderDecisionError(error)) {
    switch (error.code) {
      case "ORDER_DECISION_INVALID_REQUEST":
        return apiError(400, error.code, "The order decision request is invalid.");
      case "ORDER_DECISION_FORBIDDEN":
        return apiError(403, error.code, "Order decision access is not permitted.");
      case "ORDER_DECISION_NOT_FOUND":
        return apiError(404, error.code, "The order was not found.");
      case "ORDER_DECISION_CONFLICT":
        return apiError(409, error.code, "The order was already decided or is no longer eligible.");
      case "ORDER_DECISION_INVARIANT_VIOLATION":
      case "ORDER_DECISION_UNAVAILABLE":
        return apiError(503, "ORDER_DECISION_UNAVAILABLE", "Order decision is temporarily unavailable.");
    }
  }

  if (error instanceof AuthorizationDeniedError) {
    return apiError(403, "ORDER_QUEUE_FORBIDDEN", "Order access is not permitted.");
  }
  if (error instanceof AuthorizationUnavailableError) {
    return apiError(503, "ORDER_QUEUE_UNAVAILABLE", "Order access is temporarily unavailable.");
  }
  if (isOperationalOrderReadError(error)) {
    switch (error.code) {
      case "ORDER_QUEUE_INVALID_QUERY":
        return apiError(400, error.code, "The order query is invalid.");
      case "ORDER_QUEUE_NOT_FOUND":
        return apiError(404, error.code, "The order was not found.");
      case "ORDER_QUEUE_FORBIDDEN": {
        const unauthenticated = error.cause === "unauthenticated";
        return apiError(
          unauthenticated ? 401 : 403,
          error.code,
          unauthenticated ? "Authentication is required." : "Order access is not permitted.",
        );
      }
      case "ORDER_QUEUE_UNAVAILABLE":
      case "ORDER_QUEUE_INVARIANT_VIOLATION":
        return apiError(503, "ORDER_QUEUE_UNAVAILABLE", "Order data is temporarily unavailable.");
    }
  }
  return apiError(503, "ORDER_QUEUE_UNAVAILABLE", "Order data is temporarily unavailable.");
}
