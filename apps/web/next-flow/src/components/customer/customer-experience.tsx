"use client";

import { useMemo, useState } from "react";
import { AppShell, StatusPill } from "@/components/shared/app-shell";
import { formatTHB, formatTime, orderItemTotal } from "@/lib/format";
import { useFoodFlow } from "@/store/foodflow-store";
import type { CartDraftItem, MenuItem, OrderItemModifier } from "@/domain/types";

const customerStatus: Record<string, { label: string; tone: "neutral" | "green" | "amber" | "blue" | "red" }> = {
  PENDING_CONFIRMATION: { label: "Sent", tone: "amber" },
  ACCEPTED: { label: "Confirmed", tone: "blue" },
  PREPARING: { label: "Preparing", tone: "amber" },
  READY: { label: "Coming to table", tone: "green" },
  SERVED: { label: "Served", tone: "green" },
  REJECTED: { label: "Needs attention", tone: "red" },
};

function isAvailableToday(item: MenuItem) {
  if (item.availability.type !== "DAYS") return true;
  return item.availability.days?.includes(new Date().getDay()) ?? true;
}

export function CustomerExperience({ tableCode }: { tableCode: string }) {
  const { state, createOrder, requestService } = useFoodFlow();
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartDraftItem[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const table = state.tables.find((candidate) => candidate.code.toUpperCase() === tableCode.toUpperCase()) ?? state.tables[4];
  const session = state.sessions.find((candidate) => candidate.tableId === table.id && candidate.status === "OPEN");
  const sessionOrders = session ? state.orders.filter((order) => order.sessionId === session.id) : [];
  const visibleMenu = state.menuItems.filter((item) => {
    const matchesCategory = category === "all" || item.categoryId === category;
    const matchesSearch = `${item.name} ${item.nameTh ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch && item.status !== "HIDDEN" && item.status !== "DRAFT";
  });

  const cartTotal = useMemo(() => cart.reduce((sum, draft) => {
    const menu = state.menuItems.find((item) => item.id === draft.menuItemId);
    const modifiers = draft.modifiers.reduce((subtotal, modifier) => subtotal + modifier.priceDelta, 0);
    return sum + ((draft.priceOverride ?? menu?.price ?? 0) + modifiers) * draft.quantity;
  }, 0), [cart, state.menuItems]);

  const submit = () => {
    const orderId = createOrder(table.code, cart);
    if (!orderId) return;
    setCart([]);
    setShowCart(false);
    setLastOrderId(orderId);
    setShowSession(true);
    setNotice(`Order ${orderId} sent to the restaurant.`);
  };

  const service = (type: "CALL_STAFF" | "REQUEST_BILL") => {
    requestService(table.code, type);
    setNotice(type === "REQUEST_BILL" ? "Bill requested. A cashier will prepare your bill." : "Staff has been called to your table.");
  };

  return (
    <AppShell title={`Table ${table.code}`} eyebrow="Customer · Dine-in">
      <div className="mx-auto max-w-5xl pb-24">
        <section className="mb-6 overflow-hidden rounded-3xl bg-[var(--brand)] p-5 text-white shadow-[0_16px_50px_rgba(15,75,59,0.18)] sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"><span className="inline-block size-2 rounded-full bg-emerald-300" /> Open now</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Welcome to {state.restaurant.name}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50/80">Order from your table, follow every update, and request service without waiting to catch someone&apos;s attention.</p>
            </div>
            <div className="flex gap-2"><button onClick={() => service("CALL_STAFF")} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15">Call staff</button><button onClick={() => setShowSession(true)} className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[var(--brand)]">Current order</button></div>
          </div>
        </section>

        {notice && <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><span>{notice}</span><button className="font-bold" onClick={() => setNotice(null)}>×</button></div>}

        <div className="sticky top-[65px] z-30 -mx-4 mb-5 border-y border-black/5 bg-[color:var(--canvas)]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
          <div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu" className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm outline-none ring-[var(--brand)] focus:ring-2" /><button onClick={() => setShowCart(true)} className="rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white">Cart · {formatTHB(cartTotal)}</button></div>
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1"><button onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${category === "all" ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--muted)]"}`}>All</button>{state.categories.filter((item) => item.active).slice().sort((a, b) => a.displayOrder - b.displayOrder).map((item) => <button key={item.id} onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${category === item.id ? "bg-[var(--brand)] text-white" : "bg-white text-[var(--muted)]"}`}>{item.name}</button>)}</div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleMenu.map((item) => {
            const soldOut = item.status === "SOLD_OUT" || !isAvailableToday(item);
            const badges = state.badges.filter((badge) => item.badgeIds.includes(badge.id));
            return <button key={item.id} disabled={soldOut} onClick={() => setSelected(item)} className="group overflow-hidden rounded-2xl border border-black/8 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"><div className={`relative h-36 bg-gradient-to-br ${item.imageTone}`}><div className="absolute inset-0 grid place-items-center text-5xl font-black text-black/10">{item.name.slice(0, 1)}</div><div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges.slice(0, 2).map((badge) => <span key={badge.id} className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--brand)] shadow-sm">{badge.label}</span>)}</div>{soldOut && <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-bold uppercase tracking-[0.22em] text-white">Sold out</div>}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold leading-5">{item.name}</h3><p className="mt-0.5 text-xs text-[var(--muted)]">{item.nameTh}</p></div><span className="font-semibold text-[var(--brand)]">{formatTHB(item.price)}</span></div><p className="mt-3 line-clamp-2 text-sm leading-5 text-[var(--muted)]">{item.description}</p></div></button>;
          })}
        </div>
      </div>

      {selected && <ProductDialog item={selected} onClose={() => setSelected(null)} onAdd={(drafts) => { setCart((current) => [...current, ...drafts]); setSelected(null); setNotice(`${selected.name} added to your order.`); }} />}

      {showCart && <div className="fixed inset-0 z-[70] flex items-end bg-black/35 sm:items-center sm:justify-center" onMouseDown={(event) => event.currentTarget === event.target && setShowCart(false)}><div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Table {table.code}</p><h2 className="text-2xl font-semibold">Review order</h2></div><button onClick={() => setShowCart(false)} className="text-2xl">×</button></div><div className="mt-5 space-y-3">{cart.length === 0 && <div className="rounded-2xl bg-stone-50 p-8 text-center text-sm text-[var(--muted)]">Your cart is empty.</div>}{cart.map((draft, index) => { const menu = state.menuItems.find((item) => item.id === draft.menuItemId); const line = ((draft.priceOverride ?? menu?.price ?? 0) + draft.modifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0)) * draft.quantity; return <div key={`${draft.menuItemId}-${index}`} className="rounded-2xl border border-black/8 p-4"><div className="flex justify-between gap-3"><div><div className="font-semibold">{draft.quantity}× {menu?.name}</div>{draft.modifiers.map((modifier) => <div key={modifier.choiceId} className="text-xs text-[var(--muted)]">{modifier.name}{modifier.priceDelta ? ` +${formatTHB(modifier.priceDelta)}` : ""}</div>)}{draft.notes && <div className="mt-1 text-xs text-amber-800">Note: {draft.notes}</div>}</div><div className="font-semibold">{formatTHB(line)}</div></div><button onClick={() => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="mt-3 text-xs font-semibold text-rose-700">Remove</button></div>; })}</div><div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4 text-lg font-semibold"><span>Total</span><span>{formatTHB(cartTotal)}</span></div><button disabled={!cart.length} onClick={submit} className="mt-4 w-full rounded-xl bg-[var(--brand)] px-4 py-3.5 font-semibold text-white disabled:opacity-40">Send order to restaurant</button></div></div>}

      {showSession && <div className="fixed inset-0 z-[70] flex items-end bg-black/35 sm:items-center sm:justify-center" onMouseDown={(event) => event.currentTarget === event.target && setShowSession(false)}><div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Live table session</p><h2 className="text-2xl font-semibold">Table {table.code}</h2></div><button onClick={() => setShowSession(false)} className="text-2xl">×</button></div>{lastOrderId && <p className="mt-2 text-sm text-[var(--muted)]">Latest submission: {lastOrderId}</p>}<div className="mt-5 space-y-3">{!sessionOrders.length && <div className="rounded-2xl bg-stone-50 p-8 text-center text-sm text-[var(--muted)]">No active orders yet.</div>}{sessionOrders.slice().reverse().map((order) => { const meta = customerStatus[order.status] ?? { label: order.status, tone: "neutral" as const }; return <div key={order.id} className="rounded-2xl border border-black/8 p-4"><div className="flex items-center justify-between gap-3"><div><div className="font-semibold">Order {order.id}</div><div className="text-xs text-[var(--muted)]">{formatTime(order.createdAt)}</div></div><StatusPill tone={meta.tone}>{meta.label}</StatusPill></div><div className="mt-3 space-y-1">{order.items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.quantity}× {item.name}</span><span>{formatTHB(orderItemTotal(item))}</span></div>)}</div>{order.rejectedReason && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{order.rejectedReason}</p>}</div>; })}</div><div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => { setShowSession(false); setCategory("all"); }} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold">Order more</button><button onClick={() => service("REQUEST_BILL")} className="rounded-xl bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white">Request bill</button></div></div></div>}
    </AppShell>
  );
}

function ProductDialog({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (drafts: CartDraftItem[]) => void }) {
  const { state } = useFoodFlow();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [modifiers, setModifiers] = useState<OrderItemModifier[]>([]);
  const [addDrink, setAddDrink] = useState(false);
  const groups = state.modifierGroups.filter((group) => item.modifierGroupIds.includes(group.id));
  const addOn = state.menuItems.find((menu) => item.addOnItemIds.includes(menu.id));
  const modifierTotal = modifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0);
  const total = (item.price + modifierTotal) * quantity + (addDrink && addOn ? 79 : 0);
  const requiredReady = groups.every((group) => !group.required || modifiers.some((modifier) => modifier.groupId === group.id));

  const choose = (groupId: string, choiceId: string) => {
    const group = state.modifierGroups.find((candidate) => candidate.id === groupId);
    const choice = group?.choices.find((candidate) => candidate.id === choiceId);
    if (!group || !choice) return;
    setModifiers((current) => [...current.filter((modifier) => modifier.groupId !== groupId), { groupId, choiceId, name: choice.name, priceDelta: choice.priceDelta }]);
  };

  const add = () => {
    const drafts: CartDraftItem[] = [{ menuItemId: item.id, quantity, modifiers, notes: notes.trim() || undefined }];
    if (addDrink && addOn) drafts.push({ menuItemId: addOn.id, quantity: 1, modifiers: [], priceOverride: 79 });
    onAdd(drafts);
  };

  return <div className="fixed inset-0 z-[80] flex items-end bg-black/40 sm:items-center sm:justify-center" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl"><div className={`h-48 bg-gradient-to-br ${item.imageTone}`} /><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">{item.name}</h2><p className="text-sm text-[var(--muted)]">{item.nameTh}</p></div><button onClick={onClose} className="text-2xl">×</button></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p><div className="mt-5 space-y-5">{groups.map((group) => <fieldset key={group.id}><legend className="text-sm font-semibold">{group.name}{group.required && " *"}</legend><div className="mt-2 space-y-2">{group.choices.map((choice) => { const checked = modifiers.some((modifier) => modifier.choiceId === choice.id); return <label key={choice.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${checked ? "border-[var(--brand)] bg-emerald-50" : "border-black/8"}`}><span className="flex items-center gap-3"><input type="radio" name={group.id} checked={checked} onChange={() => choose(group.id, choice.id)} />{choice.name}</span><span>{choice.priceDelta ? `+${formatTHB(choice.priceDelta)}` : "Free"}</span></label>; })}</div></fieldset>)}{addOn && <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/8 p-3 text-sm"><span className="flex items-center gap-3"><input type="checkbox" checked={addDrink} onChange={(event) => setAddDrink(event.target.checked)} />Add {addOn.name}</span><span>+{formatTHB(79)}</span></label>}<div><label className="text-sm font-semibold">Special request</label><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="No onion, sauce on the side…" className="mt-2 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]" /></div><div className="flex items-center justify-between"><span className="text-sm font-semibold">Quantity</span><div className="flex items-center rounded-xl border border-black/10"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4 py-2">−</button><span className="min-w-8 text-center text-sm font-semibold">{quantity}</span><button onClick={() => setQuantity((value) => value + 1)} className="px-4 py-2">+</button></div></div></div><button disabled={!requiredReady} onClick={add} className="mt-6 flex w-full items-center justify-between rounded-xl bg-[var(--brand)] px-4 py-3.5 font-semibold text-white disabled:opacity-40"><span>Add to order</span><span>{formatTHB(total)}</span></button></div></div></div>;
}
