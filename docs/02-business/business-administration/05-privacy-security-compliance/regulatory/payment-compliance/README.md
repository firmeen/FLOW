# Payment Compliance

Controls the assessment of FLOW's legal/regulatory/payment-role boundary as payment functionality evolves.

## Questions to document
Who is merchant of record; whose bank account receives settlement; who performs KYC; who controls refunds/chargebacks; what payment/card/account data FLOW receives or stores; whether FLOW only transmits technical status or receives/holds/pools/routes funds; who issues tax/receipt documents; and which provider/acquirer terms apply.

## Trigger
New payment method/provider, change from merchant-direct settlement, marketplace/platform payout model, stored value/credit, pooled funds, cross-border payment, new refund/chargeback role, or material provider-contract change.

## Workflow
```text
Proposed payment model → detailed funds/data flow → provider/bank terms → legal/regulatory/accounting/tax/security review → decision/conditions → architecture/configuration → contract/customer disclosure → monitoring/review
```

Do not launch a materially changed money flow based only on technical feasibility.