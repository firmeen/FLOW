export interface FoodFlowMarkProps {
  className?: string;
  inverted?: boolean;
}

export function FoodFlowMark({ className = "", inverted = false }: FoodFlowMarkProps) {
  return (
    <span
      className={[
        "inline-flex size-9 shrink-0 items-center justify-center rounded-md",
        inverted ? "bg-[#f5f1e5] text-[#173f35]" : "bg-[#173f35] text-[#f8f5ea]",
        className,
      ].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 36 36" className="size-7" fill="none">
        <path
          d="M9 10.5h11.2c3.8 0 6.8 2.5 6.8 6s-3 6-6.8 6H14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M10.5 9v18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M10.5 17.5h9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="26.5" cy="26.5" r="2" fill="#d29a4a" />
      </svg>
    </span>
  );
}

export interface FoodFlowLogoProps extends FoodFlowMarkProps {
  showTagline?: boolean;
  compact?: boolean;
}

export function FoodFlowLogo({
  showTagline = false,
  compact = false,
  inverted = false,
  className = "",
}: FoodFlowLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <FoodFlowMark inverted={inverted} className={compact ? "size-8" : ""} />
      <div className="leading-none">
        <span
          className={[
            "block font-bold uppercase tracking-[0.14em]",
            compact ? "text-xs" : "text-sm",
            inverted ? "text-white" : "text-[#173f35]",
          ].join(" ")}
        >
          FoodFlow
        </span>
        {showTagline && (
          <span className={`mt-1 block text-[10px] tracking-wide ${inverted ? "text-white/58" : "text-[#738079]"}`}>
            Restaurant operations
          </span>
        )}
      </div>
    </div>
  );
}
