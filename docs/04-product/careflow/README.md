---
title: CareFlow Product Hub
document_id: CAREFLOW-PRODUCT-HUB
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---

# CareFlow Product Hub

CareFlow คือ Vertical Product ของ FLOW สำหรับธุรกิจที่ดำเนินงานผ่านบริการ นัดหมาย คิว ผู้ให้บริการ และทรัพยากร ทำหน้าที่เชื่อมเส้นทางตั้งแต่ลูกค้าค้นหาบริการ จองเวลา Check-in รับบริการ ชำระเงิน ติดตามผล ไปจนถึงการรักษาความสัมพันธ์และวิเคราะห์ Capacity ของธุรกิจ

> Product เดียว · Feature Catalog เดียว · 5 Recommended Bundles · แยก General Service ออกจาก Clinical/Sensitive Data อย่างชัดเจน

Bundle ทั้งห้าชุดเป็น **Solution Preset หรือกลุ่ม Feature Topic ที่แนะนำ** ไม่ใช่ Product ใหม่ ไม่ใช่ Codebase แยก และไม่ใช่ระดับราคาตายตัว โดยเฉพาะ `CareFlow Full Business` ไม่ได้หมายความว่าต้องเปิด Clinical Extension ให้ทุกธุรกิจ

## เอกสารหลัก

| เอกสาร | หน้าที่ |
|---|---|
| [Complete Feature Catalog](feature-catalog.md) | Source of truth ของ Feature Group `C01–C16`, Topic ID และ Individual Feature |
| [Recommended Feature Bundles](feature-bundles.md) | รายการ Topic ของ Solo, Team, Spa, Clinic และ Full Business |
| [Catalog governance](../catalog-governance.md) | กติกา ID, Ownership, Source of truth และการเปลี่ยน Catalog |
| [Cross-product shared engines](../cross-product-shared-engines.md) | Engine กลางและขอบเขตข้อมูลที่ใช้ร่วมกับ Product อื่น |
| [Product requirements](../product-requirements/README.md) | เกณฑ์นำ Topic ที่เลือกแล้วไปสร้าง PRD |

## 1. Product overview

### Operating model

```text
Service Discovery
  → Availability Search
  → Booking / Walk-in
  → Confirmation and Reminder
  → Check-in and Queue
  → Staff / Resource Assignment
  → Service / Treatment Execution
  → Checkout and Follow-up
  → Retention and Capacity Insight
```

### Primary users

| User/Role | เป้าหมายหลัก |
|---|---|
| Client / Guest | ค้นหา จอง เปลี่ยนนัด Check-in ชำระเงิน และติดตามผล |
| Reception / Front desk | จัด Calendar รับ Walk-in Check-in เลื่อนนัด และ Checkout |
| Service provider | ดูตาราง เตรียมข้อมูล เริ่ม/จบบริการ และบันทึกผลที่ได้รับสิทธิ์ |
| Resource coordinator | ควบคุมห้อง เตียง เก้าอี้ อุปกรณ์ Buffer และ Maintenance |
| Manager | จัดทีม Commission Capacity และแก้ปัญหา No-show/Delay |
| Clinical/Authorized role | เข้าถึง Consent, Procedure และข้อมูลละเอียดอ่อนเท่าที่จำเป็น |
| Owner / Branch Admin | ตั้งกติกา Booking, Package, CRM, Reporting และ Multi-branch |

### Product boundaries

- CareFlow ครอบคลุมบริการทั่วไปได้โดยไม่เปิด Treatment/Clinical record
- ข้อมูล Allergy, Contraindication, Before/After media, Consent และ Treatment ต้องกำหนด Data classification, Purpose, Permission และ Retention แยก
- Booking, Walk-in และ Hybrid Queue เป็น Operating Model ที่ประกอบร่วมกันได้ ไม่ควรสร้าง Application คนละตัว
- Availability ต้องคำนวณจากบริการ พนักงาน ทรัพยากร เวลา Buffer และ Policy ที่เปิดจริง ไม่ใช่เพียงตรวจช่องว่างใน Calendar
- CareFlow Clinic เป็น Clinical Extension หลังผ่าน Legal, Professional และ Workflow validation ไม่ควรอ้างว่าเป็นระบบเวชระเบียนเต็มรูปแบบจากรายการ Feature เพียงอย่างเดียว

