# FLOW P03 R06 — Implementation Specification
> Phase 03 — Core Server Data Plane + Customer Capability
> Round 06 — Phase 03 End-to-End Acceptance, Regression Closure, and Phase 04 Handoff
> Revision — Prove the complete customer data plane assembled in R01–R05, close only acceptance-blocking defects inside established Phase 03 boundaries, record durable acceptance evidence, and produce a fail-closed handoff to Phase 04 without starting Phase 04 implementation.

## Metadata
- Phase: `03`
- Round: `06`
- Status: `READY`
- Specification type: `EXECUTABLE`
- Authority source: `main`
- Target branch: `main`
- Previous: `FLOW_P03_R05_IMPLEMENTATION_SPEC.md`
- Next: `FLOW_P04_R01_IMPLEMENTATION_SPEC.md`
- Planned execution: `STATE-DRIVEN — next eligible P03 implementation slot after this specification is on main`
- Current planning scope: `PHASE 03 / ROUND 06 ONLY`
- Implementation parent: `latest completed P03/R05 implementation lineage tip`
- Expected implementation parent branch: `p03-r05-idempotency-replay`
- Observed R05 branch head at authoring: `6f85c4596f41713fea2ecec65186c3d5b42172ec`
- Observed R05 implementation PR: `#74`
- Observed R05 state: `IMPLEMENTED / SUFFICIENT HANDOFF FOR NEXT SPEC`
- Observed R05 vs R04: `2 commits ahead with meaningful implementation`
- Recommended implementation branch: `p03-r06-phase-acceptance`
- Recommended implementation PR title: `test(customer): prove Phase 03 customer data plane acceptance`
- Owner merge control: `YES`
- Agent implementation merge allowed: `NO`
- Document validation authority: `DOCUMENT CONTENT + CURRENT REPOSITORY STATE`
- GitHub Actions gate for document validation: `NO`
- Specification depth policy: `1,800–2,500 lines required`
- Phase acceptance in this round: `YES`
- Acceptance record in this round: `YES — FLOW_P03_ACCEPTANCE.md`
- End-to-end customer data-plane proof in this round: `YES`
- Acceptance-blocking defect fixes in established P03 scope: `YES — narrowly bounded and evidence-driven only`
- New Phase 04 feature work in this round: `NO`
- Payment execution in this round: `NO`
- Kitchen operational workflow in this round: `NO`
- Realtime event publication in this round: `NO`
- Notification delivery in this round: `NO`
- Production destructive database mutation: `NO`

# 1. Authoring State
- Current `main` at authoring is `1039450ab27e79ac338ea699ca72d9efcbf2c12c`.
- `FLOW_P03_R05_IMPLEMENTATION_SPEC.md` exists on current `main` and is `READY`.
- R05 `Next` points to this exact canonical R06 filename.
- No `FLOW_P03_R06_IMPLEMENTATION_SPEC.md` existed on current `main` before this document was authored.
- No `p03-r06-*` implementation branch existed at authoring.
- Latest implementation lineage is `p03-r05-idempotency-replay`.
- Latest observed R05 implementation head is `6f85c4596f41713fea2ecec65186c3d5b42172ec`.
- R05 descends from `p03-r04-customer-command-flow`.
- R05 adds persistence-backed customer command idempotency.
- R05 adds a server-only idempotent command facade.
- R05 adds deterministic request fingerprinting and key digests.
- R05 adds a transaction-coupled idempotency executor.
- R05 adds a transaction-bound idempotency repository.
- R05 integrates idempotent mutation routes.
- R05 adds a 250-line forward migration for private idempotency state and narrow SECURITY DEFINER functions.
- R05 adds integration, unit, and database idempotency tests.
- R05 therefore provides sufficient real implementation evidence for R06 acceptance design.
- This task is documentation/specification only.
- This task does not create the R06 implementation branch.
- This task does not modify runtime code.
- This task does not modify database implementation code.
- This task does not implement migrations.
- This task does not modify workflow or deployment configuration.
- This task does not merge any implementation PR.

# 2. Phase 03 Objective
- Establish a durable customer-facing server data plane without internal staff authentication.
- Establish customer capability/session trust distinct from Auth.js staff authority.
- Establish customer-safe tenant/branch/table scoped database access.
- Establish durable cart and order persistence as server authority.
- Establish customer command orchestration around durable state.
- Establish deterministic retry/replay behavior for retriable customer mutations.
- Preserve tenant isolation throughout customer operations.
- Preserve branch isolation throughout customer operations.
- Preserve capability ownership isolation without storing bearer secrets.
- Preserve staff/customer authority separation from Phase 02.
- Preserve least-privilege PostgreSQL roles and narrow function execution.
- Preserve server-derived price, currency, tenant, branch, table, and capability authority.
- Prevent duplicate order creation under duplicate, concurrent, or ambiguous request delivery.
- Leave payment, kitchen, realtime, notification, and later operational workflows to future phases.
- End Phase 03 with a durable acceptance record based on exact repository evidence.

# 3. Six-Round Phase 03 Completion Map
- `R01` — customer capability/session boundary.
- `R01` — public customer entry trust model.
- `R01` — server-issued/verifiable customer authority.
- `R01` — canonical immutable `CustomerContext`.
- `R01` — least-privilege customer-entry database boundary.
- `R02` — customer database context mapping.
- `R02` — customer transaction scope.
- `R02` — transaction-bound repository composition.
- `R02` — storefront repository.
- `R02` — menu repository.
- `R02` — customer runtime database role/context.
- `R03` — durable cart persistence.
- `R03` — durable order persistence foundation.
- `R03` — capability-owned cart/order scope.
- `R03` — snapshot semantics.
- `R03` — forward migration and RLS/grants.
- `R04` — customer cart mutation commands.
- `R04` — atomic order submit command.
- `R04` — menu availability revalidation.
- `R04` — thin customer mutation route handlers.
- `R04` — narrow order submit database primitive.
- `R05` — request key validation.
- `R05` — canonical fingerprinting.
- `R05` — private replay persistence.
- `R05` — acquire/complete database functions.
- `R05` — exact duplicate replay.
- `R05` — bounded retry/concurrency hardening.
- `R06` — end-to-end acceptance.
- `R06` — cross-round regression closure.
- `R06` — acceptance record.
- `R06` — Phase 04 fail-closed handoff.

# 4. R06 High-Impact Objective
- Prove R01–R05 compose into one coherent customer data plane.
- Prove direct customer entry resolves only valid tenant/branch/table context.
- Prove customer capability remains narrower than staff authentication and authorization.
- Prove storefront/menu reads are scoped to validated customer context.
- Prove cart state is durable and server authoritative.
- Prove cart state is capability owned.
- Prove cart state is tenant scoped.
- Prove cart state is branch scoped.
- Prove order creation snapshots canonical server values.
- Prove order submission remains atomically coupled to cart conversion.
- Prove customer mutation routes call the canonical command/idempotency layer.
- Prove same request identity replays exact committed success.
- Prove same key with changed semantic input fails deterministically.
- Prove concurrent identical first-use requests create one business mutation.
- Prove ambiguous response loss after commit is recoverable with the same key.
- Prove cross-tenant access fails closed.
- Prove sibling-branch access fails closed.
- Prove wrong-capability access fails closed.
- Prove stale/invalid capability access fails closed.
- Prove unauthorized database access fails closed.
- Prove customer runtime cannot gain staff identity authority.
- Prove customer runtime cannot gain RBAC authority.
- Prove customer runtime cannot gain payment authority.
- Prove customer runtime cannot gain kitchen authority.
- Prove fresh database migration/reset contains all P03 runtime objects.
- Prove generated database types remain intentional and drift-free.
- Create `FLOW_P03_ACCEPTANCE.md` with exact branch/SHA/spec/test evidence.
- Permit only defect fixes required to make an already-specified P03 contract true.
- Do not pull Phase 04 functionality backward into R06.

# 5. R06 Non-Goals
- Do not introduce a new customer authentication mechanism.
- Do not convert customer capability into an Auth.js session.
- Do not add staff roles.
- Do not add staff permissions.
- Do not redesign workspace authorization.
- Do not redesign menu/catalog domain.
- Do not add product browsing UI redesign.
- Do not add checkout UI redesign except minimal deterministic acceptance hooks if necessary.
- Do not execute payments.
- Do not integrate Stripe.
- Do not integrate Omise.
- Do not create payment intents.
- Do not create new payment orchestration.
- Do not create kitchen tickets.
- Do not implement kitchen status transitions.
- Do not add realtime subscriptions.
- Do not add realtime publication.
- Do not add notifications.
- Do not add a generic outbox.
- Do not add background workers.
- Do not add Redis solely for acceptance.
- Do not add queues solely for acceptance.
- Do not redesign database role topology for aesthetics.
- Do not rename established P03 modules for aesthetics.
- Do not broadly refactor R01–R05 while tests already establish the contract.
- Do not modernize unrelated dependencies.
- Do not weaken security to make tests pass.
- Do not weaken validation to make tests pass.
- Do not modify GitHub Actions merely to change status.
- Do not fabricate validation PASS results.
- Do not treat an unrun validation as PASS.
- Do not author `FLOW_P04_R01_IMPLEMENTATION_SPEC.md` inside R06 implementation.
- Do not start Phase 04 implementation.

# 6. R06 Entry Preconditions
- [ ] Exact `FLOW_P03_R06_IMPLEMENTATION_SPEC.md` exists on current `main`.
- [ ] R06 status is `READY`.
- [ ] R06 metadata is Phase 03 / Round 06.
- [ ] `Previous` is exactly `FLOW_P03_R05_IMPLEMENTATION_SPEC.md`.
- [ ] `Next` is exactly `FLOW_P04_R01_IMPLEMENTATION_SPEC.md`.
- [ ] Latest implementation parent is `p03-r05-idempotency-replay` or a later legitimate R05 head.
- [ ] Implementation parent contains meaningful R05 idempotency/replay code.
- [ ] Implementation parent still contains R01 capability code.
- [ ] Implementation parent still contains R02 customer data-access code.
- [ ] Implementation parent still contains R03 persistence repositories and migration.
- [ ] Implementation parent still contains R04 command routes/services and submission primitive.
- [ ] No newer P03 implementation branch supersedes R05.
- [ ] No R06 implementation branch already exists with meaningful work.
- [ ] Acceptance can complete without inventing undefined Phase 04 behavior.

# 7. Current Architecture Baseline — R01
- `apps/web/next-flow/src/modules/customer-capability/server/capability-codec.ts` — capability encoding/verification boundary.
- `apps/web/next-flow/src/modules/customer-capability/server/config.ts` — customer capability runtime configuration.
- `apps/web/next-flow/src/modules/customer-capability/server/current-context.ts` — current customer context resolution.
- `apps/web/next-flow/src/modules/customer-capability/server/entry-resolver.ts` — public entry resolution.
- `apps/web/next-flow/src/modules/customer-capability/server/entry-selector.ts` — entry selector normalization.
- `apps/web/next-flow/src/modules/customer-capability/server/repository.ts` — database-backed entry/capability scope validation.
- `apps/web/next-flow/src/modules/customer-capability/server/transport.ts` — customer capability transport/cookie boundary.
- `apps/web/next-flow/src/modules/customer-capability/server/types.ts` — `CustomerContext` and capability claims.
- `apps/web/next-flow/src/modules/customer-capability/server/validate-customer-capability.ts` — runtime capability validation.
- `apps/web/next-flow/src/app/api/customer/entry/route.ts` — public entry exchange endpoint.
- `apps/web/next-flow/src/server/db/customer-entry-transaction.ts` — least-privilege entry transaction role.
- `supabase/migrations/20260823170000_p03_r01_customer_capability_boundary.sql` — entry and capability database boundary.

# 8. Current Architecture Baseline — R02
- `apps/web/next-flow/src/modules/customer-data/server/context.ts` — customer database context mapping.
- `apps/web/next-flow/src/modules/customer-data/server/errors.ts` — customer data error taxonomy.
- `apps/web/next-flow/src/modules/customer-data/server/transaction.ts` — customer transaction scope and database context.
- `apps/web/next-flow/src/modules/customer-data/server/repositories.ts` — transaction-bound repository composition.
- `apps/web/next-flow/src/modules/customer-data/server/storefront-repository.ts` — customer-safe storefront reads.
- `apps/web/next-flow/src/modules/customer-data/server/storefront-service.ts` — storefront service composition.
- `apps/web/next-flow/src/modules/customer-data/server/menu-repository.ts` — customer-safe menu reads.
- `apps/web/next-flow/src/modules/customer-data/server/types.ts` — customer data read-model contracts.
- `supabase/migrations/20260823180000_p03_r02_customer_data_access.sql` — customer runtime role/context/read boundary.

# 9. Current Architecture Baseline — R03
- `apps/web/next-flow/src/modules/customer-data/server/cart-repository.ts` — durable capability-owned cart aggregate.
- `apps/web/next-flow/src/modules/customer-data/server/order-repository.ts` — durable order draft/snapshot persistence.
- `apps/web/next-flow/src/modules/customer-data/server/persistence-types.ts` — cart/order persistence DTO contracts.
- `apps/web/next-flow/src/server/db/generated/database.ts` — generated DB type surface.
- `supabase/migrations/20260823193000_p03_r03_cart_order_persistence.sql` — cart/order ownership, snapshots, privileges, RLS, constraints.
- `apps/web/next-flow/tests/integration/customer-cart-order-persistence.test.ts` — runtime persistence proof.
- `supabase/tests/database/p03_r03_cart_order_persistence.test.sql` — database persistence/security proof.

# 10. Current Architecture Baseline — R04
- `apps/web/next-flow/src/modules/customer-data/server/commands/cart-commands.ts` — cart command orchestration.
- `apps/web/next-flow/src/modules/customer-data/server/commands/submit-order.ts` — atomic cart-to-order submit orchestration.
- `apps/web/next-flow/src/modules/customer-data/server/commands/runtime.ts` — CustomerContext and transaction dependency composition.
- `apps/web/next-flow/src/modules/customer-data/server/commands/validation.ts` — bounded command input validation.
- `apps/web/next-flow/src/modules/customer-data/server/commands/errors.ts` — stable command errors.
- `apps/web/next-flow/src/modules/customer-data/server/commands/http.ts` — safe HTTP mapping.
- `apps/web/next-flow/src/modules/customer-data/server/menu-availability-repository.ts` — current menu/modifier availability checks.
- `apps/web/next-flow/src/app/api/customer/cart/route.ts` — customer cart transport.
- `apps/web/next-flow/src/app/api/customer/cart/items/route.ts` — cart-item mutation transport.
- `apps/web/next-flow/src/app/api/customer/orders/route.ts` — order submission transport.
- `supabase/migrations/20260823202000_p03_r04_customer_command_submission.sql` — narrow submitted-state primitive.

# 11. Current Architecture Baseline — R05
- `apps/web/next-flow/src/modules/customer-data/server/idempotency/customer-command-facade.ts` — canonical idempotent wrappers around R04 mutations.
- `apps/web/next-flow/src/modules/customer-data/server/idempotency/execute-idempotent-command.ts` — acquire/execute/finalize/replay and bounded retry.
- `apps/web/next-flow/src/modules/customer-data/server/idempotency/fingerprint.ts` — key digest and versioned fingerprint.
- `apps/web/next-flow/src/modules/customer-data/server/idempotency/repository.ts` — transaction-bound acquire/complete calls.
- `apps/web/next-flow/src/modules/customer-data/server/idempotency/types.ts` — command/result/acquisition contracts.
- `supabase/migrations/20260823210000_p03_r05_customer_command_idempotency.sql` — private replay table and narrow functions.
- `apps/web/next-flow/tests/integration/customer-command-idempotency.test.ts` — replay/concurrency/ambiguous-response proof.
- `apps/web/next-flow/tests/unit/customer-command-idempotency.test.ts` — key/fingerprint unit proof.
- `supabase/tests/database/p03_r05_customer_command_idempotency.test.sql` — replay state/grant/database proof.

# 12. R06 Files to CREATE
- `docs/07-delivery/development-phases/FLOW_P03_ACCEPTANCE.md` — durable Phase 03 acceptance record.
- `apps/web/next-flow/tests/integration/customer-data-plane-acceptance.test.ts` — integrated R01–R05 server/database acceptance.
- `apps/web/next-flow/tests/e2e/customer-data-plane-acceptance.spec.ts` — browser acceptance where deterministic infrastructure supports it.
- Do not create a second acceptance record under another name.
- Do not create a Phase 04 spec in the R06 implementation branch.

# 13. R06 Files to MODIFY Only When Required
- `apps/web/next-flow/package.json` — test discovery only if new acceptance tests are not automatically discovered.
- `apps/web/next-flow/playwright.config.ts` — only if existing deterministic E2E configuration cannot run the acceptance test.
- `apps/web/next-flow/src/modules/customer-capability/server/*` — only for a reproduced R01 contract defect.
- `apps/web/next-flow/src/modules/customer-data/server/*` — only for a reproduced R02–R05 contract defect.
- `apps/web/next-flow/src/app/api/customer/*` — only for a reproduced customer transport defect.
- `supabase/migrations/*` — add a new forward-only R06 corrective migration only when necessary.
- `supabase/tests/database/*` — strengthen regression proof when a DB defect is fixed.
- Every runtime modification must be tied to an acceptance defect ID in the implementation PR.

# 14. R06 Files to MOVE
- No file move is required by default.
- Do not move customer-capability modules for style.
- Do not move customer-data modules for style.
- Do not move migrations.
- Do not move historical executable specs.
- A move is allowed only when a reproduced acceptance defect cannot be fixed safely otherwise.
- Any move must preserve import boundaries and history and must be explained in the PR.

