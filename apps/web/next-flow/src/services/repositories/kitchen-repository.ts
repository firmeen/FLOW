import type { FoodFlowState } from "@/domain";
import {
  addAudit,
  now,
  refreshTableStatus,
  requireNonEmptyReason,
  requireOrder,
  requireTicket,
  requireTable,
  updateOrderStatus,
} from "./helpers";

export const startKitchenTicket = (
  initialState: FoodFlowState,
  ticketId: string,
  actorId?: string,
): FoodFlowState => {
  const ticket = requireTicket(initialState, ticketId);
  if (ticket.status === "PREPARING") return initialState;
  if (!["NEW", "REMAKE", "PROBLEM"].includes(ticket.status)) {
    throw new Error("This ticket cannot be started.");
  }
  const timestamp = now();
  let state: FoodFlowState = {
    ...initialState,
    kitchenTickets: initialState.kitchenTickets.map((candidate) =>
      candidate.id === ticketId
        ? {
            ...candidate,
            status: "PREPARING",
            startedAt: timestamp,
            problemNote: undefined,
          }
        : candidate,
    ),
  };
  state = updateOrderStatus(state, ticket.orderId, "PREPARING", {
    customerStatus: "PREPARING",
    preparingAt: timestamp,
  });
  state = refreshTableStatus(state, ticket.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-kitchen",
    fallbackActorName: "Kitchen",
    action: "KITCHEN_STARTED",
    entityType: "KITCHEN_TICKET",
    entityId: ticket.id,
    summary: `Kitchen started order ${ticket.orderNumber}`,
    timestamp,
  });
};

export const markKitchenTicketReady = (
  initialState: FoodFlowState,
  ticketId: string,
  actorId?: string,
): FoodFlowState => {
  const ticket = requireTicket(initialState, ticketId);
  if (ticket.status === "READY") return initialState;
  if (ticket.status !== "PREPARING") {
    throw new Error("Start the ticket before marking it ready.");
  }
  const timestamp = now();
  let state: FoodFlowState = {
    ...initialState,
    kitchenTickets: initialState.kitchenTickets.map((candidate) =>
      candidate.id === ticketId
        ? { ...candidate, status: "READY", readyAt: timestamp }
        : candidate,
    ),
  };
  state = updateOrderStatus(state, ticket.orderId, "READY", {
    customerStatus: "COMING_TO_TABLE",
    readyAt: timestamp,
  });
  state = refreshTableStatus(state, ticket.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-kitchen",
    fallbackActorName: "Kitchen",
    action: "KITCHEN_READY",
    entityType: "KITCHEN_TICKET",
    entityId: ticket.id,
    summary: `Order ${ticket.orderNumber} is ready to serve`,
    timestamp,
  });
};

export const markKitchenProblem = (
  initialState: FoodFlowState,
  ticketId: string,
  note: string,
  actorId?: string,
): FoodFlowState => {
  requireNonEmptyReason(note, "Reporting a kitchen problem");
  const ticket = requireTicket(initialState, ticketId);
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    kitchenTickets: initialState.kitchenTickets.map((candidate) =>
      candidate.id === ticketId
        ? { ...candidate, status: "PROBLEM", problemNote: note.trim() }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-kitchen",
    fallbackActorName: "Kitchen",
    action: "KITCHEN_PROBLEM",
    entityType: "KITCHEN_TICKET",
    entityId: ticket.id,
    summary: `Problem reported for order ${ticket.orderNumber}`,
    reason: note.trim(),
    timestamp,
  });
};

export const remakeKitchenTicket = (
  initialState: FoodFlowState,
  ticketId: string,
  reason?: string,
  actorId?: string,
): FoodFlowState => {
  const ticket = requireTicket(initialState, ticketId);
  const timestamp = now();
  let state: FoodFlowState = {
    ...initialState,
    kitchenTickets: initialState.kitchenTickets.map((candidate) =>
      candidate.id === ticketId
        ? {
            ...candidate,
            status: "REMAKE",
            remakeCount: candidate.remakeCount + 1,
            startedAt: undefined,
            readyAt: undefined,
            servedAt: undefined,
            problemNote: reason?.trim() || candidate.problemNote,
          }
        : candidate,
    ),
  };
  state = updateOrderStatus(state, ticket.orderId, "REMAKE", {
    customerStatus: "CONFIRMED",
    preparingAt: undefined,
    readyAt: undefined,
    servedAt: undefined,
  });
  state = refreshTableStatus(state, ticket.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-kitchen",
    fallbackActorName: "Kitchen",
    action: "KITCHEN_REMAKE",
    entityType: "KITCHEN_TICKET",
    entityId: ticket.id,
    summary: `Remake requested for order ${ticket.orderNumber}`,
    reason: reason?.trim() || undefined,
    timestamp,
  });
};

export const markOrderServed = (
  initialState: FoodFlowState,
  orderId: string,
  actorId?: string,
): FoodFlowState => {
  const order = requireOrder(initialState, orderId);
  if (order.status === "SERVED") return initialState;
  if (order.status !== "READY") {
    throw new Error("Only a ready order can be served.");
  }
  const timestamp = now();
  let state = updateOrderStatus(initialState, orderId, "SERVED", {
    customerStatus: "SERVED",
    servedAt: timestamp,
  });
  state = {
    ...state,
    kitchenTickets: state.kitchenTickets.map((ticket) =>
      ticket.orderId === orderId
        ? { ...ticket, status: "SERVED", servedAt: timestamp }
        : ticket,
    ),
  };
  state = refreshTableStatus(state, order.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-floor",
    fallbackActorName: "Floor staff",
    action: "ITEM_SERVED",
    entityType: "ORDER",
    entityId: order.id,
    summary: `Served order ${order.number} to ${requireTable(state, order.tableId).label}`,
    timestamp,
  });
};

export const kitchenRepository = {
  startKitchenTicket,
  markKitchenTicketReady,
  markKitchenProblem,
  remakeKitchenTicket,
  markOrderServed,
};
