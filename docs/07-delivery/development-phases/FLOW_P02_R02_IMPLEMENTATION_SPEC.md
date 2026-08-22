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
- Amendment current-round observation: `P02/R01 remains the earliest not-started implementation round; this R02 document does not authorize skipping R01.`

---

# 0. Amendment Intent
- Replace the shallow R02 document with an implementation-ready contract.
- Increase useful implementation detail without adding filler.
- Preserve the same Phase, Round, Previous, Next, and product scope.
- Keep R02 focused on deterministic identity fixtures and authorization proof.
- Keep R03 live Auth.js cutover explicitly out of scope.
- Keep R04 workspace/access-context behavior explicitly out of scope.
- Keep R05 route/command authorization explicitly out of scope.
- Keep R06 legacy-auth removal explicitly out of scope.
- Make fixture identity, credential, role, permission, membership, and RLS behavior explicit.
- Make positive and negative validation equally explicit.
- Make code impact concentrated around the highest-risk identity/authorization surfaces.
- Make the handoff to R03 deterministic.

# 1. Current Repository State
- Current main observed before amendment branch creation: `d3fe600a1544e254c10b812418034b0a17d984c7`.
- That commit merged the original R02 spec.
- Original R02 spec was approximately 473 lines.
- Current executable-spec depth policy requires 1,800–2,500 lines.
- `p02-r01*` implementation branch search returned none at amendment authoring time.
- `p02-r02*` implementation branch search returned none at amendment authoring time.
- P02/R01 implementation therefore remains NOT STARTED.
- P02/R02 implementation therefore remains NOT STARTED.
- R02 spec may exist on main without making R02 the current implementation round.
- R02 implementation must not begin until R01 implementation lineage exists.
- This amendment changes documentation authority only.
- This amendment does not create implementation code.

# 2. Phase 02 Objective
- Replace shared prototype internal identity authority with real application users.
- Preserve customer public-entry behavior.
- Use database-backed credentials for internal human identity.
- Use Auth.js as eventual internal session authority.
- Derive access from active memberships.
- Preserve tenant isolation.
- Preserve branch isolation.
- Resolve permissions from role-permission relationships.
- Enforce authorization server-side.
- Preserve RLS as defense in depth.
- Handle inactive/revoked/suspended state fail-closed.
- Remove legacy shared auth only after the replacement path is proven.

# 3. Phase 02 Round Decomposition
- R01 = identity and pre-authentication boundary.
- R02 = deterministic credential fixtures and authorization contract proof.
- R03 = Auth.js Credentials authentication and session authority cutover.
- R04 = workspace/access context and revocation semantics.
- R05 = route and command permission enforcement.
- R06 = atomic legacy-auth removal and security acceptance.
- R02 must consume R01 primitives rather than reinvent them.
- R02 must prepare stable personas for R03.
- R02 must prepare stable membership states for R04.
- R02 must prepare stable permission expectations for R05.
- R02 must preserve legacy auth until later cutover.
- R02 must not collapse Phase 02 sequencing.

# 4. R02 High-Impact Objective
- Turn existing synthetic authorization fixtures into a deterministic Phase-02 identity contract.
- Give later rounds stable test users.
- Give later rounds stable synthetic emails.
- Give later rounds stable credential vectors.
- Give later rounds stable tenant and branch relationships.
- Give later rounds stable role assignments.
- Give later rounds stable permission assignments.
- Give later rounds stable membership states.
- Give later rounds stable denial personas.
- Prove authorization semantics through SQL and server integration tests.
- Preserve R01 least privilege.
- Preserve R04 actor/RLS semantics.

# 5. R02 Completion Shape
- Deterministic Tenant A.
- Deterministic Tenant B.
- Deterministic Branch A1.
- Deterministic Branch A2.
- Deterministic Branch B1.
- Deterministic owner/manager actor.
- Deterministic branch staff actors.
- Deterministic kitchen actor.
- Deterministic cashier actor.
- Deterministic suspended user.
- Deterministic invited/suspended/revoked memberships.
- Deterministic disabled/no-credential/no-membership cases.

# 6. Hard Execution Gate
- This file must exist on current main.
- `Status` must remain `READY`.
- Current merge/branch policy must be re-read from main.
- P02/R01 implementation branch must exist before R02 code starts.
- P02/R01 must contain meaningful implementation code.
- R01 handoff must be stable enough to consume.
- R01 normalized-email contract must be re-read.
- R01 credential encoding contract must be re-read.
- R01 pre-auth role/function names must be re-read.
- R01 server identity module paths must be re-read.
- R02 must not already have another active implementation branch.
- R02 branch parent must be the latest approved R01 lineage tip.

# 7. Stop Conditions Before R02 Code
- Stop if no R01 implementation branch exists.
- Stop if R01 branch contains no meaningful implementation.
- Stop if R01 code contradicts this document materially.
- Stop if current main contains a superseding R02 amendment.
- Stop if an R02 branch already exists and should be continued instead.
- Stop if a production database action would be required.
- Stop if implementation requires live Auth.js cutover.
- Stop if implementation requires route permission cutover.
- Stop if implementation requires workspace productization.
- Stop if implementation requires unrelated product work.
- Report the blocker precisely.
- Do not silently broaden scope.

# 8. Authority vs Lineage
- `main` is specification authority.
- `main` is policy authority.
- Latest R01 implementation branch is code baseline.
- R02 must branch from R01 lineage, not automatically from main.
- R01 implementation merge is not required merely for lineage continuation when current policy permits it.
- R02 PR must record exact parent branch.
- R02 PR must record exact parent SHA.
- R02 PR must record exact R02 head SHA.
- Do not use a stale R01 branch if a newer approved lineage tip exists.
- Do not use old PR prose as code authority.
- Re-audit actual R01 code before implementation.
- Keep documentation authority separate from implementation ancestry.

# 9. In Scope — Identity Fixtures
- Stable synthetic internal user IDs.
- Stable synthetic login emails.
- Active user positive cases.
- Suspended user denial case.
- Disabled credential denial case.
- Missing credential denial case.
- No-membership authorization denial case.
- Tenant A personas.
- Tenant B persona.
- Branch A1 persona.
- Branch A2 persona.
- Branch B1 persona.

# 10. In Scope — Authorization Fixtures
- Tenant-wide active membership.
- Branch A1 active membership.
- Branch A2 active membership.
- Branch B1 active membership.
- Invited membership.
- Suspended membership.
- Revoked membership.
- Manager role.
- Staff role.
- Kitchen role when needed.
- Cashier role when needed.
- Canonical role-permission mappings.

# 11. In Scope — Validation
- Credential candidate lookup tests.
- Password test-vector verification.
- Membership helper tests.
- Permission helper tests.
- RLS allow tests.
- RLS deny tests.
- Cross-tenant tests.
- Cross-branch tests.
- Inactive-state tests.
- Pre-auth least-privilege regression.
- Self-elevation regression.
- Clean reset reproducibility.

# 12. Out of Scope — Authentication Cutover
- No live database-backed `/api/auth/login` cutover.
- No final Auth.js Credentials provider.
- No final Auth.js handler route.
- No `foodflow_session` replacement.
- No JOSE legacy token removal.
- No `FOODFLOW_INTERNAL_*` removal.
- No Google OAuth.
- No social OAuth.
- No MFA productization.
- No session authority switch.
- No production login migration.
- No user migration tooling.

# 13. Out of Scope — Authorization Productization
- No workspace chooser UI.
- No tenant selector UI.
- No branch selector UI.
- No AccessContext productization.
- No live session revocation propagation.
- No route-level permission guard cutover.
- No command-level permission guard cutover.
- No proxy redesign.
- No admin navigation redesign.
- No role-management UI.
- No member-management UI expansion.
- No customer account authorization.

# 14. Out of Scope — Product Features
- No customer cart work.
- No order persistence work.
- No staff operation workflow work.
- No kitchen routing work.
- No realtime work.
- No merchant payment work.
- No SaaS billing work.
- No voice ordering work.
- No unrelated UI redesign.
- No unrelated dependency modernization.
- No production DB mutation.
- No production secret rotation.

# 15. Existing Database Baseline
- `app.organizations` already exists.
- `app.restaurants` already exists.
- `app.branches` already exists.
- `app.users` already exists.
- `app.roles` already exists.
- `app.permissions` already exists.
- `app.role_permissions` already exists.
- `app.memberships` already exists.
- `private.user_credentials` already exists.
- `private.login_throttles` already exists.
- Actor-aware membership helpers already exist.
- Tenant/branch RLS already exists.

# 16. Existing Seed Baseline
- Tenant A already exists.
- Tenant B already exists.
- Restaurant A already exists.
- Restaurant B already exists.
- Branch A1 already exists.
- Branch A2 already exists.
- Branch B1 already exists.
- R04 manager actor already exists.
- R04 Branch A1 staff actor already exists.
- R04 Branch A2 staff actor already exists.
- R04 inactive-state actors already exist.
- Tenant B staff actor already exists.

# 17. Existing Tenant IDs
- Tenant A: `00000000-0000-0000-0000-0000000000a1`.
- Restaurant A: `00000000-0000-0000-0000-0000000000a2`.
- Branch A1: `00000000-0000-0000-0000-0000000000a3`.
- Branch A2: `00000000-0000-0000-0000-0000000000ac`.
- Tenant B: `00000000-0000-0000-0000-0000000000b1`.
- Restaurant B: `00000000-0000-0000-0000-0000000000b2`.
- Branch B1: `00000000-0000-0000-0000-0000000000b3`.
- Reuse these IDs unless final R01 implementation gives a concrete reason not to.
- Do not duplicate tenants for auth tests.
- Do not create unnecessary extra branches.
- Keep fixture footprint compact.
- Keep IDs deterministic.

