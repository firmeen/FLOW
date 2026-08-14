---
title: FoodFlow Pilot Workflow and Status Transition Specification
document_id: FOODFLOW-SPEC-WORKFLOW
status: proposed
owner: Domain Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot Workflow and Status Transition Specification

This is the server/domain state-machine contract. UI components never assign workflow status directly.

## Command envelope

Every mutation carries an `operation_id`, expected aggregate `version`, and correlation ID. The server resolves actor, organization, branch, entitlement, and permission. Within one transaction it validates the transition, updates the aggregate, appends a transition/audit event, and inserts outbox work.

- The unique idempotency scope is organization + branch + command type/source + `operation_id`.
- Retrying the same key and fingerprint returns the original result.
- Reusing the key with a different fingerprint returns `IDEMPOTENCY_CONFLICT`.
- An unexpected aggregate version returns `VERSION_CONFLICT` with a safe refresh instruction.
- External provider calls do not hold the domain transaction open.

## Order status axes

The axes are independent. `customer_display_status` is a read projection and never financial truth.

```text
acceptance_status: submitted | accepted | rejected
fulfillment_status: not_started | preparing | ready | served | completed
financial_status: unpaid | payment_pending | partially_paid | paid | partially_refunded | refunded
exception_status: none | changed | canceled | voided | remake_required
```

### Acceptance transitions

| Command | From | To | Permission | Preconditions | Required event |
|---|---|---|---|---|---|
| `submitCustomerOrder` | None | `submitted` | Active guest capability | Valid table session, quote, menu/modifier/availability, operation fingerprint | `foodflow.order.submitted.v1` |
| `acceptOrder` | `submitted` | `accepted` | `order.accept` | Expected version; all required station mappings valid; bill not locked | `foodflow.order.accepted.v1` |
| `rejectOrder` | `submitted` | `rejected` | `order.reject` | Expected version; non-empty reason | `foodflow.order.rejected.v1` |

Acceptance is terminal on this axis. A missing station mapping returns `ROUTING_INCOMPLETE`, records an operational exception, and leaves the order `submitted`; it never silently sends all items to one station.

### Fulfillment transitions

| Command/source | From | To | Permission | Preconditions | Event |
|---|---|---|---|---|---|
| Acceptance routing | `not_started` | `not_started` | `order.accept` | Acceptance succeeded and tickets created atomically | `foodflow.kitchen.tickets_created.v1` |
| First required item/ticket starts | `not_started` | `preparing` | Derived | Order accepted | `foodflow.order.preparing.v1` |
| Required ticket aggregation | `preparing` | `ready` | Derived | Every required active ticket generation is ready | `foodflow.order.ready.v1` |
| `serveOrder` | `ready` | `served` | `order.serve` | Expected version; branch assignment | `foodflow.order.served.v1` |
| Completion projection | `served` | `completed` | Derived | Branch completion policy satisfied | `foodflow.order.completed.v1` |

`ready` cannot be asserted by a single station when another required station is incomplete. Optional tickets do not block readiness unless the published workflow version says otherwise.

### Exception transitions

| Command | Allowed state | Result | Permission | Conditions |
|---|---|---|---|---|
| `changeOrder` | Submitted before acceptance | New immutable item snapshots; `changed` projection | `order.change` | Reason, re-quote, expected version; history retained |
| `cancelOrder` | Submitted/accepted under policy | `canceled` | `order.cancel` | Reason; financial/refund consequence evaluated |
| `voidOrder` | Manager-defined exceptional case | `voided` | `order.cancel` + approval | Reason, approver, no deletion of financial evidence |
| `requestRemake` | Preparing/ready/served under policy | `remake_required` until new generation resolves | `kitchen.remake` | Reason; new ticket generation; old history immutable |

## Kitchen transitions

Each accepted order creates one ticket per required station and ticket items only for that station. Ticket and item statuses are versioned independently.

```text
ticket_status: queued | preparing | ready | canceled
item_status: queued | preparing | ready | served | canceled
ticket_exception: none | problem | remake_required
```

