# Customer Order Forms

Defines exactly what FLOW must enable for a customer and what the customer must pay under the governing agreement.

## Required structured record
Order Form ID, customer legal entity, MSA/Terms version, product/package, branch/site count, modules/add-ons, users/devices if relevant, implementation/onboarding scope, start date, initial term, renewal date, recurring and one-time fees, discount and expiry, billing frequency, payment terms, special terms, and signed/accepted date.

## Workflow
```text
Approved commercial offer → governing terms confirmed → Order Form prepared → deviations highlighted → finance/product/privacy/security review as impacted → authority/signature check → execution → contract register → entitlement/configuration validation → billing schedule → onboarding/go-live
```

## Validation gate
Before go-live, compare signed commercial variables to actual entitlement, billing, branch configuration, implementation scope, and renewal records. Any mismatch is a controlled exception.