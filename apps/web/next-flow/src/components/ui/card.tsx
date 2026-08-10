import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  muted?: boolean;
}

export function Card({
  interactive = false,
  muted = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-lg border border-[#dfe2da]",
        muted ? "bg-[#f1f1eb]" : "bg-white",
        interactive
          ? "transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#bdc9c2] hover:shadow-[0_8px_24px_rgba(27,55,46,0.08)]"
          : "shadow-[0_1px_2px_rgba(27,55,46,0.04)]",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pt-5 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold tracking-[-0.015em] text-[#1b2c25] ${className}`} {...props} />
  );
}

export function CardDescription({ className = "", ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`mt-1 text-sm leading-5 text-[#6b7872] ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 py-5 ${className}`} {...props} />;
}

export function CardFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center gap-3 border-t border-[#e7e9e3] px-5 py-4 ${className}`}
      {...props}
    />
  );
}
