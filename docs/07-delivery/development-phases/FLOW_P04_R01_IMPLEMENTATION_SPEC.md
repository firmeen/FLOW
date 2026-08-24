# FLOW P04 R01 — Implementation Specification
> Phase 04 — Order Orchestration & Control
> Round 01 — Server Operational Order Intake + Unified Staff Queue Boundary
> Revision — Establish the first staff-facing server order read plane on top of the accepted Phase 03 customer order data plane, replace client-demo order queue authority with branch-scoped durable reads, and create the reusable operational order read model required by later acceptance/rejection and lifecycle rounds.

## Metadata
- Phase: `04`
- Round: `01`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P03_R06_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P04_R02_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — first eligible P04 implementation slot after this specification is on main`
- Current planning scope: `PHASE 04 / ROUND 01 ONLY`
- Implementation parent: `latest completed P03/R06 implementation lineage tip or integrated main equivalent after owner merge`
- Observed P03/R06 implementation merge on main: `e881f1e75df83a5a5bbfd2cfc48330fa5af4706c`
- Observed P03/R06 implementation PR: `#76`
- Observed P03 acceptance record: `docs/07-delivery/development-phases/FLOW_P03_ACCEPTANCE.md`
- Observed Phase 03 state: `IMPLEMENTED / MERGED / ACCEPTANCE RECORD PRESENT`
- Recommended implementation branch: `p04-r01-operational-order-queue`
- Recommended implementation PR title: `feat(operations): establish server-backed operational order queue`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Operational order read plane in this round: `YES`
- Unified staff order queue in this round: `YES`
- Branch-scoped durable order reads in this round: `YES`
- Client demo order queue authority removal in this round: `YES — for staff Orders queue only`
- Order acceptance/rejection mutation in this round: `NO — P04/R02`
- General order lifecycle transition engine in this round: `NO — P04/R03`
- Staff order edit/cancel exception workflows in this round: `NO — P04/R04`
- Priority/delay/remake workflow in this round: `NO — P04/R05`
- Phase 04 acceptance in this round: `NO — P04/R06`
- Kitchen production workflow in this round: `NO`
- Payment execution in this round: `NO`
- Realtime event publication in this round: `NO`
- Notification delivery in this round: `NO`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` is the policy and executable-specification authority.
- Current observed `main` SHA is `e881f1e75df83a5a5bbfd2cfc48330fa5af4706c`.
- That main commit merged P03/R06 implementation PR `#76`.
- Phase 03 acceptance evidence exists on current `main`.
- Phase 03 acceptance proves customer capability/session trust.
- Phase 03 acceptance proves customer-scoped database access.
- Phase 03 acceptance proves durable cart persistence.
- Phase 03 acceptance proves durable order persistence.
- Phase 03 acceptance proves atomic customer order submission.
- Phase 03 acceptance proves request idempotency and replay safety.
- P03/R06 `Next` points to this exact canonical P04/R01 filename.
- `FLOW_P04_R01_IMPLEMENTATION_SPEC.md` was absent from `main` before this document was authored.
- No `p04-*` implementation branch was observed before this document was authored.
- No duplicate P04/R01 specification PR was observed before this document was authored.
- Product authority identifies `F04 — Order Orchestration & Control` as the order-control capability domain.
- Product authority defines its operating sequence after customer order submission.
- Existing `/staff` operations UI already presents an incoming-order queue concept.
- Existing `/staff` UI currently obtains orders from client-side `useFoodFlow()` state.
- Existing client state is not the Phase 03 durable order source of truth.
- Existing `/staff` route is protected by branch-scoped `operations.staff.access`.
- Existing permission catalog also defines branch-scoped `order.view` and `order.manage` semantics.
- Existing authorized transaction helpers can bind staff identity, tenant, and branch context to database reads.
- Phase 03 customer transactions remain a separate customer authority path.
- P04/R01 must not reuse customer capability authority for staff operational reads.
- P04/R01 must not replace Auth.js / AccessContext staff authority.
- P04/R01 must not create acceptance/rejection mutations.
- P04/R01 must not turn the staff UI into a kitchen or cashier implementation.
- This automation task is specification/documentation only.
- This task does not create the P04/R01 implementation branch.
- This task does not modify application/runtime code.
- This task does not modify database implementation code.
- This task does not implement migrations.
- This task does not modify workflows or deployment configuration.
- This task does not merge an implementation PR.

# 2. Phase 04 Product Authority
- FoodFlow operating model is Customer Entry → Menu Discovery → Cart/Order Submission → Order Orchestration → Staff/Kitchen Fulfilment → Payment/Closing.
- Phase 03 closed the customer submission data plane.
- Phase 04 begins the durable internal operational order-control data plane.
- Product catalog `F04` is titled `Order Orchestration & Control`.
- `F04-T01` requires order intake and unified queue behavior.
- `F04-T01` requires orders from customer web, POS, and staff sources to converge on one operational queue.
- `F04-T01` requires source and ordering mode visibility.
- `F04-T01` requires arrival time and waiting-time visibility.
- `F04-T01` requires duplicate-safe intake semantics.
- `F04-T01` requires filtering by branch, source, status, and time.
- `F04-T01` requires a new-order indicator.
- `F04-T02` defines acceptance/rejection and is deliberately deferred to R02.
- `F04-T03` defines broader order lifecycle and is deliberately deferred to R03.
- `F04-T04` defines staff editing/exception control and is deliberately deferred to R04.
- `F04-T05` defines cancellation/void/refund coordination and remains later scope.
- `F04-T06` defines priority/delay/recovery and remains later scope.
- `F04-T07` defines remake management and remains later scope.
- Phase 04 therefore starts by making intake/read authority real before adding mutations.

# 3. Phase 04 Six-Round Boundary
- R01 owns operational order intake read architecture.
- R01 owns branch-scoped staff unified queue reads.
- R01 owns canonical operational order read models.
- R01 owns migration of the staff Orders queue away from client-demo order authority.
- R01 owns queue filtering, deterministic ordering, pagination, and waiting-time data contracts.
- R01 does not own operational state mutation.
- R02 owns staff acceptance and rejection commands.
- R02 owns decision actor/reason/timestamp persistence.
- R02 owns acceptance/rejection authorization and failure contracts.
- R03 owns canonical order and item lifecycle transitions.
- R03 owns legal state transition engine and operational timestamp semantics.
- R04 owns staff order edit and cancellation exception controls.
- R04 owns before/after change audit semantics.
- R04 owns conflict-safe edit coordination inside established lifecycle rules.
- R05 owns priority, delay, recovery, remake, and remaining order-control hardening that naturally belongs before acceptance.
- R05 must not pull kitchen production execution or payments into Phase 04 unless a later exact spec explicitly changes the boundary.
- R06 owns integrated Phase 04 acceptance and next-phase handoff.
- R06 owns proof that staff operational order control composes with Phase 03 customer order creation.
- This phase boundary is intentionally narrower than all FoodFlow operations.

# 4. Why R01 Exists Now
- Phase 03 creates server-authoritative submitted orders.
- The operational staff UI still reads order data from client demo state.
- Two order authorities would cause drift as soon as staff actions become durable.
- Staff cannot safely accept/reject a server order if the visible queue is not reading the same durable record.
- A mutation-first design would hide branch leakage and stale-read defects until later.
- A queue-first design creates one trusted read surface for all later operational commands.
- Queue architecture defines which status values are visible to which operational role.
- Queue architecture defines how order identity is presented without exposing customer bearer authority.
- Queue architecture defines how tenant and branch scope are applied at the source of truth.
- Queue architecture defines stable pagination and sorting under concurrent order arrival.
- Queue architecture defines bounded query shape before order volume grows.
- Queue architecture creates testable read contracts for R02–R06.
- R01 therefore closes the largest internal read-authority gap before staff mutations begin.

# 5. High-Impact R01 Objective
- Create one canonical server-only operational-order module.
- Bind every operational order read to validated internal AccessContext.
- Require branch scope for the staff unified queue.
- Require `order.view` authorization for order data access.
- Preserve `/staff` route access permission independently from data permission.
- Query durable `foodflow.orders` created by Phase 03.
- Query durable order items and modifier snapshots from Phase 03 persistence.
- Present customer submitted orders in the staff Orders queue from the database.
- Remove client-demo `state.orders` as authoritative data for the staff Orders queue.
- Keep unrelated staff tabs on their existing state path unless exact implementation requires a narrow compatibility adapter.
- Define a stable operational queue item DTO.
- Define a stable operational order detail DTO.
- Define deterministic status/source/mode presentation rules.
- Define deterministic waiting-time reference timestamp.
- Define stable pagination and tie-break ordering.
- Define safe branch-local filters.
- Define safe error behavior.
- Define least-privilege database access.
- Define regression tests proving customer and staff authority remain separate.
- Leave all order mutations for later rounds.

# 6. Phase 03 Handoff to Preserve
- `foodflow.orders` is now durable order authority.
- `foodflow.order_items` is durable submitted item snapshot authority.
- `foodflow.order_item_modifiers` is durable submitted modifier snapshot authority.
- Customer order ownership remains server-derived.
- Submitted customer orders begin in canonical `PENDING_CONFIRMATION` state.
- Customer-facing status begins as `SENT` where current schema uses that field.
- Customer order number is server/database derived.
- `submitted_at` is server/database derived.
- `source_cart_id` preserves cart-to-order lineage.
- customer capability ownership remains stored only as an opaque identifier, never bearer material.
- server-captured price/currency/modifier snapshots remain historical order data.
- customer command idempotency remains the duplicate-request boundary for customer mutations.
- P04 staff reads must not rewrite those invariants.
- P04 staff reads must not invoke customer runtime role.
- P04 staff reads must not require customer capability cookies.
- P04 must not expose customer capability identifiers in staff public DTOs unless a proven operational need exists.
- P04 must preserve one-cart-one-order constraints.
- P04 must preserve submitted order snapshot immutability unless later specs deliberately define staff-edit semantics.

# 7. Existing Internal Authority to Reuse
- Auth.js remains staff authentication authority.
- AccessContext remains tenant/branch workspace authority.
- membership state remains internal authorization evidence.
- `operations.staff.access` protects the `/staff` route family.
- `order.view` exists as an internal permission code.
- `order.manage` exists as a stronger order mutation permission code.
- R01 requires `order.view` for operational order reads.
- R01 must not require `order.manage` merely to view the queue.
- R01 must not grant `order.view` automatically inside application code.
- R01 must use current role/permission evaluation from the database.
- `withAuthorizedCurrentAccessTransaction()` is the preferred current transaction composition primitive.
- `withAuthorizedAccessTransaction()` remains available when AccessContext is already resolved.
- database tenant/branch/actor context must be set by the established internal transaction path.
- R01 must not add a second staff authorization stack.
- R01 must not copy permission logic into React components.

