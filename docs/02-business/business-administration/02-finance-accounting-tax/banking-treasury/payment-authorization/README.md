# Payment Authorization

Defines the evidence and approval path required before company funds are released.

## Four questions
1. Is the expense legitimate and business-related?
2. Has the contractual/receiving milestone occurred?
3. Is the accounting/tax treatment understood?
4. Does the executor/approver have authority?

## Standard payment packet
```text
Request / PO / contract
+ vendor invoice or payment basis
+ receiving / acceptance evidence
+ tax/WHT classification
+ budget/business approval
+ payment execution evidence
+ accounting reference
```

## Roles
Requester, business/budget approver, finance verifier, payment maker/executor, payment approver, bookkeeper, and reconciler. Small teams may combine roles, but the evidence should show conceptual separation.

## Completion gate
Not complete until bank/provider result is confirmed, posting is recorded, and the transaction is reconciled.