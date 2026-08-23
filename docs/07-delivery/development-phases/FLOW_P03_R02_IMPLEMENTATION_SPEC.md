# FLOW P03 R02 — Implementation Specification
> Phase 03 — Core Server Data Plane + Customer Capability
> Round 02 — Customer Data Access Layer + Transaction Composition
> Revision — Establish reusable customer-safe server repositories, read/write transaction composition, context propagation, and deterministic failure contracts on top of P03/R01 CustomerContext without implementing cart/order persistence yet.

## Metadata
- Phase: `03`
- Round: `02`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P03_R01_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P03_R03_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P03 implementation slot after this spec is on main`
- Current planning scope: `PHASE 03 / ROUND 02 ONLY`
- Implementation parent: `latest P03/R01 implementation lineage tip`
- Expected implementation parent branch: `p03-r01-customer-capability`
- Observed P03/R01 branch head at authoring: `2bcc1bb10bc56c9de9d6e30f66f5141dbf079223`
- Observed P03/R01 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Recommended implementation branch: `p03-r02-customer-data-access`
- Recommended implementation PR title: `feat(customer): establish customer data access layer`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- CustomerContext consumption in this round: `YES`
- Reusable repository/data-access primitives in this round: `YES`
- Customer-safe transaction composition in this round: `YES`
- Read-model access in this round: `YES`
- Shared mutation transaction primitives in this round: `YES`
- Durable cart persistence in this round: `NO — P03/R03`
- Durable order persistence in this round: `NO — P03/R03`
- Customer command orchestration in this round: `NO — P03/R04`
- Generic idempotency framework in this round: `NO — P03/R05`
- Phase acceptance in this round: `NO — P03/R06`
- Production destructive DB mutation: `NO`

# 1. Authoring State
- Current `main` is the only policy/specification authority.
- `FLOW_P03_R01_IMPLEMENTATION_SPEC.md` exists on `main` and points `Next` to this exact canonical filename.
- P03/R01 implementation branch exists as `p03-r01-customer-capability`.
- Observed P03/R01 branch head is `2bcc1bb10bc56c9de9d6e30f66f5141dbf079223`.
- P03/R01 branch is based on the completed P02/R06 lineage.
- P03/R01 implementation contains meaningful customer capability code.
- R01 adds a dedicated customer capability module.
- R01 adds `CustomerCapabilityClaims`.
- R01 adds immutable `CustomerContext`.
- R01 adds customer entry resolution.
- R01 adds capability validation.
- R01 adds a dedicated `flow_customer_entry` transaction role boundary.
- R01 adds a public customer entry API route.
- R01 adds a forward-only customer capability database migration.
- R01 adds unit, integration, E2E, and database test coverage.
- R01 therefore provides real handoff evidence for R02 authoring.
- No canonical `FLOW_P03_R02_IMPLEMENTATION_SPEC.md` existed on `main` before this document was authored.
- No equivalent docs branch or spec PR existed at authoring.
- This documentation task does not create the R02 implementation branch.
- This documentation task does not modify application/runtime/database implementation code.
- This documentation task does not merge an implementation PR.

# 2. Phase 03 Objective
- Phase 03 creates a durable customer-facing server data plane.
- Public customer interaction must remain distinct from internal staff identity.
- Customer authority originates from validated `CustomerContext`.
- Server data access must derive tenant/branch/table scope from trusted context.
- Repositories must not trust duplicated client tenant/branch identifiers.
- Data access must preserve tenant isolation.
- Data access must preserve branch isolation.
- Data access must preserve customer capability scope.
- Later cart/order persistence must reuse one coherent repository/transaction layer.
- Later command flows must not hand-roll database context or query ownership.
- Later idempotency must operate on deterministic mutation boundaries.
- Database failures must map into explicit server-domain failure contracts.
- The phase must remain compatible with realtime, kitchen, payments, notifications, and analytics later.
- Phase 03 ends with a tested customer server state-change pipeline rather than browser-local authority.

# 3. Six-Round Phase Boundary
- R01 owns customer capability/session boundary.
- R01 owns public-entry trust model.
- R01 owns capability validation and `CustomerContext`.
- R02 owns reusable customer-safe data-access layer.
- R02 owns customer transaction composition primitives.
- R02 owns repository contracts and read-model query ownership.
- R02 owns explicit database/domain error translation primitives.
- R03 owns durable cart/order persistence schema and repository integration.
- R03 owns cart/order lifecycle storage.
- R04 owns customer command orchestration.
- R04 owns domain mutations and side-effect ordering.
- R05 owns idempotency and duplicate/retry safety.
- R06 owns end-to-end Phase 03 acceptance.
- R02 must make R03/R04 thinner without stealing their persistence/command ownership.

# 4. Why R02 Exists Now
- R01 creates a trusted customer authority boundary.
- R01 deliberately stops before durable cart/order persistence.
- Without a reusable data-access layer, R03 would likely scatter SQL across routes/services.
- Without transaction composition, R04 would likely create ad hoc transaction boundaries.
- Without repository ownership, tenant/branch context could be inconsistently applied.
- Without explicit server-domain failure contracts, infrastructure errors could leak or be inconsistently handled.
- Without query ownership, future customer reads could bypass capability scope.
- R02 therefore establishes the reusable server primitives needed before persisted business state is introduced.

# 5. High-Impact R02 Objective
- Consume only validated `CustomerContext` from R01.
- Introduce one canonical customer transaction context derived from `CustomerContext`.
- Introduce one canonical customer database transaction wrapper for scoped customer-domain work.
- Introduce narrow repository interfaces for customer-safe read models.
- Introduce repository implementations that never trust raw client tenant/branch/table selectors.
- Centralize customer query ownership.
- Centralize infrastructure-to-domain error translation.
- Separate read-only public catalog access from customer-session-bound access where trust differs.
- Make transaction composition reusable by R03 persistence and R04 commands.
- Ensure database context cannot leak between pooled requests.
- Ensure cross-tenant/wrong-branch data cannot be returned through customer repositories.
- Ensure customer capability does not gain internal staff `flow_runtime` privileges.
- Avoid implementing cart/order storage prematurely.

# 6. R01 Contract to Reuse
- `CustomerContext` is the trusted server output of customer capability validation.
- `CustomerContext` includes capability ID.
- `CustomerContext` includes tenant ID.
- `CustomerContext` includes restaurant identity.
- `CustomerContext` includes branch ID.
- `CustomerContext` includes table ID.
- `CustomerContext` may include table-session ID.
- `CustomerContext` includes human-safe display metadata.
- R02 must not re-parse capability token internals in repositories.
- R02 must not re-resolve QR selectors independently.
- R02 must not create another customer context abstraction with overlapping authority.
- R02 should accept `CustomerContext` or a deliberately narrowed derivative.

# 7. Existing Customer Entry Transaction Boundary
- R01 adds `src/server/db/customer-entry-transaction.ts`.
- It sets transaction-local role `flow_customer_entry`.
- It currently supports entry resolution/capability scope validation.
- That role is intentionally narrow and public-entry oriented.
- R02 must audit whether it is appropriate for downstream customer data reads.
- R02 must not simply grant broad domain tables to `flow_customer_entry` for convenience.
- If downstream customer data needs a distinct role, create a narrower dedicated role such as `flow_customer_runtime` only when justified.
- If the existing role can safely serve limited read-model functions via execute-only private functions, prefer narrow function execution over broad table grants.

# 8. Customer Data-Plane Trust Classes
- Entry resolution is one trust class.
- Customer capability validation is one trust class.
- Public catalog/menu read is another trust class.
- Session-bound customer state read is another trust class.
- Future cart/order mutation is another trust class.
- R02 must not collapse all classes into one broad database role.
- Each query must have the minimum authority needed.
- Public read data must not imply mutation authority.
- Customer session authority must not imply staff authority.

# 9. Canonical Customer Database Context
- R02 should define a server-only customer DB context derived from `CustomerContext`.
- Suggested name: `CustomerDatabaseContext`.
- It should include `tenantId`.
- It should include `branchId`.
- It should include `capabilityId` when useful for audit/correlation.
- It should include `tableId` when table-scoped queries need it.
- It should include `tableSessionId` only when current domain semantics require it.
- It must not contain staff actor ID.
- It must not contain staff role/permission state.
- It must not accept arbitrary client values.
- It should be immutable by convention.

# 10. Suggested Customer Database Context Shape
```ts
interface CustomerDatabaseContext {
  readonly tenantId: string;
  readonly branchId: string;
  readonly capabilityId: string;
  readonly tableId: string;
  readonly tableSessionId: string | null;
}
```
- Exact shape may adapt to actual code.
- Preserve explicit null semantics.
- Do not carry restaurant display metadata into low-level transaction context unless actually required.
- Do not serialize this object to the browser as authority.

# 11. Transaction Context Propagation
- New customer data transaction must set context transaction-locally.
- Use `set local` semantics.
- Never set PostgreSQL role or context globally on pooled connections.
- Ensure transaction end clears role/context.
- Ensure rollback clears role/context.
- Ensure exceptions cannot leave context attached to pooled connection.
- Add sequential-request leakage tests.

# 12. Candidate Database Session Variables
- `app.tenant_id` may be reused if current helpers are compatible.
- `app.branch_id` may be reused.
- A separate `app.customer_capability_id` may be introduced only if database-level policies/functions benefit from it.
- A separate `app.table_id` may be introduced only if table-level policy decisions truly need it.
- Avoid proliferating session variables without database enforcement use.
- Never overload `app.actor_id` with customer capability ID.
- Customer capability is not a staff actor.

# 13. Dedicated Customer Runtime Role Decision
- Audit existing roles before adding a new one.
- `flow_customer_entry` should stay entry/capability focused by default.
- `flow_runtime` remains internal staff/domain runtime and must not be granted to public customer execution.
- A new `flow_customer_runtime` role is justified when persistent customer-domain reads/writes need transaction-local RLS distinct from staff.
- The new role must be `NOLOGIN`.
- The new role must be `NOBYPASSRLS`.
- It must receive only intended schema usage/function/table privileges.
- Avoid broad `ALL` grants.
- Add negative grant tests.

# 14. Customer Runtime Role Decision Matrix
- If all R02 reads can be exposed through narrow execute-only functions under `flow_customer_entry`, do not create a second role merely for naming symmetry.
- If R02 needs direct SELECT on customer-safe domain tables with RLS, prefer a distinct `flow_customer_runtime` role.
- If future R03 writes would require broader grants than R02 reads, do not pre-grant them now.
- If one role would require mixing unauthenticated entry resolution with session-bound data access, split roles.
- If current role hierarchy lets customer role `SET ROLE flow_runtime`, fix the membership/grant relation before shipping.
- Document the chosen branch of this matrix in the implementation PR.

# 15. Read Model Strategy
- R02 should establish customer-safe read repositories.
- Likely first read model is branch/menu/storefront data needed after entry.
- Read model must derive tenant/branch from context.
- Public menu reads may use a public-safe repository if no capability is required.
- Table/session-specific data must require customer context.
- Do not create one giant `CustomerRepository` with unrelated methods.
- Group repositories by coherent domain/read ownership.

# 16. Candidate Repository Boundaries
- `CustomerStorefrontRepository` for branch/storefront metadata.
- `CustomerMenuRepository` for categories/items/modifiers/availability read models.
- `CustomerSessionRepository` for existing table-session state where R01/R02 needs read-only continuity.
- Exact names may follow repository conventions.
- Do not add cart/order repository implementations until R03.
- Interfaces should be narrow enough for test substitution.

# 17. Repository Input Rule
- Repository inputs must not include caller-controlled tenant ID when `CustomerContext` already provides it.
- Repository inputs must not include caller-controlled branch ID when context provides it.
- Repository inputs may include resource IDs within the already-authorized scope.
- Resource IDs must still be validated against context scope in SQL/RLS/query predicates.
- Do not rely on UI hiding to protect resource access.

# 18. Repository Output Rule
- Return purpose-built row/domain types.
- Avoid raw `select *` unless using a narrow private function with stable return contract.
- Do not return credential/auth tables.
- Do not return internal staff membership/role/permission data.
- Do not return audit payloads unless specifically required later.
- Avoid exposing internal numeric/UUID identifiers that are not required by customer UI.
- Preserve stable customer-facing identifiers where needed.

# 19. SQL Ownership
- Keep SQL inside repository/database modules.
- Route handlers/pages should not inline domain SQL.
- UI components must not know database details.
- R03 persistence should later reuse repository/transaction patterns.
- R04 commands should later orchestrate repositories rather than write raw SQL in handlers.

# 20. Query Composition
- Prefer one bounded query over N+1 loops.
- Use explicit joins.
- Apply tenant/branch filters close to source.
- Apply availability/status predicates deliberately.
- Preserve deterministic ordering.
- Avoid hidden application-level post-filtering for authorization.
- Security filtering belongs in SQL/RLS/function boundary where possible.

# 21. Customer Storefront Read Contract
- Resolve current branch/storefront identity from trusted context.
- Return only customer-safe display metadata.
- Return current branch name.
- Return restaurant/storefront name.
- Return table label when relevant.
- Do not leak organization internal settings.
- Do not leak staff-only branch configuration.
- Do not leak internal status metadata unnecessarily.

# 22. Storefront Repository Method Contract
- Suggested method: `getCurrentStorefront()`.
- No tenant parameter.
- No branch parameter.
- Repository instance is already bound to trusted scope.
- Return exact one storefront aggregate or typed invariant failure.
- A valid context whose branch/storefront row disappears should not silently return another branch.
- If table label is refreshed from database, require exact current table ID.
- If display metadata in `CustomerContext` is already sufficient, avoid duplicate read just for symmetry.

# 23. Customer Menu Read Contract
- Query only current tenant/branch menu data.
- Honor existing menu availability data model.
- Honor item/category active/availability state.
- Preserve deterministic category/item ordering.
- Join modifier groups/choices in a bounded way.
- Avoid returning hidden/deleted/inactive menu content.
- Do not introduce cart/order semantics here.

# 24. Menu Repository Method Contracts
- Suggested method: `listAvailableCategories()` only when categories are loaded separately.
- Suggested method: `listAvailableMenu()` when an aggregate is more efficient.
- Suggested method: `getMenuItem(itemId)` for later detail/validation reuse, but only if R02 page/API needs it.
- Item lookup must always constrain tenant/branch.
- Do not expose generic `findById(id)` without scope.
- Do not expose unrestricted `listAll()`.
- Keep method names explicit about customer-visible/available semantics.

# 25. Availability Semantics
- Reuse current menu availability tables/functions if present.
- Avoid inventing a second availability model.
- If time-window evaluation is required, define timezone source explicitly.
- Do not use browser-local timezone as database authority.
- Branch/business timezone should be canonical when schema provides it.
- If current schema lacks reliable timezone, report the limitation rather than silently choosing server timezone.

# 26. Read Consistency
- One request should observe a coherent transaction snapshot where multiple related reads compose.
- R02 should allow repository operations to share one transaction.
- Avoid each repository method opening an independent transaction when called as part of one server operation if composition matters.
- Support transaction injection or repository factory bound to transaction.

# 27. Repository Factory Pattern
- Consider a transaction-bound repository factory.
- Example conceptual API:
```ts
withCustomerDataTransaction(context, async ({ trx, repositories }) => {
  const storefront = await repositories.storefront.getCurrent();
  const menu = await repositories.menu.listAvailable();
  return { storefront, menu };
});
```
- Exact implementation may be simpler.
- The important invariant is shared trusted context and transaction ownership.

# 28. Repository Factory Lifetime
- Build repositories per transaction or per callback scope.
- Do not keep a repository singleton with mutable context.
- Do not cache a transaction object across requests.
- Do not allow repository methods after callback/transaction completion.
- Tests should exercise that all methods observe the same context.

# 29. Transaction Callback Contract
- Callback receives database transaction.
- Callback may receive narrowed customer context.
- Callback may receive transaction-bound repositories.
- Callback must not receive raw capability token.
- Callback must not mutate global state.
- Callback errors must trigger rollback.

# 30. Transaction Injection Contract
- Repository constructor/factory may accept `DatabaseTransaction` and immutable scope.
- Repository should not call `getDatabaseRuntime()` internally when already transaction-bound.
- This prevents accidental nested unrelated transactions.
- If a repository can run both standalone and composed, provide a single top-level service wrapper rather than dual hidden transaction behavior.
- Nested transaction semantics should not be invented unless Kysely/current runtime explicitly supports the required behavior.

# 31. Nested Transaction Prohibition
- Repository methods must not silently start nested top-level customer transactions.
- Service composition owns the transaction boundary.
- If an existing helper starts its own transaction, refactor or provide an injected-transaction variant inside R02 scope.
- Savepoints are not required for R02 read flows.
- Future R03/R04 may choose savepoints only with explicit spec justification.

# 32. Read-Only vs Read-Write Composition
- R02 may expose a generic customer transaction wrapper capable of later writes only if privilege remains least-privileged.
- Do not grant future cart/order write permissions in R02 merely to prepare.
- Prefer current read-only privileges and later forward migration in R03 for writes.
- Architectural transaction wrapper can be reusable without pre-granting write authority.

# 33. Error Taxonomy
- Introduce explicit customer data-access errors/results.
- Distinguish invalid/missing customer context before repository entry.
- Distinguish not-found within authorized scope.
- Distinguish unavailable/infrastructure failure.
- Distinguish invariant violation.
- Distinguish authorization/scope denial when relevant.
- Do not expose raw SQL errors to browser.

# 34. Suggested Error Codes
- `CUSTOMER_CONTEXT_REQUIRED`.
- `CUSTOMER_RESOURCE_NOT_FOUND`.
- `CUSTOMER_SCOPE_DENIED`.
- `CUSTOMER_DATA_UNAVAILABLE`.
- `CUSTOMER_DATA_INVARIANT_VIOLATION`.
- Exact names may follow project conventions.
- Error messages should be safe and stable.

# 35. Error Ownership by Layer
- Repository may throw/return repository-specific internal error types.
- Service layer maps infrastructure detail to customer data-domain result.
- Route/page maps domain result to HTTP/redirect/render state.
- UI should not parse PostgreSQL codes directly.
- Keep one mapping point to avoid divergent public behavior.

# 36. Not-Found vs Unauthorized
- Do not reveal whether an out-of-scope resource exists.
- Wrong-tenant resource should usually map to the same public not-found/invalid result as absent resource.
- Internal logs may retain safe reason codes without exposing other tenant identifiers unnecessarily.
- Avoid enumeration via response timing/detail when practical.

# 37. Infrastructure Failure Mapping
- Connection failure must map to safe unavailable state.
- Database timeout must map to safe unavailable state.
- SQL syntax/schema drift during development should be surfaced to implementation diagnostics but not customer UI.
- Do not swallow all errors into empty arrays because that hides real outages.
- Distinguish empty legitimate data from infrastructure failure.

# 38. Empty-State Contract
- Empty menu is legitimate if branch has no currently available items.
- It is not equivalent to database unavailable.
- Empty modifier set may be legitimate.
- Missing branch/storefront under valid context is an invariant/security issue, not generic empty state.
- Repository return types should make these distinctions possible.

# 39. Cancellation / Timeout Safety
- Avoid long unbounded queries.
- Use current database driver timeout conventions if present.
- Do not implement a new global timeout framework unless needed.
- Ensure aborted HTTP requests do not leave transactions open indefinitely.
- Rely on DB driver transaction cleanup and test failure paths where possible.

# 40. Concurrency Scope in R02
- R02 is mostly read/data-layer architecture.
- Full mutation concurrency belongs R03–R05.
- Still prove transaction-local context isolation under concurrent reads.
- Two concurrent customers from different tenants must not leak context.
- Two concurrent branches of same tenant must remain isolated.
- Customer and staff transactions must not leak roles/context into one another.

# 41. Pool Leakage Test
- Run customer transaction A with Tenant A/Branch A.
- End transaction.
- Run customer transaction B with Tenant B/Branch B on pooled runtime.
- Assert B cannot observe A context.
- Assert role resets.
- Assert app context variables reset.
- Include failure/rollback variant.

# 42. Cross-Authority Leakage Test
- Run staff `flow_runtime` transaction.
- Then run customer transaction.
- Customer must not inherit staff role.
- Run customer transaction.
- Then run staff transaction.
- Staff must not inherit customer role/session variables.
- This protects mixed pooled runtime.

# 43. Concurrent Scope Isolation Test
- Start A and B customer transactions concurrently when test runtime permits.
- Each reads a context-observable DB helper or scoped row.
- A sees only A tenant/branch.
- B sees only B tenant/branch.
- One callback delay must not allow the other request's role/context to overwrite its transaction-local settings.
- This validates use of transaction-local context rather than process globals.

# 44. RLS Strategy
- RLS remains preferred defense in depth for customer domain tables when customer role gains table access.
- If customer access uses execute-only `SECURITY DEFINER` functions, functions must enforce scope explicitly.
- Do not disable RLS.
- Do not grant bypassrls.
- Do not reuse database owner runtime for customer requests.

# 45. SECURITY DEFINER Rules
- Use only when direct RLS/table grants would be broader than necessary.
- Set fixed `search_path`.
- Qualify schema references.
- Revoke execute from public/default roles.
- Grant execute only to intended customer role.
- Derive context from transaction-local server-set values where practical.
- Validate parameters against context.
- Return narrow columns.

# 46. Direct Table Grant Rules
- Grant only required operations.
- R02 read layer should primarily require SELECT when direct table access is used.
- Do not pre-grant INSERT/UPDATE/DELETE for R03.
- Restrict schemas deliberately.
- Add privilege-denial tests for unrelated schemas/tables.

# 47. Customer Role Privilege Decision Table
| Surface | R02 default | Rationale |
|---|---|---|
| `private.user_credentials` | DENY | internal identity secret data |
| `private.login_throttles` | DENY | internal auth control state |
| `app.memberships` | DENY | staff authorization data |
| `app.roles` / permissions | DENY | staff authorization data |
| audit events | DENY | privileged operational history |
| payment tables | DENY | payment scope not owned by R02 |
| cart/order writes | DENY | R03 persistence ownership |
| customer-safe menu reads | NARROW ALLOW | required storefront data |
| customer-safe branch/storefront reads | NARROW ALLOW | required current scope display |
| private read functions | EXECUTE ONLY WHEN NEEDED | reduce broad table privilege |

# 48. Function Denial Cases
- Public role cannot execute customer private functions unless explicitly intended.
- `anon` cannot execute session-bound customer functions by default.
- `authenticated` Supabase role does not gain execution automatically.
- `flow_runtime` need not execute customer-only functions unless shared domain requirement exists.
- `flow_customer_entry` cannot execute future mutation functions.
- `flow_customer_runtime` cannot call staff permission helper as privilege authority.

# 49. Database Migration Scope
- A forward-only R02 migration is allowed when needed to create customer runtime role/functions/RLS/indexes.
- Do not rewrite historical R01 migration.
- Do not rewrite P02 migrations.
- Avoid migration if current DB boundary already safely supports the required read layer.
- Schema changes must be justified by actual access needs.

# 50. Index Audit
- Inspect existing indexes for menu/category/availability branch lookups.
- Inspect restaurant/branch lookup indexes.
- Add only missing high-value indexes that support actual R02 query shape.
- Avoid duplicate indexes.
- Do not optimize speculative R03 cart/order queries yet.

# 51. Index Evidence Requirement
- If index added, identify exact query predicate/order it supports.
- Prefer existing composite index when adequate.
- Do not add index solely because a foreign key column exists if query does not need it.
- Include migration/test evidence for uniqueness only when uniqueness is part of invariant.

# 52. Generated Types
- If migration changes schema/functions recognized by type generation, regenerate database types.
- Verify drift.
- Do not hand-edit generated types when generator is canonical.
- If no schema change, generated types should remain unchanged.

# 53. Existing Files to Reuse
- `src/modules/customer-capability/server/types.ts` for `CustomerContext`.
- `src/modules/customer-capability/server/current-context.ts` for current capability/context access.
- `src/modules/customer-capability/server/validate-customer-capability.ts` for trust validation.
- `src/server/db/customer-entry-transaction.ts` for entry-specific DB boundary only.
- Existing DB client/transaction types.
- Existing generated database types.
- Existing menu/storefront domain schema.

# 54. Files to CREATE — Core Data Layer
- Candidate: `src/modules/customer-data/server/context.ts`.
- Responsibility: derive/narrow trusted DB context from `CustomerContext`.
- Candidate: `src/modules/customer-data/server/errors.ts`.
- Responsibility: stable customer data-access error taxonomy.
- Candidate: `src/modules/customer-data/server/transaction.ts`.
- Responsibility: customer runtime transaction/role/context setup.
- Candidate: `src/modules/customer-data/server/repositories.ts`.
- Responsibility: transaction-bound repository composition/factory.
- Candidate: `src/modules/customer-data/server/index.ts`.
- Responsibility: narrow server-only exports.
- Reuse equivalent existing module if present at implementation time.

# 55. File Contract — `context.ts`
- Import `CustomerContext` from R01 module rather than redefining it.
- Export pure mapper from `CustomerContext` to DB scope.
- Validate required UUIDs only if R01 type can be constructed outside validation boundary.
- Do not read cookies.
- Do not read request headers.
- Do not query database.
- Keep it unit-testable.

# 56. File Contract — `errors.ts`
- Define stable error/result identifiers.
- Do not expose database driver classes as public contract.
- Preserve original error only as internal cause when current runtime supports `cause`.
- Ensure redacted messages.
- Avoid one generic `Error` string comparison pattern.

# 57. File Contract — `transaction.ts`
- Use current Kysely runtime.
- Start exactly one database transaction per top-level call.
- Set role locally.
- Set tenant/branch locally when DB enforcement uses those variables.
- Set only customer-specific context needed.
- Invoke callback after all context is established.
- Rollback automatically on thrown error.
- Never expose transaction beyond callback lifecycle.

# 58. File Contract — `repositories.ts`
- Construct repository objects from transaction + immutable scope.
- Avoid global mutable registry.
- Keep repository dependency graph explicit.
- Export interfaces/factory only as needed.
- Future R03 cart/order repositories should plug into same pattern without changing callers drastically.

# 59. Files to CREATE — Storefront Repository
- Candidate: `src/modules/customer-data/server/storefront-repository.ts`.
- Input: trusted customer transaction/context.
- Output: customer-safe storefront/branch/table display model.
- Must not query by arbitrary tenant/branch supplied by caller.
- Must not expose internal configuration.

# 60. Files to CREATE — Menu Repository
- Candidate: `src/modules/customer-data/server/menu-repository.ts`.
- Input: trusted customer transaction/context.
- Output: customer menu read model.
- Must enforce tenant/branch scope.
- Must filter unavailable content according to existing model.
- Must use deterministic ordering.
- Must avoid N+1 query pattern.

# 61. Files to CREATE — Types
- Candidate: `src/modules/customer-data/server/types.ts`.
- Define read-model interfaces.
- Define transaction context interfaces.
- Define repository contracts when useful.
- Keep types server-safe.
- Do not duplicate `CustomerContext` authority type.

# 62. Storefront Read Model Suggested Fields
- restaurant/storefront ID only if client routing needs it.
- restaurant/storefront customer-visible name.
- branch customer-visible name.
- branch code only if already public.
- table label/code only when current context is table-bound and UI uses it.
- customer-visible availability/open state if schema supports it.
- Do not include internal settings JSON wholesale.

# 63. Menu Category Read Model Suggested Fields
- category ID.
- name.
- description only if customer-visible.
- display order.
- optional image reference when current schema supports it.
- Do not include tenant/branch ownership fields in client projection unless debugging/internal server composition requires them.

# 64. Menu Item Read Model Suggested Fields
- item ID.
- category ID.
- customer-visible name.
- description.
- exact price representation.
- image reference.
- availability state/reason only if customer-facing.
- badge references where applicable.
- modifier-group references.
- Avoid internal cost, margin, audit metadata.

# 65. Modifier Group Read Model Suggested Fields
- modifier group ID.
- name.
- min selections.
- max selections.
- required flag if current schema derives it.
- display order.
- choices with exact price delta representation.
- availability/active filtering.

# 66. Files to MODIFY — Customer Pages
- Existing customer menu/entry page may switch from fixture/client-local data source to server data layer only where current architecture supports it.
- Do not redesign UI.
- Do not add cart/order persistence.
- If customer menu currently reads static/mock data, R02 may establish server read integration as proof of the new layer.
- Preserve current responsive/accessibility behavior.

# 67. Files to MODIFY — Database Runtime
- Current DB runtime/client may need no change.
- Add customer transaction helper in a dedicated file rather than weakening staff transaction API.
- Reuse shared UUID validation helper if safe.
- Do not create global mutable request context.

# 68. Files to MODIFY — Package Scripts
- Add/extend test script only if current test discovery excludes new suites.
- Avoid dependency churn.
- No new ORM/database library is expected.
- Do not add caching library in R02.

# 69. Files to MODIFY — Stable Quality Gate
- Workflow changes are not expected by default.
- Modify only if new R02 test path would otherwise never execute despite being relevant.
- Keep change narrow.
- Do not weaken or rename existing checks.
- Documentation validation remains independent of Actions.

# 70. Files to REMOVE
- No implementation file removal is required by default.
- Do not remove R01 capability modules.
- Do not remove Phase 02 authz modules.
- Do not remove client UI solely because server reads are added.
- Remove only duplicate/obsolete temporary data-access helper if an actual equivalent is proven superseded.

# 71. Files Explicitly NOT to Touch
- Auth.js provider/session authority unless a compile-only import fix is unavoidable.
- Internal staff AccessContext semantics.
- Internal permission catalog/mapping.
- Payment provider implementation.
- Kitchen routing.
- Realtime infrastructure.
- Voice ordering.
- Cart/order persistence migrations.
- Production deployment settings.

# 72. Public Catalog vs Capability-Bound Reads
- Some menu/storefront data may be safe without customer capability.
- Do not force capability requirement on universally public data without reason.
- But branch/table-session-specific data must remain scoped.
- Define repository boundary so public catalog query cannot accidentally gain customer session mutation authority.
- Separate transport/authority at the server layer.

# 73. Public Catalog Decision Matrix
- If menu is intentionally public by restaurant/branch slug, it may use a public read resolver that still validates tenant/branch ownership.
- If menu is table-entry-only in current product, require validated CustomerContext.
- If prices/items differ by branch, branch scope is mandatory even for public read.
- If table-specific availability exists, capability-bound path is required for that state.
- Never use this decision to grant generic anonymous table access.

# 74. Current Context Helper
- R02 should consume a single `getCurrentCustomerContext()`-style helper from R01 where present.
- Do not read cookies directly in every repository/service.
- Cookie parsing stays in capability module.
- Data layer accepts context object, not request/cookie primitives.

# 75. Required Context Helper
- A convenience `requireCurrentCustomerContext()` may be added only if not already present and useful.
- It should map missing/invalid/expired/revoked capability into stable server flow.
- It must not hide infrastructure unavailable state as unauthenticated.
- UI route behavior may redirect to re-entry/error page according to current R01 conventions.

# 76. Customer Data Service Layer
- R02 may add small service composition above repositories for read models.
- Service should orchestrate repositories, not contain raw SQL.
- Do not invent large domain service architecture.
- Keep future R03/R04 mutation services separate.

# 77. Storefront Aggregate Read
- If page needs storefront + menu together, define one service/transaction composition.
- Both reads should use same trusted context.
- Both may share same transaction snapshot.
- Return a purpose-built aggregate to server page.
- Do not return DB transaction object to React components.

# 78. Aggregate Result Contract
```ts
interface CustomerStorefrontSnapshot {
  storefront: CustomerStorefrontView;
  menu: CustomerMenuView;
}
```
- Exact naming is flexible.
- Snapshot must contain only safe serializable data.
- Avoid embedding `CustomerContext` wholesale if UI does not need it.
- Server may pass safe table label/branch display separately.

# 79. Caching Boundary
- Do not cache context-bound data under keys that omit tenant/branch.
- Server caching may be deferred unless current app already uses it.
- Public menu caching must include tenant/branch/version dimensions.
- Capability-bound state should not be globally cached.
- Avoid introducing cache invalidation complexity in R02.

# 80. Next.js Server/Client Boundary
- Customer data repositories are server-only.
- Mark server modules with `server-only` where current project uses it.
- Client components receive serialized safe read models.
- Do not import Kysely/database client into client components.
- Do not expose connection strings or DB error details.

# 81. Route Handler Boundary
- API route may call customer data service after validating context.
- Route must not accept arbitrary tenant/branch authority.
- Query/body resource IDs remain subordinate to current context.
- Use safe status/error mapping.
- Do not create generic SQL proxy endpoints.

# 82. Server Component Boundary
- Server page may validate/get customer context.
- Server page may call data service/repository composition.
- Server page maps domain result to UI props.
- Keep redirects/error states consistent with R01 entry flow.
- Avoid leaking infrastructure exceptions into rendered stack/details.

# 83. Server Action Boundary
- R02 does not need customer mutations by default.
- If a read-triggering action exists, it must still use validated context.
- Do not introduce cart/order actions yet.
- Mutation action architecture belongs R04 after R03 persistence.

# 84. Pagination Strategy
- Menu/storefront data is likely bounded enough for one page in pilot.
- Do not add generic pagination framework unless actual data volume requires it.
- If list can become large, repository API may support limit/cursor cleanly.
- Do not use unbounded arbitrary client limit.

# 85. Sorting Strategy
- Use business-defined display/order columns where present.
- Tie-break with stable ID when needed.
- Do not rely on database natural order.
- Consistent ordering improves deterministic UI/tests.

# 86. Input Validation
- Validate resource IDs before SQL when inputs are external.
- Validate enum/filter fields.
- Bound free-text search length if search is introduced.
- Do not accept raw SQL fragments/order columns from client.
- Use Kysely parameterization/sql template safely.

# 87. SQL Injection Safety
- Use parameterized Kysely queries.
- Do not concatenate user strings into SQL.
- Dynamic identifiers require explicit allowlists.
- Private DB function arguments remain typed.
- Tests should include malformed input where relevant.

# 88. XSS/Data Rendering Safety
- Repository returns plain data.
- Do not store/render arbitrary HTML from menu descriptions without sanitization policy.
- React escaping remains default.
- R02 should not introduce `dangerouslySetInnerHTML` for storefront/menu data.

# 89. Secret Handling
- Customer data layer needs no new public secrets by default.
- DB credentials remain server-only environment.
- Capability signing secret remains R01 ownership.
- Do not duplicate capability secret into data module.
- Do not log tokens/cookies.

# 90. Observability
- Log stable error category and request correlation where current logging exists.
- Include tenant/branch identifiers only when allowed by current privacy/logging policy.
- Never log capability bearer token.
- Never log DB credentials.
- Avoid logging full raw SQL parameters containing sensitive values.

# 91. Observability Evidence
- Implementation PR should name the error categories actually emitted.
- If no logging framework exists, do not introduce one solely for R02; document that observability is limited to existing mechanism.
- Tests should confirm public error response is redacted even when internal cause contains SQL detail.
- Correlation IDs must not become authorization inputs.

# 92. Customer Capability Correlation
- `capabilityId` may be useful as pseudonymous correlation ID.
- Treat it as security-sensitive metadata, not a secret bearer value.
- Do not expose internal correlation logs to customer UI.
- Do not use capability ID as proof of authority without validating current capability.

# 93. Restaurant Identity
- R01 `CustomerContext` includes restaurant ID/slug/name.
- R02 repository should use tenant/branch as primary authorization scope.
- Restaurant ID may constrain menu/storefront joins where schema requires it.
- Validate restaurant belongs to same tenant/branch relationship.
- Do not trust URL restaurantSlug after context is established.

# 94. Table Identity
- Table ID comes from trusted context.
- Storefront page may display table code/label from context or refreshed read.
- Do not let query parameter switch table silently.
- If current context table becomes invalid, R01 validation/re-entry semantics apply.

# 95. Table Session Read
- R02 may read current table-session status if necessary for data-plane decisions.
- Do not implement session mutation/open/close flows unless already R01 responsibility.
- If table session is closed/revoked, downstream data access should fail closed according to R01 context validation.
- Avoid treating stale tableSessionId as independent authority.

# 96. Menu Category Contract
- Return category ID.
- Return customer-visible name.
- Return display order.
- Return only active/visible category status.
- Keep tenant/branch internal authority fields server-side unless UI needs stable IDs.

# 97. Menu Item Contract
- Return item ID.
- Return customer-visible name.
- Return description where safe.
- Return price representation consistent with current schema.
- Return availability state.
- Return image reference if current schema supports it.
- Do not include internal cost/margin fields.

# 98. Money Representation
- Preserve current schema monetary representation.
- Prefer integer minor units or exact numeric mapping already used.
- Do not introduce floating-point price calculations in data layer.
- R02 is read-focused; financial mutation belongs later.
- Tests should verify exact price serialization if exposed.

# 99. Modifier Contract
- Return group and choice IDs/names/prices needed to render selection.
- Preserve required/min/max selection metadata if schema provides it.
- Do not enforce cart selection rules yet beyond read model representation.
- R04 later validates commands against authoritative menu data.

# 100. Menu Availability Windows
- Filter or represent current availability based on existing semantics.
- Define current time source.
- Tests should use deterministic time injection if availability logic is pure/application-side.
- If DB handles availability, test SQL boundary.
- Avoid flaky wall-clock tests.

# 101. Read Model Versioning
- No explicit API version is required unless public API contract already exists.
- Keep internal TypeScript interfaces stable for R03/R04 consumption.
- Breaking changes should be deliberate.
- Avoid embedding database row shape directly in UI contracts.

# 102. Transaction API Example
```ts
await withCustomerDataTransaction(customerContext, async (scope) => {
  const menu = await scope.repositories.menu.listAvailable();
  return menu;
});
```
- `customerContext` must already be validated.
- Wrapper derives DB context.
- Wrapper sets customer role/context transaction-locally.
- Repository cannot override tenant/branch.

# 103. Repository Construction Rule
- Construct repository with transaction and trusted scope.
- Avoid singleton repository carrying request context.
- Avoid mutable global context.
- Request-specific state must be lexical/function-scoped.

# 104. Type Boundary
- Prefer branded/narrow types only if they improve actual safety.
- Do not over-engineer wrapper types for every UUID.
- At minimum separate `CustomerContext` from staff `AccessContext` in imports/types.
- Keep domain read models distinct from DB rows.

# 105. Error Boundary Example
```ts
type CustomerDataResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_found" }
  | { status: "unavailable" };
