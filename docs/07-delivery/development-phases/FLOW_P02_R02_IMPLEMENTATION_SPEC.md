# FLOW P02 R02 — Implementation Specification

> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization
> Round 02 — Deterministic Credential Fixtures + Authorization Contract Verification
> Revision — High-impact deterministic identity, fixture, authorization, and validation contract

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
- Recommended implementation PR title: `feat(identity): establish P02 R02 deterministic auth fixtures and contracts`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Owner merge control for implementation: `YES`
- Agent implementation merge allowed: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Original specification PR: `#55`
- Original specification merge SHA: `d3fe600a1544e254c10b812418034b0a17d984c7`
- Amendment reason: `Original R02 specification was approximately 473 lines and did not satisfy the current executable-spec depth contract.`
- Amendment implementation-state observation: `No p02-r01* or p02-r02* implementation branch was found at amendment authoring time.`
- Amendment current-round observation: `P02/R01 remains the earliest not-started implementation round; this R02 document may exist on main but does not authorize skipping R01.`

---

# 0. Document Authority and Amendment Intent

This file is the executable specification for Phase 02 Round 02.

This revision replaces the shallow R02 document with a deep implementation contract.

The purpose is not to make the file long for appearance.

The purpose is to remove implementation ambiguity before R02 begins.

The document must be usable by a development agent without guessing:

- which fixtures must exist;
- which identities must exist;
- which credential states must exist;
- which tenants must exist;
- which branches must exist;
- which roles must exist;
- which permission mappings must exist;
- which memberships must exist;
- which positive cases must pass;
- which negative cases must fail;
- which database boundaries must remain unchanged;
- which server helpers may be introduced;
- which files may be modified;
- which files should not be modified;
- which tests must be added;
- which regressions must remain green;
- which scope belongs to R03 instead;
- which evidence must be recorded in the implementation PR.

The specification must stay within R02 scope.

The specification must not pre-implement R03 through prose.

The specification must not redefine R01 architecture.

The specification must consume the final R01 implementation handoff when R01 actually exists.

The implementation agent must re-audit the latest R01 branch before writing R02 code.

The implementation agent must prefer actual current code over authoring-time assumptions.

---

# 1. Current Repository State at Amendment Authoring

The current `main` SHA observed before this amendment branch was created is:

```text
d3fe600a1544e254c10b812418034b0a17d984c7
```

That commit merged the original P02/R02 specification.

The original P02/R02 file was approximately 473 lines.

The current depth policy requires 1,800–2,500 lines for executable round specs.

The existing R02 file is therefore too shallow under the current policy.

Repository branch search at amendment authoring time found:

```text
p02-r01* implementation branch: NONE
p02-r02* implementation branch: NONE
```

Therefore:

```text
P02/R01 implementation state = NOT STARTED
P02/R02 implementation state = NOT STARTED
```

This matters because R02 implementation must not start from `main` merely because this spec exists.

R02 must eventually branch from the latest approved R01 implementation branch.

Until R01 implementation exists and has a stable handoff:

```text
R02 SPEC MAY EXIST
R02 IMPLEMENTATION MUST NOT START
```

This document is therefore a prepared executable authority document.

It does not alter current round detection.

The earliest unfinished round remains authoritative for execution state.

---

# 2. Phase 02 Objective

Phase 02 establishes one coherent internal human identity and authorization path.

The target path is:

```text
LOGIN IDENTIFIER
→ PRE-AUTH LOOKUP
→ PASSWORD VERIFICATION
→ REAL app.users.id
→ AUTH.JS SESSION
→ ACTIVE MEMBERSHIP
→ TENANT / BRANCH ACCESS CONTEXT
→ PERMISSION CHECK
→ ACTOR-AWARE DB TRANSACTION
→ RLS DEFENSE IN DEPTH
→ REVOCATION / INVALIDATION
```

Phase 02 must remove shared-prototype authentication authority.

Phase 02 must preserve customer public-entry boundaries.

Phase 02 must keep authorization server-side.

Phase 02 must keep tenant isolation database-enforced.

Phase 02 must keep branch isolation database-enforced.

Phase 02 must keep inactive actors fail-closed.

Phase 02 must keep inactive memberships fail-closed.

Phase 02 must keep revoked memberships fail-closed.

Phase 02 must keep permission mapping explicit.

Phase 02 must avoid role-name checks as the only authority.

Phase 02 must create stable test identities.

Phase 02 must create stable credential verification cases.

Phase 02 must create stable authorization denial cases.

Phase 02 must create enough deterministic state for Auth.js cutover.

---

# 3. Phase 02 Six-Round Boundary

The intended decomposition is:

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

R01 builds secure pre-auth machinery.

R02 builds deterministic actors and proves authorization contracts.

R03 connects real credential verification to Auth.js.

R04 resolves workspace and session access context.

R05 enforces routes and commands by permission.

R06 removes temporary shared auth and performs acceptance.

R02 must not collapse this sequence.

---

# 4. R02 High-Impact Objective

R02 must transform the existing synthetic R04 authorization fixtures into a Phase-02-quality deterministic identity test contract.

R02 must not merely add more seed rows.

R02 must make identity state reproducible.

R02 must make credential state reproducible.

R02 must make role state reproducible.

R02 must make permission state reproducible.

R02 must make membership state reproducible.

R02 must make tenant/branch denial reproducible.

R02 must make future Auth.js integration tests deterministic.

R02 must ensure fixture identifiers become intentional contract data.

R02 must ensure test passwords are clearly test-only.

R02 must ensure hashes are deterministic or deterministically generated.

R02 must ensure no production secret is required.

R02 must ensure no production data is required.

R02 must ensure clean reset creates the same logical state.

R02 must ensure later rounds do not invent new identity semantics.

R02 must leave the live login/session authority unchanged.

---

# 5. R02 Completion Shape

The completed R02 branch should provide:

```text
DETERMINISTIC TENANT A
+
DETERMINISTIC TENANT B
+
DETERMINISTIC BRANCH A1
+
DETERMINISTIC BRANCH A2
+
DETERMINISTIC BRANCH B1
+
DETERMINISTIC ACTIVE OWNER/MANAGER
+
DETERMINISTIC BRANCH STAFF
+
DETERMINISTIC KITCHEN ACTOR
+
DETERMINISTIC CASHIER ACTOR
+
DETERMINISTIC CROSS-TENANT ACTOR
+
DETERMINISTIC INACTIVE USER
+
DETERMINISTIC INVITED MEMBERSHIP
+
DETERMINISTIC SUSPENDED MEMBERSHIP
+
DETERMINISTIC REVOKED MEMBERSHIP
+
DETERMINISTIC DISABLED CREDENTIAL
+
DETERMINISTIC NO-CREDENTIAL USER
+
DETERMINISTIC SUPPORTED PASSWORD HASHES
+
ROLE/PERMISSION CONTRACT
+
TENANT-WIDE MEMBERSHIP CONTRACT
+
EXACT-BRANCH MEMBERSHIP CONTRACT
+
CROSS-TENANT DENIAL CONTRACT
+
CROSS-BRANCH DENIAL CONTRACT
+
SELF-ELEVATION DENIAL CONTRACT
+
RLS CONTRACT
+
PRE-AUTH LOOKUP CONTRACT
+
REUSABLE TEST FIXTURE CONSTANTS
```

R02 should make R03 a thin integration step.

R03 should not need to create new test personas to prove login behavior.

---

# 6. Hard Execution Gate

R02 implementation must not begin simply because this file is `READY`.

Before R02 implementation starts:

- [ ] this exact spec exists on current `main`;
- [ ] `Status = READY`;
- [ ] current merge/branch policy is re-read from `main`;
- [ ] P02/R01 implementation branch exists;
- [ ] P02/R01 contains meaningful implementation code;
- [ ] R01 handoff is stable enough to consume;
- [ ] R01 pre-auth role/function names are re-read;
- [ ] R01 normalized-email design is re-read;
- [ ] R01 credential encoding contract is re-read;
- [ ] R01 throttle design is re-read;
- [ ] R01 identity server module paths are re-read;
- [ ] R01 relevant tests are re-read;
- [ ] R02 has no existing active implementation branch;
- [ ] R02 branch parent is the latest R01 implementation branch;
- [ ] no later main change superseded this spec;
- [ ] no production database action is required.

If R01 implementation branch is absent:

```text
R02 = NOT STARTED
STOP
```

If R01 branch exists but contains no meaningful implementation:

```text
R02 = BLOCKED BY R01
STOP
```

If R01 code diverges materially from this spec's assumptions:

```text
RE-AUDIT R02 SPEC
AMEND DOCUMENT IF NEEDED
THEN IMPLEMENT
```

---

# 7. Authority vs Implementation Lineage

Policy/spec authority comes from `main`.

Implementation code lineage comes from the latest round branch.

For R02 the intended path is:

```text
main
  └── contains R02 spec authority

p02-r01-...
  └── latest implementation code baseline
       └── p02-r02-credential-fixtures-authorization-contracts
```

Do not create R02 from `main` when R01 implementation exists only on its branch.

Do not require R01 merge merely to create the R02 child branch when current policy permits branch-chain continuation.

Do not use a stale R01 branch if a newer approved R01 lineage tip exists.

Record the exact R01 parent branch and SHA in the R02 implementation PR.

---

# 8. In Scope

R02 owns deterministic internal identity fixtures.

R02 owns deterministic credential fixtures.

R02 owns deterministic test-only credential input values.

R02 owns deterministic test-only password hashes or generation strategy.

R02 owns fixture identity constants.

R02 owns fixture tenant constants.

R02 owns fixture branch constants.

R02 owns fixture role constants.

R02 owns fixture membership constants.

R02 owns fixture permission expectations.

R02 owns active user positive cases.

R02 owns suspended user denial cases.

R02 owns invited membership denial cases.

R02 owns suspended membership denial cases.

R02 owns revoked membership denial cases.

R02 owns disabled credential denial cases.

R02 owns no-credential denial cases.

R02 owns cross-tenant denial cases.

R02 owns cross-branch denial cases.

R02 owns tenant-wide vs branch-scoped semantics verification.

R02 owns role/permission mapping verification.

R02 owns self-elevation regression verification.

R02 owns pre-auth lookup verification against deterministic fixtures.

R02 owns reusable test fixture helpers when useful.

R02 owns fixture reset reproducibility.

R02 owns test naming conventions used by R03–R06.

---

# 9. Out of Scope

R02 must not cut the live login route over to database credentials.

R02 must not create the final Auth.js Credentials provider.

R02 must not create the final Auth.js route handler.

R02 must not replace `foodflow_session`.

R02 must not remove custom JOSE session logic.

R02 must not remove `FOODFLOW_INTERNAL_*` variables.

R02 must not add Google OAuth.

R02 must not add social login.

R02 must not create workspace chooser UI.

R02 must not create tenant chooser UI.

R02 must not create branch chooser UI.

R02 must not create AccessContext product behavior.

R02 must not implement live session revocation.

R02 must not implement route-level permission enforcement.

R02 must not implement command-level permission enforcement.

R02 must not remove legacy auth.

R02 must not add customer account authentication.

R02 must not implement customer persistence.

R02 must not implement staff operational workflows.

R02 must not implement kitchen routing.

R02 must not implement realtime.

R02 must not implement payments.

