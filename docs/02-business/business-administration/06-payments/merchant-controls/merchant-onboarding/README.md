# Merchant Payment Onboarding

Controls setup of a customer business/branch for payment acceptance without mixing merchant identity, payout ownership, or provider environments.

## Intake
Merchant legal/business name, branch, provider merchant/account ID, KYC status, payout-bank ownership verification, enabled methods, service/product context, fee/commission terms, refund authority, support/escalation contacts, test/live status, and authorized merchant admins.

## Workflow
```text
Request → provider/KYC status → merchant identity match → payout account verification → payment responsibility confirmation → configure methods/permissions → test payment/refund/webhook → settlement/reconciliation test → activation approval → live monitoring
```

## Change controls
Bank-account, legal-entity, admin, fee, provider-account, or environment changes require re-verification appropriate to risk; do not allow a simple UI edit to redirect settlement.