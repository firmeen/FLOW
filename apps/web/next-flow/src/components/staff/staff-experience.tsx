"use client";

import { useState } from "react";
import { AppShell, StatusPill } from "@/components/shared/app-shell";
import { formatTHB, minutesSince, orderItemTotal } from "@/lib/format";
import { useFoodFlow } from "@/store/foodflow-store";

export function StaffExperience() {
  const { state, acceptOrder, rejectOrder, serveOrder, acknowledgeRequest, resolveRequest, setMenuStatus } = useFoodFlow();
  const [tab, setTab] = useState<"orders" | "tables" | "service" | "ready" | "menu">("orders");
  const pending = state.orders.filter((order) => order.status === "PENDING_CONFIRMATION").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const ready = state.orders.filter((order) => order.status === "READY");
  const requests = state.serviceRequests.filter((request) => request.status !== "RESOLVED");

  return (
    <AppShell title="Staff Operations" eyebrow="Orders · Tables · Service">
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {(["orders", "tables", "service", "ready", "menu"] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === item ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--muted)]"}`}>
            {item}{item === "orders" && pending.length ? ` · ${pending.length}` : ""}{item === "ready" && ready.length ? ` · ${ready.length}` : ""}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <section>
          <SectionHeading title="Incoming orders" subtitle="Confirm customer orders before they enter the kitchen." />
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.map((order) => {
              const table = state.tables.find((candidate) => candidate.id === order.tableId);
              const wait = minutesSince(order.createdAt);
              return (
                <article key={order.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${wait >= 8 ? "border-rose-300" : wait >= 4 ? "border-amber-300" : "border-black/8"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Table {table?.code}</p><h3 className="mt-1 text-xl font-semibold">{order.id}</h3></div>
                    <StatusPill tone={wait >= 8 ? "red" : wait >= 4 ? "amber" : "neutral"}>Waiting {wait}m</StatusPill>
                  </div>
                  <div className="mt-4 space-y-2">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span><strong>{item.quantity}×</strong> {item.name}{item.notes && <span className="mt-1 block text-xs font-medium text-amber-800">Note: {item.notes}</span>}</span><span className="font-medium">{formatTHB(orderItemTotal(item))}</span></div>)}</div>
                  <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                    <button onClick={() => acceptOrder(order.id)} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white">Accept order</button>
                    <button onClick={() => { const reason = window.prompt("Reason for rejection?"); if (reason) rejectOrder(order.id, reason); }} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-rose-700">Reject</button>
                  </div>
                </article>
              );
            })}
            {!pending.length && <EmptyState title="All caught up" body="New customer orders will appear here automatically." />}
          </div>
        </section>
      )}

      {tab === "tables" && <TablesGrid />}

      {tab === "service" && (
        <section>
          <SectionHeading title="Service requests" subtitle="Keep response time visible and close the loop." />
          <div className="grid gap-3 lg:grid-cols-2">{requests.map((request) => { const table = state.tables.find((candidate) => candidate.id === request.tableId); return <div key={request.id} className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Table {table?.code}</p><h3 className="mt-1 font-semibold">{request.type === "REQUEST_BILL" ? "Bill requested" : "Staff requested"}</h3><p className="mt-1 text-xs text-[var(--muted)]">Waiting {minutesSince(request.createdAt)} minutes</p></div><StatusPill tone={request.status === "OPEN" ? "amber" : "blue"}>{request.status}</StatusPill></div><div className="mt-4 flex gap-2">{request.status === "OPEN" && <button onClick={() => acknowledgeRequest(request.id)} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white">Acknowledge</button>}<button onClick={() => resolveRequest(request.id)} className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold">Resolve</button></div></div>; })}{!requests.length && <EmptyState title="No service requests" body="Everything requiring staff attention has been resolved." />}</div>
        </section>
      )}

      {tab === "ready" && (
        <section>
          <SectionHeading title="Ready to serve" subtitle="Move prepared dishes to the table without losing time." />
          <div className="grid gap-3 lg:grid-cols-2">{ready.map((order) => { const table = state.tables.find((candidate) => candidate.id === order.tableId); return <div key={order.id} className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><div className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Table {table?.code}</p><h3 className="mt-1 text-lg font-semibold">{order.id}</h3></div><StatusPill tone="green">Ready {order.readyAt ? `${minutesSince(order.readyAt)}m` : "now"}</StatusPill></div><div className="mt-3 text-sm text-[var(--muted)]">{order.items.map((item) => <div key={item.id}>{item.quantity}× {item.name}</div>)}</div><button onClick={() => serveOrder(order.id)} className="mt-4 w-full rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white">Mark served</button></div>; })}{!ready.length && <EmptyState title="No ready items" body="Everything currently ready has been served." />}</div>
        </section>
      )}

      {tab === "menu" && (
        <section>
          <SectionHeading title="Menu availability" subtitle="Staff can mark items sold out without entering menu setup." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{state.menuItems.filter((item) => item.status !== "HIDDEN" && item.status !== "DRAFT").map((item) => <div key={item.id} className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-[var(--muted)]">{formatTHB(item.price)}</p></div><StatusPill tone={item.status === "ACTIVE" ? "green" : "red"}>{item.status}</StatusPill></div><button onClick={() => setMenuStatus(item.id, item.status === "ACTIVE" ? "SOLD_OUT" : "ACTIVE")} className="mt-4 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold">{item.status === "ACTIVE" ? "Mark sold out" : "Make available"}</button></div>)}</div>
        </section>
      )}
    </AppShell>
  );
}

function TablesGrid() {
  const { state } = useFoodFlow();
  return <section><SectionHeading title="Tables" subtitle="One glance at every active dining session." /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{state.tables.map((table) => { const session = state.sessions.find((candidate) => candidate.tableId === table.id && candidate.status === "OPEN"); const orders = session ? state.orders.filter((order) => order.sessionId === session.id) : []; const total = orders.flatMap((order) => order.items).reduce((sum, item) => sum + orderItemTotal(item), 0); const tone = table.status === "AVAILABLE" ? "green" : table.status === "READY" ? "blue" : table.status === "BILL_REQUESTED" ? "red" : "amber"; return <article key={table.id} className="rounded-2xl border border-black/8 bg-white p-4 shadow-sm"><div className="text-2xl font-semibold">{table.code}</div><div className="mt-2"><StatusPill tone={tone}>{table.status.replaceAll("_", " ")}</StatusPill></div><div className="mt-4 text-xs text-[var(--muted)]">{orders.length ? `${orders.length} order${orders.length > 1 ? "s" : ""} · ${formatTHB(total)}` : `${table.seats} seats`}</div></article>; })}</div></section>;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) { return <div className="mb-4"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p></div>; }
function EmptyState({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center"><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-[var(--muted)]">{body}</p></div>; }
