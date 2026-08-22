# Receipts

Controls evidence that payment criteria have been met and links receipt issuance to the original invoice/order/payment.

## Required linkage
Receipt number/date, payer/customer, related invoice(s), payment ID/provider/bank reference, amount/currency, payment date/method, tax-document relationship where applicable, preparer/system source, and status.

## Workflow
```text
Payment confirmed → amount/reference matched → duplicate-receipt check → receipt generated → customer delivery → register/accounting linkage → reprint/void handled with audit trail
```

Do not issue a receipt merely because a customer uploaded proof when the payment policy requires provider/bank confirmation. Reprints and replacements must remain traceable.