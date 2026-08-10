"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  BellRing,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  HandPlatter,
  LayoutGrid,
  LoaderCircle,
  MessageSquareText,
  Minus,
  PencilLine,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  UsersRound,
  Utensils,
  XCircle,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  Drawer,
  EmptyState,
  IconButton,
  Modal,
  SectionHeading,
  StatusPill,
  Tabs,
  type BadgeTone,
} from "@/components/ui";
import type {
  FoodFlowState,
  MenuItem,
  Order,
  ServiceRequest,
  SubmitOrderItemInput,
  Table,
  TableSession,
} from "@/domain";
import { useNow } from "@/hooks/use-now";
import { formatTHB } from "@/lib/currency";
import {
  formatBangkokTime,
  formatElapsed,
  formatTimeAgo,
  getElapsedMilliseconds,
} from "@/lib/date";
import {
  TABLE_STATUS_PRESENTATIONS,
  WAIT_TIME_THRESHOLDS_MS,
  getStatusPresentation,
} from "@/lib/constants";
import { selectCustomerMenuItems, useFoodFlow } from "@/store";

type StaffTab = "orders" | "tables" | "service" | "ready" | "menu";
type ReviewMode = "summary" | "change" | "reject";

interface EditableOrderItem {
  sourceId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers: NonNullable<SubmitOrderItemInput["modifiers"]>;
  specialRequest: string;
}

const STAFF_TABS: readonly StaffTab[] = ["orders", "tables", "service", "ready", "menu"];
const NON_BILLABLE_ORDER_STATUSES = new Set(["REJECTED", "CANCELLED", "VOIDED"]);

