# FLOW P04 R06 — Implementation Specification
> Phase 04 — Order Orchestration & Control
> Round 06 — Integrated Phase Acceptance, Regression Closure, and Phase 05 Handoff
> Revision — Prove the complete server-authoritative staff order-control plane assembled across R01–R05, record durable acceptance evidence, close only reproduced Phase 04 acceptance defects, and hand off to Phase 05 without implementing Phase 05 features.

## Metadata
- Phase: `04`
- Round: `06`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P04_R05_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P05_R01_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P04 implementation slot after this specification is on main`
- Current planning scope: `PHASE 04 / ROUND 06 ONLY`
- Implementation parent: `latest completed P04/R05 implementation lineage tip`
- Expected implementation parent branch: `p04-r05-production-controls`
- Observed R05 branch head at authoring: `be17101b31f0add0874a72df3644859ccc71f2e2`
- Observed R05 implementation state: `MEANINGFUL IMPLEMENTATION / SUFFICIENT HANDOFF FOR R06 SPEC`
- Observed R05 diff from R04 lineage: `23 commits ahead`
- Recommended implementation branch: `p04-r06-phase-acceptance`
- Recommended implementation PR title: `test(operations): prove Phase 04 order-control acceptance`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- New Phase 04 business feature in this round: `NO`
- Integrated R01–R05 acceptance in this round: `YES`
- Durable Phase 04 acceptance record in this round: `YES`
- Acceptance-blocking defect fixes in this round: `ONLY WHEN REPRODUCED AND REQUIRED TO PROVE EXISTING P04 INVARIANTS`
- New kitchen execution in this round: `NO`
- New payment execution in this round: `NO`
- New realtime publication in this round: `NO`
- New notification delivery in this round: `NO`
- Phase 05 implementation in this round: `NO`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` authority SHA at authoring is `4b3dbc62b9657ca164836812a5338c04d097ef92`.
- Current `main` contains `FLOW_P04_R05_IMPLEMENTATION_SPEC.md` with `Status: READY`.
- Current R05 specification names this exact file as `Next`.
- Current `main` policy separates specification authority from implementation lineage.
- Current `main` policy keeps owner control over implementation PR merge.
- Current `main` does not contain this R06 specification before authoring.
- No `p04-r06-*` implementation branch was observed before authoring.
- No duplicate R06 docs branch was observed before authoring.
- No duplicate R06 docs PR was observed before authoring.
- Latest relevant implementation branch is `p04-r05-production-controls`.
- Observed R05 head is `be17101b31f0add0874a72df3644859ccc71f2e2`.
- R05 is 23 commits ahead of the observed R04 implementation lineage.
- R05 adds `order-production-control-service.ts`.
- R05 adds `order-production-control-repository.ts`.
- R05 adds an internal production-control route.
- R05 adds durable priority metadata.
- R05 adds durable defer metadata.
- R05 adds bounded remake metadata.
- R05 adds priority/defer/remake event evidence.
- R05 adds queue ordering changes for priority/defer semantics.
- R05 adds generated database type changes.
- R05 adds a forward migration.
- R05 adds unit coverage.
- R05 adds integration coverage.
- R05 adds database boundary coverage.
- R05 blocks normal lifecycle while actively deferred.
- R05 allows explicit resume before lifecycle progression.
- R05 routes eligible READY work through REMAKE and back to PREPARING.
- R05 bounds remake count.
- R05 keeps `order.manage` as mutation permission.
- R05 keeps tenant/branch/actor server-derived.
- R05 keeps client action vocabulary closed.
- R05 keeps payment execution out of scope.
- R05 keeps kitchen execution out of scope.
- R05 keeps realtime publication out of scope.
- R05 keeps notifications out of scope.
- This R06 task is documentation/specification only.
- This R06 authoring task does not create the R06 implementation branch.
- This R06 authoring task does not modify runtime code.
- This R06 authoring task does not modify migrations.
- This R06 authoring task does not modify workflow files.
- This R06 authoring task does not merge implementation PRs.
- This R06 authoring task does not enable implementation auto-merge.

# 2. Phase 04 Objective
- Phase 04 establishes a durable staff-side operational order-control plane after customer submission.
- The phase must preserve the Phase 03 order aggregate as durable source of truth.
- The phase must separate staff read authority from staff mutation authority.
- The phase must preserve tenant isolation.
- The phase must preserve branch isolation.
- The phase must derive actor identity from authenticated internal context.
- The phase must never trust browser tenant identity.
- The phase must never trust browser branch identity.
- The phase must never trust browser actor identity.
- The phase must never accept arbitrary browser-selected target status.
- The phase must use explicit command vocabularies.
- The phase must make successful staff mutations auditable.
- The phase must keep durable order events append-oriented.
- The phase must provide deterministic stale-state conflict behavior.
- The phase must provide one-winner behavior under competing staff actions.
- The phase must preserve transactional rollback when evidence writes fail.
- The phase must keep staff UI as a projection of server state.
- The phase must not silently couple order control to payment execution.
- The phase must not silently couple order control to kitchen execution.
- The phase must not silently couple order control to realtime delivery.
- The phase must not silently couple order control to notification delivery.
- The phase must end with evidence strong enough to authorize the next phase specification.

# 3. Six-Round Phase 04 Acceptance Chain
- R01 owns durable staff operational queue reads.
- R01 owns durable order detail reads.
- R01 owns branch-scoped `order.view` authorization.
- R01 removes client demo order state as authority for staff Orders.
- R02 owns initial explicit accept/reject decisions.
- R02 owns branch-scoped `order.manage` mutation authorization.
- R02 owns initial decision actor/time/reason evidence.
- R02 owns deterministic competing initial-decision behavior.
- R03 owns the canonical normal lifecycle.
- R03 owns `ACCEPTED -> PREPARING -> READY -> SERVED`.
- R03 owns normal lifecycle actor/time/event evidence.
- R03 owns exact source-state transition guards.
- R04 owns bounded accepted-order amendment.
- R04 owns `ACCEPTED -> CHANGED` review gating.
- R04 owns CHANGED re-review through the decision plane.
- R04 owns reasoned cancellation.
- R04 owns snapshot-based amendment money recalculation.
- R04 owns restrictive branch RLS hardening for aggregate/child/event mutation surfaces.
- R05 owns priority set/clear controls.
- R05 owns defer/resume controls.
- R05 owns bounded remake request/start controls.
- R05 owns deterministic queue ranking changes required by production controls.
- R05 owns durable current control metadata and historical event evidence.
- R06 owns integrated acceptance only.
- R06 must not redefine R01–R05 contracts merely for convenience.
- R06 may fix only reproduced defects that block proving those existing contracts.

# 4. Round 06 Objective
- Assemble an executable acceptance suite over the real R01–R05 server/database path.
- Prove the staff order queue is durable and branch-scoped.
- Prove initial decisions are authorized and deterministic.
- Prove the normal lifecycle is legal-state constrained.
- Prove amendment/re-review/cancellation exception semantics.
- Prove priority/defer/remake production controls.
- Prove shared security boundaries across all mutation planes.
- Prove shared rollback boundaries across all mutation planes.
- Prove shared concurrency behavior across competing commands.
- Prove queue/detail projections reconcile with durable state.
- Prove current migrations bootstrap cleanly from zero.
- Prove generated database types match the migrated schema.
- Prove no customer/public role gained internal staff authority.
- Prove no implementation path requires client-supplied tenant/branch/actor authority.
- Create durable `FLOW_P04_ACCEPTANCE.md` evidence.
- Record exact implementation lineage and test evidence.
- Record truthful NOT RUN/BLOCKED items instead of fabricating success.
- Close only acceptance-blocking defects that are directly within established P04 scope.
- Produce a fail-closed Phase 05 handoff.
- Do not implement Phase 05 features.

# 5. Preconditions
- [ ] This exact R06 spec exists on current `main` before implementation starts.
- [ ] This exact R06 spec remains `READY`.
- [ ] `Previous` is exactly `FLOW_P04_R05_IMPLEMENTATION_SPEC.md`.
- [ ] `Next` is exactly `FLOW_P05_R01_IMPLEMENTATION_SPEC.md`.
- [ ] Current `FLOW_MERGE_POLICY.md` is re-read from main.
- [ ] Current development-phase README is re-read from main.
- [ ] Current applicable CONTRIBUTING instructions are re-read.
- [ ] Applicable AGENTS instructions are re-read if present.
- [ ] Latest legitimate R05 implementation branch is identified.
- [ ] R06 branch descends from latest legitimate R05 lineage.
- [ ] R01–R05 implementation source files are inspected before acceptance tests are authored.
- [ ] Current database migration set is inspected before acceptance fixtures are authored.
- [ ] Current permission/RLS contracts are inspected before negative authorization acceptance is authored.
- [ ] No destructive production migration is required.
- [ ] No Phase 05 feature is required to prove Phase 04.

# 6. Explicit Non-Goals
- Do not add new order workflow states merely to satisfy acceptance tests.
- Do not add generic order mutation APIs.
- Do not redesign R01 queue architecture.
- Do not redesign R02 decision architecture.
- Do not redesign R03 lifecycle architecture.
- Do not redesign R04 exception architecture.
- Do not redesign R05 production-control architecture.
- Do not add new payment behavior.
- Do not add refunds.
- Do not add payment void execution.
- Do not add kitchen tickets.
- Do not add kitchen routing.
- Do not add realtime event transport.
- Do not add notification delivery.
- Do not add generic outbox infrastructure.
- Do not add generic staff request replay storage.
- Do not add customer-facing priority controls.
- Do not add customer-facing defer controls.
- Do not add customer-facing remake controls.
- Do not broaden permission grants.
- Do not weaken RLS to make tests easier.
- Do not weaken request validation to make tests easier.
- Do not relax source-state guards to make tests pass.
- Do not suppress concurrency failures.
- Do not rewrite historical migrations.
- Do not merge implementation PRs.
- Do not implement Phase 05.

# 7. Acceptance Deliverables
- Required executable integration acceptance suite.
- Required targeted browser/HTTP acceptance where deterministic infrastructure exists.
- Required database pgTAP/regression acceptance coverage.
- Required durable `FLOW_P04_ACCEPTANCE.md` record.
- Required exact lineage record from R01 through R06.
- Required validation result table using only approved result vocabulary.
- Required known-limitations section.
- Required deferred-scope section.
- Required Phase 05 fail-closed handoff section.
- Optional minimal defect fixes only when reproduced by acceptance.

# 8. Required Acceptance Record Path
```text
docs/07-delivery/development-phases/FLOW_P04_ACCEPTANCE.md
```
- This file is implementation evidence, not the executable specification.
- It is created on the R06 implementation branch.
- It must record observed evidence only.
- It must not claim browser execution if browser tests were not run.
- It must not claim production deployment validation if not observed.
- It must not contain secrets.
- It must not contain customer capability tokens.
- It must not contain database passwords.
- It must not contain session cookies.
- It must not contain production personal data.

