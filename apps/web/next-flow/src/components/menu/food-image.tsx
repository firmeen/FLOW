import type { HTMLAttributes } from "react";

interface FoodImageProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  imageKey?: string;
  alt: string;
}

export function FoodImage({ imageKey = "gyudon", alt, className = "", ...props }: FoodImageProps) {
  return (
    <div
      className={`food-sprite overflow-hidden bg-cover ${className}`}
      data-image={imageKey}
      role="img"
      aria-label={alt}
      {...props}
    />
  );
}
