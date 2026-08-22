# ROPA & Data Inventory

Maintains one operational record per processing activity and links privacy obligations to systems, vendors, owners, and retention controls.

## Record fields
Activity name, business owner, purpose, controller/processor role, data subjects, data categories, source, systems/databases/storage, recipients, subprocessors, countries/locations where relevant, lawful basis where applicable, retention rule, deletion/anonymization method, security classification, rights-request path, contract/DPA reference, and last review.

## Data-flow evidence
Document important flows such as:
```text
Data subject / merchant → FLOW web/app → backend/API → database → logs/analytics → messaging/email → payment/provider → backup/export
```

## Workflow
New/changed feature or vendor → data-flow review → inventory update → notice/DPA/consent/retention/security impacts → approval → release/go-live → periodic reconciliation against actual architecture.

An inventory that is never reconciled to systems is only paperwork, not a control.