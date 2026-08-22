# Accounting, Bookkeeping and Month-End Close

## Purpose
Accounting is the formal financial record of what happened in the business. It should not be reconstructed from memory or bank statements at year end. FLOW should build an evidence chain so each ledger entry can be traced to source documents.

## Accounting source documents
### Revenue
- signed agreement/order form;
- quotation where relevant;
- invoice;
- receipt/tax invoice where applicable;
- credit/debit note;
- bank/payment-provider evidence;
- withholding-tax certificate received;
- refund/adjustment evidence.

### Expenses
- vendor contract/order;
- vendor invoice/receipt/tax invoice;
- expense claim;
- payment voucher;
- WHT documentation;
- bank/card proof.

### Payroll
- employment agreement;
- approved salary/commission/overtime data;
- payroll calculation;
- payslip;
- deduction/filing evidence;
- payment proof.

### Assets
- purchase approval;
- invoice;
- payment evidence;
- asset register;
- custodian assignment;
- depreciation/accounting treatment;
- disposal record.

## Chart of accounts discipline
Each transaction category should have a standard accounting mapping and documentary support. Example:

```text
SaaS subscription revenue
→ Order Form / MSA
→ Invoice
→ Payment evidence
→ Revenue/deferred revenue treatment

Cloud hosting
→ provider invoice
→ payment evidence
→ hosting/cloud expense account

Contract development
→ contractor agreement/SOW
→ accepted deliverable
→ invoice
→ WHT/payment evidence
→ development expense or asset treatment as advised
```

## Accounts receivable workflow
```text
Invoice issued
→ AR recorded
→ due-date monitoring
→ payment received
→ identify payer/reference
→ WHT/partial-payment analysis
→ apply payment to invoice
→ issue receipt/tax documentation as appropriate
→ overdue balance follow-up
→ reconciliation
```

Never classify an unexplained short payment as a discount automatically.

## Accounts payable workflow
```text
Vendor invoice received
→ verify contract/PO/service receipt
→ accounting/tax review
→ WHT review
→ payment approval
→ payment
→ WHT certificate/filing if applicable
→ AP cleared
→ bank reconciliation
```

## Month-end close
Recommended sequence:
1. Lock/cut off the accounting period operationally.
2. Collect missing sales and expense documents.
3. Reconcile every bank account.
4. Reconcile payment gateways and card statements.
5. Review AR and overdue invoices.
6. Review AP and unpaid vendor obligations.
7. Record payroll and statutory obligations.
8. Review VAT/WHT support where applicable.
9. Record accruals/prepayments/deferred revenue as advised.
10. Review fixed assets and depreciation.
11. Investigate suspense/unidentified transactions.
12. Review management P&L, balance sheet, and cash movement.
13. Accountant/reviewer signs off close checklist.

## Bank reconciliation
A bank reconciliation explains why the accounting cash balance and bank statement balance agree after timing/identified adjustments.

Typical exceptions:
- gateway settlement net of fees;
- transfer in with no customer reference;
- duplicate posting;
- refund missing from books;
- bank fee;
- founder-paid expense;
- returned/failed payment.

Every exception requires disposition and evidence.

## Document retention connection
The ledger contains numbers; the supporting packet proves them. Store references so an accountant, auditor, tax authority, investor, or future finance employee can reproduce the transaction trail.

## Common failures
- bookkeeping only once per year;
- expenses with no business-purpose evidence;
- bank transfers used as invoices;
- personal/company transactions mixed;
- gateway fees booked incorrectly;
- revenue recognized solely from cash received without contract/billing review;
- no period-close checklist.
