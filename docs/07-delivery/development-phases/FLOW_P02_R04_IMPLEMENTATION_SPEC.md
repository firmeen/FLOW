# FLOW P02 R04 — Implementation Specification
> Phase 02 — Identity / Auth.js / RBAC / Tenant-Branch Authorization
> Round 04 — Workspace / AccessContext Resolution + Membership Revocation Semantics
> Revision — Actor-bound workspace discovery, explicit tenant/branch selection, fail-closed access-context resolution, and revocation-aware runtime handoff

## Metadata
- Phase: `02`
- Round: `04`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P02_R03_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P02_R05_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible slot after this spec is on main`
- Current planning scope: `PHASE 02 / ROUND 04 ONLY`
- Implementation parent: `latest P02/R03 implementation lineage tip`
- Expected implementation parent branch: `p02-r03-authjs-session-cutover`
- Observed R03 branch head at authoring: `340ece17fcb8c303c56fad28df226446a5de67cb`
- Observed R03 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Observed R03 implementation PR at authoring: `NONE FOUND`
- Recommended implementation branch: `p02-r04-access-context`
- Recommended implementation PR title: `feat(authz): resolve workspace access context and revocation semantics`
- Owner merge control for implementation: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Workspace discovery in this round: `YES`
- Tenant selection in this round: `YES`
- Branch selection in this round: `YES`
- AccessContext server contract in this round: `YES`
- Membership status revalidation in this round: `YES`
- Revocation / membership-change handling in this round: `YES`
- Permission-specific route/command enforcement in this round: `NO — P02/R05`
- Physical legacy-auth removal in this round: `NO — P02/R06`
- Production database destructive mutation: `NO`

# 1. Authoring State
- Current `main` is the only policy and executable-specification authority.
- Latest observed `main` before this document branch was created is `6e9e58ff9ac82b6d59d8776dc1f5f6e4144cde01`.
- `FLOW_P02_R03_IMPLEMENTATION_SPEC.md` exists on `main`.
- R03 specification status is READY.
- R03 specification points `Next` to this exact canonical filename.
- No `FLOW_P02_R04_IMPLEMENTATION_SPEC.md` existed on `main` before this document was authored.
- No active R04 implementation branch was observed before this document was authored.
- R03 implementation branch exists as `p02-r03-authjs-session-cutover`.
- R03 branch head observed is `340ece17fcb8c303c56fad28df226446a5de67cb`.
- R03 branch is 26 commits ahead of `p02-r02-auth-fixtures`.
- R03 branch has meaningful authentication/session implementation code.
- R03 branch adds `src/auth.ts`.
- R03 branch adds `src/auth.config.ts`.
- R03 branch adds the Auth.js App Router handler.
- R03 branch changes the live login route.
- R03 branch changes proxy authentication authority.
- R03 branch changes server session access.
- R03 branch adds server authentication orchestration.
- R03 branch adds session-claim persistence/exposure.
- R03 branch adds throttle-subject derivation.
- R03 branch adds authentication cutover tests.
- R03 branch therefore provides real code evidence for R04 authoring.
- The owner explicitly requested R04 specification progression now.
- This document remains specification/documentation only.
- This document does not implement R04.
- This document does not create an implementation branch.
- This document does not merge any implementation PR.

# 2. Phase Objective
- Phase 02 replaces shared internal identity with real application users.
- Phase 02 makes Auth.js the internal human session authority.
- Phase 02 derives authorization from active memberships.
- Phase 02 derives tenant authority from explicit workspace membership.
- Phase 02 derives branch authority from membership scope.
- Phase 02 preserves tenant isolation.
- Phase 02 preserves branch isolation.
- Phase 02 preserves RLS defense in depth.
- Phase 02 keeps session identity separate from authorization state.
- Phase 02 handles membership revocation fail-closed.
- Phase 02 handles user suspension fail-closed.
- Phase 02 handles workspace access changes deterministically.
- Phase 02 prepares permission-specific route/command enforcement.
- Phase 02 avoids putting mutable authorization snapshots permanently into the session token.
- Phase 02 avoids client-controlled tenant or branch authority.
- Phase 02 preserves public customer entry behavior.
- Phase 02 ends with one coherent internal human authority chain.

# 3. Six-Round Boundary
- R01 owns canonical login identity.
- R01 owns pre-auth least privilege.
- R01 owns credential candidate lookup.
- R01 owns password verification.
- R01 owns login throttle primitives.
- R02 owns deterministic identity fixtures.
- R02 owns deterministic membership personas.
- R02 owns deterministic role and permission fixtures.
- R02 owns cross-tenant and branch regression evidence.
- R03 owns live database-backed authentication.
- R03 owns Auth.js session authority cutover.
- R03 owns actor UUID session identity.
- R04 owns workspace discovery.
- R04 owns AccessContext resolution.
- R04 owns membership and workspace-state revalidation.
- R04 owns revocation and membership-change semantics.
- R04 owns safe actor-to-tenant/branch context handoff.
- R05 owns permission-specific route enforcement.
- R05 owns permission-specific command enforcement.
- R05 owns role/permission authorization integration.
- R06 owns physical legacy-auth removal.
- R06 owns final Phase 02 security acceptance.
- R04 must not collapse R05 or R06 responsibilities.

# 4. R04 High-Impact Objective
- Convert an authenticated actor UUID into an authoritative workspace access decision.
- Discover only workspaces the actor is currently allowed to access.
- Resolve a selected tenant and optional branch into one canonical server-only `AccessContext`.
- Ensure the actor, user, membership, tenant, and branch state are revalidated when resolving context.
- Ensure client-supplied tenant and branch IDs are treated only as selectors, never authority.
- Ensure tenant-wide memberships and exact-branch memberships have deterministic semantics.
- Ensure inactive, invited, suspended, revoked, or missing memberships cannot resolve access.
- Ensure a suspended or otherwise inactive user cannot continue to resolve access.
- Ensure stale session identity does not imply stale authorization authority.
- Ensure revoked membership fails on the next context resolution.
- Ensure branch reassignment is reflected without requiring a new authentication identity.
- Ensure role reassignment can flow into R05 without embedding role authority into Auth.js session state.
- Ensure workspace discovery does not leak other tenants.
- Ensure wrong-branch selection fails closed.
- Ensure cross-tenant selection fails closed.
- Ensure context is suitable for `withTenantTransaction()`.
- Ensure actor UUID from the Auth.js session is always included when executing tenant-bound database work.
- Ensure no browser cookie becomes the canonical authorization store.
- Ensure no generic client state object becomes a privilege source.
- Build reusable primitives so R05 becomes a thin permission-enforcement layer.

# 5. Why R04 Exists Now
- R03 establishes who the actor is.
- R03 deliberately keeps roles out of session authority.
- R03 deliberately keeps permissions out of session authority.
- R03 deliberately keeps tenant selection out of authentication.
- R03 deliberately keeps branch selection out of authentication.
- The current session therefore contains identity but not mutable workspace authority.
- That separation is intentional and must remain.
- The system already has memberships, roles, branches, tenants, and RLS primitives.
- The missing architectural bridge is actor identity to current workspace authorization.
- R04 must create that bridge before R05 adds permission checks.
- Without R04, route code would likely duplicate membership lookup logic.
- Without R04, branch selection could become client-trusted state.
- Without R04, revoked membership could remain usable through stale UI/session assumptions.
- Without R04, R05 would have no canonical context on which to evaluate permissions.
- R04 therefore removes the largest authorization ambiguity remaining after authentication cutover.

# 6. Current R03 Session Contract
- R03 `src/auth.ts` uses Auth.js Credentials.
- Credentials authorization calls the canonical internal authentication orchestrator.
- Successful authorization returns a real user UUID as `id`.
- Successful authorization returns normalized email.
- R03 session claims expose actor identity.
- R03 session does not carry tenant authority.
- R03 session does not carry branch authority.
- R03 session does not carry role authority.
- R03 session does not carry permission authority.
- R03 session therefore remains an authentication artifact.
- R04 must preserve that distinction.
- R04 must not add a full mutable authorization snapshot to the JWT.
- R04 may expose minimal UX hints only if clearly non-authoritative and justified.
- All privileged server work must resolve current access from server/database state.

# 7. Current Database Context Baseline
- `src/server/db/context.ts` defines `DatabaseRequestContext`.
- `DatabaseRequestContext` currently contains `tenantId`.
- `DatabaseRequestContext` optionally contains `branchId`.
- `DatabaseRequestContext` optionally contains `actorId`.
- UUID validation is already centralized.
- `withTenantTransaction()` sets `flow_runtime` locally.
- `withTenantTransaction()` sets `app.tenant_id` transaction-locally.
- `withTenantTransaction()` sets `app.branch_id` transaction-locally.
- `withTenantTransaction()` sets `app.actor_id` transaction-locally.
- The transaction-local design protects pooled connection reuse.
- R04 must reuse this transaction primitive rather than creating a parallel tenant transaction abstraction.
- R04 may narrow or wrap its input to guarantee actor presence.
- R04 must not weaken current context validation.
- R04 must not set context globally or session-wide in PostgreSQL.

# 8. Current Identity Transaction Baseline
- `withIdentityTransaction(actorId, ...)` already exists.
- It sets `flow_identity` locally.
- It sets `app.actor_id` locally.
- It does not require tenant context.
- It is appropriate for actor-bound workspace discovery.
- It is appropriate for actor-bound membership discovery.
- It is not appropriate for product-domain execution requiring tenant/branch RLS.
- R04 should reuse it for pre-workspace authorization discovery.
- R04 should avoid database-owner or unrestricted runtime access for workspace discovery.
- R04 should keep discovery queries inside the least-privileged identity boundary.

# 9. Existing Membership / Authorization Baseline
- `app.memberships` is the canonical actor-to-workspace relation.
- Membership carries `tenant_id`.
- Membership carries `role_id`.
- Membership may carry `branch_id`.
- Membership carries lifecycle/status state.
- Existing RLS and helper functions already use active-membership semantics.
- `private.actor_has_active_membership()` already exists from earlier authorization work.
- `private.actor_has_permission()` already exists.
- R04 may reuse active-membership semantics.
- R04 must not move permission-specific enforcement into this round.
- R04 may fetch role identifiers/codes as context metadata only when needed for later permission resolution.
- R04 must not trust role metadata from the browser.
- R04 must not grant access merely because a role exists.
- Membership status and actor status remain authoritative.

# 10. Deterministic Fixture Baseline
- R02 fixtures include Tenant A.
- R02 fixtures include Tenant B.
- R02 fixtures include Branch A1.
- R02 fixtures include Branch A2.
- R02 fixtures include Branch B1.
- R02 fixtures include owner persona for Tenant A.
- R02 fixtures include Staff A1.
- R02 fixtures include Staff A2.
- R02 fixtures include Kitchen A1.
- R02 fixtures include Cashier A2.
- R02 fixtures include Staff B1.
- R02 fixtures include invited membership denial persona.
- R02 fixtures include suspended membership denial persona.
- R02 fixtures include revoked membership denial persona.
- R02 fixtures include no-membership credential-bearing persona.
- These fixtures are the canonical R04 test matrix starting point.
- R04 must reuse them rather than inventing duplicate personas.
- New fixtures should be added only if a specific R04 state transition cannot be represented otherwise.

# 11. Canonical Workspace Concept
- A workspace is the server-authorized tenant/branch execution scope available to an authenticated actor.
- A workspace is not merely a tenant row.
- A workspace is not merely a branch row.
- A workspace is not merely a role.
- A workspace is not a cookie value.
- A workspace is not a client-side route parameter.
- A workspace must be derivable from active membership and current actor status.
- A tenant-wide membership produces tenant scope and may allow branch selection according to current domain rules.
- An exact-branch membership produces only that branch scope.
- A branch must belong to the selected tenant.
- An inactive branch must not be presented as selectable if the domain model marks it unavailable for internal operations.
- A tenant/workspace itself must be active when the schema exposes such lifecycle state.
- If current schema has no explicit tenant lifecycle flag, R04 must not invent one merely for symmetry.

# 12. Canonical AccessContext Contract
- R04 must introduce one canonical server-only access-context representation.
- Suggested name: `AccessContext`.
- The exact module path may adapt to current architecture.
- The type must contain `actorId`.
- The type must contain `tenantId`.
- The type must represent branch scope explicitly.
- Branch scope must not be ambiguous between omitted, tenant-wide, and exact branch.
- Prefer a discriminated shape over loosely optional fields when it materially reduces ambiguity.
- Example conceptual shape:
```ts
interface AccessContext {
  actorId: string;
  tenantId: string;
  branchId: string | null;
  membershipId: string;
  roleId: string;
  scope: "TENANT" | "BRANCH";
}
```
- The implementation may enrich this shape with safe server-only metadata if necessary.
- The implementation must not store raw permissions as session authority.
- The implementation must not include secrets.
- The implementation must not include password or credential state.
- The implementation must not include mutable authorization claims copied from the client.
- `membershipId` should identify the exact authority record used to resolve the context.
- `roleId` may be carried to make R05 permission lookup efficient but must remain server-derived.
- If a canonical role code is useful, it may be included as metadata.
- Role code must not replace permission checks in R05.
- The resolved context must be immutable by convention.
- The resolved context must be short-lived per request or command execution.
- The resolved context must be recomputable from server state.

# 13. Workspace Discovery Contract
- Introduce a server-only workspace discovery service/repository.
- Input is authenticated `actorId` only.
- Discovery must use actor-bound identity transaction semantics.
- Discovery must return only memberships visible to that actor.
- Discovery must filter inactive user state.
- Discovery must filter inactive membership state.
- Discovery must not list revoked memberships.
- Discovery must not list suspended memberships.
- Discovery must not list invited memberships as executable workspaces.
- Discovery must not leak membership rows belonging to another actor.
- Discovery must not reveal tenants the actor cannot access.
- Discovery must not reveal branch identifiers outside the actor's membership scope.
- Discovery should return a deterministic ordering.
- Prefer tenant display name then branch display name or stable IDs when names tie.
- Discovery result must contain enough information for a selector UI.
- Discovery result must not contain unrestricted role permission lists unless clearly needed.
- Discovery result should identify tenant-wide versus exact-branch membership.
- Discovery result should identify when a tenant-wide membership has multiple selectable branches.
- Discovery must avoid N+1 queries where a single actor-bound join can safely produce the result.
- Discovery must remain bounded by the actor's own memberships.

# 14. Workspace Selection Contract
- The client may propose a tenant ID.
- The client may propose a branch ID.
- Those values are selectors only.
- The server must validate them against current actor authority.
- The server must never trust a hidden form field as authorization.
- The server must never trust a query parameter as authorization.
- The server must never trust localStorage as authorization.
- The server must never trust a workspace cookie without revalidation.
- Selection resolution must reject malformed UUIDs.
- Selection resolution must reject unknown tenants.
- Selection resolution must reject tenants outside actor membership.
- Selection resolution must reject branches outside the selected tenant.
- Selection resolution must reject sibling branches for branch-bound members.
- Selection resolution must reject Tenant B identifiers for Tenant A-only actors.
- Selection resolution must reject stale revoked memberships.
- Selection resolution must reject inactive users.
- Selection resolution must reject missing membership.
- Selection resolution must reject ambiguous authority when multiple membership records could produce inconsistent scope.
- If duplicate active authority records are possible under current schema, R04 must define deterministic handling or add an invariant if schema scope legitimately belongs here.

# 15. Tenant-Wide Membership Semantics
- Existing fixtures establish Tenant A manager as tenant-wide.
- Tenant-wide membership uses `branch_id = null` under the current model.
- Tenant-wide membership must not mean arbitrary cross-tenant access.
- Tenant-wide membership allows execution only inside its tenant.
- Branch selection must still ensure branch belongs to that tenant.
- Tenant-wide actors may select Branch A1.
- Tenant-wide actors may select Branch A2.
- Tenant-wide actors may not select Branch B1.
- Tenant-wide actors may have a tenant-only context where a command genuinely does not require a branch.
- Product routes that require a branch should require exact branch resolution before execution.
- R04 should encode the distinction between tenant-only and branch-resolved contexts.
- R05 should not have to guess whether branch absence is authorized or accidental.

# 16. Exact-Branch Membership Semantics
- Staff A1 is exact to Branch A1.
- Staff A2 is exact to Branch A2.
- Kitchen A1 is exact to Branch A1.
- Cashier A2 is exact to Branch A2.
- Staff B1 is exact to Branch B1.
- Branch-bound members may resolve only their bound branch.
- A branch-bound member must not resolve a tenant-only execution context for branch-required operations if that would broaden scope.
- A branch-bound member must not switch to a sibling branch.
- A branch-bound member must not clear `branchId` to escape branch isolation.
- If a selector omits branch for a branch-bound membership, the server may auto-resolve the only allowed branch when deterministic.
- Auto-resolution must not occur when multiple choices exist.
- If tenant-wide membership and branch-specific membership coexist, the implementation must define deterministic precedence.
- Prefer preserving legitimate tenant-wide authority while retaining selected branch specificity.
- Do not merge memberships into a broader scope than any active membership permits.

# 17. Multiple Memberships
- An actor may have more than one active membership.
- An actor may belong to more than one tenant.
- An actor may have multiple branch memberships in the same tenant.
- Workspace discovery must represent each legitimate selectable scope deterministically.
- The resolver must not arbitrarily select a tenant when multiple tenants are available.
- The resolver must not arbitrarily select a branch when multiple branches are available.
- Single-option auto-selection is allowed when it is deterministic and safe.
- Multi-option selection should require explicit user choice.
- The default-workspace concept must not be invented unless an existing field already defines it.
- If a future preference is desired, defer durable preference storage outside R04 unless the repository already has an established settings location.

# 18. Session / Authorization Separation
- Auth.js session proves actor identity.
- AccessContext proves current workspace authorization.
- These are separate layers.
- Session validity must not imply membership validity.
- Membership validity must be rechecked when resolving AccessContext.
- The JWT must not become the permanent source of membership truth.
- The browser must not become the source of membership truth.
- Workspace selection state may be remembered for UX only when revalidated on use.
- R04 may use a signed/httpOnly workspace-selection cookie if justified.
- Such a cookie is never sufficient authority by itself.
- Cookie contents must be minimal identifiers only.
- Cookie contents must not contain permissions.
- Cookie contents must not contain secrets.
- Cookie contents must not contain raw role grants.
- A stale selection cookie must fail closed or be replaced by a safe selector redirect.
- A deleted branch must not remain usable because a cookie still names it.
- A revoked membership must not remain usable because a cookie still names it.

# 19. Revocation Semantics
- Revocation means current membership authority is no longer valid.
- Revocation must take effect at next server-side AccessContext resolution.
- R04 does not require immediate Auth.js token invalidation for membership-only revocation.
- Authentication identity may remain valid while authorization becomes denied.
- This distinction is intentional.
- A revoked actor may remain signed in but have zero workspaces.
- A zero-workspace actor must not reach protected operational data.
- A zero-workspace actor should receive a deterministic no-access state.
- Do not silently fall back to a previous workspace.
- Do not silently broaden to another workspace without explicit legitimate membership.
- If all memberships are removed, AccessContext resolution returns no authorized context.
- If one of several memberships is revoked, only that workspace disappears.
- Other active memberships remain usable.
- If current selected workspace is revoked, selection must be invalidated.
- The user may be redirected to workspace selection if another workspace remains.
- The user must be denied if none remains.

# 20. Membership Status Change Semantics
- ACTIVE to REVOKED must remove authority.
- ACTIVE to SUSPENDED must remove authority.
- ACTIVE to INVITED must not preserve authority.
- REVOKED to ACTIVE, if allowed by domain rules, restores authority only after current-state resolution sees ACTIVE.
- INVITED membership is not executable authority.
- SUSPENDED membership is not executable authority.
- Missing membership is not executable authority.
- Status comparisons must use canonical enum/value definitions from the database model.
- Do not duplicate status strings across many unrelated modules.
- R04 should centralize access-eligibility semantics in one resolver/repository boundary.

# 21. User Status Change Semantics
- Active membership cannot override inactive user state.
- Suspended user must not resolve workspaces.
- Deleted/disabled user states, if represented in the schema, must fail closed.
- The resolver must not rely solely on membership state.
- User status should be checked in the same actor-bound discovery/resolution query where practical.
- User status changes should take effect at next access resolution.
- R04 does not need to invalidate the Auth.js session token physically when workspace authorization is denied.
- R06 may own final lifecycle cleanup if explicit global session invalidation infrastructure is later needed.

# 22. Role Change Semantics
- Role assignment is mutable authorization state.
- R04 may return current `roleId` in AccessContext.
- R04 must derive it from current membership state.
- R04 must not trust role ID from the browser.
- A role change must be visible on next AccessContext resolution.
- R04 must not precompute and persist the complete permission set in the session.
- R05 will evaluate permissions using current context and current role/permission relations.
- Role deletion or invalid role relation must fail closed.
- Broken role references should surface as authorization/data-integrity errors, never privilege broadening.

# 23. Branch Lifecycle Semantics
- A selected branch must belong to selected tenant.
- Branch ID alone is insufficient authority.
- If branch has an `is_open` flag, distinguish operational open/closed state from membership authorization unless product rules explicitly use it as an access gate.
- Do not confuse store operating hours with security authorization.
- If branch is administratively deleted or otherwise unavailable, selection must fail safely.
- R04 should use only existing lifecycle fields as authority.
- R04 must not invent a new branch security status without schema need.

# 24. Organization / Tenant Semantics
- Current schema uses tenant-oriented authorization helpers.
- Workspace UI may display organization or restaurant names as presentation metadata.
- Authorization key remains the canonical tenant ID used by RLS/context.
- Do not authorize by slug or display name.
- Slugs may be routing identifiers only when resolved server-side to canonical UUIDs.
- If tenant and organization identifiers differ in current schema, implementation must map them explicitly rather than conflate them.
- R04 implementation must inspect generated DB types before deciding display/query joins.

# 25. Expected Server Module Layout
- Reuse current module structure under `src/modules/identity/server` or create a clearly named adjacent access module.
- Do not create a second generic auth framework.
- Prefer one canonical home for workspace access logic.
- Suggested file paths are guidance and must be reconciled with current branch architecture.
- Equivalent current modules should be extended instead of duplicated.

# 26. Files to CREATE — Core Types
- Expected: `apps/web/next-flow/src/modules/identity/server/access-context.ts` or equivalent.
- Responsibility: define canonical AccessContext types and constructors/guards.
- Keep server-only boundary.
- Export discriminated scope types if useful.
- Keep raw DB row types private where possible.
- Do not import client components.
- Do not read cookies directly in the pure type module.
- Do not perform DB queries in type-only helpers.

# 27. Files to CREATE — Workspace Repository
- Expected: `apps/web/next-flow/src/modules/identity/server/workspace-repository.ts` or equivalent.
- Responsibility: actor-bound workspace discovery and exact membership lookup.
- Use `withIdentityTransaction()`.
- Query only required columns.
- Join tenant/branch/role metadata only as needed.
- Enforce current actor visibility.
- Enforce active user.
- Enforce active membership.
- Return deterministic server data.
- Keep query implementation hidden from routes/components.

# 28. Files to CREATE — Access Resolver
- Expected: `apps/web/next-flow/src/modules/identity/server/resolve-access-context.ts` or equivalent.
- Responsibility: validate selector input and produce canonical AccessContext.
- Input must include authenticated actor ID.
- Input may include tenant selector.
- Input may include branch selector.
- Validate UUID structure.
- Resolve only from repository-returned current authority.
- Reject ambiguous or unauthorized selection.
- Produce typed result or typed error.
- Keep permission checks out of this module.

# 29. Files to CREATE — Current Access Helper
- Expected: `apps/web/next-flow/src/modules/identity/server/current-access.ts` or equivalent.
- Responsibility: bridge Auth.js session to AccessContext resolution.
- Read authenticated actor identity using existing session helper.
- Read non-authoritative workspace selection if the implementation persists one.
- Resolve current access server-side.
- Provide `getCurrentAccessContext()` for nullable lookup.
- Provide `requireCurrentAccessContext()` for protected server execution.
- Keep redirects/presentation behavior thin and explicit.
- Avoid DB access from client components.

# 30. Files to CREATE — Workspace Selection Transport
- Create only if current architecture requires a dedicated route or server action.
- Candidate: `src/app/api/auth/workspace/route.ts`.
- Alternative: server action colocated with workspace selector page.
- Choose one canonical mutation surface.
- The mutation receives tenant/branch selectors.
- The mutation must re-resolve authority before persisting selection.
- It must not persist arbitrary unvalidated IDs.
- It must use safe redirect semantics.
- It must reject external redirect targets.
- It must remain CSRF-safe according to the chosen Next.js/Auth.js pattern.

# 31. Files to CREATE — Workspace Selector UI
- Expected route may be `src/app/(auth)/workspace/page.tsx` or an equivalent internal route.
- The exact path must be consistent with existing routing conventions.
- The page must be server-driven by default.
- It must require authenticated session identity.
- It must load actor-authorized workspaces only.
- It must not expose other tenant IDs beyond returned options.
- It must not perform permission-specific route authorization.
- It must handle zero workspaces.
- It must handle one workspace.
- It must handle multiple workspaces.
- It must handle stale selection.
- It must handle server failure safely.

# 32. Files to MODIFY — Identity Server Barrel
- Likely modify `src/modules/identity/server/index.ts`.
- Export only canonical public server APIs.
- Avoid exporting raw repository internals unnecessarily.
- Avoid cycles with `auth.ts`.
- Keep `server-only` behavior preserved.

# 33. Files to MODIFY — Session Helpers
- Likely modify `src/lib/auth/session.ts` only where access bridging naturally belongs.
- Preserve Auth.js as authentication authority.
- Do not restore legacy cookie authority.
- Do not make `foodflow_session` relevant to workspace authorization.
- Keep legacy rollback helper deprecated until R06.
- Consider separating authentication-only helper from authorization helper if that reduces coupling.

# 34. Files to MODIFY — Database Context Types
- `src/server/db/context.ts` may be extended if a stricter actor-required runtime context is useful.
- Do not break generic existing usages unnecessarily.
- Prefer adding a narrow type such as `AuthorizedDatabaseRequestContext` over weakening validation.
- Ensure AccessContext can map deterministically to tenant transaction input.
- Ensure actor ID cannot be accidentally omitted in privileged internal operations that require it.

# 35. Files to MODIFY — Tenant Transaction Wrapper
- `src/server/db/transaction.ts` should be reused.
- Modify only if needed to accept a stricter authorized context abstraction.
- Do not duplicate role/context setup logic.
- Preserve `SET LOCAL ROLE flow_runtime`.
- Preserve transaction-local `app.tenant_id`.
- Preserve transaction-local `app.branch_id`.
- Preserve transaction-local `app.actor_id`.
- Preserve cleanup by transaction end.
- Do not introduce connection-global state.

# 36. Files to MODIFY — Protected Internal Layouts
- Inspect current staff/kitchen/cashier/admin layouts/pages.
- R04 may require workspace context before rendering operational surfaces.
- Do not add permission-specific checks yet.
- The only R04 gate is valid current AccessContext.
- If no context is selected but choices exist, redirect to workspace selector.
- If current selection is invalid, clear/ignore selection and redirect safely.
- If no workspace exists, render no-access state.
- Public customer routes remain untouched.

# 37. Files to MODIFY — Proxy
- Proxy should remain authentication-only by default.
- Do not add database-backed workspace resolution to proxy.
- Do not make proxy perform tenant membership SQL.
- Keep edge/runtime compatibility.
- R04 may only adjust proxy routing if the workspace selector route must be reachable after authentication.
- Avoid redirect loops between login, workspace selector, and protected routes.
- Permission-specific proxy logic belongs outside R04 unless explicitly required by current framework constraints.

# 38. Files to MODIFY — Tests
- Extend R02 fixture-driven tests.
- Add unit tests for resolver logic.
- Add integration tests for actor-bound workspace discovery.
- Add integration tests for selected AccessContext to tenant transaction mapping.
- Add revocation-state transition tests.
- Add stale-selection tests.
- Add route/page behavior tests where selector UI is introduced.

# 39. Files NOT to TOUCH by Default
- `src/modules/identity/server/password-verifier.ts`.
- `src/modules/identity/server/credential-repository.ts`.
- `src/modules/identity/server/login-throttle.ts`.
- `src/modules/identity/server/throttle-subject.ts`.
- `src/auth.ts` provider authentication logic unless a narrow claim bridge is required.
- Auth.js credential verification contract.
- R01 migration files.
- R02 fixture migration/history files unless a new R04 fixture is genuinely required.
- Payment runtime.
- Customer ordering runtime.
- Kitchen workflow runtime beyond access-context wiring.
- Realtime runtime.
- Voice ordering runtime.
- Legacy auth source removal.

# 40. Files to MOVE
- No file move is required by default.
- Do not reorganize the auth module tree for cosmetic reasons.
- Move a file only if current implementation reveals an actual circular dependency or incorrect server/client boundary.
- Any move must preserve import history and be justified in the implementation PR.

# 41. Files to REMOVE
- No implementation file removal is required in R04 by default.
- Legacy auth files remain until R06.
- Do not delete R03 session compatibility code merely because R04 adds access context.
- Do not delete existing RLS helpers.
- Do not delete deterministic fixtures used by regression tests.

# 42. Database Schema Strategy
- Default expectation: no schema migration.
- Existing memberships, users, roles, tenants, and branches should support R04.
- Existing actor authorization helpers should support R04.
- Do not add a new workspace table unless current schema proves incapable of representing required authority.
- Do not add a duplicated membership table.
- Do not add a session-to-workspace database table merely for convenience.
- Do not add persistent authorization snapshots.
- Do not add a role cache table.
- If a real invariant gap is discovered, use a forward-only migration.
- Never rewrite historical migrations.
- Any schema change must be narrowly justified and reflected in generated types.

# 43. Potential Membership Invariant Audit
- Inspect whether one actor can have conflicting active memberships for the same tenant/branch.
- Inspect whether multiple tenant-wide active memberships can exist for the same actor/tenant.
- Inspect whether role references are constrained correctly.
- Inspect whether branch belongs to membership tenant through a database constraint or application invariant.
- If current schema already guarantees consistency, add no migration.
- If it does not, prefer validation in resolver unless the defect is a true persistent-data invariant.
- Add a migration only when correctness requires database enforcement.
- Do not create uniqueness that breaks legitimate multi-role membership without understanding current model.

# 44. Generated Types
- If database schema does not change, generated DB type file should not change for R04.
- If schema changes, regenerate using repository-supported command.
- Generated type drift must be treated truthfully.
- Do not manually edit generated types to fake schema alignment.
- AccessContext application types are not generated DB types.

# 45. Workspace Repository Query Shape
- Query should begin from current actor identity.
- Prefer actor-filtered membership joins.
- Include only active membership rows.
- Include user status guard.
- Include tenant identifier.
- Include membership identifier.
- Include role identifier.
- Include branch identifier when branch-bound.
- Include display metadata only when needed for UI.
- Avoid selecting permission rows in workspace discovery by default.
- Avoid selecting credential data.
- Avoid selecting unrelated user PII.
- Avoid selecting audit history.
- Keep result shape narrow.

# 46. Access Resolver Algorithm
- Step 1: validate authenticated actor UUID.
- Step 2: validate optional tenant selector UUID.
- Step 3: validate optional branch selector UUID.
- Step 4: load current actor-authorized workspace records.
- Step 5: return no-access result when none exist.
- Step 6: if tenant selector is absent and exactly one deterministic tenant exists, select it.
- Step 7: if tenant selector is absent and multiple tenants exist, require selection.
- Step 8: filter workspaces to selected tenant.
- Step 9: reject if selected tenant has no authorized membership.
- Step 10: evaluate tenant-wide versus branch-specific scope.
- Step 11: if branch selector exists, verify branch belongs to tenant.
- Step 12: verify selected branch is covered by active membership semantics.
- Step 13: if branch selector absent and exactly one branch is forced, resolve it.
- Step 14: if branch selector absent and multiple legitimate branches exist, require selection when branch is required.
- Step 15: derive exact membership authority record.
- Step 16: derive current role ID from membership.
- Step 17: construct immutable AccessContext.
- Step 18: do not resolve permission list in this round.

# 47. Resolver Result Taxonomy
- Prefer typed results or typed domain errors.
- Avoid generic string exceptions as control flow.
- Suggested states:
- `resolved`.
- `selection_required`.
- `no_access`.
- `invalid_selection`.
- `unavailable`.
- Authentication absence should remain separate from these authorization states.
- `invalid_selection` must not reveal unauthorized tenant details.
- `no_access` should be safe for a legitimately authenticated actor with no memberships.
- `unavailable` represents transient infrastructure failure.
- Route/UI translation should remain outside pure resolver logic.

# 48. Error Taxonomy
- Add `AccessContextError` hierarchy or equivalent only if it improves deterministic handling.
- Distinguish malformed selector from unauthorized selector internally.
- Browser-visible response may intentionally collapse those distinctions.
- Server logs may retain safe structured reason codes.
- Never log credential data.
- Never log session token.
- Never log raw authorization cookie values when avoidable.
- Tenant and branch UUIDs may be logged only under current privacy/observability policy and only when operationally useful.
- Actor UUID should not be unnecessarily exposed to browser errors.

# 49. Failure — No Authenticated Session
- Existing authentication helper redirects or returns null.
- R04 must not duplicate login logic.
- Workspace selector requires authenticated actor.
- Unauthenticated requests go to login.
- Preserve safe `next` path behavior.
- Do not redirect unauthenticated actor directly into workspace selection loop.

# 50. Failure — Authenticated Actor Has No Membership
- Return deterministic no-access state.
- Do not create a fake default workspace.
- Do not fall back to Tenant A.
- Do not fall back to the first database tenant.
- Do not broaden to public data.
- Operational routes must not execute tenant transactions.
- UI should explain that no active workspace is available without leaking internal membership detail.

# 51. Failure — Stale Workspace Selection
- Treat stored selection as hint only.
- Revalidate against current membership.
- If invalid and other workspaces exist, redirect to selector.
- If invalid and none exist, show no-access state.
- Clear stale selection where practical.
- Do not reuse the stale tenant/branch for database queries.
- Do not attempt a tenant transaction before successful re-resolution.

# 52. Failure — Cross-Tenant Selection
- Reject before product-domain query execution.
- Do not reveal target tenant name.
- Do not reveal whether target tenant exists.
- Do not persist rejected selection.
- Add negative integration tests.
- Existing RLS must remain a second layer if an invalid context somehow reaches transaction code.

# 53. Failure — Wrong Branch
- Reject sibling branch for exact-branch member.
- Reject branch from another tenant.
- Reject malformed branch ID.
- Do not silently replace explicitly malicious branch input with an allowed branch.
- Safe auto-resolution is only for absent input, not rejected explicit input.
- Add negative tests for A1 actor requesting A2.
- Add negative tests for Tenant A actor requesting B1.

# 54. Failure — Membership Revoked Mid-Session
- Session may still authenticate actor identity.
- AccessContext resolution must fail for revoked workspace.
- No tenant transaction should run using revoked selection.
- Other active workspace memberships remain available.
- Do not require password reauthentication merely because one membership changed.
- R05 must inherit this live revalidation behavior.

# 55. Failure — Membership Changed Mid-Request
- A single resolved AccessContext is authoritative only for its request/transaction lifetime.
- Do not attempt cross-request cache authority without explicit invalidation design.
- Database RLS/permission helpers remain defense in depth during the transaction.
- If membership is revoked concurrently after context resolution but before protected DB query, current RLS helper semantics should still deny where they recheck membership.
- R04 tests should prove this where practical.
- Do not use long-lived in-memory authorization caches.

# 56. Concurrency Semantics
- Workspace selection persistence may race across tabs/devices.
- Last selected UX hint may win without becoming authority.
- Every execution must revalidate current selector.
- Concurrent membership revocation must not create permanent stale access.
- Concurrent branch reassignment must not create permanent stale access.
- R04 should avoid transactional write state unless needed for selection preference.
- Authorization correctness must not depend on selection-write serialization.

# 57. Idempotency Semantics
- Re-selecting the same valid workspace should be safe.
- Repeated resolver calls should produce equivalent context for unchanged DB state.
- Workspace discovery should be read-only.
- Clearing stale selection should be safe when repeated.
- Redirect behavior should not oscillate between two routes.

# 58. Transaction Semantics
- Workspace discovery uses actor-bound identity transaction.
- Product-domain execution uses tenant transaction.
- Do not combine credential verification transaction with workspace discovery.
- Do not keep DB transaction open across user selection UI.
- Do not keep transaction open across redirects.
- Do not keep transaction open while awaiting external APIs.
- AccessContext resolution should perform bounded database work.
- Tenant transaction must receive resolved actor/tenant/branch data only.

# 59. RLS Defense in Depth
- Application AccessContext resolution is the first authorization boundary.
- RLS remains the second boundary.
- `flow_identity` discovery must not expose unrelated memberships.
- `flow_runtime` domain queries must remain tenant/branch/actor constrained.
- Do not grant broad SELECT merely to simplify workspace discovery.
- Do not switch workspace discovery to database owner credentials.
- Existing negative RLS tests remain required regressions.
- R04 must add tests proving no-membership actor cannot access product rows even while authenticated.

# 60. Security — Least Privilege
- Workspace discovery uses the narrowest existing role.
- Do not broaden `flow_identity` grants without exact need.
- Do not grant direct private credential access.
- Do not grant application user roles database privileges.
- Do not expose role/permission tables directly to browser APIs without filtered server mediation.
- Do not use service-role credentials in client bundles.
- Do not introduce a Supabase service key into Next.js client code.

# 61. Security — Server / Client Boundary
- AccessContext resolution is server-only.
- Workspace repository is server-only.
- Membership status checks are server-only.
- Role lookup is server-only.
- Client receives only display/selectable workspace data required for UX.
- Client never receives authorization helper functions.
- Client never constructs authoritative AccessContext.
- Client never sends actor ID as authority.
- Actor ID comes from Auth.js session server-side.

# 62. Security — Enumeration Resistance
- Unauthorized tenant selection should not disclose tenant existence.
- Unauthorized branch selection should not disclose branch existence.
- Error messages should use generic workspace-unavailable language where appropriate.
- Workspace discovery only lists authorized rows.
- No endpoint should allow arbitrary tenant UUID probing with distinct 404 versus 403 information unless repository policy intentionally permits it.
- Tests should compare unauthorized-selection behavior for existing and random IDs where practical.

# 63. Security — Selection Cookie
- If selection persistence uses a cookie, prefer httpOnly.
- Prefer sameSite=lax unless current architecture needs stricter behavior.
- Use secure in production.
- Keep path scope intentional.
- Store only minimal IDs.
- Do not store permissions.
- Do not store credentials.
- Do not store bearer tokens.
- Do not treat cookie signature as membership proof.
- Revalidate cookie contents every privileged request.
- Delete or replace invalid selection safely.

# 64. Security — Redirect Safety
- Reuse current internal redirect sanitizer.
- Never redirect to protocol-relative URLs.
- Never redirect to external origins from workspace selection input.
- Preserve original internal destination when safe.
- Login to workspace to destination flow must not introduce open redirects.
- Add unit tests for hostile next values.

# 65. Security — Logging / Redaction
- Never log passwords.
- Never log password hashes.
- Never log Auth.js JWTs.
- Never log session cookies.
- Never log legacy session tokens.
- Never dump full membership rows by default.
- Log safe structured event names when needed.
- Suggested reason codes may include `workspace_selection_required`, `workspace_selection_rejected`, `workspace_revoked`.
- Avoid logging full request bodies containing selectors unless current logging policy sanitizes them.

# 66. Security — CSRF
- Workspace selection changes server-side UX state.
- If implemented as POST route, use same-origin semantics and current Next.js/Auth.js protections.
- If implemented as server action, follow installed Next.js guidance.
- Do not implement state-changing selection through a GET query alone if it persists cookies/state.
- GET may display selection but should not silently mutate persistent authority hints.

# 67. Security — XSS
- Workspace names are untrusted display data.
- Render through React escaping.
- Do not inject raw HTML from tenant/branch names.
- Do not build scripts from workspace metadata.
- Do not place unescaped names into inline HTML.

# 68. Security — SQL Injection
- Continue using Kysely/query parameters.
- Do not interpolate tenant or branch IDs into raw SQL strings.
- Existing SQL tagged-template values must remain parameterized.
- UUID validation does not replace query parameterization.

# 69. Workspace Selector UX
- Keep UI minimal and operational.
- Show organization/tenant name.
- Show branch name when relevant.
- Clearly distinguish tenant-wide authority from selected branch context where UX needs it.
- Do not show permissions list in selector.
- Do not show internal role IDs.
- Role display name may be shown only if useful.
- Support keyboard navigation.
- Maintain responsive layout.
- Preserve current design system.
- Do not turn R04 into a broad dashboard redesign.

# 70. Zero-Workspace UX
- Authenticated actor with zero workspace must get explicit safe state.
- Do not redirect indefinitely.
- Provide logout path.
- Avoid exposing admin contact details unless already part of product design.
- Do not imply authentication failed.
- Explain that account is signed in but has no active workspace access.
- Keep wording generic enough for suspended/revoked/no-membership cases.

# 71. Single-Workspace UX
- If exactly one deterministic context exists, auto-resolution is preferred.
- Avoid unnecessary selector friction.
- Still perform server validation.
- If tenant-wide membership has multiple branches, this may not be single-context.
- If route requires no branch, tenant-wide context may be enough.
- If route requires branch, branch choice may still be necessary.

# 72. Multi-Workspace UX
- Present explicit choices.
- Preserve selected internal destination.
- Do not auto-pick first tenant alphabetically.
- Do not auto-pick most recently returned database row without a durable preference contract.
- Do not infer workspace from email domain.
- Do not infer workspace from role name.
- Selection must be explicit when ambiguous.

# 73. Route Integration Boundary
- R04 protected routes require authentication plus resolvable AccessContext.
- R04 does not require permission-specific access.
- Staff route may still be visible to any actor with valid workspace until R05 applies permission gates, unless existing behavior is already narrower.
- Kitchen route may still rely on existing coarse behavior until R05.
- Cashier route may still rely on existing coarse behavior until R05.
- Admin route may still rely on existing coarse behavior until R05.
- Do not prematurely implement permission codes in R04 route guards.
- Do ensure wrong tenant/branch context cannot be used in any route.

# 74. Command Integration Boundary
- R04 may provide a helper that wraps command execution with resolved tenant transaction.
- It must not check command-specific permissions yet.
- Suggested shape: `withCurrentAccessTransaction(callback)`.
- The helper must require authenticated actor.
- The helper must resolve current AccessContext.
- The helper must pass actor/tenant/branch into `withTenantTransaction()`.
- R05 can later compose permission checks inside this boundary.
- Avoid creating many route-specific wrappers.

# 75. AccessContext to Database Mapping
- `actorId` maps to `app.actor_id`.
- `tenantId` maps to `app.tenant_id`.
- Exact `branchId` maps to `app.branch_id`.
- Tenant-only scope maps branch context according to existing transaction semantics.
- Empty branch setting must not accidentally broaden a branch-bound membership.
- The resolver, not callers, decides whether branch may be null.
- Domain code should not accept arbitrary partial context after R04 where AccessContext is available.

# 76. Cache Policy
- Do not introduce long-lived authorization cache in R04.
- Per-request memoization may be used if framework-safe and state-consistent.
- Cache key must include actor and selectors.
- Do not cache across actors.
- Do not cache membership authority beyond request lifetime by default.
- Revocation semantics require fresh server/database state.
- If React request cache is used, document its request scope.

# 77. Observability Contract
- Record access-resolution failures only where operationally useful.
- Distinguish auth missing from workspace missing internally.
- Distinguish invalid selector from transient DB failure internally.
- Do not expose internal reason taxonomy directly if it leaks state.
- Add structured log hooks only if existing logging abstraction exists.
- Do not add a logging dependency in R04.
- Do not add analytics for security decisions unless current telemetry policy supports it.

# 78. Performance Contract
- Workspace discovery should be one bounded query or small fixed number of queries.
- Avoid per-branch membership queries.
- Avoid loading all tenants then filtering in application memory.
- Exact-context resolution should query by actor and selector where practical.
- Add indexes only if explainable from actual query plan/schema deficiency.
- Do not add speculative indexes without evidence.
- Typical internal actor workspace counts are expected to be small, but correctness must not depend on one membership only.

# 79. Dependency Policy
- No new npm dependency expected.
- Use existing Next.js, Auth.js, Kysely, React, and test tooling.
- Do not install a state-management library for workspace selection.
- Do not install a cookie library if Next.js cookies API is sufficient.
- Do not install authorization framework middleware in R04.
- Package-lock should remain unchanged unless a dependency is genuinely required and justified.

# 80. Environment Variables
- No new secret environment variable expected.
- Do not add workspace tenant IDs to env as authority.
- Do not add branch IDs to env as authority.
- Do not add role IDs to env as authority.
- Do not add default production workspace to env.
- Existing Auth.js secret handling remains R03 responsibility.

# 81. Unit Test Matrix — Access Resolver
- valid single exact-branch membership resolves.
- valid tenant-wide membership resolves tenant scope.
- tenant-wide membership plus valid branch resolves branch context.
- malformed actor ID fails.
- malformed tenant ID fails.
- malformed branch ID fails.
- missing tenant with multiple tenants returns selection required.
- missing branch with one forced branch auto-resolves.
- missing branch with multiple choices returns selection required.
- wrong tenant returns invalid selection.
- wrong branch returns invalid selection.
- cross-tenant branch returns invalid selection.
- revoked membership returns no access/invalid selection.
- suspended membership returns no access.
- invited membership returns no access.
- inactive actor returns no access.
- resolver does not include permissions.
- resolver always preserves actor ID from server input.

# 82. Unit Test Matrix — Selection Persistence
- valid selection persists minimal identifiers.
- invalid selection is not persisted.
- stale selection is cleared/ignored.
- repeated valid selection is idempotent.
- hostile external next path is rejected/sanitized.
- internal next path is preserved.
- cookie settings are secure in production mode when cookie storage is used.
- no permissions are serialized.
- no role grants are serialized.

# 83. Integration Test Matrix — Workspace Discovery
- owner A sees Tenant A only unless fixtures explicitly grant more.
- owner A sees legitimate A1/A2 branch choices under tenant-wide authority.
- staff A1 sees A1 only.
- staff A1 does not see A2 as executable scope.
- staff A2 sees A2 only.
- kitchen A1 sees A1 only.
- cashier A2 sees A2 only.
- staff B1 sees Tenant B / B1 only.
- no-membership actor sees zero workspaces.
- invited actor membership is excluded.
- suspended membership is excluded.
- revoked membership is excluded.
- unrelated actor memberships are not returned.

# 84. Integration Test Matrix — AccessContext + DB Runtime
- resolved owner A/A1 context can enter tenant transaction.
- resolved owner A/A2 context can enter tenant transaction.
- staff A1/A1 can enter tenant transaction.
- staff A1/A2 cannot resolve context.
- staff A1/Tenant B cannot resolve context.
- no-membership actor cannot enter product transaction through current-access helper.
- actor ID reaches `app.actor_id`.
- tenant ID reaches `app.tenant_id`.
- branch ID reaches `app.branch_id`.
- transaction-local values disappear after transaction.
- pooled connection does not leak previous actor/tenant/branch.

# 85. Integration Test Matrix — Revocation
- start with active membership.
- resolve workspace successfully.
- revoke membership inside isolated test transaction/setup.
- next resolution fails.
- existing Auth.js identity remains conceptually authenticated.
- no privileged domain query executes through rejected context.
- restore fixture state safely after test.
- sibling active membership remains resolvable.
- role change is reflected on next context resolution.
- branch reassignment is reflected on next context resolution when fixture design allows it.

# 86. Database Test Matrix
- `flow_identity` cannot enumerate unrelated memberships.
- active membership helper remains correct.
- branch-bound actor denied sibling branch.
- tenant-wide actor allowed own tenant branch.
- tenant-wide actor denied other tenant branch.
- no-membership actor denied.
- revoked membership denied.
- suspended membership denied.
- invited membership denied.
- actor context remains transaction-local.
- tenant context remains transaction-local.
- branch context remains transaction-local.
- role/context leakage regression remains green.

# 87. Negative Authorization Matrix
- authenticated actor + random tenant UUID = deny.
- authenticated actor + existing unauthorized tenant UUID = deny.
- authenticated actor + random branch UUID = deny.
- authenticated actor + existing sibling branch = deny.
- authenticated actor + other-tenant branch = deny.
- authenticated actor + revoked membership = deny.
- authenticated actor + suspended membership = deny.
- authenticated actor + invited membership = deny.
- authenticated actor + no membership = deny.
- forged actor ID from client = ignored/not accepted.
- forged role ID from client = ignored/not accepted.
- forged permission list from client = ignored/not accepted.

# 88. Route / UX Test Matrix
- unauthenticated protected route redirects to login.
- authenticated actor with one deterministic workspace reaches route without unnecessary selector.
- authenticated actor with multiple choices reaches selector.
- zero-workspace actor reaches no-access state.
- stale selection redirects to selector/no-access.
- selector preserves safe internal next path.
- selector rejects external next path.
- logout remains reachable from no-access state.
- public customer routes remain public.
- login route remains unaffected by workspace selector.

# 89. Regression Suites
- R01 identity normalization tests remain green.
- R01 password verifier tests remain green.
- R01 throttle tests remain green.
- R01 database least-privilege tests remain green.
- R02 credential fixture tests remain green.
- R02 tenant/branch authorization tests remain green.
- R02 no-membership separation test remains green.
- R03 Auth.js session-claim tests remain green.
- R03 authentication authority cutover tests remain green.
- R03 live authentication integration tests remain green.
- P01/R04 actor/RLS tests remain green.
- Existing build/type/lint suites remain green during implementation validation.

# 90. Validation Commands — Application
- Use repository-defined package scripts only.
- Inspect current `package.json` before execution.
- Run lint.
- Run TypeScript typecheck.
- Run unit tests.
- Run relevant integration tests.
- Run Next.js build.
- Run E2E subset if selector routing is introduced.
- Record actual outcomes in implementation PR.
- This specification document does not execute those commands as document validation.

# 91. Validation Commands — Database
- Use current Supabase local workflow if DB tests are touched.
- Run clean reset when migration/schema scope changes.
- Run R04 SQL tests if added.
- Run inherited R01/R02/P01-R04 SQL suites.
- Run DB lint if database functions/policies change.
- Regenerate types only if schema changes.
- Verify generated-type drift honestly.
- This document does not use GitHub Actions as proof of document correctness.

# 92. Implementation Order — Step 1
- Re-fetch current `main`.
- Read current policy.
- Read exact R04 spec from `main`.
- Identify latest R03 implementation branch.
- Use latest R03 branch as implementation parent.
- Do not branch from docs branch.
- Do not branch from `main` unless policy and actual lineage require it.

# 93. Implementation Order — Step 2
- Re-audit current R03 session contract.
- Confirm actor UUID is available server-side.
- Confirm roles/permissions are not embedded as authority.
- Confirm session helper APIs.
- Confirm protected-route behavior.
- Confirm workspace route does not already exist.
- Reuse equivalent modules if implementation has evolved.

# 94. Implementation Order — Step 3
- Re-audit DB membership model.
- Re-audit user statuses.
- Re-audit membership statuses.
- Re-audit branch/tenant relation.
- Re-audit `flow_identity` grants.
- Re-audit existing authorization helpers.
- Decide whether schema change is unnecessary.

# 95. Implementation Order — Step 4
- Define AccessContext types first.
- Define explicit tenant versus branch scope.
- Define selector input type.
- Define typed resolution results/errors.
- Add unit tests for pure resolution rules.
- Avoid routes/UI before the core contract is stable.

# 96. Implementation Order — Step 5
- Implement actor-bound workspace repository.
- Keep least privilege.
- Query current membership state.
- Filter non-active authority.
- Return narrow rows.
- Add integration tests.

# 97. Implementation Order — Step 6
- Implement AccessContext resolver.
- Validate selectors.
- Handle single/multiple choices.
- Handle tenant-wide versus branch-bound authority.
- Handle no-access state.
- Add negative tests.

# 98. Implementation Order — Step 7
- Bridge Auth.js actor identity to current access helper.
- Add current access lookup.
- Add required access helper.
- Map resolved context into tenant transaction.
- Prove context propagation and cleanup.

# 99. Implementation Order — Step 8
- Implement workspace selection UI/transport only after resolver is stable.
- Keep selection non-authoritative.
- Preserve safe redirects.
- Handle zero/one/multiple workspaces.
- Add route/E2E tests.

# 100. Implementation Order — Step 9
- Integrate AccessContext requirement into protected internal layouts/server entry points.
- Do not add permission codes yet.
- Ensure invalid selection cannot reach domain queries.
- Ensure public routes remain unchanged.
- Ensure no redirect loops.

# 101. Implementation Order — Step 10
- Add revocation/membership-change integration tests.
- Add context leakage tests.
- Add inherited regression suites.
- Run implementation validation.
- Open/update exactly one R04 implementation PR.
- Stop without merging implementation PR.

# 102. Definition of Done — Architecture
- one canonical AccessContext exists.
- one canonical workspace discovery boundary exists.
- one canonical access resolver exists.
- Auth.js session remains identity-only authority.
- client selectors remain non-authoritative.
- tenant transaction consumes server-resolved context.
- R05 can reuse R04 primitives without duplication.

# 103. Definition of Done — Workspace Discovery
- actor sees only current legitimate workspaces.
- inactive memberships are excluded.
- inactive actor is excluded.
- tenant-wide scope is explicit.
- branch-bound scope is explicit.
- cross-tenant leakage is absent.
- discovery ordering is deterministic.
- query shape is bounded.

# 104. Definition of Done — Resolution
- malformed selector fails safely.
- unauthorized tenant fails safely.
- unauthorized branch fails safely.
- cross-tenant branch fails safely.
- single deterministic context resolves safely.
- ambiguous multiple choices require selection.
- no-workspace state is explicit.
- role/membership authority is current server state.

# 105. Definition of Done — Revocation
- revoked membership loses access on next resolution.
- suspended membership loses access on next resolution.
- invited membership never grants executable context.
- no-membership actor gets no context.
- remaining active memberships continue to work.
- stale workspace selection cannot bypass revocation.
- no password reauthentication is required solely for membership revocation.

# 106. Definition of Done — Database Boundary
- workspace discovery uses actor-bound least privilege.
- tenant execution uses existing flow_runtime transaction boundary.
- actor ID is always present for internal privileged tenant execution.
- context is transaction-local.
- pooled context leakage tests pass.
- RLS remains defense in depth.
- no broad table grants are introduced.

# 107. Definition of Done — Security
- no client-controlled authority.
- no permission snapshot in session.
- no role authority trusted from client.
- no unauthorized workspace enumeration.
- no raw credentials/tokens logged.
- stale selections fail closed.
- safe redirect rules are preserved.
- no cross-tenant or sibling-branch escalation.

# 108. Definition of Done — UX
- zero workspace handled.
- one workspace handled.
- multiple workspaces handled.
- stale workspace handled.
- selection loading/error states handled.
- logout available from no-access state.
- responsive behavior preserved.
- UI remains narrow to workspace selection, not dashboard redesign.

# 109. Definition of Done — Tests
- resolver unit tests exist.
- workspace discovery integration tests exist.
- AccessContext/database mapping integration tests exist.
- revocation tests exist.
- negative authorization tests exist.
- context leakage tests exist.
- route/selector tests exist if UI is introduced.
- inherited R01/R02/R03/RLS regressions remain covered.

# 110. Explicit Prohibitions
- do not implement R05 permission route matrix.
- do not implement command-specific permission requirements.
- do not physically remove legacy auth files.
- do not reinstall Auth.js.
- do not replace Auth.js session with custom workspace session.
- do not put permissions into JWT authority.
- do not trust localStorage for access.
- do not trust query parameters for access.
- do not trust workspace cookies without DB revalidation.
- do not create a duplicate membership model.
- do not create a duplicate tenant transaction helper.
- do not grant broad database table access.
- do not perform production destructive DB operations.
- do not refactor unrelated product code.
- do not merge the implementation PR.
- do not enable implementation auto-merge.

# 111. PR Requirements
- PR must identify Phase 02 / Round 04.
- PR must reference `FLOW_P02_R04_IMPLEMENTATION_SPEC.md` from `main`.
- PR must record implementation parent branch.
- PR must record implementation parent SHA.
- PR must record implementation head SHA.
- PR must summarize current R03 session contract inherited.
- PR must list created access-context modules.
- PR must list workspace selector changes.
- PR must declare whether schema changed.
- PR must declare whether migration was added.
- PR must declare whether generated DB types changed.
- PR must declare whether dependency files changed.
- PR must declare whether environment variables changed.
- PR must report actual validation results truthfully.
- PR must include negative authorization evidence.
- PR must include revocation evidence.
- PR must include context leakage evidence.
- PR must call out deferred R05 work.
- PR must remain owner-controlled.

# 112. Expected PR Scope Declaration
```text
PHASE: P02
ROUND: R04
AUTHJS_SESSION_AUTHORITY_CHANGED: NO BY DEFAULT
WORKSPACE_DISCOVERY_IMPLEMENTED: YES
ACCESS_CONTEXT_IMPLEMENTED: YES
TENANT_SELECTION_IMPLEMENTED: YES
BRANCH_SELECTION_IMPLEMENTED: YES
MEMBERSHIP_REVOCATION_HANDLING_IMPLEMENTED: YES
PERMISSION_ROUTE_ENFORCEMENT_IMPLEMENTED: NO
COMMAND_PERMISSION_ENFORCEMENT_IMPLEMENTED: NO
LEGACY_AUTH_REMOVED: NO
PRODUCTION_DB_DESTRUCTIVE_CHANGE: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 113. R05 Handoff Contract
- R05 must inherit a real authenticated actor UUID from R03.
- R05 must inherit a canonical AccessContext from R04.
- R05 must not rediscover workspace selection rules independently.
- R05 must not trust route params as tenant/branch authority.
- R05 must evaluate permission codes against current AccessContext.
- R05 must preserve revocation semantics.
- R05 must preserve actor/tenant/branch DB context.
- R05 must build permission-specific route and command authorization on top of R04 primitives.
- R05 should become thinner because R04 centralizes membership and workspace authority.

