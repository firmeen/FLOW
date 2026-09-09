"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Clock3,
  LoaderCircle,
  RefreshCcw,
  Save,
  Store,
  SunMedium,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import type {
  ManagedBranchHours,
  ManagedOpeningWindow,
  ManagementHoursSnapshot,
  OpeningDay,
} from "@/modules/management-hours/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

type EditableWindow = {
  day: OpeningDay;
  isClosed: boolean;
  startTime: string;
  endTime: string;
};

const DAY_LABEL: Record<OpeningDay, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function apiMessage(code: string): string {
  if (code === "MANAGEMENT_HOURS_FORBIDDEN") return "This workspace does not have opening-hours permission.";
  if (code === "MANAGEMENT_HOURS_INVALID_INPUT") return "One or more opening-hour values are invalid.";
  if (code === "MANAGEMENT_HOURS_CONFLICT") return "The branch schedule changed while you were editing it. Refresh and try again.";
  if (code === "MANAGEMENT_HOURS_NOT_FOUND") return "This branch is no longer available.";
  return "Opening hours are temporarily unavailable.";
}

async function readApi<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !payload.ok) {
    throw new Error(apiMessage(payload.ok ? "MANAGEMENT_HOURS_UNAVAILABLE" : payload.error.code));
  }
  return payload.data;
}

function editable(window: ManagedOpeningWindow): EditableWindow {
  return {
    day: window.day,
    isClosed: window.isClosed,
    startTime: window.startTime?.slice(0, 5) ?? "11:00",
    endTime: window.endTime?.slice(0, 5) ?? "20:30",
  };
}

