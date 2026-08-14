import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FLOW_BRAND_ASSETS } from "@/config/brand-assets";
import { CustomerExperience } from "@/features/customer/customer-experience";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, index) => ({
    restaurantSlug: "demo",
    tableCode: `T${String(index + 1).padStart(2, "0")}`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ restaurantSlug: string; tableCode: string }>;
}): Promise<Metadata> {
  const { restaurantSlug, tableCode } = await params;

  if (restaurantSlug !== "demo" || !/^T(0[1-9]|1[0-2])$/.test(tableCode)) {
    return {};
  }

  const title = `Melbourne House · ${tableCode}`;
  const description =
    "Browse the Melbourne House dine-in menu and follow your table order with FoodFlow.";

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

  if (restaurantSlug !== "demo" || !/^T(0[1-9]|1[0-2])$/.test(tableCode)) {
    notFound();
  }

  return <CustomerExperience tableCode={tableCode} />;
}
