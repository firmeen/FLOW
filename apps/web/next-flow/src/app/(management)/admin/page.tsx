import { AdminConsole } from "@/features/dashboard/admin-console";
import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function AdminPage() {
  await requireRoutePermission("/admin");
  return <AdminConsole />;
}
