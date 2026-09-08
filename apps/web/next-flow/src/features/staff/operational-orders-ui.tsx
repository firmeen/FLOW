"use client";

import type { ReactNode } from "react";
import { ChevronRight, Clock3 } from "lucide-react";

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
    <Card className="flex items-center gap-3 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-foreground" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-foreground">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{helper}</p>
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
  return (
    <Card className={`overflow-hidden border-t-4 ${order.priority === "URGENT" ? "border-t-destructive" : "border-t-amber-500"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {order.tableLabel ?? "Unknown table"}
            </p>
            <h3 className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] text-foreground">
              {order.orderNumber}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="warning">{statusLabel(order.status)}</Badge>
              {order.priority === "URGENT" ? <Badge tone="danger">Urgent</Badge> : null}
              {order.deferred ? <Badge tone="neutral">Deferred</Badge> : null}
              {order.remakeCount > 0 ? <Badge tone="neutral">Remake {order.remakeCount}</Badge> : null}
              <Badge tone="neutral">
                {order.source === "CUSTOMER_WEB" ? "Customer web" : "Other source"}
              </Badge>
            </div>
          </div>
          <div className="rounded-md bg-muted px-3 py-2 text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Waiting</p>
            <p className="mt-0.5 font-mono text-base font-bold tabular-nums text-foreground">
              {formatElapsed(order.submittedAt, now)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border py-3 text-xs">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Items</p>
            <p className="mt-1 font-semibold text-foreground">
              {order.unitCount} units / {order.lineCount} lines
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Subtotal</p>
            <p className="mt-1 font-bold text-foreground">
              {formatMinorMoney(order.subtotalMinor, order.currency)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden="true" />
          Submitted {formatBangkokTime(order.submittedAt)}
          {order.hasCustomerNote ? " - Customer note" : ""}
        </div>
      </div>
      <div className="border-t border-border bg-muted p-4">
        <Button fullWidth onClick={onReview} rightIcon={<ChevronRight className="size-4" />}>
          Review details
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailMetric label="Table" value={detail.tableLabel ?? "Unknown"} />
        <DetailMetric label="Status" value={statusLabel(detail.status)} />
        <DetailMetric label="Waiting" value={formatElapsed(detail.submittedAt, now)} />
        <DetailMetric label="Subtotal" value={formatMinorMoney(detail.subtotalMinor, detail.currency)} />
      </div>

      <section className="rounded-md border border-border bg-muted/40 p-3">
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
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {detail.priorityReason ? `Priority reason: ${humanizeCode(detail.priorityReason)}. ` : ""}
            {detail.deferReason ? `Defer reason: ${humanizeCode(detail.deferReason)}. ` : ""}
            {detail.lastRemakeReason ? `Last remake: ${humanizeCode(detail.lastRemakeReason)}.` : ""}
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
          <h3 className="text-xs font-bold uppercase tracking-[0.11em] text-muted-foreground">
            Persisted item snapshots
          </h3>
          <Badge tone="neutral">Read only</Badge>
        </div>
        <div className="mt-2 overflow-hidden rounded-md border border-border bg-card">
          {detail.items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No persisted item rows are available for this order.</p>
          ) : (
            detail.items.map((item, index) => (
              <div className={`px-4 py-3.5 ${index ? "border-t border-border" : ""}`} key={item.id}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 min-w-7 rounded bg-muted px-1.5 py-1 text-center text-xs font-bold text-foreground">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold leading-5 text-foreground">{item.menuItemName}</p>
                      <p className="shrink-0 text-sm font-semibold text-foreground">
                        {formatMinorMoney(item.lineTotalMinor, detail.currency)}
                      </p>
                    </div>
                    {item.modifiers.length > 0 ? (
                      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
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
                      <p className="mt-2 rounded bg-amber-500/15 px-2.5 py-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
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
        <section className="rounded-md border border-amber-500/40 bg-amber-500/15 p-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-amber-800 dark:text-amber-300">
            Customer note
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-amber-800 dark:text-amber-300">{detail.customerNote}</p>
        </section>
      ) : null}

      <p className="rounded-md border border-border bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
        Item and modifier snapshots remain read-only. Priority, defer and remake controls are server-authorized operational metadata and never replace the durable lifecycle state.
      </p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card muted className="p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
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
