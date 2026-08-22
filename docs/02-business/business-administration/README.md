# FLOW Business Administration

`business-administration/` is FLOW's authoritative operating system for company administration and business evidence. The name is intentionally durable: it describes the responsibility of the tree rather than a revision number. Git history records revisions; folder names do not.

The system covers the documentary lifecycle of the company from formation and authority, through contracting and money movement, to workforce, privacy/security, payment operations, evidence retention, and recurring workflows.

It intentionally excludes business-model design, market research, product strategy, feature research, engineering architecture, and implementation delivery specifications.

## Structure

```text
business-administration/
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

The nine top-level groups are intentionally broad. Detailed subjects are split into subfolders beneath the responsible group instead of creating twenty or more competing top-level categories.

## Core evidence chain

Every material business event should be traceable through the full chain that applies to it:

```text
Authority / policy
→ request or commercial trigger
→ approval
→ agreement / instruction
→ delivery or business event
→ billing / payment consequence
→ accounting entry
→ tax treatment
→ privacy / security consequence
→ retained evidence
→ renewal / amendment / termination / archive
```

A workflow is not complete merely because its visible transaction occurred. Payment is not complete until reconciled; a signed agreement is not complete until registered and its obligations activated; a person leaving is not complete until access, property, payroll, and records are closed.

## Required control model for every folder

Each folder README is an operating specification, not a label. Where relevant it should explain:

- purpose and business risk controlled;
- scope and explicit exclusions;
- business/legal trigger;
- document or record owner;
- preparer, reviewer, approver, and signatory;
- counterparty, authority, bank, provider, accountant, lawyer, or other external party;
- required inputs and prerequisite evidence;
- required fields, clauses, calculations, or decision points;
- standard workflow and status lifecycle;
- exception and escalation paths;
- accounting, tax, banking, payment, privacy, and security impacts;
- system records, logs, register entries, and downstream documents;
- signing or acceptance evidence;
- amendment, replacement, cancellation, and termination handling;
- retention, legal-hold, archive, and destruction rules;
- confidentiality and repository-storage restrictions;
- completion criteria and validation checklist;
- common failure modes.

## Standard metadata

Controlled documents and records should carry or be linked to metadata equivalent to:

```text
Document / Record ID:
Document Type:
Business Function:
Owner:
Preparer:
Reviewer:
Approver:
Authorized Signatory:
Version:
Status:
Effective / Event Date:
Review / Renewal / Expiry Date:
Counterparty / Subject:
Related Contract / Invoice / Payment / Case:
Confidentiality Classification:
Retention Class:
System of Record:
Storage Location:
External Adviser / Authority:
Exception / Approval Reference:
```

Not every field belongs on every document, but every material record must be identifiable and traceable without relying on someone's memory.

## Standard lifecycle

```text
DRAFT / REQUESTED
→ INTERNAL REVIEW
→ PROFESSIONAL OR SPECIALIST REVIEW when required
→ APPROVED
→ ISSUED / SENT / NEGOTIATION
→ ACCEPTED / SIGNED / EXECUTED / FILED
→ ACTIVE / OPEN
→ CHANGED / AMENDED / ADJUSTED / RENEWED
→ CLOSED / TERMINATED / SUPERSEDED
→ ARCHIVED
→ DESTROYED only when permitted
```

Do not silently overwrite executed evidence. Corrections must preserve the original and create a new version, amendment, credit/debit document, replacement, or formally recorded exception as appropriate.

## Responsibility model

Every controlled process should identify at least four conceptual responsibilities even when a small team temporarily combines them:

```text
Requester / Business Owner
→ Preparer
→ Reviewer / Control Owner
→ Approver / Authorized Signatory
```

High-risk processes may also require Finance, Tax, Legal, Privacy, Security, Accounting, or Executive review. Combining roles is acceptable only when practical; eliminating the evidence of review and authority is not.

## Repository boundary

This Git repository is suitable for templates, policy baselines, document maps, workflows, registers schemas, checklists, examples, and non-secret control specifications.

Do not commit executed customer/vendor contracts containing confidential terms, national IDs/passports, bank statements, payroll records, employee files, customer personal data, payment credentials, tax credentials, private legal advice, production secrets, or regulator-confidential correspondence. Store those in an access-controlled system of record and keep only safe templates or metadata schemas here.

## Professional-review boundary

These files are operating baselines. Production contracts, Thai tax positions, labour documents, investment/share documents, regulated payment structures, privacy obligations, and security commitments must be validated against current law and FLOW's actual operating model by the appropriate lawyer, accountant, tax adviser, privacy/security specialist, auditor, bank, payment provider, or regulator when required.

## Naming and structure validation

Before creating any new folder or document family:

1. Confirm the responsibility is not already owned by an existing folder.
2. Prefer durable business nouns over project/revision labels.
3. Keep top-level categories broad and move detail into subfolders.
4. Use Git history for revision history; never encode `v2`, `new`, `final`, or `latest` into a durable folder name.
5. Ensure parent README and actual filesystem agree in both directions.
6. Do not create empty placeholder folders; every committed folder must have a README or an intentional artifact.
7. Validate internal references after moves or renames.
8. Preserve historical source material when consolidating structure unless it is demonstrably redundant.

## Completion gate for this documentation system

A structural change is complete only when the taxonomy, actual subfolders, README structure diagrams, migrated source material, and repository references agree. Orphan folders, duplicate authoritative trees, version-suffixed directory names, and undocumented placeholders are considered structural defects.
