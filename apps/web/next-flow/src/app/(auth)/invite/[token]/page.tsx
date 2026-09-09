import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  previewTeamInvitation,
  TeamInvitationAcceptanceError,
} from "@/modules/team-access/server/invitation-acceptance-service";
import { InvitationAcceptanceCard } from "./invitation-acceptance-card";

export const metadata: Metadata = {
  title: "Activate Team Access",
  description: "Activate a secure FLOW restaurant team invitation.",
  robots: { index: false, follow: false },
};

export default async function TeamInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  try {
    const preview = await previewTeamInvitation(token);
    return <InvitationAcceptanceCard preview={preview} token={token} />;
  } catch (error) {
    if (
      error instanceof TeamInvitationAcceptanceError &&
      error.code === "TEAM_INVITATION_INVALID"
    ) {
      notFound();
    }
    throw error;
  }
}