R02 must not implement billing.

R02 must not implement voice ordering.

R02 must not mutate production data.

---

# 10. Existing Database Baseline to Preserve

The current repository already contains `app.organizations`.

The current repository already contains `app.restaurants`.

The current repository already contains `app.branches`.

The current repository already contains `app.users`.

The current repository already contains `app.roles`.

The current repository already contains `app.permissions`.

The current repository already contains `app.role_permissions`.

The current repository already contains `app.memberships`.

The current repository already contains `private.user_credentials`.

The current repository already contains `private.login_throttles`.

The current repository already contains R04 actor authorization helpers.

The current repository already contains tenant/branch RLS policies.

R02 must reuse these tables.

R02 must not create parallel identity tables.

R02 must not create parallel role tables.

R02 must not create parallel membership tables.

R02 must not create a second permission catalog.

---

# 11. Existing Seed Baseline to Reuse

Current `supabase/seed.sql` already contains synthetic Tenant A.

Current `supabase/seed.sql` already contains synthetic Tenant B.

Current seed contains Restaurant A.

Current seed contains Restaurant B.

Current seed contains Branch A1.

Current seed contains Branch A2.

Current seed contains Branch B1.

Current seed contains R04 synthetic users.

Current seed contains an R04 tenant-wide manager.

Current seed contains an R04 Branch A1 staff actor.

Current seed contains an R04 Branch A2 staff actor.

Current seed contains an R04 suspended user.

Current seed contains invited membership state.

Current seed contains suspended membership state.

Current seed contains revoked membership state.

Current seed contains Tenant B staff.

Current seed contains R04 manager/staff roles.

Current seed contains role-permission mappings.

Current seed does not currently seed real passwords.

R02 should extend this baseline deliberately.

R02 should avoid destroying useful R04 fixture identity continuity.

---

# 12. Existing Tenant and Branch Constants

Current Tenant A ID:

```text
00000000-0000-0000-0000-0000000000a1
```

Current Restaurant A ID:

```text
00000000-0000-0000-0000-0000000000a2
```

Current Branch A1 ID:

```text
00000000-0000-0000-0000-0000000000a3
```

Current Branch A2 ID:

```text
00000000-0000-0000-0000-0000000000ac
```

Current Tenant B ID:

```text
00000000-0000-0000-0000-0000000000b1
```

Current Restaurant B ID:

```text
00000000-0000-0000-0000-0000000000b2
```

Current Branch B1 ID:

```text
00000000-0000-0000-0000-0000000000b3
```

R02 should reuse these stable IDs unless R01 code demonstrates a concrete reason not to.

---

# 13. Existing R04 User Constants

Tenant A manager:

```text
30000000-0000-4000-8000-0000000000a1
```

Tenant A Branch A1 staff:

```text
30000000-0000-4000-8000-0000000000a2
```

Tenant A Branch A2 staff:

```text
30000000-0000-4000-8000-0000000000a3
```

Suspended user:

```text
30000000-0000-4000-8000-0000000000a4
```

Invited-membership user:

```text
30000000-0000-4000-8000-0000000000a5
```

Suspended-membership user:

```text
30000000-0000-4000-8000-0000000000a6
```

Revoked-membership user:

```text
30000000-0000-4000-8000-0000000000a7
```

Tenant B staff:

```text
30000000-0000-4000-8000-0000000000b1
```

R02 should preserve these actors when they remain compatible with final R01 identity normalization.

---

# 14. Existing R04 Role Constants

Tenant A manager role:

```text
50000000-0000-4000-8000-0000000000a1
```

Tenant A staff role:

```text
50000000-0000-4000-8000-0000000000a2
```

Tenant B staff role:

```text
50000000-0000-4000-8000-0000000000b1
```

Current R04 role codes include:

```text
R04_MANAGER
R04_STAFF
```

R02 must decide whether to preserve these test-role codes or add Phase-02-specific kitchen/cashier roles.

Do not rename existing role codes only for aesthetics.

If new roles are required, add only roles needed to prove Phase 02 permission behavior.

---

# 15. Canonical Permission Catalog Baseline

The repository already seeds canonical permission codes.

Examples include:

```text
operations.staff.access
operations.kitchen.access
operations.cashier.access
management.admin.access
order.view
order.manage
service.view
service.manage
kitchen.view
kitchen.manage
merchant_payment.view
merchant_payment.collect
merchant_payment.void
menu.view
menu.manage
settings.view
settings.manage
member.view
member.invite
member.manage
role.view
role.manage
audit.view
```

R02 must use canonical permission codes.

R02 must not invent equivalent aliases.

R02 must not infer permissions from role display names.

R02 must not infer permissions from route names.

R02 must not infer permissions from UI labels.

R02 must test exact permission codes.

---

# 16. R02 Fixture Design Principles

Every fixture must have one purpose.

Every fixture must have a stable identifier.

Every fixture must have a stable logical name.

Every fixture must be synthetic.

Every fixture must be safe to commit.

Every fixture must avoid production identifiers.

Every credential fixture must be test-only.

Every fixture must be reproducible after reset.

Every fixture must avoid random UUID generation at seed time.

Every fixture must avoid current-time-dependent authorization state unless explicitly testing time semantics.

Every fixture must avoid insertion-order assumptions.

Every fixture must avoid `limit 1` lookup semantics.

Every fixture must be referenced by exact ID or canonical code.

Every fixture must have a positive or negative test use.

Unused fixtures should not be added.

---

# 17. Required Persona Matrix

R02 should provide at least these logical personas.

```text
owner_a
staff_a1
staff_a2
kitchen_a1
cashier_a2
staff_b1
suspended_user_a
invited_membership_a
suspended_membership_a
revoked_membership_a
disabled_credential_a
no_credential_a
no_membership_a
```

The exact implementation may reuse existing R04 actors for some personas.

New personas should be added only where existing R04 actors cannot represent the contract.

Each persona must have documented expected access.

Each persona must have documented expected denial.

---

# 18. Owner/Manager Persona Contract

The Tenant A owner/manager persona must be ACTIVE.

The owner/manager must have a tenant-wide ACTIVE membership.

The owner/manager membership should use `branch_id = NULL`.

The owner/manager must have the configured management permissions.

The owner/manager must have ordinary operational visibility where assigned.

The owner/manager must pass Tenant A tenant-level checks.

The owner/manager must pass Branch A1 checks where tenant-wide semantics permit.

The owner/manager must pass Branch A2 checks where tenant-wide semantics permit.

The owner/manager must fail Tenant B checks.

The owner/manager must not gain Tenant B data access.

The owner/manager must not require browser-provided tenant authority.

The owner/manager credential should be enabled for positive authentication tests.

---

# 19. Branch A1 Staff Persona Contract

The Branch A1 staff persona must be ACTIVE.

The staff membership must be ACTIVE.

The staff membership must belong to Tenant A.

The staff membership must target Branch A1.

The staff role must include staff access permission where canonical.

The staff role should include `order.view` if that remains canonical behavior.

The staff persona must pass Branch A1 membership checks.

The staff persona must fail Tenant A tenant-wide membership checks.

The staff persona must fail Branch A2 checks.

The staff persona must fail Tenant B checks.

The staff persona must fail management permissions.

The staff credential should be enabled for positive credential tests.

---

# 20. Branch A2 Staff Persona Contract

The Branch A2 staff persona must be ACTIVE.

The membership must be ACTIVE.

The membership must target Tenant A.

The membership must target Branch A2.

The persona must pass Branch A2 membership checks.

The persona must fail Branch A1 checks.

The persona must fail Tenant A tenant-wide checks.

The persona must fail Tenant B checks.

The persona should carry only intended staff permissions.

The persona must not inherit Branch A1 permission through same-tenant membership.

---

# 21. Kitchen Persona Contract

R02 should add or repurpose a deterministic kitchen persona.

The kitchen persona must be ACTIVE.

The kitchen membership must be ACTIVE.

The kitchen membership must be branch-scoped.

Preferred branch is Branch A1 unless current implementation has a better canonical fixture.

The kitchen role should include:

```text
operations.kitchen.access
kitchen.view
kitchen.manage
```

The kitchen role should not automatically include:

```text
management.admin.access
operations.cashier.access
member.manage
role.manage
```

The kitchen persona must pass kitchen permission checks.

The kitchen persona must fail cashier-only checks.

The kitchen persona must fail admin-only checks.

The kitchen persona must fail sibling-branch checks.

The kitchen persona must fail cross-tenant checks.

---

# 22. Cashier Persona Contract

R02 should add or repurpose a deterministic cashier persona.

The cashier persona must be ACTIVE.

The cashier membership must be ACTIVE.

The cashier membership must be branch-scoped.

Preferred branch is Branch A2 to exercise sibling-branch denial.

The cashier role should include:

```text
operations.cashier.access
merchant_payment.view
merchant_payment.collect
```

`merchant_payment.void` should be assigned only if intended by canonical cashier policy.

The cashier role should not automatically include:

```text
management.admin.access
operations.kitchen.access
role.manage
member.manage
```

The cashier persona must pass cashier checks on its branch.

The cashier persona must fail kitchen-only checks.

The cashier persona must fail admin-only checks.

The cashier persona must fail Branch A1 if scoped to Branch A2.

The cashier persona must fail Tenant B.

---

# 23. Tenant B Persona Contract

Tenant B must remain independent from Tenant A.

The Tenant B actor must be ACTIVE.

The Tenant B membership must be ACTIVE.

The membership must target Tenant B.

The membership should target Branch B1 for branch-scoped coverage.

The actor must pass Branch B1 checks.

The actor must fail Tenant A checks.

The actor must fail Branch A1 checks.

The actor must fail Branch A2 checks.

Tenant A actors must fail Branch B1 checks.

Tenant A tenant-wide membership must never satisfy Tenant B.

Tenant B permission mapping must not use Tenant A role IDs.

---

# 24. Suspended User Contract

The suspended user must have `app.users.status = SUSPENDED`.

The user may have an otherwise ACTIVE membership for denial proof.

The user may have an enabled credential for denial proof.

Pre-auth candidate lookup must return no eligible candidate if R01 contract says inactive user is filtered.

Membership helper must return false.

Permission helper must return false.

RLS must deny protected data.

The user must not become authorized through an ACTIVE membership alone.

The user must not become authorized through a valid role alone.

The user must not become authorized through a valid credential alone.

---

# 25. Invited Membership Contract

The invited membership persona should use an ACTIVE user.

The membership status must be `INVITED`.

The credential may remain enabled.

Identity lookup may still resolve the actor if authentication and authorization are separated.

Membership authorization must fail.

Permission authorization must fail.

RLS must deny protected branch data.

No workspace authority should be inferred.

R03 login may authenticate identity later but R04 access resolution must reject workspace access until membership ACTIVE.

R02 must document this separation.

---

# 26. Suspended Membership Contract

The user should remain ACTIVE.

The credential may remain enabled.

The membership status must be `SUSPENDED`.

Membership authorization must fail.

Permission authorization must fail.

RLS must deny protected data.

Suspending membership must not require suspending the user globally.

The denial proves organization-level access can be revoked independently.

---

# 27. Revoked Membership Contract

The user should remain ACTIVE.

The credential may remain enabled.

The membership status must be `REVOKED`.

Membership authorization must fail.

Permission authorization must fail.

