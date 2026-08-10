import type { DayOfWeek, EntityId, ISODateTime } from "./shared";

export type MenuItemStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "HIDDEN" | "ARCHIVED";
export type MenuAvailabilityType = "ALWAYS" | "SCHEDULED";
export type ModifierGroupKind = "MODIFIER" | "ADD_ON";

export interface MenuAvailability {
  id: EntityId;
  name: string;
  type: MenuAvailabilityType;
  daysOfWeek: DayOfWeek[];
  startTime?: string;
  endTime?: string;
  timezone: string;
  active: boolean;
}

export interface Category {
  id: EntityId;
  restaurantId: EntityId;
  name: string;
  thaiName?: string;
  description?: string;
  coverImageUrl?: string;
  displayOrder: number;
  active: boolean;
  archivedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface MenuBadge {
  id: EntityId;
  restaurantId: EntityId;
  name: string;
  color: string;
  icon?: string;
  active: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ModifierChoice {
  id: EntityId;
  name: string;
  thaiName?: string;
  priceDelta: number;
  active: boolean;
  displayOrder: number;
}

export interface ModifierGroup {
  id: EntityId;
  restaurantId: EntityId;
  name: string;
  thaiName?: string;
  kind: ModifierGroupKind;
  required: boolean;
  minimumSelections: number;
  maximumSelections: number;
  choices: ModifierChoice[];
  active: boolean;
  displayOrder: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type MenuImageKey =
  | "matcha"
  | "gyudon"
  | "tempura"
  | "salmon"
  | "sushi"
  | "yuzu"
  | "karaage"
  | "rice"
  | "salad"
  | "drink";

export interface MenuItem {
  id: EntityId;
  restaurantId: EntityId;
  categoryId: EntityId;
  name: string;
  thaiName?: string;
  description: string;
  thaiDescription?: string;
  imageUrl?: string;
  imageKey: MenuImageKey;
  basePrice: number;
  currency: string;
  preparationStation: string;
  estimatedPreparationMinutes: number;
  status: MenuItemStatus;
  vegetarian: boolean;
  badgeIds: EntityId[];
  modifierGroupIds: EntityId[];
  availabilityId: EntityId;
  displayOrder: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  publishedAt?: ISODateTime;
  archivedAt?: ISODateTime;
}
