# FLOW P01 R03 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 03 — Fresh Database Bootstrap Recovery

---

## Metadata

- Phase: `01`
- Round: `03`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Target branch: `main`
- Previous: `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P01_R04_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-19 04:00 Asia/Bangkok`
- Owner approval required: `YES`
- Automatic merge allowed: `NO`
- Proposal issue: `#21`
- Specification base SHA: `a368fcdbb7ead87fed4655a0ac92314f0d963e08`
- Previous implementation PR: `#20`
- Previous implementation merge SHA: `PENDING OWNER MERGE`
- Previous required checks: `Phase/Round Gate`, `Next Flow Quality`
- Current inherited database evidence source: `P01/R02 PR #20`
- Current planning scope: `PHASE 01 / ROUND 03 ONLY`
- Normal Phase 01 round slots: `04:00`, `12:00`, `20:00` Asia/Bangkok
- Recommended implementation branch: `phase/01-round/03-fresh-database-bootstrap`
- Recommended implementation PR title: `fix(database): recover P01 R03 fresh bootstrap baseline`

---

## Execution Authority Statement

This specification proposes the executable authority for P01/R03 only after it is reviewed and merged to `main`.

`Status: READY` does **not** bypass the previous-round gate.

R03 implementation is legal only when all of the following are simultaneously true on current `main`:

```text
FLOW_P01_R03_IMPLEMENTATION_SPEC.md EXISTS
+
STATUS = READY
+
P01/R02 IMPLEMENTATION PR #20 IS MERGED
+
P01/R02 REQUIRED CHECKS PASSED
+
LATEST MAIN HAS BEEN INSPECTED
```

If PR #20 is not merged, this specification may exist on `main` but R03 implementation must still stop.

The implementation agent must derive authority from current repository evidence, not from this document's authoring-time assumptions.

---

# 1. Phase Objective

Phase 01 establishes a trustworthy, deterministic and enforceable development baseline before product-level expansion continues.

R01 established delivery authorization and deterministic dependency installation. R02 recovers the application-quality baseline. R03 owns the next independent trust boundary: **a fresh local database must be able to bootstrap from committed repository state and reach the full database-quality validation chain**.

R03 must make repository evidence able to answer:

```text
Can a clean local Supabase/PostgreSQL environment start from the committed migrations?
YES

Can migrations apply in deterministic order from an empty database?
YES

Can the committed seed load deterministically?
YES

Can database SQL tests run and pass?
YES

Can database lint run and pass at the repository's declared level?
YES

Can Kysely types be generated from the freshly migrated schema?
YES

Can generated schema types be verified for drift?
YES

Can the database runtime integration suite reach and execute against the fresh database?
YES

Can this be done without production access or hidden migration-history damage?
YES
```

R03 is a **fresh bootstrap / migration execution / database quality recovery round**.

It is not an actor-aware authorization redesign round and not a product persistence round.

---

# 2. Phase Scope Context

## In scope for R03

- reproduce the inherited fresh-Supabase failure from latest authorized `main`;
- capture the first deterministic SQL/database error, not only the outer CLI wrapper error;
- distinguish transient image/registry failures from deterministic migration failures;
- repair only what is necessary to make a fresh local database bootstrap trustworthy;
- preserve migration-history safety and document any migration-history decision;
- preserve deterministic synthetic seed behavior;
- make database SQL tests executable and green where owned by the bootstrap baseline;
- make database lint executable and green where owned by the bootstrap baseline;
- regenerate Kysely types from a fresh migrated database when schema truth requires it;
- verify committed generated database types for legitimate drift;
- execute the database runtime integration suite against the fresh local database;
- restore `Supabase Database Quality` to PASS;
- preserve the green application baseline established by R02;
- record any later authorization-specific failure that properly belongs to R04 instead of silently broadening scope.

## Explicitly out of scope

Unless a minimal compatibility correction is mechanically required to make the current committed database baseline boot at all, R03 must not implement:

- new product features;
- Auth.js runtime cutover;
- OAuth provider work;
- customer/session/cart/order persistence migration;
- realtime synchronization;
- kitchen runtime redesign;
- Omise / Opn integration;
- Stripe SaaS billing;
- Voice Ordering;
- CareFlow or JobFlow implementation;
- repository gitlink/submodule cleanup;
- Vercel/deployment recovery;
- branch protection/ruleset rollout;
- actor-aware business permission redesign;
- new tenant membership semantics;
- broad RLS authorization expansion owned by R04;
- production or linked Supabase mutation.

## R03 / R04 boundary

R03 owns whether the database can be created, migrated, seeded, linted, type-generated and exercised from a fresh environment.

R04 owns whether actor/user/membership/branch-aware authorization and negative access semantics are correct.

If an R03 validation reaches an actor-aware authorization assertion and reveals an inherited semantic defect that is not necessary for basic bootstrap correctness, record it for R04 instead of redesigning authorization in R03.

---

# 3. This Round Objective

At the end of R03, the following chain must be reproducible from committed state:

```text
CLEAN APPLICATION DEPENDENCY INSTALL
        ↓
LOCAL SUPABASE START
        ↓
ALL MIGRATIONS APPLY
        ↓
DETERMINISTIC SEED LOADS
        ↓
LOCAL DATABASE RESET SUCCEEDS
        ↓
DATABASE SQL TESTS PASS
        ↓
DATABASE LINT PASS
        ↓
KYSELY TYPES GENERATE
        ↓
GENERATED TYPE DRIFT CHECK PASS
        ↓
DATABASE RUNTIME INTEGRATION PASS
        ↓
SUPABASE DATABASE QUALITY PASS
```

The existing application quality gate must remain green if R03 modifies any application-side generated or DB runtime file.

## Mandatory outcomes

### Outcome A — exact R02 handoff verification

Before editing:

- verify PR #20 is merged;
- verify its actual merge SHA;
- verify `Phase/Round Gate` passed for R02;
- verify `Next Flow Quality` passed for R02;
- fetch latest `main`;
- compare latest `main` to this spec base SHA;
- inspect every intervening commit that can affect R03 assumptions.

If R02 is not merged or required checks are not green, stop.

### Outcome B — deterministic failure reproduction

Reproduce the database workflow from latest `main` before changing SQL.

The inherited evidence at specification authoring time is:

```text
Supabase Database Quality
→ Install dependencies: PASS
→ Start local Supabase: FAIL
→ attempts: 3
→ deterministic failure while applying
  20260816050000_phase2_foodflow_database_baseline.sql
→ statement: 97
→ RLS bootstrap block / tenant_isolation policy creation
→ all later DB validation stages: NOT RUN / SKIPPED
```

The same R02 run also observed transient container-registry `toomanyrequests` messages while images were being pulled. Those transient messages must not be confused with the later deterministic SQL failure that reproduced after images became available.

### Outcome C — root SQL error identified

The implementation PR must report the actual PostgreSQL/Supabase root error beneath the generic migration wrapper.

Use debug output or a direct safe local reproduction when necessary.

Do not state only:

```text
Failed to execute statement 97
```

Record which table/policy/expression/constraint caused the failure and why.

### Outcome D — migration-history safety decision

Before editing any existing committed migration, determine whether the candidate migration is safe to alter under repository history policy.

Repository policy currently states:

```text
APPLIED MIGRATIONS MUST NOT BE REWRITTEN
FORWARD-ONLY MIGRATION POLICY
NO PRODUCTION PUSH / REPAIR AS VALIDATION
```

Special handling:

- `20260814071654_phase1_tenant_audit_baseline.sql` is a historical no-op and must remain untouched.
- The currently failing migration is `20260816050000_phase2_foodflow_database_baseline.sql`.
- If evidence shows that the failing migration may already be applied to an authoritative external environment, do not rewrite it merely to make local CI green. Stop and request owner direction if no safe forward-compatible recovery exists.
- If evidence proves the migration is an unapplied broken baseline and owner/repository history permits minimal correction, document that evidence and keep the change narrowly limited to the actual bootstrap defect.

No migration history decision may be hidden in a generic SQL diff.

### Outcome E — fresh database chain restored

After repair, all database quality stages owned by R03 must actually execute, not merely become reachable in theory.

### Outcome F — application baseline preserved

R02 established a green application baseline. R03 must not regress it.

