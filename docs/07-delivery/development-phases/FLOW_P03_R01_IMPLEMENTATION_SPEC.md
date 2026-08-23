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

# 11. Capability Lifetime
- Lifetime must be explicit.
- Lifetime must be appropriate to customer ordering interaction, not staff shift lifetime.
- Avoid indefinite capability tokens.
- Re-entry may issue a new capability.
- Expired capability must fail predictably.
- Expired capability must not produce partial mutations.
- Client should receive a safe recovery path to rescan/re-enter.
- Expiry should not leak internal configuration details.

# 12. Capability Revocation
- Underlying table/session closure may revoke effective capability use.
- Underlying branch deactivation must revoke effective capability use.
- Underlying tenant/business deactivation must revoke effective capability use if lifecycle state exists.
- Explicit server-side capability revocation may be required if opaque sessions are used.
- Revocation must be checked before privileged customer mutation.
- Revocation state must not rely only on client cookie deletion.
- Old capability replay must fail after server revocation when the chosen design promises revocation.

# 13. Tenant and Branch Binding
- Every customer capability must be tenant-bound.
- Every customer capability must be branch-bound for FoodFlow customer entry.
- The client cannot change branch after issuance by changing URL/body fields.
- Any later cart/order row created under this capability must inherit tenant/branch from validated capability/server state.
- Mutation payloads should not duplicate authoritative tenant/branch fields unless required for optimistic validation; if present they must be compared, never trusted.
- Cross-tenant capability replay must fail.
- Sibling-branch capability replay must fail.

# 14. Table Binding
- If the current flow is QR table ordering, table scope must be explicit.
- Table must belong to the capability branch.
- Unknown table ID must fail issuance.
- Table from another branch must fail issuance.
- Table from another tenant must fail issuance.
- Inactive/unavailable table must fail issuance if table lifecycle state supports it.
- Table-session closure must invalidate future use when table-session semantics are already present.
- Do not assume table number/display label is a stable authority key.
- Prefer immutable UUID or canonical primary key.

# 15. Public Entry Resolution
- Introduce one server-only resolver for raw customer entry selectors.
- Suggested responsibility: parse → validate → resolve tenant/branch/table → decide eligibility → issue capability.
- Resolver must not expose unrestricted tenant/table search.
- Resolver must not permit arbitrary UUID probing to reveal whether a tenant/table exists.
- Error responses should resist enumeration where practical.
- Resolver must return narrow safe display metadata needed for customer UI only after context is valid.

# 16. Client Storage Boundary
- Capability storage must be secure for the chosen delivery model.
- Prefer httpOnly cookie for browser session continuity when compatible with request architecture.
- Avoid localStorage for bearer capability when possible because XSS exposure is higher.
- If cookie is used, set appropriate SameSite, Secure in production, Path, and bounded Max-Age/Expires.
- Cookie name must not collide with Auth.js internal staff session cookies.
- Customer capability cookie must not be interpreted by staff auth code.
- Logout/sign-out for staff must not accidentally destroy customer session unless routes intentionally overlap.

# 17. CSRF Boundary
- If customer capability uses cookie authentication for state-changing requests, CSRF risk must be considered.
- SameSite settings alone should not be treated as universal proof against all CSRF scenarios.
- Mutation endpoints should use same-origin protections and request-method discipline.
- If current framework provides server actions with built-in origin checks, still validate capability server-side.
- Avoid exposing a mutation endpoint that accepts GET for state changes.
- Do not place capability tokens in URLs where they can leak via logs/referrers unless design specifically requires one-time exchange tokens.

# 18. Capability Issuance Endpoint / Server Action
- Choose route handler or server action based on current application conventions.
- Input is narrow entry selector data.
- Server resolves actual business context.
- Server issues capability only on valid scope.
- Success response should not expose signing keys or internal DB metadata.
- Failure must be generic enough to avoid unnecessary resource enumeration.
- Endpoint must have rate/resource safety proportional to public exposure.
- Do not add CAPTCHA or external anti-abuse dependency unless evidence justifies it in this round.

# 19. Capability Validation Primitive
- Introduce one canonical server-only `validateCustomerCapability()` or equivalent.
- It must parse transport safely.
- It must verify token/session integrity.
- It must verify expiry.
- It must verify version.
- It must verify tenant/branch/table binding.
- It must revalidate revocable underlying state as required by design.
- It must return a narrow immutable server context.
- It must never return raw token secret material.

# 20. Canonical CustomerContext
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

