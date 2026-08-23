# FLOW P03 R01 — Implementation Specification
> Phase 03 — Core Server Data Plane + Customer Capability
> Round 01 — Customer Capability / Session Boundary
> Revision — Establish the durable customer-facing capability/session primitive that later cart/order persistence can trust without requiring internal staff authentication.

## Metadata
- Phase: `03`
- Round: `01`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P02_R06_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P03_R02_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — first eligible P03 implementation slot after this spec is on main`
- Current planning scope: `PHASE 03 / ROUND 01 ONLY`
- Implementation parent: `latest completed P02/R06 implementation lineage tip`
- Observed P02/R06 merge SHA at authoring: `11b98b433cdd182d7855e252b40476193524aa85`
- Observed Phase 02 acceptance file: `docs/07-delivery/development-phases/FLOW_P02_ACCEPTANCE.md`
- Recommended implementation branch: `p03-r01-customer-capability`
- Recommended implementation PR title: `feat(customer): establish customer capability session boundary`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Customer direct-entry capability in this round: `YES`
- Customer durable session/capability primitive in this round: `YES`
- Internal staff Auth.js changes in this round: `NO`
- Cart persistence in this round: `NO — P03/R03`
- Order persistence in this round: `NO — P03/R03/R04`
- Command-flow orchestration in this round: `NO — P03/R04`
- Idempotency framework in this round: `NO — P03/R05`
- Phase acceptance in this round: `NO — P03/R06`
- Production destructive DB mutation: `NO`

# 1. Authoring State
- Current `main` is the only policy/specification authority.
- Phase 02 implementation was merged through PR #64.
- Current observed Phase 02 merge SHA is `11b98b433cdd182d7855e252b40476193524aa85`.
- Phase 02 acceptance documentation exists on current `main`.
- Phase 02 removed legacy shared internal auth authority.
- Auth.js remains the internal staff/session authority.
- AccessContext remains the internal tenant/branch authorization boundary.
- Route/command permission enforcement remains the internal privileged authorization boundary.
- P03 must not weaken or repurpose those internal staff boundaries for public customer flows.
- `FLOW_P03_R01_IMPLEMENTATION_SPEC.md` did not exist on `main` before this document was authored.
- No `p03-r01-*` implementation branch existed at authoring.
- This task is specification/documentation only.
- This task does not create the P03/R01 implementation branch.
- This task does not modify application/runtime/database code.
- This task does not merge an implementation PR.

# 2. Phase 03 Objective
- Phase 03 creates the first durable customer-facing server data plane.
- It must support customer interaction without requiring internal staff login.
- It must create one canonical customer capability/session primitive.
- It must establish a data access layer that later cart/order code can reuse.
- It must move customer cart/order state away from purely client-local assumptions.
- It must define durable command handling and failure behavior.
- It must define idempotency and retry safety for customer-originated state changes.
- It must preserve tenant/branch isolation.
- It must preserve internal staff authorization from Phase 02.
- It must keep public-customer capability narrower than authenticated internal identity.
- It must avoid turning a QR/table selector into broad database authority.
- It must support anonymous or pseudonymous customer sessions where product requirements allow.
- It must preserve future compatibility with payments, realtime, kitchen, and notifications.
- It must end with a stable server-side customer order data path that later phases can extend.

# 3. Six-Round Phase 03 Boundary
- R01 owns customer capability/session boundary.
- R01 owns public-entry trust model.
- R01 owns capability issuance/validation/revocation semantics.
- R01 owns customer-session server/client boundary.
- R02 owns reusable server data-access layer for customer domain reads/writes.
- R02 owns repository/service transaction composition primitives used by later customer flows.
- R03 owns durable cart and order persistence schema/runtime integration.
- R03 owns cart/order lifecycle storage contracts.
- R04 owns customer command flow from validated capability to durable state mutation.
- R04 owns domain command orchestration and side-effect ordering.
- R05 owns idempotency/retry/concurrency protection for state-changing customer commands.
- R05 owns duplicate-submit/replay protection.
- R06 owns Phase 03 acceptance and end-to-end customer data-plane proof.
- R01 must not pull R03 persistence or R04 command responsibilities forward.

# 4. Why R01 Exists Now
- Phase 02 solved internal human authentication and authorization.
- Public customer entry has a different trust model.
- A customer scanning a QR code should not need internal staff credentials.
- A customer capability must not be equivalent to a staff session.
- Public entry still needs a server-verifiable boundary before durable cart/order state is introduced.
- Without a canonical customer capability, later cart/order persistence would invent ad hoc identity or selector logic.
- Without explicit revocation/expiry semantics, QR/table access could remain valid indefinitely.
- Without branch/tenant binding, a public selector could be replayed across another tenant or branch.
- Without a narrow capability primitive, later API routes may trust table IDs, tenant IDs, or branch IDs from the browser directly.
- R01 therefore removes the largest ambiguity before server persistence begins.

# 5. High-Impact R01 Objective
- Define one canonical customer capability/session model.
- Bind capability to exactly the minimum tenant/branch/table/session context required.
- Make all client-provided tenant/branch/table identifiers selectors or evidence, never authority by themselves.
- Ensure capability issuance is server-controlled.
- Ensure capability validation is server-controlled.
- Ensure capability scope is explicit and immutable per issued token/session.
- Ensure capability expiry is bounded.
- Ensure revoked/closed table or entry context can invalidate future customer mutations.
- Ensure no internal role/permission grants are ever encoded into customer capability.
- Ensure customer capability cannot be exchanged for staff Auth.js authority.
- Ensure customer capability cannot set arbitrary actor/tenant/branch database context.
- Ensure later cart/order commands can require the capability without reimplementing QR/table trust logic.
- Ensure tests prove replay/cross-tenant/wrong-branch/closed-table denial.
- Ensure the implementation remains minimal enough to avoid premature cart/order persistence.

# 6. Existing Internal Authentication Boundary to Preserve
- Auth.js remains for internal human staff/admin sessions.
- Internal sessions expose real application user identity.
- Internal AccessContext derives tenant/branch authority from memberships.
- Internal permission checks derive capability from current database state.
- Customer capability must be a separate authority type.
- Customer capability must not reuse internal membership semantics.
- Customer capability must not create fake `app.users` identities solely for anonymous ordering.
- Customer capability must not use `flow_identity` or `flow_runtime` in a way that bypasses intended RLS.
- If customer DB runtime requires a dedicated role later, that role must be narrower than staff runtime.
- R01 may establish the prerequisite role/function boundary only if truly required for safe capability validation.

# 7. Customer Entry Trust Model
- Primary entry is expected to originate from a business-owned customer entry surface such as QR or direct customer link.
- A QR/link can identify a public entry context.
- The raw URL parameters are not authorization.
- The browser cannot be trusted to keep tenant/branch/table identifiers unchanged.
- The server must resolve and validate the entry context.
- The server must decide whether a capability may be issued.
- Issued capability must bind to the resolved context.
- If entry context is inactive, deleted, expired, or invalid, issuance must fail closed.
- If product allows a non-table customer flow, the capability shape must explicitly support that narrower/alternate scope rather than overloading null fields ambiguously.

# 8. Canonical Customer Capability Concept
- A customer capability is a server-issued proof that a client may interact with a narrow public customer scope.
- It is not a staff login.
- It is not an RBAC role.
- It is not a permission list.
- It is not a tenant admin token.
- It is not a direct database credential.
- It is not a payment credential.
- It is not a customer loyalty identity by default.
- It may represent anonymous customer continuity.
- It may later be associated with a durable cart/session record without changing its trust meaning.
- It must be revocable or fail validation when its underlying scope becomes invalid.
- It must be bounded in lifetime.

# 9. Suggested Capability Shape
```ts
interface CustomerCapability {
  capabilityId: string;
  tenantId: string;
  branchId: string;
  tableId?: string | null;
  tableSessionId?: string | null;
  issuedAt: number;
  expiresAt: number;
  version: 1;
}
```
- Exact fields may adapt to actual schema.
- Avoid ambiguous optionality.
- If table scope is mandatory for the current customer pilot, make it explicit rather than pretending all scopes are supported.
- Do not include staff actor ID.
- Do not include role ID.
- Do not include permission codes.
- Do not include payment details.
- Do not include customer PII unless required by a clearly separate product contract.
- Do not include secrets in client-readable payload if a signed opaque/session model can avoid it.

# 10. Token vs Opaque Session Decision
- Implementation must choose deliberately between signed self-contained capability and opaque server-backed session.
- Decision must be based on revocation, persistence, rotation, and operational complexity.
- If signed token is used, validate signature, issuer/audience/version, expiry, and exact scope every time.
- Signed token must not contain mutable authorization state that can outlive server revocation needs.
- If opaque session is used, token must be high entropy and stored/compared safely.
- Opaque session persistence must not silently become full cart/order persistence.
- R01 may create a minimal capability-session table only if necessary for revocation/expiry semantics.
- Avoid adding a database table merely because it is familiar; justify it from the trust model.

# 11. Signed Capability Decision Matrix
- Advantage: no per-request capability row lookup is required for token integrity.
- Advantage: implementation can stay schema-neutral when existing table/session state is enough for revocation checks.
- Advantage: horizontal runtime scaling does not require shared in-memory session storage.
- Risk: immediate token-specific revocation is harder without server state.
- Risk: key rotation can invalidate all outstanding capabilities if one-key verification is used.
- Risk: claims can become stale if implementation treats them as current mutable state.
- Requirement: signed claims identify scope, but current revocable table/branch/session state must still be checked when required.
- Requirement: capability version must be explicit.
- Requirement: signing algorithm must be allow-listed, never inferred from untrusted token metadata alone.

# 12. Opaque Capability Decision Matrix
- Advantage: immediate per-capability revocation is straightforward.
- Advantage: bearer payload exposes no structured tenant/branch/table claims to client.
- Advantage: token rotation can be handled per session.
- Cost: requires durable server lookup.
- Cost: creates lifecycle/cleanup state that must be bounded.
- Risk: storing raw bearer token creates unnecessary database secret exposure.
- Requirement: persist digest/hash or random identifier strategy that does not expose reusable bearer credential in DB/logs.
- Requirement: lookup must be indexed and bounded.
- Requirement: opaque session table must remain capability infrastructure, not become cart/order persistence.

# 13. Architecture Selection Rule
- Prefer the simplest design that still satisfies revocation and deployment needs.
- Do not choose opaque persistence merely to satisfy a desire for a new table.
- Do not choose signed token merely to avoid all DB state if table/session closure must be authoritative immediately.
- Implementation PR must record why the selected model is safer/smaller for current customer entry.
- If existing `table_sessions` already supplies revocation/lifecycle authority, a signed capability plus current-state validation may be sufficient.
- If no durable lifecycle row exists and immediate capability-specific revoke is a hard requirement, opaque storage becomes more justified.

# 14. Capability Lifetime
- Lifetime must be explicit.
- Lifetime must be appropriate to customer ordering interaction, not staff shift lifetime.
- Avoid indefinite capability tokens.
- Re-entry may issue a new capability.
- Expired capability must fail predictably.
- Expired capability must not produce partial mutations.
- Client should receive a safe recovery path to rescan/re-enter.
- Expiry should not leak internal configuration details.
- The lifetime constant should be unit tested.
- Implementation should document why the selected duration balances table-session usability and stale-token risk.

# 15. Capability Revocation
- Underlying table/session closure may revoke effective capability use.
- Underlying branch deactivation must revoke effective capability use.
- Underlying tenant/business deactivation must revoke effective capability use if lifecycle state exists.
- Explicit server-side capability revocation may be required if opaque sessions are used.
- Revocation must be checked before privileged customer mutation.
- Revocation state must not rely only on client cookie deletion.
- Old capability replay must fail after server revocation when the chosen design promises revocation.
- Revocation checks must be deterministic rather than based on UI visibility.

# 16. Tenant and Branch Binding
- Every customer capability must be tenant-bound.
- Every customer capability must be branch-bound for FoodFlow customer entry.
- The client cannot change branch after issuance by changing URL/body fields.
- Any later cart/order row created under this capability must inherit tenant/branch from validated capability/server state.
- Mutation payloads should not duplicate authoritative tenant/branch fields unless required for optimistic validation; if present they must be compared, never trusted.
- Cross-tenant capability replay must fail.
- Sibling-branch capability replay must fail.

# 17. Table Binding
- If the current flow is QR table ordering, table scope must be explicit.
- Table must belong to the capability branch.
- Unknown table ID must fail issuance.
- Table from another branch must fail issuance.
- Table from another tenant must fail issuance.
- Inactive/unavailable table must fail issuance if table lifecycle state supports it.
- Table-session closure must invalidate future use when table-session semantics are already present.
- Do not assume table number/display label is a stable authority key.
- Prefer immutable UUID or canonical primary key.

# 18. Public Entry Resolution
- Introduce one server-only resolver for raw customer entry selectors.
- Suggested responsibility: parse → validate → resolve tenant/branch/table → decide eligibility → issue capability.
- Resolver must not expose unrestricted tenant/table search.
- Resolver must not permit arbitrary UUID probing to reveal whether a tenant/table exists.
- Error responses should resist enumeration where practical.
- Resolver must return narrow safe display metadata needed for customer UI only after context is valid.

# 19. Public Entry Resolution Data Contract
- Input should contain only public entry selectors required by current QR/direct-link format.
- Output should distinguish authoritative IDs from display labels.
- Output should not include role/permission/staff membership data.
- Output should not include table-session internals not needed by issuance.
- If public slug maps to tenant/branch/table, resolution should happen in one bounded repository function where practical.
- Resolver should reject conflicting selectors, e.g. a public entry token resolving A1 plus client-supplied A2 override.

# 20. QR Exchange Lifecycle
- Step 1: browser opens business-owned QR/direct-entry URL.
- Step 2: server parses public selector or stable entry token.
- Step 3: server resolves tenant/branch/table ownership.
- Step 4: server checks current entry eligibility.
- Step 5: server issues bounded customer capability.
- Step 6: server stores capability using approved transport.
- Step 7: customer is redirected/rendered into menu/customer surface.
- Step 8: later protected customer request resolves CustomerContext from capability, not original QR query.
- Step 9: expired/revoked capability returns to entry recovery.
- QR parameters must not remain the authority after step 5.

# 21. Stable QR vs Runtime Capability
- Printed QR often needs to remain stable for long periods.
- Runtime customer capability should remain short-lived.
- Therefore stable QR material and runtime bearer capability should be conceptually separate when current product topology benefits from it.
- A stable QR token can act as exchange credential for a narrow table entry.
- Runtime capability becomes the continuing browser authority.
- Avoid putting short-lived bearer capability directly in printed QR unless current product explicitly requires it.

# 22. One-Time Exchange Consideration
- One-time exchange token is optional.
- It is useful only if stable QR token itself would otherwise be a powerful replay credential.
- One-time exchange introduces durable consumption state and may be unnecessary for current dine-in QR design.
- Do not add one-time token database state without a concrete security requirement.
- If chosen, retries must be deterministic and user recovery must remain possible.

# 23. Client Storage Boundary
- Capability storage must be secure for the chosen delivery model.
- Prefer httpOnly cookie for browser session continuity when compatible with request architecture.
- Avoid localStorage for bearer capability when possible because XSS exposure is higher.
- If cookie is used, set appropriate SameSite, Secure in production, Path, and bounded Max-Age/Expires.
- Cookie name must not collide with Auth.js internal staff session cookies.
- Customer capability cookie must not be interpreted by staff auth code.
- Logout/sign-out for staff must not accidentally destroy customer session unless routes intentionally overlap.

# 24. Customer/Staff Cookie Isolation
- Internal Auth.js cookie names remain controlled by Auth.js.
- Customer capability cookie requires distinct explicit name.
- Staff `signOut()` must not be treated as customer-session revocation.
- Customer capability clear helper must not clear Auth.js cookies.
- Customer and staff cookies may coexist in one browser/domain without privilege confusion.
- Proxy must not treat customer cookie as internal authenticated session.
- Customer routes must not treat staff cookie as customer capability.
- Add direct regression tests for both directions.

# 25. Cookie Scope
- Default Path should cover only surfaces that require customer capability if practical without breaking navigation.
- Domain should not be broadened unnecessarily.
- `HttpOnly: true` by default for bearer capability.
- `Secure: true` in production.
- SameSite must be explicit.
- Max-Age must align with capability expiry and never exceed it silently.
- Clear helper must match cookie path/domain attributes so deletion actually works.

# 26. CSRF Boundary
- If customer capability uses cookie authentication for state-changing requests, CSRF risk must be considered.
- SameSite settings alone should not be treated as universal proof against all CSRF scenarios.
- Mutation endpoints should use same-origin protections and request-method discipline.
- If current framework provides server actions with built-in origin checks, still validate capability server-side.
- Avoid exposing a mutation endpoint that accepts GET for state changes.
- Do not place capability tokens in URLs where they can leak via logs/referrers unless design specifically requires one-time exchange tokens.

# 27. Capability Issuance Endpoint / Server Action
- Choose route handler or server action based on current application conventions.
- Input is narrow entry selector data.
- Server resolves actual business context.
- Server issues capability only on valid scope.
- Success response should not expose signing keys or internal DB metadata.
- Failure must be generic enough to avoid unnecessary resource enumeration.
- Endpoint must have rate/resource safety proportional to public exposure.
- Do not add CAPTCHA or external anti-abuse dependency unless evidence justifies it in this round.

# 28. Issuance Atomicity
- If issuance requires no DB write, all validation must complete before cookie is set.
- If opaque row creation is required, row creation must succeed before bearer cookie is returned.
- If cookie set fails after row creation, orphan capability must expire naturally or be safely cleanup-able.
- No cart/order/table mutation should occur merely because capability was issued.
- Issuance failure must not leave partial domain state.

# 29. Capability Validation Primitive
- Introduce one canonical server-only `validateCustomerCapability()` or equivalent.
- It must parse transport safely.
- It must verify token/session integrity.
- It must verify expiry.
- It must verify version.
- It must verify tenant/branch/table binding.
- It must revalidate revocable underlying state as required by design.
- It must return a narrow immutable server context.
- It must never return raw token secret material.

# 30. Canonical CustomerContext
```ts
interface CustomerContext {
  capabilityId: string;
  tenantId: string;
  branchId: string;
  tableId?: string | null;
  tableSessionId?: string | null;
}
```
- Exact shape may adapt to actual schema.
- This context is the server-side output consumed by P03/R02+.
- It must be derived from validated capability, not raw request selectors.
- It should be immutable by convention.
- It should be request-scoped.
- It should be safe to pass into customer data-access/transaction primitives later.

# 31. CustomerContext Invariants
- `tenantId` is always present for FoodFlow customer scope.
- `branchId` is always present for FoodFlow customer scope.
- `tableId` presence follows explicit customer entry mode, not accidental null.
- `tableSessionId` presence follows current session lifecycle model.
- Context does not contain staff actor UUID.
- Context does not contain role/permission authority.
- Context does not contain raw capability token.
- Context fields cannot be overridden by downstream request body.

# 32. Context Naming Discipline
- Use `CustomerContext` or another unambiguous term.
- Do not call it `AccessContext` if that would confuse it with internal R04 AccessContext.
- Do not reuse staff auth types.
- Keep imports visibly separated between internal identity and customer capability modules.
- Public-customer authorization must remain conceptually distinct from employee authorization.

# 33. Expected Module Boundary
- Prefer a cohesive server-only module under a customer/capability namespace.
- Candidate root: `apps/web/next-flow/src/modules/customer/server/`.
- Reuse an existing canonical customer module if present on latest implementation parent.
- Do not create duplicate module trees solely to match this suggestion.
- Keep token/session transport helpers separate from domain cart/order repositories.
- Keep pure parse/validation logic testable without DB where possible.

# 34. Candidate Files to CREATE
- `src/modules/customer/server/customer-capability.ts` — core types/version/lifetime rules.
- `src/modules/customer/server/customer-context.ts` — immutable validated context shape.
- `src/modules/customer/server/resolve-customer-entry.ts` — raw selector to authoritative entry resolution.
- `src/modules/customer/server/issue-customer-capability.ts` — issuance orchestration.
- `src/modules/customer/server/validate-customer-capability.ts` — request-time capability validation.
- `src/modules/customer/server/customer-capability-cookie.ts` — transport only if cookie model chosen.
- `src/modules/customer/server/customer-entry-repository.ts` — narrow DB entry resolution if repository abstraction is not already present.
- `src/modules/customer/server/index.ts` — narrow exports.
- `tests/unit/customer-capability*.test.ts` — pure boundary tests.
- `tests/integration/customer-capability-contract.test.ts` — real DB/context tests.
- Exact file split may be consolidated when simpler without mixing responsibilities.

# 35. `customer-capability.ts` Responsibility
- Capability version constant.
- Capability lifetime constant or validated configuration accessor.
- Structural capability payload type.
- Token/session identifier validation.
- Pure expiry helper when useful.
- No database querying.
- No route redirect logic.
- No cart/order logic.

# 36. `customer-context.ts` Responsibility
- Define immutable downstream server context.
- Convert validated capability/resolution row into context.
- Enforce required branch/table invariants.
- No token signing.
- No cookies.
- No DB query.
- This file becomes a stable dependency for R02+.

# 37. `resolve-customer-entry.ts` Responsibility
- Accept validated public selector input.
- Call narrow repository/function.
- Resolve current tenant/branch/table/session ownership.
- Collapse unavailable/inactive/not-found into safe typed result.
- Return safe issuance material.
- Do not issue token itself if separation improves testability.

# 38. `issue-customer-capability.ts` Responsibility
- Orchestrate resolved entry → capability creation → transport-ready output.
- Generate secure random capability identifier/nonce where needed.
- Apply expiry/version.
- Persist opaque record if selected model requires it.
- Do not return secrets other than the intended bearer representation to transport layer.
- Do not mutate product domain state.

# 39. `validate-customer-capability.ts` Responsibility
- Read already-parsed token input from caller or canonical transport helper.
- Verify cryptographic/opaque validity.
- Enforce expiry/version.
- Revalidate mutable underlying entry/session lifecycle.
- Return typed `CustomerCapabilityResolution`.
- Avoid redirect logic to keep integration reusable.

# 40. `customer-capability-cookie.ts` Responsibility
- Define cookie name and attributes.
- Read token from request cookies.
- Write issued token.
- Clear token.
- Never decode/authorize by itself.
- Never import staff Auth.js config.
- Tests cover exact cookie security attributes.

# 41. `customer-entry-repository.ts` Responsibility
- Execute bounded lookup only.
- Return minimal IDs/status/display metadata required by resolver.
- Use parameterized queries.
- Avoid general-purpose business browsing API.
- No write methods in R01 by default.
- If SECURITY DEFINER function is used instead, repository may wrap that function rather than direct tables.

# 42. Files to MODIFY — Likely Entry Surface
- Existing customer menu/QR entry route may need to call server resolver.
- Existing customer layout may need to read/require CustomerContext.
- Existing table/menu page may need to stop trusting raw query/path selectors after capability issuance.
- Modify only the minimal public customer surface needed to establish the capability.
- Do not redesign menu UI in R01.
- Do not redesign cart UI in R01.

# 43. Files to MODIFY — Environment
- `.env.example` only if new secret/config is necessary.
- Add placeholder with clear server-only comment.
- Do not include sample production-like secret.
- Do not reintroduce removed Phase 02 legacy auth variables.
- Keep Auth.js env contract untouched unless unrelated formatting conflict is unavoidable.

# 44. Files to MODIFY — Package Manifest
- No change by default.
- Add dependency only if selected supported crypto/session approach cannot use existing runtime primitives safely.
- If package manifest changes, lockfile must remain synchronized.
- Do not re-add direct `jose` merely because older FLOW auth used it.

# 45. Files to MOVE
- No move required by default.
- Move only if existing customer auth/session logic is duplicated or located under clearly wrong internal-auth namespace.
- Avoid cosmetic moves.
- Any move must preserve import boundaries and tests.

# 46. Files to REMOVE
- No broad removal required by default.
- Remove only obsolete duplicate customer-session helper if the new canonical module replaces one.
- Do not remove internal Auth.js files.
- Do not remove Phase 02 permission helpers.
- Do not remove existing cart/order code merely because persistence is deferred.

# 47. Files Explicitly NOT to Touch
- Internal Auth.js credential provider unless a compile-only import adaptation is unavoidable.
- Internal AccessContext resolution.
- Route-permission catalog.
- Command-permission catalog.
- Staff/kitchen/cashier/admin protected layouts.
- Payment provider integration.
- Realtime infrastructure.
- Kitchen routing.
- Voice ordering implementation.
- Broad visual system/branding.
- Phase 02 historical migrations.

# 48. Existing Database Surfaces to Audit
- `app.organizations` / tenant root.
- `app.branches`.
- FoodFlow table relation.
- Existing `table_sessions` relation if present.
- Any existing customer/session tables.
- Existing RLS policies for customer-relevant tables.
- Existing tenant/branch constraints.
- Existing status/lifecycle columns.
- Existing indexes supporting QR/table lookup.
- Do not invent parallel tables before this audit.

# 49. Database Change Default
- Default to no schema change if a signed capability can be safely validated from existing state.
- Use a forward-only migration only when durable opaque capability/revocation requires persistence or a missing invariant must be enforced.
- Never rewrite historical migrations.
- Never modify production/linked DB as part of specification execution.
- Generated types must change only if schema changes.

# 50. Opaque Capability Table — Only If Required
- Candidate fields: id/hash, tenant_id, branch_id, table_id, table_session_id, issued_at, expires_at, revoked_at.
- Store a hash of bearer secret when feasible rather than raw reusable bearer token.
- Unique/index lookup by digest.
- Foreign keys must preserve tenant/branch consistency.
- Expiry index may be useful for cleanup but should not be added without operational purpose.
- Direct client access must be denied.
- Table belongs in private/server-owned schema if not product-queryable.

# 51. Opaque Capability Constraints
- `expires_at > issued_at` check.
- `revoked_at` nullable.
- capability digest unique.
- tenant/branch/table foreign keys align with existing schema.
- Avoid storing redundant tenant/branch if FK path can guarantee ownership unless redundancy materially improves RLS/query safety.
- If redundant scope fields are stored, add constraints or trigger/function logic to prevent contradictory scope.

# 52. Signed Capability — Requirements If Chosen
- Strong secret/key management via environment, never source.
- Explicit algorithm allow-list.
- Explicit issuer.
- Explicit audience.
- Explicit version.
- Explicit issued/expiry times.
- Tenant/branch/table claims validated structurally.
- Server state revalidation for revocable context.
- No internal staff claims.
- Rotation strategy documented.
- Reject token signed with wrong key/algorithm/issuer/audience/version.

# 53. Secret Handling
- Capability signing secret or encryption secret must be server-only.
- Do not reuse Auth.js `AUTH_SECRET` unless architecture intentionally defines the same cryptographic authority and there is a strong reason; default is separate secrets to reduce coupling.
- Do not log bearer tokens.
- Do not log raw secrets.
- Do not include secrets in PR text/tests.
- Test secrets must be synthetic and isolated.
- `.env.example` may add placeholder names only if implementation introduces a new runtime secret.

# 54. Enumeration Resistance
- Invalid tenant/table combinations should not reveal unnecessary existence details.
- Public errors may collapse unknown/inactive/unauthorized entry into generic unavailable/invalid entry.
- Internal logs may retain safe reason codes without raw token.
- Timing equalization is not required unless actual lookup path creates a meaningful oracle, but avoid obvious high-cost divergence where practical.
- Do not expose all tables/branches through a public lookup endpoint.

# 55. Input Validation
- Validate UUIDs or canonical public slugs using a centralized parser.
- Reject empty/whitespace inputs.
- Reject malformed percent-encoding safely.
- Reject duplicate/conflicting selector parameters deterministically.
- Enforce sensible maximum length before expensive DB/token operations.
- Normalize only fields where normalization is semantically safe.
- Do not normalize opaque IDs in a way that changes identity.

# 56. Selector Precedence
- If one opaque QR entry token is present, do not also trust tenant/branch/table IDs as overrides.
- If route path already fixes branch/table, request body cannot override it.
- Conflicting duplicated selectors should return invalid entry rather than pick one silently.
- Canonical resolver should define one deterministic precedence rule and unit test it.

# 57. Public Slug / QR Token Consideration
- If QR currently embeds opaque public entry token rather than raw IDs, preserve that stronger pattern.
- Resolve token server-side to tenant/branch/table.
- Do not replace opaque public token with enumerable table UUID unless justified.
- If current QR embeds raw IDs, R01 may introduce an exchange token only if scope/impact remains inside capability boundary.
- Avoid redesigning QR generation unless necessary for security.

# 58. Customer Session Continuity
- Refresh/navigation should preserve validated capability until expiry/revocation.
- New tab behavior should be predictable.
- Multiple browser tabs may share cookie session.
- Session continuity must not imply cart persistence yet.
- R01 must avoid adding local cart semantics merely to prove capability persistence.
- Customer may re-enter after expiry and receive a new capability.

# 59. Re-entry to Different Table
- Customer opening a new QR for different table must not silently retain old table authority.
- Server should validate new entry and replace capability only after success.
- Failed new entry should not necessarily destroy a still-valid old capability unless UX intentionally requires it.
- Implementation PR must document chosen behavior.
- Cross-table cookie fixation must be tested.

# 60. Customer Identity / PII Boundary
- R01 does not establish named customer account identity by default.
- No email/phone collection required unless existing product flow already requires it.
- Do not create `app.users` row for anonymous customer.
- Do not attach loyalty/CRM identity prematurely.
- Future customer identity can associate with capability/cart/order later without changing R01 trust model.

# 61. Customer vs Table Session
- Customer capability and table session are related but not necessarily identical.
- A table session may represent the business/table lifecycle.
- A customer capability may represent one browser/client authorization within that table session.
- Multiple customers/devices may potentially share one table session depending on product design.
- Do not assume one table session = one browser unless current product contract requires it.
- Keep cardinality explicit in tests and docs.

# 62. Table Session Validation
- If table_sessions exists, inspect status fields and lifecycle.
- Capability issuance may require an active/open table session.
- Or issuance may create/open a table session only if that responsibility is already existing customer-entry behavior and safely inside R01.
- Prefer not to make R01 own broad table-session lifecycle if later persistence round should own it.
- If no active table session is required yet, capability may bind directly to table and defer table-session association.
- Document exact decision in implementation PR.

# 63. Table Session Ownership Boundary
- Capability must not be able to bind to table session from another table.
- Table session must belong to same tenant/branch/table chain.
- Closed/completed/cancelled session state must be treated according to current schema semantics.
- If table session can be reopened, new capability issuance must still revalidate current state.
- Do not update table-session lifecycle in validation-only path unless current design explicitly owns that mutation.

# 64. Transaction Boundary
- Capability issuance requiring DB reads should use a narrow server transaction/repository boundary.
- Do not use internal staff `withTenantTransaction()` with fabricated actor identity.
- Do not set `app.actor_id` to fake customer UUID.
- If RLS requires customer-specific role/context, introduce a dedicated narrow customer DB boundary only when necessary.
- Keep role/context transaction-local.
- Avoid pooled connection leakage.

# 65. Dedicated Customer DB Role — Only If Needed
- Prefer existing safe public/server DB access if it already enforces required scope.
- If dedicated role is required, use NOLOGIN/NOBYPASSRLS.
- Grant only execute/select capabilities needed for entry resolution/capability validation.
- No broad product-table write grants in R01.
- No access to credential/private staff identity tables.
- No access to role/permission management.
- Add negative privilege tests.

# 66. Candidate Dedicated Role Contract
- Suggested name only if repository conventions support: `flow_customer` or `flow_customer_entry`.
- NOLOGIN.
- NOBYPASSRLS.
- Usage only on required schema.
- Execute on narrow SECURITY DEFINER entry resolver if direct selects would be too broad.
- No direct grants on `private.user_credentials`.
- No direct grants on memberships/roles/permissions.
- No mutation grants on carts/orders in R01.

# 67. Customer DB Transaction Helper — Only If Needed
- Candidate `withCustomerEntryTransaction()`.
- Must set dedicated role transaction-locally.
- May set only server-validated tenant/branch/table context variables if DB helpers require them.
- Must not set fake staff actor.
- Must clean automatically at transaction end.
- Add pool-leak regression if introduced.
- Avoid creating helper if simple narrow repository under privileged server connection plus SECURITY DEFINER is safer.

# 68. SECURITY DEFINER Requirements
- Use only when table access cannot be safely expressed otherwise.
- Fixed search_path.
- Narrow arguments.
- Narrow return columns.
- Derive authority from server-controlled/token context where possible.
- Revoke public/default execute.
- Grant only intended role.
- Avoid accepting arbitrary tenant/branch IDs as sufficient authority.
- Add SQL tests for cross-tenant denial.

# 69. RLS Boundary
- Existing staff RLS must remain unchanged unless a customer capability-specific policy is genuinely required.
- Do not weaken `flow_runtime` actor membership checks to make customer paths work.
- Do not grant anonymous/authenticated Supabase client broad write access.
- Customer command write policies belong later when persistence/command scope is defined.
- R01 may establish read/validation helper only.
- RLS remains defense in depth, not substitute for capability validation.

# 70. RLS Option A — Server Function Boundary
- Keep direct customer role table access minimal/none.
- SECURITY DEFINER function resolves exact public entry and current lifecycle.
- Function returns only tenant/branch/table/session identifiers and safe display metadata.
- Application issues capability from that narrow result.
- This option is attractive when existing RLS does not naturally support anonymous entry resolution.

# 71. RLS Option B — Narrow Direct Select
- Dedicated customer role gets select only on minimal public-entry tables/columns through RLS.
- Policies ensure only entry-token keyed row/path is visible.
- Avoid broad table enumeration.
- This option is acceptable only if row policy can express public entry safely without turning raw table UUID into authority.
- Compare against Option A before implementing.

# 72. CustomerContext to Future Data Plane
- R02 must receive a stable `CustomerContext` contract.
- R02 should not need to parse QR parameters again.
- R02 should not need to validate bearer token mechanics again.
- R02 should receive tenant/branch/table context from one canonical helper.
- R02 can then build repositories around trusted server context.
- This separation is the principal architectural value of R01.

# 73. Current-Capability Helper
- Candidate `getCurrentCustomerContext()` returns validated context or null/typed result.
- Candidate `requireCurrentCustomerContext()` returns context or produces safe customer-entry recovery.
- Keep redirect/HTTP behavior separate from pure validation where practical.
- Do not make every server module import cookies directly.
- Centralize transport reading.

# 74. Typed Resolution Results
```ts
 type CustomerCapabilityResolution =
   | { status: "resolved"; context: CustomerContext }
   | { status: "missing" }
   | { status: "expired" }
   | { status: "invalid" }
   | { status: "revoked" }
   | { status: "unavailable" };
