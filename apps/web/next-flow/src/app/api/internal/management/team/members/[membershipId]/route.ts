import {
  assertTeamAccessSameOrigin,
  readTeamAccessJson,
  teamAccessFailure,
} from "@/modules/team-access/server/http";
import {
  updateManagedMembership,
} from "@/modules/team-access/server/team-access-service";
import type { UpdateManagedMembershipInput } from "@/modules/team-access/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ membershipId: string }> },
): Promise<Response> {
  try {
    assertTeamAccessSameOrigin(request);
    const body = (await readTeamAccessJson(request)) as UpdateManagedMembershipInput;
    const { membershipId } = await params;
    return Response.json(
      { ok: true, data: await updateManagedMembership(membershipId, body) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}
