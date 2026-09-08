import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/identity/server/current-access", () => ({
  getCurrentAccessResolution: vi.fn(),
}));

import { OperationalOrderLifecycleError } from "@/modules/order-operations/server/errors";
import {
  LIFECYCLE_TRANSITIONS,
  mapOperationalOrderLifecycleResult,
  parseOperationalOrderLifecycleRequest,
} from "@/modules/order-operations/server/order-lifecycle-service";
import {
  MAX_OPERATIONAL_ORDER_LIFECYCLE_BODY_BYTES,
  assertOperationalOrderLifecycleSameOrigin,
  operationalOrderApiFailure,
  readOperationalOrderLifecycleJson,
} from "@/modules/order-operations/server/http";

const orderId = "95000000-0000-4000-8000-000000000001";

function expectInvalid(callback: () => unknown) {
  expect(callback).toThrowError(OperationalOrderLifecycleError);
  try {
    callback();
  } catch (error) {
    expect(error).toMatchObject({ code: "ORDER_LIFECYCLE_INVALID_REQUEST" });
  }
}

describe("P04/R03 operational order lifecycle contracts", () => {
  it("exposes one exhaustive normal lifecycle graph", () => {
    expect(LIFECYCLE_TRANSITIONS).toEqual({
      START_PREPARING: {
        action: "START_PREPARING",
        from: "ACCEPTED",
        to: "PREPARING",
        customerStatus: "PREPARING",
        eventType: "ORDER_PREPARING",
        timestampColumn: "preparing_at",
      },
      MARK_READY: {
        action: "MARK_READY",
        from: "PREPARING",
        to: "READY",
        customerStatus: "COMING_TO_TABLE",
        eventType: "ORDER_READY",
        timestampColumn: "ready_at",
      },
      MARK_SERVED: {
        action: "MARK_SERVED",
        from: "READY",
        to: "SERVED",
        customerStatus: "SERVED",
        eventType: "ORDER_SERVED",
        timestampColumn: "served_at",
      },
    });
  });

  it("parses only exact action intent and rejects browser authority fields", () => {
    expect(
      parseOperationalOrderLifecycleRequest(orderId, { action: "START_PREPARING" }),
    ).toEqual({ orderId, action: "START_PREPARING" });
    expect(
      parseOperationalOrderLifecycleRequest(orderId, { action: "MARK_READY" }),
    ).toEqual({ orderId, action: "MARK_READY" });
    expect(
      parseOperationalOrderLifecycleRequest(orderId, { action: "MARK_SERVED" }),
    ).toEqual({ orderId, action: "MARK_SERVED" });

    expectInvalid(() => parseOperationalOrderLifecycleRequest("bad", { action: "MARK_READY" }));
    expectInvalid(() => parseOperationalOrderLifecycleRequest(orderId, {}));
    expectInvalid(() =>
      parseOperationalOrderLifecycleRequest(orderId, { action: "READY" }),
    );
    expectInvalid(() =>
      parseOperationalOrderLifecycleRequest(orderId, {
        action: "MARK_READY",
        status: "READY",
      }),
    );
    expectInvalid(() =>
      parseOperationalOrderLifecycleRequest(orderId, {
        action: "MARK_READY",
        tenantId: "00000000-0000-0000-0000-0000000000a1",
      }),
    );
    expectInvalid(() =>
      parseOperationalOrderLifecycleRequest(orderId, {
        action: "MARK_READY",
        actorId: "30000000-0000-4000-8000-0000000000a1",
      }),
    );
  });

  it("maps a valid database transition row and rejects mismatched evidence", () => {
    const at = new Date("2040-03-01T00:00:00Z");
    expect(
      mapOperationalOrderLifecycleResult(LIFECYCLE_TRANSITIONS.START_PREPARING, {
        id: orderId,
        orderNumber: "P04-R03-1",
        status: "PREPARING",
        customerStatus: "PREPARING",
        preparingAt: at,
        readyAt: null,
        servedAt: null,
      }),
    ).toEqual({
      orderId,
      orderNumber: "P04-R03-1",
      action: "START_PREPARING",
      fromStatus: "ACCEPTED",
      status: "PREPARING",
      customerStatus: "PREPARING",
      transitionedAt: at.toISOString(),
    });

    expect(() =>
      mapOperationalOrderLifecycleResult(LIFECYCLE_TRANSITIONS.MARK_READY, {
        id: orderId,
        orderNumber: "P04-R03-1",
        status: "SERVED",
        customerStatus: "SERVED",
        preparingAt: at,
        readyAt: at,
        servedAt: at,
      }),
    ).toThrowError(OperationalOrderLifecycleError);
  });

  it("enforces same-origin and bounded JSON lifecycle transport", async () => {
    expectInvalid(() =>
      assertOperationalOrderLifecycleSameOrigin(
        new Request("https://flow.test/api/internal/orders/1/lifecycle", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
      ),
    );

    expect(() =>
      assertOperationalOrderLifecycleSameOrigin(
        new Request("https://flow.test/api/internal/orders/1/lifecycle", {
          method: "POST",
          headers: { Origin: "https://flow.test" },
        }),
      ),
    ).not.toThrow();

    await expect(
      readOperationalOrderLifecycleJson(
        new Request("https://flow.test/api/internal/orders/1/lifecycle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "MARK_READY" }),
        }),
      ),
    ).resolves.toEqual({ action: "MARK_READY" });

    await expect(
      readOperationalOrderLifecycleJson(
        new Request("https://flow.test/api/internal/orders/1/lifecycle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ padding: "x".repeat(MAX_OPERATIONAL_ORDER_LIFECYCLE_BODY_BYTES) }),
        }),
      ),
    ).rejects.toMatchObject({ code: "ORDER_LIFECYCLE_INVALID_REQUEST" });
  });

  it("maps stale lifecycle state to safe 409 without leaking current status", async () => {
    const response = operationalOrderApiFailure(
      new OperationalOrderLifecycleError("ORDER_LIFECYCLE_CONFLICT", "READY"),
    );
    const body = (await response.json()) as {
      readonly error: { readonly code: string; readonly message: string };
    };

    expect(response.status).toBe(409);
    expect(body.error.code).toBe("ORDER_LIFECYCLE_CONFLICT");
    expect(JSON.stringify(body)).not.toContain("READY");
  });
});