# 18. Existing R04 User IDs
- Tenant A manager: `30000000-0000-4000-8000-0000000000a1`.
- Branch A1 staff: `30000000-0000-4000-8000-0000000000a2`.
- Branch A2 staff: `30000000-0000-4000-8000-0000000000a3`.
- Suspended user: `30000000-0000-4000-8000-0000000000a4`.
- Invited-membership user: `30000000-0000-4000-8000-0000000000a5`.
- Suspended-membership user: `30000000-0000-4000-8000-0000000000a6`.
- Revoked-membership user: `30000000-0000-4000-8000-0000000000a7`.
- Tenant B staff: `30000000-0000-4000-8000-0000000000b1`.
- Preserve these IDs where compatible.
- Prefer adding identity fields to existing actors rather than replacing them.
- Do not break R04 tests through unnecessary renumbering.
- Add new personas only when existing actors cannot express the needed contract.

# 19. Existing R04 Role IDs
- Tenant A manager role: `50000000-0000-4000-8000-0000000000a1`.
- Tenant A staff role: `50000000-0000-4000-8000-0000000000a2`.
- Tenant B staff role: `50000000-0000-4000-8000-0000000000b1`.
- Existing role codes include `R04_MANAGER` and `R04_STAFF`.
- Reuse existing roles where semantics fit.
- Add kitchen/cashier roles only when needed.
- Keep roles tenant-scoped.
- Do not reuse Tenant A role ID in Tenant B membership.
- Do not rename existing roles only for aesthetics.
- Test permission codes rather than display names.
- Record any new role IDs in implementation PR.
- Keep role IDs deterministic.

# 20. Canonical Permission Catalog
- `operations.staff.access`.
- `operations.kitchen.access`.
- `operations.cashier.access`.
- `management.admin.access`.
- `order.view`.
- `order.manage`.
- `service.view`.
- `service.manage`.
- `kitchen.view`.
- `kitchen.manage`.
- `merchant_payment.view`.
- `merchant_payment.collect`.
- `merchant_payment.void`.
- `menu.view`.
- `menu.manage`.
- `settings.view`.
- `settings.manage`.
- `member.view`.
- `member.invite`.
- `member.manage`.
- `role.view`.
- `role.manage`.
- `audit.view`.

# 21. Permission Catalog Rules
- Use canonical permission codes already in repository.
- Do not invent aliases.
- Do not infer permission from role display name.
- Do not infer permission from route label.
- Do not infer permission from UI text.
- Do not assign all permissions for test convenience.
- Map only intentional permissions.
- Test positive permissions explicitly.
- Test negative permissions explicitly.
- Keep permission descriptions out of authorization assertions.
- Use `code` as stable contract.
- Preserve tenant-local role ownership.

# 22. Fixture Design Principles
- Every fixture has one documented purpose.
- Every fixture has stable identifier.
- Every fixture has stable logical name.
- Every fixture is synthetic.
- Every fixture is safe to commit.
- Every fixture avoids production identifiers.
- Every credential fixture is test-only.
- Every fixture is reproducible after reset.
- No random UUID generation in durable seed.
- No insertion-order assumptions.
- No `limit 1` identity lookup.
- No unused fixture rows.

# 23. Required Persona Set
- `owner_a`.
- `staff_a1`.
- `staff_a2`.
- `kitchen_a1`.
- `cashier_a2`.
- `staff_b1`.
- `suspended_user_a`.
- `invited_membership_a`.
- `suspended_membership_a`.
- `revoked_membership_a`.
- `disabled_credential_a`.
- `no_credential_a`.
- `no_membership_a` when useful for R04 handoff.

# 24. Owner Persona
- User status ACTIVE.
- Credential enabled.
- Tenant A membership ACTIVE.
- Membership branch_id NULL.
- Management role tenant = Tenant A.
- Management permissions explicit.
- Tenant A tenant-level membership check ALLOW.
- Branch A1 membership check ALLOW.
- Branch A2 membership check ALLOW.
- Tenant B membership check DENY.
- Tenant B data access DENY.
- Credential lookup ALLOW.

# 25. Staff A1 Persona
- User status ACTIVE.
- Credential enabled.
- Membership ACTIVE.
- Tenant = Tenant A.
- Branch = A1.
- Staff permission mapping explicit.
- Branch A1 membership ALLOW.
- Tenant-level membership with null branch DENY.
- Branch A2 membership DENY.
- Tenant B membership DENY.
- Privileged management permissions DENY.
- Credential lookup ALLOW.

# 26. Staff A2 Persona
- User status ACTIVE.
- Credential enabled.
- Membership ACTIVE.
- Tenant = Tenant A.
- Branch = A2.
- Staff permission mapping explicit.
- Branch A2 membership ALLOW.
- Tenant-level membership with null branch DENY.
- Branch A1 membership DENY.
- Tenant B membership DENY.
- Privileged management permissions DENY.
- Credential lookup ALLOW.

# 27. Kitchen Persona
- User status ACTIVE.
- Credential enabled when needed for R03 tests.
- Membership ACTIVE.
- Tenant = Tenant A.
- Preferred branch = A1.
- `operations.kitchen.access` ALLOW.
- `kitchen.view` ALLOW.
- `kitchen.manage` ALLOW when mapped.
- `operations.cashier.access` DENY.
- `merchant_payment.collect` DENY unless explicitly mapped.
- `management.admin.access` DENY.
- Cross-branch and cross-tenant DENY.

# 28. Cashier Persona
- User status ACTIVE.
- Credential enabled when needed for R03 tests.
- Membership ACTIVE.
- Tenant = Tenant A.
- Preferred branch = A2.
- `operations.cashier.access` ALLOW.
- `merchant_payment.view` ALLOW.
- `merchant_payment.collect` ALLOW.
- `merchant_payment.void` only if intentionally mapped.
- `operations.kitchen.access` DENY.
- `management.admin.access` DENY.
- Cross-branch and cross-tenant DENY.

# 29. Tenant B Persona
- User status ACTIVE.
- Credential enabled.
- Membership ACTIVE.
- Tenant = Tenant B.
- Branch = B1.
- Role belongs to Tenant B.
- Branch B1 membership ALLOW.
- Tenant A membership DENY.
- Branch A1 access DENY.
- Branch A2 access DENY.
- Tenant A role IDs never reused.
- Credential lookup independent of Tenant A state.

# 30. Suspended User Persona
- User status must be the actual non-active schema value, currently known as `SUSPENDED`.
- Credential may remain enabled for denial proof.
- Membership may remain ACTIVE for denial proof.
- Pre-auth candidate lookup DENY.
- Membership helper DENY.
- Permission helper DENY.
- RLS protected visibility DENY.
- ACTIVE membership must not rescue suspended user.
- Valid role must not rescue suspended user.
- Valid hash must not rescue suspended user.
- Keep this fixture stable for R03 denial tests.
- Do not delete membership merely to make test pass.

# 31. Invited Membership Persona
- User status ACTIVE.
- Credential may be enabled.
- Membership status INVITED.
- Credential lookup may identify user if auth/authz remain separate.
- Membership authorization DENY.
- Permission authorization DENY.
- RLS DENY.
- No workspace authority.
- Keep status explicit.
- Do not convert INVITED to ACTIVE in test setup.
- Preserve as R04 access-context fixture.
- Separate authentication from authorization.

# 32. Suspended Membership Persona
- User status ACTIVE.
- Credential may be enabled.
- Membership status SUSPENDED.
- Membership authorization DENY.
- Permission authorization DENY.
- RLS DENY.
- User global status remains ACTIVE.
- Organization access can therefore be revoked independently.
- Preserve fixture for R04 revocation semantics.
- Do not change user to SUSPENDED just to produce denial.
- Keep tenant/branch fields valid so status is the denial reason.
- Keep role valid so status is the denial reason.

# 33. Revoked Membership Persona
- User status ACTIVE.
- Credential may be enabled.
- Membership status REVOKED.
- Membership authorization DENY.
- Permission authorization DENY.
- RLS DENY.
- Role assignment must not reactivate access.
- Branch context injection must not reactivate access.
- Tenant context injection must not reactivate access.
- Preserve as durable R04 revocation fixture.
- Keep user identity otherwise valid.
- Keep denial reason isolated to membership status.

# 34. Disabled Credential Persona
- User status ACTIVE.
- Membership may be ACTIVE.
- Credential row exists.
- `disabled_at` non-null.
- Password hash syntactically valid.
- Algorithm supported.
- Pre-auth lookup returns no eligible candidate.
- User status must not override disabled credential.
- Membership status must not override disabled credential.
- R03 later uses this for login denial.
- R02 does not wire live route.
- Keep fixture deterministic.

# 35. No-Credential Persona
- User status ACTIVE.
- Membership may be ACTIVE.
- No credential row exists.
- Pre-auth lookup returns no eligible candidate.
- Missing credential must not cause unhandled DB error.
- No legacy fallback inside credential repository.
- Keep fixture distinct from disabled credential.
- Keep synthetic email stable.
- Preserve for R03 no-credential login denial.
- Do not seed fake empty hash.
- Do not use null hash row.
- Absence itself is the contract.

# 36. No-Membership Persona
- User status ACTIVE.
- Credential enabled.
- No membership for Tenant A.
- No membership for Tenant B.
- Credential lookup may succeed.
- Membership resolution DENY.
- Permission resolution DENY.
- RLS tenant/branch access DENY.
- Proves authentication is not authorization.
- Useful for R04 no-workspace behavior.
- Do not give hidden tenant-wide role.
- Keep identity otherwise valid.

