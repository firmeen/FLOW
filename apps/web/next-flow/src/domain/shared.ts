export type EntityId = string;
export type ISODateTime = string;
export type CurrencyCode = "THB" | (string & {});

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface TimeRange {
  opensAt: string;
  closesAt: string;
}
