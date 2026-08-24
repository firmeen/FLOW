"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CheckCircle2,
  ClipboardList,
  HandPlatter,
  LayoutGrid,
  LoaderCircle,
  RefreshCcw,
  ShieldCheck,
  Utensils,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, EmptyState, Modal, SectionHeading } from "@/components/foodflow-ui";
import { StaffOperations } from "@/features/staff/staff-operations";
import { useNow } from "@/hooks/use-now";
import { formatBangkokTime } from "@/lib/date";
import {
  OperationalOrderCard,
  OperationalOrderDetailView,
  QueueMetric,
  dedupeOperationalOrders,
  type OperationalOrderDetail,
  type OperationalOrderQueuePage,
  type OperationalOrderQueueItem,
} from "./operational-orders-ui";

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
    queueMicrotask(sync);

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
  const router = useRouter();
  const now = useNow();
  const requestVersion = useRef(0);
  const detailRequestVersion = useRef(0);
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

  const handleAuthFailure = useCallback(
    (status: number) => {
      if (status === 401) {
        router.push(`/login?next=${encodeURIComponent("/staff#orders")}`);
      } else if (status === 403) {
        router.push(`/forbidden?next=${encodeURIComponent("/staff#orders")}`);
      }
    },
    [router],
  );

  const loadQueue = useCallback(
    async ({
      append = false,
      cursor = null,
      background = false,
    }: {
      append?: boolean;
      cursor?: string | null;
      background?: boolean;
    } = {}) => {
      const version = ++requestVersion.current;
      if (append || background) setRefreshing(true);
      else setLoading(true);
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
          handleAuthFailure(response.status);
          setError(body.ok ? "Order queue is temporarily unavailable." : body.error.message);
          return;
        }

        setOrders((current) =>
          append
            ? dedupeOperationalOrders([...current, ...body.data.orders])
            : body.data.orders,
        );
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
    [handleAuthFailure, queryString],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  useEffect(() => {
    return () => {
      requestVersion.current += 1;
      detailRequestVersion.current += 1;
    };
  }, []);

  async function openDetail(orderId: string) {
    const version = ++detailRequestVersion.current;
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
      if (version !== detailRequestVersion.current) return;
      if (!response.ok || !body.ok) {
        handleAuthFailure(response.status);
        setDetailError(body.ok ? "Order detail is temporarily unavailable." : body.error.message);
        return;
      }
      setDetail(body.data);
    } catch {
      if (version === detailRequestVersion.current) {
        setDetailError("Order detail is temporarily unavailable. Try again.");
      }
    } finally {
      if (version === detailRequestVersion.current) setDetailLoading(false);
    }
  }

  function closeDetail() {
    detailRequestVersion.current += 1;
    setSelectedOrderId(null);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }

  const navItems = [
    {
      label: "Orders",
      href: "/staff#orders",
      icon: ClipboardList,
      active: true,
      badge: incomingCount || undefined,
    },
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
          description="Submitted orders are read from durable branch-scoped records. This queue is intentionally read-only."
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
                Oldest submissions first. Refresh manually for new durable orders.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <QueueSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as QueueStatusFilter)}
                options={[
                  ["INCOMING", "Incoming"],
                  ["PENDING_CONFIRMATION", "Pending confirmation"],
                  ["CHANGED", "Changed"],
                ]}
              />
              <QueueSelect
                label="Source"
                value={sourceFilter}
                onChange={(value) => setSourceFilter(value as QueueSourceFilter)}
                options={[
                  ["ALL", "All"],
                  ["CUSTOMER_WEB", "Customer web"],
                  ["UNKNOWN", "Other / unknown"],
                ]}
              />
              <Button
                variant="outline"
                disabled={refreshing || loading}
                leftIcon={<RefreshCcw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />}
                onClick={() => void loadQueue({ background: true })}
              >
                Refresh
              </Button>
            </div>
          </div>

          {error && orders.length > 0 ? (
            <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <span>{error}</span>
              <Button variant="outline" onClick={() => void loadQueue({ background: true })}>
                Try again
              </Button>
            </div>
          ) : null}

          {loading && orders.length === 0 ? (
            <EmptyState
              className="mt-5"
              icon={<LoaderCircle className="size-5 animate-spin" />}
              title="Loading branch orders..."
              description="Reading the durable operational queue."
            />
          ) : error && orders.length === 0 ? (
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
              {nextCursor ? (
                <div className="mt-5 flex justify-center">
                  <Button
                    variant="outline"
                    disabled={refreshing}
                    leftIcon={refreshing ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                    onClick={() => void loadQueue({ append: true, cursor: nextCursor, background: true })}
                  >
                    Load more
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(selectedOrderId)}
        onClose={closeDetail}
        title={detail ? `Order ${detail.orderNumber}` : "Order detail"}
        description={
          detail
            ? `${detail.tableLabel ?? "Unknown table"} - Submitted ${formatBangkokTime(detail.submittedAt)}`
            : undefined
        }
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

function QueueSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly (readonly [string, string])[];
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
      {label}
      <select
        className="mt-1 block h-9 rounded-md border border-border bg-card px-3 text-sm font-medium normal-case tracking-normal text-foreground"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
