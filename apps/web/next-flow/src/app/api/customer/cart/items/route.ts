import {
  addCustomerCartItem,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "@/modules/customer-data/server";
import {
  assertCustomerCommandSameOrigin,
  customerCommandFailure,
  customerCommandSuccess,
  readCustomerCommandJson,
} from "@/modules/customer-data/server/commands/http";

export async function POST(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const body = await readCustomerCommandJson(request, [
      "cartId",
      "menuItemId",
      "quantity",
      "modifierChoiceIds",
      "specialRequest",
    ]);
    const cart = await addCustomerCartItem({
      cartId: body.cartId as string,
      menuItemId: body.menuItemId as string,
      quantity: body.quantity as number,
      modifierChoiceIds: body.modifierChoiceIds as readonly string[] | undefined,
      specialRequest: body.specialRequest as string | null | undefined,
    });
    return customerCommandSuccess(cart);
  } catch (error) {
    return customerCommandFailure(error);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const body = await readCustomerCommandJson(request, [
      "cartId",
      "cartItemId",
      "quantity",
    ]);
    const cart = await updateCustomerCartItem({
      cartId: body.cartId as string,
      cartItemId: body.cartItemId as string,
      quantity: body.quantity as number,
    });
    return customerCommandSuccess(cart);
  } catch (error) {
    return customerCommandFailure(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const body = await readCustomerCommandJson(request, ["cartId", "cartItemId"]);
    const cart = await removeCustomerCartItem({
      cartId: body.cartId as string,
      cartItemId: body.cartItemId as string,
    });
    return customerCommandSuccess(cart);
  } catch (error) {
    return customerCommandFailure(error);
  }
}
