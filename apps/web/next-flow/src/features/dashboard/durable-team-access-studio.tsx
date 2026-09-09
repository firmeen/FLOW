"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  SectionHeading,
  StatusPill,
} from "@/components/foodflow-ui";
import type {
  ManagedRoleView,
  ManagedTeamMember,
  TeamAccessSnapshot,
} from "@/modules/team-access/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };
type View = "team" | "roles";

type RoleEditor = {
  readonly id: string;
  name: string;
  permissionCodes: string[];
};

type MemberEditor = {
  readonly membershipId: string;
  roleId: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
};

const permissionGroups = [
  {
    title: "Workspace access",
    helper: "Who can enter each operating surface.",
    prefixes: ["operations.", "management."],
  },
  {
    title: "Orders & service",
    helper: "Order decisions, lifecycle and guest service.",
    prefixes: ["order.", "service."],
  },
  {
    title: "Kitchen & payments",
    helper: "Production control and merchant collection authority.",
    prefixes: ["kitchen.", "merchant_payment."],
  },
  {
    title: "Catalog & settings",
    helper: "Menu publishing and branch operating policy.",
    prefixes: ["menu.", "settings."],
  },
  {
    title: "People & governance",
    helper: "Membership, role and audit visibility.",
    prefixes: ["member.", "role.", "audit."],
  },
] as const;

function teamErrorMessage(code: string): string {
  if (code === "TEAM_ACCESS_FORBIDDEN") return "This workspace does not have team governance permission.";
  if (code === "TEAM_ACCESS_INVALID_INPUT") return "One or more access settings are invalid.";
  if (code === "TEAM_ACCESS_NOT_FOUND") return "This member or role no longer exists.";
  if (code === "TEAM_ACCESS_CONFLICT") return "This access record changed while you were editing it. Refresh and try again.";
  if (code === "TEAM_ACCESS_SELF_LOCKOUT") return "You cannot remove or replace your own active authority from this workspace.";
  if (code === "TEAM_ACCESS_SYSTEM_ROLE") return "System roles are protected from direct editing.";
  return "Team access is temporarily unavailable.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    throw new Error(teamErrorMessage(body.ok ? "TEAM_ACCESS_UNAVAILABLE" : body.error.code));
  }
  return body.data;
}

function statusTone(status: ManagedTeamMember["membershipStatus"]): "success" | "warning" | "danger" | "neutral" {
  if (status === "ACTIVE") return "success";
  if (status === "INVITED") return "warning";
  if (status === "REVOKED") return "danger";
  return "neutral";
}

