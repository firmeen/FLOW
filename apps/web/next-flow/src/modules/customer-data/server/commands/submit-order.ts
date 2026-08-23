import "server-only";

import type { PersistDraftOrderInput } from "../persistence-types";
import { CustomerCommandError, toCustomerCommandError } from "./errors";
import {
  type CustomerCommandDependencies,
  withCurrentCustomerCommandTransaction,
} from "./runtime";
import type {
  SubmitOrderCommandInput,
  SubmitOrderCommandResult,
} from "./types";
import {
  MAX_CUSTOMER_NOTE_LENGTH,
  normalizeOptionalCommandText,
  requireCommandUuid,
} from "./validation";

export async function submitCustomerOrder(
  input: SubmitOrderCommandInput,
  dependencies?: CustomerCommandDependencies,
): Promise<SubmitOrderCommandResult> {
  const cartId = requireCommandUuid(input.cartId);
  const customerNote = normalizeOptionalCommandText(
    input.customerNote,
    MAX_CUSTOMER_NOTE_LENGTH,
  );

  try {
    return await withCurrentCustomerCommandTransaction(async ({ repositories }) => {
      const existing = await repositories.carts.requireById(cartId);
      if (existing.status !== "DRAFT") {
        throw new CustomerCommandError("CUSTOMER_COMMAND_CART_NOT_EDITABLE");
      }

      // Lock the parent before reading the submission snapshot. Cart mutations use
      // the same parent lock, so submit and edit cannot produce a mixed snapshot.
      const cart = await repositories.carts.lockDraft(cartId);
      if (cart.items.length === 0) {
        throw new CustomerCommandError("CUSTOMER_COMMAND_CART_EMPTY");
      }
      if (!cart.currency) {
        throw new CustomerCommandError("CUSTOMER_COMMAND_CONFLICT");
      }

      const available = await repositories.menuAvailability.areItemsCurrentlyAvailable(
        cart.items.map((item) => item.menuItemId),
      );
      if (!available) {
        throw new CustomerCommandError("CUSTOMER_COMMAND_ITEM_UNAVAILABLE");
      }

      const draftInput: PersistDraftOrderInput = Object.freeze({
        sourceCartId: cart.id,
        customerNote,
        items: cart.items.map((item) =>
          Object.freeze({
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            menuItemThaiName: item.menuItemThaiName,
            preparationStation: item.preparationStation,
            quantity: item.quantity,
            unitPriceMinor: item.unitPriceMinor,
            currency: item.currency,
            specialRequest: item.specialRequest,
            modifiers: item.modifiers.map((modifier) =>
              Object.freeze({
                modifierGroupId: modifier.modifierGroupId,
                modifierChoiceId: modifier.modifierChoiceId,
                modifierGroupName: modifier.modifierGroupName,
                modifierChoiceName: modifier.modifierChoiceName,
                priceDeltaMinor: modifier.priceDeltaMinor,
              }),
            ),
          }),
        ),
      });

      const draft = await repositories.orders.persistDraft(draftInput);
      const submitted = await repositories.orders.submitDraft(draft.id);
      await repositories.carts.markConverted(cart.id);

      return submitted;
    }, dependencies);
  } catch (error) {
    throw toCustomerCommandError(error, "CUSTOMER_COMMAND_CONFLICT");
  }
}
