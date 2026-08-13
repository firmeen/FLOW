---
title: FLOW Product Development Strategy
document_id: FLOW-PRODUCT-STRATEGY
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# FLOW Product Development Strategy

กลยุทธ์นี้ใช้กำหนดวิธีเปลี่ยน Complete Feature Catalog ให้เป็น Product ที่สร้าง ขาย และขยายได้ โดยไม่ตีความ Catalog ว่าเป็น MVP backlog ทั้งหมด

## Catalog นี้ไม่เท่ากับ MVP

Catalog เป็น **Product option space** ส่วน MVP ต้องเลือก Complete workflow ที่เล็กที่สุด เช่น

```text
FoodFlow MVP
Customer QR → Menu → Cart → Submit → Staff/Kitchen → Status → Pay → Complete
```

การทำ Feature บางส่วนจากทุกกลุ่มพร้อมกันจะทำให้ Demo ดูกว้างแต่ร้านใช้งานจริงไม่ได้ จุดวัดความพร้อมควรเป็น “หนึ่งรายการเดินทางจากต้นจนจบโดยไม่ต้องใช้ระบบเงา” ไม่ใช่จำนวนหน้าเว็บ

## Bundle คือ Preset ไม่ใช่ Code Fork

- ทุก Bundle ต้องทำงานบน Codebase และ Data model เดียวกัน
- ความแตกต่างเกิดจาก Entitlement, Configuration, Workflow template และ Role preset
- ห้ามสร้าง `FoodFlow Café app` แยกจาก `FoodFlow Dine-in app` หากไม่มีเหตุผลทางสถาปัตยกรรมที่ชัด
- ร้านเปลี่ยน Bundle แล้วข้อมูลเดิมต้องยังอยู่ และระบบต้องอธิบายผลของการปิด Topic

## Topic คือหน่วยขายที่เล็กที่สุดที่เหมาะสม

ไม่ควรขายปุ่มย่อย เช่น “ปุ่ม Split bill” แยกเดี่ยว แต่ขาย Topic ที่แก้ปัญหาครบ เช่น `Split, Partial & Combined Payment` เพราะมีทั้ง UI, Rule, Ledger, Permission, Refund และ Report ที่ต้องเดินด้วยกัน

## Dependency ต้องเป็น Machine-readable

ทุก Topic ควรมี Metadata ต่อไปนี้ใน Product registry

```yaml
topic_id: F08-T03
name: Pay Later
type: choose
priority: P0
requires:
  - F04-T03
  - F05-T02
  - F08-T04
  - S02-T03
conflicts: []
recommended_with:
  - F08-T10
  - F15-T01
```

เมื่อผู้ดูแลเปิด Topic ระบบควรเปิด Dependency หรือขอให้เลือก Implementation ที่เข้ากัน แทนที่จะปล่อย Configuration ที่ทำงานไม่จบ

## Data Sensitivity ต้องไม่ถูกใช้เป็น Upsell แบบไร้เหตุผล

- CareFlow Clinical extension เปิดตามความจำเป็นของบริการ ไม่ใช่เพราะลูกค้าซื้อแพ็กเกจแพง
- Before/After media, Allergy, Consent และ Treatment record ต้องแยก Permission และ Retention
- JobFlow Location tracking ต้องทำเฉพาะเวลางานและวัตถุประสงค์ที่ประกาศ
- FoodFlow Payment evidence และ Customer history ต้องมี Access boundary เช่นกัน

## Analytics ต้องพึ่ง Operational Discipline

- Dashboard P1 แสดง Fact จาก Transaction ที่เชื่อถือได้
- Forecast/Recommendation เป็น P2 เพราะต้องมี Historical data, Data quality และ Feedback loop
- อย่าเปิด “AI Recommendation” หากไม่มี Confidence, Human approval และการวัด Error
- Metric ของพนักงานต้องคำนึงถึงประเภทงาน ความซับซ้อน และคุณภาพ ไม่ใช้ความเร็วอย่างเดียว

## Product Sequencing ที่แนะนำ

1. **Foundation:** Tenant, Branch, Auth, RBAC, Workflow, Audit และ Entitlement
2. **Beachhead workflow:** เลือกหนึ่ง Bundle ที่มีลูกค้าทดสอบจริง
3. **Operational depth:** Exception, Payment integrity, Notification และ Reporting
4. **Adjacent bundle:** Reuse Engine แล้วเพิ่ม Topic ที่ต่าง
5. **Second Product:** Reuse Shared Foundation แต่รักษา Domain model ที่จำเป็น
6. **Optimization:** Inventory, CRM, Advanced analytics และ Integration
7. **Scale:** Multi-branch, Ecosystem API, Automation และ Forecast

สำหรับบริบท FLOW ปัจจุบัน FoodFlow Dine-in หรือ FoodFlow Café เป็น Beachhead ที่เหมาะกว่าการพัฒนา Product ทั้งสามพร้อมกัน เพราะเห็น Customer-to-operation flow ชัดและใช้ Shared Engine ที่จะต่อยอดไป Queue, Appointment และ Job ได้

## หลักการสรุป

> FLOW ควรมี Catalog ที่กว้างพอให้เห็น Product Universe แต่ต้องขายและพัฒนาเป็น Topic ที่แก้ Workflow หนึ่งช่วงให้จบ โดยใช้ Bundle เป็นจุดเริ่มต้น ไม่ใช่ข้อจำกัดถาวร และใช้ Dependency ป้องกันไม่ให้ร้านประกอบระบบจน Workflow ขาดตอน

## Related documents

- [Product documentation hub](../04-product/README.md)
- [Platform overview](../04-product/platform-overview.md)
- [Feature market-pattern validation](../03-research/validation-results/feature-market-validation.md)
