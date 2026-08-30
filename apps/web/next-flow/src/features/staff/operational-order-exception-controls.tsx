"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, PencilLine, XCircle } from "lucide-react";

import { Badge, Button } from "@/components/foodflow-ui";

import { OperationalOrderProductionControls } from "./operational-order-production-controls";
import type { OperationalOrderDetail } from "./operational-orders-ui";

type CancellationReasonCode =
  | "STAFF_REQUEST"
  | "CUSTOMER_REQUEST"
  | "ITEM_UNAVAILABLE"
  | "CAPACITY_LIMIT"
  | "STORE_CLOSING"
  | "DUPLICATE_ORDER"
  | "OPERATIONAL_ERROR"
  | "OTHER";

type ApiSuccess = {
  readonly ok: true;
  readonly data: {
    readonly action: "AMEND" | "CANCEL";
    readonly orderNumber: string;
    readonly status: "CHANGED" | "CANCELLED";
  };
};
type ApiFailure = {
  readonly ok: false;
  readonly error: { readonly code: string; readonly message: string };
};

type ItemDraft = {
  readonly id: string;
  quantity: number;
  specialRequest: string;
  removed: boolean;
};

const CANCELLATION_REASONS: readonly (readonly [CancellationReasonCode, string])[] = [
  ["STAFF_REQUEST", "Staff request"],
  ["CUSTOMER_REQUEST", "Customer request"],
  ["ITEM_UNAVAILABLE", "Item unavailable"],
  ["CAPACITY_LIMIT", "Capacity limit"],
  ["STORE_CLOSING", "Store closing"],
  ["DUPLICATE_ORDER", "Duplicate order"],
  ["OPERATIONAL_ERROR", "Operational error"],
  ["OTHER", "Other"],
];

const CANCELLABLE_STATUSES = new Set<OperationalOrderDetail["status"]>([
  "PENDING_CONFIRMATION",
  "CHANGED",
  "ACCEPTED",
  "PREPARING",
  "READY",
]);

function normalizeText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function initialItems(detail: OperationalOrderDetail): ItemDraft[] {
  return detail.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    specialRequest: item.specialRequest ?? "",
    removed: false,
  }));
}

