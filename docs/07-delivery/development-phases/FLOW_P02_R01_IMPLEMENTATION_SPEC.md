# FLOW P02 R01 — Implementation Specification

> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization  
> Round 01 — Identity & Pre-Authentication Data Boundary Hardening  
> Revision — Maximum-impact implementation and validation contract

---

## Metadata

- Phase: `02`
- Round: `01`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Implementation parent: `FIRST PHASE-02 ROUND — create from the latest verified Phase 01/current-main code baseline unless an explicit owner-approved active-chain parent exists at execution`
- Previous: `FLOW_P01_R06_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R02_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-22 12:00 Asia/Bangkok`
- Owner merge control: `YES`
- Agent merge allowed: `NO`
- Proposal issue: `#40`
- Original specification PR: `#41`
- Original specification merge SHA: `548d0cb74825d7317a5097921e2dad08fe5b4d40`
- Original specification blob SHA: `4cb2f3e130d26b503b280e3c5a59c2afea7ff686`
- Previous implementation PR: `#35`
- Previous implementation merge SHA: `ca745b7507f4aeba6515edbf7efd2fa706cb3689`
- Previous implementation final head SHA: `461abfbf69fac06260450af3029d49a27f88a800`
- Current implementation lineage note: `No P02/R01 implementation branch exists at this revision point; the round is READY / NOT STARTED.`
- Current hosted main protection: `OFF — inherited known governance state; P02/R01 must not claim or simulate a protection fix`
- Current planning scope: `PHASE 02 / ROUND 01 ONLY`
- Recommended implementation branch: `p02-r01-identity-boundary`
- Recommended implementation PR title: `fix(identity): establish P02 R01 pre-auth boundary`

> This revision intentionally increases **code impact, security impact, test depth, and handoff value** without expanding into later Phase 02 responsibilities. The goal is not to touch many files for appearance. The goal is to make the smallest set of high-leverage changes that removes the largest amount of architectural risk before Auth.js cutover.

---

# 0. Revision Intent and Priority Rule

This executable revision supersedes weaker or less-specific wording from the original P02/R01 document while preserving the same Phase, Round, Previous, Next, and target branch.

The implementation agent must prioritize work in this exact order:

```text
1. SECURITY / AUTHORITY BOUNDARY
2. DATABASE INVARIANTS
3. SERVER TRANSACTION / REPOSITORY BOUNDARY
4. CREDENTIAL VERIFICATION PRIMITIVES
5. THROTTLE STATE MACHINE
6. NEGATIVE AUTHORIZATION TESTS
7. CLEAN RESET / GENERATED TYPE / RUNTIME VALIDATION
8. LEGACY-AUTH REGRESSION
9. DOCUMENTATION ONLY WHEN IT SUPPORTS IMPLEMENTATION
```

Do **not** spend the round on:

- cosmetic documentation;
- UI polish;
- dependency upgrades that do not unlock R01;
- refactors unrelated to identity/security;
- route renaming;
- speculative abstractions with no validation path.

Every implementation change must answer at least one of these questions:

```text
Does this remove an authentication/security ambiguity?
Does this reduce privilege?
Does this make identity deterministic?
Does this make credential verification reusable/testable?
Does this make failure atomic/fail-closed?
Does this prevent a future Auth.js cutover defect?
Does this prove a negative access path?
Does this make DB/runtime behavior observable through tests?
```

If the answer is `NO` to all, the change does not belong in R01.

---

# 1. Current Repository Baseline

The implementation agent must re-fetch and re-read current `main` before creating code. Authoring-time facts are evidence, not permission to skip re-audit.

Current verified baseline at this revision:

```text
MAIN_SHA:
548d0cb74825d7317a5097921e2dad08fe5b4d40

P02/R01_SPEC:
PRESENT + READY

P02/R01_IMPLEMENTATION_BRANCH:
ABSENT

P02/R01_IMPLEMENTATION_STATE:
NOT STARTED
```

Current implementation facts already verified from source:

1. Internal auth still uses a custom shared credential path.
2. `foodflow_session` is still the custom cookie authority.
3. Custom session tokens are still issued through JOSE/HS256.
4. The temporary user identity is not a real `app.users.id` actor.
5. `/api/auth/login` still validates environment-backed credentials rather than database-backed identity.
6. Internal staff/kitchen/cashier/admin protection does not yet derive from real membership/permissions.
7. Auth.js packages are already present; R01 must not spend work reinstalling them.
8. `app.users`, `app.roles`, `app.permissions`, `app.role_permissions`, and `app.memberships` already exist.
9. `private.user_credentials` already exists with `algorithm = scrypt-v1`.
10. `private.login_throttles` already exists.
11. `flow_identity` exists as an actor-bound role and is **not** suitable for pre-auth credential discovery.
12. `flow_runtime` exists for tenant/branch/actor domain transactions.
13. Existing R04 authorization semantics are accepted and must remain green.
14. `withIdentityTransaction(actorId, ...)` requires a known actor and therefore cannot be used for pre-authentication.
15. Current `Pool`/Kysely runtime is lazy/global and reused, making transaction-local role safety important.

---

# 2. Phase 02 Objective

Phase 02 must end with one coherent internal human identity path:

```text
LOGIN IDENTIFIER
→ CREDENTIAL VERIFICATION
→ REAL app.users.id
→ AUTH.JS SESSION
→ ACTIVE MEMBERSHIP
→ TENANT / BRANCH ACCESS CONTEXT
→ PERMISSION CHECK
→ ACTOR-AWARE DB TRANSACTION
→ RLS DEFENSE IN DEPTH
→ REVOCATION / SESSION INVALIDATION
```

Phase 02 is not complete until the temporary shared credential/session authority can be removed without losing authentication, authorization, tenant isolation, branch isolation, revocation behavior, route enforcement, or test coverage.

The six-round decomposition remains:

```text
P02/R01
Identity + Pre-Authentication Boundary

P02/R02
Deterministic Credential Fixtures
+ Authorization Contract Verification

P02/R03
Auth.js Credentials Authentication
+ Session Authority Cutover

P02/R04
Workspace / AccessContext Resolution
+ Revocation / Membership Change Semantics

P02/R05
Route + Command Authorization
+ Permission Enforcement Integration

P02/R06
Atomic Legacy Auth Removal
+ Security Acceptance
```

R01 must make R02/R03 substantially safer by doing the highest-impact structural work first.

---

# 3. R01 Maximum-Impact Objective

R01 must establish a production-shaped **pre-authentication security boundary** while deliberately keeping the legacy login/session live until R03.

The completed R01 branch must contain all of the following capabilities:

