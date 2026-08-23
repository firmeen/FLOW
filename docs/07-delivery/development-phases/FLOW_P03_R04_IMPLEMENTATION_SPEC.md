# FLOW P03 R04 — Implementation Specification
> Phase 03 — Core Server Data Plane + Customer Capability
> Round 04 — Customer Command Flow + Transactional Orchestration
> Revision — Turn validated CustomerContext + R02 data access + R03 durable persistence into one canonical server command layer with atomic mutation sequencing, safe error semantics, and explicit side-effect boundaries.

## Metadata
- Phase: `03`
- Round: `04`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P03_R03_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P03_R05_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P03 implementation slot after this spec is on main`
- Current planning scope: `PHASE 03 / ROUND 04 ONLY`
- Implementation parent: `latest completed P03/R03 implementation lineage tip`
- Expected implementation parent branch: `p03-r03-cart-order-persistence`
- Observed R03 branch head at authoring: `6d70dc6433cc1d6f643d365b2b906d648abb6e24`
- Observed R03 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Observed R03 implementation PR: `#70`
- Recommended implementation branch: `p03-r04-customer-command-flow`
- Recommended implementation PR title: `feat(customer): orchestrate cart and order commands`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Customer command orchestration in this round: `YES`
- Cart command endpoints/actions in this round: `YES`
- Order submission orchestration in this round: `YES`
- Atomic transaction sequencing in this round: `YES`
- Command failure/error mapping in this round: `YES`
- Generic idempotency/retry-key framework in this round: `NO — P03/R05`
- Payment execution in this round: `NO`
- Kitchen/realtime/notification side effects in this round: `NO — define boundary only`
- Production destructive DB mutation: `NO`

# 1. Authoring State
- Current `main` remains the only policy/specification authority.
- `FLOW_P03_R03_IMPLEMENTATION_SPEC.md` exists on `main` and is READY.
- R03 specification points `Next` to this canonical filename.
- No `FLOW_P03_R04_IMPLEMENTATION_SPEC.md` existed on `main` before this document was authored.
- No `p03-r04-*` implementation branch existed at authoring.
- Latest observed R03 implementation branch is `p03-r03-cart-order-persistence`.
- Latest observed R03 head is `6d70dc6433cc1d6f643d365b2b906d648abb6e24`.
- R03 is 16 commits ahead of R02.
- R03 contains durable cart persistence.
- R03 contains durable order persistence foundation.
- R03 contains customer capability ownership columns/constraints.
- R03 contains cart and order snapshot rules.
- R03 contains transaction-bound `CustomerCartRepository` and `CustomerOrderRepository`.
- R03 contains generated DB type updates.
- R03 contains forward-only migration and pgTAP/integration evidence.
- R03 implementation PR #70 explicitly hands R04 command sequencing and submitted-state transitions.
- This task remains documentation/specification only.
- This task does not create the R04 implementation branch.
- This task does not modify application/runtime/database code.
- This task does not merge an implementation PR.

# 2. Phase 03 Objective
- Phase 03 establishes the first durable customer-facing server data plane.
- R01 owns customer capability/session trust.
- R02 owns customer-safe server data access and transaction composition.
- R03 owns durable cart/order persistence.
- R04 owns customer command orchestration over those primitives.
- R05 owns idempotency, duplicate-submit resistance, retry/concurrency hardening.
- R06 owns end-to-end Phase 03 acceptance.
- Phase 03 must preserve tenant isolation.
- Phase 03 must preserve branch isolation.
- Phase 03 must preserve customer/staff authority separation.
- Phase 03 must prevent browser input from becoming canonical ownership/pricing authority.
- Phase 03 must expose a coherent command API that future UI/realtime/payment/kitchen layers can call safely.

# 3. Six-Round Phase Boundary
- R01: customer capability/session boundary.
- R02: customer server data-access layer.
- R03: durable cart/order persistence foundation.
- R04: command flow and transactional orchestration.
- R05: idempotency/retry/concurrency protection.
- R06: full customer data-plane acceptance.
- R04 must not reimplement R01 trust.
- R04 must not bypass R02 transaction/data-access architecture.
- R04 must not duplicate R03 persistence.
- R04 must not absorb generic R05 idempotency machinery.
- R04 must not start Phase 04 staff/realtime/kitchen work.

# 4. Why R04 Exists Now
- R03 created storage primitives but intentionally stopped before request-level command orchestration.
- Raw repository methods are not a public command contract.
- UI/API code must not directly sequence persistence writes ad hoc.
- Command sequencing must validate current capability before each mutation.
- Command sequencing must derive all ownership and pricing from trusted server/database state.
- Cart mutation and order submission need one consistent error/failure model.
- Cart-to-order conversion needs one transaction boundary.
- Terminal state transitions need one authoritative orchestration point.
- Side effects must not fire before durable transaction commit.
- Without R04, every route/server action would recreate the same rules differently.
- R04 therefore turns trusted context + repositories into a stable application command layer.

# 5. R04 High-Impact Objective
- Introduce one canonical customer command module.
- Require validated current CustomerContext for every customer mutation.
- Execute commands inside the R02/R03 customer data transaction boundary.
- Reuse R03 transaction-bound repositories.
- Make command inputs narrow and domain-specific.
- Reject browser-supplied tenant/branch/price/currency authority.
- Revalidate target cart/order ownership server-side.
- Revalidate mutable menu/modifier data where the command requires current availability.
- Ensure add/update/remove cart operations are atomic.
- Ensure order submission creates/uses draft order storage atomically.
- Ensure cart terminal transition and order submission metadata commit atomically.
- Ensure failed commands leave no partial persistence.
- Ensure command errors map deterministically to safe UI/API outcomes.
- Ensure no kitchen/payment/realtime side effect occurs before transaction commit.
- Leave generic replay/idempotency framework to R05.

# 6. R01 Trust Boundary to Preserve
- Customer capability remains separate from staff Auth.js.
- `CustomerContext` remains the only trusted customer scope input.
- Customer capability claims are server-validated before commands.
- Raw QR restaurant/table selectors are not authority.
- Browser cannot choose tenant.
- Browser cannot choose branch.
- Browser cannot choose capability identity.
- Browser cannot choose staff role/permission context.
- R04 must not introduce a customer login requirement merely to simplify commands.

# 7. R02 Data-Access Boundary to Preserve
- Customer database execution uses R02 transaction composition or final equivalent.
- Transaction-local role/context is established before repository access.
- Customer data repositories are server-only.
- Database context derives from CustomerContext.
- Repositories are transaction-bound.
- R04 orchestration may compose multiple repositories within one transaction.
- R04 must not instantiate a separate global DB client in route handlers.
- R04 must not set transaction-local tenant/branch context from body/query parameters.
- R04 must not grant customer runtime access to staff identity/RBAC/payment/audit surfaces.

# 8. R03 Persistence Boundary to Preserve
- `CustomerCartRepository` owns cart persistence methods.
- `CustomerOrderRepository` owns order persistence methods.
- Cart ownership derives from current customer database context.
- Order ownership derives from current customer database context.
- Price snapshots are captured from authoritative database state.
- Modifier snapshots are captured durably.
- One-cart-one-order storage invariant exists.
- DRAFT order state exists to support later submission orchestration.
- R03 customer runtime intentionally does not expose unrestricted order UPDATE authority.
- R04 must extend persistence narrowly where submitted-state transition requires it.

# 9. Actual R03 Cart Repository Evidence
- `CustomerCartRepository.createActive()` inserts cart ownership from `CustomerDatabaseContext`.
- It persists tenant ID from server context.
- It persists branch ID from server context.
- It persists table/table-session from server context.
- It persists capability ID from server context.
- `findById()` scopes cart by tenant and relies on RLS/context for deeper ownership enforcement.
- Cart item reads preserve item and modifier snapshots.
- Cart subtotal is recomputed from persisted integer minor-unit values.
- `addItem()` re-reads active menu item information from database.
- R04 must call this repository rather than duplicating SQL.

# 10. Actual R03 Order Repository Evidence
- `CustomerOrderRepository.persistDraft()` persists a DRAFT order.
- It validates item count/quantity/currency/snapshot shape.
- It can reference a source cart.
- It verifies source cart exists in current tenant and remains DRAFT.
- It generates opaque order UUID.
- It creates a temporary DRAFT order number.
- It stores customer capability ID from trusted context.
- It stores table/table-session from trusted context.
- It stores subtotal/currency/customer note.
- It snapshots order items and modifiers.
- It does not submit/finalize the order.
- R04 owns conversion from durable DRAFT to submitted initial business state.

# 11. Canonical Command Layer
- Introduce one server-only command module under customer/customer-data domain.
- Candidate namespace: `src/modules/customer-data/server/commands/`.
- Exact layout may adapt to current architecture.
- Avoid one giant command file when individual command ownership is clearer.
- Export only stable command functions through a narrow index.
- Route handlers/server actions consume commands, not repositories directly.
- UI components never import server repository classes.