```
- Exact vocabulary may adapt.
- Distinguish internal diagnostics from user-visible messages.
- Do not expose token validation internals to client.
- Infrastructure failure should fail closed for mutation.

# 75. Resolution Result Semantics
- `missing`: no capability transport present.
- `expired`: integrity was acceptable but time validity ended.
- `invalid`: malformed/tampered/unsupported capability.
- `revoked`: server state intentionally denies previously valid capability.
- `unavailable`: server cannot safely establish authority due to infrastructure/configuration failure.
- UI may collapse some statuses into same customer-facing message while logs/tests retain exact classification.

# 76. Failure Taxonomy
- Missing capability.
- Malformed capability.
- Bad signature/digest.
- Expired capability.
- Unsupported version.
- Unknown/revoked opaque capability.
- Tenant inactive.
- Branch inactive.
- Table invalid/inactive.
- Table session closed.
- DB unavailable.
- Secret misconfigured.
- Cookie malformed.
- Cross-scope selector conflict.

# 77. Failure Behavior — Missing
- Read-only public landing may offer re-entry/exchange.
- Protected customer cart/order commands must not proceed.
- Do not silently fabricate default branch/table.
- Do not borrow staff session context.

# 78. Failure Behavior — Expired
- No mutation.
- Clear stale cookie where practical.
- Redirect/show safe re-entry state.
- Preserve no sensitive payload in redirect.
- Re-entry may issue a fresh capability.

# 79. Failure Behavior — Invalid/Tampered
- No mutation.
- Generic customer-facing error.
- Optional safe structured log reason.
- Do not echo token.
- Do not reveal which signature/claim failed.

# 80. Failure Behavior — Revoked/Closed Scope
- No mutation.
- Do not auto-rebind to another table.
- Require explicit new entry.
- Clear stale capability transport where practical.
- Customer-facing message may indicate session ended without internal identifiers.

# 81. Failure Behavior — Infrastructure Unavailable
- Fail closed for state-changing requests.
- Read-only static menu behavior may degrade only if separately safe and already supported.
- Do not cache stale authorization indefinitely.
- Retry may be offered.
- No partial database writes.

# 82. Secret Misconfiguration Failure
- Missing signing secret must fail capability issuance/validation closed.
- Do not fall back to hard-coded development secret.
- Do not silently switch to unsigned token.
- Error log may state configuration category but not secret content.
- Production boot/build behavior may validate required env according to repository convention.

# 83. Recovery Semantics
- Re-scan/re-enter obtains new capability.
- Expired browser cookie can be replaced.
- Server restart must not invalidate signed capability unless secret rotation occurs.
- Opaque capability survives restart if persisted.
- Secret rotation behavior documented.
- Revoked scope remains revoked after retry.

# 84. Concurrency Semantics
- Concurrent capability validation should be read-safe.
- Concurrent issuance for same browser/table may create multiple valid capabilities unless product explicitly requires one; decide deliberately.
- Do not introduce global single-session lock without need.
- Revocation racing with mutation must fail safely in later command rounds; R01 should define expected validation freshness.
- If opaque sessions include revoke flag, update/read semantics must be transactionally coherent.

# 85. Issuance Race Cases
- Two simultaneous exchanges of same stable QR may both succeed if each yields independent bounded capability.
- This is acceptable if no mutable table/session state is duplicated incorrectly.
- If issuance opens table session, duplicate-open race must be prevented at DB layer or deferred out of R01.
- If opaque token row has uniqueness constraint by browser/session key, define conflict behavior explicitly.
- Do not rely on client disabling button to guarantee uniqueness.

# 86. Revocation Race Cases
- Validation before revocation then later mutation creates TOCTOU risk for future commands.
- R01 must document that downstream mutation rounds revalidate authority at transaction boundary when needed.
- R01 validator alone cannot guarantee authorization freshness across arbitrary delay.
- R02/R04 handoff must preserve ability to resolve current capability close to mutation.
- Do not advertise long-lived in-memory CustomerContext as permanent authority.

# 87. Idempotency Boundary
- R01 issuance may be repeatable but does not own generic command idempotency.
- If exchange request is retried, duplicate capability issuance is acceptable only if harmless and documented.
- Avoid using P03/R05 idempotency key infrastructure early.
- Do not let repeated issuance create unbounded DB rows if opaque sessions are persisted.
- Consider reuse/cleanup strategy if necessary.

# 88. Opaque Session Cleanup
- If opaque rows are introduced, expiry provides bounded retention.
- Cleanup may be lazy or scheduled later; do not add cron/platform service in R01 unless operational need exists.
- Queries must filter expired/revoked rows regardless of cleanup timing.
- Index cleanup fields only when useful.
- Acceptance must not depend on background deletion happening immediately.

# 89. Abuse / Resource Safety
- Public issuance endpoint must cap input sizes.
- Avoid expensive unbounded DB queries.
- Lookup should be indexed by stable entry identifier.
- Avoid creating DB row on every invalid request.
- If opaque session rows are created, avoid unbounded lifetime.
- Rate limiting is optional unless existing infrastructure exists; do not invent broad anti-abuse platform in R01.

# 90. Observability
- Log safe capability event type if logging exists.
- Safe fields: hashed/truncated capability ID if needed, tenant/branch/table IDs only where logs are appropriately protected, reason code, request correlation ID.
- Never log bearer token.
- Never log secret.
- Avoid logging customer PII not otherwise required.
- Do not make successful validation excessively noisy.

# 91. Audit Boundary
- Customer capability issuance/validation is not necessarily a privileged staff audit event.
- Do not flood `audit.events` without explicit audit contract.
- Security-significant revocation/tamper failures may use application security logs.
- Later order commands may create domain/audit events.
- R01 stays focused on capability correctness.

# 92. Performance — Entry Resolution
- Target one bounded lookup/join for public entry resolution where possible.
- Avoid N+1 branch/table lookups.
- Select only required fields.
- Verify relevant indexes.
- Add index only if actual query path lacks support.
- Do not optimize prematurely with cache before correctness.

# 93. Performance — Validation
- Signed validation should be CPU bounded and lightweight.
- Opaque lookup should use indexed digest/ID.
- Server-state revocation checks should be bounded.
- Do not load menu/cart/order data just to validate capability.
- CustomerContext resolution should be reusable by later handlers in same request.

# 94. Performance Budget Evidence
- Implementation PR should state expected query count for entry exchange.
- State expected query count for subsequent validation.
- If table-session revalidation adds query, make it explicit.
- Avoid hidden per-request multiple repository calls that query same scope repeatedly.
- No hard millisecond SLA required without production evidence.

# 95. Cache Safety
- Do not globally cache per-customer capability validation across users.
- Avoid Next.js static caching of request-specific authorization result.
- Mark request-dependent server functions appropriately under current Next.js APIs.
- Re-read installed Next.js docs before implementation where request cookies/cache behavior is version-sensitive.
- Never cache bearer tokens in shared cache keys.

# 96. Server / Client Boundary
- Capability issuance/validation modules are server-only.
- Client receives safe UI state and invokes server endpoints/actions.
- Client must not import signing/verification secrets.
- Client must not decode token and treat claims as authority.
- Client display may decode non-sensitive hints only if explicitly non-authoritative, but default is avoid it.

# 97. API Boundary
- Public route must accept only required entry selectors.
- State-changing future APIs must call `requireCurrentCustomerContext()`.
- R01 may add a `/api/customer/session` or equivalent exchange endpoint.
- Keep route naming aligned with current app conventions.
- Avoid generic `/api/auth` naming that could confuse internal Auth.js.

# 98. API Response Contract — Success
- Prefer redirect/set-cookie or narrow JSON depending current route architecture.
- Do not return token redundantly in body when httpOnly cookie is transport.
- Do not return internal tenant/branch/table lifecycle fields beyond safe UI needs.
- Response must be non-cacheable when it contains session establishment.
- Safe internal next destination may be honored after sanitization.

# 99. API Response Contract — Failure
- Invalid entry: generic 400/404-style unavailable behavior according to route convention.
- Infrastructure unavailable: 503-style or safe page state.
- Secret/config unavailable: fail closed, likely server error without internal detail.
- Do not differentiate cross-tenant existing table vs unknown table publicly when that leaks unnecessary information.
- Never echo bearer capability.

# 100. Frontend Entry UX
- Valid QR/direct entry should establish capability transparently or with minimal confirmation.
- Invalid entry should show safe unavailable state.
- Expired session should offer clear re-entry path.
- Do not expose tenant UUID/table UUID in error copy.
- Preserve existing menu browsing flow where safe.
- Avoid broad visual redesign.

# 101. Loading State
- Entry exchange may show bounded loading state.
- Prevent duplicate destructive actions; issuance itself may be safely repeatable.
- Do not show stale menu/cart as authorized before capability result when protected content depends on it.
- Server-rendered exchange may avoid client loading complexity.

# 102. Empty / Unavailable State
- Clear message that customer session/entry is unavailable.
- Allow rescan/retry where appropriate.
- No staff-login link required by default.
- No internal error details.
- No arbitrary tenant/table input form.

# 103. Accessibility
- Error/retry controls keyboard accessible.
- Status messages announced appropriately.
- QR entry fallback links have meaningful labels.
- Focus behavior predictable after failure.
- No color-only state signaling.

# 104. Responsive
- Entry and unavailable surfaces work on mobile-first widths.
- No horizontal overflow.
- Customer QR flow must remain usable on small screens.
- Avoid unrelated responsive changes.

# 105. Security — XSS
- Do not inject raw entry parameter values into HTML.
- React escaping remains default.
- Sanitize any redirect/next path.
- Avoid rendering raw token.
- Avoid storing bearer capability in DOM attributes.

# 106. Security — SQL Injection
- Use Kysely/parameterized SQL.
- SECURITY DEFINER helpers must use typed parameters.
- No dynamic SQL from raw tenant/table selectors unless properly identifier-safe and genuinely needed.
- Avoid concatenated where clauses.

# 107. Security — Open Redirect
- If exchange preserves destination, sanitize to internal path.
- Reject absolute external URLs.
- Reject protocol-relative URLs.
- Preserve safe query string only as needed.
- Do not put capability in redirect query.

# 108. Security — Cookie Fixation
- Server must issue capability; do not accept client-chosen capability ID as authoritative.
- If cookie already exists for different entry scope, resolution must not silently reuse it across tenant/branch/table.
- Re-entry into another table should issue/replace context deliberately.
- Cross-scope stale cookie must fail or be replaced after server validation.

# 109. Security — Session Confusion
- Customer cookie and staff Auth.js cookies have distinct names and code paths.
- Staff session presence must not automatically grant customer capability.
- Customer capability presence must not grant staff route access.
- Tests must prove both directions.
- Shared browser may hold both safely if product uses same domain.

# 110. Security — Cross-Tenant Replay
- Capability from Tenant A/Branch A1 fails if request tries Tenant B context.
- Underlying DB writes in later rounds must derive scope from context.
- R01 tests should prove validation/context cannot be rebound by input.
- Signed claim mutation invalidates signature.
- Opaque token record scope is immutable except explicit server lifecycle fields.

# 111. Security — Wrong-Branch Replay
- Capability for A1 cannot be used for A2.
- Table must belong to capability branch.
- Future route payload branch IDs must not override context.
- Branch reassignment of table should invalidate old assumptions according to current data model.

# 112. Security — Staff Escalation
- CustomerContext has no actorId for staff identity.
- Customer capability cannot call internal permission helper as if a staff actor exists.
- Customer routes must not set fake `app.actor_id` to satisfy internal RLS.
- No membership/role writes.
- No admin route entry.

# 113. Security — Customer Capability to Internal APIs
- Internal route handlers/server actions must continue to require Auth.js/AccessContext/permissions.
- They must ignore customer capability cookie.
- Do not create a generic middleware that treats either cookie as equivalent authenticated principal.
- Test at least one staff and one admin protected path with only customer capability.

# 114. Security — Staff Session to Customer APIs
- Staff authentication does not automatically authorize customer table scope.
- If staff needs to use customer simulation later, it should be explicit tooling, not implicit cookie fallback.
- R01 customer exchange must validate entry even when staff is signed in.
- This prevents developer/admin browser state from masking customer authorization bugs.

# 115. Security — Secret Rotation
- Document rotation process if signed token used.
- Single active key rotation may invalidate all sessions; acceptable only if documented.
- Multi-key verification is optional and likely unnecessary for MVP.
- Do not overbuild key management in R01.
- Rotation should fail closed for old unsupported keys.

# 116. Database Constraint Audit
- Verify branch belongs to tenant.
- Verify table belongs to tenant/branch.
- Verify table session references table/branch consistently.
- Add constraint only if missing and required for capability correctness.
- Use forward-only migration.
- Add DB tests for new invariant.

# 117. Index Audit
- Entry lookup key/slug/token should have usable unique/index support.
- Table foreign-key branch lookup should have appropriate index if query plan requires it.
- Opaque capability digest must be indexed unique.
- Do not add duplicate index already covered by PK/unique constraint.
- Document any index addition and why R01 request path needs it.

# 118. Generated Types
- No generated type update if no schema change.
- If schema changes, regenerate using repository script.
- Commit resulting generated type changes.
- Verify drift.
- Do not hand-edit generated DB types.

# 119. Migration Safety
- New migration timestamp follows current convention.
- Forward-only.
- Idempotent only where project migration conventions require it; do not hide duplicate schema mistakes with broad exception swallowing.
- No production reset/push.
- Clean local bootstrap required during implementation validation when migration exists.

# 120. Migration Rollback Strategy
- Normal rollback is forward corrective migration, not historical rewrite.
- Capability table/function can remain unused if application rollback required.
- Do not drop existing customer data structures to simplify rollback.
- Document impact if secret/model rollback invalidates newly issued capabilities.

# 121. Environment Variables
- Add only if actual capability design needs secret/config.
- Candidate: `CUSTOMER_CAPABILITY_SECRET` for signed model.
- Candidate lifetime config should prefer code constant unless environment variance is operationally required.
- Avoid excessive env knobs.
- `.env.example` documents placeholders, never values.

# 122. Environment Validation
- Production must not silently start an insecure unsigned capability path.
- Test/development may use explicitly synthetic secret through test harness, not hard-coded runtime fallback.
- Missing required secret should produce deterministic safe failure.
- Vercel/runtime secret values remain configured outside repository.

# 123. Dependency Policy
- Prefer Node/Web Crypto or already installed crypto primitives.
- Do not re-add direct `jose` automatically just because Phase 02 removed it.
- If Auth.js dependency exposes no appropriate public primitive, choose supported maintained package only with clear justification.
- Avoid dependency churn.
- Lockfile changes only when dependency truly changes.

# 124. Next.js Version Discipline
- Read installed Next.js agent docs before changing cookies/route/server-action patterns.
- Use current APIs for async cookies/headers/request behavior.
- Avoid remembered older Next.js conventions.
- Keep server-only boundaries explicit.
- Ensure build/typecheck catches unsupported API assumptions.

# 125. Unit Test Matrix — Parsing
- missing token.
- empty token.
- whitespace token.
- oversized token.
- malformed serialized token.
- unsupported version.
- invalid expiry type.
- expired token.
- future-issued timestamp beyond tolerated skew if enforced.
- malformed tenant ID.
- malformed branch ID.
- malformed table ID.
- malformed table-session ID.

# 126. Unit Test Matrix — Entry Selectors
- no selector.
- empty selector.
- malformed UUID/slug/token.
- duplicate selector values.
- conflicting tenant/branch/table selectors.
- opaque entry token plus conflicting raw IDs.
- valid canonical selector.
- max-length boundary.
- encoded special-character handling.

# 127. Unit Test Matrix — Signed Capability
- valid token resolves.
- wrong signature denies.
- wrong issuer denies.
- wrong audience denies.
- wrong algorithm denies.
- unsupported version denies.
- modified tenant claim denies.
- modified branch claim denies.
- modified table claim denies.
- expired denies.
- secret absence fails closed.

# 128. Unit Test Matrix — Opaque Capability
- valid digest lookup resolves.
- unknown token denies.
- revoked record denies.
- expired record denies.
- raw token is never returned from repository.
- token comparison is safe for expected design.
- malformed token does not trigger unbounded DB query.

# 129. Unit Test Matrix — Cookie Transport
- missing cookie -> missing.
- malformed cookie -> invalid/clear.
- valid cookie parsed server-side.
- Secure enabled in production.
- HttpOnly enabled.
- SameSite set deliberately.
- Max-Age/Expires bounded.
- cookie name distinct from Auth.js.
- clear helper expires cookie.

# 130. Unit Test Matrix — Context
- resolved capability produces immutable CustomerContext.
- tenant ID preserved from server authority.
- branch ID preserved.
- table ID preserved when scoped.
- no staff actor ID present.
- no role ID present.
- no permissions present.
- client selector cannot overwrite fields.

# 131. Unit Test Matrix — Resolution Results
- missing transport maps to missing.
- malformed maps invalid.
- expired maps expired.
- revoked row/scope maps revoked.
- DB throw maps unavailable.
- valid maps resolved.
- user-facing formatter does not leak token reason details.

# 132. Integration Matrix — Entry Resolution
- valid Tenant A / Branch A1 / Table 1 entry resolves.
- unknown table denies.
- A2 table requested under A1 denies.
- Tenant B table under Tenant A denies.
- inactive table denies if status exists.
- inactive branch denies.
- inactive tenant denies if status exists.
- return metadata contains only safe display fields.

# 133. Integration Matrix — Capability Issuance
- valid resolved entry issues capability.
- capability expiry is bounded.
- issued capability scope exactly matches resolved entry.
- conflicting raw selectors cannot alter issued scope.
- invalid entry issues nothing.
- opaque model stores only safe digest/metadata.
- signed model produces valid signature and expected claims only.

# 134. Integration Matrix — Capability Validation
- issued capability resolves same context.
- tampered/unknown capability denies.
- expired denies.
- closed table session denies when applicable.
- revoked opaque capability denies when applicable.
- capability from A1 cannot resolve A2.
- capability from Tenant A cannot resolve Tenant B.
- DB outage returns unavailable/fail-closed.

# 135. Integration Matrix — Cookie Isolation
- customer cookie set does not modify Auth.js cookie.
- customer clear does not remove Auth.js cookie.
- staff signout does not accidentally grant/refresh customer capability.
- customer capability alone does not satisfy internal session helper.
- staff Auth.js alone does not satisfy customer context helper.

# 136. Integration Matrix — Staff Separation
- customer capability does not authenticate `/staff`.
- customer capability does not authenticate `/admin`.
- customer capability does not authenticate `/kitchen`.
- customer capability does not authenticate `/cashier`.
- staff Auth.js session alone does not fabricate customer capability.
- both cookies present remain independently interpreted.
- customer helper never calls staff permission path as authority.

# 137. Integration Matrix — Re-entry
- A1 capability + valid A2 QR results in newly validated A2 capability according to explicit replacement policy.
- failed A2 QR cannot mutate A1 scope.
- stale expired A1 cookie is cleared/replaced on valid re-entry.
- cross-tenant re-entry resolves only after new valid exchange.
- no implicit scope widening from old cookie.

# 138. Database Test Matrix
- customer capability role/function cannot read staff credentials.
- cannot read arbitrary memberships.
- cannot mutate roles/permissions.
- cannot access unrelated tenant entry context.
- valid entry lookup constrained to exact tenant/branch/table.
- new capability table private if introduced.
- public/anon direct reads denied if introduced.
- fixed search_path for SECURITY DEFINER if introduced.

# 139. Database Test Matrix — Context Leakage
- customer DB role returns to previous role after transaction.
- tenant context does not persist to next pooled transaction if set.
- branch context does not persist.
- table context does not persist if introduced.
- no fake actor context remains.
- sequential Tenant A then Tenant B customer requests remain isolated.

# 140. Failure-Path Test Matrix
- missing secret.
- malformed token.
- expired token.
- invalid selector.
- unknown table.
- cross-tenant table.
- branch inactive.
- DB unavailable.
- persistence insert failure if opaque model.
- cookie write failure where testable.
- no partial durable domain state created.

# 141. Concurrency Test Matrix
- two simultaneous validations succeed consistently for valid token.
- validation racing with revocation: post-revocation attempt denies according to transaction freshness.
- two issuance requests do not corrupt state.
- opaque row uniqueness/cleanup semantics remain valid.
- no global mutable singleton stores customer context.

# 142. Security Negative Matrix
- customer token cannot become staff token.
- Auth.js JWT cannot be accepted as customer capability unless explicitly exchanged through customer entry.
- wrong cookie name ignored.
- raw tenant ID without valid entry cannot issue broad capability.
- raw branch ID cannot override capability.
- raw table ID cannot override capability.
- role/permission fields in request are ignored/rejected.
- external redirect rejected.
- token in query is not accepted after exchange unless design explicitly defines one-time inbound token path.

# 143. Regression Suites
- Phase 02 Auth.js tests remain green.
- Phase 02 workspace/access tests remain green.
- Phase 02 permission tests remain green.
- staff route E2E remains green.
- existing customer/menu tests remain green.
- existing database/RLS suites remain green.
- build/type/lint remain green during implementation validation.

# 144. Validation Commands — Future Implementation
- Inspect package scripts first.
- Run lint.
- Run typecheck.
- Run unit tests.
- Run relevant integration tests.
- Run Next build.
- Run customer E2E subset if route/cookie exchange changes.
- If DB migration is added: local Supabase start/reset, DB tests, lint, codegen/drift, DB runtime integration.
- Record actual results only.

# 145. Validation Vocabulary
- `PASS` only for executed success.
- `FAIL` for observed failure.
- `NOT RUN` for unexecuted.
- `BLOCKED` when unable due to blocker.
- `NOT APPLICABLE` when legitimately irrelevant.
- Do not fabricate PASS from source inspection.

# 146. Expected CI Applicability
- Next Flow Quality should perform real work when app code changes.
- Dependency Integrity performs real work when manifest/lockfile changes.
- Supabase Database Quality performs real work when migration/DB runtime paths change according to current workflow classifier.
- Repository/Phase gate remain inherited.
- Implementation PR must report actual hosted outcomes but this document does not use them for document validity.

# 147. Implementation Order — Step 1
- Re-fetch current main.
- Read README/policy/template.
- Read exact R01 spec.
- Identify latest P02/R06 lineage tip.
- Use that lineage as implementation parent according to current policy.
- Confirm P02 modern auth/authz chain is intact.

# 148. Implementation Order — Step 2
- Audit existing public customer entry routes/components.
- Audit QR/link parameter format.
- Audit table/table-session schema.
- Audit existing customer/session utilities.
- Audit RLS/public DB access.
- Decide whether signed or opaque capability is justified.

# 149. Implementation Order — Step 3
- Write architecture decision note in implementation PR description or code comments/tests where durable.
- Lock capability version/lifetime.
- Lock CustomerContext fields.
- Lock failure-result taxonomy.
- Avoid route integration until pure contracts are tested.

# 150. Implementation Order — Step 4
- Define pure capability types/version/lifetime.
- Define CustomerContext.
- Define typed validation result.
- Add unit tests before route integration.
- Keep staff identity types separate.

# 151. Implementation Order — Step 5
- Implement authoritative entry resolver.
- Reuse current DB/query infrastructure.
- Add least-privilege boundary if needed.
- Add cross-tenant/wrong-branch tests.
- Avoid cart/order writes.

# 152. Implementation Order — Step 6
- Implement capability issuer.
- Implement signer/opaque persistence as chosen.
- Implement bounded expiry.
- Implement secret handling.
- Add tamper/expiry tests.

# 153. Implementation Order — Step 7
- Implement transport cookie/header pattern.
- Implement current-context validator.
- Add cookie/session confusion tests.
- Add staff/customer separation tests.

# 154. Implementation Order — Step 8
- Integrate minimal customer entry surface.
- Valid entry receives capability.
- Invalid entry gets safe error/retry.
- Existing menu behavior preserved where possible.
- No broad UI redesign.

# 155. Implementation Order — Step 9
- Add DB/integration tests.
- Add migration only if required.
- Validate pool/role leakage if DB role/context introduced.
- Run inherited Phase 02 regressions.

# 156. Implementation Order — Step 10
- Run implementation validation.
- Record actual results.
- Open exactly one P03/R01 implementation PR.
- Stop.
- Do not implement R02 in same branch.

# 157. Definition of Done — Architecture
- one canonical customer capability authority exists.
- one canonical CustomerContext exists.
- QR/raw selectors are not runtime authorization authority.
- customer and staff authority remain separate.
- later rounds can consume CustomerContext without re-parsing entry selectors.
- no cart/order persistence is prematurely introduced.

# 158. Definition of Done — Issuance
- public entry is resolved server-side.
- invalid/cross-scope entry issues no capability.
- capability lifetime/version explicit.
- cookie/transport bounded and secure.
- chosen signed/opaque design documented.
- no product mutation occurs from issuance alone.

# 159. Definition of Done — Validation
- one canonical validator exists.
- malformed/tampered/unknown token fails closed.
- expiry enforced.
- current tenant/branch/table/session state enforced as required.
- validator returns immutable CustomerContext.
- downstream code does not need raw token.

# 160. Definition of Done — Security
- bounded capability lifetime.
- tamper/unknown token denial.
- cross-tenant denial.
- wrong-branch denial.
- invalid table denial.
- closed/revoked scope denial as applicable.
- no customer-to-staff escalation.
- no staff-to-customer implicit authority.
- no raw token/secret logging.

# 161. Definition of Done — Database
- no broad grants.
- no weakening staff RLS.
- any new role/function is least-privileged.
- any migration is forward-only.
- clean bootstrap passes when schema changes.
- generated types synchronized when needed.
- production DB not mutated.

# 162. Definition of Done — Runtime
- entry issuance works.
- capability persists across intended navigation.
- expiry/re-entry works.
- invalid capability fails safely.
- DB unavailable fails closed for protected customer state actions.
- staff Auth.js remains unaffected.

# 163. Definition of Done — UX
- valid entry reaches intended customer surface.
- invalid entry shows safe state.
- expired/revoked entry has recovery path.
- mobile flow usable.
- accessibility basics preserved.
- no internal IDs/secrets leak in error UI.

# 164. Definition of Done — Tests
- pure capability tests.
- transport tests.
- entry resolution integration tests.
- cross-tenant/branch negative tests.
- staff/customer separation tests.
- DB privilege tests where applicable.
- inherited Phase 02 regressions.
- build/type/lint validation.

# 165. Explicit Prohibitions
- do not create internal staff user for anonymous customer.
- do not reuse staff AccessContext as CustomerContext.
- do not grant customer capability staff permissions.
- do not trust raw tenant/branch/table request fields.
- do not put capability token in logs.
- do not store bearer token in localStorage by default.
- do not weaken RLS.
- do not grant broad anon/authenticated writes.
- do not rewrite historical migrations.
- do not implement cart persistence.
- do not implement order persistence.
- do not implement command orchestration.
- do not implement generic idempotency.
- do not implement payment/realtime/kitchen/voice features.
- do not merge implementation PR.
- do not enable implementation auto-merge.

# 166. PR Requirements — Metadata
- Phase `03`.
- Round `01`.
- exact specification filename.
- implementation parent branch and SHA.
- implementation head SHA.
- chosen capability architecture signed/opaque.
- capability lifetime.
- cookie/transport strategy.
- DB schema change YES/NO.
- migration YES/NO.
- dependency change YES/NO.
- environment change YES/NO.

# 167. PR Requirements — Architecture Evidence
- exact CustomerContext type path.
- exact entry resolver path.
- exact issuer path.
- exact validator path.
- exact transport helper path.
- exact DB function/table/role paths if introduced.
- explanation of stable QR vs runtime capability model.
- explanation of current table-session relation.

# 168. PR Requirements — Security Evidence
- cross-tenant deny.
- sibling/wrong-branch deny.
- invalid table deny.
- expired deny.
- tampered/unknown deny.
- staff route deny with customer capability.
- staff session not accepted as customer capability.
- no broad DB grant.
- token/secret redaction.
- revocation/closed-scope behavior.

# 169. PR Requirements — Validation Evidence
- lint.
- typecheck.
- unit.
- integration.
- build.
- E2E if entry route changed.
- DB reset/tests/lint/codegen if schema changed.
- inherited Phase 02 regression result.
- use only approved validation vocabulary.

# 170. PR Requirements — Failure Evidence
- invalid entry response.
- missing capability response.
- expired capability response.
- DB unavailable response.
- missing secret/config response.
- re-entry recovery behavior.
- no partial domain mutation.

# 171. PR Requirements — Scope Declarations
```text
PHASE: P03
ROUND: R01
CUSTOMER_CAPABILITY_IMPLEMENTED: YES
CUSTOMER_CONTEXT_IMPLEMENTED: YES
PUBLIC_ENTRY_RESOLUTION_IMPLEMENTED: YES
CART_PERSISTENCE_IMPLEMENTED: NO
ORDER_PERSISTENCE_IMPLEMENTED: NO
COMMAND_FLOW_IMPLEMENTED: NO
IDEMPOTENCY_FRAMEWORK_IMPLEMENTED: NO
INTERNAL_AUTHJS_CHANGED: NO BY DEFAULT
PRODUCTION_DB_DESTRUCTIVE_CHANGE: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 172. P03/R02 Handoff
- R02 receives canonical validated CustomerContext.
- R02 receives exact tenant/branch/table scope semantics.
- R02 receives capability failure taxonomy.
- R02 receives current-context server helper.
- R02 must not parse QR selectors as authority.
- R02 must not duplicate capability cryptography/session lookup.
- R02 builds reusable data access/transaction primitives for customer-domain operations.

