import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/identity/server/current-access", () => ({
  getCurrentAccessResolution: vi.fn(),
}));

import { OperationalOrderDecisionError } from "@/modules/order-operations/server/errors";
import {
  normalizeOperationalOrderRejectionReason,
  parseOperationalOrderDecisionRequest,
} from "@/modules/order-operations/server/order-decision-service";
import {
  MAX_OPERATIONAL_ORDER_DECISION_BODY_BYTES,
  assertOperationalOrderDecisionSameOrigin,
  operationalOrderApiFailure,
  readOperationalOrderDecisionJson,
} from "@/modules/order-operations/server/http";

const orderId = "91000000-0000-4000-8000-000000000001";

function expectInvalidRequest(callback: () => unknown) {
  try {
    callback();
    throw new Error("Expected invalid request");
  } catch (error) {
    expect(error).toBeInstanceOf(OperationalOrderDecisionError);
    expect((error as OperationalOrderDecisionError).code).toBe(
      "ORDER_DECISION_INVALID_REQUEST",
    );
  }
}

async function expectInvalidRequestAsync(callback: () => Promise<unknown>) {
  await expect(callback()).rejects.toMatchObject({
    code: "ORDER_DECISION_INVALID_REQUEST",
  });
}

describe("P04/R02 operational order decision contracts", () => {
  it("parses explicit accept intent without authority fields", () => {
    const command = parseOperationalOrderDecisionRequest(orderId, {
      action: "ACCEPT",
    });

    expect(command).toEqual({
      orderId,
      decision: "ACCEPT",
      reasonCode: null,
    });
    expect(command).not.toHaveProperty("tenantId");
    expect(command).not.toHaveProperty("branchId");
    expect(command).not.toHaveProperty("actorId");
    expect(command).not.toHaveProperty("targetStatus");
  });

  it("parses rejection only from the bounded reason taxonomy", () => {
    expect(
      parseOperationalOrderDecisionRequest(orderId, {
        action: "REJECT",
        reasonCode: "ITEM_UNAVAILABLE",
      }),
    ).toEqual({
      orderId,
      decision: "REJECT",
      reasonCode: "ITEM_UNAVAILABLE",
    });

    expect(normalizeOperationalOrderRejectionReason(" OTHER ")).toBe("OTHER");
    expectInvalidRequest(() => normalizeOperationalOrderRejectionReason("NOT_REAL"));
    expectInvalidRequest(() =>
      parseOperationalOrderDecisionRequest(orderId, { action: "REJECT" }),
    );
  });

  it("rejects malformed selectors, arbitrary target status and spoofed authority", () => {
    expectInvalidRequest(() =>
      parseOperationalOrderDecisionRequest("not-a-uuid", { action: "ACCEPT" }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderDecisionRequest(orderId, {
        action: "ACCEPT",
        actorId: "30000000-0000-4000-8000-0000000000a1",
      }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderDecisionRequest(orderId, {
        action: "REJECT",
        reasonCode: "OTHER",
        branchId: "00000000-0000-0000-0000-0000000000ac",
      }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderDecisionRequest(orderId, {
        action: "ACCEPT",
        targetStatus: "PREPARING",
      }),
    );
  });

  it("rejects cross-origin browser mutation intent", () => {
    expectInvalidRequest(() =>
      assertOperationalOrderDecisionSameOrigin(
        new Request("https://flow.test/api/internal/orders/1/decision", {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
      ),
    );

    expect(() =>
      assertOperationalOrderDecisionSameOrigin(
        new Request("https://flow.test/api/internal/orders/1/decision", {
          method: "POST",
          headers: { Origin: "https://flow.test" },
        }),
      ),
    ).not.toThrow();
  });

  it("parses same-origin bounded JSON and rejects unsupported content types", async () => {
    const request = new Request("https://flow.test/api/internal/orders/1/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ACCEPT" }),
    });
    await expect(readOperationalOrderDecisionJson(request)).resolves.toEqual({
      action: "ACCEPT",
    });

    await expectInvalidRequestAsync(() =>
      readOperationalOrderDecisionJson(
        new Request("https://flow.test/api/internal/orders/1/decision", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ action: "ACCEPT" }),
        }),
      ),
    );
  });

  it("enforces the actual request body byte bound even without Content-Length", async () => {
    const oversized = JSON.stringify({
      action: "REJECT",
      reasonCode: "OTHER",
      padding: "x".repeat(MAX_OPERATIONAL_ORDER_DECISION_BODY_BYTES),
    });
    const request = new Request("https://flow.test/api/internal/orders/1/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: oversized,
    });

    await expectInvalidRequestAsync(() => readOperationalOrderDecisionJson(request));
  });

  it("maps stale decisions to stable HTTP 409 without internal details", async () => {
    const response = operationalOrderApiFailure(
      new OperationalOrderDecisionError(
        "ORDER_DECISION_CONFLICT",
        "PENDING_CONFIRMATION -> ACCEPTED",
      ),
    );
    const body = (await response.json()) as {
      readonly ok: boolean;
      readonly error: { readonly code: string; readonly message: string };
    };

    expect(response.status).toBe(409);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "ORDER_DECISION_CONFLICT",
        message: "The order was already decided or is no longer eligible.",
      },
    });
    expect(JSON.stringify(body)).not.toContain("PENDING_CONFIRMATION -> ACCEPTED");
  });
});