```
- Use exceptions or result unions according to current project convention.
- Do not mix both inconsistently across repositories.
- Infrastructure errors should be translated once at service boundary.

# 106. Retry Behavior
- Read-only transient DB failure may be retried by request/user refresh.
- Do not add automatic aggressive retry loops inside repositories by default.
- Avoid retrying deterministic schema/query errors.
- Mutation retries belong later with idempotency design.

# 107. Atomicity Scope
- R02 transaction wrapper guarantees one callback transaction.
- Read aggregate sees coherent snapshot.
- Any incidental scoped write added solely for metadata must be justified; avoid it by default.
- R03 later uses same transaction composition for persistence.

# 108. Rollback Contract
- Any callback exception rolls back transaction.
- Transaction-local role/context clears.
- No partial future mutation should survive when wrapper is reused later.
- Add test with deliberate thrown error and subsequent context leakage check.

# 109. Database Function Contract
- If private read function is introduced, name it narrowly.
- Function should take resource-specific parameters, not arbitrary tenant ID authority.
- Tenant/branch should derive from current customer DB context where possible.
- Fixed search path required.
- Return contract should be stable and narrow.

# 110. Public Schema Exposure
- Do not create anonymous broad views of private/customer-sensitive data.
- Use server DB role/functions only.
- Supabase anon/authenticated API roles should not gain new unrestricted customer data access unless explicitly designed.
- Existing client-side Supabase access should not become authority for this round.

# 111. Supabase Client Boundary
- If current app has browser Supabase client, R02 should not use it to bypass server CustomerContext.
- Customer server data plane should remain server-mediated.
- Realtime subscription architecture is later scope.
- Do not expose service-role key to browser.

# 112. Tenant Isolation Tests
- Tenant A customer context reads Tenant A storefront/menu only.
- Tenant B customer context reads Tenant B only.
- Tenant A cannot request Tenant B item by UUID and receive it.
- Same item-like code/slug across tenants remains correctly scoped.
- Out-of-scope resource maps safely.

# 113. Branch Isolation Tests
- Branch A1 context reads A1 availability/configuration.
- Branch A1 cannot read A2 branch-only content when schema differentiates.
- Tenant-wide catalog data shared across branches may be visible only according to business model.
- Tests should distinguish tenant-owned versus branch-owned rows.

# 114. Table Scope Tests
- Table A1 context cannot switch to another table by request body/query.
- Table-specific state read uses current context table.
- Non-table menu read can remain branch-scoped.
- Repositories should not overconstrain menu data by table when not required.

# 115. Invalid Context Tests
- Missing context rejected before DB domain query.
- Expired capability handled by R01 helper.
- Revoked capability handled by R01 helper.
- Malformed context cannot be constructed from untrusted payload through public API.
- Direct repository unit invocation still expects trusted context type/validation boundary.

# 116. Unit Test Matrix — Context Derivation
- maps CustomerContext tenant correctly.
- maps branch correctly.
- maps capability ID correctly.
- maps table/table session correctly.
- does not map staff actor ID.
- does not accept override tenant.
- immutable/read-only behavior where implemented.

# 117. Unit Test Matrix — Error Mapping
- DB unavailable maps unavailable.
- not-found maps not-found.
- out-of-scope maps safe not-found/denied result.
- invariant violation remains distinguishable internally.
- raw SQL error text not surfaced.

# 118. Unit Test Matrix — Menu Mapping
- DB row maps customer-safe item.
- internal columns omitted.
- price remains exact.
- ordering preserved.
- unavailable item excluded or represented according to chosen contract.

# 119. Unit Test Matrix — Repository Factory
- all repositories receive same transaction object.
- all repositories receive same immutable scope.
- caller cannot override tenant/branch through method options.
- constructing a second scope creates independent repositories.
- no module-level mutable context.

# 120. Integration Test Matrix — Transaction Context
- customer role set locally.
- tenant context set locally.
- branch context set locally.
- capability/table context set only if designed.
- context absent after transaction.
- role absent after transaction.
- rollback clears context.

# 121. Integration Test Matrix — Storefront
- valid A1 context returns A storefront.
- B context returns B storefront.
- wrong/out-of-scope IDs cannot override.
- missing underlying branch treated as invariant/unavailable as designed.
- internal config not returned.

# 122. Integration Test Matrix — Menu
- categories/items scoped correctly.
- availability filters correctly.
- modifier relationships resolve correctly.
- deterministic order.
- no cross-tenant leakage.
- no sibling-branch leakage where branch-specific.
- no internal staff data in result.

# 123. Integration Test Matrix — Aggregate Snapshot
- storefront and menu read in one transaction.
- both use same tenant/branch.
- failure in menu does not return misleading successful aggregate.
- repeated read gives deterministic shape for stable fixtures.
- no transaction object escapes serialization boundary.

# 124. Database Test Matrix
- customer role has only expected privileges.
- customer role cannot read credentials.
- customer role cannot read memberships/roles/permissions unless explicitly needed and safe.
- customer role cannot write cart/order tables in R02 by default.
- customer role denied cross-tenant data.
- customer role denied unrelated schemas.
- private functions have fixed search path.
- public/anon roles do not gain unintended execute/table grants.

# 125. Negative Authorization Matrix
- forged tenant selector ignored/denied.
- forged branch selector ignored/denied.
- forged table ID ignored/denied.
- forged restaurant ID ignored/denied.
- customer context cannot call staff-only permission path.
- customer role cannot become `flow_runtime`.
- customer role cannot set arbitrary actor ID authority.

# 126. Concurrency Matrix
- concurrent Tenant A/Tenant B reads isolated.
- concurrent A1/A2 reads isolated.
- thrown error in A request does not affect B.
- staff/customer transaction interleaving does not leak role/context.
- pool reuse remains safe.

# 127. Regression Requirements — R01
- customer capability codec tests remain green.
- entry selector/resolver tests remain green.
- customer capability DB tests remain green.
- E2E entry flow remains green.
- capability expiry/revocation behavior preserved.
- customer/staff session isolation preserved.

# 128. Regression Requirements — Phase 02
- Auth.js internal login remains green.
- workspace AccessContext remains green.
- permission route enforcement remains green.
- permission command enforcement remains green.
- RLS cross-tenant denial remains green.
- legacy auth remains removed.

# 129. Application Validation
- run lint.
- run typecheck.
- run unit tests.
- run relevant integration tests.
- run Next.js build.
- run customer E2E subset when page/data source changes.
- record actual results in implementation PR.

# 130. Database Validation
- start/reset local Supabase where migration/DB tests require it.
- run database SQL tests.
- run database lint.
- regenerate DB types if schema changes.
- verify generated type drift.
- run DB runtime integration tests.
- do not use production/linked destructive DB operations.

# 131. Validation Command Discipline
- Inspect `package.json` and workflow scripts before running commands.
- Use repository-defined scripts rather than inventing unsupported commands.
- Record `NOT RUN` when connector/runtime cannot execute a command.
- Do not convert CI absence to PASS.
- Do not modify workflow scope merely to make unrelated check report green.

# 132. Implementation Order — 1
- re-fetch current main.
- read exact R02 spec.
- identify latest R01 implementation lineage.
- branch from latest R01 branch.
- inspect any intervening R01 changes.
- do not branch from docs branch.

# 133. Implementation Order — 2
- audit existing customer capability module.
- audit DB roles/grants from R01 migration.
- audit current menu/storefront queries.
- audit schema indexes and RLS.
- decide whether new customer runtime role is needed.

# 134. Implementation Order — 3
- define customer data context and errors.
- define transaction wrapper contract.
- write pure unit tests.
- preserve separation from staff AccessContext.

# 135. Implementation Order — 4
- implement database transaction role/context setup.
- add leakage/rollback integration tests.
- keep privileges minimal.
- add migration only if required.

# 136. Implementation Order — 5
- implement storefront repository.
- implement menu repository.
- use transaction-bound context.
- add repository unit/integration tests.

# 137. Implementation Order — 6
- implement service/read aggregate where customer page needs it.
- keep SQL out of UI/routes.
- map safe errors/empty states.
- avoid UI redesign.

# 138. Implementation Order — 7
- integrate one real customer read surface as proof if current app is still static/mock.
- preserve existing navigation/entry flow.
- do not add cart/order persistence.
- add E2E regression if user-visible data path changes.

# 139. Implementation Order — 8
- run database privilege and cross-tenant tests.
- run R01 regressions.
- run Phase 02 regressions.
- record real outcomes.
- open one R02 implementation PR.
- stop without merging it.

# 140. Definition of Done — Architecture
- one canonical customer data transaction boundary exists.
- repositories consume trusted customer context.
- repositories do not parse capability token.
- route/page code does not inline domain SQL.
- R03 can reuse transaction/repository patterns.
- staff/customer trust models remain separate.

# 141. Definition of Done — Security
- client cannot override tenant/branch/table authority.
- customer DB role is least-privileged.
- no broad staff runtime privilege granted to customer.
- no cross-tenant leakage.
- no sibling-branch leakage where data is branch scoped.
- pooled role/context leakage tests exist.
- raw DB errors/secrets/tokens are not exposed.

# 142. Definition of Done — Data Reads
- customer storefront reads through canonical layer.
- customer menu reads through canonical layer when in scope.
- deterministic ordering is defined.
- availability semantics reuse existing model.
- empty state is distinct from unavailable failure.
- internal-only fields are omitted.

# 143. Definition of Done — Database
- migration is forward-only if added.
- customer role/grants/functions are narrowly scoped.
- RLS remains enabled where applicable.
- generated types are current if schema changed.
- no R03 cart/order write privileges are granted prematurely.
- production DB remains untouched.

# 144. Definition of Done — Tests
- context derivation unit tests.
- repository mapping tests.
- transaction leakage/rollback integration tests.
- tenant/branch negative tests.
- privilege-denial SQL tests where DB scope changes.
- real customer read integration coverage.
- inherited R01/Phase02 regressions remain covered.

# 145. Explicit Prohibitions
- do not implement durable cart persistence.
- do not implement durable order persistence.
- do not create cart/order lifecycle migrations.
- do not implement checkout/order-submit commands.
- do not implement generic idempotency keys.
- do not add payment collection.
- do not add kitchen ticket routing.
- do not add realtime subscriptions.
- do not redesign staff authorization.
- do not trust browser tenant/branch/table selectors.
- do not use service-role key in client.
- do not grant customer role broad table privileges.
- do not merge implementation PR.

# 146. PR Requirements — Metadata
- Phase `03`.
- Round `02`.
- Specification `FLOW_P03_R02_IMPLEMENTATION_SPEC.md`.
- implementation parent branch.
- implementation parent SHA.
- implementation head SHA.
- exact DB role/context strategy.
- exact repository files.
- schema/migration changed YES/NO.
- generated types changed YES/NO.
- user-visible read integration changed YES/NO.

# 147. PR Requirements — Validation
- lint result.
- typecheck result.
- unit test result.
- integration test result.
- build result.
- DB test result when applicable.
- E2E result when applicable.
- context leakage result.
- cross-tenant/branch denial result.
- use PASS/FAIL/NOT RUN/BLOCKED/NOT APPLICABLE only.

# 148. PR Requirements — Architecture Evidence
- exact transaction helper implementation.
- exact repository factory pattern.
- exact read model contracts.
- explain role decision using R02 matrix.
- explain public-vs-capability read split.
- explain whether customer page switched from static/mock to database-backed read.

# 149. PR Requirements — Scope Declaration
```text
PHASE: P03
ROUND: R02
CUSTOMER_DATA_ACCESS_LAYER_IMPLEMENTED: YES
CUSTOMER_TRANSACTION_COMPOSITION_IMPLEMENTED: YES
CUSTOMER_READ_REPOSITORIES_IMPLEMENTED: YES
CUSTOMER_CONTEXT_AUTHORITY_CHANGED: NO
CART_PERSISTENCE_IMPLEMENTED: NO
ORDER_PERSISTENCE_IMPLEMENTED: NO
CUSTOMER_COMMAND_FLOW_IMPLEMENTED: NO
IDEMPOTENCY_FRAMEWORK_IMPLEMENTED: NO
PAYMENT_RUNTIME_CHANGED: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 150. R03 Handoff Contract
- R03 receives validated `CustomerContext` from R01.
- R03 receives customer DB transaction composition from R02.
- R03 receives repository conventions and error mapping from R02.
- R03 may introduce cart/order persistence without inventing another DB context layer.
- R03 should extend repository family with cart/order repositories.
- R03 should add write privileges only for the exact persisted operations it owns.
- R03 should preserve customer/staff authority separation.