# 8. Existing Staff UI Baseline
- `/staff` renders `StaffOperations`.
- `StaffOperations` is currently a client component.
- `StaffOperations` calls `useFoodFlow()`.
- `useFoodFlow()` supplies `state.orders`.
- `pendingOrders` is currently derived from `state.orders`.
- pending order filtering currently includes `PENDING_CONFIRMATION` and `CHANGED`.
- queue ordering currently sorts by `submittedAt`.
- staff UI displays incoming count.
- staff UI opens an order review modal from the selected client-state order.
- staff UI exposes accept/reject/edit buttons.
- those client action paths are legacy/demo behavior relative to the new Phase 03 server source.
- R01 must replace only order-read authority.
- R01 must not make accept/reject/edit durable yet.
- R01 must prevent legacy client actions from falsely mutating server-read orders.
- If server-backed orders are displayed before R02, mutation controls for those rows must be disabled or explicitly marked unavailable.
- The UI must not pretend a client-only mutation changed a server-backed order.
- Existing table/service/ready/menu tabs are not broad R01 rewrite targets.

# 9. R01 User-Visible Outcome
- Authorized staff opening `/staff#orders` sees durable submitted orders for the active branch.
- Staff does not see sibling-branch orders.
- Staff does not see another tenant’s orders.
- Staff sees canonical order number.
- Staff sees canonical current order status.
- Staff sees customer-facing source/mode presentation when authoritative data exists.
- Staff sees table label when the order is table-bound and the table remains resolvable.
- Staff sees submitted time.
- Staff sees waiting duration derived from server timestamp and current time.
- Staff sees item count and order subtotal/currency.
- Staff can open order details and see persisted item/modifier snapshots.
- Staff cannot mutate a server-backed order in R01.
- Empty queue state is explicit.
- authorization failure does not leak order existence.
- transient data unavailability renders a safe recoverable state.

# 10. Canonical Operational Module Placement
- Preferred root: `apps/web/next-flow/src/modules/order-operations/server/`.
- Keep module server-only.
- Do not place operational database reads inside `features/staff/`.
- Do not place operational SQL directly in route handlers.
- Do not add operational reads to `customer-data` merely because they read the same tables.
- Customer data and staff operations have different authority models.
- A separate operational module makes that authority boundary explicit.
- The module may depend on internal identity transaction helpers.
- The module may depend on shared DB transaction types.
- The module may depend on generated database types.
- The module must not depend on browser store modules.
- The module must not depend on customer capability transport.

# 11. Candidate Files to CREATE
- `apps/web/next-flow/src/modules/order-operations/server/types.ts`.
- `apps/web/next-flow/src/modules/order-operations/server/errors.ts`.
- `apps/web/next-flow/src/modules/order-operations/server/order-queue-repository.ts`.
- `apps/web/next-flow/src/modules/order-operations/server/order-queue-service.ts`.
- `apps/web/next-flow/src/modules/order-operations/server/index.ts`.
- `apps/web/next-flow/src/app/api/internal/orders/route.ts` if HTTP read transport is selected for the client queue.
- `apps/web/next-flow/tests/unit/operational-order-queue.test.ts`.
- `apps/web/next-flow/tests/integration/operational-order-queue.test.ts`.
- `supabase/tests/database/p04_r01_operational_order_queue.test.sql` only when DB grants/RLS/index behavior requires new database proof.
- A forward migration only if actual schema/index/grant audit proves one is required.
- Implementation must not create placeholder files that have no runtime responsibility.

# 12. Candidate Files to MODIFY
- `apps/web/next-flow/src/app/(operations)/staff/page.tsx` when server data is loaded at page boundary.
- `apps/web/next-flow/src/features/staff/staff-operations.tsx` to consume server queue data for the Orders tab.
- `apps/web/next-flow/src/modules/identity/server/route-permissions.ts` only if a new internal API route needs explicit route-level metadata and existing helpers cannot secure it cleanly.
- `apps/web/next-flow/src/modules/identity/server/command-permissions.ts` must not be changed for read-only R01 unless a generic read-query permission mapping is introduced with clear benefit.
- `apps/web/next-flow/src/server/db/generated/database.ts` only when a legitimate forward migration changes schema.
- `apps/web/next-flow/package.json` only when existing test discovery does not automatically include the new tests.
- No dependency version change is expected.
- No lockfile change is expected.

# 13. Files to MOVE
- None expected.
- Do not move Phase 03 customer modules into operational modules.
- Do not move identity modules.
- Do not move staff UI merely to satisfy naming preferences.
- Any move requires direct implementation necessity and PR explanation.

# 14. Files to REMOVE
- No broad file deletion is required.
- Do not remove the global demo store in R01.
- Do not remove table/service/kitchen/cashier demo behavior outside the Orders queue.
- Remove only dead order-specific compatibility code when server queue integration proves it unused.
- Do not delete customer order types used by Phase 03.
- Do not delete historical migrations.
- Do not delete existing product catalog documents.

# 15. DO-NOT-TOUCH Runtime Scope
- Customer capability issuance.
- Customer capability cookie format.
- Customer entry resolver.
- Customer cart command behavior.
- Customer order submission command behavior.
- Customer idempotency key contract.
- Customer replay database table/functions.
- Staff Auth.js provider configuration.
- AccessContext semantics.
- role membership semantics.
- kitchen production commands.
- cashier payment commands.
- payment provider code.
- notification delivery.
- realtime infrastructure.
- unrelated design system components.
- unrelated management pages.

# 16. Operational Order Queue DTO
```ts
export interface OperationalOrderQueueItem {
  readonly id: string;
  readonly orderNumber: string;
  readonly status: OperationalOrderStatus;
  readonly customerStatus: string | null;
  readonly source: OperationalOrderSource;
  readonly orderingMode: OperationalOrderingMode | null;
  readonly submittedAt: string;
  readonly createdAt: string;
  readonly tableId: string | null;
  readonly tableLabel: string | null;
  readonly tableSessionId: string | null;
  readonly itemCount: number;
  readonly subtotalMinor: string;
  readonly currency: string;
  readonly customerNotePresent: boolean;
}
```
- This interface is conceptual but the implementation should remain close to it.
- DTO must not expose tenant ID merely because the row contains it.
- DTO must not expose branch ID when branch is already implicit in authorized context unless UI needs it.
- DTO must not expose capability bearer material.
- DTO should avoid exposing opaque capability ID by default.
- DTO should serialize timestamps as ISO strings across HTTP.
- Money remains string minor units or an established safe representation.
- Client formatting converts minor units for display.

# 17. Operational Order Detail DTO
```ts
export interface OperationalOrderDetail extends OperationalOrderQueueItem {
  readonly customerNote: string | null;
  readonly items: readonly OperationalOrderItem[];
}
```
- Item DTO contains persisted item snapshot name.
- Item DTO contains persisted Thai name when available.
- Item DTO contains quantity.
- Item DTO contains unit price minor.
- Item DTO contains line total minor.
- Item DTO contains special request.
- Item DTO contains preparation station as historical routing metadata.
- Item DTO contains persisted modifier snapshot names.
- Item DTO contains persisted modifier price deltas.
- Item DTO does not rehydrate prices from live menu rows.
- Item DTO does not require current menu availability.
- Operational detail is historical order truth.

# 18. Order Status Read Contract
- Current customer-submitted order state `PENDING_CONFIRMATION` must map directly into the operational queue.
- Existing historical status values in schema must be audited before hard-coding a narrow union.
- R01 may define a read union containing every existing legal persisted order status.
- R01 must not introduce new lifecycle transitions.
- R01 must not silently rewrite persisted statuses while reading.
- Unknown unexpected status must fail safely or map to a deliberate `UNKNOWN` presentation without granting actions.
- UI action availability must not be inferred from client-only assumptions.
- R02/R03 will define mutation legality.
- R01 only defines read presentation.

# 19. Source Contract
- Product authority requires a unified queue across customer web, POS, and staff sources.
- Phase 03 durable customer orders are customer-web source in current implemented flow.
- Implementation must audit whether `foodflow.orders` already has an authoritative source column.
- If source exists, map it without duplication.
- If source does not exist, R01 may add a narrowly-scoped source column only when needed to prevent future ambiguity.
- Any new source column needs a constrained domain.
- Existing rows created by Phase 03 must be backfilled deterministically as customer-web source.
- Backfill must not use timestamps or heuristic inference.
- New default must not misclassify future staff/POS sources.
- If schema change is unnecessary because source already exists elsewhere, do not add one.
- Do not infer source from customer capability presence at read time as the permanent contract if future staff/POS orders require durable source identity.

# 20. Ordering Mode Contract
- Product authority requires ordering-mode visibility.
- Implementation must audit existing order schema for mode/channel fields.
- Table-bound Phase 03 orders can currently imply dine-in context but implication is not necessarily durable mode authority.
- Prefer an existing explicit order-mode field when available.
- Do not add a speculative multi-channel model if current schema already solves it.
- If mode is unavailable for existing Phase 03 orders, R01 may return `null` rather than fabricate a value.
- A future round may establish explicit mode persistence if needed.
- UI must tolerate unknown/null ordering mode.

# 21. Queue Identity
- Queue identity is durable order UUID.
- Display identity is canonical order number.
- Never use array position as identity.
- Never use order number as the only database join key if UUID exists.
- Do not expose source cart ID as UI identity.
- Cursor pagination should use stable tuple fields rather than display order number alone.

# 22. Branch Scope
- Active branch comes from AccessContext.
- Browser may request filters but may not choose an arbitrary branch outside AccessContext.
- Repository query must include tenant scope.
- Repository query must include branch scope.
- RLS remains defense in depth where internal role policies exist.
- Query predicates remain explicit even when RLS already applies.
- Sibling branch order must be invisible.
- Another tenant order must be invisible.
- Missing branch context must fail closed for `/staff` queue.

# 23. Permission Scope
- `/staff` route access requires `operations.staff.access`.
- Reading order data requires `order.view`.
- These permissions are distinct.
- A user may have route access but lack order viewing capability under future role designs.
- Server data query must enforce `order.view` independently.
- Do not rely only on route layout authorization for API transport.
- Do not rely on hidden buttons for authorization.
- `order.manage` is not required for R01 reads.
- R01 must not broaden default grants merely to make the page render.
- Existing role fixtures may be adjusted only if product-defined staff roles are intended to view orders and current fixtures are incomplete.
- Any fixture/grant change must be covered by negative tests.

