# 01 — Corporate

This group contains the documents that establish FLOW as a legal business entity, define who owns it, determine who has authority to act for it, and prove ownership of the intellectual property and brand used by the business.

## Substructure

```text
01-corporate/
├── formation-registration/
│   ├── incorporation/
│   ├── registered-objectives/
│   ├── registered-address/
│   └── corporate-certificates/
├── governance/
│   ├── directors/
│   ├── shareholders/
│   ├── board-resolutions/
│   ├── shareholder-resolutions/
│   └── signing-authority/
├── equity-investment/
│   ├── founder-agreements/
│   ├── cap-table/
│   ├── share-issuance/
│   ├── share-transfer/
│   ├── shareholders-agreement/
│   └── investment-rounds/
└── intellectual-property/
    ├── ip-assignment/
    ├── trademarks/
    ├── copyrights/
    ├── domains-brand-assets/
    └── open-source-licenses/
```

# A. Formation & Registration

## Purpose

The formation pack proves that the company legally exists and identifies its current registered particulars. This is the source used by banks, payment providers, enterprise customers, accountants, lawyers, investors, vendors, landlords, and regulators for KYC and authority verification.

## Typical document chain

```text
Founders decide to incorporate
→ company name / structure / capital / directors / objectives decided
→ incorporation documents prepared
→ founders/shareholders sign required documents
→ registration submitted to DBD
→ company registration completed
→ certificate and current registered particulars obtained
→ tax/accounting/banking setup begins
→ corporate master record created
```

## Information that must remain synchronized

- legal company name;
- registration number;
- registered office;
- directors;
- director signing authority;
- capital and shares;
- shareholders;
- registered objectives;
- branch information where applicable;
- tax registrations.

If any of these change, update both the official registration and the internal master record. A change in legal address can also cascade into bank, tax, payment-provider, customer-contract, invoice, privacy-notice, insurance, and vendor records.

## Current vs historical documents

Maintain:

```text
formation-registration/
├── current/
└── history/
```

The current folder answers “what is legally effective now?” The history folder answers “what was effective at the time of a past transaction?”

# B. Corporate Governance

## Directors

Maintain evidence of:

- appointment;
- resignation/removal;
- authority;
- conflicts/related-party disclosures where needed;
- registered changes;
- identity/KYC material in secure storage.

## Board resolutions

Use resolutions for material decisions requiring board authority. Each resolution should clearly show:

- company identity;
- date;
- meeting/written-resolution method;
- attendees or participating directors;
- quorum where relevant;
- matter considered;
- exact decision;
- authority delegated;
- effective date;
- signatures/evidence.

Typical triggers:

- open/change/close bank account;
- appoint internet-banking users;
- execute material contracts;
- approve significant vendor commitments;
- borrow or guarantee;
- appoint officers;
- approve share issuance process;
- approve annual financial statements or statutory matters as required;
- acquire/dispose of significant assets/IP.

## Shareholder resolutions

Maintain when shareholder approval is required by law, constitutional documents, or shareholder arrangements. Typical matters include capital changes, certain director matters, amendments to constitutional documents, major transactions, and statutory approvals.

## Signing authority

Maintain a practical authority matrix showing:

```text
Document/Transaction | Threshold | Preparer | Approver | Signatory | Evidence Required
```

Examples:

- routine order form under approved MSA;
- custom enterprise contract;
- cloud subscription;
- payment/refund;
- employment contract;
- contractor SOW;
- NDA;
- bank instruction;
- investment document.

# C. Founders, Equity & Investment

## Founder Agreement

The founder agreement should document the relationship before ambiguity becomes expensive. Topics include contributions, roles, time commitment, equity expectation, vesting if used, founder departure, confidentiality, IP, decision-making, conflicts, and what happens to assets created before incorporation.

### Supporting schedule

List contributed assets explicitly:

```text
GitHub repositories
Domain names
Brand/logo files
Product documentation
Design files
Cloud accounts
Customer introductions/contracts
Equipment
Cash advances
Other intellectual property
```

## Cap table

The cap table is a management model of ownership. It must reconcile to actual legal share records. Keep versions tied to legal events.

### Event chain for new shares

```text
investment/issuance terms agreed
→ corporate/legal approval checked
→ subscription/investment documents signed
→ funds received under agreed conditions
→ shares issued through required process
→ statutory registers updated
→ filings made where required
→ cap table updated
→ accounting entries recorded
→ investor evidence archived
```

Do not update only the spreadsheet.

## Share transfer

A transfer event should connect:

- transfer agreement/instrument;
- required approvals/waivers;
- payment evidence if consideration is paid;
- share certificate treatment;
- shareholder register update;
- statutory filing where required;
- cap-table update;
- tax/legal review where relevant.

## Shareholders’ Agreement

The agreement commonly addresses reserved matters, board rights, information rights, transfer restrictions, pre-emption, future issuance, dilution, tag/drag, deadlock, founder obligations, investor protections, confidentiality, and exit mechanisms. It should be reconciled with statutory documents so the company does not maintain conflicting governance rules.

## Investment round data room

Prepare an evidence-oriented data room:

```text
Corporate
Cap table
Shareholder records
IP chain of title
Material customer contracts
Material vendor contracts
Employment/contractor agreements
Financial statements/management accounts
Tax filings
Privacy/security documentation
Litigation/disputes
Bank/payment-provider information
Insurance if any
```

# D. Intellectual Property

## IP Assignment

Every material contributor should have a documented ownership path. An assignment schedule should identify what is transferred and when.

### Chain of title

```text
work created
→ creator identified
→ employment/contractor/founder ownership terms checked
→ assignment executed if needed
→ repository/design evidence retained
→ company ownership register updated
```

## Trademarks

Maintain:

- clearance/search evidence;
- application/registration records;
- classes/services;
- owner entity;
- renewal dates;
- oppositions/office actions;
- licensed uses;
- brand guidelines.

## Copyright evidence

Maintain creation/provenance evidence for code, designs, website content, documentation, illustrations, videos, and brand assets. Git history is useful evidence but is not a replacement for proper ownership agreements.

## Domains and brand assets

Domains should be held in a company-controlled registrar account where practical. Track:

- domain;
- registrar;
- registrant/owner;
- admin account;
- renewal date;
- DNS operator;
- transfer lock;
- recovery contacts.

## Open-source licenses

Maintain a component register. For each material dependency record license type, version, use, modification, notice requirements, distribution implications, and review result.

# E. External contacts

Common external parties:

- Department of Business Development;
- corporate lawyer/company secretary adviser;
- accountant/auditor;
- bank;
- trademark/IP counsel or Department of Intellectual Property;
- investors/investor counsel;
- payment providers requiring corporate KYC.

# F. Common failure modes

- founder owns domain personally after investment;
- contractor created core code without IP assignment;
- cap table differs from statutory shareholder records;
- director changed but bank/payment-provider KYC was never updated;
- old company certificate sent to enterprise customer;
- shareholder transfer reflected in spreadsheet only;
- brand/logo commissioned from designer without ownership transfer;
- important resolution exists only in chat messages;
- former director still has bank/admin authority.
