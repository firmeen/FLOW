# FLOW P03 R03 — Implementation Specification
> Phase 03 — Core Server Data Plane + Customer Capability
> Round 03 — Durable Cart + Order Persistence Foundation
> Revision — Establish durable customer cart/order storage, ownership invariants, persistence repositories, lifecycle boundaries, and transaction-safe persistence handoff for later command orchestration.

## Metadata
- Phase: `03`
- Round: `03`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P03_R02_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P03_R04_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P03 implementation slot after this spec is on main`
- Current planning scope: `PHASE 03 / ROUND 03 ONLY`
- Implementation parent: `latest completed P03/R02 implementation lineage tip`
- Expected implementation parent branch: `p03-r02-customer-data-access`
- Observed R02 branch head at authoring: `19c57bcb654640174162f1ff313c8a5af9d5d578`
- Observed R02 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Recommended implementation branch: `p03-r03-cart-order-persistence`
- Recommended implementation PR title: `feat(customer-data): establish durable cart and order persistence`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Durable cart persistence in this round: `YES`
- Durable order persistence foundation in this round: `YES`
- Persistence repository integration in this round: `YES`
- Customer-context ownership invariants in this round: `YES`
- Generic command orchestration in this round: `NO — P03/R04`
- Generic idempotency framework in this round: `NO — P03/R05`
- Realtime/kitchen/payment execution in this round: `NO`
- Production destructive DB mutation: `NO`

# 1. Authoring State
- Current `main` remains the policy/specification authority.
- `FLOW_P03_R02_IMPLEMENTATION_SPEC.md` exists on `main` and is READY.
- R02 spec points `Next` to this canonical filename.
- No `FLOW_P03_R03_IMPLEMENTATION_SPEC.md` existed on `main` before this document was authored.
- No `p03-r03-*` implementation branch existed at authoring.
- Latest observed R02 implementation branch is `p03-r02-customer-data-access`.
- Latest observed R02 head is `19c57bcb654640174162f1ff313c8a5af9d5d578`.
- R02 is 19 commits ahead of R01.
- R02 contains `customer-data` context, errors, types, transaction helper, repository factory, storefront repository, menu repository, service integration, migration, and integration/database tests.
- R02 therefore provides a stable data-access substrate for persistence work.
- This task remains specification/documentation only.
- This task does not create the R03 implementation branch.
- This task does not modify runtime, database, migration, package, workflow, or product code.
- This task does not merge an implementation PR.

# 2. Phase 03 Objective
- Phase 03 establishes the customer-facing server data plane.
- Customer capability/session trust comes from R01.
- Customer-safe server data access comes from R02.
- Durable cart/order storage begins in R03.
- Customer commands are orchestrated in R04.
- Retry/idempotency/concurrency hardening is centralized in R05.
- End-to-end acceptance closes the phase in R06.
- Phase 03 must preserve tenant isolation.
- Phase 03 must preserve branch isolation.
- Phase 03 must preserve customer capability separation from internal staff Auth.js.
- Phase 03 must preserve database least privilege.
- Phase 03 must not make the browser the canonical source of cart/order state.
- Phase 03 must support future kitchen, payments, notifications, realtime, and analytics without premature coupling.

# 3. Six-Round Phase Boundary
- R01 owns customer capability/session boundary.
- R01 owns QR/direct-entry trust and CustomerContext.
- R02 owns customer data-access architecture and least-privilege transaction/repository primitives.
- R03 owns durable cart/order persistence foundation.
- R03 owns schema invariants, row ownership, repositories, read/write persistence APIs, and storage lifecycle boundaries.
- R04 owns customer command orchestration and side-effect ordering.
- R05 owns idempotency, duplicate-submit resistance, retry/concurrency control.
- R06 owns end-to-end acceptance.
- R03 must not absorb R04/R05 responsibilities.

# 4. Why R03 Exists Now
- R01 created customer trust.
- R02 created customer-safe server reads and transaction composition.
- Browser-local cart/order state is not durable authority.
- Cart/order persistence requires explicit ownership and lifecycle invariants before command logic is added.
- If command flows are built before storage invariants exist, route handlers will invent persistence rules ad hoc.
- If order writes are exposed before transaction ownership is clear, duplicate or cross-scope records can appear.
- If cart/order rows accept tenant/branch IDs from browser payloads, customer scope can be forged.
- R03 therefore creates the storage substrate that R04 can orchestrate without re-solving persistence.

# 5. R03 High-Impact Objective
- Establish one canonical durable cart model.
- Establish one canonical durable order persistence model.
- Bind every customer cart/order row to validated customer scope.
- Ensure tenant/branch ownership is server-derived.
- Ensure table/table-session ownership is server-derived when applicable.
- Ensure cart/order IDs are opaque stable identifiers.
- Ensure monetary values have explicit canonical storage precision.
- Ensure item snapshots preserve ordering-time semantics where required.
- Ensure modifier selections are durable and relationally valid.
- Ensure persistence writes occur only through the customer data transaction boundary.
- Ensure repository APIs do not accept raw tenant/branch overrides.
- Ensure cart/order lifecycle state transitions are constrained even before R04 orchestration exists.
- Ensure invalid state cannot be stored merely because command orchestration is deferred.
- Ensure R04 can orchestrate commands using transaction-bound repositories rather than direct SQL.

# 6. R02 Handoff to Preserve
- `CustomerContext` remains the trusted authority input inherited from R01.
- R02 provides customer database context mapping.
- R02 provides customer-safe transaction composition.
- R02 provides transaction-bound repositories.
- R02 provides storefront/menu read models.
- R02 provides least-privilege customer database execution.
- R03 must reuse these primitives.
- R03 must not create a parallel transaction helper.
- R03 must not create a second customer database role unless current R02 implementation proves a distinct write role is required.
- R03 must not bypass repository composition with route-local database clients.

# 7. Current Persistence Baseline to Audit
- Existing FoodFlow schema may already contain carts, cart_items, orders, order_items, and related rows from earlier baseline migrations.
- Implementation must inspect actual latest R02 lineage before adding tables.
- Existing tables must be reused when their semantics satisfy R03.
- Forward-only migrations may add/alter constraints, indexes, columns, policies, or functions when required.
- Historical migrations must not be rewritten to simplify current work.
- Existing generated DB types must be updated through repository-approved generation path if schema changes.
- Existing tables must not be duplicated under new names merely to match this spec.

# 8. Cart Domain Contract
- A cart is a mutable customer-owned pre-order aggregate.
- A cart belongs to exactly one tenant.
- A cart belongs to exactly one branch.
- A cart belongs to exactly one customer capability/session scope or durable equivalent.
- A cart may belong to one table/table-session when table ordering is active.
- A cart must not silently move between branches.
- A cart must not silently move between tenants.
- A cart must not be shared between unrelated customer capabilities unless an explicit future feature introduces collaboration.
- Cart state must be explicit.
- Minimum cart lifecycle should distinguish active/open from terminal/converted/abandoned states where actual schema supports this distinction.
- If existing schema has different status names, implementation should normalize through domain types rather than duplicate storage state.

# 9. Cart Ownership Invariants
- `tenant_id` derives from CustomerContext.
- `branch_id` derives from CustomerContext.
- `table_id` derives from CustomerContext when table-bound.
- `table_session_id` derives from CustomerContext when present.
- capability/session ownership identifier must be server-derived.
- client may provide cart ID only as a selector.
- provided cart ID must be revalidated against current CustomerContext.
- a cart from another tenant must behave as not accessible.
- a cart from sibling branch must behave as not accessible.
- a cart owned by another customer capability must behave as not accessible.

# 10. Cart Identity
- Use UUID or current repository-standard opaque identifier.
- Avoid sequential externally guessable IDs for public cart selectors.
- Cart ID must not encode tenant or table information.
- Cart ID generation should occur server/database side consistently.
- Cart ID must remain stable across refresh/reload.
- Re-entry with a new capability must not automatically inherit old cart unless explicit ownership-transfer rules exist.

# 11. Cart Item Contract
- Each cart item belongs to one cart.
- Each cart item references a menu item or a durable menu-item snapshot reference strategy.
- Quantity must be positive and bounded.
- Invalid zero/negative quantity must be rejected at the closest authoritative layer.
- Item price used for customer calculation must be deterministic.
- If menu prices may change while cart is open, define whether cart uses current price or captured price.
- R03 should prefer explicit persisted unit-price snapshot if later order conversion must remain deterministic.
- Currency/storage scale must match existing platform conventions.
- Avoid floating-point storage for money.

# 12. Cart Modifier Contract
- Modifier selections must remain associated with exact cart item.
- Duplicate modifier choice behavior must be explicit.
- Quantity for modifier selection must be positive if model supports quantities.
- Selected modifier must belong to a modifier group available for the selected menu item.
- R03 persistence should enforce structural references where practical.
- Full business validation/orchestration may remain R04, but database must prevent obvious invalid foreign relationships.

# 13. Order Domain Contract
- An order is a durable submitted business record.
- R03 creates persistence foundation, not full submission orchestration.
- An order belongs to one tenant.
- An order belongs to one branch.
- An order may be linked to table/table-session when applicable.
- Order creation must ultimately derive customer scope from trusted context.
- Order status storage must use constrained canonical values.
- R03 must avoid implementing staff/kitchen transition orchestration.
- Initial order persistence may support only the minimum initial state required for R04 to submit transactionally.

# 14. Order Ownership Invariants
- tenant from CustomerContext.
- branch from CustomerContext.
- table/table-session from validated customer scope.
- no browser-supplied tenant or branch authority.
- order selector must be revalidated against scope.
- cross-tenant order reads/writes denied.
- sibling-branch order reads/writes denied.
- unrelated capability order reads/writes denied when customer visibility is supported.

# 15. Order Item Snapshot Contract
- Order items must preserve ordering-time item identity.
- Preserve display name/title snapshot where later menu edits must not rewrite historical receipt semantics.
- Preserve unit price snapshot.
- Preserve quantity.
- Preserve line subtotal or recomputable inputs according to current schema strategy.
- Preserve modifier selections/snapshots required for historical reconstruction.
- Do not depend solely on mutable menu relations for historical display.
- If existing schema already snapshots these fields, reuse it.

# 16. Monetary Storage
- Use integer minor units or repository-existing numeric strategy consistently.
- Never use JS floating-point as canonical persisted money representation.
- Database constraints should reject impossible negative monetary values where domain forbids them.
- Tax/service/discount fields should not be added speculatively if not required by current persistence model.
- R03 must avoid premature pricing engine work.
- Store only fields necessary to preserve durable persistence semantics for current ordering flow.

# 17. Currency Contract
- Currency should derive from tenant/branch/storefront configuration where applicable.
- Do not accept arbitrary client currency.
- If current platform is single-currency pilot, schema may use existing default/config rather than broad multi-currency redesign.
- Avoid hard-coded assumptions that prevent later expansion when current schema already models currency.

# 18. Lifecycle State Constraints
- Cart and order status columns must be constrained.
- Unknown status values must be impossible through ordinary writes.
- Terminal cart/order states must be identifiable.
- R03 may define legal storage states.
- R04 owns orchestration of transitions.
- R03 must not create unrestricted public `status` update APIs.
- Database-level checks should prevent structurally invalid states where practical.

# 19. Cart-to-Order Relationship
- If an order originates from a cart, relationship must be explicit.
- Prevent accidental conversion of one cart into multiple orders unless product explicitly allows it.
- R05 may later add idempotency protection for duplicate submit requests.
- R03 can establish a uniqueness constraint when one-cart-one-order is a hard invariant.
- If product allows multiple orders from a table session, uniqueness should apply to cart conversion, not table session.
- Do not make table session globally unique to order.

# 20. Customer Capability Ownership Model
- Persistence ownership must not store raw bearer token.
- Store capability/session stable identifier or a safe derived ownership key.
- Never persist secret bearer material.
- If R01 capability ID is safe opaque identifier, it may be persisted.
- If capability ID can rotate/reissue, ownership transfer behavior must be explicit.
- R03 must preserve ability to invalidate capability without corrupting historical order ownership.

# 21. CustomerContext to Persistence Mapping
- Introduce one pure mapper from CustomerContext to persistence scope when needed.
- Mapping must produce tenantId, branchId, tableId/tableSessionId, customer capability/session identifier.
- Repository callers must not construct persistence scope from body/query parameters.
- Prefer readonly typed context.
- Avoid optional fields where ambiguity creates authorization risk.

# 22. Database Role Strategy
- Reuse R02 customer runtime role where it can safely perform required writes through RLS/functions.
- If R02 role is intentionally read-only, R03 may extend grants narrowly or introduce narrow write functions.
- Do not grant broad `INSERT/UPDATE/DELETE` across unrelated schemas.
- Do not grant direct staff/admin table authority to customer runtime.
- Prefer narrow schema/table/function access.
- Public/anon/authenticated roles must not receive new direct write authority.

# 23. RLS Strategy
- Cart/order rows must be tenant isolated.
- Branch-scoped rows must honor branch context.
- Customer runtime must be narrower than `flow_runtime` staff authority.
- Customer capability ownership must be checked where customer-specific rows are exposed.
- RLS should remain defense in depth even when repository predicates already scope rows.
- Direct table access not required by the application should remain revoked.
- Negative tests must prove customer cannot access another customer's cart/order.

# 24. SECURITY DEFINER Strategy
- Use SECURITY DEFINER only when necessary.
- Every SECURITY DEFINER function must use fixed safe `search_path`.
- Function execution grants must be minimal.
- Revoke from `public`, `anon`, `authenticated` unless explicitly required.
- Function input must not allow caller to elevate tenant/branch scope.
- Trusted context should come from transaction-local settings or validated function parameters established server-side.

# 25. Transaction Boundary
- All persistence writes must execute inside R02 customer transaction boundary or final equivalent.
- Do not open nested independent transactions inside repositories.
- Repository functions should accept a transaction handle.
- One orchestration transaction in R04 should be able to compose cart/order repositories atomically.
- R03 repository API design must anticipate this.
- Transaction-local context must be set before writes.
- Rollback must remove partial cart/order/item writes.

# 26. Repository Factory Pattern
- Extend R02 repository factory rather than create unrelated global repository singletons.
- Factory should bind transaction and trusted CustomerDatabaseContext.
- CartRepository and OrderRepository should receive no raw tenant/branch arguments.
- Methods may receive entity IDs and validated domain input only.
- Repositories should return typed domain/read models, not raw Kysely rows.
- Repositories should normalize no-row behavior consistently.

# 27. CartRepository Responsibilities
- create active cart for current customer scope.
- find current/active cart by ID or ownership key.
- list cart items.
- add persisted cart item primitive where R03 scope allows storage-level operation.
- update cart item primitive where R03 scope allows.
- remove cart item primitive where R03 scope allows.
- mark cart terminal/converted only through internal persistence method intended for R04 orchestration.
- enforce scope on every query.
- never expose unrestricted status setter to route code.

# 28. OrderRepository Responsibilities
- persist initial order row from validated storage input.
- persist order items and modifier snapshots.
- find customer-visible order by ID and scope where needed.
- expose initial persistence primitives for R04 orchestration.
- avoid staff/kitchen operational transition methods.
- avoid payment state mutation.
- avoid realtime publish logic.
- remain transaction-bound.

# 29. Service Layer Boundary
- R03 may introduce persistence services if they improve composition.
- Service should not become full command orchestrator.
- Avoid route-specific functions like `handleSubmitOrderRequest()` in R03.
- Prefer storage-level operations such as `createEmptyCart`, `loadCartAggregate`, `persistDraftOrder` only when they map clearly to persistence ownership.
- R04 will decide command sequencing and user-facing command errors.

# 30. Expected Files to CREATE — Server
- `apps/web/next-flow/src/modules/customer-data/server/cart-repository.ts` — transaction-bound cart persistence.
- `apps/web/next-flow/src/modules/customer-data/server/order-repository.ts` — transaction-bound order persistence.
- `apps/web/next-flow/src/modules/customer-data/server/persistence-types.ts` — durable write/read contracts if existing `types.ts` would become overloaded.
- `apps/web/next-flow/src/modules/customer-data/server/persistence-errors.ts` only if current R02 errors cannot represent persistence-specific conflicts cleanly.
- `apps/web/next-flow/tests/integration/customer-cart-order-persistence.test.ts` — real persistence integration contract.
- Exact file split may adapt to existing R02 module layout.

# 31. Expected Files to MODIFY — Server
- `src/modules/customer-data/server/repositories.ts` to expose cart/order repositories through one transaction-bound factory.
- `src/modules/customer-data/server/index.ts` for narrow server-only exports.
- `src/modules/customer-data/server/types.ts` if durable read models belong there.
- `src/modules/customer-data/server/transaction.ts` only if minimal write-role/context support is required; do not duplicate helper.
- Customer entry/menu page should not be rewritten broadly in R03.

# 32. Expected Database Migration
- Add one forward-only P03/R03 migration when schema/grant/RLS changes are required.
- Candidate naming: `supabase/migrations/<timestamp>_p03_r03_cart_order_persistence.sql`.
- Reuse current migration naming conventions.
- Migration should be replayable on clean reset.
- Never edit old migrations solely to simplify R03.

# 33. Existing Cart/Order Table Audit
Implementation must inspect actual schema for:
- `foodflow.carts`.
- `foodflow.cart_items`.
- `foodflow.orders`.
- `foodflow.order_items`.
- modifier-related child tables.
- order events if present.
- table sessions.
- kitchen tickets only as downstream relation, not R03 command scope.
- payments only as downstream relation, not R03 payment scope.

# 34. Schema Decision Rule
- If existing schema already supports required persistence, prefer constraints/index/RLS/repository work over replacement tables.
- If fields are missing, add only fields needed for current invariants.
- If schema has redundant legacy fields, do not perform broad cleanup unless they block correctness.
- Do not rename large schema surface for aesthetics.

# 35. Required Cart Columns — Conceptual
- id.
- tenant_id.
- branch_id.
- customer capability/session ownership key.
- table_id or table_session_id as applicable.
- status.
- created_at.
- updated_at.
- optional expires/abandoned timestamp only if current behavior requires it.
- exact names follow actual schema.

# 36. Required Cart Item Columns — Conceptual
- id.
- cart_id.
- tenant_id if existing security pattern duplicates tenant ownership.
- menu_item_id.
- quantity.
- unit_price snapshot.
- display/name snapshot where needed.
- created_at/updated_at as appropriate.
- modifier relation/snapshot support.

# 37. Required Order Columns — Conceptual
- id.
- tenant_id.
- branch_id.
- source cart_id when applicable.
- customer capability/session ownership identifier where customer access needs it.
- table_id/table_session_id when applicable.
- status.
- monetary totals required by current persistence.
- currency if schema uses it.
- created_at/updated_at/submitted_at semantics.

# 38. Required Order Item Columns — Conceptual
- id.
- order_id.
- tenant_id if current isolation pattern requires.
- source menu_item_id where useful.
- immutable name snapshot.
- quantity.
- unit price snapshot.
- modifier snapshots/relations.
- line total if stored.
- created_at.

# 39. Constraints — Cart
- quantity > 0 for item rows.
- price >= 0 where product allows zero-priced items.
- tenant/branch foreign relationships valid.
- table belongs to branch where database can enforce through composite/reference strategy or validation function.
- one active cart ownership rule only if product requires exactly one active cart per capability/table context.
- avoid over-constraining if multiple carts per session are legitimate.

# 40. Constraints — Order
- allowed status values only.
- quantity > 0.
- money fields non-negative unless explicit discount representation uses signed values.
- source cart relationship consistency.
- branch/tenant consistency.
- order item parent consistency.
- modifier parent consistency.

# 41. Index Strategy
- cart lookup by ownership + status should be indexed.
- cart item lookup by cart_id should be indexed.
- order lookup by tenant/branch/id should be naturally efficient.
- order lookup by source cart may need unique/index.
- customer-visible order lookup by ownership key may need index.
- avoid duplicate indexes already covered by unique constraints/PKs.
- justify every new index by actual query shape.

# 42. Partial Unique Index Strategy
- If exactly one active cart per customer scope is an invariant, use partial unique index on active status where PostgreSQL permits.
- Do not enforce one active cart globally per table if multiple independent customer parties are possible.
- Choose ownership key carefully.
- R03 must document the selected invariant in code and migration comments/tests.

# 43. Table Session Semantics
- If CustomerContext includes `tableSessionId`, persistence should retain it.
- Closed table session must prevent creation of new mutable cart/order records if R01 validation already treats it revoked.
- Existing historical order may remain readable after table session closes according to product policy.
- Do not delete historical orders when a table session closes.
- Cart lifecycle after session close should fail closed for mutation.

# 44. Menu Item Validity at Persistence Time
- R03 repository must not blindly trust client menu item data.
- Menu item ID must be resolved in current tenant/branch/storefront scope.
- Availability/business validation may be orchestrated in R04, but persistence must never accept arbitrary cross-tenant menu IDs.
- At minimum parent/menu relationship must be validated before insert.
- Snapshot values must come from server data, not client payload.

# 45. Price Source
- Unit price snapshot must be derived server-side.
- Never accept authoritative unit price from browser.
- Client price can be used only for mismatch detection/UX if needed.
- R04 can decide refresh/mismatch behavior.
- R03 persistence API should receive server-derived price structure.

# 46. Modifier Source
- Modifier label/price snapshot must be server-derived.
- Client-provided choice IDs are selectors only.
- Choice IDs must belong to allowed modifier group/menu item relation.
- Cross-menu modifier reuse must fail.
- Inactive/unavailable choices must not be persisted as valid current selection.

# 47. Read-After-Write Contract
- Repository create/update methods should return canonical persisted state when useful.
- Avoid requiring route layer to reconstruct entity from submitted payload.
- Read-after-write should occur in same transaction when needed for consistency.
- Avoid extra unbounded queries.

# 48. Aggregate Loading
- Define one cart aggregate read model.
- Include cart metadata.
- Include items.
- Include modifier selections.
- Include persisted totals/snapshots if stored.
- Query count should be bounded.
- Avoid per-item N+1.

# 49. Order Aggregate Loading
- Define one customer-visible order aggregate if R03 needs retrieval foundation.
- Include order metadata.
- Include item snapshots.
- Include modifier snapshots.
- Exclude internal kitchen/payment/audit details not intended for customer read.
- Keep R04 operational command state separate.

# 50. Public Error Taxonomy
- cart_not_found or safe equivalent.
- cart_conflict.
- cart_closed.
- order_not_found.
- persistence_unavailable.
- invalid_persistence_input.
- scope_violation must map to non-enumerating safe response.
- raw SQL errors must not reach client.
- unique/constraint errors should map deterministically when expected.

# 51. Internal Error Classification
- infrastructure error.
- invariant violation.
- stale/terminal aggregate.
- uniqueness conflict.
- foreign relation invalid.
- authorization/scope denial.
- unknown errors fail closed.
- Logging may include safe entity IDs but never bearer capability secrets.

# 52. Failure Atomicity
- Cart creation + initial items must either fully commit or fully roll back when performed as one operation later.
- Order creation + order items must be atomic.
- Cart conversion markers + order insert must be composable atomically by R04.
- Repository design must not force independent commits.
- No side effects should occur outside transaction in R03.

# 53. Rollback Cases
- item insert fails after cart insert → rollback cart when same operation.
- modifier insert fails after item insert → rollback item/parent operation.
- order item insert fails after order insert → rollback order.
- ownership validation fails → no write.
- scope mismatch → no write.
- DB unavailable before transaction → no partial state.

# 54. Concurrency Boundary
- R03 defines storage behavior but not generic idempotency.
- Concurrent writes to same cart may occur.
- Use row locking/version checks only where needed to prevent invalid storage state.
- Do not build generic request idempotency table in R03.
- R05 owns request-level dedupe framework.
- R03 may introduce optimistic version column only if necessary for later safe mutation and justified by current write model.

# 55. Versioning Decision
- If mutable cart updates need concurrency protection, consider `version` integer or updated_at compare-and-set.
- Do not add both without need.
- Repository API should expose version if optimistic locking is selected.
- Conflict must map to typed persistence conflict.
- R04 can surface refresh/retry UX.

# 56. Soft Delete / Deletion Strategy
- Avoid physical deletion of historical orders.
- Cart item deletion may be physical while cart is mutable if audit requirements do not require item history.
- Cart abandonment should prefer state transition over destructive deletion when later analytics/recovery benefits.
- Do not invent full audit trail in R03.

# 57. Order Event Interaction
- If `order_events` table exists, R03 should inspect it.
- R03 may establish minimal initial event persistence only if order schema requires invariant.
- Rich event/command sequencing belongs R04.
- Do not publish realtime events.
- Do not create kitchen tickets.

# 58. Payment Interaction
- R03 does not create payment records.
- R03 order persistence may include payment_status only if existing schema requires default state.
- Payment provider references remain null/unset.
- No Stripe/Omise API interaction.
- Monetary order totals must be durable enough for future payment integration.

# 59. Kitchen Interaction
- No kitchen ticket creation in R03.
- No station routing.
- No KDS event.
- Order initial state should not imply kitchen acceptance unless current workflow explicitly does.
- R04 or later phase controls transition into operational workflow.

# 60. Realtime Interaction
- No realtime publish/subscription work.
- Persistence layer should not couple to WebSocket/Supabase realtime directly.
- Future event publication should consume committed state.
- Avoid emitting before transaction commit.

# 61. Notification Interaction
- No customer/staff notifications in R03.
- Do not send email/SMS/LINE.
- Persistence should expose IDs/events later orchestration can use after commit.

# 62. API Surface
- R03 does not need broad public mutation endpoints.
- If minimal endpoint is added for persistence integration proof, it must remain narrow and not become final command API.
- Prefer integration tests against server services/repositories over premature route API.
- R04 owns customer command endpoint/server action design.

# 63. Frontend Scope
- Minimal integration only if required to replace client-local persistence assumptions.
- Do not redesign cart UI.
- Do not redesign checkout.
- Do not add voice ordering.
- Do not add payment UI.
- Do not add realtime state.
- Main R03 value is server/database persistence foundation.

# 64. Client State Coexistence
- Existing client cart state may remain as UI cache during transition.
- Server persisted cart becomes canonical once R03 integration activates.
- Do not allow divergence silently.
- If UI integration is deferred to R04, document persistence API and tests clearly.
- Avoid two competing canonical carts.

# 65. Data Serialization
- Server-to-client money representation must be deterministic.
- Avoid BigInt/Decimal serialization ambiguity.
- Convert to documented integer/string/read-model form.
- Dates should use ISO strings at transport boundary.
- Internal repository types may use Date/native DB numeric types as appropriate.

# 66. Generated Database Types
- If migration changes schema, regenerate Kysely/database types using existing script.
- Generated types must match migration.
- Do not hand-edit generated file if repository policy requires generation.
- Type drift must be checked.
- New cart/order columns should appear in generated types.

# 67. Migration Safety
- Forward-only.
- No production destructive data operations.
- Add NOT NULL only with safe default/backfill strategy for existing rows.
- Unique constraints must consider existing fixture/data collisions.
- Backfill must be deterministic.
- Clean reset must succeed.
- Existing seed fixtures must remain valid or be updated deliberately.

# 68. Existing Data Compatibility
- If local seed contains carts/orders, migration must handle them.
- Do not assume tables empty.
- If ownership column becomes required, provide safe fixture/backfill strategy only for non-production baseline where valid.
- Do not fabricate customer ownership for production-like rows.
- If impossible safely, use nullable transition + later tightening only when justified.

# 69. Seed Strategy
- Add deterministic cart/order fixtures only when needed for tests.
- Avoid long-lived demo data unless useful beyond R03.
- Prefer test-local setup for mutation scenarios.
- Never seed bearer capability secrets.
- If capability identifiers are needed, use deterministic test-safe non-secret IDs.

# 70. Database Test File
- Candidate: `supabase/tests/database/p03_r03_cart_order_persistence.test.sql`.
- Test clean role grants.
- Test ownership isolation.
- Test constraints.
- Test cross-tenant denial.
- Test sibling-branch denial.
- Test other-customer denial.
- Test direct public/anon denial.
- Test write role cannot touch unrelated tables.

# 71. Unit Tests
- persistence scope mapping.
- money conversion helpers.
- status parsers/types.
- repository input normalization.
- error mapping.
- optimistic version helper if used.
- no DB required for pure logic.

# 72. Integration Tests
- create cart under valid CustomerContext.
- load cart aggregate.
- add/update/remove persistence primitives.
- wrong customer cannot load cart.
- wrong branch cannot load cart.
- cross tenant cannot load cart.
- create initial order persistence atomically.
- order items persist snapshots.
- failed child insert rolls back parent.
- pooled transaction context does not leak.

# 73. Negative Authorization Matrix
- missing customer context → deny.
- invalid capability context → deny before repository transaction.
- cross-tenant cart ID → deny/not-found.
- sibling-branch cart ID → deny/not-found.
- other-capability cart ID → deny/not-found.
- cross-tenant menu item → cannot persist.
- cross-branch modifier choice → cannot persist.
- anon direct table insert → denied.
- authenticated staff role should not accidentally inherit customer ownership semantics through customer API.

# 74. Constraint Test Matrix
- zero item quantity denied.
- negative item quantity denied.
- invalid status denied.
- invalid parent cart denied.
- invalid order parent denied.
- mismatched tenant child denied where schema supports explicit tenant FK/check.
- duplicate cart conversion denied if invariant selected.
- invalid money scale/value denied where applicable.

# 75. Transaction Test Matrix
- cart + items success commits all.
- child failure rolls all back.
- order + items success commits all.
- order item failure rolls all back.
- context change attempt inside transaction cannot broaden scope.
- subsequent pooled transaction starts without prior customer context.

# 76. Concurrency Test Matrix
- concurrent active-cart creation respects selected uniqueness invariant.
- concurrent item updates do not produce negative/invalid quantity.
- concurrent cart conversion does not create structurally impossible duplicate order if uniqueness constraint is part of R03.
- request idempotency behavior remains explicitly R05.

# 77. Performance Requirements
- cart aggregate load uses bounded query count.
- order aggregate load uses bounded query count.
- item/modifier loading avoids per-item N+1.
- indexes support ownership lookup.
- avoid full-table scans on public customer routes.
- DB functions should be STABLE only when semantics allow.

# 78. Resource Safety
- enforce maximum quantity at application/domain boundary.
- consider max cart item count only if current product requires explicit cap.
- avoid loading unbounded historical orders.
- customer order history pagination is out of scope unless current UI requires it.
- input arrays must be bounded before bulk inserts.

# 79. Security — Least Privilege
- customer runtime only necessary tables/functions.
- no credential tables.
- no membership/role/permission authority.
- no audit table write unless narrowly required and explicitly justified.
- no payment table write.
- no kitchen table write.
- no broad app schema write.

# 80. Security — Secret Handling
- no capability token persistence.
- no cookie/token logging.
- no DB URL logging.
- no raw SQL error leaking.
- no environment secret additions unless unavoidable.
- no client exposure of database credentials.

# 81. Security — Enumeration Resistance
- unauthorized cart/order IDs should map to safe not-found/denied response.
- do not reveal tenant/branch mismatch.
- logs may distinguish internally with safe IDs.
- public response should not reveal another customer's order existence.

# 82. Security — Injection
- Kysely parameterized queries or safe SQL templates only.
- no string-concatenated IDs/status/order clauses from request.
- sort/filter allowlists if any customer history query is added.
- UUID parsing at boundary.

# 83. Security — Mass Assignment
- repository create input must be explicit typed fields.
- do not spread request body into DB insert.
- tenant/branch/ownership/status must be server-controlled.
- prices/totals must be server-derived.
- timestamps server/database controlled.

# 84. Security — Cross-Scope Child Rows
- child row tenant ownership must match parent.
- cart item cannot reference cart in another scope.
- order item cannot reference order in another scope.
- modifiers cannot reference another item parent.
- enforce by FK/composite constraints/query validation where feasible.

# 85. Error Mapping — Unique Violation
- map expected active-cart uniqueness to `CartConflict` or equivalent.
- do not expose PostgreSQL constraint name publicly.
- unexpected unique violation remains infrastructure/invariant failure.
- R04 can decide retry/reuse behavior.

# 86. Error Mapping — Foreign Key Violation
- invalid menu/modifier relation should map safe invalid selection/domain error.
- unexpected parent disappearance may map conflict/unavailable depending on case.
- raw DB detail is internal only.

# 87. Error Mapping — Serialization/Deadlock
- R03 documents retry eligibility but does not implement generic retry loop unless repository infrastructure already has it.
- R05 owns generic request-level retry/idempotency.
- Never blindly retry a non-idempotent multi-write operation outside transaction semantics.

# 88. Observability
- log operation class, not sensitive payload.
- include safe request correlation ID when existing logging supports it.
- include cart/order ID after creation when safe.
- include tenant/branch IDs only in server logs according to current privacy policy.
- do not log capability bearer/token.
- distinguish expected conflict from infrastructure error.

# 89. Audit
- R03 does not need full audit event system.
- If existing order creation audit hook is mandatory, preserve it only through transaction-safe mechanism.
- Do not introduce audit side effect that commits independently before order transaction.
- R04 can orchestrate post-commit audit/notifications where appropriate.

# 90. Cart Read Model
- id.
- status.
- items.
- quantity.
- server-derived money snapshots.
- table display context if safe.
- created/updated timestamps.
- no tenant secret/internal permission fields.

# 91. Cart Item Read Model
- cartItemId.
- menuItemId.
- displayName snapshot/current chosen strategy.
- quantity.
- unitPrice.
- modifiers.
- lineSubtotal.
- avoid internal DB column leakage.

# 92. Order Read Model
- orderId.
- status.
- items.
- totals.
- table context safe for customer display.
- submitted/created timestamp.
- no staff actor IDs unless product explicitly exposes them later.
- no internal payment provider metadata.

# 93. Repository Input Types
- CreateCartInput should omit tenant/branch/customer owner fields because context supplies them.
- PersistCartItemInput should include menu selection identifiers and server-derived pricing snapshot.
- CreateOrderPersistenceInput should omit arbitrary ownership fields.
- Use readonly types where practical.

# 94. Repository Output Types
- Return domain/read model.
- Do not return mutable transaction-bound row objects.
- Normalize Decimal/numeric values.
- Normalize nullable fields.
- Keep naming camelCase in TS.

# 95. Table Session Closure Race
- Capability validation and persistence may race with table-session closure.
- R03 transaction must revalidate required active scope at write boundary when necessary.
- Do not rely solely on capability validation performed seconds earlier.
- DB function/RLS should fail closed if table session is no longer valid.
- Test closure between request entry and write when feasible.

# 96. Branch Deactivation Race
- If branch can deactivate, write must fail when current database scope no longer authorizes operation.
- Customer capability validity should already reflect this through R01/R02 functions.
- R03 must not cache branch-active authority in browser state.

# 97. Menu Availability Race
- Menu availability may change between UI load and persistence.
- R03 storage must not trust stale browser availability.
- Full UX resolution belongs R04.
- Repository should be capable of returning stale/invalid selection conflict.

# 98. Price Change Race
- Server should re-read/resolve authoritative price at mutation orchestration time.
- R03 persistence accepts server-derived snapshot.
- Client mismatch may cause R04 refresh/confirm behavior.
- R03 must not silently persist client price.

# 99. Cart Expiry/Abandonment
- If current product requires expiry, persist explicit last activity/expiry semantics.
- Do not add background cleanup job in R03 unless existing infrastructure already expects it.
- Abandoned carts may remain for later cleanup/analytics.
- Terminal/expired cart must reject mutation.

# 100. Historical Order Immutability
- Customer should not be able to mutate submitted order item snapshots arbitrarily.
- R03 repository should separate mutable pre-submit persistence from submitted historical data.
- R04 determines exact submission transition.
- After terminal submit state, R03 low-level methods should still prevent unrestricted rewrite where possible.

# 101. Staff Access Interaction
- Staff/internal operations may later read orders through different repositories/permissions.
- R03 customer repository must not become universal staff repository by default.
- Shared domain mapping is acceptable.
- Authorization boundary remains distinct.
- Phase 04 staff operations can extend safely later.

# 102. Migration — Grants
- enumerate exact grants before/after.
- revoke broad inherited grants if found and owned by R03 scope.
- grant only required select/insert/update/delete or execute.
- preserve NOLOGIN/NOBYPASSRLS role properties.
- document any role membership used in local tests.

# 103. Migration — RLS Policies
- policy names deterministic.
- `USING` for read/update/delete scope.
- `WITH CHECK` for insert/update ownership.
- customer ownership predicate must include tenant/branch and capability/session key as required.
- policies should not call volatile unsafe functions.
- test with forced RLS.

# 104. Migration — Functions
- only add helper functions when they centralize critical invariants.
- fixed search_path.
- stable/volatile classification correct.
- strict null behavior when useful.
- revoke public execute.
- no dynamic SQL unless unavoidable.

# 105. Migration — Backfill
- explicit order.
- deterministic values.
- avoid broad table rewrite if unnecessary.
- add nullable column → backfill → validate → set NOT NULL when needed.
- test reset from zero.
- test migration with seed data.

# 106. Migration — Rollback Philosophy
- repository uses forward-only migrations.
- do not author destructive down migration unless current policy requires it.
- recovery from bad migration is new forward migration.
- PR must explain any data rewrite.

# 107. Generated Type Impact
- list changed generated types in PR.
- generated drift must be zero after generation.
- no manual casting around missing types merely to avoid generation.
- if no schema change, generated types should not change.

# 108. Existing Tests to Preserve
- P03/R01 customer capability tests.
- P03/R02 customer data-access tests.
- P02 identity/authz regression tests.
- RLS/database baseline tests.
- storefront/menu read behavior.
- public customer entry.

# 109. Integration Test Fixture Strategy
- Use deterministic tenant A/branch/table/customer capability fixtures.
- Add second customer capability under same branch for ownership-denial test.
- Add sibling branch context.
- Add second tenant context.
- Add menu item/modifier fixtures only when not already present.
- Do not depend on random production-like data.

# 110. Test — Customer A vs Customer B
- Customer A creates cart.
- Customer B same branch cannot read by cart ID.
- Customer B cannot update item.
- Customer B cannot convert/create order from A cart.
- Error does not reveal ownership details.

# 111. Test — Same Tenant Wrong Branch
- capability branch A1.
- cart/order in A2.
- read denied.
- write denied.
- no returned data.
- no partial mutation.

# 112. Test — Cross Tenant
- Tenant A capability.
- Tenant B cart/order.
- read denied.
- write denied.
- public response non-enumerating.
- DB negative test confirms RLS.

# 113. Test — Capability Revoked
- create cart under valid capability.
- revoke/close underlying capability scope.
- later mutation denied.
- historical persisted row remains consistent.
- no new order created.

# 114. Test — Table Session Closed
- cart existing.
- table session closes.
- new mutation fails when current business rule requires active table session.
- existing order history remains durable.

# 115. Test — Price Snapshot
- initial menu price P1.
- server persists snapshot P1.
- menu changes to P2 afterward.
- historical persisted order/cart snapshot behavior follows documented strategy.
- order historical display should not unexpectedly change after submit.

# 116. Test — Modifier Snapshot
- persist selected modifier.
- later modifier label/price changes.
- historical order retains ordering-time snapshot if schema strategy requires.
- mutable cart behavior documented separately.

# 117. Test — Atomic Order Insert
- begin transaction.
- create order.
- insert first item.
- force second item invalid.
- transaction rollback.
- no order remains.
- no first item remains.

# 118. Test — Context Leakage
- transaction A uses tenant/branch/customer A.
- transaction completes.
- transaction B uses tenant/branch/customer B.
- B cannot observe A state.
- unset context outside transaction does not retain A values.

# 119. Test — Role Leakage
- customer transaction sets customer runtime role locally.
- transaction completes.
- next generic DB session is not stuck in customer role.
- staff transaction remains staff role when explicitly used.

# 120. Test — Direct Grants
- anon direct insert carts denied.
- authenticated direct insert carts denied unless explicitly approved role path.
- customer entry role cannot write carts if separate from customer runtime.
- customer runtime cannot write app.roles/memberships.
- customer runtime cannot write payments.
- customer runtime cannot write kitchen tables.

# 121. Unit Test — Scope Mapper
- correct tenant.
- correct branch.
- correct table.
- correct capability ownership.
- missing required field fails.
- raw override not accepted.

# 122. Unit Test — Money
- integer/minor-unit conversion exact.
- decimals rejected/normalized according to strategy.
- no floating-point rounding drift in canonical helpers.
- negative invalid values rejected.

# 123. Unit Test — Status
- allowed statuses accepted.
- unknown rejected.
- terminal detection correct.
- serialization stable.

# 124. Validation Commands — Application
Implementation should run actual existing commands such as:
```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build:next
```
- Use commands only if present at implementation time.
- Record actual results truthfully.

# 125. Validation Commands — Database
Where repository scripts support them:
```bash
supabase start
supabase db reset
supabase test db
npm run db:generate
npm run db:verify-types
```
- Exact commands must follow current package/workflow scripts.
- Do not fabricate PASS.

# 126. CI Context Expectation
- Phase/Round Gate where applicable.
- Repository Integrity.
- Dependency Integrity if package files change.
- Next Flow Quality.
- Supabase Database Quality for migration/DB changes.
- Vercel may provide deployment evidence.
- Document validation remains separate from CI.

# 127. Definition of Done — Database
- schema supports durable cart/order persistence.
- ownership columns/invariants explicit.
- constraints valid.
- indexes justified.
- RLS denies cross-scope access.
- least-privilege role/grants correct.
- migration clean reset works.
- generated types synchronized.

# 128. Definition of Done — Cart
- create/load persistence works.
- items persist.
- modifiers persist.
- scope enforced.
- invalid quantity denied.
- terminal cart behavior explicit.
- no browser authority for ownership/price.

# 129. Definition of Done — Order
- initial durable order persistence works.
- item snapshots persist.
- modifier snapshots persist.
- ownership enforced.
- atomic insert works.
- invalid partial order cannot persist.
- no kitchen/payment side effects.

# 130. Definition of Done — Repository Architecture
- transaction-bound repositories.
- one factory/composition path.
- no direct route DB access for new persistence.
- no raw tenant/branch parameters.
- typed errors.
- typed read/write models.
- R04 can compose them in one transaction.

# 131. Definition of Done — Security
- least privilege.
- customer/staff boundary preserved.
- cross-tenant denied.
- wrong branch denied.
- other-customer denied.
- no bearer token persistence/logging.
- no broad table grants.
- no raw SQL error leak.

# 132. Definition of Done — Failure Safety
- child insert rollback proven.
- order rollback proven.
- scope failure no write.
- context leakage absent.
- terminal conflict typed.
- DB unavailable maps safely.

# 133. Explicit Prohibitions
- do not implement final command endpoints.
- do not implement generic idempotency keys/table.
- do not create kitchen tickets.
- do not create payment records.
- do not publish realtime events.
- do not send notifications.
- do not redesign staff authorization.
- do not weaken RLS.
- do not accept client tenant/branch authority.
- do not accept client price as canonical.
- do not store customer bearer token.
- do not rewrite historical migrations.
- do not perform production destructive DB operations.
- do not merge implementation PR.

# 134. Files Explicitly Not to Touch Without Proven Need
- Auth.js configuration.
- internal identity/permission modules.
- workspace selector.
- payment provider integrations.
- kitchen/KDS runtime.
- realtime infrastructure.
- voice ordering modules.
- unrelated marketing/representation web.
- CI workflows unless path classification genuinely must include new DB tests and current policy allows minimal change.

# 135. PR Requirements
- identify P03/R03.
- reference exact spec from main.
- record implementation parent branch `p03-r02-customer-data-access` or latest legitimate R02 tip.
- record parent SHA.
- record head SHA.
- list migration/schema changes.
- list generated type impact.
- list grant/RLS impact.
- list cart/order repository files.
- record actual tests.
- record DB reset/test results.
- record negative authorization evidence.
- record rollback evidence.
- record deferred R04/R05 work.
- remain owner-controlled.

# 136. Required Scope Declaration
```text
PHASE: P03
ROUND: R03
DURABLE_CART_PERSISTENCE_IMPLEMENTED: YES
DURABLE_ORDER_PERSISTENCE_FOUNDATION_IMPLEMENTED: YES
CUSTOMER_SCOPE_OWNERSHIP_ENFORCED: YES
TRANSACTION_BOUND_REPOSITORIES_IMPLEMENTED: YES
COMMAND_ORCHESTRATION_IMPLEMENTED: NO
GENERIC_IDEMPOTENCY_IMPLEMENTED: NO
KITCHEN_EXECUTION_IMPLEMENTED: NO
PAYMENT_EXECUTION_IMPLEMENTED: NO
REALTIME_IMPLEMENTED: NO
PRODUCTION_DB_DESTRUCTIVE_CHANGE: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 137. Implementation Order — Audit
1. re-read current main spec/policy.
2. identify latest R02 branch/head.
3. inspect actual schema.
4. inspect R02 customer data transaction/repositories.
5. inspect existing cart/order tables and policies.
6. decide minimal schema delta.
7. decide ownership key strategy.
8. decide cart status/active uniqueness strategy.
9. decide order snapshot strategy.

