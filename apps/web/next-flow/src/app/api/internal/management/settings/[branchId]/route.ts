import {
  ManagementSettingsError,
  updateManagedBranchSettings,
} from "@/modules/management-settings/server/management-settings-service";
import type { UpdateManagedBranchSettingsInput } from "@/modules/management-settings/types";

const MAX_BODY_BYTES = 4 * 1024;

function failure(error: unknown): Response {
  if (error instanceof ManagementSettingsError) {
    const status =
      error.code === "MANAGEMENT_SETTINGS_FORBIDDEN"
        ? 403
        : error.code === "MANAGEMENT_SETTINGS_INVALID_INPUT"
          ? 400
          : error.code === "MANAGEMENT_SETTINGS_NOT_FOUND"
            ? 404
            : error.code === "MANAGEMENT_SETTINGS_CONFLICT"
              ? 409
              : 503;
    return Response.json(
      { ok: false, error: { code: error.code } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { ok: false, error: { code: "MANAGEMENT_SETTINGS_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }
}

async function readBody(request: Request): Promise<UpdateManagedBranchSettingsInput> {
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.startsWith("application/json")) {
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }
  const value = JSON.parse(text) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ManagementSettingsError("MANAGEMENT_SETTINGS_INVALID_INPUT");
  }
  return value as UpdateManagedBranchSettingsInput;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    const body = await readBody(request);
    const { branchId } = await params;
    return Response.json(
      { ok: true, data: await updateManagedBranchSettings(branchId, body) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
