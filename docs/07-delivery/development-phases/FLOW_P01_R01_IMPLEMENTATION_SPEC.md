# FLOW P01 R01 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 01 — Delivery Gate Bootstrap + Deterministic Dependency Integrity

---

## Metadata

- Phase: `01`
- Round: `01`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Target branch: `main`
- Previous: `NONE`
- Next: `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-17 12:00 Asia/Bangkok`
- Owner approval required: `YES`
- Automatic merge allowed: `NO`
- Proposal issue: `#14`
- Specification base SHA: `744bcc05190e72a15859d50e16f2a28a2e723c85`
- Execution baseline reset: `YES`
- Existing implementation handling: `PRESERVE AS TECHNICAL STARTING STATE`
- Previous execution numbering: `HISTORICAL CONTEXT ONLY`
- Current planning scope: `PHASE 01 ONLY`
- Rounds in Phase 01: `6`
- Normal Phase 01 round slots: `04:00`, `12:00`, `20:00` Asia/Bangkok
- Recommended implementation branch: `phase/01-round/01-delivery-gate`
- Recommended implementation PR title: `chore(delivery): enforce P01 R01 specification and dependency gate`

---

## Execution Baseline Statement

This file is the first executable implementation specification under the reset FLOW development operating model.

The repository is **not** starting from empty code. All code, migrations, tests, documentation, configuration, workflows, and historical implementation already merged into `main` are the technical starting state.

The reset applies to development progression and execution authority, not to repository history.

The implementation agent must therefore treat:

```text
CURRENT MAIN
=
TECHNICAL STARTING STATE
```

and must not treat historical phase numbering as permission to continue an old implementation sequence.

The new development sequence begins only from:

```text
FLOW_P01_R01_IMPLEMENTATION_SPEC.md
```

and only after this specification itself has been merged into `main`.

The governing progression remains:

```text
SPECIFICATION
→ OWNER REVIEW
→ SPEC MERGED TO MAIN
→ IMPLEMENTATION BRANCH FROM LATEST MAIN
→ IMPLEMENT EXACT ROUND
→ TEST / CI
→ IMPLEMENTATION PR
→ OWNER REVIEW
→ MANUAL MERGE
→ CHECK EXACT NEXT SPEC ON MAIN
→ OTHERWISE STOP
```

---

# 1. Phase Objective

Phase 01 must establish a trustworthy, deterministic, enforceable development baseline before FLOW continues with product-level implementation.

The complete six-round phase must convert the repository from a state where development rules are documented but only partially enforced into a state where repository evidence can answer, with confidence:

- what exact implementation round is authorized;
- which specification authorizes it;
- whether dependency installation is deterministic;
- whether application quality checks are trustworthy;
- whether database bootstrap and database tests are trustworthy;
- whether CI failures represent real code/configuration failures instead of hidden workflow ambiguity;
- whether `main` can be merged into only through the intended review and status-check path;
- whether the next round is allowed to start.

The Phase 01 target outcome is:

```text
TRUSTED REPOSITORY BASELINE
+
DETERMINISTIC DEPENDENCY INSTALLATION
+
MACHINE-CHECKABLE PHASE/ROUND AUTHORIZATION
+
TRACEABLE IMPLEMENTATION PULL REQUESTS
+
RECOVERED APPLICATION QUALITY BASELINE
+
RECOVERED DATABASE QUALITY BASELINE
+
STABLE REQUIRED-CHECK CONTRACT
+
OWNER-CONTROLLED MAIN MERGE PATH
```

Phase 01 is a development-control and baseline-recovery phase.

It is **not** a product expansion phase.

Phase 01 must not be considered complete merely because a specification exists, a workflow file exists, or a single CI job turns green. The phase is complete only after all six rounds are merged and the repository baseline is demonstrably trustworthy.

## Phase 01 round boundary

The intended Phase 01 decomposition is:

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

These descriptions define Phase 01 boundaries only.

They do **not** authorize implementation of R02–R06 during R01.

---

# 2. Phase Scope

## In scope for Phase 01 as a whole

### Development governance

- Make Phase/Round specifications the executable source of truth for implementation authorization.
- Make implementation PRs identify one exact specification.
- Make specification references machine-checkable.
- Preserve deterministic `Previous` and `Next` continuation markers.
- Prevent an implementation branch from granting itself permission by creating its own READY specification.
- Establish stable CI check context names suitable for branch protection/rulesets.
- Preserve owner/manual merge as the final decision boundary.

### Dependency integrity

- Synchronize npm manifest and lockfile state.
- Establish a reproducible clean `npm ci` baseline.
- Prevent uncontrolled dependency churn from being hidden inside recovery work.
- Keep Node/npm assumptions aligned with repository CI.

### Application baseline recovery

Within later Phase 01 rounds:

- lint;
- typecheck;
- unit tests;
- integration tests;
- Next.js build;
- application-quality workflow stability.

### Database baseline recovery

Within later Phase 01 rounds:

- fresh Supabase bootstrap;
- migrations;
- seed;
- SQL tests;
- database lint;
- Kysely code generation;
- generated-type drift verification;
- runtime database integration tests.

### Database authorization test recovery

Within later Phase 01 rounds:

- real user fixtures;
- role fixtures;
- membership fixtures;
- tenant and branch fixtures;
- actor-aware RLS tests;
- negative cross-tenant and wrong-branch tests;
- runtime actor-context correctness.

### Repository / CI / deployment baseline

Within later Phase 01 rounds:

- CI retry classification;
- unnecessary local Supabase service boot surface;
- gitlink/submodule ambiguity;
- current deployment failure diagnosis;
- final required-check contract;
- verification of enforceable `main` protection.

## Out of scope for Phase 01

The following are explicitly outside Phase 01 unless a minimal compatibility repair is directly required to restore the development baseline:

- Auth.js runtime cutover;
- OAuth provider integration;
- Credentials-provider production migration;
- final RBAC implementation;
- customer QR capability;
- table-session persistence;
- cart persistence;
- order persistence;
- realtime customer/staff synchronization;
- persistent service-request product behavior;
- kitchen multi-station routing;
- Omise / Opn merchant payments;
- Stripe SaaS billing;
- entitlement product behavior;
- CustomerShell redesign;
- compact customer cart redesign;
- MediaRecorder;
- Speaches;
- faster-whisper;
- menu voice resolver;
- Voice Ordering UX;
- CareFlow implementation;
- JobFlow implementation;
- silent rewriting or erasing of historical merged work.

