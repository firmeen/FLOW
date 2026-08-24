# FLOW P04 R03 — Implementation Specification
> Phase 04 — Order Orchestration & Control
> Round 03 — Canonical Operational Order Lifecycle Transition Engine
> Revision — Establish the legal internal order lifecycle transition matrix after R02 acceptance/rejection, with branch-scoped authorization, durable transition evidence, transaction-safe state mutation, deterministic stale/conflict behavior, and a focused handoff to R04 exception workflows.

## Metadata
- Phase: `04`
- Round: `03`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P04_R02_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P04_R04_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P04 implementation slot after this specification is on main`
- Current planning scope: `PHASE 04 / ROUND 03 ONLY`
- Implementation parent: `latest completed P04/R02 implementation lineage tip`
- Expected implementation parent branch: `p04-r02-order-decision`
- Observed R02 branch head at authoring: `89b2fa2e8e3a6639082b94e07a808f82c2bb46c6`
- Observed R02 implementation state: `MEANINGFUL IMPLEMENTATION PRESENT`
- Observed R02 branch delta from R01: `20 commits ahead`
- Recommended implementation branch: `p04-r03-order-lifecycle`
- Recommended implementation PR title: `feat(operations): establish canonical order lifecycle transitions`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- General lifecycle transition engine in this round: `YES`
- Accepted order progression in this round: `YES`
- Preparation progression in this round: `YES`
- Ready/served progression in this round: `YES`
- Transition actor/timestamp evidence in this round: `YES`
- Branch-scoped order.manage authorization in this round: `YES`
- Customer status synchronization in this round: `YES`
- Illegal transition rejection in this round: `YES`
- Transition concurrency protection in this round: `YES`
- Order edit/cancel exception workflow in this round: `NO — P04/R04`
- Priority/delay/remake workflow in this round: `NO — P04/R05`
- Phase 04 acceptance in this round: `NO — P04/R06`
- Payment execution in this round: `NO`
- Kitchen routing redesign in this round: `NO`
- Realtime publication in this round: `NO`
- Notification delivery in this round: `NO`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` remains the only policy/specification authority.
- `FLOW_P04_R02_IMPLEMENTATION_SPEC.md` exists on `main` and is READY.
- The R02 specification points `Next` to this canonical R03 filename.
- No canonical R03 executable specification existed on main before this document was authored.
- No `p04-r03-*` implementation branch existed before this documentation branch was created.
- Latest observed implementation lineage is `p04-r02-order-decision`.
- Latest observed R02 implementation head is `89b2fa2e8e3a6639082b94e07a808f82c2bb46c6`.
- R02 is 20 commits ahead of R01.
- R02 adds `order-decision-service.ts`.
- R02 adds `order-decision-repository.ts`.
- R02 adds `POST /api/internal/orders/[id]/decision`.
- R02 persists accepted/rejected evidence on `foodflow.orders`.
- R02 appends `ORDER_ACCEPTED` / `ORDER_REJECTED` rows to `foodflow.order_events`.
- R02 requires `order.manage` through the authorized transaction boundary.
- R02 only permits source status `PENDING_CONFIRMATION` for the decision mutation.
- R02 maps accepted state to `ACCEPTED` + customer `CONFIRMED`.
- R02 maps rejected state to `REJECTED` + customer `REJECTED`.
- R02 returns deterministic conflict if the order is already transitioned.
- R02 contains transport parsing and bounded request tests.
- R02 contains integration and pgTAP decision-boundary tests.
- R02 does not implement accepted-order progression beyond the decision boundary.
- R02 does not implement PREPARING / READY / SERVED transitions.
- R02 does not implement general arbitrary status mutation.
- R02 does not implement exception cancellation/edit workflows.
- R02 does not implement priority/delay/remake controls.
- This task is specification/documentation only.
- This task does not create the R03 implementation branch.
- This task does not modify runtime/application code.
- This task does not implement database migrations.
- This task does not modify workflow configuration.
- This task does not merge any implementation PR.

# 2. Phase 04 Objective
- Phase 04 establishes durable internal operational control over submitted customer orders.
- R01 establishes the server-backed branch order queue and order detail read plane.
- R02 establishes explicit staff accept/reject decisions.
- R03 establishes the canonical lifecycle transition engine for accepted operational orders.
- R04 will handle exceptional edit/cancel workflows around the lifecycle.
- R05 will handle priority, delay, remake, and operational escalation controls.
- R06 will prove Phase 04 end-to-end acceptance and hand off to the next phase.
- Phase 04 must preserve tenant isolation.
- Phase 04 must preserve branch isolation.
- Phase 04 must preserve `order.view` vs `order.manage` separation.
- Phase 04 must preserve customer history and status synchronization.
- Phase 04 must avoid arbitrary status writes from client/UI input.
- Phase 04 must preserve exact transition evidence for operational traceability.
- Phase 04 must avoid coupling lifecycle correctness to UI component state.
- Phase 04 must preserve future kitchen, realtime, payment, and notification integrations without implementing them prematurely.

# 3. Six-Round Phase Boundary
- R01 owns durable operational queue/detail reads.
- R02 owns initial accept/reject decision boundary.
- R03 owns legal operational lifecycle transitions after acceptance.
- R04 owns exceptional order edit/cancel workflows.
- R05 owns priority/delay/remake controls and operational escalation.
- R06 owns integrated acceptance.
- R03 must not absorb R04 cancellation/edit exception semantics.
- R03 must not absorb R05 priority or remake semantics.
- R03 must not start kitchen-routing redesign.
- R03 must not add payment execution.
- R03 must not add realtime/event broker infrastructure merely to expose transition changes.

# 4. Why R03 Exists Now
- R02 gives the system a durable accepted order state.
- Accepted orders still need deterministic operational progression.
- Without one canonical transition engine, staff/kitchen/cashier surfaces may each invent their own state writes.
- Arbitrary status mutation would bypass business invariants.
- Client-controlled `status` payloads are too broad for operational authority.
- Transition evidence must be durable and queryable independently of UI state.
- Stale multi-device actions must produce deterministic conflict instead of last-write-wins ambiguity.
- R03 therefore creates one authoritative operational lifecycle transition plane.

# 5. R03 High-Impact Objective
- Define the exact legal operational lifecycle states owned by this round.
- Define the exact legal transition edges.
- Encode those transitions in server-side domain logic.
- Enforce source-state predicates at the database mutation boundary.
- Enforce branch-scoped `order.manage` authorization.
- Derive actor/tenant/branch from current authenticated AccessContext only.
- Persist transition timestamp and actor evidence.
- Append canonical `order_events` evidence for every successful transition.
- Synchronize customer-visible order status according to explicit mapping.
- Reject illegal/skipped/reversed transitions deterministically.
- Reject stale concurrent transitions deterministically.
- Keep route handlers thin and non-authoritative.
- Prevent UI from supplying arbitrary target status.
- Expose narrow explicit transition actions only.
- Preserve R01 read-plane DTOs and R02 decision evidence.
- Make R04 able to layer cancellation/edit exceptions without rewriting lifecycle infrastructure.

# 6. R02 Handoff to Preserve
- R02 `OperationalOrderDecisionService` is the authority for PENDING_CONFIRMATION accept/reject.
- R03 must not replace R02 decision semantics with a generic transition that can accept/reject anything.
- R03 begins normal operational progression only after `ACCEPTED`.
- `REJECTED` remains terminal for the normal lifecycle engine.
- R02 actor evidence remains valid historical evidence.
- R02 `ORDER_ACCEPTED` / `ORDER_REJECTED` events remain canonical historical events.
- R03 may reuse shared validation/error/http utilities where suitable.
- R03 should avoid creating a second unrelated operational-order module.
- R03 should extend `src/modules/order-operations/server/`.
- R03 should preserve current authorized transaction helper usage.

# 7. Canonical Lifecycle States — Implementation Audit
- Implementation must inspect the actual database enum/check/domain constraints on the latest R02 lineage.
- Do not invent duplicate state vocabulary if canonical states already exist.
- Expected operational normal-path states are conceptually:
  - `ACCEPTED`
  - `PREPARING`
  - `READY`
  - `SERVED`
- Existing schema may use additional states such as `PENDING_CONFIRMATION`, `REJECTED`, `CANCELLED`, `REMAKING`.
- R03 must distinguish normal-path lifecycle states from exception states.
- R03 must not silently rename historical states.
- If actual schema uses different canonical names, adapt service types to storage without duplicating state columns.

# 8. Normal Lifecycle Transition Matrix
```text
ACCEPTED -> PREPARING
PREPARING -> READY
READY -> SERVED
```
- This is the default legal normal-path graph for R03.
- No skip from ACCEPTED directly to READY.
- No skip from ACCEPTED directly to SERVED.
- No skip from PREPARING directly to SERVED.
- No reverse transition from PREPARING to ACCEPTED.
- No reverse transition from READY to PREPARING in R03.
- No normal transition out of SERVED.
- `REJECTED` cannot enter the normal lifecycle.
- `PENDING_CONFIRMATION` remains owned by R02 decision semantics.
- Cancellation/remake exceptions are not normal edges and remain later-round scope.

# 9. Explicit Transition Action Vocabulary
- Expose action names rather than arbitrary target statuses.
- Suggested command vocabulary:
  - `START_PREPARING`
  - `MARK_READY`
  - `MARK_SERVED`
- Exact naming may follow repository conventions.
- Each action maps to exactly one source and one destination status.
- Client cannot submit `{ status: "..." }` as unrestricted mutation authority.
- Unknown action fails validation.
- Future exception actions must not be inferred from current strings.

# 10. Canonical Transition Command Type
```ts
export type OperationalOrderLifecycleAction =
  | "START_PREPARING"
  | "MARK_READY"
  | "MARK_SERVED";

export interface OperationalOrderLifecycleCommand {
  readonly orderId: string;
  readonly action: OperationalOrderLifecycleAction;
}
```
- Keep command intent minimal.
- Do not accept tenantId.
- Do not accept branchId.
- Do not accept actorId.
- Do not accept source status from browser.
- Do not accept target status from browser.
- Do not accept transition timestamp from browser.