# 114. Exact R05 Ownership
- route-to-permission mapping.
- command-to-permission mapping.
- server authorization helper using canonical permission codes.
- unauthorized route behavior by permission.
- unauthorized command behavior by permission.
- staff/kitchen/cashier/admin operational permission separation.
- role/permission relation evaluation.
- permission-denial audit behavior where required.
- R04 must not implement those prematurely.

# 115. R06 Handoff Boundary
- R06 still owns physical legacy-auth source deletion.
- R06 still owns obsolete env cleanup.
- R06 still owns obsolete JOSE/session cleanup where no longer needed.
- R06 still owns final Phase 02 security acceptance.
- R04 must not delete rollback surfaces that R03 intentionally preserved unless current main policy/spec later changes.

# 116. Current-Code Assumptions to Revalidate at Implementation Time
- `src/auth.ts` remains canonical Auth.js server config entry.
- `src/auth.config.ts` remains proxy-compatible config.
- `src/lib/auth/session.ts` returns Auth.js session.
- `session.user.id` remains real actor UUID.
- `withIdentityTransaction()` remains actor-bound discovery primitive.
- `withTenantTransaction()` remains tenant/branch/actor runtime primitive.
- `app.memberships` remains canonical workspace authority relation.
- existing fixture IDs remain stable.
- existing actor permission helpers remain present.
- implementation must re-read actual latest branch before coding.

