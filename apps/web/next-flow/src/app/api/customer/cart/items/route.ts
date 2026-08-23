import {
  addCustomerCartItemIdempotent,
  removeCustomerCartItemIdempotent,
  updateCustomerCartItemIdempotent,
} from "@/modules/customer-data/server";
import {
  assertCustomerCommandSameOrigin,
  customerCommandFailure,
  customerCommandSuccess,
  readCustomerCommandJson,
  readCustomerIdempotencyKey,
} from "@/modules/customer-data/server/commands/http";

export async function POST(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const idempotencyKey = readCustomerIdempotencyKey(request);
    const body = await readCustomerCommandJson(request, [
      "cartId",
      "menuItemId",
      "quantity",
      "modifierChoiceIds",
      "specialRequest",
    ]);
    const result = await addCustomerCartItemIdempotent(
      {
        cartId: body.cartId as string,
        menuItemId: body.menuItemId as string,
        quantity: body.quantity as number,
        modifierChoiceIds: body.modifierChoiceIds as readonly string[] | undefined,
        specialRequest: body.specialRequest as string | null | undefined,
      },
      idempotencyKey,
    );
    return customerCommandSuccess(result.data, result.statusCode, {
      replayed: result.replayed,
    });
  } catch (error) {
    return customerCommandFailure(error);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const idempotencyKey = readCustomerIdempotencyKey(request);
    const body = await readCustomerCommandJson(request, [
      "cartId",
      "cartItemId",
      "quantity",
    ]);
    const result = await updateCustomerCartItemIdempotent(
      {
        cartId: body.cartId as string,
        cartItemId: body.cartItemId as string,
        quantity: body.quantity as number,
      },
      idempotencyKey,
    );
    return customerCommandSuccess(result.data, result.statusCode, {
      replayed: result.replayed,
    });
  } catch (error) {
    return customerCommandFailure(error);
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const idempotencyKey = readCustomerIdempotencyKey(request);
    const body = await readCustomerCommandJson(request, ["cartId", "cartItemId"]);
    const result = await removeCustomerCartItemIdempotent(
      {
        cartId: body.cartId as string,
        cartItemId: body.cartItemId as string,
      },
      idempotencyKey,
    );
    return customerCommandSuccess(result.data, result.statusCode, {
      replayed: result.replayed,
    });
  } catch (error) {
    return customerCommandFailure(error);
  }
}
