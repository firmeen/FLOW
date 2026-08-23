# FLOW P02 R05 — Implementation Specification
> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization
> Round 05 — Route + Command Permission Enforcement Integration
> Revision — Canonical permission evaluation, route/command enforcement, denial semantics, and audit-ready authorization handoff

## Metadata
- Phase: `02`
- Round: `05`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P02_R04_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R06_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible slot after this spec is on main`
- Current planning scope: `PHASE 02 / ROUND 05 ONLY`
- Implementation parent: `latest P02/R04 implementation lineage tip`
- Expected implementation parent branch: `p02-r04-access-context`
- Observed R04 branch head at authoring: `1086f53121f414c08a732c4de6a0ce297a358f61`
- Observed R04 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Observed R04 implementation PR at authoring: `NONE FOUND`
- Recommended implementation branch: `p02-r05-permission-enforcement`
- Recommended implementation PR title: `feat(authz): enforce route and command permissions`
- Owner merge control for implementation: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Route permission enforcement in this round: `YES`
- Command permission enforcement in this round: `YES`
- Canonical server authorization helpers in this round: `YES`
- Permission-denial behavior in this round: `YES`
- Authorization audit/observability contract in this round: `YES`
- Legacy-auth physical removal in this round: `NO — P02/R06`
- Auth.js session authority change in this round: `NO BY DEFAULT`
- Workspace model redesign in this round: `NO`
- Production database destructive mutation: `NO`

# 1. Authoring State
- Current `main` remains the only policy and executable-specification authority.
- Latest observed `main` before this documentation branch was created is `43e93ec9caa472a504069ff80b353670114c15b2`.
- `FLOW_P02_R04_IMPLEMENTATION_SPEC.md` exists on `main`.
- R04 specification status is READY.
- R04 specification points `Next` to this exact canonical filename.
- No `FLOW_P02_R05_IMPLEMENTATION_SPEC.md` existed on `main` before this document was authored.
- No active `p02-r05-*` implementation branch was observed before this document was authored.
- R04 implementation branch exists as `p02-r04-access-context`.
- R04 branch head observed is `1086f53121f414c08a732c4de6a0ce297a358f61`.
- R04 branch is 23 commits ahead of `p02-r03-authjs-session-cutover`.
- R04 branch contains meaningful runtime authorization-context implementation.
- R04 adds `AccessContext` and workspace resolution primitives.
- R04 adds `current-access` server helpers.
- R04 adds workspace selection persistence and selector UI/API.
- R04 adds actor-bound workspace discovery.
- R04 adds a forward-only workspace discovery migration.
- R04 adds unit, integration, E2E-adjacent, and SQL authorization coverage.
- R04 therefore provides real code evidence for R05 specification authoring.
- The owner explicitly requested R05 specification progression now.
- This task remains documentation/specification only.
- This task does not create an R05 implementation branch.
- This task does not modify application/runtime/database code.
- This task does not merge an implementation PR.

# 2. Phase Objective
- Phase 02 establishes one coherent internal human identity and authorization chain.
- Authentication is database-backed.
- Auth.js is the session authority.
- Authenticated identity is a real `app.users.id` UUID.
- Workspace access derives from current active memberships.
- Tenant authority is resolved server-side.
- Branch authority is resolved server-side.
- Role/permission authority derives from database state.
- Route access is enforced server-side.
- Command access is enforced server-side.
- Database RLS remains defense in depth.
- Revocation fails closed.
- Suspended/inactive users fail closed.
- Cross-tenant access fails closed.
- Wrong-branch access fails closed.
- Legacy auth is removed only after replacement authority is proven.
- Public customer entry remains unaffected.

# 3. Six-Round Boundary
- R01 owns canonical login identity and pre-auth least privilege.
- R01 owns credential lookup and password/throttle primitives.
- R02 owns deterministic identity, membership, role, and permission fixtures.
- R02 owns cross-tenant and branch authorization regression personas.
- R03 owns live database-backed authentication.
- R03 owns Auth.js session authority and real actor UUID claims.
- R04 owns workspace discovery and AccessContext resolution.
- R04 owns tenant/branch selection and membership revocation semantics.
- R05 owns permission-specific route enforcement.
- R05 owns permission-specific command enforcement.
- R05 owns canonical permission helper integration.
- R05 owns authorization denial semantics and audit-ready evidence.
- R06 owns physical legacy-auth removal.
- R06 owns final security acceptance and cleanup.
- R05 must not collapse R06 cleanup responsibilities.

# 4. R05 High-Impact Objective
- Convert a valid R04 AccessContext into a current permission decision.
- Create one canonical server authorization primitive for permission checks.
- Make route access depend on canonical permission codes rather than coarse route grouping alone.
- Make command/mutation access depend on canonical permission codes.
- Prevent UI visibility from becoming authorization authority.
- Prevent route names from becoming role assumptions.
- Prevent direct server command invocation from bypassing route protection.
- Reuse current actor/tenant/branch context rather than rebuilding it.
- Reuse `private.actor_has_permission()` or equivalent existing canonical database authorization semantics.
- Keep database RLS as independent defense in depth.
- Ensure revoked or changed memberships lose permission on next authorization evaluation.
- Ensure role changes are reflected without rewriting Auth.js session claims.
- Ensure permission changes are reflected without rewriting Auth.js session claims.
- Ensure cross-tenant and wrong-branch permission checks fail closed.
- Produce durable regression tests for owner/staff/kitchen/cashier/admin separation.
- Produce a clean R06 handoff where all live authorization authority is already on the replacement path.

# 5. Why R05 Exists Now
- R03 established authenticated identity.
- R04 established current workspace authority.
- R04 intentionally did not enforce route-specific permissions.
- R04 intentionally did not enforce command-specific permissions.
- Current protected layouts can require an AccessContext but cannot yet distinguish all capabilities.
- Without R05, an actor with any active workspace may still reach surfaces that should require a specific permission.
- Without R05, server commands may rely on callers having passed a UI route guard.
- UI guards are not sufficient security controls.
- R05 closes the remaining authorization gap before legacy cleanup.
- R05 must centralize permission semantics so R06 can remove old coarse-auth paths safely.

# 6. Current R04 AccessContext Contract
- `src/modules/identity/server/access-context.ts` exists on the R04 branch.
- `AccessContext` contains `actorId`.
- `AccessContext` contains `tenantId`.
- `AccessContext` contains `branchId` or null.
- `AccessContext` contains `membershipId`.
- `AccessContext` contains `roleId`.
- `AccessContext` contains explicit scope.
- AccessContext is server-only.
- AccessContext is derived from server/database state.
- Client selector values are not authority.
- AccessContext does not contain a permission snapshot.
- R05 must preserve this design.
- R05 must not serialize full permission authority into Auth.js session state.
- R05 must not trust role IDs supplied by clients.
- R05 must use AccessContext as the authorization input boundary.

# 7. Current R04 Current-Access Contract
- `getCurrentAccessResolution()` resolves the actor and workspace state.
- `getCurrentAccessContext()` returns resolved context or null.
- `requireCurrentAccessContext()` redirects for unresolved state.
- `withCurrentAccessTransaction()` resolves current access then enters `withTenantTransaction()`.
- Tenant transaction receives actor, tenant, and branch context.
- R05 should build on these helpers rather than creating parallel context-resolution code.
- Permission checks should occur after current access is resolved.
- Permission checks should occur before privileged command effects execute.
- Permission checks may occur inside the same tenant transaction when atomicity matters.

# 8. Current Database Permission Primitive
- `private.actor_has_permission(permission_code, target_tenant_id, target_branch_id)` already exists.
- It checks the current transaction-local actor.
- It joins current active user state.
- It joins current active membership state.
- It joins roles and role permissions.
- It matches canonical permission code.
- It supports tenant-wide membership semantics.
- It supports branch-aware permission evaluation.
- It is SECURITY DEFINER with fixed search path.
- Execute is granted to intended runtime/identity roles.
- R05 should prefer this primitive rather than duplicating permission SQL across application services.
- If the function requires tightening discovered from current branch tests, use a forward-only migration only for a real defect.

# 9. Canonical Permission Catalog Baseline
- Existing permission codes include `operations.staff.access`.
- Existing permission codes include `operations.kitchen.access`.
- Existing permission codes include `operations.cashier.access`.
- Existing permission codes include `management.admin.access`.
- Existing permission codes include `order.view`.
- Existing permission codes include `order.manage`.
- Existing permission codes include `service.view`.
- Existing permission codes include `service.manage`.
- Existing permission codes include `kitchen.view`.
- Existing permission codes include `kitchen.manage`.
- Existing permission codes include `merchant_payment.view`.
- Existing permission codes include `merchant_payment.collect`.
- Existing permission codes include `merchant_payment.void`.
- Existing permission codes include `menu.view`.
- Existing permission codes include `menu.manage`.
- Existing permission codes include `settings.view`.
- Existing permission codes include `settings.manage`.
- Existing permission codes include `member.view`.
- Existing permission codes include `member.invite`.
- Existing permission codes include `member.manage`.
- Existing permission codes include `role.view`.
- Existing permission codes include `role.manage`.
- Existing permission codes include `audit.view`.
- R05 must reuse canonical codes from the database/model.
- R05 must not invent free-form route-local strings when a canonical permission exists.

# 10. R05 Permission Architecture Principle
- Authentication answers: who is this actor?
- AccessContext answers: which tenant/branch scope is this actor currently allowed to operate in?
- Permission authorization answers: may this actor perform this capability in this current scope?
- These three layers must remain separate.
- Session identity must not imply workspace access.
- Workspace access must not imply all capabilities.
- Route visibility must not imply command authority.
- Permission checks must be server-authoritative.
- Database RLS must remain independent defense in depth.

# 11. Canonical Authorization Decision Type
- Introduce one canonical server-only authorization decision contract.
- Suggested names include `AuthorizationDecision` or `PermissionDecision`.
- Avoid boolean-only APIs where denial reason classification is operationally useful.
- Suggested conceptual shape:
```ts
export type PermissionDecision =
  | { status: "allowed" }
  | { status: "denied" }
  | { status: "unauthenticated" }
  | { status: "no_access" }
  | { status: "unavailable" };
