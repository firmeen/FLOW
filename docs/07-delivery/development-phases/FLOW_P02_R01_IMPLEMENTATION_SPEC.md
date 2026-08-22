# FLOW P02 R01 — Implementation Specification

> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization  
> Round 01 — Identity & Pre-Authentication Data Boundary Hardening

---

## Metadata

- Phase: `02`
- Round: `01`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Implementation parent: `FIRST PHASE-02 ROUND — create from the latest verified Phase 01 code baseline/current main unless an explicit owner-approved active-chain parent exists at execution`
- Previous: `FLOW_P01_R06_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R02_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-22 12:00 Asia/Bangkok`
- Owner merge control: `YES`
- Agent merge allowed: `NO`
- Proposal issue: `#40`
- Specification base SHA: `63468950c62600a0428ebe412eb2824ac4f4da05`
- Previous implementation PR: `#35`
- Previous implementation merge SHA: `ca745b7507f4aeba6515edbf7efd2fa706cb3689`
- Previous implementation final head SHA: `461abfbf69fac06260450af3029d49a27f88a800`
- Current implementation lineage note: `P01/R06 implementation was merged; its branch is not required to remain after integration. No prior P02 round branch exists yet.`
- Current hosted main protection: `OFF — known governance state; P02/R01 must not claim or simulate a protection fix`
- Current planning scope: `PHASE 02 / ROUND 01 ONLY`
- Recommended implementation branch: `p02-r01-identity-boundary`
- Recommended implementation PR title: `fix(identity): establish P02 R01 pre-auth data boundary`

> Workflow mechanics are governed by current `FLOW_MERGE_POLICY.md`. Policy/specification authority comes from current `main`. P02/R01 is the first branch of the Phase 02 implementation chain; subsequent P02 branches must descend from the latest P02 round branch.

---

## Execution Authority Statement

This file authorizes **P02/R01 only** after it exists on current `main` with `Status: READY`.

The implementation agent must re-fetch current `main` immediately before work begins and must not rely on this specification's authoring-time SHA as a substitute for the latest repository state.

P01/R06 implementation PR `#35` is already merged. The final R06 implementation head and current `main` were compared while preparing this specification. No application, database, runtime, dependency, or product code changed after that R06 implementation head; only development-policy documents changed before this specification was authored.

The repository still reports hosted `main` protection as disabled. That fact is recorded truthfully here. P02/R01 does **not** own GitHub-hosted branch-protection mutation and must not claim that the protection gap is fixed. This specification also does not rewrite the historical non-executable Phase 01 acceptance record merely to make its wording cosmetically current.

P02/R01 implementation is controlled by the current branch-chain policy and this exact specification. The round must stop if, at execution time, current `main` no longer contains this READY specification or a new blocking policy/spec amendment has landed.

The legal entry sequence is:

```text
FETCH CURRENT MAIN
→ READ README / FLOW_MERGE_POLICY / TEMPLATE / AGENTS
→ VERIFY FLOW_P02_R01_IMPLEMENTATION_SPEC.md EXISTS ON MAIN
→ VERIFY STATUS = READY
→ VERIFY PHASE/ROUND/PREVIOUS/NEXT METADATA
→ RE-AUDIT CURRENT IDENTITY/AUTH/DB FILES
→ CONFIRM NO P02 ROUND BRANCH ALREADY EXISTS
→ CREATE p02-r01-identity-boundary FROM THE VERIFIED FIRST-PHASE-02 BASELINE
→ IMPLEMENT EXACT R01 SCOPE
→ RUN REQUIRED VALIDATION
→ OPEN ONE P02/R01 IMPLEMENTATION PR
→ STOP FOR OWNER-CONTROLLED INTEGRATION
```

No P02/R02 implementation is authorized by this file.

---

# 1. Phase Objective

Phase 02 must replace FLOW's shared prototype internal-login authority with a real, database-backed staff/owner identity and authorization architecture that can safely support later operational persistence, realtime, payments, and product workflows.

At the end of all six P02 rounds, FLOW must have one coherent internal identity path in which:

```text
REAL APP.USER
+
DATABASE-BACKED CREDENTIAL / IDENTITY RECORD
+
AUTH.JS SESSION AUTHORITY
+
ACTIVE MEMBERSHIP RESOLUTION
+
TENANT / BRANCH ACCESS CONTEXT
+
PERMISSION-BASED SERVER ENFORCEMENT
+
RLS DEFENSE IN DEPTH
+
SESSION REVOCATION / MEMBERSHIP CHANGE RESPONSE
+
NO LEGACY SHARED INTERNAL CREDENTIAL AUTHORITY
```

The Phase 02 target is not merely "install Auth.js". `next-auth` and `@auth/core` are already present. The phase must connect identity, credentials, session state, membership, tenant/branch scope, permission checks, database request context, route access, and failure behavior without creating a second parallel authority model.

The intended six-round decomposition is:

```text
P02/R01
Identity & Pre-Authentication Data Boundary Hardening

P02/R02
Deterministic Identity Credential Fixtures
+
Authorization Contract Verification

P02/R03
Auth.js Credentials Authentication
+
Session Authority Cutover

P02/R04
Workspace / AccessContext Resolution
+
Revocation / Membership Change Semantics

P02/R05
Route + Command Authorization
+
Permission Enforcement Integration

P02/R06
Atomic Legacy Auth Removal
+
Phase 02 Security Acceptance
```

Phase 02 must preserve the Phase 01 actor-aware database baseline. It must not weaken tenant isolation or replace database authorization with browser-side role checks.

