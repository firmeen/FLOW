export type ServiceRequestType = "CALL_STAFF" | "REQUEST_BILL" | "GENERAL";
export type ServiceRequestStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";
export type ServiceRequestPriority = "NORMAL" | "HIGH";

export interface ServiceRequestView {
  readonly id: string;
  readonly type: ServiceRequestType;
  readonly status: ServiceRequestStatus;
  readonly priority: ServiceRequestPriority;
  readonly note: string | null;
  readonly tableId: string;
  readonly tableLabel: string;
  readonly tableSessionId: string;
  readonly requestedAt: string;
  readonly acknowledgedAt: string | null;
  readonly resolvedAt: string | null;
}

export interface FloorTableView {
  readonly id: string;
  readonly code: string;
  readonly label: string;
  readonly seats: number;
  readonly active: boolean;
  readonly session: null | {
    readonly id: string;
    readonly sessionNumber: string;
    readonly status: string;
    readonly guestCount: number;
    readonly openedAt: string;
  };
  readonly openServiceCount: number;
  readonly openOrderCount: number;
  readonly readyOrderCount: number;
}

export interface FloorSnapshot {
  readonly tables: readonly FloorTableView[];
  readonly generatedAt: string;
}