# 15. R06 Files to REMOVE
- No runtime file removal is required by default.
- Do not remove R01 capability code.
- Do not remove R02 data-access code.
- Do not remove R03 persistence code.
- Do not remove R04 command code.
- Do not remove R05 idempotency code.
- Do not remove security tests because they are inconvenient.
- A removal is allowed only for proven dead/unsafe P03 code that causes an acceptance defect.
- Every removal requires replacement/regression evidence.

# 16. DO-NOT-TOUCH Surfaces by Default
- Phase 02 Auth.js configuration.
- Phase 02 staff identity implementation.
- Phase 02 AccessContext implementation.
- Phase 02 permission evaluator.
- Phase 02 route-family authorization.
- Payment provider integrations.
- Payment execution schema beyond inherited baseline.
- Kitchen operational routes/components.
- Realtime infrastructure.
- Notification infrastructure.
- Marketing website code.
- Unrelated UI component libraries.
- Lockfiles unless an unavoidable approved dependency is required.
- GitHub workflow files for changing validation outcomes.
- Vercel configuration.
- Production secrets.
- Historical P03 migrations.
- Historical P03 executable specifications.

# 17. Acceptance Record Contract
- Title must be `FLOW Phase 03 Acceptance`.
- Metadata must identify Phase 03.
- Acceptance owner round must be `P03/R06`.
- Record exact R06 implementation branch.
- Record exact R06 implementation parent branch.
- Record exact R06 implementation parent SHA.
- Record exact R06 implementation head SHA.
- Record specification authority `main`.
- Record exact R06 spec filename.
- Record R06 spec status.
- Record whether implementation is merged to main truthfully.
- Record that GitHub Actions is not spec/document authority.
- Summarize R01 capability boundary.
- Summarize R02 data-access boundary.
- Summarize R03 persistence boundary.
- Summarize R04 command boundary.
- Summarize R05 replay boundary.
- List concrete R06 acceptance tests.
- List concrete R06 database tests.
- Record validation results using approved vocabulary.
- Record security conclusions.
- Record database role/grant conclusions.
- Record idempotency/replay conclusions.
- Record failure/recovery conclusions.
- Record known limitations.
- Record deferred Phase 04 work.
- Never claim production deployment unless observed.
- Never claim owner merge unless observed.
- Never claim browser E2E PASS if not executed.

# 18. Canonical End-to-End Authority Chain
1. Customer opens restaurant/table selector.
2. Server resolves selector under customer-entry boundary.
3. Server issues or reads customer capability.
4. Server validates capability.
5. Server materializes immutable `CustomerContext`.
6. `CustomerContext` maps to customer database context.
7. `withCustomerDataTransaction()` establishes runtime database scope.
8. Transaction-bound storefront/menu repositories read current scoped data.
9. Cart repository persists capability-owned durable cart.
10. Cart mutation transport validates customer intent.
11. Mutation transport requires idempotency key where R05 requires it.
12. R05 facade normalizes semantic intent.
13. R05 computes key digest.
14. R05 computes request fingerprint.
15. R05 transaction acquires request ownership/replay classification.
16. Replay path returns stored success without business execution.
17. Mismatch/expired/invariant path fails before business execution.
18. Winning request executes canonical R04 command in the same transaction.
19. R04 locks owned DRAFT cart as required.
20. R04 revalidates current menu/modifier availability.
21. R03 repository writes canonical persisted snapshots.
22. Order submit persists one durable order.
23. Narrow DB primitive transitions order to submitted state.
24. Source cart becomes terminal in same transaction.
25. R05 serializes stable result.
26. R05 finalizes replay-safe success before commit.
27. Transaction commits once.
28. HTTP transport returns safe response.
29. Retry with same key/fingerprint returns stored result.
30. Same key/different fingerprint returns deterministic conflict.

# 19. Capability Acceptance Matrix
| Case | Required outcome |
| --- | --- |
| valid restaurant slug + active table | entry resolves and context matches tenant/branch/table |
| unknown restaurant slug | fail closed; no capability |
| valid restaurant + unknown table code | fail closed; no capability |
| inactive/closed table | fail closed according to R01 DB contract |
| table belonging to sibling branch | fail closed |
| table belonging to another tenant | fail closed |
| tampered capability | invalid |
| expired capability | expired; no customer DB mutation |
| revoked backing scope | revoked/unavailable according to R01 contract |
| missing capability on protected mutation | safe unauthorized/missing outcome |
| staff Auth.js cookie without customer capability | not customer authority |
| customer capability presented to staff route | not staff authority |
| browser-provided tenant ID | not authority |
| browser-provided branch ID | not authority |
| browser-provided table ID conflict | not authority |
| tenant-A capability + tenant-B selector | fail closed |
| valid capability + same selector replay | stable established customer scope |
| valid capability + different table selector | server-controlled replacement/rejection only |
| malformed capability transport | invalid |
| capability version unsupported | fail closed |

# 20. Scoped Read Acceptance Matrix
| Condition | Expected result |
| --- | --- |
| storefront read valid context | exact scoped storefront |
| menu read valid context | exact scoped menu |
| menu item another tenant | not visible |
| menu item sibling branch unavailable | not available |
| archived menu item | not active customer option |
| inactive menu item | not active customer option |
| unrelated modifier group | not valid selection |
| unrelated modifier choice | not valid selection |
| missing customer DB context | fail closed |
| customer-entry role attempts cart read | denied |
| customer-runtime attempts staff identity read | denied |
| customer-runtime attempts RBAC read | denied |
| browser proposes restaurant ID | selector only; no authority |
| browser proposes branch ID | ignored/not accepted as authority |
| browser proposes tenant ID | ignored/not accepted as authority |

# 21. Durable Cart Acceptance Matrix
| Scenario | Required result |
| --- | --- |
| first create/get active cart | one DRAFT cart in trusted scope |
| repeat natural get/create | stable existing active cart |
| add valid menu item | persisted canonical snapshot |
| add valid modifiers | durable modifier snapshots |
| add quantity 0 | rejected |
| add negative quantity | rejected |
| add quantity above bound | rejected |
| add inactive menu item | rejected |
| add cross-tenant menu item | rejected |
| add forged price | not accepted as authority |
| add forged currency | not accepted as authority |
| update owned quantity | durable atomic change |
| update other capability item | not accessible |
| update sibling-branch cart | not accessible |
| update cross-tenant cart | not accessible |
| remove owned item | durable removal |
| remove already removed with new key | normal not-found |
| remove already removed with original key | replay original success |
| mutate terminal cart | rejected |
| read other capability cart | not accessible |
| read sibling-branch cart | not accessible |
| read cross-tenant cart | not accessible |
| cart currency mixed across items | invariant failure |
| negative computed line total | invariant failure |
| invalid menu UUID | rejected before persistence |
| invalid cart UUID | rejected before persistence |

# 22. Durable Order Acceptance Matrix
| Scenario | Required result |
| --- | --- |
| submit populated owned DRAFT cart | one submitted order |
| submit empty cart | rejected; no order |
| submit unavailable item | rejected before commit |
| submit invalid modifier availability | rejected before commit |
| submit other capability cart | not accessible |
| submit sibling-branch cart | not accessible |
| submit cross-tenant cart | not accessible |
| order tenant ownership | server derived |
| order branch ownership | server derived |
| order table ownership | server derived |
| order capability ownership | server derived |
| item name snapshot | durable historical value |
| item price snapshot | canonical server value |
| modifier snapshots | durable historical values |
| order subtotal | deterministic from canonical persisted data |
| client subtotal | not authority |
| client order number | not authority |
| submitted timestamp | server/database generated |
| source cart conversion | same transaction |
| order persistence failure | rollback |
| cart conversion failure | rollback order |
| same source cart different key after success | no second order |
| submitted order direct customer status mutation | denied except narrow established path |
| order update through broad table grant | must not exist |

# 23. Idempotency Acceptance Matrix
| Scenario | Required result |
| --- | --- |
| valid UUID-v4 key on add | execute once |
| same add key + same normalized payload | replay |
| same add key + changed quantity | mismatch |
| same add key + same modifiers different order | same semantic fingerprint |
| same update key + same input | replay |
| same update key + changed quantity | mismatch |
| same remove key + same input after deletion | replay |
| new-key remove after deletion | not-found |
| same submit key after response loss | same order replay |
| same submit key + changed note | mismatch |
| concurrent same-key add | one execute + one replay |
| concurrent same-key submit | one order |
| same raw key different capability | independent scope |
| same raw key different branch | independent trusted scope |
| same raw key different tenant | independent trusted scope |
| malformed key | reject before mutation |
| missing key add | reject |
| missing key update | reject |
| missing key remove | reject |
| missing key submit | reject |
| raw key persisted | must be false |
| key digest | 64 lower-hex |
| request fingerprint | 64 lower-hex |
| retained expired record | deterministic expired result |
| unexpected committed IN_PROGRESS | fail closed |
| unsupported replay response version | invariant failure |
| first deadlock/serialization | at most one internal retry |
| second retryable failure | safe unavailable |
| mismatch request | no command callback |
| replay request | no command callback |

# 24. Transaction and Locking Acceptance
| Race/transaction case | Required invariant |
| --- | --- |
| cart add | replay acquisition + mutation same transaction |
| cart update | replay acquisition + mutation same transaction |
| cart remove | replay acquisition + mutation same transaction |
| order submit | replay acquisition + all business writes same transaction |
| submit vs update | cart parent lock prevents mixed snapshot |
| submit vs remove | cart parent lock prevents mixed snapshot |
| same-key concurrent mutations | unique scope serializes ownership |
| different-key same-cart submit | lock + one-cart-one-order prevents duplicate |
| business validation error | replay owner row rolls back |
| idempotency finalization error | business mutation rolls back |
| connection failure before commit | no partial mutation |
| response loss after commit | same-key replay recovers |
| retry 40001 | same identity, one bounded retry |
| retry 40P01 | same identity, one bounded retry |
| arbitrary validation error | no transaction retry loop |

# 25. Database Role Acceptance Matrix
| Principal | Expected P03 authority |
| --- | --- |
| `flow_customer_entry` | entry functions only; no cart/order/replay direct authority |
| `flow_customer_runtime` | narrow customer data/command functions only |
| `flow_runtime` | internal runtime remains separate |
| `flow_identity` | identity boundary remains separate |
| `flow_authenticator` | authentication boundary remains separate |
| `anon` | no direct P03 persistence authority |
| `authenticated` | no direct P03 persistence authority from JWT role alone |
| `public` | no direct private replay table/function authority |

# 26. RLS and Function Security Acceptance
- [ ] R01 SECURITY DEFINER functions use fixed safe search paths where applicable.
- [ ] R04 submit function uses fixed safe search path.
- [ ] R05 acquire function uses fixed `pg_catalog, private` search path.
- [ ] R05 complete function uses fixed `pg_catalog, private` search path.
- [ ] Direct privileges on `private.customer_command_idempotency` are revoked.
- [ ] Only intended runtime role can execute R05 acquire.
- [ ] Only intended runtime role can execute R05 complete.
- [ ] Function scope derives tenant from transaction-local trusted context.
- [ ] Function scope derives branch from transaction-local trusted context.
- [ ] Function scope derives capability from transaction-local trusted context.
- [ ] Caller cannot pass tenant authority into R05 functions.
- [ ] Caller cannot pass branch authority into R05 functions.
- [ ] Caller cannot pass capability authority into R05 functions.
- [ ] Order submit function rechecks trusted scope.
- [ ] Order submit function rechecks exact DRAFT state.
- [ ] Customer runtime cannot arbitrary-update submitted lifecycle.
- [ ] Cross-tenant UUID knowledge does not grant row visibility.
- [ ] Sibling-branch UUID knowledge does not grant row visibility.
- [ ] Same tenant/branch different capability does not grant cart ownership.
- [ ] Missing customer transaction context fails closed.
- [ ] Transaction-local context does not leak through pooled connections.

# 27. Customer/Staff Authority Separation
- [ ] Customer capability contains no internal role grant.
- [ ] Customer capability contains no staff membership grant.
- [ ] Customer capability contains no permission code grant.
- [ ] Customer capability cannot be exchanged for Auth.js authority.
- [ ] Auth.js staff session does not become table capability automatically.
- [ ] Customer routes do not derive staff actor UUID from customer capability.
- [ ] Staff permission evaluation remains Phase 02 authority.
- [ ] Customer DB context cannot set arbitrary actor identity.
- [ ] Customer runtime cannot access staff RBAC tables through ordinary customer path.
- [ ] Customer submit does not invoke internal staff permission evaluator.
- [ ] Separation is proven at application and database boundaries where feasible.

# 28. Transport Security Acceptance
- [ ] Mutation routes use non-GET methods.
- [ ] Same-origin checks remain active when `Origin` is present.
- [ ] Mutation body size remains bounded.
- [ ] Unknown fields remain rejected where established by R04.
- [ ] UUID selectors are validated.
- [ ] Quantity bounds are validated.
- [ ] Special request length is bounded.
- [ ] Customer note length is bounded.
- [ ] Free text is treated as data.
- [ ] SQL parameters remain bound through Kysely/tagged SQL.
- [ ] Public errors do not expose SQL.
- [ ] Public errors do not expose stack traces.
- [ ] Public errors do not expose database roles.
- [ ] Public errors do not expose capability material.
- [ ] Public errors do not expose raw idempotency keys.
- [ ] Idempotency keys are not placed in URLs.
- [ ] Replayed success includes replay marker only where R05 established it.
- [ ] Replay preserves original success status.
- [ ] Mismatch maps to stable safe conflict.
- [ ] Expired maps to stable safe error.
- [ ] Invariant errors do not trigger business reexecution.

# 29. Secret and Log-Redaction Acceptance
- [ ] Never log raw capability bearer material.
- [ ] Never persist raw capability bearer material in cart rows.
- [ ] Never persist raw capability bearer material in order rows.
- [ ] Never persist raw capability bearer material in replay rows.
- [ ] Never log raw idempotency keys in routine request logs.
- [ ] Prefer safe digest correlation when operationally necessary.
- [ ] Never log full replay bodies when they may contain customer free text.
- [ ] Never log `DATABASE_URL`.
- [ ] Never log Auth.js secrets.
- [ ] Never place credentials in `FLOW_P03_ACCEPTANCE.md`.
- [ ] Acceptance failures may record safe UUIDs only when they are not bearer secrets.
- [ ] Public responses never include stack traces.

# 30. Failure and Recovery Matrix
| Failure | Expected state | Recovery |
| --- | --- | --- |
| entry DB unavailable | unavailable; no fabricated capability | retry after recovery |
| invalid capability | deny before customer DB work | new valid entry required |
| expired capability | deny mutation | re-entry/renewal per R01 |
| menu read DB failure | safe unavailable | retry read |
| cart validation failure | no durable change | correct input |
| cart DB failure | rollback | same-key retry if identity established |
| unavailable menu on submit | no order | customer updates cart |
| order persistence failure | rollback | same-key retry after recovery |
| submit transition failure | rollback | same-key retry after recovery |
| cart conversion failure | rollback | same-key retry after recovery |
| idempotency mismatch | no command | new key for new intent |
| idempotency expired | no unsafe mutation | new identity only after client resolves intent |
| idempotency completion failure | rollback mutation | same-key retry |
| deadlock 40P01 | one internal retry | unavailable if repeated |
| serialization 40001 | one internal retry | unavailable if repeated |
| response lost after commit | client retries same key | stored success replay |
| connection drops before commit | rollback | same-key retry may execute |
| duplicate click | preserved key deduplicates | replay |
| concurrent different-key submit | one-cart-one-order protects | loser gets deterministic conflict/state |

# 31. Migration Acceptance
- [ ] Fresh database applies all history in order.
- [ ] Phase 02 auth/RLS baseline initializes.
- [ ] R01 customer capability migration applies.
- [ ] R02 customer data-access migration applies after R01.
- [ ] R03 persistence migration applies after R02.
- [ ] R04 command submission migration applies after R03.
- [ ] R05 idempotency migration applies after R04.
- [ ] R06 does not edit historical migration files.
- [ ] Any R06 DB fix is forward-only.
- [ ] Fresh reset creates expected customer roles.
- [ ] Fresh reset creates expected customer functions.
- [ ] Fresh reset creates cart/order constraints.
- [ ] Fresh reset creates R05 replay table.
- [ ] Fresh reset creates R05 unique scoped request constraint.
- [ ] Fresh reset creates R05 expiry index.
- [ ] Fresh reset enables RLS on private replay table.
- [ ] Fresh reset revokes direct replay table access.
- [ ] Fresh reset grants narrow replay functions only to intended runtime.
- [ ] Generated type drift remains intentional and clean.
- [ ] Private replay table remains intentionally outside generated application schema include pattern.
- [ ] No R06 migration performs destructive production data deletion.
- [ ] No R06 migration weakens Phase 02 authorization.

# 32. Data Integrity Acceptance
- [ ] Every cart has valid tenant ownership.
- [ ] Every cart has valid branch ownership.
- [ ] Table-bound cart matches trusted table scope.
- [ ] Cart capability ownership identifier is opaque and non-secret.
- [ ] Cart item quantity is positive.
- [ ] Cart item quantity is bounded.
- [ ] Cart item price snapshot is non-negative under current domain contract.
- [ ] Cart item currency is canonical.
- [ ] Cart modifier belongs to exact cart item.
- [ ] Every order has valid tenant ownership.
- [ ] Every order has valid branch ownership.
- [ ] Submitted order has required submission metadata.
- [ ] Order item quantity is positive.
- [ ] Order item quantity is bounded.
- [ ] Order item name snapshot survives later menu mutation.
- [ ] Modifier display snapshots survive later menu mutation.
- [ ] Order subtotal equals deterministic line totals.
- [ ] Source cart relation is explicit.
- [ ] One source cart cannot create multiple orders.
- [ ] Replay rows bind tenant.
- [ ] Replay rows bind branch.
- [ ] Replay rows bind capability.
- [ ] Replay rows bind command.
- [ ] Replay rows bind key digest.
- [ ] Replay rows bind request fingerprint.
- [ ] SUCCEEDED replay row contains response metadata.
- [ ] IN_PROGRESS replay row cannot contain success response under DB checks.
- [ ] Replay expiry is after creation.

