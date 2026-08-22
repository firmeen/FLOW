# Payment Providers

Controls legal/commercial onboarding, KYC, fees, settlement, credentials ownership, support contacts, and termination for gateways, acquirers, banks, or other payment providers used by FLOW or its merchants.

## Provider file
Agreement/terms, KYC approval, legal merchant/platform identity, settlement bank-account reference, fee schedule, reserve/holdback terms, settlement cycle, supported methods/currencies, refund/void/chargeback rules, security/PCI allocation where relevant, credential-owner reference, technical docs/version, escalation contacts, and termination/export procedure.

## Workflow
```text
Payment need → provider/model assessment → legal/commercial/security/privacy/accounting review → KYC → account approval → test credentials → integration verification → live approval → reconciliation controls → periodic contract/KYC review → termination/offboarding
```

## Boundary
Actual credentials, secret keys, bank details, KYC identity documents, and provider-confidential material do not belong in Git.