## 2. Complete Feature Catalog

CareFlow Catalog ครอบคลุม **16 Feature Groups, 85 Feature Topics และ 526 Individual Features** รายละเอียดระดับ Topic และ Feature อยู่ใน [feature-catalog.md](feature-catalog.md)

| Group | Capability domain | ใช้ตอบคำถามหลัก |
|---|---|---|
| `C01` | Customer Entry & Service Catalog | ลูกค้าเข้ามา ค้นหา และเลือกบริการอย่างไร |
| `C02` | Online Booking & Reservation Rules | ตรวจ Availability จอง เปลี่ยน และยกเลิกอย่างไร |
| `C03` | Calendar & Schedule Workspace | ร้านและพนักงานเห็น/จัดตารางอย่างไร |
| `C04` | Check-in, Walk-in Queue & Service Flow | ลูกค้าเดินทางจาก Confirmed ถึง Completed อย่างไร |
| `C05` | Staff, Skill, Schedule & Commission | จัดผู้ให้บริการ Skill กะ Assignment และค่าตอบแทนอย่างไร |
| `C06` | Room, Chair, Equipment & Capacity | จองทรัพยากร ป้องกันชน และจัด Buffer อย่างไร |
| `C07` | Client Profile, History & Preferences | รู้จักลูกค้าและเก็บประวัติที่จำเป็นอย่างไร |
| `C08` | Forms, Consent & Document Workflow | เก็บ Form, Consent และ Completion gate อย่างไร |
| `C09` | Treatment, Procedure & Clinical Extension | บันทึก Treatment/Procedure ภายใต้สิทธิ์เข้มงวดอย่างไร |
| `C10` | POS, Checkout, Payment & Refund | รับ Deposit/Balance, Checkout และ Refund อย่างไร |
| `C11` | Packages, Membership, Wallet & Gift Card | ขายและใช้สิทธิ์หลายครั้งอย่างไร |
| `C12` | Retail & Consumable Inventory | เชื่อมสินค้า วัสดุใช้บริการ Stock และ Lot อย่างไร |
| `C13` | Reminder, Communication & Follow-up | ยืนยัน เตือน แจ้งเหตุการณ์ และติดตามผลอย่างไร |
| `C14` | CRM, Loyalty, Marketing & Reputation | รักษาลูกค้า Rebook และจัดการ Feedback อย่างไร |
| `C15` | Dashboard, Reporting & Capacity Intelligence | เห็น Booking, Revenue, Utilization และ Retention อย่างไร |
| `C16` | Care Administration, Privacy & Integration | ตั้งกติกา กำกับข้อมูล และเชื่อมระบบภายนอกอย่างไร |

## 3. Recommended Feature Bundles ทั้ง 5 ชุด

| Bundle | เหมาะกับ | Workflow ที่ต้องจบ | จุดที่ไม่ควรถูกบังคับ |
|---|---|---|---|
| **CareFlow Solo** | ผู้ให้บริการคนเดียว | Service → Booking → Calendar → Reminder → Service → Checkout | Team scheduling, Commission, Resource และ Clinical record |
| **CareFlow Team** | ร้านหลายพนักงาน | Booking/Walk-in → Staff selection/assignment → Service → Commission/Insight | Resource, Package และ Inventory หากร้านไม่ใช้ |
| **CareFlow Spa** | Spa/Wellness หลายบริการ ห้อง และ Package | Booking → Staff/Room → Intake/Consent → Service → Package/Payment → Follow-up | Clinical record และ Restricted clinical access |
| **CareFlow Clinic** | Clinic/Med-spa ที่ต้องมี Form, Consent และ Procedure record | Eligibility → Booking → Consent → Treatment → Restricted record → Follow-up | Marketing/Package ที่ไม่จำเป็นต่อ Clinical workflow |
| **CareFlow Full Business** | ธุรกิจบริการครบวงจรหรือหลายสาขา | Booking + Queue + Staff + Resource + POS + CRM + Analytics | Clinical Extension หากไม่มีเหตุผลด้านบริการและกฎหมาย |