# 33. Acceptance Test Architecture
- Use unit tests for pure key/fingerprint/validation/serialization rules.
- Use integration tests for CustomerContext + transaction + repositories + commands + replay composition.
- Use pgTAP for grants, constraints, functions, RLS, and direct-role denial.
- Use browser E2E for public entry/cookie/transport semantics where deterministic.
- Do not rely only on mocks for Phase 03 acceptance.
- Do not rely only on browser E2E for database security claims.
- Do not use GitHub Actions status itself as acceptance semantics.
- Record actual runtime command outcomes in implementation PR.
- Keep acceptance tests clearly named for future regression use.
- Reuse existing seeded fixtures when appropriate.
- Keep Tenant A / Tenant B fixtures explicit.
- Keep sibling-branch fixture explicit.
- Keep other-customer fixture explicit.
- Isolate durable rows between tests.
- Parallel tests use unique keys and cart IDs.
- Concurrency tests use truly concurrent calls.
- Ambiguous-response test must ignore first committed result and replay same key.

# 34. Required Unit Test Matrix
- [ ] normalize valid UUID-v4 idempotency key.
- [ ] reject malformed idempotency key.
- [ ] key digest is deterministic.
- [ ] different raw key creates different digest.
- [ ] canonical fingerprint is deterministic.
- [ ] modifier choice order normalization preserves semantic fingerprint.
- [ ] changed quantity changes fingerprint.
- [ ] changed cart ID changes fingerprint.
- [ ] changed cart item ID changes fingerprint.
- [ ] changed menu item ID changes fingerprint.
- [ ] changed customer note changes submit fingerprint.
- [ ] changed special request changes add fingerprint.
- [ ] result deserializer rejects malformed cart replay payload.
- [ ] result deserializer rejects malformed order replay payload.
- [ ] submitted-order replay timestamp must parse.
- [ ] unsupported response version produces invariant error.
- [ ] retry classifier recognizes `40001`.
- [ ] retry classifier recognizes `40P01`.
- [ ] retry classifier rejects validation error as transient.
- [ ] command validation rejects quantity below bound.
- [ ] command validation rejects quantity above bound.
- [ ] special request length remains bounded.
- [ ] customer note length remains bounded.
- [ ] UUID normalization is stable.
- [ ] optional text normalization is stable.

# 35. Integration Tests — Capability and Reads
- [ ] Resolve valid customer entry against real database fixtures.
- [ ] Reject unknown restaurant slug.
- [ ] Reject wrong table code.
- [ ] Validate context tenant ID.
- [ ] Validate context restaurant ID.
- [ ] Validate context branch ID.
- [ ] Validate context table ID.
- [ ] Validate capability ID is server controlled.
- [ ] Reject stale/closed backing scope when testable.
- [ ] Run storefront read under valid context.
- [ ] Run menu read under valid context.
- [ ] Prove Tenant B menu is absent from Tenant A context.
- [ ] Prove sibling-branch unavailable item is not accepted.
- [ ] Prove missing context blocks customer data transaction.
- [ ] Prove customer-entry role does not become customer-runtime role.

# 36. Integration Tests — Cart and Order
- [ ] Create durable active cart.
- [ ] Repeat get/create and prove stable active cart behavior.
- [ ] Add valid item.
- [ ] Verify persisted item price snapshot.
- [ ] Verify persisted item currency.
- [ ] Verify persisted modifier snapshots.
- [ ] Update quantity.
- [ ] Verify durable aggregate after update.
- [ ] Remove item.
- [ ] Verify durable aggregate after remove.
- [ ] Reject cross-capability mutation.
- [ ] Reject cross-tenant mutation.
- [ ] Reject sibling-branch mutation.
- [ ] Submit populated cart.
- [ ] Verify one order row.
- [ ] Verify order items.
- [ ] Verify order modifiers.
- [ ] Verify subtotal.
- [ ] Verify submitted status.
- [ ] Verify customer status.
- [ ] Verify source cart terminal state.
- [ ] Verify exactly one order for source cart.
- [ ] Verify availability revalidation before submit.
- [ ] Force safe mid-transaction failure and prove rollback where feasible.

# 37. Integration Tests — Idempotency
- [ ] First add with key executes once.
- [ ] Exact add replay returns original aggregate.
- [ ] Same add key changed quantity mismatches.
- [ ] Same add key changed menu item mismatches.
- [ ] Same add key changed modifier set mismatches.
- [ ] First update with key executes once.
- [ ] Exact update replay returns original aggregate.
- [ ] Same update key changed quantity mismatches.
- [ ] First remove with key executes once.
- [ ] Exact remove replay succeeds after deletion.
- [ ] New-key remove after deletion returns not-found.
- [ ] First submit with key creates one order.
- [ ] Exact submit replay returns exact order ID.
- [ ] Exact submit replay returns exact order number.
- [ ] Exact submit replay returns exact submitted time.
- [ ] Same submit key changed note mismatches.
- [ ] Two concurrent same-key adds create one item.
- [ ] Two concurrent same-key submits create one order.
- [ ] Same raw key under another capability executes independently.
- [ ] Same raw key under another tenant executes independently.
- [ ] Malformed key produces no business write.
- [ ] Lost-response simulation recovers committed submit.
- [ ] Replay does not rerun current availability validation.
- [ ] Replay does not require cart to remain DRAFT.
- [ ] Replay does not require removed item to exist.

# 38. Database/pgTAP Matrix
- [ ] R01 entry role exists.
- [ ] R01 entry resolution function exists.
- [ ] R01 capability scope validation function exists.
- [ ] R02 customer runtime role exists.
- [ ] R02 current tenant context function exists.
- [ ] R02 current branch context function exists.
- [ ] R02 current capability context function exists.
- [ ] R03 cart ownership columns exist.
- [ ] R03 cart item snapshot columns exist.
- [ ] R03 order source-cart relation exists.
- [ ] R03 one-cart-one-order uniqueness exists.
- [ ] R03 customer runtime grants are narrow.
- [ ] R04 submit function exists.
- [ ] R04 submit function grant is narrow.
- [ ] R05 private replay table exists.
- [ ] R05 command check allows only finite command codes.
- [ ] R05 key digest check enforces 64 lower-hex characters.
- [ ] R05 fingerprint check enforces 64 lower-hex characters.
- [ ] R05 status check enforces established states.
- [ ] R05 response check rejects invalid IN_PROGRESS response data.
- [ ] R05 response check rejects incomplete SUCCEEDED result.
- [ ] R05 scope-key uniqueness prevents duplicate ownership.
- [ ] R05 expiry index exists.
- [ ] R05 table RLS is enabled.
- [ ] R05 direct SELECT denied to customer runtime.
- [ ] R05 direct INSERT denied to customer runtime.
- [ ] R05 direct UPDATE denied to customer runtime.
- [ ] R05 direct DELETE denied to customer runtime.
- [ ] R05 acquire execute allowed only to intended runtime.
- [ ] R05 complete execute allowed only to intended runtime.
- [ ] R05 acquire denied to public.
- [ ] R05 acquire denied to anon.
- [ ] R05 acquire denied to authenticated.
- [ ] R05 acquire denied to customer-entry role.
- [ ] R05 complete denied to public.
- [ ] R05 complete denied to anon.
- [ ] R05 complete denied to authenticated.
- [ ] R05 complete denied to customer-entry role.
- [ ] Completion cannot finalize another capability's record.
- [ ] Same raw key different capability scopes independently.
- [ ] Missing context makes acquire fail closed.
- [ ] Missing context makes complete fail closed.
- [ ] Cross-tenant cart access denied.
- [ ] Cross-tenant order access denied.
- [ ] Sibling-branch cart access denied.
- [ ] Sibling-branch order access denied.

# 39. Browser E2E Acceptance
- [ ] Open valid direct customer entry URL.
- [ ] Customer entry works without staff login.
- [ ] Invalid entry shows safe error state.
- [ ] Customer page loads scoped storefront data.
- [ ] Customer page loads scoped menu data.
- [ ] Create/get cart through customer route.
- [ ] Add item with `Idempotency-Key`.
- [ ] Replay exact add and verify replay marker if harness supports header assertions.
- [ ] Update item with new request identity.
- [ ] Remove item with new request identity.
- [ ] Build populated cart.
- [ ] Submit order with `Idempotency-Key`.
- [ ] Replay submit with same key.
- [ ] Verify same order identity.
- [ ] Verify duplicate click does not create duplicate order when request key is preserved.
- [ ] Mutation without required idempotency key fails safely.
- [ ] Wrong-origin mutation fails under R04 policy.
- [ ] Invalid capability cannot mutate cart.
- [ ] Invalid capability cannot submit order.
- [ ] Customer-only authority cannot access staff route.
- [ ] Staff route does not accept customer capability as internal permission.

# 40. Cross-Tenant Negative Matrix
- [ ] Tenant B capability cannot read Tenant A cart.
- [ ] Tenant B capability cannot add to Tenant A cart.
- [ ] Tenant B capability cannot update Tenant A cart item.
- [ ] Tenant B capability cannot remove Tenant A cart item.
- [ ] Tenant B capability cannot submit Tenant A cart.
- [ ] Tenant B capability cannot read Tenant A order where customer read is exposed.
- [ ] Tenant B capability cannot complete Tenant A replay record.
- [ ] Tenant B capability cannot replay Tenant A request by raw key alone.
- [ ] Tenant B capability cannot select Tenant A menu item as authority.
- [ ] Tenant B capability cannot choose Tenant A branch through body input.
- [ ] Tenant B capability cannot choose Tenant A tenant through body input.
- [ ] Tenant B capability cannot choose Tenant A table through body input.
- [ ] Tenant B capability cannot infer private replay record contents.
- [ ] Tenant B capability cannot bypass RLS with guessed UUID.
- [ ] Tenant B same raw request key remains independent.

# 41. Sibling-Branch Negative Matrix
- [ ] Branch A2 capability cannot read Branch A1 cart.
- [ ] Branch A2 capability cannot add to Branch A1 cart.
- [ ] Branch A2 capability cannot update Branch A1 item.
- [ ] Branch A2 capability cannot remove Branch A1 item.
- [ ] Branch A2 capability cannot submit Branch A1 cart.
- [ ] Branch A2 capability cannot access Branch A1 order.
- [ ] Branch A2 capability cannot complete Branch A1 replay record.
- [ ] Branch A2 capability cannot broaden scope with branch ID body field.
- [ ] Branch A2 table selector cannot override validated Branch A1 capability.
- [ ] Same raw request key in Branch A2 is isolated by trusted scope.

# 42. Cross-Capability Negative Matrix
- [ ] Same tenant/branch different capability cannot read another cart.
- [ ] Same tenant/branch different capability cannot add to another cart.
- [ ] Same tenant/branch different capability cannot update another cart item.
- [ ] Same tenant/branch different capability cannot remove another cart item.
- [ ] Same tenant/branch different capability cannot submit another cart.
- [ ] Same tenant/branch different capability cannot read another customer order where protected.
- [ ] Same tenant/branch different capability raw key does not replay another customer's result.
- [ ] Browser-supplied capability ID is not authority.
- [ ] Capability ownership cannot be switched by request body.
- [ ] Capability ownership cannot be switched by query string.

# 43. Boundary and Invalid-Input Matrix
- [ ] Empty restaurant slug is rejected/invalid.
- [ ] Oversized restaurant slug is rejected.
- [ ] Empty table code is rejected/invalid.
- [ ] Oversized table code is rejected.
- [ ] Malformed cart UUID is rejected.
- [ ] Malformed cart item UUID is rejected.
- [ ] Malformed menu item UUID is rejected.
- [ ] Malformed modifier choice UUID is rejected.
- [ ] Excess modifier choices are rejected.
- [ ] Duplicate modifier semantics follow established R04 validation.
- [ ] Quantity zero is rejected.
- [ ] Quantity negative is rejected.
- [ ] Quantity non-integer is rejected.
- [ ] Quantity above bound is rejected.
- [ ] Whitespace-only special request normalizes safely.
- [ ] Oversized special request is rejected.
- [ ] Whitespace-only customer note normalizes safely.
- [ ] Oversized customer note is rejected.
- [ ] Missing body is rejected when body required.
- [ ] Invalid JSON is rejected.
- [ ] Unknown body field is rejected where R04 enforces strict schema.
- [ ] Oversized request body is rejected.
- [ ] Missing add idempotency key is rejected.
- [ ] Missing update idempotency key is rejected.
- [ ] Missing remove idempotency key is rejected.
- [ ] Missing submit idempotency key is rejected.
- [ ] Non-UUID idempotency key is rejected.
- [ ] Unsupported UUID version/variant is rejected if validator requires UUID-v4.

# 44. Replay Result Contract
- [ ] Replay response is semantically identical to original committed success DTO.
- [ ] Replay preserves original success status code.
- [ ] Replay does not rerun business command callback.
- [ ] Replay does not rerun menu availability validation after successful commit.
- [ ] Replay does not require source cart to remain DRAFT.
- [ ] Replay does not require removed item to still exist.
- [ ] Replay does not generate new order number.
- [ ] Replay does not generate new submitted timestamp.
- [ ] Replay does not regenerate price snapshots.
- [ ] Replay does not regenerate modifier snapshots.
- [ ] Replay rejects stored unsupported response version.
- [ ] Replay deserializer validates stored cart DTO.
- [ ] Replay deserializer validates stored order DTO.
- [ ] Replay marker is transport metadata only.
- [ ] Replay marker does not change business payload.

# 45. Performance and Resource Safety
- [ ] Storefront read query count remains bounded.
- [ ] Menu read query count remains bounded.
- [ ] Cart aggregate load avoids obvious per-modifier N+1 queries.
- [ ] Order persistence continues batched inserts where established.
- [ ] Replay acquisition uses indexed unique scope.
- [ ] Replay expiry has supporting index.
- [ ] No customer request performs unbounded replay-table scan.
- [ ] No polling loop waits indefinitely on IN_PROGRESS state.
- [ ] Transaction retry remains bounded.
- [ ] Request body size remains bounded.
- [ ] Special request size remains bounded.
- [ ] Customer note size remains bounded.
- [ ] Modifier count remains bounded.
- [ ] Quantity remains bounded.
- [ ] R06 concurrency tests are controlled and deterministic.
- [ ] R06 does not introduce new cache solely for acceptance.
- [ ] R06 does not introduce background cleanup scheduler solely for acceptance.
- [ ] Replay retention cleanup remains deferred operational maintenance if no scheduler exists.

# 46. Observability Acceptance
- [ ] Command errors keep stable machine-readable codes.
- [ ] Idempotency mismatch is distinguishable.
- [ ] Idempotency expired is distinguishable.
- [ ] Idempotency invariant failure is distinguishable.
- [ ] Transient unavailable is distinguishable from business validation.
- [ ] Safe command code may be logged.
- [ ] Safe tenant/branch IDs may be logged only under repository logging policy.
- [ ] Key digest may be logged only if needed for correlation.
- [ ] Raw key is never logged.
- [ ] Bearer capability is never logged.
- [ ] Safe resource ID may be logged after commit if policy allows.
- [ ] Acceptance record notes observability gaps instead of inventing telemetry.
- [ ] R06 does not add third-party telemetry dependency solely for acceptance.

# 47. Compatibility and Regression Requirements
- [ ] Phase 02 Auth.js sign-in remains functional after any R06 fix.
- [ ] Phase 02 staff route protection remains functional.
- [ ] Phase 02 AccessContext remains functional.
- [ ] Phase 02 permission enforcement remains functional.
- [ ] R01 direct customer entry remains functional.
- [ ] R01 invalid capability behavior remains functional.
- [ ] R01 expired capability behavior remains functional.
- [ ] R02 storefront read remains functional.
- [ ] R02 menu read remains functional.
- [ ] R03 cart persistence remains functional.
- [ ] R03 order persistence remains functional.
- [ ] R04 add command remains functional.
- [ ] R04 update command remains functional.
- [ ] R04 remove command remains functional.
- [ ] R04 submit command remains functional.
- [ ] R05 add replay remains functional.
- [ ] R05 update replay remains functional.
- [ ] R05 remove replay remains functional.
- [ ] R05 submit replay remains functional.
- [ ] Existing Phase 03 database tests remain regression authority.
- [ ] Existing Phase 03 unit/integration tests remain regression authority.
- [ ] Next.js build remains successful when implementation is ready.
- [ ] Generated DB type drift remains intentional and clean.

# 48. Acceptance-Blocking Defect Fix Policy
- A defect must reproduce on exact R05 lineage.
- A defect must violate an already-established R01–R05 contract.
- Fix the smallest authoritative layer.
- Prefer source-of-truth invariant fixes over test workarounds.
- Do not weaken assertions to accept incorrect behavior.
- Do not broaden grants to simplify tests.
- Do not skip concurrency tests because they expose a race.
- Do not remove idempotency requirements because fixtures omit keys.
- Update fixtures/clients inside existing P03 contract instead.
- Do not edit historical migrations.
- Add forward-only corrective migration if DB change is required.
- Do not create new product behavior under defect repair label.
- Every defect fix must add or strengthen regression proof.
- PR must list every defect fix separately.
- If defect requires undefined Phase 04 semantics, stop and report blocker.