# 12. Candidate Command Files to CREATE
- `commands/create-cart.ts` — get/create cart command where needed.
- `commands/add-cart-item.ts` — validate input + execute repository mutation.
- `commands/update-cart-item.ts` — quantity/request update orchestration.
- `commands/remove-cart-item.ts` — scoped removal.
- `commands/get-cart.ts` may remain query/service rather than command if read-only.
- `commands/submit-order.ts` — atomic cart → order submission orchestration.
- `commands/errors.ts` — command-layer error contract if existing CustomerDataError is insufficient.
- `commands/types.ts` — external command input/output contracts.
- `commands/index.ts` — narrow server-only exports.
- Consolidation is allowed when it reduces duplication without mixing unrelated responsibilities.

# 13. Candidate Route/Action Surface
- Existing customer page/server components may call server actions.
- Route handlers may be used when client-side mutation fetch flow already exists.
- Choose one primary mutation convention for this phase.
- Do not implement duplicate server action and REST route variants for every command without product need.
- Public endpoint paths must remain customer-specific.
- Internal staff routes must not invoke customer capability command paths as authorization shortcuts.

# 14. Command Input Principle
- Command input contains only mutable customer intent.
- Tenant ID is never accepted as command authority.
- Branch ID is never accepted as command authority.
- Table ID is never accepted as command authority unless used only for equality validation against context.
- Price is never accepted as authoritative command input.
- Currency is never accepted as authoritative command input.
- Order subtotal is never accepted as authoritative input.
- Capability ID is not accepted from body when server context already knows it.
- Cart/order IDs may be accepted as opaque selectors and revalidated.
- Menu item ID may be accepted as selector and revalidated.
- Modifier choice IDs may be accepted as selectors and revalidated.
- Quantity and customer free text may be accepted under strict bounds.

# 15. Canonical Command Result Principle
- Successful commands return minimal safe domain/read model.
- Avoid returning raw Kysely rows.
- Avoid returning internal DB role/context details.
- Avoid returning bearer capability material.
- Avoid returning hidden tenant metadata beyond current customer context display needs.
- Errors are typed internally and safely mapped at transport boundary.

# 16. Create/Get Active Cart Command
- Determine whether current product needs explicit create or lazy get/create behavior.
- Avoid creating one new cart per refresh.
- If an active cart selector is transported client-side, it is only a selector.
- Revalidate cart ownership each request.
- If no valid active cart exists, create one within customer transaction.
- If product requires at most one active cart per capability/table-session, enforce or document invariant.
- Do not silently adopt an active cart owned by another capability.
- Re-entry with a replacement capability follows R01/R03 ownership policy.

# 17. Add Cart Item Command
- Require current CustomerContext.
- Validate cart ID format.
- Validate menu item ID format.
- Validate quantity bounds.
- Validate modifier choice count bounds.
- Normalize optional special request.
- Begin one customer data transaction.
- Load repositories bound to same transaction/context.
- Revalidate target cart ownership/state.
- Revalidate menu item active state.
- Revalidate modifier selections through repository/current menu data.
- Capture current authoritative price snapshots through R03 persistence method.
- Insert cart item/modifiers.
- Return updated cart aggregate.
- Any failure rolls back all changes.

# 18. Update Cart Item Command
- Require current CustomerContext.
- Accept cart ID + cart item ID + allowed mutable fields.
- Revalidate cart ownership.
- Revalidate cart remains DRAFT.
- Revalidate target item belongs to target cart.
- Quantity must remain positive within bounds.
- Quantity zero should use explicit remove command unless product intentionally treats zero as remove.
- Changing menu item identity in-place should be prohibited; remove/add instead.
- Modifier replacement semantics must be explicit if R04 exposes them.
- If modifier edit is deferred, command must reject unsupported mutation rather than silently ignore.
- Return updated cart aggregate.

# 19. Remove Cart Item Command
- Require current CustomerContext.
- Revalidate cart ownership/state.
- Revalidate item belongs to cart.
- Delete child modifier rows safely via cascade or explicit repository behavior.
- Missing inaccessible item should map to not-found semantics.
- Repeating removal may return not-found unless R05 later introduces idempotent replay semantics.
- Do not claim replay-safe behavior in R04 unless it already naturally follows storage semantics.

# 20. Customer Note / Special Request Handling
- Trim leading/trailing whitespace.
- Define maximum character length.
- Reject or truncate? Prefer reject with deterministic validation error rather than silent data loss.
- Persist plain text only.
- Escape at rendering boundary; never treat customer text as HTML.
- Logs should not include full arbitrary customer note unless explicitly safe/redacted.
- Consider Unicode length semantics consistently.

# 21. Submit Order Command — Core Purpose
- Convert a valid current DRAFT cart into durable submitted order state.
- Use one transaction for all durable state changes.
- Do not call payment provider.
- Do not create kitchen ticket.
- Do not publish realtime event before commit.
- Do not send notification before commit.
- Do not implement generic idempotency key persistence yet.
- Do ensure database uniqueness/storage invariants prevent obvious duplicate cart conversion.

# 22. Submit Order Command — Required Sequence
- Resolve/validate current CustomerContext before transaction.
- Validate cart selector.
- Start one customer data transaction.
- Bind R03 repositories to transaction/context.
- Lock or otherwise stabilize source cart if current persistence design requires it.
- Load source cart through repository.
- Require cart status DRAFT.
- Require at least one cart item.
- Revalidate current table/table-session semantics as needed.
- Build order snapshot input exclusively from persisted cart aggregate and authoritative repository data.
- Persist DRAFT order using R03 order repository.
- Transition order from DRAFT to initial submitted state through narrow R04 persistence primitive.
- Set submission timestamp.
- Generate/finalize customer-facing order number according to current order-number strategy.
- Transition source cart to terminal/converted state.
- Commit transaction.
- Only after successful commit may post-commit hooks be scheduled/returned for future phases.

# 23. Order Initial Status Contract
- Determine existing canonical submitted initial order status from current schema.
- Do not invent a new status if existing `WAITING` or equivalent already represents accepted customer order.
- DRAFT exists only before submission.
- After command succeeds, customer-visible submitted order must not remain DRAFT.
- Initial customer status must be deterministic if schema separates internal/customer status.
- R04 owns only customer submission transition.
- Staff/kitchen operational transitions remain later phase scope.

# 24. Order Number Contract
- R03 uses temporary DRAFT order number strategy.
- R04 must decide whether submitted order requires business-facing sequence/format.
- Reuse existing sequence/function if present.
- If no stable production-safe number generator exists, add one narrowly.
- Never derive authorization from order number.
- Avoid guessable order number becoming customer data-access authority.
- Order UUID remains canonical selector/identity where security requires.
- Order number may be display/reference value only.

# 25. Source Cart Conversion Invariant
- One source cart must not produce multiple submitted orders.
- R03 unique source-cart storage invariant should be reused.
- R04 must map unique violation to deterministic conflict outcome.
- Do not expose raw SQL constraint name to client.
- If a draft order already exists because a previous in-flight transaction partially completed then rolled back, rollback should remove it.
- If a committed order already exists, command should fail safely; R05 will formalize replay response semantics.

# 26. Atomicity Contract
- Cart validation, order persistence, order submission transition, and cart terminal transition belong to one transaction.
- No partial submitted order if cart conversion fails.
- No terminal cart without durable corresponding order.
- No durable submitted order referencing still-editable source cart after success.
- No side effect before transaction commit.
- Repository errors propagate to command layer and trigger rollback.
- Command error mapping occurs after transaction abort where needed.

# 27. Transaction Nesting Rule
- Command opens/owns top-level customer transaction.
- Repositories receive transaction handle via existing repository factory.
- Repositories must not open independent nested transactions.
- Helper functions must accept transaction-bound repositories or transaction handle.
- Avoid calling a service that secretly starts another pool transaction inside command.
- This keeps rollback semantics deterministic.

# 28. Row Locking / Concurrency Boundary
- R04 must inspect R03 current locking/version behavior before implementing submit.
- Source cart submission requires protection against concurrent submit/update race.
- A `SELECT ... FOR UPDATE`-style lock or equivalent may be needed.
- If repository already exposes lock-aware method, reuse it.
- If not, add narrow repository method in R04-owned implementation.
- Avoid broad serializable transaction requirement unless evidence justifies it.
- R05 will own generalized concurrency/idempotency strategy, but R04 must prevent structurally unsafe simultaneous conversion.

# 29. Cart Mutation vs Submission Race
- Concurrent add/update/remove while submit is in progress must not corrupt final order snapshot.
- Submission should lock cart or establish stable version before snapshot.
- Cart mutation must detect terminal/non-DRAFT state after submit wins.
- If mutation wins first, submit should include committed mutation or re-read after lock.
- No lost update should silently produce impossible state.
- Tests must exercise at least one race scenario at storage/transaction level where feasible.