RLS must deny protected data.

The revoked membership must not reactivate through role assignment.

The revoked membership must not reactivate through branch context injection.

The revoked membership must remain a stable future R04 revocation test fixture.

---

# 28. Disabled Credential Contract

Create or reuse an ACTIVE user.

The user should have an ACTIVE membership if useful.

The credential row must exist.

The credential `disabled_at` must be non-null.

The stored hash must be syntactically valid.

Pre-auth credential lookup must return no eligible candidate.

The user status alone must not override credential disablement.

Membership status alone must not override credential disablement.

R03 must later use this fixture to prove login denial.

R02 must not wire the live route to this behavior.

---

# 29. No-Credential User Contract

Create or reuse an ACTIVE user.

The user may have an ACTIVE membership.

No `private.user_credentials` row should exist.

Pre-auth lookup must return no eligible candidate.

The user must not cause a database error merely because credential row is absent.

The missing credential state must be deterministic.

The fixture must be clearly distinguishable from disabled credential state internally.

Public-facing error behavior remains generic in R03.

---

# 30. No-Membership User Contract

Create or reuse an ACTIVE user.

The user should have an enabled credential.

The user should have no membership row for Tenant A or Tenant B.

Credential lookup may succeed.

Membership resolution must fail.

Permission resolution must fail.

RLS must deny tenant/branch data under actor runtime context.

This persona proves authentication is not authorization.

R04 can later use this persona for no-workspace behavior.

---

# 31. Canonical Email Strategy

R02 must use the normalized-email contract inherited from R01.

Expected normalization is likely equivalent to:

```text
lower(btrim(email))
```

Do not redefine normalization in R02 if R01 chose an exact implementation.

Every positive credential persona needs a stable synthetic email.

Recommended pattern:

```text
owner.a@flow.test
staff.a1@flow.test
staff.a2@flow.test
kitchen.a1@flow.test
cashier.a2@flow.test
staff.b1@flow.test
suspended.a@flow.test
disabled.credential.a@flow.test
no.membership.a@flow.test
```

Use `.test` or another clearly synthetic reserved domain.

Do not use real personal emails.

Do not use owner production email.

Do not use Gmail addresses.

Do not use environment credentials as fixture identity.

---

# 32. Email Fixture Validation

Every seeded login email must normalize deterministically.

No two fixtures may normalize to the same value.

No fixture may contain accidental surrounding whitespace unless specifically testing normalization collision behavior.

Collision tests should create temporary transactional rows rather than polluting durable seed.

Case-variation tests should prove one identity authority.

Whitespace-variation tests should prove one identity authority.

Unknown email tests should use a stable synthetic value.

Email tests must not depend on collation quirks outside the chosen normalization contract.

---

# 33. Credential Algorithm Authority

R02 must inherit the supported algorithm from final R01 implementation.

Current pre-R01 schema declares:

```text
scrypt-v1
```

If R01 preserves `scrypt-v1`, R02 must use it.

If R01 creates a canonical encoded string format, R02 must use that exact format.

R02 must not invent a second encoding format.

R02 must not switch to bcrypt.

R02 must not switch to Argon2 without an explicit R01/R02 architecture amendment.

R02 must not use SHA-only password hashes.

R02 must not store plaintext passwords in database fields.

---

# 34. Test Password Strategy

R02 needs deterministic test-only password inputs for R03 integration.

Test password values may exist in test source if clearly synthetic.

They must never be described as production defaults.

They must never be used for owner/dev/finance accounts.

They must never be loaded from production secrets.

They must never appear in `FOODFLOW_INTERNAL_PASSWORD` documentation as replacement values.

A suggested test-only input pattern may be used, for example:

```text
flow-test-owner-a-v1
flow-test-staff-a1-v1
flow-test-kitchen-a1-v1
flow-test-cashier-a2-v1
```

The exact values should be centralized.

Do not scatter password literals across multiple test files.

---

# 35. Credential Hash Fixture Strategy

Preferred strategy depends on final R01 verifier contract.

Option A:

```text
precomputed deterministic test hashes committed as fixtures
```

Option B:

```text
deterministic test helper generates hashes from fixed test inputs
```

Either approach must produce stable logical behavior.

If salts are part of the encoding, deterministic committed vectors are useful for repeatability.

If generation uses random salt, the seed must not regenerate a different committed database state on every reset unless tests only assert verification semantics.

R03 integration benefits from known test vectors.

R02 should prefer explicit test vectors.

R02 must document algorithm parameters inherited from R01.

R02 must include at least one valid vector.

R02 must include at least one wrong-password test.

R02 must include malformed-encoding tests in source tests if R01 does not already cover them.

---

# 36. Credential Seed Safety

`supabase/seed.sql` is synthetic local fixture data.

If R02 adds credential rows to seed:

- comments must state test-only purpose;
- no production credential may be present;
- no plaintext password column may be introduced;
- password hash values must be non-secret test vectors;
- algorithm field must match supported algorithm;
- disabled credential fixture must set `disabled_at`;
- enabled credentials must leave `disabled_at` null;
- `password_changed_at` should be deterministic enough for tests that do not rely on exact wall-clock time;
- no current timestamp should become a hidden assertion dependency;
- no secret environment variable should be required for `supabase db reset`.

---

# 37. Fixture Namespace Strategy

R02 should distinguish long-lived fixture identifiers from business data identifiers.

Existing R04 UUID ranges are already visually distinct.

Reuse those ranges where safe.

New Phase-02-only actors should use a predictable non-production range.

New role IDs should use a predictable non-production range.

New membership IDs should use a predictable non-production range.

Do not use random `gen_random_uuid()` in deterministic seed rows.

Do not use UUIDs derived from passwords.

Do not use email hashes as primary IDs.

Do not depend on database sequence order.

---

# 38. Role Design for R02

R02 does not need to create every production role.

R02 needs enough roles to prove permission semantics.

Minimum logical roles should cover:

```text
manager/admin
staff
kitchen
cashier
```

Tenant B may reuse staff semantics with a tenant-local role row.

Roles remain tenant-scoped.

A Tenant A role ID must not be used by Tenant B membership.

A role code may repeat across tenants if schema permits and semantics are tenant-local.

Tests must not assume role ID is globally interchangeable across tenants.

---

# 39. Manager Permission Contract

The manager fixture should have explicit mapped permissions.

Current R04 manager includes:

```text
order.view
member.view
member.invite
member.manage
role.view
role.manage
```

R02 may extend manager mappings if canonical management permissions require it.

Do not grant every permission merely to simplify tests.

Add `management.admin.access` only if manager/admin surface semantics require it.

Add settings permissions only if needed for later route policy contract.

Record all manager permission codes in tests.

Include at least one permission the manager intentionally does not have if the model is not super-admin.

---

# 40. Staff Permission Contract

Staff should receive only operational permissions needed for staff behavior.

Likely permissions include:

```text
operations.staff.access
order.view
```

Additional `order.manage` should be added only if intended.

Staff should not automatically receive:

```text
management.admin.access
role.manage
member.manage
merchant_payment.void
```

Tests must prove at least one positive permission.

Tests must prove at least three negative privileged permissions.

---

# 41. Kitchen Permission Contract

Kitchen role should include kitchen-scoped operational permissions.

Likely permissions include:

```text
operations.kitchen.access
kitchen.view
kitchen.manage
order.view
```

`order.view` should be included only if kitchen workflow requires order visibility.

Kitchen must not automatically receive:

```text
operations.cashier.access
merchant_payment.collect
management.admin.access
member.manage
role.manage
```

Tests must prove positive kitchen access.

Tests must prove negative cashier access.

Tests must prove negative admin access.

---

# 42. Cashier Permission Contract

Cashier role should include cashier/payment collection permissions.

Likely permissions include:

```text
operations.cashier.access
merchant_payment.view
merchant_payment.collect
order.view
```

`merchant_payment.void` must be intentional.

Cashier must not automatically receive:

```text
operations.kitchen.access
kitchen.manage
management.admin.access
member.manage
role.manage
```

Tests must prove positive collection access.

Tests must prove negative kitchen management.

Tests must prove negative role management.

---

# 43. Tenant-Wide Membership Contract

A tenant-wide membership uses:

```text
branch_id = NULL
```

The membership must be ACTIVE.

The user must be ACTIVE.

The role must belong to the same tenant.

Tenant-wide membership should pass tenant-level checks for its tenant.

Tenant-wide membership should pass branch-level checks for branches within its tenant according to R04 semantics.

Tenant-wide membership must fail another tenant.

Tenant-wide membership must not bypass permission mapping.

Tenant-wide membership means scope breadth, not all permissions.

---

# 44. Branch-Scoped Membership Contract

A branch-scoped membership uses an exact branch UUID.

The branch must belong to the same tenant.

The membership must be ACTIVE.

The user must be ACTIVE.

The role must belong to the membership tenant.

Exact branch membership should pass its branch.

Exact branch membership should fail sibling branches.

Exact branch membership should fail tenant-level checks when target branch is null under accepted R04 semantics.

Exact branch membership should fail another tenant.

Branch scope must not be broadened by permission ownership.

---

# 45. Multiple Membership Contract

R02 should explicitly decide whether any test actor has multiple ACTIVE memberships.

A multi-membership fixture is useful for future workspace selection.

If added, it should be intentional.

Example:

```text
user_multi_a
membership A1 ACTIVE
membership A2 ACTIVE
```

The user should authenticate once.

The user should have access to both memberships through later R04 selection logic.

R02 should not implement that selection UI.

R02 may prove both membership rows are independently valid.

Avoid adding multi-membership if it creates unnecessary scope before R04.

If deferred, record it explicitly for R04.

---

# 46. Role-Permission Referential Integrity

Every role-permission row must reference an existing role.

Every role-permission row must reference an existing permission.

Permission lookup should use canonical `code` when seeding mappings.

Do not depend on permission insertion order.

Do not hardcode permission IDs if canonical code lookup is clearer and already used.

Duplicate role-permission rows must be prevented by schema constraints.

Seed should not silently create duplicate mappings.

Tests should verify expected mapping count for focused roles where useful.

---

# 47. Membership Referential Integrity

Every membership user must exist.

Every membership tenant must exist.

Every membership role must exist.

Every branch-scoped membership branch must exist.

The role tenant must equal membership tenant.

The branch tenant must equal membership tenant.

R02 tests should verify cross-tenant role assignment is rejected or unusable according to schema constraints.

R02 should not weaken current membership constraints.

---

# 48. User Status Contract

R02 must derive valid user statuses from current schema.

Current known status includes `ACTIVE`.

Current known status includes `SUSPENDED`.

Do not invent `INACTIVE` if the schema does not permit it.

Do not change the enum/check merely to match old spec wording.

If deactivation uses another current status, use the actual schema value.

Tests must use valid current statuses.

The spec uses semantic term inactive to mean not-authenticatable where exact schema value may be `SUSPENDED` or another supported value.

Implementation PR must record exact statuses used.

---

# 49. Membership Status Contract

Current known membership states include:

```text
ACTIVE
INVITED
SUSPENDED
REVOKED
```

R02 must not invent additional states without schema evidence.

Only ACTIVE membership should authorize.

INVITED must deny.

SUSPENDED must deny.

REVOKED must deny.

Tests must cover each status independently.

---

