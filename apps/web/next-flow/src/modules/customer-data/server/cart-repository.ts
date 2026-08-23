import "server-only";

import type { DatabaseTransaction } from "@/server/db/types";
import { validateUuid } from "@/server/db/context";

import type { CustomerDatabaseContext } from "./context";
import { CustomerDataError } from "./errors";
import type {
  AddCustomerCartItemInput,
  CustomerCartAggregate,
  CustomerCartItemSnapshot,
  CustomerCartModifierSnapshot,
  CustomerCartStatus,
} from "./persistence-types";

const MAX_CART_ITEM_QUANTITY = 99;
const MAX_CART_MODIFIER_CHOICES = 32;

function requirePositiveQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_ITEM_QUANTITY) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
  }
  return quantity;
}

function optionalText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asMinor(value: string): bigint {
  try {
    return BigInt(value);
  } catch (error) {
    throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION", error);
  }
}

export class CustomerCartRepository {
  constructor(
    private readonly trx: DatabaseTransaction,
    private readonly context: CustomerDatabaseContext,
  ) {}

  async createActive(): Promise<CustomerCartAggregate> {
    const row = await this.trx
      .insertInto("foodflow.carts")
      .values({
        tenant_id: this.context.tenantId,
        branch_id: this.context.branchId,
        table_id: this.context.tableId,
        table_session_id: this.context.tableSessionId,
        customer_capability_id: this.context.capabilityId,
        customer_capability_digest: null,
        status: "DRAFT",
      })
      .returning("id")
      .executeTakeFirst();

    if (!row) {
      throw new CustomerDataError("CUSTOMER_DATA_UNAVAILABLE");
    }

    return this.requireById(row.id);
  }

  async findActive(): Promise<CustomerCartAggregate | null> {
    const row = await this.trx
      .selectFrom("foodflow.carts as cart")
      .select("cart.id")
      .where("cart.tenant_id", "=", this.context.tenantId)
      .where("cart.status", "=", "DRAFT")
      .orderBy("cart.updated_at", "desc")
      .orderBy("cart.id", "asc")
      .executeTakeFirst();

    return row ? this.requireById(row.id) : null;
  }

  async findById(cartId: string): Promise<CustomerCartAggregate | null> {
    const id = validateUuid(cartId, "cartId");
    const cart = await this.trx
      .selectFrom("foodflow.carts as cart")
      .select([
        "cart.id",
        "cart.status",
        "cart.table_id as tableId",
        "cart.table_session_id as tableSessionId",
      ])
      .where("cart.tenant_id", "=", this.context.tenantId)
      .where("cart.id", "=", id)
      .executeTakeFirst();

    if (!cart) return null;

    const itemRows = await this.trx
      .selectFrom("foodflow.cart_items as cart_item")
      .innerJoin("foodflow.menu_items as menu_item", (join) =>
        join
          .onRef("menu_item.tenant_id", "=", "cart_item.tenant_id")
          .onRef("menu_item.id", "=", "cart_item.menu_item_id"),
      )
      .select([
        "cart_item.id",
        "cart_item.menu_item_id as menuItemId",
        "menu_item.name as menuItemName",
        "menu_item.thai_name as menuItemThaiName",
        "menu_item.preparation_station as preparationStation",
        "cart_item.quantity",
        "cart_item.unit_price_minor as unitPriceMinor",
        "cart_item.currency",
        "cart_item.special_request as specialRequest",
      ])
      .where("cart_item.tenant_id", "=", this.context.tenantId)
      .where("cart_item.cart_id", "=", id)
      .orderBy("cart_item.created_at", "asc")
      .orderBy("cart_item.id", "asc")
      .execute();

    const itemIds = itemRows.map((item) => item.id);
    const modifierRows = itemIds.length
      ? await this.trx
          .selectFrom("foodflow.cart_item_modifiers as modifier")
          .select([
            "modifier.id",
            "modifier.cart_item_id as cartItemId",
            "modifier.modifier_group_id as modifierGroupId",
            "modifier.modifier_choice_id as modifierChoiceId",
            "modifier.modifier_group_name as modifierGroupName",
            "modifier.modifier_choice_name as modifierChoiceName",
            "modifier.price_delta_minor as priceDeltaMinor",
          ])
          .where("modifier.tenant_id", "=", this.context.tenantId)
          .where("modifier.cart_item_id", "in", itemIds)
          .orderBy("modifier.created_at", "asc")
          .orderBy("modifier.id", "asc")
          .execute()
      : [];

    const modifiersByItem = new Map<string, CustomerCartModifierSnapshot[]>();
    for (const modifier of modifierRows) {
      const current = modifiersByItem.get(modifier.cartItemId) ?? [];
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
      modifiersByItem.set(modifier.cartItemId, current);
    }

    const currencies = new Set(itemRows.map((item) => item.currency));
    if (currencies.size > 1) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    let subtotalMinor = BigInt(0);
    const items: CustomerCartItemSnapshot[] = itemRows.map((item) => {
      const modifiers = modifiersByItem.get(item.id) ?? [];
      const modifierTotal = modifiers.reduce(
        (sum, modifier) => sum + asMinor(modifier.priceDeltaMinor),
        BigInt(0),
      );
      const lineTotal =
        (asMinor(item.unitPriceMinor) + modifierTotal) * BigInt(item.quantity);
      if (lineTotal < BigInt(0)) {
        throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
      }
      subtotalMinor += lineTotal;

      return Object.freeze({
        id: item.id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemThaiName: item.menuItemThaiName,
        preparationStation: item.preparationStation,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        currency: item.currency,
        specialRequest: item.specialRequest,
        modifiers: Object.freeze(modifiers),
        lineTotalMinor: lineTotal.toString(),
      });
    });

    return Object.freeze({
      id: cart.id,
      status: cart.status as CustomerCartStatus,
      tableId: cart.tableId,
      tableSessionId: cart.tableSessionId,
      items: Object.freeze(items),
      subtotalMinor: subtotalMinor.toString(),
      currency: currencies.values().next().value ?? null,
    });
  }

