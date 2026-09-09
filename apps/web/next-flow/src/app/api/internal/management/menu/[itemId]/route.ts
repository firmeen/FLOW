import {
  MenuManagementError,
  updateManagedMenuItem,
} from "@/modules/menu-management/server/menu-management-service";
import type { UpdateManagedMenuItemInput } from "@/modules/menu-management/types";

const MAX_BODY_BYTES = 12 * 1024;

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

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;
  if (origin !== new URL(request.url).origin) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
}

async function readBody(request: Request): Promise<UpdateManagedMenuItemInput> {
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.startsWith("application/json")) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  const value = JSON.parse(text) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return value as UpdateManagedMenuItemInput;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    const body = await readBody(request);
    const { itemId } = await params;
    const item = await updateManagedMenuItem(itemId, body);
    return Response.json(
      { ok: true, data: item },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
