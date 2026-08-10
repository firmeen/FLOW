import type { EntityId, ISODateTime } from "./shared";

export type DiscountType = "NONE" | "FIXED" | "PERCENT";
export type PaymentMethod = "CASH" | "THAI_QR" | "CARD_TERMINAL" | "BANK_TRANSFER" | "OTHER";
export type PaymentStatus = "RECORDED" | "VOIDED";

export interface Discount {
  type: DiscountType;
  value: number;
  amount: number;
  reason?: string;
}

export interface Payment {
  id: EntityId;
  reference: string;
  restaurantId: EntityId;
  branchId: EntityId;
  tableId: EntityId;
  tableSessionId: EntityId;
  orderIds: EntityId[];
  method: PaymentMethod;
  status: PaymentStatus;
  currency: string;
  subtotal: number;
  discount: Discount;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  vatEnabled: boolean;
  vatPercent: number;
  vatAmount: number;
  total: number;
  recordedAt: ISODateTime;
  recordedBy: EntityId;
  voidedAt?: ISODateTime;
  voidedBy?: EntityId;
  voidReason?: string;
}

export interface RecordPaymentInput {
  tableSessionId: EntityId;
  method: PaymentMethod;
  recordedBy?: EntityId;
  discountType?: DiscountType;
  discountValue?: number;
  discountReason?: string;
  serviceChargeEnabled?: boolean;
  serviceChargePercent?: number;
  vatEnabled?: boolean;
  vatPercent?: number;
}
