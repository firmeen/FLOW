---
title: FoodFlow Product Hub
document_id: FOODFLOW-PRODUCT-HUB
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---

# FoodFlow Product Hub

FoodFlow คือ Vertical Product ของ FLOW สำหรับธุรกิจอาหารและเครื่องดื่ม ทำหน้าที่เชื่อมเส้นทางตั้งแต่ลูกค้าเข้าร้าน ค้นหาเมนู สั่งอาหาร การรับและกระจายออเดอร์ การผลิตในครัว การเสิร์ฟหรือส่งมอบ การชำระเงิน ไปจนถึงการติดตามผลการดำเนินงานของร้าน

> Product เดียว · Feature Catalog เดียว · 5 Recommended Bundles · Configuration แตกต่างตาม Operating Model

Bundle ทั้งห้าชุดในหน้านี้เป็น **Solution Preset หรือกลุ่ม Feature Topic ที่แนะนำ** ไม่ใช่ Product ใหม่ ไม่ใช่ Codebase แยก และไม่ใช่ระดับราคาที่บังคับตายตัว ร้านสามารถเริ่มจาก Bundle ที่ใกล้เคียงที่สุดแล้วเพิ่มหรือลด Topic ภายใต้ Dependency rules ได้

## เอกสารหลัก

| เอกสาร | หน้าที่ |
|---|---|
| [Complete Feature Catalog](feature-catalog.md) | Source of truth ของ Feature Group `F01–F16`, Topic ID และ Individual Feature |
| [Recommended Feature Bundles](feature-bundles.md) | รายการ Topic ของ Starter, Dine-in, Kitchen, Full Restaurant และ Café |
| [Catalog governance](../catalog-governance.md) | กติกา ID, Ownership, Source of truth และการเปลี่ยน Catalog |
| [Cross-product shared engines](../cross-product-shared-engines.md) | Engine กลางที่ FoodFlow ใช้ร่วมกับ CareFlow และ JobFlow |
| [Product requirements](../product-requirements/README.md) | เกณฑ์นำ Topic ที่เลือกแล้วไปสร้าง PRD |

## 1. Product overview

### Operating model

```text
Customer Entry
  → Menu Discovery
  → Cart and Order Submission
  → Order Orchestration
  → Staff / Kitchen Fulfilment
  → Serve / Pickup / Delivery
  → Payment and Closing
  → Retention and Management Insight
```

### Primary users

| User/Role | เป้าหมายหลัก |
|---|---|
| Customer | ดูเมนู สั่ง ติดตาม ชำระเงิน และรับบริการโดยไม่เห็นระบบหลังบ้าน |
| Front-of-house / Staff | รับออเดอร์ ดูแลโต๊ะ เสิร์ฟ และจัดการข้อยกเว้น |
| Kitchen / Production | รับงานตาม Station อัปเดตสถานะ ประกอบ และปล่อยออเดอร์ |
| Cashier | ตรวจยอด รับเงิน แยกบิล คืนเงิน และปิดกะ |
| Manager | อนุมัติรายการสำคัญ แก้ปัญหาหน้างาน และควบคุมคุณภาพบริการ |
| Owner / Branch Admin | ตั้งค่าร้าน ดูผลการดำเนินงาน และกำกับหลายสาขา |

### Product boundaries

- FoodFlow ไม่ใช่เพียง POS; คุณค่าหลักคือ Order-to-fulfilment workflow ที่เชื่อมลูกค้า หน้าร้าน ครัว และการเงิน
- Customer Direct Entry ต้องแยกจาก Staff/Admin Entry และไม่เปิดเผย Navigation หรือ Route หลังบ้าน
- Dine-in, Café, Takeaway และ Kitchen เป็น Operating Model ที่ประกอบจาก Topic เดียวกัน ไม่ควรแตกเป็น Application แยก
- Delivery, Inventory, Reservation, Loyalty และ Workforce เป็น Module ที่เปิดตามความจำเป็น ไม่ใช่สิ่งที่ทุกร้านต้องมี

## 2. Complete Feature Catalog

FoodFlow Catalog ครอบคลุม **16 Feature Groups, 103 Feature Topics และ 669 Individual Features** รายละเอียดระดับ Topic และ Feature อยู่ใน [feature-catalog.md](feature-catalog.md)