```
- The exact public contract may differ if existing helpers already encode equivalent states.
- Do not expose database error detail to clients.
- Do not expose role membership details through denial responses.

# 12. Canonical Permission Evaluation Helper
- Introduce one canonical server-only helper to evaluate a permission against AccessContext.
- Suggested name: `hasPermission()` for boolean use and `authorizePermission()` for typed decision use.
- Prefer one core primitive with thin wrappers.
- Input must include AccessContext from R04.
- Input must include canonical permission code.
- Input must not accept arbitrary actor ID from client paths.
- Input must not accept arbitrary tenant/branch authority separate from AccessContext unless strongly justified.
- Permission code must be validated against a typed/canonical contract where practical.
- Database evaluation should execute under current actor/tenant/branch transaction context.
- Infrastructure errors must fail closed.

# 13. Typed Permission Code Contract
- Prefer a TypeScript union or readonly catalog derived from known canonical codes.
- Avoid magic strings scattered through routes and commands.
- Suggested module: `src/modules/identity/server/permissions.ts` or equivalent authz module.
- The exact module may reuse an existing constants surface if present.
- Type should prevent obvious typos at compile time.
- Runtime database remains source of truth for whether a role has the permission.
- Type union is not authorization authority.
- Type union is compile-time contract only.
- If permission catalog is generated or already centralized elsewhere, reuse it.

# 14. Route Authorization Principle
- Route access is a server concern.
- Client navigation visibility is UX only.
- Every protected route family must identify its required permission.
- Route guard must resolve current AccessContext.
- Route guard must evaluate required permission against current database state.
- Denied actors must not render privileged content.
- Denied actors must not receive privileged loader data.
- Route guard must not rely only on role names.
- Route guard must not rely only on pathname prefix when capability differs inside the subtree.

# 15. Route Family Baseline
- `/staff` belongs to staff operations access.
- `/kitchen` belongs to kitchen operations access.
- `/cashier` belongs to cashier operations access.
- `/admin` belongs to management/admin access.
- Exact current route tree must be re-audited before implementation.
- If route groups use different public paths, follow actual code.
- R05 must not rename routes merely for authorization convenience.
- Route permission requirements must be documented centrally enough to avoid drift.

# 16. Baseline Route Permission Mapping
- Staff operational surface should require `operations.staff.access`.
- Kitchen operational surface should require `operations.kitchen.access`.
- Cashier operational surface should require `operations.cashier.access`.
- Admin/management surface should require `management.admin.access`.
- These are baseline permissions from current catalog and fixture intent.
- Sub-routes may require additional narrower permissions.
- A route requiring both shell access and specific capability must define whether all permissions are required.
- Do not silently infer admin override unless database roles explicitly grant required permission.

# 17. Route Guard API
- Introduce a thin reusable server helper for route authorization.
- Suggested name: `requirePermission()`.
- Suggested input: permission code plus current path/next path metadata.
- It should reuse current access resolution.
- It should evaluate database permission.
- It should redirect or throw according to current server routing conventions.
- It should not duplicate workspace resolver logic.
- It should not construct AccessContext from route params.
- It should not expose raw denial reason to unauthorized users.

# 18. Route Guard Outcomes
- Unauthenticated → login flow.
- Authenticated but no valid workspace → workspace/no-access flow.
- Valid workspace but missing permission → explicit forbidden behavior.
- Infrastructure unavailable → generic unavailable behavior.
- Allowed → continue rendering.
- Distinguish forbidden from unauthenticated internally.
- Avoid redirect loops between workspace selector and forbidden page.
- Forbidden response must not reveal hidden resource details.

# 19. Forbidden UX Contract
- Provide one consistent internal forbidden state/page or status strategy.
- Exact UI path may follow current app conventions.
- Forbidden state should explain lack of access generically.
- It should offer safe navigation to an allowed area or workspace selector.
- It should allow logout.
- It must not list permissions the actor lacks unless intentionally safe.
- It must not expose role IDs or membership internals.
- It must not reveal other tenant/branch data.

# 20. Command Authorization Principle
- Every privileged mutation/command must authorize independently of route access.
- Route permission is not proof that a command invocation is authorized.
- Server actions, route handlers, domain services, and RPC-like functions must check authorization at the trusted boundary.
- Authorization should occur before side effects.
- For state-changing operations, permission evaluation should be as close as practical to the transaction containing the mutation.
- Avoid TOCTOU windows where permission is checked long before mutation.

# 21. Canonical Command Authorization Helper
- Introduce a helper for running a callback only when a permission is granted.
- Suggested name: `withAuthorizedCurrentAccessTransaction()`.
- It should resolve current AccessContext.
- It should start or reuse a tenant transaction.
- It should check the permission inside the transaction.
- It should execute callback only if allowed.
- It should return/throw a typed safe denial.
- It should keep actor/tenant/branch transaction-local.
- It should not accept client-supplied actor authority.

# 22. Atomic Authorization + Mutation
- For critical mutations, permission check and mutation should happen inside the same database transaction where feasible.
- This reduces race exposure from membership/role changes between check and write.
- If permission function reads current database state within the transaction, revocation before the transaction begins must deny.
- Concurrent revocation semantics must be documented for operations already in-flight.
- Do not promise serializable revocation guarantees unless isolation level actually provides them.
- Fail closed on transaction errors.

# 23. Read Authorization vs Mutation Authorization
- Read-only route data may use route-level permission guard plus RLS-protected queries.
- Sensitive read service calls should still authorize at service boundary when callable independently.
- Mutations must authorize at mutation boundary regardless of route.
- Avoid duplicating the exact same check unnecessarily inside tightly composed private functions.
- Public/exported server entry points must each establish authorization.

# 24. Permission Composition Rules
- Define whether a capability requires one permission or multiple.
- Prefer explicit `allOf`/`anyOf` composition helpers if multi-permission cases exist.
- Do not implement implicit role-superuser rules in application code.
- Admin capability should come from permissions assigned to the admin role.
- Any bypass role must be an explicit database/policy design, not a string comparison.
- Denied permissions remain denied even if UI labels suggest broader role title.

# 25. Suggested Authorization Module Layout
```text
apps/web/next-flow/src/modules/identity/server/
  permissions.ts
  permission-repository.ts            # only if useful separation from DB helper call
  authorize-permission.ts
  route-authorization.ts              # optional if route-specific wrapper earns its existence
  command-authorization.ts            # optional if transaction wrapper is separated