  async requireById(cartId: string): Promise<CustomerCartAggregate> {
    const cart = await this.findById(cartId);
    if (!cart) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }
    return cart;
  }

  async lockDraft(cartId: string): Promise<CustomerCartAggregate> {
    const id = validateUuid(cartId, "cartId");
    const locked = await this.trx
      .selectFrom("foodflow.carts as cart")
      .select("cart.id")
      .where("cart.tenant_id", "=", this.context.tenantId)
      .where("cart.id", "=", id)
      .where("cart.status", "=", "DRAFT")
      .forUpdate()
      .executeTakeFirst();

    if (!locked) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }

    return this.requireById(locked.id);
  }

  async addItem(
    cartId: string,
    input: AddCustomerCartItemInput,
  ): Promise<CustomerCartAggregate> {
    const id = validateUuid(cartId, "cartId");
    const menuItemId = validateUuid(input.menuItemId, "menuItemId");
    const quantity = requirePositiveQuantity(input.quantity);
    await this.lockDraft(id);

    const menuItem = await this.trx
      .selectFrom("foodflow.menu_items as menu_item")
      .select([
        "menu_item.id",
        "menu_item.base_price_minor as unitPriceMinor",
        "menu_item.currency",
      ])
      .where("menu_item.tenant_id", "=", this.context.tenantId)
      .where("menu_item.restaurant_id", "=", this.context.restaurantId)
      .where("menu_item.id", "=", menuItemId)
      .where("menu_item.status", "=", "ACTIVE")
      .where("menu_item.archived_at", "is", null)
      .executeTakeFirst();

    if (!menuItem) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }

    const modifierChoiceIds = Array.from(
      new Set(
        (input.modifierChoiceIds ?? []).map((choiceId) =>
          validateUuid(choiceId, "modifierChoiceId"),
        ),
      ),
    );
    if (modifierChoiceIds.length > MAX_CART_MODIFIER_CHOICES) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    const modifierRows = modifierChoiceIds.length
      ? await this.trx
          .selectFrom("foodflow.modifier_choices as choice")
          .innerJoin("foodflow.modifier_groups as modifier_group", (join) =>
            join
              .onRef("modifier_group.tenant_id", "=", "choice.tenant_id")
              .onRef("modifier_group.restaurant_id", "=", "choice.restaurant_id")
              .onRef("modifier_group.id", "=", "choice.modifier_group_id"),
          )
          .innerJoin("foodflow.menu_item_modifier_groups as link", (join) =>
            join
              .onRef("link.tenant_id", "=", "choice.tenant_id")
              .onRef("link.restaurant_id", "=", "choice.restaurant_id")
              .onRef("link.modifier_group_id", "=", "choice.modifier_group_id"),
          )
          .select([
            "choice.id as modifierChoiceId",
            "choice.modifier_group_id as modifierGroupId",
            "choice.name as modifierChoiceName",
            "choice.price_delta_minor as priceDeltaMinor",
            "modifier_group.name as modifierGroupName",
          ])
          .where("choice.tenant_id", "=", this.context.tenantId)
          .where("choice.restaurant_id", "=", this.context.restaurantId)
          .where("link.menu_item_id", "=", menuItemId)
          .where("choice.id", "in", modifierChoiceIds)
          .where("choice.active", "=", true)
          .where("modifier_group.active", "=", true)
          .execute()
      : [];

    if (modifierRows.length !== modifierChoiceIds.length) {
      throw new CustomerDataError("CUSTOMER_DATA_INVARIANT_VIOLATION");
    }

    const insertedItem = await this.trx
      .insertInto("foodflow.cart_items")
      .values({
        tenant_id: this.context.tenantId,
        cart_id: id,
        menu_item_id: menuItemId,
        quantity,
        special_request: optionalText(input.specialRequest),
        unit_price_minor: menuItem.unitPriceMinor,
        currency: menuItem.currency,
      })
      .returning("id")
      .executeTakeFirst();

    if (!insertedItem) {
      throw new CustomerDataError("CUSTOMER_DATA_UNAVAILABLE");
    }

    if (modifierRows.length) {
      await this.trx
        .insertInto("foodflow.cart_item_modifiers")
        .values(
          modifierRows.map((modifier) => ({
            tenant_id: this.context.tenantId,
            cart_item_id: insertedItem.id,
            modifier_group_id: modifier.modifierGroupId,
            modifier_choice_id: modifier.modifierChoiceId,
            modifier_group_name: modifier.modifierGroupName,
            modifier_choice_name: modifier.modifierChoiceName,
            price_delta_minor: modifier.priceDeltaMinor,
          })),
        )
        .execute();
    }

    return this.requireById(id);
  }

  async updateItemQuantity(
    cartId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CustomerCartAggregate> {
    const id = validateUuid(cartId, "cartId");
    const itemId = validateUuid(cartItemId, "cartItemId");
    const validatedQuantity = requirePositiveQuantity(quantity);
    await this.lockDraft(id);

    const updated = await this.trx
      .updateTable("foodflow.cart_items")
      .set({ quantity: validatedQuantity })
      .where("tenant_id", "=", this.context.tenantId)
      .where("cart_id", "=", id)
      .where("id", "=", itemId)
      .returning("id")
      .executeTakeFirst();

    if (!updated) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }
    return this.requireById(id);
  }

  async removeItem(cartId: string, cartItemId: string): Promise<CustomerCartAggregate> {
    const id = validateUuid(cartId, "cartId");
    const itemId = validateUuid(cartItemId, "cartItemId");
    await this.lockDraft(id);

    const removed = await this.trx
      .deleteFrom("foodflow.cart_items")
      .where("tenant_id", "=", this.context.tenantId)
      .where("cart_id", "=", id)
      .where("id", "=", itemId)
      .returning("id")
      .executeTakeFirst();

    if (!removed) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }
    return this.requireById(id);
  }

  async markConverted(cartId: string): Promise<void> {
    await this.transitionDraftCart(cartId, "SUBMITTED");
  }

  async abandon(cartId: string): Promise<void> {
    await this.transitionDraftCart(cartId, "ABANDONED");
  }

  private async transitionDraftCart(
    cartId: string,
    status: Exclude<CustomerCartStatus, "DRAFT">,
  ): Promise<void> {
    const id = validateUuid(cartId, "cartId");
    const updated = await this.trx
      .updateTable("foodflow.carts")
      .set({ status })
      .where("tenant_id", "=", this.context.tenantId)
      .where("id", "=", id)
      .where("status", "=", "DRAFT")
      .returning("id")
      .executeTakeFirst();

    if (!updated) {
      throw new CustomerDataError("CUSTOMER_RESOURCE_NOT_FOUND");
    }
  }
}