# 24. Authorized Transaction Contract
- Resolve current AccessContext server-side.
- Require branch context.
- Enter established authorized tenant transaction.
- Re-evaluate `order.view` in the transaction.
- Execute queue repository with that transaction.
- Do not pass raw tenant/branch from request into transaction helper.
- Do not open an independent unscoped database client inside repository.
- Do not use customer transaction role.
- Do not use service-role style bypass.
- Commit read transaction normally.
- Read-only queries must not mutate audit/application state merely by rendering the queue unless existing auth/session audit already does so.

# 25. Repository Responsibilities
- Accept transaction handle.
- Accept trusted AccessContext or a narrowed internal operational context.
- Accept validated queue filters.
- Query orders within trusted tenant/branch.
- Query item counts without N+1.
- Resolve table labels without N+1.
- Return stable row models.
- Provide detail query by order ID.
- Scope detail query to same tenant/branch.
- Normalize database nulls.
- Normalize timestamp types.
- Avoid formatting presentation strings.
- Avoid React dependencies.
- Avoid permission checks duplicated inside SQL strings when authorized transaction already owns them; explicit scope predicates still required.

# 26. Service Responsibilities
- Validate filter semantics.
- Apply default status window.
- Apply default page size.
- Enforce maximum page size.
- Decode/validate cursor.
- Call authorized transaction boundary.
- Call repository.
- Map repository rows to public operational DTOs.
- Map data-layer errors to operational read errors.
- Expose list queue operation.
- Expose get detail operation.
- Avoid order mutations.
- Avoid kitchen/payment side effects.
- Avoid long-lived cache that violates branch/session revocation semantics.

# 27. Query Filter Contract
```ts
export interface OperationalOrderQueueFilter {
  readonly statuses?: readonly OperationalOrderStatus[];
  readonly source?: OperationalOrderSource | null;
  readonly orderingMode?: OperationalOrderingMode | null;
  readonly submittedAfter?: string | null;
  readonly submittedBefore?: string | null;
  readonly limit?: number;
  readonly cursor?: string | null;
}
```
- Unknown query keys must be rejected or ignored consistently according to existing internal API conventions.
- Status list length must be bounded.
- Duplicate statuses should canonicalize safely.
- Date strings must be valid ISO timestamps.
- Date range must be bounded when needed for resource safety.
- Limit must be integer.
- Limit must have a conservative maximum.
- Cursor must be opaque and validated.
- Filter never contains tenant ID.
- Filter never contains arbitrary branch ID.

# 28. Default Queue Filter
- Default queue targets operationally relevant non-terminal statuses.
- At minimum, current `PENDING_CONFIRMATION` customer orders must appear.
- Existing `CHANGED` state must only appear if it is a real persisted legal status on current schema.
- Do not copy the client demo status set blindly.
- Audit the database enum/check constraints first.
- Default should exclude drafts not yet submitted.
- Default should exclude terminal historical orders when focusing incoming work.
- Historical views may use explicit filters.
- Exact default set must be documented in implementation PR.

# 29. Deterministic Queue Ordering
- Primary operational ordering should be oldest actionable submission first unless product requirements explicitly dictate another queue priority.
- Use `submitted_at` ascending for incoming queue where non-null.
- Use stable UUID/id tie-breaker.
- Do not sort only in browser after arbitrary database result order.
- Pagination order and cursor order must match.
- Null submission timestamps should be excluded from submitted queue or deliberately ordered after audit.
- R01 does not implement priority override.
- R05 may later introduce priority/delay ordering.
- New arrivals may appear on refresh without invalidating already-rendered order identity.

# 30. Cursor Pagination
- Prefer keyset pagination over unbounded offset for growing order tables.
- Cursor should encode last `submittedAt` plus order ID or equivalent stable tuple.
- Cursor is a selector, not authority.
- Cursor must not encode raw tenant secrets.
- Cursor must not permit branch override.
- Cursor decoding failure maps to invalid query.
- Same filters plus cursor must produce deterministic continuation.
- New orders inserted before the cursor should not create duplicate rows in continuation.
- A deleted/cancelled row should not break cursor parsing.
- R01 may use a small bounded no-pagination implementation only if actual volume and existing conventions justify it; PR must record decision.

# 31. Waiting-Time Contract
- Waiting time is derived from authoritative `submitted_at`.
- Database does not need to store continually updated wait duration.
- Server DTO should expose submission timestamp.
- Client may calculate elapsed display time from current clock.
- Do not persist browser clock values.
- Sorting does not use client clock.
- Missing submitted timestamp for submitted status is invariant violation under established Phase 03 constraint and should be surfaced safely.

# 32. Table Context
- Resolve table label from durable table relation when available.
- Preserve order `table_id` snapshot/reference semantics.
- Do not trust browser table labels.
- Deleted/inactive table should not make historical order unreadable.
- Missing table relation should map label to a safe fallback.
- Avoid exposing unrelated table metadata.
- Table session ID may remain internal unless staff detail needs it.
- R01 does not implement table-session mutation.

# 33. Item Count Contract
- Item count means sum of order item quantities or row count; choose one and document it.
- Staff queue UX usually needs total units or line count explicitly named.
- Avoid ambiguous `itemCount` if implementation could be interpreted both ways.
- Recommended DTO uses `lineCount` and `unitCount` when both are useful.
- Compute using aggregate query.
- Do not load every item merely to count rows in the queue list.

# 34. Money Contract
- Queue subtotal uses durable order subtotal snapshot.
- Currency uses durable order currency.
- Do not recalculate subtotal from current menu.
- Do not use floating point in server DTO transformation.
- Keep minor units as decimal string.
- Formatting occurs in UI.
- Unknown currency is invariant failure if current schema requires valid ISO code.
- R01 does not calculate tax, discount, service charge, payment due, or refund amounts unless already persisted and required for queue display.

# 35. Customer Note Contract
- Queue should not render full free-text customer note by default when only presence is needed.
- Detail view may display note.
- Note must be escaped by React default rendering.
- Never inject customer note as HTML.
- Boundaries from Phase 03 input validation remain applicable.
- Logs should not include full customer note.

# 36. Order Detail Query
- Detail endpoint/query accepts order UUID selector.
- Validate UUID before query.
- Query exact tenant and branch.
- Return not-found for cross-scope IDs rather than revealing forbidden existence.
- Load items deterministically by created/order sequence.
- Load modifiers deterministically.
- Use bounded query count.
- Avoid one query per item.
- Return historical snapshots.
- Do not enrich from current menu unless explicitly non-authoritative UI decoration.
- R01 detail is read-only.

# 37. Internal HTTP Read Transport
- If the Orders tab remains client-rendered, prefer one authenticated internal read route.
- Candidate: `GET /api/internal/orders`.
- Candidate detail: `GET /api/internal/orders/{id}` only if page design needs it.
- Route must run server-only authorization.
- Route must require internal session.
- Route must require branch context.
- Route must require `order.view`.
- Route must not accept tenant ID.
- Route must not accept branch override.
- Route returns no cache by default unless revocation-safe caching is proven.
- Route maps operational errors to stable safe responses.
- Route never invokes client demo store.

# 38. Server Component Alternative
- A server component/page loader may call the operational service directly for initial queue data.
- This avoids an extra internal HTTP hop for initial render.
- Client refresh may still require a route or server action.
- Implementation should choose one coherent pattern.
- Do not maintain two independent queue query implementations.
- If initial page load and refresh share code, both must call the same service.
- Architecture decision must be documented in PR.

# 39. Cache Contract
- Default internal order queue reads should be dynamic.
- Do not use static generation.
- Do not share cached branch data across users without explicit cache key isolation.
- Branch revocation must take effect on subsequent request.
- Order arrival should become visible on explicit refresh/navigation.
- R01 does not require realtime push.
- Polling is optional and must be bounded if implemented.
- Do not introduce a new external cache dependency.

# 40. Refresh Contract
- Provide explicit refresh behavior if no realtime system exists.
- Refresh must preserve current filter.
- Refresh must not duplicate queue rows.
- Refresh errors must not erase already displayed data without a clear error state.
- Avoid aggressive sub-second polling.
- Default manual refresh is acceptable for R01.
- Later phases can introduce realtime under an explicit spec.

# 41. Staff Orders Tab Migration Strategy
- Isolate Orders tab from the broad legacy store.
- Introduce server-backed queue data as a separate prop/hook/state source.
- Keep non-order tabs unchanged.
- Do not merge server queue records into global demo `FoodFlowState` as if all operations were durable.
- Do not overwrite demo state with server data that legacy kitchen/cashier actions may mutate locally.
- Prefer a dedicated `OperationalOrdersPanel` or narrow adapter.
- Existing visual components may be reused.
- Existing queue metrics may consume server order count for incoming orders.
- Existing selected-order modal may consume server detail DTO.
- Mutation buttons for server-backed records must remain disabled/hidden until R02+.

# 42. Mutation-Control UX in R01
- Accept button must not call legacy local `acceptOrder` for a durable server order.
- Reject button must not call legacy local `rejectOrder` for a durable server order.
- Edit button must not call legacy local `changeOrder` for a durable server order.
- R01 may hide those controls.
- R01 may render them disabled with an intentional unavailable message.
- Do not mislead staff with a successful toast from local-only mutation.
- Existing demo-only orders may remain in a clearly separated demo path only if required for unrelated development; they must not mix with production queue.
- Preferred behavior is server queue authority for Orders tab with no mutation controls until R02.

# 43. Empty Queue UX
- Distinguish zero matching orders from loading.
- Distinguish zero matching orders from authorization failure.
- Distinguish zero matching orders from server error.
- Empty message should mention current filter when filtered.
- Do not display sample orders in a real empty queue.
- Do not fall back silently to demo orders.

# 44. Loading UX
- Initial server render may avoid client loading state.
- Client refresh should show non-blocking loading indication.
- Do not clear selected filter during loading.
- Do not expose stale demo data as placeholder.
- Skeleton rows should not contain fake order numbers.
- Accessibility should announce loading state appropriately.

# 45. Error UX
- Authorization denied routes to existing forbidden UX or stable API denial.
- Session missing follows existing login flow.
- Branch unavailable follows existing workspace/forbidden semantics.
- Data unavailable renders recoverable error with retry.
- Invalid query renders safe validation error.
- Order detail not found returns safe not-found state.
- Cross-branch selector behaves as not found.
- Error UI must not include raw SQL/database messages.

