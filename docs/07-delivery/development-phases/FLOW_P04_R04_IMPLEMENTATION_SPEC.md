# FLOW P04 R04 — Implementation Specification
> Phase 04 — Order Orchestration & Control
> Round 04 — Controlled Order Amendment + Cancellation Exception Workflow
> Revision — Add a narrow staff exception plane on top of the R01 durable queue, R02 accept/reject decision boundary, and R03 normal lifecycle engine, so accepted orders can be amended before production and operational orders can be cancelled through explicit server-authorized commands without introducing arbitrary order editing or status mutation.

## Metadata
- Phase: `04`
- Round: `04`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P04_R03_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P04_R05_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P04 implementation slot after this specification is on main`
- Current planning scope: `PHASE 04 / ROUND 04 ONLY`
- Implementation parent: `latest completed P04/R03 implementation lineage tip`
- Expected implementation parent branch: `p04-r03-order-lifecycle`
- Observed R03 branch head at authoring: `5df137015643b79c297f68c94b7df4f04b96815c`
- Observed R03 implementation PR: `#82`
- Observed R03 implementation state: `IMPLEMENTED / PR OPEN / SUFFICIENT HANDOFF FOR R04 SPEC`
- Observed R03 diff from R02 lineage: `13 commits ahead`
- Recommended implementation branch: `p04-r04-order-exceptions`
- Recommended implementation PR title: `feat(operations): add controlled order amendment and cancellation`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Controlled accepted-order amendment in this round: `YES`
- CHANGED re-review semantics in this round: `YES`
- Controlled cancellation in this round: `YES`
- Cancellation reason evidence in this round: `YES`
- Exact-state concurrency protection in this round: `YES`
- Server-derived money recalculation in this round: `YES`
- Arbitrary item price mutation in this round: `NO`
- Arbitrary modifier replacement in this round: `NO`
- Arbitrary table/tenant/branch reassignment in this round: `NO`
- Priority/delay/remake workflow in this round: `NO — P04/R05`
- Kitchen routing redesign in this round: `NO`
- Payment execution in this round: `NO`
- Realtime publication in this round: `NO`
- Notification delivery in this round: `NO`
- Phase 04 acceptance in this round: `NO — P04/R06`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` authority SHA at authoring is `a7c9ac2777627a2c9acf882cb5a41caccf7ff859`.
- Current `main` contains `FLOW_P04_R03_IMPLEMENTATION_SPEC.md` with `Status: READY`.
- Current R03 specification names this exact file as `Next`.
- Current policy keeps `main` as policy/spec authority.
- Current policy keeps the latest round branch as implementation lineage.
- `p04-r03-order-lifecycle` exists and is the latest observed P04 implementation branch.
- Observed R03 head is `5df137015643b79c297f68c94b7df4f04b96815c`.
- R03 implementation PR #82 exists and remains owner-controlled.
- R03 branch is 13 commits ahead of the observed R02 lineage base.
- R03 introduces a canonical server-side lifecycle action vocabulary.
- R03 implements `ACCEPTED → PREPARING → READY → SERVED`.
- R03 maps `START_PREPARING` to `PREPARING`.
- R03 maps `MARK_READY` to `READY`.
- R03 maps `MARK_SERVED` to `SERVED`.
- R03 uses branch-scoped `order.manage` authorization.
- R03 uses exact tenant + branch + order + source-status predicates.
- R03 records lifecycle event evidence in the same transaction.
- R03 exposes lifecycle mutation through an internal route handler.
- R03 staff workspace exposes only the next legal normal lifecycle action.
- R03 intentionally leaves edit/cancel exceptions unimplemented.
- R02 intentionally left `CHANGED` review-only because re-decision semantics did not yet exist.
- R04 is therefore justified by actual code-state gaps rather than by calendar cadence.
- No `FLOW_P04_R04_IMPLEMENTATION_SPEC.md` existed on `main` before authoring.
- No `p04-r04-*` implementation branch existed before authoring.
- No duplicate R04 docs PR was observed before authoring.
- This task is specification/documentation only.
- This task does not create the R04 implementation branch.
- This task does not modify application/runtime code.
- This task does not implement a database migration.
- This task does not change CI/workflow configuration.
- This task does not merge implementation PR #82.
- This task does not enable implementation auto-merge.

# 2. Phase 04 Objective
- Phase 04 owns durable staff-side order orchestration after customer submission.
- R01 provides branch-scoped durable queue/detail reads.
- R02 provides explicit accept/reject decision commands.
- R03 provides the normal accepted-order lifecycle.
- R04 provides controlled exception handling for amendment and cancellation.
- R05 provides priority, delay, remake, and operational escalation controls.
- R06 provides integrated Phase 04 acceptance and next-phase handoff.
- Phase 04 must keep the database as order-state authority.
- Phase 04 must keep actor authority server-derived.
- Phase 04 must keep tenant authority server-derived.
- Phase 04 must keep branch authority server-derived.
- Phase 04 must prevent arbitrary client-selected order status.
- Phase 04 must make every successful staff mutation auditable.
- Phase 04 must provide deterministic stale-state behavior under concurrent staff actions.
- Phase 04 must avoid coupling normal order control to payment providers prematurely.
- Phase 04 must avoid coupling normal order control to kitchen routing prematurely.
- Phase 04 must preserve customer-submission invariants established in Phase 03.
- Phase 04 must preserve immutable historical price/modifier snapshots except for bounded quantity-driven recomputation.

# 3. Six-Round Phase 04 Boundary
- R01 owns server-backed operational queue/detail reads.
- R01 owns branch-scoped `order.view` enforcement.
- R02 owns initial staff accept/reject decision boundary.
- R02 owns durable decision actor/timestamp/reason evidence.
- R03 owns normal `ACCEPTED → PREPARING → READY → SERVED` lifecycle transitions.
- R03 owns normal lifecycle actor/timestamp/event evidence.
- R04 owns accepted-order amendment before production.
- R04 owns `CHANGED` re-review semantics.
- R04 owns controlled operational cancellation.
- R05 owns priority controls.
- R05 owns delay/defer controls.
- R05 owns remake and production-exception escalation.
- R06 owns integrated Phase 04 acceptance.
- R04 must not absorb R05 priority/delay/remake scope.
- R04 must not absorb R06 acceptance scope.

# 4. Round 04 Objective
- Create one canonical server-only order exception service.
- Support a narrow accepted-order amendment command before preparation begins.
- Support explicit operational cancellation through a bounded cancellation command.
- Give `CHANGED` a precise re-review meaning.
- Make amendment source eligibility exact and fail closed.
- Make cancellation source eligibility exact and fail closed.
- Keep browser payloads limited to intent and selectors.
- Never accept target operational status from the browser.
- Never accept tenant from the browser.
- Never accept branch from the browser.
- Never accept actor from the browser.
- Never accept price from the browser.
- Never accept currency from the browser.
- Never accept subtotal from the browser.
- Never accept lifecycle timestamps from the browser.
- Recompute amended totals from persisted order-item price/modifier snapshots.
- Persist amendment evidence atomically with the state mutation.
- Persist cancellation evidence atomically with the state mutation.
- Extend R02 decision handling only as necessary to resolve `CHANGED` re-review.
- Preserve R03 normal lifecycle transition map unchanged for normal transitions.
- Expose only explicit exception actions in staff UI.
- Provide deterministic conflict behavior when exceptions race normal lifecycle actions.
- Produce a clean R05 handoff for priority/delay/remake.

# 5. Preconditions
- [ ] This exact specification exists on current `main` before R04 implementation starts.
- [ ] This specification remains `READY`.
- [ ] `Previous` is exactly `FLOW_P04_R03_IMPLEMENTATION_SPEC.md`.
- [ ] `Next` is exactly `FLOW_P04_R05_IMPLEMENTATION_SPEC.md`.
- [ ] Current `FLOW_MERGE_POLICY.md` is re-read before implementation.
- [ ] Current development-phase README is re-read before implementation.
- [ ] Applicable CONTRIBUTING/AGENTS instructions are re-read.
- [ ] Latest R03 implementation branch is identified.
- [ ] New R04 implementation branch descends from latest legitimate R03 lineage.
- [ ] Actual R03 code is inspected before implementation.
- [ ] Actual current order schema is inspected before migration decisions.
- [ ] Actual current customer-status constraint is inspected.
- [ ] Actual current `order_events` constraints/grants are inspected.
- [ ] No unresolved security blocker requires weakening authorization.
- [ ] No production destructive DB mutation is necessary.

# 6. Explicit Non-Goals
- Do not add an arbitrary status dropdown.
- Do not add a generic `updateOrder()` endpoint.
- Do not accept browser-supplied `status`.
- Do not accept browser-supplied `customerStatus`.
- Do not allow tenant reassignment.
- Do not allow branch reassignment.
- Do not allow table reassignment.
- Do not allow customer capability reassignment.
- Do not allow order-number edits.
- Do not allow currency edits.
- Do not allow unit-price edits.
- Do not allow modifier price edits.
- Do not allow adding new menu items in R04.
- Do not allow replacing modifier selections in R04.
- Do not rebuild menu authoring.
- Do not implement refunds.
- Do not implement payment reversal.
- Do not implement kitchen ticket cancellation.
- Do not publish realtime events.
- Do not deliver notifications.
- Do not build a generic outbox.
- Do not implement priority/delay/remake.
- Do not implement Phase 04 acceptance.
- Do not introduce customer-facing order-edit APIs.
- Do not reuse customer idempotency records for staff mutations.
- Do not weaken RLS.
- Do not weaken permission checks.
- Do not merge implementation PRs.

# 7. Inherited Architecture to Preserve
- Auth.js remains internal staff identity authority.
- AccessContext remains tenant/branch workspace authority.
- `order.view` remains the read permission boundary.
- `order.manage` remains the mutation permission boundary.
- `withAuthorizedAccessTransaction()` remains the preferred authorized transaction wrapper.
- R01 queue repository remains the durable read plane.
- R01 queue service remains the authorized read orchestrator.
- R02 decision repository remains the initial accept/reject persistence plane.
- R02 decision service remains the initial accept/reject command plane.
- R03 lifecycle repository remains the normal lifecycle persistence plane.
- R03 lifecycle service remains the normal lifecycle command plane.
- `foodflow.orders` remains the durable operational order source of truth.
- `foodflow.order_items` remains the durable line snapshot source.
- `foodflow.order_item_modifiers` remains the durable modifier snapshot source.
- `foodflow.order_events` remains append-oriented durable operational evidence.
- Staff workspace remains a projection of server state.
- Staff workspace does not become authority.
- Browser order UUID remains a selector only.

# 8. Observed R03 Transition Contract
| Action | From | To | Customer status | Event | Timestamp |
|---|---|---|---|---|---|
| `START_PREPARING` | `ACCEPTED` | `PREPARING` | `PREPARING` | `ORDER_PREPARING` | `preparing_at` |
| `MARK_READY` | `PREPARING` | `READY` | `COMING_TO_TABLE` | `ORDER_READY` | `ready_at` |
| `MARK_SERVED` | `READY` | `SERVED` | `SERVED` | `ORDER_SERVED` | `served_at` |
- R04 must not create a second normal lifecycle map.
- R04 exception commands must coexist through exact source-state predicates.
- An amendment racing `START_PREPARING` must have exactly one winner.
- A cancellation racing normal lifecycle transition must have exactly one winner.
- R04 conflict must not silently retry into a different business action.

# 9. Observed Operational Status Vocabulary
- `PENDING_CONFIRMATION` exists.
- `ACCEPTED` exists.
- `PREPARING` exists.
- `READY` exists.
- `SERVED` exists.
- `PAYMENT_PENDING` exists.
- `PAID` exists.
- `CLOSED` exists.
- `REJECTED` exists.
- `CANCELLED` exists.
- `CHANGED` exists.
- `REMAKE` exists.
- `VOIDED` exists.
- R04 must use this established vocabulary rather than inventing duplicate status strings.

# 10. Exception Action Vocabulary
| Action | Purpose | Allowed source | Target |
|---|---|---|---|
| `AMEND_ACCEPTED_ORDER` | Edit bounded accepted-order content | `ACCEPTED` | `CHANGED` |
| `CANCEL_ORDER` | Cancel a cancellable operational order | exact allowed source set | `CANCELLED` |
| `REACCEPT_CHANGED_ORDER` | Re-confirm a changed order | `CHANGED` | `ACCEPTED` |
| `REJECT_CHANGED_ORDER` | Reject a changed order after review | `CHANGED` | `REJECTED` |
- `AMEND_ACCEPTED_ORDER` is bounded, not a generic patch.
- `CANCEL_ORDER` accepts a reason and no target status.
- CHANGED re-review should reuse R02 decision semantics where safe.
- Implementation must prefer reuse over parallel decision behavior.

# 11. Amendment Eligibility Policy
- Only operational status `ACCEPTED` is amendment-eligible.
- `PENDING_CONFIRMATION` is not amendment-eligible.
- `CHANGED` is not amendment-eligible because it already awaits re-review.
- `PREPARING` is not amendment-eligible because production has started.
- `READY` is not amendment-eligible.
- `SERVED` is not amendment-eligible.
- `REJECTED` is not amendment-eligible.
- `CANCELLED` is not amendment-eligible.
- `PAYMENT_PENDING` is not amendment-eligible.
- `PAID` is not amendment-eligible.
- `CLOSED` is not amendment-eligible.
- `REMAKE` is not amendment-eligible in R04.
- `VOIDED` is not amendment-eligible.
- Exact source-status predicate belongs in the mutation query.
- Service prechecks may improve errors but are not concurrency authority.

# 12. Bounded Amendment Surface
| Field/change | R04 operation | Validation | Allowed |
|---|---|---|---|
| customer note | replace/clear | bounded text | YES |
| existing item quantity | update | integer 1..99 | YES |
| existing item special request | replace/clear | bounded text | YES |
| existing item | remove | order remains non-empty | YES |
| new menu item | add | requires current menu selection/repricing | NO |
| menu item ID | replace | historical identity mutation | NO |
| unit price | replace | financial authority mutation | NO |
| modifier choices | replace | broader validation/repricing | NO |
| modifier price | replace | financial authority mutation | NO |
| currency | replace | financial authority mutation | NO |
| table | reassign | scope mutation | NO |
| branch | reassign | authorization mutation | NO |
| tenant | reassign | authorization mutation | NO |
- Implementation may narrow this surface if actual schema makes a listed operation unsafe.
- Implementation must not broaden it without a later executable specification.
- Every edited item ID must already belong to the scoped order.
- Removing the final remaining item must fail.
- Duplicate amendment operations targeting the same item must fail or normalize deterministically before mutation.
- Unknown fields must fail closed.

# 13. Amendment Price and Total Semantics
- R04 amendment preserves persisted item unit-price snapshot.
- R04 amendment preserves persisted modifier price-delta snapshot.
- Quantity change multiplies existing snapshot price.
- Quantity change does not query current menu price.
- Quantity change does not query current menu availability.
- Special-request change does not change monetary values.
- Customer-note change does not change monetary values.
- Removing item removes its persisted line contribution.
- Order subtotal is recomputed server-side.
- Browser subtotal is prohibited.
- Browser line total is prohibited.
- Browser unit price is prohibited.
- Browser modifier price is prohibited.
- Recalculation uses integer minor-unit arithmetic.
- Mixed-currency invariant remains impossible.
- Negative computed totals fail as invariant violations.
- Order currency remains unchanged.
- R04 does not add speculative discount/tax/service-fee logic.

# 14. CHANGED Re-Review Semantics
- Successful accepted-order amendment moves operational status from `ACCEPTED` to `CHANGED`.
- `CHANGED` means persisted order content changed after initial acceptance.
- `CHANGED` requires explicit staff re-review.
- `CHANGED` must not automatically return to `ACCEPTED`.
- `CHANGED` must not automatically start preparation.
- R03 lifecycle actions reject `CHANGED`.
- Staff UI must visibly distinguish `CHANGED` from `PENDING_CONFIRMATION`.
- Re-review uses explicit accept/reject semantics.
- Re-accepting `CHANGED` returns to `ACCEPTED`.
- Re-rejecting `CHANGED` moves to `REJECTED` with reason evidence.
- R02 decision service should be extended narrowly.
- Allowed decision sources after R04 are exactly `PENDING_CONFIRMATION` and `CHANGED`.
- Decision event evidence must preserve true `from_status`.
- Initial acceptance event remains historical evidence.
- Re-acceptance appends new evidence.
- Rejection appends new evidence.

# 15. Customer-Status Mapping for Amendment
- Implementation must audit current persisted customer-status constraint.
- Preferred CHANGED mapping uses an existing non-terminal review-compatible customer status.
- If `SENT` already means awaiting staff confirmation, it may be reused for CHANGED.
- Do not invent an unconstrained string in application code.
- If a new customer status is truly required, use a forward-only migration.
- Update constraints when a new customer status is introduced.
- Update generated types if schema types change.
- Update tests if status vocabulary changes.
- Customer status is always server-selected.
- Browser payload never includes customer status.
- Re-accept restores the normal accepted customer status from R02.
- Re-reject uses the normal rejected customer status from R02.
- Implementation PR must record the final CHANGED mapping.

# 16. Cancellation Eligibility Policy
| Source status | R04 cancellation | Rationale |
|---|---|---|
| `PENDING_CONFIRMATION` | YES | not yet accepted; still operationally cancellable |
| `CHANGED` | YES | awaiting re-review; cancellation remains possible |
| `ACCEPTED` | YES | accepted but not terminal |
| `PREPARING` | YES | production exception requires explicit evidence |
| `READY` | YES | late operational exception before service completion |
| `SERVED` | NO | service completion already recorded |
| `PAYMENT_PENDING` | NO | payment-stage exception belongs to payment workflow |
| `PAID` | NO | financial reversal would be required |
| `CLOSED` | NO | terminal |
| `REJECTED` | NO | already terminal decision |
| `CANCELLED` | NO | already cancelled |
| `REMAKE` | NO | R05 owns remake |
| `VOIDED` | NO | already terminal/financially exceptional |
- Cancellation eligibility is encoded server-side.
- Exact source-status predicate participates in the update.
- READY cancellation is deliberately bounded before SERVED.
- Implementation may narrow eligible sources if actual product authority requires narrower safety.
- Implementation must not broaden into payment/closed states without a later spec.

# 17. Cancellation Reason Taxonomy
- `STAFF_REQUEST`
- `CUSTOMER_REQUEST`
- `ITEM_UNAVAILABLE`
- `CAPACITY_LIMIT`
- `STORE_CLOSING`
- `DUPLICATE_ORDER`
- `OPERATIONAL_ERROR`
- `OTHER`
- Cancellation reason is mandatory.
- Cancellation reason is machine-readable.
- Cancellation reason is bounded.
- Unknown reason fails validation.
- Free-text reason is not required by default.
- Optional note, if implemented, is bounded untrusted text.
- Reason code persists in durable evidence.
- Reason never influences authorization.

# 18. Cancellation State Effects
- Successful cancellation sets operational status `CANCELLED`.
- Customer status uses an existing cancellation-compatible value or a forward migration if required.
- Cancellation sets database-generated timestamp evidence when current schema supports it or adds one if required.
- Acting staff evidence is server-derived.
- Append durable `ORDER_CANCELLED` event or canonical repository-equivalent event type.
- Event `from_status` is actual eligible source.
- Event `to_status` is `CANCELLED`.
- Event actor comes from AccessContext.
- Event reason contains cancellation reason code.
- Order update and event insertion commit together.
- Order update and event insertion roll back together.
- Cancellation does not delete order items.
- Cancellation does not delete prior events.
- Cancellation does not erase prior lifecycle timestamps.
- Cancellation does not execute refunds.
- Cancellation does not void payments.
- Cancellation does not mutate kitchen tickets.
- Cancellation does not publish realtime.
- Cancellation does not deliver notifications.

# 19. Exception Evidence Model
- `foodflow.order_events` remains primary append-oriented history.
- Amendment appends `ORDER_CHANGED`.
- Cancellation appends `ORDER_CANCELLED`.
- Re-accept from CHANGED appends acceptance evidence with `from_status=CHANGED`.
- Re-reject from CHANGED appends rejection evidence with `from_status=CHANGED`.
- Amendment event reason uses bounded change category rather than raw payload.
- Cancellation event reason uses bounded cancellation code.
- Do not persist raw HTTP body into event reason.
- Do not persist auth/session secrets.
- Do not persist customer capability tokens.
- Actor ID is server-derived.
- Occurred-at timestamp is database-derived.
- Event insertion is transactionally coupled.
- Historical events remain append-only.

# 20. Amendment Change Categories
- `CUSTOMER_NOTE`
- `ITEM_QUANTITY`
- `ITEM_SPECIAL_REQUEST`
- `ITEM_REMOVED`
- `MULTIPLE_FIELDS`
- Use aggregate category when multiple bounded edits occur.
- Detailed field IDs need not be embedded in event if schema lacks structured metadata.
- Do not add unbounded JSON audit payload solely for convenience.
- Implementation PR states exact evidence choice.

# 21. Existing File Responsibility Audit
| Existing path | Current responsibility | R04 action |
|---|---|---|
| `src/modules/order-operations/server/order-queue-repository.ts` | R01 durable queue/detail query authority | reuse; extend narrowly if exception evidence must appear |
| `src/modules/order-operations/server/order-queue-service.ts` | R01 authorized read orchestration | reuse |
| `src/modules/order-operations/server/order-decision-repository.ts` | R02 exact accept/reject writes/events | modify narrowly for CHANGED re-review |
| `src/modules/order-operations/server/order-decision-service.ts` | R02 decision validation/authorization | modify narrowly for CHANGED source |
| `src/modules/order-operations/server/order-lifecycle-repository.ts` | R03 normal lifecycle writes/events | preserve; do not broaden with exceptions |
| `src/modules/order-operations/server/order-lifecycle-service.ts` | R03 normal lifecycle action map | preserve; do not add AMEND/CANCEL |
| `src/modules/order-operations/server/http.ts` | shared internal transport parsing/error mapping | extend carefully |
| `src/modules/order-operations/server/errors.ts` | shared operational error classes | extend carefully |
| `src/modules/order-operations/server/types.ts` | shared server-only order contracts | extend |
| `src/features/staff/operational-orders-workspace.tsx` | server-backed Staff Orders UX | extend |

# 22. Expected Server Module Boundary
- Prefer extending `src/modules/order-operations/server/`.
- Candidate `order-exception-service.ts` owns amendment/cancellation orchestration.
- Candidate `order-exception-repository.ts` owns transaction-bound exception writes.
- Candidate validation helper may be separated if complexity warrants.
- Reuse shared `errors.ts`.
- Reuse shared `http.ts`.
- Extend `types.ts` with exception contracts.
- Extend `index.ts` with narrow exports.
- Do not create a new top-level operations module.
- Do not create client-importable server authority helpers.

# 23. Files to CREATE
| Path | Responsibility |
|---|---|
| `apps/web/next-flow/src/modules/order-operations/server/order-exception-service.ts` | authorized amendment/cancellation orchestration |
| `apps/web/next-flow/src/modules/order-operations/server/order-exception-repository.ts` | transaction-bound scoped exception writes |
| `apps/web/next-flow/src/app/api/internal/orders/[id]/exception/route.ts` | strict internal exception transport |
| `apps/web/next-flow/tests/unit/operational-order-exception.test.ts` | pure validation/mapping/error tests |
| `apps/web/next-flow/tests/integration/operational-order-exception.test.ts` | real DB authorization/concurrency/rollback tests |
| `supabase/tests/database/p04_r04_order_exception_boundary.test.sql` | role/grant/RLS/status/evidence assertions |
- Exact file split may consolidate service/validation without changing responsibilities.
- Do not create duplicate transport routes if existing route composition gives a clearer narrow contract.

# 24. Files to MODIFY
| Path | Required change |
|---|---|
| `apps/web/next-flow/src/modules/order-operations/server/types.ts` | exception actions, cancellation reasons, amendment/result contracts |
| `apps/web/next-flow/src/modules/order-operations/server/errors.ts` | exception error codes and safe classification |
| `apps/web/next-flow/src/modules/order-operations/server/http.ts` | bounded body parsing and exception HTTP mapping |
| `apps/web/next-flow/src/modules/order-operations/server/index.ts` | narrow exports |
| `apps/web/next-flow/src/modules/order-operations/server/order-decision-service.ts` | exact CHANGED re-review without broad arbitrary sources |
| `apps/web/next-flow/src/modules/order-operations/server/order-decision-repository.ts` | exact source status and true event from_status |
| `apps/web/next-flow/src/features/staff/operational-orders-workspace.tsx` | amend/cancel/re-review UI and durable reconciliation |
| `apps/web/next-flow/package.json` | test discovery only if scripts require it |
- Modify queue/detail DTO only if exception evidence must be displayed.
- Modify generated DB types only if schema changes.

# 25. Files to MOVE
- None expected.
- Do not move R01 modules for aesthetics.
- Do not move R02 modules for aesthetics.
- Do not move R03 modules for aesthetics.
- If a move is necessary to prevent a circular dependency, update all consumers atomically.

# 26. Files to REMOVE
- None expected.
- Do not remove R02 decision modules.
- Do not remove R03 lifecycle modules.
- Do not remove historical migrations.
- Do not delete prior tests to avoid new regression failures.

# 27. Do-Not-Touch Boundary
- Customer capability implementation.
- Customer data-access implementation.
- Customer cart/order persistence implementation.
- Customer command idempotency implementation.
- Payment provider code.
- Kitchen routing code.
- Realtime infrastructure.
- Notification infrastructure.
- Auth.js provider configuration.
- AccessContext semantics.
- Permission catalog unless an actual missing permission defect is reproduced.
- Unrelated staff tabs.
- Unrelated menu management UI.
- Historical Phase 03 migrations.
- Historical P04 R01 migrations.
- Historical P04 R02 migrations.
- R03 normal lifecycle map except a reproduced defect required for R04 compatibility.

# 28. Exception Service Responsibilities
- Require current authorized AccessContext.
- Require branch context.
- Require `order.manage`.
- Convert AccessContext to trusted operational context.
- Validate action type.
- Validate command body.
- Select exact exception path.
- Delegate persistence to transaction-bound repository.
- Map zero-row result to same-scope state classification.
- Enforce result invariants.
- Return narrow domain result.
- Never perform route-local SQL.
- Never perform payment provider calls.
- Never perform kitchen calls.
- Never perform realtime publication.
- Never perform notification delivery.
- Never start a second independent transaction.

# 29. Exception Repository Responsibilities
- Accept a DatabaseTransaction.
- Accept TrustedOperationalOrderContext.
- Use tenant predicate.
- Use branch predicate.
- Use order UUID predicate.
- Use exact source status.
- Lock order row before multi-row amendment.
- Load item snapshots in bounded queries.
- Load modifier snapshots in bounded queries.
- Validate item ownership.
- Apply bounded child changes.
- Recompute line totals.
- Recompute subtotal.
- Set CHANGED state for amendment.
- Set CANCELLED state for cancellation.
- Set server-derived actor evidence.
- Set database-derived time evidence.
- Append order event.
- Return narrow mutation row.
- Expose same-scope state classification.
- Do not expose generic unrestricted patch helpers.

# 30. Command Contract — AMEND_ACCEPTED_ORDER
```ts
interface AmendAcceptedOrderCommand {
  readonly orderId: string;
  readonly customerNote?: string | null;
  readonly itemChanges: readonly OrderItemAmendment[];
}

