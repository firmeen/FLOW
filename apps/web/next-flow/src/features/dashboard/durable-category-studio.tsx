"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Store,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import type { ManagedMenuCategory, ManagedRestaurant } from "@/modules/menu-management/types";

type CategorySnapshot = {
  readonly restaurants: readonly ManagedRestaurant[];
  readonly categories: readonly ManagedMenuCategory[];
};

type CategoryMutation = {
  readonly id: string;
  readonly restaurantId: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly active: boolean;
  readonly displayOrder: number;
  readonly archived: boolean;
};

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

async function readApi<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !payload.ok) {
    const code = payload.ok ? "MENU_MANAGEMENT_UNAVAILABLE" : payload.error.code;
    if (code === "MENU_MANAGEMENT_FORBIDDEN") throw new Error("This workspace cannot manage menu categories.");
    if (code === "MENU_MANAGEMENT_INVALID_INPUT") throw new Error("Check the category fields and try again.");
    if (code === "MENU_MANAGEMENT_CONFLICT") throw new Error("This category changed while you were editing. Refresh and try again.");
    throw new Error("Category management is temporarily unavailable.");
  }
  return payload.data;
}

export function DurableCategoryStudio() {
  const [snapshot, setSnapshot] = useState<CategorySnapshot | null>(null);
  const [restaurantId, setRestaurantId] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [thaiName, setThaiName] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [newName, setNewName] = useState("");
  const [newThaiName, setNewThaiName] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/menu/categories", { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } });
      const next = await readApi<CategorySnapshot>(response);
      setSnapshot(next);
      setError(null);
      setRestaurantId((current) => current && next.restaurants.some((restaurant) => restaurant.id === current) ? current : next.restaurants[0]?.id ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Category management is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo(() => snapshot?.categories.filter((category) => category.restaurantId === restaurantId) ?? [], [restaurantId, snapshot?.categories]);
  const selected = useMemo(() => categories.find((category) => category.id === selectedId) ?? null, [categories, selectedId]);

  useEffect(() => {
    const target = selected ?? categories[0] ?? null;
    if (target && selectedId !== target.id) setSelectedId(target.id);
    if (target) {
      setName(target.name);
      setThaiName(target.thaiName ?? "");
      setDisplayOrder(target.displayOrder.toString());
      setActive(target.active);
    }
  }, [categories, selected, selectedId]);

  async function save() {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/internal/management/menu/categories/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ name, thaiName: thaiName || null, active, displayOrder: Math.max(0, Math.round(Number(displayOrder) || 0)) }),
      });
      const updated = await readApi<CategoryMutation>(response);
      setSnapshot((current) => current ? { ...current, categories: current.categories.map((category) => category.id === updated.id ? { ...category, name: updated.name, thaiName: updated.thaiName, active: updated.active, displayOrder: updated.displayOrder } : category) } : current);
      setNotice(`${updated.name} saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Category could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function createCategory() {
    if (!restaurantId || !newName.trim() || creating) return;
    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/internal/management/menu/categories", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, name: newName, thaiName: newThaiName || null }),
      });
      const created = await readApi<CategoryMutation>(response);
      setSnapshot((current) => current ? { ...current, categories: [...current.categories, { id: created.id, restaurantId: created.restaurantId, name: created.name, thaiName: created.thaiName, active: created.active, displayOrder: created.displayOrder }] } : current);
      setSelectedId(created.id);
      setNewName("");
      setNewThaiName("");
      setNotice(`${created.name} created.`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Category could not be created.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <OperationalShell
      title="Category studio"
      subtitle="Durable menu hierarchy and customer navigation"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Menu studio", href: "/admin/menu", icon: ArrowLeft, active: false },
        { label: "Categories", href: "/admin/menu/categories", icon: Layers3, active: true },
      ]}
      headerActions={<div className="flex items-center gap-2"><StatusPill tone="success" dot>Catalog authority</StatusPill><Button variant="outline" size="sm" disabled={refreshing} onClick={() => void load(true)} leftIcon={<RefreshCcw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />}>Refresh</Button></div>}
    >
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.05] blur-3xl" />
          <div className="relative"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><Sparkles className="size-3.5" /> Menu architecture</div><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Shape the menu before customers ever start searching.</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">Categories control customer browsing structure and stay isolated to the selected restaurant catalog.</p></div>
        </section>

        {notice ? <div className="mt-4 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background"><Check className="size-4" />{notice}</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</div> : null}

        {loading ? <div className="grid min-h-[450px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : snapshot?.restaurants.length ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-[360px_1fr]">
            <aside>
              <SectionHeading eyebrow="Catalog" title="Categories" description="Choose the restaurant and category to edit." />
              <select value={restaurantId} onChange={(event) => { setRestaurantId(event.target.value); setSelectedId(null); }} className={`${inputClass} mt-4`}>
                {snapshot.restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
              </select>
              <div className="mt-3 grid gap-2">
                {categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedId(category.id)} className={`rounded-2xl border p-4 text-left transition ${selectedId === category.id ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/20"}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${selectedId === category.id ? "bg-background/10" : "bg-muted"}`}><Layers3 className="size-4" /></span><div><p className="font-semibold">{category.name}</p><p className={`mt-0.5 text-[10px] uppercase tracking-[0.1em] ${selectedId === category.id ? "text-background/55" : "text-muted-foreground"}`}>Order {category.displayOrder}</p></div></div><Badge tone={category.active ? "success" : "neutral"}>{category.active ? "active" : "hidden"}</Badge></div></button>)}
              </div>
            </aside>

            <section className="grid content-start gap-5">
              <Card className="rounded-[1.8rem] border-border p-5 shadow-[0_20px_65px_rgb(0_0_0/0.04)] sm:p-6">
                <SectionHeading eyebrow="Create" title="New category" description="Add a durable browsing group to the selected restaurant." />
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><Field label="Name"><input value={newName} onChange={(event) => setNewName(event.target.value)} className={inputClass} /></Field><Field label="Thai name"><input value={newThaiName} onChange={(event) => setNewThaiName(event.target.value)} className={inputClass} /></Field><div className="self-end"><Button disabled={creating || !newName.trim()} onClick={() => void createCategory()} leftIcon={creating ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}>Create</Button></div></div>
              </Card>

              {selected ? <Card className="rounded-[1.8rem] border-border p-5 shadow-[0_20px_65px_rgb(0_0_0/0.04)] sm:p-6"><SectionHeading eyebrow="Editor" title={selected.name} description="Rename, reorder or temporarily hide this category." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Name"><input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></Field><Field label="Thai name"><input value={thaiName} onChange={(event) => setThaiName(event.target.value)} className={inputClass} /></Field></div><div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]"><Field label="Display order"><input inputMode="numeric" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className={inputClass} /></Field><label className="flex min-w-40 cursor-pointer items-center gap-3 self-end rounded-xl border border-border px-4 py-3"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 rounded border-border" /><span className="text-sm font-semibold">Visible</span></label></div><div className="mt-5 flex justify-end border-t border-border pt-5"><Button disabled={saving} onClick={() => void save()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}>Save category</Button></div></Card> : <EmptyState icon={<Layers3 className="size-5" />} title="Select a category" description="Choose a category to edit durable catalog structure." />}
            </section>
          </div>
        ) : <div className="mt-6"><EmptyState icon={<Store className="size-5" />} title="No restaurant catalog" description="A restaurant must exist before categories can be managed." /></div>}
      </div>
    </OperationalShell>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";
function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</span>{children}</label>; }
