import {
  OperationalOrderDecisionError,
  assertOperationalOrderDecisionSameOrigin,
  decideOperationalOrder,
  operationalOrderApiFailure,
  operationalOrderApiSuccess,
  parseOperationalOrderDecisionRequest,
  readOperationalOrderDecisionJson,
  requireOperationalOrderRouteContext,
} from "@/modules/order-operations/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if ([...url.searchParams.keys()].length > 0) {
      throw new OperationalOrderDecisionError("ORDER_DECISION_INVALID_REQUEST");
    }

    assertOperationalOrderDecisionSameOrigin(request);
    const body = await readOperationalOrderDecisionJson(request);
    const { id } = await params;
    const command = parseOperationalOrderDecisionRequest(id, body);
    const context = await requireOperationalOrderRouteContext();
    const result = await decideOperationalOrder(context, command);
    return operationalOrderApiSuccess(result);
  } catch (error) {
    return operationalOrderApiFailure(error);
  }
}
