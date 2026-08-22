# 00 — Governance & Document Control

This group controls how every business document in FLOW is created, approved, signed, numbered, versioned, stored, reviewed, superseded, and destroyed.

## Substructure

```text
00-governance-control/
├── document-policy/
├── naming-versioning/
├── approval-authority/
├── registers/
└── compliance-calendar/
```

## Why this exists

Without a control layer, a company eventually has multiple copies of the same agreement, unknown versions of policies, unsigned drafts mixed with signed contracts, duplicated invoice numbers, missing approval evidence, expired agreements, and no reliable answer to which document is legally or operationally effective.

This layer therefore acts as the control plane for the entire business-document system.

## Core rules

1. Every controlled document has an owner.
2. Every template has a version and effective date.
3. Every executed document is immutable as historical evidence.
4. A superseded document is archived, not silently overwritten.
5. Financial documents use controlled numbering sequences.
6. Material contracts and policies require an approval trail.
7. Contract, filing, renewal, and review dates are registered centrally.
8. Sensitive executed records are stored outside the normal source repository.

## Standard metadata

```text
Document ID:
Document Type:
Owner:
Business Function:
Version:
Status:
Effective Date:
Review Date:
Approver:
External Reviewer:
Related Documents:
Counterparty:
Confidentiality Classification:
Retention Class:
Storage Location:
```

## Standard status lifecycle

```text
DRAFT
→ INTERNAL REVIEW
→ PROFESSIONAL REVIEW (if required)
→ APPROVED TEMPLATE
→ SENT / NEGOTIATION
→ SIGNED / EXECUTED
→ ACTIVE
→ AMENDED / SUPERSEDED / TERMINATED
→ ARCHIVED
→ DESTROYED when legally and operationally permitted
```

## Registers to maintain

- master document register;
- customer contract register;
- vendor contract register;
- NDA register;
- corporate resolution register;
- IP assignment register;
- invoice/receipt/tax-document numbering register;
- bank-account and signatory register;
- employee and contractor agreement register;
- subprocessor/vendor register;
- regulatory filing register;
- renewal/expiry register;
- litigation/dispute/claim register if applicable.

## Approval authority model

Approval authority should be based on both type and materiality. Examples:

```text
Routine customer order form
→ Sales/Operations approval under approved MSA/template

Non-standard limitation-of-liability clause
→ Management + legal review

Large vendor commitment
→ Budget owner + finance + authorized signatory

Refund above threshold
→ Operations request + finance verification + manager approval

Capital/share issuance
→ Board/shareholder process + legal/corporate filing
```

## Document numbering

Numbering should be deterministic and auditable, for example:

```text
QUO-2026-000001
OF-2026-000001
INV-2026-000001
RCT-2026-000001
CN-2026-000001
PV-2026-000001
BR-2026-000001
```

Never recycle numbers from cancelled/voided issued documents. Preserve status and history.

## Review cycle

Not every document needs annual review, but all material templates should have a review trigger. Triggers include:

- law/regulation changes;
- new payment model;
- new customer segment or geography;
- material product change affecting obligations;
- security architecture change;
- repeated negotiation issue;
- incident/dispute showing a clause or process is inadequate;
- pricing/billing model change;
- new employee/contractor model.

## Key failure modes

- signed contract exists but its template/version is unknown;
- document approved verbally but no evidence exists;
- expired contract auto-renews unnoticed;
- tax invoice numbering is edited manually and duplicates occur;
- draft contract is mistaken for signed contract;
- former employee retains access to confidential records;
- one folder mixes current and historical company-registration documents;
- signed PDF is changed after signature without a replacement version.
