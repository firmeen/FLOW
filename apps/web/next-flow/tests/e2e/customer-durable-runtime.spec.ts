import { expect, test } from "@playwright/test";

const menuItemId = "00000000-0000-0000-0000-0000000000aa";

test.describe("customer durable runtime", () => {
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for durable customer E2E");

  test("renders database storefront and persists cart + order across reloads", async ({ page }) => {
    await page.goto("/r/restaurant-a/table/T-A1");

    await expect(page.locator('[data-flow-customer-data-source="database"]')).toBeVisible();
    await expect(page.locator('[data-flow-customer-runtime="durable"]').first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Order beautifully/i })).toBeVisible();

    await page.getByRole("button", { name: "Explore menu" }).click();
    await expect(page.locator('[data-flow-live-menu="database"]')).toBeVisible();

    const menuCard = page.locator(`[data-flow-menu-item="${menuItemId}"]`);
    await expect(menuCard).toBeVisible();
    await menuCard.getByRole("button").click();

    await expect(page.getByRole("dialog", { name: /.+/ })).toBeVisible();
    await page.getByRole("button", { name: /Add to cart/ }).click();
    await expect(page.getByText("Added to your table cart")).toBeVisible();

    await page.getByRole("button", { name: /Open cart with 1 items/ }).click();
    await expect(page.locator('[data-flow-durable-cart="true"]')).toBeVisible();
    await expect(page.locator("[data-flow-cart-item]")).toHaveCount(1);

    await page.getByRole("button", { name: "Close cart" }).click();
    await page.reload();
    await expect(page.locator('[data-flow-customer-runtime="durable"]').first()).toBeVisible();

    await page.getByRole("button", { name: /Open cart with 1 items/ }).click();
    await expect(page.locator("[data-flow-cart-item]")).toHaveCount(1);

    await page.getByRole("button", { name: "Send to restaurant" }).click();
    await expect(page.locator('[data-flow-customer-orders="database"]')).toBeVisible();
    const durableOrder = page.locator("[data-flow-customer-order]").first();
    await expect(durableOrder).toBeVisible();
    await expect(durableOrder).toContainText("Waiting for restaurant");

    const orderNumber = (await durableOrder.getByRole("heading").textContent())?.trim();
    expect(orderNumber).toBeTruthy();

    await page.getByRole("button", { name: /Open cart with 0 items/ }).click();
    await expect(page.getByText("Nothing here yet")).toBeVisible();
    await page.getByRole("button", { name: "Close cart" }).click();

    await page.reload();
    await page.getByRole("button", { name: "View orders" }).click();
    await expect(page.locator('[data-flow-customer-orders="database"]')).toBeVisible();
    await expect(page.locator("[data-flow-customer-order]").first()).toContainText(orderNumber!);
  });
});
