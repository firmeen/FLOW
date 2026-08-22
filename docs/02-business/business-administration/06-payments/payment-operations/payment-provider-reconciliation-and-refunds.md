# Payment Providers, Merchant Flows, Reconciliation and Refunds

## Purpose
This document family defines how FLOW connects to payment providers without confusing technical transaction status with accounting evidence or regulated payment responsibility.

## Provider contract pack
For every provider maintain:
- signed merchant/platform agreement;
- KYC approval;
- fee schedule;
- settlement timing;
- refund/chargeback rules;
- prohibited activities;
- security/PCI responsibility allocation where relevant;
- API/webhook operational documentation;
- production merchant IDs/account references;
- linked bank account;
- support/escalation contacts;
- renewal/termination terms.

## Responsibility matrix
For each payment path document who is responsible for:
- collecting payer data;
- creating payment intent;
- authenticating payer;
- storing sensitive payment data;
- confirming payment;
- settlement;
- merchant payout;
- refund;
- chargeback;
- fraud review;
- customer support;
- tax invoice/receipt.

Do not let UX wording imply FLOW holds or guarantees funds if the licensed provider actually performs those functions.

## Transaction evidence chain

```text
Order/bill created
→ payment attempt created
→ provider transaction/reference generated
→ payer completes/fails/pends
→ provider webhook/API confirmation
→ FLOW payment ledger updates idempotently
→ provider settlement report
→ provider fee/refund/chargeback adjustments
→ net bank settlement
→ reconciliation
→ accounting/tax document linkage
```

A screenshot or application status alone is not reconciliation.

## Webhook evidence
Operational logs should capture enough to investigate:
- provider event ID;
- payment reference;
- event type;
- received timestamp;
- signature verification result;
- processing outcome;
- retry/duplicate detection;
- linked order/payment record.

Do not store unnecessary secrets or full sensitive payloads merely for debugging.

## Refund flow

```text
Refund request/correction event
→ verify original captured payment
→ check refund policy/authority
→ calculate maximum refundable balance
→ manager/finance approval if threshold requires
→ provider refund API/action
→ provider result/reference
→ FLOW ledger adjustment
→ customer notification
→ credit/tax document treatment
→ provider settlement reconciliation
→ accounting closure
```

## Chargeback/dispute file
Retain:
- provider dispute notice;
- transaction ID;
- order/contract/service evidence;
- customer communications;
- proof of service/delivery where available;
- response/evidence submitted;
- provider decision;
- fees/loss;
- accounting adjustment;
- risk-control follow-up.

## Manual transfer verification
If FLOW supports bank-transfer proof:
- customer payment reference/evidence;
- verifier;
- verification timestamp;
- bank transaction matched;
- duplicate-proof checks;
- approval/rejection reason;
- linked order/invoice.

An uploaded slip should not be treated as final proof without verification appropriate to the process.

## Regulatory boundary review
If FLOW changes from software integration to receiving, pooling, holding, routing, settling, or paying out merchant funds itself, stop and obtain legal/regulatory review before launch. The documentation and licensing implications can materially change.

## Common failures
- marking `paid` before provider confirmation;
- accepting duplicate webhook events twice;
- booking net settlement as gross revenue;
- refunding more than captured amount;
- no mapping from provider reference to invoice/order;
- merchant account held under wrong legal entity;
- payment architecture changes but contracts/regulatory review do not.
