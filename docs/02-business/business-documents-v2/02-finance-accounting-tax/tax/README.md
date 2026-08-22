# Tax Operations — Detailed Map

This folder defines the recurring evidence and decision system for Thai tax operations. It must be implemented with the accountant/tax adviser against the company’s actual registration status and transaction facts.

## Subfolders

```text
tax/
├── vat/
├── withholding-tax/
├── corporate-income-tax/
├── payroll-tax/
├── tax-certificates/
├── tax-filings/
└── tax-audit-support/
```

## Operating principle

Tax is not a final-stage filing task. Each tax position begins when a commercial event occurs.

```text
Commercial event
→ legal counterparty and transaction type identified
→ accounting classification
→ tax classification
→ required document generated/collected
→ payment/withholding performed
→ ledger recorded
→ period reconciliation
→ return prepared
→ review
→ filing/payment
→ evidence retained
```

# VAT

## VAT decision file

Maintain a controlled record of:

- registration status;
- effective date;
- registered branch/address information;
- VAT registration evidence;
- approved invoice/tax-invoice templates;
- output-tax process;
- input-tax validation rules;
- filing owner;
- accountant contact;
- known exceptions.

## Sales-side VAT controls

For each taxable sale, the billing system should preserve seller/customer details, taxable value, tax calculation, document number/date, original/adjustment linkage, and accounting posting.

## Purchase-side VAT controls

Supplier documents should be reviewed for required particulars and business relevance before being treated as eligible input-tax support. Maintain an exception queue for missing/incorrect tax invoices and follow up with the supplier before close/filing.

## VAT reconciliation

Reconcile at least:

```text
Sales ledger
↔ output VAT register
↔ issued tax documents

Purchase ledger
↔ input VAT register
↔ supplier tax invoices

VAT return
↔ accounting control accounts
↔ payment/refund evidence
```

# Withholding Tax

## Transaction classification

Do not decide WHT solely from vendor name. Determine the actual nature of payment under current rules and professional advice.

Maintain classification evidence for recurring vendors to reduce inconsistent treatment.

## Payment-side packet

```text
vendor invoice
+ contract/SOW/PO
+ payment nature classification
+ WHT calculation
+ payment approval
+ net payment proof
+ certificate
+ filing/payment evidence
```

## Revenue-side WHT packet

When a customer withholds from FLOW, track certificate collection as part of AR closure. Unreceived certificates should remain on an exception list before year-end tax preparation.

# Corporate Income Tax

Build the year-end tax file throughout the year. The working file should reconcile statutory/management accounts to tax adjustments rather than beginning from bank statements.

Typical review areas:

- revenue completeness;
- accruals/deferred/prepaid items;
- deductible expense evidence;
- non-deductible/restricted items;
- depreciation/fixed assets;
- bad debt/write-offs;
- related-party transactions;
- foreign/vendor payments;
- WHT credits;
- prior-year balances/losses;
- tax provisions and adjustments.

# Payroll Tax

Payroll tax evidence should connect employee master data, payroll calculation, taxable compensation, deductions, payments, statutory filings, and accounting.

# Certificates

Maintain separate registers for certificates issued and received. Index by counterparty, tax period, transaction/invoice reference, amount, status, and storage location.

# Filing Control

Every filing should have four states:

```text
PREPARED
→ REVIEWED
→ FILED
→ PAID/SETTLED AND RECONCILED
```

A return marked FILED is not complete if payment failed or accounting still does not reconcile.

# Audit Support

Prepare records so an inquiry can be answered without reconstructing years of activity. Maintain links between returns, reconciliations, source documents, accounting entries, tax advice, and correspondence.

## Audit/request workflow

```text
request received
→ deadline logged
→ scope clarified
→ accountant/tax/legal advisers engaged as needed
→ evidence preserved
→ requested records compiled
→ response reviewed
→ submission proof retained
→ follow-up questions tracked
→ adjustments/payment/appeal if any
→ case closed and lessons incorporated
```

# Common failures

- VAT status changes but invoice template remains old;
- WHT certificate missing and AR is incorrectly treated as short payment;
- supplier tax invoice is collected after filing without exception tracking;
- recurring vendor is classified differently every month;
- return is filed but tax payment fails;
- tax payment posted without matching liability period;
- year-end tax file lacks reconciliation to financial statements.
