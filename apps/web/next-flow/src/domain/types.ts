export type MenuStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "HIDDEN";
export type OrderStatus =
  | "DRAFT"
  | "PENDING_CONFIRMATION"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED"
  | "CHANGED"
  | "REMAKE"
  | "VOIDED";

export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "WAITING"
  | "PREPARING"
  | "READY"
  | "BILL_REQUESTED"
  | "PAYMENT_PENDING";

export type ServiceRequestType = "CALL_STAFF" | "REQUEST_BILL";
export type ServiceRequestStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
export type PaymentMethod = "CASH" | "THAI_QR" | "CARD_TERMINAL" | "BANK_TRANSFER" | "OTHER";

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  currency: "THB";
  timezone: "Asia/Bangkok";
  open: boolean;
  openingHours: string;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  vatEnabled: boolean;
  vatPercent: number;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
}

export interface RestaurantTable {
  id: string;
  code: string;
  seats: number;
  status: TableStatus;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameTh?: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface MenuBadge {
  id: string;
  label: string;
}

export interface ModifierChoice {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  choices: ModifierChoice[];
}

export interface MenuAvailability {
  type: "ALWAYS" | "DAYS" | "TIME";
  days?: number[];
  startTime?: string;
  endTime?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  nameTh?: string;
  description: string;
  price: number;
  imageTone: string;
  badgeIds: string[];
  modifierGroupIds: string[];
  addOnItemIds: string[];
  status: MenuStatus;
  preparationStation: "KITCHEN" | "BAR";
  estimatedPreparationMinutes: number;
  availability: MenuAvailability;
}

export interface OrderItemModifier {
  groupId: string;
  choiceId: string;
  name: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  basePrice: number;
  modifiers: OrderItemModifier[];
  notes?: string;
}

export interface Order {
  id: string;
  sessionId: string;
  tableId: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  servedAt?: string;
  rejectedReason?: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  openedAt: string;
  closedAt?: string;
  orderIds: string[];
  status: "OPEN" | "CLOSED";
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  tableId: string;
  status: "NEW" | "PREPARING" | "READY";
}

export interface ServiceRequest {
  id: string;
  tableId: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface Payment {
  id: string;
  sessionId: string;
  method: PaymentMethod;
  amount: number;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  roles: Array<"STAFF" | "KITCHEN" | "CASHIER" | "OWNER">;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  reason?: string;
}

export interface FoodFlowState {
  restaurant: Restaurant;
  branch: Branch;
  tables: RestaurantTable[];
  categories: MenuCategory[];
  badges: MenuBadge[];
  modifierGroups: ModifierGroup[];
  menuItems: MenuItem[];
  sessions: TableSession[];
  orders: Order[];
  serviceRequests: ServiceRequest[];
  payments: Payment[];
  auditEvents: AuditEvent[];
}

export interface CartDraftItem {
  menuItemId: string;
  quantity: number;
  modifiers: OrderItemModifier[];
  notes?: string;
  priceOverride?: number;
}
