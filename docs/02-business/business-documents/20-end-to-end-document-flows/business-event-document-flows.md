# End-to-End Business Event Document Flows

## Purpose
This file connects the separate document families into real operating scenarios. The goal is to make it obvious which documents are created, reviewed, signed, filed, paid, reconciled, and archived at each stage.

---

# 1. First paying SaaS customer

```text
Lead qualified
→ commercial requirements collected
→ quotation prepared
→ internal price/scope approval
→ MSA / Terms selected
→ Order Form prepared
→ DPA/privacy/security documents reviewed
→ customer negotiation
→ authorized signatures / acceptance
→ contract register updated
→ billing schedule created
→ onboarding plan created
→ workspace/branch entitlement provisioned
→ invoice issued
→ AR recorded
→ customer payment received
→ payment/WHT matched
→ receipt/tax documents issued as applicable
→ accounting posted
→ bank/provider reconciliation
→ support/SLA operation
→ renewal monitoring
→ termination/export/deletion when relationship ends
```

### Contact chain
- Sales ↔ customer owner/procurement.
- Finance ↔ customer AP/billing contact.
- Legal ↔ customer legal/procurement for non-standard terms.
- Privacy/Security ↔ customer IT/privacy contacts.
- Operations ↔ store/branch implementation contact.

### Critical connections
Quotation amount must equal Order Form/billing configuration unless approved change exists. Billing entity must equal contracting entity. DPA and service scope must reflect actual systems used.

---

# 2. Customer adds another branch

```text
Customer request
→ Sales/Operations verify requirement
→ pricing/entitlement impact
→ Change Order / new Order Form
→ authorized acceptance
→ contract register amendment
→ billing schedule change
→ branch provisioning
→ implementation/onboarding
→ next invoice verification
→ accounting/reconciliation
```

Do not simply enable the branch in software with no commercial document if it changes contractual scope or price.

---

# 3. Customer becomes overdue

```text
Invoice due
→ AR aging identifies overdue
→ reminder
→ finance/customer contact
→ determine dispute vs payment delay
→ contractual grace/suspension rule checked
→ suspension warning where applicable
→ authorized suspension
→ payment received / dispute resolved
→ allocation and WHT check
→ restore service
→ reconciliation
```

If disputed, preserve customer correspondence and escalation decision.

---

# 4. Customer requests cancellation

```text
Notice received
→ verify sender authority
→ contract notice/renewal terms checked
→ effective termination date confirmed
→ stop future renewal
→ calculate final charges/refunds/credits
→ final financial documents
→ settle outstanding balance
→ export request/window
→ revoke service access
→ terminate integrations
→ execute retention/deletion schedule
→ final confirmation
→ contract register closes
→ archive evidence
```

Billing cancellation and data deletion are separate workstreams and must both complete.

---

# 5. Hiring an employee

```text
Role approved
→ compensation approved
→ offer
→ employment agreement
→ privacy/policy/IP acknowledgements
→ payroll/statutory setup
→ equipment assignment
→ access approval
→ onboarding
→ monthly payroll evidence
→ employment changes documented
→ exit event
→ final payroll
→ handover
→ equipment return
→ access revocation
→ archive personnel record
```

---

# 6. Hiring a freelance developer

```text
Need approved
→ contractor selected
→ Contractor Agreement
→ SOW
→ NDA/IP/security requirements
→ least-privilege access
→ work through tracked repo/issues/PRs
→ milestone review
→ acceptance evidence
→ invoice
→ WHT/tax review
→ payment
→ accounting/reconciliation
→ final source/docs/credential handover
→ access revoked
→ archive
```

Payment must not be the only acceptance evidence.

---

# 7. Buying a cloud/SaaS tool

```text
Need identified
→ vendor/security/privacy classification
→ plan/price approval
→ contract/terms/DPA review
→ corporate account/admin setup
→ payment method
→ recurring invoice collection
→ accounting/tax treatment
→ monthly reconciliation
→ renewal review
→ cancel/export/delete/revoke when retired
```

---

# 8. Paying a Thai vendor with withholding tax

```text
Vendor service/deliverable accepted
→ invoice received
→ payment nature classified
→ accountant confirms WHT treatment
→ gross/WHT/net calculation
→ payment voucher approval
→ net payment
→ WHT certificate
→ filing/remittance
→ accounting entry
→ bank reconciliation
→ packet archived
```

---

# 9. Customer pays FLOW after withholding tax

```text
FLOW invoice issued
→ customer processes payment
→ bank receives net amount
→ finance identifies shortfall as WHT
→ WHT certificate obtained
→ cash + WHT credit matched to invoice
→ AR cleared
→ receipt/tax process
→ accounting/tax file
```

---

# 10. Payment-provider refund

```text
Refund request/correction
→ order/payment verified
→ refund-policy eligibility
→ approval threshold
→ provider refund action
→ provider reference
→ FLOW payment ledger update
→ customer notice
→ credit/tax adjustment if required
→ accounting
→ provider/bank reconciliation
→ case closure
```

---

# 11. Data incident involving customer data

```text
Alert/report
→ security incident opened
→ contain/preserve evidence
→ affected tenant/data assessed
→ controller/processor role determined
→ legal/privacy contractual notification analysis
→ customer controller notified where required
→ regulatory/data-subject notification assessment
→ remediation
→ root-cause/corrective action
→ incident and breach registers updated
→ contractual/SLA impact reviewed
→ evidence retained
```

Do not let engineering close the technical incident before legal/privacy obligations are assessed.

---

# 12. Founder transfers pre-company software into company

```text
Identify founder-created assets
→ ownership/source evidence gathered
→ IP/asset schedule prepared
→ legal/accounting treatment reviewed
→ assignment/transfer documents signed
→ repository/domain/design ownership updated where appropriate
→ accounting/corporate records updated if required
→ IP register updated
→ transfer packet archived
```

---

# 13. Investment round

```text
Term discussion
→ due diligence data room
→ cap table/legal records verified
→ investment/share documents
→ board/shareholder approvals
→ execution
→ funds received
→ statutory/corporate filing updates
→ accounting
→ cap table update
→ investor rights/register updates
→ complete closing binder archived
```

---

# 14. Director or signing-authority change

```text
Decision/approval
→ required corporate resolution
→ DBD/corporate filing
→ obtain new current documents
→ bank signatory changes
→ payment-provider KYC update
→ tax/accounting/vendor/customer KYC updates where needed
→ contract signature authority matrix updated
→ old access revoked
→ corporate CURRENT/HISTORY folders updated
```

---

# 15. Business document completeness test
For any event above, FLOW should be able to answer:

1. What triggered the event?
2. Who had authority?
3. What document established the obligation?
4. What was delivered/changed?
5. What money moved?
6. What accounting entry resulted?
7. What tax treatment/evidence applied?
8. What personal/confidential data was involved?
9. What approvals/logs prove execution?
10. What records must remain after the event closes?

If one of these answers cannot be reconstructed, the document system still has a control gap.
