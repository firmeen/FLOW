import type {
  AuditAction,
  AuditEntityType,
  FoodFlowState,
  KitchenTicket,
  Order,
  OrderItem,
  OrderStatus,
  SubmitOrderItemInput,
  Table,
  TableSession,
} from "@/domain";

export const createEntityId = (prefix: string): string => {
  const uuid =
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${uuid}`;
};

export const now = () => new Date().toISOString();
export const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const getActor = (
  state: FoodFlowState,
  actorId: string | undefined,
  fallbackId: string,
  fallbackName: string,
) => {
  const id = actorId ?? fallbackId;
  const staff = state.staffUsers.find((candidate) => candidate.id === id);
  return { id, name: staff?.name ?? fallbackName };
};

interface AuditInput {
  actorId?: string;
  fallbackActorId: string;
  fallbackActorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp?: string;
}

export const addAudit = (
  state: FoodFlowState,
  input: AuditInput,
): FoodFlowState => {
  const timestamp = input.timestamp ?? now();
  const actor = getActor(
    state,
    input.actorId,
    input.fallbackActorId,
    input.fallbackActorName,
  );
  return {
    ...state,
    lastUpdatedAt: timestamp,
    auditEvents: [
      {
        id: createEntityId("audit"),
        restaurantId: state.restaurant.id,
        branchId: state.settings.branchId,
        actorId: actor.id,
        actorName: actor.name,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        summary: input.summary,
        reason: input.reason,
        metadata: input.metadata,
        timestamp,
      },
      ...state.auditEvents,
    ],
  };
};

export const requireTable = (
  state: FoodFlowState,
  tableId: string,
): Table => {
  const table = state.tables.find((candidate) => candidate.id === tableId);
  if (!table || !table.active) throw new Error("Table is not available.");
  return table;
};

export const requireSession = (
  state: FoodFlowState,
  sessionId: string,
): TableSession => {
  const session = state.tableSessions.find(
    (candidate) => candidate.id === sessionId,
  );
  if (!session) throw new Error("Table session was not found.");
  return session;
};

export const requireOrder = (
  state: FoodFlowState,
  orderId: string,
): Order => {
  const order = state.orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error("Order was not found.");
  return order;
};

export const requireTicket = (
  state: FoodFlowState,
  ticketId: string,
): KitchenTicket => {
  const ticket = state.kitchenTickets.find(
    (candidate) => candidate.id === ticketId,
  );
  if (!ticket) throw new Error("Kitchen ticket was not found.");
  return ticket;
};

export const requireNonEmptyReason = (reason: string, label: string) => {
  if (!reason.trim()) throw new Error(`${label} requires a reason.`);
};

const tableStatusFor = (
  state: FoodFlowState,
  tableId: string,
): Table["status"] => {
  const table = state.tables.find((candidate) => candidate.id === tableId);
  if (!table?.currentSessionId) return "AVAILABLE";
  const session = state.tableSessions.find(
    (candidate) => candidate.id === table.currentSessionId,
  );
  if (!session || session.status === "CLOSED") return "AVAILABLE";
  if (session.status === "BILL_REQUESTED") return "BILL_REQUESTED";
  if (session.status === "PAYMENT_PENDING") return "PAYMENT_PENDING";
  const orders = state.orders.filter(
    (order) => order.tableSessionId === session.id,
  );
  if (orders.some((order) => order.status === "READY")) return "READY";
  if (
    orders.some(
      (order) =>
        order.status === "PENDING_CONFIRMATION" || order.status === "CHANGED",
    )
  ) return "WAITING";
  if (orders.some((order) => order.status === "PREPARING")) return "PREPARING";
  return "OCCUPIED";
};

export const refreshTableStatus = (
  state: FoodFlowState,
  tableId: string,
): FoodFlowState => ({
  ...state,
  tables: state.tables.map((table) =>
    table.id === tableId
      ? { ...table, status: tableStatusFor(state, tableId) }
      : table,
  ),
});

export const nextOrderNumber = (orders: Order[]): string => {
  const highest = orders.reduce((maximum, order) => {
    const value = Number(order.number.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(maximum, value) : maximum;
  }, 1000);
  return `FF-${highest + 1}`;
};

export const getOrCreateSession = (
  state: FoodFlowState,
  tableId: string,
  timestamp: string,
): { state: FoodFlowState; session: TableSession } => {
  const table = requireTable(state, tableId);
  if (table.currentSessionId) {
    const existing = state.tableSessions.find(
      (session) =>
        session.id === table.currentSessionId && session.status !== "CLOSED",
    );
    if (existing) return { state, session: existing };
  }
  const session: TableSession = {
    id: createEntityId("session"),
    branchId: table.branchId,
    tableId,
    sessionNumber: `S-${timestamp.slice(0, 10).replace(/-/g, "")}-${String(
      state.tableSessions.length + 1,
    ).padStart(3, "0")}`,
    status: "ACTIVE",
    guestCount: 1,
    openedAt: timestamp,
    orderIds: [],
    paymentIds: [],
    customerToken: createEntityId("guest"),
  };
  return {
    state: {
      ...state,
      tableSessions: [...state.tableSessions, session],
      tables: state.tables.map((candidate) =>
        candidate.id === tableId
          ? { ...candidate, currentSessionId: session.id, status: "OCCUPIED" }
          : candidate,
      ),
    },
    session,
  };
};

export const makeOrderItems = (
  state: FoodFlowState,
  inputs: SubmitOrderItemInput[],
): OrderItem[] => {
  if (!inputs.length) {
    throw new Error("Add at least one item before sending the order.");
  }
  return inputs.map((input) => {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new Error("Order item quantities must be positive whole numbers.");
    }
    const menuItem = state.menuItems.find((item) => item.id === input.menuItemId);
    if (!menuItem || menuItem.status !== "ACTIVE") {
      throw new Error(
        `${menuItem?.name ?? "This item"} is not currently orderable.`,
      );
    }
    const allowedModifierGroupIds = new Set(menuItem.modifierGroupIds);
    const selectedModifierChoices = new Set<string>();
    const modifiers = (input.modifiers ?? []).map((selection) => {
      if (!allowedModifierGroupIds.has(selection.modifierGroupId)) {
        throw new Error("A selected modifier does not belong to this item.");
      }
      const selectionKey = `${selection.modifierGroupId}\u0000${selection.modifierChoiceId}`;
      if (selectedModifierChoices.has(selectionKey)) {
        throw new Error("The same modifier choice cannot be selected twice.");
      }
      selectedModifierChoices.add(selectionKey);
      const group = state.modifierGroups.find(
        (candidate) => candidate.id === selection.modifierGroupId,
      );
      const choice = group?.choices.find(
        (candidate) => candidate.id === selection.modifierChoiceId,
      );
      if (!group || !choice || !group.active || !choice.active) {
        throw new Error("A selected modifier is no longer available.");
      }
      return {
        id: createEntityId("order-modifier"),
        modifierGroupId: group.id,
        modifierGroupName: group.name,
        modifierChoiceId: choice.id,
        modifierChoiceName: choice.name,
        priceDelta: choice.priceDelta,
      };
    });
    for (const groupId of menuItem.modifierGroupIds) {
      const group = state.modifierGroups.find(
        (candidate) => candidate.id === groupId,
      );
      if (!group?.active) continue;
      const selectionCount = modifiers.filter(
        (modifier) => modifier.modifierGroupId === group.id,
      ).length;
      if (selectionCount < group.minimumSelections) {
        throw new Error(`Please complete ${group.name}.`);
      }
      if (selectionCount > group.maximumSelections) {
        throw new Error(`Too many selections for ${group.name}.`);
      }
    }
    const unitPrice =
      menuItem.basePrice +
      modifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0);
    return {
      id: createEntityId("order-item"),
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      menuItemThaiName: menuItem.thaiName,
      quantity: input.quantity,
      unitPrice,
      modifiers,
      specialRequest: input.specialRequest?.trim() || undefined,
      lineTotal: roundCurrency(unitPrice * input.quantity),
    };
  });
};

export const updateOrderStatus = (
  state: FoodFlowState,
  orderId: string,
  status: OrderStatus,
  fields: Partial<Order>,
): FoodFlowState => ({
  ...state,
  orders: state.orders.map((order) =>
    order.id === orderId ? { ...order, ...fields, status } : order,
  ),
});
