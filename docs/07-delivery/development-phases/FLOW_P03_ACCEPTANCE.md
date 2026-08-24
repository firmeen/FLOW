# FLOW Phase 03 Acceptance

> **NON-EXECUTABLE ACCEPTANCE RECORD**  
> This document records observed Phase 03 implementation and validation evidence. It does not authorize Phase 04 implementation and does not replace any `FLOW_PXX_RXX_IMPLEMENTATION_SPEC.md` file.

## 1. Acceptance identity

```text
PHASE:                         03
ACCEPTANCE_OWNER_ROUND:        P03/R06
R06_SPECIFICATION:             FLOW_P03_R06_IMPLEMENTATION_SPEC.md
R06_SPEC_STATUS_ON_MAIN:       READY
SPECIFICATION_AUTHORITY:       main
MAIN_AUTHORITY_SHA_AT_START:   c820b0cea24cdd910c530c547190740cb06f4aa1
IMPLEMENTATION_PARENT_BRANCH:  p03-r05-idempotency-replay
IMPLEMENTATION_PARENT_SHA:     6f85c4596f41713fea2ecec65186c3d5b42172ec
R06_IMPLEMENTATION_BRANCH:     p03-r06-phase-acceptance
R06_IMPLEMENTATION_EVIDENCE_HEAD: c5aed003c0034416f7b2aaec826c50a6305463bd
R06_IMPLEMENTATION_PR:         #76
R06_IMPLEMENTATION_MERGED:     NO
DOCUMENT_AUTHORITY:            repository state + observed validation evidence
GITHUB_ACTIONS_SPEC_AUTHORITY: NO
```

`R06_IMPLEMENTATION_EVIDENCE_HEAD` is the exact code/test head on which the integrated R06 acceptance suite and the full repository-required validation were observed before this acceptance record was committed. The PR may have a later head solely because this evidence record is itself part of the required R06 output.

## 2. Acceptance status

```text
PHASE03_IMPLEMENTATION_CHAIN:          PROVEN
PHASE03_REQUIRED_HOSTED_VALIDATION:    PROVEN
PHASE03_DATABASE_REPRODUCIBILITY:      PROVEN
PHASE03_INTEGRATED_SERVER_ACCEPTANCE:  PROVEN
PHASE03_BROWSER_E2E_EXECUTION:         NOT PROVEN — test committed; hosted deterministic DB browser run not executed
PHASE03_ACCEPTANCE_RECORD:             PROVEN — this file
PHASE03_IMPLEMENTATION_PR_MERGED:      NO
PHASE04_IMPLEMENTATION_AUTHORIZED:     NO
```

Phase 03 is accepted as an implemented branch-chain baseline for the scope defined by R01–R06, subject to owner-controlled PR integration. This record does **not** claim that PR #76 is merged into `main`.

## 3. Phase 03 round lineage

| Round | Implementation branch | Accepted implementation head | PR | Boundary accepted |
| --- | --- | --- | ---: | --- |
| R01 | `p03-r01-customer-capability` | `2bcc1bb10bc56c9de9d6e30f66f5141dbf079223` | #66 | customer capability/session and immutable CustomerContext boundary |
| R02 | `p03-r02-customer-data-access` | `19c57bcb654640174162f1ff313c8a5af9d5d578` | #68 | customer-scoped transaction and storefront/menu read data plane |
| R03 | `p03-r03-cart-order-persistence` | `95fcad991d685d8186dd888ee85be05c97875267` | #70 | durable customer cart/order persistence and ownership invariants |
| R04 | `p03-r04-customer-command-flow` | `6871194653dda3fd20c4147257a73026d1706431` | #72 | canonical cart/order mutation commands and atomic submit orchestration |
| R05 | `p03-r05-idempotency-replay` | `6f85c4596f41713fea2ecec65186c3d5b42172ec` | #74 | persistence-backed request idempotency, replay, mismatch and concurrency safety |
| R06 | `p03-r06-phase-acceptance` | `c5aed003c0034416f7b2aaec826c50a6305463bd` evidence head | #76 | integrated acceptance, security isolation, regression closure and P04 handoff |

The R06 branch was created directly from the exact R05 accepted lineage tip. No Phase 04 implementation branch was used as an implementation parent.

## 4. R01 boundary acceptance

R01 established a customer-only authority model distinct from staff Auth.js/RBAC.

