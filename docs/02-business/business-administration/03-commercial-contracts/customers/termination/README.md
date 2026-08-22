# Customer Termination

Controls the full legal, financial, technical, privacy, and records lifecycle when a customer relationship ends.

## Termination packet
Notice or trigger, contract clause/basis, notice/cure analysis, approval, effective date, future-billing stop instruction, outstanding invoices, refund/credit calculation, data export request/window, access/integration revocation plan, retention/deletion plan, final communications, and register closure.

## Workflow
```text
Notice/breach/non-renewal → contract/authority review → effective date → future billing stopped → final invoice/credit/refund → outstanding balance → export window → access disabled → API/integration keys revoked → service-data retention/deletion → required legal/accounting/security records separated → final confirmation → archive/register close
```

## Completion gate
`TERMINATED` is not complete merely because login is disabled. Billing, balances, exports, credentials, data lifecycle, subprocessors/backups, and record retention must all reach controlled states.