"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock3,
  LoaderCircle,
  Percent,
  RefreshCcw,
  Save,
  Settings2,
  ShieldCheck,
  Store,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import type {
  ManagedBranchSettings,
  ManagementSettingsSnapshot,
  UpdateManagedBranchSettingsInput,
} from "@/modules/management-settings/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

type Editor = {
  isOpen: boolean;
  serviceChargeEnabled: boolean;
  serviceChargePercent: string;
  vatEnabled: boolean;
  vatPercent: string;
  defaultPreparationMinutes: string;
};

function toEditor(branch: ManagedBranchSettings): Editor {
  return {
    isOpen: branch.isOpen,
    serviceChargeEnabled: branch.serviceChargeEnabled,
    serviceChargePercent: (branch.serviceChargeBps / 100).toFixed(2),
    vatEnabled: branch.vatEnabled,
    vatPercent: (branch.vatBps / 100).toFixed(2),
    defaultPreparationMinutes: branch.defaultPreparationMinutes.toString(),
  };
}

function errorMessage(code: string): string {
  if (code === "MANAGEMENT_SETTINGS_FORBIDDEN") return "This workspace does not have settings permission.";
  if (code === "MANAGEMENT_SETTINGS_INVALID_INPUT") return "One or more settings are invalid.";
  if (code === "MANAGEMENT_SETTINGS_CONFLICT") return "These settings changed while you were editing. Refresh and try again.";
  if (code === "MANAGEMENT_SETTINGS_NOT_FOUND") return "This branch is no longer available.";
  return "Management settings are temporarily unavailable.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) throw new Error(errorMessage(body.ok ? "MANAGEMENT_SETTINGS_UNAVAILABLE" : body.error.code));
  return body.data;
}

