# FLOW Business, Legal, Accounting & Contract Operations Guide

**Scope:** Company formation · corporate records · accounting · tax · customer/vendor documents · SaaS contracts · employment/contractors · IP · privacy/PDPA · payment operations · evidence and retention

**Purpose:** This document is the operational document map for running FLOW as a real SaaS business in Thailand. It intentionally excludes business-model design, market research, product research, pricing strategy, feature strategy, and data-research documents.

> This is an operational baseline, not individualized legal or tax advice. Before signing high-value agreements, processing regulated payments, handling sensitive personal data, raising capital, or making tax positions, FLOW should have the relevant Thai lawyer/accountant/tax adviser review the final documents and actual operating flow.

---

## 1. How to use this guide

A SaaS company does not have one “legal file.” Business events create chains of documents. The safest way to manage FLOW is to treat each event as a document workflow with four layers:

1. **Authority / legal basis** — who is allowed to act and under what registration, resolution, agreement, or policy.
2. **Commercial evidence** — what was offered, accepted, delivered, billed, paid, changed, cancelled, or refunded.
3. **Accounting / tax evidence** — what must be recorded in the books and what supporting document proves the entry.
4. **Operational evidence** — logs, approvals, acknowledgements, versions, handovers, notices, access records, or technical evidence that show what actually happened.

A single customer subscription can therefore involve:

```text
Lead / negotiation
→ quotation or proposal
→ order form / SaaS agreement
→ acceptance / signature evidence
→ customer setup
→ invoice
→ payment
→ receipt / tax invoice where applicable
→ accounting entry
→ bank reconciliation
→ withholding-tax evidence where applicable
→ service delivery / support records
→ renewal, change order, suspension, or cancellation
→ final invoice / refund / credit documentation
→ data export and deletion record
→ contract archive
```

The objective is not “create more paperwork.” The objective is that every material business event can later answer:

- Who approved it?
- What was agreed?
- Which version applied?
- What amount was due?
- What amount was paid?
- How was it recorded in accounting?
- What tax evidence exists?
- What personal/company data was processed?
- What happened when the relationship changed or ended?

---

# 2. Business formation and legal identity

## 2.1 Decide the operating person before taking material commitments

Before FLOW signs long-term customer contracts, hires staff, receives investment, or accumulates material liabilities, determine whether the contracting party is the founder personally or a Thai juristic person such as a limited company.

This matters because the name shown on the following must be consistent:

- customer agreements;
- bank account;
- invoices and receipts;
- tax registrations;
- cloud/vendor subscriptions where practical;
- employment or contractor agreements;
- intellectual-property ownership;
- payment-provider merchant account;
- privacy notices and data-controller identity.

If a founder signs contracts personally and later incorporates, do not assume those rights and obligations automatically belong to the company. Use an assignment, novation, IP transfer, asset transfer, or replacement agreement appropriate to the situation.

## 2.2 Company-registration document set

For a Thai limited company, maintain a permanent corporate file containing at minimum the registration documents generated or filed through the Department of Business Development process, including the memorandum/registered particulars, incorporation particulars, shareholder list, certificate, regulations if any, and subsequent registered changes.

Operationally, split these into:

```text
Corporate Master Record
├── current company certificate
├── incorporation set
├── current memorandum / registered objectives
├── current directors and signing authority
├── current shareholder list
├── articles/regulations if any
├── registered office evidence
├── tax registrations
└── history of amendments
```

### Why these documents matter

Banks, payment providers, enterprise customers, accounting firms, investors, landlords, and vendors commonly ask for current company documents to verify:

- legal existence;
- company name and registration number;
- registered address;
- directors;
- signing authority;
- business objectives;
- shareholders or beneficial ownership where required.

### Document-control rule

Never keep only one folder called `company-documents` containing mixed old and new certificates. Maintain:

- **CURRENT** — the latest operative documents;
- **HISTORY** — superseded versions and amendment evidence.

A document can be historically important even after it is no longer current.

---

# 3. Founders, shareholders, directors, and authority

## 3.1 Founder Agreement

Use when two or more people are building FLOW together or when somebody is promised equity or founder-level economics.

It should address at least:

- roles and expected contribution;
- initial ownership understanding;
- cash, equipment, software, domains, code, designs, customer relationships, or other assets contributed;
- vesting or conditions for earning equity if used;
- treatment when a founder leaves early;
- confidentiality;
- invention and IP ownership;
- decision-making;
- deadlock handling;
- conflicts of interest;
- outside work;
- transfer of founder-created assets to the company after incorporation;
- what happens if incorporation never occurs.

A Founder Agreement does **not** replace the company’s statutory shareholder records or later Shareholders’ Agreement.

## 3.2 Shareholders’ Agreement

Use when shareholder governance becomes material. It usually sits beside — not instead of — the company’s constitutional and statutory documents.

Topics commonly requiring explicit treatment:

- reserved matters requiring special approval;
- board appointment rights;
- share-transfer restrictions;
- pre-emption rights;
- new share issuance;
- founder/investor information rights;
- tag-along / drag-along where appropriate;
- financing and dilution;
- dividend policy principles;
- deadlock mechanisms;
- default and exit;
- confidentiality;
- non-solicitation and other enforceable protective clauses as advised.

