import type {
  FoodFlowState,
  KitchenTicket,
  Order,
  SubmitOrderInput,
  SubmitOrderItemInput,
} from "@/domain";
import {
  addAudit,
  createEntityId,
  getOrCreateSession,
  makeOrderItems,
  nextOrderNumber,
  now,
  refreshTableStatus,
  requireNonEmptyReason,
  requireOrder,
  requireTable,
  roundCurrency,
  updateOrderStatus,
} from "./helpers";
import type { MutationResult, SubmitOrderResult } from "./types";

export const submitOrder = (
  initialState: FoodFlowState,
  input: SubmitOrderInput,
): MutationResult<SubmitOrderResult> => {
  const submissionKey = input.submissionKey.trim();
  if (!submissionKey) throw new Error("A submission key is required.");
  const existing = initialState.orders.find(
    (order) => order.submissionKey === submissionKey,
  );
  if (existing) {
    return {
      state: initialState,
      value: { orderId: existing.id, duplicate: true },
    };
  }

  const timestamp = now();
  const sessionResult = getOrCreateSession(initialState, input.tableId, timestamp);
  const items = makeOrderItems(
    sessionResult.state,
    input.items,
    new Date(timestamp),
  );
  const order: Order = {
    id: input.orderId ?? createEntityId("order"),
    number: nextOrderNumber(sessionResult.state.orders),
    restaurantId: sessionResult.state.restaurant.id,
    branchId: sessionResult.session.branchId,
    tableId: input.tableId,
    tableSessionId: sessionResult.session.id,
    status: "PENDING_CONFIRMATION",
    customerStatus: "SENT",
    items,
    subtotal: roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0)),
    currency: sessionResult.state.restaurant.currency,
    customerNote: input.customerNote?.trim() || undefined,
    submissionKey,
    submittedAt: timestamp,
    modifiedByStaff: false,
  };
  let state: FoodFlowState = {
    ...sessionResult.state,
    orders: [...sessionResult.state.orders, order],
    tableSessions: sessionResult.state.tableSessions.map((session) =>
      session.id === sessionResult.session.id
        ? { ...session, orderIds: [...session.orderIds, order.id] }
        : session,
    ),
    carts: Object.fromEntries(
      Object.entries(sessionResult.state.carts).filter(
        ([tableId]) => tableId !== input.tableId,
      ),
    ),
  };
  state = refreshTableStatus(state, input.tableId);
  const table = requireTable(state, input.tableId);
  state = addAudit(state, {
    fallbackActorId: "customer",
    fallbackActorName: `${table.label} guest`,
    action: "ORDER_CREATED",
    entityType: "ORDER",
    entityId: order.id,
    summary: `Order ${order.number} sent from ${table.label}`,
    timestamp,
  });
  return { state, value: { orderId: order.id, duplicate: false } };
};

export const acceptOrder = (
  initialState: FoodFlowState,
  orderId: string,
  actorId?: string,
): FoodFlowState => {
  const order = requireOrder(initialState, orderId);
  if (["ACCEPTED", "PREPARING", "READY", "SERVED"].includes(order.status)) {
    return initialState;
  }
  if (order.status !== "PENDING_CONFIRMATION" && order.status !== "CHANGED") {
    throw new Error("Only a waiting order can be accepted.");
  }
  const timestamp = now();
  const ticket: KitchenTicket = {
    id: createEntityId("ticket"),
    orderId: order.id,
    branchId: order.branchId,
    tableId: order.tableId,
    tableSessionId: order.tableSessionId,
    orderNumber: order.number,
    status: "NEW",
    station:
      initialState.menuItems.find(
        (item) => item.id === order.items[0]?.menuItemId,
      )?.preparationStation ?? "MAIN_KITCHEN",
    items: order.items.map((item) => ({
      id: createEntityId("ticket-item"),
      orderItemId: item.id,
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      modifiers: item.modifiers.map(
        (modifier) =>
          `${modifier.modifierGroupName}: ${modifier.modifierChoiceName}`,
      ),
      specialRequest: item.specialRequest,
    })),
    createdAt: timestamp,
    remakeCount: 0,
  };
  let state = updateOrderStatus(initialState, orderId, "ACCEPTED", {
    customerStatus: "CONFIRMED",
    acceptedAt: timestamp,
  });
  if (!state.kitchenTickets.some((candidate) => candidate.orderId === orderId)) {
    state = { ...state, kitchenTickets: [...state.kitchenTickets, ticket] };
  }
  state = refreshTableStatus(state, order.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-floor",
    fallbackActorName: "Floor staff",
    action: "ORDER_ACCEPTED",
    entityType: "ORDER",
    entityId: order.id,
    summary: `Accepted order ${order.number}`,
    timestamp,
  });
};

