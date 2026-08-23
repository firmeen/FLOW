import "server-only";

export type CustomerCartStatus = "DRAFT" | "SUBMITTED" | "ABANDONED";
export type CustomerOrderStatus = "DRAFT";

export interface AddCustomerCartItemInput {
  readonly menuItemId: string;
  readonly quantity: number;
  readonly specialRequest?: string | null;
  readonly modifierChoiceIds?: readonly string[];
}

export interface CustomerCartModifierSnapshot {
  readonly id: string;
  readonly modifierGroupId: string;
  readonly modifierChoiceId: string;
  readonly modifierGroupName: string;
  readonly modifierChoiceName: string;
  readonly priceDeltaMinor: string;
}

export interface CustomerCartItemSnapshot {
  readonly id: string;
  readonly menuItemId: string;
  readonly menuItemName: string;
  readonly menuItemThaiName: string | null;
  readonly preparationStation: string;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly currency: string;
  readonly specialRequest: string | null;
  readonly modifiers: readonly CustomerCartModifierSnapshot[];
  readonly lineTotalMinor: string;
}

export interface CustomerCartAggregate {
  readonly id: string;
  readonly status: CustomerCartStatus;
  readonly tableId: string;
  readonly tableSessionId: string | null;
  readonly items: readonly CustomerCartItemSnapshot[];
  readonly subtotalMinor: string;
  readonly currency: string | null;
}

export interface PersistDraftOrderModifierInput {
  readonly modifierGroupId: string | null;
  readonly modifierChoiceId: string | null;
  readonly modifierGroupName: string;
  readonly modifierChoiceName: string;
  readonly priceDeltaMinor: string;
}

export interface PersistDraftOrderItemInput {
  readonly menuItemId: string | null;
  readonly menuItemName: string;
  readonly menuItemThaiName: string | null;
  readonly preparationStation: string;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly currency: string;
  readonly specialRequest?: string | null;
  readonly modifiers: readonly PersistDraftOrderModifierInput[];
}

export interface PersistDraftOrderInput {
  readonly sourceCartId?: string | null;
  readonly customerNote?: string | null;
  readonly items: readonly PersistDraftOrderItemInput[];
}

export interface CustomerOrderModifierSnapshot {
  readonly id: string;
  readonly modifierGroupId: string | null;
  readonly modifierChoiceId: string | null;
  readonly modifierGroupName: string;
  readonly modifierChoiceName: string;
  readonly priceDeltaMinor: string;
}

export interface CustomerOrderItemSnapshot {
  readonly id: string;
  readonly menuItemId: string | null;
  readonly menuItemName: string;
  readonly menuItemThaiName: string | null;
  readonly preparationStation: string;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly lineTotalMinor: string;
  readonly specialRequest: string | null;
  readonly modifiers: readonly CustomerOrderModifierSnapshot[];
}

export interface CustomerDraftOrderAggregate {
  readonly id: string;
  readonly sourceCartId: string | null;
  readonly orderNumber: string;
  readonly status: CustomerOrderStatus;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly customerNote: string | null;
  readonly tableId: string;
  readonly tableSessionId: string | null;
  readonly items: readonly CustomerOrderItemSnapshot[];
}