# 21. Context Naming Discipline
- Use `CustomerContext` or another unambiguous term.
- Do not call it `AccessContext` if that would confuse it with internal R04 AccessContext.
- Do not reuse staff auth types.
- Keep imports visibly separated between internal identity and customer capability modules.
- Public-customer authorization must remain conceptually distinct from employee authorization.

# 22. Expected Module Boundary
- Prefer a cohesive server-only module under a customer/capability namespace.
- Candidate root: `apps/web/next-flow/src/modules/customer/server/`.
- Reuse an existing canonical customer module if present on latest implementation parent.
- Do not create duplicate module trees solely to match this suggestion.
- Keep token/session transport helpers separate from domain cart/order repositories.
- Keep pure parse/validation logic testable without DB where possible.

# 23. Candidate Files to CREATE
- `src/modules/customer/server/customer-capability.ts` — core types/version/lifetime rules.
- `src/modules/customer/server/customer-context.ts` — immutable validated context shape.
- `src/modules/customer/server/resolve-customer-entry.ts` — raw selector to authoritative entry resolution.
- `src/modules/customer/server/issue-customer-capability.ts` — issuance orchestration.
- `src/modules/customer/server/validate-customer-capability.ts` — request-time capability validation.
- `src/modules/customer/server/customer-capability-cookie.ts` — transport only if cookie model chosen.
- `src/modules/customer/server/index.ts` — narrow exports.
- `tests/unit/customer-capability*.test.ts` — pure boundary tests.
- `tests/integration/customer-capability-contract.test.ts` — real DB/context tests.
- Exact file split may be consolidated when simpler without mixing responsibilities.

# 24. Files to MODIFY — Likely Entry Surface
- Existing customer menu/QR entry route may need to call server resolver.
- Existing customer layout may need to read/require CustomerContext.
- Existing table/menu page may need to stop trusting raw query/path selectors after capability issuance.
- Modify only the minimal public customer surface needed to establish the capability.
- Do not redesign menu UI in R01.
- Do not redesign cart UI in R01.

# 25. Files to MOVE
- No move required by default.
- Move only if existing customer auth/session logic is duplicated or located under clearly wrong internal-auth namespace.
- Avoid cosmetic moves.
- Any move must preserve import boundaries and tests.

# 26. Files to REMOVE
- No broad removal required by default.
- Remove only obsolete duplicate customer-session helper if the new canonical module replaces one.
- Do not remove internal Auth.js files.
- Do not remove Phase 02 permission helpers.
- Do not remove existing cart/order code merely because persistence is deferred.

# 27. Files Explicitly NOT to Touch
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

# 28. Existing Database Surfaces to Audit
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

# 29. Database Change Default
- Default to no schema change if a signed capability can be safely validated from existing state.
- Use a forward-only migration only when durable opaque capability/revocation requires persistence or a missing invariant must be enforced.
- Never rewrite historical migrations.
- Never modify production/linked DB as part of specification execution.
- Generated types must change only if schema changes.

# 30. Opaque Capability Table — Only If Required
- Candidate fields: id/hash, tenant_id, branch_id, table_id, table_session_id, issued_at, expires_at, revoked_at.
- Store a hash of bearer secret when feasible rather than raw reusable bearer token.
- Unique/index lookup by digest.
- Foreign keys must preserve tenant/branch consistency.
- Expiry index may be useful for cleanup but should not be added without operational purpose.
- Direct client access must be denied.
- Table belongs in private/server-owned schema if not product-queryable.

# 31. Signed Capability — Requirements If Chosen
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

# 32. Secret Handling
- Capability signing secret or encryption secret must be server-only.
- Do not reuse Auth.js `AUTH_SECRET` unless architecture intentionally defines the same cryptographic authority and there is a strong reason; default is separate secrets to reduce coupling.
- Do not log bearer tokens.
- Do not log raw secrets.
- Do not include secrets in PR text/tests.
- Test secrets must be synthetic and isolated.
- `.env.example` may add placeholder names only if implementation introduces a new runtime secret.

# 33. Enumeration Resistance
- Invalid tenant/table combinations should not reveal unnecessary existence details.
- Public errors may collapse unknown/inactive/unauthorized entry into generic unavailable/invalid entry.
- Internal logs may retain safe reason codes without raw token.
- Timing equalization is not required unless actual lookup path creates a meaningful oracle, but avoid obvious high-cost divergence where practical.
- Do not expose all tables/branches through a public lookup endpoint.

