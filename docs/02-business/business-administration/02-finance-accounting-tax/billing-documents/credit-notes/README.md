# Credit Notes

Controls reductions or corrections to previously issued financial/tax documents when a valid adjustment event occurs.

## Required fields
Credit-note ID/date, original invoice/tax-invoice reference, customer, reason/code, affected lines/amount/tax, approval, contractual/refund reference, accounting posting, and delivery status.

## Workflow
```text
Adjustment event → eligibility/reason checked → original document matched → amount/tax calculated → approval → credit note issued → AR/refund/accounting/tax updated → customer notified → registers reconciled
```

Never delete or alter the original issued document to make the numbers match; preserve original + credit note + resulting balance.