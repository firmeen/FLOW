import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "kysely";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import type {
  CashierBill,
  CashierBillOrder,
  CashierSnapshot,
  MerchantDiscountType,
  MerchantPaymentMethod,
  MerchantPaymentView,
  RecordMerchantPaymentInput,
} from "../types";
import { PaymentOperationError } from "./errors";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAYMENT_METHODS = new Set<MerchantPaymentMethod>(["CASH", "THAI_QR", "CARD_TERMINAL", "BANK_TRANSFER", "OTHER"]);
const DISCOUNT_TYPES = new Set<MerchantDiscountType>(["NONE", "FIXED", "PERCENT"]);
const BILLABLE_ORDER_STATUSES = ["ACCEPTED", "PREPARING", "READY", "SERVED", "PAYMENT_PENDING"] as const;
const ACTIVE_SESSION_STATUSES = ["ACTIVE", "BILL_REQUESTED", "PAYMENT_PENDING"] as const;
const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function asMinor(value: string | number | bigint): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new PaymentOperationError("PAYMENT_UNAVAILABLE");
  return parsed;
}

function postgresCode(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 6; depth += 1) {
    if (!current || typeof current !== "object") return null;
    const candidate = current as { readonly code?: unknown; readonly cause?: unknown };
    if (typeof candidate.code === "string") return candidate.code;
    current = candidate.cause;
  }
  return null;
}

function validUuid(value: string): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  return normalized;
}

function normalizeMethod(value: unknown): MerchantPaymentMethod {
  if (typeof value !== "string" || !PAYMENT_METHODS.has(value as MerchantPaymentMethod)) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }
  return value as MerchantPaymentMethod;
}

function normalizeDiscountType(value: unknown): MerchantDiscountType {
  if (typeof value !== "string" || !DISCOUNT_TYPES.has(value as MerchantDiscountType)) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }
  return value as MerchantDiscountType;
}

function normalizeReason(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  const reason = value.trim();
  if (!reason || reason.length > 240) throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  return reason;
}

function mapPayment(row: {
  id: string;
  reference: string;
  tableLabel: string;
  tableSessionId: string;
  status: string;
  method: string;
  currency: string;
  subtotalMinor: string | number | bigint;
  discountAmountMinor: string | number | bigint;
  serviceChargeAmountMinor: string | number | bigint;
  vatAmountMinor: string | number | bigint;
  totalMinor: string | number | bigint;
  recordedAt: Date | string;
  voidedAt: Date | string | null;
  voidReason: string | null;
}): MerchantPaymentView {
  return Object.freeze({
    id: row.id,
    reference: row.reference,
    tableLabel: row.tableLabel,
    tableSessionId: row.tableSessionId,
    status: row.status === "VOIDED" ? "VOIDED" : "RECORDED",
    method: row.method as MerchantPaymentMethod,
    currency: row.currency,
    subtotalMinor: asMinor(row.subtotalMinor),
    discountAmountMinor: asMinor(row.discountAmountMinor),
    serviceChargeAmountMinor: asMinor(row.serviceChargeAmountMinor),
    vatAmountMinor: asMinor(row.vatAmountMinor),
    totalMinor: asMinor(row.totalMinor),
    recordedAt: iso(row.recordedAt) ?? new Date(0).toISOString(),
    voidedAt: iso(row.voidedAt),
    voidReason: row.voidReason,
  });
}

