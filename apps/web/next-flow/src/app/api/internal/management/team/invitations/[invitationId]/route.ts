import { revokeTeamInvitation } from "@/modules/team-access/server/invitation-service";
import {
  assertTeamAccessSameOrigin,
  teamAccessFailure,
} from "@/modules/team-access/server/http";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ invitationId: string }> },
): Promise<Response> {
  try {
    assertTeamAccessSameOrigin(request);
    const { invitationId } = await params;
    return Response.json(
      { ok: true, data: await revokeTeamInvitation(invitationId) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}
