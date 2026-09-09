import {
  kitchenFailure,
  kitchenSuccess,
  listDurableKitchenQueue,
} from "@/modules/kitchen-operations/server";

export async function GET(): Promise<Response> {
  try {
    return kitchenSuccess(await listDurableKitchenQueue());
  } catch (error) {
    return kitchenFailure(error);
  }
}
