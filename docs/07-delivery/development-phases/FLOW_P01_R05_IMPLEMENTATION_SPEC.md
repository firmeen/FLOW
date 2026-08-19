# FLOW P01 R05 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 05 — Repository / CI / Deployment Baseline Recovery

---

## Metadata

- Phase: `01`
- Round: `05`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Target branch: `main`
- Previous: `FLOW_P01_R04_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P01_R06_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-19 20:00 Asia/Bangkok`
- Owner approval required: `YES`
- Automatic merge allowed: `NO`
- Proposal issue: `#27`
- Specification base SHA: `65e1781f8a5fcc48a48282f33286576188529362`
- Previous implementation PR: `PENDING — resolve current R04 implementation PR before R05 implementation`
- Previous implementation merge SHA: `PENDING — R04 must be owner-merged first`
- Required inherited checks: `Phase/Round Gate`, `Supabase Database Quality`, `Next Flow Quality` when triggered, and any R04-required checks present on the final R04 implementation PR
- Current planning evidence: `main@65e1781f8a5fcc48a48282f33286576188529362`, merged PR #25, draft R03 implementation PR #26, current repository tree/workflows, current Vercel status
- Current planning scope: `PHASE 01 / ROUND 05 ONLY`
- Recommended implementation branch: `phase/01-round/05-repository-ci-deployment`
- Recommended implementation PR title: `chore(platform): recover P01 R05 repository CI deployment baseline`

---

## Execution Authority Statement

This file may be merged to `main` while R03 or R04 implementation is still incomplete.

Its presence does **not** authorize R05 implementation early.

R05 implementation is legal only when all of the following are simultaneously true on the latest `main`:

```text
FLOW_P01_R05_IMPLEMENTATION_SPEC.md EXISTS
+
STATUS = READY
+
P01/R03 IMPLEMENTATION IS OWNER-MERGED
+
P01/R03 REQUIRED CHECKS PASSED
+
P01/R04 IMPLEMENTATION IS OWNER-MERGED
+
P01/R04 REQUIRED CHECKS PASSED
+
LATEST MAIN HAS BEEN FETCHED
+
R04 FINAL HANDOFF HAS BEEN READ
+
REPOSITORY TREE / CI / DEPLOYMENT STATE HAS BEEN RE-AUDITED
```

If R04 is open, draft, failed, unmerged, missing final evidence, or has a required red check, R05 implementation must stop.

The implementation agent must not infer R04 completion from the existence of the R04 spec.

The implementation agent must also treat the evidence captured in this specification as an authoring-time baseline, not as permission to ignore changes that land before R05 begins.

---

# 1. Phase Objective

Phase 01 exists to make FLOW development trustworthy before product architecture expands.

The six-round Phase 01 target is:

```text
TRUSTED REPOSITORY BASELINE
+
DETERMINISTIC DEPENDENCY INSTALLATION
+
MACHINE-CHECKABLE PHASE/ROUND AUTHORIZATION
+
GREEN APPLICATION QUALITY
+
GREEN DATABASE QUALITY
+
PROVEN ACTOR/TENANT/BRANCH DATABASE BASELINE
+
STABLE REQUIRED-CHECK CONTRACT
+
CLEAN REPOSITORY TOPOLOGY
+
TRUTHFUL DEPLOYMENT CONTRACT
+
OWNER-CONTROLLED MAIN MERGE PATH
```

R01 established development authorization and deterministic dependency installation.

R02 recovered the application-quality baseline.

R03 is responsible for fresh database bootstrap and structural database quality.

R04 is responsible for the actor-aware database/RLS authorization baseline.

R05 owns the remaining **repository / CI / deployment trust surface** required before R06 can turn the recovered baseline into enforced `main` protection.

R05 must make repository evidence able to answer all of the following:

```text
Does FLOW contain any orphan or ambiguous gitlink/submodule entry?
NO

Can repository topology be checked automatically?
YES

Can a malformed executable specification PR pass merely because it only changes the spec directory?
NO

Can a head-only specification still self-authorize mixed implementation work?
NO

Are required CI context names stable and explicit?
YES

Does every PR to main receive the stable required CI contexts needed by R06?
YES

Can expensive application/database checks skip cleanly when their scope is not touched?
YES

Does changing a workflow force that workflow's real validation path?
YES

Are deterministic failures distinguished from transient retryable infrastructure failures?
YES

Does checkout complete without the inherited missing-.gitmodules cleanup warning?
YES

Is Vercel deployment rooted at the intended application and currently healthy?
YES

Is deployment evidence documented without committing secrets?
YES

Is main protection still deferred to R06?
YES
```

R05 is not a feature-development round.

R05 must not weaken application/database/security gates merely to obtain green repository checks.

---

# 2. Phase Scope

## 2.1 R05 In Scope

R05 owns the following repository-level surfaces.

### Repository topology

- inspect the current Git tree for every mode-`160000` entry;
- inspect `.gitmodules` state;
- classify every gitlink as intentionally registered submodule or unmanaged legacy gitlink;
- remove unmanaged gitlinks from FLOW unless a current owner-approved architecture requirement explicitly establishes them as supported submodules;
- if a real submodule is retained, create/repair `.gitmodules` with explicit `path` and `url`, document ownership and purpose, and prove checkout behavior;
- never create `.gitmodules` merely to suppress a warning;
- never delete an external repository merely because its FLOW gitlink is removed;
- add automated repository-topology validation to prevent orphan gitlinks from returning;
- remove temporary round-specific diagnostic workflow artifacts if any accidentally survive R03/R04 into `main` and are no longer authorized by their owning round.

### Phase/Round specification governance hardening

- keep implementation authorization based on the PR base branch;
- preserve the rule that a mixed implementation + new head-only spec cannot self-authorize;
- harden specification-only PR handling so canonical executable specs are validated from the PR head;
- validate executable-spec filename, Phase, Round, Status syntax, target branch, Previous and Next syntax/continuity;
- distinguish executable specification changes from spec-directory maintenance such as README/template changes;
- support safe amendments to an already-merged specification without allowing silent phase/round identity rewrites;
- add validator regression tests for valid new specs, valid amendments, malformed specs, continuity failures and mixed implementation attempts.

