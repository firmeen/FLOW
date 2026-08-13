import type {
  AuditAction,
  FoodFlowState,
  MenuAvailability,
  MenuBadge,
  MenuItem,
  MenuItemStatus,
  ModifierGroup,
} from "@/domain";
import { addAudit, createEntityId, now, roundCurrency } from "./helpers";
import type {
  AvailabilityPatch,
  BadgePatch,
  CreateAvailabilityInput,
  CreateBadgeInput,
  CreateMenuItemInput,
  CreateModifierGroupInput,
  MenuItemPatch,
  ModifierGroupPatch,
  MutationResult,
} from "./types";

export const createMenuItem = (
  initialState: FoodFlowState,
  input: CreateMenuItemInput,
  actorId?: string,
): MutationResult<string> => {
  if (!input.name.trim()) throw new Error("Menu item name is required.");
  if (!initialState.categories.some((category) => category.id === input.categoryId)) {
    throw new Error("Select a valid category.");
  }
  if (!Number.isFinite(input.basePrice) || input.basePrice < 0) {
    throw new Error("Base price must be zero or greater.");
  }
  const timestamp = now();
  const status = input.status ?? "DRAFT";
  const item: MenuItem = {
    id: input.id ?? createEntityId("menu"),
    restaurantId: initialState.restaurant.id,
    categoryId: input.categoryId,
    name: input.name.trim(),
    thaiName: input.thaiName?.trim() || undefined,
    description: input.description?.trim() ?? "",
    thaiDescription: input.thaiDescription?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    imageKey: input.imageKey ?? "rice",
    basePrice: roundCurrency(input.basePrice),
    currency: initialState.restaurant.currency,
    preparationStation: input.preparationStation?.trim() || "MAIN_KITCHEN",
    estimatedPreparationMinutes:
      input.estimatedPreparationMinutes ??
      initialState.settings.defaultPreparationMinutes,
    status,
    vegetarian: input.vegetarian ?? false,
    badgeIds: input.badgeIds ?? [],
    modifierGroupIds: input.modifierGroupIds ?? [],
    availabilityId:
      input.availabilityId ??
      initialState.menuAvailabilities.find(
        (availability) => availability.type === "ALWAYS",
      )?.id ??
      "",
    displayOrder:
      input.displayOrder ??
      Math.max(
        0,
        ...initialState.menuItems
          .filter((candidate) => candidate.categoryId === input.categoryId)
          .map((candidate) => candidate.displayOrder),
      ) +
        1,
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt:
      status === "ACTIVE" || status === "SOLD_OUT" ? timestamp : undefined,
  };
  let state: FoodFlowState = {
    ...initialState,
    menuItems: [...initialState.menuItems, item],
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "MENU_CREATED",
    entityType: "MENU_ITEM",
    entityId: item.id,
    summary: `Created menu item ${item.name}`,
    timestamp,
  });
  return { state, value: item.id };
};

export const updateMenuItem = (
  initialState: FoodFlowState,
  itemId: string,
  patch: MenuItemPatch,
  actorId?: string,
): FoodFlowState => {
  const item = initialState.menuItems.find((candidate) => candidate.id === itemId);
  if (!item) throw new Error("Menu item was not found.");
  if (patch.name !== undefined && !patch.name.trim()) {
    throw new Error("Menu item name cannot be empty.");
  }
  if (
    patch.basePrice !== undefined &&
    (!Number.isFinite(patch.basePrice) || patch.basePrice < 0)
  ) {
    throw new Error("Base price must be zero or greater.");
  }
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    menuItems: initialState.menuItems.map((candidate) =>
      candidate.id === itemId
        ? {
            ...candidate,
            ...patch,
            basePrice:
              patch.basePrice === undefined
                ? candidate.basePrice
                : roundCurrency(patch.basePrice),
            updatedAt: timestamp,
          }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "MENU_UPDATED",
    entityType: "MENU_ITEM",
    entityId: item.id,
    summary: `Updated menu item ${patch.name ?? item.name}`,
    timestamp,
  });
};

