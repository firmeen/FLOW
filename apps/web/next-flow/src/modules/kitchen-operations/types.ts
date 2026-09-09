export type DurableKitchenOrderStatus = "ACCEPTED" | "PREPARING" | "READY";

export interface DurableKitchenOrderItem {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly quantity: number;
  readonly station: string;
  readonly specialRequest: string | null;
}

export interface DurableKitchenOrder {
  readonly id: string;
  readonly orderNumber: string;
  readonly tableLabel: string;
  readonly status: DurableKitchenOrderStatus;
  readonly priority: "NORMAL" | "URGENT";
  readonly submittedAt: string;
  readonly preparingAt: string | null;
  readonly readyAt: string | null;
  readonly elapsedAnchor: string;
  readonly items: readonly DurableKitchenOrderItem[];
}

export interface DurableKitchenQueue {
  readonly generatedAt: string;
  readonly orders: readonly DurableKitchenOrder[];
  readonly stations: readonly string[];
}

export type DurableKitchenAction = "START_PREPARING" | "MARK_READY" | "MARK_SERVED";