---

# 2. Phase Scope

## 2.1 Phase 02 In Scope

Across the six rounds, Phase 02 owns:

- real internal user identity based on `app.users`;
- credentials backed by the existing private credential model or a forward-compatible evolution of it;
- Auth.js as the single internal human session authority;
- secure credential verification and login throttling for the Credentials pilot path;
- membership-derived tenant and branch access;
- explicit permission resolution from roles and role-permission relationships;
- a server-side access context suitable for database transactions and route/command guards;
- revoked/suspended/deactivated identity handling;
- internal route access enforcement for staff, kitchen, cashier, admin/owner surfaces;
- server-side authorization for privileged operations;
- compatibility with the existing actor-aware RLS contract;
- removal of the temporary shared `FOODFLOW_INTERNAL_*` credential/session authority only after the replacement path is proven;
- tests covering authentication, authorization, tenant/branch denial, revocation, failure and regression paths.

## 2.2 Phase 02 Out of Scope

Phase 02 does not own:

- customer table capability architecture beyond preserving the public-customer boundary;
- customer cart/order persistence architecture;
- staff operational workflow redesign;
- kitchen persistence or station routing;
- realtime synchronization productization;
- Omise/Opn merchant payment runtime;
- Stripe SaaS billing runtime;
- Voice Ordering;
- MFA/step-up productization beyond ensuring the identity architecture can support it later;
- social OAuth unless separately approved by a future executable specification;
- production user migration from an external identity provider;
- production database destructive/reset operations;
- unrelated UI redesign;
- broad dependency modernization.

---

# 3. This Round Objective

P02/R01 must establish the **minimal narrow pre-authentication data plane** required for later Auth.js Credentials authentication while leaving the current runtime login/session path intact for this round.

The current database already has `app.users`, `private.user_credentials`, `private.login_throttles`, membership/role/permission tables, `flow_identity`, `flow_runtime`, actor helpers, and actor-aware RLS. The structural gap is that the application has no safe pre-authentication database boundary capable of resolving a login candidate before an actor ID is known.

`withIdentityTransaction(actorId, ...)` is explicitly post-identity because it requires a validated actor UUID before setting `flow_identity` and `app.actor_id`.

R01 must therefore make the repository able to answer:

```text
Can the server resolve a credential candidate without using a DB owner/superuser path?
YES

Can that pre-auth path avoid broad SELECT access to app/private/domain tables?
YES

Can login identity lookup use one canonical normalized-email contract?
YES

Can inactive/suspended/deactivated users fail closed?
YES

Can a disabled credential fail closed?
YES

Can login-throttle state be read/updated through a narrow capability?
YES

Can unauthorized roles call the private pre-auth functions directly?
NO

Can the pre-auth role read FoodFlow/order/payment domain tables broadly?
NO

Does the existing tenant/branch actor authorization behavior remain unchanged?
YES

Does the current shared temporary login/session remain the live runtime authority during R01?
YES

Has Auth.js session cutover happened in R01?
NO
```

R01 is an enabling security/data-boundary round. It is not the login cutover round.

---

# 4. Preconditions

Before P02/R01 implementation starts, verify all items against the latest repository state:

- [ ] `FLOW_P02_R01_IMPLEMENTATION_SPEC.md` exists on current `main`.
- [ ] The specification status is `READY`.
- [ ] Metadata Phase=`02`, Round=`01`, Previous=`FLOW_P01_R06_IMPLEMENTATION_SPEC.md`, Next=`FLOW_P02_R02_IMPLEMENTATION_SPEC.md` is intact.
- [ ] Current `FLOW_MERGE_POLICY.md` and development README are read from `main`.
- [ ] `apps/web/next-flow/AGENTS.md` is read.
- [ ] Relevant local Next.js 16.3 documentation under `apps/web/next-flow/node_modules/next/dist/docs/` is read before changing application code.
- [ ] Current `main` is fetched immediately before branch creation.
- [ ] No existing P02/R01 round branch is already the active implementation branch.
- [ ] Because P02/R01 is the first round in the Phase 02 chain, its implementation parent is resolved from the latest verified Phase 01/current-main code baseline according to current policy.
- [ ] Current authentication files are re-read; do not assume the authoring-time snapshot is unchanged.
- [ ] Current database migrations, seed, SQL tests, DB runtime tests and stable quality workflow are re-read.
- [ ] No unresolved current-main change has already introduced an Auth.js provider/session cutover.
- [ ] No production-linked Supabase reset/push is required to implement or validate this round.
- [ ] The known hosted-main-protection state is recorded truthfully and is not represented as repaired by R01.

If any precondition is false in a way that changes R01 architecture, stop and report the exact blocker rather than silently adapting beyond the spec.

---

# 5. Architecture Scope

## Frontend

No intentional frontend behavior redesign.

The current login UI may remain unchanged. R01 must not switch the form to Auth.js or expose database credential information to the client.

## Backend

Create a server-only identity/pre-authentication repository boundary that can:

- normalize a login identifier according to one canonical contract;
- request a credential candidate through a narrow DB capability;
- request/update throttle state through narrow DB capability;
- expose typed server-only results suitable for R03 Auth.js Credentials verification;
- avoid exporting unrestricted private-table queries to presentation code.

## Database

Add a forward migration that establishes a narrowly privileged pre-authentication role/capability and private functions around existing identity/credential/throttle data.

Do not create a second users/credentials/membership model.

## Authentication / Authorization

R01 prepares authentication data access but does **not** make Auth.js live.

