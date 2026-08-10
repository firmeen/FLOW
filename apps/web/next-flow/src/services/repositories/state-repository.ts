import type { CartItem, DemoRole, FoodFlowState } from "@/domain";
import { createEntityId, now } from "./helpers";

export const setActiveRole = (
  state: FoodFlowState,
  role: DemoRole,
): FoodFlowState => ({
  ...state,
  activeRole: role,
  lastUpdatedAt: now(),
});

export const addCartItem = (
  state: FoodFlowState,
  tableId: string,
  item: Omit<CartItem, "id">,
): FoodFlowState => {
  const timestamp = now();
  const cart = state.carts[tableId] ?? {
    tableId,
    items: [],
    updatedAt: timestamp,
  };
  return {
    ...state,
    lastUpdatedAt: timestamp,
    carts: {
      ...state.carts,
      [tableId]: {
        ...cart,
        updatedAt: timestamp,
        items: [...cart.items, { ...item, id: createEntityId("cart-item") }],
      },
    },
  };
};

export const updateCartItem = (
  state: FoodFlowState,
  tableId: string,
  itemId: string,
  patch: Partial<Omit<CartItem, "id">>,
): FoodFlowState => {
  const cart = state.carts[tableId];
  if (!cart) return state;
  const timestamp = now();
  return {
    ...state,
    lastUpdatedAt: timestamp,
    carts: {
      ...state.carts,
      [tableId]: {
        ...cart,
        updatedAt: timestamp,
        items: cart.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...patch,
                quantity: Math.max(1, patch.quantity ?? item.quantity),
              }
            : item,
        ),
      },
    },
  };
};

export const removeCartItem = (
  state: FoodFlowState,
  tableId: string,
  itemId: string,
): FoodFlowState => {
  const cart = state.carts[tableId];
  if (!cart) return state;
  const timestamp = now();
  return {
    ...state,
    lastUpdatedAt: timestamp,
    carts: {
      ...state.carts,
      [tableId]: {
        ...cart,
        updatedAt: timestamp,
        items: cart.items.filter((item) => item.id !== itemId),
      },
    },
  };
};

export const clearCart = (
  state: FoodFlowState,
  tableId: string,
): FoodFlowState => {
  if (!state.carts[tableId]) return state;
  const carts = { ...state.carts };
  delete carts[tableId];
  return { ...state, lastUpdatedAt: now(), carts };
};

export const stateRepository = {
  setActiveRole,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};