export const duplicateMenuItem = (
  initialState: FoodFlowState,
  itemId: string,
  actorId?: string,
): MutationResult<string> => {
  const source = initialState.menuItems.find(
    (candidate) => candidate.id === itemId,
  );
  if (!source) throw new Error("Menu item was not found.");
  const timestamp = now();
  const duplicate: MenuItem = {
    ...source,
    id: createEntityId("menu"),
    name: `${source.name} (Copy)`,
    status: "DRAFT",
    displayOrder:
      Math.max(
        0,
        ...initialState.menuItems
          .filter((item) => item.categoryId === source.categoryId)
          .map((item) => item.displayOrder),
      ) + 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    publishedAt: undefined,
    archivedAt: undefined,
  };
  let state: FoodFlowState = {
    ...initialState,
    menuItems: [...initialState.menuItems, duplicate],
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "MENU_DUPLICATED",
    entityType: "MENU_ITEM",
    entityId: duplicate.id,
    summary: `Duplicated ${source.name} as a draft`,
    timestamp,
  });
  return { state, value: duplicate.id };
};

export const setMenuItemStatus = (
  initialState: FoodFlowState,
  itemId: string,
  status: MenuItemStatus,
  actorId?: string,
  reason?: string,
): FoodFlowState => {
  const item = initialState.menuItems.find((candidate) => candidate.id === itemId);
  if (!item) throw new Error("Menu item was not found.");
  if (item.status === status) return initialState;
  const timestamp = now();
  const action: AuditAction =
    status === "SOLD_OUT"
      ? "MENU_SOLD_OUT"
      : status === "HIDDEN"
        ? "MENU_HIDDEN"
        : status === "ARCHIVED"
          ? "MENU_ARCHIVED"
          : status === "ACTIVE"
            ? "MENU_PUBLISHED"
            : "MENU_UPDATED";
  const state: FoodFlowState = {
    ...initialState,
    menuItems: initialState.menuItems.map((candidate) =>
      candidate.id === itemId
        ? {
            ...candidate,
            status,
            updatedAt: timestamp,
            publishedAt:
              status === "ACTIVE" || status === "SOLD_OUT"
                ? candidate.publishedAt ?? timestamp
                : candidate.publishedAt,
            archivedAt: status === "ARCHIVED" ? timestamp : undefined,
          }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-manager",
    fallbackActorName: "Manager",
    action,
    entityType: "MENU_ITEM",
    entityId: item.id,
    summary: `${item.name} changed from ${item.status} to ${status}`,
    reason: reason?.trim() || undefined,
    timestamp,
  });
};

export const archiveMenuItem = (
  state: FoodFlowState,
  itemId: string,
  actorId?: string,
) => setMenuItemStatus(state, itemId, "ARCHIVED", actorId);

export const publishMenuItem = (
  state: FoodFlowState,
  itemId: string,
  actorId?: string,
) => setMenuItemStatus(state, itemId, "ACTIVE", actorId);

const validateModifierRange = (
  required: boolean,
  minimumSelections: number,
  maximumSelections: number,
) => {
  if (minimumSelections < 0 || maximumSelections < 1) {
    throw new Error("Modifier selection limits must be positive.");
  }
  if (minimumSelections > maximumSelections) {
    throw new Error("Minimum selections cannot exceed maximum selections.");
  }
  if (required && minimumSelections < 1) {
    throw new Error("A required modifier needs at least one selection.");
  }
};

