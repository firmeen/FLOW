import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import type { AccessContext } from "@/modules/identity/server/access-context";
import { PERMISSIONS } from "@/modules/identity/server/permissions";

import { OperationalOrderReadError } from "./errors";
import {
  OperationalOrderQueueRepository,
  type OperationalOrderDetailItemRow,
  type OperationalOrderDetailModifierRow,
  type OperationalOrderQueueRow,
} from "./order-queue-repository";
import {
  DEFAULT_OPERATIONAL_ORDER_STATUSES,
  OPERATIONAL_ORDERING_MODES,
  OPERATIONAL_ORDER_SOURCES,
  OPERATIONAL_ORDER_STATUSES,
  type OperationalOrderCursor,
  type OperationalOrderDetail,
  type OperationalOrderItemDetail,
  type OperationalOrderQueueFilter,
  type OperationalOrderQueueItem,
  type OperationalOrderQueuePage,
  type OperationalOrderSource,
  type OperationalOrderStatus,
  type TrustedOperationalOrderContext,
} from "./types";

const DEFAULT_LIMIT = 24;
export const MAX_OPERATIONAL_ORDER_PAGE_SIZE = 50;
const MAX_CURSOR_LENGTH = 512;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const NONNEGATIVE_INTEGER_PATTERN = /^\d+$/;

const STATUS_SET = new Set<string>(OPERATIONAL_ORDER_STATUSES);
const SOURCE_SET = new Set<string>(OPERATIONAL_ORDER_SOURCES);
const MODE_SET = new Set<string>(OPERATIONAL_ORDERING_MODES);
const ALLOWED_QUERY_KEYS = new Set([
  "status",
  "source",
  "mode",
  "submittedAfter",
  "submittedBefore",
  "limit",
  "cursor",
]);

function invalidQuery(cause?: unknown): never {
  throw new OperationalOrderReadError("ORDER_QUEUE_INVALID_QUERY", cause);
}

function scalarParam(params: URLSearchParams, key: string): string | null {
  const values = params.getAll(key);
  if (values.length > 1) invalidQuery();
  const value = values[0]?.trim();
  return value ? value : null;
}

function isIsoTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

function parseStatuses(params: URLSearchParams): readonly OperationalOrderStatus[] {
  const raw = params
    .getAll("status")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (raw.length === 0) return DEFAULT_OPERATIONAL_ORDER_STATUSES;
  if (raw.length > OPERATIONAL_ORDER_STATUSES.length) invalidQuery();

  const unique: OperationalOrderStatus[] = [];
  for (const value of raw) {
    if (!STATUS_SET.has(value)) invalidQuery();
    if (!unique.includes(value as OperationalOrderStatus)) {
      unique.push(value as OperationalOrderStatus);
    }
  }
  return unique;
}

function parseSource(value: string | null): OperationalOrderSource | null {
  if (value === null) return null;
  if (!SOURCE_SET.has(value)) invalidQuery();
  return value as OperationalOrderSource;
}

function parseMode(value: string | null): "DINE_IN" | null {
  if (value === null) return null;
  if (!MODE_SET.has(value)) invalidQuery();
  return value as "DINE_IN";
}

function parseLimit(value: string | null): number {
  if (value === null) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) invalidQuery();
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_OPERATIONAL_ORDER_PAGE_SIZE) {
    invalidQuery();
  }
  return limit;
}

function parseTimestamp(value: string | null): string | null {
  if (value === null) return null;
  if (!isIsoTimestamp(value)) invalidQuery();
  return new Date(value).toISOString();
}