## 3.3 Cap table

The cap table is a management record showing ownership and dilution scenarios. It is not a substitute for statutory registers or properly executed share documentation.

Maintain versioned cap tables:

```text
CAPTABLE_2026-08-22_pre-seed.xlsx
CAPTABLE_2026-10-01_post-investment.xlsx
```

Every cap-table change should be traceable to a legal event such as:

- incorporation;
- transfer;
- new share issue;
- exercise/conversion;
- restructuring.

## 3.4 Board and shareholder resolutions

A company acts through authorized persons and corporate decisions. Maintain formal evidence for material decisions such as:

- opening or changing bank accounts;
- appointment/removal of authorized users;
- borrowing or guarantees;
- material contracts outside ordinary authority;
- share issuance or capital changes;
- appointment/change of directors;
- adoption of employee equity arrangements;
- approval of annual financial statements where required;
- appointment/change of auditor;
- major related-party transactions;
- disposal or acquisition of significant IP/assets.

Do not rely on chat messages as the only evidence for a corporate decision that should be formally approved.

---

# 4. Intellectual property and ownership chain

For a software company, an investor or buyer will eventually ask a simple question: **Does FLOW actually own the software and brand it is selling?**

The answer should be provable from documents, not assumption.

## 4.1 IP Assignment Agreement

Use to transfer rights in relevant work from founders, contractors, employees where appropriate, designers, agencies, or other contributors to the company.

The schedule should identify the assets with practical precision, for example:

- repositories and source code;
- database schema and migrations;
- APIs and backend services;
- design files;
- UI components;
- logo and brand assets;
- documentation;
- deployment scripts;
- domain names where transferable;
- original written materials;
- proprietary datasets created for the company;
- inventions or technical designs.

## 4.2 Contractor and employee IP clauses

Before a person creates material work, the agreement should define:

- ownership of deliverables;
- pre-existing IP the person retains;
- third-party/open-source components;
- obligation to disclose third-party restrictions;
- source-code delivery;
- credential handover;
- documentation handover;
- confidentiality;
- post-termination return/deletion obligations.

### End-of-engagement flow

```text
work completed
→ deliverable acceptance
→ source/design/document handover
→ IP confirmation
→ final invoice
→ withholding-tax process if applicable
→ payment
→ account/access revocation
→ asset return
→ confidentiality survives
→ evidence archived
```

## 4.3 Open-source register

Maintain a dependency register for commercially material software components. The point is not only technical inventory; it is license-risk management.

Record:

- package/component;
- version;
- license;
- where it is used;
- whether modified;
- attribution/notice obligation;
- redistribution/source-disclosure risk;
- reviewer/date.

---

# 5. Banking, cash authority, and payment controls

## 5.1 Corporate bank account pack

Maintain:

- bank application and KYC documents;
- board resolution or authorization if required;
- authorized signatory rules;
- internet-banking user roles;
- token/device custody record;
- account-confirmation document;
- changes to signatories;
- closure records for old accounts.

## 5.2 Separation of duties

Even a small startup should distinguish these activities conceptually:

```text
request payment
≠ approve payment
≠ execute payment
≠ record payment
≠ reconcile bank
```

At the earliest stage one person may perform multiple roles, but evidence should still show what happened. As FLOW grows, separate them.

## 5.3 Payment voucher / payment approval pack

For each material outgoing payment keep a packet containing:

- supplier invoice or valid support;
- purchase/order/contract reference;
- evidence goods/services were received;
- approval;
- withholding-tax calculation where applicable;
- payment evidence;
- accounting reference.

The payment voucher is the connector between **commercial obligation → cash movement → accounting entry → tax evidence**.

---

# 6. Accounting system: what documents prove the books

Accounting records should not exist separately from business documents. Every journal entry should have supporting evidence.

## 6.1 Source-document families

### Revenue documents

- quotation/proposal;
- customer contract / order form;
- invoice;
- receipt;
- tax invoice where applicable;
- credit/debit note where applicable;
- payment-provider statement;
- bank statement;
- withholding-tax certificate received from customer where applicable;
- refund evidence.

### Expense documents

- vendor agreement/order;
- vendor invoice/receipt/tax invoice;
- employee expense claim;
- payment voucher;
- withholding-tax certificate issued where applicable;
- bank/payment evidence.

### Payroll-related documents

- employment agreement;
- payroll calculation;
- approved attendance/leave/commission evidence where relevant;
- payslip;
- statutory deduction evidence;
- payment file/proof;
- tax/social-security filings as applicable.

### Asset documents

For laptops, equipment, purchased software rights, or other assets:

- purchase document;
- invoice/tax invoice;
- payment evidence;
- asset register entry;
- custodian/assignment record;
- disposal/transfer evidence.

## 6.2 Chart of accounts and document mapping

Do not let document names drive accounting inconsistently. Build a mapping such as:

```text
SaaS subscription revenue
→ customer invoice + contract/order form + payment evidence

Cloud hosting expense
→ provider invoice + card/bank evidence

Contract development expense
→ contractor agreement + accepted deliverable + invoice + WHT evidence + payment
```

## 6.3 Bank reconciliation

Every bank statement period should be reconciled against accounting records.

Typical unresolved items:

- customer paid but invoice not matched;
- gateway settlement net of fees;
- transfer recorded twice;
- refund not recorded;
- bank fee missing;
- founder paid a company expense personally;
- company paid personal expense by mistake.

Each reconciling item should end with a documented resolution, not merely “difference carried forward.”

---

# 7. Tax operating document system

Tax compliance is a recurring workflow, not a once-a-year document.

## 7.1 VAT decision and registration file

Maintain a tax-status file showing whether the company is VAT registered, effective date, registration documents, branch status if relevant, and invoice-format controls.

The operational consequence of VAT registration includes:

- correct tax-invoice wording and numbering;
- output tax records;
- input-tax evidence;
- monthly VAT workflow;
- credit/debit note controls;
- separation of valid tax invoices from ordinary receipts/invoices.

Do not issue documents labelled as tax invoices casually before confirming the company’s actual VAT status and required particulars.

## 7.2 Withholding tax workflow

For transactions subject to Thai withholding-tax rules, the workflow commonly becomes:

```text
vendor invoice / payment due
→ classify payment type
→ determine applicable withholding treatment
→ calculate gross / withholding / net
→ approve payment
→ pay net amount
→ issue withholding-tax certificate
→ file/remit tax by applicable deadline
→ attach filing/payment evidence to accounting packet
```

When FLOW is the supplier, the reverse may occur:

```text
FLOW invoices business customer
→ customer pays net after withholding where applicable
→ FLOW receives withholding-tax certificate
→ match certificate to invoice/payment
→ record receivable settlement and withholding-tax credit correctly
→ archive certificate for tax filing/support
```

Never treat “customer transferred less than invoice” automatically as a discount. First determine whether the difference is withholding tax, bank fee, credit, partial payment, or error.

## 7.3 Corporate income tax support

Maintain year-round support for:

- revenue recognition;
- deductible expenses;
- non-deductible or restricted expenses;
- fixed assets/depreciation;
- accrued expenses;
- related-party transactions;
- withholding-tax credits;
- tax adjustments recommended by accountant/tax adviser.

The annual tax return should be the result of maintained books, not a reconstruction from bank statements at year end.

---

# 8. Quote-to-cash: customer sales documents

This is the primary commercial document pipeline for FLOW SaaS.

## 8.1 Quotation

A quotation is the commercial offer before binding subscription acceptance unless the document is drafted to be contractually binding upon acceptance.

It should usually state:

- FLOW legal entity details;
- customer legal/business details;
- package/module;
- quantity: branches/users/devices or other charging unit;
- subscription period;
- monthly/annual price;
- implementation/onboarding fee;
- tax treatment;
- payment terms;
- validity period;
- assumptions/exclusions;
- reference to governing SaaS terms/MSA where appropriate.

Version quotations. If price or scope changes, issue a new version instead of editing the historical accepted file.

## 8.2 Master SaaS Agreement / MSA

The MSA defines the long-term legal framework. It should not need a rewrite every time the customer adds one branch.

Core topics:

### Parties and definitions
Identify exactly who contracts and define key terms consistently.

### Service rights
Explain that the customer receives a limited right to access/use the hosted service under the subscription, rather than ownership of the FLOW software.

### Customer responsibilities
Examples:

- authorized account use;
- correct business configuration;
- lawful use;
- staff access management;
- accuracy of merchant/product/customer information supplied;
- keeping necessary local operating checks.

### Fees and billing
Define:

- billing frequency;
- taxes;
- payment due date;
- late/non-payment consequences;
- approved fee changes;
- overages/add-ons where applicable.

### Service changes
Define how FLOW may improve the platform while protecting expressly committed functionality where necessary.

### IP
Separate:

- FLOW platform IP;
- customer data;
- customer-provided trademarks/content;
- feedback;
- third-party services.

### Confidentiality
Cover business information, credentials, pricing where confidential, customer lists, technical material, and security information.

### Data protection
Connect the MSA to Privacy Notice, DPA, security measures, subprocessor arrangements, and incident obligations as applicable.

### Availability/support
Reference the SLA/support policy rather than putting every operational detail in the MSA.

### Suspension
Define circumstances such as security threat, unlawful use, serious breach, or non-payment, with process proportionate to the situation.

### Termination
Define notice, breach, insolvency where relevant, final billing, access period, export, and deletion.

### Liability
Must be professionally reviewed. Address exclusions/limitations, indirect damages, data-loss issues, third-party dependencies, customer-side failures, and exceptions that should not be improperly limited.

### Governing law/disputes
Specify governing law and dispute mechanism suitable for the contracting structure.

## 8.3 Order Form / Subscription Order

The Order Form turns the general MSA into a specific purchase.

Recommended fields:

```text
Customer legal name
Tax ID / branch information if needed
Billing address
Service start date
Initial term
Renewal model
Product: FoodFlow / JobFlow / CareFlow
Package
Branches
Users/devices if priced
Enabled modules/add-ons
Implementation scope
One-time fee
Recurring fee
Billing frequency
Discount and expiry
Payment terms
Special terms
MSA version/reference
Authorized signatories
```

## 8.4 Change Order

Use when the customer materially changes scope during the contract:

- additional branch;
- implementation work;
- custom integration;
- migration;
- new paid module;
- material custom service.

