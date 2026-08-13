---
title: JobFlow Product Hub
document_id: JOBFLOW-PRODUCT-HUB
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---

# JobFlow Product Hub

JobFlow คือ Vertical Product ของ FLOW สำหรับธุรกิจที่รับคำขอเป็นงาน ติดตาม Asset/Item/Site และต้องควบคุมงานจนส่งมอบ ทำหน้าที่เชื่อมเส้นทางตั้งแต่ Request/Intake การตรวจสภาพและวินิจฉัย การเสนอราคาและอนุมัติ การมอบหมายและลงมือทำ อะไหล่/QC การรับเงิน ส่งมอบ ไปจนถึง Warranty, Maintenance และ Profitability

> Product เดียว · Feature Catalog เดียว · 5 Recommended Bundles · รองรับ Repair, Workshop และ Field Service โดยไม่แตก Codebase

Bundle ทั้งห้าชุดเป็น **Solution Preset หรือกลุ่ม Feature Topic ที่แนะนำ** ไม่ใช่ Product ใหม่ ไม่ใช่ Application แยก และไม่ใช่ระดับราคาตายตัว `Full Operation` หมายถึงเลือก Workflow ที่ครบตาม Operating Model ไม่ใช่บังคับให้ธุรกิจเดียวต้องเป็นทั้ง Repair shop และ Field service

## เอกสารหลัก

| เอกสาร | หน้าที่ |
|---|---|
| [Complete Feature Catalog](feature-catalog.md) | Source of truth ของ Feature Group `J01–J18`, Topic ID และ Individual Feature |
| [Recommended Feature Bundles](feature-bundles.md) | รายการ Topic ของ Starter, Repair, Workshop, Field Service และ Full Operation |
| [Catalog governance](../catalog-governance.md) | กติกา ID, Ownership, Source of truth และการเปลี่ยน Catalog |
| [Cross-product shared engines](../cross-product-shared-engines.md) | Engine กลางที่ JobFlow ใช้ร่วมกับ Product อื่น |
| [Product requirements](../product-requirements/README.md) | เกณฑ์นำ Topic ที่เลือกแล้วไปสร้าง PRD |

## 1. Product overview

### Operating model

```text
Request / Intake
  → Customer, Site and Asset Identification
  → Inspection / Diagnostics
  → Estimate and Approval
  → Schedule / Assign / Dispatch
  → Work Execution and Parts Usage
  → Quality Control and Rework
  → Invoice / Payment
  → Handover and Acceptance
  → Warranty / Maintenance / Repeat Business
```

### Primary users

| User/Role | เป้าหมายหลัก |
|---|---|
| Customer / Client | ส่งคำขอ อนุมัติราคา ติดตามงาน ชำระเงิน และรับมอบ |
| Intake / Service advisor | รับ Item/Asset ตรวจข้อมูล เปิด Job และสื่อสารกับลูกค้า |
| Dispatcher / Coordinator | วางตาราง เลือกช่าง จัดเส้นทาง และควบคุม SLA |
| Technician | ดูงาน บันทึกเวลา Checklist หลักฐาน Part และผลการทำงาน |
| Inventory / Purchasing | จอง เบิก คืน ซื้อ และติดตาม Part/Tool |
| QC / Supervisor | ตรวจคุณภาพ อนุมัติปล่อยงาน และควบคุม Rework |
| Cashier / Finance | ออก Invoice รับเงิน ติดตามลูกหนี้ และตรวจ Profitability |
| Manager / Owner | ควบคุม Backlog, Capacity, Safety, Multi-branch และผลประกอบการ |

### Product boundaries

- Job Ticket/Work Order เป็นแกนกลางที่เชื่อม Customer, Asset, Quote, Work, Part, QC, Payment และ Handover ด้วย Reference เดียวกัน
- Repair, Workshop และ Field Service ใช้ Engine กลางร่วมกัน แต่เปิด Workflow และข้อมูลเฉพาะที่จำเป็น
- Customer tracking link ต้องเปิดข้อมูลเฉพาะ Job ของลูกค้าและใช้ Token/Authentication ที่เหมาะสม ไม่เปิดเผย Internal note
- Location, Evidence, Signature และ Asset information ต้องมี Purpose, Permission, Retention และ Audit
- Profit per job คำนวณไม่ได้จาก Invoice อย่างเดียว ต้องมี Actual labor, Part/material, Subcontract/expense และ Adjustment ที่เชื่อม Job เดียวกัน