## R01-specific scope boundary

P01/R01 owns only:

1. deterministic dependency installation;
2. machine-checkable Phase/Round authorization;
3. Phase/Round-aware PR metadata;
4. a narrow dependency-integrity check;
5. documentation of the required-check rollout and remaining inherited blockers.

R01 does not own broad application, database, deployment, authentication, or product repair.

---

# 3. This Round Objective

P01/R01 must establish the minimum enforceable development-control system required before the reset FLOW execution model can safely continue.

At the end of the round, the repository must be able to demonstrate all of the following:

```text
PACKAGE MANIFEST AND LOCKFILE ARE CONSISTENT
+
CLEAN NPM CI SUCCEEDS
+
IMPLEMENTATION PR NAMES ONE EXACT EXECUTABLE SPEC
+
GITHUB CAN MACHINE-CHECK THAT SPEC
+
IMPLEMENTATION CANNOT SELF-AUTHORIZE WITH A HEAD-ONLY SPEC
+
DRAFT / BLOCKED / COMPLETE SPECS CANNOT AUTHORIZE NEW IMPLEMENTATION
+
SPECIFICATION-ONLY PR BOOTSTRAP REMAINS POSSIBLE
+
MIXED NEW-SPEC + SAME-SCOPE IMPLEMENTATION IS REJECTED
+
PR TEMPLATE RECORDS PHASE / ROUND / VALIDATION / DEFERRED SCOPE
+
DEPENDENCY INTEGRITY HAS ITS OWN STABLE CHECK
+
BROADER EXISTING FAILURES REMAIN VISIBLE
+
OWNER RETAINS MANUAL MERGE CONTROL
```

## Mandatory R01 outcomes

### Outcome A — exact starting-state verification

Before editing, the implementation agent must:

- fetch latest `main`;
- record current `main` SHA;
- compare it with the specification base SHA;
- inspect any intervening commits if `main` advanced;
- branch from latest `main`, not from stale specification history.

The PR must record separately:

```text
SPEC_BASE_SHA
IMPLEMENTATION_BASE_SHA
```

### Outcome B — dependency integrity restored

`apps/web/next-flow/package.json` and `package-lock.json` must represent the same committed dependency intent.

A clean:

```bash
npm ci
```

must succeed from committed repository state.

### Outcome C — executable specification gate

An implementation PR targeting `main` must reference one exact executable specification already present on the PR base branch.

### Outcome D — bootstrap exception without bypass

A documentation/specification PR must be able to introduce a future spec before that file exists on `main`.

However that exception must not allow application, database, workflow implementation, dependency, infrastructure, or product code to ride inside the same PR as an unmerged future specification.

### Outcome E — PR traceability

The repository PR template must make Phase/Round implementation review structured and explicit.

### Outcome F — narrow dependency check

A dedicated dependency-integrity workflow/check must prove only clean installation, not falsely imply full application or database quality.

### Outcome G — truthful inherited-failure reporting

Once dependency installation succeeds, broader current checks may expose existing failures.

Those failures must be recorded, classified, and handed to the correct later Phase 01 round.

They must not be disabled, skipped, renamed misleadingly, or opportunistically repaired beyond R01 scope.

### Outcome H — stop after implementation PR

The implementation agent must open/update the P01/R01 implementation PR, achieve all R01-required checks, and stop for owner review.

No automatic merge.

No R02 implementation.

---

# 4. Preconditions

## Specification gate preconditions

- [ ] This exact file exists on `main` before R01 implementation begins.
- [ ] `Status` is `READY`.
- [ ] `Phase` is `01`.
- [ ] `Round` is `01`.
- [ ] `Previous` is `NONE`.
- [ ] `Next` is `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`.
- [ ] The specification has been reviewed/merged separately from implementation.

If this file does not exist on `main`, stop immediately.

## Repository-state preconditions

- [ ] Fetch latest `main`.
- [ ] Record latest `main` SHA.
- [ ] Compare latest `main` with `744bcc05190e72a15859d50e16f2a28a2e723c85`.
- [ ] Inspect all intervening commits if the SHA differs.
- [ ] Confirm no intervening change invalidates R01 scope.
- [ ] Create implementation branch from the latest verified `main`.
- [ ] Do not push directly to `main`.

## Instruction preconditions

Before code/config changes:

- [ ] Read repository `README.md`.
- [ ] Read `CONTRIBUTING.md`.
- [ ] Read `SECURITY.md` if present.
- [ ] Read `docs/07-delivery/development-phases/README.md`.
- [ ] Read `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`.
- [ ] Read this full specification.
- [ ] Read `apps/web/next-flow/AGENTS.md`.
- [ ] Read any nested AGENTS/instruction file applying to a modified path.

If any Next.js source must be modified, which should normally not be necessary in R01:

- [ ] install dependencies first;
- [ ] read relevant local Next.js 16.3.0 documentation under `apps/web/next-flow/node_modules/next/dist/docs/` before writing code.

## Working-tree safety preconditions

Before modifying a local checkout:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

If unrelated user changes exist, preserve them.

Do not automatically run destructive commands such as:

```bash
git reset --hard
git clean -fd
git restore .
```

Use an isolated branch/worktree when necessary.

## Environment preconditions

- No production secret is required.
- No production database access is required.
- No payment-provider credential is required.
- GitHub Actions and Node/npm are the only external execution dependencies intentionally involved in R01.

---

# 5. Architecture Scope

## Frontend

Impact: `NONE`.

Requirements:

- No customer route changes.
- No staff UI changes.
- No kitchen UI changes.
- No cashier UI changes.
- No management UI changes.
- No design-system or responsive changes.
- No customer copy changes.

## Backend

Impact: `NONE` for business/runtime behavior.

Requirements:

- No domain-service implementation.
- No server action.
- No product route handler.
- No persistence command/query layer.
- No Auth.js runtime configuration.

## Database

Impact: `NONE`.

Requirements:

- No schema migration.
- No data migration.
- No seed change.
- No RLS change.
- No DB role/grant change.
- No production database mutation.

## Authentication / Authorization

Application runtime impact: `NONE`.

The only authorization work in R01 is GitHub workflow least privilege and executable-spec authority.

Do not implement:

- Auth.js;
- AccessContext;
- workspace selection;
- permission guards;
- credential migration;
- route RBAC.

## API / Integrations

Product API impact: `NONE`.

Intentional integration surface:

- GitHub Actions;
- GitHub pull-request event metadata;
- base-branch repository contents.

