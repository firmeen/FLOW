import "server-only";

export interface CredentialCandidate {
  userId: string;
  normalizedEmail: string;
  passwordHash: string;
  algorithm: "scrypt-v1";
  passwordChangedAt: Date;
}

export interface LoginThrottleState {
  failureCount: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
  isBlocked: boolean;
}
