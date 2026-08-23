import "server-only";

export const PERMISSIONS = {
  operationsStaffAccess: "operations.staff.access",
  operationsKitchenAccess: "operations.kitchen.access",
  operationsCashierAccess: "operations.cashier.access",
  managementAdminAccess: "management.admin.access",
  orderView: "order.view",
  orderManage: "order.manage",
  serviceView: "service.view",
  serviceManage: "service.manage",
  kitchenView: "kitchen.view",
  kitchenManage: "kitchen.manage",
  merchantPaymentView: "merchant_payment.view",
  merchantPaymentCollect: "merchant_payment.collect",
  merchantPaymentVoid: "merchant_payment.void",
  menuView: "menu.view",
  menuManage: "menu.manage",
  settingsView: "settings.view",
  settingsManage: "settings.manage",
  memberView: "member.view",
  memberInvite: "member.invite",
  memberManage: "member.manage",
  roleView: "role.view",
  roleManage: "role.manage",
  auditView: "audit.view",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const PERMISSION_CODES = new Set<string>(Object.values(PERMISSIONS));

export function isPermissionCode(value: unknown): value is PermissionCode {
  return typeof value === "string" && PERMISSION_CODES.has(value);
}
