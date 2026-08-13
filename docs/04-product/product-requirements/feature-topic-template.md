---
title: Feature Topic PRD Template
document_id: FLOW-PRD-TEMPLATE
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# Feature Topic PRD Template

ใช้ Template นี้หลัง Topic ผ่าน Entry criteria ใน [Product Requirements](README.md) แล้ว

## Definition of Ready

Feature Topic จะพร้อมเข้าสู่การออกแบบเมื่อมีข้อมูลครบอย่างน้อยดังนี้

| หัวข้อ | คำถามที่ต้องตอบ |
|---|---|
| Purpose | ปัญหาใครและ Outcome คืออะไร |
| Roles | ใครเห็น สร้าง แก้ อนุมัติ ยกเลิก และ Export ได้ |
| Entry | เข้ามาจาก Link, Navigation, Notification หรือ Workflow ใด |
| States | Loading, Empty, Draft, Active, Error, Cancelled และ Completed เป็นอย่างไร |
| Transition | สถานะเปลี่ยนได้โดยใครและภายใต้เงื่อนไขใด |
| Dependency | ต้องเปิด Topic/Integration/Device ใด |
| Data | Input, Output, Required field, Snapshot และ Retention |
| Financial impact | กระทบยอด Stock, Payment, Refund, Commission หรือ Report หรือไม่ |
| Notification | แจ้งใคร เมื่อไร ทางใด และถ้าส่งไม่สำเร็จทำอย่างไร |
| Audit | Action ใดต้องเก็บ Actor, Time, Before/After และ Reason |
| Responsive UI | Mobile, Tablet, Desktop และ Dedicated display ต่างกันอย่างไร |
| Acceptance | Test case ปกติ Exception Permission และ Concurrency คืออะไร |

---

## Document metadata

| Field | Value |
|---|---|
| Topic ID | `<FXX-TXX/CXX-TXX/JXX-TXX/SXX-TXX>` |
| Product | `<FLOW Core/FoodFlow/CareFlow/JobFlow>` |
| Type / Priority | `<Core/Choose/Dependency/Advanced> · <P0-P3>` |
| Owner | `<role/name>` |
| Status | `Discovery/Draft/Ready/In delivery/Released/Deprecated` |
| Target release | `<release/milestone>` |

## Problem and outcome

- Problem:
- Target user/business:
- Expected outcome:
- Non-goals:
- Evidence:

## Scope

### In scope

-

### Out of scope

-

## Actors and permissions

| Actor/Role | View | Create | Update | Approve | Cancel/Void | Export |
|---|---:|---:|---:|---:|---:|---:|
| | | | | | | |

## Dependencies and conflicts

| Relationship | Topic/System | Reason | Enforcement |
|---|---|---|---|
| Requires | | | |
| Enables | | | |
| Conflicts with | | | |

## Workflow and states

- Entry point:
- Preconditions:
- Happy path:
- Alternate paths:
- Failure/recovery paths:
- State transitions:
- Completion condition:

## UX and page impact

| Page/Surface | User action | System feedback | Empty/Error/Loading state |
|---|---|---|---|
| | | | |

## Data and API impact

- Entities/fields:
- Validation rules:
- API/events/webhooks:
- Audit events:
- Data classification:
- Retention/deletion:
- Migration/backfill:

## Business rules

1.

## Acceptance criteria

- [ ] Given ... when ... then ...

## Observability and metrics

- Operational metrics:
- Product outcome metrics:
- Logs/traces/alerts:
- Failure thresholds:

## Rollout and rollback

- Feature flag/entitlement:
- Migration plan:
- Rollout stages:
- Rollback criteria:
- Support/training impact:

## Open questions and decisions

| Item | Owner | Due | Decision/status |
|---|---|---|---|
| | | | |