# 9. Existing R01 Read Plane to Accept
- `order-queue-repository.ts` remains durable queue query authority.
- `order-queue-service.ts` remains authorized queue/detail orchestration.
- Internal order list route remains a no-store server read surface.
- Internal order detail route remains a no-store server read surface.
- Staff Orders workspace remains server-backed.
- `order.view` remains required for reads.
- Tenant is derived from AccessContext.
- Branch is derived from AccessContext.
- Queue item selectors do not establish tenant/branch authority.
- Detail order UUID is selector only.
- Queue pagination remains deterministic.
- Queue filters remain bounded.
- Order detail returns persisted item snapshots.
- Order detail returns persisted modifier snapshots.
- Customer capability identifiers remain hidden from operational DTOs.
- Customer replay/idempotency material remains hidden from operational DTOs.

# 10. R01 Queue Acceptance Matrix
- [ ] Staff with `order.view` sees only current tenant/current branch orders.
- [ ] Staff with `order.view` does not see sibling-branch orders.
- [ ] Staff with `order.view` does not see cross-tenant orders.
- [ ] Staff without `order.view` cannot list operational orders.
- [ ] Staff without `order.view` cannot load order detail.
- [ ] Customer session cannot authenticate the staff order list route.
- [ ] Customer session cannot authenticate the staff order detail route.
- [ ] Unknown order UUID yields safe not-found behavior.
- [ ] Sibling-branch UUID does not reveal resource existence.
- [ ] Cross-tenant UUID does not reveal resource existence.
- [ ] Queue list is no-store.
- [ ] Detail response is no-store.
- [ ] Queue rows use durable order status.
- [ ] Queue rows use durable subtotal/currency.
- [ ] Queue detail uses durable item names.
- [ ] Queue detail uses durable price snapshots.
- [ ] Queue detail uses durable modifier snapshots.
- [ ] Client demo order state does not override server queue state.
- [ ] Client demo order state does not override server detail state.
- [ ] Empty branch queue returns a stable empty page.
- [ ] Invalid queue filter is rejected.
- [ ] Invalid cursor is rejected.
- [ ] Cursor cannot encode tenant authority.
- [ ] Cursor cannot encode branch authority.
- [ ] Pagination does not duplicate rows across adjacent pages under stable data.
- [ ] Pagination does not omit rows across adjacent pages under stable data.

# 11. R02 Decision Plane to Accept
- Initial decision route accepts only explicit ACCEPT/REJECT intent.
- Initial source status remains `PENDING_CONFIRMATION`.
- CHANGED re-review source added by R04 is explicit and bounded.
- `order.manage` remains required.
- Decision actor remains server-derived.
- Decision timestamp remains database-derived.
- Rejection reason remains bounded.
- Accept target remains server-selected.
- Reject target remains server-selected.
- Decision events remain append-only evidence.
- Competing decisions remain one-winner.

# 12. Initial Decision Acceptance Matrix
- [ ] PENDING_CONFIRMATION accept succeeds.
- [ ] PENDING_CONFIRMATION reject succeeds.
- [ ] Accept sets operational status ACCEPTED.
- [ ] Accept sets valid customer status.
- [ ] Reject sets operational status REJECTED.
- [ ] Reject sets valid customer status.
- [ ] Accept records actor from AccessContext.
- [ ] Reject records actor from AccessContext.
- [ ] Accept records database timestamp.
- [ ] Reject records database timestamp.
- [ ] Reject requires bounded reason code.
- [ ] Accept rejects unexpected reason field.
- [ ] Reject rejects unknown reason code.
- [ ] Browser-supplied tenant is rejected.
- [ ] Browser-supplied branch is rejected.
- [ ] Browser-supplied actor is rejected.
- [ ] Browser-supplied target status is rejected.
- [ ] Browser-supplied timestamp is rejected.
- [ ] order.view without order.manage cannot accept.
- [ ] order.view without order.manage cannot reject.
- [ ] sibling-branch selector is inaccessible.
- [ ] cross-tenant selector is inaccessible.
- [ ] accept-vs-reject race has one successful outcome.
- [ ] accept-vs-accept race has one successful outcome.
- [ ] reject-vs-reject race has one successful outcome.
- [ ] losing decision does not overwrite winning actor.
- [ ] losing decision does not overwrite winning timestamp.
- [ ] losing decision does not append duplicate success evidence.
- [ ] event-write failure rolls aggregate decision back.

# 13. R03 Normal Lifecycle to Accept
- Canonical path is ACCEPTED -> PREPARING -> READY -> SERVED.
- START_PREPARING owns ACCEPTED -> PREPARING.
- MARK_READY owns PREPARING -> READY.
- MARK_SERVED owns READY -> SERVED.
- Browser does not choose target status.
- Browser does not choose customer status.
- Browser does not choose transition timestamp.
- Each transition requires `order.manage`.
- Each transition includes exact source-status predicate.
- Each successful transition appends event evidence.
- Each transition is transaction-bound with its evidence.

# 14. Normal Lifecycle Acceptance Matrix
- [ ] ACCEPTED START_PREPARING succeeds.
- [ ] PREPARING MARK_READY succeeds.
- [ ] READY MARK_SERVED succeeds.
- [ ] Full ACCEPTED -> PREPARING -> READY -> SERVED chain succeeds.
- [ ] START_PREPARING from PENDING_CONFIRMATION conflicts.
- [ ] START_PREPARING from CHANGED conflicts.
- [ ] START_PREPARING from PREPARING conflicts.
- [ ] START_PREPARING from READY conflicts.
- [ ] START_PREPARING from SERVED conflicts.
- [ ] MARK_READY from ACCEPTED conflicts.
- [ ] MARK_READY from READY conflicts.
- [ ] MARK_READY from SERVED conflicts.
- [ ] MARK_SERVED from ACCEPTED conflicts.
- [ ] MARK_SERVED from PREPARING conflicts.
- [ ] MARK_SERVED from SERVED conflicts.
- [ ] CANCELLED cannot enter normal lifecycle.
- [ ] REJECTED cannot enter normal lifecycle.
- [ ] CLOSED cannot enter normal lifecycle.
- [ ] VOIDED cannot enter normal lifecycle.
- [ ] PREPARING event from_status is ACCEPTED.
- [ ] PREPARING event to_status is PREPARING.
- [ ] READY event from_status is PREPARING.
- [ ] READY event to_status is READY.
- [ ] SERVED event from_status is READY.
- [ ] SERVED event to_status is SERVED.
- [ ] Lifecycle actor equals authenticated staff actor.
- [ ] Lifecycle timestamp is database-derived.
- [ ] Concurrent duplicate lifecycle action has one winner.
- [ ] Event-write failure rolls lifecycle state back.

# 15. R04 Amendment Plane to Accept
- Amendment source is ACCEPTED only.
- Amendment is bounded, not generic patch.
- Customer note may be replaced/cleared within bound.
- Existing item quantity may change within bound.
- Existing item special request may change within bound.
- Existing item may be removed while retaining at least one line.
- New item addition remains prohibited.
- Menu identity replacement remains prohibited.
- Price replacement remains prohibited.
- Modifier replacement remains prohibited.
- Currency replacement remains prohibited.
- Tenant/branch/table reassignment remains prohibited.
- Money is recomputed from persisted snapshots.
- Successful amendment moves to CHANGED.
- Successful amendment appends ORDER_CHANGED.
- CHANGED requires explicit review before normal lifecycle resumes.

# 16. Amendment Acceptance Matrix
- [ ] ACCEPTED customer-note change succeeds.
- [ ] ACCEPTED customer-note clear succeeds.
- [ ] ACCEPTED quantity increase succeeds.
- [ ] ACCEPTED quantity decrease succeeds.
- [ ] ACCEPTED special-request change succeeds.
- [ ] ACCEPTED special-request clear succeeds.
- [ ] ACCEPTED line removal succeeds when another item remains.
- [ ] Removing final item fails.
- [ ] Quantity zero fails.
- [ ] Negative quantity fails.
- [ ] Quantity above bound fails.
- [ ] Unknown item UUID fails safely.
- [ ] Item from another order fails safely.
- [ ] Item from sibling branch fails safely.
- [ ] Item from cross tenant fails safely.
- [ ] Browser unit price field fails.
- [ ] Browser line-total field fails.
- [ ] Browser subtotal field fails.
- [ ] Browser modifier price field fails.
- [ ] Browser currency field fails.
- [ ] Browser status field fails.
- [ ] Browser customerStatus field fails.
- [ ] Browser tenant field fails.
- [ ] Browser branch field fails.
- [ ] Browser actor field fails.
- [ ] Successful amendment sets status CHANGED.
- [ ] Successful amendment sets valid review-compatible customer status.
- [ ] Successful amendment preserves persisted unit price.
- [ ] Successful amendment preserves modifier delta snapshots.
- [ ] Quantity change recomputes line total from persisted snapshots.
- [ ] Quantity change recomputes order subtotal.
- [ ] Line removal recomputes order subtotal.
- [ ] Note-only change does not alter subtotal.
- [ ] Special-request-only change does not alter subtotal.
- [ ] ORDER_CHANGED actor equals current staff actor.
- [ ] ORDER_CHANGED from_status is ACCEPTED.
- [ ] ORDER_CHANGED to_status is CHANGED.
- [ ] ORDER_CHANGED timestamp is database-derived.
- [ ] Event-write failure rolls item changes back.
- [ ] Event-write failure rolls subtotal change back.
- [ ] Event-write failure rolls CHANGED state back.

# 17. CHANGED Re-Review Acceptance Matrix
- [ ] CHANGED can be re-accepted.
- [ ] CHANGED can be rejected.
- [ ] CHANGED re-accept returns ACCEPTED.
- [ ] CHANGED reject returns REJECTED.
- [ ] CHANGED re-accept event from_status is CHANGED.
- [ ] CHANGED reject event from_status is CHANGED.
- [ ] CHANGED re-accept actor is current reviewer.
- [ ] CHANGED reject actor is current reviewer.
- [ ] CHANGED reject requires bounded rejection reason.
- [ ] CHANGED cannot START_PREPARING before re-accept.
- [ ] Re-accepted CHANGED can START_PREPARING.
- [ ] PREPARING cannot use decision re-review.
- [ ] READY cannot use decision re-review.
- [ ] SERVED cannot use decision re-review.
- [ ] CANCELLED cannot use decision re-review.
- [ ] Decision-vs-cancel from CHANGED has one winner.
- [ ] Re-accept event failure rolls ACCEPTED state back.
- [ ] Re-reject event failure rolls REJECTED state back.

# 18. R04 Cancellation Plane to Accept
- Cancellation is explicit.
- Cancellation requires bounded reason.
- Cancellation target is server-selected CANCELLED.
- Cancellation source set is server-owned.
- Cancellation records actual source status.
- Cancellation records current actor.
- Cancellation records database timestamp.
- Cancellation does not execute refund.
- Cancellation does not mutate kitchen runtime.
- Cancellation does not publish realtime.
- Cancellation does not deliver notifications.
- Cancellation remains transactionally coupled to event evidence.

# 19. Cancellation Acceptance Matrix
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
- [ ] REMAKE cancellation behavior matches established R04/R05 contract and is tested explicitly.
- [ ] VOIDED cancellation fails.
- [ ] Missing cancellation reason fails.
- [ ] Unknown cancellation reason fails.
- [ ] Browser target status fails.
- [ ] Browser actor field fails.
- [ ] Browser timestamp field fails.
- [ ] ORDER_CANCELLED actor equals current staff actor.
- [ ] ORDER_CANCELLED from_status equals true source.
- [ ] ORDER_CANCELLED to_status is CANCELLED.
- [ ] ORDER_CANCELLED reason equals validated code.
- [ ] ORDER_CANCELLED timestamp is database-derived.
- [ ] Cancel-vs-lifecycle race has one winner.
- [ ] Cancel-vs-cancel race has one durable winner.
- [ ] Cancellation event failure rolls aggregate state back.