# 30. Menu Price Change During Cart Lifetime
- Cart item snapshots are authoritative persisted cart prices under R03 current design.
- R04 must define whether submit uses cart snapshots or reprices against current menu.
- Default for deterministic current architecture: order snapshot derives from persisted cart snapshot.
- If business requires reprice-at-submit, this must be explicit and tested, not accidental.
- Avoid hidden price changes between cart screen and order submission.
- Any unavailable-item validation at submit must not mutate price silently.

# 31. Menu Availability at Submission
- Decide whether an item added earlier but now inactive can still submit.
- Product-safe default may reject submission and ask customer to update cart.
- If repository stores only snapshots, current menu availability may need scoped revalidation.
- R04 should centralize that rule.
- Error result should identify cart invalidity without leaking internal data.
- Do not partially remove unavailable items automatically unless product explicitly requires it.

# 32. Table Session Revalidation
- If current CustomerContext carries table session, submit should revalidate it remains eligible.
- Closed table session should fail submission.
- A customer capability that R01 validation marks revoked should already fail before command.
- Avoid accepting stale capability merely because cart/order rows exist.
- Historical order remains durable even if table session later closes.

# 33. Command Error Taxonomy
- Reuse `CustomerDataError` where codes are sufficient.
- Add command-specific layer only when needed.
- Suggested categories:
- `CUSTOMER_COMMAND_INVALID_INPUT`.
- `CUSTOMER_COMMAND_NOT_FOUND`.
- `CUSTOMER_COMMAND_CONFLICT`.
- `CUSTOMER_COMMAND_CART_NOT_EDITABLE`.
- `CUSTOMER_COMMAND_CART_EMPTY`.
- `CUSTOMER_COMMAND_ITEM_UNAVAILABLE`.
- `CUSTOMER_COMMAND_CONTEXT_REVOKED`.
- `CUSTOMER_COMMAND_UNAVAILABLE`.
- Avoid exposing raw DB/constraint errors.

# 34. Transport Error Mapping
- Invalid input → 400-like semantics.
- Missing/revoked customer context → re-entry/unauthorized-like customer flow.
- Inaccessible resource → 404-like semantics to reduce enumeration.
- Terminal/conflicting cart → 409-like semantics.
- Item unavailable → deterministic domain error suitable for cart refresh.
- Infrastructure unavailable → 503-like semantics without stack trace.
- Exact HTTP codes may adapt to server-action transport conventions.
- UI should receive stable error code/message key, not raw exception text.

# 35. Enumeration Resistance
- Wrong tenant cart ID should not reveal another tenant exists.
- Wrong branch cart ID should not reveal sibling branch data.
- Other customer cart ID should not reveal owner metadata.
- Other customer order ID should not reveal order existence.
- Error timing should not unnecessarily expose resource class where avoidable.
- Logs may contain internal correlation IDs but not bearer secrets.

# 36. Validation Layering
- Transport parses primitive shape.
- Command validates domain intent.
- Repository validates storage-level invariants.
- Database constraints/RLS enforce defense in depth.
- Do not put every rule only in UI.
- Do not rely only on TypeScript types for untrusted request data.
- Do not rely only on database constraint error for normal domain validation when deterministic error can be produced earlier.

# 37. Schema Validation Library Decision
- Reuse existing repository validation convention if one exists.
- Do not add a new schema-validation dependency solely for R04 unless current code benefits materially.
- Hand-written narrow validators are acceptable for small command inputs.
- If Zod or equivalent already exists and is canonical, reuse it.
- Dependency changes must be justified and reflected in lockfile/validation.

# 38. Command Authorization Boundary
- Customer command authorization is capability/scope-based, not staff permission-based.
- Do not call `private.actor_has_permission()` for anonymous customer commands.
- Do not fabricate staff actor UUID.
- Do not reuse internal `AccessContext`.
- Customer context + customer RLS/repository ownership is the authority chain.
- Internal staff mutation commands remain separate.

# 39. Customer Runtime Database Grants
- R04 may need narrow UPDATE grant/function for order DRAFT→submitted transition.
- Extend `flow_customer_runtime` only for exact required columns/operation if possible.
- Do not grant unrestricted order lifecycle UPDATE.
- Do not grant kitchen ticket mutation.
- Do not grant payment mutation.
- Do not grant audit mutation unless a narrow future mechanism requires it.
- Direct public/anon/authenticated grants remain prohibited.

# 40. Narrow Order Submission Persistence Primitive
- Add repository/database function to transition only owned DRAFT order to submitted initial state.
- Require current tenant/branch/capability ownership through RLS/context.
- Require submitted_at currently null.
- Require status DRAFT.
- Require valid initial target status.
- Set submitted_at server/database-side.
- Set final order number atomically if required.
- Return affected order or deterministic no-row/conflict signal.
- Do not expose generic arbitrary status update.

# 41. Narrow Cart Conversion Primitive
- R03 repository may already expose terminal transition method.
- Audit exact allowed values.
- R04 should use a method specifically representing converted/submitted cart state.
- Do not expose arbitrary status string from command input.
- Transition only from DRAFT.
- Transition failure must abort whole submission transaction.

# 42. Order Draft Creation Input
- Build from persisted cart aggregate.
- Copy cart item snapshots.
- Copy modifier snapshots.
- Copy quantity.
- Copy unit price minor.
- Copy currency.
- Copy special request.
- Copy preparation station snapshot if required.
- Copy customer note from normalized command input.
- Do not query browser for these snapshots.

# 43. Order Total Contract
- Order subtotal derives from snapshot item line totals.
- Do not trust client subtotal.
- Ensure all items use one currency.
- Reject impossible negative total.
- Tax/service/discount/payment total remains outside R04 unless existing schema requires zero/default semantics.
- Any total fields required by current schema must be deterministic and documented.

# 44. Special Request and Customer Note Distinction
- Item `special_request` belongs to item snapshot.
- Order `customer_note` belongs to aggregate.
- Do not concatenate these fields.
- Each has separate length bound.
- Both are untrusted text for rendering/logging purposes.
- Future kitchen phase may consume item requests but R04 does not route them.

# 45. Command Logging / Observability
- Log command type at debug/info according to current logging convention.
- Log correlation/request ID if available.
- Log cart/order UUID only when acceptable under privacy policy.
- Never log capability token/cookie.
- Never log full customer free-text by default.
- Never log secrets.
- Domain conflict/error codes may be logged.
- Avoid logging raw SQL exceptions to client-facing output.

# 46. Audit Event Boundary
- Customer order submission is business-significant.
- If an existing safe audit/event mechanism already exists and customer runtime can use it transactionally, implementation may record narrow event.
- Do not broaden customer runtime audit table write grants casually.
- If no safe mechanism exists, define future handoff instead of bypassing least privilege.
- R04 core DoD does not require a new generic event bus.

# 47. Side-Effect Ordering Rule
- Durable database state commits first.
- Payment execution: deferred.
- Kitchen ticket creation: deferred.
- Realtime publish: deferred.
- Notification: deferred.
- Analytics emission: may be best-effort after commit only if existing safe mechanism exists.
- No external call inside critical DB transaction unless strictly necessary; none is expected in R04.

# 48. Post-Commit Hook Contract
- Command result may include stable information later phases can use.
- Do not create fake event queue infrastructure in R04.
- If current code has after-commit callback mechanism, reuse carefully.
- Otherwise leave side-effect invocation for later phase that owns it.
- R04 must not return success until durable transaction commits.

# 49. Client Mutation Surface
- Customer UI should call command transport rather than mutate local-only canonical cart state.
- Optimistic UI may remain future/optional.
- Server response becomes authoritative persisted cart/order result.
- Browser refresh should reconstruct state from server persistence where route supports it.
- Do not introduce a second client cart model divergent from server aggregate.

# 50. Cart UI Integration Boundary
- R04 may wire existing cart UI to server commands if necessary to prove command flow.
- Avoid broad visual redesign.
- Preserve current compact cart/card direction where already implemented.
- Loading state required during mutation.
- Error state required on failure.
- Disabled controls while exact request is in-flight may reduce accidental double clicks but are not idempotency authority.
- R05 still must handle duplicate/retry at server level.

# 51. Order Confirmation Boundary
- On successful submission, UI may navigate to order confirmation/status route if existing.
- If no stable order status page exists, return order confirmation data without inventing Phase 04 realtime dashboard.
- Do not expose staff/kitchen status controls to customer.
- Customer-visible initial status must be safe.

# 52. Direct API Bypass Prevention
- Every mutation transport invokes canonical command.
- No route performs direct repository SQL shortcut.
- No client-side hidden field can bypass CustomerContext resolution.
- No endpoint accepts arbitrary tenant/branch.
- Tests should call route/action directly without UI to prove enforcement.

