import { expect, test } from "@playwright/test";

test("a stale legacy session cookie cannot authenticate a protected route", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "foodflow_session",
      value: "stale-retired-session-token",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/staff");
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});
