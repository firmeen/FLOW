import {
  getOperationalOrderDetail,
  OperationalOrderReadError,
  operationalOrderApiFailure,
  operationalOrderApiSuccess,
  requireOperationalOrderRouteContext,
} from "@/modules/order-operations/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if ([...url.searchParams.keys()].length > 0) {
      throw new OperationalOrderReadError("ORDER_QUEUE_INVALID_QUERY");
    }
    const context = await requireOperationalOrderRouteContext();
    const { id } = await params;
    const detail = await getOperationalOrderDetail(context, id);
    return operationalOrderApiSuccess(detail);
  } catch (error) {
    return operationalOrderApiFailure(error);
  }
}
