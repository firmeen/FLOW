# Payment Provider Contacts & Escalation

Maintains current commercial, technical, incident, fraud/dispute, finance/settlement, and KYC/compliance escalation paths.

## Contact matrix fields
Provider, function/team, contact name/role where appropriate, channel, support portal/account reference, service hours, severity/escalation path, backup contact, contractual response path, and last verified date. Sensitive personal contact details should be stored in the appropriate restricted directory/system.

## Use cases
Production outage, webhook/API failure, settlement mismatch, missing payout, fraud alert, chargeback deadline, KYC hold, account suspension, refund failure, credential compromise, or contract escalation.

## Control rule
Incident and reconciliation records should capture provider ticket/case IDs so later evidence can link the internal decision to the provider's response.