# 37. Canonical Email Contract
- Inherit normalized-email contract from final R01 implementation.
- Expected semantic normalization: `lower(btrim(email))` unless R01 differs.
- Do not redefine normalization independently in R02.
- Use synthetic reserved-domain emails.
- Suggested owner email: `owner.a@flow.test`.
- Suggested staff A1 email: `staff.a1@flow.test`.
- Suggested staff A2 email: `staff.a2@flow.test`.
- Suggested kitchen email: `kitchen.a1@flow.test`.
- Suggested cashier email: `cashier.a2@flow.test`.
- Suggested Tenant B email: `staff.b1@flow.test`.
- No production email.
- No Gmail address.

# 38. Email Fixture Validation
- Every positive email normalizes deterministically.
- No two durable fixtures normalize to same value.
- Case variation resolves same identity where lookup contract requires it.
- Surrounding whitespace variation resolves same identity where lookup normalizes input.
- Unknown email returns no candidate.
- Durable seed should not contain accidental surrounding whitespace.
- Collision test rows should remain transactional/test-only.
- Collision insert should fail if R01 uniqueness requires it.
- Collision update should fail if R01 uniqueness requires it.
- Do not depend on insertion order.
- Do not depend on locale-specific browser normalization.
- Use database contract as authority.

# 39. Credential Algorithm Contract
- Inherit supported algorithm from R01.
- Pre-R01 schema currently declares `scrypt-v1`.
- If R01 keeps `scrypt-v1`, R02 uses it.
- If R01 defines canonical encoded format, R02 uses exact format.
- No second encoding format.
- No bcrypt switch.
- No Argon2 switch without explicit architecture amendment.
- No SHA-only password hashing.
- No reversible password encryption.
- No plaintext password storage.
- Record final algorithm in PR.
- Record fixture encoding strategy in PR.

# 40. Test Password Strategy
- Use deterministic test-only input values.
- Centralize them in test-only code or documented fixture section.
- Never describe them as production defaults.
- Never use real owner/dev/finance credentials.
- Never load production passwords from env for fixtures.
- Suggested pattern: `flow-test-owner-a-v1`.
- Suggested pattern: `flow-test-staff-a1-v1`.
- Suggested pattern: `flow-test-kitchen-a1-v1`.
- Suggested pattern: `flow-test-cashier-a2-v1`.
- Avoid scattering literals through many test files.
- Runtime production code must not import test passwords.
- PR must identify test-only nature clearly.

# 41. Credential Hash Strategy
- Prefer deterministic known test vectors.
- Vectors must match final R01 verifier.
- Hashes may be committed because they are synthetic test data.
- Hashes must not be treated as production secrets.
- If salts are encoded, vectors must include expected format.
- Known correct password must verify.
- Known wrong password must fail.
- Malformed encoding coverage remains in R01 or is extended if missing.
- Disabled credential lookup should stop before verification.
- Unknown user should preserve R01 dummy-KDF capability if applicable.
- Do not generate different logical credentials on each reset without purpose.
- Do not log hashes.

# 42. Seed Credential Safety
- Add credential rows only after users exist.
- Add comments marking them local/test-only.
- No production credential.
- No plaintext password DB column.
- Enabled credentials have `disabled_at IS NULL`.
- Disabled fixture has non-null `disabled_at`.
- Algorithm field matches R01 contract.
- `password_hash` non-empty.
- No production secret env dependency.
- No Auth.js runtime dependency for seed.
- No throttle failure rows seeded by default.
- Reset remains deterministic.

# 43. Deterministic ID Strategy
- Reuse R04 actor IDs where meaningful.
- Use fixed UUIDs for new personas.
- Use fixed UUIDs for new roles.
- Use fixed UUIDs for new memberships.
- Avoid `gen_random_uuid()` in durable fixture seed.
- Avoid sequence-order assumptions.
- Avoid password-derived IDs.
- Avoid email-hash-derived IDs.
- Use visibly synthetic ranges.
- Document new IDs in PR.
- Keep IDs stable for R03–R06 tests.
- Do not renumber existing R04 IDs.

# 44. Role Design
- Minimum logical role set: manager/admin, staff, kitchen, cashier.
- Tenant B may use its own staff role.
- Roles remain tenant-scoped.
- Tenant A role ID never used in Tenant B membership.
- Existing R04 roles may be reused.
- Kitchen/cashier roles added only when needed.
- Do not create every hypothetical production role.
- Do not grant every permission for convenience.
- Keep role codes stable.
- Use permission codes as behavior authority.
- Record added/reused roles in PR.
- Avoid cosmetic role migration.

# 45. Manager Permission Contract
- Preserve existing `order.view` if still canonical.
- Preserve `member.view` if still canonical.
- Preserve `member.invite` if still canonical.
- Preserve `member.manage` if still canonical.
- Preserve `role.view` if still canonical.
- Preserve `role.manage` if still canonical.
- Add `management.admin.access` only if intended.
- Add settings permissions only if later route contract needs them.
- Do not grant all catalog permissions by default.
- Test at least three positive manager permissions.
- Test at least one intentionally absent permission when applicable.
- Tenant B remains denied.

# 46. Staff Permission Contract
- Likely `operations.staff.access`.
- Likely `order.view`.
- `order.manage` only if intended.
- No `management.admin.access` by default.
- No `role.manage`.
- No `member.manage`.
- No `merchant_payment.void` by default.
- Positive permission tested on exact branch.
- Same permission denied on sibling branch.
- Same permission denied cross-tenant.
- Tenant-wide management permission denied.
- Keep mappings explicit.

# 47. Kitchen Permission Contract
- `operations.kitchen.access` ALLOW.
- `kitchen.view` ALLOW.
- `kitchen.manage` ALLOW when intended.
- `order.view` only if kitchen workflow needs it.
- `operations.cashier.access` DENY.
- `merchant_payment.collect` DENY unless intentionally mapped.
- `management.admin.access` DENY.
- `member.manage` DENY.
- `role.manage` DENY.
- Exact branch ALLOW.
- Sibling branch DENY.
- Cross-tenant DENY.

# 48. Cashier Permission Contract
- `operations.cashier.access` ALLOW.
- `merchant_payment.view` ALLOW.
- `merchant_payment.collect` ALLOW.
- `merchant_payment.void` only if intentionally assigned.
- `order.view` only if operationally required.
- `operations.kitchen.access` DENY.
- `kitchen.manage` DENY.
- `management.admin.access` DENY.
- `member.manage` DENY.
- `role.manage` DENY.
- Exact branch ALLOW.
- Sibling/cross-tenant DENY.

# 49. Tenant-Wide Membership Contract
- `branch_id = NULL`.
- User ACTIVE.
- Membership ACTIVE.
- Role tenant equals membership tenant.
- Tenant-level helper ALLOW for same tenant.
- Branch A1 helper ALLOW for same tenant.
- Branch A2 helper ALLOW for same tenant.
- Tenant B helper DENY.
- Tenant-wide scope does not imply every permission.
- Permission mapping remains required.
- RLS follows actor helper semantics.
- Preserve R04 null-target semantics.

# 50. Branch-Scoped Membership Contract
- Exact branch UUID stored.
- User ACTIVE.
- Membership ACTIVE.
- Role tenant equals membership tenant.
- Branch tenant equals membership tenant.
- Exact branch helper ALLOW.
- Sibling branch helper DENY.
- Tenant-level null-target helper DENY under R04 semantics.
- Cross-tenant helper DENY.
- Permission mapping remains required.
- Branch scope never widened by role privilege.
- Keep branch ID explicit.

# 51. Membership Status Contract
- ACTIVE authorizes when all other conditions pass.
- INVITED denies.
- SUSPENDED denies.
- REVOKED denies.
- Use actual schema statuses only.
- Do not invent `INACTIVE` membership status unless schema supports it.
- Each status gets separate test fixture.
- Each status gets separate membership-helper test.
- Each status gets separate permission-helper test.
- Each status gets separate RLS test where useful.
- Keep actor otherwise valid to isolate denial reason.
- Preserve status semantics for R04.

# 52. User Status Contract
- Use actual schema-supported statuses.
- Current known ACTIVE status authorizes candidate eligibility.
- Current known SUSPENDED status denies candidate eligibility.
- Do not invent unsupported `INACTIVE` user status.
- Keep membership valid when testing user status denial.
- Keep credential valid when testing user status denial.
- Test candidate lookup denial.
- Test membership helper denial.
- Test permission helper denial.
- Test RLS denial.
- Preserve semantic distinction between user status and membership status.
- Record exact status values in PR.

# 53. Role-Permission Integrity
- Every role-permission row references existing role.
- Every role-permission row references existing permission.
- Prefer lookup by permission `code` during seed.
- Do not depend on permission row order.
- Do not duplicate mappings.
- Preserve unique constraints.
- Tenant-local role owns mapping.
- Tests may assert focused mapping counts.
- Tests must assert important absent mappings.
- No implicit permission inheritance unless schema defines it.
- No role-display-name authorization.
- No UI-label authorization.

# 54. Membership Referential Integrity
- Membership user exists.
- Membership tenant exists.
- Membership role exists.
- Branch-scoped membership branch exists.
- Role tenant matches membership tenant.
- Branch tenant matches membership tenant.
- Cross-tenant role assignment must not create authority.
- Cross-tenant branch assignment must not create authority.
- Keep foreign-key constraints enabled.
- Do not disable constraints for fixture setup.
- Test invalid cross-scope cases transactionally if useful.
- Keep seed insertion order valid.

# 55. Pre-Auth Lookup Contract
- ACTIVE + enabled credential returns candidate.
- Suspended/non-active user returns no candidate.
- ACTIVE + disabled credential returns no candidate.
- ACTIVE + missing credential returns no candidate.
- Unknown email returns no candidate.
- Candidate user ID equals deterministic fixture ID.
- Candidate normalized email equals expected synthetic email.
- Candidate algorithm equals supported R01 algorithm.
- Candidate hash remains server-only.
- Membership state should not become credential lookup authority unless R01 explicitly says so.
- Authentication remains separate from authorization.
- No tenant/branch input accepted as credential authority.

