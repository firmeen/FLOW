"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  LoaderCircle,
  QrCode,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, Drawer, EmptyState, Modal, SectionHeading, StatusPill, Tabs } from "@/components/foodflow-ui";
import { formatTHB } from "@/lib/currency";
import { formatBangkokTime } from "@/lib/date";
import type {
  CashierBill,
  CashierSnapshot,
  MerchantDiscountType,
  MerchantPaymentMethod,
  MerchantPaymentView,
} from "@/modules/payment-operations/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };
type CashierTab = "bills" | "payments";

const paymentMethods: readonly { value: MerchantPaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "THAI_QR", label: "Thai QR", icon: QrCode },
  { value: "CARD_TERMINAL", label: "Card", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "Transfer", icon: Landmark },
  { value: "OTHER", label: "Other", icon: WalletCards },
];

function money(minor: number): string {
  return formatTHB(minor / 100);
}

function errorMessage(code: string): string {
  if (code === "PAYMENT_CONFLICT") return "This bill changed on another cashier screen. Refresh before continuing.";
  if (code === "PAYMENT_EMPTY_BILL") return "There are no billable orders in this table session.";
  if (code === "PAYMENT_FORBIDDEN") return "Your current role does not have permission for this payment action.";
  if (code === "PAYMENT_NOT_FOUND") return "This bill is no longer available.";
  return "The payment service is temporarily unavailable.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) throw new Error(body.ok ? "Payment request failed." : errorMessage(body.error.code));
  return body.data;
}

function calculatePreview(snapshot: CashierSnapshot, bill: CashierBill, input: {
  discountType: MerchantDiscountType;
  discountValue: number;
  serviceChargeEnabled: boolean;
  vatEnabled: boolean;
}) {
  const discountAmount = input.discountType === "FIXED"
    ? Math.min(bill.subtotalMinor, Math.round(input.discountValue * 100))
    : input.discountType === "PERCENT"
      ? Math.round(bill.subtotalMinor * Math.min(100, Math.max(0, input.discountValue)) / 100)
      : 0;
  const afterDiscount = Math.max(0, bill.subtotalMinor - discountAmount);
  const service = input.serviceChargeEnabled ? Math.round(afterDiscount * snapshot.branchSettings.serviceChargeBps / 10000) : 0;
  const vat = input.vatEnabled ? Math.round((afterDiscount + service) * snapshot.branchSettings.vatBps / 10000) : 0;
  return { discountAmount, service, vat, total: afterDiscount + service + vat };
}

