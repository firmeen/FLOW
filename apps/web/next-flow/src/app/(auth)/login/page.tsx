import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";

import { FlowLogo } from "@/components/shared/flow-logo";
import { Card } from "@/components/ui/card";
import {
  getInternalExperienceLabel,
  getInternalSession,
  sanitizeInternalPath,
} from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Restaurant Team Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = sanitizeInternalPath(rawNext);
  const session = await getInternalSession();

  if (session?.user?.id) redirect(nextPath);

  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <a
          href="/"
          className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-label="FLOW home"
        >
          <FlowLogo variant="primary" preload className="w-48 sm:w-56" />
        </a>

        <Card className="mt-6 p-6 sm:p-8">
          <span className="grid size-11 place-items-center bg-primary text-primary-foreground">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-6 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Restaurant team access
          </p>
          <h1 className="mt-2 font-heading text-2xl font-semibold uppercase tracking-[0.04em] text-foreground">
            Sign in to {getInternalExperienceLabel(nextPath)}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in with your FLOW internal identity. Workspace and permissions are resolved separately.
          </p>

          <LoginForm nextPath={nextPath} />
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Customer table ordering remains public and does not require an account.
        </p>
      </div>
    </main>
  );
}
