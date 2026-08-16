import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import { markKitchenTicketReady, markOrderServed, startKitchenTicket } from "@/services/repositories/kitchen-repository";
import { acceptOrder, submitOrder } from "@/services/repositories/order-repository";
import { calculateBill } from "@/services/repositories/payment-calculation";
import { recordPayment, voidPayment } from "@/services/repositories/payment-repository";
import { requestService } from "@/services/repositories/service-repository";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

const servedSessionState = () => {
  const submitted = submitOrder(createDemoState(referenceDate), {
    tableId: "table-t06",
    submissionKey: "payment-order",
    items: [{ menuItemId: "menu-yuzu", quantity: 2 }],
  });
  const accepted = acceptOrder(submitted.state, submitted.value.orderId);
  const ticket = accepted.kitchenTickets.find(
    (candidate) => candidate.orderId === submitted.value.orderId,
  )!;
  const preparing = startKitchenTicket(accepted, ticket.id);
  const ready = markKitchenTicketReady(preparing, ticket.id);
  const served = markOrderServed(ready, submitted.value.orderId);
  const order = served.orders.find(
    (candidate) => candidate.id === submitted.value.orderId,
  )!;
  return { state: served, order, sessionId: order.tableSessionId };
};

describe("bill calculation", () => {
  it("calculates subtotal, fixed discount, service charge, VAT, rounding, and total canonically", () => {
    const { state, sessionId } = servedSessionState();
    const session = state.tableSessions.find((candidate) => candidate.id === sessionId)!;
    const bill = calculateBill({
      session,
      orders: state.orders,
      discountType: "FIXED",
      discountValue: 18.55,
      serviceChargeEnabled: true,
      serviceChargePercent: 10,
      vatEnabled: true,
      vatPercent: 7,
    });

    expect(bill).toEqual({
      subtotal: 238,
      discountAmount: 18.55,
      discountedSubtotal: 219.45,
      serviceChargeAmount: 21.95,
      vatAmount: 16.9,
      total: 258.3,
    });
  });

  it("supports no discount and clamps fixed/percentage discounts", () => {
    const { state, sessionId } = servedSessionState();
    const session = state.tableSessions.find((candidate) => candidate.id === sessionId)!;

    expect(
      calculateBill({
        session,
        orders: state.orders,
        serviceChargeEnabled: false,
        serviceChargePercent: 10,
        vatEnabled: false,
        vatPercent: 7,
      }).total,
    ).toBe(238);
    expect(
      calculateBill({
        session,
        orders: state.orders,
        discountType: "FIXED",
        discountValue: 999,
        serviceChargeEnabled: false,
        serviceChargePercent: 0,
        vatEnabled: false,
        vatPercent: 0,
      }).total,
    ).toBe(0);
    expect(
      calculateBill({
        session,
        orders: state.orders,
        discountType: "PERCENT",
        discountValue: 150,
        serviceChargeEnabled: false,
        serviceChargePercent: 0,
        vatEnabled: false,
        vatPercent: 0,
      }).total,
    ).toBe(0);
  });

  it("excludes non-billable order statuses", () => {
    const { state, sessionId } = servedSessionState();
    const session = state.tableSessions.find((candidate) => candidate.id === sessionId)!;
    const excludedOrders = state.orders.map((order) =>
      order.tableSessionId === sessionId
        ? { ...order, status: "CANCELLED" as const }
        : order,
    );

    expect(
      calculateBill({
        session,
        orders: excludedOrders,
        serviceChargeEnabled: false,
        serviceChargePercent: 0,
        vatEnabled: false,
        vatPercent: 0,
      }).subtotal,
    ).toBe(0);
  });
});

describe("payment repository", () => {
  it("records a payment using canonical calculation and closes the table session", () => {
    const served = servedSessionState();
    const billRequested = requestService(
      served.state,
      "table-t06",
      "REQUEST_BILL",
    );
    const result = recordPayment(billRequested.state, {
      tableSessionId: served.sessionId,
      method: "THAI_QR",
      discountType: "PERCENT",
      discountValue: 10,
      serviceChargeEnabled: true,
      serviceChargePercent: 10,
      vatEnabled: true,
      vatPercent: 7,
      recordedBy: "staff-cashier",
    });
    const payment = result.state.payments.find(
      (candidate) => candidate.id === result.value.paymentId,
    )!;
    const order = result.state.orders.find(
      (candidate) => candidate.id === served.order.id,
    )!;
    const session = result.state.tableSessions.find(
      (candidate) => candidate.id === served.sessionId,
    )!;
    const table = result.state.tables.find((candidate) => candidate.id === "table-t06")!;

    expect(payment).toMatchObject({
      method: "THAI_QR",
      status: "RECORDED",
      subtotal: 238,
      discount: { type: "PERCENT", value: 10, amount: 23.8 },
      serviceChargeAmount: 21.42,
      vatAmount: 16.49,
      total: 252.11,
    });
    expect(order.status).toBe("PAID");
    expect(session.status).toBe("CLOSED");
    expect(table.status).toBe("AVAILABLE");
    expect(table.currentSessionId).toBeUndefined();
    expect(
      result.state.auditEvents.some(
        (event) => event.action === "PAYMENT_RECORDED" && event.entityId === payment.id,
      ),
    ).toBe(true);
  });

  it("voids a recorded payment and reopens payment-pending state with an audit event", () => {
    const served = servedSessionState();
    const paid = recordPayment(served.state, {
      tableSessionId: served.sessionId,
      method: "CASH",
      recordedBy: "staff-cashier",
      serviceChargeEnabled: false,
      vatEnabled: false,
    });
    const voided = voidPayment(
      paid.state,
      paid.value.paymentId,
      "  cashier correction  ",
      "staff-cashier",
    );
    const payment = voided.payments.find(
      (candidate) => candidate.id === paid.value.paymentId,
    )!;

    expect(payment).toMatchObject({
      status: "VOIDED",
      voidReason: "cashier correction",
      voidedBy: "staff-cashier",
    });
    expect(
      voided.orders.find((candidate) => candidate.id === served.order.id)?.status,
    ).toBe("PAYMENT_PENDING");
    expect(
      voided.tableSessions.find((candidate) => candidate.id === served.sessionId)?.status,
    ).toBe("PAYMENT_PENDING");
    expect(voided.tables.find((candidate) => candidate.id === "table-t06")).toMatchObject({
      status: "PAYMENT_PENDING",
      currentSessionId: served.sessionId,
    });
    expect(
      voided.auditEvents.some(
        (event) => event.action === "PAYMENT_VOIDED" && event.entityId === payment.id,
      ),
    ).toBe(true);
  });
});
