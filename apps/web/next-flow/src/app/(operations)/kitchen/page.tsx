import { KitchenBoard } from "@/features/kitchen/kitchen-board";
import { requireRoutePermission } from "@/modules/identity/server/route-permissions";

export default async function KitchenPage() {
  await requireRoutePermission("/kitchen");
  return <KitchenBoard />;
}
