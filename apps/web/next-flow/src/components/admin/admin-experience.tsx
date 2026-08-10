"use client";

import { FormEvent, useMemo, useState } from "react";
import { AppShell, StatusPill } from "@/components/shared/app-shell";
import { formatTHB, formatTime, orderItemTotal } from "@/lib/format";
import { useFoodFlow } from "@/store/foodflow-store";

export function AdminExperience() {
  const { state, addMenuItem, addCategory, setMenuStatus } = useFoodFlow();
  const [tab, setTab] = useState<"dashboard" | "menu" | "settings">("dashboard");
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const liveOrders = state.orders.filter((order) => ["PENDING_CONFIRMATION", "ACCEPTED", "PREPARING", "READY"].includes(order.status));
  const sales = state.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const activeTables = state.tables.filter((table) => table.status !== "AVAILABLE").length;
  const averagePrep = useMemo(() => {
    const prepared = state.orders.filter((order) => order.preparingAt && order.readyAt);
    if (!prepared.length) return 0;
    return Math.round(prepared.reduce((sum, order) => sum + (new Date(order.readyAt!).getTime() - new Date(order.preparingAt!).getTime()) / 60_000, 0) / prepared.length);
  }, [state.orders]);

  return (
    <AppShell title="Owner / Admin" eyebrow="Control room">
      <div className="mb-5 flex gap-2 overflow-x-auto">{(["dashboard", "menu", "settings"] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === item ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--muted)]"}`}>{item}</button>)}</div>

      {tab === "dashboard" && <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Sales today" value={formatTHB(sales)} hint={`${state.payments.length} completed payments`} />
          <Metric label="Orders" value={String(state.orders.length)} hint={`${liveOrders.length} active right now`} />
          <Metric label="Active tables" value={`${activeTables} / ${state.tables.length}`} hint="Live dining sessions" />
          <Metric label="Avg preparation" value={averagePrep ? `${averagePrep}m` : "—"} hint="Measured start → ready" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Orders requiring attention</h2><p className="text-sm text-[var(--muted)]">Operational work that is not finished yet.</p></div><StatusPill tone={liveOrders.length ? "amber" : "green"}>{liveOrders.length} live</StatusPill></div><div className="mt-4 space-y-2">{liveOrders.slice(0, 6).map((order) => { const table = state.tables.find((candidate) => candidate.id === order.tableId); const value = order.items.reduce((sum, item) => sum + orderItemTotal(item), 0); return <div key={order.id} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3"><div><div className="font-semibold">{table?.code} · {order.id}</div><div className="text-xs text-[var(--muted)]">{order.status.replaceAll("_", " ")}</div></div><span className="text-sm font-semibold">{formatTHB(value)}</span></div>; })}{!liveOrders.length && <p className="py-8 text-center text-sm text-[var(--muted)]">No active orders.</p>}</div></section>
          <section className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Recent activity</h2><div className="mt-4 space-y-3">{state.auditEvents.slice(0, 8).map((event) => <div key={event.id} className="border-l-2 border-emerald-200 pl-3"><div className="text-sm font-semibold">{event.action}</div><div className="text-xs text-[var(--muted)]">{event.entity} · {event.actor} · {formatTime(event.timestamp)}</div></div>)}</div></section>
        </div>
      </>}

      {tab === "menu" && <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Menu management</h2><p className="mt-1 text-sm text-[var(--muted)]">Create categories, publish items, and control availability without code changes.</p></div><div className="flex gap-2"><button onClick={() => setShowCategoryForm(true)} className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold">+ Category</button><button onClick={() => setShowMenuForm(true)} className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white">+ Menu item</button></div></div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{state.categories.slice().sort((a, b) => a.displayOrder - b.displayOrder).map((category) => <div key={category.id} className="shrink-0 rounded-xl border border-black/8 bg-white px-3 py-2 text-sm"><span className="font-semibold">{category.name}</span><span className="ml-2 text-xs text-[var(--muted)]">{state.menuItems.filter((item) => item.categoryId === category.id).length}</span></div>)}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{state.menuItems.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"><div className={`h-24 bg-gradient-to-br ${item.imageTone}`} /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-[var(--muted)]">{state.categories.find((category) => category.id === item.categoryId)?.name} · {formatTHB(item.price)}</p></div><StatusPill tone={item.status === "ACTIVE" ? "green" : item.status === "SOLD_OUT" ? "red" : "neutral"}>{item.status}</StatusPill></div><div className="mt-4 flex gap-2"><button onClick={() => setMenuStatus(item.id, item.status === "ACTIVE" ? "SOLD_OUT" : "ACTIVE")} className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold">{item.status === "ACTIVE" ? "Sold out" : "Activate"}</button><button onClick={() => setMenuStatus(item.id, "HIDDEN")} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold">Hide</button></div></div></article>)}</div>
      </section>}

      {tab === "settings" && <section className="max-w-2xl rounded-3xl border border-black/8 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold">Restaurant settings</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Setting label="Restaurant" value={state.restaurant.name} /><Setting label="Currency" value="THB" /><Setting label="Timezone" value={state.restaurant.timezone} /><Setting label="Opening hours" value={state.restaurant.openingHours} /><Setting label="Service charge" value={state.restaurant.serviceChargeEnabled ? `${state.restaurant.serviceChargePercent}%` : "Off"} /><Setting label="VAT" value={state.restaurant.vatEnabled ? `${state.restaurant.vatPercent}%` : "Off"} /></div><p className="mt-5 text-xs leading-5 text-[var(--muted)]">This MVP exposes settings as a readable operational configuration. A production backend can replace the local repository without redesigning these screens.</p></section>}

      {showMenuForm && <MenuForm onClose={() => setShowMenuForm(false)} onSubmit={(payload) => { addMenuItem(payload); setShowMenuForm(false); }} />}
      {showCategoryForm && <CategoryForm onClose={() => setShowCategoryForm(false)} onSubmit={(payload) => { addCategory(payload); setShowCategoryForm(false); }} />}
    </AppShell>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</div><div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div><div className="mt-2 text-xs text-[var(--muted)]">{hint}</div></div>; }
function Setting({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-stone-50 p-4"><div className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</div><div className="mt-1 text-sm font-semibold">{value}</div></div>; }

function MenuForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (payload: { name: string; nameTh?: string; description: string; price: number; categoryId: string }) => void }) {
  const { state } = useFoodFlow();
  const handle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    onSubmit({ name: String(form.get("name")), nameTh: String(form.get("nameTh") || "") || undefined, description: String(form.get("description")), price: Number(form.get("price")), categoryId: String(form.get("categoryId")) });
  };
  return <Modal title="Add menu item" onClose={onClose}><form onSubmit={handle} className="space-y-4"><Field name="name" label="Menu name" required /><Field name="nameTh" label="Thai name" /><Field name="description" label="Description" required /><div className="grid grid-cols-2 gap-3"><Field name="price" label="Base price (THB)" type="number" required /><label className="text-sm font-semibold">Category<select name="categoryId" required className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-normal outline-none">{state.categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><button className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-white">Publish menu</button></form></Modal>;
}

function CategoryForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (payload: { name: string; nameTh?: string }) => void }) {
  const handle = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ name: String(form.get("name")), nameTh: String(form.get("nameTh") || "") || undefined }); };
  return <Modal title="Add category" onClose={onClose}><form onSubmit={handle} className="space-y-4"><Field name="name" label="Category name" required /><Field name="nameTh" label="Thai name" /><button className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-white">Create category</button></form></Modal>;
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) { return <label className="block text-sm font-semibold">{label}<input name={name} type={type} required={required} className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5 font-normal outline-none focus:ring-2 focus:ring-[var(--brand)]" /></label>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-[80] grid place-items-end bg-black/40 sm:place-items-center" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><button onClick={onClose} className="text-2xl">×</button></div>{children}</div></div>; }
