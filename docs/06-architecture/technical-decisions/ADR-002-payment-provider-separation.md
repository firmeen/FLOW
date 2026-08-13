---
title: "ADR-002: Separate SaaS Billing and Merchant Payments"
document_id: FLOW-ADR-002
status: proposed
owner: Architecture
last_reviewed: 2026-08-13
---

# ADR-002: Separate SaaS Billing and Merchant Payments

## Status

Proposed — Finance, Legal, Security และ Architecture approval required

## Context

FLOW มีเงินสองวัตถุประสงค์ที่ต่างกัน

1. ร้านจ่ายค่าสมาชิกให้ FLOW
2. ลูกค้าจ่ายค่าสินค้า/บริการให้ร้าน

หากใช้ Account/Ledger/Settlement path ร่วมกัน จะเกิดความสับสนเรื่องผู้ขาย ผู้รับเงิน Refund, Dispute, Tax, Reconciliation, Tenant isolation และ Entitlement

## Decision

- ใช้ Stripe Billing ภายใต้ FLOW account สำหรับ SaaS subscription/invoice
- ใช้ Omise/Opn ภายใต้ Merchant-owned account หรือ approved PayFac submerchant model สำหรับ Customer-to-merchant payments
- แยก Credential, Webhook endpoint, Database schema, Permission, Ledger, Reconciliation และ Operations runbook
- Card เป็น Auto-renewal baseline ของ SaaS; PromptPay ใช้ manual/send-invoice flow
- Stripe Connect ถูกเลื่อนออกจาก MVP และต้องมี ADR/Legal review แยก
- FLOW ไม่ถือ/รวมเงินของหลายร้านแล้วโอนต่อเองโดยไม่มี approved platform contract

## Consequences

### Positive

- อธิบาย ownership และเงินแต่ละก้อนได้ชัด
- ลด blast radius ของ credential/webhook/account issue
- Tenant merchant refund/reconciliation ไม่ปะปน FLOW subscription
- Provider capability ตรงกับ Thailand merchant checkout strategy

### Trade-offs

- ต้องดูแล Integration และ Reconciliation 2 ชุด
- Customer/merchant support ต้องรู้ว่า Case อยู่ Billing หรือ Merchant context
- Dashboard กลางต้องรวม Projection โดยไม่รวม Ledger
- Merchant onboarding/capability อาจต่างกันแต่ละ Tenant

## Required controls

- Provider-neutral status + strict Adapter mapping
- Unique event/idempotency and verified webhook
- Amount/currency/merchant/business-reference verification
- Direct Merchant settlement ตาม Contract
- Restricted refund/credential/settlement permission
- Daily/defined reconciliation and incident ownership
- Separate Test/Live environments

## Revisit triggers

- FLOW ต้องแบ่งเงิน Tip/Commission/Payout หลายฝ่าย
- Merchant ต้อง onboarding ผ่าน Platform เดียว
- Provider coverage/fee/reliability เปลี่ยนอย่างมีนัยสำคัญ
- Cross-border/currency requirement
- Legal/Tax/Compliance requirement เปลี่ยน

การ Revisit ไม่ได้แปลว่าต้องรวม Provider แต่ต้องทำ Decision record ใหม่พร้อม migration/reconciliation plan

## Related documents

- [Payment Architecture](../payment-architecture.md)
- [Data Model](../data-model.md)
- [Architecture Security](../security.md)