export const createModifierGroup = (
  initialState: FoodFlowState,
  input: CreateModifierGroupInput,
  actorId?: string,
): MutationResult<string> => {
  if (!input.name.trim()) throw new Error("Modifier group name is required.");
  const required = input.required ?? false;
  const minimumSelections = input.minimumSelections ?? (required ? 1 : 0);
  const maximumSelections = input.maximumSelections ?? 1;
  validateModifierRange(required, minimumSelections, maximumSelections);
  const timestamp = now();
  const group: ModifierGroup = {
    id: input.id ?? createEntityId("modifier"),
    restaurantId: initialState.restaurant.id,
    name: input.name.trim(),
    thaiName: input.thaiName?.trim() || undefined,
    kind: input.kind ?? "MODIFIER",
    required,
    minimumSelections,
    maximumSelections,
    choices: (input.choices ?? []).map((choice, index) => ({
      ...choice,
      id: choice.id ?? createEntityId("choice"),
      name: choice.name.trim(),
      priceDelta: roundCurrency(Math.max(0, choice.priceDelta)),
      active: choice.active ?? true,
      displayOrder: choice.displayOrder ?? index + 1,
    })),
    active: input.active ?? true,
    displayOrder:
      input.displayOrder ??
      Math.max(
        0,
        ...initialState.modifierGroups.map((candidate) => candidate.displayOrder),
      ) +
        1,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  let state: FoodFlowState = {
    ...initialState,
    modifierGroups: [...initialState.modifierGroups, group],
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "MODIFIER_CREATED",
    entityType: "MODIFIER_GROUP",
    entityId: group.id,
    summary: `Created modifier group ${group.name}`,
    timestamp,
  });
  return { state, value: group.id };
};

export const updateModifierGroup = (
  initialState: FoodFlowState,
  groupId: string,
  patch: ModifierGroupPatch,
  actorId?: string,
): FoodFlowState => {
  const group = initialState.modifierGroups.find(
    (candidate) => candidate.id === groupId,
  );
  if (!group) throw new Error("Modifier group was not found.");
  const required = patch.required ?? group.required;
  const minimumSelections =
    patch.minimumSelections ?? group.minimumSelections;
  const maximumSelections =
    patch.maximumSelections ?? group.maximumSelections;
  validateModifierRange(required, minimumSelections, maximumSelections);
  const timestamp = now();
  const choices = patch.choices?.map((choice, index) => ({
    id: choice.id ?? createEntityId("choice"),
    name: choice.name.trim(),
    thaiName: choice.thaiName?.trim() || undefined,
    priceDelta: roundCurrency(Math.max(0, choice.priceDelta)),
    active: choice.active ?? true,
    displayOrder: choice.displayOrder ?? index + 1,
  }));
  const state: FoodFlowState = {
    ...initialState,
    modifierGroups: initialState.modifierGroups.map((candidate) =>
      candidate.id === groupId
        ? {
            ...candidate,
            ...patch,
            required,
            minimumSelections,
            maximumSelections,
            choices: choices ?? candidate.choices,
            updatedAt: timestamp,
          }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "MODIFIER_UPDATED",
    entityType: "MODIFIER_GROUP",
    entityId: group.id,
    summary: `Updated modifier group ${patch.name ?? group.name}`,
    timestamp,
  });
};

export const createBadge = (
  initialState: FoodFlowState,
  input: CreateBadgeInput,
  actorId?: string,
): MutationResult<string> => {
  if (!input.name.trim()) throw new Error("Badge name is required.");
  if (!input.color.trim()) throw new Error("Badge color is required.");
  const timestamp = now();
  const badge: MenuBadge = {
    id: input.id ?? createEntityId("badge"),
    restaurantId: initialState.restaurant.id,
    name: input.name.trim(),
    color: input.color.trim(),
    icon: input.icon?.trim() || undefined,
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  let state: FoodFlowState = {
    ...initialState,
    menuBadges: [...initialState.menuBadges, badge],
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "BADGE_CREATED",
    entityType: "MENU_BADGE",
    entityId: badge.id,
    summary: `Created menu badge ${badge.name}`,
    timestamp,
  });
  return { state, value: badge.id };
};

