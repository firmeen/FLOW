import {
  assertServiceOperationSameOrigin,
  createCurrentCustomerServiceRequest,
  listCurrentCustomerServiceRequests,
  readServiceOperationJson,
  serviceOperationFailure,
  serviceOperationSuccess,
} from "@/modules/service-operations/server";

export async function GET(): Promise<Response> {
  try {
    return serviceOperationSuccess(await listCurrentCustomerServiceRequests());
  } catch (error) {
    return serviceOperationFailure(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertServiceOperationSameOrigin(request);
    const body = await readServiceOperationJson(request, ["type", "note"]);
    const created = await createCurrentCustomerServiceRequest({
      type: body.type,
      note: body.note,
    });
    return serviceOperationSuccess(created, 201);
  } catch (error) {
    return serviceOperationFailure(error);
  }
}
