import type { ButtonHTMLAttributes, ReactNode } from "react";

export type IconButtonVariant = "default" | "ghost" | "inverted" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

const variants: Record<IconButtonVariant, string> = {
  default: "border-[#d8ddd5] bg-white text-[#29483e] hover:bg-[#f0f2ed]",
  ghost: "border-transparent bg-transparent text-[#5d6f68] hover:bg-[#e8ece7] hover:text-[#173f35]",
  inverted: "border-white/15 bg-white/10 text-white hover:bg-white/18",
  danger: "border-[#eed2cf] bg-[#fff8f7] text-[#9a3932] hover:bg-[#f8e5e2]",
};

const sizes: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-11",
};

export function IconButton({
  label,
  variant = "default",
  size = "md",
  className = "",
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={props.title ?? label}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-md border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6a59]/45 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
