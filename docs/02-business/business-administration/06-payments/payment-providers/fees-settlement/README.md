# Payment Fees & Settlement

Controls the commercial and accounting configuration for provider fees, payout cycles, reserves, deductions, refunds, chargebacks, and settlement reporting.

## Required schedule
Transaction fee by method, fixed/percentage components, tax on fees where relevant, currency/FX terms, settlement cycle/cut-off, reserve/holdback, minimum payout, refund fee, chargeback fee, payout bank account, statement/report source, and effective date/version.

## Reconciliation concept
```text
Gross customer payment
- refund/chargeback where applicable
- provider fee/other deductions
± timing/reserve adjustments
= provider settlement
→ bank receipt
```

Accounting must not equate net bank settlement to gross revenue. Store the approved fee schedule and use it to explain settlement differences.