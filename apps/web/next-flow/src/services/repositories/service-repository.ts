import type {
  FoodFlowState,
  ServiceRequest,
  ServiceRequestType,
  TableSession,
} from "@/domain";
import {
  addAudit,
  createEntityId,
  getOrCreateSession,
  getActor,
  now,
  refreshTableStatus,
  requireSession,
  requireTable,
} from "./helpers";
import type { MutationResult, RequestServiceResult } from "./types";

const hasBillableOrders = (state: FoodFlowState, sessionId: string) =>
  state.orders.some(
    (order) =>
      order.tableSessionId === sessionId &&
      !["DRAFT", "REJECTED", "CANCELLED", "VOIDED"].includes(order.status),
  );

export const requestService = (
  initialState: FoodFlowState,
  tableId: string,
  type: ServiceRequestType,
  note?: string,
): MutationResult<RequestServiceResult> => {
  const timestamp = now();
  let stateForRequest = initialState;
  let table = requireTable(stateForRequest, tableId);
  let session: TableSession;

  if (type === "CALL_STAFF") {
    const sessionResult = getOrCreateSession(
      stateForRequest,
      tableId,
      timestamp,
    );
    stateForRequest = sessionResult.state;
    session = sessionResult.session;
    table = requireTable(stateForRequest, tableId);
  } else {
    if (!table.currentSessionId) {
      throw new Error("Requesting a bill requires an active dining session.");
    }
    session = requireSession(stateForRequest, table.currentSessionId);
    if (session.status === "CLOSED") {
      throw new Error("This table session is closed.");
    }
    if (!hasBillableOrders(stateForRequest, session.id)) {
      throw new Error("There are no orders to bill for this table.");
    }
  }

  const duplicate = stateForRequest.serviceRequests.find(
    (request) =>
      request.tableSessionId === session.id &&
      request.type === type &&
      (request.status === "OPEN" || request.status === "ACKNOWLEDGED"),
  );
  if (duplicate) {
    return {
      state: initialState,
      value: { requestId: duplicate.id, duplicate: true },
    };
  }
  const request: ServiceRequest = {
    id: createEntityId("service"),
    branchId: table.branchId,
    tableId,
    tableSessionId: session.id,
    type,
    status: "OPEN",
    note: note?.trim() || undefined,
    priority: type === "REQUEST_BILL" ? "HIGH" : "NORMAL",
    requestedAt: timestamp,
  };
  let state: FoodFlowState = {
    ...stateForRequest,
    serviceRequests: [...stateForRequest.serviceRequests, request],
  };
  if (type === "REQUEST_BILL") {
    state = {
      ...state,
      tableSessions: state.tableSessions.map((candidate) =>
        candidate.id === session.id
          ? { ...candidate, status: "BILL_REQUESTED" }
          : candidate,
      ),
      orders: state.orders.map((order) =>
        order.tableSessionId === session.id && order.status === "SERVED"
          ? { ...order, status: "PAYMENT_PENDING" }
          : order,
      ),
    };
  }
  state = refreshTableStatus(state, tableId);
  state = addAudit(state, {
    fallbackActorId: "customer",
    fallbackActorName: `${table.label} guest`,
    action: type === "REQUEST_BILL" ? "BILL_REQUESTED" : "SERVICE_REQUESTED",
    entityType: "SERVICE_REQUEST",
    entityId: request.id,
    summary:
      type === "REQUEST_BILL"
        ? `${table.label} requested the bill`
        : `${table.label} called staff`,
    timestamp,
  });
  return { state, value: { requestId: request.id, duplicate: false } };
};

export const acknowledgeService = (
  initialState: FoodFlowState,
  requestId: string,
  actorId?: string,
): FoodFlowState => {
  const request = initialState.serviceRequests.find(
    (candidate) => candidate.id === requestId,
  );
  if (!request) throw new Error("Service request was not found.");
  if (request.status === "ACKNOWLEDGED") return initialState;
  if (request.status !== "OPEN") {
    throw new Error("This request is no longer open.");
  }
  const timestamp = now();
  const actor = getActor(initialState, actorId, "staff-floor", "Floor staff");
  const state: FoodFlowState = {
    ...initialState,
    serviceRequests: initialState.serviceRequests.map((candidate) =>
      candidate.id === requestId
        ? {
            ...candidate,
            status: "ACKNOWLEDGED",
            acknowledgedAt: timestamp,
            acknowledgedBy: actor.id,
          }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId: actor.id,
    fallbackActorId: actor.id,
    fallbackActorName: actor.name,
    action: "SERVICE_ACKNOWLEDGED",
    entityType: "SERVICE_REQUEST",
    entityId: request.id,
    summary: `Acknowledged service request for ${requireTable(state, request.tableId).label}`,
    timestamp,
  });
};

export const resolveService = (
  initialState: FoodFlowState,
  requestId: string,
  actorId?: string,
): FoodFlowState => {
  const request = initialState.serviceRequests.find(
    (candidate) => candidate.id === requestId,
  );
  if (!request) throw new Error("Service request was not found.");
  if (request.status === "RESOLVED") return initialState;
  if (request.status === "CANCELLED") {
    throw new Error("This request was cancelled.");
  }
  const timestamp = now();
  const actor = getActor(initialState, actorId, "staff-floor", "Floor staff");
  let state: FoodFlowState = {
    ...initialState,
    serviceRequests: initialState.serviceRequests.map((candidate) =>
      candidate.id === requestId
        ? {
            ...candidate,
            status: "RESOLVED",
            acknowledgedAt: candidate.acknowledgedAt ?? timestamp,
            acknowledgedBy: candidate.acknowledgedBy ?? actor.id,
            resolvedAt: timestamp,
            resolvedBy: actor.id,
          }
        : candidate,
    ),
  };
  state = addAudit(state, {
    actorId: actor.id,
    fallbackActorId: actor.id,
    fallbackActorName: actor.name,
    action: "SERVICE_RESOLVED",
    entityType: "SERVICE_REQUEST",
    entityId: request.id,
    summary: `Resolved service request for ${requireTable(state, request.tableId).label}`,
    timestamp,
  });
  const session = requireSession(state, request.tableSessionId);
  const table = requireTable(state, request.tableId);
  if (
    request.type === "CALL_STAFF" &&
    !hasBillableOrders(state, session.id) &&
    table.currentSessionId === session.id
  ) {
    state = {
      ...state,
      tableSessions: state.tableSessions.map((candidate) =>
        candidate.id === session.id
          ? { ...candidate, status: "CLOSED", closedAt: timestamp }
          : candidate,
      ),
      tables: state.tables.map((candidate) =>
        candidate.id === table.id
          ? {
              ...candidate,
              status: "AVAILABLE",
              currentSessionId: undefined,
            }
          : candidate,
      ),
    };
    state = addAudit(state, {
      actorId: actor.id,
      fallbackActorId: actor.id,
      fallbackActorName: actor.name,
      action: "TABLE_CLOSED",
      entityType: "TABLE_SESSION",
      entityId: session.id,
      summary: `Released ${table.label} after its service-only visit`,
      timestamp,
    });
  }
  return state;
};

export const serviceRequestRepository = {
  requestService,
  acknowledgeService,
  resolveService,
};
