export interface ManagedBranchSettings {
  readonly branchId: string;
  readonly branchName: string;
  readonly branchCode: string;
  readonly restaurantId: string;
  readonly restaurantName: string;
  readonly isOpen: boolean;
  readonly currency: string;
  readonly timezone: string;
  readonly serviceChargeEnabled: boolean;
  readonly serviceChargeBps: number;
  readonly vatEnabled: boolean;
  readonly vatBps: number;
  readonly defaultPreparationMinutes: number;
  readonly updatedAt: string;
}

export interface ManagementSettingsSnapshot {
  readonly branches: readonly ManagedBranchSettings[];
}

export interface UpdateManagedBranchSettingsInput {
  readonly isOpen?: boolean;
  readonly serviceChargeEnabled?: boolean;
  readonly serviceChargeBps?: number;
  readonly vatEnabled?: boolean;
  readonly vatBps?: number;
  readonly defaultPreparationMinutes?: number;
}
