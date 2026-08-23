import { expect, test, type Page } from "@playwright/test";

import { identityFixtures as fixture } from "../fixtures/identity";

async function signIn(
  page: Page,
  email: string,
  password: string,
  nextPath: string,
) {
  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function expectAllowed(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL((url) => url.pathname === path);
}

async function expectForbidden(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL((url) => url.pathname === "/forbidden");
  await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();
}

test.describe("P02/R05 route permission enforcement", () => {
  test.skip(
    !process.env.DATABASE_URL,
    "R05 route authorization checks require the seeded local database",
  );

  test("Staff A1 can use staff but cannot directly navigate to kitchen, cashier, or admin", async ({ page }) => {
    await signIn(page, fixture.emails.staffA1, fixture.passwords.staffA1, "/staff");
    await expect(page).toHaveURL((url) => url.pathname === "/staff");

    await expectForbidden(page, "/kitchen");
    await expectForbidden(page, "/cashier");
    await expectForbidden(page, "/admin");
  });

  test("Kitchen A1 can use kitchen but cannot use cashier", async ({ page }) => {
    await signIn(page, fixture.emails.kitchenA1, fixture.passwords.kitchenA1, "/kitchen");
    await expect(page).toHaveURL((url) => url.pathname === "/kitchen");
    await expectAllowed(page, "/kitchen");
    await expectForbidden(page, "/cashier");
  });

  test("Cashier A2 can use cashier but cannot use kitchen", async ({ page }) => {
    await signIn(page, fixture.emails.cashierA2, fixture.passwords.cashierA2, "/cashier");
    await expect(page).toHaveURL((url) => url.pathname === "/cashier");
    await expectAllowed(page, "/cashier");
    await expectForbidden(page, "/kitchen");
  });

  test("Owner A selects an authorized branch and can use admin", async ({ page }) => {
    await signIn(page, fixture.emails.ownerA, fixture.passwords.ownerA, "/admin");
    await expect(page).toHaveURL((url) => url.pathname === "/workspace");
    await page.getByRole("button", { name: /Branch A1/ }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/admin");
  });
});
