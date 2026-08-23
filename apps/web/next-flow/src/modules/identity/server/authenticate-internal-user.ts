import "server-only";

import { findActiveCredentialCandidateByEmail } from "./credential-repository";
import { normalizeLoginEmail } from "./email";
import { IdentityInputError } from "./errors";
import {
  clearLoginFailures,
  readLoginThrottle,
  recordLoginFailure,
} from "./login-throttle";
import { verifyPassword, performDummyPasswordVerification } from "./password-verifier";
import { MAX_PASSWORD_INPUT_LENGTH } from "./policy";
import { deriveLoginThrottleSubject } from "./throttle-subject";
import type { CredentialCandidate, LoginThrottleState } from "./types";

export interface AuthenticatedInternalUser {
  id: string;
  email: string;
}

export type InternalAuthenticationResult =
  | { status: "authenticated"; user: AuthenticatedInternalUser }
  | { status: "rejected"; reason: "invalid-credentials" | "blocked" }
  | { status: "unavailable" };

export interface InternalAuthenticationDependencies {
  normalizeEmail(input: unknown): string;
  deriveThrottleSubject(normalizedEmail: string): string;
  readThrottle(subjectDigest: string): Promise<LoginThrottleState | null>;
  findCandidate(normalizedEmail: string): Promise<CredentialCandidate | null>;
  verify(password: unknown, algorithm: string, encoded: string): Promise<boolean>;
  verifyDummy(password: unknown): Promise<void>;
  recordFailure(subjectDigest: string): Promise<LoginThrottleState>;
  clearFailures(subjectDigest: string): Promise<void>;
}

const defaultDependencies: InternalAuthenticationDependencies = {
  normalizeEmail: normalizeLoginEmail,
  deriveThrottleSubject: deriveLoginThrottleSubject,
  readThrottle: readLoginThrottle,
  findCandidate: findActiveCredentialCandidateByEmail,
  verify: verifyPassword,
  verifyDummy: performDummyPasswordVerification,
  recordFailure: recordLoginFailure,
  clearFailures: clearLoginFailures,
};

function isValidPasswordInput(password: unknown): password is string {
  return typeof password === "string" && password.length <= MAX_PASSWORD_INPUT_LENGTH;
}

export function createInternalAuthenticator(
  dependencies: InternalAuthenticationDependencies = defaultDependencies,
) {
  return async function authenticateInternalUser(
    email: unknown,
    password: unknown,
  ): Promise<InternalAuthenticationResult> {
    if (!isValidPasswordInput(password)) {
      return { status: "rejected", reason: "invalid-credentials" };
    }

    let normalizedEmail: string;
    try {
      normalizedEmail = dependencies.normalizeEmail(email);
    } catch (error) {
      if (error instanceof IdentityInputError) {
        return { status: "rejected", reason: "invalid-credentials" };
      }
      return { status: "unavailable" };
    }

    try {
      const subjectDigest = dependencies.deriveThrottleSubject(normalizedEmail);
      const throttle = await dependencies.readThrottle(subjectDigest);
      if (throttle?.isBlocked) {
        return { status: "rejected", reason: "blocked" };
      }

      const candidate = await dependencies.findCandidate(normalizedEmail);
      let verified = false;

      if (candidate) {
        verified = await dependencies.verify(
          password,
          candidate.algorithm,
          candidate.passwordHash,
        );
      } else {
        await dependencies.verifyDummy(password);
      }

      if (!candidate || !verified) {
        await dependencies.recordFailure(subjectDigest);
        return { status: "rejected", reason: "invalid-credentials" };
      }

      await dependencies.clearFailures(subjectDigest);
      return {
        status: "authenticated",
        user: {
          id: candidate.userId,
          email: candidate.normalizedEmail,
        },
      };
    } catch {
      return { status: "unavailable" };
    }
  };
}

export const authenticateInternalUser = createInternalAuthenticator();
