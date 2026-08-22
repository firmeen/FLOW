# 08 — Workflows & Templates

This group turns the document library into executable business processes. It contains end-to-end document flows, reusable templates, and checklists for recurring or high-risk business events.

## Substructure

```text
08-workflows-templates/
├── end-to-end-flows/
│   ├── company-formation/
│   ├── customer-quote-to-cash/
│   ├── vendor-purchase-to-pay/
│   ├── employee-hire-to-exit/
│   ├── contractor-engagement/
│   ├── tax-filing/
│   ├── refund/
│   ├── payment-dispute/
│   └── customer-termination/
├── templates/
│   ├── contracts/
│   ├── finance/
│   ├── tax/
│   ├── corporate/
│   ├── hr/
│   ├── privacy/
│   └── operations/
└── checklists/
    ├── incorporation/
    ├── customer-onboarding/
    ├── vendor-onboarding/
    ├── employee-onboarding/
    ├── contractor-onboarding/
    ├── month-end/
    ├── year-end/
    └── termination-offboarding/
```

# A. End-to-end flow standard

Every workflow should show:

1. trigger;
2. responsible owner;
3. inputs;
4. decisions/approvals;
5. documents created;
6. external contacts;
7. money/accounting/tax consequences;
8. privacy/security consequences;
9. system changes;
10. evidence retained;
11. completion criteria;
12. exception/escalation paths.

# B. Company formation flow

```text
Founders decide operating structure
→ legal/accounting consultation as needed
→ name/entity/capital/director/shareholder/objective decisions
→ incorporation documents prepared
→ signatures and submission
→ DBD registration
→ corporate master record created
→ tax/accounting setup
→ bank account/KYC
→ IP/domain/account ownership migrated to company as appropriate
→ customer/vendor/payment-provider identity updated
→ compliance calendar activated
```

Completion evidence should include current company documents, authority matrix, bank/accounting setup, tax status, IP ownership path, and register entries.

# C. Customer Quote-to-Cash

```text
lead qualified
→ customer legal/billing details verified
→ quotation approved and issued
→ contract/MSA/Terms selected
→ Order Form prepared
→ DPA/security schedule assessed if needed
→ customer signatures/acceptance
→ contract register updated
→ workspace/onboarding begins
→ billing trigger reached
→ invoice issued
→ accounts receivable created
→ payment received/provider confirms
→ withholding difference identified where applicable
→ receipt/tax document issued as applicable
→ bank/provider reconciliation
→ accounting/tax records updated
→ renewal date monitored
```

Exception paths should cover scope change, disputed invoice, partial payment, WHT mismatch, failed payment, refund, cancellation, and customer data termination.

# D. Vendor Purchase-to-Pay

```text
need identified
→ budget/authority check
→ vendor quotation/selection
→ vendor legal/security/privacy review as needed
→ contract/PO approval
→ service/product delivered
→ receiving/acceptance evidence
→ invoice received
→ tax/WHT check
→ payment voucher/approval
→ payment released
→ certificate/filing where applicable
→ accounting entry
→ bank reconciliation
→ vendor renewal tracked
```

No payment should rely solely on “someone said it is okay in chat” for material spend.

# E. Employee Hire-to-Exit

```text
headcount/budget approved
→ candidate selected
→ offer/employment agreement
→ privacy/confidentiality/IP documents
→ payroll/tax/statutory onboarding
→ account/device provisioning
→ policy acknowledgements
→ employment changes documented
→ payroll cycles
→ resignation/termination event
→ final payroll/statutory action
→ property/work handover
→ access revocation
→ customer/vendor reassignment
→ personnel archive
```

# F. Contractor Engagement

```text
need/scope approved
→ contractor selected
→ contractor agreement + SOW
→ NDA/IP/security terms
→ limited access provisioned
→ milestones worked
→ acceptance evidence
→ invoice
→ WHT/payment process
→ final handover
→ access revocation
→ IP/source/document completeness check
→ engagement archive
```

# G. Tax Filing Workflow

```text
period closes
→ source documents complete
→ ledgers reconciled
→ VAT/WHT/CIT/payroll tax inputs prepared as applicable
→ exceptions resolved
→ accountant/tax preparer calculates
→ reviewer approves
→ return filed
→ tax paid/refund tracked
→ filing/payment receipt archived
→ reconciliation posted
→ compliance calendar marked complete
```

Every filing should connect to the underlying accounting reconciliation, not only the submitted form.

# H. Refund Flow

```text
request/event
→ customer/order/payment identified
→ contractual eligibility checked
→ amount available to refund verified
→ operational/finance approval
→ provider/bank refund
→ provider reference captured
→ customer notified
→ invoice/credit/tax treatment handled
→ accounting updated
→ settlement/bank reconciled
→ case closed
```

# I. Payment Dispute Flow

```text
chargeback/dispute notice
→ deadline logged
→ payment/order/customer evidence collected
→ contract/terms acceptance evidence collected
→ delivery/service evidence collected
→ response prepared/reviewed
→ provider submission
→ outcome recorded
→ fee/loss/accounting treatment
→ fraud/process corrective action
```

# J. Customer Termination

```text
customer notice / breach / non-renewal
→ notice/cure rules checked
→ termination authority approved
→ future billing/renewal stopped
→ final invoice/refund/credits
→ outstanding balance resolved
→ export window communicated
→ access disabled
→ API/integration credentials revoked
→ service data retention/deletion scheduled
→ records retained for accounting/legal/security purposes separated
→ subprocessors/backups follow retention rules
→ termination confirmation
→ contract/customer archive
```

# K. Template design standard

Every template should include metadata and instructions explaining which fields are mandatory, which are negotiable, when legal/accounting review is required, and which downstream registers/processes must be updated after execution.

A template should not merely contain blank legal text. It should explain how to use it operationally.

# L. Checklist design standard

Checklist items should be objectively completable. Prefer:

```text
- Confirm current company certificate obtained within required freshness window.
- Confirm signatory authority matches agreement signature block.
- Record executed agreement in contract register.
```

Avoid vague items such as “check legal stuff.”

# M. Completion gates

A workflow is not complete because the main transaction happened. Examples:

- Customer paid ≠ completed until payment is reconciled and accounting/tax evidence is handled.
- Contractor finished coding ≠ completed until source/docs/IP/access handover is complete.
- Employee left ≠ completed until payroll/property/access are closed.
- Contract terminated ≠ completed until billing, access, data, and archive actions are completed.
- Tax return filed ≠ completed until payment and evidence are reconciled.