# 56. Password Verification Contract
- Known valid test password verifies.
- Wrong password fails.
- Supported algorithm parses.
- Malformed encoding fails safely.
- Unsupported algorithm fails safely.
- Constant-time compare remains R01 responsibility and regression.
- Dummy KDF path remains available if R01 defines one.
- Verification does not create session in R02.
- Verification does not mutate membership.
- Verification does not choose tenant.
- Verification does not choose branch.
- No secret value logged.

# 57. Pre-Auth Least-Privilege Regression
- Pre-auth role cannot broadly select `app.users`.
- Pre-auth role cannot broadly select `app.memberships`.
- Pre-auth role cannot directly select `private.user_credentials`.
- Pre-auth role cannot directly select `private.login_throttles`.
- Pre-auth role cannot select `foodflow.orders` broadly.
- Pre-auth role cannot select `payments.payments` broadly.
- Pre-auth role cannot select `audit.events` broadly.
- Approved credential function remains executable.
- Approved throttle functions remain executable as designed.
- R02 fixture convenience never broadens grants.
- R01 role-denial tests remain green.
- No BYPASSRLS introduced.

# 58. Runtime Role Regression
- `flow_runtime` remains tenant/branch/actor scoped.
- No direct credential access granted.
- No direct throttle access granted.
- Missing actor remains deny-by-default.
- Wrong tenant remains deny-by-default.
- Wrong branch remains deny-by-default.
- Valid exact branch remains allowed when membership active.
- Tenant-wide actor remains bounded to own tenant.
- Context values remain transaction-local.
- R02 tests use real deterministic actor IDs.
- No fake zero actor identity.
- No privilege broadening for test convenience.

# 59. Identity Role Regression
- `flow_identity` remains post-identity.
- `flow_identity` does not become pre-auth credential reader.
- No broad credential grants.
- Self/membership-read semantics preserved.
- Real deterministic user IDs used.
- R01 identity transaction behavior preserved.
- No browser-supplied actor accepted.
- No tenant choice inferred from credential alone.
- No branch choice inferred from credential alone.
- Keep R03/R04 boundaries intact.
- Test role/context cleanup remains green.
- No pool role leakage.

# 60. RLS Actorless Contract
- Set Tenant A context.
- Clear actor context.
- Use `flow_runtime`.
- Protected branch visibility must be zero.
- Protected organization visibility must be zero where actor-protected.
- Representative FoodFlow protected row visibility must be zero where applicable.
- No fixture addition may weaken actorless default-deny.
- No permissive test-only RLS policy may persist.
- Temporary test grants must roll back.
- Existing actorless R04 assertion remains green.
- Missing actor is security failure, not anonymous staff access.
- Keep customer public capabilities separate.

# 61. RLS Manager Contract
- Actor = Tenant A manager.
- Tenant = Tenant A.
- Tenant-level organization visibility ALLOW.
- Branch A1 visibility ALLOW.
- Branch A2 visibility ALLOW.
- Tenant B organization DENY.
- Branch B1 DENY.
- Permission mapping still required for privileged actions.
- Tenant-wide membership does not imply cross-tenant access.
- Keep same-tenant breadth intentional.
- Preserve R04 helper semantics.
- Use deterministic IDs in tests.

# 62. RLS Staff A1 Contract
- Actor = Branch A1 staff.
- Tenant = Tenant A.
- Branch = A1.
- Branch A1 visibility ALLOW.
- Branch A2 visibility DENY.
- Tenant-wide organization visibility DENY under accepted R04 semantics.
- Tenant B visibility DENY.
- Assigned permission on A1 ALLOW.
- Same permission on A2 DENY.
- Management permission DENY.
- No context injection widens scope.
- Keep branch exactness explicit.

# 63. RLS Staff A2 Contract
- Actor = Branch A2 staff.
- Tenant = Tenant A.
- Branch = A2.
- Branch A2 visibility ALLOW.
- Branch A1 visibility DENY.
- Tenant-wide organization visibility DENY.
- Tenant B visibility DENY.
- Assigned permission on A2 ALLOW.
- Same permission on A1 DENY.
- Management permission DENY.
- No same-tenant sibling leakage.
- Keep branch exactness explicit.
- Use independent persona from A1.

# 64. RLS Tenant B Contract
- Actor = Tenant B staff.
- Tenant = Tenant B.
- Branch = B1.
- Branch B1 visibility ALLOW.
- Tenant A organization DENY.
- Branch A1 DENY.
- Branch A2 DENY.
- Tenant A roles do not grant access.
- Tenant A permissions do not grant access through wrong membership.
- Tenant A tenant-wide manager cannot see B1.
- Cross-tenant denial tested both directions.
- Use Tenant B local role.
- Keep data isolation independent of display names.

# 65. RLS Inactive-State Contract
- Suspended user protected visibility DENY.
- Invited membership protected visibility DENY.
- Suspended membership protected visibility DENY.
- Revoked membership protected visibility DENY.
- No-membership user protected visibility DENY.
- Keep tenant/branch values otherwise valid.
- Keep roles otherwise valid.
- Keep data rows otherwise present.
- Test denial reason independently.
- Do not collapse all states into one assertion.
- Keep separate diagnostic messages.
- Preserve future revocation fixtures.

# 66. Permission Positive Matrix
- Manager `member.manage` ALLOW when mapped.
- Manager `role.manage` ALLOW when mapped.
- Manager `order.view` ALLOW when mapped.
- Staff A1 `operations.staff.access` ALLOW when mapped.
- Staff A1 `order.view` ALLOW when mapped.
- Kitchen A1 `operations.kitchen.access` ALLOW.
- Kitchen A1 `kitchen.view` ALLOW.
- Kitchen A1 `kitchen.manage` ALLOW when mapped.
- Cashier A2 `operations.cashier.access` ALLOW.
- Cashier A2 `merchant_payment.view` ALLOW.
- Cashier A2 `merchant_payment.collect` ALLOW.
- Tenant B staff expected local permissions ALLOW.

# 67. Permission Negative Matrix
- Staff A1 `role.manage` DENY.
- Staff A1 `member.manage` DENY.
- Staff A1 `management.admin.access` DENY.
- Staff A1 `order.view` at A2 DENY.
- Kitchen A1 `operations.cashier.access` DENY.
- Kitchen A1 `merchant_payment.collect` DENY unless mapped.
- Kitchen A1 `role.manage` DENY.
- Cashier A2 `operations.kitchen.access` DENY.
- Cashier A2 `kitchen.manage` DENY.
- Cashier A2 `role.manage` DENY.
- Tenant B staff requesting Tenant A permission DENY.
- Branch A1 staff requesting Tenant B permission DENY.

# 68. Self-Elevation Regression
- Staff cannot change own role to manager.
- Staff cannot broaden membership from branch to tenant-wide.
- Staff cannot change membership tenant to another tenant.
- Staff cannot change branch to sibling branch for privilege.
- Staff cannot insert privileged role-permission mapping.
- Staff cannot update manager role mapping.
- Filtered mutation must not silently elevate.
- Persisted role ID remains unchanged after attempted escalation.
- Persisted branch scope remains unchanged after attempted broadening.
- Existing R04 self-elevation assertions remain green.
- Do not weaken RLS to make seed convenient.
- No admin bypass introduced for tests.

# 69. Seed Mutation Policy
- Seed defines deterministic reset baseline.
- SQL tests may mutate inside transactions.
- Mutating SQL tests should rollback.
- Integration tests must clean temporary rows.
- Test files must not depend on previous test mutation.
- Do not require test-order cleanup.
- Credential tests should avoid permanently changing hash rows.
- Membership mutation tests must restore state by rollback/reset.
- Role mapping tests must restore state.
- Throttle test subjects must not pollute durable fixture state.
- No test-only persistent bypass grants.
- Reset should restore same logical fixture contract.

# 70. Seed Idempotency and Reproducibility
- `supabase db reset --local` recreates same fixture IDs.
- Same reset recreates same emails.
- Same reset recreates same membership scopes.
- Same reset recreates same role mappings.
- Same reset recreates same credential eligibility.
- Same reset recreates same negative cases.
- No random UUIDs.
- No external APIs.
- No Auth.js server requirement.
- No Vercel environment requirement.
- No production secrets.
- Avoid assertions on volatile timestamps.

# 71. Schema Change Policy
- Default expectation = no R02 schema change.
- R02 is primarily fixture/test work.
- Migration allowed only for a genuine structural blocker.
- Missing invariant may justify forward migration.
- Missing uniqueness may justify forward migration only if R01 did not solve it.
- Cross-tenant constraint defect may justify migration.
- Test convenience alone does not justify schema column.
- Historical P01 migrations must not be rewritten.
- Historical R01 migration must not be rewritten.
- Approved migration must be clean-reset safe.
- Approved migration must have tests.
- PR must explain why schema change was unavoidable.

# 72. Generated Type Policy
- No schema change should mean no generated type change.
- Unexpected generated diff must be investigated.
- Do not manually edit generated types.
- Approved schema change requires regeneration.
- Inspect generated diff.
- Commit only expected changes.
- Run type drift verification.
- Fixture row changes alone do not require type changes.
- Test constants must use generated runtime types only where useful.
- Do not import generated DB types into client components.
- Record generated-type result in PR.
- Keep R01 type baseline intact.

# 73. Test Fixture Helper
- Suggested path: `apps/web/next-flow/tests/fixtures/identity.ts`.
- Export stable actor IDs.
- Export tenant IDs.
- Export branch IDs.
- Export synthetic emails.
- Export test-only passwords when needed.
- Export expected permission codes.
- Keep file under test-only path.
- Do not import React/UI.
- Do not issue sessions.
- Do not query database directly.
- Do not become production identity configuration.

