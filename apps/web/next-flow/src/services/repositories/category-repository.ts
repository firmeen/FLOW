import type { Category, FoodFlowState } from "@/domain";
import { addAudit, createEntityId, now } from "./helpers";
import type {
  CategoryPatch,
  CreateCategoryInput,
  MutationResult,
  SettingsPatch,
} from "./types";

export const createCategory = (
  initialState: FoodFlowState,
  input: CreateCategoryInput,
  actorId?: string,
): MutationResult<string> => {
  if (!input.name.trim()) throw new Error("Category name is required.");
  const timestamp = now();
  const category: Category = {
    id: input.id ?? createEntityId("category"),
    restaurantId: initialState.restaurant.id,
    name: input.name.trim(),
    thaiName: input.thaiName?.trim() || undefined,
    description: input.description?.trim() || undefined,
    coverImageUrl: input.coverImageUrl?.trim() || undefined,
    displayOrder:
      input.displayOrder ??
      Math.max(
        0,
        ...initialState.categories.map((candidate) => candidate.displayOrder),
      ) +
        1,
    active: input.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  let state: FoodFlowState = {
    ...initialState,
    categories: [...initialState.categories, category],
  };
  state = addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "CATEGORY_CREATED",
    entityType: "CATEGORY",
    entityId: category.id,
    summary: `Created menu category ${category.name}`,
    timestamp,
  });
  return { state, value: category.id };
};

export const updateCategory = (
  initialState: FoodFlowState,
  categoryId: string,
  patch: CategoryPatch,
  actorId?: string,
): FoodFlowState => {
  const category = initialState.categories.find(
    (candidate) => candidate.id === categoryId,
  );
  if (!category) throw new Error("Category was not found.");
  if (patch.name !== undefined && !patch.name.trim()) {
    throw new Error("Category name cannot be empty.");
  }
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    categories: initialState.categories.map((candidate) =>
      candidate.id === categoryId
        ? { ...candidate, ...patch, updatedAt: timestamp }
        : candidate,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "CATEGORY_UPDATED",
    entityType: "CATEGORY",
    entityId: category.id,
    summary: `Updated menu category ${patch.name ?? category.name}`,
    timestamp,
  });
};

export const reorderCategory = (
  initialState: FoodFlowState,
  categoryId: string,
  direction: "UP" | "DOWN",
  actorId?: string,
): FoodFlowState => {
  const sorted = [...initialState.categories].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const index = sorted.findIndex((category) => category.id === categoryId);
  if (index < 0) throw new Error("Category was not found.");
  const targetIndex = direction === "UP" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return initialState;
  const current = sorted[index];
  const target = sorted[targetIndex];
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    categories: initialState.categories.map((category) =>
      category.id === current.id
        ? { ...category, displayOrder: target.displayOrder, updatedAt: timestamp }
        : category.id === target.id
          ? {
              ...category,
              displayOrder: current.displayOrder,
              updatedAt: timestamp,
            }
          : category,
    ),
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "CATEGORY_UPDATED",
    entityType: "CATEGORY",
    entityId: current.id,
    summary: `Moved ${current.name} ${direction.toLowerCase()}`,
    timestamp,
  });
};

export const updateSettings = (
  initialState: FoodFlowState,
  patch: SettingsPatch,
  actorId?: string,
): FoodFlowState => {
  if (
    patch.serviceChargePercent !== undefined &&
    (patch.serviceChargePercent < 0 || patch.serviceChargePercent > 100)
  ) {
    throw new Error("Service charge must be between 0 and 100 percent.");
  }
  if (
    patch.vatPercent !== undefined &&
    (patch.vatPercent < 0 || patch.vatPercent > 100)
  ) {
    throw new Error("VAT must be between 0 and 100 percent.");
  }
  const timestamp = now();
  const state: FoodFlowState = {
    ...initialState,
    settings: { ...initialState.settings, ...patch, updatedAt: timestamp },
    restaurant:
      patch.restaurantName === undefined
        ? initialState.restaurant
        : {
            ...initialState.restaurant,
            name: patch.restaurantName,
            updatedAt: timestamp,
          },
  };
  return addAudit(state, {
    actorId,
    fallbackActorId: "staff-owner",
    fallbackActorName: "Owner",
    action: "SETTINGS_UPDATED",
    entityType: "SETTINGS",
    entityId: initialState.settings.id,
    summary: "Updated restaurant settings",
    timestamp,
  });
};

export const categoryRepository = {
  createCategory,
  updateCategory,
  reorderCategory,
};
export const settingsRepository = { updateSettings };
