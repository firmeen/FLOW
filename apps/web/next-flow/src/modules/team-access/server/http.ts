import "server-only";

import { TeamAccessError } from "./team-access-service";

const MAX_BODY_BYTES = 16 * 1024;

export function assertTeamAccessSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
}

export async function readTeamAccessJson(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.startsWith("application/json")) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  const value = JSON.parse(text) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TeamAccessError("TEAM_ACCESS_INVALID_INPUT");
  }
  return value as Record<string, unknown>;
}

export function teamAccessFailure(error: unknown): Response {
  if (error instanceof TeamAccessError) {
    const status =
      error.code === "TEAM_ACCESS_FORBIDDEN"
        ? 403
        : error.code === "TEAM_ACCESS_INVALID_INPUT"
          ? 400
          : error.code === "TEAM_ACCESS_NOT_FOUND"
            ? 404
            : error.code === "TEAM_ACCESS_CONFLICT"
              ? 409
              : error.code === "TEAM_ACCESS_SELF_LOCKOUT" || error.code === "TEAM_ACCESS_SYSTEM_ROLE"
                ? 422
                : 503;
    return Response.json(
      { ok: false, error: { code: error.code } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { ok: false, error: { code: "TEAM_ACCESS_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
