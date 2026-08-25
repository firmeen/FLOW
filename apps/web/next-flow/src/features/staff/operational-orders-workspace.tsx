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
type QueueStatusFilter =
  | "INCOMING"
  | "PENDING_CONFIRMATION"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "REJECTED"
  | "CHANGED";
type QueueSourceFilter = "ALL" | "CUSTOMER_WEB" | "UNKNOWN";
type DecisionAction = "ACCEPT" | "REJECT";
type LifecycleAction = "START_PREPARING" | "MARK_READY" | "MARK_SERVED";
type RejectionReasonCode =
  | "ITEM_UNAVAILABLE"
  | "STORE_CLOSING"
  | "CAPACITY_LIMIT"
  | "INVALID_ORDER"
  | "OTHER";
type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = {
  readonly ok: false;
  readonly error: { readonly code: string; readonly message: string };
};
type OperationalOrderDecisionResult = {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly decision: DecisionAction;
  readonly status: "ACCEPTED" | "REJECTED";
  readonly customerStatus: "CONFIRMED" | "REJECTED";
  readonly decidedAt: string;
  readonly reasonCode: RejectionReasonCode | null;
};
type OperationalOrderLifecycleResult = {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly action: LifecycleAction;
  readonly fromStatus: "ACCEPTED" | "PREPARING" | "READY";
  readonly status: "PREPARING" | "READY" | "SERVED";
  readonly customerStatus: "PREPARING" | "COMING_TO_TABLE" | "SERVED";
  readonly transitionedAt: string;
};

const STAFF_TABS: readonly StaffTab[] = ["orders", "tables", "service", "ready", "menu"];
const REJECTION_REASON_OPTIONS: readonly (readonly [RejectionReasonCode, string])[] = [
  ["ITEM_UNAVAILABLE", "Item unavailable"],
  ["STORE_CLOSING", "Store closing"],
  ["CAPACITY_LIMIT", "Capacity limit"],
  ["INVALID_ORDER", "Invalid order"],
  ["OTHER", "Other"],
];
const LIFECYCLE_ACTIONS = {
  ACCEPTED: ["START_PREPARING", "Start preparing"],
  PREPARING: ["MARK_READY", "Mark ready"],
  READY: ["MARK_SERVED", "Mark served"],
} as const satisfies Partial<
  Record<OperationalOrderDetail["status"], readonly [LifecycleAction, string]>
