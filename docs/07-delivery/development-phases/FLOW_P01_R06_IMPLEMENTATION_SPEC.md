# FLOW P01 R06 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 06 — Full Baseline Acceptance + Main Protection Verification

---

## Metadata

- Phase: `01`
- Round: `06`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Target branch: `main`
- Previous: `FLOW_P01_R05_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R01_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-20 04:00 Asia/Bangkok`
- Owner approval required: `YES`
- Automatic merge allowed: `NO`
- Proposal issue: `#29`
- Specification base SHA: `65e1781f8a5fcc48a48282f33286576188529362`
- Previous specification PR at authoring time: `#28 — OPEN / NOT MERGED`
- Previous implementation PR: `PENDING — resolve final R05 implementation PR before R06 implementation`
- Previous implementation merge SHA: `PENDING — R05 must be owner-merged first`
- Required inherited checks: `resolve exact final stable contexts from R05; do not trust authoring-time names blindly`
- Current authoring evidence: `main@65e1781f8a5fcc48a48282f33286576188529362`, merged PR #25, open R05 spec PR #28, draft R03 implementation PR #26, current branch protection OFF, current Vercel main status PASS`
- Current planning scope: `PHASE 01 / ROUND 06 ONLY`
- Recommended implementation branch: `phase/01-round/06-full-baseline-acceptance`
- Recommended implementation PR title: `chore(platform): complete P01 R06 baseline acceptance and main protection`

---

## Execution Authority Statement

This is the final executable specification for Phase 01.

This file may be reviewed or merged before R05 implementation is complete, but its presence on `main` does **not** authorize R06 implementation early.

R06 implementation is legal only when all of the following are simultaneously true on the latest `main`:

```text
FLOW_P01_R06_IMPLEMENTATION_SPEC.md EXISTS
+
STATUS = READY
+
FLOW_P01_R05_IMPLEMENTATION_SPEC.md EXISTS
+
P01/R05 IMPLEMENTATION PR IS OWNER-MERGED
+
P01/R05 REQUIRED CHECKS PASSED
+
R01-R05 FINAL HANDOFF EVIDENCE IS AVAILABLE
+
LATEST MAIN HAS BEEN FETCHED
+
CURRENT MAIN BRANCH PROTECTION STATE HAS BEEN RE-READ
+
CURRENT STABLE CI CONTEXTS HAVE BEEN RE-DISCOVERED
```

If R05 is missing, open, draft, red, unmerged, missing final evidence, or still contains unresolved mandatory scope, R06 implementation must stop.

R06 must not repair a missing R05 outcome merely to make Phase 01 appear complete.

If an R05-owned blocker remains, the correct action is:

```text
STOP R06
→ RETURN THE BLOCKER TO R05 OWNERSHIP
→ COMPLETE / CORRECT R05
→ OWNER MERGE
→ RE-AUDIT
→ ONLY THEN RESUME R06
```

R06 is an **acceptance and enforcement round**, not another broad recovery round.

---

# 1. Phase Objective

Phase 01 exists to transform FLOW development from a partially documented process into a trustworthy, repeatable and enforceable development baseline.

The complete Phase 01 target is:

```text
TRUSTED REPOSITORY BASELINE
+
DETERMINISTIC DEPENDENCY INSTALLATION
+
MACHINE-CHECKABLE PHASE/ROUND AUTHORIZATION
+
GREEN APPLICATION QUALITY
+
GREEN FRESH DATABASE QUALITY
+
PROVEN ACTOR/TENANT/BRANCH DATABASE AUTHORIZATION BASELINE
+
CLEAN REPOSITORY TOPOLOGY
+
STABLE ALWAYS-PRESENT CI CONTEXTS
+
TRUTHFUL DEPLOYMENT CONTRACT
+
OWNER-CONTROLLED PROTECTED MAIN MERGE PATH
```

The six-round responsibility chain is:

```text
P01/R01
Delivery Gate Bootstrap
+
Deterministic Dependency Integrity

P01/R02
Application Quality Baseline Recovery

P01/R03
Fresh Database Bootstrap
+
Structural Database Quality Recovery

P01/R04
Actor-Aware Database / RLS Authorization Baseline Recovery

P01/R05
Repository / CI / Deployment Baseline Recovery

P01/R06
Full Baseline Acceptance
+
Main Protection Verification
```

R06 must prove that the outputs of R01-R05 are not merely isolated successful PRs but form one coherent baseline that can safely support the next product architecture phase.

R06 is the only round allowed to declare Phase 01 complete.

That declaration is legal only after:

```text
ALL SIX IMPLEMENTATION ROUNDS OWNER-MERGED
+
ALL MANDATORY PHASE 01 ACCEPTANCE CRITERIA PROVEN
+
MAIN PROTECTION ENABLED AND VERIFIED
+
R06 IMPLEMENTATION MERGED THROUGH THE PROTECTED PATH
+
POST-MERGE MAIN / DEPLOYMENT EVIDENCE VERIFIED
```

A green R06 specification PR does not complete Phase 01.

A green R06 implementation PR does not complete Phase 01 before owner merge.

A branch protection checklist written in Markdown does not complete Phase 01 unless the actual GitHub branch state is re-fetched and verified.

---

# 2. Phase Scope

## 2.1 R06 In Scope

R06 owns only the final cumulative acceptance and main-protection enforcement surface.

### Cumulative Phase 01 evidence audit

R06 must:

- re-fetch latest `main` after R05 owner merge;
- read all executable Phase 01 specifications R01-R06;
- read final implementation PRs and handoffs for R01-R05;
- resolve exact implementation PR numbers and merge SHAs for R01-R05;
- resolve exact required-check results for each completed round;
- verify no required scope was silently deferred to a later phase;
- verify every inherited failure was either repaired by its owning Phase 01 round or explicitly classified as non-blocking/out-of-phase;
- verify that R01-R05 cumulative evidence matches the original Phase 01 objective;
- fail closed if historical evidence is contradictory or incomplete.

### Final repository baseline acceptance

R06 must verify the final `main` repository state after R05 includes, where applicable:

- deterministic dependency state;
- Phase/Round implementation authorization;
- executable-spec PR validation;
- application quality baseline;
- fresh database bootstrap baseline;
- generated database type consistency;
- actor-aware database/RLS test baseline;
- clean repository topology;
- repository integrity validation;
- stable CI context names;
- deterministic CI scope classification;
- clean transient-vs-deterministic retry behavior;
- deployment runbook/evidence;
- no surviving temporary diagnostic workflow or accidental round artifact.