export function DurableCashierWorkspace() {
  const [snapshot, setSnapshot] = useState<CashierSnapshot | null>(null);
  const [tab, setTab] = useState<CashierTab>("bills");
  const [selectedBill, setSelectedBill] = useState<CashierBill | null>(null);
  const [method, setMethod] = useState<MerchantPaymentMethod>("CASH");
  const [discountType, setDiscountType] = useState<MerchantDiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(false);
  const [vatEnabled, setVatEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [voidPayment, setVoidPayment] = useState<MerchantPaymentView | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/internal/payments", { cache: "no-store", credentials: "same-origin" });
      setSnapshot(await readApi<CashierSnapshot>(response));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Payment data is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function openBill(bill: CashierBill) {
    setSelectedBill(bill);
    setMethod("CASH");
    setDiscountType("NONE");
    setDiscountValue(0);
    setDiscountReason("");
    setServiceChargeEnabled(snapshot?.branchSettings.serviceChargeEnabled ?? false);
    setVatEnabled(snapshot?.branchSettings.vatEnabled ?? false);
    setError(null);
  }

  const preview = useMemo(() => snapshot && selectedBill ? calculatePreview(snapshot, selectedBill, { discountType, discountValue, serviceChargeEnabled, vatEnabled }) : null, [discountType, discountValue, selectedBill, serviceChargeEnabled, snapshot, vatEnabled]);

  async function collectPayment() {
    if (!snapshot || !selectedBill || !preview || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/internal/payments", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          tableSessionId: selectedBill.tableSessionId,
          method,
          discountType,
          discountValueMinor: discountType === "FIXED" ? Math.round(discountValue * 100) : null,
          discountBps: discountType === "PERCENT" ? Math.round(discountValue * 100) : null,
          discountReason: discountReason.trim() || null,
          serviceChargeEnabled,
          vatEnabled,
        }),
      });
      const payment = await readApi<MerchantPaymentView>(response);
      setSelectedBill(null);
      setNotice(`${payment.reference} recorded · ${money(payment.totalMinor)}`);
      setTab("payments");
      await load(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Payment could not be recorded.");
      await load(true);
    } finally {
      setSaving(false);
    }
  }

  async function confirmVoid() {
    if (!voidPayment || !voidReason.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/internal/payments/${voidPayment.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ reason: voidReason.trim() }),
      });
      await readApi(response);
      setNotice(`${voidPayment.reference} voided and returned to payment pending.`);
      setVoidPayment(null);
      setVoidReason("");
      await load(true);
    } catch (voidError) {
      setError(voidError instanceof Error ? voidError.message : "Payment could not be voided.");
    } finally {
      setSaving(false);
    }
  }

  const billRequests = snapshot?.bills.filter((bill) => bill.billRequested).length ?? 0;
  const totalOpen = snapshot?.bills.reduce((sum, bill) => sum + bill.subtotalMinor, 0) ?? 0;

  return (
    <OperationalShell
      title="Cashier"
      subtitle="Durable billing, manual payment capture and audit-safe voids"
      role="Cashier"
      currentRole="cashier"
      navItems={[
        { label: "Bills", href: "/cashier#bills", icon: ReceiptText, active: tab === "bills", badge: billRequests || undefined, onClick: () => setTab("bills") },
        { label: "Payments", href: "/cashier#payments", icon: CircleDollarSign, active: tab === "payments", onClick: () => setTab("payments") },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Durable ledger</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Front counter" title="Close every table with certainty" description="Bill from live order facts, apply explicit adjustments, and persist the payment trail server-side." />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Bill requests" value={billRequests.toString()} helper="Guest-requested checks" />
          <Metric label="Open bills" value={(snapshot?.bills.length ?? 0).toString()} helper="Active table sessions" />
          <Metric label="Open subtotal" value={money(totalOpen)} helper="Before adjustments" />
        </div>

        {(error || notice) && <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${error ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"}`}>{error ?? notice}</div>}

        <Tabs className="mt-6" label="Cashier workspace" value={tab} onChange={(value) => setTab(value as CashierTab)} items={[{ value: "bills", label: "Live bills", count: snapshot?.bills.length ?? 0 }, { value: "payments", label: "Payment ledger", count: snapshot?.payments.length ?? 0 }]} />

        {loading ? <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : tab === "bills" ? (
          snapshot?.bills.length ? <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{snapshot.bills.map((bill) => (
            <Card key={bill.tableSessionId} className={`group p-5 transition hover:-translate-y-0.5 hover:shadow-xl ${bill.billRequested ? "border-foreground/20" : ""}`}>
              <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{bill.billRequested ? "Bill requested" : "Open session"}</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{bill.tableLabel}</h2><p className="text-xs text-muted-foreground">{bill.sessionNumber} · {formatBangkokTime(bill.openedAt)}</p></div><Badge tone={bill.billRequested ? "warning" : "info"}>{bill.orders.length} orders</Badge></div>
              <div className="mt-5 flex items-end justify-between border-y border-border py-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Subtotal</p><p className="mt-1 text-xl font-bold tracking-[-0.03em]">{money(bill.subtotalMinor)}</p></div><ShieldCheck className="size-5 text-muted-foreground/40" /></div>
              <Button className="mt-4" fullWidth onClick={() => openBill(bill)}>Review & collect</Button>
            </Card>
          ))}</div> : <div className="mt-5"><EmptyState icon={<CheckCircle2 className="size-5" />} title="No open bills" description="Active table sessions with billable orders will appear here." /></div>
        ) : (
          snapshot?.payments.length ? <div className="mt-5 grid gap-2">{snapshot.payments.map((payment) => (
            <Card key={payment.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${payment.status === "VOIDED" ? "bg-destructive/10 text-destructive" : "bg-foreground text-background"}`}><BadgeDollarSign className="size-5" /></span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{payment.reference}</p><Badge tone={payment.status === "VOIDED" ? "danger" : "success"}>{payment.status.toLowerCase()}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{payment.tableLabel} · {payment.method.replaceAll("_", " ")} · {formatBangkokTime(payment.recordedAt)}</p></div>
              <p className="text-lg font-bold tracking-[-0.03em]">{money(payment.totalMinor)}</p>
              {payment.status === "RECORDED" && <Button variant="ghost" size="sm" onClick={() => { setVoidPayment(payment); setVoidReason(""); }}>Void</Button>}
            </Card>
          ))}</div> : <div className="mt-5"><EmptyState icon={<CircleDollarSign className="size-5" />} title="No payments yet" description="Recorded payments will remain visible here as the branch ledger." /></div>
        )}
      </div>

      {selectedBill && snapshot && preview && (
        <Drawer open onClose={() => setSelectedBill(null)} size="lg" title={`${selectedBill.tableLabel} · ${money(preview.total)}`} description={`${selectedBill.sessionNumber} · ${selectedBill.orders.length} orders`} footer={<><Button variant="outline" onClick={() => setSelectedBill(null)}>Cancel</Button><Button isLoading={saving} loadingText="Recording..." onClick={() => void collectPayment()} leftIcon={<CheckCircle2 className="size-4" />}>Record {money(preview.total)}</Button></>}>
          <div className="space-y-6">
            <section><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Order facts</p><div className="mt-2 divide-y divide-border rounded-2xl border border-border">{selectedBill.orders.map((order) => <div key={order.id} className="flex items-center justify-between gap-4 px-4 py-3"><div><p className="font-semibold">{order.orderNumber}</p><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{order.status.replaceAll("_", " ")}</p></div><p className="font-semibold">{money(order.subtotalMinor)}</p></div>)}</div></section>
            <section><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Payment method</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">{paymentMethods.map((option) => { const Icon = option.icon; return <button key={option.value} type="button" onClick={() => setMethod(option.value)} className={`rounded-xl border p-3 text-left transition ${method === option.value ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/30"}`}><Icon className="size-4" /><p className="mt-2 text-xs font-semibold">{option.label}</p></button>; })}</div></section>
            <section className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Discount<select value={discountType} onChange={(event) => { setDiscountType(event.target.value as MerchantDiscountType); setDiscountValue(0); }} className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 font-normal"><option value="NONE">No discount</option><option value="FIXED">Fixed amount</option><option value="PERCENT">Percent</option></select></label>{discountType !== "NONE" && <label className="text-xs font-semibold">{discountType === "FIXED" ? "Amount (THB)" : "Percent"}<input type="number" min="0" max={discountType === "PERCENT" ? 100 : undefined} value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 font-normal" /></label>}</section>
            {discountType !== "NONE" && <label className="block text-xs font-semibold">Adjustment reason<input value={discountReason} onChange={(event) => setDiscountReason(event.target.value)} placeholder="Optional operational note" className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 font-normal" /></label>}
            <section className="grid gap-2 sm:grid-cols-2"><Toggle checked={serviceChargeEnabled} onChange={setServiceChargeEnabled} label={`Service charge · ${(snapshot.branchSettings.serviceChargeBps / 100).toFixed(0)}%`} /><Toggle checked={vatEnabled} onChange={setVatEnabled} label={`VAT · ${(snapshot.branchSettings.vatBps / 100).toFixed(0)}%`} /></section>
            <section className="rounded-2xl bg-foreground p-5 text-background"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] opacity-60"><Sparkles className="size-3.5" /> Final total</div><div className="mt-4 space-y-2 text-sm"><Row label="Subtotal" value={money(selectedBill.subtotalMinor)} /><Row label="Discount" value={`− ${money(preview.discountAmount)}`} /><Row label="Service charge" value={money(preview.service)} /><Row label="VAT" value={money(preview.vat)} /><div className="mt-3 flex items-end justify-between border-t border-background/15 pt-4"><span className="font-semibold">Collect</span><span className="text-2xl font-bold tracking-[-0.05em]">{money(preview.total)}</span></div></div></section>
          </div>
        </Drawer>
      )}

      <Modal open={Boolean(voidPayment)} onClose={() => setVoidPayment(null)} title="Void payment" description="The payment remains in the ledger and the table returns to payment pending." footer={<><Button variant="outline" onClick={() => setVoidPayment(null)}>Cancel</Button><Button variant="danger" disabled={!voidReason.trim()} isLoading={saving} onClick={() => void confirmVoid()}>Void payment</Button></>}>
        <label className="text-sm font-semibold">Required reason<textarea value={voidReason} onChange={(event) => setVoidReason(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-border bg-card p-3 font-normal" placeholder="Why is this payment being voided?" /></label>
      </Modal>
    </OperationalShell>
  );
}

function Metric({ label, value, helper }: { readonly label: string; readonly value: string; readonly helper: string }) {
  return <Card className="p-4"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{helper}</p></Card>;
}
function Row({ label, value }: { readonly label: string; readonly value: string }) { return <div className="flex items-center justify-between gap-4"><span className="opacity-60">{label}</span><span className="font-semibold">{value}</span></div>; }
function Toggle({ checked, onChange, label }: { readonly checked: boolean; readonly onChange: (value: boolean) => void; readonly label: string }) { return <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition ${checked ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}><span>{label}</span><span className={`size-2 rounded-full ${checked ? "bg-background" : "bg-muted-foreground/30"}`} /></button>; }
