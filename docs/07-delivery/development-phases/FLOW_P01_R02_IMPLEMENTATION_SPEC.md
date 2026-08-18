# FLOW P01 R02 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 02 — Application Quality Baseline Recovery

---

## Metadata

- Phase: `01`
- Round: `02`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Target branch: `main`
- Previous: `FLOW_P01_R01_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P01_R03_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-18 20:00 Asia/Bangkok`
- Owner approval required: `YES`
- Automatic merge allowed: `NO`
- Proposal issue: `#18`
- Specification base SHA: `5bcd155501b67d03183b05d7ac183ea0545529af`
- Previous implementation PR: `#17`
- Previous implementation merge SHA: `5bcd155501b67d03183b05d7ac183ea0545529af`
- Previous implementation head SHA: `471aec29a9c8eea03ff8ee5d4d63141153367c7a`
- Previous required checks: `Phase/Round Gate`, `Dependency Integrity`
- Current main protection at specification time: `OFF`
- Current required branch-protection checks at specification time: `NONE`
- Current planning scope: `PHASE 01 / ROUND 02 ONLY`
- Rounds in Phase 01: `6`
- Recommended implementation branch: `phase/01-round/02-application-quality`
- Recommended implementation PR title: `fix(quality): recover P01 R02 application baseline`

---

## Execution Continuity Statement

P01/R02 is the second executable round under the reset FLOW development operating model.

The previous round is complete for progression purposes because:

- `FLOW_P01_R01_IMPLEMENTATION_SPEC.md` is present on `main`;
- P01/R01 implementation PR `#17` is merged;
- the R01-required `Phase/Round Gate` passed;
- the R01-required `Dependency Integrity` check passed;
- `npm ci` was proven from committed dependency state;
- R01 explicitly handed inherited application, database, deployment, and repository failures to later Phase 01 rounds instead of hiding them.

The broader failures visible during R01 do not retroactively redefine the R01 required-check contract. They are the recovery work of R02–R05.

The current authoritative technical starting point for this specification is:

```text
main@5bcd155501b67d03183b05d7ac183ea0545529af
```

The implementation branch for R02 must still be created from the latest verified `main` **after this specification is merged**, not blindly from the specification base SHA.

The progression remains:

```text
R01 IMPLEMENTATION MERGED
→ R02 SPECIFICATION MERGED TO MAIN
→ FETCH LATEST MAIN
→ VERIFY R02 SPEC STATUS = READY
→ CREATE R02 IMPLEMENTATION BRANCH
→ RECOVER APPLICATION QUALITY ONLY
→ RUN R02 REQUIRED GATES
→ OPEN R02 IMPLEMENTATION PR
→ OWNER REVIEW
→ MANUAL MERGE
→ VERIFY FLOW_P01_R03_IMPLEMENTATION_SPEC.md EXISTS ON MAIN
→ OTHERWISE STOP
```

No R03 implementation is authorized by this file.

---

# 1. Phase Objective

Phase 01 must establish a trustworthy, deterministic, enforceable development baseline before FLOW continues with identity, persistence, realtime, payments, customer architecture, voice, or other product-level implementation.

The complete six-round phase must leave the repository able to prove, from committed code and GitHub evidence, that:

- one exact phase/round specification authorizes each implementation PR;
- dependency installation is deterministic;
- application lint/typecheck/test/build gates are trustworthy;
- fresh database bootstrap and database verification gates are trustworthy;
- actor-aware database/RLS tests use real identity semantics;
- repository and CI failures are classified instead of hidden by retries or skipped steps;
- deployment failures are understood and owned by the correct recovery round;
- required checks are stable enough to be enforced;
- `main` has an owner-controlled merge path;
- a new product phase never starts on top of an unknown red baseline.

The intended Phase 01 decomposition remains:

```text
P01/R01
Delivery Gate Bootstrap
+
Deterministic Dependency Integrity

P01/R02
Application Quality Baseline Recovery

P01/R03
Fresh Database Bootstrap Recovery

P01/R04
Actor-aware Database / RLS Test Recovery

P01/R05
Repository / CI / Deployment Baseline Recovery

P01/R06
Full Baseline Acceptance
+
Main Protection Verification
```

R02 owns the **application quality** portion of that baseline and nothing beyond the minimum compatibility work required to make the canonical application gate trustworthy and green.

---

# 2. Phase Scope

## In scope for Phase 01 as a whole

### Development governance

- executable phase/round specifications;
- machine-checkable implementation authorization;
- deterministic Previous/Next continuation;
- Phase/Round-aware PR evidence;
- stable check contexts;
- owner/manual merge control;
- final branch-protection verification.

### Dependency integrity

- synchronized npm manifest/lockfile state;
- clean reproducible `npm ci`;
- bounded dependency changes;
- explicit Node/npm execution contract.

### Application quality

- lint;
- TypeScript typecheck;
- unit tests;
- application integration tests;
- Next.js production build;
- failure attribution;
- quality-workflow trustworthiness.

### Database quality

- fresh Supabase bootstrap;
- migrations and seed;
- pgTAP/database tests;
- database lint;
- generated Kysely types;
- type drift;
- database runtime integration.

### Database authorization quality

- real users/roles/memberships;
- actor-aware RLS;
- tenant/branch negative tests;
- runtime actor context.

### Repository / deployment quality

- transient-vs-deterministic CI retry classification;
- gitlink/submodule ambiguity;
- deployment failure diagnosis;
- required-check rollout;
- protected-main acceptance.

## Out of scope for Phase 01

Unless a strictly minimal compatibility repair is required to restore a Phase 01 baseline gate, Phase 01 does not implement:

- Auth.js runtime cutover;
- OAuth;
- production Credentials-provider migration;
- final RBAC product behavior;
- customer QR capability;
- customer/table-session persistence;
- cart/order persistence;
- realtime synchronization;
- persistent service-request product behavior;
- kitchen multi-station routing;
- Omise / Opn merchant payment runtime;
- Stripe SaaS billing runtime;
- entitlement runtime;
- CustomerShell redesign;
- compact combined customer cart redesign;
- Voice Ordering or speech-to-text runtime;
- CareFlow implementation;
- JobFlow implementation.

## R02-specific scope boundary

P01/R02 owns only the application-quality chain:

```text
npm ci
→ lint
→ typecheck
→ unit/application tests
→ non-database integration tests
→ next build
→ Next Flow Quality = PASS
```

R02 may repair source, test, TypeScript, or application-quality configuration defects that are **actually surfaced by those gates** and are necessary to restore the current application baseline.

R02 must not use the recovery round as permission for speculative cleanup, architecture migration, feature work, broad refactoring, dependency modernization, database repair, Auth.js implementation, or deployment work.

### Explicitly owned by later rounds

```text
P01/R03
fresh Supabase bootstrap
migration execution
seed
DB lint
code generation
DB type drift

P01/R04
real actor fixtures
membership/role fixtures
actor-aware RLS tests
DB runtime actor-context recovery

P01/R05
gitlink/.gitmodules ambiguity
CI retry classification
Supabase service-surface optimization
Vercel/deployment diagnosis
repository CI infrastructure recovery

P01/R06
full green acceptance
stable required-check contract
main protection verification
```

---

# 3. This Round Objective

P01/R02 must restore the canonical Next Flow application quality baseline from the exact state inherited from R01.

The round starts from one known first application blocker:

```text
apps/web/next-flow/src/server/db/config.ts(52,3)
TS2559
Type 'ProcessEnv' has no properties in common with type 'Partial<DatabaseEnvironment>'.
```

That blocker occurs at the default environment argument of `getDatabaseConfig()`.

At the end of R02, the application-quality chain must be able to prove:

```text
CLEAN NPM INSTALL STILL SUCCEEDS
+
LINT PASSES
+
TYPECHECK PASSES
+
EXISTING UNIT REGRESSION SUITE PASSES
+
EXISTING APPLICATION INTEGRATION TESTS PASS
+
DATABASE-DEPENDENT TESTS ARE NOT MISREPRESENTED AS EXECUTED WITHOUT DATABASE CONTEXT
+
NEXT.JS PRODUCTION BUILD PASSES WITHOUT REQUIRING DATABASE SECRETS AT BUILD TIME
+
NEXT FLOW QUALITY PASSES AS A GITHUB CHECK
+
NO TYPE-CHECK OR TEST SUPPRESSION WAS USED
+
NO PRODUCT / AUTH / DATABASE / PAYMENT / VOICE SCOPE WAS PULLED INTO R02
```

## Mandatory outcome A — exact current-state verification

Before editing, the implementation agent must:

1. fetch latest `main`;
2. verify P01/R01 implementation PR `#17` is merged;
3. verify this R02 specification is present on `main` and `Status` is `READY`;
4. record current `main` SHA as `IMPLEMENTATION_BASE_SHA`;
5. compare that SHA with this file's `Specification base SHA`;
6. inspect every intervening commit if `main` advanced;
7. stop if an intervening change invalidates the R02 assumptions.

The implementation PR must preserve both:

```text
SPEC_BASE_SHA
IMPLEMENTATION_BASE_SHA
```

as separate evidence.

## Mandatory outcome B — repair the current TypeScript blocker without suppression

The current database configuration contract must be made TypeScript-correct while preserving runtime semantics.

The repair must preserve all of these invariants:

- `getDatabaseConfig()` can still be called with no explicit argument and read the current server environment lazily at call time;
- tests can still provide only the database-related environment keys they need;
- missing `DATABASE_URL` still fails lazily with `DatabaseConfigurationError` when database runtime configuration is actually requested;
- normal `next build` must not require `DATABASE_URL` merely because database modules exist in the source tree;
- pool maximum, connection timeout, and idle timeout validation remain bounded;
- error messages must not include the database connection URL, password, secret, or full environment contents;
- no `any`, `@ts-ignore`, blanket `@ts-expect-error`, disabling of strict mode, or compiler-option weakening may be used to make the error disappear;
- a type assertion may not be used merely to silence the weak-type mismatch without proving the projected environment shape.

A valid implementation may, for example, separate the optional test input from the default `process.env` source, project the required database keys explicitly, or otherwise establish a real typed boundary. The specification does not require one syntactic implementation as long as the invariants above are satisfied.

## Mandatory outcome C — add/strengthen regression coverage for database config semantics

`tests/unit/database-config.test.ts` must continue to cover:

- lazy failure when `DATABASE_URL` is absent;
- secret-safe validation errors;
- valid pool/timing normalization.

R02 must add coverage for the repaired zero-argument/default-environment path so the TypeScript repair does not accidentally change runtime behavior.

The test must not require a real database or real secret.

## Mandatory outcome D — run the application gates sequentially and repair only real R02 blockers

After the first known typecheck blocker is repaired, run the canonical application gates in order.

If a later gate exposes another failure, classify it before editing:

### R02-owned failure

Examples:

- TypeScript source mismatch;
- stale application test expectation caused by already-merged baseline code;
- module-resolution/build typing problem;
- Next.js source compatibility defect;
- application build configuration defect;
- deterministic application test failure;
- test configuration that prevents intended non-database tests from running.

A R02-owned failure must be repaired minimally and regression-tested.

### Later-round failure

Examples:

- Supabase image pull/start behavior;
- SQL migration execution;
- seed failure;
- RLS fixture semantics;
- generated DB type drift from a migrated database;
- gitlink/submodule cleanup;
- Vercel deployment configuration;
- branch protection;
- Auth.js runtime;
- product persistence.

A later-round failure must be recorded and handed off, not repaired opportunistically.

### Unclear ownership