# 46. Error Taxonomy
```ts
export type OperationalOrderReadErrorCode =
  | "ORDER_QUEUE_INVALID_QUERY"
  | "ORDER_QUEUE_NOT_FOUND"
  | "ORDER_QUEUE_FORBIDDEN"
  | "ORDER_QUEUE_UNAVAILABLE"
  | "ORDER_QUEUE_INVARIANT_VIOLATION";
```
- Authorization library errors may remain their native type internally.
- Public/internal HTTP mapping should remain stable.
- Database timeout maps to unavailable.
- malformed cursor maps to invalid query.
- unexpected persisted state maps to invariant/unavailable without leaking details.
- Cross-scope order selector maps to not found.

# 47. Database Read Strategy
- Prefer direct Kysely queries through established authorized transaction.
- Use explicit table aliases.
- Select only required columns.
- Join branch-local tables with tenant keys where composite tenancy applies.
- Avoid `select *` for operational DTOs.
- Aggregate item counts with grouped query or pre-aggregated subquery.
- Batch detail child queries.
- Preserve generated type safety.
- Do not create SECURITY DEFINER read functions unless direct RLS-safe reads cannot satisfy least privilege.
- Any SECURITY DEFINER function requires fixed safe search path and narrow execute grants.

# 48. RLS and Internal Role Strategy
- Internal `flow_runtime`/established staff transaction role remains separate from `flow_customer_runtime`.
- R01 must inspect current policies on `foodflow.orders` and children.
- Staff order reads must be tenant/branch scoped under internal actor context.
- Existing broad internal role access should be narrowed only if actual security audit requires it and does not break established Phase 02 authorization model.
- Do not grant customer role broader read access.
- Do not grant `anon` or `authenticated` direct order-table access.
- Do not grant public execute on private read functions.
- RLS negative tests should cover sibling branch and other tenant.

# 49. Migration Decision Gate
- R01 does not require a migration merely because a new module is added.
- First inspect existing order columns, constraints, indexes, grants, and policies.
- Add a forward migration only for a demonstrated queue requirement.
- Candidate reasons include missing composite queue index.
- Candidate reasons include missing durable source column required by current product contract.
- Candidate reasons include missing narrow internal read policy.
- Do not add speculative columns for later R02–R05.
- Historical migrations are immutable.
- Migration must be additive/forward-safe.
- Migration must work from fresh reset.
- Migration must not rewrite production data destructively.

# 50. Queue Index Decision
- Existing `orders_customer_scope_idx` is customer capability oriented.
- Operational queue query is branch/status/submission-time oriented.
- Implementation must inspect query plan/index suitability.
- Candidate index shape: `(tenant_id, branch_id, status, submitted_at, id)`.
- Index order must match actual filter/sort strategy.
- Do not create overlapping indexes without evidence.
- Partial index may be appropriate for operational non-terminal statuses if stable status set exists.
- Avoid hard-coding future status values in an index before R03 lifecycle contract if that would create churn.
- A broad branch/submitted index may be safer in R01.
- Database test should prove index existence only if migration creates it.

# 51. Source Backfill Safety
- Only applies if source column is added.
- Phase 03 current orders are known customer web/direct-entry origin.
- Backfill existing non-null submitted rows created by current customer path to canonical customer source.
- Draft rows require separate deterministic rule.
- Do not infer staff/POS source from absence of capability without auditing all fixtures.
- Backfill must be deterministic and testable.
- New column should have constraint/default appropriate to future producers.
- Avoid defaulting every future insert to customer web if staff/POS producers will be added.

# 52. Generated Database Types
- Regenerate only when schema changes.
- Do not manually patch generated types when generation tooling exists.
- Generated drift must be checked.
- No generated change is expected for a pure read-module implementation.
- PR must state whether schema changed.

# 53. Security: Tenant Isolation
- Every queue read is tenant-bound from AccessContext.
- Client cannot override tenant.
- API query cannot override tenant.
- Detail selector does not imply tenant.
- DB predicate includes tenant.
- RLS/internal context remains defense in depth.
- Test Tenant A staff cannot read Tenant B order.
- Error response does not reveal Tenant B order existence.

# 54. Security: Branch Isolation
- Every `/staff` order queue requires active branch.
- Client cannot set arbitrary branch through query string.
- Staff branch selection occurs through established AccessContext workspace mechanism.
- DB predicate includes branch.
- Test Branch A1 staff cannot read Branch A2 order without switching to an authorized branch context.
- Invalid/stale selected branch fails closed.
- Branch membership revocation takes effect on subsequent request.

# 55. Security: Permission Separation
- route access and data permission are both required.
- `operations.staff.access` alone is not sufficient to query order data if `order.view` is denied.
- `order.view` does not imply `order.manage`.
- R01 provides no mutation endpoint.
- hidden UI is not authorization.
- API/service authorization is server-side.
- Permission decision uses current DB state.

# 56. Security: Customer Authority Separation
- Customer capability cannot query internal operational route.
- Customer cookie is not accepted as staff authentication.
- Staff session is not converted from customer capability.
- Operational service never calls `currentCustomerContext()` as authority.
- Customer runtime role is never used for staff queue reads.
- Staff DTO does not expose bearer capability token.
- Customer capability ID should remain omitted unless future auditing explicitly needs it.
- Test customer-only session gets denied from internal order route.

# 57. Security: Input Validation
- order detail ID validated as UUID.
- cursor validated.
- limit bounded.
- date filters validated.
- status filters allowlisted.
- source filter allowlisted.
- ordering mode filter allowlisted.
- unknown enum values rejected.
- no raw SQL interpolation from query parameters.
- Kysely parameterization required.

# 58. Security: XSS
- Customer note rendered as text.
- item names rendered as text.
- modifier names rendered as text.
- no `dangerouslySetInnerHTML` for order content.
- error messages are controlled strings.
- order number treated as data.

# 59. Security: Log Redaction
- Do not log full order payload on routine reads.
- Do not log customer bearer tokens.
- Do not log capability cookies.
- Do not log raw session tokens.
- Avoid full customer note in logs.
- Safe logs may include internal order UUID, branch ID, actor ID, count, latency, and error code according to existing policy.
- Do not log cross-tenant rejected selector details beyond safe diagnostics.

# 60. Privacy Boundary
- R01 queue should expose only data staff need to process incoming orders.
- Do not add customer profile fields not currently needed.
- Do not add phone/email merely because future takeaway/delivery may need them.
- Do not add IP/user-agent from customer submission.
- Preserve data-minimization principle.

# 61. Read Consistency
- Queue list and detail may observe concurrent new orders.
- R01 does not require serializable transactions for read-only queue browsing.
- Each request should be internally consistent enough for its DTO.
- Detail should not mix parent from one branch with children from another due to missing tenant predicates.
- Item/modifier snapshots are immutable enough for current Phase 03 submitted record.
- Later edit rounds must define version/conflict semantics.
- R01 should not introduce locking on ordinary reads.

# 62. Concurrency: New Order During Page Read
- New order may appear after current page snapshot.
- No duplicate row should appear within one response.
- Stable cursor order prevents duplicate continuation rows.
- UI refresh may show new order.
- R01 does not guarantee realtime immediacy.
- Do not block customer submit transaction while staff queue reads.

# 63. Concurrency: Order Mutated by Legacy Data
- R01 implementation must inspect whether any server operational mutation currently exists.
- Queue reader must tolerate status changing between list and detail.
- Detail returns current durable state.
- UI must not assume selected list status is immutable.
- R02/R03 will add stronger mutation/version semantics.

# 64. Transaction Isolation
- Use repository standard transaction isolation.
- Do not elevate all queue reads to serializable.
- Do not hold read transaction while user modal remains open.
- Load data per request and release connection promptly.
- Avoid streaming a DB transaction across client interaction.

# 65. Performance Budget
- Default queue page must be bounded.
- Recommended default limit: 50 or lower based on UI density.
- Hard maximum should be explicit.
- Queue should require bounded query count independent of row count.
- Target list query count should remain O(1), not O(n).
- Detail query count should remain fixed small number.
- Avoid loading modifier details for every queue card when not displayed.
- Use aggregate counts for list.
- Fetch full children only for detail.
- Avoid unnecessary current menu joins.

# 66. N+1 Prohibitions
- No per-order table lookup.
- No per-order item-count lookup.
- No per-order item list on queue view.
- No per-item modifier query on detail.
- No per-order permission query when one authorized transaction already established permission.
- Test query count where repository harness supports it.

# 67. Query Timeout / Resource Failure
- Follow existing database timeout behavior.
- Timeout maps to unavailable.
- Do not retry unboundedly.
- Read retry is optional only for classified transient infrastructure failure.
- UI should allow manual retry.
- Do not fall back to demo state after timeout.

# 68. Observability
- Record queue read latency using existing logging/telemetry facilities only if already available.
- Record result count safely.
- Record branch scope safely according to logging conventions.
- Record error code.
- Do not add a new observability vendor.
- Do not log individual item names by default.
- Do not emit customer note.
- Performance instrumentation must not change authorization behavior.

# 69. Data Freshness
- R01 does not require realtime subscription.
- Server read on navigation is authoritative at request time.
- Manual refresh obtains fresh server state.
- If polling is implemented, interval must be bounded and paused when page hidden when practical.
- Cache-control must not permit cross-user branch leakage.
- Avoid stale-while-revalidate behavior that can show previous branch after workspace switch.

# 70. Workspace Switch Behavior
- Changing active branch through existing workspace mechanism must invalidate/reload order queue.
- Do not retain prior branch queue after switch.
- Selected order detail from previous branch must close or revalidate.
- Cursor from previous branch cannot authorize data in new branch.
- UI should not mix branch headings/data.

# 71. Session Revocation Behavior
- New queue request after membership/session revocation fails through existing identity boundary.
- Cached client data may remain visible until navigation/refresh; avoid persistent offline storage of operational order data in R01.
- Do not save order queue to localStorage.
- Do not persist order details to IndexedDB.
- R01 does not build offline staff operations.

# 72. Legacy Demo State Boundary
- Global demo state may still exist for unfinished modules.
- Server queue must be labeled by architecture, not necessarily by visible UI text.
- Do not merge durable orders into demo persistence.
- Do not write durable order IDs into demo state as mutable copies.
- Avoid dual-write from server to demo store.
- Avoid client reconciliation that makes local state authoritative.
- R01 should make one clear read owner for Orders tab.

