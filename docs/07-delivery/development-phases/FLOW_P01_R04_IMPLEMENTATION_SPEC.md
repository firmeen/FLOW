# FLOW P01 R04 — Implementation Specification

> Phase 01 — Development Control + Baseline Recovery  
> Round 04 — Actor-Aware Database / RLS Authorization Baseline Recovery

---

## Metadata

- Phase: `01`
- Round: `04`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Target branch: `main`
- Previous: `FLOW_P01_R03_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P01_R05_IMPLEMENTATION_SPEC.md`
- Planned execution: `2026-08-19 12:00 Asia/Bangkok`
- Owner approval required: `YES`
- Automatic merge allowed: `NO`
- Proposal issue: `#24`
- Specification base SHA: `6c332ab1b3204135576bd987427603bb4dab7b1b`
- Previous implementation PR: `PENDING — resolve from current repository before R04 implementation`
- Previous implementation merge SHA: `PENDING — R03 must be owner-merged first`
- Previous required checks: `Phase/Round Gate`, `Supabase Database Quality`, plus `Next Flow Quality` when triggered
- Current evidence source: `main@6c332ab1b3204135576bd987427603bb4dab7b1b`, R02 PR #20, R03 corrected specification, current migrations/seed/tests/runtime
- Current planning scope: `PHASE 01 / ROUND 04 ONLY`
- Recommended implementation branch: `phase/01-round/04-actor-rls-baseline`
- Recommended implementation PR title: `fix(database): recover P01 R04 actor-aware authorization baseline`

---

## Execution Authority Statement

This specification may exist on `main` before R03 implementation is complete, but that does not authorize R04 implementation.

R04 implementation is legal only when all of the following are simultaneously true on current `main`:

```text
FLOW_P01_R04_IMPLEMENTATION_SPEC.md EXISTS
+
STATUS = READY
+
P01/R03 IMPLEMENTATION PR IS OWNER-MERGED
+
P01/R03 REQUIRED CHECKS PASSED
+
SUPABASE DATABASE QUALITY = PASS FOR R03
+
LATEST MAIN HAS BEEN FETCHED
+
R03 HANDOFF HAS BEEN READ AND VERIFIED
```

If the R03 implementation PR does not yet exist, is open, failed required checks, or is not owner-merged, R04 implementation must stop.

The implementation agent must not infer R03 completion from the presence of this file.

---

# 1. Phase Objective

Phase 01 is the trust-baseline phase.

R01 established deterministic development governance and dependency installation.

R02 restored application quality.

R03 restores fresh database creation and structural database quality while proving actorless default-deny behavior.

R04 establishes the next trust boundary:

> Database authorization tests must use real synthetic actors, real memberships, explicit tenant/branch scopes and real permission relationships so FLOW can prove that actor-aware RLS behaves intentionally rather than accidentally.

R04 does not implement Auth.js or the product authorization layer.

R04 makes the already-merged database authorization foundation internally coherent, testable and safe enough to serve as the baseline for later Identity/Auth.js work.

At Phase 01 / Round 04 completion, repository evidence must answer:

```text
Does an active real synthetic user with a valid tenant-wide membership pass tenant-level membership checks?
YES

Does a branch-only member pass a tenant-wide membership check?
NO

Does a branch-only member pass the correct branch check?
YES

Does the same branch-only member fail a different same-tenant branch check?
YES

Does a tenant-wide member satisfy valid branch checks within the same tenant?
YES

Does a Tenant A actor fail Tenant B access?
YES

Does a suspended/deactivated user fail authorization?
YES

Does an invited/suspended/revoked membership fail authorization?
YES

Does the permission helper return allow/deny from real role-permission relationships?
YES

Can an ordinary actor without member/role management permission modify authorization-control data to elevate itself?
NO

Do positive DB runtime actor tests use real app.users.id values rather than tenant IDs?
YES

Does missing actor still fail closed?
YES

Does Supabase Database Quality remain green?
YES
```

---

# 2. Phase Scope

## 2.1 R04 In Scope

R04 owns the minimum actor-aware database authorization baseline required for Phase 01 acceptance:

- re-verifying the final R03 schema/migration/test state before any change;
- creating deterministic synthetic `app.users` fixtures;
- creating deterministic tenant-scoped synthetic roles required by memberships;
- assigning minimal synthetic permissions through `app.role_permissions` for authorization tests;
- creating deterministic memberships representing tenant-wide and branch-specific access;
- adding a second branch inside Tenant A so same-tenant wrong-branch behavior can be tested distinctly from cross-tenant behavior;
- defining exact semantics for `private.actor_has_active_membership(target_tenant_id, target_branch_id)`;
- correcting that helper if current semantics violate the contract;
- applying the same branch-scope contract to `private.actor_has_permission(...)`;
- proving user-status and membership-status behavior;
- proving no-actor, wrong-tenant, same-tenant wrong-branch and valid-branch behavior;
- proving tenant-wide membership behavior;
- testing selected permission helper allow/deny behavior;
- protecting the highest-risk authorization-control mutation surfaces from ordinary runtime self-elevation where current broad RLS/DML makes that possible;
- updating SQL/pgTAP authorization tests;
- updating DB runtime integration tests so positive actor cases use real `app.users.id` fixtures;
- preserving explicit actorless default-deny coverage from R03;
- testing `withIdentityTransaction()` against real actor IDs where applicable;
- removing the fake-zero-tenant UUID validation hack from identity transaction code if that path is part of the R04 test baseline;
- keeping `Supabase Database Quality` green;
- keeping `Next Flow Quality` green if application DB runtime paths change;
- producing exact handoff evidence for R05 and the later Identity/Auth.js phase.

