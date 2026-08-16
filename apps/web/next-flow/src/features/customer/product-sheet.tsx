"use client";

import { useMemo, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";

import { FoodImage } from "@/components/menu/food-image";
import { Badge, Button, useDialogFocus } from "@/components/foodflow-ui";
import { IconButton } from "@/components/ui/icon-button";
import {
  getMissingRequiredModifierGroupIds,
  type MenuBadge,
  type MenuItem,
  type ModifierGroup,
} from "@/domain";
import { formatTHB, formatTHBAdjustment } from "@/lib/currency";

import type { CustomerCartLine } from "./types";

interface ProductSheetProps {
  item: MenuItem | null;
  modifierGroups: ModifierGroup[];
  badges: MenuBadge[];
  initialLine?: CustomerCartLine | null;
  onClose: () => void;
  onAdd: (line: CustomerCartLine) => void;
}

export function ProductSheet({ item, modifierGroups, badges, initialLine, onClose, onAdd }: ProductSheetProps) {
  const groups = useMemo(
    () => (item ? modifierGroups.filter((group) => item.modifierGroupIds.includes(group.id) && group.active) : []),
    [item, modifierGroups],
  );
  const panelRef = useDialogFocus<HTMLDivElement>(Boolean(item), onClose, true);
  const [quantity, setQuantity] = useState(initialLine?.quantity ?? 1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(groups.map((group) => {
      const existingSelections = initialLine?.modifiers
        .filter((selection) => selection.modifierGroupId === group.id)
        .map((selection) => selection.modifierChoiceId) ?? [];
      return [
        group.id,
        existingSelections.length > 0
          ? existingSelections
          : group.required && group.minimumSelections > 0
            ? [group.choices.find((choice) => choice.active)?.id].filter((id): id is string => Boolean(id))
            : [],
      ];
    })),
  );
  const [specialRequest, setSpecialRequest] = useState(initialLine?.specialRequest ?? "");

  if (!item) return null;

  const selections = Object.entries(selected).flatMap(([modifierGroupId, ids]) =>
    ids.map((modifierChoiceId) => ({ modifierGroupId, modifierChoiceId })),
  );
  const modifierTotal = groups.reduce((sum, group) => {
    const ids = selected[group.id] ?? [];
    return sum + group.choices.filter((choice) => ids.includes(choice.id)).reduce((choiceSum, choice) => choiceSum + choice.priceDelta, 0);
  }, 0);
  const total = (item.basePrice + modifierTotal) * quantity;
  const valid =
    getMissingRequiredModifierGroupIds(item, modifierGroups, selections).length === 0 &&
    groups.every((group) => {
      const count = selected[group.id]?.length ?? 0;
      return count <= group.maximumSelections;
    });

  function toggleChoice(group: ModifierGroup, choiceId: string) {
    setSelected((current) => {
      const values = current[group.id] ?? [];
      if (group.maximumSelections === 1) return { ...current, [group.id]: [choiceId] };
      if (values.includes(choiceId)) return { ...current, [group.id]: values.filter((id) => id !== choiceId) };
      if (values.length >= group.maximumSelections) return current;
      return { ...current, [group.id]: [...values, choiceId] };
    });
  }

  function addToCart() {
    if (!valid) return;
    onAdd({
      id: initialLine?.id ?? `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      menuItemId: item!.id,
      quantity,
      modifiers: selections,
      specialRequest: specialRequest.trim() || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} tabIndex={-1} className="animate-slide-up max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-muted shadow-2xl outline-none sm:max-w-2xl sm:rounded-xl" role="dialog" aria-modal="true" aria-labelledby="product-title">
        <div className="relative h-52 sm:h-64">
          <FoodImage className="h-full w-full rounded-t-2xl sm:rounded-t-xl" imageKey={item.imageKey ?? item.imageUrl} alt={item.name} />
          <IconButton className="absolute right-4 top-4 bg-card/95 shadow" label="Close product details" onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>

        <div className="px-5 pb-28 pt-5 sm:px-7 sm:pb-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {badges.filter((badge) => item.badgeIds.includes(badge.id)).map((badge) => (
                  <Badge key={badge.id} tone="warning">{badge.name}</Badge>
                ))}
                {item.vegetarian && <Badge tone="success">Vegetarian</Badge>}
              </div>
              <h2 id="product-title" className="text-2xl font-semibold tracking-[-0.035em] text-foreground">{item.name}</h2>
              {item.thaiName && <p className="mt-1 text-sm text-foreground/55">{item.thaiName}</p>}
            </div>
            <p className="text-xl font-bold text-foreground">{formatTHB(item.basePrice)}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-foreground/62">{item.description}</p>

          <div className="mt-7 space-y-7">
            {groups.map((group) => (
              <fieldset key={group.id}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <legend className="font-semibold text-foreground">{group.name}{group.required && <span className="ml-1 text-destructive">*</span>}</legend>
                  <span className="text-[11px] font-medium text-foreground/42">
                    {group.maximumSelections === 1 ? "Choose one" : `Choose up to ${group.maximumSelections}`}
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  {group.choices.filter((choice) => choice.active).map((choice, index) => {
                    const checked = (selected[group.id] ?? []).includes(choice.id);
                    return (
                      <label className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-border" : ""}`} key={choice.id}>
                        <input
                          className="sr-only"
                          type={group.maximumSelections === 1 ? "radio" : "checkbox"}
                          name={group.id}
                          checked={checked}
                          onChange={() => toggleChoice(group, choice.id)}
                        />
                        <span className={`grid size-5 place-items-center ${group.maximumSelections === 1 ? "rounded-full" : "rounded"} border ${checked ? "border-foreground bg-foreground text-white" : "border-border bg-card"}`}>
                          {checked && <Check className="size-3" aria-hidden="true" />}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-foreground/78">{choice.name}</span>
                        <span className="text-xs font-semibold text-foreground/48">{choice.priceDelta ? formatTHBAdjustment(choice.priceDelta) : "Included"}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <label className="mt-7 block">
            <span className="text-sm font-semibold text-foreground">Special request</span>
            <span className="ml-2 text-[11px] text-foreground/40">Optional</span>
            <textarea
              className="mt-2 min-h-20 w-full resize-none rounded-lg border border-border bg-card px-3.5 py-3 text-sm outline-none transition focus:border-ring"
              value={specialRequest}
              maxLength={160}
              onChange={(event) => setSpecialRequest(event.target.value)}
              placeholder="e.g. No onion, sauce on the side"
            />
          </label>

          <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
            <span className="text-sm font-semibold text-foreground">Quantity</span>
            <div className="flex items-center gap-3">
              <IconButton label="Decrease quantity" size="sm" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus className="size-3.5" /></IconButton>
              <span className="w-5 text-center text-sm font-bold">{quantity}</span>
              <IconButton label="Increase quantity" size="sm" onClick={() => setQuantity((value) => value + 1)}><Plus className="size-3.5" /></IconButton>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
            <Button fullWidth size="lg" disabled={!valid} onClick={addToCart}>
              {initialLine ? "Save changes" : "Add to cart"} - {formatTHB(total)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
