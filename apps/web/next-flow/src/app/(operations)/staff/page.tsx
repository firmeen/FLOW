import { StaffOperations } from "@/features/staff/staff-operations";
import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function StaffPage() {
  await requireRoutePermission("/staff");
  return <StaffOperations />;
}
