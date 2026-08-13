"use client";

import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  Percent,
  QrCode,
  ReceiptText,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  Modal,
  SectionHeading,
  SegmentedControl,
  StatusPill,
  Tabs,
} from "@/components/ui";
import type { DiscountType, PaymentMethod, TableSession } from "@/domain";
import { formatTHB } from "@/lib/currency";
import { formatBangkokTime } from "@/lib/date";
import { useFoodFlow } from "@/store";

type CashierTab = "requests" | "active" | "paid";

const paymentMethods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "THAI_QR", label: "Thai QR", icon: QrCode },
  { value: "CARD_TERMINAL", label: "Card terminal", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "Bank transfer", icon: Landmark },
  { value: "OTHER", label: "Other", icon: WalletCards },
];

export function CashierApp() {
  const { state, recordPayment, voidPayment } = useFoodFlow();
  const [tab, setTab] = useState<CashierTab>("requests");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>("NONE");
  const [discountValue, setDiscountValue] = useState(0);
  const [serviceChargeEnabled, setServiceChargeEnabled] = useState(state.settings.serviceChargeEnabled);
  const [vatEnabled, setVatEnabled] = useState(state.settings.vatEnabled);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [saving, setSaving] = useState(false);
  const [voidPaymentId, setVoidPaymentId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidStaffId, setVoidStaffId] = useState(state.staffUsers[0]?.id ?? "");

  const billRequests = state.serviceRequests.filter(
    (request) => request.type === "REQUEST_BILL" && request.status !== "RESOLVED" && request.status !== "CANCELLED",
  );
  const openSessions = state.tableSessions.filter((session) => session.status !== "CLOSED");
  const payments = [...state.payments].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const selectedSession = state.tableSessions.find((session) => session.id === selectedSessionId) ?? null;

  useEffect(() => {
    function syncTabFromHash() {
      const hash = window.location.hash.slice(1) as CashierTab;
      if (["requests", "active", "paid"].includes(hash)) setTab(hash);
    }
    syncTabFromHash();
    window.addEventListener("hashchange", syncTabFromHash);
    return () => window.removeEventListener("hashchange", syncTabFromHash);
  }, []);

  function changeTab(next: CashierTab) {
    setTab(next);
    window.history.replaceState(null, "", `${window.location.pathname}#${next}`);
  }

  const navItems = [
    { label: "Bills", href: "/cashier#requests", icon: ReceiptText, active: tab !== "paid", badge: billRequests.length || undefined, onClick: () => changeTab("requests") },
    { label: "Payments", href: "/cashier#paid", icon: CircleDollarSign, active: tab === "paid", onClick: () => changeTab("paid") },
  ];

  function openBill(session: TableSession) {
    setSelectedSessionId(session.id);
    setDiscountType("NONE");
    setDiscountValue(0);
    setPaymentMethod("CASH");
    setServiceChargeEnabled(state.settings.serviceChargeEnabled);
    setVatEnabled(state.settings.vatEnabled);
  }

  function markPaid() {
    if (!selectedSession || saving) return;
    setSaving(true);
    window.setTimeout(() => {
      try {
        recordPayment({
          tableSessionId: selectedSession.id,
          method: paymentMethod,
          discountType,
          discountValue,
          serviceChargeEnabled,
          serviceChargePercent: state.settings.serviceChargePercent,
          vatEnabled,
          vatPercent: state.settings.vatPercent,
          recordedBy: state.staffUsers.find((staff) => staff.role === "CASHIER")?.id ?? state.staffUsers[0]?.id,
        });
        setSelectedSessionId(null);
        changeTab("paid");
      } finally {
        setSaving(false);
      }
    }, 350);
  }

  function confirmVoid() {
    if (!voidPaymentId || !voidReason.trim() || !voidStaffId) return;
    voidPayment(voidPaymentId, voidReason.trim(), voidStaffId);
    setVoidPaymentId(null);
    setVoidReason("");
  }

  return (
    <OperationalShell
      title="Billing & payments"
      subtitle={`${billRequests.length} bill request${billRequests.length === 1 ? "" : "s"} need attention`}
      role="Cashier"
      currentRole="cashier"
      navItems={navItems}
      headerActions={<Badge tone={billRequests.length ? "warning" : "success"} dot>{billRequests.length ? "Action needed" : "All clear"}</Badge>}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Front counter"
          title="Close every table with confidence"
          description="Review all orders in one visit, apply transparent adjustments, and record the payment method used."
        />

        <Tabs
          className="mt-6"
          label="Cashier work queues"
          value={tab}
          onChange={changeTab}
          items={[
            { value: "requests", label: "Bill requests", count: billRequests.length },
            { value: "active", label: "Active bills", count: openSessions.length },
            { value: "paid", label: "Recently paid", count: payments.length },
          ]}
        />

        <div className="mt-6">
          {tab === "requests" && (
            billRequests.length === 0 ? (
              <EmptyState icon={<CheckCircle2 className="size-5" />} title="No bill requests" description="New customer requests will appear here automatically." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {billRequests.map((request) => {
                  const table = state.tables.find((candidate) => candidate.id === request.tableId);
                  const session = state.tableSessions.find((candidate) => candidate.id === request.tableSessionId);
                  const bill = session ? calculateBill(session, state.orders, 0, "NONE", false, 0, false, 0) : null;
                  return (
                    <Card className="p-5" key={request.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Bill requested</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">{table?.code}</h2></div>
                        <StatusPill tone={request.status === "ACKNOWLEDGED" ? "info" : "warning"}>{request.status.toLocaleLowerCase()}</StatusPill>
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                        <div><p className="text-[10px] uppercase tracking-wide text-foreground/40">Orders</p><p className="mt-1 font-bold text-foreground">{session?.orderIds.length ?? 0}</p></div>
                        <div><p className="text-[10px] uppercase tracking-wide text-foreground/40">Subtotal</p><p className="mt-1 font-bold text-foreground">{formatTHB(bill?.subtotal ?? 0)}</p></div>
                      </div>
                      <Button className="mt-4" fullWidth onClick={() => session && openBill(session)}>Review bill</Button>
                    </Card>
                  );
                })}
              </div>
            )
          )}

          {tab === "active" && (
            openSessions.length === 0 ? (
              <EmptyState icon={<ReceiptText className="size-5" />} title="No active bills" description="Open dining sessions will appear here." />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                {openSessions.map((session, index) => {
                  const table = state.tables.find((candidate) => candidate.id === session.tableId);
                  const bill = calculateBill(session, state.orders, 0, "NONE", false, 0, false, 0);
                  return (
                    <button className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition hover:bg-muted sm:grid-cols-[140px_1fr_120px_auto] ${index ? "border-t border-border" : ""}`} key={session.id} onClick={() => openBill(session)}>
                      <div><p className="font-bold text-foreground">{table?.code}</p><p className="text-[10px] text-foreground/40">{session.sessionNumber}</p></div>
                      <p className="hidden text-xs text-foreground/50 sm:block">Opened {formatBangkokTime(session.openedAt)} - {session.orderIds.length} orders</p>
                      <p className="font-bold text-foreground">{formatTHB(bill.subtotal)}</p>
                      <Badge tone={session.status === "BILL_REQUESTED" ? "warning" : "info"}>{session.status.replaceAll("_", " ").toLocaleLowerCase()}</Badge>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {tab === "paid" && (
            payments.length === 0 ? (
              <EmptyState icon={<BadgeDollarSign className="size-5" />} title="No recorded payments" description="Completed transactions will stay visible here for audit." />
            ) : (
              <div className="grid gap-3">
                {payments.map((payment) => {
                  const table = state.tables.find((candidate) => candidate.id === payment.tableId);
                  return (
                    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center" key={payment.id}>
                      <span className={`grid size-10 shrink-0 place-items-center rounded-md ${payment.status === "VOIDED" ? "bg-destructive/10 text-destructive" : "bg-chart-1/20 text-chart-5"}`}><CircleDollarSign className="size-5" /></span>
                      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-foreground">{table?.code} - {payment.reference}</p><Badge tone={payment.status === "VOIDED" ? "danger" : "success"}>{payment.status.toLocaleLowerCase()}</Badge></div><p className="mt-1 text-xs text-foreground/45">{payment.method.replaceAll("_", " ")} - {formatBangkokTime(payment.recordedAt)}</p></div>
                      <p className="text-lg font-bold text-foreground">{formatTHB(payment.total)}</p>
                      {payment.status !== "VOIDED" && <Button variant="ghost" size="sm" onClick={() => setVoidPaymentId(payment.id)}>Void</Button>}
                    </Card>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      <BillDrawer
        session={selectedSession}
        state={state}
        discountType={discountType}
        discountValue={discountValue}
        serviceChargeEnabled={serviceChargeEnabled}
        vatEnabled={vatEnabled}
        paymentMethod={paymentMethod}
        saving={saving}
        onClose={() => setSelectedSessionId(null)}
        onDiscountType={setDiscountType}
        onDiscountValue={setDiscountValue}
        onServiceCharge={setServiceChargeEnabled}
        onVat={setVatEnabled}
        onPaymentMethod={setPaymentMethod}
        onPay={markPaid}
      />

      <Modal
        open={Boolean(voidPaymentId)}
        onClose={() => setVoidPaymentId(null)}
        title="Void recorded payment"
        description="This exceptional action is permanently recorded in the audit trail."
        footer={<><Button variant="outline" onClick={() => setVoidPaymentId(null)}>Cancel</Button><Button variant="danger" disabled={!voidReason.trim() || !voidStaffId} onClick={confirmVoid}>Void payment</Button></>}
      >
        <label className="block text-sm font-semibold text-foreground">Responsible staff<select className="mt-2 h-11 w-full rounded-md border border-border bg-card px-3 font-normal" value={voidStaffId} onChange={(event) => setVoidStaffId(event.target.value)}>{state.staffUsers.map((staff) => <option value={staff.id} key={staff.id}>{staff.name} - {staff.role}</option>)}</select></label>
        <label className="mt-5 block text-sm font-semibold text-foreground">Reason<textarea className="mt-2 min-h-24 w-full rounded-md border border-border bg-card p-3 font-normal" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} placeholder="Required reason for void" /></label>
      </Modal>
    </OperationalShell>
  );
}

interface BillDrawerProps {
  session: TableSession | null;
  state: ReturnType<typeof useFoodFlow>["state"];
  discountType: DiscountType;
  discountValue: number;
  serviceChargeEnabled: boolean;
  vatEnabled: boolean;
  paymentMethod: PaymentMethod;
  saving: boolean;
  onClose: () => void;
  onDiscountType: (value: DiscountType) => void;
  onDiscountValue: (value: number) => void;
  onServiceCharge: (value: boolean) => void;
  onVat: (value: boolean) => void;
  onPaymentMethod: (value: PaymentMethod) => void;
  onPay: () => void;
}

function BillDrawer(props: BillDrawerProps) {
  const { session, state } = props;
  if (!session) return null;
  const table = state.tables.find((candidate) => candidate.id === session.tableId);
  const orders = session.orderIds.map((id) => state.orders.find((order) => order.id === id)).filter(Boolean);
  const bill = calculateBill(session, state.orders, props.discountValue, props.discountType, props.serviceChargeEnabled, state.settings.serviceChargePercent, props.vatEnabled, state.settings.vatPercent);

  return (
    <Drawer
      open
      onClose={props.onClose}
      size="lg"
      title={`${table?.code ?? "Table"} bill`}
      description={`${session.sessionNumber} - Started ${formatBangkokTime(session.openedAt)}`}
      footer={<><Button variant="outline" onClick={props.onClose}>Cancel</Button><Button isLoading={props.saving} loadingText="Recording..." onClick={props.onPay} leftIcon={<CheckCircle2 className="size-4" />}>Mark paid - {formatTHB(bill.total)}</Button></>}
    >
      <div className="space-y-5">
        {orders.map((order) => order && (
          <section key={order.id}>
            <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Order {order.number}</h3><span className="text-[10px] text-foreground/40">{formatBangkokTime(order.submittedAt)}</span></div>
            <div className="mt-2 rounded-md border border-border bg-card px-3 py-2.5">
              {order.items.map((item) => <div className="flex justify-between gap-4 py-1.5 text-sm" key={item.id}><span className="text-foreground/68"><strong className="mr-2 text-foreground">{item.quantity}x</strong>{item.menuItemName}</span><span className="font-semibold">{formatTHB(item.lineTotal)}</span></div>)}
            </div>
          </section>
        ))}

        <section className="border-t border-border pt-5">
          <div className="flex items-center gap-2"><SlidersHorizontal className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold text-foreground">Bill adjustments</h3></div>
          <SegmentedControl className="mt-3" fullWidth label="Discount type" value={props.discountType} onChange={props.onDiscountType} items={[{ value: "NONE", label: "No discount" }, { value: "FIXED", label: "Fixed" }, { value: "PERCENT", label: "Percent", icon: <Percent className="size-3.5" /> }]} />
          {props.discountType !== "NONE" && <label className="mt-3 block text-xs font-semibold text-foreground/55">Discount {props.discountType === "PERCENT" ? "percentage" : "amount"}<input className="mt-1.5 h-10 w-full rounded-md border border-border bg-card px-3 text-sm" min="0" max={props.discountType === "PERCENT" ? 100 : bill.subtotal} type="number" value={props.discountValue || ""} onChange={(event) => props.onDiscountValue(Math.max(0, Number(event.target.value)))} /></label>}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Toggle label={`Service ${state.settings.serviceChargePercent}%`} checked={props.serviceChargeEnabled} onChange={props.onServiceCharge} />
            <Toggle label={`VAT ${state.settings.vatPercent}%`} checked={props.vatEnabled} onChange={props.onVat} />
          </div>
        </section>

        <section className="rounded-lg bg-foreground p-5 text-white">
          <BillRow label="Subtotal" value={bill.subtotal} />
          <BillRow label="Discount" value={-bill.discountAmount} muted />
          <BillRow label={`Service charge (${state.settings.serviceChargePercent}%)`} value={bill.serviceChargeAmount} muted />
          <BillRow label={`VAT (${state.settings.vatPercent}%)`} value={bill.vatAmount} muted />
          <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4"><span className="text-sm font-semibold">Total</span><span className="text-3xl font-bold tracking-[-0.04em] text-primary">{formatTHB(bill.total)}</span></div>
        </section>

        <section><h3 className="text-sm font-semibold text-foreground">Payment method</h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{paymentMethods.map((method) => <button className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-md border p-2 text-xs font-semibold transition ${props.paymentMethod === method.value ? "border-foreground bg-muted text-foreground ring-1 ring-ring" : "border-border bg-card text-foreground/55 hover:border-foreground/35"}`} key={method.value} onClick={() => props.onPaymentMethod(method.value)}><method.icon className="size-5" />{method.label}</button>)}</div></section>
      </div>
    </Drawer>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" aria-pressed={checked} onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-md border px-3 py-3 text-left text-xs font-semibold ${checked ? "border-foreground bg-muted text-foreground" : "border-border bg-card text-foreground/48"}`}><span>{label}</span><span className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-foreground" : "bg-border"}`}><span className={`block size-4 rounded-full bg-card transition ${checked ? "translate-x-4" : ""}`} /></span></button>;
}

function BillRow({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return <div className={`flex justify-between py-1 text-sm ${muted ? "text-white/58" : "text-white/82"}`}><span>{label}</span><span>{formatTHB(value)}</span></div>;
}

function calculateBill(session: TableSession, orders: ReturnType<typeof useFoodFlow>["state"]["orders"], discountValue: number, discountType: DiscountType, serviceEnabled: boolean, servicePercent: number, vatEnabled: boolean, vatPercent: number) {
  const subtotal = session.orderIds.map((id) => orders.find((order) => order.id === id)).filter((order) => order && !["REJECTED", "CANCELLED", "VOIDED"].includes(order.status)).reduce((sum, order) => sum + (order?.subtotal ?? 0), 0);
  const discountAmount = discountType === "FIXED" ? Math.min(subtotal, discountValue) : discountType === "PERCENT" ? subtotal * Math.min(100, discountValue) / 100 : 0;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const serviceChargeAmount = serviceEnabled ? afterDiscount * servicePercent / 100 : 0;
  const vatAmount = vatEnabled ? (afterDiscount + serviceChargeAmount) * vatPercent / 100 : 0;
  return { subtotal, discountAmount, serviceChargeAmount, vatAmount, total: afterDiscount + serviceChargeAmount + vatAmount };
}
