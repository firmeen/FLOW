# Approval Authority

Defines who may request, review, approve, sign, release funds, grant exceptions, or bind FLOW to obligations.

## Authority dimensions
Authority must consider transaction/document type, financial materiality, legal/privacy/security risk, non-standard deviations, duration/renewal exposure, and whether the action changes bank/payment or privileged access.

## Core artifacts
- delegation-of-authority matrix;
- signing-authority matrix;
- financial thresholds;
- contract-deviation approval matrix;
- refund/credit/void thresholds;
- bank and payment-provider authority;
- temporary delegation records.

## Workflow
```text
Request → identify document/transaction class → calculate materiality → identify specialist reviews → confirm approver/signatory → record decision → execute only within authority → retain evidence → update authority register if the authority itself changed
```

## Minimum evidence
Requester, amount/value where relevant, reason, supporting documents, reviewer findings, approver identity, approval time, signatory/executor, exceptions, and resulting transaction/document reference.

## Control rule
An approval in chat may support context but must not be the only evidence for a material commitment. If a person leaves or changes role, related bank, provider, contract, finance, and administrative authority must be reviewed and revoked or reassigned.