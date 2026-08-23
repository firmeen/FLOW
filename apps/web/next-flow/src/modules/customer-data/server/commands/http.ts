import "server-only";

import { CustomerCommandError, toCustomerCommandError } from "./errors";

const MAX_COMMAND_BODY_BYTES = 16 * 1024;

const HTTP_STATUS_BY_CODE = {
  CUSTOMER_COMMAND_INVALID_INPUT: 400,
  CUSTOMER_COMMAND_CONTEXT_REQUIRED: 401,
  CUSTOMER_COMMAND_CONTEXT_REVOKED: 401,
  CUSTOMER_COMMAND_NOT_FOUND: 404,
  CUSTOMER_COMMAND_CONFLICT: 409,
  CUSTOMER_COMMAND_CART_NOT_EDITABLE: 409,
  CUSTOMER_COMMAND_CART_EMPTY: 409,
  CUSTOMER_COMMAND_ITEM_UNAVAILABLE: 409,
  CUSTOMER_COMMAND_UNAVAILABLE: 503,
} as const;

export function assertCustomerCommandSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch (error) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT", error);
  }

  if (origin !== requestOrigin) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
}

export async function readCustomerCommandJson(
  request: Request,
  allowedKeys: readonly string[],
): Promise<Record<string, unknown>> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number(contentLength);
    if (!Number.isFinite(bytes) || bytes < 0 || bytes > MAX_COMMAND_BODY_BYTES) {
      throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
    }
  }

  let value: unknown;
  try {
    value = await request.json();
  } catch (error) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT", error);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }

  const body = value as Record<string, unknown>;
  const allowed = new Set(allowedKeys);
  if (Object.keys(body).some((key) => !allowed.has(key))) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_INVALID_INPUT");
  }
  return body;
}

export function customerCommandSuccess<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status });
}

export function customerCommandFailure(error: unknown): Response {
  const mapped = toCustomerCommandError(error);
  return Response.json(
    { ok: false, error: { code: mapped.code } },
    { status: HTTP_STATUS_BY_CODE[mapped.code] },
  );
}
