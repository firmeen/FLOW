# FLOW P01 R03 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 03 — Fresh Database Bootstrap + Structural Database Quality Recovery

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
- Original proposal issue: `#21`
- Boundary-correction issue: `#23`
- Original specification base SHA: `a368fcdbb7ead87fed4655a0ac92314f0d963e08`
- Specification amendment base SHA: `6c332ab1b3204135576bd987427603bb4dab7b1b`
- Previous implementation PR: `#20`
- Previous implementation merge SHA: `02b804dd817cf485419801e8b9f8aa9cb939e3de`
- Previous required checks: `Phase/Round Gate`, `Next Flow Quality`
- Current inherited database evidence source: `P01/R02 PR #20` and its final `Supabase Database Quality` run
- Current planning scope: `PHASE 01 / ROUND 03 ONLY`
- Recommended implementation branch: `phase/01-round/03-fresh-database-bootstrap`
- Recommended implementation PR title: `fix(database): recover P01 R03 fresh bootstrap baseline`

---

## Execution Authority Statement

This specification is the executable authority for P01/R03 only after this corrected version is reviewed and merged to `main`.

R02 is already owner-merged. That fact does not allow R03 implementation to start from an older copy of this specification.

R03 implementation is legal only when all of the following are true on current `main`:

```text
FLOW_P01_R03_IMPLEMENTATION_SPEC.md EXISTS
+
THIS CORRECTED SPEC VERSION IS MERGED
+
STATUS = READY
+
P01/R02 IMPLEMENTATION PR #20 IS MERGED
+
P01/R02 REQUIRED CHECKS PASSED
+
LATEST MAIN HAS BEEN FETCHED AND INSPECTED
```

The implementation agent must derive authority from current repository evidence, not from authoring-time assumptions.

This revision intentionally resolves the previous ambiguity between R03 and R04:

```text
R03
=
FRESH DATABASE CREATION
+
STRUCTURAL DATABASE QUALITY
+
ACTORLESS DEFAULT-DENY BASELINE
+
DATABASE RUNTIME MECHANICS

R04
=
REAL ACTOR / USER / ROLE / MEMBERSHIP FIXTURES
+
TENANT-WIDE VS BRANCH-SCOPED MEMBERSHIP SEMANTICS
+
POSITIVE ACTOR AUTHORIZATION
+
ACTOR-AWARE NEGATIVE AUTHORIZATION
+
MINIMUM PRIVILEGE-ESCALATION HARDENING
```

R03 must not steal R04 merely to make tests green.

At the same time, R03 must not weaken, skip or hide tests. Stale tests whose assumptions predate actor-aware RLS may be corrected so that R03 proves the correct actorless/default-deny baseline; R04 then adds the positive actor-aware matrix.

---

# 1. Phase Objective

Phase 01 establishes a trusted and enforceable technical baseline before new product architecture is allowed to build on it.

R01 established deterministic development control and dependency installation.

R02 restored the application-quality baseline and made `Next Flow Quality` green.

R03 owns the next independent trust boundary:

> A completely fresh local Supabase/PostgreSQL environment must be reproducibly creatable from committed repository state, all structural database validation stages must execute, and actor-protected runtime behavior must fail closed when no real actor has been established.

R03 must make repository evidence answer all of the following:

```text
Can a clean local Supabase environment start from committed migrations?
YES

Can every committed migration apply in deterministic order?
YES

Can the deterministic synthetic seed load?
YES

Can local reset complete?
YES

Can structural SQL tests execute and pass?
YES

Can RLS remain enabled and fail closed without actor authority?
YES

Can database lint execute and pass?
YES

Can Kysely types be generated from the freshly migrated schema?
YES

Can generated type drift be verified?
YES

Can DB runtime connection, transaction, role and context mechanics execute?
YES

Can actorless runtime access to actor-protected domain data remain denied?
YES

Can connection/context state be proven not to leak across transactions?
YES

Can Supabase Database Quality become green without inventing real actor fixtures in R03?
YES

Can all of this be done without production or linked-database mutation?
YES
```

---

# 2. Phase Scope

## 2.1 R03 In Scope

R03 owns:

- reproducing the inherited fresh-Supabase failure from current authorized `main`;
- capturing the first deterministic database/migration failure rather than only an outer CLI wrapper;
- distinguishing transient Docker/container-registry noise from deterministic SQL failure;
- restoring fresh migration execution;
- fixing mechanical migration bootstrap incompatibilities that prevent schema creation;
- preserving migration-history safety and explicitly documenting whether an existing migration may be corrected or a forward migration is required;
- preserving the historical no-op migration unchanged;
- deterministic synthetic seed structural validity;
- structural pgTAP/database tests;
- correcting stale tenant-only positive RLS expectations to actorless default-deny expectations when the committed actor-aware migration has made those tests invalid;
- DB lint;
- Kysely generation from the freshly migrated database;
- generated database type drift verification;
- DB runtime connection/health mechanics;
- transaction-local `flow_runtime` role mechanics;
- transaction-local tenant/branch/actor setting mechanics;
- explicit no-actor default denial;
- cross-tenant denial that does not require positive actor authorization;
- transaction rollback and connection-context cleanup mechanics;
- concurrent transaction context isolation;
- making the existing `Supabase Database Quality` workflow pass for the R03 baseline;
- preserving the R02 application-quality baseline.

## 2.2 R03 Explicitly Out of Scope

R03 must not implement:

- Auth.js;
- OAuth;
- credentials/password verification;
- login throttling runtime;
- real identity/session mapping;
- AccessContext;
- workspace selection;
- customer capability/session/cart/order persistence;
- realtime;
- kitchen redesign;
- Omise/Opn;
- Stripe Billing;
- Voice Ordering;
- CareFlow or JobFlow product work;
- repository gitlink/submodule cleanup;
- Vercel/deployment recovery;
- branch protection/ruleset rollout;
- real users/roles/memberships solely to make positive RLS tests pass;
- final tenant-wide versus branch-membership semantics;
- positive actor access matrix;
- role-permission product authorization rollout;
- full permission-aware RLS conversion;
- role/member self-elevation hardening beyond a mechanical bootstrap necessity;
- production or linked Supabase mutation.

These actor-aware authorization responsibilities belong to P01/R04 or the later Identity/Auth.js phase as explicitly assigned there.

## 2.3 R03 / R04 Hard Boundary

The following distinction is mandatory.

### R03 proves

```text
NO ACTOR
→ NO ACTOR-PROTECTED DOMAIN ACCESS

WRONG TENANT WRITE
→ DENIED

TRANSACTION CONTEXT
→ SET LOCALLY
→ CLEARED AFTER COMMIT/ROLLBACK

DATABASE CREATION
→ DETERMINISTIC
```

### R04 proves

```text
REAL ACTIVE USER + VALID MEMBERSHIP
→ EXPECTED ACCESS

BRANCH-ONLY MEMBER
→ SAME BRANCH ALLOWED
→ OTHER BRANCH DENIED

TENANT-WIDE MEMBER
→ TENANT-SCOPED / VALID BRANCH ACCESS ACCORDING TO CONTRACT

SUSPENDED / REVOKED / WRONG-TENANT ACTOR
→ DENIED

PERMISSION HELPER
→ CORRECT

ORDINARY ACTOR SELF-ELEVATION
→ DENIED
```

If R03 reaches a failure caused by the absence of real actor fixtures or final membership semantics, do not introduce those fixtures or redesign those semantics in R03. Correct the test so that R03 asserts the actorless default-deny contract, then hand the positive actor case to R04.

---

# 3. Current Round Objective

At the end of R03 the following chain must be reproducible from committed state:

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
STRUCTURAL DATABASE SQL TESTS PASS
        ↓
ACTORLESS DEFAULT-DENY ASSERTIONS PASS
        ↓
DATABASE LINT PASS
        ↓
KYSELY TYPES GENERATE
        ↓
GENERATED TYPE DRIFT CHECK PASS
        ↓
DATABASE RUNTIME MECHANICS PASS
        ↓
SUPABASE DATABASE QUALITY PASS
```

R03 must leave R04 a green fresh database rather than forcing R04 to rediscover migration/bootstrap failures.

## Mandatory Outcome A — Verify R02 Handoff

Before any implementation edit:

- verify PR #20 is merged;
- verify actual merge SHA is `02b804dd817cf485419801e8b9f8aa9cb939e3de` or explain repository evidence if history has changed;
- verify `Phase/Round Gate` passed for R02;
- verify `Next Flow Quality` passed for R02;
- fetch latest `main`;
- compare latest `main` against both the original R03 authoring base and this corrected-spec base;
- inspect intervening commits that can change R03 assumptions.

## Mandatory Outcome B — Reproduce the Database Failure

The inherited evidence from R02 is:

```text
Supabase Database Quality
→ Install dependencies: PASS
→ Start local Supabase: FAIL
→ deterministic failure while applying
  supabase/migrations/20260816050000_phase2_foodflow_database_baseline.sql
