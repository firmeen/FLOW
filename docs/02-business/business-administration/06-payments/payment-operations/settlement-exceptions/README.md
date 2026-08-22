# Settlement Exceptions

Controls differences between expected provider payout and actual provider/bank settlement.

## Common causes
Provider fees, refund/chargeback deduction, reserve/holdback, payout delay, bank rejection, account change, transaction cutoff/timing, provider adjustment, currency/FX difference, duplicate/missing transaction, or manual correction.

## Case record
Exception ID, settlement period/reference, expected gross/net components, actual payout, difference, affected transactions, provider case, cause, accounting treatment, owner, remediation, bank result, reviewer, and resolved date.

## Workflow
```text
Difference detected → transaction-level reconciliation → cause classification → provider/bank inquiry if needed → accounting adjustment/receivable/payable → correction/re-payout → bank match → review → close
```

Old unresolved settlement differences must remain visible in an ageing queue.