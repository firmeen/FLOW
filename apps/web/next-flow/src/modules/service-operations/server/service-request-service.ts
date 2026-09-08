import "server-only";

import { sql } from "kysely";

import { getCurrentCustomerContext } from "@/modules/customer-capability/server/current-context";
import { withCustomerDataTransaction } from "@/modules/customer-data/server";
import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import type { DatabaseTransaction } from "@/server/db/types";

import type {
  FloorSnapshot,
  FloorTableView,
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestType,
  ServiceRequestView,
} from "../types";
import { ServiceOperationError } from "./errors";

const ACTIVE_SERVICE_STATUSES = ["OPEN", "ACKNOWLEDGED"] as const;
const ACTIVE_SESSION_STATUSES = ["ACTIVE", "BILL_REQUESTED", "PAYMENT_PENDING"] as const;
const CUSTOMER_REQUEST_TYPES = new Set<ServiceRequestType>(["CALL_STAFF", "REQUEST_BILL"]);
const POSTGRES_UNIQUE_VIOLATION = "23505";
const POSTGRES_LOCK_NOT_AVAILABLE = "55P03";

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function postgresErrorCode(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 6; depth += 1) {
    if (!current || typeof current !== "object") return null;
    const candidate = current as { readonly code?: unknown; readonly cause?: unknown };
    if (typeof candidate.code === "string") return candidate.code;
    current = candidate.cause;
  }
  return null;
}

function normalizeCustomerType(value: unknown): ServiceRequestType {
  if (typeof value !== "string" || !CUSTOMER_REQUEST_TYPES.has(value as ServiceRequestType)) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  }
  return value as ServiceRequestType;
}

function normalizeNote(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  const note = value.trim();
  if (!note || note.length > 240) throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  return note;
}

async function requireCustomerContext() {
  const resolution = await getCurrentCustomerContext();
  switch (resolution.status) {
    case "resolved":
      return resolution.context;
    case "missing":
      throw new ServiceOperationError("SERVICE_REQUEST_CONTEXT_REQUIRED");
    case "invalid":
    case "expired":
    case "revoked":
      throw new ServiceOperationError("SERVICE_REQUEST_CONTEXT_REVOKED");
    case "unavailable":
      throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE");
  }
}

function mapRequest(row: {
  id: string;
  type: string;
  status: string;
  priority: string;
  note: string | null;
  tableId: string;
  tableLabel: string;
  tableSessionId: string;
  requestedAt: Date | string;
  acknowledgedAt: Date | string | null;
  resolvedAt: Date | string | null;
}): ServiceRequestView {
  return Object.freeze({
    id: row.id,
    type: row.type as ServiceRequestType,
    status: row.status as ServiceRequestStatus,
    priority: row.priority as ServiceRequestPriority,
    note: row.note,
    tableId: row.tableId,
    tableLabel: row.tableLabel,
    tableSessionId: row.tableSessionId,
    requestedAt: iso(row.requestedAt) ?? new Date(0).toISOString(),
    acknowledgedAt: iso(row.acknowledgedAt),
    resolvedAt: iso(row.resolvedAt),
  });
}

async function selectCustomerRequest(
  trx: DatabaseTransaction,
  requestId: string,
): Promise<ServiceRequestView | null> {
  const row = await trx
    .selectFrom("foodflow.service_requests as request")
    .innerJoin("foodflow.restaurant_tables as table", (join) =>
      join
        .onRef("table.tenant_id", "=", "request.tenant_id")
        .onRef("table.id", "=", "request.table_id"),
    )
    .select([
      "request.id as id",
      "request.type as type",
      "request.status as status",
      "request.priority as priority",
      "request.note as note",
      "request.table_id as tableId",
      "table.label as tableLabel",
      "request.table_session_id as tableSessionId",
      "request.requested_at as requestedAt",
      "request.acknowledged_at as acknowledgedAt",
      "request.resolved_at as resolvedAt",
    ])
    .where("request.id", "=", requestId)
    .executeTakeFirst();
  return row ? mapRequest(row) : null;
}

export async function listCurrentCustomerServiceRequests(): Promise<readonly ServiceRequestView[]> {
  const customer = await requireCustomerContext();
  return withCustomerDataTransaction(customer, async ({ trx }) => {
    const rows = await trx
      .selectFrom("foodflow.service_requests as request")
      .innerJoin("foodflow.restaurant_tables as table", (join) =>
        join
          .onRef("table.tenant_id", "=", "request.tenant_id")
          .onRef("table.id", "=", "request.table_id"),
      )
      .select([
        "request.id as id",
        "request.type as type",
        "request.status as status",
        "request.priority as priority",
        "request.note as note",
        "request.table_id as tableId",
        "table.label as tableLabel",
        "request.table_session_id as tableSessionId",
        "request.requested_at as requestedAt",
        "request.acknowledged_at as acknowledgedAt",
        "request.resolved_at as resolvedAt",
      ])
      .orderBy("request.requested_at", "desc")
      .limit(20)
      .execute();
    return Object.freeze(rows.map(mapRequest));
  });
}