# 73. Existing Accept/Reject UI
- Current UI contains buttons/actions.
- R01 must audit whether those controls are reachable for server queue rows.
- If reachable, disable or remove them for server queue rows.
- Do not route them to local demo actions.
- R02 will establish real commands.
- UI copy may say action availability follows next operational round only if product-friendly; internal phase names need not be exposed.
- Prefer simply read-only detail without action controls until command path exists.

# 74. Existing Changed Status
- Client demo includes `CHANGED` handling.
- Do not assume `CHANGED` is a current durable order status.
- Audit actual schema constraint/enum.
- If persisted legal status exists, include it in read union.
- If it is demo-only, omit from server queue contract.
- R04 may later define operational edit status semantics.

# 75. Queue New-Order Indicator
- Indicator is derived from durable order state/time, not client event history.
- R01 may use count of `PENDING_CONFIRMATION` orders.
- Do not create persistent notification-read state unless required.
- Do not introduce realtime event infrastructure.
- Indicator count must be branch-scoped.
- Count query may be combined with list response.
- Avoid a second expensive full scan.

# 76. Queue Summary Contract
```ts
export interface OperationalOrderQueuePage {
  readonly orders: readonly OperationalOrderQueueItem[];
  readonly nextCursor: string | null;
  readonly totalVisible?: number;
  readonly incomingCount: number;
}
```
- `totalVisible` is optional because exact total count can be expensive.
- `incomingCount` can be exact bounded status count when needed for badge.
- Do not report cross-branch counts.
- Do not expose tenant-wide counts on branch queue.

# 77. Status Presentation Mapping
- Mapping lives in operational/presentation layer, not database query.
- Persisted state remains canonical.
- UI label may be human-friendly.
- Unknown state gets neutral safe presentation.
- R01 does not create transition controls from presentation mapping.
- Customer-facing status mapping remains separate.
- Internal status and customer status should not be conflated.

# 78. Detail Snapshot Semantics
- Use persisted order item name snapshot.
- Use persisted unit price snapshot.
- Use persisted line total snapshot.
- Use persisted modifier snapshot.
- Current menu rename must not alter staff view of historical submitted order.
- Current price change must not alter staff view.
- Archived menu item must not make order detail fail.
- This preserves Phase 03 historical correctness.

# 79. Queue Source of Truth Invariant
```text
STAFF ORDER QUEUE AUTHORITY = foodflow.orders + durable child snapshots
CLIENT DEMO STORE AUTHORITY = NO
CUSTOMER CAPABILITY AUTHORITY = NO
CURRENT MENU AUTHORITY FOR HISTORICAL SNAPSHOT = NO
```
- This invariant is the central R01 outcome.

# 80. API Response Shape
```json
{
  "ok": true,
  "data": {
    "orders": [],
    "nextCursor": null,
    "incomingCount": 0
  }
}
```
- Use repository-standard envelope if one already exists.
- Error shape must be stable.
- Do not include stack trace.
- Do not include SQL error message.
- HTTP route is internal but still treated as untrusted-client boundary.

# 81. HTTP Status Semantics
- `200` for successful queue read.
- `200` with empty orders for no matching rows.
- `400` for malformed filters/cursor.
- `401` or existing redirect/session behavior for unauthenticated API according to current internal API convention.
- `403` for authenticated permission denial when existing internal API convention uses it.
- `404` for scoped detail selector not found.
- `503` for classified unavailable dependency where appropriate.
- Avoid `500` with raw internals for expected validation/auth failures.

# 82. CSRF Boundary
- GET read endpoint does not mutate state.
- Same-origin protections may follow existing internal API policy.
- Do not add mutation disguised as GET.
- Future R02 mutation routes require separate CSRF/same-origin treatment.
- R01 must not preload mutations.

# 83. SQL Injection Boundary
- Use Kysely parameter binding.
- Status/source/mode values are validated enums.
- Cursor fields are parsed typed values.
- No concatenated ORDER BY from user text.
- Map allowed sort modes explicitly if sort becomes configurable.
- R01 default sort is fixed.

# 84. Accessibility: Queue
- Table/list has semantic headings.
- New order count is not conveyed by color alone.
- Status has readable text.
- Loading state announced.
- Error state announced.
- Interactive row/detail control is keyboard accessible.
- Disabled mutation controls, if retained, expose disabled semantics.
- Avoid auto-focus jumps on refresh.

# 85. Responsive Behavior
- Preserve current staff mobile/tablet usability.
- Queue cards should not require desktop width.
- Detail modal/drawer remains usable on small screens.
- Long order numbers truncate visually but remain accessible.
- Item names wrap.
- Prices remain aligned/readable.
- R01 does not redesign entire operations shell.

# 86. Localization Boundary
- Existing staff UI language remains current product choice.
- Do not introduce broad localization system.
- Timestamp formatting should reuse established Bangkok/local formatting helpers where intended.
- Persisted timestamps remain UTC/timestamptz.
- Money formatting uses existing currency helper when compatible with minor-unit DTO.
- Do not hard-code THB if durable currency can vary.

# 87. Timezone Contract
- Database timestamp authority remains timezone-aware.
- API serializes ISO.
- Staff display uses configured/local business timezone helper.
- Waiting duration uses timestamp difference.
- Do not store formatted local time in database.
- Do not compare localized strings for ordering.

# 88. Unit Test Matrix — Filter Validation
- valid default filter accepted.
- valid single status accepted.
- valid multiple statuses accepted.
- duplicate statuses canonicalized or rejected consistently.
- unknown status rejected.
- valid source accepted.
- unknown source rejected.
- valid mode accepted when mode filter supported.
- unknown mode rejected.
- valid ISO start time accepted.
- invalid start time rejected.
- end before start rejected or normalized according to explicit contract.
- limit zero rejected.
- negative limit rejected.
- over-maximum limit rejected/clamped according to explicit contract.
- malformed cursor rejected.

# 89. Unit Test Matrix — Mapping
- order UUID preserved.
- order number preserved.
- status mapped exactly.
- customer status preserved separately.
- submitted timestamp serialized.
- subtotal minor preserved as string.
- currency preserved.
- null table handled.
- table label mapped.
- item count computed according to chosen semantics.
- customer note not leaked into queue summary.
- detail customer note mapped safely.
- item snapshot names preserved.
- modifier snapshot names preserved.
- negative/invalid persisted monetary invariant handled safely.

# 90. Unit Test Matrix — Cursor
- encode/decode round trip.
- cursor includes stable timestamp/id tuple.
- malformed base64/json rejected if such encoding is used.
- missing fields rejected.
- invalid UUID rejected.
- invalid timestamp rejected.
- cursor does not carry branch authority.
- cursor does not carry tenant authority.
- cursor from prior filter cannot create scope escalation.

# 91. Integration Test Matrix — Authorized Read
- staff with active membership and `order.view` reads own branch order.
- order contains current Phase 03 submitted row.
- queue returns canonical order number.
- queue returns PENDING_CONFIRMATION.
- queue returns correct subtotal/currency.
- queue returns table context.
- detail returns item snapshots.
- detail returns modifier snapshots.
- detail does not query current menu for historical price.

# 92. Integration Test Matrix — Cross-Branch
- Tenant A Branch A1 staff reads A1 order.
- same actor with no A2 branch authority cannot query A2 through parameter.
- A2 order absent from A1 queue.
- direct A2 order UUID detail under A1 context returns not found.
- switching to legitimately authorized A2 context can read A2.
- stale A1 cursor under A2 does not return A1 data.

# 93. Integration Test Matrix — Cross-Tenant
- Tenant A staff cannot read Tenant B order.
- direct Tenant B UUID returns not found.
- filter cannot set Tenant B.
- crafted cursor cannot set Tenant B.
- aggregate count excludes Tenant B.
- logs do not expose Tenant B payload.

# 94. Integration Test Matrix — Permission
- staff route permission allowed + order view allowed = data read succeeds.
- staff route permission allowed + order view denied = data read denied.
- order view alone without valid internal session = denied.
- revoked membership = denied on new request.
- inactive membership = denied.
- missing branch when branch required = denied.
- unauthorized selected branch = denied.

# 95. Integration Test Matrix — Customer Separation
- valid customer capability cannot call internal order queue as staff.
- customer cookie alone does not satisfy Auth.js/internal session.
- internal route does not parse customer capability as actor identity.
- internal DB transaction does not use flow_customer_runtime.
- staff order response omits raw capability token.
- response omits customer replay key material.

# 96. Integration Test Matrix — Pagination
- first page deterministic.
- second page starts after cursor.
- no overlap between pages.
- stable tie-break for same submitted timestamp.
- new earlier/later order behavior documented.
- page size bounded.
- empty continuation returns empty + null cursor.
- filters preserved across cursor requests.

# 97. Integration Test Matrix — Failure
- database unavailable maps safe error.
- malformed persisted status maps safe invariant/unavailable behavior.
- missing child row behavior deliberate.
- missing table relation uses safe fallback.
- invalid detail UUID rejected before DB.
- unknown order returns not found.
- no fallback to demo state.

# 98. Database Test Matrix — Only If Migration Exists
- migration applies on fresh reset.
- new index exists with expected columns.
- index is tenant/branch scoped.
- new source constraint accepts legal values.
- illegal source rejected.
- backfill marks existing Phase 03 orders deterministically.
- public/anon/authenticated gain no order read grant.
- customer role gains no new staff-order read authority.
- internal branch RLS remains isolated.
- generated types reflect schema.

# 99. UI Test Matrix — Orders Tab
- loads server queue.
- renders empty state when none.
- renders incoming count.
- renders order number.
- renders table label/fallback.
- renders status.
- renders waiting time.
- renders subtotal/currency.
- opens detail.
- detail renders item/modifier snapshots.
- no demo order appears when server queue empty.
- mutation buttons do not mutate local-only state for server order.
- refresh reloads server data.
- error state offers retry.

# 100. E2E Matrix — When Deterministic DB Environment Is Available
- login as authorized staff.
- select authorized branch.
- create/seed submitted customer order through server fixture path.
- navigate `/staff#orders`.
- observe order in queue.
- observe correct branch/table/order number.
- open detail.
- observe persisted item snapshot.
- customer from another tenant absent.
- unauthorized staff denied.
- switching branch changes queue.
- R01 does not require hosted E2E to validate this specification document.

# 101. Regression — Phase 03 Customer Flow
- customer entry still works.
- capability issue/validation still works.
- storefront/menu reads still work.
- cart persistence still works.
- add/update/remove commands still work.
- submit still creates one PENDING_CONFIRMATION order.
- idempotent replay still returns original order.
- queue reads must not alter customer command output.
- no customer DB grant broadened.

