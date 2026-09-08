"use client";

import type { ReactNode } from "react";
import { ChevronRight, Clock3, Sparkles } from "lucide-react";

import { Badge, Button, Card } from "@/components/foodflow-ui";
import { formatBangkokTime, formatElapsed } from "@/lib/date";

export type OperationalOrderStatus =
  | "PENDING_CONFIRMATION"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "CLOSED"
  | "REJECTED"
  | "CANCELLED"
  | "CHANGED"
  | "REMAKE"
  | "VOIDED";

export type OperationalOrderPriorityReasonCode =
  | "CUSTOMER_ESCALATION"
  | "SERVICE_RECOVERY"
  | "WAIT_TIME"
  | "MANAGER_OVERRIDE"
  | "SAFETY_OR_QUALITY"
  | "OTHER";
export type OperationalOrderDeferReasonCode =
  | "CAPACITY"
  | "INGREDIENT_WAIT"
  | "EQUIPMENT_ISSUE"
  | "CUSTOMER_REQUEST"
  | "STAFFING"
  | "DEPENDENCY"
  | "OTHER";
export type OperationalOrderRemakeReasonCode =
  | "QUALITY_ISSUE"
  | "WRONG_ITEM"
  | "MISSING_COMPONENT"
  | "TEMPERATURE"
  | "DAMAGED_OR_SPILLED"
  | "CUSTOMER_REQUEST"
  | "STAFF_ERROR"
  | "OTHER";

export interface OperationalOrderQueueItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: OperationalOrderStatus;
  readonly customerStatus: string | null;
  readonly source: "CUSTOMER_WEB" | "UNKNOWN";
  readonly orderingMode: "DINE_IN";
  readonly tableId: string;
  readonly tableLabel: string | null;
  readonly submittedAt: string;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly lineCount: number;
  readonly unitCount: number;
  readonly hasCustomerNote: boolean;
  readonly priority: "NORMAL" | "URGENT";
  readonly priorityReason: OperationalOrderPriorityReasonCode | null;
  readonly prioritizedAt: string | null;
  readonly deferred: boolean;
  readonly deferReason: OperationalOrderDeferReasonCode | null;
  readonly deferredAt: string | null;
  readonly deferredUntil: string | null;
  readonly remakeCount: number;
  readonly lastRemakeReason: OperationalOrderRemakeReasonCode | null;
  readonly remakeRequestedAt: string | null;
}

export interface OperationalOrderDetail extends OperationalOrderQueueItem {
  readonly customerNote: string | null;
  readonly items: readonly {
    readonly id: string;
    readonly menuItemName: string;
    readonly quantity: number;
    readonly lineTotalMinor: string;
    readonly specialRequest: string | null;
    readonly modifiers: readonly {
      readonly id: string;
      readonly modifierGroupName: string;
      readonly modifierChoiceName: string;
      readonly priceDeltaMinor: string;
    }[];
  }[];
}

export interface OperationalOrderQueuePage {
  readonly orders: readonly OperationalOrderQueueItem[];
  readonly nextCursor: string | null;
  readonly incomingCount: number;
}

function statusTone(
  status: OperationalOrderStatus,
): "neutral" | "warning" | "success" | "danger" {
  if (["REJECTED", "CANCELLED", "VOIDED"].includes(status)) return "danger";
  if (["READY", "SERVED", "PAID", "CLOSED"].includes(status)) return "success";
  if (["PENDING_CONFIRMATION", "CHANGED", "REMAKE"].includes(status)) return "warning";
  return "neutral";
}