# 138. Implementation Order — Database
1. write forward migration.
2. add/adjust ownership columns.
3. add constraints.
4. add indexes.
5. add/adjust grants/role.
6. add RLS/functions.
7. update seed/test fixtures if required.
8. regenerate DB types.
9. run DB tests/reset.

# 139. Implementation Order — Server
1. add persistence domain types.
2. add cart repository.
3. add order repository.
4. extend repository factory.
5. add persistence error mapping.
6. add aggregate mapping.
7. add narrow service helper only if needed.
8. avoid route orchestration.

# 140. Implementation Order — Tests
1. unit pure contracts.
2. DB constraints/grants/RLS.
3. integration cart.
4. integration order atomicity.
5. cross-scope negative tests.
6. rollback tests.
7. context leakage tests.
8. inherited R01/R02 regressions.
9. build/type/lint.

# 141. Existing Equivalent Module Rule
- if R02 already introduced cart/order repository unexpectedly, extend it.
- do not duplicate abstraction.
- compare behavior to this spec.
- preserve working interfaces where safe.
- report fundamental conflicts.

# 142. Existing Schema Conflict Rule
- if current schema cannot satisfy ownership without destructive rewrite, stop and document exact blocker.
- prefer additive forward migration.
- do not drop historical order data.
- do not rename/drop columns broadly merely for cleanliness.