Authorization work is limited to privilege boundaries required to keep pre-auth access narrow and to regression-proof existing actor-aware membership/RLS behavior.

## API / Integrations

No new external API/provider integration.

Current `/api/auth/login` and `/api/auth/logout` remain active in R01 unless a tiny internal refactor is strictly necessary for compilation; no behavior cutover is authorized.

## Payment

No changes.

## Notifications

No changes.

## Audit / Observability

No full login audit pipeline yet. R01 must ensure credential hashes, secrets, raw passwords, session tokens and raw throttle subjects are never logged by new code/tests.

## Infrastructure / CI

Supabase Database Quality and Next Flow Quality must execute on the R01 implementation PR because R01 changes database and application server code.

If a new database role must be granted to the local CI postgres login for runtime tests, update the existing local-role provisioning step narrowly. Do not redesign the quality workflow.

---

# 6. Existing Files and Current Behavior

The implementation agent must re-audit these exact surfaces before changes.

| Path | Current responsibility | R01 interpretation |
|---|---|---|
| `apps/web/next-flow/package.json` | Next 16.3, Auth.js packages, JOSE, Kysely, pg, tests | Auth.js dependencies already exist; no duplicate install |
| `apps/web/next-flow/.env.example` | temporary `FOODFLOW_*`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, DB variables | no new secret value may be committed |
| `apps/web/next-flow/src/app/(auth)/login/login-form.tsx` | posts email/password to custom `/api/auth/login` | preserve runtime behavior in R01 |
| `apps/web/next-flow/src/app/(auth)/login/page.tsx` | redirects if temp session; dev credential prefill | preserve in R01; cutover later |
| `apps/web/next-flow/src/app/api/auth/login/route.ts` | env-backed credential validation + custom session creation | remains live authority in R01 |
| `apps/web/next-flow/src/app/api/auth/logout/route.ts` | temporary session logout | preserve |
| `apps/web/next-flow/src/lib/auth/config.ts` | shared internal credential config + dev fallback | legacy authority retained temporarily |
| `apps/web/next-flow/src/lib/auth/session.ts` | custom `foodflow_session` cookie | retained until later cutover |
| `apps/web/next-flow/src/lib/auth/token.ts` | custom HS256 JWT with fixed internal user ID | retained until later cutover |
| `apps/web/next-flow/src/proxy.ts` | validates temp session for staff/kitchen/cashier/admin | no permission redesign in R01 |
| `apps/web/next-flow/tests/integration/auth-session.test.ts` | tests temporary shared auth/session | preserve as legacy regression until cutover |
| `apps/web/next-flow/src/server/db/identity-transaction.ts` | post-identity `flow_identity` transaction requiring actorId | must remain actor-bound; do not misuse for credential discovery |
| `apps/web/next-flow/src/server/db/transaction.ts` | tenant/branch/actor runtime transaction | preserve semantics |
| `supabase/migrations/20260816050000_phase2_foodflow_database_baseline.sql` | creates app.users/roles/permissions/memberships | historical migration; never rewrite |
| `supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql` | creates credential/throttle tables, flow_identity, auth helpers | historical migration; build forward from it |
| `supabase/migrations/20260819095500_p01_r04_actor_authorization_baseline.sql` | correct tenant-wide/branch permission semantics + sensitive mutation policies | must remain behaviorally intact |
| `supabase/seed.sql` | deterministic P01/R04 actors/memberships/roles, no credentials | do not add reusable default passwords in R01 |
| `supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql` | actor/RLS authorization regression | must remain green |
| `apps/web/next-flow/tests/integration/database-runtime.test.ts` | DB transaction/runtime integration | must remain green |
| `.github/workflows/stable-quality-gates.yml` | stable app/database/dependency contexts | narrow local-role provisioning change only if required |

Current important facts to preserve:

1. `app.users.email` has a case-insensitive unique index based on `lower(email)` when non-null.
2. Current application login lowercases/compares the configured email but does not use database users.
3. `private.user_credentials` stores `password_hash`, `algorithm = scrypt-v1`, timestamps and `disabled_at`.
4. `private.login_throttles` stores digest-based failure/window/block state.
5. Access to both private tables is revoked from public/anon/authenticated/flow_runtime/flow_identity.
6. `flow_identity` is actor-bound and not a pre-auth credential-reader role.
7. Tenant-level membership requires tenant-wide membership; branch access permits tenant-wide or exact-branch membership.
8. Current temporary session does not encode real actor/tenant/branch/permission context.

---

# 7. Files to CREATE

Exact names may be adjusted only when latest-main evidence requires it; responsibilities may not be weakened.

| Path | Responsibility | Required contents |
|---|---|---|
| `supabase/migrations/20260822120000_p02_r01_identity_pre_auth_boundary.sql` | forward identity/pre-auth DB hardening | role/capability, normalization contract, narrow SECURITY DEFINER functions, grants/revokes, indexes/constraints only as safely required |
| `supabase/tests/database/p02_r01_identity_pre_auth_boundary.test.sql` | pgTAP/SQL security contract | role grants, allowed lookup, denial matrix, inactive/disabled behavior, throttle capability, no broad reads |
| `apps/web/next-flow/src/server/db/authentication-transaction.ts` | pre-auth DB transaction boundary | `server-only`; narrow role setup; no tenant/actor impersonation; typed callback |
| `apps/web/next-flow/src/modules/identity/server/credential-repository.ts` | server identity credential repository | normalized lookup/throttle calls only; no UI imports; no raw SQL string interpolation |
| `apps/web/next-flow/src/modules/identity/server/types.ts` | server identity credential types | minimal credential candidate/throttle types; no session authority |
| `apps/web/next-flow/tests/integration/authentication-database.test.ts` | DB runtime integration for new pre-auth boundary | valid/invalid status, role isolation, state cleanup/failure behavior |

