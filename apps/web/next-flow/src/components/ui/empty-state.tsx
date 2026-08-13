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
        "flex flex-col items-center justify-center border border-dashed border-border bg-muted/40 px-6 text-center",
        compact ? "min-h-44 py-7" : "min-h-64 py-10",
        className,
      ].filter(Boolean).join(" ")}
    >
      {icon && (
        <div
          className="mb-4 flex size-11 items-center justify-center bg-secondary text-secondary-foreground"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="font-heading text-base font-semibold uppercase tracking-[0.05em] text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
