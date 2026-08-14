import Image from "next/image";

import {
  FLOW_LOGO_ASSET_DETAILS,
  type FlowLogoVariant,
} from "@/config/brand-assets";
import { cn } from "@/lib/utils";

export interface FlowLogoProps {
  variant?: FlowLogoVariant;
  alt?: string;
  decorative?: boolean;
  preload?: boolean;
  sizes?: string;
  className?: string;
}

export function FlowLogo({
  variant = "primary",
  alt = "FLOW",
  decorative = false,
  preload = false,
  sizes,
  className,
}: FlowLogoProps) {
  const asset = FLOW_LOGO_ASSET_DETAILS[variant];

  return (
    <Image
      data-flow-logo={variant}
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      preload={preload}
      sizes={sizes}
      className={cn("h-auto w-auto max-w-full object-contain", className)}
    />
  );
}