# 34. Input Validation
- Validate UUIDs or canonical public slugs using a centralized parser.
- Reject empty/whitespace inputs.
- Reject malformed percent-encoding safely.
- Reject duplicate/conflicting selector parameters deterministically.
- Enforce sensible maximum length before expensive DB/token operations.
- Normalize only fields where normalization is semantically safe.
- Do not normalize opaque IDs in a way that changes identity.

# 35. Public Slug / QR Token Consideration
- If QR currently embeds opaque public entry token rather than raw IDs, preserve that stronger pattern.
- Resolve token server-side to tenant/branch/table.
- Do not replace opaque public token with enumerable table UUID unless justified.
- If current QR embeds raw IDs, R01 may introduce an exchange token only if scope/impact remains inside capability boundary.
- Avoid redesigning QR generation unless necessary for security.

# 36. One-Time Exchange Pattern
- Optional design: QR contains durable public entry key; server exchanges it for short-lived customer capability.
- Durable QR key itself should not be sufficient to execute state-changing customer commands after exchange if replay risk matters.
- Exchange endpoint may revalidate current table/branch status.
- Issued capability becomes the runtime authority for later customer commands.
- This pattern is preferred when QR must remain printable/stable while runtime sessions should expire.

# 37. Customer Session Continuity
- Refresh/navigation should preserve validated capability until expiry/revocation.
- New tab behavior should be predictable.
- Multiple browser tabs may share cookie session.
- Session continuity must not imply cart persistence yet.
- R01 must avoid adding local cart semantics merely to prove capability persistence.
- Customer may re-enter after expiry and receive a new capability.

# 38. Customer Identity / PII Boundary
- R01 does not establish named customer account identity by default.
- No email/phone collection required unless existing product flow already requires it.
- Do not create `app.users` row for anonymous customer.
- Do not attach loyalty/CRM identity prematurely.
- Future customer identity can associate with capability/cart/order later without changing R01 trust model.

# 39. Customer vs Table Session
- Customer capability and table session are related but not necessarily identical.
- A table session may represent the business/table lifecycle.
- A customer capability may represent one browser/client authorization within that table session.
- Multiple customers/devices may potentially share one table session depending on product design.
- Do not assume one table session = one browser unless current product contract requires it.
- Keep cardinality explicit in tests and docs.

# 40. Table Session Validation
- If table_sessions exists, inspect status fields and lifecycle.
- Capability issuance may require an active/open table session.
- Or issuance may create/open a table session only if that responsibility is already existing customer-entry behavior and safely inside R01.
- Prefer not to make R01 own broad table-session lifecycle if later persistence round should own it.
- If no active table session is required yet, capability may bind directly to table and defer table-session association.
- Document exact decision in implementation PR.

# 41. Transaction Boundary
- Capability issuance requiring DB reads should use a narrow server transaction/repository boundary.
- Do not use internal staff `withTenantTransaction()` with fabricated actor identity.
- Do not set `app.actor_id` to fake customer UUID.
- If RLS requires customer-specific role/context, introduce a dedicated narrow customer DB boundary only when necessary.
- Keep role/context transaction-local.
- Avoid pooled connection leakage.

# 42. Dedicated Customer DB Role — Only If Needed
- Prefer existing safe public/server DB access if it already enforces required scope.
- If dedicated role is required, use NOLOGIN/NOBYPASSRLS.
- Grant only execute/select capabilities needed for entry resolution/capability validation.
- No broad product-table write grants in R01.
- No access to credential/private staff identity tables.
- No access to role/permission management.
- Add negative privilege tests.

# 43. SECURITY DEFINER Requirements
- Use only when table access cannot be safely expressed otherwise.
- Fixed search_path.
- Narrow arguments.
- Narrow return columns.
- Derive authority from server-controlled/token context where possible.
- Revoke public/default execute.
- Grant only intended role.
- Avoid accepting arbitrary tenant/branch IDs as sufficient authority.
- Add SQL tests for cross-tenant denial.

# 44. RLS Boundary
- Existing staff RLS must remain unchanged unless a customer capability-specific policy is genuinely required.
- Do not weaken `flow_runtime` actor membership checks to make customer paths work.
- Do not grant anonymous/authenticated Supabase client broad write access.
- Customer command write policies belong later when persistence/command scope is defined.
- R01 may establish read/validation helper only.
- RLS remains defense in depth, not substitute for capability validation.

# 45. CustomerContext to Future Data Plane
- R02 must receive a stable `CustomerContext` contract.
- R02 should not need to parse QR parameters again.
- R02 should not need to validate bearer token mechanics again.
- R02 should receive tenant/branch/table context from one canonical helper.
- R02 can then build repositories around trusted server context.
- This separation is the principal architectural value of R01.

