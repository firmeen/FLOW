import {
  ManagementSettingsError,
  loadManagementSettings,
} from "@/modules/management-settings/server/management-settings-service";

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

export async function GET(): Promise<Response> {
  try {
    return Response.json(
      { ok: true, data: await loadManagementSettings() },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