# 151. Exact R03 Ownership
- durable cart storage.
- durable cart item storage.
- durable order storage foundation.
- order item storage foundation.
- lifecycle/status invariants owned by persistence layer.
- customer capability/context ownership columns/relations where needed.
- persistence migrations.
- persistence repository implementations.
- R02 must not implement these prematurely.

# 152. R03 Write-Privilege Handoff
- R02 customer role should finish with read-only/customer-safe privileges.
- R03 must explicitly add only required INSERT/UPDATE operations.
- R03 must add RLS/function rules for those writes.
- R03 must not infer write authority from R02 role name.
- R03 should preserve R02 negative write-denial test and amend it deliberately when exact writes are introduced.

# 153. R04 Boundary
- command input validation.
- add/remove/update cart command orchestration.
- submit order command orchestration.
- transaction side-effect ordering.
- domain failure mapping at command boundary.
- R02 does not implement these command flows.

# 154. R05 Boundary
- idempotency key contract.
- retry/dedupe persistence.
- duplicate-submit defense.
- race handling for customer mutations.
- R02 does not add generic idempotency infrastructure.

# 155. R06 Boundary
- end-to-end customer data-plane acceptance.
- entry → capability → data access → persistence → command → idempotency proof.
- Phase 04 handoff.
- R02 does not claim Phase 03 completion.