### Stable CI check contract

- make check/job names explicit and stable;
- prepare stable contexts that R06 can require through branch protection/rulesets;
- make `Dependency Integrity`, `Next Flow Quality`, and `Supabase Database Quality` appear on every PR to `main`;
- move scope filtering from workflow-level `paths` omission to deterministic in-workflow scope classification or an equivalent design that always reports the stable check;
- avoid running expensive application/database work when the PR does not affect that surface;
- make a workflow-file change force the corresponding real workflow validation;
- keep `Phase/Round Gate` always present on PRs to `main`;
- add a cheap `Repository Integrity` check that validates repository topology on every PR to `main`;
- preserve least-privilege GitHub token permissions;
- avoid `pull_request_target` for untrusted PR code;
- keep secrets out of PR workflows;
- add concurrency/cancellation only if it does not hide final required results or make status reporting ambiguous.

### CI retry and local service hygiene

- re-audit the final Supabase workflow after R03/R04;
- preserve any R03-owned deterministic database fixes already merged;
- if blanket retries remain, stop retrying deterministic migration/SQL failures as if they were transient infrastructure failures;
- retry only explicitly classified transient failure classes;
- surface the first deterministic root failure clearly;
- reduce unnecessary local Supabase service startup if the pinned CLI supports a safe exclusion/minimal-service mode and the full R03/R04 DB suite still passes;
- do not change database semantics merely to optimize CI startup.

### Official GitHub Actions runtime hygiene

- inspect warnings from current official action versions at implementation time;
- if current official GitHub action majors used by the repository produce deprecation/runtime warnings, upgrade only to currently supported official versions after confirming compatibility;
- do not introduce an unreviewed third-party action merely for convenience;
- preserve Node.js 22 as the repository application/tooling execution baseline unless a separately approved decision changes it.

### Deployment baseline

- verify current Vercel integration status from the R05 implementation PR and current `main`;
- verify the intended Vercel project remains `flow` unless owner evidence says otherwise;
- verify the intended project root remains `apps/web/next-flow`;
- preserve successful Preview deployment behavior;
- verify post-merge/main deployment behavior using actual status evidence;
- document which deployment configuration is repository-owned versus externally configured in Vercel;
- create/update a deployment operations document with root directory, framework/application path, validation expectations, environment/secrets rules and failure handling;
- avoid introducing `vercel.json` or changing build/root settings when current deployment is already correct unless evidence proves a repository-owned config is required;
- never commit Vercel tokens, project secrets or production environment values.

### Documentation alignment needed for R06

- document the stable check names produced by R05;
- document which checks are always-present and which heavy steps are conditional;
- document the deployment baseline;
- document the repository topology decision;
- leave final branch-protection/ruleset activation instructions/evidence for R06.

## 2.2 Phase 01 Context Retained but Not Reimplemented

R05 must inherit and preserve:

```text
R01 dependency/governance baseline
R02 application-quality baseline
R03 fresh database/structural baseline
R04 actor-aware database authorization baseline
```

R05 must not reopen those rounds unless an R05 repository/CI change itself causes a regression.

If a regression appears, the R05 implementation must repair the regression before merge; it must not relabel the regression as somebody else's problem.

## 2.3 R05 Explicitly Out of Scope

R05 must not implement:

- Auth.js;
- Credentials provider;
- OAuth;
- login/password verification runtime;
- AccessContext/workspace selection;
- application-level staff/kitchen/cashier/admin authorization;
- new RLS business semantics beyond preserving R04;
- customer QR capability;
- customer table-session persistence;
- cart/order persistence cutover;
- realtime product synchronization;
- kitchen multi-station redesign;
- Omise/Opn merchant payment runtime;
- Stripe Billing runtime;
- Stripe Connect;
- entitlement product behavior;
- customer UX redesign;
- Voice Ordering;
- CareFlow or JobFlow implementation;
- production database migration/deployment;
- final `main` branch protection/ruleset activation;
- automatic merging;
- deletion of external GitHub repositories.

Final `main` protection and Phase 01 acceptance belong to R06.

---

# 3. This Round Objective

P01/R05 must turn the repository from a collection of individually useful checks and inherited topology/deployment assumptions into a **branch-protection-ready repository baseline**.

The minimum R05 result is:

```text
CLEAN GIT TOPOLOGY
+
AUTOMATED REPOSITORY INTEGRITY CHECK
+
HEAD-VALIDATED SPECIFICATION PRS
+
BASE-AUTHORIZED IMPLEMENTATION PRS
+
STABLE ALWAYS-PRESENT REQUIRED CHECK CONTEXTS
+
CONDITIONAL EXPENSIVE CI EXECUTION
+
DETERMINISTIC RETRY CLASSIFICATION
+
CLEAN CHECKOUT
+
VERIFIED VERCEL ROOT / PREVIEW / MAIN CONTRACT
+
DEPLOYMENT RUNBOOK
+
NO MAIN PROTECTION YET
```

R05 is successful only if R06 can enable protection using named checks without discovering that path-filtered workflows sometimes never report.

---

# 4. Preconditions

Before R05 implementation starts, verify all items against current repository state.

## 4.1 Previous-round gate

- [ ] R03 implementation PR is owner-merged.
- [ ] R03 required checks are green.
- [ ] R04 implementation PR is owner-merged.
- [ ] R04 required checks are green.
- [ ] `Supabase Database Quality` is green on the final R04 implementation state.
- [ ] Any `Next Flow Quality` run triggered by R04 is green.
- [ ] R04 final handoff is present and read.

## 4.2 Current spec gate

