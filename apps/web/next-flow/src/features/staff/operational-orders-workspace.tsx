"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  HandPlatter,
  LayoutGrid,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Utensils,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  SectionHeading,
} from "@/components/foodflow-ui";
import { StaffOperations } from "@/features/staff/staff-operations";
import { useNow } from "@/hooks/use-now";
import { formatBangkokTime, formatElapsed } from "@/lib/date";
import type {
  OperationalOrderDetail,
  OperationalOrderQueueItem,
  OperationalOrderQueuePage,
  OperationalOrderStatus,
} from "@/modules/order-operations/server/types";

type StaffTab = "orders" | "tables" | "service" | "ready" | "menu";
type QueueStatusFilter = "INCOMING" | "PENDING_CONFIRMATION" | "CHANGED";
type QueueSourceFilter = "ALL" | "CUSTOMER_WEB" | "UNKNOWN";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = {
  readonly ok: false;
  readonly error: { readonly code: string; readonly message: string };
};

const STAFF_TABS: readonly StaffTab[] = ["orders", "tables", "service", "ready", "menu"];

function currentStaffTab(): StaffTab {
  if (typeof window === "undefined") return "orders";
  const hash = window.location.hash.slice(1) as StaffTab;
  return STAFF_TABS.includes(hash) ? hash : "orders";
}