# 20. R05 Production Controls to Accept
- Production-control action vocabulary is closed and server-defined.
- SET_PRIORITY marks eligible order urgent without changing lifecycle status.
- CLEAR_PRIORITY returns current priority to normal without changing lifecycle status.
- DEFER_ORDER adds active defer metadata without generic target status.
- RESUME_ORDER clears active defer metadata explicitly.
- REQUEST_REMAKE uses exact eligible source states.
- START_REMAKE moves REMAKE into controlled PREPARING continuation.
- Remake count is bounded.
- Control actor/time/reason metadata is durable.
- Control event evidence is append-oriented.
- Deferred work blocks normal lifecycle progression until explicit resume.
- Queue ordering incorporates current production-control metadata deterministically.

# 21. Priority Acceptance Matrix
- [ ] Eligible active order SET_PRIORITY succeeds.
- [ ] SET_PRIORITY leaves lifecycle status unchanged.
- [ ] SET_PRIORITY leaves customer status unchanged.
- [ ] SET_PRIORITY sets priority to URGENT.
- [ ] SET_PRIORITY records bounded reason.
- [ ] SET_PRIORITY records database timestamp.
- [ ] SET_PRIORITY records current actor.
- [ ] SET_PRIORITY appends ORDER_PRIORITY_SET evidence.
- [ ] Already-urgent SET_PRIORITY conflicts.
- [ ] CLEAR_PRIORITY on urgent eligible order succeeds.
- [ ] CLEAR_PRIORITY leaves lifecycle status unchanged.
- [ ] CLEAR_PRIORITY returns priority to NORMAL.
- [ ] CLEAR_PRIORITY clears current priority reason.
- [ ] CLEAR_PRIORITY clears current prioritized timestamp when contract requires.
- [ ] CLEAR_PRIORITY appends ORDER_PRIORITY_CLEARED evidence.
- [ ] CLEAR_PRIORITY on normal order conflicts.
- [ ] Terminal status cannot be prioritized when contract marks it ineligible.
- [ ] CANCELLED cannot be prioritized.
- [ ] REJECTED cannot be prioritized.
- [ ] CLOSED cannot be prioritized.
- [ ] VOIDED cannot be prioritized.
- [ ] Browser cannot supply priority rank integer.
- [ ] Browser cannot supply prioritized actor.
- [ ] Browser cannot supply prioritized timestamp.
- [ ] Unknown priority reason fails.
- [ ] Concurrent SET_PRIORITY calls produce one winner.
- [ ] Priority event failure rolls metadata back.

# 22. Defer Acceptance Matrix
- [ ] Eligible active order DEFER_ORDER succeeds.
- [ ] DEFER_ORDER leaves lifecycle status unchanged by default.
- [ ] DEFER_ORDER records bounded reason.
- [ ] DEFER_ORDER records database timestamp.
- [ ] DEFER_ORDER records current actor.
- [ ] Optional deferredUntil accepts valid bounded future value.
- [ ] deferredUntil in the past fails.
- [ ] deferredUntil over maximum horizon fails.
- [ ] deferredUntil without timezone offset fails.
- [ ] Active defer appends ORDER_DEFERRED evidence.
- [ ] Already deferred DEFER_ORDER conflicts.
- [ ] Active deferred order cannot progress through normal lifecycle.
- [ ] Active deferred order can RESUME_ORDER.
- [ ] RESUME_ORDER clears current defer reason.
- [ ] RESUME_ORDER clears current defer timestamp metadata as defined.
- [ ] RESUME_ORDER clears current deferredUntil as defined.
- [ ] RESUME_ORDER appends ORDER_RESUMED evidence.
- [ ] RESUME_ORDER when not deferred conflicts.
- [ ] Resumed ACCEPTED order can START_PREPARING.
- [ ] Resumed PREPARING order can MARK_READY.
- [ ] Resumed READY order can use eligible next control/lifecycle action.
- [ ] Browser cannot supply deferred actor.
- [ ] Browser cannot supply deferredAt timestamp.
- [ ] Browser cannot supply arbitrary status while deferring.
- [ ] Concurrent defer calls produce one winner.
- [ ] Defer-vs-lifecycle race produces one coherent winner.
- [ ] Defer event failure rolls metadata back.
- [ ] Resume event failure restores previous active defer state.

# 23. Remake Acceptance Matrix
- [ ] Eligible READY order REQUEST_REMAKE succeeds when current contract allows READY.
- [ ] Any other allowed source status is tested explicitly.
- [ ] REQUEST_REMAKE target becomes REMAKE.
- [ ] REQUEST_REMAKE sets valid customer status.
- [ ] REQUEST_REMAKE increments remake count exactly once.
- [ ] REQUEST_REMAKE records bounded remake reason.
- [ ] REQUEST_REMAKE records database timestamp.
- [ ] REQUEST_REMAKE records current actor.
- [ ] REQUEST_REMAKE appends ORDER_REMAKE_REQUESTED.
- [ ] Deferred order cannot request remake while defer remains active.
- [ ] Ineligible source cannot request remake.
- [ ] CANCELLED cannot request remake.
- [ ] REJECTED cannot request remake.
- [ ] CLOSED cannot request remake.
- [ ] VOIDED cannot request remake.
- [ ] Unknown remake reason fails.
- [ ] Maximum remake count prevents another successful request.
- [ ] Concurrent remake requests increment count once.
- [ ] Concurrent remake requests append one successful request event.
- [ ] START_REMAKE succeeds only from REMAKE.
- [ ] START_REMAKE fails from READY.
- [ ] START_REMAKE fails from PREPARING.
- [ ] START_REMAKE fails while deferred.
- [ ] START_REMAKE target becomes PREPARING.
- [ ] START_REMAKE appends ORDER_REMAKE_STARTED.
- [ ] After START_REMAKE, R03 MARK_READY succeeds.
- [ ] After MARK_READY, normal MARK_SERVED remains available.
- [ ] Remake request event failure rolls status/count/evidence back.
- [ ] Remake start event failure rolls PREPARING transition back.

# 24. Queue Ranking Acceptance
- Current queue ranking contract must be read from R05 code, not inferred from spec prose.
- Acceptance must use the actual cursor version emitted by current code.
- Acceptance must prove cursor encode/decode symmetry.
- Acceptance must prove deterministic sort order over current production-control keys.
- Acceptance must prove urgent active work ranks according to current contract.
- Acceptance must prove deferred work ranks according to current contract.
- Acceptance must preserve submitted-at/id tie-breakers or the actual deterministic replacements.
- Acceptance must prove page boundaries remain stable under a frozen dataset.
- Acceptance must not assume realtime consistency under concurrent inserts unless explicitly supported.

# 25. Queue Ranking Test Matrix
- [ ] Two normal non-deferred orders sort by established baseline key.
- [ ] Urgent non-deferred order ranks ahead of equivalent normal order when contract requires.
- [ ] Deferred urgent order does not incorrectly outrank active work when contract says active first.
- [ ] Deferred normal order ranks in deferred group.
- [ ] Same priority/defer state uses deterministic submitted-time tie-breaker.
- [ ] Same submitted time uses deterministic UUID tie-breaker.
- [ ] Cursor round-trip preserves ranking keys.
- [ ] Invalid cursor version fails.
- [ ] Cursor missing required ranking field fails.
- [ ] Cursor cannot carry tenant authority.
- [ ] Cursor cannot carry branch authority.
- [ ] Page 1 + page 2 produce no duplicates on static data.
- [ ] Page 1 + page 2 produce no omissions on static data.
- [ ] Clearing priority changes subsequent fresh-query rank.
- [ ] Setting priority changes subsequent fresh-query rank.
- [ ] Defer changes subsequent fresh-query rank.
- [ ] Resume changes subsequent fresh-query rank.
- [ ] Queue detail reflects current production-control metadata.

# 26. Shared Authorization Acceptance
- Auth.js internal identity remains required for internal mutation routes.
- AccessContext remains current tenant/branch scope authority.
- `order.view` remains read permission.
- `order.manage` remains mutation permission.
- Route-shell access does not imply mutation authority.
- Browser body never establishes tenant/branch/actor authority.
- RLS remains defense in depth beneath application authorization.

# 27. Authorization Matrix
- [ ] order.view-only actor can read queue.
- [ ] order.view-only actor can read detail.
- [ ] order.view-only actor cannot accept.
- [ ] order.view-only actor cannot reject.
- [ ] order.view-only actor cannot run lifecycle action.
- [ ] order.view-only actor cannot amend.
- [ ] order.view-only actor cannot cancel.
- [ ] order.view-only actor cannot set priority.
- [ ] order.view-only actor cannot clear priority.
- [ ] order.view-only actor cannot defer.
- [ ] order.view-only actor cannot resume.
- [ ] order.view-only actor cannot request remake.
- [ ] order.view-only actor cannot start remake.
- [ ] Staff shell permission without order.manage cannot mutate order.
- [ ] Sibling-branch manager cannot mutate current branch order by UUID.
- [ ] Cross-tenant manager cannot mutate foreign tenant order by UUID.
- [ ] Revoked membership denies next read/mutation according to freshness contract.
- [ ] Removed order.manage permission denies next mutation.
- [ ] Customer capability cannot authenticate staff routes.
- [ ] flow_customer_runtime cannot directly perform staff order mutation.
- [ ] flow_customer_entry cannot directly perform staff order mutation.
- [ ] anon cannot directly perform staff order mutation.
- [ ] generic authenticated database role cannot bypass staff authorization contract.

# 28. Shared RLS Acceptance
- Tenant policy remains active on foodflow.orders.
- Restrictive branch policy remains active where R04 introduced it.
- Child item update/delete remains parent-order scoped.
- Modifier access remains parent-item/order scoped.
- Order-event insert remains scoped to current branch/order.
- Existing order-event update remains prohibited for application runtime.
- Existing order-event delete remains prohibited for application runtime.
- New R05 columns do not weaken row isolation.
- New R05 index does not change security semantics.

# 29. Database Authorization Matrix
- [ ] flow_runtime with tenant A/branch A1 can read A1 order.
- [ ] flow_runtime with tenant A/branch A1 cannot read A2 order through scoped repository path.
- [ ] flow_runtime with tenant A/branch A1 cannot mutate A2 order through direct RLS-protected statement.
- [ ] flow_runtime with tenant A/branch A1 cannot mutate tenant B order.
- [ ] flow_runtime branch context missing fails closed where branch is required.
- [ ] customer runtime cannot UPDATE priority columns.
- [ ] customer runtime cannot UPDATE defer columns.
- [ ] customer runtime cannot UPDATE remake columns.
- [ ] customer runtime cannot INSERT staff operational events.
- [ ] customer runtime cannot DELETE order items as staff amendment.
- [ ] customer runtime cannot UPDATE order items as staff amendment.
- [ ] public roles cannot bypass order RLS.
- [ ] order_events remain append-only for runtime.
- [ ] restrictive branch policy composes with tenant policy rather than replacing it.