### Phase 01 acceptance record

R06 should create a durable non-executable acceptance artifact:

```text
docs/07-delivery/development-phases/FLOW_P01_ACCEPTANCE.md
```

The acceptance artifact must not masquerade as an executable round specification.

It must record:

- Phase ID;
- acceptance date/time;
- current acceptance base SHA;
- R01-R05 implementation PR numbers;
- R01-R05 merge SHAs;
- R06 implementation PR number and pre-merge head SHA;
- exact stable required-check names used by R06;
- per-round mandatory check results;
- final repository topology result;
- final application quality result;
- final database quality result;
- final actor/RLS result;
- Vercel/deployment evidence;
- branch protection state before R06;
- target branch protection contract;
- verified branch protection state before R06 merge;
- statement that the final R06 merge SHA is the `main` merge commit introducing the acceptance record and must be cited in the post-merge handoff;
- known non-blocking follow-up items;
- explicit Phase 02 stop/continue condition.

Historical R01-R05 spec files must not be rewritten merely to change `Status: READY` to cosmetic `COMPLETE` values unless there is a separate machine-contract reason that has been proven safe.

Implementation completion is determined from merged implementation PR evidence, not by rewriting historical authorization documents after the fact.

### Main protection contract

R06 owns activation and verification of the final `main` protection/ruleset contract.

The final mechanism may be classic branch protection or a GitHub ruleset, but the effective behavior must be equivalent to this specification.

R06 must verify actual external GitHub state rather than assuming repository documentation changed the platform setting.

### Main-protection runbook

If no equivalent document exists after R05, R06 should create:

```text
docs/08-operations/main-branch-protection.md
```

The document must define:

- target protected branch;
- expected required checks;
- owner/admin enforcement expectation;
- pull-request requirement;
- branch freshness expectation;
- force-push/deletion policy;
- review-policy compatibility with current contributor model;
- how to inspect protection state;
- how to recover from accidental misconfiguration without bypassing required evidence;
- how to update the required-check set in a future reviewed round;
- the difference between repository files and GitHub-hosted external settings.

### Protected merge proof

R06 must use its own implementation PR as the first Phase 01 acceptance proof that the final protection contract works.

The intended sequence is:

```text
R06 IMPLEMENTATION PR OPEN
+
R06 REQUIRED CHECKS GREEN
+
BRANCH UP TO DATE
↓
ENABLE / APPLY MAIN PROTECTION
↓
RE-FETCH MAIN PROTECTION
↓
VERIFY REQUIRED CONTRACT
↓
VERIFY R06 PR REMAINS LEGALLY MERGEABLE
↓
OWNER MANUAL MERGE THROUGH PROTECTED PATH
↓
RE-FETCH MAIN
↓
VERIFY R06 MERGE LANDED
↓
VERIFY MAIN REMAINS PROTECTED
↓
VERIFY MAIN DEPLOYMENT EVIDENCE
↓
PHASE 01 COMPLETE
```

## 2.2 R06 Explicitly Out of Scope

R06 must not implement or redesign:

- Auth.js;
- Credentials provider;
- OAuth;
- product RBAC route authorization;
- application command authorization;
- customer QR capability;
- customer table/session persistence;
- cart persistence;
- order persistence;
- realtime synchronization;
- service-request product behavior;
- kitchen redesign or multi-station routing;
- Omise/Opn merchant payment runtime;
- Stripe SaaS Billing runtime;
- customer UX redesign;
- Voice Ordering;
- CareFlow implementation;
- JobFlow implementation;
- production database changes;
- dependency modernization;
- broad CI redesign that R05 should already have completed;
- gitlink/submodule cleanup that R05 should already have completed;
- new deployment architecture;
- merge queue rollout;
- mandatory signed-commit rollout;
- mandatory linear-history rollout;
- mandatory MFA/step-up auth;
- automatic Phase 02 implementation.

If any R05-owned baseline requirement is still broken, R06 must stop rather than absorb it.

## 2.3 R06 Boundary Versus Phase 02

R06 establishes a trustworthy development substrate.

It does not begin the next product architecture phase.

The legal boundary is:

```text
R06 COMPLETE
+
FLOW_P02_R01_IMPLEMENTATION_SPEC.md EXISTS ON MAIN
+
STATUS = READY
→ P02/R01 MAY BE EVALUATED
```

If the exact P02/R01 file is absent:

```text
PHASE 01 = COMPLETE
NEXT IMPLEMENTATION = STOP
```

---

# 3. This Round Objective

P01/R06 must perform a final cumulative acceptance of Phase 01 and convert the stable R05 repository/CI contract into an enforced `main` merge path.

R06 must leave the repository able to answer all of the following from current GitHub/repository evidence:

```text
Were all six Phase 01 rounds governed by executable specifications?
YES

Were R01-R05 implementation PRs owner-merged before R06 began?
YES

Is dependency installation deterministic?
YES

Is application lint/typecheck/test/build baseline green?
YES

Can fresh Supabase bootstrap, migrate, seed, test, lint and type generation complete?
YES

Are actor-aware tenant/branch authorization tests based on real synthetic users/memberships?
YES

Is repository topology free from orphan gitlinks?
YES

Can executable spec PRs no longer bypass validation merely by living under the spec directory?
YES

Are stable repository-owned CI contexts present on every PR to main?
YES

Can expensive checks report NOT APPLICABLE without disappearing?
YES

Is Vercel/deployment state understood and currently healthy?
YES

Is main protected?
YES

Are direct unreviewed main changes prevented by the configured protection contract?
YES

Are required checks enforced for administrators/owner as supported by GitHub?
YES

Are force pushes disabled?
YES

Is branch deletion disabled?
YES

Can the current owner still legally merge a compliant PR without an impossible self-review requirement?
YES

Was the R06 implementation PR merged through the protected path rather than by bypass?
YES

Does main remain protected after R06 merge?
YES

Is Phase 02 blocked when its exact R01 spec is absent?
YES
```

R06 is complete only when these answers are backed by evidence, not assumptions.

---

# 4. Preconditions

Before any R06 implementation file is changed:

- [ ] `FLOW_P01_R06_IMPLEMENTATION_SPEC.md` exists on latest `main`.
- [ ] R06 spec status is `READY`.
- [ ] `FLOW_P01_R05_IMPLEMENTATION_SPEC.md` exists on latest `main`.
- [ ] R05 implementation PR is owner-merged.
- [ ] R05 required checks passed.
- [ ] R05 final handoff has been read.
- [ ] Latest `main` SHA has been fetched after R05 merge.
- [ ] R01-R05 implementation PR numbers and merge SHAs can be resolved.
- [ ] Current Git tree has been re-audited.
- [ ] Current workflows have been re-audited.
- [ ] Current Phase/Round validator has been re-audited.
- [ ] Current deployment runbook/evidence has been re-audited.
- [ ] Current `main` branch protection/ruleset state has been fetched.
- [ ] Current repository-owned stable CI contexts have been observed on an actual PR after R05.
- [ ] Current GitHub account/repository capability is sufficient to enforce an equivalent protection contract, or an owner manual action path is available.
- [ ] No unresolved R05-owned mandatory blocker exists.

If any mandatory precondition is false:

```text
R06 = BLOCKED
```

Do not downgrade the condition to a warning merely because this is the final round.

---

# 5. Architecture Scope

## Frontend

No product frontend change is intended.

R06 may not alter customer, staff, kitchen, cashier, owner or management UI merely to create a Phase 01 completion diff.

## Backend

No product backend/domain behavior change is intended.

## Database

No schema, migration, seed, RLS, permission model or production database change is intended.

R06 validates inherited database evidence only.

## Authentication / Authorization

No Auth.js or product authorization implementation.

The authorization surface owned by R06 is **repository merge authorization**, not application-user authorization.

## API / Integrations

No new product API.

GitHub-hosted branch protection/ruleset state is an external repository-control integration and must be verified through an available GitHub API/connector or owner UI followed by a read-back verification.

## Payment

No payment change.

## Notifications

No notification change.

## Audit / Observability

R06 must create durable acceptance evidence and record exact check/protection/deployment state.

## Infrastructure / CI

R06 owns final verification of the stable R05 CI contract and activation/verification of `main` protection.

R06 should not rename or redesign stable R05 checks unless a narrow deterministic acceptance blocker proves R05 incomplete.

If such a blocker exists, return it to R05 rather than hiding it in R06.

---

# 6. Existing Files and Current Behavior

The implementation agent must re-fetch these paths from latest `main` after R05 merge rather than relying on authoring-time snapshots.

| Path / external state | Current/expected responsibility | R06 required action |
|---|---|---|
| `docs/07-delivery/development-phases/README.md` | Phase/round progression and hard gates | Verify six-round/final-next-phase contract; update only if acceptance-record rules need durable clarification |
| `FLOW_P01_R01_IMPLEMENTATION_SPEC.md` | R01 authority | Read; resolve final implementation evidence; do not rewrite cosmetically |
| `FLOW_P01_R02_IMPLEMENTATION_SPEC.md` | R02 authority | Read; resolve final implementation evidence; do not rewrite cosmetically |
| `FLOW_P01_R03_IMPLEMENTATION_SPEC.md` | R03 authority | Read corrected boundary; resolve final implementation evidence |
| `FLOW_P01_R04_IMPLEMENTATION_SPEC.md` | R04 authority | Read actor/RLS acceptance contract; resolve final implementation evidence |
| `FLOW_P01_R05_IMPLEMENTATION_SPEC.md` | R05 authority | Must be on main before R06 implementation; read final repository/CI/deployment handoff |
| `FLOW_P01_R06_IMPLEMENTATION_SPEC.md` | R06 authority | Must be READY on main |
| `.github/PULL_REQUEST_TEMPLATE.md` | implementation evidence contract | Verify final template reflects stable checks/protection evidence; modify only if R05 left a narrow acceptance gap |
| `.github/CODEOWNERS` | current ownership hint | Re-read contributor/reviewer reality before configuring review requirements |
| `.github/workflows/phase-round-gate.yml` | implementation/spec authority check | Verify stable always-present context and R05 hardening |
| `.github/workflows/dependency-integrity.yml` | deterministic dependency context | Verify stable always-present context and full-vs-N/A classification |
| `.github/workflows/next-flow-quality.yml` | application quality context | Verify stable always-present context and full-vs-N/A classification |
| `.github/workflows/supabase-db-quality.yml` | DB quality context | Verify stable always-present context, post-R03/R04 behavior and clean retry classification |
| repository-integrity workflow/script from R05 | repository topology/check contract | Verify present and green |
| `scripts/validate-phase-round-spec.mjs` | machine authorization | Verify spec HEAD validation + implementation base authority |
| validator tests | regression proof | Run/observe pass |
| repository topology validator/tests | gitlink/submodule proof | Run/observe pass |
| `docs/08-operations/deployment.md` or R05 equivalent | deployment contract | Verify exists and matches current Vercel evidence |
| GitHub `main` branch protection / ruleset | external merge enforcement | Currently authoring-time OFF; R06 must activate and verify final contract |
| Vercel status | deployment evidence | Verify current R06 Preview and post-merge main deployment |

Authoring-time evidence is not implementation-time authority.

---

# 7. Files to CREATE

R06 implementation should create only the minimum durable acceptance/governance artifacts needed after re-audit.

## Required unless an equivalent file already exists

### `docs/07-delivery/development-phases/FLOW_P01_ACCEPTANCE.md`

Purpose:

- durable cumulative Phase 01 acceptance record;
- actual implementation PR/merge evidence;
- exact stable check contract;
- final branch-protection contract;
- final deployment evidence;
- explicit next-phase gate.

The file must be clearly marked **NON-EXECUTABLE ACCEPTANCE RECORD**.

It must not match the executable spec filename regex.

### `docs/08-operations/main-branch-protection.md`

Purpose:

- document expected external GitHub protection settings;
- document verification/read-back procedure;
- document recovery from accidental settings drift;
- explain owner action when automation lacks branch-protection write capability.

If R05 has already created an equivalent branch-protection runbook, modify that single canonical file instead of creating a duplicate.

## Optional only when proven necessary

A small acceptance validator/test may be created only if a concrete machine-checkable gap remains after R05.

Do not create a second repository governance framework in R06.

---

# 8. Files to MODIFY

R06 may modify only narrowly justified governance/acceptance documentation by default.