# 117. Current-Code Surface Audit Requirements
- Inspect `src/auth.ts` before touching any access module.
- Inspect `src/auth.config.ts` before changing redirect behavior.
- Inspect `src/lib/auth/session.ts` before adding current-access helpers.
- Inspect `src/proxy.ts` before making workspace route public-to-authenticated users.
- Inspect `src/server/db/context.ts` before adding context types.
- Inspect `src/server/db/identity-transaction.ts` before adding discovery queries.
- Inspect `src/server/db/transaction.ts` before adding execution wrappers.
- Inspect generated database types before writing Kysely joins.
- Inspect membership table shape before assuming status column names.
- Inspect roles table before returning role display metadata.
- Inspect branches table before assuming lifecycle fields.
- Inspect organizations/tenants relation before naming workspace labels.
- Inspect current internal route layouts before adding context gates.
- Inspect existing redirect sanitizer before adding selector redirects.
- Inspect current cookie naming and auth cookie boundaries before adding selection persistence.
- Inspect installed Next.js docs before route/server-action/cookie implementation.

# 118. Exact Existing Files to Re-Audit
```text
apps/web/next-flow/src/auth.ts
apps/web/next-flow/src/auth.config.ts
apps/web/next-flow/src/proxy.ts
apps/web/next-flow/src/lib/auth/session.ts
apps/web/next-flow/src/lib/auth/redirect.ts
apps/web/next-flow/src/modules/identity/server/index.ts
apps/web/next-flow/src/modules/identity/server/session-claims.ts
apps/web/next-flow/src/server/db/context.ts
apps/web/next-flow/src/server/db/identity-transaction.ts
apps/web/next-flow/src/server/db/transaction.ts
apps/web/next-flow/src/server/db/generated/database.ts
apps/web/next-flow/tests/fixtures/identity.ts
apps/web/next-flow/tests/integration/identity-authorization-contract.test.ts
supabase/migrations/20260816070000_phase4_auth_rbac_tenancy.sql
supabase/migrations/20260819095500_p01_r04_actor_authorization_baseline.sql
supabase/tests/database/p01_r04_actor_authorization_baseline.test.sql
supabase/tests/database/p02_r02_identity_authorization_fixtures.test.sql
```
- If a listed path moved on the latest implementation branch, use the current equivalent.
- Do not recreate historical paths merely to satisfy this authoring-time list.