- [ ] `FLOW_P01_R05_IMPLEMENTATION_SPEC.md` exists on current `main`.
- [ ] Its status is `READY`.
- [ ] `Previous` is `FLOW_P01_R04_IMPLEMENTATION_SPEC.md`.
- [ ] `Next` is `FLOW_P01_R06_IMPLEMENTATION_SPEC.md`.
- [ ] Latest `main` is fetched after the R04 implementation merge.

## 4.3 Repository re-audit

Re-check instead of assuming the authoring-time state remains unchanged:

- [ ] enumerate all mode-`160000` paths;
- [ ] inspect `.gitmodules` if present;
- [ ] inspect current workflow files and job names;
- [ ] inspect current Phase/Round validator/tests;
- [ ] inspect any temporary R03/R04 diagnostic workflow artifacts;
- [ ] inspect current Vercel status and PR bot evidence;
- [ ] inspect current branch protection state;
- [ ] inspect the final post-R04 Supabase retry/start behavior;
- [ ] inspect current official-action deprecation warnings in recent workflow logs.

If R03/R04 already repaired an item described in this R05 spec, preserve the repaired state and validate it rather than redoing it.

## 4.4 Working-tree / history safety

Implementation must begin from latest `main` and a focused branch.

Do not:

```text
push directly to main
force-reset shared history
rewrite unrelated commits
edit external repositories through this FLOW round
enable auto-merge
```

---

# 5. Architecture Scope

## Frontend

No product UI feature change is authorized.

Vercel preview must continue building the current Next.js application.

## Backend

No domain/backend feature behavior is authorized.

Repository scripts used by CI may be added or modified.

## Database

No schema/RLS business-semantic change is authorized by R05.

R05 may change CI orchestration around the already-green DB baseline, but must preserve exact database correctness established by R03/R04.

## Authentication / Authorization

No Auth.js/application authorization work.

Phase/Round repository authorization is in scope; product user authorization is not.

## API / Integrations

Vercel GitHub integration is observed and documented.

No product provider API integration is added.

## Payment

No Stripe/Omise product behavior.

The legacy `apps/api/stripe-apps` gitlink is a repository-topology concern only. Removing a FLOW gitlink does not delete or modify the separate external repository.

## Notifications

No notification product changes.

## Audit / Observability

CI logs must clearly identify:

- scope classification;
- whether heavy validation ran or was intentionally not applicable;
- retry classification;
- deterministic failures;
- deployment status evidence in the PR handoff.

## Infrastructure / CI

Primary R05 layer.

Affected surfaces include:

```text
Git tree topology
GitHub Actions
Phase/Round validator
CI path classification
Vercel deployment contract
repository operations documentation
```

---

# 6. Existing Files and Current Behavior

The implementation agent must re-fetch these paths from current `main` before editing.

| Path | Current responsibility / observed behavior | R05 action |
|---|---|---|
| `apps/api/stripe-apps` | mode-160000 gitlink; authoring-time SHA resolves to separate `firmeen/stripe-apps`; no `.gitmodules` registration in FLOW | Re-verify. Remove from FLOW unless an explicit owner-approved supported submodule contract now exists. |
| `apps/web/flow-ui` | mode-160000 gitlink; no `.gitmodules` registration | Re-verify. Remove unless a supported submodule contract now exists. |
| `.gitmodules` | Absent at authoring time | Do not create merely to silence warnings. Create only if an intentional retained submodule is approved and documented. |
| `scripts/validate-phase-round-spec.mjs` | Implementation PR validates exact READY spec from base; spec-only changes blanket-pass before validating HEAD spec | Harden spec PR path while preserving base-branch implementation authorization. |
| `scripts/validate-phase-round-spec.test.mjs` | Covers implementation authority and basic spec-only bootstrap, but not HEAD spec validation/amendment continuity | Expand regression suite. |
| `.github/workflows/phase-round-gate.yml` | Always runs on PR events to `main`; validates authorization | Preserve stable explicit check. Modify only as needed for hardened validator/test execution. |
| `.github/workflows/dependency-integrity.yml` | Uses workflow-level `paths`; job name already `Dependency Integrity` | Make context always appear on PRs; classify applicability inside workflow. |
| `.github/workflows/next-flow-quality.yml` | Uses workflow-level `paths`; job ID `quality` has no explicit display name | Make context always appear and assign stable explicit job name. |
| `.github/workflows/supabase-db-quality.yml` | Uses workflow-level `paths`; job ID `database`; authoring-time retry loop retries complete `supabase start` attempts | Make context always appear; explicit job name; re-audit retry/service boot after R03/R04. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Phase/Round-aware PR evidence template | Update only if needed to make specification amendment/CI/deployment evidence unambiguous. |
| `docs/07-delivery/development-phases/README.md` | Delivery hard gates and spec format | Add amendment/HEAD-validation or stable-check notes if required by final validator design. |
| `docs/08-operations/` | No deployment runbook at authoring time | Add repository-owned deployment baseline/runbook. |
| `apps/web/next-flow/package.json` | Node app scripts; `build:next` is CI build; normal `build` also includes vinext/sites preparation | Do not change unless real Vercel evidence requires it. |
| `apps/web/next-flow/next.config.ts` | Empty Next config baseline | Do not change merely for R05. |
| `main` branch protection | `protected: false`, required status enforcement off at authoring time | Observe only; R06 owns activation. |
| Vercel status | Current main status success; PR #26 bot evidence reports project `flow`, root `apps/web/next-flow`, Preview Ready | Preserve/verify/document; do not invent a deployment repair. |

---

# 7. Files to CREATE

Exact paths may be adjusted only if latest-main evidence shows an equivalent repository-owned location already exists. Any adjustment must be explained in the R05 PR.