# 156. Failure Case Matrix — Context Missing
- no customer cookie/context.
- expected: stop before customer DB transaction.
- UI: re-entry path according to R01.
- DB: no domain query.
- logs: safe category only.

# 157. Failure Case Matrix — Capability Revoked
- R01 returns revoked/invalid context state.
- R02 must not compensate by accepting URL tenant/table selectors.
- no domain query should execute under guessed scope.
- customer is directed to re-enter/rescan.

# 158. Failure Case Matrix — Database Unavailable
- context may be valid but DB read fails.
- return unavailable state.
- do not show empty menu as if legitimate.
- allow safe retry.
- no raw connection error exposed.

# 159. Failure Case Matrix — Out-of-Scope Resource
- caller supplies item ID from another tenant/branch.
- repository applies trusted scope.
- no row is returned/operation denied.
- response does not reveal other tenant ownership.

# 160. Failure Case Matrix — Schema Drift
- query/function missing after bad migration state.
- implementation tests fail.
- runtime returns safe unavailable/internal error.
- do not silently fallback to unscoped query.

# 161. Failure Case Matrix — Transaction Throw
- repository/service throws inside callback.
- transaction rolls back.
- role/context clears.
- next pooled request starts clean.

# 162. Failure Case Matrix — Partial Aggregate Read
- storefront read succeeds.
- menu read fails in same aggregate transaction.
- return failure rather than partially trusted aggregate unless product explicitly supports partial state.
- transaction/read snapshot ends safely.

