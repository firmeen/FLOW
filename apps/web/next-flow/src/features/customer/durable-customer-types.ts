export interface DurableCustomerStorefront {
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

export interface DurableCustomerMenuCategory {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly description: string | null;
  readonly coverImageUrl: string | null;
  readonly displayOrder: number;
}

export interface DurableCustomerMenuBadge {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly icon: string | null;
}

export interface DurableCustomerModifierChoice {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly priceDeltaMinor: string;
  readonly displayOrder: number;
}

export interface DurableCustomerModifierGroup {
  readonly id: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly kind: string;
  readonly required: boolean;
  readonly minimumSelections: number;
  readonly maximumSelections: number;
  readonly displayOrder: number;
  readonly choices: readonly DurableCustomerModifierChoice[];
}

export interface DurableCustomerMenuItem {
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
  readonly badges: readonly DurableCustomerMenuBadge[];
  readonly modifierGroups: readonly DurableCustomerModifierGroup[];
}

export interface DurableCustomerSnapshot {
  readonly storefront: DurableCustomerStorefront;
  readonly menu: {
    readonly categories: readonly DurableCustomerMenuCategory[];
    readonly items: readonly DurableCustomerMenuItem[];
  };
}

export interface DurableCartModifier {
  readonly id: string;
  readonly modifierGroupId: string;
  readonly modifierChoiceId: string;
  readonly modifierGroupName: string;
  readonly modifierChoiceName: string;
  readonly priceDeltaMinor: string;
}

export interface DurableCartItem {
  readonly id: string;
  readonly menuItemId: string;
  readonly menuItemName: string;
  readonly menuItemThaiName: string | null;
  readonly preparationStation: string;
  readonly quantity: number;
  readonly unitPriceMinor: string;
  readonly currency: string;
  readonly specialRequest: string | null;
  readonly modifiers: readonly DurableCartModifier[];
  readonly lineTotalMinor: string;
}

export interface DurableCartAggregate {
  readonly id: string;
  readonly status: "DRAFT" | "SUBMITTED" | "ABANDONED";
  readonly tableId: string;
  readonly tableSessionId: string | null;
  readonly items: readonly DurableCartItem[];
  readonly subtotalMinor: string;
  readonly currency: string | null;
}

export interface DurableSubmittedOrder {
  readonly id: string;
  readonly sourceCartId: string;
  readonly orderNumber: string;
  readonly status: "PENDING_CONFIRMATION";
  readonly customerStatus: "SENT";
  readonly submittedAt: string;
  readonly subtotalMinor: string;
  readonly currency: string;
}

export interface CustomerApiSuccess<T> {
  readonly ok: true;
  readonly data: T;
}

export interface CustomerApiFailure {
  readonly ok: false;
  readonly error: { readonly code: string };
}

export type CustomerApiResponse<T> = CustomerApiSuccess<T> | CustomerApiFailure;

export interface DurableCartDraft {
  readonly menuItemId: string;
  readonly quantity: number;
  readonly modifierChoiceIds: readonly string[];
  readonly specialRequest: string | null;
}
