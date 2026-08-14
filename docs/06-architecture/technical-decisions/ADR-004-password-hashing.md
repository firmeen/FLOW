---
title: "ADR-004: Password Hashing for Pilot Credentials"
document_id: FLOW-ADR-004
status: proposed
owner: Security Architecture
last_reviewed: 2026-08-14
---

# ADR-004: Password Hashing for Pilot Credentials

## Status

Proposed. Auth.js Credentials, the password library, database credential records, recovery flow, and deployment benchmarks do not yet exist. The current environment email/password comparison remains prototype-only.

## Context

The Dine-in Pilot requires individual Owner and Staff accounts using Auth.js as the sole identity/session authority. Credentials must support secure verification, parameter upgrades, password change/reset, generic failure handling, and the approved Node.js deployment runtime. A fast hash, plain SHA digest, reversible encryption, or environment-wide shared password is unacceptable.

## Decision

Use **Argon2id** through **`@node-rs/argon2`** for pilot password credentials in the Node.js runtime.

Initial security-review defaults are Argon2id version 19, 64 MiB memory, three iterations, parallelism one, at least a 16-byte cryptographically random salt, and a 32-byte output. The stored PHC string carries algorithm, version, parameters, salt, and hash. Parameters are configuration with a recorded security owner; they are benchmarked and may only be changed through review.

The target interactive verification budget is calibrated on the slowest approved runtime class before acceptance. If the native package cannot build/run reliably on the approved deployment, this ADR is revisited; the application must not silently fall back to a weaker or fast hash.

## Credential contract

- `app.password_credentials` links one active credential to a stable internal user and stores the PHC string, lifecycle timestamps, failed-attempt/rate-limit references as designed, and no plaintext.
- Login normalizes the identifier, retrieves the candidate account, and performs one comparable verification path. Unknown users use a maintained dummy PHC verification to reduce timing-based enumeration.
- External errors remain generic for unknown user, invalid password, suspended account, and inactive membership.
- A successful verification checks whether parameters require rehash and upgrades only after authentication inside a safe credential-update transaction.
- Password change verifies the current credential, applies policy and reuse rules, rotates the hash, records audit, and revokes sessions according to policy.
- Reset tokens are independent high-entropy values stored only as hashes, purpose-bound, expiring, one-use, rate-limited, and never logged or shown after issuance.
- Auth.js session records/revocations, not password hash metadata, determine active session authority.

## Runtime and secret rules

- Hashing and verification run only in the Node.js server runtime, never Proxy/Edge or browser code.
- Passwords, PHC strings, reset tokens, and dummy-hash configuration are never logged, emitted to analytics, stored in audit before/after payloads, or returned in DTOs.
- No global pepper is required for the pilot baseline. If introduced later, it is a versioned server secret with rotation/recovery design and a new security decision.
- Rate limiting is layered by identifier-safe key, IP/risk signal, and operation without creating a tenant-wide denial of service.

## Alternatives considered

| Alternative | Reason not selected |
|---|---|
| `bcryptjs` | Broad runtime compatibility, but Argon2id provides the preferred memory-hard baseline for a new credential store |
| Native `argon2` package | Suitable algorithm, but `@node-rs/argon2` is the selected pilot packaging candidate; deployment proof remains required |
| PBKDF2/WebCrypto | Portable fallback but not the preferred new-password baseline; would require a revised ADR and calibrated parameters |
| Supabase Auth passwords | Creates a second identity/session authority contrary to ADR-001 |
| SHA-256/SHA-512 password digest | Designed to be fast and explicitly prohibited |

## Validation before acceptance

- Correct, incorrect, malformed, legacy/rehash, and Unicode/password-policy cases pass.
- Unknown-user and wrong-password response content/status are indistinguishable; timing is reviewed statistically, not assumed.
- Benchmark and resource-exhaustion tests pass on local, CI, preview, and approved production runtime.
- Login rate limit, account suspension, password change, reset expiry/replay, session revocation, and audit tests pass.
- Dependency/native-binary scan and deployment build pass for the pinned package version.

## Related documents

- [Architecture Security](../security.md)
- [Application Architecture](../application-architecture.md)
- [Entry, Authentication and Session Map](../../05-product-specifications/foodflow/entry-authentication-map.md)

