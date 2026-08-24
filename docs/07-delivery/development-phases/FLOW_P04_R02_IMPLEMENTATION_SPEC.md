# FLOW P04 R02 — Implementation Specification
> Phase 04 — Order Orchestration & Control
> Round 02 — Staff Order Acceptance / Rejection Decision Boundary
> Revision — Add the first durable staff mutation plane on top of the R01 server-backed operational order queue, establishing authorized branch-scoped accept/reject commands, actor/reason/timestamp evidence, deterministic concurrency behavior, and a safe handoff to the broader lifecycle engine in R03.

## Metadata
- Phase: `04`
- Round: `02`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P04_R01_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P04_R03_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P04 implementation slot after this specification is on main`
- Current planning scope: `PHASE 04 / ROUND 02 ONLY`
- Implementation parent: `latest completed P04/R01 implementation lineage tip`
- Expected implementation parent branch: `p04-r01-operational-order-queue`
- Observed R01 branch head at authoring: `9193c5435ba38f365686998aa09da1a666685408`
- Observed R01 implementation PR: `#78`
- Observed R01 implementation state: `IMPLEMENTED / PR OPEN / SUFFICIENT HANDOFF FOR NEXT SPEC`
- Observed R01 diff from integrated P03/R06 parent: `18 commits ahead, 14 changed files, 2,160 additions, 3 deletions`
- Recommended implementation branch: `p04-r02-order-decision`
- Recommended implementation PR title: `feat(operations): add authorized order acceptance and rejection`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Staff acceptance command in this round: `YES`
- Staff rejection command in this round: `YES`
- Decision actor persistence in this round: `YES`
- Decision timestamp persistence in this round: `YES`
- Rejection reason persistence in this round: `YES`
- Branch-scoped order.manage authorization in this round: `YES`
- Decision concurrency protection in this round: `YES`
- Queue/detail post-decision refresh in this round: `YES`
- General lifecycle transition engine in this round: `NO — P04/R03`
- Order edit/cancel exception workflow in this round: `NO — P04/R04`
- Priority/delay/remake workflow in this round: `NO — P04/R05`
- Phase 04 acceptance in this round: `NO — P04/R06`
- Kitchen production execution in this round: `NO`
- Payment execution in this round: `NO`
- Realtime event publication in this round: `NO`
- Notification delivery in this round: `NO`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` SHA at authoring is `015d443dd79aefb2c0f2c17551fbd1a02c7d04a3`.
- Current `main` contains `FLOW_P04_R01_IMPLEMENTATION_SPEC.md` with `Status: READY`.
- Current `main` R01 spec names this exact file as `Next`.
- Current `main` policy says implementation lineage comes from the latest round branch.
- Current `main` policy says implementation PR merge is not required before next-round branch progression.
- `p04-r01-operational-order-queue` exists and is the latest relevant implementation branch.
- Observed R01 branch head is `9193c5435ba38f365686998aa09da1a666685408`.
- Observed R01 branch is 18 commits ahead of the integrated P03/R06 parent.
- Observed R01 implementation PR #78 is open and draft.
- R01 implementation PR merge state is not used as specification authority.
- R01 branch itself contains meaningful implementation sufficient to define R02 accurately.
- R01 branch contains server-only operational order types.
- R01 branch contains operational order queue repository code.
- R01 branch contains operational order queue service code.
- R01 branch contains internal order queue/detail GET routes.
- R01 branch contains staff operational order workspace UI.
- R01 branch contains unit tests for queue contracts.
- R01 branch contains integration tests for operational order reads.
- R01 branch does not contain accept/reject order mutation commands.
- R01 branch does not contain a broad order lifecycle transition engine.
- R01 branch does not contain payment, kitchen, realtime, or notification execution.
- R02 therefore begins from a real durable read plane rather than demo order state.
- This task is specification/documentation only.
- This task does not create the R02 implementation branch.
- This task does not modify application/runtime source.
- This task does not implement a database migration.
- This task does not modify CI/workflow configuration.
- This task does not merge implementation PR #78.
- This task does not enable implementation auto-merge.

# 2. Phase 04 Objective
- Phase 04 owns durable internal order orchestration and control after customer submission.
- Phase 03 remains the durable source of customer-submitted order identity and snapshots.
- R01 makes durable orders visible through a branch-scoped internal operational queue.
- R02 adds the first internal mutation: accept or reject a pending operational order.
- R03 will own the broader legal lifecycle transition engine after the initial decision boundary exists.
- R04 will own staff edit/cancel exception workflows.
- R05 will own priority, delay, recovery, remake, and remaining order-control hardening.
- R06 will prove the integrated Phase 04 operational control plane end to end.
- Phase 04 must preserve tenant isolation.
- Phase 04 must preserve branch isolation.
- Phase 04 must preserve actor identity and permission provenance.
- Phase 04 must preserve customer/staff authority separation.
- Phase 04 must prevent arbitrary status mutation from browser payloads.
- Phase 04 must make operational decisions auditable.
- Phase 04 must make concurrent decision attempts deterministic.
- Phase 04 must not turn a UI button into direct table authority.
- Phase 04 must avoid coupling acceptance/rejection to kitchen execution before the kitchen phase exists.
- Phase 04 must avoid coupling acceptance/rejection to payment execution.
- Phase 04 must preserve Phase 03 order snapshot integrity.
- Phase 04 must provide reusable transition primitives for later rounds without implementing later-round semantics early.

# 3. Six-Round Phase Boundary
- R01 owns server-backed operational order intake/read architecture.
- R01 owns queue/detail read models and branch-scoped order.view enforcement.
- R02 owns acceptance and rejection decisions only.
- R02 owns decision actor/reason/timestamp persistence.
- R02 owns exact transition eligibility from incoming decision states.
- R02 owns `order.manage` authorization for accept/reject.
- R02 owns stale-decision and competing-decision handling.
- R02 owns read-after-decision queue/detail refresh behavior.
- R03 owns general order lifecycle transitions beyond the initial accept/reject decision.
- R03 owns legal transition graph for preparing/ready/served/payment/closed operational states.
- R03 owns generalized transition timestamps and transition services where required.
- R04 owns controlled staff edits and cancellation exceptions.
- R04 owns mutation audit before/after snapshots for edit/cancel behavior.
- R05 owns priority/delay/remake and recovery controls.
- R06 owns integrated Phase 04 acceptance and Phase 05 handoff.
- R02 must not implement preparing/ready/served flows.
- R02 must not implement staff edit APIs.
- R02 must not implement generic cancellation/refund coordination.
- R02 must not implement queue priority or remake logic.
- R02 must not implement kitchen tickets or production dispatch.

# 4. Observed R01 Code Handoff
- `apps/web/next-flow/src/modules/order-operations/server/types.ts` defines operational order statuses and read DTOs.
- Current operational statuses include `PENDING_CONFIRMATION`.
- Current operational statuses include `ACCEPTED`.
- Current operational statuses include `REJECTED`.
- Current operational statuses also include later lifecycle states that R02 must not orchestrate.
- Current default incoming queue statuses are `PENDING_CONFIRMATION` and `CHANGED`.
- `order-queue-service.ts` validates query input and branch context.
- `order-queue-service.ts` uses `withAuthorizedAccessTransaction()`.
- R01 queue data requires `PERMISSIONS.orderView` at branch scope.
- R01 queue context contains actorId, tenantId, and branchId.
- R01 queue repository uses explicit tenant/branch predicates.
- R01 queue detail returns durable order/item/modifier snapshots.
- R01 queue DTO does not expose customer bearer capability material.
- R01 internal routes are GET-only read surfaces.
- R01 staff workspace consumes the server queue instead of demo `state.orders` as authority for the Orders tab.
- R01 implementation deliberately neutralizes local accept/reject/edit authority for durable server rows.
- R02 must extend this exact operational module rather than create a parallel order-management module.
- R02 must keep R01 queue/detail reads usable independently of mutation ability.
- R02 must preserve `order.view` as the read permission.
- R02 must add `order.manage` as the mutation permission boundary.

# 5. R02 High-Impact Objective
- Add one canonical server-only order decision command layer.
- Add an accept command for eligible incoming operational orders.
- Add a reject command for eligible incoming operational orders.
- Bind every decision to the current authenticated internal actor.
- Bind every decision to current tenant scope.
- Bind every decision to current active branch scope.
- Require `order.manage` permission at branch scope.
- Preserve `order.view` as the permission required to read queue/detail data.
- Ensure order ID from the browser is only a selector.
- Revalidate order scope inside the authorized server transaction.
- Reject cross-tenant selectors without existence disclosure.
- Reject sibling-branch selectors without existence disclosure.
- Reject stale or already-decided orders deterministically.
- Persist decision actor identity durably.
- Persist decision timestamp durably.
- Persist rejection reason code durably.
- Allow bounded optional rejection note only when justified by product UX.
- Never accept browser-supplied tenant ID.
- Never accept browser-supplied branch ID.
- Never accept browser-supplied actor ID.
- Never accept arbitrary target status.
- Never expose a generic `setOrderStatus(status)` public command in R02.
- Ensure two concurrent decisions cannot both win.
- Ensure the losing decision receives a stable conflict response.
- Refresh queue/detail state after a successful decision.
- Remove decided orders from the default incoming queue naturally through durable status.
- Keep decision mutations independent from kitchen/payment/realtime side effects.
- Produce reusable decision evidence that R03 lifecycle orchestration can inherit.

# 6. Primary Risk Inventory
- Risk: generic status update endpoint bypasses lifecycle design.
- Mitigation: expose explicit `acceptOrder()` and `rejectOrder()` commands only.
- Risk: route checks permission but repository mutation omits branch predicate.
- Mitigation: authorized transaction plus explicit tenant/branch/order eligibility predicates.
- Risk: two staff members decide the same order simultaneously.
- Mitigation: row lock or atomic conditional update selecting one winner.
- Risk: accept and reject both appear successful due to stale reads.
- Mitigation: exact source-status predicate in the mutation statement.
- Risk: browser supplies actor ID to spoof decision provenance.
- Mitigation: actor derives only from AccessContext.
- Risk: browser supplies arbitrary reason or giant free-text payload.
- Mitigation: bounded reason code enum and bounded note validation.
- Risk: customer capability gains staff mutation authority.
- Mitigation: internal Auth.js/AccessContext path only.
- Risk: staff route access is mistaken for order mutation permission.
- Mitigation: require `order.manage` independently of `operations.staff.access`.
- Risk: queue read permission implies mutation permission.
- Mitigation: `order.view` and `order.manage` remain separate authorization checks.
- Risk: rejected order accidentally enters kitchen flow.
- Mitigation: no kitchen side effect in R02 and explicit terminal/decision status semantics.
- Risk: accepted order automatically changes to PREPARING.
- Mitigation: R02 target is only ACCEPTED; R03 owns later transitions.
- Risk: mutation loses original submitted snapshots.
- Mitigation: do not alter order item/modifier snapshot rows.
- Risk: decision migration rewrites historical migrations.
- Mitigation: forward-only migration only when schema extension is required.
- Risk: stale client treats conflict as generic 500.
- Mitigation: stable typed decision conflict error and transport mapping.
- Risk: mutation logs customer notes or secrets.
- Mitigation: structured redacted logs with identifiers only where safe.

# 7. Decision Authority Model
- Authentication authority is Auth.js internal staff session.
- Workspace authority is current AccessContext.
- AccessContext must contain tenant ID.
- AccessContext must contain active branch ID.
- Branchless context cannot decide branch-scoped operational orders.
- Decision actor ID comes from AccessContext actorId.
- Decision tenant ID comes from AccessContext tenantId.
- Decision branch ID comes from AccessContext branchId.
- Browser order ID is a selector only.
- Browser decision action is intent only.
- Browser rejection reason is domain input only.
- Browser cannot choose mutation role.
- Browser cannot choose database tenant context.
- Browser cannot choose database branch context.
- Browser cannot impersonate another actor.
- `operations.staff.access` controls entry to the staff operations route family.
- `order.view` controls durable order reads.
- `order.manage` controls acceptance/rejection mutations.
- A user with `order.view` but without `order.manage` must remain read-only.
- A user with `order.manage` but no valid active branch must be denied.
- Customer capability cookies must never satisfy internal mutation authority.

# 8. Order Decision State Model
- R02 decisions are explicit initial operational decisions.
- Eligible incoming order states must be audited against the current persisted status constraint.
- `PENDING_CONFIRMATION` is the canonical customer-submitted incoming state observed from Phase 03.
- `CHANGED` is included in the R01 incoming queue and requires an explicit R02 decision policy.
- Implementation must determine whether `CHANGED` is a re-decision state or only a future exception state.
- If current product semantics prove `CHANGED` requires staff re-decision, accept/reject may include it as an eligible source state.
- If current semantics do not prove re-decision, R02 must limit decision source state to `PENDING_CONFIRMATION` and leave `CHANGED` read-only.
- The implementation PR must record the chosen `CHANGED` policy with evidence from current code/schema/product docs.
- Accept target operational status is `ACCEPTED`.
- Reject target operational status is `REJECTED`.
- R02 must never accept a caller-supplied target status.
- R02 must never transition directly to `PREPARING`.
- R02 must never transition directly to `READY`.
- R02 must never transition directly to `SERVED`.
- R02 must never transition directly to `PAID` or `CLOSED`.
- R02 must never use `CANCELLED` as a substitute for explicit initial rejection without product/schema evidence.
- Acceptance and rejection must be one-way for the exact R02 decision command.
- Undo/reopen behavior is not authorized in R02.
- Decision reversal belongs to a later controlled exception flow if ever required.
- Already-accepted and already-rejected rows are not mutable through R02 decision commands.

# 9. Customer-Status Mapping Audit
- The orders table also contains `customer_status` from Phase 03.
- R02 must inspect current customer-status constraints before changing this field.
- Do not invent a new customer-status string without schema/product justification.
- Acceptance may require a customer-facing confirmed state if such a canonical value already exists.
- Rejection may require a customer-facing rejected state if such a canonical value already exists.
- If no canonical customer-facing decision values exist yet, R02 may leave `customer_status` unchanged and document the limitation for a later customer-notification/status round.
- Operational `status` remains the R02 source of truth for staff decision outcome.
- Any customer-status update must occur in the same database transaction as operational status.
- Customer-status mapping must be deterministic.
- Customer-status mapping must not depend on client payload.
- Customer-status mapping must be covered by database tests if changed.
- Customer-status mapping must preserve existing Phase 03 submitted-state invariants.
- The PR must state whether customer_status changed and why.
- No notification delivery is implied by a customer-status change.
- No realtime push is implied by a customer-status change.

# 10. Decision Evidence Contract
- Every successful decision must have durable actor evidence.
- Every successful decision must have durable decision timestamp evidence.
- Rejection must have durable reason evidence.
- Acceptance may have an optional reason/note only if current product requirements justify it.
- Decision evidence must survive page refresh.
- Decision evidence must survive server restart.
- Decision evidence must be queryable by later audit/operations rounds.
- Decision evidence must be tenant-scoped.
- Decision evidence must be branch-scoped where stored in a separate table.
- Decision evidence must refer to immutable order UUID.
- Decision actor reference must point to the real internal actor identity.
- Decision evidence must not store session cookies or auth tokens.
- Decision evidence must not store customer capability bearer material.
- Decision evidence must not derive actor from browser input.
- Decision timestamp must be server/database generated.
- Decision evidence must distinguish ACCEPT from REJECT.
- Rejection reason code must be machine-readable.
- Optional human note must be bounded and treated as untrusted text.
- Decision evidence must not be overwritten by later lifecycle transitions.
- R03 must be able to add later transition evidence without erasing the initial decision record.

# 11. Decision Persistence Strategy
- Implementation must audit whether existing `foodflow.orders` has suitable actor/reason/timestamp columns.
- If existing columns cleanly represent the initial decision, reuse them.
- If existing schema lacks durable decision provenance, add a focused forward-only migration.
- Preferred design is either narrow decision columns on `orders` or a dedicated append-only decision/event row.
- Choice must minimize premature generalized lifecycle-event architecture while preserving auditability.
- Do not introduce a broad event-sourcing platform in R02.
- Do not introduce a generic workflow engine in R02.
- If using order columns, candidate fields include decision_actor_id, decided_at, rejection_reason_code, rejection_note.
- Exact column names must follow current repository conventions.
- If using a decision table, it must have tenant_id, branch_id, order_id, actor_id, decision, reason fields, decided_at.
- A separate decision table should enforce at most one initial decision per order unless product semantics require re-decision.
- Foreign keys must preserve tenant-safe referential integrity where schema conventions support composite keys.
- Decision evidence should remain immutable after success except through a future explicit correction process.
- Implementation must document why chosen persistence shape is sufficient for R03 handoff.
- Schema change must not alter historical Phase 03 migration files.
- Schema change must not destructively rewrite existing submitted orders.
- Existing pending orders must remain readable through R01 after migration.
- Backfill must be unnecessary for new nullable decision evidence on undecided rows unless constraints require otherwise.
- If non-null constraints are introduced, migration must use a safe staged approach.
- Generated database types must be regenerated/updated through the repository-approved path when schema changes.

# 12. Acceptance Command Contract
- Canonical command name should be `acceptOperationalOrder` or an equivalent explicit name.
- Command must be server-only.
- Command input must contain orderId and no authority fields.
- Command may include an optional bounded note only if product requirements justify it.
- Command validates UUID format before database access.
- Command resolves current AccessContext before mutation.
- Command requires active branch.
- Command requires `order.manage` branch permission.
- Command opens one authorized access transaction.
- Command scopes by current tenant.
- Command scopes by current branch.
- Command verifies eligible source status.
- Command obtains deterministic mutation ownership under concurrency.
- Command writes operational status `ACCEPTED`.
- Command persists decision actor.
- Command persists decision timestamp.
- Command persists any accepted customer-status mapping in the same transaction when applicable.
- Command does not create kitchen tickets.
- Command does not create payment records.
- Command does not publish realtime events.
- Command does not send notifications.
- Command returns a stable decision result DTO.
- Result DTO should contain order ID, order number, final status, decision, decidedAt, and safe actor display data only if already available and appropriate.
- Result DTO must not expose internal permission rows.
- Result DTO must not expose customer capability identifiers.
- Successful result must allow the UI to refresh/remove the order from incoming queue.

# 13. Rejection Command Contract
- Canonical command name should be `rejectOperationalOrder` or equivalent explicit name.
- Command must be server-only.
- Command input must contain orderId.
- Command input must contain a validated rejection reason code.
- Command may contain a bounded optional rejection note.
- Command must not accept tenantId.
- Command must not accept branchId.
- Command must not accept actorId.
- Command must not accept targetStatus.
- Command validates UUID and reason format before database mutation.
- Command resolves current AccessContext.
- Command requires active branch.
- Command requires `order.manage` at branch scope.
- Command executes inside one authorized transaction.
- Command scopes by current tenant and branch.
- Command verifies eligible source status.
- Command serializes against concurrent accept/reject.
- Command writes operational status `REJECTED`.
- Command persists actor and timestamp.
- Command persists rejection reason code.
- Command persists normalized optional note when present.
- Command applies customer-status mapping only when current schema/product contract supports it.
- Command does not refund money.
- Command does not cancel a payment authorization.
- Command does not notify customer externally.
- Command returns stable decision result DTO.

# 14. Rejection Reason Taxonomy
- R02 must define a bounded machine-readable rejection reason taxonomy.
- Taxonomy should be small enough to remain operationally useful.
- Taxonomy should be large enough to distinguish common rejection classes.
- Candidate reason: `ITEM_UNAVAILABLE`.
- Candidate reason: `STORE_CLOSING`.
- Candidate reason: `CAPACITY_LIMIT`.
- Candidate reason: `INVALID_ORDER`.
- Candidate reason: `CUSTOMER_REQUEST` only if staff can legitimately reject on customer request at this stage.
- Candidate reason: `OTHER` with optional bounded note.
- Exact accepted values must be decided from current product authority and existing conventions.
- Unknown reason codes must fail validation.
- Empty reason code must fail rejection.
- Free-text reason must not replace the code.
- Reason code must be persisted.
- Reason code must be safe for analytics.
- Reason code must not embed PII.
- Optional note must be trimmed.
- Optional note must have a strict maximum length.
- Optional note must be stored/rendered as plain text.
- Optional note must never be interpreted as HTML.
- Optional note must not be logged in full by default.

# 15. Decision Actor Contract
- Actor comes from internal AccessContext actorId.
- Actor must be a real application user identity.
- Shared legacy credentials are not valid actor evidence.
- Customer capability ID is not actor evidence for staff decisions.
- Browser-provided user ID is never trusted.
- Actor identity must survive later display/audit needs.
- If orders table stores actor UUID directly, enforce referential integrity where practical.
- If decision table stores actor UUID, tenant relationship must remain valid.
- Actor branch membership is authorized at decision time through current permission evaluation.
- Later membership removal must not erase historical actor evidence.
- Historical decision must remain attributable even if role changes later.
- Do not snapshot sensitive profile fields unnecessarily.
- Actor display name may be resolved for UI separately from immutable actor ID.
- Decision DTO may omit actor display if no stable safe read path exists yet.
- Audit tests must prove actor is server-derived.
- Negative tests must try spoofed actor input and confirm it is ignored/rejected.
- Decision actor must be recorded within the same successful mutation transaction.
- Failed transactions must not leave actor evidence without a decision.

# 16. Decision Timestamp Contract
- `decided_at` or equivalent must be server/database generated.
- Client timestamp must never be authoritative.
- Use timestamptz.
- Prefer database `clock_timestamp()` or repository-standard transaction timestamp semantics.
- Timestamp and decision mutation must commit atomically.
- Failed decision must not persist decided_at.
- Replayed stale client requests must not overwrite original decision time.
- Competing losing request must not update decided_at.
- R01 submittedAt remains unchanged.
- Decision time is distinct from submittedAt.
- Decision time is distinct from later preparing/ready timestamps.
- R03 may reuse decision time as the first lifecycle milestone without changing it.
- UI can derive wait-to-decision duration from submittedAt and decidedAt later.
- Timestamp must be serialized as ISO 8601 in transport DTOs.
- Invalid stored timestamp should be treated as invariant violation.

# 17. Exact Eligible Source-State Predicate
- Decision update must include exact source-state predicate.
- Application pre-read alone is not sufficient.
- Database mutation itself must require the eligible source status.
- At minimum `PENDING_CONFIRMATION` is eligible.
- `CHANGED` eligibility requires explicit implementation-time audit.
- If `CHANGED` is eligible, both accept and reject must define consistent behavior.
- If `CHANGED` is ineligible, UI must not show enabled decision actions for it.
- Accepted order is ineligible for R02 accept/reject commands.
- Rejected order is ineligible.
- Preparing order is ineligible.
- Ready order is ineligible.
- Served order is ineligible.
- Payment-pending order is ineligible.
- Paid order is ineligible.
- Closed order is ineligible.
- Cancelled order is ineligible.
- Remake order is ineligible.
- Voided order is ineligible.
- Unknown future statuses must fail closed.
- Exact mutation predicate must make stale status a conflict rather than silent success.

# 18. Concurrency Model
- Two staff actors may load the same incoming order concurrently.
- Both may press different decisions near-simultaneously.
- Exactly one decision may commit.
- Database is the final arbitration authority.
- Preferred strategy is `SELECT ... FOR UPDATE` followed by exact status transition or one atomic conditional update.
- Avoid separate unprotected read then update.
- Lock ordering must be deterministic.
- R02 needs only the order row lock for initial decision unless schema design adds a decision row requiring ordered locking.
- Do not lock unrelated order item rows for simple decision mutation.
- Do not hold locks across network calls.
- No external side effect may run while holding the decision transaction lock.
- Losing concurrent request returns conflict/stale decision.
- Losing request must not report success simply because target status now matches its requested target unless exact idempotency policy explicitly permits it.
- Same-action double-click behavior must be decided explicitly.
- Recommended same-action second request after first commit returns a stable already-decided conflict plus fresh order status.
- R02 does not need a generalized request-idempotency table for staff decisions unless current architecture already has a safe reusable internal command idempotency primitive.
- R02 must avoid importing customer P03/R05 idempotency records as staff authority.
- Duplicate browser retries must be safe through exact conditional transition even without replay-result caching.
- Concurrency tests must run actual parallel transactions when database integration framework supports it.
- Tests must prove accept-vs-reject cannot both commit.

# 19. Same-Decision Retry Semantics
- A user may double-click Accept.
- A network client may retry after timeout.
- First accepted decision may have committed before retry arrives.
- Retry must never create duplicate decision evidence.
- Retry must never change decidedAt.
- Retry must never create another audit row for the same initial decision if decision evidence is unique.
- Recommended response is deterministic conflict/already-decided with current final status.
- UI should reconcile by reloading order state.
- Do not treat a stale retry as a new lifecycle transition.
- Do not convert ACCEPTED back to PENDING_CONFIRMATION.
- Do not silently create a second acceptance event.
- If implementation introduces request keys, they must remain narrow to R02 and not conflict with P03 customer keys.
- Request-key infrastructure is not required merely for line-of-code symmetry.
- Structural database transition guard is mandatory regardless of transport retry design.
- Retry behavior must be covered by integration tests.

# 20. Opposite-Decision Race Semantics
- Actor A may accept while Actor B rejects.
- Order starts in eligible incoming state.
- Both requests may pass initial UI eligibility checks.
- Database mutation must serialize or conditionally arbitrate.
- Exactly one target status commits.
- Winner persists its own actor identity.
- Winner persists its own timestamp.
- Winner persists rejection reason only when winner is reject.
- Loser observes no row eligible for transition.
- Loser receives conflict/stale-order error.
- Loser must not overwrite actor evidence.
- Loser must not overwrite reason evidence.
- Loser must not overwrite customer status.
- UI for loser must refresh to winner state.
- No 500 should be generated for expected stale-decision race.
- Race test must repeat enough times to detect nondeterministic double-writes where practical.

# 21. Repository Architecture
- Extend `src/modules/order-operations/server/` rather than create unrelated operational mutation directory outside the module.
- Keep `server-only` at command/repository entry points.
- Read repository from R01 remains valid.
- Mutation repository may be added as `order-decision-repository.ts` or equivalent focused file.
- Do not overload queue repository with broad generic mutation methods if that harms separation.
- Mutation repository constructor should receive transaction plus trusted operational context.
- Repository methods must not accept tenantId override.
- Repository methods must not accept branchId override.
- Repository methods must not accept actorId override when context already contains actor.
- Repository method inputs should be orderId plus normalized decision-domain input.
- Repository should return typed mutation rows/decision result, not raw arbitrary database row.
- Repository must scope tenant and branch in the mutation query.
- Repository must enforce exact eligible status in the mutation query.
- Repository must surface no-row mutation distinctly from infrastructure failure.
- Repository must preserve order item/modifier snapshots.
- Repository must not write kitchen/payment tables.
- Repository must not call external services.
- Repository must remain transaction-bound.

# 22. Service / Command Architecture
- Add explicit decision service or command module under order-operations server module.
- Recommended file: `order-decision-service.ts` or `commands/order-decision.ts` following local module conventions.
- Service resolves permission through `withAuthorizedAccessTransaction()`.
- Service requires `PERMISSIONS.orderManage` or exact current permission constant equivalent.
- Service requires branch scope.
- Service builds trusted context from authorized AccessContext.
- Service calls mutation repository only inside authorized transaction.
- Service maps not-found vs stale conflict carefully to avoid cross-scope disclosure.
- Cross-scope order IDs should appear not found/forbidden according to current safe error policy.
- Same-scope stale eligible-state mismatch should become decision conflict.
- Service normalizes rejection reason before repository call.
- Service does not accept arbitrary status enum.
- Service does not call queue route internally through HTTP.
- Service may return updated operational order summary by reusing mapping helpers.
- Service should avoid a second independent transaction for read-after-mutation if the mutation result already contains required fields.
- If detail refresh is needed, client can perform a fresh GET after command success.
- Service must not import client components.
- Service must remain independently testable.

# 23. Command Types
- Define `OperationalOrderDecision = "ACCEPT" | "REJECT"` if a shared internal type is useful.
- Public transport should prefer separate intent endpoints or an exact bounded action field.
- If one endpoint uses `{ action }`, action enum must be exhaustive and reject unknown values.
- Separate functions `acceptOperationalOrder()` and `rejectOperationalOrder()` are preferred over generic arbitrary target status.
- Accept input type should contain orderId and only required accept metadata.
- Reject input type should contain orderId, reasonCode, optional note.
- Decision result type should contain stable status information.
- Decision result must not include database-only customer capability ID.
- Decision result must not include raw permission grants.
- Decision result may include decidedAt.
- Decision result may include rejection reason only for reject.
- Decision result should preserve orderNumber for UI reconciliation.
- Types must be readonly where repository convention favors immutable DTOs.
- Runtime validation must not rely on TypeScript types alone.

# 24. Input Validation
- Order ID must be canonical UUID format accepted by repository conventions.
- Unknown JSON fields should be rejected for mutation bodies when current HTTP helpers support strict parsing.
- Body size must be bounded.
- Empty JSON where reject requires reason must fail.
- Unknown action must fail.
- Unknown reason code must fail.
- Rejection note must be string or null/absent according to contract.
- Rejection note length must be bounded.
- Rejection note should be trimmed.
- Note consisting only of whitespace normalizes to null.
- Control characters should be rejected or normalized safely according to current validation conventions.
- Tenant ID fields in body must be rejected as unknown.
- Branch ID fields in body must be rejected as unknown.
- Actor ID fields in body must be rejected as unknown.
- Status fields in body must be rejected unless exact action contract uses a bounded decision token.
- SubmittedAt must never be accepted from client.
- DecidedAt must never be accepted from client.
- Customer status must never be accepted from client.
- Price/currency/order totals are not part of decision input.
- Validation errors must map to stable 400-class transport errors.

# 25. Error Taxonomy
- Add exact operational mutation error codes rather than reuse read errors ambiguously.
- Candidate error: `ORDER_DECISION_INVALID_REQUEST`.
- Candidate error: `ORDER_DECISION_FORBIDDEN`.
- Candidate error: `ORDER_DECISION_NOT_FOUND`.
- Candidate error: `ORDER_DECISION_CONFLICT`.
- Candidate error: `ORDER_DECISION_INVARIANT_VIOLATION`.
- Candidate error: `ORDER_DECISION_UNAVAILABLE`.
- Exact names should align with current module naming.
- Invalid request maps to HTTP 400.
- Missing internal session maps through existing auth behavior.
- Permission denial maps to 403.
- Cross-scope selector should not reveal existence.
- Same-scope stale state maps to 409.
- Unexpected database failure maps to 503 or repository-standard safe unavailable response.
- Internal exception details must not be serialized to client.
- PostgreSQL constraint names should not leak to transport.
- SQLSTATE may be used internally for classification but not exposed raw.
- Error logging must redact sensitive body text.
- Error mapping must be unit-tested.

# 26. HTTP Mutation Surface
- Keep R01 GET routes unchanged for reads.
- Add focused mutation route(s) under `/api/internal/orders` hierarchy.
- Candidate pattern: `POST /api/internal/orders/[id]/decision` with strict `{ action, reasonCode?, note? }`.
- Alternative: separate `/accept` and `/reject` subroutes if repository conventions favor explicit endpoints.
- Do not use GET for mutation.
- Do not place rejection note in query string.
- Do not place tenant/branch in URL as authority.
- Route must resolve internal session/context through existing internal helpers.
- Route must call command/service layer only.
- Route must not mutate Kysely tables directly.
- Route must use no-store semantics for response where appropriate.
- Route must reject unsupported content types if current HTTP helper supports it.
- Route must bound request body size.
- Route must preserve same-origin/CSRF discipline used by internal mutation routes.
- Route should return stable `{ ok, data }` or current repository-standard shape.
- Route should return stable `{ ok, error }` safe error shape.
- Route must not expose stack traces.
- Route must not accept `method=accept` style overrides.
- Route tests must cover unsupported method behavior.

# 27. CSRF / Origin Safety
- Internal mutation is cookie/session authenticated and therefore requires CSRF-conscious transport.
- Reuse current same-origin enforcement helper when available.
- If current internal mutation infrastructure has a CSRF token contract, use it rather than inventing another.
- If same-origin Origin validation is the established baseline, enforce it on decision mutations.
- Missing Origin behavior must follow current repository policy rather than ad hoc permissiveness.
- Cross-origin browser POST must be denied.
- CORS must not be widened for decision endpoints.
- Decision endpoint must not support JSONP.
- Decision endpoint must not be embedded in GET links.
- No mutation through image/form GET semantics.
- SameSite cookie assumptions must not be the only defense if current code uses explicit origin checks.
- CSRF denial must occur before database mutation.
- CSRF tests should cover foreign Origin where route test harness supports headers.
- CSRF failure must not reveal order existence.

# 28. Authorization Requirements
- Internal session required.
- Current AccessContext required.
- Active branch required.
- `operations.staff.access` remains route-shell permission where current staff layout requires it.
- `order.view` remains queue/detail read permission.
- `order.manage` is required for decision mutation.
- Permission must be evaluated at branch scope.
- Tenant-level permission without applicable branch grant must not automatically mutate branch order unless current permission model explicitly says it should.
- Authorization must derive from current database membership/permission state.
- Revoked membership must deny new decisions.
- Disabled actor must deny new decisions.
- Customer capability does not satisfy mutation auth.
- Anonymous request is denied.
- Staff from sibling tenant is denied.
- Staff from sibling branch without permission is denied.
- Staff with view-only permission is denied mutation.
- Staff with manage permission and correct branch may decide eligible order.
- Tests must distinguish route access from mutation permission.

# 29. Database Mutation Primitive Decision
- Implementation must decide between direct transaction-bound update and narrow SECURITY DEFINER function.
- Direct update is acceptable only if `flow_runtime` already has appropriately scoped order UPDATE authority under staff RLS and repository predicates remain sufficient.
- Narrow SECURITY DEFINER function is preferable if direct UPDATE grants would be broader than required.
- Do not grant customer runtime update authority for staff decisions.
- Do not grant anon/authenticated Supabase roles direct order decision authority.
- Do not grant `flow_customer_entry` decision authority.
- Do not reuse `private.submit_customer_order()` for staff decision.
- If function is used, it must have fixed safe search_path.
- If function is used, revoke execution from public/anon/authenticated/customer roles.
- If function is used, grant execute only to the intended internal runtime role.
- Function must derive tenant/branch/actor context from trusted transaction-local settings or server-supplied validated identifiers protected by caller role.
- Function must enforce exact source status.
- Function must return enough mutation result to distinguish success from stale conflict safely.
- Function must not accept arbitrary target status.
- Separate accept/reject functions or bounded decision enum are acceptable.
- DB choice must be documented in implementation PR.

# 30. RLS and Tenant Isolation
- Existing staff RLS remains defense in depth.
- R02 must audit current orders RLS before changing grants.
- Mutation must never broaden customer RLS.
- Mutation must never weaken tenant checks.
- Mutation must never weaken branch checks.
- Any new decision table must have tenant isolation.
- Any new decision table must have branch isolation when branch_id is stored.
- Any new decision table must prevent cross-tenant order references.
- Any new decision table must prevent cross-branch order references where applicable.
- Staff runtime role must not gain access to unrelated customer idempotency secrets.
- Customer runtime must not gain access to staff decision evidence beyond exact future customer read requirements.
- Direct database tests must prove wrong tenant cannot decide.
- Direct database tests must prove wrong branch cannot decide.
- Direct database tests must prove customer role cannot decide.
- Direct database tests must prove anon/authenticated cannot execute privileged function if one is added.
- RLS failures must not be bypassed by SECURITY DEFINER parameter injection.

# 31. Database Constraints
- Operational status constraint must allow ACCEPTED and REJECTED before R02 relies on them.
- Current R01 types already list both values; implementation must confirm persisted DB constraint too.
- Decision actor column, if added, must be valid UUID/reference type.
- Decided_at column, if added, must be timestamptz.
- Rejection reason column should be constrained when practical.
- Optional note should have application limit and may have DB check length limit.
- If decision table is used, decision enum/check must allow only ACCEPT/REJECT.
- If decision table is used, unique order decision constraint should prevent duplicate initial decision evidence.
- Source status transition should be enforced in mutation primitive, not only with generic CHECK.
- Accepted row should not require rejection reason.
- Rejected row should require rejection reason when persistence columns share the order row.
- Migration should avoid invalidating historical rows.
- Constraint validation order must be deployment-safe.
- No destructive drop of existing Phase 03 order fields.
- No rewrite of historical migrations.

# 32. Migration Safety
- Create one forward-only R02 migration when schema/function/grants change.
- Migration filename should follow current timestamped naming convention.
- Migration must be rerunnable only according to repository migration semantics; do not rely on manual partial execution.
- Fresh database reset must apply cleanly.
- Existing submitted orders must survive migration unchanged except nullable/defaulted new evidence fields.
- Existing accepted/rejected fixture data must not fail new constraints unexpectedly.
- If adding NOT NULL fields, use staged nullable/backfill/validate pattern only when necessary.
- Avoid table rewrite for unnecessary defaults on large tables.
- Add indexes concurrently only if repository migration tooling supports it; otherwise keep migration transaction compatibility.
- Migration must preserve existing indexes used by R01 queue.
- Migration must preserve P03 customer submission function.
- Migration must preserve R01 read queries.
- Migration must preserve current staff RLS.
- Migration must preserve customer RLS.
- Migration rollback is via forward fix, not historical file edits.
- Implementation PR must summarize migration impact.

# 33. Generated Database Types
- If table columns or new decision table are added, generated database types must reflect them.
- If only a SQL function is added and generated types do not include routines, document no type change.
- Do not handwave generated type drift.
- Do not edit generated types inconsistently with actual schema.
- Repository typecheck must catch mismatches.
- Generated types must preserve existing order field optionality correctly.
- New nullable decision evidence must be typed nullable until decision occurs.
- New reason enum/check may still map to string unless generation supports literal enum.
- Domain types should narrow database strings through runtime assertions where needed.
- Generated-type update is implementation scope only when schema changed.

# 34. Queue Read Compatibility
- R01 queue must continue to load while R02 mutation code is introduced.
- R01 filters must continue to accept current status list.
- After accept, order should leave default incoming queue because default includes only incoming statuses.
- After reject, order should leave default incoming queue.
- Explicit queue filter for ACCEPTED should still show accepted order if R01 supports arbitrary listed status filters.
- Explicit queue filter for REJECTED should still show rejected order.
- Queue sorting remains submittedAt/id based unless later spec changes it.
- R02 must not change cursor format without necessity.
- R02 must not add mutation-only fields to public read DTO unless UI requires safe decision display.
- Existing detail endpoint remains read-only.
- Existing queue count semantics must be audited after status change.
- Incoming count should decrement after decision naturally through query predicate.
- Queue must not temporarily duplicate order in both incoming and accepted groups due to client local state hacks.
- Server durable status remains authority.

# 35. Detail Read Compatibility
- R01 order detail remains durable snapshot read.
- R02 may extend detail DTO with safe decision evidence if UI requires it.
- Decision actor ID should not be exposed unnecessarily.
- Decision actor display name may be exposed only through a safe internal staff DTO when useful.
- Rejection reason may be visible to authorized internal staff.
- Rejection note may be visible internally if stored.
- Customer bearer/capability identifiers remain hidden.
- Order item price snapshots remain unchanged.
- Modifier snapshots remain unchanged.
- Customer note remains read-only.
- Detail endpoint must continue branch scoping.
- Detail endpoint must continue order.view permission.
- Mutation permission must not be required merely to inspect detail.
- View-only staff must be able to inspect decision outcome where read policy allows.

# 36. Staff UI Decision Controls
- Reuse R01 operational order workspace.
- Add Accept and Reject actions only for eligible incoming rows/detail.
- Do not re-enable old demo-store mutation buttons for durable server orders.
- UI action visibility may be based on permission-aware server/client state, but server remains authority.
- Disabled button alone is not authorization.
- Accept button must be explicit.
- Reject button must be explicit.
- Reject action should open a reason selector/modal/popover appropriate to current UI system.
- Reject action must require reason before submit.
- Optional note field must show maximum length if implemented.
- While mutation is in flight, duplicate submission from same control should be disabled.
- Pending UI state must not optimistically invent final durable status before server confirms unless rollback behavior is rigorous; prefer server-confirmed update.
- On success, refresh/invalidate queue and selected detail.
- On conflict, reload current order and show stale-decision message.
- On forbidden, remove mutation affordance and show access error.
- On unavailable, preserve current data and allow manual retry.
- UI must not show Accept/Reject for terminal/later lifecycle states.
- UI must not expose arbitrary status dropdown.

# 37. Rejection UX
- Rejection requires deliberate confirmation.
- Reason selector must use bounded domain codes.
- User-facing labels may be localized while persisted codes remain stable English identifiers.
- `OTHER` should require or strongly prompt a note if product policy chooses it.
- Note input must be plain textarea/text field.
- Note must not allow rich HTML.
- Modal close before submit must not mutate.
- Pressing Escape should close safely when no submit in progress.
- Submit button disabled until valid reason.
- Network error preserves entered reason/note for retry where safe.
- Conflict after another staff decision closes or reconciles modal after refresh.
- Successful rejection should remove order from incoming queue.
- Successful rejection should show concise confirmation.
- UI must not imply refund occurred.
- UI must not imply customer notification occurred.

# 38. Acceptance UX
- Acceptance should require one deliberate action.
- Confirmation dialog is optional based on current product UX, but accidental double-click must be handled.
- Acceptance must not ask for target lifecycle status.
- Acceptance must not immediately display PREPARING unless R03 later implements that transition.
- Successful acceptance sets staff-visible status ACCEPTED.
- Successful acceptance removes order from default incoming queue.
- UI may retain selected order detail briefly with final status if useful.
- Queue count must refresh.
- Accepted confirmation must not claim kitchen has begun preparation.
- Accepted confirmation must not claim payment status.
- Permission denial must not leave an optimistic accepted card.
- Conflict must display actual current status after refresh.
- Unavailable error allows retry without corrupting queue.

# 39. Loading / Pending States
- Each order action should have per-order pending state.
- One order mutation should not freeze unrelated queue browsing unless implementation simplicity requires a narrow blocking region.
- Accept pending indicator should identify the action.
- Reject pending indicator should identify the action.
- Buttons for the same order should be disabled during mutation to avoid local competing requests.
- Buttons for other orders may remain enabled.
- Route navigation during pending mutation should not cause duplicate hidden submission.
- Abort behavior must not assume server transaction was cancelled after request was sent.
- After uncertain abort, next refresh must reconcile durable state.
- Loading spinner must have accessible text/aria where current components support it.
- Pending state must clear on handled error.
- Pending state must clear on conflict after reconciliation.

# 40. Accessibility
- Accept and Reject controls must be keyboard reachable.
- Buttons need explicit accessible names.
- Rejection dialog needs focus management.
- Rejection dialog needs labelled reason control.
- Rejection note needs label and character limit indication if present.
- Error feedback should be announced through existing accessible alert pattern.
- Pending state should expose `aria-busy` or equivalent where current UI system supports it.
- Disabled state must not rely on color alone.
- Status labels must remain textual.
- Destructive Reject control should be visually distinct only through existing design system, not custom inaccessible styling.
- Focus should return predictably after dialog close.
- Conflict refresh should not unexpectedly move focus without feedback.

# 41. Responsive Behavior
- Existing staff Orders workspace responsive structure must remain intact.
- Decision buttons must not overflow narrow screens.
- Rejection dialog must fit mobile viewport.
- Reason selector must remain usable on touch devices.
- Pending indicators must not cause layout shift that hides order identity.
- Order detail actions should remain reachable without horizontal scrolling where practical.
- No desktop-only hover dependency for decisions.
- Confirmation text must remain concise on mobile.

# 42. Safe Read-After-Write Strategy
- Durable database status is the source of truth after mutation.
- On success, invalidate/re-fetch queue.
- On success, invalidate/re-fetch selected detail if it remains open.
- Avoid manually patching multiple client caches with divergent logic when simple revalidation is available.
- If optimistic update is used, final server response must reconcile exact durable fields.
- Incoming count must be refreshed from server.
- Cursor pagination state may need reset after removing an incoming row.
- Do not assume next cursor remains semantically perfect after mutation when list membership changed; safest behavior may refresh first page.
- Branch switch after mutation must discard stale previous-branch cache.
- Error retry should re-fetch if commit outcome is uncertain.

# 43. Mutation Transport Caching
- Mutation responses must not be cached as shared GET resources.
- Internal decision route should use no-store semantics.
- CDN must not cache mutation result.
- Browser service worker must not replay mutation blindly unless future explicit offline strategy exists.
- R02 does not implement offline decision queueing.
- R02 does not implement background sync for staff mutations.
- Read endpoints may keep their current no-store behavior.
- Decision result must be per authenticated request.

# 44. Logging and Observability
- Log safe command name.
- Log order UUID only if current logging policy allows internal identifiers.
- Log tenant/branch IDs only at safe structured level if current policy allows.
- Log actor ID only where audit/ops logging policy permits.
- Do not log session token.
- Do not log customer capability bearer material.
- Do not log rejection note by default.
- Do not log full request body.
- Log decision outcome category: success/conflict/forbidden/unavailable.
- Log database error category without leaking SQL text to client.
- Include correlation/request ID if existing infrastructure provides one.
- R02 must not introduce a new telemetry vendor.
- Metrics infrastructure is optional only if already present.
- Durable decision evidence is more important than application log for auditability.

# 45. Audit Semantics
- Durable decision evidence is the canonical audit datum for the initial order decision.
- Application logs are not a substitute for database provenance.
- Decision actor is immutable historical fact.
- Decision timestamp is immutable historical fact.
- Decision type is immutable historical fact.
- Rejection reason is immutable historical fact for rejected initial decision.
- Later lifecycle transitions must not overwrite initial decision evidence.
- Later edit/cancel rounds may append separate audit evidence.
- R02 does not need a full generic audit-event framework unless existing platform already has one suitable for reuse.
- If existing audit table is reused, ensure event schema can represent order decision without leaking unrelated sensitive fields.
- Audit write must be transactionally coupled to decision.
- Failure before commit leaves neither decision nor audit evidence.
- Conflict attempt should not create a successful decision audit event.
- Optional security log for denied attempts may remain non-durable operational logging.

# 46. Performance Boundaries
- Decision mutation targets one order row.
- Avoid loading all order items merely to decide accept/reject unless product validation requires item-level check.
- R01 already provides item snapshots for display; R02 should not duplicate heavy reads in mutation path without need.
- Branch/order eligibility lookup should use indexed primary/order tenant predicates.
- New decision evidence index should support order lookup if separate table is used.
- New index should not duplicate existing indexes without query-plan evidence.
- Decision transaction should be short-lived.
- No network calls inside transaction.
- No artificial sleeps.
- No broad table locks.
- No queue-wide count inside mutation transaction unless required for return DTO.
- Queue refresh happens after mutation transaction.

# 47. Transaction Boundary
- Authorization context establishment and decision mutation should occur in one authorized transaction.
- Tenant/branch context must be established before mutation.
- Permission must be evaluated through current authorized transaction helper.
- Decision row/order status and audit evidence must commit atomically.
- Customer-status update, if any, must commit atomically with decision.
- No nested independent transaction for decision evidence.
- No route-level DB client outside service transaction.
- Rollback on any invariant failure.
- Rollback on decision evidence insert failure.
- Rollback on customer-status mapping failure.
- Rollback on permission context failure.
- Do not swallow transaction errors and return success.
- After commit, UI may refresh reads.

# 48. Rollback Cases
- Invalid UUID: no transaction mutation.
- Missing reason: no mutation.
- Unknown reason: no mutation.
- No session: no mutation.
- No active branch: no mutation.
- Missing order.manage: no mutation.
- Wrong tenant order: no mutation.
- Wrong branch order: no mutation.
- Already accepted: no mutation.
- Already rejected: no mutation.
- Later lifecycle state: no mutation.
- Decision evidence constraint failure: whole decision rolls back.
- DB unavailable before update: no mutation.
- DB failure after update but before commit: rollback restores original state.
- Client disconnect before response after commit: database decision remains durable; subsequent refresh reconciles.

# 49. Failure Recovery
- Validation failure is corrected by user/client input change.
- Permission failure requires authorization change, not blind retry.
- Not-found/cross-scope failure should not reveal protected row.
- Conflict requires refresh of current durable state.
- Database transient unavailable may be retried manually after refresh.
- Automatic unbounded retries are prohibited.
- Serialization/deadlock errors may be retried in a bounded server policy only if exact mutation remains safe.
- If bounded server retry is used, actor/reason input remains unchanged.
- If outcome is ambiguous to client, refresh detail before offering another action.
- Never reset order status to make retry possible.
- Never delete decision evidence to resolve normal conflict.

# 50. PostgreSQL Error Mapping
- Unique violation on one-decision-per-order evidence should map to conflict when caused by concurrent decision.
- Check violation caused by impossible domain input should map to invariant/validation depending on layer.
- RLS denial must map to forbidden/not-found safe policy.
- Foreign-key violation on actor/order references indicates invariant or concurrent deletion condition, not raw 500 detail.
- Serialization failure may map to bounded retry/unavailable.
- Deadlock detected may map to bounded retry/unavailable.
- Connection failure maps unavailable.
- Raw SQLSTATE must not be returned to browser.
- Constraint names must not be returned to browser.
- Error classifier tests should use representative causes when possible.

# 51. Decision Result DTO
- Stable DTO should include `orderId`.
- Stable DTO should include `orderNumber` when available from mutation row.
- Stable DTO should include `decision`.
- Stable DTO should include resulting operational `status`.
- Stable DTO should include `decidedAt`.
- Stable DTO may include `customerStatus` if safely useful.
- Reject result may include reasonCode.
- Reject result may include normalized note only if internal UI needs to render it immediately.
- DTO must not include tenantId unless current internal API conventions require it.
- DTO must not include branchId unless necessary for client reconciliation; active branch already scopes session.
- DTO must not include actor authorization grants.
- DTO must not include capabilityId.
- DTO must not include idempotency record internals.
- DTO should be readonly/immutable domain shape.

# 52. UI Permission Awareness
- Server is final authorization authority.
- Client may receive capability/permission-derived affordance state through existing safe mechanism.
- Do not expose complete permission graph unnecessarily.
- If UI cannot cheaply know order.manage, it may show action and handle 403, but better UX should hide/disable based on existing permission context when available.
- View-only user must not receive enabled action after known permission state.
- Permission changes while page open can make UI stale; server still denies revoked action.
- Branch switch must recalculate affordances.
- UI must not infer manage permission from role name strings.
- UI must not infer manage permission from being on `/staff`.

# 53. Branch Switching
- Active branch is part of AccessContext.
- Decision request must use current branch context at request time.
- Stale selected order from previous branch must fail scope check after branch switch.
- UI should clear selected order when branch changes.
- UI should clear pending decision modal when branch changes.
- Queue refetch after branch switch must use new context.
- Browser must not send prior branch ID to preserve authority.
- Cross-branch cached detail must not remain actionable.
- Negative integration test should select Branch A order then execute under Branch B context.

# 54. Cross-Tenant Safety
- Tenant comes from AccessContext.
- Order mutation query requires tenant match.
- Decision evidence requires tenant match.
- Actor identity must be valid within current tenant membership context.
- Cross-tenant order UUID is treated as inaccessible.
- Error response must not reveal whether order exists in another tenant.
- RLS must remain tenant-enforcing.
- SECURITY DEFINER function, if used, must explicitly verify trusted tenant context.
- Integration test must create real protected row in Tenant B before attempting from Tenant A.
- Test must prove control context can see protected row so denial is meaningful.

# 55. Cross-Branch Safety
- Branch comes from AccessContext.
- Order mutation query requires branch match.
- Decision evidence branch must match order branch.
- Sibling branch order UUID is inaccessible for mutation without exact authority.
- Same tenant does not weaken branch isolation.
- Error response must avoid branch existence leakage.
- Integration test must use same tenant, two distinct branches.
- Control context for Branch A must prove order exists.
- Branch B context must fail decision.
- Queue read for Branch B must remain unaffected.

# 56. Customer/Staff Separation
- Customer capability path remains `flow_customer_runtime` and customer-specific command architecture.
- Staff decision path uses internal Auth.js + AccessContext.
- Customer cookie alone cannot call internal decision route successfully.
- Staff decision command must not decode customer capability token.
- Staff decision command may read order customer ownership only as data if needed, not authority.
- Customer runtime role must not execute staff decision function.
- Staff runtime must not need customer bearer secret.
- Customer P03 idempotency table must not be reused as staff decision actor evidence.
- Negative tests must verify customer runtime lacks direct/functional decision authority.

# 57. Existing R01 Read Error Compatibility
- R01 `OperationalOrderReadError` remains for read surfaces.
- R02 mutation errors should not break GET error mapping.
- Shared base error is optional only if it reduces duplication cleanly.
- Do not collapse read not-found and mutation conflict into one ambiguous code.
- HTTP helper may be extended with mutation-safe mapper.
- Existing queue tests must remain unchanged/passing unless contract intentionally extends DTO.
- Existing cursor tests must remain valid.
- Existing invalid-filter behavior must remain valid.

# 58. Files to CREATE — Expected
- `apps/web/next-flow/src/modules/order-operations/server/order-decision-service.ts` or equivalent explicit command file.
- `apps/web/next-flow/src/modules/order-operations/server/order-decision-repository.ts` if mutation separation is warranted.
- `apps/web/next-flow/src/modules/order-operations/server/order-decision-types.ts` only if existing types.ts would become overloaded.
- Internal mutation route file under `src/app/api/internal/orders/[id]/...`.
- Unit tests for decision validation/error mapping.
- Integration tests for authorized decisions and concurrency.
- Forward-only Supabase migration if schema/function/grants change.
- pgTAP/database test file for R02 if DB mutation boundary changes.
- Do not create files merely to satisfy this list when existing module structure supports cleaner placement.

# 59. Files to MODIFY — Expected
- `src/modules/order-operations/server/types.ts` for decision DTO/reason enums when appropriate.
- `src/modules/order-operations/server/errors.ts` for mutation error taxonomy when appropriate.
- `src/modules/order-operations/server/http.ts` for mutation request/response helpers where reusable.
- `src/modules/order-operations/server/index.ts` to export server-safe decision APIs.
- `src/modules/order-operations/server/order-queue-repository.ts` only for safe read support after decision if needed.
- `src/modules/order-operations/server/order-queue-service.ts` only for shared mappings/read extensions needed by UI.
- `src/features/staff/operational-orders-workspace.tsx` to wire decision controls.
- `src/features/staff/operational-orders-ui.tsx` if present at latest branch and responsible for pure UI rendering.
- `src/server/db/generated/database.ts` only when schema changes.
- `package.json` only if test discovery currently requires explicit inclusion; do not change dependencies unnecessarily.

# 60. Files to MOVE
- No file move is required by R02.
- Do not move R01 operational module for stylistic cleanup.
- Do not rename queue files merely to broaden them into a generic engine.
- A move is allowed only if exact latest implementation structure proves a necessary module boundary correction.
- Any move must preserve imports and tests.
- Any move must be documented in PR.

# 61. Files to REMOVE
- No existing production file is required to be removed by R02.
- Do not remove R01 GET queue routes.
- Do not remove R01 operational queue workspace.
- Do not remove Phase 03 customer order command code.
- Do not remove legacy non-Orders staff demo tabs merely because they remain demo-backed.
- Remove only dead local demo accept/reject callbacks inside the durable Orders workspace if any remain after latest R01 implementation.
- Dead mutation code must not remain capable of altering demo order state while appearing to control server orders.

# 62. DO-NOT-TOUCH Boundaries
- Do not redesign Auth.js providers.
- Do not redesign AccessContext.
- Do not redesign permission catalog beyond using existing order.manage unless a missing constant is proven.
- Do not change customer capability semantics.
- Do not change P03 customer idempotency behavior.
- Do not change cart persistence.
- Do not change order item pricing snapshots.
- Do not implement kitchen screens.
- Do not implement cashier/payment settlement.
- Do not add realtime transport.
- Do not add notification vendor integration.
- Do not add a generic workflow dependency.
- Do not perform broad Tailwind/UI restyling.
- Do not modernize unrelated packages.

# 63. Database Table Audit Checklist
- Inspect `foodflow.orders` current columns.
- Inspect `foodflow.orders` status check/enum.
- Inspect `foodflow.orders` customer_status check/enum.
- Inspect `foodflow.orders` tenant/branch foreign keys.
- Inspect `foodflow.orders` current indexes.
- Inspect `foodflow.orders` RLS policies.
- Inspect direct grants for flow_runtime.
- Inspect Phase 03 customer runtime grants.
- Inspect current actor/user table key conventions.
- Inspect existing audit/event tables before creating a decision table.
- Inspect generated database.ts current order type.
- Record no-migration decision if existing schema already supports durable decision evidence unexpectedly.

# 64. Status Constraint Audit Checklist
- Confirm `PENDING_CONFIRMATION` is persisted legal value.
- Confirm `ACCEPTED` is persisted legal value.
- Confirm `REJECTED` is persisted legal value.
- Confirm `CHANGED` persisted meaning from current code/docs.
- Confirm customer_status legal values.
- Confirm no trigger auto-advances ACCEPTED to PREPARING.
- Confirm no trigger auto-converts REJECTED to CANCELLED.
- Confirm status update does not violate submission metadata constraints.
- Confirm accepted/rejected states allow existing order_number/submitted_at values.
- Confirm terminal checks do not forbid decision actor fields.

# 65. Permission Audit Checklist
- Confirm exact permission constant for `order.manage`.
- Confirm permission catalog scope supports branch.
- Confirm roles/seed fixtures that should have manage permission.
- Confirm view-only fixture exists or can be created in tests.
- Confirm withAuthorizedAccessTransaction supports order.manage.
- Confirm permission revocation takes effect per transaction.
- Confirm route shell permission does not implicitly grant manage.
- Confirm staff integration tests use real access context.

# 66. Decision Function SQL Contract — If Used
- Function accepts order UUID and bounded decision/reason inputs only.
- Function does not accept tenant UUID from browser-facing route.
- Function relies on trusted transaction-local tenant/branch/actor context or server-only validated context.
- Function checks order tenant equals current tenant.
- Function checks order branch equals current branch.
- Function checks source status eligible.
- Function sets exactly one target status based on bounded decision.
- Function sets actor/timestamp evidence.
- Function sets rejection reason only for reject.
- Function clears no Phase 03 snapshot fields.
- Function returns zero rows on inaccessible/stale order or raises controlled domain SQLSTATE if repository convention supports it.
- Function has fixed `search_path = pg_catalog` or equally safe explicit path.
- Function schema qualification is explicit.
- Function execute grants are narrow.
- Function is covered by pgTAP positive and denial tests.

# 67. Direct UPDATE Contract — If Used
- Update runs only inside `flow_runtime` authorized transaction.
- Query includes tenant_id predicate.
- Query includes branch_id predicate.
- Query includes order id predicate.
- Query includes exact eligible status predicate.
- Update sets fixed target status from server command.
- Update sets server-derived actor ID.
- Update sets server/database timestamp.
- Reject update sets validated reason.
- Accept update does not accidentally retain stale rejection reason from impossible prior state.
- Returning clause provides stable result.
- Zero-row result is classified safely.
- RLS remains active.
- No general repository method exposes arbitrary order updates.

# 68. Reason Persistence Rules
- Accept must not persist a rejection reason.
- Reject must persist exactly one reason code.
- Reject `OTHER` may persist optional note according to policy.
- Non-OTHER reason may allow note only if useful; policy must be explicit.
- Reason code is uppercase stable identifier.
- Reason code length bounded.
- Note length bounded.
- Note nullability explicit.
- No markdown/HTML rendering semantics.
- No PII required by design.
- Reason data remains available to later analytics/reporting.

# 69. UI Status Presentation
- `PENDING_CONFIRMATION` should remain clearly incoming.
- `ACCEPTED` should display accepted state.
- `REJECTED` should display rejected state.
- `CHANGED` presentation follows audited policy.
- UI must not relabel ACCEPTED as PREPARING.
- UI must not relabel REJECTED as CANCELLED unless product copy explicitly distinguishes display text from stored status.
- Status chip mapping should reuse existing style system.
- Color is supplementary, text is authoritative.
- Decision controls only render for eligible source states.

# 70. Queue Filter Interaction
- Default queue uses incoming statuses from R01.
- Accepted order disappears from default incoming result after refresh.
- Rejected order disappears from default incoming result after refresh.
- If user filtered ACCEPTED explicitly, accepted order should be visible after re-fetch.
- If user filtered REJECTED explicitly, rejected order should be visible after re-fetch.
- Mutation must not silently reset user filter unless safest pagination refresh requires it.
- If current filter no longer contains mutated order, selected detail should reconcile gracefully.
- IncomingCount must reflect server count after decision.

# 71. Pagination Interaction
- Decision changes list membership but not submittedAt.
- Existing cursor order remains valid for stable read ordering.
- Client should avoid trying to surgically maintain every paginated page after mutation.
- Prefer re-fetch first page/current filter after decision.
- If selected order was on later page, detail may remain readable after status if filter permits.
- No cursor mutation is required in R02.
- R02 must not change cursor version solely for mutation support.

# 72. Freshness Expectations
- R02 does not implement realtime push.
- Another staff decision may make local queue stale.
- Server exact-status guard handles stale action safely.
- UI conflict response triggers refresh.
- Manual refresh remains supported.
- Optional polling may remain current R01 behavior if already present; do not introduce high-frequency polling solely for R02.
- Realtime belongs later unless exact phase spec authorizes it.

# 73. Security: SQL Injection
- Use Kysely parameter binding or parameterized SQL.
- Never concatenate order UUID into SQL string.
- Never concatenate reason note into SQL string.
- Never interpolate status from arbitrary browser input.
- SECURITY DEFINER functions use typed parameters.
- Dynamic SQL is unnecessary and prohibited unless proven essential.
- Tests for malformed UUID should fail before query when possible.

# 74. Security: XSS
- Rejection note is untrusted text.
- Customer note remains untrusted text.
- Render both through React text escaping.
- Do not use dangerouslySetInnerHTML.
- Do not persist HTML from rejection note.
- Reason labels come from trusted static mapping.
- Error messages sent to UI must be safe static strings/codes.

# 75. Security: Secret Handling
- No new secret required for order decision.
- Do not add environment variable for shared mutation password.
- Do not add API key to browser.
- Do not log AUTH_SECRET.
- Do not log cookies.
- Do not log customer capability token.
- Do not log database URL.
- PR body must not contain secrets.
- Tests use fixtures, not production secrets.

# 76. Security: Mass Assignment
- Strictly parse allowed request fields.
- Reject tenant_id.
- Reject branch_id.
- Reject actor_id.
- Reject decided_at.
- Reject customer_status.
- Reject arbitrary status.
- Reject subtotal/price mutation fields.
- Reject order_number mutation.
- Reject source_cart_id mutation.
- Reject table_id mutation.
- Reject customer_capability_id mutation.
- Domain input should be constructed from validated allowlist.

# 77. Security: Existence Disclosure
- Cross-tenant order ID must not return detailed stale status.
- Cross-branch order ID must not return detailed stale status.
- Only same-scope order may produce a meaningful already-decided conflict with current safe status.
- Repository may need scoped existence check after failed mutation to distinguish inaccessible from stale.
- Scoped existence check stays inside authorized transaction.
- Do not query globally to classify failure.
- Error body must not reveal hidden tenant/branch identifiers.

# 78. Validation Order
- Parse body size/content type.
- Validate allowed fields.
- Validate order UUID.
- Validate decision/reason syntax.
- Resolve internal session/context.
- Verify active branch.
- Enter authorized order.manage transaction.
- Attempt exact scoped transition.
- Classify scoped stale conflict if needed.
- Commit decision evidence.
- Return safe DTO.
- Client refreshes reads.
- This order minimizes unnecessary DB work and avoids authority derived from input.

# 79. Unit Test Matrix — Validation
- valid accept input passes.
- valid reject reason passes.
- reject missing reason fails.
- unknown reason fails.
- oversized note fails.
- whitespace note normalizes as specified.
- invalid UUID fails.
- unknown JSON field fails.
- tenantId field fails.
- branchId field fails.
- actorId field fails.
- status field fails when not part of bounded action schema.
- client decidedAt fails.
- action lowercase/normalization follows explicit contract.

# 80. Unit Test Matrix — Error Mapping
- invalid request -> 400.
- unauthenticated -> existing auth response.
- forbidden -> 403.
- inaccessible order -> safe 404/forbidden policy.
- stale status -> 409.
- invariant violation -> safe 500/409 according to classification without details.
- database unavailable -> safe 503/500 repository-standard unavailable response.
- raw cause is not serialized.
- rejection note is not echoed in error.

# 81. Integration Test Matrix — Acceptance
- correct tenant + branch + order.manage + pending order -> ACCEPTED.
- actor ID persisted from AccessContext.
- decidedAt persisted.
- submittedAt unchanged.
- orderNumber unchanged.
- order items unchanged.
- modifiers unchanged.
- incoming queue no longer includes order after refresh.
- accepted filter includes order where supported.
- decision result DTO matches durable row.
- no kitchen/payment side-effect rows created.

# 82. Integration Test Matrix — Rejection
- correct tenant + branch + order.manage + pending order -> REJECTED.
- actor ID persisted.
- decidedAt persisted.
- reason code persisted.
- note persisted/normalized when allowed.
- submittedAt unchanged.
- order item snapshots unchanged.
- incoming queue excludes order.
- rejected filter includes order where supported.
- no payment/refund side effect created.
- no notification side effect created.

# 83. Integration Test Matrix — Authorization
- no session denied.
- customer capability only denied.
- valid staff without branch denied.
- valid staff with order.view only denied mutation.
- valid staff with operations.staff.access only but no order.manage denied.
- valid staff with order.manage correct branch allowed.
- actor from Tenant A cannot mutate Tenant B order.
- actor from Branch A cannot mutate sibling Branch B order without authority.
- revoked membership denied.
- disabled actor denied where identity model supports it.

# 84. Integration Test Matrix — State Eligibility
- PENDING_CONFIRMATION accept succeeds.
- PENDING_CONFIRMATION reject succeeds.
- ACCEPTED accept fails conflict.
- ACCEPTED reject fails conflict.
- REJECTED accept fails conflict.
- REJECTED reject fails conflict.
- PREPARING decision fails.
- READY decision fails.
- SERVED decision fails.
- PAYMENT_PENDING decision fails.
- PAID decision fails.
- CLOSED decision fails.
- CANCELLED decision fails.
- REMAKE decision fails.
- VOIDED decision fails.
- CHANGED behavior matches documented audited policy.

# 85. Concurrency Test Matrix
- simultaneous accept/accept -> one decision evidence only.
- simultaneous reject/reject -> one decision evidence only.
- simultaneous accept/reject -> one winner only.
- simultaneous reject/accept -> one winner only.
- loser receives stable conflict/unavailable only as designed.
- decidedAt remains winner timestamp.
- actor remains winner actor.
- rejection reason exists only if reject wins.
- no duplicate audit rows.
- queue after race shows one final status.
- transaction locks release after completion.

# 86. Database Test Matrix
- status transition function/direct role can accept eligible own-branch order.
- can reject eligible own-branch order.
- cannot decide cross-tenant order.
- cannot decide sibling-branch order.
- customer runtime cannot decide.
- customer-entry role cannot decide.
- anon cannot decide.
- authenticated public role cannot decide.
- wrong source status cannot decide.
- arbitrary target status cannot be injected.
- spoof actor cannot be injected.
- reason constraint enforced.
- one-decision uniqueness enforced if decision table used.
- RLS still protects read/write as expected.

# 87. Regression Test Matrix — R01
- queue list still works.
- detail still works.
- cursor encode/decode still works.
- invalid filters still fail.
- branch-scoped read still enforced.
- order.view still sufficient for reads.
- view-only staff can still inspect but cannot mutate.
- queue default statuses remain intentional.
- source mapping remains unchanged.
- ordering mode mapping remains unchanged.
- Orders workspace still server-backed.
- no demo state becomes authoritative again.

# 88. Regression Test Matrix — Phase 03
- customer can still submit order.
- submitted order still begins in PENDING_CONFIRMATION.
- customer idempotent replay still returns original order.
- cart-to-order uniqueness remains.
- order snapshots remain durable.
- customer runtime cannot perform staff decision.
- P03 RLS remains.
- P03 submission function remains executable by customer runtime as before.
- decision migration does not break fresh customer order creation.

# 89. Failure Injection Tests
- DB unavailable before transaction -> safe unavailable, no mutation.
- injected failure after status update but before evidence write -> rollback.
- injected failure after evidence write but before commit -> rollback.
- constraint failure -> rollback.
- permission lookup unavailable -> no mutation.
- client request abort after server commit -> refresh shows durable decision.
- stale client conflict -> refresh shows winner.
- malformed database stored status -> invariant failure, no unsafe mutation.

# 90. Browser E2E Acceptance Path
- sign in as authorized staff.
- select branch with incoming order.
- open staff Orders workspace.
- verify durable submitted order visible.
- open detail.
- click Accept.
- wait for server confirmation.
- verify incoming card removed or status changed according to filter.
- refresh page.
- verify ACCEPTED persists.
- sign in/role as view-only staff.
- verify decision control absent/disabled or server denial behavior.
- repeat rejection flow with required reason.
- refresh and verify REJECTED persists.
- E2E must not depend on demo state mutation.

# 91. Cross-Branch E2E/Integration Scenario
```text
Tenant A
Branch A1 order = PENDING_CONFIRMATION
Staff context = Branch A2
Action = ACCEPT
Expected = denied/not found, A1 order unchanged
```
- Protected order must be proven to exist under A1 control context.
- A2 queue must not contain A1 order.
- A2 decision route must not expose A1 status.

# 92. Cross-Tenant Scenario
```text
Tenant B order = PENDING_CONFIRMATION
Staff context = Tenant A / valid branch
Action = REJECT
Expected = denied/not found, Tenant B order unchanged
```
- Control query under Tenant B proves row exists.
- Tenant A response does not disclose Tenant B reason/status metadata.

# 93. View-Only Permission Scenario
```text
valid internal session
+ active branch
+ operations.staff.access
+ order.view
- order.manage
→ queue/detail readable
→ accept/reject forbidden
```
- This distinction is mandatory acceptance evidence.

# 94. Concurrent Decision Scenario
```text
same order PENDING_CONFIRMATION
Actor A -> ACCEPT
Actor B -> REJECT
concurrently
→ exactly one transaction commits
→ exactly one actor/reason/timestamp evidence set
→ loser receives conflict
```
- No final state outside ACCEPTED/REJECTED.

# 95. Stale UI Scenario
```text
staff loads incoming order
other staff accepts it
first staff clicks Reject from stale UI
→ server rejects stale transition
→ UI refreshes
→ durable status remains ACCEPTED
```
- Rejection reason from losing request is not persisted.

# 96. Same-Action Retry Scenario
```text
staff accepts order
response lost after commit
staff retries accept
→ no second decision record
→ no changed timestamp
→ stable conflict/reconciliation path
```
- UI can recover through GET detail/queue.

# 97. Database Fresh Reset Validation
- Supabase/local database can reset from all migrations.
- R02 migration applies after P03 migrations cleanly.
- R02 migration does not require manual data patch.
- pgTAP R01 tests remain valid.
- pgTAP R02 tests pass.
- generated types match schema when applicable.
- no migration order dependency on unmerged implementation PR metadata.

# 98. Validation Commands — Repository-Aware
- Use commands that actually exist in `apps/web/next-flow/package.json` and repository scripts.
- Run install/dependency integrity according to current workflow.
- Run lint.
- Run TypeScript typecheck.
- Run unit tests.
- Run integration tests.
- Run Next.js build.
- Run Supabase fresh/reset path when DB changes.
- Run database SQL/pgTAP tests when DB changes.
- Run database lint when configured.
- Run generated type drift check when schema changes.
- Run relevant E2E when environment supports it.
- Record truthful PASS/FAIL/NOT RUN/BLOCKED/NOT APPLICABLE.
- Do not weaken CI to make implementation green.

# 99. Implementation Order — Step 1 Audit
- Re-read current main exact R02 spec.
- Identify latest R01 implementation branch/head.
- Re-read R01 order operations module.
- Re-read current permission constants.
- Re-read current order schema/migrations.
- Re-read current RLS/grants.
- Re-read R01 integration fixtures.
- Confirm `CHANGED` decision policy.
- Confirm customer_status legal values.
- Decide minimal persistence shape for decision evidence.

# 100. Implementation Order — Step 2 Database Contract
- Add migration only if needed.
- Add decision evidence columns/table.
- Add constraints.
- Add narrow mutation function/grants if chosen.
- Preserve RLS.
- Update generated types.
- Add DB tests before route/UI work where practical.
- Prove cross-tenant/cross-branch denial.
- Prove concurrent exact-state safety.

# 101. Implementation Order — Step 3 Domain Layer
- Add reason enum/type.
- Add decision input/result types.
- Add validation helpers.
- Add mutation repository.
- Add decision service/commands.
- Add typed errors.
- Add error mapping tests.
- Reuse authorized transaction helper.
- Keep target statuses fixed in server code.

# 102. Implementation Order — Step 4 Transport
- Add internal mutation route.
- Add strict body parsing.
- Add same-origin/CSRF enforcement.
- Map auth/permission/domain errors.
- Return stable result DTO.
- Add route integration tests.
- Prove route has no direct SQL mutation.

# 103. Implementation Order — Step 5 UI
- Wire action controls into operational Orders workspace.
- Add reject reason UX.
- Add per-order pending state.
- Add success reconciliation.
- Add conflict reconciliation.
- Add forbidden/unavailable handling.
- Preserve server-backed read authority.
- Preserve unrelated staff tabs.
- Avoid broad redesign.

# 104. Implementation Order — Step 6 Regression
- Run R01 queue tests.
- Run R02 decision tests.
- Run Phase 03 customer order regressions.
- Run auth/authorization regressions.
- Run build/type/lint.
- Run DB reset/tests if schema changed.
- Run E2E when available.
- Document any truthful blockers.

# 105. Definition of Done — Database
- [ ] exact eligible source status enforced at mutation source of truth.
- [ ] ACCEPTED target fixed server-side.
- [ ] REJECTED target fixed server-side.
- [ ] actor evidence durable.
- [ ] decision timestamp durable.
- [ ] rejection reason durable.
- [ ] tenant isolation preserved.
- [ ] branch isolation preserved.
- [ ] customer runtime denied staff decision.
- [ ] migration forward-only if required.
- [ ] generated types aligned if schema changed.
- [ ] concurrency allows one winner only.

# 106. Definition of Done — Backend
- [ ] explicit accept command exists.
- [ ] explicit reject command exists.
- [ ] order.manage required.
- [ ] active branch required.
- [ ] browser authority fields rejected.
- [ ] strict validation implemented.
- [ ] deterministic error taxonomy implemented.
- [ ] transaction-bound mutation implemented.
- [ ] no external side effects inside transaction.
- [ ] safe result DTO returned.
- [ ] R01 read module preserved.

# 107. Definition of Done — Frontend
- [ ] server durable queue remains authority.
- [ ] Accept action wired to server command.
- [ ] Reject action wired to server command.
- [ ] reject reason required.
- [ ] pending state implemented.
- [ ] conflict state implemented.
- [ ] forbidden state implemented.
- [ ] unavailable state implemented.
- [ ] successful decision reconciles queue/detail.
- [ ] no arbitrary status selector.
- [ ] no demo-state decision authority.
- [ ] accessible controls preserved.

# 108. Definition of Done — Security
- [ ] Auth.js internal session required.
- [ ] AccessContext current branch required.
- [ ] order.manage enforced server-side.
- [ ] tenant predicate enforced.
- [ ] branch predicate enforced.
- [ ] actor server-derived.
- [ ] target status server-derived.
- [ ] CSRF/origin protections applied.
- [ ] SQL parameterization preserved.
- [ ] untrusted text safely rendered.
- [ ] secret/bearer material not logged/exposed.
- [ ] customer roles cannot decide.

# 109. Definition of Done — Tests
- [ ] validation unit tests.
- [ ] error mapping unit tests.
- [ ] authorized accept integration test.
- [ ] authorized reject integration test.
- [ ] view-only denial test.
- [ ] cross-tenant denial test.
- [ ] cross-branch denial test.
- [ ] customer-role denial test.
- [ ] stale state conflict test.
- [ ] accept/reject concurrency race test.
- [ ] rollback failure test.
- [ ] R01 queue regression.
- [ ] Phase 03 submission regression.
- [ ] database/pgTAP tests when DB boundary changes.

# 110. Definition of Done — Scope Discipline
- [ ] no PREPARING transition implemented.
- [ ] no READY transition implemented.
- [ ] no SERVED transition implemented.
- [ ] no payment transition implemented.
- [ ] no kitchen ticket implementation.
- [ ] no realtime publication.
- [ ] no notification delivery.
- [ ] no order edit workflow.
- [ ] no cancellation/refund workflow.
- [ ] no priority/delay/remake workflow.
- [ ] no broad dependency churn.
- [ ] no unrelated UI redesign.

# 111. PR Requirements
- PR must reference `FLOW_P04_R02_IMPLEMENTATION_SPEC.md` from current main.
- PR must record implementation parent branch and SHA.
- PR must record implementation head SHA.
- PR must record exact `CHANGED` decision policy.
- PR must record customer_status mapping decision.
- PR must record database persistence strategy.
- PR must record migration/no-migration reasoning.
- PR must record authorization path.
- PR must record concurrency strategy.
- PR must record reason taxonomy.
- PR must record actual validation results.
- PR must record deferred R03/R04/R05 work.
- PR remains owner-controlled.
- Implementation agent must not merge it.
- Implementation agent must not enable auto-merge.

# 112. PR Evidence — Database
- List migration file when created.
- List generated type change when created.
- Describe order status predicate.
- Describe actor/timestamp/reason persistence.
- Describe RLS/grant changes.
- Describe SECURITY DEFINER function if used.
- Include fresh reset result when applicable.
- Include pgTAP results when applicable.
- Include cross-scope denial evidence.
- Include concurrency evidence.

# 113. PR Evidence — Backend
- List command/service files.
- List mutation route files.
- Describe request validation.
- Describe permission enforcement.
- Describe error mapping.
- Describe read-after-write reconciliation contract.
- Confirm no direct route SQL.
- Confirm no arbitrary target-status input.
- Confirm no external side effects.

# 114. PR Evidence — UI
- Show Orders workspace still uses durable R01 queue.
- Show Accept action.
- Show Reject reason flow.
- Show pending state.
- Show stale conflict behavior.
- Show view-only behavior.
- Confirm unrelated staff tabs unchanged except unavoidable shared component adjustments.
- Confirm no demo-state mutation authority returned.

# 115. Known Expected Limitations After R02
- Accepted order does not automatically enter PREPARING.
- Rejected order does not automatically trigger refund.
- No kitchen ticket is created.
- No realtime push is guaranteed.
- No customer notification is sent.
- Customer-facing status mapping may remain limited if current schema lacks canonical values.
- Staff cannot perform generalized lifecycle transitions yet.
- Staff cannot edit/cancel through new durable exception workflow yet.
- Staff cannot apply priority/delay/remake controls yet.
- These are deliberate phase boundaries, not R02 defects.

# 116. R03 Handoff Requirements
- R03 inherits R01 durable queue/detail read plane.
- R03 inherits R02 authorized mutation architecture.
- R03 inherits trusted operational context.
- R03 inherits decision actor evidence.
- R03 inherits decision timestamp evidence.
- R03 inherits rejection reason evidence.
- R03 inherits exact concurrency primitive used for order row mutation.
- R03 can build legal lifecycle transitions from ACCEPTED onward without re-solving initial decision authority.
- R03 must not recreate a parallel permission path.
- R03 must not erase R02 initial decision provenance.
- R03 should generalize only transition behavior actually required by lifecycle statuses.

# 117. R03 Expected Starting State
- Incoming customer order can be listed by authorized staff.
- Incoming customer order can be inspected.
- Authorized manager/staff with order.manage can accept it.
- Authorized manager/staff with order.manage can reject it with reason.
- Decision persists across refresh.
- Competing decisions are deterministic.
- View-only staff remains read-only.
- Cross-tenant/branch decision is denied.
- Accepted order remains durable status ACCEPTED waiting for later lifecycle transition.
- Rejected order remains durable status REJECTED.

# 118. R03 Must Not Assume
- R03 must not assume kitchen dispatch exists.
- R03 must not assume realtime exists.
- R03 must not assume payment exists.
- R03 must not assume notifications exist.
- R03 must inspect actual R02 branch implementation before authoring exact lifecycle spec.
- R03 must not rely solely on this handoff prose if implementation materially differs.

# 119. Acceptance Example — Successful Accept
```text
Customer order status = PENDING_CONFIRMATION
Authorized staff context = same tenant + branch + order.manage
Action = ACCEPT
→ one authorized transaction
→ order status = ACCEPTED
→ actor + decided_at persisted
→ queue refresh removes it from default incoming set
→ no kitchen/payment/realtime side effect
```

# 120. Acceptance Example — Successful Reject
```text
Customer order status = PENDING_CONFIRMATION
Authorized staff context = same tenant + branch + order.manage
Action = REJECT(reason=ITEM_UNAVAILABLE)
→ one authorized transaction
→ order status = REJECTED
→ actor + decided_at + reason persisted
→ queue refresh removes it from default incoming set
→ no refund/notification side effect
```

# 121. Acceptance Example — View-Only Staff
```text
valid internal staff
+ active branch
+ order.view
- order.manage
→ GET queue = allowed
→ GET detail = allowed
→ POST decision = forbidden
```

# 122. Acceptance Example — Stale Decision
```text
Order initially PENDING_CONFIRMATION
Actor A accepts first
Actor B submits reject from stale UI
→ B transaction finds no eligible source row
→ B receives conflict
→ actor/reason evidence from A remains unchanged
→ B UI refreshes to ACCEPTED
```

# 123. Acceptance Example — Cross-Branch
```text
Tenant A / Branch A1 order
Tenant A / Branch A2 actor with order.manage only in A2
→ decision denied/not found
→ A1 order remains unchanged
```

# 124. Acceptance Example — Customer Capability
```text
valid customer capability cookie
no internal Auth.js staff session
→ internal decision endpoint denied
```
- Customer authority cannot escalate into staff orchestration.

# 125. Validation Result Vocabulary
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- Implementation PR must use these exact truthful states.
- Do not report unrun validation as PASS.
- Do not hide failed checks.
- Do not weaken checks.
- Do not change workflows solely to bypass a failure.

# 126. Document Validation Policy
- This specification is validated by content and repository state.
- GitHub Actions are not the documentation validation authority.
- Metadata must be correct.
- Previous/Next sequence must be correct.
- R01 code assumptions must match inspected branch evidence.
- Scope must stay within R02.
- Security boundaries must be explicit.
- Failure/recovery paths must be explicit.
- Migration strategy must be explicit.
- Test plan must be implementation-specific.
- Handoff to R03 must be explicit.
- Final line count must be 1,800–2,500 inclusive.
- Documentation PR may merge when document is valid and GitHub technically permits it.

# 127. Implementation Validation Policy
- Future R02 implementation must run actual applicable repository checks.
- This source audit is not runtime proof.
- Required validation failures remain truthful implementation blockers.
- Required checks must not be renamed/weakened/suppressed.
- Implementation PR remains owner-controlled.
- Spec automation does not merge implementation PR.

# 128. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This spec authorizes only P04/R02 implementation after it is on main.
- Future implementation must branch from latest legitimate P04/R01 implementation lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.

# 129. Required Next Specification
```text
FLOW_P04_R03_IMPLEMENTATION_SPEC.md
```
- R03 specification must be authored from actual R02 implementation branch state.
- R03 must inspect exact mutation primitives, schema, tests, and decision evidence.
- R03 must not be authored solely from intended R02 design if implementation diverges.
- No R03 implementation starts until exact R03 spec exists on current main with READY status.

# 130. Final Acceptance Statement
- P04/R02 is READY as an executable specification document when merged to main.
- R02 adds the first durable internal order-control mutation on top of the R01 read plane.
- R02 preserves Phase 03 customer order source-of-truth and snapshots.
- R02 preserves Phase 02 internal identity/authorization boundaries.
- R02 makes accept/reject decisions actor-attributed, branch-scoped, durable, and race-safe.
- R02 prevents arbitrary status mutation and defers broader lifecycle orchestration to R03.
- R02 does not implement kitchen execution, payments, realtime, notifications, edit/cancel exceptions, priority/delay/remake, or Phase 04 acceptance.
