# Vendors, Procurement and Purchase-to-Pay

## Purpose
This document family governs how FLOW selects, approves, contracts with, receives services from, pays, reviews, renews, and terminates vendors. It covers cloud providers, SaaS tools, consultants, agencies, accounting firms, legal advisers, hardware suppliers, and other business suppliers.

## Vendor onboarding packet
Maintain:
- legal/business identity;
- contact details;
- tax information;
- quotation/proposal;
- contract/order/terms;
- bank details and verification evidence;
- data/privacy/security review where required;
- owner inside FLOW;
- renewal/cancellation terms;
- approved budget/cost center;
- payment terms.

## Vendor classification
Classify by risk, not only spend.

Examples:
- Critical infrastructure vendor: cloud/database/authentication/payment.
- Data processor/subprocessor: holds customer/employee/personal data.
- Financial vendor: accounting/payment/banking.
- Development vendor: accesses source code, environments, credentials.
- Ordinary supplier: low-risk office/equipment/service.

The classification determines review depth.

## Purchase-to-pay workflow

```text
Need identified
→ budget/owner approval
→ vendor/quotation review
→ legal/security/privacy review where relevant
→ PO/SOW/contract executed
→ service/product delivered
→ acceptance evidence
→ vendor invoice received
→ accounting/tax/WHT review
→ payment approval
→ bank/payment execution
→ accounting posting
→ bank reconciliation
→ vendor packet archived
```

## Purchase Order / SOW role
A PO or SOW should identify exactly what is being bought and prevent later disagreement about quantity, deliverable, timeline, acceptance, and price.

## Vendor invoice validation
Before payment check:
- supplier identity;
- invoice number/date;
- contract/PO reference;
- service period;
- amount/currency;
- VAT/tax details as applicable;
- bank details;
- duplicate invoice risk;
- evidence service was received;
- WHT treatment.

## Vendor master changes
Changes to legal name, tax ID, or bank account require controlled verification and update history.

## Recurring SaaS vendor register
Track:
`vendor | service | business owner | admin owner | plan | monthly/annual cost | currency | payment method | renewal date | cancellation notice | data held | contract/DPA | criticality`

## Renewal review
Before automatic renewal ask:
- is the service still used?
- active users?
- duplicate tools?
- current price?
- data still needed?
- security/privacy status changed?
- cheaper/safer plan?
- cancellation/export required?

## Vendor termination

```text
termination decision
→ contractual notice
→ final invoice/payment
→ export required business data
→ transfer admin ownership
→ revoke vendor access to FLOW systems
→ revoke API keys/tokens
→ confirm data deletion/return where applicable
→ cancel auto-renewal/payment method
→ archive termination evidence
```

## Critical vendor outage records
For providers essential to FLOW, retain incident impact and escalation contacts. Contract and SLA should be accessible during outage, not buried in an old email.

## Common failures
- subscription purchased with founder's personal card/account;
- vendor has production credentials but no contract/security review;
- duplicate cloud/SaaS services continue renewing;
- invoice paid before service acceptance;
- vendor bank-change fraud;
- service cancelled but vendor retains customer data or API access.
