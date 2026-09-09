"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  Clock3,
  Copy,
  KeyRound,
  Link2,
  LoaderCircle,
  Mail,
  RefreshCcw,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { Badge, Button, Card, EmptyState, StatusPill } from "@/components/foodflow-ui";
import type {
  CreatedTeamInvitation,
  ManagedInvitationView,
  TeamInvitationWorkspace,
} from "@/modules/team-access/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

function errorMessage(code: string): string {
  if (code === "TEAM_ACCESS_FORBIDDEN") return "Your role cannot create team invitations.";
  if (code === "TEAM_ACCESS_INVALID_INPUT") return "Check the invite details and try again.";
  if (code === "TEAM_ACCESS_CONFLICT") return "This person already has matching access or another change won the race.";
  if (code === "TEAM_ACCESS_NOT_FOUND") return "This invitation no longer exists.";
  return "Invitation management is temporarily unavailable.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    throw new Error(errorMessage(body.ok ? "TEAM_ACCESS_UNAVAILABLE" : body.error.code));
  }
  return body.data;
}

function statusTone(status: ManagedInvitationView["status"]): "success" | "warning" | "danger" | "neutral" {
  if (status === "ACCEPTED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REVOKED") return "danger";
  return "neutral";
}

function relativeExpiry(value: string): string {
  const milliseconds = Date.parse(value) - Date.now();
  if (milliseconds <= 0) return "Expired";
  const hours = Math.ceil(milliseconds / (60 * 60 * 1000));
  if (hours < 24) return `${hours}h left`;
  return `${Math.ceil(hours / 24)}d left`;
}