→ statement 97
→ generic RLS tenant_isolation bootstrap block
→ later reset/test/lint/codegen/runtime stages skipped
```

Transient registry `toomanyrequests` messages were also observed while pulling images. They are infrastructure noise, not an explanation for a SQL failure that reproduces after the relevant images become available.

R03 must reproduce and classify the current failure from current `main` before changing SQL unless repository state has changed in a way that makes the previous failure impossible to reproduce; in that case the PR must explain exactly why.

## Mandatory Outcome C — Capture Root SQL/PostgreSQL Error

Do not stop at:

```text
Failed to execute statement 97
```

The implementation evidence must identify the actual failing relation/policy/expression/constraint/function and the PostgreSQL/Supabase root error.

## Mandatory Outcome D — Handle Both Known Mechanical Policy Risks

Current source inspection shows two independent mechanical bootstrap risks involving `app.organizations`:

1. `20260816050000_phase2_foodflow_database_baseline.sql` includes `app.organizations` in a generic loop whose policy expression references `tenant_id`.
2. `20260816070000_phase4_auth_rbac_tenancy.sql` also includes `app.organizations` in a generic actor-aware loop whose non-branch expression references `tenant_id`.

`app.organizations` is the tenant root and uses `id` as its tenant identity; it does not have a `tenant_id` column.

R03 must not assume fixing the first occurrence completes fresh bootstrap. It must rerun the complete migration chain and repair each distinct mechanical bootstrap incompatibility actually encountered.

The repair must preserve tenant isolation intent. Removing RLS or granting bypass privilege is not a valid fix.

## Mandatory Outcome E — Migration-History Decision

Before changing an existing migration:

- determine whether it is known to be applied to any authoritative environment;
- follow repository forward-only policy;
- do not rewrite the historical no-op migration;
- if an existing broken migration is proven unapplied and repository/owner policy permits a minimal correction, document the evidence;
- if it may already be applied, prefer a safe forward migration where possible;
- if a safe strategy cannot be established, stop for owner direction.

No production or linked database may be queried or mutated merely to manufacture this evidence unless owner-approved tooling/policy explicitly allows read-only verification; default R03 validation remains local/CI.

## Mandatory Outcome F — Correct Stale Tenant-Only Tests Without Creating R04 Fixtures

Current SQL and runtime tests predate the historical actor-aware RLS migration in important places.

Examples include expectations equivalent to:

```text
flow_runtime + tenant A + no actor
→ sees tenant A menu rows
```

That is no longer a valid positive-access baseline once actor-aware policies require active membership.

R03 may and should correct these stale assertions to the R03 contract:

```text
flow_runtime + tenant A + no actor
→ sees zero actor-protected domain rows
```

Do not solve this in R03 by creating users/roles/memberships.

Those positive authorization fixtures are R04.

## Mandatory Outcome G — Runtime Mechanics Still Execute

R03 must keep the DB runtime integration suite meaningful.

Required mechanics include:

- `checkDatabaseHealth()` works without exposing tenant data;
- effective role inside tenant transaction is `flow_runtime`;
- tenant, branch and actor settings are transaction-local;
- actor may be absent and must serialize to empty/null context safely;
- actorless access to actor-protected rows fails closed;
- cross-tenant write attempts remain denied;
- callback failure rolls back and local role/context does not leak;
- reused pooled connection does not leak context;
- concurrent transactions keep context isolated.

If an existing rollback test requires a successful actor-authorized write before throwing, it may be rewritten to test rollback/context mechanics without inventing a positive actor fixture. R04 owns the positive actor write case.

## Mandatory Outcome H — Full R03 Workflow Green

The existing `Supabase Database Quality` workflow remains canonical.

R03 must not make it green by skipping stages.

The expected final R03 chain is:

```text
Install dependencies             PASS
Start local Supabase             PASS
Reset migrations and seed        PASS
Database SQL tests               PASS
Database lint                    PASS
Generate Kysely database types   PASS
Verify generated type drift      PASS
Database runtime integration     PASS
```

## Mandatory Outcome I — Preserve R02 Application Baseline

If generated DB types, DB runtime code, tests or other application paths trigger `Next Flow Quality`, it must pass before R03 implementation can merge.

---

# 4. Preconditions

- [ ] Corrected R03 specification exists on `main`.
- [ ] Status is `READY`.
- [ ] Phase is `01`.
- [ ] Round is `03`.
- [ ] Previous is `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`.
- [ ] Next is `FLOW_P01_R04_IMPLEMENTATION_SPEC.md`.
- [ ] PR #20 is merged.
- [ ] R02 required checks passed.
- [ ] Latest `main` fetched.
- [ ] Intervening commits inspected.
- [ ] Implementation branch created from latest verified `main`.

Before changes read at minimum:

- repository `README.md`;
- `CONTRIBUTING.md`;
- `SECURITY.md`;
- `docs/07-delivery/development-phases/README.md`;
- `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`;
- final R02 implementation PR evidence;
- this complete corrected R03 specification;
- `supabase/README.md`;
- `apps/web/next-flow/AGENTS.md`;
- `apps/web/next-flow/src/server/db/README.md`;
- applicable nested instructions.

Working-tree safety:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

Do not destroy unrelated local work.

Required local/CI capabilities:

- Node.js 22;
- npm compatible with lockfile v3;
- Docker-compatible runtime;
- repository-pinned Supabase CLI;
- local test database URLs only;
- no production credentials;
- no linked production Supabase mutation.

---

# 5. Architecture Scope

| Layer | R03 impact |
|---|---|
| Customer UI | NONE |
| Staff/Kitchen/Cashier/Admin UI | NONE |
| Auth.js | NONE |
| Product domain services | NONE |
| Database bootstrap/migrations | HIGH |
| Structural RLS bootstrap | HIGH |
| Actor-aware positive authorization | DEFER R04 |
| Seed structural fixtures | MEDIUM |
| Identity fixtures | DEFER R04 |
| DB SQL tests | HIGH |
| Kysely generation | HIGH |
| DB runtime mechanics/tests | MEDIUM/HIGH |
| Deployment/gitlinks | DEFER R05 |
| Branch protection | DEFER R06 |

The architectural rule for R03 is:

```text
DATABASE MUST BE STRUCTURALLY BOOTABLE
BEFORE ACTOR AUTHORIZATION IS ACCEPTED
```

---

# 6. Existing Files and Current Behavior

| Path | Current responsibility / observed issue | R03 action |
|---|---|---|
| `supabase/README.md` | Migration policy and structural DB contract. | Preserve/align only if R03 changes documented structural truth. |
| `supabase/config.toml` | Local Supabase configuration. | Preserve unless proven defective. |
| `supabase/migrations/20260814071654_phase1_tenant_audit_baseline.sql` | Historical no-op. | DO NOT MODIFY. |
| `supabase/migrations/20260816050000_phase2_foodflow_database_baseline.sql` | Fresh bootstrap currently fails in generic RLS block. | Diagnose exact root error; make minimum history-safe repair. |
| `supabase/migrations/20260816053000_phase2_foodflow_integrity_hardening.sql` | Later integrity hardening. | Must become reachable and apply. |
| `supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql` | Historical actor/RBAC foundation; also contains generic organization-policy risk. | Mechanical bootstrap repair allowed if required; semantic membership/permission redesign deferred to R04. |
| `supabase/seed.sql` | Synthetic tenant/menu fixtures; no actor fixtures. | Preserve actor-free seed in R03 unless structural schema compatibility requires narrow change. |
| `supabase/tests/database/phase2_database_baseline.test.sql` | Structural tests plus stale tenant-only positive RLS assumption. | Preserve structural tests; change stale positive tenant-only expectation to actorless default-deny contract. |
| `apps/web/next-flow/tests/integration/database-runtime.test.ts` | Runtime mechanics plus stale actorless positive access and fake actor ID usage. | Keep mechanics; remove stale R03 positive actor expectations; real actor positive tests belong R04. |
| `apps/web/next-flow/src/server/db/generated/database.ts` | Generated DB types; currently may be stale until fresh codegen runs. | Regenerate from restored local DB and commit legitimate drift only. |
| `.github/workflows/supabase-db-quality.yml` | Canonical DB quality chain. | Must remain full-strength and end PASS. |
| `.github/workflows/next-flow-quality.yml` | Canonical application quality. | Preserve green R02 baseline. |

---

# 7. Files to CREATE

No new file is mandatory before diagnosis.

Permitted only if evidence requires:

- a narrow forward corrective migration when history safety requires forward-only repair;
- a focused structural regression test for the corrected bootstrap invariant;
- a diagnostic helper that exposes root DB failure without weakening the normal workflow.

Do not create:

- identity fixture systems;
- alternate migration directories;
- alternate seeds;
- shadow database schemas;
- duplicate generated-type ownership.

---

# 8. Files to MODIFY

Likely evidence-driven candidates:

- failing migration(s), subject to history decision;
- structural DB test expectations that predate actor-aware RLS;
- DB runtime integration tests to reflect actorless default-deny mechanics;
- generated Kysely types through codegen;
- seed only if structural compatibility requires it;
- DB workflow only if the workflow itself is proven defective, not to hide repository failure.

Must not:

- hand-edit generated types;
- delete failing tests;
- weaken RLS globally;
- add `BYPASSRLS`;
- add `continue-on-error` to required DB stages;
- suppress DB lint;
- skip migrations;
- create real actor membership fixtures in R03 solely for positive access;
- use production data.

---

# 9. Files to MOVE

No move expected.

Migration filenames/versions are historical identity and must not be casually renamed.

---

# 10. Files to REMOVE

No removal expected.

Do not remove:

- historical migrations;
- RLS policies merely to make startup pass;
- SQL tests;
- DB runtime tests;
- generated-type verification;
- quality workflows.

---

# 11. Database Changes

## Migration execution

Primary R03 responsibility.

All committed migrations must apply from an empty local database.

## Mechanical RLS bootstrap corrections

Allowed where a generic policy generator references a column that a target table does not have or otherwise cannot create the schema.

The fix must preserve tenant isolation.

For tenant-root tables such as `app.organizations`, tenant identity may need a table-specific policy expression based on `id` rather than pretending a `tenant_id` column exists.

Do not use this mechanical correction as permission to define final R04 membership semantics.

## Seed

R03 seed remains deterministic and synthetic.

It may remain actor-free.

No real credential, password hash, raw customer capability, provider token or customer data may be introduced.

## Generated types

Run repository generation tooling against the fresh migrated database.

Generated file changes must correspond to real schema truth.

## Production database

```text
PRODUCTION_DB_MODIFIED: NO
REMOTE_DB_PUSHED: NO
LINKED_DB_RESET: NO
MIGRATION_REPAIR_AGAINST_PRODUCTION: NO
```

---

# 12. Backend Changes

No product backend feature work.

Permitted application-side changes are limited to:

- generated DB type synchronization;
- DB runtime/test mechanical compatibility needed to prove R03 context behavior.

No repository/domain persistence cutover.

---

# 13. Frontend Changes

None.

---

# 14. Authentication and Authorization

Application authentication remains unchanged.

No Auth.js implementation.

R03 authorization contract is intentionally narrow:

```text
NO VERIFIED ACTOR
→ FAIL CLOSED
```

R03 must not claim that positive actor authorization, membership/branch semantics or permission enforcement are correct. That claim requires R04 evidence.

---

# 15. Security Requirements

- no production DB credentials;
- no linked production reset/push/repair;
- no migration-history rewrite without explicit evidence;
- historical no-op migration untouched;
- preserve RLS and tenant isolation;
- no `BYPASSRLS` shortcut;
- no secret in migration/seed/test/PR/log;
- no real customer data;
- generated types from tooling only;
- redact connection secrets from evidence;
- distinguish transient registry failure from deterministic SQL failure;
- retries may mitigate registry noise but may not hide deterministic SQL failure;
- actorless default-deny must remain explicit;
- no synthetic actor credentials in R03.

---

# 16. Failure and Recovery Paths

| Failure | R03 response |
|---|---|
| Corrected spec not merged | STOP. |
| R02 not merged / required check failed | STOP and return to R02. |
| Latest main advanced | Inspect intervening commits; branch from latest main. |
| Registry rate limit before SQL begins | Classify transient; bounded retry allowed. |
| SQL failure reproduces after images available | Deterministic R03 blocker; capture root error. |
| Baseline migration generic organization policy fails | Repair mechanically while preserving tenant isolation and history policy. |
| Later historical actor migration generic organization policy fails | R03 owns mechanical bootstrap repair; do not redesign membership semantics. |
| Candidate migration already applied externally | Do not rewrite blindly; safe forward strategy or owner decision. |
| Migration history cannot be established | STOP rather than guess. |
| Seed fails structurally | R03 fixes structural seed compatibility only. |
| SQL test expects tenant-only positive access with no actor | Replace with actorless default-deny expectation; positive actor test goes R04. |
| Runtime test expects menu rows with no actor | Replace with actorless denial/mechanics assertion; positive actor test goes R04. |
| Runtime rollback test requires authorized write | Rewrite to prove rollback/context cleanup without positive actor fixture; R04 adds authorized write coverage. |
| Kysely broad unexpected drift | Investigate schema/generator; do not commit blindly. |
| DB lint fails | Fix real R03 structural issue; do not suppress lint. |
| Next Flow Quality regresses due R03 change | R03 cannot merge until restored. |
| Actor-aware semantic defect remains | Record exact handoff for R04. |
| Gitlink/deployment issue remains | Record for R05; do not steal scope. |

---

# 17. Dependencies

## Internal

- merged R02 implementation;
- corrected R03 spec;
- `supabase/README.md`;
- committed migrations;
- seed;
- SQL tests;
- Kysely generation scripts/types;
- DB runtime integration tests;
- `Supabase Database Quality`;
- `Next Flow Quality`;
- Phase/Round Gate.

## External execution

- GitHub Actions;
- Docker-compatible runtime;
- repository-pinned Supabase CLI;
- PostgreSQL image/config selected by project config;
- Node.js 22;
- npm.

No live application/provider secret is required.

---

# 18. Tests

## Fresh bootstrap

- [ ] local Supabase starts;
- [ ] all migrations apply in order;
- [ ] no migration silently skipped;
- [ ] deterministic seed loads;
- [ ] local DB reset succeeds.

## Structural SQL

- [ ] schemas/tables/constraints/indexes baseline remains valid;
- [ ] RLS remains enabled/forced where expected;
- [ ] negative money/currency/integrity constraints pass;
- [ ] order/session/idempotency structural constraints pass;
- [ ] actorless runtime role sees zero actor-protected rows;
- [ ] cross-tenant write denial remains protected;
- [ ] no stale tenant-only positive assertion remains in R03.

## DB lint

- [ ] configured schemas lint;
- [ ] configured fail-on-error contract passes.

## Generated types

- [ ] codegen runs;
- [ ] output reflects fresh schema;
- [ ] expected diff committed if legitimate;
- [ ] subsequent drift verification passes.

## Runtime mechanics

- [ ] health query works;
- [ ] effective runtime role is `flow_runtime` inside transaction;
- [ ] tenant context is local;
- [ ] branch context is local;
- [ ] actor context can be absent safely;
- [ ] no actor => actor-protected domain rows denied;
- [ ] cross-tenant write denied;
- [ ] rollback clears local role/context;
- [ ] reused connection does not leak context;
- [ ] concurrent contexts remain isolated.

## Deferred positive actor tests

The following are deliberately NOT R03 tests:

- active actor sees same-tenant row;
- branch-only actor sees same branch;
- branch-only actor denied other same-tenant branch;
- tenant-wide actor behavior;
- suspended actor denial;
- revoked membership denial;
- permission helper allow/deny;
- ordinary actor self-role elevation denial.

Those are mandatory R04 coverage.

---

# 19. Validation Commands

Repository/base evidence:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

Toolchain from `apps/web/next-flow`:

```bash
node --version
npm --version
npm ci
```

Local Supabase from repository root using repository-pinned CLI:

```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

