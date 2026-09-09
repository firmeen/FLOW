import {
  loadManagementOverview,
  managementFailure,
  managementSuccess,
} from "@/modules/management-operations/server";

export async function GET(): Promise<Response> {
  try {
    return managementSuccess(await loadManagementOverview());
  } catch (error) {
    return managementFailure(error);
  }
}
