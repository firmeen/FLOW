---
title: Cross-product Shared Engines
document_id: FLOW-SHARED-ENGINES
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# Cross-product Shared Engines

เอกสารนี้กำหนดขอบเขตความสามารถที่ควรออกแบบเป็น Engine กลาง และขอบเขตที่ต้องคง Domain model แยกกันเพื่อป้องกัน Coupling ระหว่าง Product

เพื่อไม่ให้ FLOW กลายเป็นสามระบบที่แยกกัน ควรพัฒนา Engine กลางและให้แต่ละ Product กำหนด Configuration/Terminology ของตน

| Shared Engine | FoodFlow | CareFlow | JobFlow |
|---|---|---|---|
| Public Entry | Store/Menu link | Service/Booking link | Request/Tracking link |
| Workflow | Order | Appointment/Visit | Request/Job |
| Queue | Order/Table/Pickup | Walk-in/Service | Intake/Work backlog |
| Assignment | Waiter/Kitchen station | Staff/Room | Technician/Team/Workstation |
| Resource | Table/Station | Room/Chair/Equipment | Bay/Tool/Vehicle |
| Catalog | Menu/Modifier | Service/Add-on | Price book/Part |
| Payment Ledger | Order/Bill | Visit/Package | Quote/Invoice/Job |
| Customer | Diner/Member | Client | Customer/Account |
| Notification | Order/Ready | Booking/Reminder | Status/Approval/ETA |
| Evidence | Slip/Receipt | Form/Consent/Media | Inspection/Completion |
| Analytics | Sales/Kitchen | Booking/Utilization | Flow/Cost/Profit |

## สิ่งที่ควรใช้โครงข้อมูลร่วมกัน

- Business, Branch, User, Role และ Permission
- Customer identity, Contact และ Consent preference
- Status event, Assignment, Checklist, Comment และ Attachment
- Payment attempt, Transaction, Refund และ Receipt reference
- Notification event, Template, Delivery status และ Preference
- Audit log, Export job, Integration credential และ Webhook delivery

## สิ่งที่ไม่ควรบังคับให้เหมือนกันทั้งหมด

- Lifecycle: Order, Appointment และ Job มี Transition และ Exception คนละแบบ
- Catalog: Menu modifier, Service duration และ Part/Price book มีโครงสร้างเฉพาะ
- Resource: Table session, Treatment room และ Work bay มีความหมายต่างกัน
- Data boundary: Clinical note ต้องแยกจาก Restaurant preference และ Job note
- Revenue recognition/Cost: Package liability, Food recipe cost และ Job costing ไม่ใช่เรื่องเดียวกัน
