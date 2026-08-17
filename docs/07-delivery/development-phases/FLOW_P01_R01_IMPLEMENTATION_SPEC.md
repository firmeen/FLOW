# FLOW P01 R01 — Implementation Specification

## Metadata

- Phase: `01`
- Round: `01`
- Status: `READY`
- Target branch: `main`
- Previous: `NONE`
- Next: `FLOW_P01_R02_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-17 12:00 Asia/Bangkok`
- Owner approval required: `YES`
- Proposal issue: `#14`
- Specification base SHA: `744bcc05190e72a15859d50e16f2a28a2e723c85`
- Execution baseline reset: `YES`
- New execution model: `11 phases × 6 rounds = 66 merged rounds`

## 1. Phase Objective

Phase 01 establishes a trustworthy and enforceable FLOW development baseline before product development continues.

The complete six-round phase must leave the repository in a state where dependency installation, application quality checks, database bootstrap checks, Phase/Round progression, pull-request traceability, and release/deployment evidence can be trusted instead of inferred from documentation alone.

Phase 01 is a recovery and development-control phase. It does **not** implement product capabilities such as Auth.js cutover, persistent customer ordering, realtime operations, kitchen multi-station routing, Omise merchant payments, Stripe billing, customer UI redesign, or Voice Ordering.

The Phase 01 target outcome is:

```text
TRUSTED REPOSITORY BASELINE
+
DETERMINISTIC INSTALLATION
+
MACHINE-CHECKABLE PHASE/ROUND GATE
+
GREEN APPLICATION BASELINE
+
GREEN DATABASE BASELINE
+
DOCUMENTED REQUIRED CHECK CONTRACT
+
OWNER-ENFORCED MAIN-BRANCH PROTECTION
```

## 2. Phase Scope

### In scope

- Establish the new execution baseline beginning at `P01/R01` while preserving all existing implementation as the technical starting state.
- Recover deterministic Node/npm dependency installation for `apps/web/next-flow`.
- Make Phase/Round specification traceability machine-checkable for implementation pull requests.
- Establish a repository-level PR contract that requires the exact executable specification to be named.
- Define and progressively enforce required GitHub status checks for FLOW development.
- Recover the current Next.js application quality baseline in a later Phase 01 round.
- Recover fresh Supabase migration/seed/database-test/runtime baseline in later Phase 01 rounds.
- Replace stale database authorization fixtures/tests with actor-aware fixtures in later Phase 01 rounds.
- Resolve repository/CI/deployment baseline defects, including ambiguous gitlinks and current Vercel failure, in later Phase 01 rounds.
- Finish Phase 01 only after the full baseline is demonstrably green and branch-protection/ruleset requirements are verified.

### Out of scope

- Auth.js runtime implementation or authentication cutover.
- RBAC redesign beyond what is strictly required to make current baseline tests executable; final authorization work belongs to Phase 02.
- Production database persistence cutover.
- Customer QR capability implementation.
- Table session/cart/order persistence.
- Realtime or multi-device behavior.
- Kitchen multi-station routing.
- Omise/Opn merchant payment implementation.
- Stripe SaaS billing or entitlement implementation.
- Customer experience refactor or combined-cart product redesign.
- MediaRecorder, Speaches, faster-whisper, deterministic voice resolver, or Voice Ordering UX.
- CareFlow or JobFlow product implementation.
- Silent rewriting of prior merged history.

## 3. This Round Objective

P01/R01 must establish the first executable development-control gate and restore deterministic dependency installation without expanding into later recovery work.

The round must complete all of the following:

1. Re-fetch `main` before implementation and record the exact starting SHA. The expected specification base is `744bcc05190e72a15859d50e16f2a28a2e723c85`, but the implementation branch must start from the latest `main` if it has advanced after this specification is merged.
2. Read repository instructions before changing code, including `CONTRIBUTING.md`, this specification, `apps/web/next-flow/AGENTS.md`, and relevant local Next.js 16.3.0 documentation under `apps/web/next-flow/node_modules/next/dist/docs/` after dependencies are installable.
3. Restore consistency between `apps/web/next-flow/package.json` and `apps/web/next-flow/package-lock.json`.
4. Preserve the declared package intent unless a compatibility defect is proven. In particular, do not perform an Auth.js implementation or dependency redesign in this round merely because `next-auth` is present.
5. Prove that a clean `npm ci` succeeds from `apps/web/next-flow` using the committed manifest and lockfile.
6. Add a machine-checkable Phase/Round specification gate for implementation PRs targeting `main`.
7. The gate must validate that an implementation PR names one exact `FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md` file, that the referenced file exists on the PR base branch, that its metadata is structurally valid, and that its status is `READY` for implementation.
8. Prevent the specification PR bootstrap problem: specification-only PRs under `docs/07-delivery/development-phases/**` must be allowed to introduce a future executable spec before that file exists on `main`, while implementation PRs must never bypass the base-branch existence requirement.
9. Strengthen `.github/PULL_REQUEST_TEMPLATE.md` so every implementation PR explicitly records Specification, Phase, Round, related issue, previous round/PR where applicable, validation outcomes, deferred scope, and owner merge responsibility.
10. Add a narrow dependency-integrity CI check that deterministically runs `npm ci` for relevant application dependency-manifest changes and can be used as a required status check before the broader application/database baselines are recovered.
11. Preserve current failing/non-green broader checks as visible evidence. Do not disable, skip, rename deceptively, or weaken failing checks merely to make P01/R01 appear green.
12. Document the exact required-check rollout:
    - P01/R01: Phase/Round gate + dependency-integrity check are the minimum required checks for this round.
    - P01/R02: application quality is recovered and promoted to required.
    - P01/R03/R04: database quality/runtime/actor-aware security baseline is recovered and promoted to required.
    - P01/R06: the final protected-main required-check set is verified.
13. Open a focused implementation PR for P01/R01 and stop. Do not merge automatically.

## 4. Preconditions

- [x] This is the first allowed round of the new execution baseline; there is no previous new-model round PR.
- [x] This specification was authored from `main@744bcc05190e72a15859d50e16f2a28a2e723c85`.
- [x] Repository delivery rules exist in `docs/07-delivery/development-phases/README.md`.
- [x] The specification template exists at `docs/07-delivery/development-phases/FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`.
- [x] Repository contribution policy requires Issue → focused branch → PR before merge.
- [x] Proposal issue `#14` exists.
- [ ] This specification is merged into `main` before P01/R01 implementation starts.
- [ ] The implementation agent re-fetches latest `main` and branches from that exact latest commit.
- [ ] Required environment/configuration prerequisites are known; P01/R01 requires no production secrets.
- [ ] No undefined future round is required to finish this round's own scope.

If this specification is not present on `main`, implementation must stop.

## 5. Architecture Scope

### Frontend

- No product UI or route behavior changes.
- No Customer/Staff/Kitchen/Cashier/Admin redesign.
- Only incidental build/type effects from dependency-lock repair may be investigated; product changes are deferred.

### Backend

- No domain service changes.
- No Auth.js cutover.
- No server repository or persistence changes.

### Database

- No schema migration in P01/R01.
- No RLS policy change.
- No production database access or mutation.
- Existing database failures remain visible for P01/R03/R04; they must not be hidden by this round.

### Authentication / Authorization

- No change to current authentication authority in this round.
- `next-auth` lock consistency may be repaired because the dependency is already declared, but no Auth.js runtime imports/configuration/routes are to be added.
- Existing legacy auth remains transitional technical debt for Phase 02.

### API / Integrations

- No provider API integration changes.
- GitHub Actions is the only integration surface intentionally changed in this round.

### Payment

- No Stripe or Omise changes.

### Notifications

- No notification changes.

### Audit / Observability

- CI logs must clearly identify the referenced specification and validation result.
- Validation failure messages must be actionable and must not expose secrets.

### Infrastructure / CI

- Add Phase/Round validation workflow and validation logic.
- Add dependency-integrity check for clean `npm ci`.
- Update PR template.
- Define, but do not falsely claim completion of, branch protection/ruleset enforcement.
- Preserve existing `Next Flow Quality` and `Supabase Database Quality` workflows unless a minimal path-filter adjustment is strictly necessary for the new governance checks and is documented in the PR.

## 6. Existing Files and Current Behavior

