# Withholding Tax

Controls WHT classification, calculation, certificates, filing/payment, and treatment of amounts withheld from FLOW by customers.

## Vendor-payment chain
```text
Invoice + contract/SOW/PO → payment nature classified → WHT applicability/rate reviewed → withholding calculated → vendor paid net → certificate → return/remittance → accounting/reconciliation
```

## Customer-withholding chain
```text
FLOW invoice → customer pays net of WHT → difference identified as WHT, not discount → certificate requested/received → matched to invoice → AR cleared → tax credit recorded
```

## Register fields
Counterparty, transaction/invoice, nature, gross amount, WHT amount/rate, tax period, certificate number/status, filing reference, payment reference, and storage link.

Recurring classifications should be documented but re-evaluated when transaction facts change.