# 119. AccessContext Invariant Set
- `actorId` must be a valid UUID.
- `tenantId` must be a valid UUID.
- `membershipId` must be a valid UUID when membership IDs are UUIDs in current schema.
- `roleId` must be a valid UUID when role IDs are UUIDs in current schema.
- `scope=BRANCH` requires non-null `branchId`.
- `scope=TENANT` must not imply cross-tenant authority.
- `branchId` must belong to `tenantId`.
- `membershipId` must belong to `actorId`.
- `membershipId` must belong to `tenantId`.
- branch-bound membership must match resolved `branchId`.
- tenant-wide membership may resolve a branch only within its tenant.
- inactive membership cannot construct AccessContext.
- inactive actor cannot construct AccessContext.
- client input cannot override `actorId`.
- client input cannot override `membershipId`.
- client input cannot override `roleId`.

# 120. AccessContext Construction Rules
- Construct AccessContext only from validated repository data.
- Never construct it by spreading request JSON.
- Never construct it by spreading cookie JSON.
- Never construct it by spreading URL search params.
- Normalize nullable branch representation once.
- Avoid mixing `undefined`, empty string, and null as equivalent branch authority states.
- Prefer one canonical no-branch representation.
- Ensure runtime transaction conversion is one-way from AccessContext to DB context.
- Do not provide a helper that turns arbitrary DB context into authorized AccessContext without revalidation.