```
- Reuse existing identity server module unless a dedicated `authorization/` submodule is already canonical.
- Do not create duplicate abstractions with overlapping responsibility.
- Keep server-only imports.

# 26. Existing Files to Re-Audit Before Implementation
```text
apps/web/next-flow/src/auth.ts
apps/web/next-flow/src/auth.config.ts
apps/web/next-flow/src/proxy.ts
apps/web/next-flow/src/lib/auth/session.ts
apps/web/next-flow/src/modules/identity/server/access-context.ts
apps/web/next-flow/src/modules/identity/server/current-access.ts
apps/web/next-flow/src/modules/identity/server/resolve-access-context.ts
apps/web/next-flow/src/modules/identity/server/workspace-repository.ts
apps/web/next-flow/src/modules/identity/server/index.ts
apps/web/next-flow/src/server/db/context.ts
apps/web/next-flow/src/server/db/transaction.ts
apps/web/next-flow/src/app/(operations)/layout.tsx
apps/web/next-flow/src/app/(management)/layout.tsx
apps/web/next-flow/src/app/(auth)/workspace/page.tsx
apps/web/next-flow/src/app/api/auth/workspace/route.ts
apps/web/next-flow/tests/fixtures/identity.ts
apps/web/next-flow/tests/integration/workspace-access-contract.test.ts
supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql
supabase/migrations/20260823130000_p02_r04_workspace_access_boundary.sql
supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql
supabase/tests/database/p02_r04_workspace_access_context.test.sql
```
- Also inspect actual route/command files present on latest R04 branch.

# 27. Files to CREATE — Core Authorization
- Expected candidate: `src/modules/identity/server/permissions.ts`.
- Responsibility: canonical typed permission identifiers.
- Expected candidate: `src/modules/identity/server/authorize-permission.ts`.
- Responsibility: evaluate permission against AccessContext.
- Expected candidate: `src/modules/identity/server/require-permission.ts`.
- Responsibility: server route/entry guard behavior.
- Expected candidate: `src/modules/identity/server/authorized-transaction.ts`.
- Responsibility: atomic permission check + callback transaction.
- Exact names may consolidate when one module is clearer.
- Avoid creating four files if two cohesive modules are sufficient.

# 28. Files to MODIFY — Identity Server Barrel
- `src/modules/identity/server/index.ts` likely needs exports for authorization helpers/types.
- Do not export secret/internal database implementation details to client code.
- Preserve server-only boundary.
- Avoid creating cyclic imports between current-access and authorization modules.

# 29. Files to MODIFY — Operations Layout
- `src/app/(operations)/layout.tsx` currently requires current access context on R04 branch.
- R05 must determine whether the common operations layout should require a baseline permission or only child layouts/routes should.
- Staff, kitchen, and cashier have distinct capability requirements.
- Do not use one common operations permission if it would incorrectly grant cross-surface access.
- Prefer route-family-specific guards where necessary.

# 30. Files to MODIFY — Management Layout
- `src/app/(management)/layout.tsx` should require management/admin capability where it covers admin surfaces exclusively.
- If management layout contains routes with distinct permissions, apply narrower checks at child boundaries.
- Do not infer ownership from path alone if permission model says otherwise.

# 31. Files to MODIFY — Staff Surface
- Inspect actual staff route/layout path.
- Require `operations.staff.access` at the nearest stable server boundary.
- Sensitive staff commands may require `order.manage`, `service.manage`, or other specific permissions in addition.
- Route shell permission does not replace command permissions.

# 32. Files to MODIFY — Kitchen Surface
- Inspect actual kitchen route/layout path.
- Require `operations.kitchen.access` at the route-family boundary.
- Kitchen read operations may require `kitchen.view` where independently callable.
- Kitchen mutations/state transitions should require `kitchen.manage`.
- Do not grant cashier capability to kitchen role merely to simplify shared UI.

# 33. Files to MODIFY — Cashier Surface
- Inspect actual cashier route/layout path.
- Require `operations.cashier.access` at route-family boundary.
- Payment read should require `merchant_payment.view` where applicable.
- Payment collection should require `merchant_payment.collect`.
- Payment void should require `merchant_payment.void`.
- Financial mutations require strict server-side checks.
- R05 does not implement new payment provider functionality.

# 34. Files to MODIFY — Admin Surface
- Require `management.admin.access` for admin shell where appropriate.
- Member administration commands should use member permissions.
- Role administration commands should use role permissions.
- Settings commands should use settings permissions.
- Menu configuration commands should use menu permissions.
- Audit access should use `audit.view`.
- Do not assume admin shell permission automatically replaces all command permissions unless database role grants them.

# 35. Files to MODIFY — Command Endpoints
- Enumerate actual route handlers/server actions/services that mutate protected domain state.
- Add canonical permission checks at each trusted entry point in R05 scope.
- Do not touch unrelated customer/public commands.
- Do not authorize based on hidden form role values.
- Do not authorize based on client-rendered button state.

# 36. Files to MOVE
- No file move expected by default.
- Move only if current authorization logic is duplicated and consolidation materially improves correctness.
- Do not perform cosmetic folder reorganization.

# 37. Files to REMOVE
- No implementation file removal expected by default.
- R06 owns legacy-auth physical removal.
- R05 may remove obsolete route-local authorization snippets only if fully replaced by canonical R05 helper and clearly within scope.
- Do not remove rollback-only legacy session/token files.

# 38. Files Explicitly NOT to Touch by Default
```text
apps/web/next-flow/src/modules/identity/server/password-verifier.ts
apps/web/next-flow/src/modules/identity/server/credential-repository.ts
apps/web/next-flow/src/modules/identity/server/login-throttle.ts
apps/web/next-flow/src/modules/identity/server/authenticate-internal-user.ts
```
- R05 should not alter credential authentication semantics.
- Touch only for a concrete compile/integration defect discovered on parent branch.

# 39. Database Schema Default
- R05 should require no new core table by default.
- Existing permissions, roles, role_permissions, memberships, users, and branches already model required authority.
- Existing `private.actor_has_permission()` already provides canonical evaluation.
- Do not add a duplicate permission table.
- Do not add a duplicate role table.
- Do not add a route-permission database table unless current product requirements clearly need dynamic route mapping and it materially belongs here.

# 40. Migration Policy
- Forward-only migration only if a real database invariant/helper defect is identified.
- Never rewrite historical migrations.
- No migration solely to rename a permission string cosmetically.
- No production destructive mutation.
- Clean reset must remain possible when migration is added.
- Generated type impact must be handled if schema changes.

# 41. Permission Function Security
- Keep fixed search path.
- Keep narrow execute grants.
- Do not grant broad direct reads to permission/membership tables solely for application convenience.
- Preserve current actor transaction context.
- Do not accept actor ID as a trusted arbitrary parameter when transaction-local actor can be used.
- Negative privilege tests must prove public/anon cannot invoke privileged helper if current grant model forbids them.

# 42. Role Authority Rules
- Role ID in AccessContext is server-derived metadata.
- Role ID alone must not be interpreted as permission grant in application code.
- Permission relation in database is authoritative.
- Role name strings must not be authorization logic.
- Role changes must take effect on next permission evaluation.
- Removed permission from a role must take effect without new login.

# 43. Membership Freshness Rules
- R04 already revalidates membership for AccessContext.
- Permission helper independently checks active membership in current DB function baseline.
- R05 must preserve this defense in depth.
- A revoked membership must fail either context resolution or permission evaluation.
- Do not cache authorization longer than can safely reflect revocation semantics.

# 44. Permission Freshness Rules
- Avoid storing permissions in JWT/session.
- Avoid storing permissions in long-lived client state as authority.
- Avoid long-lived server cache unless invalidation semantics are explicit.
- Default is live database evaluation for privileged operations.
- Route shell checks may be repeated per request.
- Performance optimization must not silently weaken revocation freshness.

# 45. Branch Semantics
- Permission evaluation must use AccessContext branch.
- Branch-bound membership cannot authorize sibling branch.
- Tenant-wide membership may authorize a branch when role has permission.
- Tenant-wide context with branch null must only be used for tenant-scoped capabilities where permitted.
- Commands requiring branch scope must fail if branch is absent.
- Do not auto-select branch inside permission helper; R04 owns selection.

# 46. Tenant Semantics
- Permission evaluation must use current AccessContext tenant.
- Cross-tenant IDs from command payload are not authority.
- If command resource contains tenant_id, verify it matches transaction/RLS context.
- RLS should independently reject cross-tenant data.
- Application permission denial should occur before revealing resource existence where practical.

# 47. Resource-Level Authorization Boundary
- R05 is primarily capability permission enforcement.
- Resource ownership/state constraints still matter.
- Permission `order.manage` does not authorize managing an order in another tenant/branch.
- Tenant/branch RLS and resource queries enforce resource scope.
- Where a command targets a specific resource, load it inside authorized tenant transaction.
- Do not perform unrestricted prefetch before authorization.

# 48. Server/Client Boundary
- Authorization helpers remain server-only.
- Client components may receive booleans for UX affordances but never as sole enforcement.
- Client may hide buttons based on safe server-projected capability hints.
- Server command must recheck permission.
- Do not expose full permission matrix unnecessarily.
- Do not serialize role_permissions join data to browser unless a concrete UX requires it.

# 49. Capability Projection for UX
- Optional server projection may expose a minimal set of booleans needed by current page.
- Example: `canManageKitchen`.
- Projection must be computed server-side.
- Projection is display/UX hint only.
- Server mutation must reauthorize.
- Prefer per-page needed capabilities over shipping all permissions.

# 50. Permission Check Error Taxonomy
- Invalid permission code is programmer/configuration error.
- Missing AccessContext is access-state error.
- Permission denied is expected authorization result.
- Database unavailable is infrastructure failure.
- Malformed server context is internal failure.
- Do not map all errors to allowed=false silently if that hides operational outages in logs.
- Public response must still fail closed.

# 51. Authorization Denial Error
- Consider a typed `AuthorizationDeniedError` for internal command/service flow.
- It should not include secrets.
- It should not include raw SQL.
- It may include safe permission code for server logs where policy permits.
- Client-facing response should remain generic.
- Avoid logging full actor/session token.

# 52. Infrastructure Failure Behavior
- Permission database error must never grant access.
- Route should show generic unavailable or fail safely.
- Command should abort without mutation.
- Transaction should roll back.
- Logs may contain safe structured error category.
- Retry behavior depends on idempotency of command.

# 53. Enumeration Resistance
- Forbidden route should not reveal whether another tenant resource exists.
- Command denial should avoid distinguishing “resource exists but unauthorized” from absent where that leaks sensitive data.
- Permission helper should not return other actors' membership details.
- API should not echo role/permission matrices on denial.

# 54. Secret Handling
- No new secret expected for R05.
- Do not add permission secrets/environment toggles as authority.
- Do not log Auth.js token/cookie.
- Do not log credential hashes.
- Do not log raw Authorization/Cookie headers.
- No production secret belongs in tests.

# 55. Audit / Observability Objective
- Authorization decisions on sensitive mutations should be observable enough to debug and investigate.
- Avoid logging every successful low-risk page view if noisy.
- Denials on privileged commands may warrant structured audit/log event.
- Existing audit schema should be reused if appropriate.
- Do not create a parallel audit system.
- Do not log sensitive payload fields unnecessarily.

# 56. Permission Denial Audit Contract
- If audit events already support privileged denial recording, reuse them.
- Minimum safe fields may include actor ID, tenant ID, branch ID, permission code, action identifier, result=denied, timestamp.
- Do not include password/session token.
- Do not include full payment card data.
- Audit write failure must not cause authorization to become allowed.
- Decide whether denial audit is best-effort or transactional based on current audit architecture.

# 57. Successful Mutation Audit Contract
- Existing business/audit event mechanisms remain authoritative.
- R05 should not duplicate domain audit events.
- Authorization helper itself should not emit redundant successful audit for every command unless current architecture expects it.
- Command layer can combine authorization evidence with domain event where appropriate.

# 58. Command Idempotency Interaction
- Authorization denial must not consume an idempotency key as a successful operation.
- If idempotency layer exists, authorization should occur before irreversible side effects.
- Retried authorized command must preserve existing idempotency semantics.
- R05 must not invent new idempotency system unrelated to authz.

# 59. Concurrency — Role Revocation
- Role permission may be removed while actor is using the app.
- Next permission check must reflect current database state.
- An already-started transaction may observe state according to database isolation semantics.
- Do not claim instantaneous cancellation of in-flight transaction unless explicitly implemented.
- New commands after revocation must fail.

# 60. Concurrency — Membership Revocation
- R04 context resolution should fail after revocation.
- R05 permission function also checks active membership in current baseline.
- New permission checks after revocation must fail.
- Existing in-flight mutation semantics must be documented honestly.
- No stale JWT permission snapshot may bypass revocation.

# 61. Concurrency — Workspace Change
- User may switch branch/workspace between requests.
- Permission check uses AccessContext for the current request/selection.
- A stale selection must be rejected by R04 before R05 evaluation.
- Commands should not carry trusted workspace from old client state.
- Multi-tab behavior remains safe because each request revalidates.

# 62. Transaction Boundary for Commands
- Preferred flow:
```text
Auth.js session actor
→ R04 current AccessContext
→ begin tenant transaction
→ evaluate permission in same transaction
→ load target resource under RLS
→ validate domain state
→ mutate
→ emit domain/audit event if required
→ commit
```
- Failure at any authorization/domain step aborts mutation.

# 63. Read Route Flow
```text
Auth.js session actor
→ R04 current AccessContext
→ require route permission
→ run RLS-constrained read
→ render safe data
```
- Permission should be evaluated before expensive/sensitive reads where practical.
- RLS remains backstop.

# 64. Public Route Boundary
- Customer direct-entry routes remain public unless existing product rules say otherwise.
- R05 must not globally require internal permissions for customer menu/order entry.
- Auth route remains public as required for login.
- Workspace selector requires authentication but not a product capability beyond current membership access.
- Forbidden page remains safely reachable by authenticated denied actors.

# 65. Proxy Boundary
- R03 proxy/Auth.js authorized callback is coarse authentication authority.
- R05 should not move database permission checks into edge/proxy if runtime compatibility is unsafe.
- Prefer server layout/route/service permission checks where database runtime is supported.
- Proxy may continue coarse authentication gate.
- Do not duplicate database authorization in proxy.

# 66. Next.js Runtime Constraints
- Current app uses Next.js 16.3.0 per existing R03/R04 context.
- Implementation must read installed local Next.js docs before changing layouts, route handlers, server actions, redirects, or proxy.
- Do not assume historical behavior.
- Keep server/client module boundaries valid.
- Build must validate resulting route structure.

# 67. Route Guard Placement Strategy
- Put checks at the highest boundary that is both correct and not over-broad.
- Staff-only layout can guard staff access.
- Kitchen-only layout can guard kitchen access.
- Cashier-only layout can guard cashier access.
- Admin-only layout can guard admin access.
- Mixed layout must not apply one permission to unrelated children.
- Narrow child route checks remain valid for specific capabilities.

# 68. Avoiding Double Redirect Loops
- `requireCurrentAccessContext()` may redirect to workspace.
- `requirePermission()` may redirect/render forbidden.
- Workspace route must not itself require a product permission that sends user back to workspace.
- Forbidden page must not require the same denied permission.
- Login and logout routes remain outside permission guard loops.

# 69. Safe Next Path Behavior
- Reuse existing `sanitizeInternalPath()`.
- Forbidden flow should preserve only safe internal destinations when appropriate.
- Do not allow external redirect via permission denial handling.
- Do not trust client-provided `next` blindly.
- Tests must cover protocol-relative and external URLs.

# 70. Route Permission Registry Option
- A small typed route-to-permission registry may reduce duplication if route topology supports it.
- Do not create a dynamic general-purpose authorization framework unnecessarily.
- Static mapping is preferable when route set is small and stable.
- Registry must not replace server enforcement.
- Registry should use canonical permission constants.

# 71. Command Permission Registry Option
- Domain commands may define required permission near command implementation.
- Avoid giant central map if it obscures ownership.
- Prefer capability requirement colocated with trusted command entry point.
- Shared command wrappers may accept typed permission code.
- Tests should ensure each high-risk command has an explicit requirement.

# 72. Staff Command Baseline
- Order read: `order.view` where applicable.
- Order mutation: `order.manage`.
- Service request read: `service.view`.
- Service request mutation: `service.manage`.
- Staff shell: `operations.staff.access`.
- Exact current command inventory must be re-audited.

# 73. Kitchen Command Baseline
- Kitchen shell: `operations.kitchen.access`.
- Kitchen read: `kitchen.view`.
- Kitchen state mutation: `kitchen.manage`.
- Order read required by KDS may also require `order.view` if current role grants it.
- Do not require cashier permissions for kitchen actions.

# 74. Cashier Command Baseline
- Cashier shell: `operations.cashier.access`.
- Merchant payment read: `merchant_payment.view`.
- Collect payment: `merchant_payment.collect`.
- Void payment: `merchant_payment.void`.
- Financial state transitions must fail closed and roll back on denial.
- Do not change payment provider integration in R05.

# 75. Menu Management Baseline
- View menu configuration: `menu.view`.
- Change menu configuration: `menu.manage`.
- Public customer menu read remains separate from internal configuration authority.
- Do not accidentally require internal `menu.view` for public storefront rendering.

# 76. Settings Baseline
- View settings: `settings.view`.
- Modify settings: `settings.manage`.
- Secret/config values remain server-side.
- Permission to view settings does not imply ability to edit.

# 77. Member Management Baseline
- View members: `member.view`.
- Invite members: `member.invite`.
- Modify/revoke memberships: `member.manage`.
- Self-elevation prevention from earlier RLS/security work must remain green.
- A manager with member.manage must still remain tenant-scoped.

# 78. Role Management Baseline
- View roles: `role.view`.
- Modify roles or role-permission assignment: `role.manage`.
- Role changes are high-impact privileged actions.
- Cross-tenant role modification must fail.
- Self-escalation scenarios require explicit negative tests.

# 79. Audit Baseline
- View audit events: `audit.view`.
- Audit query remains tenant/branch scoped by RLS/context.
- Do not expose audit events to staff lacking permission.
- Audit permission does not authorize mutation of audit history.

# 80. Permission Input Validation
- Permission codes used by code should come from typed constants.
- If an internal generic endpoint accepts permission code, validate against canonical set.
- Public clients should not choose arbitrary permission to test.
- Avoid creating a permission-probing API.

# 81. Authorization API Non-Goal
- Do not create `/api/can-i?permission=...` general endpoint by default.
- Such endpoint can become an enumeration surface and unnecessary chatter.
- Page-specific capability projection is safer when UX needs hints.
- Server command remains final authority.

# 82. Resource Existence Leakage
- If user lacks permission, avoid querying unrestricted target then returning forbidden.
- Prefer authorize first, then load under RLS.
- If authorization requires resource branch, derive it under safe tenant context and avoid exposing unauthorized metadata.
- R05 should not weaken existing RLS to simplify resource lookup.

# 83. Permission Caching Default
- No long-lived permission cache by default.
- No permission list in Auth.js JWT.
- No localStorage permission cache as authority.
- Request-local memoization is acceptable when it cannot outlive request context.
- If multiple checks use same permission/context, request-local dedupe may reduce DB calls.

# 84. Request-Local Memoization Safety
- Key by actor, tenant, branch, permission.
- Keep within request lifecycle.
- Do not share across actors.
- Do not share across tenants.
- Do not share across branch selection changes.
- Do not use process-global Map without explicit eviction/context isolation.

# 85. Performance — Permission Query Budget
- One DB check per unique permission/context per request is acceptable baseline.
- Avoid N+1 permission checks in lists.
- Do not prefetch entire permission catalog merely to avoid a few checks unless measured need exists.
- Command path should favor correctness over micro-optimization.

# 86. Performance — Role Permission Index Audit
- Inspect existing indexes/constraints on `role_permissions.role_id` and permission keys.
- Do not add duplicate indexes.
- Add migration only if actual query plan/schema lacks expected support.
- Any index addition must be justified in implementation PR.

# 87. Database Constraint Audit
- Role belongs to tenant.
- Membership role belongs to same tenant.
- Role-permission links reference valid role and permission.
- Existing constraints should already enforce most relations.
- R05 must not duplicate application-only invariants when DB can enforce existing ones.
- Add constraint only for a concrete discovered gap in R05 scope.

# 88. Authorization Helper Result Contract
- Allowed should be explicit.
- Denied should be explicit.
- Infrastructure unavailable should not be confused with denied in logs.
- Client-facing result may intentionally collapse details.
- Route and command wrappers may map typed result differently.

# 89. Route Denial HTTP Semantics
- Server-rendered app may use redirect or 403-style page according to current Next.js conventions.
- API route should use appropriate 401/403 distinction internally where safe.
- Avoid redirecting JSON mutation requests to HTML login unexpectedly if current API conventions use status codes.
- Keep transport-specific behavior separate from core permission decision.

# 90. Command Denial Contract
- No domain mutation.
- No partial writes.
- Safe generic forbidden response/error.
- No sensitive resource data in response.
- Optional safe audit/log record.
- Idempotent retry after permission grant should remain possible when command semantics allow.

# 91. Permission Evaluation Infrastructure Failure
- No domain mutation.
- Return generic unavailable/500-style safe result depending transport.
- Log structured internal error.
- Do not downgrade to allow.
- Do not use stale client capability hint.

# 92. RLS Interaction
- Application permission checks provide capability-level enforcement.
- RLS provides tenant/branch/actor data isolation.
- One must not replace the other.
- Permission allowed does not bypass RLS.
- RLS allowed does not imply command permission.
- Tests should prove both layers independently.

# 93. Database Role Context
- Permission evaluation under `flow_runtime` should see current actor/tenant/branch config.
- `private.actor_has_permission()` uses current actor helper.
- Keep transaction-local settings.
- Do not switch to owner/superuser connection for permission checks.
- Context leakage tests remain required.

# 94. Least Privilege
- No broad grants to app tables for convenience.
- No direct client database permission queries.
- No service-role secret in browser.
- No bypass RLS role for ordinary commands.
- Keep SECURITY DEFINER functions narrow.
- Revoke public execute where applicable.

# 95. Self-Elevation Threat Model
- Actor with member.manage must not assign themselves arbitrary role if role-management permission is separately required.
- Actor with role.manage remains tenant-scoped.
- Staff cannot modify role_permissions through unguarded command.
- Client cannot submit a role ID and bypass permission check.
- RLS and server command auth must both protect mutation surfaces.

# 96. Confused Deputy Threat Model
- A server helper receiving tenant/branch from client must not act on it without R04 context validation.
- Permission helper must use trusted AccessContext.
- Command service must not mix actor A session with actor B payload authority.
- Background/server tasks with no user actor require separate future/service authorization design and are out of R05 unless already present.

# 97. CSRF / Request Integrity
- Continue using framework/Auth.js protections for relevant forms/actions.
- Authorization does not replace CSRF protection.
- Mutating route handlers must follow current request validation conventions.
- Do not accept GET for privileged mutations.
- R05 should not weaken SameSite/cookie protections.

# 98. XSS / UI Safety
- Permission denial messages should escape user-provided content.
- Do not echo raw route/query values in HTML unsafely.
- Authorization metadata sent to client should be plain safe values.
- R05 is not a general XSS refactor round.

# 99. SQL Injection Safety
- Use Kysely parameterization or existing safe SQL templates.
- Permission code must be parameterized.
- Do not interpolate raw permission string into SQL text.
- Database helper calls should use typed parameter binding.

# 100. Logging Redaction
- Log actor UUID only when appropriate.
- Tenant/branch UUIDs may be logged as operational identifiers where policy allows.
- Permission code may be logged.
- Do not log session token.
- Do not log cookie value.
- Do not log password/hash.
- Do not log sensitive payment payload.

# 101. Audit Event Integrity
- Audit events should be append-oriented according to existing audit design.
- Authorization code must not permit actor to alter historical audit rows.
- RLS/grants must remain restrictive.
- Denial audit must not introduce recursive permission dependency.

# 102. Test Fixture Roles
- Owner A baseline has management/admin-related permissions.
- Staff A1 baseline has staff/order view capability.
- Staff A2 provides sibling branch case.
- Kitchen A1 has kitchen capability.
- Cashier A2 has cashier/payment collection capability.
- Staff B1 provides cross-tenant case.
- No-membership actor authenticates but has no workspace.
- Invited/suspended/revoked personas remain denial cases.
- Reuse R02/R04 fixture identities.

# 103. Route Matrix Test — Owner A
- Owner A can reach admin route when role grants `management.admin.access`.
- Owner A can reach allowed tenant/branch workspace.
- Owner A denied from capability not granted by role if fixture intentionally lacks it.
- Test database state, not hard-coded “owner always allowed” assumption.

# 104. Route Matrix Test — Staff A1
- Staff A1 can reach `/staff` in A1.
- Staff A1 cannot reach `/kitchen` unless role actually has kitchen access.
- Staff A1 cannot reach `/cashier` unless role actually has cashier access.
- Staff A1 cannot reach `/admin` without management permission.
- Staff A1 cannot switch to A2 and gain access.

# 105. Route Matrix Test — Kitchen A1
- Kitchen A1 can reach kitchen surface.
- Kitchen A1 cannot reach cashier surface.
- Kitchen A1 cannot reach admin surface.
- Kitchen A1 remains A1-scoped.
- Kitchen permission changes reflect on next request.

# 106. Route Matrix Test — Cashier A2
- Cashier A2 can reach cashier surface.
- Cashier A2 cannot reach kitchen surface.
- Cashier A2 cannot reach admin surface.
- Cashier A2 remains A2-scoped.
- Payment collect permission is independently tested at command layer.

# 107. Route Matrix Test — Staff B1
- Staff B1 can reach authorized Tenant B staff surface.
- Staff B1 cannot operate Tenant A workspace.
- Tenant A route payload/resource IDs remain inaccessible under B1 context.
- Cross-tenant selector remains denied by R04.
- Permission check remains scoped to Tenant B.

# 108. Command Matrix Test — Orders
- Actor with `order.view` may read appropriate scoped order data.
- Actor lacking `order.view` denied from protected internal read path.
- Actor with `order.manage` may perform allowed order mutation.
- Actor lacking `order.manage` cannot mutate even if route is visible.
- Wrong-branch order remains denied by RLS/context.
- Cross-tenant order remains denied.

# 109. Command Matrix Test — Service Requests
- `service.view` gates sensitive internal read.
- `service.manage` gates mutation.
- Staff role behavior must match fixture permission assignment.
- Cross-branch requests cannot be mutated by sibling-branch staff.

# 110. Command Matrix Test — Kitchen
- `kitchen.view` gates KDS read where applicable.
- `kitchen.manage` gates state transition.
- Cashier lacking kitchen.manage cannot mutate ticket.
- Staff lacking kitchen.manage cannot mutate unless role grants it.
- Wrong-branch ticket remains denied.

# 111. Command Matrix Test — Merchant Payments
- `merchant_payment.view` gates payment read.
- `merchant_payment.collect` gates collection.
- `merchant_payment.void` gates void.
- Cashier collect permission does not imply void unless role grants both.
- Kitchen/staff personas without payment permission are denied.
- Denied financial mutation produces no payment state change.

# 112. Command Matrix Test — Menu
- `menu.view` gates internal menu settings read.
- `menu.manage` gates change.
- Public menu remains unaffected.
- Staff without manage cannot mutate via direct API call.

# 113. Command Matrix Test — Settings
- `settings.view` and `settings.manage` remain separate.
- Direct mutation endpoint must enforce manage.
- UI hidden button is not enough.
- Cross-tenant settings target denied.

# 114. Command Matrix Test — Memberships
- `member.view` gates list/detail.
- `member.invite` gates invitation command.
- `member.manage` gates status/scope changes.
- Cross-tenant membership target denied.
- Self-elevation protections remain intact.

# 115. Command Matrix Test — Roles
- `role.view` gates role inspection.
- `role.manage` gates role/permission mutation.
- Cross-tenant role target denied.
- Staff without role.manage cannot alter role permissions via direct call.
- Role mutation takes effect on next permission evaluation.

# 116. Command Matrix Test — Audit
- `audit.view` gates audit read.
- Actors lacking audit.view cannot enumerate events.
- Branch/tenant RLS remains in effect.
- No audit mutation capability is introduced.

# 117. Negative Authorization Matrix
- authenticated + valid workspace + missing permission = deny.
- authenticated + no workspace = deny before permission.
- unauthenticated = deny/login.
- malformed context = deny.
- cross-tenant target = deny.
- sibling-branch target = deny.
- revoked membership = deny.
- suspended membership = deny.
- inactive user = deny.
- removed role permission = deny.
- client-forged role ID = ignored/deny.
- client-forged permission list = ignored/deny.
- client-forged actor ID = ignored/deny.

# 118. Permission Typo Test
- Unknown permission constant should fail typecheck where typed catalog is used.
- Runtime unknown code should evaluate denied or programmer error safely, never allowed.
- Do not silently create permissions at runtime.
- Database seed/migration remains source for canonical permission rows.

# 119. Unit Tests — Permission Composition
- single allowed permission.
- single denied permission.
- allOf all allowed.
- allOf one denied.
- anyOf one allowed.
- anyOf all denied.
- unavailable dependency fails closed.
- malformed permission input rejected if runtime parser exists.

# 120. Unit Tests — Route Guard Mapping
- staff route maps to staff access.
- kitchen route maps to kitchen access.
- cashier route maps to cashier access.
- admin route maps to management access.
- public routes map to no internal permission requirement.
- unknown route behavior is explicit if registry exists.

# 121. Unit Tests — Error Mapping
- unauthenticated maps to login behavior.
- no access maps to workspace/no-access behavior.
- denied maps to forbidden.
- unavailable maps to generic unavailable.
- allowed proceeds.
- no raw internal error reaches client response.

# 122. Integration Tests — Permission Database
- `private.actor_has_permission()` returns expected fixture results.
- owner manager permission works in Tenant A.
- staff A1 staff permission works A1.
- staff A1 denied A2.
- kitchen A1 kitchen permission works A1.
- cashier A2 payment collect works A2.
- cashier A2 denied kitchen permission.
- staff B1 denied Tenant A permission.

# 123. Integration Tests — Current Access + Permission
- resolve AccessContext through R04 helper.
- evaluate permission using resolved context.
- no duplicate client authority injected.
- revoked membership after prior success becomes denied on next call.
- role permission change becomes visible on next call.
- context values remain transaction-local.

# 124. Integration Tests — Authorized Transaction
- allowed permission executes callback.
- denied permission never executes callback.
- callback throw rolls back mutation.
- permission query failure never executes callback.
- wrong branch never executes callback.
- cross-tenant target remains RLS denied.

# 125. Integration Tests — Route Server Boundary
- protected layout rejects valid-session wrong-role actor.
- allowed actor renders route.
- no-workspace actor goes to workspace/no-access.
- unauthenticated actor goes login.
- permission denial does not expose protected loader data.

# 126. E2E Tests — Staff/Kitchen/Cashier/Admin
- Login as Staff A1 and verify staff allowed.
- Verify kitchen/cashier/admin denied for Staff A1 unless fixture says otherwise.
- Login as Kitchen A1 and verify kitchen allowed.
- Login as Cashier A2 and verify cashier allowed.
- Login as Owner A and verify admin allowed.
- Preserve safe workspace selection behavior.
- Use synthetic test credentials only.

# 127. E2E Tests — Direct Navigation
- Direct URL to unauthorized route is denied.
- Hidden nav link absence is not the only proof.
- Browser back/forward does not bypass server guard.
- Stale rendered UI after revocation cannot successfully mutate.
- Reload reflects updated permissions.

# 128. API / Server Action Direct Invocation Tests
- Direct POST to privileged endpoint without permission denied.
- Correct route access is not required to invoke test; server auth itself must deny.
- Forged tenant/branch payload cannot bypass current context.
- Forged role/permission fields ignored.
- Denied mutation leaves DB unchanged.

# 129. Concurrency Test — Permission Revocation
- Start with permission granted.
- Prove allowed command.
- Remove permission/role mapping in isolated test setup.
- Next command denied.
- Restore fixture state safely.
- No session refresh required for denial to take effect.

# 130. Concurrency Test — Membership Revocation
- Start with valid AccessContext and permission.
- Revoke membership.
- Next current-access/permission path denies.
- No stale workspace cookie grants command authority.
- Restore test fixture state.

# 131. Rollback Test
- Authorized transaction starts.
- Domain callback performs temporary write.
- Callback throws.
- Transaction rolls back.
- Authorization audit behavior follows chosen transactional policy.
- No partial business state remains.

# 132. Context Leakage Test
- Actor A/Tenant A/Branch A1 permission check completes.
- Reuse pool for Actor B/Tenant B/Branch B1.
- B must not inherit A context.
- Tenant setting must reset.
- Branch setting must reset.
- Actor setting must reset.
- Database role must reset.

# 133. RLS Regression Requirements
- P01/R04 actor authorization suite remains green.
- R02 tenant/branch authorization suite remains green.
- R04 workspace access SQL suite remains green.
- New R05 permission tests should complement, not replace, those suites.
- Self-elevation denial remains green.

# 134. Authentication Regression Requirements
- R01 normalization/verifier/throttle tests remain green.
- R03 Auth.js credentials flow remains green.
- Session actor UUID remains unchanged.
- Login does not begin embedding permissions.
- Logout still clears relevant session/workspace state.

# 135. Workspace Regression Requirements
- R04 zero/one/multiple workspace behavior remains green.
- Stale selection recovery remains green.
- Cross-tenant selection denial remains green.
- Sibling branch denial remains green.
- R05 must not duplicate or break workspace selector logic.

# 136. Database Migration Tests If Migration Added
- Clean reset applies all migrations.
- New function/constraint exists.
- Grants are narrow.
- Public/anon denied where appropriate.
- Existing permission behavior remains correct.
- Generated types regenerated only if schema surface changes.

# 137. No-Migration Validation If No Schema Change
- Explicitly record `SCHEMA_CHANGED: NO`.
- Explicitly record `NEW_MIGRATION: NO`.
- Confirm existing database helper suffices.
- Do not create empty/no-op migration.

# 138. Validation Commands — Application
- Inspect actual `package.json` scripts on implementation parent.
- Run lint.
- Run typecheck.
- Run unit tests.
- Run relevant integration tests.
- Run Next.js build.
- Run relevant E2E subset.
- Record actual results in implementation PR.
- This specification task does not execute these as document-validation proof.

# 139. Validation Commands — Database
- Run local Supabase reset when database scope changes or DB regression suite requires it.
- Run R05 SQL tests if added.
- Run inherited R01/R02/R04/P01-R04 SQL suites.
- Run DB lint if functions/policies change.
- Run generated-type drift check if schema changes.
- Record actual results truthfully.

# 140. Validation Vocabulary
- `PASS`.
- `FAIL`.
- `NOT RUN`.
- `BLOCKED`.
- `NOT APPLICABLE`.
- Never fabricate PASS.
- This vocabulary governs future implementation evidence.

# 141. Expected Files to CREATE — Tests
```text
apps/web/next-flow/tests/unit/permission-authorization.test.ts
apps/web/next-flow/tests/unit/route-permission-map.test.ts               # if registry introduced
apps/web/next-flow/tests/integration/permission-authorization-contract.test.ts
apps/web/next-flow/tests/integration/authorized-command-transaction.test.ts
```
- Exact split may adapt to current test conventions.
- Avoid duplicate test files for the same layer.

# 142. Expected Files to MODIFY — Tests
- Existing identity fixture may only need new role/permission case if required.
- Existing workspace integration suite should remain focused; extend only if one R05 cross-layer case belongs naturally there.
- E2E auth helper may need capability-specific user login convenience.
- Do not expose test credentials beyond test-only files.

# 143. Potential SQL Test File
```text
supabase/tests/database/p02_r05_permission_enforcement.test.sql
```
- Add when SQL-level permission/grant behavior deserves direct proof.
- Do not add SQL test merely to increase test count.
- Application route mapping belongs in TypeScript tests, not SQL.

# 144. Permission Matrix Source of Truth
- Database permission rows are authoritative capability identifiers.
- Role-permission assignments define grants.
- Application typed constants mirror identifiers for compile-time safety.
- Tests must catch drift between typed constants and expected DB rows when practical.
- Do not maintain two independently editable permission catalogs without drift test.

# 145. Permission Catalog Drift Test
- Query expected permission codes in DB integration test.
- Compare with typed application catalog if catalog is exhaustive.
- Missing DB permission should fail test.
- Unexpected DB permission may be allowed only if catalog intentionally partial; document design.
- Prefer exhaustive catalog when practical in Phase 02.

# 146. Role Permission Matrix Test
- Manager expected capabilities.
- Staff expected capabilities.
- Kitchen expected capabilities.
- Cashier expected capabilities.
- Cross-role forbidden capabilities.
- Cross-tenant role assignment denied.
- Use R02 fixtures.

# 147. Admin Override Non-Rule
- Do not implement `if role === admin then allow all`.
- Manager/admin role must have explicit permission links.
- This keeps permission catalog auditable.
- It prevents hidden privilege outside DB authority.
- Tests should prove a missing permission remains denied even for an admin-labeled role if fixture is adjusted accordingly.

# 148. Permission Removal Semantics
- Removing role_permission revokes capability on next evaluation.
- No new login required.
- No workspace reselection required unless membership itself changed.
- Client button may remain temporarily stale but server command denies.
- Page reload/server render should reflect denial.

# 149. Role Reassignment Semantics
- R04 AccessContext carries roleId from current membership resolution.
- Permission function independently joins current membership role baseline.
- If role changes, new permission evaluation should reflect current DB role.
- Avoid trusting stale roleId if database helper can derive current role from actor/membership context.
- If helper uses roleId optimization, revalidate it against current membership.

# 150. Membership ID Semantics
- AccessContext membershipId identifies authority record.
- Permission helper may use actor/tenant/branch rather than membershipId depending existing DB function.
- Do not accept client membershipId.
- If multiple active memberships create ambiguity, R04 should already fail selection where unsafe.
- R05 must not choose a more privileged membership silently.

# 151. Multi-Membership Permission Semantics
- Existing `actor_has_permission()` may allow any active matching membership in scope.
- Audit whether this matches R04 selected membership semantics.
- Important risk: selected lower-privilege membership versus another active broader membership in same tenant/branch.
- R05 must decide deliberately whether permission authority is actor-scope aggregate or exact selected membership.
- Do not leave this ambiguous.

# 152. Exact Membership vs Aggregate Authority Decision
- Preferred default: authorization should align with the exact AccessContext authority when product semantics treat selected membership/role as active workspace role.
- If current database helper aggregates across any active membership, inspect actual fixture/schema for duplicate memberships.
- If ambiguity can cause privilege escalation, R05 must tighten the helper or authorization query.
- Any tightening belongs in forward-only migration with direct regression tests.
- This is a high-priority R05 audit item.

# 153. Duplicate Membership Threat Model
- Actor could theoretically have tenant-wide and branch-bound memberships with different roles.
- R04 resolver treats multiple tenant-wide authorities as invalid and chooses authority carefully.
- R05 must not ignore selected `membershipId` if doing so would grant permissions from a different membership unexpectedly.
- Test mixed-role multi-membership scenario if schema permits.
- Fail closed on ambiguous privilege source.

# 154. Permission Function Tightening Option
- If exact membership authority is required, consider a new/updated private function accepting membership ID plus permission code while validating actor/tenant/branch consistency.
- Fixed search path required.
- Narrow execute grants required.
- Current actor must match membership user.
- Membership must be active.
- Tenant/branch must match AccessContext.
- Role permission must be current.
- This is optional only if current helper semantics are insufficient.

# 155. Security Review Priority
- Mixed memberships and aggregate permission lookup is the highest-risk subtlety to audit.
- Cross-tenant permission evaluation is next.
- Sibling branch authorization is next.
- Direct command invocation bypass is next.
- Permission caching/staleness is next.
- UI-only gating is unacceptable.

# 156. Financial Command Priority
- Merchant payment collect/void are privileged financial actions.
- Permission check must be inside trusted server boundary.
- Denial must leave payment state unchanged.
- Do not log sensitive payment payload.
- Existing payment idempotency/transaction semantics must remain intact.
- R05 does not redesign payments.

# 157. Role/Member Administration Priority
- These commands can escalate privileges.
- Require explicit manage permission.
- Verify target tenant matches current context.
- Verify target role belongs to tenant.
- Prevent self-escalation through crafted payload.
- Negative tests are mandatory.

# 158. Audit Visibility Priority
- Audit events may contain sensitive operational data.
- `audit.view` must be enforced server-side.
- RLS limits tenant/branch scope.
- Do not rely on hidden navigation only.

# 159. Menu/Settings Priority
- Configuration changes affect customer/business behavior.
- Read/manage permissions remain distinct.
- Direct endpoints must enforce manage.
- R05 should prioritize existing mutation endpoints over hypothetical future screens.

# 160. In-Scope Route Inventory Requirement
- Implementation must enumerate every current internal protected route on parent branch.
- For each route, classify public/authenticated/workspace-only/permission-required.
- Record mapping in PR or test fixture.
- No internal privileged route may remain accidentally workspace-only without deliberate justification.

# 161. In-Scope Command Inventory Requirement
- Enumerate current privileged route handlers/server actions/services.
- Assign required permission or explicitly mark not applicable.
- Focus on existing implemented commands, not future product features.
- Add tests for high-risk commands.
- Do not invent empty placeholder authorization for nonexistent features.

# 162. Route Inventory Table Shape
```text
PATH | AUTH | ACCESS_CONTEXT | PERMISSION | NOTES
```
- Keep implementation PR evidence concise but complete.
- Use actual paths from branch.
- Public customer routes must be explicitly excluded.

# 163. Command Inventory Table Shape
```text
ENTRY POINT | MUTATION/READ | PERMISSION | TRANSACTION | TEST
```
- High-risk gaps must block R05 completion.
- Do not silently defer existing privileged endpoints to R06.

# 164. Scope Rule for Existing Legacy Endpoints
- If an existing internal endpoint still uses legacy coarse auth but is live, R05 should place replacement permission enforcement if within route/command scope.
- Physical deletion of legacy helper remains R06.
- Do not preserve a live bypass merely because source removal is deferred.
- R06 should receive dead/rollback-only legacy code, not live authorization authority.

# 165. R06 Handoff Requirement
- All live internal route authorization uses Auth.js identity + R04 AccessContext + R05 permissions.
- All live privileged commands enforce R05 permissions.
- Legacy shared credential/session authority is not live.
- Legacy route/command coarse authorization is not live.
- Remaining legacy source can be removed atomically in R06.
- R06 should not need to invent permission checks while deleting legacy code.

# 166. Explicit R06 Deferral
- delete obsolete `foodflow_session` implementation.
- delete obsolete JOSE token helpers if unused.
- remove obsolete `FOODFLOW_INTERNAL_*` env/config.
- remove obsolete rollback-only session creation helper.
- remove unused legacy dependencies if safe.
- final security acceptance.
- final source/dependency/config cleanup.
- R05 must not perform this physical cleanup by default.

# 167. Frontend Navigation UX
- Navigation may hide unavailable sections based on server-projected capabilities.
- Hiding is not security.
- Server route guard remains authoritative.
- Avoid flashing privileged nav items before capabilities load if client-rendered.
- Prefer server-rendered capability projection when practical.

# 168. Navigation Capability Projection
- Staff link visible if staff access.
- Kitchen link visible if kitchen access.
- Cashier link visible if cashier access.
- Admin link visible if management access.
- Exact navigation component must be inspected.
- Do not expose all permission codes to browser merely to render four links.

# 169. Forbidden Navigation Recovery
- User denied one surface may still have another valid surface.
- Offer safe navigation to workspace or allowed home.
- Do not log user out solely for missing one permission.
- Membership/user invalidation remains separate access/auth behavior.

# 170. No-Access vs Forbidden Distinction
- No-access means no current valid workspace authority.
- Forbidden means valid AccessContext but missing capability.
- Keep these states distinct in server logic.
- User experience may use related styling but must avoid redirect loops.
- Logs should distinguish them.

# 171. Unauthenticated vs Forbidden Distinction
- Unauthenticated actor should authenticate.
- Forbidden actor is authenticated and should not be sent through credential login repeatedly.
- Do not turn 403 into endless login redirect.
- Tests must cover valid session + denied permission.

# 172. Suspended User Behavior
- R04/R03 current access should fail for inactive actor where current DB checks apply.
- R05 must never grant permission solely from role table if user is suspended.
- Database helper baseline already checks active user.
- Keep regression test.

# 173. Suspended/Revoked Membership Behavior
- Permission must fail.
- Commands must not execute.
- Existing session may remain authenticated identity until broader session semantics handle it, but authorization is denied.
- No stale capability cache may bypass.

# 174. Branch Closure/Inactive Branch Behavior
- R04 workspace discovery handles branch availability according to current model.
- R05 should not independently re-open unavailable branch via permission check.
- If branch operational status is separate from access permission, domain command may still validate branch state.
- Do not conflate permission with business availability.

# 175. Domain State vs Authorization
- Permission answers actor capability.
- Domain validation answers whether operation is valid now.
- Both are required.
- Example: cashier may have collect permission but order/payment state may not allow collection.
- Do not encode domain state into permission helper.

# 176. Validation Ordering for Commands
- Validate authentication/access.
- Validate permission.
- Load scoped resource.
- Validate request/domain input.
- Validate state transition.
- Perform mutation.
- Audit/event.
- Exact ordering may adjust to avoid existence leakage and expensive work.

# 177. Input Validation Independence
- Authorization does not replace input validation.
- Use existing schemas/parsers.
- Invalid payload should fail safely.
- Do not reveal permission info through malformed payload differences unnecessarily.

# 178. Retry Semantics
- Permission denied is not automatically retryable unless authority changes.
- Infrastructure unavailable may be retryable.
- Domain conflict follows domain-specific retry behavior.
- Financial command retry must respect idempotency.

# 179. Observability Fields
- safe action identifier.
- safe permission code.
- actor UUID.
- tenant UUID.
- branch UUID/null.
- decision status.
- request correlation ID if existing infrastructure provides it.
- Do not invent PII-heavy logging.

# 180. Metrics Non-Goal
- No new metrics vendor required.
- No analytics product work.
- Existing logs/audit are sufficient unless current code already has metrics abstraction.
- Focus on correctness.

# 181. Performance Regression Test
- Avoid repeated identical permission DB calls within one render tree if clearly excessive.
- Request-local memoization may be tested.
- Do not add global cache.
- Build/runtime should remain stable.

# 182. Permission Query Failure Test
- Simulate repository/helper failure.
- Decision returns unavailable/throws safe internal error.
- Route does not render privileged content.
- Command callback not invoked.
- No mutation committed.

# 183. Permission Denial Logging Test
- If logging/audit wrapper added, ensure denied result logs safe fields.
- Verify secret/token/password absent.
- Do not snapshot huge log payloads.
- Logging failure must not convert deny to allow.

# 184. Audit Write Failure Semantics
- If denial audit is best-effort, authorization denial still stands even if audit write fails.
- If success audit is transaction-critical for a privileged mutation, failure may roll back mutation according to current audit policy.
- Document exact choice per existing architecture.
- Do not invent inconsistent behavior across commands.

# 185. Browser Capability Staleness
- Server-rendered button may remain visible after permission revoked until refresh.
- Clicking must be denied server-side.
- This is acceptable security behavior.
- Optional client refresh may improve UX but is not required for authority.

# 186. Session Staleness
- Auth.js session actor identity may remain valid after role/permission change.
- Authorization remains fresh because permissions are DB-evaluated.
- Do not force logout for every permission change unless R06/future policy requires it.
- Membership revocation is already handled fail-closed at access layer.

# 187. Permission Grant Propagation
- Newly granted permission becomes effective on next evaluation.
- No login refresh required.
- UI may require reload to show newly visible navigation.
- Server command should allow immediately once DB state is current.

# 188. Tenant-Wide Role Semantics
- Tenant-wide membership can authorize branch operations when role has permission and selected branch is legitimate.
- Permission evaluation must not treat branch null as wildcard for commands requiring exact branch if resource is branch-bound.
- Use R04 selected branch context for branch operations.

# 189. Branch-Bound Role Semantics
- Branch-bound membership authorizes only exact branch.
- Same permission code in sibling branch is denied.
- RLS and application helper both must reflect this.
- Tests with Staff A1/A2 and Cashier A2 cover boundary.

# 190. Mixed Scope Role Test
- If owner tenant-wide and branch-specific membership coexist, ensure selected AccessContext controls intended authority semantics.
- Test ambiguity if schema permits multiple memberships.
- This is key to avoid privilege source confusion.

# 191. Permission Function Parameter Semantics
- Current helper accepts permission code, target tenant, target branch.
- It derives actor from transaction local config.
- R05 must inspect null branch semantics carefully.
- `target_branch_id is null` currently allows tenant-level matching.
- Do not use null branch for branch-required command accidentally.

# 192. Branch-Required Command Helper
- Consider a wrapper that asserts AccessContext.branchId exists for branch-scoped capability.
- Reject tenant-only context for branch-required mutation.
- Keep this rule explicit.
- Do not pass null and accidentally broaden check.

# 193. Tenant-Scoped Command Helper
- Some admin/settings/member/role commands may be tenant-scoped.
- Those may legitimately evaluate permission with branch null if permission model is tenant-wide.
- Still use current tenant and actor.
- Cross-tenant target must fail.

# 194. Scope-Aware Permission API
- Optional conceptual API:
```ts
authorizePermission(context, permission, { scope: "tenant" | "branch" })
```
- Branch mode requires branchId.
- Tenant mode uses tenantId with null branch target.
- Avoid silent inference when ambiguity matters.
- Exact API should stay simple.

# 195. Permission Group Helpers
- Route family convenience helpers may wrap canonical permission.
- Example `requireStaffAccess()` may call `requirePermission(STAFF_ACCESS)`.
- Do not put unique authorization logic inside convenience wrappers.
- Test core primitive heavily, wrappers lightly.

# 196. Server Action Pattern
- Read authenticated actor from server session/current access.
- Parse action input.
- Enter authorized transaction with required permission.
- Load resource under RLS.
- Validate transition.
- Write.
- Return safe result.
- Never trust actor/tenant/branch hidden inputs as authority.

# 197. Route Handler Pattern
- Authenticate/current access server-side.
- Parse request.
- Authorize permission.
- Run scoped DB operation.
- Map denial to safe HTTP response.
- Preserve CSRF/request method rules.
- Do not redirect JSON clients unexpectedly unless current contract expects it.

# 198. Server Component Pattern
- Require current access.
- Require page permission.
- Fetch scoped data.
- Project safe UI capability hints only if needed.
- No client permission authority.

# 199. Client Component Pattern
- Render props from server.
- May hide/disable actions based on server capability hint.
- Server action/endpoint reauthorizes.
- Do not import server-only authorization module.
- Do not compute permissions from role name client-side.

# 200. Existing Navigation Audit
- Inspect navigation definitions for staff/kitchen/cashier/admin links.
- Ensure denied links are not shown when safe capability projection is available.
- Do not block R05 completion solely on cosmetic nav if server enforcement is complete, but avoid obviously misleading UX.
- Keep changes focused.

# 201. Existing Data Fetching Audit
- Identify protected server queries currently relying only on layout access.
- Sensitive queries callable independently should receive permission boundary.
- Avoid wrapping every internal helper redundantly.
- Public menu/query paths remain untouched.

# 202. Existing Mutation Audit
- Search route handlers/server actions for POST/PATCH/PUT/DELETE or mutation services.
- Search domain service names like create/update/delete/transition/collect/void/invite/manage.
- Build inventory before editing.
- Existing privileged mutations without permission check are R05 priority.

# 203. Existing Role String Audit
- Search for hard-coded `ADMIN`, `STAFF`, `KITCHEN`, `CASHIER`, manager role checks in application runtime.
- Replace live authorization role-name comparisons with permission checks where within R05 scope.
- Role labels may remain for display.
- Do not remove role model itself.

# 204. Existing Path-Based Auth Audit
- Search for pathname prefix checks that act as authorization.
- Coarse proxy auth may remain authentication-only.
- Replace live capability assumptions with server permission guards.
- Do not perform DB permission query in proxy if runtime incompatible.

# 205. Existing UI-Only Gate Audit
- Search disabled/hidden buttons for privileged actions.
- Confirm corresponding server endpoint authorizes.
- Add missing server checks.
- UI behavior alone must never be accepted as complete.

# 206. Existing Database Direct Access Audit
- Search privileged mutations that call Kysely directly outside current access transaction.
- Bring them under `withCurrentAccessTransaction` / authorized transaction where appropriate.
- Do not create duplicate DB clients.
- Preserve connection pooling safety.

# 207. Existing Error Handling Audit
- Ensure authorization denial is not caught and converted to success.
- Ensure generic catch does not retry mutation without permission.
- Ensure redirects/errors follow server framework conventions.
- Do not leak stack traces to client.

# 208. Existing Audit Event Audit
- Inspect current audit event writer before adding new event mechanism.
- Reuse canonical event shape.
- Avoid duplicate event on command retry if current idempotency handles it.
- Authorization denial event should have explicit type if implemented.

# 209. Implementation Order — Step 1
- Re-fetch current `main`.
- Read current merge policy and exact R05 spec from main.
- Identify latest R04 implementation branch and SHA.
- Create R05 implementation branch from latest R04 branch.
- Never branch implementation from docs branch.

# 210. Implementation Order — Step 2
- Re-audit R04 current-access and AccessContext behavior.
- Re-audit route tree.
- Re-audit command/mutation entry points.
- Re-audit permission catalog and role assignments.
- Re-audit `actor_has_permission()` semantics including multi-membership risk.

# 211. Implementation Order — Step 3
- Define typed permission catalog.
- Define authorization result/error contract.
- Implement core permission evaluation primitive.
- Add unit tests.
- Keep server-only boundary.

# 212. Implementation Order — Step 4
- Implement authorized transaction wrapper.
- Evaluate permission inside tenant transaction.
- Add callback-not-called-on-denial tests.
- Add rollback/failure tests.
- Verify branch/tenant scope.

# 213. Implementation Order — Step 5
- Add route guards to staff/kitchen/cashier/admin surfaces.
- Preserve authentication/workspace flows.
- Add forbidden handling.
- Test direct navigation.

# 214. Implementation Order — Step 6
- Inventory existing privileged commands.
- Add permission enforcement to highest-risk mutations first.
- Prioritize payments, role/member management, kitchen state, order/service management.
- Keep domain validation separate.

# 215. Implementation Order — Step 7
- Add safe capability projection/nav UX where useful.
- Do not make client hints authoritative.
- Add UI/E2E regression coverage.

# 216. Implementation Order — Step 8
- Add audit/observability integration for sensitive denials/commands if current architecture supports it.
- Verify redaction.
- Avoid scope expansion into analytics platform work.

# 217. Implementation Order — Step 9
- Run negative authorization matrix.
- Run cross-tenant/branch tests.
- Run revocation/permission-change tests.
- Run context leakage tests.
- Run inherited R01–R04 regressions.

# 218. Implementation Order — Step 10
- Run lint/typecheck/tests/build and applicable DB checks.
- Open or update exactly one R05 implementation PR.
- Record truthful evidence.
- Stop.
- Do not merge implementation PR.

# 219. Definition of Done — Core Authorization
- one canonical permission catalog exists.
- one canonical server permission evaluator exists.
- one canonical denial/error contract exists.
- permission evaluation uses current AccessContext.
- application code no longer relies on role names as live authority for R05-covered surfaces.

# 220. Definition of Done — Route Enforcement
- staff surface requires staff capability.
- kitchen surface requires kitchen capability.
- cashier surface requires cashier capability.
- admin surface requires management capability.
- direct navigation to unauthorized route is denied.
- no privileged loader data is returned before authorization.

# 221. Definition of Done — Command Enforcement
- current privileged mutations are inventoried.
- each in-scope command has explicit permission or justified N/A.
- direct invocation without permission is denied.
- denied command performs no mutation.
- critical permission check occurs in/near mutation transaction.
- financial and privilege-management commands receive highest assurance.

# 222. Definition of Done — Security
- no client-controlled permission authority.
- no role-name bypass.
- no permission JWT snapshot.
- no cross-tenant escalation.
- no sibling-branch escalation.
- no broad DB grants.
- revocation and permission removal fail closed.
- secrets/tokens are not logged.

# 223. Definition of Done — Database
- existing permission primitive reused or deliberately tightened.
- any new SECURITY DEFINER helper has fixed search path and narrow grants.
- no historical migration rewritten.
- clean reset works if migration added.
- RLS regressions remain green.
- context leakage is absent.

# 224. Definition of Done — UX
- denied actor sees stable forbidden behavior.
- unauthenticated actor still goes login.
- no-workspace actor still uses workspace/no-access flow.
- valid actors see only relevant navigation where practical.
- hidden UI never replaces server checks.
- no redirect loops.

# 225. Definition of Done — Tests
- permission helper unit tests.
- permission DB integration tests.
- route authorization tests.
- command authorization tests.
- direct invocation negative tests.
- cross-tenant and wrong-branch tests.
- revocation/permission change tests.
- transaction rollback tests.
- R01/R02/R03/R04/RLS regression coverage.

# 226. Definition of Done — Handoff
- live internal authorization authority no longer depends on legacy coarse auth.
- R03 Auth.js identity remains authoritative.
- R04 AccessContext remains authoritative for workspace scope.
- R05 permission checks are authoritative for capabilities.
- R06 can remove legacy source/config without inventing new authorization behavior.

# 227. Explicit Prohibitions
- do not physically remove legacy auth files.
- do not remove JOSE dependency solely in R05.
- do not remove legacy env variables solely in R05.
- do not change Auth.js provider/session strategy without concrete blocker.
- do not redesign workspace selector.
- do not create duplicate roles/permissions tables.
- do not trust client permission lists.
- do not trust role names for live authorization.
- do not bypass RLS.
- do not grant broad table access.
- do not perform production destructive DB work.
- do not implement unrelated product features.
- do not merge implementation PR.
- do not enable implementation auto-merge.

# 228. PR Requirements — Metadata
- Phase 02 / Round 05.
- exact spec filename.
- implementation parent branch.
- implementation parent SHA.
- implementation head SHA.
- recommended/current branch name.
- owner merge control declaration.

# 229. PR Requirements — Scope Evidence
- list route guards changed.
- list command entry points changed.
- list authorization modules created/modified.
- list DB functions/migrations changed if any.
- list test files.
- list explicit deferred R06 cleanup.

# 230. PR Requirements — Security Evidence
- cross-tenant denial.
- sibling-branch denial.
- wrong-role/capability denial.
- direct command invocation denial.
- permission revocation freshness.
- context leakage protection.
- no broad grant declaration.

# 231. PR Requirements — Database Evidence
- `SCHEMA_CHANGED: YES|NO`.
- `NEW_MIGRATION: YES|NO`.
- `GENERATED_TYPES_CHANGED: YES|NO`.
- permission helper reused/tightened.
- SQL tests result where applicable.
- DB lint result where applicable.

# 232. PR Requirements — Application Evidence
- lint.
- typecheck.
- unit tests.
- integration tests.
- build.
- E2E subset.
- route/command matrix evidence.
- truthful result vocabulary only.

# 233. Expected PR Scope Declaration
```text
PHASE: P02
ROUND: R05
AUTHJS_SESSION_AUTHORITY_CHANGED: NO BY DEFAULT
ACCESS_CONTEXT_CHANGED: ONLY IF REQUIRED FOR AUTHZ CORRECTNESS
ROUTE_PERMISSION_ENFORCEMENT_IMPLEMENTED: YES
COMMAND_PERMISSION_ENFORCEMENT_IMPLEMENTED: YES
PERMISSION_DB_AUTHORITY_USED: YES
LEGACY_AUTH_PHYSICALLY_REMOVED: NO
PRODUCTION_DB_DESTRUCTIVE_CHANGE: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 234. Blocker Conditions
- R04 AccessContext cannot reliably identify current membership authority.
- Permission helper aggregate semantics create unresolved privilege ambiguity.
- Existing command architecture lacks a trusted server boundary and requires larger redesign than R05 can safely own.
- Required permission codes are missing or inconsistent with role fixtures.
- Implementing permission checks would require broad DB grants.
- Required security fix would require destructive production migration.
- In these cases stop/report rather than weaken authorization.

