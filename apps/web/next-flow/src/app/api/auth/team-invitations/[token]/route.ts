import {
  acceptTeamInvitation,
  previewTeamInvitation,
  TeamInvitationAcceptanceError,
} from "@/modules/team-access/server/invitation-acceptance-service";

const MAX_BODY_BYTES = 8 * 1024;

function failure(error: unknown): Response {
  if (error instanceof TeamInvitationAcceptanceError) {
    const status =
      error.code === "TEAM_INVITATION_INVALID"
        ? 404
        : error.code === "TEAM_INVITATION_PASSWORD_INVALID"
          ? 400
          : error.code === "TEAM_INVITATION_EXPIRED_OR_USED"
            ? 410
            : 503;
    return Response.json(
      { ok: false, error: { code: error.code } },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json(
    { ok: false, error: { code: "TEAM_INVITATION_UNAVAILABLE" } },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
}

async function readPassword(request: Request): Promise<unknown> {
  const type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!type.startsWith("application/json")) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
  const value = JSON.parse(text) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => key !== "password")) {
    throw new TeamInvitationAcceptanceError("TEAM_INVITATION_INVALID");
  }
  return body.password;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  try {
    const { token } = await params;
    return Response.json(
      { ok: true, data: await previewTeamInvitation(token) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  try {
    assertSameOrigin(request);
    const password = await readPassword(request);
    const { token } = await params;
    return Response.json(
      { ok: true, data: await acceptTeamInvitation(token, password) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
