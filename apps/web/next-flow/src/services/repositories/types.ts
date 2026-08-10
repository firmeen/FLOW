import type {
  CartItem,
  Category,
  DemoRole,
  FoodFlowState,
  MenuImageKey,
  MenuAvailability,
  MenuBadge,
  MenuItem,
  MenuItemStatus,
  ModifierGroup,
  RecordPaymentInput,
  RestaurantSettings,
  ServiceRequestType,
  SubmitOrderInput,
  SubmitOrderItemInput,
} from "@/domain";

export interface SubmitOrderResult {
  orderId: string;
  duplicate: boolean;
}

export interface RequestServiceResult {
  requestId: string;
  duplicate: boolean;
}

export interface RecordPaymentResult {
  paymentId: string;
  total: number;
}

export interface MutationResult<T> {
  state: FoodFlowState;
  value: T;
}

export interface CreateCategoryInput {
  id?: string;
  name: string;
  thaiName?: string;
  description?: string;
  coverImageUrl?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface CreateMenuItemInput {
  id?: string;
  name: string;
  thaiName?: string;
  description?: string;
  thaiDescription?: string;
  categoryId: string;
  imageUrl?: string;
  imageKey?: MenuImageKey;
  basePrice: number;
  preparationStation?: string;
  estimatedPreparationMinutes?: number;
  status?: MenuItemStatus;
  vegetarian?: boolean;
  badgeIds?: string[];
  modifierGroupIds?: string[];
  availabilityId?: string;
  displayOrder?: number;
}

export interface CreateModifierGroupInput {
  id?: string;
  name: string;
  thaiName?: string;
  kind?: ModifierGroup["kind"];
  required?: boolean;
  minimumSelections?: number;
  maximumSelections?: number;
  choices?: CreateModifierChoiceInput[];
  active?: boolean;
  displayOrder?: number;
}

export interface CreateModifierChoiceInput {
  id?: string;
  name: string;
  thaiName?: string;
  priceDelta: number;
  active?: boolean;
  displayOrder?: number;
}

export interface CreateBadgeInput {
  id?: string;
  name: string;
  color: string;
  icon?: string;
  active?: boolean;
}

export interface CreateAvailabilityInput {
  id?: string;
  name: string;
  type: MenuAvailability["type"];
  daysOfWeek?: MenuAvailability["daysOfWeek"];
  startTime?: string;
  endTime?: string;
  timezone?: string;
  active?: boolean;
}

export type MenuItemPatch = Partial<
  Omit<MenuItem, "id" | "restaurantId" | "createdAt">
>;
export type CategoryPatch = Partial<
  Omit<Category, "id" | "restaurantId" | "createdAt">
>;
export type ModifierGroupPatch = Partial<
  Omit<ModifierGroup, "id" | "restaurantId" | "createdAt" | "choices">
> & { choices?: CreateModifierChoiceInput[] };
export type BadgePatch = Partial<
  Omit<MenuBadge, "id" | "restaurantId" | "createdAt">
>;
export type AvailabilityPatch = Partial<Omit<MenuAvailability, "id">>;
export type SettingsPatch = Partial<
  Omit<RestaurantSettings, "id" | "restaurantId" | "branchId" | "updatedAt">
>;

export interface FoodFlowRepository {
  setActiveRole(state: FoodFlowState, role: DemoRole): FoodFlowState;
  addCartItem(
    state: FoodFlowState,
    tableId: string,
    item: Omit<CartItem, "id">,
  ): FoodFlowState;
  updateCartItem(
    state: FoodFlowState,
    tableId: string,
    itemId: string,
    patch: Partial<Omit<CartItem, "id">>,
  ): FoodFlowState;
  removeCartItem(state: FoodFlowState, tableId: string, itemId: string): FoodFlowState;
  clearCart(state: FoodFlowState, tableId: string): FoodFlowState;
  submitOrder(
    state: FoodFlowState,
    input: SubmitOrderInput,
  ): MutationResult<SubmitOrderResult>;
  acceptOrder(state: FoodFlowState, orderId: string, actorId?: string): FoodFlowState;
  rejectOrder(
    state: FoodFlowState,
    orderId: string,
    reason: string,
    actorId?: string,
  ): FoodFlowState;
  changeOrder(
    state: FoodFlowState,
    orderId: string,
    items: SubmitOrderItemInput[],
    reason: string,
    actorId?: string,
  ): FoodFlowState;
  cancelOrder(
    state: FoodFlowState,
    orderId: string,
    reason: string,
    actorId?: string,
  ): FoodFlowState;
  startKitchenTicket(
    state: FoodFlowState,
    ticketId: string,
    actorId?: string,
  ): FoodFlowState;
  markKitchenTicketReady(
    state: FoodFlowState,
    ticketId: string,
    actorId?: string,
  ): FoodFlowState;
  markKitchenProblem(
    state: FoodFlowState,
    ticketId: string,
    note: string,
    actorId?: string,
  ): FoodFlowState;
  remakeKitchenTicket(
    state: FoodFlowState,
    ticketId: string,
    reason?: string,
    actorId?: string,
  ): FoodFlowState;
  markOrderServed(
    state: FoodFlowState,
    orderId: string,
    actorId?: string,
  ): FoodFlowState;
  requestService(
    state: FoodFlowState,
    tableId: string,
    type: ServiceRequestType,
    note?: string,
  ): MutationResult<RequestServiceResult>;
  acknowledgeService(
    state: FoodFlowState,
    requestId: string,
    actorId?: string,
  ): FoodFlowState;
  resolveService(
    state: FoodFlowState,
    requestId: string,
    actorId?: string,
  ): FoodFlowState;
  recordPayment(
    state: FoodFlowState,
    input: RecordPaymentInput,
  ): MutationResult<RecordPaymentResult>;
  voidPayment(
    state: FoodFlowState,
    paymentId: string,
    reason: string,
    staffId: string,
  ): FoodFlowState;
  createCategory(
    state: FoodFlowState,
    input: CreateCategoryInput,
    actorId?: string,
  ): MutationResult<string>;
  updateCategory(
    state: FoodFlowState,
    categoryId: string,
    patch: CategoryPatch,
    actorId?: string,
  ): FoodFlowState;
  reorderCategory(
    state: FoodFlowState,
    categoryId: string,
    direction: "UP" | "DOWN",
    actorId?: string,
  ): FoodFlowState;
  createMenuItem(
    state: FoodFlowState,
    input: CreateMenuItemInput,
    actorId?: string,
  ): MutationResult<string>;
  updateMenuItem(
    state: FoodFlowState,
    itemId: string,
    patch: MenuItemPatch,
    actorId?: string,
  ): FoodFlowState;
  duplicateMenuItem(
    state: FoodFlowState,
    itemId: string,
    actorId?: string,
  ): MutationResult<string>;
  archiveMenuItem(
    state: FoodFlowState,
    itemId: string,
    actorId?: string,
  ): FoodFlowState;
  publishMenuItem(
    state: FoodFlowState,
    itemId: string,
    actorId?: string,
  ): FoodFlowState;
  setMenuItemStatus(
    state: FoodFlowState,
    itemId: string,
    status: MenuItemStatus,
    actorId?: string,
    reason?: string,
  ): FoodFlowState;
  createModifierGroup(
    state: FoodFlowState,
    input: CreateModifierGroupInput,
    actorId?: string,
  ): MutationResult<string>;
  updateModifierGroup(
    state: FoodFlowState,
    groupId: string,
    patch: ModifierGroupPatch,
    actorId?: string,
  ): FoodFlowState;
  createBadge(
    state: FoodFlowState,
    input: CreateBadgeInput,
    actorId?: string,
  ): MutationResult<string>;
  updateBadge(
    state: FoodFlowState,
    badgeId: string,
    patch: BadgePatch,
    actorId?: string,
  ): FoodFlowState;
  createAvailability(
    state: FoodFlowState,
    input: CreateAvailabilityInput,
    actorId?: string,
  ): MutationResult<string>;
  updateAvailability(
    state: FoodFlowState,
    availabilityId: string,
    patch: AvailabilityPatch,
    actorId?: string,
  ): FoodFlowState;
  updateSettings(
    state: FoodFlowState,
    patch: SettingsPatch,
    actorId?: string,
  ): FoodFlowState;
}