```text
CANONICAL LOGIN IDENTITY
+
DATABASE-ENFORCED NORMALIZED EMAIL UNIQUENESS
+
NARROW PRE-AUTH DATABASE ROLE
+
EXECUTE-ONLY PRIVATE AUTH FUNCTIONS
+
ATOMIC LOGIN THROTTLE STATE MACHINE
+
SERVER-ONLY AUTH TRANSACTION
+
SERVER-ONLY CREDENTIAL REPOSITORY
+
VERSIONED SCRYPT VERIFICATION PRIMITIVE
+
SAFE DUMMY VERIFICATION PATH
+
STRICT ERROR BOUNDARY
+
ROLE / CONTEXT LEAK REGRESSION TESTS
+
PRIVILEGE MATRIX NEGATIVE TESTS
+
FRESH DATABASE RESET PROOF
+
GENERATED TYPE PROOF
+
APPLICATION BUILD PROOF
```

The key design principle is:

> R01 builds the secure machinery. R03 connects that machinery to Auth.js and replaces the live session authority.

---

# 4. Mandatory Entry Gate

Before creating `p02-r01-identity-boundary`, the implementation run must verify:

- [ ] current `main` fetched;
- [ ] this exact spec exists on `main`;
- [ ] `Status = READY`;
- [ ] `Phase = 02`;
- [ ] `Round = 01`;
- [ ] `Previous = FLOW_P01_R06_IMPLEMENTATION_SPEC.md`;
- [ ] `Next = FLOW_P02_R02_IMPLEMENTATION_SPEC.md`;
- [ ] current `FLOW_MERGE_POLICY.md` read from `main`;
- [ ] current development README read from `main`;
- [ ] `CONTRIBUTING.md` read where relevant;
- [ ] `apps/web/next-flow/AGENTS.md` read;
- [ ] relevant local Next.js 16.3 docs under `node_modules/next/dist/docs/` read before application code changes;
- [ ] no existing active `p02-r01-*` branch exists;
- [ ] no current-main commit has already implemented or superseded the R01 boundary;
- [ ] no current-main Auth.js live cutover exists;
- [ ] no production DB mutation is required;
- [ ] current stable CI workflows are understood.

If a P02/R01 branch appears before execution begins, do not create a second branch. Inspect and continue the active branch only if it is clearly the authorized R01 lineage branch.

---

# 5. Scope Boundary

## 5.1 In Scope

R01 owns:

- canonical normalized login email representation;
- uniqueness enforcement for normalized login identity;
- migration collision preflight;
- pre-authentication database role/capability;
- fixed-search-path private credential lookup function;
- fixed-search-path private throttle functions;
- atomic throttle update semantics;
- server authentication transaction helper;
- server credential repository;
- server credential verification primitive;
- server dummy verification primitive for timing-equivalent unknown-user handling in later live login;
- safe auth-domain error types;
- minimal auth-domain policy constants needed by the throttle/verifier;
- DB role privilege tests;
- function execution grant tests;
- credential state tests;
- user status tests;
- normalized-email collision tests;
- throttle concurrency/transition tests where practical;
- role/context cleanup tests;
- generated DB type update/drift proof;
- stable CI compatibility.

## 5.2 Explicitly Out of Scope

R01 must not:

- switch `/api/auth/login` to database credentials;
- create an Auth.js route handler;
- create the final Auth.js Credentials provider;
- replace `foodflow_session`;
- remove JOSE legacy token code;
- remove `FOODFLOW_INTERNAL_*` variables;
- implement workspace selection;
- implement tenant/branch chooser UI;
- implement session revocation product behavior;
- enforce product routes by permissions;
- change staff/kitchen/cashier/admin route authorization behavior;
- implement customer account auth;
- implement customer cart/order persistence;
- implement kitchen/realtime/payment/voice features;
- mutate production data;
- add broad generic auth framework abstractions.

---

# 6. Code Impact Strategy

R01 should maximize **useful** code impact through six high-leverage implementation slices.

## Slice A — Identity Determinism

Fix ambiguity at the data model level.

Expected impact:

- one canonical normalized email;
- one user per normalized email;
- no whitespace/case duplicates;
- predictable indexed lookup;
- migration fails before creating ambiguous authority.

## Slice B — Database Privilege Boundary

Create an execute-only pre-auth role.

Expected impact:

- application can discover a credential candidate without DB owner access;
- pre-auth role cannot read users/credentials/domain tables directly;
- privilege can be tested independently from application code;
- Auth.js cutover does not require weakening RLS/table grants.

## Slice C — Credential + Throttle Functions

Create private functions as the only DB authentication capability.

Expected impact:

- narrow result shape;
- inactive/disabled user denial centralized;
- throttle writes atomic;
- public/normal runtime roles cannot call capability;
- future auth provider uses one stable contract.

## Slice D — Server Identity Module

Create server-only transaction/repository/verifier/error/policy utilities.

Expected impact:

- database details not leaked to route/UI code;
- credential hash remains inside trusted server path;
- algorithm handling versioned;
- unknown-user dummy verification possible;
- future Auth.js adapter becomes thin integration instead of security logic.

## Slice E — Security Regression Suite

Add positive + negative tests across SQL and Node runtime.

Expected impact:

- privilege mistakes fail CI;
- identity ambiguity fails CI;
- role leakage fails CI;
- R04 isolation regressions remain detectable;
- later rounds can change auth safely with inherited tests.

## Slice F — Build / Type / CI Integration

Make the new boundary part of normal quality checks.

Expected impact:

- generated DB types stay authoritative;
- clean local reset recreates the full boundary;
- app build exercises server module imports;
- stable checks stay meaningful.

---

# 7. Existing Surfaces to Re-Audit

The implementation agent must inspect these files on the actual parent branch before editing:

```text
apps/web/next-flow/package.json
apps/web/next-flow/package-lock.json
apps/web/next-flow/.env.example
apps/web/next-flow/AGENTS.md
apps/web/next-flow/src/app/(auth)/login/login-form.tsx
apps/web/next-flow/src/app/(auth)/login/page.tsx
apps/web/next-flow/src/app/api/auth/login/route.ts
apps/web/next-flow/src/app/api/auth/logout/route.ts
apps/web/next-flow/src/lib/auth/config.ts
apps/web/next-flow/src/lib/auth/session.ts
apps/web/next-flow/src/lib/auth/token.ts
apps/web/next-flow/src/proxy.ts
apps/web/next-flow/src/server/db/client.ts
apps/web/next-flow/src/server/db/config.ts
apps/web/next-flow/src/server/db/context.ts
apps/web/next-flow/src/server/db/identity-transaction.ts
apps/web/next-flow/src/server/db/transaction.ts
apps/web/next-flow/src/server/db/types.ts
apps/web/next-flow/src/server/db/index.ts
apps/web/next-flow/src/server/db/generated/database.ts
apps/web/next-flow/tests/integration/auth-session.test.ts
apps/web/next-flow/tests/integration/database-runtime.test.ts
supabase/migrations/20260816050000_phase2_foodflow_database_baseline.sql
supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql
supabase/migrations/20260819095500_p01_r04_actor_authorization_baseline.sql
supabase/seed.sql
supabase/tests/database/phase2_database_baseline.test.sql
supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql
.github/workflows/stable-quality-gates.yml
```

