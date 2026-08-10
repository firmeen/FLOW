import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps, type ButtonVariant } from "./button";

export type IconButtonVariant = "default" | "ghost" | "inverted" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonProps, "aria-label" | "children" | "size" | "variant"> {
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

const variants: Record<IconButtonVariant, ButtonVariant> = {
  default: "outline",
  ghost: "ghost",
  inverted: "secondary",
  danger: "danger",
};

const sizes: Record<IconButtonSize, "icon-sm" | "icon" | "icon-lg"> = {
  sm: "icon-sm",
  md: "icon",
  lg: "icon-lg",
};

export function IconButton({
  label,
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={props.title ?? label}
      variant={variants[variant]}
      size={sizes[size]}
      className={cn(variant === "inverted" && "border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
