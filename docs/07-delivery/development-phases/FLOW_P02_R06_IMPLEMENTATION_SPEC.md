# FLOW P02 R06 — Implementation Specification
> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization
> Round 06 — Atomic Legacy Auth Removal + Phase 02 Security Acceptance
> Revision — Physical cleanup of obsolete internal auth authority, dependency/env cleanup, final authorization acceptance, and P03 handoff

## Metadata
- Phase: `02`
- Round: `06`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P02_R05_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P03_R01_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible slot after this spec is on main`
- Current planning scope: `PHASE 02 / ROUND 06 ONLY`
- Implementation parent: `latest P02/R05 implementation lineage tip`
- Expected implementation parent branch: `p02-r05-permission-enforcement`
- Observed R05 branch head at authoring: `613c9508ff4dd34da23b246565f5f98183f12eb3`
- Observed R05 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Observed R05 implementation PR at authoring: `NONE FOUND`
- Recommended implementation branch: `p02-r06-legacy-auth-removal`
- Recommended implementation PR title: `refactor(auth): remove legacy internal auth and complete P02 security acceptance`
- Owner merge control for implementation: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Physical legacy auth removal in this round: `YES`
- Legacy shared credential env removal in this round: `YES`
- Legacy JOSE session removal in this round: `YES if no remaining legitimate consumer exists`
- Auth.js session authority replacement in this round: `NO — already owned by R03`
- Workspace / AccessContext redesign in this round: `NO — owned by R04`
- Permission route/command redesign in this round: `NO — owned by R05`
- Final Phase 02 security acceptance in this round: `YES`
- Production database destructive mutation: `NO`

# 1. Authoring State
- Current `main` remains the only policy/specification authority.
- Latest observed `main` before this document branch was created is `d976aab4acd03ca836ebe3cc9e2c321c1bc2c1aa`.
- `FLOW_P02_R05_IMPLEMENTATION_SPEC.md` exists on `main` and is READY.
- R05 points `Next` to this exact canonical R06 filename.
- `FLOW_P02_R06_IMPLEMENTATION_SPEC.md` did not exist on `main` before this document was authored.
- No active docs branch for this R06 filename was observed before authoring.
- R05 implementation branch exists as `p02-r05-permission-enforcement`.
- R05 branch head observed is `613c9508ff4dd34da23b246565f5f98183f12eb3`.
- R05 is 31 commits ahead of `p02-r04-access-context`.
- R05 contains meaningful authorization implementation code.
- R05 adds canonical permission identifiers and permission evaluation.
- R05 adds authorized transaction support.
- R05 adds command-permission mapping.
- R05 adds route-permission mapping.
- R05 adds staff/kitchen/cashier/admin layout enforcement.
- R05 adds a dedicated forbidden route/page.
- R05 adds unit, integration, E2E, freshness, and database authorization tests.
- R05 therefore provides sufficient implementation handoff evidence for R06 authoring.
- This task remains documentation/specification only.
- This task does not create R06 implementation code.
- This task does not create the R06 implementation branch.
- This task does not merge any implementation PR.

# 2. Phase 02 Objective
- Phase 02 establishes one coherent internal human identity path.
- Database-backed credentials identify the actor.
- Auth.js is the live internal session authority.
- The authenticated subject is a real `app.users.id` UUID.
- Workspace access is derived from current active memberships.
- Tenant selection is server-authorized.
- Branch selection is server-authorized.
- AccessContext is resolved from current database state.
- Permission checks are server-side.
- Route authorization is permission-specific.
- Command authorization is permission-specific.
- RLS remains a defense-in-depth boundary.
- Revocation fails closed.
- Suspended/inactive actors fail closed.
- Cross-tenant access fails closed.
- Wrong-branch access fails closed.
- Mutable authorization is not trusted from the client.
- Mutable authorization is not frozen into the Auth.js session as permanent authority.
- Legacy internal shared credentials are not live authority.
- Legacy custom session tokens are not live authority.
- Phase 02 must end with obsolete authority physically removed so there is one supported internal auth path.

# 3. Six-Round Completion Map
- R01 established canonical login identity and pre-auth least privilege.
- R02 established deterministic identity, credential, membership, and permission fixtures.
- R03 cut live authentication to database credentials and Auth.js sessions.
- R04 established workspace discovery, AccessContext, and revocation-aware membership resolution.
- R05 established route and command permission enforcement.
- R06 removes obsolete authority and proves Phase 02 acceptance.
- R06 is the closing round of Phase 02.
- R06 must not invent new Phase 03 product behavior.

# 4. R06 High-Impact Objective
- Remove all obsolete legacy internal auth authority that R03 intentionally kept for rollback.
- Remove shared environment credential authority.
- Remove the custom `foodflow_session` authority.
- Remove legacy JOSE token creation and verification when no legitimate consumer remains.
- Remove fallback development shared credentials.
- Remove dead compatibility helpers that can recreate the legacy path.
- Remove obsolete env examples and documentation for the legacy authority.
- Remove obsolete package dependency use if `jose` becomes unused after cleanup.
- Preserve Auth.js as the only live internal session authority.
- Preserve real actor UUID identity.
- Preserve R04 workspace/access-context authority.
- Preserve R05 permission enforcement.
- Prove denied legacy-cookie/shared-credential bypass paths.
- Prove logout/session behavior after cleanup.
- Prove stale legacy cookies cannot authenticate.
- Prove legacy env variables cannot reactivate old auth behavior.
- Prove customer/public entry behavior is unchanged.
- Prove all protected internal route families still require valid current authority.
- Prove high-risk commands remain permission protected.
- Produce final Phase 02 acceptance evidence.
- Hand Phase 03 a single clean auth/authz foundation.

# 5. Why R06 Exists Now
- R03 intentionally retained legacy source as a rollback surface.
- R04 and R05 depend only on Auth.js actor identity plus database-derived authorization.
- R05 now provides route and command permission enforcement.
- Keeping legacy source after replacement is proven creates duplicate authority risk.
- Duplicate authority increases maintenance and security ambiguity.
- Shared fallback credentials are especially dangerous once real credential auth exists.
- A dead custom cookie validator can become an accidental bypass in later refactors.
- A dead JOSE issuer can become an accidental second session authority.
- Obsolete environment variables create deployment ambiguity.
- Obsolete dependency/code paths create regression risk.
- R06 removes those risks only after the replacement stack exists.
- This sequencing makes cleanup safe rather than premature.

# 6. Current R05 Security Handoff
- Auth.js session identity is already established by R03 lineage.
- Workspace selection and AccessContext are established by R04 lineage.
- Current-access helper resolves actor, tenant, branch, membership, and role authority.
- Permission enforcement is established by R05 lineage.
- Route families now have permission-specific enforcement surfaces.
- Command permission mapping exists.
- Authorized transaction helper exists.
- Forbidden behavior exists.
- Permission freshness tests exist.
- R06 must preserve these as acceptance baselines.

# 7. Observed Legacy Config Still Present
- `src/lib/auth/config.ts` still exists on the R05 branch.
- `SESSION_COOKIE_NAME` is still `foodflow_session`.
- `INTERNAL_USER_ID` is still `foodflow-internal`.
- `INTERNAL_SESSION_TYPE` is still `INTERNAL`.
- Development fallback email is still `admin@foodflow.local`.
- Development fallback password is still `foodflow-demo`.
- Development fallback signing secret is still present in source.
- `FOODFLOW_INTERNAL_EMAIL` is still referenced by legacy config.
- `FOODFLOW_INTERNAL_PASSWORD` is still referenced by legacy config.
- `FOODFLOW_SESSION_SECRET` is still referenced by legacy config.
- `credentialsMatch()` still implements shared credential matching.
- This file is legacy authority and should be removed if no non-legacy constant remains needed.

# 8. Observed Legacy Token Code Still Present
- `src/lib/auth/token.ts` still exists on the R05 branch.
- It imports `SignJWT` and `jwtVerify` from `jose`.
- It defines custom issuer `foodflow`.
- It defines custom audience `foodflow-internal`.
- It defines legacy `InternalSession`.
- It creates custom HS256 tokens.
- It verifies custom HS256 tokens.
- It depends on legacy config/shared secret.
- It can recreate `foodflow_session` authority if called.
- R06 must remove this path when there are no legitimate remaining consumers.

# 9. Legacy Session Compatibility Surface
- `src/lib/auth/session.ts` must be re-read on the latest R05 parent.
- R03 previously retained a deprecated `createSession()` rollback helper.
- `getInternalSession()` was cut to Auth.js.
- `deleteSession()` was cut to Auth.js sign-out and legacy-cookie cleanup.
- `requireInternalSession()` was cut to Auth.js actor session.
- R06 should remove deprecated legacy issuer code from this module.
- R06 may preserve generic session helper names if they remain the canonical Auth.js adapter.
- R06 should remove imports of legacy config/token modules.
- R06 should keep legacy cookie deletion only if useful as one-way cleanup hygiene.
- A deletion-only constant should not justify retaining the whole legacy authority module.

# 10. Legacy Cookie Cleanup Strategy
- Old browser clients may still carry `foodflow_session` after R06 deployment.
- R06 must not treat that cookie as authentication.
- R06 may proactively delete the old cookie on login/logout/protected-entry transitions.
- Deletion is cleanup, not authority.
- If no explicit cleanup path remains necessary, stale cookie may simply be ignored.
- Security requirement is that stale cookie cannot authenticate.
- Tests must prove stale legacy cookie alone cannot reach protected internal routes.
- Tests must prove stale legacy cookie cannot construct AccessContext.
- Tests must prove stale legacy cookie cannot satisfy permission checks.

# 11. Shared Credential Removal Strategy
- Remove use of `FOODFLOW_INTERNAL_EMAIL`.
- Remove use of `FOODFLOW_INTERNAL_PASSWORD`.
- Remove use of `FOODFLOW_SESSION_SECRET` when only legacy custom token used it.
- Remove development hard-coded shared credentials.
- Remove `credentialsMatch()`.
- Remove any UI prefill/demo text tied to those shared credentials.
- Remove tests that validate the legacy shared-credential path as supported behavior.
- Replace those tests with explicit regression assertions that the path no longer exists or is ignored.
- Do not remove current Auth.js secrets such as `AUTH_SECRET` if still required.

# 12. Auth.js Authority Preservation
- R06 must not redesign Auth.js provider behavior.
- R06 must not change credential algorithm merely because legacy code is being deleted.
- R06 must not move credential verification to the client.
- R06 must not change the real actor UUID contract.
- R06 must not add roles or permissions into session authority.
- R06 must not replace Auth.js session with another custom token.
- R06 should make the current supported Auth.js path more obvious by deleting competitors.

# 13. R04 AccessContext Preservation
- R06 must preserve `AccessContext` shape unless cleanup proves a field is truly obsolete.
- R06 must preserve actor ID.
- R06 must preserve tenant ID.
- R06 must preserve branch scope semantics.
- R06 must preserve membership/role server-derived metadata used by R05.
- R06 must preserve workspace selection revalidation.
- R06 must preserve stale selection failure behavior.
- R06 must preserve membership revocation freshness.
- R06 must not reintroduce authorization snapshots into cookies/session.

# 14. R05 Permission Enforcement Preservation
- R06 must preserve canonical permission identifiers.
- R06 must preserve route-family permission enforcement.
- R06 must preserve command permission mapping.
- R06 must preserve authorized transaction checks.
- R06 must preserve forbidden semantics.
- R06 must preserve role/permission freshness.
- R06 must preserve negative cross-tenant and branch tests.
- Cleanup must not weaken enforcement while removing compatibility code.

# 15. Scope — In
- physical deletion of obsolete legacy auth modules;
- physical deletion of legacy custom token issuer/verifier;
- physical deletion of shared credential matching;
- deletion of hard-coded development shared auth fallback;
- cleanup of legacy session compatibility functions;
- cleanup of legacy environment examples;
- cleanup of legacy auth documentation where present;
- dependency cleanup if `jose` becomes unused;
- test cleanup for removed supported legacy behavior;
- new regression tests proving legacy authority cannot return;
- final security acceptance across authentication, workspace, authorization, RLS, and revocation;
- final Phase 02 acceptance record;
- exact P03/R01 handoff documentation.

# 16. Scope — Out
- new customer account model;
- new cart/order persistence;
- customer capability/session redesign;
- kitchen persistence expansion;
- realtime architecture expansion;
- payment provider implementation;
- voice ordering implementation;
- product feature expansion;
- unrelated UI redesign;
- new identity provider unless separately specified;
- OAuth provider addition merely for completeness;
- password reset product flow unless already required by current Phase 02 scope;
- production destructive DB operations.

# 17. Expected Files to REMOVE
- `apps/web/next-flow/src/lib/auth/token.ts` when no legitimate consumer remains.
- `apps/web/next-flow/src/lib/auth/config.ts` if it contains only legacy shared auth authority.
- any legacy auth test helper that only issues custom `foodflow_session` tokens.
- any obsolete test file dedicated only to legacy shared credential success.
- any dead rollback-only module created solely to preserve pre-R03 authority.
- exact final removals must be based on the latest R05 branch audit.

# 18. Expected Files to MODIFY
- `apps/web/next-flow/src/lib/auth/session.ts` to remove deprecated legacy token issuer/legacy imports while preserving Auth.js helpers.
- `apps/web/next-flow/.env.example` to remove legacy shared auth envs and preserve Auth.js/database envs.
- `apps/web/next-flow/package.json` if `jose` becomes unused.
- `apps/web/next-flow/package-lock.json` if dependency cleanup changes manifest.
- logout/login/proxy-related tests to prove no legacy fallback.
- authentication authority cutover tests to become physical-removal assertions.
- Phase 02 acceptance documentation.

# 19. Files Explicitly NOT to Rewrite by Default
- historical database migrations from R01–R04.
- deterministic credential fixture migrations/data solely for cleanup aesthetics.
- `src/auth.ts` except minimal import cleanup if required.
- `src/auth.config.ts` except minimal cleanup if obsolete compatibility hooks remain.
- AccessContext resolver unless a legacy reference is discovered.
- permission catalog/mappings unless a legacy reference is discovered.
- product routes unrelated to auth cleanup.
- RLS policies unless acceptance finds a real security defect.

# 20. No Historical Migration Rewrite Rule
- Historical migrations are evidence and bootstrap history.
- Do not rewrite old migrations merely to erase mentions of legacy concepts.
- Use forward-only migration only if a database object introduced by legacy auth genuinely must be removed or changed.
- R06 should default to no database migration unless current DB contains obsolete authority objects that create real risk.
- Private credential/throttle tables from R01 are not legacy; they support current auth.
- `flow_authenticator` is not legacy; it supports current pre-auth least privilege.
- `flow_identity` is not legacy; it supports actor-bound discovery.
- `flow_runtime` is not legacy; it supports tenant/branch runtime isolation.

# 21. Legacy Database Object Audit
- Re-audit whether any database functions/tables exist solely for pre-R03 shared environment auth.
- Do not confuse current password credential storage with legacy shared env credentials.
- Do not delete `private.user_credentials`.
- Do not delete `private.login_throttles`.
- Do not delete normalized email identity constraints.
- Do not delete current Auth.js-facing credential lookup functions.
- Remove only DB artifacts proven obsolete and security-redundant.

# 22. Dependency Cleanup Contract
- Search full package source and tests for `jose` imports.
- If only deleted legacy token module uses `jose`, remove direct dependency.
- If Auth.js or another direct project module legitimately imports `jose`, retain it.
- Do not remove transitive packages manually from lockfile.
- Regenerate lockfile through normal package manager behavior during implementation.
- Do not upgrade unrelated packages as part of dependency cleanup.

# 23. Environment Cleanup Contract
- Remove obsolete legacy auth variables from `.env.example`.
- Remove obsolete docs references.
- Do not expose real secrets.
- Keep `AUTH_SECRET` or equivalent current Auth.js secret.
- Keep `AUTH_TRUST_HOST` when current deployment needs it.
- Keep database connection variables.
- Keep R01 authentication database role requirements.
- Document any deployment operator action needed to remove obsolete hosted secrets separately.
- Repository code cannot prove deletion of hosted secrets; do not fabricate it.

# 24. Hosted Secret Handling
- R06 implementation may document obsolete hosted secret names.
- It must not print secret values.
- It must not move secret values into PR text.
- It must not claim hosted secret deletion unless actual platform state is observed and changed by an authorized tool.
- Application correctness must not depend on obsolete secret values after code cleanup.
- A stale hosted legacy secret must become inert.

# 25. Login Acceptance
- valid active user with enabled credential authenticates through Auth.js.
- unknown email fails generically.
- wrong password fails generically.
- disabled credential fails.
- suspended user fails.
- throttle behavior remains active.
- no shared env credential path can log in.
- hard-coded old demo credential cannot log in unless it is also a real DB fixture by explicit test setup.
- login does not issue `foodflow_session`.

# 26. Session Acceptance
- Auth.js session is the only supported internal session authority.
- `session.user.id` is a real UUID.
- roles are not authoritative session claims.
- permissions are not authoritative session claims.
- tenant/branch are not permanent authorization snapshots in session.
- stale legacy token is ignored.
- malformed legacy token is ignored.
- valid historically signed legacy token is ignored after removal.

# 27. Logout Acceptance
- Auth.js sign-out invalidates current session.
- workspace selection hint is cleared when current implementation expects it.
- legacy cookie may be cleared as hygiene.
- logout must not require legacy signing secret.
- logout must remain available from forbidden/no-access states.

# 28. Proxy / Entry Acceptance
- protected internal routes still require Auth.js authentication.
- proxy does not import legacy token verifier.
- proxy does not inspect `foodflow_session` as authority.
- public customer routes remain unaffected.
- login route remains reachable when unauthenticated.
- workspace route remains reachable when authenticated.
- forbidden route remains reachable through intended denial flow.

# 29. Workspace Acceptance
- active single-workspace actor resolves automatically where designed.
- multiple-workspace actor is prompted to select.
- no-access actor receives no-access state.
- stale workspace selection revalidates.
- revoked membership loses access on next resolution.
- cross-tenant selection fails.
- sibling-branch selection fails for branch-bound actor.
- no legacy cookie can influence workspace authority.

# 30. Permission Acceptance
- staff route requires staff access permission.
- kitchen route requires kitchen access permission.
- cashier route requires cashier access permission.
- admin route requires management admin permission.
- direct route navigation cannot bypass permission layout.
- direct command invocation cannot bypass command permission checks.
- stale role/permission changes are reflected according to R05 freshness semantics.
- legacy session artifacts cannot satisfy permission checks.

# 31. Command Acceptance — Orders
- `order.view` protects read surfaces where required.
- `order.manage` protects mutating order commands where required.
- authorization occurs server-side.
- client visibility is not authority.
- permission denial prevents mutation.
- transaction rollback preserves consistency.

# 32. Command Acceptance — Service
- `service.view` protects service-request read surfaces where required.
- `service.manage` protects service-request mutation where required.
- permission denial fails closed.
- workspace context remains current.

# 33. Command Acceptance — Kitchen
- `kitchen.view` and/or route-family permission protect kitchen read access as designed.
- `kitchen.manage` protects state-changing kitchen commands.
- cashier/staff roles cannot inherit kitchen mutation accidentally.
- branch scope remains enforced.

# 34. Command Acceptance — Payments
- `merchant_payment.view` protects merchant payment reads.
- `merchant_payment.collect` protects collection commands.
- `merchant_payment.void` protects void commands.
- payment permission denial must occur before mutation.
- no legacy session artifact can authorize financial command execution.

# 35. Command Acceptance — Management
- `settings.view/manage` remain separated.
- `member.view/invite/manage` remain separated.
- `role.view/manage` remain separated.
- `audit.view` remains explicit.
- ordinary actor cannot self-elevate through membership or role management.
- no legacy authority path can bypass these controls.

# 36. RLS Acceptance
- actorless runtime access remains denied where intended.
- tenant-wide membership semantics remain explicit.
- branch-bound membership semantics remain exact.
- wrong branch remains denied.
- cross-tenant remains denied.
- inactive user remains denied.
- invited/suspended/revoked membership remains denied.
- self-elevation protections remain intact.
- context variables remain transaction-local.

# 37. Role/Context Leakage Acceptance
- `flow_authenticator` does not leak after transaction.
- `flow_identity` does not leak after transaction.
- `flow_runtime` does not leak after transaction.
- `app.actor_id` does not leak.
- `app.tenant_id` does not leak.
- `app.branch_id` does not leak.
- sequential actors on reused pool remain isolated.
- sequential tenants on reused pool remain isolated.
- sequential branches on reused pool remain isolated.

# 38. Credential Security Acceptance
- raw passwords are never logged.
- password hashes are never serialized to clients.
- dummy KDF path remains active for unknown identity timing resistance.
- normalized email lookup remains canonical.
- throttle state remains server/database controlled.
- shared fallback password no longer exists as supported authority.

# 39. Enumeration Resistance Acceptance
- unknown account and wrong password remain externally generic.
- disabled/suspended credential state is not unnecessarily disclosed.
- unauthorized tenant/branch does not reveal protected metadata.
- forbidden route behavior does not leak permission internals beyond product need.
- logs may record internal reason codes without secrets.

# 40. Authorization Logging Acceptance
- no raw session tokens in logs.
- no legacy tokens in logs.
- no raw passwords in logs.
- no credential hashes in logs.
- actor IDs may be logged where appropriate.
- tenant/branch IDs may be logged where appropriate.
- permission code may be logged for denial diagnostics where safe.
- production error responses remain generic.

# 41. Error Taxonomy Cleanup
- remove legacy auth-specific error types that no longer have consumers.
- preserve current identity/authentication errors.
- preserve access-resolution result types.
- preserve authorization denial types/results.
- avoid reusing old `AuthConfigurationError` for Auth.js configuration failures unless semantically correct.
- dead error classes should be deleted with dead modules.

# 42. Source-Level Grep Acceptance
- no import of deleted legacy token module remains.
- no live reference to `credentialsMatch` remains.
- no live reference to `getInternalAuthConfig` remains if deleted.
- no live session issuance to `foodflow_session` remains.
- no legacy internal user ID constant remains as authority.
- no hard-coded `foodflow-demo` password remains outside historical docs/tests intentionally asserting absence.
- no hard-coded development signing secret remains in runtime source.

# 43. Environment Grep Acceptance
- `.env.example` contains no obsolete legacy shared auth values.
- docs contain no instruction telling operators to configure old shared credentials as current auth.
- tests do not rely on legacy env credentials for successful login.
- deployment scripts do not require legacy secret.

# 44. Package Grep Acceptance
- direct `jose` dependency remains only if current code imports it legitimately.
- package scripts do not reference removed legacy tests.
- no duplicate auth package is introduced.
- Auth.js dependencies remain pinned as current repo requires.

# 45. Migration Safety
- default R06 DB migration count: zero.
- if obsolete DB object removal is necessary, use a forward-only migration.
- never mutate production DB during validation.
- clean local reset must still build complete schema.
- generated types must remain consistent if DB schema changes.
- historical migration files remain immutable unless current repository policy explicitly authorizes correction.

# 46. Rollback Philosophy
- R06 intentionally removes the source-level rollback path to legacy auth.
- After R06, rollback should mean redeploying a prior known-good application commit, not keeping duplicate live authority in current source.
- Do not preserve insecure dead code solely for hypothetical rollback convenience.
- Document any operational rollback note without preserving alternate authority.

# 47. Atomic Cleanup Rule
- Do not delete legacy config while leaving token issuer import broken.
- Do not remove dependency before deleting all direct imports.
- Do not remove env documentation while keeping runtime dependency on env.
- Cleanup should land as a coherent branch state.
- Intermediate commits may be temporarily non-buildable only if final branch is coherent, but prefer buildable commits.

# 48. Implementation Sequence — Audit
- fetch current main policy/spec.
- identify latest R05 implementation parent.
- search all source/tests/docs/env/package files for legacy authority symbols.
- inventory consumers before deleting anything.
- classify each consumer as current, cleanup-only, test-only, or obsolete.
- record exact removal plan in implementation PR.

# 49. Implementation Sequence — Remove Issuer
- remove custom token creation.
- remove custom token verification.
- remove custom session type.
- remove legacy issuer/audience constants.
- remove legacy signing secret dependency.
- update session helper to Auth.js-only behavior.
- preserve one-way cookie deletion only if useful.

# 50. Implementation Sequence — Remove Shared Credentials
- remove legacy config module if fully obsolete.
- remove shared email/password config.
- remove fallback development credential pair.
- remove credential comparison helper.
- remove UI/demo references.
- remove test setup relying on shared credentials.

# 51. Implementation Sequence — Remove Dependency
- search for remaining `jose` imports.
- if none in direct project code, remove direct dependency.
- regenerate lockfile.
- avoid unrelated dependency updates.
- confirm Auth.js remains functional.

# 52. Implementation Sequence — Clean Environment
- remove legacy env keys from example.
- update auth documentation.
- keep current Auth.js keys.
- keep DB/authenticator runtime requirements.
- record hosted legacy secret cleanup as operator follow-up only if not observable by implementation tooling.

# 53. Implementation Sequence — Strengthen Regressions
- convert old legacy success tests into absence/bypass-denial tests.
- add stale legacy cookie denial test.
- add old demo credential denial test.
- add no-legacy-env dependency test.
- preserve Auth.js happy-path tests.
- preserve R04 workspace tests.
- preserve R05 permission tests.

# 54. Implementation Sequence — Acceptance
- run full auth/authz regression matrix.
- run database authorization regressions.
- run build/type/lint.
- run E2E protected route matrix.
- create Phase 02 acceptance record.
- open exactly one R06 implementation PR.
- stop without merging implementation PR.

# 55. Expected New Acceptance Document
- create `docs/07-delivery/development-phases/FLOW_P02_ACCEPTANCE.md`.
- this is a non-executable acceptance record.
- record R01–R06 implementation branch/PR evidence available at implementation time.
- record final supported auth authority.
- record final workspace/access-context authority.
- record final permission authority.
- record legacy surfaces removed.
- record validation outcomes truthfully.
- record known residual risks/follow-up.
- record P03 stop/entry condition.

# 56. Acceptance Record — Required Sections
- Phase 02 objective.
- round-by-round outcome summary.
- final identity authority.
- final session authority.
- final workspace authority.
- final permission authority.
- final RLS defense-in-depth status.
- legacy removal inventory.
- environment/dependency cleanup inventory.
- security regression evidence.
- unresolved limitations.
- next phase handoff.

# 57. P03 Boundary
- P03 owns Core Server Data Plane + Customer Capability.
- R06 must not implement customer cart/order persistence.
- R06 must not implement customer capability token/session unless already part of defined P03 scope.
- R06 must not add order command architecture beyond preserving existing auth tests.
- R06 hands P03 a stable internal identity/authz foundation.

# 58. P03/R01 Expected Handoff
- one supported internal authentication authority.
- one supported internal session authority.
- canonical actor UUID.
- canonical AccessContext.
- canonical permission enforcement primitives.
- tenant/branch RLS defense in depth.
- no shared legacy credential fallback.
- no legacy custom internal session authority.
- deterministic auth/authz fixtures and tests.

# 59. Files to Audit — Auth Runtime
- `apps/web/next-flow/src/auth.ts`.
- `apps/web/next-flow/src/auth.config.ts`.
- `apps/web/next-flow/src/lib/auth/session.ts`.
- `apps/web/next-flow/src/lib/auth/config.ts` if still present.
- `apps/web/next-flow/src/lib/auth/token.ts` if still present.
- `apps/web/next-flow/src/proxy.ts`.
- `apps/web/next-flow/src/app/api/auth/login/route.ts`.
- `apps/web/next-flow/src/app/api/auth/logout/route.ts`.
- `apps/web/next-flow/src/app/api/auth/[...nextauth]/route.ts`.

# 60. Files to Audit — Identity Modules
- authentication orchestrator.
- credential repository.
- password verifier.
- login throttle adapter.
- session claims.
- throttle subject derivation.
- AccessContext modules.
- workspace repository/resolver/selection.
- current-access helper.
- permission evaluator.
- authorized transaction helper.
- route permission map.
- command permission map.

# 61. Files to Audit — Tests
- R01 identity unit tests.
- R02 fixture integration tests.
- R03 authentication authority cutover tests.
- R03 authentication integration tests.
- R04 workspace tests.
- R05 permission tests.
- E2E auth helper.
- E2E permission routes.
- DB authorization tests.
- any legacy auth-session test still asserting old success behavior.

# 62. Files to Audit — Configuration
- `.env.example`.
- package manifest.
- lockfile.
- test scripts.
- Playwright config.
- CI workflow path classification only if cleanup changes package/test scope.
- deployment docs referencing old auth envs.

# 63. Legacy Symbol Denylist
- `foodflow_session` as authority.
- `foodflow-internal` as authenticated actor identity.
- `INTERNAL_SESSION_TYPE` legacy authority.
- `createSessionToken`.
- `verifySession` from legacy token module.
- `credentialsMatch`.
- `getInternalAuthConfig` when legacy-only.
- `FOODFLOW_INTERNAL_EMAIL`.
- `FOODFLOW_INTERNAL_PASSWORD`.
- `FOODFLOW_SESSION_SECRET` when legacy-only.
- hard-coded `foodflow-demo` credential.

# 64. Allowed Transitional Mention Rule
- Historical specifications may mention legacy symbols.
- Acceptance documentation may mention them as removed history.
- Tests may include literal legacy cookie names to prove they are ignored.
- Runtime code must not retain them as authority.
- Search-based acceptance must distinguish historical documentation from live source.

# 65. Unit Test Matrix — Legacy Absence
- old credentials helper module cannot be imported if removed.
- current auth helper does not call shared credential matcher.
- session helper does not call custom token issuer.
- session helper does not call custom token verifier.
- current session helper still returns Auth.js session.
- logout remains Auth.js-backed.

# 66. Unit Test Matrix — Auth.js Preservation
- real actor ID persists in JWT/session callbacks.
- invalid identity claims do not become valid actor IDs.
- session remains identity-only.
- route authorized callback remains coarse authentication gate only where intended.
- R05 permission layouts remain downstream authorization authority.

# 67. Integration Test Matrix — Login
- valid fixture login succeeds.
- unknown user fails.
- wrong password fails.
- disabled credential fails.
- suspended user fails.
- no-membership credential-bearing user may authenticate but cannot resolve workspace.
- old shared demo credentials do not bypass DB authentication.
- legacy env vars do not affect authentication result.

# 68. Integration Test Matrix — Legacy Cookie
- request with only old cookie remains unauthenticated.
- old cookie plus no Auth.js session remains unauthenticated.
- old cookie cannot grant workspace access.
- old cookie cannot grant staff permission.
- old cookie cannot grant kitchen permission.
- old cookie cannot grant cashier permission.
- old cookie cannot grant admin permission.

# 69. Integration Test Matrix — Workspace
- owner workspace still resolves.
- branch staff workspace still resolves.
- cross-tenant denied.
- sibling branch denied.
- revoked membership denied.
- no-membership authenticated actor denied workspace.
- stale selector rejected.

# 70. Integration Test Matrix — Permissions
- manager/admin positive path.
- staff positive path.
- kitchen positive path.
- cashier positive path.
- cross-role denial.
- permission freshness after role mapping change.
- membership revocation denial.
- exact branch scope preserved.

# 71. Database Test Matrix
- normalized identity constraint remains valid.
- pre-auth role remains least privilege.
- flow_identity remains least privilege.
- active membership helper remains correct.
- permission helper remains correct.
- R04 workspace function remains least privilege.
- R05 permission enforcement DB assumptions remain correct.
- self-elevation denial remains.
- context leakage remains absent.

# 72. E2E Matrix — Protected Routes
- unauthenticated `/staff` redirects to login.
- unauthenticated `/kitchen` redirects to login.
- unauthenticated `/cashier` redirects to login.
- unauthenticated `/admin` redirects to login.
- old legacy cookie alone does not prevent redirects.
- correctly authenticated but unauthorized role reaches forbidden behavior.
- correctly authenticated authorized role reaches intended surface.

# 73. E2E Matrix — Workspace
- authenticated one-workspace actor navigates correctly.
- authenticated multi-workspace actor selects valid workspace.
- invalid stale selection recovers.
- no-access actor can log out.
- legacy cookie does not alter selection state.

# 74. E2E Matrix — Logout
- authenticated actor logs out.
- Auth.js session becomes unavailable.
- protected route redirects after logout.
- workspace selection is cleared/ignored as designed.
- stale legacy cookie does not restore access.

# 75. Failure Path — Auth.js Secret Missing
- classify according to current Auth.js behavior.
- fail securely.
- do not fall back to legacy secret.
- do not fall back to development shared secret.
- surface safe operational error.
- never log secret values.

# 76. Failure Path — Database Unavailable
- authentication may return unavailable.
- workspace resolution may return unavailable.
- authorization should not default allow.
- no legacy fallback is permitted.
- retry on later request is acceptable.
- do not create emergency shared credential bypass.

# 77. Failure Path — Permission DB Error
- fail closed.
- do not infer permission from role name in client/session.
- do not use cached legacy authority.
- transaction should not mutate on uncertain authorization.

# 78. Failure Path — Legacy Cookie Parse
- R06 should not need to parse it for authority.
- if deletion helper reads cookie presence, parsing contents is unnecessary.
- malformed legacy cookie should be ignored or deleted.
- no error detail should leak.

# 79. Concurrency — Revocation
- in-flight request semantics remain transaction/database dependent.
- next request must reflect revoked membership.
- subsequent authorized transaction must deny.
- legacy session artifacts must not prolong access.

# 80. Concurrency — Permission Change
- permission reassignment should reflect according to R05 current-state evaluation.
- no JWT permission snapshot delays revocation.
- no legacy session role snapshot exists.
- race tests should prove no mutation after a denied current authorization check within the same transaction strategy.

# 81. Concurrency — Logout
- concurrent request started before logout may complete according to normal web semantics.
- new requests after logout must not authenticate.
- legacy cookie cannot re-authenticate.
- workspace hint alone cannot authenticate.

# 82. Transaction Safety — Commands
- authorization and high-risk mutation should remain atomic where R05 designed it.
- permission check failure rolls back/no-op mutation.
- DB failure rolls back mutation.
- legacy cleanup must not move permission checks outside trusted transaction boundary.

# 83. Performance Acceptance
- deleting legacy code should not add extra auth round trips.
- no new database lookup should be added merely to prove absence.
- current credential lookup remains bounded.
- workspace discovery remains bounded.
- permission checks remain appropriately scoped.
- no polling/revalidation loop is introduced.

# 84. Client Bundle Acceptance
- server-only auth modules remain server-only.
- legacy secret code is not moved client-side.
- password verification is not bundled client-side.
- permission evaluator remains server-only.
- AccessContext authority remains server-side.

# 85. Type Safety Acceptance
- removed legacy types have no consumers.
- Auth.js Session augmentation/claim types still compile.
- AccessContext types still compile.
- permission code union/catalog still compiles.
- generated DB types remain valid.

# 86. Lint Acceptance
- no dead imports after file deletion.
- no deprecated rollback helper references.
- no unused legacy constants.
- no unsafe `any` introduced to bypass cleanup.
- no eslint suppression added merely to land cleanup.

# 87. Build Acceptance
- Next.js app builds without deleted modules.
- NextAuth handler route resolves.
- proxy resolves.
- login route resolves.
- logout route resolves.
- workspace route resolves.
- forbidden route resolves.
- staff/kitchen/cashier/admin route families compile.

# 88. Package Acceptance
- clean install succeeds.
- lockfile matches manifest.
- no unnecessary dependency churn.
- direct dependency list reflects actual direct imports.
- if `jose` removed, build/tests prove no direct need remains.

# 89. Database Bootstrap Acceptance
- clean local Supabase start/reset succeeds when DB validation is applicable.
- all historical migrations replay.
- R01–R05 DB tests still pass.
- DB lint passes when applicable.
- generated type drift is clean.
- runtime DB integration remains green.

# 90. Regression — R01
- email normalization preserved.
- credential lookup preserved.
- password verifier preserved.
- dummy KDF preserved.
- throttle preserved.
- flow_authenticator least privilege preserved.

# 91. Regression — R02
- deterministic credential fixtures preserved.
- deterministic membership personas preserved.
- tenant/branch fixtures preserved.
- permission fixtures preserved.
- no-membership authentication/authorization separation preserved.

# 92. Regression — R03
- database-backed login preserved.
- Auth.js Credentials provider preserved.
- real actor UUID preserved.
- Auth.js session authority preserved.
- old legacy cookie not accepted.
- no shared env credential fallback.

# 93. Regression — R04
- workspace discovery preserved.
- AccessContext preserved.
- tenant-wide and branch-bound semantics preserved.
- revocation freshness preserved.
- selection hint remains non-authoritative.

# 94. Regression — R05
- permission catalog preserved.
- route permission enforcement preserved.
- command permission enforcement preserved.
- authorized transaction preserved.
- forbidden semantics preserved.
- permission freshness preserved.

# 95. Security Acceptance — Authentication
- one live authority only.
- no shared credential bypass.
- no custom session bypass.
- real actor identity only.
- server-only verification.
- generic failure behavior.

# 96. Security Acceptance — Authorization
- current membership required.
- current workspace required.
- current permission required.
- tenant and branch scope enforced.
- RLS provides defense in depth.
- client cannot forge authority.

# 97. Security Acceptance — Secrets
- no legacy demo secret in source.
- no legacy demo password in source except historical/negative test literals where intentional.
- no raw secrets in logs.
- no credentials in PR evidence.
- current Auth.js secret remains environment-controlled.

# 98. Security Acceptance — Privilege Escalation
- staff cannot self-promote.
- staff cannot create manager role assignment for self.
- revoked membership cannot be reactivated without required permission.
- branch actor cannot select sibling branch.
- Tenant A actor cannot select Tenant B.
- legacy artifact cannot bypass any of these.

# 99. Security Acceptance — Financial Operations
- payment collect requires canonical permission.
- payment void requires canonical permission.
- denial prevents mutation.
- legacy cookie/shared credential cannot authorize payment operations.
- no payment provider implementation is added here.

# 100. Security Acceptance — Audit/Observability
- denial events can be diagnosed without secrets.
- logs identify actor/context when safe.
- no token/password/hash logging.
- acceptance record captures validation results rather than sensitive runtime data.

# 101. Definition of Done — Legacy Source
- legacy custom token issuer removed.
- legacy custom token verifier removed.
- shared credential matcher removed.
- development shared auth fallback removed.
- dead legacy constants removed.
- dead legacy types removed.
- no runtime import path can recreate old authority.

# 102. Definition of Done — Environment
- obsolete shared auth env keys removed from example/docs.
- current Auth.js env keys retained.
- current DB env keys retained.
- stale hosted legacy secrets are inert even if not manually deleted yet.
- operator follow-up is documented truthfully if hosted cleanup cannot be observed.

# 103. Definition of Done — Dependency
- direct dependencies match live imports.
- `jose` removed if unused.
- lockfile consistent.
- no unrelated upgrade churn.

# 104. Definition of Done — Authentication
- valid DB credential login works.
- invalid login fails.
- Auth.js session is authoritative.
- no legacy cookie/session acceptance.
- logout works.

# 105. Definition of Done — Workspace
- current access resolves.
- no-access state works.
- revoked membership denied.
- stale selection rejected.
- client hint not authority.

# 106. Definition of Done — Permissions
- protected route families remain permission-gated.
- commands remain permission-gated.
- forbidden behavior remains explicit.
- role/permission freshness remains current.
- direct endpoint bypass tests remain covered.

# 107. Definition of Done — Database
- RLS regressions pass.
- least-privilege roles preserved.
- context leakage absent.
- fresh bootstrap valid.
- no production destructive mutation performed.

# 108. Definition of Done — Acceptance Record
- `FLOW_P02_ACCEPTANCE.md` exists.
- it records actual observed evidence.
- it does not fabricate PASS.
- it records residual limitations.
- it states P03/R01 handoff.

# 109. Explicit Prohibitions
- do not reintroduce shared credentials as emergency fallback.
- do not retain legacy token issuer “just in case”.
- do not add another custom session mechanism.
- do not put permission snapshots into JWT as cleanup shortcut.
- do not redesign AccessContext.
- do not broaden R05 permission scope.
- do not start P03 feature work.
- do not rewrite historical migrations for aesthetics.
- do not perform production DB reset/push.
- do not expose secrets.
- do not merge the implementation PR.
- do not enable implementation auto-merge.

# 110. PR Requirements
- identify Phase 02 / Round 06.
- reference this exact specification from `main`.
- record implementation parent branch and SHA.
- record implementation head SHA.
- list all removed legacy files.
- list all modified auth files.
- list removed env keys.
- list dependency changes.
- state whether any DB migration was added and why.
- include legacy symbol search evidence.
- include auth/authz acceptance results.
- include RLS regression results.
- include stale legacy cookie denial evidence.
- include shared credential denial/absence evidence.
- include Phase 02 acceptance document.
- remain owner-controlled for merge.

# 111. Expected PR Scope Declaration
```text
PHASE: P02
ROUND: R06
LEGACY_SHARED_CREDENTIAL_AUTH_REMOVED: YES
LEGACY_CUSTOM_SESSION_AUTHORITY_REMOVED: YES
AUTHJS_SESSION_AUTHORITY_PRESERVED: YES
ACCESS_CONTEXT_PRESERVED: YES
ROUTE_PERMISSION_ENFORCEMENT_PRESERVED: YES
COMMAND_PERMISSION_ENFORCEMENT_PRESERVED: YES
PRODUCTION_DB_DESTRUCTIVE_CHANGE: NO
PHASE_02_ACCEPTANCE_RECORD_ADDED: YES
P03_IMPLEMENTATION_STARTED: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 112. Validation Vocabulary
- future implementation evidence must use `PASS`.
- or `FAIL`.
- or `NOT RUN`.
- or `BLOCKED`.
- or `NOT APPLICABLE`.
- never fabricate PASS.
- document validation itself is independent of hosted Actions.

