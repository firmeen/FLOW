# Record Retention, Archiving and Evidence Integrity

## Purpose
FLOW must be able to prove material business events years after they occurred. Retention therefore concerns not only storage duration, but also authenticity, completeness, access control, traceability, and lawful deletion.

## Record classes
At minimum classify:
- corporate/statutory;
- contracts and amendments;
- accounting/tax;
- banking/payment;
- employment/payroll;
- contractor/vendor;
- privacy/PDPA;
- security/incident;
- customer support/SLA;
- IP/brand;
- investment/shareholder.

## Retention schedule fields
`record class | examples | owner | legal/business reason | active retention | archive retention | access class | deletion trigger | exception/hold | disposal method`

Exact periods should be confirmed with Thai legal/accounting/tax/privacy advisers for each record class.

## Executed-contract evidence
Retain more than the PDF where appropriate:
- executed PDF;
- exact version/reference;
- signer identity;
- signing timestamp;
- e-sign audit trail;
- approval evidence;
- related Order Form/SOW;
- amendments;
- termination notice;
- material notices.

## Financial evidence packet
A transaction packet should allow reconstruction:

```text
contract/order/expense basis
→ invoice/tax evidence
→ approval
→ payment proof
→ WHT/VAT evidence
→ accounting reference
→ reconciliation
```

## Legal hold / dispute preservation
When a dispute, investigation, tax review, claim, or legal hold arises, normal deletion for relevant records should stop until release is authorized.

Record:
- hold reason;
- scope;
- date;
- systems/records affected;
- custodian;
- release authorization.

## Access classification
Example:
- Public/Published;
- Internal;
- Confidential;
- Highly Confidential/Restricted.

Payroll, IDs, bank information, customer data, signed agreements, and legal advice should not be kept in general-access Git folders.

## Archive integrity
For critical records:
- preserve original executed file;
- prevent silent overwrites;
- maintain version history;
- retain metadata/audit trail;
- use access-controlled storage;
- backup according to policy;
- periodically test retrieval.

## Destruction/deletion
Deletion should be controlled:
```text
retention expires
→ check legal hold/contract exception
→ owner approval or automated approved rule
→ delete/anonymize from active systems
→ handle archives/backups according to schedule
→ record disposal evidence where appropriate
```

## Common failures
- old signed contracts are overwritten by editable templates;
- nobody knows which SLA version customer accepted;
- accounting support scattered across email/chat/personal drive;
- confidential documents committed to source repository;
- retention period ends but backup copies are ignored;
- dispute begins after normal deletion continues.