If generated database types or DB runtime files change and trigger `Next Flow Quality`, that workflow must pass before R03 can merge.

### Outcome G — stop at owner review

Open/update the R03 implementation PR with complete database evidence and stop.

No auto-merge.

No R04 implementation.

---

# 4. Preconditions

## Development gate

- [ ] This exact R03 specification exists on `main`.
- [ ] `Status` is `READY`.
- [ ] Phase is `01`.
- [ ] Round is `03`.
- [ ] Previous is `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`.
- [ ] Next is `FLOW_P01_R04_IMPLEMENTATION_SPEC.md`.
- [ ] R02 implementation PR #20 is merged.
- [ ] R02 required checks passed.
- [ ] R03 implementation branch is created from latest verified `main`.

If any item fails, stop before implementation.

## Required repository reading

Before changes:

- [ ] repository `README.md`;
- [ ] `CONTRIBUTING.md`;
- [ ] `SECURITY.md`;
- [ ] `docs/07-delivery/development-phases/README.md`;
- [ ] `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`;
- [ ] full R02 specification and final R02 implementation PR evidence;
- [ ] this full R03 specification;
- [ ] `supabase/README.md`;
- [ ] `apps/web/next-flow/AGENTS.md`;
- [ ] `apps/web/next-flow/src/server/db/README.md`;
- [ ] any nested instruction file applying to modified paths.

## Working-tree safety

Before local edits:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

Preserve unrelated user changes. Do not use destructive reset/clean/restore commands against unreviewed work.

## Environment

Required local/CI capabilities:

- Node.js 22 compatible with repository CI;
- npm compatible with lockfile v3;
- Docker or compatible runtime required by local Supabase;
- pinned Supabase CLI from `apps/web/next-flow` dependencies;
- no production credentials;
- no linked production Supabase project.

---

# 5. Architecture Scope

## Frontend

Impact: `NONE` expected.

No customer, staff, kitchen, cashier, manager or owner UI change belongs to R03.

## Backend application behavior

Impact: `LOW / COMPATIBILITY ONLY`.

Application-side DB files may change only if required for generated schema type correctness or fresh runtime integration compatibility discovered after the database is restored.

Do not migrate business repositories or product flows.

## Database

Impact: `HIGH`.

R03 may touch only database-bootstrap surfaces necessary to restore deterministic creation and validation:

- migration compatibility;
- seed compatibility;
- DB tests directly invalidated by corrected bootstrap truth;
- generated DB types;
- narrow DB runtime compatibility if fresh integration exposes an R03-owned defect.

## Authentication / Authorization

No Auth.js runtime work.

R03 must preserve existing tenant/RLS intent while avoiding actor-aware redesign owned by R04.

## Infrastructure / CI

Existing `Supabase Database Quality` is the canonical R03 workflow.

Do not replace it with a weaker workflow. Modify it only if evidence proves the workflow itself, rather than repository database state, prevents the intended deterministic validation chain.

Transient registry failures should be classified honestly; retries must not mask deterministic SQL failure.

---

# 6. Existing Files and Current Behavior