# 163. Failure Case Matrix — Empty Menu
- database query succeeds.
- context remains valid.
- zero available items returned.
- service returns successful empty menu.
- UI may show customer-safe empty state.
- do not classify as outage.

# 164. Error Logging Contract
- record error class/code.
- record subsystem.
- optionally record request/correlation ID.
- do not log bearer capability.
- do not log AUTH_SECRET/DB secret.
- avoid logging unrelated tenant resource details on denial.

# 165. Query Performance Contract
- bounded menu query count.
- no per-item modifier query loop where avoidable.
- select only needed columns.
- index predicates on tenant/branch/status/foreign keys where appropriate.
- no premature caching complexity.

# 166. Query Count Evidence
- Implementation PR should state actual expected query count for storefront/menu aggregate.
- If one SQL query is overly complex, a small fixed number of queries is acceptable.
- N+1 means query count grows with item/category count and is prohibited unless explicitly justified.
- Tests may spy repository calls or inspect query composition where practical.

# 167. Performance Budget Guidance
- Storefront-only read should normally be constant-query complexity.
- Menu aggregate should remain constant-query complexity with respect to item count.
- Serialized payload should contain customer-visible fields only.
- Avoid loading full audit/settings/permission JSON blobs.
- If actual dataset size makes one aggregate impractical, document bounded pagination without adding generic framework.

