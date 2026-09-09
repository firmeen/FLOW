import {
  kitchenFailure,
  kitchenSuccess,
  readKitchenAction,
  transitionDurableKitchenOrder,
} from "@/modules/kitchen-operations/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> },
): Promise<Response> {
  try {
    const { orderId } = await context.params;
    const action = await readKitchenAction(request);
    const status = await transitionDurableKitchenOrder(orderId, action);
    return kitchenSuccess({ orderId, action, status });
  } catch (error) {
    return kitchenFailure(error);
  }
}
