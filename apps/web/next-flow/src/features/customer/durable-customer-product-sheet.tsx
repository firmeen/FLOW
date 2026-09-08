"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, Sparkles, X } from "lucide-react";

import { Badge, Button, useDialogFocus } from "@/components/foodflow-ui";
import { IconButton } from "@/components/ui/icon-button";
import { formatTHB, formatTHBAdjustment } from "@/lib/currency";

import type {
  DurableCartDraft,
  DurableCustomerMenuItem,
  DurableCustomerModifierGroup,
} from "./durable-customer-types";

interface DurableCustomerProductSheetProps {
  readonly item: DurableCustomerMenuItem | null;
  readonly busy: boolean;
  readonly onClose: () => void;
  readonly onAdd: (draft: DurableCartDraft) => Promise<void>;
}

function minorToMajor(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : Number.NaN;
}

function MenuVisual({ item }: { readonly item: DurableCustomerMenuItem }) {
  if (item.imageUrl) {
    return (
      <div
        className="h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(180deg, transparent 45%, rgb(9 9 11 / 0.24)), url(${JSON.stringify(item.imageUrl).slice(1, -1)})` }}
        role="img"
        aria-label={item.name}
      />
    );
  }

  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-zinc-100 via-stone-100 to-zinc-200 text-zinc-900 dark:from-zinc-900 dark:via-stone-900 dark:to-zinc-950">
      <div className="text-center">
        <Sparkles className="mx-auto size-7 opacity-45" aria-hidden="true" />
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">Freshly prepared</p>
      </div>
    </div>
  );
}

function defaultSelections(item: DurableCustomerMenuItem): Record<string, string[]> {
  return Object.fromEntries(
    item.modifierGroups.map((group) => {
      const initial =
        group.required && group.minimumSelections > 0
          ? group.choices.slice(0, group.minimumSelections).map((choice) => choice.id)
          : [];
      return [group.id, initial];
    }),
  );
}