Do not let sales chats become the only proof of a price/scope change.

## 8.5 Invoice

The invoice is the billing request. It should tie back to the contractual basis:

```text
Invoice INV-2026-000123
Reference: Order Form OF-2026-0021
Billing period: 1 Sep–30 Sep 2026
Service: FoodFlow Professional – Branch A
```

Controls:

- unique numbering;
- issue date;
- customer identity;
- due date;
- contract/order reference;
- amount and tax treatment;
- payment instructions;
- status: issued / paid / partially paid / cancelled / adjusted.

## 8.6 Receipt and tax invoice

The receipt evidences payment. A tax invoice has a different tax function and must follow applicable requirements.

Do not assume one PDF title can satisfy every purpose. Design the document engine around actual registration and tax rules reviewed by the accountant.

## 8.7 Credit note / adjustment documentation

Use formal adjustment flow when an issued amount must be reduced or corrected under circumstances requiring such documentation.

Never delete an issued financial document merely to “make the system clean.” Preserve history and create an authorized adjustment/void/replacement path.

---

# 9. Subscription lifecycle and recurring billing evidence

A recurring SaaS service needs evidence beyond the first signed contract.

## 9.1 Trial

Maintain:

- trial start/end;
- features enabled;
- customer acceptance of trial terms;
- conversion rules;
- whether card/payment authorization exists;
- cancellation outcome;
- data-retention outcome.

## 9.2 Renewal

Evidence should show:

- renewal date;
- renewal term;
- price applicable at renewal;
- notice required;
- notices actually sent;
- acceptance where required;
- invoice/payment status.

## 9.3 Price change

Maintain:

```text
approved price decision
→ affected contract cohort
→ contractual notice requirement check
→ customer notice
→ effective date
→ billing-system update
→ first invoice verification
→ archive of notice/version
```

## 9.4 Suspension for non-payment

Avoid ad hoc suspension. Use a documented sequence:

```text
due date
→ payment reminder
→ overdue notice
→ grace period if applicable
→ suspension warning
→ authorized suspension
→ restricted state
→ payment received
→ reconciliation
→ restoration
```

The exact sequence must follow the contract and applicable law.

---

# 10. SLA, support, and service-operation documents

## 10.1 Service Level Agreement

A sensible SaaS SLA distinguishes:

- service availability target;
- measurement period;
- excluded downtime;
- planned maintenance;
- incident severity levels;
- response/communication targets;
- support hours;
- customer obligations;
- service-credit process if offered.

Avoid promising “100% uptime.” Third-party infrastructure, emergency maintenance, network failure, customer configuration, and force-majeure events require defined treatment.

## 10.2 Support Policy

Define what normal subscription support includes versus paid professional services.

Example separation:

```text
Included support
- account/access assistance
- bug investigation
- configuration guidance

Potential paid services
- data migration
- on-site training
- custom integration
- custom reports
- bespoke development
- after-hours implementation work
```

## 10.3 Incident evidence

For significant incidents retain:

- incident ID;
- start/detection time;
- affected services/customers;
- severity;
- communications;
- mitigation;
- restoration;
- root-cause analysis where appropriate;
- corrective actions;
- SLA/customer-credit determination if applicable.

---

# 11. Pilot and beta agreements

Before production maturity, use a Pilot/Beta Agreement instead of pretending the service is fully mature.

Define:

- pilot objective;
- dates;
- pilot location/branch;
- test features;
- known limitations;
- whether production data may be used;
- who verifies orders, prices, status, and payments;
- support channel;
- feedback rights;
- confidentiality;
- data handling;
- fee/free status;
- early termination;
- migration to paid service;
- responsibility for operational fallback.

For FoodFlow in a live restaurant, the agreement and onboarding checklist should explicitly identify which business-critical actions remain subject to staff verification during pilot, particularly order acceptance, price/discount configuration, payment confirmation, cancellation/refund handling, and kitchen/service exceptions.

---

# 12. Privacy, PDPA, and data-processing documents

Privacy documents must mirror the actual architecture and roles, not generic website text.

## 12.1 Role mapping

For each data flow determine whether FLOW acts as:

- controller for its own account, billing, sales, website, employment, and business administration purposes;
- processor where a merchant/customer determines the purposes and FLOW processes data to provide the SaaS service;
- potentially separate/other role for a specific integration or independent purpose.

Document the analysis per processing activity.

## 12.2 Privacy Notice

A notice should explain in accessible form:

- controller identity/contact;
- data collected;
- source;
- purposes;
- legal basis as applicable;
- recipients/categories;
- international transfer where applicable;
- retention principles;
- rights and request channel;
- consequences where data is required;
- material automated processing if relevant.

Separate notices may be cleaner for:

- website visitors;
- business customers and staff users;
- job applicants/employees;
- end consumers where FLOW independently determines processing purposes.

## 12.3 Data Processing Agreement

For processor relationships, address:

- subject and duration;
- nature/purpose;
- categories of data and data subjects;
- documented instructions;
- confidentiality;
- security;
- subprocessors;
- assistance with rights requests;
- incident/breach assistance;
- deletion/return;
- audit/information obligations;
- international transfers as applicable.

## 12.4 ROPA / processing inventory

