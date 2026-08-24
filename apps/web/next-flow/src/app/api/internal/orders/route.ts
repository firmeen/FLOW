import {
  listOperationalOrderQueue,
  operationalOrderApiFailure,
  operationalOrderApiSuccess,
  parseOperationalOrderQueueSearchParams,
  requireOperationalOrderRouteContext,
} from "@/modules/order-operations/server";

export async function GET(request: Request): Promise<Response> {
  try {
    const context = await requireOperationalOrderRouteContext();
    const filter = parseOperationalOrderQueueSearchParams(
      new URL(request.url).searchParams,
    );
    const page = await listOperationalOrderQueue(context, filter);
    return operationalOrderApiSuccess(page);
  } catch (error) {
    return operationalOrderApiFailure(error);
  }
}
