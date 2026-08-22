# 07 — Records & Evidence

This group defines how FLOW preserves reliable evidence after business actions occur. It is not enough to create a contract, invoice, approval, refund, tax filing, or incident record; FLOW must be able to prove later which version existed, who acted, when it happened, and whether the evidence has been altered.

## Substructure

```text
07-records-evidence/
├── retention/
├── archive/
├── signed-document-evidence/
├── electronic-signatures/
├── audit-trails/
└── destruction-records/
```

# A. Record classes

Classify records by business purpose rather than storing everything forever. Typical classes include:

- corporate/statutory records;
- accounting/tax records;
- signed commercial contracts;
- HR/personnel records;
- payment/reconciliation records;
- privacy/security evidence;
- customer operational records;
- support/incident records;
- vendor records;
- IP/ownership records.

Each class should have an owner, retention trigger, retention period/rule, archive location, access classification, legal-hold override, and destruction method.

# B. Retention schedule

A retention schedule should answer:

```text
What record?
Why keep it?
Which event starts the clock?
How long?
Who owns the decision?
Where is it stored?
Who may access it?
Can a legal hold suspend deletion?
How is deletion proven?
```

Avoid one blanket period for all records. Accounting evidence, source-code ownership evidence, employee records, support logs, backups, and customer service data may require different treatment.

# C. Executed contract evidence

For every material executed agreement keep:

- final signed document;
- all schedules/annexes incorporated into it;
- signature audit evidence;
- exact template/version or document hash where available;
- date executed/effective;
- signatory identity and authority evidence where material;
- amendments/change orders;
- termination/renewal notices;
- register entry.

Do not replace an executed agreement when it is amended. Keep original + amendment + current consolidated view if useful.

# D. Electronic signatures

For e-sign transactions preserve provider-generated audit evidence where available, including signer email/identity method, timestamp, IP/device metadata if provided and appropriate, certificate/audit trail, and integrity information.

For click-through acceptance retain exact accepted terms version and event evidence.

# E. Audit trail

Important business systems should log high-risk events such as:

- role/permission changes;
- bank/payment configuration changes;
- invoice/credit/refund actions;
- customer contract status changes;
- export of sensitive data;
- deletion requests;
- privileged logins;
- manual payment verification;
- configuration overrides.

Audit trails should be access-controlled and not editable by ordinary users.

# F. Archive architecture

Recommended conceptual archive:

```text
Entity / Counterparty
→ Record family
→ Year / lifecycle
→ immutable executed evidence
→ metadata/register link
```

Avoid storing signed documents only in an individual employee's email inbox.

# G. Legal hold

When a dispute, investigation, audit, regulatory request, or litigation is reasonably anticipated, suspend normal destruction for relevant records. Document scope, owner, start date, custodians/systems, release approval, and final disposition.

# H. Destruction records

When records are legitimately deleted, retain minimal evidence that the process occurred:

```text
Record class
Period/scope
Authority/rule
Deletion date
Systems covered
Method
Reviewer
Exceptions
```

Do not retain the deleted personal data inside the destruction log itself beyond what is necessary.

# I. Evidence integrity

Controls may include:

- immutable/versioned storage;
- hash/checksum where appropriate;
- signed PDF retention;
- restricted write permissions;
- append-only audit logs;
- backup/version history;
- separation between draft and executed repositories.

# J. Common failure modes

- signed contract only exists in salesperson mailbox;
- amendment overwrites original agreement;
- invoice PDF regenerated later with different details;
- no evidence which Terms version customer accepted;
- deleted customer data restored accidentally from uncontrolled backup;
- audit log users can edit their own history;
- retention schedule exists but no deletion process runs;
- sensitive records committed into source repository.
