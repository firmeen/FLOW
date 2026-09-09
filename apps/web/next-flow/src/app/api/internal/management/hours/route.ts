import {
  ManagementHoursError,
  loadManagementHours,
} from "@/modules/management-hours/server/management-hours-service";

function failure(error: unknown): Response {
  if (error instanceof ManagementHoursError) {
    const status = error.code === "MANAGEMENT_HOURS_FORBIDDEN" ? 403 : 503;
    return Response.json(
      { ok: false, error: { code: error.code } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { ok: false, error: { code: "MANAGEMENT_HOURS_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(): Promise<Response> {
  try {
    return Response.json(
      { ok: true, data: await loadManagementHours() },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