| Path | Current responsibility / evidence | R03 action |
|---|---|---|
| `supabase/README.md` | Defines migration policy, local workflow, seed semantics, RLS baseline and deferred responsibilities. | Treat as governing DB baseline documentation; update only if recovery changes an explicitly documented contract. |
| `supabase/config.toml` | Local Supabase service/config baseline. | Preserve unless a proven bootstrap configuration defect exists. |
| `supabase/migrations/20260814071654_phase1_tenant_audit_baseline.sql` | Historical no-op migration that may exist outside repo. | DO NOT MODIFY. |
| `supabase/migrations/20260816050000_phase2_foodflow_database_baseline.sql` | Structural FoodFlow/Supabase baseline; currently fails on fresh startup at statement 97. | Diagnose exact root cause before any change. Migration-history decision required. |
| `supabase/migrations/20260816053000_phase2_foodflow_integrity_hardening.sql` | Later integrity hardening. | Must become reachable and apply successfully; modify only if it has an independently proven R03 bootstrap incompatibility. |
| `supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql` | Previously merged historical actor/RBAC tenancy work. | Must be allowed to apply during fresh bootstrap, but R03 must not redesign its authorization semantics unless a mechanical bootstrap blocker is unavoidable. Hand semantic auth issues to R04. |
| `supabase/seed.sql` | Deterministic synthetic fixture data. | Must load on reset; no real data. |
| `supabase/tests/**` | Database SQL/pgTAP validation. | Must execute after bootstrap; repair only R03-owned expectations proven inconsistent with corrected schema baseline. |
| `apps/web/next-flow/src/server/db/generated/database.ts` | Generated Kysely representation of migrated schema. | Regenerate from fresh database; commit only legitimate schema drift. |
| `apps/web/next-flow/scripts/generate-database-types.mjs` | Generates Kysely types from direct DB URL. | Preserve unless a proven generator defect exists. |
| `apps/web/next-flow/scripts/verify-database-types.mjs` | Generated type verification support. | Preserve unless a proven R03 defect exists. |
| `apps/web/next-flow/tests/integration/database-runtime.test.ts` | Runtime DB integration/RLS transaction baseline. | Must execute with local DB after bootstrap; actor-aware semantic expansion is R04. |
| `.github/workflows/supabase-db-quality.yml` | Canonical DB CI chain. | Must end PASS; do not skip stages to force green. |
| `.github/workflows/next-flow-quality.yml` | Canonical application quality. | Preserve green R02 baseline. |

## Current likely defect candidate — diagnosis only

Source inspection shows the RLS loop includes `app.organizations` in a generic policy statement that references a `tenant_id` column, while `app.organizations` defines its tenant identity as primary key `id` and does not define a `tenant_id` column.

This is a strong root-cause candidate, but **R03 must confirm the actual PostgreSQL error before implementing a fix**.

Do not convert this observation into an unreviewed schema redesign.

---

# 7. Files to CREATE

No file creation is mandatory before diagnosis.

Permitted only when evidence requires it:

- a narrowly scoped forward compatibility migration if migration-history policy and execution ordering make that approach safe;
- a focused database test that reproduces the corrected bootstrap invariant;
- an evidence/helper script only if existing repository tooling cannot deterministically expose the root error.

Do not create duplicate migration systems, alternate schemas, shadow seeds or parallel generated-type ownership.

---

# 8. Files to MODIFY

Modification is evidence-driven, not pre-authorized by filename.

Likely candidate surfaces:

- `supabase/migrations/20260816050000_phase2_foodflow_database_baseline.sql` — only after migration-history decision gate;
- later migrations if they expose a distinct deterministic bootstrap incompatibility after the first blocker is resolved;
- `supabase/seed.sql` if and only if corrected schema truth makes current deterministic seed invalid;
- relevant `supabase/tests/**` if an existing assertion encodes an invalid baseline assumption;
- `apps/web/next-flow/src/server/db/generated/database.ts` through generation tooling, never hand-fabricated;
- DB runtime/test files only for a proven R03 compatibility defect.

Must not:

- hand-edit generated database types;
- delete failing DB tests to force green;
- weaken RLS globally;
- grant broad bypass roles;
- disable DB lint;
- skip migrations;
- comment out the failing policy block without restoring equivalent intended protection;
- add `continue-on-error` to required DB stages;
- replace deterministic seed with environment-dependent live data.

---

# 9. Files to MOVE

No move is expected.

Do not rename existing migration versions as a casual repair.

A migration filename/version is historical identity and must be treated as such.

---

# 10. Files to REMOVE

No removal is expected.

Specifically do not remove:

- historical migrations;
- current database SQL tests;
- RLS policies simply to make startup pass;
- DB runtime integration tests;
- generated-type verification;
- existing quality workflows.

---

# 11. Database Changes

## Migration execution

Primary R03 responsibility.

The fresh database must apply all committed migrations in deterministic order.

## Schema

No new product schema is intended.

Any schema change must be a minimal correction of a proven bootstrap defect and documented with before/after semantics.

## RLS / tenant isolation

Preserve tenant isolation intent.

If the root error is caused by applying a generic `tenant_id` policy to a tenant-root table whose identity is `id`, the repair must preserve correct tenant semantics rather than simply removing RLS.

R04 still owns actor/membership/branch-aware authorization refinement.

## Seed

`supabase/seed.sql` remains synthetic and deterministic.