# 168. Resource Safety
- bound any search/filter input.
- avoid unbounded full-table customer query.
- avoid client-controlled arbitrary sorting SQL.
- use deterministic default limits if future list can grow large.

# 169. Customer Data Module Export Discipline
- export only service/repository/context APIs intended for server callers.
- keep low-level SQL helpers private.
- do not export DB runtime to client imports.
- use `server-only` consistently.

# 170. Test Fixture Reuse
- reuse deterministic Tenant A/Tenant B/branch fixtures.
- reuse customer entry fixture/table from R01.
- add menu/storefront fixture only if current seed lacks needed deterministic data.
- avoid creating duplicated tenant identities.
- fixture additions must remain non-production.

# 171. Seed Changes
- Seed changes are allowed only for deterministic local/test customer read data.
- Do not add production customer data.
- Keep IDs deterministic.
- Keep cross-tenant/branch fixtures sufficient for negative tests.
- If existing seed already covers menu data, do not duplicate it.

# 172. Database Role Privilege Matrix
- credentials/private auth tables: DENY.
- memberships/roles/permissions: DENY by default.
- audit events: DENY.
- payments: DENY in R02.
- cart/order write tables: DENY write in R02.
- customer-safe menu/storefront reads: ALLOW narrowly.
- private customer read functions: EXECUTE narrowly if used.