# 53. CSRF / Same-Origin Boundary
- Customer capability may be cookie-backed.
- State-changing route handler must use non-GET method.
- Reuse framework same-origin/CSRF protections.
- Validate origin where current architecture requires it.
- Do not place capability bearer token in URL.
- R04 should not weaken R01 cookie settings.

# 54. Input Size / Resource Safety
- Cart item quantity bounded.
- Modifier list bounded.
- Special request length bounded.
- Customer note length bounded.
- JSON body size should remain naturally small; add explicit route-level guard if current framework requires.
- Avoid command input arrays large enough to create unbounded SQL/CPU work.
- Submit command builds from persisted cart rather than accepting arbitrary 1000-item order body.

# 55. Empty Cart Submission
- Must fail deterministically.
- No DRAFT order persists after failure.
- Cart remains editable DRAFT.
- Return domain error suitable for UI.
- Test at command and integration layer.

# 56. Terminal Cart Mutation
- Add/update/remove against converted/terminal cart must fail.
- Do not silently reopen terminal cart.
- Do not create new active cart implicitly inside mutation of old cart ID.
- UI may prompt refresh/new cart separately.

# 57. Invalid Menu Item Mutation
- Unknown/inaccessible menu item should map to safe unavailable/not-found error.
- Archived/inactive item should not be addable.
- Cross-tenant menu item ID must not leak existence.
- Wrong restaurant menu item must fail.
- Wrong branch availability must fail where current availability model requires branch scope.

# 58. Modifier Validation
- Selected modifier group must belong to menu item.
- Selected choice must belong to allowed group.
- Min/max selection constraints should be enforced where R03 repository/current menu model supports them.
- Duplicate choice semantics must be explicit.
- Inactive/archived modifier choice must fail if current schema tracks it.
- Price delta captured server-side.

# 59. Quantity Update Rules
- Integer only.
- Minimum 1.
- Maximum repository-defined bound.
- Zero uses remove command if desired.
- Negative always invalid.
- Non-number/NaN invalid.
- No fractional quantity unless current product explicitly supports it; current FoodFlow item count is integer.

# 60. Cart Aggregate Read After Mutation
- Mutation should return newly committed aggregate or command result sufficient to refresh it.
- If read occurs within transaction, returned state reflects pending transaction and is valid only if commit succeeds.
- Do not send result before transaction commit.
- If framework returns after transaction callback completes, commit semantics are naturally preserved.

# 61. Error Recovery — Validation Failure
- No transaction mutation.
- UI retains existing cart state.
- User corrects input.
- No retry delay required.

# 62. Error Recovery — Conflict
- Refresh cart/order server state.
- Surface stale/terminal conflict.
- Do not retry blindly in R04.
- R05 may add conflict-aware retry semantics where safe.

# 63. Error Recovery — Database Unavailable
- Roll back transaction.
- Return generic unavailable error.
- Keep browser state non-authoritative.
- Allow manual retry.
- Never return partial success.

# 64. Error Recovery — Capability Expired/Revoked
- Stop before mutation when possible.
- Clear/replace customer capability according to R01 flow.
- Redirect/re-enter QR context as appropriate.
- Do not attempt command with staff auth fallback.

# 65. Error Recovery — Cart Already Converted
- Return conflict/not-editable.
- If submitted order can be safely found under current context, UI may navigate to it only if repository contract supports customer visibility.
- Do not expose another customer's order through source-cart lookup.
- Generic replay-return-existing behavior remains R05 design unless naturally safe.

# 66. Failure Recovery — Partial Draft Order
- In one transaction, partial draft rows roll back automatically.
- Tests must prove no orphan order_items/modifiers after induced failure.
- If failure occurs after commit but before transport response, durable order may exist; R05 idempotency will address safe retry/recovery.
- R04 must document this distinction rather than pretending network delivery is atomic with DB commit.

# 67. R05 Boundary — Why Idempotency Is Deferred
- Network retry after committed submit can repeat request.
- Double-click can create concurrent requests.
- R03 uniqueness may prevent duplicate source-cart orders but response semantics may still be ambiguous.
- R05 will introduce request identity/deduplication/replay result rules.
- R04 should keep command signatures compatible with future idempotency wrapper.
- Do not bake random ad hoc dedupe tokens into each route now.

# 68. R05 Compatibility Contract
- Commands should accept an execution context extensible with future idempotency metadata.
- Core command logic should be separable from transport.
- Repository calls should occur within a transaction supplied by orchestration wrapper.
- Avoid hidden global mutable state.
- Avoid side effects inside command before commit.
- This lets R05 wrap submit/mutations consistently.

# 69. Command Function Signature Pattern
```ts
async function submitCustomerOrder(
  input: SubmitCustomerOrderInput,
): Promise<SubmitCustomerOrderResult>
```
- Function obtains/receives current customer context through canonical server helper.
- Alternative dependency-injected variant is acceptable for tests.
- Do not expose `tenantId`, `branchId`, `capabilityId` in public input type.

# 70. Dependency Injection for Tests
- Pure validators can be tested directly.
- Command orchestrators may accept internal dependency object/factory for unit tests.
- Default dependencies use real current-context + customer transaction + repositories.
- Avoid dependency injection complexity that obscures production path.
- Integration tests must still cover real DB path.

# 71. Command Repository Composition Pattern
```ts
withCurrentCustomerDataTransaction(async ({ context, repositories }) => {
  // validate resource state
  // mutate through repositories
  // return domain result
});
```
- Exact API may adapt to R02 implementation.
- Do not duplicate context resolution inside each repository.
- Do not create multiple transactions in one command.

# 72. Current Customer Context Helper
- Reuse R01 `getCurrentCustomerContext()` or final equivalent.
- Missing context produces customer entry/recovery semantics.
- Invalid/expired/revoked context fails closed.
- Do not decode capability directly in command modules if canonical validator exists.

# 73. Context Freshness
- R01 validation revalidates scope against current server/DB state.
- R04 should call current context once per command request.
- Database RLS remains defense in depth during transaction.
- Do not cache validated context across unrelated requests in process-global memory.

# 74. Database Migration Need in R04
- Prefer no schema change if R03 already supports submitted transition safely.
- Add forward-only migration only for missing narrow grants/constraints/functions/indexes required by command correctness.
- Historical R03 migration must not be edited.
- Migration must not add generic idempotency table; R05 owns that.
- Generated types updated if schema changes.

# 75. Likely Database Changes
- narrow customer runtime order submission UPDATE/function grant.
- final order-number generator if current baseline lacks safe mechanism.
- submitted-state constraint tightening if R03 intentionally left DRAFT bridge.
- cart converted-state transition support if not already complete.
- supporting index only if command query path requires it.
- no broad schema redesign.

# 76. Database Constraint Requirements
- non-DRAFT submitted order requires submitted_at.
- submitted order requires stable order number.
- source_cart relationship remains unique where one-cart-one-order invariant holds.
- terminal cart status valid canonical enum/value.
- impossible negative totals remain rejected.
- ownership columns remain non-null as appropriate.

# 77. RLS Requirements for Submission
- Customer can transition only its own order.
- Same tenant required.
- Same branch required.
- Same customer capability/session ownership required under current model.
- Source cart ownership required.
- Customer cannot update arbitrary submitted order fields after submission.
- Customer cannot transition to kitchen/staff-only states.
- Staff policies remain separate.

# 78. Column-Level/Narrow Function Preference
- If PostgreSQL direct UPDATE grant is too broad, prefer SECURITY DEFINER function for exact DRAFT→submitted transition.
- Fixed `search_path` mandatory.
- Validate current tenant/branch/capability via transaction-local context.
- Revoke function from public/anon/authenticated.
- Grant execute only to `flow_customer_runtime`.
- Do not accept tenant ID parameter from caller if transaction context can provide it safely.

# 79. Order Number Generator Security
- Function must not need broad customer table access beyond sequence/insert/update operation.
- Sequence gaps are acceptable if standard transactional/sequence semantics create them.
- Uniqueness enforced by database.
- Formatting deterministic.
- Avoid using predictable number as authorization token.

# 80. Database Index Audit
- source_cart unique index exists from R03.
- ownership lookup indexes should support tenant + capability + id as needed.
- cart/item child indexes should support aggregate loading.
- order lookup should not require full-table scan.
- Add only evidence-driven indexes.

# 81. Unit Tests — Input Validators
- invalid UUID selector.
- quantity zero.
- quantity negative.
- quantity above max.
- excessive modifiers.
- oversized special request.
- oversized customer note.
- malformed command body.
- unsupported fields ignored or rejected according to parser policy.

# 82. Unit Tests — Error Mapping
- CustomerDataError invariant → stable command invalid code.
- resource not found → not-found.
- terminal state → conflict/not-editable.
- DB unavailable → unavailable.
- raw error must not leak to public result.

# 83. Unit Tests — Submit Mapping
- cart aggregate converts to PersistDraftOrderInput correctly.
- menu/item/modifier snapshots copied exactly.
- subtotal/currency preserved.
- customer note normalized.
- no tenant/branch input accepted.
- no browser price used.