# 49. Defect Classification
| Code | Meaning | Required response |
| --- | --- | --- |
| `AUTHORITY_BYPASS` | wrong principal/client input broadens authority | security blocker; fix source of truth |
| `CROSS_TENANT_READ` | customer reads another tenant | fix scope/RLS; add negative test |
| `CROSS_TENANT_WRITE` | customer mutates another tenant | fix scope/RLS; add negative test |
| `CROSS_BRANCH_ACCESS` | sibling branch access succeeds | fix branch invariant |
| `CROSS_CAPABILITY_ACCESS` | unrelated capability accesses owned resource | fix ownership invariant |
| `CAPABILITY_REPLAY_SCOPE` | invalid/expired capability still mutates | fix R01 validation path |
| `CLIENT_PRICE_AUTHORITY` | client price/currency affects order | restore server authority |
| `PARTIAL_ORDER_COMMIT` | failed submit leaves partial state | fix transaction composition |
| `DUPLICATE_ORDER` | duplicate/concurrent submit creates multiple orders | fix uniqueness/locking/replay |
| `REPLAY_REEXECUTION` | successful same-key replay reruns command | fix acquire/replay order |
| `REPLAY_PAYLOAD_DRIFT` | replay recomputes different success | restore stored result |
| `IDEMPOTENCY_SCOPE_COLLISION` | unrelated scope collides on key | fix trusted unique scope |
| `IDEMPOTENCY_MISMATCH_EXECUTES` | changed payload executes second mutation | fail before command |
| `UNBOUNDED_RETRY` | transient failure causes unlimited attempts | restore bounded retry |
| `PRIVILEGE_BROADENING` | customer role gains broad authority | revoke; narrow grants/functions |
| `SECRET_LEAK` | bearer/raw key/secret exposed | redact/remove exposure |
| `MIGRATION_DRIFT` | fresh DB cannot reproduce P03 | forward corrective migration |
| `TYPE_DRIFT` | generated types mismatch intended schemas | regenerate/correct include |
| `TRANSPORT_BYPASS` | route bypasses canonical command/replay layer | restore facade path |
| `TEST_ONLY_FAILURE` | test is wrong but source contract is correct | fix fixture/assertion only |

# 50. Implementation Order
1. Re-read current main README.
2. Re-read current merge policy.
3. Re-read exact R06 spec.
4. Resolve exact latest R05 branch/head.
5. Create `p03-r06-phase-acceptance` from R05 head.
6. Inventory inherited R01 source/tests.
7. Inventory inherited R02 source/tests.
8. Inventory inherited R03 source/tests.
9. Inventory inherited R04 source/tests.
10. Inventory inherited R05 source/tests.
11. Run/inspect existing unit tests.
12. Run/inspect existing integration tests.
13. Run/inspect existing database tests on fresh DB.
14. Build integrated acceptance fixture.
15. Create server/database acceptance integration suite.
16. Create browser acceptance suite when deterministic infrastructure supports it.
17. Add cross-tenant negatives.
18. Add sibling-branch negatives.
19. Add cross-capability negatives.
20. Add ambiguous-response acceptance.
21. Add concurrent same-key acceptance.
22. Reproduce any failing P03 invariant.
23. Classify each acceptance defect.
24. Fix only acceptance-blocking P03 defects.
25. Add regression for every defect fix.
26. Re-run affected unit tests.
27. Re-run affected integration tests.
28. Re-run affected database tests.
29. Run fresh database reset/migrations.
30. Run full Phase 03 pgTAP suite.
31. Run generated type drift validation.
32. Run lint.
33. Run typecheck.
34. Run application tests.
35. Run Next.js build.
36. Run relevant browser E2E when environment permits.
37. Create `FLOW_P03_ACCEPTANCE.md` from observed evidence.
38. Review final R06 diff against R05.
39. Confirm no Phase 04 work.
40. Open exactly one R06 implementation PR.
41. Stop; do not merge implementation PR.

# 51. Validation Commands
- Use repository-existing dependency integrity command when applicable.
- Use repository-existing lint command.
- Use repository-existing typecheck command.
- Use repository-existing unit/integration test command.
- Use explicit R06 acceptance integration command if script is added.
- Use repository-existing Next.js build command.
- Use repository-existing Supabase start/reset command.
- Use repository-existing database pgTAP command.
- Use repository-existing database lint command.
- Use repository-existing generated type drift command.
- Use repository-existing browser E2E command when environment permits.
- Do not invent commands that do not exist.
- Record command and result in implementation PR.

Validation result vocabulary:
```text
PASS
FAIL
NOT RUN
BLOCKED
NOT APPLICABLE
```

# 52. Required Validation Evidence
- [ ] Exact R06 spec filename.
- [ ] Exact R06 spec `READY` state from current main.
- [ ] Exact implementation parent branch.
- [ ] Exact implementation parent SHA.
- [ ] Exact R06 implementation head SHA.
- [ ] R05→R06 changed-file list.
- [ ] Test-only files classification.
- [ ] Acceptance-document files classification.
- [ ] Defect-fix files classification.
- [ ] Dependency/lockfile change declaration.
- [ ] Migration change declaration.
- [ ] Role/grant/RLS change declaration.
- [ ] Unit test result.
- [ ] Integration test result.
- [ ] R06 acceptance integration result.
- [ ] Database pgTAP result.
- [ ] Fresh reset/migration result.
- [ ] DB lint result.
- [ ] Generated type drift result.
- [ ] Lint result.
- [ ] Typecheck result.
- [ ] Next.js build result.
- [ ] Browser E2E result or truthful NOT RUN/BLOCKED reason.
- [ ] Known limitations.
- [ ] Deferred Phase 04 work.
- [ ] `FLOW_P03_ACCEPTANCE.md` path.
- [ ] Statement that implementation agent did not merge implementation PR.

# 53. Definition of Done — Capability
- [ ] Valid direct entry produces server-verifiable customer context.
- [ ] Invalid selectors fail closed.
- [ ] Expired capability fails closed.
- [ ] Invalid capability fails closed.
- [ ] Customer capability never becomes staff Auth.js authority.
- [ ] CustomerContext contains only established customer scope.
- [ ] Bearer capability secret is not persisted in cart state.
- [ ] Bearer capability secret is not persisted in order state.
- [ ] Bearer capability secret is not persisted in replay state.
- [ ] Customer-entry DB role remains least privilege.

# 54. Definition of Done — Data Access
- [ ] Customer transactions derive scope from validated context.
- [ ] Storefront reads are tenant/branch/restaurant scoped.
- [ ] Menu reads are tenant/branch/restaurant scoped.
- [ ] Cross-tenant reads are denied.
- [ ] Sibling-branch unauthorized reads are denied.
- [ ] Customer runtime does not inherit staff identity authority.
- [ ] Customer runtime does not inherit staff RBAC authority.
- [ ] Transaction-local context does not leak across pooled requests.
- [ ] Customer repositories remain transaction-bound.

# 55. Definition of Done — Persistence
- [ ] Cart persistence is durable.
- [ ] Cart ownership is server-derived.
- [ ] Cart snapshots are canonical.
- [ ] Order persistence is durable.
- [ ] Order ownership is server-derived.
- [ ] Order item snapshots preserve historical semantics.
- [ ] Order modifier snapshots preserve historical semantics.
- [ ] One-cart-one-order invariant remains enforced.
- [ ] Partial cart writes roll back.
- [ ] Partial order writes roll back.
- [ ] Terminal cart cannot be silently reopened.

# 56. Definition of Done — Command Flow
- [ ] Create/get cart uses canonical service path.
- [ ] Add item uses canonical command path.
- [ ] Update item uses canonical command path.
- [ ] Remove item uses canonical command path.
- [ ] Submit order uses canonical command path.
- [ ] Routes remain thin.
- [ ] Routes do not perform direct SQL mutation.
- [ ] Submit locks/reloads source cart.
- [ ] Submit revalidates current menu availability.
- [ ] Submit persists one order atomically.
- [ ] Submit transitions order atomically.
- [ ] Submit converts source cart atomically.
- [ ] Payment side effects remain absent.
- [ ] Kitchen side effects remain absent.
- [ ] Realtime side effects remain absent.
- [ ] Notification side effects remain absent.

# 57. Definition of Done — Idempotency
- [ ] Required mutation routes reject missing key.
- [ ] Invalid key is rejected.
- [ ] Raw keys are not persisted.
- [ ] Request fingerprint is deterministic.
- [ ] Same key/same intent replays.
- [ ] Same key/different intent conflicts.
- [ ] Concurrent same-key requests execute once.
- [ ] Ambiguous response loss is recoverable.
- [ ] Replay happens before mutable-state validation can invalidate historical success.
- [ ] Replay completion is transaction-coupled.
- [ ] Retryable PostgreSQL failures are bounded.
- [ ] Unsupported replay version fails closed.
- [ ] Another capability cannot replay original customer's result.

# 58. Definition of Done — Security
- [ ] Tenant isolation proven.
- [ ] Branch isolation proven.
- [ ] Capability ownership proven.
- [ ] Staff/customer authority separation proven.
- [ ] Direct replay table access denied.
- [ ] Narrow replay function grants proven.
- [ ] Missing DB context fails closed.
- [ ] Secret/bearer material absent from replay state.
- [ ] Raw request key absent from replay state.
- [ ] Public errors are safe.
- [ ] Same-origin boundary remains enforced.
- [ ] Input bounds remain enforced.

# 59. Definition of Done — Acceptance Record
- [ ] `FLOW_P03_ACCEPTANCE.md` exists on R06 branch.
- [ ] Acceptance record names exact R06 implementation head.
- [ ] Acceptance record lists actual test results.
- [ ] Acceptance record does not claim unrun tests passed.
- [ ] Acceptance record states implementation merge status truthfully.
- [ ] Acceptance record summarizes R01 boundary.
- [ ] Acceptance record summarizes R02 boundary.
- [ ] Acceptance record summarizes R03 boundary.
- [ ] Acceptance record summarizes R04 boundary.
- [ ] Acceptance record summarizes R05 boundary.
- [ ] Acceptance record records security conclusions.
- [ ] Acceptance record records known deferred work.
- [ ] Acceptance record identifies Phase 04 as next without implementing it.

# 60. Acceptance Conclusions Required
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for customer direct-entry separation from staff identity.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for browser selectors not being authority.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for canonical `CustomerContext`.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for least-privilege customer DB access.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for durable server-authoritative cart state.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for durable server-authoritative order state.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for server-derived pricing/currency/totals.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for atomic order submission.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for exact same-key replay.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for ambiguous-response recovery.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for concurrent duplicate protection.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for cross-tenant denial.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for cross-branch denial.
- R06 acceptance must mark `PROVEN`, `NOT PROVEN`, or `BLOCKED` for cross-capability denial.
- R06 acceptance must state payment execution is deferred.
- R06 acceptance must state kitchen workflow is deferred.
- R06 acceptance must state realtime publication is deferred.
- R06 acceptance must state notifications are deferred.

# 61. Deferred Work
- Payment provider integration.
- Payment-provider idempotency.
- Customer payment method selection.
- Payment execution.
- Kitchen ticket creation.
- Kitchen routing.
- Kitchen display operational state.
- Staff operational order processing beyond inherited baseline.
- Realtime order/cart event distribution.
- Customer notifications.
- Generic transactional outbox.
- Background jobs.
- Analytics/event pipeline expansion.
- Broader post-submit order lifecycle.
- Phase 04 implementation.

# 62. Test Fixture Design
- Primary tenant fixture: Tenant A.
- Cross-tenant fixture: Tenant B.
- Primary branch fixture: Branch A1.
- Sibling branch fixture: Branch A2.
- Cross-tenant branch fixture: Branch B1.
- Primary restaurant fixture: Restaurant A.
- Cross-tenant restaurant fixture: Restaurant B.
- Primary table fixture: Table A1.
- Sibling-branch table fixture: Table A2.
- Cross-tenant table fixture: Table B1.
- Primary capability fixture: Capability A.
- Same-scope different-customer fixture: Capability A2.
- Cross-tenant capability fixture: Capability B.
- Active menu item fixture: Menu Item A.
- Inactive menu item fixture: Menu Item A inactive.
- Cross-tenant menu item fixture: Menu Item B.
- Valid modifier group fixture: Modifier Group A.
- Valid modifier choice fixture: Modifier Choice A.
- Invalid/unrelated modifier choice fixture: Modifier Choice X.
- Deterministic IDs should be used in DB tests when seed strategy supports it.
- Bearer secrets must not be copied into acceptance logs.
- Concurrent tests must use unique carts.
- Concurrent tests must use unique request keys outside the intended collision.
- Replay tests must deliberately reuse one request key in one scope.
- Mismatch tests must change exactly one semantic field when possible.
- Tests must not depend on unrelated execution order.

# 63. Customer Entry HTTP Acceptance
- [ ] Valid entry resolves to safe customer surface.
- [ ] Valid entry does not prompt for staff login.
- [ ] Invalid restaurant shows safe error.
- [ ] Invalid table shows safe error.
- [ ] Malformed selector shows safe error.
- [ ] Entry DB unavailable shows safe unavailable state.
- [ ] Capability transport/cookie follows R01 contract.
- [ ] Existing valid capability does not broaden authority.
- [ ] Different table selector cannot silently broaden scope.
- [ ] Open redirect attempts are rejected.
- [ ] External return URL is not trusted.
- [ ] Entry response does not expose database internals.

# 64. Mutation HTTP Acceptance
- [ ] Natural get/create cart follows R05 classification.
- [ ] Add uses expected HTTP method.
- [ ] Update uses expected HTTP method.
- [ ] Remove uses expected HTTP method.
- [ ] Submit uses expected HTTP method.
- [ ] Add success uses stable envelope.
- [ ] Update success uses stable envelope.
- [ ] Remove success uses stable envelope.
- [ ] Submit success uses stable envelope.
- [ ] Replay add preserves success status.
- [ ] Replay update preserves success status.
- [ ] Replay remove preserves success status.
- [ ] Replay submit preserves 201 success.
- [ ] Replay marker appears for replay.
- [ ] Missing key returns validation error.
- [ ] Malformed key returns validation error.
- [ ] Mismatch returns stable conflict.
- [ ] Expired replay identity returns stable expired error.
- [ ] Invariant failure does not execute command.
- [ ] Wrong origin is rejected.
- [ ] Oversized body is rejected.
- [ ] Invalid JSON is rejected.
- [ ] Unknown field is rejected where strict validation applies.

# 65. Error Taxonomy Acceptance
- `CUSTOMER_COMMAND_NOT_FOUND` — inaccessible/missing resource under current customer scope.
- `CUSTOMER_COMMAND_INVALID_INPUT` or established equivalent — shape/bounds violation.
- `CUSTOMER_COMMAND_CONFLICT` or established equivalent — business-state conflict.
- `CUSTOMER_COMMAND_UNAVAILABLE` — transient infrastructure or exhausted safe retry.
- `CUSTOMER_COMMAND_IDEMPOTENCY_MISMATCH` — same scoped key, different fingerprint.
- `CUSTOMER_COMMAND_IDEMPOTENCY_EXPIRED` — replay identity beyond accepted retained window.
- `CUSTOMER_COMMAND_IDEMPOTENCY_INVARIANT` — unsafe persisted replay/result state.
- Error mapping must not expose SQLSTATE publicly.
- Error mapping must not expose stack traces publicly.
- Error mapping must not expose raw key.
- Error mapping must not expose capability token.
- Error mapping must not expose private function names.

# 66. PostgreSQL Object Acceptance Inventory
- `private.customer_command_idempotency` — R05 request/replay state.
- `private.acquire_customer_command_idempotency(text,text,text)` — atomic acquire/replay classification.
- `private.complete_customer_command_idempotency(uuid,integer,integer,jsonb,text,uuid)` — replay result completion.
- `private.submit_customer_order(uuid)` — R04 narrow order submission primitive.
- R01 entry-resolution private function/equivalent exact current signature.
- R01 capability-scope validation private function/equivalent exact current signature.
- `flow_customer_entry` — entry role.
- `flow_customer_runtime` — customer data/command runtime role.
- R06 must inspect exact current signatures rather than relying on conceptual ellipses.
- Function ownership must be checked from actual database catalog.
- Function execute grants must be checked from actual database catalog.
- Private helper objects must not become public API accidentally.

# 67. Idempotency Table Column Acceptance
- `id` — UUID primary key.
- `tenant_id` — trusted tenant scope.
- `branch_id` — trusted branch scope.
- `customer_capability_id` — trusted capability ownership identifier.
- `command` — finite R05 command code.
- `key_digest` — digest, not raw key.
- `request_fingerprint` — semantic fingerprint.
- `status` — current R05 states only.
- `response_status` — 2xx only for SUCCEEDED.
- `response_version` — exact replay DTO version.
- `response_body` — replay-safe JSON.
- `resource_type` — optional paired resource kind.
- `resource_id` — optional paired resource UUID.
- `created_at` — creation time.
- `updated_at` — completion/update time.
- `expires_at` — retained replay boundary.

# 68. Idempotency State Machine Acceptance
- `ABSENT → IN_PROGRESS` — only unique-scope acquisition winner inserts.
- `IN_PROGRESS → SUCCEEDED` — only matching trusted scope can complete.
- `SUCCEEDED → REPLAY` — stored result returns without mutation.
- `SUCCEEDED + changed fingerprint → MISMATCH` — no mutation.
- `expired retained record → EXPIRED` — no mutation under current contract.
- `unexpected committed IN_PROGRESS → fail closed` — no second mutation.
- `transaction rollback before completion → ABSENT` — owner row and business work roll back together.
- No permanent FAILED state is introduced unless a future spec explicitly defines it.

