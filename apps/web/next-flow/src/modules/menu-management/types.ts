export type ManagedMenuItemStatus = "DRAFT" | "ACTIVE" | "SOLD_OUT" | "HIDDEN" | "ARCHIVED";

export interface ManagedMenuCategory {
  readonly id: string;
  readonly restaurantId: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly active: boolean;
  readonly displayOrder: number;
}

export interface ManagedMenuAvailability {
  readonly id: string;
  readonly restaurantId: string;
  readonly name: string;
  readonly type: "ALWAYS" | "SCHEDULED";
  readonly timezone: string;
  readonly active: boolean;
}

export interface ManagedMenuItem {
  readonly id: string;
  readonly restaurantId: string;
  readonly restaurantName: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly availabilityId: string;
  readonly availabilityName: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly description: string;
  readonly thaiDescription: string | null;
  readonly imageUrl: string | null;
  readonly basePriceMinor: string;
  readonly currency: string;
  readonly preparationStation: string;
  readonly estimatedPreparationMinutes: number;
  readonly vegetarian: boolean;
  readonly status: ManagedMenuItemStatus;
  readonly displayOrder: number;
  readonly publishedAt: string | null;
  readonly archivedAt: string | null;
  readonly updatedAt: string;
}

export interface ManagedRestaurant {
  readonly id: string;
  readonly name: string;
  readonly currency: string;
  readonly timezone: string;
}

export interface MenuManagementSnapshot {
  readonly restaurants: readonly ManagedRestaurant[];
  readonly categories: readonly ManagedMenuCategory[];
  readonly availabilities: readonly ManagedMenuAvailability[];
  readonly items: readonly ManagedMenuItem[];
}

export interface UpdateManagedMenuItemInput {
  readonly name?: string;
  readonly thaiName?: string | null;
  readonly description?: string;
  readonly thaiDescription?: string | null;
  readonly imageUrl?: string | null;
  readonly basePriceMinor?: string;
  readonly categoryId?: string;
  readonly availabilityId?: string;
  readonly preparationStation?: string;
  readonly estimatedPreparationMinutes?: number;
  readonly vegetarian?: boolean;
  readonly status?: ManagedMenuItemStatus;
  readonly displayOrder?: number;
}