If a blocker cannot be safely classified, stop and notify the owner rather than broadening scope.

## Mandatory outcome E — preserve application test meaning

The current package has:

```text
npm run test
npm run test:integration
npm run test:db-runtime
npm run test:e2e
```

R02 owns normal application/unit/integration validation.

The database runtime integration suite is conditional on `DATABASE_URL` and belongs to the database recovery path. If it is skipped because no database runtime is configured during a non-database application test run, the PR must report it as skipped/not applicable for R02 rather than claiming a database integration PASS.

R02 must not:

- delete a failing test merely to turn the suite green;
- weaken assertions without explaining a genuine corrected contract;
- convert deterministic failures into skipped tests;
- add broad test exclusions;
- hide test failures behind shell `|| true` or equivalent behavior.

## Mandatory outcome F — prove Next.js build without database secrets

`npm run build:next` must pass from committed application state without requiring live or local database credentials.

This is a required R02 property because database runtime configuration is intentionally lazy.

If any Next.js source or Next-specific configuration must be changed, the implementation agent must first read:

```text
apps/web/next-flow/AGENTS.md
```

and the relevant local documentation under:

```text
apps/web/next-flow/node_modules/next/dist/docs/
```

for the installed Next.js version before editing.

No remembered Next.js behavior may override the repository-local documentation.

## Mandatory outcome G — make `Next Flow Quality` green without weakening it

