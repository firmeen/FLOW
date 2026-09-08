---
title: FLOW Architecture
document_id: FLOW-ARCH-INDEX
status: active
owner: Architecture
last_reviewed: 2026-09-08
source_of_truth: true
---

# FLOW Architecture

เอกสารชุดนี้เก็บ Target Architecture และ detailed design ของ FLOW ตั้งแต่ System boundary, Technology stack, Multi-tenant data model, Payment separation และ Security controls เพื่อให้ Product, Engineering, Security, Finance และ Operations ใช้ Contract เดียวกัน

> **Current implementation authority:** หลัง post-R06 rebaseline ให้ใช้ `docs/07-delivery/rebaseline/ARCHITECTURE_BASELINE.md`, `SYSTEM_CURRENT_STATE.md` และ `SYSTEM_DECISIONS.md` เป็นตัวตัดสินว่าอะไรคือ architecture/runtime authority ที่ใช้งานจริงใน repository ปัจจุบัน เอกสาร Architecture รุ่นก่อนอาจยังมี implementation-status snapshots จากวันที่ทบทวนเดิมและต้องอ่านเป็น Target/Reference จนกว่าจะ reconcile แล้ว

## Active rebaseline references

| เอกสาร | Authority |
|---|---|
| [Architecture Baseline](../07-delivery/rebaseline/ARCHITECTURE_BASELINE.md) | Current runtime/module/data/security boundary หลัง rebaseline |
| [System Current State](../07-delivery/rebaseline/SYSTEM_CURRENT_STATE.md) | สิ่งที่ Source code มีจริงที่ rebaseline input cut |
| [System Decisions](../07-delivery/rebaseline/SYSTEM_DECISIONS.md) | KEEP / SALVAGE / REWRITE / DROP / HISTORICAL classification |
| [Rebaseline Backlog](../07-delivery/rebaseline/REBASELINE_BACKLOG.md) | Dependency-ordered implementation authority |

## Detailed architecture document map

| เอกสาร | ใช้สำหรับ | ผู้อนุมัติหลัก |
|---|---|---|
| [System Context](system-context.md) | Actor, External system, Trust boundary และ Data flow ระดับระบบ | Product + Architecture + Security |
| [Application Architecture](application-architecture.md) | Target technology/runtime/module structure และ historical implementation notes | Architecture + Engineering |
| [Payment Architecture](payment-architecture.md) | Stripe/Omise boundary, Payment flow, Ledger, Webhook, Refund และ Go-live gate | Finance + Architecture + Security |
| [Data Model](data-model.md) | Tenant isolation, Entity ownership, Payment schemas, RLS และ retention | Data + Architecture + Security |
| [Architecture Security](security.md) | Authentication, Authorization, Secret, PCI scope, Privacy และ incident control | Security + Architecture |
| [ADR-001: Technology Stack](technical-decisions/ADR-001-technology-stack.md) | เหตุผลและผลกระทบของ Stack ที่เลือก | Architecture |
| [ADR-002: Payment Separation](technical-decisions/ADR-002-payment-provider-separation.md) | การแยก FLOW Billing ออกจากเงินของร้าน | Finance + Architecture + Legal |
| [ADR-003: Typed Query Layer](technical-decisions/ADR-003-typed-query-layer.md) | แนวทาง query/transaction สำหรับ Supabase Postgres | Architecture + Data |
| [ADR-004: Password Hashing](technical-decisions/ADR-004-password-hashing.md) | อัลกอริทึมและ runtime gate สำหรับ internal credentials | Architecture + Security |
| [ADR-005: Outbox Worker Strategy](technical-decisions/ADR-005-outbox-worker-strategy.md) | รูปแบบ durable outbox runner, retry และ idempotency ที่เสนอไว้ | Architecture + Operations |

## Architecture principles

