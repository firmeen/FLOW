---
title: Product Workflow Documentation
document_id: FLOW-WORKFLOW-INDEX
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# Product Workflow Documentation

โฟลเดอร์นี้เก็บ User flow, Operational workflow และ State transition model ที่เชื่อมหลาย Feature Topic เข้าด้วยกัน

## Workflow document types

| Type | จุดประสงค์ | ตัวอย่าง |
|---|---|---|
| Customer journey | เส้นทางจาก Entry ถึง Outcome ของลูกค้า | Scan QR → Order → Pay → Track |
| Operational workflow | งานระหว่าง Role และ Station | Accept → Prepare → Serve |
| State model | สถานะและ Transition rule | Waiting → Preparing → Served |
| Exception flow | Cancel, retry, remake, no-show, refund | Payment failed → Retry/Change method |
| Cross-product flow | Engine กลางที่หลาย Product ใช้ | Notification, approval, file evidence |

## Required content

- Workflow ID, owner และ status
- Topic IDs ที่เกี่ยวข้อง
- Actors/Roles และ Entry points
- Preconditions และ Trigger
- Happy path, alternate path และ exception path
- State definitions และ allowed transitions
- Permission/approval gates
- Timeout, retry, idempotency และ recovery rules
- Audit/notification events
- Completion, cancellation และ reopen rules

## File convention

```text
workflows/
├── README.md
├── shared/
├── foodflow/
├── careflow/
└── jobflow/
```

ชื่อไฟล์แนะนำ: `<workflow-id>-<short-name>.md` และห้ามใช้ `final`, `new` หรือเลข Version ในชื่อไฟล์ เพราะ Git history เป็นแหล่งเก็บ Version

## Relationship to other documents

- Catalog กำหนดว่า Product **ทำอะไรได้**
- Workflow กำหนดว่า Actor และ State **ทำงานร่วมกันอย่างไร**
- PRD กำหนดว่า Release นี้ **จะสร้างขอบเขตใดและยอมรับผลอย่างไร**
- Architecture กำหนดว่า **ระบบรับผิดชอบและเชื่อมต่ออย่างไร**