## 2. Complete Feature Catalog

JobFlow Catalog ครอบคลุม **18 Feature Groups, 103 Feature Topics และ 635 Individual Features** รายละเอียดระดับ Topic และ Feature อยู่ใน [feature-catalog.md](feature-catalog.md)

| Group | Capability domain | ใช้ตอบคำถามหลัก |
|---|---|---|
| `J01` | Customer Request, Lead & Service Intake | ลูกค้าแจ้งงาน นัด Drop-off หรือรับงานหน้างานอย่างไร |
| `J02` | Customer, Site, Asset & Item Records | ระบุเจ้าของ สถานที่ Asset และสิ่งที่รับมาด้วยอย่างไร |
| `J03` | Job Ticket, Work Order & Status Control | สร้างเลขงาน ควบคุมสถานะ Priority และ Exception อย่างไร |
| `J04` | Inspection, Diagnostics & Evidence | ตรวจสภาพ วินิจฉัย และเก็บหลักฐานก่อน–หลังอย่างไร |
| `J05` | Price Book, Estimate, Quote & Approval | ประเมินราคา เสนอทางเลือก และรับอนุมัติอย่างไร |
| `J06` | Scheduling, Dispatch & Route Planning | วางตาราง เลือกช่าง และส่งงานตามพื้นที่อย่างไร |
| `J07` | Technician Mobile & Field Execution | ช่างรับงาน ทำ Checklist ใช้ Part และส่งหลักฐานอย่างไร |
| `J08` | Work Execution, Subtask, Time & Collaboration | บันทึกงาน เวลา Subtask และ Handover ภายในอย่างไร |
| `J09` | Parts, Inventory, Purchasing & Tools | จอง เบิก คืน ซื้อ และควบคุม Part/Tool อย่างไร |
| `J10` | Quality Control, Rework & Exception | ตรวจ ปล่อยงาน เปิด Rework และวิเคราะห์ปัญหาอย่างไร |
| `J11` | Customer Portal, Tracking & Communication | ให้ลูกค้าติดตาม อนุมัติ และสื่อสารอย่างปลอดภัยอย่างไร |
| `J12` | Pickup, Delivery, Handover & Acceptance | นัดรับ ส่งมอบ ลงนาม และควบคุมของค้างรับอย่างไร |
| `J13` | Invoice, Payment, Credit & Job Profitability | เรียกเก็บ รับเงิน ติดตามเครดิต และคำนวณกำไรอย่างไร |
| `J14` | Warranty, Maintenance & Service Contract | รับ Claim วาง Preventive maintenance และ Contract อย่างไร |
| `J15` | CRM, Sales, Feedback & Repeat Business | รักษาลูกค้า Follow-up และสร้างงานซ้ำอย่างไร |
| `J16` | Dashboard, Reporting & Operational Intelligence | เห็น Backlog, Turnaround, Cost และ Capacity อย่างไร |
| `J17` | Workforce, Permission & Safety | จัด Skill, Shift, Incentive และความปลอดภัยอย่างไร |
| `J18` | Administration, Multi-branch & Integration | ตั้ง Workflow, Template, Territory และ Integration อย่างไร |

## 3. Recommended Feature Bundles ทั้ง 5 ชุด

| Bundle | เหมาะกับ | Workflow ที่ต้องจบ | จุดที่ไม่ควรถูกบังคับ |
|---|---|---|---|
| **JobFlow Starter** | ธุรกิจเริ่มเปลี่ยนจากกระดาษ/แชต | Request/Intake → Job → Status → Work log → Tracking → Handover | Quote, Inventory, Dispatch, Payment และ QC ขั้นสูง |
| **JobFlow Repair** | ร้านซ่อมที่รับ Item เข้าร้าน | Intake/Custody → Inspect → Quote/Approve → Repair/Part → QC → Pay → Handover/Warranty | Route, Geofence และ Field safety หากไม่มีงานนอกสถานที่ |
| **JobFlow Workshop** | อู่ ศูนย์บริการ หรือโรงซ่อมหลายช่องงาน | Schedule/Capacity → Diagnose → Work/Part/Tool → QC/Rework → Cost/Profit → Warranty | Field route และ Lone-worker หากไม่มี Dispatch |
| **JobFlow Field Service** | ติดตั้ง บำรุงรักษา หรืองานหลาย Site | Request → Schedule/Route → Mobile/Offline execution → Evidence → Acceptance → Payment/Maintenance | Item custody, Workshop bay และ Repair-centric QC ที่ไม่ใช้ |
| **JobFlow Full Operation** | ธุรกิจหลาย Workflow, Branch หรือ Contract | Lead/Intake → Job → Execute → QC → Bill → Handover → Contract/Insight | Repair และ Field Topic ที่ไม่ตรง Operating Model ขององค์กร |

