# FLOW P04 R05 — Implementation Specification
> Phase 04 — Order Orchestration & Control
> Round 05 — Priority, Delay/Defer, Remake and Production-Exception Controls
> Revision — Add bounded operational escalation controls on top of the R01 durable queue, R02 decision boundary, R03 normal lifecycle, and R04 amendment/cancellation exception plane, while preserving server authority, branch isolation, exact-state concurrency, append-only evidence, and the R06 acceptance boundary.

## Metadata
- Phase: `04`
- Round: `05`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P04_R04_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P04_R06_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P04 implementation slot after this specification is on main`
- Current planning scope: `PHASE 04 / ROUND 05 ONLY`
- Implementation parent: `latest completed P04/R04 implementation lineage tip`
- Expected implementation parent branch: `p04-r04-order-exceptions`
- Observed R04 branch head at authoring: `98f477f664ae9d7a57866370c88d1abbc01ec103`
- Observed R04 implementation PR: `#84`
- Observed R04 implementation state: `IMPLEMENTED / PR OPEN / SUFFICIENT HANDOFF FOR R05 SPEC`
- Observed R04 diff from R03 lineage: `19 commits ahead`
- Recommended implementation branch: `p04-r05-production-controls`
- Recommended implementation PR title: `feat(operations): add priority delay and remake controls`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Priority controls in this round: `YES`
- Delay/defer controls in this round: `YES`
- Remake/production-exception workflow in this round: `YES`
- Operational escalation metadata in this round: `YES`
- Exact-state concurrency protection in this round: `YES`
- Durable event evidence in this round: `YES`
- Kitchen routing redesign in this round: `NO`
- Payment execution/refund/void in this round: `NO`
- Realtime publication in this round: `NO`
- Notification delivery in this round: `NO`
- Phase 04 acceptance in this round: `NO — P04/R06`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` authority SHA at authoring is `9b3399043a0278f10b41575690a2a1426cf35e2b`.
- Current `main` contains `FLOW_P04_R04_IMPLEMENTATION_SPEC.md` with `Status: READY`.
- Current R04 specification names this exact file as `Next`.
- Current policy keeps `main` as policy/spec authority.
- Current policy keeps the latest round branch as implementation lineage.
- `p04-r04-order-exceptions` exists and is the latest observed P04 implementation branch.
- Observed R04 head is `98f477f664ae9d7a57866370c88d1abbc01ec103`.
- R04 implementation PR #84 exists and remains owner-controlled.
- R04 branch is 19 commits ahead of the R03 implementation lineage.
- R04 implements bounded accepted-order amendment.
- R04 implements `ACCEPTED -> CHANGED` review gating.
- R04 extends decision semantics for `CHANGED` re-review.
- R04 implements reasoned cancellation from exact source states.
- R04 implements server-side persisted-snapshot subtotal recalculation.
- R04 adds a dedicated exception service and repository.
- R04 adds an internal exception mutation route.
- R04 adds dedicated staff exception controls.
- R04 adds restrictive branch-scoped RLS policies for order aggregate/children/events.
- R04 adds unit, integration, concurrency, rollback and pgTAP coverage.
- R04 explicitly defers priority/delay/remake to R05.
- No `FLOW_P04_R05_IMPLEMENTATION_SPEC.md` existed on `main` before authoring.
- No `p04-r05-*` implementation branch existed before authoring.
- This task is specification/documentation only.
- This task does not create the R05 implementation branch.
- This task does not modify application/runtime code.
- This task does not implement migrations.
- This task does not change workflows or deployment configuration.
- This task does not merge implementation PR #84.

# 2. Phase 04 Objective
- Phase 04 owns durable staff-side order orchestration after customer submission.
- R01 establishes durable branch-scoped staff queue/detail reads.
- R02 establishes initial accept/reject decisions.
- R03 establishes the normal accepted-order lifecycle.
- R04 establishes controlled amendment/review/cancellation exceptions.
- R05 establishes bounded operational prioritization, delay/defer and remake controls.
- R06 proves the complete Phase 04 operational order plane end to end.
- Phase 04 must preserve database authority for operational state.
- Phase 04 must preserve Auth.js and AccessContext authority for staff identity/scope.
- Phase 04 must preserve `order.manage` as mutation permission authority.
- Phase 04 must prevent arbitrary browser-controlled status mutation.
- Phase 04 must append durable evidence for successful operational mutations.
- Phase 04 must provide deterministic stale-state behavior under concurrent staff actions.
- Phase 04 must not silently create kitchen/payment/realtime coupling before their own phases.

# 3. Six-Round Phase Boundary
- R01 owns queue/detail read authority.
- R02 owns first decision authority.
- R03 owns normal lifecycle authority.
- R04 owns amendment/review/cancellation exception authority.
- R05 owns operational prioritization and production-exception control metadata.
- R06 owns integrated Phase 04 acceptance.
- R05 must not rewrite R01 queue architecture.
- R05 must not rewrite R02 decision semantics.
- R05 must not duplicate R03 lifecycle transitions.
- R05 must not duplicate R04 amendment/cancellation paths.
- R05 must not absorb R06 acceptance work.
- R05 must remain compatible with future kitchen execution without implementing it.

# 4. R05 High-Impact Objective
- Add one canonical server-only production-control service.
- Add branch-authorized priority escalation and de-escalation.
- Add bounded delay/defer semantics with server-owned reason and timing metadata.
- Add explicit remake request semantics from eligible post-production states.
- Add exact-state rules for each control.
- Add durable actor/reason/timestamp evidence.
- Add deterministic conflict semantics when controls race lifecycle/exception commands.
- Add read-model fields required for staff visibility.
- Add staff controls without arbitrary mutation surfaces.
- Preserve R03 normal lifecycle.
- Preserve R04 cancellation and CHANGED review semantics.
- Keep queue ordering deterministic when priority metadata is introduced.
- Keep all customer/payment/kitchen side effects out of R05.
- Produce a complete handoff for R06 acceptance.

# 5. Preconditions
- [ ] This exact specification exists on current `main` before implementation starts.
- [ ] This specification is `READY`.
- [ ] `Previous` is exactly `FLOW_P04_R04_IMPLEMENTATION_SPEC.md`.
- [ ] `Next` is exactly `FLOW_P04_R06_IMPLEMENTATION_SPEC.md`.
- [ ] Current merge policy is re-read from `main`.
- [ ] Current development-phase README is re-read from `main`.
- [ ] Applicable `CONTRIBUTING.md` / `AGENTS.md` instructions are re-read.
- [ ] Latest legitimate R04 branch/head is identified.
- [ ] R05 implementation branch descends from latest R04 lineage.
- [ ] R04 exception implementation is inspected directly before changing shared modules.
- [ ] Actual current order schema is audited before migration decisions.
- [ ] Actual current event vocabulary and RLS policies are audited.
- [ ] Current queue ordering/filter semantics are audited.
- [ ] Current lifecycle/cancellation status guards are audited.
- [ ] No destructive migration is required.

# 6. Explicit Non-Goals
- Do not add generic `PATCH /orders/:id`.
- Do not add arbitrary status mutation.
- Do not let the browser choose target status.
- Do not let the browser choose tenant/branch/actor.
- Do not let the browser choose priority sort keys directly.
- Do not let the browser choose unrestricted timestamps.
- Do not let the browser choose kitchen station routing.
- Do not create kitchen tickets.
- Do not update kitchen tickets.
- Do not implement realtime broadcast.
- Do not implement push/email/LINE notifications.
- Do not implement payment capture/refund/void.
- Do not redesign order amendment.
- Do not redesign cancellation.
- Do not reopen CANCELLED/REJECTED/CLOSED/VOIDED orders.
- Do not introduce generic workflow DSL infrastructure.
- Do not implement Phase 04 acceptance.
- Do not introduce cross-product task-priority framework.
- Do not add dependency churn without a proven need.

# 7. Inherited Architecture to Preserve
- Auth.js remains internal staff identity authority.
- AccessContext remains trusted tenant/branch scope authority.
- `operations.staff.access` remains route-shell permission where applicable.
- `order.view` remains operational read permission.
- `order.manage` remains operational mutation permission.
- `withAuthorizedAccessTransaction()` remains preferred mutation transaction wrapper.
- R01 queue repository/service remain durable read authority.
- R02 decision service/repository remain initial and CHANGED decision authority.
- R03 lifecycle service/repository remain normal lifecycle authority.
- R04 exception service/repository remain amendment/cancellation authority.
- `foodflow.orders` remains aggregate source of truth.
- `foodflow.order_events` remains append-oriented operational evidence.
- Staff UI remains projection, never authority.

# 8. Observed R04 Handoff
- R04 amendment source is `ACCEPTED` only.
- Successful R04 amendment produces `CHANGED`.
- CHANGED must be re-accepted before R03 lifecycle resumes.
- R04 cancellation sources are `PENDING_CONFIRMATION`, `CHANGED`, `ACCEPTED`, `PREPARING`, `READY`.
- Successful cancellation produces terminal `CANCELLED`.
- R04 protects child mutations with branch-scoped restrictive RLS.
- R04 keeps persisted item/modifier price snapshots authoritative.
- R04 uses exact-state conditional writes and row locks for one-winner behavior.
- R04 does not introduce generic staff idempotency replay.
- R04 does not integrate kitchen/payment/realtime/notifications.
- R05 must build on these exact semantics.

# 9. Current Operational Status Vocabulary
- `PENDING_CONFIRMATION` exists.
- `CHANGED` exists.
- `ACCEPTED` exists.
- `PREPARING` exists.
- `READY` exists.
- `SERVED` exists.
- `PAYMENT_PENDING` exists.
- `PAID` exists.
- `CLOSED` exists.
- `REJECTED` exists.
- `CANCELLED` exists.
- `REMAKE` exists.
- `VOIDED` exists.
- R05 must reuse the established vocabulary where semantically correct.
- R05 must not create duplicate strings such as `HIGH_PRIORITY_READY`.

# 10. R05 Control Vocabulary
| Control | Intent | State mutation | Metadata mutation |
|---|---|---|---|
| `SET_PRIORITY` | mark active order urgent | no lifecycle target | priority metadata |
| `CLEAR_PRIORITY` | remove urgency | no lifecycle target | priority metadata |
| `DEFER_ORDER` | intentionally pause/deprioritize active processing | no lifecycle target by default | delay/defer metadata |
| `RESUME_ORDER` | clear active defer state | no lifecycle target | delay/defer metadata |
| `REQUEST_REMAKE` | request remake after a served/ready defect where eligible | exact target `REMAKE` | remake reason/evidence |
| `RESOLVE_REMAKE` | return remake to a controlled re-production state if product authority supports it | exact server target | remake resolution evidence |
- Final exact action names may differ while preserving these authority boundaries.
- Browser action vocabulary must be closed and server-defined.

# 11. Priority Model Decision
- Priority is operational metadata, not a lifecycle status.
- Priority must not replace `PREPARING`, `READY`, or other lifecycle states.
- Priority must not implicitly advance or reverse lifecycle state.
- Priority must be branch-scoped.
- Priority must be server-authorized with `order.manage`.
- Priority must be durable across page refresh and process restart.
- Priority must be visible in queue/detail projections.
- Priority should support at least normal and urgent states.
- Prefer a small bounded enum over arbitrary integer priority supplied by browser.
- Initial recommended values are `NORMAL` and `URGENT`.
- If schema uses nullable timestamp/boolean instead, server contract must still expose bounded semantics.

# 12. Priority Eligibility
- `PENDING_CONFIRMATION` priority is allowed only if current product semantics justify surfacing urgent incoming review.
- `CHANGED` priority may be allowed because it awaits re-review.
- `ACCEPTED` priority is allowed.
- `PREPARING` priority is allowed.
- `READY` priority is allowed when urgent service/remediation is meaningful.
- `SERVED` priority is not normally allowed.
- `PAYMENT_PENDING` priority is out of R05 order-production scope.
- `PAID` priority is denied.
- `CLOSED` priority is denied.
- `REJECTED` priority is denied.
- `CANCELLED` priority is denied.
- `REMAKE` priority is allowed if remake remains active work.
- `VOIDED` priority is denied.
- Final allowed set must be centralized server-side.

# 13. Priority Persistence Options
- Preferred: bounded aggregate columns when queue ordering must query priority efficiently.
- Candidate columns: `priority_code`, `prioritized_at`, `prioritized_by_staff`.
- Alternative: `is_priority` + event evidence if two-state model is sufficient.
- Do not infer current priority solely from scanning events on every queue query.
- Append `ORDER_PRIORITY_SET` and `ORDER_PRIORITY_CLEARED` evidence.
- Aggregate fields represent current state.
- Events represent historical state changes.
- Existing rows must default to normal behavior.
- Migration must be forward-only.
- No destructive backfill beyond safe default/null semantics.

# 14. Priority Queue Ordering
- Current queue ordering must be audited before change.
- Priority must not destroy deterministic pagination.
- Preferred ordering groups urgent before normal within otherwise equivalent active queue semantics.
- Tie-breaker remains deterministic.
- Suggested stable key: `priority_rank DESC, submitted_at ASC, id ASC` for incoming work when product semantics use oldest-first.
- If existing queue uses different time direction, preserve it intentionally.
- Cursor payload must encode every ordering dimension required for deterministic keyset pagination.
- Old cursor compatibility must be considered during rolling deployment.
- If cursor version changes, bump cursor version explicitly.
- Do not silently reinterpret old cursor payloads.

# 15. Priority Command Contract
```ts
interface SetOperationalOrderPriorityCommand {
  readonly orderId: string;
  readonly priority: "URGENT";
  readonly reasonCode: OperationalOrderPriorityReasonCode;
}
```
- Browser cannot send actor.
- Browser cannot send prioritized timestamp.
- Browser cannot send sort rank.
- Browser cannot send tenant/branch.
- Reason code is bounded.
- Clearing priority uses separate explicit action or exact `NORMAL` server-owned semantics.

# 16. Priority Reason Taxonomy
- `CUSTOMER_ESCALATION`
- `SERVICE_RECOVERY`
- `WAIT_TIME`
- `MANAGER_OVERRIDE`
- `SAFETY_OR_QUALITY`
- `OTHER`
- Keep taxonomy small and machine-readable.
- Do not accept free-form reason as primary authority.
- Optional note may be bounded if product need is demonstrated.
- Do not log optional note verbatim by default.

# 17. Priority Concurrency
- SET vs SET with same intended priority must not create contradictory current state.
- SET vs CLEAR must have deterministic one-winner current state.
- Priority mutation racing cancellation must not resurrect terminal work.
- Priority mutation racing lifecycle may preserve priority if new state remains eligible.
- If lifecycle moves into an ineligible terminal state first, priority mutation must conflict.
- Exact-state/eligibility recheck belongs in transaction.
- Last-write-wins blind updates are prohibited.
- Events must reflect actual transition from prior priority state.

# 18. Delay/Defer Model Decision
- Delay/defer is operational metadata, not a new lifecycle state by default.
- Delay must explain why active processing is intentionally paused/deprioritized.
- Delay must have bounded reason.
- Delay may have optional expected resume time.
- Delay must have durable start timestamp.
- Delay must have actor evidence.
- Resume must clear active defer metadata without erasing history.
- Delay must be visible in queue/detail.
- Delay must not silently change customer lifecycle state unless explicitly required by current product authority.
- Delay must not automatically trigger notifications in R05.

# 19. Delay Eligibility
- `PENDING_CONFIRMATION` defer is generally denied; review queue should be handled explicitly rather than hidden.
- `CHANGED` defer may be denied for the same reason unless product authority clearly allows it.
- `ACCEPTED` defer may be allowed before production.
- `PREPARING` defer may be allowed for capacity/ingredient/equipment issues.
- `READY` defer is normally denied because product is already ready.
- `SERVED` defer is denied.
- `REMAKE` defer may be allowed if remake execution is blocked.
- Terminal/payment states are denied.
- Final allowed set is centralized and tested.

# 20. Delay Reason Taxonomy
- `CAPACITY`
- `INGREDIENT_WAIT`
- `EQUIPMENT_ISSUE`
- `CUSTOMER_REQUEST`
- `STAFFING`
- `DEPENDENCY`
- `OTHER`
- Codes must be stable and machine-readable.
- Codes must not expose secret/internal free text by default.
- Optional bounded note may supplement but never replace code.

# 21. Defer Timing Contract
- `deferred_at` is database-derived.
- `deferred_until` is optional.
- Browser may propose `deferredUntil` only as bounded intent if product needs scheduled resume.
- Server validates it is a valid future instant within a bounded horizon.
- Server stores canonical UTC timestamptz.
- Browser cannot set `deferred_at`.
- Browser cannot set actor.
- Expiry does not automatically mutate state unless a scheduler already exists.
- R05 must not add scheduler infrastructure solely for auto-resume.
- Expired defer metadata may be shown as overdue until explicit resume.

# 22. Resume Contract
- Resume is explicit staff intent.
- Resume requires `order.manage`.
- Resume requires active defer metadata.
- Resume clears current defer fields.
- Resume appends `ORDER_RESUMED` evidence.
- Resume does not advance lifecycle.
- Resume does not auto-start preparation.
- Resume on non-deferred order conflicts or is a stable no-op only if contract explicitly chooses that behavior.
- Prefer conflict to avoid hiding stale UI.

# 23. Delay Persistence Options
- Candidate aggregate fields: `defer_reason`, `deferred_at`, `deferred_until`, `deferred_by_staff`.
- Alternative normalized control table is acceptable if current schema strongly favors it.
- Do not introduce generic metadata JSON unless justified.
- Current-state queue queries should not require event-history scan.
- Event evidence remains required.
- Existing rows remain null/non-deferred.
- Index only if queue/filter query plan requires it.
- Migration is forward-only.

# 24. Delay Queue Behavior
- Deferred active orders remain visible.
- Deferred rows must be visibly marked, not silently disappear.
- Queue may group deferred orders below active same-priority work if product semantics require.
- Ordering must remain deterministic.
- Priority and defer ordering interactions must be specified centrally.
- Suggested rank order: urgent active, normal active, urgent deferred, normal deferred.
- Within groups preserve stable submitted-time/id ordering.
- Do not let client sort arbitrary rank values.

# 25. Priority + Delay Interaction
- Priority and defer are independent metadata dimensions.
- An urgent order may become deferred if eligible.
- Defer does not automatically clear priority.
- Resume preserves priority unless explicit clear is requested separately.
- Staff UI displays both badges independently.
- Queue rank policy defines which dimension wins.
- Event history records each mutation separately.
- One request must not silently change both unless explicit combined action is authorized.

# 26. Remake Model Decision
- `REMAKE` is an existing operational status and R05 gives it explicit meaning.
- Remake is a production exception, not a generic status patch.
- Remake requires a bounded reason.
- Remake requires server-authorized source states.
- Remake records actor/timestamp evidence.
- Remake must preserve original order/item snapshots.
- Remake must not create payment/refund side effects.
- Remake must not create kitchen tickets in R05.
- Remake state communicates operational need for later execution integration.
- R05 must define how remake returns to normal lifecycle without arbitrary reversal.

# 27. Remake Eligibility
- `READY` may be remake-eligible for detected quality issue before service.
- `SERVED` may be remake-eligible for customer-reported quality/problem scenario.
- `PREPARING` should normally use delay/cancellation rather than remake.
- `ACCEPTED` should not use remake because production has not started.
- `CHANGED` should not use remake.
- `PENDING_CONFIRMATION` should not use remake.
- `REMAKE` cannot be requested again without explicit repeat-remake policy.
- `CANCELLED`, `REJECTED`, `VOIDED`, `CLOSED` are not remake-eligible.
- `PAID`/`PAYMENT_PENDING` require careful audit because operational remake may coexist with payment state in future.
- R05 should fail closed if current status model cannot represent paid-remake safely.

# 28. Remake Reason Taxonomy
- `QUALITY_ISSUE`
- `WRONG_ITEM`
- `MISSING_COMPONENT`
- `TEMPERATURE`
- `DAMAGED_OR_SPILLED`
- `CUSTOMER_REQUEST`
- `STAFF_ERROR`
- `OTHER`
- Codes are bounded.
- Optional note is bounded and secondary.
- No raw browser payload is stored as event reason.

# 29. Remake Source-to-Target Contract
- `READY -> REMAKE` is allowed when quality defect is found before service.
- `SERVED -> REMAKE` may be allowed when service-recovery remake is needed.
- No other source is allowed by default.
- Browser sends only `REQUEST_REMAKE` and reason.
- Browser never sends `toStatus=REMAKE` as authority.
- Exact source status is read server-side and enforced in mutation.
- Event `from_status` records actual source.
- Event `to_status` is `REMAKE`.

# 30. Remake Resolution Contract
- R05 must define a controlled next step from REMAKE.
- Preferred target is `PREPARING` when remake production begins.
- Alternative target `ACCEPTED` is only valid if product semantics require re-acceptance.
- Do not reuse `START_PREPARING` blindly if its source set remains ACCEPTED only.
- Prefer explicit `START_REMAKE_PREPARING` server action from REMAKE to PREPARING.
- This action remains part of R05 because it makes REMAKE operationally usable.
- It appends `ORDER_REMAKE_STARTED` evidence.
- It preserves original order identity.
- It does not create new order/payment rows.

# 31. Remake Completion Semantics
- Once REMAKE returns to PREPARING, R03 `MARK_READY` can continue if source PREPARING is valid.
- R03 `MARK_READY` remains canonical for PREPARING -> READY.
- R03 `MARK_SERVED` remains canonical for READY -> SERVED.
- R05 must not duplicate these transitions.
- Prior served/ready evidence remains append-only history.
- New ready/served timestamps may overwrite aggregate latest-state timestamps if current schema uses latest occurrence semantics.
- Implementation must audit timestamp meaning before relying on aggregate fields for historical counts.
- Events remain authoritative history across repeated lifecycle cycles.

# 32. Remake Count / Loop Safety
- Repeated remakes can create loops.
- R05 must define a bounded policy.
- Prefer maximum remake count per order enforced from durable event evidence or aggregate counter.
- Initial recommended maximum is 3 unless product authority defines another bound.
- Browser cannot choose remake count.
- Exceeding bound returns conflict/validation failure.
- Counter must update atomically with remake request if persisted.
- Do not permit unbounded recursive remake loops.
- R06 must be able to prove bound behavior.

# 33. Remake Count Persistence Options
- Option A: aggregate `remake_count` integer with CHECK bound plus events.
- Option B: count immutable remake events transactionally before allowing request.
- Queue reads favor aggregate field if count is displayed frequently.
- Event count is acceptable if bounded query cost is trivial and indexed.
- Avoid derived full-history scans on every queue row.
- Implementation PR records chosen strategy.
- No historical synthetic remake rows are required.

# 34. Production-Control Action Module
- Prefer one `order-production-control-service.ts`.
- Prefer one `order-production-control-repository.ts`.
- Keep R03 lifecycle module unchanged except narrow reusable helpers if required.
- Keep R04 exception module unchanged except compatibility fixes.
- Use one closed action union for R05 controls.
- Route handlers delegate to service only.
- Service performs authorization/orchestration.
- Repository performs transaction-bound persistence.
- UI never imports repository/service server modules into client bundles.

# 35. Existing File Responsibility Audit
| Path | Current responsibility | R05 action |
|---|---|---|
| `src/modules/order-operations/server/types.ts` | shared operational contracts | extend with production controls |
| `src/modules/order-operations/server/errors.ts` | safe domain errors | extend narrowly |
| `src/modules/order-operations/server/http.ts` | strict request/error mapping | extend narrowly |
| `src/modules/order-operations/server/index.ts` | server exports | extend narrowly |
| `order-queue-repository.ts` | queue/detail reads | add current control metadata/order rank |
| `order-queue-service.ts` | authorized queue read | preserve/reuse |
| `order-decision-*` | initial/CHANGED review | preserve |
| `order-lifecycle-*` | normal lifecycle | preserve |
| `order-exception-*` | amendment/cancel | preserve |
| `operational-orders-workspace.tsx` | staff order UX | add R05 controls/projections |

# 36. Files to CREATE
| Path | Responsibility |
|---|---|
| `apps/web/next-flow/src/modules/order-operations/server/order-production-control-service.ts` | priority/defer/remake orchestration |
| `apps/web/next-flow/src/modules/order-operations/server/order-production-control-repository.ts` | transaction-bound persistence |
| `apps/web/next-flow/src/app/api/internal/orders/[id]/production-control/route.ts` | strict mutation transport |
| `apps/web/next-flow/tests/unit/operational-order-production-control.test.ts` | parsing/maps/result invariants |
| `apps/web/next-flow/tests/integration/operational-order-production-control.test.ts` | real DB behavior/concurrency/rollback |
| `supabase/tests/database/p04_r05_order_production_control_boundary.test.sql` | RLS/constraint/evidence tests |
- Exact names may vary while responsibilities remain.

# 37. Files to MODIFY
| Path | Required change |
|---|---|
| `apps/web/next-flow/src/modules/order-operations/server/types.ts` | action/reason/current-state DTOs |
| `apps/web/next-flow/src/modules/order-operations/server/errors.ts` | control error taxonomy |
| `apps/web/next-flow/src/modules/order-operations/server/http.ts` | bounded parse/mapping |
| `apps/web/next-flow/src/modules/order-operations/server/index.ts` | exports |
| `apps/web/next-flow/src/modules/order-operations/server/order-queue-repository.ts` | metadata + deterministic priority/defer ordering |
| `apps/web/next-flow/src/modules/order-operations/server/order-queue-service.ts` | cursor/version/filter contract if needed |
| `apps/web/next-flow/src/features/staff/operational-orders-workspace.tsx` | control UI/reconciliation |
| `apps/web/next-flow/package.json` | test discovery only if needed |
- Modify generated DB types only if schema changes.

# 38. Files to MOVE
- None expected.
- Do not reorganize order-operations modules for aesthetics.
- Do not move R01/R02/R03/R04 files unless required by an actual circular dependency.
- Any move must preserve imports and ownership boundaries.

# 39. Files to REMOVE
- None expected.
- Do not remove prior tests.
- Do not remove prior migration history.
- Do not remove current event evidence.
- Do not delete current lifecycle/exception modules.

# 40. Do-Not-Touch Boundary
- Customer capability/session code.
- Customer data-access repositories.
- Customer cart/order command idempotency.
- Payment provider modules.
- Kitchen routing modules.
- Realtime infrastructure.
- Notification infrastructure.
- Auth.js provider configuration.
- AccessContext semantics.
- Permission catalog unless a real missing permission defect is proven.
- R03 lifecycle map except compatibility required by REMAKE continuation.
- R04 amendment/cancellation rules except compatibility fixes.
- Unrelated staff tabs.

# 41. Service Responsibilities
- Require current AccessContext.
- Require branch context.
- Require `order.manage`.
- Validate action discriminator.
- Validate order UUID.
- Validate bounded reason code.
- Validate optional time/note fields.
- Select closed server action path.
- Delegate persistence to transaction-bound repository.
- Map zero-row updates to scoped not-found/conflict.
- Validate returned invariants.
- Never trust browser tenant/branch/actor/state.
- Never perform external side effects.

# 42. Repository Responsibilities
- Accept DatabaseTransaction.
- Accept trusted tenant/branch/actor context.
- Use explicit tenant predicate.
- Use explicit branch predicate.
- Use exact order UUID.
- Use exact status eligibility predicate.
- Lock row when multiple current metadata fields must be coordinated.
- Update only R05-owned fields.
- Append one event per successful control mutation.
- Return narrow mutation result.
- Provide scoped current-state classification.
- Do not expose unrestricted patch helper.

# 43. Transport Contract
- Prefer `POST /api/internal/orders/[id]/production-control`.
- Request body includes exact `action` discriminator.
- Mutation is never GET.
- Do not expose generic PATCH.
- Require internal Auth.js staff identity.
- Resolve AccessContext server-side.
- Enforce same-origin policy consistent with R02-R04.
- Enforce bounded JSON size.
- Reject malformed/non-object/array JSON.
- Reject unknown fields.
- Return `Cache-Control: no-store`.
- Map conflict to stable 409.
- Map forbidden safely without scope leakage.

# 44. Production-Control Command Union
```ts
type OperationalOrderProductionControlCommand =
  | SetPriorityCommand
  | ClearPriorityCommand
  | DeferOrderCommand
  | ResumeOrderCommand
  | RequestRemakeCommand
  | StartRemakeCommand;