```text
PUBLIC_SELECTOR_IS_AUTHORITY:            NO
SERVER_VALIDATED_ENTRY_EXCHANGE:         PROVEN
SIGNED_CUSTOMER_CAPABILITY:              PROVEN
HTTPONLY_CUSTOMER_COOKIE:                PROVEN
CANONICAL_IMMUTABLE_CUSTOMER_CONTEXT:     PROVEN
CUSTOMER_CONTEXT_CONTAINS_STAFF_ACTOR:    NO
CUSTOMER_CONTEXT_CONTAINS_STAFF_RBAC:     NO
CAPABILITY_SCOPE_REVALIDATION:            PROVEN
TABLE_SESSION_REVOCATION_SEMANTICS:       PROVEN
CUSTOMER_CAPABILITY_AUTHENTICATES_STAFF:  NO
```

The R06 integrated acceptance starts from `resolveCustomerEntry`, issues a capability through the canonical codec, validates it through the canonical validator, verifies immutable customer-only context, and consumes that context through the customer data plane.

## 5. R02 boundary acceptance

R02 established customer-safe transaction and read composition.

```text
CUSTOMER_DB_ROLE:                         flow_customer_runtime
STAFF_ACTOR_IN_CUSTOMER_TRANSACTION:      ABSENT
TRANSACTION_LOCAL_TENANT_SCOPE:           PROVEN
TRANSACTION_LOCAL_BRANCH_SCOPE:           PROVEN
TRANSACTION_LOCAL_CAPABILITY_SCOPE:       PROVEN
STOREFRONT_TENANT_SCOPE:                  PROVEN
STOREFRONT_BRANCH_SCOPE:                  PROVEN
MENU_TENANT_RESTAURANT_SCOPE:             PROVEN
CROSS_TENANT_READ_DENIAL:                 PROVEN
CUSTOMER_STAFF_ROLE_SEPARATION:           PROVEN
POOLED_CONTEXT_LEAKAGE_REGRESSION:         PROVEN BY INHERITED R02 SUITE
```

The R06 integration suite additionally proves that a validated direct-entry context loads only Tenant A / Branch A1 storefront and menu data and does not expose Tenant B menu data.

## 6. R03 persistence acceptance

R03 established durable server-owned cart and order state.

```text
DURABLE_CART_PERSISTENCE:                 PROVEN
DURABLE_ORDER_PERSISTENCE:                PROVEN
CART_OWNERSHIP_SERVER_DERIVED:            PROVEN
ORDER_OWNERSHIP_SERVER_DERIVED:           PROVEN
RAW_CAPABILITY_BEARER_PERSISTED:           NO
SERVER_PRICE_SNAPSHOT:                    PROVEN
SERVER_CURRENCY_SNAPSHOT:                 PROVEN
MODIFIER_NAME_PRICE_SNAPSHOT:             PROVEN
ONE_CART_ONE_ORDER_INVARIANT:              PROVEN
PARTIAL_CART_WRITE_ROLLBACK:               PROVEN BY INHERITED R03 SUITE
TERMINAL_CART_REOPEN:                      DENIED
OTHER_CAPABILITY_CART_ACCESS:              DENIED
CROSS_TENANT_CART_ACCESS:                 DENIED
```

The final integrated suite observes canonical THB pricing and modifier snapshots from the server-owned menu relationship rather than accepting browser-supplied price/currency authority.

## 7. R04 command-flow acceptance

R04 established the server-only customer command boundary.

```text
CREATE_GET_CART_CANONICAL_PATH:            PROVEN
ADD_ITEM_CANONICAL_COMMAND:                PROVEN
UPDATE_ITEM_CANONICAL_COMMAND:             PROVEN
REMOVE_ITEM_CANONICAL_COMMAND:             PROVEN BY INHERITED R04/R05 SUITES
SUBMIT_ORDER_CANONICAL_COMMAND:             PROVEN
SOURCE_CART_LOCKING:                       PROVEN BY INHERITED R04 SUITE
CURRENT_MENU_REVALIDATION:                 PROVEN BY INHERITED R04 SUITE
ORDER_SUBMISSION_ATOMICITY:                PROVEN
SOURCE_CART_TERMINAL_TRANSITION:           PROVEN
CLIENT_TENANT_BRANCH_PRICE_AUTHORITY:      DENIED
PAYMENT_SIDE_EFFECT_DURING_SUBMIT:          ABSENT
KITCHEN_SIDE_EFFECT_DURING_SUBMIT:          ABSENT
REALTIME_SIDE_EFFECT_DURING_SUBMIT:         ABSENT
NOTIFICATION_SIDE_EFFECT_DURING_SUBMIT:     ABSENT
```

