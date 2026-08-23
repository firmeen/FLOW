import "server-only";

export interface CustomerStorefrontView {
  readonly restaurantId: string;
  readonly restaurantName: string;
  readonly branchId: string;
  readonly branchName: string;
  readonly branchCode: string;
  readonly isOpen: boolean;
  readonly tableId: string;
  readonly tableCode: string;
  readonly tableLabel: string;
}

export interface CustomerMenuCategoryView {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly description: string | null;
  readonly coverImageUrl: string | null;
  readonly displayOrder: number;
}

export interface CustomerMenuBadgeView {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly icon: string | null;
}

export interface CustomerModifierChoiceView {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly priceDeltaMinor: string;
  readonly displayOrder: number;
}

export interface CustomerModifierGroupView {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly kind: string;
  readonly required: boolean;
  readonly minimumSelections: number;
  readonly maximumSelections: number;
  readonly displayOrder: number;
  readonly choices: readonly CustomerModifierChoiceView[];
}

export interface CustomerMenuItemView {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly description: string;
  readonly thaiDescription: string | null;
  readonly imageUrl: string | null;
  readonly basePriceMinor: string;
  readonly currency: string;
  readonly vegetarian: boolean;
  readonly displayOrder: number;
  readonly badges: readonly CustomerMenuBadgeView[];
  readonly modifierGroups: readonly CustomerModifierGroupView[];
}

export interface CustomerMenuView {
  readonly categories: readonly CustomerMenuCategoryView[];
  readonly items: readonly CustomerMenuItemView[];
}

export interface CustomerStorefrontSnapshot {
  readonly storefront: CustomerStorefrontView;
  readonly menu: CustomerMenuView;
}