export function StaffOperationsRouter() {
  const [activeTab, setActiveTab] = useState<StaffTab>("orders");

  useEffect(() => {
    const sync = () => setActiveTab(currentStaffTab());
    sync();

    const originalReplaceState = window.history.replaceState.bind(window.history);
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      sync();
    };
    window.history.pushState = (...args) => {
      originalPushState(...args);
      sync();
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);

    return () => {
      window.history.replaceState = originalReplaceState;
      window.history.pushState = originalPushState;
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  return activeTab === "orders" ? <OperationalOrdersWorkspace /> : <StaffOperations />;
}

function OperationalOrdersWorkspace() {
  const now = useNow();
  const requestVersion = useRef(0);
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>("INCOMING");
  const [sourceFilter, setSourceFilter] = useState<QueueSourceFilter>("ALL");
  const [orders, setOrders] = useState<readonly OperationalOrderQueueItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [incomingCount, setIncomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OperationalOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "INCOMING") params.set("status", statusFilter);
    if (sourceFilter !== "ALL") params.set("source", sourceFilter);
    params.set("limit", "24");
    return params.toString();
  }, [sourceFilter, statusFilter]);

  const loadQueue = useCallback(
    async ({ append = false, cursor = null }: { append?: boolean; cursor?: string | null } = {}) => {
      const version = ++requestVersion.current;
      append ? setRefreshing(true) : setLoading(orders.length === 0);
      if (!append) setRefreshing(orders.length > 0);
      setError(null);

      try {
        const params = new URLSearchParams(queryString);
        if (cursor) params.set("cursor", cursor);
        const response = await fetch(`/api/internal/orders?${params.toString()}`, {
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        const body = (await response.json()) as ApiSuccess<OperationalOrderQueuePage> | ApiFailure;
        if (version !== requestVersion.current) return;

        if (!response.ok || !body.ok) {
          handleOperationalAuthFailure(response.status);
          setError(body.ok ? "Order queue is temporarily unavailable." : body.error.message);
          return;
        }

        setOrders((current) => (append ? dedupeOrders([...current, ...body.data.orders]) : body.data.orders));
        setNextCursor(body.data.nextCursor);
        setIncomingCount(body.data.incomingCount);
      } catch {
        if (version === requestVersion.current) {
          setError("Order queue is temporarily unavailable. Try again.");
        }
      } finally {
        if (version === requestVersion.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [orders.length, queryString],
  );

  useEffect(() => {
    setOrders([]);
    setNextCursor(null);
    void loadQueue();
  }, [queryString]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      requestVersion.current += 1;
    };
  }, []);

  async function openDetail(orderId: string) {
    setSelectedOrderId(orderId);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/internal/orders/${encodeURIComponent(orderId)}`, {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const body = (await response.json()) as ApiSuccess<OperationalOrderDetail> | ApiFailure;
      if (!response.ok || !body.ok) {
        handleOperationalAuthFailure(response.status);
        setDetailError(body.ok ? "Order detail is temporarily unavailable." : body.error.message);
        return;
      }
      if (selectedOrderId !== null && selectedOrderId !== orderId) return;
      setDetail(body.data);
    } catch {
      setDetailError("Order detail is temporarily unavailable. Try again.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedOrderId(null);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  const navItems = [
    { label: "Orders", href: "/staff#orders", icon: ClipboardList, active: true, badge: incomingCount || undefined },
    { label: "Tables", href: "/staff#tables", icon: LayoutGrid },
    { label: "Service", href: "/staff#service", icon: BellRing },
    { label: "Ready", href: "/staff#ready", icon: HandPlatter },
    { label: "Menu", href: "/staff#menu", icon: Utensils },
  ];

  return (
    <OperationalShell
      title="Floor operations"
      subtitle={`${incomingCount} incoming orders - durable branch queue`}
      role="Staff"
      currentRole="staff"
      navItems={navItems}
      headerActions={
        <Badge tone={incomingCount ? "warning" : "success"} dot>
          {incomingCount ? "Action needed" : "Order inbox clear"}
        </Badge>
      }
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Operational orders"
          title="Server-backed order queue"
          description="Submitted orders are read from durable branch-scoped order records. Operational mutations are intentionally unavailable from this queue."
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <QueueMetric
            label="Incoming"
            value={incomingCount}
            helper="pending confirmation"
            icon={<ClipboardList className="size-5" />}
          />
          <QueueMetric
            label="Authority"
            value="Branch"
            helper="staff session + order.view"
            icon={<ShieldCheck className="size-5" />}
          />
        </div>

        <section className="mt-6" aria-labelledby="operational-order-queue-title">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="operational-order-queue-title" className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Incoming orders
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Oldest submissions first. Refresh manually to pull newly submitted orders.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Status
                <select
                  className="mt-1 block h-9 rounded-md border border-border bg-card px-3 text-sm font-medium normal-case tracking-normal text-foreground"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as QueueStatusFilter)}
                >
                  <option value="INCOMING">Incoming</option>
                  <option value="PENDING_CONFIRMATION">Pending confirmation</option>
                  <option value="CHANGED">Changed</option>
                </select>
              </label>
              <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Source
                <select
                  className="mt-1 block h-9 rounded-md border border-border bg-card px-3 text-sm font-medium normal-case tracking-normal text-foreground"
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value as QueueSourceFilter)}
                >
                  <option value="ALL">All</option>
                  <option value="CUSTOMER_WEB">Customer web</option>
                  <option value="UNKNOWN">Other / unknown</option>
                </select>
              </label>
              <Button
                variant="outline"
                disabled={refreshing || loading}
                leftIcon={<RefreshCcw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />}
                onClick={() => void loadQueue()}
              >
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <EmptyState
              className="mt-5"
              icon={<LoaderCircle className="size-5 animate-spin" />}
              title="Loading branch orders..."
              description="Reading the durable operational queue."
            />
          ) : error ? (
            <EmptyState
              className="mt-5"
              icon={<RefreshCcw className="size-5" />}
              title="Order queue unavailable"
              description={error}
              action={<Button variant="outline" onClick={() => void loadQueue()}>Try again</Button>}
            />
          ) : orders.length === 0 ? (
            <EmptyState
              className="mt-5"
              icon={<CheckCircle2 className="size-5" />}
              title="No matching submitted orders"
              description="The durable branch queue has no orders matching the current filters."
            />
          ) : (
            <>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {orders.map((order) => (
                  <OperationalOrderCard
                    key={order.id}
                    order={order}
                    now={now}
                    onReview={() => void openDetail(order.id)}
                  />
                ))}
              </div>
              {nextCursor && (
                <div className="mt-5 flex justify-center">
                  <Button
                    variant="outline"
                    disabled={refreshing}
                    leftIcon={refreshing ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                    onClick={() => void loadQueue({ append: true, cursor: nextCursor })}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(selectedOrderId)}
        onClose={closeDetail}
        title={detail ? `Order ${detail.orderNumber}` : "Order detail"}
        description={detail ? `${detail.tableLabel ?? "Unknown table"} - Submitted ${formatBangkokTime(detail.submittedAt)}` : undefined}
        footer={<Button variant="outline" onClick={closeDetail}>Close</Button>}
        size="lg"
      >
        {detailLoading ? (
          <EmptyState compact icon={<LoaderCircle className="size-5 animate-spin" />} title="Loading order detail..." />
        ) : detailError ? (
          <EmptyState compact icon={<RefreshCcw className="size-5" />} title="Order detail unavailable" description={detailError} />
        ) : detail ? (
          <OperationalOrderDetailView detail={detail} now={now} />
        ) : null}
      </Modal>
    </OperationalShell>
  );
}

function QueueMetric({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-foreground" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{helper}</p>
      </div>
    </Card>
  );
}

function OperationalOrderCard({
  order,
  now,
  onReview,
}: {
  order: OperationalOrderQueueItem;
  now: number;
  onReview: () => void;
}) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-amber-500">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{order.tableLabel ?? "Unknown table"}</p>
            <h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] text-foreground">{order.orderNumber}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="warning">{statusLabel(order.status)}</Badge>
              <Badge tone="neutral">{order.source === "CUSTOMER_WEB" ? "Customer web" : "Other source"}</Badge>
            </div>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Waiting</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-foreground">{formatElapsed(order.submittedAt, now)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Items</p>
            <p className="mt-1 font-semibold text-foreground">{order.unitCount} units / {order.lineCount} lines</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Subtotal</p>
            <p className="mt-1 font-bold text-foreground">{formatMinorMoney(order.subtotalMinor, order.currency)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden="true" />
          Submitted {formatBangkokTime(order.submittedAt)}
          {order.hasCustomerNote ? " - Customer note" : ""}
        </div>
      </div>
      <div className="border-t border-border bg-muted p-4">
        <Button fullWidth onClick={onReview} rightIcon={<ChevronRight className="size-4" />}>
          Review details
        </Button>
      </div>
    </Card>
  );
}

function OperationalOrderDetailView({ detail, now }: { detail: OperationalOrderDetail; now: number }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailMetric label="Table" value={detail.tableLabel ?? "Unknown"} />
        <DetailMetric label="Status" value={statusLabel(detail.status)} />
        <DetailMetric label="Waiting" value={formatElapsed(detail.submittedAt, now)} />
        <DetailMetric label="Subtotal" value={formatMinorMoney(detail.subtotalMinor, detail.currency)} />
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-[0.11em] text-muted-foreground">Persisted item snapshots</h3>
          <Badge tone="neutral">Read only</Badge>
        </div>
        <div className="mt-2 overflow-hidden rounded-md border border-border bg-card">
          {detail.items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No persisted item rows are available for this order.</p>
          ) : (
            detail.items.map((item, index) => (
              <div className={`px-4 py-3.5 ${index ? "border-t border-border" : ""}`} key={item.id}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 min-w-7 rounded bg-muted px-1.5 py-1 text-center text-xs font-bold text-foreground">{item.quantity}x</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold leading-5 text-foreground">{item.menuItemName}</p>
                      <p className="shrink-0 text-sm font-semibold text-foreground">{formatMinorMoney(item.lineTotalMinor, detail.currency)}</p>
                    </div>
                    {item.modifiers.length > 0 && (
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                        {item.modifiers.map((modifier) => (
                          <li key={modifier.id}>
                            {modifier.modifierGroupName}: {modifier.modifierChoiceName}
                            {modifier.priceDeltaMinor !== "0" ? ` (${formatMinorMoney(modifier.priceDeltaMinor, detail.currency)})` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.specialRequest && (
                      <p className="mt-2 rounded bg-amber-500/15 px-2.5 py-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
                        <strong>Request:</strong> {item.specialRequest}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {detail.customerNote ? (
        <section className="rounded-md border border-amber-500/40 bg-amber-500/15 p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-amber-800 dark:text-amber-300">Customer note</h3>
          <p className="mt-1.5 text-sm leading-6 text-amber-800 dark:text-amber-300">{detail.customerNote}</p>
        </section>
      ) : null}

      <p className="rounded-md border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
        This queue is read-only. Accept, reject, edit, and lifecycle controls are not enabled on durable server orders yet.
      </p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card muted className="p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </Card>
  );
}

function dedupeOrders(orders: readonly OperationalOrderQueueItem[]): readonly OperationalOrderQueueItem[] {
  const seen = new Set<string>();
  return orders.filter((order) => {
    if (seen.has(order.id)) return false;
    seen.add(order.id);
    return true;
  });
}

function handleOperationalAuthFailure(status: number): void {
  if (typeof window === "undefined") return;
  if (status === 401) {
    window.location.assign(`/login?next=${encodeURIComponent("/staff#orders")}`);
  } else if (status === 403) {
    window.location.assign(`/forbidden?next=${encodeURIComponent("/staff#orders")}`);
  }
}

function formatMinorMoney(minor: string, currency: string): string {
  const amount = Number(minor) / 100;
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-TH", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function statusLabel(status: OperationalOrderStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