# 84. Integration Tests — Add Item
- valid item adds.
- wrong-tenant item denied.
- wrong restaurant item denied.
- inactive item denied.
- invalid modifier denied.
- other customer's cart denied.
- terminal cart denied.
- rollback on modifier insert failure.

# 85. Integration Tests — Update/Remove
- valid quantity update.
- other cart item denied.
- terminal cart denied.
- remove deletes relevant child modifiers.
- aggregate reload correct.
- failed mutation leaves original data.

# 86. Integration Tests — Submit Happy Path
- valid DRAFT cart with items.
- one transaction.
- order created from cart snapshots.
- order initial submitted status correct.
- submitted_at set.
- final order number set.
- source_cart_id set.
- cart transitions terminal/converted.
- order items/modifiers snapshots match cart.
- subtotal/currency match.

# 87. Integration Tests — Submit Failure
- empty cart denied.
- other customer cart denied.
- wrong branch denied.
- revoked/expired capability denied before write.
- unavailable item behavior according to selected rule.
- already converted cart conflict.
- induced order item failure rolls back order and cart transition.
- induced cart transition failure rolls back submitted order.

# 88. Integration Tests — Race
- two concurrent submit attempts against same cart.
- at most one submitted order persists.
- no duplicate source cart conversion.
- losing request receives safe conflict/error.
- exact replay-return behavior deferred to R05.
- concurrent cart mutation vs submit cannot create impossible mixed snapshot.

# 89. Database Tests — Grants
- public cannot execute submission function.
- anon cannot execute submission function.
- authenticated cannot execute submission function.
- `flow_customer_entry` cannot execute customer mutation function.
- `flow_customer_runtime` can execute only required mutation function.
- customer runtime cannot mutate payment/kitchen/audit tables.

# 90. Database Tests — RLS
- same context own cart allow.
- other capability deny.
- sibling branch deny.
- cross tenant deny.
- wrong table deny where policy includes table scope.
- DRAFT own order allowed only required operation.
- other order denied.
- arbitrary submitted-state update denied.

# 91. Database Tests — Constraint
- submitted order without submitted_at rejected.
- duplicate source_cart order rejected.
- invalid status rejected.
- invalid total rejected.
- ownership mismatch rejected.
- terminal cart illegal backward transition rejected if DB enforces transition function.

# 92. Regression Tests — R01
- customer capability validation still works.
- stale/revoked capability remains denied.
- staff Auth.js remains independent.
- customer cookie isolation remains.

# 93. Regression Tests — R02
- storefront/menu reads still work.
- customer transaction role/context leakage tests still pass.
- customer runtime remains least privilege.
- wrong tenant/branch read denial remains.

# 94. Regression Tests — R03
- cart persistence tests remain.
- order draft persistence remains.
- price/modifier snapshots remain.
- one-cart-one-order storage invariant remains.
- generated type drift remains clean.

# 95. Browser/E2E Tests
- enter via valid customer capability flow.
- add item via live command transport.
- refresh and see persisted cart where UI integration supports it.
- remove/update item.
- submit order.
- receive confirmation.
- stale legacy/customer capability negative path where practical.
- direct request without customer capability denied.
- double-click behavior may show one success/one conflict before R05; no duplicate order.

# 96. Validation Commands — Application
```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build:next
```
- Run from repository/application context defined by current scripts.
- Record actual results only.

# 97. Validation Commands — Database
```bash
supabase start
supabase db reset
supabase test db
npm run db:generate
npm run db:verify-types
npm run test:db-runtime
```
- Use exact scripts available on implementation branch.
- Do not push/reset production database.

# 98. Validation Commands — E2E
```bash
npm run test:e2e
```
- Run when environment prerequisites are available.
- Record NOT RUN/BLOCKED truthfully otherwise.

# 99. Validation Vocabulary
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- Never convert unrun check to PASS.
- This document validation is separate from future implementation validation.

# 100. Performance Boundary
- One command should use bounded query count.
- Avoid N+1 item/modifier lookups where repository already batches.
- Submit order should operate on one cart aggregate, not scan customer history.
- Do not add caching that weakens freshness/authorization.
- Locks should target cart/order rows narrowly.

# 101. Timeout / Lock Safety
- Keep transaction work database-local and bounded.
- No external network calls inside submit transaction.
- Acquire locks in deterministic order when multiple rows require locking.
- Avoid long UI-dependent transaction.
- Do not wait for payment/kitchen/realtime within transaction.

# 102. Deadlock Considerations
- Standard command path should lock source cart first before creating/submitting order.
- Child mutations should follow consistent parent→child order.
- Concurrent mutations should avoid reverse lock ordering.
- Integration tests may simulate contention where feasible.
- R05 may further harden retry on serialization/deadlock classes if appropriate.

# 103. Isolation Level
- Use repository/default transaction isolation unless demonstrated unsafe.
- Row lock + uniqueness should cover primary submit race.
- Do not escalate all customer transactions to SERIALIZABLE without evidence.
- If current DB driver allows targeted isolation only when needed, document rationale.

# 104. Retry Behavior in R04
- Do not automatically retry non-idempotent commands at application layer.
- Database-driver transient retry must not duplicate side effects.
- Since R04 has no external side effects pre-commit, transaction retry may still be unsafe without request idempotency after ambiguous commit outcome.
- Default: surface failure and let R05 define safe retry semantics.

# 105. Ambiguous Commit Outcome
- Network may fail after DB commit.
- Client may not know whether submit succeeded.
- R04 cannot fully solve this without idempotency/replay identity.
- R04 must ensure storage uniqueness limits duplicate conversion.
- R05 will add deterministic replay/result recovery.
- Document this as known handoff, not unresolved R04 bug.

# 106. Command API Versioning
- No public versioned API required unless existing architecture has it.
- Keep command contracts stable and typed internally.
- Avoid exposing database status enum directly if transport abstraction needs safer names.
- Future mobile/PWA clients may reuse route contracts; choose deterministic JSON shape if routes are used.

# 107. Suggested Transport Success Shape
```ts
{ ok: true, data: ... }
```
- Or current application convention.
- Avoid mixing HTTP 200 with hidden error strings.
- Server actions may throw typed redirects/errors according to framework convention.

# 108. Suggested Transport Error Shape
```ts
{ ok: false, error: { code: "CART_NOT_EDITABLE" } }
```
- No stack trace.
- No SQL message.
- No constraint name.
- Optional field-level validation detail only when safe.

# 109. Customer Status Exposure
- Only customer-safe order status returned.
- Internal kitchen/payment/admin metadata not exposed.
- R04 initial status may be `WAITING` or canonical equivalent.
- Later phases can update customer-visible status through separate read path.

# 110. Staff Compatibility
- R04 does not change staff authorization model.
- Staff may later see customer-created orders through staff data plane/RLS.
- Customer order persistence schema must remain compatible with existing staff/kitchen domain tables.
- Do not create parallel customer-only order table if canonical foodflow.orders exists.

# 111. Kitchen Compatibility
- Preserve preparation station snapshots/data already stored.
- Do not create kitchen ticket in R04.
- Do not assign station queue.
- Do not publish kitchen realtime.
- Future phase consumes submitted canonical order.

# 112. Payment Compatibility
- Order submission is not payment authorization.
- Payment status should remain existing default/unpaid state.
- Do not call Stripe/Omise.
- Do not create payment intent.
- Do not mark order paid.
- Future payment layer must reference durable order ID.

# 113. Realtime Compatibility
- Command result may include order/cart ID for later realtime subscription.
- No websocket/event broker required in R04.
- Avoid transaction coupling to future realtime infrastructure.

# 114. Notification Compatibility
- No notification send in R04.
- Persist enough durable state for future notification trigger.
- Avoid embedding notification-specific fields into command contracts unless schema already requires them.

# 115. Analytics Compatibility
- Durable order submission timestamp/status provides future analytics basis.
- Do not sacrifice transaction correctness for analytics event.
- Best-effort client analytics is non-authoritative.

# 116. Security — SQL Injection
- Use Kysely parameterization or safe SQL templates.
- Never concatenate customer text into SQL.
- Dynamic order-by/field names require allowlist if introduced.
- Command inputs must not select raw SQL fragments.

# 117. Security — XSS
- Customer note/special request stored as plain text.
- UI escapes output.
- No `dangerouslySetInnerHTML` for customer content.
- Error messages do not echo arbitrary raw input unnecessarily.

# 118. Security — Secret Handling
- Customer capability secret remains cookie/transport only.
- Do not persist raw bearer.
- Do not log bearer.
- Do not include auth/session secret in command result.
- Environment secret changes are not expected in R04.

# 119. Security — CSRF
- State-changing endpoints require intended HTTP method/server-action origin protection.
- Cross-site forged command should fail.
- SameSite cookie policy preserved.
- No GET mutation endpoint.

