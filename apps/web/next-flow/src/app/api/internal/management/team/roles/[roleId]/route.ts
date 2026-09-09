import {
  assertTeamAccessSameOrigin,
  readTeamAccessJson,
  teamAccessFailure,
} from "@/modules/team-access/server/http";
import {
  updateManagedRole,
} from "@/modules/team-access/server/team-access-service";
import type { UpdateManagedRoleInput } from "@/modules/team-access/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> },
): Promise<Response> {
  try {
    assertTeamAccessSameOrigin(request);
    const body = (await readTeamAccessJson(request)) as UpdateManagedRoleInput;
    const { roleId } = await params;
    return Response.json(
      { ok: true, data: await updateManagedRole(roleId, body) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}
