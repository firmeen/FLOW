import type { CurrencyCode, DayOfWeek, EntityId, ISODateTime, TimeRange } from "./shared";

export interface OpeningHours {
  day: DayOfWeek;
  isClosed: boolean;
  ranges: TimeRange[];
}

export interface Restaurant {
  id: EntityId;
  name: string;
  legalName?: string;
  slug: string;
  logoUrl?: string;
  currency: CurrencyCode;
  timezone: string;
  branchIds: EntityId[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface BranchAddress {
  line1: string;
  line2?: string;
  district: string;
  city: string;
  postalCode: string;
  countryCode: string;
}

export interface Branch {
  id: EntityId;
  restaurantId: EntityId;
  name: string;
  code: string;
  address: BranchAddress;
  phone?: string;
  email?: string;
  isOpen: boolean;
  openingHours: OpeningHours[];
  tableIds: EntityId[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