รายการ Topic ที่เป็นทางการของแต่ละ Bundle อยู่ใน [feature-bundles.md](feature-bundles.md)

## 4. Bundle comparison matrix

สัญลักษณ์ใน Matrix:

- **●** = Baseline ของ Bundle หรือจำเป็นต่อ Workflow หลัก
- **◐** = เปิดตามลักษณะงาน พื้นที่ หรือระดับความพร้อม
- **—** = ไม่เปิดเป็นค่าเริ่มต้น แต่เพิ่มได้เมื่อ Dependency ครบ

| Feature Group | Starter | Repair | Workshop | Field Service | Full Operation |
|---|:---:|:---:|:---:|:---:|:---:|
| `J01` Request & Intake | ● | ● | ● | ● | ● |
| `J02` Customer, Site & Asset | ● | ● | ● | ● | ● |
| `J03` Job & Status Control | ● | ● | ● | ● | ● |
| `J04` Inspection & Evidence | ◐ | ● | ● | ● | ● |
| `J05` Estimate & Approval | — | ● | ● | ● | ● |
| `J06` Schedule & Dispatch | — | ◐ | ● | ● | ● |
| `J07` Technician Mobile | ◐ | ● | ● | ● | ● |
| `J08` Work, Time & Collaboration | ● | ● | ● | ● | ● |
| `J09` Parts & Inventory | — | ● | ● | ◐ | ● |
| `J10` QC & Rework | — | ● | ● | ◐ | ● |
| `J11` Customer Portal | ● | ● | ● | ● | ● |
| `J12` Handover & Acceptance | ● | ● | ● | ● | ● |
| `J13` Invoice & Profitability | — | ● | ● | ● | ● |
| `J14` Warranty & Maintenance | — | ● | ● | ● | ● |
| `J15` CRM & Repeat Business | ● | ● | ● | ● | ● |
| `J16` Reporting | ● | ● | ● | ● | ● |
| `J17` Workforce & Safety | ◐ | ◐ | ● | ● | ● |
| `J18` Administration & Integration | ● | ● | ● | ● | ● |

Matrix นี้ใช้เปรียบเทียบระดับ Feature Group เท่านั้น Full Operation เปิดเฉพาะ P0/P1 ที่ตรง Operating Model และเพิ่ม P2/P3 เมื่อข้อมูล ทีม และ Integration พร้อม

## 5. วิธีเลือก Bundle

### คำถามตัดสินใจ

1. ต้องการเพียงรับงาน เปิด Ticket ติดตามสถานะ และส่งมอบแทนกระดาษ/แชตหรือไม่? → เริ่มที่ **Starter**
2. ร้านรับอุปกรณ์/สินค้าไว้ มี Custody, Inspection, Quote, Part, QC และ Warranty หรือไม่? → เลือก **Repair**
3. มีหลายช่องงาน ช่าง อะไหล่ Tool Supplier Capacity และต้องวัด Profit per job หรือไม่? → เลือก **Workshop**
4. ช่างเดินทางไป Site ต้อง Dispatch, Route, Mobile form, Offline, Evidence และ Safety หรือไม่? → เลือก **Field Service**
5. องค์กรมีหลาย Workflow, Branch, Territory, Contract หรือ Integration หรือไม่? → เริ่มที่ **Full Operation** แล้วกำหนด Repair/Field profile แยกตาม Job type

### Selection checklist