# 173. Customer vs Staff Context Matrix
- CustomerContext has no actorId.
- Staff AccessContext has actorId.
- customer transaction does not set staff actor authority.
- staff transaction does not consume customer capability.
- repositories for customer public data should not require staff permissions.
- internal admin paths continue using R05 permission checks.

# 174. Capability ID Semantics
- capabilityId is correlation/scope metadata.
- it is not permission code.
- it is not DB user.
- it is not primary tenant authority without validated CustomerContext.
- future cart/order may reference capability/session lineage only if R03 spec chooses it.

# 175. Table Session Semantics
- R02 reads only what current table session contract needs.
- do not invent ownership mutation.
- closed session should prevent context validation before data mutation later.
- menu/catalog read policy for closed session should follow R01/product entry semantics.
- document any distinction clearly.

# 176. Public Menu Without Table Session
- If product allows browsing before active table session, data layer may support branch-scoped catalog read with validated entry context.
- Do not invent anonymous branch enumeration.
- Entry resolution still establishes branch safely.
- Keep mutation capability stricter than browse capability if differentiated.

# 177. URL Selector Handling After Entry
- restaurantSlug/tableCode may remain in URL for UX.
- repositories must not treat them as authoritative after capability/context exists.
- mismatched URL and context should redirect/re-enter or display safe error, not switch authority.
- add regression test if page route retains selectors.

# 178. Browser Refresh Behavior
- refresh rehydrates current customer context through R01.
- data service reruns safe reads.
- no client-local cached tenant override.
- expired/revoked context follows R01 recovery.

# 179. Multi-Tab Behavior
- tabs sharing customer cookie may share capability context.
- data reads remain scoped by validated context each request.
- changing URL in one tab cannot expand scope.
- no per-tab DB authority state stored globally.

# 180. Customer Re-entry Behavior
- new valid entry may replace capability according to R01.
- subsequent data reads use new context.
- stale server/browser data from old context must not be reused across tenant/branch.
- client state caches should reset when context identity changes where relevant.

# 181. Cache-Key Safety
- Any server cache key must include tenant and branch at minimum.
- Any client query key must include a safe context identity when cross-entry reuse is possible.
- Do not cache by item ID alone across tenants.
- Avoid caching context-bound response globally.

# 182. SSR Data Safety
- Server-rendered customer page must fetch under request-specific context.
- Do not build static page containing tenant-specific private state unless explicitly public and keyed correctly.
- Avoid cross-request module-level mutable caches.

# 183. Build-Time Safety
- Build should not require live production DB.
- Customer server modules must not execute DB query at module import time.
- Runtime env validation may happen lazily/at server request according to current conventions.
- Static metadata generation must not need capability secret.

# 184. Environment Variables
- No new variable expected unless new customer runtime configuration is truly required.
- Do not duplicate R01 capability secret.
- Database URL remains existing server runtime config.
- If a query timeout config is introduced, justify it and document default.

# 185. Dependency Policy
- Prefer existing Kysely/Postgres stack.
- No new ORM.
- No new cache library.
- No new validation library unless existing stack lacks required capability and benefit is concrete.
- Avoid package churn.

# 186. Migration Naming
- Follow timestamp + `p03_r02` descriptive naming convention.
- Migration must be forward-only.
- Preserve historical files.
- Add comments explaining new customer role/function boundary.

# 187. Migration Rollback Planning
- Production rollback is operationally forward-fix by default.
- Do not rely on editing historical migration after deployment.
- New role/function can be replaced/revoked in future migration if needed.
- Tests must verify clean bootstrap from scratch.

# 188. Database Function Search Path Test
- inspect `proconfig` or function definition if pgTAP supports it.
- verify fixed search path.
- verify public execute revoked.
- verify intended role execute granted.
- verify function cannot expose unrelated tenant rows.

# 189. Privilege Escalation Test
- customer role cannot `set role flow_runtime` unless role membership explicitly absent.
- customer role cannot modify roles/grants.
- customer runtime user/login arrangement remains server-owned.
- no database superuser assumption in application runtime.

