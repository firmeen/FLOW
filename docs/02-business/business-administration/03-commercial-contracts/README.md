# 03 — Commercial Contracts

This group governs how FLOW enters, changes, performs, renews, suspends, and terminates commercial relationships with customers, SaaS users, vendors, and business partners.

## Substructure

```text
03-commercial-contracts/
├── customers/
│   ├── quotation-proposal/
│   ├── msa/
│   ├── order-forms/
│   ├── terms-of-service/
│   ├── change-orders/
│   ├── renewal/
│   ├── suspension/
│   └── termination/
├── saas-service/
│   ├── sla/
│   ├── support-policy/
│   ├── maintenance-policy/
│   ├── pilot-beta/
│   ├── cancellation-refund/
│   └── service-incident/
├── vendors/
│   ├── vendor-onboarding/
│   ├── purchase-orders/
│   ├── vendor-agreements/
│   ├── vendor-invoices/
│   ├── renewals/
│   └── termination/
└── partners/
    ├── referral/
    ├── reseller/
    ├── implementation-partner/
    ├── integration-partner/
    ├── revenue-sharing/
    └── co-marketing/
```

# A. Customer contracting architecture

FLOW should avoid using a single oversized contract for every customer. A layered model is easier to operate:

```text
Master legal framework
MSA / Terms of Service
        ↓
Commercial purchase
Order Form / Subscription Order
        ↓
Service commitments
SLA / Support Policy / Security or Data schedules
        ↓
Data processing
DPA where applicable
        ↓
Specific change
Change Order / Amendment
```

## MSA

The MSA is the durable legal framework. It should usually address:

- parties and definitions;
- subscription right / license to access service;
- account and authorized-user obligations;
- restrictions on use;
- fees, taxes, billing and non-payment;
- intellectual property;
- customer data and customer-provided content;
- confidentiality;
- privacy/data-processing linkages;
- third-party services/integrations;
- warranties/disclaimers;
- suspension;
- term and termination;
- post-termination data handling;
- liability allocation;
- indemnity where professionally advised;
- governing law/dispute provisions;
- notices;
- order-of-precedence between documents.

### Contract issue list

For every non-standard customer contract maintain a negotiation issue list:

```text
Clause
Customer request
FLOW standard position
Risk
Business owner
Legal recommendation
Approved fallback
Final wording
Approver
```

This prevents sales from unknowingly accepting one-off obligations that engineering, finance, privacy, or support cannot satisfy.

## Order Form

The Order Form should contain variables that change customer by customer:

- legal customer name;
- tax/billing details;
- product/package;
- branches/sites;
- user/device entitlements if relevant;
- modules/add-ons;
- start date;
- initial term;
- renewal terms;
- implementation scope;
- one-time and recurring fees;
- billing frequency;
- discount and duration;
- payment terms;
- special terms;
- MSA version/reference;
- signature blocks.

## Terms of Service

For self-serve customers, use controlled click-through acceptance. Preserve:

- terms version;
- acceptance text;
- account/user accepting;
- date/time;
- method;
- relevant technical audit evidence;
- notice of later changes where required.

Do not rely on a footer link alone where explicit contractual acceptance is needed.

## Change Order

Use for material change in:

- branch count;
- package/module;
- onboarding/migration;
- custom integration;
- custom development;
- special support;
- term/fees;
- material scope.

Change-order flow:

```text
change requested
→ scope clarified
→ cost/timing/security/data impact assessed
→ commercial approval
→ customer acceptance
→ implementation scheduled
→ billing updated
→ entitlement/configuration updated
→ delivery accepted
→ record archived with original contract
```

# B. SaaS Service Documents

## SLA

SLA should define measurable service commitments rather than marketing language. Typical fields:

- service covered;
- availability metric;
- measurement period;
- exclusions;
- planned/emergency maintenance;
- incident severity classification;
- response/update targets;
- customer notification process;
- service credits if offered;
- claim process;
- sole-remedy language if professionally approved.

### Availability evidence

If FLOW promises uptime, retain monitoring evidence and incident exclusions sufficient to calculate the metric consistently.

## Support Policy

Support policy should define:

- support channels;
- support hours/time zone;
- authorized contacts;
- severity levels;
- standard response expectations;
- what counts as bug vs configuration vs training vs custom work;
- escalation route;
- unsupported versions/devices where relevant.

## Maintenance Policy

Define:

- routine maintenance;
- advance notice target;
- emergency maintenance;
- customer impact communication;
- maintenance exclusions from SLA if applicable;
- release rollback/escalation process.

## Pilot / Beta

Pilot agreements should explicitly state that the customer is testing an evolving service. Define:

- pilot objective;
- branch/location;
- duration;
- supported workflows;
- features excluded or experimental;
- who verifies business-critical outputs;
- fallback manual process;
- data permitted;
- pricing/free status;
- support channel;
- feedback rights;
- conversion to production terms;
- early exit.

## Cancellation / Refund

Policy must connect commercial, payment, accounting, and data consequences:

```text
request
→ contractual eligibility
→ service usage/status check
→ approval
→ billing adjustment
→ payment refund if owed
→ tax/accounting document correction
→ access change
→ customer notification
→ evidence archive
```

# C. Renewal, Suspension, Termination

## Renewal

Maintain renewal register with:

- customer;
- contract/order;
- renewal date;
- notice window;
- current price;
- renewal price;
- open disputes/balance;
- responsible account owner;
- notice sent date;
- outcome.

## Suspension

Suspension must be tied to contractual authority. Reasons may include serious security risk, unlawful use, non-payment, account compromise, or material breach. Document:

- trigger;
- evidence;
- internal approval;
- customer notice;
- scope of suspension;
- data/access state;
- restoration criteria;
- restoration event.

## Termination

Termination workflow:

```text
notice/breach event
→ contractual notice and cure analysis
→ legal/business approval
→ customer communication
→ final billing/refund
→ disable renewal
→ data export window
→ access revocation
→ integration/API revocation
→ retention/deletion schedule
→ final confirmation
→ archive
```

# D. Vendor Contracts

## Vendor onboarding

Before committing:

- identify legal vendor;
- collect quotation/pricing;
- review service scope;
- check auto-renewal;
- confirm governing terms;
- confirm data/security access;
- review DPA/subprocessor terms where applicable;
- verify payment/bank details;
- assign internal owner;
- register renewal and cancellation deadline.

## Vendor agreement risk checklist

- auto-renewal and cancellation window;
- fee increases;
- usage/overage charges;
- data ownership/export;
- deletion after termination;
- confidentiality;
- security commitments;
- outage/support obligations;
- IP rights;
- subcontractors;
- cross-border processing;
- liability limits;
- unilateral term changes;
- termination assistance.

## Purchase Order

PO should connect approved spend to vendor invoice. Typical fields:

- PO number;
- vendor;
- requester;
- cost center/project;
- description;
- quantity;
- price;
- tax;
- delivery/service period;
- contract reference;
- approver.

# E. Partner Agreements

## Referral

Define lead qualification, referral registration, commission trigger, payment timing, refund/clawback treatment, customer ownership, prohibited representations, and confidentiality.

## Reseller

Define whether reseller purchases/resells or merely introduces. Clarify:

- authority to quote;
- branding;
- territory;
- discount/margin;
- customer contract structure;
- collections;
- taxes;
- implementation/support;
- data access;
- renewal;
- termination/customer transition.

## Implementation Partner

Define onboarding/configuration responsibility, training, access controls, data handling, acceptance, support handoff, and liability boundaries.

## Integration Partner

Define API rights, credentials, security, data fields, availability dependencies, incident contact, branding, version changes, and termination/revocation.

## Revenue Sharing

Revenue share requires precise definition of:

- gross/net revenue base;
- excluded taxes/refunds/fees;
- earning event;
- reporting period;
- settlement date;
- audit rights;
- clawbacks;
- termination tail.

# F. Contract Approval Flow

```text
Business need
→ approved template selected
→ commercial variables prepared
→ deviations identified
→ finance/privacy/security/product review where impacted
→ legal review where required
→ approval authority check
→ signature
→ executed copy validated
→ contract register updated
→ obligations calendar created
→ billing/implementation activated
```

# G. External contacts

- customer legal/procurement/finance/security teams;
- external lawyer;
- accountant/tax adviser for tax clauses;
- payment provider;
- cloud/vendor account team;
- partner/reseller contacts.

# H. Common failure modes

- signed Order Form references wrong MSA version;
- custom promise exists only in sales chat;
- support promises conflict with actual staffing;
- auto-renewal missed on vendor contract;
- customer cancellation processed operationally but billing continues;
- DPA missing while production customer data is processed;
- reseller promises pricing/features without authority;
- contract terminated but API keys remain active;
- refund processed but invoice/tax records not corrected.