# 11. Transition Specification Map
- Implement one server-side immutable map from action to transition contract.
- Each entry defines expected source state.
- Each entry defines target operational state.
- Each entry defines customer-status mapping.
- Each entry defines event type.
- Each entry defines timestamp column if canonical schema uses per-state timestamps.
- The map should be exhaustive over the R03 action union.
- Avoid repeated switch logic across route/repository/UI files.

# 12. Suggested Transition Map
```ts
const LIFECYCLE_TRANSITIONS = {
  START_PREPARING: {
    from: "ACCEPTED",
    to: "PREPARING",
    eventType: "ORDER_PREPARING",
  },
  MARK_READY: {
    from: "PREPARING",
    to: "READY",
    eventType: "ORDER_READY",
  },
  MARK_SERVED: {
    from: "READY",
    to: "SERVED",
    eventType: "ORDER_SERVED",
  },
} as const;
```
- Exact event names must be reconciled with existing event vocabulary.
- Do not create near-duplicate event names if equivalents exist.

# 13. Customer Status Mapping
- Customer-visible status must be deliberately mapped, not copied blindly from operational status.
- Implementation must audit existing customer status domain values.
- `ACCEPTED` already maps to customer `CONFIRMED` from R02.
- Starting preparation should map to the canonical customer-facing preparation state if it exists.
- Ready should map to canonical ready/customer-completion-waiting state if it exists.
- Served should map to canonical served/completed state if it exists.
- If current customer status model intentionally stays coarser, preserve that contract rather than adding unsupported statuses.
- Customer mapping must be declared in transition map or one adjacent mapper.
- Customer status cannot be caller-controlled.

# 14. Timestamp Evidence
- Every successful lifecycle transition must have a database-authoritative timestamp.
- Prefer `clock_timestamp()` or repository-standard DB time.
- Do not trust browser time.
- Audit current order columns for `preparing_at`, `ready_at`, `served_at`, or equivalents.
- If missing and operationally needed, add forward-only nullable timestamp columns.
- Only the matching successful transition may set its timestamp.
- Rejected conflicts must not update timestamps.
- Earlier timestamps must not be rewritten by later transitions.

# 15. Actor Evidence
- Every successful lifecycle transition must identify the staff actor.
- Current R02 uses `modified_by_staff` plus `order_events.actor_id`.
- R03 should preserve this model unless actual schema has a more precise transition actor field.
- At minimum, `order_events.actor_id` must contain the current authenticated actor UUID.
- Do not accept actor IDs from request payload.
- Actor must come from current AccessContext.
- Actor must belong to the authorized branch context at mutation time.

# 16. Event Evidence
- Every successful transition must append one durable `foodflow.order_events` row.
- Event must contain tenant.
- Event must contain branch.
- Event must contain order ID.
- Event must contain event type.
- Event must contain exact from status.
- Event must contain exact to status.
- Event must contain actor ID.
- Event must contain occurred timestamp matching the transition evidence time where practical.
- Event reason should be null for ordinary normal-path progression unless current schema requires a normal reason code.
- Event insertion must be in the same transaction as the order update.
- If event insertion fails, the order transition must roll back.

# 17. Transaction Boundary
- Use `withAuthorizedAccessTransaction()` or the final R02 equivalent.
- Permission must be evaluated inside the same transaction boundary used for mutation.
- Transition repository must receive a transaction handle and trusted context.
- Do not open nested independent transactions.
- Order update and event insertion are atomic.
- Read-after-mutation result mapping occurs before commit.
- Any invariant error before completion rolls back all writes.

# 18. Authorization
- Normal lifecycle transition requires `order.manage`.
- `/staff` route-family access alone is insufficient.
- `order.view` alone is insufficient.
- Authorization must be checked server-side for each command request.
- Current tenant and branch come from AccessContext.
- Branch is required for operational lifecycle mutation.
- Tenant-wide context without an exact branch must fail closed for this mutation surface unless current product policy explicitly derives a single branch before entry.
- Cross-tenant order IDs must not authorize based on guessed UUIDs.
- Sibling-branch order IDs must not authorize.

# 19. Repository Mutation Predicate
- Every update must predicate on tenant ID.
- Every update must predicate on branch ID.
- Every update must predicate on order ID.
- Every update must predicate on exact expected source status.
- Destination is server-defined.
- Customer status is server-defined.
- Actor/timestamp is server-defined.
- Mutation should use one conditional UPDATE with RETURNING when possible.
- A no-row result is not automatically NOT_FOUND; repository/service must classify absent vs stale/illegal state safely.

# 20. Conflict Classification
- If conditional transition returns no row, query current scoped order state.
- If no scoped order exists, return NOT_FOUND semantics.
- If scoped order exists in a different state, return lifecycle conflict.
- Do not leak whether a cross-tenant/sibling-branch order exists.
- Conflict response may include safe current status if existing R02 contract already exposes it to authorized staff.
- Do not expose tenant/branch internals in error metadata.

# 21. Idempotent Repeat Semantics
- R03 normal transitions are state transitions, not generic request-idempotency records.
- Repeating `START_PREPARING` after the order is already PREPARING is stale/duplicate intent.
- Decide one deterministic contract: conflict by default.
- Do not silently return success unless product UX explicitly needs idempotent same-state acknowledgement.
- If same-state replay success is chosen, it must not create a second event or alter timestamp.
- Default specification recommendation is `409 Conflict` for already-applied transition because staff operations need stale-state visibility.
- R03 must not add a new generic idempotency table.

# 22. Concurrent Transition Race
- Two devices may transition the same order simultaneously.
- Example: two staff press START_PREPARING.
- Conditional update means only one request can change ACCEPTED -> PREPARING.
- Second request observes no matching source row and returns conflict.
- Exactly one event row is created.
- Exactly one preparing timestamp is created.
- No lost update occurs.

# 23. Competing Action Race
- Two actions can target the same stale source perception.
- Example is less common for strict graph, but READY vs another stale mutation may race.
- Database source predicate is final authority.
- Only a transition whose expected source matches committed row may succeed.
- UI optimistic state must never override server result.
- Failure must trigger read reconciliation.

# 24. Locking Policy
- Conditional UPDATE is preferred over broad SELECT FOR UPDATE when sufficient.
- If implementation needs additional row-dependent validation, use row locking deliberately.
- Avoid deadlock-prone multi-order lock sequences.
- R03 commands should mutate one order per request.
- No batch lifecycle endpoint in this round by default.
- Do not hold DB locks across external calls.

# 25. Route Handler Boundary
- Add one narrow internal lifecycle route or extend an existing exact route when coherent.
- Candidate: `POST /api/internal/orders/[id]/lifecycle`.
- Do not reuse `/decision` for post-accept lifecycle actions if that would blur contracts.
- Route validates request shape.
- Route resolves current access context using existing internal boundary.
- Route invokes lifecycle service only.
- Route performs no direct SQL.
- Route accepts no arbitrary status field.
- Route maps typed errors to stable HTTP responses.

# 26. Request Parsing
- JSON object only.
- Body size must remain bounded using existing internal request parser where available.
- Unknown fields rejected.
- `action` required.
- `action` must be one of the exact R03 action values.
- Order ID path parameter must pass UUID validation.
- No freeform status string.
- No timestamp.
- No actor.
- No tenant/branch values.

# 27. HTTP Error Mapping
- Invalid request -> `400`.
- Unauthenticated -> existing internal auth semantics.
- Forbidden -> `403`.
- Not found in current branch scope -> `404` or repository-consistent hidden resource semantics.
- Illegal/stale transition -> `409`.
- Authorization/database unavailable -> `503` or repository-consistent unavailable code.
- Invariant violation -> safe `500` with no internals.
- Do not return raw SQL messages.

# 28. CSRF / Origin Boundary
- Internal cookie-authenticated mutation must preserve existing same-origin protections.
- Reuse R02 internal mutation transport safeguards.
- Non-GET method required.
- Reject incompatible Origin when current helper supports origin enforcement.
- Do not create GET mutation shortcuts.
- Do not expose lifecycle mutation to customer capability routes.

# 29. Server/Client Authority Separation
- Browser proposes action intent only.
- Browser cannot choose target status.
- Browser cannot choose customer status.
- Browser cannot choose transition timestamp.
- Browser cannot choose actor.
- Browser cannot choose tenant or branch.
- Browser cannot bypass state source requirements.
- Browser local queue state is presentation state only.

# 30. Staff UI Integration
- Extend R01/R02 operational order workspace.
- Accepted order should expose the appropriate next action only.
- PREPARING order should expose MARK_READY.
- READY order should expose MARK_SERVED.
- SERVED order should expose no normal lifecycle mutation.
- REJECTED order should expose no normal lifecycle mutation.
- PENDING_CONFIRMATION continues to expose R02 accept/reject actions only.
- UI button visibility is convenience, not authorization.

# 31. UI Action Labels
- Use business language appropriate to operations.
- Suggested labels:
  - `Start preparing`
  - `Mark ready`
  - `Mark served`
- Avoid exposing raw status constants as button labels unless current design system intentionally uses them.
- State must remain understandable to staff.

# 32. UI Pending State
- Disable the relevant mutation button while request is pending.
- Prevent accidental local duplicate click amplification.
- Pending UI does not replace server concurrency protection.
- Keep other order cards usable when one order is transitioning if current workspace architecture supports independent state.
- Show deterministic feedback on conflict/error.

# 33. UI Reconciliation
- After successful transition, refresh/revalidate queue/detail from server authority.
- Do not mutate only local demo state.
- If workspace already has an exact refetch helper, reuse it.
- On conflict, refetch current order state.
- On unavailable error, preserve last known state but mark operation failed.
- Do not pretend the transition succeeded optimistically without server confirmation.

