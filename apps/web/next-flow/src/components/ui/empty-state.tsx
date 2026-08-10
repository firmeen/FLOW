import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center border border-dashed border-[#cfd5cd] bg-[#fafaf7] px-6 text-center",
        compact ? "min-h-44 rounded-md py-7" : "min-h-64 rounded-lg py-10",
        className,
      ].filter(Boolean).join(" ")}
    >
      {icon && (
        <div
          className="mb-4 flex size-11 items-center justify-center rounded-md bg-[#e8eeea] text-[#2d6253]"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold tracking-[-0.015em] text-[#1c3028]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-[#69766f]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