# 143. Customer Ownership Key Decision
Implementation must explicitly document one of:
- capability_id ownership.
- table_session/customer_session durable ID.
- dedicated customer session row introduced by R01/R03 if already established.
- another current canonical identifier.
The chosen key must be non-secret and stable enough for persistence authorization.

# 144. One Active Cart Decision
- decide whether invariant is per customer capability, per table session + capability, or not enforced.
- do not guess from UI.
- inspect product behavior/tests.
- document index/constraint decision.
- R04 must inherit this exact rule.

# 145. Cart Status Minimum
Suggested conceptual states only:
- ACTIVE.
- CONVERTED.
- ABANDONED/EXPIRED if current product requires.
Do not introduce unnecessary status explosion.

# 146. Order Status Minimum
Use current existing order status vocabulary if present.
- R03 should not redesign operational status model.
- Ensure initial persisted state is legal.
- Future staff/kitchen transitions remain later scope.

# 147. Order Number / Display Identifier
- If current schema has human-readable order number, preserve it.
- Generation must be server/database controlled.
- Avoid global sequential public identifier if privacy/enumeration risk exists.
- If only UUID exists today, do not invent order-number subsystem unless required by current UI.

# 148. Time Semantics
- use timestamptz.
- database/server authoritative timestamps.
- avoid client-created_at.
- submitted_at only when actual submit occurs in R04 unless persistence requires initial timestamp distinction.
- updated_at behavior deterministic.

