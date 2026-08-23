import { NextRequest, NextResponse } from "next/server";

import { issueCustomerCapability } from "@/modules/customer-capability/server/capability-codec";
import {
  buildCustomerEntryPath,
  parseCustomerEntrySelector,
} from "@/modules/customer-capability/server/entry-selector";
import { resolveCustomerEntry } from "@/modules/customer-capability/server/entry-resolver";
import { setCustomerCapabilityCookie } from "@/modules/customer-capability/server/transport";

export const runtime = "nodejs";

function entryErrorUrl(
  request: NextRequest,
  state: "invalid" | "unavailable",
  restaurantSlug?: string,
  tableCode?: string,
): URL {
  const url = new URL("/customer-entry-error", request.url);
  url.searchParams.set("state", state);
  if (restaurantSlug) url.searchParams.set("restaurantSlug", restaurantSlug);
  if (tableCode) url.searchParams.set("tableCode", tableCode);
  return url;
}

export async function GET(request: NextRequest) {
  const selector = parseCustomerEntrySelector(
    request.nextUrl.searchParams.get("restaurantSlug"),
    request.nextUrl.searchParams.get("tableCode"),
  );
  if (!selector) {
    return NextResponse.redirect(entryErrorUrl(request, "invalid"));
  }

  const resolution = await resolveCustomerEntry(
    selector.restaurantSlug,
    selector.tableCode,
  );
  if (resolution.status !== "resolved") {
    return NextResponse.redirect(
      entryErrorUrl(
        request,
        resolution.status === "unavailable" ? "unavailable" : "invalid",
        selector.restaurantSlug,
        selector.tableCode,
      ),
    );
  }

  try {
    const { token, claims } = issueCustomerCapability(resolution.entry);
    const response = NextResponse.redirect(
      new URL(buildCustomerEntryPath(selector), request.url),
    );
    setCustomerCapabilityCookie(response, token, claims.expiresAt);
    return response;
  } catch {
    return NextResponse.redirect(
      entryErrorUrl(
        request,
        "unavailable",
        selector.restaurantSlug,
        selector.tableCode,
      ),
    );
  }
}
