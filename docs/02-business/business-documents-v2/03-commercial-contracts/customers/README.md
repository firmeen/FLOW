# Customer Contracting — Detailed Operating Guide

This folder governs the complete legal/commercial lifecycle from a customer receiving an offer until the relationship is renewed, changed, suspended, or terminated.

## Subfolders

```text
customers/
├── quotation-proposal/
├── msa/
├── order-forms/
├── terms-of-service/
├── change-orders/
├── renewal/
├── suspension/
└── termination/
```

# 1. Pre-contract customer identity check

Before preparing a binding agreement, confirm which legal/business person is buying the service. Collect only information necessary for contracting and billing.

Recommended fields:

- legal/company name;
- business/trade name if different;
- registration/tax information where needed;
- branch/head-office status for billing where relevant;
- billing address;
- authorized commercial contact;
- signatory name/title;
- procurement/finance contact;
- billing email;
- technical/security contact for larger customers.

For enterprise customers, verify that the person signing has appropriate authority or that the customer has an internal approval/signing process sufficient for the transaction.

# 2. Quotation / Proposal

## Trigger

Created after package/scope/pricing are sufficiently understood to make a formal commercial offer.

## Inputs

- approved price/package;
- customer identity;
- branches/users/devices/modules;
- implementation requirements;
- requested start date;
- discounts;
- tax/payment terms;
- contract structure.

## Internal flow

```text
Sales prepares
→ pricing/discount authority checked
→ implementation feasibility checked where needed
→ finance/tax wording checked for unusual transaction
→ quotation issued
→ customer comments tracked
→ revised quotation issued as new version
→ accepted quotation linked to contract/order
```

## Completion criteria

Quotation is complete only when accepted, expired, rejected, or superseded and its final status is registered.

# 3. MSA

## Purpose

The MSA establishes reusable legal terms for the relationship. It should not contain every commercial variable that changes each billing cycle.

## Operational ownership

- Commercial owner: Sales/Account Management.
- Template owner: Management/Legal.
- Finance reviewer: billing/tax/payment clauses.
- Privacy/security reviewer: data/security obligations.
- Product/Engineering reviewer: non-standard technical commitments.
- Authorized signatory: according to authority matrix.

## Clause-to-operation mapping

Every material clause should have a business owner. Example:

```text
Billing clause → Finance
Availability/SLA → Operations/Engineering
Data deletion → Privacy/Engineering
Security incident notice → Security/Privacy/Legal
Customer support → Support/Operations
Renewal → Sales/Finance
Suspension → Operations/Management
```

This avoids signing obligations nobody internally owns.

# 4. Order Form

The Order Form should identify exactly what FLOW is obligated to enable and what the customer must pay.

Maintain a structured order record matching the signed file:

```text
Order Form ID
Customer ID
MSA version
Product/package
Branch count
Module entitlements
Start date
Term
Renewal date
Recurring fee
One-time fee
Discount
Billing frequency
Payment term
Special terms
Signed date
```

After signature, entitlement and billing configuration should be checked against this record before go-live.

# 5. Terms of Service

For self-service signup:

```text
account created
→ required terms displayed
→ customer explicitly accepts
→ acceptance event recorded
→ terms version frozen
→ subscription activated
```

When terms change, document effective date, affected cohort, notice method, and whether re-acceptance is required.

# 6. Change Orders

Not every operational change requires a formal amendment, but anything that changes contractual scope, recurring fees, committed deliverables, data/security obligations, or key term should pass through a documented change process.

## Change assessment

```text
Requested change
→ commercial impact
→ technical impact
→ implementation effort
→ security/privacy impact
→ billing/tax impact
→ approval
→ customer acceptance
```

After acceptance update:

- contract register;
- entitlement/configuration;
- billing schedule;
- implementation plan;
- renewal baseline.

# 7. Renewal

Start renewal work before the contractual notice deadline.

## Renewal pack

- current MSA/Order Form;
- renewal/notice clause;
- current usage/package;
- current recurring revenue;
- outstanding invoices;
- open support/service issues;
- planned price change;
- proposed new scope;
- notice draft;
- customer decision.

## Renewal states

```text
UPCOMING
CONTACTED
NEGOTIATING
RENEWED
NON-RENEWAL
TERMINATION IN PROCESS
```

# 8. Suspension

Suspension should be controlled because it can affect customer operations.

Before suspension confirm:

- contractual right;
- reason/evidence;
- severity;
- customer notice requirement;
- whether partial restriction is sufficient;
- data preservation requirements;
- restoration criteria;
- manager/legal approval where appropriate.

## Non-payment example

```text
Invoice overdue
→ reminder
→ formal overdue notice
→ grace period
→ suspension warning
→ approval
→ account restricted
→ customer pays
→ finance reconciles
→ service restored
→ restoration notice
```

# 9. Termination

## Inputs

Termination may arise from customer notice, non-renewal, material breach, insolvency, security abuse, business closure, mutual agreement, or another contractual cause.

## Termination packet

- termination notice;
- contract clause relied upon;
- cure/notice analysis;
- approval;
- effective date;
- outstanding invoices;
- refund/credit calculations;
- customer data export request;
- access revocation plan;
- retention/deletion plan;
- final communications.

## Operational completion

```text
contract terminated
≠ complete
```

Complete only after:

- future billing stopped;
- open invoice/credit handled;
- access disabled;
- API/integration keys revoked;
- customer exports handled;
- service data moved to retention/deletion state;
- legally required business records separated and retained;
- final confirmation sent;
- contract register closed.

# 10. Customer communications evidence

For material notices retain:

- notice content;
- recipient;
- method;
- sent timestamp;
- delivery evidence where available;
- acknowledgement/response;
- linked contract clause/event.

# 11. Contract register minimum fields

```text
Customer
Contract ID
MSA version
Order Form(s)
Effective date
Initial term
Renewal date
Notice deadline
Recurring value
Owner
DPA status
SLA tier
Auto-renewal status
Status
Amendments
Termination date
Storage link
```

# 12. Common failure modes

- wrong legal customer entity in invoice versus contract;
- discount promised indefinitely though approval was temporary;
- order form signed but entitlement not updated;
- non-standard security clause signed without engineering review;
- cancellation email received but renewal flag remains active;
- customer access closed but billing continues;
- contract expired but service continues with no renewal evidence;
- customer data deletion happens before required accounting/legal records are separated.
