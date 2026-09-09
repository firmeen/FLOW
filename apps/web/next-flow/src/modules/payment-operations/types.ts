export type MerchantPaymentMethod = "CASH" | "THAI_QR" | "CARD_TERMINAL" | "BANK_TRANSFER" | "OTHER";
export type MerchantDiscountType = "NONE" | "FIXED" | "PERCENT";

export interface CashierBillOrder {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: string;
  readonly subtotalMinor: number;
}

export interface CashierBill {
  readonly tableSessionId: string;
  readonly tableId: string;
  readonly tableLabel: string;
  readonly sessionNumber: string;
  readonly sessionStatus: string;
  readonly openedAt: string;
  readonly billRequested: boolean;
  readonly subtotalMinor: number;
  readonly currency: string;
  readonly orders: readonly CashierBillOrder[];
}

export interface MerchantPaymentView {
  readonly id: string;
  readonly reference: string;
  readonly tableLabel: string;
  readonly tableSessionId: string;
  readonly status: "RECORDED" | "VOIDED";
  readonly method: MerchantPaymentMethod;
  readonly currency: string;
  readonly subtotalMinor: number;
  readonly discountAmountMinor: number;
  readonly serviceChargeAmountMinor: number;
  readonly vatAmountMinor: number;
  readonly totalMinor: number;
  readonly recordedAt: string;
  readonly voidedAt: string | null;
  readonly voidReason: string | null;
}

export interface CashierSnapshot {
  readonly generatedAt: string;
  readonly branchSettings: {
    readonly currency: string;
    readonly serviceChargeEnabled: boolean;
    readonly serviceChargeBps: number;
    readonly vatEnabled: boolean;
    readonly vatBps: number;
  };
  readonly bills: readonly CashierBill[];
  readonly payments: readonly MerchantPaymentView[];
}

export interface RecordMerchantPaymentInput {
  readonly tableSessionId: string;
  readonly method: MerchantPaymentMethod;
  readonly discountType: MerchantDiscountType;
  readonly discountValueMinor?: number | null;
  readonly discountBps?: number | null;
  readonly discountReason?: string | null;
  readonly serviceChargeEnabled?: boolean;
  readonly vatEnabled?: boolean;
}
