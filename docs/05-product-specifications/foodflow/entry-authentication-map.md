---
title: FoodFlow Entry, Authentication and Session Map
document_id: FOODFLOW-SPEC-AUTH-ENTRY
status: proposed
owner: Identity Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Entry, Authentication and Session Map

## Current and target authority

| Concern | Current evidence | Pilot target | Proven status |
|---|---|---|---|
| Internal identity | Shared environment email/password | Auth.js Credentials with individual user records | Target only |
| Internal session | Custom signed `foodflow_session` JWT | Auth.js session plus database session registry/revocation | Target only |
| Account status | Environment configuration | Active/suspended/closed database state | Target only |
| Membership/branch | Not represented by authenticated session | Active membership resolved server-side per request | Target only |
| Customer identity | Sequential table route + browser customer token | Secure QR exchange to scoped guest session cookie | Target only |
| Permission | Authenticated internal routes share access | Action permission + tenant/branch/assignment | Target only |
| Recovery | None | Hashed, expiring, one-use reset token + outbox delivery | Target; delivery provider undecided |

The temporary login is a prototype gate, not a second supported authority. It is removed only after Auth.js cutover tests pass; production must never silently fall back to it.

## Entry map

| Entry | Audience | Authentication/capability | Redirect or denial | Data boundary |
|---|---|---|---|---|
| `/` | Evaluator/developer | Public | None | Launcher summary only; no operational state in production |
| `/login` | Internal user | Public form; existing valid session redirects safely | Allowlisted `next`, fallback `/staff` | No account-existence disclosure |
| `/r/[businessSlug]/[branchSlug]/table/[qrToken]` | Customer | Unpredictable, purpose-bound QR token exchanged server-side | Invalid/expired/revoked returns generic unavailable page | Public storefront DTO and guest-owned resources only |
| Legacy `/r/[restaurantSlug]/table/[tableCode]` | Development demo | No production authority | Production not found/disabled | Development fixture only |
| `/staff` | Floor/manager/owner | Auth.js + active membership | Login, forbidden, or branch-selection flow | Assigned branch order/table/service queries |
| `/kitchen` | Kitchen/manager/owner | Auth.js + `kitchen.view` + station assignment | Login or forbidden | Assigned branch/station tickets only |
| `/cashier` | Cashier/manager/owner | Auth.js + billing permissions | Login or forbidden | Assigned branch bills/payments only |
| `/admin` | Owner/manager | Auth.js + panel permission | Login or forbidden | Tenant/branch management projections |
| `/api/auth/[...nextauth]` | Internal identity flow | Auth.js handlers | Generic auth error | Identity/session fields only |
| `/api/customer/*` | Guest | Active guest cookie + CSRF/origin controls where applicable | Generic guest-session error | Bound branch/table/session/order only |
| `/api/operations/*` | Internal user | Auth.js + membership + permission | Stable authorization error | Resolved tenant/branch only |
| `/api/webhooks/omise/merchant-payments` | Omise | Provider-supported verification, not browser session | Non-2xx until durable evidence stored | Provider event/payment reference only |

## Internal session contract

1. Login normalizes the identifier, rate-limits attempts, retrieves the active user credential, and verifies the password with the approved password-hashing ADR.
2. A generic error is returned for unknown user, bad password, suspended account, or disallowed membership.
3. The session contains only stable user/session identifiers and expiry. Authorization data is resolved from the database; user-editable metadata is never trusted.
4. Every privileged request checks session expiry/revocation, user and organization status, active membership, selected branch, and required permission.
5. Branch switching validates membership and rotates or updates trusted server context. A client-provided tenant/branch ID is never authority.
6. Logout revokes the current session. “Revoke other devices” records revocations before acknowledgement.
7. Privileged session lifetime and step-up age are shorter than general browsing; exact durations remain a security configuration, not UI constants.
8. Actor, tenant, and branch are passed into a database transaction with parameterized `set_config(..., true)` calls and disappear after commit/rollback.

## Guest session contract

- QR tokens are cryptographically random, stored only as hashes, unique, purpose-bound, expiring, revocable, and rotatable.
- Successful exchange issues a high-entropy opaque guest cookie that is `HttpOnly`, `Secure` in production, appropriately `SameSite`, and no longer-lived than the database guest session.
- The guest session binds organization, branch, table, table session, purpose, expiry, and revocation state.
- A guest can read the public menu and only orders/service requests linked to that guest/table session.
- Editing a slug, table label, ID, or route parameter never changes authorization scope.
- Rotation occurs when table/session context changes. Closing the table invalidates further order mutations.

## Recovery and credential lifecycle

- Password credentials store an algorithm identifier, parameters, salt/hash output, created time, and changed time; plaintext is never persisted or logged.
- Reset tokens are random, stored as hashes, one-use, expiring, rate-limited, and revoke prior sessions after a successful reset according to policy.
- Until an email provider and delivery receipt are implemented, recovery may be a domain/outbox contract but must not be presented as delivered.
- Login success/failure, password change/reset, session revoke, membership suspension, and role elevation emit privacy-minimized audit events.

## Safe navigation

`next` accepts only same-origin internal paths rooted at `/staff`, `/kitchen`, `/cashier`, or `/admin`. Absolute URLs, protocol-relative URLs, encoded bypasses, and customer paths are rejected. Authentication success redirects only after the server has resolved at least one allowed membership/route.

