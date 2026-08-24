import "server-only";

import { parseCustomerEntrySelector } from "./entry-selector";
import { resolveCustomerEntryFromDatabase } from "./repository";
import type { CustomerEntryResolution } from "./types";

export async function resolveCustomerEntry(
  restaurantSlug: string | null | undefined,
  tableCode: string | null | undefined,
): Promise<CustomerEntryResolution> {
  const selector = parseCustomerEntrySelector(restaurantSlug, tableCode);
  if (!selector) return { status: "invalid" };

  try {
    const entry = await resolveCustomerEntryFromDatabase(
      selector.restaurantSlug,
      selector.tableCode,
    );
    return entry ? { status: "resolved", entry } : { status: "invalid" };
  } catch {
    return { status: "unavailable" };
  }
}