| Group | Capability domain | ใช้ตอบคำถามหลัก |
|---|---|---|
| `F01` | Customer Entry & Digital Storefront | ลูกค้าเข้าร้าน สาขา และโหมดสั่งอาหารอย่างไร |
| `F02` | Menu, Product & Availability | ร้านขายอะไร ปรับแต่งอย่างไร และพร้อมขายเมื่อใด |
| `F03` | Cart, Checkout & Customer Ordering | ลูกค้ารวบรวม ตรวจ และส่งออเดอร์อย่างไร |
| `F04` | Order Orchestration & Control | ระบบรับ ควบคุมสถานะ และแก้ข้อยกเว้นของออเดอร์อย่างไร |
| `F05` | Dine-in, Table & Guest Service | โต๊ะ Session การสั่งเพิ่ม และคำขอบริการทำงานอย่างไร |
| `F06` | Front-of-house & Staff Operations | พนักงานรับออเดอร์ เสิร์ฟ และขออนุมัติอย่างไร |
| `F07` | Kitchen & Production Operations | ออเดอร์ถูก Route ผลิต ประกอบ และปล่อยอย่างไร |
| `F08` | POS, Billing & Payments | คิดยอด รับเงิน แยกบิล คืนเงิน และปิดกะอย่างไร |
| `F09` | Takeaway, Pickup & Pre-order | รับออเดอร์กลับบ้าน นัดรับ และส่งมอบอย่างไร |
| `F10` | Delivery Operations | กำหนดพื้นที่ Dispatch และติดตามการจัดส่งอย่างไร |
| `F11` | Reservation, Waitlist & Seating | รับจอง จัดคิว และควบคุม Capacity อย่างไร |
| `F12` | Inventory, Recipe, Procurement & Cost | เชื่อมสูตร วัตถุดิบ Stock และต้นทุนอย่างไร |
| `F13` | Customer, Promotion, Loyalty & Feedback | รักษาลูกค้า ทำ Promotion และกู้คืนบริการอย่างไร |
| `F14` | Workforce & Labor Operations | จัดพนักงาน กะ เวลา และต้นทุนแรงงานอย่างไร |
| `F15` | Dashboard, Reporting & Decision Support | เจ้าของร้านเห็นยอด Bottleneck และโอกาสอย่างไร |
| `F16` | Product Administration, Devices & Integration | ตั้งค่า Station อุปกรณ์ และระบบภายนอกอย่างไร |

## 3. Recommended Feature Bundles ทั้ง 5 ชุด

| Bundle | เหมาะกับ | Workflow ที่ต้องจบ | จุดที่ไม่ควรถูกบังคับ |
|---|---|---|---|
| **FoodFlow Starter** | ร้านเล็กเริ่มรับออเดอร์ออนไลน์/QR | Entry → Menu → Cart → Order → Pay Now → Receipt | Table, KDS, Inventory และ Workforce ขั้นสูง |
| **FoodFlow Dine-in** | ร้านนั่งรับประทาน มีโต๊ะและชำระตอนท้าย | QR Table → Table Session → Add-on Order → Serve → Pay Later → Close | Delivery และระบบจัดซื้อ หากร้านยังไม่ใช้ |
| **FoodFlow Kitchen** | ร้านที่ต้องควบคุมงานผลิตหลาย Station | Order source → Route → Produce → Expo → Serve/Handover | Customer storefront, Table และ POS หากรับงานจากระบบอื่น |
| **FoodFlow Full Restaurant** | ร้านบริการเต็มรูปแบบ หลายบทบาท | Customer/Staff order → Table/Kitchen → Cashier → Management | Delivery, Lot, Forecast และ Enterprise control จนกว่าจะจำเป็น |
| **FoodFlow Café** | Café, Bakery และ Quick-service ที่ Modifier สูง | Counter/Online order → Pay Now → KDS → Pickup → Closing | Table Session, Reservation, Course firing และ Pay Later |

รายการ Topic ที่เป็นทางการของแต่ละ Bundle อยู่ใน [feature-bundles.md](feature-bundles.md)

## 4. Bundle comparison matrix

สัญลักษณ์ใน Matrix:

- **●** = Baseline ของ Bundle หรือจำเป็นต่อ Workflow หลัก
- **◐** = เปิดตามรูปแบบร้าน ช่องทาง หรือระดับความพร้อม
- **—** = ไม่เปิดเป็นค่าเริ่มต้น แต่ยังเพิ่มได้เมื่อ Dependency ครบ

