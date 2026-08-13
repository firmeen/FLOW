import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "./card";

export type MetricTone = "forest" | "amber" | "blue" | "red" | "neutral";

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  tone?: MetricTone;
  className?: string;
}

const tones: Record<MetricTone, string> = {
  forest: "bg-chart-1/25 text-chart-5",
  amber: "bg-primary/25 text-primary-foreground",
  blue: "bg-accent text-accent-foreground",
  red: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

export function MetricCard({
  label,
  value,
  helper,
  icon,
  change,
  changeDirection = "neutral",
  tone = "forest",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">{value}</p>
        </div>
        {icon && <div className={cn("flex size-10 shrink-0 items-center justify-center", tones[tone])} aria-hidden="true">{icon}</div>}
      </div>
      {(helper || change) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {change && (
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", changeDirection === "up" ? "text-chart-4" : changeDirection === "down" ? "text-destructive" : "text-muted-foreground")}>
              {changeDirection === "up" && <ArrowUpRight className="size-3.5" aria-hidden="true" />}
              {changeDirection === "down" && <ArrowDownRight className="size-3.5" aria-hidden="true" />}
              {change}
            </span>
          )}
          {helper && <span className="text-muted-foreground">{helper}</span>}
        </div>
      )}
    </Card>
  );
}