Do not assume a path is unchanged just because this spec names it.

---

# 8. Required File Impact

The exact final diff may vary after current-branch re-audit, but the implementation should normally have impact comparable to the following.

## 8.1 Files to CREATE

```text
supabase/migrations/20260822120000_p02_r01_identity_pre_auth_boundary.sql
supabase/tests/database/p02_r01_identity_pre_auth_boundary.test.sql
apps/web/next-flow/src/server/db/authentication-transaction.ts
apps/web/next-flow/src/modules/identity/server/types.ts
apps/web/next-flow/src/modules/identity/server/errors.ts
apps/web/next-flow/src/modules/identity/server/policy.ts
apps/web/next-flow/src/modules/identity/server/email.ts
apps/web/next-flow/src/modules/identity/server/credential-repository.ts
apps/web/next-flow/src/modules/identity/server/password-verifier.ts
apps/web/next-flow/src/modules/identity/server/login-throttle.ts
apps/web/next-flow/src/modules/identity/server/index.ts
apps/web/next-flow/tests/unit/identity-email.test.ts
apps/web/next-flow/tests/unit/identity-password-verifier.test.ts
apps/web/next-flow/tests/unit/identity-login-throttle.test.ts
apps/web/next-flow/tests/integration/authentication-database.test.ts
```

If existing current code has an equivalent canonical module, extend it instead of duplicating responsibility.

## 8.2 Files likely to MODIFY

```text
apps/web/next-flow/src/server/db/index.ts
apps/web/next-flow/src/server/db/generated/database.ts
apps/web/next-flow/src/server/db/README.md            # only if present
.github/workflows/stable-quality-gates.yml             # only minimum role provisioning if required
```

## 8.3 Files NOT to MODIFY by default

```text
apps/web/next-flow/src/app/api/auth/login/route.ts
apps/web/next-flow/src/app/api/auth/logout/route.ts
apps/web/next-flow/src/lib/auth/config.ts
apps/web/next-flow/src/lib/auth/session.ts
apps/web/next-flow/src/lib/auth/token.ts
apps/web/next-flow/src/proxy.ts
apps/web/next-flow/src/app/(auth)/login/*
supabase/seed.sql
```

Touching these files requires an explicit compile/test reason. Runtime behavior must remain unchanged in R01.

---

# 9. Database Design — Canonical Identity

## 9.1 Normalization Rule

The authoritative normalized login email is:

```text
lower(btrim(email))
```

Server helper and database lookup must produce equivalent results.

Minimum accepted behavior:

```text
" Owner@Flow.Test "
→ "owner@flow.test"

"OWNER@FLOW.TEST"
→ "owner@flow.test"
```

Whitespace-only or empty identifiers must not become a valid login key.

## 9.2 Generated Normalized Identity

Preferred high-impact schema contract:

```text
app.users.normalized_email
```

implemented as a generated stored value or an equivalently deterministic indexed representation derived from `email`.

Preferred semantic shape:

```sql
case
  when email is null then null
  else lower(btrim(email))
end
```

If a generated column is incompatible with current tooling, use an equivalent functional unique index plus a server/database normalization helper. The implementation PR must explain the chosen approach.

## 9.3 Collision Preflight

Before enforcing the new normalized uniqueness contract, migration must detect collisions such as:

```text
User A: owner@flow.test
User B:  OWNER@FLOW.TEST 
```

Expected behavior:

```text
COLLISION FOUND
→ MIGRATION FAILS
→ CLEAR DETERMINISTIC ERROR
→ NO ARBITRARY WINNER
→ NO SILENT DATA DELETE
```

A migration must never choose one user based on creation order, UUID order, or first row returned.

## 9.4 Unique Contract

After successful migration:

- two non-null users cannot share the same normalized email;
- null email remains permitted if current domain requires it;
- lookup by normalized email is index-supported;
- unique enforcement survives case and surrounding-space differences.

## 9.5 Email Validation Boundary

R01 server normalization must reject or treat as invalid:

- non-string input;
- empty string;
- whitespace-only string;
- unreasonably large input.

The helper must not attempt complex RFC mailbox validation that creates a second inconsistent authority. Basic structural validation is enough; normalized DB identity remains authoritative.

Recommended maximum raw email input length for pre-auth processing:

```text
320 characters
```

If current project validation has a stricter canonical limit, use the existing limit.

---

# 10. Database Design — Pre-Authentication Role

Create or equivalently establish:

```text
flow_authenticator
NOLOGIN
NOBYPASSRLS
```

## 10.1 Allowed privileges

Only what is required to execute approved authentication functions:

```text
USAGE on private schema
EXECUTE on approved private auth functions
```

If function resolution requires another schema usage grant, add the narrowest necessary grant and prove it in tests.

## 10.2 Forbidden privileges

`flow_authenticator` must not receive direct broad table privileges on:

```text
app.users
app.organizations
app.branches
app.memberships
app.roles
app.permissions
app.role_permissions
private.user_credentials
private.login_throttles
foodflow.*
payments.*
audit.*
```

It must not receive:

```text
BYPASSRLS
CREATEDB
CREATEROLE
SUPERUSER
REPLICATION
LOGIN
```

## 10.3 Existing role isolation

Do not convert `flow_identity` into a pre-auth role.

Do not give `flow_runtime` credential read access.

Required conceptual separation:

```text
flow_authenticator
= before identity is trusted

flow_identity
= after actor identity is known, self/membership reads

flow_runtime
= tenant/branch/actor domain operations
```

---

# 11. Database Design — Private Authentication Functions

All security-definer functions must:

- be in `private`;
- have explicit fixed `search_path`;
- use schema-qualified sensitive tables where practical;
- receive parameter values only;
- avoid dynamic SQL;
- revoke default/public execute;
- grant execute only to the intended role;
- return minimal data;
- never return raw user/domain rows unnecessarily.

## 11.1 Credential Candidate Lookup

Preferred conceptual function:

```text
private.lookup_login_credential(login_email text)
```

Minimum result:

```text
user_id uuid
normalized_email text
password_hash text
algorithm text
password_changed_at timestamptz
```

Return a candidate only when all are true:

```text
user exists
AND normalized email matches
AND user.status = ACTIVE
AND credential row exists
AND credential.disabled_at IS NULL
AND algorithm is supported by current contract
```

Unknown/inactive/disabled/missing-credential states must all map to **no eligible candidate** at repository boundary.

## 11.2 No tenant authority during lookup

Credential discovery must not accept tenant ID or branch ID from login input.

R01 must preserve this rule:

```text
LOGIN IDENTIFIES USER
MEMBERSHIP LATER IDENTIFIES ALLOWED TENANT/BRANCH
```