export const rejectOrder = (
  initialState: FoodFlowState,
  orderId: string,
  reason: string,
  actorId?: string,
): FoodFlowState => {
  requireNonEmptyReason(reason, "Rejecting an order");
  const order = requireOrder(initialState, orderId);
  if (order.status !== "PENDING_CONFIRMATION" && order.status !== "CHANGED") {
    throw new Error("Only a waiting order can be rejected.");
  }
  const timestamp = now();
  let state = updateOrderStatus(initialState, orderId, "REJECTED", {
    customerStatus: "REJECTED",
    rejectedAt: timestamp,
    rejectionReason: reason.trim(),
  });
  state = refreshTableStatus(state, order.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-manager",
    fallbackActorName: "Manager",
    action: "ORDER_REJECTED",
    entityType: "ORDER",
    entityId: order.id,
    summary: `Rejected order ${order.number}`,
    reason: reason.trim(),
    timestamp,
  });
};

export const changeOrder = (
  initialState: FoodFlowState,
  orderId: string,
  items: SubmitOrderItemInput[],
  reason: string,
  actorId?: string,
): FoodFlowState => {
  requireNonEmptyReason(reason, "Changing an order");
  const order = requireOrder(initialState, orderId);
  if (order.status !== "PENDING_CONFIRMATION") {
    throw new Error("Only an unconfirmed order can be edited.");
  }
  const timestamp = now();
  const updatedItems = makeOrderItems(
    initialState,
    items,
    new Date(timestamp),
  );
  let state: FoodFlowState = {
    ...initialState,
    orders: initialState.orders.map((candidate) =>
      candidate.id === orderId
        ? {
            ...candidate,
            status: "CHANGED",
            items: updatedItems,
            subtotal: roundCurrency(
              updatedItems.reduce((sum, item) => sum + item.lineTotal, 0),
            ),
            modifiedByStaff: true,
          }
        : candidate,
    ),
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-manager",
    fallbackActorName: "Manager",
    action: "ORDER_CHANGED",
    entityType: "ORDER",
    entityId: order.id,
    summary: `Updated order ${order.number} before acceptance`,
    reason: reason.trim(),
    timestamp,
  });
  return state;
};

export const cancelOrder = (
  initialState: FoodFlowState,
  orderId: string,
  reason: string,
  actorId?: string,
): FoodFlowState => {
  requireNonEmptyReason(reason, "Cancelling an order");
  const order = requireOrder(initialState, orderId);
  if (["PAID", "CLOSED", "VOIDED", "CANCELLED"].includes(order.status)) {
    throw new Error("This order can no longer be cancelled.");
  }
  const timestamp = now();
  let state = updateOrderStatus(initialState, orderId, "CANCELLED", {
    customerStatus: "CANCELLED",
  });
  state = {
    ...state,
    kitchenTickets: state.kitchenTickets.map((ticket) =>
      ticket.orderId === orderId ? { ...ticket, status: "VOIDED" } : ticket,
    ),
  };
  state = refreshTableStatus(state, order.tableId);
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-manager",
    fallbackActorName: "Manager",
    action: "ORDER_CANCELLED",
    entityType: "ORDER",
    entityId: order.id,
    summary: `Cancelled order ${order.number}`,
    reason: reason.trim(),
    timestamp,
  });
};

export const orderRepository = {
  submitOrder,
  acceptOrder,
  rejectOrder,
  changeOrder,
  cancelOrder,
};
