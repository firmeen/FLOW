# Formation & Registration

Controls the evidence proving that FLOW legally exists and records its current registered particulars.

## Scope
Company incorporation, registered objectives, registered office, corporate certificates/current particulars, and the historical chain of changes to those records.

## Operating rule
Maintain a clear separation between **current effective records** and **historical evidence**. Changes to legal name, address, directors, authority, capital, shareholders, objectives, or branch particulars can cascade into banking, tax, payment-provider, customer-contract, invoice, privacy, insurance, and vendor records.

## Workflow
```text
Decision/required change → legal/corporate requirements checked → documents prepared → approvals/signatures → filing/submission → authority result obtained → current corporate master updated → dependent systems/providers updated → old evidence archived
```

## Completion gate
A registration event is not complete until the current company master, registers, banking/tax/provider/customer-facing records, and secure storage references have been reconciled to the official result.

## Storage boundary
Sensitive KYC/identity files and executed statutory records belong in controlled storage; Git contains only safe procedures, templates, metadata schemas, and examples.