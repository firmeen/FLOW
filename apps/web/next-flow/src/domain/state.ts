import type { AuditEvent } from "./audit";
import type { KitchenTicket } from "./kitchen";
import type { Category, MenuAvailability, MenuBadge, MenuItem, ModifierGroup } from "./menu";
import type { Cart, Order } from "./order";
import type { Payment } from "./payment";
import type { Branch, Restaurant } from "./restaurant";
import type { ServiceRequest } from "./service";
import type { RestaurantSettings } from "./settings";
import type { StaffUser } from "./staff";
import type { Table, TableSession } from "./table";

export type DemoRole = "CUSTOMER" | "STAFF" | "KITCHEN" | "CASHIER" | "OWNER";

export interface FoodFlowState {
  schemaVersion: 1;
  lastUpdatedAt: string;
  activeRole: DemoRole;
  restaurant: Restaurant;
  branches: Branch[];
  tables: Table[];
  tableSessions: TableSession[];
  categories: Category[];
  menuItems: MenuItem[];
  menuBadges: MenuBadge[];
  modifierGroups: ModifierGroup[];
  menuAvailabilities: MenuAvailability[];
  orders: Order[];
  kitchenTickets: KitchenTicket[];
  serviceRequests: ServiceRequest[];
  payments: Payment[];
  staffUsers: StaffUser[];
  auditEvents: AuditEvent[];
  settings: RestaurantSettings;
  carts: Record<string, Cart>;
}