# 235. Multi-Membership Blocker Rule
- If exact selected membership and database permission helper disagree materially, this must be resolved in R05 before declaring done.
- Do not paper over with role-name checks.
- Do not choose the most privileged membership silently.
- Prefer exact authority alignment and direct tests.

# 236. Route Coverage Blocker Rule
- An existing privileged internal route with only workspace/authentication guard and no deliberate permission classification blocks R05 completion.
- Every route must be classified.
- N/A must be justified.
- Public/internal distinction must be explicit.

# 237. Command Coverage Blocker Rule
- An existing privileged mutation callable from server without explicit authorization blocks R05 completion.
- UI hiding does not satisfy this requirement.
- Route guard alone does not satisfy this requirement.
- High-risk commands must have direct negative test.

# 238. Financial Blocker Rule
- Payment collect/void mutation without server-side permission check is a security blocker.
- Denial must be proven no-write.
- Existing idempotency/transaction behavior must remain intact.
- Do not defer this live gap to R06.

# 239. Privilege-Management Blocker Rule
- Role or membership mutation without server-side permission check is a security blocker.
- Cross-tenant target denial mandatory.
- Self-elevation denial mandatory.
- Do not defer live privilege escalation risk to R06.

# 240. R06 Handoff Contract
- R06 inherits Auth.js session authority from R03.
- R06 inherits AccessContext/workspace authority from R04.
- R06 inherits permission route/command authority from R05.
- All three replacement layers are live before cleanup.
- Legacy auth source is rollback/dead code only.
- R06 can remove old env/token/session/config/dependency surfaces atomically.
- R06 can run final security acceptance without designing new core authorization.

