---
title: CareFlow Recommended Feature Bundles
document_id: CAREFLOW-BUNDLES
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# CareFlow Recommended Feature Bundles

Bundle คือ Preset ของ Feature Topic ไม่ใช่ Code fork หรือข้อจำกัดถาวร รายละเอียด Feature ต้องอ่านจาก [CareFlow Feature Catalog](feature-catalog.md)

## CareFlow Solo

**เหมาะกับ:** ผู้ให้บริการคนเดียวที่ต้องการหน้ารับจอง ปฏิทิน แจ้งเตือน และรับเงิน

- `C01-T01–T04` Storefront และ Service catalog
- `C02-T01, T04–T05, T07` Booking, Availability, Self-service change และ Policy
- `C03-T01, T04–T05` Calendar, Manual booking และ Block time
- `C04-T01–T02, T05` Status, Check-in และ Completion
- `C05-T01–T02` Provider และ Availability
- `C07-T01–T03` Client profile/history/preference
- `C10-T01–T02, T05` Checkout, Payment และ Receipt
- `C13-T01` Reminder
- `C15-T01` Daily overview

**ไม่ควรบังคับ:** Team scheduling, Commission, Resource, Clinical record และ Advanced marketing

## CareFlow Team

**เหมาะกับ:** ร้านบริการหลายพนักงานที่ต้องจัดตาราง เลือกผู้ให้บริการ และกระจายงาน

- CareFlow Solo topics ที่เกี่ยวข้อง
- `C03-T02` Staff calendar
- `C05-T01–T06` Profile, Availability, Selection, Assignment, Shift และ Commission
- `C04-T03–T04` Walk-in/Hybrid queue เมื่อร้านรับลูกค้าหน้างาน
- `C13-T01–T03` Reminder, Operational notification และ Follow-up
- `C15-T02–T03` Revenue และ Utilization analytics

**ตัวเลือกแนะนำ:** Resource booking, Package, Loyalty และ Inventory

## CareFlow Spa

**เหมาะกับ:** Spa/Wellness ที่มีหลายบริการ หลายพนักงาน ห้อง อุปกรณ์ Deposit และ Package

- `C01–C05` P0/P1 ที่ตรงกับร้าน
- `C06-T01–T04` Room/resource, Reservation, Cleaning และ Maintenance
- `C07-T01–T05` Client history, Preference, Alert และ Media ตาม Consent
- `C08-T01–T03` Intake, Consent และ Completion gate
- `C10` Checkout/Deposit/Refund
- `C11` Package, Membership และ Wallet
- `C12-T01–T03` Retail/Consumable inventory
- `C13–C15` Communication, CRM และ Analytics

**ไม่เปิดอัตโนมัติ:** Clinical record, Restricted clinical access และ Lot traceability หาก Operating model ไม่ต้องใช้

## CareFlow Clinic

**เหมาะกับ:** Clinic/Med-spa หรือบริการที่ต้องมี Form, Consent, Treatment record และ Follow-up ภายใต้สิทธิ์เข้มงวด

- CareFlow Team/Spa topics ตาม Workflow จริง
- `C07-T04–T05` Alert และ Before/After media
- `C08-T01–T04` Forms, Consent, Gate และ Version/access
- `C09-T01–T05` Treatment, Plan, Progress, Restricted access และ Follow-up
- `C12-T02, T05` Material usage และ Lot traceability เมื่อจำเป็น
- `C16-T02` Sensitive data boundary
- Strong authentication, Re-authentication, Audit และ Retention controls

**ขอบเขตเชิงกลยุทธ์:** ควรขายเป็น Clinical Extension หลังผ่าน Legal/Professional/Workflow validation แยก ไม่ควรอ้างว่าเป็นระบบเวชระเบียนเต็มรูปแบบจาก Feature list นี้เพียงอย่างเดียว

## CareFlow Full Business

**เหมาะกับ:** ธุรกิจบริการครบวงจรที่มี Booking, Queue, Staff, Resource, POS, Package, CRM และหลายสาขา

- `C01–C08` P0/P1 ตาม Operating model
- `C10–C15` Checkout, Package, Inventory, Communication, CRM และ Analytics
- `C16-T01, T03–T04` Configuration, Integration และ Multi-branch
- เลือก `C09` เฉพาะธุรกิจที่มีเหตุผลด้านบริการและการกำกับข้อมูล

**หลักสำคัญ:** Full Business ไม่เท่ากับ Full Clinical; ขอบเขตข้อมูลต้องยึดตามความจำเป็น ไม่ใช่ระดับราคา