## Payment

Impact: `NONE`.

No Stripe or Omise work.

## Notifications

Impact: `NONE`.

## Audit / Observability

Product observability impact: `NONE`.

CI/governance observability requirements:

- validation output names the exact specification being checked;
- failures are actionable;
- workflow output does not leak secrets;
- inherited failures remain visible.

## Infrastructure / CI

Impact: `HIGH`.

R01 intentionally changes:

- GitHub workflow configuration for Phase/Round authorization;
- dependency-integrity workflow configuration;
- PR template;
- repository-local validator/tests;
- package lockfile.

R01 must not weaken existing broad application/database workflows.

---

# 6. Existing Files and Current Behavior

| Path | Current responsibility / evidence | Required R01 action |
|---|---|---|
| `docs/07-delivery/development-phases/README.md` | Defines naming, six-round cadence, source-of-truth path, and hard development gates. | Preserve governing semantics. Clarify only if machine validation requires an explicit unambiguous rule. |
| `docs/07-delivery/development-phases/FLOW_PHASE_ROUND_SPEC_TEMPLATE.md` | Defines the required executable-spec structure and metadata fields. | Preserve all required sections and continuation semantics. Modify only if parser ambiguity cannot otherwise be resolved safely. |
| `docs/07-delivery/development-phases/FLOW_P01_R01_IMPLEMENTATION_SPEC.md` | Authorizes this exact round once merged to `main`. | Treat as read-only implementation authority. Any scope correction requires a separate specification change reviewed by owner. |
| `CONTRIBUTING.md` | Requires focused branch and PR before `main` merge. | Follow. Do not weaken. |
| `.github/CODEOWNERS` | Assigns repository ownership to `@firmeen`. | Preserve. Owner remains human merge authority. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Generic Summary / Related issue / Validation template. | Expand into Phase/Round-aware implementation traceability contract. |
| `.github/workflows/next-flow-quality.yml` | Runs install, lint, typecheck, test and Next build for application changes. | Preserve all checks. Do not make green by removing or skipping steps. |
| `.github/workflows/supabase-db-quality.yml` | Runs database-oriented local Supabase quality/runtime checks for relevant paths. | Preserve visibility. Broad recovery is not R01 scope. |
| `apps/web/next-flow/package.json` | Application manifest. Declares current application dependency intent, including `next-auth`. | Prefer no semantic change. Preserve declared versions unless an actual compatibility defect is demonstrated. |
| `apps/web/next-flow/package-lock.json` | npm lockfile. Current root metadata is inconsistent with committed manifest. | Regenerate/synchronize deterministically using npm tooling. |
| `apps/web/next-flow/AGENTS.md` | Requires relevant local Next.js documentation to be read before Next.js code changes. | Follow. No content change expected. |
| `main` branch settings | Historically unprotected with required checks not enforced. | R01 must establish stable check-name contract and record exact owner action. Do not falsely claim protection is complete. |

## Current dependency inconsistency to repair

The current manifest includes dependency intent such as:

```text
@auth/core = 0.41.3
next-auth = 5.0.0-beta.32
```

while the current lockfile root package metadata does not exactly represent that manifest state.

At minimum, the implementation must verify and correct:

- missing root `next-auth` declaration in lock metadata;
- root `@auth/core` spec mismatch;
- resulting transitive lock graph consistency.

The solution must come from npm lockfile generation, not hand editing.

---

# 7. Files to CREATE

Exact internal locations may change only when an existing repository convention provides a stronger reason. The responsibilities below are mandatory.

| Recommended path | Responsibility | Required contents |
|---|---|---|
| `.github/workflows/phase-round-gate.yml` | Stable machine-checkable authorization gate for PRs targeting `main`. | PR trigger, least-privilege permissions, deterministic validator invocation, stable job/check context, actionable failure output, safe specification-bootstrap handling. |
| `.github/workflows/dependency-integrity.yml` | Narrow clean-install check suitable as an early required-check candidate. | Checkout, Node 22, npm cache, `npm ci` in `apps/web/next-flow`, narrow path triggers, no false full-quality claims. |
| `scripts/validate-phase-round-spec.mjs` or equivalent single canonical repository-local path | Core validator. | Parse canonical PR metadata, classify PR, validate spec filename/path/base existence/status/phase/round/target/continuity essentials, deterministic exit codes/messages, safe path handling. |
| validator test/fixture files as needed | Demonstrate positive and negative authorization paths. | Valid implementation, malformed name, invalid round, non-READY status, base-missing/head-only spec, valid spec bootstrap, mixed bootstrap+implementation rejection, traversal rejection. |

## Single-source validator rule

Do not duplicate substantive validation logic between YAML and JavaScript.

The workflow should orchestrate.

The validator should implement rules.

If `.github/scripts/` is selected instead of root `scripts/`, document the ownership reason in the PR.

---

# 8. Files to MODIFY

## `apps/web/next-flow/package-lock.json`

Required change:

- synchronize root package metadata with `package.json`;
- include the declared `next-auth@5.0.0-beta.32` dependency graph;
- preserve deterministic integrity/resolved metadata generated by npm;
- investigate unexpected broad churn before commit.

Must not:

- manually paste package records;
- manually fabricate integrity values;
- mass-upgrade unrelated dependencies merely to make installation work.

## `.github/PULL_REQUEST_TEMPLATE.md`

Required minimum information contract:

```text
Specification
Phase
Round
Previous Round
Previous PR
Related Issue
Summary
Implemented Scope
Explicitly Out of Scope
Changed Areas
Validation Results
Database / Migration Impact
Environment / Configuration Impact
Security Impact
Failure / Recovery Validation
Known Limitations
Deferred Scope
Next Specification
Owner Review
Auto-merge: NO
```

Recommended machine-readable metadata block:

```text
Specification: FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md
Phase: XX
Round: XX
Previous: FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md | NONE
```

The validator should rely on canonical fields, not free-form prose.

## `docs/07-delivery/development-phases/README.md`

Modification is optional and only allowed if needed to remove governance ambiguity discovered during implementation.

If changed:

- do not change six-round semantics;
- do not weaken `NO SPEC = NO DEVELOPMENT`;
- document machine-checkable PR metadata and bootstrap behavior precisely.

## `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`

Modification is optional.

Only change if deterministic validation requires an explicit field that cannot be safely parsed from the current template.

Do not remove any required section.

## `apps/web/next-flow/package.json`

