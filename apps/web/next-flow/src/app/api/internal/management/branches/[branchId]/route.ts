import {
  ManagementBranchesError,
  updateManagedBranchProfile,
} from "@/modules/management-branches/server/management-branches-service";
import type { UpdateManagedBranchProfileInput } from "@/modules/management-branches/types";

const MAX_BODY_BYTES = 8 * 1024;

function failure(error: unknown): Response {
  if (error instanceof ManagementBranchesError) {
    const status =
      error.code === "MANAGEMENT_BRANCHES_FORBIDDEN"
        ? 403
        : error.code === "MANAGEMENT_BRANCHES_INVALID_INPUT"
          ? 400
          : error.code === "MANAGEMENT_BRANCHES_NOT_FOUND"
            ? 404
            : error.code === "MANAGEMENT_BRANCHES_CONFLICT"
              ? 409
              : 503;
    return Response.json(
      { ok: false, error: { code: error.code } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { ok: false, error: { code: "MANAGEMENT_BRANCHES_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }
}

async function readBody(request: Request): Promise<UpdateManagedBranchProfileInput> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ManagementBranchesError("MANAGEMENT_BRANCHES_INVALID_INPUT");
  }
  return parsed as UpdateManagedBranchProfileInput;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    const { branchId } = await params;
    return Response.json(
      { ok: true, data: await updateManagedBranchProfile(branchId, await readBody(request)) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