# 102. Regression — Phase 02 Identity
- internal login still uses Auth.js.
- AccessContext still resolves actor/tenant/branch.
- route permission still protects `/staff`.
- `order.view` authorization still derives current role state.
- revoked memberships remain fail-closed.
- tenant/branch transaction context remains actor-bound.
- no legacy shared auth path restored.

# 103. Regression — Other Operations Tabs
- tables tab remains functional under existing state path.
- service tab remains functional under existing state path.
- ready tab remains functional under existing state path.
- menu tab remains functional under existing state path.
- kitchen page not redesigned.
- cashier page not redesigned.
- admin page not redesigned.
- any unavoidable shared component change is regression-tested.

# 104. Implementation Order — Step 1: Audit
- re-read current main spec.
- confirm implementation parent.
- inspect P03 acceptance record.
- inspect current order schema.
- inspect current order indexes.
- inspect internal RLS/grants.
- inspect staff page/layout.
- inspect `StaffOperations` order code.
- inspect permission catalog.
- inspect authorized transaction helpers.
- record actual source/mode schema evidence.
- decide whether migration is required.

# 105. Implementation Order — Step 2: Types
- create operational status type from actual legal persisted values.
- create source type from actual schema/product contract.
- create mode type only from actual schema/product contract.
- create queue filter type.
- create queue item DTO.
- create detail DTO.
- create item/modifier DTOs.
- create error types.
- create cursor type/internal codec if used.
- keep public types readonly.

# 106. Implementation Order — Step 3: Repository
- implement branch-scoped list query.
- implement aggregate counts.
- implement stable sort.
- implement cursor predicate.
- implement table join.
- implement detail parent query.
- implement child item batch query.
- implement modifier batch query.
- enforce tenant/branch predicates.
- add fixed query count.

# 107. Implementation Order — Step 4: Authorization Service
- call current AccessContext resolver.
- require branch.
- enter authorized transaction with `order.view`.
- validate filters before or safely within service boundary.
- call repository.
- map DTOs.
- map errors.
- avoid mutation.

# 108. Implementation Order — Step 5: Transport/Page
- choose server page loader or internal API pattern.
- reuse one service in all transports.
- secure transport independently from layout when applicable.
- wire initial queue data.
- wire refresh.
- wire detail fetch/load.
- keep filter URL/client state deterministic.
- prevent local demo mutations for server rows.

# 109. Implementation Order — Step 6: Database Change If Needed
- write one forward migration.
- add only proven index/source/policy changes.
- backfill deterministically.
- update DB tests.
- regenerate types.
- validate fresh reset.
- do not rewrite historical files.

# 110. Implementation Order — Step 7: Tests
- unit filter tests.
- unit mapper tests.
- unit cursor tests.
- integration authorized read tests.
- integration cross-branch tests.
- integration cross-tenant tests.
- integration permission tests.
- integration customer/staff separation tests.
- DB tests if schema/security changed.
- UI component tests if existing test stack supports them.
- relevant E2E if environment supports deterministic execution.

# 111. Implementation Order — Step 8: Regression
- run inherited identity tests.
- run inherited Phase 03 tests.
- run app lint.
- run typecheck.
- run unit/integration.
- run build.
- run DB reset/tests if DB touched or required by repository workflow.
- verify generated type drift if DB touched.
- inspect final diff for scope creep.

# 112. Validation Commands — Discover Before Running
- Use commands that exist in current package scripts/workflows.
- Do not invent validation commands.
- Implementation PR must record exact commands.
- Typical expected categories follow.

# 113. Validation — Dependency Install
```bash
npm ci
```
- Run from correct app/repository path according to current workflow.
- Dependency change is not expected.
- Lockfile should remain unchanged.

# 114. Validation — Lint
```bash
npm run lint
```
- Use actual package script.
- Do not suppress new warnings/errors to obtain PASS.

# 115. Validation — Typecheck
```bash
npm run typecheck
```
- Must cover new server module and DTOs.
- Must cover staff UI integration.

# 116. Validation — Tests
```bash
npm test
```
- Use actual repository test scripts rather than this placeholder when different.
- Ensure new operational tests are discovered.

# 117. Validation — Build
```bash
npm run build
```
- Next.js build must prove server/client boundary correctness.
- No server-only module may leak into client bundle.

# 118. Validation — Database
```bash
supabase db reset
```
- Required when migration/security DB change exists or repository workflow requires fresh DB proof.
- Follow current repository Supabase commands.
- Never point destructive reset at production.

# 119. Validation Result Vocabulary
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- Do not invent PASS.
- Document validation is separate from implementation CI.
- Required implementation failures remain truthful blockers.

# 120. Definition of Done — Architecture
- operational order module exists.
- module is server-only.
- branch-scoped internal authority is explicit.
- customer authority is not reused.
- queue source of truth is durable DB.
- UI no longer treats client demo order state as queue authority.
- no mutation architecture pulled forward.

# 121. Definition of Done — Data
- queue lists durable submitted orders.
- tenant scope enforced.
- branch scope enforced.
- stable order identity preserved.
- status mapped from durable state.
- table context safe.
- money uses durable snapshots.
- item/modifier detail uses historical snapshots.
- query count bounded.

# 122. Definition of Done — Authorization
- internal session required.
- route access remains protected.
- order view permission independently enforced.
- order manage not required for reads.
- cross-tenant denied.
- cross-branch denied.
- customer-only capability denied.
- revoked internal membership denied.

# 123. Definition of Done — UX
- Orders tab reads server data.
- loading state correct.
- empty state correct.
- error state correct.
- refresh correct.
- detail correct.
- no fake/sample fallback.
- no local-only mutation of server orders.
- responsive behavior preserved.
- accessibility preserved.

# 124. Definition of Done — Security
- no client tenant authority.
- no client branch authority.
- no bearer capability exposure.
- no raw session exposure.
- no SQL interpolation.
- no XSS injection path.
- no public order-table grant.
- no customer role privilege broadening.
- logs are redacted.

# 125. Definition of Done — Database
- no migration when unnecessary.
- any migration is forward-only.
- any source backfill deterministic.
- any index justified by queue shape.
- fresh reset works when DB changes.
- generated types consistent when DB changes.
- RLS/grants tests pass when DB changes.

# 126. Definition of Done — Tests
- filter tests exist.
- mapper tests exist.
- authorized queue integration exists.
- cross-branch denial exists.
- cross-tenant denial exists.
- permission denial exists.
- customer/staff separation exists.
- detail snapshot regression exists.
- relevant Phase 03 regressions pass.
- relevant Phase 02 identity regressions pass.

# 127. PR Evidence Requirements
- exact spec filename.
- Phase 04 / Round 01.
- implementation parent branch/ref and SHA.
- implementation head SHA.
- current main authority SHA used.
- file CREATE list.
- file MODIFY list.
- migration decision and evidence.
- source/mode schema audit result.
- queue query shape.
- authorization path.
- exact validation results.
- deferred R02 mutation scope.
- no implementation merge by agent.

# 128. PR Scope Declaration
```text
IMPLEMENTATION_PHASE=P04
IMPLEMENTATION_ROUND=R01
OPERATIONAL_ORDER_READ_PLANE=YES
SERVER_BACKED_STAFF_ORDER_QUEUE=YES
ORDER_VIEW_PERMISSION_ENFORCEMENT=YES
BRANCH_SCOPED_ORDER_READS=YES
DURABLE_ORDER_DETAIL_SNAPSHOTS=YES
CLIENT_DEMO_ORDER_QUEUE_AUTHORITY=NO
ORDER_ACCEPT_REJECT_MUTATIONS=NO
ORDER_LIFECYCLE_ENGINE=NO
ORDER_EDIT_CANCEL_WORKFLOW=NO
PRIORITY_DELAY_REMAKE_WORKFLOW=NO
KITCHEN_PRODUCTION_WORKFLOW=NO
PAYMENT_EXECUTION=NO
REALTIME_PUBLICATION=NO
NOTIFICATION_DELIVERY=NO
IMPLEMENTATION_AGENT_MERGE=NO
```

# 129. Explicit R01 Non-Goals
- no staff-created order submission.
- no accept order command.
- no reject order command.
- no auto-accept.
- no rejection reason persistence.
- no payment prerequisite evaluation.
- no preparing transition.
- no ready transition.
- no served transition.
- no completed transition.
- no cancelled transition orchestration.
- no staff order edit persistence.
- no void/refund coordination.
- no priority mutation.
- no delay reason mutation.
- no remake creation.
- no kitchen ticket routing.
- no KDS redesign.
- no payment provider integration.
- no realtime websocket/event bus.
- no customer notification delivery.
- no generic outbox.
- no background worker platform.
- no broad store replacement.
- no full staff UI rewrite.

# 130. Failure Case — Missing Staff Session
- no queue data returned.
- follow existing authentication behavior.
- no customer session fallback.
- no demo fallback.
- log safe auth failure only according to existing identity behavior.

# 131. Failure Case — Missing Branch Context
- queue request fails closed.
- do not query tenant-wide orders.
- prompt/select branch through established workspace UX where applicable.
- API returns stable unavailable/forbidden behavior.

# 132. Failure Case — `order.view` Denied
- no order rows returned.
- no count returned.
- no detail existence disclosed.
- `/staff` shell may still be accessible depending on route permission but Orders data must remain denied.
- UI should render existing forbidden state or dedicated no-access state.

# 133. Failure Case — Database Unavailable
- map to safe operational unavailable error.
- do not fall back to demo data.
- do not cache error as empty queue.
- allow retry.
- do not expose connection string or SQL.

# 134. Failure Case — Malformed Cursor
- reject before query.
- return invalid-query error.
- no database scope changed.
- no partial data returned under a silently reset cursor unless contract explicitly chooses that behavior.

# 135. Failure Case — Unexpected Persisted Status
- do not enable actions.
- log safe invariant code.
- render neutral/unknown read state or fail detail safely.
- do not coerce to PENDING_CONFIRMATION.
- implementation choice must be tested.

# 136. Failure Case — Missing Table Row
- order remains readable.
- table label uses fallback such as stored ID/Unknown table according to UI contract.
- do not drop the order from queue.
- do not cross-join another tenant table by code/label.

# 137. Failure Case — Missing Child Items
- audit whether zero-item submitted order is impossible by Phase 03 contract.
- if invariant violation occurs, queue summary may still render with warning/unavailable detail.
- do not synthesize items.
- record invariant safely.
- no mutation occurs.

# 138. Failure Case — Workspace Switch Mid-Request
- request uses one resolved AccessContext.
- subsequent request resolves new context.
- client discards prior branch response if request identity/context changed before response is applied.
- do not merge responses from two branches.