# 120. Security — Authorization Regression
- Customer cannot gain staff permission.
- Customer runtime cannot set `app.actor_id` to privileged actor as bypass.
- Customer runtime cannot switch tenant/branch freely.
- Staff auth cookie cannot substitute for customer capability unless product explicitly supports staff impersonation; it does not in this round.

# 121. Scope — Files to CREATE
- command module files.
- command unit/integration tests.
- route/action handler only when needed for live flow.
- forward migration only if narrow submission mutation support is missing.
- database tests for new grants/functions/constraints.
- E2E command flow test if current harness supports.

# 122. Scope — Files to MODIFY
- `customer-data/server/index.ts` for command exports.
- repository factory for new narrow mutation methods if needed.
- cart repository for lock/transition helper if missing.
- order repository for submit transition helper if missing.
- generated DB types if migration changes schema.
- existing customer cart/menu UI only for minimal command wiring.
- package scripts only if test discovery requires; no unrelated dependency churn.

# 123. Scope — Files NOT to MODIFY Without Evidence
- Auth.js configuration.
- staff AccessContext/permission modules.
- payment provider integration.
- kitchen operational modules.
- realtime infrastructure.
- broad CI workflows unrelated to changed test detection.
- historical migrations.
- unrelated marketing pages.

# 124. Scope — Files to REMOVE
- None expected.
- Remove only dead direct mutation path if R04 replaces a demonstrably unsafe legacy endpoint.
- Any removal must have replacement and regression evidence.

# 125. Database Migration Safety
- Forward-only migration.
- Idempotent role/grant statements where repository convention requires.
- No destructive production data reset.
- Existing DRAFT rows considered when tightening constraints.
- If constraint validation requires backfill, define safe deterministic backfill.
- Avoid table rewrite on high-volume tables where unnecessary.

# 126. Existing Data Compatibility
- Existing cart/order fixtures may predate capability ownership.
- Audit current seed/test data after R03 migration.
- Do not assume production data shape.
- New constraints must be compatible with migrated baseline.
- If legacy rows need nullable allowance, document transitional semantics rather than silently weaken new customer rows.

# 127. Generated Types
- Regenerate after schema change.
- Verify no drift.
- Do not manually edit generated file except generator output.
- If no schema change, generated file should remain unchanged.

# 128. Repository API Stability
- R03 methods may be extended but not broken unnecessarily.
- R04 command layer is new consumer.
- Avoid exposing transaction object to route layer.
- Avoid repository methods returning transport-specific response shapes.

# 129. Domain Types
- Add command input/result types separate from persistence row types.
- Keep persisted aggregate types reusable.
- Avoid giant union mixing transport errors and DB errors.
- Use readonly outputs where practical.

# 130. Cart Command Types
```ts
interface AddCartItemCommandInput {
  cartId: string;
  menuItemId: string;
  quantity: number;
  modifierChoiceIds: readonly string[];
  specialRequest?: string | null;
}
```
- No tenant/branch/price/currency fields.
- Exact field names may follow current repository type.

# 131. Update Command Types
- cartId.
- cartItemId.
- quantity where supported.
- specialRequest where supported.
- modifier selections only if full replacement semantics implemented.
- reject unknown dangerous fields.

# 132. Submit Command Types
```ts
interface SubmitOrderCommandInput {
  cartId: string;
  customerNote?: string | null;
}
```
- R05 may later add idempotency key outside or alongside this core input.
- Do not accept order items/body snapshot from browser.

# 133. Submit Result Types
- durable order ID.
- safe display order number.
- customer-safe status.
- submittedAt.
- subtotal/currency if useful for confirmation.
- no internal role/payment/kitchen metadata.

# 134. Error Class Separation
- `CustomerDataError` remains storage/data access layer.
- `CustomerCommandError` may wrap/map it.
- Command layer should not lose original cause for server logs, but public surface must not expose it.
- Mapping should be exhaustive.

# 135. Error Mapping Example
- CUSTOMER_RESOURCE_NOT_FOUND → COMMAND_NOT_FOUND.
- CUSTOMER_DATA_INVARIANT_VIOLATION → COMMAND_INVALID/CONFLICT depending context.
- CUSTOMER_DATA_UNAVAILABLE → COMMAND_UNAVAILABLE.
- DB unique source-cart violation → COMMAND_CONFLICT.
- Unknown error → COMMAND_UNAVAILABLE with internal logging.

# 136. Unknown Error Discipline
- Do not map unknown error to success.
- Do not expose raw message.
- Log safe correlation/context.
- Re-throw or map generic unavailable according to transport boundary.
- Ensure transaction rolls back.

# 137. Order Submission State Machine
```text
CART DRAFT
  + validated context
  + non-empty persisted items
  -> ORDER DRAFT created from snapshots
  -> ORDER submitted initial state
  -> CART converted/terminal
  -> COMMIT
```
- Any failure before commit returns to original durable state.

# 138. Forbidden State Transitions
- terminal cart → DRAFT reopening by customer.
- submitted order → DRAFT by customer.
- customer order → PREPARING/SERVED directly.
- customer order → PAID directly.
- customer cart → another tenant/branch.
- order source_cart rewrite after submission.

# 139. Order Cancellation
- Customer cancellation is not introduced unless existing product explicitly supports and R04 scope includes it.
- Default defer to later operational policy.
- Do not add broad cancel command merely because status enum has CANCELLED.

# 140. Draft Order Visibility
- DRAFT order is internal transient persistence during transaction/orchestration.
- Customer UI should not normally observe orphan DRAFT orders.
- If command fails and transaction rolls back, none remains.
- If separate multi-request draft flow is not required, keep DRAFT creation within submit transaction.

# 141. Cart Persistence Across Requests
- R03 made cart durable.
- R04 wiring should recover cart by safe selector/context.
- Avoid browser-local cart being canonical.
- If cart ID cookie/local storage is used, treat it as selector only.
- Server must handle missing/stale cart selector.

# 142. Multiple Tabs
- Multiple tabs may mutate same cart concurrently.
- R04 must preserve DB correctness.
- UI freshness conflicts acceptable if deterministic.
- R05 may improve retry/version semantics.
- No duplicate orders from same cart.

# 143. Customer Re-entry
- New/rotated capability may not automatically own prior cart unless R01/R03 contract allows.
- Command layer follows server ownership semantics.
- Do not transfer cart by accepting old capability ID from client.
- Any explicit transfer mechanism is future scope.

# 144. Table Change
- Customer cannot move cart/order to a different table by body input.
- New table QR entry creates/uses new context.
- Old cart remains bound to original context.
- No cart merge across tables in R04.

# 145. Restaurant/Branch Change
- No command supports branch switching.
- Customer context determines restaurant/branch.
- Cross-branch cart selector fails not-found/conflict safely.

# 146. Availability Race
- Item may become unavailable after cart add.
- Submission policy must be explicit.
- If reject-at-submit chosen, return item-unavailable/cart-refresh error.
- If snapshot-submit chosen, document product rationale.
- Tests lock selected policy.

# 147. Currency Race
- Cart aggregate requires one currency.
- Submission copies persisted cart currency.
- Branch currency config change mid-cart must not silently create mixed-currency order.
- If repricing/currency migration required, reject old cart and rebuild rather than mix.

# 148. Modifier Price Race
- Persisted cart modifier snapshot is canonical under snapshot policy.
- Submit copies snapshot.
- Do not re-read modifier price and create mismatch with displayed cart unless explicit repricing policy chosen.

# 149. Command Ordering
- Validate primitive input before DB transaction where possible.
- Resolve customer context.
- Start transaction.
- Load/lock aggregate.
- Validate current domain state.
- Mutate through repositories.
- Read result.
- Commit.
- Return/perform post-commit transport handling.

# 150. Database Function Error Semantics
- Narrow functions may return boolean/row/null rather than throwing custom SQL exceptions for expected conflicts.
- Application maps no-row to conflict/not-found.
- Unexpected DB errors remain infrastructure failures.
- Avoid parsing localized PostgreSQL error strings.

# 151. Constraint Name Handling
- Application may map known SQLSTATE/constraint identifier internally when reliable.
- Do not expose identifier to client.
- Prefer repository abstraction where possible.
- Tests should not depend on brittle full error message text.

# 152. SQLSTATE Handling
- Unique violation can indicate already converted cart.
- Foreign key violation should usually indicate programming/invariant error, not normal client feedback.
- Check violation indicates invalid persisted state/input and must map safely.
- Serialization/deadlock classes are not automatically retried in R04.

# 153. Observability — Metrics Future Compatibility
- Commands are natural metric boundaries.
- Avoid embedding vendor-specific metrics SDK in R04 unless already standard.
- Structured logs/counters can be added later.
- Keep stable command names for future instrumentation.

# 154. Privacy
- Anonymous capability ID is still pseudonymous operational identifier.
- Avoid exposing it in client-visible logs/errors.
- Customer note may contain personal information; minimize logging.
- Order IDs/numbers should be treated as business data.

