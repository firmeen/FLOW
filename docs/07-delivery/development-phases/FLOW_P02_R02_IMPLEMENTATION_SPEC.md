# FLOW P02 R02 — Implementation Specification

> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization  
> Round 02 — Deterministic Credential Fixtures + Authorization Contract Verification  
> Revision — Executable specification for deterministic identity fixtures and authorization proof

---

## Metadata

- Phase: `02`
- Round: `02`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P02_R01_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R03_IMPLEMENTATION_SPEC.md`
- Current planning scope: `PHASE 02 / ROUND 02 ONLY`
- Recommended implementation branch: `p02-r02-credential-fixtures-authorization-contracts`
- Recommended implementation PR title: `feat(identity): establish P02 R02 credential fixtures and authorization contracts`
- Document validation authority: `THIS SPECIFICATION CONTENT ONLY`
- CI/GitHub Actions gate for spec creation: `NOT APPLICABLE`

---

# 0. Document Validation Rule

This specification is valid when the document itself is internally complete, correctly linked to the previous and next Phase/Round documents, has a bounded scope, defines executable deliverables, names acceptance evidence, and does not conflict with the Phase 02 decomposition.

The creation or readiness of this specification is **not blocked by GitHub Actions, application CI, database CI, deployment checks, or prior implementation workflow status**. Those checks belong to implementation execution, not document validation.

Document validation must answer only:

```text
Is the Phase/Round correct?
Is Previous correct?
Is Next correct?
Is Status present?
Is scope explicit?
Are deliverables executable?
Are acceptance conditions explicit?
Are non-goals explicit?
Is the handoff to the next round explicit?
```

If all are satisfied, the document is READY.

---

# 1. Phase 02 Objective

Phase 02 establishes one coherent internal human identity and authorization path:

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

The six-round decomposition is:

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

R02 must make the identity and authorization model deterministic enough that R03 can connect Auth.js to a known, testable set of users, memberships, roles, branches, and permissions without inventing behavior during the cutover.

---

# 2. R02 Objective

R02 establishes reproducible identity fixtures and proves the authorization contracts that later rounds will consume.

The completed R02 implementation must provide:

```text
DETERMINISTIC TEST USERS
+
DETERMINISTIC CREDENTIALS
+
DETERMINISTIC ORGANIZATION / BRANCH MEMBERSHIPS
+
DETERMINISTIC ROLE ASSIGNMENTS
+
DETERMINISTIC PERMISSION ASSIGNMENTS
+
ACTIVE / INACTIVE / DISABLED IDENTITY CASES
+
TENANT-LEVEL MEMBERSHIP CASES
+
BRANCH-SCOPED MEMBERSHIP CASES
+
CROSS-TENANT DENIAL CASES
+
CROSS-BRANCH DENIAL CASES
+
ROLE / PERMISSION CONTRACT TESTS
+
PRE-AUTH LOOKUP CONTRACT TESTS
+
REUSABLE AUTHORIZATION FIXTURE HELPERS
```

R02 does not cut over live authentication. It creates trusted deterministic data and proves the contracts that R03–R06 depend on.

---

# 3. Entry Conditions

Before implementation begins, verify only the repository/document facts required to execute this round:

- [ ] `FLOW_P02_R02_IMPLEMENTATION_SPEC.md` exists on current `main`.
- [ ] `Phase = 02`.
- [ ] `Round = 02`.
- [ ] `Status = READY`.
- [ ] `Previous = FLOW_P02_R01_IMPLEMENTATION_SPEC.md`.
- [ ] `Next = FLOW_P02_R03_IMPLEMENTATION_SPEC.md`.
- [ ] Current R01 identity/pre-auth surfaces are re-read from the execution baseline.
- [ ] Existing seed, SQL tests, generated DB types, and identity modules are re-audited before modification.

No GitHub Actions result is required to declare this document READY.

---

# 4. Scope

## 4.1 In Scope

R02 owns:

- deterministic internal human-user fixtures;
- deterministic password credential fixtures using the existing supported credential algorithm;
- deterministic tenant/organization fixtures needed for authorization tests;
- deterministic branch fixtures needed for branch-scoped access tests;
- deterministic roles and permission mappings;
- deterministic memberships that cover tenant-wide and branch-scoped access;
- inactive user fixtures;
- inactive membership fixtures;
- disabled credential fixtures;
- cross-tenant denial fixtures;
- cross-branch denial fixtures;
- SQL verification of role, membership, permission, and RLS contracts;
- server/runtime tests that consume deterministic fixtures where appropriate;
- fixture naming conventions that remain stable for later Auth.js tests;
- fixture helper utilities where they reduce duplication without creating a generic test framework;
- documentation comments needed to make fixture purpose explicit.

## 4.2 Out of Scope

R02 must not:

- cut `/api/auth/login` over to database credentials;
- create the final Auth.js Credentials provider;
- replace the legacy session cookie;
- remove JOSE session code;
- remove temporary internal-auth environment variables;
- implement workspace chooser UI;
- implement route-level permission guards;
- implement revocation propagation into a live Auth.js session;
- remove legacy authentication;
- add customer authentication;
- change unrelated FoodFlow domain behavior;
- redesign the entire seed architecture when targeted fixture extensions are sufficient.

---

# 5. Canonical Fixture Matrix

R02 should create a deterministic authorization matrix comparable to the following. Exact UUIDs may differ, but they must be stable constants committed to source.

| Fixture | User State | Credential State | Membership | Scope | Expected Result |
|---|---|---|---|---|---|
| owner-a | ACTIVE | ENABLED | ACTIVE | Tenant A / all branches | Full configured admin permissions |
| staff-a-branch-1 | ACTIVE | ENABLED | ACTIVE | Tenant A / Branch 1 | Branch 1 staff access only |
| kitchen-a-branch-1 | ACTIVE | ENABLED | ACTIVE | Tenant A / Branch 1 | Branch 1 kitchen access only |
| cashier-a-branch-2 | ACTIVE | ENABLED | ACTIVE | Tenant A / Branch 2 | Branch 2 cashier access only |
| inactive-user-a | INACTIVE | ENABLED | ACTIVE | Tenant A | Credential lookup denied |
| disabled-credential-a | ACTIVE | DISABLED | ACTIVE | Tenant A | Credential lookup denied |
| inactive-membership-a | ACTIVE | ENABLED | INACTIVE | Tenant A | Authentication may identify user; authorization denied |
| staff-b-branch-1 | ACTIVE | ENABLED | ACTIVE | Tenant B / Branch 1 | Tenant B only; Tenant A denied |

The exact roles and permissions must be derived from the repository’s canonical permission catalog at execution time, not invented independently in tests.

---

# 6. Deterministic Credential Requirements

All credential fixtures must:

- use the currently supported credential algorithm from R01;
- contain no plaintext password in database columns;
- use stable, documented test-only input passwords;
- be reproducible after a clean database reset;
- produce the same logical identity state on every reset;
- include at least one valid credential, one disabled credential, and one identity that must not be discoverable through the pre-auth lookup;
- avoid using production secrets or environment-provided production credentials;
- remain clearly marked as local/test fixture data.

If precomputed password hashes are committed, the source must state that they are test fixtures only and must never be reused as production credentials.

---

# 7. Authorization Contracts to Prove

R02 must prove the following contracts with executable tests.

## 7.1 Identity Contract

```text
normalized login identifier
→ exactly one active credential candidate
```

Tests must prove:

- case-insensitive normalized lookup;
- whitespace normalization behavior;
- inactive users are not returned;
- disabled credentials are not returned;
- unknown users return no candidate;
- cross-tenant membership state does not alter identity lookup itself.

## 7.2 Membership Contract

```text
identified actor
→ active membership
→ tenant / branch scope
```

Tests must prove:

- active tenant-wide membership is accepted for its tenant;
- branch-scoped membership is accepted for its branch;
- branch-scoped membership is denied for sibling branches unless repository semantics explicitly permit otherwise;
- inactive membership is denied;
- membership from another tenant is denied;
- no membership means no internal workspace authority.

## 7.3 Permission Contract

```text
active membership
+ assigned role
+ mapped permission
→ permission decision
```

Tests must prove both positive and negative permissions for at least admin/owner, staff, kitchen, and cashier-style roles where those canonical roles exist.

## 7.4 RLS Defense-in-Depth Contract

Application authorization tests are not enough. SQL tests must prove that an actor cannot read or mutate data outside the actor’s permitted tenant/branch context through the database runtime role.

At minimum prove:

- same-tenant allowed path;
- cross-tenant denial;
- allowed branch path;
- disallowed sibling-branch denial;
- inactive membership denial;
- missing actor/context denial where applicable.

---

# 8. Expected Repository Impact

Exact files depend on the current execution baseline, but the implementation should normally inspect and potentially modify:

```text
supabase/seed.sql
supabase/tests/database/p02_r01_identity_pre_auth_boundary.test.sql
supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql
apps/web/next-flow/tests/integration/authentication-database.test.ts
apps/web/next-flow/tests/integration/database-runtime.test.ts
apps/web/next-flow/src/server/db/generated/database.ts
apps/web/next-flow/src/modules/identity/server/*
```

R02 may create focused fixture/test files such as:

```text
supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql
apps/web/next-flow/tests/fixtures/identity.ts
apps/web/next-flow/tests/integration/identity-authorization-contract.test.ts
```

Do not create a new abstraction layer if the existing seed/test structure can express the fixtures clearly.

---

# 9. Fixture Stability Rules

Fixture identifiers are part of the Phase 02 test contract once R02 merges.

Therefore:

- stable UUIDs must be explicit constants;
- emails/usernames used by later rounds must remain stable;
- tenant and branch IDs must remain stable;
- role IDs or canonical role codes must remain stable where referenced by later tests;
- permissions should be referenced by canonical permission codes rather than incidental row order;
- tests must not rely on `limit 1` without a deterministic predicate;
- tests must not rely on insertion order;
- tests must not infer tenant or branch from display names alone when stable IDs/codes exist.

---

# 10. Negative Test Matrix

R02 is incomplete without explicit denial cases.

Required negative scenarios:

- [ ] unknown email cannot resolve a credential candidate;
- [ ] inactive user cannot resolve a credential candidate;
- [ ] disabled credential cannot resolve a credential candidate;
- [ ] active user with inactive membership has no authorization;
- [ ] Tenant A actor cannot inherit Tenant B membership or permissions;
- [ ] Branch 1-scoped actor cannot act in Branch 2 without explicit tenant-wide semantics;
- [ ] staff role cannot satisfy kitchen-only permission unless assigned;
- [ ] kitchen role cannot satisfy cashier-only permission unless assigned;
- [ ] cashier role cannot satisfy admin-only permission unless assigned;
- [ ] pre-auth role cannot directly select protected credential/domain tables;
- [ ] runtime role cannot bypass actor/tenant context requirements.

---

# 11. Implementation Sequence

Implement R02 in this order:

```text
1. Re-audit current seed and authorization catalog
2. Define stable fixture IDs and naming
3. Add deterministic users
4. Add deterministic credentials
5. Add deterministic organizations / branches as needed
6. Add deterministic roles / permission mappings
7. Add deterministic memberships
8. Add inactive / disabled / cross-scope cases
9. Add SQL authorization contract tests
10. Add server/runtime integration tests where useful
11. Regenerate DB types only if schema changed
12. Record implementation evidence in the PR
```

Do not mix Auth.js session cutover work into this sequence.

---

# 12. Acceptance Criteria

R02 implementation is complete when the implementation branch contains all required deterministic fixtures and executable authorization contract tests.

Document-level acceptance for this spec is satisfied when:

- [x] Phase is explicitly `02`.
- [x] Round is explicitly `02`.
- [x] Status is `READY`.
- [x] Previous points to `FLOW_P02_R01_IMPLEMENTATION_SPEC.md`.
- [x] Next points to `FLOW_P02_R03_IMPLEMENTATION_SPEC.md`.
- [x] R02 objective is explicit.
- [x] In-scope work is explicit.
- [x] Out-of-scope work is explicit.
- [x] Fixture matrix is explicit.
- [x] Positive authorization contracts are explicit.
- [x] Negative authorization contracts are explicit.
- [x] Expected repository impact is explicit.
- [x] Implementation sequence is explicit.
- [x] Next-round handoff is explicit.
- [x] GitHub Actions / CI are not used as a prerequisite for document readiness.

Therefore the specification status is:

```text
DOCUMENT VALIDATION: PASS
SPECIFICATION STATUS: READY
AUTHORIZED NEXT IMPLEMENTATION ROUND: P02/R02
```

---

# 13. PR Requirements for R02 Implementation

The future implementation PR should state:

```text
Specification: docs/07-delivery/development-phases/FLOW_P02_R02_IMPLEMENTATION_SPEC.md
Phase: P02
Round: R02
```

Its description should summarize:

- fixture identities created;
- tenants/branches represented;
- roles/permissions represented;
- positive authorization cases;
- negative authorization cases;
- any deviations from this spec caused by current-main structure.

Implementation CI results may be reported in that implementation PR, but they do not retroactively determine whether this specification document exists or is READY.

---

# 14. Handoff to P02/R03

R03 owns the live authentication cutover:

```text
P02/R03
Auth.js Credentials Authentication
+ Session Authority Cutover
```

R03 must be able to consume R02 fixtures without inventing new identity semantics.

R02 must hand R03:

- stable active credential identities;
- stable invalid/inactive credential cases;
- stable memberships;
- stable tenant and branch relationships;
- stable role/permission expectations;
- reusable authorization test expectations;
- a deterministic database reset state suitable for Auth.js credential-provider integration tests.

R02 must not perform R03’s live session cutover itself.

---

# 15. Final Document State

```text
CURRENT PHASE: P02
CURRENT ROUND: R02
SPECIFICATION: PRESENT
DOCUMENT VALIDATION: PASS
STATUS: READY
PREVIOUS: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
NEXT: FLOW_P02_R03_IMPLEMENTATION_SPEC.md
CI REQUIRED FOR DOCUMENT VALIDATION: NO
```
