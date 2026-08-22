# Invoices

Controls customer billing claims from contractual/billable trigger through AR and payment.

## Required fields
Unique invoice number, issue date, seller legal details, buyer/billing details, contract/order/PO reference, service/billing period, line descriptions, quantity/rate, taxable value/tax, total, due date, payment instructions, currency, and status.

## Workflow
```text
Billable trigger confirmed → customer/master data validated → invoice calculated → tax review/template rules → approval/issue → delivery evidence → AR opened → collection/payment → receipt/tax action → reconciliation → close
```

## Controls
Prevent duplicates, preserve original issued PDF/snapshot, use credit/debit/void workflow for corrections, and separate net bank settlement from gross invoiced revenue.