No production data, provider token, customer PII or live credential may be introduced.

## Generated types

Generate from the freshly migrated local database using repository tooling.

Generated type changes must correspond to real schema truth and be reviewed for broad/unexpected drift.

## Production database

```text
PRODUCTION_DB_MODIFIED: NO
REMOTE_DB_PUSHED: NO
LINKED_DB_RESET: NO
```

R03 must not run production mutation commands as validation.

---

# 12. Backend Changes

No business-domain backend feature work.

Permitted backend work is limited to:

- generated Kysely type synchronization;
- narrow DB runtime compatibility discovered only after the fresh bootstrap chain is restored.

Any runtime change must preserve:

- server-only boundary;
- lazy DB configuration;
- explicit tenant transaction context;
- no secret exposure;
- no browser-controlled authorization context.

---

# 13. Frontend Changes

None.

No page, component, UX, route, responsive or customer-copy change belongs to R03.

---

# 14. Authentication and Authorization

## Application authentication

Unchanged.

No Auth.js implementation.

## Database authorization

R03 verifies that existing committed database authorization structures can bootstrap and support the current baseline tests.

Do not turn R03 into final RBAC acceptance.

If fresh bootstrap reaches failures specifically requiring real actor fixtures, memberships, branch-scoped policies or negative actor authorization semantics, record the first actionable failure for R04 unless the failure prevents basic schema creation itself.

---

# 15. Security Requirements

- no production database credentials;
- no remote production mutation;
- no `supabase db reset --linked`;
- no `supabase migration repair` against production as a shortcut;
- no `supabase db push` to a production project as validation;
- no migration-history rewrite without explicit evidence and policy decision;
- preserve RLS/tenant isolation rather than bypass it;
- no `BYPASSRLS` privilege added for normal runtime;
- no secrets in migration, seed, test, PR or logs;
- no real customer data in seed/tests;
- generated types come from tooling, not hand edits;
- database error reporting in PR must redact connection strings/passwords;
- transient Docker/registry errors must be distinguished from deterministic SQL errors;
- retries must not be used to hide a deterministic migration defect.

---

# 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| R02 PR #20 not merged | R03 implementation forbidden. | Wait for owner/manual merge. |
| R02 required check failed | R03 implementation forbidden. | Return to R02 ownership. |
| R03 spec missing/not READY on main | Stop. | Review/merge correct spec first. |
| Latest main differs from spec base | Do not use stale base. | Inspect intervening commits and branch from latest main. |
| Docker/container registry rate limit | Classify as transient only if SQL has not begun. | Retry with evidence; do not edit DB code solely for registry rate limit. |
| Same SQL failure reproduces after images are available | Treat as deterministic DB blocker. | Capture debug/root DB error and fix in R03 scope. |
| Root error indicates generic RLS expression references nonexistent column | Do not merely disable RLS. | Correct policy/schema relationship while preserving tenant isolation and history safety. |
| Candidate migration is already applied externally | Do not rewrite blindly. | Use safe forward strategy or stop for owner decision if impossible. |
| Migration-history status cannot be established | Do not guess. | Record blocker and request owner direction. |
| Fresh start passes but reset/seed fails | Continue R03 diagnosis at first deterministic reset/seed error. | Repair only bootstrap/seed compatibility. |
| SQL tests fail after successful bootstrap | Classify assertion as R03 structural vs R04 actor-aware. | Fix only R03-owned structural baseline; hand authorization semantics to R04. |
| DB lint fails | Record exact warning/error and schema. | Repair real DB quality issue without suppressing lint. |
| Kysely generation produces broad drift | Do not commit blindly. | Compare migrated schema, generator version and expected type ownership. |
| DB runtime integration fails due missing bootstrap prerequisites | R03 owns prerequisite. | Repair minimal runtime/schema compatibility. |
| DB runtime integration reaches actor-aware semantic mismatch | Do not expand silently. | Record for R04 unless basic bootstrap is impossible. |
| Next Flow Quality regresses because of R03 change | R03 cannot merge. | Fix R03-induced application regression. |
| Vercel/gitlink warning remains | Keep visible but do not steal R05 scope. | Handoff to R05. |

---

# 17. Dependencies