## 2.2 R04 Explicitly Out of Scope

R04 must not implement:

- Auth.js runtime;
- Credentials provider;
- OAuth;
- password hash verification runtime;
- login throttling runtime;
- account recovery;
- MFA or step-up authentication;
- browser/server AccessContext;
- workspace selector UI;
- `/staff`, `/kitchen`, `/cashier`, `/admin` route authorization;
- application command authorization;
- navigation filtering by permissions;
- complete permission-aware RLS conversion across all operational tables;
- customer QR capability;
- table-session/cart/order persistence cutover;
- realtime;
- kitchen persistence/routing redesign;
- Omise/Opn;
- Stripe Billing;
- customer UX redesign;
- Voice Ordering;
- repository gitlink/submodule cleanup;
- Vercel/deployment recovery;
- branch protection/ruleset rollout;
- CareFlow/JobFlow product implementation.

These remain later-round or later-phase responsibilities.

## 2.3 R04 versus Future Identity/Auth.js Phase

R04 establishes database truth and security regression tests.

The later Identity/Auth.js phase will connect authenticated human sessions to this database truth.

R04 therefore may prove:

```text
actor UUID
+
tenant
+
branch
+
membership
+
permission helper
+
RLS
```

but must not claim:

```text
browser session
+
Auth.js
+
workspace
+
route permission
+
application command authorization
```

is complete.

---

# 3. Current Round Objective

R04 must transform the actor-aware database baseline from an implicit/historical state into an explicit tested contract.

The expected end-state is:

```text
FRESH DATABASE BASELINE FROM R03
        ↓
SYNTHETIC ACTORS / ROLES / MEMBERSHIPS
        ↓
EXPLICIT TENANT-WIDE VS BRANCH-SCOPED SEMANTICS
        ↓
MEMBERSHIP HELPER TESTS
        ↓
PERMISSION HELPER TESTS
        ↓
RLS POSITIVE + NEGATIVE ACTOR TESTS
        ↓
AUTHORIZATION-CONTROL SELF-ELEVATION DENIAL
        ↓
REAL ACTOR DB RUNTIME INTEGRATION
        ↓
IDENTITY TRANSACTION REAL-ACTOR VALIDATION
        ↓
SUPABASE DATABASE QUALITY PASS
```

## Mandatory Outcome A — Verify R03 Handoff Before Editing

Before implementation:

- locate the actual R03 implementation PR;
- verify it is merged;
- record actual R03 merge SHA;
- verify `Phase/Round Gate = PASS`;
- verify `Supabase Database Quality = PASS`;
- verify `Next Flow Quality` result if R03 triggered it;
- inspect R03 final changed files;
- inspect the final versions of all migrations touched by R03;
- inspect final seed, SQL tests, generated DB types and runtime test behavior;
- fetch latest `main` and branch from that exact SHA.

If R03 is not complete, stop.

## Mandatory Outcome B — Establish Deterministic Synthetic Actor Fixtures

R04 requires real synthetic identities, but no real credentials.

At minimum represent:

```text
Tenant A
  Branch A1
  Branch A2

  User A Tenant-Wide Admin/Manager Fixture
  User A Branch-A1 Staff Fixture
  User A Branch-A2 Staff Fixture
  User A Suspended Fixture
  User A Revoked-Membership Fixture

Tenant B
  Branch B1
  User B Valid Fixture
```

The exact names/IDs may follow repository conventions, but fixtures must be stable and deterministic.

R04 should use tenant-scoped test roles rather than inventing unresolved final semantics for `system = true` roles.

Minimum role/permission fixture intent:

```text
Tenant A Manager/Test Admin Role
→ enough permissions to prove member/role-management helper allow cases

Tenant A Staff Role
→ ordinary operational permission(s), but no member.manage / role.manage

Tenant B Role
→ equivalent isolated fixture for cross-tenant tests
```

No password hash or login credential is required for these actors.

## Mandatory Outcome C — Define Tenant-Wide versus Branch Membership Exactly

The required baseline semantic is:

```text
MEMBERSHIP.branch_id IS NULL
→ tenant-wide membership

MEMBERSHIP.branch_id = <branch UUID>
→ branch-scoped membership
```

For `private.actor_has_active_membership(target_tenant_id, target_branch_id)`:

### Tenant-level request

```text
target_branch_id IS NULL
```

must pass only when the actor has an ACTIVE membership for that tenant with:

```text
membership.branch_id IS NULL
```

A branch-only membership must NOT become tenant-wide merely because the requested target branch is null.

### Branch-level request

```text
target_branch_id = Branch X
```

must pass when the actor has either:

```text
tenant-wide ACTIVE membership
```

or:

```text
ACTIVE membership exactly scoped to Branch X
```

