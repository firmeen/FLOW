import "server-only";

import type { CustomerContext } from "@/modules/customer-capability/server/types";

import {
  toCustomerDataResult,
  type CustomerDataResult,
} from "./errors";
import { withCustomerDataTransaction } from "./transaction";
import type { CustomerStorefrontSnapshot } from "./types";

export async function loadCustomerStorefrontSnapshot(
  context: CustomerContext,
): Promise<CustomerDataResult<CustomerStorefrontSnapshot>> {
  try {
    const data = await withCustomerDataTransaction(context, async ({ repositories }) => {
      const [storefront, menu] = await Promise.all([
        repositories.storefront.getCurrent(),
        repositories.menu.listAvailable(),
      ]);
      return Object.freeze({ storefront, menu });
    });
    return { status: "ok", data };
  } catch (error) {
    return toCustomerDataResult<CustomerStorefrontSnapshot>(error);
  }
}
