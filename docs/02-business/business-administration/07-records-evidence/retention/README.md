# Retention

Defines how long each class of FLOW business record is kept, which event starts the retention clock, who owns the decision, where records live, and how legal holds override normal deletion.

## Record-class schedule
For every class record: purpose/basis, trigger event, active-retention rule, archive-retention rule, system of record, access classification, owner, legal-hold behavior, deletion/anonymization method, and evidence of destruction.

Typical classes include corporate/statutory, accounting/tax, signed commercial agreements, workforce/personnel, payment/reconciliation, privacy/security, customer operational, support/incident, vendor, and IP/ownership evidence.

## Workflow
```text
Record created/closed → class/trigger assigned → active period → archive restriction → review/hold check → retention expiry → deletion/destruction approval if required → execution → verification → minimal destruction evidence
```

## Control rule
Avoid one blanket retention period for everything. Different legal/business purposes, systems, backups, disputes, and privacy requirements may require different rules.