# 34. Operational Queue Status Filters
- R03 may need to ensure R01 queue filter supports newly operational states.
- Audit whether queue currently includes ACCEPTED/PREPARING/READY/SERVED.
- Adjust read mappings only as required so transitioned orders remain visible in correct operational views.
- Do not redesign broad filtering UX unless needed for lifecycle correctness.
- Avoid dropping an order from staff visibility due solely to incomplete R01 status mapping.

# 35. Order Detail DTO Extension
- Detail may need transition metadata.
- Candidate fields include current status, customer status, acceptedAt, preparingAt, readyAt, servedAt, modifiedByStaff.
- Only add fields needed by current staff experience or acceptance tests.
- Do not expose sensitive actor details without separate authorized user lookup requirements.
- Actor UUID may remain internal unless UI needs a display identity.

# 36. Database Migration Decision
- Audit current order schema before adding any column.
- Reuse existing timestamps if present.
- Reuse existing status constraints/enums.
- Forward-only migration only.
- Do not rewrite R02 migration.
- Do not create duplicate lifecycle table if `order_events` already captures transition history.
- Add only missing constraints/indexes/columns necessary for R03 invariants.

# 37. Timestamp Migration Option
- If `preparing_at`, `ready_at`, `served_at` already exist: no new columns.
- If missing and acceptance requires exact timestamps: add nullable timestamptz columns.
- Do not backfill fake historical times.
- Existing rows in later states must be handled truthfully; migration should not invent precise event times.
- If historical event rows contain valid timestamps, a separately justified backfill may use those only if deterministic and safe.
- Default is no speculative backfill.

# 38. Status Constraint Migration
- If existing status check excludes PREPARING/READY/SERVED, extend it forward-only.
- Preserve existing historical values.
- Do not drop safety constraint entirely to simplify mutation.
- Customer-status constraint must likewise contain required mapped values if mappings expand.
- Migration must be fresh-reset safe.

# 39. Event Type Constraint Migration
- Audit whether `order_events.event_type` is constrained.
- Add/extend allowed lifecycle event values only if needed.
- Do not replace event type with unrestricted text if current schema is constrained.
- Keep event names stable for later analytics/audit consumers.

# 40. Index Strategy
- Primary mutation by tenant + branch + order ID should already benefit from primary/tenant indexes.
- Do not add redundant index blindly.
- Add index only if actual query plan/read-plane lifecycle filters need it.
- Possible index on `(tenant_id, branch_id, status, submitted_at)` may already exist from R01.
- Implementation must inspect before migration.

# 41. RLS Preservation
- Existing staff order RLS remains independent defense in depth.
- R03 must not broaden `flow_runtime`/internal roles unnecessarily.
- Customer runtime must not gain lifecycle mutation authority.
- Public/anon/authenticated must not gain direct order UPDATE authority.
- If direct table UPDATE is already available to internal runtime, service authorization remains mandatory.
- RLS negative tests must prove sibling branch isolation.

# 42. SECURITY DEFINER Functions
- R03 does not require a SECURITY DEFINER function by default if authorized application transaction can perform safe update.
- If current grants prevent the exact mutation and a function is required, make it narrow.
- Fixed `search_path` mandatory.
- Validate current actor/tenant/branch context inside function as appropriate.
- Exact source/target transition must be hard-coded or allowlisted.
- Revoke execute from public/anon/authenticated/customer roles.
- Grant only to the required internal runtime role.

# 43. Transition Repository
- Candidate file: `src/modules/order-operations/server/order-lifecycle-repository.ts`.
- Repository is transaction-bound.
- Repository receives `TrustedOperationalOrderContext`.
- Repository exposes narrow method such as `transition(orderId, transitionSpec)`.
- Repository does not accept arbitrary tenant/branch.
- Repository does not accept arbitrary target status from caller beyond server-internal typed spec.
- Repository performs exact conditional update.
- Repository appends event in same transaction.

# 44. Transition Service
- Candidate file: `src/modules/order-operations/server/order-lifecycle-service.ts`.
- Service validates order ID/action.
- Service maps action to canonical transition spec.
- Service enters `withAuthorizedAccessTransaction()` with `order.manage`.
- Service creates trusted branch context.
- Service invokes repository.
- Service classifies no-row result.
- Service maps mutation row to immutable result DTO.
- Service converts auth failures into operational typed errors.

# 45. Lifecycle Error Taxonomy
- Add focused codes rather than generic error strings.
- Candidate codes:
  - `ORDER_LIFECYCLE_INVALID_REQUEST`
  - `ORDER_LIFECYCLE_FORBIDDEN`
  - `ORDER_LIFECYCLE_NOT_FOUND`
  - `ORDER_LIFECYCLE_CONFLICT`
  - `ORDER_LIFECYCLE_UNAVAILABLE`
  - `ORDER_LIFECYCLE_INVARIANT_VIOLATION`
- Existing R02 error class may be generalized only if names remain semantically clear.
- Avoid breaking existing decision route error behavior.

# 46. Lifecycle Result DTO
```ts
export interface OperationalOrderLifecycleResult {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly action: OperationalOrderLifecycleAction;
  readonly fromStatus: string;
  readonly status: string;
  readonly customerStatus: string | null;
  readonly transitionedAt: string;
}
```
- Exact status types should use canonical unions.
- Keep DTO JSON-safe.
- Do not return raw database Date objects.
- Do not expose hidden tenant/branch values unnecessarily.

# 47. Transition Row Validation
- Validate returned status equals expected target.
- Validate customerStatus equals transition mapping.
- Validate transition timestamp is a valid Date.
- Validate order ID/order number present.
- Invariant mismatch must fail and roll back before commit.
- Do not silently coerce unexpected database states.

# 48. Source State Truth
- UI state is not source state.
- Request body is not source state.
- Previously fetched order DTO is not source state.
- Current database row under exact branch scope is source state.
- Conditional UPDATE predicate enforces source truth at mutation time.

# 49. Served Terminal Semantics
- R03 treats SERVED as terminal for normal progression.
- Later refund/payment completion may exist independently.
- R03 must not create a reverse normal transition.
- R04/R05 may define exceptional follow-up workflows without redefining normal served history.
- Customer status mapping must not revert after served due to ordinary lifecycle commands.

# 50. Rejected Terminal Semantics
- R02 REJECTED remains terminal for normal lifecycle.
- R03 cannot transition REJECTED to PREPARING.
- R03 cannot transition REJECTED to ACCEPTED.
- Any reconsider/reopen workflow would require future explicit specification.
- No hidden recovery mutation.

# 51. Pending Confirmation Ownership
- PENDING_CONFIRMATION remains R02 decision source state.
- R03 lifecycle route must reject START_PREPARING on PENDING_CONFIRMATION.
- Staff must first accept through R02 contract.
- Do not merge accept+start preparation into one R03 command.
- This preserves decision evidence and clear responsibility.

# 52. Customer Status Consistency
- Every successful operation must leave operational status and customer status in a valid pair.
- Add application invariant checks.
- Add DB check constraint if current schema can express stable pairs without blocking future exception states.
- Avoid over-constraining future cancellation/remake if R04/R05 need additional combinations.
- Prefer service + tests when global DB pair constraint would be premature.

# 53. Event Consistency
- Event from_status must equal actual expected source.
- Event to_status must equal actual target.
- Event timestamp must not precede the stored source transition timestamp in impossible ways.
- Same successful transaction produces one event.
- Conflict produces zero events.
- Authorization failure produces zero events.
- Validation failure produces zero events.

# 54. Failure: Invalid UUID
- Reject before transaction where safe.
- No database write.
- Stable invalid-request response.
- Do not echo raw malformed value in logs if unnecessary.

# 55. Failure: Unknown Action
- Reject as invalid request.
- No transition map fallback.
- No arbitrary status parse.
- No database write.

# 56. Failure: No Authentication
- Existing internal auth boundary handles session requirement.
- No operational context created.
- No database write.
- Preserve existing login redirect/API semantics depending route context.

# 57. Failure: No Branch Context
- Fail closed.
- Tenant-wide ambiguity cannot mutate operational order lifecycle.
- No database write.
- Return safe forbidden/selection semantics according to current internal boundary.

# 58. Failure: Missing order.manage
- Fail before lifecycle callback executes.
- No update.
- No event.
- `order.view` user may still read according to R01 but cannot transition.

# 59. Failure: Cross-Tenant Selector
- No scoped row visible/mutable.
- Return not-found/forbidden according to anti-enumeration contract.
- Do not leak foreign status.
- No event.

# 60. Failure: Sibling Branch Selector
- Same behavior as inaccessible scoped resource.
- No mutation.
- No foreign status leak.
- Test explicitly.

# 61. Failure: Wrong Source State
- Conditional update returns no row.
- Scoped state lookup confirms order exists.
- Return conflict.
- No event.
- No timestamp update.
- UI refetches.

# 62. Failure: Event Insert Error
- Order update and event insert share transaction.
- Throw unavailable/invariant error.
- Roll back order state change.
- No partial transition accepted.

# 63. Failure: Database Unavailable
- Fail closed.
- Do not mutate local UI as success.
- Return unavailable.
- Allow user to retry after fresh read.
- No fabricated status.

# 64. Failure: Read-After-Write Mapping Error
- Throw invariant violation before transaction commit.
- Roll back mutation and event.
- Do not commit data that service cannot interpret safely.

# 65. Retry Semantics
- Ordinary lifecycle commands can be retried after infrastructure failure only after re-reading state.
- If original transaction committed but response was lost, retry will observe target state and default to conflict.
- UI should refetch and recognize current state.
- R03 does not need a new idempotency persistence layer.
- If later requirements demand exact replay success, that belongs to a separately specified infrastructure change.

# 66. Observability
- Log safe lifecycle action, result class, and order ID when repository logging conventions allow.
- Avoid logging auth tokens/session cookies.
- Avoid logging entire order payload.
- Avoid logging unrelated customer PII.
- Include correlation/request ID if existing infrastructure provides it.
- Authorization denial logs must not leak permission internals to client.

