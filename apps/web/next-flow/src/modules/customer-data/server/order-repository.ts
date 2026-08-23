import "server-only";

import { randomUUID } from "node:crypto";

import type { DatabaseTransaction } from "@/server/db/types";
import { validateUuid } from "@/server/db/context";

import type { CustomerDatabaseContext } from "./context";
import { CustomerDataError } from "./errors";
import type {
  CustomerDraftOrderAggregate,
  CustomerOrderItemSnapshot,
  CustomerOrderModifierSnapshot,
  PersistDraftOrderInput,
  PersistDraftOrderItemInput,
} from "./persistence-types";

const MAX_ORDER_ITEMS = 100;
const MAX_ITEM_QUANTITY = 99;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function optionalText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function requiredText(value: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
  }
  return normalized;
}

function minor(value: string): bigint {
  try {
    return BigInt(value);
  } catch (error) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION", error);
  }
}

function validateItem(item: PersistDraftOrderItemInput): void {
  if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
  }
  if (!CURRENCY_PATTERN.test(item.currency)) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
  }
  if (minor(item.unitPriceMinor) < BigInt(0)) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
  }
  requiredText(item.menuItemName);
  requiredText(item.preparationStation);
  if (item.menuItemId) validateUuid(item.menuItemId, "menuItemId");

  for (const modifier of item.modifiers) {
    requiredText(modifier.modifierGroupName);
    requiredText(modifier.modifierChoiceName);
    minor(modifier.priceDeltaMinor);
    if (modifier.modifierGroupId) {
      validateUuid(modifier.modifierGroupId, "modifierGroupId");
    }
    if (modifier.modifierChoiceId) {
      validateUuid(modifier.modifierChoiceId, "modifierChoiceId");
    }
  }
}

function calculateLineTotal(item: PersistDraftOrderItemInput): bigint {
  const modifierTotal = item.modifiers.reduce(
    (sum, modifier) => sum + minor(modifier.priceDeltaMinor),
    BigInt(0),
  );
  const total = (minor(item.unitPriceMinor) + modifierTotal) * BigInt(item.quantity);
  if (total < BigInt(0)) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
  }
  return total;
}

