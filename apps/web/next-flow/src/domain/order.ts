import type { EntityId, ISODateTime } from "./shared";

export type OrderStatus =
  | "DRAFT"
  | "PENDING_CONFIRMATION"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED"
  | "CHANGED"
  | "REMAKE"
  | "VOIDED";

export type CustomerOrderStatus =
  | "SENT"
  | "CONFIRMED"
  | "PREPARING"
  | "COMING_TO_TABLE"
  | "SERVED"
  | "REJECTED"
  | "CANCELLED";

export interface OrderItemModifier {
  id: EntityId;
  modifierGroupId: EntityId;
  modifierGroupName: string;
  modifierChoiceId: EntityId;
  modifierChoiceName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: EntityId;
  menuItemId: EntityId;
  menuItemName: string;
  menuItemThaiName?: string;
  quantity: number;
  unitPrice: number;
  modifiers: OrderItemModifier[];
  specialRequest?: string;
  lineTotal: number;
}

export interface Order {
  id: EntityId;
  number: string;
  restaurantId: EntityId;
  branchId: EntityId;
  tableId: EntityId;
  tableSessionId: EntityId;
  status: OrderStatus;
  customerStatus: CustomerOrderStatus;
  items: OrderItem[];
  subtotal: number;
  currency: string;
  customerNote?: string;
  submissionKey: string;
  submittedAt: ISODateTime;
  acceptedAt?: ISODateTime;
  preparingAt?: ISODateTime;
  readyAt?: ISODateTime;
  servedAt?: ISODateTime;
  paidAt?: ISODateTime;
  closedAt?: ISODateTime;
  rejectedAt?: ISODateTime;
  rejectionReason?: string;
  modifiedByStaff: boolean;
}

export interface CartItemSelection {
  modifierGroupId: EntityId;
  modifierChoiceId: EntityId;
}

export interface CartItem {
  id: EntityId;
  menuItemId: EntityId;
  quantity: number;
  modifiers: CartItemSelection[];
  specialRequest?: string;
}

export interface Cart {
  tableId: EntityId;
  items: CartItem[];
  updatedAt: ISODateTime;
}

export interface SubmitOrderItemInput {
  menuItemId: EntityId;
  quantity: number;
  modifiers?: CartItemSelection[];
  specialRequest?: string;
}

export interface SubmitOrderInput {
  tableId: EntityId;
  items: SubmitOrderItemInput[];
  submissionKey: string;
  customerNote?: string;
  orderId?: EntityId;
}