# 113. Suggested Application Validation
- clean dependency install using current repo command.
- lint.
- typecheck.
- unit tests.
- integration tests.
- Next.js build.
- E2E auth/workspace/permission route subset.
- exact commands must be re-read from current package scripts.

# 114. Suggested Database Validation
- clean local Supabase start/reset when applicable.
- R01 SQL tests.
- R02 SQL tests.
- R04 workspace SQL tests.
- R05 permission SQL tests.
- inherited P01/R04 authorization tests.
- DB lint.
- generated type check when schema changes.
- runtime DB integration.

# 115. Legacy Search Validation
- search runtime source for `foodflow_session`.
- search runtime source for `foodflow-internal`.
- search runtime source for `FOODFLOW_INTERNAL_EMAIL`.
- search runtime source for `FOODFLOW_INTERNAL_PASSWORD`.
- search runtime source for `FOODFLOW_SESSION_SECRET`.
- search runtime source for `credentialsMatch`.
- search runtime source for `createSessionToken`.
- search runtime source for legacy `verifySession` import.
- classify any remaining historical/negative-test mention explicitly.

# 116. Dependency Search Validation
- search for `from "jose"`.
- search for `require("jose")` if CommonJS exists.
- inspect package manifest.
- inspect lockfile changes.
- confirm no unrelated dependency drift.