| Path | Current responsibility | Required action |
|---|---|---|
| `docs/07-delivery/development-phases/README.md` | Defines naming, six-round cadence, and hard development gates. | Treat as governing source; do not weaken. Update only if implementation reveals a precise governance ambiguity that must be corrected for the machine gate. |
| `docs/07-delivery/development-phases/FLOW_PHASE_ROUND_SPEC_TEMPLATE.md` | Defines the 23-section executable specification format. | Treat as schema source. Modify only if required to make future spec validation deterministic and backward-compatible with this first spec. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Minimal Summary / Related issue / Validation template. | Expand to Phase/Round-aware traceability. |
| `.github/workflows/next-flow-quality.yml` | Runs `npm ci`, lint, typecheck, test, and `build:next` for application changes. | Preserve behavior in R01. Do not make it green by removing checks. It becomes a required protected-main check after P01/R02 recovery. |
| `.github/workflows/supabase-db-quality.yml` | Runs local Supabase bootstrap/reset/tests/lint, Kysely codegen/type drift, and DB runtime integration tests for DB-related paths including package manifests. | Preserve visibility. Do not mask known DB failures. Full recovery belongs to P01/R03/R04. |
| `apps/web/next-flow/package.json` | Application manifest; currently declares `@auth/core` `0.41.3` and `next-auth` `5.0.0-beta.32`. | Preserve declared versions unless an incompatibility is proven; synchronize lockfile. |
| `apps/web/next-flow/package-lock.json` | npm lockfile v3; root package metadata currently lacks `next-auth` and records `@auth/core` with a different range. | Regenerate/update deterministically so it exactly represents `package.json` and clean `npm ci` succeeds. |
| `apps/web/next-flow/AGENTS.md` | Requires implementation agents to read local Next.js docs due breaking changes. | Must be followed before any Next.js-source change. No content change expected. |
| `CONTRIBUTING.md` | Requires Issue → focused branch → PR before merge. | Must be followed; no content change expected. |
| `.github/CODEOWNERS` | Assigns ownership to `@firmeen`. | Preserve. Use owner review as the human approval boundary. |
| `main` branch settings | Current branch is not protected. | Owner-level enforcement is required by Phase 01; R01 must produce the exact check-name contract and owner action list without falsely claiming protection is enabled. |

## 7. Files to CREATE

The implementation may adjust exact internal script naming only if repository conventions require it, but responsibilities below are mandatory and must remain repository-local and reviewable.

| Path | Responsibility | Required contents |
|---|---|---|
| `.github/workflows/phase-round-gate.yml` | Machine-check the FLOW Phase/Round development gate on PRs targeting `main`. | PR event trigger; read-only contents/PR metadata permissions as needed; deterministic validation step; clear check/job name; no secrets; specification-only bootstrap exception; failure messages for missing/invalid/not-READY spec. |
| `.github/workflows/dependency-integrity.yml` | Provide a narrow required check for deterministic application dependency installation. | Node 22 setup, npm cache keyed by `apps/web/next-flow/package-lock.json`, `npm ci` in `apps/web/next-flow`, relevant path filters for `package.json`, `package-lock.json`, and this workflow only; no product build/test claims. |
| `scripts/validate-phase-round-spec.mjs` or an equivalently clear repository-level path | Pure validation logic used by the Phase/Round workflow. | Parse PR/spec reference; validate filename pattern; verify referenced spec exists in base checkout; validate Phase/Round/Status/Target branch/Previous/Next essentials; distinguish spec-only PR bootstrap from implementation PR; deterministic exit codes/messages; no network secret dependency if GitHub event/base checkout contains required data. |

If the implementation chooses `.github/scripts/` instead of root `scripts/`, the PR must document the reason. Do not duplicate validator logic across YAML and JavaScript.

## 8. Files to MODIFY