function permissionTitle(code: string): string {
  return code
    .replaceAll("_", " ")
    .split(".")
    .map((part) => part.replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(" · ");
}

export function DurableTeamAccessStudio() {
  const [snapshot, setSnapshot] = useState<TeamAccessSnapshot | null>(null);
  const [view, setView] = useState<View>("team");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [memberEditor, setMemberEditor] = useState<MemberEditor | null>(null);
  const [roleEditor, setRoleEditor] = useState<RoleEditor | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/team", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const next = await readApi<TeamAccessSnapshot>(response);
      setSnapshot(next);
      setError(null);
      setSelectedMemberId((current) =>
        current && next.members.some((member) => member.membershipId === current)
          ? current
          : next.members.find((member) => member.membershipStatus === "ACTIVE")?.membershipId ??
            next.members[0]?.membershipId ??
            null,
      );
      setSelectedRoleId((current) =>
        current && next.roles.some((role) => role.id === current)
          ? current
          : next.roles[0]?.id ?? null,
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Team access is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedMember = useMemo(
    () => snapshot?.members.find((member) => member.membershipId === selectedMemberId) ?? null,
    [selectedMemberId, snapshot?.members],
  );
  const selectedRole = useMemo(
    () => snapshot?.roles.find((role) => role.id === selectedRoleId) ?? null,
    [selectedRoleId, snapshot?.roles],
  );

  useEffect(() => {
    if (!selectedMember) {
      setMemberEditor(null);
      return;
    }
    setMemberEditor({
      membershipId: selectedMember.membershipId,
      roleId: selectedMember.roleId,
      status:
        selectedMember.membershipStatus === "INVITED"
          ? "ACTIVE"
          : selectedMember.membershipStatus,
    });
  }, [selectedMember]);

  useEffect(() => {
    setRoleEditor(
      selectedRole
        ? {
            id: selectedRole.id,
            name: selectedRole.name,
            permissionCodes: [...selectedRole.permissionCodes],
          }
        : null,
    );
  }, [selectedRole]);

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return snapshot?.members ?? [];
    return (snapshot?.members ?? []).filter((member) =>
      `${member.displayName} ${member.email ?? ""} ${member.roleName} ${member.branchName ?? ""}`
        .toLocaleLowerCase()
        .includes(term),
    );
  }, [search, snapshot?.members]);

  const activeMembers = snapshot?.members.filter((member) => member.membershipStatus === "ACTIVE").length ?? 0;
  const tenantWideMembers = snapshot?.members.filter((member) => member.authorityScope === "TENANT" && member.membershipStatus === "ACTIVE").length ?? 0;
  const branchMembers = snapshot?.members.filter((member) => member.authorityScope === "BRANCH" && member.membershipStatus === "ACTIVE").length ?? 0;
  const customRoles = snapshot?.roles.filter((role) => !role.system).length ?? 0;

  async function saveMember() {
    if (!selectedMember || !memberEditor || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/internal/management/team/members/${encodeURIComponent(selectedMember.membershipId)}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ roleId: memberEditor.roleId, status: memberEditor.status }),
        },
      );
      const updated = await readApi<ManagedTeamMember>(response);
      setSnapshot((current) =>
        current
          ? {
              ...current,
              members: current.members.map((member) =>
                member.membershipId === updated.membershipId ? updated : member,
              ),
            }
          : current,
      );
      setNotice(`${updated.displayName} access saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Member access could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function saveRole() {
    if (!selectedRole || !roleEditor || selectedRole.system || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `/api/internal/management/team/roles/${encodeURIComponent(selectedRole.id)}`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            name: roleEditor.name,
            permissionCodes: roleEditor.permissionCodes,
          }),
        },
      );
      const updated = await readApi<ManagedRoleView>(response);
      setSnapshot((current) =>
        current
          ? {
              ...current,
              roles: current.roles.map((role) => (role.id === updated.id ? updated : role)),
              members: current.members.map((member) =>
                member.roleId === updated.id
                  ? { ...member, roleName: updated.name, roleCode: updated.code }
                  : member,
              ),
            }
          : current,
      );
      setNotice(`${updated.name} role saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Role could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function createRole() {
    if (!newRoleName.trim() || !newRoleCode.trim() || creating) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/internal/management/team/roles", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoleName,
          code: newRoleCode,
          permissionCodes: newRolePermissions,
        }),
      });
      const created = await readApi<ManagedRoleView>(response);
      setSnapshot((current) =>
        current ? { ...current, roles: [...current.roles, created] } : current,
      );
      setSelectedRoleId(created.id);
      setNewRoleName("");
      setNewRoleCode("");
      setNewRolePermissions([]);
      setView("roles");
      setNotice(`${created.name} role created.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Role could not be created.");
    } finally {
      setCreating(false);
    }
  }

  function toggleRolePermission(code: string) {
    if (!roleEditor) return;
    setRoleEditor({
      ...roleEditor,
      permissionCodes: roleEditor.permissionCodes.includes(code)
        ? roleEditor.permissionCodes.filter((permission) => permission !== code)
        : [...roleEditor.permissionCodes, code],
    });
  }

  function toggleNewPermission(code: string) {
    setNewRolePermissions((current) =>
      current.includes(code)
        ? current.filter((permission) => permission !== code)
        : [...current, code],
    );
  }

  return (
    <OperationalShell
      title="Team & access"
      subtitle="Durable membership and role governance"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Overview", href: "/admin", icon: ArrowLeft, active: false },
        { label: "Team & access", href: "/admin/team", icon: UsersRound, active: true },
      ]}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusPill tone="success" dot>Identity authority</StatusPill>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => void load(true)}
            leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-[1500px] pb-20">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-20 -top-28 size-80 rounded-full bg-background/[0.055] blur-3xl" />
          <div className="relative grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55">
                <ShieldCheck className="size-3.5" /> Access governance
              </div>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl lg:text-5xl">
                Give every person exactly the authority their work requires.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">
                Membership scope, operational roles and permission sets are persisted as tenant identity state—separate from browser UI state.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[520px]">
              <HeroMetric label="Active" value={activeMembers} />
              <HeroMetric label="Tenant" value={tenantWideMembers} />
              <HeroMetric label="Branch" value={branchMembers} />
              <HeroMetric label="Custom roles" value={customRoles} />
            </div>
          </div>
        </section>

        {notice ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-lg" role="status">
            <Check className="size-4" /> {notice}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-[0_14px_45px_rgb(0_0_0/0.025)]">
          <StudioTab active={view === "team"} onClick={() => setView("team")} icon={<UsersRound className="size-4" />} label="Team directory" helper={`${snapshot?.members.length ?? 0} memberships`} />
          <StudioTab active={view === "roles"} onClick={() => setView("roles")} icon={<KeyRound className="size-4" />} label="Roles & permissions" helper={`${snapshot?.roles.length ?? 0} roles`} />
        </div>

        {loading ? (
          <div className="grid min-h-[500px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div>
        ) : view === "team" ? (
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(420px,.86fr)_minmax(520px,1.14fr)]">
            <section>
              <SectionHeading eyebrow="People" title="Membership directory" description="Tenant and branch memberships with durable role assignment." />
              <label className="relative mt-4 block">
                <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member, role or branch" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-foreground/30 focus:ring-2 focus:ring-ring/15" />
              </label>
              {filteredMembers.length ? (
                <div className="mt-3 grid max-h-[720px] gap-2 overflow-y-auto pr-1">
                  {filteredMembers.map((member) => (
                    <button key={member.membershipId} type="button" onClick={() => setSelectedMemberId(member.membershipId)} className={`rounded-2xl border p-4 text-left transition ${selectedMemberId === member.membershipId ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"}`}>
                      <div className="flex items-start gap-3">
                        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${selectedMemberId === member.membershipId ? "bg-background/10" : "bg-muted"}`}><UserRound className="size-4" /></span>
                        <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{member.displayName}</p><p className={`mt-1 truncate text-xs ${selectedMemberId === member.membershipId ? "text-background/55" : "text-muted-foreground"}`}>{member.email ?? "No email"}</p></div><ChevronRight className={`mt-1 size-4 shrink-0 ${selectedMemberId === member.membershipId ? "text-background/50" : "text-muted-foreground"}`} /></div><div className="mt-3 flex flex-wrap items-center gap-2"><Badge tone={statusTone(member.membershipStatus)}>{member.membershipStatus.toLowerCase()}</Badge><span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${selectedMemberId === member.membershipId ? "text-background/55" : "text-muted-foreground"}`}>{member.roleName}</span></div></div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : <div className="mt-4"><EmptyState icon={<UsersRound className="size-5" />} title="No matching members" description="Change the search term." /></div>}
            </section>

            <section>
              <SectionHeading eyebrow="Authority" title={selectedMember?.displayName ?? "Select a member"} description={selectedMember ? `${selectedMember.roleName} · ${selectedMember.authorityScope === "TENANT" ? "Tenant-wide" : selectedMember.branchName ?? "Branch-scoped"}` : "Choose a membership to manage durable access."} />
              {selectedMember && memberEditor ? (
                <Card className="mt-4 overflow-hidden rounded-[1.8rem] border-border p-0 shadow-[0_24px_80px_rgb(0_0_0/0.055)]">
                  <div className="grid gap-px bg-border sm:grid-cols-3"><MemberSummary icon={<BadgeCheck className="size-4" />} label="Role" value={selectedMember.roleName} /><MemberSummary icon={<Building2 className="size-4" />} label="Scope" value={selectedMember.authorityScope === "TENANT" ? "Tenant-wide" : selectedMember.branchName ?? "Branch"} /><MemberSummary icon={<LockKeyhole className="size-4" />} label="Status" value={selectedMember.membershipStatus.toLowerCase()} /></div>
                  <div className="grid gap-5 p-5 sm:p-6">
                    <Field label="Assigned role"><select value={memberEditor.roleId} onChange={(event) => setMemberEditor({ ...memberEditor, roleId: event.target.value })} className={inputClass}>{snapshot?.roles.map((role) => <option key={role.id} value={role.id}>{role.name} · {role.code}</option>)}</select></Field>
                    <Field label="Membership status"><select value={memberEditor.status} onChange={(event) => setMemberEditor({ ...memberEditor, status: event.target.value as MemberEditor["status"] })} className={inputClass}><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option><option value="REVOKED">Revoked</option></select></Field>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="text-sm font-semibold">Scope is membership-owned</p><p className="mt-1 text-xs leading-5 text-muted-foreground">This editor changes role and membership lifecycle only. Tenant-versus-branch scope remains attached to the membership record and is not silently widened.</p></div></div></div>
                    <div className="flex justify-end border-t border-border pt-5"><Button disabled={saving} onClick={() => void saveMember()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}>Save member access</Button></div>
                  </div>
                </Card>
              ) : <div className="mt-4"><EmptyState icon={<UserRound className="size-5" />} title="Select a member" description="Member authority will appear here." /></div>}
            </section>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(380px,.75fr)_minmax(620px,1.25fr)]">
            <section>
              <SectionHeading eyebrow="Roles" title="Authority profiles" description="Reusable tenant roles with explicit permission sets." />
              <div className="mt-4 grid gap-2">
                {(snapshot?.roles ?? []).map((role) => (
                  <button key={role.id} type="button" onClick={() => setSelectedRoleId(role.id)} className={`rounded-2xl border p-4 text-left transition ${selectedRoleId === role.id ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20"}`}>
                    <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className={`grid size-10 place-items-center rounded-xl ${selectedRoleId === role.id ? "bg-background/10" : "bg-muted"}`}><KeyRound className="size-4" /></span><div><p className="font-semibold">{role.name}</p><p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.1em] ${selectedRoleId === role.id ? "text-background/50" : "text-muted-foreground"}`}>{role.code}</p></div></div><Badge tone={role.system ? "neutral" : "success"}>{role.system ? "system" : "custom"}</Badge></div>
                    <div className={`mt-3 flex items-center justify-between text-xs ${selectedRoleId === role.id ? "text-background/55" : "text-muted-foreground"}`}><span>{role.permissionCodes.length} permissions</span><span>{role.memberCount} members</span></div>
                  </button>
                ))}
              </div>

              <Card className="mt-5 rounded-[1.6rem] border-border p-5 shadow-[0_18px_55px_rgb(0_0_0/0.035)]">
                <SectionHeading eyebrow="Create" title="New custom role" description="Start narrow, then add only required permissions." />
                <div className="mt-4 grid gap-3"><Field label="Role name"><input value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} className={inputClass} placeholder="Floor Supervisor" /></Field><Field label="Role code"><input value={newRoleCode} onChange={(event) => setNewRoleCode(event.target.value.toUpperCase().replace(/[\s-]+/g, "_"))} className={inputClass} placeholder="FLOOR_SUPERVISOR" /></Field></div>
                <div className="mt-4"><PermissionPicker selected={newRolePermissions} onToggle={toggleNewPermission} snapshot={snapshot} compact /></div>
                <Button className="mt-4 w-full" disabled={creating || !newRoleName.trim() || !newRoleCode.trim()} onClick={() => void createRole()} leftIcon={creating ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}>Create durable role</Button>
              </Card>
            </section>

            <section>
              <SectionHeading eyebrow="Permissions" title={selectedRole?.name ?? "Select a role"} description={selectedRole ? `${selectedRole.code} · ${selectedRole.memberCount} assigned memberships` : "Choose a role to inspect its authority."} />
              {selectedRole && roleEditor ? (
                <Card className="mt-4 overflow-hidden rounded-[1.8rem] border-border p-0 shadow-[0_24px_80px_rgb(0_0_0/0.055)]">
                  <div className="flex flex-col gap-4 border-b border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><p className="font-semibold">Role authority</p>{selectedRole.system ? <Badge tone="neutral">Protected system role</Badge> : <Badge tone="success">Editable custom role</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">Permission changes are replaced atomically inside one authorized transaction.</p></div><span className="text-3xl font-semibold tracking-[-0.05em]">{roleEditor.permissionCodes.length}</span></div>
                  <div className="grid gap-5 p-5 sm:p-6"><Field label="Role name"><input disabled={selectedRole.system} value={roleEditor.name} onChange={(event) => setRoleEditor({ ...roleEditor, name: event.target.value })} className={inputClass} /></Field><PermissionPicker selected={roleEditor.permissionCodes} onToggle={toggleRolePermission} snapshot={snapshot} disabled={selectedRole.system} />{selectedRole.system ? <div className="rounded-2xl border border-border bg-muted/35 p-4 text-xs leading-5 text-muted-foreground">System roles are intentionally read-only here. Create a custom role when the business needs a different permission profile.</div> : <div className="flex justify-end border-t border-border pt-5"><Button disabled={saving} onClick={() => void saveRole()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}>Save role authority</Button></div>}</div>
                </Card>
              ) : <div className="mt-4"><EmptyState icon={<KeyRound className="size-5" />} title="Select a role" description="Role permissions will appear here." /></div>}
            </section>
          </div>
        )}
      </div>
    </OperationalShell>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-45 focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</span>{children}</label>;
}

function HeroMetric({ label, value }: { readonly label: string; readonly value: number }) {
  return <div className="rounded-2xl border border-background/10 bg-background/[0.055] px-4 py-3 backdrop-blur"><p className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-50">{label}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{value}</p></div>;
}

function MemberSummary({ icon, label, value }: { readonly icon: React.ReactNode; readonly label: string; readonly value: string }) {
  return <div className="bg-card px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-muted">{icon}</span><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 truncate font-semibold capitalize">{value}</p></div></div></div>;
}

function StudioTab({ active, onClick, icon, label, helper }: { readonly active: boolean; readonly onClick: () => void; readonly icon: React.ReactNode; readonly label: string; readonly helper: string }) {
  return <button type="button" onClick={onClick} className={`flex min-w-[230px] flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition ${active ? "bg-foreground text-background shadow-lg" : "hover:bg-muted"}`}><span className={`grid size-9 place-items-center rounded-xl ${active ? "bg-background/10" : "bg-muted"}`}>{icon}</span><span><span className="block text-sm font-semibold">{label}</span><span className={`mt-0.5 block text-[10px] ${active ? "text-background/55" : "text-muted-foreground"}`}>{helper}</span></span></button>;
}

function PermissionPicker({ selected, onToggle, snapshot, disabled = false, compact = false }: { readonly selected: readonly string[]; readonly onToggle: (code: string) => void; readonly snapshot: TeamAccessSnapshot | null; readonly disabled?: boolean; readonly compact?: boolean }) {
  return <div className={`grid gap-3 ${compact ? "max-h-64 overflow-y-auto pr-1" : ""}`}>{permissionGroups.map((group) => {
    const permissions = (snapshot?.permissions ?? []).filter((permission) => group.prefixes.some((prefix) => permission.code.startsWith(prefix)));
    if (!permissions.length) return null;
    return <section key={group.title} className="rounded-2xl border border-border bg-muted/25 p-4"><div><p className="text-sm font-semibold">{group.title}</p>{compact ? null : <p className="mt-1 text-xs text-muted-foreground">{group.helper}</p>}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{permissions.map((permission) => <label key={permission.code} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${selected.includes(permission.code) ? "border-foreground/20 bg-background" : "border-transparent hover:bg-background/60"} ${disabled ? "cursor-not-allowed opacity-55" : ""}`}><input type="checkbox" disabled={disabled} checked={selected.includes(permission.code)} onChange={() => onToggle(permission.code)} className="mt-0.5 size-4 rounded border-border" /><span><span className="block text-xs font-semibold">{permissionTitle(permission.code)}</span>{compact ? null : <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">{permission.description ?? permission.code}</span>}</span></label>)}</div></section>;
  })}</div>;
}
