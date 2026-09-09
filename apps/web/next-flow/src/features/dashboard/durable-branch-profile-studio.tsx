"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Save,
  Store,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import type {
  ManagedBranchProfile,
  ManagementBranchesSnapshot,
} from "@/modules/management-branches/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

type Editor = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  city: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  email: string;
};

function toEditor(branch: ManagedBranchProfile): Editor {
  return {
    name: branch.name,
    addressLine1: branch.addressLine1 ?? "",
    addressLine2: branch.addressLine2 ?? "",
    district: branch.district ?? "",
    city: branch.city ?? "",
    postalCode: branch.postalCode ?? "",
    countryCode: branch.countryCode ?? "TH",
    phone: branch.phone ?? "",
    email: branch.email ?? "",
  };
}

async function readApi<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !payload.ok) {
    const code = payload.ok ? "MANAGEMENT_BRANCHES_UNAVAILABLE" : payload.error.code;
    if (code === "MANAGEMENT_BRANCHES_FORBIDDEN") throw new Error("This workspace cannot manage branch profiles.");
    if (code === "MANAGEMENT_BRANCHES_INVALID_INPUT") throw new Error("One or more branch fields are invalid.");
    if (code === "MANAGEMENT_BRANCHES_CONFLICT") throw new Error("This branch changed while you were editing it. Refresh and try again.");
    throw new Error("Branch profiles are temporarily unavailable.");
  }
  return payload.data;
}

export function DurableBranchProfileStudio() {
  const [snapshot, setSnapshot] = useState<ManagementBranchesSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/branches", { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } });
      const next = await readApi<ManagementBranchesSnapshot>(response);
      setSnapshot(next);
      setError(null);
      setSelectedId((current) => current && next.branches.some((branch) => branch.id === current) ? current : next.branches[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Branch profiles are unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => snapshot?.branches.find((branch) => branch.id === selectedId) ?? null, [selectedId, snapshot?.branches]);
  useEffect(() => { setEditor(selected ? toEditor(selected) : null); }, [selected]);

  async function save() {
    if (!selected || !editor || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/internal/management/branches/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editor.name,
          addressLine1: editor.addressLine1 || null,
          addressLine2: editor.addressLine2 || null,
          district: editor.district || null,
          city: editor.city || null,
          postalCode: editor.postalCode || null,
          countryCode: editor.countryCode || null,
          phone: editor.phone || null,
          email: editor.email || null,
        }),
      });
      const updated = await readApi<ManagedBranchProfile>(response);
      setSnapshot((current) => current ? { ...current, branches: current.branches.map((branch) => branch.id === updated.id ? updated : branch) } : current);
      setEditor(toEditor(updated));
      setNotice(`${updated.name} profile saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Branch profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalShell
      title="Branch profiles"
      subtitle="Durable location identity and contact details"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Overview", href: "/admin", icon: ArrowLeft, active: false },
        { label: "Branches", href: "/admin/branches", icon: Building2, active: true },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Database authority</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.05] blur-3xl" />
          <div className="relative"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><MapPin className="size-3.5" /> Location identity</div><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Keep every branch recognizable, reachable and operationally precise.</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">Branch identity, location and contact details are persisted once and shared across owner operations.</p></div>
        </section>

        {notice ? <div className="mt-4 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background"><Check className="size-4" />{notice}</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</div> : null}

        {loading ? <div className="grid min-h-[460px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : snapshot?.branches.length ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-[330px_1fr]">
            <aside><SectionHeading eyebrow="Network" title="Branches" description="Choose the branch profile to edit." /><div className="mt-4 grid gap-2">{snapshot.branches.map((branch) => <button key={branch.id} type="button" onClick={() => setSelectedId(branch.id)} className={`rounded-2xl border p-4 text-left transition ${selectedId === branch.id ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20"}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${selectedId === branch.id ? "bg-background/10" : "bg-muted"}`}><Store className="size-4" /></span><div><p className="font-semibold">{branch.name}</p><p className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${selectedId === branch.id ? "text-background/55" : "text-muted-foreground"}`}>{branch.code} · {branch.city ?? "Location pending"}</p></div></div><Badge tone={branch.isOpen ? "success" : "neutral"}>{branch.isOpen ? "open" : "closed"}</Badge></div></button>)}</div></aside>

            {selected && editor ? <section><SectionHeading eyebrow="Profile" title={selected.name} description={`${selected.restaurantName} · ${selected.code}`} /><Card className="mt-4 rounded-[1.8rem] border-border p-5 shadow-[0_24px_80px_rgb(0_0_0/0.05)] sm:p-6"><div className="grid gap-5"><Field label="Branch name"><input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} className={inputClass} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Address line 1"><input value={editor.addressLine1} onChange={(event) => setEditor({ ...editor, addressLine1: event.target.value })} className={inputClass} /></Field><Field label="Address line 2"><input value={editor.addressLine2} onChange={(event) => setEditor({ ...editor, addressLine2: event.target.value })} className={inputClass} /></Field></div><div className="grid gap-4 sm:grid-cols-4"><Field label="District"><input value={editor.district} onChange={(event) => setEditor({ ...editor, district: event.target.value })} className={inputClass} /></Field><Field label="City"><input value={editor.city} onChange={(event) => setEditor({ ...editor, city: event.target.value })} className={inputClass} /></Field><Field label="Postal code"><input value={editor.postalCode} onChange={(event) => setEditor({ ...editor, postalCode: event.target.value })} className={inputClass} /></Field><Field label="Country"><input maxLength={2} value={editor.countryCode} onChange={(event) => setEditor({ ...editor, countryCode: event.target.value.toUpperCase() })} className={inputClass} /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Phone"><div className="relative"><Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={editor.phone} onChange={(event) => setEditor({ ...editor, phone: event.target.value })} className={`${inputClass} pl-10`} /></div></Field><Field label="Email"><div className="relative"><Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input inputMode="email" value={editor.email} onChange={(event) => setEditor({ ...editor, email: event.target.value })} className={`${inputClass} pl-10`} /></div></Field></div><div className="flex justify-end border-t border-border pt-5"><Button disabled={saving} onClick={() => void save()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}>Save branch profile</Button></div></div></Card></section> : null}
          </div>
        ) : <div className="mt-6"><EmptyState icon={<Building2 className="size-5" />} title="No branches" description="No branch profiles are available for this tenant." /></div>}
      </div>
    </OperationalShell>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";
function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</span>{children}</label>; }
