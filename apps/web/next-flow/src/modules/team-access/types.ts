export type ManagedMembershipStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED";

export interface ManagedTeamMember {
  readonly membershipId: string;
  readonly userId: string;
  readonly displayName: string;
  readonly email: string | null;
  readonly userStatus: string;
  readonly membershipStatus: ManagedMembershipStatus;
  readonly roleId: string;
  readonly roleCode: string;
  readonly roleName: string;
  readonly branchId: string | null;
  readonly branchName: string | null;
  readonly authorityScope: "TENANT" | "BRANCH";
  readonly createdAt: string;
}

export interface ManagedRoleView {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly system: boolean;
  readonly permissionCodes: readonly string[];
  readonly memberCount: number;
}

export interface ManagedPermissionView {
  readonly code: string;
  readonly description: string | null;
}

export interface TeamAccessSnapshot {
  readonly members: readonly ManagedTeamMember[];
  readonly roles: readonly ManagedRoleView[];
  readonly permissions: readonly ManagedPermissionView[];
}

export interface UpdateManagedMembershipInput {
  readonly roleId?: string;
  readonly status?: Exclude<ManagedMembershipStatus, "INVITED">;
}

export interface CreateManagedRoleInput {
  readonly name: string;
  readonly code: string;
  readonly permissionCodes?: readonly string[];
}

export interface UpdateManagedRoleInput {
  readonly name?: string;
  readonly permissionCodes?: readonly string[];
}