# 74. Credential Vector Helper
- Optional path: `apps/web/next-flow/tests/fixtures/credential-vectors.ts`.
- Create only if it reduces duplication.
- Keep synthetic test vectors only.
- Match exact R01 algorithm.
- Match exact R01 encoding format.
- Include positive vector.
- Include wrong-password expectation.
- Avoid production secret names.
- Avoid runtime production imports.
- Do not replace password-verifier unit tests.
- Document vector purpose.
- Keep deterministic values stable for R03.

# 75. SQL Test File
- Suggested path: `supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql`.
- Use pgTAP conventions already present.
- Use explicit plan count.
- Use precise assertion messages.
- Reference stable IDs/codes.
- Test fixture presence.
- Test credential state.
- Test membership state.
- Test permission mapping.
- Test RLS positive cases.
- Test RLS negative cases.
- Test self-elevation regression.

# 76. SQL Fixture Presence Tests
- Tenant A exists.
- Tenant B exists.
- Branch A1 exists.
- Branch A2 exists.
- Branch B1 exists.
- Owner/manager user exists.
- Staff A1 exists.
- Staff A2 exists.
- Kitchen actor exists when added.
- Cashier actor exists when added.
- Tenant B actor exists.
- Inactive/credential-denial personas exist.

# 77. SQL Credential State Tests
- Positive credential rows exist.
- Algorithm equals supported value.
- Hash non-empty.
- Hash not equal plaintext test password.
- Enabled `disabled_at` null.
- Disabled fixture `disabled_at` non-null.
- No-credential fixture has zero credential rows.
- One credential row per credential-bearing user.
- Primary key uniqueness preserved.
- No production email in credential fixtures.
- No production secret dependency.
- Pre-auth lookup behavior matches expected eligibility.

# 78. SQL Email Tests
- Owner normalized email matches expected.
- Staff A1 normalized email matches expected.
- Staff A2 normalized email matches expected.
- Kitchen normalized email matches expected.
- Cashier normalized email matches expected.
- Tenant B normalized email matches expected.
- Case variation resolves same identity.
- Whitespace variation resolves same identity when contract requires it.
- Unknown email returns no candidate.
- Collision insert fails when uniqueness applies.
- Collision update fails when uniqueness applies.
- No ambiguous durable fixture identities.

# 79. SQL Membership Tests
- Manager membership ACTIVE.
- Manager branch_id NULL.
- Staff A1 membership ACTIVE and branch A1.
- Staff A2 membership ACTIVE and branch A2.
- Kitchen membership ACTIVE and exact branch.
- Cashier membership ACTIVE and exact branch.
- Tenant B membership ACTIVE and branch B1.
- Invited membership = INVITED.
- Suspended membership = SUSPENDED.
- Revoked membership = REVOKED.
- Role tenant equals membership tenant.
- Branch tenant equals membership tenant.

# 80. SQL Role Tests
- Manager role exists under Tenant A.
- Staff role exists under Tenant A.
- Kitchen role exists when introduced.
- Cashier role exists when introduced.
- Tenant B staff role exists under Tenant B.
- Tenant A role ID not reused by Tenant B membership.
- Stable role code recorded.
- Role display name not used as authorization check.
- Expected role-permission rows exist.
- Unexpected privileged mappings absent.
- No duplicate mapping rows.
- Tenant-local ownership preserved.

# 81. SQL Membership Helper Matrix
- Manager + Tenant A + null = true.
- Manager + Tenant A + A1 = true.
- Manager + Tenant A + A2 = true.
- Manager + Tenant B + B1 = false.
- Staff A1 + Tenant A + null = false.
- Staff A1 + Tenant A + A1 = true.
- Staff A1 + Tenant A + A2 = false.
- Staff A1 + Tenant B + B1 = false.
- Staff A2 + A2 = true.
- Staff A2 + A1 = false.
- Tenant B staff + B1 = true.
- Inactive-state actors = false.

# 82. SQL Permission Helper Matrix
- Manager + `member.manage` + Tenant A = true when mapped.
- Manager + `role.manage` + Tenant A = true when mapped.
- Staff A1 + `order.view` + A1 = true when mapped.
- Staff A1 + `role.manage` + A1 = false.
- Staff A1 + `order.view` + A2 = false.
- Kitchen A1 + kitchen permission + A1 = true.
- Kitchen A1 + cashier permission + A1 = false.
- Cashier A2 + collect permission + A2 = true.
- Cashier A2 + kitchen manage + A2 = false.
- Tenant B staff requesting Tenant A permission = false.
- Suspended user permission = false.
- Non-active membership permission = false.

# 83. SQL RLS Positive Tests
- Manager sees Tenant A organization.
- Manager sees Branch A1.
- Manager sees Branch A2.
- Staff A1 sees Branch A1.
- Staff A2 sees Branch A2.
- Kitchen A1 sees only relevant protected branch data when seeded.
- Cashier A2 sees only relevant protected branch data when seeded.
- Tenant B staff sees Branch B1.
- Positive cases remain small.
- No large domain dataset added solely for auth tests.
- Queries use exact IDs.
- Tests execute under constrained role.

# 84. SQL RLS Negative Tests
- Actorless sees no protected branches.
- Staff A1 cannot see A2.
- Staff A2 cannot see A1.
- Tenant A manager cannot see Tenant B.
- Tenant B staff cannot see Tenant A.
- Suspended user cannot see A1.
- Invited membership cannot see A1.
- Suspended membership cannot see A1.
- Revoked membership cannot see A1.
- No-membership user cannot see protected Tenant A rows.
- Wrong tenant context cannot broaden access.
- Wrong branch context cannot broaden access.

# 85. SQL Self-Elevation Tests
- Staff attempts role escalation.
- Role remains unchanged.
- Staff attempts branch broadening.
- Branch remains unchanged.
- Staff attempts tenant reassignment.
- Tenant remains unchanged.
- Staff attempts role-permission insertion.
- Privileged mapping not created.
- Existing R04 assertions remain green.
- No elevated test role used to hide failure.
- No RLS disablement.
- No admin bypass.

# 86. SQL Pre-Auth Least-Privilege Tests
- Direct `app.users` broad select denied.
- Direct `app.memberships` broad select denied.
- Direct `private.user_credentials` select denied.
- Direct `private.login_throttles` select denied.
- Direct `foodflow.orders` select denied.
- Direct `payments.payments` select denied.
- Direct `audit.events` select denied.
- Approved credential lookup function allowed.
- Approved throttle functions remain limited.
- Public execute remains denied where R01 requires.
- `flow_runtime` credential access remains denied.
- `flow_identity` credential access remains denied.

# 87. Node Integration Test File
- Suggested path: `apps/web/next-flow/tests/integration/identity-authorization-contract.test.ts`.
- Consume real DB runtime.
- Consume deterministic fixture constants.
- Consume R01 credential repository.
- Consume R01 verifier.
- Consume actor-aware transaction helpers.
- Do not call live Auth.js provider.
- Do not create live session.
- Do not replace legacy login route.
- Keep database setup explicit.
- Keep cleanup deterministic.
- Keep failure output secret-safe.

# 88. Integration — Positive Credentials
- Lookup owner by synthetic email.
- Candidate non-null.
- Candidate user ID matches fixture.
- Candidate normalized email matches fixture.
- Known owner test password verifies.
- Repeat staff A1 positive lookup.
- Repeat staff A2 positive lookup when credential-bearing.
- Repeat kitchen positive lookup when credential-bearing.
- Repeat cashier positive lookup when credential-bearing.
- Do not assert raw hash in error text.
- Do not create session.
- Do not mutate membership.

# 89. Integration — Credential Denials
- Wrong password fails.
- Disabled credential lookup returns no candidate.
- Suspended user lookup returns no candidate.
- No-credential user lookup returns no candidate.
- Unknown email returns no candidate.
- No hardcoded fallback credential inside repository.
- No distinction leaked to public response because R02 has no live response path.
- Malformed hash behavior remains safe.
- Unsupported algorithm remains safe.
- Test password bounds remain inherited from R01.
- No secret logging.
- No session issuance.

# 90. Integration — Membership
- Manager tenant-wide membership resolves.
- Staff A1 exact membership resolves.
- Staff A2 exact membership resolves.
- Tenant B membership resolves.
- Invited membership does not authorize.
- Suspended membership does not authorize.
- Revoked membership does not authorize.
- No-membership actor does not authorize.
- Tenant A actor cannot resolve Tenant B access.
- Branch A1 actor cannot resolve A2 access.
- Branch A2 actor cannot resolve A1 access.
- No workspace selection productization.

# 91. Integration — Permission
- Manager positive permission resolves.
- Manager negative permission resolves false when intentionally absent.
- Staff positive permission resolves.
- Staff management permission resolves false.
- Kitchen positive permission resolves.
- Kitchen cashier permission resolves false.
- Cashier positive permission resolves.
- Cashier kitchen permission resolves false.
- Cross-tenant permission resolves false.
- Cross-branch permission resolves false.
- Inactive membership permission resolves false.
- Suspended user permission resolves false.

# 92. Transaction Context Regression
- R01 role/context cleanup tests remain green.
- Auth transaction must not leak pre-auth role.
- Identity transaction must not leak actor.
- Tenant transaction must not leak tenant.
- Tenant transaction must not leak branch.
- Subsequent pooled transaction starts clean.
- R02 fixture tests must not set session-level role permanently.
- Use transaction-local settings.
- Cleanup on rollback.
- Cleanup on success.
- Do not leave fixture-specific actor context globally.
- Keep pool reuse safe.

