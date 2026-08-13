---
title: FLOW Product Documentation
document_id: FLOW-PRODUCT-INDEX
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# FLOW Product Documentation

เอกสารส่วนนี้เป็นศูนย์กลางนิยามผลิตภัณฑ์ของ FLOW ครอบคลุม Shared Foundation, FoodFlow, CareFlow และ JobFlow ตั้งแต่ Feature Taxonomy ไปจนถึง Bundle, Strategy และเอกสารที่ต้องแตกต่อเพื่อพัฒนา

## Document map

| ขอบเขต | Entry point / Source of truth | เอกสารประกอบ |
|---|---|---|
| Platform | [Platform overview](platform-overview.md) | [Cross-product shared engines](cross-product-shared-engines.md) |
| Shared Foundation | [FLOW Core feature catalog](flow-core/feature-catalog.md) | [Catalog governance](catalog-governance.md) |
| FoodFlow | [Product Hub](foodflow/README.md) | [Feature catalog](foodflow/feature-catalog.md) · [5 Recommended bundles](foodflow/feature-bundles.md) |
| CareFlow | [Product Hub](careflow/README.md) | [Feature catalog](careflow/feature-catalog.md) · [5 Recommended bundles](careflow/feature-bundles.md) |
| JobFlow | [Product Hub](jobflow/README.md) | [Feature catalog](jobflow/feature-catalog.md) · [5 Recommended bundles](jobflow/feature-bundles.md) |
| Product delivery | [Product requirement process](product-requirements/README.md) | [Feature Topic template](product-requirements/feature-topic-template.md) · [Workflow guide](workflows/README.md) |
| Strategy | [Product development strategy](../01-strategy/product-development-strategy.md) | [Market-pattern validation](../03-research/validation-results/feature-market-validation.md) |

## เริ่มต้นเลือก Product และ Bundle

| Product | Operating model | Recommended Bundles |
|---|---|---|
| [FoodFlow](foodflow/README.md) | Order → Kitchen/Service → Payment | Starter · Dine-in · Kitchen · Full Restaurant · Café |
| [CareFlow](careflow/README.md) | Booking/Queue → Staff/Resource → Service | Solo · Team · Spa · Clinic · Full Business |
| [JobFlow](jobflow/README.md) | Intake → Work Order → Execution → Handover | Starter · Repair · Workshop · Field Service · Full Operation |

แต่ละ Product Hub รวม Product overview, Catalog map, Bundle comparison matrix, วิธีเลือก Bundle, วิธีเพิ่ม–ลด Topic และ Dependency ที่ต้องเปิดอัตโนมัติไว้ในหน้าเดียว ส่วนรายละเอียด Feature และ Bundle ที่เป็นทางการยังคงอยู่ในไฟล์ Source of truth ที่ Hub เชื่อมไปหา

## Catalog coverage baseline

| Product scope | Feature Groups | Feature Topics | Individual Features |
|---|---:|---:|---:|
| Shared Foundation | 8 | 28 | 169 |
| FoodFlow | 16 | 103 | 669 |
| CareFlow | 16 | 85 | 526 |
| JobFlow | 18 | 103 | 635 |
| **รวม** | **58** | **319** | **1,999** |

> ตัวเลขนี้เป็น Baseline ของ Catalog ฉบับ 1.0 เมื่อมีการเพิ่ม ยกเลิก หรือแยก Topic ต้องปรับตารางนี้ใน PR เดียวกัน

## Taxonomy และวิธีอ่าน Catalog

เอกสารนี้แยกสิ่งที่มักถูกเรียกรวมกันว่า “ฟีเจอร์” ออกเป็น 4 ระดับ

```text
Product
└── FXX/CXX/JXX — Feature Group
    └── [Type · Priority] TXX — Feature Topic
        └── Individual Feature
```

ตัวอย่าง

```text
FoodFlow
└── F05 — Dine-in & Table Management
    └── [Choose · P1] F05-T02 — Table Session
        ├── F05-T02-01 — เปิดรอบการใช้งานโต๊ะ
        ├── F05-T02-02 — เชื่อมออเดอร์เข้ากับรอบโต๊ะ
        └── F05-T02-03 — ปิดรอบเมื่อชำระครบ
```

### ความหมายของแต่ละระดับ

