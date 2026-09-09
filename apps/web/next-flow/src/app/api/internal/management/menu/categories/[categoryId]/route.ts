import {
  updateManagedCategory,
  type UpdateManagedCategoryInput,
} from "@/modules/menu-management/server/menu-category-service";
import { MenuManagementError } from "@/modules/menu-management/server/menu-management-service";

const MAX_BODY_BYTES = 8 * 1024;

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
  if (origin && origin !== new URL(request.url).origin) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
}

async function readBody(request: Request): Promise<UpdateManagedCategoryInput> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new MenuManagementError("MENU_MANAGEMENT_INVALID_INPUT");
  }
  return parsed as UpdateManagedCategoryInput;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    const { categoryId } = await params;
    return Response.json(
      { ok: true, data: await updateManagedCategory(categoryId, await readBody(request)) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
