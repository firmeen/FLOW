"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CartItem,
  DemoRole,
  FoodFlowState,
  MenuItemStatus,
  RecordPaymentInput,
  ServiceRequestType,
  SubmitOrderInput,
  SubmitOrderItemInput,
} from "@/domain";
import { createDemoState } from "@/data/demo";
import {
  foodFlowRepository,
  type AvailabilityPatch,
  type BadgePatch,
  type CategoryPatch,
  type CreateAvailabilityInput,
  type CreateBadgeInput,
  type CreateCategoryInput,
  type CreateMenuItemInput,
  type CreateModifierGroupInput,
  type MenuItemPatch,
  type ModifierGroupPatch,
  type MutationResult,
  type RecordPaymentResult,
  type RequestServiceResult,
  type SettingsPatch,
  type SubmitOrderResult,
} from "@/services/repositories";

export const FOODFLOW_STORAGE_KEY = "foodflow:mvp:state:v1";

// Server-rendered client components need an identical first snapshot in the
// browser. The live demo is rebased to the current time immediately after
// hydration (or replaced by persisted state).
const HYDRATION_REFERENCE_DATE = new Date("2026-08-10T04:30:00.000Z");

const createHydrationState = () => createDemoState(HYDRATION_REFERENCE_DATE);

export interface FoodFlowActions {
  setActiveRole(role: DemoRole): void;
  addCartItem(tableId: string, item: Omit<CartItem, "id">): void;
  updateCartItem(
    tableId: string,
    itemId: string,
    patch: Partial<Omit<CartItem, "id">>,
  ): void;
  removeCartItem(tableId: string, itemId: string): void;
  clearCart(tableId: string): void;
  submitOrder(input: SubmitOrderInput): SubmitOrderResult;
  acceptOrder(orderId: string): void;
  rejectOrder(orderId: string, reason: string): void;
  changeOrder(
    orderId: string,
    items: SubmitOrderItemInput[],
    reason: string,
  ): void;
  cancelOrder(orderId: string, reason: string): void;
  startKitchenTicket(ticketId: string): void;
  markKitchenTicketReady(ticketId: string): void;
  markKitchenProblem(ticketId: string, note: string): void;
  remakeKitchenTicket(ticketId: string, reason?: string): void;
  markOrderServed(orderId: string): void;
  requestService(
    tableId: string,
    type: ServiceRequestType,
    note?: string,
  ): RequestServiceResult;
  requestStaff(tableId: string, note?: string): RequestServiceResult;
  requestBill(tableId: string, note?: string): RequestServiceResult;
  acknowledgeService(requestId: string): void;
  resolveService(requestId: string): void;
  recordPayment(input: RecordPaymentInput): RecordPaymentResult;
  voidPayment(paymentId: string, reason: string, staffId: string): void;
  createCategory(input: CreateCategoryInput): string;
  updateCategory(categoryId: string, patch: CategoryPatch): void;
  reorderCategory(categoryId: string, direction: "UP" | "DOWN"): void;
  createMenuItem(input: CreateMenuItemInput): string;
  updateMenuItem(itemId: string, patch: MenuItemPatch): void;
  duplicateMenuItem(itemId: string): string;
  archiveMenuItem(itemId: string): void;
  publishMenuItem(itemId: string): void;
  setMenuItemStatus(
    itemId: string,
    status: MenuItemStatus,
    reason?: string,
  ): void;
  createModifierGroup(input: CreateModifierGroupInput): string;
  updateModifierGroup(groupId: string, patch: ModifierGroupPatch): void;
  createBadge(input: CreateBadgeInput): string;
  updateBadge(badgeId: string, patch: BadgePatch): void;
  createAvailability(input: CreateAvailabilityInput): string;
  updateAvailability(
    availabilityId: string,
    patch: AvailabilityPatch,
  ): void;
  updateSettings(patch: SettingsPatch): void;
  resetDemo(): void;
}

export interface FoodFlowContextValue extends FoodFlowActions {
  state: FoodFlowState;
  hydrated: boolean;
  actions: FoodFlowActions;
}

const FoodFlowContext = createContext<FoodFlowContextValue | null>(null);

