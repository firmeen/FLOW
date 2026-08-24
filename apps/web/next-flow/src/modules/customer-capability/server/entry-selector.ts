import "server-only";

const RESTAURANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TABLE_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/;

export interface CustomerEntrySelector {
  restaurantSlug: string;
  tableCode: string;
}

export function parseCustomerEntrySelector(
  restaurantSlug: string | null | undefined,
  tableCode: string | null | undefined,
): CustomerEntrySelector | null {
  const slug = restaurantSlug?.trim().toLowerCase();
  const code = tableCode?.trim();

  if (!slug || slug.length > 80 || !RESTAURANT_SLUG_PATTERN.test(slug)) return null;
  if (!code || !TABLE_CODE_PATTERN.test(code)) return null;

  return { restaurantSlug: slug, tableCode: code };
}

export function parseCustomerEntrySearchParams(
  searchParams: URLSearchParams,
): CustomerEntrySelector | null {
  const restaurantSlugs = searchParams.getAll("restaurantSlug");
  const tableCodes = searchParams.getAll("tableCode");
  if (restaurantSlugs.length !== 1 || tableCodes.length !== 1) return null;
  return parseCustomerEntrySelector(restaurantSlugs[0], tableCodes[0]);
}

export function buildCustomerEntryPath(selector: CustomerEntrySelector): string {
  return `/r/${encodeURIComponent(selector.restaurantSlug)}/table/${encodeURIComponent(selector.tableCode)}`;
}

export function buildCustomerExchangePath(selector: CustomerEntrySelector): string {
  const params = new URLSearchParams({
    restaurantSlug: selector.restaurantSlug,
    tableCode: selector.tableCode,
  });
  return `/api/customer/entry?${params.toString()}`;
}
