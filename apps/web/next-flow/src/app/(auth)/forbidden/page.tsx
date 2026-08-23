import type { Metadata } from "next";
import { ShieldX } from "lucide-react";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { FlowLogo } from "@/components/shared/flow-logo";
import { Card } from "@/components/ui/card";
import { sanitizeInternalPath } from "@/lib/auth/redirect";
import { getInternalSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Access Restricted",
};

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    state?: string | string[];
  }>;
}) {
  const session = await getInternalSession();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const rawState = Array.isArray(params.state) ? params.state[0] : params.state;
  const nextPath = sanitizeInternalPath(rawNext);
  const unavailable = rawState === "unavailable";

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
          <span className="grid size-11 place-items-center bg-destructive text-destructive-foreground">
            <ShieldX className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-6 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Authorization
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold uppercase tracking-[0.04em] text-foreground">
            {unavailable ? "Access check unavailable" : "Access restricted"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {unavailable
              ? "FLOW could not safely verify this capability. No privileged content was opened."
              : "Your current workspace is valid, but this capability is not available to your account."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/workspace?next=${encodeURIComponent(nextPath)}`}
              className="inline-flex h-9 items-center justify-center bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              Choose workspace
            </a>
            {unavailable && (
              <a
                href={nextPath}
                className="inline-flex h-9 items-center justify-center border border-border px-4 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                Retry
              </a>
            )}
            <SignOutButton />
          </div>
        </Card>
      </div>
    </main>
  );
}
