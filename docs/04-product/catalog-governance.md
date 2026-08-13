---
title: Feature Catalog Governance
document_id: FLOW-CATALOG-GOVERNANCE
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# Feature Catalog Governance

เอกสารนี้กำหนดวิธีดูแล Feature Catalog เพื่อให้ Product, Design, Engineering, QA และ Business อ้างถึงความสามารถเดียวกันได้โดยไม่เกิดชื่อซ้ำหรือขอบเขตคลุมเครือ

## Source-of-truth rules

1. รายละเอียด Individual Feature อยู่ใน `feature-catalog.md` ของ Product นั้นเพียงแห่งเดียว
2. Bundle อ้างอิง Topic ID เท่านั้น และไม่คัดลอกรายละเอียด Feature ไปสร้างนิยามซ้ำ
3. PRD อ้าง Topic ID และกำหนดขอบเขต Release แต่ไม่เปลี่ยนนิยาม Catalog โดยไม่แก้ Catalog ใน PR เดียวกัน
4. Workflow, Page, API, Permission และ Test Case ต้องอ้าง Topic ID ที่เกี่ยวข้อง
5. เอกสาร Strategy และ Research ให้เหตุผลประกอบ แต่ไม่ใช่แหล่งนิยาม Feature

## ID policy

| ระดับ | Pattern | ตัวอย่าง |
|---|---|---|
| Feature Group | `S/F/C/J + NN` | `F05` |
| Feature Topic | `Group-TNN` | `F05-T02` |
| Individual Feature | `Topic-NN` | `F05-T02-03` |

- ID ต้องไม่ซ้ำข้าม Catalog
- ห้ามเปลี่ยนความหมายของ ID เดิมเพื่อใช้กับความสามารถใหม่
- ID ที่ยกเลิกให้คงใน Change record และกำกับ `Deprecated`; ห้ามนำกลับมาใช้ซ้ำ
- การ Split หรือ Merge Topic ต้องระบุ ID เดิม, ID ใหม่ และผลกระทบต่อ Bundle/PRD/Analytics

## Topic metadata

ทุก Topic ต้องระบุอย่างน้อย:

- Type: Core, Choose, Dependency หรือ Advanced
- Priority: P0–P3
- Product และ Feature Group
- Business outcome และ Primary actor
- Preconditions, Dependency และ Conflict
- Entry point, Workflow state และ Permission ที่เกี่ยวข้อง
- Data classification และ Retention requirement
- Acceptance criteria และ Observability requirement

## Change workflow

1. ระบุเหตุผลและหลักฐานของการเปลี่ยน
2. ตรวจผลกระทบต่อ Catalog, Bundle และ Dependency
3. ตรวจผลกระทบต่อ Role, Workflow, Page, API, Data และ Test
4. แก้ Source of truth และเอกสารอ้างอิงใน PR เดียวกัน
5. ให้ Product owner รีวิว Semantic scope
6. ให้ Engineering/Architecture รีวิว Feasibility และ Shared Engine impact
7. Merge แล้วจึงนำ Topic ไปวาง Roadmap หรือ PRD

## Required PR checklist

- [ ] Topic ID ถูกต้องและไม่ซ้ำ
- [ ] Type/Priority มีเหตุผลรองรับ
- [ ] Bundle references ยังสมบูรณ์
- [ ] Dependency และ Conflict ถูกระบุ
- [ ] Sensitive data/security impact ถูกตรวจ
- [ ] Cross-product reuse ถูกประเมิน
- [ ] Link ภายในเอกสารไม่เสีย
- [ ] Catalog coverage baseline ถูกปรับเมื่อจำนวนเปลี่ยน

## Ownership

| Concern | Accountable role |
|---|---|
| Product scope และ Priority | Product Owner |
| Shared Engine และ Domain boundary | Architecture/Engineering |
| User flow และ Interaction | Product Design |
| Acceptance และ Regression coverage | QA |
| Packaging และ Entitlement | Product + Business |
| Sensitive data และ Retention | Security/Privacy owner |
