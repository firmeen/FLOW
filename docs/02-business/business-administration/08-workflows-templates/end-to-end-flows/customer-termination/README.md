# Customer Termination — End-to-End Flow

Coordinates contractual notice, billing, payment, access, integrations, exports, privacy retention/deletion, subprocessors, and archive when a customer leaves.

## Flow
```text
Customer notice / non-renewal / breach
→ contract clause, cure, and notice analysis
→ approval/effective date
→ renewal/future billing stopped
→ final invoice/credit/refund
→ outstanding balance resolved or tracked
→ data export window/requests
→ user/admin/service access disabled
→ API/integration credentials revoked
→ service data enters retention/deletion workflow
→ legal/accounting/security evidence separated for required retention
→ subprocessor/backup treatment
→ final customer confirmation
→ contract/customer register closed + archive
```

## Completion gate
Termination is not complete until commercial, financial, technical, privacy, security, and records consequences all reach defined final states.