# 121. Workspace Projection Contract
- UI workspace projection should be separate from authoritative AccessContext when useful.
- Projection may contain `tenantId`.
- Projection may contain `tenantName`.
- Projection may contain `branchId`.
- Projection may contain `branchName`.
- Projection may contain safe role display name.
- Projection may contain scope label.
- Projection must not contain password state.
- Projection must not contain raw permissions by default.
- Projection must not contain hidden unrelated memberships.
- Projection must not contain database-internal audit fields.
- Projection must not become a client-side authorization object.

# 122. Selector State Machine — Unauthenticated
- Input state: no valid Auth.js actor identity.
- Workspace discovery must not run under caller-provided actor.
- Protected route goes to `/login`.
- Safe next path may be preserved.
- Workspace selector must not become a substitute login page.
- No workspace cookie should grant access in this state.

# 123. Selector State Machine — Authenticated / Zero Workspaces
- Actor identity exists.
- Discovery returns no active executable memberships.
- Resolver returns `no_access`.
- Protected operational entry stops.
- UI shows no-access state.
- Logout remains available.
- No selection cookie is created.
- Existing stale selection cookie is cleared/ignored.

# 124. Selector State Machine — Authenticated / One Exact Workspace
- Actor identity exists.
- Discovery returns one exact branch-bound workspace.
- Resolver may auto-resolve without selector page.
- AccessContext uses that membership.
- Tenant and branch come from server data.
- Any conflicting explicit selector must be rejected rather than silently ignored.
- Safe destination proceeds after resolution.

