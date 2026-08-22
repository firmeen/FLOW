# Tax Certificates

Controls certificates issued by FLOW and certificates received from counterparties, especially WHT-related evidence.

## Registers
Maintain separate issued and received registers with counterparty, tax period, invoice/transaction, gross/tax amount, certificate number/date, status, method delivered/received, storage link, correction/replacement reference, and accounting/tax linkage.

## Workflow
```text
Certificate obligation/event → underlying transaction matched → data validated → certificate issued/received → register updated → counterparty/accounting/tax period matched → missing/incorrect certificate exception tracked → archive
```

A missing customer WHT certificate should remain visible until resolved; do not erase the receivable difference by treating it as a discount.