# Billing, Revenue Collection and Reconciliation

## Purpose
This folder governs the financial-document chain after a customer has agreed to buy FLOW. The goal is that every amount billed, received, withheld, refunded, credited, or written off can be traced to a contract and to accounting/tax evidence.

## End-to-end quote-to-cash chain

```text
Quotation
→ Signed MSA/Terms + Order Form
→ Billing schedule created
→ Invoice issued
→ Accounts receivable created
→ Customer payment / withholding / provider settlement
→ Payment matched
→ Receipt/tax document issued as applicable
→ Accounting entry
→ Bank/provider reconciliation
→ Collection closed
```

## Invoice controls
Every invoice should have:
- unique sequential/reference number under the chosen numbering policy;
- issue date;
- customer legal/billing identity;
- service description;
- billing period;
- Order Form/contract reference;
- amount before/after tax as appropriate;
- due date;
- payment instructions;
- status.

Never change an already issued invoice invisibly. Use controlled cancellation/reissue or adjustment documentation consistent with accounting/tax advice.

## Subscription billing schedule
Create from the signed Order Form:

`customer | contract | billing frequency | next invoice date | recurring amount | discount expiry | tax status | billing contact | payment terms`

This prevents recurring billing from relying on memory.

## Payment matching
Payment evidence can arrive through:
- bank transfer;
- payment gateway;
- card processor;
- QR/payment provider;
- other approved channels.

Matching process:
1. Identify payer.
2. Identify invoice(s).
3. Compare gross invoice, bank amount, fees, and WHT.
4. Resolve partial/overpayment.
5. Record provider/bank reference.
6. Clear AR only when allocation is understood.

## Partial payment
Do not mark an invoice fully paid merely because some cash arrived. Record:
- amount received;
- outstanding amount;
- reason;
- next collection action.

## Overpayment
Maintain a procedure to determine whether to:
- apply to another invoice;
- hold as customer credit;
- refund;
- correct mistaken duplicate payment.

Approval and customer confirmation should be retained.

## Withholding tax received
For B2B Thai customers where withholding applies:
```text
Invoice gross amount
→ customer pays net
→ WHT certificate received
→ certificate verified/matched
→ cash + WHT credit clear receivable
→ certificate retained for tax process
```

## Receipt and tax-document issuance
The exact document depends on actual tax status and transaction facts. Configure templates only after accountant review.

Control fields:
- document number;
- linked invoice/payment;
- issue date;
- customer tax/branch details where needed;
- amount;
- VAT/tax details where applicable;
- original/reprint/void/replacement status.

## Refund and credit

```text
Request/cause identified
→ contract/refund policy checked
→ amount verified
→ approval obtained
→ accounting/tax adjustment identified
→ credit/adjustment document prepared where required
→ refund executed
→ provider/bank reference captured
→ customer notified
→ ledger updated
→ reconciliation confirms settlement
```

## Accounts receivable collection ladder
Example operational ladder, subject to actual contract:
- upcoming due reminder;
- due-date notice;
- overdue reminder;
- finance follow-up;
- suspension warning;
- authorized suspension;
- termination/escalation if contractual threshold reached.

Every significant collection action should be logged.

## Payment-provider reconciliation
Provider settlement often differs from gross sales because of:
- fees;
- refunds;
- chargebacks;
- reserve/holdbacks;
- timing differences.

Reconciliation must bridge:
`gross transactions → adjustments → fees → settlement due → bank deposit`

## Revenue reporting vs cash
Do not equate cash received with revenue automatically. Subscription terms, service period, prepayments, deferred revenue, refunds, credits, and accounting standards/tax rules can change treatment. Accountant determines formal accounting treatment.

## Common failures
- no contract reference on invoice;
- duplicate invoice numbers;
- short payment treated as discount instead of WHT;
- payment gateway net settlement booked as revenue;
- customer refund made but invoice/tax/accounting not adjusted;
- receipt issued before payment or without clear transaction basis;
- no collection ownership for overdue invoices.