## Internal

- merged R02 implementation and evidence;
- `supabase/README.md`;
- `supabase/config.toml`;
- all committed migrations;
- `supabase/seed.sql`;
- `supabase/tests/**`;
- generated DB types and generation scripts;
- DB runtime integration tests;
- `Supabase Database Quality` workflow;
- `Next Flow Quality` workflow;
- Phase/Round gate.

## External execution

- GitHub Actions;
- Docker-compatible container runtime;
- Supabase CLI pinned by repository dependencies;
- PostgreSQL image/config selected by current Supabase project configuration;
- Node.js 22;
- npm.

## Environment variables

Local CI values may include only test/local URLs such as the current workflow's localhost PostgreSQL URL.

No live production secret is required.

---

# 18. Tests

## Bootstrap

- [ ] `supabase start` succeeds from clean local state.
- [ ] all migrations apply in order.
- [ ] no migration is silently skipped.
- [ ] deterministic seed loads.
- [ ] `supabase db reset --local` succeeds.

## SQL / structural database

- [ ] repository pgTAP/SQL tests run.
- [ ] tenant/RLS structural baseline assertions pass where owned by R03.
- [ ] money/currency/integrity constraints remain protected.
- [ ] order/table/session baseline constraints remain protected.
- [ ] no database test removed merely to force green.

## Lint

- [ ] database lint runs against declared schemas.
- [ ] lint passes at repository-configured warning/error contract.

## Generated types

- [ ] Kysely codegen runs against freshly migrated DB.
- [ ] generated output is deterministic.
- [ ] drift check passes.
- [ ] broad unexpected drift investigated.

## Runtime integration

- [ ] DB runtime test executes with local database URL.
- [ ] health query works.
- [ ] tenant transaction context works for current baseline.
- [ ] cross-tenant denial baseline remains protected.
- [ ] pooled connection context does not leak.
- [ ] rollback/context cleanup baseline remains protected.

R04 may later strengthen actor-aware fixtures and semantics; R03 must not delete current security coverage.

## Application regression

- [ ] `Next Flow Quality` remains green if triggered.
- [ ] no DATABASE_URL is required for `next build`.
- [ ] no product behavior changed.

---

# 19. Validation Commands

Use repository commands that actually exist and record actual outcomes.

## Repository/base evidence

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

## Toolchain

From `apps/web/next-flow`:

```bash
node --version
npm --version
npm ci
```

## Fresh local Supabase

From repository root using the pinned CLI path or equivalent repository-supported invocation:

```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

If startup fails before repair, rerun with diagnostic/debug output sufficient to capture the underlying PostgreSQL error. Record the exact diagnostic command actually used.

## Generated database types

From `apps/web/next-flow` with the local direct URL:

```bash
npm run db:generate
git diff --exit-code -- src/server/db/generated/database.ts
```

If generation intentionally changes the committed file, review and commit the legitimate generated diff, then rerun generation/drift verification from clean committed state.

## Database runtime integration

```bash
npm run test:db-runtime
```

with local `DATABASE_URL` / `DATABASE_DIRECT_URL` values only.

## Application preservation

When affected paths trigger application quality, record:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```

## Result vocabulary

Every reported item must use exactly one of:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

---

# 20. PR Requirements

The R03 implementation PR must target `main` and include:

```text
Specification: FLOW_P01_R03_IMPLEMENTATION_SPEC.md
Phase: 01
Round: 03
Previous: FLOW_P01_R02_IMPLEMENTATION_SPEC.md
Previous PR: #20
Related Issue: #21
Next Specification: FLOW_P01_R04_IMPLEMENTATION_SPEC.md
```

## Required SHA evidence

```text
SPEC_BASE_SHA: a368fcdbb7ead87fed4655a0ac92314f0d963e08
R02_MERGE_SHA: <actual owner merge SHA>
IMPLEMENTATION_BASE_SHA: <latest main used for branch>
IMPLEMENTATION_HEAD_SHA: <final branch head>
```

Explain all intervening commits between spec base and implementation base.

## Required database evidence

