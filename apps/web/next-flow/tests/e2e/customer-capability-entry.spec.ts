import { expect, test } from "@playwright/test";

const capabilityCookie = "flow_customer_capability_v1";

test.describe("P03/R01 customer capability entry", () => {
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for customer entry E2E");

  test("valid entry exchanges selectors for an HttpOnly capability and survives refresh", async ({
    page,
  }) => {
    await page.goto("/r/restaurant-a/table/T-A1");
    await expect(page).toHaveURL(/\/r\/restaurant-a\/table\/T-A1$/);

    const cookie = (await page.context().cookies()).find(
      (candidate) => candidate.name === capabilityCookie,
    );
    expect(cookie).toBeDefined();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
    expect(cookie?.value).not.toBe("");

    await page.reload();
    await expect(page).toHaveURL(/\/r\/restaurant-a\/table\/T-A1$/);
  });

  test("invalid and cross-scope entries issue no customer capability", async ({ page }) => {
    await page.goto("/r/restaurant-a/table/UNKNOWN");
    await expect(page).toHaveURL(/\/customer-entry-error\?state=invalid/);
    expect(
      (await page.context().cookies()).some(
        (candidate) => candidate.name === capabilityCookie,
      ),
    ).toBe(false);

    await page.goto("/r/restaurant-b/table/T-A1");
    await expect(page).toHaveURL(/\/customer-entry-error\?state=invalid/);
    expect(
      (await page.context().cookies()).some(
        (candidate) => candidate.name === capabilityCookie,
      ),
    ).toBe(false);
  });

  test("valid re-entry replaces scope only after the new table validates", async ({ page }) => {
    await page.goto("/r/restaurant-a/table/T-A1");
    const first = (await page.context().cookies()).find(
      (candidate) => candidate.name === capabilityCookie,
    );
    expect(first).toBeDefined();

    await page.goto("/r/restaurant-a/table/T-A2");
    await expect(page).toHaveURL(/\/r\/restaurant-a\/table\/T-A2$/);
    const second = (await page.context().cookies()).find(
      (candidate) => candidate.name === capabilityCookie,
    );
    expect(second).toBeDefined();
    expect(second?.value).not.toBe(first?.value);
  });

  test("customer capability alone never authenticates an internal staff route", async ({ page }) => {
    await page.goto("/r/restaurant-a/table/T-A1");
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });
});