Default action: `NO CHANGE`.

A manifest change is allowed only if lock repair proves the committed manifest itself is invalid or incompatible with the selected npm/Node toolchain.

Any manifest change must be separately explained in the PR.

---

# 9. Files to MOVE

No file move is required.

Do not create temporary duplicate validator implementations and then leave ambiguous ownership.

Choose one final location before merge.

---

# 10. Files to REMOVE

No file removal is required.

Specifically do **not** remove merely to achieve a green R01:

- `next-auth`;
- `@auth/core`;
- `jose`;
- existing quality workflows;
- existing DB workflows;
- existing migrations;
- existing database tests;
- current legacy authentication source;
- current product tests.

Default R01 principle:

```text
PRESERVE DECLARED INTENT
+
REPAIR DETERMINISM
```

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

## Functions / triggers

None.

## Roles / grants

None.

## RLS / tenant isolation

No policy change.

Do not weaken RLS to make any inherited database check pass.

## Migrations / backfill

None.

Do not rewrite historical migrations in R01.

## Seed

None.

## Production / remote database

No remote database connection is necessary.

No production database may be modified.

Required implementation PR declaration:

```text
PRODUCTION_DB_MODIFIED: NO
DATABASE_SCHEMA_CHANGED: NO
```

---

# 12. Backend Changes

## Services / domain logic

None.

No business domain behavior is part of R01.

## Server actions / route handlers / API

None.

No product API endpoint is required.

## Validation — Phase/Round validator contract

The repository-local validator is the primary implementation artifact of R01 governance.

### 12.1 PR classification

The validator must distinguish at least:

```text
SPECIFICATION PR
IMPLEMENTATION PR
```

If a third category such as general maintenance is supported, its rules must be explicit and must not become an implementation-spec bypass.

### 12.2 Specification PR definition

A specification PR introduces or changes controlled development specification files under:

```text
docs/07-delivery/development-phases/
```

A new future spec is allowed to exist on the PR head before it exists on `main`; otherwise the process would deadlock.

However the bootstrap exception must be narrow.

A PR cannot use the spec-bootstrap category while also modifying application, database, dependency, workflow implementation, infrastructure, or product code for the new scope.

### 12.3 Implementation PR definition

An implementation PR changes implementation-affecting areas such as:

- application source;
- tests;
- dependencies;
- database;
- migrations;
- runtime configuration;
- workflows/infrastructure;
- integrations.

It must reference exactly one executable specification already present on the PR base branch.

### 12.4 Canonical specification field

Recommended required PR field:

```text
Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md
```

The validator must not derive authorization from vague prose.

### 12.5 Filename validation

The raw filename must match:

```regex
^FLOW_P\d{2}_R\d{2}_IMPLEMENTATION_SPEC\.md$
```

Then validate semantic limits separately:

```text
Phase >= 01
Round = 01..06
```

Reject examples including:

```text
FLOW_P1_R1_IMPLEMENTATION_SPEC.md
FLOW_P01_R00_IMPLEMENTATION_SPEC.md
FLOW_P01_R07_IMPLEMENTATION_SPEC.md
../FLOW_P01_R01_IMPLEMENTATION_SPEC.md
/docs/FLOW_P01_R01_IMPLEMENTATION_SPEC.md
https://example.com/FLOW_P01_R01_IMPLEMENTATION_SPEC.md
C:\FLOW_P01_R01_IMPLEMENTATION_SPEC.md
```

### 12.6 Base-branch authority

For an implementation PR, authorization must come from the PR **base branch**.

The validator must verify that:

```text
docs/07-delivery/development-phases/<referenced spec>
```

exists on base `main`.

A head-only spec must not authorize implementation.

A PR that changes an existing base spec from `BLOCKED`/`DRAFT` to `READY` on its own head must not gain implementation authority from that head change.

### 12.7 Required metadata validation

At minimum parse/validate:

```text
Phase
Round
Status
Target branch
Previous
Next
```

For this round the expected values are:

```text
Phase: 01
Round: 01
Status: READY
Target branch: main
Previous: NONE
Next: FLOW_P01_R02_IMPLEMENTATION_SPEC.md
```

Required consistency:

```text
filename Phase == spec Phase
filename Round == spec Round
PR Phase == spec Phase
PR Round == spec Round
PR Specification == referenced filename
```

### 12.8 Status semantics

For new implementation authorization:

```text
READY = allowed
DRAFT = reject
BLOCKED = reject
COMPLETE = reject
```

### 12.9 Previous / Next continuity

The validator must validate format and basic continuity without inventing future scope.

For R01:

```text
Previous = NONE
```

For later rounds inside Phase 01, `Previous` must be a valid executable-spec filename.

`Next` is a continuation marker only.

The validator must not automatically create or implement the named next file.

### 12.10 Duplicate / ambiguous reference behavior

Reject:

- no Specification field;
- more than one conflicting Specification field;
- malformed field;
- conflicting Phase/Round fields;
- reference to multiple executable specs for one implementation PR unless future policy explicitly supports multi-round PRs, which this phase does not.

### 12.11 Failure output

Failure messages must tell the developer what to correct.

Example missing reference:

```text
ERROR: Implementation PR must include exactly one Specification field.
Expected format:
Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md
```

Example base missing:

```text
ERROR: FLOW_P01_R01_IMPLEMENTATION_SPEC.md is not present on the PR base branch.
Merge the specification PR to main before implementation.
```

Example status:

```text
ERROR: Referenced specification status is BLOCKED.
Implementation is not authorized.
```

## Authorization

GitHub workflow permissions must be least privilege.

The validator does not need repository write access.

## Idempotency / concurrency

For the same PR event state, rerunning validation must produce the same result.

Do not store mutable authorization state in an external database or temporary service.

Authorization is derived from:

- PR metadata;
- base-branch repository contents;
- deterministic validator rules.

---

# 13. Frontend Changes

## Routes / pages

None.

## Components

None.

## State / data fetching

None.

## User interactions

None.

## Responsive behavior

Not applicable.

## Loading / empty / error states

No product UI state changes.

CI/governance failures must have clear error output.

---

# 14. Authentication and Authorization

## Application roles affected

`NONE`.

## Application permissions affected

`NONE`.

## Route protection

Unchanged.

## Backend permission enforcement

Unchanged.

## Session requirements

Unchanged.

## GitHub authorization requirements

New workflows must use minimum permissions.

Recommended baseline:

```yaml
permissions:
  contents: read
  pull-requests: read
```

