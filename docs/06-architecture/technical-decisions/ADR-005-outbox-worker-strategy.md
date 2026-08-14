---
title: "ADR-005: Transactional Outbox and Pilot Worker Strategy"
document_id: FLOW-ADR-005
status: proposed
owner: Architecture and Operations
last_reviewed: 2026-08-14
---

# ADR-005: Transactional Outbox and Pilot Worker Strategy

## Status

Proposed. No outbox table, worker, scheduled deployment, monitoring, or replay runbook exists. The current OpenAI Sites/vinext deployment is not evidence that the target Vercel worker path is available.

## Context

FoodFlow must commit domain state, audit, and an intent for notification/provider/reporting work atomically without holding a database transaction open across network calls. Webhooks, payment dispatch/retrieval, notification, and projections require durable retry, deduplication, operator visibility, and replay.

Exactly-once external delivery cannot be promised. The design must provide at-least-once processing with idempotent handlers and stable provider/business keys.

## Decision

Use a **Postgres transactional outbox** in `app.outbox_events`. Use a **Next.js Node-runtime worker endpoint scheduled by Vercel Cron** as the initial pilot runner after Vercel deployment is approved.

A best-effort post-commit wake-up may request immediate processing for user-facing latency, but correctness never depends on that wake-up. The scheduled runner repairs missed wake-ups and stale leases. If deployment remains on a target without authenticated scheduled execution, the pilot is not worker-ready until an equivalent durable runner is approved through an ADR amendment.

## Write contract

- Domain state, transition/domain event, audit event, and outbox row are inserted in one transaction.
- Each outbox row has immutable event ID, event type/version, aggregate ID/version, organization/branch, operation/dedup key, redacted payload, occurred/available timestamps, and creation correlation ID.
- Mutable delivery fields are state, attempt count, lease owner/expiry, last attempted/completed time, and safe error class.
- Unique constraints prevent duplicate event/consumer work for the same operation.
- Payloads contain the minimum identifiers/snapshots needed by the handler; never secrets, full sensitive webhook bodies, reusable auth/guest tokens, PAN, or CVV.

## Claim and processing contract

1. The authenticated worker opens a short database transaction and claims a bounded available batch using `FOR UPDATE SKIP LOCKED`, incrementing attempts and assigning a lease.
2. It commits the claim before calling external systems.
3. The handler uses a stable downstream idempotency/dedup key and performs bounded-time work outside the claim transaction.
4. A short result transaction marks completion or schedules retry with exponential backoff and jitter.
5. Expired leases are reclaimable. A completed event is never reclaimed.
6. Exhausted/permanent failures enter a dead-letter state and alert the named operator. Replay requires permission, reason, new replay record, and audit; historical attempts are not erased.
7. Event consumers reject unknown major versions and record a safe permanent failure rather than guessing payload meaning.

## Payment-specific orchestration

- Payment creation first commits the internal payment/attempt and durable dispatch intent.
- The application may invoke Omise immediately after commit to obtain a user action quickly, then persists the normalized response in a second transaction.
- If the request crashes or times out, the outbox worker retrieves/retries using the stable operation/provider reference; it does not create a fresh business payment blindly.
- Webhook ingress verifies and durably stores a unique provider event before acknowledgement. Processing/retrieval then uses the same outbox/lease semantics.
- Provider success updates payment, allocation, bill/session projection, audit, and follow-up outbox atomically only after amount/currency/account/mode/reference validation.

## Scheduling, security and operations

- The worker endpoint accepts only the approved scheduler/internal authentication, is not linked from UI, and uses a server-only secret with rotation ownership.
- Batch size, lease duration, retry budget, backoff, and schedule are environment configuration validated under load; they are not arbitrary UI settings.
- Metrics include oldest available age, available/leased/dead counts, attempts, handler latency/outcome, stale leases, and payment reconciliation mismatches.
- Logs contain event/correlation identifiers and safe error classes, not secret or full payload content.
- Deployment includes alert thresholds, dead-letter/replay and provider-outage runbooks, and an owner/on-call path.

## Alternatives considered

| Alternative | Reason not selected for the pilot |
|---|---|
| Execute side effects only in request callbacks | Loses work when the request/runtime terminates and cannot support durable retry |
| Database trigger calls external HTTP directly | Couples transaction latency/availability to the network and complicates recovery |
| Supabase Cron/`pg_net` as primary worker | Viable future runner, but moves application/provider logic into a second runtime and requires separate secret/observability ownership |
| Third-party durable queue/workflow platform | Strong capability but adds provider/cost/operations before pilot load proves the need |
| Poll outbox from the browser | Untrusted, unavailable when no browser is open, and violates server authority |

## Validation before acceptance

- State/audit/outbox atomic rollback and commit tests pass.
- Two concurrent workers never process one lease concurrently.
- Crash before/after downstream side effect, stale lease, duplicate schedule invocation, timeout, and retry exhaustion tests pass.
- Idempotent notification/payment/refund handlers produce one business effect under replay.
- Authenticated schedule, secret rotation, monitoring alert, dead-letter replay, and provider-outage runbook are exercised in preview/pilot.
- Reconciliation detects deliberately lost, duplicated, stale, and mismatched payment work.

## Related documents

- [Application Architecture](../application-architecture.md)
- [Payment Architecture](../payment-architecture.md)
- [Data Model](../data-model.md)
- [API, Command, Query and Event Catalog](../../05-product-specifications/foodflow/api-event-catalog.md)