# 46. Current-Capability Helper
- Candidate `getCurrentCustomerContext()` returns validated context or null/typed result.
- Candidate `requireCurrentCustomerContext()` returns context or produces safe customer-entry recovery.
- Keep redirect/HTTP behavior separate from pure validation where practical.
- Do not make every server module import cookies directly.
- Centralize transport reading.

# 47. Typed Resolution Results
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

# 48. Failure Taxonomy
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

# 49. Failure Behavior — Missing
- Read-only public landing may offer re-entry/exchange.
- Protected customer cart/order commands must not proceed.
- Do not silently fabricate default branch/table.
- Do not borrow staff session context.

# 50. Failure Behavior — Expired
- No mutation.
- Clear stale cookie where practical.
- Redirect/show safe re-entry state.
- Preserve no sensitive payload in redirect.
- Re-entry may issue a fresh capability.

# 51. Failure Behavior — Invalid/Tampered
- No mutation.
- Generic customer-facing error.
- Optional safe structured log reason.
- Do not echo token.
- Do not reveal which signature/claim failed.

# 52. Failure Behavior — Revoked/Closed Scope
- No mutation.
- Do not auto-rebind to another table.
- Require explicit new entry.
- Clear stale capability transport where practical.
- Customer-facing message may indicate session ended without internal identifiers.

# 53. Failure Behavior — Infrastructure Unavailable
- Fail closed for state-changing requests.
- Read-only static menu behavior may degrade only if separately safe and already supported.
- Do not cache stale authorization indefinitely.
- Retry may be offered.
- No partial database writes.

# 54. Recovery Semantics
- Re-scan/re-enter obtains new capability.
- Expired browser cookie can be replaced.
- Server restart must not invalidate signed capability unless secret rotation occurs.
- Opaque capability survives restart if persisted.
- Secret rotation behavior documented.
- Revoked scope remains revoked after retry.

# 55. Concurrency Semantics
- Concurrent capability validation should be read-safe.
- Concurrent issuance for same browser/table may create multiple valid capabilities unless product explicitly requires one; decide deliberately.
- Do not introduce global single-session lock without need.
- Revocation racing with mutation must fail safely in later command rounds; R01 should define expected validation freshness.
- If opaque sessions include revoke flag, update/read semantics must be transactionally coherent.

# 56. Idempotency Boundary
- R01 issuance may be repeatable but does not own generic command idempotency.
- If exchange request is retried, duplicate capability issuance is acceptable only if harmless and documented.
- Avoid using P03/R05 idempotency key infrastructure early.
- Do not let repeated issuance create unbounded DB rows if opaque sessions are persisted.
- Consider reuse/cleanup strategy if necessary.

# 57. Abuse / Resource Safety
- Public issuance endpoint must cap input sizes.
- Avoid expensive unbounded DB queries.
- Lookup should be indexed by stable entry identifier.
- Avoid creating DB row on every invalid request.
- If opaque session rows are created, avoid unbounded lifetime.
- Rate limiting is optional unless existing infrastructure exists; do not invent broad anti-abuse platform in R01.

# 58. Observability
- Log safe capability event type if logging exists.
- Safe fields: hashed/truncated capability ID if needed, tenant/branch/table IDs only where logs are appropriately protected, reason code, request correlation ID.
- Never log bearer token.
- Never log secret.
- Avoid logging customer PII not otherwise required.
- Do not make successful validation excessively noisy.

# 59. Audit Boundary
- Customer capability issuance/validation is not necessarily a privileged staff audit event.
- Do not flood `audit.events` without explicit audit contract.
- Security-significant revocation/tamper failures may use application security logs.
- Later order commands may create domain/audit events.
- R01 stays focused on capability correctness.

# 60. Performance — Entry Resolution
- Target one bounded lookup/join for public entry resolution where possible.
- Avoid N+1 branch/table lookups.
- Select only required fields.
- Verify relevant indexes.
- Add index only if actual query path lacks support.
- Do not optimize prematurely with cache before correctness.

# 61. Performance — Validation
- Signed validation should be CPU bounded and lightweight.
- Opaque lookup should use indexed digest/ID.
- Server-state revocation checks should be bounded.
- Do not load menu/cart/order data just to validate capability.
- CustomerContext resolution should be reusable by later handlers in same request.

# 62. Cache Safety
- Do not globally cache per-customer capability validation across users.
- Avoid Next.js static caching of request-specific authorization result.
- Mark request-dependent server functions appropriately under current Next.js APIs.
- Re-read installed Next.js docs before implementation where request cookies/cache behavior is version-sensitive.
- Never cache bearer tokens in shared cache keys.