# 30. Cross-Command Concurrency Acceptance
- R06 must test command races spanning round boundaries, not only isolated same-command duplicates.
- Use real database transactions where deterministic concurrency evidence is required.
- Do not simulate transaction isolation only with mocks.
- Verify final durable state and event count after every race.
- Verify losing request leaves no partial metadata.

# 31. Cross-Command Race Matrix
- [ ] ACCEPT vs REJECT from PENDING_CONFIRMATION: one winner.
- [ ] ACCEPT vs CANCEL from PENDING_CONFIRMATION: one winner.
- [ ] REJECT vs CANCEL from PENDING_CONFIRMATION: one winner.
- [ ] AMEND vs START_PREPARING from ACCEPTED: one winner.
- [ ] AMEND vs CANCEL from ACCEPTED: one winner.
- [ ] SET_PRIORITY vs CANCEL on eligible active order: coherent one-winner/current-state outcome.
- [ ] DEFER vs START_PREPARING from ACCEPTED: coherent one-winner/current-state outcome.
- [ ] DEFER vs CANCEL from ACCEPTED: coherent one-winner/current-state outcome.
- [ ] RESUME vs CANCEL from deferred cancellable order: coherent one-winner/current-state outcome.
- [ ] MARK_READY vs CANCEL from PREPARING: one winner.
- [ ] REQUEST_REMAKE vs MARK_SERVED from READY: one winner where both are source-eligible.
- [ ] REQUEST_REMAKE vs CANCEL from READY: one winner.
- [ ] REQUEST_REMAKE vs DEFER from eligible READY: one coherent outcome.
- [ ] START_REMAKE vs competing production control: one coherent outcome.
- [ ] CHANGED REACCEPT vs CANCEL: one winner.
- [ ] CHANGED REJECT vs CANCEL: one winner.
- [ ] Duplicate SET_PRIORITY: one winner.
- [ ] Duplicate DEFER: one winner.
- [ ] Duplicate REQUEST_REMAKE: one count increment.
- [ ] Duplicate CANCEL: one cancellation event.
- [ ] Losing race does not overwrite winning actor evidence.
- [ ] Losing race does not overwrite winning reason evidence.
- [ ] Losing race does not append false success event.

# 32. Shared Transaction/Rollback Acceptance
- Every mutation and its required evidence must commit atomically.
- Acceptance must inject or deterministically create evidence-write failure where existing tests support it.
- Acceptance must read durable state after rollback.
- Acceptance must verify no partial child mutation remains.
- Acceptance must verify no partial aggregate metadata remains.

# 33. Rollback Matrix
- [ ] Decision event failure rolls accept state back.
- [ ] Decision event failure rolls reject state back.
- [ ] Lifecycle event failure rolls PREPARING transition back.
- [ ] Lifecycle event failure rolls READY transition back.
- [ ] Lifecycle event failure rolls SERVED transition back.
- [ ] Amendment event failure rolls quantity mutation back.
- [ ] Amendment event failure rolls special-request mutation back.
- [ ] Amendment event failure rolls item removal back.
- [ ] Amendment event failure rolls subtotal mutation back.
- [ ] Amendment event failure rolls CHANGED transition back.
- [ ] Cancellation event failure rolls CANCELLED transition back.
- [ ] Priority event failure rolls priority metadata back.
- [ ] Defer event failure rolls defer metadata back.
- [ ] Resume event failure restores active defer metadata.
- [ ] Remake request event failure rolls REMAKE status back.
- [ ] Remake request event failure rolls remake count back.
- [ ] Remake start event failure rolls PREPARING transition back.
- [ ] Result-invariant failure before commit does not leave partial mutation.

# 34. HTTP Transport Acceptance
- Internal mutation routes use POST or another explicit non-GET mutation method already established.
- Same-origin protection is required consistently across decision/lifecycle/exception/production-control routes.
- Request bodies are bounded.
- Malformed JSON fails safely.
- Arrays fail when object body is required.
- Unknown top-level fields fail.
- Unknown nested fields fail.
- Query parameters fail on routes that prohibit them.
- Responses are no-store for operational state.
- Error envelopes remain safe and stable.
- Raw SQL errors are never returned.
- Stack traces are never returned.

# 35. HTTP Negative Matrix
- [ ] Wrong-origin decision request denied.
- [ ] Wrong-origin lifecycle request denied.
- [ ] Wrong-origin exception request denied.
- [ ] Wrong-origin production-control request denied.
- [ ] Missing authenticated internal context denied.
- [ ] Malformed JSON decision body denied.
- [ ] Malformed JSON lifecycle body denied.
- [ ] Malformed JSON exception body denied.
- [ ] Malformed JSON production-control body denied.
- [ ] Array body denied where object required.
- [ ] Unknown action denied.
- [ ] Unknown field denied.
- [ ] Overlong text denied.
- [ ] Invalid UUID denied before repository mutation.
- [ ] Browser tenant field denied.
- [ ] Browser branch field denied.
- [ ] Browser actor field denied.
- [ ] Browser status field denied where not part of explicit intent.
- [ ] Browser customer status field denied.
- [ ] Browser timestamp evidence field denied.

# 36. Error Taxonomy Acceptance
- Read invalid query maps stable 4xx.
- Read unauthorized maps safe denial.
- Read missing maps safe not-found.
- Decision invalid request maps stable 400-class response.
- Decision forbidden maps safe 403-class response.
- Decision conflict maps 409-class response.
- Decision unavailable maps bounded 5xx.
- Lifecycle invalid request maps stable 400-class response.
- Lifecycle forbidden maps safe 403-class response.
- Lifecycle conflict maps 409-class response.
- Lifecycle unavailable maps bounded 5xx.
- Exception invalid request maps stable 400-class response.
- Exception forbidden maps safe 403-class response.
- Exception conflict maps 409-class response.
- Exception unavailable maps bounded 5xx.
- Production-control invalid request maps stable 400-class response.
- Production-control forbidden maps safe 403-class response.
- Production-control conflict maps 409-class response.
- Production-control unavailable maps bounded 5xx.
- Cross-scope selector does not become a distinct existence oracle.

# 37. Database Migration Acceptance
- Fresh database bootstrap is mandatory acceptance evidence.
- Apply all migrations from zero.
- Do not test only an already-migrated developer database.
- R04 branch-RLS migration must apply cleanly before R05 migration.
- R05 production-control migration must apply cleanly after all previous migrations.
- Existing rows must satisfy new defaults/constraints.
- New indexes must create successfully.
- Foreign keys to staff actors must be valid.
- No destructive rewrite of historical migrations is allowed in R06.
- If fresh bootstrap reveals a Phase 04 migration defect, a forward repair migration is preferred when repository history requires immutability.
- If a merged-but-unshipped migration is provably safe to repair under repository policy, document the decision explicitly.
- Production remote database mutation is not part of R06 acceptance.

# 38. R05 Schema Acceptance Matrix
- [ ] priority_code default is NORMAL.
- [ ] priority_code accepts NORMAL.
- [ ] priority_code accepts URGENT.
- [ ] priority_code rejects unknown values.
- [ ] urgent priority requires reason/time/actor evidence.
- [ ] normal priority requires current priority evidence cleared.
- [ ] priority reason accepts only bounded codes.
- [ ] defer reason accepts only bounded codes.
- [ ] active defer requires reason/time/actor evidence.
- [ ] non-deferred state requires current defer evidence cleared.
- [ ] deferredUntil cannot precede deferredAt under persisted constraint.
- [ ] remake_count defaults to zero.
- [ ] remake_count rejects negative values.
- [ ] remake_count rejects values over maximum.
- [ ] remake_count zero requires remake evidence null.
- [ ] remake_count positive requires reason/time/actor evidence.
- [ ] priority actor foreign key rejects unknown user.
- [ ] defer actor foreign key rejects unknown user.
- [ ] remake actor foreign key rejects unknown user.
- [ ] production-rank index exists after migration.

# 39. Generated Database Type Acceptance
- Regenerate Kysely database types from fresh migrated local database.
- Compare generated output to tracked generated type file.
- Fail acceptance when generated type drift exists.
- Do not hand-edit generated type output to hide schema mismatch.
- Verify new R05 columns have expected nullable/non-nullable TypeScript shapes.
- Verify integer remake count type is compatible with runtime assumptions.
- Verify timestamp columns map to expected generated timestamp type.
- Verify no unrelated generated schema drift appears.

# 40. Event Evidence Acceptance
- `foodflow.order_events` is historical evidence, not current-state query replacement.
- Current aggregate metadata and event history must agree for successful controls.
- Event actor must reflect authenticated staff actor.
- Event source/target status must reflect actual command semantics.
- Event reason must use bounded machine-readable code when required.
- Event timestamp must be database-derived.
- Prior events must remain immutable.
- R06 acceptance must inspect event sequence for representative full flows.

# 41. Representative Event Sequence — Normal Flow
- ORDER_ACCEPTED occurs before ORDER_PREPARING.
- ORDER_PREPARING occurs before ORDER_READY.
- ORDER_READY occurs before ORDER_SERVED.
- Every event references same order.
- Every event references current tenant/branch.
- Actor may differ between transitions and must remain historically accurate.
- Event timestamps must be non-null.
- R06 need not require strict wall-clock monotonicity beyond database transaction ordering unless schema guarantees it.

# 42. Representative Event Sequence — Amended Flow
- Initial ORDER_ACCEPTED exists.
- ORDER_CHANGED follows successful bounded amendment.
- CHANGED re-review emits new ORDER_ACCEPTED or ORDER_REJECTED with true source CHANGED.
- If re-accepted, ORDER_PREPARING can follow.
- Historical initial acceptance is not overwritten.
- Historical amendment actor remains intact after later review.

# 43. Representative Event Sequence — Cancelled Flow
- Pre-cancellation historical events remain intact.
- ORDER_CANCELLED records actual current source status.
- Cancellation reason is bounded.
- No fake refund event is introduced by order cancellation.
- No fake kitchen cancellation event is introduced by order cancellation.
- No normal lifecycle event follows CANCELLED.

# 44. Representative Event Sequence — Priority/Defer Flow
- ORDER_PRIORITY_SET records current lifecycle status as source/target when status does not change.
- ORDER_PRIORITY_CLEARED records current lifecycle status as source/target when status does not change.
- ORDER_DEFERRED records current lifecycle status as source/target when status does not change.
- ORDER_RESUMED records current lifecycle status as source/target when status does not change.
- Control events do not fabricate lifecycle advancement.

# 45. Representative Event Sequence — Remake Flow
- ORDER_READY may precede remake request.
- ORDER_REMAKE_REQUESTED moves eligible source to REMAKE.
- ORDER_REMAKE_STARTED moves REMAKE to PREPARING.
- ORDER_READY may occur again through canonical R03 lifecycle.
- ORDER_SERVED may occur after subsequent READY.
- remake_count remains aggregate bounded history summary.
- Historical remake request reason remains preserved in event history.

# 46. Staff UI Acceptance
- Staff Orders remains server-backed.
- UI controls are derived from current durable status/control metadata.
- UI never becomes source of truth.
- UI hides or disables illegal actions based on current projection.
- Server still rejects illegal actions regardless of UI state.
- Success triggers durable reconciliation.
- Conflict triggers durable reconciliation.
- Ambiguous network outcome triggers durable refetch before claiming final state.
- R06 may add acceptance selectors/test IDs only when necessary and non-invasive.
- R06 must not redesign the staff workspace.