# 69. Fingerprint Canonicalization Acceptance
- [ ] Command code/version participates in fingerprint namespace.
- [ ] Cart UUID is validated and normalized.
- [ ] Cart item UUID is validated and normalized.
- [ ] Menu item UUID is validated and normalized.
- [ ] Quantity is validated before fingerprint.
- [ ] Modifier IDs are validated before fingerprint.
- [ ] Modifier IDs are sorted for semantic equivalence where R05 established it.
- [ ] Special request uses established normalization.
- [ ] Customer note uses established normalization.
- [ ] Absent/null semantics remain deterministic.
- [ ] Fingerprint serialization does not depend on client JSON field order.
- [ ] Trusted tenant/branch/capability remain server scope, not client fingerprint authority.
- [ ] Raw bearer capability is absent from fingerprint source.
- [ ] Raw idempotency key is not the semantic fingerprint.

# 70. Order Submit Atomicity Proof
1. Resolve current CustomerContext.
2. Validate submit request.
3. Validate idempotency key.
4. Begin customer data transaction.
5. Acquire replay request ownership.
6. Return replay immediately when stored success exists.
7. Fail on mismatch before cart validation.
8. Fail on expired identity before cart validation.
9. Fail on replay invariant before cart validation.
10. Lock and reload source cart.
11. Verify cart is DRAFT.
12. Verify cart is non-empty.
13. Revalidate item availability.
14. Revalidate modifier availability.
15. Build order from persisted canonical snapshots.
16. Persist DRAFT order.
17. Persist order items.
18. Persist order modifiers.
19. Transition order through narrow submit function.
20. Mark source cart terminal.
21. Serialize stable submitted-order replay DTO.
22. Complete replay row as SUCCEEDED.
23. Commit once.
24. Return HTTP 201.

# 71. Add-Item Atomicity Proof
1. Resolve CustomerContext.
2. Normalize idempotency key.
3. Normalize add semantic input.
4. Begin customer transaction.
5. Acquire request ownership.
6. Return replay immediately where applicable.
7. Validate owned DRAFT cart.
8. Lock cart according to R04/R03 path.
9. Resolve active menu item in trusted restaurant scope.
10. Resolve valid modifier choices.
11. Use authoritative unit price.
12. Use authoritative currency.
13. Persist cart item.
14. Persist modifiers.
15. Reload canonical cart aggregate.
16. Serialize replay DTO.
17. Complete idempotency success.
18. Commit once.

# 72. Update-Item Atomicity Proof
1. Resolve CustomerContext.
2. Normalize idempotency key.
3. Normalize cart ID.
4. Normalize cart-item ID.
5. Validate quantity.
6. Begin customer transaction.
7. Acquire request ownership.
8. Return replay immediately where applicable.
9. Lock owned DRAFT cart.
10. Verify item belongs to cart/current scope.
11. Persist bounded quantity.
12. Reload canonical cart aggregate.
13. Serialize replay DTO.
14. Complete idempotency success.
15. Commit once.

# 73. Remove-Item Atomicity Proof
1. Resolve CustomerContext.
2. Normalize idempotency key.
3. Normalize cart selector.
4. Normalize item selector.
5. Begin customer transaction.
6. Acquire request ownership.
7. Return replay before looking for already-removed item.
8. Lock owned DRAFT cart.
9. Verify current item ownership.
10. Delete item under established child-modifier behavior.
11. Reload canonical cart aggregate.
12. Serialize replay DTO.
13. Complete idempotency success.
14. Commit once.

# 74. Retry Classification Acceptance
| Error class | Expected R06 behavior |
| --- | --- |
| `40001` | at most one internal retry with same request identity |
| `40P01` | at most one internal retry with same request identity |
| `23505` | not a generic retry; intended request race handled by acquire logic |
| `23503` | not a generic transient retry |
| `23514` | not a generic transient retry |
| `42501` | security/configuration failure; fail closed |
| `22023` | invalid/invariant input; no generic retry |
| unknown driver/network failure | safe unavailable; no unbounded loop |

# 75. Expiry and Retention Acceptance
- R05 default replay retention is 48 hours.
- Verify `expires_at > created_at`.
- Verify expiry index exists.
- R06 does not require a scheduler to close Phase 03.
- Expired retained identity must not silently execute a second mutation.
- Expired behavior must be deterministic.
- Future cleanup can remove expired rows only under a separately defined operational policy.
- Cleanup must not remove non-expired SUCCEEDED rows prematurely.
- Acceptance record must state cleanup scheduling is deferred if no scheduler exists.
- R06 does not change 48-hour retention without an existing-product requirement or reproduced defect.

# 76. Rolling Deployment Compatibility
- [ ] R06 does not change replay result version casually.
- [ ] Existing supported R05 replay rows remain readable.
- [ ] Unsupported replay version fails closed.
- [ ] R06 does not drop R05 columns/functions.
- [ ] R06 does not rename public mutation routes.
- [ ] R06 does not change `Idempotency-Key` header name.
- [ ] R06 does not change established command codes without migration.
- [ ] Any corrective schema change is forward compatible with repository deployment order.
- [ ] Acceptance record notes compatibility limitations discovered.

# 77. Fresh Database Proof Sequence
1. Start clean repository-approved Supabase/PostgreSQL environment.
2. Apply all migrations in repository order.
3. Verify Phase 02 seed/auth/RLS baseline.
4. Verify R01 entry role/functions.
5. Verify R02 customer runtime/context/read functions.
6. Verify R03 cart/order schema and privileges.
7. Verify R04 submit function.
8. Verify R05 replay table/functions/grants.
9. Run database lint.
10. Run pgTAP suites in repository-established order.
11. Run generated database type command.
12. Verify no unintended generated type drift.
13. Run R03–R05 runtime integration tests.
14. Run R06 acceptance integration suite.
15. Record exact outcomes in R06 PR.
16. Record exact outcomes in acceptance record.

# 78. Rollback Proof Catalog
- [ ] Failure after replay acquisition but before cart add leaves no committed replay owner row.
- [ ] Failure after cart item insert but before modifiers leaves no partial cart mutation.
- [ ] Failure after modifiers but before replay completion rolls back all mutation rows.
- [ ] Failure after draft order insert before items rolls back draft order.
- [ ] Failure after order items before modifiers rolls back order aggregate.
- [ ] Failure after order persistence before submit transition rolls back order aggregate.
- [ ] Failure after submit transition before cart conversion rolls back transition.
- [ ] Failure after cart conversion before replay completion rolls back cart conversion and order.
- [ ] Failure during replay serialization before completion rolls back business mutation.
- [ ] Database abort before commit leaves no externally visible success.

# 79. Concurrency Proof Catalog
- [ ] Same key + same add payload: one execution, one replay.
- [ ] Same key + different add payload: one execution, mismatch loser.
- [ ] Different keys + same add payload: behavior follows business semantics; no key collision.
- [ ] Same key + same update payload: one execution, one replay.
- [ ] Same key + different update quantity: mismatch.
- [ ] Same key + same remove payload: one execution, replay.
- [ ] Same key + same submit payload: one order.
- [ ] Same key + changed submit note: mismatch.
- [ ] Different keys + same source-cart submit: one durable order.
- [ ] Submit racing cart update: lock ordering yields coherent final state.
- [ ] Submit racing cart remove: lock ordering yields coherent final state.
- [ ] Two customers same raw key: independent scoped records.
- [ ] Two branches same raw key: independent trusted scopes.
- [ ] Two tenants same raw key: independent trusted scopes.
- [ ] Assert row counts, not only absence of exceptions.

# 80. Data Leakage Negative Assertions
- [ ] Do not unnecessarily echo tenant IDs in public mutation result.
- [ ] Do not unnecessarily echo branch IDs in public mutation result.
- [ ] Never return bearer capability material.
- [ ] Never return raw idempotency key from replay body.
- [ ] Never expose request fingerprint to customer.
- [ ] Never expose key digest to customer.
- [ ] Never expose database role name.
- [ ] Never expose SQLSTATE.
- [ ] Never expose SQL query text.
- [ ] Never expose stack trace.
- [ ] Never expose private function names.
- [ ] Do not expose another customer's resource existence beyond established safe semantics.
- [ ] Do not introduce staff actor IDs into customer DTO.
- [ ] Do not introduce membership/permission data into customer DTO.

# 81. Acceptance Record Validation Rows
- `R06 spec exists on main and READY` — result + evidence required.
- `R06 branch descends from exact R05 head` — result + evidence required.
- `R01 capability chain present` — result + evidence required.
- `R02 customer transaction chain present` — result + evidence required.
- `R03 persistence repositories present` — result + evidence required.
- `R04 command routes/services present` — result + evidence required.
- `R05 replay layer present` — result + evidence required.
- `valid entry acceptance` — result + evidence required.
- `invalid entry denial` — result + evidence required.
- `scoped read acceptance` — result + evidence required.
- `cart persistence acceptance` — result + evidence required.
- `order persistence acceptance` — result + evidence required.
- `atomic submit acceptance` — result + evidence required.
- `same-key replay acceptance` — result + evidence required.
- `payload mismatch acceptance` — result + evidence required.
- `ambiguous response recovery acceptance` — result + evidence required.
- `concurrent same-key acceptance` — result + evidence required.
- `cross-tenant denial` — result + evidence required.
- `sibling-branch denial` — result + evidence required.
- `cross-capability denial` — result + evidence required.
- `private replay table direct-access denial` — result + evidence required.
- `narrow function grant verification` — result + evidence required.
- `fresh DB migration/reset` — result + evidence required.
- `database tests` — result + evidence required.
- `unit tests` — result + evidence required.
- `integration tests` — result + evidence required.
- `lint` — result + evidence required.
- `typecheck` — result + evidence required.
- `build` — result + evidence required.
- `browser E2E` — result + evidence required.

# 82. Implementation PR Body Required Sections
1. FLOW implementation round metadata.
2. Specification authority main SHA.
3. Implementation parent branch/SHA.
4. R06 implementation branch/head SHA.
5. Phase 03 acceptance summary.
6. Acceptance test files created.
7. Acceptance record created.
8. Defect fixes if any.
9. Database changes if any.
10. Security/grant changes if any.
11. Scope declaration.
12. Validation table.
13. Known limitations.
14. Phase 04 handoff.
15. Owner merge control statement.

# 83. Blockers That Must Stop R06 Readiness
- R05 implementation branch is missing or no longer latest lineage.
- R05 code is placeholder-only.
- Acceptance-critical type/compile failure prevents meaningful testing and cannot be fixed inside P03 contract.
- R06 requires undefined payment semantics to claim Phase 03 completion.
- R06 requires undefined kitchen semantics to claim Phase 03 completion.
- Tenant/capability isolation cannot be proven because source-of-truth ownership is absent.
- Fresh database cannot construct current P03 schema and would require destructive historical rewrite.
- Idempotency cannot guarantee one execution under concurrent same-key requests without out-of-scope redesign.
- Severe cross-tenant bypass cannot be safely corrected within P03.
- Required environment is unavailable for a specific test; record `BLOCKED`, not fabricated PASS.

# 84. Conditions That Are Not Document-Validation Blockers
- GitHub Actions queued does not invalidate this document.
- GitHub Actions skipped does not invalidate this document.
- GitHub Actions cancelled does not invalidate this document.
- GitHub Actions missing for docs-only PR does not invalidate this document.
- Unrelated hosted CI outage does not invalidate this document.
- Vercel preview unavailable for docs-only PR does not invalidate this document.
- Implementation PR #74 remaining unmerged does not invalidate this document.
- Earlier implementation PRs remaining unmerged do not invalidate branch-lineage evidence.

# 85. R01 File-by-File Acceptance Detail
## `capability-codec.ts`
- Verify server-only import boundary.
- Verify capability verification rejects tampering.
- Verify expiry semantics remain bounded.
- Verify claims cannot grant staff role/permission.
- Modify only for reproduced R01 defect.
## `config.ts`
- Verify required capability runtime config remains explicit.
- Verify no secret is exposed to client bundle.
- Verify invalid config fails safely.
- Avoid unrelated environment redesign.
## `current-context.ts`
- Verify missing capability returns missing/invalid state.
- Verify current context is immutable/read-only by contract.
- Verify DB backing scope is revalidated where established.
- Verify transport parsing does not accept tenant override.
## `entry-resolver.ts`
- Verify selector resolution is server controlled.
- Verify unknown restaurant fails closed.
- Verify unknown table fails closed.
- Verify unavailable database returns unavailable state.
## `entry-selector.ts`
- Verify selector normalization is bounded.
- Verify selector normalization does not create authority.
- Verify malformed input is rejected safely.
- Avoid accepting UUID ownership from client.
## `repository.ts`
- Verify entry DB calls use customer-entry transaction.
- Verify capability scope validation uses trusted claims.
- Verify cross-tenant selector cannot resolve.
- Verify cross-branch selector cannot resolve.
## `transport.ts`
- Verify bearer transport does not leak in URL.
- Verify cookie/transport attributes remain intentional.
- Verify stale/invalid token fails safely.
- Verify transport cannot become staff session.
## `types.ts`
- Verify `CustomerContext` carries trusted scope only.
- Verify capability version remains explicit.
- Verify no staff role fields are added.
- Verify no permission fields are added.
## `validate-customer-capability.ts`
- Verify invalid token never reaches customer transaction callback.
- Verify expired token is distinguishable from valid.
- Verify revoked/unavailable backing scope fails closed.
- Verify bearer material is not logged.
## `api/customer/entry/route.ts`
- Verify route remains public-customer entry only.
- Verify no staff login authority is introduced.
- Verify safe redirect/error behavior.
- Verify open redirect protection.
## `customer-entry-transaction.ts`
- Verify `flow_customer_entry` is transaction-local role.
- Verify callback runs only after role set.
- Verify role does not leak beyond transaction.
- Verify role grants remain narrow.
## R01 migration
- Verify entry functions exist on fresh DB.
- Verify grants/revokes match R01 intent.
- Verify R06 does not rewrite this historical migration.
- Add forward correction only if necessary.

# 86. R02 File-by-File Acceptance Detail
## `context.ts`
- Verify mapping consumes trusted `CustomerContext`.
- Verify mapping does not accept browser tenant override.
- Verify mapping preserves restaurant/branch/table/capability scope.
- Verify readonly semantics where established.
## `errors.ts`
- Verify data errors map safely through command layer.
- Verify DB internals are not exposed.
- Preserve stable machine-readable categories.
- Modify only for reproduced defect.
## `transaction.ts`
- Verify transaction sets customer runtime role/context.
- Verify tenant context set locally.
- Verify branch context set locally.
- Verify capability context set locally.
- Verify context does not leak after transaction.
- Verify repositories bind same transaction.
## `repositories.ts`
- Verify one repository factory binds current transaction/context.
- Verify cart repository is present.
- Verify order repository is present.
- Verify replay repository is present.
- Verify no global unscoped customer repository singleton bypass.
## `storefront-repository.ts`
- Verify exact restaurant/storefront scope.
- Verify cross-tenant rows not visible.
- Verify inactive/invalid state follows established customer contract.
- Preserve bounded query behavior.
## `storefront-service.ts`
- Verify service composes trusted context and repository.
- Verify no route-side direct SQL bypass.
- Verify errors remain safe.
- Avoid unrelated caching work.
## `menu-repository.ts`
- Verify active menu scope.
- Verify restaurant scope.
- Verify tenant scope.
- Verify modifier relations are bounded and correct.
- Verify archived items are not active options.
- Preserve deterministic read model.
## `types.ts`
- Verify public read model fields are intentional.
- Verify no tenant authority fields become client-controlled inputs.
- Preserve money representation contract.
- Preserve immutable/read-only response shape where established.
## R02 migration
- Verify runtime role/context objects exist.
- Verify grants remain least privilege.
- Verify no staff authorization broadening.
- R06 must not rewrite historical R02 migration.

# 87. R03 File-by-File Acceptance Detail
## `cart-repository.ts`
- Verify create uses trusted context ownership.
- Verify find scopes by tenant and RLS/customer ownership.
- Verify add uses authoritative menu price.
- Verify add uses authoritative currency.
- Verify modifier validation is authoritative.
- Verify update requires DRAFT cart.
- Verify remove requires DRAFT cart.
- Verify terminal cart cannot mutate.
- Verify aggregate totals are deterministic.
- Verify cross-capability access fails.
## `order-repository.ts`
- Verify order ownership comes from trusted context.
- Verify source cart is validated.
- Verify snapshots are durable.
- Verify subtotal recomputation is deterministic.
- Verify order IDs are opaque.
- Verify DRAFT persistence is transaction-bound.
- Verify customer read is scope constrained.
- Verify submitted-state updates stay narrow.
## `persistence-types.ts`
- Verify cart/order statuses match established schema.
- Verify monetary values use string/minor-unit-safe representation.
- Verify submitted order DTO remains replay serializable.
- Avoid Phase 04 lifecycle expansion.
## generated database types
- Verify generated schemas match fresh DB.
- Verify private replay schema exclusion is intentional.
- Verify no manual generated-file drift except approved generation output.
## R03 migration
- Verify ownership columns exist.
- Verify snapshot columns exist.
- Verify one-cart-one-order invariant exists.
- Verify grants/RLS remain narrow.
- Do not rewrite historical migration.
## R03 integration test
- Preserve existing persistence proofs.
- Extend only when R06 finds cross-round gap.
- Do not weaken assertions.
- Keep database-backed coverage.
## R03 pgTAP test
- Preserve grant/RLS tests.
- Preserve ownership tests.
- Preserve persistence constraints.
- Extend with R06 regression only when necessary.

