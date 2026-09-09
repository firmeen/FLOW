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

export interface ManagedInvitationRoleOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface ManagedInvitationBranchOption {
  readonly id: string;
  readonly code: string;
  readonly name: string;
}

export interface ManagedInvitationView {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roleId: string;
  readonly roleCode: string;
  readonly roleName: string;
  readonly branchId: string | null;
  readonly branchCode: string | null;
  readonly branchName: string | null;
  readonly status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly acceptedAt: string | null;
  readonly revokedAt: string | null;
}

export interface TeamInvitationWorkspace {
  readonly invitations: readonly ManagedInvitationView[];
  readonly roles: readonly ManagedInvitationRoleOption[];
  readonly branches: readonly ManagedInvitationBranchOption[];
}

export interface CreateTeamInvitationInput {
  readonly email: string;
  readonly displayName: string;
  readonly roleId: string;
  readonly branchId?: string | null;
  readonly expiresInHours?: number;
}

export interface CreatedTeamInvitation {
  readonly invitation: ManagedInvitationView;
  readonly token: string;
}

export interface TeamInvitationPreview {
  readonly invitationId: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly email: string;
  readonly displayName: string;
  readonly roleName: string;
  readonly branchName: string | null;
  readonly expiresAt: string;
  readonly active: boolean;
}

export interface TeamInvitationAcceptanceResult {
  readonly userId: string;
  readonly normalizedEmail: string;
  readonly existingCredential: boolean;
}
