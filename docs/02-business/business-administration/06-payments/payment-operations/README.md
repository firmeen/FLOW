# Payment Operations

Controls the operational truth of payment attempts, successful payments, settlements, refunds, chargebacks, failures, and reconciliation exceptions.

## State model
Do not compress all financial events into one mutable `paid` flag. Preserve distinct concepts such as payment intent, attempt, pending/authorization, capture/success, failure, void, refund, chargeback/dispute, and settlement.

## Evidence chain
```text
Order/invoice → internal payment ID → provider transaction/events → internal status transitions → refund/dispute adjustments → provider settlement → bank → accounting
```

## Required controls
Idempotency, webhook signature/replay handling, provider/internal status reconciliation, refund-balance control, exception queues, maker/approver authority, and audit logging.