| Path | Responsibility | Required contents |
|---|---|---|
| `scripts/validate-repository-topology.mjs` | Validate gitlink/submodule structure | Detect mode-160000 entries, `.gitmodules` registration mismatch, missing path/url, duplicate or orphan mappings; fail closed. |
| `scripts/validate-repository-topology.test.mjs` | Regression tests for topology validator | Valid no-submodule repo, valid registered submodule, orphan gitlink, stale `.gitmodules` entry, malformed mapping. |
| `scripts/classify-ci-scope.mjs` | Deterministic changed-path classifier for CI | Classify dependency/app/database/workflow scopes without relying on workflow-level path omission. |
| `scripts/classify-ci-scope.test.mjs` | Regression tests for CI scope classifier | Docs-only, app, DB, package, workflow-self-change, mixed paths, empty/invalid input behavior. |
| `.github/workflows/repository-integrity.yml` | Cheap always-present repository check | Run topology validator/tests on PR to main and push to main; explicit job/check name `Repository Integrity`; least privileges. |
| `docs/08-operations/deployment.md` | FLOW deployment baseline/runbook | Vercel project/root contract, Preview/Main expectations, repository-vs-external settings, secrets rules, evidence and failure response. |

If implementation consolidates the two new scripts into one clearly tested repository-quality script without reducing coverage, that is acceptable and must be documented.

Do not add a third-party path-filter action when a small repository-owned deterministic classifier is sufficient.

---

# 8. Files to MODIFY

Expected modifications:

| Path | Current behavior | Required change |
|---|---|---|
| `scripts/validate-phase-round-spec.mjs` | Spec-only directory changes blanket-authorized | Validate canonical executable spec changes from HEAD; preserve base-only implementation authority; support safe new spec/amendment classification. |
| `scripts/validate-phase-round-spec.test.mjs` | Missing HEAD spec/amendment negative matrix | Add comprehensive tests. |
| `.github/workflows/dependency-integrity.yml` | Workflow omitted when package paths untouched | Always report stable PR context; run real `npm ci` only when applicable; workflow self-change is applicable. |
| `.github/workflows/next-flow-quality.yml` | Workflow omitted when app paths untouched; implicit job name | Always report stable PR context; explicit job name `Next Flow Quality`; conditional heavy steps; self-change forces real validation. |
| `.github/workflows/supabase-db-quality.yml` | Workflow omitted when DB paths untouched; implicit job name; broad retry behavior may remain | Always report stable context named `Supabase Database Quality`; conditional heavy steps; self-change forces real validation; classify retries/minimize services if still needed after R03/R04. |
| `.github/workflows/phase-round-gate.yml` | Runs validator/tests | Update only if hardened validator requires explicit HEAD reading/environment or clearer stable job behavior. Keep job name `Phase/Round Gate`. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Existing Phase/Round metadata | Add specification-amendment / CI scope / deployment evidence fields only if useful to final machine/human contract. |
| `docs/07-delivery/development-phases/README.md` | Delivery gate source of truth | Document safe spec amendment behavior and stable-check contract if implementation introduces it. |
| `apps/web/next-flow/README.md` | Application setup notes | Optional: add a concise pointer to deployment runbook if current README benefits. Do not duplicate the full runbook. |

Do not modify application product source merely because R05 changes CI.

---

# 9. Files to MOVE

No file move is required by default.

If latest-main re-audit finds a temporary R03/R04 diagnostic workflow that belongs under evidence/archive rather than active workflows, the preferred action is removal after the owning round has completed, not moving it into another active CI location.

Any move requires explicit justification in the PR.

---

# 10. Files to REMOVE

## 10.1 Legacy gitlinks

Authoring-time default required resolution:

| Path | Reason | Replacement / migration |
|---|---|---|
| `apps/api/stripe-apps` | Unregistered mode-160000 entry causes invalid/incomplete submodule topology | Remove gitlink from FLOW unless latest-main owner-approved evidence establishes an intentional registered submodule. External `firmeen/stripe-apps` repository is untouched. |
| `apps/web/flow-ui` | Unregistered mode-160000 entry with no documented FLOW ownership/submodule contract | Remove gitlink unless latest-main owner-approved evidence establishes an intentional registered submodule. External source, if any, is untouched. |

If an owner-approved decision exists before R05 implementation to retain either as a real submodule, do **not** remove that path; instead register it correctly in `.gitmodules`, document it, and make repository topology validation pass.

A warning-suppression-only `.gitmodules` entry is prohibited.

## 10.2 Temporary round diagnostics

Remove any R03/R04 temporary diagnostic workflow that:

- was explicitly marked temporary by its owning PR/spec;
- is no longer needed after that round is merged;
- is not part of the permanent CI contract.

Do not remove permanent R03/R04 tests or quality workflows.

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

No new RLS business semantics.

R04 authorization behavior must remain unchanged and green.

## Migrations / Backfill

None expected.

R05 must not create a database migration solely for CI/repository cleanup.

If a CI optimization reveals a genuine database defect, stop and classify whether it is an R03/R04 regression or a new blocker. Do not silently patch DB semantics inside R05 without owner review.

---

# 12. Backend Changes

## Services / Domain logic

None.

## Server actions / Route handlers / API

None.

## Validation

Repository-level Node scripts are in scope:

- Phase/Round spec validation;
- repository topology validation;
- CI path-scope classification.

All must fail closed on malformed input.

## Authorization

Repository delivery authorization only.

Implementation PR authority remains based on the exact spec present on the PR **base branch**.

A PR must never gain implementation authority from a READY spec it creates only on its head.

## Idempotency / Concurrency

CI classifiers must produce deterministic output for the same changed-file set.

If workflow concurrency cancellation is introduced, the final commit of a PR must still receive complete required check results.

---

# 13. Frontend Changes

## Routes / Pages

None.

## Components

None.

## State / Data fetching

None.

## User interactions

None.

## Responsive behavior

None.

## Loading / Empty / Error states

None.

Vercel Preview must remain functional; this is deployment validation, not a UI change.

---

# 14. Authentication and Authorization

- Roles affected: `NONE` at product runtime.
- Permissions required: no new FLOW product permission.
- Route protection: unchanged.
- Backend permission enforcement: unchanged.
- Session requirements: unchanged.