# 117. Session Boundary Validation
- `getInternalSession()` remains Auth.js-backed or equivalent current helper.
- `requireInternalSession()` remains Auth.js-backed or equivalent current helper.
- no legacy verifier is invoked.
- `session.user.id` remains real UUID.

# 118. Workspace Boundary Validation
- current-access helper derives actor from session server-side.
- selection hint remains untrusted.
- resolver revalidates membership.
- resolved context maps to tenant transaction.
- no legacy session branch exists.

# 119. Permission Boundary Validation
- permission evaluator uses current AccessContext.
- permission code is canonical.
- DB/helper evaluation is current-state.
- command authorization is not just route authorization.
- no legacy actor identity is accepted.

# 120. Forbidden State Validation
- authenticated unauthorized actor gets forbidden response/page according to R05 design.
- unauthenticated actor gets login flow.
- no workspace gets workspace/no-access flow.
- infrastructure unavailable remains distinct safe failure.
- legacy cookie does not alter state classification.

# 121. Customer/Public Regression
- public entry remains public.
- customer-facing menu routes not accidentally gated by internal auth.
- customer QR entry not affected.
- no customer account requirement introduced.
- P03 remains responsible for customer capability/data-plane expansion.

# 122. Accessibility Regression
- login remains accessible.
- workspace selector remains accessible.
- forbidden/no-access states remain navigable.
- logout remains reachable.
- cleanup should not introduce blank/error-only route states.