It must fail for a membership scoped only to another branch.

### User status

The helper must require:

```text
app.users.status = ACTIVE
```

### Membership status

The helper must require:

```text
app.memberships.status = ACTIVE
```

`INVITED`, `SUSPENDED`, and `REVOKED` must fail.

## Mandatory Outcome D — Apply the Same Scope Semantics to Permission Resolution

`private.actor_has_permission(permission_code, target_tenant_id, target_branch_id)` must not have weaker branch semantics than active membership.

It must require:

- active user;
- active membership;
- correct tenant;
- correct branch/tenant-wide scope;
- role relationship belonging to the same tenant under the currently supported tenant-scoped role model;
- actual matching permission code through `app.role_permissions`.

R04 does not finalize global/system-role architecture.

If current `system = true` semantics remain ambiguous, R04 must avoid depending on global roles in its synthetic test matrix and explicitly hand the unresolved system-role product model to the later Identity/Auth.js phase.

## Mandatory Outcome E — Prove Positive and Negative Actor RLS

The SQL/database test suite must prove at minimum:

```text
NO ACTOR
→ denied / zero actor-protected rows

VALID TENANT-WIDE ACTOR A
→ tenant-level A baseline allowed where policy is membership-based

VALID TENANT-WIDE ACTOR A
→ valid Branch A1 / A2 branch checks allowed

BRANCH A1 ACTOR
→ Branch A1 allowed
→ Branch A2 denied

BRANCH A2 ACTOR
→ Branch A2 allowed
→ Branch A1 denied

TENANT A ACTOR
→ Tenant B denied

TENANT B ACTOR
→ Tenant A denied

SUSPENDED USER
→ denied

REVOKED MEMBERSHIP
→ denied
```

Use both helper-level tests and actual RLS-protected relation tests.

Helper tests alone are insufficient.

## Mandatory Outcome F — Protect Authorization-Control Mutation Surfaces

Current historical baseline granted broad table DML to `flow_runtime` and created membership-based `FOR ALL` policies on authorization-control tables.

This creates a structural risk that an ordinary active actor could mutate role or membership state and elevate itself if server code exposed a generic mutation path.

R04 must prove and, where necessary, minimally harden the highest-risk database surfaces:

```text
app.roles
app.memberships
```

At minimum an ordinary staff fixture without management permission must be unable to:

- change its own membership to another role;
- reactivate a revoked membership;
- create a tenant-wide membership for itself;
- create or alter a role as a route to privilege elevation.

Use the existing permission catalog where possible:

```text
member.view
member.invite
member.manage
role.view
role.manage
```

R04 should not convert every operational table to permission-aware RLS.

The narrow purpose is to close obvious authorization-control self-elevation paths and prove the database baseline fails closed.

If separate SELECT/INSERT/UPDATE/DELETE policies are needed for these control tables, implement the minimum precise policies rather than another broad `FOR ALL` shortcut.

## Mandatory Outcome G — Preserve Operational Policy Scope Boundary

Most current operational-table RLS is membership-based rather than command-permission based.

R04 must not silently rewrite every order/menu/kitchen/payment policy into final permission-aware product authorization.

That belongs to the later Identity/Auth.js and application authorization work.

R04 may use selected operational relations to prove tenant/branch actor scope, but not to finalize command permissions.

## Mandatory Outcome H — Real Actor Runtime Integration

Current DB runtime tests contain positive queries without actor and one context test that uses a tenant UUID as an actor UUID.

R04 must replace positive actor cases with real synthetic `app.users.id` values.

Required runtime coverage:

- actorless case remains denied;
- tenant-wide actor positive read on appropriate membership-protected data;
- branch-scoped actor positive same-branch behavior;
- wrong same-tenant branch denied;
- cross-tenant denied;
- suspended/revoked actor cases denied where practical;
- tenant/branch/actor context remains transaction-local;
- pooled connection context does not leak;
- rollback context does not leak;
- actor ID in test evidence is demonstrably a user ID, not tenant ID.

## Mandatory Outcome I — Identity Transaction Validation Must Stop Using a Fake Tenant

Current `withIdentityTransaction(actorId, ...)` validates the actor by calling tenant-context validation with a fabricated all-zero tenant UUID.

That is not a valid identity-context model.

If `withIdentityTransaction()` remains part of the active R04 baseline, replace that hack with a narrow primitive such as:

```text
validateUuid(value, field)
```

or:

```text
validateActorId(actorId)
```

with server-only behavior and existing error semantics preserved.

R04 does not need to design the future pre-auth credential lookup transaction; it only needs to make current actor validation truthful and independently testable.

## Mandatory Outcome J — Identity Role Baseline

Where existing `flow_identity` behavior is tested, R04 may prove narrow current behavior such as:

```text
real actor
→ can read own user row according to current policy
→ can read own membership rows according to current policy
→ cannot read another user's identity row
```

Do not broaden `flow_identity` into a full workspace/permission resolver merely to satisfy R04.

Any inability to resolve roles/permissions under `flow_identity` should be recorded as a later Identity/Auth.js design gap unless it blocks the narrow current contract.

## Mandatory Outcome K — Required CI Green

R04 implementation must end with:

```text
Phase/Round Gate          PASS
Supabase Database Quality PASS
Next Flow Quality         PASS if triggered
Dependency Integrity      PASS only if dependency files change
```

---

# 4. Preconditions

- [ ] R04 specification exists on `main`.
- [ ] Status is `READY`.
- [ ] Previous is `FLOW_P01_R03_IMPLEMENTATION_SPEC.md`.
- [ ] Next is `FLOW_P01_R05_IMPLEMENTATION_SPEC.md`.
- [ ] Corrected R03 specification was used.
- [ ] R03 implementation PR exists and is owner-merged.
- [ ] R03 required checks passed.
- [ ] `Supabase Database Quality` is green on final R03 implementation evidence.
- [ ] latest main fetched and inspected.
- [ ] R04 branch created from latest main.

Before changes read:

- repository `README.md`;
- `CONTRIBUTING.md`;
- `SECURITY.md`;
- `docs/07-delivery/development-phases/README.md`;
- `FLOW_PHASE_ROUND_SPEC_TEMPLATE.md`;
- corrected R03 specification;
- final R03 implementation PR and CI evidence;
- this full R04 specification;
- `docs/06-architecture/application-architecture.md`;
- `docs/06-architecture/security.md`;
- `supabase/README.md`;
- all migrations affecting identity/RLS;
- `supabase/seed.sql`;
- all DB SQL tests;
- `apps/web/next-flow/AGENTS.md`;
- `apps/web/next-flow/src/server/db/README.md`;
- `src/server/db/context.ts`;
- `src/server/db/transaction.ts`;
- `src/server/db/identity-transaction.ts`;
- DB runtime integration tests;
- applicable nested instructions.

Working-tree safety:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

No destructive cleanup of unrelated user work.

---

# 5. Architecture Scope

| Layer | R04 impact |
|---|---|
| Customer UI | NONE |
| Operations UI | NONE |
| Management UI | NONE |
| Auth.js | NONE |
| Identity database fixtures | HIGH |
| Membership helper semantics | HIGH |
| Permission helper semantics | HIGH |
| RLS actor/branch baseline | HIGH |
| Authorization-control tables | HIGH / NARROW |
| DB runtime actor tests | HIGH |
| Identity transaction validation | MEDIUM |
| Full app command authorization | DEFER |
| Product persistence | NONE |
| Deployment/gitlinks | DEFER R05 |
| Branch protection | DEFER R06 |

Security architecture requires server + database enforcement and negative cross-tenant/wrong-branch testing. R04 provides the database half of that future contract without claiming the server/Auth.js half is complete.

---

# 6. Existing Files and Current Behavior

| Path | Current behavior / risk | R04 action after R03 re-verification |
|---|---|---|
| `supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql` | Historical actor/RBAC foundation; helper branch predicate currently allows branch membership to satisfy null target branch. | Do not rewrite blindly after R03. Prefer forward corrective migration for semantic hardening unless current history evidence clearly requires otherwise. |
| `supabase/seed.sql` | Tenant/menu fixtures only; no real actor/role/membership fixtures. | Add deterministic synthetic actor authorization fixtures. |
| `supabase/tests/database/phase2_database_baseline.test.sql` | Structural baseline; R03 should own actorless default-deny correction. | Preserve structural coverage; do not overload with entire R04 matrix if a dedicated file is clearer. |
| `supabase/tests/database/**` | Current DB tests lack complete actor matrix. | Add dedicated R04 actor authorization test coverage. |
| `src/server/db/context.ts` | `actorId` optional; UUID validator private to composite tenant context. | Consider narrow reusable actor UUID validation; do not force all future transaction types into one context. |
| `src/server/db/transaction.ts` | Can set tenant/branch/actor transaction-locally. | Preserve; positive tests use real actors. |
| `src/server/db/identity-transaction.ts` | Uses fake zero tenant to validate actor ID. | Replace hack with truthful actor validation if retained. |
| `tests/integration/database-runtime.test.ts` | Positive queries omit actor; one test uses `actorId: tenantA`. | Replace positive actor cases with real fixture users; preserve actorless deny coverage. |
| `src/server/db/generated/database.ts` | R03 should regenerate full schema types from fresh DB. | Re-run drift; no hand edits. |
| `.github/workflows/supabase-db-quality.yml` | Canonical DB chain. | Must remain full-strength and green. |
| `.github/workflows/next-flow-quality.yml` | Application quality. | Must remain green if DB runtime code/tests are changed. |

---

# 7. Files to CREATE

Expected/allowed:

## 7.1 Forward corrective authorization migration

Preferred when semantic helper/policy changes are required after R03 has established clean migration history.

Naming must follow current Supabase timestamp migration convention.

Responsibility may include only R04 baseline hardening such as:

- corrected membership branch semantics;
- corrected permission helper branch semantics;
- narrow authorization-control table policy hardening.

Do not combine Auth.js schema/product work.

## 7.2 Dedicated actor authorization DB test

Recommended path:

```text
supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql
```

or repository-consistent equivalent.

It should own helper/RLS actor matrix rather than burying every assertion inside the historical Phase 2 structural test.

## 7.3 Unit test for actor validation helper

Only if application DB context validation is refactored.

