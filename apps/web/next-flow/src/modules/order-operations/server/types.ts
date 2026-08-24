import "server-only";

export const OPERATIONAL_ORDER_STATUSES = [
  "PENDING_CONFIRMATION",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "SERVED",
  "PAYMENT_PENDING",
  "PAID",
  "CLOSED",
  "REJECTED",
  "CANCELLED",
  "CHANGED",
  "REMAKE",
  "VOIDED",
] as const;

export const DEFAULT_OPERATIONAL_ORDER_STATUSES = [
  "PENDING_CONFIRMATION",
  "CHANGED",
] as const satisfies readonly OperationalOrderStatus[];

export const OPERATIONAL_ORDER_SOURCES = ["CUSTOMER_WEB", "UNKNOWN"] as const;
export const OPERATIONAL_ORDERING_MODES = ["DINE_IN"] as const;

export type OperationalOrderStatus = (typeof OPERATIONAL_ORDER_STATUSES)[number];
export type OperationalOrderSource = (typeof OPERATIONAL_ORDER_SOURCES)[number];
export type OperationalOrderingMode = (typeof OPERATIONAL_ORDERING_MODES)[number];

export interface OperationalOrderQueueFilter {
  readonly statuses?: readonly OperationalOrderStatus[];
  readonly source?: OperationalOrderSource | null;
  readonly orderingMode?: OperationalOrderingMode | null;
  readonly submittedAfter?: string | null;
  readonly submittedBefore?: string | null;
  readonly limit?: number;
  readonly cursor?: string | null;
}

export interface OperationalOrderQueueItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: OperationalOrderStatus;
  readonly customerStatus: string | null;
  readonly source: OperationalOrderSource;
  readonly orderingMode: OperationalOrderingMode;
  readonly tableId: string;
  readonly tableLabel: string | null;
  readonly submittedAt: string;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly lineCount: number;
  readonly unitCount: number;
  readonly hasCustomerNote: boolean;
}

export interface OperationalOrderModifierDetail {
  readonly id: string;
  readonly modifierGroupId: string | null;
  readonly modifierGroupName: string;
  readonly modifierChoiceId: string | null;
  readonly modifierChoiceName: string;
  readonly priceDeltaMinor: string;
}

export interface OperationalOrderItemDetail {
  readonly id: string;
  readonly menuItemId: string | null;
  readonly menuItemName: string;
  readonly menuItemThaiName: string | null;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly lineTotalMinor: string;
  readonly specialRequest: string | null;
  readonly preparationStation: string;
  readonly modifiers: readonly OperationalOrderModifierDetail[];
}

export interface OperationalOrderDetail extends OperationalOrderQueueItem {
  readonly customerNote: string | null;
  readonly items: readonly OperationalOrderItemDetail[];
}

export interface OperationalOrderQueuePage {
  readonly orders: readonly OperationalOrderQueueItem[];
  readonly nextCursor: string | null;
  readonly incomingCount: number;
}

export interface OperationalOrderCursor {
  readonly v: 1;
  readonly submittedAt: string;
  readonly id: string;
}

export interface TrustedOperationalOrderContext {
  readonly actorId: string;
  readonly tenantId: string;
  readonly branchId: string;
}