# 139. Failure Case — Revocation After Page Load
- already rendered page cannot magically erase without refresh unless realtime auth invalidation exists.
- next server request must fail closed.
- do not persist queue offline.
- explicit refresh should enforce new permission state.

# 140. Recovery Path — Read Failure
- user may retry.
- retry re-resolves current AccessContext.
- retry re-evaluates order.view.
- retry does not mutate data.
- retry does not reuse stale branch authority from prior response.

# 141. Performance Test Cases
- 0 queue rows.
- 1 queue row.
- default page full.
- maximum page full.
- many child items on detail.
- many modifiers on detail.
- same submitted timestamp tie-break.
- status filter uses expected bounded plan.
- query count remains fixed.
- no memory blow-up from loading all historical orders.

# 142. Index Verification Cases
- explain/inspection demonstrates branch/time filter benefits when index added.
- index does not duplicate an existing equivalent index.
- index does not include sensitive unnecessary columns.
- fresh migration creates index deterministically.
- rollback path is normal migration rollback strategy, not production destructive command.

# 143. Source/Mode Compatibility Cases
- existing Phase 03 customer order maps correctly.
- null/unknown mode renders safely.
- future source enum has extensible version-safe mapping.
- API does not crash on a legal source added by later migration when server version is rolling if compatibility contract requires it.
- avoid premature exhaustive assumptions.

# 144. Rolling Deployment Safety
- Read module should tolerate current Phase 03 schema at deployment start.
- If migration adds nullable/backfilled field, deploy order must be backward compatible.
- Do not make app require a column before migration is present unless deployment system guarantees migration-first ordering and current project policy supports it.
- Prefer additive schema.
- Avoid destructive rename/drop in R01.
- Generated type/client compatibility must be considered.

# 145. Migration Rollback Safety
- R01 migration, if any, should be reversible logically without data loss.
- Index removal is safe rollback.
- Source column removal after populated production data is not a preferred rollback.
- Prefer forward-fix for data-bearing additions.
- PR must document recovery procedure.
- Never automate production rollback from this spec.

# 146. Operational Read Model Versioning
- Internal DTO is not a public external API.
- Still keep field names stable across R02–R06.
- Add fields backward-compatibly when possible.
- Avoid renaming status fields each round.
- Separate internal persisted status from display label.
- Keep detail/item snapshot contracts reusable by future mutation responses.

# 147. R02 Handoff Requirements
- R01 must leave a transaction-bound operational order repository.
- R01 must leave stable order detail read method.
- R01 must leave branch/tenant/permission isolation tests.
- R01 must leave UI queue reading durable records.
- R01 must leave no local-only acceptance path active for server rows.
- R02 can then add `acceptOrder` and `rejectOrder` commands without recreating read architecture.
- R02 should reuse AccessContext.
- R02 should reuse `order.manage` permission.
- R02 should reuse operational repository/DTOs.
- R02 should add actor/reason/timestamps and transition constraints.

# 148. R02 Must Not Assume
- R01 does not define final lifecycle engine.
- R01 does not define payment prerequisites.
- R01 does not define auto-accept policies.
- R01 does not define kitchen ticket creation.
- R01 does not define notifications.
- R01 does not define realtime.
- R02 spec must inspect actual R01 code before authoring.

# 149. Phase 04 Future Boundary — R02
- acceptance command.
- rejection command.
- actor identity capture.
- rejection reason.
- decision timestamp.
- branch permission.
- safe narrow database transition.
- race behavior for two staff decisions.
- no broad lifecycle yet.

# 150. Phase 04 Future Boundary — R03
- canonical status transition graph.
- order-level transition legality.
- item-level state where required.
- operational timestamps.
- customer-status projection.
- legal prepare/ready/served/completed semantics within order-control scope.
- concurrency/version guard.
- no kitchen production UI redesign unless separately authorized.

# 151. Phase 04 Future Boundary — R04
- staff edit.
- cancellation request handling.
- cancel/void semantic separation where payment state permits.
- before/after snapshots.
- reason capture.
- approval boundary when needed.
- conflict-safe edit behavior.
- no payment refund execution unless later exact scope authorizes it.

# 152. Phase 04 Future Boundary — R05
- priority.
- delay reason.
- stale-order detection.
- escalation metadata.
- remake coordination at order-control layer.
- remaining concurrency hardening.
- operational audit closure.
- no Phase 05 implementation pulled forward.

# 153. Phase 04 Future Boundary — R06
- integrated staff operational acceptance.
- customer submit → staff queue → decision → lifecycle proof.
- tenant/branch/permission negative acceptance.
- concurrency acceptance.
- acceptance record.
- next-phase fail-closed handoff.

# 154. Repository Contract Example
```ts
export interface OperationalOrderQueueRepository {
  list(filter: NormalizedQueueFilter): Promise<OperationalOrderQueuePage>;
  findDetail(orderId: string): Promise<OperationalOrderDetail | null>;
}
```
- Concrete class may bind transaction/context in constructor.
- Interface is optional if repository conventions favor class only.
- Do not add abstraction solely for abstraction.
- Main requirement is transaction/context binding and stable return model.

# 155. Normalized Internal Context Example
```ts
export interface OperationalOrderContext {
  readonly actorId: string;
  readonly tenantId: string;
  readonly branchId: string;
}
```
- Derive from AccessContext.
- Do not accept from HTTP body/query.
- Keep readonly.
- Do not include customer capability.
- Do not include broad role list unless repository needs it.
- Permission is enforced before repository access.

# 156. Cursor Internal Example
```ts
interface QueueCursorV1 {
  readonly v: 1;
  readonly submittedAt: string;
  readonly orderId: string;
}
```
- Version cursor if opaque encoded payload is used.
- Reject unsupported version.
- Cursor signature is optional because cursor is selector only and scope is re-applied server-side.
- If unsigned, treat all values as untrusted and validate.
- Do not encode tenant/branch as authority.

# 157. Queue SQL Shape Guidance
```sql
select
  o.id,
  o.order_number,
  o.status,
  o.customer_status,
  o.submitted_at,
  o.created_at,
  o.table_id,
  o.table_session_id,
  o.subtotal_minor,
  o.currency
from foodflow.orders o
where o.tenant_id = :trusted_tenant
  and o.branch_id = :trusted_branch
  and o.status = any(:validated_statuses)
order by o.submitted_at asc, o.id asc
limit :bounded_limit;
```
- Actual Kysely query should follow generated types.
- Do not copy SQL literally if schema names differ.
- Scope values come from AccessContext.
- Cursor predicate must be added consistently.

# 158. Detail SQL Shape Guidance
- Parent query by trusted tenant/branch/order ID.
- Item query by trusted tenant/order ID.
- Modifier query by trusted tenant and item IDs.
- Join tables using tenant composite keys where available.
- Avoid current menu price/name dependency.
- Result assembly preserves item order deterministically.

# 159. Table Join Guidance
- join `foodflow.tables` on tenant and table ID.
- include branch predicate where table schema contains branch.
- never join by table code alone across tenant.
- left join for historical resilience.
- select only label/code needed by queue.

# 160. Count Query Guidance
- item line count can be subquery/grouped aggregate.
- incoming count can be filtered count on same branch.
- exact total historical count is optional.
- avoid count over unbounded historical table if not needed.
- query plan should use branch/status index where available.

# 161. API Query Examples
```text
GET /api/internal/orders
GET /api/internal/orders?status=PENDING_CONFIRMATION
GET /api/internal/orders?limit=25&cursor=<opaque>
```
- Examples do not authorize arbitrary branch query.
- Detail path shape may differ.
- Internal endpoint remains authenticated.

# 162. Forbidden API Examples
```text
GET /api/internal/orders?tenantId=<uuid>
GET /api/internal/orders?branchId=<uuid>
GET /api/internal/orders?role=admin
```
- Do not support authority override parameters.
- Workspace selection is separate established mechanism.

# 163. Audit/Event Scope
- R01 is read-only and does not need a new domain audit event per page view by default.
- Existing authentication/access auditing remains untouched.
- Do not create high-volume order-view audit rows unless current compliance policy requires them.
- If audit logging exists for sensitive reads, follow existing pattern rather than invent new table.

# 164. Secrets / Environment
- No new secret expected.
- No new environment variable expected.
- Do not add database admin/service key for queue reads.
- Use existing database runtime configuration.
- Use existing Auth.js/session configuration.
- If implementation unexpectedly requires new env, stop and justify in PR/spec amendment rather than silently adding it.

# 165. Dependencies
- No new npm dependency expected.
- Use Kysely already present.
- Use existing validation approach rather than adding a new schema library solely for this round unless repository already standardizes one.
- Use existing UI components.
- Use existing date/currency helpers.
- Dependency churn is out of scope.

# 166. Frontend Component Boundary
- Prefer extracting order queue-specific component if current monolithic `StaffOperations` makes clean server data injection difficult.
- Extraction should be narrow.
- Do not refactor table/service/menu panels merely for style.
- Server DTO type may be imported into client as type-only if it does not import server runtime.
- Better: place transport-safe shared DTO types in a non-server submodule only if Next.js bundling requires it.
- Never import `server-only` module into client component.

# 167. Server/Client Type Boundary
- `server-only` files can export internal DB/domain types.
- Client-visible DTO type should live in a path safe for client type import.
- Avoid runtime import from server module in client bundle.
- `import type` is acceptable only when build proves no runtime leakage.
- If uncertain, create `src/modules/order-operations/types.ts` for transport DTOs and keep DB/repository in `/server`.
- Spec allows this layout adjustment.

# 168. Next.js Dynamic Behavior
- Internal queue page must not be statically generated with one branch’s data.
- Use dynamic server behavior where direct server render is selected.
- Route handler should avoid shared caching.
- User/branch-specific response must have private/no-store semantics according to current framework conventions.
- Validate build output does not pre-render sensitive queue.

# 169. Browser Store Interop
- Do not dispatch server orders into existing persistence reducer if that reducer can mutate them locally.
- Do not write server queue into localStorage.
- Maintain dedicated transient UI state for filters/selection.
- Selected order ID is safe selector.
- Detail is revalidated server-side.

# 170. Filter UI
- R01 may preserve simple incoming queue with no new filter controls if server API supports defaults.
- If filters are exposed, include only status/source/time controls needed for F04-T01.
- Do not build advanced saved views.
- Do not add priority filter before priority exists.
- Do not add payment filter before payment state integration is defined.
- Do not add kitchen station filter in R01.