# 241. R06 Acceptance Inputs Expected
- route permission matrix.
- command permission matrix.
- negative authorization tests.
- cross-tenant/branch tests.
- revocation freshness tests.
- current AccessContext tests.
- Auth.js session tests.
- legacy-bypass rejection tests.
- dependency/config inventory for cleanup.

# 242. R06 Must Not Reopen R05 Scope by Default
- R06 may fix defects discovered in acceptance, but should not be the first place route/command permission mapping is implemented.
- R05 must leave live authorization complete.
- Cleanup should reduce code, not introduce new authority.

# 243. Current-Code Assumptions to Revalidate at Implementation Time
- R04 branch remains latest implementation parent.
- `AccessContext` shape remains actor/tenant/branch/membership/role/scope.
- `withCurrentAccessTransaction()` remains available.
- `private.actor_has_permission()` remains available.
- permission catalog remains current.
- route tree may have evolved and must be re-read.
- command inventory must be re-read.
- no assumption from this authoring snapshot overrides latest code.

# 244. Document Validation Checklist — Metadata
- [x] canonical filename P02/R05.
- [x] Phase 02.
- [x] Round 05.
- [x] Status READY.
- [x] Previous R04.
- [x] Next R06.
- [x] authority source main.
- [x] implementation parent latest R04 branch.
- [x] owner-controlled implementation merge.