- [ ] ระบุ Intake channel: Public request, Counter, Drop-off, Pickup, Mail-in หรือ Booking
- [ ] ระบุสิ่งที่ติดตาม: Item, Asset, Vehicle, Site, Property หรือ Service contract
- [ ] ระบุขั้นอนุมัติ: Inspection, Quote, Change order, Deposit, QC และ Handover
- [ ] ระบุ Execution location: In-store, Workshop, Customer site หรือผสมกัน
- [ ] ระบุทรัพยากร: Technician, Bay, Equipment, Part, Tool, Vehicle และ Subcontractor
- [ ] ระบุหลักฐาน: Condition, Diagnostic, Before/After, Signature และ Location
- [ ] ระบุ Revenue model: One-time job, Credit, Milestone, Warranty หรือ Recurring contract
- [ ] เลือก Bundle ที่ทำ Intake-to-acceptance workflow จบโดยเพิ่ม Topic น้อยที่สุด

หากธุรกิจมีทั้ง Workshop และ Field Service ให้สร้าง Job type/Workflow profile คนละแบบบน JobFlow เดียวกัน แล้วใช้ Shared Customer, Asset, Inventory และ Reporting ตาม Data boundary

## 6. วิธีเพิ่ม–ลด Feature Topic

### การเพิ่ม Topic

1. เลือก Bundle preset และกำหนด Job type/operating model
2. เลือก Topic จาก [Complete Feature Catalog](feature-catalog.md) โดยใช้ Topic ID
3. ตรวจผลต่อ Job state, Customer action, Part, Time, Cost, Evidence และ Permission
4. ให้ระบบเพิ่ม Dependency และแสดง Workflow/Data impact ก่อนยืนยัน
5. เลือก Scope: Business, Branch, Territory, Job type หรือ Technician team
6. Preview Template, Required field, Approval gate, Notification และ Report ที่จะเปลี่ยน
7. Publish Workflow/Entitlement version พร้อม Effective date, Audit และ Rollback point

### การลดหรือปิด Topic

1. Core Topic ปิดไม่ได้ขณะ JobFlow ยัง Active
2. Dependency ปิดไม่ได้หาก Job type, Template, Active job หรือ Topic อื่นอ้างถึง
3. งานที่กำลังอยู่ใน State ของ Topic นั้นต้อง Complete, Migrate, Reassign หรือ Cancel ก่อน
4. ระบบต้องแสดงผลต่อ Customer portal, SLA, Inventory reservation, Invoice, Warranty และ Report
5. ประวัติ Job, Evidence, Quote, Ledger, Signature และ Audit ต้องคงอ่านได้ตาม Retention policy
6. การปิด Integration ต้องหยุด Webhook/credential อย่างปลอดภัยและรักษา External ID mapping สำหรับประวัติ

### ตัวอย่างการ Customize

```text
JobFlow Repair
  + J06-T01 Job Calendar & Schedule Board
  + J14-T03 Preventive Maintenance Schedule
  + J15-T04 Campaign, Reminder & Repeat Job
  - J06-T04 Map & Route View            (ไม่เปิด เพราะไม่มี Field dispatch)
  - J17-T05 Lone-worker Control         (ไม่เปิด เพราะทำงานในร้าน)
```

## 7. Dependency ที่ระบบต้องเปิดอัตโนมัติ

JobFlow ไม่มี Topic ที่ติดป้าย `Dependency` ใน Catalog รุ่นปัจจุบัน แต่มี **Implicit workflow dependencies** ที่ระบบ Configuration ต้องบังคับดังนี้