# 88. R04 File-by-File Acceptance Detail
## `cart-commands.ts`
- Verify canonical create/get behavior.
- Verify canonical add behavior.
- Verify canonical update behavior.
- Verify canonical remove behavior.
- Verify commands accept intent, not tenant/branch/price authority.
- Verify same transaction dependencies can be injected by R05.
## `submit-order.ts`
- Verify source cart lock occurs before mutable submit work.
- Verify cart is non-empty.
- Verify current menu availability is checked.
- Verify order input comes from persisted snapshots.
- Verify order persist + submit + cart conversion are atomic.
- Verify no external side effects occur inside transaction.
## `runtime.ts`
- Verify current CustomerContext resolves once per top-level request.
- Verify R05 transaction scope dependency reuse avoids nested transactions.
- Verify retry wraps same logical request identity.
- Verify no staff context is introduced.
## `validation.ts`
- Verify UUID bounds.
- Verify quantity bounds.
- Verify modifier count bounds.
- Verify special request bounds.
- Verify customer note bounds.
- Verify unknown authority fields remain rejected upstream.
## `errors.ts`
- Verify R05 replay errors extend safely.
- Verify command errors remain machine-readable.
- Verify DB causes do not leak publicly.
- Verify not-found semantics remain non-leaky.
## `http.ts`
- Verify safe success envelope.
- Verify safe error envelope.
- Verify same-origin check.
- Verify body-size check.
- Verify replay header behavior.
## `menu-availability-repository.ts`
- Verify current item availability is scoped.
- Verify current modifier availability is scoped.
- Verify stale cart snapshot cannot bypass current submit validation.
- Verify replay does not rerun this after a committed success.
## cart route
- Verify route remains thin.
- Verify route does not perform SQL.
- Verify get/create classification remains intentional.
- Verify current context is required.
## cart-items route
- Verify mutation methods require valid replay identity.
- Verify route delegates to R05 facade.
- Verify body validation remains strict.
- Verify replay marker is returned correctly.
## orders route
- Verify submit requires replay identity.
- Verify route delegates to R05 facade.
- Verify 201 status is preserved on replay.
- Verify no payment/kitchen work is introduced.
## R04 migration
- Verify narrow submit function exists.
- Verify fixed search path.
- Verify narrow execute grant.
- Verify trusted scope validation.
- Do not rewrite historical migration.

# 89. R05 File-by-File Acceptance Detail
## `customer-command-facade.ts`
- Verify add wrapper normalizes semantic input.
- Verify update wrapper normalizes semantic input.
- Verify remove wrapper normalizes semantic input.
- Verify submit wrapper normalizes semantic input.
- Verify modifier IDs are sorted for add fingerprint.
- Verify result resource IDs are stable.
- Verify submitted-order deserialization validates shape.
- Verify replay does not duplicate R04 business logic.
## `execute-idempotent-command.ts`
- Verify key normalization occurs before transaction.
- Verify key digest is deterministic.
- Verify fingerprint is deterministic.
- Verify current CustomerContext resolves before transaction.
- Verify acquire happens before command callback.
- Verify mismatch throws before command callback.
- Verify expired throws before command callback.
- Verify replay returns before command callback.
- Verify response version is checked.
- Verify replay body deserialization is checked.
- Verify command executes only for OWNER.
- Verify success result serializes before completion.
- Verify completion happens before commit.
- Verify retry set is only `40001` and `40P01`.
- Verify maximum attempts remains bounded at 2 unless future spec changes it.
## `fingerprint.ts`
- Verify UUID-v4 key validation.
- Verify normalized key does not become authorization.
- Verify SHA-256 digest format.
- Verify canonical serialization ordering.
- Verify command namespace/version participation.
- Verify no bearer secret input.
## `repository.ts`
- Verify acquire uses narrow private function.
- Verify complete uses narrow private function.
- Verify no direct private table DML through Kysely application surface.
- Verify acquisition outcome mapping is exhaustive.
- Verify completion false result becomes invariant/unavailable safely.
## `types.ts`
- Verify finite command code union.
- Verify stable replay result version.
- Verify resource kind is finite/safe.
- Verify acquisition union covers OWNER/REPLAY/MISMATCH/EXPIRED/IN_PROGRESS if current code does.
## R05 migration
- Verify raw keys are not stored.
- Verify unique scope includes tenant/branch/capability/command/key digest.
- Verify check constraints are active.
- Verify expiry index.
- Verify RLS enabled.
- Verify direct grants revoked.
- Verify SECURITY DEFINER search paths fixed.
- Verify only customer runtime execute grants.
- Do not rewrite historical migration.
## R05 integration test
- Preserve add replay proof.
- Preserve payload mismatch proof.
- Preserve remove replay proof.
- Preserve ambiguous submit recovery proof.
- Preserve concurrent same-key proof.
- Preserve cross-capability raw-key isolation proof.
## R05 unit test
- Preserve key validation/digest proof.
- Preserve fingerprint determinism proof.
- Extend only for acceptance gap.
## R05 pgTAP test
- Preserve table/function existence proof.
- Preserve direct-access denial proof.
- Preserve narrow function grant proof.
- Preserve state-machine proof.
- Preserve capability-scope independence proof.

# 90. Security Principal × Resource Matrix
## `public`
- [ ] `public` cannot SELECT private replay table.
- [ ] `public` cannot INSERT private replay table.
- [ ] `public` cannot UPDATE private replay table.
- [ ] `public` cannot DELETE private replay table.
- [ ] `public` cannot execute replay acquire.
- [ ] `public` cannot execute replay complete.
- [ ] `public` cannot call narrow customer submit function unless explicitly granted; expected denial.
- [ ] `public` cannot directly mutate cart/order persistence.
## `anon`
- [ ] `anon` cannot SELECT private replay table.
- [ ] `anon` cannot INSERT private replay table.
- [ ] `anon` cannot UPDATE private replay table.
- [ ] `anon` cannot DELETE private replay table.
- [ ] `anon` cannot execute replay acquire.
- [ ] `anon` cannot execute replay complete.
- [ ] `anon` cannot call customer submit primitive directly.
- [ ] `anon` cannot bypass server capability boundary to mutate cart/order.
## `authenticated`
- [ ] `authenticated` cannot SELECT private replay table.
- [ ] `authenticated` cannot INSERT private replay table.
- [ ] `authenticated` cannot UPDATE private replay table.
- [ ] `authenticated` cannot DELETE private replay table.
- [ ] `authenticated` cannot execute replay acquire.
- [ ] `authenticated` cannot execute replay complete.
- [ ] Supabase authenticated role alone is not customer capability authority.
- [ ] Supabase authenticated role alone is not internal staff authorization authority.
## `flow_customer_entry`
- [ ] Entry role can perform only established entry functions.
- [ ] Entry role cannot SELECT private replay table.
- [ ] Entry role cannot INSERT private replay table.
- [ ] Entry role cannot UPDATE private replay table.
- [ ] Entry role cannot DELETE private replay table.
- [ ] Entry role cannot execute replay acquire.
- [ ] Entry role cannot execute replay complete.
- [ ] Entry role cannot mutate cart/order rows directly outside established entry scope.
## `flow_customer_runtime`
- [ ] Customer runtime cannot directly SELECT private replay table.
- [ ] Customer runtime cannot directly INSERT private replay table.
- [ ] Customer runtime cannot directly UPDATE private replay table.
- [ ] Customer runtime cannot directly DELETE private replay table.
- [ ] Customer runtime can execute replay acquire.
- [ ] Customer runtime can execute replay complete.
- [ ] Customer runtime can use only R03/R04 persistence surface granted by schema/function policy.
- [ ] Customer runtime cannot gain staff identity/RBAC tables.
- [ ] Customer runtime cannot gain payment authority.
- [ ] Customer runtime cannot gain kitchen authority.
## `flow_runtime`
- [ ] Internal runtime remains separate from customer bearer semantics.
- [ ] Internal runtime does not gain private replay table direct access unless current schema explicitly and safely grants it; expected denied by R05 migration.
- [ ] Internal runtime cannot use customer raw request key as authorization.
- [ ] Internal runtime staff authority remains Phase 02-controlled.
## `flow_identity`
- [ ] Identity role remains authentication-focused.
- [ ] Identity role cannot execute replay acquire.
- [ ] Identity role cannot execute replay complete.
- [ ] Identity role cannot mutate customer cart/order solely due to identity role.
## `flow_authenticator`
- [ ] Authenticator role remains authentication-focused.
- [ ] Authenticator role cannot execute replay acquire.
- [ ] Authenticator role cannot execute replay complete.
- [ ] Authenticator role cannot mutate customer cart/order solely due to authentication authority.

# 91. Customer Scope × Operation Matrix
## Same capability, same branch, same tenant
- [ ] read owned cart: allowed under established status/read rules.
- [ ] add owned DRAFT cart: allowed with valid intent/key.
- [ ] update owned DRAFT cart item: allowed with valid intent/key.
- [ ] remove owned DRAFT cart item: allowed with valid intent/key.
- [ ] submit owned populated DRAFT cart: allowed with valid intent/key.
- [ ] replay successful mutation: allowed with same key/fingerprint.
- [ ] changed payload same key: denied mismatch.
## Different capability, same branch, same tenant
- [ ] read other cart: denied.
- [ ] add other cart: denied.
- [ ] update other cart item: denied.
- [ ] remove other cart item: denied.
- [ ] submit other cart: denied.
- [ ] replay other customer's request by raw key: denied/independent scope.
- [ ] complete other replay record: denied.
## Same tenant, sibling branch
- [ ] read sibling cart: denied.
- [ ] add sibling cart: denied.
- [ ] update sibling item: denied.
- [ ] remove sibling item: denied.
- [ ] submit sibling cart: denied.
- [ ] replay sibling request: isolated.
- [ ] choose sibling branch through body: denied/not authority.
## Different tenant
- [ ] read other tenant cart: denied.
- [ ] add other tenant cart: denied.
- [ ] update other tenant item: denied.
- [ ] remove other tenant item: denied.
- [ ] submit other tenant cart: denied.
- [ ] replay other tenant request: isolated.
- [ ] choose other tenant through body: denied/not authority.

# 92. Input Field Authority Matrix
- `cartId` — selector only; ownership revalidated server-side.
- `cartItemId` — selector only; ownership revalidated server-side.
- `menuItemId` — selector only; current menu scope revalidated server-side.
- `modifierChoiceIds` — customer intent; membership/availability revalidated server-side.
- `quantity` — customer intent; bounded server-side.
- `specialRequest` — bounded free text; never SQL authority.
- `customerNote` — bounded free text; never SQL authority.
- `Idempotency-Key` — request identity only; never authorization.
- `tenantId` — must not be accepted as public mutation authority.
- `branchId` — must not be accepted as public mutation authority.
- `restaurantId` — must not be accepted as public mutation authority.
- `tableId` — must not be accepted as public mutation authority.
- `tableSessionId` — must not be accepted as public mutation authority.
- `capabilityId` — must not be accepted as public mutation authority.
- `price` — must not be accepted as persistence authority.
- `currency` — must not be accepted as persistence authority.
- `subtotal` — must not be accepted as persistence authority.
- `orderNumber` — must not be client-generated authority.
- `submittedAt` — must not be client-generated authority.
- `status` — public customer route must not expose unrestricted setter.

# 93. Persistence Row-Count Assertions
- [ ] Add first execution creates exactly one intended cart item row.
- [ ] Add replay creates zero additional cart item rows.
- [ ] Add replay creates zero additional modifier rows.
- [ ] Add mismatch creates zero additional cart item rows.
- [ ] Update first execution changes exactly one owned item.
- [ ] Update replay does not produce a second semantic mutation.
- [ ] Update mismatch leaves original committed quantity unchanged.
- [ ] Remove first execution deletes exactly intended owned item.
- [ ] Remove replay does not delete unrelated rows.
- [ ] Submit first execution creates exactly one source-cart order.
- [ ] Submit replay creates zero additional orders.
- [ ] Submit replay creates zero additional order items.
- [ ] Submit replay creates zero additional order modifiers.
- [ ] Submit mismatch creates zero additional orders.
- [ ] Concurrent same-key add final item count reflects one execution.
- [ ] Concurrent same-key submit final order count is one.
- [ ] Failed transaction leaves zero partial replay success rows.
- [ ] Failed transaction leaves zero partial order aggregate rows where rollback expected.

# 94. Snapshot Acceptance
- [ ] Cart unit price snapshot comes from active menu data.
- [ ] Cart currency snapshot comes from server data.
- [ ] Cart modifier group name snapshot is durable.
- [ ] Cart modifier choice name snapshot is durable.
- [ ] Cart modifier price delta snapshot is durable.
- [ ] Order menu item name snapshot is durable.
- [ ] Order Thai name snapshot follows established nullable behavior.
- [ ] Order preparation station snapshot is durable.
- [ ] Order unit price snapshot is durable.
- [ ] Order line total snapshot is deterministic.
- [ ] Order modifier group snapshot is durable.
- [ ] Order modifier choice snapshot is durable.
- [ ] Order modifier price delta snapshot is durable.
- [ ] Later menu rename does not rewrite historical order display semantics.
- [ ] Later menu price change does not rewrite submitted order price.

# 95. State Transition Acceptance
- [ ] New cart uses established DRAFT state.
- [ ] DRAFT cart allows valid mutations.
- [ ] Submitted/terminal cart rejects mutation.
- [ ] Order initially persists in established DRAFT form before submit primitive.
- [ ] Submit primitive transitions order to `PENDING_CONFIRMATION`.
- [ ] Customer status becomes `SENT` on submitted order.
- [ ] Submitted order receives server/database submitted timestamp.
- [ ] Source cart transitions to established terminal submitted state.
- [ ] Replay does not transition order a second time.
- [ ] Replay does not transition cart a second time.
- [ ] Customer cannot directly choose arbitrary order status.
- [ ] Customer cannot directly choose arbitrary cart terminal status.
- [ ] Future kitchen/staff transitions remain outside R06.

# 96. Database Constraint Acceptance
- [ ] Cart tenant/branch foreign references remain valid.
- [ ] Order tenant/branch foreign references remain valid.
- [ ] Source cart uniqueness remains active.
- [ ] Replay command check remains active.
- [ ] Replay key digest check remains active.
- [ ] Replay fingerprint check remains active.
- [ ] Replay status check remains active.
- [ ] Replay response-state check remains active.
- [ ] Replay expiry check remains active.
- [ ] Replay scope-key unique constraint remains active.
- [ ] Replay tenant/branch foreign key remains active.
- [ ] Invalid direct insert violating replay checks fails.
- [ ] Invalid replay completion response fails.
- [ ] Completion with only resource type but no resource ID fails.
- [ ] Completion with only resource ID but no resource type fails.

# 97. SECURITY DEFINER Acceptance
- [ ] Every P03 SECURITY DEFINER function has explicit fixed search path.
- [ ] Function owner is appropriate and not exposed to untrusted caller control.
- [ ] Execute grants are explicit.
- [ ] Public execute is revoked unless intentionally required; expected revoked for R04/R05 narrow mutation helpers.
- [ ] `anon` execute is revoked for R04/R05 narrow mutation helpers.
- [ ] `authenticated` execute is revoked for R04/R05 narrow mutation helpers.
- [ ] Customer-entry role execute is revoked for R04/R05 replay helpers.
- [ ] Customer-runtime execute is granted only where required.
- [ ] Functions derive trusted scope from transaction context.
- [ ] Functions do not accept tenant ID as caller authority.
- [ ] Functions do not accept branch ID as caller authority.
- [ ] Functions do not accept capability ID as caller authority.
- [ ] Functions validate record state before update.
- [ ] Functions fail closed on missing context.

# 98. R06 Acceptance Document Structure
1. Title and Phase 03 summary.
2. Metadata.
3. Implementation branch lineage.
4. Specification authority.
5. R01 acceptance summary.
6. R02 acceptance summary.
7. R03 acceptance summary.
8. R04 acceptance summary.
9. R05 acceptance summary.
10. End-to-end authority chain.
11. Security conclusions.
12. Persistence conclusions.
13. Command conclusions.
14. Idempotency conclusions.
15. Database privilege conclusions.
16. Failure/recovery conclusions.
17. Validation table.
18. Defect fixes if any.
19. Known limitations.
20. Deferred Phase 04 work.
21. Integration/merge state.
22. Final Phase 03 conclusion.

# 99. PR Review Questions
- [ ] Does every runtime change map to a reproduced P03 defect?
- [ ] Does every defect fix preserve/strengthen least privilege?
- [ ] Do new tests span multiple P03 rounds rather than duplicate narrow tests only?
- [ ] Does acceptance record use exact observed SHAs?
- [ ] Are any test results claimed without execution evidence?
- [ ] Was any historical migration edited?
- [ ] Did payment work slip into R06?
- [ ] Did kitchen work slip into R06?
- [ ] Did realtime work slip into R06?
- [ ] Did notification work slip into R06?
- [ ] Did any route gain client tenant authority?
- [ ] Did any route gain client branch authority?
- [ ] Did any route gain client price authority?
- [ ] Did any role gain broad privileges to simplify tests?
- [ ] Did any replay path execute business logic twice?
- [ ] Does concurrent submit still yield one order per source cart?
- [ ] Are browser E2E limitations recorded truthfully?
- [ ] Is Phase 04 implementation absent?

# 100. Document Internal Consistency
- R06 owns acceptance, regression closure, and handoff.
- R06 does not own new Phase 04 features.
- R01 remains customer capability authority.
- R02 remains customer DB transaction/repository substrate.
- R03 remains durable cart/order persistence substrate.
- R04 remains business command orchestration source.
- R05 remains replay/idempotency wrapper around R04.
- R06 tests the chain rather than replacing it.
- R06 may fix only reproduced defects inside established contracts.
- Customer selectors remain non-authoritative.
- Customer prices/currency/totals remain server-authoritative.
- Customer capability remains separate from staff Auth.js.
- Private replay state remains least privilege.
- Payment/kitchen/realtime/notifications remain deferred.
- Phase 04 remains blocked without its own exact spec on main.

