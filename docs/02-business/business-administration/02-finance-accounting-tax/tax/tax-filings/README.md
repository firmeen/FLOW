# Tax Filings

Controls preparation, review, submission, payment/refund, reconciliation, and archive for each tax filing.

## Required states
```text
PREPARED → REVIEWED → FILED → PAID/SETTLED → RECONCILED → COMPLETE
```
`BLOCKED`, `AMENDED`, or `UNDER REVIEW` should be explicit where applicable.

## Filing record
Tax type, period, preparer, reviewer, due date, filed date/reference, amount payable/refundable, payment date/reference, supporting reconciliation, adjustments/issues, amendment reference, secure storage link, and next action.

## Completion gate
A return is not complete merely because it was submitted. Payment/refund status and accounting control accounts must reconcile and completion evidence must be retained.