# 47. UI State Matrix
- [ ] PENDING_CONFIRMATION exposes decision controls according to R02/R04 contract.
- [ ] CHANGED exposes re-review controls.
- [ ] CHANGED hides START_PREPARING until accepted.
- [ ] ACCEPTED exposes next lifecycle action.
- [ ] ACCEPTED exposes amendment where R04 allows.
- [ ] ACCEPTED exposes cancellation where R04 allows.
- [ ] PREPARING exposes MARK_READY.
- [ ] PREPARING hides amendment.
- [ ] READY exposes MARK_SERVED.
- [ ] READY exposes remake control where R05 allows.
- [ ] SERVED hides normal lifecycle continuation.
- [ ] CANCELLED hides normal lifecycle controls.
- [ ] REJECTED hides normal lifecycle controls.
- [ ] URGENT indicator reflects durable priority metadata.
- [ ] Deferred indicator reflects durable defer metadata.
- [ ] Remake indicator/count reflects durable remake metadata.
- [ ] Successful control refetches queue/detail.
- [ ] Conflict invalidates stale UI state.

# 48. Browser Acceptance Scope
- Browser acceptance is useful only when deterministic authenticated staff + database fixture infrastructure exists.
- Do not fabricate browser PASS when environment is unavailable.
- If browser infrastructure exists, use real HTTP routes rather than directly invoking service functions.
- Cover at least one end-to-end staff order flow.
- Cover at least one authorization denial.
- Cover at least one stale conflict/reconciliation path.
- Cover at least one production-control interaction.
- Browser acceptance may remain NOT RUN without blocking document correctness; implementation readiness must report truthfully according to actual repository gates.

# 49. Browser Scenario A — Normal Staff Flow
- Staff authenticates into branch workspace.
- Incoming PENDING_CONFIRMATION order appears in server-backed queue.
- Staff opens durable detail.
- Staff accepts order.
- Queue/detail reflect ACCEPTED.
- Staff starts preparation.
- Queue/detail reflect PREPARING.
- Staff marks ready.
- Queue/detail reflect READY.
- Staff marks served.
- Queue/detail reflect SERVED.
- Page reload preserves final durable state.

# 50. Browser Scenario B — Amendment/Re-Review Flow
- Staff opens ACCEPTED order.
- Staff amends allowed field.
- Server response/refetch shows CHANGED.
- Start-preparing control is absent/disabled.
- Staff re-accepts CHANGED.
- Server response/refetch shows ACCEPTED.
- Start-preparing becomes available again.
- Page reload preserves amended snapshots and state.

# 51. Browser Scenario C — Defer/Resume Flow
- Staff opens eligible active order.
- Staff defers with bounded reason.
- Durable detail shows deferred state.
- Normal next lifecycle action is unavailable or server-rejected while deferred.
- Staff resumes.
- Durable detail clears active defer metadata.
- Normal next lifecycle action works afterward.
- Page reload preserves resumed state.

# 52. Browser Scenario D — Remake Flow
- Staff opens eligible READY order.
- Staff requests remake with bounded reason.
- Durable detail shows REMAKE and incremented count.
- Staff starts remake.
- Durable detail shows PREPARING.
- Staff marks ready through canonical lifecycle.
- Durable detail shows READY.
- Historical remake count remains visible if included in DTO.

# 53. Security Redaction Acceptance
- No session cookie in application logs.
- No authorization header in application logs.
- No customer capability token in application logs.
- No customer idempotency key in staff DTO/log output unless explicitly safe and required, which current P04 does not require.
- No raw database password in errors.
- No raw SQL stack in HTTP errors.
- No full untrusted customer note in default structured logs.
- No full special request in default structured logs.
- No production-control request body dumped wholesale.

# 54. Input Boundary Acceptance
- UUID fields must be syntactically validated.
- Quantity bounds remain enforced.
- Text bounds remain enforced.
- Reason-code enums remain exact.
- Action enums remain exact.
- Future defer timestamp bound remains enforced.
- Unknown JSON keys remain rejected.
- Null/absent semantics remain deliberate.
- Unicode/Thai text works within configured bounds.
- HTML-like user text remains plain text in UI.

# 55. Resource Safety Acceptance
- Queue page size remains bounded.
- Queue detail query count remains bounded.
- Order item/modifier loading avoids N+1 explosion.
- Amendment request item operation count remains bounded.
- Production-control body size remains bounded.
- Defer future horizon remains bounded.
- Remake count remains bounded.
- Connection pool behavior remains inherited from database runtime.
- R06 does not introduce one-pool-per-request behavior.
- R06 does not add unbounded background loops.

# 56. Performance Acceptance
- Representative queue query uses intended ranking/index shape where explain-plan evidence is practical.
- Priority/defer ranking does not require full event-history scans.
- Current production metadata is read from aggregate columns.
- Order-event history is not joined into every queue row by default.
- Pagination stays keyset-based if current R05 implementation uses keyset semantics.
- R06 does not add offset pagination for convenience.
- R06 does not add full-table client loading for acceptance.

# 57. Acceptance Defect-Fix Policy
- R06 is not a feature round.
- A defect fix is allowed only when an acceptance test reproduces violation of an already-authorized P04 invariant.
- Fix must be minimal and local.
- Fix must not broaden public API surface beyond existing spec.
- Fix must not introduce future-phase functionality.
- Fix must add regression evidence for reproduced defect.
- Fix must be documented in `FLOW_P04_ACCEPTANCE.md`.
- Fix must be documented in R06 implementation PR body.
- If required fix would materially redesign architecture, stop and report BLOCKED instead of improvising.

# 58. Allowed Acceptance Defect Examples
- Wrong current source-status predicate in an existing P04 command.
- Incorrect event from_status for an existing P04 command.
- Missing transaction coupling causing partial P04 mutation.
- Incorrect queue cursor field causing deterministic pagination defect.
- Missing RLS predicate exposing sibling branch through existing P04 path.
- Generated DB type drift caused by existing P04 migration.
- Incorrect customer status mapping violating existing database constraint.
- Incorrect current metadata clear behavior after cancellation when R05 already defines coherence.

# 59. Disallowed R06 Feature Examples
- Adding payment provider execution.
- Adding refund orchestration.
- Adding kitchen ticket routing.
- Adding station assignment.
- Adding realtime pub/sub.
- Adding notification templates.
- Adding customer priority display as a new product feature.
- Adding customer approval workflow for CHANGED.
- Adding a generic workflow engine.
- Adding generic staff idempotency/replay subsystem.
- Adding analytics dashboards unrelated to acceptance.
- Adding Phase 05 domain functionality.

# 60. Required Integration Acceptance File
- Prefer one focused server/database acceptance file, for example:
```text
apps/web/next-flow/tests/integration/operational-order-plane-acceptance.test.ts
```
- Exact filename may differ if repository naming conventions require.
- It must exercise assembled R01–R05 behavior rather than duplicate all unit tests.
- It must use real database runtime when database behavior is under acceptance.
- It must not mock repositories for database acceptance conclusions.
- It may reuse existing fixtures/helpers where safe.

# 61. Optional Browser Acceptance File
- Candidate path:
```text
apps/web/next-flow/tests/e2e/operational-order-plane-acceptance.spec.ts
```
- Create only when it adds executable value under current test infrastructure.
- If committed but not executed by hosted workflow, record NOT RUN.
- Do not weaken deterministic server acceptance because browser environment is unavailable.

# 62. Required Database Acceptance Strategy
- Re-run all existing Phase 04 pgTAP files.
- Add R06-specific database assertions only when cross-round integration is not already covered.
- Avoid duplicating every prior pgTAP assertion verbatim.
- Prefer cross-round invariants such as branch policy continuity after R05 migration.
- Verify fresh migration order.
- Verify generated type drift.

# 63. Existing Phase 04 Tests to Preserve
- Operational queue unit tests.
- Operational queue integration tests.
- Operational decision unit tests.
- Operational decision integration tests.
- Operational decision hardening tests where present.
- Operational lifecycle unit tests.
- Operational lifecycle integration tests.
- Operational exception unit tests.
- Operational exception integration tests.
- Operational production-control unit tests.
- Operational production-control integration tests.
- R01 database boundary tests.
- R02 decision database boundary tests.
- R03 lifecycle database boundary tests.
- R04 exception database boundary tests.
- R05 production-control database boundary tests.

# 64. Regression Acceptance — R01
- [ ] Queue authorization remains separate from route-shell access.
- [ ] Queue remains server-backed.
- [ ] Detail remains server-backed.
- [ ] Stable pagination remains intact after R05 ranking fields.
- [ ] Branch isolation remains intact after later migrations.
- [ ] Customer material remains hidden.

# 65. Regression Acceptance — R02
- [ ] Initial accept still works after R04 re-review extension.
- [ ] Initial reject still works after R04 re-review extension.
- [ ] Initial decision source remains PENDING_CONFIRMATION.
- [ ] Later statuses do not become generic decision sources.
- [ ] Decision event evidence remains append-only after R05 migration.
- [ ] order.manage remains required.

# 66. Regression Acceptance — R03
- [ ] Normal lifecycle map remains unchanged by R05 controls.
- [ ] Deferred guard does not permit illegal lifecycle advancement.
- [ ] Resumed flow returns to canonical lifecycle.
- [ ] Remake continuation intentionally reuses PREPARING -> READY -> SERVED.
- [ ] No arbitrary status patch was introduced.

# 67. Regression Acceptance — R04
- [ ] Amendment money snapshots remain authoritative after R05 schema changes.
- [ ] CHANGED re-review remains explicit.
- [ ] Cancellation remains reasoned.
- [ ] Cancellation clears current production-control metadata coherently where R05 composes with cancellation.
- [ ] Restrictive branch RLS still applies after R05 migration.
- [ ] No customer role gained new write access.

# 68. Regression Acceptance — R05
- [ ] Priority does not mutate lifecycle status.
- [ ] Defer does not silently mutate lifecycle status.
- [ ] Resume clears active defer state.
- [ ] Remake count remains bounded.
- [ ] Remake request/start events remain correct.
- [ ] Queue ranking remains deterministic.
- [ ] Cancellation of a deferred order leaves coherent terminal control metadata.

# 69. Acceptance Fixtures
- Use deterministic tenant A / tenant B fixtures.
- Use deterministic branch A1 / branch A2 fixtures.
- Use deterministic order-manager actor.
- Use deterministic view-only actor.
- Use customer capability/session fixture only for negative staff-auth boundary where needed.
- Seed minimal orders per acceptance scenario.
- Avoid dependence on wall-clock race except where database timestamps are under test.
- Use far-future/fixed submitted timestamps when ranking needs deterministic order.
- Clean fixtures after tests or rely on reset-isolated database strategy.

# 70. Fixture Status Coverage
- PENDING_CONFIRMATION fixture.
- CHANGED fixture or generated through amendment.
- ACCEPTED fixture.
- PREPARING fixture or generated through lifecycle.
- READY fixture or generated through lifecycle.
- SERVED fixture or generated through lifecycle.
- CANCELLED fixture generated through cancellation.
- REMAKE fixture generated through remake request.
- Deferred active fixture generated through DEFER_ORDER.
- Urgent fixture generated through SET_PRIORITY.

