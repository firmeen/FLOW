# Compliance Calendar

Turns recurring legal, corporate, tax, accounting, contract, policy, provider, security, and operational deadlines into assigned actions with lead time and completion evidence.

## Inputs
Dates must come from authoritative records: filing obligations, contracts, corporate resolutions, tax periods, provider/KYC terms, policy review dates, certificate/licence expiry, access-review policy, or professional advice.

## Recommended status
```text
UPCOMING → PREPARING → READY FOR REVIEW → SUBMITTED/PERFORMED → VERIFIED/RECONCILED → COMPLETE
```
Use `BLOCKED` and `OVERDUE` with named owner, reason, escalation, and recovery date.

## Required fields
Obligation, source authority/record, responsible owner, preparer/reviewer, due date, internal target date, lead time, required inputs, submission/performance method, payment if any, completion evidence, next recurrence, and exception notes.

## Workflow
```text
Obligation created → calendar entry → lead-time reminders → inputs gathered → prepare → review → submit/perform → confirm receipt/payment/result → reconcile downstream records → attach evidence → schedule next cycle
```

## Completion gate
A filing marked submitted is not complete if payment failed, a contract renewal is not complete if the register was not updated, and a control review is not complete without evidence of findings and corrective actions.