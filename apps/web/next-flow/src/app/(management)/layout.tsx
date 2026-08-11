import type { ReactNode } from "react";

import { requireInternalSession } from "@/lib/auth";

export default async function ManagementLayout({ children }: { children: ReactNode }) {
  await requireInternalSession();
  return children;
}
