import {
  loadBranchFloorSnapshot,
  serviceOperationFailure,
  serviceOperationSuccess,
} from "@/modules/service-operations/server";

export async function GET(): Promise<Response> {
  try {
    return serviceOperationSuccess(await loadBranchFloorSnapshot());
  } catch (error) {
    return serviceOperationFailure(error);
  }
}
