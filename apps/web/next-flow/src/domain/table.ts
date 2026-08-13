import type { EntityId, ISODateTime } from "./shared";

export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "WAITING"
  | "PREPARING"
  | "READY"
  | "BILL_REQUESTED"
  | "PAYMENT_PENDING";

export type TableSessionStatus =
  | "ACTIVE"
  | "BILL_REQUESTED"
  | "PAYMENT_PENDING"
  | "CLOSED";

export interface Table {
  id: EntityId;
  branchId: EntityId;
  code: string;
  label: string;
  seats: number;
  status: TableStatus;
  currentSessionId?: EntityId;
  qrCode: string;
  displayOrder: number;
  active: boolean;
}

export type RestaurantTable = Table;

export interface TableSession {
  id: EntityId;
  branchId: EntityId;
  tableId: EntityId;
  sessionNumber: string;
  status: TableSessionStatus;
  guestCount: number;
  openedAt: ISODateTime;
  closedAt?: ISODateTime;
  orderIds: EntityId[];
  paymentIds: EntityId[];
  customerToken: string;
  notes?: string;
}
