import {
  createCategory,
  reorderCategory,
  updateCategory,
  updateSettings,
} from "./category-repository";
import {
  markKitchenProblem,
  markKitchenTicketReady,
  markOrderServed,
  remakeKitchenTicket,
  startKitchenTicket,
} from "./kitchen-repository";
import {
  archiveMenuItem,
  createAvailability,
  createBadge,
  createMenuItem,
  createModifierGroup,
  duplicateMenuItem,
  publishMenuItem,
  setMenuItemStatus,
  updateAvailability,
  updateBadge,
  updateMenuItem,
  updateModifierGroup,
} from "./menu-repository";
import {
  acceptOrder,
  cancelOrder,
  changeOrder,
  rejectOrder,
  submitOrder,
} from "./order-repository";
import { recordPayment, voidPayment } from "./payment-repository";
import {
  acknowledgeService,
  requestService,
  resolveService,
} from "./service-repository";
import {
  addCartItem,
  clearCart,
  removeCartItem,
  setActiveRole,
  updateCartItem,
} from "./state-repository";
import type { FoodFlowRepository } from "./types";

export const foodFlowRepository = {
  setActiveRole,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  submitOrder,
  acceptOrder,
  rejectOrder,
  changeOrder,
  cancelOrder,
  startKitchenTicket,
  markKitchenTicketReady,
  markKitchenProblem,
  remakeKitchenTicket,
  markOrderServed,
  requestService,
  acknowledgeService,
  resolveService,
  recordPayment,
  voidPayment,
  createCategory,
  updateCategory,
  reorderCategory,
  createMenuItem,
  updateMenuItem,
  duplicateMenuItem,
  archiveMenuItem,
  publishMenuItem,
  setMenuItemStatus,
  createModifierGroup,
  updateModifierGroup,
  createBadge,
  updateBadge,
  createAvailability,
  updateAvailability,
  updateSettings,
} satisfies FoodFlowRepository;

export * from "./category-repository";
export * from "./helpers";
export * from "./kitchen-repository";
export * from "./menu-repository";
export * from "./order-repository";
export * from "./payment-repository";
export * from "./service-repository";
export * from "./state-repository";
export * from "./types";