# 245. Document Validation Checklist — Architecture
- [x] authentication/workspace/permission authority separated.
- [x] canonical permission helper defined.
- [x] route enforcement defined.
- [x] command enforcement defined.
- [x] RLS defense in depth defined.
- [x] server/client boundary defined.
- [x] multi-membership ambiguity explicitly audited.

# 246. Document Validation Checklist — Security
- [x] least privilege.
- [x] cross-tenant denial.
- [x] sibling-branch denial.
- [x] revocation freshness.
- [x] no permission session snapshot.
- [x] no role-name bypass.
- [x] no raw secrets/tokens logging.
- [x] direct command invocation denial.

# 247. Document Validation Checklist — Failure/Recovery
- [x] forbidden vs unauthenticated distinction.
- [x] infrastructure failure fails closed.
- [x] rollback semantics.
- [x] stale client capability safe.
- [x] permission grant/removal propagation.
- [x] no redirect loops.

# 248. Document Validation Checklist — Tests
- [x] unit tests.
- [x] integration tests.
- [x] route tests.
- [x] command tests.
- [x] negative authorization tests.
- [x] concurrency/revocation tests.
- [x] transaction rollback tests.
- [x] context leakage tests.
- [x] inherited regressions.

# 249. Document-Only Validation Policy
- This specification is validated by document content and observed repository state.
- GitHub Actions are not document-validation authority.
- Missing/queued/failed/skipped/cancelled Actions do not make document content invalid.
- Hosted GitHub rules may still technically block merge.
- This documentation task must not modify CI/runtime code to force a docs PR green.

