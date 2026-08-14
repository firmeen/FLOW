"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Tag,
} from "lucide-react";

import { FoodImage } from "@/components/menu/food-image";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Label,
  Modal,
  SectionHeading,
  StatusPill,
  Switch,
  Tabs,
  Textarea,
} from "@/components/foodflow-ui";
import type { Category, DayOfWeek, MenuAvailability, MenuBadge, MenuImageKey, MenuItem, MenuItemStatus, ModifierChoice, ModifierGroup } from "@/domain";
import { formatTHB } from "@/lib/currency";
import { useFoodFlow } from "@/store";

type MenuSection = "items" | "categories" | "modifiers" | "badges" | "availability";
type EditorId = "new" | string | null;

const imageKeys: MenuImageKey[] = ["matcha", "gyudon", "tempura", "salmon", "sushi", "yuzu", "karaage", "rice", "salad", "drink"];
const days: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export function MenuManagement() {
  const flow = useFoodFlow();
  const { state } = flow;
  const [section, setSection] = useState<MenuSection>("items");
  const [search, setSearch] = useState("");
  const [itemEditor, setItemEditor] = useState<EditorId>(null);
  const [categoryEditor, setCategoryEditor] = useState<EditorId>(null);
  const [modifierEditor, setModifierEditor] = useState<EditorId>(null);
  const [badgeEditor, setBadgeEditor] = useState<EditorId>(null);
  const [availabilityEditor, setAvailabilityEditor] = useState<EditorId>(null);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return [...state.menuItems]
      .filter((item) => item.status !== "ARCHIVED")
      .filter((item) => !term || `${item.name} ${item.thaiName ?? ""} ${item.description}`.toLocaleLowerCase().includes(term))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [search, state.menuItems]);

  const tabs = [
    { value: "items" as const, label: "Items", count: state.menuItems.filter((item) => item.status !== "ARCHIVED").length },
    { value: "categories" as const, label: "Categories", count: state.categories.length },
    { value: "modifiers" as const, label: "Modifiers", count: state.modifierGroups.length },
    { value: "badges" as const, label: "Badges", count: state.menuBadges.length },
    { value: "availability" as const, label: "Availability", count: state.menuAvailabilities.length },
  ];

  const newLabel = section === "availability" ? "schedule" : section === "categories" ? "category" : section === "modifiers" ? "modifier" : section === "badges" ? "badge" : "item";

  return (
    <div>
      <SectionHeading
        eyebrow="Menu operations"
        title="Menu management"
        description="Own the products, categories, options, labels, and schedules that power the customer menu."
        action={<Button leftIcon={<Plus className="size-4" />} onClick={() => section === "items" ? setItemEditor("new") : section === "categories" ? setCategoryEditor("new") : section === "modifiers" ? setModifierEditor("new") : section === "badges" ? setBadgeEditor("new") : setAvailabilityEditor("new")}>New {newLabel}</Button>}
      />
      <Tabs className="mt-6" label="Menu management sections" value={section} onChange={setSection} items={tabs} />

      {section === "items" && (
        <section className="mt-6" aria-label="Menu items">
          <label className="relative block max-w-sm"><span className="sr-only">Search menu items</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/35" /><input className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm" placeholder="Search menu items" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          {visibleItems.length === 0 ? <div className="mt-5"><EmptyState icon={<Search className="size-5" />} title="No menu items found" /></div> : (
            <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
              {visibleItems.map((item, index) => {
                const category = state.categories.find((candidate) => candidate.id === item.categoryId);
                return (
                  <article className={`grid gap-4 p-4 sm:grid-cols-[64px_minmax(0,1fr)_110px_auto] sm:items-center ${index ? "border-t border-border" : ""}`} key={item.id}>
                    <FoodImage className="size-16 rounded-md" imageKey={item.imageKey ?? item.imageUrl} alt={item.name} />
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-foreground">{item.name}</h3>{item.vegetarian && <Badge tone="success">Veg</Badge>}</div><p className="mt-1 truncate text-[11px] text-foreground/42">{category?.name ?? "Uncategorized"} - {item.preparationStation}</p><p className="mt-1 text-xs font-bold text-foreground">{formatTHB(item.basePrice)}</p></div>
                    <StatusPill tone={item.status === "ACTIVE" ? "success" : item.status === "SOLD_OUT" ? "danger" : item.status === "DRAFT" ? "warning" : "neutral"}>{item.status.replaceAll("_", " ").toLocaleLowerCase()}</StatusPill>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Button size="sm" variant="ghost" leftIcon={<Pencil className="size-3.5" />} onClick={() => setItemEditor(item.id)}>Edit</Button>
                      <Button size="sm" variant="ghost" leftIcon={<Copy className="size-3.5" />} onClick={() => flow.duplicateMenuItem(item.id)}>Duplicate</Button>
                      {item.status === "DRAFT" && <Button size="sm" onClick={() => flow.publishMenuItem(item.id)}>Publish</Button>}
                      {item.status === "ACTIVE" && <Button size="sm" variant="outline" leftIcon={<EyeOff className="size-3.5" />} onClick={() => flow.setMenuItemStatus(item.id, "HIDDEN", "Hidden by owner")}>Hide</Button>}
                      {(item.status === "HIDDEN" || item.status === "SOLD_OUT") && <Button size="sm" variant="outline" leftIcon={<Eye className="size-3.5" />} onClick={() => flow.setMenuItemStatus(item.id, "ACTIVE", "Restored by owner")}>Restore</Button>}
                      <Button size="sm" variant="danger" leftIcon={<Archive className="size-3.5" />} onClick={() => flow.archiveMenuItem(item.id)}>Archive</Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {section === "categories" && <CategoryList categories={state.categories} menuItems={state.menuItems} onEdit={setCategoryEditor} onToggle={(category) => flow.updateCategory(category.id, { active: !category.active })} onMove={flow.reorderCategory} />}
      {section === "modifiers" && <ModifierList groups={state.modifierGroups} onEdit={setModifierEditor} onToggle={(group) => flow.updateModifierGroup(group.id, { active: !group.active })} />}
      {section === "badges" && <BadgeList badges={state.menuBadges} menuItems={state.menuItems} onEdit={setBadgeEditor} onToggle={(badge) => flow.updateBadge(badge.id, { active: !badge.active })} />}
      {section === "availability" && <AvailabilityList rules={state.menuAvailabilities} menuItems={state.menuItems} onEdit={setAvailabilityEditor} onToggle={(rule) => flow.updateAvailability(rule.id, { active: !rule.active })} />}

      <ItemEditor key={itemEditor ?? "closed"} open={itemEditor !== null} item={itemEditor && itemEditor !== "new" ? state.menuItems.find((item) => item.id === itemEditor) : undefined} state={state} onClose={() => setItemEditor(null)} onCreate={flow.createMenuItem} onUpdate={flow.updateMenuItem} />
      <CategoryEditor key={categoryEditor ?? "closed"} open={categoryEditor !== null} category={categoryEditor && categoryEditor !== "new" ? state.categories.find((category) => category.id === categoryEditor) : undefined} nextOrder={state.categories.length + 1} onClose={() => setCategoryEditor(null)} onCreate={flow.createCategory} onUpdate={flow.updateCategory} />
      <ModifierEditor key={modifierEditor ?? "closed"} open={modifierEditor !== null} group={modifierEditor && modifierEditor !== "new" ? state.modifierGroups.find((group) => group.id === modifierEditor) : undefined} onClose={() => setModifierEditor(null)} onCreate={flow.createModifierGroup} onUpdate={flow.updateModifierGroup} />
      <BadgeEditor key={badgeEditor ?? "closed"} open={badgeEditor !== null} badge={badgeEditor && badgeEditor !== "new" ? state.menuBadges.find((badge) => badge.id === badgeEditor) : undefined} onClose={() => setBadgeEditor(null)} onCreate={flow.createBadge} onUpdate={flow.updateBadge} />
      <AvailabilityEditor key={availabilityEditor ?? "closed"} open={availabilityEditor !== null} rule={availabilityEditor && availabilityEditor !== "new" ? state.menuAvailabilities.find((rule) => rule.id === availabilityEditor) : undefined} onClose={() => setAvailabilityEditor(null)} onCreate={flow.createAvailability} onUpdate={flow.updateAvailability} />
    </div>
  );
}

function CategoryList({ categories, menuItems, onEdit, onToggle, onMove }: { categories: Category[]; menuItems: MenuItem[]; onEdit: (id: string) => void; onToggle: (category: Category) => void; onMove: (id: string, direction: "UP" | "DOWN") => void }) {
  const ordered = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  return <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">{ordered.map((category, index) => <div className={`grid gap-3 p-4 sm:grid-cols-[1fr_100px_auto] sm:items-center ${index ? "border-t border-border" : ""}`} key={category.id}><div><h3 className="font-semibold text-foreground">{category.name}</h3><p className="mt-1 text-xs text-foreground/42">{category.thaiName ?? category.description ?? "No secondary label"} - {menuItems.filter((item) => item.categoryId === category.id && item.status !== "ARCHIVED").length} items</p></div><StatusPill tone={category.active ? "success" : "neutral"}>{category.active ? "Visible" : "Hidden"}</StatusPill><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(category.id, "UP")}><ArrowUp className="size-3.5" /></Button><Button size="sm" variant="ghost" disabled={index === ordered.length - 1} onClick={() => onMove(category.id, "DOWN")}><ArrowDown className="size-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => onEdit(category.id)}>Edit</Button><Button size="sm" variant="outline" onClick={() => onToggle(category)}>{category.active ? "Hide" : "Show"}</Button></div></div>)}</div>;
}

function ModifierList({ groups, onEdit, onToggle }: { groups: ModifierGroup[]; onEdit: (id: string) => void; onToggle: (group: ModifierGroup) => void }) {
  return <div className="mt-6 grid gap-4 lg:grid-cols-2">{groups.map((group) => <Card className="p-5" key={group.id}><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{group.name}</h3><Badge tone={group.kind === "ADD_ON" ? "info" : "forest"}>{group.kind.replace("_", " ").toLocaleLowerCase()}</Badge></div><p className="mt-1 text-xs text-foreground/42">{group.required ? "Required" : "Optional"} - Choose {group.minimumSelections}-{group.maximumSelections}</p></div><StatusPill tone={group.active ? "success" : "neutral"}>{group.active ? "Active" : "Inactive"}</StatusPill></div><div className="mt-4 overflow-hidden rounded-md border border-border bg-muted">{group.choices.map((choice, index) => <div className={`flex justify-between px-3 py-2.5 text-xs ${index ? "border-t border-border" : ""}`} key={choice.id}><span className={choice.active ? "font-medium text-foreground/65" : "text-foreground/30 line-through"}>{choice.name}</span><span className="font-bold text-foreground">{choice.priceDelta ? `+${formatTHB(choice.priceDelta)}` : "Included"}</span></div>)}</div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => onEdit(group.id)}>Edit group</Button><Button size="sm" variant="ghost" onClick={() => onToggle(group)}>{group.active ? "Deactivate" : "Activate"}</Button></div></Card>)}</div>;
}

function BadgeList({ badges, menuItems, onEdit, onToggle }: { badges: MenuBadge[]; menuItems: MenuItem[]; onEdit: (id: string) => void; onToggle: (badge: MenuBadge) => void }) {
  return <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{badges.map((badge) => <Card className="p-4" key={badge.id}><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-md text-white" style={{ backgroundColor: badge.color }}><Tag className="size-4" /></span><div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{badge.name}</p><p className="text-xs text-foreground/42">Used by {menuItems.filter((item) => item.badgeIds.includes(badge.id)).length} items</p></div><StatusPill tone={badge.active ? "success" : "neutral"}>{badge.active ? "Active" : "Off"}</StatusPill></div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => onEdit(badge.id)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => onToggle(badge)}>{badge.active ? "Disable" : "Enable"}</Button></div></Card>)}</div>;
}

function AvailabilityList({ rules, menuItems, onEdit, onToggle }: { rules: MenuAvailability[]; menuItems: MenuItem[]; onEdit: (id: string) => void; onToggle: (rule: MenuAvailability) => void }) {
  return <div className="mt-6 grid gap-4 lg:grid-cols-2">{rules.map((rule) => <Card className="p-5" key={rule.id}><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-md bg-muted text-foreground"><CalendarClock className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-foreground">{rule.name}</h3><StatusPill tone={rule.active ? "success" : "neutral"}>{rule.active ? "Active" : "Inactive"}</StatusPill></div><p className="mt-1 text-xs text-foreground/45">{rule.type === "ALWAYS" ? "Always available" : `${rule.daysOfWeek.map((day) => day.slice(0, 3)).join(", ") || "Selected days"}${rule.startTime && rule.endTime ? ` - ${rule.startTime}-${rule.endTime}` : ""}`}</p><p className="mt-2 text-[10px] text-foreground/35">Used by {menuItems.filter((item) => item.availabilityId === rule.id).length} items - {rule.timezone}</p></div></div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => onEdit(rule.id)}>Edit schedule</Button><Button size="sm" variant="ghost" onClick={() => onToggle(rule)}>{rule.active ? "Deactivate" : "Activate"}</Button></div></Card>)}</div>;
}

function ItemEditor({ open, item, state, onClose, onCreate, onUpdate }: { open: boolean; item?: MenuItem; state: ReturnType<typeof useFoodFlow>["state"]; onClose: () => void; onCreate: ReturnType<typeof useFoodFlow>["createMenuItem"]; onUpdate: ReturnType<typeof useFoodFlow>["updateMenuItem"] }) {
  const [name, setName] = useState(item?.name ?? "");
  const [thaiName, setThaiName] = useState(item?.thaiName ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [thaiDescription, setThaiDescription] = useState(item?.thaiDescription ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? state.categories.find((category) => category.active)?.id ?? "");
  const [imageKey, setImageKey] = useState<MenuImageKey>(item?.imageKey ?? "rice");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [basePrice, setBasePrice] = useState(item?.basePrice ?? 0);
  const [station, setStation] = useState(item?.preparationStation ?? "MAIN_KITCHEN");
  const [prep, setPrep] = useState(item?.estimatedPreparationMinutes ?? state.settings.defaultPreparationMinutes);
  const [status, setStatus] = useState<MenuItemStatus>(item?.status ?? "DRAFT");
  const [vegetarian, setVegetarian] = useState(item?.vegetarian ?? false);
  const [badgeIds, setBadgeIds] = useState(item?.badgeIds ?? []);
  const [modifierIds, setModifierIds] = useState(item?.modifierGroupIds ?? []);
  const [availabilityId, setAvailabilityId] = useState(item?.availabilityId ?? state.menuAvailabilities.find((rule) => rule.active)?.id ?? "");
  const [displayOrder, setDisplayOrder] = useState(item?.displayOrder ?? state.menuItems.length + 1);

  function save() {
    const values = {
      name: name.trim(),
      thaiName: thaiName.trim() || undefined,
      description: description.trim(),
      thaiDescription: thaiDescription.trim() || undefined,
      categoryId,
      imageKey,
      imageUrl: imageUrl.trim() || undefined,
      basePrice,
      preparationStation: station.trim(),
      estimatedPreparationMinutes: prep,
      status,
      vegetarian,
      badgeIds,
      modifierGroupIds: modifierIds,
      availabilityId,
      displayOrder,
    };
    if (item) onUpdate(item.id, values); else onCreate(values);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title={item ? `Edit ${item.name}` : "Create menu item"} description="Published active items appear in the customer menu immediately." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!name.trim() || !categoryId || !availabilityId || basePrice < 0} onClick={save}>{item ? "Save changes" : "Create item"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={name} onChange={setName} required />
        <TextField label="Thai name" value={thaiName} onChange={setThaiName} />
        <TextArea label="Description" value={description} onChange={setDescription} required />
        <TextArea label="Thai description" value={thaiDescription} onChange={setThaiDescription} />
        <SelectField label="Category" value={categoryId} onChange={setCategoryId} options={state.categories.map((category) => ({ value: category.id, label: category.name }))} />
        <SelectField label="Image crop" value={imageKey} onChange={(value) => setImageKey(value as MenuImageKey)} options={imageKeys.map((key) => ({ value: key, label: key }))} />
        <TextField label="Custom image URL" value={imageUrl} onChange={setImageUrl} />
        <NumberField label="Base price (THB)" value={basePrice} onChange={setBasePrice} />
        <TextField label="Preparation station" value={station} onChange={setStation} required />
        <NumberField label="Preparation minutes" value={prep} onChange={setPrep} />
        <SelectField label="Status" value={status} onChange={(value) => setStatus(value as MenuItemStatus)} options={["DRAFT", "ACTIVE", "SOLD_OUT", "HIDDEN"].map((value) => ({ value, label: value.replaceAll("_", " ") }))} />
        <NumberField label="Display order" value={displayOrder} onChange={setDisplayOrder} />
        <SelectField label="Availability" value={availabilityId} onChange={setAvailabilityId} options={state.menuAvailabilities.map((rule) => ({ value: rule.id, label: rule.name }))} />
        <ToggleField label="Vegetarian" checked={vegetarian} onChange={setVegetarian} />
        <CheckGroup title="Badges" values={state.menuBadges.filter((badge) => badge.active).map((badge) => ({ id: badge.id, label: badge.name }))} selected={badgeIds} onChange={setBadgeIds} />
        <CheckGroup title="Modifiers and add-ons" values={state.modifierGroups.filter((group) => group.active).map((group) => ({ id: group.id, label: group.name }))} selected={modifierIds} onChange={setModifierIds} />
      </div>
    </Modal>
  );
}

function CategoryEditor({ open, category, nextOrder, onClose, onCreate, onUpdate }: { open: boolean; category?: Category; nextOrder: number; onClose: () => void; onCreate: ReturnType<typeof useFoodFlow>["createCategory"]; onUpdate: ReturnType<typeof useFoodFlow>["updateCategory"] }) {
  const [name, setName] = useState(category?.name ?? "");
  const [thaiName, setThaiName] = useState(category?.thaiName ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(category?.coverImageUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder ?? nextOrder);
  const [active, setActive] = useState(category?.active ?? true);
  function save() {
    const values = { name: name.trim(), thaiName: thaiName.trim() || undefined, description: description.trim() || undefined, coverImageUrl: coverImageUrl.trim() || undefined, displayOrder, active };
    if (category) onUpdate(category.id, values); else onCreate(values);
    onClose();
  }
  return <Modal open={open} onClose={onClose} title={category ? `Edit ${category.name}` : "Create category"} description="Categories control customer menu navigation and ordering." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!name.trim()} onClick={save}>{category ? "Save changes" : "Create category"}</Button></>}><div className="grid gap-4 sm:grid-cols-2"><TextField label="Name" value={name} onChange={setName} required /><TextField label="Thai name" value={thaiName} onChange={setThaiName} /><TextArea label="Description" value={description} onChange={setDescription} /><TextField label="Cover image URL" value={coverImageUrl} onChange={setCoverImageUrl} /><NumberField label="Display order" value={displayOrder} onChange={setDisplayOrder} /><ToggleField label="Active" checked={active} onChange={setActive} /></div></Modal>;
}

function ModifierEditor({ open, group, onClose, onCreate, onUpdate }: { open: boolean; group?: ModifierGroup; onClose: () => void; onCreate: ReturnType<typeof useFoodFlow>["createModifierGroup"]; onUpdate: ReturnType<typeof useFoodFlow>["updateModifierGroup"] }) {
  const [name, setName] = useState(group?.name ?? "");
  const [thaiName, setThaiName] = useState(group?.thaiName ?? "");
  const [kind, setKind] = useState<"MODIFIER" | "ADD_ON">(group?.kind ?? "MODIFIER");
  const [required, setRequired] = useState(group?.required ?? false);
  const [minimum, setMinimum] = useState(group?.minimumSelections ?? 0);
  const [maximum, setMaximum] = useState(group?.maximumSelections ?? 1);
  const [active, setActive] = useState(group?.active ?? true);
  const [choices, setChoices] = useState(group ? group.choices.map((choice) => `${choice.name} | ${choice.priceDelta}`).join("\n") : "Regular | 0\nPremium option | 25");
  const parsed = choices.split("\n").map((line, index) => {
    const [choiceName, price] = line.split("|");
    const existing = group?.choices[index];
    return { id: existing?.id ?? `choice-${index}-${choiceName?.trim().toLocaleLowerCase().replace(/\W+/g, "-")}`, name: choiceName?.trim(), priceDelta: Number(price?.trim() ?? 0), active: existing?.active ?? true, displayOrder: index + 1 };
  }).filter((choice) => choice.name) as ModifierChoice[];
  function save() {
    const values = { name: name.trim(), thaiName: thaiName.trim() || undefined, kind, required, minimumSelections: required ? Math.max(1, minimum) : minimum, maximumSelections: Math.max(maximum, required ? 1 : minimum), choices: parsed, active };
    if (group) onUpdate(group.id, values); else onCreate(values);
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title={group ? `Edit ${group.name}` : "Create modifier group"} description="Reusable groups can be attached to any menu item." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!name.trim() || parsed.length === 0 || maximum < minimum} onClick={save}>{group ? "Save changes" : "Create modifier"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={name} onChange={setName} required />
        <TextField label="Thai name" value={thaiName} onChange={setThaiName} />
        <SelectField label="Type" value={kind} onChange={(value) => setKind(value as "MODIFIER" | "ADD_ON")} options={[{ value: "MODIFIER", label: "Modifier" }, { value: "ADD_ON", label: "Add-on" }]} />
        <ToggleField label="Required" checked={required} onChange={(value) => { setRequired(value); if (value && minimum === 0) setMinimum(1); }} />
        <NumberField label="Minimum selections" value={minimum} onChange={setMinimum} />
        <NumberField label="Maximum selections" value={maximum} onChange={setMaximum} />
        <ToggleField label="Active" checked={active} onChange={setActive} />
        <Label className="block sm:col-span-2">Choices - one per line as Name | Price<Textarea className="mt-2 min-h-32 font-mono text-xs font-normal normal-case tracking-normal" value={choices} onChange={(event) => setChoices(event.target.value)} /></Label>
      </div>
    </Modal>
  );
}

function BadgeEditor({ open, badge, onClose, onCreate, onUpdate }: { open: boolean; badge?: MenuBadge; onClose: () => void; onCreate: ReturnType<typeof useFoodFlow>["createBadge"]; onUpdate: ReturnType<typeof useFoodFlow>["updateBadge"] }) {
  const [name, setName] = useState(badge?.name ?? "");
  const [color, setColor] = useState(badge?.color ?? "#2f6a59");
  const [icon, setIcon] = useState(badge?.icon ?? "tag");
  const [active, setActive] = useState(badge?.active ?? true);
  function save() {
    const values = { name: name.trim(), color, icon: icon.trim() || undefined, active };
    if (badge) onUpdate(badge.id, values); else onCreate(values);
    onClose();
  }
  return <Modal open={open} onClose={onClose} title={badge ? `Edit ${badge.name}` : "Create badge"} description="Reusable labels highlight products without hardcoded flags." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!name.trim()} onClick={save}>{badge ? "Save changes" : "Create badge"}</Button></>}><div className="grid gap-4 sm:grid-cols-2"><TextField label="Name" value={name} onChange={setName} required /><Label className="block">Color<Input className="mt-2 p-1" type="color" value={color} onChange={(event) => setColor(event.target.value)} /></Label><TextField label="Icon key" value={icon} onChange={setIcon} /><ToggleField label="Active" checked={active} onChange={setActive} /></div></Modal>;
}

function AvailabilityEditor({ open, rule, onClose, onCreate, onUpdate }: { open: boolean; rule?: MenuAvailability; onClose: () => void; onCreate: ReturnType<typeof useFoodFlow>["createAvailability"]; onUpdate: ReturnType<typeof useFoodFlow>["updateAvailability"] }) {
  const [name, setName] = useState(rule?.name ?? "");
  const [type, setType] = useState<"ALWAYS" | "SCHEDULED">(rule?.type ?? "ALWAYS");
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(rule?.daysOfWeek ?? []);
  const [startTime, setStartTime] = useState(rule?.startTime ?? "");
  const [endTime, setEndTime] = useState(rule?.endTime ?? "");
  const [active, setActive] = useState(rule?.active ?? true);
  function save() {
    const values = { name: name.trim(), type, daysOfWeek: type === "ALWAYS" ? [] : selectedDays, startTime: type === "SCHEDULED" ? startTime || undefined : undefined, endTime: type === "SCHEDULED" ? endTime || undefined : undefined, timezone: "Asia/Bangkok", active };
    if (rule) onUpdate(rule.id, values); else onCreate(values);
    onClose();
  }
  return (
    <Modal open={open} onClose={onClose} title={rule ? `Edit ${rule.name}` : "Create availability"} description="Limit products by day, time, or make them always available." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!name.trim() || (type === "SCHEDULED" && selectedDays.length === 0)} onClick={save}>{rule ? "Save schedule" : "Create schedule"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name" value={name} onChange={setName} required />
        <SelectField label="Availability type" value={type} onChange={(value) => setType(value as "ALWAYS" | "SCHEDULED")} options={[{ value: "ALWAYS", label: "Always available" }, { value: "SCHEDULED", label: "Specific days / time" }]} />
        {type === "SCHEDULED" && <><CheckGroup title="Days" values={days.map((day) => ({ id: day, label: day.slice(0, 3) }))} selected={selectedDays} onChange={(value) => setSelectedDays(value as DayOfWeek[])} /><div className="grid grid-cols-2 gap-3"><TextField label="Start time" type="time" value={startTime} onChange={setStartTime} /><TextField label="End time" type="time" value={endTime} onChange={setEndTime} /></div></>}
        <ToggleField label="Active" checked={active} onChange={setActive} />
      </div>
    </Modal>
  );
}

function TextField({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <Label className="block">{label}{required && " *"}<Input className="mt-2 font-normal normal-case tracking-normal" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></Label>;
}

function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <Label className="block">{label}{required && " *"}<Textarea className="mt-2 font-normal normal-case tracking-normal" value={value} onChange={(event) => onChange(event.target.value)} /></Label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Label className="block">{label}<Input className="mt-2 font-normal normal-case tracking-normal" min="0" type="number" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value)))} /></Label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <Label className="block">{label}<select className="mt-2 h-10 w-full rounded-none border border-input bg-background px-3 font-normal normal-case tracking-normal outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></Label>;
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex min-h-10 items-center justify-between border border-border bg-background px-3"><Label htmlFor={`toggle-${label.replace(/\s+/g, "-").toLowerCase()}`}>{label}</Label><Switch id={`toggle-${label.replace(/\s+/g, "-").toLowerCase()}`} checked={checked} onCheckedChange={onChange} /></div>;
}

function CheckGroup({ title, values, selected, onChange }: { title: string; values: { id: string; label: string }[]; selected: string[]; onChange: (values: string[]) => void }) {
  return <fieldset><legend className="font-heading text-xs font-semibold uppercase tracking-wide text-foreground">{title}</legend><div className="mt-2 flex flex-wrap gap-2">{values.map((value) => { const checked = selected.includes(value.id); return <Button type="button" aria-pressed={checked} variant={checked ? "secondary" : "outline"} size="sm" onClick={() => onChange(checked ? selected.filter((id) => id !== value.id) : [...selected, value.id])} key={value.id}>{value.label}</Button>; })}</div></fieldset>;
}
