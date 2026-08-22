# Merchant Payment Evidence

Defines the evidence FLOW should preserve or reference to prove payment state without storing unnecessary sensitive payment data.

## Recommended fields
Internal payment ID, merchant/business/branch, order/invoice, provider, provider transaction/event ID, amount/currency, method category, timestamps, internal/provider statuses, idempotency key/reference, webhook event/signature-verification result, refund/dispute references, settlement reference, and reconciliation status.

## Privacy/security rule
Store only data needed for operation, audit, support, reconciliation, fraud, and contractual/legal requirements. Do not store raw payment credentials or sensitive card/account data unless specifically required and covered by an approved compliant architecture.

## Integrity
High-risk manual verification/status override actions must record actor, reason, evidence reference, prior/new status, approval if needed, and timestamp.