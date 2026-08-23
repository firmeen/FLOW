import "server-only";

import { getCurrentCustomerContext } from "@/modules/customer-capability/server/current-context";

import {
  withCustomerDataTransaction,
  type CustomerDataTransactionScope,
} from "../transaction";
import { CustomerCommandError } from "./errors";

export interface CustomerCommandDependencies {
  readonly getCurrentCustomerContext: typeof getCurrentCustomerContext;
  readonly withCustomerDataTransaction: typeof withCustomerDataTransaction;
}

export const defaultCustomerCommandDependencies: CustomerCommandDependencies = Object.freeze({
  getCurrentCustomerContext,
  withCustomerDataTransaction,
});

export async function withCurrentCustomerCommandTransaction<T>(
  callback: (scope: CustomerDataTransactionScope) => Promise<T>,
  dependencies: CustomerCommandDependencies = defaultCustomerCommandDependencies,
): Promise<T> {
  let resolution: Awaited<ReturnType<typeof getCurrentCustomerContext>>;
  try {
    resolution = await dependencies.getCurrentCustomerContext();
  } catch (error) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_UNAVAILABLE", error);
  }

  switch (resolution.status) {
    case "resolved":
      return dependencies.withCustomerDataTransaction(resolution.context, callback);
    case "missing":
      throw new CustomerCommandError("CUSTOMER_COMMAND_CONTEXT_REQUIRED");
    case "invalid":
    case "expired":
    case "revoked":
      throw new CustomerCommandError("CUSTOMER_COMMAND_CONTEXT_REVOKED");
    case "unavailable":
      throw new CustomerCommandError("CUSTOMER_COMMAND_UNAVAILABLE");
  }
}