# 173. R02 Required Reuse
- reuse CustomerContext type.
- reuse require/get customer context helper.
- reuse server-resolved tenant/branch/table IDs.
- reuse failure semantics for missing/invalid/revoked context.
- reuse customer DB role/transaction helper if R01 introduced one.
- do not fork a second customer session concept.

# 174. R02 Expected Focus
- customer-safe data access layer.
- repositories/services for branch/menu/customer-domain access.
- transaction composition.
- context propagation.
- query ownership boundaries.
- error mapping.
- no cart/order persistence yet unless exact future R02 spec says otherwise.
- no command orchestration yet.

# 175. R02 Data Access Requirements Inherited
- repositories accept CustomerContext or narrower derived scope.
- tenant/branch/table are not accepted from arbitrary client body as authority.
- queries remain parameterized.
- customer/public role remains least-privileged.
- no staff permission helper substitution.
- no duplicate capability validation code.

# 176. Phase 03 Future Boundary — R03
- durable cart persistence.
- durable order persistence foundation.
- schema/repository integration.
- lifecycle invariants.
- customer context ownership fields.
- R01 must not implement these now.

# 177. Phase 03 Future Boundary — R04
- command orchestration.
- validated customer actions.
- transactional mutations.
- domain failure mapping.
- event/side-effect ordering.
- R01 must not implement these now.

