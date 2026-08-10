import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone = "neutral" | "forest" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: ReactNode;
}

const tones: Record<BadgeTone, string> = {
  neutral: "border-[#dfe2dc] bg-[#f4f4ef] text-[#596861]",
  forest: "border-[#c5d6cf] bg-[#e8f0ec] text-[#173f35]",
  success: "border-[#bfe0ce] bg-[#eaf6ef] text-[#236341]",
  warning: "border-[#efd7a8] bg-[#fff5df] text-[#825d19]",
  danger: "border-[#ecc8c4] bg-[#fff0ee] text-[#943a34]",
  info: "border-[#c5d9e8] bg-[#edf6fb] text-[#315f7a]",
};

const dots: Record<BadgeTone, string> = {
  neutral: "bg-[#7a8982]",
  forest: "bg-[#2f6a59]",
  success: "bg-[#2e7d50]",
  warning: "bg-[#bd8526]",
  danger: "bg-[#b64940]",
  info: "bg-[#397a9e]",
};

export function Badge({
  tone = "neutral",
  dot = false,
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-4",
        tones[tone],
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {dot && <span className={`size-1.5 rounded-full ${dots[tone]}`} aria-hidden="true" />}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

export function StatusPill(props: BadgeProps) {
  return <Badge dot {...props} />;
}
