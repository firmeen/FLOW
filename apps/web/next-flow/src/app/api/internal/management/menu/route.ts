import {
  MenuManagementError,
  loadMenuManagementSnapshot,
} from "@/modules/menu-management/server/menu-management-service";

function failure(error: unknown): Response {
  if (error instanceof MenuManagementError) {
    const status =
      error.code === "MENU_MANAGEMENT_FORBIDDEN"
        ? 403
        : error.code === "MENU_MANAGEMENT_INVALID_INPUT"
          ? 400
          : error.code === "MENU_MANAGEMENT_NOT_FOUND"
            ? 404
            : error.code === "MENU_MANAGEMENT_CONFLICT"
              ? 409
              : 503;
    return Response.json(
      { ok: false, error: { code: error.code } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { ok: false, error: { code: "MENU_MANAGEMENT_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(): Promise<Response> {
  try {
    const snapshot = await loadMenuManagementSnapshot();
    return Response.json(
      { ok: true, data: snapshot },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