Repository authorization requirements:

```text
IMPLEMENTATION PR
→ exact canonical Specification field
→ spec must exist on base branch
→ base spec must be READY
→ Phase/Round metadata must match

SPECIFICATION PR
→ canonical executable spec changes read from HEAD
→ filename + metadata validated
→ cannot include implementation surface and still be treated as spec-only
```

## 14.1 Specification PR classification contract

The final validator should distinguish at least conceptually:

```text
EXECUTABLE_SPECIFICATION_PR
SPEC_DIRECTORY_MAINTENANCE_PR
IMPLEMENTATION_PR
```

Equivalent naming is acceptable.

### Executable new spec

For every changed canonical filename matching:

```text
FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md
```

validate the HEAD content:

- Phase/Round match filename;
- Status is one of the documented allowed statuses;
- Target branch matches PR target;
- Previous and Next are canonical/allowed;
- sequencing is structurally valid;
- a `READY` new spec's Previous spec exists on base when a previous spec is required;
- the previous spec's `Next` points at the new spec when continuity can be proven from base;
- missing future Next file does not block spec creation, because `NO NEXT SPEC = STOP` is a runtime progression rule.

A non-READY spec may exist as documentation, but must never authorize an implementation PR because implementation authorization still requires READY on base.

### Amendment to an existing spec

When the same canonical spec already exists on base:

- Phase and Round identity must not change;
- target branch must not silently change;
- Previous/Next continuity must not silently become a different execution chain without explicit validator-supported amendment semantics;
- content corrections are allowed;
- status changes must remain within documented allowed statuses;
- later implementation reads the amended merged base version, not the PR head of a mixed implementation.

### Spec-directory maintenance

Changes only to README/template/non-canonical maintenance files may pass without pretending to be an executable spec.

### Mixed PR

If any implementation/runtime/workflow path is changed alongside a new head-only executable spec, classify as implementation and require authority from base.

---

# 15. Security Requirements

## 15.1 GitHub Actions permissions

Use least privilege.

Expected defaults:

```text
contents: read
pull-requests: read only where PR metadata is needed
```

Do not grant write permissions to validation jobs unless a specific reviewed requirement exists.

## 15.2 Untrusted PR execution

Do not use `pull_request_target` to execute PR-controlled scripts/code with privileged repository context.

Do not expose repository/environment secrets to untrusted PR validation.

## 15.3 External actions

Prefer official GitHub actions already used by FLOW.

Do not add an unreviewed third-party action for path filtering or repository validation when equivalent repository-owned logic is straightforward.

If action versions are upgraded, use currently supported official releases and record the version change in the PR.

## 15.4 Gitlink/submodule security

A retained submodule must have:

- explicit `.gitmodules` path;
- explicit repository URL;
- documented purpose/owner;
- deterministic checkout expectation.

Do not register an unknown/untrusted URL merely to make CI stop warning.

## 15.5 Secrets

Never commit:

- Vercel token;
- Vercel environment secret;
- database credentials;
- Supabase service/secret key;
- Stripe/Omise secret;
- Auth secret.

Deployment documentation may name variable **identifiers**, never secret values.

## 15.6 CI bypass prevention

Prohibited:

```text
continue-on-error on required validation
|| true to suppress required failures
blanket test exclusions
fake success status
renaming a failing required check to avoid protection
self-skipping when the workflow file itself changed
```

## 15.7 Retry safety

Retry only explicitly transient failure classes.

A deterministic SQL/migration/test failure must fail without being repeatedly hidden behind generic infrastructure retry noise.

---

# 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| R04 not merged | R05 implementation does not start | Wait for owner merge + required green checks. |
| New commit lands on main before R05 branch creation | Do not use stale spec-base assumption | Re-fetch main, inspect delta, branch from latest authorized state. |
| Orphan mode-160000 gitlink found | Repository Integrity fails | Remove unmanaged gitlink or register intentional submodule with owner-approved evidence. |
| `.gitmodules` entry has no matching gitlink | Repository Integrity fails | Remove stale mapping or restore intentional submodule state. |
| Gitlink external repo unavailable | Fail topology validation if retained | Prefer remove unmanaged dependency; do not invent URL. |
| Spec-only PR contains malformed canonical spec | Phase/Round Gate fails | Correct HEAD spec metadata/continuity. |
| Mixed code + head-only new spec | Treat as implementation; base authority required | Merge spec separately first. |
| Docs-only PR does not affect app/DB/deps | Stable contexts still appear; heavy steps show not-applicable | No retry needed. |
| App PR | Next Flow Quality executes full chain | Fix real failure; no skip. |
| DB PR | Supabase Database Quality executes full chain | Fix real failure; transient retry only when classified. |
| Package manifest/lock changes | Dependency Integrity runs real clean install | Fix manifest/lock inconsistency. |
| Workflow modifies itself | Corresponding real validation forced | Fix workflow until actual path passes. |
| Transient container/registry failure | Classified transient retry permitted within bounded budget | Retry bounded times; report class. |
| Deterministic migration/test failure | Fail immediately/clearly | Fix deterministic defect; do not consume transient retry budget. |
| Vercel Preview fails after R05 changes | R05 not ready to merge | Inspect deployment log/config; repair repository-caused failure or document external blocker and stop. |
| Vercel status integration unavailable | Do not fabricate success | Record BLOCKED/NOT OBSERVABLE and require owner/external verification before R05 merge if deployment evidence is required. |
| Branch protection still off | Expected during R05 | R06 activates after stable checks proven. |
| R05 accidentally regresses R02/R03/R04 quality | R05 fails | Repair before merge; do not defer regression. |

---

# 17. Dependencies

## Internal

R05 depends on:

```text
R01 governance/dependency baseline
R02 application-quality baseline
R03 fresh database baseline
R04 actor-aware database/RLS baseline
GitHub Actions workflows
repository delivery scripts
Vercel GitHub status integration
```

