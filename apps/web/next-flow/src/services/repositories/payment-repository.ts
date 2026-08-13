import type {
  FoodFlowState,
  Payment,
  RecordPaymentInput,
} from "@/domain";
import {
  addAudit,
  createEntityId,
  getActor,
  now,
  requireNonEmptyReason,
  requireSession,
  requireTable,
  roundCurrency,
} from "./helpers";
import type { MutationResult, RecordPaymentResult } from "./types";

export const recordPayment = (
  initialState: FoodFlowState,
  input: RecordPaymentInput,
): MutationResult<RecordPaymentResult> => {
  const session = requireSession(initialState, input.tableSessionId);
  if (session.status === "CLOSED") {
    throw new Error("This table session is already closed.");
  }
  const table = requireTable(initialState, session.tableId);
  const payableOrders = initialState.orders.filter(
    (order) =>
      order.tableSessionId === session.id &&
      !["REJECTED", "CANCELLED", "VOIDED", "DRAFT"].includes(order.status),
  );
  if (!payableOrders.length) {
    throw new Error("There are no payable orders in this session.");
  }
  const subtotal = roundCurrency(
    payableOrders.reduce((sum, order) => sum + order.subtotal, 0),
  );
  const discountType = input.discountType ?? "NONE";
  const requestedDiscount = Math.max(0, input.discountValue ?? 0);
  const discountAmount = roundCurrency(
    discountType === "FIXED"
      ? Math.min(subtotal, requestedDiscount)
      : discountType === "PERCENT"
        ? (subtotal * Math.min(requestedDiscount, 100)) / 100
        : 0,
  );
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const serviceChargeEnabled =
    input.serviceChargeEnabled ?? initialState.settings.serviceChargeEnabled;
  const serviceChargePercent = Math.max(
    0,
    input.serviceChargePercent ?? initialState.settings.serviceChargePercent,
  );
  const serviceChargeAmount = roundCurrency(
    serviceChargeEnabled
      ? (discountedSubtotal * serviceChargePercent) / 100
      : 0,
  );
  const vatEnabled = input.vatEnabled ?? initialState.settings.vatEnabled;
  const vatPercent = Math.max(
    0,
    input.vatPercent ?? initialState.settings.vatPercent,
  );
  const vatAmount = roundCurrency(
    vatEnabled
      ? ((discountedSubtotal + serviceChargeAmount) * vatPercent) / 100
      : 0,
  );
  const total = roundCurrency(
    discountedSubtotal + serviceChargeAmount + vatAmount,
  );
  const timestamp = now();
  const actor = getActor(
    initialState,
    input.recordedBy,
    "staff-cashier",
    "Cashier",
  );
  const payment: Payment = {
    id: createEntityId("payment"),
    reference: `PAY-${String(initialState.payments.length + 1).padStart(4, "0")}`,
    restaurantId: initialState.restaurant.id,
    branchId: session.branchId,
    tableId: session.tableId,
    tableSessionId: session.id,
    orderIds: payableOrders.map((order) => order.id),
    method: input.method,
    status: "RECORDED",
    currency: initialState.restaurant.currency,
    subtotal,
    discount: {
      type: discountType,
      value: requestedDiscount,
      amount: discountAmount,
      reason: input.discountReason?.trim() || undefined,
    },
    serviceChargeEnabled,
    serviceChargePercent,
    serviceChargeAmount,
    vatEnabled,
    vatPercent,
    vatAmount,
    total,
    recordedAt: timestamp,
    recordedBy: actor.id,
  };
  let state: FoodFlowState = {
    ...initialState,
    payments: [...initialState.payments, payment],
    orders: initialState.orders.map((order) =>
      payment.orderIds.includes(order.id)
        ? { ...order, status: "PAID", paidAt: timestamp }
        : order,
    ),
    tableSessions: initialState.tableSessions.map((candidate) =>
      candidate.id === session.id
        ? {
            ...candidate,
            status: "CLOSED",
            closedAt: timestamp,
            paymentIds: [...candidate.paymentIds, payment.id],
          }
        : candidate,
    ),
    tables: initialState.tables.map((candidate) =>
      candidate.id === table.id
        ? { ...candidate, status: "AVAILABLE", currentSessionId: undefined }
        : candidate,
    ),
    serviceRequests: initialState.serviceRequests.map((request) =>
      request.tableSessionId === session.id &&
      request.type === "REQUEST_BILL" &&
      request.status !== "CANCELLED"
        ? {
            ...request,
            status: "RESOLVED",
            resolvedAt: timestamp,
            resolvedBy: actor.id,
          }
        : request,
    ),
  };
  if (discountAmount > 0) {
    state = addAudit(state, {
      actorId: actor.id,
      fallbackActorId: actor.id,
      fallbackActorName: actor.name,
      action: "DISCOUNT_APPLIED",
      entityType: "PAYMENT",
      entityId: payment.id,
      summary: `Applied THB ${discountAmount.toFixed(2)} discount to ${table.label}`,
      reason: input.discountReason?.trim() || undefined,
      timestamp,
    });
  }
  state = addAudit(state, {
    actorId: actor.id,
    fallbackActorId: actor.id,
    fallbackActorName: actor.name,
    action: "PAYMENT_RECORDED",
    entityType: "PAYMENT",
    entityId: payment.id,
    summary: `Recorded ${input.method.replace(/_/g, " ")} payment of THB ${total.toFixed(2)} for ${table.label}`,
    metadata: { total, method: input.method },
    timestamp,
  });
  state = addAudit(state, {
    actorId: actor.id,
    fallbackActorId: actor.id,
    fallbackActorName: actor.name,
    action: "TABLE_CLOSED",
    entityType: "TABLE_SESSION",
    entityId: session.id,
    summary: `Closed ${table.label} session ${session.sessionNumber}`,
    timestamp,
  });
  return { state, value: { paymentId: payment.id, total } };
};

