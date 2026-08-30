import { describe, expect, it } from "vitest";

import { OperationalOrderReadError } from "@/modules/order-operations/server/errors";
import type { OperationalOrderQueueRow } from "@/modules/order-operations/server/order-queue-repository";
import {
  decodeOperationalOrderCursor,
  encodeOperationalOrderCursor,
  mapOperationalOrderQueueRow,
  parseOperationalOrderQueueSearchParams,
} from "@/modules/order-operations/server/order-queue-service";

function expectInvalidQuery(callback: () => unknown) {
  try {
    callback();
    throw new Error("Expected invalid query");
  } catch (error) {
    expect(error).toBeInstanceOf(OperationalOrderReadError);
    expect((error as OperationalOrderReadError).code).toBe("ORDER_QUEUE_INVALID_QUERY");
  }
}

describe("P04 operational order queue contracts", () => {
  it("uses bounded incoming defaults without client scope authority", () => {
    const parsed = parseOperationalOrderQueueSearchParams(new URLSearchParams());

    expect(parsed.statuses).toEqual(["PENDING_CONFIRMATION", "CHANGED"]);
    expect(parsed.limit).toBe(24);
    expect(parsed.source).toBeNull();
    expect(parsed.orderingMode).toBeNull();
    expect(parsed.cursor).toBeNull();
    expect(parsed).not.toHaveProperty("tenantId");
    expect(parsed).not.toHaveProperty("branchId");
  });

  it("canonicalizes duplicate status filters and validates source/mode/time", () => {
    const params = new URLSearchParams();
    params.append("status", "CHANGED,PENDING_CONFIRMATION");
    params.append("status", "CHANGED");
    params.set("source", "CUSTOMER_WEB");
    params.set("mode", "DINE_IN");
    params.set("submittedAfter", "2040-01-01T00:00:00Z");
    params.set("submittedBefore", "2040-01-02T00:00:00+00:00");
    params.set("limit", "50");

    const parsed = parseOperationalOrderQueueSearchParams(params);
    expect(parsed.statuses).toEqual(["CHANGED", "PENDING_CONFIRMATION"]);
    expect(parsed.source).toBe("CUSTOMER_WEB");
    expect(parsed.orderingMode).toBe("DINE_IN");
    expect(parsed.submittedAfter).toBe("2040-01-01T00:00:00.000Z");
    expect(parsed.submittedBefore).toBe("2040-01-02T00:00:00.000Z");
    expect(parsed.limit).toBe(50);
  });

  it("rejects unknown keys, enums, invalid limits and reversed time ranges", () => {
    expectInvalidQuery(() =>
      parseOperationalOrderQueueSearchParams(new URLSearchParams("branchId=forged")),
    );
    expectInvalidQuery(() =>
      parseOperationalOrderQueueSearchParams(new URLSearchParams("status=NOT_REAL")),
    );
    expectInvalidQuery(() =>
      parseOperationalOrderQueueSearchParams(new URLSearchParams("source=POS")),
    );
    expectInvalidQuery(() =>
      parseOperationalOrderQueueSearchParams(new URLSearchParams("mode=TAKEAWAY")),
    );
    expectInvalidQuery(() =>
      parseOperationalOrderQueueSearchParams(new URLSearchParams("limit=51")),
    );
    expectInvalidQuery(() =>
      parseOperationalOrderQueueSearchParams(
        new URLSearchParams(
          "submittedAfter=2040-01-02T00%3A00%3A00Z&submittedBefore=2040-01-01T00%3A00%3A00Z",
        ),
      ),
    );
  });

  it("encodes rank dimensions in cursor v2 without tenant or branch authority", () => {
    const encoded = encodeOperationalOrderCursor({
      v: 2,
      deferRank: 0,
      priorityRank: 0,
      submittedAt: "2040-01-01T00:00:00.000Z",
      id: "10000000-0000-4000-8000-000000000001",
    });
    const decodedPayload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));

    expect(decodedPayload).toEqual({
      v: 2,
      deferRank: 0,
      priorityRank: 0,
      submittedAt: "2040-01-01T00:00:00.000Z",
      id: "10000000-0000-4000-8000-000000000001",
    });
    expect(decodedPayload).not.toHaveProperty("tenantId");
    expect(decodedPayload).not.toHaveProperty("branchId");
    expect(decodeOperationalOrderCursor(encoded)).toEqual(decodedPayload);
  });

  it("rejects malformed, old-version or authority-bearing cursors", () => {
    expectInvalidQuery(() => decodeOperationalOrderCursor("not-json"));
    for (const payload of [
      {
        v: 1,
        submittedAt: "2040-01-01T00:00:00.000Z",
        id: "10000000-0000-4000-8000-000000000001",
      },
      {
        v: 2,
        deferRank: 0,
        priorityRank: 1,
        submittedAt: "2040-01-01T00:00:00.000Z",
        id: "10000000-0000-4000-8000-000000000001",
        branchId: "00000000-0000-0000-0000-0000000000ac",
      },
    ]) {
      expectInvalidQuery(() =>
        decodeOperationalOrderCursor(Buffer.from(JSON.stringify(payload)).toString("base64url")),
      );
    }
  });

  it("maps production control metadata without exposing customer or staff authority", () => {
    const row: OperationalOrderQueueRow = {
      id: "10000000-0000-4000-8000-000000000001",
      orderNumber: "A1-2040-001",
      status: "PENDING_CONFIRMATION",
      customerStatus: "SENT",
      customerCapabilityId: "70000000-0000-4000-8000-000000000001",
      tableId: "00000000-0000-0000-0000-0000000000a5",
      tableLabel: "Table A1",
      submittedAt: new Date("2040-01-01T00:00:00Z"),
      subtotalMinor: "12500",
      currency: "THB",
      lineCount: 1,
      unitCount: 2,
      customerNote: "private note",
      priorityCode: "URGENT",
      priorityReason: "WAIT_TIME",
      prioritizedAt: new Date("2040-01-01T00:01:00Z"),
      deferReason: null,
      deferredAt: null,
      deferredUntil: null,
      remakeCount: 1,
      lastRemakeReason: "QUALITY_ISSUE",
      remakeRequestedAt: new Date("2040-01-01T00:02:00Z"),
      deferRank: 0,
      priorityRank: 0,
    };

    const mapped = mapOperationalOrderQueueRow(row);
    expect(mapped).toMatchObject({
      id: row.id,
      source: "CUSTOMER_WEB",
      orderingMode: "DINE_IN",
      subtotalMinor: "12500",
      currency: "THB",
      priority: "URGENT",
      priorityReason: "WAIT_TIME",
      deferred: false,
      remakeCount: 1,
      lastRemakeReason: "QUALITY_ISSUE",
    });
    expect(mapped).not.toHaveProperty("customerCapabilityId");
    expect(mapped).not.toHaveProperty("customerNote");
    expect(mapped).not.toHaveProperty("prioritizedByStaff");
  });
});