# 63. Server / Client Boundary
- Capability issuance/validation modules are server-only.
- Client receives safe UI state and invokes server endpoints/actions.
- Client must not import signing/verification secrets.
- Client must not decode token and treat claims as authority.
- Client display may decode non-sensitive hints only if explicitly non-authoritative, but default is avoid it.

# 64. API Boundary
- Public route must accept only required entry selectors.
- State-changing future APIs must call `requireCurrentCustomerContext()`.
- R01 may add a `/api/customer/session` or equivalent exchange endpoint.
- Keep route naming aligned with current app conventions.
- Avoid generic `/api/auth` naming that could confuse internal Auth.js.

# 65. Frontend Entry UX
- Valid QR/direct entry should establish capability transparently or with minimal confirmation.
- Invalid entry should show safe unavailable state.
- Expired session should offer clear re-entry path.
- Do not expose tenant UUID/table UUID in error copy.
- Preserve existing menu browsing flow where safe.
- Avoid broad visual redesign.

# 66. Loading State
- Entry exchange may show bounded loading state.
- Prevent duplicate destructive actions; issuance itself may be safely repeatable.
- Do not show stale menu/cart as authorized before capability result when protected content depends on it.
- Server-rendered exchange may avoid client loading complexity.

# 67. Empty / Unavailable State
- Clear message that customer session/entry is unavailable.
- Allow rescan/retry where appropriate.
- No staff-login link required by default.
- No internal error details.
- No arbitrary tenant/table input form.

# 68. Accessibility
- Error/retry controls keyboard accessible.
- Status messages announced appropriately.
- QR entry fallback links have meaningful labels.
- Focus behavior predictable after failure.
- No color-only state signaling.

# 69. Responsive
- Entry and unavailable surfaces work on mobile-first widths.
- No horizontal overflow.
- Customer QR flow must remain usable on small screens.
- Avoid unrelated responsive changes.

# 70. Security — XSS
- Do not inject raw entry parameter values into HTML.
- React escaping remains default.
- Sanitize any redirect/next path.
- Avoid rendering raw token.
- Avoid storing bearer capability in DOM attributes.

# 71. Security — SQL Injection
- Use Kysely/parameterized SQL.
- SECURITY DEFINER helpers must use typed parameters.
- No dynamic SQL from raw tenant/table selectors unless properly identifier-safe and genuinely needed.
- Avoid concatenated where clauses.

# 72. Security — Open Redirect
- If exchange preserves destination, sanitize to internal path.
- Reject absolute external URLs.
- Reject protocol-relative URLs.
- Preserve safe query string only as needed.
- Do not put capability in redirect query.

# 73. Security — Cookie Fixation
- Server must issue capability; do not accept client-chosen capability ID as authoritative.
- If cookie already exists for different entry scope, resolution must not silently reuse it across tenant/branch/table.
- Re-entry into another table should issue/replace context deliberately.
- Cross-scope stale cookie must fail or be replaced after server validation.

# 74. Security — Session Confusion
- Customer cookie and staff Auth.js cookies have distinct names and code paths.
- Staff session presence must not automatically grant customer capability.
- Customer capability presence must not grant staff route access.
- Tests must prove both directions.
- Shared browser may hold both safely if product uses same domain.

# 75. Security — Cross-Tenant Replay
- Capability from Tenant A/Branch A1 fails if request tries Tenant B context.
- Underlying DB writes in later rounds must derive scope from context.
- R01 tests should prove validation/context cannot be rebound by input.
- Signed claim mutation invalidates signature.
- Opaque token record scope is immutable except explicit server lifecycle fields.

# 76. Security — Wrong-Branch Replay
- Capability for A1 cannot be used for A2.
- Table must belong to capability branch.
- Future route payload branch IDs must not override context.
- Branch reassignment of table should invalidate old assumptions according to current data model.

# 77. Security — Staff Escalation
- CustomerContext has no actorId for staff identity.
- Customer capability cannot call internal permission helper as if a staff actor exists.
- Customer routes must not set fake `app.actor_id` to satisfy internal RLS.
- No membership/role writes.
- No admin route entry.

# 78. Security — Secret Rotation
- Document rotation process if signed token used.
- Single active key rotation may invalidate all sessions; acceptable only if documented.
- Multi-key verification is optional and likely unnecessary for MVP.
- Do not overbuild key management in R01.
- Rotation should fail closed for old unsupported keys.

