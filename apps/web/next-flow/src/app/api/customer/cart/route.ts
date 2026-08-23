import {
  createCustomerCart,
} from "@/modules/customer-data/server";
import {
  assertCustomerCommandSameOrigin,
  customerCommandFailure,
  customerCommandSuccess,
} from "@/modules/customer-data/server/commands/http";

export async function POST(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const cart = await createCustomerCart();
    return customerCommandSuccess(cart, 201);
  } catch (error) {
    return customerCommandFailure(error);
  }
}
