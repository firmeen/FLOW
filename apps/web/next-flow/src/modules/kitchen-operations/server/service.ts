import "server-only";

import {
  AuthorizationDeniedError,
  AuthorizationUnavailableError,
} from "@/modules/identity/server/authorize-permission";
import { withAuthorizedCurrentAccessTransaction } from "@/modules/identity/server/authorized-transaction";
import { PERMISSIONS } from "@/modules/identity/server/permissions";
import {
  LIFECYCLE_TRANSITIONS,
} from "@/modules/order-operations/server/order-lifecycle-service";
import { OperationalOrderLifecycleRepository } from "@/modules/order-operations/server/order-lifecycle-repository";
import {
  acquireOperationalOrderMutationLock,
  OperationalOrderMutationBusyError,
} from "@/modules/order-operations/server/order-mutation-lock";

import type {
  DurableKitchenAction,
  DurableKitchenOrder,
  DurableKitchenOrderItem,
  DurableKitchenOrderStatus,
  DurableKitchenQueue,
} from "../types";
import { KitchenOperationError } from "./errors";

const ACTIVE_STATUSES = ["ACCEPTED", "PREPARING", "READY"] as const;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeOrderId(value: string): string {
  const orderId = value.trim();
  if (!UUID_PATTERN.test(orderId)) throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");
  return orderId;
}

export async function listDurableKitchenQueue(): Promise<DurableKitchenQueue> {
  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.kitchenView,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new KitchenOperationError("KITCHEN_FORBIDDEN");

        const rows = await trx
          .selectFrom("foodflow.orders as order")
          .innerJoin("foodflow.restaurant_tables as table", (join) =>
            join
              .onRef("table.tenant_id", "=", "order.tenant_id")
              .onRef("table.id", "=", "order.table_id"),
          )
          .innerJoin("foodflow.order_items as item", (join) =>
            join
              .onRef("item.tenant_id", "=", "order.tenant_id")
              .onRef("item.order_id", "=", "order.id"),
          )
          .select([
            "order.id as orderId",
            "order.order_number as orderNumber",
            "order.status as status",
            "order.priority_code as priority",
            "order.submitted_at as submittedAt",
            "order.preparing_at as preparingAt",
            "order.ready_at as readyAt",
            "table.label as tableLabel",
            "item.id as itemId",
            "item.menu_item_name as itemName",
            "item.menu_item_thai_name as itemThaiName",
            "item.quantity as quantity",
            "item.preparation_station as station",
            "item.special_request as specialRequest",
          ])
          .where("order.tenant_id", "=", context.tenantId)
          .where("order.branch_id", "=", context.branchId)
          .where("order.status", "in", ACTIVE_STATUSES)
          .orderBy("order.priority_code", "desc")
          .orderBy("order.submitted_at", "asc")
          .orderBy("item.created_at", "asc")
          .execute();

        const grouped = new Map<string, {
          orderNumber: string;
          tableLabel: string;
          status: DurableKitchenOrderStatus;
          priority: "NORMAL" | "URGENT";
          submittedAt: string;
          preparingAt: string | null;
          readyAt: string | null;
          items: DurableKitchenOrderItem[];
        }>();
        const stations = new Set<string>();

        for (const row of rows) {
          const submittedAt = iso(row.submittedAt) ?? new Date(0).toISOString();
          const current = grouped.get(row.orderId) ?? {
            orderNumber: row.orderNumber,
            tableLabel: row.tableLabel,
            status: row.status as DurableKitchenOrderStatus,
            priority: row.priority === "URGENT" ? "URGENT" : "NORMAL",
            submittedAt,
            preparingAt: iso(row.preparingAt),
            readyAt: iso(row.readyAt),
            items: [],
          };
          const station = row.station.trim() || "GENERAL";
          stations.add(station);
          current.items.push(Object.freeze({
            id: row.itemId,
            name: row.itemName,
            thaiName: row.itemThaiName,
            quantity: row.quantity,
            station,
            specialRequest: row.specialRequest,
          }));
          grouped.set(row.orderId, current);
        }

        const orders: DurableKitchenOrder[] = Array.from(grouped.entries()).map(([id, order]) => {
          const elapsedAnchor = order.preparingAt ?? order.submittedAt;
          return Object.freeze({
            id,
            orderNumber: order.orderNumber,
            tableLabel: order.tableLabel,
            status: order.status,
            priority: order.priority,
            submittedAt: order.submittedAt,
            preparingAt: order.preparingAt,
            readyAt: order.readyAt,
            elapsedAnchor,
            items: Object.freeze(order.items),
          });
        });

        return Object.freeze({
          generatedAt: new Date().toISOString(),
          orders: Object.freeze(orders),
          stations: Object.freeze(Array.from(stations).sort((a, b) => a.localeCompare(b))),
        });
      },
    );
  } catch (error) {
    if (error instanceof KitchenOperationError) throw error;
    if (error instanceof AuthorizationDeniedError) throw new KitchenOperationError("KITCHEN_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new KitchenOperationError("KITCHEN_UNAVAILABLE", error);
    throw new KitchenOperationError("KITCHEN_UNAVAILABLE", error);
  }
}

export async function transitionDurableKitchenOrder(
  rawOrderId: string,
  action: DurableKitchenAction,
): Promise<DurableKitchenOrderStatus> {
  const orderId = normalizeOrderId(rawOrderId);
  const spec = LIFECYCLE_TRANSITIONS[action];
  if (!spec) throw new KitchenOperationError("KITCHEN_INVALID_REQUEST");

  try {
    return await withAuthorizedCurrentAccessTransaction(
      PERMISSIONS.kitchenManage,
      "branch",
      async (trx, context) => {
        if (!context.branchId) throw new KitchenOperationError("KITCHEN_FORBIDDEN");
        const trustedContext = Object.freeze({
          actorId: context.actorId,
          tenantId: context.tenantId,
          branchId: context.branchId,
        });
        const locked = await acquireOperationalOrderMutationLock(trx, trustedContext, orderId);
        if (!locked) throw new KitchenOperationError("KITCHEN_NOT_FOUND");

        const repository = new OperationalOrderLifecycleRepository(trx, trustedContext);
        const row = await repository.transition(orderId, spec);
        if (!row) throw new KitchenOperationError("KITCHEN_CONFLICT");
        return row.status as DurableKitchenOrderStatus;
      },
    );
  } catch (error) {
    if (error instanceof KitchenOperationError) throw error;
    if (error instanceof OperationalOrderMutationBusyError) {
      throw new KitchenOperationError("KITCHEN_CONFLICT", error);
    }
    if (error instanceof AuthorizationDeniedError) throw new KitchenOperationError("KITCHEN_FORBIDDEN", error);
    if (error instanceof AuthorizationUnavailableError) throw new KitchenOperationError("KITCHEN_UNAVAILABLE", error);
    throw new KitchenOperationError("KITCHEN_UNAVAILABLE", error);
  }
}