export function DurableOpeningHoursStudio() {
  const [snapshot, setSnapshot] = useState<ManagementHoursSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [windows, setWindows] = useState<readonly EditableWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDay, setPendingDay] = useState<OpeningDay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/hours", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const next = await readApi<ManagementHoursSnapshot>(response);
      setSnapshot(next);
      setError(null);
      setSelectedId((current) =>
        current && next.branches.some((branch) => branch.branchId === current)
          ? current
          : next.branches[0]?.branchId ?? null,
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Opening hours are unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => snapshot?.branches.find((branch) => branch.branchId === selectedId) ?? null,
    [selectedId, snapshot?.branches],
  );

  useEffect(() => {
    setWindows(selected ? selected.windows.map(editable) : []);
  }, [selected]);

  function updateDay(day: OpeningDay, patch: Partial<EditableWindow>) {
    setWindows((current) =>
      current.map((window) => (window.day === day ? { ...window, ...patch } : window)),
    );
  }

  async function saveDay(window: EditableWindow) {
    if (!selected || pendingDay) return;
    setPendingDay(window.day);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/internal/management/hours/${encodeURIComponent(selected.branchId)}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            day: window.day,
            isClosed: window.isClosed,
            startTime: window.isClosed ? null : window.startTime,
            endTime: window.isClosed ? null : window.endTime,
          }),
        },
      );
      const updated = await readApi<ManagedOpeningWindow>(response);
      setSnapshot((current) =>
        current
          ? {
              ...current,
              branches: current.branches.map((branch) =>
                branch.branchId === selected.branchId
                  ? {
                      ...branch,
                      windows: branch.windows.map((item) =>
                        item.day === updated.day ? updated : item,
                      ),
                    }
                  : branch,
              ),
            }
          : current,
      );
      setNotice(`${DAY_LABEL[window.day]} hours saved for ${selected.branchName}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Opening hours could not be saved.");
    } finally {
      setPendingDay(null);
    }
  }

  const openDays = windows.filter((window) => !window.isClosed).length;

  return (
    <OperationalShell
      title="Opening hours"
      subtitle="Durable weekly service schedule"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Overview", href: "/admin", icon: ArrowLeft, active: false },
        { label: "Opening hours", href: "/admin/hours", icon: CalendarClock, active: true },
      ]}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusPill tone="success" dot>Database authority</StatusPill>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => void load(true)}
            leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.05] blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><SunMedium className="size-3.5" /> Weekly operating rhythm</div>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Set the schedule customers and teams can trust.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">Each primary daily window is written directly to branch opening-hours authority and stays separate per tenant and branch.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <HeroMetric label="Branches" value={snapshot?.branches.length ?? 0} />
              <HeroMetric label="Open days" value={openDays} />
            </div>
          </div>
        </section>

        {notice ? <div className="mt-4 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background"><Check className="size-4" />{notice}</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</div> : null}

        {loading ? (
          <div className="grid min-h-[460px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div>
        ) : snapshot && snapshot.branches.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr]">
            <aside>
              <SectionHeading eyebrow="Network" title="Branches" description="Choose the branch schedule to edit." />
              <div className="mt-4 grid gap-2">
                {snapshot.branches.map((branch) => <BranchButton key={branch.branchId} branch={branch} active={selectedId === branch.branchId} onClick={() => setSelectedId(branch.branchId)} />)}
              </div>
            </aside>

            {selected ? (
              <section>
                <SectionHeading eyebrow="Schedule" title={selected.branchName} description={`${selected.branchCode} · ${selected.timezone}`} />
                <div className="mt-4 grid gap-2">
                  {windows.map((window) => (
                    <Card key={window.day} className="rounded-2xl border-border p-4 shadow-[0_12px_40px_rgb(0_0_0/0.025)]">
                      <div className="grid gap-4 lg:grid-cols-[180px_1fr_auto] lg:items-center">
                        <div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${window.isClosed ? "bg-muted text-muted-foreground" : "bg-foreground text-background"}`}><Clock3 className="size-4" /></span><div><p className="font-semibold">{DAY_LABEL[window.day]}</p><p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{window.isClosed ? "Closed" : "Open"}</p></div></div>
                        <div className="grid gap-3 sm:grid-cols-[auto_1fr_1fr] sm:items-center">
                          <label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={!window.isClosed} onChange={(event) => updateDay(window.day, { isClosed: !event.target.checked })} className="size-4 rounded border-border" />Open</label>
                          <input type="time" disabled={window.isClosed} value={window.startTime} onChange={(event) => updateDay(window.day, { startTime: event.target.value })} className={timeClass} aria-label={`${DAY_LABEL[window.day]} opening time`} />
                          <input type="time" disabled={window.isClosed} value={window.endTime} onChange={(event) => updateDay(window.day, { endTime: event.target.value })} className={timeClass} aria-label={`${DAY_LABEL[window.day]} closing time`} />
                        </div>
                        <Button variant="outline" size="sm" disabled={Boolean(pendingDay)} onClick={() => void saveDay(window)} leftIcon={pendingDay === window.day ? <LoaderCircle className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}>Save day</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-6"><EmptyState icon={<CalendarClock className="size-5" />} title="No branch schedule" description="No branches are available for opening-hours management." /></div>
        )}
      </div>
    </OperationalShell>
  );
}

const timeClass = "h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-40 focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";

function BranchButton({ branch, active, onClick }: { readonly branch: ManagedBranchHours; readonly active: boolean; readonly onClick: () => void }) {
  const openDays = branch.windows.filter((window) => !window.isClosed).length;
  return <button type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left transition ${active ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20"}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${active ? "bg-background/10" : "bg-muted"}`}><Store className="size-4" /></span><div><p className="font-semibold">{branch.branchName}</p><p className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${active ? "text-background/55" : "text-muted-foreground"}`}>{branch.branchCode}</p></div></div><Badge tone={openDays ? "success" : "neutral"}>{openDays}/7</Badge></div></button>;
}

function HeroMetric({ label, value }: { readonly label: string; readonly value: number }) {
  return <div className="min-w-[110px] rounded-2xl border border-background/10 bg-background/[0.055] px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-50">{label}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{value}</p></div>;
}
