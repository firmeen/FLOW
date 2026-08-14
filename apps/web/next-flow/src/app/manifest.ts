import type { MetadataRoute } from "next";

import { FLOW_BRAND_ASSETS } from "@/config/brand-assets";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${APP_NAME} - Restaurant Operations Platform`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f7f5ef",
    theme_color: "#064e3b",
    categories: ["business", "food", "productivity"],
    icons: [
      {
        src: FLOW_BRAND_ASSETS.appIcon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: FLOW_BRAND_ASSETS.appIcon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: FLOW_BRAND_ASSETS.appIconMaskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