# 178. Phase 03 Future Boundary — R05
- request idempotency.
- retry safety.
- duplicate submission defense.
- concurrency/race handling for commands.
- dedupe persistence/keys where appropriate.
- R01 must not implement these now.

# 179. Phase 03 Future Boundary — R06
- full customer data-plane acceptance.
- end-to-end entry → context → persistence → command → idempotency proof.
- regression/security acceptance.
- exact Phase 04 handoff.
- R01 must not implement these now.

# 180. Current-Code Assumptions to Revalidate at Implementation Time
- Phase 02 Auth.js session remains current internal authority.
- customer entry route still exists in expected form.
- FoodFlow tables/table_sessions schema remains present.
- tenant/branch IDs remain UUIDs.
- no prior customer capability module has landed after this spec authoring.
- if equivalent module exists, extend/reuse rather than duplicate.
- re-read latest parent branch before coding.

# 181. Repository Paths to Discover Before Coding
- actual customer page route under `src/app`.
- actual QR/table entry link builder/generator.
- actual `restaurant_tables` schema fields.
- actual `table_sessions` lifecycle/status fields.
- actual branch/organization status fields.
- any existing public token/slug field.
- any existing menu API route.
- any existing customer-side cookie helper.
- implementation must update spec assumptions to actual code within round scope, not duplicate equivalent functionality.

