import "server-only";

import type { CurrentAccessOptions } from "./current-access";
import {
  withAuthorizedCurrentAccessTransaction,
  type AuthorizedTransactionCallback,
} from "./authorized-transaction";
import { PERMISSIONS, type PermissionCode } from "./permissions";
import type { PermissionScope } from "./authorize-permission";

export interface CommandPermissionRequirement {
  permission: PermissionCode;
  scope: PermissionScope;
}

export const PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS = {
  acceptOrder: { permission: PERMISSIONS.orderManage, scope: "branch" },
  rejectOrder: { permission: PERMISSIONS.orderManage, scope: "branch" },
  changeOrder: { permission: PERMISSIONS.orderManage, scope: "branch" },
  cancelOrder: { permission: PERMISSIONS.orderManage, scope: "branch" },
  startKitchenTicket: { permission: PERMISSIONS.kitchenManage, scope: "branch" },
  markKitchenTicketReady: { permission: PERMISSIONS.kitchenManage, scope: "branch" },
  markKitchenProblem: { permission: PERMISSIONS.kitchenManage, scope: "branch" },
  remakeKitchenTicket: { permission: PERMISSIONS.kitchenManage, scope: "branch" },
  markOrderServed: { permission: PERMISSIONS.kitchenManage, scope: "branch" },
  acknowledgeService: { permission: PERMISSIONS.serviceManage, scope: "branch" },
  resolveService: { permission: PERMISSIONS.serviceManage, scope: "branch" },
  recordPayment: { permission: PERMISSIONS.merchantPaymentCollect, scope: "branch" },
  voidPayment: { permission: PERMISSIONS.merchantPaymentVoid, scope: "branch" },
  createCategory: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  updateCategory: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  reorderCategory: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  createMenuItem: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  updateMenuItem: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  duplicateMenuItem: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  archiveMenuItem: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  publishMenuItem: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  setMenuItemStatus: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  createModifierGroup: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  updateModifierGroup: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  createBadge: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  updateBadge: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  createAvailability: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  updateAvailability: { permission: PERMISSIONS.menuManage, scope: "tenant" },
  updateSettings: { permission: PERMISSIONS.settingsManage, scope: "tenant" },
} as const satisfies Record<string, CommandPermissionRequirement>;

export type PrivilegedCommandName = keyof typeof PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS;

export function getCommandPermissionRequirement(
  command: PrivilegedCommandName,
): CommandPermissionRequirement {
  return PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS[command];
}

export async function withAuthorizedCommandTransaction<T>(
  command: PrivilegedCommandName,
  callback: AuthorizedTransactionCallback<T>,
  options: CurrentAccessOptions = {},
): Promise<T> {
  const requirement = getCommandPermissionRequirement(command);
  return withAuthorizedCurrentAccessTransaction(
    requirement.permission,
    requirement.scope,
    callback,
    options,
  );
}