# 50. Pre-Authentication Lookup Contract

R02 must consume R01 pre-auth lookup behavior.

Positive fixture:

```text
ACTIVE user
+ enabled credential
→ eligible candidate
```

Negative fixture:

```text
SUSPENDED/non-active user
+ enabled credential
→ no eligible candidate
```

Negative fixture:

```text
ACTIVE user
+ disabled credential
→ no eligible candidate
```

Negative fixture:

```text
ACTIVE user
+ no credential
→ no eligible candidate
```

Unknown email must return no candidate.

Membership state must not be required merely to identify a credential candidate unless final R01 contract explicitly says otherwise.

Authentication and authorization remain separate.

---

# 51. Password Verification Contract

R02 must prove deterministic credential vectors work with the R01 verifier.

For each positive credential fixture:

- known test password verifies;
- wrong test password fails;
- stored algorithm is supported;
- encoded hash parses successfully;
- user ID returned is expected;
- normalized email returned is expected.

For disabled credential fixture:

- lookup returns no candidate before verification.

For unknown user:

- dummy verification behavior remains available from R01 if applicable.

R02 must not bypass repository lookup by reading private table directly from application tests unless the test is explicitly verifying direct access denial.

---

# 52. Pre-Auth Role Regression

R02 must preserve R01 least-privilege behavior.

The pre-auth role must not gain direct `app.users` broad read.

The pre-auth role must not gain direct membership broad read.

The pre-auth role must not gain direct credential table read.

The pre-auth role must not gain direct throttle table read.

The pre-auth role must not gain FoodFlow domain read.

The pre-auth role must not gain payment read.

The pre-auth role must not gain audit read.

Fixture convenience must not cause broader grants.

R02 tests should keep the R01 role-denial matrix green.

---

# 53. Runtime Role Regression

`flow_runtime` remains actor/tenant/branch scoped.

R02 must not grant `flow_runtime` direct credential read.

R02 must not grant `flow_runtime` direct throttle read.

R02 must not bypass `app.actor_id` checks.

R02 must not bypass `app.tenant_id` checks.

R02 must not bypass `app.branch_id` checks.

R02 fixture tests must run representative queries under `flow_runtime`.

Actorless runtime must remain deny-by-default.

Wrong tenant must remain deny-by-default.

Wrong branch must remain deny-by-default.

---

# 54. Identity Role Regression

`flow_identity` remains post-identity.

R02 must not turn `flow_identity` into a credential reader.

R02 must not grant broad credential access to `flow_identity`.

R02 must preserve self/membership-read semantics from R01/P01.

If R02 uses identity transaction tests, the actor ID must be a real deterministic fixture user.

Do not use fake zero UUID identity hacks.

---

# 55. RLS Contract — Actorless

Set tenant context to Tenant A.

Set branch context as needed.

Clear actor context.

Use `flow_runtime`.

Expected protected row visibility:

```text
0 rows
```

This must remain true for representative protected tables.

At minimum preserve actorless branch denial.

At minimum preserve actorless organization denial where tenant-level access is actor-protected.

---

# 56. RLS Contract — Tenant-Wide Manager

Set actor to Tenant A manager.

Set tenant to Tenant A.

Use tenant-level context.

Expected Tenant A organization visibility:

```text
ALLOW
```

Expected Branch A1 visibility:

```text
ALLOW
```

Expected Branch A2 visibility:

```text
ALLOW
```

Expected Tenant B visibility:

```text
DENY
```

Permission checks remain role-mapped.

---

# 57. RLS Contract — Branch A1 Staff

Set actor to Branch A1 staff.

Set tenant to Tenant A.

Set branch to Branch A1.

Expected Branch A1 visibility:

```text
ALLOW
```

Expected Branch A2 visibility:

```text
DENY
```

Expected Tenant A organization tenant-wide visibility:

```text
DENY
```

Expected Tenant B visibility:

```text
DENY
```

---

# 58. RLS Contract — Branch A2 Staff

Set actor to Branch A2 staff.

Set tenant to Tenant A.

Set branch to Branch A2.

Expected Branch A2 visibility:

```text
ALLOW
```

Expected Branch A1 visibility:

```text
DENY
```

Expected Tenant B visibility:

```text
DENY
```

---

# 59. RLS Contract — Tenant B Staff

Set actor to Tenant B staff.

Set tenant to Tenant B.

Set branch to Branch B1.

Expected Branch B1 visibility:

```text
ALLOW
```

Expected Tenant A Branch A1 visibility:

```text
DENY
```

Expected Tenant A Branch A2 visibility:

```text
DENY
```

Expected Tenant A organization visibility:

```text
DENY
```

---

# 60. RLS Contract — Suspended User

Set actor to suspended user.

Set tenant to Tenant A.

Set branch to Branch A1.

Use `flow_runtime`.

Protected branch visibility must be zero.

Protected domain visibility must be zero where actor helper applies.

An ACTIVE membership must not rescue a suspended user.

A valid role must not rescue a suspended user.

---

# 61. RLS Contract — Non-Active Memberships

For invited membership actor:

```text
DENY
```

For suspended membership actor:

```text
DENY
```

For revoked membership actor:

```text
DENY
```

Each case must be tested separately.

Do not collapse all statuses into one fixture.

Separate fixtures make future revocation regressions diagnosable.

---

# 62. Permission Helper Positive Matrix

Manager on Tenant A:

```text
member.manage → ALLOW if mapped
role.manage → ALLOW if mapped
order.view → ALLOW if mapped
```

Staff A1 on Branch A1:

```text
operations.staff.access → ALLOW if mapped
order.view → ALLOW if mapped
```

Kitchen A1 on Branch A1:

```text
operations.kitchen.access → ALLOW
kitchen.view → ALLOW
kitchen.manage → ALLOW if mapped
```

Cashier A2 on Branch A2:

```text
operations.cashier.access → ALLOW
merchant_payment.view → ALLOW
merchant_payment.collect → ALLOW
```

---

# 63. Permission Helper Negative Matrix

Staff A1:

```text
role.manage → DENY
member.manage → DENY
management.admin.access → DENY
```

Kitchen A1:

```text
operations.cashier.access → DENY
merchant_payment.collect → DENY unless explicitly mapped
role.manage → DENY
```

Cashier A2:

```text
operations.kitchen.access → DENY
kitchen.manage → DENY
role.manage → DENY
```

Tenant B staff requesting Tenant A permission:

```text
DENY
```

Branch A1 staff requesting same permission at Branch A2:

```text
DENY
```

---

# 64. Self-Elevation Regression

R02 must preserve R04 self-elevation hardening.

Ordinary staff must not promote own membership role to manager.

Ordinary staff must not add role permissions.

Ordinary staff must not edit manager role permissions.

Ordinary staff must not create an ACTIVE tenant-wide membership for self.

Ordinary staff must not rewrite membership tenant.

Ordinary staff must not rewrite membership branch to broaden scope.

Tests must prove data remains unchanged after filtered/denied mutations.

Do not weaken existing test assertions to accommodate fixture changes.

---

# 65. Fixture Mutation Policy

Seed fixtures define reset baseline.

Tests may mutate fixture rows inside transactions.

Every destructive fixture test should roll back.

Do not permanently mutate seed state across SQL test files.

Do not rely on test execution order to restore state.

Do not require one test file to clean up another test file.

Use explicit `begin`/`rollback` in SQL tests where current convention permits.

Node integration tests must clean temporary rows or use reset-isolated database state.

---

# 66. Seed Idempotency Expectations

`supabase db reset --local` must recreate deterministic state.

Seed should not depend on previous seed execution.

Seed should not depend on random UUIDs.

Seed should not depend on wall-clock ordering.

Seed should not depend on external APIs.

Seed should not depend on Auth.js runtime.

Seed should not depend on production secrets.

Seed should not depend on Vercel environment.

Seed should not depend on browser state.

---

# 67. Schema Change Policy

R02 is primarily fixture and authorization-contract work.

Default expectation:

```text
NO SCHEMA CHANGE
```

A schema migration is allowed only if final R01 implementation reveals a fixture-blocking structural defect.

Examples of legitimate structural blockers:

- missing uniqueness required for deterministic identity;
- missing constraint allowing impossible cross-tenant membership;
- credential algorithm field incompatible with R01 final contract;
- necessary testable authorization invariant absent from schema.

Do not add a migration merely to hold fixture labels.

Do not add production columns solely for test convenience.

If schema change is required, use forward-only migration.

Never rewrite R01 or P01 historical migrations.

---

# 68. Generated Type Policy

If R02 changes no schema:

```text
GENERATED DB TYPES SHOULD NOT CHANGE
```

If generated DB types change unexpectedly without schema change:

```text
INVESTIGATE
```

Do not manually edit generated types.

If an approved R02 schema change occurs:

- reset DB;
- regenerate types;
- inspect diff;
- commit expected change;
- run drift verification.

Fixture row additions alone must not require generated type changes.

---

# 69. Server Fixture Helper Strategy

A focused test helper may be created.

Suggested path:

```text
apps/web/next-flow/tests/fixtures/identity.ts
```

The helper should export stable fixture constants.

The helper should not contain production auth logic.

The helper should not import client components.

The helper should not issue cookies.

The helper should not issue JWTs.

The helper should not choose workspace state.

The helper may export IDs.

The helper may export test emails.

The helper may export test passwords.

The helper may export expected permission arrays.

The helper may export expected tenant/branch IDs.

---

# 70. Suggested Fixture Constant Shape

Example only:

```ts
export const identityFixtures = {
  ownerA: {
    userId: "...",
    email: "owner.a@flow.test",
    tenantId: "...",
    branchId: null,
  },
  staffA1: {
    userId: "...",
    email: "staff.a1@flow.test",
    tenantId: "...",
    branchId: "...",
  },
} as const;
```

Do not duplicate database authority in TypeScript.

The constants identify fixtures.

Database tests remain authoritative for DB behavior.

---

# 71. Fixture Helper Password Safety

Test password constants must be clearly named.

Example:

```text
TEST_ONLY_PASSWORD
```

Do not use names suggesting production defaults.

Do not export passwords from runtime application modules.

Keep them under test-only paths.

Do not import them from production route code.

R03 tests may import test fixture constants.

Production Auth.js code must not import test fixtures.

---

# 72. SQL Test File Strategy

Create a focused R02 SQL test file.

Suggested path:

```text
supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql
```

The file should verify seed/fixture contract.

The file should not replace R01 tests.

The file should not replace R04 tests.

The file should complement inherited tests.

Use pgTAP conventions already present.

Plan the exact assertion count.

Keep assertions named precisely.

Use stable IDs/codes.

Avoid vague messages such as `works`.

---

# 73. SQL Test Group — Fixture Presence

Assert Tenant A exists.

Assert Tenant B exists.

Assert Branch A1 exists.

Assert Branch A2 exists.

Assert Branch B1 exists.

Assert owner/manager user exists.

Assert Branch A1 staff exists.

Assert Branch A2 staff exists.

Assert kitchen actor exists.

Assert cashier actor exists.

Assert Tenant B actor exists.

Assert suspended user exists.

Assert invited membership exists.

Assert suspended membership exists.

Assert revoked membership exists.

Assert disabled credential exists.

Assert no-credential user exists with no credential row.

---

# 74. SQL Test Group — Credential Presence

