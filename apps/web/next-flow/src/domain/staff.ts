import type { EntityId, ISODateTime } from "./shared";

export type StaffRole = "OWNER" | "MANAGER" | "STAFF" | "KITCHEN" | "CASHIER";

export interface StaffUser {
  id: EntityId;
  branchId: EntityId;
  name: string;
  initials: string;
  role: StaffRole;
  active: boolean;
  createdAt: ISODateTime;
}