# 79. Database Constraint Audit
- Verify branch belongs to tenant.
- Verify table belongs to tenant/branch.
- Verify table session references table/branch consistently.
- Add constraint only if missing and required for capability correctness.
- Use forward-only migration.
- Add DB tests for new invariant.

# 80. Generated Types
- No generated type update if no schema change.
- If schema changes, regenerate using repository script.
- Commit resulting generated type changes.
- Verify drift.
- Do not hand-edit generated DB types.

# 81. Migration Safety
- New migration timestamp follows current convention.
- Forward-only.
- Idempotent only where project migration conventions require it; do not hide duplicate schema mistakes with broad exception swallowing.
- No production reset/push.
- Clean local bootstrap required during implementation validation when migration exists.

# 82. Migration Rollback Strategy
- Normal rollback is forward corrective migration, not historical rewrite.
- Capability table/function can remain unused if application rollback required.
- Do not drop existing customer data structures to simplify rollback.
- Document impact if secret/model rollback invalidates newly issued capabilities.

# 83. Environment Variables
- Add only if actual capability design needs secret/config.
- Candidate: `CUSTOMER_CAPABILITY_SECRET` for signed model.
- Candidate lifetime config should prefer code constant unless environment variance is operationally required.
- Avoid excessive env knobs.
- `.env.example` documents placeholders, never values.

# 84. Dependency Policy
- Prefer Node/Web Crypto or already installed crypto primitives.
- Do not re-add direct `jose` automatically just because Phase 02 removed it.
- If Auth.js dependency exposes no appropriate public primitive, choose supported maintained package only with clear justification.
- Avoid dependency churn.
- Lockfile changes only when dependency truly changes.

# 85. Next.js Version Discipline
- Read installed Next.js agent docs before changing cookies/route/server-action patterns.
- Use current APIs for async cookies/headers/request behavior.
- Avoid remembered older Next.js conventions.
- Keep server-only boundaries explicit.
- Ensure build/typecheck catches unsupported API assumptions.

# 86. Unit Test Matrix — Parsing
- missing token.
- empty token.
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

# 87. Unit Test Matrix — Signed Capability
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

# 88. Unit Test Matrix — Opaque Capability
- valid digest lookup resolves.
- unknown token denies.
- revoked record denies.
- expired record denies.
- raw token is never returned from repository.
- token comparison is safe for expected design.
- malformed token does not trigger unbounded DB query.

# 89. Unit Test Matrix — Cookie Transport
- missing cookie -> missing.
- malformed cookie -> invalid/clear.
- valid cookie parsed server-side.
- Secure enabled in production.
- HttpOnly enabled.
- SameSite set deliberately.
- Max-Age/Expires bounded.
- cookie name distinct from Auth.js.
- clear helper expires cookie.

# 90. Unit Test Matrix — Context
- resolved capability produces immutable CustomerContext.
- tenant ID preserved from server authority.
- branch ID preserved.
- table ID preserved when scoped.
- no staff actor ID present.
- no role ID present.
- no permissions present.
- client selector cannot overwrite fields.

# 91. Integration Matrix — Entry Resolution
- valid Tenant A / Branch A1 / Table 1 entry resolves.
- unknown table denies.
- A2 table requested under A1 denies.
- Tenant B table under Tenant A denies.
- inactive table denies if status exists.
- inactive branch denies.
- inactive tenant denies if status exists.
- return metadata contains only safe display fields.

# 92. Integration Matrix — Capability Validation
- issued capability resolves same context.
- tampered/unknown capability denies.
- expired denies.
- closed table session denies when applicable.
- revoked opaque capability denies when applicable.
- capability from A1 cannot resolve A2.
- capability from Tenant A cannot resolve Tenant B.
- DB outage returns unavailable/fail-closed.

# 93. Integration Matrix — Staff Separation
- customer capability does not authenticate `/staff`.
- customer capability does not authenticate `/admin`.
- staff Auth.js session alone does not fabricate customer capability.
- both cookies present remain independently interpreted.
- customer helper never calls staff permission path as authority.

# 94. Database Test Matrix
- customer capability role/function cannot read staff credentials.
- cannot read arbitrary memberships.
- cannot mutate roles/permissions.
- cannot access unrelated tenant entry context.
- valid entry lookup constrained to exact tenant/branch/table.
- new capability table private if introduced.
- public/anon direct reads denied if introduced.
- fixed search_path for SECURITY DEFINER if introduced.

# 95. Failure-Path Test Matrix
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

