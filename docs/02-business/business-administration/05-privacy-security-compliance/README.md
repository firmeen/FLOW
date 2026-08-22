# 05 — Privacy, Security & Compliance

This group governs how FLOW documents personal-data responsibilities, security controls, regulatory obligations, electronic transactions, and evidence that contractual/privacy/security promises are actually implemented.

## Substructure

```text
05-privacy-security-compliance/
├── privacy-pdpa/
│   ├── privacy-notices/
│   ├── dpa/
│   ├── consent/
│   ├── ropa-data-inventory/
│   ├── retention-deletion/
│   ├── data-subject-requests/
│   ├── subprocessors/
│   └── data-breach/
├── security/
│   ├── information-security/
│   ├── access-control/
│   ├── backup-recovery/
│   ├── incident-response/
│   ├── vulnerability-management/
│   ├── logging-monitoring/
│   └── vendor-security/
└── regulatory/
    ├── electronic-transactions/
    ├── payment-compliance/
    ├── corporate-compliance/
    └── regulatory-correspondence/
```

# A. Privacy / PDPA role map

For each processing activity determine the role FLOW actually performs. Do not label every activity the same way.

Examples:

```text
FLOW customer account administration
→ FLOW may act as controller for its own business purpose

Merchant end-customer order data processed only to provide SaaS
→ FLOW may act as processor where merchant determines purpose

Marketing leads collected directly by FLOW
→ FLOW controller activity
```

The role decision affects notices, contracts, rights handling, deletion, incident communications, subprocessor obligations, and cross-border assessments.

# B. Data inventory / ROPA

Maintain one operational record per processing activity with:

- activity name;
- business owner;
- purpose;
- controller/processor role;
- data subjects;
- data categories;
- source;
- systems/databases/storage;
- recipients;
- subprocessors;
- transfer countries/locations where relevant;
- lawful basis where applicable;
- retention period/rule;
- deletion/anonymization method;
- security classification;
- rights-request handling path;
- contract/DPA reference.

## Data-flow evidence

Where important, maintain diagrams showing:

```text
Data subject / merchant
→ FLOW web/app
→ API/backend
→ database
→ analytics/logging
→ email/SMS/messaging provider
→ payment provider
→ backups
→ exports
```

This makes the privacy documentation auditable against the architecture.

# C. Privacy Notices

Each notice should match the audience. Possible separate notices:

- business customer/account user;
- website visitor;
- applicant/employee;
- end consumer where FLOW independently determines purposes.

Maintain version history and effective date. If notice changes materially, document rollout/communication and whether additional consent or contractual action is required.

# D. DPA

A DPA should connect legal obligations to operational capability. Topics commonly include:

- processing subject/duration;
- nature/purpose;
- categories of personal data/data subjects;
- documented instructions;
- confidentiality;
- security measures;
- subprocessors;
- assistance with data-subject rights;
- incident assistance;
- deletion/return;
- audit/information rights;
- cross-border transfer requirements where relevant.

## DPA operating checklist

Before signing a customer-specific DPA verify that FLOW can actually meet:

- requested incident notification timeframe;
- deletion deadline;
- subprocessor notice/approval model;
- audit rights;
- data-location commitments;
- encryption/access requirements;
- backup deletion language;
- support for rights requests.

Do not accept obligations that contradict the actual architecture.

# E. Consent

Use consent only where appropriate. Store evidence of:

- person/identifier;
- purpose;
- exact consent text/version;
- channel;
- timestamp;
- withdrawal date/status;
- downstream suppression action.

Separate marketing consent from service-contract acceptance where they serve different purposes.

# F. Data Subject Requests

Workflow:

```text
request received
→ log case
→ verify identity proportionately
→ determine request type/scope
→ determine controller/processor responsibility
→ search relevant systems
→ evaluate legal exceptions
→ execute action
→ respond
→ document completion
```

Keep a request register without exposing unnecessary personal data to broad internal audiences.

# G. Retention & Deletion

Retention must be record-type specific. Define:

- trigger date;
- active retention;
- archive retention;
- legal hold override;
- backup treatment;
- deletion method;
- anonymization option;
- responsible system owner;
- deletion evidence.

Customer termination does not necessarily mean immediate deletion of every record because accounting, tax, dispute, security, or contractual evidence may have separate retention requirements. Document the basis and separate service data from records retained for legal/business evidence.

# H. Subprocessors

Maintain register with:

- provider;
- service;
- data processed;
- location;
- contract/DPA;
- security review;
- cross-border considerations;
- onboarding date;
- customer notice requirement;
- termination/deletion evidence.

# I. Data Breach / Privacy Incident

A privacy incident record should connect technical response to legal/contractual response.

```text
detection
→ incident ticket
→ containment
→ evidence preservation
→ data categories/data subjects assessed
→ controller/processor role identified
→ customer/DPA notification obligations checked
→ regulatory notification assessment
→ communications approved
→ remediation
→ post-incident review
→ retention of evidence
```

Maintain decision evidence even when the conclusion is that notification is not required.

# J. Security Policies

## Information Security Policy

Defines governance, responsibilities, risk management, asset protection, access, incident management, vendors, backups, and review expectations.

## Access Control

Document:

- joiner/mover/leaver process;
- role-based access;
- privileged access;
- MFA;
- periodic access review;
- emergency/break-glass access;
- shared-account prohibition/exception;
- service-account ownership;
- revocation evidence.

## Backup & Recovery

A backup policy is useful only if it states actual practice. Record:

- systems backed up;
- frequency;
- retention;
- encryption;
- backup access;
- geographic/provider location;
- restoration testing;
- RPO/RTO targets if defined;
- restoration evidence.

## Incident Response

Define severity, on-call/escalation contacts, containment, communications, evidence preservation, legal/privacy review, customer communications, restoration, postmortem, and corrective actions.

## Vulnerability Management

Maintain vulnerability source, severity, affected asset, owner, remediation target, exception approval, patch/fix evidence, and closure date.

## Logging & Monitoring

Define which events are logged, retention, access, alerting, sensitive-data minimization, time synchronization, and incident linkage.

## Vendor Security

Before allowing a vendor to process confidential/personal data, assess access scope, security posture, incident terms, subprocessing, deletion/export, authentication, and business continuity.

# K. Electronic Transactions

For electronically accepted contracts maintain sufficient evidence of identity, intent, document version, timestamp, and integrity appropriate to the transaction.

For click-through SaaS terms retain:

```text
user/account
terms version
acceptance event
timestamp
source/session evidence
copy/hash of accepted terms
```

For e-signature provider transactions retain the signed PDF plus provider audit certificate/audit trail where available.

# L. Regulatory Correspondence

Keep regulator/authority correspondence separately and controlled:

- incoming request;
- deadline;
- assigned owner;
- lawyer/accountant involvement;
- documents supplied;
- response approval;
- submitted response;
- follow-up;
- final outcome.

# M. Control evidence

Policies create obligations. Maintain proof that controls run:

```text
Policy: quarterly privileged-access review
Evidence:
- review date
- systems reviewed
- reviewers
- users/access identified
- removals/changes
- approval/closure
```

Do not publish controls that FLOW does not actually execute.

# N. Common failure modes

- privacy notice copied from another business and contradicts architecture;
- DPA promises deletion from backups immediately when system cannot do so;
- customer data exported to personal laptop without record;
- employee leaves but privileged cloud access remains;
- subprocessor added without contract/register update;
- incident handled technically but customer notification deadline missed;
- security policy promises annual tests that never occur;
- consent withdrawal recorded but marketing system continues sending;
- signed electronic contract cannot be tied to specific terms version.