No other new application module is required.

---

# 8. Files to MODIFY

Likely:

- `supabase/seed.sql`;
- new or existing forward migration for helper/policy correction;
- SQL authorization tests;
- `apps/web/next-flow/tests/integration/database-runtime.test.ts`;
- `apps/web/next-flow/src/server/db/context.ts` if actor validation is separated;
- `apps/web/next-flow/src/server/db/identity-transaction.ts` if fake-tenant validation is removed;
- generated DB types only through codegen if schema shape legitimately changes;
- DB README/docs only if the actor baseline contract becomes materially different from documented behavior.

Do not modify product UI/auth routes.

---

# 9. Files to MOVE

No move expected.

Do not rename historical migrations.

---

# 10. Files to REMOVE

No removal expected.

Do not remove:

- existing permission catalog;
- membership helpers without replacement;
- current RLS protections;
- actorless default-deny tests;
- DB runtime context tests;
- identity role foundation;
- generated-type drift check.

---

# 11. Database Changes

## 11.1 Fixture data

Synthetic test/local seed only.

No production identities.

No real email required unless repository fixtures require a deterministic synthetic email; if used, it must be clearly non-production/test-only.

No credentials or password hashes required.

## 11.2 Membership helper correction

Required if current helper still has semantics equivalent to:

```sql
(target_branch_id is null or m.branch_id is null or m.branch_id = target_branch_id)
```

because that makes any branch-specific membership satisfy a tenant-level null-branch request.

Required semantic form must distinguish the two cases explicitly.

Conceptually:

```text
IF requested branch is NULL
  require membership.branch_id IS NULL
ELSE
  allow membership.branch_id IS NULL
  OR membership.branch_id = requested branch
```

Implementation SQL may differ but behavior must match tests.

## 11.3 Permission helper correction

Same branch-scope semantics as membership helper plus actual role-permission relationship.

## 11.4 Authorization-control RLS hardening

R04 must inspect final R03 grants/policies for `app.roles` and `app.memberships`.

If ordinary active members can mutate these tables merely by having membership, R04 must add narrow permission-aware write protection sufficient to deny ordinary self-elevation.

Do not broaden runtime privileges.

## 11.5 Production DB

```text
PRODUCTION_DB_MODIFIED: NO
REMOTE_DB_PUSHED: NO
LINKED_DB_RESET: NO
PRODUCTION_CREDENTIAL_SEEDED: NO
```

---

# 12. Backend Changes

No product backend feature work.

Permitted server-side work:

- truthful UUID/actor validation;
- identity transaction validation cleanup;
- DB runtime test compatibility.

Do not add Auth.js routes/providers/session logic.

Do not add AccessContext/workspace services.

---

# 13. Frontend Changes

None.

---

# 14. Authentication and Authorization

## Authentication

Unchanged.

Legacy/custom staff authentication remains until the later Identity/Auth.js phase.

R04 does not authenticate humans.

## Database authorization

R04 is authoritative only for the tested database baseline:

```text
actor identity UUID
+
user status
+
membership status
+
tenant scope
+
branch scope
+
selected permission helper
+
RLS
```

It does not constitute end-to-end application authorization.

## Customer

Customer QR/table ordering remains separate and is not converted to staff identity semantics.

---

# 15. Security Requirements

- real actor test IDs must reference `app.users.id`;
- no tenant UUID masquerading as actor UUID;
- no production user or credential in seed;
- no plaintext password;
- no secret in repository/tests/logs;
- active user required for actor helper allow;
- active membership required;
- branch-only membership must never imply tenant-wide membership;
- cross-tenant actor access denied;
- wrong same-tenant branch denied for branch-only actor;
- no actor remains default-deny;
- ordinary actor self-elevation path denied;
- authorization-control write policies must not use broad membership-only `FOR ALL` if that permits privilege escalation;
- no `BYPASSRLS`;
- no service-role/superuser in normal runtime path;
- security-definer functions retain fixed safe search path and narrow execute grants;
- no production/linked DB mutation;
- test evidence must not leak connection secrets;
- no weakening of R03 structural RLS to make positive tests pass.

---

# 16. Failure and Recovery Paths

| Failure | Expected R04 response |
|---|---|
| R03 implementation not merged | STOP. |
| R03 Supabase DB quality not green | STOP; return to R03. |
| Main advanced after spec | Inspect intervening commits and use latest main. |
| R03 changed helper/policy structure | Re-audit final state before applying this spec; preserve behavioral objectives. |
| Branch-only actor passes tenant-level helper | R04 blocker; correct helper and add regression test. |
| Wrong same-tenant branch actor passes | R04 blocker; correct scope semantics/policy. |
| Suspended/deactivated user passes | R04 blocker. |
| Revoked/suspended/invited membership passes | R04 blocker. |
| Permission helper passes absent permission | R04 blocker. |
| Ordinary staff can modify own role/membership to elevate | Critical R04 blocker; harden control-table write policy. |
| Manager fixture cannot perform intended management helper allow | Inspect fixture/permission/policy; do not grant broad bypass. |
| Runtime test still uses tenant ID as actor | Replace with real user fixture; do not normalize the bad assumption. |
| `withIdentityTransaction()` fake-tenant validation causes issue | Introduce narrow actor UUID validator; preserve server-only boundary. |
| `flow_identity` cannot read broad role/permission workspace data | Record as future Identity/Auth.js gap unless narrow R04 contract requires it. |
| Full operational permission enforcement remains incomplete | Expected deferred state; document, do not expand R04. |
| Codegen drift appears unexpectedly | Regenerate/review schema truth; do not hand edit. |
| Next Flow Quality regresses due DB runtime change | Fix before merge. |
| Supabase DB Quality regresses | Fix R04-owned regression before merge. |
| Production access appears necessary | STOP and request owner decision; R04 validation is local/CI. |

