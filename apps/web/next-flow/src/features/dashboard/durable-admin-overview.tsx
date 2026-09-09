"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BellRing,
  Building2,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  LoaderCircle,
  RefreshCcw,
  Store,
  Utensils,
  UsersRound,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import { formatTHB } from "@/lib/currency";
import { formatBangkokTime } from "@/lib/date";
import type { ManagementOverview } from "@/modules/management-operations/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

function money(minor: number) { return formatTHB(minor / 100); }
async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "MANAGEMENT_UNAVAILABLE" : body.error.code;
    if (code === "MANAGEMENT_FORBIDDEN") throw new Error("Your current workspace cannot view tenant management data.");
    throw new Error("Management data is temporarily unavailable.");
  }
  return body.data;
}

export function DurableAdminOverview() {
  const [overview, setOverview] = useState<ManagementOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/overview", { cache: "no-store", credentials: "same-origin" });
      setOverview(await readApi<ManagementOverview>(response));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Management data is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <OperationalShell
      title="Owner control room"
      subtitle="Tenant-wide durable operating visibility"
      role="Owner"
      currentRole="admin"
      navItems={[{ label: "Overview", href: "/admin", icon: LayoutDashboard, active: true }]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Database live</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_90px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-background/5 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><Activity className="size-3.5" /> Live operating pulse</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">{overview?.tenantName ?? "FLOW"}</h1><p className="mt-2 max-w-xl text-sm leading-6 opacity-65">One durable view across branches, tables, orders, guest service and merchant payments.</p></div>
            <div className="rounded-2xl border border-background/10 bg-background/[0.055] px-4 py-3 backdrop-blur"><p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-50">Last 24h revenue</p><p className="mt-1 text-2xl font-bold tracking-[-0.045em]">{money(overview?.metrics.revenue24hMinor ?? 0)}</p></div>
          </div>
        </div>

        {error && <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3"><p className="text-sm font-semibold text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button></div>}

        {loading ? <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : overview && (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<Building2 className="size-4" />} label="Branches" value={`${overview.metrics.openBranches}/${overview.metrics.branches}`} helper="Open now" />
              <Metric icon={<UsersRound className="size-4" />} label="Active tables" value={overview.metrics.activeSessions.toString()} helper="Dining sessions" />
              <Metric icon={<Utensils className="size-4" />} label="Active orders" value={overview.metrics.activeOrders.toString()} helper="Operational pipeline" />
              <Metric icon={<BellRing className="size-4" />} label="Guest requests" value={overview.metrics.openServiceRequests.toString()} helper={`${overview.metrics.soldOutItems} sold-out menu items`} />
            </div>

            <SectionHeading className="mt-8" eyebrow="Network" title="Branch pulse" description="The most important operating signals for every branch, side by side." />
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {overview.branches.map((branch) => <Card key={branch.id} className="overflow-hidden rounded-2xl border-border/80 p-0 shadow-[0_16px_50px_rgb(0_0_0/0.035)]">
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-muted"><Store className="size-4" /></span><div><h2 className="font-semibold">{branch.name}</h2><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{branch.code}</p></div></div><Badge tone={branch.isOpen ? "success" : "neutral"}>{branch.isOpen ? "open" : "closed"}</Badge></div>
                <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4"><BranchStat label="Tables" value={branch.activeSessions} /><BranchStat label="Orders" value={branch.activeOrders} /><BranchStat label="Requests" value={branch.openServiceRequests} /><BranchStat label="Sold out" value={branch.soldOutItems} /></div>
                <div className="flex items-center justify-between px-5 py-4"><span className="text-xs text-muted-foreground">Revenue · last 24h</span><span className="font-bold">{money(branch.revenue24hMinor)}</span></div>
              </Card>)}
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
              <section><SectionHeading eyebrow="Payments" title="Recent merchant ledger" description="Recorded and voided payments remain visible as durable facts." />{overview.recentPayments.length ? <div className="mt-4 grid gap-2">{overview.recentPayments.map((payment) => <Card key={payment.id} className="flex items-center gap-3 p-4"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${payment.status === "VOIDED" ? "bg-destructive/10 text-destructive" : "bg-foreground text-background"}`}><CircleDollarSign className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{payment.reference}</p><Badge tone={payment.status === "VOIDED" ? "danger" : "success"}>{payment.status.toLowerCase()}</Badge></div><p className="mt-1 truncate text-xs text-muted-foreground">{payment.branchName} · {payment.tableLabel} · {payment.method.replaceAll("_", " ")} · {formatBangkokTime(payment.recordedAt)}</p></div><p className="shrink-0 font-bold">{money(payment.totalMinor)}</p></Card>)}</div> : <div className="mt-4"><EmptyState icon={<CircleDollarSign className="size-5" />} title="No payment activity" description="Recorded payments will appear here." /></div>}</section>
              <section><SectionHeading eyebrow="Guest service" title="Open signals" description="Current requests across the tenant, ordered for attention." />{overview.serviceSignals.length ? <div className="mt-4 grid gap-2">{overview.serviceSignals.map((signal) => <Card key={signal.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-semibold">{signal.tableLabel}</p><Badge tone={signal.priority === "HIGH" ? "warning" : "neutral"}>{signal.priority.toLowerCase()}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{signal.branchName} · {signal.type.replaceAll("_", " ").toLowerCase()}</p></div><div className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><Clock3 className="size-3" />{formatBangkokTime(signal.requestedAt)}</div></div></Card>)}</div> : <div className="mt-4"><EmptyState icon={<BellRing className="size-5" />} title="No open service requests" description="The guest service network is clear." /></div>}</section>
            </div>
          </>
        )}
      </div>
    </OperationalShell>
  );
}

function Metric({ icon, label, value, helper }: { readonly icon: React.ReactNode; readonly label: string; readonly value: string; readonly helper: string }) { return <Card className="p-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-muted">{icon}</span><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold tracking-[-0.045em]">{value}</p><p className="text-[10px] text-muted-foreground">{helper}</p></div></div></Card>; }
function BranchStat({ label, value }: { readonly label: string; readonly value: number }) { return <div className="bg-card px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