# 190. RLS Write Denial Test
- if cart/order tables are visible through schema grants, customer role must still lack writes in R02.
- INSERT cart denied.
- UPDATE order denied.
- DELETE order denied.
- R03 later adds exact required rights intentionally.

# 191. Read Function Abuse Test
- invalid resource ID returns no data/safe error.
- other-tenant resource ID returns no data.
- branch mismatch returns no data.
- null/malformed parameter behavior deterministic.
- function cannot be used to enumerate tenants.

# 192. Storefront Mapping Test
- display name correct.
- branch name correct.
- table label correct when present.
- no internal secret/config fields.
- no staff membership data.

# 193. Menu Mapping Test
- item IDs stable.
- category grouping stable.
- modifier group relationships stable.
- price exact.
- inactive items absent.
- ordering deterministic.

# 194. Availability Boundary Test
- currently unavailable item excluded/flagged according to contract.
- future window becomes available under deterministic clock when tested.
- branch timezone honored if model exists.
- no browser timezone authority.

# 195. Database Unavailable Integration Test
- inject/force repository failure where test infrastructure allows.
- service returns unavailable.
- UI error state is not empty menu.
- no sensitive message leak.

# 196. Repository Not-Found Test
- authorized-scope missing ID returns not-found.
- unauthorized other-tenant ID returns same public contract.
- internal diagnostics can differentiate safely if needed.

# 197. Route/API Direct Bypass Test
- direct API request with forged tenant ID does not expand context.
- direct API request with forged branch ID does not expand context.
- direct API request without capability fails when context required.
- valid capability gets scoped result.

# 198. Client Boundary Test
- client bundle does not import DB module.
- client bundle does not contain DB secret.
- client bundle does not contain capability signing secret.
- client receives only read model.

# 199. Implementation Evidence — Architecture
- exact data module paths.
- exact transaction wrapper path.
- exact repository paths.
- exact DB role used.
- explanation why role was reused or newly created.
- explanation of public vs capability-bound read split.

# 200. Implementation Evidence — Security
- proof tenant cannot be overridden.
- proof branch cannot be overridden.
- proof customer role cannot access auth/private/staff tables.
- proof customer/staff context does not leak.
- proof no write authority granted prematurely.

# 201. Implementation Evidence — Database
- migration YES/NO.
- generated types YES/NO.
- role/function/grant changes.
- RLS changes.
- new indexes and reason.
- clean reset/bootstrap result.

# 202. Implementation Evidence — Application
- page/API integration changed YES/NO.
- static/mock read replaced YES/NO.
- loading/empty/error states impacted.
- E2E coverage added/updated.
- no cart/order mutation included.

# 203. Implementation Evidence — Performance
- query count for menu aggregate.
- N+1 avoided.
- indexes used/added where relevant.
- selected columns bounded.
- no global context-bound cache.

# 204. Stop Condition — R01 Contract Drift
- If latest R01 branch no longer exposes trustworthy `CustomerContext`, stop and reconcile actual parent state.
- Do not invent alternate authority.
- If only path/name changed but semantics remain, adapt implementation without scope expansion.

# 205. Stop Condition — Broad Privilege Required
- If proposed read layer appears to require broad `flow_runtime` or service-role privileges, stop.
- Reassess DB function/RLS boundary.
- Do not weaken Phase 02 security to make customer reads easy.

# 206. Stop Condition — Persistence Required
- If desired read feature cannot work without durable cart/order writes, leave it for R03.
- Do not implement partial persistence hidden inside R02.
- Document exact dependency in PR handoff.

# 207. Stop Condition — Schema Ambiguity
- If menu/storefront schema cannot express tenant/branch ownership safely, report exact ambiguity.
- Add only minimal invariant migration if it legitimately belongs to data-access security.
- Do not redesign business schema broadly.

# 208. Stop Condition — Production Mutation
- No linked/prod DB reset.
- No production destructive migration experiment.
- No secret extraction.
- Local/CI validation only unless separately authorized.

# 209. Document Validation Checklist
- [x] canonical filename P03/R02.
- [x] Phase 03.
- [x] Round 02.
- [x] Status READY.
- [x] Previous P03/R01.
- [x] Next P03/R03.
- [x] authority main.
- [x] R01 branch evidence grounded in actual source.
- [x] CustomerContext reuse explicit.
- [x] customer/staff trust separation explicit.
- [x] transaction composition explicit.
- [x] repository ownership explicit.
- [x] DB least privilege explicit.
- [x] cross-tenant/branch denial explicit.
- [x] rollback/context leakage explicit.
- [x] error taxonomy explicit.
- [x] test matrices explicit.
- [x] R03 boundary explicit.
- [x] no cart/order persistence in R02.

# 210. Document Internal Consistency
- Metadata identifies R02 only.
- R02 owns primitives, not persisted cart/order domain state.
- CustomerContext remains R01 authority.
- Staff AccessContext remains separate.
- Suggested new DB role is conditional on least-privilege need.
- No section authorizes payment/kitchen/realtime/voice work.
- No section authorizes implementation merge by agent.
- No section pre-grants R03 write privileges.

# 211. Document-Only Validation Policy
- Validate metadata, sequence, repository evidence, architecture, security, failure behavior, tests, and handoff.
- GitHub Actions are not document-validation authority.
- Missing/failed/queued/skipped Actions do not semantically invalidate this document.
- Hosted enforcement may technically block docs merge; report as hosted merge restriction if that occurs.
- Documentation task must not modify implementation/workflows merely to force docs merge.

# 212. Implementation Validation Policy
- Future implementation must run actual applicable repository checks.
- Document source audit is not runtime proof.
- Failed required implementation checks remain truthful blockers.
- Implementation PR remains owner-controlled.
- Do not fabricate PASS.

# 213. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This spec authorizes only P03/R02 implementation after it is on main.
- Future implementation must branch from latest legitimate P03/R01 implementation branch.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 214. Final Handoff to R03
- Trusted authority input remains `CustomerContext` from R01.
- R02 supplies reusable customer DB transaction composition.
- R02 supplies customer-safe storefront/menu repository patterns.
- R02 supplies least-privilege customer database role/function/RLS boundary when required.
- R02 supplies explicit data-layer error contracts.
- R02 supplies context-leakage and cross-tenant regression protection.
- R03 can add durable cart/order persistence without re-solving authority or generic query architecture.

# 215. R03 Acceptance Inputs
- R03 must reuse the exact R02 transaction helper or its final equivalent.
- R03 must reuse the exact R02 scope mapper.
- R03 must extend repository composition rather than bypass it.
- R03 must inspect R02 role/grants before adding writes.
- R03 must preserve R02 read behavior/regressions.
- R03 must not move cart/order authority into browser state.

# 216. R03 Write Authorization Preconditions
- R03 spec must inspect actual R02 role name and grants rather than assuming `flow_customer_runtime` exists.
- Any INSERT/UPDATE/DELETE grant must be tied to exact cart/order operation.
- R03 must add negative wrong-tenant/wrong-branch write tests.
- R03 must preserve fixed-search-path rules for any new private mutation functions.
- R03 must not reuse staff `flow_runtime` as shortcut.

# 217. R03 Persistence Schema Preconditions
- R03 must inspect existing `foodflow.carts`, `cart_items`, `orders`, and `order_items` schema before migration design.
- Existing tables must be extended/reused when semantically correct.
- Do not create duplicate cart/order tables under another schema merely to simplify customer writes.
- Historical migrations remain immutable.
- Customer capability/session ownership linkage must be explicit if added.

# 218. R03 Repository Extension Preconditions
- Cart/order repositories must be transaction-bound like R02 repositories.
- They must derive scope from trusted context.
- They must not accept tenant/branch override parameters.
- They must use exact persistence errors rather than raw DB errors.
- They must remain server-only.

# 219. Final R02 Acceptance Evidence Required
- exact customer data transaction path recorded.
- exact DB role/grants recorded.
- exact repository paths recorded.
- exact customer read surface integrated recorded.
- cross-tenant denial evidence recorded.
- context leakage/rollback evidence recorded.
- R03 write privileges remain absent and proven.
- no cart/order persistence migration is included.

# 220. Required Next Specification
```text
FLOW_P03_R03_IMPLEMENTATION_SPEC.md
```
- R03 specification must be authored from actual R02 implementation state.
- R02 does not infer R03 schema prematurely.
- No R03 implementation starts until exact spec exists on `main`.

# 221. Final Acceptance Statement
- P03/R02 is READY as an executable specification document.
- R02 establishes the customer server data-access substrate between capability trust and durable persistence.
- Customer repositories consume validated context rather than raw client selectors.
- Customer DB execution remains least-privileged and isolated from staff authority.
- Cart/order persistence, customer command orchestration, and idempotency remain deferred to later rounds.