# 149. Cart Totals Strategy
- decide whether totals are stored or computed.
- avoid duplicated derived totals unless necessary.
- if stored, ensure transaction updates atomically with items.
- R04 pricing validation may recompute before submit.
- historical order totals should be durable.

# 150. Order Totals Strategy
- order subtotal/total must be reproducible.
- store authoritative snapshot totals if current schema supports.
- do not add tax/service/discount engine beyond current requirements.
- invariant: total matches persisted line snapshot formula according to current pricing model.

# 151. Modifier Pricing Strategy
- persisted order modifier price snapshot required if modifier affects historical total.
- cart may store snapshot or resolve current; choose explicitly.
- client modifier price never authoritative.

# 152. Menu Deletion Behavior
- historical order must survive menu item deletion/deactivation.
- foreign key delete action should not cascade-delete historical order item.
- use restrict/set null with snapshot according to current schema.
- cart behavior on deleted item should become invalid/stale, handled R04.

# 153. Cart Item Merge Behavior
- Whether adding same menu item/modifier set merges quantity is command behavior.
- R03 persistence need only support deterministic rows.
- Do not encode merge semantics prematurely unless existing schema constraint already requires it.

# 154. Order Immutability Boundary
- Define which columns can be updated after creation.
- Customer runtime must not freely rewrite ownership/snapshots/status.
- R04 orchestrator may receive narrow methods/functions.
- Staff operations later may have separate authority.

