"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChefHat,
  Clock3,
  CookingPot,
  Flame,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, EmptyState } from "@/components/foodflow-ui";
import { useNow } from "@/hooks/use-now";
import { formatBangkokTime, formatElapsed, getElapsedMilliseconds } from "@/lib/date";
import type {
  DurableKitchenAction,
  DurableKitchenOrder,
  DurableKitchenOrderStatus,
  DurableKitchenQueue,
} from "@/modules/kitchen-operations/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

const lanes: readonly {
  status: DurableKitchenOrderStatus;
  label: string;
  helper: string;
  icon: typeof Flame;
  action: DurableKitchenAction;
  actionLabel: string;
}[] = [
  { status: "ACCEPTED", label: "New", helper: "Ready to start", icon: Flame, action: "START_PREPARING", actionLabel: "Start" },
  { status: "PREPARING", label: "Preparing", helper: "On the make-line", icon: CookingPot, action: "MARK_READY", actionLabel: "Ready" },
  { status: "READY", label: "Ready", helper: "Waiting for handoff", icon: CheckCircle2, action: "MARK_SERVED", actionLabel: "Served" },
];

function messageFor(code: string): string {
  if (code === "KITCHEN_CONFLICT") return "This order changed on another screen. The board has been refreshed.";
  if (code === "KITCHEN_FORBIDDEN") return "Your current workspace cannot manage this kitchen queue.";
  return "Kitchen data is temporarily unavailable. Try again.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    throw new Error(body.ok ? "Kitchen request failed." : messageFor(body.error.code));
  }
  return body.data;
}

export function DurableKitchenBoard() {
  const now = useNow();
  const [queue, setQueue] = useState<DurableKitchenQueue | null>(null);
  const [station, setStation] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingOrderId, setWorkingOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/internal/kitchen/orders", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      setQueue(await readApi<DurableKitchenQueue>(response));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Kitchen data is unavailable.");
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

  const visibleOrders = useMemo(() => {
    const orders = queue?.orders ?? [];
    if (station === "ALL") return orders;
    return orders.filter((order) => order.items.some((item) => item.station === station));
  }, [queue?.orders, station]);

  async function runAction(order: DurableKitchenOrder, action: DurableKitchenAction) {
    setWorkingOrderId(order.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/internal/kitchen/orders/${order.id}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ action }),
      });
      await readApi(response);
      setNotice(`${order.orderNumber} updated.`);
      await load(true);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Kitchen action failed.");
      await load(true);
    } finally {
      setWorkingOrderId(null);
    }
  }

  return (
    <OperationalShell
      title="Kitchen"
      subtitle="A live production board backed by the durable order plane"
      role="Kitchen"
      currentRole="kitchen"
      navItems={[{ label: "Kitchen", href: "/kitchen", icon: ChefHat, active: true, badge: queue?.orders.length || undefined }]}
      headerActions={<Badge tone="success" dot>Durable live</Badge>}
      contentClassName="!min-h-[calc(100vh-4rem)] !bg-zinc-950 !px-3 !py-3 !pb-24 sm:!px-4 lg:!px-5 lg:!pb-5"
    >
      <div className="mx-auto max-w-[1800px] text-zinc-100">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              <Sparkles className="size-3.5" /> Production control
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">Make-line command board</h1>
            <p className="mt-1 text-sm text-zinc-400">One order authority. Fast handoffs. No browser-owned kitchen state.</p>
          </div>
          <Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={refreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}>
            Refresh
          </Button>
        </div>

        {(error || notice) && (
          <div className={`mt-3 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>
            {error ?? notice}
          </div>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {["ALL", ...(queue?.stations ?? [])].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStation(value)}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${station === value ? "border-white bg-white text-zinc-950" : "border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:text-white"}`}
            >
              {value === "ALL" ? "All stations" : value.replaceAll("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>
        ) : visibleOrders.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <EmptyState icon={<CheckCircle2 className="size-5" />} title="Production is clear" description="New accepted orders will enter this board automatically." />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {lanes.map((lane) => {
              const laneOrders = visibleOrders.filter((order) => order.status === lane.status);
              const LaneIcon = lane.icon;
              return (
                <section key={lane.status} className="min-h-[320px] rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                  <div className="flex items-center justify-between px-1 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05]"><LaneIcon className="size-4" /></span>
                      <div><h2 className="text-sm font-semibold text-white">{lane.label}</h2><p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">{lane.helper}</p></div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-zinc-950">{laneOrders.length}</span>
                  </div>

                  <div className="mt-2 grid gap-2.5">
                    {laneOrders.map((order) => {
                      const elapsed = formatElapsed(getElapsedMilliseconds(order.elapsedAnchor, now));
                      const orderStations = Array.from(new Set(order.items.map((item) => item.station)));
                      return (
                        <article key={order.id} className={`rounded-2xl border p-4 shadow-xl shadow-black/10 transition ${order.priority === "URGENT" ? "border-amber-300/40 bg-amber-300/[0.07]" : "border-white/10 bg-zinc-900/90 hover:border-white/20"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2"><span className="text-lg font-semibold tracking-[-0.035em] text-white">{order.orderNumber}</span>{order.priority === "URGENT" && <Badge tone="warning">Urgent</Badge>}</div>
                              <p className="mt-0.5 text-xs text-zinc-500">{order.tableLabel} · {formatBangkokTime(order.submittedAt)}</p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs font-semibold text-zinc-300"><Clock3 className="size-3.5" />{elapsed}</div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-1.5">{orderStations.map((name) => <span key={name} className="rounded-md bg-white/[0.06] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500">{name.replaceAll("_", " ")}</span>)}</div>

                          <div className="mt-4 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                            {order.items.filter((item) => station === "ALL" || item.station === station).map((item) => (
                              <div key={item.id} className="py-3">
                                <div className="flex items-start gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold text-zinc-950">{item.quantity}</span><div className="min-w-0"><p className="font-semibold text-zinc-100">{item.name}</p>{item.thaiName && <p className="text-xs text-zinc-500">{item.thaiName}</p>}{item.specialRequest && <p className="mt-1.5 rounded-lg bg-amber-300/10 px-2.5 py-2 text-xs font-medium text-amber-200">{item.specialRequest}</p>}</div></div>
                              </div>
                            ))}
                          </div>

                          <Button className="mt-4" fullWidth disabled={workingOrderId === order.id} isLoading={workingOrderId === order.id} loadingText="Updating..." onClick={() => void runAction(order, lane.action)}>
                            {lane.actionLabel}
                          </Button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </OperationalShell>
  );
}
