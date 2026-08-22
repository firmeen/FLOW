# Payment Reconciliation

Compares three independent views so internal payment status corresponds to external financial reality.

```text
FLOW payment ledger
↕
Provider transactions / settlement report
↕
Bank settlement
```

## Exception classes
Missing provider transaction, duplicate internal transaction, pending never resolved, internal paid with no provider evidence, provider paid but internal missed webhook, settlement net of unexpected fees, refund/chargeback deductions, reserve/holdback, currency/rounding difference, or bank payout missing.

## Reconciliation record
Exception ID, period/date, internal payment, provider transaction, expected/actual amount, difference, reason/classification, owner, action, accounting impact, provider case ID, resolution date, and reviewer.

## Completion gate
A difference is not resolved because the reconciliation total was forced to zero. Every material difference needs a documented explanation or corrective entry.