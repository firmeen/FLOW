export const FLOW_BRAND_ASSETS = {
  primary: "/brand/flow-logo.png",
  icon: "/brand/flow-icon.png",
  compact: "/brand/flow-compact.png",
  reverse: "/brand/flow-dark.png",
  favicon: "/brand/flow-favicon.png",
  wordmark: "/brand/flow-wordmark.png",
  appIcon: "/brand/flow-icon-dark.png",
  openGraph: "/brand/flow-og.png",
  appIcon192: "/brand/generated/flow-icon-192.png",
  appIcon512: "/brand/generated/flow-icon-512.png",
  appIconMaskable512: "/brand/generated/flow-icon-maskable-512.png",
} as const;

export const FLOW_LOGO_ASSET_DETAILS = {
  primary: {
    src: FLOW_BRAND_ASSETS.primary,
    width: 1536,
    height: 1024,
  },
  icon: {
    src: FLOW_BRAND_ASSETS.icon,
    width: 1254,
    height: 1254,
  },
  compact: {
    src: FLOW_BRAND_ASSETS.compact,
    width: 1774,
    height: 887,
  },
  reverse: {
    src: FLOW_BRAND_ASSETS.reverse,
    width: 1672,
    height: 941,
  },
  wordmark: {
    src: FLOW_BRAND_ASSETS.wordmark,
    width: 1774,
    height: 887,
  },
} as const;

export type FlowBrandAsset =
  (typeof FLOW_BRAND_ASSETS)[keyof typeof FLOW_BRAND_ASSETS];

export type FlowLogoVariant = keyof typeof FLOW_LOGO_ASSET_DETAILS;