## External

- GitHub repository and Actions infrastructure;
- Vercel GitHub integration;
- container registry/Supabase local images only when DB workflow is actually applicable.

No new product provider dependency is authorized.

## Environment variables / secrets

No new application secret is required.

CI scope/topology validators must not require secrets.

Supabase DB quality continues using only local test URLs already present in workflow configuration.

Vercel deployment validation uses GitHub/Vercel integration status; do not add a Vercel token to repository workflow merely to query status unless separately approved.

---

# 18. Tests

## Unit

- [ ] Phase/Round validator tests still pass for all existing implementation authority cases.
- [ ] New executable spec PR with valid filename/metadata passes HEAD validation.
- [ ] New spec with filename/Phase mismatch fails.
- [ ] New spec with Round mismatch fails.
- [ ] New spec with malformed Previous fails.
- [ ] New spec with malformed Next fails.
- [ ] READY new spec with missing required previous base spec fails.
- [ ] READY new spec with previous base spec whose Next does not point to it fails when continuity is expected.
- [ ] Safe amendment preserving identity/chain passes.
- [ ] Amendment changing Phase/Round identity fails.
- [ ] Mixed head-only spec + implementation still cannot self-authorize.
- [ ] Spec-directory README/template maintenance is classified safely and does not masquerade as executable authority.
- [ ] Repository topology validator passes a normal repo with no gitlinks.
- [ ] Repository topology validator passes a correctly registered submodule fixture.
- [ ] Orphan gitlink fixture fails.
- [ ] Stale `.gitmodules` mapping fails.
- [ ] Missing submodule URL/path fails.
- [ ] CI scope classifier marks docs-only as no heavy app/db/dependency scope.
- [ ] CI scope classifier marks app change as app scope.
- [ ] CI scope classifier marks DB/server-db change as DB scope and app scope where applicable.
- [ ] Package manifest/lock change marks dependency scope.
- [ ] Each workflow's own file change marks that workflow applicable.
- [ ] Mixed changes produce union of required scopes.

## Integration

- [ ] `Phase/Round Gate` reports on an R05 implementation PR.
- [ ] `Repository Integrity` reports on an R05 implementation PR.
- [ ] `Dependency Integrity` reports a stable context even when not applicable.
- [ ] `Next Flow Quality` reports a stable context even when not applicable.
- [ ] `Supabase Database Quality` reports a stable context even when not applicable.
- [ ] A workflow self-change runs the corresponding full validation path.
- [ ] Checkout logs no longer contain inherited missing-`.gitmodules` fatal cleanup warning after topology repair.

## End-to-end

No product E2E expansion required.

Deployment-level checks:

- [ ] Vercel Preview reaches Ready on R05 implementation PR.
- [ ] After owner merge, current main Vercel status is observed and recorded.

R05 does not add product Playwright coverage merely for infrastructure cleanup.

## Authorization / RLS / Security

- [ ] R04 authorization/RLS suite remains green through Supabase Database Quality when DB workflow is applicable.
- [ ] No new GitHub workflow uses privileged untrusted PR execution.
- [ ] No new secret is committed.
- [ ] Repository validation fails closed on malformed topology/spec input.

## Failure cases

- [ ] deterministic CI failure does not become a false PASS;
- [ ] transient retry is bounded;
- [ ] docs-only path creates stable no-op PASS contexts rather than missing contexts;
- [ ] workflow self-change cannot self-skip;
- [ ] malformed spec PR cannot enter main as a blanket-authorized spec-only PR.

## Regression

- [ ] `npm ci` remains deterministic;
- [ ] Next Flow application quality remains green;
- [ ] fresh database quality remains green;
- [ ] actor-aware DB/RLS quality remains green;
- [ ] Vercel Preview/Main remain healthy;
- [ ] Phase/Round base-branch implementation authorization remains intact.

---

# 19. Validation Commands

Run commands from repository root unless noted.

The implementation agent must record actual outcomes; do not fabricate local execution that was not run.

## 19.1 Repository validators

```bash
node --test scripts/validate-phase-round-spec.test.mjs
node --test scripts/validate-repository-topology.test.mjs
node --test scripts/classify-ci-scope.test.mjs
```

If scripts were deliberately consolidated, run the equivalent committed tests and record the exact command.

## 19.2 Topology check

```bash
git ls-files --stage
```

Confirm no unregistered mode-160000 entries remain.

Run the committed topology validator:

```bash
node scripts/validate-repository-topology.mjs
```

## 19.3 Diff hygiene

```bash
git diff --check
```

## 19.4 Application baseline when triggered

From `apps/web/next-flow`:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build:next
```

The R05 PR's `Next Flow Quality` workflow is authoritative CI evidence for the committed branch state.

## 19.5 Database baseline when triggered

Use the repository's committed Supabase Database Quality workflow commands after the final R03/R04 state.

At minimum the applicable chain must still cover:

```text
local Supabase start
local reset/migrations/seed
DB SQL tests
DB lint
Kysely generation
generated type drift
DB runtime integration
```

Do not run linked/production reset, push or repair.

## 19.6 Workflow evidence

Record exact final PR statuses for:

```text
Phase/Round Gate
Repository Integrity
Dependency Integrity
Next Flow Quality
Supabase Database Quality
Vercel
```

A stable check that is not applicable must still be present and successful with clear not-applicable log evidence.

## 19.7 Post-merge evidence

After owner merge only, R05 handoff should record current main SHA and Vercel status.

Do not merge automatically just to collect evidence.

---

# 20. PR Requirements

The future **R05 implementation PR** must:

- [ ] target `main`;
- [ ] reference `FLOW_P01_R05_IMPLEMENTATION_SPEC.md`;
- [ ] declare `Phase: 01` and `Round: 05`;
- [ ] reference issue `#27`;
- [ ] identify the actual R04 implementation PR and merge SHA;
- [ ] prove R04 required checks were green before R05 started;
- [ ] state implementation base SHA and head SHA;
- [ ] list final gitlinks before/after;
- [ ] state whether each legacy gitlink was removed or intentionally registered and why;
- [ ] confirm external repositories were not deleted;
- [ ] list stable CI check names after the change;
- [ ] explain internal scope-classification behavior;
- [ ] identify any official action version changes and why;
- [ ] explain Supabase retry/service-start changes if any;
- [ ] include validator test results;
- [ ] include repository topology validation result;
- [ ] include application/database regression results as applicable;
- [ ] include Vercel Preview result;
- [ ] include current deployment root/project evidence;
- [ ] include database impact (`NONE` expected);
- [ ] include environment/secret impact (`NONE` expected);
- [ ] contain no Auth.js/product/payment/voice scope;
- [ ] keep final branch protection activation deferred to R06;
- [ ] stop for owner/manual merge;
- [ ] not enable auto-merge.

