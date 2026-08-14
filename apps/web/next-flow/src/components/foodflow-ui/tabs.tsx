"use client";

import type { ReactNode } from "react";

import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
    <ShadcnTabs
      value={value}
      onValueChange={(next) => onChange(next as Value)}
    >
      <TabsList
        variant="line"
        aria-label={label}
        className={cn(
          "max-w-full justify-start overflow-x-auto",
          stretch && "flex w-full",
          className,
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            aria-controls={item.panelId}
            disabled={item.disabled}
            className={cn(
              "shrink-0",
              size === "sm" ? "min-h-7 text-xs" : "min-h-9",
              stretch && "flex-1",
            )}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span className="min-w-5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-4 text-muted-foreground">
                {item.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </ShadcnTabs>
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
    <ShadcnTabs
      value={value}
      onValueChange={(next) => onChange(next as Value)}
    >
      <TabsList
        aria-label={label}
        className={cn(fullWidth && "flex w-full", className)}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(
              size === "sm" ? "min-h-6 text-xs" : "min-h-8",
              fullWidth && "flex-1",
            )}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span className="text-[10px] opacity-70">{item.count}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </ShadcnTabs>
  );
}
