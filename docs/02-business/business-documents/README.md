# FLOW Business Documents System

This folder is the structured operating system for the legal, accounting, tax, corporate, contractual, employment, payment, and record-keeping documents used to run FLOW as a real SaaS business.

It intentionally excludes business-model, market-research, product-strategy, feature-research, and data-research documents.

## Folder map

```text
business-documents/
├── 00-master-control/
├── 01-company-formation/
├── 02-corporate-governance/
├── 03-founders-equity-investment/
├── 04-intellectual-property/
├── 05-banking-treasury/
├── 06-accounting-bookkeeping/
├── 07-tax-compliance/
├── 08-sales-customer-contracts/
├── 09-billing-revenue-collection/
├── 10-saas-service-operations/
├── 11-privacy-pdpa/
├── 12-payment-providers/
├── 13-vendors-procurement/
├── 14-employment-hr/
├── 15-contractors-freelancers/
├── 16-partners-resellers/
├── 17-security-compliance/
├── 18-record-retention-evidence/
├── 19-annual-recurring-compliance/
└── 20-end-to-end-document-flows/
```

## Core rule

Every material business event should be traceable through:

```text
Authority
→ Agreement
→ Delivery
→ Billing
→ Money
→ Accounting & Tax
→ Data & Security
→ Evidence & Retention
```

Each subfolder explains the document family, why it exists, when it is used, who prepares and signs it, who must be contacted, what other documents it connects to, what evidence must be retained, common failure modes, and how the document fits into FLOW's end-to-end operating process.

## Repository boundary

This repository is for templates, procedures, document maps, checklists, numbering rules, and non-secret governance documentation.

Do not commit executed confidential records such as signed customer contracts with sensitive information, payroll, IDs, tax certificates containing personal data, bank statements, credentials, secrets, or actual customer data exports. Those belong in controlled business storage with appropriate access control and retention rules.
