import {
  ManagementHoursError,
  updateManagedOpeningWindow,
} from "@/modules/management-hours/server/management-hours-service";
import type { UpdateManagedOpeningWindowInput } from "@/modules/management-hours/types";

const MAX_BODY_BYTES = 2 * 1024;

function failure(error: unknown): Response {
  if (error instanceof ManagementHoursError) {
    const status =
      error.code === "MANAGEMENT_HOURS_FORBIDDEN"
        ? 403
        : error.code === "MANAGEMENT_HOURS_INVALID_INPUT"
          ? 400
          : error.code === "MANAGEMENT_HOURS_NOT_FOUND"
            ? 404
            : error.code === "MANAGEMENT_HOURS_CONFLICT"
              ? 409
              : 503;
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

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
}

async function body(request: Request): Promise<UpdateManagedOpeningWindowInput> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ManagementHoursError("MANAGEMENT_HOURS_INVALID_INPUT");
  }
  return parsed as UpdateManagedOpeningWindowInput;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    const input = await body(request);
    const { branchId } = await params;
    return Response.json(
      { ok: true, data: await updateManagedOpeningWindow(branchId, input) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