# 155. Rate Limiting
- Generic public mutation rate limiting is not mandatory R04 unless current system already has primitive.
- Quantity/input bounds and capability scoping reduce abuse surface.
- Do not add external rate-limit vendor solely for this round.
- Future abuse controls can wrap command transport.

# 156. Testing — Direct Command Unit
- command dependency injection with fake context/repositories.
- repository called with expected IDs only.
- no tenant/branch fields forwarded from input.
- error mapping deterministic.
- transaction callback composition verified where practical.

# 157. Testing — Transport Contract
- missing cookie/context rejected.
- malformed body rejected.
- unknown fields behavior explicit.
- direct cross-tenant selector denied.
- success response safe/minimal.
- error response stable.

# 158. Testing — Transaction Rollback
- fail after order insert before item insert.
- fail after order item insert before submit transition.
- fail after submit transition before cart conversion.
- verify no submitted order/cart terminal mismatch persists.
- verify transaction-local context does not leak to next pooled transaction.

# 159. Testing — Context Isolation
- concurrent tenant A and tenant B commands.
- each sees only own cart/order.
- context does not bleed across pooled connections.
- customer runtime cannot escalate into staff runtime.

# 160. Testing — Staff Regression
- staff permission tests remain.
- staff routes remain Auth.js guarded.
- customer command code does not import staff route permission helper for authority.
- existing staff order visibility not broken by new constraints where current baseline tests cover it.

# 161. Testing — Security Negative Matrix
| Case | Expected |
|---|---|
| no customer context | deny |
| expired capability | deny |
| revoked capability | deny |
| cross-tenant cart | deny/not found |
| sibling-branch cart | deny/not found |
| other capability cart | deny/not found |
| forged price | ignored/rejected, server price wins |
| forged tenant | rejected/not accepted |
| terminal cart mutation | conflict |
| duplicate source cart submit | one order max |
| public DB direct write | denied |

# 162. Definition of Done — Architecture
- one canonical command layer exists.
- route/action calls command layer.
- repositories remain persistence boundary.
- one transaction per mutation command.
- customer context remains authority.
- no parallel direct SQL path.

# 163. Definition of Done — Cart Commands
- create/get active behavior deterministic.
- add item persisted.
- update item persisted where scoped.
- remove item persisted.
- invalid/terminal ownership cases denied.
- result returns authoritative cart aggregate.

# 164. Definition of Done — Submit
- non-empty owned DRAFT cart required.
- snapshots copied server-side.
- order becomes initial submitted state.
- submitted timestamp present.
- order number stable.
- cart terminal/converted.
- one transaction.
- one source cart → max one order.

# 165. Definition of Done — Security
- no browser ownership authority.
- no browser price authority.
- cross-tenant denied.
- wrong branch denied.
- other capability denied.
- customer runtime least privilege preserved.
- direct public writes denied.

# 166. Definition of Done — Failure
- validation failure leaves no mutation.
- DB failure rolls back.
- conflict deterministic.
- ambiguous post-commit response documented for R05.
- no external side effect before commit.

# 167. Definition of Done — Validation
- unit command tests.
- integration command tests.
- DB grant/RLS/constraint tests.
- generated type check when applicable.
- inherited R01–R03 regression.
- build/type/lint.
- E2E where harness permits.
- actual results in implementation PR.

# 168. Definition of Done — Scope
- no generic idempotency store.
- no payment execution.
- no kitchen ticket creation.
- no realtime publish infrastructure.
- no notification send.
- no Phase 04 implementation.

# 169. PR Requirements — Metadata
- Phase `03`.
- Round `04`.
- Exact spec filename.
- implementation parent `p03-r03-cart-order-persistence` or latest legitimate R03 tip.
- parent SHA.
- implementation head SHA.
- exact changed files.
- actual validation outcomes.
- blockers/deferred work.

