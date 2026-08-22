# Employment, Payroll and Offboarding Documents

## Purpose
Employment documentation should connect the legal employment relationship to payroll, access, equipment, confidentiality, IP, performance administration, statutory obligations, and termination.

## Pre-hire file
Before employment begins, maintain:
- approved position/job description;
- compensation approval;
- offer evidence;
- identity/onboarding documents required for lawful employment administration;
- employment agreement;
- employee privacy notice;
- confidentiality and IP provisions;
- policy acknowledgements;
- payroll/bank details collected through controlled process.

## Employment agreement
Typical areas to document clearly:
- position and duties;
- start date;
- compensation and payment schedule;
- work location/remote arrangement;
- working time/leave references;
- confidentiality;
- ownership of work product/IP where appropriate;
- acceptable use/security obligations;
- company property;
- termination and notice provisions consistent with law;
- reference to applicable policies.

Employment documents must be reviewed for current Thai labour-law requirements before use.

## Onboarding workflow

```text
Offer accepted
→ employment agreement signed
→ payroll/tax/social-security setup as applicable
→ privacy/policy acknowledgment
→ equipment assigned
→ account/access request approved
→ least-privilege access granted
→ security onboarding
→ role owner confirms start
```

## Payroll evidence chain

```text
Approved salary/attendance/leave/commission inputs
→ payroll calculation
→ reviewer approval
→ statutory/tax deductions
→ payslip
→ payment file/transfer
→ payroll accounting entry
→ filing/payment evidence
→ bank reconciliation
```

Changes to salary, bonus, commission, allowance, or role should have approval evidence before payroll is updated.

## Equipment register
Record:
`asset ID | device | serial | employee | issue date | condition | accessories | return date | disposal/transfer`

## Access register
For sensitive roles maintain evidence of access granted to:
- GitHub;
- cloud providers;
- production databases;
- payment systems;
- accounting systems;
- banking;
- customer support/admin;
- internal document storage.

## Employment changes
Create formal documentation for:
- promotion;
- compensation change;
- role change;
- transfer;
- material work-location change;
- policy disciplinary action where used;
- extended leave or special arrangement.

## Exit/offboarding workflow

```text
resignation/termination event
→ legal/HR review
→ final working date confirmed
→ final payroll/benefits calculated
→ handover plan
→ repositories/documents/credentials transferred
→ equipment returned
→ access revoked at correct time
→ bank/payment/admin rights removed
→ customer/vendor responsibilities reassigned
→ confidentiality/IP reminder
→ final payment and statutory process
→ personnel record archived
```

An employee exit is incomplete until system access and authority are revoked.

## Special attention for engineering staff
Offboarding checklist should verify:
- no personal account is sole owner of critical repository/domain/cloud asset;
- production secrets rotated where necessary;
- pending PRs/issues/documentation transferred;
- deployment/admin credentials reassigned;
- local copies handled according to policy.

## Common failures
- verbal salary changes with no approval record;
- former staff retains production/admin access;
- company laptop not tracked;
- payroll does not reconcile to bank;
- employee creates code but IP language is missing/unclear;
- personal email owns critical company services.
