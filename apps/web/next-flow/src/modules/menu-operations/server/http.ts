import "server-only";

import { MenuOperationError, toMenuOperationError } from "./errors";
import { parseStaffMenuAvailability } from "./service";

const STATUS_BY_CODE = {
  MENU_INVALID_REQUEST: 400,
  MENU_FORBIDDEN: 403,
  MENU_NOT_FOUND: 404,
  MENU_CONFLICT: 409,
  MENU_UNAVAILABLE: 503,
} as const;

export async function readMenuAvailabilityRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new MenuOperationError("MENU_INVALID_REQUEST");
  let value: unknown;
  try { value = await request.json(); } catch (error) { throw new MenuOperationError("MENU_INVALID_REQUEST", error); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new MenuOperationError("MENU_INVALID_REQUEST");
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => key !== "status")) throw new MenuOperationError("MENU_INVALID_REQUEST");
  return parseStaffMenuAvailability(body.status);
}

export function menuSuccess<T>(data: T): Response {
  return Response.json({ ok: true, data }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

export function menuFailure(error: unknown): Response {
  const mapped = toMenuOperationError(error);
  return Response.json({ ok: false, error: { code: mapped.code } }, { status: STATUS_BY_CODE[mapped.code], headers: { "Cache-Control": "no-store" } });
}
