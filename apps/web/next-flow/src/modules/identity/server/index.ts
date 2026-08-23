import "server-only";

export { normalizeLoginEmail } from "./email";
export {
  AuthenticationDatabaseError,
  AuthenticationThrottleError,
  CredentialEncodingError,
  IdentityInputError,
  UnsupportedCredentialAlgorithmError,
} from "./errors";
export { findActiveCredentialCandidateByEmail } from "./credential-repository";
export { clearLoginFailures, readLoginThrottle, recordLoginFailure } from "./login-throttle";
export { performDummyPasswordVerification, verifyPassword } from "./password-verifier";
export { authenticateInternalUser, createInternalAuthenticator } from "./authenticate-internal-user";
export { deriveLoginThrottleSubject } from "./throttle-subject";
export {
  LOGIN_BLOCK_SECONDS,
  LOGIN_FAILURE_LIMIT,
  LOGIN_FAILURE_WINDOW_SECONDS,
  MAX_LOGIN_EMAIL_LENGTH,
  MAX_PASSWORD_INPUT_LENGTH,
} from "./policy";
export type {
  AuthenticatedInternalUser,
  InternalAuthenticationDependencies,
  InternalAuthenticationResult,
} from "./authenticate-internal-user";
export type { CredentialCandidate, LoginThrottleState } from "./types";
