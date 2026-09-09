import { DurableTeamAccessStudio } from "@/features/dashboard/durable-team-access-studio";
import { DurableTeamInviteDock } from "@/features/dashboard/durable-team-invite-dock";

export default function AdminTeamPage() {
  return (
    <>
      <DurableTeamAccessStudio />
      <DurableTeamInviteDock />
    </>
  );
}