รายการ Topic ที่เป็นทางการของแต่ละ Bundle อยู่ใน [feature-bundles.md](feature-bundles.md)

## 4. Bundle comparison matrix

สัญลักษณ์ใน Matrix:

- **●** = Baseline ของ Bundle หรือจำเป็นต่อ Workflow หลัก
- **◐** = เปิดตามประเภทธุรกิจ นโยบาย หรือระดับความพร้อม
- **—** = ไม่เปิดเป็นค่าเริ่มต้น แต่เพิ่มได้เมื่อ Dependency และ Data governance ครบ

| Feature Group | Solo | Team | Spa | Clinic | Full Business |
|---|:---:|:---:|:---:|:---:|:---:|
| `C01` Entry & Service Catalog | ● | ● | ● | ● | ● |
| `C02` Booking Rules | ● | ● | ● | ● | ● |
| `C03` Calendar | ● | ● | ● | ● | ● |
| `C04` Check-in & Service Flow | ● | ● | ● | ● | ● |
| `C05` Staff & Commission | ◐ | ● | ● | ● | ● |
| `C06` Resource & Capacity | — | ◐ | ● | ◐ | ● |
| `C07` Client Profile & History | ● | ● | ● | ● | ● |
| `C08` Forms & Consent | ◐ | ◐ | ● | ● | ● |
| `C09` Clinical Extension | — | — | — | ● | ◐ |
| `C10` Checkout & Payment | ● | ● | ● | ● | ● |
| `C11` Package & Membership | ◐ | ◐ | ● | ◐ | ● |
| `C12` Retail & Inventory | — | ◐ | ● | ◐ | ● |
| `C13` Reminder & Follow-up | ● | ● | ● | ● | ● |
| `C14` CRM & Reputation | ◐ | ◐ | ● | ◐ | ● |
| `C15` Reporting & Capacity | ● | ● | ● | ● | ● |
| `C16` Administration & Privacy | ● | ● | ● | ● | ● |

Matrix นี้ใช้เปรียบเทียบระดับ Feature Group เท่านั้น `●` ไม่ได้แปลว่าเปิดทุก Topic ใน Group และ `Full Business + C09` ต้องผ่าน Sensitive Data gate เสมอ

## 5. วิธีเลือก Bundle

### คำถามตัดสินใจ

1. มีผู้ให้บริการคนเดียว ไม่มี Resource/Commission ซับซ้อนหรือไม่? → เริ่มที่ **Solo**
2. มีหลายพนักงาน ลูกค้าเลือกพนักงาน หรือร้านต้อง Assignment/Commission หรือไม่? → เลือก **Team**
3. Availability ขึ้นกับห้อง เตียง เก้าอี้ อุปกรณ์ Buffer และ Package หรือไม่? → เลือก **Spa**
4. ต้องใช้ Consultation, Consent, Treatment/Procedure record และ Restricted access จริงหรือไม่? → พิจารณา **Clinic** หลังผ่าน Sensitive Data readiness
5. มี Booking, Queue, Staff, Resource, POS, CRM, Inventory หรือหลายสาขาหลายส่วนร่วมกันหรือไม่? → เริ่มที่ **Full Business** แล้วเลือกเฉพาะ Topic ที่ตรง Operating Model

### Selection checklist

- [ ] ระบุวิธีรับลูกค้า: Online booking, Manual booking, Walk-in หรือ Hybrid
- [ ] ระบุหน่วย Availability: Staff, Room, Chair, Equipment, Capacity หรือหลายอย่างร่วมกัน
- [ ] ระบุกฎ Duration, Buffer, Break, Day off, Overbooking และ Cancellation
- [ ] ระบุ Payment timing: Deposit, Pay Now, Balance, Package หรือ Membership
- [ ] ระบุข้อมูลที่ต้องเก็บก่อน ระหว่าง และหลังบริการ พร้อมวัตถุประสงค์
- [ ] แยกข้อมูล General service ออกจาก Sensitive/Clinical data
- [ ] ระบุ Role ที่เห็น แก้ อนุมัติ Export และลบข้อมูลแต่ละประเภทได้
- [ ] เลือก Bundle ที่ทำ Booking-to-completion workflow จบโดยเพิ่ม Topic น้อยที่สุด

