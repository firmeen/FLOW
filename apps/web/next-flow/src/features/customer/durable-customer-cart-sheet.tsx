"use client";

import { Minus, Plus, ReceiptText, Send, ShoppingBag, Trash2, X } from "lucide-react";

import { Button, useDialogFocus } from "@/components/foodflow-ui";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { formatTHB } from "@/lib/currency";

import type { DurableCartAggregate } from "./durable-customer-types";

interface DurableCustomerCartSheetProps {
  readonly open: boolean;
  readonly tableLabel: string;
  readonly cart: DurableCartAggregate | null;
  readonly busy: boolean;
  readonly error: string | null;
  readonly onClose: () => void;
  readonly onQuantity: (itemId: string, quantity: number) => Promise<void>;
  readonly onRemove: (itemId: string) => Promise<void>;
  readonly onSubmit: () => Promise<void>;
}

function minorToMajor(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : Number.NaN;
}

export function DurableCustomerCartSheet({
  open,
  tableLabel,
  cart,
  busy,
  error,
  onClose,
  onQuantity,
  onRemove,
  onSubmit,
}: DurableCustomerCartSheetProps) {
  const panelRef = useDialogFocus<HTMLDivElement>(open, onClose, true);
  if (!open) return null;

  const lines = cart?.items ?? [];
  const subtotal = cart ? minorToMajor(cart.subtotalMinor) : 0;

  return (
    <div
      className="fixed inset-0 z-[75] flex justify-end bg-zinc-950/58 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => !busy && event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-slide-up flex h-full w-full max-w-[29rem] flex-col border-l border-white/10 bg-background shadow-[-30px_0_100px_rgb(0_0_0/0.25)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="durable-cart-title"
      >
        <header className="border-b border-border/80 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{tableLabel}</p>
              <h2 id="durable-cart-title" className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-foreground">Your table order</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Saved securely to this table before you send it.</p>
            </div>
            <IconButton label="Close cart" disabled={busy} onClick={onClose}><X className="size-4" /></IconButton>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {lines.length === 0 ? (
            <div className="pt-8">
              <EmptyState
                compact
                icon={<ShoppingBag className="size-5" />}
                title="Nothing here yet"
                description="Choose a dish and it will stay attached to this table until you send the order."
                action={<Button variant="outline" size="sm" onClick={onClose}>Browse the menu</Button>}
              />
            </div>
          ) : (
            <div className="space-y-3" data-flow-durable-cart="true">
              {lines.map((line) => (
                <article
                  className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_10px_35px_rgb(0_0_0/0.04)]"
                  key={line.id}
                  data-flow-cart-item={line.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-5 text-foreground">{line.menuItemName}</h3>
                      {line.menuItemThaiName && <p className="mt-0.5 text-[11px] text-muted-foreground">{line.menuItemThaiName}</p>}
                      {line.modifiers.length > 0 && (
                        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                          {line.modifiers.map((modifier) => modifier.modifierChoiceName).join(" · ")}
                        </p>
                      )}
                      {line.specialRequest && (
                        <p className="mt-2 rounded-lg bg-muted px-2.5 py-2 text-[11px] italic leading-4 text-foreground/70">
                          “{line.specialRequest}”
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatTHB(minorToMajor(line.lineTotalMinor))}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                    <div className="flex items-center gap-2">
                      <IconButton
                        label={`Decrease ${line.menuItemName}`}
                        size="sm"
                        disabled={busy || line.quantity <= 1}
                        onClick={() => void onQuantity(line.id, Math.max(1, line.quantity - 1))}
                      >
                        <Minus className="size-3.5" />
                      </IconButton>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">{line.quantity}</span>
                      <IconButton
                        label={`Increase ${line.menuItemName}`}
                        size="sm"
                        disabled={busy || line.quantity >= 99}
                        onClick={() => void onQuantity(line.id, Math.min(99, line.quantity + 1))}
                      >
                        <Plus className="size-3.5" />
                      </IconButton>
                    </div>
                    <IconButton
                      label={`Remove ${line.menuItemName}`}
                      variant="danger"
                      size="sm"
                      disabled={busy}
                      onClick={() => void onRemove(line.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </IconButton>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-border/80 bg-background/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl sm:px-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ReceiptText className="size-3.5" aria-hidden="true" />
                Order subtotal
              </div>
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Final payment happens after your meal.</p>
            </div>
            <p className="text-2xl font-semibold tracking-[-0.045em] text-foreground">{formatTHB(subtotal)}</p>
          </div>

          <Button
            fullWidth
            size="lg"
            isLoading={busy}
            loadingText="Sending once..."
            disabled={lines.length === 0 || busy}
            leftIcon={<Send className="size-4" />}
            onClick={() => void onSubmit()}
          >
            Send to restaurant
          </Button>
          {error && (
            <p className="mt-3 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-center text-xs font-semibold text-destructive" role="alert">
              {error}
            </p>
          )}
          <p className="mt-2 text-center text-[10px] text-muted-foreground">Your order is confirmed only after the restaurant accepts it.</p>
        </footer>
      </div>
    </div>
  );
}
