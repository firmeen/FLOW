# Refunds

Controls return of funds after a successful payment and links customer/order eligibility to provider action, accounting/tax adjustment, and settlement reconciliation.

## Workflow
```text
Refund request/event → customer/order/payment identified → contractual/policy eligibility → captured/refundable balance verified → amount/reason → approval authority → provider refund → provider reference/status → internal ledger → customer notice → credit/tax/accounting action → settlement/bank reconciliation → close
```

## Required fields
Refund ID, original payment/provider reference, order/invoice, amount/currency, reason, requester, approver, provider request/result/timestamps, remaining refundable amount, credit/tax-document reference, accounting entry, customer communication, and reconciliation status.

## Control rule
Prevent refunds above the remaining refundable balance and prevent duplicate provider submissions through idempotency/status checks.