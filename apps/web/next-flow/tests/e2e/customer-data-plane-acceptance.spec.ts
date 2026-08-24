import { expect, test } from "@playwright/test";

const capabilityCookie = "flow_customer_capability_v1";
const menuItemId = "00000000-0000-0000-0000-0000000000aa";
const modifierChoiceId = "00000000-0000-0000-0000-0000000000a9";

type CartBody = {
  ok: true;
  data: {
    id: string;
    status: string;
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

test.describe("P03/R06 customer data plane acceptance", () => {
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for customer data-plane E2E");

  test("direct entry drives replay-safe cart and order HTTP flow without staff authority", async ({
    page,
  }) => {
    await page.goto("/r/restaurant-a/table/T-A1");
    await expect(page).toHaveURL(/\/r\/restaurant-a\/table\/T-A1$/);

    const capability = (await page.context().cookies()).find(
      (candidate) => candidate.name === capabilityCookie,
    );
    expect(capability).toBeDefined();
    expect(capability?.httpOnly).toBe(true);

    const createCart = await page.request.post("/api/customer/cart");
    expect(createCart.status()).toBe(201);
    const created = (await createCart.json()) as CartBody;
    expect(created.ok).toBe(true);
    expect(created.data.status).toBe("DRAFT");

    const addKey = "20000000-0000-4000-8000-000000000081";
    const addPayload = {
      cartId: created.data.id,
      menuItemId,
      quantity: 1,
      modifierChoiceIds: [modifierChoiceId],
      specialRequest: "no straw",
    };

    const add = await page.request.post("/api/customer/cart/items", {
      headers: { "Idempotency-Key": addKey },
      data: addPayload,
    });
    expect(add.status()).toBe(200);
    expect(add.headers()["idempotency-replayed"]).toBeUndefined();
    const added = (await add.json()) as CartBody;
    expect(added.ok).toBe(true);
    expect(added.data.items).toHaveLength(1);

    const addReplay = await page.request.post("/api/customer/cart/items", {
      headers: { "Idempotency-Key": addKey },
      data: addPayload,
    });
    expect(addReplay.status()).toBe(200);
    expect(addReplay.headers()["idempotency-replayed"]).toBe("true");
    expect(await addReplay.json()).toEqual(added);

    const itemId = added.data.items[0]!.id;
    const update = await page.request.patch("/api/customer/cart/items", {
      headers: { "Idempotency-Key": "20000000-0000-4000-8000-000000000082" },
      data: { cartId: created.data.id, cartItemId: itemId, quantity: 2 },
    });
    expect(update.status()).toBe(200);
    const updated = (await update.json()) as CartBody;
    expect(updated.data.items[0]?.quantity).toBe(2);

    const remove = await page.request.delete("/api/customer/cart/items", {
      headers: { "Idempotency-Key": "20000000-0000-4000-8000-000000000083" },
      data: { cartId: created.data.id, cartItemId: itemId },
    });
    expect(remove.status()).toBe(200);
    const removed = (await remove.json()) as CartBody;
    expect(removed.data.items).toHaveLength(0);

    const refill = await page.request.post("/api/customer/cart/items", {
      headers: { "Idempotency-Key": "20000000-0000-4000-8000-000000000084" },
      data: {
        cartId: created.data.id,
        menuItemId,
        quantity: 1,
        modifierChoiceIds: [modifierChoiceId],
      },
    });
    expect(refill.status()).toBe(200);

    const submitKey = "20000000-0000-4000-8000-000000000085";
    const submitPayload = { cartId: created.data.id, customerNote: "window side" };
    const submit = await page.request.post("/api/customer/orders", {
      headers: { "Idempotency-Key": submitKey },
      data: submitPayload,
    });
    expect(submit.status()).toBe(201);
    const submitted = (await submit.json()) as OrderBody;
    expect(submitted.ok).toBe(true);
    expect(submitted.data.status).toBe("PENDING_CONFIRMATION");

    const submitReplay = await page.request.post("/api/customer/orders", {
      headers: { "Idempotency-Key": submitKey },
      data: submitPayload,
    });
    expect(submitReplay.status()).toBe(201);
    expect(submitReplay.headers()["idempotency-replayed"]).toBe("true");
    const replayed = (await submitReplay.json()) as OrderBody;
    expect(replayed.data.id).toBe(submitted.data.id);
    expect(replayed.data.orderNumber).toBe(submitted.data.orderNumber);

    await page.goto("/staff");
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });

  test("mutation transport fails closed on missing request identity, wrong origin and invalid capability", async ({
    page,
  }) => {
    await page.goto("/r/restaurant-a/table/T-A1");
    const cartResponse = await page.request.post("/api/customer/cart");
    const cart = (await cartResponse.json()) as CartBody;

    const missingKey = await page.request.post("/api/customer/cart/items", {
      data: { cartId: cart.data.id, menuItemId, quantity: 1 },
    });
    expect(missingKey.status()).toBe(400);
    await expect(missingKey.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "CUSTOMER_COMMAND_IDEMPOTENCY_KEY_REQUIRED" },
    });

    const wrongOrigin = await page.request.post("/api/customer/cart/items", {
      headers: {
        Origin: "https://example.invalid",
        "Idempotency-Key": "20000000-0000-4000-8000-000000000086",
      },
      data: { cartId: cart.data.id, menuItemId, quantity: 1 },
    });
    expect(wrongOrigin.status()).toBe(400);
    await expect(wrongOrigin.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "CUSTOMER_COMMAND_INVALID_INPUT" },
    });

    await page.context().clearCookies();
    const noCapability = await page.request.post("/api/customer/cart/items", {
      headers: { "Idempotency-Key": "20000000-0000-4000-8000-000000000087" },
      data: { cartId: cart.data.id, menuItemId, quantity: 1 },
    });
    expect(noCapability.status()).toBe(401);
    await expect(noCapability.json()).resolves.toMatchObject({
      ok: false,
      error: { code: "CUSTOMER_COMMAND_CONTEXT_REQUIRED" },
    });
  });
});