Assert enabled positive credential rows exist.

Assert algorithm equals supported R01 algorithm.

Assert password hash is non-empty.

Assert password hash is not plaintext test password.

Assert disabled credential has non-null `disabled_at`.

Assert enabled credentials have null `disabled_at`.

Assert no-credential fixture has zero credential rows.

Assert one credential row per credential-bearing user.

Assert no duplicate user credential primary key.

---

# 75. SQL Test Group — Email Contract

Assert expected normalized owner email.

Assert expected normalized staff email.

Assert expected normalized kitchen email.

Assert expected normalized cashier email.

Assert expected normalized Tenant B email.

Assert case variation resolves same candidate.

Assert whitespace variation resolves same candidate if lookup normalizes input.

Assert unknown email resolves no candidate.

Assert collision insertion fails if R01 constraint exists.

Assert collision update fails if R01 constraint exists.

---

# 76. SQL Test Group — Membership Contract

Assert manager tenant-wide membership is ACTIVE.

Assert manager branch_id is NULL.

Assert Branch A1 staff membership is ACTIVE.

Assert Branch A1 staff branch_id equals A1.

Assert Branch A2 staff branch_id equals A2.

Assert Tenant B staff branch_id equals B1.

Assert invited membership status is INVITED.

Assert suspended membership status is SUSPENDED.

Assert revoked membership status is REVOKED.

Assert role tenant matches membership tenant.

Assert branch tenant matches membership tenant.

---

# 77. SQL Test Group — Role Contract

Assert manager role exists for Tenant A.

Assert staff role exists for Tenant A.

Assert kitchen role exists if introduced.

Assert cashier role exists if introduced.

Assert Tenant B staff role exists under Tenant B.

Assert no Tenant A role is reused by Tenant B membership.

Assert expected role codes are stable.

Assert expected role names are not used as permission authority.

---

# 78. SQL Test Group — Permission Mapping

Assert manager has `member.manage` if intended.

Assert manager has `role.manage` if intended.

Assert staff lacks `role.manage`.

Assert staff lacks `member.manage`.

Assert kitchen has `operations.kitchen.access`.

Assert kitchen has `kitchen.view`.

Assert cashier has `operations.cashier.access`.

Assert cashier has `merchant_payment.view`.

Assert cashier has `merchant_payment.collect`.

Assert cashier lacks `kitchen.manage`.

Assert kitchen lacks `merchant_payment.collect` unless intentionally mapped.

---

# 79. SQL Test Group — Membership Helper

Manager + Tenant A + null branch:

```text
TRUE
```

Manager + Tenant A + A1:

```text
TRUE
```

Manager + Tenant A + A2:

```text
TRUE
```

Manager + Tenant B + B1:

```text
FALSE
```

Staff A1 + Tenant A + null:

```text
FALSE
```

Staff A1 + Tenant A + A1:

```text
TRUE
```

Staff A1 + Tenant A + A2:

```text
FALSE
```

Staff A1 + Tenant B + B1:

```text
FALSE
```

---

# 80. SQL Test Group — Permission Helper

Manager + `member.manage` + Tenant A:

```text
TRUE if mapped
```

Staff A1 + `order.view` + A1:

```text
TRUE if mapped
```

Staff A1 + `role.manage` + A1:

```text
FALSE
```

Staff A1 + `order.view` + A2:

```text
FALSE
```

Kitchen A1 + kitchen permission + A1:

```text
TRUE
```

Kitchen A1 + cashier permission + A1:

```text
FALSE
```

Cashier A2 + collect permission + A2:

```text
TRUE
```

Cashier A2 + kitchen manage + A2:

```text
FALSE
```

---

# 81. SQL Test Group — User Status Denial

Suspended user membership helper:

```text
FALSE
```

Suspended user permission helper:

```text
FALSE
```

Suspended user RLS branch visibility:

```text
0
```

Suspended user pre-auth lookup:

```text
NO ELIGIBLE CANDIDATE
```

Do not remove membership to make this pass.

The test should prove user status itself matters.

---

# 82. SQL Test Group — Membership Status Denial

Invited membership helper:

```text
FALSE
```

Suspended membership helper:

```text
FALSE
```

Revoked membership helper:

```text
FALSE
```

Invited permission helper:

```text
FALSE
```

Suspended permission helper:

```text
FALSE
```

Revoked permission helper:

```text
FALSE
```

---

# 83. SQL Test Group — RLS Positive

Manager sees Tenant A organization.

Manager sees Branch A1.

Manager sees Branch A2.

Staff A1 sees Branch A1.

Staff A2 sees Branch A2.

Kitchen A1 sees branch-scoped kitchen-relevant protected data only if seeded and authorized.

Cashier A2 sees branch-scoped payment/order data only if seeded and authorized.

Tenant B staff sees Branch B1.

Keep positive cases small and deterministic.

Do not create large domain datasets solely for R02.

---

# 84. SQL Test Group — RLS Negative

Actorless sees no protected branches.

Staff A1 cannot see Branch A2.

Staff A2 cannot see Branch A1.

Tenant A manager cannot see Tenant B.

Tenant B staff cannot see Tenant A.

Suspended user cannot see Branch A1.

Invited membership user cannot see Branch A1.

Suspended membership user cannot see Branch A1.

Revoked membership user cannot see Branch A1.

No-membership user cannot see Tenant A protected rows.

Wrong tenant context cannot broaden access.

Wrong branch context cannot broaden access.

---

# 85. SQL Test Group — Self-Elevation

Attempt ordinary staff membership role escalation.

Expected:

```text
NO PRIVILEGE GAIN
```

Attempt ordinary staff membership branch broadening.

Expected:

```text
NO PRIVILEGE GAIN
```

Attempt ordinary staff tenant reassignment.

Expected:

```text
NO PRIVILEGE GAIN
```

Attempt ordinary staff role-permission insertion.

Expected:

```text
DENY / FILTER WITHOUT ELEVATION
```

Verify persisted row unchanged after each attempt.

---

# 86. SQL Test Group — Pre-Auth Least Privilege

Under the pre-auth role:

Direct `app.users` broad select must fail.

Direct `app.memberships` broad select must fail.

Direct `private.user_credentials` select must fail.

Direct `private.login_throttles` select must fail.

Direct `foodflow.orders` select must fail.

Direct `payments.payments` select must fail.

Direct `audit.events` select must fail.

Approved credential lookup function must succeed.

Approved throttle functions must preserve R01 behavior.

---

# 87. Node Unit Test Scope

R02 should avoid duplicating R01 password-verifier tests.

R02 unit tests should focus on fixture helpers.

Test fixture constant stability.

Test expected normalized emails.

Test expected IDs.

Test expected test-password labels.

Test permission expectation arrays if exported.

Test helper does not expose production secret names.

Test helper remains importable from test environment.

Do not create unit tests that merely restate object literals without value.

---

# 88. Node Integration Test File

Suggested path:

```text
apps/web/next-flow/tests/integration/identity-authorization-contract.test.ts
```

The integration test should consume the real DB runtime.

It should use deterministic fixture IDs.

It should use R01 credential repository.

It should use R01 password verifier.

It should use actor-aware transaction helpers.

It should not call the live legacy login route as new authority.

It should not create Auth.js sessions.

---

# 89. Integration Test — Positive Credential

Load owner/manager credential candidate by email.

Assert candidate is non-null.

Assert user ID equals fixture ID.

Assert normalized email equals expected value.

Verify known test password.

Assert verification succeeds.

Repeat for Branch A1 staff.

Repeat for kitchen persona if credential-bearing.

Repeat for cashier persona if credential-bearing.

Do not assert password hash literal in failure output.

---

# 90. Integration Test — Wrong Password

Lookup valid candidate.

Verify wrong password.

Expected:

```text
FALSE / INVALID
```

Do not mutate credential row.

Do not log password.

Do not log hash.

Do not create session.

Do not call live login cutover code.

---

# 91. Integration Test — Disabled Credential

Lookup disabled credential fixture by normalized email.

Expected repository result:

```text
NULL / NO ELIGIBLE CANDIDATE
```

Do not manually select credential table from application repository.

Prove repository honors database lookup contract.

---

# 92. Integration Test — Suspended User

Lookup suspended user fixture by normalized email.

Expected:

```text
NO ELIGIBLE CANDIDATE
```

If credential exists, denial must still occur.

This proves user status is part of pre-auth eligibility.

---

# 93. Integration Test — No Credential

Lookup ACTIVE no-credential user.

Expected:

```text
NO ELIGIBLE CANDIDATE
```

No database exception should leak.

No fallback to legacy shared credential should occur inside repository helper.

Legacy route remains separate.

---

# 94. Integration Test — Membership Resolution

Use real fixture actor ID.

Use identity/tenant transaction helper as appropriate.

Verify owner membership set.

Verify staff A1 membership set.

Verify staff A2 membership set.

Verify Tenant B membership set.

Verify inactive membership rows do not authorize.

Do not invent workspace selection behavior.

R02 validates data contract only.

---

# 95. Integration Test — Permission Resolution

Resolve manager permission.

Resolve staff positive permission.

Resolve staff negative permission.

Resolve kitchen positive permission.

Resolve kitchen negative permission.

Resolve cashier positive permission.

Resolve cashier negative permission.

Resolve cross-tenant negative permission.

Resolve cross-branch negative permission.

Use canonical permission code strings.

---

# 96. Integration Test — Transaction Context Cleanup

R01 should already test role/context cleanup.

R02 should preserve that coverage.

If R02 adds new authorization integration flows:

- complete transaction;
- run subsequent transaction;
- verify actor does not leak;
- verify tenant does not leak;
- verify branch does not leak;
- verify role does not leak.

Do not weaken R01 cleanup tests.

---

# 97. Integration Test — Fixture Reproducibility

The same clean database reset must produce the same fixture IDs.

The same clean reset must produce the same logical credential eligibility.

The same clean reset must produce the same role mappings.

The same clean reset must produce the same membership scopes.

The same clean reset must produce the same negative cases.

Do not assert volatile timestamps unless necessary.

Do not assert database row physical order.

---

# 98. Error Handling

Missing fixture should fail tests loudly.

Wrong fixture ID should fail tests loudly.

Duplicate normalized email should fail reset/migration or fixture insert deterministically.

Unsupported credential algorithm should fail verification deterministically.

Malformed hash should fail verifier without secret leakage.

Cross-tenant role assignment should fail or remain unauthorized.

Wrong branch assignment should fail or remain unauthorized.

Database unavailable should produce typed server failure in integration paths.

Do not convert structural fixture errors into generic PASS states.

---

# 99. Failure Recovery

If seed reset fails due to foreign-key order:

- fix seed insertion dependency order;
- do not disable constraints globally.

If role-permission lookup fails:

- verify canonical permission code;
- do not hardcode an arbitrary permission ID.

If normalized email collides:

- fix synthetic fixture identity;
- do not weaken uniqueness.

If credential vector fails:

- verify R01 encoding contract;
- do not downgrade KDF.

If RLS test fails unexpectedly:

- diagnose actor/tenant/branch scope;
- do not grant broader privileges as first fix.

---

# 100. Concurrency Considerations

R02 is not primarily a concurrency round.

However fixture work must not invalidate R01 throttle concurrency behavior.

R02 should not add login-throttle writes to seed.

