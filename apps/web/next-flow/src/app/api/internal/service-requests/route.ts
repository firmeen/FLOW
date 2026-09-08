import {
  listBranchServiceRequests,
  serviceOperationFailure,
  serviceOperationSuccess,
} from "@/modules/service-operations/server";

export async function GET(): Promise<Response> {
  try {
    return serviceOperationSuccess(await listBranchServiceRequests());
  } catch (error) {
    return serviceOperationFailure(error);
  }
}