# 125. Selector State Machine — Authenticated / One Tenant-Wide Membership
- Actor identity exists.
- Exactly one tenant-wide membership exists.
- If destination requires only tenant scope, resolver may construct tenant context.
- If destination requires a branch and multiple branches exist, selector is still required.
- If destination requires a branch and exactly one legitimate branch exists, auto-resolution may be used.
- Do not infer branch from last database row.

# 126. Selector State Machine — Multiple Tenants
- Actor identity exists.
- Discovery returns workspaces across multiple tenants.
- Resolver must not guess tenant.
- Selector displays only authorized tenants.
- Explicit tenant choice is required unless valid revalidated selection already exists.
- Branch options shown after tenant choice must be scoped to that tenant.
- Switching tenant invalidates incompatible branch selection.

# 127. Selector State Machine — Multiple Branches in One Tenant
- Actor identity exists.
- Tenant is known and authorized.
- More than one branch is legitimately selectable.
- Resolver requires branch choice for branch-required destination.
- Selector displays only branches actor may use.
- Tenant-wide authority may produce multiple branch options.
- Multiple branch memberships may also produce multiple options.
- Do not collapse them into first branch.

# 128. Selector State Machine — Stale Tenant
- Stored tenant selector no longer authorized.
- Resolver rejects it.
- If other workspaces exist, user returns to selector.
- If none exist, user receives no-access state.
- Stale tenant ID is not used for domain transaction.
- Stale selection is cleared/ignored.
- Do not reveal why access changed beyond safe UX messaging.

# 129. Selector State Machine — Stale Branch
- Tenant remains authorized.
- Stored branch no longer authorized or no longer belongs to current scope.
- Resolver rejects branch.
- If another branch is deterministically forced, implementation may require explicit selection unless policy explicitly permits safe absent-input auto-resolution after clearing stale explicit input.
- Malicious explicit wrong-branch input must not be silently rewritten.
- Stale stored branch should be cleared before fresh selection.

# 130. Selector State Machine — Infrastructure Failure
- Auth.js identity may be valid.
- Workspace DB resolution fails transiently.
- Resolver returns `unavailable` or equivalent.
- Do not reinterpret infrastructure failure as no membership.
- Do not persist a new selection.
- Do not execute tenant transaction.
- UI should expose retryable generic failure.
- Logs may record safe database failure classification.

# 131. Route Redirect Graph
```text
UNAUTHENTICATED PROTECTED REQUEST
→ /login?next=<safe-internal-path>

AUTHENTICATED + NO WORKSPACE
→ /workspace/no-access or equivalent safe state

AUTHENTICATED + SELECTION REQUIRED
→ /workspace?next=<safe-internal-path>

AUTHENTICATED + RESOLVED CONTEXT
→ original safe destination
```
- Exact route names may adapt to current app structure.
- Preserve acyclic redirects.
- Workspace route itself must not redirect back to itself indefinitely.
- No-access state must not redirect back to selector without changed state.

# 132. Workspace Selection Transport Contract
- Mutation must require Auth.js actor identity.
- Mutation must accept only selector fields needed.
- Actor ID must not be accepted from client.
- Membership ID must not be accepted from client as authority.
- Role ID must not be accepted from client as authority.
- Tenant selector must be validated.
- Branch selector must be validated.
- Resolver must run before persistence.
- On valid selection, persist minimal hint if persistence is used.
- On invalid selection, return safe failure/redirect.
- On unavailable DB, do not mutate selection.
- On success, redirect only to sanitized internal destination.

# 133. Suggested Selection Payload
```ts
interface WorkspaceSelectionInput {
  tenantId?: string;
  branchId?: string;
  next?: string;
}
```
- This is a transport input, not an authority object.
- Do not add actorId.
- Do not add roleId.
- Do not add permissions.
- Do not add membership status.
- Server derives all authority fields.

# 134. Suggested Workspace Discovery Type
```ts
interface WorkspaceOption {
  tenantId: string;
  tenantName: string;
  branchId: string | null;
  branchName: string | null;
  scope: "TENANT" | "BRANCH";
}
```
- Exact display fields depend on current schema.
- Internal membership/role IDs may remain server-private if UI does not need them.
- Do not expose permission lists merely for selector rendering.

# 135. Current Access Helper Contract
- `getCurrentAccessContext()` returns null or typed unresolved result for absent authorization.
- `requireCurrentAccessContext()` either returns a valid context or terminates with safe redirect/error.
- The helper must not accept actor ID from caller when session is already available.
- A lower-level resolver may accept explicit actor ID for tests and internal composition.
- Keep testable pure and impure layers separated.
- Avoid hidden global mutable state.

# 136. withCurrentAccessTransaction Contract
- Optional helper may compose current access resolution with tenant transaction.
- It must not swallow authorization failures.
- It must not convert no-access into anonymous execution.
- It must map canonical actor/tenant/branch exactly once.
- It must keep callback inside transaction lifetime.
- It must not perform external HTTP calls by default inside transaction.
- It must remain compatible with R05 adding permission checks before command execution.

# 137. Branch-Required Operation Contract
- Some operations require concrete branch scope.
- R04 should define a narrow helper or type for branch-required context if current code benefits.
- Example conceptual type: `BranchAccessContext`.
- Branch-required helper rejects tenant-only context.
- Do not let each command independently check `if (!branchId)` with divergent behavior.
- R05 may compose permissions on top of branch-required context.

# 138. Tenant-Only Operation Contract
- Some management operations may legitimately be tenant-scoped.
- Tenant-only context must still include actor.
- Tenant-only context must still derive from active membership.
- Tenant-only context must not be obtainable by branch-bound actor if that broadens authority beyond current membership semantics.
- Management permission checks remain R05.

# 139. Membership Precedence Rules
- Exact rules must follow current schema/business semantics.
- If one tenant-wide active membership exists, it is legitimate tenant authority.
- If branch-specific memberships also exist, do not discard them if role distinction matters.
- If current model allows only one role per membership, R04 should avoid inventing multi-role merge semantics.
- If multiple active memberships overlap and yield different role IDs, resolver must not arbitrarily choose without deterministic rule.
- Prefer returning selection/ambiguity error over privilege escalation.
- A database invariant may be added only if overlap is truly invalid domain state.

# 140. Authorization Freshness Rule
- Authentication token may live up to current session max age.
- Workspace authorization must not be considered fresh for that entire lifetime.
- Resolve from current database state at request/command boundary.
- Per-request memoization is acceptable where safe.
- Cross-request cache without invalidation is prohibited by default.
- This is the central revocation guarantee of R04.

# 141. Revocation Timing Contract
- Membership revoked before request starts: deny.
- Membership revoked during workspace resolution: query result governs.
- Membership revoked after resolution but before tenant query: RLS/helper should deny where current database checks membership live.
- Membership revoked after protected mutation commits: mutation already committed under then-current authority; do not retroactively roll back without domain requirement.
- Next request must deny.
- Tests should distinguish these moments.

# 142. Role Change Timing Contract
- Role changed before access resolution: new role ID returned.
- Role changed after access resolution but before R05 permission lookup inside same request may create freshness concern.
- R05 should evaluate permissions from database within execution boundary rather than trusting cached role permission list.
- R04 therefore must not materialize permission snapshot.
- Role ID in AccessContext is identity of current membership role at resolution time, not final permission authority.

# 143. Branch Reassignment Timing Contract
- Membership branch changed before resolution: new branch scope applies.
- Existing stale branch selection fails.
- Current Auth.js identity remains unchanged.
- No forced re-login required.
- AccessContext reflects current membership assignment.
- RLS remains fallback against stale context race.

# 144. User Suspension Timing Contract
- User suspended before resolution: zero access.
- Existing Auth.js token may still parse.
- Workspace discovery must check current user status.
- Protected operational entry denied.
- No tenant query should execute through current-access helper.
- Future R06 may decide whether global session invalidation is required, but R04 authorization already fails closed.

# 145. No-Membership Actor Contract
- R02 proves credential-bearing no-membership user can authenticate.
- R04 must preserve authentication/authorization separation.
- This actor receives valid identity session if R03 permits authentication.
- This actor receives zero workspaces.
- This actor cannot enter tenant transaction through authorized helper.
- This actor provides a required regression test against “authenticated = authorized”.

# 146. Tenant A Owner Contract
- Owner A authenticates as real actor UUID.
- Owner A has tenant-wide Tenant A membership in fixtures.
- Workspace discovery must not expose Tenant B.
- Owner A may choose legitimate Tenant A branches.
- Owner A branch selection must still validate branch tenant relation.
- R04 does not yet grant admin route permission based on owner role; R05 owns that permission gate.

# 147. Staff A1 Contract
- Staff A1 authenticates as actor UUID.
- Staff A1 active membership is Branch A1.
- Discovery returns Branch A1 scope.
- Resolver denies Branch A2.
- Resolver denies Tenant B.
- Clearing branch selector must not broaden Staff A1 to tenant-wide authority.
- R05 later checks `operations.staff.access` and other permissions.

# 148. Staff A2 Contract
- Staff A2 active membership is Branch A2.
- Discovery returns Branch A2 scope.
- Resolver denies Branch A1.
- Resolver denies Tenant B.
- Branch omission may auto-resolve A2 if it is the only legitimate exact branch.
- R05 later handles staff permissions.

# 149. Kitchen A1 Contract
- Kitchen A1 active membership is Branch A1.
- Discovery returns A1 only.
- Workspace resolution is identical in security model to other branch-bound actors.
- R04 does not special-case kitchen route permission.
- R05 later evaluates kitchen permissions.

# 150. Cashier A2 Contract
- Cashier A2 active membership is Branch A2.
- Discovery returns A2 only.
- R04 does not expose payment permission list in selector.
- R04 does not grant cashier route solely from role label.
- R05 later evaluates cashier/payment permissions.

# 151. Staff B1 Contract
- Staff B1 belongs to Tenant B / Branch B1.
- Discovery must not expose Tenant A.
- Resolver denies Tenant A selectors.
- Resolver denies A1/A2 branches.
- Existing tenant isolation tests remain regression evidence.

# 152. Invited Membership Contract
- Invitation is not active operational authority.
- Discovery excludes invited membership.
- Resolver cannot construct context from it.
- Selector never shows it as executable workspace.
- If future invitation acceptance UI is needed, it is separate scope.

# 153. Suspended Membership Contract
- Suspended membership is not operational authority.
- Discovery excludes it.
- Stale selection referencing it fails.
- Auth.js identity may remain signed in.
- Other active memberships, if any, remain available.

# 154. Revoked Membership Contract
- Revoked membership is not operational authority.
- Discovery excludes it.
- Resolver denies it.
- Stale selection is invalidated.
- No silent fallback into same tenant with broader scope unless another explicit active membership authorizes it.