หากร้านเป็น Spa ที่มีบริการบางประเภทคล้าย Clinic ให้เริ่มจาก Spa แล้วเพิ่ม Clinical Topic เฉพาะบริการที่ผ่านการกำกับ ไม่ควรย้ายทั้งธุรกิจเป็น Clinic โดยอัตโนมัติ

## 6. วิธีเพิ่ม–ลด Feature Topic

### การเพิ่ม Topic

1. เลือก Bundle preset และกำหนด Service operating model
2. เลือก Topic จาก [Complete Feature Catalog](feature-catalog.md) โดยใช้ Topic ID
3. ตรวจผลต่อ Availability, Calendar, Staff, Resource, Payment, Form และ Notification
4. ให้ระบบแก้ Dependency และแสดง Data/Permission impact ก่อนยืนยัน
5. เลือก Scope: ทั้ง Business, Branch, Service category หรือ Provider group
6. หากเป็น Sensitive Topic ต้องผ่าน Privacy/Security gate ก่อน Publish
7. Publish Configuration เป็น Version พร้อม Audit log, Effective date และ Rollback point

### การลดหรือปิด Topic

1. Core Topic ปิดไม่ได้ขณะ CareFlow ยัง Active
2. Dependency ปิดไม่ได้หากยังมี Service, Booking, Package, Form หรือ Topic อื่นอ้างถึง
3. Appointment/Service ที่กำลัง Active ต้องจบ ย้าย หรือ Cancel ตาม Policy ก่อนปิด
4. ระบบต้องอธิบายผลต่อ Availability, Calendar, Reminder, Balance, Consent และ Reporting
5. ประวัติ Booking, Payment, Consent, Treatment และ Audit ต้องเก็บตาม Retention/Legal policy แม้ปิด Entitlement
6. การปิด Clinical Topic ต้องกำหนด Read-only access, Export/transfer และ Retention ก่อน ไม่ลบข้อมูลทันที

### ตัวอย่างการ Customize

```text
CareFlow Team
  + C06-T01 Resource Master
  + C06-T02 Resource Reservation       (auto-enabled dependency)
  + C06-T03 Buffer, Cleaning & Turnaround
  + C11-T01 Service Package
  - C09 Clinical Extension             (ไม่เปิด เพราะไม่ใช่ Clinical service)
```

## 7. Dependency ที่ระบบต้องเปิดอัตโนมัติ

