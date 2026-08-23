import { NextResponse } from "next/server";

import { sanitizeInternalPath } from "@/lib/auth/redirect";
import { getInternalSession } from "@/lib/auth/session";
import { resolveAccessContext } from "@/modules/identity/server/resolve-access-context";
import { persistWorkspaceSelection } from "@/modules/identity/server/workspace-selection";

interface WorkspaceSelectionBody {
  tenantId?: unknown;
  branchId?: unknown;
  next?: unknown;
}

function rejectCrossSiteMutation(request: Request): boolean {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

export async function POST(request: Request) {
  if (rejectCrossSiteMutation(request)) {
    return NextResponse.json({ error: "Workspace selection was rejected." }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }

  const session = await getInternalSession();
  const actorId = session?.user?.id;
  if (!actorId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: WorkspaceSelectionBody;
  try {
    body = (await request.json()) as WorkspaceSelectionBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.tenantId !== "string") {
    return NextResponse.json({ error: "Invalid workspace selection." }, { status: 400 });
  }
  if (body.branchId != null && typeof body.branchId !== "string") {
    return NextResponse.json({ error: "Invalid workspace selection." }, { status: 400 });
  }

  const result = await resolveAccessContext({
    actorId,
    tenantId: body.tenantId,
    branchId: body.branchId ?? null,
    requireBranch: true,
  });

  if (result.status === "unavailable") {
    return NextResponse.json(
      { error: "Workspace access is temporarily unavailable." },
      { status: 503 },
    );
  }
  if (result.status !== "resolved") {
    return NextResponse.json({ error: "Workspace selection is not available." }, { status: 403 });
  }

  await persistWorkspaceSelection({
    tenantId: result.context.tenantId,
    branchId: result.context.branchId,
  });

  return NextResponse.json({
    success: true,
    redirectTo: sanitizeInternalPath(typeof body.next === "string" ? body.next : undefined),
  });
}
