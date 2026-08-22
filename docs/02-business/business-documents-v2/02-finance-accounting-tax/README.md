# 02 — Finance, Accounting & Tax

This group controls the evidence chain from money being agreed, billed, received, spent, recorded, reconciled, taxed, reported, and eventually audited or reviewed.

## Substructure

```text
02-finance-accounting-tax/
├── banking-treasury/
│   ├── bank-accounts/
│   ├── signatories/
│   ├── payment-authorization/
│   ├── cash-management/
│   └── bank-reconciliation/
├── accounting/
│   ├── chart-of-accounts/
│   ├── bookkeeping/
│   ├── accounts-receivable/
│   ├── accounts-payable/
│   ├── fixed-assets/
│   ├── expense-management/
│   └── month-year-end-close/
├── billing-documents/
│   ├── quotations/
│   ├── invoices/
│   ├── receipts/
│   ├── tax-invoices/
│   ├── credit-notes/
│   ├── debit-notes/
│   └── document-numbering/
└── tax/
    ├── vat/
    ├── withholding-tax/
    ├── corporate-income-tax/
    ├── payroll-tax/
    ├── tax-certificates/
    ├── tax-filings/
    └── tax-audit-support/
```

# A. Banking & Treasury

## Corporate bank-account file

For each bank account maintain:

- bank name and branch;
- account name/number in secure system;
- currency;
- purpose;
- opening approval/resolution;
- KYC/application documents;
- authorized signatories;
- internet-banking users and roles;
- transaction/approval limits;
- token/device custody;
- statement delivery method;
- reconciliation owner;
- closure evidence when retired.

### Account-opening flow

```text
business need identified
→ bank selected
→ current corporate documents prepared
→ board/authority evidence prepared where required
→ KYC submitted
→ account approved/opened
→ signatory/user permissions configured
→ accounting ledger account created
→ payment controls documented
→ reconciliation process activated
```

## Payment authorization

A payment should answer four separate questions:

1. Is the expense legitimate and supported?
2. Has the service/product been received or the contractual milestone occurred?
3. Is the tax treatment correct?
4. Who has authority to release the cash?

Recommended evidence packet:

```text
request / PO / contract
+ vendor invoice
+ receiving / acceptance evidence
+ tax/WHT calculation
+ approval
+ payment proof
+ accounting entry reference
```

## Segregation of duties

As FLOW grows, separate:

```text
Requester
→ Budget/Business Approver
→ Finance Verification
→ Payment Executor
→ Payment Approver
→ Bookkeeper
→ Bank Reconciler
```

A startup may initially combine roles, but the evidence should preserve the conceptual separation so fraud/error becomes detectable.

# B. Accounting

## Chart of Accounts

The chart of accounts should be designed with the accountant and mapped to FLOW's real economic events.

Typical categories may include:

- SaaS subscription revenue;
- onboarding/implementation revenue;
- professional-service revenue;
- discounts/refunds;
- payment-processing fees;
- hosting/cloud expenses;
- software subscriptions;
- contractor/development expenses;
- salaries and benefits;
- marketing;
- legal/accounting fees;
- office/equipment;
- taxes payable/receivable;
- accounts receivable/payable;
- deferred/prepaid balances where appropriate;
- shareholder/founder advances where applicable.

The exact treatment should be approved by the accountant based on Thai accounting/tax requirements and actual facts.

## Bookkeeping evidence rule

Every journal entry should have a source packet. Examples:

```text
Customer subscription revenue
→ signed order form / terms
→ invoice
→ payment evidence
→ receipt/tax document where applicable
→ reconciliation

Cloud expense
→ vendor invoice
→ card/bank proof
→ business-purpose evidence
→ accounting classification

Contractor development cost
→ contractor agreement + SOW
→ deliverable acceptance
→ invoice
→ WHT documents if applicable
→ payment evidence
```

## Accounts Receivable

Maintain customer-level AR evidence:

- customer master data;
- contract/order reference;
- invoice number/date/due date;
- invoice amount/tax;
- credit notes/adjustments;
- payments received;
- withholding tax deducted by customer where applicable;
- outstanding balance;
- aging bucket;
- collection notes;
- dispute status;
- write-off approval where relevant.

### AR lifecycle

```text
contract/order becomes billable
→ invoice issued
→ AR created
→ due-date monitoring
→ reminder/collection
→ payment received
→ WHT or fee difference identified
→ receipt/tax-document action
→ AR cleared
→ bank reconciliation
```

## Accounts Payable

AP should not be simply “invoice came in, pay it.” Maintain:

- vendor master;
- contract/PO reference;
- invoice validity;
- service period;
- receiving/acceptance;
- tax invoice quality where relevant;
- WHT treatment;
- due date;
- approval;
- payment evidence;
- reconciliation.

## Expense claims

Employee/founder reimbursement file should show:

- claimant;
- business purpose;
- date;
- amount/currency;
- receipt/invoice;
- project/customer if relevant;
- approver;
- accounting code;
- tax treatment;
- payment proof.