| ระดับ | ความหมาย | ใช้ตัดสินใจเรื่องใด |
|---|---|---|
| Product | Vertical product เช่น FoodFlow | ตลาดและ Operating Model หลัก |
| Feature Group | ขอบเขตความสามารถขนาดใหญ่ | Ownership, Architecture และ Roadmap |
| Feature Topic | หน่วยความสามารถที่เปิด–ปิดและนำไปจัด Bundle ได้ | Packaging, Entitlement และราคา |
| Individual Feature | พฤติกรรมย่อยที่ผู้ใช้หรือระบบทำได้ | Page, API, Permission และ Test Case |

### ประเภทของ Feature Topic

| ป้าย | ความหมาย |
|---|---|
| `Core` | จำเป็นต่อ Product หรือ Workflow หลัก ปิดไม่ได้เมื่อเปิด Product นั้น |
| `Choose` | ร้านเลือกเปิดหรือไม่เปิดได้ตามรูปแบบการทำงาน |
| `Dependency` | ระบบเปิดให้อัตโนมัติเมื่อ Topic อื่นต้องพึ่งพา ไม่ควรขายแยก |
| `Advanced` | ต้องมีความพร้อมด้านข้อมูล กระบวนการ อุปกรณ์ หรือ Integration เพิ่ม |

### ระดับความสำคัญเชิงผลิตภัณฑ์

| Priority | ความหมาย |
|---|---|
| `P0` | Minimum usable workflow — หากไม่มี Workflow หลักจะไม่สมบูรณ์หรือเสี่ยงต่อข้อมูลผิด |
| `P1` | Bundle-complete — ทำให้ Solution Bundle หลักใช้งานในร้านจริงได้ดี |
| `P2` | Growth & optimization — เพิ่มรายได้ ลดงานซ้ำ หรือยกระดับประสบการณ์ |
| `P3` | Scale & ecosystem — เหมาะกับหลายสาขา Automation ขั้นสูง หรือระบบภายนอก |

> Priority ไม่ได้แปลว่าทุก P0 ของทั้งสาม Product ต้องพัฒนาพร้อมกัน ควรเลือก Product Beachhead หนึ่งตัว แล้วทำ P0 ของ Workflow ที่ขายจริงให้จบตั้งแต่ Entry ถึง Completion ก่อน

### กติกาการจัด Bundle

1. Bundle เลือกในระดับ **Feature Topic** ไม่ใช่เลือกปุ่มย่อยทีละปุ่ม
2. Topic ที่เป็น Dependency ต้องเปิดอัตโนมัติและแสดงเหตุผลให้ผู้ดูแลร้านทราบ
3. ร้านเริ่มจาก Bundle แนะนำ แล้วเพิ่ม–ลด `Choose` หรือ `Advanced` ได้ภายใต้ Dependency ที่ถูกต้อง
4. `Full` หมายถึงครอบคลุม Operating Model ไม่ได้หมายถึงเปิดทุก Topic โดยอัตโนมัติ เช่น ร้านเสริมสวยทั่วไปไม่ควรได้ Clinical Record เพียงเพราะซื้อ CareFlow Full Business
5. Feature Catalog คือ Product Universe ไม่ใช่ Commitment ว่าทุก Feature อยู่ใน MVP หรือรวมอยู่ในราคาเดียว

## ลำดับเอกสารถัดไป

หลังยืนยัน Catalog ฉบับนี้ ควรสร้างเอกสารต่อโดยไม่ข้ามลำดับ

1. `Feature Dependency Matrix`
2. `Bundle-to-Topic Entitlement Matrix`
3. `Role & Permission Matrix`
4. `Entry Point and Authentication Map`
5. `Business Workflow & Status Transition Specification`
6. `Navigation and Page Inventory`
7. `Page-to-Feature Matrix`
8. `UI Component, Action, Feedback and Animation Specification`
9. `API/Data Contract and Event Catalog`
10. `Acceptance Test Catalog`

## หลักการสรุป

> FLOW ควรมี Catalog ที่กว้างพอให้เห็น Product Universe แต่ต้องขายและพัฒนาเป็น Topic ที่แก้ Workflow หนึ่งช่วงให้จบ โดยใช้ Bundle เป็นจุดเริ่มต้น ไม่ใช่ข้อจำกัดถาวร และใช้ Dependency ป้องกันไม่ให้ร้านประกอบระบบจน Workflow ขาดตอน