export const voidPayment = (
  initialState: FoodFlowState,
  paymentId: string,
  reason: string,
  staffId: string,
): FoodFlowState => {
  requireNonEmptyReason(reason, "Voiding a payment");
  if (!staffId.trim()) {
    throw new Error("Voiding a payment requires responsible staff.");
  }
  const payment = initialState.payments.find(
    (candidate) => candidate.id === paymentId,
  );
  if (!payment) throw new Error("Payment was not found.");
  if (payment.status === "VOIDED") return initialState;
  const session = requireSession(initialState, payment.tableSessionId);
  const table = requireTable(initialState, payment.tableId);
  if (table.currentSessionId && table.currentSessionId !== session.id) {
    throw new Error(
      "This table has a newer active session; the payment cannot be voided here.",
    );
  }
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    payments: initialState.payments.map((candidate) =>
      candidate.id === paymentId
        ? {
            ...candidate,
            status: "VOIDED",
            voidedAt: timestamp,
            voidedBy: staffId,
            voidReason: reason.trim(),
          }
        : candidate,
    ),
    orders: initialState.orders.map((order) =>
      payment.orderIds.includes(order.id)
        ? { ...order, status: "PAYMENT_PENDING", paidAt: undefined }
        : order,
    ),
    tableSessions: initialState.tableSessions.map((candidate) =>
      candidate.id === session.id
        ? { ...candidate, status: "PAYMENT_PENDING", closedAt: undefined }
        : candidate,
    ),
    tables: initialState.tables.map((candidate) =>
      candidate.id === table.id
        ? {
            ...candidate,
            status: "PAYMENT_PENDING",
            currentSessionId: session.id,
          }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId: staffId,
    fallbackActorId: staffId,
    fallbackActorName: "Responsible staff",
    action: "PAYMENT_VOIDED",
    entityType: "PAYMENT",
    entityId: payment.id,
    summary: `Voided payment ${payment.reference} for ${table.label}`,
    reason: reason.trim(),
    timestamp,
  });
};

export const paymentRepository = { recordPayment, voidPayment };
