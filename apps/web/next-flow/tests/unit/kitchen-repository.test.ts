import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import {
  acceptOrder,
  cancelOrder,
  submitOrder,
} from "@/services/repositories/order-repository";
import {
  markKitchenProblem,
  markKitchenTicketReady,
  markOrderServed,
  remakeKitchenTicket,
  startKitchenTicket,
} from "@/services/repositories/kitchen-repository";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

const acceptedOrderState = () => {
  const submitted = submitOrder(createDemoState(referenceDate), {
    tableId: "table-t06",
    submissionKey: "kitchen-order",
    items: [
      {
        menuItemId: "menu-uji-matcha",
        quantity: 1,
        modifiers: [
          {
            modifierGroupId: "modifier-milk",
            modifierChoiceId: "choice-milk-oat",
          },
        ],
        specialRequest: "  no syrup  ",
      },
    ],
  });
  return {
    orderId: submitted.value.orderId,
    state: acceptOrder(submitted.state, submitted.value.orderId),
  };
};

describe("kitchen repository", () => {
  it("creates a kitchen ticket on acceptance and propagates snapshots", () => {
    const { state, orderId } = acceptedOrderState();
    const ticket = state.kitchenTickets.find(
      (candidate) => candidate.orderId === orderId,
    )!;

    expect(ticket.status).toBe("NEW");
    expect(ticket.items).toHaveLength(1);
    expect(ticket.items[0]).toMatchObject({
      menuItemName: "Uji Signature Matcha",
      quantity: 1,
      modifiers: ["Milk Option: Australian Oat Milk"],
      specialRequest: "no syrup",
    });
    expect(
      state.auditEvents.some(
        (event) => event.action === "ORDER_ACCEPTED" && event.entityId === orderId,
      ),
    ).toBe(true);
  });

  it("moves NEW -> PREPARING -> READY and synchronizes order/customer status", () => {
    const { state, orderId } = acceptedOrderState();
    const ticket = state.kitchenTickets.find(
      (candidate) => candidate.orderId === orderId,
    )!;
    const preparing = startKitchenTicket(state, ticket.id);
    const ready = markKitchenTicketReady(preparing, ticket.id);
    const order = ready.orders.find((candidate) => candidate.id === orderId)!;
    const readyTicket = ready.kitchenTickets.find(
      (candidate) => candidate.id === ticket.id,
    )!;

    expect(preparing.kitchenTickets.find((candidate) => candidate.id === ticket.id)?.status).toBe(
      "PREPARING",
    );
    expect(order.status).toBe("READY");
    expect(order.customerStatus).toBe("COMING_TO_TABLE");
    expect(readyTicket.status).toBe("READY");
    expect(
      ready.auditEvents.some(
        (event) => event.action === "KITCHEN_STARTED" && event.entityId === ticket.id,
      ),
    ).toBe(true);
    expect(
      ready.auditEvents.some(
        (event) => event.action === "KITCHEN_READY" && event.entityId === ticket.id,
      ),
    ).toBe(true);
  });

  it("rejects ready-before-start and serve-before-ready transitions", () => {
    const { state, orderId } = acceptedOrderState();
    const ticket = state.kitchenTickets.find(
      (candidate) => candidate.orderId === orderId,
    )!;

    expect(() => markKitchenTicketReady(state, ticket.id)).toThrow();
    expect(() => markOrderServed(state, orderId)).toThrow();
  });

  it("supports problem and remake characterization without implementing Phase 7 routing", () => {
    const { state, orderId } = acceptedOrderState();
    const ticket = state.kitchenTickets.find(
      (candidate) => candidate.orderId === orderId,
    )!;
    const preparing = startKitchenTicket(state, ticket.id);
    const problem = markKitchenProblem(preparing, ticket.id, "  missing ingredient  ");
    const remade = remakeKitchenTicket(problem, ticket.id, "redo correctly");
    const remadeTicket = remade.kitchenTickets.find(
      (candidate) => candidate.id === ticket.id,
    )!;
    const order = remade.orders.find((candidate) => candidate.id === orderId)!;

    expect(problem.kitchenTickets.find((candidate) => candidate.id === ticket.id)).toMatchObject({
      status: "PROBLEM",
      problemNote: "missing ingredient",
    });
    expect(remadeTicket.status).toBe("REMAKE");
    expect(remadeTicket.remakeCount).toBe(ticket.remakeCount + 1);
    expect(order.status).toBe("REMAKE");
    expect(order.customerStatus).toBe("CONFIRMED");
  });

  it("marks a ready order and ticket served", () => {
    const { state, orderId } = acceptedOrderState();
    const ticket = state.kitchenTickets.find(
      (candidate) => candidate.orderId === orderId,
    )!;
    const preparing = startKitchenTicket(state, ticket.id);
    const ready = markKitchenTicketReady(preparing, ticket.id);
    const served = markOrderServed(ready, orderId);

    expect(served.orders.find((candidate) => candidate.id === orderId)).toMatchObject({
      status: "SERVED",
      customerStatus: "SERVED",
    });
    expect(
      served.kitchenTickets.find((candidate) => candidate.id === ticket.id)?.status,
    ).toBe("SERVED");
  });

  it("voids the ticket when an order is cancelled", () => {
    const { state, orderId } = acceptedOrderState();
    const cancelled = cancelOrder(state, orderId, "customer changed mind");
    const ticket = cancelled.kitchenTickets.find(
      (candidate) => candidate.orderId === orderId,
    )!;

    expect(cancelled.orders.find((candidate) => candidate.id === orderId)?.status).toBe(
      "CANCELLED",
    );
    expect(ticket.status).toBe("VOIDED");
  });

  it("characterizes the pre-existing single-ticket first-item station behavior", () => {
    const submitted = submitOrder(createDemoState(referenceDate), {
      tableId: "table-t06",
      submissionKey: "multi-station-characterization",
      items: [
        { menuItemId: "menu-yuzu", quantity: 1 },
        { menuItemId: "menu-tempura-shrimp", quantity: 1 },
      ],
    });
    const accepted = acceptOrder(submitted.state, submitted.value.orderId);
    const tickets = accepted.kitchenTickets.filter(
      (ticket) => ticket.orderId === submitted.value.orderId,
    );

    expect(tickets).toHaveLength(1);
    expect(tickets[0].station).toBe("BAR");
    expect(tickets[0].items).toHaveLength(2);
  });
});