# 182. Stop Conditions During Implementation
- exact spec missing/not READY on main.
- latest P02/R06 implementation lineage cannot be identified.
- current entry flow differs materially and requires product redesign beyond capability boundary.
- secure customer capability would require broad DB grants.
- implementation would require weakening Phase 02 staff RLS/authz.
- production destructive DB operation appears necessary.
- secret would need client exposure.
- required QR/table ownership relation cannot be established safely.
- in these cases report blocker rather than improvise.

# 183. Stop Condition — Existing Equivalent Capability
- If latest parent already contains a customer capability/session primitive from unrelated work, do not create duplicate abstraction.
- Audit whether it satisfies this spec.
- Extend/harden it in-place when ownership is clear.
- If existing behavior conflicts fundamentally with this spec, report exact conflict before destructive replacement.

# 184. Stop Condition — Table Lifecycle Ambiguity
- If schema cannot determine whether a table/session is active enough for issuance, do not invent lifecycle status in application code silently.
- Either define minimal DB invariant within R01 if legitimately required or report blocker.
- Do not issue broad never-expiring capability as workaround.

# 185. Document Validation Checklist
- [x] canonical filename P03/R01.
- [x] Phase 03.
- [x] Round 01.
- [x] Status READY.
- [x] Previous P02/R06.
- [x] Next P03/R02.
- [x] authority main.
- [x] implementation parent references completed P02/R06 lineage.
- [x] customer/staff trust models separated.
- [x] tenant/branch/table binding explicit.
- [x] capability lifetime explicit.
- [x] signed-vs-opaque decision explicit.
- [x] QR exchange lifecycle explicit.
- [x] cookie isolation explicit.
- [x] revocation/failure behavior explicit.
- [x] DB least privilege explicit.
- [x] server/client boundary explicit.
- [x] concurrency semantics explicit.
- [x] test matrices explicit.
- [x] later-round boundaries explicit.
- [x] implementation merge owner-controlled.