Use `--debug` or another safe local diagnostic mode when needed to capture the root migration error.

Generated types from `apps/web/next-flow`:

```bash
npm run db:generate
git diff --exit-code -- src/server/db/generated/database.ts
```

DB runtime:

```bash
npm run test:db-runtime
```

Application preservation when affected:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```

Result vocabulary:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

Never fabricate command outcomes.

---

# 20. PR Requirements

R03 implementation PR metadata:

```text
Specification: FLOW_P01_R03_IMPLEMENTATION_SPEC.md
Phase: 01
Round: 03
Previous: FLOW_P01_R02_IMPLEMENTATION_SPEC.md
Previous PR: #20
Related Issue: #21 / #23 as applicable
Next Specification: FLOW_P01_R04_IMPLEMENTATION_SPEC.md
```

Required SHA evidence:

```text
ORIGINAL_SPEC_BASE_SHA: a368fcdbb7ead87fed4655a0ac92314f0d963e08
CORRECTED_SPEC_BASE_SHA: 6c332ab1b3204135576bd987427603bb4dab7b1b
R02_MERGE_SHA: 02b804dd817cf485419801e8b9f8aa9cb939e3de
IMPLEMENTATION_BASE_SHA: <latest main used for branch>
IMPLEMENTATION_HEAD_SHA: <final branch head>
```

Required database evidence:

```text
SUPABASE_START_BEFORE:
FIRST_DETERMINISTIC_DB_BLOCKER_BEFORE:
ROOT_DB_ERROR:
TRANSIENT_INFRA_NOISE:
MIGRATION_HISTORY_DECISION:
MECHANICAL_BASELINE_POLICY_FIX:
MECHANICAL_ACTOR_MIGRATION_POLICY_FIX:
MIGRATION_FILES_CHANGED:
SEED_CHANGED:
SQL_TEST_EXPECTATIONS_CHANGED:
DATABASE_SCHEMA_CHANGED:
RLS_CHANGED:
GENERATED_DB_TYPES_CHANGED:
SUPABASE_START_AFTER:
DB_RESET_LOCAL:
DB_SQL_TESTS:
DB_LINT:
DB_GENERATE:
DB_TYPE_DRIFT:
DB_RUNTIME_INTEGRATION:
SUPABASE_DB_QUALITY:
```

Required R03/R04 boundary evidence:

```text
REAL_ACTOR_FIXTURES_ADDED: NO
POSITIVE_ACTOR_AUTHORIZATION_IMPLEMENTED: NO
FINAL_BRANCH_MEMBERSHIP_SEMANTICS_IMPLEMENTED: NO
FULL_PERMISSION_RLS_IMPLEMENTED: NO
ACTORLESS_DEFAULT_DENY_PROVEN: YES
R04_HANDOFF_GAPS: <exact list>
```

Required production declarations:

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

Required checks for R03 implementation merge:

```text
Phase/Round Gate = PASS
Supabase Database Quality = PASS
Next Flow Quality = PASS if triggered
Dependency Integrity = PASS only if package files change
```

No auto-merge. Owner/manual merge only.

---

# 21. Definition of Done

R03 is done only when all applicable items are backed by actual repository/CI evidence.

## Authorization/base

- [ ] corrected spec merged before implementation;
- [ ] R02 merged and required checks green;
- [ ] latest main inspected;
- [ ] implementation branch from latest main.

## Diagnosis/history

- [ ] inherited failure reproduced or repository change explains why not;
- [ ] transient registry noise distinguished from SQL failure;
- [ ] actual root DB error captured;
- [ ] migration-history decision explicit;
- [ ] historical no-op migration untouched.

## Fresh database

- [ ] local Supabase starts;
- [ ] every migration applies;
- [ ] deterministic seed loads;
- [ ] local reset succeeds.

## R03 structural security

- [ ] organization/tenant-root policy bootstrap is structurally valid;
- [ ] RLS is not disabled to force green;
- [ ] no bypass privilege added;
- [ ] no actor results in default denial on actor-protected domain rows;
- [ ] cross-tenant write remains denied.

## Database quality

- [ ] SQL tests pass;
- [ ] DB lint passes;
- [ ] Kysely generation succeeds;
- [ ] generated drift check passes;
- [ ] DB runtime mechanics pass;
- [ ] `Supabase Database Quality` passes.

## R03/R04 discipline

- [ ] no real actor/user/role/membership fixture matrix added for positive authorization;
- [ ] no final branch-membership semantic redesign;
- [ ] no full permission-aware RLS rollout;
- [ ] stale tenant-only positive tests corrected to default-deny where necessary;
- [ ] exact remaining actor-aware gaps handed to R04.

## Application preservation

- [ ] R02 application baseline not regressed;
- [ ] Next Flow Quality passes if triggered;
- [ ] build remains independent of production DB secret.

## Product scope discipline

- [ ] no Auth.js;
- [ ] no persistence cutover;
- [ ] no realtime;
- [ ] no kitchen redesign;
- [ ] no payment provider work;
- [ ] no voice work;
- [ ] no R05/R06 work.

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

R04 must inherit:

```text
GREEN APPLICATION BASELINE
+
FRESH LOCAL SUPABASE BOOTSTRAP PASS
+
ALL MIGRATIONS APPLY
+
DETERMINISTIC STRUCTURAL SEED PASS
+
STRUCTURAL SQL TESTS PASS
+
ACTORLESS DEFAULT-DENY PASS
+
DB LINT PASS
+
KYSELY TYPE DRIFT PASS
+
DB RUNTIME MECHANICS PASS
+
SUPABASE DATABASE QUALITY PASS
+
NO REAL ACTOR AUTHORIZATION CLAIM YET
```

Required next specification:

```text
FLOW_P01_R04_IMPLEMENTATION_SPEC.md
```

If the exact R04 spec is absent from current `main` after R03 implementation is owner-merged, stop.

If the R04 spec exists but R03 implementation is not owner-merged or required checks failed, stop.

---

# 23. Development Gate

The hard gate remains:

```text
NO SPEC = NO DEVELOPMENT
NO MERGE = NO NEXT ROUND
FAILED REQUIRED CI = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

