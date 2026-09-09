"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Building2,
  Clock3,
  Filter,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import { formatBangkokDateTime } from "@/lib/date";
import type {
  ManagementActivityEvent,
  ManagementActivitySnapshot,
} from "@/modules/management-activity/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "MANAGEMENT_ACTIVITY_UNAVAILABLE" : body.error.code;
    if (code === "MANAGEMENT_ACTIVITY_FORBIDDEN") {
      throw new Error("This workspace does not have audit visibility.");
    }
    throw new Error("The activity ledger is temporarily unavailable.");
  }
  return body.data;
}

function actionTone(action: string): "success" | "warning" | "neutral" | "danger" {
  const normalized = action.toUpperCase();
  if (normalized.includes("VOID") || normalized.includes("REJECT") || normalized.includes("CANCEL")) return "danger";
  if (normalized.includes("PAYMENT") || normalized.includes("RESOLVED") || normalized.includes("READY")) return "success";
  if (normalized.includes("UPDATE") || normalized.includes("REQUEST") || normalized.includes("ACKNOWLEDGE")) return "warning";
  return "neutral";
}

function actionLabel(action: string): string {
  return action.replaceAll("_", " ").toLowerCase();
}

export function DurableActivityLedger() {
  const [snapshot, setSnapshot] = useState<ManagementActivitySnapshot | null>(null);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/activity", { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } });
      setSnapshot(await readApi<ManagementActivitySnapshot>(response));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Activity ledger is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const entityTypes = useMemo(() => Array.from(new Set((snapshot?.events ?? []).map((event) => event.entityType))).sort(), [snapshot?.events]);
  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (snapshot?.events ?? []).filter((event) => {
      if (entityFilter !== "ALL" && event.entityType !== entityFilter) return false;
      if (!term) return true;
      return `${event.summary} ${event.action} ${event.entityType} ${event.actorName ?? ""} ${event.branchName ?? ""}`.toLocaleLowerCase().includes(term);
    });
  }, [entityFilter, search, snapshot?.events]);

  return (
    <OperationalShell
      title="Activity ledger"
      subtitle="Tenant-wide durable operating history"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Overview", href: "/admin", icon: ArrowLeft, active: false },
        { label: "Activity", href: "/admin/activity", icon: Activity, active: true },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Audit authority</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.05] blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><ShieldCheck className="size-3.5" /> Immutable operating evidence</div><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">See what changed, where it changed, and who was responsible.</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">Operational, payment, service, menu and settings events are presented from the durable tenant audit stream.</p></div>
            <div className="rounded-2xl border border-background/10 bg-background/[0.055] px-5 py-4"><p className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-50">Recent events</p><p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{snapshot?.events.length ?? 0}</p></div>
          </div>
        </section>

        {error ? <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</div> : null}

        <SectionHeading className="mt-8" eyebrow="History" title="Operating activity" description="Search the latest tenant events without changing durable state." />
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_240px]">
          <label className="relative block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action, actor, branch or summary" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-ring/15" /></label>
          <label className="relative"><Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm font-semibold outline-none"><option value="ALL">All entity types</option>{entityTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></label>
        </div>

        {loading ? <div className="grid min-h-[430px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : visible.length ? (
          <div className="mt-5 grid gap-2">
            {visible.map((event) => <ActivityRow key={event.id} event={event} />)}
          </div>
        ) : <div className="mt-5"><EmptyState icon={<Activity className="size-5" />} title="No matching activity" description="Change the search or entity filter." /></div>}
      </div>
    </OperationalShell>
  );
}

function ActivityRow({ event }: { readonly event: ManagementActivityEvent }) {
  return (
    <Card className="rounded-2xl border-border p-4 shadow-[0_14px_45px_rgb(0_0_0/0.03)] transition hover:border-foreground/15 hover:shadow-[0_18px_60px_rgb(0_0_0/0.05)]">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-muted"><Activity className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><p className="font-semibold tracking-[-0.02em]">{event.summary}</p><Badge tone={actionTone(event.action)}>{actionLabel(event.action)}</Badge></div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock3 className="size-3" />{formatBangkokDateTime(event.occurredAt)}</span>
            <span className="flex items-center gap-1.5"><UserRound className="size-3" />{event.actorName ?? (event.actorId ? "Authorized actor" : "System")}</span>
            {event.branchName ? <span className="flex items-center gap-1.5"><Building2 className="size-3" />{event.branchName}</span> : null}
          </div>
          {event.reason ? <p className="mt-2 rounded-xl bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">{event.reason}</p> : null}
        </div>
        <span className="hidden shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:block">{event.entityType.replaceAll("_", " ")}</span>
      </div>
    </Card>
  );
}