export function DurableSettingsStudio() {
  const [snapshot, setSnapshot] = useState<ManagementSettingsSnapshot | null>(null);
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
      const response = await fetch("/api/internal/management/settings", { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } });
      const next = await readApi<ManagementSettingsSnapshot>(response);
      setSnapshot(next);
      setError(null);
      setSelectedId((current) => current && next.branches.some((branch) => branch.branchId === current) ? current : next.branches[0]?.branchId ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Management settings are unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const selected = useMemo(() => snapshot?.branches.find((branch) => branch.branchId === selectedId) ?? null, [selectedId, snapshot?.branches]);
  useEffect(() => { setEditor(selected ? toEditor(selected) : null); }, [selected]);

  async function save() {
    if (!selected || !editor || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const serviceCharge = Number(editor.serviceChargePercent);
      const vat = Number(editor.vatPercent);
      const prep = Number(editor.defaultPreparationMinutes);
      const payload: UpdateManagedBranchSettingsInput = {
        isOpen: editor.isOpen,
        serviceChargeEnabled: editor.serviceChargeEnabled,
        serviceChargeBps: Math.max(0, Math.min(10000, Math.round(serviceCharge * 100))),
        vatEnabled: editor.vatEnabled,
        vatBps: Math.max(0, Math.min(10000, Math.round(vat * 100))),
        defaultPreparationMinutes: Math.max(0, Math.round(prep)),
      };
      const response = await fetch(`/api/internal/management/settings/${encodeURIComponent(selected.branchId)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await readApi<ManagedBranchSettings>(response);
      setSnapshot((current) => current ? { ...current, branches: current.branches.map((branch) => branch.branchId === updated.branchId ? updated : branch) } : current);
      setEditor(toEditor(updated));
      setNotice(`${updated.branchName} settings saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalShell
      title="Operating settings"
      subtitle="Durable branch policy and charge configuration"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Overview", href: "/admin", icon: ArrowLeft, active: false },
        { label: "Settings", href: "/admin/settings", icon: Settings2, active: true },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Database authority</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.05] blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><ShieldCheck className="size-3.5" /> Operating policy</div><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Configure the rules that shape every bill and service promise.</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">Branch availability, service charge, VAT and preparation defaults are persisted as server-side operating policy.</p></div>
            <div className="rounded-2xl border border-background/10 bg-background/[0.055] px-5 py-4"><p className="text-[9px] font-bold uppercase tracking-[0.13em] opacity-50">Managed branches</p><p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{snapshot?.branches.length ?? 0}</p></div>
          </div>
        </section>

        {notice ? <div className="mt-4 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background"><Check className="size-4" />{notice}</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</div> : null}

        {loading ? <div className="grid min-h-[460px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : snapshot && snapshot.branches.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-[340px_1fr]">
            <aside>
              <SectionHeading eyebrow="Network" title="Branches" description="Choose the branch you want to configure." />
              <div className="mt-4 grid gap-2">
                {snapshot.branches.map((branch) => (
                  <button key={branch.branchId} type="button" onClick={() => setSelectedId(branch.branchId)} className={`rounded-2xl border p-4 text-left transition ${selectedId === branch.branchId ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20"}`}>
                    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${selectedId === branch.branchId ? "bg-background/10" : "bg-muted"}`}><Building2 className="size-4" /></span><div><p className="font-semibold">{branch.branchName}</p><p className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${selectedId === branch.branchId ? "text-background/55" : "text-muted-foreground"}`}>{branch.branchCode}</p></div></div><Badge tone={branch.isOpen ? "success" : "neutral"}>{branch.isOpen ? "open" : "closed"}</Badge></div>
                  </button>
                ))}
              </div>
            </aside>

            {selected && editor ? (
              <section>
                <SectionHeading eyebrow="Configuration" title={selected.branchName} description={`${selected.restaurantName} · ${selected.timezone} · ${selected.currency}`} />
                <Card className="mt-4 overflow-hidden rounded-[1.8rem] border-border p-0 shadow-[0_24px_80px_rgb(0_0_0/0.055)]">
                  <div className="grid gap-px bg-border sm:grid-cols-3"><Summary icon={<Store className="size-4" />} label="Branch state" value={editor.isOpen ? "Open" : "Closed"} /><Summary icon={<Percent className="size-4" />} label="Service charge" value={editor.serviceChargeEnabled ? `${editor.serviceChargePercent}%` : "Off"} /><Summary icon={<Clock3 className="size-4" />} label="Prep default" value={`${editor.defaultPreparationMinutes} min`} /></div>
                  <div className="grid gap-6 p-5 sm:p-6">
                    <SettingToggle label="Accept customer ordering" description="Controls whether this branch is treated as operationally open." checked={editor.isOpen} onChange={(checked) => setEditor({ ...editor, isOpen: checked })} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-muted/25 p-4"><SettingToggle label="Service charge" description="Apply service charge policy when bills are calculated." checked={editor.serviceChargeEnabled} onChange={(checked) => setEditor({ ...editor, serviceChargeEnabled: checked })} /><Field label="Rate (%)"><input inputMode="decimal" disabled={!editor.serviceChargeEnabled} value={editor.serviceChargePercent} onChange={(e) => setEditor({ ...editor, serviceChargePercent: e.target.value })} className={inputClass} /></Field></div>
                      <div className="rounded-2xl border border-border bg-muted/25 p-4"><SettingToggle label="VAT" description="Apply branch VAT policy to cashier bill calculations." checked={editor.vatEnabled} onChange={(checked) => setEditor({ ...editor, vatEnabled: checked })} /><Field label="Rate (%)"><input inputMode="decimal" disabled={!editor.vatEnabled} value={editor.vatPercent} onChange={(e) => setEditor({ ...editor, vatPercent: e.target.value })} className={inputClass} /></Field></div>
                    </div>
                    <Field label="Default preparation minutes"><input inputMode="numeric" value={editor.defaultPreparationMinutes} onChange={(e) => setEditor({ ...editor, defaultPreparationMinutes: e.target.value })} className={inputClass} /></Field>
                    <div className="flex justify-end border-t border-border pt-5"><Button disabled={saving} onClick={() => void save()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}>Save branch policy</Button></div>
                  </div>
                </Card>
              </section>
            ) : null}
          </div>
        ) : <div className="mt-6"><EmptyState icon={<Settings2 className="size-5" />} title="No branch settings" description="No durable branch settings are available for this tenant." /></div>}
      </div>
    </OperationalShell>
  );
}

const inputClass = "mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-45 focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";
function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) { return <label className="grid"><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</span>{children}</label>; }
function SettingToggle({ label, description, checked, onChange }: { readonly label: string; readonly description: string; readonly checked: boolean; readonly onChange: (checked: boolean) => void }) { return <label className="flex cursor-pointer items-start justify-between gap-4"><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 rounded border-border" /></label>; }
function Summary({ icon, label, value }: { readonly icon: React.ReactNode; readonly label: string; readonly value: string }) { return <div className="bg-card px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-muted">{icon}</span><div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div></div></div>; }
