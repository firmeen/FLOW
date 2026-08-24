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
  OperationalOrderReadError,
  isOperationalOrderDecisionError,
  isOperationalOrderReadError,
} from "./errors";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
} as const;

export const MAX_OPERATIONAL_ORDER_DECISION_BODY_BYTES = 8 * 1024;

export interface OperationalOrderApiErrorBody {
  readonly ok: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
  };
}

function apiError(
  status: number,
  code: string,
  message: string,
): Response {
  return Response.json(
    { ok: false, error: { code, message } } satisfies OperationalOrderApiErrorBody,
    { status, headers: NO_STORE_HEADERS },
  );
}

export function operationalOrderApiSuccess<T>(data: T): Response {
  return Response.json(
    { ok: true, data },
    { status: 200, headers: NO_STORE_HEADERS },
  );
}

export function assertOperationalOrderDecisionSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch (error) {
    throw new OperationalOrderReadError("ORDER_QUEUE_INVALID_QUERY", error);
  }

  if (origin !== requestOrigin) {
    const { OperationalOrderDecisionError } = requireDecisionErrorClass();
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST");
  }
}

function requireDecisionErrorClass(): typeof import("./errors") {
  // Kept as a tiny indirection so read-only route initialization remains unchanged.
  // This module is server-only and the import is resolved synchronously by the bundler.
  return require("./errors") as typeof import("./errors");
}

export async function readOperationalOrderDecisionJson(
  request: Request,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("application/json")) {
    const { OperationalOrderDecisionError } = requireDecisionErrorClass();
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number(contentLength);
    if (
      !Number.isFinite(bytes) ||
      bytes < 0 ||
      bytes > MAX_OPERATIONAL_ORDER_DECISION_BODY_BYTES
    ) {
      const { OperationalOrderDecisionError } = requireDecisionErrorClass();
      throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST");
    }
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch (error) {
    const { OperationalOrderDecisionError } = requireDecisionErrorClass();
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST", error);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const { OperationalOrderDecisionError } = requireDecisionErrorClass();
    throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST");
  }

  return value as Record<string, unknown>;
}

export async function authorizeOperationalOrderRouteContext(
  context: AccessContext,
): Promise<AccessContext> {
  if (!context.branchId) {
    throw new OperationalOrderReadError("ORDER_QUEUE_FORBIDDEN");
  }

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
