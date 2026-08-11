import type { ReactNode } from "react";

import { requireInternalSession } from "@/lib/auth";

export default async function OperationsLayout({ children }: { children: ReactNode }) {
  await requireInternalSession();
  return children;
}
