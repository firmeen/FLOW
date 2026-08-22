# Access Control

Controls identity lifecycle, least privilege, privileged access, MFA, service accounts, emergency access, and periodic review.

## Core processes
Joiner/mover/leaver, role-based access, privileged/admin approval, MFA enrollment, shared-account exceptions, service-account ownership, break-glass access, access-review cadence, and revocation evidence.

## Access record fields
Identity, employment/contract relationship, manager/owner, system, role/permission, privileged flag, business justification, approver, start/end date, MFA status, review result, exception, and revocation evidence.

## Workflow
```text
Access request → business need → role/least-privilege mapping → approval → provision → validation → periodic review/change → revoke on exit/no-longer-needed → evidence
```

## Critical rule
A person leaving or changing role triggers immediate review across GitHub, cloud, production, database, domain/DNS, payment, bank/accounting, support/CRM, drives, and shared secrets.