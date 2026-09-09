"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, HandPlatter, LayoutGrid, LoaderCircle, RefreshCcw, Search, Sparkles, Utensils } from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import { formatTHB } from "@/lib/currency";
import type { StaffMenuAvailability, StaffMenuControlItem, StaffMenuControlSnapshot } from "@/modules/menu-operations/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

function money(minor: number) { return formatTHB(minor / 100); }
function errorMessage(code: string) {
  if (code === "MENU_CONFLICT") return "This menu item changed elsewhere. Refresh before trying again.";
  if (code === "MENU_FORBIDDEN") return "This branch workspace cannot change menu availability.";
  return "Live menu controls are temporarily unavailable.";
}
async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) throw new Error(body.ok ? "Menu request failed." : errorMessage(body.error.code));
  return body.data;
}

export function DurableStaffMenuWorkspace() {
  const [snapshot, setSnapshot] = useState<StaffMenuControlSnapshot | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/internal/menu", { cache: "no-store", credentials: "same-origin" });
      setSnapshot(await readApi<StaffMenuControlSnapshot>(response));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Menu controls are unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const items = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return (snapshot?.items ?? []).filter((item) => {
      if (category !== "ALL" && item.categoryId !== category) return false;
      if (!normalized) return true;
      return [item.name, item.thaiName ?? "", item.categoryName, item.station].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [category, search, snapshot?.items]);

  async function setAvailability(item: StaffMenuControlItem, status: StaffMenuAvailability) {
    if (pendingId) return;
    setPendingId(item.id);
    setError(null);
    try {
      const response = await fetch(`/api/internal/menu/${item.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await readApi<StaffMenuControlItem>(response);
      setSnapshot((current) => current ? { ...current, items: current.items.map((candidate) => candidate.id === updated.id ? updated : candidate) } : current);
      setNotice(`${updated.name} · ${updated.status === "ACTIVE" ? "available" : "sold out"}`);
      window.setTimeout(() => setNotice(null), 1800);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Menu item could not be updated.");
    } finally {
      setPendingId(null);
    }
  }

  const soldOut = snapshot?.items.filter((item) => item.status === "SOLD_OUT").length ?? 0;
  const live = snapshot?.items.filter((item) => item.status === "ACTIVE").length ?? 0;

  return (
    <OperationalShell
      title="Menu availability"
      subtitle="Fast branch controls backed by the restaurant menu record"
      role="Staff"
      currentRole="staff"
      navItems={[
        { label: "Orders", href: "/staff#orders", icon: Sparkles, active: false },
        { label: "Tables", href: "/staff#tables", icon: LayoutGrid, active: false },
        { label: "Ready", href: "/staff#ready", icon: HandPlatter, active: false },
        { label: "Menu", href: "/staff#menu", icon: Utensils, active: true, badge: soldOut || undefined },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Durable menu</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Service control" title="Keep the live menu accurate" description="Restore or sell out items in seconds. Draft, hidden and archived configuration stays outside this floor-control surface." />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Available" value={live} helper="Visible to customers" />
          <Metric label="Sold out" value={soldOut} helper="Blocked from new carts" />
          <Metric label="Menu records" value={snapshot?.items.length ?? 0} helper="Current restaurant catalog" />
        </div>

        {(error || notice) && <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-medium ${error ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"}`}>{error ?? notice}</div>}

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
          <label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu, station or category" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-foreground/35" /></label>
          <div className="flex gap-2 overflow-x-auto">{[{ id: "ALL", name: "All" }, ...(snapshot?.categories ?? [])].map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${category === item.id ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}>{item.name}</button>)}</div>
        </div>

        {loading ? <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : items.length === 0 ? <div className="mt-5"><EmptyState icon={<CheckCircle2 className="size-5" />} title="No matching menu items" description="Adjust the category or search phrase." /></div> : (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const canQuickControl = item.status === "ACTIVE" || item.status === "SOLD_OUT";
              const nextStatus: StaffMenuAvailability = item.status === "ACTIVE" ? "SOLD_OUT" : "ACTIVE";
              return <Card key={item.id} className="group overflow-hidden rounded-2xl border-border/80 p-0 shadow-[0_16px_45px_rgb(0_0_0/0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgb(0_0_0/0.06)]">
                <div className={`h-1 ${item.status === "SOLD_OUT" ? "bg-amber-500" : item.status === "ACTIVE" ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{item.categoryName} · {item.station.replaceAll("_", " ")}</p><h2 className="mt-1 truncate text-lg font-semibold tracking-[-0.035em]">{item.name}</h2>{item.thaiName && <p className="truncate text-xs text-muted-foreground">{item.thaiName}</p>}</div><Badge tone={item.status === "SOLD_OUT" ? "warning" : item.status === "ACTIVE" ? "success" : "neutral"}>{item.status.replaceAll("_", " ").toLowerCase()}</Badge></div>
                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4"><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Price</p><p className="mt-1 text-lg font-bold">{money(item.priceMinor)}</p></div>{canQuickControl ? <Button variant={item.status === "ACTIVE" ? "outline" : "default"} size="sm" isLoading={pendingId === item.id} loadingText="Saving..." onClick={() => void setAvailability(item, nextStatus)}>{item.status === "ACTIVE" ? "Mark sold out" : "Restore"}</Button> : <span className="text-[10px] font-semibold text-muted-foreground">Managed in admin</span>}</div>
                </div>
              </Card>;
            })}
          </div>
        )}
      </div>
    </OperationalShell>
  );
}

function Metric({ label, value, helper }: { readonly label: string; readonly value: number; readonly helper: string }) { return <Card className="p-4"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.045em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{helper}</p></Card>; }