# 67. Audit Event vs Application Log
- `order_events` is durable business transition evidence.
- Application logs are operational diagnostics.
- Do not rely on logs as substitute for order_events.
- Do not duplicate sensitive full DTO into event reason.
- R03 does not create a separate event-sourcing platform.

# 68. Performance
- One lifecycle mutation should use bounded query count.
- Preferred shape: authorized transaction + conditional update + event insert + optional scoped-state lookup on failure.
- Avoid loading full order item aggregate merely to change lifecycle status unless validation truly needs it.
- Avoid N+1 reads.
- UI refetch after transition may reuse R01 queue/detail endpoints.

# 69. Resource Safety
- One order per transition request.
- No unbounded batch transitions.
- Bounded request body.
- Bounded error payload.
- No external call while DB transaction/lock is held.
- No sleep/poll loop inside request.

# 70. Dependencies
- No new external npm dependency should be required.
- Reuse Next.js, Kysely, existing authz helpers, existing DB runtime.
- Package changes require explicit justification.
- Avoid dependency churn.

# 71. Environment Variables
- No new environment variable expected.
- No new secret expected.
- Do not add transition-specific feature flags by default.
- If implementation uncovers a real operational rollout requirement, document separately rather than hard-code secret toggles.

# 72. CREATE — Candidate Files
- `apps/web/next-flow/src/modules/order-operations/server/order-lifecycle-repository.ts`
- `apps/web/next-flow/src/modules/order-operations/server/order-lifecycle-service.ts`
- `apps/web/next-flow/src/app/api/internal/orders/[id]/lifecycle/route.ts`
- `apps/web/next-flow/tests/unit/operational-order-lifecycle.test.ts`
- `apps/web/next-flow/tests/integration/operational-order-lifecycle.test.ts`
- `supabase/tests/database/p04_r03_order_lifecycle_boundary.test.sql`
- migration only when actual schema audit identifies required changes.
- Exact filenames may consolidate into existing module files when that reduces duplication.

# 73. MODIFY — Candidate Files
- `apps/web/next-flow/src/modules/order-operations/server/types.ts`
- `apps/web/next-flow/src/modules/order-operations/server/errors.ts`
- `apps/web/next-flow/src/modules/order-operations/server/http.ts`
- `apps/web/next-flow/src/modules/order-operations/server/index.ts`
- `apps/web/next-flow/src/features/staff/operational-orders-workspace.tsx`
- R01 repository/service only if read DTO requires lifecycle metadata.
- `package.json` only for test discovery if repository convention requires it.

# 74. MOVE
- No file move expected.
- Do not rename R02 decision files merely for aesthetic consistency.
- Avoid refactor churn.

# 75. REMOVE
- No runtime file removal expected.
- Do not remove R02 `/decision` route.
- Do not remove accepted/rejected event semantics.
- Do not remove R01 server-backed queue path.

# 76. DO NOT TOUCH — Scope Guard
- Customer capability/auth modules.
- Customer order submission command path except regression fixes strictly required by lifecycle integration.
- Payment provider code.
- Kitchen station routing redesign.
- Realtime broker/websocket infrastructure.
- Notification delivery infrastructure.
- Broad design-system refactors.
- Voice ordering.
- Unrelated menu/catalog architecture.

# 77. Transition Permission Matrix
| Actor/context | Read order | Accept/reject R02 | Lifecycle R03 |
|---|---:|---:|---:|
| staff with `order.view` only | YES | NO | NO |
| staff with `order.manage` in branch | YES | YES | YES |
| staff with `order.manage` sibling branch | foreign order NO | foreign order NO | foreign order NO |
| customer capability | customer allowed surfaces only | NO | NO |
| unauthenticated | NO internal read | NO | NO |
| revoked membership | NO current authority | NO | NO |

# 78. Lifecycle Transition Matrix — Expected
| Current | Action | Result | Customer status | R03 legal? |
|---|---|---|---|---:|
| PENDING_CONFIRMATION | START_PREPARING | none | unchanged | NO |
| ACCEPTED | START_PREPARING | PREPARING | mapped preparing state | YES |
| ACCEPTED | MARK_READY | none | unchanged | NO |
| ACCEPTED | MARK_SERVED | none | unchanged | NO |
| PREPARING | START_PREPARING | none | unchanged | NO/replay conflict |
| PREPARING | MARK_READY | READY | mapped ready state | YES |
| PREPARING | MARK_SERVED | none | unchanged | NO |
| READY | START_PREPARING | none | unchanged | NO |
| READY | MARK_READY | none | unchanged | NO/replay conflict |
| READY | MARK_SERVED | SERVED | mapped served state | YES |
| SERVED | any R03 action | none | unchanged | NO |
| REJECTED | any R03 action | none | unchanged | NO |

# 79. Event Matrix
| Action | Event | from | to |
|---|---|---|---|
| START_PREPARING | canonical preparing event | ACCEPTED | PREPARING |
| MARK_READY | canonical ready event | PREPARING | READY |
| MARK_SERVED | canonical served event | READY | SERVED |
- Exact event strings must match schema vocabulary.

# 80. Timestamp Matrix
| Target | Evidence |
|---|---|
| PREPARING | preparing timestamp if canonical schema uses one |
| READY | ready timestamp if canonical schema uses one |
| SERVED | served timestamp if canonical schema uses one |
- `accepted_at` remains R02 evidence and must not be rewritten.
- `rejected_at` remains R02 evidence and must not coexist with normal progression for a rejected order.

# 81. Unit Tests — Action Parsing
- accepts exact START_PREPARING.
- accepts exact MARK_READY.
- accepts exact MARK_SERVED.
- rejects unknown action.
- rejects missing action.
- rejects extra authority fields.
- rejects invalid UUID.
- parser produces frozen/readonly command where convention uses immutability.

# 82. Unit Tests — Transition Map
- every R03 action has exactly one transition spec.
- no duplicate source/target ambiguity.
- from/to are correct.
- customer mapping exists or deliberately remains unchanged.
- event type exists.
- transition map is exhaustive at compile time where possible.

# 83. Unit Tests — Result Mapping
- accepted valid PREPARING row maps correctly.
- valid READY row maps correctly.
- valid SERVED row maps correctly.
- invalid timestamp fails invariant.
- wrong target status fails invariant.
- wrong customer status fails invariant when mapping is strict.

# 84. Integration Tests — Happy Path
- create/fixture order in PENDING_CONFIRMATION.
- R02 accept it.
- R03 START_PREPARING succeeds.
- R03 MARK_READY succeeds.
- R03 MARK_SERVED succeeds.
- final order = SERVED.
- customer status mapping is correct at each step.
- one event per transition.
- actor/timestamps recorded.

# 85. Integration Tests — Illegal Skips
- ACCEPTED -> MARK_READY conflict.
- ACCEPTED -> MARK_SERVED conflict.
- PREPARING -> MARK_SERVED conflict.
- READY -> START_PREPARING conflict.
- SERVED -> any action conflict.
- REJECTED -> any action conflict.

# 86. Integration Tests — Permission
- `order.view` without manage cannot transition.
- correct branch manager can transition.
- sibling branch manager cannot transition foreign order.
- revoked membership loses authority immediately.
- suspended actor denied according to inherited auth semantics.

# 87. Integration Tests — Concurrency
- two START_PREPARING requests against ACCEPTED.
- exactly one success.
- exactly one conflict.
- exactly one PREPARING event.
- preparing timestamp stable.
- no duplicate transition evidence.

# 88. Integration Tests — Atomic Rollback
- inject/fake event insert failure through test-safe seam or DB condition.
- order status remains source state.
- no timestamp mutation committed.
- no partial event.
- response reports failure.

# 89. Integration Tests — Scope Leakage
- tenant A actor cannot transition tenant B order.
- branch A1 actor cannot transition branch A2 order.
- no foreign current status in conflict body.
- no cross-tenant event insertion.

# 90. Database Tests — Grants
- public cannot mutate lifecycle columns.
- anon cannot mutate lifecycle columns.
- authenticated generic role cannot mutate directly if architecture denies it.
- customer runtime cannot mutate operational lifecycle.
- internal intended runtime has only required privileges.
- function execute grants verified if function approach used.

# 91. Database Tests — Status Constraints
- canonical legal states accepted.
- invalid status rejected.
- existing historical states preserved.
- target customer states accepted if mapping expands constraint.
- invalid customer status rejected.

# 92. Database Tests — Event Constraints
- R03 event types accepted.
- invalid event type rejected if constrained.
- tenant/branch/order foreign-key consistency enforced according to schema.
- event actor reference behavior preserved.

# 93. Database Tests — RLS
- branch context sees/mutates only its rows.
- sibling branch denied.
- tenant isolation denied.
- customer capability cannot gain staff lifecycle authority.
- no context leakage after transaction ends.

# 94. E2E — Staff Lifecycle
- sign in as authorized staff.
- select proper workspace.
- accepted order appears.
- Start preparing succeeds.
- queue/detail update to preparing.
- Mark ready succeeds.
- Mark served succeeds.
- terminal state has no next normal action.

# 95. E2E — View-Only Staff
- order visible when permission model allows `order.view`.
- mutation buttons absent/disabled as UI convenience.
- direct lifecycle endpoint invocation still returns forbidden.
- proves UI hiding is not authority.

# 96. E2E — Stale Device
- Device/session A reads ACCEPTED.
- Device/session B starts preparation.
- A attempts stale START_PREPARING.
- A receives conflict.
- A refreshes to PREPARING.
- no second event.

# 97. Regression — R01
- queue remains server-backed.
- detail remains branch-scoped.
- `order.view` reads preserved.
- no return to demo state authority.