---

# 17. Dependencies

## Internal

- owner-merged R03 implementation;
- green R03 `Supabase Database Quality`;
- final R03 migrations;
- final R03 seed;
- final R03 structural tests;
- current historical actor/RBAC migration;
- current permission catalog;
- DB context/transaction/identity transaction helpers;
- DB runtime tests;
- `Supabase Database Quality`;
- `Next Flow Quality`;
- Phase/Round Gate.

## External execution

- GitHub Actions;
- Docker-compatible runtime;
- repository-pinned Supabase CLI;
- PostgreSQL local image/config;
- Node.js 22;
- npm.

No external identity provider or production secret required.

---

# 18. Tests

## 18.1 Fixture integrity

- [ ] Tenant A has at least two branches for same-tenant wrong-branch testing.
- [ ] Tenant B remains isolated.
- [ ] tenant-wide valid actor A exists.
- [ ] branch-A1 actor exists.
- [ ] branch-A2 actor exists.
- [ ] suspended/deactivated actor exists as needed.
- [ ] revoked-member actor exists.
- [ ] valid Tenant B actor exists.
- [ ] tenant-scoped synthetic roles exist.
- [ ] minimal role-permission relationships exist.
- [ ] no real credentials/passwords exist.

## 18.2 Membership helper tests

Required matrix:

```text
actor missing                              → false
unknown actor                              → false
active tenant-wide A → tenant A/null       → true
active tenant-wide A → branch A1           → true
active tenant-wide A → branch A2           → true
branch A1 actor → tenant A/null             → false
branch A1 actor → branch A1                 → true
branch A1 actor → branch A2                 → false
branch A1 actor → tenant B/branch B1        → false
suspended user A → branch A1                → false
revoked membership A → branch A1            → false
Tenant B actor → Tenant A                   → false
```

Add invited/suspended membership cases if fixtures are included.

## 18.3 Permission helper tests

At minimum:

```text
manager/admin fixture + assigned permission     → true
staff fixture + ordinary assigned permission    → true
staff fixture + member.manage                    → false
staff fixture + role.manage                      → false
wrong branch + otherwise valid permission        → false
wrong tenant + otherwise valid permission        → false
suspended/revoked actor + assigned permission    → false
```

## 18.4 Actual RLS tests

Use representative membership-protected relations.

At minimum prove:

- actorless default deny;
- valid tenant-wide actor positive access;
- valid branch actor positive access on same branch;
- wrong same-tenant branch deny;
- cross-tenant deny;
- suspended/revoked deny.

Do not rely solely on direct function calls.

## 18.5 Privilege-escalation tests

Ordinary staff without management permissions must fail to:

- assign itself a management role;
- create tenant-wide membership for itself;
- reactivate revoked membership;
- create/modify a role to gain elevated permissions.

Where manager/admin permission allow behavior is tested, ensure it is explicitly permission-based rather than broad membership-based.

## 18.6 DB runtime integration

- [ ] actorless positive-data query remains denied;
- [ ] real tenant-wide actor positive query passes;
- [ ] real branch actor same-branch query passes;
- [ ] same-tenant wrong-branch query denied;
- [ ] cross-tenant denied;
- [ ] actor context reports real `app.users.id`;
- [ ] no context leak after commit;
- [ ] no context leak after rollback;
- [ ] concurrency isolation preserved.

## 18.7 Identity transaction

If tested:

- [ ] valid real actor ID accepted;
- [ ] malformed actor ID rejected without fake tenant;
- [ ] own-user row visibility follows policy;
- [ ] another-user identity row denied under current narrow contract.

## 18.8 Regression

- [ ] fresh bootstrap remains green;
- [ ] structural R03 tests remain green;
- [ ] DB lint green;
- [ ] codegen/drift green;
- [ ] `Supabase Database Quality` green;
- [ ] `Next Flow Quality` green if triggered.

---

# 19. Validation Commands

Base evidence:

```bash
git status
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

Application install/toolchain:

```bash
cd apps/web/next-flow
node --version
npm --version
npm ci
```

From repository root:

```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

Generated types from `apps/web/next-flow`:

```bash
npm run db:generate
npm run db:verify-types
```

or the exact repository-supported equivalent; record the actual commands used.

DB runtime:

```bash
npm run test:db-runtime
```

Application preservation when triggered:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run build:next
```

Every result uses:

```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

---

# 20. PR Requirements

R04 implementation PR must include:

```text
Specification: FLOW_P01_R04_IMPLEMENTATION_SPEC.md
Phase: 01
Round: 04
Previous: FLOW_P01_R03_IMPLEMENTATION_SPEC.md
Previous PR: <actual R03 implementation PR>
Related Issue: #24
Next Specification: FLOW_P01_R05_IMPLEMENTATION_SPEC.md
```

Required base evidence:

```text
SPEC_BASE_SHA: 6c332ab1b3204135576bd987427603bb4dab7b1b
R03_IMPLEMENTATION_PR: ...
R03_MERGE_SHA: ...
R03_SUPABASE_DB_QUALITY: PASS
IMPLEMENTATION_BASE_SHA: ...
IMPLEMENTATION_HEAD_SHA: ...
```

Required fixture evidence:

```text
SECOND_TENANT_A_BRANCH_ADDED:
ACTOR_FIXTURES_ADDED:
TENANT_WIDE_ACTOR:
BRANCH_A1_ACTOR:
BRANCH_A2_ACTOR:
SUSPENDED_ACTOR:
REVOKED_MEMBER_ACTOR:
TENANT_B_ACTOR:
ROLE_FIXTURES_ADDED:
ROLE_PERMISSION_FIXTURES_ADDED:
CREDENTIAL_FIXTURES_ADDED: NO
```

Required semantic evidence:

```text
TENANT_WIDE_MEMBERSHIP_SEMANTICS:
BRANCH_MEMBERSHIP_SEMANTICS:
ACTOR_HELPER_CHANGED:
PERMISSION_HELPER_CHANGED:
AUTHORIZATION_CONTROL_RLS_CHANGED:
SELF_ELEVATION_DENIED:
```

Required test evidence:

```text
NO_ACTOR_DENY: PASS
TENANT_WIDE_ALLOW: PASS
BRANCH_SAME_ALLOW: PASS
BRANCH_WRONG_DENY: PASS
CROSS_TENANT_DENY: PASS
SUSPENDED_USER_DENY: PASS
REVOKED_MEMBERSHIP_DENY: PASS
PERMISSION_ALLOW: PASS
PERMISSION_DENY: PASS
SELF_ROLE_ELEVATION_DENY: PASS
SELF_MEMBERSHIP_ELEVATION_DENY: PASS
DB_RUNTIME_REAL_ACTOR: PASS
IDENTITY_TRANSACTION_REAL_ACTOR: PASS / NOT APPLICABLE
DB_SQL_TESTS: PASS
DB_LINT: PASS
DB_TYPE_DRIFT: PASS
SUPABASE_DB_QUALITY: PASS
NEXT_FLOW_QUALITY: PASS / NOT APPLICABLE
```

Required production/scope declarations:

```text
PRODUCTION_DB_MODIFIED: NO
REMOTE_DB_PUSHED: NO
PRODUCTION_SECRET_USED: NO
AUTHJS_IMPLEMENTED: NO
LOGIN_RUNTIME_CHANGED: NO
ACCESS_CONTEXT_IMPLEMENTED: NO
ROUTE_AUTHORIZATION_IMPLEMENTED: NO
FULL_OPERATIONAL_PERMISSION_RLS_IMPLEMENTED: NO
BUSINESS_PERSISTENCE_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
KITCHEN_REDESIGN: NO
OMISE_IMPLEMENTED: NO
STRIPE_IMPLEMENTED: NO
CUSTOMER_REDESIGN: NO
VOICE_IMPLEMENTED: NO
```

No auto-merge. Owner/manual merge required.

---

# 21. Definition of Done

P01/R04 is complete only when all applicable requirements are proven.

## Entry gate

- [ ] R03 implementation owner-merged;
- [ ] R03 required checks green;
- [ ] latest main inspected;
- [ ] R04 branch from latest main.

## Synthetic actor baseline

- [ ] deterministic users exist;
- [ ] deterministic tenant-scoped roles exist;
- [ ] deterministic memberships exist;
- [ ] deterministic permission grants exist;
- [ ] second same-tenant branch exists for wrong-branch testing;
- [ ] no real credentials/passwords added.

## Membership semantics

- [ ] tenant-wide = membership branch null;
- [ ] branch-only does not pass tenant-level null target;
- [ ] branch-only passes exact branch;
- [ ] branch-only fails other branch;
- [ ] tenant-wide passes valid branch checks;
- [ ] wrong tenant fails;
- [ ] inactive user fails;
- [ ] non-active membership fails.

## Permission semantics

- [ ] permission helper respects same membership scope;
- [ ] actual permission relationship required;
- [ ] absent permission denied;
- [ ] wrong branch/tenant denied;
- [ ] inactive actor denied.

## RLS

- [ ] helper-level tests pass;
- [ ] actual relation RLS allow/deny tests pass;
- [ ] actorless default deny retained;
- [ ] cross-tenant deny retained;
- [ ] wrong same-tenant branch deny proven.

## Privilege escalation

- [ ] ordinary actor cannot elevate own membership;
- [ ] ordinary actor cannot reactivate revoked membership;
- [ ] ordinary actor cannot create/modify role for self-elevation;
- [ ] authorization-control writes no longer rely on an unsafe broad membership-only path.

## Runtime