# 171. Search Boundary
- Product F04-T01 does not require broad full-text search.
- Do not add database text search in R01 unless current staff UI already requires it for order number.
- Order-number exact/prefix search may be added only if bounded and indexed.
- Search must remain branch-scoped.
- Avoid `%term%` scans on large table without design.

# 172. Detail Selection Race
- User clicks queue row.
- Order may change status before detail loads.
- Detail should show current durable state.
- Do not force list snapshot status into detail.
- R01 has no mutation, so no lost update issue yet.
- R02 must revalidate status inside mutation transaction.

# 173. Customer Status Separation
- `status` is internal order status.
- `customer_status` is customer-facing projection/state.
- Queue primarily uses internal status.
- Staff detail may display customer status only if helpful.
- R01 must not set customer status.
- R03 may later define projection rules when lifecycle expands.

# 174. Submission Key / Idempotency Privacy
- Do not display `submission_key`.
- Do not display idempotency key digest.
- Do not display request fingerprint.
- These are internal reliability mechanics.
- Operational queue identity is order UUID/number, not replay key.

# 175. Customer Capability Privacy
- Do not display capability ID.
- Do not query capability bearer token because none should be persisted.
- Do not treat capability ID as customer identity.
- It remains ownership metadata from Phase 03.
- Future CRM/customer account linkage is separate scope.

# 176. Historical Orders
- R01 queue default focuses actionable orders.
- Detail query can read allowed historical branch orders if filter/route authorizes it.
- Do not delete history.
- Do not rewrite snapshots.
- Do not hide terminal records from future reporting schema.
- Full history/search/reporting is not R01 objective.

# 177. Draft Orders
- Customer draft orders should not appear in staff intake queue.
- They are not submitted operational work.
- Direct UUID access to draft through operational detail should be denied/not found unless there is a specific staff recovery use case later.
- R01 default contract excludes DRAFT.
- This preserves customer pre-submit privacy and workflow semantics.

# 178. PENDING_CONFIRMATION Orders
- Must appear.
- Must be oldest-first by default.
- Must be counted as incoming.
- Must be read-only in R01.
- Must preserve server order number.
- Must preserve submitted timestamp.
- R02 will make accept/reject actionable.

# 179. Terminal Orders
- Existing terminal status values should remain readable through explicit history filters if implemented.
- They should not appear in default incoming queue.
- R01 does not define terminal lifecycle.
- R01 must not mutate them.

# 180. Staff Review Modal
- Modal may reuse existing visuals.
- Data source changes to server detail.
- Summary must not depend on demo state table/menu maps for historical order item name/price.
- Table label can come from DTO.
- Action footer removed/disabled for server rows in R01.
- Close behavior unchanged.
- Loading detail state handled.
- Not-found after selection closes/shows safe state.

# 181. Queue Metrics
- Incoming metric derives server queue incoming count.
- Other metrics remain legacy until their own phases.
- Do not combine server order count with demo order count.
- Subtitle should avoid presenting mixed authoritative counts without clear separation.
- If existing subtitle includes service/ready demo counts, that is acceptable as legacy UI only if no false server claim is made.
- Prefer minimum change.

# 182. State Naming
- Avoid naming server queue `state.orders` in a way that collides with demo store.
- Use `operationalOrders`, `orderQueue`, or equivalent explicit names.
- Selected server order ID separate from selected demo order if both coexist.
- Better to remove demo order selection path from Orders tab.

# 183. Build Boundary
- `server-only` guard must remain effective.
- No database client bundled to browser.
- No auth server secret bundled.
- No generated server database runtime import in client output.
- Build validation must catch boundary violations.

# 184. Test Fixture Strategy
- Reuse deterministic seeded tenant/branch/users when possible.
- Reuse Phase 03 order creation helpers when possible.
- Prefer creating durable submitted order through actual command path for integration acceptance.
- Do not seed impossible status combinations.
- Cross-tenant fixtures must use distinct tenant IDs.
- Cross-branch fixtures must use same tenant sibling branch to prove branch scope separately.

# 185. Negative Test Principle
- Every positive queue read should have a corresponding scope denial where relevant.
- Authorization tests should not only assert HTTP code; also assert no row payload.
- DB tests should prove denied role cannot select when direct DB boundary is changed.
- Avoid tests that pass because fixture row is missing.
- Explicitly verify protected row exists under control context.

# 186. Query Invariant Tests
- submitted order has submittedAt.
- submitted order has currency.
- submitted order subtotal non-negative.
- order number non-empty.
- order items belong to same tenant/order.
- modifier rows belong to same tenant/item.
- missing relation handling deliberate.
- unknown status safe.

# 187. Security Review Checklist
- [ ] internal session only.
- [ ] active branch required.
- [ ] order.view required.
- [ ] tenant predicate.
- [ ] branch predicate.
- [ ] RLS preserved.
- [ ] customer role not broadened.
- [ ] no authority query params.
- [ ] UUID validation.
- [ ] cursor validation.
- [ ] enum validation.
- [ ] no raw SQL interpolation.
- [ ] no raw bearer/session logging.
- [ ] no XSS HTML rendering.
- [ ] no cross-branch cache.

# 188. Database Review Checklist
- [ ] current orders schema audited.
- [ ] current status constraint audited.
- [ ] current source/mode fields audited.
- [ ] current branch index audited.
- [ ] current RLS audited.
- [ ] current grants audited.
- [ ] migration necessity justified.
- [ ] no historical migration edit.
- [ ] generated types updated only if needed.
- [ ] fresh DB reset if DB changed.

# 189. UI Review Checklist
- [ ] server queue renders.
- [ ] demo queue authority removed.
- [ ] empty state real.
- [ ] loading state real.
- [ ] error state real.
- [ ] order detail server-backed.
- [ ] no local accept/reject/edit for durable rows.
- [ ] refresh works.
- [ ] branch switch reloads.
- [ ] responsive layout preserved.
- [ ] keyboard access preserved.

# 190. Test Review Checklist
- [ ] unit filter validation.
- [ ] unit DTO mapping.
- [ ] unit cursor.
- [ ] integration own branch.
- [ ] integration sibling branch denial.
- [ ] integration cross-tenant denial.
- [ ] integration permission denial.
- [ ] integration customer-session denial.
- [ ] integration detail snapshots.
- [ ] integration pagination.
- [ ] Phase 03 regression.
- [ ] Phase 02 identity regression.

# 191. Scope Review Checklist
- [ ] no accept/reject command.
- [ ] no lifecycle transition engine.
- [ ] no edit/cancel command.
- [ ] no priority/delay/remake.
- [ ] no kitchen workflow.
- [ ] no payment execution.
- [ ] no notification delivery.
- [ ] no realtime system.
- [ ] no dependency churn.
- [ ] no broad UI rewrite.

# 192. PR Validation Evidence Table
| Validation | Required record |
| --- | --- |
| Exact P04/R01 spec on main | PASS/FAIL with SHA |
| Implementation parent | branch/ref + SHA |
| Scope diff | reviewed changed files |
| npm install integrity | actual result |
| lint | actual result |
| typecheck | actual result |
| unit/integration tests | actual result |
| Next.js build | actual result |
| DB reset/tests | actual result when applicable |
| generated type drift | actual result when applicable |
| relevant E2E | actual result/NOT RUN |

# 193. Documentation Requirements in Implementation PR
- explain source-of-truth migration for Orders tab.
- explain chosen transport architecture.
- explain permission boundary.
- explain queue status default.
- explain cursor/pagination choice.
- explain migration/no-migration decision.
- explain any source/mode persistence decision.
- explain how local mutation controls were neutralized.
- explain known limitations.
- explain exact R02 handoff.

# 194. Known Expected Limitation After R01
- Queue is durable and server-backed.
- Staff decisions are still read-only.
- No realtime guarantee.
- Other staff tabs may still use demo store.
- Kitchen and cashier may still use demo state.
- These are deliberate phase boundaries, not R01 failures.
- Implementation must not hide them in PR.

# 195. R01 Acceptance Examples
```text
CUSTOMER SUBMITS ORDER
→ durable PENDING_CONFIRMATION order exists
→ authorized branch staff opens Orders queue
→ server authorized transaction reads same durable order
→ queue displays canonical identity/snapshots
→ staff can inspect but cannot mutate in R01
```
- This is the minimum vertical slice.

# 196. Cross-Branch Acceptance Example
```text
Tenant A / Branch A1 order
+ Tenant A / Branch A2 staff context
→ order absent / detail not found
```
- This proves branch isolation independently from tenant isolation.

# 197. Cross-Tenant Acceptance Example
```text
Tenant B order UUID
+ Tenant A staff context
→ not found
```
- No existence disclosure.

# 198. Permission Acceptance Example
```text
valid internal actor
+ valid active branch
+ operations.staff.access
- order.view
→ Orders data denied
```
- Route access is not data authorization.

# 199. Customer Separation Acceptance Example
```text
valid customer capability cookie
- Auth.js staff session
→ internal Orders queue denied
```
- No capability-to-staff escalation.

# 200. Final R01 Handoff Artifact Expectations
- implementation branch `p04-r01-operational-order-queue` or final equivalent exists.
- server operational-order module exists.
- durable queue read works.
- branch permission tests exist.
- staff Orders tab uses durable server queue.
- demo order authority removed from that tab.
- no server mutation exists for accept/reject/edit.
- PR is open for owner integration.
- R02 author can inspect exact queue/repository/transport implementation.

# 201. Required Next Specification
```text
FLOW_P04_R02_IMPLEMENTATION_SPEC.md
```
- R02 specification must be authored from actual R01 implementation state.
- R02 must inspect the exact operational repository and UI integration created by R01.
- R02 must not be authored solely from this future-handoff prose if R01 implementation materially differs.
- No R02 implementation starts until exact R02 spec exists on current `main` with `READY` status.

# 202. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P04/R01 implementation.
- Implementation progression follows current `FLOW_MERGE_POLICY.md`.
- Implementation agent must create a dedicated round branch from the latest legitimate implementation lineage.
- Implementation agent must not merge its implementation PR.
- Documentation branch is never implementation parent.

# 203. Final Acceptance Statement
- P04/R01 is READY as an executable specification document once present on `main`.
- R01 begins Phase 04 by establishing durable internal order intake/read authority.
- R01 converts the staff Orders queue from client-demo authority to branch-scoped server authority.
- R01 preserves Phase 03 customer ordering invariants.
- R01 preserves Phase 02 internal identity and authorization boundaries.
- R01 creates the reusable read substrate required for staff acceptance/rejection in R02.
- R01 deliberately does not implement order mutations, kitchen execution, payments, realtime, or notifications.
