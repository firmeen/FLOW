import { loadTeamAccessSnapshot } from "@/modules/team-access/server/team-access-service";
import { teamAccessFailure } from "@/modules/team-access/server/http";

export async function GET(): Promise<Response> {
  try {
    return Response.json(
      { ok: true, data: await loadTeamAccessSnapshot() },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return teamAccessFailure(error);
  }
}
