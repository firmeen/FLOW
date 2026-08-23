import "server-only";

import { CustomerCommandError, toCustomerCommandError } from "./errors";
import {
  type CustomerCommandDependencies,
  withCurrentCustomerCommandTransaction,
} from "./runtime";
import type {
  AddCartItemCommandInput,
  AddCartItemCommandResult,
  CreateCartCommandResult,
  RemoveCartItemCommandInput,
  RemoveCartItemCommandResult,
  UpdateCartItemCommandInput,
  UpdateCartItemCommandResult,
} from "./types";
import {
  MAX_SPECIAL_REQUEST_LENGTH,
  normalizeOptionalCommandText,
  requireCommandQuantity,
  requireCommandUuid,
  requireModifierChoiceIds,
} from "./validation";

export async function createCustomerCart(
  dependencies?: CustomerCommandDependencies,
): Promise<CreateCartCommandResult> {
  try {
    return await withCurrentCustomerCommandTransaction(async ({ repositories }) => {
      const existing = await repositories.carts.findActive();
      return existing ?? repositories.carts.createActive();
    }, dependencies);
  } catch (error) {
    throw toCustomerCommandError(error);
  }
}

export async function addCustomerCartItem(
  input: AddCartItemCommandInput,
  dependencies?: CustomerCommandDependencies,
): Promise<AddCartItemCommandResult> {
  const cartId = requireCommandUuid(input.cartId);
  const menuItemId = requireCommandUuid(input.menuItemId);
  const quantity = requireCommandQuantity(input.quantity);
  const modifierChoiceIds = requireModifierChoiceIds(input.modifierChoiceIds);
  const specialRequest = normalizeOptionalCommandText(
    input.specialRequest,
    MAX_SPECIAL_REQUEST_LENGTH,
  );

  try {
    return await withCurrentCustomerCommandTransaction(async ({ repositories }) => {
      const cart = await repositories.carts.requireById(cartId);
      if (cart.status !== "DRAFT") {
        throw new CustomerCommandError("CUSTOMER_COMMAND_CART_NOT_EDITABLE");
      }
      return repositories.carts.addItem(cartId, {
        menuItemId,
        quantity,
        modifierChoiceIds,
        specialRequest,
      });
    }, dependencies);
  } catch (error) {
    throw toCustomerCommandError(error, "CUSTOMER_COMMAND_CART_NOT_EDITABLE");
  }
}

export async function updateCustomerCartItem(
  input: UpdateCartItemCommandInput,
  dependencies?: CustomerCommandDependencies,
): Promise<UpdateCartItemCommandResult> {
  const cartId = requireCommandUuid(input.cartId);
  const cartItemId = requireCommandUuid(input.cartItemId);
  const quantity = requireCommandQuantity(input.quantity);

  try {
    return await withCurrentCustomerCommandTransaction(async ({ repositories }) => {
      const cart = await repositories.carts.requireById(cartId);
      if (cart.status !== "DRAFT") {
        throw new CustomerCommandError("CUSTOMER_COMMAND_CART_NOT_EDITABLE");
      }
      return repositories.carts.updateItemQuantity(cartId, cartItemId, quantity);
    }, dependencies);
  } catch (error) {
    throw toCustomerCommandError(error, "CUSTOMER_COMMAND_CART_NOT_EDITABLE");
  }
}

export async function removeCustomerCartItem(
  input: RemoveCartItemCommandInput,
  dependencies?: CustomerCommandDependencies,
): Promise<RemoveCartItemCommandResult> {
  const cartId = requireCommandUuid(input.cartId);
  const cartItemId = requireCommandUuid(input.cartItemId);

  try {
    return await withCurrentCustomerCommandTransaction(async ({ repositories }) => {
      const cart = await repositories.carts.requireById(cartId);
      if (cart.status !== "DRAFT") {
        throw new CustomerCommandError("CUSTOMER_COMMAND_CART_NOT_EDITABLE");
      }
      return repositories.carts.removeItem(cartId, cartItemId);
    }, dependencies);
  } catch (error) {
    throw toCustomerCommandError(error, "CUSTOMER_COMMAND_CART_NOT_EDITABLE");
  }
}