| Path | Current behavior | Required change |
|---|---|---|
| `apps/web/next-flow/package-lock.json` | Does not exactly represent the committed package manifest. | Synchronize with `package.json` using the repository's npm toolchain; include `next-auth@5.0.0-beta.32` and exact root metadata; accept only lock changes attributable to deterministic regeneration; investigate unexpected mass upgrades before commit. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Minimal generic PR fields. | Add `Specification`, `Phase`, `Round`, `Previous round/PR`, `Related issue`, scope summary, validation matrix, known limitations/deferred scope, database/config/env declaration, security statement, owner review/merge checkbox, and explicit `Do not auto-merge` wording. |
| `docs/07-delivery/development-phases/README.md` | Human-readable gate only. | Modify only if required to document exact machine-gate PR metadata or rollout of required checks. Do not change six-round or no-spec/no-merge semantics. |
| `docs/07-delivery/development-phases/FLOW_PHASE_ROUND_SPEC_TEMPLATE.md` | Human-readable template. | Modify only if machine validation requires an explicit unambiguous field that cannot be reliably parsed from the current format. Keep existing sections and continuation semantics. |

`apps/web/next-flow/package.json` must **not** be changed merely to make the lockfile easier to regenerate. A manifest change requires a documented compatibility reason and owner-visible PR note.

## 9. Files to MOVE

No file move is required in P01/R01.

If implementation discovers that a validator location violates an existing repository convention, choose the final location before commit rather than creating-and-moving multiple copies.

## 10. Files to REMOVE

No file removal is required in P01/R01.

Do not remove:

- `next-auth` from the manifest merely to restore `npm ci`;
- `@auth/core` merely because `next-auth` exists;
- existing quality workflows;
- existing failing checks;
- legacy authentication source;
- database migrations/tests.

Those decisions belong to their owning later rounds/phases.

## 11. Database Changes

### Tables

- None.

### Columns

- None.

### Constraints

- None.

### Indexes

- None.

### RLS / Tenant isolation

- No policy changes.
- Do not weaken RLS to make CI pass.

### Migrations / Backfill

- No migration.
- No backfill.
- No remote Supabase mutation.

## 12. Backend Changes

### Services / Domain logic

- None.

### Server actions / Route handlers / API

- None.

### Validation

The new Phase/Round validator must fail closed for implementation PRs.

Minimum validation contract:

1. Identify whether the PR is specification-only or implementation-affecting.
2. Specification-only means the diff is limited to the controlled specification directory and documentation necessary to define a future round; it must not be treated as implementation permission.
3. For implementation PRs, read one exact specification filename from a canonical PR-body field, recommended:

```text
Specification: FLOW_P01_R01_IMPLEMENTATION_SPEC.md
```

4. Filename must match:

```text
^FLOW_P\d{2}_R\d{2}_IMPLEMENTATION_SPEC\.md$
```

5. Round number must be `01` through `06`.
6. Referenced spec must exist in `docs/07-delivery/development-phases/` on the PR base branch, not only on the implementation head branch.
7. Spec must contain matching `Phase`, `Round`, `Status: READY`, and `Target branch: main` metadata.
8. The PR-declared Phase/Round must match the referenced filename and metadata.
9. Missing, ambiguous, duplicate, malformed, non-READY, or head-only references fail the gate.
10. Validation output must name the exact corrective action.

### Authorization

- GitHub workflow permissions must be least privilege.
- Do not grant repository write permission to validation workflows.

### Idempotency / Concurrency

- Re-running the validator on the same PR event must produce the same result for the same base/head/body state.
- No generated mutable state or external database is permitted for the validator.

## 13. Frontend Changes

### Routes / Pages

- None.

### Components

- None.

### State / Data fetching

- None.

### User interactions

- None.

### Responsive behavior

- Not applicable.

### Loading / Empty / Error states

- Not applicable to product UI.
- CI validation errors must be explicit and concise.

## 14. Authentication and Authorization

- Roles affected: `NONE` at application runtime.
- Permissions required: GitHub workflow read permissions only; owner remains the merge authority.
- Route protection: unchanged.
- Backend permission enforcement: unchanged.
- Session requirements: unchanged.

P01/R01 must not claim Auth.js or RBAC progress beyond deterministic dependency installation.

## 15. Security Requirements

