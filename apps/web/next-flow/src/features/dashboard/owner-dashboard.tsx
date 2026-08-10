import {
  Activity,
  Banknote,
  ChefHat,
  CircleDollarSign,
  Clock3,
  ShoppingBag,
  Table2,
  TrendingUp,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { Badge, Card, EmptyState, MetricCard, SectionHeading, StatusPill } from "@/components/ui";
import type { FoodFlowState } from "@/domain";
import { formatTHB } from "@/lib/currency";
import { formatBangkokTime, formatCompactDuration, getElapsedMilliseconds } from "@/lib/date";

export function OwnerDashboard({ state, hydrated }: { state: FoodFlowState; hydrated: boolean }) {
  const bangkokDateKey = (timestamp: string | Date) => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
  const initialReference = state.orders[0]?.submittedAt ?? state.restaurant.createdAt;
  const todayKey = bangkokDateKey(hydrated ? new Date() : initialReference);
  const todayOrders = state.orders.filter((order) => bangkokDateKey(order.submittedAt) === todayKey);
  const operationalOrdersToday = todayOrders.filter((order) => order.status !== "DRAFT" && order.status !== "VOIDED");
  const recordedPayments = state.payments.filter((payment) => payment.status === "RECORDED" && bangkokDateKey(payment.recordedAt) === todayKey);
  const sales = recordedPayments.reduce((sum, payment) => sum + payment.total, 0);
  const activeTables = state.tables.filter((table) => table.status !== "AVAILABLE").length;
  const prepDurations = operationalOrdersToday
    .filter((order) => order.preparingAt && order.readyAt)
    .map((order) => getElapsedMilliseconds(order.preparingAt!, order.readyAt!));
  const averagePrep = prepDurations.length
    ? prepDurations.reduce((sum, duration) => sum + duration, 0) / prepDurations.length
    : null;
  const waiting = state.orders.filter((order) => order.status === "PENDING_CONFIRMATION");
  const cancelledOrders = operationalOrdersToday.filter((order) => order.status === "CANCELLED" || order.status === "REJECTED");
  const remakeTickets = state.kitchenTickets.filter((ticket) => ticket.remakeCount > 0 && bangkokDateKey(ticket.createdAt) === todayKey);

  const itemSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  operationalOrdersToday.filter((order) => !["REJECTED", "CANCELLED"].includes(order.status)).forEach((order) => {
    order.items.forEach((item) => {
      const current = itemSales.get(item.menuItemId) ?? { name: item.menuItemName, quantity: 0, revenue: 0 };
      itemSales.set(item.menuItemId, { ...current, quantity: current.quantity + item.quantity, revenue: current.revenue + item.lineTotal });
    });
  });
  const topItems = [...itemSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const paymentBreakdown = recordedPayments.reduce<Record<string, number>>((result, payment) => {
    result[payment.method] = (result[payment.method] ?? 0) + payment.total;
    return result;
  }, {});
  const paymentTotal = Object.values(paymentBreakdown).reduce((sum, amount) => sum + amount, 0);
  const activity = [...state.auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 8);

  return (
    <div>
      <SectionHeading
        eyebrow="Live operation"
        title="Today at Melbourne House"
        description="A concise view of what is moving, what is waiting, and what the restaurant has completed."
        action={<Badge tone="success" dot>Demo synced</Badge>}
      />

      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Sales today" value={formatTHB(sales)} helper="Recorded payments" icon={<CircleDollarSign className="size-5" />} />
        <MetricCard label="Orders today" value={operationalOrdersToday.length} helper={`${waiting.length} need confirmation`} icon={<ShoppingBag className="size-5" />} tone="blue" />
        <MetricCard label="Active tables" value={`${activeTables} / ${state.tables.length}`} helper={`${state.tables.length - activeTables} available`} icon={<Table2 className="size-5" />} tone="amber" />
        <MetricCard label="Avg preparation" value={averagePrep === null ? "--" : formatCompactDuration(averagePrep)} helper={averagePrep === null ? "No completed orders" : "Accepted to ready"} icon={<Clock3 className="size-5" />} tone="forest" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="font-semibold text-forest">Orders currently waiting</p><p className="mt-1 text-xs text-foreground/45">Confirmation queue across the floor</p></div><Badge tone={waiting.length ? "warning" : "success"}>{waiting.length}</Badge></div>
          <div className="mt-5">
            {waiting.length === 0 ? <EmptyState compact icon={<ChefHat className="size-5" />} title="Nothing waiting" description="All incoming orders are confirmed." /> : waiting.map((order, index) => {
              const table = state.tables.find((candidate) => candidate.id === order.tableId);
              return <div className={`flex items-center gap-4 py-3 ${index ? "border-t border-line" : ""}`} key={order.id}><span className="grid size-10 place-items-center rounded-md bg-[#fff2da] text-xs font-black text-[#825d19]">{table?.code}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-forest">Order {order.number}</p><p className="mt-0.5 truncate text-xs text-foreground/45">{order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(" / ")}</p></div><div className="text-right"><StatusPill tone="warning">Waiting</StatusPill><p className="mt-1 text-[10px] text-foreground/35">{formatBangkokTime(order.submittedAt)}</p></div></div>;
            })}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-md bg-forest-soft text-forest"><TrendingUp className="size-4" /></span><div><p className="font-semibold text-forest">Top selling items</p><p className="text-xs text-foreground/42">By quantity ordered</p></div></div>
          <ol className="mt-5 space-y-3">
            {topItems.map((item, index) => <li className="flex items-center gap-3" key={item.name}><span className="grid size-7 place-items-center rounded-full bg-surface-muted text-[10px] font-black text-sage">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-forest">{item.name}</p><p className="text-[10px] text-foreground/38">{item.quantity} sold</p></div><span className="text-xs font-bold text-forest">{formatTHB(item.revenue)}</span></li>)}
          </ol>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3"><Banknote className="size-5 text-sage" /><div><p className="font-semibold text-forest">Payment breakdown</p><p className="text-xs text-foreground/42">Recorded revenue by method</p></div></div>
          {paymentTotal === 0 ? <div className="mt-5"><EmptyState compact title="No payments yet" /></div> : <div className="mt-5 space-y-4">{Object.entries(paymentBreakdown).sort((a, b) => b[1] - a[1]).map(([method, amount]) => <div key={method}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-foreground/58">{method.replaceAll("_", " ")}</span><span className="font-bold text-forest">{formatTHB(amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-forest" style={{ width: `${Math.max(5, amount / paymentTotal * 100)}%` }} /></div></div>)}</div>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><XCircle className="size-5 text-status-red" /><div><p className="font-semibold text-forest">Cancelled orders</p><p className="text-xs text-foreground/42">Rejected or cancelled today</p></div></div><Badge tone={cancelledOrders.length ? "danger" : "neutral"}>{cancelledOrders.length}</Badge></div>
          {cancelledOrders.length === 0 ? <div className="mt-5"><EmptyState compact title="No cancelled orders" /></div> : <div className="mt-5 space-y-1">{cancelledOrders.map((order, index) => { const table = state.tables.find((candidate) => candidate.id === order.tableId); return <div className={`flex items-center gap-3 py-2.5 ${index ? "border-t border-line" : ""}`} key={order.id}><span className="grid size-8 place-items-center rounded-md bg-[#f8e9e7] text-[10px] font-black text-status-red">{table?.code}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-forest">{order.number}</p><p className="truncate text-[10px] text-foreground/42">{order.rejectionReason ?? order.status.toLocaleLowerCase()}</p></div><StatusPill tone="danger">{order.status.toLocaleLowerCase()}</StatusPill></div>; })}</div>}
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><RotateCcw className="size-5 text-status-amber" /><div><p className="font-semibold text-forest">Remake orders</p><p className="text-xs text-foreground/42">Kitchen remake activity today</p></div></div><Badge tone={remakeTickets.length ? "warning" : "neutral"}>{remakeTickets.length}</Badge></div>
          {remakeTickets.length === 0 ? <div className="mt-5"><EmptyState compact title="No remakes today" /></div> : <div className="mt-5 space-y-1">{remakeTickets.map((ticket, index) => <div className={`flex items-center gap-3 py-2.5 ${index ? "border-t border-line" : ""}`} key={ticket.id}><span className="grid size-8 place-items-center rounded-md bg-[#fff2da] text-[10px] font-black text-status-amber">{state.tables.find((table) => table.id === ticket.tableId)?.code}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-forest">{ticket.orderNumber}</p><p className="truncate text-[10px] text-foreground/42">{ticket.problemNote ?? "Returned to the kitchen"}</p></div><Badge tone="warning">{ticket.remakeCount}x</Badge></div>)}</div>}
        </Card>
      </div>

      <Card className="mt-5 p-5 sm:p-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Activity className="size-5 text-sage" /><div><p className="font-semibold text-forest">Recent activity</p><p className="text-xs text-foreground/42">Traceable operational events</p></div></div><Badge>{state.auditEvents.length}</Badge></div>
        <div className="mt-5 grid gap-x-6 lg:grid-cols-2">
          {activity.map((event, index) => <div className={`flex gap-3 py-2.5 ${index > 1 ? "border-t border-line" : ""}`} key={event.id}><span className="mt-1.5 size-2 shrink-0 rounded-full bg-sage" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-forest">{event.action.replaceAll("_", " ").toLocaleLowerCase()}</p><p className="mt-0.5 truncate text-[10px] text-foreground/40">{event.entityType} - {event.reason ?? event.entityId}</p></div><time className="shrink-0 text-[10px] text-foreground/35">{formatBangkokTime(event.timestamp)}</time></div>)}
        </div>
      </Card>
    </div>
  );
}