# 123. Responsive Regression
- cleanup should not alter UI layouts except removal of obsolete demo credential display.
- login remains responsive.
- workspace selector remains responsive.
- forbidden page remains responsive.
- no broad UI redesign.

# 124. Documentation Cleanup
- update any auth runbook describing shared credentials as active.
- update environment setup docs.
- preserve historical specs untouched.
- acceptance record may explain legacy removal chronology.
- avoid rewriting broad unrelated docs.

# 125. Operational Rollout Notes
- deploy R06 with Auth.js secret/config already present.
- ensure database credential fixtures/real users exist as appropriate for environment.
- obsolete legacy hosted secrets can be removed after confirming application no longer references them.
- stale old cookies will be ignored/cleared.
- rollback uses prior deployment artifact/commit, not dual authority.

# 126. Post-Deploy Acceptance
- login with supported account works.
- protected route works for authorized account.
- unauthorized role denied.
- logout works.
- stale old cookie ignored.
- no unexpected dependency/runtime error from removed `jose` path.
- do not claim deployment proof if not actually observed.

# 127. Failure Recovery — Missing Remaining Consumer
- if deletion reveals a legitimate current consumer of a legacy module, stop and classify it.
- determine whether consumer is truly legacy or incorrectly coupled current code.
- refactor current code to supported authority if within R06 scope.
- do not retain duplicate authority merely to avoid refactor.