```text
SUPABASE_START_BEFORE: PASS / FAIL / BLOCKED
FIRST_DETERMINISTIC_DB_BLOCKER_BEFORE: ...
ROOT_DB_ERROR: ...
TRANSIENT_INFRA_NOISE: ...
MIGRATION_HISTORY_DECISION: ...
MIGRATION_FILES_CHANGED: ...
SEED_CHANGED: YES / NO
DATABASE_SCHEMA_CHANGED: YES / NO
RLS_CHANGED: YES / NO
GENERATED_DB_TYPES_CHANGED: YES / NO
SUPABASE_START_AFTER: PASS / FAIL
DB_RESET_LOCAL: PASS / FAIL
DB_SQL_TESTS: PASS / FAIL
DB_LINT: PASS / FAIL
DB_GENERATE: PASS / FAIL
DB_TYPE_DRIFT: PASS / FAIL
DB_RUNTIME_INTEGRATION: PASS / FAIL / BLOCKED
SUPABASE_DB_QUALITY: PASS / FAIL
```

## Required application preservation evidence

```text
NEXT_FLOW_QUALITY: PASS / FAIL / NOT APPLICABLE
LINT: PASS / FAIL / NOT RUN / NOT APPLICABLE
TYPECHECK: PASS / FAIL / NOT RUN / NOT APPLICABLE
UNIT: PASS / FAIL / NOT RUN / NOT APPLICABLE
APP_INTEGRATION: PASS / FAIL / NOT RUN / NOT APPLICABLE
BUILD_NEXT: PASS / FAIL / NOT RUN / NOT APPLICABLE
```

## Required production declarations

```text
PRODUCTION_DB_MODIFIED: NO
REMOTE_DB_PUSHED: NO
LINKED_DB_RESET: NO
PRODUCTION_SECRET_USED: NO
AUTH_IMPLEMENTED: NO
BUSINESS_PERSISTENCE_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
KITCHEN_REDESIGN: NO
OMISE_IMPLEMENTED: NO
STRIPE_IMPLEMENTED: NO
CUSTOMER_REDESIGN: NO
VOICE_IMPLEMENTED: NO
```

## Merge control

- no direct push to `main`;
- no auto-merge;
- required R03 checks must pass;
- owner/manual merge required;
- R03 remains incomplete until owner merges the implementation PR.

---

# 21. Definition of Done

P01/R03 is complete only when all required conditions are backed by repository/CI evidence.

## Authorization / base

- [ ] R02 implementation PR #20 was merged first.
- [ ] R02 required checks passed.
- [ ] this R03 spec was merged to main before implementation.
- [ ] implementation branch started from latest verified main.
- [ ] implementation base SHA documented.

## Failure diagnosis

- [ ] inherited Supabase failure reproduced from current main or explained if repository state changed.
- [ ] transient registry/image failures distinguished from deterministic SQL failure.
- [ ] actual root DB error captured.
- [ ] migration-history safety decision documented.

## Fresh bootstrap

- [ ] local Supabase starts.
- [ ] all migrations apply.
- [ ] deterministic seed loads.
- [ ] local reset succeeds.

## Database quality

- [ ] SQL tests pass.
- [ ] DB lint passes.
- [ ] Kysely generation succeeds.
- [ ] generated type drift verification passes.
- [ ] DB runtime integration executes and passes for R03 baseline.
- [ ] `Supabase Database Quality` passes.

## Security / history

- [ ] historical no-op migration remains untouched.
- [ ] no applied migration rewritten without explicit safe evidence/policy decision.
- [ ] tenant isolation not disabled to force green.
- [ ] no BYPASSRLS shortcut added.
- [ ] no production/remote database modified.
- [ ] no real data/secrets introduced.

## Application preservation

- [ ] R02 application baseline not regressed.
- [ ] Next Flow Quality passes if triggered.
- [ ] build remains independent of real DB secret.

## Scope discipline

- [ ] no Auth.js runtime work.
- [ ] no product persistence migration.
- [ ] no realtime.
- [ ] no kitchen redesign.
- [ ] no payment provider implementation.
- [ ] no voice work.
- [ ] no R05 repository/deployment cleanup stolen.
- [ ] actor-aware authorization redesign deferred to R04 unless mechanically required for bootstrap.

## Completion rule

Before owner merge:

```text
P01/R03 = IMPLEMENTED / WAITING FOR OWNER MERGE
```