Throttle state should begin clean after reset.

R02 should not use shared mutable throttle state across tests without reset.

Parallel integration tests must avoid accidental collision on throttle subject digest.

Use deterministic but distinct test subjects where throttle behavior is exercised.

Do not hold DB transactions open during password KDF work.

---

# 101. Idempotency Considerations

Seed reset must be deterministic.

Repeated full resets must converge on same logical state.

Tests may use `on conflict` only where current seed convention supports it.

Do not hide accidental duplicate fixture IDs with broad `on conflict do nothing`.

A duplicate fixture definition should fail visibly unless the seed contract intentionally updates it.

Role-permission seeding should remain deterministic.

Membership seeding should remain deterministic.

Credential seeding should remain deterministic.

---

# 102. Performance Considerations

R02 should not create large fixture datasets.

A compact matrix is enough.

Credential lookup must remain indexed through R01 normalized-email design.

Membership lookup should continue to use indexed keys/relationships.

Permission resolution should not introduce per-test N+1 application queries if current helper resolves in DB.

Do not add caching for credential hashes.

Do not add Redis.

Do not add external fixture services.

---

# 103. Logging and Secret Redaction

No test output should print raw password hash.

No test output should print raw test password on failure unless framework inherently includes expected literal and the value is clearly synthetic.

Prefer redacted assertions.

No production secret may appear in fixtures.

No `AUTH_SECRET` value may appear.

No `FOODFLOW_SESSION_SECRET` value may appear.

No production `DATABASE_URL` may appear.

No session token may appear.

No private customer data may appear.

---

# 104. Observability Boundary

R02 does not implement production auth observability.

R02 may add descriptive test labels.

R02 may add safe internal test diagnostics.

R02 should identify which persona failed.

R02 should identify which permission failed.

R02 should identify which tenant/branch scope failed.

R02 must not log credential material.

R02 must not introduce production telemetry dependencies.

---

# 105. Expected Files to CREATE

Subject to final R01 branch audit, likely create:

```text
supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql
```

Likely create:

```text
apps/web/next-flow/tests/fixtures/identity.ts
```

Likely create:

```text
apps/web/next-flow/tests/integration/identity-authorization-contract.test.ts
```

Optional focused test helper:

```text
apps/web/next-flow/tests/fixtures/credential-vectors.ts
```

Only create credential-vector helper if it reduces duplication and stays test-only.

---

# 106. Expected Files to MODIFY

Likely modify:

```text
supabase/seed.sql
```

Reason:

```text
add deterministic Phase-02 identity/credential/role/membership fixtures
```

Potentially modify existing R01 integration tests only to reuse stable fixtures.

Potentially modify R04 tests only if fixture references need non-semantic updates.

Do not weaken R04 assertions.

Do not rewrite existing tests merely to centralize constants if that creates broad churn.

---

# 107. Files to Re-Audit Before Modification

```text
supabase/seed.sql
```

```text
supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql
```

```text
supabase/tests/database/p02_r01_identity_pre_auth_boundary.test.sql
```

if created by R01.

```text
apps/web/next-flow/tests/integration/authentication-database.test.ts
```

if created by R01.

```text
apps/web/next-flow/src/modules/identity/server/*
```

```text
apps/web/next-flow/src/server/db/identity-transaction.ts
```

```text
apps/web/next-flow/src/server/db/transaction.ts
```

---

# 108. Files Not to Touch by Default

Do not modify:

```text
apps/web/next-flow/src/app/api/auth/login/route.ts
```

Do not modify:

```text
apps/web/next-flow/src/app/api/auth/logout/route.ts
```

Do not modify:

```text
apps/web/next-flow/src/lib/auth/session.ts
```

Do not modify:

```text
apps/web/next-flow/src/lib/auth/token.ts
```

Do not modify:

```text
apps/web/next-flow/src/proxy.ts
```

Do not modify login UI.

Do not modify customer menu/order UI.

Do not modify payment integration.

---

# 109. Package Dependency Policy

Default expectation:

```text
NO NEW NPM DEPENDENCY
```

R02 should use existing Vitest.

R02 should use existing Kysely/pg runtime.

R02 should use existing Node crypto only through R01 verifier/helper.

R02 should use existing Supabase CLI.

Do not add faker merely for deterministic fixtures.

Do not add UUID libraries merely for fixed UUID constants.

Do not add password libraries merely to generate test vectors if R01 already owns hashing.

---

# 110. Migration Policy

Default:

```text
NO R02 MIGRATION
```

If required, migration must be forward-only.

Migration must be narrowly justified.

Migration must not encode test-only concepts into production schema without product need.

Migration must not rewrite historical P01/R01 files.

Migration must be clean-reset safe.

Migration must have dedicated tests.

Implementation PR must explain why fixture-only work required schema change.

---

# 111. Database Reset Contract

A clean local Supabase reset must succeed.

The reset must apply all migrations.

The reset must execute seed.

The reset must create all R02 fixtures.

The reset must not require manual SQL edits.

The reset must not require production credentials.

The reset must not require network access to identity provider.

The reset must not require Auth.js server runtime.

The reset must be repeatable.

---

# 112. Database Lint Contract

R02 implementation should preserve database lint success.

New SQL test files should not introduce unsafe dynamic SQL.

New schema changes, if any, should avoid unqualified security-sensitive references.

No broad grants should be introduced.

No unsafe SECURITY DEFINER function should be added in R02 by default.

If a new function is truly required, follow R01 fixed-search-path rules.

---

# 113. Generated Type Contract

If no schema change:

```text
npm run db:generate
→ no meaningful generated type diff
```

If schema change:

```text
npm run db:generate
→ expected generated diff
```

Then:

```text
npm run db:verify-types
```

or current equivalent.

Never edit generated types manually.

---

# 114. Application Quality Contract

R02 test-only helper code must typecheck.

R02 integration tests must compile.

No runtime import should accidentally import test-only fixture modules.

No client component should import server identity modules.

No server production module should import test passwords.

Lint must catch accidental unused/unsafe test code where configured.

Build must remain behaviorally unchanged for legacy login.

---

# 115. Legacy Auth Regression

Current legacy internal login remains live until R03/R06 sequencing.

R02 must keep current login behavior working.

R02 must keep current session cookie behavior working.

R02 must keep current logout behavior working.

R02 must keep current proxy behavior unchanged.

R02 must keep legacy auth-session tests green.

R02 must not modify expected legacy credential semantics.

R02 fixtures exist alongside legacy auth temporarily.

---

# 116. Customer Boundary Regression

Customer direct entry remains public according to current architecture.

R02 must not require staff credentials for customer menu browsing.

R02 must not change customer table-session semantics.

R02 must not change customer capability design.

R02 must not expose internal fixture credentials to customer UI.

R02 must not add internal role data to customer responses.

---

# 117. Security Test Priority

R02 security validation should prioritize denied paths.

Priority 1:

```text
cross-tenant denial
```

Priority 2:

```text
cross-branch denial
```

Priority 3:

```text
inactive user denial
```

Priority 4:

```text
inactive membership denial
```

Priority 5:

```text
disabled credential denial
```

Priority 6:

```text
self-elevation denial
```

Priority 7:

```text
pre-auth direct-table denial
```

---

# 118. Test Naming Standard

Use names that identify actor, action, and expected result.

Good:

```text
staff A1 cannot resolve order.view for Branch A2
```

Good:

```text
suspended membership cannot access Branch A1
```

Good:

```text
disabled credential is not returned by pre-auth lookup
```

Avoid:

```text
test 1
works
should fail
permissions okay
```

Clear names reduce future regression diagnosis cost.

---

# 119. Test Isolation Standard

SQL tests should run inside transaction when mutation occurs.

Node tests should avoid persistent state leakage.

Credential verification tests should not mutate hash rows unless specifically testing disablement/change behavior.

Membership mutation tests should roll back.

Role mapping mutation tests should roll back.

Throttle tests should use distinct subject digests.

Do not depend on test file execution order.

---

# 120. Authorization Data Ownership

Database remains authority for user status.

Database remains authority for membership status.

Database remains authority for tenant scope.

Database remains authority for branch scope.

Database remains authority for role assignment.

Database remains authority for role-permission mapping.

TypeScript fixture constants are test locators only.

TypeScript must not become a second permission database.

---

# 121. Permission Code Stability

Permission codes are API-like internal contracts.

R02 tests should reference them explicitly.

Do not rename permission codes in R02 without separate architecture reason.

Do not create aliases solely for test readability.

If permission description changes, tests should not depend on prose description.

Tests should depend on `code`.

---

# 122. Role Code Stability

Role codes may be fixture-local.

If new R02 roles are created, choose stable codes.

Suggested synthetic role codes:

```text
P02_MANAGER
P02_STAFF
P02_KITCHEN
P02_CASHIER
```

Use these only if coexistence with R04 roles is beneficial.

Do not create duplicate semantic roles if existing roles can be extended safely.

Record final decision in implementation PR.

---

# 123. Fixture Coexistence Strategy

Prefer extending existing R04 fixtures where they already represent needed actors.

Do not delete R04 manager merely to add R02 owner.

Do not delete R04 staff merely to add R02 staff.

Add email/credential identity to existing actor where compatible.

Add kitchen/cashier actors only if missing.

Preserve IDs used by existing R04 tests.

Avoid broad fixture renaming.

---

# 124. Seed Update Strategy

Add user email fields to existing synthetic users if final schema permits.

Add credential rows after users exist.

Add any new roles before memberships that reference them.

Add role-permission mappings before authorization tests consume them.

Add memberships after role/user/branch rows exist.

Maintain readable sections with comments.

Keep synthetic credential comments explicit.

Do not interleave credential hashes into unrelated FoodFlow menu seed sections.

---

# 125. Credential Fixture Comment Standard

Near credential seed rows, include a warning such as:

```text
Synthetic local/test credential fixtures only.
Never use these passwords or hashes in production.
```

Do not claim test hashes are secrets.

Do not hide them in environment variables merely for appearance.

The security boundary is that production does not use them.

---

# 126. Auth.js Handoff Requirement

R03 needs deterministic login-positive fixture.

R03 needs wrong-password fixture behavior.

R03 needs disabled-credential fixture.

R03 needs suspended-user fixture.

R03 needs no-membership fixture.

R03 needs stable user IDs.

R03 needs stable normalized emails.

R03 needs stable test passwords.

R03 needs membership expectations.

R03 needs permission expectations for later session claims/access checks.

R02 must provide these before R03 implementation begins.

---

# 127. R03 Scope Reserved

R03 owns Auth.js configuration.

R03 owns Credentials provider wiring.

R03 owns live password verification flow.

R03 owns successful Auth.js session creation.

R03 owns invalid-credential login response.

R03 owns replacement of live login authority.

R03 may use R02 fixtures.

R02 must not implement these behaviors early.

---

# 128. R04 Scope Reserved

R04 owns workspace/access context.

R04 owns choosing valid tenant/branch membership after identity.

R04 owns revocation/session response semantics.

R04 owns membership changes affecting active access.

R02 provides fixtures for these cases.

R02 does not implement user-facing workspace selection.

---

# 129. R05 Scope Reserved

R05 owns route permission enforcement.

R05 owns command permission enforcement.

R05 owns mapping authenticated access context to protected actions.

R02 proves permission data semantics only.