# 128. Failure Recovery — `jose` Still Needed
- if current code directly needs `jose` for a non-legacy supported feature, retain dependency.
- document exact consumer.
- cleanup success does not require dependency removal if dependency is legitimately used.
- requirement is removal of legacy authority, not arbitrary package deletion.

# 129. Failure Recovery — Old Env Still Referenced
- trace each reference.
- if reference is current code, remove/replace it.
- if reference is historical spec, leave it.
- if reference is negative test, retain intentionally.
- PR should classify remaining mentions.

# 130. Failure Recovery — Acceptance Regression
- if R03 auth regression fails, return defect to current branch and repair only if caused by R06 cleanup.
- if R04 workspace regression fails due to cleanup, repair within R06.
- if R05 permission regression fails due to cleanup, repair within R06.
- do not redesign unrelated subsystem to hide failure.

# 131. Security Stop Conditions
- cleanup would require exposing Auth.js secret.
- cleanup would require broad DB table grants.
- cleanup would require disabling permission checks.
- cleanup would require trusting client tenant/branch/role data.
- cleanup would require production destructive migration.
- cleanup cannot distinguish legacy authority from current authority safely.
- stop/report instead of weakening security.

# 132. Implementation Parent Rule
- R06 implementation must branch from latest legitimate R05 implementation lineage tip.
- current observed R05 branch is `p02-r05-permission-enforcement`.
- observed head is authoring evidence only.
- implementation must re-fetch actual head at execution.
- do not branch from this documentation branch.
- do not use `main` as code parent when newer R05 lineage exists.

# 133. Main Authority Rule
- current main provides this specification.
- current main provides merge policy.
- current main provides development README/template.
- unmerged implementation branch does not become policy authority.
- old PR body does not override current spec.
- remembered state does not override repository state.