- No production secret may be added to repository files, PR body, CI output, or tests.
- New workflows must use least-privilege GitHub permissions.
- Workflow code must not execute arbitrary PR-provided shell fragments.
- The specification reference must be treated as data and validated against a strict filename pattern; do not concatenate unchecked input into shell commands or file paths.
- Reject path traversal such as `../`, absolute paths, URL references, or alternate directories.
- Resolve the authoritative specification from the PR base checkout to prevent an implementation PR from granting itself permission by adding/modifying its own READY spec on the head branch.
- A specification-only PR may introduce a new spec, but must not include application, database, workflow-implementation, or product code changes under the bootstrap exception.
- Do not weaken current application/database security checks to obtain a green status.
- No tenant/customer/payment data is involved in this round.
- Dependency-lock regeneration must not introduce unreviewed lifecycle scripts or package-source changes; review lockfile `resolved`/integrity changes when they appear.
- Do not run `npm audit fix --force` or uncontrolled mass dependency upgrades as part of lock repair.

## 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| Latest `main` differs from specification base SHA | Stop assuming old SHA; record new base and inspect intervening changes before implementation. | Rebase implementation plan on latest `main`; do not rewrite this spec unless scope materially changed. |
| `npm ci` fails because manifest/lock are inconsistent | P01/R01 is blocked until deterministic lock repair is complete. | Regenerate lock with the repository npm version, inspect diff, retry from a clean install context. |
| Lock regeneration produces broad unrelated dependency churn | Do not commit blindly. | Determine npm/version/config cause; reproduce with Node 22/npm used in CI; minimize to attributable changes. |
| Phase/Round validator cannot find `Specification:` | Gate fails. | Add exact canonical field to PR body. |
| Referenced spec exists only on implementation head | Gate fails. | Merge the specification PR to `main` first, then update/rebase implementation PR. |
| Referenced spec is `DRAFT`, `BLOCKED`, or `COMPLETE` | Gate fails for new implementation. | Owner publishes/merges a `READY` spec or corrects workflow sequencing through a separate spec PR. |
| PR tries to mix new spec bootstrap with implementation code | Gate fails. | Split into specification PR and later implementation PR. |
| Existing `Next Flow Quality` fails after `npm ci` begins succeeding | Do not hide or disable the failure. R01 records the first real blocker for P01/R02. | Open/prepare P01/R02 spec after R01 is merged; R02 owns broader app baseline recovery. |
| Existing `Supabase Database Quality` fails | Do not weaken migrations/tests. | Record exact failure; P01/R03/R04 own database recovery. |
| Branch protection cannot be enabled due repository/account capability | Do not claim enforcement. | Mark owner action/blocker explicitly; Phase 01 cannot be declared fully complete until an equivalent enforceable ruleset exists. |
| GitHub Actions transient infrastructure failure | Preserve distinction between infra failure and deterministic code failure. | Re-run only after confirming the failure is transient; do not modify code to hide infrastructure issues. |

## 17. Dependencies

### Internal

