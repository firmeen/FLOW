export type OpeningDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ManagedOpeningWindow {
  readonly id: string | null;
  readonly day: OpeningDay;
  readonly isClosed: boolean;
  readonly startTime: string | null;
  readonly endTime: string | null;
}

export interface ManagedBranchHours {
  readonly branchId: string;
  readonly branchName: string;
  readonly branchCode: string;
  readonly timezone: string;
  readonly windows: readonly ManagedOpeningWindow[];
}

export interface ManagementHoursSnapshot {
  readonly branches: readonly ManagedBranchHours[];
}

export interface UpdateManagedOpeningWindowInput {
  readonly day: OpeningDay;
  readonly isClosed: boolean;
  readonly startTime: string | null;
  readonly endTime: string | null;
}
