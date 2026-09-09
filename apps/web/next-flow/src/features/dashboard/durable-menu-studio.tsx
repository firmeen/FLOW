"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChefHat,
  CircleDollarSign,
  EyeOff,
  Leaf,
  LoaderCircle,
  PackageOpen,
  RefreshCcw,
  Save,
  Search,
  Sparkles,
  Store,
  Utensils,
} from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Badge, Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import { formatTHB } from "@/lib/currency";
import type {
  ManagedMenuItem,
  ManagedMenuItemStatus,
  MenuManagementSnapshot,
  UpdateManagedMenuItemInput,
} from "@/modules/menu-management/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

type EditorState = {
  name: string;
  thaiName: string;
  description: string;
  thaiDescription: string;
  imageUrl: string;
  priceBaht: string;
  categoryId: string;
  availabilityId: string;
  preparationStation: string;
  estimatedPreparationMinutes: string;
  vegetarian: boolean;
  displayOrder: string;
  status: ManagedMenuItemStatus;
};

const STATUS_FILTERS: readonly ("ALL" | ManagedMenuItemStatus)[] = [
  "ALL",
  "ACTIVE",
  "SOLD_OUT",
  "DRAFT",
  "HIDDEN",
  "ARCHIVED",
];

function editorFromItem(item: ManagedMenuItem): EditorState {
  return {
    name: item.name,
    thaiName: item.thaiName ?? "",
    description: item.description,
    thaiDescription: item.thaiDescription ?? "",
    imageUrl: item.imageUrl ?? "",
    priceBaht: (Number(item.basePriceMinor) / 100).toFixed(2),
    categoryId: item.categoryId,
    availabilityId: item.availabilityId,
    preparationStation: item.preparationStation,
    estimatedPreparationMinutes: item.estimatedPreparationMinutes.toString(),
    vegetarian: item.vegetarian,
    displayOrder: item.displayOrder.toString(),
    status: item.status,
  };
}

function statusTone(status: ManagedMenuItemStatus): "success" | "warning" | "neutral" | "danger" {
  if (status === "ACTIVE") return "success";
  if (status === "SOLD_OUT" || status === "DRAFT") return "warning";
  if (status === "ARCHIVED") return "danger";
  return "neutral";
}

function statusLabel(status: ManagedMenuItemStatus): string {
  return status.replaceAll("_", " ").toLowerCase();
}

function moneyFromMinor(value: string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? formatTHB(amount / 100) : "—";
}

function apiMessage(code: string): string {
  if (code === "MENU_MANAGEMENT_FORBIDDEN") return "This workspace does not have menu management permission.";
  if (code === "MENU_MANAGEMENT_INVALID_INPUT") return "One or more menu fields are invalid.";
  if (code === "MENU_MANAGEMENT_CONFLICT") return "This item changed while you were editing it. Reload the item and try again.";
  if (code === "MENU_MANAGEMENT_NOT_FOUND") return "This menu item no longer exists.";
  return "The menu studio is temporarily unavailable.";
}

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    throw new Error(apiMessage(body.ok ? "MENU_MANAGEMENT_UNAVAILABLE" : body.error.code));
  }
  return body.data;
}

function patchFromEditor(state: EditorState): UpdateManagedMenuItemInput {
  const baht = Number(state.priceBaht);
  const minutes = Number(state.estimatedPreparationMinutes);
  const displayOrder = Number(state.displayOrder);
  return {
    name: state.name,
    thaiName: state.thaiName || null,
    description: state.description,
    thaiDescription: state.thaiDescription || null,
    imageUrl: state.imageUrl || null,
    basePriceMinor: Math.round(baht * 100).toString(),
    categoryId: state.categoryId,
    availabilityId: state.availabilityId,
    preparationStation: state.preparationStation,
    estimatedPreparationMinutes: Number.isFinite(minutes) ? Math.max(0, Math.round(minutes)) : 0,
    vegetarian: state.vegetarian,
    displayOrder: Number.isFinite(displayOrder) ? Math.max(0, Math.round(displayOrder)) : 0,
    status: state.status,
  };
}