| เมื่อเลือก | ระบบต้องเปิด/ตรวจ | เหตุผล |
|---|---|---|
| CareFlow Product หรือ Bundle ใด ๆ | Shared Foundation P0 + `C01-T01–T02` + `C02-T04` + `C03-T01` + `C04-T01` + `C16-T01` | Storefront, Service, Availability, Calendar, Lifecycle และ Configuration เป็นฐานของบริการ |
| Single/Multi-service booking | Service duration/rule + Availability search + Calendar + Appointment lifecycle | ป้องกันการสร้างนัดที่ไม่มีเวลา สถานะ หรือกฎบริการรองรับ |
| Customer staff selection | `C05-T01` Provider profile + `C05-T02` Staff availability + Skill eligibility | ต้องแสดงเฉพาะผู้ให้บริการที่ทำบริการและว่างจริง |
| Resource-based service | `C06-T01` Resource master + `C06-T02` Resource reservation + Conflict prevention | Topic `C06-T02` เป็น Dependency ที่ต้องผูก Booking กับทรัพยากรจริง |
| Cleaning/Buffer time | Staff/Resource reservation + Calendar blocking + Turnaround rule | ช่องเวลาหลังบริการต้องไม่ถูกขายซ้ำ |
| Booking deposit | `C02-T07` Policy gate + `C10-T02` Deposit/balance + Payment status + Cancellation/refund rule | เงินต้องผูกกับนัดและนโยบายเดียวกัน |
| Package usage | Client profile + `C11-T01` Package ledger + Eligible service + Checkout/completion event | ป้องกันการใช้ Session เกินและทำให้ Balance ตรวจสอบย้อนหลังได้ |
| Service consumable deduction | `C12-T01` Item master + `C12-T02` Consumption recipe + `C12-T03` Stock movement | ต้องรู้ว่าวัสดุใดถูกใช้กับบริการและเมื่อใดต้อง Reverse |
| Form completion gate | Assigned form/version + Client/Appointment reference + Consent status + Audit | ป้องกันเริ่มบริการก่อนเอกสารบังคับครบ |
| `C09` Treatment/Clinical Topic ใด ๆ | `C16-T02` Sensitive Data Boundary + Strong authentication/re-authentication + Restricted permission + Consent/version + Audit + Encryption/retention control | Clinical Extension เปิดไม่ได้ด้วย Entitlement เพียงอย่างเดียว |
| Before/After media | Explicit purpose/consent + Restricted file access + Metadata/audit + Retention/deletion rule | ภาพลูกค้าเป็นข้อมูลละเอียดอ่อนและใช้ผิดวัตถุประสงค์ได้ง่าย |
| External calendar sync | Internal calendar as source of truth + Mapping + Conflict policy + Sync monitoring/retry | ป้องกันนัดซ้ำและสถานะต่างระบบไม่ตรงกัน |
| Multi-branch | Shared organization/branch + Data boundary + Branch override + Consolidated reporting | แยกสิทธิ์และข้อมูลแต่ละสาขาโดยยังบริหารส่วนกลางได้ |

### Sensitive Data activation gate

ก่อนเปิด `C09` หรือ Topic ที่เก็บข้อมูลสุขภาพ/ภาพละเอียดอ่อน ต้องตอบได้ครบ:

- เก็บข้อมูลอะไร เพื่อวัตถุประสงค์ใด และฐานสิทธิ/Consent คืออะไร
- Role ใดดู สร้าง แก้ Export และลบได้
- เข้ารหัสระหว่างส่งและขณะจัดเก็บอย่างไร
- เก็บ Audit ของ View/Change/Export/Download หรือไม่
- Retention, Legal hold, Deletion และ Data subject request ทำอย่างไร
- หากปิด Module หรือย้ายระบบ ข้อมูลเดิมยังเข้าถึงอย่างถูกกฎหมายอย่างไร
- มีการยืนยันข้อกำกับวิชาชีพและขอบเขตการใช้งานแล้วหรือไม่

### Dependency enforcement rules

- ระบบต้องแสดง Dependency และ Sensitive Data preview ก่อนเปิด Topic
- Auto-enabled Topic ต้องแสดง Source Topic และ Scope ที่เรียกใช้
- ห้ามปิด Dependency จนไม่มี Service/Booking/Topic อ้างถึง
- Topic ที่มีข้อมูลละเอียดอ่อนต้องมี Activation gate เพิ่มจาก Feature entitlement
- Dependency ต้องบังคับทั้ง UI, API, Permission, Storage, Audit และ Retention
- รายละเอียดสุดท้ายต้องถูกย้ายไปเป็น Machine-readable Feature Dependency Matrix ก่อนสร้างระบบ Configuration จริง

## ลำดับการนำไปพัฒนา

```text
Select Bundle
  → Define Service and Availability Model
  → Resolve Topic and Data Dependencies
  → Define Roles, Consent and Privacy Boundary
  → Model Booking / Queue / Service States
  → Create Page Inventory and PRDs
  → Define API/Data/Test Contracts
  → Release behind Entitlement and Activation Gates
```

Product Hub นี้ช่วยเลือกขอบเขต ส่วนรายละเอียดที่ทีมพัฒนาต้องใช้ยังคงอ้าง [Feature Catalog](feature-catalog.md), Workflow และ PRD โดย Topic ID เดียวกัน
