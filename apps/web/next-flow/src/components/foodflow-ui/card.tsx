import type { ComponentProps } from "react";

import {
  Card as ShadcnCard,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CardProps extends ComponentProps<typeof ShadcnCard> {
  interactive?: boolean;
  muted?: boolean;
}

export function Card({
  interactive = false,
  muted = false,
  className,
  ...props
}: CardProps) {
  return (
    <ShadcnCard
      className={cn(
        muted && "bg-muted",
        interactive &&
          "transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export {
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
