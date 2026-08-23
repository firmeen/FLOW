import type { Metadata } from "next";

import { FlowLogo } from "@/components/shared/flow-logo";
import { Card } from "@/components/ui/card";
import {
  buildCustomerEntryPath,
  parseCustomerEntrySelector,
} from "@/modules/customer-capability/server/entry-selector";

export const metadata: Metadata = {
  title: "Customer Entry Unavailable",
};

export default async function CustomerEntryErrorPage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string | string[];
    restaurantSlug?: string | string[];
    tableCode?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawState = Array.isArray(params.state) ? params.state[0] : params.state;
  const rawRestaurantSlug = Array.isArray(params.restaurantSlug)
    ? params.restaurantSlug[0]
    : params.restaurantSlug;
  const rawTableCode = Array.isArray(params.tableCode)
    ? params.tableCode[0]
    : params.tableCode;
  const selector = parseCustomerEntrySelector(rawRestaurantSlug, rawTableCode);
  const unavailable = rawState === "unavailable";

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-lg">
        <a
          href="/"
          className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="FLOW home"
        >
          <FlowLogo variant="primary" preload className="w-48 sm:w-56" />
        </a>

        <Card className="mt-6 p-6 sm:p-8">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Customer entry
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold uppercase tracking-[0.04em] text-foreground">
            {unavailable ? "Entry temporarily unavailable" : "Entry could not be verified"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {unavailable
              ? "FLOW could not safely verify this table right now. No customer session was opened."
              : "This customer entry is not active or valid. Scan the table QR again or ask staff for help."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {selector && (
              <a
                href={buildCustomerEntryPath(selector)}
                className="inline-flex h-9 items-center justify-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Try again
              </a>
            )}
            <a
              href="/"
              className="inline-flex h-9 items-center justify-center border border-border px-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Return home
            </a>
          </div>
        </Card>
      </div>
    </main>
  );
}