export function OperationalOrderExceptionControls({
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
  const amendmentEligible = detail.status === "ACCEPTED";
  const cancellationEligible = CANCELLABLE_STATUSES.has(detail.status);
  const [amendOpen, setAmendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [customerNote, setCustomerNote] = useState(detail.customerNote ?? "");
  const [items, setItems] = useState<ItemDraft[]>(() => initialItems(detail));
  const [reasonCode, setReasonCode] = useState<CancellationReasonCode | "">("");
  const [busy, setBusy] = useState<"AMEND" | "CANCEL" | null>(null);

  const amendmentPayload = useMemo(() => {
    if (!amendmentEligible) return null;
    const payload: {
      action: "AMEND";
      customerNote?: string | null;
      itemChanges?: Array<
        | { itemId: string; remove: true }
        | { itemId: string; quantity?: number; specialRequest?: string | null }
      >;
    } = { action: "AMEND" };

    const normalizedNote = normalizeText(customerNote);
    if (normalizedNote !== detail.customerNote) payload.customerNote = normalizedNote;

    const itemChanges: Array<
      | { itemId: string; remove: true }
      | { itemId: string; quantity?: number; specialRequest?: string | null }
    > = [];
    for (const draft of items) {
      const persisted = detail.items.find((item) => item.id === draft.id);
      if (!persisted) continue;
      if (draft.removed) {
        itemChanges.push({ itemId: draft.id, remove: true });
        continue;
      }
      const change: { itemId: string; quantity?: number; specialRequest?: string | null } = {
        itemId: draft.id,
      };
      if (draft.quantity !== persisted.quantity) change.quantity = draft.quantity;
      const normalizedRequest = normalizeText(draft.specialRequest);
      if (normalizedRequest !== persisted.specialRequest) change.specialRequest = normalizedRequest;
      if (Object.keys(change).length > 1) itemChanges.push(change);
    }
    if (itemChanges.length > 0) payload.itemChanges = itemChanges;

    return Object.keys(payload).length > 1 ? payload : null;
  }, [amendmentEligible, customerNote, detail, items]);

  const allItemsRemoved = items.length > 0 && items.every((item) => item.removed);
  const invalidQuantity = items.some(
    (item) =>
      !item.removed &&
      (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99),
  );

  function patchItem(itemId: string, patch: Partial<Omit<ItemDraft, "id">>) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    );
  }

  async function submitException(payload: Record<string, unknown>, action: "AMEND" | "CANCEL") {
    if (busy || disabled) return;
    setBusy(action);
    onBusyChange(true);
    onError(null);
    try {
      const response = await fetch(
        `/api/internal/orders/${encodeURIComponent(detail.id)}/exception`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const body = (await response.json()) as ApiSuccess | ApiFailure;
      if (!response.ok || !body.ok) {
        const message = body.ok ? "Order exception handling is temporarily unavailable." : body.error.message;
        if (response.status === 401) {
          onAuthFailure(response.status);
          return;
        }
        if (response.status === 403) {
          onError("You can view this order, but order.manage permission is required for this exception action.");
          return;
        }
        if (response.status === 409) {
          onError("Another order mutation already won. The durable order state has been refreshed.");
          await onReconcile(true);
          return;
        }
        if (response.status === 404) {
          onError("This order or selected item is no longer available in the active branch.");
          await onReconcile(true);
          return;
        }
        onError(message);
        return;
      }

      onNotice(
        body.data.action === "AMEND"
          ? `Order ${body.data.orderNumber} changed and returned to staff review.`
          : `Order ${body.data.orderNumber} cancelled.`,
      );
      setAmendOpen(false);
      setCancelOpen(false);
      setReasonCode("");
      await onReconcile(false);
    } catch {
      onError("Order exception handling is temporarily unavailable. Refresh before retrying.");
    } finally {
      setBusy(null);
      onBusyChange(false);
    }
  }

  const productionControls = (
    <OperationalOrderProductionControls
      detail={detail}
      disabled={disabled || Boolean(busy)}
      onBusyChange={onBusyChange}
      onAuthFailure={onAuthFailure}
      onNotice={onNotice}
      onError={onError}
      onReconcile={onReconcile}
    />
  );

  if (!amendmentEligible && !cancellationEligible) return productionControls;

  return (
    <>
      {productionControls}
      <section className="border border-border bg-card p-4" aria-labelledby="order-exception-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 id="order-exception-heading" className="text-sm font-semibold text-foreground">
              Controlled order exception
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Amendments are limited to accepted snapshot fields. Cancellation requires an explicit reason. All authority, prices, totals, statuses and timestamps are server-derived.
            </p>
          </div>
          <Badge tone="neutral">order.manage</Badge>
        </div>

        {amendOpen && amendmentEligible ? (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <label className="block text-xs font-semibold text-foreground">
              Customer note
              <textarea
                className="mt-1.5 min-h-20 w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-normal text-foreground"
                value={customerNote}
                maxLength={2000}
                disabled={disabled || Boolean(busy)}
                onChange={(event) => setCustomerNote(event.target.value)}
              />
            </label>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Persisted order items</p>
              {detail.items.map((item) => {
                const draft = items.find((candidate) => candidate.id === item.id);
                if (!draft) return null;
                return (
                  <div key={item.id} className="rounded-md border border-border bg-muted/40 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.menuItemName}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Persisted price and modifiers stay read-only.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium text-destructive">
                        <input
                          type="checkbox"
                          checked={draft.removed}
                          disabled={disabled || Boolean(busy)}
                          onChange={(event) => patchItem(item.id, { removed: event.target.checked })}
                        />
                        Remove item
                      </label>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[7rem_1fr]">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        Quantity
                        <input
                          type="number"
                          min={1}
                          max={99}
                          step={1}
                          className="mt-1 block h-9 w-full rounded-md border border-border bg-card px-3 text-sm font-medium normal-case tracking-normal text-foreground"
                          value={draft.quantity}
                          disabled={draft.removed || disabled || Boolean(busy)}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            patchItem(item.id, { quantity: value });
                          }}
                        />
                      </label>
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                        Special request
                        <input
                          type="text"
                          maxLength={1000}
                          className="mt-1 block h-9 w-full rounded-md border border-border bg-card px-3 text-sm font-medium normal-case tracking-normal text-foreground"
                          value={draft.specialRequest}
                          disabled={draft.removed || disabled || Boolean(busy)}
                          onChange={(event) => patchItem(item.id, { specialRequest: event.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {allItemsRemoved ? (
              <p role="alert" className="text-xs text-destructive">
                An amendment cannot remove every persisted item.
              </p>
            ) : invalidQuantity ? (
              <p role="alert" className="text-xs text-destructive">
                Every retained item quantity must be a whole number from 1 through 99.
              </p>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                disabled={disabled || Boolean(busy)}
                onClick={() => {
                  setAmendOpen(false);
                  setCustomerNote(detail.customerNote ?? "");
                  setItems(initialItems(detail));
                  onError(null);
                }}
              >
                Discard amendment
              </Button>
              <Button
                disabled={
                  !amendmentPayload ||
                  allItemsRemoved ||
                  invalidQuantity ||
                  disabled ||
                  Boolean(busy)
                }
                leftIcon={busy === "AMEND" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                onClick={() => amendmentPayload && void submitException(amendmentPayload, "AMEND")}
              >
                Save amendment
              </Button>
            </div>
          </div>
        ) : null}

        {cancelOpen && cancellationEligible ? (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <p className="text-xs leading-5 text-muted-foreground">
              Cancellation is terminal for the R04 operational workflow. Confirm a bounded reason before continuing.
            </p>
            <label className="block text-xs font-semibold text-foreground">
              Cancellation reason
              <select
                className="mt-1.5 block h-10 w-full rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground"
                value={reasonCode}
                disabled={disabled || Boolean(busy)}
                onChange={(event) => setReasonCode(event.target.value as CancellationReasonCode | "")}
              >
                <option value="">Choose a reason</option>
                {CANCELLATION_REASONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                disabled={disabled || Boolean(busy)}
                onClick={() => {
                  setCancelOpen(false);
                  setReasonCode("");
                  onError(null);
                }}
              >
                Keep order
              </Button>
              <Button
                disabled={!reasonCode || disabled || Boolean(busy)}
                leftIcon={busy === "CANCEL" ? <LoaderCircle className="size-4 animate-spin" /> : undefined}
                onClick={() =>
                  reasonCode &&
                  void submitException({ action: "CANCEL", reasonCode }, "CANCEL")
                }
              >
                Confirm cancellation
              </Button>
            </div>
          </div>
        ) : null}

        {!amendOpen && !cancelOpen ? (
          <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            {amendmentEligible ? (
              <Button
                variant="outline"
                disabled={disabled || Boolean(busy)}
                leftIcon={<PencilLine className="size-4" />}
                onClick={() => {
                  setAmendOpen(true);
                  onError(null);
                }}
              >
                Amend accepted order
              </Button>
            ) : null}
            {cancellationEligible ? (
              <Button
                variant="outline"
                disabled={disabled || Boolean(busy)}
                leftIcon={<XCircle className="size-4" />}
                onClick={() => {
                  setCancelOpen(true);
                  onError(null);
                }}
              >
                Cancel order
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
