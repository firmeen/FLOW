import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "border-[#173f35] bg-[#173f35] text-white shadow-sm hover:border-[#0f3028] hover:bg-[#0f3028]",
  secondary: "border-[#dfe1d9] bg-white text-[#173f35] shadow-sm hover:border-[#c8cdc3] hover:bg-[#f4f4ee]",
  outline: "border-[#9aaba4] bg-transparent text-[#173f35] hover:border-[#173f35] hover:bg-[#edf1ed]",
  ghost: "border-transparent bg-transparent text-[#40544c] hover:bg-[#e9ede8] hover:text-[#173f35]",
  danger: "border-[#a43d35] bg-[#a43d35] text-white shadow-sm hover:border-[#853129] hover:bg-[#853129]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-8 gap-1.5 px-3 py-1.5 text-xs",
  md: "min-h-10 gap-2 px-4 py-2 text-sm",
  lg: "min-h-12 gap-2.5 px-5 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-md border font-semibold tracking-[-0.01em] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6a59]/45 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].filter(Boolean).join(" ")}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{isLoading && loadingText ? loadingText : children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
}
