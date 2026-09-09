"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/foodflow-ui";
import type { ServiceRequestType, ServiceRequestView } from "@/modules/service-operations/types";

type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: { readonly code: string } };

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResult<T>;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "SERVICE_REQUEST_UNAVAILABLE" : body.error.code;
    if (code === "SERVICE_REQUEST_SESSION_REQUIRED") {
      throw new Error("This table session is not active. Scan the table QR again.");
    }
    if (code === "SERVICE_REQUEST_CONTEXT_REQUIRED" || code === "SERVICE_REQUEST_CONTEXT_REVOKED") {
      throw new Error("Your table session has expired. Scan the table QR again.");
    }
    throw new Error("We could not reach the restaurant team. Please try again.");
  }
  return body.data;
}

function activeRequest(requests: readonly ServiceRequestView[], type: ServiceRequestType) {
  return requests.find(
    (request) => request.type === type && (request.status === "OPEN" || request.status === "ACKNOWLEDGED"),
  );
}

export function DurableCustomerServiceDock() {
  const [requests, setRequests] = useState<readonly ServiceRequestView[]>([]);
  const [pending, setPending] = useState<ServiceRequestType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/customer/service-requests", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    setRequests(await readApi<readonly ServiceRequestView[]>(response));
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh().catch(() => undefined), 0);
    const interval = window.setInterval(() => void refresh().catch(() => undefined), 20_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refresh]);

  async function requestService(type: "CALL_STAFF" | "REQUEST_BILL") {
    if (pending || activeRequest(requests, type)) return;
    setPending(type);
    setError(null);
    try {
      const response = await fetch("/api/customer/service-requests", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ type, note: null }),
      });
      const created = await readApi<ServiceRequestView>(response);
      setRequests((current) => [created, ...current.filter((request) => request.id !== created.id)]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not reach the restaurant team.");
    } finally {
      setPending(null);
    }
  }

  const staffRequest = activeRequest(requests, "CALL_STAFF");
  const billRequest = activeRequest(requests, "REQUEST_BILL");
  const activeCount = Number(Boolean(staffRequest)) + Number(Boolean(billRequest));
  const headline = useMemo(() => {
    if (staffRequest?.status === "ACKNOWLEDGED") return "Staff are on the way";
    if (billRequest?.status === "ACKNOWLEDGED") return "Your bill is being prepared";
    if (activeCount) return "Request sent to the team";
    return "Need anything?";
  }, [activeCount, billRequest?.status, staffRequest?.status]);

  return (
    <aside
      className="fixed bottom-[calc(5.7rem+env(safe-area-inset-bottom))] right-4 z-50 w-[min(22rem,calc(100vw-2rem))] sm:bottom-5 sm:right-5"
      aria-label="Table service"
      data-flow-customer-service="durable"
    >
      {open ? (
        <div className="overflow-hidden rounded-[1.55rem] border border-border/80 bg-background/95 shadow-[0_30px_100px_rgb(0_0_0/0.18)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-between gap-3 border-b border-border/80 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded="true"
          >
            <span className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-foreground text-background">
                <Sparkles className="size-3.5" />
              </span>
              <span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Table service</span>
                <span className="mt-0.5 block text-xs font-semibold">{headline}</span>
              </span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          <div className="p-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={staffRequest ? "outline" : "default"}
                disabled={Boolean(pending) || Boolean(staffRequest)}
                onClick={() => void requestService("CALL_STAFF")}
                leftIcon={pending === "CALL_STAFF" ? <LoaderCircle className="size-3.5 animate-spin" /> : staffRequest ? <CheckCircle2 className="size-3.5" /> : <BellRing className="size-3.5" />}
              >
                {staffRequest ? (staffRequest.status === "ACKNOWLEDGED" ? "Staff coming" : "Staff called") : "Call staff"}
              </Button>
              <Button
                variant="outline"
                disabled={Boolean(pending) || Boolean(billRequest)}
                onClick={() => void requestService("REQUEST_BILL")}
                leftIcon={pending === "REQUEST_BILL" ? <LoaderCircle className="size-3.5 animate-spin" /> : billRequest ? <CheckCircle2 className="size-3.5" /> : <ReceiptText className="size-3.5" />}
              >
                {billRequest ? (billRequest.status === "ACKNOWLEDGED" ? "Bill coming" : "Bill requested") : "Request bill"}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[9px] font-bold uppercase tracking-[0.11em] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" /> Live with restaurant team</span>
              {activeCount ? <span>{activeCount} active</span> : null}
            </div>
            {error ? <p className="mt-2 rounded-xl bg-destructive/6 px-3 py-2 text-[11px] font-medium leading-4 text-destructive">{error}</p> : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-3 rounded-full border border-border/80 bg-background/95 py-2 pl-2 pr-4 shadow-[0_20px_70px_rgb(0_0_0/0.16)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded="false"
        >
          <span className="relative grid size-9 place-items-center rounded-full bg-foreground text-background">
            <BellRing className="size-3.5" />
            {activeCount ? <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full border-2 border-background bg-emerald-500 text-[8px] font-bold text-white">{activeCount}</span> : null}
          </span>
          <span className="text-left">
            <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Table service</span>
            <span className="block text-xs font-semibold">{headline}</span>
          </span>
        </button>
      )}
    </aside>
  );
}
