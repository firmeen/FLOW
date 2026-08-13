"use client";

import type { ReactNode } from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

export interface TabItem<Value extends string = string> {
  value: Value;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
  panelId?: string;
}

export interface TabsProps<Value extends string = string> {
  value: Value;
  items: readonly TabItem<Value>[];
  onChange: (value: Value) => void;
  label: string;
  size?: "sm" | "md";
  stretch?: boolean;
  className?: string;
}

export function Tabs<Value extends string>({
  value,
  items,
  onChange,
  label,
  size = "md",
  stretch = false,
  className,
}: TabsProps<Value>) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={(next) => onChange(next as Value)}>
      <TabsPrimitive.List
        aria-label={label}
        className={cn("flex gap-0 overflow-x-auto border-b border-border", stretch && "w-full", className)}
      >
        {items.map((item) => (
          <TabsPrimitive.Tab
            key={item.value}
            value={item.value}
            aria-controls={item.panelId}
            disabled={item.disabled}
            className={cn(
              "relative inline-flex shrink-0 items-center justify-center gap-2 border-b-2 border-transparent font-heading font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 data-active:border-foreground data-active:text-foreground disabled:pointer-events-none disabled:opacity-45",
              size === "sm" ? "min-h-9 px-3 text-[10px]" : "min-h-11 px-4 text-xs",
              stretch && "flex-1",
            )}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span className="min-w-5 bg-muted px-1.5 py-0.5 text-[10px] leading-4 text-muted-foreground data-active:bg-primary">
                {item.count}
              </span>
            )}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export interface SegmentedControlProps<Value extends string = string> {
  value: Value;
  items: readonly Omit<TabItem<Value>, "panelId">[];
  onChange: (value: Value) => void;
  label: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<Value extends string>({
  value,
  items,
  onChange,
  label,
  size = "md",
  fullWidth = false,
  className,
}: SegmentedControlProps<Value>) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={(next) => onChange(next as Value)}>
      <TabsPrimitive.List
        aria-label={label}
        className={cn(
          "inline-flex items-center border border-border bg-muted p-1",
          fullWidth && "flex w-full",
          className,
        )}
      >
        {items.map((item) => (
          <TabsPrimitive.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-none border border-transparent font-heading font-semibold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring/40 data-active:border-border data-active:bg-background data-active:text-foreground disabled:pointer-events-none disabled:opacity-45",
              size === "sm" ? "min-h-7 px-2.5 text-[10px]" : "min-h-9 px-3.5 text-xs",
              fullWidth && "flex-1",
            )}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && <span className="text-[10px] opacity-70">{item.count}</span>}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
