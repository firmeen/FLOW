import type { CartItemSelection } from "./order";
import type { MenuAvailability, MenuItem, ModifierGroup } from "./menu";

const dayNames = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const timeInTimezone = (date: Date, timezone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

export const isMenuAvailabilityActive = (
  availability: MenuAvailability,
  date: Date,
): boolean => {
  if (!availability.active) return false;
  if (availability.type === "ALWAYS") return true;

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: availability.timezone,
    weekday: "short",
  }).format(date);
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    weekday,
  );
  const day = dayNames[weekdayIndex >= 0 ? weekdayIndex : date.getDay()];

  if (
    availability.daysOfWeek.length > 0 &&
    !availability.daysOfWeek.includes(day)
  ) {
    return false;
  }
  if (!availability.startTime || !availability.endTime) return true;

  const time = timeInTimezone(date, availability.timezone);
  return time >= availability.startTime && time <= availability.endTime;
};

export const getMissingRequiredModifierGroupIds = (
  item: MenuItem,
  modifierGroups: ModifierGroup[],
  selections: CartItemSelection[],
): string[] =>
  item.modifierGroupIds.filter((groupId) => {
    const group = modifierGroups.find((candidate) => candidate.id === groupId);
    if (!group?.active || group.minimumSelections < 1) return false;
    const selectedCount = selections.filter(
      (selection) => selection.modifierGroupId === group.id,
    ).length;
    return selectedCount < group.minimumSelections;
  });