# 155. Customer Read Access to Orders
- If customer confirmation page requires order read, repository may expose safe scoped read.
- No cross-customer history.
- No internal staff notes.
- No payment secrets.
- No kitchen internals.

# 156. Customer Read Access to Cart
- active owned cart only unless terminal confirmation requires converted cart.
- cart ID selector revalidated.
- no list-all-carts endpoint.
- no tenant-wide cart browse.

# 157. Direct DB Client Prohibition
- new customer cart/order route/service code must not call global DB client directly.
- must use customer transaction + repository composition.
- tests should scan or structurally assert intended authority path when practical.

# 158. Route Boundary Test
- If no R03 public mutation route is created, test should confirm persistence services are server-only.
- If route exists for minimal integration, it must validate CustomerContext before transaction.
- request body tenant/branch fields ignored/rejected.
- no GET mutation.

# 159. Cookie Boundary
- Customer capability cookie remains R01 transport.
- R03 does not create a second cart auth cookie unless product absolutely requires cart selector persistence.
- Cart ID cookie, if used, is selector only and must be scoped/revalidated.
- Avoid storing cart state in large cookie.

# 160. Cart Selector Transport
- URL/cookie/local state cart ID is non-authoritative.
- server loads only under current CustomerContext.
- invalid selector may result in fresh cart/recovery according to R04 UX.
- do not expose ownership distinction.

