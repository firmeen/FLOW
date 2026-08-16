import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import {
  acceptOrder,
  addCartItem,
  markKitchenTicketReady,
  markOrderServed,
  recordPayment,
  requestService,
  startKitchenTicket,
  submitOrder,
} from "@/services/repositories";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

describe("FoodFlow core workflow", () => {
  it("runs the non-UI golden path from cart through payment", () => {
    let state = createDemoState(referenceDate);
    state = addCartItem(state, "table-t06", {
      menuItemId: "menu-uji-matcha",
      quantity: 1,
      modifiers: [
        {
          modifierGroupId: "modifier-milk",
          modifierChoiceId: "choice-milk-oat",
        },
      ],
      specialRequest: "  less sweet  ",
    });

    const submitted = submitOrder(state, {
      tableId: "table-t06",
      submissionKey: "golden-path-order",
      items: state.carts["table-t06"]!.items.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
        modifiers: line.modifiers,
        specialRequest: line.specialRequest,
      })),
    });
    state = submitted.state;
    const orderId = submitted.value.orderId;
    expect(state.orders.find((order) => order.id === orderId)?.status).toBe(
      "PENDING_CONFIRMATION",
    );
    expect(state.carts["table-t06"]).toBeUndefined();

    state = acceptOrder(state, orderId);
    const ticket = state.kitchenTickets.find((candidate) => candidate.orderId === orderId)!;
    expect(ticket.items[0].specialRequest).toBe("less sweet");

    state = startKitchenTicket(state, ticket.id);
    expect(state.orders.find((order) => order.id === orderId)?.status).toBe(
      "PREPARING",
    );

    state = markKitchenTicketReady(state, ticket.id);
    expect(state.orders.find((order) => order.id === orderId)?.status).toBe("READY");

    state = markOrderServed(state, orderId);
    expect(state.orders.find((order) => order.id === orderId)?.status).toBe("SERVED");

    const billRequest = requestService(state, "table-t06", "REQUEST_BILL");
    state = billRequest.state;
    const order = state.orders.find((candidate) => candidate.id === orderId)!;
    expect(order.status).toBe("PAYMENT_PENDING");

    const payment = recordPayment(state, {
      tableSessionId: order.tableSessionId,
      method: "CASH",
      serviceChargeEnabled: false,
      vatEnabled: false,
      recordedBy: "staff-cashier",
    });
    state = payment.state;

    expect(state.orders.find((candidate) => candidate.id === orderId)?.status).toBe(
      "PAID",
    );
    expect(
      state.tableSessions.find((session) => session.id === order.tableSessionId)?.status,
    ).toBe("CLOSED");
    expect(state.tables.find((table) => table.id === "table-t06")?.status).toBe(
      "AVAILABLE",
    );
    expect(
      state.serviceRequests.find(
        (request) => request.id === billRequest.value.requestId,
      )?.status,
    ).toBe("RESOLVED");
    expect(state.payments.find((candidate) => candidate.id === payment.value.paymentId)).toMatchObject({
      status: "RECORDED",
      method: "CASH",
    });
  });

  it("preserves the draft cart and creates no order when final validation fails", () => {
    let state = createDemoState(referenceDate);
    state = addCartItem(state, "table-t06", {
      menuItemId: "menu-uji-matcha",
      quantity: 1,
      modifiers: [],
    });
    const initialOrderCount = state.orders.length;
    const initialSessionCount = state.tableSessions.length;

    expect(() =>
      submitOrder(state, {
        tableId: "table-t06",
        submissionKey: "failure-path-order",
        items: state.carts["table-t06"]!.items.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          modifiers: line.modifiers,
          specialRequest: line.specialRequest,
        })),
      }),
    ).toThrow();

    expect(state.orders).toHaveLength(initialOrderCount);
    expect(state.tableSessions).toHaveLength(initialSessionCount);
    expect(state.carts["table-t06"]?.items).toHaveLength(1);
  });
});
