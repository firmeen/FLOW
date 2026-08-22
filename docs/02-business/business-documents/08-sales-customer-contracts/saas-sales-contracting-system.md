# SaaS Sales and Customer Contracting System

## Purpose
This document family governs how FLOW turns a sales conversation into a legally clear, billable, supportable SaaS relationship. The objective is to avoid a situation where sales promises, pricing, implementation work, data responsibilities, support obligations, and cancellation rights live in different chats with no single contractual chain.

## Core customer contract stack

```text
Commercial discussion
→ Quotation / Proposal
→ MSA or Terms of Service
→ Order Form / Subscription Order
→ DPA / Privacy documents where applicable
→ SLA / Support Policy
→ Implementation / Onboarding SOW if needed
→ Change Orders / Amendments
→ Renewal documentation
→ Termination / Exit documentation
```

Each document has a different job. Do not force all commercial and legal detail into one enormous contract.

## 1. Quotation / Proposal

### Purpose
Presents the commercial offer before final acceptance. It should make the economic deal understandable without rewriting the entire legal contract.

### Typical contents
- FLOW legal entity and contact details;
- customer legal/trading name;
- package/product;
- branch/user/device quantities where relevant;
- included modules;
- one-time onboarding/setup fees;
- recurring subscription fee;
- monthly/annual billing;
- discount and duration;
- tax treatment;
- payment terms;
- quotation validity;
- assumptions;
- excluded work;
- reference to the MSA/Terms and Order Form that will govern service.

### Connection
Accepted quotation should lead to an Order Form or signed agreement. Do not rely on a quotation alone to cover IP, data protection, liability, termination, security, or SLA.

## 2. Master SaaS Agreement (MSA)

### Purpose
Creates the reusable legal framework governing the ongoing relationship.

### Core clause families

#### Parties and authority
Confirm exact legal names, registration details, addresses, and authorized signatories.

#### Subscription right
Define access as a limited contractual right to use the hosted service during the subscription; customer does not acquire FLOW's platform ownership merely by paying subscription fees.

#### Scope and order documents
Define that specific products, modules, fees, branches, service periods, and implementation commitments are contained in Order Forms/SOWs.

#### Customer responsibilities
Typical areas:
- authorized account management;
- staff access removal;
- lawful data and content;
- accurate configuration;
- internet/device availability on customer side;
- merchant/business operational decisions;
- independent verification of critical transactions where appropriate.

#### Fees, tax, and payment
Define currency, due dates, tax treatment, late/non-payment handling, fee changes, disputed invoices, and consequences of non-payment.

#### IP ownership
Separate:
- FLOW platform/source/design/documentation;
- customer data;
- customer brand/content;
- third-party components;
- feedback;
- custom work.

#### Confidentiality
Define protected information, permitted use, internal recipients, exceptions, compelled disclosure, and survival.

#### Data protection
Connect to DPA, Privacy Notice, subprocessors, security measures, deletion/export, and incident duties.

#### Security
Avoid vague promises. State practical responsibility boundaries and reference security documentation where appropriate.

#### Third-party services
Explain dependencies on cloud, messaging, authentication, payment, or other providers and appropriate limitations.

#### Service availability/support
Reference SLA and Support Policy.

#### Suspension
Define triggers and process, e.g. serious security threat, unlawful use, breach, or non-payment.

#### Termination
Define ordinary expiry, non-renewal, breach termination, consequences, final payment, access period, data export, and deletion.

#### Liability
Requires professional review. The clause must reflect actual risk, insurance if any, critical exclusions, liability caps, and exceptions that cannot or should not be limited.

#### Governing law/disputes
Define jurisdiction/process suitable for FLOW's contracting structure.

## 3. Order Form / Subscription Order

### Why separate it from MSA
The MSA may stay unchanged for years. The Order Form can change whenever the customer adds branches, modules, or a new subscription period.

### Required operational fields
```text
Order Form ID
Customer legal name
Tax/branch information
Billing contact
Service contact
Product/package
Branch count
User/device entitlements where used
Enabled paid modules
Service start date
Initial term
Renewal method
One-time fees
Recurring fees
Billing frequency
Discounts and expiry
Payment terms
Implementation commitments
Special commercial terms
MSA reference/version
Signature/acceptance
```

## 4. Implementation Statement of Work
Use when onboarding is more than ordinary configuration.

Typical cases:
- data migration;
- custom integration;
- large menu import;
- multi-branch setup;
- custom report;
- on-site implementation;
- staff training beyond standard package.

SOW should define deliverables, responsibilities, prerequisites, timeline, acceptance, fees, delays caused by customer dependencies, and change-control process.

## 5. Change Order / Amendment
Use when the active relationship materially changes.

Examples:
- new branch;
- paid add-on;
- integration project;
- change of subscription term;
- bespoke work;
- price exception;
- material change to support scope.

Process:
```text
change requested
→ impact assessed
→ commercial/legal approval
→ written Change Order/Amendment
→ signatures/acceptance
→ billing and entitlement updated
→ implementation executed
→ register updated
```

## 6. Contract negotiation file
For material customers retain:
- drafts;
- redlines;
- key decision/approval notes;
- deviation approval from standard template;
- final signed copy;
- signature audit evidence;
- related Order Forms and amendments.

Do not treat the latest Word file in email as automatically final.

## 7. Customer contract approval matrix
Define internally which deviations require escalation, for example:
- non-standard liability cap;
- unlimited indemnity;
- customer ownership of FLOW platform changes;
- unusual data-security commitments;
- guaranteed uptime beyond standard SLA;
- long payment terms;
- most-favored pricing;
- auto-renewal changes;
- unusual termination/refund rights.

## 8. Contact map
Typical participants:
- FLOW Sales: commercial owner;
- FLOW Finance: billing/tax/payment terms;
- FLOW Operations/Implementation: feasibility;
- FLOW Engineering/Security: technical/security commitments;
- Lawyer: legal deviations;
- Customer owner/procurement/legal/IT/finance/privacy contacts.

## 9. Contract-to-operation handoff
A signed contract should generate operational tasks:

```text
Signed contract
→ contract register
→ billing setup
→ workspace entitlement
→ onboarding plan
→ customer contacts
→ DPA/privacy setup
→ SLA/support tier
→ renewal reminder
→ cancellation notice deadline
```

Sales should not simply mark the deal “won” and stop.

## 10. Common failures
- sales promises functionality that Order Form does not contain;
- invoice price differs from signed terms;
- DPA is forgotten after contract signature;
- contract renews but no one notices price/notice window;
- customer sends purchase order with conflicting terms and nobody reviews it;
- custom work starts before Change Order approval;
- signed agreement cannot be linked to exact Terms/SLA version.
