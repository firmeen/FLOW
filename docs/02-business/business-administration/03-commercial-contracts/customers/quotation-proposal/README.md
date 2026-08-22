# Customer Quotation & Proposal

Controls formal commercial offers before a binding customer order or subscription is finalized.

## Trigger
Create when customer identity, scope/package, price, implementation assumptions, billing basis, and requested start timing are sufficiently understood to make a formal offer.

## Required inputs
Approved price/package, discount authority, customer legal/billing identity, branch/user/device/module quantities where relevant, implementation scope, dependencies, requested start date, subscription/service period, taxes/payment terms, and contract structure.

## Workflow
```text
Opportunity qualified → commercial variables prepared → discount/authority check → delivery feasibility check → finance/tax review if unusual → proposal prepared → internal approval → issue → comments tracked → revision as a new version → accepted/rejected/expired/superseded → linked to order/contract
```

## Evidence
Quotation/proposal ID, version, validity period, issuer/approver, delivery method, customer response, accepted version, related MSA/Order Form, and final status.

## Completion gate
The proposal lifecycle is complete only when its status is explicit and any accepted commercial terms are carried into the binding order/contract and billing configuration.