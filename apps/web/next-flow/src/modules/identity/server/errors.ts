import "server-only";

export class IdentityInputError extends Error {
  constructor(message = "Invalid identity input") {
    super(message);
    this.name = "IdentityInputError";
  }
}

export class CredentialEncodingError extends Error {
  constructor(message = "Invalid credential encoding") {
    super(message);
    this.name = "CredentialEncodingError";
  }
}

export class UnsupportedCredentialAlgorithmError extends Error {
  constructor() {
    super("Unsupported credential algorithm");
    this.name = "UnsupportedCredentialAlgorithmError";
  }
}

export class AuthenticationDatabaseError extends Error {
  constructor(cause?: unknown) {
    super("Authentication database operation failed", { cause });
    this.name = "AuthenticationDatabaseError";
  }
}

export class AuthenticationThrottleError extends Error {
  constructor(cause?: unknown) {
    super("Authentication throttle operation failed", { cause });
    this.name = "AuthenticationThrottleError";
  }
}