# 101. Document Validation Checklist
- [ ] Canonical filename is correct.
- [ ] Phase metadata is `03`.
- [ ] Round metadata is `06`.
- [ ] Status is `READY`.
- [ ] Previous spec is canonical R05.
- [ ] Next spec is canonical P04/R01.
- [ ] Implementation parent expectation names latest R05 branch.
- [ ] Observed R05 SHA matches inspected branch at authoring.
- [ ] Scope is acceptance/regression/handoff.
- [ ] Phase 04 features are explicit non-goals.
- [ ] R01 current-code assumptions are grounded.
- [ ] R02 current-code assumptions are grounded.
- [ ] R03 current-code assumptions are grounded.
- [ ] R04 current-code assumptions are grounded.
- [ ] R05 current-code assumptions are grounded.
- [ ] CREATE paths are explicit.
- [ ] MODIFY policy is explicit.
- [ ] MOVE policy is explicit.
- [ ] REMOVE policy is explicit.
- [ ] DO-NOT-TOUCH surfaces are explicit.
- [ ] Acceptance record contract is explicit.
- [ ] Security acceptance is explicit.
- [ ] Migration safety is explicit.
- [ ] Failure/recovery is explicit.
- [ ] Concurrency acceptance is explicit.
- [ ] Idempotency acceptance is explicit.
- [ ] Validation plan is explicit.
- [ ] Definition of Done is explicit.
- [ ] PR evidence requirements are explicit.
- [ ] Phase 04 handoff is fail closed.
- [ ] Document has no filler or blank-line padding used to satisfy size.
- [ ] Final line count is 1,800–2,500 inclusive.

# 102. Phase 04 Handoff Contract
- R06 completes Phase 03 only when acceptance evidence is materially sufficient.
- R06 implementation branch becomes latest Phase 03 lineage tip when implemented.
- R06 implementation PR remains owner-controlled.
- Phase 04 specification authority must come from a future exact file on `main`.
- R06 must not invent Phase 04 round scope.
- `Next` points to `FLOW_P04_R01_IMPLEMENTATION_SPEC.md` only as continuation marker.
- If P04/R01 spec is absent on current main, Phase 04 implementation stops.
- Future P04/R01 authoring must inspect actual R06 implementation branch.
- Future P04/R01 authoring must inspect `FLOW_P03_ACCEPTANCE.md`.
- Any Phase 03 blocker recorded in acceptance must remain visible to downstream work.
- Phase 04 may consume proven P03 invariants but must not weaken them silently.

# 103. R06 Implementation PR Scope Declaration
```text
IMPLEMENTATION_PHASE=P03
IMPLEMENTATION_ROUND=R06
PHASE03_END_TO_END_ACCEPTANCE=YES
PHASE03_ACCEPTANCE_RECORD=YES
R01_CAPABILITY_REGRESSION_PROOF=YES
R02_CUSTOMER_DATA_ACCESS_REGRESSION_PROOF=YES
R03_CART_ORDER_PERSISTENCE_REGRESSION_PROOF=YES
R04_COMMAND_FLOW_REGRESSION_PROOF=YES
R05_IDEMPOTENCY_REPLAY_REGRESSION_PROOF=YES
CROSS_TENANT_NEGATIVE_ACCEPTANCE=YES
CROSS_BRANCH_NEGATIVE_ACCEPTANCE=YES
CROSS_CAPABILITY_NEGATIVE_ACCEPTANCE=YES
AMBIGUOUS_RESPONSE_RECOVERY_ACCEPTANCE=YES
CONCURRENT_DUPLICATE_ACCEPTANCE=YES
ACCEPTANCE_BLOCKING_DEFECT_FIXES=ONLY_IF_REPRODUCED
NEW_PHASE04_FEATURES=NO
PAYMENT_EXECUTION_CHANGED=NO
KITCHEN_RUNTIME_CHANGED=NO
REALTIME_RUNTIME_CHANGED=NO
NOTIFICATION_RUNTIME_CHANGED=NO
IMPLEMENTATION_AGENT_MERGE=NO
AUTO_MERGE=NO
```

# 104. Final Development Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This specification authorizes only P03/R06 implementation after it is on `main`.
- R06 implementation must branch from latest legitimate R05 lineage.
- Documentation branch is never implementation parent.
- R06 implementation PR remains owner-controlled.
- After R06 implementation completes, Phase 03 has six implemented round branches.
- Phase 04 still cannot start until exact `FLOW_P04_R01_IMPLEMENTATION_SPEC.md` exists on current main.

# 105. Required Next Specification
```text
FLOW_P04_R01_IMPLEMENTATION_SPEC.md
```
- R06 implementation must not create this file.
- Future authoring must inspect actual R06 implementation state.
- Future authoring must inspect `FLOW_P03_ACCEPTANCE.md`.
- Future authoring must derive Phase 04 scope from current repository authority.
- If this file is absent on current main after R06 implementation, development stops before Phase 04.

# 106. Final Acceptance Statement
- P03/R06 is READY as an executable specification document.
- R06 proves the customer capability → scoped data access → durable persistence → command orchestration → replay-safe mutation chain.
- R06 permits only evidence-driven correction of defects violating established Phase 03 contracts.
- R06 requires durable `FLOW_P03_ACCEPTANCE.md` evidence.
- R06 preserves staff/customer authority separation.
- R06 preserves tenant/branch/capability least privilege.
- R06 preserves server authority for scope, price, currency, totals, and durable state.
- R06 preserves atomic cart-to-order submission.
- R06 preserves deterministic request replay.
- R06 does not implement payment.
- R06 does not implement kitchen operations.
- R06 does not implement realtime publication.
- R06 does not implement notifications.
- R06 does not implement Phase 04.
- Phase 04 remains fail-closed until its exact executable spec is present on current main.

# 107. Detailed Acceptance Case Catalog — Entry
- [ ] E001 valid restaurant + active table resolves.
- [ ] E002 valid restaurant + active table yields tenant A.
- [ ] E003 valid restaurant + active table yields branch A1.
- [ ] E004 valid restaurant + active table yields table A1.
- [ ] E005 valid entry yields server-issued capability ID.
- [ ] E006 valid entry does not yield staff actor ID.
- [ ] E007 valid entry does not yield role codes.
- [ ] E008 valid entry does not yield permission codes.
- [ ] E009 unknown restaurant fails closed.
- [ ] E010 unknown table fails closed.
- [ ] E011 inactive table fails closed.
- [ ] E012 sibling-branch table mismatch fails closed.
- [ ] E013 cross-tenant table mismatch fails closed.
- [ ] E014 malformed selector fails safely.
- [ ] E015 oversized selector fails safely.
- [ ] E016 invalid capability fails before mutation.
- [ ] E017 expired capability fails before mutation.
- [ ] E018 tampered capability fails before mutation.
- [ ] E019 missing capability fails protected mutation.
- [ ] E020 customer capability cannot authenticate staff route.
- [ ] E021 staff cookie alone does not choose customer table scope.
- [ ] E022 browser tenant body field cannot override context.
- [ ] E023 browser branch body field cannot override context.
- [ ] E024 browser table body field cannot override context.
- [ ] E025 capability transport does not expose bearer in URL.
- [ ] E026 capability bearer not written to acceptance logs.
- [ ] E027 entry unavailable error does not fabricate capability.
- [ ] E028 open redirect target is rejected.
- [ ] E029 valid re-entry does not broaden scope.
- [ ] E030 different table re-entry follows explicit server policy only.

# 108. Detailed Acceptance Case Catalog — Reads
- [ ] R001 storefront tenant matches trusted context.
- [ ] R002 storefront branch matches trusted context.
- [ ] R003 storefront restaurant matches trusted context.
- [ ] R004 Tenant B storefront invisible to Tenant A.
- [ ] R005 sibling-branch data not leaked.
- [ ] R006 menu active item visible.
- [ ] R007 archived menu item not active.
- [ ] R008 inactive menu item not active.
- [ ] R009 cross-tenant menu item invisible.
- [ ] R010 modifier group belongs to item.
- [ ] R011 modifier choice belongs to allowed group.
- [ ] R012 unrelated modifier choice rejected.
- [ ] R013 missing customer DB context fails closed.
- [ ] R014 customer-entry role cannot use customer-runtime read surface directly.
- [ ] R015 customer-runtime cannot read staff membership data.
- [ ] R016 customer-runtime cannot read permission mapping data through customer path.
- [ ] R017 client restaurant ID does not broaden read scope.
- [ ] R018 client branch ID does not broaden read scope.
- [ ] R019 client tenant ID does not broaden read scope.
- [ ] R020 read errors do not expose SQL internals.

# 109. Detailed Acceptance Case Catalog — Cart Create/Get
- [ ] C001 first create/get returns DRAFT cart.
- [ ] C002 cart tenant comes from trusted context.
- [ ] C003 cart branch comes from trusted context.
- [ ] C004 cart table comes from trusted context.
- [ ] C005 cart capability ownership comes from trusted context.
- [ ] C006 cart ID is opaque UUID.
- [ ] C007 repeat get/create returns active cart according to R04 contract.
- [ ] C008 repeat get/create does not uncontrolled-create duplicate active carts.
- [ ] C009 another capability cannot get cart by known ID.
- [ ] C010 sibling branch cannot get cart by known ID.
- [ ] C011 another tenant cannot get cart by known ID.
- [ ] C012 terminal cart not silently reopened.
- [ ] C013 missing context prevents create/get.
- [ ] C014 malformed selector cannot create arbitrary scoped cart.
- [ ] C015 cart create does not persist bearer token.
- [ ] C016 cart create does not accept client tenant ID.
- [ ] C017 cart create does not accept client branch ID.
- [ ] C018 cart create does not accept client capability ID.
- [ ] C019 cart create route remains server-only mutation boundary.
- [ ] C020 cart create errors remain safe.

# 110. Detailed Acceptance Case Catalog — Add Item
- [ ] A001 valid add requires owned DRAFT cart.
- [ ] A002 valid add requires valid menu item.
- [ ] A003 valid add validates quantity lower bound.
- [ ] A004 valid add validates quantity upper bound.
- [ ] A005 valid add validates modifier count.
- [ ] A006 valid add validates modifier choice ownership.
- [ ] A007 valid add captures authoritative unit price.
- [ ] A008 valid add captures authoritative currency.
- [ ] A009 valid add captures special request safely.
- [ ] A010 valid add persists modifier snapshots.
- [ ] A011 forged price is ignored/not accepted.
- [ ] A012 forged currency is ignored/not accepted.
- [ ] A013 forged subtotal is ignored/not accepted.
- [ ] A014 cross-tenant menu item rejected.
- [ ] A015 inactive menu item rejected.
- [ ] A016 archived menu item rejected.
- [ ] A017 unrelated modifier rejected.
- [ ] A018 another capability cart rejected.
- [ ] A019 sibling-branch cart rejected.
- [ ] A020 cross-tenant cart rejected.
- [ ] A021 malformed cart UUID rejected.
- [ ] A022 malformed menu UUID rejected.
- [ ] A023 malformed modifier UUID rejected.
- [ ] A024 zero quantity rejected.
- [ ] A025 negative quantity rejected.
- [ ] A026 oversized quantity rejected.
- [ ] A027 oversized special request rejected.
- [ ] A028 add without replay key rejected.
- [ ] A029 malformed replay key rejected.
- [ ] A030 first valid keyed add executes once.
- [ ] A031 exact replay returns same cart DTO.
- [ ] A032 exact replay creates no new item row.
- [ ] A033 exact replay creates no new modifier row.
- [ ] A034 same key changed quantity mismatches.
- [ ] A035 same key changed menu item mismatches.
- [ ] A036 same key changed modifier set mismatches.
- [ ] A037 same semantic modifier set different order replays.
- [ ] A038 same key changed special request mismatches.
- [ ] A039 concurrent same-key add executes once.
- [ ] A040 concurrent same-key add yields one replay.

# 111. Detailed Acceptance Case Catalog — Update Item
- [ ] U001 valid update requires owned DRAFT cart.
- [ ] U002 valid update requires owned cart item.
- [ ] U003 valid update validates quantity lower bound.
- [ ] U004 valid update validates quantity upper bound.
- [ ] U005 another capability cannot update item.
- [ ] U006 sibling branch cannot update item.
- [ ] U007 another tenant cannot update item.
- [ ] U008 terminal cart cannot update item.
- [ ] U009 malformed cart UUID rejected.
- [ ] U010 malformed cart-item UUID rejected.
- [ ] U011 zero quantity rejected.
- [ ] U012 negative quantity rejected.
- [ ] U013 oversized quantity rejected.
- [ ] U014 missing replay key rejected.
- [ ] U015 malformed replay key rejected.
- [ ] U016 first keyed update executes once.
- [ ] U017 exact replay returns same cart DTO.
- [ ] U018 exact replay does not second-update row.
- [ ] U019 same key changed quantity mismatches.
- [ ] U020 mismatch leaves committed quantity unchanged.
- [ ] U021 concurrent same-key update executes once.
- [ ] U022 concurrent same-key update yields one replay.
- [ ] U023 update errors do not leak existence across capability scope.
- [ ] U024 update does not accept client tenant authority.
- [ ] U025 update does not accept client branch authority.

# 112. Detailed Acceptance Case Catalog — Remove Item
- [ ] D001 valid remove requires owned DRAFT cart.
- [ ] D002 valid remove requires owned item.
- [ ] D003 valid remove removes intended item.
- [ ] D004 valid remove handles modifier children according to schema.
- [ ] D005 another capability cannot remove item.
- [ ] D006 sibling branch cannot remove item.
- [ ] D007 another tenant cannot remove item.
- [ ] D008 terminal cart cannot remove item.
- [ ] D009 malformed cart UUID rejected.
- [ ] D010 malformed item UUID rejected.
- [ ] D011 missing replay key rejected.
- [ ] D012 malformed replay key rejected.
- [ ] D013 first keyed remove executes once.
- [ ] D014 exact replay returns original post-remove cart.
- [ ] D015 replay works after item no longer exists.
- [ ] D016 new-key remove after deletion returns not-found.
- [ ] D017 same key changed item ID mismatches.
- [ ] D018 concurrent same-key remove executes once.
- [ ] D019 concurrent same-key remove yields one replay.
- [ ] D020 replay does not delete unrelated rows.

# 113. Detailed Acceptance Case Catalog — Submit Order
- [ ] S001 submit requires owned DRAFT cart.
- [ ] S002 submit rejects empty cart.
- [ ] S003 submit locks source cart.
- [ ] S004 submit revalidates active item availability.
- [ ] S005 submit revalidates modifier availability.
- [ ] S006 submit uses persisted cart snapshots.
- [ ] S007 submit computes deterministic subtotal.
- [ ] S008 submit persists one DRAFT order before narrow transition.
- [ ] S009 submit persists order items.
- [ ] S010 submit persists order modifiers.
- [ ] S011 submit transition sets `PENDING_CONFIRMATION`.
- [ ] S012 submit transition sets customer status `SENT`.
- [ ] S013 submit transition sets submitted timestamp.
- [ ] S014 submit transition sets final order number according to R04 DB function.
- [ ] S015 submit converts source cart in same transaction.
- [ ] S016 another capability cannot submit source cart.
- [ ] S017 sibling branch cannot submit source cart.
- [ ] S018 another tenant cannot submit source cart.
- [ ] S019 unavailable item causes rollback/no order.
- [ ] S020 invalid modifier causes rollback/no order.
- [ ] S021 order persistence error rolls back.
- [ ] S022 transition error rolls back order.
- [ ] S023 cart conversion error rolls back order.
- [ ] S024 replay completion error rolls back order/cart conversion.
- [ ] S025 submit does not execute payment.
- [ ] S026 submit does not create kitchen ticket.
- [ ] S027 submit does not publish realtime event.
- [ ] S028 submit does not send notification.
- [ ] S029 missing replay key rejected.
- [ ] S030 malformed replay key rejected.
- [ ] S031 first keyed submit creates one order.
- [ ] S032 exact replay returns same order ID.
- [ ] S033 exact replay returns same order number.
- [ ] S034 exact replay returns same submitted timestamp.
- [ ] S035 exact replay does not create second order.
- [ ] S036 exact replay does not reconvert cart.
- [ ] S037 same key changed note mismatches.
- [ ] S038 concurrent same-key submit creates one order.
- [ ] S039 concurrent same-key submit yields one replay.
- [ ] S040 different keys same source cart still create at most one order.

