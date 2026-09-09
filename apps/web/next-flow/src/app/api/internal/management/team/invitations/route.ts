import {
  createTeamInvitation,
  loadTeamInvitationWorkspace,
} from "@/modules/team-access/server/invitation-service";
import {
  assertTeamAccessSameOrigin,
  readTeamAccessJson,
  teamAccessFailure,
} from "@/modules/team-access/server/http";
import type { CreateTeamInvitationInput } from "@/modules/team-access/types";

export async function GET(): Promise<Response> {
  try {
    return Response.json(
      { ok: true, data: await loadTeamInvitationWorkspace() },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertTeamAccessSameOrigin(request);
    const body = await readTeamAccessJson(request);
    const created = await createTeamInvitation(body as unknown as CreateTeamInvitationInput);
    return Response.json(
      { ok: true, data: created },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}