# 96. Concurrency Test Matrix
- two simultaneous validations succeed consistently for valid token.
- validation racing with revocation: post-revocation attempt denies according to transaction freshness.
- two issuance requests do not corrupt state.
- opaque row uniqueness/cleanup semantics remain valid.
- no global mutable singleton stores customer context.

# 97. Regression Suites
- Phase 02 Auth.js tests remain green.
- Phase 02 workspace/access tests remain green.
- Phase 02 permission tests remain green.
- staff route E2E remains green.
- existing customer/menu tests remain green.
- existing database/RLS suites remain green.
- build/type/lint remain green during implementation validation.

# 98. Validation Commands — Future Implementation
- Inspect package scripts first.
- Run lint.
- Run typecheck.
- Run unit tests.
- Run relevant integration tests.
- Run Next build.
- Run customer E2E subset if route/cookie exchange changes.
- If DB migration is added: local Supabase start/reset, DB tests, lint, codegen/drift, DB runtime integration.
- Record actual results only.

# 99. Validation Vocabulary
- `PASS` only for executed success.
- `FAIL` for observed failure.
- `NOT RUN` for unexecuted.
- `BLOCKED` when unable due to blocker.
- `NOT APPLICABLE` when legitimately irrelevant.
- Do not fabricate PASS from source inspection.

# 100. Implementation Order — Step 1
- Re-fetch current main.
- Read README/policy/template.
- Read exact R01 spec.
- Identify latest P02/R06 lineage tip.
- Use that lineage as implementation parent according to current policy.
- Confirm P02 modern auth/authz chain is intact.

# 101. Implementation Order — Step 2
- Audit existing public customer entry routes/components.
- Audit QR/link parameter format.
- Audit table/table-session schema.
- Audit existing customer/session utilities.
- Audit RLS/public DB access.
- Decide whether signed or opaque capability is justified.

# 102. Implementation Order — Step 3
- Define pure capability types/version/lifetime.
- Define CustomerContext.
- Define typed validation result.
- Add unit tests before route integration.
- Keep staff identity types separate.

# 103. Implementation Order — Step 4
- Implement authoritative entry resolver.
- Reuse current DB/query infrastructure.
- Add least-privilege boundary if needed.
- Add cross-tenant/wrong-branch tests.
- Avoid cart/order writes.

# 104. Implementation Order — Step 5
- Implement capability issuer.
- Implement signer/opaque persistence as chosen.
- Implement bounded expiry.
- Implement secret handling.
- Add tamper/expiry tests.

# 105. Implementation Order — Step 6
- Implement transport cookie/header pattern.
- Implement current-context validator.
- Add cookie/session confusion tests.
- Add staff/customer separation tests.

# 106. Implementation Order — Step 7
- Integrate minimal customer entry surface.
- Valid entry receives capability.
- Invalid entry gets safe error/retry.
- Existing menu behavior preserved where possible.
- No broad UI redesign.

# 107. Implementation Order — Step 8
- Add DB/integration tests.
- Add migration only if required.
- Validate pool/role leakage if DB role/context introduced.
- Run inherited Phase 02 regressions.

# 108. Implementation Order — Step 9
- Run implementation validation.
- Record actual results.
- Open exactly one P03/R01 implementation PR.
- Stop.
- Do not implement R02 in same branch.

# 109. Definition of Done — Architecture
- one canonical customer capability authority exists.
- one canonical CustomerContext exists.
- QR/raw selectors are not runtime authorization authority.
- customer and staff authority remain separate.
- later rounds can consume CustomerContext without re-parsing entry selectors.
- no cart/order persistence is prematurely introduced.

# 110. Definition of Done — Security
- bounded capability lifetime.
- tamper/unknown token denial.
- cross-tenant denial.
- wrong-branch denial.
- invalid table denial.
- closed/revoked scope denial as applicable.
- no customer-to-staff escalation.
- no staff-to-customer implicit authority.
- no raw token/secret logging.

# 111. Definition of Done — Database
- no broad grants.
- no weakening staff RLS.
- any new role/function is least-privileged.
- any migration is forward-only.
- clean bootstrap passes when schema changes.
- generated types synchronized when needed.
- production DB not mutated.

# 112. Definition of Done — Runtime
- entry issuance works.
- capability persists across intended navigation.
- expiry/re-entry works.
- invalid capability fails safely.
- DB unavailable fails closed for protected customer state actions.
- staff Auth.js remains unaffected.

