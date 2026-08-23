import { CashierApp } from "@/features/billing/cashier-app";
import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function CashierPage() {
  await requireRoutePermission("/cashier");
  return <CashierApp />;
}
