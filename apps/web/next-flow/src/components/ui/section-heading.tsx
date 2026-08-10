import type { ReactNode } from "react";

export interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export function SectionHeading({
  title,
  description,
  eyebrow,
  action,
  level = 2,
  className = "",
}: SectionHeadingProps) {
  const Heading = `h${level}` as "h1" | "h2" | "h3";

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a6331]">
            {eyebrow}
          </p>
        )}
        <Heading className="text-xl font-semibold tracking-[-0.025em] text-[#182b23] sm:text-2xl">
          {title}
        </Heading>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#68756f]">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
