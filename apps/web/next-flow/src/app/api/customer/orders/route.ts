import { submitCustomerOrder } from "@/modules/customer-data/server";
import {
  assertCustomerCommandSameOrigin,
  customerCommandFailure,
  customerCommandSuccess,
  readCustomerCommandJson,
} from "@/modules/customer-data/server/commands/http";

export async function POST(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const body = await readCustomerCommandJson(request, ["cartId", "customerNote"]);
    const order = await submitCustomerOrder({
      cartId: body.cartId as string,
      customerNote: body.customerNote as string | null | undefined,
    });
    return customerCommandSuccess(order, 201);
  } catch (error) {
    return customerCommandFailure(error);
  }
}
