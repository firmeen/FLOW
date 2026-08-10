"use client";

import type { ReactNode } from "react";

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
  className = "",
}: TabsProps<Value>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={[
        "flex gap-1 overflow-x-auto border-b border-[#dfe3dc]",
        stretch ? "w-full" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={item.panelId}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={[
              "relative inline-flex shrink-0 items-center justify-center gap-2 border-b-2 font-semibold transition-colors",
              "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6a59]/45 focus-visible:ring-inset",
              "disabled:pointer-events-none disabled:opacity-45",
              size === "sm" ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm",
              stretch ? "flex-1" : "",
              selected
                ? "border-[#255b4d] text-[#173f35]"
                : "border-transparent text-[#718079] hover:border-[#bdc8c1] hover:text-[#344a41]",
            ].filter(Boolean).join(" ")}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={[
                  "min-w-5 rounded-full px-1.5 py-0.5 text-[10px] leading-4",
                  selected ? "bg-[#dce9e3] text-[#255b4d]" : "bg-[#eceee9] text-[#66736d]",
                ].join(" ")}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
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
  className = "",
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={[
        "inline-flex items-center gap-0.5 rounded-md border border-[#d8ddd5] bg-[#eceee9] p-1",
        fullWidth ? "flex w-full" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={selected}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={[
              "inline-flex items-center justify-center gap-1.5 rounded-[4px] font-semibold transition-colors",
              "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6a59]/45",
              "disabled:pointer-events-none disabled:opacity-45",
              size === "sm" ? "min-h-7 px-2.5 text-xs" : "min-h-9 px-3.5 text-sm",
              fullWidth ? "flex-1" : "",
              selected
                ? "bg-white text-[#173f35] shadow-[0_1px_3px_rgba(27,55,46,0.12)]"
                : "text-[#68766f] hover:text-[#29483e]",
            ].filter(Boolean).join(" ")}
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            <span>{item.label}</span>
            {typeof item.count === "number" && <span className="text-[10px] opacity-75">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