# 250. Implementation Validation Policy
- Future implementation must still run the validation required by this spec/current repo.
- Documentation validation and implementation validation are separate concepts.
- Do not fabricate implementation outcomes in this document.

# 251. Final R05 State Before Owner Integration
```text
P02/R05 = IMPLEMENTED ON ROUND BRANCH / PR OPEN
```
- Implementation PR remains owner-controlled.
- Documentation authority remains main.
- Branch progression follows current repository policy.

# 252. Handoff to R06 — Completed State
- Auth.js authenticated actor is real user UUID.
- AccessContext resolves current tenant/branch authority.
- Membership revocation fails closed.
- Route permission enforcement is live.
- Command permission enforcement is live.
- Permission authority derives from current database role/permission state.
- Cross-tenant and wrong-branch paths are denied.
- No client capability hint is authoritative.

# 253. Handoff to R06 — Remaining Cleanup
- remove legacy session issuer/token verifier source.
- remove legacy shared internal credential config/env.
- remove obsolete JOSE dependency if unused after cleanup.
- remove dead rollback-only code.
- consolidate auth exports/imports.
- final security regression acceptance.
- final source/dependency/config cleanliness.

# 254. Required Next Specification
```text
FLOW_P02_R06_IMPLEMENTATION_SPEC.md
```
- R06 remains a separate executable round.
- R05 must not author or implement R06 work.

