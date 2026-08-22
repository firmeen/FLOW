# Failed & Pending Payments

Defines safe customer/staff behavior when payment does not reach a clean success or failure state.

## Cases
Insufficient funds, abandoned payment, expired QR/session, network timeout, provider timeout, delayed webhook, provider says paid while UI timed out, customer retries, duplicate attempt, authentication failure, or provider outage.

## Workflow
```text
Attempt created → provider result/event → if terminal failure: show retry path
                          └→ if pending/unknown: preserve attempt, query/wait/reconcile, block unsafe duplicate, then resolve to paid/failed/expired
```

## Controls
Never tell a user to “just pay again” while a prior attempt may still succeed unless the flow is idempotent or the old attempt is safely expired/cancelled. Record provider transaction/event IDs and resolution timing for support/reconciliation.