## 11.3 Throttle Read Function

Preferred conceptual function:

```text
private.get_login_throttle(subject_digest text, observed_at timestamptz default now())
```

Return only safe state:

```text
failure_count
window_started_at
blocked_until
is_blocked
```

## 11.4 Atomic Failure Function

Preferred conceptual function:

```text
private.record_login_failure(
  subject_digest text,
  observed_at timestamptz,
  failure_limit integer,
  window_seconds integer,
  block_seconds integer
)
```

The operation must be atomic under concurrent failures.

Required semantics:

```text
NO ROW
→ create window + count 1

ROW WITH EXPIRED WINDOW
→ reset window + count 1

ROW WITH ACTIVE WINDOW
→ increment

COUNT REACHES LIMIT
→ blocked_until = observed_at + block duration

ALREADY BLOCKED
→ remain blocked at least until existing blocked_until
```

Do not allow:

- negative counts;
- client-controlled arbitrary decrement;
- clearing a block through failure calls;
- race where concurrent requests both see old count and lose increments.

## 11.5 Clear Success Function

Preferred conceptual function:

```text
private.clear_login_failures(subject_digest text)
```

Successful authentication may clear/reset the subject state later in R03.

R01 must implement and test the capability without wiring it to the live route.

---

# 12. Auth Policy Constants

Create one server-only policy module for values that later Auth.js code can consume.

Recommended initial contract unless current security policy already specifies stricter values:

```text
LOGIN_FAILURE_LIMIT = 5
LOGIN_FAILURE_WINDOW_SECONDS = 900
LOGIN_BLOCK_SECONDS = 900
MAX_LOGIN_EMAIL_LENGTH = 320
MAX_PASSWORD_INPUT_LENGTH = 1024
```

These are not product configuration UI values in R01.

Tests must reference exported policy values rather than duplicate magic numbers across multiple files.

If implementation chooses different values because existing project policy already defines them, document the authoritative source in the PR.

---

# 13. Server Database Transaction Boundary

Create:

```text
apps/web/next-flow/src/server/db/authentication-transaction.ts
```

Conceptual API:

```ts
export async function withAuthenticationTransaction<T>(
  callback: (trx: DatabaseTransaction) => Promise<T>,
): Promise<T>
```

Required behavior:

1. call existing lazy DB runtime;
2. begin transaction;
3. `SET LOCAL ROLE flow_authenticator`;
4. do not set `app.actor_id`;
5. do not set `app.tenant_id`;
6. do not set `app.branch_id`;
7. execute callback;
8. commit/rollback normally;
9. role returns automatically after transaction;
10. callback receives only transaction abstraction, not unrestricted pool administration.

## 13.1 Why transaction-local role is mandatory

The pool is reused globally. A non-local role/session mutation could leak authorization state across requests.

Therefore these are forbidden:

```text
SET ROLE flow_authenticator          # session-level without LOCAL
SET app.actor_id = ...               # session-level
SET app.tenant_id = ...              # session-level
SET app.branch_id = ...              # session-level
```

## 13.2 Cleanup validation

Integration tests must prove that after auth transaction completion:

- the next normal query is not still under `flow_authenticator`;
- no actor setting has been introduced;
- no tenant setting has been introduced;
- no branch setting has been introduced.

---

# 14. Server Identity Module

Create a purposeful server-only module:

```text
src/modules/identity/server/
```

Expected files:

```text
types.ts
errors.ts
policy.ts
email.ts
credential-repository.ts
password-verifier.ts
login-throttle.ts
index.ts
```

Every file must include/derive from server-only boundaries as appropriate.

No client component may import this module.

---

# 15. Credential Repository Contract

The repository is the only application-level path allowed to invoke private auth functions.

Conceptual API:

```ts
findActiveCredentialCandidateByEmail(email: string)
readLoginThrottle(subjectDigest: string)
recordLoginFailure(subjectDigest: string, now?: Date)
clearLoginFailures(subjectDigest: string)
```

## 15.1 Repository must not

- issue cookies;
- issue JWTs;
- import Auth.js provider code;
- choose workspace;
- choose tenant;
- choose branch;
- map role names to UI;
- return raw database client;
- return arbitrary private table rows;
- catch all DB errors and pretend user is simply invalid;
- log password hash.

## 15.2 Result types

Credential candidate should be minimal and explicit, for example:

```ts
interface CredentialCandidate {
  userId: string;
  normalizedEmail: string;
  passwordHash: string;
  algorithm: "scrypt-v1";
  passwordChangedAt: Date;
}
```

Do not add tenant/branch/membership fields to this candidate in R01.

---

# 16. Password Verification Primitive

To maximize R01 impact, implement the credential verification primitive now, but keep it disconnected from the live login route.

Expected file:

```text
src/modules/identity/server/password-verifier.ts
```

## 16.1 Required capabilities

```text
parse versioned encoded credential
validate supported algorithm
perform scrypt derivation
constant-time derived-key compare
reject malformed encodings
reject unsupported algorithms
reject excessive input sizes
provide dummy verification path
```

## 16.2 Existing algorithm authority

Database currently declares:

```text
scrypt-v1
```

R01 must not silently replace that with bcrypt, PBKDF2, Argon2, SHA-256, or provider-specific hashing.

If the repository has no existing exact `scrypt-v1` string serialization format, R01 must define **one canonical versioned encoding contract** in code and tests.

The implementation PR must document the chosen format and parameters.

The format must include enough information to verify existing encoded values without global hidden parameters, such as:

```text
version / cost parameters / salt / derived key
```

Do not store plaintext password.

## 16.3 Scrypt safety

Use Node's cryptographic primitive rather than a custom KDF implementation.

Password comparison must use a constant-time byte comparison such as `timingSafeEqual` after equal-length normalization.

Malformed hashes must produce a typed verification failure, not an uncaught parser crash.

## 16.4 Dummy verification

Create a server-side dummy verification path for later R03 use when no eligible credential candidate exists.

Purpose:

```text
UNKNOWN USER
and
KNOWN USER + WRONG PASSWORD
```

should not have a trivial structural timing difference caused by skipping password derivation entirely.

R01 does not need to prove perfect network-level constant timing. It must prevent the obvious zero-KDF unknown-user path.

## 16.5 Input bounds

Do not perform expensive KDF work on unbounded password input.

Recommended maximum input length:

```text
1024 characters
```

Reject larger inputs through a typed auth-domain validation failure before scrypt.

---

# 17. Login Throttle Server Adapter

Create a narrow server wrapper around database throttle functions.

Responsibilities:

- validate digest shape/length;
- apply policy constants;
- pass observed time explicitly in tests;
- map DB result to safe typed state;
- never expose raw database errors to client response;
- never silently reset corrupted throttle state.

The adapter must not be wired to the current `/api/auth/login` in R01.