Only add permissions if proven necessary by the implementation.

Do not grant write permission merely for convenience.

## Explicit Auth scope prohibition

R01 must not claim progress on:

- Auth.js runtime;
- Credentials provider;
- OAuth;
- user/session migration;
- tenant workspace context;
- branch selection;
- permission enforcement.

`next-auth` may appear in the lockfile because it is already declared in `package.json`; that does not authorize Auth.js implementation.

---

# 15. Security Requirements

## Repository / workflow security

- Treat PR title/body/metadata as untrusted input.
- Do not `eval` PR content.
- Do not execute PR-provided shell fragments.
- Do not `source` generated shell content from the PR body.
- Validate specification filename against a strict allowlist pattern before path use.
- Reject `..`, absolute paths, URLs, backslash traversal, or alternate directories.
- Prefer JavaScript path/filesystem APIs over interpolating unchecked data into shell commands.
- Base-branch spec authority is mandatory.
- Specification-only bootstrap must not permit mixed implementation.
- Do not use unsafe `pull_request_target` + untrusted-head checkout patterns unless the owner explicitly approves a reviewed secure design; prefer normal `pull_request` handling.
- Workflows should be read-only wherever possible.

## Dependency security

- Regenerate lockfile using npm tooling.
- Review registry/resolved/integrity changes.
- Do not run `npm audit fix --force`.
- Do not perform uncontrolled major/minor dependency upgrades.
- Do not add an alternate registry or package source without owner approval.
- Do not hide a dependency vulnerability by suppressing output without documented policy.

## Secret handling

No production secret belongs in:

- repository files;
- PR body;
- issue body;
- CI logs;
- test fixtures.

R01 must not require:

```text
AUTH_SECRET
DATABASE_URL
DATABASE_DIRECT_URL
SUPABASE_SECRET_KEY
STRIPE_SECRET_KEY
OMISE_SECRET_KEY
```

## Existing security checks

Do not remove or weaken existing application/database security checks merely to make R01 green.

---

# 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| This spec is not merged to `main` | No R01 implementation may begin. | Merge/review spec first. |
| Latest `main` differs from specification base | Do not branch from stale SHA. | Inspect intervening commits, record actual base, branch from latest `main`. |
| Intervening commit materially invalidates R01 scope | Stop instead of guessing. | Owner updates/replaces specification through spec PR. |
| `package.json` and lockfile mismatch | R01 remains blocked. | Regenerate lockfile with controlled npm toolchain and review diff. |
| Lock regeneration causes broad unrelated churn | Do not commit blindly. | Diagnose Node/npm/version/config/peer-resolution cause and minimize deterministic change. |
| `npm ci` still fails | Dependency Integrity fails. | Fix only deterministic installation causes inside R01 scope. |
| Missing `Specification:` field | Phase/Round gate fails. | Add one exact canonical field. |
| Duplicate conflicting spec fields | Gate fails. | Keep one exact reference. |
| Referenced spec exists only on head | Gate fails. | Merge specification PR first, then rebase/update implementation branch. |
| Referenced spec is `DRAFT` | Gate fails. | Owner changes spec status through separate reviewed spec change. |
| Referenced spec is `BLOCKED` | Gate fails. | Resolve blocker and update spec through owner-controlled process. |
| Referenced spec is `COMPLETE` | Gate fails for new implementation. | Use the currently authorized READY round spec. |
| Filename/metadata Phase mismatch | Gate fails. | Correct PR/spec metadata. |
| Filename/metadata Round mismatch | Gate fails. | Correct PR/spec metadata. |
| New future spec and its implementation are mixed in one PR | Gate fails. | Split specification PR and implementation PR. |
| Existing lint fails after install succeeds | Do not hide; normally do not expand R01. | Record exact first error for R02. |
| Existing typecheck fails | Same. | Record exact first error for R02. |
| Existing unit/integration tests fail | Same. | Record exact failing suite/test for R02 unless caused by R01 change. |
| Existing Next build fails | Same. | Record exact failure for R02 unless caused by R01 change. |
| Database workflow exposes inherited failure | Do not weaken DB work. | Classify failure and hand to R03/R04. |
| Vercel/deployment remains failing | Do not claim production readiness. | Record inherited failure for later Phase 01 recovery. |
| Branch protection/ruleset cannot yet be enabled | Do not claim enforced. | Record exact owner/admin action required; verify in later Phase 01 acceptance. |
| GitHub Actions infrastructure transient failure | Distinguish infra from deterministic code failure. | Re-run only after evidence indicates transient failure. |
| Workflow validator itself fails due implementation bug | R01 cannot merge. | Fix validator/tests in the same R01 PR. |

---

# 17. Dependencies

## Internal dependencies

