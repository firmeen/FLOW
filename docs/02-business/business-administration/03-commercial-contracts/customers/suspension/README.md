# Customer Suspension

Controls temporary restriction of service when FLOW has contractual and operational authority to do so.

## Possible triggers
Non-payment, serious security risk, account compromise, unlawful/prohibited use, material breach, or another contractually defined event.

## Required decision record
Customer/contract, trigger, evidence, contractual basis, severity, notice/cure requirements, scope of restriction, affected branches/users/integrations, data-preservation state, approval, effective time, restoration conditions, and customer communications.

## Workflow
```text
Trigger → evidence/contract review → notice/cure analysis → partial-vs-full restriction decision → approval → customer notice → suspension executed → monitoring → cure/payment/remediation → finance/security verification → restoration approval → service restored → register/audit update
```

Suspension must not accidentally destroy data needed to cure the issue or prove what happened.