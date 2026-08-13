---
title: "ADR-001: FLOW Technology Stack"
document_id: FLOW-ADR-001
status: proposed
owner: Architecture
last_reviewed: 2026-08-13
---

# ADR-001: FLOW Technology Stack

## Status

Proposed — ต้องได้รับ Architecture/Engineering approval และ Implementation evidence ก่อนเปลี่ยนเป็น Accepted/Implemented

## Context

FLOW ต้องรองรับ Mobile-first PWA, Multi-tenant workflow, Customer/Staff/Owner surfaces, Vertical Product 3 กลุ่ม, Payment provider 2 purpose, Configurable Feature Topic และทีมที่ต้องส่งมอบได้รวดเร็วโดยไม่แยก Microservice ก่อนจำเป็น

Source code ปัจจุบันมี Next.js, React, TypeScript, Tailwind และ shadcn อยู่แล้ว แต่ Authentication, Database contract, Payment adapters, Analytics, Formatting, Test และ Production deployment ยังไม่ครบตาม Target

## Decision

- Next.js App Router + React เป็น Web application/BFF
- TypeScript strict เป็นภาษาหลัก
- Auth.js เป็น Identity/Session authority
- Supabase Postgres เป็น Operational database
- Vercel เป็น Target deployment ของ Next.js
- Tailwind CSS + shadcn/ui เป็น UI foundation
- Stripe Billing ใช้เก็บค่าสมาชิก FLOW
- Omise/Opn ใช้รับเงิน Customer-to-merchant
- Vercel Analytics ใช้ Web traffic; FLOW operational data ใช้ Postgres/reporting projection
- Prettier + ESLint เป็น formatting/lint baseline
- เริ่มด้วย Modular Monolith และ Provider adapters; แยก Worker/Service เมื่อ Load, Reliability หรือ Compliance บังคับ

## Consequences

### Positive

- Reuse Team skill และ Source code ปัจจุบัน
- Next.js รวม Server/UI contract ลด Integration overhead ในระยะแรก
- Postgres รองรับ Transaction, Constraint, RLS และ Reporting ได้ดี
- Adapter boundary ลด Provider lock-in ใน Domain layer
- Modular monolith ลด Distributed-system complexity แต่ยังแบ่ง Ownership ได้

### Trade-offs

- Auth.js + Supabase Postgres ต้องออกแบบ Session-to-database tenant context เอง; ไม่ควรเปิด Supabase Auth ซ้ำ
- Serverless runtime ต้องใช้ Connection pooler และ Durable background processing สำหรับ webhook/retry
- Vercel Analytics ไม่ใช่ Business analytics หรือ Financial source of truth
- Payment/Entitlement consistency เป็น Event-driven และต้องมี Reconciliation
- Current `vinext/OpenAI Sites` build path ต้องมี migration/coexistence decision ก่อนอ้างว่า Vercel เป็น Production target

## Guardrails

- Browser ไม่เข้าถึง Domain table หรือ privileged key โดยตรง
- ทุก external input/payload ผ่าน schema validation
- Payment adapters แยก Purpose และ Credential
- Tenant isolation enforce ที่ Server + Database
- Migration, RLS tests, provider contract tests และ operations runbook เป็น Release gate
- Supporting tool เช่น ORM, queue, monitoring และ notification ต้องมี bounded decision ก่อนติดตั้ง

## Alternatives considered

| Alternative | Reason not selected now |
|---|---|
| Separate frontend/backend services immediately | เพิ่ม deployment, auth, tracing และ consistency overhead ก่อนมี scale evidence |
| Supabase Auth + Auth.js together | เกิด Identity/Session authority คู่และ RLS/JWT ambiguity |
| Single payment provider for all purposes | ไม่ตรง Provider/channel strategy และเพิ่ม coupling ระหว่าง FLOW revenue กับ Merchant funds |
| Microservices per Product | Shared Foundation/Customer/Payment/Audit duplication และ distributed transaction complexity |

## Validation

ADR จะเปลี่ยนเป็น Accepted เมื่อ

- Architecture owner อนุมัติ boundary
- Security อนุมัติ Identity/RLS/Payment model
- Finance/Legal อนุมัติ Provider account/settlement model
- Engineering ทำ Minimal vertical slice ใน Sandbox ผ่าน Build, Auth, Tenant isolation, Stripe Billing และ Omise Payment tests

## Related documents

- [Application Architecture](../application-architecture.md)
- [Payment Architecture](../payment-architecture.md)
- [Data Model](../data-model.md)
- [Architecture Security](../security.md)