>;

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
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OperationalOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [decisionPending, setDecisionPending] = useState<DecisionAction | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [decisionForbidden, setDecisionForbidden] = useState(false);
  const [lifecyclePending, setLifecyclePending] = useState<LifecycleAction | null>(null);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [lifecycleForbidden, setLifecycleForbidden] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState<RejectionReasonCode | "">("");

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

  async function openDetail(
    orderId: string,
    options: {
      readonly preserveDecisionError?: boolean;
      readonly preserveLifecycleError?: boolean;
    } = {},
  ) {
    const version = ++detailRequestVersion.current;
    setSelectedOrderId(orderId);
    setDetail(null);
    setDetailError(null);
    if (!options.preserveDecisionError) setDecisionError(null);
    if (!options.preserveLifecycleError) setLifecycleError(null);
    setDecisionForbidden(false);
    setLifecycleForbidden(false);
    setRejectOpen(false);
    setRejectReason("");
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

  function closeDetail(force = false) {
    if ((decisionPending || lifecyclePending) && !force) return;
    detailRequestVersion.current += 1;
    setSelectedOrderId(null);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(false);
    setDecisionError(null);
    setLifecycleError(null);
    setRejectOpen(false);
    setRejectReason("");
  }

  async function submitDecision(action: DecisionAction) {
    if (!detail || decisionPending || lifecyclePending) return;
    if (detail.status !== "PENDING_CONFIRMATION") {
      setDecisionError("This order is no longer eligible for an initial decision.");
      return;
    }
    if (action === "REJECT" && !rejectReason) {
      setDecisionError("Choose a rejection reason before rejecting the order.");
      return;
    }

    const orderId = detail.id;
    const orderNumber = detail.orderNumber;
    setDecisionPending(action);
    setDecisionError(null);
    setLifecycleError(null);
    setNotice(null);

    try {
      const payload =
        action === "ACCEPT"
          ? { action: "ACCEPT" }
          : { action: "REJECT", reasonCode: rejectReason };
      const response = await fetch(
        `/api/internal/orders/${encodeURIComponent(orderId)}/decision`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json()) as
        | ApiSuccess<OperationalOrderDecisionResult>
        | ApiFailure;

      if (!response.ok || !body.ok) {
        const message = body.ok ? "Order decision is temporarily unavailable." : body.error.message;
        if (response.status === 401) {
          handleAuthFailure(response.status);
          return;
        }
        if (response.status === 403) {
          setDecisionForbidden(true);
          setRejectOpen(false);
          setDecisionError("You can view this order, but order.manage permission is required to decide it.");
          return;
        }
        if (response.status === 409) {
          await Promise.all([
            loadQueue({ background: true }),
            openDetail(orderId, { preserveDecisionError: true }),
          ]);
          setDecisionError("Another decision already won. The durable order state has been refreshed.");
          return;
        }
        if (response.status === 404) {
          setDecisionError("This order is no longer available in the active branch.");
          await loadQueue({ background: true });
          return;
        }
        setDecisionError(message);
        return;
      }

      setNotice(
        body.data.decision === "ACCEPT"
          ? `Order ${orderNumber} accepted.`
          : `Order ${orderNumber} rejected.`,
      );
      setDecisionPending(null);
      closeDetail(true);
      await loadQueue({ background: true });
    } catch {
      setDecisionError("Order decision is temporarily unavailable. Refresh the order before retrying.");
    } finally {
      setDecisionPending(null);
    }
  }

  async function submitLifecycle(action: LifecycleAction) {
    if (!detail || decisionPending || lifecyclePending) return;
    const expected = LIFECYCLE_ACTIONS[detail.status as keyof typeof LIFECYCLE_ACTIONS];
    if (!expected || expected[0] !== action) {
      setLifecycleError("This order is no longer eligible for that lifecycle action.");
      return;
    }

    const orderId = detail.id;
    const orderNumber = detail.orderNumber;
    setLifecyclePending(action);
    setLifecycleError(null);
    setDecisionError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/internal/orders/${encodeURIComponent(orderId)}/lifecycle`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        },
      );
      const body = (await response.json()) as
        | ApiSuccess<OperationalOrderLifecycleResult>
        | ApiFailure;

      if (!response.ok || !body.ok) {
        const message = body.ok ? "Order lifecycle is temporarily unavailable." : body.error.message;
        if (response.status === 401) {
          handleAuthFailure(response.status);
          return;
        }
        if (response.status === 403) {
          setLifecycleForbidden(true);
          setLifecycleError("You can view this order, but order.manage permission is required to progress it.");
          return;
        }
        if (response.status === 409) {
          await Promise.all([
            loadQueue({ background: true }),
            openDetail(orderId, { preserveLifecycleError: true }),
          ]);
          setLifecycleError("Another lifecycle transition already won. The durable order state has been refreshed.");
          return;
        }
        if (response.status === 404) {
          setLifecycleError("This order is no longer available in the active branch.");
          await loadQueue({ background: true });
          return;
        }
        setLifecycleError(message);
        return;
      }

      setNotice(`Order ${orderNumber}: ${lifecycleSuccessLabel(body.data.action)}.`);
      await Promise.all([
        loadQueue({ background: true }),
        openDetail(orderId, { preserveLifecycleError: true }),
      ]);
    } catch {
      setLifecycleError("Order lifecycle is temporarily unavailable. Refresh the order before retrying.");
    } finally {
      setLifecyclePending(null);
    }
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

  const decisionEligible = detail?.status === "PENDING_CONFIRMATION";
  const lifecycleAction = detail
    ? LIFECYCLE_ACTIONS[detail.status as keyof typeof LIFECYCLE_ACTIONS]
    : undefined;
  const mutationPending = Boolean(decisionPending || lifecyclePending);

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
          title="Server-backed order workflow"
          description="Submitted orders remain durable branch-scoped records. Staff decisions and normal lifecycle progression are authorized and persisted by the server."
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
            helper="order.view reads / order.manage mutations"
            icon={<ShieldCheck className="size-5" />}
          />
        </div>

        {notice ? (
          <div role="status" className="mt-4 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
            {notice}
          </div>
        ) : null}

        <section className="mt-6" aria-labelledby="operational-order-queue-title">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="operational-order-queue-title" className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Operational orders
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Oldest submissions first. Every mutation reconciles against the durable server state.
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
                  ["ACCEPTED", "Accepted"],
                  ["PREPARING", "Preparing"],
                  ["READY", "Ready"],
                  ["SERVED", "Served"],
                  ["REJECTED", "Rejected"],
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
        footer={
          <Button variant="outline" disabled={mutationPending} onClick={() => closeDetail()}>
            Close
          </Button>
        }
        size="lg"
      >
        {detailLoading ? (
          <EmptyState compact icon={<LoaderCircle className="size-5 animate-spin" />} title="Loading order detail..." />
        ) : detailError ? (
          <EmptyState compact icon={<RefreshCcw className="size-5" />} title="Order detail unavailable" description={detailError} />
        ) : detail ? (
          <div className="space-y-4">
            <OperationalOrderDetailView detail={detail} now={now} />

            {decisionError ? (
              <div role="alert" className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {decisionError}
              </div>
            ) : null}
            {lifecycleError ? (
              <div role="alert" className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {lifecycleError}
              </div>
            ) : null}

            {decisionEligible && !decisionForbidden ? (
              <section className="border border-border bg-card p-4" aria-labelledby="order-decision-heading">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 id="order-decision-heading" className="text-sm font-semibold text-foreground">
                      Initial staff decision
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Accept confirms the order. Reject requires one bounded operational reason. Normal lifecycle progression starts only after acceptance.
                    </p>
                  </div>
                  <Badge tone="neutral">order.manage</Badge>
                </div>

                {rejectOpen ? (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <label className="block text-xs font-semibold text-foreground">
                      Rejection reason
                      <select
                        className="mt-1.5 block h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground"
                        value={rejectReason}
                        disabled={mutationPending}
                        onChange={(event) =>
                          setRejectReason(event.target.value as RejectionReasonCode | "")
                        }
                      >
                        <option value="">Choose a reason</option>
                        {REJECTION_REASON_OPTIONS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        disabled={mutationPending}
                        onClick={() => {
                          setRejectOpen(false);
                          setRejectReason("");
                          setDecisionError(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={!rejectReason || mutationPending}
                        leftIcon={
                          decisionPending === "REJECT" ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : undefined
                        }
                        onClick={() => void submitDecision("REJECT")}
                      >
                        Reject order
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      disabled={mutationPending}
                      onClick={() => {
                        setRejectOpen(true);
                        setDecisionError(null);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      disabled={mutationPending}
                      leftIcon={
                        decisionPending === "ACCEPT" ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : undefined
                      }
                      onClick={() => void submitDecision("ACCEPT")}
                    >
                      Accept order
                    </Button>
                  </div>
                )}
              </section>
            ) : lifecycleAction && !lifecycleForbidden ? (
              <section className="border border-border bg-card p-4" aria-labelledby="order-lifecycle-heading">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 id="order-lifecycle-heading" className="text-sm font-semibold text-foreground">
                      Normal order lifecycle
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Only the next legal transition is available. The server derives target state, customer status, actor and timestamp.
                    </p>
                  </div>
                  <Badge tone="neutral">order.manage</Badge>
                </div>
                <div className="mt-4 flex justify-end border-t border-border pt-4">
                  <Button
                    disabled={mutationPending}
                    leftIcon={
                      lifecyclePending === lifecycleAction[0] ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : undefined
                    }
                    onClick={() => void submitLifecycle(lifecycleAction[0])}
                  >
                    {lifecycleAction[1]}
                  </Button>
                </div>
              </section>
            ) : detail.status === "CHANGED" ? (
              <p className="border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
                Changed orders remain review-only. Edit/cancel exception semantics belong to the next round.
              </p>
            ) : detail.status === "SERVED" ? (
              <p className="border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
                Served is terminal for the R03 normal lifecycle. Payment remains a separate lifecycle.
              </p>
            ) : detail.status === "REJECTED" ? (
              <p className="border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
                Rejected orders cannot enter the normal lifecycle.
              </p>
            ) : !decisionEligible ? (
              <p className="border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
                No normal R03 lifecycle action is available for this order state.
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </OperationalShell>
  );
}

function lifecycleSuccessLabel(action: LifecycleAction): string {
  switch (action) {
    case "START_PREPARING":
      return "preparation started";
    case "MARK_READY":
      return "marked ready";
    case "MARK_SERVED":
      return "marked served";
  }
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
