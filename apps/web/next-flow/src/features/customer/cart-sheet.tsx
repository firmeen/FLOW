"use client";

import { Minus, Plus, Send, ShoppingBag, Trash2, X } from "lucide-react";

import { FoodImage } from "@/components/menu/food-image";
import { Button, useDialogFocus } from "@/components/foodflow-ui";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import type { MenuItem, ModifierGroup } from "@/domain";
import { formatTHB } from "@/lib/currency";

import type { CustomerCartLine } from "./types";

interface CartSheetProps {
  open: boolean;
  tableLabel: string;
  lines: CustomerCartLine[];
  menuItems: MenuItem[];
  modifierGroups: ModifierGroup[];
  submitting: boolean;
  error?: string | null;
  onClose: () => void;
  onQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  onEdit: (lineId: string) => void;
  onSubmit: () => void;
}

export function getCartLineTotal(line: CustomerCartLine, menuItems: MenuItem[], groups: ModifierGroup[]): number {
  const item = menuItems.find((candidate) => candidate.id === line.menuItemId);
  if (!item) return 0;
  const modifierAmount = line.modifiers.reduce((sum, selection) => {
    const group = groups.find((candidate) => candidate.id === selection.modifierGroupId);
    return sum + (group?.choices.find((choice) => choice.id === selection.modifierChoiceId)?.priceDelta ?? 0);
  }, 0);
  return (item.basePrice + modifierAmount) * line.quantity;
}

export function CartSheet({
  open,
  tableLabel,
  lines,
  menuItems,
  modifierGroups,
  submitting,
  error,
  onClose,
  onQuantity,
  onRemove,
  onEdit,
  onSubmit,
}: CartSheetProps) {
  const panelRef = useDialogFocus<HTMLDivElement>(open, onClose, true);
  if (!open) return null;
  const subtotal = lines.reduce((sum, line) => sum + getCartLineTotal(line, menuItems, modifierGroups), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/55 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => !submitting && event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} tabIndex={-1} className="animate-slide-up flex h-full w-full max-w-md flex-col bg-muted shadow-2xl outline-none" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{tableLabel}</p>
            <h2 id="cart-title" className="mt-0.5 text-xl font-semibold tracking-[-0.03em] text-foreground">Your order</h2>
          </div>
          <IconButton label="Close cart" disabled={submitting} onClick={onClose}><X className="size-4" /></IconButton>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {lines.length === 0 ? (
            <EmptyState
              compact
              icon={<ShoppingBag className="size-5" />}
              title="Your cart is empty"
              description="Add a dish from the menu when you are ready."
              action={<Button variant="outline" size="sm" onClick={onClose}>Browse menu</Button>}
            />
          ) : (
            <div className="space-y-3">
              {lines.map((line) => {
                const item = menuItems.find((candidate) => candidate.id === line.menuItemId);
                if (!item) return (
                  <article className="rounded-lg border border-destructive/30 bg-destructive/10 p-4" key={line.id}>
                    <p className="text-sm font-bold text-destructive">Unavailable menu item</p>
                    <p className="mt-1 text-xs text-destructive/70">This saved item is no longer on the menu. Remove it before sending.</p>
                    <Button className="mt-3" size="sm" variant="danger" disabled={submitting} onClick={() => onRemove(line.id)}>Remove item</Button>
                  </article>
                );
                const choices = line.modifiers.flatMap((selection) => {
                  const group = modifierGroups.find((candidate) => candidate.id === selection.modifierGroupId);
                  return group?.choices.find((choice) => choice.id === selection.modifierChoiceId)?.name ?? [];
                });
                return (
                  <article className="rounded-lg border border-border bg-card p-3.5" key={line.id}>
                    <div className="flex gap-3">
                      <FoodImage className="size-20 shrink-0 rounded-md" imageKey={item.imageKey ?? item.imageUrl} alt={item.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-semibold leading-5 text-foreground">{item.name}</h3>
                          <p className="shrink-0 text-sm font-bold text-foreground">{formatTHB(getCartLineTotal(line, menuItems, modifierGroups))}</p>
                        </div>
                        {choices.length > 0 && <p className="mt-1 text-[11px] leading-4 text-foreground/45">{choices.join(" / ")}</p>}
                        {line.specialRequest && <p className="mt-1 text-[11px] italic leading-4 text-amber-700 dark:text-amber-300">&ldquo;{line.specialRequest}&rdquo;</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2">
                        <IconButton label={`Decrease ${item.name}`} size="sm" disabled={submitting} onClick={() => onQuantity(line.id, line.quantity - 1)}><Minus className="size-3.5" /></IconButton>
                        <span className="w-5 text-center text-xs font-bold">{line.quantity}</span>
                        <IconButton label={`Increase ${item.name}`} size="sm" disabled={submitting} onClick={() => onQuantity(line.id, line.quantity + 1)}><Plus className="size-3.5" /></IconButton>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-1 text-xs font-semibold text-foreground underline-offset-2 hover:underline disabled:opacity-40" type="button" disabled={submitting} onClick={() => onEdit(line.id)}>Edit</button>
                        <IconButton label={`Remove ${item.name}`} variant="danger" size="sm" disabled={submitting} onClick={() => onRemove(line.id)}><Trash2 className="size-3.5" /></IconButton>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground/48">Order subtotal</p>
              <p className="text-[10px] text-foreground/35">Payment is collected after your meal.</p>
            </div>
            <p className="text-xl font-bold tracking-[-0.03em] text-foreground">{formatTHB(subtotal)}</p>
          </div>
          <Button
            fullWidth
            size="lg"
            isLoading={submitting}
            loadingText="Sending once..."
            disabled={lines.length === 0 || submitting}
            leftIcon={<Send className="size-4" />}
            onClick={onSubmit}
          >
            Send order to restaurant
          </Button>
          {error && <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-center text-xs font-semibold text-destructive" role="alert">{error}</p>}
          <p className="mt-2 text-center text-[10px] text-foreground/38">The restaurant will confirm your order before preparation.</p>
        </footer>
      </div>
    </div>
  );
}
