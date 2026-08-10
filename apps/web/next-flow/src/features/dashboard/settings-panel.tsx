"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Percent, Save, Store, WalletCards } from "lucide-react";

import { Badge, Button, Card, SectionHeading } from "@/components/ui";
import type { OpeningHours } from "@/domain";
import { useFoodFlow } from "@/store";

export function SettingsPanel() {
  const { state, updateSettings } = useFoodFlow();
  const [restaurantName, setRestaurantName] = useState(state.settings.restaurantName);
  const [logoUrl, setLogoUrl] = useState(state.settings.logoUrl ?? "");
  const [serviceEnabled, setServiceEnabled] = useState(state.settings.serviceChargeEnabled);
  const [servicePercent, setServicePercent] = useState(state.settings.serviceChargePercent);
  const [vatEnabled, setVatEnabled] = useState(state.settings.vatEnabled);
  const [vatPercent, setVatPercent] = useState(state.settings.vatPercent);
  const [prepMinutes, setPrepMinutes] = useState(state.settings.defaultPreparationMinutes);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(() => state.settings.openingHours.map((hours) => ({ ...hours, ranges: hours.ranges.map((range) => ({ ...range })) })));
  const [saved, setSaved] = useState(false);

  function save() {
    updateSettings({
      restaurantName: restaurantName.trim(),
      logoUrl: logoUrl.trim() || undefined,
      serviceChargeEnabled: serviceEnabled,
      serviceChargePercent: servicePercent,
      vatEnabled,
      vatPercent,
      defaultPreparationMinutes: prepMinutes,
      openingHours,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2_000);
  }

  function updateHours(day: OpeningHours["day"], patch: Partial<OpeningHours>) {
    setOpeningHours((current) => current.map((hours) => hours.day === day ? { ...hours, ...patch } : hours));
  }

  function updateTime(day: OpeningHours["day"], field: "opensAt" | "closesAt", value: string) {
    setOpeningHours((current) => current.map((hours) => {
      if (hours.day !== day) return hours;
      const range = hours.ranges[0] ?? { opensAt: "08:00", closesAt: "22:00" };
      return { ...hours, ranges: [{ ...range, [field]: value }] };
    }));
  }

  return (
    <div>
      <SectionHeading eyebrow="Configuration" title="Restaurant settings" description="The practical defaults used by customer, kitchen, and cashier workflows." action={saved ? <Badge tone="success" icon={<CheckCircle2 className="size-3" />}>Saved</Badge> : undefined} />
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <SettingHeader icon={<Store className="size-5" />} title="Restaurant identity" description="Shown to guests and staff across FoodFlow." />
            <div className="mt-5 grid gap-4 sm:grid-cols-[96px_1fr] sm:items-end">
              <div className="grid size-24 place-items-center rounded-lg bg-cover bg-center bg-no-repeat text-2xl font-black text-lime" style={logoUrl ? { backgroundImage: `linear-gradient(rgba(18,55,42,.16),rgba(18,55,42,.16)),url(${logoUrl})` } : { backgroundColor: "#12372a" }} role="img" aria-label="Restaurant logo preview">{logoUrl ? "" : "MH"}</div>
              <div className="grid gap-3"><label className="text-xs font-semibold text-forest">Restaurant name<input className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-normal" value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} /></label><label className="text-xs font-semibold text-forest">Logo URL<input className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm font-normal" placeholder="https://..." value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} /></label></div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><ReadOnly label="Currency" value="THB - Thai Baht" /><ReadOnly label="Timezone" value="Asia/Bangkok" /></div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SettingHeader icon={<WalletCards className="size-5" />} title="Billing defaults" description="Cashiers may still adjust these per bill." />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <RateSetting label="Service charge" checked={serviceEnabled} value={servicePercent} onChecked={setServiceEnabled} onValue={setServicePercent} />
              <RateSetting label="VAT" checked={vatEnabled} value={vatPercent} onChecked={setVatEnabled} onValue={setVatPercent} />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <SettingHeader icon={<Clock3 className="size-5" />} title="Kitchen timing" description="Used for preparation estimates and new menu items." />
            <label className="mt-5 block text-xs font-semibold text-forest">Default preparation time<div className="mt-2 flex items-center overflow-hidden rounded-md border border-line bg-white"><input className="h-11 min-w-0 flex-1 px-3 text-sm font-normal outline-none" min="1" max="120" type="number" value={prepMinutes} onChange={(event) => setPrepMinutes(Math.max(1, Number(event.target.value)))} /><span className="border-l border-line bg-surface-muted px-3 py-3 text-xs text-foreground/50">minutes</span></div></label>
          </Card>

          <Card className="p-5 sm:p-6">
            <SettingHeader icon={<Clock3 className="size-5" />} title="Opening hours" description="One simple dine-in schedule for the MVP." />
            <div className="mt-4 space-y-2">{openingHours.map((hours) => { const range = hours.ranges[0] ?? { opensAt: "08:00", closesAt: "22:00" }; return <div className="grid grid-cols-[44px_1fr_auto] items-center gap-2 rounded-md bg-[#f4f4ef] px-3 py-2.5 text-xs" key={hours.day}><span className="font-semibold text-forest">{hours.day.slice(0, 3)}</span>{hours.isClosed ? <span className="text-foreground/40">Closed</span> : <div className="flex items-center gap-1.5"><input aria-label={`${hours.day} opens`} className="h-9 min-w-0 rounded border border-line bg-white px-1.5 text-xs" type="time" value={range.opensAt} onChange={(event) => updateTime(hours.day, "opensAt", event.target.value)} /><span className="text-foreground/35">to</span><input aria-label={`${hours.day} closes`} className="h-9 min-w-0 rounded border border-line bg-white px-1.5 text-xs" type="time" value={range.closesAt} onChange={(event) => updateTime(hours.day, "closesAt", event.target.value)} /></div>}<button type="button" className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ${hours.isClosed ? "bg-[#f7dfdb] text-status-red" : "bg-forest-soft text-forest"}`} onClick={() => updateHours(hours.day, { isClosed: !hours.isClosed, ranges: hours.ranges.length ? hours.ranges : [{ opensAt: "08:00", closesAt: "22:00" }] })}>{hours.isClosed ? "Open day" : "Close day"}</button></div>; })}</div>
          </Card>

          <Button fullWidth size="lg" leftIcon={<Save className="size-4" />} disabled={!restaurantName.trim()} onClick={save}>Save restaurant settings</Button>
        </div>
      </div>
    </div>
  );
}

function SettingHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) { return <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-md bg-forest-soft text-forest">{icon}</span><div><h2 className="font-semibold text-forest">{title}</h2><p className="mt-1 text-xs leading-5 text-foreground/45">{description}</p></div></div>; }
function ReadOnly({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold text-forest">{label}</p><p className="mt-2 rounded-md border border-line bg-surface-muted px-3 py-3 text-sm text-foreground/55">{value}</p></div>; }
function RateSetting({ label, checked, value, onChecked, onValue }: { label: string; checked: boolean; value: number; onChecked: (value: boolean) => void; onValue: (value: number) => void }) { return <div className={`rounded-lg border p-4 ${checked ? "border-forest/30 bg-forest-soft/60" : "border-line bg-[#faf9f5]"}`}><button className="flex w-full items-center justify-between text-sm font-semibold text-forest" aria-pressed={checked} onClick={() => onChecked(!checked)}><span className="flex items-center gap-2"><Percent className="size-4" />{label}</span><span className={`h-5 w-9 rounded-full p-0.5 ${checked ? "bg-forest" : "bg-line"}`}><span className={`block size-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} /></span></button><label className="mt-4 block text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Percentage<input className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-normal text-forest disabled:opacity-50" disabled={!checked} min="0" max="100" type="number" value={value} onChange={(event) => onValue(Math.max(0, Math.min(100, Number(event.target.value))))} /></label></div>; }
