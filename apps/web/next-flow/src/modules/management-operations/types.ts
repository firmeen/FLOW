export interface ManagementBranchPulse {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly isOpen: boolean;
  readonly activeSessions: number;
  readonly activeOrders: number;
  readonly openServiceRequests: number;
  readonly soldOutItems: number;
  readonly revenue24hMinor: number;
}

export interface ManagementRecentPayment {
  readonly id: string;
  readonly reference: string;
  readonly branchName: string;
  readonly tableLabel: string;
  readonly method: string;
  readonly status: string;
  readonly totalMinor: number;
  readonly recordedAt: string;
}

export interface ManagementServiceSignal {
  readonly id: string;
  readonly branchName: string;
  readonly tableLabel: string;
  readonly type: string;
  readonly status: string;
  readonly priority: string;
  readonly requestedAt: string;
}

export interface ManagementOverview {
  readonly generatedAt: string;
  readonly tenantName: string;
  readonly metrics: {
    readonly branches: number;
    readonly openBranches: number;
    readonly activeSessions: number;
    readonly activeOrders: number;
    readonly openServiceRequests: number;
    readonly soldOutItems: number;
    readonly revenue24hMinor: number;
  };
  readonly branches: readonly ManagementBranchPulse[];
  readonly recentPayments: readonly ManagementRecentPayment[];
  readonly serviceSignals: readonly ManagementServiceSignal[];
}