Possible modifications:

| Path | Allowed R06 change |
|---|---|
| `docs/07-delivery/development-phases/README.md` | document Phase acceptance evidence convention or protected-main handoff if absent |
| `.github/PULL_REQUEST_TEMPLATE.md` | add final stable check/protection fields only if R05 did not already make the evidence contract sufficient |
| existing repository/operations governance doc | record final protection/check contract without duplicating documentation |

R06 should **not** modify application, database or workflows simply to force CI.

If a workflow is defective at R06 entry, classify it as an R05 acceptance failure and stop.

## Exact rule for R05-owned defects

If R06 discovers any of the following:

```text
orphan gitlink still exists
stable check disappears on docs-only PR
workflow self-change self-skips
spec-only PR still blanket-authorized
Supabase deterministic failure still blanket-retried
Vercel root is unknown
repository topology validator missing
```

then:

```text
R05 ACCEPTANCE = FAIL
R06 = STOP
```

Do not quietly repair those items in R06 unless the owner explicitly re-scopes the round after evidence review.

---

# 9. Files to MOVE

No file move is intended.

Do not reorganize the repository during final acceptance.

If a move becomes necessary, stop and document why the Phase 01 acceptance cannot be completed without it.

---

# 10. Files to REMOVE

No production/runtime file removal is intended.

R06 may require removal only if a temporary diagnostic/acceptance artifact unexpectedly survives into latest `main` and its owner round clearly required its removal before handoff.

That condition normally indicates an earlier-round acceptance failure and should be returned to that round rather than hidden in R06.

Do not remove tests, checks, workflow gates, branch protection, or evidence merely to make final acceptance green.

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

No RLS change.

R06 only verifies that the final R04 actor-aware authorization baseline remains accepted from current repository/CI evidence.

## Migrations / Backfill

None.

## Production database

R06 must not connect to, reset, repair, push or mutate a production/linked database as part of acceptance.

If database evidence is not green from the final Phase 01 repository state, R06 is blocked.

---

# 12. Backend Changes

## Services / Domain logic

None intended.

## Server actions / Route handlers / API

None intended.

## Validation

R06 validation is repository/process validation.

Do not add runtime validation packages or business logic.

## Authorization

No application authorization change.

Repository merge authorization is handled through GitHub protection and CI checks.

## Idempotency / Concurrency

Not a business-data concern for R06.

However, external protection updates must be applied from a freshly re-read state to avoid overwriting newer owner settings blindly.

---

# 13. Frontend Changes

No frontend route/page/component/state/interaction change is intended.

Any product UI change is out of scope.

---

# 14. Authentication and Authorization

## Product identity

No Auth.js or customer authentication work.

## Repository merge authority

R06 must establish an enforceable GitHub merge contract for `main`.

The final target must satisfy the following effective behavior.

### Pull request required

Direct normal development pushes to `main` must not be the accepted merge path.

Changes must flow through a PR.

### Required repository-owned checks

R06 must discover exact final check context names from R05 evidence.

The expected authoring-time set is:

```text
Phase/Round Gate
Repository Integrity
Dependency Integrity
Next Flow Quality
Supabase Database Quality
```

Do not configure names from memory if R05 landed different exact context names.

A required check must be:

- stable;
- repository-owned or deliberately accepted external dependency;
- present on every PR to `main`;
- successful when applicable;
- successful as a real explicit not-applicable path when scope is unrelated;
- incapable of disappearing because of workflow-level path omission.

### Branch freshness

The final protection mechanism should require the PR head to be current with `main` before merge when supported without creating an impossible workflow.

R06 must prove the R06 PR can satisfy this condition.

Do not bypass stale-branch protection to finish Phase 01.

### Administrator / owner enforcement

The expected Phase 01 security posture is that mandatory checks cannot be silently bypassed merely because the merging user has administrator/owner rights.

Use administrator enforcement / no-bypass behavior where supported.

If GitHub account/repository capability does not support an equivalent enforceable rule, record the limitation and keep R06 blocked rather than claiming a fully enforced baseline.

### Review requirement and current contributor model

Authoring-time `CODEOWNERS` is:

```text
* @firmeen
```

The current PR author/owner model may therefore have only one eligible human owner.

GitHub does not treat the PR author's own review as an independent approval boundary.

R06 must **not** configure a mandatory approval or mandatory CODEOWNERS review rule that makes the only owner unable to merge a fully compliant PR.

Phase 01 mandatory review enforcement is therefore:

```text
PR REQUIRED
+
OWNER MANUAL MERGE
+
MANDATORY STATUS CHECKS
+
ADMIN/OWNER NO-BYPASS WHERE SUPPORTED
```

A required approving review count greater than zero is optional only if, at R06 execution time:

- another eligible independent reviewer exists; and
- the owner explicitly chooses to require that review.

It is not a Phase 01 completion requirement.

### Conversation resolution

Require review-conversation resolution if supported and if it does not create an unresolvable automation deadlock.

Unresolved review threads must not be silently ignored.

### Force push / deletion

Expected final state:

```text
ALLOW_FORCE_PUSHES = NO
ALLOW_BRANCH_DELETION = NO
```

### Merge history policy

Do not require linear history in R06 while the repository intentionally permits/uses merge commits, unless the owner separately approves a merge-strategy change.

### Signed commits

Do not introduce mandatory signed commits as an R06 surprise requirement.

It may be considered later through an explicit governance decision.

### Merge queue

Not required for Phase 01.

### Required deployments

Do not add a required deployment gate merely because Vercel exists.

Use the deployment evidence decision below.

---

# 15. Security Requirements

R06 is security-sensitive because it changes the repository's control plane.

## 15.1 Protection must be read back

Never claim:

```text
MAIN_PROTECTED = YES
```

because instructions were written or an owner said they clicked a setting.

The implementation agent must re-fetch actual GitHub branch/ruleset state after the change.

## 15.2 No bypass as validation

Do not test protection by intentionally bypassing, force-pushing or directly mutating protected `main`.

Validate through configuration/API read-back and the actual compliant R06 PR merge path.

## 15.3 No destructive force-push test

Never force-push `main` as a negative test.

Configuration evidence is sufficient.

## 15.4 Least privilege

R06 must not broaden GitHub Actions permissions merely to verify branch protection.

PR workflows remain least-privilege.

No untrusted PR code should execute under `pull_request_target` with privileged secrets.

