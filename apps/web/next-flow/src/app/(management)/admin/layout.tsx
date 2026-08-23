import type { ReactNode } from "react";

import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRoutePermission("/admin");
  return children;
}