export function encodeOperationalOrderCursor(cursor: OperationalOrderCursor): string {
  if (cursor.v !== 1 || !isIsoTimestamp(cursor.submittedAt) || !UUID_PATTERN.test(cursor.id)) {
    invalidQuery();
  }
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeOperationalOrderCursor(
  value: string | null | undefined,
): OperationalOrderCursor | null {
  if (!value) return null;
  if (value.length > MAX_CURSOR_LENGTH) invalidQuery();

  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
    if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) invalidQuery();
    const candidate = decoded as Record<string, unknown>;
    const keys = Object.keys(candidate).sort();
    if (keys.join(",") !== "id,submittedAt,v") invalidQuery();
    if (
      candidate.v !== 1 ||
      typeof candidate.submittedAt !== "string" ||
      !isIsoTimestamp(candidate.submittedAt) ||
      typeof candidate.id !== "string" ||
      !UUID_PATTERN.test(candidate.id)
    ) {
      invalidQuery();
    }
    return Object.freeze({
      v: 1,
      submittedAt: new Date(candidate.submittedAt).toISOString(),
      id: candidate.id,
    });
  } catch (error) {
    if (error instanceof OperationalOrderReadError) throw error;
    invalidQuery(error);
  }
}

export function parseOperationalOrderQueueSearchParams(
  params: URLSearchParams,
): Required<Pick<OperationalOrderQueueFilter, "statuses" | "limit">> &
  Omit<OperationalOrderQueueFilter, "statuses" | "limit" | "cursor"> & {
    readonly cursor: OperationalOrderCursor | null;
  } {
  for (const key of params.keys()) {
    if (!ALLOWED_QUERY_KEYS.has(key)) invalidQuery();
  }

  const submittedAfter = parseTimestamp(scalarParam(params, "submittedAfter"));
  const submittedBefore = parseTimestamp(scalarParam(params, "submittedBefore"));
  if (
    submittedAfter &&
    submittedBefore &&
    Date.parse(submittedBefore) < Date.parse(submittedAfter)
  ) {
    invalidQuery();
  }

  return Object.freeze({
    statuses: Object.freeze([...parseStatuses(params)]),
    source: parseSource(scalarParam(params, "source")),
    orderingMode: parseMode(scalarParam(params, "mode")),
    submittedAfter,
    submittedBefore,
    limit: parseLimit(scalarParam(params, "limit")),
    cursor: decodeOperationalOrderCursor(scalarParam(params, "cursor")),
  });
}

function trustedContext(context: AccessContext): TrustedOperationalOrderContext {
  if (!context.branchId) {
    throw new OperationalOrderReadError("ORDER_QUEUE_FORBIDDEN");
  }
  return Object.freeze({
    actorId: context.actorId,
    tenantId: context.tenantId,
    branchId: context.branchId,
  });
}

function assertStatus(value: string): OperationalOrderStatus {
  if (!STATUS_SET.has(value)) {
    throw new OperationalOrderReadError("ORDER_QUEUE_INVARIANT_VIOLATION");
  }
  return value as OperationalOrderStatus;
}

function assertIsoDate(value: Date): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new OperationalOrderReadError("ORDER_QUEUE_INVARIANT_VIOLATION");
  }
  return value.toISOString();
}

function assertMinor(value: string): string {
  const normalized = String(value);
  if (!NONNEGATIVE_INTEGER_PATTERN.test(normalized)) {
    throw new OperationalOrderReadError("ORDER_QUEUE_INVARIANT_VIOLATION");
  }
  return normalized;
}

function assertCurrency(value: string): string {
  if (!CURRENCY_PATTERN.test(value)) {
    throw new OperationalOrderReadError("ORDER_QUEUE_INVARIANT_VIOLATION");
  }
  return value;
}

export function mapOperationalOrderQueueRow(
  row: OperationalOrderQueueRow,
): OperationalOrderQueueItem {
  return Object.freeze({
    id: row.id,
    orderNumber: row.orderNumber,
    status: assertStatus(row.status),
    customerStatus: row.customerStatus,
    source: row.customerCapabilityId ? "CUSTOMER_WEB" : "UNKNOWN",
    orderingMode: "DINE_IN",
    tableId: row.tableId,
    tableLabel: row.tableLabel,
    submittedAt: assertIsoDate(row.submittedAt),
    subtotalMinor: assertMinor(row.subtotalMinor),
    currency: assertCurrency(row.currency),
    lineCount: row.lineCount,
    unitCount: row.unitCount,
    hasCustomerNote: Boolean(row.customerNote),
  });
}

