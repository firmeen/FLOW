"use client";

import { useState } from "react";
import { AlertTriangle, ClockArrowDown, LoaderCircle, RotateCcw, Zap } from "lucide-react";

import { Badge, Button } from "@/components/foodflow-ui";

import type {
  OperationalOrderDeferReasonCode,
  OperationalOrderDetail,
  OperationalOrderPriorityReasonCode,
  OperationalOrderRemakeReasonCode,
} from "./operational-orders-ui";

type ControlAction =
  | "SET_PRIORITY"
  | "CLEAR_PRIORITY"
  | "DEFER_ORDER"
  | "RESUME_ORDER"
  | "REQUEST_REMAKE"
  | "START_REMAKE";

type ApiSuccess = {
  readonly ok: true;
  readonly data: {
    readonly action: ControlAction;
    readonly orderNumber: string;
    readonly status: OperationalOrderDetail["status"];
    readonly priority: "NORMAL" | "URGENT";
    readonly deferred: boolean;
    readonly remakeCount: number;
  };
};
type ApiFailure = {
  readonly ok: false;
  readonly error: { readonly code: string; readonly message: string };
};

const PRIORITY_REASONS: readonly (readonly [OperationalOrderPriorityReasonCode, string])[] = [
  ["CUSTOMER_ESCALATION", "Customer escalation"],
  ["SERVICE_RECOVERY", "Service recovery"],
  ["WAIT_TIME", "Wait time"],
  ["MANAGER_OVERRIDE", "Manager override"],
  ["SAFETY_OR_QUALITY", "Safety or quality"],
  ["OTHER", "Other"],
];
const DEFER_REASONS: readonly (readonly [OperationalOrderDeferReasonCode, string])[] = [
  ["CAPACITY", "Capacity"],
  ["INGREDIENT_WAIT", "Ingredient wait"],
  ["EQUIPMENT_ISSUE", "Equipment issue"],
  ["CUSTOMER_REQUEST", "Customer request"],
  ["STAFFING", "Staffing"],
  ["DEPENDENCY", "Dependency"],
  ["OTHER", "Other"],
];
const REMAKE_REASONS: readonly (readonly [OperationalOrderRemakeReasonCode, string])[] = [
  ["QUALITY_ISSUE", "Quality issue"],
  ["WRONG_ITEM", "Wrong item"],
  ["MISSING_COMPONENT", "Missing component"],
  ["TEMPERATURE", "Temperature"],
  ["DAMAGED_OR_SPILLED", "Damaged or spilled"],
  ["CUSTOMER_REQUEST", "Customer request"],
  ["STAFF_ERROR", "Staff error"],
  ["OTHER", "Other"],
];

const PRIORITY_ELIGIBLE = new Set<OperationalOrderDetail["status"]>([
  "PENDING_CONFIRMATION",
  "CHANGED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "REMAKE",
]);
const DEFER_ELIGIBLE = new Set<OperationalOrderDetail["status"]>([
  "ACCEPTED",
  "PREPARING",
  "REMAKE",
]);
const REMAKE_ELIGIBLE = new Set<OperationalOrderDetail["status"]>(["READY", "SERVED"]);