If target architecture or latest code already contains an equivalent module path, extend the existing module instead of duplicating it. Record the actual final paths in the implementation PR.

---

# 8. Files to MODIFY

Expected modifications, subject to latest-main re-audit:

| Path | Current behavior | Required change |
|---|---|---|
| `.github/workflows/stable-quality-gates.yml` | local DB test role provisioning knows current runtime/identity roles | add only the minimum local role provisioning/test path required for the new pre-auth role, if runtime tests require it |
| `apps/web/next-flow/src/server/db/README.md` | DB role/transaction documentation when present | document pre-auth role boundary and distinguish it from actor-bound identity/runtime roles |
| `apps/web/next-flow/src/server/db/index.ts` | public server DB exports | export new transaction helper only if module architecture requires a supported public server boundary; do not expose raw client |

Do **not** modify legacy login/session files merely to make the diff look like authentication progress. If R01 can compile/test without touching them, leave them unchanged.

Do not modify `package.json` or lockfile unless latest-main evidence shows a genuinely missing dependency required by the approved design. Existing Node crypto, pg/Kysely and Auth.js packages should be used where applicable.

---

# 9. Files to MOVE

No file move is required by default.

Do not move temporary auth code in R01. Keeping the old and new paths distinct makes the later cutover/removal observable.

If latest-main structure already has a canonical `src/modules/identity` entry point requiring a small move, stop and justify it in the implementation PR before performing unrelated restructuring.

---

# 10. Files to REMOVE

None by default.

Specifically do **not** remove in R01:

- `src/lib/auth/config.ts`;
- `src/lib/auth/session.ts`;
- `src/lib/auth/token.ts`;
- `/api/auth/login`;
- `/api/auth/logout`;
- the current login form;
- `FOODFLOW_INTERNAL_*` placeholders;
- legacy auth tests.

Their removal belongs to the later cutover/cleanup rounds after Auth.js and access-context behavior are proven.

---

# 11. Database Changes

## 11.1 Forward-only migration rule

Create a new P02/R01 migration. Never edit historical P01/database baseline migrations to retrofit the new model.

The migration must be reproducible from a clean local Supabase reset.

## 11.2 Pre-authentication role

Preferred contract:

```text
flow_authenticator
NOLOGIN
NOBYPASSRLS
```

The exact name may change only for a concrete naming conflict discovered on latest main.

The role must not receive broad table SELECT/INSERT/UPDATE/DELETE on:

- `app.*`;
- `foodflow.*`;
- `payments.*`;
- `audit.*`;
- `private.user_credentials`;
- `private.login_throttles`.

It receives only schema usage and EXECUTE capability required for approved private authentication functions.

## 11.3 Email normalization contract

R01 must establish one canonical login-email normalization rule:

```text
normalized_email = lower(btrim(email))
```

Requirements:

- login input is normalized before candidate lookup;
- stored identity data cannot create ambiguous normalized identities;
- a forward migration must detect normalized collisions before enforcing or transforming data;
- if existing rows would collide, migration must fail with a clear deterministic error rather than choosing an arbitrary user;
- after successful migration, non-null staff identity email lookup must be deterministic;
- do not use locale-dependent browser normalization as database authority.

Implementation may choose either normalized storage plus a matching unique constraint/index or an equivalent generated/functional uniqueness contract. The final SQL test must prove two differently cased/whitespace-equivalent emails cannot become two valid login identities.

## 11.4 Credential lookup capability

Add a fixed-search-path private function or equivalent narrow interface that can resolve only the minimum credential candidate required by later credential verification.

Conceptual result fields:

```text
user_id
normalized_email
password_hash
algorithm
password_changed_at
```

Do not expose organization/domain rows from the pre-auth lookup.

The function must fail closed / return no eligible candidate when:

- email is unknown;
- user status is not ACTIVE;
- credential row is absent;
- credential `disabled_at` is set;
- normalized identity is ambiguous.

The function must not reveal whether the failure was "user not found" vs "disabled" to a browser-facing API. R01 itself does not change the public API, but the repository boundary must support non-enumerating behavior.

## 11.5 Credential algorithm contract

The existing private table allows `scrypt-v1`.

R01 must preserve that contract unless a forward-compatible algorithm-versioning change is concretely required. Do not downgrade to plaintext, reversible encryption, SHA-only hashing or an unreviewed fast digest.

R01 does not need to perform password verification in the live login flow. R02/R03 own deterministic credential fixtures and authentication cutover.

## 11.6 Login throttle capability

Expose only the minimum private functions required to:

- read effective throttle state by opaque subject digest;
- record a failed attempt atomically;
- clear/reset failure state after successful verification;
- enforce bounded failure window/block-until semantics without browser-controlled SQL.

The subject digest must not require storing plaintext passwords or raw session tokens.

Exact threshold/window values may be constants documented in server code or deferred to R03, but the database mutation must be atomic and race-safe if implemented in R01.

If R01 intentionally limits itself to a structural throttle interface and defers policy values, the functions must still be testable and not silently allow negative counters or privilege escalation.

## 11.7 Function security

Every SECURITY DEFINER function added in R01 must:

