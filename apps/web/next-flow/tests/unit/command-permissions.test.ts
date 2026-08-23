import { describe, expect, it } from "vitest";

import {
  getCommandPermissionRequirement,
  PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS,
} from "@/modules/identity/server/command-permissions";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

describe("P02/R05 privileged command permission inventory", () => {
  it("maps high-risk state changes to independent command capabilities", () => {
    expect(getCommandPermissionRequirement("acceptOrder")).toEqual({
      permission: PERMISSIONS.orderManage,
      scope: "branch",
    });
    expect(getCommandPermissionRequirement("startKitchenTicket")).toEqual({
      permission: PERMISSIONS.kitchenManage,
      scope: "branch",
    });
    expect(getCommandPermissionRequirement("recordPayment")).toEqual({
      permission: PERMISSIONS.merchantPaymentCollect,
      scope: "branch",
    });
    expect(getCommandPermissionRequirement("voidPayment")).toEqual({
      permission: PERMISSIONS.merchantPaymentVoid,
      scope: "branch",
    });
    expect(getCommandPermissionRequirement("updateSettings")).toEqual({
      permission: PERMISSIONS.settingsManage,
      scope: "tenant",
    });
  });

  it("does not classify public customer submission commands as privileged internal authority", () => {
    expect(PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS).not.toHaveProperty("submitOrder");
    expect(PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS).not.toHaveProperty("requestService");
    expect(PRIVILEGED_COMMAND_PERMISSION_REQUIREMENTS).not.toHaveProperty("addCartItem");
  });
});
