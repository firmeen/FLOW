# Banking & Treasury

Controls corporate bank accounts, signatories, payment authorization, cash management, and bank reconciliation.

## Core principle
Money movement must be traceable from approved business purpose to bank evidence and accounting treatment. Access authority and transaction authority are separate controls and should both be documented.

## Workflow
```text
Business need → authority/budget check → supporting packet → tax/accounting review where relevant → payment setup/execution → bank evidence → ledger posting → reconciliation → exception closure
```

## Required controls
Bank-account register, signatory/user matrix, payment limits, maker/checker roles where available, secure token/credential custody reference, recurring payment inventory, reconciliation ownership, change/closure evidence, and escalation for unexplained differences.

## Repository boundary
Do not store account numbers, statements, tokens, credentials, or sensitive KYC in Git. Store schemas, procedures, control matrices, and safe examples only.