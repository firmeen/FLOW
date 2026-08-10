"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createDemoState } from "@/data/demo";
import { orderItemTotal } from "@/lib/format";
import { localFoodFlowRepository } from "@/services/repositories/local-foodflow-repository";
import type {
  CartDraftItem,
  FoodFlowState,
  MenuCategory,
  MenuItem,
  MenuStatus,
  PaymentMethod,
  ServiceRequestType,
  TableStatus,
} from "@/domain/types";

type NewMenuInput = Pick<MenuItem, "name" | "nameTh" | "description" | "price" | "categoryId">;
type NewCategoryInput = Pick<MenuCategory, "name" | "nameTh">;

interface FoodFlowContextValue {
  state: FoodFlowState;
  createOrder: (tableCode: string, items: CartDraftItem[]) => string | null;
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  startOrder: (orderId: string) => void;
  readyOrder: (orderId: string) => void;
  serveOrder: (orderId: string) => void;
  requestService: (tableCode: string, type: ServiceRequestType) => void;
  acknowledgeRequest: (requestId: string) => void;
  resolveRequest: (requestId: string) => void;
  recordPayment: (sessionId: string, method: PaymentMethod) => void;
  setMenuStatus: (menuItemId: string, status: MenuStatus) => void;
  addMenuItem: (input: NewMenuInput) => void;
  addCategory: (input: NewCategoryInput) => void;
  resetDemo: () => void;
}

