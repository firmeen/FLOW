import { NextResponse } from "next/server";

import { deleteSession } from "@/lib/auth";
import { clearWorkspaceSelection } from "@/modules/identity/server/workspace-selection";

export async function POST() {
  await deleteSession();
  await clearWorkspaceSelection();
  return NextResponse.json({ success: true });
}