const restoreState = (raw: string | null): FoodFlowState | null => {
  if (!raw) return null;
  try {
    const candidate = JSON.parse(raw) as Partial<FoodFlowState>;
    if (
      candidate.schemaVersion !== 1 ||
      !candidate.restaurant ||
      !Array.isArray(candidate.tables) ||
      !Array.isArray(candidate.orders) ||
      !Array.isArray(candidate.menuItems)
    ) {
      return null;
    }
    const seed = createDemoState();
    return {
      ...seed,
      ...candidate,
      settings: { ...seed.settings, ...candidate.settings },
      carts: candidate.carts ?? {},
    } as FoodFlowState;
  } catch {
    return null;
  }
};

export function FoodFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FoodFlowState>(createHydrationState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);

  const commit = useCallback(
    (operation: (current: FoodFlowState) => FoodFlowState): FoodFlowState => {
      const next = operation(stateRef.current);
      stateRef.current = next;
      setState(next);
      return next;
    },
    [],
  );

  const commitResult = useCallback(
    <T,>(operation: (current: FoodFlowState) => MutationResult<T>): T => {
      const result = operation(stateRef.current);
      stateRef.current = result.state;
      setState(result.state);
      return result.value;
    },
    [],
  );

  useEffect(() => {
    const restored = restoreState(window.localStorage.getItem(FOODFLOW_STORAGE_KEY));
    const initialState = restored ?? createDemoState();
    queueMicrotask(() => {
      stateRef.current = initialState;
      setState(initialState);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FOODFLOW_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The demo remains usable in memory when storage is unavailable.
    }
  }, [hydrated, state]);

  useEffect(() => {
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key !== FOODFLOW_STORAGE_KEY) return;
      const restored = restoreState(event.newValue);
      if (!restored) return;
      stateRef.current = restored;
      setState(restored);
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  const actions = useMemo<FoodFlowActions>(
    () => ({
      setActiveRole: (role) =>
        commit((current) => foodFlowRepository.setActiveRole(current, role)),
      addCartItem: (tableId, item) =>
        commit((current) =>
          foodFlowRepository.addCartItem(current, tableId, item),
        ),
      updateCartItem: (tableId, itemId, patch) =>
        commit((current) =>
          foodFlowRepository.updateCartItem(
            current,
            tableId,
            itemId,
            patch,
          ),
        ),
      removeCartItem: (tableId, itemId) =>
        commit((current) =>
          foodFlowRepository.removeCartItem(current, tableId, itemId),
        ),
      clearCart: (tableId) =>
        commit((current) => foodFlowRepository.clearCart(current, tableId)),
      submitOrder: (input) =>
        commitResult((current) =>
          foodFlowRepository.submitOrder(current, input),
        ),
      acceptOrder: (orderId) =>
        commit((current) => foodFlowRepository.acceptOrder(current, orderId)),
      rejectOrder: (orderId, reason) =>
        commit((current) =>
          foodFlowRepository.rejectOrder(current, orderId, reason),
        ),
      changeOrder: (orderId, items, reason) =>
        commit((current) =>
          foodFlowRepository.changeOrder(current, orderId, items, reason),
        ),
      cancelOrder: (orderId, reason) =>
        commit((current) =>
          foodFlowRepository.cancelOrder(current, orderId, reason),
        ),
      startKitchenTicket: (ticketId) =>
        commit((current) =>
          foodFlowRepository.startKitchenTicket(current, ticketId),
        ),
      markKitchenTicketReady: (ticketId) =>
        commit((current) =>
          foodFlowRepository.markKitchenTicketReady(current, ticketId),
        ),
      markKitchenProblem: (ticketId, note) =>
        commit((current) =>
          foodFlowRepository.markKitchenProblem(current, ticketId, note),
        ),
      remakeKitchenTicket: (ticketId, reason) =>
        commit((current) =>
          foodFlowRepository.remakeKitchenTicket(current, ticketId, reason),
        ),
      markOrderServed: (orderId) =>
        commit((current) =>
          foodFlowRepository.markOrderServed(current, orderId),
        ),
      requestService: (tableId, type, note) =>
        commitResult((current) =>
          foodFlowRepository.requestService(current, tableId, type, note),
        ),
      requestStaff: (tableId, note) =>
        commitResult((current) =>
          foodFlowRepository.requestService(
            current,
            tableId,
            "CALL_STAFF",
            note,
          ),
        ),
      requestBill: (tableId, note) =>
        commitResult((current) =>
          foodFlowRepository.requestService(
            current,
            tableId,
            "REQUEST_BILL",
            note,
          ),
        ),
      acknowledgeService: (requestId) =>
        commit((current) =>
          foodFlowRepository.acknowledgeService(current, requestId),
        ),
      resolveService: (requestId) =>
        commit((current) =>
          foodFlowRepository.resolveService(current, requestId),
        ),
      recordPayment: (input) =>
        commitResult((current) =>
          foodFlowRepository.recordPayment(current, input),
        ),
      voidPayment: (paymentId, reason, staffId) =>
        commit((current) =>
          foodFlowRepository.voidPayment(
            current,
            paymentId,
            reason,
            staffId,
          ),
        ),
      createCategory: (input) =>
        commitResult((current) =>
          foodFlowRepository.createCategory(current, input),
        ),
      updateCategory: (categoryId, patch) =>
        commit((current) =>
          foodFlowRepository.updateCategory(current, categoryId, patch),
        ),
      reorderCategory: (categoryId, direction) =>
        commit((current) =>
          foodFlowRepository.reorderCategory(
            current,
            categoryId,
            direction,
          ),
        ),
      createMenuItem: (input) =>
        commitResult((current) =>
          foodFlowRepository.createMenuItem(current, input),
        ),
      updateMenuItem: (itemId, patch) =>
        commit((current) =>
          foodFlowRepository.updateMenuItem(current, itemId, patch),
        ),
      duplicateMenuItem: (itemId) =>
        commitResult((current) =>
          foodFlowRepository.duplicateMenuItem(current, itemId),
        ),
      archiveMenuItem: (itemId) =>
        commit((current) =>
          foodFlowRepository.archiveMenuItem(current, itemId),
        ),
      publishMenuItem: (itemId) =>
        commit((current) =>
          foodFlowRepository.publishMenuItem(current, itemId),
        ),
      setMenuItemStatus: (itemId, status, reason) =>
        commit((current) =>
          foodFlowRepository.setMenuItemStatus(
            current,
            itemId,
            status,
            undefined,
            reason,
          ),
        ),
      createModifierGroup: (input) =>
        commitResult((current) =>
          foodFlowRepository.createModifierGroup(current, input),
        ),
      updateModifierGroup: (groupId, patch) =>
        commit((current) =>
          foodFlowRepository.updateModifierGroup(current, groupId, patch),
        ),
      createBadge: (input) =>
        commitResult((current) =>
          foodFlowRepository.createBadge(current, input),
        ),
      updateBadge: (badgeId, patch) =>
        commit((current) =>
          foodFlowRepository.updateBadge(current, badgeId, patch),
        ),
      createAvailability: (input) =>
        commitResult((current) =>
          foodFlowRepository.createAvailability(current, input),
        ),
      updateAvailability: (availabilityId, patch) =>
        commit((current) =>
          foodFlowRepository.updateAvailability(
            current,
            availabilityId,
            patch,
          ),
        ),
      updateSettings: (patch) =>
        commit((current) =>
          foodFlowRepository.updateSettings(current, patch),
        ),
      resetDemo: () => {
        const fresh = createDemoState();
        stateRef.current = fresh;
        setState(fresh);
        try {
          window.localStorage.removeItem(FOODFLOW_STORAGE_KEY);
        } catch {
          // Reset still succeeds in memory.
        }
      },
    }),
    [commit, commitResult],
  );

  const value = useMemo<FoodFlowContextValue>(
    () => ({ state, hydrated, actions, ...actions }),
    [actions, hydrated, state],
  );

  return (
    <FoodFlowContext.Provider value={value}>
      {children}
    </FoodFlowContext.Provider>
  );
}

export function useFoodFlow(): FoodFlowContextValue {
  const context = useContext(FoodFlowContext);
  if (!context) {
    throw new Error("useFoodFlow must be used within FoodFlowProvider.");
  }
  return context;
}