- use an explicit fixed `search_path`;
- schema-qualify security-sensitive objects where appropriate;
- revoke EXECUTE from `public`, `anon`, `authenticated`, `flow_runtime`, and `flow_identity` unless an exact function is intentionally shared;
- grant EXECUTE only to the pre-auth role/capability;
- avoid dynamic SQL from raw user input;
- return only minimal fields;
- never expose secret configuration values.

## 11.8 Existing RLS semantics

Do not modify `private.actor_has_active_membership` or `private.actor_has_permission` unless latest-main evidence proves a direct R01 blocker.

R04 semantics remain:

```text
target_branch_id = NULL
→ requires tenant-wide membership

target_branch_id != NULL
→ tenant-wide OR exact branch membership
```

Existing self-elevation denial policies must remain green.

## 11.9 Seed policy

Do not commit a reusable/default password to `supabase/seed.sql` in R01.

SQL tests may create deterministic test-only credential rows inside test setup/transactions, using clearly synthetic hashes that cannot become a documented production/demo credential.

R02 owns the durable deterministic identity/credential fixture contract needed for Auth.js integration tests.

## 11.10 Production safety

R01 implementation and validation must use local/test databases only.

No production-linked:

- `supabase db reset`;
- destructive migration execution;
- credential insertion;
- role grant;
- password update;
- data backfill

is authorized by this specification.

---

# 12. Backend Changes

## 12.1 Authentication transaction boundary

Create a server-only pre-auth transaction helper separate from `withIdentityTransaction()`.

Conceptual contract:

```ts
withAuthenticationTransaction<T>(
  callback: (trx: DatabaseTransaction) => Promise<T>
): Promise<T>
```

Expected behavior:

1. obtain the existing lazy database runtime;
2. start a short transaction;
3. `SET LOCAL ROLE` to the narrow pre-auth role;
4. do **not** set `app.actor_id`, `app.tenant_id`, or `app.branch_id` from unverified login input;
5. execute only approved private functions through repository code;
6. return/rollback without leaking role/context into later pooled transactions.

The implementation must prove role/context cleanup through tests.

## 12.2 Credential repository

Create a server-only repository that owns the database call shape.

It must not:

- import React/UI modules;
- read request cookies directly;
- issue session tokens;
- choose tenant/branch authorization;
- construct raw SQL from untrusted strings;
- expose the general Kysely database client to callers.

It may expose conceptual methods such as:

```ts
findActiveCredentialCandidateByEmail(email)
getLoginThrottle(subjectDigest)
recordLoginFailure(subjectDigest)
clearLoginFailures(subjectDigest)
```

Names may vary, responsibilities may not.

## 12.3 Type boundary

Credential candidate types must be server-only.

A raw `password_hash` may exist only inside the trusted server credential-verification path. Do not pass it to client components, route JSON responses, logs, analytics or generic error objects.

## 12.4 No live login cutover

Do not call the new repository from `/api/auth/login` as the new authority in R01 unless this specification is amended.

The reason is deliberate sequencing:

```text
R01 = DATA / PRIVILEGE BOUNDARY
R02 = TEST IDENTITY / CREDENTIAL CONTRACT
R03 = AUTH.JS CUTOVER
```

Mixing cutover into R01 would make failure attribution and rollback ambiguous.

---

# 13. Frontend Changes

No planned visual or interaction change.

The current login form continues to:

- collect email/password;
- show generic failure messages;
- redirect after successful temporary login.

R01 must not add:

- OAuth buttons;
- workspace selector;
- role selector;
- branch selector;
- Auth.js client session provider;
- customer login;
- MFA UI.

If a build/type change is unavoidable because a server export moved, keep the UI behavior identical and document the exact reason.

---

# 14. Authentication and Authorization

## Roles affected

Database roles/capabilities only:

- existing `flow_runtime` — preserve;
- existing `flow_identity` — preserve actor-bound meaning;
- new narrow pre-auth role/capability — add.

No product role semantics are changed in R01.

## Permissions required

No new product permission code is required by default.

Pre-auth database access is capability-based and must not be modeled as a tenant user permission because no authenticated actor exists yet.

## Route protection

No route-policy cutover.

Current proxy behavior remains temporary and is handled in later rounds.

## Backend permission enforcement

The new pre-auth backend must be unable to bypass normal domain authorization simply because it can resolve a credential candidate.

## Session requirements

No new session authority in R01.

Current custom `foodflow_session` remains temporary live behavior until R03/R06 sequencing completes.

---

# 15. Security Requirements

P02/R01 is security-sensitive. All of these are mandatory.

### Least privilege

- pre-auth role is `NOLOGIN` and `NOBYPASSRLS`;
- no broad table grants;
- execute-only narrow functions;
- private-table direct access remains denied to normal runtime roles.

### Credential confidentiality

- no plaintext password persisted;
- no credential hash in HTTP response;
- no hash/password/session token in logs;
- no real credential in test seed;
- no secrets in PR/issue output.

### Identity enumeration resistance

The repository boundary must permit future public login behavior to use the same generic failure for unknown/inactive/disabled credentials.

Do not design a helper that returns distinct browser-safe errors such as `USER_NOT_FOUND` vs `USER_SUSPENDED`.

### Input handling

- canonicalize email deterministically;
- validate string length/shape before expensive work in later login implementation;
- parameterize SQL;
- no dynamic SQL based on email/digest.

### Tenant safety

Pre-authentication may identify a user, but it must not accept a browser-provided tenant/branch ID as authority.

Tenant/branch resolution remains post-auth membership work in later rounds.

### Role/context leakage

A pooled connection that handled pre-authentication must not retain `flow_authenticator`, actor, tenant or branch context for the next request.

