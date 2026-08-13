---
title: FoodFlow Recommended Feature Bundles
document_id: FOODFLOW-BUNDLES
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# FoodFlow Recommended Feature Bundles

Bundle คือ Preset ของ Feature Topic ไม่ใช่ Code fork หรือข้อจำกัดถาวร รายละเอียด Feature ต้องอ่านจาก [FoodFlow Feature Catalog](feature-catalog.md)

Bundle ทั้งห้าชุดเป็น **Solution Preset** ไม่ใช่ Product ใหม่และไม่ใช่ลำดับราคาแบบตายตัว

## FoodFlow Starter

**เหมาะกับ:** ร้านเล็กที่ต้องการเมนูดิจิทัล รับออเดอร์จาก QR และชำระก่อนเริ่มทำ

### Topic หลัก

- `F01-T01` Customer Direct Entry
- `F01-T02` QR Store Entry
- `F02-T01–T06` Menu, Presentation, Variant/Modifier ที่จำเป็น และ Availability
- `F03-T01–T02` Cart และ Order submission
- `F04-T01–T03` Intake, Acceptance และ Lifecycle
- `F08-T02` Pay Now
- `F08-T04` Payment ledger
- `F08-T09` Digital receipt
- Shared Foundation P0

**ตัวเลือกแนะนำ:** `F02-T08` Menu discovery, `F09-T01` Takeaway, `F13-T02` Promotion
**ไม่ควรบังคับ:** Table, Staff account, KDS, Inventory และ Advanced dashboard

## FoodFlow Dine-in

**เหมาะกับ:** ร้านนั่งรับประทานที่ลูกค้าสแกน QR โต๊ะ สั่งเพิ่มได้ และชำระตอนท้าย

### Topic หลัก

- Starter ordering topics ที่เกี่ยวข้อง
- `F01-T03` Ordering mode
- `F03-T04` Add-on order
- `F05-T01–T05` QR table, Session, Table status, Move/Merge และ Service request
- `F06-T01–T04` Staff order, Table operation, Serve และ Manager approval
- `F08-T03–T04` Pay Later และ Payment ledger
- `F08-T06–T10` Split bill, Charge/Tax, Adjustment, Receipt และ Cash closing ตามการใช้งาน
- `F15-T01` Daily operation overview

**Dependency สำคัญ:** Pay Later ต้องเปิด `Table Session + Outstanding balance + Authorized cashier/staff + Closing control` พร้อมกัน
**ตัวเลือกแนะนำ:** `F03-T03` Group ordering, `F11` Reservation/Waitlist, `F07` Kitchen

## FoodFlow Kitchen

**เหมาะกับ:** ร้านที่ต้องการยกระดับการรับ–กระจาย–ทำ–ปล่อยออเดอร์ในครัว โดยรับ Order จาก FoodFlow หรือระบบภายนอก

### Topic หลัก

- `F04-T01–T07` Unified order control และ Exception
- `F06-T03` Serve confirmation
- `F07-T01–T05` KDS, Routing, Item status, Timer และ Expo
- `F07-T07` Recall/Remake
- `F16-T02` Device & station management
- `F15-T04` Kitchen performance
- Shared Assignment, SLA, Notification และ Audit

**Dependency สำคัญ:** ต้องมี Order source อย่างน้อยหนึ่งแหล่งและ Menu/Station mapping
**ตัวเลือกแนะนำ:** `F07-T06` Course firing, `F07-T08` Kitchen printing, Third-party order integration

## FoodFlow Full Restaurant

**เหมาะกับ:** ร้านบริการเต็มรูปแบบที่มีหน้าร้าน ครัว แคชเชียร์ การจอง และการบริหารหลายบทบาท

### Topic หลัก

- `F01–F08` ทุก P0/P1 ที่ตรงกับ Operating model
- `F09` เมื่อมี Pickup/Pre-order
- `F11` Reservation, Deposit และ Waitlist
- `F12-T01–T05` Inventory, Recipe, Movement, Count และ Waste
- `F13-T01–T07` Customer, Promotion, Loyalty และ Feedback
- `F14-T01–T03` Staff, Schedule และ Attendance
- `F15-T01–T05` Operations, Sales, Menu, Kitchen และ Customer analytics
- `F16-T01–T03` Configuration, Devices และ Integration

**ไม่เปิดอัตโนมัติ:** Delivery, Lot traceability, Forecast, Enterprise branch control—เปิดเมื่อร้านมีความพร้อมจริง

## FoodFlow Café

**เหมาะกับ:** คาเฟ่ เบเกอรี่ ร้านเครื่องดื่ม และ Quick-service ที่มี Modifier มาก รับ Order หน้าเคาน์เตอร์/ออนไลน์ และผลิตผ่าน KDS

### Topic หลัก

- `F01-T01–T03` Entry และ Ordering mode
- `F02-T01–T06` Menu, Variant, Modifier, Combo และ Availability
- `F03-T01–T02` Cart/Checkout
- `F04-T01–T04` Unified order flow
- `F07-T01–T05` KDS และ Production
- `F08-T01–T02, T04, T07, T09–T10` Counter POS, Pay Now และ Closing
- `F09-T01–T03` Takeaway/Pre-order/Pickup
- `F13-T02–T04` Promotion, Coupon และ Loyalty
- `F15-T02–T04` Channel, Menu และ Kitchen analytics

**ตัวเลือกแนะนำ:** Recipe/Stock, Gift card, Delivery integration
**ไม่ควรบังคับ:** Table session, Reservation, Course management และ Pay Later
