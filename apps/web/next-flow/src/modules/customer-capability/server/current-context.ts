import "server-only";

import { readCustomerCapabilityCookie } from "./transport";
import type { CustomerContextResolution } from "./types";
import { validateCustomerCapability } from "./validate-customer-capability";

export async function getCurrentCustomerContext(): Promise<CustomerContextResolution> {
  const token = await readCustomerCapabilityCookie();
  if (!token) return { status: "missing" };
  return validateCustomerCapability(token);
}
