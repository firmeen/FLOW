import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { redirect } from "next/navigation";

import { FlowLogo } from "@/components/shared/flow-logo";
import { Card } from "@/components/ui/card";
import { sanitizeInternalPath } from "@/lib/auth/redirect";
import { getInternalSession } from "@/lib/auth/session";
import { listActorWorkspaces } from "@/modules/identity/server/workspace-repository";

import {
  WorkspaceSelector,
  type WorkspaceChoice,
} from "./workspace-selector";

export const metadata: Metadata = {
  title: "Choose Workspace",
};

function buildChoices(
  workspaces: Awaited<ReturnType<typeof listActorWorkspaces>>,
): WorkspaceChoice[] {
  const choices = new Map<string, WorkspaceChoice>();

  for (const workspace of workspaces) {
    if (!workspace.branchId || !workspace.branchName) continue;
    const key = `${workspace.tenantId}:${workspace.branchId}`;
    if (choices.has(key)) continue;
    choices.set(key, {
      tenantId: workspace.tenantId,
      tenantName: workspace.tenantName,
      branchId: workspace.branchId,
      branchName: workspace.branchName,
      branchCode: workspace.branchCode,
    });
  }

  return [...choices.values()];
}

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    state?: string | string[];
  }>;
}) {
  const session = await getInternalSession();
  const actorId = session?.user?.id;
  if (!actorId) redirect("/login");

  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = sanitizeInternalPath(rawNext);

  let choices: WorkspaceChoice[] = [];
  let unavailable = false;
  try {
    choices = buildChoices(await listActorWorkspaces(actorId));
  } catch {
    unavailable = true;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-lg">
        <a
          href="/"
          className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="FLOW home"
        >
          <FlowLogo variant="primary" preload className="w-48 sm:w-56" />
        </a>

        <Card className="mt-6 p-6 sm:p-8">
          <span className="grid size-11 place-items-center bg-primary text-primary-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-6 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Current access
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold uppercase tracking-[0.04em] text-foreground">
            Choose workspace
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Select an active branch you are currently allowed to use. Every selection is revalidated on the server before access is granted.
          </p>

          <div className="mt-6">
            <WorkspaceSelector
              choices={choices}
              nextPath={nextPath}
              unavailable={unavailable}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
