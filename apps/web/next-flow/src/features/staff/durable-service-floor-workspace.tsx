"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Armchair,
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  HandPlatter,
  LayoutGrid,
  LoaderCircle,
  RefreshCcw,
  ReceiptText,
  Utensils,
  UsersRound,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import { formatBangkokTime } from "@/lib/date";
import type { FloorSnapshot, ServiceRequestView } from "@/modules/service-operations/types";

type WorkspaceMode = "tables" | "service";
type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: { readonly code: string } };

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResult<T>;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "SERVICE_REQUEST_UNAVAILABLE" : body.error.code;
    if (response.status === 403) throw new Error("This workspace requires service permission for the active branch.");
    if (response.status === 401) throw new Error("Your session has expired. Sign in again to continue.");
    if (code === "SERVICE_REQUEST_CONFLICT") throw new Error("That request changed while you were working on it. Refresh and try again.");
    throw new Error("Live floor service is temporarily unavailable.");
  }
  return body.data;
}

function requestLabel(type: ServiceRequestView["type"]): string {
  if (type === "CALL_STAFF") return "Guest needs staff";
  if (type === "REQUEST_BILL") return "Bill requested";
  return "Guest request";
}

export function DurableServiceFloorWorkspace({ mode }: { readonly mode: WorkspaceMode }) {
  const [floor, setFloor] = useState<FloorSnapshot | null>(null);
  const [requests, setRequests] = useState<readonly ServiceRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [nextFloor, nextRequests] = await Promise.all([
        fetch("/api/internal/floor", { cache: "no-store", credentials: "same-origin" }).then(readApi<FloorSnapshot>),
        fetch("/api/internal/service-requests", { cache: "no-store", credentials: "same-origin" }).then(readApi<readonly ServiceRequestView[]>),
      ]);
      setFloor(nextFloor);
      setRequests(nextRequests);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Live floor service is temporarily unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const urgentCount = useMemo(() => requests.filter((request) => request.priority === "HIGH").length, [requests]);
  const occupiedCount = floor?.tables.filter((table) => table.session).length ?? 0;
  const readyCount = floor?.tables.reduce((sum, table) => sum + table.readyOrderCount, 0) ?? 0;

  async function mutate(requestId: string, action: "ACKNOWLEDGE" | "RESOLVE") {
    if (pendingId) return;
    setPendingId(requestId);
    setError(null);
    try {
      const response = await fetch(`/api/internal/service-requests/${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await readApi<ServiceRequestView>(response);
      setNotice(action === "ACKNOWLEDGE" ? "Request acknowledged" : "Request resolved");
      await load(true);
      window.setTimeout(() => setNotice(null), 2200);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "The request could not be updated.");
    } finally {
      setPendingId(null);
    }
  }

  const navItems = [
    { label: "Orders", href: "/staff#orders", icon: ReceiptText, active: false },
    { label: "Tables", href: "/staff#tables", icon: LayoutGrid, active: mode === "tables" },
    { label: "Service", href: "/staff#service", icon: BellRing, active: mode === "service", badge: requests.length || undefined },
    { label: "Ready", href: "/staff#ready", icon: HandPlatter, active: false, badge: readyCount || undefined },
    { label: "Menu", href: "/staff#menu", icon: Utensils, active: false },
  ];

  return (
    <OperationalShell
      title={mode === "tables" ? "Live floor" : "Guest service"}
      subtitle={mode === "tables" ? "Durable table sessions, orders and service signals" : "One branch queue for every guest request"}
      role="Staff"
      currentRole="staff"
      navItems={navItems}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusPill tone="success" dot>Database live</StatusPill>
          <Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>
            Refresh
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl">
        {notice ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-lg" role="status">
            <CheckCircle2 className="size-4" aria-hidden="true" /> {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Occupied tables" value={occupiedCount} helper="Active dining sessions" icon={<UsersRound className="size-4" />} />
          <Metric label="Guest requests" value={requests.length} helper={urgentCount ? `${urgentCount} high priority` : "Open or acknowledged"} icon={<BellRing className="size-4" />} />
          <Metric label="Ready to serve" value={readyCount} helper="Orders waiting on floor handoff" icon={<HandPlatter className="size-4" />} />
        </div>

        {mode === "tables" ? (
          <section className="mt-8">
            <SectionHeading eyebrow="Branch floor" title="Every table, in one calm view" description="Session, order and service state comes from the durable branch data plane—not browser simulation." />
            {loading && !floor ? <LoadingState label="Loading live tables" /> : null}
            {!loading && floor && floor.tables.length === 0 ? <div className="mt-6"><EmptyState icon={<Armchair className="size-5" />} title="No tables configured" description="Active branch tables will appear here after configuration." /></div> : null}
            {floor ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {floor.tables.map((table) => (
                  <Card key={table.id} className={`overflow-hidden border ${table.openServiceCount ? "border-foreground/25" : "border-border"}`}>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{table.code}</p>
                          <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em]">{table.label}</h2>
                        </div>
                        <Badge tone={table.session ? "info" : table.active ? "success" : "neutral"}>{table.session ? "Occupied" : table.active ? "Available" : "Inactive"}</Badge>
                      </div>
                      <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-muted/35 py-3 text-center">
                        <MiniMetric label="Guests" value={table.session?.guestCount ?? 0} />
                        <MiniMetric label="Orders" value={table.openOrderCount} />
                        <MiniMetric label="Requests" value={table.openServiceCount} />
                      </div>
                      {table.session ? (
                        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> Opened {formatBangkokTime(table.session.openedAt)}</span>
                          <span>{table.session.sessionNumber}</span>
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-muted-foreground">{table.seats} seats · ready for the next verified table session</p>
                      )}
                    </div>
                    {table.openServiceCount || table.readyOrderCount ? (
                      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/40 px-5 py-3">
                        {table.openServiceCount ? <Badge tone="warning">{table.openServiceCount} service</Badge> : null}
                        {table.readyOrderCount ? <Badge tone="success">{table.readyOrderCount} ready</Badge> : null}
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <section className="mt-8">
            <SectionHeading eyebrow="Guest care" title="Requests that never disappear into the room" description="Acknowledge ownership, resolve deliberately, and keep every table handoff visible." />
            {loading && requests.length === 0 ? <LoadingState label="Loading guest requests" /> : null}
            {!loading && requests.length === 0 ? <div className="mt-6"><EmptyState icon={<CheckCircle2 className="size-5" />} title="Floor is clear" description="New call-staff and bill requests will appear here immediately." /></div> : null}
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              {requests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={request.type === "REQUEST_BILL" ? "info" : request.priority === "HIGH" ? "danger" : "warning"}>{requestLabel(request.type)}</Badge>
                          <Badge tone="neutral">{request.status === "ACKNOWLEDGED" ? "Owned" : "New"}</Badge>
                        </div>
                        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em]">{request.tableLabel}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Requested {formatBangkokTime(request.requestedAt)}</p>
                      </div>
                      <span className="grid size-11 place-items-center rounded-2xl bg-foreground text-background"><BellRing className="size-4" /></span>
                    </div>
                    {request.note ? <p className="mt-4 rounded-xl border border-border bg-muted/40 px-3.5 py-3 text-sm leading-6">{request.note}</p> : null}
                  </div>
                  <div className="flex gap-2 border-t border-border bg-muted/35 p-4">
                    {request.status === "OPEN" ? (
                      <Button className="flex-1" variant="outline" disabled={Boolean(pendingId)} isLoading={pendingId === request.id} onClick={() => void mutate(request.id, "ACKNOWLEDGE")} leftIcon={<Check className="size-4" />}>
                        Acknowledge
                      </Button>
                    ) : null}
                    <Button className="flex-1" disabled={Boolean(pendingId)} isLoading={pendingId === request.id} onClick={() => void mutate(request.id, "RESOLVE")} leftIcon={<CheckCircle2 className="size-4" />}>
                      Resolve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </OperationalShell>
  );
}

function Metric({ label, value, helper, icon }: { label: string; value: number; helper: string; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">{icon}</span>
      <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-0.5 text-2xl font-semibold tracking-[-0.045em]">{value}</p><p className="truncate text-[11px] text-muted-foreground">{helper}</p></div>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div><p className="text-lg font-semibold tracking-[-0.035em]">{value}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p></div>;
}

function LoadingState({ label }: { label: string }) {
  return <div className="mt-8 grid min-h-48 place-items-center rounded-2xl border border-dashed border-border"><div className="text-center"><LoaderCircle className="mx-auto size-5 animate-spin" /><p className="mt-3 text-sm font-semibold">{label}</p></div></div>;
}
