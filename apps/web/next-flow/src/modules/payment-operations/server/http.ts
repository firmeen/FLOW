import "server-only";

import type {
  MerchantDiscountType,
  MerchantPaymentMethod,
  RecordMerchantPaymentInput,
} from "../types";
import { PaymentOperationError, toPaymentOperationError } from "./errors";

const STATUS_BY_CODE = {
  PAYMENT_INVALID_REQUEST: 400,
  PAYMENT_FORBIDDEN: 403,
  PAYMENT_NOT_FOUND: 404,
  PAYMENT_CONFLICT: 409,
  PAYMENT_EMPTY_BILL: 409,
  PAYMENT_UNAVAILABLE: 503,
} as const;

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  assertSameOrigin(request);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(length) || length > 8192) throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  let value: unknown;
  try {
    value = await request.json();
  } catch (error) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST", error);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }
  return value as Record<string, unknown>;
}

export async function readRecordPaymentRequest(request: Request): Promise<RecordMerchantPaymentInput> {
  const body = await readJson(request);
  const allowed = new Set(["tableSessionId", "method", "discountType", "discountValueMinor", "discountBps", "discountReason", "serviceChargeEnabled", "vatEnabled"]);
  if (Object.keys(body).some((key) => !allowed.has(key))) throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  return {
    tableSessionId: body.tableSessionId as string,
    method: body.method as MerchantPaymentMethod,
    discountType: body.discountType as MerchantDiscountType,
    discountValueMinor: body.discountValueMinor as number | null | undefined,
    discountBps: body.discountBps as number | null | undefined,
    discountReason: body.discountReason as string | null | undefined,
    serviceChargeEnabled: body.serviceChargeEnabled as boolean | undefined,
    vatEnabled: body.vatEnabled as boolean | undefined,
  };
}

export async function readVoidPaymentRequest(request: Request): Promise<string> {
  const body = await readJson(request);
  if (Object.keys(body).some((key) => key !== "reason")) throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  if (typeof body.reason !== "string") throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  return body.reason;
}

export function paymentSuccess<T>(data: T, status = 200): Response {
  return Response.json({ ok: true, data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function paymentFailure(error: unknown): Response {
  const mapped = toPaymentOperationError(error);
  return Response.json(
    { ok: false, error: { code: mapped.code } },
    { status: STATUS_BY_CODE[mapped.code], headers: { "Cache-Control": "no-store" } },
  );
}