# 93. Fixture Reproducibility Test
- Reset once and record logical fixture expectations.
- Reset again and expect same IDs.
- Expect same normalized emails.
- Expect same credential eligibility.
- Expect same role mappings.
- Expect same membership scopes.
- Expect same negative-state fixtures.
- Ignore volatile timestamp values unless semantically required.
- Do not depend on physical row order.
- Do not depend on generated UUID.
- Do not depend on external service.
- Do not depend on production secret.

# 94. Failure Handling
- Missing fixture fails test loudly.
- Wrong fixture ID fails test loudly.
- Duplicate normalized email fails deterministically.
- Unsupported credential algorithm fails deterministically.
- Malformed hash fails without secret leak.
- Cross-tenant role assignment cannot create authority.
- Wrong branch assignment cannot create authority.
- DB unavailable produces typed server error in integration path.
- Structural fixture errors are not converted into generic PASS.
- RLS failure is diagnosed before broadening grants.
- Seed FK failure is fixed by dependency order, not constraint disablement.
- Permission lookup failure is fixed by canonical code, not arbitrary ID.

# 95. Recovery Strategy
- Seed failure: fix deterministic insert order.
- Collision failure: fix synthetic identity, not uniqueness constraint.
- Hash verification failure: align with R01 encoding contract.
- Permission mapping failure: verify canonical permission code.
- Membership failure: verify tenant/branch/role referential integrity.
- RLS failure: inspect actor/tenant/branch context.
- Pre-auth denial failure: restore least privilege.
- Generated type drift: investigate schema difference.
- Integration state leak: fix transaction-local context.
- Legacy auth regression: restore unchanged runtime behavior.
- Do not use production data for recovery.
- Do not weaken security tests to recover green state.

# 96. Concurrency Considerations
- R02 is not primarily concurrency work.
- Do not seed login-throttle failure state.
- Throttle baseline starts clean after reset.
- Parallel tests use distinct throttle subjects if needed.
- R02 must not invalidate R01 atomic throttle behavior.
- Credential verification should not hold unnecessary DB transaction open.
- Fixture inserts happen through reset, not concurrent runtime setup.
- No shared mutable global test actor context.
- No session-level role mutation.
- No test race on same temporary membership row without isolation.
- Keep deterministic logical state under parallel test execution where supported.
- Report any unavoidable serialization requirement.

# 97. Idempotency Considerations
- Full reset converges on same logical state.
- Seed does not rely on previous seed execution.
- Broad `on conflict do nothing` must not hide duplicate fixture definitions.
- Role-permission seed remains deterministic.
- Membership seed remains deterministic.
- Credential seed remains deterministic.
- Duplicate fixture IDs should be visible during development.
- No silent conflict swallowing unless current seed convention explicitly expects update behavior.
- Tests remain independent of execution order.
- Cleanup remains deterministic.
- No stale throttle state reused.
- No random fixture generation.

# 98. Performance and Resource Safety
- Keep fixture dataset compact.
- Keep normalized email lookup indexed through R01 design.
- Keep membership lookups keyed by stable IDs.
- Keep permission checks inside existing DB helpers where appropriate.
- Avoid N+1 permission queries in integration helper design.
- No credential hash caching.
- No Redis added.
- No external fixture service.
- No huge domain dataset.
- No long DB transaction during password KDF.
- No unbounded test password input.
- No full table scan deliberately introduced.

# 99. Logging and Redaction
- No raw password logs.
- No raw password hash logs.
- No `AUTH_SECRET` logs.
- No `FOODFLOW_SESSION_SECRET` logs.
- No `DATABASE_URL` logs.
- No session token logs.
- No real user email logs.
- Synthetic persona names are acceptable in test diagnostics.
- Permission code is acceptable diagnostic context.
- Tenant/branch synthetic ID is acceptable test diagnostic context.
- Do not log whether a real production email exists.
- Keep fixture diagnostics local/test oriented.

# 100. Observability Boundary
- No production auth telemetry required in R02.
- Descriptive test labels required.
- Test failures identify persona.
- Test failures identify permission code.
- Test failures identify expected scope.
- Test failures identify tenant/branch fixture.
- Secret material remains redacted.
- No new analytics dependency.
- No new tracing backend.
- No new production log schema.
- R03/R04 may add operational auth observability later.
- R02 focuses on deterministic evidence.

# 101. Files to CREATE
- `supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql` likely required.
- `apps/web/next-flow/tests/fixtures/identity.ts` likely useful.
- `apps/web/next-flow/tests/integration/identity-authorization-contract.test.ts` likely required.
- `apps/web/next-flow/tests/fixtures/credential-vectors.ts` optional when useful.
- Create only files supported by actual R01 branch architecture.
- Do not create duplicate identity module.
- Do not create production auth config for fixtures.
- Do not create generic testing framework unnecessarily.
- Keep fixture helper under test path.
- Keep SQL tests under current database test path.
- Keep names focused on R02 responsibility.
- Record actual paths in PR.

# 102. Files to MODIFY
- `supabase/seed.sql` likely primary modification.
- Existing R01 credential integration test may be extended only when appropriate.
- Existing R04 test may update fixture reference only when necessary.
- Do not weaken R04 assertions.
- Do not rewrite R01 test architecture unnecessarily.
- Generated DB type file only if approved schema change occurs.
- CI workflow only if test discovery genuinely requires narrow change.
- Package files should remain unchanged by default.
- Runtime auth route should remain unchanged.
- Proxy should remain unchanged.
- Login UI should remain unchanged.
- Record every modified file and reason in PR.

# 103. Files NOT to Modify by Default
- `apps/web/next-flow/src/app/api/auth/login/route.ts`.
- `apps/web/next-flow/src/app/api/auth/logout/route.ts`.
- `apps/web/next-flow/src/lib/auth/session.ts`.
- `apps/web/next-flow/src/lib/auth/token.ts`.
- `apps/web/next-flow/src/proxy.ts`.
- Login page/form behavior.
- Customer menu UI.
- Customer cart UI.
- Kitchen UI.
- Payment integration.
- Stripe billing integration.
- Voice ordering implementation.
- Unrelated infrastructure.

# 104. Dependency Policy
- Default = no new npm dependency.
- Use existing Vitest.
- Use existing Kysely/pg.
- Use R01 password verifier.
- Use existing Supabase CLI.
- No faker dependency for fixed fixtures.
- No UUID library for fixed constants.
- No new password library if R01 already provides verifier/generator.
- No Auth.js package reinstall.
- No dependency modernization.
- Package lock should remain unchanged unless justified.
- Any dependency change requires explicit PR explanation.

# 105. Migration Policy
- Default = no R02 migration.
- Fixture-only work should not alter schema.
- Structural blocker may justify forward migration.
- Migration must be narrow.
- Migration must be clean-reset safe.
- Migration must have dedicated tests.
- Historical P01 migration must not be rewritten.
- Historical R01 migration must not be rewritten.
- Test convenience alone is insufficient reason.
- No production backfill executed by this round.
- PR must state schema change YES/NO.
- PR must justify any migration.

# 106. Clean Database Reset Contract
- Local Supabase starts successfully.
- All migrations apply.
- Seed executes.
- R02 fixtures exist afterward.
- No manual SQL required.
- No production credentials required.
- No network identity provider required.
- No Auth.js server required.
- Same reset can run repeatedly.
- Synthetic data only.
- No destructive production connection.
- Reset evidence recorded in implementation PR.

# 107. Database Lint Contract
- New SQL remains lint-clean under current rules.
- No unsafe dynamic SQL introduced.
- No broad grants introduced.
- No unsafe SECURITY DEFINER added by default.
- If function added, fixed search path required.
- Schema-sensitive references qualified where appropriate.
- Test-only grants remain transactional when possible.
- No RLS disablement persists.
- No BYPASSRLS added.
- No superuser application role.
- Existing DB lint scope preserved.
- PR records DB lint result.

# 108. Generated Type Contract
- No schema change means no expected generated diff.
- Unexpected generated diff is blocker until explained.
- Approved schema change requires regeneration.
- Run `npm run db:generate` or current equivalent.
- Run `npm run db:verify-types` or current equivalent.
- Never hand-edit generated DB types.
- Fixture additions alone do not alter generated types.
- Runtime repository should compile against existing types.
- Test fixture constants need not mirror all DB types.
- Record generated-type result.
- Keep R01 generated baseline intact.
- Investigate drift before PR readiness.

# 109. Application Quality Contract
- Test helper compiles.
- Integration tests compile.
- Production runtime does not import test fixtures.
- Client components do not import server identity modules.
- Production server code does not import test passwords.
- Lint passes.
- Typecheck passes.
- Tests pass.
- Next build passes.
- Legacy auth tests remain green.
- No runtime behavior changes from fixture additions alone.
- PR records actual results.

# 110. Legacy Auth Regression
- Existing configured temporary credential still logs in until R03.
- Existing custom session still verifies.
- Existing logout still clears legacy session.
- Existing proxy behavior remains unchanged.
- Existing auth-session tests remain green.
- R02 fixture credential must not become live authority.
- No route points to fixture password directly.
- No legacy env removal.
- No session cookie rename.
- No token format change.
- No Auth.js provider activation.
- Keep old and new paths separate until cutover.

# 111. Customer Boundary Regression
- Customer direct entry remains public.
- Customer menu browsing does not require staff credential.
- Customer table-session semantics unchanged.
- Internal fixture credentials never exposed to customer UI.
- Internal role data not added to customer response.
- Internal permission data not added to customer response.
- No customer account table introduced.
- No customer session migration.
- No customer cart persistence change.
- No customer capability redesign.
- Preserve current public/private separation.
- Keep R03 staff auth work independent of customer path.

