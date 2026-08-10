import type { EntityId, ISODateTime } from "./shared";

export type ServiceRequestType = "CALL_STAFF" | "REQUEST_BILL";
export type ServiceRequestStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "CANCELLED";

export interface ServiceRequest {
  id: EntityId;
  branchId: EntityId;
  tableId: EntityId;
  tableSessionId: EntityId;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  note?: string;
  priority: "NORMAL" | "HIGH";
  requestedAt: ISODateTime;
  acknowledgedAt?: ISODateTime;
  acknowledgedBy?: EntityId;
  resolvedAt?: ISODateTime;
  resolvedBy?: EntityId;
}
