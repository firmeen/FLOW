import {
  assertTeamAccessSameOrigin,
  readTeamAccessJson,
  teamAccessFailure,
} from "@/modules/team-access/server/http";
import {
  createManagedRole,
} from "@/modules/team-access/server/team-access-service";
import type { CreateManagedRoleInput } from "@/modules/team-access/types";

export async function POST(request: Request): Promise<Response> {
  try {
    assertTeamAccessSameOrigin(request);
    const body = (await readTeamAccessJson(request)) as CreateManagedRoleInput;
    return Response.json(
      { ok: true, data: await createManagedRole(body) },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}
