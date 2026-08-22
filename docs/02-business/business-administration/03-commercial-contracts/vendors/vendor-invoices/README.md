# Vendor Invoices

Controls receipt, validation, approval, and payment linkage for vendor billing documents.

## Validation
Vendor identity/bank details, invoice number/date, duplicate check, contract/PO/SOW reference, service period, quantity/rate, taxes, tax-invoice particulars where relevant, WHT classification, delivery/acceptance evidence, due date, and authorized changes.

## Workflow
```text
Invoice received → intake/register → duplicate/master-data check → contract/PO/acceptance match → tax/WHT review → AP entry → approval → payment → certificate/filing → reconciliation → archive
```

## Fraud control
A bank-account change communicated on an invoice/email requires independent verification under the vendor-master change process before payment.