# 71. Acceptance Result Vocabulary
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```
- Use no other status words in required validation summary.
- A skipped test is not automatically PASS.
- A missing environment is NOT RUN or BLOCKED according to cause.
- A failed required validation remains FAIL until fixed and rerun.
- Do not convert flaky infrastructure into semantic PASS without successful rerun evidence.

# 72. Acceptance Conclusion Vocabulary
```text
PROVEN
NOT PROVEN
BLOCKED
```
- Use for durable acceptance assertions in `FLOW_P04_ACCEPTANCE.md`.
- PROVEN requires observed executable evidence.
- NOT PROVEN is truthful when evidence was not executed.
- BLOCKED requires exact blocker description.

# 73. Required Acceptance Conclusions
- `SERVER_BACKED_OPERATIONAL_QUEUE`
- `BRANCH_SCOPED_ORDER_READS`
- `ORDER_VIEW_PERMISSION_BOUNDARY`
- `ORDER_MANAGE_PERMISSION_BOUNDARY`
- `INITIAL_DECISION_AUTHORITY`
- `NORMAL_LIFECYCLE_AUTHORITY`
- `CONTROLLED_AMENDMENT_AUTHORITY`
- `CHANGED_REVIEW_GATE`
- `CONTROLLED_CANCELLATION_AUTHORITY`
- `PRIORITY_CONTROL_AUTHORITY`
- `DEFER_RESUME_AUTHORITY`
- `REMAKE_CONTROL_AUTHORITY`
- `TENANT_ISOLATION`
- `BRANCH_ISOLATION`
- `CUSTOMER_ROLE_DENIAL`
- `MASS_ASSIGNMENT_DENIAL`
- `EXACT_STATE_CONCURRENCY`
- `TRANSACTIONAL_EVENT_ROLLBACK`
- `DETERMINISTIC_QUEUE_PAGINATION`
- `FRESH_DATABASE_BOOTSTRAP`
- `GENERATED_DATABASE_TYPE_ALIGNMENT`

# 74. Acceptance Record — Lineage Section
- Record R01 implementation branch and observed/final head.
- Record R01 implementation PR when available.
- Record R02 implementation branch and observed/final head.
- Record R02 implementation PR when available.
- Record R03 implementation branch and observed/final head.
- Record R03 implementation PR when available.
- Record R04 implementation branch and observed/final head.
- Record R04 implementation PR when available.
- Record R05 implementation branch and observed/final head.
- Record R05 implementation PR when available.
- Record R06 implementation branch and final head.
- Record R06 implementation PR.
- Distinguish branch head from integrated main SHA when different.
- Do not invent missing PR numbers.

# 75. Acceptance Record — Schema Section
- List relevant Phase 04 migrations.
- State whether R06 added a repair migration.
- State whether generated DB types changed in R06.
- State fresh reset result.
- State pgTAP result.
- State database lint result.
- State generated type drift result.
- State production database mutated: must be NO for this acceptance task unless separately authorized, which this spec does not authorize.

# 76. Acceptance Record — Validation Section
- Record repository integrity result when required.
- Record phase/round gate result when required.
- Record dependency integrity result when applicable.
- Record lint result.
- Record typecheck result.
- Record application/unit test result.
- Record integration acceptance result.
- Record build result.
- Record database reset result.
- Record pgTAP result.
- Record database lint result.
- Record generated type result.
- Record DB runtime integration result.
- Record browser E2E result or NOT RUN.
- Record Vercel preview result only if actually observed and relevant.

# 77. Acceptance Record — Known Limitations
- No payment execution accepted in Phase 04.
- No refund/void accepted in Phase 04.
- No kitchen ticket execution accepted in Phase 04.
- No realtime delivery accepted in Phase 04.
- No notification delivery accepted in Phase 04.
- No generic staff replay/idempotency accepted in Phase 04.
- Browser E2E may remain NOT PROVEN when not executed.
- Production deployment behavior may remain NOT PROVEN when not executed.
- Customer-facing operational status UX beyond established contracts may remain later scope.

# 78. Validation Commands
- Use repository-defined commands only.
- Typical application setup: `npm ci` in `apps/web/next-flow` when required.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm run test` or repository-equivalent application/unit suite.
- Run focused operational integration acceptance.
- Run `npm run build:next` or current build script.
- Start local Supabase using repository-supported command.
- Run fresh local database reset.
- Run database seed when repository workflow requires it.
- Run `supabase test db --local` or current pgTAP command.
- Run database lint.
- Run database generated type command.
- Run generated type drift verification.
- Run DB runtime integration suite.
- Run browser E2E only when configured and deterministic.
- Record actual commands in R06 PR if repository scripts differ.

# 79. Validation Order
1. Re-read current main policy/spec.
2. Verify exact R05 parent lineage.
3. Create R06 branch from R05 lineage.
4. Inspect R01–R05 final source state.
5. Audit current migrations and generated types.
6. Add cross-round acceptance fixtures/helpers.
7. Add integrated server/database acceptance tests.
8. Add minimal cross-round database acceptance where needed.
9. Add browser acceptance only when useful and deterministic.
10. Run focused tests during development.
11. Run full application validation.
12. Run fresh database validation.
13. Run generated type drift validation.
14. Run browser validation if available.
15. Create/update `FLOW_P04_ACCEPTANCE.md` from observed evidence.
16. Re-run required validation after acceptance record if repository gates inspect docs/metadata.
17. Open/update implementation PR.
18. Stop without merging implementation PR.

# 80. Acceptance Failure Handling
- A failing acceptance test is evidence, not permission to weaken the assertion.
- Reproduce failure independently where practical.
- Determine whether failure is an R01–R05 defect, fixture defect, test defect, or infrastructure defect.
- Fix fixture/test only when the production contract is already correct.
- Fix production code only when a real established P04 invariant is violated.
- Add regression coverage for every production defect fix.
- Record the defect and fix in acceptance record.
- If scope expansion is required, mark BLOCKED and stop.

# 81. Infrastructure Failure Handling
- Docker registry throttling is infrastructure, not product failure.
- Local database port collision is infrastructure, not product failure.
- Missing required environment variable may be BLOCKED or NOT RUN depending on repository contract.
- Retry transient startup only through existing bounded retry policy.
- Do not suppress persistent infrastructure failure.
- Do not change CI solely to force acceptance green.
- Do not change hosted required checks in this round.

# 82. Observability During Acceptance
- Log test scenario IDs where useful.
- Keep test logs free of secrets.
- Keep test logs free of raw capability tokens.
- Keep test logs free of passwords.
- Redact session cookies.
- Use deterministic fixture identifiers rather than production data.
- Preserve enough failure context to identify command/state mismatch.
- Do not dump entire database tables on failure when they may contain sensitive material.

# 83. Acceptance Data Integrity Invariants
- Order tenant never changes through P04 staff commands.
- Order branch never changes through P04 staff commands.
- Order table never changes through P04 staff commands unless an explicit earlier spec allowed it; current R04 does not.
- Order currency never changes through P04 staff commands.
- Order number never changes through P04 staff commands.
- Persisted unit-price snapshot never changes through bounded amendment.
- Persisted modifier-price snapshot never changes through bounded amendment.
- Removed order items do not leave orphan modifiers.
- Order subtotal matches remaining persisted snapshots after amendment.
- Terminal CANCELLED does not resume normal lifecycle.
- Terminal REJECTED does not resume normal lifecycle.
- SERVED does not silently reopen through R04/R05 controls unless exact remake source contract intentionally allows a bounded exception.

# 84. Acceptance State-Machine Invariants
- PENDING_CONFIRMATION requires explicit decision/cancellation path.
- CHANGED requires explicit re-review/cancellation path.
- ACCEPTED enables normal start-preparing, amendment, cancellation, and eligible production metadata controls.
- PREPARING enables normal mark-ready, cancellation, and eligible production metadata controls.
- READY enables mark-served, cancellation, eligible priority/defer, and eligible remake request.
- REMAKE enables controlled remake continuation and eligible metadata controls only as established.
- SERVED remains terminal for normal lifecycle.
- CANCELLED remains terminal for normal lifecycle.
- REJECTED remains terminal for normal lifecycle.
- PAID/CLOSED remain outside P04 operational mutation scope where current contracts say so.

# 85. Acceptance Money Invariants
- Browser cannot override order subtotal.
- Browser cannot override currency.
- Browser cannot override unit-price snapshot.
- Browser cannot override modifier-price snapshot.
- Quantity change uses integer minor-unit arithmetic.
- Quantity change includes persisted modifier deltas.
- Item removal subtracts full persisted line contribution.
- Customer note changes do not alter money.
- Special request changes do not alter money.
- Priority/defer/remake controls do not alter order money.
- Cancellation does not create refund side effects.

# 86. Acceptance Actor Invariants
- Accept actor comes from current AccessContext.
- Reject actor comes from current AccessContext.
- Lifecycle actor comes from current AccessContext.
- Amendment actor comes from current AccessContext.
- Cancellation actor comes from current AccessContext.
- Priority actor comes from current AccessContext.
- Defer actor comes from current AccessContext.
- Remake actor comes from current AccessContext.
- Browser actor input is never trusted.
- Historical actor events remain immutable after later mutations.

# 87. Acceptance Timestamp Invariants
- Decision timestamp is database-derived.
- Lifecycle timestamp is database-derived.
- Amendment evidence time is database-derived.
- Cancellation evidence time is database-derived.
- Priority evidence time is database-derived.
- Defer evidence time is database-derived.
- Remake evidence time is database-derived.
- Browser timestamp fields do not become durable authority.
- Failed mutation does not advance success timestamp evidence.

# 88. Acceptance Reason Invariants
- Rejection reason uses bounded rejection taxonomy.
- Cancellation reason uses bounded cancellation taxonomy.
- Priority reason uses bounded priority taxonomy.
- Defer reason uses bounded defer taxonomy.
- Remake reason uses bounded remake taxonomy.
- Unknown codes fail.
- Free-text request payload is not substituted for machine-readable reason.
- Event reason remains bounded where contract requires reason.

# 89. Acceptance Customer-Status Invariants
- Accepted order customer status remains valid under current DB constraint.
- Rejected order customer status remains valid.
- PREPARING customer status remains valid.
- READY customer status remains valid.
- SERVED customer status remains valid.
- CHANGED customer status remains valid under R04 mapping.
- CANCELLED customer status remains valid under R04 mapping.
- REMAKE customer status remains valid under R05 mapping.
- R06 does not invent new customer status solely for tests.

# 90. Acceptance Queue Projection Invariants
- Queue status reflects durable aggregate.
- Queue subtotal reflects durable aggregate.
- Queue priority reflects durable R05 metadata.
- Queue defer flag reflects durable R05 metadata.
- Queue ranking uses current server-defined keys.
- Detail item quantity reflects bounded amendment.
- Detail removed item is absent after amendment.
- Detail special request reflects bounded amendment.
- Detail current control metadata reflects server state.
- Refresh after mutation does not rely on optimistic local authority.