R06 verifies that a submitted order is persisted exactly once with `PENDING_CONFIRMATION` / customer `SENT` semantics while the source cart becomes terminal in the same established transaction path.

## 8. R05 idempotency/replay acceptance

R05 established deterministic request identity and replay for retriable customer mutations.

```text
RAW_IDEMPOTENCY_KEY_PERSISTED:             NO
IDEMPOTENCY_KEY_DIGEST_PERSISTED:          PROVEN BY R05 DB SUITE
DETERMINISTIC_REQUEST_FINGERPRINT:         PROVEN
SAME_KEY_SAME_INTENT_REPLAY:               PROVEN
SAME_KEY_DIFFERENT_INTENT_CONFLICT:         PROVEN
REPLAY_REEXECUTES_MUTATION:                NO
AMBIGUOUS_RESPONSE_RECOVERY:               PROVEN
CONCURRENT_SAME_KEY_EXECUTES_ONCE:          PROVEN
CONCURRENT_SAME_KEY_REPLAY_COUNT:           EXACTLY ONE IN R06 TEST
CROSS_CAPABILITY_REPLAY_AUTHORITY:          DENIED
CROSS_TENANT_REPLAY_AUTHORITY:              DENIED
UNBOUNDED_DATABASE_RETRY:                   NO
REPLAY_AND_MUTATION_TRANSACTION_COUPLED:    PROVEN BY R05/R06 SUITES
```

R06 explicitly proves both ambiguous-response recovery and concurrent duplicate submission: retries with the same request identity return the committed order identity, while concurrent first delivery produces one business execution and one replay with one durable source-cart order.

## 9. Integrated R06 acceptance coverage

Created in R06:

```text
apps/web/next-flow/tests/integration/customer-data-plane-acceptance.test.ts
apps/web/next-flow/tests/e2e/customer-data-plane-acceptance.spec.ts
```

`apps/web/next-flow/package.json` was modified only to add the new integration acceptance file to the existing `test:db-runtime` discovery command. No package dependency or lockfile change was made.

The R06 database-runtime suite contains six integrated tests covering:

1. direct entry → capability → immutable CustomerContext → scoped storefront/menu read;
2. server-authoritative cart snapshots, replay/mismatch handling, and cross-capability/cross-branch/cross-tenant write denial;
3. deterministic update replay and changed-intent mismatch denial;
4. atomic submit plus ambiguous-response recovery returning the original committed order;
5. concurrent identical submit serialization with one execution, one replay, and one durable order;
6. transaction-local customer DB authority with no staff actor identity.

## 10. Exact hosted validation evidence

Exact accepted code/test evidence head:

```text
c5aed003c0034416f7b2aaec826c50a6305463bd
```

Observed workflow results on that R06 head:

| Validation | Result | Evidence |
| --- | --- | --- |
| R06 spec exists on current `main` and is `READY` | PASS | `FLOW_P03_R06_IMPLEMENTATION_SPEC.md` on `main` |
| implementation parent is exact R05 lineage tip | PASS | `p03-r05-idempotency-replay` @ `6f85c459...` |
| R05 → R06 changed-file scope | PASS | two test files + package test-discovery change only |
| Repository Integrity | PASS | hosted run #93 |
| Phase/Round Gate | PASS | hosted run #129 |
| Dependency Integrity / clean `npm ci` | PASS | Stable Quality Gates run #93 |
| lint | PASS | Stable Quality Gates run #93 |
| typecheck | PASS | Stable Quality Gates run #93 |
| application/unit tests | PASS | Stable Quality Gates run #93 |
| Next.js build | PASS | Stable Quality Gates run #93 |
| Supabase startup | PASS | transient registry rate limiting recovered by existing bounded startup retry |
| fresh DB reset / all migrations / seed | PASS | Stable Quality Gates run #93 |
| database pgTAP | PASS | 11 files / 287 tests |
| database lint | PASS | inherited `private.record_login_failure` warnings only; no failing lint error |
| Kysely DB type generation | PASS | 35 tables introspected |
| generated DB type drift | PASS | no committed drift |
| DB runtime integration | PASS | 13 files / 69 tests |
| R06 integrated acceptance | PASS | 6 tests |
| Vercel preview | PASS | hosted commit status on evidence head |
| browser E2E | NOT RUN | no deterministic DB-backed Playwright job in the required hosted workflow set |

No validation result is promoted from `NOT RUN` to `PASS` without observed evidence.

## 11. Fresh database reproducibility

Fresh database acceptance replayed the complete migration chain through:

