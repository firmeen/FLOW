import type { ReactNode } from "react";

import { OwnerStudioLauncher } from "@/features/dashboard/owner-studio-launcher";
import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRoutePermission("/admin");
  return (
    <>
      {children}
      <OwnerStudioLauncher />
    </>
  );
}
