import type { EntityId, ISODateTime } from "./shared";

export type KitchenTicketStatus =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PROBLEM"
  | "REMAKE"
  | "VOIDED";

export interface KitchenTicketItem {
  id: EntityId;
  orderItemId: EntityId;
  menuItemId: EntityId;
  menuItemName: string;
  quantity: number;
  modifiers: string[];
  specialRequest?: string;
}

export interface KitchenTicket {
  id: EntityId;
  orderId: EntityId;
  branchId: EntityId;
  tableId: EntityId;
  tableSessionId: EntityId;
  orderNumber: string;
  status: KitchenTicketStatus;
  station: string;
  items: KitchenTicketItem[];
  createdAt: ISODateTime;
  startedAt?: ISODateTime;
  readyAt?: ISODateTime;
  servedAt?: ISODateTime;
  problemNote?: string;
  remakeCount: number;
}
