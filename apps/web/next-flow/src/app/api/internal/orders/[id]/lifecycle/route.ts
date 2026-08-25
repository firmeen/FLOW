import {
  OperationalOrderLifecycleError,
  assertOperationalOrderLifecycleSameOrigin,
  operationalOrderApiFailure,
  operationalOrderApiSuccess,
  parseOperationalOrderLifecycleRequest,
  readOperationalOrderLifecycleJson,
  requireOperationalOrderRouteContext,
  transitionOperationalOrderLifecycle,
} from "@/modules/order-operations/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if ([...url.searchParams.keys()].length > 0) {
      throw new OperationalOrderLifecycleError("ORDER_LIFECYCLE_INVALID_REQUEST");
    }

    assertOperationalOrderLifecycleSameOrigin(request);
    const body = await readOperationalOrderLifecycleJson(request);
    const { id } = await params;
    const command = parseOperationalOrderLifecycleRequest(id, body);
    const context = await requireOperationalOrderRouteContext();
    const result = await transitionOperationalOrderLifecycle(context, command);
    return operationalOrderApiSuccess(result);
  } catch (error) {
    return operationalOrderApiFailure(error);
  }
}