---

# 18. Auth-Domain Error Contract

Create typed internal errors sufficient to distinguish operational handling without creating browser-visible user enumeration.

Recommended internal categories:

```text
IdentityInputError
CredentialEncodingError
UnsupportedCredentialAlgorithmError
AuthenticationDatabaseError
AuthenticationThrottleError
```

Do not create public error categories such as:

```text
EmailNotFoundError
SuspendedUserError
DisabledCredentialError
```

that later route code could accidentally expose distinctly.

Unknown/inactive/disabled candidate should normally resolve as `null`/no candidate at repository layer.

---

# 19. Generated Database Types

Schema changes must be reflected in generated Kysely types.

R01 must:

1. clean-reset local DB;
2. run type generation;
3. inspect diff;
4. commit only expected generated changes;
5. run drift verification;
6. ensure server repository compiles against generated types.

Do not manually edit generated database type output to make CI green.

If `normalized_email` is generated, generated type must reflect its select/insert/update semantics correctly.

---

# 20. SQL Security Test Plan

Create a dedicated SQL test file with a high negative-test ratio.

Minimum test groups follow.

## 20.1 Role attributes

Assert `flow_authenticator`:

- exists;
- cannot login;
- does not bypass RLS;
- is not superuser;
- cannot create role;
- cannot create database.

## 20.2 Direct table denial

Under `flow_authenticator`, direct select must fail on at least:

```text
app.users
app.memberships
private.user_credentials
private.login_throttles
foodflow.orders
payments.payments
audit.events
```

Test representative schemas, not every table mechanically.

## 20.3 Function grant matrix

Approved functions:

```text
flow_authenticator → EXECUTE = YES
public             → EXECUTE = NO
anon               → EXECUTE = NO
authenticated      → EXECUTE = NO
flow_runtime        → EXECUTE = NO unless explicitly justified
flow_identity       → EXECUTE = NO unless explicitly justified
```

## 20.4 Credential eligibility

Test:

```text
ACTIVE user + enabled credential      → candidate
SUSPENDED user + credential           → no candidate
DEACTIVATED user + credential         → no candidate
ACTIVE user + disabled credential     → no candidate
ACTIVE user + no credential           → no candidate
unknown email                         → no candidate
```

## 20.5 Normalized email

Test:

```text
case difference → same authority key
surrounding whitespace → same authority key
collision insert/update → rejected
null email → permitted only according to current schema contract
empty normalized email → cannot become valid login identity
```

## 20.6 Throttle state

Test:

```text
first failure
repeated failure
window reset
limit reached
block created
blocked request remains blocked
clear success state
non-negative counts
```

Where pgTAP concurrency simulation is impractical, concurrency-sensitive behavior must be validated at Node integration level or through SQL atomicity inspection plus sequential transition tests.

## 20.7 Existing R04 regression

All existing actor-aware authorization tests must continue to pass without modification that weakens their assertions.

---

# 21. Node Unit Test Plan

## 21.1 Email helper

Test:

- lowercasing;
- trim;
- deterministic repeated normalization;
- empty rejection;
- whitespace rejection;
- max-length rejection;
- already-normalized input;
- Unicode handling must be deterministic and not locale-browser dependent.

## 21.2 Password verifier

Test:

- known valid test vector passes;
- wrong password fails;
- malformed hash fails safely;
- unsupported algorithm fails safely;
- bad base64/hex segment fails safely;
- wrong derived-key length fails safely;
- max password length enforced;
- dummy verify executes the KDF path;
- timing compare requires equal buffers and does not fall back to normal string equality.

Do not commit a real user password in tests.

## 21.3 Throttle adapter

Test mapping of:

- no block;
- active block;
- expiry boundary;
- failure limit;
- policy constants;
- malformed digest;
- typed DB failure.

## 21.4 Error redaction

Where error messages are asserted, ensure they do not contain:

```text
password
password_hash value
AUTH_SECRET
DATABASE_URL
session token
raw credential encoding beyond safe test fixture identifiers
```

---

# 22. Node Database Integration Test Plan

Create/extend runtime tests against local Supabase.

Minimum scenarios:

## 22.1 Authentication transaction

Inside transaction:

```text
current role / effective role corresponds to flow_authenticator
actor setting empty/unset
tenant setting empty/unset
branch setting empty/unset
```

After transaction:

```text
no leaked flow_authenticator session role
no leaked actor/tenant/branch setting
```

## 22.2 Repository candidate lookup

Use test-only setup data.

Test active vs inactive/disabled cases.

Do not add reusable login passwords to permanent seed.

## 22.3 Private function-only access

From application runtime path:

- approved repository function succeeds;
- attempted direct private-table query under pre-auth role fails.

## 22.4 Rollback

Throw inside auth transaction after a throttle mutation and verify transactional behavior is consistent with the chosen design.

If throttle failure recording is intentionally designed to commit separately from credential verification transaction, document that boundary and test it explicitly. Do not accidentally lose failed-attempt recording through a later thrown auth error.

This is important: **failure accounting must not be silently rolled back by an unrelated application exception.**

## 22.5 Pool reuse

Run multiple auth/runtime transactions in sequence to detect role/context pollution.

---

# 23. Throttle Transaction Semantics Decision

R01 must make one explicit decision and test it.

Recommended design:

```text
credential lookup transaction
→ short / read-oriented

failed-attempt recording transaction
→ separate short atomic transaction

success clear transaction
→ separate short atomic transaction
```

Reason:

If lookup + verification + failure recording occur inside one transaction and application code throws after recording, a rollback may erase the security event.

Therefore repository/service architecture should not rely on one large transaction spanning KDF work.

Do not hold a DB transaction open during expensive scrypt derivation unless there is a concrete correctness requirement.

Preferred future flow for R03:

```text
normalize identifier
→ read throttle
→ if blocked, perform safe handling
→ lookup candidate
→ close DB transaction
→ perform KDF in application process
→ record failure OR clear failures using short DB transaction
→ create Auth.js session only on verified active user
```

R01 should build primitives that make this future flow possible.

---

# 24. Performance and Resource Safety

R01 is not a performance optimization round, but auth endpoints are abuse-sensitive.

Required safeguards:

- normalized email lookup must be indexed;
- no full user table scan for login;
- no unbounded input passed to KDF;
- DB transactions remain short;
- KDF does not run inside an unnecessarily open database transaction;
- throttle writes use primary-key/indexed subject digest;
- no N+1 membership lookup is introduced because membership resolution is not part of R01.

If an `EXPLAIN` or catalog inspection clearly proves the normalized-email index is missing/unusable, fix the index in R01.

Do not add caching of credential hashes.

---

# 25. Logging and Observability Boundary

No full auth audit event pipeline is required yet.

However new code must establish safe logging behavior.

Allowed safe fields in internal errors/logging:

```text
operation name
error class
correlation identifier if already available
boolean blocked state
safe status code category
```