# 91. Acceptance API Mass-Assignment Matrix
- [ ] `tenantId` rejected on decision route.
- [ ] `branchId` rejected on decision route.
- [ ] `actorId` rejected on decision route.
- [ ] `status` rejected on decision route.
- [ ] `tenantId` rejected on lifecycle route.
- [ ] `branchId` rejected on lifecycle route.
- [ ] `actorId` rejected on lifecycle route.
- [ ] target `status` rejected on lifecycle route.
- [ ] `tenantId` rejected on exception route.
- [ ] `branchId` rejected on exception route.
- [ ] `actorId` rejected on exception route.
- [ ] `unitPriceMinor` rejected on amendment.
- [ ] `subtotalMinor` rejected on amendment.
- [ ] `currency` rejected on amendment.
- [ ] `tenantId` rejected on production-control route.
- [ ] `branchId` rejected on production-control route.
- [ ] `actorId` rejected on production-control route.
- [ ] `priorityCode` direct assignment rejected if only action intent is allowed.
- [ ] direct `deferredAt` assignment rejected.
- [ ] direct `remakeCount` assignment rejected.

# 92. Acceptance Unknown-Field Matrix
- [ ] Unknown decision top-level field fails.
- [ ] Unknown lifecycle top-level field fails.
- [ ] Unknown amendment top-level field fails.
- [ ] Unknown amendment nested item field fails.
- [ ] Unknown cancellation top-level field fails.
- [ ] Unknown priority top-level field fails.
- [ ] Unknown defer top-level field fails.
- [ ] Unknown remake top-level field fails.
- [ ] Query-string mutation selectors fail where routes prohibit them.

# 93. Acceptance Text Boundary Matrix
- [ ] Max-valid customer note accepted.
- [ ] Over-max customer note rejected.
- [ ] Max-valid special request accepted.
- [ ] Over-max special request rejected.
- [ ] Thai customer note accepted within bound.
- [ ] Thai special request accepted within bound.
- [ ] HTML-like note is rendered as plain text.
- [ ] Whitespace normalization follows established contract.
- [ ] Cancellation/priority/defer/remake reason remains enum, not free text.

# 94. Acceptance Defer-Time Matrix
- [ ] Missing deferredUntil accepted when optional.
- [ ] Explicit null deferredUntil accepted when contract allows.
- [ ] Valid near-future ISO timestamp accepted.
- [ ] Timestamp equal to now rejected.
- [ ] Past timestamp rejected.
- [ ] Timestamp beyond max horizon rejected.
- [ ] Timestamp without timezone rejected.
- [ ] Malformed timestamp rejected.
- [ ] Numeric timestamp rejected when string required.
- [ ] Browser deferredAt durable evidence field rejected.

# 95. Acceptance Remake-Count Matrix
- [ ] New order begins remake_count=0.
- [ ] First successful request produces count=1.
- [ ] Second successful cycle produces count=2 when still eligible.
- [ ] Third successful cycle produces count=3 when still eligible.
- [ ] Fourth request is denied at max=3.
- [ ] Failed remake request does not increment count.
- [ ] Concurrent first requests increment once.
- [ ] Event-write rollback restores previous count.
- [ ] Browser cannot set count directly.

# 96. Acceptance Priority State Matrix
- [ ] NORMAL has null current priority reason/time/actor.
- [ ] URGENT has non-null reason/time/actor.
- [ ] SET_PRIORITY produces coherent URGENT tuple.
- [ ] CLEAR_PRIORITY produces coherent NORMAL tuple.
- [ ] Constraint rejects inconsistent NORMAL tuple.
- [ ] Constraint rejects inconsistent URGENT tuple.
- [ ] Cancellation clears current priority metadata when current composed contract requires terminal cleanup.
- [ ] Historical priority events remain after current state clears.

# 97. Acceptance Defer State Matrix
- [ ] Not-deferred tuple has current defer fields null.
- [ ] Deferred tuple has reason/time/actor.
- [ ] Optional deferredUntil is null or >= deferredAt.
- [ ] RESUME returns not-deferred tuple.
- [ ] Constraint rejects reason without timestamp.
- [ ] Constraint rejects timestamp without reason.
- [ ] Cancellation clears current defer metadata when composed contract requires terminal cleanup.
- [ ] Historical defer/resume events remain intact.

# 98. Acceptance Event Immutability Matrix
- [ ] Application runtime cannot UPDATE ORDER_ACCEPTED event.
- [ ] Application runtime cannot DELETE ORDER_ACCEPTED event.
- [ ] Application runtime cannot UPDATE ORDER_CHANGED event.
- [ ] Application runtime cannot DELETE ORDER_CHANGED event.
- [ ] Application runtime cannot UPDATE ORDER_CANCELLED event.
- [ ] Application runtime cannot DELETE ORDER_CANCELLED event.
- [ ] Application runtime cannot UPDATE production-control events.
- [ ] Application runtime cannot DELETE production-control events.
- [ ] Customer runtime cannot INSERT staff operational events.

# 99. Acceptance Branch-Isolation Matrix
- [ ] A1 queue excludes A2 order.
- [ ] A1 detail cannot load A2 order.
- [ ] A1 accept cannot mutate A2 order.
- [ ] A1 lifecycle cannot mutate A2 order.
- [ ] A1 amendment cannot mutate A2 order.
- [ ] A1 cancellation cannot mutate A2 order.
- [ ] A1 priority cannot mutate A2 order.
- [ ] A1 defer cannot mutate A2 order.
- [ ] A1 remake cannot mutate A2 order.
- [ ] Direct child-item mutation cannot bypass A1/A2 parent branch scope.
- [ ] Direct event insert cannot attach unauthorized A2 order under A1 context.

# 100. Acceptance Tenant-Isolation Matrix
- [ ] Tenant A queue excludes tenant B order.
- [ ] Tenant A detail cannot load tenant B order.
- [ ] Tenant A decision cannot mutate tenant B order.
- [ ] Tenant A lifecycle cannot mutate tenant B order.
- [ ] Tenant A exception cannot mutate tenant B order.
- [ ] Tenant A production control cannot mutate tenant B order.
- [ ] Tenant A child mutation cannot target tenant B aggregate.
- [ ] Tenant A event insert cannot target tenant B order.

# 101. Acceptance Permission-Freshness Matrix
- [ ] Active order.manage membership allows mutation.
- [ ] Membership revoked before next request denies mutation.
- [ ] Role permission removed before next request denies mutation.
- [ ] Stale browser UI does not preserve revoked authority server-side.
- [ ] Existing Auth.js session does not bypass current permission evaluation contract.
- [ ] Read permission removal affects subsequent reads according to current freshness design.

# 102. Acceptance Cancellation Composition with R05
- Deferred cancellable order can be cancelled according to current exception contract.
- Cancellation must leave coherent terminal production-control metadata.
- Priority current-state metadata must not make CANCELLED appear active work.
- Defer current-state metadata must not keep CANCELLED in active defer ranking.
- Historical production-control events remain intact.
- Cancellation event remains final order-domain exception evidence.
- No refund/kitchen side effect is implied.

# 103. Acceptance Lifecycle Composition with Defer
- Defer blocks source-state lifecycle action through established guard.
- Resume removes that block.
- Defer does not itself alter lifecycle status.
- Resume does not itself advance lifecycle status.
- Race between defer and lifecycle yields coherent outcome.
- No state exists where lifecycle advanced but stale defer metadata incorrectly claims active pause unless contract explicitly supports it; current acceptance should reject incoherent tuple.

# 104. Acceptance Lifecycle Composition with Remake
- Remake request uses explicit bounded source.
- Remake request records current source in event.
- Remake start returns to PREPARING.
- R03 normal lifecycle owns PREPARING -> READY.
- R03 normal lifecycle owns READY -> SERVED after remake.
- R05 does not create a second READY/SERVED transition implementation.

# 105. Acceptance Decision Composition with CHANGED
- R04 extension does not broaden decision source beyond PENDING_CONFIRMATION and CHANGED.
- Initial decision behavior remains unchanged.
- CHANGED source is determined server-side.
- Event from_status uses actual source.
- Re-accept does not automatically start production.
- Re-reject is terminal under current order-control plane.

# 106. Acceptance UI Reconciliation Matrix
- [ ] Decision success refreshes durable queue/detail.
- [ ] Lifecycle success refreshes durable queue/detail.
- [ ] Amendment success refreshes durable queue/detail.
- [ ] Cancellation success refreshes durable queue/detail.
- [ ] Priority success refreshes durable queue/detail.
- [ ] Defer success refreshes durable queue/detail.
- [ ] Resume success refreshes durable queue/detail.
- [ ] Remake request success refreshes durable queue/detail.
- [ ] Remake start success refreshes durable queue/detail.
- [ ] 409 conflict triggers durable refresh.
- [ ] Row disappearance after filter-changing mutation is handled safely.
- [ ] UI does not assert success solely from optimistic local state.

# 107. Acceptance Accessibility Regression
- Mutation buttons remain keyboard reachable.
- Destructive cancellation remains explicitly labeled.
- Modal/sheet controls remain labeled.
- Error text remains accessible.
- Disabled/pending state is not conveyed only by color.
- R06 fixes accessibility only when acceptance reveals regression introduced by P04 work.
- R06 does not redesign visual system.

# 108. Acceptance Responsive Regression
- Staff controls remain usable on intended tablet viewport.
- Long order/item labels do not break mutation controls.
- Production-control UI does not overflow small viewport unexpectedly.
- R06 may validate but not redesign unrelated layout.

# 109. Acceptance Dependency Integrity
- R06 should not add runtime dependencies unless absolutely required for testing and justified.
- Prefer existing Vitest/Playwright/Supabase tooling.
- Package lock should remain unchanged when no dependency changes occur.
- If test-only dependency is truly necessary, document reason and validate lockfile integrity.
- Avoid dependency churn for assertions available in existing tooling.

# 110. Acceptance Build Integrity
- TypeScript compiles.
- Server-only modules do not leak into client bundles.
- Next.js build succeeds under current repository contract.
- Test-only imports do not enter production bundle.
- Generated DB type additions remain type-safe across repositories/services.
- UI DTO changes remain aligned with server DTOs.

# 111. Acceptance Server-Only Boundary
- order queue repository remains server-only.
- order decision service/repository remain server-only.
- order lifecycle service/repository remain server-only.
- order exception service/repository remain server-only.
- order production-control service/repository remain server-only.
- Client components consume DTOs/HTTP, not database handles.
- Database runtime remains inaccessible from client bundle.

# 112. Acceptance No-Secret Boundary
- No environment secret committed.
- No database URL committed.
- No Auth.js secret committed.
- No customer capability secret committed.
- No provider secret added.
- Test fixtures use synthetic identifiers.
- Acceptance record contains no secret values.

# 113. Acceptance No-Production-Mutation Boundary
- R06 local tests may mutate disposable local test database.
- R06 must not mutate production database.
- R06 must not run destructive remote migration command.
- R06 must not seed production.
- R06 must not alter production user memberships.
- R06 must not alter production orders.
- R06 must not invoke payment provider.

# 114. Acceptance PR Requirements
- PR title identifies P04/R06 acceptance.
- PR body references exact R06 spec filename from main.
- PR body records main authority SHA at implementation start.
- PR body records R05 implementation parent branch.
- PR body records exact R05 parent SHA.
- PR body records R06 head SHA.
- PR body records compare lineage status.
- PR body lists acceptance files added/modified.
- PR body lists any reproduced production defects fixed.
- PR body lists migration changes if any.
- PR body lists generated type changes if any.
- PR body records validation outcomes truthfully.
- PR body records browser E2E outcome truthfully.
- PR body records known limitations.
- PR body records Phase 05 handoff.
- PR remains owner-controlled.
- Implementation agent does not merge.
- Implementation agent does not enable auto-merge.

