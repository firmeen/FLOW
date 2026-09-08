import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/identity/server/current-access", () => ({
  getCurrentAccessResolution: vi.fn(),
}));

import { OperationalOrderExceptionError } from "@/modules/order-operations/server/errors";
import {
  MAX_OPERATIONAL_ORDER_CUSTOMER_NOTE_LENGTH,
  MAX_OPERATIONAL_ORDER_QUANTITY,
  MAX_OPERATIONAL_ORDER_SPECIAL_REQUEST_LENGTH,
  mapOperationalOrderAmendmentResult,
  mapOperationalOrderCancellationResult,
  normalizeOperationalOrderCancellationReason,
  parseOperationalOrderExceptionRequest,
} from "@/modules/order-operations/server/order-exception-service";
import {
  MAX_OPERATIONAL_ORDER_EXCEPTION_BODY_BYTES,
  assertOperationalOrderExceptionSameOrigin,
  operationalOrderApiFailure,
  readOperationalOrderExceptionJson,
} from "@/modules/order-operations/server/http";
import { mapOperationalOrderDecisionResult } from "@/modules/order-operations/server/order-decision-service";
import { OPERATIONAL_ORDER_CANCELLATION_REASONS } from "@/modules/order-operations/server/types";

const orderId = "a1000000-0000-4000-8000-000000000001";
const itemOneId = "a1000000-0000-4000-8000-000000000002";
const itemTwoId = "a1000000-0000-4000-8000-000000000003";

function expectInvalidRequest(callback: () => unknown) {
  try {
    callback();
    throw new Error("Expected invalid request");
  } catch (error) {
    expect(error).toBeInstanceOf(OperationalOrderExceptionError);
    expect((error as OperationalOrderExceptionError).code).toBe(
      "ORDER_EXCEPTION_INVALID_REQUEST",
    );
  }
}

async function expectInvalidRequestAsync(callback: () => Promise<unknown>) {
  await expect(callback()).rejects.toMatchObject({ code: "ORDER_EXCEPTION_INVALID_REQUEST" });
}

