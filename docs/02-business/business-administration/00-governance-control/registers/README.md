# Registers

Registers are the searchable control indexes that connect business events to authoritative evidence and deadlines.

## Required register families
At minimum maintain, when applicable: master document, customer contract, vendor contract, NDA, corporate resolution, IP assignment, billing-number, bank/signatory, workforce agreement, subprocessor/vendor, regulatory filing, renewal/expiry, and dispute/claim registers.

## Minimum fields
```text
Record ID | Type | Owner | Counterparty/Subject | Status | Effective/Event Date | Review/Renewal/Expiry | Related Record | Secure Storage Link | Confidentiality | Retention Class | Exception/Next Action
```

## Update triggers
Execution/issuance, amendment, renewal, termination, filing, authority change, bank/provider change, archive, legal hold, or destruction.

## Quality controls
- one authoritative row per controlled instance;
- unique IDs and no silent deletion;
- status matches source evidence;
- dates use the controlling document/event;
- secure links do not expose protected data;
- overdue items have an owner;
- periodic reconciliation against source systems.

## Completion gate
Creating a document without its required register entry is incomplete. The source folder owns factual accuracy; records/evidence controls own archive integrity.