Forbidden:

```text
raw password
password hash
credential salt/derived key
AUTH_SECRET
FOODFLOW_SESSION_SECRET
DATABASE_URL
full session token
raw login throttle secret if a secret-based digest is later used
```

Do not log whether a specific email exists.

---

# 26. Legacy Auth Regression Contract

R01 intentionally leaves the legacy live path operational.

The following must remain behaviorally true until R03:

```text
existing temporary configured credential can still log in
existing custom session can still be created/verified
existing logout still clears legacy session
existing protected internal route flow does not unexpectedly break
```

Existing `auth-session.test.ts` must remain green.

Do not rewrite legacy tests to accept broken behavior.

A test may be extended only if it clarifies unchanged behavior.

---

# 27. CI / Workflow Impact

Current stable contexts must continue to exist:

```text
Phase/Round Gate
Repository Integrity
Dependency Integrity
Next Flow Quality
Supabase Database Quality
```

Vercel remains deployment evidence.

Because R01 changes application server code + Supabase scope:

```text
Next Flow Quality
= REAL APPLICABLE RUN EXPECTED

Supabase Database Quality
= REAL APPLICABLE RUN EXPECTED
```

`Dependency Integrity` may legitimately take a successful N/A path if package files are untouched.

If local DB runtime tests require the CI postgres login to assume the new role, change only the role provisioning line necessary to grant test login membership in `flow_authenticator`.

Do not redesign the stable workflow.

---

# 28. Validation Commands

Use actual current repository scripts as authority.

Expected application path:

```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm run test
npm run build:next
```

Expected database path from repository root:

```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

Expected generated/runtime path from app directory:

```bash
npm run db:generate
npm run db:verify-types
npm run test:db-runtime
```

If current script names differ, use current package/workflow names and record them exactly.

Do not fabricate local execution. If only GitHub Actions ran a check, label it GitHub Actions evidence.

Allowed evidence states only:

```text
PASS
FAIL
BLOCKED
NOT RUN
NOT APPLICABLE
```

---

# 29. Required Validation Matrix

Before the implementation PR is considered ready for owner review, record this matrix.

| Area | Required result |
|---|---|
| Spec/Phase authorization | PASS |
| Repository topology | PASS |
| Clean dependency install | PASS or explicit N/A only when dependency files unchanged |
| Lint | PASS |
| Typecheck | PASS |
| Unit tests | PASS |
| Integration tests | PASS |
| Next build | PASS |
| Clean Supabase start | PASS |
| Clean DB reset | PASS |
| Seed | PASS |
| New SQL auth tests | PASS |
| Existing P01/R04 SQL auth tests | PASS |
| DB lint | PASS |
| DB type generation | PASS |
| Generated type drift | PASS |
| DB runtime integration | PASS |
| Vercel preview | PASS or truthful external status |

Any mandatory `FAIL` means the round is not ready.

---

# 30. Negative Security Matrix

The implementation PR must include evidence that the following are denied.

| Actor / Role | Action | Expected |
|---|---|---|
| public | execute credential lookup | DENY |
| anon | execute credential lookup | DENY |
| authenticated | execute credential lookup | DENY |
| flow_runtime | direct credential table read | DENY |
| flow_identity | direct credential table read | DENY |
| flow_authenticator | direct credential table read | DENY |
| flow_authenticator | direct users table broad read | DENY |
| flow_authenticator | direct memberships broad read | DENY |
| flow_authenticator | FoodFlow order read | DENY |
| flow_authenticator | payments read | DENY |
| flow_authenticator | audit read | DENY |
| flow_authenticator | approved credential function | ALLOW |
| flow_authenticator | approved throttle function | ALLOW |

A single positive test is not enough. R01 success requires negative privilege proof.

---

# 31. Identity State Matrix

Credential lookup behavior must satisfy:

| User status | Credential state | Candidate |
|---|---|---|
| ACTIVE | enabled | YES |
| ACTIVE | disabled | NO |
| ACTIVE | missing | NO |
| INVITED | enabled | NO unless current user status model explicitly treats invited as authenticatable, which must be justified |
| SUSPENDED | enabled | NO |
| DEACTIVATED | enabled | NO |
| missing user | n/a | NO |

Do not infer membership in this lookup.

An ACTIVE user with no ACTIVE membership may still have a credential candidate; membership/workspace rejection belongs to later access-context logic. Authentication and authorization must remain conceptually separate.

---

# 32. Failure Handling Matrix

| Failure | Required behavior |
|---|---|
| DB unavailable | typed server failure; no hardcoded fallback credential |
| malformed credential encoding | typed verification failure; no crash/secret leak |
| unsupported algorithm | typed verification failure; no automatic downgrade |
| unknown email | no candidate; later live route uses generic auth failure |
| inactive user | no candidate |
| disabled credential | no candidate |
| malformed throttle digest | reject before DB mutation |
| throttle DB error | typed failure; do not silently clear security state |
| normalized-email collision during migration | deterministic migration failure |
| role grant too broad | SQL test failure |
| role/context leak | runtime test failure |
| generated type drift | CI failure |
| legacy auth regression | application test/build failure |

---

# 33. Migration Safety Rules

The P02/R01 migration must be forward-only.

Never rewrite:

```text
20260816050000_phase2_foodflow_database_baseline.sql
20260816070000_phase4_auth_rbac_tenancy.sql
20260819095500_p01_r04_actor_authorization_baseline.sql
```

Migration must be deterministic on clean reset.

Do not swallow unexpected errors with overly broad exception blocks.

Allowed idempotent handling is limited to objects that can legitimately pre-exist because of local replay conventions. Unexpected conflicts should fail loudly.

No destructive production data cleanup is authorized.

---

# 34. Production Safety Boundary

R01 may validate only local/test Supabase.

Forbidden:

```text
supabase db reset against production
production credential insertion
production password migration
production role grant
production user normalization backfill executed manually
production secret rotation
production auth provider cutover
```

This specification defines repository implementation and testable migration behavior only.

---

# 35. Dependency Policy

Default expectation:

```text
NO NEW NPM DEPENDENCY
```

Use existing Node crypto, Kysely, pg, Vitest, Supabase tooling.

A new dependency is allowed only if:

1. current platform APIs cannot safely implement the required primitive;
2. security impact is explicitly justified;
3. lockfile is updated deterministically;
4. dependency integrity check runs real work;
5. package is not added only for convenience.

Auth.js packages are already present and do not need reinstallation.

---

# 36. No Broad Refactor Rule

R01 must not reorganize unrelated code under the banner of identity architecture.

Do not:

- rename all DB files;
- move unrelated modules;
- replace Kysely;
- replace pg pool;
- replace Vitest;
- replace Supabase migration tooling;
- convert all routes to new patterns;
- update Tailwind/UI libraries;
- change unrelated ESLint rules.

High impact means strong security/behavioral impact, not broad churn.

---

# 37. Implementation Order

Recommended exact order:

```text
01 FETCH + RE-AUDIT MAIN
02 CREATE p02-r01-identity-boundary
03 ADD FORWARD MIGRATION
04 ADD NORMALIZED EMAIL CONTRACT
05 ADD flow_authenticator ROLE
06 ADD PRIVATE LOOKUP FUNCTION
07 ADD PRIVATE THROTTLE FUNCTIONS
08 ADD SQL SECURITY TESTS
09 CLEAN DB RESET + SQL TEST
10 GENERATE TYPES
11 ADD authentication-transaction.ts
12 ADD identity/server types/errors/policy/email
13 ADD credential repository
14 ADD password verifier + test vectors
15 ADD throttle adapter
16 ADD UNIT TESTS
17 ADD DB RUNTIME INTEGRATION TESTS
18 RUN EXISTING R04 REGRESSION
19 RUN LINT / TYPECHECK / TEST
20 RUN NEXT BUILD
21 RUN FULL DB QUALITY
22 OPEN IMPLEMENTATION PR
23 RECORD ACTUAL EVIDENCE
24 STOP — DO NOT MERGE
```

Implementing SQL tests early is intentional: privilege design should fail quickly before application code depends on it.

---

# 38. Expected Diff Quality

A good R01 diff should look like a focused identity/security subsystem, not scattered patches.

Expected characteristics:

- one new forward migration;
- one dedicated SQL test file;
- one narrow DB transaction helper;
- one cohesive identity server module;
- focused unit/integration tests;
- generated DB type update;
- at most minimal CI/DB export edits;
- no UI churn;
- no live auth route cutover;
- no package churn unless justified.

The implementation PR should make it obvious where future R03 Auth.js provider code will plug in.

---

# 39. Definition of Done — Data Model

All required:

- [ ] normalized email authority defined;
- [ ] uniqueness covers case + surrounding whitespace;
- [ ] migration detects collisions before enforcement;
- [ ] no silent duplicate resolution;
- [ ] lookup is index-supported;
- [ ] generated DB type reflects schema change;
- [ ] clean reset reproduces schema.

---

# 40. Definition of Done — Privilege Boundary

All required:

- [ ] `flow_authenticator` or approved equivalent exists;
- [ ] NOLOGIN;
- [ ] NOBYPASSRLS;
- [ ] no superuser/create-role/create-db capability;
- [ ] no direct credentials table read;
- [ ] no direct throttle table read;
- [ ] no broad user/membership/domain reads;
- [ ] approved functions executable;
- [ ] public/anon/authenticated execution denied;
- [ ] flow_runtime/flow_identity credential access not broadened.

---

# 41. Definition of Done — Credential Boundary

All required:

- [ ] active enabled candidate lookup works;
- [ ] unknown user returns no candidate;
- [ ] inactive user returns no candidate;
- [ ] disabled credential returns no candidate;
- [ ] missing credential returns no candidate;
- [ ] raw password hash stays server-only;
- [ ] repository result has no tenant/branch authority;
- [ ] no credential hash serialized to client/log.

---

# 42. Definition of Done — Password Primitive

All required:

- [ ] `scrypt-v1` supported;
- [ ] canonical encoding/parse contract documented in code/tests if previously absent;
- [ ] Node crypto primitive used;
- [ ] constant-time compare used;
- [ ] malformed encoding rejected safely;
- [ ] unsupported algorithm rejected safely;
- [ ] input length bounded;
- [ ] dummy verification path exists;
- [ ] valid/invalid test vectors pass;
- [ ] no live route uses it yet.

---

# 43. Definition of Done — Throttle Boundary

All required:

- [ ] read capability exists;
- [ ] atomic failure recording exists;
- [ ] failure window behavior tested;
- [ ] block threshold behavior tested;
- [ ] clear/reset capability exists;
- [ ] failure count cannot become negative;
- [ ] concurrent update design does not use read-then-write race from application code;
- [ ] expensive KDF is not unnecessarily inside throttle DB transaction;
- [ ] failed-attempt state cannot be silently rolled back by later app exception due to poor transaction design.

---

# 44. Definition of Done — Server Transaction

All required:

- [ ] auth transaction helper is server-only;
- [ ] uses transaction-local role;
- [ ] does not set actor;
- [ ] does not set tenant;
- [ ] does not set branch;
- [ ] rollback behaves correctly;
- [ ] role/context leakage test passes;
- [ ] existing tenant transaction semantics remain unchanged;
- [ ] existing identity transaction semantics remain unchanged.

---

# 45. Definition of Done — Regression / Quality

All required:

- [ ] existing legacy auth tests PASS;
- [ ] existing actor/RLS tests PASS;
- [ ] new SQL tests PASS;
- [ ] new unit tests PASS;
- [ ] new DB integration tests PASS;
- [ ] lint PASS;
- [ ] typecheck PASS;
- [ ] Next build PASS;
- [ ] DB reset PASS;
- [ ] DB lint PASS;
- [ ] generated type drift PASS;
- [ ] stable GitHub contexts truthful;
- [ ] no production DB mutation.

---

# 46. Explicit Non-Goals / Prohibitions

```text
NO AUTH.JS LIVE CUTOVER
NO LIVE /api/auth/login DATABASE CUTOVER
NO SESSION COOKIE REPLACEMENT
NO LEGACY AUTH REMOVAL
NO WORKSPACE SELECTOR
NO ROUTE PERMISSION CUTOVER
NO CUSTOMER AUTH
NO CUSTOMER ORDER WORK
NO KITCHEN WORK
NO PAYMENT WORK
NO REALTIME WORK
NO VOICE WORK
NO SECOND USER TABLE
NO SECOND MEMBERSHIP TABLE
NO SECOND PERMISSION MODEL
NO BROAD PRIVATE TABLE GRANTS
NO DB OWNER/SUPERUSER APPLICATION AUTH PATH
NO PLAINTEXT PASSWORD
NO REVERSIBLE PASSWORD STORAGE
NO FAST HASH AS PASSWORD KDF
NO DEFAULT PASSWORD IN seed.sql
NO PASSWORD/HASH/TOKEN LOGGING
NO PRODUCTION DB RESET
NO DIRECT PUSH TO main
NO IMPLEMENTATION PR MERGE BY AGENT
NO AUTO-MERGE OF IMPLEMENTATION PR
NO P02/R02 IMPLEMENTATION WITHOUT ITS READY SPEC ON main
```

---

# 47. PR Requirements

Create exactly one implementation PR for P02/R01.

Required metadata:

```text
Specification: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
Phase: 02
Round: 01
Previous: FLOW_P01_R06_IMPLEMENTATION_SPEC.md
```

Required PR evidence:

```text
IMPLEMENTATION_PARENT_BRANCH
IMPLEMENTATION_PARENT_SHA
IMPLEMENTATION_BRANCH
IMPLEMENTATION_HEAD_SHA
MIGRATION_PATH
DATABASE_ROLE_NAME
PRIVATE_FUNCTION_NAMES
NORMALIZED_EMAIL_STRATEGY
PASSWORD_ENCODING_STRATEGY
THROTTLE_POLICY_VALUES
FILES_CREATED
FILES_MODIFIED
PACKAGE_CHANGED YES/NO
PRODUCTION_DB_MODIFIED NO
AUTHJS_LIVE_CUTOVER NO
LEGACY_AUTH_REMOVED NO
```

Then record validation matrix with actual outcomes.

Do not claim a local command ran if only GitHub Actions ran it.

---

# 48. Owner-Controlled Merge Boundary

Implementation automation must stop after:

```text
implementation
+ validation
+ PR create/update
```

It must not:

- merge the implementation PR;
- enable auto-merge;
- push implementation directly to main.

The owner controls integration timing.

The next round branch may still descend from the latest implementation branch when P02/R02 spec exists and is READY, according to current branch-chain policy.

---

# 49. Handoff to P02/R02

R02 must inherit a strong R01 baseline:

```text
REAL DATABASE LOGIN IDENTITY KEY
+
NARROW PRE-AUTH ROLE
+
PRIVATE CREDENTIAL LOOKUP
+
PRIVATE ATOMIC THROTTLE FUNCTIONS
+
SERVER AUTH TRANSACTION
+
SERVER CREDENTIAL REPOSITORY
+
SCRYPT VERIFICATION PRIMITIVE
+
DUMMY KDF PATH
+
STRICT ERROR BOUNDARY
+
NEGATIVE PRIVILEGE TESTS
+
FRESH DB RESET PROOF
+
LEGACY AUTH STILL LIVE
```

R02 can then focus on deterministic identity/credential fixtures and authorization contract verification instead of spending its round inventing basic auth machinery.

Expected R02 code parent:

```text
p02-r01-identity-boundary
```

or the exact approved R01 branch recorded by the implementation PR.

---

# 50. Final R01 Acceptance Test

R01 implementation is acceptable only if every answer below is correct:

```text
Spec READY on main?                               YES
Correct first P02 branch created?                 YES
Historical migrations rewritten?                 NO
Normalized login identity deterministic?         YES
Case/space duplicate authority prevented?        YES
Collision migration fails safely?                YES
Pre-auth role narrow?                             YES
Pre-auth role can login directly?                 NO
Pre-auth role bypasses RLS?                       NO
Pre-auth role reads credential table directly?   NO
Pre-auth role reads domain tables broadly?        NO
Approved private lookup works?                    YES
Inactive user candidate?                          NO
Disabled credential candidate?                    NO
Throttle transitions atomic?                      YES
Throttle failure can be lost by app rollback?     NO by design/test
Server auth transaction exists?                   YES
Actor/tenant/branch set from login input?          NO
Server credential repository exists?              YES
Scrypt verifier exists?                           YES
Constant-time compare used?                       YES
Dummy KDF path exists?                            YES
Credential hash exposed to client/log?            NO
Existing R04 actor/RLS baseline preserved?        YES
Legacy temporary login remains live?              YES
Auth.js live cutover performed?                   NO
Fresh Supabase reset passes?                      YES
SQL security tests pass?                          YES
DB lint passes?                                   YES
Generated type drift passes?                      YES
DB runtime tests pass?                            YES
Lint/typecheck/tests/build pass?                  YES
Production DB modified?                           NO
Implementation PR merged by agent?                NO
```

If any required answer differs, P02/R01 is not complete.

---

# 51. Development Gate

The execution sequence is:

```text
READ CURRENT MAIN
        ↓