export function DurableCustomerProductSheet({
  item,
  busy,
  onClose,
  onAdd,
}: DurableCustomerProductSheetProps) {
  const panelRef = useDialogFocus<HTMLDivElement>(Boolean(item), onClose, true);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [specialRequest, setSpecialRequest] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setQuantity(1);
    setSelected(defaultSelections(item));
    setSpecialRequest("");
    setError(null);
  }, [item]);

  const groups = useMemo(
    () => [...(item?.modifierGroups ?? [])].sort((a, b) => a.displayOrder - b.displayOrder),
    [item],
  );

  if (!item) return null;

  const valid = groups.every((group) => {
    const count = selected[group.id]?.length ?? 0;
    return count >= group.minimumSelections && count <= group.maximumSelections;
  });

  const modifierTotalMinor = groups.reduce((sum, group) => {
    const ids = new Set(selected[group.id] ?? []);
    return (
      sum +
      group.choices
        .filter((choice) => ids.has(choice.id))
        .reduce((choiceSum, choice) => choiceSum + Number(choice.priceDeltaMinor), 0)
    );
  }, 0);
  const totalMajor = (Number(item.basePriceMinor) + modifierTotalMinor) * quantity / 100;

  function toggleChoice(group: DurableCustomerModifierGroup, choiceId: string) {
    if (busy) return;
    setSelected((current) => {
      const values = current[group.id] ?? [];
      if (group.maximumSelections === 1) {
        return { ...current, [group.id]: [choiceId] };
      }
      if (values.includes(choiceId)) {
        if (values.length <= group.minimumSelections) return current;
        return { ...current, [group.id]: values.filter((id) => id !== choiceId) };
      }
      if (values.length >= group.maximumSelections) return current;
      return { ...current, [group.id]: [...values, choiceId] };
    });
  }

  async function addToCart() {
    if (!valid || busy) return;
    setError(null);
    try {
      await onAdd({
        menuItemId: item.id,
        quantity,
        modifierChoiceIds: Object.values(selected).flat(),
        specialRequest: specialRequest.trim() || null,
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "This item could not be added. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-zinc-950/58 backdrop-blur-md sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => !busy && event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-slide-up max-h-[94dvh] w-full overflow-y-auto rounded-t-[2rem] border border-white/10 bg-background shadow-[0_-24px_90px_rgb(0_0_0/0.28)] outline-none sm:max-w-2xl sm:rounded-[2rem]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="durable-product-title"
      >
        <div className="relative h-56 overflow-hidden rounded-t-[2rem] sm:h-72">
          <MenuVisual item={item} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
            <Badge className="border-white/15 bg-zinc-950/55 text-white backdrop-blur" tone="neutral">Live menu</Badge>
            <IconButton className="border-white/15 bg-white/95 shadow-lg" label="Close item details" disabled={busy} onClick={onClose}>
              <X className="size-4" />
            </IconButton>
          </div>
        </div>

        <div className="px-5 pb-28 pt-6 sm:px-8 sm:pb-8">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {item.badges.map((badge) => <Badge key={badge.id} tone="warning">{badge.name}</Badge>)}
                {item.vegetarian && <Badge tone="success">Vegetarian</Badge>}
              </div>
              <h2 id="durable-product-title" className="text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-3xl">{item.name}</h2>
              {item.thaiName && <p className="mt-1 text-sm text-muted-foreground">{item.thaiName}</p>}
            </div>
            <p className="shrink-0 text-xl font-semibold tracking-[-0.03em] text-foreground">{formatTHB(minorToMajor(item.basePriceMinor))}</p>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{item.description}</p>

          {groups.length > 0 && (
            <div className="mt-8 space-y-8">
              {groups.map((group) => (
                <fieldset key={group.id}>
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <legend className="text-sm font-semibold text-foreground">
                      {group.name}
                      {group.required && <span className="ml-1 text-destructive">*</span>}
                    </legend>
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {group.minimumSelections === group.maximumSelections
                        ? `Choose ${group.maximumSelections}`
                        : `Choose ${group.minimumSelections}-${group.maximumSelections}`}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                    {group.choices.map((choice, index) => {
                      const checked = (selected[group.id] ?? []).includes(choice.id);
                      return (
                        <label
                          className={`flex cursor-pointer items-center gap-3 px-4 py-4 transition hover:bg-muted/60 ${index > 0 ? "border-t border-border/70" : ""}`}
                          key={choice.id}
                        >
                          <input
                            className="sr-only"
                            type={group.maximumSelections === 1 ? "radio" : "checkbox"}
                            name={group.id}
                            checked={checked}
                            disabled={busy}
                            onChange={() => toggleChoice(group, choice.id)}
                          />
                          <span className={`grid size-5 shrink-0 place-items-center border transition ${group.maximumSelections === 1 ? "rounded-full" : "rounded-md"} ${checked ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>
                            {checked && <Check className="size-3" aria-hidden="true" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-foreground">{choice.name}</span>
                            {choice.thaiName && <span className="mt-0.5 block text-[11px] text-muted-foreground">{choice.thaiName}</span>}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {Number(choice.priceDeltaMinor) === 0
                              ? "Included"
                              : formatTHBAdjustment(minorToMajor(choice.priceDeltaMinor))}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          <label className="mt-8 block">
            <span className="text-sm font-semibold text-foreground">Special request</span>
            <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Optional</span>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5"
              value={specialRequest}
              maxLength={500}
              disabled={busy}
              onChange={(event) => setSpecialRequest(event.target.value)}
              placeholder="No onion, sauce on the side..."
            />
          </label>

          <div className="mt-7 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Quantity</p>
              <p className="text-[11px] text-muted-foreground">Prepared as one cart line</p>
            </div>
            <div className="flex items-center gap-3">
              <IconButton label="Decrease quantity" size="sm" disabled={busy || quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="size-3.5" /></IconButton>
              <span className="w-6 text-center text-sm font-bold tabular-nums">{quantity}</span>
              <IconButton label="Increase quantity" size="sm" disabled={busy || quantity >= 99} onClick={() => setQuantity((value) => Math.min(99, value + 1))}><Plus className="size-3.5" /></IconButton>
            </div>
          </div>

          {error && <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive" role="alert">{error}</p>}

          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/92 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:static sm:mt-7 sm:border-0 sm:bg-transparent sm:p-0">
            <Button fullWidth size="lg" disabled={!valid || busy} isLoading={busy} loadingText="Saving to your table..." onClick={() => void addToCart()}>
              Add to cart · {formatTHB(totalMajor)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
