---
title: FoodFlow Pilot API, Command, Query and Event Catalog
document_id: FOODFLOW-SPEC-API-EVENTS
status: proposed
owner: Application Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot API, Command, Query and Event Catalog

All entries are target contracts unless source code and passing tests are referenced explicitly. The current application has only temporary login/logout route handlers.

## Common API contract

- JSON input is parsed with an explicit schema that rejects unknown unsafe fields.
- Internal actor, organization, branch, membership, and permissions come from the trusted session/resolver, never request body authority.
- Guest organization/branch/table scope comes from the guest capability, never route IDs alone.
- Successful responses include `data` and `meta.correlationId`; versioned aggregates include `version`.
- Errors include a stable `code`, safe `message`, optional field issues, and correlation ID.
- Commands use a stable `operationId`; if an `Idempotency-Key` header is also exposed, it must equal `operationId`.
- Updates require `expectedVersion`. Stale writes return HTTP 409/`VERSION_CONFLICT`.
- Queries are bounded, deterministically ordered, and cursor-paginated where lists may grow.
- Cross-tenant absent and unauthorized resources share `NOT_FOUND_OR_FORBIDDEN` externally.

## Customer queries and commands

| Method/path | Contract | Authorization | Idempotency/version | Result |
|---|---|---|---|---|
| `POST /api/customer/qr/exchange` | Exchange raw QR token | Public rate limit + valid QR | Token replay follows guest-rotation policy | Guest cookie + public table landing DTO |
| `GET /api/customer/storefront` | Published public menu/branch state | Active guest/public entry context | Cache/version metadata | Public storefront DTO only |
| `GET /api/customer/session` | Guest table-session/orders | Active guest bound to session | Projection version | Guest-owned session DTO |
| `POST /api/customer/quotes` | Validate cart and calculate total | Active guest | `operationId`; quote fingerprint | Quote/version/expiry/minor-unit totals |
| `POST /api/customer/orders` | `submitCustomerOrder` | Active guest/table session | Required stable key + quote version | Existing/new order reference and projection |
| `POST /api/customer/service-requests` | Call staff | Active guest | Stable key/dedup policy | Durable request reference/status |
| `POST /api/customer/bill-requests` | Lock bill/request bill | Active guest | Stable key + session version | Locked bill/session projection |

## Internal operational queries

| Method/path | Query | Required permission/scope | Result |
|---|---|---|---|
| `GET /api/operations/orders` | Branch order queue/filter | `order.view` + branch | Order queue DTOs, versions, allowed actions |
| `GET /api/operations/tables` | Branch table/session board | Active branch membership | Table/session projections |
| `GET /api/operations/service-requests` | Open service queue | `service.view` | Scoped durable requests |
| `GET /api/operations/kitchen/tickets` | Station KDS | `kitchen.view` + station assignment | Ticket/item DTOs and versions |
| `GET /api/operations/bills` | Bill/outstanding queue | `bill.view` | Bill/payment projections |
| `GET /api/management/overview` | Daily projection | `report.view` | Defined metrics, filters, freshness timestamp |
| `GET /api/management/audit-events` | Audit search | `audit.view` | Minimized scoped audit DTOs |
| `GET /api/management/configuration` | Draft/published config | `configuration.manage` | Versioned configuration DTO |

## Internal commands

| Method/path | Domain command | Permission | Required concurrency/idempotency |
|---|---|---|---|
| `POST /api/operations/orders/[id]/accept` | `acceptOrder` | `order.accept` | operation ID + expected order version |
| `POST /api/operations/orders/[id]/reject` | `rejectOrder` | `order.reject` | operation ID + expected version + reason |
| `POST /api/operations/orders/[id]/change` | `changeOrder` | `order.change` | operation ID + expected version + reason + re-quote |
| `POST /api/operations/orders/[id]/serve` | `serveOrder` | `order.serve` | operation ID + expected version |
| `POST /api/operations/kitchen/tickets/[id]/start` | `startKitchenTicket` | `kitchen.start` | operation ID + expected ticket version |
| `POST /api/operations/kitchen/items/[id]/ready` | `markKitchenItemReady` | `kitchen.ready` | operation ID + expected item version |
| `POST /api/operations/kitchen/tickets/[id]/problem` | `reportKitchenProblem` | `kitchen.problem` | operation ID + expected version + reason |
| `POST /api/operations/kitchen/items/[id]/remake` | `requestRemake` | `kitchen.remake` | operation ID + source generation/version + reason |
| `POST /api/operations/bills/[id]/payments` | `createMerchantPayment` | `payment.create` | stable operation ID + locked bill version |
| `POST /api/operations/payments/[id]/refunds` | `requestRefund` | `payment.refund` | stable operation ID + expected payment version + reason |
| `POST /api/operations/table-sessions/[id]/close` | `closeTableSession` | `table.close` | operation ID + expected session version |
| `POST /api/management/configuration/publish` | `publishConfiguration` | `configuration.publish` | operation ID + expected draft/base version |