```
- Closed union only.
- No generic `{patch: ...}`.
- No arbitrary metadata key/value map.
- No browser-supplied target lifecycle state.

# 45. SET_PRIORITY Request Shape
- `action` required and exact.
- `reasonCode` required.
- Optional note only if bounded product need exists.
- `priority` field may be omitted if action means URGENT explicitly.
- If `priority` exists, accepted enum is closed.
- Unknown keys fail.
- Status/tenant/branch/actor/timestamp keys fail.
- Numeric rank supplied by browser fails.

# 46. CLEAR_PRIORITY Request Shape
- `action` required and exact.
- No reason required unless audit policy requires it.
- Unknown keys fail.
- Browser cannot set normal rank number.
- Clearing when already normal should be conflict or stable no-op; choose and test.
- Prefer conflict for stale UI visibility.

# 47. DEFER_ORDER Request Shape
- `action` required and exact.
- `reasonCode` required.
- `deferredUntil` optional.
- Optional note bounded if supported.
- Unknown keys fail.
- Browser cannot set deferredAt.
- Browser cannot set deferredBy.
- Browser cannot set lifecycle target.

# 48. RESUME_ORDER Request Shape
- `action` required and exact.
- Optional resolution reason only if useful.
- Unknown keys fail.
- Browser cannot select target lifecycle state.
- Resume clears only current defer state.
- Resume preserves priority.

# 49. REQUEST_REMAKE Request Shape
- `action` required and exact.
- `reasonCode` required.
- Optional note bounded.
- Browser cannot set fromStatus.
- Browser cannot set toStatus.
- Browser cannot set remake count.
- Browser cannot modify item snapshots.
- Unknown keys fail.

# 50. START_REMAKE Request Shape
- `action` required and exact.
- No browser target state.
- Source must be REMAKE server-side.
- Target fixed server-side to PREPARING if chosen.
- Unknown keys fail.
- No price/item mutation.

# 51. Current-State DTO Additions
- Queue/detail may expose `priority`.
- Queue/detail may expose `prioritizedAt` if useful.
- Queue/detail may expose `deferReason`.
- Queue/detail may expose `deferredAt`.
- Queue/detail may expose `deferredUntil`.
- Queue/detail may expose `remakeCount`.
- Queue/detail may expose `lastRemakeReason` if aggregate storage exists.
- Do not expose staff actor identifiers unless required by product UX.
- Do not expose internal RLS context.
- Do not expose event internals not needed by client.

# 52. Priority Result Contract
- Result includes order ID.
- Result includes order number.
- Result includes current lifecycle status.
- Result includes current priority enum.
- Result includes reason code when set.
- Result includes database-derived mutation timestamp.
- Result does not include tenant/branch authority unnecessarily.
- Result does not include actor/session secrets.

# 53. Defer Result Contract
- Result includes order ID.
- Result includes order number.
- Result includes unchanged lifecycle status.
- Result includes active defer reason.
- Result includes deferredAt.
- Result includes deferredUntil when set.
- Resume result shows defer cleared.
- Result does not imply notification dispatch.

# 54. Remake Result Contract
- Request-remake result includes actual source status.
- Result status is REMAKE.
- Result includes reason code.
- Result includes remake count if defined.
- Result includes database-derived timestamp.
- Start-remake result includes from REMAKE to PREPARING.
- Result does not claim kitchen ticket creation.
- Result does not claim refund/credit.

# 55. Authorization
- Every R05 mutation requires internal staff identity.
- Every R05 mutation requires branch AccessContext.
- Every R05 mutation requires `order.manage`.
- `order.view` alone is insufficient.
- Route-shell permission alone is insufficient.
- Tenant is server-derived.
- Branch is server-derived.
- Actor is server-derived.
- Permission revocation applies on next evaluation.
- Membership revocation applies on next evaluation.
- Customer capability cannot authorize R05 route.

# 56. Branch/Tenant Predicates
- Every aggregate query includes tenant predicate.
- Every aggregate query includes branch predicate.
- Every aggregate query includes order UUID predicate.
- R04 restrictive branch RLS remains active.
- Application predicates remain explicit defense in depth.
- Same-scope state lookup is branch-limited.
- Cross-branch existence must not leak.
- Cross-tenant existence must not leak.

# 57. Priority State Guard
- Do not set priority on ineligible terminal status.
- Read/lock current status in transaction when needed.
- Verify current priority state before mutation.
- SET on already urgent should conflict or stable no-op by explicit policy.
- CLEAR on non-urgent should conflict or stable no-op by explicit policy.
- Mutation event records prior/current priority semantics.
- Do not overwrite lifecycle status.

# 58. Defer State Guard
- Only configured active statuses may defer.
- Already deferred order cannot be deferred again without explicit update-defer action.
- RESUME requires active defer state.
- Lifecycle transition racing defer must have deterministic outcome.
- Cancellation racing defer must have deterministic outcome.
- Terminal status first means defer loses/conflicts.
- Defer must not hide stale state.

# 59. Remake State Guard
- REQUEST_REMAKE source must be exact eligible status.
- START_REMAKE source must be REMAKE.
- R03 MARK_READY accepts PREPARING after remake restart.
- R03 MARK_SERVED accepts READY after remake restart.
- REQUEST_REMAKE cannot execute from PREPARING.
- REQUEST_REMAKE cannot execute from CANCELLED/REJECTED/CLOSED/VOIDED.
- Remake count bound is checked atomically.

# 60. Event Vocabulary
- `ORDER_PRIORITY_SET`.
- `ORDER_PRIORITY_CLEARED`.
- `ORDER_DEFERRED`.
- `ORDER_RESUMED`.
- `ORDER_REMAKE_REQUESTED`.
- `ORDER_REMAKE_STARTED`.
- Reuse text event type if current schema is unconstrained.
- Extend constraint only when required.
- Event actor is server-derived.
- Event time is DB-derived.
- Event reason is bounded machine code.

# 61. Priority Event Semantics
- SET event `from_status` and `to_status` may both equal current lifecycle status.
- Event reason stores priority reason code.
- Do not fabricate lifecycle transition just to record metadata change.
- CLEAR event records lifecycle state unchanged.
- Current aggregate fields update in same transaction.
- Event insert failure rolls aggregate metadata back.

# 62. Defer Event Semantics
- DEFER event keeps lifecycle from/to equal current state unless schema/event convention supports metadata-only events differently.
- Reason stores defer reason code.
- `deferred_until` should not be stuffed into unbounded reason text.
- RESUME event records lifecycle state unchanged.
- Current defer aggregate fields change in same transaction.
- Event failure rolls metadata change back.

# 63. Remake Event Semantics
- REQUEST_REMAKE event from actual eligible source to REMAKE.
- Reason stores remake reason code.
- START_REMAKE event from REMAKE to PREPARING.
- Reason may be null or fixed system code.
- Event sequence preserves prior READY/SERVED history.
- Event failure rolls status change back.

# 64. Aggregate Timestamp Semantics
- Priority timestamp means latest priority-set time, not first-ever priority event.
- Defer timestamp means current defer start.
- Resume clears current defer timestamp if aggregate represents active state.
- Remake requested timestamp may be aggregate latest remake request if field exists.
- Historical event times remain authoritative for full history.
- DB clock is preferred for durable evidence.
- Browser timestamps are never authority.

# 65. Database Audit Gate
- Inspect `foodflow.orders` exact columns on R04 parent.
- Inspect indexes supporting queue query.
- Inspect CHECK constraints for statuses/customer statuses.
- Inspect order-events event-type constraints.
- Inspect R04 restrictive branch policies.
- Inspect flow_runtime UPDATE permissions.
- Inspect whether priority/defer/remake metadata already exists.
- Inspect generated Kysely types.
- Inspect queue cursor format/version.
- Do not add duplicate columns or indexes.

# 66. Expected Migration Strategy
- A forward migration is likely if priority/defer current-state metadata does not exist.
- Prefer additive nullable/default-safe columns.
- Add bounded CHECK constraints when useful.
- Preserve existing rows as normal/non-deferred/remake_count=0.
- Add only indexes required by actual queue query.
- Avoid wide composite index duplication.
- Extend event constraints only when required.
- Regenerate generated DB types when table schema changes.
- Never rewrite historical migrations.

# 67. Candidate Schema — Priority
- `priority_code text not null default 'NORMAL'` or semantically equivalent.
- CHECK limited to `NORMAL`, `URGENT`.
- `prioritized_at timestamptz null`.
- `prioritized_by_staff uuid null` only if current-state UI needs actor.
- Optional `priority_reason text null` only if current-state display/filter requires it.
- Event evidence remains mandatory regardless of aggregate reason storage.
- Avoid redundant fields without read-model need.

# 68. Candidate Schema — Delay
- `defer_reason text null`.
- `deferred_at timestamptz null`.
- `deferred_until timestamptz null`.
- `deferred_by_staff uuid null` only if useful.
- Constraint ensures reason/time consistency for active defer.
- Non-deferred rows should have defer fields null.
- Resume clears active aggregate fields.
- Event history preserves prior defer episodes.

# 69. Candidate Schema — Remake
- `remake_count integer not null default 0` when aggregate count chosen.
- CHECK `remake_count >= 0` and bounded maximum.
- Optional `last_remake_reason text null` only if UI/current-state query needs it.
- Optional `remake_requested_at timestamptz null` only if current-state display needs it.
- Do not duplicate immutable event history unnecessarily.
- Existing status REMAKE is reused.

# 70. Schema Consistency Constraints
- URGENT current state may require non-null prioritized_at if stored.
- NORMAL state may clear priority metadata according to chosen model.
- Active defer requires defer_reason and deferred_at.
- `deferred_until` must be >= deferred_at when non-null.
- Remake count cannot decrease.
- Terminal rows may retain historical priority timestamps if model chooses; UI must use current code field, not timestamp existence alone.
- Constraints must not invalidate existing rows.

# 71. Queue Index Strategy
- Audit existing `(tenant_id, branch_id, status, submitted_at ...)` index.
- If priority/defer ordering becomes hot path, consider one focused composite index.
- Example: `(tenant_id, branch_id, priority_code, deferred_at, submitted_at, id)` only if query plan matches.
- Do not create speculative multi-column index without query need.
- Keep index width reasonable.
- Preserve write performance.
- Explain index choice in implementation PR.

# 72. Cursor Versioning
- If queue ordering gains priority/defer rank, old cursor payload may be insufficient.
- Bump cursor version when ordering keys change.
- New cursor includes all rank fields required for strict continuation.
- Parser rejects unknown future version safely.
- Rolling deploy accepts old cursor only if semantics remain correct.
- Otherwise old cursor returns safe validation error and UI restarts pagination.
- Do not silently mix version semantics.

# 73. Queue Ordering Contract
- Define one server ranking function.
- Suggested primary rank: non-deferred before deferred.
- Suggested secondary rank: urgent before normal.
- Suggested tertiary rank: submitted_at oldest first for actionable queue.
- UUID tie-breaker provides determinism.
- If product requires urgent deferred above normal active, document alternate rank explicitly.
- UI does not re-sort authoritative server order inconsistently.
- Pagination must match repository ORDER BY exactly.

# 74. Queue Filtering Contract
- Existing status filter remains.
- Optional priority filter may be added with closed enum.
- Optional deferred boolean filter may be added.
- Do not allow arbitrary SQL sort/filter expressions.
- Tenant/branch never come from query string authority.
- Limit remains bounded.
- Cursor remains opaque/versioned.

# 75. Queue Incoming Count
- Audit whether incomingCount includes only PENDING_CONFIRMATION/CHANGED.
- Priority/defer metadata should not redefine incomingCount silently.
- Remake may need separate active-exception count only if UI product need exists.
- Do not overload one count with unrelated meaning.
- If new count added, define exact statuses.
- Keep query bounded/aggregated.

# 76. Detail Read Contract
- Detail exposes current priority/defer/remake metadata required by controls.
- Detail preserves durable item snapshots.
- Detail preserves customer note and status.
- Detail does not expose internal actor IDs unless intentionally needed.
- Detail does not expose customer capability secret material.
- Detail does not expose replay keys.
- Detail remains branch-scoped and `order.view` authorized.

# 77. Priority UI
- Show urgent badge clearly.
- Show priority action only on eligible active statuses.
- Require reason when setting urgent.
- Clear action shown only when currently urgent.
- Disable while mutation pending.
- Conflict triggers durable refetch.
- Success triggers durable refetch.
- Do not change lifecycle controls automatically.
- Do not use client-only priority state as authority.

# 78. Defer UI
- Show defer badge/reason on active deferred order.
- Show optional resume expectation time if present.
- Defer action shown only on eligible statuses.
- Resume shown only when actively deferred.
- Require reason selection.
- Optional time input validates future horizon client-side and server-side.
- Conflict refetches durable state.
- Do not hide deferred order from staff entirely.

# 79. Remake UI
- Show remake request only on eligible source statuses.
- Require remake reason.
- Confirm destructive/exception nature.
- REMAKE state visibly indicates production exception.
- START_REMAKE shown only on REMAKE.
- After START_REMAKE, standard PREPARING controls resume.
- Do not show price/refund controls.
- Do not claim kitchen ticket was recreated.
- Refetch durable state after every action.

# 80. UI Pending-State Coordination
- Mutations for same order must disable conflicting controls.
- Priority mutation should not race a local pending cancellation click.
- Defer mutation should not race local lifecycle mutation.
- Remake mutation should disable lifecycle/cancel controls for that order while pending.
- Unrelated order rows remain usable.
- Pending state clears on all response/error paths.
- Server remains final concurrency authority.

# 81. UI Conflict Recovery
- 409 means stale or illegal source/current metadata.
- Show concise conflict message.
- Immediately refetch queue/detail.
- Discard stale modal/form state as needed.
- Recompute visible available actions from durable result.
- Do not auto-retry a different business action.
- Do not claim success on conflict.

# 82. UI Accessibility
- Controls are keyboard reachable.
- Reason selectors have accessible labels.
- Confirmation dialogs announce destructive/exception action.
- Badges include text, not color-only semantics.
- Disabled state is perceivable.
- Error feedback is associated with action area.
- Touch targets remain usable on staff tablets.

# 83. UI Responsive Behavior
- Controls fit current staff workspace on tablet/mobile width.
- Long reason labels wrap safely.
- Modal/sheet remains within viewport.
- Priority/defer badges do not destroy row layout.
- REMAKE state remains visually distinct without redesigning entire page.
- Do not redesign unrelated tabs.

# 84. Priority Transaction Sequence
1. Begin authorized transaction.
2. Verify `order.manage`.
3. Load/lock scoped order current state if needed.
4. Verify lifecycle eligibility.
5. Verify current priority state.
6. Apply bounded aggregate priority metadata.
7. Append priority event.
8. Map invariant-checked result.
9. Commit.
- Event failure rolls aggregate change back.
- No external call occurs inside transaction.

# 85. Defer Transaction Sequence
1. Begin authorized transaction.
2. Verify `order.manage`.
3. Load/lock scoped order.
4. Verify status eligibility.
5. Verify not already deferred.
6. Validate reason/time.
7. Persist active defer metadata.
8. Append ORDER_DEFERRED.
9. Map result.
10. Commit.
- All writes are atomic.

# 86. Resume Transaction Sequence
1. Begin authorized transaction.
2. Verify `order.manage`.
3. Load/lock scoped order.
4. Verify active defer metadata.
5. Verify lifecycle remains eligible for resume semantics.
6. Clear active defer fields.
7. Append ORDER_RESUMED.
8. Commit.
- Resume does not mutate lifecycle status.

# 87. Request-Remake Transaction Sequence
1. Begin authorized transaction.
2. Verify `order.manage`.
3. Load/lock scoped order.
4. Verify source READY/SERVED exact policy.
5. Verify remake count below bound.
6. Set status REMAKE.
7. Update remake aggregate metadata/count when used.
8. Preserve other durable order/item snapshots.
9. Append ORDER_REMAKE_REQUESTED with actual from status.
10. Commit.
- Event failure rolls status/count back.

# 88. Start-Remake Transaction Sequence
1. Begin authorized transaction.
2. Verify `order.manage`.
3. Conditional update exact REMAKE source.
4. Set target PREPARING if chosen contract.
5. Set customer status consistent with PREPARING.
6. Set/refresh preparing timestamp according to audited semantics.
7. Append ORDER_REMAKE_STARTED.
8. Commit.
- R03 MARK_READY handles next step.

# 89. Remake Customer-Status Mapping
- REQUEST_REMAKE customer-status mapping must be audited against constraint.
- Prefer an existing status that truthfully conveys active preparation/recovery.
- Do not invent invalid customer status in TypeScript only.
- START_REMAKE should map to PREPARING customer status if target PREPARING.
- READY/SERVED after remake continue R03 mappings.
- If no existing customer status safely represents REMAKE, migration may add one bounded value.
- Rolling deployment compatibility must be assessed before adding value.

# 90. Priority Customer Status
- Priority metadata does not change customer status.
- Customer should not see internal urgency metadata unless later product spec requires it.
- Setting/clearing priority must leave current customer status unchanged.
- Tests verify no customer-status mutation.

# 91. Defer Customer Status
- Delay/defer should not change customer status by default.
- If current product authority requires visible delay, that is a separate explicit mapping decision.
- Do not invent a customer delay status solely for internal UI.
- Tests verify chosen behavior.

# 92. Remake and Cancellation Interaction
- REMAKE may be cancellation-eligible only if explicitly added to R04 cancellation source set by R05 compatibility decision.
- Default R04 excludes REMAKE.
- If R05 enables cancel-from-REMAKE, extend cancellation source server-side narrowly.
- Browser still never sends trusted source state.
- Add regression tests.
- Do not make all statuses cancellable.

# 93. Remake and Amendment Interaction
- REMAKE is not amendment-eligible.
- R04 AMEND remains ACCEPTED-only.
- Do not modify items during remake request/start.
- Production correction item changes require later explicit spec if needed.
- Remake preserves original durable order snapshots.

# 94. Remake and CHANGED Interaction
- CHANGED cannot request remake.
- CHANGED must be re-reviewed first.
- Remake does not enter CHANGED.
- R04 CHANGED decision path remains unchanged.

# 95. Priority and Lifecycle Interaction
- Priority remains through ACCEPTED -> PREPARING -> READY unless clear policy says otherwise.
- Priority should automatically clear at terminal SERVED/CANCELLED/REJECTED/CLOSED only if aggregate invariant requires it.
- If auto-clear occurs as part of terminal transition, that crosses R03/R04 modules and must be narrowly implemented and tested.
- Simpler preferred model: current priority remains stored but queue treats terminal states as not actionable; clear field on terminal only if semantic cleanliness requires it.
- Events remain history.

# 96. Defer and Lifecycle Interaction
- Normal lifecycle should conflict while an active defer is present if defer means paused processing.
- This requires R03 transition service/repository compatibility guard.
- Do not allow START_PREPARING/MARK_READY to ignore active defer if pause semantics are enforced.
- Resume clears defer, then lifecycle can continue.
- R05 may need narrow R03 source query change to include `deferred` guard.
- This is legitimate R05 compatibility work, not lifecycle redesign.
- Tests must prove deferred order cannot advance.

# 97. Defer and Cancellation Interaction
- R04 cancellation may remain allowed while deferred if source lifecycle status is cancellable.
- Cancellation should atomically terminate order and clear active defer metadata or leave it historical-only according to aggregate invariant.
- Prefer clearing active defer fields on terminal cancellation so current state is coherent.
- ORDER_CANCELLED event remains canonical cancellation evidence.
- ORDER_DEFERRED remains historical.
- No ORDER_RESUMED is required when cancellation terminates work.

# 98. Priority and Cancellation Interaction
- Cancellation may clear current priority metadata for terminal-state coherence.
- Historical priority events remain.
- If fields are retained, UI must not show terminal order as actively urgent.
- Prefer explicit aggregate normalization in cancellation if schema invariants require it.
- R04 cancellation regression tests must pass.

# 99. Priority and Remake Interaction
- Remake may preserve urgency.
- If priority is active at REQUEST_REMAKE, keep it unless explicit policy clears it.
- Queue should rank urgent REMAKE accordingly.
- START_REMAKE preserves priority.
- Tests verify no accidental priority loss.

# 100. Defer and Remake Interaction
- REQUEST_REMAKE should fail while actively deferred unless service first resumes or transaction explicitly clears defer with a documented combined action.
- Prefer fail/conflict to avoid hidden multi-field action.
- REMAKE may later be deferred if configured eligible.
- START_REMAKE should fail while remake is actively deferred until resumed.
- Tests prove sequence.

# 101. Exact Conflict Taxonomy
- Missing same-scope order -> NOT_FOUND.
- Cross-scope order -> safe NOT_FOUND/forbidden behavior consistent with current module.
- Ineligible lifecycle status -> CONFLICT.
- Already urgent on SET -> CONFLICT or explicit idempotent success per policy.
- Not urgent on CLEAR -> CONFLICT or explicit no-op.
- Already deferred on DEFER -> CONFLICT.
- Not deferred on RESUME -> CONFLICT.
- Remake source invalid -> CONFLICT.
- Remake max reached -> CONFLICT.

# 102. Error Codes
| Code | Meaning | Suggested HTTP |
|---|---|---:|
| `ORDER_CONTROL_INVALID_REQUEST` | malformed/unbounded input | 400 |
| `ORDER_CONTROL_NOT_FOUND` | scoped resource absent | 404 |
| `ORDER_CONTROL_FORBIDDEN` | authorization denied | 403 |
| `ORDER_CONTROL_CONFLICT` | stale/ineligible/current-state mismatch | 409 |
| `ORDER_CONTROL_INVARIANT_VIOLATION` | server/data contract broken | 500 |
| `ORDER_CONTROL_UNAVAILABLE` | infrastructure unavailable | 503 |
- Reuse shared operational error style where practical.
- Do not expose raw SQL/stack traces.

# 103. Rollback — Priority
- Order load failure -> no write.
- Eligibility failure -> no write.
- Aggregate metadata update failure -> no event.
- Event insert failure -> aggregate update rolls back.
- Result invariant failure before commit -> rollback.
- No partial priority state allowed.

# 104. Rollback — Defer
- Invalid reason/time -> no write.
- Already deferred -> no write.
- Aggregate update failure -> no event.
- Event failure -> defer metadata rollback.
- Result invariant failure -> rollback.
- No partial deferred state allowed.

# 105. Rollback — Resume
- No active defer -> no write.
- Aggregate clear failure -> no event.
- Event failure -> active defer remains because transaction rolls back.
- Result invariant failure -> rollback.

# 106. Rollback — Remake Request
- Ineligible source -> no write.
- Max remake count reached -> no write.
- Status update failure -> no event.
- Counter update failure -> no event/status change.
- Event failure -> status/count rollback.
- Customer-status invariant failure -> rollback.

# 107. Rollback — Remake Start
- Source not REMAKE -> no write.
- Status/customer-status update failure -> no event.
- Event failure -> REMAKE state retained due rollback.
- Preparing timestamp invariant failure -> rollback.
- No half-started remake.

# 108. Priority Concurrency Matrix
| Race | Required outcome |
|---|---|
| SET vs SET | one current state, no contradictory evidence |
| SET vs CLEAR | one winner under exact current metadata |
| SET vs CANCEL | terminal winner prevents stale priority mutation |
| SET vs lifecycle to eligible state | deterministic; priority preserved or conflict per lock order |
| SET vs lifecycle to terminal | terminal state wins or control conflicts |
- No blind last-write-wins.

# 109. Defer Concurrency Matrix
| Race | Required outcome |
|---|---|
| DEFER vs DEFER | one winner |
| DEFER vs RESUME | deterministic current-state guard |
| DEFER vs lifecycle | exactly one valid business outcome |
| DEFER vs CANCEL | exactly one terminal/metadata outcome |
| RESUME vs lifecycle | lifecycle only after defer clear if pause guard applies |
- Loser creates no success event.

# 110. Remake Concurrency Matrix
| Race | Required outcome |
|---|---|
| REQUEST_REMAKE vs REQUEST_REMAKE | one winner |
| REQUEST_REMAKE vs MARK_SERVED from READY | one winner |
| REQUEST_REMAKE vs CANCEL | one winner |
| START_REMAKE vs START_REMAKE | one winner |
| START_REMAKE vs CANCEL from REMAKE if enabled | one winner |
- Remake count increments once per successful request.

# 111. Lock Ordering
- Parent order row lock first for multi-metadata coordination.
- No child locks are required by default for priority/defer/remake.
- Preserve R04 parent-first ordering.
- Avoid opposite lock order with lifecycle/exception modules.
- No external calls while locks held.
- Stable lock strategy reduces deadlock risk.
- Do not add unbounded retry loops.

# 112. Idempotency Semantics
- R05 does not add generic staff idempotency replay storage.
- Browser duplicate retry after committed metadata change may conflict.
- Durable refetch is recovery mechanism.
- Remake count must not double-increment on concurrent duplicates because exact-state guard/locking prevents it.
- Ambiguous network outcome requires refetch.
- Do not claim exact replay semantics.

# 113. Ambiguous Response Recovery
- Priority commit + lost response -> refetch shows urgent.
- Defer commit + lost response -> refetch shows deferred.
- Resume commit + lost response -> refetch shows active/non-deferred.
- Remake request commit + lost response -> refetch shows REMAKE.
- Remake start commit + lost response -> refetch shows PREPARING.
- UI should not automatically issue different action after timeout.

# 114. RLS Requirements
- R04 restrictive branch policies remain effective.
- R05 migration must not weaken them.
- flow_runtime can update only rows within current tenant+branch through RLS.
- Customer roles cannot update R05 control fields.
- Customer/public roles cannot insert staff control events.
- order_events UPDATE/DELETE remain revoked.
- New table, if any, requires explicit tenant/branch RLS.
- Prefer aggregate fields on already-protected orders when sufficient.

# 115. Direct Database Defense
- Application permission checks remain primary business authorization.
- RLS is defense in depth.
- Direct flow_runtime context for sibling branch cannot mutate priority/defer/remake metadata.
- Direct customer role cannot mutate production controls.
- Missing branch context fails closed.
- Invalid tenant context fails closed.
- Tests prove actual database role behavior.

# 116. Security — Mass Assignment
- Reject `tenantId`.
- Reject `branchId`.
- Reject `actorId`.
- Reject `status`.
- Reject `customerStatus`.
- Reject `priorityRank`.
- Reject `prioritizedAt`.
- Reject `deferredAt`.
- Reject `deferredBy`.
- Reject `remakeCount`.
- Reject arbitrary event type.
- Construct DB patches from trusted server values only.

# 117. Security — Text Inputs
- Optional notes are plain untrusted text.
- Hard server max required.
- Do not intentionally store HTML.
- Do not render with dangerous HTML APIs.
- Preserve Thai/Unicode safely within bound.
- Avoid logging full notes.
- Machine reason code remains primary evidence.

# 118. Security — Time Inputs
- `deferredUntil` is the only potentially client-proposed timestamp.
- Parse strict ISO timestamp.
- Require finite valid date.
- Require future relative to server/database now.
- Bound maximum horizon, e.g. 24 hours or product-defined maximum.
- Reject timezone-less ambiguous strings if parser contract requires offset/Z.
- Canonicalize to UTC for storage.
- Never trust browser current time for deferredAt.

# 119. Security — CSRF/Origin
- Internal mutation route uses same-origin enforcement.
- Mutation is POST only.
- Session cookie alone is not sufficient; permission required.
- Wrong-origin requests fail.
- Missing-origin behavior follows established internal policy.
- Tests cover cross-origin attempt.

# 120. Security — SQL Injection
- Use Kysely parameterization.
- No string-concatenated order IDs/reason codes.
- Dynamic SQL column choice only from server enums when unavoidable.
- Browser cannot choose column/order-by identifier.
- Cursor decode never becomes raw SQL.

# 121. Observability
- Log safe action code.
- Log safe order UUID according to existing policy.
- Log conflict classification separately from infrastructure failure.
- Do not log session cookies.
- Do not log auth headers.
- Do not log customer capability tokens.
- Do not log full optional notes.
- Reason codes are safe bounded observability dimensions.
- Remake count may be logged as number if needed.

# 122. Performance
- Priority/defer/remake mutations are O(1) aggregate writes plus one event insert.
- Queue query remains bounded/keyset paginated.
- Avoid event-history scans per queue row.
- Avoid N+1 queries for current metadata.
- Add at most one focused index if needed.
- Queue count queries remain aggregated.
- Keep mutation transactions short.

# 123. Resource Bounds
| Resource | Required bound |
|---|---|
| queue page size | preserve current hard max |
| priority reason | enum only |
| defer reason | enum only |
| remake reason | enum only |
| optional note | <= 512 or current standard |
| defer horizon | bounded, recommended <= 24h unless product says otherwise |
| remake count | bounded, recommended <= 3 |
| request body | reuse existing internal mutation body limit |
- Bounds are server-side.

# 124. Rolling Deployment — Schema First
- New columns must be nullable/default-safe for old code.
- Old R04 code should ignore new metadata safely.
- New indexes do not alter old semantics.
- Event-type constraint extension must accept old events.
- Cursor version change requires client/server compatibility plan.
- Migration-first window must not break R04 routes.

# 125. Rolling Deployment — Code First
- New code must fail safely if required columns are missing.
- Preferred deployment order is migration before code when additive schema is required.
- Do not catch missing-column errors and claim success.
- Hosted deployment process remains outside this docs task.
- Implementation PR documents expected order.

# 126. Migration Backfill Safety
- Existing orders default NORMAL priority.
- Existing orders default non-deferred.
- Existing remake_count defaults 0 if field added.
- Do not synthesize priority/defer/remake events for historical rows.
- Do not overwrite existing lifecycle timestamps.
- Do not rewrite R04 migration.
- Fresh reset must succeed.

# 127. Generated Types
- If order columns are added, regenerate Kysely database types.
- Commit generated type changes as required by repo convention.
- Run type drift verification.
- If no schema change, generated types must remain unchanged.
- PR must state `GENERATED_DB_TYPES_CHANGED=YES|NO` truthfully.

# 128. Unit Test Matrix — Action Parsing
- [ ] valid SET_PRIORITY parses.
- [ ] valid CLEAR_PRIORITY parses.
- [ ] valid DEFER_ORDER parses.
- [ ] valid RESUME_ORDER parses.
- [ ] valid REQUEST_REMAKE parses.
- [ ] valid START_REMAKE parses.
- [ ] unknown action rejects.
- [ ] missing action rejects.
- [ ] array/non-object body rejects.
- [ ] unknown top-level fields reject.

# 129. Unit Test Matrix — Priority Parsing
- [ ] known reason accepted.
- [ ] unknown reason rejected.
- [ ] numeric reason rejected.
- [ ] browser rank rejected.
- [ ] browser actor rejected.
- [ ] browser status rejected.
- [ ] overlong optional note rejected if supported.
- [ ] clear action rejects set-only fields.

# 130. Unit Test Matrix — Defer Parsing
- [ ] known defer reason accepted.
- [ ] missing reason rejected.
- [ ] invalid deferredUntil rejected.
- [ ] past deferredUntil rejected.
- [ ] beyond-horizon deferredUntil rejected.
- [ ] valid offset/Z timestamp accepted.
- [ ] browser deferredAt rejected.
- [ ] browser actor rejected.
- [ ] resume rejects defer-only fields.

# 131. Unit Test Matrix — Remake Parsing
- [ ] known remake reason accepted.
- [ ] missing reason rejected.
- [ ] unknown reason rejected.
- [ ] browser target status rejected.
- [ ] browser source status rejected.
- [ ] browser remake count rejected.
- [ ] overlong note rejected.
- [ ] START_REMAKE rejects reason-only fields when not supported.

# 132. Unit Test Matrix — Result Invariants
- [ ] priority set result requires urgent state.
- [ ] priority clear result requires normal state.
- [ ] defer result requires active defer metadata.
- [ ] resume result requires defer metadata cleared.
- [ ] remake request result requires REMAKE.
- [ ] remake start result requires PREPARING.
- [ ] invalid Date produces invariant error.
- [ ] unknown reason/status produces invariant error.
- [ ] safe error mapping matches taxonomy.

# 133. Unit Test Matrix — Queue Cursor
- [ ] current cursor version round-trip.
- [ ] priority/defer rank dimensions round-trip if added.
- [ ] malformed cursor rejected.
- [ ] unknown version rejected.
- [ ] stale old cursor behavior deliberate.
- [ ] tampered payload rejected safely.
- [ ] deterministic ordering comparator matches DB order semantics.

# 134. Integration — Priority Happy Path
- [ ] authorized staff sets urgent.
- [ ] current lifecycle status unchanged.
- [ ] customer status unchanged.
- [ ] reason persists if aggregate field chosen.
- [ ] timestamp DB-derived.
- [ ] event actor equals current staff actor.
- [ ] queue/detail show urgent after refetch.
- [ ] clear returns to normal.
- [ ] clear appends evidence.

# 135. Integration — Priority Eligibility
- [ ] ACCEPTED set allowed.
- [ ] PREPARING set allowed.
- [ ] READY set allowed if chosen.
- [ ] REMAKE set allowed if chosen.
- [ ] CANCELLED denied.
- [ ] REJECTED denied.
- [ ] SERVED denied unless explicit policy says otherwise.
- [ ] PAID/CLOSED/VOIDED denied.
- [ ] no event on denied state.

# 136. Integration — Defer Happy Path
- [ ] eligible active order can defer.
- [ ] lifecycle state unchanged.
- [ ] reason persists.
- [ ] deferredAt DB-derived.
- [ ] deferredUntil canonicalized when provided.
- [ ] event appended.
- [ ] queue/detail show deferred.
- [ ] resume clears active defer state.
- [ ] resume event appended.

# 137. Integration — Defer Lifecycle Guard
- [ ] deferred ACCEPTED cannot START_PREPARING when pause semantics enforced.
- [ ] deferred PREPARING cannot MARK_READY.
- [ ] resumed ACCEPTED can START_PREPARING.
- [ ] resumed PREPARING can MARK_READY.
- [ ] deferred order can cancel when source remains R04-cancellable.
- [ ] cancellation yields terminal coherent defer state.

# 138. Integration — Remake Happy Path
- [ ] READY can request remake.
- [ ] SERVED can request remake if enabled.
- [ ] request sets REMAKE.
- [ ] request increments remake count once.
- [ ] request persists reason/event.
- [ ] START_REMAKE moves REMAKE to PREPARING.
- [ ] MARK_READY works after remake start.
- [ ] MARK_SERVED works after remake ready.
- [ ] prior events remain intact.

# 139. Integration — Remake Eligibility
- [ ] ACCEPTED request remake denied.
- [ ] PREPARING request remake denied.
- [ ] CHANGED request remake denied.
- [ ] PENDING_CONFIRMATION denied.
- [ ] CANCELLED denied.
- [ ] REJECTED denied.
- [ ] CLOSED/VOIDED denied.
- [ ] REMAKE duplicate request denied.
- [ ] no event on denied state.

# 140. Integration — Remake Bound
- [ ] remake count starts at zero.
- [ ] first request increments to one.
- [ ] repeated completed remake cycle increments each new request once.
- [ ] maximum allowed count succeeds at boundary.
- [ ] request beyond maximum conflicts.
- [ ] concurrent duplicate cannot increment twice.
- [ ] rollback does not increment count.

# 141. Authorization Tests
- [ ] order.view without order.manage cannot set priority.
- [ ] order.view without order.manage cannot defer.
- [ ] order.view without order.manage cannot remake.
- [ ] sibling branch cannot mutate controls.
- [ ] cross tenant cannot mutate controls.
- [ ] revoked membership denies next action.
- [ ] removed permission denies next action.
- [ ] customer capability cannot authenticate control route.
- [ ] public/customer DB roles cannot write control fields/events.

# 142. RLS / DB Tests — Aggregate
- [ ] flow_runtime correct branch can update intended fields.
- [ ] sibling branch blocked by restrictive RLS.
- [ ] cross tenant blocked.
- [ ] missing branch context blocked.
- [ ] customer runtime cannot update priority.
- [ ] customer runtime cannot update defer.
- [ ] customer runtime cannot set REMAKE.
- [ ] anon/authenticated direct roles cannot bypass app auth.

# 143. DB Tests — Constraints
- [ ] invalid priority code rejected.
- [ ] valid priority code accepted.
- [ ] inconsistent defer fields rejected when constraint exists.
- [ ] deferredUntil before deferredAt rejected if constraint exists.
- [ ] negative remake count rejected.
- [ ] remake count over maximum rejected if DB-enforced.
- [ ] existing statuses remain valid.
- [ ] existing customer statuses remain valid.

# 144. DB Tests — Events
- [ ] priority set event inserted.
- [ ] priority clear event inserted.
- [ ] defer event inserted.
- [ ] resume event inserted.
- [ ] remake requested event inserted with true source.
- [ ] remake started event inserted.
- [ ] actor equals current actor.
- [ ] timestamps DB-derived.
- [ ] UPDATE/DELETE on historical events remain denied.

# 145. Concurrency Tests — Priority
- [ ] concurrent set/set produces coherent one current state.
- [ ] set/clear race deterministic.
- [ ] priority/cancel race cannot leave terminal urgent active state inconsistent.
- [ ] priority/lifecycle race obeys eligibility.
- [ ] event count matches successful mutations only.

# 146. Concurrency Tests — Defer
- [ ] defer/defer one winner.
- [ ] defer/resume one winner based on current state.
- [ ] defer/lifecycle one valid outcome.
- [ ] defer/cancel one valid outcome.
- [ ] loser writes no event.
- [ ] no partial defer metadata.

# 147. Concurrency Tests — Remake
- [ ] remake/remake one winner.
- [ ] remake/mark-served race deterministic from READY.
- [ ] remake/cancel race deterministic.
- [ ] start-remake/start-remake one winner.
- [ ] remake count increments once.
- [ ] loser appends no remake event.

# 148. Rollback Tests — Priority
- [ ] event failure rolls priority aggregate back.
- [ ] actor/timestamp metadata rolls back.
- [ ] no success returned.
- [ ] refetch shows original current priority.

# 149. Rollback Tests — Defer
- [ ] event failure rolls defer metadata back.
- [ ] deferredUntil rollback confirmed.
- [ ] no ORDER_DEFERRED remains.
- [ ] resume event failure preserves active defer state.
- [ ] no partial current state.

# 150. Rollback Tests — Remake
- [ ] remake event failure rolls status back.
- [ ] remake count rolls back.
- [ ] customer status rolls back.
- [ ] start-remake event failure preserves REMAKE.
- [ ] preparing timestamp change rolls back.

# 151. Regression Matrix — R01
- [ ] queue remains server-backed.
- [ ] detail remains server-backed.
- [ ] order.view enforcement preserved.
- [ ] branch isolation preserved.
- [ ] keyset pagination deterministic after any cursor change.
- [ ] client demo state does not regain authority.

# 152. Regression Matrix — R02
- [ ] initial accept works.
- [ ] initial reject works.
- [ ] CHANGED re-accept works.
- [ ] CHANGED re-reject works.
- [ ] decision evidence remains append-only.
- [ ] R05 metadata does not broaden decision source set.

# 153. Regression Matrix — R03
- [ ] ACCEPTED -> PREPARING works when not deferred.
- [ ] PREPARING -> READY works when not deferred.
- [ ] READY -> SERVED works.
- [ ] illegal skips still conflict.
- [ ] lifecycle evidence remains correct.
- [ ] deferred guard compatibility is deliberate/tested.
- [ ] post-remake PREPARING can reuse MARK_READY.

# 154. Regression Matrix — R04
- [ ] accepted amendment works.
- [ ] amendment moves to CHANGED.
- [ ] cancellation from original allowed states still works.
- [ ] cancellation actor/reason/event evidence intact.
- [ ] restrictive branch RLS remains intact.
- [ ] no browser money authority introduced.
- [ ] no generic status patch introduced.

# 155. Cross-Control Regression
- [ ] priority does not change subtotal.
- [ ] defer does not change subtotal.
- [ ] remake request does not mutate item snapshots.
- [ ] controls do not change currency.
- [ ] controls do not reassign table.
- [ ] controls do not reassign branch/tenant.
- [ ] controls do not call payment code.
- [ ] controls do not call kitchen code.

# 156. Failure Recovery Matrix
| Failure | Expected behavior | Recovery |
|---|---|---|
| auth unavailable | 503/unavailable | retry after recovery |
| permission denied | safe 403 | regain permission only via authority |
| order missing | safe 404 | refresh queue |
| stale state | 409 | refetch durable order |
| DB unavailable | bounded 503 | retry after recovery |
| event insert failure | transaction rollback | inspect/retry |
| network lost post-commit | ambiguous | refetch durable state |
| constraint violation | safe invariant failure | fix defect; no partial success |

# 157. No Hidden Kitchen Side Effects
- Priority does not reprioritize kitchen ticket because R05 has no kitchen integration.
- Defer does not pause kitchen ticket.
- Remake does not create replacement kitchen ticket.
- START_REMAKE does not route station work.
- Order-events are domain evidence only.
- Later kitchen phase must consume/order-domain state deliberately.
- UI wording must not imply kitchen device synchronization exists.

# 158. No Hidden Payment Side Effects
- Priority does not affect billing.
- Defer does not affect billing.
- Remake does not issue refund/credit.
- Remake does not void payment.
- R05 does not write payment tables.
- R05 does not call payment provider SDK.
- Paid-order remake remains fail-closed unless explicit safe semantics exist.

# 159. No Hidden Realtime Side Effects
- R05 does not publish websocket messages explicitly.
- R05 does not publish Supabase realtime events explicitly.
- R05 does not create outbox rows unless existing architecture already mandates them and exact scope requires it.
- UI refreshes through HTTP response/refetch.
- Events are audit evidence, not realtime transport.

# 160. No Hidden Notification Side Effects
- R05 does not send LINE.
- R05 does not send email.
- R05 does not send push.
- Delay reason does not automatically notify customer.
- Remake request does not automatically notify customer.
- Notification behavior belongs later explicit scope.

# 161. Customer-Facing Compatibility
- Internal priority should not leak to customer by default.
- Internal defer metadata should not leak unless product explicitly wants customer delay state later.
- Remake may change customer status only through deliberate mapped value.
- Customer capability receives no staff-control authority.
- Customer app remains read-only regarding staff production controls.
- Customer security boundaries from Phase 03 remain intact.

# 162. Audit / Observability Acceptance
- Every successful control mutation has exactly one expected current-state change.
- Every successful mutation has durable event evidence.
- Actor comes from AccessContext.
- Event timestamp comes from DB.
- Reason codes are bounded.
- Failed commands append no success evidence.
- Historical evidence cannot be mutated by application runtime.

# 163. PR Evidence — Lineage
- Record exact spec filename.
- Record main authority SHA at implementation start.
- Record R04 parent branch.
- Record exact R04 parent SHA.
- Record R05 branch.
- Record R05 final head SHA.
- Record ahead/behind lineage.
- Record implementation PR number.
- Keep merge owner-controlled.

# 164. PR Evidence — Schema
- State `MIGRATION_REQUIRED=YES|NO`.
- List migration filename(s) when YES.
- State priority persistence strategy.
- State defer persistence strategy.
- State remake count strategy.
- State event vocabulary changes.
- State customer-status changes if any.
- State indexes added/omitted with reason.
- State generated type change YES/NO.
- State production destructive mutation = NO.

# 165. PR Evidence — Behavior
- List priority eligibility statuses.
- List priority reason codes.
- List defer eligibility statuses.
- List defer reason codes/horizon.
- List remake source statuses.
- List remake reason codes.
- State remake maximum.
- State REMAKE -> next controlled transition.
- State queue ranking semantics.
- State cursor version decision.

# 166. PR Evidence — Security
- State `order.manage` enforcement.
- State branch RLS behavior.
- State customer/public denial.
- State mass-assignment denial.
- State same-origin enforcement.
- State log-redaction behavior.
- State no payment/kitchen/realtime/notification side effects.

# 167. PR Evidence — Validation
- Record Repository Integrity.
- Record Phase/Round Gate.
- Record Dependency Integrity when applicable.
- Record lint.
- Record typecheck.
- Record unit tests.
- Record integration tests.
- Record build.
- Record DB reset.
- Record pgTAP.
- Record DB lint.
- Record type generation/drift.
- Record browser E2E or truthful NOT RUN.

# 168. Expected Validation Commands
- Run `npm ci` when current workflow requires clean install.
- Run lint.
- Run typecheck.
- Run unit tests.
- Run integration tests.
- Run Next.js build.
- Run local Supabase start when DB work exists.
- Run fresh database reset/migrations/seed.
- Run pgTAP/database SQL tests.
- Run database lint.
- Run generated DB type generation and drift check if schema changes.
- Run relevant browser E2E when configured/available.
- Record only observed PASS/FAIL/NOT RUN/BLOCKED/NOT APPLICABLE.

# 169. Browser/E2E Matrix
- [ ] urgent toggle visible on eligible order.
- [ ] priority success persists after reload.
- [ ] defer modal requires reason.
- [ ] deferred state persists after reload.
- [ ] resume clears deferred badge.
- [ ] remake request requires reason.
- [ ] REMAKE state visible after success.
- [ ] START_REMAKE moves to PREPARING UI.
- [ ] stale mutation conflict refetches durable state.
- [ ] wrong-origin mutation denied.
- [ ] view-only staff cannot invoke controls.
- [ ] customer session cannot authenticate route.

# 170. Boundary Cases — Priority
- [ ] set on already urgent behavior deliberate.
- [ ] clear on normal behavior deliberate.
- [ ] priority preserved across eligible lifecycle transition.
- [ ] terminal state does not appear actively urgent in UI.
- [ ] unknown priority/reason rejected.
- [ ] two simultaneous managers deterministic.

# 171. Boundary Cases — Defer
- [ ] defer without reason rejected.
- [ ] defer with exact max note accepted.
- [ ] overlong note rejected.
- [ ] deferredUntil exactly horizon accepted/rejected per explicit bound.
- [ ] one millisecond beyond horizon rejected if strict.
- [ ] timezone conversion correct.
- [ ] resume after cancellation denied.
- [ ] expired deferredUntil does not auto-resume without scheduler.

# 172. Boundary Cases — Remake
- [ ] request at max-1 count succeeds.
- [ ] request at max count rejects.
- [ ] request READY vs MARK_SERVED race one winner.
- [ ] request SERVED allowed/denied according to locked policy.
- [ ] duplicate after committed request conflicts.
- [ ] START_REMAKE only from REMAKE.
- [ ] MARK_READY only after START_REMAKE reaches PREPARING.

# 173. Data Integrity — Priority
- Priority enum always valid.
- Prioritized timestamp semantics consistent with current priority state.
- Priority mutation never changes order money.
- Priority mutation never changes item rows.
- Priority mutation never changes customer capability ownership.
- Priority event actor/timestamp/reason consistent.

# 174. Data Integrity — Defer
- Active defer fields form one coherent tuple.
- Resume clears active tuple.
- Defer mutation never changes item/order money.
- Defer mutation never changes lifecycle status by default.
- Defer event reason matches validated code.
- Cancellation handles active tuple coherently.

# 175. Data Integrity — Remake
- Remake count monotonic non-negative.
- Remake request changes only permitted aggregate lifecycle/control fields.
- Item snapshots remain immutable.
- Subtotal/currency remain unchanged.
- Event from/to status accurate.
- Start-remake preserves remake count/history.

# 176. Performance Test Expectations
- Queue query remains bounded under priority/defer sorting.
- Pagination does not duplicate/drop rows across rank boundaries.
- Control mutation uses bounded number of queries.
- No event-history N+1 introduced.
- Index plan reviewed if query changes materially.
- Test seed includes mixed priority/defer states.

# 177. Pagination Regression Cases
- [ ] urgent rows paginate deterministically.
- [ ] normal rows paginate deterministically.
- [ ] deferred rows paginate deterministically.
- [ ] transitions between ranks do not corrupt cursor parsing.
- [ ] deleted/cancelled row between pages handled safely.
- [ ] cursor limit bounds preserved.
- [ ] no cross-branch row appears.

# 178. Status/Control Matrix
- `PENDING_CONFIRMATION`: priority optional-policy; defer deny; remake deny.
- `CHANGED`: priority optional-policy; defer deny; remake deny.
- `ACCEPTED`: priority allow; defer allow; remake deny.
- `PREPARING`: priority allow; defer allow; remake deny.
- `READY`: priority allow; defer deny; remake allow.
- `SERVED`: priority deny; defer deny; remake allow if locked policy.
- `REMAKE`: priority allow; defer allow if locked policy; START_REMAKE allow.
- `CANCELLED`: all R05 controls deny.
- `REJECTED`: all R05 controls deny.
- `PAID/CLOSED/VOIDED`: all R05 controls deny by default.
- Server owns final matrix.

# 179. UI Action Matrix
- UI derives actions from durable status/control DTO.
- ACCEPTED shows lifecycle + priority + defer + R04 cancel/amend as applicable.
- PREPARING shows lifecycle + priority + defer + cancel.
- READY shows lifecycle + priority + remake + cancel.
- SERVED shows remake only if allowed.
- REMAKE shows priority/defer/start-remake as configured.
- Terminal rows show no mutation controls.
- UI visibility is advisory; server repeats validation.

# 180. Implementation Order
1. Re-read current main policy/spec.
2. Identify exact R04 parent head.
3. Audit order schema/events/RLS/queue cursor.
4. Lock priority model and eligibility.
5. Lock defer model/reason/horizon.
6. Lock remake source/target/count policy.
7. Decide additive migration fields/indexes.
8. Extend types/parsers/results.
9. Implement repository.
10. Implement service.
11. Implement route transport.
12. Extend queue/detail reads and cursor when required.
13. Add staff UI controls.
14. Add unit tests.
15. Add DB integration/concurrency/rollback tests.
16. Add pgTAP.
17. Run applicable validation.
18. Open/update implementation PR.
19. Stop without merging implementation.

# 181. Definition of Done — Architecture
- [ ] One canonical R05 production-control service exists.
- [ ] One transaction-bound repository exists.
- [ ] No generic order patch endpoint exists.
- [ ] R03 lifecycle remains canonical.
- [ ] R04 exception plane remains canonical.
- [ ] `order.manage` remains mutation authority.
- [ ] Queue/detail remain server-backed.
- [ ] Implementation branch descends from latest R04 lineage.

# 182. Definition of Done — Priority
- [ ] Current priority persists durably.
- [ ] Priority set/clear are bounded explicit actions.
- [ ] Eligibility is server-owned.
- [ ] Reason taxonomy bounded.
- [ ] Queue/detail display current priority.
- [ ] Queue ordering remains deterministic.
- [ ] Durable set/clear events exist.
- [ ] Concurrency behavior proven.

# 183. Definition of Done — Defer
- [ ] Eligible orders can defer.
- [ ] Reason is required/bounded.
- [ ] DeferredAt DB-derived.
- [ ] DeferredUntil bounded when present.
- [ ] Resume clears active defer state.
- [ ] Deferred lifecycle guard deliberate/proven.
- [ ] Durable defer/resume evidence exists.
- [ ] Concurrency/rollback proven.

# 184. Definition of Done — Remake
- [ ] Exact remake source states defined.
- [ ] Remake reason required/bounded.
- [ ] Status moves to REMAKE only through explicit command.
- [ ] Remake count bound enforced.
- [ ] Durable remake-request evidence exists.
- [ ] REMAKE has explicit next controlled action.
- [ ] Normal R03 lifecycle resumes after controlled remake start.
- [ ] No payment/kitchen side effects.
- [ ] Concurrency/rollback proven.

# 185. Definition of Done — Security
- [ ] Auth.js staff identity required.
- [ ] Branch AccessContext required.
- [ ] order.manage required.
- [ ] Cross-tenant denied.
- [ ] Sibling-branch denied.
- [ ] Customer/public roles denied.
- [ ] Mass assignment denied.
- [ ] Wrong origin denied.
- [ ] Secrets/redacted fields not logged.
- [ ] R04 restrictive branch RLS preserved.

# 186. Definition of Done — Database
- [ ] Migration additive/forward-only when needed.
- [ ] Existing rows remain valid.
- [ ] Constraints enforce bounded metadata where appropriate.
- [ ] Required queue index justified.
- [ ] Event vocabulary supports R05 evidence.
- [ ] Generated types updated only when needed.
- [ ] Fresh reset passes during implementation validation.
- [ ] pgTAP covers R05 role/RLS/constraint behavior.

# 187. Definition of Done — Failure Safety
- [ ] Event failure rolls priority update back.
- [ ] Event failure rolls defer update back.
- [ ] Event failure rolls remake update/count back.
- [ ] Stale state returns conflict.
- [ ] Ambiguous response recovery is durable-refetch based.
- [ ] No partial success claimed.
- [ ] No generic retry loop hides conflicts.

# 188. Definition of Done — Regression
- [ ] R01 queue/detail behavior preserved.
- [ ] R02 decision behavior preserved.
- [ ] R03 lifecycle behavior preserved.
- [ ] R04 amendment/review/cancellation preserved.
- [ ] Phase 03 customer security remains intact.
- [ ] No dependency churn unrelated to scope.
- [ ] No kitchen/payment/realtime/notification implementation added.

# 189. R06 Handoff Contract
- R01 durable queue/detail read plane is complete.
- R02 initial/CHANGED decision plane is complete.
- R03 normal lifecycle is complete.
- R04 amendment/review/cancellation exception plane is complete.
- R05 priority/defer/remake controls are complete.
- R06 can test integrated staff order orchestration without inventing another control layer.
- R06 receives exact state/control matrices.
- R06 receives durable event evidence patterns.
- R06 receives branch/RLS authorization regression surface.
- R06 receives queue ordering/cursor regression requirements.

# 190. R06 Must Prove
- queue read isolation.
- initial accept/reject.
- normal accepted lifecycle.
- amendment -> CHANGED -> re-review.
- cancellation.
- priority set/clear.
- defer/resume.
- remake request/start/return through lifecycle.
- cross-tenant/cross-branch denial.
- view-only/customer denial.
- concurrency one-winner semantics.
- rollback evidence.
- fresh DB schema integrity.

# 191. R06 Must Not Need to Rebuild
- Auth.js.
- AccessContext.
- permission catalog.
- queue repository architecture.
- decision service architecture.
- lifecycle service architecture.
- exception service architecture.
- production-control service architecture.
- branch RLS foundation.
- audit event pattern.

# 192. Known Limitations to Record
- No generic staff idempotency replay store.
- No automatic scheduled resume daemon.
- No kitchen ticket prioritization/pause/remake execution.
- No payment refund/credit semantics.
- No realtime publication.
- No notification delivery.
- No cross-business workflow priority framework.
- Paid-order remake remains fail-closed unless exact current model safely supports it.
- Optional customer-visible delay/remake messaging remains future scope.

# 193. Stop Conditions During Implementation
- Exact R05 spec missing from current main.
- Latest R04 lineage cannot be identified.
- R04 implementation materially differs from authoring assumptions.
- Current schema cannot represent bounded priority/defer/remake safely without broad redesign.
- Queue cursor cannot be evolved safely without broader client rewrite.
- Remake would require payment side effects to be correct.
- Remake would require kitchen implementation to be meaningful and no safe order-domain-only state exists.
- order.manage cannot be preserved.
- RLS would need global weakening.
- Destructive migration appears necessary.
- Work would invade R06 acceptance.
- Stop and report exact blocker rather than broadening scope.

# 194. Document Validation Checklist
- [x] Canonical P04/R05 filename.
- [x] Phase 04 / Round 05.
- [x] Status READY.
- [x] Previous P04/R04.
- [x] Next P04/R06.
- [x] Main authority.
- [x] Latest R04 implementation evidence inspected.
- [x] Priority scope explicit.
- [x] Defer scope explicit.
- [x] Remake scope explicit.
- [x] Security/RLS explicit.
- [x] Migration strategy explicit.
- [x] Queue/cursor impact explicit.
- [x] Concurrency/rollback explicit.
- [x] Validation matrices explicit.
- [x] R06 handoff explicit.
- [x] Implementation merge remains owner-controlled.

# 195. Document Internal Consistency
- Priority is metadata, not lifecycle status.
- Defer is metadata, not lifecycle status by default.
- Remake uses existing REMAKE status through explicit action.
- REMAKE continuation is explicit, not generic status patch.
- R03 lifecycle remains authoritative for PREPARING -> READY -> SERVED.
- R04 exception plane remains authoritative for amendment/cancellation.
- All R05 controls require order.manage.
- Browser never chooses tenant/branch/actor/target state.
- Every successful control mutation has durable evidence.
- Kitchen/payment/realtime/notifications remain excluded.
- R06 remains final acceptance round.

# 196. Document-Only Validation Policy
- Document correctness is based on metadata and sequence.
- Document correctness is based on actual R04 code-state evidence.
- Document correctness is based on architecture and module ownership.
- Document correctness is based on schema/migration safety.
- Document correctness is based on authorization/RLS design.
- Document correctness is based on failure/concurrency/rollback behavior.
- Document correctness is based on validation plan quality.
- Document correctness is based on R06 handoff.
- GitHub Actions are not document-validation authority.
- Failed/queued/skipped/missing Actions do not semantically invalidate this document.
- Hosted merge enforcement is reported separately if present.
- Documentation task must not modify runtime/CI to force merge.
- Final file must contain 1,800–2,500 lines inclusive.

# 197. Implementation Validation Policy
- Future R05 implementation runs actual applicable repository checks.
- Source inspection in this spec is not runtime proof.
- Required implementation failures remain blockers.
- Do not fabricate PASS.
- Do not weaken checks.
- Do not rename checks to evade gates.
- Do not suppress failures.
- Implementation PR remains owner-controlled.
- Implementation agent must not merge or enable auto-merge.

# 198. Required Validation Families
- Repository Integrity.
- Phase/Round Gate.
- Dependency Integrity when dependency files change.
- lint.
- typecheck.
- application/unit tests.
- integration tests.
- Next.js build.
- Supabase fresh/reset path when migration exists.
- database SQL/pgTAP tests.
- DB lint.
- generated type drift when schema changes.
- relevant DB runtime integration.
- relevant browser E2E when available/required.

# 199. PR Scope Declaration
```text
IMPLEMENTATION_PHASE=P04
IMPLEMENTATION_ROUND=R05
ORDER_PRIORITY_CONTROL=YES
ORDER_DEFER_RESUME_CONTROL=YES
ORDER_REMAKE_CONTROL=YES
REMAKE_BOUNDED_LOOP_POLICY=YES
ORDER_MANAGE_PERMISSION=YES
BRANCH_RLS_PRESERVED=YES
DURABLE_CONTROL_EVENT_EVIDENCE=YES
DETERMINISTIC_QUEUE_RANKING=YES
EXACT_STATE_CONCURRENCY_GUARD=YES
ARBITRARY_STATUS_PATCH=NO
KITCHEN_ROUTING_EXECUTION=NO
PAYMENT_EXECUTION=NO
REALTIME_PUBLICATION=NO
NOTIFICATION_DELIVERY=NO
GENERIC_STAFF_IDEMPOTENCY=NO
PHASE04_ACCEPTANCE=NO
IMPLEMENTATION_AGENT_MERGE=NO
AUTO_MERGE=NO
```

# 200. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P04/R05 implementation after it is on main.
- Future implementation branches from latest legitimate P04/R04 lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 201. Required Next Specification
```text
FLOW_P04_R06_IMPLEMENTATION_SPEC.md
```
- R06 specification must be authored from actual R05 implementation state.
- R05 does not author the Phase 04 acceptance record.
- R05 does not infer Phase 05 implementation scope.
- No R06 implementation starts until exact R06 spec exists on current main.

# 202. Final R05 Handoff Summary
- Durable staff queue/detail reads remain canonical.
- Initial and CHANGED decisions remain canonical.
- Normal lifecycle remains canonical.
- Amendment/cancellation exception plane remains canonical.
- Priority is durable bounded operational metadata.
- Delay/defer is durable bounded operational metadata.
- Remake becomes an explicit bounded production exception.
- REMAKE has an explicit route back into normal production lifecycle.
- Queue ordering remains deterministic under new control metadata.
- Branch/RLS/order.manage security remains intact.
- All successful control mutations remain auditable.
- Phase 04 acceptance remains R06.

# 203. Final Acceptance Statement
- P04/R05 is READY as an executable specification document.
- The round completes the pre-acceptance operational control surface for Phase 04.
- Priority does not become an arbitrary numeric browser-controlled rank.
- Delay/defer does not become an uncontrolled hidden lifecycle state.
- Remake does not become a generic status override.
- All R05 mutation authority remains server-side and branch-scoped.
- Exact-state/current-metadata guards prevent stale last-write-wins behavior.
- Durable events preserve actor/reason/time evidence.
- Queue/detail remain server-backed projections.
- Kitchen execution remains deferred.
- Payment execution remains deferred.
- Realtime publication remains deferred.
- Notification delivery remains deferred.
- R06 remains responsible for integrated Phase 04 acceptance and next-phase handoff.
