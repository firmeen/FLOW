# FLOW Business Documents System V2

This directory is the operational documentation system for running FLOW as a real SaaS business. It is intentionally limited to corporate formation, governance, accounting, tax, commercial contracts, workforce documents, privacy/security/compliance, payments, evidence, templates, and end-to-end document workflows.

It intentionally excludes business-model design, market research, product strategy, feature research, and data research.

## Top-level structure

```text
business-documents-v2/
├── 00-governance-control/
├── 01-corporate/
├── 02-finance-accounting-tax/
├── 03-commercial-contracts/
├── 04-people-workforce/
├── 05-privacy-security-compliance/
├── 06-payments/
├── 07-records-evidence/
└── 08-workflows-templates/
```

## Core operating principle

Every material business event must be traceable through a complete evidence chain:

```text
Authority
→ Agreement / instruction
→ Delivery / business event
→ Billing / payment consequence
→ Accounting entry
→ Tax treatment
→ Data/privacy/security consequence
→ Retained evidence
→ Renewal / amendment / termination / archive
```

## Document depth standard

Every detailed guide in this system should explain all of the following when relevant:

- purpose of the document;
- when it is created;
- legal/business trigger;
- document owner;
- preparer;
- reviewer;
- approver;
- signatory;
- counterparty/recipient;
- external authority or professional involved;
- required input documents;
- required fields and clauses;
- negotiation points;
- signing method and evidence;
- accounting impact;
- tax impact;
- banking/payment impact;
- privacy/security impact;
- system records/logs that should exist;
- documents generated afterward;
- amendment and versioning process;
- termination/cancellation process;
- retention and archive rules;
- common mistakes;
- escalation path;
- end-to-end example.

## Repository boundary

This Git repository is suitable for templates, operating procedures, document maps, checklists, non-secret policies, and workflow specifications.

Do not commit executed contracts containing confidential information, national IDs/passports, bank statements, payroll records, customer personal data, payment secrets, tax credentials, or private legal advice. Executed confidential records should live in an appropriately access-controlled document/accounting system.

## Professional review boundary

These documents are operating baselines. Final production contracts, tax positions, employment documents, investment documents, regulated payment structures, and material privacy/security obligations should be checked against current Thai law and the actual FLOW operating model by the relevant lawyer, accountant, tax adviser, privacy specialist, auditor, bank, payment provider, or regulator as applicable.
