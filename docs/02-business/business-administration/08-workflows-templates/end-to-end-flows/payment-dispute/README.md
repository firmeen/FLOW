# Payment Dispute / Chargeback — End-to-End Flow

Controls provider dispute deadlines, evidence collection, submission, financial impact, and corrective action.

## Flow
```text
Provider dispute/chargeback notice
→ case + deadline registered
→ payment/order/customer/merchant identified
→ terms/acceptance evidence
→ service/delivery/refund/communication evidence
→ fraud/risk context
→ response strategy/draft
→ operations/finance/legal review as needed
→ provider submission + receipt
→ outcome
→ fee/loss/settlement/accounting treatment
→ customer/merchant handling if needed
→ fraud/process corrective action
→ archive
```

## Completion gate
Close only after the provider outcome and bank/settlement/accounting consequences are reconciled and any security/fraud/process remediation has an owner.