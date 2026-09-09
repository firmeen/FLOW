"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Plus, Sparkles, Utensils } from "lucide-react";

import { OperationalShell } from "@/components/layout";
import { Button, Card, EmptyState, SectionHeading, StatusPill } from "@/components/foodflow-ui";
import type { MenuManagementSnapshot } from "@/modules/menu-management/types";

type ApiSuccess<T> = { readonly ok: true; readonly data: T };
type ApiFailure = { readonly ok: false; readonly error: { readonly code: string } };

type Created = { readonly id: string; readonly status: "DRAFT"; readonly restaurantId: string; readonly name: string };

async function readApi<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.ok) {
    const code = body.ok ? "MENU_MANAGEMENT_UNAVAILABLE" : body.error.code;
    if (code === "MENU_MANAGEMENT_FORBIDDEN") throw new Error("This workspace cannot create menu items.");
    if (code === "MENU_MANAGEMENT_INVALID_INPUT") throw new Error("Complete the required menu fields before creating the draft.");
    throw new Error("The menu composer is temporarily unavailable.");
  }
  return body.data;
}

export function DurableMenuCreate() {
  const [snapshot, setSnapshot] = useState<MenuManagementSnapshot | null>(null);
  const [restaurantId, setRestaurantId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availabilityId, setAvailabilityId] = useState("");
  const [name, setName] = useState("");
  const [thaiName, setThaiName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [station, setStation] = useState("MAIN_KITCHEN");
  const [prepMinutes, setPrepMinutes] = useState("10");
  const [vegetarian, setVegetarian] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/internal/management/menu", { cache: "no-store", credentials: "same-origin", headers: { Accept: "application/json" } })
      .then(readApi<MenuManagementSnapshot>)
      .then((next) => {
        if (!active) return;
        setSnapshot(next);
        const first = next.restaurants[0];
        if (first) setRestaurantId(first.id);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Menu composer is unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => snapshot?.categories.filter((category) => category.restaurantId === restaurantId) ?? [], [restaurantId, snapshot?.categories]);
  const availabilities = useMemo(() => snapshot?.availabilities.filter((availability) => availability.restaurantId === restaurantId) ?? [], [restaurantId, snapshot?.availabilities]);

  useEffect(() => {
    setCategoryId(categories[0]?.id ?? "");
    setAvailabilityId(availabilities[0]?.id ?? "");
  }, [restaurantId, categories, availabilities]);

  async function createDraft() {
    if (saving) return;
    setSaving(true);
    setError(null);
    setCreated(null);
    try {
      const priceNumber = Number(price);
      const prep = Number(prepMinutes);
      const response = await fetch("/api/internal/management/menu", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          categoryId,
          availabilityId,
          name,
          thaiName: thaiName || null,
          description,
          basePriceMinor: Math.round(priceNumber * 100).toString(),
          preparationStation: station,
          estimatedPreparationMinutes: Number.isFinite(prep) ? Math.max(0, Math.round(prep)) : 0,
          vegetarian,
        }),
      });
      const result = await readApi<Created>(response);
      setCreated(result);
      setName("");
      setThaiName("");
      setDescription("");
      setPrice("");
      setPrepMinutes("10");
      setVegetarian(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Draft menu item could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalShell
      title="New menu item"
      subtitle="Create a durable draft before publishing"
      role="Owner"
      currentRole="admin"
      navItems={[
        { label: "Menu studio", href: "/admin/menu", icon: ArrowLeft, active: false },
        { label: "New item", href: "/admin/menu/new", icon: Plus, active: true },
      ]}
      headerActions={<StatusPill tone="success" dot>Draft-first authority</StatusPill>}
    >
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-foreground p-6 text-background shadow-[0_32px_100px_rgb(0_0_0/0.14)] sm:p-8">
          <div className="absolute -right-16 -top-24 size-72 rounded-full bg-background/[0.05] blur-3xl" />
          <div className="relative"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] opacity-55"><Sparkles className="size-3.5" /> Catalog creation</div><h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.055em] sm:text-4xl">Create once. Review deliberately. Publish when it is ready.</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-60">New items enter the durable catalog as DRAFT so unfinished products never become customer-visible by accident.</p></div>
        </section>

        {created ? <div className="mt-4 flex items-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold text-background"><Check className="size-4" />Draft {created.name} created. Open Menu studio to review and publish it.</div> : null}
        {error ? <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</div> : null}

        <SectionHeading className="mt-8" eyebrow="Composer" title="Product essentials" description="Restaurant, catalog placement, pricing and production defaults." />
        {loading ? <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="size-6 animate-spin text-muted-foreground" /></div> : snapshot?.restaurants.length ? (
          <Card className="mt-4 rounded-[1.8rem] border-border p-5 shadow-[0_24px_80px_rgb(0_0_0/0.05)] sm:p-6">
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Restaurant"><select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)} className={inputClass}>{snapshot.restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}</select></Field>
                <Field label="Category"><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
                <Field label="Availability"><select value={availabilityId} onChange={(event) => setAvailabilityId(event.target.value)} className={inputClass}>{availabilities.map((availability) => <option key={availability.id} value={availability.id}>{availability.name}</option>)}</select></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Item name"><input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} /></Field><Field label="Thai name"><input value={thaiName} onChange={(event) => setThaiName(event.target.value)} className={inputClass} /></Field></div>
              <Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className={`${inputClass} min-h-28 py-3`} /></Field>
              <div className="grid gap-4 sm:grid-cols-3"><Field label="Price (THB)"><input inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} className={inputClass} /></Field><Field label="Preparation station"><input value={station} onChange={(event) => setStation(event.target.value)} className={inputClass} /></Field><Field label="Prep minutes"><input inputMode="numeric" value={prepMinutes} onChange={(event) => setPrepMinutes(event.target.value)} className={inputClass} /></Field></div>
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={vegetarian} onChange={(event) => setVegetarian(event.target.checked)} className="size-4 rounded border-border" /><span><span className="block text-sm font-semibold">Vegetarian item</span><span className="text-xs text-muted-foreground">Store dietary classification with the catalog record.</span></span></label><Button disabled={saving || !restaurantId || !categoryId || !availabilityId || !name.trim() || !price.trim()} onClick={() => void createDraft()} leftIcon={saving ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}>Create durable draft</Button></div>
            </div>
          </Card>
        ) : <div className="mt-5"><EmptyState icon={<Utensils className="size-5" />} title="Catalog setup required" description="Create restaurant categories and availability rules before adding menu items." /></div>}
      </div>
    </OperationalShell>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-ring/15";
function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) { return <label className="grid gap-1.5"><span className="text-[10px] font-bold uppercase tracking-[0.11em] text-muted-foreground">{label}</span>{children}</label>; }
