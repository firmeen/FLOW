---
title: FLOW Platform Overview
document_id: FLOW-PLATFORM-OVERVIEW
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: false
---
# FLOW Platform Overview

FLOW เป็น Configurable Vertical SaaS Platform สำหรับเชื่อม Customer Action เข้ากับ Operational Workflow และ Management Visibility ของธุรกิจ SME

## Product architecture

| Layer | หน้าที่ |
|---|---|
| Shared Foundation | Tenant, branch, identity, permission, workflow, customer, notification, files, audit และ integration |
| FoodFlow | Order-to-fulfilment สำหรับร้านอาหารและเครื่องดื่ม |
| CareFlow | Booking-to-service สำหรับธุรกิจนัดหมาย คิว พนักงาน และทรัพยากร |
| JobFlow | Intake-to-handover สำหรับงานซ่อม งานภาคสนาม และงานตาม Ticket |

## Core operating principle

แต่ละ Product ใช้ Engine กลางร่วมกัน แต่ไม่บังคับให้ Domain Model เหมือนกันทั้งหมด ตัวอย่างเช่น Order, Appointment และ Job Ticket สามารถใช้ Workflow Engine เดียวกันได้ แต่ต้องมี Entity, State transition และกฎธุรกิจเฉพาะของตนเอง

## Packaging model

1. ร้านเลือก Product และ Recommended Bundle เป็นค่าตั้งต้น
2. ระบบเปิด Feature Topic ตาม Bundle
3. Dependency ถูกเปิดอัตโนมัติและปิดไม่ได้หากยังมี Topic อื่นพึ่งพา
4. ร้านเพิ่มหรือลด Choose/Advanced Topic ตาม Operating Model
5. Entitlement สุดท้ายถูกบันทึกระดับ Workspace หรือ Branch ตามกติกา Governance

## Product boundaries

- FoodFlow ไม่ควรถูกลดเหลือเพียง POS เพราะคุณค่าหลักอยู่ที่การเชื่อม Customer Order กับ Kitchen และ Service operation
- CareFlow ต้องแยกข้อมูลบริการทั่วไปออกจาก Clinical/Sensitive Data Extension อย่างชัดเจน
- JobFlow ต้องเก็บหลักฐานและประวัติการเปลี่ยนสถานะตลอดเส้นทางตั้งแต่ Intake ถึง Acceptance/Warranty
- Shared Foundation ต้องไม่กลายเป็น Domain ที่รวมทุก Entity จน Product แต่ละตัวสูญเสียกฎธุรกิจเฉพาะ

## Related documents

- [FLOW Shared Foundation feature catalog](flow-core/feature-catalog.md)
- [Cross-product shared engines](cross-product-shared-engines.md)
- [Product development strategy](../01-strategy/product-development-strategy.md)
- [Catalog governance](catalog-governance.md)