After owner/manual merge:

```text
P01/R03 = COMPLETE
```

---

# 22. Handoff to Next Round

## Expected completed state after R03 merge

P01/R04 should inherit:

```text
DETERMINISTIC APPLICATION BASELINE
+
FRESH LOCAL SUPABASE BOOTSTRAP PASS
+
ALL MIGRATIONS APPLY
+
DETERMINISTIC SEED PASS
+
DATABASE SQL TEST BASELINE PASS
+
DATABASE LINT PASS
+
KYSELY GENERATED TYPE DRIFT PASS
+
DATABASE RUNTIME INTEGRATION BASELINE PASS
+
EXACT EVIDENCE OF REMAINING ACTOR / RLS AUTHORIZATION GAPS
```

R04 must not have to rediscover whether a fresh database can start.

## Required next specification

```text
FLOW_P01_R04_IMPLEMENTATION_SPEC.md
```

Required location:

```text
docs/07-delivery/development-phases/FLOW_P01_R04_IMPLEMENTATION_SPEC.md
```

After R03 implementation is owner-merged, if that exact file does not exist on current `main`, development must stop.

Do not infer or implement R04 from the Phase 01 boundary description alone.

---

# 23. Development Gate

The FLOW hard gate remains:

```text
NO SPEC = NO DEVELOPMENT
NO MERGE = NO NEXT ROUND
FAILED REQUIRED CI = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

## R03 legal execution sequence

```text
R03 SPEC REVIEWED + MERGED TO MAIN
        ↓
VERIFY R02 PR #20 OWNER-MERGED
        ↓
VERIFY R02 REQUIRED CHECKS
        ↓
FETCH LATEST MAIN
        ↓
VERIFY EXACT R03 SPEC = READY
        ↓
INSPECT INTERVENING COMMITS
        ↓
CREATE R03 IMPLEMENTATION BRANCH
        ↓
READ DATABASE + REPOSITORY INSTRUCTIONS
        ↓
REPRODUCE FRESH SUPABASE FAILURE
        ↓
CAPTURE ROOT SQL ERROR
        ↓
CLASSIFY TRANSIENT VS DETERMINISTIC FAILURE
        ↓
DECIDE MIGRATION-HISTORY SAFETY
        ↓
MAKE MINIMUM SAFE R03 REPAIR
        ↓
SUPABASE START
        ↓
DB RESET + SEED
        ↓
SQL TESTS
        ↓
DB LINT
        ↓
KYSELY GENERATE + DRIFT VERIFY
        ↓
DB RUNTIME INTEGRATION
        ↓
PRESERVE APPLICATION QUALITY
        ↓
SUPABASE DATABASE QUALITY PASS
        ↓
OPEN / UPDATE R03 IMPLEMENTATION PR
        ↓
STOP FOR OWNER REVIEW
        ↓
OWNER MANUAL MERGE
        ↓
P01/R03 COMPLETE
        ↓
VERIFY EXACT R04 SPEC ON MAIN
        ↓
IF MISSING → STOP
```

## Explicit prohibitions

The R03 implementation agent must not:

```text
start before R02 is merged
push directly to main
merge its own implementation PR
enable auto-merge
start R04 implementation
invent R04 scope
rewrite migration history without evidence
modify the historical no-op migration
disable RLS to force green
add BYPASSRLS for convenience
skip failing DB tests
weaken DB lint
disable generated-type drift checks
use production DB credentials
push/reset/repair a linked production DB
implement Auth.js
implement product persistence
implement payment providers
implement Voice Ordering
hide transient or deterministic failure evidence
```

## Final R03 success test

R03 succeeds only when repository/CI evidence can answer:

```text
Fresh local database boots from committed state? YES
All committed migrations apply? YES
Seed is deterministic? YES
Database tests pass? YES
Database lint passes? YES
Generated DB types match schema? YES
DB runtime integration reaches and passes baseline? YES
Supabase Database Quality is green? YES
Production database was untouched? YES
Migration history was handled safely and explicitly? YES
Application baseline remains trustworthy? YES
R04 is not started without its exact spec? YES
```

Until owner/manual merge, `PR_MERGED = NO` and R03 is not COMPLETE.