# 112. Security Validation Priority
- Priority 1: cross-tenant denial.
- Priority 2: cross-branch denial.
- Priority 3: suspended user denial.
- Priority 4: non-active membership denial.
- Priority 5: disabled credential denial.
- Priority 6: no-credential denial.
- Priority 7: self-elevation denial.
- Priority 8: pre-auth direct-table denial.
- Positive tests do not replace negative tests.
- Denial tests should outnumber trivial presence tests where possible.
- Preserve R01/R04 negative regression coverage.
- Do not chase test count for appearance.

# 113. Test Naming Standard
- Include persona in assertion name.
- Include action/permission in assertion name.
- Include target tenant/branch when relevant.
- Include expected allow/deny meaning.
- Example: `staff A1 cannot resolve order.view for Branch A2`.
- Example: `disabled credential is not returned by pre-auth lookup`.
- Example: `revoked membership cannot access Branch A1`.
- Avoid `test1`.
- Avoid `works`.
- Avoid `should fail` without reason.
- Clear names aid regression diagnosis.
- Keep naming consistent across SQL and Node tests.

# 114. Test Isolation
- SQL mutation tests use transaction boundaries.
- SQL mutation tests rollback.
- Node tests clean temporary rows.
- Test files do not depend on previous file order.
- Credential tests do not permanently modify durable hash rows.
- Membership mutation tests restore state.
- Role-permission mutation tests restore state.
- Throttle subjects distinct when used.
- No session-level role leakage.
- No global actor context leakage.
- No global tenant context leakage.
- No global branch context leakage.

# 115. Implementation Sequence
- Fetch current main.
- Read policy and this spec.
- Find latest R01 implementation branch.
- Stop if R01 branch missing.
- Record R01 head SHA.
- Re-audit R01 identity/pre-auth contract.
- Create R02 branch from R01 branch.
- Audit current seed and R04 fixtures.
- Define final R02 persona matrix.
- Add/update deterministic identities and credentials.
- Add/update roles, permissions, memberships.
- Add SQL and integration tests.

# 116. Implementation Sequence — Validation
- Run clean Supabase start/reset.
- Run SQL tests.
- Run R01 regression tests.
- Run R04 regression tests.
- Run DB lint.
- Run generated type checks.
- Run application lint.
- Run typecheck.
- Run unit/integration tests.
- Run DB runtime tests.
- Run Next build.
- Inspect final diff for scope discipline.

# 117. Validation Commands — Application
```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm run test
npm run build:next
```
- Use actual current scripts if names differ on R01 branch.
- Record actual execution result.
- Do not fabricate PASS.
- Distinguish local evidence from hosted evidence.
- Package install should be deterministic.
- No dependency change expected by default.

# 118. Validation Commands — Database
```bash
./apps/web/next-flow/node_modules/.bin/supabase start
./apps/web/next-flow/node_modules/.bin/supabase db reset --local
./apps/web/next-flow/node_modules/.bin/supabase test db --local
./apps/web/next-flow/node_modules/.bin/supabase db lint --local --schema app,foodflow,payments,audit,private --level warning --fail-on error
```
- Use actual current command forms at execution time.
- Local/test database only.
- Never run destructive production reset.
- Record actual outcome.

# 119. Validation Commands — DB Types/Runtime
```bash
cd apps/web/next-flow
npm run db:generate
npm run db:verify-types
npm run test:db-runtime
```
- Use current equivalent scripts when changed.
- Unexpected generated diff without schema change is blocker.
- Runtime tests must use deterministic fixtures.
- Record actual results.
- No manual generated-file edits.
- No fake result reporting.

# 120. Document Validation vs GitHub Actions
- This document is validated by content.
- GitHub Actions are not document-validation authority.
- Failed Action does not automatically invalidate the spec.
- Missing Action does not automatically invalidate the spec.
- Queued Action does not automatically invalidate the spec.
- Skipped Action does not automatically invalidate the spec.
- Hosted rules may still technically prevent merge.
- Hosted merge restriction must be reported separately.
- Do not edit CI to make documentation appear valid.
- Implementation PR CI remains implementation evidence.
- Document content must specify correct validation plan.
- This amendment changes spec content only.

# 121. Definition of Done — Lineage
- [ ] R02 spec exists on main.
- [ ] R02 spec READY.
- [ ] R01 implementation branch exists before R02 starts.
- [ ] R01 code handoff consumed.
- [ ] R02 branch descends from R01 branch.
- [ ] Parent branch recorded.
- [ ] Parent SHA recorded.
- [ ] R02 head SHA recorded.
- [ ] No duplicate R02 branch.
- [ ] No direct-main implementation.
- [ ] Branch-chain policy preserved.
- [ ] Current implementation round not skipped.

# 122. Definition of Done — Fixtures
- [ ] Stable owner fixture.
- [ ] Stable staff A1 fixture.
- [ ] Stable staff A2 fixture.
- [ ] Stable kitchen fixture when required.
- [ ] Stable cashier fixture when required.
- [ ] Stable Tenant B fixture.
- [ ] Stable suspended user.
- [ ] Stable invited membership.
- [ ] Stable suspended membership.
- [ ] Stable revoked membership.
- [ ] Stable disabled credential.
- [ ] Stable no-credential/no-membership cases as selected.

# 123. Definition of Done — Credentials
- [ ] Stable synthetic emails.
- [ ] Normalized emails unique.
- [ ] Supported algorithm used.
- [ ] Positive credential vectors valid.
- [ ] Test passwords centralized.
- [ ] Disabled credential marked disabled.
- [ ] No-credential fixture truly has no row.
- [ ] No plaintext DB password field.
- [ ] No production credential.
- [ ] Positive lookup passes.
- [ ] Negative lookup cases pass.
- [ ] No secret leakage.

# 124. Definition of Done — Membership
- [ ] Manager tenant-wide membership.
- [ ] Staff A1 exact membership.
- [ ] Staff A2 exact membership.
- [ ] Kitchen exact membership.
- [ ] Cashier exact membership.
- [ ] Tenant B isolated membership.
- [ ] Invited denial.
- [ ] Suspended denial.
- [ ] Revoked denial.
- [ ] No-membership denial.
- [ ] Role tenant consistency.
- [ ] Branch tenant consistency.

# 125. Definition of Done — Permission
- [ ] Manager positive permissions proven.
- [ ] Staff positive permission proven.
- [ ] Staff privileged negatives proven.
- [ ] Kitchen positive permissions proven.
- [ ] Kitchen cashier/admin negatives proven.
- [ ] Cashier positive permissions proven.
- [ ] Cashier kitchen/admin negatives proven.
- [ ] Cross-tenant permission denied.
- [ ] Cross-branch permission denied.
- [ ] Canonical permission codes used.
- [ ] No role-name-only authority.
- [ ] No broad all-permission shortcut.

# 126. Definition of Done — RLS
- [ ] Actorless deny.
- [ ] Tenant A manager allow.
- [ ] Tenant A manager Tenant B deny.
- [ ] Staff A1 allow.
- [ ] Staff A1 A2 deny.
- [ ] Staff A2 allow.
- [ ] Staff A2 A1 deny.
- [ ] Tenant B allow.
- [ ] Tenant B to Tenant A deny.
- [ ] Suspended user deny.
- [ ] Invited/suspended/revoked membership deny.
- [ ] No-membership deny.

# 127. Definition of Done — Security
- [ ] Self-role escalation blocked.
- [ ] Membership branch broadening blocked.
- [ ] Membership tenant reassignment blocked.
- [ ] Unauthorized role-permission mutation blocked.
- [ ] Pre-auth direct credential read denied.
- [ ] Pre-auth domain read denied.
- [ ] flow_runtime credential read denied.
- [ ] flow_identity credential read denied.
- [ ] R01 least-privilege tests green.
- [ ] R04 self-elevation tests green.
- [ ] No RLS bypass.
- [ ] No production secret.

# 128. Definition of Done — Quality
- [ ] Clean DB reset PASS.
- [ ] Seed PASS.
- [ ] New SQL tests PASS.
- [ ] R01 SQL/security regression PASS.
- [ ] R04 RLS regression PASS.
- [ ] DB lint PASS.
- [ ] Generated type verification PASS.
- [ ] Lint PASS.
- [ ] Typecheck PASS.
- [ ] Unit/integration PASS.
- [ ] DB runtime PASS.
- [ ] Next build PASS.

# 129. Definition of Done — Scope Discipline
- [ ] No Auth.js live cutover.
- [ ] No legacy session removal.
- [ ] No legacy login route replacement.
- [ ] No workspace selector.
- [ ] No AccessContext productization.
- [ ] No route permission cutover.
- [ ] No command permission cutover.
- [ ] No customer auth.
- [ ] No payments feature work.
- [ ] No realtime feature work.
- [ ] No voice work.
- [ ] No production DB mutation.

# 130. PR Requirements
- One implementation PR for R02.
- Include `Specification: FLOW_P02_R02_IMPLEMENTATION_SPEC.md`.
- Include `Phase: 02`.
- Include `Round: 02`.
- Include `Previous: FLOW_P02_R01_IMPLEMENTATION_SPEC.md`.
- Record R01 parent branch.
- Record R01 parent SHA.
- Record R02 head SHA.
- List fixture IDs added/reused.
- List test emails.
- Describe test password/hash strategy.
- List roles/permissions/memberships changed.

# 131. PR Evidence
- State schema changed YES/NO.
- State package changed YES/NO.
- State production DB modified NO.
- State Auth.js live cutover NO.
- State legacy auth removed NO.
- Record application lint.
- Record typecheck.
- Record test suite.
- Record Next build.
- Record clean DB reset.
- Record SQL tests.
- Record R01/R04 regression.
- Record DB runtime/type checks.

