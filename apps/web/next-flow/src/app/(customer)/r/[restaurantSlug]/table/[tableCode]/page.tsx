import { CustomerExperience } from "@/components/customer/customer-experience";

export default async function CustomerTablePage({ params }: { params: Promise<{ restaurantSlug: string; tableCode: string }> }) {
  const { tableCode } = await params;
  return <CustomerExperience tableCode={tableCode.toUpperCase()} />;
}
