# End-to-End Business Document Flows

These flows are the operational backbone of the FLOW business document system. They show how one business event creates multiple linked documents across legal, finance, accounting, tax, privacy, security, payments, and records management.

## 1. Customer Quote-to-Cash

```text
Customer interest
→ legal/billing identity collected
→ quotation prepared and approved
→ MSA/Terms selected
→ Order Form prepared
→ DPA/SLA/security schedules added if required
→ signature/acceptance evidence stored
→ customer contract register created/updated
→ onboarding/go-live prerequisites completed
→ billing trigger reached
→ invoice generated
→ AR opened
→ payment received or provider confirms
→ WHT difference identified if applicable
→ receipt/tax document issued where applicable
→ accounting entry posted
→ bank/payment-provider reconciliation completed
→ renewal date/notice window scheduled
```

### Exception branches

- quotation revised;
- customer requires procurement PO;
- customer rejects standard clause;
- partial payment;
- payment gateway settlement mismatch;
- customer withholding certificate missing;
- invoice disputed;
- refund/credit note;
- scope changed after signing;
- termination before end of term.

## 2. Vendor Purchase-to-Pay

```text
Business need
→ budget/authority approval
→ vendor due diligence
→ quote/contract/PO
→ vendor/security/privacy review if needed
→ service delivered
→ acceptance/receiving record
→ vendor invoice received
→ tax invoice/WHT review
→ payment voucher
→ payment approval
→ net payment
→ WHT certificate/filing if applicable
→ accounting/AP close
→ bank reconciliation
→ renewal/cancellation monitoring
```

## 3. Company Incorporation

```text
Founder decision
→ entity/name/capital/shareholder/director/objective planning
→ adviser/accountant/legal input as needed
→ incorporation documents
→ signatures
→ DBD submission
→ registration completion
→ corporate certificate/master record
→ tax/accounting setup
→ bank account
→ domain/cloud/IP ownership alignment
→ payment provider KYC
→ invoice/contract template entity details updated
→ compliance calendar activated
```

## 4. Capital / Investment Round

```text
investment discussion
→ term sheet / principal terms
→ legal and financial due diligence
→ cap-table modeling
→ corporate approval path
→ investment/subscription/shareholder documents
→ conditions precedent satisfied
→ funds received
→ shares issued / registers updated
→ statutory filing where required
→ cap table finalized
→ accounting recorded
→ investor reporting obligations calendared
→ executed data room archived
```

## 5. Employee Hire-to-Exit

```text
headcount approved
→ offer
→ employment agreement
→ job description
→ privacy/confidentiality/IP documents
→ payroll/statutory onboarding
→ device/access provisioning
→ policy acknowledgements
→ employment changes documented
→ payroll cycles
→ resignation/termination
→ final payroll
→ property/work handover
→ access revocation
→ customer/vendor responsibility transfer
→ personnel record archive
```

## 6. Contractor Engagement

```text
scope approved
→ contractor selected
→ contractor agreement
→ SOW
→ NDA/IP/security requirements
→ access provisioned
→ milestone delivery
→ acceptance evidence
→ invoice
→ WHT/payment approval
→ payment
→ final source/docs/credential handover
→ access revocation
→ IP completeness check
→ engagement archive
```

## 7. Tax Filing

```text
period closes
→ source documents collected
→ bank/provider/AR/AP reconciled
→ tax registers prepared
→ exceptions resolved
→ accountant prepares return
→ reviewer approves
→ filing submitted
→ payment completed
→ accounting tax control account reconciled
→ filing/payment evidence archived
```

## 8. Refund

```text
refund request/event
→ customer/order/payment identified
→ contract/policy eligibility
→ refundable amount verified
→ business approval
→ payment provider/bank action
→ provider reference captured
→ customer notified
→ credit/tax adjustment evaluated
→ accounting updated
→ settlement/bank reconciled
→ case closed
```

## 9. Chargeback / Payment Dispute

```text
provider dispute notice
→ deadline registered
→ payment/order evidence collected
→ terms/acceptance evidence collected
→ delivery/service evidence collected
→ response reviewed
→ provider submission
→ outcome
→ accounting/fee/loss treatment
→ fraud/process review
→ archive
```

## 10. Customer Termination

```text
notice/breach/non-renewal
→ contract clause and notice window checked
→ approval
→ termination effective date confirmed
→ future billing stopped
→ final invoice/credit/refund
→ outstanding balance handled
→ export period
→ access disabled
→ API/integration credentials revoked
→ retention/deletion workflow
→ subprocessors/backups handled
→ final notice
→ register closed/archive
```

## 11. Data Incident

```text
alert/report
→ incident triage
→ contain
→ preserve evidence
→ determine affected systems/data
→ controller/processor role analysis
→ customer/DPA notice obligations
→ regulatory assessment
→ communications approval
→ remediation/restoration
→ postmortem
→ corrective actions
→ evidence retention
```

## 12. Bank Account Change

```text
need/change approved
→ corporate authority/resolution if required
→ bank KYC/change process
→ authorized users/signatories configured
→ accounting ledger updated
→ payment templates changed
→ customer/vendor instructions changed if relevant
→ payment providers settlement account changed under verification
→ first transactions monitored
→ old account closed or retained per plan
→ final reconciliation/archive
```

## 13. Customer Price Change

```text
new pricing approved
→ affected customer cohort identified
→ contractual change/notice rules checked
→ finance billing configuration prepared
→ customer notice/amendment/order form as required
→ effective date controlled
→ first invoice QA
→ AR/revenue reporting validated
→ communication evidence archived
```

## 14. Vendor Termination

```text
business owner decides to retire vendor
→ contract cancellation deadline/fees checked
→ replacement/export plan
→ data export
→ API/integration migration
→ account cancellation
→ vendor confirms deletion where required
→ recurring payment disabled
→ final invoice paid/reconciled
→ credentials revoked
→ vendor/subprocessor register updated
→ archive
```

## 15. Policy Change

```text
trigger identified
→ owner drafts revision
→ affected operations/contracts assessed
→ legal/accounting/privacy/security review where needed
→ approval
→ new version/effective date
→ staff/customer notice or acknowledgement as required
→ training/control updates
→ old version superseded and archived
→ review date registered
```

## Flow completion rule

An event is not complete at its most visible step. It is complete only when all downstream consequences are resolved.

Examples:

- Signed contract is not complete until register, billing, onboarding, and obligations are activated.
- Customer payment is not complete until reconciliation and accounting/tax handling are done.
- Employee exit is not complete until access and property are closed.
- Refund is not complete until provider settlement and accounting/tax adjustments reconcile.
- Vendor cancellation is not complete until data/access/payment obligations are closed.