# 132. Implementation Merge Boundary
- Development agent does not merge R02 PR.
- Development agent does not enable auto-merge.
- Development agent does not push implementation to main.
- Owner controls implementation integration.
- R03 may later branch from R02 lineage when R03 spec is READY.
- R02 implementation PR remains reviewable independently.
- Do not merge merely because scheduled time arrived.
- Do not skip owner control.
- Documentation automation may merge specs, not implementation.
- Record current branch lineage truthfully.
- Stop after implementation PR update.
- No hidden direct-main commit.

# 133. R03 Handoff Package
- Known-valid owner credential fixture.
- Known-valid staff credential fixture.
- Kitchen/cashier credentials when useful.
- Disabled credential fixture.
- Suspended user fixture.
- No-credential fixture.
- No-membership fixture when selected.
- Exact normalized emails.
- Exact test passwords.
- Exact user IDs.
- Exact tenant/branch expectations.
- Exact permission expectations.

# 134. R03 Handoff Assumptions
- Fixture identities are stable.
- Credential vectors are stable.
- Pre-auth lookup is proven.
- Password verifier is proven by R01/R02 vectors.
- Tenant/branch authorization matrix is proven.
- Permission matrix is proven.
- Workspace selection is NOT implemented.
- Route permission enforcement is NOT implemented.
- Legacy session is still live.
- Auth.js session authority is NOT live yet.
- R03 should not invent replacement fixture semantics.
- R03 should consume this deterministic baseline.

# 135. Final R02 Readiness Questions
- Known active credential resolvable? YES after R02 implementation.
- Known test password verifiable? YES after R02 implementation.
- Disabled credential resolvable? NO.
- Suspended user resolvable? NO.
- No-credential user resolvable? NO.
- Tenant-wide membership deterministic? YES.
- Exact-branch membership deterministic? YES.
- Cross-tenant denial deterministic? YES.
- Cross-branch denial deterministic? YES.
- Permission expectations deterministic? YES.
- RLS denial deterministic? YES.
- Auth.js live cutover performed? NO.

# 136. Final Document Validation Checklist
- [ ] Phase metadata correct.
- [ ] Round metadata correct.
- [ ] Previous correct.
- [ ] Next correct.
- [ ] R01 dependency explicit.
- [ ] Branch lineage explicit.
- [ ] Current implementation-state caveat explicit.
- [ ] Fixture objectives explicit.
- [ ] Persona contracts explicit.
- [ ] Credential strategy explicit.
- [ ] Role/permission/membership strategy explicit.
- [ ] RLS/negative validation explicit.

# 137. Final Document Validation Checklist — Architecture
- [ ] Existing database baseline referenced.
- [ ] Existing seed baseline referenced.
- [ ] Existing R04 actor IDs referenced.
- [ ] Existing tenant/branch IDs referenced.
- [ ] Canonical permission codes referenced.
- [ ] Pre-auth role regression included.
- [ ] Runtime role regression included.
- [ ] Identity role regression included.
- [ ] No duplicate identity model proposed.
- [ ] No duplicate permission model proposed.
- [ ] No future-round cutover proposed.
- [ ] File impact bounded.

# 138. Final Document Validation Checklist — Testing
- [ ] SQL fixture tests defined.
- [ ] Credential state tests defined.
- [ ] Email normalization tests defined.
- [ ] Membership tests defined.
- [ ] Permission tests defined.
- [ ] RLS positive tests defined.
- [ ] RLS negative tests defined.
- [ ] Self-elevation tests defined.
- [ ] Integration tests defined.
- [ ] Reset reproducibility defined.
- [ ] Failure handling defined.
- [ ] Validation commands defined.

# 139. Explicit Prohibitions — Identity
- NO second users table.
- NO second memberships table.
- NO second permission catalog.
- NO role-name-only authorization.
- NO browser-provided tenant authority.
- NO browser-provided branch authority.
- NO fake actor IDs.
- NO production email fixtures.
- NO real customer data.
- NO production credentials.
- NO undocumented fixture randomness.
- NO test-order authority.

# 140. Explicit Prohibitions — Credentials
- NO plaintext production password.
- NO plaintext DB password storage.
- NO reversible password encryption.
- NO fast digest password substitute.
- NO unsupported algorithm downgrade.
- NO production secret in seed.
- NO credential hash logging.
- NO session token logging.
- NO default password marketed as production-safe.
- NO live login cutover.
- NO fixture password imported by production runtime.
- NO production credential migration.

# 141. Explicit Prohibitions — Authorization
- NO cross-tenant role reuse.
- NO branch-scope widening for convenience.
- NO broad pre-auth table grants.
- NO flow_runtime credential grants.
- NO flow_identity credential grants.
- NO self-elevation test weakening.
- NO RLS disablement for durable fixture setup.
- NO BYPASSRLS application role.
- NO superuser application path.
- NO permission aliases for convenience.
- NO tenant isolation bypass.
- NO branch isolation bypass.

# 142. Explicit Prohibitions — Delivery
- NO direct implementation push to main.
- NO implementation merge by agent.
- NO implementation auto-merge.
- NO R03 implementation inside R02.
- NO historical migration rewrite.
- NO production DB reset.
- NO production credential insert.
- NO unrelated dependency update.
- NO unrelated UI redesign.
- NO unrelated CI redesign.
- NO fake validation claims.
- NO skipped current implementation round.

# 143. Final Development Gate
```text
READ CURRENT MAIN
→ VERIFY R02 SPEC READY
→ FIND LATEST R01 IMPLEMENTATION BRANCH
→ IF NO R01 BRANCH: STOP
→ RE-AUDIT R01 IDENTITY/PRE-AUTH CONTRACT
→ CREATE R02 FROM R01 LINEAGE
→ EXTEND DETERMINISTIC SEED IDENTITIES
→ ADD TEST-ONLY CREDENTIAL VECTORS
→ ADD/REUSE ROLE + PERMISSION FIXTURES
→ ADD/REUSE MEMBERSHIP FIXTURES
→ ADD KITCHEN/CASHIER/NEGATIVE PERSONAS AS NEEDED
→ WRITE SQL FIXTURE + AUTHORIZATION TESTS
→ WRITE SERVER INTEGRATION TESTS
→ PRESERVE R01 SECURITY TESTS
→ PRESERVE R04 RLS/SELF-ELEVATION TESTS
→ CLEAN RESET
→ RUN DATABASE QUALITY
→ RUN APPLICATION QUALITY
→ OPEN ONE R02 IMPLEMENTATION PR
→ STOP
→ OWNER CONTROLS MERGE
```

# 144. Final Implementation Agent Checklist — Authority
- [ ] Current main fetched.
- [ ] Current policy read.
- [ ] Exact R02 spec read.
- [ ] R01 branch found.
- [ ] R01 head SHA recorded.
- [ ] R02 parent correct.
- [ ] No duplicate R02 branch.
- [ ] R01 code re-audited.
- [ ] R01 credential contract re-audited.
- [ ] R01 pre-auth role re-audited.
- [ ] R01 tests re-audited.
- [ ] No superseding spec exists.

# 145. Final Implementation Agent Checklist — Fixtures
- [ ] Existing R04 IDs reused where useful.
- [ ] New actors minimal.
- [ ] Stable emails defined.
- [ ] Test passwords centralized.
- [ ] Credential rows deterministic.
- [ ] Disabled credential defined.
- [ ] No-credential actor defined.
- [ ] No-membership actor defined when selected.
- [ ] Kitchen persona defined.
- [ ] Cashier persona defined.
- [ ] Tenant B isolation persona preserved.
- [ ] Synthetic-data warnings present.

# 146. Final Implementation Agent Checklist — Authorization
- [ ] Tenant-wide manager covered.
- [ ] Branch A1 staff covered.
- [ ] Branch A2 staff covered.
- [ ] Kitchen covered.
- [ ] Cashier covered.
- [ ] Tenant B covered.
- [ ] Cross-tenant denial covered.
- [ ] Cross-branch denial covered.
- [ ] Suspended user covered.
- [ ] Invited/suspended/revoked membership covered.
- [ ] Self-elevation covered.
- [ ] Pre-auth least privilege covered.

# 147. Final Implementation Agent Checklist — Quality
- [ ] Clean reset executed.
- [ ] SQL tests executed.
- [ ] R01 regression executed.
- [ ] R04 regression executed.
- [ ] DB lint executed.
- [ ] Generated type verification executed.
- [ ] Lint executed.
- [ ] Typecheck executed.
- [ ] Test suite executed.
- [ ] DB runtime executed.
- [ ] Build executed.
- [ ] Actual results recorded.

# 148. Final Implementation Agent Checklist — Delivery
- [ ] One R02 implementation PR.
- [ ] Parent branch recorded.
- [ ] Parent SHA recorded.
- [ ] Head SHA recorded.
- [ ] Fixture matrix summarized.
- [ ] Credential strategy summarized.
- [ ] Permission matrix summarized.
- [ ] Membership matrix summarized.
- [ ] Production DB modified = NO.
- [ ] Auth.js live cutover = NO.
- [ ] Implementation merge by agent = NO.
- [ ] R03 handoff stated.

# 149. Final End State
- This document may be READY before R02 becomes the current implementation round.
- R02 implementation remains blocked while R01 implementation branch is absent.
- Current implementation state at amendment authoring time remains P02/R01 NOT STARTED.
- When R01 implementation exists, R02 must branch from it.
- When R02 implementation satisfies this spec, state becomes `P02/R02 = IMPLEMENTED ON ROUND BRANCH`.
- R03 then consumes deterministic R02 fixtures under its own READY specification.
- R02 does not authorize R03 automatically.
- R02 does not authorize live session cutover.
- R02 does not authorize implementation merge by agent.
- R02 preserves owner merge control.
- R02 preserves branch-chain lineage.
- R02 preserves security boundaries from R01 and R04.