# 186. Document Internal Consistency Check
- Metadata says R01 only.
- No section authorizes cart/order persistence.
- No section makes customer capability a staff identity.
- No section weakens Phase 02 RLS.
- Candidate migrations are conditional, not mandatory filler.
- Signed/opaque choices converge on same CustomerContext.
- Failure vocabulary remains coherent across transport/service/UI.
- R02 handoff receives capability abstraction rather than implementation-specific bearer details.

# 187. Document-Only Validation Policy
- Document correctness is based on metadata, sequence, current repository evidence, scope, architecture, security, failure/recovery, validation plan, and handoff.
- GitHub Actions are not document-validation authority.
- Failed/queued/skipped/missing Actions do not semantically invalidate this document.
- Hosted GitHub enforcement may technically block docs merge; report as hosted merge restriction if it occurs.
- Documentation task must not alter runtime/CI to force merge.

# 188. Implementation Validation Policy
- Future implementation validation remains separate from this document validation.
- Implementation must run repository-local tests/checks where applicable.
- Do not treat this spec's source audit as runtime proof.
- Required CI failures remain truthful implementation blockers under current repository policy.
- Implementation agent still must not merge its PR.

# 189. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This spec authorizes only P03/R01 implementation after it is on main.
- Future implementation must create a dedicated R01 branch from the latest legitimate P02/R06 lineage under current policy.
- Future implementation agent must stop after implementation/validation/PR creation.
- Owner controls implementation merge.

# 190. Final Handoff Contract
- Output primitive: CustomerContext.
- Authority source: validated customer capability plus current server state.
- Scope: tenant + branch + optional explicit table/session.
- Transport: implementation-selected secure bearer transport.
- Internal staff auth remains independent.
- R02 receives no requirement to understand token cryptography.
- R02 receives no permission to trust original QR parameters.

# 191. Final Acceptance Statement
- P03/R01 is READY as an executable specification document.
- The round creates the customer trust primitive that later server persistence depends on.
- The customer capability is intentionally narrower than internal staff authentication.
- Raw QR/table selectors remain non-authoritative.
- The validated CustomerContext becomes the reusable handoff to P03/R02.
- No cart/order persistence, command orchestration, generic idempotency, or Phase 04 work is included in R01.
