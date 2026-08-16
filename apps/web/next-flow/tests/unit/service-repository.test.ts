import { describe, expect, it } from "vitest";

import { createDemoState } from "@/data/demo";
import {
  acknowledgeService,
  requestService,
  resolveService,
} from "@/services/repositories/service-repository";
import { submitOrder } from "@/services/repositories/order-repository";

const referenceDate = new Date("2026-08-10T04:30:00.000Z");

const withBillableOrder = () =>
  submitOrder(createDemoState(referenceDate), {
    tableId: "table-t06",
    submissionKey: "service-billable-order",
    items: [{ menuItemId: "menu-yuzu", quantity: 1 }],
  }).state;

describe("service request repository", () => {
  it("creates an OPEN CALL_STAFF request bound to the table and active session", () => {
    const initial = createDemoState(referenceDate);
    const result = requestService(initial, "table-t06", "CALL_STAFF", "  Need help  ");
    const request = result.state.serviceRequests.find(
      (candidate) => candidate.id === result.value.requestId,
    )!;
    const table = result.state.tables.find((candidate) => candidate.id === "table-t06")!;

    expect(result.value.duplicate).toBe(false);
    expect(request).toMatchObject({
      tableId: "table-t06",
      tableSessionId: table.currentSessionId,
      type: "CALL_STAFF",
      status: "OPEN",
      note: "Need help",
    });
    expect(request.requestedAt).toBeTruthy();
    expect(
      result.state.auditEvents.some(
        (event) => event.action === "SERVICE_REQUESTED" && event.entityId === request.id,
      ),
    ).toBe(true);
  });

  it("deduplicates OPEN and ACKNOWLEDGED requests within the same session", () => {
    const first = requestService(
      createDemoState(referenceDate),
      "table-t06",
      "CALL_STAFF",
    );
    const duplicateOpen = requestService(first.state, "table-t06", "CALL_STAFF");
    const acknowledged = acknowledgeService(first.state, first.value.requestId);
    const duplicateAcknowledged = requestService(
      acknowledged,
      "table-t06",
      "CALL_STAFF",
    );

    expect(duplicateOpen.value).toEqual({
      requestId: first.value.requestId,
      duplicate: true,
    });
    expect(duplicateOpen.state.serviceRequests).toHaveLength(
      first.state.serviceRequests.length,
    );
    expect(duplicateAcknowledged.value).toEqual({
      requestId: first.value.requestId,
      duplicate: true,
    });
    expect(duplicateAcknowledged.state.serviceRequests).toHaveLength(
      acknowledged.serviceRequests.length,
    );
  });

  it("allows different request types and different tables independently", () => {
    const billable = withBillableOrder();
    const call = requestService(billable, "table-t06", "CALL_STAFF");
    const bill = requestService(call.state, "table-t06", "REQUEST_BILL");
    const otherTable = requestService(bill.state, "table-t07", "CALL_STAFF");

    expect(bill.value.duplicate).toBe(false);
    expect(otherTable.value.duplicate).toBe(false);
    expect(
      otherTable.state.serviceRequests.filter(
        (request) => request.tableId === "table-t06",
      ).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("acknowledges and resolves a request with audit events", () => {
    const requested = requestService(
      createDemoState(referenceDate),
      "table-t06",
      "CALL_STAFF",
    );
    const acknowledged = acknowledgeService(requested.state, requested.value.requestId);
    const acknowledgedRequest = acknowledged.serviceRequests.find(
      (candidate) => candidate.id === requested.value.requestId,
    )!;
    const resolved = resolveService(acknowledged, requested.value.requestId);
    const resolvedRequest = resolved.serviceRequests.find(
      (candidate) => candidate.id === requested.value.requestId,
    )!;

    expect(acknowledgedRequest.status).toBe("ACKNOWLEDGED");
    expect(acknowledgedRequest.acknowledgedAt).toBeTruthy();
    expect(resolvedRequest.status).toBe("RESOLVED");
    expect(resolvedRequest.resolvedAt).toBeTruthy();
    expect(
      resolved.auditEvents.some(
        (event) =>
          event.action === "SERVICE_ACKNOWLEDGED" &&
          event.entityId === requested.value.requestId,
      ),
    ).toBe(true);
    expect(
      resolved.auditEvents.some(
        (event) =>
          event.action === "SERVICE_RESOLVED" &&
          event.entityId === requested.value.requestId,
      ),
    ).toBe(true);
  });

  it("rejects invalid acknowledge transitions and permits a new request after resolution", () => {
    const requested = requestService(
      createDemoState(referenceDate),
      "table-t06",
      "CALL_STAFF",
    );
    const resolved = resolveService(requested.state, requested.value.requestId);

    expect(() =>
      acknowledgeService(resolved, requested.value.requestId),
    ).toThrow();

    const next = requestService(resolved, "table-t06", "CALL_STAFF");
    expect(next.value.duplicate).toBe(false);
    expect(next.value.requestId).not.toBe(requested.value.requestId);
  });

  it("requires a billable active session before REQUEST_BILL", () => {
    expect(() =>
      requestService(
        createDemoState(referenceDate),
        "table-t06",
        "REQUEST_BILL",
      ),
    ).toThrow();

    const billable = withBillableOrder();
    const result = requestService(billable, "table-t06", "REQUEST_BILL");
    const request = result.state.serviceRequests.find(
      (candidate) => candidate.id === result.value.requestId,
    )!;
    const session = result.state.tableSessions.find(
      (candidate) => candidate.id === request.tableSessionId,
    )!;

    expect(request.status).toBe("OPEN");
    expect(session.status).toBe("BILL_REQUESTED");
    expect(
      result.state.auditEvents.some(
        (event) => event.action === "BILL_REQUESTED" && event.entityId === request.id,
      ),
    ).toBe(true);
  });
});
