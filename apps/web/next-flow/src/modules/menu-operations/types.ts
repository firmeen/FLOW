export type StaffMenuAvailability = "ACTIVE" | "SOLD_OUT";

export interface StaffMenuControlItem {
  readonly id: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly name: string;
  readonly thaiName: string | null;
  readonly priceMinor: number;
  readonly currency: string;
  readonly status: string;
  readonly station: string;
  readonly updatedAt: string;
}

export interface StaffMenuControlSnapshot {
  readonly generatedAt: string;
  readonly items: readonly StaffMenuControlItem[];
  readonly categories: readonly { readonly id: string; readonly name: string }[];
}