function mapItem(
  row: OperationalOrderDetailItemRow,
  modifiers: readonly OperationalOrderDetailModifierRow[],
): OperationalOrderItemDetail {
  return Object.freeze({
    id: row.id,
    menuItemId: row.menuItemId,
    menuItemName: row.menuItemName,
    menuItemThaiName: row.menuItemThaiName,
    quantity: row.quantity,
    unitPriceMinor: assertMinor(row.unitPriceMinor),
    lineTotalMinor: assertMinor(row.lineTotalMinor),
    specialRequest: row.specialRequest,
    preparationStation: row.preparationStation,
    modifiers: Object.freeze(
      modifiers
        .filter((modifier) => modifier.orderItemId === row.id)
        .map((modifier) =>
          Object.freeze({
            id: modifier.id,
            modifierGroupId: modifier.modifierGroupId,
            modifierGroupName: modifier.modifierGroupName,
            modifierChoiceId: modifier.modifierChoiceId,
            modifierChoiceName: modifier.modifierChoiceName,
            priceDeltaMinor: assertMinor(modifier.priceDeltaMinor),
          }),
        ),
    ),
  });
}

function isAuthorizationError(
  error: unknown,
): error is AuthorizationDeniedError | AuthorizationUnavailableError {
  return (
    error instanceof AuthorizationDeniedError ||
    error instanceof AuthorizationUnavailableError
  );
}

export async function listOperationalOrderQueue(
  context: AccessContext,
  filter: ReturnType<typeof parseOperationalOrderQueueSearchParams>,
): Promise<OperationalOrderQueuePage> {
  try {
    return await withAuthorizedAccessTransaction(
      context,
      PERMISSIONS.orderView,
      "branch",
      async (trx, authorizedContext) => {
        const repository = new OperationalOrderQueueRepository(
          trx,
          trustedContext(authorizedContext),
        );
        const rows = await repository.list(filter);
        const incomingCount = await repository.countIncoming();
        const pageRows = rows.slice(0, filter.limit);
        const hasNextPage = rows.length > filter.limit;
        const last = pageRows.at(-1);
        return Object.freeze({
          orders: Object.freeze(pageRows.map(mapOperationalOrderQueueRow)),
          nextCursor:
            hasNextPage && last
              ? encodeOperationalOrderCursor({
                  v: 1,
                  submittedAt: assertIsoDate(last.submittedAt),
                  id: last.id,
                })
              : null,
          incomingCount,
        });
      },
    );
  } catch (error) {
    if (isAuthorizationError(error) || error instanceof OperationalOrderReadError) throw error;
    throw new OperationalOrderReadError("ORDER_QUEUE_UNAVAILABLE", error);
  }
}

export async function getOperationalOrderDetail(
  context: AccessContext,
  orderId: string,
): Promise<OperationalOrderDetail> {
  if (!UUID_PATTERN.test(orderId)) invalidQuery();

  try {
    return await withAuthorizedAccessTransaction(
      context,
      PERMISSIONS.orderView,
      "branch",
      async (trx, authorizedContext) => {
        const repository = new OperationalOrderQueueRepository(
          trx,
          trustedContext(authorizedContext),
        );
        const header = await repository.findDetailHeader(orderId);
        if (!header) throw new OperationalOrderReadError("ORDER_QUEUE_NOT_FOUND");
        const items = await repository.listDetailItems(orderId);
        const modifiers = await repository.listDetailModifiers(items.map((item) => item.id));
        const summary = mapOperationalOrderQueueRow(header);
        return Object.freeze({
          ...summary,
          customerNote: header.customerNote,
          items: Object.freeze(items.map((item) => mapItem(item, modifiers))),
        });
      },
    );
  } catch (error) {
    if (isAuthorizationError(error) || error instanceof OperationalOrderReadError) throw error;
    throw new OperationalOrderReadError("ORDER_QUEUE_UNAVAILABLE", error);
  }
}
