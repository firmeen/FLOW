# Banking, Treasury, Cash and Payment Authorization

## Purpose
This document family governs how company money moves. It connects legal authority, banking access, approval, payment evidence, accounting, and reconciliation.

## Corporate bank file
Maintain for every bank account:
- account-opening application;
- bank KYC documents;
- corporate certificate/shareholder/director documents submitted;
- board/director resolution where required;
- account number and purpose;
- authorized signatories;
- internet/mobile banking users and roles;
- transaction limits;
- token/device custody;
- changes in authority;
- account closure evidence.

## Treasury register
Recommended fields:
`bank | account | currency | purpose | owner | approvers | payment limits | online users | opening date | closing date | reconciliation owner`

## Payment authorization flow

```text
Payment obligation exists
→ supporting document received
→ commercial validity checked
→ tax/WHT treatment checked
→ payment request prepared
→ approver verifies amount/payee/bank
→ payment executed
→ bank/provider confirmation retained
→ accounting posted
→ bank reconciliation matches payment
→ packet archived
```

## Supplier bank detail changes
Treat change-of-bank instructions as fraud-sensitive.
Recommended control:
- receive written notice;
- independently verify using known contact channel;
- record verifier/date;
- update vendor master only after verification;
- apply enhanced approval for first payment to new account.

Do not rely solely on a new bank account contained in an email attachment.

## Founder-paid company expenses
Use a founder/employee reimbursement process rather than mixing personal and company activity.
Packet:
- original expense evidence;
- business purpose;
- approval;
- accounting classification;
- tax treatment;
- reimbursement proof.

## Company card controls
Maintain:
- cardholder;
- spending purpose;
- limit;
- vendors allowed where practical;
- monthly statement;
- receipt/invoice matching;
- missing-document follow-up;
- cancellation on exit.

## Segregation of duties
Ideal separation:
`requester ≠ approver ≠ payer ≠ accountant ≠ reconciler`

At startup scale, roles may overlap. Compensate with evidence and periodic review.

## Cash handling
If FLOW later receives physical cash for onboarding, equipment, events, or other activities:
- numbered receipt;
- cash collection record;
- custodian;
- deposit deadline;
- deposit slip;
- accounting entry;
- reconciliation.

Avoid keeping undocumented petty cash.

## Common failures
- paying from personal account indefinitely;
- no invoice/support before payment;
- one person can create vendor and pay vendor without review;
- former employee retains bank access;
- payment screenshot exists but no accounting/reference link;
- bank balance is treated as accounting profit.
