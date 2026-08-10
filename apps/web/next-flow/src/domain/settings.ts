import type { EntityId, ISODateTime } from "./shared";
import type { OpeningHours } from "./restaurant";

export interface RestaurantSettings {
  id: EntityId;
  restaurantId: EntityId;
  branchId: EntityId;
  restaurantName: string;
  logoUrl?: string;
  currency: "THB";
  timezone: "Asia/Bangkok" | (string & {});
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  vatEnabled: boolean;
  vatPercent: number;
  defaultPreparationMinutes: number;
  openingHours: OpeningHours[];
  updatedAt: ISODateTime;
}
