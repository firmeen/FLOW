import { expect, test, type Page } from "@playwright/test";

import { identityFixtures as fixture } from "../fixtures/identity";

const menuItemId = "00000000-0000-0000-0000-0000000000aa";
const modifierChoiceId = "00000000-0000-0000-0000-0000000000a9";

type CartBody = {
  ok: true;
  data: {
    id: string;
    items: Array<{ id: string; quantity: number }>;
  };
};

type OrderBody = {
  ok: true;
  data: {
    id: string;
    orderNumber: string;
    status: string;
  };
};

async function signIn(page: Page, email: string, password: string, nextPath: string) {
  await page.goto(`/login?next=${encodeURIComponent(nextPath)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function submitCustomerOrder(page: Page): Promise<OrderBody["data"]> {
  await page.goto("/r/restaurant-a/table/T-A1");

  const createCart = await page.request.post("/api/customer/cart");
  expect(createCart.status()).toBe(201);
  const cart = (await createCart.json()) as CartBody;

  const add = await page.request.post("/api/customer/cart/items", {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: {
      cartId: cart.data.id,
      menuItemId,
      quantity: 1,
      modifierChoiceIds: [modifierChoiceId],
      specialRequest: "R06 browser acceptance",
    },
  });
  expect(add.status()).toBe(200);

  const submit = await page.request.post("/api/customer/orders", {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: { cartId: cart.data.id, customerNote: "R06 staff queue handoff" },
  });
  expect(submit.status()).toBe(201);
  const body = (await submit.json()) as OrderBody;
  expect(body.ok).toBe(true);
  expect(body.data.status).toBe("PENDING_CONFIRMATION");
  return body.data;
}

test.describe("P04/R06 operational order-plane browser acceptance", () => {
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for operational order-plane E2E");

  test("customer submission becomes a durable staff read while order.view remains unable to mutate", async ({ page }) => {
    const submitted = await submitCustomerOrder(page);

    await page.context().clearCookies();
    await signIn(page, fixture.emails.staffA1, fixture.passwords.staffA1, "/staff");
    await expect(page).toHaveURL((url) => url.pathname === "/staff");

    await expect(page.getByRole("heading", { name: "Operational orders" })).toBeVisible();
    await expect(page.getByText(submitted.orderNumber, { exact: true })).toBeVisible();

    const detail = await page.request.get(`/api/internal/orders/${encodeURIComponent(submitted.id)}`);
    expect(detail.status()).toBe(200);
    const detailBody = await detail.json();
    expect(detailBody).toMatchObject({
      ok: true,
      data: {
        id: submitted.id,
        orderNumber: submitted.orderNumber,
        status: "PENDING_CONFIRMATION",
      },
    });
    expect(detailBody.data).not.toHaveProperty("customerCapabilityId");
    expect(detailBody.data).not.toHaveProperty("submissionKey");

    const forbiddenDecision = await page.request.post(
      `/api/internal/orders/${encodeURIComponent(submitted.id)}/decision`,
      { data: { action: "ACCEPT" } },
    );
    expect(forbiddenDecision.status()).toBe(403);
    await expect(forbiddenDecision.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "ORDER_DECISION_FORBIDDEN" },
    });

    const wrongOrigin = await page.request.post(
      `/api/internal/orders/${encodeURIComponent(submitted.id)}/decision`,
      {
        headers: { Origin: "https://example.invalid" },
        data: { action: "ACCEPT" },
      },
    );
    expect(wrongOrigin.status()).toBe(400);
    await expect(wrongOrigin.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "ORDER_DECISION_INVALID_REQUEST" },
    });

    await page.reload();
    await expect(page.getByText(submitted.orderNumber, { exact: true })).toBeVisible();
  });
});