# 98. Regression — R02
- PENDING_CONFIRMATION accept still works.
- PENDING_CONFIRMATION reject still works.
- accepted decision evidence remains unchanged.
- rejected decision evidence remains unchanged.
- R03 does not bypass decision route.

# 99. Regression — Phase 02 Security
- Auth.js identity remains authority.
- AccessContext remains current branch authority.
- `order.manage` remains DB-backed permission.
- revocation freshness remains intact.
- RLS remains defense in depth.

# 100. Validation Commands — Repository Local
- Use only commands that exist on latest branch.
- Expected application families include lint/typecheck/tests/build.
- Expected DB families include fresh/reset, pgTAP, DB lint, generated-type drift when schema changes.
- Actual implementation PR must record outcomes truthfully.
- `NOT RUN` is not PASS.

# 101. Suggested Application Validation
```bash
cd apps/web/next-flow
npm ci
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run build:next
```
- Adapt only to actual package scripts.
- Do not invent command names.

# 102. Suggested Database Validation
```bash
supabase db reset
# repository-standard database test command
# repository-standard database lint command
npm run db:verify-types
```
- Run if database/schema scope applies.
- Record actual result.
- Never claim document validation based on these future commands.

# 103. Validation Result Vocabulary
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- No other ambiguous terms for required validation results.

# 104. Security Acceptance
- no client authority over target status.
- no client authority over actor.
- no client authority over branch.
- `order.manage` checked server-side.
- tenant/branch predicates enforced.
- RLS/grants remain least privilege.
- direct endpoint bypass denied without permission.
- customer capability cannot call internal lifecycle authority.
- raw SQL errors never exposed.

# 105. Failure Acceptance
- validation failure has no writes.
- auth failure has no writes.
- permission failure has no writes.
- wrong branch has no writes.
- stale state has no writes.
- event insertion failure rolls back order update.
- database unavailable fails closed.
- invariant mismatch rolls back.

# 106. Concurrency Acceptance
- exact source predicate is final race boundary.
- concurrent duplicate actions create one transition only.
- no duplicate event.
- no duplicate timestamp mutation.
- stale client receives conflict.
- UI reconciles with current server state.

# 107. Migration Safety
- forward-only.
- no historical migration rewrite.
- no destructive production operation.
- nullable additions where needed.
- no fake timestamp backfill.
- constraints extended carefully.
- fresh reset passes.
- generated DB types updated when required.

# 108. Deployment Compatibility
- Migration must be backward-compatible with R02 code during rolling deployment where feasible.
- Nullable timestamp additions are safe before new code.
- Constraint extension must not break old R02 writes.
- New route can deploy after schema support.
- Avoid requiring simultaneous destructive cutover.

# 109. No External Side Effects
- R03 does not publish realtime events.
- R03 does not send notifications.
- R03 does not trigger payment operations.
- R03 does not create kitchen tickets if that is a separate phase responsibility.
- Database `order_events` are internal durable evidence, not an external side effect.
- No external call inside lifecycle transaction.

# 110. Kitchen Boundary
- PREPARING/READY are operational states needed by later kitchen surfaces.
- R03 defines state authority, not station routing.
- Do not add station-specific assignment logic.
- Do not redesign KDS.
- Do not add kitchen websocket subscriptions.

# 111. Payment Boundary
- SERVED does not imply paid unless product schema explicitly equates them, which this round must not assume.
- Do not mutate merchant payment status.
- Do not collect payment.
- Do not void/refund payment.
- Keep order lifecycle and payment lifecycle separate.

# 112. R04 Boundary — Edit / Cancel Exceptions
- R04 may introduce controlled order cancellation.
- R04 may introduce post-submit edit exceptions if product requirements allow.
- R04 may define which lifecycle states permit each exception.
- R03 must provide reusable transition infrastructure that R04 can extend safely.
- R03 must not invent cancellation/reopen edges now.

# 113. R05 Boundary — Priority / Delay / Remake
- R05 may add priority markers.
- R05 may add delay reasons/estimates.
- R05 may add remake/rework operational paths.
- R05 may add escalation metadata.
- R03 must not add those fields speculatively.

# 114. R06 Boundary — Acceptance
- R06 proves queue + decision + lifecycle + exceptions + operational controls end to end.
- R03 must supply durable lifecycle tests/evidence for R06 inheritance.
- R03 does not write Phase 04 final acceptance record unless exact future R06 spec says so.

# 115. Implementation Order — Step 1
- Re-read current main policy/spec.
- Verify exact R03 spec READY.
- Verify latest implementation parent is `p04-r02-order-decision` or newer legitimate R02 tip.
- Compare branch to R01/main as needed.
- Audit actual status/customer-status/event/timestamp schema.

# 116. Implementation Order — Step 2
- Define canonical lifecycle state/action types.
- Define transition map.
- Define customer status mapping.
- Define error/result DTO contracts.
- Unit test pure mapping/validation first.

# 117. Implementation Order — Step 3
- Add forward migration only if schema audit proves required.
- Extend timestamps/constraints/event vocabulary narrowly.
- Update generated DB types.
- Add pgTAP/grant/RLS tests.

# 118. Implementation Order — Step 4
- Implement transaction-bound lifecycle repository.
- Exact source-status predicates.
- Same-transaction event insertion.
- Scoped state lookup for failure classification.

# 119. Implementation Order — Step 5
- Implement lifecycle service under `order.manage` authorization.
- Validate action/order ID.
- Map auth errors.
- Validate returned row invariants.

# 120. Implementation Order — Step 6
- Implement narrow internal route.
- Reuse HTTP parsing/origin/error utilities.
- No route-local SQL.
- No arbitrary status body.

# 121. Implementation Order — Step 7
- Integrate staff workspace actions.
- Add pending/conflict/unavailable UI handling.
- Refetch server queue/detail after result.
- Preserve R02 accept/reject UX.

# 122. Implementation Order — Step 8
- Run unit/integration/DB/E2E/regression validation.
- Inspect final branch diff for R04/R05 scope leakage.
- Open one implementation PR.
- Record actual validation outcomes.
- Stop without merge.

# 123. Definition of Done — Domain
- lifecycle action union exists.
- canonical transition map exists.
- legal normal path encoded.
- illegal skips/reversals rejected.
- customer-status mapping explicit.
- served terminal semantics explicit.

# 124. Definition of Done — Persistence
- exact scoped conditional updates implemented.
- actor/timestamps persisted as required.
- one durable event per successful transition.
- event and update atomic.
- no event on conflict/failure.
- schema constraints support legal states.

# 125. Definition of Done — Authorization
- `order.manage` required.
- branch context required.
- cross-tenant denied.
- sibling branch denied.
- view-only denied.
- customer authority denied.
- revoked access denied.

# 126. Definition of Done — Transport
- narrow route exists.
- strict body parsing.
- action allowlist.
- unknown fields rejected.
- stable safe HTTP errors.
- same-origin safeguards preserved.

# 127. Definition of Done — UI
- next legal action visible for relevant state.
- stale conflicts handled.
- pending state handled.
- success refetches server authority.
- terminal state has no normal action.
- R02 decision workflow remains intact.

# 128. Definition of Done — Tests
- pure mapping tests pass.
- integration happy path passes.
- illegal transition matrix tested.
- authorization matrix tested.
- concurrency duplicate test passes.
- atomic rollback tested.
- DB grants/RLS/constraints tested.
- inherited R01/R02 regressions pass.

# 129. PR Requirements
- Reference `FLOW_P04_R03_IMPLEMENTATION_SPEC.md` from main.
- Record implementation parent branch and SHA.
- Record implementation head SHA.
- Explain lifecycle state vocabulary used.
- Explain customer status mapping.
- Explain any migration and generated-type impact.
- Record unit/integration/DB/E2E outcomes truthfully.
- Record known limitations/deferred R04/R05 scope.
- No secrets.
- No implementation auto-merge.

# 130. Required Scope Declaration
```text
IMPLEMENTATION_PHASE=P04
IMPLEMENTATION_ROUND=R03
ORDER_LIFECYCLE_ENGINE_IMPLEMENTED: YES
START_PREPARING_IMPLEMENTED: YES
MARK_READY_IMPLEMENTED: YES
MARK_SERVED_IMPLEMENTED: YES
ORDER_MANAGE_AUTHORIZATION: YES
LIFECYCLE_EVENT_EVIDENCE: YES
LIFECYCLE_CONCURRENCY_PROTECTION: YES
ORDER_EXCEPTION_EDIT_CANCEL_IMPLEMENTED: NO
PRIORITY_DELAY_REMAKE_IMPLEMENTED: NO
PAYMENT_EXECUTION_CHANGED: NO
KITCHEN_ROUTING_REDESIGNED: NO
REALTIME_PUBLICATION_IMPLEMENTED: NO
NOTIFICATION_DELIVERY_IMPLEMENTED: NO
IMPLEMENTATION_AGENT_MERGE: NO
```

# 131. PR Evidence — State Matrix
- List exact source/target states.
- List exact customer mapping.
- List event names.
- List timestamp columns used.
- List terminal-state behavior.
- List conflict behavior.

# 132. PR Evidence — Security
- exact permission code.
- branch scope behavior.
- cross-tenant negative result.
- sibling-branch negative result.
- customer/internal boundary result.
- RLS/grant result.

# 133. PR Evidence — Concurrency
- duplicate same-action race result.
- exactly-one event evidence.
- stale conflict response.
- no partial writes.
- no last-write-wins bypass.

# 134. PR Evidence — Migration
- migration filename if any.
- additions only / forward-safe description.
- fresh reset result.
- pgTAP result.
- DB lint result.
- generated type drift result.

# 135. No-Scope-Churn Rule
- Do not rename broad module trees.
- Do not consolidate R01/R02 files solely for style.
- Do not redesign all order APIs.
- Do not replace Kysely.
- Do not add event broker.
- Do not refactor unrelated staff screens.
- Do not modernize unrelated dependencies.