# 113. Definition of Done — Tests
- pure capability tests.
- transport tests.
- entry resolution integration tests.
- cross-tenant/branch negative tests.
- staff/customer separation tests.
- DB privilege tests where applicable.
- inherited Phase 02 regressions.
- build/type/lint validation.

# 114. Explicit Prohibitions
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

# 115. PR Requirements — Metadata
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

# 116. PR Requirements — Security Evidence
- cross-tenant deny.
- sibling/wrong-branch deny.
- invalid table deny.
- expired deny.
- tampered/unknown deny.
- staff route deny with customer capability.
- no broad DB grant.
- token/secret redaction.
- revocation/closed-scope behavior.

# 117. PR Requirements — Validation Evidence
- lint.
- typecheck.
- unit.
- integration.
- build.
- E2E if entry route changed.
- DB reset/tests/lint/codegen if schema changed.
- inherited Phase 02 regression result.
- use only approved validation vocabulary.

# 118. PR Requirements — Scope Declarations
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

# 119. P03/R02 Handoff
- R02 receives canonical validated CustomerContext.
- R02 receives exact tenant/branch/table scope semantics.
- R02 receives capability failure taxonomy.
- R02 receives current-context server helper.
- R02 must not parse QR selectors as authority.
- R02 must not duplicate capability cryptography/session lookup.
- R02 builds reusable data access/transaction primitives for customer-domain operations.

# 120. R02 Expected Focus
- customer-safe data access layer.
- repositories/services for branch/menu/customer-domain access.
- transaction composition.
- context propagation.
- query ownership boundaries.
- error mapping.
- no cart/order persistence yet unless exact future R02 spec says otherwise.
- no command orchestration yet.

# 121. Phase 03 Future Boundary — R03
- durable cart persistence.
- durable order persistence foundation.
- schema/repository integration.
- lifecycle invariants.
- customer context ownership fields.
- R01 must not implement these now.

# 122. Phase 03 Future Boundary — R04
- command orchestration.
- validated customer actions.
- transactional mutations.
- domain failure mapping.
- event/side-effect ordering.
- R01 must not implement these now.

# 123. Phase 03 Future Boundary — R05
- request idempotency.
- retry safety.
- duplicate submission defense.
- concurrency/race handling for commands.
- dedupe persistence/keys where appropriate.
- R01 must not implement these now.

# 124. Phase 03 Future Boundary — R06
- full customer data-plane acceptance.
- end-to-end entry → context → persistence → command → idempotency proof.
- regression/security acceptance.
- exact Phase 04 handoff.
- R01 must not implement these now.

# 125. Current-Code Assumptions to Revalidate at Implementation Time
- Phase 02 Auth.js session remains current internal authority.
- customer entry route still exists in expected form.
- FoodFlow tables/table_sessions schema remains present.
- tenant/branch IDs remain UUIDs.
- no prior customer capability module has landed after this spec authoring.
- if equivalent module exists, extend/reuse rather than duplicate.
- re-read latest parent branch before coding.

# 126. Stop Conditions During Implementation
- exact spec missing/not READY on main.
- latest P02/R06 implementation lineage cannot be identified.
- current entry flow differs materially and requires product redesign beyond capability boundary.
- secure customer capability would require broad DB grants.
- implementation would require weakening Phase 02 staff RLS/authz.
- production destructive DB operation appears necessary.
- secret would need client exposure.
- required QR/table ownership relation cannot be established safely.
- in these cases report blocker rather than improvise.

# 127. Document Validation Checklist
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
- [x] revocation/failure behavior explicit.
- [x] DB least privilege explicit.
- [x] server/client boundary explicit.
- [x] test matrices explicit.
- [x] later-round boundaries explicit.
- [x] implementation merge owner-controlled.

# 128. Document-Only Validation Policy
- Document correctness is based on metadata, sequence, current repository evidence, scope, architecture, security, failure/recovery, validation plan, and handoff.
- GitHub Actions are not document-validation authority.
- Failed/queued/skipped/missing Actions do not semantically invalidate this document.
- Hosted GitHub enforcement may technically block docs merge; report as hosted merge restriction if it occurs.
- Documentation task must not alter runtime/CI to force merge.

# 129. Final Development Gate
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

# 130. Final Acceptance Statement
- P03/R01 is READY as an executable specification document.
- The round creates the customer trust primitive that later server persistence depends on.
- The customer capability is intentionally narrower than internal staff authentication.
- Raw QR/table selectors remain non-authoritative.
- The validated CustomerContext becomes the reusable handoff to P03/R02.
- No cart/order persistence, command orchestration, generic idempotency, or Phase 04 work is included in R01.