export function QueueMetric({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/80 p-4 shadow-[0_14px_42px_rgb(0_0_0/0.035)] transition hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_20px_55px_rgb(0_0_0/0.055)]">
      <div className="absolute -right-8 -top-10 size-24 rounded-full bg-foreground/[0.025] blur-xl" />
      <div className="relative flex items-center gap-3.5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-border/70 bg-muted/70 text-foreground"
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-semibold tracking-[-0.045em] text-foreground">
            {value}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

export function OperationalOrderCard({
  order,
  now,
  onReview,
}: {
  order: OperationalOrderQueueItem;
  now: number;
  onReview: () => void;
}) {
  const urgent = order.priority === "URGENT";

  return (
    <Card
      className={`group relative overflow-hidden rounded-[1.6rem] border-border/80 shadow-[0_18px_55px_rgb(0_0_0/0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgb(0_0_0/0.075)] ${
        urgent ? "ring-1 ring-destructive/20" : ""
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${urgent ? "bg-destructive" : "bg-foreground/70"}`}
      />
      <div className="p-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {order.tableLabel ?? "Unknown table"}
              </p>
              <span className="size-1 rounded-full bg-border" aria-hidden="true" />
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {order.source === "CUSTOMER_WEB" ? "Customer web" : "Other source"}
              </p>
            </div>
            <h3 className="mt-1.5 truncate text-xl font-semibold tracking-[-0.04em] text-foreground">
              {order.orderNumber}
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
              {urgent ? <Badge tone="danger">Urgent</Badge> : null}
              {order.deferred ? <Badge tone="warning">Deferred</Badge> : null}
              {order.remakeCount > 0 ? (
                <Badge tone="neutral">Remake {order.remakeCount}</Badge>
              ) : null}
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-border/70 bg-muted/55 px-3 py-2 text-right">
            <div className="flex items-center justify-end gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Clock3 className="size-3" aria-hidden="true" />
              Waiting
            </div>
            <p className="mt-1 font-mono text-base font-bold tabular-nums text-foreground">
              {formatElapsed(order.submittedAt, now)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-border/70 bg-muted/30 text-xs">
          <div className="px-3.5 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Order size
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {order.unitCount} units · {order.lineCount} lines
            </p>
          </div>
          <div className="border-l border-border/70 px-3.5 py-3 text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Subtotal
            </p>
            <p className="mt-1 font-bold tabular-nums text-foreground">
              {formatMinorMoney(order.subtotalMinor, order.currency)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>Submitted {formatBangkokTime(order.submittedAt)}</span>
          {order.hasCustomerNote ? (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/65">
              <Sparkles className="size-3" aria-hidden="true" /> Customer note
            </span>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border/70 bg-muted/35 p-3.5">
        <Button
          fullWidth
          onClick={onReview}
          rightIcon={<ChevronRight className="size-4 transition group-hover:translate-x-0.5" />}
        >
          Review order
        </Button>
      </div>
    </Card>
  );
}

export function OperationalOrderDetailView({
  detail,
  now,
}: {
  detail: OperationalOrderDetail;
  now: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <DetailMetric label="Table" value={detail.tableLabel ?? "Unknown"} />
        <DetailMetric label="Status" value={statusLabel(detail.status)} />
        <DetailMetric label="Waiting" value={formatElapsed(detail.submittedAt, now)} />
        <DetailMetric
          label="Subtotal"
          value={formatMinorMoney(detail.subtotalMinor, detail.currency)}
        />
      </div>

      <section className="rounded-2xl border border-border/80 bg-muted/35 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={detail.priority === "URGENT" ? "danger" : "neutral"}>
            Priority: {detail.priority === "URGENT" ? "Urgent" : "Normal"}
          </Badge>
          <Badge tone={detail.deferred ? "warning" : "neutral"}>
            {detail.deferred ? "Deferred" : "Active"}
          </Badge>
          <Badge tone="neutral">Remakes: {detail.remakeCount}/3</Badge>
        </div>
        {detail.priorityReason || detail.deferReason || detail.lastRemakeReason ? (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {detail.priorityReason
              ? `Priority reason: ${humanizeCode(detail.priorityReason)}. `
              : ""}
            {detail.deferReason ? `Defer reason: ${humanizeCode(detail.deferReason)}. ` : ""}
            {detail.lastRemakeReason
              ? `Last remake: ${humanizeCode(detail.lastRemakeReason)}.`
              : ""}
          </p>
        ) : null}
        {detail.deferredUntil ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Deferred until {formatBangkokTime(detail.deferredUntil)}
          </p>
        ) : null}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Durable order
            </p>
            <h3 className="mt-1 text-sm font-semibold tracking-[-0.02em] text-foreground">
              Persisted item snapshots
            </h3>
          </div>
          <Badge tone="neutral">Read only</Badge>
        </div>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_12px_38px_rgb(0_0_0/0.035)]">
          {detail.items.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              No persisted item rows are available for this order.
            </p>
          ) : (
            detail.items.map((item, index) => (
              <div
                className={`px-4 py-4 ${index ? "border-t border-border/70" : ""}`}
                key={item.id}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 min-w-8 rounded-lg border border-border/70 bg-muted px-2 py-1.5 text-center text-xs font-bold text-foreground">
                    {item.quantity}×
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold leading-5 text-foreground">{item.menuItemName}</p>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        {formatMinorMoney(item.lineTotalMinor, detail.currency)}
                      </p>
                    </div>
                    {item.modifiers.length > 0 ? (
                      <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                        {item.modifiers.map((modifier) => (
                          <li key={modifier.id}>
                            {modifier.modifierGroupName}: {modifier.modifierChoiceName}
                            {modifier.priceDeltaMinor !== "0"
                              ? ` (${formatMinorMoney(modifier.priceDeltaMinor, detail.currency)})`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {item.specialRequest ? (
                      <p className="mt-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
                        <strong>Request:</strong> {item.specialRequest}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {detail.customerNote ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
            Customer note
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
            {detail.customerNote}
          </p>
        </section>
      ) : null}

      <p className="rounded-2xl border border-border/80 bg-muted/35 px-4 py-3 text-xs leading-5 text-muted-foreground">
        Item and modifier snapshots remain read-only. Priority, defer and remake controls are
        server-authorized operational metadata and never replace the durable lifecycle state.
      </p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card muted className="rounded-xl border-border/70 p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </Card>
  );
}

export function dedupeOperationalOrders(
  orders: readonly OperationalOrderQueueItem[],
): readonly OperationalOrderQueueItem[] {
  const seen = new Set<string>();
  return orders.filter((order) => {
    if (seen.has(order.id)) return false;
    seen.add(order.id);
    return true;
  });
}

export function formatMinorMoney(minor: string, currency: string): string {
  const amount = Number(minor) / 100;
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-TH", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function statusLabel(status: OperationalOrderStatus): string {
  return humanizeCode(status);
}

function humanizeCode(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
