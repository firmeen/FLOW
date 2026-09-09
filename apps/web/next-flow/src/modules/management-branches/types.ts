export interface ManagedBranchProfile {
  readonly id: string;
  readonly restaurantId: string;
  readonly restaurantName: string;
  readonly name: string;
  readonly code: string;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly district: string | null;
  readonly city: string | null;
  readonly postalCode: string | null;
  readonly countryCode: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly isOpen: boolean;
  readonly updatedAt: string;
}

export interface ManagementBranchesSnapshot {
  readonly branches: readonly ManagedBranchProfile[];
}

export interface UpdateManagedBranchProfileInput {
  readonly name?: string;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly district?: string | null;
  readonly city?: string | null;
  readonly postalCode?: string | null;
  readonly countryCode?: string | null;
  readonly phone?: string | null;
  readonly email?: string | null;
}
