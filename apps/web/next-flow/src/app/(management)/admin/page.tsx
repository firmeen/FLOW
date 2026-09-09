import { DurableAdminOverview } from "@/features/dashboard/durable-admin-overview";
import { OwnerStudioLauncher } from "@/features/dashboard/owner-studio-launcher";

export default function AdminPage() {
  return (
    <>
      <DurableAdminOverview />
      <OwnerStudioLauncher />
    </>
  );
}
