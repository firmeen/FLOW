import { NextRequest, NextResponse } from "next/server";

import { issueCustomerCapability } from "@/modules/customer-capability/server/capability-codec";
import {
  buildCustomerEntryPath,
  parseCustomerEntrySearchParams,
} from "@/modules/customer-capability/server/entry-selector";
import { resolveCustomerEntry } from "@/modules/customer-capability/server/entry-resolver";
import { setCustomerCapabilityCookie } from "@/modules/customer-capability/server/transport";

export const runtime = "nodejs";

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

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
  const selector = parseCustomerEntrySearchParams(request.nextUrl.searchParams);
  if (!selector) {
    return noStore(NextResponse.redirect(entryErrorUrl(request, "invalid")));
  }

  const resolution = await resolveCustomerEntry(
    selector.restaurantSlug,
    selector.tableCode,
  );
  if (resolution.status !== "resolved") {
    return noStore(
      NextResponse.redirect(
        entryErrorUrl(
          request,
          resolution.status === "unavailable" ? "unavailable" : "invalid",
          selector.restaurantSlug,
          selector.tableCode,
        ),
      ),
    );
  }

  try {
    const { token, claims } = issueCustomerCapability(resolution.entry);
    const response = NextResponse.redirect(
      new URL(buildCustomerEntryPath(selector), request.url),
    );
    setCustomerCapabilityCookie(response, token, claims.expiresAt);
    return noStore(response);
  } catch {
    return noStore(
      NextResponse.redirect(
        entryErrorUrl(
          request,
          "unavailable",
          selector.restaurantSlug,
          selector.tableCode,
        ),
      ),
    );
  }
}
