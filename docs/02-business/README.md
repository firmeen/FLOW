# FLOW Business Documentation

This directory contains FLOW's business-model documents and the controlled administrative documentation used to operate the company.

## Authoritative structure

```text
02-business/
├── README.md
├── business-administration/
├── business-legal-accounting-operations-guide.md
├── business-model-canvas.md
├── customer-segments.md
├── pricing-model.md
├── revenue-model.md
├── unit-economics.md
└── value-proposition.md
```

`business-administration/` is the authoritative operational document system for corporate, finance, contracts, workforce, privacy/security/compliance, payments, records, and reusable workflows. It replaces the previous parallel `business-documents/` and `business-documents-v2/` trees so the repository has one unambiguous source of truth.

## Boundary

Use the standalone files in `02-business/` for business-model and commercial-strategy thinking. Use `business-administration/` when the subject is a controlled company record, legal/commercial agreement, financial or tax process, people document, privacy/security obligation, payment operation, evidence-retention rule, or repeatable administrative workflow.

Do not use this directory for product specifications, software architecture, delivery-phase implementation specs, market research, or engineering runbooks; those belong in their dedicated repository areas.

## Naming validation rule

Folder names must describe durable business responsibility, not revision state. Do not create names such as `*-v2`, `*-new`, `*-final`, or `*-latest`. When structure changes, migrate content into the durable taxonomy and rely on Git history for version history.

Before adding or renaming a folder, validate that the name is unique among siblings, reflects its actual scope, does not duplicate another owner's responsibility, matches the repository taxonomy, and remains understandable without historical context.