export function OperationalOrderProductionControls({
  detail,
  disabled,
  onBusyChange,
  onAuthFailure,
  onNotice,
  onError,
  onReconcile,
}: {
  detail: OperationalOrderDetail;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onAuthFailure: (status: number) => void;
  onNotice: (message: string) => void;
  onError: (message: string | null) => void;
  onReconcile: (preserveError: boolean) => Promise<void>;
}) {
  const [priorityReason, setPriorityReason] = useState<OperationalOrderPriorityReasonCode | "">("");
  const [deferReason, setDeferReason] = useState<OperationalOrderDeferReasonCode | "">("");
  const [deferredUntil, setDeferredUntil] = useState("");
  const [remakeReason, setRemakeReason] = useState<OperationalOrderRemakeReasonCode | "">("");
  const [busy, setBusy] = useState<ControlAction | null>(null);

  const priorityEligible = PRIORITY_ELIGIBLE.has(detail.status);
  const deferEligible = DEFER_ELIGIBLE.has(detail.status);
  const remakeRequestEligible =
    REMAKE_ELIGIBLE.has(detail.status) && detail.remakeCount < 3 && !detail.deferred;
  const remakeStartEligible = detail.status === "REMAKE" && !detail.deferred;
  const visible = priorityEligible || deferEligible || remakeRequestEligible || remakeStartEligible;

  if (!visible) return null;

  async function submit(action: ControlAction, payload: Record<string, unknown>) {
    if (busy || disabled) return;
    setBusy(action);
    onBusyChange(true);
    onError(null);
    try {
      const response = await fetch(
        `/api/internal/orders/${encodeURIComponent(detail.id)}/production-control`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action, ...payload }),
        },
      );
      const body = (await response.json()) as ApiSuccess | ApiFailure;
      if (!response.ok || !body.ok) {
        const message = body.ok ? "Production control is temporarily unavailable." : body.error.message;
        if (response.status === 401) {
          onAuthFailure(response.status);
          return;
        }
        if (response.status === 403) {
          onError("You can view this order, but order.manage permission is required for production controls.");
          return;
        }
        if (response.status === 409) {
          onError("Another order mutation already won. The durable production state has been refreshed.");
          await onReconcile(true);
          return;
        }
        if (response.status === 404) {
          onError("This order is no longer available in the active branch.");
          await onReconcile(true);
          return;
        }
        onError(message);
        return;
      }

      onNotice(controlSuccessMessage(body.data));
      setPriorityReason("");
      setDeferReason("");
      setDeferredUntil("");
      setRemakeReason("");
      await onReconcile(false);
    } catch {
      onError("Production control is temporarily unavailable. Refresh the order before retrying.");
    } finally {
      setBusy(null);
      onBusyChange(false);
    }
  }

  const untilIso = deferredUntil ? new Date(deferredUntil).toISOString() : null;

  return (
    <section className="border border-border bg-card p-4" aria-labelledby="order-production-control-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="order-production-control-heading" className="text-sm font-semibold text-foreground">
            Production controls
          </h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Priority and defer are operational metadata. Remake uses a bounded server-owned lifecycle path. Every action is branch-scoped and persisted before the UI refreshes.
          </p>
        </div>
        <Badge tone="neutral">order.manage</Badge>
      </div>

      <div className="mt-4 grid gap-4 border-t border-border pt-4 lg:grid-cols-3">
        {priorityEligible ? (
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" aria-hidden="true" />
              <p className="text-xs font-semibold text-foreground">Priority</p>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              Current: {detail.priority === "URGENT" ? "Urgent" : "Normal"}
            </p>
            {detail.priority === "URGENT" ? (
              <Button
                className="mt-3"
                variant="outline"
                disabled={disabled || Boolean(busy)}
                leftIcon={busy === "CLEAR_PRIORITY" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                onClick={() => void submit("CLEAR_PRIORITY", {})}
              >
                Clear urgency
              </Button>
            ) : (
              <>
                <label className="mt-3 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Reason
                  <select
                    className="mt-1 block h-9 w-full rounded-md border border-border bg-card px-2 text-xs font-medium normal-case tracking-normal text-foreground"
                    value={priorityReason}
                    disabled={disabled || Boolean(busy)}
                    onChange={(event) => setPriorityReason(event.target.value as OperationalOrderPriorityReasonCode | "")}
                  >
                    <option value="">Choose reason</option>
                    {PRIORITY_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <Button
                  className="mt-2"
                  disabled={!priorityReason || disabled || Boolean(busy)}
                  leftIcon={busy === "SET_PRIORITY" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                  onClick={() => priorityReason && void submit("SET_PRIORITY", { reasonCode: priorityReason })}
                >
                  Mark urgent
                </Button>
              </>
            )}
          </div>
        ) : null}

        {deferEligible ? (
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <ClockArrowDown className="size-4" aria-hidden="true" />
              <p className="text-xs font-semibold text-foreground">Delay / defer</p>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              {detail.deferred ? "Normal lifecycle progression is paused." : "Defer without inventing a new lifecycle status."}
            </p>
            {detail.deferred ? (
              <Button
                className="mt-3"
                variant="outline"
                disabled={disabled || Boolean(busy)}
                leftIcon={busy === "RESUME_ORDER" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                onClick={() => void submit("RESUME_ORDER", {})}
              >
                Resume order
              </Button>
            ) : (
              <>
                <label className="mt-3 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Reason
                  <select
                    className="mt-1 block h-9 w-full rounded-md border border-border bg-card px-2 text-xs font-medium normal-case tracking-normal text-foreground"
                    value={deferReason}
                    disabled={disabled || Boolean(busy)}
                    onChange={(event) => setDeferReason(event.target.value as OperationalOrderDeferReasonCode | "")}
                  >
                    <option value="">Choose reason</option>
                    {DEFER_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="mt-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Resume target (optional, max 24h)
                  <input
                    type="datetime-local"
                    className="mt-1 block h-9 w-full rounded-md border border-border bg-card px-2 text-xs font-medium normal-case tracking-normal text-foreground"
                    value={deferredUntil}
                    disabled={disabled || Boolean(busy)}
                    onChange={(event) => setDeferredUntil(event.target.value)}
                  />
                </label>
                <Button
                  className="mt-2"
                  disabled={!deferReason || disabled || Boolean(busy)}
                  leftIcon={busy === "DEFER_ORDER" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                  onClick={() => deferReason && void submit("DEFER_ORDER", { reasonCode: deferReason, deferredUntil: untilIso })}
                >
                  Defer order
                </Button>
              </>
            )}
          </div>
        ) : null}

        {remakeRequestEligible || remakeStartEligible ? (
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              {remakeStartEligible ? <RotateCcw className="size-4" aria-hidden="true" /> : <AlertTriangle className="size-4" aria-hidden="true" />}
              <p className="text-xs font-semibold text-foreground">Remake</p>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              {remakeStartEligible
                ? `Remake ${detail.remakeCount}/3 is awaiting controlled re-production.`
                : `Request a bounded remake (${detail.remakeCount}/3 used).`}
            </p>
            {remakeStartEligible ? (
              <Button
                className="mt-3"
                disabled={disabled || Boolean(busy)}
                leftIcon={busy === "START_REMAKE" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                onClick={() => void submit("START_REMAKE", {})}
              >
                Start remake
              </Button>
            ) : (
              <>
                <label className="mt-3 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Reason
                  <select
                    className="mt-1 block h-9 w-full rounded-md border border-border bg-card px-2 text-xs font-medium normal-case tracking-normal text-foreground"
                    value={remakeReason}
                    disabled={disabled || Boolean(busy)}
                    onChange={(event) => setRemakeReason(event.target.value as OperationalOrderRemakeReasonCode | "")}
                  >
                    <option value="">Choose reason</option>
                    {REMAKE_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <Button
                  className="mt-2"
                  disabled={!remakeReason || disabled || Boolean(busy)}
                  leftIcon={busy === "REQUEST_REMAKE" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                  onClick={() => remakeReason && void submit("REQUEST_REMAKE", { reasonCode: remakeReason })}
                >
                  Request remake
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function controlSuccessMessage(data: ApiSuccess["data"]): string {
  switch (data.action) {
    case "SET_PRIORITY":
      return `Order ${data.orderNumber} marked urgent.`;
    case "CLEAR_PRIORITY":
      return `Order ${data.orderNumber} returned to normal priority.`;
    case "DEFER_ORDER":
      return `Order ${data.orderNumber} deferred.`;
    case "RESUME_ORDER":
      return `Order ${data.orderNumber} resumed.`;
    case "REQUEST_REMAKE":
      return `Order ${data.orderNumber} moved to remake (${data.remakeCount}/3).`;
    case "START_REMAKE":
      return `Order ${data.orderNumber} remake started.`;
  }
}
