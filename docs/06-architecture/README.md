---
title: FLOW Architecture
document_id: FLOW-ARCH-INDEX
status: proposed
owner: Architecture
last_reviewed: 2026-08-13
source_of_truth: true
---

# FLOW Architecture

เอกสารชุดนี้กำหนด Target Architecture ของ FLOW ตั้งแต่ System boundary, Technology stack, Multi-tenant data model, Payment separation และ Security controls เพื่อให้ Product, Engineering, Security, Finance และ Operations ใช้ Contract เดียวกัน

> Architecture นี้เป็น Target baseline สำหรับการพัฒนา ไม่ใช่คำยืนยันว่า Capability ทั้งหมดเปิดใช้งานแล้ว Implementation status ต้องตรวจจาก Source code, Environment และ Release record เสมอ

## Document map

| เอกสาร | Source of truth สำหรับ | ผู้อนุมัติหลัก |
|---|---|---|
| [System Context](system-context.md) | Actor, External system, Trust boundary และ Data flow ระดับระบบ | Product + Architecture + Security |
| [Application Architecture](application-architecture.md) | Technology stack, Runtime, Module boundary และ Implementation gate | Architecture + Engineering |
| [Payment Architecture](payment-architecture.md) | Stripe/Omise boundary, Payment flow, Ledger, Webhook, Refund และ Go-live gate | Finance + Architecture + Security |
| [Data Model](data-model.md) | Tenant isolation, Entity ownership, Payment schemas, RLS และ retention | Data + Architecture + Security |
| [Architecture Security](security.md) | Authentication, Authorization, Secret, PCI scope, Privacy และ incident control | Security + Architecture |
| [ADR-001: Technology Stack](technical-decisions/ADR-001-technology-stack.md) | เหตุผลและผลกระทบของ Stack ที่เลือก | Architecture |
| [ADR-002: Payment Separation](technical-decisions/ADR-002-payment-provider-separation.md) | การแยก FLOW Billing ออกจากเงินของร้าน | Finance + Architecture + Legal |

## Architecture principles

1. **Tenant isolation by default** — ทุก Domain record ต้องมี Tenant ownership ที่ตรวจได้ทั้ง Application และ Database
2. **One identity authority** — Auth.js เป็น Identity/Session authority; ไม่เปิดระบบ Login คู่ขนานโดยไม่มี ADR
3. **Server-mediated domain access** — Browser ไม่เข้าถึง Domain table หรือ Payment secret โดยตรง
4. **Payment-purpose separation** — เงินที่ร้านจ่ายให้ FLOW และเงินที่ลูกค้าจ่ายให้ร้านใช้ Provider account, Credential, Webhook และ Ledger คนละชุด
5. **Provider event is evidence, not business command** — Webhook ต้อง Verify, Deduplicate และ Map เข้าสู่ State machine ก่อนเปลี่ยน Entitlement หรือ Order
6. **Configuration before duplication** — FoodFlow, CareFlow และ JobFlow ใช้ Shared Foundation แต่รักษา Domain rule, Workflow และ Sensitive Data boundary ของตน
7. **Version every operational contract** — Bundle, Topic, Workflow, Price, Permission และ Entitlement ที่ Published ต้องมี Version และ Effective date
8. **No hidden implementation claim** — เอกสารต้องแยก Target, Implemented, Tested และ Production-enabled ออกจากกัน

## Decision hierarchy

เมื่อเอกสารขัดกัน ให้ใช้ลำดับดังนี้

1. กฎหมาย, Provider contract, Security policy และข้อกำหนดด้านข้อมูล
2. Accepted Architecture Decision Record
3. เอกสารใน Architecture hub นี้
4. Product Dependency/Workflow contract
5. PRD, API contract และ Implementation detail

การเปลี่ยน Provider, Identity authority, Tenant model, Settlement ownership หรือ Deployment target ต้องเพิ่ม/แก้ ADR และปรับเอกสารที่ได้รับผลกระทบใน Pull Request เดียวกัน

## Delivery gates

| Gate | หลักฐานขั้นต่ำ |
|---|---|
| Architecture approved | ADR, System context และ Data ownership ได้รับการยืนยัน |
| Development ready | Environment contract, Schema migration, API contract และ Threat model พร้อม |
| Sandbox ready | Provider test account, Webhook verification, Idempotency และ failure-path tests ผ่าน |
| Pilot ready | Tenant/RBAC/RLS tests, Reconciliation, Refund และ Operations runbook ผ่าน |
| Production ready | KYC/merchant activation, Live credentials, Monitoring, Incident owner, Backup/restore และ legal review ผ่าน |

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Auth.js](https://authjs.dev/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Stripe Billing](https://docs.stripe.com/billing)
- [Omise Thailand pricing and payment methods](https://www.omise.co/en/pricing/thailand)
