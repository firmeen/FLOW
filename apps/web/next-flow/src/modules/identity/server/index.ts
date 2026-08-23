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
export { listActorWorkspaces } from "./workspace-repository";
export { resolveAccessContext, createAccessContextResolver } from "./resolve-access-context";
export {
  getCurrentAccessContext,
  getCurrentAccessResolution,
  requireCurrentAccessContext,
  withCurrentAccessTransaction,
} from "./current-access";
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
export type {
  AccessContext,
  AccessResolution,
  AccessScope,
  AccessSelector,
  AuthorizedDatabaseRequestContext,
  WorkspaceOption,
} from "./access-context";
export type { CurrentAccessOptions, CurrentAccessResolution } from "./current-access";
export type { CredentialCandidate, LoginThrottleState } from "./types";