Legal R03 execution sequence:

```text
CORRECTED R03 SPEC MERGED TO MAIN
        ↓
VERIFY R02 MERGE + REQUIRED CHECKS
        ↓
FETCH LATEST MAIN
        ↓
CREATE R03 IMPLEMENTATION BRANCH
        ↓
REPRODUCE CURRENT FRESH-SUPABASE FAILURE
        ↓
CAPTURE ROOT SQL ERROR
        ↓
CLASSIFY TRANSIENT VS DETERMINISTIC FAILURE
        ↓
DECIDE MIGRATION-HISTORY SAFETY
        ↓
REPAIR FIRST MECHANICAL BOOTSTRAP BLOCKER
        ↓
RERUN COMPLETE MIGRATION CHAIN
        ↓
REPAIR ANY LATER DISTINCT MECHANICAL BOOTSTRAP BLOCKER
        ↓
RESET + STRUCTURAL SEED
        ↓
STRUCTURAL SQL TESTS
        ↓
CORRECT STALE TENANT-ONLY POSITIVE TESTS TO ACTORLESS DEFAULT-DENY
        ↓
DB LINT
        ↓
KYSELY GENERATE + DRIFT
        ↓
DB RUNTIME CONNECTION/ROLE/CONTEXT/DEFAULT-DENY MECHANICS
        ↓
SUPABASE DATABASE QUALITY PASS
        ↓
PRESERVE NEXT FLOW QUALITY
        ↓
OPEN R03 IMPLEMENTATION PR
        ↓
STOP FOR OWNER REVIEW
        ↓
OWNER MANUAL MERGE
        ↓
P01/R03 COMPLETE
        ↓
VERIFY R04 SPEC
        ↓
IF R04 SPEC MISSING OR REQUIRED R03 CHECK FAILED → STOP
```

Explicit prohibitions:

```text
NO DIRECT MAIN PUSH
NO AUTO-MERGE
NO R04 IMPLEMENTATION IN R03
NO PRODUCTION DB MUTATION
NO MIGRATION HISTORY GUESSING
NO RLS DISABLE/BYPASS SHORTCUT
NO TEST SKIPPING TO FORCE GREEN
NO REAL ACTOR FIXTURE MATRIX IN R03
NO AUTH.JS
NO PRODUCT PERSISTENCE
NO PAYMENT OR VOICE WORK
```

Final R03 success test:

```text
Fresh local DB boots? YES
All migrations apply? YES
Seed structurally deterministic? YES
Structural SQL tests pass? YES
Actorless access fails closed? YES
DB lint passes? YES
Generated DB types match fresh schema? YES
DB runtime mechanics pass? YES
Supabase Database Quality green? YES
Production DB untouched? YES
Positive actor semantics deferred cleanly to R04? YES
```