## 15.5 Secrets

Do not commit:

- GitHub tokens;
- Vercel tokens;
- Supabase secrets;
- deployment credentials;
- API keys;
- owner recovery credentials.

Do not paste secret values into acceptance evidence or logs.

## 15.6 External GitHub setting mutation

If the available automation/connector cannot write branch protection/ruleset settings:

```text
DO NOT FAKE THE MUTATION
```

Instead:

1. mark `OWNER_ACTION_REQUIRED`;
2. provide the exact expected settings contract;
3. owner applies the settings through GitHub UI/API;
4. implementation agent re-fetches branch state;
5. R06 continues only after read-back verification.

## 15.7 Protection deadlock prevention

Do not enable a rule that makes compliant merging impossible under the current contributor model.

Examples:

- mandatory self-impossible review;
- required check context that never reports;
- strict update requirement without a viable branch-update path;
- required deployment context that is not consistently posted.

If protection creates a deadlock, fix the configuration to the intended contract; do not simply disable all protection.

## 15.8 Baseline integrity

Final acceptance must not downgrade tests, skip checks, ignore DB failures or hide deployment failures.

## 15.9 Production systems

No production DB mutation and no destructive deployment change are authorized.

---

# 16. Failure and Recovery Paths

| Failure case | Expected behavior | Recovery / retry |
|---|---|---|
| R05 spec absent from main | R06 blocked | Merge reviewed R05 spec first; do not implement R06 |
| R05 implementation unmerged | R06 blocked | Finish R05 and owner merge |
| R05 required check red | R06 blocked | Fix under R05 ownership; rerun evidence |
| R01-R05 merge/check evidence incomplete | R06 blocked | Resolve exact GitHub evidence; do not infer |
| R05-owned gitlink/CI/spec-validator defect remains | R06 blocked | Return defect to R05; do not absorb silently |
| stable check name differs from authoring-time list | do not configure stale name | Discover final exact context from R05/current PR evidence |
| required context disappears on R06 PR | R06 blocked | Treat as R05 stable-check failure |
| R06 PR is behind main | do not bypass strict checks | update/rebase branch; rerun required checks |
| branch protection write API unavailable | owner action required | provide exact settings, owner applies, then re-fetch |
| protection read-back says unprotected | R06 blocked | correct GitHub external settings, verify again |
| admin bypass remains possible where no-bypass is required/supported | R06 blocked | enable admin enforcement/equivalent ruleset |
| mandatory review makes sole owner unable to merge | protection misconfiguration | remove impossible approval/CODEOWNERS requirement while keeping PR/check/admin enforcement |
| force push allowed | R06 blocked | disable force pushes, verify |
| branch deletion allowed | R06 blocked | disable deletion, verify |
| Vercel preview fails | classify exact failure | fix only if R06-owned doc/config change caused it; otherwise block or return to deployment ownership |
| Vercel external outage | do not hide | record external state; if Vercel is not branch-protection-required, do not bypass repository checks; final Phase 01 completion still requires healthy expected main deployment evidence |
| required Vercel context chosen but does not report on all PRs | protection design invalid | remove it from required set unless owner deliberately accepts and first makes reporting stable |
| R06 implementation changes application/DB unexpectedly | scope violation | stop; revert unrelated changes |
| R06 discovers app/DB baseline red | Phase 01 acceptance fails | return to owning recovery round; do not declare complete |
| owner merges before protection verified | R06 acceptance invalid | do not declare Phase 01 complete; establish protection and use a reviewed corrective acceptance PR if needed |
| protection enabled but R06 PR merged via bypass | R06 acceptance invalid | document incident; repeat compliant acceptance proof before Phase 01 complete |
| post-merge main is no longer protected | R06 incomplete | restore protection and verify before completion claim |
| P02/R01 spec absent after R06 complete | stop progression | Phase 01 may be complete, but no next implementation starts |

## Rollback philosophy

Repository documentation changes can be reverted through a normal protected PR.

External branch protection changes must not be removed casually as rollback.

If an R06 protection setting is wrong:

1. preserve mandatory PR/check intent;
2. correct only the misconfigured rule;
3. read back state;
4. rerun mergeability/check evidence;
5. document the correction.

Never solve a branch-protection problem by reopening unrestricted direct pushes to `main` without explicit owner emergency governance.

---

# 17. Dependencies

## Internal

R06 depends on successful completion of:

- R01 delivery/dependency baseline;
- R02 application quality;
- R03 fresh DB/structural quality;
- R04 actor/RLS baseline;
- R05 repository/CI/deployment baseline.

## External

- GitHub pull requests;
- GitHub Actions/checks;
- GitHub branch protection or rulesets;
- Vercel deployment evidence;
- current repository admin/owner capability.

## Runtime dependencies

No new application runtime dependency is intended.

## Dev dependencies

No new dev dependency is intended unless a tiny acceptance validator is proven necessary.

## Environment variables / secrets

No new application environment variable is intended.

No branch-protection token or secret may be committed.

## GitHub account capability

R06 must discover whether the current private repository/account can enforce the selected protection contract.

If a platform-plan limitation prevents equivalent enforcement, the limitation must be recorded as an actual blocker.

Do not invent a successful protection state.

---

# 18. Tests

R06 acceptance testing is cumulative and repository-control focused.

## 18.1 Phase evidence audit

- [ ] R01 implementation PR and merge SHA resolved.
- [ ] R02 implementation PR and merge SHA resolved.
- [ ] R03 implementation PR and merge SHA resolved.
- [ ] R04 implementation PR and merge SHA resolved.
- [ ] R05 implementation PR and merge SHA resolved.
- [ ] R01 required checks verified.
- [ ] R02 required checks verified.
- [ ] R03 required checks verified.
- [ ] R04 required checks verified.
- [ ] R05 required checks verified.
- [ ] no mandatory Phase 01 scope silently deferred.

## 18.2 Repository governance regression

- [ ] Phase/Round validator tests pass.
- [ ] valid implementation still requires exact READY base spec.
- [ ] head-only spec still cannot self-authorize implementation.
- [ ] malformed executable spec PR fails.
- [ ] valid executable spec PR path passes.
- [ ] repository topology validator passes.
- [ ] no orphan mode-160000 entry remains unless registered/documented intentionally.

## 18.3 Stable check contract

On the actual R06 implementation PR:

- [ ] `Phase/Round Gate` exact final context appears.
- [ ] `Repository Integrity` exact final context appears.
- [ ] `Dependency Integrity` exact final context appears.
- [ ] `Next Flow Quality` exact final context appears.
- [ ] `Supabase Database Quality` exact final context appears.
- [ ] non-applicable heavy checks use explicit successful N/A path rather than disappearing.
- [ ] no required check is pending forever because of path filtering.

If R05 produced different exact names, substitute the verified final names in the acceptance record.

## 18.4 Application baseline

R06 must verify the latest full application-quality evidence from R05/current main.

At minimum accepted evidence must cover:

```text
npm ci
lint
typecheck
unit tests
application integration tests
build:next
```

If R06 does not modify app/runtime files and the final R05 PR ran the real full validation because workflows changed, R06 may cite that immediate inherited full evidence plus the stable R06 context result.

If any R06 change touches application/runtime/workflow scope that makes prior evidence insufficient, run the real full validation again.

## 18.5 Database baseline

R06 must verify the latest full DB-quality evidence from R05/current main.

Accepted evidence must cover the final intended chain:

```text
fresh local Supabase bootstrap
migrations
seed/reset
SQL tests
DB lint
Kysely generation
type drift
DB runtime integration
actor/RLS regression baseline
```

R06 must not claim DB acceptance from a no-op context alone if the most recent real full DB run is red or missing.

## 18.6 Deployment

- [ ] R06 implementation Preview deployment expected state recorded.
- [ ] Vercel project/root contract matches R05 handoff.
- [ ] no secret committed.
- [ ] post-R06-merge main deployment status is healthy before final Phase 01 completion.

## 18.7 Branch protection verification

After applying protection and before merge:

- [ ] branch/ruleset read-back shows `main` protected.
- [ ] pull request merge path required.
- [ ] exact final required check set configured.
- [ ] stale branch cannot silently bypass required current-main validation when strict mode is selected.
- [ ] admin/owner bypass prevented where supported/required by this spec.
- [ ] force pushes disabled.
- [ ] deletion disabled.
- [ ] approval policy does not create impossible self-review deadlock.
- [ ] R06 implementation PR remains mergeable once all requirements are satisfied.

Do not test force-push/deletion by performing destructive operations.

## 18.8 Protected merge proof

- [ ] R06 owner/manual merge happens after protection verification.
- [ ] no bypass used.
- [ ] final `main` SHA is the R06 merge commit.
- [ ] `main` remains protected after merge.
- [ ] final deployment evidence is healthy.

---

# 19. Validation Commands and Evidence

Use commands that exist in the repository and record only actual outcomes.

The implementation environment may use GitHub Actions/API evidence where a local command cannot prove hosted settings.

## Repository evidence

```bash
git status --short
git rev-parse HEAD
git rev-parse origin/main
git diff --name-status <R06_BASE_SHA>...HEAD
git ls-files -s
```

## Governance validators

Use the final R05 commands/scripts, expected to include equivalents of:

```bash
node --test scripts/validate-phase-round-spec.test.mjs
node scripts/validate-phase-round-spec.mjs   # only in its supported event/test harness
```

and the final repository-integrity validator/test introduced by R05.

Do not invent command names. Re-read the final R05 repository before running.

## Application quality

When full execution is required:

```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```

Record exit codes and PASS/FAIL/BLOCKED/NOT RUN/NOT APPLICABLE truthfully.

## Database quality

Prefer the final `Supabase Database Quality` workflow as the canonical fresh-environment evidence.

If commands are run locally, use only the final documented R05/R03 toolchain and never a linked production database.

## GitHub hosted state

Record API/connector evidence for:

```text
main SHA
main protected flag / ruleset state
required status checks
admin enforcement / bypass state
force-push setting
deletion setting
R06 PR base/head
R06 PR mergeability
R06 PR workflow/check results
R06 merge SHA
post-merge main protected state
```

If the tool cannot retrieve a protection subfield, do not guess it. Use another supported GitHub read path or mark that field `BLOCKED / OWNER VERIFICATION REQUIRED` until verifiable.

## Vercel

Record current GitHub/Vercel status evidence.

Do not expose raw secret configuration.

---

# 20. PR Requirements

The R06 implementation PR is the final implementation PR of Phase 01.

It must target `main` and include canonical metadata:

```text
Specification: FLOW_P01_R06_IMPLEMENTATION_SPEC.md
Phase: 01
Round: 06
Previous: FLOW_P01_R05_IMPLEMENTATION_SPEC.md
Previous PR: <R05 implementation PR>
Related Issue: #29
Next Specification: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

## Required body evidence

The R06 implementation PR must include:

```text
SPEC_BASE_SHA
IMPLEMENTATION_BASE_SHA
IMPLEMENTATION_HEAD_SHA
IMPLEMENTATION_BRANCH

R01_IMPLEMENTATION_PR
R01_MERGE_SHA
R02_IMPLEMENTATION_PR
R02_MERGE_SHA
R03_IMPLEMENTATION_PR
R03_MERGE_SHA
R04_IMPLEMENTATION_PR
R04_MERGE_SHA
R05_IMPLEMENTATION_PR
R05_MERGE_SHA

FINAL_REQUIRED_CHECKS
PHASE_ROUND_GATE
REPOSITORY_INTEGRITY
DEPENDENCY_INTEGRITY
NEXT_FLOW_QUALITY
SUPABASE_DB_QUALITY
VERCEL_PREVIEW_STATUS

MAIN_PROTECTED_BEFORE_R06
PROTECTION_MECHANISM
PULL_REQUEST_REQUIRED
STRICT_UP_TO_DATE
ADMIN_ENFORCEMENT
FORCE_PUSH_ALLOWED
BRANCH_DELETION_ALLOWED
REQUIRED_APPROVAL_COUNT
CODEOWNER_REVIEW_REQUIRED
VERCEL_REQUIRED_FOR_MERGE
OWNER_ACTION_REQUIRED

