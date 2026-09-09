export interface ManagementActivityEvent {
  readonly id: string;
  readonly action: string;
  readonly summary: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly actorId: string | null;
  readonly actorName: string | null;
  readonly restaurantId: string | null;
  readonly branchId: string | null;
  readonly branchName: string | null;
  readonly reason: string | null;
  readonly occurredAt: string;
}

export interface ManagementActivitySnapshot {
  readonly events: readonly ManagementActivityEvent[];
}