export function DurableMenuStudio() {
  const [snapshot, setSnapshot] = useState<MenuManagementSnapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [restaurantId, setRestaurantId] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await fetch("/api/internal/management/menu", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const next = await readApi<MenuManagementSnapshot>(response);
      setSnapshot(next);
      setError(null);
      setSelectedId((current) => {
        if (current && next.items.some((item) => item.id === current)) return current;
        return next.items[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Menu studio is unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(
    () => snapshot?.items.find((item) => item.id === selectedId) ?? null,
    [selectedId, snapshot?.items],
  );

  useEffect(() => {
    setEditor(selected ? editorFromItem(selected) : null);
  }, [selected]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (snapshot?.items ?? []).filter((item) => {
      if (restaurantId !== "ALL" && item.restaurantId !== restaurantId) return false;
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (!term) return true;
      return `${item.name} ${item.thaiName ?? ""} ${item.categoryName} ${item.preparationStation}`
        .toLocaleLowerCase()
        .includes(term);
    });
  }, [restaurantId, search, snapshot?.items, statusFilter]);

  const activeCount = snapshot?.items.filter((item) => item.status === "ACTIVE").length ?? 0;
  const soldOutCount = snapshot?.items.filter((item) => item.status === "SOLD_OUT").length ?? 0;
  const draftCount = snapshot?.items.filter((item) => item.status === "DRAFT").length ?? 0;

  async function save(nextStatus?: ManagedMenuItemStatus) {
    if (!selected || !editor || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = patchFromEditor(nextStatus ? { ...editor, status: nextStatus } : editor);
      const response = await fetch(`/api/internal/management/menu/${encodeURIComponent(selected.id)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updated = await readApi<ManagedMenuItem>(response);
      setSnapshot((current) =>
        current
          ? { ...current, items: current.items.map((item) => (item.id === updated.id ? updated : item)) }
          : current,
      );
      setEditor(editorFromItem(updated));
      setNotice(nextStatus ? `${updated.name} is now ${statusLabel(updated.status)}.` : `${updated.name} saved.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Menu item could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalShell
      title="Menu studio"
      subtitle="Durable catalog publishing and availability control"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Overview", href: "/admin", icon: ArrowLeft, active: false },
        { label: "Menu studio", href: "/admin/menu", icon: Utensils, active: true },
      ]}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusPill tone="success" dot>Database authority</StatusPill>
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
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.055] blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55">
                <Sparkles className="size-3.5" /> Catalog authority
              </div>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">
                Publish with precision.
                <br />Keep every service surface in sync.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">
                Price, preparation, visibility and sold-out state are written directly to the durable menu catalog used by customer ordering.
              </p>
            </div>
            <div className="grid min-w-[270px] grid-cols-3 gap-2">
              <HeroMetric label="Live" value={activeCount} />
              <HeroMetric label="Sold out" value={soldOutCount} />
              <HeroMetric label="Draft" value={draftCount} />
            </div>
          </div>
        </section>

        {notice ? (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-foreground/10 bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-lg" role="status">
            <Check className="size-4" /> {notice}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(420px,.82fr)_minmax(520px,1.18fr)]">
          <section>
            <SectionHeading
              eyebrow="Catalog"
              title="Menu inventory"
              description="Search and filter without changing durable state."
            />
            <div className="mt-4 rounded-[1.6rem] border border-border bg-card p-3 shadow-[0_20px_65px_rgb(0_0_0/0.04)]">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <label className="relative block">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search item, category or station"
                    className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15"
                  />
                </label>
                <select
                  value={restaurantId}
                  onChange={(event) => setRestaurantId(event.target.value)}
                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none"
                >
                  <option value="ALL">All restaurants</option>
                  {snapshot?.restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] transition ${
                      statusFilter === filter ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter === "ALL" ? "All" : statusLabel(filter)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div>
              ) : visibleItems.length ? (
                <div className="mt-3 grid max-h-[720px] gap-2 overflow-y-auto pr-1">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`group rounded-2xl border p-4 text-left transition ${selectedId === item.id ? "border-foreground bg-foreground text-background shadow-xl" : "border-border bg-background hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${selectedId === item.id ? "bg-background/10" : "bg-muted"}`}>
                          <ChefHat className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold tracking-[-0.02em]">{item.name}</p>
                              <p className={`mt-1 truncate text-xs ${selectedId === item.id ? "text-background/55" : "text-muted-foreground"}`}>
                                {item.categoryName} · {item.preparationStation}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-bold">{moneyFromMinor(item.basePriceMinor)}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                            {item.vegetarian ? <span className={`flex items-center gap-1 text-[10px] ${selectedId === item.id ? "text-background/60" : "text-muted-foreground"}`}><Leaf className="size-3" /> vegetarian</span> : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3"><EmptyState icon={<PackageOpen className="size-5" />} title="No items match" description="Change the filters or search term." /></div>
              )}
            </div>
          </section>

          <section>
            <SectionHeading
              eyebrow="Editor"
              title={selected ? selected.name : "Select an item"}
              description={selected ? `${selected.restaurantName} · ${selected.categoryName}` : "Choose a catalog item to edit durable menu state."}
            />
            {selected && editor ? (
              <Card className="mt-4 overflow-hidden rounded-[1.8rem] border-border p-0 shadow-[0_24px_80px_rgb(0_0_0/0.055)]">
                <div className="flex flex-col gap-4 border-b border-border bg-muted/35 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-2xl bg-foreground text-background"><Utensils className="size-4" /></span>
                    <div><p className="font-semibold">Publishing controls</p><p className="mt-0.5 text-xs text-muted-foreground">Current state · {statusLabel(selected.status)}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" disabled={saving} onClick={() => void save("SOLD_OUT")} leftIcon={<CircleDollarSign className="size-3.5" />}>Sold out</Button>
                    <Button variant="outline" size="sm" disabled={saving} onClick={() => void save("HIDDEN")} leftIcon={<EyeOff className="size-3.5" />}>Hide</Button>
                    <Button size="sm" disabled={saving} onClick={() => void save("ACTIVE")} leftIcon={<Store className="size-3.5" />}>Publish</Button>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Item name"><input value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} className={inputClass} /></Field>
                    <Field label="Thai name"><input value={editor.thaiName} onChange={(e) => setEditor({ ...editor, thaiName: e.target.value })} className={inputClass} /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Description"><textarea value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} rows={4} className={`${inputClass} min-h-28 py-3`} /></Field>
                    <Field label="Thai description"><textarea value={editor.thaiDescription} onChange={(e) => setEditor({ ...editor, thaiDescription: e.target.value })} rows={4} className={`${inputClass} min-h-28 py-3`} /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Price (THB)"><input inputMode="decimal" value={editor.priceBaht} onChange={(e) => setEditor({ ...editor, priceBaht: e.target.value })} className={inputClass} /></Field>
                    <Field label="Prep minutes"><input inputMode="numeric" value={editor.estimatedPreparationMinutes} onChange={(e) => setEditor({ ...editor, estimatedPreparationMinutes: e.target.value })} className={inputClass} /></Field>
                    <Field label="Display order"><input inputMode="numeric" value={editor.displayOrder} onChange={(e) => setEditor({ ...editor, displayOrder: e.target.value })} className={inputClass} /></Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Category"><select value={editor.categoryId} onChange={(e) => setEditor({ ...editor, categoryId: e.target.value })} className={inputClass}>{snapshot?.categories.filter((category) => category.restaurantId === selected.restaurantId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
                    <Field label="Availability"><select value={editor.availabilityId} onChange={(e) => setEditor({ ...editor, availabilityId: e.target.value })} className={inputClass}>{snapshot?.availabilities.filter((availability) => availability.restaurantId === selected.restaurantId).map((availability) => <option key={availability.id} value={availability.id}>{availability.name}</option>)}</select></Field>
                    <Field label="Station"><input value={editor.preparationStation} onChange={(e) => setEditor({ ...editor, preparationStation: e.target.value })} className={inputClass} /></Field>
                  </div>
                  <Field label="Image URL"><input value={editor.imageUrl} onChange={(e) => setEditor({ ...editor, imageUrl: e.target.value })} placeholder="https://…" className={inputClass} /></Field>
                  <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={editor.vegetarian} onChange={(e) => setEditor({ ...editor, vegetarian: e.target.checked })} className="size-4 rounded border-border" />
                      <span><span className="block text-sm font-semibold">Vegetarian item</span><span className="text-xs text-muted-foreground">Displayed as a dietary catalog attribute.</span></span>
                    </label>
                    <Button disabled={saving} onClick={() => void save()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}>Save changes</Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="mt-4"><EmptyState icon={<Utensils className="size-5" />} title="Select a menu item" description="The durable editor will open here." /></div>
            )}
          </section>
        </div>
      </div>
    </OperationalShell>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</span>{children}</label>;
}

function HeroMetric({ label, value }: { readonly label: string; readonly value: number }) {
  return <div className="rounded-2xl border border-background/10 bg-background/[0.055] px-4 py-3 backdrop-blur"><p className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-50">{label}</p><p className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{value}</p></div>;
}
