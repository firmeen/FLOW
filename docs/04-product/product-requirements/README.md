---
title: Product Requirements
document_id: FLOW-PRD-INDEX
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# Product Requirements

โฟลเดอร์นี้ใช้เก็บ Requirement ของ Feature Topic ที่ผ่านการตัดสินใจว่าจะพัฒนาแล้ว ไม่ใช้เก็บ Feature Universe หรือแนวคิดที่ยังไม่ผ่าน Discovery

## Entry criteria

Topic จะเริ่มทำ PRD ได้เมื่อ:

1. มี Topic ID ใน Catalog
2. Dependency และ Conflict สำคัญถูกระบุ
3. Bundle/Customer segment ที่ต้องใช้ Topic นี้ชัดเจน
4. Product priority และ Target release ผ่านการตัดสินใจ
5. มี Owner และ Primary actor
6. มี Workflow/State impact เบื้องต้น
7. ประเมิน Data sensitivity และ Permission แล้ว

## File convention

```text
product-requirements/
├── README.md
├── feature-topic-template.md
└── <product>/
    └── <topic-id>-<short-name>.md
```

ตัวอย่าง: `foodflow/F05-T02-table-session.md`

## PRD relationship

```text
Catalog Topic
  -> Dependency Matrix
  -> Role & Permission Matrix
  -> Workflow / State Model
  -> Page & Interaction Specification
  -> API / Data Contract
  -> Acceptance & Test Cases
```

เริ่มเอกสารใหม่จาก [Feature Topic template](feature-topic-template.md) และเชื่อม Workflow ที่เกี่ยวข้องจาก [workflows](../workflows/README.md).