Use transaction-local role/context only and test cleanup.

### Function hardening

- SECURITY DEFINER only where required;
- fixed search path;
- narrow execute grants;
- no untrusted object resolution;
- no public execution.

### Timing/verification separation

R01 data lookup may return the stored hash to trusted server code. Password comparison policy and timing-equivalence behavior are implemented/tested before live Auth.js cutover; do not improvise a browser-visible comparison API in R01.

### Existing security baseline

Cross-tenant, wrong-branch, suspended membership and self-elevation denial tests from P01 must remain green.

---

# 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| normalized-email collision exists during migration | migration fails deterministically before arbitrary identity selection | inspect conflicting data; owner-approved cleanup; rerun locally |
| new pre-auth role already exists unexpectedly | migration must handle only the explicitly supported idempotent condition or fail clearly | audit provenance before proceeding |
| private auth function cannot be executed by pre-auth role | DB quality fails | correct grant/function contract; do not grant broad table access |
| public/anon/authenticated can execute private auth function | security test fails | revoke execute; re-run full DB quality |
| flow_runtime/flow_identity can directly read private credentials | security test fails | restore revoke/least privilege |
| unknown email | repository returns no eligible candidate | no retry required; later public layer uses generic failure |
| inactive user | no eligible candidate | fail closed |
| disabled credential | no eligible candidate | fail closed |
| throttle record unavailable/corrupt | fail closed according to explicit repository contract; never silently reset security state | repair local/test data; log only safe error class |
| database unavailable | repository returns/throws typed server failure; no fallback to hardcoded DB credential | later login path should surface generic unavailable state |
| role/context leaks after transaction | integration test fails | fix transaction-local setup/cleanup before PR readiness |
| clean Supabase reset fails | round not ready | repair migration; do not skip/reset around failure |
| Kysely generated drift occurs from schema change | commit correct generated change if generator scope includes it | regenerate from clean migrated schema |
| legacy auth tests fail | round not ready unless failure is caused by an explicitly approved non-behavioral fixture correction | preserve legacy behavior until cutover |

Rollback strategy is repository rollback/revert of the R01 branch/PR before production deployment. Do not write a destructive down migration that could delete credential or user data merely for convenience.

---

# 17. Dependencies

## Internal

R01 depends on:

- Phase 01 database baseline;
- `app.users`;
- `private.user_credentials`;
- `private.login_throttles`;
- `flow_identity` / `flow_runtime` role model;
- current DB runtime client/transaction primitives;
- stable CI contexts from P01/R05 corrections.

## External

No new external service is required.

Existing packages are expected to be sufficient:

- `pg` / Kysely;
- Node.js crypto when needed by tests/helpers;
- Auth.js packages already installed but not activated in R01;
- Supabase CLI for local DB validation.

## Environment variables / secrets

No new secret variable is expected.

Preserve existing:

```text
DATABASE_URL
DATABASE_DIRECT_URL
AUTH_SECRET
AUTH_TRUST_HOST
FOODFLOW_INTERNAL_EMAIL
FOODFLOW_INTERNAL_PASSWORD
FOODFLOW_SESSION_SECRET
```

The `FOODFLOW_*` variables remain temporary during R01 and are removed only after the later replacement path is complete.

Do not add a dedicated production password/hash to `.env.example`.

---

# 18. Tests

## Unit

- [ ] email normalization behavior is deterministic for case and surrounding whitespace;
- [ ] credential repository maps database result to minimal typed candidate;
- [ ] repository does not expose inactive/disabled candidates as valid;
- [ ] throttle result mapping handles blocked/not-blocked state;
- [ ] server-only identity code has no client-safe secret serialization path.

## Integration

- [ ] clean DB runtime can start a pre-auth transaction using the narrow role;
- [ ] active synthetic user + enabled synthetic credential can be resolved by normalized email in test-only setup;
- [ ] unknown normalized email returns no candidate;
- [ ] suspended/deactivated user returns no candidate;
- [ ] disabled credential returns no candidate;
- [ ] role/context is local to transaction and does not leak to a subsequent pooled transaction;
- [ ] legacy DB runtime tests remain green;
- [ ] current temporary auth/session integration tests remain green.

## End-to-end

`NOT APPLICABLE` for new product behavior in R01.

No browser login cutover occurs.

## Authorization / RLS / Security

- [ ] pre-auth role cannot directly select `private.user_credentials`;
- [ ] pre-auth role cannot directly select `private.login_throttles`;
- [ ] pre-auth role cannot broadly select FoodFlow/orders/payments/audit domain data;
- [ ] only approved private functions are executable by pre-auth role;
- [ ] public/anon/authenticated cannot execute those private functions;
- [ ] flow_runtime/flow_identity do not gain unapproved private auth execution capability;
- [ ] existing actor membership tenant/branch semantics remain green;
- [ ] existing role/member self-elevation denial remains green.

## Failure cases

- [ ] normalized email collision fails safely;
- [ ] duplicate/invalid throttle mutation cannot produce negative/corrupt state;
- [ ] database function rejects malformed/empty login identifier according to contract;
- [ ] missing database configuration does not expose secret detail;
- [ ] private function SQL errors do not leak credential hash into logs/test output.

## Regression

- [ ] `npm run lint`;
- [ ] `npm run typecheck`;
- [ ] `npm run test`;
- [ ] `npm run build:next`;
- [ ] fresh local Supabase start/reset/seed;
- [ ] database SQL tests;
- [ ] database lint;
- [ ] Kysely generation/drift check;
- [ ] DB runtime integration tests.