```text
20260823170000_p03_r01_customer_capability_boundary.sql
20260823180000_p03_r02_customer_data_access.sql
20260823193000_p03_r03_cart_order_persistence.sql
20260823202000_p03_r04_customer_command_submission.sql
20260823210000_p03_r05_customer_command_idempotency.sql
```

The reset completed, deterministic seed data loaded, pgTAP passed 287 tests, DB lint completed without a failing error, generated Kysely types matched the committed file, and all 69 DB-runtime integration tests passed.

The first Supabase image pull encountered registry `429 / toomanyrequests` responses. The existing R05 CI transient-infrastructure classifier performed its bounded retry and startup subsequently completed. This is recorded as recovered infrastructure behavior, not as a product defect and not as a hidden failure.

## 12. Security conclusions required by R06

| Acceptance conclusion | Result | Basis |
| --- | --- | --- |
| customer direct-entry separation from staff identity | **PROVEN** | customer capability/context has no staff actor/RBAC; staff route remains separate |
| browser selectors are not authority | **PROVEN** | server entry resolution/capability exchange is authoritative |
| canonical `CustomerContext` | **PROVEN** | immutable validated context used by downstream data plane |
| least-privilege customer DB access | **PROVEN** | dedicated customer roles, transaction-local scope and inherited DB privilege tests |
| durable server-authoritative cart state | **PROVEN** | R03 persistence + R06 canonical snapshot/replay proof |
| durable server-authoritative order state | **PROVEN** | R03/R04 persistence + R06 submit/recovery proof |
| server-derived pricing/currency/totals | **PROVEN** | R06 observes canonical menu-derived THB snapshots; no client price authority |
| atomic order submission | **PROVEN** | source cart terminal + exactly one submitted order from one transaction path |
| exact same-key replay | **PROVEN** | add/update/submit replay evidence and R05 regression suites |
| ambiguous-response recovery | **PROVEN** | second same-key submit returns original committed order identity |
| concurrent duplicate protection | **PROVEN** | concurrent same-key submit: one execution + one replay + one order |
| cross-tenant denial | **PROVEN** | R01/R02/R03/R05 inherited suites + R06 mutation negative |
| cross-branch denial | **PROVEN** | sibling Branch A2 context cannot access Branch A1 cart |
| cross-capability denial | **PROVEN** | different same-scope capability cannot access/replay owned cart state |

## 13. PostgreSQL authority conclusions

```text
CUSTOMER_ENTRY_ROLE:                     flow_customer_entry
CUSTOMER_RUNTIME_ROLE:                   flow_customer_runtime
CUSTOMER_ROLE_BYPASSRLS:                 NO by established contract
DIRECT_PRIVATE_REPLAY_TABLE_AUTHORITY:   DENIED by R05 DB contract
REPLAY_FUNCTION_EXECUTION:               NARROW / customer runtime only by R05 DB contract
STAFF_ROLE_IN_CUSTOMER_TRANSACTION:      NO
MISSING_OR_CONTRADICTORY_CONTEXT:        FAIL CLOSED
HISTORICAL_MIGRATIONS_REWRITTEN_IN_R06:  NO
R06_FORWARD_MIGRATION_REQUIRED:          NO
PRODUCTION_DATABASE_MODIFIED:            NO
```

R06 introduced no new DB role, grant, RLS policy, SECURITY DEFINER function, table, column, index, enum, or migration because no acceptance-blocking database defect reproduced.

## 14. Transport and public-error conclusions

The committed R06 browser acceptance specification covers the existing HTTP transport contract for deterministic environments:

- natural create/get cart;
- add/update/remove mutation methods;
- submitted-order endpoint;
- stable success envelopes;
- replay marker behavior;
- missing idempotency-key denial;
- wrong-origin denial;
- missing capability denial;
- customer capability inability to become staff authority.

Hosted browser execution is **NOT RUN** for R06 because the current required workflow set does not provision the deterministic DB-backed Playwright environment. The test is preserved as executable acceptance coverage for an environment that supplies `DATABASE_URL`; this record does not claim browser PASS.

Transport security remains additionally covered by inherited unit/integration tests for body bounds, unknown fields, key validation, safe error mapping, and same-origin behavior.

## 15. Acceptance-blocking defects

```text
R06_ACCEPTANCE_BLOCKING_DEFECTS_REPRODUCED: NONE
RUNTIME_FIXES_IN_R06:                      NONE
DATABASE_FIXES_IN_R06:                     NONE
MIGRATIONS_ADDED_IN_R06:                   NONE
WORKFLOW_WEAKENING_IN_R06:                 NONE
TEST_ASSERTIONS_WEAKENED:                  NO
```

