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
export const OPERATIONAL_ORDER_DECISIONS = ["ACCEPT", "REJECT"] as const;
export const OPERATIONAL_ORDER_DECISION_SOURCE_STATUSES = [
  "PENDING_CONFIRMATION",
  "CHANGED",
] as const;
export const OPERATIONAL_ORDER_LIFECYCLE_ACTIONS = [
  "START_PREPARING",
  "MARK_READY",
  "MARK_SERVED",
] as const;
export const OPERATIONAL_ORDER_REJECTION_REASONS = [
  "ITEM_UNAVAILABLE",
  "STORE_CLOSING",
  "CAPACITY_LIMIT",
  "INVALID_ORDER",
  "OTHER",
] as const;
export const OPERATIONAL_ORDER_EXCEPTION_ACTIONS = ["AMEND", "CANCEL"] as const;
export const OPERATIONAL_ORDER_CANCELLATION_REASONS = [
  "STAFF_REQUEST",
  "CUSTOMER_REQUEST",
  "ITEM_UNAVAILABLE",
  "CAPACITY_LIMIT",
  "STORE_CLOSING",
  "DUPLICATE_ORDER",
  "OPERATIONAL_ERROR",
  "OTHER",
] as const;
export const OPERATIONAL_ORDER_CANCELLABLE_STATUSES = [
  "PENDING_CONFIRMATION",
  "CHANGED",
  "ACCEPTED",
  "PREPARING",
  "READY",
] as const;
export const OPERATIONAL_ORDER_AMENDMENT_CHANGE_CATEGORIES = [
  "CUSTOMER_NOTE",
  "ITEM_QUANTITY",
  "ITEM_SPECIAL_REQUEST",
  "ITEM_REMOVED",
  "MULTIPLE_FIELDS",
] as const;

export type OperationalOrderStatus = (typeof OPERATIONAL_ORDER_STATUSES)[number];
export type OperationalOrderSource = (typeof OPERATIONAL_ORDER_SOURCES)[number];
export type OperationalOrderingMode = (typeof OPERATIONAL_ORDERING_MODES)[number];
export type OperationalOrderDecision = (typeof OPERATIONAL_ORDER_DECISIONS)[number];
export type OperationalOrderDecisionSourceStatus =
  (typeof OPERATIONAL_ORDER_DECISION_SOURCE_STATUSES)[number];
export type OperationalOrderLifecycleAction =
  (typeof OPERATIONAL_ORDER_LIFECYCLE_ACTIONS)[number];
export type OperationalOrderRejectionReasonCode =
  (typeof OPERATIONAL_ORDER_REJECTION_REASONS)[number];
export type OperationalOrderExceptionAction =
  (typeof OPERATIONAL_ORDER_EXCEPTION_ACTIONS)[number];
export type OperationalOrderCancellationReasonCode =
  (typeof OPERATIONAL_ORDER_CANCELLATION_REASONS)[number];
export type OperationalOrderCancellableStatus =
  (typeof OPERATIONAL_ORDER_CANCELLABLE_STATUSES)[number];
export type OperationalOrderAmendmentChangeCategory =
  (typeof OPERATIONAL_ORDER_AMENDMENT_CHANGE_CATEGORIES)[number];

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

export type OperationalOrderDecisionCommand =
  | {
      readonly orderId: string;
      readonly decision: "ACCEPT";
      readonly reasonCode: null;
    }
  | {
      readonly orderId: string;
      readonly decision: "REJECT";
      readonly reasonCode: OperationalOrderRejectionReasonCode;
    };

export interface OperationalOrderDecisionResult {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly decision: OperationalOrderDecision;
  readonly fromStatus: OperationalOrderDecisionSourceStatus;
  readonly status: "ACCEPTED" | "REJECTED";
  readonly customerStatus: "CONFIRMED" | "REJECTED";
  readonly decidedAt: string;
  readonly reasonCode: OperationalOrderRejectionReasonCode | null;
}

export interface OperationalOrderLifecycleCommand {
  readonly orderId: string;
  readonly action: OperationalOrderLifecycleAction;
}

export interface OperationalOrderLifecycleTransitionSpec {
  readonly action: OperationalOrderLifecycleAction;
  readonly from: "ACCEPTED" | "PREPARING" | "READY";
  readonly to: "PREPARING" | "READY" | "SERVED";
  readonly customerStatus: "PREPARING" | "COMING_TO_TABLE" | "SERVED";
  readonly eventType: "ORDER_PREPARING" | "ORDER_READY" | "ORDER_SERVED";
  readonly timestampColumn: "preparing_at" | "ready_at" | "served_at";
}

export interface OperationalOrderLifecycleResult {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly action: OperationalOrderLifecycleAction;
  readonly fromStatus: "ACCEPTED" | "PREPARING" | "READY";
  readonly status: "PREPARING" | "READY" | "SERVED";
  readonly customerStatus: "PREPARING" | "COMING_TO_TABLE" | "SERVED";
  readonly transitionedAt: string;
}

export interface OperationalOrderItemAmendment {
  readonly itemId: string;
  readonly quantity?: number;
  readonly specialRequest?: string | null;
  readonly remove?: true;
}

export type OperationalOrderExceptionCommand =
  | {
      readonly orderId: string;
      readonly action: "AMEND";
      readonly customerNote?: string | null;
      readonly itemChanges: readonly OperationalOrderItemAmendment[];
    }
  | {
      readonly orderId: string;
      readonly action: "CANCEL";
      readonly reasonCode: OperationalOrderCancellationReasonCode;
    };

export interface OperationalOrderAmendmentResult {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly action: "AMEND";
  readonly fromStatus: "ACCEPTED";
  readonly status: "CHANGED";
  readonly customerStatus: "SENT";
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly changeCategory: OperationalOrderAmendmentChangeCategory;
  readonly changedAt: string;
}

export interface OperationalOrderCancellationResult {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly action: "CANCEL";
  readonly fromStatus: OperationalOrderCancellableStatus;
  readonly status: "CANCELLED";
  readonly customerStatus: "CANCELLED";
  readonly reasonCode: OperationalOrderCancellationReasonCode;
  readonly cancelledAt: string;
}

export type OperationalOrderExceptionResult =
  | OperationalOrderAmendmentResult
  | OperationalOrderCancellationResult;

export interface TrustedOperationalOrderContext {
  readonly actorId: string;
  readonly tenantId: string;
  readonly branchId: string;
}