# 161. Database Context Mapping
- customer transaction must set tenant/branch/customer ownership context transaction-locally if R02 architecture uses settings.
- cart/order RLS reads those trusted settings.
- no session-global SET.
- pool leakage tests mandatory.

# 162. Role Separation Test
- `flow_customer_entry` stays entry-resolution only if R01 established it.
- `flow_customer_runtime` or R02 equivalent handles customer domain data.
- entry role should not gain cart/order writes.
- staff `flow_runtime` remains distinct.

# 163. RLS Function Naming
- reuse existing helper naming style.
- avoid one-off copy/pasted predicates across many tables if stable helper can centralize ownership safely.
- helper must not broaden scope accidentally.
- test null context denial.

# 164. Null Context Behavior
- missing tenant setting → deny.
- missing branch setting → deny branch-scoped writes.
- missing customer ownership setting → deny customer-owned rows.
- malformed UUID context → fail safely.
- no fallback to unrestricted access.

# 165. Fixture Cleanup
- integration tests should rollback/delete fixtures deterministically.
- unique fixture IDs/names avoid collisions.
- test order should not matter.
- DB reset remains clean.

# 166. Dependency Changes
- no new npm dependency expected by default.
- use current Kysely/Postgres stack.
- new library requires explicit justification.
- avoid ORM churn.

# 167. Environment Changes
- none expected by default.
- do not add cart/order secrets.
- no payment secrets.
- no new Auth.js env.
- DB role exists through migration, not env credential.

# 168. Workflow Changes
- only if current path classifier misses new required integration/DB files.
- minimal scope.
- do not alter required checks to force green.
- document why any workflow path change is necessary.

# 169. Build Impact
- server-only modules must not leak into client bundle.
- imports from repository files only in server components/actions/routes/services.
- use `server-only` marker consistently.
- no Node-only DB module imported by client components.

# 170. TypeScript Strictness
- no broad `any` for DB/domain models.
- map DB rows explicitly.
- exhaustive status parsing.
- readonly public models where useful.
- no unsafe casts around nullable ownership.

# 171. SQL Style
- use migration conventions.
- schema qualify tables/functions.
- fixed search path for SECURITY DEFINER.
- deterministic constraint names where helpful.
- comments on security-critical functions/policies.

# 172. Definition of Done — Tests
- unit tests added.
- integration persistence tests added.
- DB SQL tests added.
- negative authorization matrix covered.
- rollback matrix covered.
- context leakage covered.
- inherited tests remain green.
- build/type/lint green when executed.

# 173. Definition of Done — Handoff
- R04 can create a customer command service without direct SQL.
- R04 can open one customer transaction and compose repositories.
- R04 can load authoritative menu/cart state.
- R04 can persist cart mutations/order atomically.
- R04 receives typed persistence conflicts.
- R04 does not need to decide tenant/branch ownership again.

# 174. R04 Ownership
- command endpoint/server action shape.
- add/update/remove cart command orchestration.
- submit-order command.
- server-side menu/price/availability validation sequence.
- cart-to-order atomic orchestration.
- side-effect ordering after commit.
- safe customer-facing command errors.
- R03 must not implement these prematurely.