export function DurableTeamInviteDock() {
  const [open, setOpen] = useState(false);
  const [workspace, setWorkspace] = useState<TeamInvitationWorkspace | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [scope, setScope] = useState<"TENANT" | "BRANCH">("BRANCH");
  const [branchId, setBranchId] = useState("");
  const [expiresInHours, setExpiresInHours] = useState(72);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/internal/management/team/invitations", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const next = await readApi<TeamInvitationWorkspace>(response);
      setWorkspace(next);
      setRoleId((current) => current || next.roles[0]?.id || "");
      setBranchId((current) => current || next.branches[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Invitations are unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || workspace || loading) return;
    void load();
  }, [load, loading, open, workspace]);

  const pendingInvitations = useMemo(
    () => workspace?.invitations.filter((invitation) => invitation.status === "PENDING") ?? [],
    [workspace?.invitations],
  );

  async function createInvitation() {
    if (!email.trim() || !displayName.trim() || !roleId || creating) return;
    if (scope === "BRANCH" && !branchId) return;
    setCreating(true);
    setError(null);
    setCreatedLink(null);
    setCopied(false);
    try {
      const response = await fetch("/api/internal/management/team/invitations", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          displayName,
          roleId,
          branchId: scope === "BRANCH" ? branchId : null,
          expiresInHours,
        }),
      });
      const created = await readApi<CreatedTeamInvitation>(response);
      setWorkspace((current) =>
        current
          ? {
              ...current,
              invitations: [created.invitation, ...current.invitations.filter((item) => item.id !== created.invitation.id)],
            }
          : current,
      );
      setCreatedLink(`${window.location.origin}/invite/${created.token}`);
      setEmail("");
      setDisplayName("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Invitation could not be created.");
    } finally {
      setCreating(false);
    }
  }

  async function copyLink() {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(createdLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed. Select the invitation link manually.");
    }
  }

  async function revokeInvitation(invitationId: string) {
    if (pendingId) return;
    setPendingId(invitationId);
    setError(null);
    try {
      const response = await fetch(
        `/api/internal/management/team/invitations/${encodeURIComponent(invitationId)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );
      const updated = await readApi<ManagedInvitationView>(response);
      setWorkspace((current) =>
        current
          ? {
              ...current,
              invitations: current.invitations.map((item) => item.id === updated.id ? updated : item),
            }
          : current,
      );
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Invitation could not be revoked.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-[5.25rem] z-[55] inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-foreground px-4 text-xs font-semibold text-background shadow-[0_18px_60px_rgb(0_0_0/0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgb(0_0_0/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-6"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        Invite person
        {pendingInvitations.length ? (
          <span className="grid min-w-5 place-items-center rounded-full bg-background/12 px-1 text-[9px] leading-5">
            {pendingInvitations.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] bg-zinc-950/45 p-3 backdrop-blur-sm sm:p-5" role="dialog" aria-modal="true" aria-label="Invite team member">
          <div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-background shadow-[0_40px_140px_rgb(0_0_0/0.38)]">
            <header className="flex items-start justify-between gap-4 border-b border-border bg-foreground px-5 py-5 text-background sm:px-7 sm:py-6">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-background/45">
                  <ShieldCheck className="size-3.5" /> One-time access
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em]">Invite someone into the flow.</h2>
                <p className="mt-2 max-w-lg text-xs leading-5 text-background/55">
                  Create one bounded invitation for a specific role and scope. FLOW stores only the token digest.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-background/10 bg-background/5 text-background/65 transition hover:bg-background/10 hover:text-background"
                aria-label="Close invitation studio"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {error ? (
                <div className="mb-5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs font-semibold text-destructive">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="grid min-h-[360px] place-items-center">
                  <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : workspace ? (
                <div className="grid gap-7">
                  <section>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">New invitation</p>
                        <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">Identity, role and scope</h3>
                      </div>
                      <StatusPill tone="success" dot>Durable authority</StatusPill>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Display name" icon={<UserPlus className="size-3.5" />}>
                        <input className={inputClass} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Narin K." />
                      </Field>
                      <Field label="Email" icon={<Mail className="size-3.5" />}>
                        <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="narin@restaurant.com" autoComplete="off" />
                      </Field>
                      <Field label="Role" icon={<KeyRound className="size-3.5" />}>
                        <select className={inputClass} value={roleId} onChange={(event) => setRoleId(event.target.value)}>
                          {workspace.roles.map((role) => <option key={role.id} value={role.id}>{role.name} · {role.code}</option>)}
                        </select>
                      </Field>
                      <Field label="Authority scope" icon={<Building2 className="size-3.5" />}>
                        <select className={inputClass} value={scope} onChange={(event) => setScope(event.target.value as "TENANT" | "BRANCH")}>
                          <option value="BRANCH">One branch</option>
                          <option value="TENANT">Tenant-wide</option>
                        </select>
                      </Field>
                      {scope === "BRANCH" ? (
                        <Field label="Branch" icon={<Building2 className="size-3.5" />}>
                          <select className={inputClass} value={branchId} onChange={(event) => setBranchId(event.target.value)}>
                            {workspace.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} · {branch.code}</option>)}
                          </select>
                        </Field>
                      ) : (
                        <div className="rounded-2xl border border-border bg-muted/35 p-4">
                          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">Tenant-wide</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">Use only for roles that intentionally span every branch.</p>
                        </div>
                      )}
                      <Field label="Invitation lifetime" icon={<Clock3 className="size-3.5" />}>
                        <select className={inputClass} value={expiresInHours} onChange={(event) => setExpiresInHours(Number(event.target.value))}>
                          <option value={24}>24 hours</option>
                          <option value={72}>3 days</option>
                          <option value={168}>7 days</option>
                          <option value={336}>14 days</option>
                        </select>
                      </Field>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <p className="max-w-md text-xs leading-5 text-muted-foreground">
                          Reissuing an invite to the same email revokes the previous pending link. The raw token is returned once and never stored.
                        </p>
                      </div>
                      <Button
                        disabled={creating || !displayName.trim() || !email.trim() || !roleId || (scope === "BRANCH" && !branchId)}
                        onClick={() => void createInvitation()}
                        leftIcon={creating ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                      >
                        Create invitation
                      </Button>
                    </div>
                  </section>

                  {createdLink ? (
                    <section className="overflow-hidden rounded-[1.6rem] border border-foreground/15 bg-foreground text-background shadow-[0_20px_70px_rgb(0_0_0/0.14)]">
                      <div className="p-5 sm:p-6">
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-background/45">
                          <Link2 className="size-3.5" /> One-time invitation link
                        </div>
                        <p className="mt-2 text-sm font-semibold">Copy this link now.</p>
                        <p className="mt-1 text-xs leading-5 text-background/55">FLOW cannot recover the raw token after this response. Reissue the invitation if the link is lost.</p>
                        <div className="mt-4 flex gap-2 rounded-xl border border-background/10 bg-background/5 p-2">
                          <input readOnly value={createdLink} className="min-w-0 flex-1 bg-transparent px-2 text-xs text-background/75 outline-none" aria-label="Invitation link" />
                          <Button className="bg-background text-foreground hover:bg-background/90" size="sm" onClick={() => void copyLink()} leftIcon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}>
                            {copied ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </div>
                    </section>
                  ) : null}

                  <section>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Invitation ledger</p>
                        <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">Recent invitations</h3>
                      </div>
                      <Button variant="outline" size="sm" disabled={loading} onClick={() => void load()} leftIcon={<RefreshCcw className="size-3.5" />}>Refresh</Button>
                    </div>

                    {workspace.invitations.length ? (
                      <div className="mt-4 grid gap-2">
                        {workspace.invitations.slice(0, 20).map((invitation) => (
                          <Card key={invitation.id} className="rounded-2xl border-border/80 p-4 shadow-[0_12px_35px_rgb(0_0_0/0.025)]">
                            <div className="flex items-start gap-3">
                              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Mail className="size-4" /></span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate font-semibold">{invitation.displayName}</p>
                                  <Badge tone={statusTone(invitation.status)}>{invitation.status.toLowerCase()}</Badge>
                                </div>
                                <p className="mt-1 truncate text-xs text-muted-foreground">{invitation.email}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-muted-foreground">
                                  <span>{invitation.roleName}</span>
                                  <span>{invitation.branchName ?? "Tenant-wide"}</span>
                                  {invitation.status === "PENDING" ? <span>{relativeExpiry(invitation.expiresAt)}</span> : null}
                                </div>
                              </div>
                              {invitation.status === "PENDING" ? (
                                <button type="button" disabled={Boolean(pendingId)} onClick={() => void revokeInvitation(invitation.id)} className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:border-destructive/25 hover:bg-destructive/5 hover:text-destructive disabled:opacity-50" aria-label={`Revoke invitation for ${invitation.displayName}`}>
                                  {pendingId === invitation.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                </button>
                              ) : null}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4"><EmptyState icon={<Mail className="size-5" />} title="No invitations yet" description="Create a bounded invitation when a new team member joins." /></div>
                    )}
                  </section>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";

function Field({
  label,
  icon,
  children,
}: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{icon}{label}</span>
      {children}
    </label>
  );
}