# 136. Security Invariant — Authentication vs Authorization
- Auth.js proves actor identity.
- AccessContext proves current workspace scope.
- `order.manage` proves capability.
- lifecycle service proves legal domain transition.
- RLS proves database isolation defense.
- These layers remain distinct.

# 137. Security Invariant — Route Visibility
- Seeing lifecycle button does not grant authority.
- Being able to POST the route does not grant authority without server checks.
- Staff route access does not imply `order.manage`.
- Every mutation path must independently enforce permission.

# 138. Security Invariant — No Mass Assignment
- Request body cannot contain status.
- Request body cannot contain customerStatus.
- Request body cannot contain actorId.
- Request body cannot contain branchId.
- Request body cannot contain tenantId.
- Request body cannot contain timestamps.
- Unknown fields are rejected.

# 139. Security Invariant — Event Integrity
- Event actor is server-derived.
- Event from/to is transition-map-derived.
- Event timestamp is DB/server-derived.
- Event tenant/branch comes from trusted context.
- Event cannot be supplied by client.

# 140. Database Invariant — Branch Ownership
- Update predicate contains tenant + branch + order.
- Event row contains same tenant + branch + order.
- Foreign branch cannot update even with guessed order ID.
- RLS reinforces the predicate.

# 141. Database Invariant — Source Predicate
- Every transition requires exact current source status.
- No unconditional status UPDATE.
- No `WHERE id = ?` alone.
- No arbitrary target update method exposed by repository.

# 142. Database Invariant — Historical Timestamps
- accepted_at is immutable under R03.
- rejected_at is untouched by normal lifecycle.
- preparing/ready/served timestamps are write-once in normal path.
- later transition must not rewrite earlier transition timestamps.

# 143. Domain Invariant — One Normal Path
- Accepted normal order moves forward only.
- Each normal edge is explicit.
- Skipping requires a future explicit exception, not implicit fallback.
- Reverse movement requires future explicit specification.

# 144. Domain Invariant — Rejection
- REJECTED never enters normal path.
- rejection reason remains retained.
- rejection evidence remains retained.
- no lifecycle event overwrites rejection history.

# 145. Domain Invariant — Served
- SERVED has no next normal R03 action.
- Served order remains visible according to queue/history policy.
- Payment state remains independent.
- Future after-service operations require explicit scope.

# 146. UI Invariant — Source of Truth
- Server response and subsequent read are authoritative.
- Local React state cannot force a status transition.
- Demo store must not regain order authority.
- Conflict leads to refetch.

# 147. UI Invariant — Button Matrix
- PENDING_CONFIRMATION: R02 decision actions.
- ACCEPTED: start preparing.
- PREPARING: mark ready.
- READY: mark served.
- SERVED: no normal action.
- REJECTED: no normal action.
- Future exception actions are absent until their rounds.

# 148. Error Contract — Conflict
```json
{
  "ok": false,
  "error": {
    "code": "ORDER_LIFECYCLE_CONFLICT"
  }
}
```
- Exact envelope should follow current R02 internal HTTP convention.
- May include safe current state if current convention supports it.
- No raw database error.

# 149. Error Contract — Unavailable
- Distinguish temporary authorization/database inability from forbidden when current helpers can.
- Fail closed.
- UI presents retry option.
- Do not silently perform local state change.

# 150. Error Contract — Invariant Violation
- Client receives generic safe server failure.
- Server diagnostics may record safe context.
- Transaction rolls back.
- Treat as defect requiring investigation.

# 151. Test Fixture Requirements
- fixture pending order.
- fixture accepted order.
- fixture preparing order.
- fixture ready order.
- fixture served order.
- fixture rejected order.
- manager with order.manage.
- view-only actor.
- sibling branch actor.
- revoked actor/membership fixture where available.
- keep fixtures deterministic.

# 152. Test Data Isolation
- Every test uses explicit tenant/branch IDs.
- Do not rely on execution order.
- Clean/reset through existing test harness.
- Concurrent tests use distinct orders except the intentional race case.
- Event count assertions scope by order ID.

# 153. Concurrency Test Mechanics
- Start from ACCEPTED.
- Fire two authorized lifecycle service calls concurrently.
- Avoid mocking away database predicate.
- Await both with `Promise.allSettled()` or test equivalent.
- Assert one fulfilled, one conflict.
- Assert database final state PREPARING.
- Assert exactly one preparing event.

# 154. Rollback Test Mechanics
- Prefer test transaction/fixture that forces event insert violation after order update.
- If difficult, isolate repository with controlled failing event writer only if real integration still verifies DB transaction semantics elsewhere.
- Assert source status remains unchanged after failure.
- Do not claim rollback based only on unit mock.

# 155. Permission Test Mechanics
- Use actual authorized transaction path.
- Avoid directly invoking repository as proof of permission denial.
- Repository tests and service authorization tests serve different purposes.
- Include direct route invocation with insufficient permission.

# 156. Read-After-Write Acceptance
- After transition, R01 queue returns target status.
- R01 detail returns target status.
- Customer status surface reflects mapped customer state where exposed.
- No stale demo state overrides server read.

# 157. Operational Timing
- Wait-time display should continue deriving from canonical timestamps.
- R03 does not redesign SLA calculations.
- If queue grouping depends on status, ensure new states map to correct operational section.
- Avoid adding business SLA policy absent product spec.

# 158. Accessibility
- Mutation buttons have clear labels.
- Pending state communicated to assistive technology where existing component conventions support it.
- Error messages accessible.
- Do not rely on color alone for lifecycle state.
- Preserve keyboard interaction.

# 159. Responsive UI
- Maintain existing staff workspace responsive behavior.
- Lifecycle controls must remain usable on tablet/mobile staff views.
- No broad UI redesign required.
- Avoid modal complexity unless current design already uses it.

# 160. Internationalization / Copy
- Use current application language conventions.
- No need to introduce full i18n framework.
- Lifecycle copy should be business-readable.
- Avoid programmer-centric error text in user-facing UI.

# 161. Logging Redaction
- Do not log session cookies.
- Do not log Authorization headers.
- Do not log full customer notes/order payload by default.
- Safe: order ID, action, actor ID when internal logging policy allows, result class.
- Never include secrets in PR evidence.

# 162. Backward Compatibility
- R02 decision endpoint continues working.
- Old clients that only read queue remain unaffected.
- New lifecycle route adds behavior without replacing reads.
- Migration must not invalidate existing pending/accepted/rejected orders.
- Existing accepted rows become eligible for START_PREPARING according to source predicate.

# 163. Rolling Deployment
- Deploy additive migration first when needed.
- Existing R02 code continues to write accepted/rejected states.
- New R03 code can then use additional columns/states/events.
- Avoid DB constraint rollout that rejects existing code's valid writes.
- No destructive cutover.

# 164. Historical Data
- Do not invent preparing/ready/served times for old rows unless deterministic historical events already establish them and a justified backfill is needed.
- Null historical timestamps are acceptable when history predates feature.
- UI must tolerate null optional historical metadata.

# 165. Failure Recovery — Conflict
- Tell UI operation is stale/conflicted.
- Re-fetch queue/detail.
- Display current state.
- User can choose the currently valid next action.
- Do not automatically chain another lifecycle action after conflict.

# 166. Failure Recovery — Temporary Unavailable
- Keep UI state unchanged.
- Show retryable failure.
- On retry, refetch first or ensure service source predicate still protects correctness.
- No client-side forced completion.

# 167. Failure Recovery — Unauthorized
- Do not retry mutation automatically.
- Re-resolve workspace/session if product flow supports it.
- Remove privileged controls after refreshed permission state.
- Server remains authority even if stale UI shows button.

# 168. Future R04 Extension Contract
- Lifecycle transition infrastructure should expose internal typed primitives reusable by exception workflows.
- R04 may need cancellation from PENDING_CONFIRMATION/ACCEPTED/PREPARING depending product policy.
- R04 may need edited-order audit evidence.
- R03 must not hard-code abstraction so narrowly that exception service must bypass all event/authorization infrastructure.
- But do not create generic arbitrary graph engine solely for hypothetical future complexity.

# 169. Avoid Over-Engineering
- A typed transition map plus service/repository is sufficient.
- No workflow DSL.
- No external state-machine package.
- No event-sourcing rewrite.
- No CQRS split.
- No microservice extraction.
- No distributed lock.

# 170. Exact Abstraction Balance
- Centralize legal normal edges.
- Centralize result/error mapping.
- Keep repository transaction-bound.
- Keep authorization in service boundary.
- Keep route thin.
- Keep UI state presentation-only.
- Do not hide all domain semantics behind overly generic string APIs.

# 171. Current Code Assumptions to Revalidate
- `foodflow.orders.status` contains/permits needed operational states.
- `foodflow.order_events` remains available.
- R02 decision files remain at observed paths.
- `PERMISSIONS.orderManage` remains canonical permission.
- `withAuthorizedAccessTransaction` remains current helper.
- staff workspace remains server-backed.
- If any assumption changed, adapt without duplicating authority.

# 172. Implementation Stop Conditions
- Exact R03 spec missing from current main.
- Spec no longer READY.
- Latest implementation parent differs and must be re-audited.
- Actual schema cannot represent required lifecycle without a destructive migration.
- Product authority contradicts normal transition matrix.
- Required customer status vocabulary is undefined and cannot be safely mapped.
- Implementation would require broadening customer/staff authority.
- Required inherited validation is failed/unresolved where spec requires pass.
- In these cases stop and report exact blocker rather than improvise.

# 173. Document Validation Checklist
- [x] canonical filename P04/R03.
- [x] Phase = 04.
- [x] Round = 03.
- [x] Status = READY.
- [x] Previous = P04/R02.
- [x] Next = P04/R04.
- [x] current main is authority.
- [x] implementation parent references latest R02 branch.
- [x] actual R02 head recorded.
- [x] lifecycle states explicit.
- [x] transition matrix explicit.
- [x] authorization explicit.
- [x] actor/timestamp/event evidence explicit.
- [x] failure/concurrency/rollback explicit.
- [x] DB migration safety explicit.
- [x] tests explicit.
- [x] R04/R05/R06 boundaries explicit.
- [x] implementation merge owner-controlled.