1. **Tenant isolation by default** — ทุก Domain record ต้องมี Tenant ownership ที่ตรวจได้ทั้ง Application และ Database
2. **One internal identity authority** — Auth.js เป็น Staff/Owner/Platform identity/session authority; customer table capability เป็น security boundary แยกต่างหาก ไม่ใช่ระบบ Login คู่ขนาน
3. **Server-mediated domain access** — Browser ไม่เป็น authority ของ Domain table, Workflow transition หรือ Payment secret
4. **Durable business state** — Transactional FoodFlow state มี PostgreSQL เป็น source of truth; browser state ใช้ interaction/cache เท่านั้น
5. **Defense in depth** — Server permission checks และ Database RLS ต้อง enforce ซ้ำ โดย tenant/branch/actor context มาจาก trusted server context
6. **Payment-purpose separation** — เงินที่ร้านจ่ายให้ FLOW และเงินที่ลูกค้าจ่ายให้ร้านใช้ Provider account, Credential, Webhook และ Ledger คนละชุด
7. **Provider event is evidence, not business command** — Webhook ต้อง Verify, Deduplicate และ Map เข้าสู่ State machine ก่อนเปลี่ยน Entitlement หรือ Order
8. **Configuration before duplication** — FoodFlow, CareFlow และ JobFlow ใช้ Shared Foundation แต่รักษา Domain rule, Workflow และ Sensitive Data boundary ของตน
9. **Version operational contracts** — Bundle, Topic, Workflow, Price, Permission และ Entitlement ที่ Published ต้องมี Version/Effective date ตาม capability ที่ต้องการ versioning
10. **No hidden implementation claim** — เอกสาร/UI ต้องแยก Target, Implemented, Tested, Demo และ Production-enabled ออกจากกัน

## Decision hierarchy

เมื่อเอกสารขัดกัน ให้ใช้ลำดับดังนี้

1. กฎหมาย, Provider contract, Security/Privacy requirement และข้อกำหนดด้านข้อมูล
2. Accepted Architecture Decision Record ที่ยังไม่ถูก supersede
3. Active rebaseline authority: `ARCHITECTURE_BASELINE.md` + `SYSTEM_DECISIONS.md` + source/test evidence
4. Detailed architecture documents ใน hub นี้
5. Product Dependency/Workflow contract
6. PRD, API contract และ implementation detail

ถ้าเอกสาร Target เก่าขัดกับ verified source/test evidence ให้บันทึก drift และ reconcile ผ่าน PR; ห้ามย้อน implementation ที่ผ่าน acceptance แล้วเพียงเพื่อให้ตรงกับ implementation-status snapshot เก่า

การเปลี่ยน Provider, Identity authority, Tenant model, Settlement ownership หรือ canonical Deployment target ต้องเพิ่ม/แก้ decision record และปรับ rebaseline/architecture documents ที่ได้รับผลกระทบใน Pull Request เดียวกัน

## Delivery gates

| Gate | หลักฐานขั้นต่ำ |
|---|---|
| Architecture accepted | Current-state evidence + explicit decision + affected ADR/contract |
| Development ready | Environment contract, schema/API/security boundary และ acceptance plan พร้อม |
| Database ready | Fresh migration bootstrap, RLS/permission tests, generated type drift และ runtime integration ผ่าน |
| Browser ready | Responsive/accessible browser acceptance ผ่านโดยไม่ fallback ไป demo authority |
| Sandbox ready | Provider test account, Webhook verification, Idempotency และ failure-path tests ผ่านเมื่อ capability ใช้ provider |
| Pilot ready | Tenant/RBAC/RLS, operational failure paths, reconciliation/runbook ตาม capability ผ่าน |
| Production ready | Dedicated Production environment, secrets, monitoring, backup/restore, incident owner และ legal/provider gates ที่เกี่ยวข้องผ่าน |

## Historical document rule

Historical Phase/Round specifications, branches and migrations ยังเก็บไว้เป็น evidence. ห้าม rename/rewrite migration ที่อาจถูก apply แล้วเพื่อทำให้ naming สะอาดขึ้น; correction ใช้ forward migration เท่านั้น

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Auth.js](https://authjs.dev/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Stripe Billing](https://docs.stripe.com/billing)
- [Omise Thailand pricing and payment methods](https://www.omise.co/en/pricing/thailand)