const FoodFlowContext = createContext<FoodFlowContextValue | null>(null);

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export function FoodFlowProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FoodFlowState>(() => createDemoState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localFoodFlowRepository.load();
    if (saved) setState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localFoodFlowRepository.save(state);
  }, [hydrated, state]);

  const audit = useCallback((current: FoodFlowState, actor: string, action: string, entity: string, reason?: string) => ({
    ...current,
    auditEvents: [
      { id: makeId("audit"), timestamp: new Date().toISOString(), actor, action, entity, reason },
      ...current.auditEvents,
    ].slice(0, 80),
  }), []);

  const createOrder = useCallback((tableCode: string, drafts: CartDraftItem[]) => {
    if (!drafts.length) return null;
    const orderId = `FF-${String(Date.now()).slice(-5)}`;
    setState((current) => {
      const table = current.tables.find((candidate) => candidate.code === tableCode);
      if (!table) return current;
      const session = current.sessions.find((candidate) => candidate.tableId === table.id && candidate.status === "OPEN");
      const sessionId = session?.id ?? makeId(`session-${tableCode}`);
      const orderItems = drafts.map((draft, index) => {
        const menu = current.menuItems.find((candidate) => candidate.id === draft.menuItemId);
        return {
          id: `${orderId}-item-${index + 1}`,
          menuItemId: draft.menuItemId,
          name: menu?.name ?? "Menu item",
          quantity: draft.quantity,
          basePrice: draft.priceOverride ?? menu?.price ?? 0,
          modifiers: draft.modifiers,
          notes: draft.notes,
        };
      });
      const order = {
        id: orderId,
        sessionId,
        tableId: table.id,
        status: "PENDING_CONFIRMATION" as const,
        items: orderItems,
        createdAt: new Date().toISOString(),
      };
      const sessions = session
        ? current.sessions.map((candidate) => candidate.id === sessionId ? { ...candidate, orderIds: [...candidate.orderIds, orderId] } : candidate)
        : [...current.sessions, { id: sessionId, tableId: table.id, openedAt: new Date().toISOString(), orderIds: [orderId], status: "OPEN" as const }];
      const next = {
        ...current,
        sessions,
        orders: [...current.orders, order],
        tables: current.tables.map((candidate) => candidate.id === table.id ? { ...candidate, status: "WAITING" as const } : candidate),
      };
      return audit(next, `Customer ${tableCode}`, "Order created", `Order ${orderId}`);
    });
    return orderId;
  }, [audit]);

  const updateOrderStatus = useCallback((orderId: string, status: "ACCEPTED" | "PREPARING" | "READY" | "SERVED", timestampKey: "acceptedAt" | "preparingAt" | "readyAt" | "servedAt", action: string) => {
    setState((current) => {
      const order = current.orders.find((candidate) => candidate.id === orderId);
      if (!order) return current;
      const tableStatus: TableStatus = status === "ACCEPTED" || status === "PREPARING" ? "PREPARING" : status === "READY" ? "READY" : "OCCUPIED";
      const next = {
        ...current,
        orders: current.orders.map((candidate) => candidate.id === orderId ? { ...candidate, status, [timestampKey]: new Date().toISOString() } : candidate),
        tables: current.tables.map((table) => table.id === order.tableId ? { ...table, status: tableStatus } : table),
      };
      return audit(next, "Restaurant team", action, `Order ${orderId}`);
    });
  }, [audit]);

  const acceptOrder = useCallback((orderId: string) => updateOrderStatus(orderId, "ACCEPTED", "acceptedAt", "Order accepted"), [updateOrderStatus]);
  const startOrder = useCallback((orderId: string) => updateOrderStatus(orderId, "PREPARING", "preparingAt", "Kitchen started"), [updateOrderStatus]);
  const readyOrder = useCallback((orderId: string) => updateOrderStatus(orderId, "READY", "readyAt", "Kitchen ready"), [updateOrderStatus]);
  const serveOrder = useCallback((orderId: string) => updateOrderStatus(orderId, "SERVED", "servedAt", "Order served"), [updateOrderStatus]);

  const rejectOrder = useCallback((orderId: string, reason: string) => {
    setState((current) => {
      const order = current.orders.find((candidate) => candidate.id === orderId);
      if (!order) return current;
      const next = {
        ...current,
        orders: current.orders.map((candidate) => candidate.id === orderId ? { ...candidate, status: "REJECTED" as const, rejectedReason: reason } : candidate),
        tables: current.tables.map((table) => table.id === order.tableId ? { ...table, status: "OCCUPIED" as const } : table),
      };
      return audit(next, "Staff", "Order rejected", `Order ${orderId}`, reason);
    });
  }, [audit]);

  const requestService = useCallback((tableCode: string, type: ServiceRequestType) => {
    setState((current) => {
      const table = current.tables.find((candidate) => candidate.code === tableCode);
      if (!table) return current;
      const request = { id: makeId("request"), tableId: table.id, type, status: "OPEN" as const, createdAt: new Date().toISOString() };
      const next = {
        ...current,
        serviceRequests: [request, ...current.serviceRequests],
        tables: type === "REQUEST_BILL"
          ? current.tables.map((candidate) => candidate.id === table.id ? { ...candidate, status: "BILL_REQUESTED" as const } : candidate)
          : current.tables,
      };
      return audit(next, `Customer ${tableCode}`, type === "REQUEST_BILL" ? "Requested bill" : "Called staff", `Table ${tableCode}`);
    });
  }, [audit]);

  const acknowledgeRequest = useCallback((requestId: string) => {
    setState((current) => ({ ...current, serviceRequests: current.serviceRequests.map((request) => request.id === requestId ? { ...request, status: "ACKNOWLEDGED", acknowledgedAt: new Date().toISOString() } : request) }));
  }, []);

  const resolveRequest = useCallback((requestId: string) => {
    setState((current) => ({ ...current, serviceRequests: current.serviceRequests.map((request) => request.id === requestId ? { ...request, status: "RESOLVED", resolvedAt: new Date().toISOString() } : request) }));
  }, []);

  const recordPayment = useCallback((sessionId: string, method: PaymentMethod) => {
    setState((current) => {
      const session = current.sessions.find((candidate) => candidate.id === sessionId);
      if (!session) return current;
      const sessionOrders = current.orders.filter((order) => order.sessionId === sessionId && !["REJECTED", "CANCELLED", "VOIDED"].includes(order.status));
      const amount = sessionOrders.flatMap((order) => order.items).reduce((sum, item) => sum + orderItemTotal(item), 0);
      const payment = { id: makeId("payment"), sessionId, method, amount, createdAt: new Date().toISOString() };
      const next = {
        ...current,
        payments: [payment, ...current.payments],
        sessions: current.sessions.map((candidate) => candidate.id === sessionId ? { ...candidate, status: "CLOSED" as const, closedAt: new Date().toISOString() } : candidate),
        orders: current.orders.map((order) => order.sessionId === sessionId ? { ...order, status: "CLOSED" as const } : order),
        tables: current.tables.map((table) => table.id === session.tableId ? { ...table, status: "AVAILABLE" as const } : table),
        serviceRequests: current.serviceRequests.map((request) => request.tableId === session.tableId && request.type === "REQUEST_BILL" ? { ...request, status: "RESOLVED" as const, resolvedAt: new Date().toISOString() } : request),
      };
      return audit(next, "Cashier", `Payment recorded · ${method}`, `Session ${sessionId}`);
    });
  }, [audit]);

  const setMenuStatus = useCallback((menuItemId: string, status: MenuStatus) => {
    setState((current) => {
      const item = current.menuItems.find((candidate) => candidate.id === menuItemId);
      const next = { ...current, menuItems: current.menuItems.map((candidate) => candidate.id === menuItemId ? { ...candidate, status } : candidate) };
      return item ? audit(next, "Staff", `Menu ${status.toLowerCase().replaceAll("_", " ")}`, item.name) : next;
    });
  }, [audit]);

  const addMenuItem = useCallback((input: NewMenuInput) => {
    setState((current) => {
      const item: MenuItem = {
        id: makeId("menu"),
        ...input,
        imageTone: "from-emerald-100 via-stone-50 to-amber-50",
        badgeIds: [],
        modifierGroupIds: [],
        addOnItemIds: [],
        status: "ACTIVE",
        preparationStation: "KITCHEN",
        estimatedPreparationMinutes: 12,
        availability: { type: "ALWAYS" },
      };
      return audit({ ...current, menuItems: [...current.menuItems, item] }, "Owner", "Menu published", item.name);
    });
  }, [audit]);

  const addCategory = useCallback((input: NewCategoryInput) => {
    setState((current) => {
      const category: MenuCategory = {
        id: makeId("cat"),
        ...input,
        displayOrder: current.categories.length + 1,
        active: true,
      };
      return audit({ ...current, categories: [...current.categories, category] }, "Owner", "Category created", category.name);
    });
  }, [audit]);

  const resetDemo = useCallback(() => {
    const fresh = createDemoState();
    setState(fresh);
    localFoodFlowRepository.save(fresh);
  }, []);

  const value = useMemo(() => ({
    state,
    createOrder,
    acceptOrder,
    rejectOrder,
    startOrder,
    readyOrder,
    serveOrder,
    requestService,
    acknowledgeRequest,
    resolveRequest,
    recordPayment,
    setMenuStatus,
    addMenuItem,
    addCategory,
    resetDemo,
  }), [state, createOrder, acceptOrder, rejectOrder, startOrder, readyOrder, serveOrder, requestService, acknowledgeRequest, resolveRequest, recordPayment, setMenuStatus, addMenuItem, addCategory, resetDemo]);

  return <FoodFlowContext.Provider value={value}>{children}</FoodFlowContext.Provider>;
}

export function useFoodFlow() {
  const context = useContext(FoodFlowContext);
  if (!context) throw new Error("useFoodFlow must be used inside FoodFlowProvider");
  return context;
}