# 174. Document Internal Consistency
- R02 owns initial decision.
- R03 owns normal post-accept lifecycle.
- R04 owns exceptional edit/cancel.
- R05 owns priority/delay/remake.
- R06 owns acceptance.
- No section authorizes arbitrary browser status mutation.
- No section authorizes payment execution.
- No section authorizes kitchen-routing redesign.
- No section authorizes implementation merge by documentation task.

# 175. Document-Only Validation Policy
- Document validation covers metadata, sequence, code assumptions, architecture, security, DB/migration safety, failure/recovery, concurrency, tests, Definition of Done, and handoff.
- GitHub Actions are not document-validation authority.
- Failed/queued/skipped/missing Actions do not semantically invalidate this document.
- Hosted merge enforcement may technically block the docs PR; report as hosted merge restriction if so.
- Documentation task must not alter runtime/CI to force merge.

# 176. Implementation Validation Policy
- Future R03 implementation must run actual applicable repository checks.
- This source inspection is not runtime proof.
- Do not fabricate PASS.
- Required implementation failures remain blockers for implementation readiness.
- Implementation PR remains owner-controlled.

# 177. Schema Audit Checklist — Order Status
- Read the actual order-status constraint or generated type on the latest R02 parent before coding.
- Confirm `ACCEPTED` is currently valid because R02 writes it.
- Confirm whether `PREPARING` already exists.
- Confirm whether `READY` already exists.
- Confirm whether `SERVED` already exists.
- Confirm whether `CANCELLED`, `REMAKING`, or other exception states already exist but remain out of R03 scope.
- Record exact storage vocabulary in the implementation PR.
- If expected R03 states are absent, add only the narrow forward migration required.

# 178. Schema Audit Checklist — Customer Status
- Read the actual customer-status domain/constraint.
- Record current value written by R02 acceptance: `CONFIRMED`.
- Determine exact supported preparation-visible value.
- Determine exact supported ready-visible value.
- Determine exact supported served/completed value.
- Do not add synonyms when an existing canonical value is available.
- If customer status intentionally remains `CONFIRMED` through multiple internal states, document that explicit coarse mapping.
- The implementation PR must record the final mapping table.

# 179. Schema Audit Checklist — Timestamps
- Inspect whether `accepted_at`, `rejected_at`, `preparing_at`, `ready_at`, and `served_at` exist.
- Verify timestamp types are timestamptz or repository-standard equivalent.
- Verify R02 acceptance/rejection fields are not overwritten by later lifecycle writes.
- Determine whether event timestamp alone is sufficient for any target state.
- Add a column only when current operational read/acceptance requirements need direct timestamp evidence.
- Keep additions nullable for rolling deployment safety.

# 180. Schema Audit Checklist — order_events
- Inspect event type storage and constraints.
- Confirm existing R02 event rows use canonical naming.
- Determine whether R03 events can use current constraint unchanged.
- Verify event actor column references correct user identity table/type.
- Verify branch and tenant columns are present.
- Verify event insertion is allowed through current internal transaction role.
- Do not widen event grants to customer/public roles.

# 181. Lifecycle Mapping Decision Record
- Implementation PR must include a compact mapping table.
- For each action record `from`, `to`, `customer_status`, `event_type`, and timestamp evidence.
- This mapping becomes handoff evidence for R04 and R06.
- Any deviation from the conceptual matrix in this spec must explain the actual canonical schema reason.
- Do not silently choose a different transition graph.

# 182. Repository Contract — transition()
```ts
transition(
  orderId: string,
  spec: OperationalLifecycleTransitionSpec,
): Promise<OperationalOrderLifecycleMutationRow | null>
```
- `spec` is server-internal and sourced from the exhaustive transition map.
- The public route never constructs arbitrary specs.
- The repository validates no client authority.
- The repository owns exact scoped update and event append.
- The repository does not commit independently.

# 183. Repository Contract — findScopedState()
- Reuse or generalize the R02 scoped-state helper if it avoids duplicate query logic.
- It must remain tenant/branch scoped.
- It may return current operational status needed to classify conflict.
- It must not return foreign-resource existence.
- It must not expose full order/customer payload for error classification.

# 184. Repository Contract — Event Append
- Prefer one private repository helper shared by normal transitions.
- Inputs are typed event contract, not arbitrary strings from route.
- The helper uses trusted context for tenant/branch/actor.
- `from_status` and `to_status` come from transition spec.
- `occurred_at` uses the same authoritative transition time.
- Event failure throws and rolls back the update.

# 185. Service Contract — executeLifecycleTransition()
- One internal executor should compose authorization, mapping, transaction, repository call, conflict classification, and result validation.
- Convenience exported commands may wrap it.
- Suggested exports: `startPreparingOperationalOrder`, `markOperationalOrderReady`, `markOperationalOrderServed`.
- Avoid three separately implemented authorization/transaction flows.
- Avoid route handlers importing repository directly.

# 186. Service Contract — Trusted Context
- Reuse the R02 trusted operational context shape if it already contains actorId, tenantId, branchId.
- Do not create a second equivalent trusted-context type under a new name.
- BranchId remains non-null at this layer.
- If R02 type is too decision-specific, rename/generalize only if the refactor is focused and non-breaking.

# 187. Type Contract — Operational Status
- Prefer a typed union derived from current domain values.
- R03 does not need to expose every future exception state as a legal action target.
- Read DTO may include broader status union.
- Transition spec target union should remain only normal R03 targets.
- Compile-time exhaustiveness is preferred over stringly typed switches.

# 188. Type Contract — Customer Status
- Use a typed union where generated/domain types already provide one.
- Transition mapping must not cast arbitrary strings merely to satisfy TypeScript.
- If generated DB types are too broad strings, add narrow domain validation at service boundary.
- Invariant checks protect against schema/application drift.

# 189. Transport Contract — Success
```json
{
  "ok": true,
  "data": {
    "orderId": "uuid",
    "orderNumber": "...",
    "action": "START_PREPARING",
    "fromStatus": "ACCEPTED",
    "status": "PREPARING",
    "customerStatus": "...",
    "transitionedAt": "ISO-8601"
  }
}
```
- Match current internal envelope conventions exactly.
- Do not include tenant/branch authority fields in response unless an existing DTO requires them.
- Do not expose actor permission internals.

# 190. Transport Contract — Conflict Classification
- Conflict means current scoped state does not match the action's required source state.
- The response code remains stable.
- Safe current status may be included only if existing internal APIs already use it and it helps reconciliation.
- Do not include foreign state on inaccessible resources.
- UI must treat conflict as stale-data signal.

# 191. Transport Contract — Body Size
- Reuse current R02 bounded body helper if one exists.
- Lifecycle payload is tiny and should have a strict maximum.
- Oversized body fails before service mutation.
- Malformed JSON fails safely.
- Empty object fails validation.
- Arrays/null are rejected.

# 192. Customer-Status Mapping Acceptance Matrix
- ACCEPTED retains the R02 customer state.
- START_PREPARING produces the exact mapped preparation/customer state.
- MARK_READY produces the exact mapped ready/customer state.
- MARK_SERVED produces the exact mapped served/completed customer state.
- Illegal actions leave customer status unchanged.
- Rollback leaves customer status unchanged.
- Concurrent loser leaves customer status equal to winner's committed result after refetch.

# 193. Timestamp Acceptance Matrix
- START_PREPARING writes exactly one authoritative preparation timestamp when direct column exists.
- MARK_READY writes exactly one authoritative ready timestamp when direct column exists.
- MARK_SERVED writes exactly one authoritative served timestamp when direct column exists.
- Later transitions do not overwrite earlier timestamps.
- Conflict does not rewrite timestamps.
- Duplicate stale request does not rewrite timestamp.
- Rollback removes attempted timestamp update.

# 194. Event Acceptance Matrix
- START_PREPARING produces exactly one preparing event.
- MARK_READY produces exactly one ready event.
- MARK_SERVED produces exactly one served event.
- Invalid request produces zero events.
- Forbidden request produces zero events.
- Cross-scope request produces zero events.
- Wrong-source conflict produces zero events.
- Event insert failure produces zero committed state transition and zero committed event.

# 195. Concurrency Matrix — Same Action
| Initial | Request A | Request B | Expected |
|---|---|---|---|
| ACCEPTED | START_PREPARING | START_PREPARING | one PREPARING success, one conflict |
| PREPARING | MARK_READY | MARK_READY | one READY success, one conflict |
| READY | MARK_SERVED | MARK_SERVED | one SERVED success, one conflict |
- Exactly one event for each successful state change.
- Exactly one authoritative transition timestamp.

# 196. Concurrency Matrix — Sequential Stale Actions
| Initial view | Other actor commits | Stale action | Expected |
|---|---|---|---|
| ACCEPTED | PREPARING | START_PREPARING | conflict + refetch |
| PREPARING | READY | MARK_READY | conflict + refetch |
| READY | SERVED | MARK_SERVED | conflict + refetch |
| ACCEPTED | PREPARING | MARK_READY using stale UI that had not seen change | allowed only if server source is PREPARING at execution and action is MARK_READY; UI freshness is not authority |
- This last case demonstrates that legal current database state, not stale display origin, controls validity.

# 197. Cross-Branch Security Matrix
- Same order UUID with wrong branch context cannot mutate.
- A guessed foreign UUID cannot reveal its lifecycle status.
- A manager in A1 cannot use A2 branch selector in body because branch selector is not accepted.
- Switching workspace to A2 must re-resolve current authorization before mutation.
- Revocation between reads and mutation must deny on fresh permission/context evaluation.