R06 did not use acceptance as a pretext to redesign runtime architecture or pull future product behavior backward.

## 16. Dependency and repository impact

```text
PACKAGE_DEPENDENCIES_CHANGED: NO
PACKAGE_LOCK_CHANGED:         NO
WORKFLOW_FILES_CHANGED:       NO
RUNTIME_CONFIG_CHANGED:       NO
APPLICATION_RUNTIME_CHANGED: NO
DATABASE_SCHEMA_CHANGED:      NO
PRODUCTION_DB_MODIFIED:       NO
```

The only package manifest change is test discovery for the integrated R06 DB-runtime acceptance file.

## 17. Known limitations

1. The R06 Playwright acceptance file is committed but was not executed by the hosted required workflow set because that workflow does not provide deterministic database-backed browser infrastructure. Result: `NOT RUN`.
2. Supabase image registry rate limits can delay startup. Existing bounded transient retry recovered successfully; no unbounded retry was introduced.
3. Database lint still reports inherited warnings for unused variables in `private.record_login_failure`; they are outside P03 acceptance scope and do not fail the repository's configured lint contract.
4. R05 idempotency retention scheduling/cleanup automation is deferred; the accepted contract retains the existing 48-hour replay boundary without adding a scheduler in R06.
5. PR integration remains owner-controlled under current repository policy; acceptance evidence does not imply merge.

## 18. Explicitly deferred scope

The following remains outside Phase 03 and was not implemented by R06:

- payment provider integration;
- payment-provider idempotency;
- customer payment method selection;
- payment execution;
- kitchen ticket creation/routing/display operational workflow;
- broader staff operational order processing beyond inherited baseline;
- realtime cart/order publication;
- customer notification delivery;
- generic transactional outbox;
- background-job infrastructure;
- analytics/event pipeline expansion;
- broader post-submit order lifecycle;
- Phase 04 implementation.

## 19. Phase 04 handoff

The exact next pointer from R06 is:

```text
FLOW_P04_R01_IMPLEMENTATION_SPEC.md
```

At R06 acceptance time that exact executable specification is **absent from current `main`**.

Therefore:

```text
P03/R06 IMPLEMENTATION: IMPLEMENTED / OWNER INTEGRATION PENDING
PHASE 03 BRANCH CHAIN:   COMPLETE THROUGH R06
PHASE 04 IMPLEMENTATION: STOP
NEXT AUTHORIZATION:      WAIT FOR FLOW_P04_R01_IMPLEMENTATION_SPEC.md ON main WITH READY STATUS
```

No Phase 04 scope is inferred from this handoff.

## 20. Final acceptance matrix

```text
R01 CUSTOMER CAPABILITY / CONTEXT:       PROVEN
R02 CUSTOMER DATA ACCESS:                PROVEN
R03 CART / ORDER PERSISTENCE:            PROVEN
R04 CUSTOMER COMMAND FLOW:               PROVEN
R05 IDEMPOTENCY / REPLAY:                PROVEN
R06 INTEGRATED SERVER ACCEPTANCE:        PROVEN
TENANT ISOLATION:                        PROVEN
BRANCH ISOLATION:                        PROVEN
CAPABILITY OWNERSHIP ISOLATION:          PROVEN
SERVER PRICE / CURRENCY AUTHORITY:       PROVEN
ATOMIC SUBMIT:                           PROVEN
AMBIGUOUS RESPONSE RECOVERY:             PROVEN
CONCURRENT DUPLICATE PROTECTION:         PROVEN
FRESH DATABASE REPRODUCIBILITY:          PROVEN
GENERATED TYPE CONSISTENCY:              PROVEN
REPOSITORY REQUIRED CHECKS:              PROVEN
BROWSER E2E EXECUTION:                   NOT PROVEN / NOT RUN
PAYMENT EXECUTION:                       DEFERRED
KITCHEN WORKFLOW:                        DEFERRED
REALTIME PUBLICATION:                    DEFERRED
NOTIFICATIONS:                           DEFERRED
PHASE 04 IMPLEMENTATION:                 BLOCKED — NO EXECUTABLE P04/R01 SPEC ON main
IMPLEMENTATION_AGENT_MERGED_PR:          NO
```

This is the final Phase 03 acceptance record for the current R06 implementation evidence. It may be updated only with truthful later evidence, such as owner integration or an actually executed browser acceptance run; it must never be used to retroactively claim an unexecuted test passed.