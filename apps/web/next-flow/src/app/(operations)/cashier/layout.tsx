import type { ReactNode } from "react";

import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function CashierLayout({ children }: { children: ReactNode }) {
  await requireRoutePermission("/cashier");
  return children;
}
