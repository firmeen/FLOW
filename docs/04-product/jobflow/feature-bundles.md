---
title: JobFlow Recommended Feature Bundles
document_id: JOBFLOW-BUNDLES
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# JobFlow Recommended Feature Bundles

Bundle คือ Preset ของ Feature Topic ไม่ใช่ Code fork หรือข้อจำกัดถาวร รายละเอียด Feature ต้องอ่านจาก [JobFlow Feature Catalog](feature-catalog.md)

## JobFlow Starter

**เหมาะกับ:** ธุรกิจที่ต้องการเลิกใช้กระดาษ/แชตกระจัดกระจาย และเริ่มติดตามงานกับลูกค้า

- `J01-T01, T03, T05` Request, Counter intake และ Triage
- `J02-T01–T02` Customer/Asset
- `J03-T01, T03–T05` Job ticket, Status และ Exception
- `J08-T01` Work log
- `J11-T01–T02` Tracking portal และ Notification
- `J12-T03` Handover checklist
- `J15-T01–T03` Customer timeline, Follow-up และ Feedback
- `J16-T01` Operations command center

**ไม่ควรบังคับ:** Quote, Inventory, Dispatch, Payment และ Advanced QC หากธุรกิจยังไม่ต้องใช้

## JobFlow Repair

**เหมาะกับ:** ร้านซ่อมโทรศัพท์ คอมพิวเตอร์ เครื่องใช้ไฟฟ้า และงานรับ Item เข้าร้าน

- JobFlow Starter topics
- `J02-T04` Accessories & custody
- `J03-T02` QR/Barcode tag
- `J04-T01–T04` Condition, Diagnostics, Evidence และ Acknowledgement
- `J05-T01–T06` Price book, Quote, Approval, Deposit และ Revision
- `J07-T01, T03–T06` Technician work, Checklist, Part, Change และ Completion proof
- `J09-T01–T03, T06` Parts, Stock, Usage และ Serial/Warranty
- `J10-T01–T03` QC และ Rework
- `J13-T01–T06` Invoice, Payment และ Job costing
- `J14-T01–T02` Warranty/Claim

**ตัวเลือกแนะนำ:** Mail-in, Pickup/Delivery, Customer portal history และ B2B account

## JobFlow Workshop

**เหมาะกับ:** อู่รถ ศูนย์บริการ โรงซ่อม หรือ Workshop ที่มีช่องงาน ช่าง อะไหล่ Supplier และ QC

- JobFlow Repair topics ที่เกี่ยวข้อง
- `J02-T05` Asset/component hierarchy เมื่อจำเป็น
- `J06-T01–T03` Scheduling, Dispatch และ Capacity
- `J08-T02–T04` Subtask, Time และ Handover
- `J09-T01–T07` Parts, Warehouse, Procurement, Backorder, Serial และ Tools
- `J10-T01–T05` Full QC/Rework analytics
- `J14-T01–T05` Warranty/Maintenance/Contract
- `J16-T02–T05` Flow, Profit, Workforce และ Inventory analytics
- `J17-T01–T04` Workforce, Commission และ Safety

**Dependency สำคัญ:** Profit per job ต้องมี Actual labor + Part usage + Other cost + Invoice/payment ที่เชื่อม Reference เดียวกัน

## JobFlow Field Service

**เหมาะกับ:** ช่างนอกสถานที่ บำรุงรักษา ติดตั้ง ตรวจสอบ และบริการหลาย Site

- `J01-T01–T02, T05` Request/Booking/Triage
- `J02-T01–T03` Customer, Asset และ Site
- `J03` Job control
- `J05` Price book/Estimate/Approval
- `J06-T01–T06` Schedule, Dispatch, Map และ Route
- `J07-T01–T07` Mobile execution, Location, Forms, Parts, Approval, Proof และ Offline
- `J08-T01–T05` Work, Time, Collaboration และ Subcontractor
- `J11–J14` Portal, Handover, Payment และ Maintenance
- `J17-T04–T05` Safety และ Lone-worker control

**ตัวเลือกแนะนำ:** Contract/Recurring work, Van stock, Route optimization และ Telematics integration

## JobFlow Full Operation

**เหมาะกับ:** ธุรกิจบริการที่ต้องการ Workflow ครบตั้งแต่ Lead ถึง Contract, Multi-branch และ Profitability

- `J01–J18` เฉพาะ P0/P1 ที่ตรงกับ Operating model
- เพิ่ม P2/P3 ตามความพร้อมด้านข้อมูล ทีม และ Integration
- เปิด Repair-centric topics เมื่อรับ Item เข้าร้าน
- เปิด Field-centric topics เมื่อมี Dispatch/Site
- เปิด Contract/Maintenance เมื่อมีรายได้ประจำ

**หลักสำคัญ:** Full Operation ไม่ควรบังคับทั้ง Repair shop และ Field service ในร้านเดียว หากร้านไม่มีทั้งสอง Operating model