The existing workflow currently executes:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build:next
```

R02 must end with the `Next Flow Quality` GitHub check passing on the R02 implementation PR.

Changing `.github/workflows/next-flow-quality.yml` is **not planned** and is allowed only if a real workflow defect, rather than application code, prevents the intended gates from being executed correctly.

If that workflow is modified:

- Node 22 must remain the application CI contract unless a separate approved toolchain decision says otherwise;
- `permissions: contents: read` or equivalent least privilege must be preserved;
- no quality stage may be deleted or converted to non-blocking to obtain green status;
- path filtering may not be narrowed to hide affected application files;
- shell failure behavior may not be weakened;
- the PR must explain why the workflow change was necessary.

## Mandatory outcome H — distinguish required R02 checks from later-round checks

Because the required `src/server/db/config.ts` repair is inside `src/server/db/**`, the existing `Supabase Database Quality` workflow is expected to trigger on the R02 implementation PR.

That workflow currently owns fresh database bootstrap and is known to have an inherited failure that belongs to R03.

Therefore the R02 check contract is:

```text
REQUIRED FOR R02 MERGE
- Phase/Round Gate = PASS
- Next Flow Quality = PASS
- Dependency Integrity = PASS if package.json/package-lock.json changed; otherwise NOT APPLICABLE

OBSERVED BUT NOT AN R02 MERGE GATE
- Supabase Database Quality
- Vercel deployment status
```

This does **not** mean R02 may introduce new failures into those later-round checks.

For `Supabase Database Quality`:

- reproduce/inspect the failure on the R02 implementation PR;
- compare it with the inherited database failure;
- if it is the same inherited database/bootstrap class, record it for R03;
- if R02 introduces a new database failure, R02 is not complete until that regression is removed;
- do not edit migrations, seed, RLS, database CI retry logic, or generated DB types merely to make the database check green in R02.

For Vercel:

- record status honestly;
- do not modify deployment architecture/configuration in R02;
- R05 owns deployment recovery.

The governing rule remains:

```text
FAILED REQUIRED CI = NO NEXT ROUND
```

Only checks explicitly required by the current round count as the R02 progression gate; later-round diagnostic checks remain visible evidence and may not be hidden.

## Mandatory outcome I — dependency-security observation remains truthful

R01 observed two high-severity npm audit findings during clean install.

R02 must not run `npm audit fix --force`, perform uncontrolled dependency upgrades, or rewrite the lockfile solely to erase that message.

If the current install/audit evidence shows a **critical** direct runtime vulnerability or a newly disclosed issue that clearly invalidates the application baseline, stop and notify the owner for scope/priority decision.

High findings that are unchanged from R01 must be recorded as known dependency-security follow-up rather than silently omitted.

## Mandatory outcome J — stop after R02 implementation PR

Once the R02 implementation is complete and the R02-required checks pass:

- open/update the implementation PR;
- provide exact validation evidence;
- stop for owner review;
- do not auto-merge;
- do not create R03 implementation;
- do not infer R03 scope if the R03 specification is absent from `main`.

---

# 4. Preconditions

## Previous-round gate

Before R02 implementation starts:

- [ ] P01/R01 implementation PR `#17` is merged.
- [ ] P01/R01 merge SHA is an ancestor of latest `main`.
- [ ] R01 `Phase/Round Gate` passed.
- [ ] R01 `Dependency Integrity` passed.
- [ ] R01 clean `npm ci` evidence exists.
- [ ] R01 inherited application blocker is understood.

The R01 application/database/deployment failures are expected handoff items, not R01-required checks.

## Specification gate

- [ ] `FLOW_P01_R02_IMPLEMENTATION_SPEC.md` exists on `main`.
- [ ] `Status` is `READY`.
- [ ] `Phase` is `01`.
- [ ] `Round` is `02`.
- [ ] `Previous` is `FLOW_P01_R01_IMPLEMENTATION_SPEC.md`.
- [ ] `Next` is `FLOW_P01_R03_IMPLEMENTATION_SPEC.md`.
- [ ] The specification was merged separately from R02 implementation.

If the R02 spec is not on `main`, stop immediately.

## Repository-state preconditions

- [ ] Fetch latest `main` immediately before implementation.
- [ ] Record `IMPLEMENTATION_BASE_SHA`.
- [ ] Compare with `5bcd155501b67d03183b05d7ac183ea0545529af`.
- [ ] Inspect every intervening commit if different.
- [ ] Confirm no change invalidates the known R02 blocker or scope.
- [ ] Create implementation branch from latest verified `main`.
- [ ] Do not push directly to `main`.

## Required reading

Before editing:

- [ ] repository `README.md`;
- [ ] `CONTRIBUTING.md`;
- [ ] `SECURITY.md` if present;
- [ ] `docs/07-delivery/development-phases/README.md`;
- [ ] `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`;
- [ ] `FLOW_P01_R01_IMPLEMENTATION_SPEC.md`;
- [ ] this full R02 specification;
- [ ] `apps/web/next-flow/AGENTS.md`;
- [ ] any nested instruction file that applies to a modified path.

Before changing Next.js source/configuration:

- [ ] run a successful `npm ci`;
- [ ] inspect the installed relevant Next.js 16.3.0 documentation under `node_modules/next/dist/docs/`.

## Working-tree safety preconditions

In a local implementation checkout, record:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

Do not destroy unrelated user work.

Do not use destructive reset/clean operations merely to obtain a clean tree.

## Known starting evidence

At specification time, current source shows:

```ts
export function getDatabaseConfig(
  env: Partial<DatabaseEnvironment> = process.env,
): DatabaseRuntimeConfig
```

with `DatabaseEnvironment` derived from selected `NodeJS.ProcessEnv` keys.

The latest observed `Next Flow Quality` application chain reached:

```text
npm ci        PASS
lint          PASS
typecheck     FAIL (TS2559)
test          SKIPPED because workflow is fail-fast
build:next    SKIPPED because workflow is fail-fast
```

This is starting evidence only. The implementation agent must reproduce current behavior from the actual implementation branch and must not fabricate a failure that no longer exists.

---

# 5. Architecture Scope

## Frontend

Planned product/frontend behavior change: **NONE**.

R02 may touch a route/page/component only if a deterministic lint/typecheck/build error is reached after the known blocker and the minimal fix does not change business/product behavior.

No redesign or new customer/staff interaction is authorized.

## Backend

Primary planned backend surface:

```text
apps/web/next-flow/src/server/db/config.ts
```

R02 repairs the TypeScript/runtime configuration boundary only.

No repository migration, persistence cutover, Auth.js service, or domain command is authorized.

## Database

Database schema change: **NONE**.

No migration, seed, RLS, role/grant, generated type, or production database operation belongs to R02.

The TypeScript DB configuration module may change because it is the current application compile blocker; that is not permission to change database behavior or schema.

## Authentication / Authorization

Authentication behavior change: **NONE**.

The temporary internal auth remains unchanged in R02 because Auth.js cutover belongs to the later identity phase.

Do not modify session authority, login behavior, route permissions, RLS authorization, role semantics, or credentials storage.

## API / Integrations

No new API route or external integration.

No Stripe, Omise, Supabase browser client, OAuth, webhook, or realtime integration.

## Payment

No payment behavior change.

## Notifications

No notification behavior change.

## Audit / Observability

R02 observability is CI/test evidence only.

No production logging/telemetry system is introduced.

## Infrastructure / CI

Primary requirement:

```text
Next Flow Quality = PASS
```

No planned workflow redesign.

The existing `Supabase Database Quality` and Vercel statuses remain diagnostic evidence owned by later rounds.

---

# 6. Existing Files and Current Behavior

| Path | Current responsibility / observed state | Required R02 action |
|---|---|---|
| `docs/07-delivery/development-phases/FLOW_P01_R01_IMPLEMENTATION_SPEC.md` | Previous executable contract; names R02 as next | Read and preserve handoff |
| `docs/07-delivery/development-phases/README.md` | Governs six-round progression and hard gates | Follow; do not modify in R02 unless a factual R02-only documentation defect is discovered |
| `.github/workflows/phase-round-gate.yml` | Machine-checks implementation authorization | Must pass; no planned modification |
| `.github/workflows/dependency-integrity.yml` | Proves clean install when dependency files change | No planned modification |
| `.github/workflows/next-flow-quality.yml` | Runs `npm ci`, lint, typecheck, test, build:next on Node 22 | Must end green; modify only for a proven workflow defect |
| `.github/workflows/supabase-db-quality.yml` | Runs full local Supabase/database gate; path filter includes `src/server/db/**` and database unit tests | Expected to trigger; do not repair DB scope in R02 |
| `apps/web/next-flow/package.json` | Defines application scripts and dependencies | No dependency change planned; preserve scripts unless a real application-gate defect requires a narrow script clarification |
| `apps/web/next-flow/package-lock.json` | R01-repaired deterministic dependency state | Preserve; do not regenerate without manifest reason |
| `apps/web/next-flow/tsconfig.json` | Strict TypeScript project; current target ES2017 | Do not weaken compiler safety to pass R02 |
| `apps/web/next-flow/AGENTS.md` | Requires installed Next.js docs to be read before Next source changes | Mandatory instruction |
| `apps/web/next-flow/src/server/db/config.ts` | Lazy server DB configuration; current TS2559 blocker at default `process.env` assignment | Required repair |
| `apps/web/next-flow/src/server/db/client.ts` | Lazily creates/reuses DB runtime and consumes config | Preserve lazy semantics; modify only if an actual downstream app blocker proves necessary |
| `apps/web/next-flow/tests/unit/database-config.test.ts` | Tests lazy missing-URL failure, secret-safe error, pool/timing config | Required regression strengthening |
| `apps/web/next-flow/tests/unit/*` | Existing business/config regression suite | Must pass; change only for proven corrected contract |
| `apps/web/next-flow/tests/integration/auth-session.test.ts` | Legacy internal-auth integration regression | Must continue passing; Auth.js migration is out of scope |
| `apps/web/next-flow/tests/integration/foodflow-core-workflow.test.ts` | Browser-independent FoodFlow core workflow regression | Must continue passing |
| `apps/web/next-flow/tests/integration/database-runtime.test.ts` | Real DB runtime/RLS integration; runs only with `DATABASE_URL` | Database execution belongs R03/R04; do not fake execution in R02 |
| `apps/web/next-flow/tests/e2e/*` | Browser E2E coverage | Not an R02 required gate |

## Current CI interaction that must be understood

The required `src/server/db/config.ts` change matches both:

```text
Next Flow Quality paths
Supabase Database Quality paths
```

Therefore the R02 implementation PR can legitimately show:

```text
Next Flow Quality            PASS   ← R02 required
Supabase Database Quality    FAIL   ← inherited R03 work, if unchanged
```

That state is acceptable for R02 only if the database failure is demonstrably inherited/later-round and R02 introduced no new DB regression.

---

# 7. Files to CREATE

No new production/application file is mandatory at specification time.

### Allowed conditional creation

A new test/helper file may be created only when all conditions are true:

1. a canonical R02 validation command exposes a deterministic application-quality gap;
2. the new file is the minimal maintainable way to regression-test the repair;
3. it does not introduce new architecture/product scope;
4. the PR documents the failure that required it.

Do not create speculative architecture modules, repositories, adapters, auth modules, migrations, feature flags, or product code in R02.

---

# 8. Files to MODIFY

## Required

| Path | Current behavior | Required change |
|---|---|---|
| `apps/web/next-flow/src/server/db/config.ts` | Default `process.env` assignment causes TS2559 | Establish a real typed optional/default environment boundary while preserving lazy/server-only/security semantics |
| `apps/web/next-flow/tests/unit/database-config.test.ts` | Does not explicitly exercise repaired zero-argument/default-environment path | Add regression coverage for default `process.env` path and preserve existing secret/validation coverage |

## Conditional — only after a reproduced R02-owned failure

| Path category | Condition | Constraint |
|---|---|---|
| another `apps/web/next-flow/src/**` file | lint/typecheck/test/build reaches a deterministic application blocker there | Minimal compatibility/correctness fix only; no feature/refactor expansion |
| another `apps/web/next-flow/tests/**` file | existing assertion/configuration is demonstrably stale or missing regression coverage for an R02 repair | Preserve business contract; no disabling/skipping |
| `apps/web/next-flow/package.json` | a script-level defect prevents intended application validation from being run truthfully | No dependency upgrade/addition without explicit owner reason; lockfile must stay consistent |
| `.github/workflows/next-flow-quality.yml` | workflow itself, not application code, prevents the intended gate from executing correctly | Do not remove/weaken stages or permissions |

## Not authorized in R02

Do not modify for R02 purposes:

```text
supabase/migrations/**
supabase/seed.sql
supabase/tests/database/**
.github/workflows/supabase-db-quality.yml
apps/web/next-flow/src/server/db/generated/database.ts
apps/web/next-flow/src/lib/auth/**
apps/web/next-flow/src/app/api/auth/**
apps/web/next-flow/src/proxy.ts
payment provider code
customer redesign code
voice code
```

unless the owner explicitly changes the round scope in a new/revised specification.

---

# 9. Files to MOVE

None planned.

R02 must not use application recovery as an excuse to reorganize source ownership.

If a move is unexpectedly required to fix a deterministic module-resolution/build defect, stop and obtain owner approval because that is likely architecture scope rather than a narrow recovery.

---

# 10. Files to REMOVE

None planned.

Do not remove:

- legacy auth files;
- tests;
- database runtime files;
- workflows;
- dependencies;
- routes;
- product components.

Removal of temporary authentication belongs to the later identity/auth phase, not R02.

---

# 11. Database Changes

## Tables

None.

## Columns

None.

## Constraints

None.

## Indexes

None.

## RLS / Tenant isolation

None.

Do not change RLS policy semantics in R02.

## Migrations / Backfill

None.

No production or remote database mutation.

## Generated database types

Do not regenerate or manually edit `src/server/db/generated/database.ts` in R02.

Fresh migrated-database generation/type drift belongs to R03.

## Required declarations

```text
DATABASE_SCHEMA_CHANGED: NO
PRODUCTION_DB_MODIFIED: NO
DATABASE_MIGRATION_CREATED: NO
RLS_CHANGED: NO
GENERATED_DB_TYPES_CHANGED: NO
```

---

# 12. Backend Changes

## Services / Domain logic

No business/domain service change is planned.

The required `getDatabaseConfig()` repair is infrastructure configuration logic, not a domain behavior change.

### Required runtime configuration contract

The implementation must preserve:

```text
DATABASE_URL
DATABASE_POOL_MAX
DATABASE_CONNECTION_TIMEOUT_MS
DATABASE_IDLE_TIMEOUT_MS
```

with current defaults and bounds unless a separately reproduced bug proves those values wrong.

Do not add a hard database-config read at module import time.

## Server actions / Route handlers / API

None planned.

No API contract change.

## Validation

Keep positive-integer validation for pool/timeouts.

Keep URL/secret values out of thrown messages.

The environment type boundary must be precise enough for TypeScript without using unsafe suppression.

## Authorization

No authorization behavior change.

## Idempotency / Concurrency

No change.

---

# 13. Frontend Changes

## Routes / Pages

None planned.

## Components

None planned.

## State / Data fetching

None planned.

## User interactions

None planned.

## Responsive behavior

No change.

## Loading / Empty / Error states

No product UI change.

If a later build failure requires a minimal Next route/layout typing repair, it must preserve rendered behavior and be documented as an application compatibility repair, not a redesign.

---

# 14. Authentication and Authorization

- Roles affected: `NONE`
- Permissions required: `NONE`
- Route protection change: `NO`
- Backend permission enforcement change: `NO`
- Session authority change: `NO`
- Auth.js runtime implementation: `NO`
- Temporary internal auth removal: `NO`
- Customer auth/capability change: `NO`

Legacy auth regression tests must continue passing until the planned auth cutover phase replaces them atomically.

R02 must not begin that cutover.

---

# 15. Security Requirements

## Type-safety integrity

R02 must not make the quality gate green by weakening safety.

Forbidden examples:

```text
@ts-ignore
blanket @ts-expect-error
as any to silence the known blocker
turning strict off
excluding failing source from tsconfig
removing failing tests
workflow `continue-on-error`
shell `|| true`
```

A narrow documented type assertion is permitted only when it expresses a runtime-validated/proven invariant and is not simply hiding the TS2559 condition.

## Secret handling

- Never commit `DATABASE_URL` or any live connection string.
- Tests use synthetic/example-invalid URLs only.
- No thrown message may echo a full connection URL or password.
- No CI log instrumentation may print secret environment values.
- `.env.local` and deployment secrets are not modified or committed.

## Database safety

- No production DB access is required.
- No remote migration is allowed.
- No service-role/RLS bypass is introduced.
- No browser DB access is introduced.

## Application security regression

Existing auth/session/business tests must not be weakened.

If a security-relevant test fails after the compile blocker is removed, classify the failure before editing. Do not normalize an insecure behavior simply to make the suite pass.

## Dependency safety

- No `npm audit fix --force`.
- No uncontrolled major upgrade.
- No removal of vulnerable-package evidence from PR notes.
- Any newly observed critical direct-runtime vulnerability requires owner escalation.

## Next.js safety

Any Next-specific change must follow repository-local Next 16.3.0 documentation as required by `AGENTS.md`.

---

# 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| R02 spec missing from `main` | Stop before implementation | Merge reviewed spec first |
| Previous PR #17 not merged/ancestor | Stop | Resolve repository progression before R02 |
| `npm ci` fails again | R02 cannot proceed; dependency baseline regressed | Determine whether current main changed dependency state; fix only if within R02/owner-approved scope |
| Known TS2559 still reproduces after attempted repair | R02 incomplete | Fix real environment type boundary; do not suppress |
| New typecheck error appears after TS2559 | Classify ownership | Minimal R02 repair if application quality; otherwise stop/hand off |
| Unit test fails | Treat as real regression until proven otherwise | Fix source or corrected test contract; never delete/skip to pass |
| `auth-session.test.ts` fails | Legacy auth regression; R02 does not migrate auth | Repair only an unintended R02 regression; do not start Auth.js cutover |
| `foodflow-core-workflow.test.ts` fails | Business regression | Restore existing invariant; no product redesign |
| DB runtime integration test skips without `DATABASE_URL` | Expected in non-DB application run | Record skip; R03/R04 own DB execution |
| `build:next` requests `DATABASE_URL` | Violates lazy DB-config boundary | Remove accidental eager config access; do not inject secret merely to make build pass |
| `build:next` reveals Next.js compatibility error | Read local Next docs first | Minimal documented compatibility repair |
| `Supabase Database Quality` fails with inherited migration/bootstrap error | Visible later-round diagnostic | Record exact failure and hand to R03; do not edit DB scope |
| `Supabase Database Quality` fails due a new R02 regression | R02 incomplete | Revert/fix the R02-induced regression without broad DB repair |
| Docker registry/rate-limit error appears before deterministic DB failure | Record as transient infrastructure noise | Do not classify DB as green; R03/R05 handle retry/service strategy |
| Vercel remains failed | Visible R05 diagnostic | Record only; no deployment work in R02 |
| npm install reports known high vulnerabilities | Record truthfully | Do not force upgrade; escalate only if critical/new baseline-invalidating issue |
| A proposed fix requires broad dependency/architecture migration | Scope violation | Stop and request owner decision |

## Recovery principle

R02 is allowed to iterate through newly exposed **application** blockers until the application gate is green.

It is not allowed to make unrelated checks green by stealing scope from R03–R05.

---

# 17. Dependencies

## Internal

R02 depends on:

- merged P01/R01 specification;
- merged P01/R01 implementation PR #17;
- synchronized `package.json` / `package-lock.json` from R01;
- existing application regression suites;
- existing `Next Flow Quality` workflow;
- current `server/db` runtime foundation remaining lazy.

## External

Execution contract:

```text
Node.js 22
npm 10.x as provided by current GitHub runner/toolchain
Next.js 16.3.0 from committed lockfile
TypeScript 5.x from committed lockfile
Vitest 4.1.10 from committed lockfile
```

Do not upgrade these as part of R02 unless an actual R02 blocker cannot be solved within the committed contract and the owner approves scope change.

## Environment variables / secrets

R02 application validation must not require real secrets.

For normal R02 application checks:

```text
DATABASE_URL = not required
DATABASE_DIRECT_URL = not required
AUTH_SECRET = not required for existing legacy-auth regression/build
payment secrets = not required
```

Tests may set synthetic process environment values internally.

No new environment variable is planned.

---

# 18. Tests

## Unit

Required:

- [ ] Existing `tests/unit` suite passes.
- [ ] Database config missing-URL behavior remains covered.
- [ ] Database config secret-safe error behavior remains covered.
- [ ] Database config valid pool/timing normalization remains covered.
- [ ] Repaired zero-argument/default-`process.env` behavior is covered.
- [ ] No test requires a real database secret.

## Integration

Required application integration evidence:

- [ ] `auth-session.test.ts` passes.
- [ ] `foodflow-core-workflow.test.ts` passes.
- [ ] `npm run test:integration` is executed and its exact pass/skip result is recorded.
- [ ] `database-runtime.test.ts` is not misreported as DB integration PASS when skipped for missing `DATABASE_URL`.

Database runtime execution itself belongs to R03/R04.

## End-to-end

R02 required E2E: **NO**.

Existing Playwright files are not modified unless a deterministic application build/test repair directly requires it, which should be exceptional.

E2E status in the implementation PR:

```text
E2E: NOT RUN / NOT APPLICABLE FOR R02
```

unless the implementation agent actually runs it and records evidence.

## Authorization / RLS / Security

- [ ] No auth/RBAC/RLS behavior change.
- [ ] Existing auth session regression remains green.
- [ ] Secret-safe database config test remains green.
- [ ] No production secret is used.
- [ ] No RLS claim is made from R02 application tests.

## Failure cases

- [ ] Missing `DATABASE_URL` remains a lazy runtime error, not a build-time crash.
- [ ] Invalid numeric DB config remains rejected.
- [ ] Secret URL remains absent from validation error text.
- [ ] Any newly exposed application failure receives a regression test when practical.

## Regression

The full existing business/application regression suite must remain green, including current cart/menu/order/service/kitchen/payment/core-workflow tests reached by `npm run test`.

No business-rule change is planned.

---

# 19. Validation Commands

The implementation agent must run commands from:

```text
apps/web/next-flow
```

unless otherwise stated.

## Required local/application validation

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```

Record actual results only.

Do not write `PASS` for a command that was not run.

## Required GitHub validation

On the implementation PR:

```text
Phase/Round Gate: PASS
Next Flow Quality: PASS
```

If package manifest/lockfile changed:

```text
Dependency Integrity: PASS
```

Otherwise:

```text
Dependency Integrity: NOT APPLICABLE / NOT TRIGGERED
```

Observe and record:

```text
Supabase Database Quality: actual result
Vercel: actual result
```

but do not treat inherited later-round failures as R02 application work.

## Result vocabulary

Use only:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

Do not use ambiguous values such as `mostly pass`, `expected fail` as the machine status. Explanatory text may classify why a `FAIL` is later-round/inherited.

## Required application evidence fields

The implementation PR must include:

```text
NPM_CI
LINT
TYPECHECK
UNIT
APP_INTEGRATION
DATABASE_RUNTIME_INTEGRATION
BUILD_NEXT
NEXT_FLOW_QUALITY
SUPABASE_DB_QUALITY
VERCEL_STATUS
```

---

# 20. PR Requirements

The P01/R02 **implementation** PR must:

- [ ] target `main`;
- [ ] reference `FLOW_P01_R02_IMPLEMENTATION_SPEC.md` exactly;
- [ ] declare `Phase: 01` and `Round: 02`;
- [ ] declare `Previous: FLOW_P01_R01_IMPLEMENTATION_SPEC.md`;
- [ ] reference previous implementation PR `#17`;
- [ ] reference issue `#18` or the applicable traceability issue;
- [ ] declare `Next Specification: FLOW_P01_R03_IMPLEMENTATION_SPEC.md`;
- [ ] record `SPEC_BASE_SHA` and `IMPLEMENTATION_BASE_SHA` separately;
- [ ] record implementation branch/head SHA;
- [ ] describe the original TS2559 blocker and actual repair;
- [ ] list every additional application blocker surfaced after the first repair;
- [ ] justify every conditionally modified file with the failing gate that required it;
- [ ] state whether `package.json` or `package-lock.json` changed;
- [ ] state `DATABASE_SCHEMA_CHANGED: NO`;
- [ ] state `PRODUCTION_DB_MODIFIED: NO`;
- [ ] state `AUTH_IMPLEMENTED: NO`;
- [ ] state `BUSINESS_PERSISTENCE_IMPLEMENTED: NO`;
- [ ] state `REALTIME_IMPLEMENTED: NO`;
- [ ] state `KITCHEN_REDESIGN: NO`;
- [ ] state `OMISE_IMPLEMENTED: NO`;
- [ ] state `STRIPE_IMPLEMENTED: NO`;
- [ ] state `CUSTOMER_REDESIGN: NO`;
- [ ] state `VOICE_IMPLEMENTED: NO`;
- [ ] include actual local/CI validation results;
- [ ] include exact `Supabase Database Quality` status even when non-blocking for R02;
- [ ] compare any Supabase failure with the inherited baseline and say whether R02 introduced a new DB regression;
- [ ] include actual Vercel status without attempting R05 deployment repair;
- [ ] record any npm high/critical vulnerability observation truthfully;
- [ ] contain no secret values;
- [ ] contain no unrelated feature/refactor work;
- [ ] not enable auto-merge.

## Required R02 check contract

The PR is ready for owner merge only when:

```text
Phase/Round Gate = PASS
Next Flow Quality = PASS
Dependency Integrity = PASS if triggered
```

A failing `Supabase Database Quality` or Vercel status may remain only when:

1. it belongs to a documented later-round baseline;
2. R02 did not introduce a new regression in that area;
3. the failure is recorded with exact evidence;
4. owner/manual merge remains the decision boundary.

## Suggested implementation PR handoff block

```text
PHASE: 01
ROUND: 02
SPECIFICATION: FLOW_P01_R02_IMPLEMENTATION_SPEC.md
SPEC_STATUS: READY
SPEC_BASE_SHA: 5bcd155501b67d03183b05d7ac183ea0545529af
IMPLEMENTATION_BASE_SHA: <latest-main-after-spec-merge>
IMPLEMENTATION_HEAD_SHA: <r02-head>
IMPLEMENTATION_BRANCH: phase/01-round/02-application-quality
IMPLEMENTATION_PR: <number>
PREVIOUS_IMPLEMENTATION_PR: #17
PREVIOUS_IMPLEMENTATION_MERGE_SHA: 5bcd155501b67d03183b05d7ac183ea0545529af
NPM_CI: PASS
LINT: PASS
TYPECHECK: PASS
UNIT: PASS
APP_INTEGRATION: PASS
DATABASE_RUNTIME_INTEGRATION: NOT APPLICABLE | PASS only if actually run with DB
BUILD_NEXT: PASS
PHASE_ROUND_GATE: PASS
DEPENDENCY_INTEGRITY: PASS | NOT APPLICABLE
NEXT_FLOW_QUALITY: PASS
SUPABASE_DB_QUALITY: <actual>
SUPABASE_FAILURE_CLASS: <inherited R03 blocker | PASS | new regression>
VERCEL_STATUS: <actual>
FIRST_APPLICATION_BLOCKER_BEFORE: src/server/db/config.ts TS2559
FINAL_APPLICATION_BLOCKER: NONE
DATABASE_SCHEMA_CHANGED: NO
PRODUCTION_DB_MODIFIED: NO
AUTH_IMPLEMENTED: NO
BUSINESS_PERSISTENCE_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
KITCHEN_REDESIGN: NO
OMISE_IMPLEMENTED: NO
STRIPE_IMPLEMENTED: NO
CUSTOMER_REDESIGN: NO
VOICE_IMPLEMENTED: NO
PR_READY_FOR_OWNER_REVIEW: YES
PR_MERGED: NO
NEXT_SPECIFICATION: FLOW_P01_R03_IMPLEMENTATION_SPEC.md
```

---

# 21. Definition of Done

P01/R02 is implementation-complete only when every required condition below is satisfied.

## Repository / progression

- [ ] R02 spec exists on `main` before implementation.
- [ ] Implementation branch was created from latest verified `main`.
- [ ] Previous R01 merge is verified as ancestor.
- [ ] PR references the exact R02 spec.
- [ ] No direct main write occurred.

## Application quality

- [ ] `npm ci` passes.
- [ ] lint passes.
- [ ] TypeScript typecheck passes with no suppression of the current blocker.
- [ ] existing unit/application tests pass.
- [ ] application integration tests pass.
- [ ] database-runtime skip/pass status is represented truthfully.
- [ ] Next.js production build passes.
- [ ] build passes without requiring DB credentials.
- [ ] `Next Flow Quality` passes on the implementation PR.

## Current blocker repair

- [ ] TS2559 at `src/server/db/config.ts` is gone for a real type-design reason.
- [ ] zero-argument/default environment path is regression-tested.
- [ ] lazy missing-DB behavior is preserved.
- [ ] secret-safe error behavior is preserved.
- [ ] pool/timeout validation behavior is preserved.

## Scope integrity

- [ ] no migration/seed/RLS/schema change;
- [ ] no generated DB type repair;
- [ ] no Auth.js runtime;
- [ ] no legacy auth removal;
- [ ] no persistence/realtime/kitchen/payment/customer/voice feature work;
- [ ] no deployment/gitlink recovery;
- [ ] no broad dependency upgrade;
- [ ] no unrelated refactor.

## Later-round check integrity

- [ ] Supabase DB check status is recorded.
- [ ] Any Supabase failure is classified as inherited vs R02-induced.
- [ ] R02 introduced no new DB regression.
- [ ] Vercel status is recorded without R05 work.
- [ ] known dependency-security findings are not silently hidden.

## Security

- [ ] no secrets committed;
- [ ] no error leaks connection URL/secret;
- [ ] no TypeScript/test/CI bypass added;
- [ ] no browser DB access added;
- [ ] no production DB modified.

## PR state

- [ ] R02 required checks pass.
- [ ] PR body contains exact evidence fields.
- [ ] PR is ready for owner review.
- [ ] auto-merge remains off.

R02 is **not merged/complete for progression** until the owner manually merges the implementation PR.

---

# 22. Handoff to Next Round

## Completed state expected after R02 merge

R03 should inherit an application baseline where:

```text
npm ci             PASS
lint               PASS
typecheck          PASS
unit tests         PASS
app integration    PASS
build:next         PASS
Next Flow Quality  PASS
```

The DB runtime configuration remains lazy and build-safe.

No application-quality blocker should obscure the database recovery work.

## Known follow-up for R03

R03 owns fresh database bootstrap recovery.

Latest inherited evidence before R02 specification shows that Supabase quality can proceed beyond dependency installation and image pulls into migration execution, where the baseline database migration/RLS setup has a deterministic failure.

R03 must reproduce the failure from the then-current `main` before changing SQL and must distinguish:

- transient image/registry errors;
- deterministic migration/schema errors;
- seed errors;
- DB test errors;
- DB lint errors;
- codegen/type-drift errors.

R02 must not pre-fix those items.

## Known follow-up after R03

R04 owns:

- real synthetic users;
- roles;
- role permissions;
- memberships;
- actor-aware database/RLS tests;
- tenant/branch negative authorization;
- runtime actor-context recovery.

R05 owns:

- gitlink/submodule ambiguity;
- CI retry classification and unnecessary Supabase service surface;
- Vercel/deployment failure diagnosis;
- broader repository/CI baseline cleanup.

R06 owns final baseline acceptance and main protection verification.

## Required next specification

```text
FLOW_P01_R03_IMPLEMENTATION_SPEC.md
```

If that exact file is not present on `main` after the R02 implementation PR is merged, development stops.

Do not infer R03 implementation scope from this handoff alone.

---

# 23. Development Gate

```text
NO SPEC = NO DEVELOPMENT
NO MERGE = NO NEXT ROUND
FAILED REQUIRED CI = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

For R02 specifically:

```text
REQUIRED R02 CI
=
Phase/Round Gate
+
Next Flow Quality
+
Dependency Integrity only when triggered by dependency-file changes
```

Visible later-round diagnostic checks must remain truthful and must not be hidden, but an inherited R03/R05 failure is not silently promoted into R02 product/application scope.

Before R03 begins, verify all of the following:

1. the R02 implementation PR is manually merged;
2. all R02-required checks passed;
3. no unresolved R02-induced regression remains;
4. `FLOW_P01_R03_IMPLEMENTATION_SPEC.md` exists on `main`;
5. that spec is `READY`;
6. its `Previous` points to `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`.

If any condition fails:

```text
STOP
NOTIFY OWNER
DO NOT IMPLEMENT R03
```