PRODUCTION_DB_MODIFIED: NO
AUTH_IMPLEMENTED: NO
PRODUCT_FEATURE_IMPLEMENTED: NO
AUTO_MERGE: NO
```

Use actual exact final names where R05 differs.

## Acceptance record

The R06 PR must include `FLOW_P01_ACCEPTANCE.md` or an owner-approved equivalent.

## Protection activation timing

Do not enable protection blindly at branch creation.

Recommended sequence:

1. open R06 implementation PR;
2. allow all stable R06 contexts to report;
3. make branch current with latest `main`;
4. confirm R06 implementation scope is final;
5. owner applies final protection contract or automation does so with explicit permission;
6. re-fetch protection;
7. verify R06 PR satisfies it;
8. owner manually merges;
9. re-fetch post-merge state.

## Owner/manual merge

Auto-merge is prohibited.

The R06 implementation PR must stop for owner review.

No agent should bypass protection to complete Phase 01.

---

# 21. Definition of Done

P01/R06 and Phase 01 are complete only when **all** mandatory criteria below are proven.

## Entry gate

- [ ] R05 spec on main and READY.
- [ ] R05 implementation owner-merged.
- [ ] R05 required checks green.
- [ ] latest main fetched after R05 merge.
- [ ] R06 implementation branch created from latest main.

## R01 acceptance

- [ ] exact R01 implementation PR resolved.
- [ ] exact R01 merge SHA resolved.
- [ ] deterministic dependency baseline accepted.
- [ ] Phase/Round authorization baseline accepted.

## R02 acceptance

- [ ] exact R02 implementation PR resolved.
- [ ] exact R02 merge SHA resolved.
- [ ] application install/lint/typecheck/test/build baseline accepted.

## R03 acceptance

- [ ] exact R03 implementation PR resolved.
- [ ] exact R03 merge SHA resolved.
- [ ] fresh database bootstrap accepted.
- [ ] migrations/seed/structural quality accepted.
- [ ] actorless fail-closed baseline accepted.

## R04 acceptance

- [ ] exact R04 implementation PR resolved.
- [ ] exact R04 merge SHA resolved.
- [ ] synthetic actor/membership/branch baseline accepted.
- [ ] cross-tenant and wrong-branch denial accepted.
- [ ] permission helper baseline accepted.
- [ ] self-elevation hardening baseline accepted.

## R05 acceptance

- [ ] exact R05 implementation PR resolved.
- [ ] exact R05 merge SHA resolved.
- [ ] repository topology clean.
- [ ] repository-integrity check green.
- [ ] executable-spec HEAD validation accepted.
- [ ] implementation authority remains base-only.
- [ ] stable always-present CI contexts accepted.
- [ ] retry/service behavior accepted.
- [ ] deployment contract accepted.
- [ ] no R05 mandatory scope remains unresolved.

## R06 acceptance artifact

- [ ] `FLOW_P01_ACCEPTANCE.md` or equivalent exists.
- [ ] it is marked non-executable.
- [ ] actual R01-R05 PR/merge evidence recorded.
- [ ] R06 PR/head evidence recorded.
- [ ] final required-check contract recorded.
- [ ] branch protection before/after evidence recorded.
- [ ] deployment evidence recorded.
- [ ] non-blocking follow-up explicitly separated from blockers.
- [ ] next-phase stop condition recorded.

## Stable R06 checks

- [ ] Phase/Round Gate appears and passes.
- [ ] Repository Integrity appears and passes.
- [ ] Dependency Integrity appears and passes or returns explicit successful N/A as designed.
- [ ] Next Flow Quality appears and passes or returns explicit successful N/A as designed.
- [ ] Supabase Database Quality appears and passes or returns explicit successful N/A as designed.
- [ ] latest real full application evidence is green.
- [ ] latest real full DB evidence is green.

## Main protection

- [ ] actual `main` protection/ruleset read-back verified.
- [ ] PR path required for normal development changes.
- [ ] final repository-owned required checks configured.
- [ ] branch-current/strict behavior configured where supported and proven workable.
- [ ] admin/owner no-bypass enforcement configured where supported and required to satisfy this spec.
- [ ] force pushes disabled.
- [ ] branch deletion disabled.
- [ ] no impossible self-review requirement.
- [ ] no required check that fails to report.
- [ ] no mandatory linear-history surprise introduced.
- [ ] no mandatory signed-commit surprise introduced.
- [ ] no merge queue required unless separately approved.

## Vercel / deployment

- [ ] R06 Preview expected deployment state is healthy before merge.
- [ ] main project/root contract still matches R05 evidence.
- [ ] after R06 merge, main deployment status is healthy.

## Protected merge proof

- [ ] R06 PR green before protection application/verification.
- [ ] protection verified before owner merge.
- [ ] R06 PR satisfies configured protection.
- [ ] owner manually merges without bypass.
- [ ] final R06 merge SHA captured from GitHub.
- [ ] post-merge `main` SHA equals/contains R06 merge result.
- [ ] post-merge main remains protected.

## Scope discipline

- [ ] no Auth.js.
- [ ] no product RBAC.
- [ ] no customer persistence.
- [ ] no realtime/kitchen/payment/voice implementation.
- [ ] no production DB mutation.
- [ ] no unrelated dependency upgrade.
- [ ] no R05 defect silently absorbed.
- [ ] no automatic Phase 02 implementation.

## Phase completion

Before R06 owner merge:

```text
P01/R06 = IMPLEMENTED / WAITING FOR OWNER MERGE
PHASE 01 = NOT COMPLETE
```

After protected owner merge + post-merge verification:

```text
P01/R06 = COMPLETE
PHASE 01 = COMPLETE
```

If post-merge protection or deployment evidence fails:

```text
PHASE 01 = ACCEPTANCE BLOCKED
```

Do not declare completion prematurely.

---

# 22. Handoff to Next Phase

R06 is the final round of Phase 01.

The expected completed Phase 01 handoff is:

```text
DETERMINISTIC DEPENDENCY INSTALLATION
+
MACHINE-CHECKABLE IMPLEMENTATION AUTHORITY
+
HEAD-VALIDATED EXECUTABLE SPEC PRS
+
GREEN APPLICATION QUALITY BASELINE
+
GREEN FRESH DATABASE BASELINE
+
PROVEN ACTOR/TENANT/BRANCH DB AUTHORIZATION BASELINE
+
CLEAN REPOSITORY TOPOLOGY
+
STABLE ALWAYS-PRESENT CI CONTEXTS
+
TRUTHFUL VERCEL DEPLOYMENT CONTRACT
+
PROTECTED MAIN
+
OWNER MANUAL MERGE PATH
+
PHASE 01 ACCEPTANCE RECORD
```

The required next specification is:

```text
FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

