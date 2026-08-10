import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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
  forest: "bg-[#e8f0ec] text-[#245849]",
  amber: "bg-[#f9eed9] text-[#8a632b]",
  blue: "bg-[#e8f1f5] text-[#376b82]",
  red: "bg-[#f8e9e7] text-[#99433b]",
  neutral: "bg-[#eff0eb] text-[#5c6a64]",
};

export function MetricCard({
  label,
  value,
  helper,
  icon,
  change,
  changeDirection = "neutral",
  tone = "forest",
  className = "",
}: MetricCardProps) {
  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#718079]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#172a22] sm:text-3xl">{value}</p>
        </div>
        {icon && (
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-md ${tones[tone]}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      {(helper || change) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {change && (
            <span className={[
              "inline-flex items-center gap-0.5 font-semibold",
              changeDirection === "up" ? "text-[#2e7650]"
                : changeDirection === "down" ? "text-[#a4483f]" : "text-[#69766f]",
            ].join(" ")}>
              {changeDirection === "up" && <ArrowUpRight className="size-3.5" aria-hidden="true" />}
              {changeDirection === "down" && <ArrowDownRight className="size-3.5" aria-hidden="true" />}
              {change}
            </span>
          )}
          {helper && <span className="text-[#77837d]">{helper}</span>}
        </div>
      )}
    </Card>
  );
}