# 114. Detailed Acceptance Case Catalog — Replay Storage
- [ ] I001 replay table exists in `private` schema.
- [ ] I002 replay table primary key is UUID.
- [ ] I003 tenant ID is required.
- [ ] I004 branch ID is required.
- [ ] I005 capability ID is required.
- [ ] I006 command code is required.
- [ ] I007 key digest is required.
- [ ] I008 request fingerprint is required.
- [ ] I009 status is required.
- [ ] I010 created timestamp is required.
- [ ] I011 updated timestamp is required.
- [ ] I012 expiry timestamp is required.
- [ ] I013 command check rejects unknown command.
- [ ] I014 key digest check rejects non-hex digest.
- [ ] I015 fingerprint check rejects non-hex digest.
- [ ] I016 status check rejects unknown status.
- [ ] I017 IN_PROGRESS forbids response payload.
- [ ] I018 SUCCEEDED requires 2xx response.
- [ ] I019 SUCCEEDED requires response version 1.
- [ ] I020 SUCCEEDED requires response body.
- [ ] I021 resource type/id are both null or both present.
- [ ] I022 expiry must be after creation.
- [ ] I023 unique scope includes tenant.
- [ ] I024 unique scope includes branch.
- [ ] I025 unique scope includes capability.
- [ ] I026 unique scope includes command.
- [ ] I027 unique scope includes key digest.
- [ ] I028 expiry index exists.
- [ ] I029 RLS enabled.
- [ ] I030 direct table grants revoked from public.
- [ ] I031 direct table grants revoked from anon.
- [ ] I032 direct table grants revoked from authenticated.
- [ ] I033 direct table grants revoked from internal runtime roles listed by migration.
- [ ] I034 direct table grants revoked from customer-entry role.
- [ ] I035 direct table grants revoked from customer-runtime role.
- [ ] I036 acquire function fixed search path.
- [ ] I037 complete function fixed search path.
- [ ] I038 acquire derives current tenant from trusted context.
- [ ] I039 acquire derives current branch from trusted context.
- [ ] I040 acquire derives capability from trusted context.
- [ ] I041 acquire validates finite command code.
- [ ] I042 acquire validates key digest format.
- [ ] I043 acquire validates fingerprint format.
- [ ] I044 acquire uses conflict-safe ownership insertion.
- [ ] I045 acquire returns OWNER for new identity.
- [ ] I046 acquire returns MISMATCH for changed fingerprint.
- [ ] I047 acquire returns EXPIRED for expired row.
- [ ] I048 acquire returns REPLAY for SUCCEEDED row.
- [ ] I049 acquire exposes IN_PROGRESS fail-closed outcome if invariant occurs.
- [ ] I050 complete derives trusted context.
- [ ] I051 complete validates success status 2xx.
- [ ] I052 complete validates response version.
- [ ] I053 complete requires response body.
- [ ] I054 complete validates resource pair.
- [ ] I055 complete updates only owned IN_PROGRESS row.
- [ ] I056 complete returns false if no owned row updated.
- [ ] I057 acquire execute revoked from public.
- [ ] I058 acquire execute revoked from anon.
- [ ] I059 acquire execute revoked from authenticated.
- [ ] I060 acquire execute revoked from customer-entry role.
- [ ] I061 acquire execute granted to customer-runtime.
- [ ] I062 complete execute revoked from public.
- [ ] I063 complete execute revoked from anon.
- [ ] I064 complete execute revoked from authenticated.
- [ ] I065 complete execute revoked from customer-entry role.
- [ ] I066 complete execute granted to customer-runtime.

# 115. Detailed Acceptance Case Catalog — Replay Executor
- [ ] X001 normalizes key before database work.
- [ ] X002 computes key digest before database work.
- [ ] X003 computes request fingerprint before transaction work.
- [ ] X004 resolves current CustomerContext.
- [ ] X005 uses default dependencies unless test scope overrides.
- [ ] X006 begins one customer data transaction per attempt.
- [ ] X007 acquires replay identity before command callback.
- [ ] X008 mismatch throws safe command error.
- [ ] X009 expired throws safe command error.
- [ ] X010 replay checks response version.
- [ ] X011 replay deserializes stored body.
- [ ] X012 malformed stored body becomes invariant error.
- [ ] X013 replay returns `replayed: true`.
- [ ] X014 replay preserves stored response status.
- [ ] X015 OWNER executes command callback.
- [ ] X016 OWNER serializes command result.
- [ ] X017 serialization failure becomes invariant error.
- [ ] X018 OWNER completes replay success before commit.
- [ ] X019 fresh success returns `replayed: false`.
- [ ] X020 fresh success returns configured status.
- [ ] X021 PostgreSQL 40001 retries once.
- [ ] X022 PostgreSQL 40P01 retries once.
- [ ] X023 arbitrary error does not retry.
- [ ] X024 second retryable failure surfaces safe unavailable/error mapping.
- [ ] X025 no third transaction attempt occurs.
- [ ] X026 retry uses same logical request identity.
- [ ] X027 retry does not generate new key digest.
- [ ] X028 retry does not generate different fingerprint.
- [ ] X029 replay path never calls business callback.
- [ ] X030 mismatch path never calls business callback.

# 116. Detailed Acceptance Case Catalog — Replay Facade
- [ ] F001 add wrapper lowercases validated cart UUID.
- [ ] F002 add wrapper lowercases validated menu UUID.
- [ ] F003 add wrapper validates quantity.
- [ ] F004 add wrapper validates modifier IDs.
- [ ] F005 add wrapper sorts modifier IDs.
- [ ] F006 add wrapper normalizes special request.
- [ ] F007 add wrapper command code is `CART_ADD_ITEM`.
- [ ] F008 add wrapper returns cart resource ID.
- [ ] F009 update wrapper validates cart UUID.
- [ ] F010 update wrapper validates item UUID.
- [ ] F011 update wrapper validates quantity.
- [ ] F012 update wrapper command code is `CART_UPDATE_ITEM`.
- [ ] F013 update wrapper returns cart resource ID.
- [ ] F014 remove wrapper validates cart UUID.
- [ ] F015 remove wrapper validates item UUID.
- [ ] F016 remove wrapper command code is `CART_REMOVE_ITEM`.
- [ ] F017 remove wrapper returns cart resource ID.
- [ ] F018 submit wrapper validates cart UUID.
- [ ] F019 submit wrapper normalizes customer note.
- [ ] F020 submit wrapper command code is `ORDER_SUBMIT`.
- [ ] F021 submit wrapper returns order resource ID.
- [ ] F022 cart replay deserializer validates object shape.
- [ ] F023 cart replay deserializer requires cart ID string.
- [ ] F024 cart replay deserializer requires status string.
- [ ] F025 cart replay deserializer requires subtotal string.
- [ ] F026 cart replay deserializer requires items array.
- [ ] F027 order replay deserializer validates order ID.
- [ ] F028 order replay deserializer validates source cart ID.
- [ ] F029 order replay deserializer validates order number.
- [ ] F030 order replay deserializer validates expected submitted status.
- [ ] F031 order replay deserializer validates customer status.
- [ ] F032 order replay deserializer validates timestamp string.
- [ ] F033 order replay deserializer rejects invalid date.
- [ ] F034 order replay deserializer validates subtotal string.
- [ ] F035 order replay deserializer validates currency string.

# 117. Acceptance Case Catalog — Failure Injection
- [ ] Y001 fail before replay acquisition: no business write.
- [ ] Y002 fail after replay acquire insert before command: transaction rolls back replay row.
- [ ] Y003 fail during menu lookup: no cart item write.
- [ ] Y004 fail during cart item insert: no replay success.
- [ ] Y005 fail during modifier insert: cart item mutation rolls back.
- [ ] Y006 fail during cart reload after mutation: mutation rolls back if transaction aborts.
- [ ] Y007 fail during replay serialization: mutation rolls back.
- [ ] Y008 fail during replay completion: mutation rolls back.
- [ ] Y009 fail during draft order insert: no order aggregate.
- [ ] Y010 fail during order item insert: draft order rolls back.
- [ ] Y011 fail during order modifier insert: order aggregate rolls back.
- [ ] Y012 fail during submit DB primitive: order aggregate rolls back.
- [ ] Y013 fail during source cart conversion: order rolls back.
- [ ] Y014 fail during submit replay serialization: submit transaction rolls back.
- [ ] Y015 fail during submit replay completion: order/cart conversion roll back.
- [ ] Y016 response disappears after commit: retry recovers exact result.
- [ ] Y017 first attempt 40001: one retry.
- [ ] Y018 second attempt 40001: stop safely.
- [ ] Y019 first attempt 40P01: one retry.
- [ ] Y020 second attempt 40P01: stop safely.
- [ ] Y021 mismatch error is not retried.
- [ ] Y022 invalid input error is not retried.
- [ ] Y023 not-found error is not retried.
- [ ] Y024 insufficient privilege is not treated as transient business retry.

# 118. Acceptance Case Catalog — Privacy and Redaction
- [ ] P001 entry logs exclude bearer capability.
- [ ] P002 cart logs exclude bearer capability.
- [ ] P003 order logs exclude bearer capability.
- [ ] P004 replay logs exclude raw idempotency key.
- [ ] P005 replay table excludes raw idempotency key.
- [ ] P006 replay table excludes bearer capability token.
- [ ] P007 replay response excludes key digest.
- [ ] P008 replay response excludes request fingerprint.
- [ ] P009 customer errors exclude SQLSTATE.
- [ ] P010 customer errors exclude SQL query.
- [ ] P011 customer errors exclude stack trace.
- [ ] P012 customer errors exclude database role names.
- [ ] P013 customer errors exclude private function names.
- [ ] P014 acceptance doc excludes secrets.
- [ ] P015 PR body excludes secrets.
- [ ] P016 test fixtures do not print bearer token on failure where avoidable.
- [ ] P017 response body logging is avoided when customer note may appear.
- [ ] P018 safe UUIDs are distinguished from bearer secrets.

# 119. Acceptance Case Catalog — Regression
- [ ] G001 Phase 02 staff login still works.
- [ ] G002 Phase 02 staff workspace selection still works.
- [ ] G003 Phase 02 membership revocation still denies.
- [ ] G004 Phase 02 permission evaluation still denies unauthorized staff command.
- [ ] G005 R01 valid entry still works.
- [ ] G006 R01 invalid entry still fails.
- [ ] G007 R01 capability expiry still fails.
- [ ] G008 R02 storefront read still works.
- [ ] G009 R02 menu read still works.
- [ ] G010 R03 cart create still works.
- [ ] G011 R03 cart aggregate load still works.
- [ ] G012 R03 order persistence still works.
- [ ] G013 R04 add still works through R05 facade.
- [ ] G014 R04 update still works through R05 facade.
- [ ] G015 R04 remove still works through R05 facade.
- [ ] G016 R04 submit still works through R05 facade.
- [ ] G017 R05 add replay still works.
- [ ] G018 R05 update replay still works.
- [ ] G019 R05 remove replay still works.
- [ ] G020 R05 submit replay still works.
- [ ] G021 R05 mismatch still fails.
- [ ] G022 R05 concurrent duplicate still deduplicates.
- [ ] G023 R05 cross-capability key isolation still works.
- [ ] G024 fresh DB still reproduces all P03 objects.
- [ ] G025 generated type check still passes or reports truthful blocker.
- [ ] G026 lint remains clean or truthful blocker recorded.
- [ ] G027 typecheck remains clean or truthful blocker recorded.
- [ ] G028 build remains clean or truthful blocker recorded.

# 120. Acceptance Case Catalog — Fresh Database
- [ ] B001 clean DB can apply earliest migration.
- [ ] B002 clean DB can apply Phase 02 migrations.
- [ ] B003 clean DB can apply R01 migration.
- [ ] B004 clean DB can apply R02 migration.
- [ ] B005 clean DB can apply R03 migration.
- [ ] B006 clean DB can apply R04 migration.
- [ ] B007 clean DB can apply R05 migration.
- [ ] B008 clean DB contains flow_customer_entry role.
- [ ] B009 clean DB contains flow_customer_runtime role.
- [ ] B010 clean DB contains entry resolution function.
- [ ] B011 clean DB contains capability scope validation function.
- [ ] B012 clean DB contains customer context functions.
- [ ] B013 clean DB contains cart ownership schema.
- [ ] B014 clean DB contains cart snapshot schema.
- [ ] B015 clean DB contains order source-cart uniqueness.
- [ ] B016 clean DB contains submit function.
- [ ] B017 clean DB contains replay table.
- [ ] B018 clean DB contains replay unique constraint.
- [ ] B019 clean DB contains replay expiry index.
- [ ] B020 clean DB contains replay acquire function.
- [ ] B021 clean DB contains replay complete function.
- [ ] B022 clean DB has intended direct-table revokes.
- [ ] B023 clean DB has intended function grants.
- [ ] B024 clean DB runs all Phase 03 pgTAP files.
- [ ] B025 clean DB supports R06 runtime integration suite.

# 121. Acceptance Case Catalog — PR Evidence
- [ ] Q001 PR names Phase 03 Round 06.
- [ ] Q002 PR names exact R06 spec.
- [ ] Q003 PR records current main authority SHA.
- [ ] Q004 PR records R05 parent branch.
- [ ] Q005 PR records R05 parent SHA.
- [ ] Q006 PR records R06 head SHA.
- [ ] Q007 PR lists changed files.
- [ ] Q008 PR separates acceptance tests from defect fixes.
- [ ] Q009 PR records migration change or none.
- [ ] Q010 PR records package/lockfile change or none.
- [ ] Q011 PR records security/grant change or none.
- [ ] Q012 PR records unit result.
- [ ] Q013 PR records integration result.
- [ ] Q014 PR records database result.
- [ ] Q015 PR records fresh reset result.
- [ ] Q016 PR records DB lint result.
- [ ] Q017 PR records generated type drift result.
- [ ] Q018 PR records lint result.
- [ ] Q019 PR records typecheck result.
- [ ] Q020 PR records build result.
- [ ] Q021 PR records browser E2E result or truthful NOT RUN/BLOCKED.
- [ ] Q022 PR links/mentions acceptance record path.
- [ ] Q023 PR lists known limitations.
- [ ] Q024 PR lists deferred Phase 04 work.
- [ ] Q025 PR states implementation agent did not merge.
- [ ] Q026 PR does not enable auto-merge.

# 122. Acceptance Case Catalog — Acceptance Record Evidence
- [ ] Z001 record names Phase 03.
- [ ] Z002 record names owner round R06.
- [ ] Z003 record names R06 branch.
- [ ] Z004 record names R05 parent branch.
- [ ] Z005 record names R05 parent SHA.
- [ ] Z006 record names R06 head SHA.
- [ ] Z007 record names exact R06 spec.
- [ ] Z008 record names current main authority.
- [ ] Z009 record states implementation merge status truthfully.
- [ ] Z010 record summarizes R01 capability boundary.
- [ ] Z011 record summarizes R02 data access boundary.
- [ ] Z012 record summarizes R03 persistence boundary.
- [ ] Z013 record summarizes R04 command boundary.
- [ ] Z014 record summarizes R05 replay boundary.
- [ ] Z015 record includes end-to-end chain.
- [ ] Z016 record includes security conclusions.
- [ ] Z017 record includes role/grant conclusions.
- [ ] Z018 record includes persistence conclusions.
- [ ] Z019 record includes command conclusions.
- [ ] Z020 record includes replay conclusions.
- [ ] Z021 record includes failure/recovery conclusions.
- [ ] Z022 record includes validation table.
- [ ] Z023 record includes defect fixes if any.
- [ ] Z024 record includes known limitations.
- [ ] Z025 record includes deferred payment work.
- [ ] Z026 record includes deferred kitchen work.
- [ ] Z027 record includes deferred realtime work.
- [ ] Z028 record includes deferred notification work.
- [ ] Z029 record identifies Phase 04 handoff.
- [ ] Z030 record does not invent P04 scope.

# 123. Final R06 Review Before Implementation PR
- [ ] Read entire R06 diff from R05 parent.
- [ ] Confirm every runtime change maps to classified acceptance defect.
- [ ] Confirm no historical spec rewrite.
- [ ] Confirm no historical migration rewrite.
- [ ] Confirm tests use production interfaces.
- [ ] Confirm tests do not introduce runtime backdoors.
- [ ] Confirm no role grant is broader than P03 contract.
- [ ] Confirm no direct SQL appears in customer route handlers.
- [ ] Confirm R05 facade remains replay boundary.
- [ ] Confirm R04 commands remain business orchestration source.
- [ ] Confirm R03 repositories remain persistence source.
- [ ] Confirm R02 transaction scope remains DB-context source.
- [ ] Confirm R01 CustomerContext remains customer authority source.
- [ ] Confirm acceptance record names exact head.
- [ ] Confirm acceptance record uses truthful results.
- [ ] Confirm no P04 source file is created.
- [ ] Confirm package changes are acceptance-only.
- [ ] Confirm lockfile unchanged unless unavoidable and justified.
- [ ] Confirm implementation PR remains owner-controlled.
- [ ] Confirm auto-merge is not enabled.

# 124. Required Next Specification
```text
FLOW_P04_R01_IMPLEMENTATION_SPEC.md
```
- Future P04/R01 spec is not authored by R06 implementation.
- Future P04/R01 authoring must inspect actual R06 implementation state.
- Future P04/R01 authoring must inspect `FLOW_P03_ACCEPTANCE.md`.
- Future P04/R01 authoring must inspect current repository product/architecture authority.
- If P04/R01 spec is absent on current main, implementation stops.

# 125. Final Gate
```text
NO SPEC ON MAIN = NO DEVELOPMENT
FAILED REQUIRED CI = ROUND NOT READY
NO ROUND BRANCH = NO NEXT ROUND BRANCH
6 IMPLEMENTED ROUND BRANCHES = PHASE IMPLEMENTATION CHAIN COMPLETE
NO NEXT PHASE SPEC ON MAIN = STOP
```
- This spec authorizes P03/R06 only after merge to `main`.
- R06 implementation parent is latest R05 implementation branch.
- Docs branch is never implementation parent.
- R06 implementation agent must not merge implementation PR.
- Owner controls implementation integration.
- Phase 04 cannot start without exact authorized P04/R01 spec on current main.

# 126. Final Acceptance Statement
- P03/R06 is `READY` as an executable specification.
- The round exists to prove Phase 03 as one integrated customer data plane.
- The round accepts narrow evidence-driven correction only when an existing P03 invariant is broken.
- The round requires durable acceptance documentation.
- The round requires customer capability, database scope, persistence, command, and replay regression evidence.
- The round requires tenant, branch, and capability isolation evidence.
- The round requires rollback and concurrency evidence.
- The round requires truthful validation outcomes.
- The round does not implement payment.
- The round does not implement kitchen operations.
- The round does not implement realtime.
- The round does not implement notifications.
- The round does not implement Phase 04.
- Phase 04 remains fail closed until its own exact executable specification exists on current main.
