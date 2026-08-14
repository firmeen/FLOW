import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import { FLOW_BRAND_ASSETS } from "@/config/brand-assets";

const EXPECTED_DIMENSIONS: Record<
  (typeof FLOW_BRAND_ASSETS)[keyof typeof FLOW_BRAND_ASSETS],
  readonly [width: number, height: number]
> = {
  "/brand/flow-logo.png": [1536, 1024],
  "/brand/flow-icon.png": [1254, 1254],
  "/brand/flow-compact.png": [1774, 887],
  "/brand/flow-dark.png": [1672, 941],
  "/brand/flow-favicon.png": [1254, 1254],
  "/brand/flow-wordmark.png": [1774, 887],
  "/brand/flow-icon-dark.png": [1254, 1254],
  "/brand/flow-og.png": [1536, 1024],
  "/brand/generated/flow-icon-192.png": [192, 192],
  "/brand/generated/flow-icon-512.png": [512, 512],
  "/brand/generated/flow-icon-maskable-512.png": [512, 512],
};

const PNG_SIGNATURE = "89504e470d0a1a0a";

describe("FLOW brand asset registry", () => {
  it.each(Object.values(FLOW_BRAND_ASSETS))(
    "%s points to a valid PNG with its expected dimensions",
    async (assetPath) => {
      const bytes = await readFile(
        join(process.cwd(), "public", assetPath.slice(1)),
      );
      const [expectedWidth, expectedHeight] = EXPECTED_DIMENSIONS[assetPath];

      expect(bytes.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE);
      expect(bytes.readUInt32BE(16)).toBe(expectedWidth);
      expect(bytes.readUInt32BE(20)).toBe(expectedHeight);
    },
  );

  it("declares canonical, size-matched PWA icons", () => {
    expect(manifest().icons).toEqual([
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
    ]);
  });
});
