# Document Control and Registers

## Purpose
This is the control layer above every business document. A company can possess all required contracts and still lose control if nobody knows which version is current, who owns it, where it is stored, when it expires, whether it was signed, or what later document amended it.

## Master registers FLOW should maintain

### Corporate Register
Tracks current and historical company-registration documents, directors, signing authority, registered address, capital, shareholder records, resolutions, and filings.

### Contract Register
Tracks every customer, vendor, contractor, employee, partner, banking, payment-provider, and other material agreement.

Minimum fields:
- contract ID;
- counterparty legal name;
- contract type;
- business owner;
- signing entity;
- signature date;
- effective date;
- initial term;
- renewal method;
- notice deadline;
- fee/payment basis;
- governing document version;
- amendments;
- status;
- termination date;
- storage link.

### Financial Document Register
Tracks quotation, order form, invoice, receipt, tax invoice, credit/debit note, payment voucher, refund, and withholding-tax references.

### Compliance Calendar
Tracks recurring and event-driven obligations with due dates, owner, preparer, reviewer, submission channel, proof of filing, proof of payment, and completion state.

### Data/Privacy Register
Tracks processing activities, DPA status, subprocessors, retention, incidents, data-subject requests, and transfer arrangements.

## Document lifecycle

```text
Need identified
→ Draft created
→ Internal review
→ Legal/accounting/tax/privacy review if needed
→ Approved template
→ Counterparty negotiation
→ Final execution copy
→ Operational use
→ Amendment/change control
→ Renewal/termination
→ Retention/archive
→ Destruction/anonymization when permitted
```

## Status model
Use consistent statuses:

`DRAFT → INTERNAL REVIEW → EXTERNAL REVIEW → APPROVED TEMPLATE → SENT → NEGOTIATION → SIGNED/EXECUTED → ACTIVE → SUPERSEDED/TERMINATED → ARCHIVED`

## Version control
Never overwrite an executed document. If terms change, create an amendment, new order form, replacement agreement, or new version with preserved historical evidence.

## Naming convention

`YYYY-MM-DD_DocumentType_Counterparty_Reference_vX.Y_STATUS.ext`

Example:
`2026-09-01_MSA_Restaurant-A_MSA-0001_v1.0_SIGNED.pdf`

## Who should be involved
- Management/director: authority and business approval.
- Finance/accounting: financial/tax classification and evidence.
- Lawyer: material legal terms and enforceability.
- Accountant/tax adviser: bookkeeping/tax document treatment.
- Privacy/security owner: DPA, privacy, access, security schedules.
- Operations: actual process must match the written documents.

## Critical connection rule
A register entry is never the source of truth by itself. It is an index pointing to the operative document and its evidence.
