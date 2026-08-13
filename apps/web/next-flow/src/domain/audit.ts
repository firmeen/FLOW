import type { EntityId, ISODateTime } from "./shared";

export type AuditEntityType =
  | "ORDER"
  | "KITCHEN_TICKET"
  | "TABLE_SESSION"
  | "SERVICE_REQUEST"
  | "PAYMENT"
  | "MENU_ITEM"
  | "MODIFIER_GROUP"
  | "MENU_BADGE"
  | "MENU_AVAILABILITY"
  | "CATEGORY"
  | "SETTINGS";

export type AuditAction =
  | "ORDER_CREATED"
  | "ORDER_ACCEPTED"
  | "ORDER_CHANGED"
  | "ORDER_REJECTED"
  | "ORDER_CANCELLED"
  | "KITCHEN_STARTED"
  | "KITCHEN_READY"
  | "KITCHEN_PROBLEM"
  | "KITCHEN_REMAKE"
  | "ITEM_SERVED"
  | "SERVICE_REQUESTED"
  | "SERVICE_ACKNOWLEDGED"
  | "SERVICE_RESOLVED"
  | "BILL_REQUESTED"
  | "DISCOUNT_APPLIED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_VOIDED"
  | "TABLE_CLOSED"
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "MENU_CREATED"
  | "MENU_UPDATED"
  | "MENU_DUPLICATED"
  | "MENU_ARCHIVED"
  | "MENU_PUBLISHED"
  | "MENU_SOLD_OUT"
  | "MENU_HIDDEN"
  | "MODIFIER_CREATED"
  | "MODIFIER_UPDATED"
  | "BADGE_CREATED"
  | "BADGE_UPDATED"
  | "AVAILABILITY_CREATED"
  | "AVAILABILITY_UPDATED"
  | "SETTINGS_UPDATED";

export interface AuditEvent {
  id: EntityId;
  restaurantId: EntityId;
  branchId: EntityId;
  actorId: EntityId;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: EntityId;
  summary: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: ISODateTime;
}