| Command | From | To | Permission | Preconditions | Event |
|---|---|---|---|---|---|
| `startKitchenTicket` | `queued` | `preparing` | `kitchen.start` | Correct branch/station assignment; expected version | `foodflow.kitchen.ticket_started.v1` |
| `startKitchenItem` | `queued` | `preparing` | `kitchen.start` | Parent ticket active | `foodflow.kitchen.item_started.v1` |
| `markKitchenItemReady` | `preparing` | `ready` | `kitchen.ready` | Expected item version | `foodflow.kitchen.item_ready.v1` |
| Ticket aggregation | `preparing` | `ready` | Derived | All required ticket items ready/canceled under policy | `foodflow.kitchen.ticket_ready.v1` |
| `reportKitchenProblem` | Active | Same main status + `problem` | `kitchen.problem` | Reason and affected items | `foodflow.kitchen.problem_reported.v1` |
| `requestRemake` | Ready/served item | New generation `queued` | `kitchen.remake` | Reason, source generation, authorization | `foodflow.kitchen.remake_requested.v1` |

Concurrent start/ready calls use expected versions. A successful retry returns the existing event/result and does not increment remake count or create another generation.

## Bill and payment transitions

### Bill lifecycle

```text
bill_status: open | locked | settled | canceled
```

| Command | From | To | Permission | Preconditions | Event |
|---|---|---|---|---|---|
| `requestBill` | Table session `active` | Bill `locked`; session `bill_requested` | Guest capability or `bill.lock` | At least one billable order; no unresolved change; server calculation succeeds | `foodflow.bill.locked.v1` |
| `cancelBill` | `locked` | `canceled` | `bill.lock` + manager policy | No succeeded allocation; reason | `foodflow.bill.canceled.v1` |
| Payment allocation aggregation | `locked` | `settled` | Derived | Outstanding minor amount is zero | `foodflow.bill.settled.v1` |

A locked bill version is immutable and snapshots item/modifier names, tax/service/discount rules, calculation version, `amount_minor`, and currency. A correction creates a new bill version and auditable relationship; it does not edit the locked version.

### Payment and attempt lifecycle

```text
payment_status: created | requires_action | pending | succeeded | partially_refunded | refunded | failed | expired | canceled | disputed
attempt_status: created | action_required | pending | succeeded | failed | expired | canceled
refund_status: requested | pending | succeeded | failed | canceled
```

| Trigger | From | To | Authority/preconditions | Event |
|---|---|---|---|---|
| `createMerchantPayment` | None | Payment/attempt `created` | `payment.create`; locked bill; active capability; server amount; stable key | `payments.payment.created.v1` |
| Provider adapter response | `created` | `requires_action` or `pending` | Valid server response; no claim of success | `payments.payment.action_required.v1` or `.pending.v1` |
| Verified webhook + retrieve | Pending state | `succeeded` | Persisted unique event; verified provider evidence; merchant/account/amount/currency/mode/reference match | `payments.payment.succeeded.v1` |
| Verified failure/expiry | Non-final pending state | `failed`/`expired`/`canceled` | Provider evidence and legal transition | Matching terminal event |
| `requestRefund` | `succeeded`/`partially_refunded` | Refund `requested` | `payment.refund`; step-up target; reason; amount within refundable balance | `payments.refund.requested.v1` |
| Verified refund | Refund pending | Refund `succeeded`; payment partial/refunded projection | Provider evidence; allocation updated atomically | `payments.refund.succeeded.v1` |
| Verified dispute | `succeeded` or refunded projection | `disputed` projection/case | Provider evidence | `payments.payment.disputed.v1` |

Redirect/return parameters never move a payment to `succeeded`. Duplicate and out-of-order events are persisted/deduplicated and either produce the same result or a recorded no-op.

## Table-session transitions

```text
table_session_status: active | bill_requested | payment_pending | closed
```

| Transition | Preconditions |
|---|---|
| None -> `active` | Database partial unique index permits only one active-like session per table |
| `active` -> `bill_requested` | Bill version successfully locked |
| `bill_requested` -> `payment_pending` | At least one non-final payment attempt exists |
| Active-like -> `closed` | Outstanding is zero; required fulfillment complete; no unresolved critical exception |
| `closed` -> `active` | Manager override/reopen policy, reason, expected version, audit; no newer table session |

An authorized early-close override is a separate command requiring `table.override_close`, reason, approver, and audit. It does not manufacture payment or fulfillment success.

## Current implementation gap

The current demo uses one mixed order status, one ticket per order, client-side mutation, floating-point totals, fallback actors, and immediate table closure after a locally recorded payment. Those behaviors are UI references only and do not satisfy this contract.

