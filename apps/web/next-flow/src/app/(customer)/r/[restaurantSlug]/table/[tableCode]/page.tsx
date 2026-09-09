import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { FLOW_BRAND_ASSETS } from "@/config/brand-assets";
import { DurableCustomerExperience } from "@/features/customer/durable-customer-experience";
import { DurableCustomerServiceDock } from "@/features/customer/durable-customer-service-dock";
import { getCurrentCustomerContext } from "@/modules/customer-capability/server/current-context";
import {
  buildCustomerExchangePath,
  parseCustomerEntrySelector,
} from "@/modules/customer-capability/server/entry-selector";
import { loadCustomerStorefrontSnapshot } from "@/modules/customer-data/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantSlug: string; tableCode: string }>;
}): Promise<Metadata> {
  const { restaurantSlug, tableCode } = await params;
  const selector = parseCustomerEntrySelector(restaurantSlug, tableCode);
  if (!selector) return {};

  const title = `FoodFlow · ${selector.tableCode}`;
  const description = "Open the verified customer table experience with FoodFlow.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [FLOW_BRAND_ASSETS.openGraph],
    },
  };
}

export default async function CustomerTablePage(props: {
  params: Promise<{ restaurantSlug: string; tableCode: string }>;
}) {
  const { restaurantSlug, tableCode } = await props.params;
  const selector = parseCustomerEntrySelector(restaurantSlug, tableCode);
  if (!selector) notFound();

  const resolution = await getCurrentCustomerContext();
  if (
    resolution.status !== "resolved" ||
    resolution.context.restaurantSlug !== selector.restaurantSlug ||
    resolution.context.tableCode !== selector.tableCode
  ) {
    redirect(buildCustomerExchangePath(selector));
  }

  const snapshot = await loadCustomerStorefrontSnapshot(resolution.context);
  if (snapshot.status !== "ok") {
    const params = new URLSearchParams({
      state: snapshot.status === "unavailable" ? "unavailable" : "invalid",
      restaurantSlug: selector.restaurantSlug,
      tableCode: selector.tableCode,
    });
    redirect(`/customer-entry-error?${params.toString()}`);
  }

  return (
    <div
      data-flow-customer-data-source="database"
      data-flow-customer-runtime="durable"
      data-flow-restaurant={snapshot.data.storefront.restaurantId}
      data-flow-branch={snapshot.data.storefront.branchId}
    >
      <DurableCustomerExperience snapshot={snapshot.data} />
      <DurableCustomerServiceDock />
    </div>
  );
}
