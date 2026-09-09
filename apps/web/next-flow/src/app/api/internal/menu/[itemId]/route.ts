import {
  menuFailure,
  menuSuccess,
  readMenuAvailabilityRequest,
  setStaffMenuAvailability,
} from "@/modules/menu-operations/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
): Promise<Response> {
  try {
    const { itemId } = await context.params;
    const status = await readMenuAvailabilityRequest(request);
    return menuSuccess(await setStaffMenuAvailability(itemId, status));
  } catch (error) {
    return menuFailure(error);
  }
}
