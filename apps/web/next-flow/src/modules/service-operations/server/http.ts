import "server-only";

import { ServiceOperationError, toServiceOperationError } from "./errors";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "application/json; charset=utf-8",
} as const;

const HTTP_STATUS = {
  SERVICE_REQUEST_INVALID_INPUT: 400,
  SERVICE_REQUEST_CONTEXT_REQUIRED: 401,
  SERVICE_REQUEST_CONTEXT_REVOKED: 401,
  SERVICE_REQUEST_FORBIDDEN: 403,
  SERVICE_REQUEST_NOT_FOUND: 404,
  SERVICE_REQUEST_CONFLICT: 409,
  SERVICE_REQUEST_SESSION_REQUIRED: 409,
  SERVICE_REQUEST_UNAVAILABLE: 503,
} as const;

export function serviceOperationSuccess<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status, headers: NO_STORE_HEADERS });
}

export function serviceOperationFailure(error: unknown): Response {
  const mapped = toServiceOperationError(error);
  return Response.json(
    { ok: false, error: { code: mapped.code } },
    { status: HTTP_STATUS[mapped.code], headers: NO_STORE_HEADERS },
  );
}

export function assertServiceOperationSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch (error) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT", error);
  }
  if (origin !== requestOrigin) throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
}

export async function readServiceOperationJson(
  request: Request,
  allowedKeys: readonly string[],
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("application/json")) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > 8 * 1024) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch (error) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT", error);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  }
  const body = value as Record<string, unknown>;
  const allowed = new Set(allowedKeys);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  }
  return body;
}
