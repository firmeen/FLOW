import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import {
  Button as ShadcnButton,
  buttonVariants,
} from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive"
  | "link";

export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "default"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

type ShadcnButtonProps = ComponentProps<typeof ShadcnButton>;
type ShadcnButtonVariant = NonNullable<ShadcnButtonProps["variant"]>;
type ShadcnButtonSize = NonNullable<ShadcnButtonProps["size"]>;

export type ButtonProps = Omit<
  ShadcnButtonProps,
  "children" | "className" | "size" | "variant"
> & {
  className?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<ButtonVariant, ShadcnButtonVariant> = {
  primary: "default",
  default: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "destructive",
  destructive: "destructive",
  link: "link",
};

const sizes: Record<ButtonSize, ShadcnButtonSize> = {
  xs: "xs",
  sm: "sm",
  md: "default",
  default: "default",
  lg: "lg",
  icon: "icon",
  "icon-xs": "icon-xs",
  "icon-sm": "icon-sm",
  "icon-lg": "icon-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      type={type}
      variant={variants[variant]}
      size={sizes[size]}
      className={cn(fullWidth && "w-full", className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span aria-hidden="true">{leftIcon}</span>
      )}
      {isLoading && loadingText ? loadingText : children}
      {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </ShadcnButton>
  );
}

export { buttonVariants };
