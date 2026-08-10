"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Settings,
  Table2,
  Utensils,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Card, EmptyState, SectionHeading, StatusPill, Tabs } from "@/components/ui";
import { formatTHB } from "@/lib/currency";
import { formatBangkokDateTime, formatBangkokTime } from "@/lib/date";
import { getStatusPresentation } from "@/lib/constants";
import { useFoodFlow } from "@/store";

import { MenuManagement } from "./menu-management";
import { OwnerDashboard } from "./owner-dashboard";
import { SettingsPanel } from "./settings-panel";

type AdminView = "dashboard" | "orders" | "tables" | "menu" | "activity" | "settings";

const validViews: AdminView[] = ["dashboard", "orders", "tables", "menu", "activity", "settings"];

export function AdminConsole() {
  const { state, hydrated } = useFoodFlow();
  const [view, setView] = useState<AdminView>("dashboard");
  const waitingCount = state.orders.filter((order) => order.status === "PENDING_CONFIRMATION").length;

  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.slice(1) as AdminView;
      if (validViews.includes(hash)) setView(hash);
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  function changeView(next: AdminView) {
    setView(next);
    window.history.replaceState(null, "", `#${next}`);
  }

  const navItems = [
    { label: "Dashboard", href: "/admin#dashboard", icon: LayoutDashboard, active: view === "dashboard" },
    { label: "Orders", href: "/admin#orders", icon: ClipboardList, active: view === "orders", badge: waitingCount || undefined },
    { label: "Tables", href: "/admin#tables", icon: Table2, active: view === "tables" },
    { label: "Menu", href: "/admin#menu", icon: Utensils, active: view === "menu" },
    { label: "Activity", href: "/admin#activity", icon: Activity, active: view === "activity" },
    { label: "Settings", href: "/admin#settings", icon: Settings, active: view === "settings" },
  ];

  return (
    <OperationalShell
      title="Owner control room"
      subtitle="Live restaurant visibility and configuration"
      role="Owner"
      currentRole="admin"
      navItems={navItems}
      headerActions={<Badge tone={hydrated ? "success" : "neutral"} dot>{hydrated ? "Live demo" : "Syncing"}</Badge>}
    >
      <div className="mx-auto max-w-7xl">
        <Tabs
          className="mb-7 lg:hidden"
          label="Owner sections"
          value={view}
          onChange={changeView}
          items={[
            { value: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
            { value: "orders", label: "Orders", count: waitingCount },
            { value: "tables", label: "Tables" },
            { value: "menu", label: "Menu" },
            { value: "activity", label: "Activity" },
            { value: "settings", label: "Settings" },
          ]}
        />
        {view === "dashboard" && <OwnerDashboard state={state} />}
        {view === "orders" && <OrdersView state={state} />}
        {view === "tables" && <TablesView state={state} />}
        {view === "menu" && <MenuManagement />}
        {view === "activity" && <ActivityView state={state} />}
        {view === "settings" && <SettingsPanel />}
      </div>
    </OperationalShell>
  );
}

function OrdersView({ state }: { state: ReturnType<typeof useFoodFlow>["state"] }) {
  return <div><SectionHeading eyebrow="Traceability" title="All orders" description="Every order in the demo state with its table, value, and current internal status." />{state.orders.length === 0 ? <div className="mt-6"><EmptyState title="No orders" /></div> : <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">{[...state.orders].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).map((order, index) => { const table = state.tables.find((candidate) => candidate.id === order.tableId); const tone = getStatusPresentation(order.status).tone; return <div className={`grid gap-3 px-4 py-4 sm:grid-cols-[90px_1fr_100px_150px] sm:items-center ${index ? "border-t border-line" : ""}`} key={order.id}><div><p className="text-sm font-bold text-forest">{order.number}</p><p className="text-[10px] text-foreground/38">{table?.code}</p></div><p className="truncate text-xs text-foreground/55">{order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(" / ")}</p><p className="text-sm font-bold text-forest">{formatTHB(order.subtotal)}</p><div className="flex items-center justify-between gap-2"><StatusPill tone={tone === "accent" ? "forest" : tone}>{getStatusPresentation(order.status).label}</StatusPill><span className="text-[10px] text-foreground/35">{formatBangkokTime(order.submittedAt)}</span></div></div>; })}</div>}</div>;
}

function TablesView({ state }: { state: ReturnType<typeof useFoodFlow>["state"] }) {
  return <div><SectionHeading eyebrow="Floor overview" title="Restaurant tables" description="Twelve scannable table states linked to their current dining sessions." /><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{state.tables.map((table) => { const session = table.currentSessionId ? state.tableSessions.find((candidate) => candidate.id === table.currentSessionId) : undefined; const orders = session ? session.orderIds.map((id) => state.orders.find((order) => order.id === id)).filter(Boolean) : []; const total = orders.reduce((sum, order) => sum + (order?.subtotal ?? 0), 0); const status = getStatusPresentation(table.status); return <Card className={`p-4 ${table.status === "READY" ? "border-[#73a789] ring-1 ring-[#73a789]" : ""}`} key={table.id}><div className="flex items-start justify-between"><span className="text-xl font-bold tracking-[-0.04em] text-forest">{table.code}</span><span className={`mt-1 size-2 rounded-full ${status.dotClassName}`} /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.08em] text-foreground/38">{status.label}</p>{session ? <><p className="mt-1 text-xs font-semibold text-forest">{orders.length} order{orders.length === 1 ? "" : "s"}</p><p className="mt-3 text-sm font-bold text-forest">{formatTHB(total)}</p></> : <p className="mt-1 text-xs text-foreground/35">Ready for guests</p>}</Card>; })}</div></div>;
}

function ActivityView({ state }: { state: ReturnType<typeof useFoodFlow>["state"] }) {
  const events = [...state.auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return <div><SectionHeading eyebrow="Audit trail" title="Recent activity" description="Important operational and management actions include their actor, entity, timestamp, and reason." action={<Badge>{events.length} events</Badge>} />{events.length === 0 ? <div className="mt-6"><EmptyState icon={<ListChecks className="size-5" />} title="No activity yet" /></div> : <div className="mt-6 overflow-hidden rounded-lg border border-line bg-white">{events.map((event, index) => <div className={`grid gap-3 px-4 py-4 sm:grid-cols-[44px_minmax(0,1fr)_160px_170px] sm:items-center ${index ? "border-t border-line" : ""}`} key={event.id}><span className="grid size-9 place-items-center rounded-md bg-forest-soft text-forest"><Activity className="size-4" /></span><div><p className="text-sm font-semibold text-forest">{event.summary}</p><p className="mt-1 text-[10px] text-foreground/38">{event.entityType} - {event.entityId}</p></div><div><p className="text-xs font-semibold text-foreground/58">{event.actorName}</p>{event.reason && <p className="mt-1 truncate text-[10px] italic text-status-amber">{event.reason}</p>}</div><time className="text-xs text-foreground/42">{formatBangkokDateTime(event.timestamp)}</time></div>)}</div>}</div>;
}