Maintain a working register containing at least:

```text
processing activity
business owner
purpose
role (controller/processor)
data subjects
data categories
system/storage
recipients/subprocessors
lawful basis where relevant
retention
security classification
cross-border transfer
rights-request path
```

## 12.5 Data retention schedule

Do not use one retention period for all data.

Different records may have different legal/operational needs:

- accounting/tax evidence;
- signed contracts;
- customer account data;
- audit/security logs;
- support tickets;
- backups;
- unsuccessful sales leads;
- employee records.

Retention rules should define both **active retention** and **deletion/anonymization outcome**.

## 12.6 Data-subject request file

For access, correction, deletion, objection, restriction, portability, withdrawal of consent, or other applicable requests, record:

- request date;
- identity-verification method;
- scope;
- systems searched;
- legal assessment/exceptions;
- response;
- completion date;
- evidence of actions.

## 12.7 Data incident / breach file

Maintain a controlled workflow:

```text
detection
→ contain
→ preserve evidence
→ assess affected data/data subjects
→ determine roles and contractual notification duties
→ legal/regulatory notification assessment
→ customer/controller communication if required
→ remediation
→ post-incident review
```

---

# 13. Payment-provider and merchant-payment documents

FLOW must document the boundary between SaaS functionality and regulated payment activity.

## 13.1 Provider contract pack

For each payment provider keep:

- merchant/platform agreement;
- fee schedule;
- settlement schedule;
- refund/chargeback rules;
- prohibited-use rules;
- security/PCI responsibilities where relevant;
- API/webhook documentation version used operationally;
- KYC approval;
- bank account used for settlement;
- support/escalation contacts.

## 13.2 Recommended evidence chain when provider settles directly to merchant

```text
customer initiates payment
→ provider creates transaction
→ FLOW records provider reference only as needed
→ provider confirms via API/webhook
→ FLOW updates payment ledger
→ merchant/provider settlement occurs
→ settlement report received
→ fees separated
→ reconciliation performed
→ mismatches investigated
```

Do not represent a `payment_status = paid` database field as proof by itself. Keep/retrieve provider reference and reconciliation evidence.

## 13.3 Refund

```text
refund request
→ eligibility / business approval
→ amount check against captured payment
→ provider refund request
→ provider result/reference
→ FLOW ledger update
→ customer notification
→ accounting adjustment
→ tax-document adjustment where applicable
→ reconciliation against settlement
```

## 13.4 Chargeback/dispute

Maintain:

- dispute notice;
- transaction/order evidence;
- customer communication;
- delivery/service proof;
- response submitted;
- provider decision;
- accounting impact;
- fraud/risk follow-up.

---

# 14. Vendor and procurement documents

FLOW will depend on cloud providers, SaaS tools, agencies, accountants, consultants, contractors, and infrastructure vendors.

## 14.1 Vendor onboarding file

Before material spend or data access:

- vendor legal identity;
- quotation;
- contract/terms;
- tax information;
- bank/payment details verified through an appropriate process;
- security/privacy review where vendor accesses data;
- DPA/subprocessor terms where applicable;
- service owner internally;
- renewal/cancellation date.

## 14.2 Purchase-to-pay chain

```text
need identified
→ quotation / vendor comparison where required
→ approval
→ PO / signed agreement where appropriate
→ service/product received
→ acceptance
→ invoice received
→ tax/WHT review
→ payment approval
→ payment
→ accounting
→ reconciliation
→ archive
```

## 14.3 Subscription vendor register

Track recurring tools to avoid zombie spend:

- vendor;
- purpose;
- owner;
- plan;
- amount/currency;
- billing cycle;
- card/bank account;
- renewal date;
- cancellation method;
- data held;
- administrator accounts.

---

# 15. Employment documents

Before hiring, build a standardized personnel file.

## 15.1 Pre-employment

- offer/approved compensation;
- identity and legally required onboarding information;
- job description;
- employment agreement;
- employee privacy notice;
- confidentiality/IP provisions;
- policy acknowledgements.

## 15.2 During employment

Keep only records necessary and appropriate, including:

- compensation changes;
- approved leave;
- payroll records;
- equipment assignment;
- access authorization;
- performance/disciplinary documentation where used;
- training/security acknowledgements.

## 15.3 Exit

```text
resignation/termination evidence
→ last-working-day confirmation
→ final payroll calculation
→ return company property
→ transfer work and credentials
→ revoke system access
→ remove payment/admin permissions
→ remind surviving confidentiality/IP obligations
→ retain personnel documents under retention rules
```

Critical SaaS rule: an employee exit is not complete until **access revocation** is complete.

---

# 16. Independent contractors and freelancers

Never rely only on a chat message that says “build this feature for 20,000 baht.”

Use:

- Contractor Agreement;
- Statement of Work (SOW);
- NDA/confidentiality provisions;
- IP assignment/license provisions;
- security/data-access requirements;
- deliverable schedule;
- acceptance criteria;
- payment milestones;
- change-request process;
- warranty/bug-fix period where agreed;
- termination/handover.

## 16.1 SOW structure

```text
Project
Objective
Deliverables
Out of scope
Dependencies
Milestones
Acceptance criteria
Timeline
Fees
Change process
Repos/environments
Security requirements
Documentation requirement
Handover requirement
```

