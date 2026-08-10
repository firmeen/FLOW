"use client";

import { AppShell, StatusPill } from "@/components/shared/app-shell";
import { minutesSince } from "@/lib/format";
import { useFoodFlow } from "@/store/foodflow-store";
import type { Order } from "@/domain/types";

export function KitchenExperience() {
  const { state, startOrder, readyOrder } = useFoodFlow();
  const columns: Array<{ key: "ACCEPTED" | "PREPARING" | "READY"; label: string; description: string }> = [
    { key: "ACCEPTED", label: "New", description: "Accepted and waiting to start" },
    { key: "PREPARING", label: "Preparing", description: "Currently being prepared" },
    { key: "READY", label: "Ready", description: "Waiting for service" },
  ];

  return (
    <AppShell title="Kitchen Display" eyebrow="Live production queue">
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const orders = state.orders.filter((order) => order.status === column.key).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          return (
            <section key={column.key} className="min-h-[60vh] rounded-3xl border border-black/8 bg-black/[0.025] p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <div><h2 className="text-lg font-semibold uppercase tracking-wide">{column.label}</h2><p className="text-xs text-[var(--muted)]">{column.description}</p></div>
                <span className="grid size-8 place-items-center rounded-full bg-white text-sm font-bold shadow-sm">{orders.length}</span>
              </div>
              <div className="space-y-3">
                {orders.map((order) => <KitchenTicketCard key={order.id} order={order} onStart={() => startOrder(order.id)} onReady={() => readyOrder(order.id)} />)}
                {!orders.length && <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-8 text-center text-sm text-[var(--muted)]">No tickets in {column.label.toLowerCase()}.</div>}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}

function KitchenTicketCard({ order, onStart, onReady }: { order: Order; onStart: () => void; onReady: () => void }) {
  const { state } = useFoodFlow();
  const table = state.tables.find((candidate) => candidate.id === order.tableId);
  const wait = minutesSince(order.createdAt);
  const urgency = wait >= 15 ? "red" : wait >= 8 ? "amber" : "neutral";
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">Table {table?.code}</p><h3 className="mt-1 text-xl font-semibold">{order.id}</h3></div>
        <StatusPill tone={urgency}>Wait {wait}m</StatusPill>
      </div>
      <div className="mt-4 space-y-3 border-y border-black/8 py-4">
        {order.items.map((item) => (
          <div key={item.id}>
            <div className="text-base font-semibold"><span className="mr-1 text-[var(--brand)]">{item.quantity}×</span>{item.name}</div>
            {item.modifiers.map((modifier) => <div key={modifier.choiceId} className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{modifier.name}</div>)}
            {item.notes && <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">NOTE · {item.notes}</div>}
          </div>
        ))}
      </div>
      {order.status === "ACCEPTED" && <button onClick={onStart} className="mt-4 w-full rounded-xl bg-[var(--ink)] px-4 py-3.5 text-base font-bold text-white">START</button>}
      {order.status === "PREPARING" && <button onClick={onReady} className="mt-4 w-full rounded-xl bg-[var(--brand)] px-4 py-3.5 text-base font-bold text-white">MARK READY</button>}
      {order.status === "READY" && <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800">Ready for staff pickup</div>}
    </article>
  );
}
