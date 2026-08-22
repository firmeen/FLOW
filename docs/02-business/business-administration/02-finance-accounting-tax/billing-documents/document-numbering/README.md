# Billing Document Numbering

Defines controlled sequences for quotations, order/offer documents, invoices, receipts, tax invoices, credit/debit notes, payment vouchers, or other issued financial documents.

## Requirements
Unique, deterministic, non-recycled identifiers; documented year/branch/entity logic if used; controlled sequence owner; system/manual fallback; void/cancel status preservation; duplicate detection; access restriction; and reconciliation to issued-document registers.

## Example pattern
```text
QUO-2026-000001
INV-2026-000001
RCT-2026-000001
CN-2026-000001
```
The exact format may differ, but meaning and sequence ownership must be documented.

## Failure rule
A cancelled or voided issued number remains in history. Never delete it and reuse the number.