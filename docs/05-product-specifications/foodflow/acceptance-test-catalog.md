---
title: FoodFlow Dine-in Pilot Acceptance Test Catalog
document_id: FOODFLOW-SPEC-ACCEPTANCE
status: proposed
owner: Quality Engineering
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Dine-in Pilot Acceptance Test Catalog

All tests are `Target / not run` unless a test report and command output are linked. Existing demo interactions are not production-path acceptance evidence.

## Phase 0 and database foundation

| ID | Scenario | Expected |
|---|---|---|
| `P0-CONTRACT-001` | Every route/action maps to an auth, permission, feature, transition, API, event, and acceptance contract | No orphan critical action |
| `P0-CONTRACT-002` | Search docs for production-ready claims | No claim without code/test/operations evidence |
| `P1-DB-001` | Reset a clean local database | All migrations and deterministic seed apply |
| `P1-DB-002` | Insert branch-owned row with another tenant’s branch UUID | Composite FK rejects |
| `P1-RLS-001` | Correct tenant/branch/active membership reads allowed row | Allowed |
| `P1-RLS-002` | Missing transaction context | Zero rows/denied safely |
| `P1-RLS-003` | Guess another tenant’s record UUID | Denied with no existence disclosure |
| `P1-RLS-004` | Same tenant but wrong branch/assignment | Denied |
| `P1-RLS-005` | Suspended membership | Denied |
| `P1-RLS-006` | Update tenant/branch ownership fields | `WITH CHECK`/constraint rejects |
| `P1-AUDIT-001` | Application role updates/deletes audit row | Rejected |
| `P1-CTX-001` | Commit/rollback then reuse pooled connection | Local actor/tenant/branch context does not leak |

## Authentication and authorization

| ID | Scenario | Expected |
|---|---|---|
| `P2-AUTH-001` | Active owner/staff uses valid credential | Auth.js session created; generic safe response |
| `P2-AUTH-002` | Unknown user and wrong password | Indistinguishable external response; rate limit applies |
| `P2-AUTH-003` | Suspended user/organization/membership | Login or next command denied |
| `P2-AUTH-004` | Expired/revoked session accesses protected route and command | Redirect/401; no command mutation |
| `P2-AUTH-005` | Staff opens another role route directly | Route and query/command permission independently deny |
| `P2-AUTH-006` | Internal user changes submitted tenant/branch ID | Trusted membership context wins; cross-scope denied |
| `P2-AUTH-007` | Refund without recent step-up | `STEP_UP_REQUIRED`; no provider request |
| `P2-AUTH-008` | Logout/revoke other devices | Registry revoked before acknowledgement; subsequent use denied |

## Guest, QR, menu and order

| ID | Scenario | Expected |
|---|---|---|
| `P3-QR-001` | Valid QR exchange | Scoped guest cookie and public DTO issued |
| `P3-QR-002` | Unknown, expired, revoked, rotated, wrong-purpose QR | Same generic unavailable response |
| `P3-GUEST-001` | Guest changes table/order identifier | Other table/order denied |
| `P3-PUBLIC-001` | Inspect customer payload | No staff, audit, cost, other-table, or credential data |
| `P3-QUOTE-001` | Client changes item/modifier price | Server quote ignores/rejects client price |
| `P3-QUOTE-002` | Choice from unrelated modifier group | Rejected |
| `P3-QUOTE-003` | Item sold out after quote | Checkout revalidation rejects and returns requote guidance |
| `P3-ORDER-001` | Retry identical submission with same operation ID | Exactly one order; same response identity |
| `P3-ORDER-002` | Reuse operation ID with changed payload | `IDEMPOTENCY_CONFLICT` |
| `P3-ORDER-003` | Concurrent order-number allocation | Unique transactional numbers |

## Staff, workflow and kitchen

