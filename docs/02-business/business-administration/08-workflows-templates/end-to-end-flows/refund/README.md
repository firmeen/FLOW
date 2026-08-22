# Refund — End-to-End Flow

Connects the business reason for returning money to provider/bank action, accounting/tax corrections, customer communication, and reconciliation.

## Flow
```text
Refund request/event
→ customer/order/invoice/payment identified
→ contract/policy eligibility
→ captured and remaining refundable amount
→ reason/evidence
→ approval threshold
→ provider/bank refund
→ provider reference/result
→ internal payment ledger update
→ customer notification
→ credit note/tax/accounting treatment
→ provider settlement/bank reconciliation
→ case close
```

## Controls
Order cancellation is not automatically a refund. Refund cannot exceed remaining refundable balance. Duplicate provider submission must be prevented. Partial refunds preserve the remaining balance. Manual/offline refunds require equivalent audit evidence.

## Completion gate
Customer notification alone is insufficient; provider settlement and accounting/tax records must reconcile.