- `CONTRIBUTING.md`
- `.github/CODEOWNERS`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/next-flow-quality.yml`
- `.github/workflows/supabase-db-quality.yml`
- `docs/07-delivery/development-phases/README.md`
- `docs/07-delivery/development-phases/FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`
- this specification
- `apps/web/next-flow/package.json`
- `apps/web/next-flow/package-lock.json`
- `apps/web/next-flow/AGENTS.md`

## External dependencies

- GitHub Actions;
- GitHub PR event metadata;
- GitHub repository base-branch contents;
- Node.js 22 as currently used by CI;
- npm compatible with lockfile v3.

No product runtime service is required.

## Environment variables / secrets

No application secret required.

If GitHub API access is needed, use only the automatically provided token with least privilege.

Prefer using checked-out base content and event payload where possible instead of unnecessary network/API authority.

---

# 18. Tests

## Unit / validator behavior

### Positive authorization cases

- [ ] Valid P01/R01 implementation PR references exact READY base spec and passes.
- [ ] Exact zero-padded filename is accepted.
- [ ] Phase `01` matches filename/spec/PR.
- [ ] Round `01` matches filename/spec/PR.
- [ ] `Target branch: main` is accepted.
- [ ] A true specification-only PR introducing a future round spec is accepted under bootstrap rules.

### Filename/security rejection cases

- [ ] Missing zero padding rejected.
- [ ] R00 rejected.
- [ ] R07 rejected.
- [ ] Path traversal rejected.
- [ ] Absolute path rejected.
- [ ] URL reference rejected.
- [ ] Alternate directory rejected.
- [ ] Backslash traversal rejected.
- [ ] Duplicate conflicting specification references rejected.

### Metadata rejection cases

- [ ] Filename Phase vs metadata Phase mismatch rejected.
- [ ] Filename Round vs metadata Round mismatch rejected.
- [ ] PR Phase vs spec Phase mismatch rejected.
- [ ] PR Round vs spec Round mismatch rejected.
- [ ] Target branch mismatch rejected.

### Status rejection cases

- [ ] `DRAFT` rejected for implementation.
- [ ] `BLOCKED` rejected for implementation.
- [ ] `COMPLETE` rejected for new implementation.

### Base authority cases

- [ ] Spec present on base passes.
- [ ] Spec present only on head fails.
- [ ] Base `BLOCKED` changed to head `READY` does not self-authorize implementation.
- [ ] Missing base spec fails with actionable message.

### Bootstrap cases

- [ ] Spec-only PR can create next spec.
- [ ] Spec + application source change fails bootstrap.
- [ ] Spec + dependency implementation change fails bootstrap.
- [ ] Spec + database implementation change fails bootstrap.
- [ ] Spec + same-scope workflow implementation fails bootstrap unless a separately documented owner-approved governance exception exists; default is reject.

## Integration tests

- [ ] Clean `npm ci` succeeds in `apps/web/next-flow` from committed files.
- [ ] New workflow YAML parses and is accepted by GitHub Actions.
- [ ] Phase/Round gate triggers for representative implementation PR changes.
- [ ] Editing PR body re-evaluates specification metadata where supported by trigger configuration.
- [ ] Synchronizing branch re-evaluates gate.
- [ ] Dependency Integrity triggers on `package.json` changes.
- [ ] Dependency Integrity triggers on `package-lock.json` changes.
- [ ] Dependency Integrity triggers on its own workflow changes.

## End-to-end governance evidence

The R01 implementation PR itself must act as a real governance demonstration:

```text
Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md
→ Phase/Round Gate PASS
```

and:

```text
Dependency Integrity
→ PASS
```

No product E2E change is required in R01.

## Authorization / RLS / Security

- [ ] No DB/RLS change.
- [ ] Workflow permissions reviewed.
- [ ] Validator cannot self-authorize via head-only spec.
- [ ] Unsafe path inputs rejected.
- [ ] No secret in test fixture/log.

## Failure cases

- [ ] Missing spec reference gives clear failing check.
- [ ] Missing base spec gives clear failing check.
- [ ] non-READY status gives clear failing check.
- [ ] mixed spec + implementation gives clear failing check.
- [ ] unexpected lockfile churn is reviewed before commit.

## Regression tests

- [ ] Existing Next Flow Quality workflow remains present.
- [ ] Existing lint step remains present.
- [ ] Existing typecheck step remains present.
- [ ] Existing test step remains present.
- [ ] Existing `build:next` step remains present.
- [ ] Existing Supabase Database Quality workflow remains present.
- [ ] No existing DB checks removed.
- [ ] No migration rewritten.
- [ ] No legacy auth removed.
- [ ] No product application behavior changed.
- [ ] No customer ordering behavior changed.
- [ ] No kitchen behavior changed.
- [ ] No payment behavior changed.

---

# 19. Validation Commands

Run only commands that actually exist after the R01 implementation and record actual results.

## Repository identity / base verification

From repository root:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

## Node/npm evidence

From `apps/web/next-flow`:

```bash
node --version
npm --version
```

## Hard R01 dependency gate

```bash
npm ci
```

A clean install must succeed from committed files.

## Existing application checks

After clean install succeeds, run and record actual outcomes:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```

Rules:

- Do not fabricate PASS.
- If an inherited failure remains, record first actionable failure.
- Do not automatically expand R01 into complete application recovery.
- If R01 itself caused the failure, fix it before merge.

## Validator tests

Use the actual command introduced by implementation.

Examples only:

```bash
node scripts/validate-phase-round-spec.mjs <fixture>
```

or a repository script such as:

```bash
npm run test:delivery
```

if the implementation introduces it.

The implementation PR must state the exact command actually used.

## Result vocabulary

Every validation item must be reported as exactly one of:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

Avoid ambiguous statements such as:

```text
looks good
should work
probably passes
```

## R01 check classification

The implementation PR must distinguish:

```text
R01 REQUIRED CHECKS
- exact stable Phase/Round gate context
- exact stable Dependency Integrity context

OBSERVED / INHERITED CHECKS
- Next Flow Quality
- Supabase Database Quality
- Vercel / deployment status if reported
```

Observed inherited failures must remain visible but are not permission to silently broaden R01.

---

# 20. PR Requirements

## Specification PR vs implementation PR

This file itself must be merged through a documentation/specification PR before implementation begins.

The later R01 implementation PR must be a separate PR.

## Required implementation PR metadata

The R01 implementation PR must contain:

```text
Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md
Phase: 01
Round: 01
Previous: NONE
Related Issue: #14
```

## Required base evidence

The PR must include:

```text
SPEC_BASE_SHA:
744bcc05190e72a15859d50e16f2a28a2e723c85

IMPLEMENTATION_BASE_SHA:
<actual latest main used to create implementation branch>
```

If those differ, explain intervening commits.

## Required dependency evidence

Report:

```text
PACKAGE_JSON_CHANGED: YES / NO
PACKAGE_LOCK_CHANGED: YES / NO
NODE_VERSION: ...
NPM_VERSION: ...
NPM_CI: PASS / FAIL
```

Explain every manifest change if any.

Explain broad lockfile churn if any.

## Required governance evidence

Report:

```text
PHASE_ROUND_GATE_CONTEXT: <exact check name>
PHASE_ROUND_GATE: PASS / FAIL

DEPENDENCY_INTEGRITY_CONTEXT: <exact check name>
DEPENDENCY_INTEGRITY: PASS / FAIL
```

## Required existing-quality evidence

Report actual results:

```text
LINT: PASS / FAIL / NOT RUN / BLOCKED
TYPECHECK: PASS / FAIL / NOT RUN / BLOCKED
UNIT: PASS / FAIL / NOT RUN / BLOCKED
INTEGRATION: PASS / FAIL / NOT RUN / BLOCKED
BUILD_NEXT: PASS / FAIL / NOT RUN / BLOCKED
NEXT_FLOW_QUALITY: PASS / FAIL / NOT RUN / BLOCKED
SUPABASE_DB_QUALITY: PASS / FAIL / NOT RUN / BLOCKED
VERCEL_STATUS: PASS / FAIL / NOT RUN / BLOCKED
```

For every inherited failure, identify the first actionable error/stage.

