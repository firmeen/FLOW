import "server-only";

import type { CustomerContext } from "@/modules/customer-capability/server/types";
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

export async function requireCurrentCustomerContext(
  dependencies: CustomerCommandDependencies = defaultCustomerCommandDependencies,
): Promise<CustomerContext> {
  let resolution: Awaited<ReturnType<typeof getCurrentCustomerContext>>;
  try {
    resolution = await dependencies.getCurrentCustomerContext();
  } catch (error) {
    throw new CustomerCommandError("CUSTOMER_COMMAND_UNAVAILABLE", error);
  }

  switch (resolution.status) {
    case "resolved":
      return resolution.context;
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

export function customerCommandDependenciesForScope(
  customerContext: CustomerContext,
  scope: CustomerDataTransactionScope,
): CustomerCommandDependencies {
  const reuseTransaction: typeof withCustomerDataTransaction = async <T>(
    _customerContext: CustomerContext,
    callback: (innerScope: CustomerDataTransactionScope) => Promise<T>,
  ): Promise<T> => callback(scope);

  return Object.freeze({
    getCurrentCustomerContext: async () => ({
      status: "resolved" as const,
      context: customerContext,
    }),
    withCustomerDataTransaction: reuseTransaction,
  });
}

export async function withCurrentCustomerCommandTransaction<T>(
  callback: (scope: CustomerDataTransactionScope) => Promise<T>,
  dependencies: CustomerCommandDependencies = defaultCustomerCommandDependencies,
): Promise<T> {
  const context = await requireCurrentCustomerContext(dependencies);
  return dependencies.withCustomerDataTransaction(context, callback);
}