- `CONTRIBUTING.md`
- `.github/CODEOWNERS`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/next-flow-quality.yml`
- `.github/workflows/supabase-db-quality.yml`
- `docs/07-delivery/development-phases/README.md`
- `docs/07-delivery/development-phases/FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`
- `apps/web/next-flow/package.json`
- `apps/web/next-flow/package-lock.json`
- `apps/web/next-flow/AGENTS.md`

### External

- GitHub Actions.
- Node.js 22 as currently configured by repository CI.
- npm lockfile v3/tooling compatible with the repository's Node 22 CI environment.

No new product/runtime external service is allowed.

### Environment variables / secrets

- None required for the Phase/Round validator.
- None required for dependency-integrity `npm ci`.
- `GITHUB_TOKEN` may be used only with the minimum automatic permissions GitHub provides if event metadata cannot be obtained from the checked-out event payload; prefer event payload/base checkout over extra API calls.
- No `DATABASE_URL`, Supabase secret, Stripe secret, Omise secret, Auth secret, or production environment variable may be required.

## 18. Tests

### Unit

- [ ] Validator accepts a valid P01/R01 implementation PR fixture referencing a READY base-branch spec.
- [ ] Validator rejects malformed filenames.
- [ ] Validator rejects round numbers outside R01–R06.
- [ ] Validator rejects Phase/Round metadata mismatch.
- [ ] Validator rejects status other than READY for implementation.
- [ ] Validator rejects path traversal and alternate-path references.
- [ ] Validator rejects an implementation PR whose spec exists only on head.
- [ ] Validator allows a true specification-only PR bootstrap without granting implementation permission.
- [ ] Validator rejects a mixed spec-bootstrap + implementation PR.

If the validator is sufficiently small and is tested directly in workflow fixtures instead of the application Vitest suite, the PR must document the chosen test mechanism and why it is deterministic.

### Integration

- [ ] Clean `npm ci` succeeds in `apps/web/next-flow` from committed files.
- [ ] GitHub workflow syntax is valid.
- [ ] Phase/Round workflow runs on a representative implementation-affecting PR path.
- [ ] Dependency-integrity workflow runs when `package.json` or `package-lock.json` changes.

### End-to-end

- [ ] No product E2E change is required.
- [ ] Governance E2E is demonstrated through PR check evidence: this P01/R01 implementation PR references the merged spec and passes the new Phase/Round gate.

### Authorization / RLS / Security

- [ ] No database/RLS change.
- [ ] Workflow permissions reviewed for least privilege.
- [ ] Base-branch specification lookup prevents self-authorizing implementation PRs.
- [ ] No secrets in files or workflow logs.

### Failure cases

- [ ] Missing specification reference produces a failing check with an actionable message.
- [ ] Nonexistent base spec produces a failing check.
- [ ] DRAFT/BLOCKED/COMPLETE spec produces a failing implementation check.
- [ ] Mixed spec + implementation bootstrap attempt fails.
- [ ] Unexpected lockfile churn is reviewed before commit.

### Regression

- [ ] Existing `next-flow-quality.yml` checks are not removed or weakened.
- [ ] Existing `supabase-db-quality.yml` checks are not removed or weakened.
- [ ] Existing Phase/Round README gate semantics are preserved.
- [ ] Existing application source, database schema, auth runtime, payment runtime, and customer workflow behavior are unchanged by this round.

## 19. Validation Commands

Run only commands that exist for the repository/application and record actual outcomes in the implementation PR.

From `apps/web/next-flow`:

```bash
# hard P01/R01 dependency gate
npm ci

# existing application checks — run and record actual outcomes;
# failures after installation are inherited evidence for P01/R02 unless caused by R01 changes
npm run lint
npm run typecheck
npm run test
npm run build:next
```

Repository-level validation for the new validator/workflows must use the actual script command introduced by the implementation. If implemented as a direct Node script, include representative fixture invocations in the PR, for example conceptually:

```bash
node scripts/validate-phase-round-spec.mjs <test-fixture-or-documented-input>
```

Do not fabricate output. Record pass/fail exactly.

The implementation PR must separately distinguish:

```text
REQUIRED P01/R01 CHECKS
- Phase/Round Gate
- Dependency Integrity

OBSERVED BUT NOT YET PROMOTED TO REQUIRED
- Next Flow Quality (promotion target: P01/R02)
- Supabase Database Quality (promotion target: P01/R03/R04)
- Vercel/deployment status (production baseline recovery target: later Phase 01 round)
```

## 20. PR Requirements

The P01/R01 implementation PR must:

- [ ] Target `main`.
- [ ] Branch from the latest `main` after this specification is merged.
- [ ] Reference `FLOW_P01_R01_IMPLEMENTATION_SPEC.md` exactly.
- [ ] Reference issue `#14` or the implementation issue derived from it according to repository workflow.
- [ ] Declare `Phase: 01` and `Round: 01` in the PR body.
- [ ] Contain only P01/R01 scope.
- [ ] Explain every package-lock change and whether `package.json` changed.
- [ ] Explain all workflow files created/modified and their GitHub permissions.
- [ ] Include actual `npm ci` evidence.
- [ ] Include actual validator positive/negative test evidence.
- [ ] Report outcomes of existing application/database checks without hiding failures.
- [ ] Identify the exact first inherited application blocker, if one remains after `npm ci`.
- [ ] Identify the exact inherited database blocker, if the DB workflow runs.
- [ ] State that no production database was modified.
- [ ] State that no auth/persistence/payment/realtime/kitchen/customer/voice feature was implemented.
- [ ] State the owner action needed for branch protection/ruleset and list the exact check names observed in GitHub.
- [ ] Pass the P01/R01 required checks before merge.
- [ ] Remain open for owner review; do not enable auto-merge.
- [ ] Be merged by the owner before P01/R02 development may start.

