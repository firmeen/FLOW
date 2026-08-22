# Tax Filing — End-to-End Flow

Connects period accounting evidence to tax preparation, review, filing, payment/refund, control-account reconciliation, and archive.

## Flow
```text
Period closes
→ source documents complete
→ bank/provider/AR/AP reconciled
→ VAT/WHT/CIT/payroll-tax inputs prepared as applicable
→ tax-document/certificate exceptions resolved
→ accountant/tax preparer calculates
→ reviewer approves
→ return filed
→ payment/refund tracked
→ tax control accounts reconciled
→ filing/payment evidence archived
→ compliance calendar marked complete/next period created
```

## Required evidence
Period, tax type, reconciliations, source schedules, preparer/reviewer, calculation/workpapers in secure system, filed form/reference, filing timestamp/receipt, payment/reference, adjustments, exceptions, and completion sign-off.

## Completion gate
`FILED` is not `COMPLETE` if payment failed, a control account does not reconcile, or supporting certificates/documents remain unresolved.