# 134. Phase Completion Semantics
- R06 implementation completion means Phase 02 implementation chain has six implemented round branches.
- owner integration/merge remains separate according to policy.
- acceptance record should state actual merge/PR states, not assumptions.
- P03 spec must exist on `main` before P03 implementation starts.

# 135. Next Specification Rule
- `Next` is `FLOW_P03_R01_IMPLEMENTATION_SPEC.md`.
- R06 does not create P03 implementation branch.
- if P03/R01 spec is absent on `main`, implementation workflow stops after R06 handoff.
- documentation pipeline may author P03/R01 only from sufficient R06 evidence according to its own rules.

# 136. P03 Non-Goals in R06
- customer capability token.
- customer session model.
- cart persistence.
- order persistence.
- command idempotency.
- server data access layer expansion.
- customer order history.
- customer realtime.
- any of these belong to P03+.

# 137. Acceptance Evidence — Source Diff
- record removed files.
- record modified files.
- record dependency diff.
- record env diff.
- record any migration diff.
- explain why each change belongs to R06.
- identify explicitly unchanged R03/R04/R05 primitives.

# 138. Acceptance Evidence — Tests
- auth happy path.
- auth denial paths.
- stale legacy cookie denial.
- workspace positive/negative.
- permission positive/negative.
- revocation freshness.
- RLS isolation.
- role/context leakage.
- build/type/lint.

# 139. Acceptance Evidence — Legacy Absence
- no supported shared credential code.
- no supported custom session issuer.
- no supported custom session verifier.
- no legacy session fallback.
- no demo fallback password in runtime.
- no legacy env dependency in runtime.

# 140. Acceptance Evidence — Residual Mentions
- historical specs may still contain old names.
- negative tests may still contain old cookie/env strings.
- acceptance record may contain old names.
- each residual mention should be non-authoritative.
- do not attempt to erase history.

# 141. PR Review Checklist — Cleanup
- [ ] legacy config removed or reduced to non-legacy responsibility.
- [ ] legacy token module removed.
- [ ] session helper Auth.js-only.
- [ ] legacy env keys removed from current setup docs.
- [ ] no dead imports.
- [ ] dependency cleanup correct.

# 142. PR Review Checklist — Security
- [ ] stale legacy cookie denied.
- [ ] old shared credentials denied.
- [ ] no fallback secret.
- [ ] Auth.js actor UUID preserved.
- [ ] AccessContext preserved.
- [ ] route permission enforcement preserved.
- [ ] command permission enforcement preserved.
- [ ] RLS regressions preserved.

# 143. PR Review Checklist — Acceptance
- [ ] Phase 02 acceptance doc added.
- [ ] actual test results recorded.
- [ ] unresolved blockers recorded.
- [ ] P03/R01 next-spec handoff recorded.
- [ ] implementation PR not merged by agent.

# 144. Current-Code Assumptions to Revalidate
- R05 branch head may advance after this spec is authored.
- current permission module names may evolve.
- current session helper may already have partial cleanup.
- current env example may already have partial cleanup.
- current package dependency use may change.
- implementation must inspect actual latest R05 parent before deleting anything.

# 145. Legacy Cleanup Decision Table
| Surface | Default R06 action | Preserve only when |
|---|---|---|
| `foodflow_session` authority | REMOVE | never as authority; deletion-only handling may remain |
| shared internal email/password auth | REMOVE | never as supported authority |
| legacy custom HS256 token issuer | REMOVE | no preservation expected |
| legacy custom token verifier | REMOVE | no preservation expected |
| development shared demo credential | REMOVE | negative test literal only |
| `jose` direct dependency | REMOVE IF UNUSED | another supported direct consumer exists |
| Auth.js session | PRESERVE | canonical live authority |
| DB credential repository/verifier | PRESERVE | current auth dependency |
| AccessContext | PRESERVE | current authorization dependency |
| permission evaluator | PRESERVE | current authorization dependency |

# 146. Test Ownership Table
| Test area | R06 responsibility |
|---|---|
| legacy cookie bypass | add/strengthen |
| shared credential bypass | add/strengthen |
| Auth.js login | preserve |
| workspace resolution | preserve |
| revocation | preserve |
| route permission | preserve |
| command permission | preserve |
| RLS | preserve |
| Phase 03 product tests | do not add |

# 147. Data Contract Preservation
- user UUID remains UUID.
- normalized email remains canonical.
- credential algorithm remains `scrypt-v1` unless a separate authorized change exists.
- membership status remains database authority.
- tenant/branch IDs remain UUIDs.
- permission codes remain canonical strings.
- R06 does not change these contracts merely for cleanup.

# 148. API Contract Preservation
- login request/response should remain compatible unless removal of legacy shim requires narrow documented change.
- logout contract remains compatible.
- NextAuth route remains canonical.
- workspace selection route remains compatible.
- forbidden behavior remains compatible.
- no new external API added.

# 149. Cookie Contract Preservation
- Auth.js cookies remain framework-managed.
- workspace selection hint remains non-authoritative.
- legacy cookie may be deleted/ignored.
- R06 must not manually forge Auth.js session cookies.
- secure/httpOnly/sameSite behavior remains framework/current implementation responsibility.

# 150. Secret Boundary Preservation
- browser never receives DB credential hash.
- browser never receives Auth.js secret.
- browser never receives legacy secret because it is removed/inert.
- server never logs raw password.
- test fixtures remain synthetic.

# 151. Privilege Boundary Preservation
- `flow_authenticator` has execute-only pre-auth capability.
- `flow_identity` has actor-bound discovery capability.
- `flow_runtime` has tenant/branch actor runtime capability.
- R06 does not collapse roles into owner-level DB access.
- R06 does not widen grants for cleanup convenience.

# 152. Audit of Dead Exports
- search identity server index exports.
- remove exports only for deleted legacy code.
- preserve public server-only APIs used by R04/R05.
- no barrel export should reference deleted module.
- typecheck must catch dead imports.

# 153. Audit of Test Helpers
- E2E test auth helper may still know how to construct legacy cookie from earlier phases.
- R06 should remove that capability.
- E2E auth helper should use supported Auth.js login/test path.
- negative stale-cookie test can construct literal cookie header without reusable issuer helper.
- avoid leaving a general helper capable of minting valid legacy session tokens.

# 154. Audit of Login UI
- remove development credential prefill if it represents old shared auth.
- fixture credentials should not appear in production UI.
- test-only automation should inject credentials through test harness, not visible product copy.
- preserve login accessibility and error UX.

# 155. Audit of Documentation
- README/setup docs should describe current Auth.js + DB credential model.
- do not require old `FOODFLOW_INTERNAL_*` variables.
- explain test fixture credentials are test-only if documented at all.
- preserve historical spec chronology.

# 156. Audit of Deployment Config
- no Vercel config change expected solely for auth cleanup.
- current Auth.js env must remain deployed.
- obsolete legacy hosted secrets can be removed operationally.
- do not add fallback deployment env values in source.

# 157. Audit of CI
- no workflow change expected by default.
- package-lock change may trigger dependency validation.
- app source changes trigger Next Flow Quality.
- DB changes trigger DB quality if any.
- do not alter CI to hide cleanup failures.
- documentation validation does not use CI as authority.

# 158. Acceptance Failure Classification
- build fail from deleted import: R06 defect.
- auth login fail from removed legacy fallback when DB fixture absent: investigate test setup, not re-add fallback.
- workspace fail from actor identity loss: R06 defect.
- permission fail from session change: R06 defect.
- unrelated product test failure: classify truthfully; do not mask.

# 159. No Emergency Backdoor Rule
- no magic header.
- no debug query parameter.
- no environment super-password.
- no owner bypass cookie.
- no hard-coded admin account.
- no localStorage role override.
- no test-only bypass compiled into production path.

# 160. Negative Test — Emergency Backdoor
- search for bypass-style environment flags in auth code.
- ensure test helpers are isolated from production imports.
- ensure old demo account path is removed.
- ensure legacy cookie cannot be treated as debug session.

# 161. Phase 02 Final Threat Model — Credential
- brute-force mitigation remains throttle.
- unknown-user timing remains dummy KDF.
- shared secret compromise path is removed.
- credential hashes remain server/database-only.

# 162. Phase 02 Final Threat Model — Session
- custom legacy signer removed.
- one session authority reduces confusion.
- stale old cookies are inert.
- session does not carry mutable permission authority.

# 163. Phase 02 Final Threat Model — Tenant
- client tenant ID is selector only.
- database membership authorizes tenant.
- cross-tenant requests deny.
- RLS reinforces tenant boundary.

# 164. Phase 02 Final Threat Model — Branch
- client branch ID is selector only.
- branch membership/tenant-wide semantics authorize branch.
- sibling branch denies branch-bound actor.
- RLS reinforces branch boundary.

# 165. Phase 02 Final Threat Model — Permission
- route visibility is not authority.
- command endpoint enforces permission.
- database helper evaluates current permission state.
- role changes can revoke promptly.
- no JWT permission snapshot becomes stale authority.

# 166. Phase 02 Final Threat Model — Privilege Management
- member/role changes require canonical permissions.
- self-elevation protections remain.
- no legacy admin cookie bypass.
- no shared admin password bypass.

# 167. Phase 02 Final Threat Model — Payment
- collect/void commands permission-gated.
- tenant/branch context required.
- legacy auth cannot authorize payment command.
- payment provider-specific controls remain future product/payment scope.

# 168. Phase 02 Final Threat Model — Logging
- secrets redacted.
- tokens redacted.
- passwords redacted.
- authorization denial can remain diagnosable.
- acceptance evidence contains no secrets.

# 169. Acceptance Record Status Vocabulary
- `PASS` only for observed successful validation.
- `FAIL` for observed failure.
- `NOT RUN` for unexecuted validation.
- `BLOCKED` for impossible validation due to blocker.
- `NOT APPLICABLE` when legitimately outside diff/scope.
- do not convert old evidence into new PASS without revalidation where current spec requires fresh proof.

