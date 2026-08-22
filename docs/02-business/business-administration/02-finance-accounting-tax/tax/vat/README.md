# VAT

Controls VAT status, sales/output tax, purchase/input tax, tax-invoice validation, reconciliation, filing, payment/refund, and evidence.

## Decision file
Registration status/effective date, registered branch/address, registration evidence, approved tax-invoice templates, output/input process, filing owner, accountant contact, and known exceptions.

## Period workflow
```text
Sales documents → output VAT register
Purchase documents → input-tax eligibility/exception review
→ sales/purchase/accounting reconciliations
→ return prepared → reviewed → filed → payment/refund → control-account reconciliation → evidence archive
```

## Exception queue
Supplier tax invoices missing required particulars, wrong entity/period, duplicate documents, unrecognized tax, late corrections, or customer credits must remain visible until resolved according to accountant-approved treatment.