export async function createCurrentCustomerServiceRequest(input: {
  readonly type: unknown;
  readonly note?: unknown;
}): Promise<ServiceRequestView> {
  const customer = await requireCustomerContext();
  if (!customer.tableSessionId) throw new ServiceOperationError("SERVICE_REQUEST_SESSION_REQUIRED");
  const type = normalizeCustomerType(input.type);
  const note = normalizeNote(input.note);

  return withCustomerDataTransaction(customer, async ({ trx, context }) => {
    const tableSessionId = context.tableSessionId;
    if (!tableSessionId) throw new ServiceOperationError("SERVICE_REQUEST_SESSION_REQUIRED");

    const session = await trx
      .selectFrom("foodflow.table_sessions")
      .select(["id", "status"])
      .where("id", "=", tableSessionId)
      .where("tenant_id", "=", context.tenantId)
      .where("branch_id", "=", context.branchId)
      .where("table_id", "=", context.tableId)
      .executeTakeFirst();
    if (!session || !ACTIVE_SESSION_STATUSES.includes(session.status as (typeof ACTIVE_SESSION_STATUSES)[number])) {
      throw new ServiceOperationError("SERVICE_REQUEST_SESSION_REQUIRED");
    }

    const existing = await trx
      .selectFrom("foodflow.service_requests")
      .select("id")
      .where("tenant_id", "=", context.tenantId)
      .where("branch_id", "=", context.branchId)
      .where("table_id", "=", context.tableId)
      .where("table_session_id", "=", tableSessionId)
      .where("type", "=", type)
      .where("status", "in", ACTIVE_SERVICE_STATUSES)
      .orderBy("requested_at", "desc")
      .executeTakeFirst();
    if (existing) {
      const current = await selectCustomerRequest(trx, existing.id);
      if (current) return current;
    }

    let id: string | null = null;
    try {
      const inserted = await trx
        .insertInto("foodflow.service_requests")
        .values({
          tenant_id: context.tenantId,
          branch_id: context.branchId,
          table_id: context.tableId,
          table_session_id: tableSessionId,
          type,
          status: "OPEN",
          priority: "NORMAL",
          note,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      id = inserted.id;
    } catch (error) {
      if (postgresErrorCode(error) !== POSTGRES_UNIQUE_VIOLATION) throw error;
      const raced = await trx
        .selectFrom("foodflow.service_requests")
        .select("id")
        .where("tenant_id", "=", context.tenantId)
        .where("table_session_id", "=", tableSessionId)
        .where("type", "=", type)
        .where("status", "in", ACTIVE_SERVICE_STATUSES)
        .executeTakeFirst();
      id = raced?.id ?? null;
    }

    if (!id) throw new ServiceOperationError("SERVICE_REQUEST_CONFLICT");
    const created = await selectCustomerRequest(trx, id);
    if (!created) throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE");
    return created;
  });
}

export async function listBranchServiceRequests(): Promise<readonly ServiceRequestView[]> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.serviceView,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new ServiceOperationError("SERVICE_REQUEST_FORBIDDEN");
        const rows = await trx
          .selectFrom("foodflow.service_requests as request")
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join
              .onRef("table.tenant_id", "=", "request.tenant_id")
              .onRef("table.id", "=", "request.table_id"),
          )
          .select([
            "request.id as id",
            "request.type as type",
            "request.status as status",
            "request.priority as priority",
            "request.note as note",
            "request.table_id as tableId",
            "table.label as tableLabel",
            "request.table_session_id as tableSessionId",
            "request.requested_at as requestedAt",
            "request.acknowledged_at as acknowledgedAt",
            "request.resolved_at as resolvedAt",
          ])
          .where("request.tenant_id", "=", context.tenantId)
          .where("request.branch_id", "=", context.branchId)
          .where("request.status", "in", ACTIVE_SERVICE_STATUSES)
          .orderBy("request.priority", "desc")
          .orderBy("request.requested_at", "asc")
          .limit(100)
          .execute();
        return Object.freeze(rows.map(mapRequest));
      },
    );
  } catch (error) {
    if (error instanceof ServiceOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new ServiceOperationError("SERVICE_REQUEST_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
    throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
  }
}

export async function transitionBranchServiceRequest(
  requestId: string,
  action: "ACKNOWLEDGE" | "RESOLVE",
): Promise<ServiceRequestView> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
  }

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.serviceManage,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new ServiceOperationError("SERVICE_REQUEST_FORBIDDEN");
        let locked: { id: string; status: string } | undefined;
        try {
          const result = await sql<{ id: string; status: string }>`
            select id, status
            from foodflow.service_requests
            where tenant_id = ${context.tenantId}::uuid
              and branch_id = ${context.branchId}::uuid
              and id = ${requestId}::uuid
            for update nowait
          `.execute(trx);
          locked = result.rows[0];
        } catch (error) {
          if (postgresErrorCode(error) === POSTGRES_LOCK_NOT_AVAILABLE) {
            throw new ServiceOperationError("SERVICE_REQUEST_CONFLICT", error);
          }
          throw error;
        }
        if (!locked) throw new ServiceOperationError("SERVICE_REQUEST_NOT_FOUND");

        const now = new Date();
        if (action === "ACKNOWLEDGE") {
          if (locked.status !== "OPEN") throw new ServiceOperationError("SERVICE_REQUEST_CONFLICT");
          await trx
            .updateTable("foodflow.service_requests")
            .set({ status: "ACKNOWLEDGED", acknowledged_at: now, acknowledged_by: context.actorId })
            .where("id", "=", requestId)
            .where("status", "=", "OPEN")
            .executeTakeFirstOrThrow();
        } else {
          if (!ACTIVE_SERVICE_STATUSES.includes(locked.status as (typeof ACTIVE_SERVICE_STATUSES)[number])) {
            throw new ServiceOperationError("SERVICE_REQUEST_CONFLICT");
          }
          await trx
            .updateTable("foodflow.service_requests")
            .set({ status: "RESOLVED", resolved_at: now, resolved_by: context.actorId })
            .where("id", "=", requestId)
            .where("status", "in", ACTIVE_SERVICE_STATUSES)
            .executeTakeFirstOrThrow();
        }

        const row = await trx
          .selectFrom("foodflow.service_requests as request")
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join
              .onRef("table.tenant_id", "=", "request.tenant_id")
              .onRef("table.id", "=", "request.table_id"),
          )
          .select([
            "request.id as id",
            "request.type as type",
            "request.status as status",
            "request.priority as priority",
            "request.note as note",
            "request.table_id as tableId",
            "table.label as tableLabel",
            "request.table_session_id as tableSessionId",
            "request.requested_at as requestedAt",
            "request.acknowledged_at as acknowledgedAt",
            "request.resolved_at as resolvedAt",
          ])
          .where("request.id", "=", requestId)
          .executeTakeFirstOrThrow();
        return mapRequest(row);
      },
    );
  } catch (error) {
    if (error instanceof ServiceOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new ServiceOperationError("SERVICE_REQUEST_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
    throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
  }
}

export async function loadBranchFloorSnapshot(): Promise<FloorSnapshot> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.serviceView,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new ServiceOperationError("SERVICE_REQUEST_FORBIDDEN");
        const tables = await trx
          .selectFrom("foodflow.restaurant_tables")
          .select(["id", "code", "label", "seats", "active"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .orderBy("display_order", "asc")
          .orderBy("code", "asc")
          .execute();

        const sessions = await trx
          .selectFrom("foodflow.table_sessions")
          .select(["id", "table_id as tableId", "session_number as sessionNumber", "status", "guest_count as guestCount", "opened_at as openedAt"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("status", "in", ACTIVE_SESSION_STATUSES)
          .execute();

        const requests = await trx
          .selectFrom("foodflow.service_requests")
          .select(["table_id as tableId"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("status", "in", ACTIVE_SERVICE_STATUSES)
          .execute();

        const orders = await trx
          .selectFrom("foodflow.orders")
          .select(["table_id as tableId", "status"])
          .where("tenant_id", "=", context.tenantId)
          .where("branch_id", "=", context.branchId)
          .where("status", "not in", ["DRAFT", "REJECTED", "CANCELLED", "CLOSED", "VOIDED"])
          .execute();

        const sessionByTable = new Map(sessions.map((session) => [session.tableId, session]));
        const serviceCount = new Map<string, number>();
        for (const request of requests) serviceCount.set(request.tableId, (serviceCount.get(request.tableId) ?? 0) + 1);
        const orderCount = new Map<string, number>();
        const readyCount = new Map<string, number>();
        for (const order of orders) {
          orderCount.set(order.tableId, (orderCount.get(order.tableId) ?? 0) + 1);
          if (order.status === "READY") readyCount.set(order.tableId, (readyCount.get(order.tableId) ?? 0) + 1);
        }

        const result: FloorTableView[] = tables.map((table) => {
          const session = sessionByTable.get(table.id);
          return Object.freeze({
            id: table.id,
            code: table.code,
            label: table.label,
            seats: table.seats,
            active: table.active,
            session: session
              ? Object.freeze({
                  id: session.id,
                  sessionNumber: session.sessionNumber,
                  status: session.status,
                  guestCount: session.guestCount,
                  openedAt: iso(session.openedAt) ?? new Date(0).toISOString(),
                })
              : null,
            openServiceCount: serviceCount.get(table.id) ?? 0,
            openOrderCount: orderCount.get(table.id) ?? 0,
            readyOrderCount: readyCount.get(table.id) ?? 0,
          });
        });

        return Object.freeze({ tables: Object.freeze(result), generatedAt: new Date().toISOString() });
      },
    );
  } catch (error) {
    if (error instanceof ServiceOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new ServiceOperationError("SERVICE_REQUEST_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
    throw new ServiceOperationError("SERVICE_REQUEST_UNAVAILABLE", error);
  }
}
