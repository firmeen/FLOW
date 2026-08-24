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
  isOperationalOrderReadError,
} from "./errors";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
} as const;

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