The development-phase README requires the final round to point to the next phase's first round.

Therefore the R06 metadata intentionally uses:

```text
Next: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

After R06 completion:

```text
CHECK FLOW_P02_R01_IMPLEMENTATION_SPEC.md ON MAIN
```

If absent:

```text
PHASE 01 COMPLETE
P02 IMPLEMENTATION NOT AUTHORIZED
STOP
NOTIFY OWNER
```

If present but not READY:

```text
STOP
```

If present and READY:

P02/R01 still must perform its own latest-main/precondition audit before implementation.

R06 does not define Phase 02 implementation scope.

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

## Legal R06 sequence

```text
R06 SPEC MERGED TO MAIN
        ↓
WAIT FOR R05 SPEC / IMPLEMENTATION OWNER MERGE IF STILL INCOMPLETE
        ↓
VERIFY R05 REQUIRED CHECKS GREEN
        ↓
FETCH LATEST MAIN
        ↓
READ R01-R05 FINAL IMPLEMENTATION HANDOFFS
        ↓
RESOLVE R01-R05 PR NUMBERS / MERGE SHAS / CHECK EVIDENCE
        ↓
RE-AUDIT FINAL REPOSITORY TREE
        ↓
RE-AUDIT FINAL WORKFLOWS / VALIDATORS / CI CONTEXTS
        ↓
RE-AUDIT FINAL VERCEL / DEPLOYMENT CONTRACT
        ↓
RE-FETCH CURRENT MAIN PROTECTION STATE
        ↓
IF ANY R05-OWNED BLOCKER REMAINS → STOP / RETURN TO R05
        ↓
CREATE R06 IMPLEMENTATION BRANCH FROM LATEST MAIN
        ↓
CREATE PHASE 01 ACCEPTANCE RECORD
        ↓
CREATE / UPDATE MAIN PROTECTION RUNBOOK
        ↓
RUN R06 GOVERNANCE / REPOSITORY VALIDATION
        ↓
VERIFY LATEST REAL FULL APP + DB EVIDENCE GREEN
        ↓
OPEN R06 IMPLEMENTATION PR
        ↓
VERIFY ALL STABLE CI CONTEXTS APPEAR AND PASS
        ↓
VERIFY R06 PREVIEW DEPLOYMENT HEALTHY
        ↓
UPDATE R06 BRANCH TO LATEST MAIN IF NEEDED
        ↓
LOCK FINAL REQUIRED CHECK SET FROM ACTUAL R05/R06 EVIDENCE
        ↓
APPLY MAIN PROTECTION / OWNER ACTION
        ↓
RE-FETCH MAIN PROTECTION
        ↓
VERIFY PR REQUIRED
VERIFY REQUIRED CHECKS
VERIFY ADMIN/OWNER ENFORCEMENT
VERIFY FORCE PUSH DISABLED
VERIFY DELETE DISABLED
VERIFY NO SELF-REVIEW DEADLOCK
        ↓
VERIFY R06 PR SATISFIES PROTECTION
        ↓
STOP FOR OWNER FINAL REVIEW
        ↓
OWNER MANUAL MERGE THROUGH PROTECTED PATH
        ↓
RE-FETCH MAIN
        ↓
CAPTURE R06 MERGE SHA
        ↓
VERIFY MAIN STILL PROTECTED
        ↓
VERIFY POST-MERGE VERCEL / DEPLOYMENT HEALTHY
        ↓
P01/R06 COMPLETE
        ↓
PHASE 01 COMPLETE
        ↓
CHECK FLOW_P02_R01_IMPLEMENTATION_SPEC.md
        ↓
IF ABSENT / NOT READY → STOP
```

## Explicit prohibitions

```text
NO R06 IMPLEMENTATION BEFORE R05 OWNER MERGE
NO DECLARING PHASE 01 COMPLETE BEFORE SIX IMPLEMENTATION MERGES
NO DIRECT MAIN PUSH
NO AUTO-MERGE
NO PROTECTION BYPASS
NO FORCE-PUSH TEST AGAINST MAIN
NO BRANCH-DELETE TEST AGAINST MAIN
NO FAKE BRANCH-PROTECTION CLAIM WITHOUT READ-BACK
NO REQUIRED CHECK CONFIGURED FROM MEMORY WHEN FINAL NAME CAN BE DISCOVERED
NO REQUIRED CONTEXT THAT DISAPPEARS ON UNRELATED PRS
NO IMPOSSIBLE SELF-REVIEW REQUIREMENT
NO CODEOWNER REVIEW REQUIREMENT THAT DEADLOCKS THE SOLE OWNER
NO ADMIN BYPASS WHEN GITHUB SUPPORTS THE REQUIRED ENFORCEMENT
NO LINEAR-HISTORY SURPRISE WHILE MERGE COMMITS REMAIN INTENTIONAL
NO SIGNED-COMMIT SURPRISE REQUIREMENT
NO REQUIRED VERCEL MERGE GATE WITHOUT STABILITY / OWNER DECISION
NO R05 DEFECT SILENTLY ABSORBED INTO R06
NO TEST / CI WEAKENING
NO PRODUCTION DB MUTATION
NO AUTH.JS
NO PRODUCT FEATURE WORK
NO P02 IMPLEMENTATION WITHOUT FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

## Final R06 success test

```text
R01 implementation merged and accepted? YES
R02 implementation merged and accepted? YES
R03 implementation merged and accepted? YES
R04 implementation merged and accepted? YES
R05 implementation merged and accepted? YES
R06 spec READY on main? YES
Phase 01 acceptance record present? YES
Repository topology clean? YES
Spec PR governance hardened? YES
Stable required contexts present? YES
Latest real application quality green? YES
Latest real database quality green? YES
Actor/RLS baseline accepted? YES
Vercel Preview healthy? YES
Main protected before R06 merge? YES
PR merge path required? YES
Required internal checks enforced? YES
Admin/owner bypass prevented where supported? YES
Force pushes disabled? YES
Branch deletion disabled? YES
No impossible review deadlock? YES
R06 PR merged manually through protection? YES
Post-merge main still protected? YES
Post-merge deployment healthy? YES
Six implementation rounds merged? YES
Phase 01 complete? YES
P02/R01 spec present and READY? CHECK — IF NO, STOP
```

No automatic merge.

Owner/manual merge is the final Phase 01 decision boundary.
