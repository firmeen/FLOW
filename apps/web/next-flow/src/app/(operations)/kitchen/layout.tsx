import type { ReactNode } from "react";

import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function KitchenLayout({ children }: { children: ReactNode }) {
  await requireRoutePermission("/kitchen");
  return children;
}
