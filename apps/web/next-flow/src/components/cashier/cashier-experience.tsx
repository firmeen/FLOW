"use client";

import { useMemo, useState } from "react";
import { AppShell, StatusPill } from "@/components/shared/app-shell";
import { formatTHB, formatTime, orderItemTotal } from "@/lib/format";
import { useFoodFlow } from "@/store/foodflow-store";
import type { PaymentMethod } from "@/domain/types";

const methods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "THAI_QR", label: "Thai QR Payment" },
  { value: "CARD_TERMINAL", label: "External Card Terminal" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "OTHER", label: "Other" },
];

export function CashierExperience() {
  const { state, recordPayment } = useFoodFlow();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const billRequests = state.serviceRequests.filter((request) => request.type === "REQUEST_BILL" && request.status !== "RESOLVED");
  const selectedSession = state.sessions.find((session) => session.id === selectedSessionId);
  const orders = selectedSession ? state.orders.filter((order) => order.sessionId === selectedSession.id && !["REJECTED", "CANCELLED", "VOIDED"].includes(order.status)) : [];
  const subtotal = useMemo(() => orders.flatMap((order) => order.items).reduce((sum, item) => sum + orderItemTotal(item), 0), [orders]);
  const service = state.restaurant.serviceChargeEnabled ? subtotal * state.restaurant.serviceChargePercent / 100 : 0;
  const vatBase = subtotal + service;
  const vat = state.restaurant.vatEnabled ? vatBase * state.restaurant.vatPercent / 100 : 0;
  const total = subtotal + service + vat;

  const openForTable = (tableId: string) => {
    const session = state.sessions.find((candidate) => candidate.tableId === tableId && candidate.status === "OPEN");
    if (session) setSelectedSessionId(session.id);
  };

  return (
    <AppShell title="Cashier" eyebrow="Bills · Payments">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
        <section>
          <div className="mb-4"><h2 className="text-lg font-semibold">Bill requests</h2><p className="mt-1 text-sm text-[var(--muted)]">Tables waiting to close their dining session.</p></div>
          <div className="space-y-3">
            {billRequests.map((request) => {
              const table = state.tables.find((candidate) => candidate.id === request.tableId);
              const session = state.sessions.find((candidate) => candidate.tableId === request.tableId && candidate.status === "OPEN");
              const requestOrders = session ? state.orders.filter((candidate) => candidate.sessionId === session.id && !["REJECTED", "CANCELLED", "VOIDED"].includes(candidate.status)) : [];
              const amount = requestOrders.flatMap((order) => order.items).reduce((sum, item) => sum + orderItemTotal(item), 0);
              return <button key={request.id} onClick={() => openForTable(request.tableId)} className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-[var(--brand)] ${selectedSession?.tableId === request.tableId ? "border-[var(--brand)] ring-2 ring-emerald-100" : "border-black/8"}`}><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Table {table?.code}</p><h3 className="mt-1 text-lg font-semibold">{formatTHB(amount)}</h3><p className="mt-1 text-xs text-[var(--muted)]">{requestOrders.length} order{requestOrders.length === 1 ? "" : "s"}</p></div><StatusPill tone="red">Bill requested</StatusPill></div></button>;
            })}
            {!billRequests.length && <div className="rounded-2xl border border-dashed border-black/15 bg-white p-10 text-center text-sm text-[var(--muted)]">No tables are waiting for a bill.</div>}
          </div>

          <div className="mt-7"><h2 className="text-lg font-semibold">Recently paid</h2><div className="mt-3 space-y-2">{state.payments.slice(0, 5).map((payment) => <div key={payment.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm shadow-sm"><div><div className="font-semibold">{formatTHB(payment.amount)}</div><div className="text-xs text-[var(--muted)]">{payment.method.replaceAll("_", " ")}</div></div><span className="text-xs text-[var(--muted)]">{formatTime(payment.createdAt)}</span></div>)}</div></div>
        </section>

        <section className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
          {!selectedSession ? <div className="grid min-h-[420px] place-items-center text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-xl">฿</div><h2 className="mt-4 font-semibold">Select a bill request</h2><p className="mt-1 text-sm text-[var(--muted)]">The complete table session will appear here.</p></div></div> : <>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Combined table bill</p><h2 className="mt-1 text-2xl font-semibold">Table {state.tables.find((table) => table.id === selectedSession.tableId)?.code}</h2><p className="mt-1 text-xs text-[var(--muted)]">Session started {formatTime(selectedSession.openedAt)}</p></div><StatusPill tone="amber">Payment pending</StatusPill></div>
            <div className="mt-6 space-y-5">{orders.map((order) => <div key={order.id}><div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Order {order.id}</div><div className="space-y-2">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {item.name}</span><span>{formatTHB(orderItemTotal(item))}</span></div>)}</div></div>)}</div>
            <div className="mt-6 space-y-2 border-t border-black/8 pt-4 text-sm"><div className="flex justify-between"><span className="text-[var(--muted)]">Subtotal</span><span>{formatTHB(subtotal)}</span></div>{state.restaurant.serviceChargeEnabled && <div className="flex justify-between"><span className="text-[var(--muted)]">Service charge {state.restaurant.serviceChargePercent}%</span><span>{formatTHB(service)}</span></div>}{state.restaurant.vatEnabled && <div className="flex justify-between"><span className="text-[var(--muted)]">VAT {state.restaurant.vatPercent}%</span><span>{formatTHB(vat)}</span></div>}<div className="flex justify-between pt-2 text-xl font-semibold"><span>Total</span><span>{formatTHB(total)}</span></div></div>
            <div className="mt-6"><label className="text-sm font-semibold">Payment method</label><div className="mt-2 grid gap-2 sm:grid-cols-2">{methods.map((item) => <button key={item.value} onClick={() => setMethod(item.value)} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${method === item.value ? "border-[var(--brand)] bg-emerald-50 text-[var(--brand)]" : "border-black/8"}`}>{item.label}</button>)}</div></div>
            <button onClick={() => { recordPayment(selectedSession.id, method); setSelectedSessionId(null); }} className="mt-6 w-full rounded-xl bg-[var(--brand)] px-4 py-3.5 font-semibold text-white">Mark paid · {formatTHB(total)}</button>
          </>}
        </section>
      </div>
    </AppShell>
  );
}
