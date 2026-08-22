# Terms of Service

Controls standard self-service/customer terms and the evidence that a specific account accepted a specific version.

## Acceptance evidence
Account/user identity, legal/business customer context if known, terms version, exact acceptance text, event timestamp, acceptance method, source/session/audit reference, and immutable copy/hash/reference to accepted terms.

## Activation flow
```text
Account/signup → current required terms resolved → terms displayed → explicit acceptance → event recorded → accepted version frozen → subscription/service activated
```

## Change flow
New version approved → affected cohort identified → effective date → notice method → legal/contract review of re-acceptance need → rollout → acceptance/notice evidence → previous version archived.

## Control rule
A footer link alone is not equivalent to explicit acceptance where FLOW relies on affirmative contractual consent.