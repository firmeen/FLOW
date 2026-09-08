import {
  listCurrentCustomerOrders,
  submitCustomerOrderIdempotent,
} from "@/modules/customer-data/server";
import {
  assertCustomerCommandSameOrigin,
  customerCommandFailure,
  customerCommandSuccess,
  readCustomerCommandJson,
  readCustomerIdempotencyKey,
} from "@/modules/customer-data/server/commands/http";

export async function GET(): Promise<Response> {
  try {
    const orders = await listCurrentCustomerOrders();
    return customerCommandSuccess(orders);
  } catch (error) {
    return customerCommandFailure(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertCustomerCommandSameOrigin(request);
    const idempotencyKey = readCustomerIdempotencyKey(request);
    const body = await readCustomerCommandJson(request, ["cartId", "customerNote"]);
    const result = await submitCustomerOrderIdempotent(
      {
        cartId: body.cartId as string,
        customerNote: body.customerNote as string | null | undefined,
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
