import { loadStaffMenuControl, menuFailure, menuSuccess } from "@/modules/menu-operations/server";

export async function GET(): Promise<Response> {
  try {
    return menuSuccess(await loadStaffMenuControl());
  } catch (error) {
    return menuFailure(error);
  }
}
