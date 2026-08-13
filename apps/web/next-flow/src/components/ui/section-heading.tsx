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
          <p className="mb-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
            {eyebrow}
          </p>
        )}
        <Heading className="font-heading text-xl font-semibold uppercase tracking-[0.04em] text-foreground sm:text-2xl">
          {title}
        </Heading>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