| Feature Group | Starter | Dine-in | Kitchen | Full Restaurant | Café |
|---|:---:|:---:|:---:|:---:|:---:|
| `F01` Entry & Storefront | ● | ● | ◐ | ● | ● |
| `F02` Menu & Availability | ● | ● | ● | ● | ● |
| `F03` Cart & Ordering | ● | ● | ◐ | ● | ● |
| `F04` Order Control | ● | ● | ● | ● | ● |
| `F05` Table & Guest Service | — | ● | — | ● | — |
| `F06` Front-of-house | ◐ | ● | ◐ | ● | ◐ |
| `F07` Kitchen & Production | — | ◐ | ● | ● | ● |
| `F08` POS & Payments | ● | ● | ◐ | ● | ● |
| `F09` Takeaway & Pickup | ◐ | ◐ | — | ◐ | ● |
| `F10` Delivery | — | — | — | ◐ | ◐ |
| `F11` Reservation & Waitlist | — | ◐ | — | ● | — |
| `F12` Inventory & Cost | — | ◐ | ◐ | ● | ◐ |
| `F13` CRM, Promotion & Loyalty | ◐ | ◐ | — | ● | ● |
| `F14` Workforce | — | ◐ | ◐ | ● | ◐ |
| `F15` Reporting | ◐ | ● | ● | ● | ● |
| `F16` Administration & Devices | ● | ● | ● | ● | ● |

Matrix นี้ใช้เปรียบเทียบระดับ Feature Group เท่านั้น การเปิดใช้งานจริงต้องตัดสินใจระดับ Topic ID ไม่ใช่เปิดทั้ง Group โดยอัตโนมัติ

## 5. วิธีเลือก Bundle

### คำถามตัดสินใจ

1. ร้านรับออเดอร์จากลูกค้าผ่าน QR/Online และชำระก่อนทำ โดยไม่มีโต๊ะหรือครัวซับซ้อนหรือไม่? → เริ่มที่ **Starter**
2. ลูกค้าผูกกับโต๊ะ สั่งเพิ่มหลายรอบ และชำระตอนท้ายหรือไม่? → เลือก **Dine-in**
3. ปัญหาหลักอยู่ที่การกระจายงานหลาย Station, Timer, Expo หรือ Remake หรือไม่? → เลือก **Kitchen** หรือเพิ่ม Kitchen topics ให้ Bundle อื่น
4. ร้านมีหน้าร้าน โต๊ะ ครัว Cashier Reservation Inventory และหลายบทบาทหรือไม่? → เริ่มที่ **Full Restaurant** แล้วปิดสิ่งที่ไม่ตรง Operating Model
5. ร้านเป็น Quick-service/Café ที่เน้น Counter, Modifier, Pay Now, KDS และ Pickup หรือไม่? → เลือก **Café**

### Selection checklist

- [ ] ระบุช่องทางรับออเดอร์: QR Store, QR Table, Staff POS, Pre-order หรือ Third party
- [ ] ระบุ Fulfilment: Table service, Counter pickup, Kitchen station หรือ Delivery
- [ ] ระบุ Payment timing: Pay Now, Pay Later หรือทั้งสองแบบ
- [ ] ระบุผู้ปฏิบัติงานและ Station ที่ต้อง Login
- [ ] ระบุ Exception สำคัญ: Reject, Cancel, Refund, Remake, Delay และ Sold out
- [ ] ระบุสิ่งที่ต้องควบคุม: Table, Kitchen, Stock, Reservation, Workforce หรือ Multi-branch
- [ ] เลือก Bundle ที่ทำ Workflow หลักจบด้วย Topic เพิ่มน้อยที่สุด

หากร้านมีสอง Operating Model เช่น Dine-in + Café counter ให้เลือก Bundle ที่ครอบคลุม Workflow หลักก่อน แล้วเพิ่ม Topic ของอีกแบบ ไม่ต้องเปิดสอง Product หรือสร้าง Code fork

## 6. วิธีเพิ่ม–ลด Feature Topic

### การเพิ่ม Topic

1. เริ่มจาก Bundle preset และบันทึก Primary operating model
2. เลือก Topic จาก [Complete Feature Catalog](feature-catalog.md) โดยใช้ Topic ID
3. ตรวจ `requires`, `enables`, `conflicts`, Permission, Device และ Data impact
4. ให้ระบบเพิ่ม Dependency ที่ขาดและแสดงเหตุผลก่อนยืนยัน
5. เลือก Scope: ทั้ง Business, เฉพาะ Branch หรือเฉพาะ Station
6. Preview Route, Role, Workflow, Notification และ Report ที่จะเพิ่ม
7. Publish Configuration เป็น Version พร้อม Audit log และ Rollback point

### การลดหรือปิด Topic

1. Core Topic ปิดไม่ได้ขณะ FoodFlow ยัง Active
2. Dependency ปิดไม่ได้หากยังมี Topic, Bundle หรือข้อมูลปฏิบัติการอ้างถึง
3. ระบบต้องแสดงผลกระทบต่อ Route, Order state, Device, Permission, Integration และ Report
4. งานที่กำลัง Active ต้องจบ ย้าย หรือ Cancel ตาม Policy ก่อนปิด
5. ข้อมูลประวัติ Ledger, Audit, Order และ Receipt ต้องคงอ่านได้ตาม Retention policy
6. การปิดต้องสร้าง Configuration version ใหม่ ไม่ลบความสามารถหรือข้อมูลย้อนหลังแบบทันที

