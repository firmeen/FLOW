import { describe, expect, it } from "vitest";

import {
  PERMISSIONS,
  isPermissionCode,
} from "@/modules/identity/server/permissions";

describe("P02/R05 permission catalog", () => {
  it("contains the canonical route and command permission codes", () => {
    expect(PERMISSIONS).toMatchObject({
      operationsStaffAccess: "operations.staff.access",
      operationsKitchenAccess: "operations.kitchen.access",
      operationsCashierAccess: "operations.cashier.access",
      managementAdminAccess: "management.admin.access",
      orderManage: "order.manage",
      serviceManage: "service.manage",
      kitchenManage: "kitchen.manage",
      merchantPaymentCollect: "merchant_payment.collect",
      merchantPaymentVoid: "merchant_payment.void",
      menuManage: "menu.manage",
      settingsManage: "settings.manage",
      memberManage: "member.manage",
      roleManage: "role.manage",
      auditView: "audit.view",
    });
  });

  it("rejects unknown runtime permission strings", () => {
    expect(isPermissionCode(PERMISSIONS.orderView)).toBe(true);
    expect(isPermissionCode("role.superuser")).toBe(false);
    expect(isPermissionCode(42)).toBe(false);
  });
});