export function StaffOperations() {
  const {
    state,
    hydrated,
    acceptOrder,
    rejectOrder,
    changeOrder,
    acknowledgeService,
    resolveService,
    markOrderServed,
    setMenuItemStatus,
  } = useFoodFlow();
  const now = useNow();
  const [activeTab, setActiveTab] = useState<StaffTab>("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("summary");
  const [rejectionReason, setRejectionReason] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [editItems, setEditItems] = useState<EditableOrderItem[]>([]);

  useEffect(() => {
    function syncTabFromUrl() {
      const hash = window.location.hash.slice(1) as StaffTab;
      if (STAFF_TABS.includes(hash)) setActiveTab(hash);
    }
    syncTabFromUrl();
    window.addEventListener("hashchange", syncTabFromUrl);
    window.addEventListener("popstate", syncTabFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncTabFromUrl);
      window.removeEventListener("popstate", syncTabFromUrl);
    };
  }, []);

  const pendingOrders = useMemo(
    () => state.orders.filter((order) => order.status === "PENDING_CONFIRMATION" || order.status === "CHANGED").sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
    [state.orders],
  );
  const openServiceRequests = useMemo(
    () => state.serviceRequests
      .filter((request) => request.status === "OPEN" || request.status === "ACKNOWLEDGED")
      .sort((a, b) => a.priority !== b.priority ? (a.priority === "HIGH" ? -1 : 1) : a.requestedAt.localeCompare(b.requestedAt)),
    [state.serviceRequests],
  );
  const readyOrders = useMemo(() => {
    const ticketIds = new Set(state.kitchenTickets.filter((ticket) => ticket.status === "READY").map((ticket) => ticket.orderId));
    return state.orders
      .filter((order) => order.status === "READY" || ticketIds.has(order.id))
      .sort((a, b) => (a.readyAt ?? a.submittedAt).localeCompare(b.readyAt ?? b.submittedAt));
  }, [state.kitchenTickets, state.orders]);
  const activeTables = state.tables.filter((table) => table.active && table.status !== "AVAILABLE");
  const selectedOrder = state.orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedTable = state.tables.find((table) => table.id === selectedTableId) ?? null;

  const navItems = [
    { label: "Orders", href: "/staff#orders", icon: ClipboardList, active: activeTab === "orders", badge: pendingOrders.length || undefined },
    { label: "Tables", href: "/staff#tables", icon: LayoutGrid, active: activeTab === "tables" },
    { label: "Service", href: "/staff#service", icon: BellRing, active: activeTab === "service", badge: openServiceRequests.length || undefined },
    { label: "Ready", href: "/staff#ready", icon: HandPlatter, active: activeTab === "ready", badge: readyOrders.length || undefined },
    { label: "Menu", href: "/staff#menu", icon: Utensils, active: activeTab === "menu", badge: state.menuItems.filter((item) => item.status === "SOLD_OUT").length || undefined },
  ];

  function changeTab(tab: StaffTab) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `${window.location.pathname}#${tab}`);
  }

  function closeOrderReview() {
    setSelectedOrderId(null);
    setReviewMode("summary");
    setRejectionReason("");
    setChangeReason("");
    setEditItems([]);
  }

  function openOrderReview(order: Order) {
    setSelectedOrderId(order.id);
    setReviewMode("summary");
    setRejectionReason("");
    setChangeReason("");
    setEditItems([]);
  }

  function beginOrderChange() {
    if (!selectedOrder) return;
    setEditItems(selectedOrder.items.map((item) => ({
      sourceId: item.id,
      menuItemId: item.menuItemId,
      name: item.menuItemName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      modifiers: item.modifiers.map((modifier) => ({ modifierGroupId: modifier.modifierGroupId, modifierChoiceId: modifier.modifierChoiceId })),
      specialRequest: item.specialRequest ?? "",
    })));
    setChangeReason("");
    setReviewMode("change");
  }

  function updateEditItem(sourceId: string, patch: Partial<EditableOrderItem>) {
    setEditItems((items) => items.map((item) => item.sourceId === sourceId ? { ...item, ...patch } : item));
  }

  const hasMeaningfulChange = selectedOrder ? orderWasEdited(selectedOrder, editItems) : false;

  function submitOrderChange() {
    if (!selectedOrder || !changeReason.trim() || !hasMeaningfulChange || editItems.length === 0) return;
    const items: SubmitOrderItemInput[] = editItems.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      modifiers: item.modifiers,
      specialRequest: item.specialRequest.trim() || undefined,
    }));
    changeOrder(selectedOrder.id, items, changeReason.trim());
    closeOrderReview();
  }

  function submitRejection() {
    if (!selectedOrder || !rejectionReason.trim()) return;
    rejectOrder(selectedOrder.id, rejectionReason.trim());
    closeOrderReview();
  }

  function submitAcceptance() {
    if (!selectedOrder) return;
    acceptOrder(selectedOrder.id);
    closeOrderReview();
  }

  const modalFooter = selectedOrder ? reviewMode === "reject" ? (
    <>
      <Button variant="outline" onClick={() => setReviewMode("summary")}>Back</Button>
      <Button variant="danger" disabled={!rejectionReason.trim()} leftIcon={<XCircle className="size-4" />} onClick={submitRejection}>Reject order</Button>
    </>
  ) : reviewMode === "change" ? (
    <>
      <Button variant="outline" onClick={() => setReviewMode("summary")}>Back</Button>
      <Button disabled={!changeReason.trim() || !hasMeaningfulChange || editItems.length === 0} leftIcon={<ClipboardCheck className="size-4" />} onClick={submitOrderChange}>Save audited change</Button>
    </>
  ) : (
    <>
      <Button variant="danger" onClick={() => setReviewMode("reject")}>Reject</Button>
      {selectedOrder.status === "PENDING_CONFIRMATION" && <Button variant="secondary" leftIcon={<PencilLine className="size-4" />} onClick={beginOrderChange}>Edit order</Button>}
      <Button leftIcon={<Check className="size-4" />} onClick={submitAcceptance}>Accept order</Button>
    </>
  ) : undefined;

  return (
    <OperationalShell
      title="Floor operations"
      subtitle={`${pendingOrders.length} incoming - ${openServiceRequests.length} service - ${readyOrders.length} ready`}
      role="Staff"
      currentRole="staff"
      navItems={navItems}
      headerActions={<Badge tone={pendingOrders.length || openServiceRequests.length || readyOrders.length ? "warning" : "success"} dot>{pendingOrders.length || openServiceRequests.length || readyOrders.length ? "Action needed" : "Floor clear"}</Badge>}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Live floor" title="Keep every table moving" description="Confirm new orders, answer guests, and run finished dishes without losing the thread of a table session." />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QueueMetric label="Incoming" value={pendingOrders.length} helper="awaiting review" icon={<ClipboardList className="size-5" />} tone="amber" />
          <QueueMetric label="Active tables" value={`${activeTables.length}/${state.tables.filter((table) => table.active).length}`} helper="on the floor" icon={<Armchair className="size-5" />} tone="forest" />
          <QueueMetric label="Service" value={openServiceRequests.length} helper="open requests" icon={<BellRing className="size-5" />} tone="red" />
          <QueueMetric label="Ready" value={readyOrders.length} helper="to run now" icon={<HandPlatter className="size-5" />} tone="green" />
        </div>
        <Tabs
          className="mt-6"
          label="Staff work queues"
          value={activeTab}
          onChange={changeTab}
          items={[
            { value: "orders", label: "Orders", icon: <ClipboardList className="size-4" />, count: pendingOrders.length, panelId: "staff-orders" },
            { value: "tables", label: "Tables", icon: <LayoutGrid className="size-4" />, count: state.tables.filter((table) => table.active).length, panelId: "staff-tables" },
            { value: "service", label: "Service", icon: <BellRing className="size-4" />, count: openServiceRequests.length, panelId: "staff-service" },
            { value: "ready", label: "Ready", icon: <HandPlatter className="size-4" />, count: readyOrders.length, panelId: "staff-ready" },
            { value: "menu", label: "Menu", icon: <Utensils className="size-4" />, count: state.menuItems.filter((item) => item.status === "SOLD_OUT").length, panelId: "staff-menu" },
          ]}
        />
        {!hydrated ? (
          <EmptyState className="mt-6" icon={<LoaderCircle className="size-5 animate-spin" />} title="Loading the live floor..." description="Restoring this demo restaurant's latest operational state." />
        ) : (
          <div className="mt-6">
            {activeTab === "orders" && <OrdersPanel id="staff-orders" orders={pendingOrders} state={state} now={now} onReview={openOrderReview} />}
            {activeTab === "tables" && <TablesPanel id="staff-tables" state={state} onOpenTable={(table) => setSelectedTableId(table.id)} />}
            {activeTab === "service" && <ServicePanel id="staff-service" requests={openServiceRequests} state={state} now={now} onAcknowledge={acknowledgeService} onResolve={resolveService} />}
            {activeTab === "ready" && <ReadyPanel id="staff-ready" orders={readyOrders} state={state} now={now} onServed={markOrderServed} />}
            {activeTab === "menu" && <MenuAvailabilityPanel id="staff-menu" state={state} onStatusChange={setMenuItemStatus} />}
          </div>
        )}
      </div>
      <Modal open={Boolean(selectedOrder)} onClose={closeOrderReview} title={selectedOrder ? `Review ${selectedOrder.number}` : "Review order"} description={selectedOrder ? `${tableLabel(state, selectedOrder.tableId)} - Submitted ${formatBangkokTime(selectedOrder.submittedAt)}` : undefined} footer={modalFooter} size="lg">
        {selectedOrder && reviewMode === "summary" && <OrderSummary order={selectedOrder} state={state} now={now} />}
        {selectedOrder && reviewMode === "change" && <OrderChangeForm order={selectedOrder} items={editItems} reason={changeReason} hasMeaningfulChange={hasMeaningfulChange} onReasonChange={setChangeReason} onItemChange={updateEditItem} onItemRemove={(id) => setEditItems((items) => items.filter((item) => item.sourceId !== id))} />}
        {selectedOrder && reviewMode === "reject" && <RejectOrderForm order={selectedOrder} reason={rejectionReason} onReasonChange={setRejectionReason} />}
      </Modal>
      <TableSessionDrawer table={selectedTable} state={state} now={now} onClose={() => setSelectedTableId(null)} />
    </OperationalShell>
  );
}

