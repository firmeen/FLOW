import "server-only";

import type { DurableKitchenAction } from "../types";
import { KitchenOperationError, toKitchenOperationError } from "./errors";

const ACTIONS = new Set<DurableKitchenAction>(["START_PREPARING", "MARK_READY", "MARK_SERVED"]);
const STATUS_BY_CODE = {
  KITCHEN_INVALID_REQUEST: 400,
  KITCHEN_FORBIDDEN: 403,
  KITCHEN_NOT_FOUND: 404,
  KITCHEN_CONFLICT: 409,
  KITCHEN_UNAVAILABLE: 503,
} as const;

export function parseKitchenAction(value: unknown): DurableKitchenAction {
  if (typeof value !== "string" || !ACTIONS.has(value as DurableKitchenAction)) {
    throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");
  }
  return value as DurableKitchenAction;
}

export async function readKitchenAction(request: Request): Promise<DurableKitchenAction> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(length) || length > 4096) {
    throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    throw new KitchenOperationError("KITCHEN_INVALID_REQUEST", error);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");
  }
  const record = body as Record<string, unknown>;
  if (Object.keys(record).some((key) => key !== "action")) {
    throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");
  }
  return parseKitchenAction(record.action);
}

export function kitchenSuccess<T>(data: T): Response {
  return Response.json({ ok: true, data }, { status: 200, headers: { "Cache-Control": "no-store" } });
}

export function kitchenFailure(error: unknown): Response {
  const mapped = toKitchenOperationError(error);
  return Response.json(
    { ok: false, error: { code: mapped.code } },
    { status: STATUS_BY_CODE[mapped.code], headers: { "Cache-Control": "no-store" } },
  );
}