## Required scope declarations

The PR must explicitly state:

```text
AUTH_IMPLEMENTED: NO
DATABASE_SCHEMA_CHANGED: NO
PRODUCTION_DB_MODIFIED: NO
BUSINESS_PERSISTENCE_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
KITCHEN_REDESIGN: NO
OMISE_IMPLEMENTED: NO
STRIPE_IMPLEMENTED: NO
CUSTOMER_REDESIGN: NO
VOICE_IMPLEMENTED: NO
```

## Required branch-protection evidence

Report:

```text
MAIN_PROTECTED: YES / NO
CURRENT_REQUIRED_CHECKS: ...
R01_STABLE_CHECK_CONTEXTS: ...
OWNER_ACTION_REQUIRED: ...
```

Do not claim main protection if not directly verified.

## Scope discipline

The PR must contain only R01 scope or explicitly documented changes that are mechanically unavoidable for R01.

Do not fix unrelated application/database/product issues simply because they are discovered.

## Merge control

- Target `main`.
- No direct main write.
- No auto-merge.
- Required R01 checks must pass.
- PR remains for owner review/manual merge.
- R01 is not COMPLETE until owner merges the implementation PR.

---

# 21. Definition of Done

P01/R01 is complete only when **all** required conditions below are true.

## Repository/base correctness

- [ ] This specification was merged to `main` before implementation started.
- [ ] Implementation fetched latest `main`.
- [ ] Implementation branch started from latest verified `main`.
- [ ] Actual implementation base SHA is documented.
- [ ] Intervening commits were reviewed if specification base differed.

## Dependency integrity

- [ ] `package.json` and `package-lock.json` are synchronized.
- [ ] Lockfile was generated by npm tooling, not manually fabricated.
- [ ] `next-auth` declared intent is represented correctly in the lock graph.
- [ ] Root dependency metadata matches the manifest.
- [ ] Unexpected dependency churn was investigated.
- [ ] No uncontrolled dependency upgrade was introduced.
- [ ] Clean `npm ci` passes.
- [ ] Dedicated Dependency Integrity check exists.
- [ ] Dedicated Dependency Integrity check passes.

## Phase/Round governance

- [ ] One canonical validator exists.
- [ ] One stable Phase/Round workflow/check exists.
- [ ] Implementation PRs require exact specification reference.
- [ ] Referenced implementation spec must exist on base branch.
- [ ] `READY` is required for new implementation.
- [ ] Phase metadata is validated.
- [ ] Round metadata is validated.
- [ ] Target branch metadata is validated.
- [ ] Missing/duplicate/malformed references fail closed.
- [ ] Path traversal is rejected.
- [ ] Head-only spec cannot self-authorize.
- [ ] Head-only status promotion cannot self-authorize.
- [ ] Specification-only bootstrap is supported.
- [ ] Mixed future-spec + same-scope implementation is rejected.
- [ ] Failure output is actionable.

## PR governance

- [ ] PR template includes Specification field.
- [ ] PR template includes Phase field.
- [ ] PR template includes Round field.
- [ ] PR template includes previous-round/PR information.
- [ ] PR template includes validation matrix.
- [ ] PR template includes DB/config/environment declaration.
- [ ] PR template includes security section.
- [ ] PR template includes failure/recovery evidence.
- [ ] PR template includes known limitations/deferred scope.
- [ ] PR template includes next-spec handoff.
- [ ] PR template clearly keeps owner/manual merge responsibility.

## Existing quality preservation

- [ ] Existing Next Flow Quality workflow was not removed.
- [ ] Existing lint was not removed.
- [ ] Existing typecheck was not removed.
- [ ] Existing tests were not removed to force green.
- [ ] Existing build check was not removed.
- [ ] Existing Supabase DB workflow was not removed.
- [ ] Existing DB checks were not weakened.
- [ ] Actual inherited failures are recorded truthfully.

## Scope discipline

- [ ] No Auth.js runtime implemented.
- [ ] No legacy auth migration/removal.
- [ ] No database migration.
- [ ] No RLS rewrite.
- [ ] No customer capability.
- [ ] No table/cart/order persistence.
- [ ] No realtime implementation.
- [ ] No kitchen redesign.
- [ ] No Omise implementation.
- [ ] No Stripe implementation.
- [ ] No customer UX redesign.
- [ ] No Voice Ordering implementation.
- [ ] No production DB modification.

## Evidence / handoff

- [ ] Exact R01 check contexts documented.
- [ ] `npm ci` result documented.
- [ ] application-check results documented.
- [ ] database-check result documented if triggered.
- [ ] branch-protection status documented.
- [ ] owner action documented.
- [ ] implementation PR is ready for owner review.
- [ ] implementation PR is not auto-merged.

## Completion rule

Before owner merge:

```text
P01/R01 = IMPLEMENTED / WAITING FOR OWNER MERGE
```

Only after owner/manual merge:

```text
P01/R01 = COMPLETE
```

Opening a PR is not completion.

Passing only `npm ci` is not completion.

Creating only the workflow files is not completion.

The complete R01 governance gate must be demonstrated.

---

# 22. Handoff to Next Round

## Completed state expected after R01 merge

P01/R02 should inherit all of the following:

```text
DETERMINISTIC CLEAN NPM INSTALL
+
SYNCHRONIZED MANIFEST / LOCKFILE
+
MACHINE-CHECKABLE PHASE/ROUND GATE
+
BASE-BRANCH SPEC AUTHORITY
+
PHASE/ROUND-AWARE PR TEMPLATE
+
STABLE DEPENDENCY INTEGRITY CHECK
+
STABLE PHASE/ROUND CHECK CONTEXT
+
TRUTHFUL LIST OF REMAINING APPLICATION QUALITY FAILURES
```

R02 must not have to rediscover whether dependency installation is deterministic.

## Known Phase 01 follow-up after R01

R01 is expected to expose, not necessarily resolve, broader inherited issues.

Those issues must be handed forward using actual evidence.

Expected categories include:

### Application-quality follow-up

- lint;
- typecheck;
- unit/integration tests;
- `build:next`;
- `Next Flow Quality`.

### Database follow-up

- fresh Supabase bootstrap;
- migrations;
- seed;
- database SQL tests;
- DB lint;
- Kysely type generation/drift;
- runtime actor-aware tests.

### Repository / deployment follow-up

- gitlink/submodule ambiguity;
- CI retry behavior;
- deployment/Vercel failure;
- final `main` protection.

