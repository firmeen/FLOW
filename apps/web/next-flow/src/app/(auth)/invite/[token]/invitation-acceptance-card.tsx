"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button, Card, StatusPill } from "@/components/foodflow-ui";
import { FlowLogo } from "@/components/shared/flow-logo";
import type {
  TeamInvitationAcceptanceResult,
  TeamInvitationPreview,
} from "@/modules/team-access/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

function errorMessage(code: string): string {
  if (code === "TEAM_INVITATION_PASSWORD_INVALID") {
    return "Use a password with at least 12 characters.";
  }
  if (code === "TEAM_INVITATION_EXPIRED_OR_USED") {
    return "This invitation has expired, was revoked, or has already been used.";
  }
  if (code === "TEAM_INVITATION_INVALID") return "This invitation link is invalid.";
  return "FLOW could not activate this invitation right now. Please try again.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    throw new Error(errorMessage(body.ok ? "TEAM_INVITATION_UNAVAILABLE" : body.error.code));
  }
  return body.data;
}

function expiryLabel(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function InvitationAcceptanceCard({
  preview,
  token,
}: {
  readonly preview: TeamInvitationPreview;
  readonly token: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<TeamInvitationAcceptanceResult | null>(null);

  const passwordReady = useMemo(
    () => password.length >= 12 && password.trim().length >= 12 && password === confirmPassword,
    [confirmPassword, password],
  );

  async function acceptInvitation() {
    if (!preview.active || !passwordReady || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/auth/team-invitations/${encodeURIComponent(token)}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        },
      );
      setAccepted(await readApi<TeamInvitationAcceptanceResult>(response));
      setPassword("");
      setConfirmPassword("");
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "FLOW could not activate this invitation.",
      );
    } finally {
      setPending(false);
    }
  }

  if (accepted) {
    return (
      <main className="relative grid min-h-screen overflow-hidden bg-zinc-950 px-4 py-10 text-white sm:px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 size-[34rem] rounded-full bg-white/[0.055] blur-3xl" />
          <div className="absolute -bottom-48 -right-40 size-[38rem] rounded-full bg-white/[0.04] blur-3xl" />
        </div>
        <div className="relative m-auto w-full max-w-xl">
          <FlowLogo variant="reverse" preload className="w-44" />
          <Card className="mt-8 overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.065] p-0 text-white shadow-[0_40px_140px_rgb(0_0_0/0.4)] backdrop-blur-2xl">
            <div className="p-7 sm:p-9">
              <span className="grid size-14 place-items-center rounded-2xl bg-white text-zinc-950 shadow-xl">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                Access activated
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Welcome to {preview.tenantName}.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/60">
                {accepted.existingCredential
                  ? "Your new membership is active. Your existing FLOW password was left unchanged."
                  : "Your FLOW identity and password are ready. Your workspace will resolve from the role assigned by the owner."}
              </p>
              <div className="mt-7 rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="size-4 text-white/55" />
                  <div>
                    <p className="text-sm font-semibold">{preview.roleName}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {preview.branchName ?? "Tenant-wide authority"} · {accepted.normalizedEmail}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                asChild
                className="mt-7 w-full bg-white text-zinc-950 hover:bg-white/90"
                size="lg"
                rightIcon={<ArrowRight className="size-4" />}
              >
                <Link href="/login?next=%2Fworkspace">Continue to sign in</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-muted/40 px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.045),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.04),transparent_32%)]" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 p-7 text-white shadow-[0_36px_120px_rgb(0_0_0/0.22)] sm:p-9 lg:min-h-[680px]">
          <div className="absolute -right-28 -top-36 size-[26rem] rounded-full border border-white/10" />
          <div className="absolute -bottom-44 -left-32 size-[30rem] rounded-full bg-white/[0.04] blur-3xl" />
          <div className="relative flex h-full flex-col">
            <FlowLogo variant="reverse" preload className="w-44" />
            <div className="my-auto py-14">
              <StatusPill className="border-white/10 bg-white/8 text-white" dot>
                Secure team invitation
              </StatusPill>
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-white/42">
                {preview.tenantName}
              </p>
              <h1 className="mt-3 max-w-lg text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
                Your place in the flow is ready.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/58">
                Activate one identity for the restaurant workspace. Your access remains bounded by the role and scope the owner assigned.
              </p>

              <div className="mt-9 grid gap-2">
                <InviteFact icon={<UserRound className="size-4" />} label="Invited as" value={preview.displayName} />
                <InviteFact icon={<ShieldCheck className="size-4" />} label="Role" value={preview.roleName} />
                <InviteFact icon={<Building2 className="size-4" />} label="Scope" value={preview.branchName ?? "Tenant-wide"} />
                <InviteFact icon={<Mail className="size-4" />} label="Identity" value={preview.email} />
              </div>
            </div>
            <p className="text-[10px] font-medium leading-5 text-white/35">
              Invitation expires {expiryLabel(preview.expiresAt)}. FLOW stores only a digest of this invitation token.
            </p>
          </div>
        </section>

        <section className="flex items-center">
          <Card className="w-full rounded-[2rem] border-border/80 p-6 shadow-[0_28px_90px_rgb(0_0_0/0.07)] sm:p-8 lg:p-10">
            <span className="grid size-12 place-items-center rounded-2xl bg-foreground text-background">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Identity activation
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
              {preview.active ? "Create your secure access." : "This invitation is no longer active."}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {preview.active
                ? "Choose a password for a new FLOW identity. If this email already belongs to an active FLOW identity, the existing password will remain unchanged."
                : "Ask the restaurant owner to issue a fresh invitation from Team & Access."}
            </p>

            {preview.active ? (
              <div className="mt-8 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Password
                  </span>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-11 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15"
                      placeholder="At least 12 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Confirm password
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15"
                    placeholder="Repeat password"
                  />
                </label>

                <div className="rounded-2xl border border-border bg-muted/35 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Bounded access by design</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        This link activates only the role and branch scope shown on this page. It cannot widen its own authority.
                      </p>
                    </div>
                  </div>
                </div>

                {password && confirmPassword && password !== confirmPassword ? (
                  <p className="text-xs font-semibold text-destructive">Passwords do not match.</p>
                ) : null}
                {error ? (
                  <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs font-semibold text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!passwordReady || pending}
                  onClick={() => void acceptInvitation()}
                  leftIcon={pending ? <LoaderCircle className="size-4 animate-spin" /> : <BadgeCheck className="size-4" />}
                >
                  Activate FLOW access
                </Button>
              </div>
            ) : (
              <Button asChild className="mt-8 w-full" size="lg">
                <Link href="/login">Back to sign in</Link>
              </Button>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}

function InviteFact({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/9 bg-white/[0.045] px-4 py-3 backdrop-blur">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/8 text-white/65">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/35">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-white/85">{value}</p>
      </div>
    </div>
  );
}