# 198. Direct Repository Test Boundary
- Repository tests may validate exact SQL/state behavior under trusted test transaction.
- They are not substitutes for service authorization tests.
- Service tests prove `order.manage` enforcement.
- Route tests prove transport cannot bypass service.
- DB tests prove RLS/grants defense.
- Keep each test layer responsible for its own boundary.

# 199. R01 Read Model Compatibility
- Queue DTO must represent PREPARING, READY, and SERVED without unknown-state crash.
- Detail DTO must represent new states.
- Status labels must not fall back to misleading values.
- Queue ordering remains deterministic.
- Existing pending/accepted/rejected rows still render.
- No local-demo order authority returns.

# 200. R02 Decision Compatibility
- Decision repository remains source-limited to PENDING_CONFIRMATION.
- Lifecycle repository remains source-limited to post-accept normal states.
- No route ambiguity between decision and lifecycle.
- R02 accepted_at evidence remains intact after full lifecycle.
- R02 rejection reason remains intact for rejected rows and never appears on normal accepted lifecycle.

# 201. Historical Event Ordering
- `ORDER_ACCEPTED` event precedes preparing event for normal accepted orders.
- preparing event precedes ready event.
- ready event precedes served event.
- Use occurred_at + stable tie-breaker if events can share close timestamps.
- R03 does not need to rewrite existing history ordering infrastructure.

# 202. Database Check — Timestamp/State Compatibility
- If practical, ensure served_at cannot be set on a row that never reached SERVED through application path.
- Avoid overly complex cross-column CHECK constraints that block future exceptions.
- Application/domain transition engine is primary state graph authority.
- Database status constraint is minimum structural authority.
- Event tests provide historical integrity evidence.

# 203. Database Check — Rejection Compatibility
- REJECTED rows retain rejected_at/rejection_reason semantics from R02.
- Normal lifecycle transition predicates cannot target REJECTED.
- R03 migration must not make rejection fields invalid on historical rejected rows.
- Normal accepted-path rows should not acquire rejection reasons.

# 204. Database Check — Actor Identity
- `modified_by_staff` must receive current actor when updated by lifecycle transition if retained as latest modifier evidence.
- `order_events.actor_id` records exact transition actor.
- If `modified_by_staff` is nullable historical field, do not destructive-backfill.
- R03 must not create fake actor UUIDs.

# 205. Transaction Failure Injection Plan
- Identify a safe test seam before implementation.
- Preferred integration proof uses an actual transaction with a forced event write failure.
- Alternative may use a temporary constraint/invalid actor fixture if test harness supports it.
- The failure must occur after attempted order update but before transaction commit.
- Assert rollback at database state level.

# 206. DB Unavailability / Authorization Unavailability
- Treat both as fail-closed but preserve distinct typed errors where existing infrastructure distinguishes them.
- No callback side effect on authorization-unavailable path.
- UI can show retryable service unavailable.
- Do not map unavailable to forbidden if that would mislead operators.

# 207. Response-Loss Recovery
- If server commits transition and network response is lost, client may retry.
- Retry sees current target state and returns conflict under default R03 semantics.
- Client refetch then sees successful committed state.
- This is acceptable because lifecycle transitions are staff interactions, not financial request-idempotency operations.
- No duplicate event is created.

# 208. No Batch Mutation
- Do not add `POST /orders/lifecycle/batch`.
- Bulk kitchen operations may need different concurrency/error semantics later.
- Single-order command keeps evidence and stale-state handling precise.
- R03 performance target does not require batching.

# 209. Query Budget
- Happy-path mutation should not load item/modifier detail.
- Authorization transaction cost is inherited.
- Order update = one bounded statement.
- Event insert = one bounded statement.
- Result returns from UPDATE RETURNING where practical.
- Scoped-state lookup occurs only on no-row conflict/not-found path.

# 210. UI Error Copy Contract
- Invalid request should not normally be reachable from valid UI.
- Conflict copy should indicate order changed and has been refreshed.
- Forbidden copy should indicate access is no longer available, without technical permission names.
- Unavailable copy should allow retry.
- Invariant/server error copy should be generic and safe.

# 211. UI Multi-Device Reconciliation
- Do not rely on realtime for R03.
- Manual action response and refetch provide correctness.
- If the page already has polling/revalidation, reuse it.
- Realtime integration can later improve latency without changing state authority.
- State graph correctness must not depend on websocket delivery.

# 212. Future Kitchen Consumer Contract
- Kitchen may read operational status from the same server-backed order authority.
- Kitchen cannot introduce alternate PREPARING/READY mutation semantics later without respecting lifecycle service.
- R03 should expose domain primitives reusable by authorized kitchen commands in a future phase if needed.
- Do not pre-authorize kitchen role unless current permission product model requires it now.

# 213. Future Realtime Consumer Contract
- A future realtime publisher should react to committed transition evidence/state.
- It must not publish before transaction commit.
- R03 does not implement outbox/event publication.
- Durable order/event data is enough handoff evidence for later realtime design.

# 214. Future Notification Consumer Contract
- Notification delivery may use committed customer status changes later.
- R03 does not send notifications.
- Avoid embedding notification-specific payload into lifecycle service result.
- Keep result DTO domain-focused.

# 215. Future Analytics Contract
- Stable event types enable transition-duration analysis later.
- Stable timestamps enable accepted→preparing→ready→served timing metrics.
- Do not add analytics aggregation tables in R03.
- Preserve event naming consistency.

# 216. R04 Exception Extension Design Constraint
- R04 should be able to reuse trusted context, error classification, event append pattern, and conditional state predicate.
- R04 may define exception-specific transition maps separately.
- Do not expose a generic public `transitionTo(status)` merely for R04 reuse.
- Internal typed helper can be shared while public commands remain explicit.

# 217. R04 Cancellation Handoff Evidence
- R04 will need exact normal state at cancellation attempt.
- R03 must leave current status query/repository behavior deterministic.
- R04 can determine whether cancellation is legal from PENDING_CONFIRMATION/ACCEPTED/PREPARING based on its own spec.
- Existing lifecycle event history remains available for cancellation audit.

# 218. R04 Edit Handoff Evidence
- R04 may need edited-order audit while preserving immutable submitted snapshots/history.
- R03 does not mutate order item content.
- R03 lifecycle engine should not couple state transitions to item mutation code.
- This separation prevents cancellation/edit work from contaminating normal progression.

# 219. Acceptance Evidence Required in R03 PR
- exact implementation parent SHA.
- exact lifecycle branch head SHA.
- final changed-file list.
- final transition matrix.
- final customer-status matrix.
- final event/timestamp matrix.
- authorization negative evidence.
- concurrency evidence.
- rollback evidence.
- schema/migration evidence.
- inherited R01/R02 regression evidence.

# 220. Required Test Names / Coverage Discoverability
- Tests should be named so reviewers can identify lifecycle coverage directly.
- Avoid hiding lifecycle assertions in unrelated giant test files only.
- Unit test name should mention operational order lifecycle.
- Integration test name should mention operational order lifecycle.
- DB test filename should follow P04/R03 naming convention.
- Existing test files may be extended only when responsibilities remain clear.

# 221. Definition of Done — Handoff Quality
- R04 can import/reuse typed lifecycle definitions where appropriate.
- R04 does not need route-local SQL.
- R04 does not need to recreate branch authorization.
- R04 does not need to invent event append semantics.
- R04 receives stable conflict/error behavior.
- R04 receives accurate current normal lifecycle state.

# 222. Document Final Validation Checklist
- [x] metadata is canonical.
- [x] Previous/Next sequence is canonical.
- [x] actual R02 head is recorded.
- [x] actual R02 code evidence was inspected.
- [x] normal lifecycle graph is explicit.
- [x] customer status mapping decision is required.
- [x] schema audit is explicit.
- [x] transaction/event atomicity is explicit.
- [x] permission/RLS boundaries are explicit.
- [x] concurrency and stale behavior are explicit.
- [x] UI reconciliation is explicit.
- [x] migration/deployment safety is explicit.
- [x] R04 exception handoff is explicit.
- [x] R05/R06 scope remains deferred.

# 223. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P04/R03 implementation after it is merged to main.
- Future implementation must branch from latest legitimate P04/R02 lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 224. Final Handoff to R04
- R01 durable queue/detail read plane remains intact.
- R02 explicit accept/reject decision plane remains intact.
- R03 supplies canonical normal lifecycle transition types/map.
- R03 supplies authorized lifecycle service/repository.
- R03 supplies durable actor/timestamp/order-event evidence.
- R03 supplies stale/conflict/concurrency semantics.
- R03 supplies server-backed staff lifecycle UI integration.
- R04 can implement controlled edit/cancel exceptions without arbitrary status writes.

# 225. R04 Required Input Contract
- current server-backed order read model.
- current decision evidence.
- current lifecycle status.
- typed transition infrastructure.
- current order.manage permission boundary.
- durable event writer pattern.
- conflict/error mapping.
- exact lifecycle timestamps where present.

# 226. R04 Must Not Need to Rebuild
- authentication.
- AccessContext.
- permission evaluation.
- queue repository.
- generic lifecycle action parser.
- normal lifecycle event insertion pattern.
- branch isolation.
- stale-state conflict classification.

# 227. Required Next Specification
```text
FLOW_P04_R04_IMPLEMENTATION_SPEC.md
```
- R04 spec must be authored from actual R03 implementation state.
- R03 does not infer final cancellation/edit policy prematurely.
- No R04 implementation starts until exact R04 spec exists on current main.

# 228. Final Acceptance Statement
- P04/R03 is READY as an executable specification document.
- The round establishes the canonical legal normal operational lifecycle after staff acceptance.
- Lifecycle authority remains server-side and branch-scoped.
- Every successful transition is transactionally tied to durable evidence.
- Illegal, stale, cross-scope, and unauthorized transitions fail closed.
- The staff UI reflects server authority rather than becoming state authority.
- Exception edit/cancel workflows, priority/delay/remake controls, external realtime/notification behavior, and final Phase 04 acceptance remain deferred to later rounds.