R01 must record the evidence but not steal those scopes.

## Required next specification

```text
FLOW_P01_R02_IMPLEMENTATION_SPEC.md
```

Required location:

```text
docs/07-delivery/development-phases/FLOW_P01_R02_IMPLEMENTATION_SPEC.md
```

After R01 implementation is merged, if that exact file does **not** exist on `main`, development must stop.

Do not infer R02 scope from this document.

Do not generate and execute R02 automatically.

Owner direction/specification workflow is required.

## Required final machine-readable R01 handoff

Before the implementation agent stops, the implementation PR/final report must include:

```text
PHASE: 01
ROUND: 01
SPECIFICATION: FLOW_P01_R01_IMPLEMENTATION_SPEC.md
SPEC_STATUS: READY
SPEC_BASE_SHA: 744bcc05190e72a15859d50e16f2a28a2e723c85
IMPLEMENTATION_BASE_SHA: ...
IMPLEMENTATION_HEAD_SHA: ...
IMPLEMENTATION_BRANCH: ...
IMPLEMENTATION_PR: ...
PACKAGE_JSON_CHANGED: YES / NO
PACKAGE_LOCK_CHANGED: YES / NO
NODE_VERSION: ...
NPM_VERSION: ...
NPM_CI: PASS / FAIL
PHASE_ROUND_GATE_CONTEXT: ...
PHASE_ROUND_GATE: PASS / FAIL
DEPENDENCY_INTEGRITY_CONTEXT: ...
DEPENDENCY_INTEGRITY: PASS / FAIL
LINT: PASS / FAIL / NOT RUN / BLOCKED
TYPECHECK: PASS / FAIL / NOT RUN / BLOCKED
UNIT: PASS / FAIL / NOT RUN / BLOCKED
INTEGRATION: PASS / FAIL / NOT RUN / BLOCKED
BUILD_NEXT: PASS / FAIL / NOT RUN / BLOCKED
NEXT_FLOW_QUALITY: PASS / FAIL / NOT RUN / BLOCKED
SUPABASE_DB_QUALITY: PASS / FAIL / NOT RUN / BLOCKED
VERCEL_STATUS: PASS / FAIL / NOT RUN / BLOCKED
FIRST_APPLICATION_BLOCKER: ...
FIRST_DATABASE_BLOCKER: ...
MAIN_PROTECTED: YES / NO
CURRENT_REQUIRED_CHECKS: ...
OWNER_ACTION_REQUIRED: ...
AUTH_IMPLEMENTED: NO
DATABASE_SCHEMA_CHANGED: NO
PRODUCTION_DB_MODIFIED: NO
BUSINESS_PERSISTENCE_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
KITCHEN_REDESIGN: NO
OMISE_IMPLEMENTED: NO
STRIPE_IMPLEMENTED: NO
CUSTOMER_REDESIGN: NO
VOICE_IMPLEMENTED: NO
PR_READY_FOR_OWNER_REVIEW: YES / NO
PR_MERGED: NO
NEXT_SPECIFICATION: FLOW_P01_R02_IMPLEMENTATION_SPEC.md
```

---

# 23. Development Gate

The FLOW hard gate is unchanged:

```text
NO SPEC = NO DEVELOPMENT
NO MERGE = NO NEXT ROUND
FAILED REQUIRED CI = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

## R01 legal execution sequence

```text
OWNER APPROVES P01/R01 SPEC
        ↓
SPEC PR MERGED TO MAIN
        ↓
FETCH LATEST MAIN
        ↓
VERIFY EXACT SPEC EXISTS ON MAIN
        ↓
VERIFY STATUS = READY
        ↓
CREATE R01 IMPLEMENTATION BRANCH FROM LATEST MAIN
        ↓
READ REPOSITORY / AGENT INSTRUCTIONS
        ↓
REPAIR PACKAGE / LOCK CONSISTENCY
        ↓
PROVE CLEAN NPM CI
        ↓
IMPLEMENT PHASE/ROUND VALIDATOR
        ↓
IMPLEMENT PHASE/ROUND GATE WORKFLOW
        ↓
IMPLEMENT DEPENDENCY INTEGRITY WORKFLOW
        ↓
UPDATE PR TEMPLATE
        ↓
TEST POSITIVE AUTHORIZATION CASES
        ↓
TEST NEGATIVE / BYPASS CASES
        ↓
RUN EXISTING APPLICATION CHECKS
        ↓
RECORD INHERITED FAILURES WITHOUT HIDING THEM
        ↓
OPEN / UPDATE R01 IMPLEMENTATION PR
        ↓
R01 REQUIRED CHECKS PASS
        ↓
STOP FOR OWNER REVIEW
        ↓
OWNER MANUAL MERGE
        ↓
P01/R01 COMPLETE
        ↓
VERIFY FLOW_P01_R02_IMPLEMENTATION_SPEC.md EXISTS ON MAIN
        ↓
IF MISSING → STOP
```

## Explicit prohibitions

The implementation agent must not:

```text
push directly to main
merge its own implementation PR
enable auto-merge
start R02 implementation
invent R02 scope
implement Auth.js
rewrite database schema
weaken RLS
disable existing CI
delete tests to obtain green
remove dependencies merely to avoid lock repair
modify product behavior
modify production database
add real secrets
hide inherited failure output
claim branch protection without verification
```

## Absolute stop condition

The implementation agent must stop after all R01 work is complete and the implementation PR is ready for owner review, with:

```text
PR_MERGED = NO
```

The owner controls merge.

After merge, the existence of the exact `Next` specification on `main` controls whether development may continue.

## Final Phase 01 / Round 01 success test

R01 has achieved its purpose only when repository evidence can answer:

```text
Can dependencies install deterministically?
YES

Can an implementation PR identify its exact executable spec?
YES

Can GitHub machine-check the authorization?
YES

Can implementation self-authorize with a head-only spec?
NO

Can DRAFT/BLOCKED/COMPLETE authorize new work?
NO

Can a future specification be proposed before it exists on main?
YES

Can the future spec and its implementation be merged together as a bypass?
NO

Can owner review see exact phase, round, scope, validation and deferred work?
YES

Can existing failing checks be silently removed to make R01 look green?
NO

Can the implementation agent merge and continue by itself?
NO

Can R02 begin if FLOW_P01_R02_IMPLEMENTATION_SPEC.md is absent from main?
NO
```

Only when those answers are backed by repository/CI evidence may P01/R01 be considered complete after owner merge.