| เมื่อเลือก | ระบบต้องเปิด/ตรวจ | เหตุผล |
|---|---|---|
| JobFlow Product หรือ Bundle ใด ๆ | Shared Foundation P0 + `J02-T01–T02` + `J03-T01, T03` + `J08-T01` + `J18-T01` | Customer/Asset, Job reference, Lifecycle, Work log และ Workflow configuration เป็นแกนกลาง |
| Customer quote approval | `J05-T01–T02` Price/Quote + `J05-T04` Approval + Customer action surface + Version/history | ลูกค้าต้องเห็นข้อเสนอที่ถูก Version และการอนุมัติต้องตรวจสอบย้อนหลังได้ |
| Deposit & approval gate | Quote/approval + `J13-T01–T02` Invoice/payment + Payment status + Cancellation/refund rule | ห้ามเริ่มงานหาก Gate ยังไม่ผ่านและต้องคืนเงินตาม Reference เดิม |
| Technician field execution | Job assignment + `J07-T01` My Jobs + Mobile form/checklist + Time/evidence rule | ช่างต้องเข้าถึงเฉพาะงานที่รับผิดชอบและส่งหลักฐานครบ |
| Offline field mode | Mobile execution + Local draft/outbox + Conflict resolution + Idempotency + Sync/audit status | ป้องกันข้อมูลซ้ำ สูญหาย หรือเขียนทับเมื่อกลับมา Online |
| Part reservation/job usage | `J09-T01` Part catalog + `J09-T02` Stock location/movement + `J09-T03` Job usage + Reversal rule | Stock ต้องผูกกับ Job และคืนได้เมื่อไม่ได้ใช้/ยกเลิก |
| QC release gate | Job lifecycle + QC template/assignment + Pass/Fail + Supervisor permission + Rework transition | งานต้องไม่เปลี่ยนเป็น Ready/Delivered ก่อนผ่าน QC |
| Actual job profitability | Labor time + Part/material usage + Subcontract/expense + Invoice/payment/adjustment | กำไรต้องมาจาก Actual cost และ Revenue ที่อ้าง Job เดียวกัน |
| Warranty claim | Original job/part + Warranty term/status + Claim inspection + Covered decision + Audit | ต้องพิสูจน์สิทธิ์และย้อนกลับไปงานต้นฉบับได้ |
| Preventive/Recurring maintenance | Customer/asset + Maintenance rule + Schedule generation + Reminder + Completion history | นัดครั้งถัดไปต้องผูก Asset และไม่สร้างงานซ้ำ |
| Route optimization | Schedule/dispatch + Site/geocode + Technician availability + Travel policy + Location privacy | Algorithm ต้องมีข้อมูลพื้นที่และข้อจำกัดที่ได้รับอนุญาต |
| Location/Lone-worker control | Explicit workforce policy + Consent/notice + Shift/job boundary + Restricted access + Retention | ห้ามติดตามพนักงานนอกวัตถุประสงค์และช่วงงาน |
| Multi-branch/Warehouse/Territory | Shared organization/branch + Data visibility + Stock ownership + Transfer + Consolidated reporting | แยกสิทธิ์ งาน และ Stock แต่ละพื้นที่โดยยังบริหารส่วนกลางได้ |
| API/Webhook integration | Scoped credential + External ID mapping + Idempotency + Retry/replay + Monitoring/audit | ป้องกัน Event ซ้ำ ข้อมูลหลุด Scope และ Integration failure ที่มองไม่เห็น |

### Dependency enforcement rules

- ระบบต้องแสดง Dependency preview ต่อ Job type ก่อน Publish
- Auto-enabled capability ต้องแสดง Source Topic และเหตุผล
- ห้ามปิด Dependency จน Reference จาก Workflow template และ Active job เป็นศูนย์
- หาก Dependency มีหลายทางเลือก ผู้ดูแลต้องเลือก Implementation อย่างน้อยหนึ่งทาง
- การเปลี่ยน Workflow ต้องมี Version; Job ที่เริ่มแล้วใช้ Snapshot ของ Version เดิมหรือ Migration ที่อนุมัติ
- Dependency ต้องบังคับทั้ง Entitlement, State transition, API, Permission, Ledger และ Audit
- Implicit dependencies ในหน้านี้ต้องถูกแปลงเป็น Machine-readable Feature Dependency Matrix และพิจารณาเปลี่ยน Type ใน Catalog หากเป็น Dependency ถาวร

## ลำดับการนำไปพัฒนา

```text
Select Bundle and Job Type
  → Resolve Topic Dependencies
  → Define Asset, Site and Custody Model
  → Define Roles, Approval and Evidence Rules
  → Model Job States and Exception Paths
  → Create Page Inventory and PRDs
  → Define API/Data/Test Contracts
  → Release Versioned Workflow behind Entitlement
```

Product Hub นี้ช่วยเลือกขอบเขต ส่วนรายละเอียดที่ทีมพัฒนาต้องใช้ยังคงอ้าง [Feature Catalog](feature-catalog.md), Workflow และ PRD โดย Topic ID เดียวกัน
