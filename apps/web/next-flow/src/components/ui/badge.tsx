import type { HTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "forest"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: ReactNode;
}

const badgeVariants = cva(
  "inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-none border px-2 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        forest: "border-border bg-secondary text-secondary-foreground",
        success: "border-chart-2/30 bg-chart-1/20 text-chart-5",
        warning: "border-primary/50 bg-primary/20 text-primary-foreground",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
        info: "border-ring/30 bg-accent text-accent-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const dots: Record<BadgeTone, string> = {
  neutral: "bg-muted-foreground",
  forest: "bg-foreground",
  success: "bg-chart-3",
  warning: "bg-primary-foreground",
  danger: "bg-destructive",
  info: "bg-ring",
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
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden="true" />}
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

export function StatusPill(props: BadgeProps) {
  return <Badge dot {...props} />;
}

export { badgeVariants };
