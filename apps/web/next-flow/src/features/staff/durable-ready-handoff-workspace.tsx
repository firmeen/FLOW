"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, CheckCircle2, HandPlatter, LayoutGrid, LoaderCircle, RefreshCcw, ReceiptText, Utensils } from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import { formatBangkokTime } from "@/lib/date";
import type { OperationalOrderQueuePage, OperationalOrderQueueItem } from "./operational-orders-ui";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string; readonly message?: string } };

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "UNAVAILABLE" : body.error.code;
    if (code.includes("FORBIDDEN")) throw new Error("Your current workspace cannot complete this handoff.");
    if (code.includes("CONFLICT")) throw new Error("This order changed on another screen. The ready queue has been refreshed.");
    throw new Error("The ready queue is temporarily unavailable.");
  }
  return body.data;
}

export function DurableReadyHandoffWorkspace() {
  const [orders, setOrders] = useState<readonly OperationalOrderQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/internal/orders?status=READY&limit=50", { cache: "no-store", credentials: "same-origin" });
      const page = await readApi<OperationalOrderQueuePage>(response);
      setOrders(page.orders);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Ready orders are unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 8000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function serve(order: OperationalOrderQueueItem) {
    if (pendingId) return;
    setPendingId(order.id);
    setError(null);
    try {
      const response = await fetch(`/api/internal/orders/${order.id}/lifecycle`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ action: "MARK_SERVED" }),
      });
      await readApi(response);
      setOrders((current) => current.filter((candidate) => candidate.id !== order.id));
      setNotice(`${order.orderNumber} handed off to ${order.tableLabel ?? "table"}.`);
      window.setTimeout(() => setNotice(null), 1800);
    } catch (serveError) {
      setError(serveError instanceof Error ? serveError.message : "Order could not be served.");
      await load(true);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <OperationalShell
      title="Ready handoff"
      subtitle="A focused pickup queue from the durable order plane"
      role="Staff"
      currentRole="staff"
      navItems={[
        { label: "Orders", href: "/staff#orders", icon: ReceiptText, active: false },
        { label: "Tables", href: "/staff#tables", icon: LayoutGrid, active: false },
        { label: "Service", href: "/staff#service", icon: BellRing, active: false },
        { label: "Ready", href: "/staff#ready", icon: HandPlatter, active: true, badge: orders.length || undefined },
        { label: "Menu", href: "/staff#menu", icon: Utensils, active: false },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Live handoff</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Service pass" title="Move ready food without losing the moment" description="The queue shows only orders that the kitchen has marked ready. One tap records the durable served transition." />
        {(error || notice) && <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${error ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"}`}>{error ?? notice}</div>}
        {loading ? <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : orders.length === 0 ? <div className="mt-6"><EmptyState icon={<CheckCircle2 className="size-5" />} title="Pass is clear" description="Ready orders will appear here automatically." /></div> : (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => <Card key={order.id} className={`overflow-hidden rounded-2xl border-border/80 p-0 shadow-[0_18px_52px_rgb(0_0_0/0.045)] ${order.priority === "URGENT" ? "ring-1 ring-amber-500/30" : ""}`}>
              <div className="h-1 bg-emerald-500" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{order.tableLabel ?? "Table"}</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">{order.orderNumber}</h2><p className="mt-1 text-xs text-muted-foreground">Ready · submitted {formatBangkokTime(order.submittedAt)}</p></div><Badge tone={order.priority === "URGENT" ? "warning" : "success"}>{order.priority === "URGENT" ? "Urgent" : "Ready"}</Badge></div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-border py-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Items</p><p className="mt-1 font-semibold">{order.unitCount}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Lines</p><p className="mt-1 font-semibold">{order.lineCount}</p></div></div>
                <Button className="mt-4" fullWidth isLoading={pendingId === order.id} loadingText="Serving..." onClick={() => void serve(order)} leftIcon={<HandPlatter className="size-4" />}>Mark served</Button>
              </div>
            </Card>)}
          </div>
        )}
      </div>
    </OperationalShell>
  );
}
