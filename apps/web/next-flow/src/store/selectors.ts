import type {
  FoodFlowState,
  KitchenTicketStatus,
  Order,
  PaymentMethod,
  Table,
} from "@/domain";
import { isMenuAvailabilityActive } from "@/domain";

export const selectTableByCode = (
  state: FoodFlowState,
  code: string,
): Table | undefined =>
  state.tables.find(
    (table) => table.code.toLowerCase() === code.toLowerCase(),
  );

export const selectActiveSessionForTable = (
  state: FoodFlowState,
  tableId: string,
) => {
  const table = state.tables.find((candidate) => candidate.id === tableId);
  return table?.currentSessionId
    ? state.tableSessions.find(
        (session) =>
          session.id === table.currentSessionId && session.status !== "CLOSED",
      )
    : undefined;
};

export const selectOrdersForSession = (
  state: FoodFlowState,
  sessionId: string,
): Order[] =>
  state.orders
    .filter((order) => order.tableSessionId === sessionId)
    .sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

export const selectCustomerMenuItems = (
  state: FoodFlowState,
  date = new Date(),
) => {
  const activeCategoryIds = new Set(
    state.categories
      .filter((category) => category.active && !category.archivedAt)
      .map(({ id }) => id),
  );
  const availability = new Map(
    state.menuAvailabilities.map((rule) => [rule.id, rule]),
  );
  return state.menuItems
    .filter((item) => {
      if (item.status !== "ACTIVE" && item.status !== "SOLD_OUT") return false;
      if (!activeCategoryIds.has(item.categoryId)) return false;
      const rule = availability.get(item.availabilityId);
      return rule ? isMenuAvailabilityActive(rule, date) : false;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

export const selectPendingOrders = (state: FoodFlowState) =>
  state.orders
    .filter(
      (order) =>
        order.status === "PENDING_CONFIRMATION" || order.status === "CHANGED",
    )
    .sort(
      (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

export const selectKitchenTickets = (
  state: FoodFlowState,
  status?: KitchenTicketStatus,
) =>
  state.kitchenTickets
    .filter((ticket) => (status ? ticket.status === status : true))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

export const selectReadyOrders = (state: FoodFlowState) =>
  state.orders
    .filter((order) => order.status === "READY")
    .sort(
      (a, b) =>
        new Date(a.readyAt ?? a.submittedAt).getTime() -
        new Date(b.readyAt ?? b.submittedAt).getTime(),
    );

export const selectOpenServiceRequests = (state: FoodFlowState) =>
  state.serviceRequests
    .filter(
      (request) =>
        request.status === "OPEN" || request.status === "ACKNOWLEDGED",
    )
    .sort(
      (a, b) =>
        new Date(a.requestedAt).getTime() -
        new Date(b.requestedAt).getTime(),
    );

export const selectBillRequests = (state: FoodFlowState) =>
  selectOpenServiceRequests(state).filter(
    (request) => request.type === "REQUEST_BILL",
  );

export const selectSessionSubtotal = (
  state: FoodFlowState,
  sessionId: string,
) =>
  selectOrdersForSession(state, sessionId)
    .filter(
      (order) =>
        !["DRAFT", "REJECTED", "CANCELLED", "VOIDED"].includes(order.status),
    )
    .reduce((sum, order) => sum + order.subtotal, 0);

export const selectOperationalSummary = (state: FoodFlowState) => ({
  totalTables: state.tables.filter((table) => table.active).length,
  activeTables: state.tables.filter((table) => table.status !== "AVAILABLE")
    .length,
  pendingOrders: selectPendingOrders(state).length,
  kitchenOrders: state.kitchenTickets.filter((ticket) =>
    ["NEW", "PREPARING", "READY", "PROBLEM", "REMAKE"].includes(ticket.status),
  ).length,
  billRequests: selectBillRequests(state).length,
});

const dateKey = (value: string | Date, timezone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);

export const selectDashboardMetrics = (
  state: FoodFlowState,
  date = new Date(),
) => {
  const today = dateKey(date, state.settings.timezone);
  const paidToday = state.payments.filter(
    (payment) =>
      payment.status === "RECORDED" &&
      dateKey(payment.recordedAt, state.settings.timezone) === today,
  );
  const ordersToday = state.orders.filter(
    (order) =>
      dateKey(order.submittedAt, state.settings.timezone) === today &&
      !["DRAFT", "VOIDED"].includes(order.status),
  );
  const completedPrep = state.orders.filter(
    (order) => order.preparingAt && order.readyAt,
  );
  const averagePreparationMinutes = completedPrep.length
    ? completedPrep.reduce(
        (total, order) =>
          total +
          (new Date(order.readyAt!).getTime() -
            new Date(order.preparingAt!).getTime()) /
            60_000,
        0,
      ) / completedPrep.length
    : 0;
  return {
    salesToday: paidToday.reduce((sum, payment) => sum + payment.total, 0),
    ordersToday: ordersToday.length,
    activeTables: state.tables.filter((table) => table.status !== "AVAILABLE")
      .length,
    totalTables: state.tables.filter((table) => table.active).length,
    averagePreparationMinutes,
    ordersWaiting: selectPendingOrders(state).length,
    cancelledOrders: ordersToday.filter((order) => order.status === "CANCELLED")
      .length,
    remakeOrders: ordersToday.filter((order) => order.status === "REMAKE").length,
  };
};

export const selectTopSellingItems = (
  state: FoodFlowState,
  limit = 5,
) => {
  const totals = new Map<
    string,
    { menuItemId: string; name: string; quantity: number; sales: number }
  >();
  state.orders
    .filter(
      (order) =>
        !["DRAFT", "REJECTED", "CANCELLED", "VOIDED"].includes(order.status),
    )
    .forEach((order) =>
      order.items.forEach((item) => {
        const current = totals.get(item.menuItemId);
        totals.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.menuItemName,
          quantity: (current?.quantity ?? 0) + item.quantity,
          sales: (current?.sales ?? 0) + item.lineTotal,
        });
      }),
    );
  return [...totals.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};

export const selectPaymentBreakdown = (
  state: FoodFlowState,
): Record<PaymentMethod, number> =>
  state.payments
    .filter((payment) => payment.status === "RECORDED")
    .reduce<Record<PaymentMethod, number>>(
      (totals, payment) => ({
        ...totals,
        [payment.method]: totals[payment.method] + payment.total,
      }),
      {
        CASH: 0,
        THAI_QR: 0,
        CARD_TERMINAL: 0,
        BANK_TRANSFER: 0,
        OTHER: 0,
      },
    );
