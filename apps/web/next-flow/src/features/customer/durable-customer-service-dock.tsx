"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, LoaderCircle, ReceiptText } from "lucide-react";

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/customer/service-requests", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      })
        .then(readApi<readonly ServiceRequestView[]>)
        .then(setRequests)
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  return (
    <aside
      className="fixed bottom-[calc(5.7rem+env(safe-area-inset-bottom))] right-4 z-40 w-[min(22rem,calc(100vw-2rem))] rounded-[1.4rem] border border-border/80 bg-background/94 p-3 shadow-[0_24px_80px_rgb(0_0_0/0.14)] backdrop-blur-xl sm:bottom-5 sm:right-5"
      aria-label="Table service"
      data-flow-customer-service="durable"
    >
      <div className="flex items-center justify-between gap-3 px-1 pb-2.5">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Table service</p>
          <p className="mt-0.5 text-xs font-semibold">Need anything?</p>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Live
        </span>
      </div>

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
      {error ? <p className="mt-2 rounded-xl bg-destructive/6 px-3 py-2 text-[11px] font-medium leading-4 text-destructive">{error}</p> : null}
    </aside>
  );
}