export async function loadCashierSnapshot(): Promise<CashierSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.merchantPaymentView,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new PaymentOperationError("PAYMENT_FORBIDDEN");

        const settings = await trx
          .selectFrom("app.branch_settings")
          .select(["currency", "service_charge_enabled", "service_charge_bps", "vat_enabled", "vat_bps"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .executeTakeFirst();
        if (!settings) throw new PaymentOperationError("PAYMENT_UNAVAILABLE");

        const rows = await trx
          .selectFrom("foodflow.table_sessions as session")
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join.onRef("table.tenant_id", "=", "session.tenant_id").onRef("table.id", "=", "session.table_id"),
          )
          .innerJoin("foodflow.orders as order", (join) =>
            join.onRef("order.tenant_id", "=", "session.tenant_id").onRef("order.table_session_id", "=", "session.id"),
          )
          .select([
            "session.id as tableSessionId",
            "session.table_id as tableId",
            "session.session_number as sessionNumber",
            "session.status as sessionStatus",
            "session.opened_at as openedAt",
            "table.label as tableLabel",
            "order.id as orderId",
            "order.order_number as orderNumber",
            "order.status as orderStatus",
            "order.subtotal_minor as orderSubtotalMinor",
            "order.currency as currency",
          ])
          .where("session.tenant_id", "=", context.tenantId)
          .where("session.branch_id", "=", context.branchId)
          .where("session.status", "in", ACTIVE_SESSION_STATUSES)
          .where("order.status", "in", BILLABLE_ORDER_STATUSES)
          .orderBy("session.opened_at", "asc")
          .orderBy("order.submitted_at", "asc")
          .execute();

        const requestedRows = await trx
          .selectFrom("foodflow.service_requests")
          .select("table_session_id")
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("type", "=", "REQUEST_BILL")
          .where("status", "in", ["OPEN", "ACKNOWLEDGED"])
          .execute();
        const requestedSessions = new Set(requestedRows.map((row) => row.table_session_id));

        const grouped = new Map<string, {
          tableId: string;
          tableLabel: string;
          sessionNumber: string;
          sessionStatus: string;
          openedAt: string;
          currency: string;
          orders: CashierBillOrder[];
        }>();
        for (const row of rows) {
          const current = grouped.get(row.tableSessionId) ?? {
            tableId: row.tableId,
            tableLabel: row.tableLabel,
            sessionNumber: row.sessionNumber,
            sessionStatus: row.sessionStatus,
            openedAt: iso(row.openedAt) ?? new Date(0).toISOString(),
            currency: row.currency,
            orders: [],
          };
          current.orders.push(Object.freeze({
            id: row.orderId,
            orderNumber: row.orderNumber,
            status: row.orderStatus,
            subtotalMinor: asMinor(row.orderSubtotalMinor),
          }));
          grouped.set(row.tableSessionId, current);
        }

        const bills: CashierBill[] = Array.from(grouped.entries()).map(([tableSessionId, bill]) => Object.freeze({
          tableSessionId,
          tableId: bill.tableId,
          tableLabel: bill.tableLabel,
          sessionNumber: bill.sessionNumber,
          sessionStatus: bill.sessionStatus,
          openedAt: bill.openedAt,
          billRequested: requestedSessions.has(tableSessionId),
          subtotalMinor: bill.orders.reduce((sum, order) => sum + order.subtotalMinor, 0),
          currency: bill.currency,
          orders: Object.freeze(bill.orders),
        }));

        bills.sort((left, right) => Number(right.billRequested) - Number(left.billRequested) || left.openedAt.localeCompare(right.openedAt));

        const paymentRows = await trx
          .selectFrom("payments.payments as payment")
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join.onRef("table.tenant_id", "=", "payment.tenant_id").onRef("table.id", "=", "payment.table_id"),
          )
          .select([
            "payment.id as id",
            "payment.reference as reference",
            "table.label as tableLabel",
            "payment.table_session_id as tableSessionId",
            "payment.status as status",
            "payment.method as method",
            "payment.currency as currency",
            "payment.subtotal_minor as subtotalMinor",
            "payment.discount_amount_minor as discountAmountMinor",
            "payment.service_charge_amount_minor as serviceChargeAmountMinor",
            "payment.vat_amount_minor as vatAmountMinor",
            "payment.total_minor as totalMinor",
            "payment.recorded_at as recordedAt",
            "payment.voided_at as voidedAt",
            "payment.void_reason as voidReason",
          ])
          .where("payment.tenant_id", "=", context.tenantId)
          .where("payment.branch_id", "=", context.branchId)
          .orderBy("payment.recorded_at", "desc")
          .limit(80)
          .execute();

        return Object.freeze({
          generatedAt: new Date().toISOString(),
          branchSettings: Object.freeze({
            currency: settings.currency,
            serviceChargeEnabled: settings.service_charge_enabled,
            serviceChargeBps: settings.service_charge_bps,
            vatEnabled: settings.vat_enabled,
            vatBps: settings.vat_bps,
          }),
          bills: Object.freeze(bills),
          payments: Object.freeze(paymentRows.map(mapPayment)),
        });
      },
    );
  } catch (error) {
    if (error instanceof PaymentOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new PaymentOperationError("PAYMENT_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
    throw new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
  }
}

function calculate(input: {
  subtotalMinor: number;
  discountType: MerchantDiscountType;
  discountValueMinor: number | null;
  discountBps: number | null;
  serviceChargeEnabled: boolean;
  serviceChargeBps: number;
  vatEnabled: boolean;
  vatBps: number;
}) {
  const discountAmountMinor = input.discountType === "FIXED"
    ? Math.min(input.subtotalMinor, input.discountValueMinor ?? 0)
    : input.discountType === "PERCENT"
      ? Math.round(input.subtotalMinor * (input.discountBps ?? 0) / 10000)
      : 0;
  const afterDiscount = Math.max(0, input.subtotalMinor - discountAmountMinor);
  const serviceChargeAmountMinor = input.serviceChargeEnabled
    ? Math.round(afterDiscount * input.serviceChargeBps / 10000)
    : 0;
  const vatBase = afterDiscount + serviceChargeAmountMinor;
  const vatAmountMinor = input.vatEnabled ? Math.round(vatBase * input.vatBps / 10000) : 0;
  return {
    discountAmountMinor,
    serviceChargeAmountMinor,
    vatAmountMinor,
    totalMinor: vatBase + vatAmountMinor,
  };
}

export async function recordMerchantPayment(raw: RecordMerchantPaymentInput): Promise<MerchantPaymentView> {
  const tableSessionId = validUuid(raw.tableSessionId);
  const method = normalizeMethod(raw.method);
  const discountType = normalizeDiscountType(raw.discountType);
  const discountValueMinor = raw.discountValueMinor ?? null;
  const discountBps = raw.discountBps ?? null;
  const discountReason = normalizeReason(raw.discountReason);
  if (discountType === "FIXED" && (!Number.isSafeInteger(discountValueMinor) || (discountValueMinor ?? -1) < 0)) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }
  if (discountType === "PERCENT" && (!Number.isInteger(discountBps) || (discountBps ?? -1) < 0 || (discountBps ?? 10001) > 10000)) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }
  if (discountType === "NONE" && (discountValueMinor !== null || discountBps !== null)) {
    throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.merchantPaymentCollect,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new PaymentOperationError("PAYMENT_FORBIDDEN");
        let session: { id: string; table_id: string; status: string } | undefined;
        try {
          const locked = await sql<{ id: string; table_id: string; status: string }>`
            select id, table_id, status
            from foodflow.table_sessions
            where tenant_id = ${context.tenantId}::uuid
              and branch_id = ${context.branchId}::uuid
              and id = ${tableSessionId}::uuid
            for update nowait
          `.execute(trx);
          session = locked.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) throw new PaymentOperationError("PAYMENT_CONFLICT", error);
          throw error;
        }
        if (!session || !ACTIVE_SESSION_STATUSES.includes(session.status as (typeof ACTIVE_SESSION_STATUSES)[number])) {
          throw new PaymentOperationError("PAYMENT_NOT_FOUND");
        }

        const existing = await trx
          .selectFrom("payments.payments")
          .select("id")
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("table_session_id", "=", tableSessionId)
          .where("status", "=", "RECORDED")
          .executeTakeFirst();
        if (existing) throw new PaymentOperationError("PAYMENT_CONFLICT");

        const branch = await trx
          .selectFrom("app.branches")
          .select("restaurant_id")
          .where("tenant_id", "=", context.tenantId)
          .where("id", "=", context.branchId)
          .executeTakeFirstOrThrow();
        const settings = await trx
          .selectFrom("app.branch_settings")
          .select(["currency", "service_charge_enabled", "service_charge_bps", "vat_enabled", "vat_bps"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .executeTakeFirstOrThrow();
        const orders = await trx
          .selectFrom("foodflow.orders")
          .select(["id", "order_number", "status", "subtotal_minor"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("table_session_id", "=", tableSessionId)
          .where("status", "in", BILLABLE_ORDER_STATUSES)
          .orderBy("submitted_at", "asc")
          .execute();
        if (orders.length === 0) throw new PaymentOperationError("PAYMENT_EMPTY_BILL");

        const subtotalMinor = orders.reduce((sum, order) => sum + asMinor(order.subtotal_minor), 0);
        const serviceChargeEnabled = raw.serviceChargeEnabled ?? settings.service_charge_enabled;
        const vatEnabled = raw.vatEnabled ?? settings.vat_enabled;
        const totals = calculate({
          subtotalMinor,
          discountType,
          discountValueMinor,
          discountBps,
          serviceChargeEnabled,
          serviceChargeBps: settings.service_charge_bps,
          vatEnabled,
          vatBps: settings.vat_bps,
        });
        const now = new Date();
        const reference = `PAY-${now.getTime().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
        const payment = await trx
          .insertInto("payments.payments")
          .values({
            tenant_id: context.tenantId,
            restaurant_id: branch.restaurant_id,
            branch_id: context.branchId,
            table_id: session.table_id,
            table_session_id: tableSessionId,
            reference,
            method,
            status: "RECORDED",
            currency: settings.currency,
            subtotal_minor: subtotalMinor,
            discount_type: discountType,
            discount_value_minor: discountType === "FIXED" ? discountValueMinor : null,
            discount_bps: discountType === "PERCENT" ? discountBps : null,
            discount_amount_minor: totals.discountAmountMinor,
            discount_reason: discountReason,
            service_charge_enabled: serviceChargeEnabled,
            service_charge_bps: settings.service_charge_bps,
            service_charge_amount_minor: totals.serviceChargeAmountMinor,
            vat_enabled: vatEnabled,
            vat_bps: settings.vat_bps,
            vat_amount_minor: totals.vatAmountMinor,
            total_minor: totals.totalMinor,
            recorded_at: now,
            recorded_by: context.actorId,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        let allocated = 0;
        for (const [index, order] of orders.entries()) {
          const orderSubtotal = asMinor(order.subtotal_minor);
          const amount = index === orders.length - 1
            ? totals.totalMinor - allocated
            : Math.round(totals.totalMinor * orderSubtotal / subtotalMinor);
          allocated += amount;
          await trx.insertInto("payments.payment_allocations").values({
            tenant_id: context.tenantId,
            payment_id: payment.id,
            order_id: order.id,
            allocated_amount_minor: amount,
          }).execute();
        }

        const orderIds = orders.map((order) => order.id);
        await trx
          .updateTable("foodflow.orders")
          .set({ status: "PAID", paid_at: now, updated_at: now })
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("id", "in", orderIds)
          .execute();
        await trx
          .updateTable("foodflow.table_sessions")
          .set({ status: "CLOSED", closed_at: now, updated_at: now })
          .where("id", "=", tableSessionId)
          .execute();
        await trx
          .updateTable("foodflow.service_requests")
          .set({ status: "RESOLVED", resolved_at: now, resolved_by: context.actorId })
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("table_session_id", "=", tableSessionId)
          .where("type", "=", "REQUEST_BILL")
          .where("status", "in", ["OPEN", "ACKNOWLEDGED"])
          .execute();
        await trx.insertInto("payments.payment_events").values({
          tenant_id: context.tenantId,
          payment_id: payment.id,
          event_type: "PAYMENT_RECORDED",
          actor_id: context.actorId,
          occurred_at: now,
          reason: discountReason,
          metadata: JSON.stringify({ method, reference, totalMinor: totals.totalMinor }),
        }).execute();
        for (const order of orders) {
          await trx.insertInto("foodflow.order_events").values({
            tenant_id: context.tenantId,
            branch_id: context.branchId,
            order_id: order.id,
            event_type: "ORDER_PAID",
            from_status: order.status,
            to_status: "PAID",
            actor_id: context.actorId,
            occurred_at: now,
            reason: reference,
          }).execute();
        }

        const row = await trx
          .selectFrom("payments.payments as recorded")
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join.onRef("table.tenant_id", "=", "recorded.tenant_id").onRef("table.id", "=", "recorded.table_id"),
          )
          .select([
            "recorded.id as id", "recorded.reference as reference", "table.label as tableLabel",
            "recorded.table_session_id as tableSessionId", "recorded.status as status", "recorded.method as method",
            "recorded.currency as currency", "recorded.subtotal_minor as subtotalMinor",
            "recorded.discount_amount_minor as discountAmountMinor", "recorded.service_charge_amount_minor as serviceChargeAmountMinor",
            "recorded.vat_amount_minor as vatAmountMinor", "recorded.total_minor as totalMinor",
            "recorded.recorded_at as recordedAt", "recorded.voided_at as voidedAt", "recorded.void_reason as voidReason",
          ])
          .where("recorded.id", "=", payment.id)
          .executeTakeFirstOrThrow();
        return mapPayment(row);
      },
    );
  } catch (error) {
    if (error instanceof PaymentOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new PaymentOperationError("PAYMENT_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
    throw new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
  }
}

export async function voidMerchantPayment(rawPaymentId: string, rawReason: unknown): Promise<void> {
  const paymentId = validUuid(rawPaymentId);
  const reason = normalizeReason(rawReason);
  if (!reason) throw new PaymentOperationError("PAYMENT_INVALID_REQUEST");

  try {
    await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.merchantPaymentVoid,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new PaymentOperationError("PAYMENT_FORBIDDEN");
        let payment: { id: string; status: string; table_session_id: string; reference: string } | undefined;
        try {
          const locked = await sql<{ id: string; status: string; table_session_id: string; reference: string }>`
            select id, status, table_session_id, reference
            from payments.payments
            where tenant_id = ${context.tenantId}::uuid
              and branch_id = ${context.branchId}::uuid
              and id = ${paymentId}::uuid
            for update nowait
          `.execute(trx);
          payment = locked.rows[0];
        } catch (error) {
          if (postgresCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) throw new PaymentOperationError("PAYMENT_CONFLICT", error);
          throw error;
        }
        if (!payment) throw new PaymentOperationError("PAYMENT_NOT_FOUND");
        if (payment.status !== "RECORDED") throw new PaymentOperationError("PAYMENT_CONFLICT");

        const allocations = await trx
          .selectFrom("payments.payment_allocations")
          .select("order_id")
          .where("tenant_id", "=", context.tenantId)
          .where("payment_id", "=", paymentId)
          .execute();
        const orderIds = allocations.map((allocation) => allocation.order_id);
        const now = new Date();

        await trx.updateTable("payments.payments").set({
          status: "VOIDED",
          voided_at: now,
          voided_by: context.actorId,
          void_reason: reason,
        }).where("id", "=", paymentId).execute();
        if (orderIds.length) {
          await trx.updateTable("foodflow.orders").set({ status: "PAYMENT_PENDING", paid_at: null, updated_at: now })
            .where("tenant_id", "=", context.tenantId)
            .where("branch_id", "=", context.branchId)
            .where("id", "in", orderIds)
            .where("status", "=", "PAID")
            .execute();
        }
        await trx.updateTable("foodflow.table_sessions").set({ status: "PAYMENT_PENDING", closed_at: null, updated_at: now })
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("id", "=", payment.table_session_id)
          .execute();
        await trx.insertInto("payments.payment_events").values({
          tenant_id: context.tenantId,
          payment_id: paymentId,
          event_type: "PAYMENT_VOIDED",
          actor_id: context.actorId,
          occurred_at: now,
          reason,
          metadata: JSON.stringify({ reference: payment.reference }),
        }).execute();
      },
    );
  } catch (error) {
    if (error instanceof PaymentOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new PaymentOperationError("PAYMENT_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
    throw new PaymentOperationError("PAYMENT_UNAVAILABLE", error);
  }
}
