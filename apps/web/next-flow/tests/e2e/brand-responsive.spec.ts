import { expect, test, type Page, type TestInfo } from "@playwright/test";

import { STORAGE_KEYS } from "@/lib/constants";
import { E2E_AUTH } from "./test-auth";

const viewports = [
  { width: 320, height: 900 },
  { width: 390, height: 900 },
  { width: 768, height: 1024 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
] as const;

const publicSurfaces = [
  { name: "launcher", path: "/" },
  { name: "login", path: "/login" },
  { name: "customer", path: "/r/demo/table/T05" },
] as const;

const internalSurfaces = [
  { name: "staff", path: "/staff" },
  { name: "kitchen", path: "/kitchen" },
  { name: "cashier", path: "/cashier" },
  { name: "owner", path: "/admin" },
] as const;

test("FLOW metadata and PWA manifest use canonical brand assets", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.locator('link[rel="icon"][href*="/brand/flow-favicon.png"]'),
  ).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/brand\/flow-og\.png$/,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /\/brand\/flow-og\.png$/,
  );

  const manifestResponse = await page.request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(manifest).toMatchObject({
    icons: [
      { src: "/brand/generated/flow-icon-192.png", sizes: "192x192" },
      { src: "/brand/generated/flow-icon-512.png", sizes: "512x512" },
      {
        src: "/brand/generated/flow-icon-maskable-512.png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  });
});

async function expectBrandedResponsiveSurface(
  page: Page,
  testInfo: TestInfo,
  surface: { name: string; path: string },
  viewport: (typeof viewports)[number],
) {
  await page.setViewportSize(viewport);
  await page.goto(surface.path, { waitUntil: "networkidle" });
  await page.waitForFunction(
    (storageKey) => window.localStorage.getItem(storageKey) !== null,
    STORAGE_KEYS.demoState,
  );

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

  const brandImages = page.locator("img[data-flow-logo]:visible");
  await expect(brandImages.first()).toBeVisible();
  expect(await brandImages.count()).toBeGreaterThan(0);

  for (const image of await brandImages.all()) {
    expect(
      await image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0,
      ),
    ).toBe(true);
  }

  await page.screenshot({
    path: testInfo.outputPath(
      `${surface.name}-${viewport.width}x${viewport.height}.png`,
    ),
    fullPage: true,
  });
}

async function signInWithDatabaseFixture(page: Page, nextPath: string) {
  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email").fill(E2E_AUTH.email);
  await page.getByLabel("Password").fill(E2E_AUTH.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(
    (url) => url.pathname === nextPath || url.pathname === "/workspace",
  );

  if (new URL(page.url()).pathname === "/workspace") {
    await page
      .getByRole("button", { name: /Tenant A.*Branch A1/i })
      .click();
    await page.waitForURL((url) => url.pathname === nextPath);
  }
}

for (const surface of publicSurfaces) {
  for (const viewport of viewports) {
    test(`${surface.name} has visible FLOW branding without horizontal overflow at ${viewport.width}px`, async ({
      page,
    }, testInfo) => {
      await expectBrandedResponsiveSurface(page, testInfo, surface, viewport);
    });
  }
}

for (const surface of internalSurfaces) {
  for (const viewport of viewports) {
    test(`${surface.name} has authenticated FLOW branding without horizontal overflow at ${viewport.width}px`, async ({
      page,
    }, testInfo) => {
      test.skip(
        !process.env.DATABASE_URL,
        "R04 protected-surface browser checks require a seeded local database",
      );

      await signInWithDatabaseFixture(page, surface.path);
      await expectBrandedResponsiveSurface(page, testInfo, surface, viewport);
    });
  }
}