# 170. R06 Implementation Branch State Target
```text
P02/R06 = IMPLEMENTED ON ROUND BRANCH / PR OPEN
```
- implementation PR merge remains owner-controlled.
- this spec does not authorize the documentation automation to merge implementation.

# 171. Phase 02 Chain Completion Target
- R01 implementation lineage exists/history.
- R02 implementation lineage exists.
- R03 implementation lineage exists.
- R04 implementation lineage exists.
- R05 implementation lineage exists.
- R06 implementation lineage must be created by implementation workflow.
- six implemented branches complete Phase 02 implementation chain under current policy.

# 172. Next-Phase Stop Rule
- do not start P03 merely because R06 implementation exists.
- exact `FLOW_P03_R01_IMPLEMENTATION_SPEC.md` must exist on `main` and be READY.
- P03 documentation pipeline determines when that spec is justified.
- P03 implementation must use latest legitimate R06 lineage as code parent if current policy requires branch chaining.

# 173. Definition of Done — Final
- obsolete legacy auth source is physically removed.
- obsolete shared auth env contract is removed.
- obsolete custom session authority is removed.
- current Auth.js login/session remains working.
- current workspace AccessContext remains working.
- current route/command permissions remain working.
- RLS/security regressions remain intact.
- Phase 02 acceptance record exists.
- implementation PR exists for owner review.
- no P03 implementation work is included.

# 174. Document Validation Checklist
- [x] canonical filename is P02/R06.
- [x] Phase is 02.
- [x] Round is 06.
- [x] Status is READY.
- [x] Previous is P02/R05.
- [x] Next is P03/R01.
- [x] authority is current main.
- [x] implementation parent points to latest R05 lineage.
- [x] observed R05 head recorded.
- [x] legacy auth cleanup is explicit.
- [x] R03 authority preservation is explicit.
- [x] R04 preservation is explicit.
- [x] R05 preservation is explicit.
- [x] security acceptance is explicit.
- [x] DB/migration safety is explicit.
- [x] dependency/env cleanup is explicit.
- [x] failure/recovery is explicit.
- [x] negative tests are explicit.
- [x] P03 handoff is explicit.

# 175. Document-Only Validation Policy
- This specification is validated by its content and actual repository evidence.
- GitHub Actions are not the document-validation authority.
- Missing/failed/queued/skipped Actions do not semantically invalidate this document.
- Hosted merge enforcement may technically block a docs PR; that is a hosted merge restriction, not a document-content failure.
- Documentation automation must never alter implementation code to force docs merge.

# 176. Final Handoff Summary
- R06 receives a working Auth.js actor session from R03 lineage.
- R06 receives AccessContext and revocation-aware workspace authority from R04 lineage.
- R06 receives route/command permission enforcement from R05 lineage.
- R06 removes obsolete parallel authority.
- R06 proves the integrated security boundary.
- R06 leaves Phase 03 with one clean internal identity/authz substrate.

# 177. Required Next Specification
```text
FLOW_P03_R01_IMPLEMENTATION_SPEC.md
```
- P03/R01 scope must be authored separately.
- R06 does not infer or implement it.
- Absence of that spec on `main` means implementation stops after R06.

# 178. Final Acceptance Statement
- P02/R06 is READY as an executable specification document.
- READY does not claim R06 implementation already exists.
- R05 implementation evidence is sufficient to author this cleanup/acceptance round.
- The future R06 implementation must remove duplicate legacy authority rather than preserve it indefinitely.
- The future R06 implementation must preserve the modern R03/R04/R05 authority chain.
- The future R06 implementation remains owner-controlled for merge.

# 179. Exact Legacy Removal Inventory — Runtime
- inspect `src/lib/auth/config.ts` for any non-legacy constant before deletion.
- inspect `src/lib/auth/token.ts` for any non-legacy consumer before deletion.
- inspect `src/lib/auth/session.ts` for rollback-only exports.
- inspect login/logout routes for legacy cookie cleanup references.
- inspect proxy for stale legacy imports.
- inspect test helpers for custom token minting.
- inspect any middleware-like helper for fallback credential logic.
- classify every remaining legacy symbol before removal.

# 180. Exact Legacy Removal Inventory — Environment
- `FOODFLOW_INTERNAL_EMAIL` should have zero runtime consumers after R06.
- `FOODFLOW_INTERNAL_PASSWORD` should have zero runtime consumers after R06.
- `FOODFLOW_SESSION_SECRET` should have zero runtime consumers after R06 when legacy signer is gone.
- test-only references must not become product configuration.
- deployment docs must not present these as required.
- current Auth.js env remains authoritative.

# 181. Exact Legacy Removal Inventory — Tests
- old shared-credential success tests should be deleted or inverted.
- old token issue/verify happy-path tests should be deleted or inverted.
- stale-cookie denial tests should remain.
- historical literal strings may remain only as negative fixtures.
- test helpers must not provide reusable legacy-auth minting capability.

# 182. Exact Legacy Removal Inventory — Dependencies
- determine whether `jose` is a direct runtime dependency only for deleted code.
- inspect source imports, test imports, scripts, and tooling.
- remove direct dependency only if no supported direct consumer remains.
- package-lock must reflect only intentional manifest change.
- do not combine security cleanup with broad dependency modernization.

# 183. Exact Legacy Removal Inventory — Documentation
- preserve Phase 01/02 historical specs as records.
- update active setup docs only.
- update active environment docs only.
- update active auth architecture/runbook only when present.
- acceptance document may explicitly list removed legacy symbols.
- do not rewrite history to pretend legacy path never existed.

# 184. Atomic Removal Order
- first confirm current Auth.js path is present on parent branch.
- then identify all legacy consumers.
- then convert/remove rollback-only call sites.
- then delete legacy issuer/verifier modules.
- then delete shared config module if fully obsolete.
- then remove obsolete env documentation.
- then remove dependency if unused.
- then run source-level denylist searches.
- then run full auth/authz regression.
- this order minimizes accidental broken references and fallback resurrection.

# 185. Current-vs-Legacy Classification Rule
- database credential repository is CURRENT.
- password verifier is CURRENT.
- login throttle is CURRENT.
- Auth.js Credentials provider is CURRENT.
- Auth.js JWT/session callback is CURRENT.
- AccessContext is CURRENT.
- permission evaluator is CURRENT.
- legacy shared environment credentials are LEGACY.
- legacy custom HS256 issuer/verifier is LEGACY.
- stale-cookie deletion logic is CLEANUP-ONLY, not authority.

# 186. Source Removal Acceptance Matrix
- deleted module import count must be zero.
- deleted exported symbol references must be zero.
- deprecated rollback helper references must be zero.
- legacy env runtime references must be zero.
- custom legacy token issue calls must be zero.
- custom legacy token verify calls must be zero.
- historical docs are excluded from runtime-zero counts.

# 187. Old-Cookie Threat Matrix
- unsigned random old cookie: deny.
- malformed old JWT-looking cookie: deny.
- expired historical valid legacy token: deny.
- historically valid non-expired token under old secret: deny because verifier is gone.
- old cookie plus workspace hint: deny without Auth.js session.
- old cookie plus valid tenant/branch IDs: deny without Auth.js session.
- old cookie plus forged role/permission data: deny.

# 188. Old-Credential Threat Matrix
- old shared email/password without DB user: deny.
- old shared email/password with unrelated DB user: must not create authority unless actual DB credential matches.
- old demo password cannot bypass scrypt verification.
- legacy env variables cannot short-circuit DB credential lookup.
- absence of DB connection must not trigger fallback shared credential.

# 189. Session Ambiguity Elimination
- there must be one supported way to establish authenticated internal session.
- Auth.js provider/session callbacks define that path.
- no helper may independently set a second internal auth cookie.
- no route may select between Auth.js and legacy token verification.
- no test helper should normalize dual-authority behavior.

# 190. Authorization Ambiguity Elimination
- authenticated session identifies actor only.
- AccessContext identifies current workspace authority.
- permission evaluator identifies current action authority.
- RLS validates DB boundary.
- no legacy “internal session means admin” semantics remain.
- no static role inferred from old session type remains.

# 191. Acceptance — Staff Family
- authenticated staff with correct workspace and permission succeeds.
- authenticated kitchen-only actor cannot use staff route unless permission explicitly grants it.
- authenticated cashier-only actor cannot use staff route unless permission explicitly grants it.
- legacy cookie cannot grant staff access.
- old shared credential cannot grant staff access.

# 192. Acceptance — Kitchen Family
- authenticated kitchen actor with correct branch and permission succeeds.
- wrong branch denies.
- staff actor lacking kitchen access denies.
- legacy cookie denies.
- permission revocation is reflected without legacy fallback.

# 193. Acceptance — Cashier Family
- authenticated cashier actor with correct branch and permission succeeds.
- unauthorized branch denies.
- staff/kitchen actor lacking cashier permission denies.
- legacy cookie denies.
- financial commands remain separately permission-gated.

# 194. Acceptance — Admin Family
- authenticated manager/admin actor with management permission succeeds.
- ordinary staff denies.
- no-membership authenticated actor denies.
- legacy cookie denies.
- shared demo credential cannot become admin authority.
- self-elevation protections remain active.

# 195. Acceptance — No Membership
- credential-bearing no-membership actor can remain a valid authentication negative/edge fixture.
- authentication success does not imply workspace access.
- workspace resolution returns no access.
- permission evaluation cannot proceed as authorized.
- legacy cookie cannot fill the missing membership gap.

# 196. Acceptance — Revoked Membership
- actor session may remain technically authenticated.
- workspace resolution must fail for revoked membership.
- protected route must not proceed through stale workspace hint.
- command must not execute.
- old cookie cannot restore previous access.

