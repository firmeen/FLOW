# Accounts Payable

Controls vendor obligations from approved commitment through invoice validation, receiving, tax review, payment, and reconciliation.

## Minimum packet
Vendor master, contract/PO/SOW, invoice, service period, receiving/acceptance evidence, tax-invoice quality where relevant, WHT classification, due date, budget/approval, payment result, and accounting reference.

## Lifecycle
```text
Approved commitment → delivery/acceptance → invoice received → duplicate/terms/tax checks → AP recorded → due-date scheduling → payment authorization → bank payment → WHT/certificate/filing action → reconciliation → close
```

## Failure modes
Paying before acceptance, paying duplicate invoice, wrong vendor bank details, expired contract auto-renewal, WHT missed, invoice posted to wrong period, or AP cleared before bank evidence exists.