"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, Percent, Save, Store, WalletCards } from "lucide-react";

import { Badge, Button, Card, Input, Label, SectionHeading, Switch } from "@/components/ui";
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
              <div className="grid size-24 place-items-center bg-foreground bg-cover bg-center bg-no-repeat text-2xl font-black text-primary" style={logoUrl ? { backgroundImage: `url(${logoUrl})` } : undefined} role="img" aria-label="Restaurant logo preview">{logoUrl ? "" : "MH"}</div>
              <div className="grid gap-3"><Label className="block">Restaurant name<Input className="mt-2 font-normal normal-case tracking-normal" value={restaurantName} onChange={(event) => setRestaurantName(event.target.value)} /></Label><Label className="block">Logo URL<Input className="mt-2 font-normal normal-case tracking-normal" placeholder="https://..." value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} /></Label></div>
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
            <Label className="mt-5 block">Default preparation time<div className="mt-2 flex items-center"><Input className="h-11 min-w-0 flex-1 font-normal normal-case tracking-normal" min="1" max="120" type="number" value={prepMinutes} onChange={(event) => setPrepMinutes(Math.max(1, Number(event.target.value)))} /><span className="h-11 border border-l-0 border-input bg-muted px-3 py-3 text-xs font-normal normal-case tracking-normal text-muted-foreground">minutes</span></div></Label>
          </Card>

          <Card className="p-5 sm:p-6">
            <SettingHeader icon={<Clock3 className="size-5" />} title="Opening hours" description="One simple dine-in schedule for the MVP." />
            <div className="mt-4 space-y-2">{openingHours.map((hours) => { const range = hours.ranges[0] ?? { opensAt: "08:00", closesAt: "22:00" }; return <div className="grid grid-cols-[44px_1fr_auto] items-center gap-2 border border-border bg-muted/40 px-3 py-2.5 text-xs" key={hours.day}><span className="font-semibold text-foreground">{hours.day.slice(0, 3)}</span>{hours.isClosed ? <span className="text-muted-foreground">Closed</span> : <div className="flex items-center gap-1.5"><Input aria-label={`${hours.day} opens`} className="h-9 min-w-0 px-1.5 text-xs" type="time" value={range.opensAt} onChange={(event) => updateTime(hours.day, "opensAt", event.target.value)} /><span className="text-muted-foreground">to</span><Input aria-label={`${hours.day} closes`} className="h-9 min-w-0 px-1.5 text-xs" type="time" value={range.closesAt} onChange={(event) => updateTime(hours.day, "closesAt", event.target.value)} /></div>}<Button type="button" variant={hours.isClosed ? "danger" : "secondary"} size="xs" onClick={() => updateHours(hours.day, { isClosed: !hours.isClosed, ranges: hours.ranges.length ? hours.ranges : [{ opensAt: "08:00", closesAt: "22:00" }] })}>{hours.isClosed ? "Open day" : "Close day"}</Button></div>; })}</div>
          </Card>

          <Button fullWidth size="lg" leftIcon={<Save className="size-4" />} disabled={!restaurantName.trim()} onClick={save}>Save restaurant settings</Button>
        </div>
      </div>
    </div>
  );
}

function SettingHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) { return <div className="flex items-start gap-3"><span className="grid size-10 place-items-center bg-secondary text-secondary-foreground">{icon}</span><div><h2 className="font-heading font-semibold uppercase tracking-[0.04em] text-foreground">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>; }
function ReadOnly({ label, value }: { label: string; value: string }) { return <div><p className="font-heading text-xs font-semibold uppercase tracking-wide text-foreground">{label}</p><p className="mt-2 border border-border bg-muted px-3 py-3 text-sm text-muted-foreground">{value}</p></div>; }
function RateSetting({ label, checked, value, onChecked, onValue }: { label: string; checked: boolean; value: number; onChecked: (value: boolean) => void; onValue: (value: number) => void }) { const switchId = `rate-${label.replace(/\s+/g, "-").toLowerCase()}`; return <div className={`border p-4 ${checked ? "border-primary/60 bg-primary/10" : "border-border bg-muted/30"}`}><div className="flex w-full items-center justify-between"><Label htmlFor={switchId} className="text-sm normal-case tracking-normal"><Percent className="size-4" />{label}</Label><Switch id={switchId} checked={checked} onCheckedChange={onChecked} /></div><Label className="mt-4 block">Percentage<Input className="mt-1.5 font-normal normal-case tracking-normal" disabled={!checked} min="0" max="100" type="number" value={value} onChange={(event) => onValue(Math.max(0, Math.min(100, Number(event.target.value))))} /></Label></div>; }