function QueueMetric({ label, value, helper, icon, tone }: { label: string; value: string | number; helper: string; icon: React.ReactNode; tone: "forest" | "amber" | "red" | "green" }) {
  const tones = { forest: "bg-[#e5eee9] text-[#255d4c]", amber: "bg-[#fbedd4] text-[#94641a]", red: "bg-[#f8e5e2] text-[#a4473e]", green: "bg-[#e4f2e8] text-[#2d724a]" } as const;
  return (
    <Card className="flex min-h-28 items-start gap-3 p-4 sm:min-h-0 sm:items-center">
      <span className={`grid size-10 shrink-0 place-items-center rounded-md ${tones[tone]}`} aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#78847e]">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-[#193229]">{value}</p>
        <p className="truncate text-[11px] text-[#7b8781]">{helper}</p>
      </div>
    </Card>
  );
}

function OrdersPanel({
  id,
  orders,
  state,
  now,
  onReview,
}: {
  id: string;
  orders: Order[];
  state: FoodFlowState;
  now: number;
  onReview: (order: Order) => void;
}) {
  return (
    <section id={id} role="tabpanel" aria-label="Incoming orders">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-forest">Incoming orders</h2>
          <p className="mt-1 text-sm text-foreground/50">Oldest submissions are shown first.</p>
        </div>
        {orders.length > 0 && <Badge tone="warning" dot>{orders.length} waiting</Badge>}
      </div>
      {orders.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="size-5" />} title="Order inbox is clear" description="New table orders will appear here immediately for staff review." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => <IncomingOrderCard key={order.id} order={order} state={state} now={now} onReview={() => onReview(order)} />)}
        </div>
      )}
    </section>
  );
}