R02 must not rewrite proxy authorization yet.

---

# 130. R06 Scope Reserved

R06 owns legacy shared-auth removal.

R06 owns atomic cleanup of temporary credential/session code.

R06 owns Phase 02 security acceptance.

R02 must preserve legacy path until later replacement is proven.

---

# 131. Validation Commands — Application

Implementation should use current package scripts.

Expected:

```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm run test
npm run build:next
```

If script names change on R01 branch, use actual current names.

Record actual results.

Do not fabricate local execution.

---

# 132. Validation Commands — Database

Expected local database validation includes:

```bash
./apps/web/next-flow/node_modules/.bin/supabase start
```

```bash
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
```

```bash
./apps/web/next-flow/node_modules/.bin/supabase test db --local
```

```bash
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```

Use actual repository command forms at execution time.

---

# 133. Validation Commands — Generated Types

Expected:

```bash
cd apps/web/next-flow
npm run db:generate
```

Then:

```bash
npm run db:verify-types
```

or current equivalent.

If no schema change, verify no unexpected generated diff.

---

# 134. Validation Commands — DB Runtime

Expected:

```bash
npm run test:db-runtime
```

or current equivalent.

R02 integration tests should be included in the normal test path or explicitly invoked.

Record the exact command used.

---

# 135. Document Validation vs GitHub Actions

This specification document is validated by content.

GitHub Actions are not document-validation authority.

A red GitHub Action does not automatically mean this spec is wrong.

A missing GitHub Action does not automatically mean this spec is wrong.

A queued GitHub Action does not block document correctness.

Implementation PR CI remains important implementation evidence.

This distinction must remain explicit.

---

# 136. Expected Implementation Validation Matrix

Application lint:

```text
PASS required
```

Typecheck:

```text
PASS required
```

Unit/integration tests:

```text
PASS required
```

Next build:

```text
PASS required
```

Clean DB reset:

```text
PASS required
```

SQL tests:

```text
PASS required
```

R04 regression:

```text
PASS required
```

R01 identity regression:

```text
PASS required
```

---

# 137. Positive Acceptance Matrix

Owner valid credential lookup:

```text
PASS
```

Staff A1 valid credential lookup:

```text
PASS
```

Kitchen valid credential lookup:

```text
PASS if credential-bearing
```

Cashier valid credential lookup:

```text
PASS if credential-bearing
```

Manager Tenant A membership:

```text
PASS
```

Staff A1 exact branch membership:

```text
PASS
```

Kitchen permission:

```text
PASS
```

Cashier permission:

```text
PASS
```

---

# 138. Negative Acceptance Matrix

Unknown email:

```text
DENY
```

Suspended user credential candidate:

```text
DENY
```

Disabled credential candidate:

```text
DENY
```

No-credential candidate:

```text
DENY
```

Invited membership authorization:

```text
DENY
```

Suspended membership authorization:

```text
DENY
```

Revoked membership authorization:

```text
DENY
```

Cross-tenant access:

```text
DENY
```

Cross-branch access:

```text
DENY
```

Self-elevation:

```text
DENY
```

---

# 139. Implementation Sequence — Step 01

Fetch current `main`.

Read current policy.

Read this spec.

Find latest R01 implementation branch.

Record R01 branch name.

Record R01 head SHA.

Confirm R01 handoff is stable.

Stop if R01 implementation absent.

---

# 140. Implementation Sequence — Step 02

Create R02 branch from R01 lineage tip.

Recommended:

```text
p02-r02-credential-fixtures-authorization-contracts
```

Record parent SHA.

Do not create from main when R01 is unmerged but implemented on branch.

---

# 141. Implementation Sequence — Step 03

Audit current `supabase/seed.sql`.

List existing fixture IDs.

List current user statuses.

List membership statuses.

List current roles.

List permission mappings.

Identify which R02 personas can reuse existing actors.

Identify minimal new actors required.

---

# 142. Implementation Sequence — Step 04

Audit R01 identity implementation.

Record normalized-email storage/lookup design.

Record pre-auth role name.

Record credential lookup function name.

Record password encoding contract.

Record password verifier API.

Record credential repository API.

Do not guess names from this document if R01 differs.

---

# 143. Implementation Sequence — Step 05

Define final fixture matrix.

Assign stable emails.

Assign stable IDs for new actors.

Assign stable role IDs if needed.

Assign stable membership IDs.

Assign expected permission codes.

Document test-only passwords centrally.

---

# 144. Implementation Sequence — Step 06

Update seed users.

Add emails where needed.

Preserve existing IDs.

Preserve existing status semantics.

Add new kitchen/cashier/no-membership personas only if required.

Avoid unrelated FoodFlow seed changes.

---

# 145. Implementation Sequence — Step 07

Add credentials.

Use exact R01 supported algorithm.

Use deterministic test vectors.

Add enabled credentials.

Add disabled credential fixture.

Leave no-credential user without row.

Do not seed throttle failures.

---

# 146. Implementation Sequence — Step 08

Add or update roles.

Add kitchen role if needed.

Add cashier role if needed.

Keep roles tenant-scoped.

Do not grant all permissions.

Use canonical permission codes.

---

# 147. Implementation Sequence — Step 09

Add role-permission mappings.

Manager mappings intentional.

Staff mappings intentional.

Kitchen mappings intentional.

Cashier mappings intentional.

Tenant B mappings tenant-local.

Avoid duplicate mappings.

---

# 148. Implementation Sequence — Step 10

Add memberships.

Use tenant-wide manager membership.

Use exact branch staff memberships.

Use exact branch kitchen membership.

Use exact branch cashier membership.

Preserve invited/suspended/revoked cases.

Add no-membership user with no membership.

---

# 149. Implementation Sequence — Step 11

Write SQL fixture-presence tests.

Write credential-state tests.

Write email normalization tests.

Write membership status tests.

Write role-permission tests.

Write RLS positive tests.

Write RLS negative tests.

Write self-elevation tests.

---

# 150. Implementation Sequence — Step 12

Create TypeScript fixture constants if useful.

Export IDs.

Export emails.

Export test passwords.

Export expected permission codes.

Keep file test-only.

Do not import into runtime production modules.

---

# 151. Implementation Sequence — Step 13

Write credential repository integration tests.

Positive candidate.

Wrong password.

Disabled credential.

Suspended user.

No credential.

Unknown email.

No membership separation.

---

# 152. Implementation Sequence — Step 14

Write authorization integration tests.

Manager tenant-wide.

Staff A1 exact branch.

Staff A2 exact branch.

Kitchen permissions.

Cashier permissions.

Tenant B isolation.

Inactive membership denial.

---

# 153. Implementation Sequence — Step 15

Run clean DB reset.

Fix deterministic fixture issues.

Run SQL test suite.

Run inherited R04 tests.

Run inherited R01 tests.

Do not skip inherited security tests.

---

# 154. Implementation Sequence — Step 16

Run generated type checks.

Confirm no unexpected schema drift.

If schema unchanged, generated file should remain unchanged.

Investigate unexpected diff.

---

# 155. Implementation Sequence — Step 17

Run application lint.

Run typecheck.

Run test suite.

Run DB runtime tests.

Run Next build.

Record actual outputs.

---

# 156. Implementation Sequence — Step 18

Inspect final diff.

Remove accidental unrelated edits.

Check no live Auth.js cutover.

Check no legacy auth removal.

Check no production secrets.

Check no schema churn without justification.

Open one R02 implementation PR.

Stop.

---

# 157. Definition of Done — Lineage

- [ ] R02 spec exists on main.
- [ ] R02 spec is READY.
- [ ] R01 implementation branch exists before R02 starts.
- [ ] R01 handoff is consumed.
- [ ] R02 branch descends from R01 branch.
- [ ] parent branch recorded.
- [ ] parent SHA recorded.
- [ ] implementation head SHA recorded.

---

# 158. Definition of Done — Fixture Identity

- [ ] deterministic owner/manager fixture exists.
- [ ] deterministic Branch A1 staff exists.
- [ ] deterministic Branch A2 staff exists.
- [ ] deterministic kitchen fixture exists if required.
- [ ] deterministic cashier fixture exists if required.
- [ ] deterministic Tenant B fixture exists.
- [ ] deterministic suspended user exists.
- [ ] deterministic invited membership exists.
- [ ] deterministic suspended membership exists.
- [ ] deterministic revoked membership exists.
- [ ] deterministic disabled credential exists.
- [ ] deterministic no-credential user exists.
- [ ] deterministic no-membership user exists if selected.

---

# 159. Definition of Done — Credential

- [ ] stable synthetic emails exist.
- [ ] normalized emails are unique.
- [ ] supported algorithm used.
- [ ] valid positive hash vectors exist.
- [ ] test passwords centralized.
- [ ] disabled credential has `disabled_at`.
- [ ] no-credential fixture has no credential row.
- [ ] no plaintext password column introduced.
- [ ] no production credential present.
- [ ] repository lookup positive case passes.
- [ ] repository lookup negative cases pass.

---

# 160. Definition of Done — Membership

- [ ] manager membership tenant-wide.
- [ ] Branch A1 membership exact.
- [ ] Branch A2 membership exact.
- [ ] Tenant B membership isolated.
- [ ] invited membership denied.
- [ ] suspended membership denied.
- [ ] revoked membership denied.
- [ ] no-membership case denied.
- [ ] role tenant matches membership tenant.
- [ ] branch tenant matches membership tenant.

---

# 161. Definition of Done — Permission

- [ ] manager positive permissions proven.
- [ ] staff positive permission proven.
- [ ] staff privileged negatives proven.
- [ ] kitchen positive permissions proven.
- [ ] kitchen cashier/admin negatives proven.
- [ ] cashier positive permissions proven.
- [ ] cashier kitchen/admin negatives proven.
- [ ] cross-tenant permission denied.
- [ ] cross-branch permission denied.
- [ ] canonical permission codes used.

---

# 162. Definition of Done — RLS

- [ ] actorless deny proven.
- [ ] Tenant A manager allow proven.
- [ ] Tenant A manager Tenant B deny proven.
- [ ] staff A1 allow proven.
- [ ] staff A1 A2 deny proven.
- [ ] staff A2 allow proven.
- [ ] staff A2 A1 deny proven.
- [ ] Tenant B allow proven.
- [ ] Tenant B to Tenant A deny proven.
- [ ] suspended user deny proven.
- [ ] invited membership deny proven.
- [ ] suspended membership deny proven.
- [ ] revoked membership deny proven.

---

# 163. Definition of Done — Self-Elevation

- [ ] staff cannot self-promote role.
- [ ] staff cannot broaden tenant.
- [ ] staff cannot broaden branch.
- [ ] staff cannot grant role permissions.
- [ ] failed/filtered mutation leaves data unchanged.
- [ ] existing R04 self-elevation tests remain green.

---

# 164. Definition of Done — Pre-Auth Security

- [ ] pre-auth direct user-table broad read denied.
- [ ] pre-auth direct membership broad read denied.
- [ ] pre-auth credential table read denied.
- [ ] pre-auth throttle table read denied.
- [ ] pre-auth FoodFlow domain read denied.
- [ ] pre-auth payment read denied.
- [ ] pre-auth audit read denied.
- [ ] approved credential lookup function remains allowed.
- [ ] R01 privilege tests remain green.

---