Required canonical PR metadata:

```text
Specification: FLOW_P01_R05_IMPLEMENTATION_SPEC.md
Phase: 01
Round: 05
Previous: FLOW_P01_R04_IMPLEMENTATION_SPEC.md
Previous PR: <actual R04 implementation PR>
Related Issue: #27
Next Specification: FLOW_P01_R06_IMPLEMENTATION_SPEC.md
```

Required final evidence block should include values equivalent to:

```text
PHASE: 01
ROUND: 05
SPECIFICATION: FLOW_P01_R05_IMPLEMENTATION_SPEC.md
IMPLEMENTATION_BASE_SHA: <sha>
IMPLEMENTATION_HEAD_SHA: <sha>
PREVIOUS_IMPLEMENTATION_PR: <R04 PR>
PREVIOUS_IMPLEMENTATION_MERGE_SHA: <sha>

ORPHAN_GITLINKS_BEFORE: <count>
ORPHAN_GITLINKS_AFTER: 0
REPOSITORY_INTEGRITY: PASS
SPEC_HEAD_VALIDATION: PASS
BASE_IMPLEMENTATION_AUTHORITY: PASS

PHASE_ROUND_GATE: PASS
DEPENDENCY_INTEGRITY: PASS
NEXT_FLOW_QUALITY: PASS
SUPABASE_DB_QUALITY: PASS
VERCEL_PREVIEW: PASS

MAIN_PROTECTION_CHANGED: NO
DATABASE_SCHEMA_CHANGED: NO
PRODUCTION_DB_MODIFIED: NO
AUTH_IMPLEMENTED: NO
PRODUCT_FEATURE_IMPLEMENTED: NO
AUTO_MERGE: NO
```

Do not mark R05 complete before owner merge.

---

# 21. Definition of Done

P01/R05 is complete only when every applicable requirement is proven.

## Entry gate

- [ ] R04 implementation owner-merged.
- [ ] R04 required checks green.
- [ ] R05 spec READY on latest main.
- [ ] R05 branch created from latest main after R04 merge.

## Repository topology

- [ ] all mode-160000 entries re-audited;
- [ ] no orphan gitlink remains;
- [ ] no stale `.gitmodules` mapping remains;
- [ ] any retained submodule has explicit owner-approved purpose/path/url;
- [ ] legacy unmanaged gitlinks removed by default when no approved contract exists;
- [ ] external repositories untouched;
- [ ] checkout missing-.gitmodules warning eliminated;
- [ ] Repository Integrity validator/check added and green.

## Phase/Round governance

- [ ] implementation authority still reads exact spec from base;
- [ ] new head-only spec cannot self-authorize mixed code;
- [ ] canonical executable spec PRs validate HEAD content;
- [ ] filename and metadata match;
- [ ] Previous/Next syntax/continuity checked;
- [ ] safe amendment path tested;
- [ ] spec-directory maintenance path tested;
- [ ] malformed spec-only PR fails closed.

## Stable CI contract

- [ ] `Phase/Round Gate` explicit stable context;
- [ ] `Repository Integrity` explicit stable context;
- [ ] `Dependency Integrity` explicit stable context;
- [ ] `Next Flow Quality` explicit stable context;
- [ ] `Supabase Database Quality` explicit stable context;
- [ ] these contexts appear on every PR to main as designed;
- [ ] non-applicable heavy validation produces a real successful not-applicable result rather than no status;
- [ ] workflow self-change forces corresponding full validation;
- [ ] least-privilege permissions retained;
- [ ] no `pull_request_target` privileged code execution introduced;
- [ ] no required failure masked with `continue-on-error` or equivalent.

## Retry/service hygiene

- [ ] final Supabase workflow re-audited after R03/R04;
- [ ] deterministic SQL/test failures are not blanket retried as transient;
- [ ] bounded retry exists only where justified;
- [ ] unnecessary service boot reduced if safely supported and beneficial;
- [ ] full DB quality still passes.

## Deployment

- [ ] Vercel project/root re-verified;
- [ ] expected root `apps/web/next-flow` confirmed or any owner-approved change documented;
- [ ] R05 implementation Preview is Ready;
- [ ] main deployment evidence captured after owner merge in handoff process;
- [ ] deployment runbook committed;
- [ ] repository-owned vs Vercel-console-owned settings distinguished;
- [ ] no deployment secret committed;
- [ ] no unnecessary `vercel.json`/build override introduced.

## Regression

- [ ] dependency baseline preserved;
- [ ] application quality preserved;
- [ ] database quality preserved;
- [ ] actor/RLS baseline preserved;
- [ ] no product behavior change introduced.

## Scope discipline

- [ ] no Auth.js;
- [ ] no product RBAC route implementation;
- [ ] no customer persistence;
- [ ] no realtime/kitchen/payment/voice implementation;
- [ ] no production DB mutation;
- [ ] no branch protection activation;
- [ ] no auto-merge.

Before owner merge:

```text
P01/R05 = IMPLEMENTED / WAITING FOR OWNER MERGE
```

After owner merge and final evidence:

