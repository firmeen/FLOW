import type { ReactNode } from "react";

import { requireCurrentAccessContext } from "@/modules/identity/server/current-access";

export default async function ManagementLayout({ children }: { children: ReactNode }) {
  await requireCurrentAccessContext({ requireBranch: false, nextPath: "/admin" });
  return children;
}