# 175. R05 Ownership
- request idempotency keys.
- duplicate submit dedupe.
- retry persistence/result replay.
- generic concurrency/request replay protections.
- R03 may provide DB uniqueness primitives but not generic request-idempotency framework.

# 176. R06 Ownership
- end-to-end acceptance.
- capability → data access → persistence → commands → idempotency proof.
- regression/security acceptance.
- next phase handoff.

# 177. R04 Handoff — Cart
- cart repository stable.
- ownership enforced.
- aggregate loading stable.
- write primitives transaction-bound.
- terminal state checks available.
- persistence conflict typed.

# 178. R04 Handoff — Order
- order repository stable.
- snapshot model stable.
- atomic create primitive available.
- one-cart-one-order constraint documented if used.
- initial legal state defined.
- no kitchen/payment side effects.

# 179. R04 Handoff — Database
- customer runtime grants finalized for R03.
- RLS protects cart/order rows.
- transaction context tested.
- generated types current.
- migration/seed clean.
- no production destructive operation.

# 180. R04 Handoff — Security
- browser cannot forge tenant/branch/customer ownership.
- client prices not authoritative.
- other-customer access denied.
- cross-tenant/branch denied.
- token not persisted/logged.
- staff/customer roles separated.

# 181. Implementation Evidence Required in PR
- exact migration filename.
- schema delta summary.
- ownership key choice.
- active-cart invariant choice.
- order snapshot choice.
- cart/order repository paths.
- role/grant changes.
- RLS policy/function changes.
- generated type result.
- DB reset/test result.
- negative auth result.
- rollback result.
- concurrency result where applicable.

# 182. Validation Vocabulary
Use only:
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- no fabricated PASS.
- document validation is separate.

# 183. Stop Conditions
- latest R02 lineage cannot be identified.
- actual schema differs so materially that this persistence boundary is invalid.
- safe ownership cannot be represented without destructive rewrite.
- customer runtime would require broad privileged role.
- implementation requires production destructive mutation.
- R01/R02 trust/data-access boundaries would need weakening.
- in those cases stop and report exact blocker.

# 184. Document Validation Checklist
- [x] Phase 03 / Round 03.
- [x] Previous R02.
- [x] Next R04.
- [x] Status READY.
- [x] main authority.
- [x] R02 actual branch evidence recorded.
- [x] cart persistence scope explicit.
- [x] order persistence scope explicit.
- [x] ownership invariants explicit.
- [x] file responsibilities explicit.
- [x] DB/grant/RLS strategy explicit.
- [x] transaction/rollback explicit.
- [x] negative security tests explicit.
- [x] concurrency boundary explicit.
- [x] R04/R05 scope separation explicit.
- [x] implementation merge owner-controlled.

# 185. Document Internal Consistency
- R03 owns persistence, not command orchestration.
- R03 owns storage constraints, not generic idempotency.
- CustomerContext remains authority input.
- R02 transaction/repository architecture is reused.
- No section grants browser tenant/branch authority.
- No section introduces payment/kitchen/realtime work.
- Order snapshots are historical data, not live menu references only.
- R04 handoff is composable and atomic.

# 186. Existing Table Audit — carts
- confirm current columns exactly.
- confirm PK type.
- confirm tenant_id nullability.
- confirm branch_id nullability.
- confirm table_session relationship.
- confirm status type/check.
- confirm timestamps.
- confirm current RLS policy names.
- confirm current grants to customer runtime, flow_runtime, anon, authenticated.
- confirm existing indexes.
- confirm current seed/test usage.

# 187. Existing Table Audit — cart_items
- confirm parent FK delete behavior.
- confirm tenant duplication strategy.
- confirm menu_item FK behavior.
- confirm quantity constraint.
- confirm price columns and units.
- confirm snapshot fields.
- confirm modifier child model.
- confirm RLS inherited-via-parent or direct.
- confirm indexes.

# 188. Existing Table Audit — orders
- confirm status values and initial state.
- confirm source cart relation.
- confirm table/table-session relation.
- confirm total/subtotal fields.
- confirm currency representation.
- confirm customer ownership field availability.
- confirm current RLS/grants.
- confirm order number/display ID semantics.
- confirm kitchen/payment downstream FKs.

# 189. Existing Table Audit — order_items
- confirm menu item reference delete behavior.
- confirm snapshot name columns.
- confirm quantity constraint.
- confirm price snapshot columns.
- confirm modifier relation/snapshot support.
- confirm tenant duplication strategy.
- confirm current RLS and indexes.

# 190. Existing Table Audit — table_sessions
- confirm active/closed lifecycle representation.
- confirm branch/table ownership FKs.
- confirm customer capability relation if any.
- confirm whether historical closed session rows remain.
- confirm mutation eligibility predicate available to R03.

# 191. Ownership Migration Path A — Existing ownership already sufficient
- no new ownership columns.
- reuse current capability/session key.
- tighten RLS if needed.
- add missing indexes/constraints only.
- update repositories/types.
- prefer this path when actual schema supports it.

# 192. Ownership Migration Path B — Ownership column missing but safe additive migration
- add nullable ownership column.
- backfill deterministic test/local rows only where evidence exists.
- update insert path to always write ownership.
- validate no new null rows.
- set NOT NULL only when all current legitimate data is safely attributable.
- otherwise keep nullable with policy that denies null rows to customer runtime until later controlled migration.

# 193. Ownership Migration Path C — Existing ownership conflicts with capability lifecycle
- do not overwrite historical ownership blindly.
- introduce stable non-secret owner key alongside legacy field if required.
- document relationship and future cleanup.
- preserve historical order readability.
- stop if migration would invent false customer identity for real rows.

# 194. Snapshot Rule — Mutable Cart
- choose current-live vs persisted price behavior explicitly.
- if persisted snapshot, define refresh behavior expectation for R04.
- if live price, repository aggregate must fetch current authoritative price and identify stale menu rows.
- never mix strategies silently per item.

# 195. Snapshot Rule — Historical Order
- order name snapshot immutable.
- unit price snapshot immutable.
- modifier label/price snapshot immutable when relevant.
- mutable menu edits never rewrite existing order history.
- FK deletion must not cascade historical rows.

# 196. Locking Decision Matrix
- cart creation conflict: uniqueness constraint preferred over application pre-check race.
- cart item update: optimistic version or row lock only if needed.
- conversion to order: row lock/unique source-cart constraint considered.
- menu reads: no unnecessary FOR UPDATE.
- order history reads: no locking.
- choose minimum locking needed to preserve invariant.

# 197. Row Locking Rules
- acquire lock only within active customer transaction.
- lock cart parent before terminal/conversion write when conversion invariant requires it.
- use deterministic lock order if multiple rows must lock.
- do not hold locks across network calls or external side effects.
- R03 introduces no external side effects, enabling short transactions.

# 198. Optimistic Version Contract
- if version selected, start deterministic integer value.
- update uses expected version predicate.
- successful mutation increments exactly once.
- zero-row update maps to typed conflict.
- client cannot choose arbitrary resulting version.
- R04 may ask client to refresh on conflict.

# 199. One-Cart-One-Order Constraint
- if hard invariant, unique index/constraint on `source_cart_id` where non-null.
- duplicate conversion then fails deterministically in DB.
- R04 maps conflict to already-submitted/reload semantics.
- R05 later adds request-level result replay, not duplicate structural order creation.

# 200. Customer Runtime Policy Helper Contract
- helper must derive tenant from transaction-local trusted context.
- helper must derive branch from transaction-local trusted context.
- helper must derive customer owner key from transaction-local trusted context or explicit server-set value.
- null/malformed settings fail closed.
- helper must not read browser request fields.
- helper should be SECURITY DEFINER only if necessary and fixed-search-path if so.

# 201. Cart RLS Predicate Contract
Conceptual read predicate:
```text
row.tenant_id = current_customer_tenant
AND row.branch_id = current_customer_branch
AND row.customer_owner_key = current_customer_owner
```
- exact helper/column names follow current implementation.
- terminal rows may remain readable if confirmation UX requires.
- write check must also enforce current active customer scope.

# 202. Order RLS Predicate Contract
Conceptual customer read predicate:
```text
row.tenant_id = current_customer_tenant
AND row.branch_id = current_customer_branch
AND row.customer_owner_key = current_customer_owner
```
- customer update should be far narrower than read.
- direct arbitrary order update should normally be denied.
- creation should happen through controlled repository/function path.

# 203. Child RLS Contract
- cart item visibility follows owned cart parent.
- order item visibility follows owned order parent.
- if child has tenant_id, it must also equal trusted tenant.
- avoid relying on caller-provided child tenant IDs.
- parent EXISTS predicates must be indexed efficiently.

# 204. Write Function Alternative
- if direct table grants make customer runtime too broad, use narrow functions.
- function accepts domain selectors, not tenant authority.
- function reads current transaction context.
- function validates parent ownership.
- function returns safe persisted row/result.
- function fixed search_path and tightly granted.
- repository remains caller abstraction.