type OrderItemAmendment =
  | { readonly itemId: string; readonly quantity: number }
  | { readonly itemId: string; readonly specialRequest: string | null }
  | { readonly itemId: string; readonly remove: true };
```
- Exact final shape may differ while preserving authority boundaries.
- Order ID is UUID-validated.
- Every item ID is UUID-validated.
- Unknown keys fail.
- Empty amendment fails.
- Duplicate item IDs fail or normalize deterministically before persistence.
- Quantity is bounded positive integer.
- Special request is bounded text.
- Remove cannot combine with quantity in same item operation.
- Remove cannot combine with specialRequest in same item operation unless final contract explicitly defines deterministic precedence.

# 31. Request Body Strictness — AMEND
| Key | Presence | Contract |
|---|---|---|
| `action` | required | exact `AMEND` |
| `customerNote` | optional | string/null within bound |
| `itemChanges` | required when no note change | array within operation limit |
| `itemChanges[].itemId` | required | UUID |
| `itemChanges[].quantity` | conditional | positive integer |
| `itemChanges[].specialRequest` | conditional | string/null within bound |
| `itemChanges[].remove` | conditional | `true` only |
- At least one semantic change is required.
- Unknown nested keys fail.
- Empty itemChanges with no note change fails.
- Null and absent have deliberate semantics only where useful.

# 32. Command Contract — CANCEL_ORDER
```ts
interface CancelOperationalOrderCommand {
  readonly orderId: string;
  readonly reasonCode: OperationalOrderCancellationReasonCode;
  readonly note?: string | null;
}
```
- Order ID is selector only.
- Reason code is mandatory.
- Optional note is bounded if implemented.
- Target status is not accepted.
- Customer status is not accepted.
- Actor ID is not accepted.
- Tenant is not accepted.
- Branch is not accepted.
- Cancellation timestamp is not accepted.

# 33. Request Body Strictness — CANCEL
| Key | Presence | Contract |
|---|---|---|
| `action` | required | exact `CANCEL` |
| `reasonCode` | required | bounded enum |
| `note` | optional | plain text/null within bound |
- Any amendment field in CANCEL fails.
- Any target status field fails.
- Any customer status field fails.
- Any actor field fails.
- Any tenant field fails.
- Any branch field fails.
- Any timestamp field fails.

# 34. Command Result — Amendment
- Result includes order ID.
- Result includes order number.
- Result includes `fromStatus=ACCEPTED`.
- Result includes `status=CHANGED`.
- Result includes server-selected customer status.
- Result includes server-computed subtotal.
- Result includes currency.
- Result includes database-derived changed timestamp/event time when exposed.
- Result does not return tenant authority unnecessarily.
- Result does not return branch authority unnecessarily.
- Result does not return session material.

# 35. Command Result — Cancellation
- Result includes order ID.
- Result includes order number.
- Result includes actual source status.
- Result includes `status=CANCELLED`.
- Result includes server-selected customer status.
- Result includes cancellation reason.
- Result includes database-derived cancellation timestamp.
- Result does not return auth/session secrets.
- Result does not claim refund execution.
- Result does not claim kitchen cancellation execution.

# 36. HTTP Transport
- Prefer `POST /api/internal/orders/[id]/exception` with explicit action discriminator.
- Alternative explicit amend/cancel routes are acceptable if current conventions clearly favor them.
- Do not expose generic PATCH status mutation.
- Accepted actions are exact and bounded.
- Require internal staff authentication.
- Resolve current AccessContext server-side.
- Apply same-origin protection consistent with R02/R03.
- Use bounded JSON body size.
- Reject malformed JSON.
- Reject non-object JSON.
- Reject arrays.
- Reject unknown semantic fields.
- Return `Cache-Control: no-store`.
- Validation errors map to stable safe 4xx.
- Stale/illegal source state maps to 409.
- Missing/hidden cross-scope resource maps safely.
- Authorization denial does not leak branch existence.
- Infrastructure unavailable maps to bounded 5xx.

# 37. Authorization
- Every exception command requires Auth.js internal identity.
- Every exception command requires resolved branch AccessContext.
- Every exception command requires `order.manage`.
- `order.view` alone is insufficient.
- `operations.staff.access` shell visibility alone is insufficient.
- Tenant comes from AccessContext.
- Branch comes from AccessContext.
- Actor comes from AccessContext.
- Browser actor field is forbidden.
- Browser tenant field is forbidden.
- Browser branch field is forbidden.
- Cross-tenant order UUID must not become accessible.
- Sibling-branch order UUID must not become accessible.
- Revoked membership fails on next authorization evaluation.
- Removed permission fails on next authorization evaluation.
- Auth.js session need not be rewritten for permission changes.

# 38. Repository Scope Predicates
- Order update includes `tenant_id = context.tenantId`.
- Order update includes `branch_id = context.branchId`.
- Order update includes exact order UUID.
- Amendment update includes `status = ACCEPTED`.
- Cancellation update includes exact allowed cancellation source set.
- Order-item mutation verifies same tenant/order ownership.
- Never update item by item UUID alone.
- Never delete item by item UUID alone.
- Never trust body-provided order relation per item.
- Same-scope state lookup remains tenant/branch constrained.

# 39. Amendment Item Ownership Verification
- Collect all item IDs from request.
- UUID-validate each item ID.
- Reject duplicates or normalize deterministically.
- Load items through tenant + order scope.
- Compare loaded count with requested distinct count.
- Missing item fails safely.
- Item from another order fails.
- Item from another branch fails.
- Item from another tenant fails.
- Browser cannot supply order relation for item.
- Browser cannot supply tenant relation for item.

# 40. Order-Item Mutation Invariants
- Order retains at least one item.
- Quantity remains positive integer.
- Quantity remains bounded.
- Line total remains non-negative.
- Modifier snapshots remain attached to their item.
- Removing item removes/cascades modifier rows consistently.
- No orphan modifier rows.
- Menu item snapshot identity is immutable.
- Preparation station snapshot is immutable.
- Menu item display-name snapshot is immutable.
- Modifier display-name snapshot is immutable.
- Unit price snapshot is immutable.
- Modifier price-delta snapshot is immutable.
- Currency is immutable.

# 41. Quantity Change Semantics
- Quantity minimum is 1.
- Quantity maximum matches established bound, expected 99.
- Quantity change does not query current menu availability.
- Quantity change does not query current menu price.
- Quantity change uses stored unit price.
- Quantity change uses stored modifier deltas.
- Quantity change recomputes line total.
- Quantity change recomputes subtotal.
- Quantity change moves order to CHANGED.
- Quantity change cannot occur after production starts.

# 42. Special-Request Change Semantics
- Special request is plain untrusted text.
- Clearing to null is allowed when schema permits.
- Whitespace normalization follows established command conventions.
- Hard server maximum is required.
- HTML interpretation is prohibited.
- Special-request change does not change money.
- Special-request change does not change menu identity.
- Special-request change does not change station.
- Special-request change moves order to CHANGED.
- Durable refetch is authoritative after success.

# 43. Customer-Note Change Semantics
- Customer-note amendment is an operational correction.
- UI should label it clearly if exposed.
- Clear-to-null is allowed when schema permits.
- Hard server maximum is required.
- Customer-note change still requires CHANGED re-review.
- Full note should not be logged.
- Note is not cancellation reason authority.
- Note is not payment instruction transport.
- Note is not kitchen routing authority.

# 44. Remove-Item Semantics
- Removal applies only to existing order-item snapshot.
- Removal is allowed only from ACCEPTED.
- Verify cascade behavior for modifiers.
- If cascade absent, delete modifier children within same transaction.
- Do not orphan modifiers.
- Do not delete menu source rows.
- Do not delete prior order events.
- Recalculate subtotal after removal.
- Reject removal of final remaining item.
- Successful removal contributes to ORDER_CHANGED evidence.

# 45. Snapshot Integrity
- `menu_item_id` immutable under amendment.
- `menu_item_name` immutable under amendment.
- `menu_item_thai_name` immutable under amendment.
- `preparation_station` immutable under amendment.
- `unit_price_minor` immutable under amendment.
- `modifier_group_id` immutable under amendment.
- `modifier_group_name` immutable under amendment.
- `modifier_choice_id` immutable under amendment.
- `modifier_choice_name` immutable under amendment.
- `price_delta_minor` immutable under amendment.
- `currency` immutable under amendment.
- Quantity is bounded mutable.
- Special request is bounded mutable.
- Customer note is bounded mutable.
- Whole-line removal is bounded mutable.

# 46. Subtotal Recalculation
- Per item line total = `(unitPriceMinor + modifierDeltaSum) × quantity`.
- Use persisted snapshots only.
- Use bigint/integer minor-unit arithmetic.
- Sum all remaining line totals.
- Persist updated line total when current schema treats it as durable snapshot.
- Persist updated order subtotal.
- Customer-note-only edit leaves money unchanged.
- Special-request-only edit leaves money unchanged.
- Removing item subtracts full line snapshot contribution.
- Browser total is never accepted.

# 47. Amendment Transaction Sequence
1. Begin authorized branch transaction.
2. Verify `order.manage`.
3. Load and lock scoped ACCEPTED order.
4. Load durable order items.
5. Load required modifier snapshots.
6. Validate all item selectors belong to order.
7. Validate bounded changes.
8. Apply quantity changes.
9. Apply special-request changes.
10. Apply item removals.
11. Ensure at least one item remains.
12. Recompute line totals.
13. Recompute order subtotal.
14. Update aggregate subtotal.
15. Transition order to CHANGED.
16. Set server-derived actor evidence.
17. Set database-derived change evidence.
18. Append ORDER_CHANGED event.
19. Map invariant-checked result.
20. Commit.
- All persistence steps use same transaction.
- No nested independent transaction.
- Any failure rolls back every prior write.

# 48. Cancellation Transaction Sequence
1. Begin authorized branch transaction.
2. Verify `order.manage`.
3. Attempt exact scoped cancellation update from eligible source state.
4. Set operational status CANCELLED.
5. Set server-selected customer status.
6. Set database cancellation timestamp/evidence.
7. Set acting staff evidence.
8. Append ORDER_CANCELLED event.
9. Event uses actual previous status.
10. Event stores cancellation reason.
11. Map invariant-checked result.
12. Commit.
- Zero-row update triggers same-scope state classification.
- Conflict never appends cancellation event.
- Cancellation never mutates payment/kitchen/realtime state.

# 49. CHANGED Re-Decision Extension
- Current R02 source status is `PENDING_CONFIRMATION` only.
- R04 extends trusted decision source set to `PENDING_CONFIRMATION` and `CHANGED` only.
- Browser still sends only accept/reject intent.
- Browser never sends trusted source status.
- Accept from PENDING_CONFIRMATION preserves R02 behavior.
- Reject from PENDING_CONFIRMATION preserves R02 behavior.
- Accept from CHANGED returns order to ACCEPTED.
- Reject from CHANGED moves order to REJECTED.
- Decision event `from_status` must match actual source.
- Do not permit PREPARING decision.
- Do not permit READY decision.
- Do not permit SERVED decision.
- Do not permit CANCELLED decision.
- Do not remove source-state predicate.

# 50. Re-Decision Implementation Options
- Preferred: parameterize R02 repository with trusted source enum.
- Alternative: explicit `acceptChanged()` and `rejectChanged()` methods reusing private helpers.
- Prohibited: generic `acceptFromCurrentStatus()` without bounded source set.
- Prohibited: browser-supplied source status.
- Prohibited: generic target status update.
- Unit tests must prove exact allowed sources.

# 51. Decision Event From-Status Accuracy
- Initial accept event source remains PENDING_CONFIRMATION.
- Initial reject event source remains PENDING_CONFIRMATION.
- Changed re-accept event source is CHANGED.
- Changed re-reject event source is CHANGED.
- Target remains ACCEPTED or REJECTED.
- Do not hard-code PENDING_CONFIRMATION in event writer after R04 extension.

# 52. Re-Decision Timestamp Semantics
- Audit current `accepted_at` semantics.
- Decide whether aggregate accepted_at means first accept or latest current accept.
- Append-only events remain authoritative history.
- Preferred aggregate behavior may update accepted_at on re-accept if current read semantics expect latest acceptance.
- Do not erase prior acceptance event.
- Rejected-at remains terminal rejection timestamp.
- Implementation PR documents chosen aggregate timestamp semantics.

# 53. Cancellation Timestamp Semantics
- Prefer existing `cancelled_at` if present.
- If absent and timestamp is required, add a nullable timestamptz column in a forward migration.
- Timestamp comes from PostgreSQL clock expression.
- Browser time is never authoritative.
- Application server clock is not preferred over DB time for durable evidence.

# 54. Cancellation Reason Persistence Options
- Option A: dedicated order cancellation reason column when existing/current-state read needs it.
- Option B: immutable `order_events.reason` only when current-state DTO does not require separate reason column.
- Do not duplicate data without a read-model reason.
- If aggregate reason is added, event reason is still required.
- Implementation PR declares chosen strategy.
- Do not misuse `rejection_reason` unless schema explicitly defines shared exception semantics and naming remains truthful.

# 55. Cancellation Actor Evidence
- Existing `modified_by_staff` may represent latest mutating actor.
- ORDER_CANCELLED event actor is required historical evidence.
- Dedicated cancelled_by_staff is not required by default.
- Populate an existing dedicated actor field if one already exists.
- Do not add redundant actor columns without read-model need.

# 56. Amendment Actor Evidence
- `modified_by_staff` should identify latest amendment actor if that is established semantics.
- ORDER_CHANGED event actor identifies amendment actor.
- Later re-review event actor identifies reviewer.
- Amendment actor and reviewer may differ.
- Prior event actors are immutable.

# 57. Cancellation and CHANGED Interaction
- CHANGED may be cancelled without re-accept first.
- Cancellation from CHANGED records `from_status=CHANGED`.
- Cancellation does not erase ORDER_CHANGED evidence.
- Cancellation does not fabricate rejection reason.
- Cancellation reason taxonomy remains separate from rejection taxonomy.

# 58. No Silent Auto-Reaccept
- Amendment never leaves order ACCEPTED after durable content changes.
- Amendment never calls START_PREPARING automatically.
- Amendment never re-runs accept logic in same request.
- Re-review is a distinct staff intent.
- Separation preserves independent amendment/review actors.

# 59. Interaction with R03 Lifecycle
- R03 START_PREPARING source remains ACCEPTED.
- CHANGED blocks START_PREPARING.
- Re-accept CHANGED restores ACCEPTED.
- Cancellation from ACCEPTED competes with START_PREPARING.
- Cancellation from PREPARING competes with MARK_READY.
- Cancellation from READY competes with MARK_SERVED.
- R03 lifecycle service does not understand amendment payloads.
- R03 lifecycle repository does not write cancellation reasons.
- Keep exception actions outside normal lifecycle action map when possible.

# 60. Status-by-Action Matrix
- `PENDING_CONFIRMATION` → AMEND=DENY; CANCEL=ALLOW; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `CHANGED` → AMEND=DENY; CANCEL=ALLOW; RE-REVIEW=ALLOW; NORMAL_LIFECYCLE=NONE.
- `ACCEPTED` → AMEND=ALLOW; CANCEL=ALLOW; RE-REVIEW=DENY; NORMAL_LIFECYCLE=START_PREPARING.
- `PREPARING` → AMEND=DENY; CANCEL=ALLOW; RE-REVIEW=DENY; NORMAL_LIFECYCLE=MARK_READY.
- `READY` → AMEND=DENY; CANCEL=ALLOW; RE-REVIEW=DENY; NORMAL_LIFECYCLE=MARK_SERVED.
- `SERVED` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `PAYMENT_PENDING` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `PAID` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `CLOSED` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `REJECTED` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `CANCELLED` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- `REMAKE` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE in R04.
- `VOIDED` → AMEND=DENY; CANCEL=DENY; RE-REVIEW=DENY; NORMAL_LIFECYCLE=NONE.
- Server owns this matrix.
- UI visibility is advisory only.

# 61. Customer-Status Audit Matrix
| Operational status | Existing/required mapping | R04 rule |
|---|---|---|
| PENDING_CONFIRMATION | current existing | preserve |
| ACCEPTED | `CONFIRMED` from R02 | preserve |
| CHANGED | audit required | prefer existing review/pending-compatible status |
| PREPARING | `PREPARING` from R03 | preserve |
| READY | `COMING_TO_TABLE` from R03 | preserve |
| SERVED | `SERVED` from R03 | preserve |
| REJECTED | `REJECTED` from R02 | preserve |
| CANCELLED | audit required | use valid cancellation-compatible status |
- Do not introduce invalid customer status in app code.
- Forward migration only if required.

# 62. Order Event Vocabulary Audit
| Event | Owner round | R04 behavior |
|---|---|---|
| `ORDER_ACCEPTED` | R02 | preserve |
| `ORDER_REJECTED` | R02 | preserve |
| `ORDER_PREPARING` | R03 | preserve |
| `ORDER_READY` | R03 | preserve |
| `ORDER_SERVED` | R03 | preserve |
| `ORDER_CHANGED` | R04 | required on amendment |
| `ORDER_CANCELLED` | R04 | required on cancellation |
- If event type is unconstrained text, do not add migration solely for enum restriction.
- If constrained, extend only required values.
- Event reason remains bounded machine-readable evidence.

# 63. Lock Ordering
- Amendment locks parent order first.
- Amendment then loads/mutates children.
- Multiple child updates use stable item-ID order when practical.
- R03 lifecycle and R04 exception paths must not introduce opposite lock order.
- Cancellation avoids unnecessary child locks.
- Do not hold locks across external calls.
- R04 has no external calls inside transaction.
- Deadlock errors remain truthful unless existing bounded retry policy applies.
- Do not add broad automatic retry for non-idempotent staff edits.

# 64. Amendment Concurrency Matrix
| Race | Authority | Expected outcome |
|---|---|---|
| AMEND vs START_PREPARING | exact ACCEPTED source + row lock | one winner; loser conflict |
| AMEND vs AMEND | row lock + status transition | one winner; second sees CHANGED |
| AMEND vs CANCEL | row lock/exact state | one winner; loser conflict |
| AMEND vs re-decision | re-decision only after CHANGED exists | no dual outcome |
| duplicate AMEND after success | source no longer ACCEPTED | conflict; no exact replay claim |
- Losing request never partially changes items.
- Losing request never appends success evidence.

# 65. Cancellation Concurrency Matrix
| Race | Boundary | Required result |
|---|---|---|
| CANCEL vs START_PREPARING from ACCEPTED | exact state/lock | one winner |
| CANCEL vs MARK_READY from PREPARING | exact state/lock | one winner |
| CANCEL vs MARK_SERVED from READY | exact state/lock | one winner |
| CANCEL vs CANCEL | exact state update | one success; later conflict/already cancelled |
| CANCEL vs REJECT from PENDING_CONFIRMATION | exact state update | one winner |
| CANCEL vs REACCEPT from CHANGED | exact state update | one winner |
| CANCEL vs REJECT_CHANGED | exact state update | one winner |
- No duplicate terminal evidence.
- No last-write-wins status overwrite.

# 66. Exact Conflict Classification
- Zero-row amendment update triggers same-scope state lookup.
- Same-scope missing order maps NOT_FOUND.
- Same-scope non-ACCEPTED order maps CONFLICT.
- Zero-row cancellation update triggers same-scope state lookup.
- Same-scope ineligible status maps CONFLICT.
- Cross-branch existence is never queried outside authorized branch scope.
- Another transaction winning first yields conflict on stale caller.
- Conflict does not transform into success without durable state evidence.

# 67. Amendment Rollback Matrix
- Order lock/read failure → no writes.
- Unknown item selector → no writes.
- Invalid quantity → no writes.
- Remove final item → no writes.
- Item update failure → all item/order/event changes rollback.
- Subtotal update failure → child changes rollback.
- CHANGED aggregate update failure → item changes rollback.
- ORDER_CHANGED insert failure → all amendment writes rollback.
- Result invariant failure before commit → transaction rollback.
- No partial changed state is allowed.

# 68. Cancellation Rollback Matrix
- Authorization failure → no order/event mutation.
- Ineligible source state → no order/event mutation.
- Scoped order missing → no mutation.
- Order update failure → no event.
- Event insert failure → order cancellation rolls back.
- Result invariant failure → transaction rolls back.
- Database unavailable before commit → no success claimed.
- No partial cancellation evidence is allowed.

# 69. Error Taxonomy
| Code | Meaning | Suggested HTTP |
|---|---|---:|
| `ORDER_EXCEPTION_INVALID_REQUEST` | malformed/unknown/unbounded input | 400 |
| `ORDER_EXCEPTION_NOT_FOUND` | same-scope resource absent | 404 |
| `ORDER_EXCEPTION_FORBIDDEN` | permission/workspace denied | 403 |
| `ORDER_EXCEPTION_CONFLICT` | stale or illegal source state | 409 |
| `ORDER_EXCEPTION_INVARIANT_VIOLATION` | server/data contract broken | 500 |
| `ORDER_EXCEPTION_UNAVAILABLE` | DB/authz infrastructure unavailable | 503 |
- Do not leak raw SQL errors.
- Do not return stack traces.
- Do not echo secret headers.
- Conflict may expose safe current operational status only if consistent with current R02/R03 behavior.

# 70. Constraint Failure Classification
- Reject known request-shape violations before SQL where practical.
- Constraint failures from valid-looking requests may indicate invariant defects.
- Do not expose PostgreSQL constraint names.
- Reproduced invariant defect maps to internal invariant failure.
- Do not label every DB error as conflict.
- Serialization/deadlock remains infrastructure/concurrency failure unless existing policy applies.

# 71. Database Schema Audit Gate
- Inspect exact R03 parent schema before migration.
- Confirm whether `foodflow.orders.cancelled_at` exists.
- Confirm whether cancellation reason column exists.
- Confirm whether change timestamp/evidence field exists.
- Confirm customer-status constraint allows planned CHANGED mapping.
- Confirm customer-status constraint allows planned CANCELLED mapping.
- Confirm order-event event type constraints.
- Confirm `modified_by_staff` semantics.
- Confirm flow_runtime item UPDATE permission behind RLS.
- Confirm flow_runtime item DELETE permission behind RLS.
- Do not add duplicate fields.
- Do not add new event table.
- Do not rewrite historical migrations.

# 72. Conditional Migration Strategy
- Default migration count is zero until audit proves a gap.
- Add `cancelled_at` only when absent and needed.
- Add cancellation reason column only when current-state read needs it.
- Add customer status only when no existing value fits safely.
- Extend event constraints only when they are constrained and new event types require it.
- Regenerate Kysely types when schema changes.
- Do not touch generated DB types when schema does not change.
- New evidence fields should be nullable for existing rows.
- No destructive production backfill.
- No synthetic events for historical rows.

# 73. RLS and Grant Requirements
- `flow_runtime` remains staff operational execution role.
- R04 does not grant customer roles staff exception authority.
- `flow_customer_runtime` cannot set CHANGED/CANCELLED directly.
- `flow_customer_entry` cannot update orders.
- `anon` cannot update orders.
- `authenticated` cannot bypass internal authorization by direct mutation.
- RLS preserves tenant isolation.
- RLS preserves branch isolation.
- Application predicates remain explicit despite RLS.
- order_events UPDATE remains revoked.
- order_events DELETE remains revoked.
- order_events INSERT remains limited to intended runtime path.
- Any SECURITY DEFINER uses fixed search_path.
- Any SECURITY DEFINER gets narrow execute grants.
- Prefer authorized transaction + scoped Kysely writes when sufficient.

# 74. Security — Mass Assignment
- Request field `tenantId` is prohibited.
- Request field `branchId` is prohibited.
- Request field `actorId` is prohibited.
- Request field `status` is prohibited.
- Request field `customerStatus` is prohibited.
- Request field `subtotalMinor` is prohibited.
- Request field `currency` is prohibited.
- Request field `unitPriceMinor` is prohibited.
- Request field `priceDeltaMinor` is prohibited.
- Request field `acceptedAt` is prohibited.
- Request field `preparingAt` is prohibited.
- Request field `readyAt` is prohibited.
- Request field `servedAt` is prohibited.
- Request field `cancelledAt` is prohibited.
- Request field `modifiedByStaff` is prohibited.
- Request field `orderNumber` is prohibited.
- Validation uses exact allowed keys.
- Do not spread request body into DB patch.
- Repository patches are constructed from validated/server values.

# 75. Security — Untrusted Text
- Customer note is untrusted plain text.
- Special request is untrusted plain text.
- Optional cancellation note is untrusted plain text.
- Do not intentionally store HTML.
- Do not render with `dangerouslySetInnerHTML`.
- Enforce server-side length bounds.
- Preserve Unicode/Thai text within bound.
- Do not log full untrusted text by default.
- Plain-text rendering is sufficient; bespoke sanitizer is unnecessary unless markup becomes a product feature.

# 76. Security — CSRF/Origin
- Internal exception route retains same-origin protection.
- Exception mutation is never GET.
- Cross-origin form-compatible mutation is not a feature.
- Session cookie alone is insufficient; order.manage remains required.
- Missing-Origin handling follows current internal route policy.
- Wrong-Origin tests are required.

# 77. Security — SQL Injection
- Use Kysely parameterization.
- Do not concatenate order UUID into raw SQL strings.
- Do not concatenate cancellation reason into raw SQL.
- Do not concatenate text note into raw SQL.
- Dynamic column selection, if any, comes only from server-defined enums.
- Browser never chooses arbitrary column name.

# 78. Observability
- Log safe command type.
- Log safe order UUID where current logging policy allows.
- Tenant/branch IDs only in internal structured logs where standard.
- Actor ID only where standard.
- Do not log session cookies.
- Do not log authorization headers.
- Do not log customer capability tokens.
- Do not log full customer note.
- Do not log full special request.
- Do not log raw request body.
- Conflict logs distinguish business conflict from infrastructure error.
- Constraint failures map without exposing SQL.

# 79. Performance
- Amendment uses bounded query count.
- Load order aggregate once under lock.
- Load all order items in one query.
- Load all modifiers in one query or one bounded batch.
- Avoid N+1 modifier query.
- Apply item changes deterministically.
- Cancellation requires no item-detail load by default.
- Queue refresh stays paginated.
- Detail refresh remains fixed-shape.
- Do not add event-history N+1 to queue list.

# 80. Resource Bounds
| Resource | Required bound |
|---|---|
| amendment item operations | max 100 or lower matching durable order max |
| quantity | 1..99 |
| customer note | existing/current product bound with hard server max |
| special request | existing/current product bound with hard server max |
| cancellation note | max 512 if supported |
| request body | reuse existing internal mutation body limit |
- Bounds must be enforced server-side.
- UI bounds do not replace server validation.

# 81. Read-After-Write Reconciliation
- Amendment success refetches durable queue/detail.
- Cancellation success refetches durable queue/detail.
- Conflict refetches durable state before showing next action.
- UI does not mutate local order object as source of truth.
- UI may disable controls while pending.
- UI clears pending state on response/error.
- CHANGED exposes re-review controls.
- CANCELLED exposes no normal lifecycle action.
- Cancelled row visibility follows filter semantics.
- Amended totals displayed after success come from server read model.

# 82. Staff UI — Amendment
- Show amend control only for ACCEPTED.
- Load current durable detail before editing.
- Expose only bounded R04 fields.
- Quantity editor enforces positive integer UX.
- Special-request editor is plain text.
- Remove-item action clearly identifies item.
- Save disabled when no semantic change.
- Save disabled while pending.
- Conflict shown when order advanced/cancelled elsewhere.
- Conflict reloads durable detail.
- Stale edit form is discarded/invalidated after conflict.
- Do not expose unit-price input.
- Do not expose modifier editor.
- Do not expose tenant/branch/table controls.

# 83. Staff UI — Cancellation
- Show cancel only for server-eligible statuses.
- Require explicit confirmation.
- Require one reason selection.
- Optional note is secondary and bounded.
- Explain cancellation as terminal order-domain action.
- Do not imply refund execution.
- Do not imply kitchen notification execution.
- Disable cancel while another mutation for same order is pending.
- Conflict reloads durable order.
- Success removes normal lifecycle controls.

# 84. Staff UI — CHANGED Re-Review
- CHANGED displays review-required state.
- CHANGED exposes Accept and Reject through extended decision path.
- CHANGED does not expose START_PREPARING.
- Re-accept restores ACCEPTED.
- Re-accept restores normal lifecycle action availability.
- Re-reject moves REJECTED.
- Cancellation remains available from CHANGED.
- Detail shows amended durable item snapshot.
- UI does not reconstruct old version from client memory.

# 85. Queue Filter Interaction
- R01 operational type already includes CHANGED.
- R01 operational type already includes CANCELLED.
- Preserve status parser support.
- Default incoming filter may include CHANGED and should remain deliberate.
- CANCELLED should not appear in default incoming queue unless filter includes it.
- Amendment may keep/re-add order in review queue as CHANGED.
- Cancellation may remove row from current filtered list.
- Refetch behavior must tolerate row disappearance after cancellation.

# 86. Detail DTO Interaction
- Detail continues returning durable item snapshots.
- Amended quantities visible after refetch.
- Amended special requests visible after refetch.
- Removed item absent after refetch.
- Updated subtotal visible after refetch.
- CHANGED visible after refetch.
- CANCELLED visible after refetch.
- Cancellation reason may be added narrowly if UI displays it.
- Do not expose internal RLS context.
- Do not expose customer capability IDs.
- Do not expose idempotency keys.

# 87. Stale Editor Protection
- Exact source status ACCEPTED is minimum stale guard.
- If reliable row version exists, implementation may include expected version.
- Do not invent client-trusted timestamps without DB enforcement.
- Two sequential edits opened from same ACCEPTED snapshot naturally conflict after first moves to CHANGED.
- This exact-state behavior is sufficient for R04.
- Do not add generic optimistic-lock framework unless current schema already supports it cleanly.

# 88. Ambiguous Response Semantics
- Network loss after staff mutation commit is possible.
- R04 does not introduce generic staff idempotency replay store.
- Recovery is durable read-after-write refresh.
- Committed amendment leaves CHANGED + amended data.
- Committed cancellation leaves CANCELLED.
- Retry amendment after committed success conflicts because source is no longer ACCEPTED.
- Retry cancellation after committed success conflicts/already-cancelled.
- UI should refresh durable state on ambiguous outcome.
- Do not claim exact replay semantics not implemented.

# 89. No Hidden Financial Side Effects
- Quantity amendment changes order subtotal snapshot only.
- Item removal changes order subtotal snapshot only.
- Cancellation does not void payment.
- Cancellation does not refund payment.
- PAYMENT_PENDING cancellation is excluded.
- PAID cancellation is excluded.
- R04 does not mutate payment tables.
- R04 does not call payment-provider SDKs.

# 90. No Hidden Kitchen Side Effects
- R04 does not create kitchen ticket.
- R04 does not delete kitchen ticket.
- R04 does not route stations.
- R04 does not publish cancellation to kitchen realtime.
- Cancellation from PREPARING/READY records order-domain state only.
- Later kitchen phase must reconcile cancellation explicitly.
- Direct kitchen writes are prohibited.

# 91. No Hidden Realtime/Notification Side Effects
- R04 does not publish websocket events explicitly.
- R04 does not publish Supabase realtime explicitly.
- R04 does not send LINE notifications.
- R04 does not send email.
- R04 does not send push notifications.
- UI learns outcome through response/refetch.
- order_events are audit evidence, not notification transport.
- Do not add generic outbox in R04.

# 92. Compatibility with Customer View
- R04 changes durable order state future customer status views may read.
- Customer capability gains no staff mutation authority.
- Customer app does not send staff exception commands.
- CHANGED customer mapping must satisfy persisted constraint.
- CANCELLED customer mapping must satisfy persisted constraint.
- R04 does not implement customer approval of staff changes.
- R04 does not expose staff actor identity to customer by default.

# 93. Rolling Deployment Compatibility
- Old R03 code continues to read orders after forward R04 migration.
- New nullable cancellation/change fields must not break old reads.
- New customer-status values require compatibility audit.
- Prefer existing valid status values when semantically correct.
- R04 route is unavailable before code deployment even if migration lands first.
- Migration-first window must fail safely.
- Code-first window must fail safely if schema prerequisite missing.
- Customer-app deployment synchronization is not required.

# 94. Migration Safety
- Fresh database path must succeed when R04 migration exists.
- Existing rows remain valid.
- New nullable evidence columns avoid destructive backfill.
- Constraint replacements preserve all existing legal statuses.
- Do not drop historical statuses.
- Do not rewrite R02/R03 migrations.
- Generated type drift is checked when schema changes.
- Production destructive mutation is forbidden.

# 95. Database Test Matrix — Permissions
- [ ] flow_runtime scoped branch can perform intended exception write.
- [ ] flow_runtime sibling branch cannot amend.
- [ ] flow_runtime sibling branch cannot cancel.
- [ ] flow_runtime cross tenant cannot amend.
- [ ] flow_runtime cross tenant cannot cancel.
- [ ] flow_customer_runtime cannot set CHANGED.
- [ ] flow_customer_runtime cannot set CANCELLED.
- [ ] flow_customer_runtime cannot mutate order-item quantity as staff amendment.
- [ ] flow_customer_runtime cannot delete order item as staff amendment.
- [ ] flow_customer_entry cannot update orders.
- [ ] anon cannot update orders.
- [ ] customer/public roles cannot insert staff exception events.
- [ ] application runtime cannot UPDATE existing order_events.
- [ ] application runtime cannot DELETE existing order_events.

# 96. Database Test Matrix — Amendment Statuses
- [ ] ACCEPTED amendment succeeds.
- [ ] PENDING_CONFIRMATION amendment fails.
- [ ] CHANGED amendment fails.
- [ ] PREPARING amendment fails.
- [ ] READY amendment fails.
- [ ] SERVED amendment fails.
- [ ] PAYMENT_PENDING amendment fails.
- [ ] PAID amendment fails.
- [ ] CLOSED amendment fails.
- [ ] REJECTED amendment fails.
- [ ] CANCELLED amendment fails.
- [ ] REMAKE amendment fails.
- [ ] VOIDED amendment fails.
- [ ] No failed amendment writes ORDER_CHANGED.

# 97. Database Test Matrix — Cancellation Statuses
- [ ] PENDING_CONFIRMATION cancellation succeeds.
- [ ] CHANGED cancellation succeeds.
- [ ] ACCEPTED cancellation succeeds.
- [ ] PREPARING cancellation succeeds.
- [ ] READY cancellation succeeds.
- [ ] SERVED cancellation fails.
- [ ] PAYMENT_PENDING cancellation fails.
- [ ] PAID cancellation fails.
- [ ] CLOSED cancellation fails.
- [ ] REJECTED cancellation fails.
- [ ] CANCELLED cancellation fails.
- [ ] REMAKE cancellation fails in R04.
- [ ] VOIDED cancellation fails.
- [ ] Failed cancellation writes no ORDER_CANCELLED.

# 98. Database Test Matrix — Evidence
- [ ] ORDER_CHANGED event actor equals current staff actor.
- [ ] ORDER_CHANGED event from_status is ACCEPTED.
- [ ] ORDER_CHANGED event to_status is CHANGED.
- [ ] ORDER_CHANGED event timestamp is database-derived.
- [ ] ORDER_CANCELLED event actor equals current staff actor.
- [ ] ORDER_CANCELLED event from_status equals actual source.
- [ ] ORDER_CANCELLED event to_status is CANCELLED.
- [ ] ORDER_CANCELLED reason equals validated cancellation code.
- [ ] Re-accept event from_status is CHANGED.
- [ ] Re-reject event from_status is CHANGED.
- [ ] Prior events remain unchanged.

# 99. Database Test Matrix — Money
- [ ] quantity 1→2 recalculates line total.
- [ ] quantity 1→2 recalculates subtotal.
- [ ] quantity 2→1 recalculates line total.
- [ ] quantity 2→1 recalculates subtotal.
- [ ] remove item subtracts full line contribution.
- [ ] special-request-only change leaves money unchanged.
- [ ] customer-note-only change leaves money unchanged.
- [ ] modifier-bearing item quantity multiplies modifier delta.
- [ ] unit price remains unchanged.
- [ ] modifier price delta remains unchanged.
- [ ] currency remains unchanged.

# 100. Database Test Matrix — Item Integrity
- [ ] item selector from another order fails.
- [ ] item selector from sibling branch fails.
- [ ] item selector from another tenant fails.
- [ ] removing final item fails.
- [ ] removed item modifiers do not orphan.
- [ ] quantity zero fails.
- [ ] quantity negative fails.
- [ ] quantity over max fails.
- [ ] menu item identity remains unchanged.
- [ ] preparation station remains unchanged.
- [ ] item name snapshot remains unchanged.

# 101. Unit Test Matrix — AMEND Parsing
- [ ] valid AMEND parses.
- [ ] invalid order UUID rejects.
- [ ] empty AMEND rejects.
- [ ] unknown top-level field rejects.
- [ ] unknown nested field rejects.
- [ ] invalid item UUID rejects.
- [ ] duplicate item operations reject or normalize deterministically.
- [ ] quantity zero rejects.
- [ ] quantity negative rejects.
- [ ] quantity over maximum rejects.
- [ ] remove mixed with invalid extra fields rejects.
- [ ] overlong customer note rejects.
- [ ] overlong special request rejects.
- [ ] browser status field rejects.
- [ ] browser tenant field rejects.
- [ ] browser price field rejects.

# 102. Unit Test Matrix — CANCEL Parsing
- [ ] valid CANCEL parses.
- [ ] invalid order UUID rejects.
- [ ] missing reason rejects.
- [ ] empty reason rejects.
- [ ] unknown reason rejects.
- [ ] numeric reason rejects.
- [ ] array reason rejects.
- [ ] overlong note rejects when notes supported.
- [ ] amendment fields in CANCEL reject.
- [ ] target status field rejects.
- [ ] customerStatus field rejects.
- [ ] actor field rejects.
- [ ] tenant field rejects.
- [ ] branch field rejects.
- [ ] timestamp field rejects.

# 103. Unit Test Matrix — Reason Codes
- [ ] STAFF_REQUEST accepted.
- [ ] CUSTOMER_REQUEST accepted.
- [ ] ITEM_UNAVAILABLE accepted.
- [ ] CAPACITY_LIMIT accepted.
- [ ] STORE_CLOSING accepted.
- [ ] DUPLICATE_ORDER accepted.
- [ ] OPERATIONAL_ERROR accepted.
- [ ] OTHER accepted.
- [ ] lowercase variant behavior is deliberate and tested.
- [ ] unknown code fails.

# 104. Unit Test Matrix — Result Mapping
- [ ] amendment result requires CHANGED.
- [ ] amendment result requires valid customer-status mapping.
- [ ] amendment result requires valid subtotal.
- [ ] cancellation result requires CANCELLED.
- [ ] cancellation result requires valid reason.
- [ ] cancellation result requires valid timestamp.
- [ ] invalid Date maps invariant violation.
- [ ] status mismatch maps invariant violation.
- [ ] conflict maps stable 409 envelope.
- [ ] forbidden maps stable safe error.
- [ ] not-found maps stable safe error.
- [ ] unavailable maps stable safe error.

# 105. Integration Test Matrix — Amendment Happy Path
- [ ] authorized staff changes item quantity.
- [ ] authorized staff changes special request.
- [ ] authorized staff clears customer note.
- [ ] authorized staff removes one item from multi-item order.
- [ ] server recomputes line total.
- [ ] server recomputes subtotal.
- [ ] unit price remains unchanged.
- [ ] modifier snapshots remain unchanged.
- [ ] order becomes CHANGED.
- [ ] ORDER_CHANGED actor is current staff actor.
- [ ] ORDER_CHANGED timestamp is DB-generated.
- [ ] queue/detail refetch shows durable amended data.

# 106. Integration Test Matrix — CHANGED Re-Review
- [ ] CHANGED cannot START_PREPARING.
- [ ] CHANGED can be re-accepted.
- [ ] CHANGED re-accept returns ACCEPTED.
- [ ] CHANGED re-accept appends correct from_status event.
- [ ] CHANGED can be rejected.
- [ ] CHANGED reject persists rejection reason.
- [ ] CHANGED reject appends correct from_status event.
- [ ] PREPARING cannot use re-decision path.
- [ ] READY cannot use re-decision path.
- [ ] SERVED cannot use re-decision path.

# 107. Integration Test Matrix — Cancellation Happy Path
- [ ] cancel PENDING_CONFIRMATION.
- [ ] cancel CHANGED.
- [ ] cancel ACCEPTED.
- [ ] cancel PREPARING.
- [ ] cancel READY.
- [ ] cancellation reason persists.
- [ ] cancellation actor persists in event.
- [ ] cancellation timestamp is DB-generated.
- [ ] order becomes CANCELLED.
- [ ] normal lifecycle action unavailable after cancellation.
- [ ] item snapshots remain readable.
- [ ] prior decision/lifecycle events remain intact.

# 108. Integration Test Matrix — Authorization
- [ ] order.view without order.manage cannot amend.
- [ ] order.view without order.manage cannot cancel.
- [ ] staff shell access without order.manage cannot amend.
- [ ] staff shell access without order.manage cannot cancel.
- [ ] sibling-branch order behaves inaccessible.
- [ ] cross-tenant order behaves inaccessible.
- [ ] membership revocation denies next amendment.
- [ ] membership revocation denies next cancellation.
- [ ] permission removal denies next amendment.
- [ ] permission removal denies next cancellation.
- [ ] customer capability cannot call exception route as staff.

# 109. Concurrency Test Matrix — Amendment
- [ ] two concurrent AMEND requests produce one winner.
- [ ] two editors changing different items produce one winner.
- [ ] two editors changing same item produce one winner.
- [ ] remove-vs-quantity-change produces one winner.
- [ ] note-change vs START_PREPARING produces one winner.
- [ ] item-change vs START_PREPARING produces one winner.
- [ ] AMEND vs CANCEL produces one winner.
- [ ] loser creates no ORDER_CHANGED event.
- [ ] loser leaves no partial item writes.
- [ ] loser refreshes durable state through client reconciliation.

# 110. Concurrency Test Matrix — Cancellation
- [ ] CANCEL vs CANCEL produces one durable success.
- [ ] different cancellation reasons race with one winner.
- [ ] CANCEL vs START_PREPARING produces one winner.
- [ ] CANCEL vs MARK_READY produces one winner.
- [ ] CANCEL vs MARK_SERVED produces one winner.
- [ ] CANCEL vs initial REJECT produces one winner.
- [ ] CANCEL vs CHANGED REACCEPT produces one winner.
- [ ] CANCEL vs CHANGED REJECT produces one winner.
- [ ] loser writes no duplicate ORDER_CANCELLED.
- [ ] loser does not overwrite actor/reason/time.

# 111. Rollback Test Matrix
- [ ] ORDER_CHANGED insert failure rolls back quantity update.
- [ ] ORDER_CHANGED insert failure rolls back special-request update.
- [ ] ORDER_CHANGED insert failure rolls back item removal.
- [ ] ORDER_CHANGED insert failure rolls back subtotal.
- [ ] ORDER_CHANGED insert failure rolls back CHANGED status.
- [ ] ORDER_CANCELLED insert failure rolls back CANCELLED status.
- [ ] CHANGED re-accept event failure rolls back ACCEPTED.
- [ ] CHANGED reject event failure rolls back REJECTED.
- [ ] no partial evidence remains after rollback.
- [ ] no partial actor evidence remains after rollback.

# 112. HTTP/E2E Matrix
- [ ] accepted order detail shows amend control.
- [ ] accepted order detail shows cancel control.
- [ ] amend success reloads CHANGED detail.
- [ ] CHANGED shows re-review controls.
- [ ] CHANGED hides start-preparing action.
- [ ] re-accept restores accepted lifecycle action.
- [ ] cancel requires reason selection.
- [ ] cancel success reloads CANCELLED.
- [ ] CANCELLED hides normal lifecycle actions.
- [ ] stale amend conflict reloads durable state.
- [ ] stale cancel conflict reloads durable state.
- [ ] wrong-origin mutation denied.
- [ ] malformed body denied.
- [ ] customer session cannot authenticate exception route.
- [ ] price/status mass-assignment attempt denied.

# 113. Regression Matrix — R01
- [ ] durable queue remains server-backed.
- [ ] branch-scoped order.view remains enforced.
- [ ] keyset pagination remains deterministic.
- [ ] durable detail item snapshots remain readable.
- [ ] durable modifier snapshots remain readable.
- [ ] client demo order state does not regain authority.
- [ ] queue filter parser still accepts relevant statuses.

# 114. Regression Matrix — R02
- [ ] PENDING_CONFIRMATION accept still works.
- [ ] PENDING_CONFIRMATION reject still works.
- [ ] initial rejection reason taxonomy remains valid.
- [ ] initial accept/reject race remains one-winner.
- [ ] decision evidence remains append-only.
- [ ] CHANGED extension does not make PREPARING decision-eligible.
- [ ] CHANGED extension does not make READY decision-eligible.
- [ ] CHANGED extension does not make SERVED decision-eligible.

# 115. Regression Matrix — R03
- [ ] ACCEPTED → PREPARING still works.
- [ ] PREPARING → READY still works.
- [ ] READY → SERVED still works.
- [ ] illegal skips still conflict.
- [ ] lifecycle actor evidence remains correct.
- [ ] lifecycle timestamp evidence remains correct.
- [ ] lifecycle events remain append-only.
- [ ] CHANGED does not enter normal lifecycle until re-accept.
- [ ] CANCELLED never enters normal lifecycle.

# 116. Text Boundary Cases
- [ ] empty customer note normalization is deliberate.
- [ ] whitespace-only customer note normalization is deliberate.
- [ ] max-length customer note accepted.
- [ ] over-max customer note rejected.
- [ ] empty special request normalization is deliberate.
- [ ] max-length special request accepted.
- [ ] over-max special request rejected.
- [ ] Thai Unicode text accepted within bound.
- [ ] HTML-like text rendered as plain text.
- [ ] cancellation note bound enforced if note exists.

# 117. Money Boundary Cases
- [ ] quantity 1→2 doubles quantity-based snapshot contribution.
- [ ] quantity 2→1 reduces quantity-based snapshot contribution.
- [ ] remove item subtracts line snapshot.
- [ ] special-request-only change does not change money.
- [ ] note-only change does not change money.
- [ ] modifier-bearing quantity uses modifier delta.
- [ ] negative modifier delta remains valid only if final line total non-negative.
- [ ] currency never changes.
- [ ] browser-supplied money is rejected.

# 118. Cancellation Source-State Detailed Cases
- [ ] PENDING_CONFIRMATION → cancellation eligible.
- [ ] CHANGED → cancellation eligible.
- [ ] ACCEPTED → cancellation eligible.
- [ ] PREPARING → cancellation eligible.
- [ ] READY → cancellation eligible.
- [ ] SERVED → cancellation ineligible.
- [ ] PAYMENT_PENDING → cancellation ineligible.
- [ ] PAID → cancellation ineligible.
- [ ] CLOSED → cancellation ineligible.
- [ ] REJECTED → cancellation ineligible.
- [ ] CANCELLED → cancellation ineligible.
- [ ] REMAKE → cancellation ineligible in R04.
- [ ] VOIDED → cancellation ineligible.
- [ ] No event on ineligible source.
- [ ] No actor/reason/timestamp overwrite on ineligible source.

# 119. Amendment Source-State Detailed Cases
- [ ] PENDING_CONFIRMATION → amendment ineligible.
- [ ] CHANGED → amendment ineligible.
- [ ] ACCEPTED → amendment eligible.
- [ ] PREPARING → amendment ineligible.
- [ ] READY → amendment ineligible.
- [ ] SERVED → amendment ineligible.
- [ ] PAYMENT_PENDING → amendment ineligible.
- [ ] PAID → amendment ineligible.
- [ ] CLOSED → amendment ineligible.
- [ ] REJECTED → amendment ineligible.
- [ ] CANCELLED → amendment ineligible.
- [ ] REMAKE → amendment ineligible.
- [ ] VOIDED → amendment ineligible.
- [ ] No child mutation on ineligible source.
- [ ] No ORDER_CHANGED event on ineligible source.

# 120. Database Timestamp Invariants
- Amendment evidence timestamp is DB-derived.
- Cancellation timestamp is DB-derived.
- Re-decision timestamp is DB-derived.
- R03 lifecycle timestamps remain DB-derived.
- Returned ISO timestamp must parse.
- Failed command does not advance exception timestamp.
- Failed command does not overwrite prior lifecycle timestamp.
- Client-provided timestamp is rejected/ignored by schema because not accepted.

# 121. Terminal-State Invariants
- CANCELLED exposes no normal lifecycle action.
- REJECTED exposes no normal lifecycle action.
- SERVED exposes no R04 amendment action.
- SERVED exposes no R04 cancel action.
- PAYMENT_PENDING exposes no R04 cancel action.
- PAID exposes no R04 cancel action.
- CLOSED exposes no R04 cancel action.
- VOIDED exposes no R04 cancel action.
- Terminal states are never silently reopened.

# 122. Fresh Database Validation
- Fresh Supabase reset includes all prior migrations.
- If R04 adds migration, prove clean apply from zero.
- Existing R02 decision pgTAP runs after R04.
- Existing R03 lifecycle pgTAP runs after R04.
- New R04 exception pgTAP runs.
- Database lint runs.
- Generated Kysely types regenerate when required.
- Generated type drift remains clean.
- DB runtime integration includes new exception tests.

# 123. Unit Test Isolation
- Parser tests do not require DB runtime.
- Result mapping tests do not require Auth.js runtime.
- Route helper tests mock only necessary current-access boundary.
- DB integration tests do not mock repository internals.
- Concurrency tests use real DB transactions.
- Rollback tests inject actual transactional event failure or equivalent deterministic DB failure.
- Do not fabricate DB timestamp evidence with fake timers.
- Preserve server-only import compatibility with Vitest.

# 124. UI Pending-State Contract
- Only selected order mutation is pending.
- Disable conflicting controls for same order.
- Do not freeze unrelated orders globally.
- Preserve cancellation modal until response.
- Invalidate stale amendment form after conflict.
- Infrastructure failure allows retry after refetch.
- Do not claim success before server response.
- Clear pending state reliably on completion/error.

# 125. UI Accessibility
- Exception controls are keyboard reachable.
- Confirmation dialogs have accessible labels.
- Cancellation reason selector has label.
- Error text is readable/announced.
- Disabled state not conveyed by color only.
- Cancellation control has explicit destructive wording.
- Amendment validation messages are associated with fields.

# 126. UI Responsive Behavior
- Exception controls work on tablet staff devices.
- Modal/sheet does not overflow viewport.
- Quantity controls remain touch-friendly.
- Long Thai/English item names wrap safely.
- Cancellation reason list remains scrollable on small height.
- Do not redesign unrelated staff workspace.

# 127. Failure and Recovery Paths
| Failure | Response | Recovery |
|---|---|---|
| DB unavailable before transaction | unavailable/503 | retry after service recovery |
| authz data unavailable | unavailable/503 | retry; never downgrade permission |
| order absent in scope | not found | refresh queue |
| order wrong branch | hidden/not found safe | do not reveal existence |
| source status stale | conflict/409 | refresh durable detail |
| invalid item selector | invalid/not-found safe | correct request |
| event insert failure | invariant/unavailable | transaction rollback |
| constraint violation | safe invariant classification | inspect defect; no partial success |
| network lost after commit | ambiguous | refresh durable order |
- R04 recovery is durable-read based.
- No generic staff replay store is introduced.

# 128. Validation Commands
- Run `npm ci` when current workflow/package contract requires it.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run application/unit tests.
- Run integration tests.
- Run Next.js build.
- Run `supabase start` where DB validation is required.
- Run fresh local database reset.
- Run database SQL/pgTAP tests.
- Run database lint.
- Run DB type generation if schema changed.
- Run generated-type drift verification.
- Run DB runtime integration tests.
- Run relevant browser E2E if configured/available.
- Record only PASS / FAIL / NOT RUN / BLOCKED / NOT APPLICABLE.
- Never fabricate PASS.

# 129. Expected Required Validation Families
- Repository Integrity.
- Phase/Round Gate.
- Dependency Integrity if dependency files change.
- Next Flow Quality.
- Supabase Database Quality when applicable.
- Relevant browser E2E when required.
- Vercel Preview when repository reports it.
- R04 exception unit tests.
- R04 DB integration tests.
- R04 concurrency tests.
- R04 rollback tests.

# 130. PR Evidence — Lineage
- Record exact specification filename.
- Record current main authority SHA used at implementation start.
- Record R03 implementation parent branch.
- Record exact R03 parent SHA.
- Record R04 branch.
- Record R04 final head SHA.
- Record compare/lineage status.
- Record changed-file list.
- Record implementation PR number.
- Preserve owner-controlled merge.

# 131. PR Evidence — Schema
- State `MIGRATION_REQUIRED=YES|NO`.
- List migration filename when YES.
- State whether generated DB types changed.
- State final CHANGED customer-status mapping.
- State final CANCELLED customer-status mapping.
- State cancellation timestamp storage.
- State cancellation reason storage.
- State event vocabulary changes.
- State grant/RLS changes.
- State whether production destructive mutation occurred: must be NO.

# 132. PR Evidence — Behavior
- List exact amendment fields implemented.
- List exact amendment source status.
- List exact cancellation source statuses.
- List exact cancellation reason codes.
- State CHANGED re-decision policy.
- State money recalculation policy.
- State concurrency strategy.
- State rollback evidence.
- State read-after-write UI behavior.
- State no payment/kitchen side effects.

# 133. PR Evidence — Validation
- Record Repository Integrity result.
- Record Phase/Round Gate result.
- Record Dependency Integrity result when applicable.
- Record lint result.
- Record typecheck result.
- Record unit test result.
- Record integration test result.
- Record build result.
- Record DB reset result.
- Record pgTAP result.
- Record DB lint result.
- Record generated type drift result.
- Record DB runtime integration result.
- Record browser E2E result or truthful NOT RUN.

# 134. Known Limitations to Record
- No generic staff request-idempotency replay.
- No payment reversal.
- No kitchen cancellation propagation.
- No realtime publication.
- No notification delivery.
- No new menu items during amendment.
- No modifier replacement during amendment.
- No amendment after PREPARING.
- Cancellation excludes SERVED and later/payment states.
- No remake workflow.
- No priority/delay workflow.

# 135. Definition of Done — Architecture
- [ ] One canonical exception service exists.
- [ ] One canonical exception repository exists.
- [ ] No arbitrary status setter introduced.
- [ ] R02 decision path reused/extended for CHANGED.
- [ ] R03 normal lifecycle path preserved.
- [ ] Server/client authority boundary remains explicit.
- [ ] Route handlers contain no direct SQL mutation.
- [ ] Implementation branch descends from latest R03 lineage.

# 136. Definition of Done — Amendment
- [ ] ACCEPTED order can be amended through bounded fields only.
- [ ] Order becomes CHANGED.
- [ ] Item ownership is verified.
- [ ] Item set remains non-empty.
- [ ] Quantity bounds enforced.
- [ ] Snapshot price fields remain immutable.
- [ ] Subtotal recomputed from persisted snapshots.
- [ ] ORDER_CHANGED evidence persists atomically.
- [ ] CHANGED requires explicit re-review.
- [ ] Normal lifecycle cannot bypass re-review.

# 137. Definition of Done — Cancellation
- [ ] Only allowed source statuses can cancel.
- [ ] Cancellation requires reason.
- [ ] Order becomes CANCELLED.
- [ ] Customer status is valid/server-selected.
- [ ] Actor evidence persists.
- [ ] Timestamp evidence persists.
- [ ] Reason evidence persists.
- [ ] ORDER_CANCELLED event persists atomically.
- [ ] Prior items remain intact.
- [ ] Prior events remain intact.
- [ ] Normal lifecycle cannot resume.

# 138. Definition of Done — Security
- [ ] order.manage required.
- [ ] Cross-tenant mutation denied.
- [ ] Sibling-branch mutation denied.
- [ ] View-only staff denied.
- [ ] Customer roles denied.
- [ ] Mass assignment denied.
- [ ] Wrong origin denied.
- [ ] Secrets not logged.
- [ ] Untrusted text rendered safely.
- [ ] RLS remains defense in depth.

# 139. Definition of Done — Concurrency
- [ ] AMEND vs lifecycle one-winner proven.
- [ ] AMEND vs AMEND one-winner proven.
- [ ] AMEND vs CANCEL one-winner proven.
- [ ] CANCEL vs lifecycle one-winner proven.
- [ ] CANCEL vs CANCEL produces one durable terminal event.
- [ ] CHANGED decision vs CANCEL one-winner proven.
- [ ] Losing request leaves no partial writes.
- [ ] Conflict returns stable response.

# 140. Definition of Done — Rollback/Recovery
- [ ] Amendment event failure rolls back items.
- [ ] Amendment event failure rolls back subtotal.
- [ ] Amendment event failure rolls back CHANGED state.
- [ ] Cancellation event failure rolls back CANCELLED state.
- [ ] Re-decision event failure rolls back target state.
- [ ] UI refetches durable state after conflict.
- [ ] Ambiguous response limitation documented truthfully.

# 141. PR Scope Declaration
```text
IMPLEMENTATION_PHASE=P04
IMPLEMENTATION_ROUND=R04
CONTROLLED_ORDER_AMENDMENT=YES
CHANGED_REVIEW_SEMANTICS=YES
CHANGED_REDECISION=YES
CONTROLLED_ORDER_CANCELLATION=YES
CANCELLATION_REASON_EVIDENCE=YES
ORDER_MANAGE_PERMISSION=YES
SERVER_DERIVED_MONEY_RECALCULATION=YES
ARBITRARY_STATUS_MUTATION=NO
ARBITRARY_PRICE_MUTATION=NO
NEW_ITEM_ADDITION=NO
MODIFIER_REPLACEMENT=NO
PRIORITY_DELAY_REMAKE_WORKFLOW=NO
KITCHEN_ROUTING_REDESIGN=NO
PAYMENT_EXECUTION=NO
REALTIME_PUBLICATION=NO
NOTIFICATION_DELIVERY=NO
PHASE04_ACCEPTANCE=NO
IMPLEMENTATION_AGENT_MERGE=NO
AUTO_MERGE=NO
```

# 142. R05 Boundary
- R05 owns priority controls.
- R05 owns delay/defer controls.
- R05 owns remake exception workflow.
- R05 may add urgency/escalation metadata.
- R05 may add production exception semantics.
- R04 cancellation must not pretend to implement remake.
- R04 amendment stops before production.
- R04 does not become a production-change system.
- R05 inherits exact-state guard patterns.
- R05 inherits audit event patterns.

# 143. R06 Boundary
- R06 owns Phase 04 integrated acceptance.
- R06 proves R01 queue.
- R06 proves R02 decisions.
- R06 proves R03 normal lifecycle.
- R06 proves R04 amendment/re-review.
- R06 proves R04 cancellation.
- R06 proves R05 priority/delay/remake when implemented.
- R04 does not create `FLOW_P04_ACCEPTANCE.md`.
- R04 does not authorize Phase 05.

# 144. R05 Handoff Contract
- Durable queue/detail read plane remains available.
- Decision service handles initial and CHANGED re-review sources.
- Normal lifecycle engine remains canonical.
- Exception service provides bounded amendment.
- Exception service provides bounded cancellation.
- CHANGED has explicit semantics.
- CANCELLED has explicit semantics.
- Order events contain exception evidence.
- Exact-state concurrency guards are reusable.
- Staff workspace reflects durable exception outcomes.
- R05 can add priority/delay/remake without arbitrary update APIs.

# 145. R05 Must Not Need to Rebuild
- Auth.js identity.
- AccessContext.
- order.manage authorization.
- Operational queue/detail repository.
- Initial accept/reject parser.
- Normal lifecycle map.
- Exception error taxonomy.
- Branch isolation.
- Order-event audit pattern.
- Read-after-write staff reconciliation.

# 146. Stop Conditions During R04 Implementation
- Exact R04 spec missing from current main.
- R04 status not READY.
- Latest R03 lineage cannot be identified.
- R03 lifecycle implementation materially differs from authoring assumptions.
- Actual schema cannot represent CHANGED safely without broader redesign.
- Actual schema cannot represent cancellation safely without broader redesign.
- Amendment would require browser-controlled price authority.
- Cancellation would require payment reversal in same round.
- order.manage authorization cannot be preserved.
- RLS would need global weakening.
- Destructive production migration appears necessary.
- Existing data cannot satisfy required constraint without unsafe backfill.
- Work would require priority/delay/remake scope.
- In any such case stop and report exact blocker.

# 147. Implementation Order
1. Re-read current main policy and R04 spec.
2. Identify exact R03 parent branch/head.
3. Audit current orders/item/event schema.
4. Lock final CHANGED customer-status mapping.
5. Lock final CANCELLED customer-status mapping.
6. Lock cancellation evidence storage strategy.
7. Extend types and pure validation.
8. Extend decision source semantics for CHANGED.
9. Implement exception repository.
10. Implement exception service.
11. Implement HTTP transport.
12. Integrate staff workspace.
13. Add unit tests.
14. Add integration tests.
15. Add concurrency tests.
16. Add rollback tests.
17. Add pgTAP/database tests.
18. Add migration only if audit proves required.
19. Regenerate DB types only if schema changed.
20. Run full applicable validation.
21. Open/update implementation PR.
22. Stop without merging implementation.

# 148. Document Validation Checklist
- [x] Canonical filename P04/R04.
- [x] Phase 04.
- [x] Round 04.
- [x] Status READY.
- [x] Previous P04/R03.
- [x] Next P04/R05.
- [x] Authority main.
- [x] Implementation parent latest R03 lineage.
- [x] Actual R03 code evidence used.
- [x] Scope restricted to amendment/cancellation exceptions.
- [x] CHANGED semantics explicit.
- [x] Amendment eligibility explicit.
- [x] Cancellation eligibility explicit.
- [x] Money authority explicit.
- [x] Transaction/rollback explicit.
- [x] Concurrency explicit.
- [x] RLS/permission explicit.
- [x] Migration decision gate explicit.
- [x] Unit/integration/DB/E2E matrices explicit.
- [x] R05/R06 boundaries explicit.
- [x] Implementation merge owner-controlled.

# 149. Document Internal Consistency
- R04 amendment begins only from ACCEPTED.
- Successful amendment ends in CHANGED.
- CHANGED requires re-review before normal lifecycle resumes.
- R03 normal lifecycle does not accept CHANGED.
- Cancellation is explicit and terminal for R04.
- R04 never accepts arbitrary target status.
- R04 never accepts arbitrary price/currency authority.
- Cancellation from payment/closed states is excluded.
- Priority/delay/remake remain R05.
- Payment side effects remain excluded.
- Kitchen side effects remain excluded.
- Realtime side effects remain excluded.
- Notification side effects remain excluded.
- All mutation authority remains server-side.

# 150. Document-Only Validation Policy
- Document correctness is based on metadata.
- Document correctness is based on sequence.
- Document correctness is based on current repository evidence.
- Document correctness is based on scope.
- Document correctness is based on architecture.
- Document correctness is based on security.
- Document correctness is based on migration strategy.
- Document correctness is based on failure/recovery design.
- Document correctness is based on tests.
- Document correctness is based on handoff.
- GitHub Actions are not document-validation authority.
- Missing Actions do not semantically invalidate the document.
- Queued Actions do not semantically invalidate the document.
- Skipped Actions do not semantically invalidate the document.
- Cancelled Actions do not semantically invalidate the document.
- Failed Actions do not semantically invalidate the document itself.
- Hosted merge enforcement is reported separately if present.
- Documentation task must not alter runtime/CI to force docs merge.
- Final line count must be 1,800–2,500 inclusive.

# 151. Implementation Validation Policy
- Future implementation runs actual applicable repository checks.
- Document source inspection is not runtime proof.
- Required implementation failures remain blockers.
- Do not weaken checks.
- Do not rename checks to evade gate.
- Do not suppress required failures.
- Do not fabricate PASS.
- Implementation PR remains owner-controlled.
- Implementation agent must not merge.
- Implementation agent must not enable auto-merge.

# 152. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P04/R04 implementation after it is on main.
- Future implementation branches from latest legitimate P04/R03 lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 153. Required Next Specification
```text
FLOW_P04_R05_IMPLEMENTATION_SPEC.md
```
- R05 specification must be authored from actual R04 implementation state.
- R04 does not infer exact priority/delay/remake persistence prematurely.
- No R05 implementation starts until exact R05 spec exists on current main.

# 154. Final R04 Handoff Summary
- One durable operational read plane remains.
- One decision plane supports initial and CHANGED re-review.
- One normal lifecycle plane remains canonical.
- One controlled exception plane is added.
- No generic mutation plane is added.
- CHANGED becomes meaningful and review-gated.
- Cancellation becomes reasoned and auditable.
- Snapshot price authority remains server-side.
- Branch-scoped order.manage remains mutation authority.
- Exact-state concurrency guards remain central.
- Append-only event evidence remains central.
- Priority/delay/remake remain R05.

# 155. Final Acceptance Statement
- P04/R04 is READY as an executable specification document.
- The round establishes controlled staff order exception handling without a generic mutation API.
- Accepted-order content changes are bounded.
- Accepted-order content changes preserve snapshot price authority.
- Accepted-order content changes are audited.
- Accepted-order content changes force explicit CHANGED re-review.
- Cancellation is explicit.
- Cancellation is reasoned.
- Cancellation is branch-authorized.
- Cancellation is state-constrained.
- Cancellation is audited.
- Normal lifecycle authority from R03 remains intact.
- Illegal mutations fail closed.
- Stale mutations fail closed.
- Cross-scope mutations fail closed.
- Unauthorized mutations fail closed.
- Priority/delay/remake remains deferred.
- Payment remains deferred.
- Kitchen integration remains deferred.
- Realtime remains deferred.
- Notifications remain deferred.
- Phase 04 final acceptance remains deferred to R06.
