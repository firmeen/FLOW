import {
  assertServiceOperationSameOrigin,
  readServiceOperationJson,
  serviceOperationFailure,
  serviceOperationSuccess,
  ServiceOperationError,
  transitionBranchServiceRequest,
} from "@/modules/service-operations/server";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ requestId: string }> },
): Promise<Response> {
  try {
    assertServiceOperationSameOrigin(request);
    const { requestId } = await props.params;
    const body = await readServiceOperationJson(request, ["action"]);
    if (body.action !== "ACKNOWLEDGE" && body.action !== "RESOLVE") {
      throw new ServiceOperationError("SERVICE_REQUEST_INVALID_INPUT");
    }
    return serviceOperationSuccess(
      await transitionBranchServiceRequest(requestId, body.action),
    );
  } catch (error) {
    return serviceOperationFailure(error);
  }
}