## 16.2 Acceptance evidence

A contractor invoice should not be the only proof that deliverables were accepted.

Maintain:

- PR/commit/release reference;
- demo/acceptance record;
- outstanding defects;
- accepted date;
- approver.

---

# 17. NDA and confidentiality operations

NDA is useful but should not be used mechanically for every interaction.

Use when disclosing meaningful confidential information before another binding agreement provides equivalent protection.

Define:

- confidential information;
- permitted purpose;
- permitted recipients;
- standard exclusions;
- security duty;
- compelled disclosure process;
- return/destruction;
- duration/survival.

For employees, vendors, and SaaS customers, confidentiality clauses may sit inside the main agreement rather than as a separate NDA.

Maintain an NDA register:

```text
Counterparty | Type | Signed date | Expiry/survival | Purpose | Owner | File link
```

---

# 18. Partnerships, resellers, referrals, and implementation partners

Do not use the word “partner” without defining the actual legal relationship.

Possible agreements:

- Referral Agreement — introduces leads for a fee;
- Reseller Agreement — sells subscriptions under defined authority;
- Implementation Partner Agreement — configures/onboards customers;
- Integration Partner Agreement — technical interoperability;
- Co-Marketing Agreement — shared campaigns/content;
- Data Sharing Agreement — where independent data-sharing obligations arise.

A partner contract should clarify:

- whether partner can bind FLOW;
- approved claims and pricing;
- commission calculation;
- when commission is earned;
- refund/clawback treatment;
- customer ownership/relationship;
- access to customer data;
- branding rights;
- support responsibilities;
- anti-corruption/conflict requirements as appropriate;
- termination and post-termination customer handling.

---

# 19. Security and compliance policies that support contracts

These are operating documents, not product research.

Maintain policies proportionate to actual practice:

- Information Security Policy;
- Access Control Policy;
- MFA/password standard;
- Secure Development Policy;
- Change/Release Management;
- Backup Policy;
- Business Continuity / Disaster Recovery;
- Incident Response Plan;
- Vulnerability/Patch Management;
- Logging/Monitoring Policy;
- Vendor Risk Procedure;
- Data Classification Standard;
- Retention/Deletion Standard.

Do not write fictional controls. If the policy says “quarterly access review,” schedule and retain evidence of quarterly access reviews.

---

# 20. Corporate annual and recurring compliance calendar

FLOW should maintain a compliance calendar owned jointly by operations/finance and external accountant/company secretary support where used.

Categories to track:

## Monthly / periodic

- bookkeeping close;
- bank reconciliation;
- customer receivables review;
- vendor payables review;
- VAT filings if registered;
- withholding-tax filings as applicable;
- payroll/statutory obligations;
- subscription/vendor renewals;
- payment-provider reconciliation.

## Annual

- year-end closing;
- audit process where required;
- financial statements;
- corporate income-tax filings;
- DBD financial-statement filing;
- shareholder-list/corporate filings as required;
- annual corporate approvals/meetings as applicable;
- insurance review;
- major contract renewal review;
- privacy/security policy review.

## Event-driven

- director change;
- address change;
- capital increase;
- shareholder change;
- bank signatory change;
- VAT status change;
- new branch;
- acquisition/disposal of major IP;
- investment round;
- material data incident.

Every deadline entry should store:

```text
obligation
legal/entity owner
internal owner
external adviser
period
filing/payment deadline
required inputs
approval required
submission evidence
payment evidence
status
```

---

# 21. Record retention and evidence architecture

A signed PDF alone is not always enough. For important digital contracts retain associated evidence where appropriate:

- signed file;
- version/hash or immutable copy;
- signer identity/email;
- signing timestamp;
- audit trail from e-sign provider;
- approval ticket/resolution;
- related order form;
- amendments;
- termination notice.

## 21.1 Folder model

```text
legal-finance/
├── 00-corporate/
│   ├── current/
│   ├── incorporation/
│   ├── amendments/
│   ├── board-resolutions/
│   ├── shareholder-records/
│   └── statutory-filings/
├── 01-equity-founders/
├── 02-ip-brand/
├── 03-customers/
│   └── CUSTOMER_ID/
│       ├── contract/
│       ├── order-forms/
│       ├── invoices/
│       ├── receipts-tax/
│       ├── wht/
│       ├── support-incidents/
│       └── termination/
├── 04-vendors/
├── 05-employment/
├── 06-contractors/
├── 07-privacy-pdpa/
├── 08-payment-providers/
├── 09-accounting-tax/
└── 10-policies-controls/
```

Sensitive signed documents, identity documents, payroll, bank information, and personal data should **not** be stored in a normal source-code Git repository. This repository should contain templates, procedures, document maps, and non-secret governance documentation. Executed confidential records belong in an access-controlled document/accounting system.

## 21.2 Naming pattern

```text
YYYY-MM-DD_DocumentType_Counterparty_Reference_vX.Y_STATUS.pdf
```

Examples:

```text
2026-09-01_MSA_Restaurant-A_MSA-0001_v1.0_SIGNED.pdf
2026-09-01_OrderForm_Restaurant-A_OF-0001_v1.0_SIGNED.pdf
2026-09-30_Invoice_Restaurant-A_INV-2026-0042_ISSUED.pdf
```

