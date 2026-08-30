import { describe, expect, it } from "vitest";

import { OperationalOrderProductionControlError } from "@/modules/order-operations/server/errors";
import {
  MAX_OPERATIONAL_ORDER_DEFER_HOURS,
  mapOperationalOrderProductionControlResult,
  parseOperationalOrderProductionControlRequest,
} from "@/modules/order-operations/server/order-production-control-service";

const orderId = "b1000000-0000-4000-8000-000000000001";
const now = Date.parse("2040-05-01T00:00:00Z");

function expectInvalid(callback: () => unknown) {
  expect(callback).toThrowError(OperationalOrderProductionControlError);
  try {
    callback();
  } catch (error) {
    expect((error as OperationalOrderProductionControlError).code).toBe(
      "ORDER_CONTROL_INVALID_REQUEST",
    );
  }
}

describe("P04/R05 production control contracts", () => {
  it("parses every bounded control without browser authority fields", () => {
    expect(
      parseOperationalOrderProductionControlRequest(
        orderId,
        { action: "SET_PRIORITY", reasonCode: "WAIT_TIME" },
        now,
      ),
    ).toEqual({ orderId, action: "SET_PRIORITY", reasonCode: "WAIT_TIME" });
    expect(parseOperationalOrderProductionControlRequest(orderId, { action: "CLEAR_PRIORITY" }, now)).toEqual({
      orderId,
      action: "CLEAR_PRIORITY",
    });
    expect(
      parseOperationalOrderProductionControlRequest(
        orderId,
        {
          action: "DEFER_ORDER",
          reasonCode: "INGREDIENT_WAIT",
          deferredUntil: "2040-05-01T02:00:00+00:00",
        },
        now,
      ),
    ).toEqual({
      orderId,
      action: "DEFER_ORDER",
      reasonCode: "INGREDIENT_WAIT",
      deferredUntil: "2040-05-01T02:00:00.000Z",
    });
    expect(parseOperationalOrderProductionControlRequest(orderId, { action: "RESUME_ORDER" }, now)).toEqual({
      orderId,
      action: "RESUME_ORDER",
    });
    expect(
      parseOperationalOrderProductionControlRequest(
        orderId,
        { action: "REQUEST_REMAKE", reasonCode: "QUALITY_ISSUE" },
        now,
      ),
    ).toEqual({ orderId, action: "REQUEST_REMAKE", reasonCode: "QUALITY_ISSUE" });
    expect(parseOperationalOrderProductionControlRequest(orderId, { action: "START_REMAKE" }, now)).toEqual({
      orderId,
      action: "START_REMAKE",
    });
  });

  it("rejects unknown fields, authority spoofing and arbitrary lifecycle targets", () => {
    for (const body of [
      { action: "SET_PRIORITY", reasonCode: "WAIT_TIME", actorId: orderId },
      { action: "SET_PRIORITY", reasonCode: "WAIT_TIME", priorityRank: 99 },
      { action: "DEFER_ORDER", reasonCode: "CAPACITY", tenantId: orderId },
      { action: "REQUEST_REMAKE", reasonCode: "QUALITY_ISSUE", targetStatus: "REMAKE" },
      { action: "START_REMAKE", sourceStatus: "READY" },
      { action: "NOT_REAL" },
    ]) {
      expectInvalid(() => parseOperationalOrderProductionControlRequest(orderId, body, now));
    }
  });

  it("enforces reason taxonomies and a bounded future defer horizon", () => {
    expectInvalid(() =>
      parseOperationalOrderProductionControlRequest(
        orderId,
        { action: "SET_PRIORITY", reasonCode: "SUPER_URGENT" },
        now,
      ),
    );
    expectInvalid(() =>
      parseOperationalOrderProductionControlRequest(
        orderId,
        { action: "DEFER_ORDER", reasonCode: "WAITING" },
        now,
      ),
    );
    expectInvalid(() =>
      parseOperationalOrderProductionControlRequest(
        orderId,
        { action: "REQUEST_REMAKE", reasonCode: "REFUND" },
        now,
      ),
    );
    expectInvalid(() =>
      parseOperationalOrderProductionControlRequest(
        orderId,
        { action: "DEFER_ORDER", reasonCode: "CAPACITY", deferredUntil: "2040-04-30T23:59:59Z" },
        now,
      ),
    );
    expectInvalid(() =>
      parseOperationalOrderProductionControlRequest(
        orderId,
        {
          action: "DEFER_ORDER",
          reasonCode: "CAPACITY",
          deferredUntil: new Date(now + (MAX_OPERATIONAL_ORDER_DEFER_HOURS + 1) * 60 * 60 * 1000).toISOString(),
        },
        now,
      ),
    );
  });

  it("maps a safe immutable control result without actor or tenant authority", () => {
    const controlledAt = new Date("2040-05-01T00:01:00Z");
    const result = mapOperationalOrderProductionControlResult("SET_PRIORITY", {
      controlledAt,
      row: {
        id: orderId,
        orderNumber: "P04-R05-1",
        status: "ACCEPTED",
        customerStatus: "CONFIRMED",
        priorityCode: "URGENT",
        priorityReason: "WAIT_TIME",
        prioritizedAt: controlledAt,
        deferReason: null,
        deferredAt: null,
        deferredUntil: null,
        remakeCount: 0,
        lastRemakeReason: null,
        remakeRequestedAt: null,
      },
    });

    expect(result).toMatchObject({
      orderId,
      action: "SET_PRIORITY",
      status: "ACCEPTED",
      customerStatus: "CONFIRMED",
      priority: "URGENT",
      priorityReason: "WAIT_TIME",
      deferred: false,
      remakeCount: 0,
    });
    expect(result).not.toHaveProperty("actorId");
    expect(result).not.toHaveProperty("tenantId");
    expect(result).not.toHaveProperty("branchId");
    expect(Object.isFrozen(result)).toBe(true);
  });
});
