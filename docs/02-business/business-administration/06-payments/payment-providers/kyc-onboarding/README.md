# Payment Provider KYC & Onboarding

Controls provider due-diligence/KYC submissions and verifies that the approved entity/account matches the intended operating and settlement model.

## Inputs
Current corporate certificate/particulars, directors/signing authority, tax/business information, settlement account ownership, business/model description, website/product information, expected volumes/methods, beneficial-owner/shareholder information where requested, and other provider-required evidence stored securely.

## Workflow
```text
Provider requirements → current corporate/KYC pack → authority verification → secure submission → questions/remediation → provider approval → approved merchant/platform/entity details recorded → settlement account validated → live-enablement gate
```

## Change triggers
Legal name/address/director/ownership change, settlement-account change, business-model change, new product/method/geography, or provider refresh request.

Do not reuse an old founder-personal provider account after the operating entity has changed without a deliberate provider migration.