```text
P01/R05 = COMPLETE
```

---

# 22. Handoff to Next Round

R06 must inherit a repository state with:

```text
R01 DETERMINISTIC DEPENDENCY + DELIVERY AUTHORITY
+
R02 GREEN APPLICATION BASELINE
+
R03 GREEN FRESH DATABASE BASELINE
+
R04 PROVEN ACTOR/TENANT/BRANCH DB AUTHORIZATION BASELINE
+
R05 CLEAN REPOSITORY TOPOLOGY
+
R05 HEAD-VALIDATED SPEC PR GOVERNANCE
+
R05 STABLE ALWAYS-PRESENT CI CONTEXTS
+
R05 CLEAN RETRY / CHECKOUT BEHAVIOR
+
R05 VERIFIED VERCEL DEPLOYMENT CONTRACT
+
MAIN PROTECTION STILL OFF / READY FOR R06
```

R06 owns **Full Baseline Acceptance + Main Protection Verification**.

R06 should not need to redesign CI names or repair orphan gitlinks before enabling protection.

R06 should be able to review the stable contexts created by R05 and choose/enforce the final required set.

Required next specification:

```text
FLOW_P01_R06_IMPLEMENTATION_SPEC.md
```

After R05 implementation is owner-merged, if the exact R06 spec is absent from `main`, stop.

R05 must not create R06 implementation scope automatically.

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

Legal R05 sequence:

```text
R05 SPEC MERGED TO MAIN
        ↓
WAIT FOR R03 IMPLEMENTATION OWNER MERGE IF STILL OPEN
        ↓
WAIT FOR R04 IMPLEMENTATION OWNER MERGE
        ↓
VERIFY R04 REQUIRED CHECKS GREEN
        ↓
FETCH LATEST MAIN
        ↓
READ R04 FINAL HANDOFF
        ↓
RE-AUDIT GIT TREE / GITMODULES / WORKFLOWS / VALIDATOR / VERCEL
        ↓
CREATE R05 IMPLEMENTATION BRANCH
        ↓
RESOLVE ORPHAN / AMBIGUOUS GITLINK TOPOLOGY
        ↓
ADD REPOSITORY TOPOLOGY VALIDATION
        ↓
HARDEN SPECIFICATION-PR HEAD VALIDATION
        ↓
PRESERVE BASE-BRANCH IMPLEMENTATION AUTHORITY
        ↓
ADD DETERMINISTIC CI SCOPE CLASSIFICATION
        ↓
MAKE REQUIRED CHECK CONTEXTS ALWAYS PRESENT
        ↓
MAKE WORKFLOW SELF-CHANGES FORCE REAL VALIDATION
        ↓
RE-AUDIT / CLEAN RETRY AND SUPABASE SERVICE BOOT BEHAVIOR
        ↓
VERIFY OFFICIAL ACTION RUNTIME WARNINGS
        ↓
VERIFY VERCEL PROJECT / ROOT / PREVIEW
        ↓
ADD DEPLOYMENT RUNBOOK
        ↓
RUN VALIDATOR / TOPOLOGY / SCOPE TESTS
        ↓
RUN REQUIRED APPLICATION / DATABASE REGRESSION CHECKS
        ↓
ALL R05 REQUIRED CONTEXTS PASS
        ↓
OPEN R05 IMPLEMENTATION PR
        ↓
STOP FOR OWNER REVIEW
        ↓
OWNER MANUAL MERGE
        ↓
CAPTURE FINAL MAIN + DEPLOYMENT HANDOFF
        ↓
P01/R05 COMPLETE
        ↓
VERIFY R06 SPEC
        ↓
IF ABSENT → STOP
```

Explicit prohibitions:

```text
NO R05 IMPLEMENTATION BEFORE R04 OWNER MERGE
NO DIRECT MAIN PUSH
NO AUTO-MERGE
NO PRODUCTION DB MUTATION
NO DELETING EXTERNAL REPOSITORIES
NO .GITMODULES CREATED ONLY TO SILENCE A WARNING
NO ORPHAN MODE-160000 ENTRY LEFT BEHIND
NO SPEC-ONLY BLANKET AUTHORIZATION FOR CANONICAL EXECUTABLE SPECS
NO HEAD-ONLY SPEC SELF-AUTHORIZATION
NO WORKFLOW-LEVEL PATH OMISSION THAT MAKES A REQUIRED CONTEXT DISAPPEAR
NO WORKFLOW SELF-SKIP WHEN ITS OWN FILE CHANGED
NO CONTINUE-ON-ERROR FOR REQUIRED QUALITY
NO PULL_REQUEST_TARGET EXECUTION OF UNTRUSTED PR CODE
NO SECRET IN REPO / PR / LOG
NO INVENTED VERCEL FAILURE REPAIR WHEN DEPLOYMENT IS HEALTHY
NO AUTH.JS / PRODUCT FEATURE / PAYMENT / VOICE WORK
NO MAIN BRANCH PROTECTION ACTIVATION — R06 OWNS IT
NO R06 IMPLEMENTATION WITHOUT ITS SPEC
```

Final R05 success test:

```text
R04 owner-merged and green? YES
Orphan gitlinks? NO
Repository Integrity? PASS
Checkout submodule warning? GONE
Executable spec PR HEAD validation? PASS
Implementation authority still base-only? PASS
Stable Phase/Round Gate context? YES
Stable Repository Integrity context? YES
Stable Dependency Integrity context? YES
Stable Next Flow Quality context? YES
Stable Supabase Database Quality context? YES
Docs-only PR can no-op heavy work without missing statuses? YES
Workflow self-change forces real validation? YES
Deterministic failures not blanket retried? YES
Vercel root/project verified? YES
R05 Preview Ready? YES
Deployment runbook present? YES
R02 application baseline preserved? YES
R03/R04 DB baseline preserved? YES
Main protection still deferred to R06? YES
Production DB untouched? YES
Auto-merge disabled? YES
```