export class CustomerOrderRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: CustomerDatabaseContext,
  ) {}

  async persistDraft(input: PersistDraftOrderInput): Promise<CustomerDraftOrderAggregate> {
    if (input.items.length < 1 || input.items.length > MAX_ORDER_ITEMS) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    for (const item of input.items) validateItem(item);

    const currencies = new Set(input.items.map((item) => item.currency));
    if (currencies.size !== 1) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }
    const currency = currencies.values().next().value;
    if (!currency) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    const sourceCartId = input.sourceCartId
      ? validateUuid(input.sourceCartId, "sourceCartId")
      : null;
    if (sourceCartId) {
      const sourceCart = await this.trx
        .selectFrom("foodflow.carts")
        .select("id")
        .where("tenant_id", "=", this.context.tenantId)
        .where("id", "=", sourceCartId)
        .where("status", "=", "DRAFT")
        .executeTakeFirst();
      if (!sourceCart) {
        throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
      }
    }

    const subtotalMinor = input.items.reduce(
      (sum, item) => sum + calculateLineTotal(item),
      BigInt(0),
    );
    const orderId = randomUUID();
    const orderNumber = `DRAFT-${orderId.slice(0, 8).toUpperCase()}`;

    await this.trx
      .insertInto("foodflow.orders")
      .values({
        id: orderId,
        tenant_id: this.context.tenantId,
        restaurant_id: this.context.restaurantId,
        branch_id: this.context.branchId,
        table_id: this.context.tableId,
        table_session_id: this.context.tableSessionId,
        source_cart_id: sourceCartId,
        customer_capability_id: this.context.capabilityId,
        order_number: orderNumber,
        status: "DRAFT",
        customer_status: null,
        subtotal_minor: subtotalMinor.toString(),
        currency,
        customer_note: optionalText(input.customerNote),
        submission_key: null,
        submitted_at: null,
      })
      .execute();

    const itemRows = input.items.map((item) => ({
      input: item,
      id: randomUUID(),
      lineTotalMinor: calculateLineTotal(item).toString(),
    }));

    await this.trx
      .insertInto("foodflow.order_items")
      .values(
        itemRows.map(({ id, input: item, lineTotalMinor }) => ({
          id,
          tenant_id: this.context.tenantId,
          order_id: orderId,
          menu_item_id: item.menuItemId,
          menu_item_name: requiredText(item.menuItemName),
          menu_item_thai_name: optionalText(item.menuItemThaiName),
          quantity: item.quantity,
          unit_price_minor: item.unitPriceMinor,
          line_total_minor: lineTotalMinor,
          special_request: optionalText(item.specialRequest),
          preparation_station: requiredText(item.preparationStation),
        })),
      )
      .execute();

    const modifierRows = itemRows.flatMap(({ id: orderItemId, input: item }) =>
      item.modifiers.map((modifier) => ({
        id: randomUUID(),
        tenant_id: this.context.tenantId,
        order_item_id: orderItemId,
        modifier_group_id: modifier.modifierGroupId,
        modifier_group_name: requiredText(modifier.modifierGroupName),
        modifier_choice_id: modifier.modifierChoiceId,
        modifier_choice_name: requiredText(modifier.modifierChoiceName),
        price_delta_minor: modifier.priceDeltaMinor,
      })),
    );

    if (modifierRows.length) {
      await this.trx
        .insertInto("foodflow.order_item_modifiers")
        .values(modifierRows)
        .execute();
    }

    return this.requireById(orderId);
  }

  async findById(orderId: string): Promise<CustomerDraftOrderAggregate | null> {
    const id = validateUuid(orderId, "orderId");
    const order = await this.trx
      .selectFrom("foodflow.orders as customer_order")
      .select([
        "customer_order.id",
        "customer_order.source_cart_id as sourceCartId",
        "customer_order.order_number as orderNumber",
        "customer_order.status",
        "customer_order.subtotal_minor as subtotalMinor",
        "customer_order.currency",
        "customer_order.customer_note as customerNote",
        "customer_order.table_id as tableId",
        "customer_order.table_session_id as tableSessionId",
      ])
      .where("customer_order.tenant_id", "=", this.context.tenantId)
      .where("customer_order.id", "=", id)
      .where("customer_order.status", "=", "DRAFT")
      .executeTakeFirst();

    if (!order) return null;

    const itemRows = await this.trx
      .selectFrom("foodflow.order_items as item")
      .select([
        "item.id",
        "item.menu_item_id as menuItemId",
        "item.menu_item_name as menuItemName",
        "item.menu_item_thai_name as menuItemThaiName",
        "item.preparation_station as preparationStation",
        "item.quantity",
        "item.unit_price_minor as unitPriceMinor",
        "item.line_total_minor as lineTotalMinor",
        "item.special_request as specialRequest",
      ])
      .where("item.tenant_id", "=", this.context.tenantId)
      .where("item.order_id", "=", id)
      .orderBy("item.created_at", "asc")
      .orderBy("item.id", "asc")
      .execute();

    const itemIds = itemRows.map((item) => item.id);
    const modifierRows = itemIds.length
      ? await this.trx
          .selectFrom("foodflow.order_item_modifiers as modifier")
          .select([
            "modifier.id",
            "modifier.order_item_id as orderItemId",
            "modifier.modifier_group_id as modifierGroupId",
            "modifier.modifier_choice_id as modifierChoiceId",
            "modifier.modifier_group_name as modifierGroupName",
            "modifier.modifier_choice_name as modifierChoiceName",
            "modifier.price_delta_minor as priceDeltaMinor",
          ])
          .where("modifier.tenant_id", "=", this.context.tenantId)
          .where("modifier.order_item_id", "in", itemIds)
          .orderBy("modifier.created_at", "asc")
          .orderBy("modifier.id", "asc")
          .execute()
      : [];

    const modifiersByItem = new Map<string, CustomerOrderModifierSnapshot[]>();
    for (const modifier of modifierRows) {
      const current = modifiersByItem.get(modifier.orderItemId) ?? [];
      current.push(
        Object.freeze({
          id: modifier.id,
          modifierGroupId: modifier.modifierGroupId,
          modifierChoiceId: modifier.modifierChoiceId,
          modifierGroupName: modifier.modifierGroupName,
          modifierChoiceName: modifier.modifierChoiceName,
          priceDeltaMinor: modifier.priceDeltaMinor,
        }),
      );
      modifiersByItem.set(modifier.orderItemId, current);
    }

    const items: CustomerOrderItemSnapshot[] = itemRows.map((item) =>
      Object.freeze({
        id: item.id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemThaiName: item.menuItemThaiName,
        preparationStation: item.preparationStation,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        lineTotalMinor: item.lineTotalMinor,
        specialRequest: item.specialRequest,
        modifiers: Object.freeze(modifiersByItem.get(item.id) ?? []),
      }),
    );

    return Object.freeze({
      id: order.id,
      sourceCartId: order.sourceCartId,
      orderNumber: order.orderNumber,
      status: "DRAFT",
      subtotalMinor: order.subtotalMinor,
      currency: order.currency,
      customerNote: order.customerNote,
      tableId: order.tableId,
      tableSessionId: order.tableSessionId,
      items: Object.freeze(items),
    });
  }

  async requireById(orderId: string): Promise<CustomerDraftOrderAggregate> {
    const order = await this.findById(orderId);
    if (!order) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }
    return order;
  }
}