# 155. Branch Belongs-to-Tenant Validation
- Resolver must not assume submitted branch belongs to selected tenant.
- Validate relationship from trusted database data.
- Prefer repository query that joins branch under tenant selector.
- Random valid UUID in another tenant must fail identically to unauthorized existing branch where possible.
- Do not rely on UI dropdown constraints as security.

# 156. Repository Failure Handling
- Database connectivity failure must surface as unavailable, not no-access.
- Query syntax/schema drift failure must fail closed.
- Unexpected duplicate authority rows must fail closed if they create ambiguity.
- Do not pick first row from ambiguous query without explicit ordering/domain rule.
- Wrap low-level DB error in safe domain error where current error architecture supports it.
- Preserve cause server-side when useful.

# 157. Selection Persistence Decision Rule
- Persistence is optional implementation detail, not core authority requirement.
- If no persistence is needed, route parameters/server navigation may carry non-authoritative selectors transiently.
- If persistence improves UX, prefer minimal httpOnly cookie.
- Do not persist full AccessContext.
- Do not persist role/permission data.
- Do not require database table solely for last-selected workspace in R04.
- If an existing user-settings table already supports preference, using it requires explicit justification and should not widen scope.

# 158. Cookie Naming Rules
- Use a clear non-legacy name if a workspace-selection cookie is added.
- Do not reuse `foodflow_session`.
- Do not reuse Auth.js session cookie name.
- Avoid names suggesting authority such as `admin_role` or `permissions`.
- Document lifetime and invalidation behavior.
- Selection cookie lifetime may be shorter or similar to session but authorization must still revalidate every use.

# 159. Selection Cookie Failure Cases
- malformed serialized value: ignore/clear.
- missing tenant: unresolved/selection flow.
- malformed tenant UUID: ignore/clear.
- malformed branch UUID: ignore/clear.
- unauthorized tenant: ignore/clear and selector/no-access.
- unauthorized branch: ignore/clear and selector.
- revoked membership: ignore/clear and selector/no-access.
- signed-in actor changes in same browser: revalidate selection against new actor; never reuse as authority.

# 160. Authentication Actor Change
- Logout then login as different actor must not inherit authority from previous actor’s workspace hint.
- Revalidation should prevent privilege leak even if cookie remains accidentally.
- Prefer clearing workspace selection on logout when practical.
- Prefer clearing/replacing invalid selection after login.
- Add regression test if selection cookie is implemented.

# 161. Multi-Tab Behavior
- Two tabs may select different workspaces if persistence is shared.
- Shared cookie means last selection affects subsequent navigation.
- This is UX behavior, not security issue, because every request revalidates.
- Do not attempt complex per-tab authorization storage in R04.
- If route-embedded selector is used, tabs may naturally differ.
- Document chosen behavior in implementation PR.

# 162. Server Component Boundary
- Server components may call current-access helper.
- Client components receive only safe projection.
- Do not import `server-only` modules into client components.
- Do not serialize database transaction objects.
- Do not serialize internal error causes.
- Keep selector form client behavior thin where possible.

# 163. Route Handler Boundary
- Route handler may parse selection request.
- Route handler gets actor from server session.
- Route handler calls resolver.
- Route handler persists only validated hint.
- Route handler returns redirect or safe JSON based on current app convention.
- Do not expose repository directly as general-purpose API.

# 164. Server Action Boundary
- If server action is chosen, it must follow current Next.js server-action conventions from installed docs.
- Validate form input server-side.
- Read actor identity server-side.
- Resolve current authority server-side.
- Persist validated selection server-side.
- Sanitize redirect destination.
- Do not rely on client-side hidden actor field.

# 165. API Error Response Contract
- Avoid different public responses for “tenant exists but unauthorized” versus “tenant missing”.
- Invalid UUID may return generic invalid selection.
- Infrastructure failure may return generic unavailable.
- Authentication absence remains unauthorized/login redirect.
- No-access state for authenticated actor is semantically distinct from bad credentials.
- Exact HTTP status depends on chosen transport and existing route conventions.

# 166. No-Access Page Contract
- Must be reachable only after authentication or via internal safe flow.
- Must not expose membership status reason if that creates unnecessary disclosure.
- Must offer logout.
- May offer refresh/retry if infrastructure may have recovered.
- Must not offer arbitrary tenant ID entry.
- Must not link directly into operational routes that will loop.

# 167. Workspace Page Loading State
- Server-rendered page may not need client loading skeleton.
- If client transition is used, show bounded pending state.
- Disable duplicate submissions while selection mutation is pending.
- Do not optimistically treat selection as authorized before server response.
- Do not render cached unauthorized options after actor changes.

# 168. Workspace Page Error State
- Transient DB error: show generic retry state.
- No memberships: show no-access state.
- Invalid stale selector: show choices if available.
- Mutation rejected: remain on selector with generic message.
- Avoid showing raw DB errors or UUID relationship details.

# 169. Accessibility Requirements
- Selector options must be keyboard operable.
- Form labels must identify tenant/branch choice.
- Error messaging must be announced appropriately.
- Focus should move predictably after validation failure.
- Do not encode workspace state by color alone.
- Preserve semantic buttons/links.

# 170. Responsive Requirements
- Selector usable on mobile widths.
- Long tenant/branch names wrap safely.
- Cards/list items must not overflow.
- Primary action remains reachable without horizontal scroll.
- Do not add broad responsive redesign outside selector/no-access surfaces.

# 171. Performance — Query Count Budget
- Discovery target: one query where current grants/schema allow.
- Exact selection resolution target: one query or reuse already loaded discovery state within same request.
- Avoid query per permission because R05 owns permissions.
- Avoid query per branch when a join can list authorized branches.
- Any additional fixed query must have clear responsibility.

# 172. Performance — Data Volume
- Select only IDs, names, status/scope fields needed.
- Do not select password/credential columns.
- Do not select audit event payloads.
- Do not select entire permission matrix for selector.
- Avoid `select *` in new repository queries.
- Deterministic ordering should use indexed/stable fields where practical.

# 173. Performance — Index Audit
- Inspect indexes on `app.memberships.user_id` or equivalent actor lookup key.
- Inspect indexes on membership tenant/branch columns.
- Inspect branch tenant relation index.
- Add index only if actual access query lacks reasonable support.
- If adding index, use forward-only migration and explain expected query improvement.
- Do not add duplicate index.

# 174. Database Migration Trigger Conditions
- persistent invariant cannot be safely enforced in application alone.
- missing index causes material query risk proven by schema/query shape.
- existing grants prevent least-privilege discovery and a narrow function is required.
- branch/tenant relation needs database enforcement and current schema lacks it.
- Otherwise, no migration.

# 175. SECURITY DEFINER Rule If New Function Is Required
- Prefer no new function if existing grants support query.
- If a private helper function is required, use fixed `search_path`.
- Return narrow columns only.
- Grant execute only to intended role.
- Revoke public/default execute.
- Do not grant direct underlying table reads broadly.
- Add negative privilege tests.
- Do not accept actor ID as untrusted authority if actor context can be derived transaction-locally.

# 176. Role / Context Leakage Requirements
- `flow_identity` role must end with transaction.
- `flow_runtime` role must end with transaction.
- `app.actor_id` must not persist after transaction.
- `app.tenant_id` must not persist after transaction.
- `app.branch_id` must not persist after transaction.
- Run sequential different-actor tests on reused pool.
- Run sequential different-tenant tests.
- Run sequential different-branch tests.

# 177. Rollback Semantics
- Workspace discovery is read-only.
- Invalid selection persistence must not partially write.
- If cookie persistence occurs after successful resolution, failure to set cookie should not mutate database authority.
- Tenant transaction callback failure must roll back domain mutation under existing transaction semantics.
- Authorization state itself remains database membership state.
- No separate rollback migration is required for R04 by default.

# 178. Recovery Semantics
- Transient DB outage: retry next request.
- Stale cookie: clear and reselect.
- Revoked membership: select another active workspace or no-access.
- Role change: next resolution/permission check uses current state.
- Branch reassignment: stale branch rejected, new legitimate branch selectable.
- Broken schema/invariant: fail closed and surface implementation blocker.

# 179. Test Data Mutation Discipline
- Revocation tests that mutate shared fixtures must restore state.
- Prefer test transaction rollback where supported.
- Avoid ordering-dependent tests.
- Avoid leaving revoked fixtures for later tests.
- Avoid using production-like secrets.
- Deterministic fixture IDs remain stable.

# 180. Unit Test File Expectations
- Candidate: `tests/unit/access-context.test.ts`.
- Candidate: `tests/unit/workspace-selection.test.ts`.
- Candidate: `tests/unit/current-access.test.ts` where pure boundaries exist.
- Reuse existing test naming conventions.
- Keep pure resolver rules separate from DB integration.
- Avoid duplicate test cases across unit/integration unless they prove different layers.

# 181. Integration Test File Expectations
- Candidate: `tests/integration/workspace-access-context.test.ts`.
- Candidate: extend `identity-authorization-contract.test.ts` only if scope remains coherent.
- Prefer new file when R04 behavior is large enough to deserve independent suite.
- Include real DB runtime when DATABASE_URL is available.
- Cleanly destroy shared DB runtime after suite as existing tests do.

# 182. Database Test File Expectations
- Add `supabase/tests/database/p02_r04_access_context.test.sql` only when SQL-level behavior needs new proof.
- If no DB object changes, existing RLS tests plus integration may be sufficient.
- Do not add SQL tests that merely duplicate TypeScript resolver logic.
- SQL tests should target grants, RLS, constraints, or database helper semantics.

# 183. E2E Test Expectations
- Add selector-flow E2E only if UI/route is introduced.
- Test login → workspace → safe destination.
- Test zero-workspace no-access.
- Test stale selection recovery.
- Test external next rejection.
- Keep test authentication fixture compatible with R03 Auth.js flow.
- Do not expose plaintext fixture credentials outside test fixture modules.

# 184. Boundary Input Matrix
- tenantId undefined.
- tenantId empty string.
- tenantId whitespace.
- tenantId malformed UUID.
- tenantId random valid UUID.
- tenantId existing unauthorized UUID.
- branchId undefined.
- branchId empty string.
- branchId whitespace.
- branchId malformed UUID.
- branchId random valid UUID.
- branchId sibling valid UUID.
- branchId other-tenant valid UUID.
- next undefined.
- next internal path.
- next external URL.
- next protocol-relative URL.

# 185. Resolver Determinism Matrix
- same actor + same DB state + same selectors => same context.
- same actor + revoked membership => no context.
- same actor + role changed => updated role metadata.
- same actor + branch reassigned => updated branch scope.
- different actor + same selectors => independently authorized/denied.
- actor B cannot inherit actor A selection authority.

# 186. Security Regression Matrix
- legacy `foodflow_session` alone does not create AccessContext.
- arbitrary workspace cookie alone does not create AccessContext.
- authenticated session without membership does not create AccessContext.
- client-forged actor ID does not affect context.
- client-forged role ID does not affect context.
- client-forged membership ID does not affect context.
- unauthorized tenant ID does not leak tenant details.
- unauthorized branch ID does not leak branch details.
- flow_identity cannot read credentials.
- flow_runtime remains RLS constrained.

# 187. Auth.js Regression Requirements
- Auth.js Credentials provider still authenticates real actor UUID.
- JWT/session claims still expose actor ID.
- workspace logic does not break login.
- workspace logic does not move credential verification into client.
- logout clears or invalidates workspace selection hint where practical.
- proxy remains compatible with Auth.js authorized callback.
- workspace selector is reachable for authenticated actor.

# 188. R05 Compatibility Requirements
- R04 AccessContext must expose enough stable server data for permission checks.
- At minimum actorId/tenantId/scope must be available.
- Branch ID must be available when branch-resolved.
- Membership/role identity should be available if current permission model needs them.
- R05 should not need browser selectors again.
- R05 should not need to duplicate workspace discovery query.
- R05 should not need to alter Auth.js session to add permissions.

# 189. R05 Permission Helper Anticipation
- R04 may shape context so R05 can call `private.actor_has_permission(code, tenantId, branchId)` safely.
- R04 must not call permission helper for route-specific codes yet.
- R04 should ensure branch null semantics are explicit enough for R05.
- R04 should ensure tenant/branch IDs are current and authorized.
- R05 then evaluates canonical permission code within same trusted context.

# 190. R05 Route Matrix Deferred Examples
- `/staff` → operations.staff.access.
- `/kitchen` → operations.kitchen.access.
- `/cashier` → operations.cashier.access.
- `/admin` → management.admin.access.
- These mappings are illustrative existing permission concepts but R04 must not implement them.
- R05 owns exact final route matrix from current code/spec.

