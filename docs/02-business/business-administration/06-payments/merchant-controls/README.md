# Merchant Payment Controls

Controls merchant-facing configuration where FLOW enables payment capabilities for customer businesses/branches.

## Principle
Document who is merchant of record, whose account receives settlement, who controls refunds/chargebacks, who performs KYC, what payment data FLOW handles, and who issues customer-facing receipts/tax documents.

## Configuration record
Merchant/business identity, branch, provider/account reference, payout-account verification status, methods enabled, fee configuration, refund authority, cashier/manager permissions, test/live environment, activation approver, and last review.

## Activation flow
```text
Merchant request → business/KYC/provider account verified → payment responsibility model → configuration → test transactions/webhooks/refunds → reconciliation test → approval → live activation → monitoring
```

A merchant configuration cannot be considered complete without verified settlement ownership and rollback/support contacts.