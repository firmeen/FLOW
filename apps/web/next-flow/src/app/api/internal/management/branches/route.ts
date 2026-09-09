import {
  ManagementBranchesError,
  loadManagementBranches,
} from "@/modules/management-branches/server/management-branches-service";

function failure(error: unknown): Response {
  if (error instanceof ManagementBranchesError) {
    return Response.json(
      { ok: false, error: { code: error.code } },
      {
        status: error.code === "MANAGEMENT_BRANCHES_FORBIDDEN" ? 403 : 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  return Response.json(
    { ok: false, error: { code: "MANAGEMENT_BRANCHES_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(): Promise<Response> {
  try {
    return Response.json(
      { ok: true, data: await loadManagementBranches() },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