# 197. Acceptance — Suspended User
- pre-auth lookup should fail according to current credential contract.
- existing stale session must not create current workspace authority.
- authorization should fail closed.
- no legacy fallback may bypass suspension.

# 198. Acceptance — Disabled Credential
- new login fails.
- existing authorization semantics depend on session/user/membership state as currently designed.
- R06 must not invent a new revocation model outside existing Phase 02 contract.
- no shared fallback credential bypasses disabled credential.

# 199. Acceptance — Wrong Tenant
- authenticated actor with valid session but unauthorized tenant selection denies.
- error must not expose sensitive tenant details.
- old cookie cannot influence result.
- command cannot override context with client-provided tenant.

# 200. Acceptance — Wrong Branch
- branch-bound actor requesting sibling branch denies.
- tenant-wide actor behavior follows R04 semantics.
- permission check receives authorized branch context only.
- stale/legacy cookie cannot widen branch scope.

# 201. Acceptance — Permission Revocation
- remove permission mapping or alter role in controlled test.
- next permission evaluation denies.
- route/command cannot fall back to legacy internal-session semantics.
- restoration of fixture state must be deterministic.

# 202. Acceptance — Role Change
- actor identity stays the same.
- AccessContext re-resolves current role metadata as designed.
- permission evaluator uses current DB relation.
- legacy token does not carry an old privileged role snapshot.

# 203. Acceptance — Session Expiry
- expired Auth.js session no longer authenticates.
- stale old legacy session cookie does not replace it.
- workspace hint alone is insufficient.
- protected routes return login flow.

# 204. Acceptance — Secret Rotation
- Auth.js secret rotation behavior remains framework/config controlled.
- old legacy signing secret is irrelevant after removal.
- no code path attempts to verify legacy token with obsolete secret.
- no dual-secret fallback exists.

# 205. Deployment Safety — Before Rollout
- verify current environment has required Auth.js config.
- verify database connectivity/config exists.
- verify at least one supported internal account path exists for operational testing.
- do not preserve shared credentials as a deployment safety net.
- document rollback to previous deployment artifact if needed.

# 206. Deployment Safety — After Rollout
- supported login succeeds.
- expected protected route succeeds.
- unauthorized route denies.
- logout succeeds.
- stale legacy cookie is inert.
- old shared env values are inert.
- application startup does not reference removed modules/env.

# 207. Rollback Safety
- rollback should restore an earlier entire deployment, not cherry-pick legacy authority into current code.
- do not maintain dual-path code for rollback.
- database changes in R06 should be zero by default, simplifying rollback.
- if a forward DB migration is unavoidable, document compatibility with previous application version.

# 208. Dependency Removal Safety
- package manifest change must be minimal.
- lockfile must not contain unrelated bulk churn if avoidable.
- build must prove Auth.js does not require direct project `jose` import.
- tests must prove removed dependency does not break test helpers.
- if dependency retained, PR must name current consumer.

# 209. Test Helper Safety
- no production module should import test helper.
- no test helper should expose a generic legacy token mint function after R06.
- fixture passwords remain test-only.
- test automation should authenticate through supported path or controlled lower-level current primitives.

# 210. Audit Trail Requirements
- acceptance record must list actual R05 parent SHA.
- acceptance record must list R06 head SHA.
- acceptance record must list removed legacy files.
- acceptance record must list retained current authority modules.
- acceptance record must state actual validation results.
- acceptance record must state whether implementation PR is merged or open.

# 211. Acceptance Record — Legacy Removal Table
- old shared credential config: REMOVED/INERT with evidence.
- old custom session issuer: REMOVED.
- old custom verifier: REMOVED.
- old cookie authority: REMOVED.
- old env dependency: REMOVED.
- old demo fallback: REMOVED.
- old direct dependency: REMOVED or retained with legitimate consumer.

# 212. Acceptance Record — Current Authority Table
- credential source: database credential boundary.
- session source: Auth.js.
- actor identity: real `app.users.id`.
- workspace authority: current active membership via R04 resolver.
- permission authority: current DB role/permission via R05 evaluator.
- DB defense: tenant/branch/actor RLS/runtime context.

# 213. Acceptance Record — Security Denial Table
- unknown login: denied.
- wrong password: denied.
- suspended actor: denied.
- no membership: workspace denied.
- revoked membership: denied.
- wrong tenant: denied.
- wrong branch: denied.
- missing permission: denied.
- legacy cookie: denied.
- old shared credential bypass: denied.

# 214. Acceptance Record — Residual Risks
- hosted obsolete secrets may remain stored until operator removal but must be inert.
- historical docs retain legacy names by design.
- synthetic fixture credentials remain test-only.
- any deferred product-level session capability belongs to P03+.
- record only real observed residual risks.

# 215. R06 Change Budget
- prioritize deletion and simplification.
- avoid new abstractions unless needed to replace a current accidental legacy dependency.
- no broad auth redesign.
- no new auth provider.
- no new persistence model.
- no new infrastructure service.
- high impact comes from eliminating duplicate authority and proving the final boundary.

# 216. Review Focus — Deletions
- reviewers should inspect every deleted module consumer.
- ensure no hidden route still imports deleted code.
- ensure no test silently stops covering protected paths.
- ensure removal does not weaken deny behavior.

# 217. Review Focus — Preserved Modern Path
- Auth.js config remains canonical.
- authentication orchestrator remains canonical.
- session claims remain minimal.
- current-access remains canonical.
- permission evaluator remains canonical.
- authorized transaction remains canonical.

# 218. Review Focus — Configuration
- env example reflects current runtime.
- no demo password.
- no old signing secret.
- no unnecessary auth env aliases.
- no secrets committed.

# 219. Review Focus — Tests
- legacy bypass denial is explicit.
- modern happy paths are not deleted with legacy tests.
- route permission E2E remains meaningful.
- workspace tests remain meaningful.
- DB security tests remain meaningful.

# 220. Review Focus — Database
- no accidental deletion of current credential tables/functions.
- no grant broadening.
- no RLS weakening.
- no production mutation.
- no historical migration rewrite.

# 221. Exact Final Source State Target
- `src/auth.ts`: supported Auth.js server auth.
- `src/auth.config.ts`: supported proxy-compatible Auth.js config.
- `src/lib/auth/session.ts`: Auth.js-oriented session convenience only.
- legacy config/token modules: absent or reduced to non-authority cleanup-only code with strong justification.
- identity modules: current DB auth/workspace/permission primitives.
- proxy: Auth.js authentication gate, no legacy token verifier.

# 222. Exact Final Environment State Target
- current Auth.js environment contract documented.
- database runtime environment contract documented.
- legacy shared credentials absent from active setup.
- legacy signing secret absent from active setup.
- test fixtures not presented as production configuration.

# 223. Exact Final Dependency State Target
- next-auth/Auth.js dependencies retained.
- current DB/Kysely dependencies retained.
- `jose` direct dependency removed if no live direct consumer.
- no replacement token library added.
- no unrelated upgrade batch.

# 224. Exact Final Test State Target
- authentication current-path tests.
- legacy bypass denial tests.
- workspace access tests.
- revocation tests.
- permission route tests.
- permission command tests.
- RLS/database security tests.
- Phase 02 acceptance evidence.

# 225. Final P03 Handoff — Authentication
- P03 must consume current server identity helpers rather than invent customer/internal identity confusion.
- internal actor authorization remains separate from future customer capability.
- P03 must not restore shared internal auth.
- P03 can rely on one clean internal authority chain.

# 226. Final P03 Handoff — Data Plane
- P03 receives tenant/branch-safe server transaction primitives.
- P03 receives permission-aware internal command foundations.
- P03 still owns customer data-plane capability/session semantics.
- R06 does not preempt those decisions.

# 227. Final P03 Handoff — Testing
- P03 inherits deterministic tenant/branch/actor fixtures.
- P03 inherits security denial regressions.
- P03 should extend rather than replace them.
- P03 customer capability tests must coexist with internal auth tests.

# 228. Final P03 Handoff — Non-Authority
- legacy cookie is not an authority.
- old shared env credentials are not an authority.
- client tenant/branch fields are not authority.
- UI route visibility is not authority.
- session permission snapshots are not authority.

# 229. R06 Completion Blockers
- current Auth.js path is not actually functional on R05 parent.
- R05 permission enforcement is missing despite branch evidence.
- deleting legacy source would remove the only functioning login path.
- unidentified live consumer requires insecure legacy verifier.
- cleanup requires production destructive DB action.
- security regression cannot be resolved without widening privilege.
- report blocker rather than preserve ambiguity silently.

# 230. R06 Implementation PR Stop Point
- finish code cleanup.
- finish acceptance tests.
- add acceptance record.
- open/update one R06 implementation PR.
- report actual outcomes.
- do not merge implementation PR.
- do not create P03 implementation branch.

# 231. Final Document Quality Check
- metadata sequence is canonical.
- R05 evidence is grounded in actual branch diff.
- scope is cleanup/acceptance, not redesign.
- legacy removal is file-level actionable.
- security tests cover bypass and revocation.
- environment/dependency cleanup is explicit.
- migration safety is explicit.
- failure/recovery and rollback are explicit.
- P03 handoff is explicit.
- no filler-only sections are intended.

# 232. Final Acceptance
- P02/R06 is READY as an executable specification document.
- R06 closes Phase 02 by eliminating obsolete authority and proving the modern identity/authz chain.
- The implementation must preserve Auth.js, AccessContext, permission enforcement, and RLS while deleting legacy shared auth.
- After R06 implementation reaches stable handoff, the documentation pipeline may evaluate whether `FLOW_P03_R01_IMPLEMENTATION_SPEC.md` is justified.