# 165. Definition of Done — Quality

- [ ] clean DB reset succeeds.
- [ ] seed succeeds.
- [ ] SQL tests pass.
- [ ] R04 regression passes.
- [ ] R01 regression passes.
- [ ] DB lint passes.
- [ ] generated type verification passes.
- [ ] lint passes.
- [ ] typecheck passes.
- [ ] unit/integration tests pass.
- [ ] DB runtime tests pass.
- [ ] Next build passes.

---

# 166. Definition of Done — Scope Discipline

- [ ] Auth.js live cutover not implemented.
- [ ] legacy session not removed.
- [ ] legacy login route not replaced.
- [ ] workspace chooser not implemented.
- [ ] AccessContext not productized.
- [ ] route permission cutover not implemented.
- [ ] command permission cutover not implemented.
- [ ] customer auth not implemented.
- [ ] payment feature work not implemented.
- [ ] realtime feature work not implemented.
- [ ] voice feature work not implemented.
- [ ] production DB not modified.

---

# 167. PR Evidence Requirements

The implementation PR must state:

```text
Specification: FLOW_P02_R02_IMPLEMENTATION_SPEC.md
Phase: 02
Round: 02
Previous: FLOW_P02_R01_IMPLEMENTATION_SPEC.md
```

The PR must record R01 parent branch.

The PR must record R01 parent SHA.

The PR must record R02 head SHA.

The PR must list fixture IDs added/reused.

The PR must list test emails.

The PR must describe test-only password strategy.

The PR must describe credential encoding strategy inherited from R01.

The PR must list roles added/reused.

The PR must list permission mappings.

The PR must list membership scopes.

The PR must state schema changed YES/NO.

The PR must state production DB modified NO.

---

# 168. PR Validation Evidence

Record application lint result.

Record typecheck result.

Record unit/integration result.

Record Next build result.

Record clean DB reset result.

Record SQL test result.

Record R04 regression result.

Record R01 regression result.

Record DB lint result.

Record generated-type result.

Record DB runtime result.

Use truthful statuses only.

Do not fabricate local execution.

---

# 169. Implementation Merge Boundary

The implementation agent must not merge R02 PR.

The implementation agent must not enable auto-merge.

The implementation agent must not push implementation directly to main.

Owner controls implementation integration.

R03 branch may later descend from R02 branch according to current branch-chain policy once R03 spec is READY.

---

# 170. Stop Conditions

Stop if R01 implementation branch does not exist.

Stop if R01 implementation is not meaningful.

Stop if R01 changes normalized-email contract unexpectedly.

Stop if R01 changes credential algorithm unexpectedly.

Stop if R01 changes pre-auth API in a way this spec does not cover.

Stop if R02 branch already exists and should be continued instead of duplicated.

Stop if current main has a superseding R02 amendment.

Stop if production DB access would be required.

Stop if fixture implementation would require doing R03 live cutover.

---

# 171. Prohibitions — Identity

NO second `app.users`-like table.

NO parallel membership model.

NO parallel permission catalog.

NO role-name-only authorization.

NO browser-provided tenant authority.

NO browser-provided branch authority.

NO fake actor UUID for authenticated server path.

NO production email fixture.

NO real user data.

---

# 172. Prohibitions — Credentials

NO plaintext production password.

NO plaintext credential storage column.

NO reversible password encryption.

NO SHA-only password hashing.

NO unsupported algorithm downgrade.

NO production secret in seed.

NO environment production password as test fixture.

NO credential hash logging.

NO session token logging.

---

# 173. Prohibitions — Authorization

NO cross-tenant role reuse.

NO branch scope widening for convenience.

NO broad pre-auth table grants.

NO flow_runtime credential grants.

NO flow_identity credential grants.

NO self-elevation test weakening.

NO RLS disabling for fixture setup.

NO `BYPASSRLS` for application roles.

---

# 174. Prohibitions — Delivery

NO direct implementation push to main.

NO implementation PR merge by agent.

NO implementation auto-merge.

NO R03 implementation in R02 branch.

NO historical migration rewrite.

NO production DB reset.

NO production credential insertion.

NO unrelated dependency update.

NO unrelated UI redesign.

---

# 175. Handoff Package to R03

R03 must receive one known-valid owner/manager credential fixture.

R03 must receive one known-valid staff credential fixture.

R03 should receive kitchen/cashier fixture credentials if useful for route-session tests.

R03 must receive one disabled credential fixture.

R03 must receive one suspended user fixture.

R03 must receive one no-membership fixture or an explicit equivalent.

R03 must receive exact normalized emails.

R03 must receive exact test password constants.

R03 must receive exact user IDs.

R03 must receive exact tenant/branch expectations.

R03 must receive exact permission expectations.

R03 must receive inherited negative authorization tests.

---

# 176. Handoff Contract to R03

R03 may assume:

```text
fixture identities are stable
```

R03 may assume:

```text
credential verification vectors are stable
```

R03 may assume:

```text
pre-auth lookup already proven
```

R03 may assume:

```text
authorization matrix already proven at DB level
```

R03 may not assume:

```text
workspace context already implemented
```

R03 may not assume:

```text
route permissions already enforced
```

---

# 177. R03 Readiness Questions

Can a known synthetic active user be resolved by normalized email?

Expected:

```text
YES
```

Can the known test password verify?

Expected:

```text
YES
```

Can disabled credential resolve?

Expected:

```text
NO
```

Can suspended user resolve?

Expected:

```text
NO
```

Are membership scopes deterministic?

Expected:

```text
YES
```

Are permission expectations deterministic?

Expected:

```text
YES
```

---

# 178. Document Content Validation Checklist

- [ ] Phase metadata correct.
- [ ] Round metadata correct.
- [ ] Previous correct.
- [ ] Next correct.
- [ ] R01 dependency explicit.
- [ ] branch lineage explicit.
- [ ] current implementation-state caveat explicit.
- [ ] fixture objectives explicit.
- [ ] persona matrix explicit.
- [ ] credential strategy explicit.
- [ ] role strategy explicit.
- [ ] permission strategy explicit.
- [ ] membership strategy explicit.
- [ ] RLS validation explicit.
- [ ] negative security validation explicit.
- [ ] failure handling explicit.
- [ ] files to create explicit.
- [ ] files to modify explicit.
- [ ] do-not-touch files explicit.
- [ ] implementation sequence explicit.
- [ ] DoD explicit.
- [ ] R03 handoff explicit.

---

# 179. Document Line-Count Policy

Executable spec minimum:

```text
1800 lines
```

Executable spec maximum:

```text
2500 lines
```

The line count must be measured on the actual final file.

Blank-line padding must not be used to satisfy the threshold.

Repeated prose must not be used to satisfy the threshold.

Artificial wrapping must not be used to satisfy the threshold.

This document must remain implementation-dense.

---

# 180. Final R02 Acceptance Matrix

Spec on main and READY?

```text
YES
```

R01 branch required before R02 code?

```text
YES
```

R02 branch parent = latest R01 branch?

```text
YES
```

Deterministic fixture IDs?

```text
YES
```

Deterministic synthetic emails?

```text
YES
```

Deterministic credential vectors?

```text
YES
```

Production credentials used?

```text
NO
```

Cross-tenant denial covered?

```text
YES
```

Cross-branch denial covered?

```text
YES
```

Inactive user denial covered?

```text
YES
```

Inactive membership denial covered?

```text
YES
```

Disabled credential denial covered?

```text
YES
```

Self-elevation denial preserved?

```text
YES
```

R01 least privilege preserved?

```text
YES
```

Live Auth.js cutover in R02?

```text
NO
```

Legacy auth removed in R02?

```text
NO
```

Production DB modified?

```text
NO
```

Implementation PR merged by agent?

```text
NO
```

---

# 181. Final Development Gate

The legal execution path is:

```text
READ CURRENT MAIN
        ↓
VERIFY THIS R02 SPEC IS READY
        ↓
FIND LATEST P02/R01 IMPLEMENTATION BRANCH
        ↓
IF NO R01 BRANCH → STOP
        ↓
RE-AUDIT R01 FINAL IDENTITY/PRE-AUTH CONTRACT
        ↓
CREATE R02 BRANCH FROM R01 BRANCH
        ↓
EXTEND DETERMINISTIC SEED IDENTITIES
        ↓
ADD TEST-ONLY CREDENTIAL VECTORS
        ↓
ADD/REUSE ROLE + PERMISSION FIXTURES
        ↓
ADD/REUSE MEMBERSHIP FIXTURES
        ↓
ADD KITCHEN/CASHIER/NEGATIVE PERSONAS AS NEEDED
        ↓
WRITE SQL FIXTURE + AUTHORIZATION TESTS
        ↓
WRITE SERVER INTEGRATION TESTS
        ↓
PRESERVE R01 SECURITY TESTS
        ↓
PRESERVE R04 RLS/SELF-ELEVATION TESTS
        ↓
CLEAN DATABASE RESET
        ↓
RUN DATABASE QUALITY
        ↓
RUN APPLICATION QUALITY
        ↓
OPEN ONE P02/R02 IMPLEMENTATION PR
        ↓
STOP
        ↓
OWNER CONTROLS MERGE
```

---

# 182. Final Implementation Agent Checklist

## Authority

- [ ] current main fetched.
- [ ] current policy read.
- [ ] exact R02 spec read.
- [ ] R01 branch found.
- [ ] R01 head SHA recorded.
- [ ] R02 parent selected correctly.

## Fixtures

- [ ] existing R04 IDs reused where useful.
- [ ] new actors minimal.
- [ ] stable emails defined.
- [ ] test passwords centralized.
- [ ] credential rows deterministic.
- [ ] disabled credential defined.
- [ ] no-credential actor defined.
- [ ] no-membership actor defined if selected.

## Authorization

- [ ] tenant-wide manager covered.
- [ ] Branch A1 staff covered.
- [ ] Branch A2 staff covered.
- [ ] kitchen covered.
- [ ] cashier covered.
- [ ] Tenant B covered.
- [ ] cross-tenant denial covered.
- [ ] cross-branch denial covered.
- [ ] inactive statuses covered.
- [ ] self-elevation covered.

## Security

- [ ] R01 pre-auth grants unchanged.
- [ ] no broad credential access.
- [ ] no production secret.
- [ ] no password logging.
- [ ] no RLS bypass.
- [ ] no role-context widening.

## Quality

- [ ] clean reset executed.
- [ ] SQL tests executed.
- [ ] R01 regression executed.
- [ ] R04 regression executed.
- [ ] lint executed.
- [ ] typecheck executed.
- [ ] test suite executed.
- [ ] build executed.
- [ ] actual results recorded.

## Delivery

- [ ] one R02 implementation PR.
- [ ] parent/head evidence recorded.
- [ ] no implementation merge by agent.
- [ ] no auto-merge.
- [ ] R03 handoff stated.

---

# 183. End State

When implementation eventually satisfies this specification:

```text
P02/R02 = IMPLEMENTED ON ROUND BRANCH
```

The round is not made current merely by the existence of this document.

Until R01 implementation exists:

```text
CURRENT IMPLEMENTATION ROUND = P02/R01
P02/R02 IMPLEMENTATION = BLOCKED / NOT STARTED
```

After R02 is implemented, R03 may be prepared/executed only under its own READY specification and current branch-chain policy.
