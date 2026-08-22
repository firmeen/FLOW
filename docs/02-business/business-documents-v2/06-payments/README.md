# 06 — Payments

This group documents payment-provider relationships, merchant/payment operating boundaries, reconciliation, refunds, chargebacks, failures, settlement exceptions, and evidence required to prove that a payment status in FLOW corresponds to the external financial reality.

## Substructure

```text
06-payments/
├── payment-providers/
│   ├── provider-agreements/
│   ├── kyc-onboarding/
│   ├── fees-settlement/
│   └── provider-contacts/
├── payment-operations/
│   ├── payment-reconciliation/
│   ├── refunds/
│   ├── chargebacks/
│   ├── failed-payments/
│   └── settlement-exceptions/
└── merchant-controls/
    ├── payment-responsibility/
    ├── merchant-onboarding/
    └── payment-evidence/
```

# A. Payment responsibility model

Before enabling a payment method, document exactly who performs each role:

```text
Customer
Merchant
FLOW
Payment gateway / acquirer / bank
```

Questions to answer:

- who is merchant of record?
- whose bank account receives settlement?
- who controls refunds?
- who handles chargebacks?
- who performs KYC?
- who stores payment credentials?
- what payment data does FLOW receive?
- does FLOW merely relay status, or does it receive/hold/route funds?
- who issues customer receipt/tax documents?
- who bears gateway fees?
- who reconciles provider statements?

If FLOW's role changes from technical integration to receiving, pooling, facilitating, or forwarding funds, perform a specific regulatory review before launch.

# B. Provider onboarding file

Maintain for each provider:

- legal agreement;
- merchant/platform terms;
- KYC documents and approval;
- approved merchant/entity name;
- settlement bank account;
- fee schedule;
- reserve/holdback terms if any;
- settlement cycle;
- supported methods/currencies;
- refund/void rules;
- chargeback rules;
- security/PCI allocation where applicable;
- API/webhook credentials ownership and secure-storage reference;
- support/escalation contacts;
- termination/export process.

# C. Payment event evidence

Internal payment records should distinguish:

```text
Payment Intent
Payment Attempt
Authorization / Pending state
Capture / Successful payment
Failure
Void
Refund
Chargeback / Dispute
Settlement
```

Do not collapse all of these into one mutable `paid` flag.

Recommended evidence fields:

- internal payment ID;
- order/invoice reference;
- provider transaction ID;
- amount/currency;
- method;
- created/confirmed timestamps;
- provider status;
- internal status;
- webhook/event IDs;
- settlement reference;
- refund references;
- reconciliation status.

# D. Webhook controls

Payment webhook operations should document:

- signature verification;
- replay protection;
- idempotency;
- event ordering/out-of-order handling;
- retry behavior;
- dead-letter/error queue;
- manual replay authority;
- log retention.

A webhook should not create duplicate payment success entries when retried.

# E. Payment reconciliation

Daily or periodic reconciliation should compare three independent views:

```text
FLOW payment ledger
↕
Provider transaction/settlement report
↕
Bank settlement
```

Reconciliation should identify:

- missing provider transaction;
- duplicate internal transaction;
- pending transaction never resolved;
- payment marked paid but no settlement;
- settlement net of fees;
- refund deducted from later settlement;
- chargeback;
- withholding/other deductions where relevant;
- currency/rounding difference.

## Reconciliation exception record

```text
Exception ID
Date
Internal transaction
Provider transaction
Expected amount
Actual amount
Difference
Reason
Owner
Action
Accounting impact
Resolved date
Reviewer
```

# F. Refund flow

```text
customer/merchant refund request
→ order/payment eligibility checked
→ refund amount verified against captured amount
→ business approval
→ provider refund submitted
→ provider result/reference captured
→ internal payment ledger updated
→ customer notified
→ accounting/tax adjustment triggered
→ provider settlement reconciled
→ case closed
```

Never create a refund record before confirming which payment is being refunded and the maximum refundable balance.

# G. Void vs Refund

Document terminology clearly:

- **Void** generally refers to cancelling a payment before final settlement/capture under provider-specific rules.
- **Refund** returns money after a successful captured/settled payment.
- **Order cancellation** is a business event and does not automatically mean payment reversal occurred.

These statuses must be connected but not treated as identical.

# H. Chargeback / Dispute

Maintain a dispute pack:

- provider notice;
- dispute reason/code;
- amount;
- response deadline;
- customer/order/payment evidence;
- terms accepted;
- proof of service/delivery where relevant;
- communications;
- response submitted;
- provider decision;
- fee/loss;
- accounting treatment;
- fraud/risk follow-up.

# I. Failed and Pending Payments

Define user and staff behavior for:

- insufficient funds;
- abandoned payment;
- expired QR/session;
- network timeout;
- provider timeout;
- webhook delay;
- provider says paid but UI timed out;
- duplicate customer retry.

Do not instruct users to “just pay again” until the previous payment status is safely resolved or idempotently handled.

# J. Merchant controls

For merchant-facing FLOW products maintain merchant payment configuration evidence:

- merchant legal/business name;
- branch;
- payment provider/account reference;
- payout account ownership verification;
- enabled methods;
- fee configuration;
- refund authority;
- cashier/manager permissions;
- environment status (test/live);
- activation approval.

# K. Settlement and accounting connection

A provider may settle net amounts:

```text
Customer pays 1,000
Provider fee 30
Bank receives 970
```

Accounting must not assume bank receipt of 970 means revenue was 970. The accounting design should separately recognize gross sale, applicable tax, provider fee, refund/chargeback, and settlement according to accountant-approved treatment.

# L. Provider contacts and escalation

Maintain current contact matrix:

```text
Commercial/account manager
Technical support
Critical incident hotline
Fraud/chargeback team
Finance/settlement team
KYC/compliance team
```

Include escalation case IDs in incident/reconciliation records.

# M. Common failure modes

- internal status says paid but provider/bank evidence does not;
- provider webhook processed twice;
- refund exceeds remaining refundable balance;
- payment gateway fee recorded by reducing revenue instead of separately per accounting policy;
- merchant payout bank account changed without controlled verification;
- test credential accidentally used in production or vice versa;
- chargeback deadline missed;
- order cancelled but payment refund never initiated;
- refund executed but accounting/tax documents remain unchanged;
- provider contract/KYC remains under founder personally after company migration.
