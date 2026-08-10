import type { OrderItem } from "@/domain/types";

export const formatTHB = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(amount);

export const formatTime = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso))
    : "—";

export const minutesSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));

export const orderItemTotal = (item: OrderItem) => {
  const modifiers = item.modifiers.reduce((sum, modifier) => sum + modifier.priceDelta, 0);
  return (item.basePrice + modifiers) * item.quantity;
};