---

# 19. Validation Commands

The implementation agent must use commands that exist on the latest branch and record actual outcomes. Expected repository commands include:

```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm run test
npm run build:next
```

Database quality equivalent to the repository workflow must include:

```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

Then, from `apps/web/next-flow` with local test database environment:

```bash
npm run db:generate
npm run db:verify-types
npm run test:db-runtime
```

If the exact current workflow uses a generated-type drift command rather than `db:verify-types`, follow the current workflow as authority and record the real command.

Never claim a local command PASS unless it was actually run. GitHub Actions results and local results must be distinguished in the PR evidence.

Record outcomes using only:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

Expected PR contexts:

```text
Phase/Round Gate
Repository Integrity
Dependency Integrity
Next Flow Quality
Supabase Database Quality
Vercel
```

`Dependency Integrity` may be a successful explicit NOT APPLICABLE path when package files are untouched. `Next Flow Quality` and `Supabase Database Quality` are expected to run real applicable work because application server + migration/test scope changes.

---

# 20. PR Requirements

Create/update exactly one P02/R01 implementation PR according to current branch-chain policy.

The implementation PR must include canonical metadata:

```text
Specification: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
Phase: 02
Round: 01
Previous: FLOW_P01_R06_IMPLEMENTATION_SPEC.md
```

It must record:

- implementation parent branch/ref and SHA;
- implementation head SHA;
- exact migration path;
- actual database role/function names;
- exact files created/modified;
- whether any package/lockfile changed;
- real validation results;
- SQL security-test results;
- DB runtime results;
- application quality results;
- inherited known hosted-main-protection state without claiming a fix;
- no production DB mutation;
- no Auth.js live cutover;
- no legacy auth removal;
- next specification handoff.

The implementation PR must remain owner-controlled.

The development agent must not merge it or enable automatic merge.

---

# 21. Definition of Done

P02/R01 is implemented on its round branch only when all mandatory conditions are true.

## Entry / lineage

- [ ] spec READY on current main;
- [ ] current policy read from main;
- [ ] correct first-Phase-02 implementation parent resolved;
- [ ] `p02-r01-identity-boundary` or approved equivalent created as the new Phase 02 lineage tip.

## Database boundary

- [ ] forward P02/R01 migration created;
- [ ] no historical migration rewritten;
- [ ] canonical normalized-email identity contract established;
- [ ] normalized-email collisions fail closed;
- [ ] narrow pre-auth role/capability exists;
- [ ] pre-auth role has no broad identity/domain table grants;
- [ ] private credential lookup function is fixed-search-path and narrowly granted;
- [ ] inactive/deactivated/suspended users denied;
- [ ] disabled credentials denied;
- [ ] throttle capability is atomic/narrow or explicitly structurally prepared according to this spec;
- [ ] no reusable/default password added to seed.

## Server architecture

- [ ] server-only authentication transaction exists;
- [ ] pre-auth transaction does not set actor/tenant/branch from unverified input;
- [ ] identity credential repository exists under a purposeful server module boundary;
- [ ] raw credential hash cannot escape trusted server code;
- [ ] pooled role/context leakage test passes.

## Security

- [ ] public/anon/authenticated cannot execute new private auth functions;
- [ ] flow_runtime/flow_identity do not receive broad credential access;
- [ ] pre-auth role cannot read domain tables broadly;
- [ ] existing actor/RLS tests green;
- [ ] existing self-elevation denial green;
- [ ] no secrets/passwords/tokens in repository or PR/log evidence.

## Quality

- [ ] fresh Supabase reset/seed passes;
- [ ] SQL tests pass;
- [ ] DB lint passes;
- [ ] generated DB types are correct/no unexplained drift;
- [ ] DB runtime tests pass;
- [ ] lint passes;
- [ ] typecheck passes;
- [ ] unit/integration tests pass;
- [ ] Next build passes;
- [ ] stable GitHub contexts report truthfully.

## Scope discipline

- [ ] Auth.js handler/provider/session is NOT made live;
- [ ] temporary login/session authority is NOT removed;
- [ ] route permission cutover is NOT implemented;
- [ ] workspace/access-context selection is NOT implemented;
- [ ] no customer persistence/realtime/kitchen/payment/voice work;
- [ ] no production DB mutation;
- [ ] hosted main protection is not falsely reported as fixed.

## PR

- [ ] exactly one implementation PR created/updated;
- [ ] actual parent/head evidence recorded;
- [ ] actual test results recorded;
- [ ] owner merge control preserved;
- [ ] agent merge not performed.

Round state after implementation/PR creation:

```text
P02/R01 = IMPLEMENTED ON ROUND BRANCH / PR OPEN
```

Owner merge is not required for P02/R02 branch creation under current branch-chain policy.

---

# 22. Handoff to Next Round

P02/R02 must inherit the R01 implementation branch as its code parent when that branch is the latest Phase 02 lineage tip.

Expected completed R01 state:

```text
EXISTING APP.USERS / MEMBERSHIPS / ROLES / PERMISSIONS PRESERVED
+
EXISTING PRIVATE CREDENTIAL / THROTTLE TABLES PRESERVED OR SAFELY FORWARD-HARDENED
+
NARROW PRE-AUTH DB ROLE / CAPABILITY
+
DETERMINISTIC NORMALIZED-EMAIL LOOKUP CONTRACT
+
INACTIVE / DISABLED CREDENTIAL FAIL-CLOSED SEMANTICS
+
SERVER-ONLY AUTHENTICATION TRANSACTION
+
SERVER-ONLY CREDENTIAL REPOSITORY
+
NO BROAD DOMAIN ACCESS FOR PRE-AUTH ROLE
+
P01 ACTOR / TENANT / BRANCH RLS BASELINE STILL GREEN
+
TEMPORARY SHARED LOGIN STILL LIVE
+
AUTH.JS CUTOVER NOT YET STARTED
```

P02/R02 owns deterministic identity/credential fixtures and the authorization contract required before Auth.js Credentials cutover.

R02 may add test-only deterministic credentials/hashes required for the real verification path, but it must not infer scope until its exact executable specification exists on `main`.

Implementation parent for next round:

```text
p02-r01-identity-boundary
```

or the exact owner-approved P02/R01 branch name recorded by the implementation PR.

Required next specification:

```text
FLOW_P02_R02_IMPLEMENTATION_SPEC.md
```

At the next scheduled execution:

```text
READ CURRENT MAIN FOR AUTHORITY
→ VERIFY FLOW_P02_R02_IMPLEMENTATION_SPEC.md EXISTS + READY
→ IDENTIFY LATEST P02/R01 BRANCH
→ CREATE NEW P02/R02 BRANCH FROM P02/R01
```

Do not use `main` as the P02/R02 implementation parent merely because P02/R01 was or was not merged.

---

# 23. Development Gate

Current FLOW branch-chain gates apply:

```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```

Legal P02/R01 sequence:

```text
P02/R01 SPEC MERGED TO MAIN
        ↓