# 191. R05 Command Matrix Deferred Examples
- order view/manage.
- kitchen view/manage.
- service view/manage.
- merchant payment view/collect/void.
- menu view/manage.
- settings view/manage.
- member view/invite/manage.
- role view/manage.
- audit view.
- R04 must not wire these command checks.

# 192. Legacy Auth Boundary
- Legacy custom token source remains rollback-only from R03.
- R04 must not restore it as authority.
- Workspace selection must not be attached to legacy session.
- Do not add new legacy-cookie parsing.
- R06 owns physical removal.
- Any accidental dependency on legacy authority discovered during R04 is a defect, not a feature.

# 193. Deployment / Infrastructure Scope
- No new cloud service required.
- No new database provider required.
- No new Vercel integration required.
- No new queue/cache required.
- No branch-protection changes required.
- No CI workflow change expected unless current test discovery genuinely requires narrow wiring.
- Documentation task itself does not modify deployment configuration.

# 194. CI Strategy for Future Implementation
- Existing stable quality contexts remain inherited.
- R04 implementation should trigger real app quality when app code changes.
- DB quality should trigger if DB/test scope requires it.
- Legitimate NOT APPLICABLE behavior remains acceptable where current workflow defines it.
- Do not weaken or rename checks for R04.
- This document does not use CI result as document-validation authority.

# 195. Implementation PR Evidence — Architecture
- exact AccessContext type path.
- exact workspace repository path.
- exact resolver path.
- exact current-access helper path.
- exact selector UI/transport paths.
- explanation of tenant-wide versus branch-bound semantics.
- explanation of selection persistence choice.

# 196. Implementation PR Evidence — Security
- proof client selector is non-authoritative.
- proof no-membership authenticated actor is denied.
- proof sibling branch is denied.
- proof cross-tenant selection is denied.
- proof revoked membership is denied.
- proof no broad DB grant was added.
- proof session remains identity authority only.

# 197. Implementation PR Evidence — Database
- schema changed YES/NO.
- migration added YES/NO.
- generated types changed YES/NO.
- new DB function/grant added YES/NO.
- context leakage test result.
- RLS regression result.
- if no schema change, explicitly state that no migration was needed.

# 198. Implementation PR Evidence — UX
- zero-workspace behavior.
- one-workspace behavior.
- multiple-workspace behavior.
- stale-selection behavior.
- redirect safety.
- logout behavior from no-access.
- responsive/accessibility evidence where UI changed.

# 199. Implementation PR Evidence — Validation
- lint result.
- typecheck result.
- unit test result.
- integration test result.
- build result.
- E2E result if applicable.
- DB test result if applicable.
- inherited regression result.
- use only approved validation vocabulary.

# 200. Stop Conditions During R04 Implementation
- R03 actor session contract is absent/broken on parent branch.
- latest implementation parent cannot be identified.
- membership schema differs materially from spec assumptions and cannot be reconciled safely.
- current RLS semantics contradict expected branch scope.
- implementation would require broad DB grants.
- implementation would require permission-route cutover to function at all, indicating round-boundary problem.
- production destructive data operation appears necessary.
- required secret would need to be exposed client-side.
- In these cases, implementation must stop/report rather than improvise insecurely.

# 201. Document Validation Checklist
- [x] canonical filename uses P02/R04.
- [x] Phase metadata is 02.
- [x] Round metadata is 04.
- [x] Status is READY.
- [x] Previous is R03.
- [x] Next is R05.
- [x] authority source is main.
- [x] implementation lineage points to latest R03 branch.
- [x] implementation PR merge remains owner-controlled.
- [x] scope is workspace/access/revocation only.
- [x] R05 permission enforcement is deferred.
- [x] R06 legacy removal is deferred.
- [x] current R03 code assumptions are grounded in observed branch code.
- [x] least privilege is explicit.
- [x] server/client boundary is explicit.
- [x] tenant/branch denial is explicit.
- [x] revocation semantics are explicit.
- [x] failure/recovery behavior is explicit.
- [x] test matrices are explicit.
- [x] handoff is explicit.
- [x] file-level responsibilities are explicit.
- [x] state machine behavior is explicit.
- [x] concurrency/freshness semantics are explicit.

# 202. Document-Only Validation Policy
- This specification is validated by content consistency and actual repository evidence.
- GitHub Actions are not the authority for document correctness.
- Missing, queued, skipped, failed, or cancelled Actions do not make the document semantically invalid.
- A hosted merge restriction may still technically prevent merge.
- Documentation automation must not change implementation code to satisfy hosted checks.
- Documentation automation must not change CI workflows merely to make a spec PR green.

# 203. Implementation Validation Vocabulary
- Implementation PR must use only `PASS`.
- Or `FAIL`.
- Or `NOT RUN`.
- Or `BLOCKED`.
- Or `NOT APPLICABLE`.
- Do not fabricate PASS.
- This vocabulary applies to future implementation evidence, not this document's own content validation.

# 204. Definition of Done — Architecture
- one canonical AccessContext exists.
- one canonical workspace discovery boundary exists.
- one canonical access resolver exists.
- Auth.js session remains identity-only authority.
- client selectors remain non-authoritative.
- tenant transaction consumes server-resolved context.
- R05 can reuse R04 primitives without duplication.

# 205. Definition of Done — Workspace Discovery
- actor sees only current legitimate workspaces.
- inactive memberships are excluded.
- inactive actor is excluded.
- tenant-wide scope is explicit.
- branch-bound scope is explicit.
- cross-tenant leakage is absent.
- discovery ordering is deterministic.
- query shape is bounded.

# 206. Definition of Done — Resolution
- malformed selector fails safely.
- unauthorized tenant fails safely.
- unauthorized branch fails safely.
- cross-tenant branch fails safely.
- single deterministic context resolves safely.
- ambiguous multiple choices require selection.
- no-workspace state is explicit.
- role/membership authority is current server state.

# 207. Definition of Done — Revocation
- revoked membership loses access on next resolution.
- suspended membership loses access on next resolution.
- invited membership never grants executable context.
- no-membership actor gets no context.
- remaining active memberships continue to work.
- stale workspace selection cannot bypass revocation.
- no password reauthentication is required solely for membership revocation.

# 208. Definition of Done — Database Boundary
- workspace discovery uses actor-bound least privilege.
- tenant execution uses existing flow_runtime transaction boundary.
- actor ID is always present for internal privileged tenant execution.
- context is transaction-local.
- pooled context leakage tests pass.
- RLS remains defense in depth.
- no broad table grants are introduced.

# 209. Definition of Done — Security
- no client-controlled authority.
- no permission snapshot in session.
- no role authority trusted from client.
- no unauthorized workspace enumeration.
- no raw credentials/tokens logged.
- stale selections fail closed.
- safe redirect rules are preserved.
- no cross-tenant or sibling-branch escalation.

# 210. Definition of Done — UX
- zero workspace handled.
- one workspace handled.
- multiple workspaces handled.
- stale workspace handled.
- selection loading/error states handled.
- logout available from no-access state.
- responsive behavior preserved.
- UI remains narrow to workspace selection, not dashboard redesign.

# 211. Definition of Done — Tests
- resolver unit tests exist.
- workspace discovery integration tests exist.
- AccessContext/database mapping integration tests exist.
- revocation tests exist.
- negative authorization tests exist.
- context leakage tests exist.
- route/selector tests exist if UI is introduced.
- inherited R01/R02/R03/RLS regressions remain covered.

# 212. Explicit Prohibitions
- do not implement R05 permission route matrix.
- do not implement command-specific permission requirements.
- do not physically remove legacy auth files.
- do not reinstall Auth.js.
- do not replace Auth.js session with custom workspace session.
- do not put permissions into JWT authority.
- do not trust localStorage for access.
- do not trust query parameters for access.
- do not trust workspace cookies without DB revalidation.
- do not create a duplicate membership model.
- do not create a duplicate tenant transaction helper.
- do not grant broad database table access.
- do not perform production destructive DB operations.
- do not refactor unrelated product code.
- do not merge the implementation PR.
- do not enable implementation auto-merge.

# 213. PR Requirements
- PR must identify Phase 02 / Round 04.
- PR must reference `FLOW_P02_R04_IMPLEMENTATION_SPEC.md` from `main`.
- PR must record implementation parent branch.
- PR must record implementation parent SHA.
- PR must record implementation head SHA.
- PR must summarize current R03 session contract inherited.
- PR must list created access-context modules.
- PR must list workspace selector changes.
- PR must declare whether schema changed.
- PR must declare whether migration was added.
- PR must declare whether generated DB types changed.
- PR must declare whether dependency files changed.
- PR must declare whether environment variables changed.
- PR must report actual validation results truthfully.
- PR must include negative authorization evidence.
- PR must include revocation evidence.
- PR must include context leakage evidence.
- PR must call out deferred R05 work.
- PR must remain owner-controlled.

# 214. Expected PR Scope Declaration
```text
PHASE: P02
ROUND: R04
AUTHJS_SESSION_AUTHORITY_CHANGED: NO BY DEFAULT
WORKSPACE_DISCOVERY_IMPLEMENTED: YES
ACCESS_CONTEXT_IMPLEMENTED: YES
TENANT_SELECTION_IMPLEMENTED: YES
BRANCH_SELECTION_IMPLEMENTED: YES
MEMBERSHIP_REVOCATION_HANDLING_IMPLEMENTED: YES
PERMISSION_ROUTE_ENFORCEMENT_IMPLEMENTED: NO
COMMAND_PERMISSION_ENFORCEMENT_IMPLEMENTED: NO
LEGACY_AUTH_REMOVED: NO
PRODUCTION_DB_DESTRUCTIVE_CHANGE: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 215. R05 Handoff Contract
- R05 must inherit a real authenticated actor UUID from R03.
- R05 must inherit a canonical AccessContext from R04.
- R05 must not rediscover workspace selection rules independently.
- R05 must not trust route params as tenant/branch authority.
- R05 must evaluate permission codes against current AccessContext.
- R05 must preserve revocation semantics.
- R05 must preserve actor/tenant/branch DB context.
- R05 must build permission-specific route and command authorization on top of R04 primitives.
- R05 should become thinner because R04 centralizes membership and workspace authority.

# 216. Exact R05 Ownership
- route-to-permission mapping.
- command-to-permission mapping.
- server authorization helper using canonical permission codes.
- unauthorized route behavior by permission.
- unauthorized command behavior by permission.
- staff/kitchen/cashier/admin operational permission separation.
- role/permission relation evaluation.
- permission-denial audit behavior where required.
- R04 must not implement those prematurely.

# 217. R06 Handoff Boundary
- R06 still owns physical legacy-auth source deletion.
- R06 still owns obsolete env cleanup.
- R06 still owns obsolete JOSE/session cleanup where no longer needed.
- R06 still owns final Phase 02 security acceptance.
- R04 must not delete rollback surfaces that R03 intentionally preserved unless current main policy/spec later changes.

# 218. Final Round State Before Owner Integration
```text
P02/R04 = IMPLEMENTED ON ROUND BRANCH / PR OPEN
```
- Owner merge is not required merely to author future specifications when current documentation pipeline explicitly permits state-driven handoff.
- Implementation branch progression remains governed by current repository policy.
- Documentation authority remains `main`.

# 219. Handoff to Next Round
## Completed state expected from R04
- authenticated actor identity from R03 remains intact.
- current workspaces can be discovered server-side.
- selected tenant/branch is revalidated server-side.
- canonical AccessContext exists.
- active membership is required.
- stale/revoked selection fails closed.
- AccessContext maps to tenant transaction context.
- no permission-specific route enforcement has been added yet.

## Known follow-up for R05
- canonical permission evaluation.
- route protection by permission.
- command authorization by permission.
- staff/kitchen/cashier/admin permission separation.
- denial handling and audit evidence.

## Implementation parent for R05
```text
latest completed P02/R04 implementation branch
```

## Required next specification
```text
FLOW_P02_R05_IMPLEMENTATION_SPEC.md
```

# 220. Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- Future implementation must re-read current `main`.
- Future implementation must use current merge policy.
- Future implementation must use latest R03 implementation branch as R04 parent.
- This documentation task does not create that implementation branch.
- This documentation task does not perform implementation work.

# 221. Acceptance Summary
- R04 solves workspace authority, not authentication.
- R04 solves AccessContext, not route permissions.
- R04 solves membership revocation semantics, not physical session cleanup.
- R04 makes client workspace selection non-authoritative.
- R04 keeps mutable authorization outside the Auth.js session authority.
- R04 makes tenant and branch access deterministic.
- R04 keeps actor, tenant, and branch context transaction-local.
- R04 provides the stable authorization context R05 needs.
- R04 preserves security boundaries established by R01–R03.
- R04 must finish with reusable primitives rather than route-specific duplication.
