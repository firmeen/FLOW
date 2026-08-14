---
title: FoodFlow Pilot UI Action and Feedback Specification
document_id: FOODFLOW-SPEC-UI-FEEDBACK
status: proposed
owner: Product Design and Engineering
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot UI Action and Feedback Specification

UI feedback reflects acknowledged server state. A toast, redirect, provider return page, or optimistic client mutation is never proof of a financial or workflow transition.

## Shared interaction contract

1. Validate obvious input locally, then send the server command once with a stable operation ID.
2. Disable the triggering control while the request is pending and prevent accidental duplicate submission.
3. Preserve the same operation ID for safe retry until the user intentionally changes the command payload.
4. Render success only from the command result or a later server projection/event.
5. On `VERSION_CONFLICT`, preserve safe input, refresh the aggregate, and require the user to review material changes.
6. On authorization/tenant denial, show a generic action-not-allowed message and correlation ID without revealing record existence.
7. Never display raw SQL, stack traces, provider payloads, secrets, tokens, or other-tenant identifiers.

## Action matrix

| Action | Pending state | Confirmed success | Recoverable failure | Non-recoverable/safety behavior |
|---|---|---|---|---|
| Internal sign in | “Signing in…”; fields disabled | Redirect to first permitted route | Generic invalid credentials; preserve email | Rate-limit/recovery guidance; no account enumeration |
| Customer QR entry | Neutral loading/skeleton | Table landing from guest DTO | Retry network exchange | Generic unavailable for invalid/expired/revoked token |
| Request quote | Recalculate indicator; checkout disabled | Show server totals, version, expiry | Highlight invalid/sold-out line and requote | Do not allow submission with expired/untrusted total |
| Submit order | “Sending order…”; cart locked | Existing/new order number from idempotent result | Retry with same operation ID | Changed fingerprint requires explicit new submission |
| Call staff | Control disabled while pending | Durable request reference and status | Retry safely | Deduplicated active request; no repeated alert storm |
| Request bill | “Locking bill…” | Locked bill version and outstanding amount | Show unresolved order/session issue | Disable further ordering only after server confirms lock |
| Accept order | Button disabled; row remains visible | Accepted version and routed ticket summary | Refresh on version conflict | Missing station mapping keeps order actionable with exception |
| Reject/change order | Reason required; submit disabled until valid | Server transition/event reference | Preserve edits on validation/conflict | Never silently discard or overwrite concurrent change |
| Start/ready kitchen ticket | Per-ticket/item pending indicator | Updated ticket/item version | Refresh/retry idempotently | Wrong station/branch shown as generic forbidden |
| Report problem/remake | Reason required | New exception/remake generation | Preserve reason; retry safely | Old ticket history remains visible/read-only |
| Mark served | Pending on selected order | Served timestamp/version | Refresh on not-ready conflict | Cannot force readiness from UI |
| Create payment | “Creating payment…” | Show provider action/QR/redirect or pending status | Retry stable attempt when allowed | Never show paid from create response alone |
| Payment return | “Confirming payment…” | Paid only after verified server projection | Poll/retry status query | Timeout remains pending; no client success override |
| Refund | Step-up/reason/amount confirmation | Refund requested/pending reference | Safe retry with same key | Success only after verified provider evidence |
| Publish menu/config | Impact preview then pending | New immutable version/effective time | Return validation/dependency details | No partial publish; current version stays active |
| Reset demo | Development-only confirmation | Fresh browser fixture | Local error | Control absent in production |

## Financial presentation

- Show `Unpaid`, `Payment pending`, `Partially paid`, `Paid`, `Partially refunded`, `Refunded`, and `Disputed` distinctly.
- PromptPay QR expiry does not imply payment failure until provider/server state confirms it.
- A redirect success parameter is presented as “Confirming payment”, never “Paid”.
- Amounts come from the locked bill/payment projection and include currency; the client does not recompute financial truth.
- Void, cancel, and refund labels map to the actual attempt/payment/refund state and are not interchangeable.

## Error mapping

| Stable code | User feedback | UI action |
|---|---|---|
| `VALIDATION_FAILED` | Explain correctable fields without internal detail | Focus first invalid field |
| `UNAUTHENTICATED` | Session expired | Redirect to safe login return path |
| `PERMISSION_DENIED` / `NOT_FOUND_OR_FORBIDDEN` | Action unavailable | Close sensitive detail; retain correlation ID |
| `ENTITLEMENT_DISABLED` | Feature unavailable for this branch | Link to owner guidance only when permitted |
| `VERSION_CONFLICT` | Record changed elsewhere | Refresh and compare; do not auto-overwrite |
| `IDEMPOTENCY_CONFLICT` | Request changed after submission | Stop retry; generate new operation only after review |
| `AVAILABILITY_CHANGED` | Item became unavailable | Requote cart |
| `ROUTING_INCOMPLETE` | Kitchen routing needs manager attention | Keep order pending; show operational exception |
| `PAYMENT_STILL_PENDING` | Provider confirmation not complete | Continue status polling with bounded backoff |
| `PROVIDER_UNAVAILABLE` | Payment service temporarily unavailable | Keep bill/payment pending; offer safe retry |
| `INTERNAL_ERROR` | Generic failure + correlation ID | Do not expose stack/provider/SQL details |

## Accessibility

Pending and result messages use accessible live regions; focus moves to the first actionable error or confirmation heading. Controls expose disabled state semantically, dialogs trap/restore focus, destructive operations require an explicit label and reason, and status is never communicated by color alone.