## Webhook ingress

`POST /api/webhooks/omise/merchant-payments` reads the raw body as required by the installed provider contract, verifies the supported authenticity mechanism, persists a unique redacted event before acknowledging, and queues processing. It does not trust browser cookies, accept tenant authority from payload metadata, or declare a payment successful without server-side retrieval and merchant/amount/currency/mode/reference validation.

The deduplication key is provider + `MERCHANT_PAYMENT` purpose + provider event ID. A duplicate returns the same durable acknowledgement after confirming the original event exists.

## Domain event catalog

| Event | Producer | Primary consumers | Dedup/ordering key |
|---|---|---|---|
| `foodflow.order.submitted.v1` | Submit order transaction | Staff queue, notification, reporting | Order ID + aggregate version |
| `foodflow.order.accepted.v1` | Acceptance transaction | Kitchen routing projection, guest status | Order ID + version |
| `foodflow.order.rejected.v1` | Rejection transaction | Guest status/notification | Order ID + version |
| `foodflow.order.preparing.v1` | Ticket aggregation | Guest/staff projection | Order ID + version |
| `foodflow.order.ready.v1` | Required-ticket aggregation | Ready queue/notification | Order ID + version |
| `foodflow.order.served.v1` | Serve command | Table/session/reporting | Order ID + version |
| `foodflow.kitchen.tickets_created.v1` | Acceptance transaction | KDS projection | Order ID + routing generation |
| `foodflow.kitchen.ticket_started.v1` | Kitchen command | Staff/guest projection | Ticket ID + version |
| `foodflow.kitchen.ticket_ready.v1` | Ticket aggregation | Order readiness | Ticket ID + version |
| `foodflow.kitchen.problem_reported.v1` | Kitchen command | Exception queue/notification | Ticket ID + version |
| `foodflow.kitchen.remake_requested.v1` | Remake command | KDS/audit/reporting | Source item + generation |
| `foodflow.bill.locked.v1` | Bill transaction | Cashier/guest projection | Bill ID + immutable version |
| `payments.payment.created.v1` | Payment command | Provider dispatch worker | Payment ID + attempt number |
| `payments.payment.pending.v1` | Provider adapter/processor | Payment projection | Payment ID + version |
| `payments.payment.succeeded.v1` | Verified webhook processor | Allocation, bill/session, reporting | Provider event + payment version |
| `payments.refund.requested.v1` | Refund command | Provider dispatch worker | Refund ID + operation ID |
| `payments.refund.succeeded.v1` | Verified provider processor | Allocation/reporting/notification | Provider event + refund version |
| `foodflow.table_session.closed.v1` | Close command/aggregation | Table board/reporting | Session ID + version |

## Audit and outbox contract

The state change, transition/domain event, audit event, and outbox row are committed in one database transaction. Audit rows are append-only and contain trusted actor, organization, branch, action, target, minimized before/after, reason, request/correlation IDs, and timestamp.

Outbox processing is at-least-once:

- rows have event ID/type/version, aggregate ID/version, tenant/branch, dedup key, redacted payload, occurrence/availability time, attempts, lease, completion, and last safe error class;
- workers claim bounded batches using a lease/row-lock strategy, commit the claim, perform external work outside the domain transaction, then record outcome;
- handlers are idempotent and consumers reject unsupported event versions;
- retries use bounded exponential backoff; exhausted rows enter a restricted dead-letter/replay path with reason and audit;
- no secret, raw card data, full unredacted webhook, or reusable guest/auth token enters event payloads.

## Current gap

No customer/operations/management/webhook API catalog above is implemented. Browser repository calls must not be relabeled as server commands, and client audit entries are not durable domain events.