export const updateBadge = (
  initialState: FoodFlowState,
  badgeId: string,
  patch: BadgePatch,
  actorId?: string,
): FoodFlowState => {
  const badge = initialState.menuBadges.find(
    (candidate) => candidate.id === badgeId,
  );
  if (!badge) throw new Error("Menu badge was not found.");
  if (patch.name !== undefined && !patch.name.trim()) {
    throw new Error("Badge name cannot be empty.");
  }
  if (patch.color !== undefined && !patch.color.trim()) {
    throw new Error("Badge color cannot be empty.");
  }
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    menuBadges: initialState.menuBadges.map((candidate) =>
      candidate.id === badgeId
        ? { ...candidate, ...patch, updatedAt: timestamp }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "BADGE_UPDATED",
    entityType: "MENU_BADGE",
    entityId: badge.id,
    summary: `Updated menu badge ${patch.name ?? badge.name}`,
    timestamp,
  });
};

const validateAvailability = (
  type: MenuAvailability["type"],
  startTime: string | undefined,
  endTime: string | undefined,
) => {
  if (type === "ALWAYS") return;
  if (Boolean(startTime) !== Boolean(endTime)) {
    throw new Error("Availability requires both a start and end time.");
  }
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (
    (startTime && !validTime.test(startTime)) ||
    (endTime && !validTime.test(endTime))
  ) {
    throw new Error("Availability times must use 24-hour HH:mm format.");
  }
};

export const createAvailability = (
  initialState: FoodFlowState,
  input: CreateAvailabilityInput,
  actorId?: string,
): MutationResult<string> => {
  if (!input.name.trim()) throw new Error("Availability name is required.");
  validateAvailability(input.type, input.startTime, input.endTime);
  const availability: MenuAvailability = {
    id: input.id ?? createEntityId("availability"),
    name: input.name.trim(),
    type: input.type,
    daysOfWeek: input.type === "ALWAYS" ? [] : (input.daysOfWeek ?? []),
    startTime: input.type === "ALWAYS" ? undefined : input.startTime,
    endTime: input.type === "ALWAYS" ? undefined : input.endTime,
    timezone: input.timezone?.trim() || initialState.settings.timezone,
    active: input.active ?? true,
  };
  let state: FoodFlowState = {
    ...initialState,
    menuAvailabilities: [
      ...initialState.menuAvailabilities,
      availability,
    ],
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "AVAILABILITY_CREATED",
    entityType: "MENU_AVAILABILITY",
    entityId: availability.id,
    summary: `Created menu availability ${availability.name}`,
  });
  return { state, value: availability.id };
};

export const updateAvailability = (
  initialState: FoodFlowState,
  availabilityId: string,
  patch: AvailabilityPatch,
  actorId?: string,
): FoodFlowState => {
  const availability = initialState.menuAvailabilities.find(
    (candidate) => candidate.id === availabilityId,
  );
  if (!availability) throw new Error("Menu availability was not found.");
  if (patch.name !== undefined && !patch.name.trim()) {
    throw new Error("Availability name cannot be empty.");
  }
  const merged = { ...availability, ...patch };
  validateAvailability(merged.type, merged.startTime, merged.endTime);
  const next: MenuAvailability = {
    ...merged,
    name: merged.name.trim(),
    timezone: merged.timezone.trim(),
    daysOfWeek: merged.type === "ALWAYS" ? [] : merged.daysOfWeek,
    startTime: merged.type === "ALWAYS" ? undefined : merged.startTime,
    endTime: merged.type === "ALWAYS" ? undefined : merged.endTime,
  };
  let state: FoodFlowState = {
    ...initialState,
    menuAvailabilities: initialState.menuAvailabilities.map((candidate) =>
      candidate.id === availabilityId ? next : candidate,
    ),
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "AVAILABILITY_UPDATED",
    entityType: "MENU_AVAILABILITY",
    entityId: availability.id,
    summary: `Updated menu availability ${next.name}`,
  });
  return state;
};

export const menuRepository = {
  createMenuItem,
  updateMenuItem,
  duplicateMenuItem,
  archiveMenuItem,
  publishMenuItem,
  setMenuItemStatus,
  createModifierGroup,
  updateModifierGroup,
  createBadge,
  updateBadge,
  createAvailability,
  updateAvailability,
};
