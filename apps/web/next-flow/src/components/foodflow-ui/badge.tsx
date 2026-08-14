import type { ComponentProps, ReactNode } from "react";

import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "forest"
  | "success"
  | "warning"
  | "danger"
  | "info";

type ShadcnBadgeProps = ComponentProps<typeof ShadcnBadge>;

export interface BadgeProps extends Omit<ShadcnBadgeProps, "variant"> {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  forest: "border-border bg-secondary text-secondary-foreground",
  success:
    "border-chart-2/30 bg-chart-1/20 text-chart-5 dark:text-chart-1",
  warning:
    "border-amber-500/35 bg-amber-500/15 text-amber-800 dark:text-amber-300",
  danger:
    "border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground",
  forest: "bg-secondary-foreground",
  success: "bg-chart-3",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  info: "bg-sky-500",
};

export function Badge({
  tone = "neutral",
  dot = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(
        "min-h-6 gap-1.5 px-2 font-heading text-[10px] font-semibold uppercase tracking-[0.08em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", dotClasses[tone])}
          aria-hidden="true"
        />
      )}
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </ShadcnBadge>
  );
}