| ID | Scenario | Expected |
|---|---|---|
| `P4-ORDER-001` | Two devices accept same order/version | One success; one idempotent result or version conflict |
| `P4-ORDER-002` | Reject/change without reason | Validation rejects; no transition/audit gap |
| `P4-ORDER-003` | Illegal transition or stale version | Rejected; existing state unchanged |
| `P4-KITCHEN-001` | Order has hot, sushi, and drink items | Three correctly scoped station tickets |
| `P4-KITCHEN-002` | Item has no station mapping | Operational exception; no silent fallback routing |
| `P4-KITCHEN-003` | One of several required tickets ready | Order remains preparing |
| `P4-KITCHEN-004` | All required tickets ready | Order becomes ready once |
| `P4-KITCHEN-005` | Wrong branch/station mutates ticket | Denied |
| `P4-KITCHEN-006` | Remake requested twice with same operation | One new generation; original history retained |
| `P4-SERVE-001` | Staff serves before required readiness | Denied |

## Bill, payment and table closure

| ID | Scenario | Expected |
|---|---|---|
| `P5-BILL-001` | Request bill with billable orders | Immutable server-calculated bill version locked |
| `P5-BILL-002` | Add/change order after lock without authorized correction | Denied/new correction workflow required |
| `P5-PAY-001` | Create Omise payment | State is action-required/pending, never succeeded from create/redirect |
| `P5-PAY-002` | Forged or unverifiable webhook | Rejected/quarantined; no payment transition |
| `P5-PAY-003` | Duplicate provider event | One durable event/transition; replay-safe acknowledgement |
| `P5-PAY-004` | Out-of-order older event after success | Final state does not regress; no-op evidence recorded |
| `P5-PAY-005` | Amount/currency/account/mode/reference mismatch | Payment not succeeded; mismatch/reconciliation alert |
| `P5-PAY-006` | Provider success verified | Allocation/outstanding/audit/outbox update atomically |
| `P5-REFUND-001` | Partial refund within refundable balance | New refund record; original payment remains immutable |
| `P5-REFUND-002` | Duplicate/excess refund | Idempotent or rejected; total never exceeds refundable balance |
| `P5-TABLE-001` | Outstanding remains or order unfulfilled | Close denied |
| `P5-TABLE-002` | Outstanding zero and fulfillment complete | Session closes once; table becomes available |
| `P5-TABLE-003` | Authorized early-close override | Reason/approver/audit required; no fake paid/served state |

## Outbox, projection and operations

| ID | Scenario | Expected |
|---|---|---|
| `P6-OUTBOX-001` | Domain transaction rolls back | State, audit, and outbox all absent |
| `P6-OUTBOX-002` | Worker crashes after external side effect | Lease expires; idempotent retry causes no duplicate business effect |
| `P6-OUTBOX-003` | Retry budget exhausted | Dead-letter state, alert, restricted audited replay |
| `P6-CONFIG-001` | Edit published config/entitlement | Rejected; new version required |
| `P6-ENTITLEMENT-001` | Disabled topic command called directly | Server denies regardless of hidden UI |
| `P6-REPORT-001` | Compare dashboard totals with order/payment/refund ledger | Definitions reconcile for branch/date/channel/status filters |

## UI, API and release gates

| ID | Scenario | Expected |
|---|---|---|
| `P7-UI-001` | Payment provider return before webhook | “Confirming payment”, never “Paid” |
| `P7-UI-002` | Version conflict during edit | Input preserved, latest state shown, explicit review required |
| `P7-API-001` | Unknown fields, malformed IDs, oversized notes | Schema rejects with safe field errors |
| `P7-API-002` | Cross-tenant ID through every critical endpoint | Uniform deny/no existence disclosure |
| `P7-SEC-001` | Secret/dependency scan | No committed secrets or unresolved critical finding |
| `P7-BUILD-001` | `lint`, typecheck, unit/integration/contract tests, Next build | All pass on approved Node/runtime |
| `P7-OPS-001` | Backup restore and payment reconciliation exercise | RTO/RPO evidence and reconciled totals recorded |
| `P7-OPS-002` | Provider outage/duplicate/dead-letter incident drill | Owner, alert, containment, replay, and audit verified |

## End-to-end pilot journey

The minimum E2E run is secure QR → guest session → public menu → server quote → idempotent submit → staff accept → multi-station tickets → required readiness → serve → locked bill → payment pending → verified Omise success → outstanding zero → close table → audit/outbox/dashboard update.

The run is not accepted if it uses browser `localStorage` as operational truth, the shared temporary internal account, a sequential table code as authorization, a mocked provider success without verified evidence, or a client-derived dashboard total.

