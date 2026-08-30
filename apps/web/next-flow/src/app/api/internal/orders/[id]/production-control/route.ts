import {
  OperationalOrderProductionControlError,
  assertOperationalOrderProductionControlSameOrigin,
  executeOperationalOrderProductionControl,
  operationalOrderApiFailure,
  operationalOrderApiSuccess,
  parseOperationalOrderProductionControlRequest,
  readOperationalOrderProductionControlJson,
  requireOperationalOrderRouteContext,
} from "@/modules/order-operations/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if ([...url.searchParams.keys()].length > 0) {
      throw new OperationalOrderProductionControlError("ORDER_CONTROL_INVALID_REQUEST");
    }

    assertOperationalOrderProductionControlSameOrigin(request);
    const body = await readOperationalOrderProductionControlJson(request);
    const { id } = await params;
    const command = parseOperationalOrderProductionControlRequest(id, body);
    const context = await requireOperationalOrderRouteContext();
    const result = await executeOperationalOrderProductionControl(context, command);
    return operationalOrderApiSuccess(result);
  } catch (error) {
    return operationalOrderApiFailure(error);
  }
}
