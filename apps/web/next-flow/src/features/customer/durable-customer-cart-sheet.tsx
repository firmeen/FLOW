"use client";

import { Minus, Plus, ReceiptText, Send, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import type { CSSProperties } from "react";

import { Button, useDialogFocus } from "@/components/foodflow-ui";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { formatTHB } from "@/lib/currency";

import type {
  DurableCartAggregate,
  DurableCustomerMenuItem,
} from "./durable-customer-types";

interface DurableCustomerCartSheetProps {
  readonly open: boolean;
  readonly tableLabel: string;
  readonly cart: DurableCartAggregate | null;
  readonly menuItems: readonly DurableCustomerMenuItem[];
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

function imageStyle(imageUrl: string | null | undefined): CSSProperties | undefined {
  return imageUrl ? { backgroundImage: `url(${JSON.stringify(imageUrl)})` } : undefined;
}

function CartItemVisual({
  item,
  name,
}: {
  readonly item: DurableCustomerMenuItem | undefined;
  readonly name: string;
}) {
  if (item?.imageUrl) {
    return (
      <div
        className="h-full w-full bg-cover bg-center"
        style={imageStyle(item.imageUrl)}
        role="img"
        aria-label={name}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-stone-100 via-zinc-100 to-stone-200 text-muted-foreground dark:from-zinc-900 dark:via-stone-900 dark:to-zinc-950">
      <Sparkles className="size-4 opacity-45" aria-hidden="true" />
    </div>
  );
}

export function DurableCustomerCartSheet({
  open,
  tableLabel,
  cart,
  menuItems,
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
  const menuById = new Map(menuItems.map((item) => [item.id, item] as const));

  return (
    <div
      className="fixed inset-0 z-[75] flex justify-end bg-zinc-950/58 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => !busy && event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-slide-up flex h-full w-full max-w-[31rem] flex-col border-l border-white/10 bg-background shadow-[-30px_0_110px_rgb(0_0_0/0.28)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="durable-cart-title"
      >
        <header className="border-b border-border/80 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full border border-border bg-muted/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {tableLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Saved live
                </span>
              </div>
              <h2
                id="durable-cart-title"
                className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-foreground"
              >
                Your table order
              </h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                Every change is saved to this verified table before you send it to the restaurant.
              </p>
            </div>
            <IconButton label="Close cart" disabled={busy} onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {lines.length === 0 ? (
            <div className="pt-8">
              <EmptyState
                compact
                icon={<ShoppingBag className="size-5" />}
                title="Nothing here yet"
                description="Choose a dish and it will stay attached to this table until you send the order."
                action={
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Browse the menu
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-2.5" data-flow-durable-cart="true">
              {lines.map((line) => {
                const menuItem = menuById.get(line.menuItemId);
                return (
                  <article
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 rounded-2xl border border-border/80 bg-card p-3 shadow-[0_10px_32px_rgb(0_0_0/0.035)]"
                    key={line.id}
                    data-flow-cart-item={line.id}
                  >
                    <div className="h-[4.5rem] overflow-hidden rounded-xl border border-border/70 bg-muted">
                      <CartItemVisual item={menuItem} name={line.menuItemName} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold leading-5 text-foreground">
                            {line.menuItemName}
                          </h3>
                          {line.menuItemThaiName && (
                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                              {line.menuItemThaiName}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                          {formatTHB(minorToMajor(line.lineTotalMinor))}
                        </p>
                      </div>

                      {line.modifiers.length > 0 && (
                        <p className="mt-1.5 line-clamp-1 text-[10px] leading-4 text-muted-foreground">
                          {line.modifiers
                            .map((modifier) => modifier.modifierChoiceName)
                            .join(" · ")}
                        </p>
                      )}
                      {line.specialRequest && (
                        <p className="mt-1.5 line-clamp-1 text-[10px] italic leading-4 text-foreground/60">
                          “{line.specialRequest}”
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <IconButton
                            label={`Decrease ${line.menuItemName}`}
                            size="sm"
                            disabled={busy || line.quantity <= 1}
                            onClick={() =>
                              void onQuantity(line.id, Math.max(1, line.quantity - 1))
                            }
                          >
                            <Minus className="size-3.5" />
                          </IconButton>
                          <span className="w-5 text-center text-xs font-bold tabular-nums">
                            {line.quantity}
                          </span>
                          <IconButton
                            label={`Increase ${line.menuItemName}`}
                            size="sm"
                            disabled={busy || line.quantity >= 99}
                            onClick={() =>
                              void onQuantity(line.id, Math.min(99, line.quantity + 1))
                            }
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
                    </div>
                  </article>
                );
              })}
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
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                Payment is handled after your meal. No charge is made when you send.
              </p>
            </div>
            <p className="text-2xl font-semibold tracking-[-0.045em] text-foreground">
              {formatTHB(subtotal)}
            </p>
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
            <p
              className="mt-3 rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-center text-xs font-semibold text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Your order is confirmed only after the restaurant accepts it.
          </p>
        </footer>
      </div>
    </div>
  );
}