# 115. Definition of Done — Integrated Read Plane
- [ ] Server-backed queue accepted.
- [ ] Server-backed detail accepted.
- [ ] order.view boundary accepted.
- [ ] Tenant isolation accepted.
- [ ] Branch isolation accepted.
- [ ] Deterministic queue pagination accepted.
- [ ] R05 ranking composition accepted.

# 116. Definition of Done — Decision Plane
- [ ] Initial accept accepted.
- [ ] Initial reject accepted.
- [ ] CHANGED re-accept accepted.
- [ ] CHANGED re-reject accepted.
- [ ] order.manage boundary accepted.
- [ ] Decision actor/time/reason evidence accepted.
- [ ] Decision race behavior accepted.
- [ ] Decision rollback accepted.

# 117. Definition of Done — Lifecycle Plane
- [ ] ACCEPTED -> PREPARING accepted.
- [ ] PREPARING -> READY accepted.
- [ ] READY -> SERVED accepted.
- [ ] Illegal lifecycle transitions rejected.
- [ ] Lifecycle evidence accepted.
- [ ] Lifecycle race behavior accepted.
- [ ] Lifecycle rollback accepted.

# 118. Definition of Done — Exception Plane
- [ ] Bounded amendment accepted.
- [ ] Snapshot money authority accepted.
- [ ] CHANGED review gate accepted.
- [ ] Controlled cancellation accepted.
- [ ] Cancellation reason evidence accepted.
- [ ] Exception branch isolation accepted.
- [ ] Exception race behavior accepted.
- [ ] Exception rollback accepted.

# 119. Definition of Done — Production Controls
- [ ] Priority set accepted.
- [ ] Priority clear accepted.
- [ ] Defer accepted.
- [ ] Resume accepted.
- [ ] Remake request accepted.
- [ ] Remake start accepted.
- [ ] Remake bound accepted.
- [ ] Production-control evidence accepted.
- [ ] Queue ranking accepted.
- [ ] Production-control rollback accepted.

# 120. Definition of Done — Security
- [ ] Staff identity remains server-derived.
- [ ] Tenant remains server-derived.
- [ ] Branch remains server-derived.
- [ ] order.view/order.manage separation accepted.
- [ ] Customer staff-authority denial accepted.
- [ ] Mass assignment denial accepted.
- [ ] Same-origin mutation protection accepted.
- [ ] RLS defense-in-depth accepted.
- [ ] Event immutability accepted.
- [ ] Secret redaction requirements preserved.

# 121. Definition of Done — Database
- [ ] Fresh migration reset passes.
- [ ] All Phase 04 migrations apply cleanly.
- [ ] R05 constraints accepted.
- [ ] R04 restrictive branch RLS remains effective.
- [ ] Phase 04 pgTAP suites pass.
- [ ] Database lint result recorded.
- [ ] Generated DB types regenerate.
- [ ] Generated type drift is clean.
- [ ] No destructive production mutation performed.

# 122. Definition of Done — Acceptance Evidence
- [ ] Integrated R01–R05 acceptance test exists.
- [ ] Acceptance result is observed.
- [ ] `FLOW_P04_ACCEPTANCE.md` exists.
- [ ] Acceptance record contains exact lineage.
- [ ] Acceptance record contains exact validation evidence.
- [ ] Acceptance record uses PROVEN / NOT PROVEN / BLOCKED truthfully.
- [ ] Known limitations are recorded.
- [ ] Deferred scope is recorded.
- [ ] Phase 05 handoff is fail-closed.

# 123. Required Scope Declaration
```text
IMPLEMENTATION_PHASE=P04
IMPLEMENTATION_ROUND=R06
PHASE04_INTEGRATED_ACCEPTANCE=YES
PHASE04_ACCEPTANCE_RECORD=YES
R01_QUEUE_REGRESSION_PROOF=YES
R02_DECISION_REGRESSION_PROOF=YES
R03_LIFECYCLE_REGRESSION_PROOF=YES
R04_EXCEPTION_REGRESSION_PROOF=YES
R05_PRODUCTION_CONTROL_REGRESSION_PROOF=YES
CROSS_TENANT_NEGATIVE_ACCEPTANCE=YES
CROSS_BRANCH_NEGATIVE_ACCEPTANCE=YES
CUSTOMER_AUTHORITY_NEGATIVE_ACCEPTANCE=YES
CONCURRENCY_ACCEPTANCE=YES
ROLLBACK_ACCEPTANCE=YES
FRESH_DATABASE_ACCEPTANCE=YES
GENERATED_TYPE_ACCEPTANCE=YES
NEW_PHASE05_FEATURES=NO
PAYMENT_EXECUTION_CHANGED=NO
KITCHEN_EXECUTION_CHANGED=NO
REALTIME_RUNTIME_CHANGED=NO
NOTIFICATION_RUNTIME_CHANGED=NO
PRODUCTION_DB_MODIFIED=NO
IMPLEMENTATION_AGENT_MERGE=NO
AUTO_MERGE=NO
```

# 124. Phase 05 Handoff Rule
- R06 may point to `FLOW_P05_R01_IMPLEMENTATION_SPEC.md` as the next canonical filename.
- R06 must not invent P05/R01 implementation scope.
- P05/R01 spec must be authored from actual accepted Phase 04 repository state.
- P05/R01 must read current product/architecture authority on main at its own authoring time.
- Absence of P05/R01 spec on main means Phase 05 implementation is prohibited.
- R06 implementation completion does not itself authorize a P05 branch.
- Only an exact READY P05/R01 spec on main authorizes P05/R01 implementation.

# 125. Phase 05 Fail-Closed Conditions
- Phase 04 acceptance record missing -> no P05 spec authoring completion.
- Required Phase 04 acceptance conclusion BLOCKED -> report blocker before P05.
- Reproduced unresolved tenant-isolation defect -> no P05 progression.
- Reproduced unresolved branch-isolation defect -> no P05 progression.
- Reproduced unresolved authorization bypass -> no P05 progression.
- Reproduced unresolved transaction partial-write defect -> no P05 progression.
- Fresh database cannot bootstrap -> no P05 progression.
- Generated DB type drift unresolved -> no P05 progression when generated types are required by current workflow.
- Ordinary NOT RUN browser E2E is not automatically equivalent to a security blocker; record truthfully and follow actual required gates.

# 126. R06 Implementation Stop Conditions
- Exact R06 spec missing from current main.
- R06 spec not READY.
- Latest R05 lineage cannot be identified.
- R05 branch lacks required implementation referenced by this spec.
- Acceptance requires weakening authorization.
- Acceptance requires weakening RLS.
- Acceptance requires destructive production migration.
- Acceptance requires Phase 05 implementation.
- Acceptance defect requires broad architecture redesign outside existing P04 contract.
- In any such case stop and report exact blocker.

# 127. Document Validation Checklist
- [x] Canonical filename P04/R06.
- [x] Phase 04.
- [x] Round 06.
- [x] Status READY.
- [x] Previous P04/R05.
- [x] Next P05/R01 canonical filename.
- [x] Authority source main.
- [x] Implementation parent latest R05 lineage.
- [x] Actual R05 code evidence used.
- [x] Integrated acceptance objective explicit.
- [x] New-feature prohibition explicit.
- [x] Acceptance record explicit.
- [x] Read/decision/lifecycle/exception/production-control matrices explicit.
- [x] Tenant/branch/security matrices explicit.
- [x] Concurrency matrices explicit.
- [x] Rollback matrices explicit.
- [x] Migration/generated-type acceptance explicit.
- [x] Browser evidence truthfulness explicit.
- [x] Definition of Done explicit.
- [x] Phase 05 fail-closed handoff explicit.
- [x] Implementation merge owner-controlled.

# 128. Document Internal Consistency
- R06 implements acceptance, not new P04 product behavior.
- R06 consumes R05 lineage, not docs branch lineage.
- R06 accepts all R01–R05 planes together.
- R06 allows only minimal reproduced acceptance-defect fixes.
- R06 does not merge implementation PR.
- R06 does not implement Phase 05.
- R06 acceptance record distinguishes observed from unobserved evidence.
- R06 requires fresh database proof.
- R06 preserves customer/staff authority separation.
- R06 preserves order.view/order.manage separation.
- R06 preserves append-only event evidence.

# 129. Document-Only Validation Policy
- This executable specification is validated by content, not GitHub Actions.
- Metadata must be correct.
- Phase/Round sequence must be correct.
- Current repository assumptions must be grounded in inspected implementation state.
- Architecture references must match current code paths.
- Security requirements must be fail-closed.
- Migration requirements must be safe.
- Failure/recovery requirements must be explicit.
- Validation plan must be executable and truthful.
- Definition of Done must cover all P04 planes.
- Handoff must be deterministic.
- Final line count must be within 1,800–2,500 inclusive.
- GitHub Actions are not document-validation authority.
- Hosted merge restriction is reported separately if present.

# 130. Implementation Validation Policy
- Future R06 implementation runs actual applicable repository checks.
- Document inspection is not runtime proof.
- Required implementation test failures remain failures.
- Do not weaken tests.
- Do not rename checks to evade gates.
- Do not suppress required failures.
- Do not fabricate PASS.
- Implementation PR remains owner-controlled.
- Implementation agent must not merge.
- Implementation agent must not enable auto-merge.

# 131. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P04/R06 implementation after it is on main.
- R06 implementation branch must descend from latest legitimate P04/R05 lineage.
- Documentation branch is never implementation parent.
- Owner controls implementation integration.
- Phase 05 remains blocked until its exact executable specification exists on current main.

# 132. Final R06 Handoff Summary
- R01 durable queue/detail plane is accepted or truthfully reported otherwise.
- R02 initial decision plane is accepted or truthfully reported otherwise.
- R03 normal lifecycle plane is accepted or truthfully reported otherwise.
- R04 amendment/re-review/cancellation plane is accepted or truthfully reported otherwise.
- R05 priority/defer/remake plane is accepted or truthfully reported otherwise.
- Shared authorization is accepted or truthfully reported otherwise.
- Shared RLS isolation is accepted or truthfully reported otherwise.
- Shared concurrency semantics are accepted or truthfully reported otherwise.
- Shared rollback semantics are accepted or truthfully reported otherwise.
- Fresh database bootstrap is accepted or truthfully reported otherwise.
- Generated type alignment is accepted or truthfully reported otherwise.
- Durable Phase 04 acceptance evidence is recorded.
- No Phase 05 feature is implemented.

# 133. Final Acceptance Statement
- P04/R06 is READY as an executable specification document.
- R06 exists to prove Phase 04 rather than expand it.
- Phase 04 acceptance must be assembled from the actual R01–R05 implementation chain.
- Successful conclusions require executable evidence.
- Unexecuted evidence remains NOT PROVEN or NOT RUN as applicable.
- Security failures remain blockers rather than being waived.
- Transactional integrity failures remain blockers rather than being waived.
- Migration bootstrap failures remain blockers rather than being hidden.
- Acceptance-blocking fixes remain narrow and regression-tested.
- The durable acceptance record becomes the handoff evidence for future planning.
- `FLOW_P05_R01_IMPLEMENTATION_SPEC.md` is the next canonical specification filename.
- Absence of that file on current main means Phase 05 implementation must stop.