- [ ] positive actor tests use real `app.users.id`;
- [ ] no tenant ID used as actor identity;
- [ ] transaction-local context preserved;
- [ ] no pooled connection leakage;
- [ ] fake-tenant identity validation removed if identity transaction remains in baseline.

## Quality

- [ ] DB SQL tests pass;
- [ ] DB lint pass;
- [ ] codegen/type drift pass;
- [ ] DB runtime pass;
- [ ] `Supabase Database Quality` pass;
- [ ] `Next Flow Quality` pass if triggered.

## Scope discipline

- [ ] no Auth.js;
- [ ] no login provider;
- [ ] no workspace UI/AccessContext;
- [ ] no route authorization;
- [ ] no full operational permission RLS conversion;
- [ ] no persistence/realtime/kitchen/payment/voice work;
- [ ] no R05/R06 work.

Before owner merge:

```text
P01/R04 = IMPLEMENTED / WAITING FOR OWNER MERGE
```

After owner merge:

```text
P01/R04 = COMPLETE
```

---

# 22. Handoff to Next Round

R05 should inherit:

```text
DETERMINISTIC DEPENDENCY BASELINE
+
GREEN APPLICATION BASELINE
+
GREEN FRESH DATABASE BASELINE
+
ACTORLESS DEFAULT-DENY BASELINE
+
REAL SYNTHETIC ACTOR FIXTURES
+
PROVEN TENANT-WIDE / BRANCH MEMBERSHIP SEMANTICS
+
PROVEN PERMISSION HELPER BASELINE
+
PROVEN CROSS-TENANT / WRONG-BRANCH / INACTIVE-ACTOR DENIAL
+
PROTECTED AUTHORIZATION-CONTROL SELF-ELEVATION SURFACES
+
GREEN SUPABASE DATABASE QUALITY
```

R05 owns repository/CI/deployment baseline recovery, including inherited gitlink/submodule cleanup and deployment-state normalization.

R04 must record but not absorb those issues.

Required next specification:

```text
FLOW_P01_R05_IMPLEMENTATION_SPEC.md
```

After R04 implementation is owner-merged, if the exact R05 spec is absent from `main`, stop.

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

Legal R04 sequence:

```text
R04 SPEC MERGED TO MAIN
        ↓
WAIT FOR R03 IMPLEMENTATION OWNER MERGE
        ↓
VERIFY R03 REQUIRED CHECKS GREEN
        ↓
FETCH LATEST MAIN
        ↓
READ R03 FINAL HANDOFF
        ↓
RE-AUDIT FINAL MIGRATIONS / SEED / TESTS
        ↓
CREATE R04 IMPLEMENTATION BRANCH
        ↓
ADD SYNTHETIC ACTOR / ROLE / MEMBERSHIP / BRANCH FIXTURES
        ↓
PROVE CURRENT HELPER SEMANTICS
        ↓
CORRECT TENANT-WIDE VS BRANCH SEMANTICS IF NEEDED
        ↓
CORRECT PERMISSION HELPER SCOPE IF NEEDED
        ↓
PROTECT ROLE / MEMBERSHIP SELF-ELEVATION SURFACES
        ↓
ADD SQL ACTOR AUTHORIZATION MATRIX
        ↓
UPDATE DB RUNTIME TESTS WITH REAL USER ACTORS
        ↓
REMOVE FAKE-TENANT ACTOR VALIDATION HACK IF APPLICABLE
        ↓
RUN FRESH RESET + DB TESTS + LINT + CODEGEN + DRIFT + RUNTIME
        ↓
SUPABASE DATABASE QUALITY PASS
        ↓
NEXT FLOW QUALITY PASS IF TRIGGERED
        ↓
OPEN R04 IMPLEMENTATION PR
        ↓
STOP FOR OWNER REVIEW
        ↓
OWNER MANUAL MERGE
        ↓
P01/R04 COMPLETE
        ↓
VERIFY R05 SPEC
        ↓
IF ABSENT → STOP
```

Explicit prohibitions:

```text
NO R04 IMPLEMENTATION BEFORE R03 OWNER MERGE
NO DIRECT MAIN PUSH
NO AUTO-MERGE
NO PRODUCTION DB MUTATION
NO REAL CREDENTIALS
NO TENANT UUID AS ACTOR ID
NO BRANCH-ONLY MEMBERSHIP TREATED AS TENANT-WIDE
NO BYPASSRLS
NO BROAD SELF-ELEVATION PATH
NO FULL PRODUCT PERMISSION/RBAC ROLLOUT
NO AUTH.JS
NO CUSTOMER PERSISTENCE
NO PAYMENT / VOICE / REALTIME / KITCHEN PRODUCT WORK
NO R05 IMPLEMENTATION WITHOUT ITS SPEC
```

Final R04 success test:

```text
Fresh DB still green? YES
Real synthetic actors exist? YES
Tenant-wide membership semantics explicit? YES
Branch-only semantics explicit? YES
Wrong same-tenant branch denied? YES
Cross-tenant denied? YES
Suspended/revoked denied? YES
Permission helper allow/deny proven? YES
Ordinary self-elevation denied? YES
Runtime positive tests use app.users.id? YES
Actorless default deny preserved? YES
Supabase Database Quality green? YES
Auth.js still deferred? YES
Production DB untouched? YES
```