Never overwrite signed historical documents with updated drafts.

---

# 22. End-to-end scenario: first paying FoodFlow customer

This example shows how the documents connect.

## Stage A — Sales qualification

Collect only business/contact data necessary for the sale. Create CRM lead record. No contract yet.

## Stage B — Commercial offer

Issue quotation containing:

- package;
- branch count;
- onboarding;
- subscription period;
- price;
- validity;
- tax/payment terms;
- MSA reference.

## Stage C — Contract

Customer signs:

- MSA or applicable online Terms;
- Order Form;
- DPA if the relationship requires it;
- pilot schedule if this is still a controlled pilot.

FLOW retains signing evidence and verified customer billing details.

## Stage D — Onboarding

Create a customer onboarding record:

- workspace owner;
- branch;
- authorized contacts;
- modules;
- payment method;
- configuration approvals;
- data import authorization if applicable;
- training completion;
- go-live approval.

## Stage E — Billing

Issue invoice from the contracting entity. Accounts receivable records the invoice.

## Stage F — Collection

Customer pays. Match bank/provider reference to invoice. If withholding applies, identify the withheld amount and obtain/match the certificate.

## Stage G — Receipt/tax documents

Issue the correct document based on actual tax status and transaction facts. Store immutable issued version.

## Stage H — Accounting

Record:

- cash/bank/provider settlement;
- receivable settlement;
- revenue/deferred revenue treatment as advised by accountant;
- VAT where applicable;
- fees;
- withholding-tax credit where applicable.

## Stage I — Monthly operation

Maintain support tickets, incidents, SLA evidence, changes, and recurring invoices.

## Stage J — Renewal

Check notice window, price, subscription term, outstanding balance, and customer contact. Generate renewal/order amendment if required.

## Stage K — Cancellation

```text
customer notice
→ contractual notice check
→ stop future renewal
→ final invoice/refund calculation
→ settlement
→ export period
→ revoke access
→ data retention/deletion workflow
→ subprocessors/backups follow retention rules
→ termination confirmation
→ archive account and contract
```

---

# 23. End-to-end scenario: hiring a freelance developer

```text
need approved
→ scope/SOW drafted
→ contractor identity and tax/payment details collected
→ contractor agreement signed
→ NDA/confidentiality + IP terms effective
→ least-privilege repo/environment access granted
→ work performed through tracked commits/PRs
→ deliverable reviewed
→ acceptance recorded
→ invoice received
→ WHT treatment reviewed
→ payment approved
→ net payment executed
→ certificate/filing handled if applicable
→ final code/docs/credentials handed over
→ access revoked
→ contractor packet archived
```

Critical control: payment completion does not equal project completion until source code, documentation, credentials, and IP obligations are satisfied.

---

# 24. End-to-end scenario: vendor/cloud subscription

```text
vendor selected
→ terms/security/privacy reviewed
→ subscription approved
→ company admin account created
→ payment method assigned
→ invoice/receipt collected every billing cycle
→ accounting classification
→ bank/card reconciliation
→ renewal date monitored
→ access reviewed
→ cancel/export/delete when vendor is retired
```

For vendors holding personal/customer data, vendor retirement also requires a data-deletion/export check, not only cancelling the credit card.

---

# 25. End-to-end scenario: refund to a SaaS customer

```text
customer requests refund / FLOW identifies correction
→ contract/refund policy checked
→ support/finance verifies facts
→ authorized approver approves amount
→ credit/adjustment document prepared where needed
→ provider/bank refund executed
→ provider reference stored
→ customer informed
→ invoice/receipt/tax document treatment corrected as required
→ accounting updated
→ bank/provider reconciliation confirms settlement
→ case closed with evidence
```

A refund should never exist only as a bank transfer screenshot.

---

# 26. What belongs in the GitHub repository and what does not

## Appropriate for this repository

- document templates;
- process maps;
- policy templates;
- legal/accounting checklists;
- document numbering specifications;
- contract clause issue lists;
- tax/accounting workflow documentation;
- privacy/security procedures;
- onboarding/offboarding checklists;
- non-secret compliance calendar definitions.

## Do not commit

- signed customer contracts containing confidential data;
- national IDs/passports;
- employee files;
- tax certificates containing personal information unless repository access/storage is explicitly designed for that purpose;
- bank statements;
- payment credentials;
- API secrets;
- payroll;
- actual customer exports;
- private legal advice.

---

# 27. Minimum document set by business stage

## Stage 0 — Founder building privately

- founder/IP ownership record;
- open-source register;
- expense evidence for founder-funded business costs;
- brand/domain ownership record.

## Stage 1 — Company incorporation

- full corporate registration pack;
- statutory registers;
- bank authorization;
- accounting engagement/setup;
- tax-status file;
- transfer of relevant founder IP/assets to company.

## Stage 2 — First pilot customer

- Pilot/Beta Agreement;
- Privacy Notice;
- DPA where applicable;
- onboarding/go-live checklist;
- incident/support procedure;
- payment responsibility definition.

## Stage 3 — First paying SaaS customer

- MSA/Terms;
- Order Form;
- quotation;
- invoice/receipt/tax-document workflow;
- SLA/support policy;
- cancellation/refund policy;
- accounts-receivable and reconciliation process.

