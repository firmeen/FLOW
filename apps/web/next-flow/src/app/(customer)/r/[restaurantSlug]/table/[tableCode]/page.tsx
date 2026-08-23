import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { FLOW_BRAND_ASSETS } from "@/config/brand-assets";
import { CustomerExperience } from "@/features/customer/customer-experience";
import { getCurrentCustomerContext } from "@/modules/customer-capability/server/current-context";
import {
  buildCustomerExchangePath,
  parseCustomerEntrySelector,
} from "@/modules/customer-capability/server/entry-selector";

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

  return <CustomerExperience tableCode={resolution.context.tableCode} />;
}
