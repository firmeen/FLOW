import type { ReactNode } from "react";

import { requireCurrentAccessContext } from "@/modules/identity/server/current-access";

export default async function ManagementLayout({ children }: { children: ReactNode }) {
  await requireCurrentAccessContext({ requireBranch: true, nextPath: "/admin" });
  return children;
}
