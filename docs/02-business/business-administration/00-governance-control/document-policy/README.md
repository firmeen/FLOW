# Document Policy

Defines the rules that make a FLOW business document controlled, traceable, reviewable, and usable as evidence.

## Scope
- document ownership and business function;
- draft, approved, executed, superseded, archived, and destroyed states;
- confidentiality and storage classification;
- amendment/replacement rules;
- retention and legal-hold linkage;
- exception/waiver handling.

## Trigger
Use this control whenever a new document family is created, an effective policy changes, an executed record must be corrected, or an audit/dispute shows that evidence is incomplete.

## Required ownership
Every controlled artifact must identify requester/business owner, preparer, reviewer, approver/signatory where relevant, system of record, and next review/expiry action. External legal, accounting, tax, privacy, security, banking, or regulatory review must be recorded when required.

## Workflow
```text
Trigger → locate authoritative version → collect inputs → prepare change → assess downstream impact → review → approve → issue/execute → validate evidence → update registers/systems → schedule review/expiry → archive history
```

## Completion gate
Complete only when the authoritative version is identifiable, approval evidence exists, dependent registers/systems are updated, exceptions have owners, and historical evidence has not been overwritten.

## Repository boundary
Store templates, schemas, procedures, examples, and safe policy baselines here. Do not commit executed confidential contracts, IDs, bank statements, payroll data, customer personal data, credentials, or private professional advice.