# 205. Price Snapshot Function Rule
- server code may resolve price before repository insert.
- database should still constrain numeric shape.
- avoid duplicating full pricing engine inside SQL unless already canonical there.
- R03 does not create split-brain pricing authorities.

# 206. Cart Aggregate Query Contract
- bounded query count target: constant relative to number of items where practical.
- one cart metadata query plus batched item/modifier query acceptable.
- avoid one modifier query per item.
- deterministic item ordering for UI stability.
- include only fields needed by customer flow.

# 207. Order Aggregate Query Contract
- stable order/item ordering.
- historical snapshot values preferred.
- no joins that substitute current mutable menu labels for snapshot fields.
- exclude privileged operational relations.
- bound relation load count.

# 208. Failure Matrix — Cart create
- invalid capability context → no transaction/write.
- expired/revoked context → no write.
- branch closed → no write.
- active-cart uniqueness conflict → typed conflict/reuse decision deferred R04.
- DB unavailable → safe unavailable error.
- insert succeeds but follow-up fails in same operation → rollback.

# 209. Failure Matrix — Cart item add
- unknown item → invalid selection.
- cross-tenant item → invalid selection/non-enumerating.
- unavailable item → stale/invalid selection.
- invalid modifier → invalid selection.
- terminal cart → conflict.
- ownership mismatch → not-found/denied.
- DB constraint failure → typed domain/infrastructure mapping.

# 210. Failure Matrix — Cart item update/remove
- missing item → not-found.
- ownership mismatch → not-found.
- stale version → conflict if versioning selected.
- terminal cart → conflict.
- zero/negative quantity → validation error.
- concurrent conversion → conflict/fail closed.

# 211. Failure Matrix — Order persistence
- empty cart/order where forbidden → validation/invariant failure.
- invalid snapshot input → validation failure.
- child insert failure → rollback all.
- duplicate source-cart conversion → typed conflict.
- context revoked before commit → fail closed through revalidation/RLS.
- database unavailable → no partial order.

# 212. Recovery Matrix
- user can refresh cart after typed conflict.
- stale menu data can be reloaded by R04.
- expired capability requires re-entry/rescan via R01 flow.
- DB unavailable returns retry-safe UI error without claiming success.
- duplicate structural conversion can reload existing order when R04/R05 implement result semantics.

# 213. Persistence Observability Evidence
Implementation PR should record:
- cart create operation logging behavior.
- order create operation logging behavior.
- no token logging proof/source inspection.
- typed conflict logging class.
- infrastructure error class.
- correlation/request ID behavior if available.
- no raw request body logging requirement.

# 214. Schema Diff Evidence
PR must list for each altered table:
- added columns.
- removed columns, expected none by default.
- altered nullability.
- altered defaults.
- constraints added/changed.
- indexes added/changed.
- policies added/changed.
- grants added/revoked.
- backfill performed.

# 215. Repository API Evidence
PR must list exact methods added to CartRepository and OrderRepository.
For each method record:
- trusted context source.
- input selectors.
- output model.
- transaction requirement.
- expected typed errors.
- whether row locking/version check occurs.

# 216. R04 Command Contract — Add Cart Item
R04 should be able to:
1. validate current CustomerContext.
2. open one customer transaction.
3. load authoritative menu selection through R02 repository.
4. load/create owned active cart through R03 repository.
5. validate availability/pricing.
6. persist item/modifiers through R03 repository.
7. commit.
8. return canonical cart aggregate.
R03 must make this possible without direct SQL.

# 217. R04 Command Contract — Update Cart Item
R04 should be able to:
1. validate context.
2. open transaction.
3. load owned cart/item.
4. reject terminal/stale state.
5. apply validated quantity/modifier change.
6. persist atomically.
7. return canonical aggregate.

# 218. R04 Command Contract — Remove Cart Item
R04 should be able to:
1. validate context.
2. open transaction.
3. load owned cart/item.
4. reject terminal cart.
5. remove item.
6. update/recompute stored totals if R03 strategy stores them.
7. return canonical aggregate.

# 219. R04 Command Contract — Submit Order
R04 should be able to:
1. validate context again at command time.
2. open one transaction.
3. lock/load owned active cart when needed.
4. load authoritative menu/price/availability state.
5. validate all cart lines.
6. create order with immutable snapshots.
7. create order items/modifier snapshots.
8. mark source cart converted/terminal.
9. commit atomically.
10. perform only post-commit side-effect handoff later.
R03 must provide all persistence primitives for steps 3, 6, 7, 8.

# 220. R05 Future Compatibility
- R03 source-cart unique constraint supports structural duplicate prevention.
- R03 typed conflicts give R05 deterministic result classes.
- R03 repository methods must not generate request-idempotency keys internally.
- R03 must not persist arbitrary request IDs unless already required by current schema.
- R05 can layer idempotency without replacing cart/order repositories.

# 221. Phase 04 Future Compatibility
- internal staff order repositories may later differ from customer repositories.
- order schema must support staff/kitchen lifecycle extensions without customer authority broadening.
- avoid customer-owner column being the only internal order authorization model.
- tenant/branch remain common platform ownership.

# 222. Database Acceptance — Clean Bootstrap
- fresh database can apply all historical + new R03 migration.
- seed succeeds.
- R01/R02 DB functions/roles still exist.
- R03 grants/policies install deterministically.
- pgTAP/database tests pass when executed.
- generated types match final schema.

# 223. Database Acceptance — Least Privilege
- entry role cannot mutate carts/orders.
- customer runtime can only required cart/order/menu read/write surface.
- customer runtime cannot read credentials.
- customer runtime cannot mutate roles/memberships.
- customer runtime cannot mutate payment/kitchen tables.
- anon/authenticated broad direct writes remain denied.

# 224. Database Acceptance — Ownership
- own cart allow.
- own order allow where customer read is required.
- same branch other customer deny.
- sibling branch deny.
- cross tenant deny.
- null owner context deny.
- malformed/missing transaction context deny.

# 225. Database Acceptance — Integrity
- invalid quantity denied.
- invalid status denied.
- invalid FK relationships denied.
- source-cart duplicate conversion denied when chosen.
- orphan child rows impossible.
- historical order items survive menu deactivation/deletion strategy.

# 226. Server Acceptance — Architecture
- no duplicate transaction helper.
- repository factory extended.
- no route-local Kysely writes.
- server-only imports preserved.
- typed models and errors.
- no tenant/branch override parameters in repository methods.

# 227. Server Acceptance — Persistence
- create/load cart works.
- item persistence works.
- modifier persistence works.
- order persistence works.
- order snapshot mapping works.
- aggregate reads deterministic.
- rollback tests prove atomicity.

# 228. Security Acceptance — Logging
- bearer token absent from logs.
- cookie contents absent from logs.
- DB credentials absent from logs.
- public error excludes SQL details.
- ownership mismatch not exposed publicly.

# 229. Performance Acceptance
- cart aggregate query plan/index use inspected for primary lookup.
- order lookup indexed by ownership/id.
- no obvious N+1.
- bulk item insert bounded by validated item count.
- no unbounded customer history query added.

# 230. Final Document Line-Quality Rule
- Every section above must guide implementation, validation, security, migration safety, or handoff.
- Do not add blank padding.
- Do not duplicate generic theory.
- If implementation evidence changes before work begins, follow current main + actual parent branch rather than stale authoring assumptions.

# 231. Document-Only Validation Policy
- Validate metadata, sequence, actual repository evidence, architecture, persistence invariants, security, failure behavior, tests, and handoff.
- GitHub Actions are not document-validation authority.
- Missing/failed/queued/skipped Actions do not semantically invalidate this document.
- Hosted merge enforcement may technically block documentation merge.
- Documentation task must not change runtime/CI merely to force docs merge.

# 232. Implementation Validation Policy
- Future R03 implementation must execute actual applicable checks.
- Source audit here is not runtime proof.
- Failed required implementation validation remains a blocker for implementation readiness.
- Implementation PR remains owner-controlled.

# 233. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This spec authorizes only P03/R03 implementation after it is on main.
- Future implementation branches from latest legitimate P03/R02 implementation lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 234. Final Handoff to R04
- trusted input remains validated CustomerContext.
- reusable customer transaction remains inherited from R02.
- durable cart repository exists.
- durable order repository exists.
- ownership/tenant/branch invariants are enforced.
- persistence errors are typed.
- cart/order writes are composable in one transaction.
- R04 can implement command orchestration without direct SQL.

# 235. Required Next Specification
```text
FLOW_P03_R04_IMPLEMENTATION_SPEC.md
```
- R04 spec must be authored from actual R03 implementation state.
- R03 does not infer final command API prematurely.
- No R04 implementation starts until exact spec exists on `main`.

# 236. Final Acceptance Statement
- P03/R03 is READY as an executable specification document.
- R03 establishes durable cart/order persistence between customer data access and customer command orchestration.
- Customer ownership, tenant/branch scope, money snapshots, relational integrity, transaction safety, and rollback are explicit.
- Browser input remains non-authoritative for scope and pricing.
- R04 receives transaction-bound persistence primitives rather than raw tables.
- Generic idempotency, payment, realtime, kitchen routing, and final Phase 03 acceptance remain deferred.
