"use client";

import Link from "next/link";
import { useFoodFlow } from "@/store/foodflow-store";

const experiences = [
  { href: "/r/melbourne-house/table/T05", title: "Customer · Table T05", description: "Browse menu, order, track status, request service", meta: "Mobile-first" },
  { href: "/staff", title: "Staff Operations", description: "Confirm orders, manage tables, serve ready items", meta: "Mobile / tablet" },
  { href: "/kitchen", title: "Kitchen Display", description: "Move tickets from new to preparing to ready", meta: "Tablet / landscape" },
  { href: "/cashier", title: "Cashier", description: "Review combined table bills and record payment", meta: "Tablet / desktop" },
  { href: "/admin", title: "Owner / Admin", description: "Dashboard, menu management and settings", meta: "Desktop-first" },
];

export function DemoLauncher() {
  const { state, resetDemo } = useFoodFlow();
  const activeTables = state.tables.filter((table) => table.status !== "AVAILABLE").length;
  const kitchenOrders = state.orders.filter((order) => ["ACCEPTED", "PREPARING", "READY"].includes(order.status)).length;
  const billRequests = state.serviceRequests.filter((request) => request.type === "REQUEST_BILL" && request.status !== "RESOLVED").length;
  const pending = state.orders.filter((order) => order.status === "PENDING_CONFIRMATION").length;

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[var(--brand)] text-lg font-black text-white shadow-lg">F</div>
            <div><div className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">FoodFlow</div><div className="text-sm text-[var(--muted)]">by FIMIN FLOW</div></div>
          </div>
          <button onClick={resetDemo} className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm">Reset demo state</button>
        </div>

        <section className="mt-10 grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold text-[var(--brand)]">Restaurant Operations Platform</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">One connected flow from table to kitchen to payment.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">FoodFlow keeps customer orders visible, actionable and traceable across staff, kitchen, service and checkout. This demo uses one shared local data repository, so actions in one role immediately affect the others.</p>
          </div>
          <div className="rounded-3xl bg-[var(--brand)] p-6 text-white shadow-[0_20px_60px_rgba(15,75,59,0.2)]">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">Demo restaurant</div>
            <div className="mt-2 text-2xl font-semibold">{state.restaurant.name}</div>
            <div className="mt-1 text-sm text-emerald-50/75">{state.restaurant.openingHours}</div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniMetric value={`${activeTables}/${state.tables.length}`} label="Active tables" />
              <MiniMetric value={String(pending)} label="New orders" />
              <MiniMetric value={String(kitchenOrders)} label="Kitchen orders" />
              <MiniMetric value={String(billRequests)} label="Bill requests" />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4"><h2 className="text-xl font-semibold">Choose an experience</h2><p className="mt-1 text-sm text-[var(--muted)]">Walk through the same restaurant operation from any role.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {experiences.map((item, index) => <Link key={item.href} href={item.href} className="group flex min-h-48 flex-col justify-between rounded-2xl border border-black/8 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"><div><div className="text-xs font-black text-[var(--brand)]">0{index + 1}</div><h3 className="mt-4 font-semibold leading-5">{item.title}</h3><p className="mt-2 text-sm leading-5 text-[var(--muted)]">{item.description}</p></div><div className="mt-5 flex items-center justify-between text-xs font-semibold text-[var(--muted)]"><span>{item.meta}</span><span className="text-[var(--brand)] transition group-hover:translate-x-1">Open →</span></div></Link>)}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-black/8 bg-white p-5 text-sm shadow-sm">
          <div className="font-semibold">Suggested live demo</div>
          <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[var(--muted)]"><span>Customer orders</span><span>→</span><span>Staff accepts</span><span>→</span><span>Kitchen starts + marks ready</span><span>→</span><span>Staff serves</span><span>→</span><span>Customer requests bill</span><span>→</span><span>Cashier marks paid</span><span>→</span><span>Owner dashboard updates</span></div>
        </section>
      </div>
    </main>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) { return <div className="rounded-2xl border border-white/12 bg-white/8 p-3"><div className="text-2xl font-semibold">{value}</div><div className="mt-1 text-[11px] uppercase tracking-wide text-emerald-100/75">{label}</div></div>; }
