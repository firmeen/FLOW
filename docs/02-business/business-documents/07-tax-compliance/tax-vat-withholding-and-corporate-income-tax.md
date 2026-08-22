# Tax, VAT, Withholding Tax and Corporate Income Tax

## Purpose
Tax documents are recurring evidence that connects commercial transactions to statutory filing and payment. FLOW should build the process around the transaction lifecycle instead of treating tax as an annual afterthought.

## Tax master file
Maintain:
- tax registration/status documents;
- VAT status and effective date;
- branch tax information where applicable;
- accountant/tax adviser engagement and contacts;
- filing calendar;
- tax return copies;
- payment receipts;
- correspondence/notices;
- tax position memos for unusual transactions.

## VAT workflow
Before issuing any document as a tax invoice, confirm actual registration status and current Thai requirements with the accountant/Revenue Department guidance.

Operational chain:

```text
sale occurs / billing event
→ determine taxable treatment
→ issue correct commercial/tax document
→ record output tax where applicable
→ collect valid supplier tax invoices for input tax
→ reconcile sales/purchases to VAT records
→ prepare monthly filing
→ reviewer checks
→ submit/pay
→ archive return + payment receipt + supporting schedules
```

Maintain separate controls for:
- ordinary invoice;
- receipt;
- tax invoice;
- abbreviated tax invoice if relevant to actual business model;
- credit/debit note;
- cancelled/replaced document.

Do not delete issued tax documents to correct mistakes. Use the legally appropriate correction process.

## Withholding tax — FLOW pays a vendor

```text
Vendor invoice
→ identify nature of payment
→ determine whether WHT applies and rate/form with accountant
→ calculate gross, withheld, net
→ approve payment
→ pay net amount
→ issue WHT certificate
→ include in filing/remittance
→ retain filing/payment receipt
→ attach certificate to AP packet
```

The accounting record should show the gross expense/liability and withheld amount correctly rather than recording only the net bank transfer.

## Withholding tax — customer pays FLOW

```text
FLOW invoice
→ customer withholds where applicable
→ bank receives net amount
→ obtain WHT certificate
→ match certificate to invoice and payer
→ clear AR using cash + tax credit
→ retain certificate
→ include credit in tax process as advised
```

If the customer pays less than invoice, investigate before concluding it is WHT.

## Corporate income tax
Throughout the year retain support for:
- revenue and cut-off;
- deductible expenses;
- non-deductible/restricted items;
- depreciation/assets;
- accruals;
- related-party transactions;
- founder/shareholder loans and reimbursements;
- WHT credits;
- foreign/vendor payments where special tax treatment may arise;
- tax adjustments prepared by accountant.

## Payroll-related tax connection
Employment documents, payroll calculations, benefits, reimbursements, bonuses, commissions, and statutory deductions should connect to payroll tax/social-security processes reviewed by the accountant/HR adviser.

## Foreign SaaS/cloud vendors
Because FLOW may purchase services from foreign technology providers, maintain a specific review process rather than assuming every foreign invoice is treated like a Thai vendor invoice. Record:
- vendor country;
- service description;
- invoice currency;
- tax-registration information supplied by vendor;
- payment method;
- accountant's treatment for VAT/WHT/other obligations where applicable.

## Filing evidence pack
For each filed period retain:
`period → source schedule → reviewer → submitted return → submission confirmation → payment receipt → corrections/amendments if any`

## Common failures
- company starts VAT-related document numbering before confirming status;
- WHT certificate is never collected from customer;
- only net vendor payment is recorded;
- tax return filed but no proof/payment receipt retained;
- foreign cloud expenses treated without tax review;
- accountant receives documents too late to correct operational problems.