VERIFY THIS READY SPEC
        ↓
VERIFY NO ACTIVE P02/R01 BRANCH
        ↓
CREATE p02-r01-identity-boundary
        ↓
IMPLEMENT IDENTITY DETERMINISM
        ↓
IMPLEMENT PRE-AUTH ROLE
        ↓
IMPLEMENT PRIVATE LOOKUP + THROTTLE FUNCTIONS
        ↓
WRITE NEGATIVE SQL TESTS
        ↓
CLEAN RESET + DB TEST
        ↓
GENERATE TYPES
        ↓
IMPLEMENT AUTH TRANSACTION
        ↓
IMPLEMENT IDENTITY SERVER MODULE
        ↓
IMPLEMENT SCRYPT VERIFIER + DUMMY PATH
        ↓
IMPLEMENT THROTTLE ADAPTER
        ↓
WRITE UNIT + DB INTEGRATION TESTS
        ↓
RUN FULL APPLICATION QUALITY
        ↓
RUN FULL DATABASE QUALITY
        ↓
OPEN/UPDATE ONE P02/R01 PR
        ↓
STOP
        ↓
OWNER CONTROLS MERGE
```

Current branch-chain gates remain:

```text
NO READY SPEC ON MAIN = NO DEVELOPMENT
NO ACTIVE ROUND BRANCH = CREATE CURRENT ROUND BRANCH
ACTIVE ROUND BRANCH + INCOMPLETE CODE = CONTINUE SAME ROUND
FAILED REQUIRED VALIDATION = ROUND NOT READY
NEXT ROUND REQUIRES ITS OWN READY SPEC ON MAIN
IMPLEMENTATION MERGE REMAINS OWNER-CONTROLLED
```

---

# 52. Implementation Agent Final Checklist

Before ending the R01 run, explicitly inspect and answer:

### Authority

- [ ] Did I read current `main`?
- [ ] Did I read this exact spec from `main`?
- [ ] Did I follow the correct implementation parent?

### Code impact

- [ ] Did I fix identity ambiguity at the DB level?
- [ ] Did I create the narrow pre-auth privilege boundary?
- [ ] Did I create reusable server auth primitives rather than route-specific hacks?
- [ ] Did I build the verifier needed by R03 without doing the R03 cutover?
- [ ] Did I implement atomic throttle state rather than leave a placeholder?

### Validation impact

- [ ] Did I add more negative authorization tests than superficial positive tests?
- [ ] Did I validate clean database bootstrap?
- [ ] Did I validate generated types?
- [ ] Did I validate pool/role isolation?
- [ ] Did I preserve legacy auth tests?
- [ ] Did I preserve R04 RLS tests?

### Scope

- [ ] Did I avoid UI churn?
- [ ] Did I avoid Auth.js live cutover?
- [ ] Did I avoid route permission work?
- [ ] Did I avoid unrelated product work?

### Delivery

- [ ] Did I record real evidence?
- [ ] Did I open/update exactly one R01 implementation PR?
- [ ] Did I avoid merge/auto-merge?

If all mandatory checks are satisfied, stop and hand off to owner review and later P02/R02 state evaluation.
