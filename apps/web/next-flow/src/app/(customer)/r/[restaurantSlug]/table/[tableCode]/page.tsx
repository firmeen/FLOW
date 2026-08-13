import { notFound } from "next/navigation";

import { CustomerExperience } from "@/features/customer/customer-experience";

export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: 12 }, (_, index) => ({
    restaurantSlug: "demo",
    tableCode: `T${String(index + 1).padStart(2, "0")}`,
  }));
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
