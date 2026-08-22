# Accounts Receivable

Controls customer balances from billable event through collection, withholding differences, credits, disputes, write-off, and final clearance.

## Minimum fields
Customer, contract/order, invoice, issue/due dates, gross/tax amount, credit/debit adjustments, payments, WHT deducted/received, provider fees where relevant, outstanding balance, aging, collection owner, dispute status, and reconciliation reference.

## Lifecycle
```text
Billable event → invoice → AR opened → due monitoring → reminder/collection → payment → short-payment/WHT/fee analysis → receipt/tax action → AR cleared → bank/provider reconciliation
```

## Exception controls
Partial payment, disputed invoice, missing WHT certificate, wrong legal entity, duplicate invoice, overpayment, refund/credit, and write-off require explicit status and approval; do not force-clear differences as discounts.