describe("P04/R04 controlled order exception contracts", () => {
  it("parses a bounded AMEND request without accepting authority or price fields", () => {
    expect(
      parseOperationalOrderExceptionRequest(orderId, {
        action: "AMEND",
        customerNote: "  Less spicy  ",
        itemChanges: [
          { itemId: itemOneId, quantity: 2, specialRequest: " no onion " },
          { itemId: itemTwoId, remove: true },
        ],
      }),
    ).toEqual({
      orderId,
      action: "AMEND",
      customerNote: "Less spicy",
      itemChanges: [
        { itemId: itemOneId, quantity: 2, specialRequest: "no onion" },
        { itemId: itemTwoId, remove: true },
      ],
    });

    for (const forbidden of [
      "status",
      "customerStatus",
      "tenantId",
      "branchId",
      "actorId",
      "subtotalMinor",
      "currency",
      "unitPriceMinor",
      "modifierPriceMinor",
      "timestamp",
    ]) {
      expectInvalidRequest(() =>
        parseOperationalOrderExceptionRequest(orderId, {
          action: "AMEND",
          customerNote: "ok",
          [forbidden]: "spoofed",
        }),
      );
    }
  });

  it("rejects empty, duplicate, malformed, and unbounded item changes", () => {
    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest(orderId, { action: "AMEND", itemChanges: [] }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest("not-a-uuid", {
        action: "AMEND",
        customerNote: "x",
      }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest(orderId, {
        action: "AMEND",
        itemChanges: [
          { itemId: itemOneId, quantity: 2 },
          { itemId: itemOneId, specialRequest: "duplicate" },
        ],
      }),
    );

    for (const quantity of [0, -1, MAX_OPERATIONAL_ORDER_QUANTITY + 1, 1.5]) {
      expectInvalidRequest(() =>
        parseOperationalOrderExceptionRequest(orderId, {
          action: "AMEND",
          itemChanges: [{ itemId: itemOneId, quantity }],
        }),
      );
    }

    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest(orderId, {
        action: "AMEND",
        itemChanges: [{ itemId: itemOneId, remove: true, quantity: 2 }],
      }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest(orderId, {
        action: "AMEND",
        itemChanges: [{ itemId: itemOneId, quantity: 2, unitPriceMinor: "1" }],
      }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest(orderId, {
        action: "AMEND",
        customerNote: "x".repeat(MAX_OPERATIONAL_ORDER_CUSTOMER_NOTE_LENGTH + 1),
      }),
    );
    expectInvalidRequest(() =>
      parseOperationalOrderExceptionRequest(orderId, {
        action: "AMEND",
        itemChanges: [
          {
            itemId: itemOneId,
            specialRequest: "x".repeat(MAX_OPERATIONAL_ORDER_SPECIAL_REQUEST_LENGTH + 1),
          },
        ],
      }),
    );
  });

  it("accepts only the exact cancellation reason taxonomy and strict CANCEL body", () => {
    for (const reasonCode of OPERATIONAL_ORDER_CANCELLATION_REASONS) {
      expect(normalizeOperationalOrderCancellationReason(reasonCode)).toBe(reasonCode);
      expect(
        parseOperationalOrderExceptionRequest(orderId, { action: "CANCEL", reasonCode }),
      ).toEqual({ orderId, action: "CANCEL", reasonCode });
    }

    for (const invalid of [undefined, null, "", "staff_request", "NOT_REAL", 7, []]) {
      expectInvalidRequest(() => normalizeOperationalOrderCancellationReason(invalid));
    }

    for (const forbidden of [
      "note",
      "itemChanges",
      "status",
      "customerStatus",
      "actorId",
      "tenantId",
      "branchId",
      "cancelledAt",
    ]) {
      expectInvalidRequest(() =>
        parseOperationalOrderExceptionRequest(orderId, {
          action: "CANCEL",
          reasonCode: "OTHER",
          [forbidden]: "spoofed",
        }),
      );
    }
  });

  it("enforces same-origin and bounded JSON transport", async () => {
    expectInvalidRequest(() =>
      assertOperationalOrderExceptionSameOrigin(
        new Request(`https://flow.test/api/internal/orders/${orderId}/exception`, {
          method: "POST",
          headers: { Origin: "https://evil.test" },
        }),
      ),
    );
    expect(() =>
      assertOperationalOrderExceptionSameOrigin(
        new Request(`https://flow.test/api/internal/orders/${orderId}/exception`, {
          method: "POST",
          headers: { Origin: "https://flow.test" },
        }),
      ),
    ).not.toThrow();

    const valid = new Request(`https://flow.test/api/internal/orders/${orderId}/exception`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL", reasonCode: "OTHER" }),
    });
    await expect(readOperationalOrderExceptionJson(valid)).resolves.toEqual({
      action: "CANCEL",
      reasonCode: "OTHER",
    });

    const oversized = new Request(
      `https://flow.test/api/internal/orders/${orderId}/exception`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "AMEND", padding: "x".repeat(MAX_OPERATIONAL_ORDER_EXCEPTION_BODY_BYTES) }),
      },
    );
    await expectInvalidRequestAsync(() => readOperationalOrderExceptionJson(oversized));
  });

  it("maps invariant-checked amendment and cancellation results", () => {
    const changedAt = new Date("2040-04-01T00:00:00Z");
    expect(
      mapOperationalOrderAmendmentResult(
        {
          id: orderId,
          orderNumber: "P04-R04-1",
          status: "CHANGED",
          customerStatus: "SENT",
          subtotalMinor: "25000",
          currency: "THB",
          changedAt,
        },
        "ITEM_QUANTITY",
      ),
    ).toEqual({
      orderId,
      orderNumber: "P04-R04-1",
      action: "AMEND",
      fromStatus: "ACCEPTED",
      status: "CHANGED",
      customerStatus: "SENT",
      subtotalMinor: "25000",
      currency: "THB",
      changeCategory: "ITEM_QUANTITY",
      changedAt: changedAt.toISOString(),
    });

    const cancelledAt = new Date("2040-04-01T00:01:00Z");
    expect(
      mapOperationalOrderCancellationResult(
        "PREPARING",
        "CUSTOMER_REQUEST",
        {
          id: orderId,
          orderNumber: "P04-R04-1",
          status: "CANCELLED",
          customerStatus: "CANCELLED",
          cancelledAt,
        },
      ),
    ).toMatchObject({
      fromStatus: "PREPARING",
      status: "CANCELLED",
      customerStatus: "CANCELLED",
      reasonCode: "CUSTOMER_REQUEST",
      cancelledAt: cancelledAt.toISOString(),
    });

    expect(() =>
      mapOperationalOrderCancellationResult(
        "READY",
        "OTHER",
        {
          id: orderId,
          orderNumber: "P04-R04-1",
          status: "SERVED",
          customerStatus: "SERVED",
          cancelledAt,
        },
      ),
    ).toThrowError(OperationalOrderExceptionError);
  });

  it("preserves the true CHANGED source in re-decision result mapping", () => {
    const decidedAt = new Date("2040-04-01T00:02:00Z");
    expect(
      mapOperationalOrderDecisionResult("ACCEPT", {
        id: orderId,
        orderNumber: "P04-R04-1",
        fromStatus: "CHANGED",
        status: "ACCEPTED",
        customerStatus: "CONFIRMED",
        decidedAt,
        rejectionReason: null,
      }),
    ).toMatchObject({
      fromStatus: "CHANGED",
      status: "ACCEPTED",
      customerStatus: "CONFIRMED",
    });
  });

  it("maps exception conflict to stable 409 without exposing current state", async () => {
    const response = operationalOrderApiFailure(
      new OperationalOrderExceptionError("ORDER_EXCEPTION_CONFLICT", "READY"),
    );
    const body = await response.json();
    expect(response.status).toBe(409);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "ORDER_EXCEPTION_CONFLICT",
        message: "The order is no longer eligible for that exception action.",
      },
    });
    expect(JSON.stringify(body)).not.toContain("READY");
  });
});
