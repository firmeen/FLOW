import {
  OperationalOrderExceptionError,
  assertOperationalOrderExceptionSameOrigin,
  executeOperationalOrderException,
  operationalOrderApiFailure,
  operationalOrderApiSuccess,
  parseOperationalOrderExceptionRequest,
  readOperationalOrderExceptionJson,
  requireOperationalOrderRouteContext,
} from "@/modules/order-operations/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if ([...url.searchParams.keys()].length > 0) {
      throw new OperationalOrderExceptionError("ORDER_EXCEPTION_INVALID_REQUEST");
    }

    assertOperationalOrderExceptionSameOrigin(request);
    const body = await readOperationalOrderExceptionJson(request);
    const { id } = await params;
    const command = parseOperationalOrderExceptionRequest(id, body);
    const context = await requireOperationalOrderRouteContext();
    const result = await executeOperationalOrderException(context, command);
    return operationalOrderApiSuccess(result);
  } catch (error) {
    return operationalOrderApiFailure(error);
  }
}