Recommended implementation PR title:

```text
chore(delivery): enforce P01 R01 specification and dependency gate
```

## 21. Definition of Done

P01/R01 is complete only when all required statements below are true:

- [ ] The implementation branch started from latest `main` after this spec was merged.
- [ ] `apps/web/next-flow/package.json` and `package-lock.json` are synchronized.
- [ ] A clean `npm ci` succeeds in CI and is reproducible locally/agent-side where tooling permits.
- [ ] No uncontrolled dependency upgrade was introduced.
- [ ] A machine-checkable Phase/Round gate exists.
- [ ] The gate requires implementation PRs to reference an exact READY specification that already exists on the base branch.
- [ ] Specification-only bootstrap PRs are supported without allowing mixed implementation changes.
- [ ] PR template contains explicit specification/phase/round traceability.
- [ ] A narrow Dependency Integrity check exists and passes.
- [ ] Existing broader quality workflows were not weakened to obtain green status.
- [ ] Actual Next Flow Quality outcome is recorded.
- [ ] Actual Supabase Database Quality outcome is recorded if triggered.
- [ ] Exact required-check names and branch-protection owner action are documented.
- [ ] No production DB, secret, Auth.js runtime, business persistence, payment, realtime, kitchen, customer redesign, or voice scope was changed.
- [ ] Required P01/R01 checks pass.
- [ ] Implementation PR is ready for owner review and manual merge.

P01/R01 is **not** complete merely because a PR was opened or because `npm ci` works. The governance gate itself must be implemented and demonstrated.

## 22. Handoff to Next Round

### Completed state

P01/R02 should inherit:

- deterministic application dependency installation;
- a synchronized manifest/lockfile;
- a merged READY-spec enforcement mechanism for implementation PRs;
- a Phase/Round-aware PR template;
- a passing narrow Dependency Integrity check;
- exact observed check names for branch-protection/ruleset configuration;
- an evidence-based list of the remaining application-quality failures reached after `npm ci` succeeds.

### Known follow-up

P01/R02 owns application-quality recovery, not P01/R01.

Expected follow-up includes, based on actual R01 evidence rather than assumptions:

- repair all deterministic lint/typecheck/unit/integration/build failures present on the inherited main baseline;
- make `Next Flow Quality` green;
- promote the exact green application check context to the required protected-main set;
- continue to avoid database/Auth/product scope unless required to fix a regression directly caused by baseline inconsistency.

Database fresh-bootstrap recovery remains deferred to P01/R03 and actor-aware DB/security test recovery to P01/R04.

### Required next specification

```text
FLOW_P01_R02_IMPLEMENTATION_SPEC.md
```

The next file is intentionally not created by this specification. After the P01/R01 implementation PR is merged, if `FLOW_P01_R02_IMPLEMENTATION_SPEC.md` is not present on `main`, development must stop and notify the owner.

## 23. Development Gate

```text
NO SPEC = NO DEVELOPMENT
NO MERGE = NO NEXT ROUND
FAILED REQUIRED CI = NO NEXT ROUND
6 MERGED ROUNDS = PHASE COMPLETE
NO NEXT PHASE SPEC = STOP
```

Additional P01/R01 enforcement rules:

```text
SPEC PR FIRST
→ MERGE SPEC TO MAIN
→ CREATE IMPLEMENTATION BRANCH FROM LATEST MAIN
→ IMPLEMENT ONLY THE NAMED ROUND
→ OPEN IMPLEMENTATION PR
→ REQUIRED ROUND CHECKS GREEN
→ OWNER REVIEW / MANUAL MERGE
→ VERIFY EXACT NEXT SPEC EXISTS ON MAIN
→ OTHERWISE STOP
```

The previous 12-phase execution numbering is historical architecture/delivery context only. It must not be used as permission to skip or infer any new Phase/Round.

The existing code on `main` is the technical starting state and must be preserved unless this or a later executable specification explicitly requires a change.

Before P01/R02 begins, verify that the exact file named in `Next` exists on `main`. If it does not exist, stop and notify the owner. Do not infer, generate, or execute P01/R02 scope automatically.