## Stage 4 — Team and contractors

- employment/contractor templates;
- NDA/confidentiality;
- IP assignment;
- SOW;
- access/equipment onboarding and offboarding;
- payroll/vendor tax workflow.

## Stage 5 — Scale / investment / enterprise customers

- Shareholders’ Agreement and investment documents as applicable;
- clean cap table and corporate approvals;
- formal security/privacy governance;
- vendor/subprocessor register;
- enterprise DPA/security schedules;
- enhanced SLA;
- insurance evidence where obtained;
- due-diligence data room.

---

# 28. Responsibility matrix

| Area | Primary internal owner | Common external party | Key evidence |
|---|---|---|---|
| Corporate registration | Director/Admin | DBD / corporate adviser | certificate, filings, resolutions |
| Accounting | Finance | Accountant | ledgers, invoices, reconciliations |
| Tax | Finance | Accountant/Tax adviser/RD | returns, receipts, tax certificates |
| Customer contracts | Sales/Operations | Lawyer | MSA, Order Form, amendments |
| Privacy | Operations/Security | Privacy counsel/DPO support if applicable | notice, DPA, ROPA, request/breach logs |
| Payments | Finance/Product | Payment provider/bank | provider agreement, settlement/reconciliation |
| Employment | Management/HR | Labour adviser/accountant | contract, payroll, access/exit records |
| IP | Management/Engineering | IP/legal adviser | assignments, repository/design evidence |
| Vendors | Operations/Finance | Vendor | agreement, invoices, security/privacy review |

One person may own several functions while FLOW is small, but the document types must remain distinct.

---

# 29. Document status system

Use controlled statuses:

```text
DRAFT
INTERNAL REVIEW
LEGAL/ACCOUNTING REVIEW
APPROVED TEMPLATE
SENT
NEGOTIATION
SIGNED / EXECUTED
SUPERSEDED
TERMINATED
ARCHIVED
```

Templates require a version number and owner. Executed contracts retain the exact version that was signed.

Recommended template metadata:

```text
Document owner:
Version:
Effective date:
Approved by:
Review date:
External reviewer:
Related documents:
Storage classification:
```

---

# 30. Immediate implementation checklist for FLOW

- [ ] Confirm the legal contracting entity and current corporate status.
- [ ] Create a controlled corporate-record folder outside the source-code repository.
- [ ] Ensure founder-created code, designs, domains, and brand assets have a documented ownership path into the company when incorporated.
- [ ] Establish accounting software/books and a chart of accounts with an accountant.
- [ ] Establish invoice, receipt, tax-document, credit/adjustment, and numbering procedures consistent with actual tax registration.
- [ ] Establish monthly bank/payment-provider reconciliation.
- [ ] Establish withholding-tax handling with the accountant for customer and vendor transactions.
- [ ] Prepare MSA, Order Form, Pilot Agreement, SLA, Support Policy, Cancellation/Refund Policy, Privacy Notice, and DPA templates.
- [ ] Build a customer contract register and renewal calendar.
- [ ] Build a vendor/subscription register and renewal calendar.
- [ ] Prepare Contractor Agreement, SOW, NDA/confidentiality, IP assignment, and handover checklist before outsourcing development.
- [ ] Prepare employee onboarding/offboarding document packs before hiring employees.
- [ ] Maintain ROPA/data inventory, subprocessor register, retention schedule, rights-request procedure, and data-incident procedure before processing customer data at scale.
- [ ] Document payment-provider responsibility and reconciliation before enabling production merchant payments.
- [ ] Establish board/shareholder resolution templates for material corporate decisions.
- [ ] Create a recurring corporate/accounting/tax compliance calendar with named owner and filing evidence.
- [ ] Keep executed confidential records out of the normal Git repository.
- [ ] Require legal/accounting review before using final production contracts or taking a tax/regulatory position.

---

# 31. Core principle

The document system should allow FLOW to reconstruct any important business event from beginning to end.

```text
AUTHORITY
Who could approve/sign?
        ↓
AGREEMENT
What was agreed?
        ↓
DELIVERY
What was provided or changed?
        ↓
BILLING
What became payable?
        ↓
MONEY
What was actually paid/refunded?
        ↓
ACCOUNTING & TAX
How was it recorded and reported?
        ↓
DATA & SECURITY
What information was processed and protected?
        ↓
EVIDENCE
Can FLOW prove the full chain later?
```

If any material transaction cannot be followed through that chain, the document/control system is incomplete.

---

## Official-system references to verify during implementation

Because forms, portals, tax rules, filing mechanics, and regulatory interpretations can change, implementation should be verified against current official sources before operational use, including:

- Thailand Department of Business Development (DBD) — company registration, corporate documents, DBD Biz Regist, DBD e-Filing;
- Revenue Department — VAT, withholding tax, corporate income tax, tax invoices and filing procedures;
- Personal Data Protection Committee / PDPC — PDPA guidance and regulatory requirements;
- ETDA — electronic transactions/e-signature guidance;
- Bank of Thailand and relevant licensed provider rules — when FLOW’s payment model moves beyond simple technical integration and could involve regulated payment activity.

**Last baseline review:** 22 August 2026