function IncomingOrderCard({ order, state, now, onReview }: { order: Order; state: FoodFlowState; now: number; onReview: () => void }) {
  const elapsed = getElapsedMilliseconds(order.submittedAt, now);
  const urgency = waitUrgency(elapsed);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const notes = [
    order.customerNote,
    ...order.items.flatMap((item) => item.specialRequest ? [`${item.menuItemName}: ${item.specialRequest}`] : []),
  ].filter((note): note is string => Boolean(note));
  const urgencyClasses = { normal: "border-t-[#4f806f]", warning: "border-t-[#d19437]", critical: "border-t-[#b84b43]" } as const;
  const timerClasses = { normal: "bg-[#e8f1ec] text-[#285d4d]", warning: "bg-[#fff1d8] text-[#8c601b]", critical: "bg-[#fbe7e4] text-[#a33f37]" } as const;

  return (
    <Card className={`animate-ticket overflow-hidden border-t-4 ${urgencyClasses[urgency]}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#839089]">Table</p>
            <h3 className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-forest">{tableLabel(state, order.tableId)}</h3>
            <p className="mt-1 text-xs font-semibold text-foreground/45">{order.number}</p>
            {order.modifiedByStaff && <Badge className="mt-2" tone="info" icon={<ClipboardCheck className="size-3" />}>Staff changed</Badge>}
          </div>
          <div className={`rounded-md px-3 py-2 text-right ${timerClasses[urgency]}`}>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-70">Waiting</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums">{formatElapsed(order.submittedAt, now)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-y border-line py-3 text-xs">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/55"><Utensils className="size-3.5" aria-hidden="true" />{itemCount} item{itemCount === 1 ? "" : "s"}</span>
          <span className="font-bold text-forest">{formatTHB(order.subtotal)}</span>
        </div>
        <ul className="mt-4 space-y-2.5" aria-label={`Items in ${order.number}`}>
          {order.items.map((item) => (
            <li className="flex items-start gap-3 text-sm" key={item.id}>
              <span className="mt-0.5 min-w-6 rounded bg-[#edf0eb] px-1.5 py-0.5 text-center text-[11px] font-bold text-forest">{item.quantity}x</span>
              <span className="min-w-0 flex-1 leading-5 text-foreground/72">{item.menuItemName}</span>
            </li>
          ))}
        </ul>
        <div className={`mt-4 rounded-md border px-3 py-2.5 ${notes.length ? "border-[#ead9b8] bg-[#fff9eb]" : "border-line bg-[#f7f7f3]"}`}>
          <div className="flex items-start gap-2">
            <MessageSquareText className={`mt-0.5 size-3.5 shrink-0 ${notes.length ? "text-[#a2732d]" : "text-foreground/30"}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.09em] text-foreground/40">Notes</p>
              {notes.length ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#684d25]">{notes.join(" - ")}</p> : <p className="mt-1 text-xs text-foreground/38">No special notes</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line bg-[#fafaf6] p-4">
        <Button fullWidth onClick={onReview} rightIcon={<ChevronRight className="size-4" />}>Review order</Button>
      </div>
    </Card>
  );
}

function OrderSummary({ order, state, now }: { order: Order; state: FoodFlowState; now: number }) {
  const session = state.tableSessions.find((candidate) => candidate.id === order.tableSessionId);
  const specialNotes = order.items.filter((item) => item.specialRequest);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailMetric label="Table" value={tableLabel(state, order.tableId)} />
        <DetailMetric label="Guests" value={session?.guestCount ?? "-"} />
        <DetailMetric label="Waiting" value={formatElapsed(order.submittedAt, now)} mono />
        <DetailMetric label="Subtotal" value={formatTHB(order.subtotal)} />
      </div>
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.11em] text-foreground/45">Order items</h3>
        <div className="mt-2 overflow-hidden rounded-md border border-line bg-white">
          {order.items.map((item, index) => (
            <div className={`px-4 py-3.5 ${index ? "border-t border-line" : ""}`} key={item.id}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 min-w-7 rounded bg-forest-soft px-1.5 py-1 text-center text-xs font-bold text-forest">{item.quantity}x</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-semibold leading-5 text-forest">{item.menuItemName}</p>
                    <p className="shrink-0 text-sm font-semibold text-forest">{formatTHB(item.lineTotal)}</p>
                  </div>
                  {item.modifiers.length > 0 && <p className="mt-1 text-xs text-foreground/48">{item.modifiers.map((modifier) => modifier.modifierChoiceName).join(" - ")}</p>}
                  {item.specialRequest && <p className="mt-2 rounded bg-[#fff4df] px-2.5 py-2 text-xs leading-5 text-[#755422]"><strong>Request:</strong> {item.specialRequest}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {order.customerNote && (
        <section className="rounded-md border border-[#e8d3aa] bg-[#fff8e8] p-4">
          <div className="flex gap-3">
            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-[#9a6b24]" aria-hidden="true" />
            <div><h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#835e25]">Customer note</h3><p className="mt-1.5 text-sm leading-6 text-[#5f492a]">{order.customerNote}</p></div>
          </div>
        </section>
      )}
      {!order.customerNote && specialNotes.length === 0 && <p className="rounded-md border border-line bg-[#f6f6f2] px-4 py-3 text-sm text-foreground/45">No special requests were added to this order.</p>}
      {order.modifiedByStaff && (
        <div className="flex gap-3 rounded-md border border-[#c5d9e8] bg-[#edf6fb] p-4 text-[#315f7a]">
          <ClipboardCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-5"><strong>Staff-modified order.</strong> The change is retained in the audit log.</p>
        </div>
      )}
    </div>
  );
}

function OrderChangeForm({
  order,
  items,
  reason,
  hasMeaningfulChange,
  onReasonChange,
  onItemChange,
  onItemRemove,
}: {
  order: Order;
  items: EditableOrderItem[];
  reason: string;
  hasMeaningfulChange: boolean;
  onReasonChange: (value: string) => void;
  onItemChange: (sourceId: string, patch: Partial<EditableOrderItem>) => void;
  onItemRemove: (sourceId: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-md border border-[#c5d9e8] bg-[#edf6fb] p-4 text-[#315f7a]">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="text-sm leading-5">Changes are visible to the customer and permanently attributed to staff. Update at least one item and explain why.</p>
      </div>
      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.11em] text-foreground/45">Edit {order.number}</h3>
          <Badge tone={hasMeaningfulChange ? "info" : "neutral"} dot={hasMeaningfulChange}>{hasMeaningfulChange ? "Change detected" : "No changes yet"}</Badge>
        </div>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <Card muted className="p-4" key={item.sourceId}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="font-semibold leading-5 text-forest">{item.name}</p><p className="mt-1 text-xs text-foreground/42">{formatTHB(item.unitPrice)} each</p></div>
                <IconButton label={`Remove ${item.name}`} variant="danger" size="sm" disabled={items.length === 1} onClick={() => onItemRemove(item.sourceId)}><Trash2 className="size-3.5" aria-hidden="true" /></IconButton>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/40">Quantity</p>
                  <div className="inline-flex items-center rounded-md border border-line bg-white p-1">
                    <IconButton label={`Decrease ${item.name} quantity`} variant="ghost" size="sm" disabled={item.quantity <= 1} onClick={() => onItemChange(item.sourceId, { quantity: item.quantity - 1 })}><Minus className="size-3.5" aria-hidden="true" /></IconButton>
                    <span className="min-w-10 text-center text-sm font-bold tabular-nums text-forest">{item.quantity}</span>
                    <IconButton label={`Increase ${item.name} quantity`} variant="ghost" size="sm" onClick={() => onItemChange(item.sourceId, { quantity: item.quantity + 1 })}><Plus className="size-3.5" aria-hidden="true" /></IconButton>
                  </div>
                </div>
                <p className="ml-auto pb-2 text-sm font-bold text-forest">{formatTHB(item.unitPrice * item.quantity)}</p>
              </div>
              <label className="mt-4 block text-xs font-semibold text-foreground/58">
                Item request
                <input
                  className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-normal text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10"
                  value={item.specialRequest}
                  onChange={(event) => onItemChange(item.sourceId, { specialRequest: event.target.value })}
                  placeholder="e.g. no onion, sauce on the side"
                />
              </label>
            </Card>
          ))}
        </div>
      </section>
      <label className="block text-sm font-semibold text-forest">
        Reason for change <span className="text-status-red">*</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-y rounded-md border border-line bg-white p-3 text-sm font-normal leading-6 text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Required for audit, e.g. Guest confirmed one bowl without onion by phone."
        />
      </label>
    </div>
  );
}

function RejectOrderForm({ order, reason, onReasonChange }: { order: Order; reason: string; onReasonChange: (value: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-md border border-[#edcbc7] bg-[#fff0ee] p-4 text-[#923d36]">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="text-sm leading-5">Rejecting {order.number} removes it from the live kitchen flow. The customer will see the rejection and its reason.</p>
      </div>
      <label className="block text-sm font-semibold text-forest">
        Rejection reason <span className="text-status-red">*</span>
        <textarea
          autoFocus
          className="mt-2 min-h-28 w-full resize-y rounded-md border border-line bg-white p-3 text-sm font-normal leading-6 text-foreground outline-none transition focus:border-status-red focus:ring-2 focus:ring-status-red/10"
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Required, e.g. Item unavailable; staff spoke with the table."
        />
      </label>
      <p className="text-xs leading-5 text-foreground/45">The reason is stored in the order record and audit history.</p>
    </div>
  );
}

function TablesPanel({ id, state, onOpenTable }: { id: string; state: FoodFlowState; onOpenTable: (table: Table) => void }) {
  const tables = state.tables.filter((table) => table.active).sort((a, b) => a.displayOrder - b.displayOrder);
  return (
    <section id={id} role="tabpanel" aria-label="Restaurant tables">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 className="text-lg font-semibold tracking-[-0.02em] text-forest">Restaurant tables</h2><p className="mt-1 text-sm text-foreground/50">Open any table for its complete live session.</p></div>
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-foreground/48">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#3b8a5d]" />Available</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#d39a3d]" />Waiting</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#3e7896]" />In service</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#9a5146]" />Bill</span>
        </div>
      </div>
      {tables.length === 0 ? (
        <EmptyState icon={<Armchair className="size-5" />} title="No active tables" description="Active restaurant tables will appear here." />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => {
            const session = findTableSession(state, table);
            const orders = sessionOrders(state, session);
            const total = billableTotal(orders);
            const readyCount = orders.filter((order) => order.status === "READY").reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
            const status = TABLE_STATUS_PRESENTATIONS[table.status];
            return (
              <Card key={table.id} interactive className={`relative overflow-hidden ${tableBorderClass(table.status)}`}>
                <button type="button" className="block min-h-48 w-full p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest/35 sm:p-5" onClick={() => onOpenTable(table)} aria-label={`Open ${table.label}, ${status.label}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-2xl font-semibold tracking-[-0.045em] text-forest">{table.code}</p><p className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-foreground/38"><UsersRound className="size-3" aria-hidden="true" /> {table.seats} seats</p></div>
                    <ChevronRight className="mt-1 size-4 text-foreground/25" aria-hidden="true" />
                  </div>
                  <StatusPill className="mt-3 max-w-full" tone={statusTone(table.status)}>{status.label}</StatusPill>
                  {session ? (
                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-line pt-3">
                      <div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/35">Orders</p><p className="mt-1 text-sm font-bold text-forest">{orders.length}</p></div>
                      <div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/35">Total</p><p className="mt-1 truncate text-sm font-bold text-forest">{formatTHB(total)}</p></div>
                      {readyCount > 0 && <p className="col-span-2 mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#2c764c]"><Sparkles className="size-3" aria-hidden="true" /> {readyCount} ready to serve</p>}
                    </div>
                  ) : <p className="mt-5 border-t border-line pt-3 text-xs leading-5 text-foreground/40">Ready for the next guest</p>}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TableSessionDrawer({ table, state, now, onClose }: { table: Table | null; state: FoodFlowState; now: number; onClose: () => void }) {
  if (!table) return null;
  const session = findTableSession(state, table);
  const orders = sessionOrders(state, session);
  const serviceRequests = session ? state.serviceRequests.filter((request) => request.tableSessionId === session.id) : [];
  const total = billableTotal(orders);
  return (
    <Drawer open onClose={onClose} size="lg" title={`${table.code} session`} description={`${table.label} - ${table.seats} seats`} footer={<Button variant="outline" onClick={onClose}>Close</Button>}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-white p-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/38">Current status</p><StatusPill className="mt-2" tone={statusTone(table.status)}>{TABLE_STATUS_PRESENTATIONS[table.status].label}</StatusPill></div>
          <Armchair className="size-8 text-forest/18" aria-hidden="true" />
        </div>
        {!session ? (
          <EmptyState compact icon={<CheckCircle2 className="size-5" />} title="Table is available" description="There is no open dining session at this table." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <DetailMetric label="Guests" value={session.guestCount} />
              <DetailMetric label="Open for" value={formatElapsed(session.openedAt, now)} mono />
              <DetailMetric label="Orders" value={orders.length} />
              <DetailMetric label="Running total" value={formatTHB(total)} />
            </div>
            <section>
              <div className="flex items-center justify-between gap-3"><h3 className="text-xs font-bold uppercase tracking-[0.11em] text-foreground/45">Session orders</h3><span className="text-[10px] text-foreground/38">{session.sessionNumber}</span></div>
              {orders.length === 0 ? (
                <EmptyState compact className="mt-2" icon={<ClipboardList className="size-5" />} title="No orders yet" description="Orders from this table will be grouped here." />
              ) : (
                <div className="mt-2 space-y-3">
                  {orders.map((order) => (
                    <Card className="p-4" key={order.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-semibold text-forest">{order.number}</p><p className="mt-1 text-xs text-foreground/40">Sent {formatBangkokTime(order.submittedAt)}</p></div>
                        <StatusPill tone={statusTone(order.status)}>{getStatusPresentation(order.status).label}</StatusPill>
                      </div>
                      <ul className="mt-3 border-t border-line pt-3">
                        {order.items.map((item) => <li className="flex justify-between gap-3 py-1 text-xs" key={item.id}><span className="text-foreground/60"><strong className="mr-1.5 text-forest">{item.quantity}x</strong>{item.menuItemName}</span><span className="shrink-0 font-semibold text-forest">{formatTHB(item.lineTotal)}</span></li>)}
                      </ul>
                      {order.customerNote && <p className="mt-3 rounded bg-[#fff6e4] px-3 py-2 text-xs leading-5 text-[#725226]">{order.customerNote}</p>}
                    </Card>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.11em] text-foreground/45">Service history</h3>
              {serviceRequests.length === 0 ? <p className="mt-2 rounded-md border border-line bg-[#f7f7f3] px-4 py-3 text-sm text-foreground/40">No service requests in this session.</p> : (
                <div className="mt-2 overflow-hidden rounded-md border border-line bg-white">
                  {serviceRequests.map((request, index) => (
                    <div className={`flex items-center gap-3 px-4 py-3 ${index ? "border-t border-line" : ""}`} key={request.id}>
                      {request.type === "REQUEST_BILL" ? <ReceiptText className="size-4 text-[#8f6220]" /> : <BellRing className="size-4 text-[#3d6f8f]" />}
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-forest">{serviceRequestLabel(request)}</p><p className="mt-0.5 text-[10px] text-foreground/38">{formatBangkokTime(request.requestedAt)}</p></div>
                      <StatusPill tone={statusTone(request.status)}>{getStatusPresentation(request.status).label}</StatusPill>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Drawer>
  );
}

function ServicePanel({
  id,
  requests,
  state,
  now,
  onAcknowledge,
  onResolve,
}: {
  id: string;
  requests: ServiceRequest[];
  state: FoodFlowState;
  now: number;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  return (
    <section id={id} role="tabpanel" aria-label="Service queue">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="text-lg font-semibold tracking-[-0.02em] text-forest">Service queue</h2><p className="mt-1 text-sm text-foreground/50">Acknowledge quickly, then resolve once the guest is helped.</p></div>
        {requests.length > 0 && <Badge tone="warning" dot>{requests.length} open</Badge>}
      </div>
      {requests.length === 0 ? (
        <EmptyState icon={<BellRing className="size-5" />} title="No open service requests" description="Calls for staff and bill requests will stay here until resolved." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => {
            const isBill = request.type === "REQUEST_BILL";
            const isOpen = request.status === "OPEN";
            return (
              <Card className={`overflow-hidden border-l-4 ${request.priority === "HIGH" ? "border-l-[#ba554a]" : "border-l-[#497b91]"}`} key={request.id}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-md ${isBill ? "bg-[#fff0d8] text-[#94641b]" : "bg-[#e8f1f5] text-[#3c7188]"}`}>
                      {isBill ? <ReceiptText className="size-5" /> : <BellRing className="size-5" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-foreground/38">{tableLabel(state, request.tableId)}</p><h3 className="mt-1 text-base font-semibold text-forest">{serviceRequestLabel(request)}</h3></div>
                        <StatusPill tone={isOpen ? "warning" : "info"}>{isOpen ? "Open" : "Acknowledged"}</StatusPill>
                      </div>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/48"><Clock3 className="size-3.5" aria-hidden="true" /> {formatTimeAgo(request.requestedAt, now)}</p>
                    </div>
                  </div>
                  {request.note && <p className="mt-4 rounded-md border border-line bg-[#f7f7f3] px-3 py-2.5 text-sm leading-6 text-foreground/62">&ldquo;{request.note}&rdquo;</p>}
                  {request.acknowledgedAt && <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[#397159]"><Check className="size-3.5" aria-hidden="true" /> Acknowledged {formatTimeAgo(request.acknowledgedAt, now)}</p>}
                </div>
                <div className="flex flex-col gap-2 border-t border-line bg-[#fafaf6] p-4 sm:flex-row">
                  {isOpen && <Button className="sm:flex-1" onClick={() => onAcknowledge(request.id)} leftIcon={<Check className="size-4" />}>Acknowledge</Button>}
                  <Button className="sm:flex-1" variant={isOpen ? "outline" : "primary"} onClick={() => onResolve(request.id)} leftIcon={<CheckCircle2 className="size-4" />}>Resolve{isOpen ? " now" : ""}</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ReadyPanel({
  id,
  orders,
  state,
  now,
  onServed,
}: {
  id: string;
  orders: Order[];
  state: FoodFlowState;
  now: number;
  onServed: (orderId: string) => void;
}) {
  return (
    <section id={id} role="tabpanel" aria-label="Ready to serve queue">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="text-lg font-semibold tracking-[-0.02em] text-forest">Ready to serve</h2><p className="mt-1 text-sm text-foreground/50">Run the oldest finished order first and confirm delivery.</p></div>
        {orders.length > 0 && <Badge tone="success" dot>{orders.length} ready</Badge>}
      </div>
      {orders.length === 0 ? (
        <EmptyState icon={<ChefHat className="size-5" />} title="Nothing waiting at the pass" description="Orders marked ready by the kitchen will appear here for service." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const ticket = state.kitchenTickets.find((candidate) => candidate.orderId === order.id && candidate.status === "READY");
            const readyAt = order.readyAt ?? ticket?.readyAt ?? ticket?.createdAt ?? order.submittedAt;
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <Card className="animate-ticket overflow-hidden border-t-4 border-t-[#3a8658]" key={order.id}>
                <div className="bg-[#eaf5ed] px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#548066]">Ready for</p><h3 className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-forest">{tableLabel(state, order.tableId)}</h3></div>
                    <div className="rounded-md bg-white/80 px-3 py-2 text-right text-[#2f6e49]"><p className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-65">At pass</p><p className="mt-0.5 font-mono text-sm font-bold tabular-nums">{formatElapsed(readyAt, now)}</p></div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-foreground/45">{order.number}</p><Badge tone="success">{itemCount} item{itemCount === 1 ? "" : "s"}</Badge></div>
                  <ul className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <li className="flex items-start gap-3 text-sm" key={item.id}>
                        <span className="min-w-7 rounded bg-[#edf0eb] px-1.5 py-0.5 text-center text-xs font-bold text-forest">{item.quantity}x</span>
                        <div className="min-w-0 flex-1"><p className="font-medium leading-5 text-foreground/72">{item.menuItemName}</p>{item.specialRequest && <p className="mt-1 text-xs leading-5 text-[#94621d]">{item.specialRequest}</p>}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-line bg-[#fafaf6] p-4"><Button fullWidth onClick={() => onServed(order.id)} leftIcon={<HandPlatter className="size-4" />}>Mark served</Button></div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MenuAvailabilityPanel({
  id,
  state,
  onStatusChange,
}: {
  id: string;
  state: FoodFlowState;
  onStatusChange: (itemId: string, status: MenuItem["status"], reason?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [soldOutItemId, setSoldOutItemId] = useState<string | null>(null);
  const [soldOutReason, setSoldOutReason] = useState("");
  const customerItems = selectCustomerMenuItems(state);
  const categoriesById = new Map(state.categories.map((category) => [category.id, category]));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredItems = customerItems.filter((item) => {
    if (!normalizedQuery) return true;
    const categoryName = categoriesById.get(item.categoryId)?.name ?? "";
    return `${item.name} ${categoryName} ${item.preparationStation}`.toLocaleLowerCase().includes(normalizedQuery);
  });
  const soldOutItem = state.menuItems.find((item) => item.id === soldOutItemId) ?? null;
  const soldOutCount = customerItems.filter((item) => item.status === "SOLD_OUT").length;
  const activeCount = customerItems.length - soldOutCount;

  function openSoldOutDialog(item: MenuItem) {
    setSoldOutItemId(item.id);
    setSoldOutReason("");
  }

  function closeSoldOutDialog() {
    setSoldOutItemId(null);
    setSoldOutReason("");
  }

  function confirmSoldOut() {
    if (!soldOutItem || !soldOutReason.trim()) return;
    onStatusChange(soldOutItem.id, "SOLD_OUT", soldOutReason.trim());
    closeSoldOutDialog();
  }

  function restoreItem(item: MenuItem) {
    onStatusChange(item.id, "ACTIVE", "Restocked and confirmed available by floor staff.");
  }

  return (
    <section id={id} role="tabpanel" aria-label="Menu availability">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-forest">Menu availability</h2>
          <p className="mt-1 text-sm text-foreground/50">Keep the customer menu accurate during service.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success" dot>{activeCount} available</Badge>
          <Badge tone={soldOutCount ? "warning" : "neutral"} dot={soldOutCount > 0}>{soldOutCount} sold out</Badge>
        </div>
      </div>

      {customerItems.length === 0 ? (
        <EmptyState
          icon={<Utensils className="size-5" />}
          title="No published menu items"
          description="Items published by an owner or admin will appear here for floor availability updates."
        />
      ) : (
        <>
          <div className="rounded-lg border border-line bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-forest-soft text-forest"><Utensils className="size-4" aria-hidden="true" /></span>
              <div>
                <p className="text-sm font-semibold text-forest">Customer-visible menu</p>
                <p className="mt-1 text-xs leading-5 text-foreground/45">Sold-out items stay visible but cannot be added to an order.</p>
              </div>
            </div>
            <label className="relative mt-4 block sm:mt-0 sm:w-72">
              <span className="sr-only">Search customer-visible menu items</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/35" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search menu..."
                className="h-10 w-full rounded-md border border-line bg-[#fafaf6] pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/10"
              />
            </label>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              compact
              className="mt-4"
              icon={<Search className="size-5" />}
              title="No matching menu items"
              description="Try a different item, category, or kitchen station."
            />
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => {
                const soldOut = item.status === "SOLD_OUT";
                const category = categoriesById.get(item.categoryId);
                return (
                  <Card className={`flex flex-col overflow-hidden ${soldOut ? "border-[#e3c793] bg-[#fffbf2]" : ""}`} key={item.id}>
                    <div className="flex flex-1 items-start gap-3 p-4 sm:p-5">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-md ${soldOut ? "bg-[#f8e8ca] text-[#95651d]" : "bg-[#e6efe9] text-[#2c6853]"}`}>
                        {soldOut ? <CircleAlert className="size-4" aria-hidden="true" /> : <CheckCircle2 className="size-4" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-forest">{safeDisplayName(item.name)}</p>
                            <p className="mt-1 truncate text-[11px] text-foreground/42">{category?.name ?? "Menu"} - {item.preparationStation.replaceAll("_", " ").toLocaleLowerCase()}</p>
                          </div>
                          <StatusPill tone={soldOut ? "warning" : "success"}>{soldOut ? "Sold out" : "Available"}</StatusPill>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-line/75 pt-3 text-xs">
                          <span className="text-foreground/42">Prep {item.estimatedPreparationMinutes} min</span>
                          <span className="font-bold text-forest">{formatTHB(item.basePrice)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-line bg-white/65 p-3">
                      {soldOut ? (
                        <Button fullWidth variant="secondary" leftIcon={<RefreshCcw className="size-4" />} onClick={() => restoreItem(item)}>Restore availability</Button>
                      ) : (
                        <Button fullWidth variant="danger" leftIcon={<CircleAlert className="size-4" />} onClick={() => openSoldOutDialog(item)}>Mark sold out</Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal
        open={Boolean(soldOutItem)}
        onClose={closeSoldOutDialog}
        title={soldOutItem ? `Mark ${safeDisplayName(soldOutItem.name)} sold out` : "Mark item sold out"}
        description="The item remains visible to guests but can no longer be ordered."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={closeSoldOutDialog}>Cancel</Button>
            <Button variant="danger" disabled={!soldOutReason.trim()} onClick={confirmSoldOut}>Confirm sold out</Button>
          </>
        }
      >
        <div className="flex gap-3 rounded-md border border-[#ead2a5] bg-[#fff7e7] p-4 text-[#78551f]">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-5">This availability change is immediate and recorded in the audit history.</p>
        </div>
        <label className="mt-5 block text-sm font-semibold text-forest">
          Sold-out reason <span className="text-status-red">*</span>
          <textarea
            autoFocus
            value={soldOutReason}
            onChange={(event) => setSoldOutReason(event.target.value)}
            placeholder="Required, e.g. Awaiting today's ingredient delivery."
            className="mt-2 min-h-24 w-full resize-y rounded-md border border-line bg-white p-3 text-sm font-normal leading-6 text-foreground outline-none transition focus:border-status-red focus:ring-2 focus:ring-status-red/10"
          />
        </label>
      </Modal>
    </section>
  );
}

function DetailMetric({ label, value, mono = false }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="rounded-md border border-line bg-white px-3.5 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-foreground/38">{label}</p>
      <p className={`mt-1.5 truncate text-sm font-bold text-forest ${mono ? "font-mono tabular-nums" : ""}`}>{value}</p>
    </div>
  );
}

function findTableSession(state: FoodFlowState, table: Table): TableSession | null {
  if (table.currentSessionId) {
    const current = state.tableSessions.find((session) => session.id === table.currentSessionId);
    if (current) return current;
  }
  return state.tableSessions.filter((session) => session.tableId === table.id && session.status !== "CLOSED").sort((a, b) => b.openedAt.localeCompare(a.openedAt))[0] ?? null;
}

function sessionOrders(state: FoodFlowState, session: TableSession | null): Order[] {
  if (!session) return [];
  return session.orderIds.map((orderId) => state.orders.find((order) => order.id === orderId)).filter((order): order is Order => Boolean(order));
}

function billableTotal(orders: Order[]): number {
  return orders.filter((order) => !NON_BILLABLE_ORDER_STATUSES.has(order.status)).reduce((sum, order) => sum + order.subtotal, 0);
}

function tableLabel(state: FoodFlowState, tableId: string): string {
  return state.tables.find((table) => table.id === tableId)?.code ?? "Table";
}

function serviceRequestLabel(request: ServiceRequest): string {
  return request.type === "REQUEST_BILL" ? "Requested the bill" : "Called for staff";
}

function statusTone(status: string): BadgeTone {
  const tone = getStatusPresentation(status).tone;
  return tone === "accent" ? "info" : tone;
}

function waitUrgency(elapsed: number): "normal" | "warning" | "critical" {
  if (elapsed >= WAIT_TIME_THRESHOLDS_MS.critical) return "critical";
  if (elapsed >= WAIT_TIME_THRESHOLDS_MS.warning) return "warning";
  return "normal";
}

function tableBorderClass(status: Table["status"]): string {
  switch (status) {
    case "AVAILABLE": return "border-l-4 border-l-[#3d8b5e]";
    case "WAITING": return "border-l-4 border-l-[#d39839]";
    case "READY": return "border-l-4 border-l-[#3b8758]";
    case "BILL_REQUESTED": return "border-l-4 border-l-[#9a5146]";
    case "PAYMENT_PENDING": return "border-l-4 border-l-[#b5792e]";
    case "PREPARING": return "border-l-4 border-l-[#477b92]";
    case "OCCUPIED": return "border-l-4 border-l-[#55786b]";
  }
}

function orderWasEdited(order: Order, draft: EditableOrderItem[]): boolean {
  if (draft.length !== order.items.length) return true;
  return draft.some((draftItem) => {
    const original = order.items.find((item) => item.id === draftItem.sourceId);
    return !original || original.quantity !== draftItem.quantity || normalizeText(original.specialRequest) !== normalizeText(draftItem.specialRequest);
  });
}

function normalizeText(value: string | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function safeDisplayName(value: string): string {
  return value.replace(/\s+\?\s+/g, " - ");
}