### ตัวอย่างการ Customize

```text
FoodFlow Dine-in
  + F07-T01 Kitchen Display System
  + F07-T02 Kitchen Routing        (auto-enabled dependency)
  + F16-T02 Device & Station Management
  - F11 Reservation               (ไม่เปิด เพราะร้านไม่รับจอง)
```

## 7. Dependency ที่ระบบต้องเปิดอัตโนมัติ

| เมื่อเลือก | ระบบต้องเปิด/ตรวจ | เหตุผล |
|---|---|---|
| FoodFlow Product หรือ Bundle ใด ๆ | Shared Foundation P0 + `F16-T01`; เพิ่ม `F04-T01–T03` เมื่อรับ Order และ `F08-T04` เมื่อเปิด Payment | Tenant, Permission และ Configuration เป็นฐานเสมอ ส่วน Order/Payment เปิดตาม Workflow จริง |
| `F05-T01` QR Table Identity หรือ Dine-in | `F05-T02` Table Session + Order/Outstanding reference | ต้องรู้ว่าออเดอร์และยอดค้างเป็นของรอบโต๊ะใด |
| `F08-T03` Pay Later | `F08-T04` Payment ledger + Authorized cashier/staff + Closing control; เพิ่ม `F05-T02` เมื่อเป็น Dine-in | ป้องกันยอดค้างสูญหายและปิด Session ก่อนชำระครบ |
| `F07-T01` Kitchen Display System | `F07-T02` Kitchen Routing + Order source + Menu/Station mapping + `F16-T02` Device management | KDS ทำงานไม่ได้หากไม่รู้ว่า Item ไป Station ใดและจอใดรับงาน |
| Item-level production, Expo หรือ Kitchen timer | KDS/Routing + Order item state + Assignment/SLA events | สถานะ เวลา และการประกอบต้องผูกกับ Item เดียวกัน |
| `F02-T07` Inventory-linked Availability | `F12-T01` Stock master + `F12-T02` Recipe/BOM + Stock movement source | ต้องแปลงยอดวัตถุดิบเป็นความพร้อมขายของเมนูได้ |
| `F12-T03` Automatic stock deduction | Recipe/BOM + Order completion/void events + Reversal rule | ต้องหักและคืน Stock ตามเหตุการณ์ที่ตรวจสอบย้อนหลังได้ |
| Split/Partial/Merge payment | Payment ledger + Bill allocation + Outstanding calculation + Refund/adjustment rule | ยอดรวมและยอดคงเหลือต้องไม่ผิดเมื่อชำระหลายครั้ง |
| Reservation deposit | Reservation record/policy + Payment status + Cancellation/refund rule | เงินมัดจำต้องผูกกับการจองและนโยบายยกเลิก |
| Delivery หรือ Third-party order | Address/zone หรือ Channel mapping + Status mapping + Error queue + Idempotency | ป้องกันออเดอร์ซ้ำ สถานะหลุด และยอดต่างช่องทาง |
| Multi-branch configuration | Shared organization/branch + Data visibility + Branch override + Consolidated reporting | แยกข้อมูลและสิทธิ์สาขาโดยยังบริหารส่วนกลางได้ |

### Dependency enforcement rules

- ระบบต้องแสดง Dependency preview ก่อนเปิด Topic
- Auto-enabled Topic ต้องแสดงว่า Topic ใดเป็นผู้เรียกใช้
- ห้ามปิด Dependency จน Reference count เป็นศูนย์
- หาก Dependency มีหลายทางเลือก เช่น Cashier หรือ Authorized Staff ผู้ดูแลต้องเลือกอย่างน้อยหนึ่งทาง
- Dependency ต้องบังคับทั้ง Entitlement, Navigation, API authorization และ Runtime validation ไม่ใช่ซ่อนหรือแสดงเมนูเพียงอย่างเดียว
- รายละเอียดสุดท้ายต้องถูกย้ายไปเป็น Machine-readable Feature Dependency Matrix ก่อนนำไปสร้างระบบ Configuration จริง

## ลำดับการนำไปพัฒนา

```text
Select Bundle
  → Resolve Topic Dependencies
  → Define Roles and Entry Points
  → Model Workflow and States
  → Create Page Inventory and PRDs
  → Define API/Data/Test Contracts
  → Release behind Entitlement
```

Product Hub นี้ช่วยเลือกขอบเขต ส่วนรายละเอียดที่ทีมพัฒนาต้องใช้ยังคงอ้าง [Feature Catalog](feature-catalog.md), Workflow และ PRD โดย Topic ID เดียวกัน