# 170. PR Requirements — Scope Declaration
```text
CUSTOMER_COMMAND_LAYER_IMPLEMENTED: YES
CART_MUTATION_COMMANDS_IMPLEMENTED: YES
ORDER_SUBMISSION_ORCHESTRATION_IMPLEMENTED: YES
ATOMIC_CART_TO_ORDER_TRANSACTION_IMPLEMENTED: YES
SERVER_DERIVED_PRICING_OWNERSHIP: YES
GENERIC_IDEMPOTENCY_FRAMEWORK_IMPLEMENTED: NO
PAYMENT_EXECUTION_IMPLEMENTED: NO
KITCHEN_TICKET_CREATION_IMPLEMENTED: NO
REALTIME_PUBLICATION_IMPLEMENTED: NO
NOTIFICATION_SEND_IMPLEMENTED: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 171. PR Requirements — Database
- migration filename if any.
- exact grants/functions/constraints changed.
- production DB modified: NO.
- generated types changed: YES/NO.
- rollback/failure evidence.
- RLS negative evidence.

# 172. PR Requirements — Validation Table
- Phase/Round Gate.
- Repository Integrity.
- Dependency Integrity.
- lint.
- typecheck.
- unit tests.
- integration tests.
- Next build.
- Supabase DB quality.
- DB runtime contract.
- E2E.
- Vercel status if applicable.
- Use PASS/FAIL/NOT RUN/BLOCKED/NOT APPLICABLE only.

# 173. Handoff to R05 — Core
- R05 inherits canonical command functions.
- R05 inherits one-transaction orchestration.
- R05 inherits durable cart/order storage.
- R05 inherits source-cart uniqueness.
- R05 inherits command error taxonomy.
- R05 adds request identity/replay semantics around commands.
- R05 must not rewrite command business logic unnecessarily.

# 174. Handoff to R05 — Idempotency Targets
- submit order highest priority.
- add cart item may require retry/dedup semantics depending transport.
- update quantity may use version/replay strategy.
- remove item may become naturally idempotent or mapped consistently.
- request key storage/TTL/fingerprint/result replay belongs R05.

# 175. Handoff to R05 — Concurrency Targets
- ambiguous commit recovery.
- duplicate network retry.
- double submit.
- stale version/lost update.
- deadlock/serialization retry policy where safe.
- R04 structural lock/uniqueness remains foundation.

# 176. Known Limitation After R04
- A request may commit then lose response.
- Duplicate retry may encounter conflict rather than replay original success.
- This is acceptable temporary boundary only because R05 immediately owns idempotency.
- R04 must not claim exactly-once semantics.

# 177. R06 Future Acceptance
- R06 will prove entry → context → data access → persistence → command → idempotency end to end.
- R04 should produce testable stable command boundary for that acceptance.
- Do not write Phase 03 acceptance record now.

# 178. Stop Conditions During Implementation
- exact R04 spec not on current main.
- latest R03 lineage cannot be identified.
- R03 repositories missing/incompatible with spec assumptions.
- implementing command requires broad customer DB grant.
- order submission would require payment/kitchen side effect for correctness.
- current schema cannot represent submitted order safely without broad redesign.
- required capability validation unavailable.
- in these cases stop/report rather than bypass security.

# 179. Existing Equivalent Command Layer
- If latest parent contains equivalent command module from concurrent work, do not duplicate.
- Audit against this spec.
- Extend/harden canonical path.
- Remove/retire unsafe duplicate only with regression evidence.

# 180. File Responsibility Checklist
- command input types own customer intent only.
- command orchestrators own sequencing.
- repositories own SQL/persistence.
- transaction helper owns DB role/context.
- capability module owns customer trust.
- route/action owns transport mapping.
- UI owns presentation only.

# 181. Anti-Pattern — Route SQL
- route handler opens Kysely DB directly.
- route handler sets tenant from body.
- route handler manually inserts order rows.
- prohibited.

# 182. Anti-Pattern — Client Pricing
- client sends unit price/subtotal and server persists it.
- prohibited.
- server uses persisted/current authoritative snapshot rules.

# 183. Anti-Pattern — Partial Side Effects
- create kitchen ticket before order transaction commits.
- send notification before commit.
- charge payment before durable order commit.
- prohibited in R04.

# 184. Anti-Pattern — Hidden Idempotency
- local in-memory `Set` of request IDs.
- browser-only disabled button treated as duplicate prevention.
- random key with no durable replay semantics.
- prohibited as substitute for R05.

# 185. Anti-Pattern — Broad Customer UPDATE
- `grant update on foodflow.orders to flow_customer_runtime` without policy/column/function restriction.
- avoid; use narrow function/policy where feasible.

# 186. Anti-Pattern — Staff Permission for Customer
- `actor_has_permission()` with fake actor.
- customer-created membership.
- staff Auth.js session requirement.
- prohibited.

# 187. Operational Observability
- command failures classifiable by code.
- transaction failure distinguishable from domain conflict.
- no secret/token logging.
- implementation PR documents known ambiguous-commit limitation.

# 188. Performance Acceptance
- cart mutation bounded queries.
- submit order bounded by cart item/modifier count.
- no history scan.
- no N+1 per modifier where current repository can batch.
- transaction duration excludes external calls.

# 189. Migration Acceptance
- forward-only.
- safe search_path for SECURITY DEFINER.
- grants least privilege.
- constraints validated.
- fresh reset works.
- pgTAP tests cover privilege/transition.
- generated types drift-free.

# 190. Customer UX Acceptance
- mutation loading state.
- safe validation error.
- safe conflict state.
- capability expiration recovery.
- persisted state after refresh where integrated.
- submit success confirmation.
- no staff navigation exposure.

# 191. Order Confirmation Data
- order display number.
- order UUID only if route needs it.
- submitted timestamp.
- customer-safe status.
- item summary may be read from durable order.
- no payment/kitchen internals.

# 192. Customer Order Read Boundary
- R04 may add read-after-submit query using existing order repository extension.
- Must enforce same customer context ownership.
- Do not expose arbitrary order lookup by display number without additional safe proof.
- Other customer's order remains invisible.

# 193. Order Persistence After Capability Expiry
- Historical order remains durable.
- Whether customer can read it after capability expiry is separate product policy.
- R04 should not weaken capability validation to preserve history access.
- Future customer identity/order-history feature can address longer-term access.

# 194. Table Session Closure After Submission
- Submitted order remains valid historical/business record.
- Table session closure should not delete order.
- Future operations continue on order independently.
- Customer mutation commands against original cart should remain terminal/denied.

# 195. Cart Cleanup
- Abandoned cart cleanup job is not R04 core.
- Do not add scheduler merely for this round.
- Terminal/abandoned lifecycle can be addressed later operationally.

# 196. Time Source
- Prefer database `now()` for submitted_at/current durable timestamp where possible.
- Avoid trusting client timestamp.
- Application timestamps used only for non-authoritative display/request metadata.

# 197. UUID Source
- Use current repository standard.
- Random UUID generated server-side is acceptable.
- Client does not choose order ID for authority.
- Future idempotency may derive stable request mapping without changing canonical ID semantics.

# 198. Order Number Collision
- DB uniqueness mandatory.
- Generator must handle concurrent requests.
- Do not generate by `count(*) + 1`.
- Sequence/atomic function preferred.
- Collision maps to infrastructure/retry design; avoid manual race-prone loop.

# 199. Database Ownership of Status Timestamp
- submission transition ideally updates status + submitted_at + order number atomically.
- Avoid multiple independent updates from route layer.
- Repository/function returns final submitted representation.

# 200. Customer Data Error Redaction
- Causes may include SQL object names/values.
- Public mapper removes cause.
- Server logs should avoid dumping query parameter values where they may contain PII.
- Capability token never logged.

# 201. Query Context Invariant
- Every customer mutation transaction has tenant/branch/capability/table context set exactly once.
- Repositories do not overwrite it.
- Pooled connection cleanup via transaction-local settings remains.
- Tests prove next transaction starts clean.

# 202. Privilege Boundary Invariant
- `flow_customer_entry` resolves entry only.
- `flow_customer_runtime` performs customer-domain scoped access.
- `flow_identity` remains staff identity discovery.
- `flow_runtime` remains staff tenant runtime.
- R04 does not merge roles.

# 203. Route Naming
- Use `/api/customer/...` if route handlers chosen.
- Avoid `/api/auth/...` for cart/order commands.
- Avoid staff `/api/internal/...` namespace.
- Command names should reflect domain action.

# 204. HTTP Method Discipline
- create/add/submit: POST.
- update: PATCH/POST server action according to convention.
- remove: DELETE/POST server action according to convention.
- reads: GET/server component.
- no state mutation via GET.

# 205. Cache Discipline
- Mutation routes/actions non-cacheable.
- Customer cart reads should not be shared public cache across capability contexts.
- Avoid CDN caching private cart/order responses.
- Storefront/menu public/capability cache remains R02 concern.

# 206. Next.js Server/Client Boundary
- `server-only` on command/repository modules.
- Client components import only action stubs/types safe for client if framework permits.
- Secrets/DB modules never bundled client-side.
- Build validation checks accidental import leakage.

# 207. TypeScript Contract
- strict types.
- no `any` around command input.
- exhaustive error mapping where unions used.
- readonly arrays/outputs where useful.
- bigint converted safely to string at transport boundary if necessary.

# 208. Money Serialization
- Persist integer minor units.
- Transport may serialize as decimal string/minor string.
- Avoid JSON BigInt directly.
- UI formatting uses currency + minor-unit helper.
- No floating-point canonical calculations.

# 209. Modifier Serialization
- Return stable modifier display names/prices from snapshots.
- Do not require current menu join for submitted order history.
- Order confirmation should remain valid after menu edits.

# 210. Special Request Rendering
- preserve newline policy if UI supports.
- normalize control characters where security/usability requires.
- no HTML rendering.
- bounded length.

# 211. Data Retention
- R04 does not delete submitted order.
- Cart conversion terminal state retained.
- Future retention policy outside this round.

# 212. Recovery After Page Refresh During Submit
- Browser may refresh while request in-flight.
- Durable DB determines outcome.
- Without R05 replay key, UI may need reload cart/order state.
- No duplicate source-cart order due uniqueness.
- R05 improves deterministic recovery.

# 213. Recovery After Browser Back
- Terminal cart should not become editable from stale client state.
- Next mutation revalidates server state and returns conflict.
- UI refreshes authoritative cart/order status.

# 214. Command Testing Fixtures
- Reuse R01 customer capability fixture.
- Reuse R02 storefront/menu fixture.
- Reuse R03 cart/order persistence fixtures.
- Add only command-state fixtures that cannot be represented otherwise.
- Avoid duplicate tenant/persona fixtures.

# 215. Negative Fixture Matrix
- tenant A capability + tenant B cart.
- branch A1 capability + branch A2 cart.
- capability X + capability Y cart.
- DRAFT cart.
- converted cart.
- empty cart.
- inactive menu item.
- malformed modifier choice.
- revoked capability.

# 216. Database Test Transaction Strategy
- Each pgTAP scenario isolates changes.
- Qualify pgTAP assertions under restricted role as R03 fixes demonstrate.
- Restore roles/context between tests.
- Avoid tests depending on execution order beyond fixtures.

# 217. CI Scope
- Application files trigger Next Flow Quality.
- migrations/tests trigger Supabase Database Quality.
- package changes trigger Dependency Integrity if any.
- Do not alter workflows merely because docs automation validation ignores Actions.
- Future implementation CI remains authoritative for implementation readiness under repository policy.

# 218. Document Validation
- This document is validated independent of GitHub Actions.
- Metadata canonical.
- sequence R03→R04→R05 canonical.
- current-code assumptions grounded in R03 branch.
- scope/non-goals explicit.
- file/module/database/API contracts explicit.
- security/failure/recovery/concurrency explicit.
- validation plan explicit.
- DoD/handoff explicit.

# 219. Document Internal Consistency
- R04 owns command orchestration.
- R05 owns generic idempotency.
- R03 remains persistence owner.
- R02 remains transaction/data access owner.
- R01 remains capability owner.
- No section authorizes payment/kitchen/realtime execution.
- No section authorizes implementation merge by agent.

# 220. Document-Only Validation Policy
- GitHub Actions are not document-validation authority.
- Failed/queued/skipped/missing Actions do not invalidate document content.
- Hosted merge restriction, if any, is reported separately.
- Documentation task never edits CI/runtime to make docs PR green.

# 221. Implementation Validation Policy
- Future implementation runs applicable repository checks.
- This spec's source audit is not runtime proof.
- Failed required implementation validation remains blocker.
- Implementation PR merge remains owner-controlled.
- No fabricated PASS.

# 222. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This spec authorizes only P03/R04 implementation after being on main.
- Future implementation branches from latest legitimate P03/R03 lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 223. Final Handoff to R05
- validated CustomerContext.
- customer data transaction boundary.
- durable cart/order persistence.
- canonical cart mutation commands.
- canonical submit-order command.
- atomic cart→order transaction.
- deterministic command errors.
- structural submit-race protection.
- no external side effects before commit.
- R05 adds durable idempotency/replay/concurrency hardening.

# 224. Required Next Specification
```text
FLOW_P03_R05_IMPLEMENTATION_SPEC.md
```
- R05 spec must be authored from actual R04 implementation state.
- R04 does not invent final idempotency schema.
- No R05 implementation starts until exact spec exists on main.

# 225. Final Acceptance Statement
- P03/R04 is READY as an executable specification document.
- R04 converts the R01/R02/R03 primitives into one canonical customer mutation/submit command layer.
- All durable mutations remain server-authoritative and transaction-bound.
- Cart-to-order submission is atomic and side-effect-free until commit.
- Browser tenant/branch/pricing inputs remain non-authoritative.
- Generic request idempotency/replay handling remains deliberately deferred to P03/R05.
