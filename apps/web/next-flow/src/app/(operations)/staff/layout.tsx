import type { ReactNode } from "react";

import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  await requireRoutePermission("/staff");
  return children;
}