WAIT UNTIL DECLARED IMPLEMENTATION SLOT / EXPLICIT OWNER EXECUTION
        ↓
FETCH CURRENT MAIN
        ↓
READ POLICY + EXACT SPEC + AGENTS
        ↓
RE-AUDIT CURRENT AUTH / DB / CI STATE
        ↓
RESOLVE FIRST PHASE-02 IMPLEMENTATION BASELINE
        ↓
CREATE p02-r01-identity-boundary
        ↓
ADD FORWARD PRE-AUTH DB MIGRATION
        ↓
ADD NARROW PRE-AUTH ROLE / PRIVATE FUNCTIONS
        ↓
ADD SERVER-ONLY AUTHENTICATION TRANSACTION
        ↓
ADD SERVER-ONLY CREDENTIAL REPOSITORY
        ↓
ADD SQL + DB RUNTIME SECURITY TESTS
        ↓
PRESERVE TEMPORARY LOGIN / CUSTOM SESSION
        ↓
RUN APP + DB QUALITY
        ↓
OPEN P02/R01 IMPLEMENTATION PR
        ↓
STOP
        ↓
OWNER CONTROLS MERGE
        ↓
NEXT ROUND MAY BRANCH FROM P02/R01 WHEN P02/R02 SPEC EXISTS + READY
```

Explicit prohibitions:

```text
NO P02/R01 CODE BEFORE THIS SPEC IS ON MAIN
NO DIRECT MAIN PUSH
NO IMPLEMENTATION PR MERGE BY AGENT
NO AUTO-MERGE OF IMPLEMENTATION PR
NO HISTORICAL MIGRATION REWRITE
NO SECOND PARALLEL USERS / MEMBERSHIPS / ROLES MODEL
NO DB OWNER / SUPERUSER AS APPLICATION PRE-AUTH PATH
NO BROAD SELECT ON private.user_credentials
NO BROAD SELECT ON private.login_throttles
NO BROAD DOMAIN ACCESS FOR PRE-AUTH ROLE
NO PUBLIC EXECUTE ON PRIVATE AUTH FUNCTIONS
NO PLAINTEXT / REVERSIBLE / FAST-DIGEST PASSWORD STORAGE
NO REUSABLE PASSWORD IN seed.sql
NO RAW PASSWORD / HASH / SESSION TOKEN IN LOGS
NO AUTH.JS LIVE SESSION CUTOVER — R03 OWNS IT
NO WORKSPACE / ACCESSCONTEXT PRODUCTIZATION — R04 OWNS IT
NO ROUTE / COMMAND PERMISSION CUTOVER — R05 OWNS IT
NO LEGACY SHARED AUTH REMOVAL — R06 OWNS IT
NO CUSTOMER / ORDER / KITCHEN / PAYMENT / REALTIME / VOICE EXPANSION
NO PRODUCTION DATABASE RESET / PUSH
NO CLAIM THAT HOSTED MAIN PROTECTION IS FIXED BY R01
NO P02/R02 IMPLEMENTATION WITHOUT FLOW_P02_R02_IMPLEMENTATION_SPEC.md ON MAIN
```

Final R01 success test:

```text
Spec on main and READY? YES
First P02 round branch created from verified baseline? YES
Forward migration only? YES
Canonical login email deterministic? YES
Normalized identity ambiguity prevented? YES
Narrow pre-auth role/capability? YES
Broad credential-table reads? NO
Broad domain-table reads? NO
Active enabled credential candidate resolvable in test? YES
Inactive user denied? YES
Disabled credential denied? YES
Throttle capability narrow/atomic? YES
Server-only auth transaction? YES
Server-only credential repository? YES
Role/context leak? NO
Existing actor/RLS baseline preserved? YES
Fresh DB quality? PASS
Application quality? PASS
Auth.js live cutover? NO
Temporary auth removed? NO
Production DB modified? NO
Implementation PR auto-merged? NO
```

P02/R01 does not authorize P02/R02 automatically. The exact next specification on `main` remains the authority boundary.