# 255. Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- Future implementation must re-read current main.
- Future implementation must use latest R04 implementation branch as R05 parent unless actual lineage has advanced legitimately.
- This documentation task creates no implementation branch.

# 256. Acceptance Summary
- R05 is the capability authorization round.
- It does not reimplement authentication.
- It does not reimplement workspace selection.
- It does not physically remove legacy auth.
- It makes route access permission-specific.
- It makes commands independently permission-specific.
- It keeps permission authority in current server/database state.
- It keeps RLS as defense in depth.
- It closes direct-invocation bypasses.
- It prepares a cleanup-only R06 rather than leaving security design unfinished.

# 257. Detailed Route Audit Checklist
- [ ] list every route group.
- [ ] list every protected internal page.
- [ ] classify customer/public pages.
- [ ] classify login/logout/workspace pages.
- [ ] classify staff pages.
- [ ] classify kitchen pages.
- [ ] classify cashier pages.
- [ ] classify admin pages.
- [ ] assign permission or justified N/A.
- [ ] add server guard at stable boundary.
- [ ] add negative direct-navigation test.

# 258. Detailed Command Audit Checklist
- [ ] list all internal mutation route handlers.
- [ ] list all server actions.
- [ ] list all exported mutation services.
- [ ] list sensitive internal reads callable independently.
- [ ] assign canonical permission.
- [ ] place check at trusted server boundary.
- [ ] prove denied callback not executed.
- [ ] prove tenant/branch scope.
- [ ] prove rollback on failure.

# 259. Detailed Payment Authorization Checklist
- [ ] view permission separated from collect.
- [ ] collect separated from void.
- [ ] direct endpoint denied without permission.
- [ ] wrong branch denied.
- [ ] cross tenant denied.
- [ ] denied write leaves state unchanged.
- [ ] retry/idempotency preserved.
- [ ] sensitive payload redacted.

# 260. Detailed Role/Member Authorization Checklist
- [ ] role view gated.
- [ ] role manage gated.
- [ ] member view gated.
- [ ] member invite gated.
- [ ] member manage gated.
- [ ] cross-tenant target denied.
- [ ] self-elevation scenario denied.
- [ ] role permission mutation audited/tested.

# 261. Detailed Kitchen Authorization Checklist
- [ ] kitchen shell gated.
- [ ] kitchen read gated where independently callable.
- [ ] kitchen state mutation gated.
- [ ] cashier persona denied kitchen manage.
- [ ] sibling branch denied.
- [ ] stale workspace denied.

# 262. Detailed Staff Authorization Checklist
- [ ] staff shell gated.
- [ ] order view gated as needed.
- [ ] order manage gated.
- [ ] service view gated.
- [ ] service manage gated.
- [ ] kitchen/cashier/admin separation proven.

# 263. Detailed Admin Authorization Checklist
- [ ] admin shell gated.
- [ ] settings permissions separated.
- [ ] menu permissions separated.
- [ ] member permissions separated.
- [ ] role permissions separated.
- [ ] audit permission separated.
- [ ] no hidden superuser branch in application code.

# 264. Authorization Result Mapping Table
| Internal state | Route behavior | API/command behavior | Mutation allowed |
|---|---|---|---|
| unauthenticated | login flow | 401/safe auth failure | NO |
| no workspace | workspace/no-access | safe no-access | NO |
| permission denied | forbidden | 403/safe denial | NO |
| unavailable | safe unavailable | 5xx/safe unavailable | NO |
| allowed | continue | execute | YES |

# 265. Security Boundary Matrix
| Source | May supply identity authority? | May supply workspace authority? | May supply permission authority? |
|---|---:|---:|---:|
| Auth.js server session | YES | NO | NO |
| Workspace selector cookie | NO | selector hint only | NO |
| AccessContext | actor-derived | YES | NO |
| Client role field | NO | NO | NO |
| Client permission list | NO | NO | NO |
| DB membership/role/permission state | supports actor context | YES | YES |
| RLS | NO | enforces scope | defense-in-depth |

# 266. Permission Evaluation Matrix
| Context | Permission relation | Result |
|---|---|---|
| active actor + active membership + matching role grant | present | ALLOW |
| active actor + active membership | missing grant | DENY |
| inactive actor | any | DENY |
| revoked membership | any | DENY |
| wrong tenant | any | DENY |
| wrong branch | any | DENY |
| DB unavailable | unknown | FAIL CLOSED |

# 267. Multi-Membership Matrix
| Case | Expected behavior |
|---|---|
| one branch membership | use exact membership authority |
| one tenant-wide membership | use current tenant/selected branch scope |
| duplicate tenant-wide memberships | fail closed / ambiguity |
| branch + tenant-wide same tenant | audit selected authority semantics explicitly |
| two branch memberships same branch with different roles | fail closed or exact membership selection; never silently choose highest privilege |
| memberships across tenants | current AccessContext tenant isolates evaluation |

# 268. Permission Scope Matrix
| Capability type | Expected evaluation scope |
|---|---|
| route shell for branch operations | branch when selected/required |
| tenant settings | tenant |
| member/role administration | tenant unless current model says branch |
| kitchen operations | branch |
| cashier operations | branch |
| order/service operations | branch for current FoodFlow model |
| audit | tenant/branch per actual audit schema/policy |

# 269. Failure Recovery Matrix
| Failure | Required response | Retry |
|---|---|---|
| denied permission | no mutation, forbidden | after authority change only |
| revoked membership | no mutation, workspace/no-access | after membership restored |
| stale branch selection | reselect workspace | YES |
| DB outage | no mutation, unavailable | YES |
| domain conflict | rollback, domain error | domain-specific |
| callback exception | rollback | depends on idempotency |

# 270. Route Guard Regression Matrix
- login remains reachable.
- logout remains reachable.
- workspace remains reachable by authenticated actor.
- public menu remains public.
- staff requires staff permission.
- kitchen requires kitchen permission.
- cashier requires cashier permission.
- admin requires management permission.
- forbidden page does not require denied permission.

# 271. Server Command Regression Matrix
- order mutation cannot bypass through direct POST.
- kitchen transition cannot bypass through direct call.
- payment collect cannot bypass through hidden API.
- member mutation cannot bypass through crafted form.
- role mutation cannot bypass through crafted payload.
- settings/menu mutation cannot bypass hidden UI.

# 272. Audit/Logging Regression Matrix
- denied authorization emits no credential/token.
- safe permission/action identifiers only.
- infrastructure error categorized safely.
- audit/log failure never converts deny to allow.
- no duplicate sensitive event payload.

# 273. Performance Acceptance
- no process-global authorization cache.
- no permission list added to JWT.
- no broad eager permission fetch for every page unless justified.
- no obvious N+1 permission query in list rendering.
- route render/build remains within existing architecture.

# 274. Dependency Policy
- No new auth/authorization dependency expected.
- No policy engine package required.
- No CASL/Oso/Casbin-style dependency by default.
- Current permission model is sufficient.
- New dependency requires explicit necessity proof in implementation PR.
- Package-lock should remain unchanged by default.

# 275. Environment Variable Policy
- No new authorization secret expected.
- No `ADMIN=true` style env bypass.
- No feature flag that grants permissions globally.
- If a rollout flag is absolutely required, it must never bypass deny for unauthorized actor.
- Prefer no new env variable.

# 276. Backward Compatibility
- Existing authenticated sessions should continue to identify actor.
- Existing workspace selection should continue to resolve.
- Authorized users keep access according to current role grants.
- Unauthorized users lose previously coarse access.
- Public customer paths remain stable.
- R06 cleanup can follow without behavioral re-cutover.

# 277. Rollout Safety
- Permission checks should be introduced consistently across route and command paths.
- Avoid partial rollout where UI route denies but API still allows.
- High-risk command enforcement must land in same R05 branch.
- If staged commits are used, branch head must be internally coherent before PR completion.

# 278. Rollback Safety
- R05 source rollback should be possible via branch/revert before R06 removes old code.
- Do not add irreversible production mutation.
- Database helper tightening migration should be backward-compatible with current data where possible.
- Never restore legacy auth as silent fallback after a permission denial.

# 279. Legacy Fallback Prohibition
- If R05 permission check denies, do not consult legacy `foodflow_session` or shared credentials.
- If new permission infrastructure fails, do not fall back to role-name allow.
- Fail closed.
- R06 removes the dead fallback source later.

# 280. Documentation Update Scope During Implementation
- Update server authz README only if one exists and change is needed.
- Do not create broad product documentation unrelated to implementation.
- Implementation PR description is primary evidence.
- This executable spec remains scope authority.

# 281. Code Review Focus
- authority source correctness.
- exact AccessContext use.
- exact membership semantics.
- permission code correctness.
- command atomicity.
- direct invocation denial.
- cross-tenant/branch denial.
- no stale cache/bypass.
- no client authority.

# 282. Security Review Focus
- mixed membership privilege escalation.
- role reassignment staleness.
- permission revocation staleness.
- financial command authorization.
- member/role self-escalation.
- route/command mismatch.
- RLS bypass/grants.

# 283. Test Review Focus
- meaningful negative cases over test count.
- direct API/command denial.
- mutation unchanged on denial.
- rollback proof.
- cross-tenant and sibling branch.
- fixture role separation.
- permission removal freshness.
- context leakage.

# 284. PR Review Focus
- diff stays R05 scope.
- no R06 cleanup hidden in branch.
- no unrelated UI redesign.
- no dependency churn.
- no broad schema redesign.
- all existing privileged entry points classified.
- truthful validation evidence.

# 285. Stop Condition After R05 Spec Implementation
- Future implementation agent stops after implementation branch + validation + PR.
- It must not merge implementation PR.
- It must not start R06 implementation.
- R06 requires its own executable spec on main.

# 286. Specification Completeness Statement
- This document defines R05 architecture.
- This document defines route enforcement.
- This document defines command enforcement.
- This document defines database permission authority.
- This document defines security/failure/concurrency behavior.
- This document defines test strategy.
- This document defines R06 handoff.
- Implementation must re-audit exact current code paths rather than blindly create every candidate file.

# 287. Final Document Validation Targets
- canonical sequence coherent.
- no duplicate R04 responsibilities.
- no premature R06 cleanup.
- expected code footprint concrete.
- permission semantics explicit.
- multi-membership risk explicit.
- route/command inventory required.
- negative tests prioritized.
- transaction semantics explicit.
- final line count within required 1,800–2,500 lines.

# 288. Final Acceptance
- R05 is READY only as a specification document.
- `READY` does not claim implementation exists.
- Document validation is separate from implementation validation.
- GitHub Actions are not document-validation authority.
- The future R05 implementation must use latest legitimate R04 code lineage.
- The future R05 implementation must remain owner-controlled for merge.
- The next executable round is `FLOW_P02_R06_IMPLEMENTATION_SPEC.md`.
