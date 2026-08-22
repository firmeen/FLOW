# Audit Trails

Defines business events that require append-only or tamper-resistant history and the metadata needed to reconstruct who changed what and why.

## High-risk events
Role/permission changes, privileged access, bank/payment configuration, invoice/credit/refund actions, manual payment verification, customer contract status, approval overrides, export of sensitive data, deletion/rights requests, provider credentials/configuration, and destructive administrative actions.

## Event fields
Event ID, timestamp/time zone, actor/service identity, tenant/business/branch context, action, target record, prior/new value or change summary, reason/approval reference, source IP/device/session where appropriate, request/idempotency/correlation ID, and related incident/case.

## Controls
Ordinary users cannot rewrite their own audit history; logs have defined retention/access; clocks are synchronized; sensitive payloads are minimized; monitoring links critical events to alerts/investigations.

## Validation
Periodically test that expected high-risk actions actually produce usable audit events and that retrieval works for investigations.