Do not mix personal and business spend without a documented correction process.

## Fixed assets

For laptops, equipment, servers, office equipment, or other capitalizable assets maintain:

- purchase invoice;
- payment evidence;
- serial/asset ID;
- acquisition date/cost;
- custodian/location;
- depreciation policy per accountant;
- transfer/repair history;
- disposal approval;
- sale/scrap evidence.

# C. Month-End Close

Monthly close should be a repeatable checklist rather than a reconstruction.

Recommended sequence:

```text
1. lock period inputs
2. collect all customer invoices/credits
3. collect vendor invoices/expenses
4. reconcile bank accounts
5. reconcile payment providers
6. reconcile AR
7. reconcile AP
8. review WHT certificates/obligations
9. review VAT input/output if applicable
10. accrue/prepay items where accountant requires
11. review payroll
12. review fixed assets
13. investigate unusual balances
14. prepare management P&L / balance sheet / cash view
15. accountant review
16. close period with adjustment log
```

## Close evidence

Keep a close pack containing:

- reconciliation summaries;
- outstanding exception list;
- adjusting journal list;
- tax filing references;
- reviewer approval;
- final trial balance/management reports.

# D. Billing Documents

## Quotation

Quotation is a commercial offer. Control fields:

- quotation number;
- issue date;
- validity;
- customer legal identity;
- services/package;
- quantity/branches/users where relevant;
- subscription period;
- one-time fee;
- recurring fee;
- tax wording;
- payment terms;
- assumptions/exclusions;
- contract reference;
- preparer/approver.

Accepted quotation should never be silently edited. Create a revision.

## Invoice

Invoice controls:

- unique number;
- issue date;
- seller legal information;
- buyer information;
- service period;
- order/contract reference;
- line description;
- amount/tax;
- due date;
- payment instructions;
- status.

## Receipt

Receipt should be generated only after payment criteria are met. Link it to the original invoice/payment reference.

## Tax invoice

Tax-invoice design and issuance must follow actual VAT registration and current legal particulars. Keep accountant-reviewed templates and prohibit manual modification of required fields without controlled review.

## Credit / Debit notes

Use controlled adjustment documents when previously issued taxable/financial documents require valid adjustment. Preserve the original document and connect the adjustment by reference.

## Numbering controls

Separate sequences by document family as appropriate. Requirements:

- unique;
- sequential/controlled;
- no silent deletion;
- void status retained;
- year/branch logic documented if used;
- system/manual fallback documented;
- access restricted.

# E. VAT Operations

VAT workflow should be designed with the accountant according to actual registration status.

When registered, the recurring operational chain generally includes:

```text
sales documents generated
→ output VAT captured
→ purchase tax invoices collected
→ input VAT eligibility checked
→ tax-document exceptions resolved
→ VAT reconciliation
→ return prepared
→ review/approval
→ filing/payment
→ evidence archived
```

Maintain a tax-invoice exception queue for invoices missing required particulars rather than assuming every supplier receipt is valid input-tax support.

# F. Withholding Tax

## FLOW paying supplier

```text
invoice/payment request
→ payment nature classified
→ WHT applicability/rate reviewed
→ withholding calculated
→ vendor paid net
→ certificate prepared/issued
→ WHT return filed/remitted
→ filing/payment proof archived
→ AP/accounting cleared
```

## Customer withholding from FLOW

```text
FLOW invoice issued
→ customer pays less withholding
→ payment received
→ difference identified as WHT, not discount
→ certificate requested/received
→ certificate matched to invoice
→ AR cleared correctly
→ WHT tax credit recorded
→ year-end tax support maintained
```

Maintain WHT certificate register by counterparty, date, invoice, amount, certificate reference, and tax period.

# G. Corporate Income Tax

Year-end CIT support should be built monthly. Maintain:

- complete revenue records;
- expense support;
- non-deductible/restricted expense review;
- fixed asset/depreciation schedule;
- accruals/prepayments;
- related-party transactions;
- WHT credits;
- tax losses/adjustments where applicable;
- accountant/tax-adviser working papers;
- filed returns and payment receipts.

# H. Tax Filing Evidence

For every filing retain:

```text
Tax type
Period
Prepared by
Reviewed by
Filed date
Filed form/reference
Amount payable/refundable
Payment date/reference
Supporting reconciliation
Issues/adjustments
```

# I. Contacts

Common external contacts:

- accountant/bookkeeper;
- auditor where required;
- Revenue Department;
- bank;
- payment providers;
- tax adviser/lawyer for unusual transactions.

# J. Critical failure modes

- receiving customer payment but failing to match WHT;
- duplicate invoice numbers;
- deleting a cancelled invoice instead of retaining void history;
- missing supplier tax invoices until VAT filing deadline;
- payment-provider net settlement recorded as gross revenue incorrectly;
- founder personal expenses mixed with company expenses without support;
- bank account unreconciled for months;
- annual tax reconstructed from bank statement only;
- expired card/vendor subscription continues charging;
- credit/refund occurs without accounting/tax adjustment.
