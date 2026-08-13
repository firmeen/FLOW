---
title: FoodFlow Feature Catalog
document_id: FOODFLOW-CATALOG
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# FoodFlow Feature Catalog

เอกสารนี้เป็น Source of truth ของ Feature Group, Feature Topic และ Individual Feature สำหรับ FoodFlow. Bundle และเอกสารส่งมอบต้องอ้างรหัสจาก Catalog นี้

- [Recommended Feature Bundles](feature-bundles.md)
- [Catalog governance](../catalog-governance.md)

**Operating model:** Customer Entry → Menu Discovery → Order → Fulfilment → Service/Delivery → Payment → Retention → Management

**Primary roles:** Customer, Waiter/Staff, Kitchen, Cashier, Manager, Owner, Branch Admin

## F01 — Customer Entry & Digital Storefront

### `[Core · P0] F01-T01 — Customer Direct Entry`

- `F01-T01-01` เข้าหน้าร้านผ่าน Public URL โดยไม่ต้อง Login
- `F01-T01-02` เปิดหน้าร้านตาม Business/Branch identifier
- `F01-T01-03` แสดงชื่อร้าน โลโก้ สาขา เวลาเปิด–ปิด และช่องทางติดต่อ
- `F01-T01-04` แสดงสถานะ Open, Closing soon, Paused และ Closed
- `F01-T01-05` ไม่แสดง Navigation หรือ Route ของระบบหลังบ้าน
- `F01-T01-06` รองรับ Deep link ไปหมวดหมู่หรือเมนูที่กำหนด
- `F01-T01-07` ตรวจ Link ที่หมดอายุ ถูกปิด หรือไม่พบร้าน

### `[Choose · P0] F01-T02 — QR Store Entry`

- `F01-T02-01` สร้าง QR กลางของร้านหรือสาขา
- `F01-T02-02` ดาวน์โหลด QR สำหรับพิมพ์
- `F01-T02-03` กำหนด Landing destination
- `F01-T02-04` เปิด ปิด หรือ Rotate token ของ QR
- `F01-T02-05` แสดง Preview ก่อนนำไปใช้
- `F01-T02-06` บันทึกจำนวนครั้งที่สแกนโดยไม่เก็บข้อมูลเกินจำเป็น

### `[Choose · P1] F01-T03 — Ordering Mode Selection`

- `F01-T03-01` เลือก Dine-in
- `F01-T03-02` เลือก Counter/Takeaway
- `F01-T03-03` เลือก Pre-order
- `F01-T03-04` เลือก Delivery
- `F01-T03-05` แสดงเฉพาะช่องทางที่เปิดใช้ในสาขาและเวลานั้น
- `F01-T03-06` อธิบายเงื่อนไข ค่าบริการ และเวลาประมาณการก่อนเลือก
- `F01-T03-07` ล็อกหรือให้ยืนยันใหม่เมื่อเปลี่ยน Mode หลังมีสินค้าในตะกร้า

### `[Choose · P1] F01-T04 — Branch Selection`

- `F01-T04-01` แสดงสาขาที่เปิดให้บริการ
- `F01-T04-02` ค้นหาตามชื่อหรือพื้นที่
- `F01-T04-03` แสดงระยะทางเมื่อผู้ใช้อนุญาตตำแหน่ง
- `F01-T04-04` แสดงบริการที่รองรับแยกตามสาขา
- `F01-T04-05` จดจำสาขาล่าสุดแบบไม่บังคับ
- `F01-T04-06` เตือนก่อนเปลี่ยนสาขาหากมีตะกร้าอยู่

### `[Choose · P2] F01-T05 — Customer Account Entry`

- `F01-T05-01` ใช้งานต่อแบบ Guest
- `F01-T05-02` สมัครสมาชิกด้วยเบอร์โทรหรือ Email
- `F01-T05-03` Login ด้วย OTP หรือ Credential ที่กำหนด
- `F01-T05-04` เชื่อม Guest order กับบัญชีหลังยืนยันตัวตน
- `F01-T05-05` ดูประวัติการสั่งและสิทธิสมาชิก
- `F01-T05-06` Logout โดยไม่ทำลาย Public browsing session ที่ไม่ละเอียดอ่อน

### `[Choose · P2] F01-T06 — Localization & Accessibility`

- `F01-T06-01` เลือกภาษา
- `F01-T06-02` รองรับข้อความและชื่อเมนูหลายภาษา
- `F01-T06-03` แสดงราคาและรูปแบบตัวเลขตาม Locale
- `F01-T06-04` รองรับ Font scaling และ Keyboard navigation
- `F01-T06-05` ใช้ Label ที่ Screen reader เข้าใจ
- `F01-T06-06` รองรับ Reduced motion

## F02 — Menu, Product & Availability

### `[Core · P0] F02-T01 — Menu Catalog`

- `F02-T01-01` สร้างและแก้ไขรายการเมนู
- `F02-T01-02` กำหนดชื่อ คำอธิบาย รูปภาพ และราคา
- `F02-T01-03` จัดเมนูเข้าหมวดหมู่
- `F02-T01-04` เรียงลำดับหมวดหมู่และเมนู
- `F02-T01-05` เปิดใช้งาน ซ่อน หรือ Archive เมนู
- `F02-T01-06` Duplicate เมนูเพื่อสร้างรายการคล้ายกัน
- `F02-T01-07` กำหนดรหัส SKU/Internal code

### `[Core · P0] F02-T02 — Menu Presentation`

- `F02-T02-01` แสดง Menu card/list
- `F02-T02-02` แสดงรายละเอียดเมนู
- `F02-T02-03` แสดงราคาเริ่มต้นหรือช่วงราคาอย่างถูกต้อง
- `F02-T02-04` แสดง Badge เช่น Recommended, New และ Sold out
- `F02-T02-05` แสดงเวลาขายหรือข้อจำกัดที่เกี่ยวข้อง
- `F02-T02-06` แสดง Placeholder เมื่อไม่มีรูปภาพ
- `F02-T02-07` ซ่อนข้อมูลภายในร้านจากหน้าลูกค้า

### `[Choose · P1] F02-T03 — Variants & Sizes`

- `F02-T03-01` สร้าง Variant เช่น ขนาดหรือชนิด
- `F02-T03-02` กำหนดราคาและ SKU แยก Variant
- `F02-T03-03` ตั้งค่า Variant เริ่มต้น
- `F02-T03-04` เปิด–ปิดขายราย Variant
- `F02-T03-05` จำกัด Variant ตามช่องทางหรือสาขา
- `F02-T03-06` กำหนด Stock linkage ราย Variant

### `[Choose · P1] F02-T04 — Modifiers, Toppings & Instructions`

- `F02-T04-01` สร้าง Modifier group
- `F02-T04-02` กำหนด Single select หรือ Multi-select
- `F02-T04-03` กำหนดจำนวนขั้นต่ำและสูงสุด
- `F02-T04-04` กำหนดตัวเลือกบังคับ
- `F02-T04-05` คิดราคาเพิ่มหรือลดตามตัวเลือก
- `F02-T04-06` ใช้ Modifier group ร่วมกับหลายเมนู
- `F02-T04-07` รับ Special instruction โดยกำหนดขอบเขตข้อความ

### `[Choose · P1] F02-T05 — Combo, Set & Course Menu`

- `F02-T05-01` สร้างชุดเมนูจากหลาย Choice group
- `F02-T05-02` กำหนดจำนวนที่ต้องเลือกในแต่ละกลุ่ม
- `F02-T05-03` กำหนด Upgrade charge
- `F02-T05-04` รองรับ Fixed set และ Build-your-own set
- `F02-T05-05` แสดงความคืบหน้าการเลือกให้ครบ
- `F02-T05-06` Route รายการในชุดไป Station ที่ถูกต้อง
- `F02-T05-07` รองรับ Course sequence สำหรับร้านบริการเต็มรูปแบบ

### `[Core · P0] F02-T06 — Availability & Sold-out Control`

- `F02-T06-01` เปิด–ปิดขายเมนูแบบ Manual
- `F02-T06-02` ตั้ง Sold out ชั่วคราว
- `F02-T06-03` กำหนดวันที่และเวลาขาย
- `F02-T06-04` กำหนดช่องทาง Dine-in, Takeaway หรือ Delivery
- `F02-T06-05` กำหนด Availability รายสาขา
- `F02-T06-06` Sync สถานะเมนูไป Customer, POS และ Kitchen
- `F02-T06-07` ระบุว่าจะซ่อนหรือแสดงรายการที่หมด

### `[Choose · P2] F02-T07 — Inventory-linked Availability`

- `F02-T07-01` ปิดเมนูอัตโนมัติเมื่อวัตถุดิบไม่พอ
- `F02-T07-02` คำนวณจำนวนขายได้จาก Recipe
- `F02-T07-03` แจ้งเตือนก่อนถึง Threshold
- `F02-T07-04` อนุญาต Override โดยผู้มีสิทธิ์
- `F02-T07-05` บันทึกเหตุผลของ Override
- `F02-T07-06` เปิดกลับอัตโนมัติเมื่อรับ Stock ภายใต้กฎที่กำหนด

### `[Choose · P1] F02-T08 — Menu Discovery`

- `F02-T08-01` ค้นหาเมนู
- `F02-T08-02` Filter ตามหมวดหมู่ ราคา หรือคุณสมบัติ
- `F02-T08-03` แสดงเมนูแนะนำโดยร้าน
- `F02-T08-04` แสดงเมนูขายดีจากข้อมูลที่เพียงพอ
- `F02-T08-05` แสดง Recently viewed ใน Session
- `F02-T08-06` รองรับ Campaign collection

### `[Choose · P1] F02-T09 — Dietary, Ingredient & Allergen Information`

- `F02-T09-01` ระบุส่วนประกอบหลัก
- `F02-T09-02` ระบุสารก่อภูมิแพ้
- `F02-T09-03` ระบุ Halal, Vegetarian, Vegan หรือคุณสมบัติอื่น
- `F02-T09-04` แสดงระดับความเผ็ด
- `F02-T09-05` แสดงคำเตือนที่ร้านกำหนด
- `F02-T09-06` ให้ลูกค้า Filter จากคุณสมบัติอาหาร
- `F02-T09-07` แสดงข้อความว่าโปรดสอบถามร้านเมื่อมีความเสี่ยงเฉพาะบุคคล

### `[Choose · P2] F02-T10 — Channel & Time-based Pricing`

- `F02-T10-01` กำหนดราคาตามสาขา
- `F02-T10-02` กำหนดราคาตามช่องทาง
- `F02-T10-03` กำหนดราคา Happy hour หรือช่วงเวลา
- `F02-T10-04` กำหนด Effective date ของราคาใหม่
- `F02-T10-05` เก็บประวัติราคา
- `F02-T10-06` ป้องกันราคาเปลี่ยนกลางออเดอร์โดยเก็บ Price snapshot

## F03 — Cart, Checkout & Customer Ordering

### `[Core · P0] F03-T01 — Cart Management`

- `F03-T01-01` เพิ่มเมนูพร้อม Variant และ Modifier ลงตะกร้า
- `F03-T01-02` เพิ่ม–ลดจำนวน
- `F03-T01-03` แก้ไขตัวเลือกของรายการ
- `F03-T01-04` ลบรายการ
- `F03-T01-05` แสดงราคาต่อรายการและยอดรวม
- `F03-T01-06` แสดงค่าบริการ ภาษี ส่วนลด และยอดสุทธิ
- `F03-T01-07` เก็บตะกร้าชั่วคราวตาม Session
- `F03-T01-08` ตรวจ Availability และราคาซ้ำก่อน Checkout

### `[Core · P0] F03-T02 — Order Review & Submission`

- `F03-T02-01` แสดงสรุปรายการก่อนยืนยัน
- `F03-T02-02` รับหมายเหตุระดับรายการและระดับออเดอร์
- `F03-T02-03` แสดง Mode, โต๊ะ, จุดรับ หรือที่อยู่จัดส่ง
- `F03-T02-04` แสดงเงื่อนไขยกเลิกและการชำระ
- `F03-T02-05` บังคับเลือกข้อมูลที่จำเป็นให้ครบ
- `F03-T02-06` ป้องกัน Double submission
- `F03-T02-07` สร้าง Order number และ Confirmation
- `F03-T02-08` รักษาตะกร้าเมื่อส่งไม่สำเร็จและบอกวิธีแก้

### `[Choose · P1] F03-T03 — Group Ordering`

- `F03-T03-01` สร้าง Group/Share link หรือ QR สำหรับ Session
- `F03-T03-02` ให้หลายคนเพิ่มรายการภายใต้โต๊ะหรือกลุ่มเดียว
- `F03-T03-03` แสดงชื่อเล่นหรือผู้สั่งแต่ละรายการ
- `F03-T03-04` แยกตะกร้ารายบุคคลก่อนรวม
- `F03-T03-05` กำหนด Host ที่ส่งออเดอร์รวม
- `F03-T03-06` จัดการรายการเปลี่ยนแปลงพร้อมกัน
- `F03-T03-07` ปิดการเข้าร่วมเมื่อ Session สิ้นสุด

### `[Choose · P1] F03-T04 — Add-on Order / Order Again`

- `F03-T04-01` สั่งเพิ่มภายใต้ Table session เดิม
- `F03-T04-02` แสดงรายการที่เคยสั่งใน Session
- `F03-T04-03` คัดลอกรายการเดิมกลับเข้าตะกร้า
- `F03-T04-04` แยกหมายเลขรอบการสั่ง
- `F03-T04-05` รวมยอดเข้าบิลเดิมเมื่อใช้ Pay Later
- `F03-T04-06` ป้องกันสั่งเพิ่มหลังขอปิดบิลหรือปิด Session

### `[Choose · P2] F03-T05 — Saved Favorites & Reorder History`

- `F03-T05-01` บันทึกเมนูโปรด
- `F03-T05-02` สั่งซ้ำจากออเดอร์เก่า
- `F03-T05-03` ตรวจเมนู ราคา และ Availability ปัจจุบันก่อนเพิ่ม
- `F03-T05-04` แจ้งเมื่อตัวเลือกเดิมไม่สามารถใช้ได้
- `F03-T05-05` แนะนำตัวเลือกทดแทนที่ร้านกำหนด
- `F03-T05-06` จำกัดการแสดงประวัติเฉพาะเจ้าของบัญชี

### `[Choose · P1] F03-T06 — Customer Cancellation Request`

- `F03-T06-01` ขอให้ร้านยกเลิกทั้งออเดอร์หรือบางรายการ
- `F03-T06-02` เลือกเหตุผล
- `F03-T06-03` ตรวจ Cut-off ตามสถานะการทำและการชำระ
- `F03-T06-04` ส่งให้พนักงานอนุมัติเมื่อจำเป็น
- `F03-T06-05` แจ้งผลอนุมัติ ปฏิเสธ หรือคืนเงิน
- `F03-T06-06` เก็บประวัติคำขอและผู้ตัดสินใจ

## F04 — Order Orchestration & Control

### `[Core · P0] F04-T01 — Order Intake & Unified Queue`

- `F04-T01-01` รับออเดอร์จาก Customer web, POS และ Staff
- `F04-T01-02` แสดง Source และ Ordering mode
- `F04-T01-03` แสดงเวลาเข้าและเวลารอ
- `F04-T01-04` รวมรายการจากทุกช่องทางโดยไม่สร้างซ้ำ
- `F04-T01-05` Filter ตามสาขา ช่องทาง สถานะ และเวลา
- `F04-T01-06` แสดง New order indicator
- `F04-T01-07` รองรับ Idempotency จาก Integration

### `[Core · P0] F04-T02 — Order Acceptance & Rejection`

- `F04-T02-01` Accept ออเดอร์
- `F04-T02-02` Reject ออเดอร์พร้อมเหตุผล
- `F04-T02-03` Auto-accept ตามช่องทางหรือเงื่อนไข
- `F04-T02-04` ตรวจ Payment requirement ก่อน Accept
- `F04-T02-05` แจ้งลูกค้าเมื่อรับหรือปฏิเสธ
- `F04-T02-06` จำกัดเวลารอการตอบรับและ Escalate
- `F04-T02-07` เก็บผู้ตัดสินใจและเวลา

### `[Core · P0] F04-T03 — Order Status Lifecycle`

- `F04-T03-01` รองรับ Draft, Submitted, Accepted และ Rejected
- `F04-T03-02` รองรับ Preparing, Ready และ Served/Picked up
- `F04-T03-03` รองรับ Completed และ Cancelled
- `F04-T03-04` กำหนด Transition ตาม Ordering mode
- `F04-T03-05` แยกสถานะระดับ Order และระดับ Item
- `F04-T03-06` แสดงสถานะลูกค้าที่เข้าใจง่ายจากสถานะภายใน
- `F04-T03-07` บันทึกเวลาในแต่ละสถานะ

### `[Choose · P1] F04-T04 — Order Editing & Exception Control`

- `F04-T04-01` เพิ่ม ลบ หรือเปลี่ยนรายการโดยพนักงานที่มีสิทธิ์
- `F04-T04-02` คำนวณยอดต่างหลังแก้ไข
- `F04-T04-03` ขออนุมัติเมื่อแก้หลังเริ่มทำหรือหลังชำระ
- `F04-T04-04` ระบุเหตุผลการแก้ไข
- `F04-T04-05` ส่ง Update ไป Kitchen และ Cashier
- `F04-T04-06` เก็บ Snapshot ก่อนและหลังแก้
- `F04-T04-07` ป้องกันแก้ไขพร้อมกันจนข้อมูลขัดแย้ง

### `[Choose · P1] F04-T05 — Cancellation, Void & Refund Coordination`

- `F04-T05-01` ยกเลิกรายการก่อนเริ่มทำ
- `F04-T05-02` Void รายการตาม Permission
- `F04-T05-03` เชื่อมการยกเลิกกับ Stock และ Kitchen
- `F04-T05-04` ประเมินยอดที่ต้องคืนหรือยังต้องชำระ
- `F04-T05-05` บังคับเลือกเหตุผลมาตรฐานและหมายเหตุ
- `F04-T05-06` แยก Cancel, Void, Refund และ Waste ให้ถูกความหมาย
- `F04-T05-07` แสดงในรายงาน Exception

### `[Choose · P1] F04-T06 — Priority, Delay & Recovery`

- `F04-T06-01` กำหนด Priority
- `F04-T06-02` แสดงออเดอร์ใกล้หรือเกินเวลาเป้าหมาย
- `F04-T06-03` ระบุ Delay reason
- `F04-T06-04` แจ้งลูกค้าเมื่อเวลาประมาณการเปลี่ยนอย่างมีนัยสำคัญ
- `F04-T06-05` Escalate ออเดอร์ค้าง
- `F04-T06-06` Mark รายการที่ต้องติดตามเป็นพิเศษ

### `[Choose · P1] F04-T07 — Remake Management`

- `F04-T07-01` เปิด Remake จากรายการเดิม
- `F04-T07-02` ระบุสาเหตุ เช่น ผิดสูตร เสียหาย หรือลูกค้าร้องเรียน
- `F04-T07-03` ส่ง Remake ไป Station ที่ถูกต้อง
- `F04-T07-04` เชื่อมกับ Waste และ Cost
- `F04-T07-05` ระบุว่าคิดเงินเพิ่มหรือไม่
- `F04-T07-06` ติดตามเวลา Remake แยกจากรายการเดิม
- `F04-T07-07` วิเคราะห์อัตราและสาเหตุ Remake

## F05 — Dine-in, Table & Guest Service

### `[Choose · P0] F05-T01 — QR Table Identity`

- `F05-T01-01` สร้าง QR แยกตามโต๊ะ
- `F05-T01-02` ผูก QR กับ Branch, Area และ Table
- `F05-T01-03` ระบุโต๊ะอัตโนมัติเมื่อลูกค้าสแกน
- `F05-T01-04` แสดงโต๊ะให้ลูกค้ายืนยันก่อนสั่ง
- `F05-T01-05` Rotate token เมื่อ QR รั่วหรือถูกนำไปใช้ผิดที่
- `F05-T01-06` ปิด QR ของโต๊ะที่เลิกใช้งาน
- `F05-T01-07` ป้องกันการแก้หมายเลขโต๊ะผ่าน URL โดยไม่มีสิทธิ์

### `[Dependency · P0] F05-T02 — Table Session`

- `F05-T02-01` เปิดรอบการใช้งานโต๊ะ
- `F05-T02-02` กำหนดจำนวนแขกและเวลาเริ่ม
- `F05-T02-03` เชื่อมลูกค้าและออเดอร์ทั้งหมดกับ Session
- `F05-T02-04` แสดงยอดสั่ง ยอดชำระ และยอดคงค้าง
- `F05-T02-05` ล็อก Session เมื่อขอเช็กบิล
- `F05-T02-06` ปิด Session เมื่อผ่านเงื่อนไขการชำระและเสิร์ฟ
- `F05-T02-07` Reopen โดยผู้มีสิทธิ์พร้อม Audit

### `[Choose · P1] F05-T03 — Table Status & Floor Plan`

- `F05-T03-01` สร้างโซนและโต๊ะ
- `F05-T03-02` จัดตำแหน่งโต๊ะบน Floor view
- `F05-T03-03` แสดง Available, Occupied, Ordering, Dining, Bill requested และ Cleaning
- `F05-T03-04` แสดงเวลาที่โต๊ะถูกใช้งาน
- `F05-T03-05` Filter ตามโซนและผู้ดูแล
- `F05-T03-06` แสดง Alert โต๊ะที่รอนานหรือมีคำขอ
- `F05-T03-07` เปลี่ยนสถานะด้วยกฎจาก Session โดยลดการกด Manual

### `[Choose · P1] F05-T04 — Move, Merge & Split Table`

- `F05-T04-01` ย้าย Session ไปโต๊ะใหม่
- `F05-T04-02` รวมหลายโต๊ะเป็นกลุ่มเดียว
- `F05-T04-03` แยกโต๊ะออกจากกลุ่ม
- `F05-T04-04` รวมออเดอร์หรือบิลตาม Permission
- `F05-T04-05` ตรวจ Conflict ของโต๊ะปลายทาง
- `F05-T04-06` เก็บประวัติการย้ายและรวม

### `[Choose · P1] F05-T05 — Call Staff & Service Request`

- `F05-T05-01` เรียกพนักงาน
- `F05-T05-02` ขอเติมน้ำหรืออุปกรณ์
- `F05-T05-03` ขอความช่วยเหลือเกี่ยวกับออเดอร์
- `F05-T05-04` ขอเช็กบิล
- `F05-T05-05` ส่งคำขอพร้อมโต๊ะและเวลา
- `F05-T05-06` Assign ให้พนักงานและปิดคำขอเมื่อดำเนินการแล้ว
- `F05-T05-07` ป้องกันการกดคำขอเดิมซ้ำถี่เกินไป

### `[Advanced · P2] F05-T06 — Seating, Covers & Turn Management`

- `F05-T06-01` กำหนด Capacity ของโต๊ะ
- `F05-T06-02` บันทึกจำนวน Covers
- `F05-T06-03` คาดการณ์เวลาว่างจาก Reservation และ Session
- `F05-T06-04` แนะนำโต๊ะตามจำนวนแขก
- `F05-T06-05` ติดตาม Table turn time
- `F05-T06-06` จัดคิว Cleaning ระหว่างรอบ
- `F05-T06-07` วิเคราะห์ Revenue per available seat/hour

## F06 — Front-of-house & Staff Operations

### `[Choose · P0] F06-T01 — Staff Order Taking`

- `F06-T01-01` ค้นหาและเลือกโต๊ะหรือ Ordering mode
- `F06-T01-02` สร้างออเดอร์แทนลูกค้า
- `F06-T01-03` เลือก Variant, Modifier และหมายเหตุ
- `F06-T01-04` ดูราคาและ Promotion ที่ใช้ได้
- `F06-T01-05` Hold หรือ Submit ออเดอร์
- `F06-T01-06` ระบุผู้รับออเดอร์
- `F06-T01-07` ใช้งานบนมือถือหรือแท็บเล็ตแบบ Responsive

### `[Choose · P1] F06-T02 — Waiter Station & Assigned Tables`

- `F06-T02-01` แสดงโต๊ะที่รับผิดชอบ
- `F06-T02-02` แสดงออเดอร์และคำขอที่ต้องดำเนินการ
- `F06-T02-03` รับหรือส่งต่อความรับผิดชอบโต๊ะ
- `F06-T02-04` แสดง Ready items ที่ต้องนำไปเสิร์ฟ
- `F06-T02-05` บันทึกว่าใครรับหรือเสิร์ฟรายการ
- `F06-T02-06` แจ้งเตือนโต๊ะที่รอนาน

### `[Choose · P1] F06-T03 — Serve & Item Confirmation`

- `F06-T03-01` แสดงรายการที่พร้อมเสิร์ฟ
- `F06-T03-02` Confirm การรับจากครัว
- `F06-T03-03` Mark Served ระดับรายการหรือทั้งออเดอร์
- `F06-T03-04` ระบุ Missing item หรือส่งผิด
- `F06-T03-05` ส่งคำขอแก้ไขกลับครัว
- `F06-T03-06` เก็บเวลา Ready-to-served

### `[Choose · P1] F06-T04 — Manager Override & Approval`

- `F06-T04-01` อนุมัติส่วนลดเกินวงเงิน
- `F06-T04-02` อนุมัติ Void, Refund หรือ Reopen
- `F06-T04-03` อนุมัติแก้ไขหลังเริ่มทำ
- `F06-T04-04` Re-authenticate ผู้อนุมัติ
- `F06-T04-05` บันทึกเหตุผลและผู้ร้องขอ
- `F06-T04-06` แสดง Approval queue

### `[Choose · P2] F06-T05 — Shift Handover`

- `F06-T05-01` สรุปโต๊ะและออเดอร์ที่ยังไม่จบ
- `F06-T05-02` สรุปคำขอลูกค้าที่ค้าง
- `F06-T05-03` บันทึก Handover note
- `F06-T05-04` โอน Assignment ให้กะถัดไป
- `F06-T05-05` ยืนยันการรับมอบ
- `F06-T05-06` เก็บประวัติ Handover

## F07 — Kitchen & Production Operations

### `[Choose · P0] F07-T01 — Kitchen Display System`

- `F07-T01-01` แสดง Ticket ที่ส่งเข้าครัวแบบ Real-time
- `F07-T01-02` แสดงเลขออเดอร์ โต๊ะ ช่องทาง และเวลา
- `F07-T01-03` แสดงรายการ Modifier และหมายเหตุเด่นชัด
- `F07-T01-04` Accept, Start, Ready และ Complete ticket
- `F07-T01-05` แสดงสีหรือสัญญาณตามเวลารอ
- `F07-T01-06` รองรับ Touch-friendly full-screen view
- `F07-T01-07` แจ้งเมื่อออเดอร์ถูกแก้หรือยกเลิก

### `[Dependency · P0] F07-T02 — Kitchen Routing`

- `F07-T02-01` กำหนด Prep station ให้เมนู
- `F07-T02-02` Route รายการไปครัวร้อน เครื่องดื่ม ของหวาน หรือ Station อื่น
- `F07-T02-03` แยก Ticket ตาม Station โดยยังเชื่อมกับ Order เดียวกัน
- `F07-T02-04` รองรับรายการที่ต้องผ่านหลาย Station
- `F07-T02-05` Route ใหม่เมื่อ Station หยุดใช้งาน
- `F07-T02-06` ป้องกันรายการตกหล่นเมื่อ Mapping ไม่ครบ

### `[Choose · P1] F07-T03 — Item-level Production Status`

- `F07-T03-01` เริ่มทำและพร้อมเสิร์ฟราย Item
- `F07-T03-02` แสดงความคืบหน้าของ Order จากทุก Station
- `F07-T03-03` Hold Item
- `F07-T03-04` Mark unavailable หลังรับออเดอร์
- `F07-T03-05` ส่ง Exception ไป Staff
- `F07-T03-06` ระบุผู้ทำหรือ Station ที่ทำเสร็จ

### `[Choose · P1] F07-T04 — Kitchen Timer & SLA`

- `F07-T04-01` เริ่มจับเวลาตั้งแต่รับหรือเริ่มทำ
- `F07-T04-02` กำหนด Target time ตามเมนูหรือ Station
- `F07-T04-03` แสดง Warning และ Overdue
- `F07-T04-04` Sort ตาม Priority และเวลาคงเหลือ
- `F07-T04-05` Pause ภายใต้เหตุผลที่อนุญาต
- `F07-T04-06` เก็บ Prep time จริงเพื่อวิเคราะห์

### `[Choose · P1] F07-T05 — Expo & Order Assembly`

- `F07-T05-01` รวมสถานะจากหลาย Station
- `F07-T05-02` แสดงรายการที่ยังขาดก่อนปล่อยออเดอร์
- `F07-T05-03` Confirm ความครบถ้วน
- `F07-T05-04` Mark Ready for service/pickup
- `F07-T05-05` ระบุ Expo staff
- `F07-T05-06` จัดการ Partial ready ตามนโยบายร้าน

### `[Choose · P2] F07-T06 — Course & Firing Control`

- `F07-T06-01` จัดรายการตาม Course
- `F07-T06-02` Hold และ Fire Course
- `F07-T06-03` กำหนด Gap ระหว่าง Course
- `F07-T06-04` ให้พนักงานหน้าร้านสั่ง Fire
- `F07-T06-05` แสดง Course status ต่อโต๊ะ
- `F07-T06-06` เก็บเวลา Course เพื่อวิเคราะห์บริการ

### `[Choose · P1] F07-T07 — Recall, Remake & Exception Queue`

- `F07-T07-01` Recall ticket ที่เพิ่ง Bump
- `F07-T07-02` รับ Remake ticket พร้อมเหตุผล
- `F07-T07-03` แยก Remake จาก New order
- `F07-T07-04` ระบุรายการที่ยกเลิกหรือเปลี่ยน
- `F07-T07-05` ยืนยันว่าเห็นการแก้ไข
- `F07-T07-06` Escalate ticket ที่ไม่มีผู้ตอบสนอง

### `[Choose · P1] F07-T08 — Kitchen Printing`

- `F07-T08-01` พิมพ์ Kitchen ticket
- `F07-T08-02` Route ไป Printer ตาม Station
- `F07-T08-03` กำหนด Template และจำนวนสำเนา
- `F07-T08-04` พิมพ์ซ้ำพร้อมระบุ Reprint
- `F07-T08-05` แจ้ง Printer offline หรือพิมพ์ไม่สำเร็จ
- `F07-T08-06` ป้องกันพิมพ์ซ้ำจาก Retry

## F08 — POS, Billing & Payments

### `[Choose · P0] F08-T01 — Counter POS Workspace`

- `F08-T01-01` เปิดออเดอร์จากหน้า POS
- `F08-T01-02` ค้นหาเมนูและใช้ Quick keys
- `F08-T01-03` เพิ่ม Modifier และหมายเหตุ
- `F08-T01-04` Hold, Recall และ Park sale
- `F08-T01-05` เชื่อม Customer และ Loyalty
- `F08-T01-06` ส่งรายการไป Kitchen หรือ Printer
- `F08-T01-07` คิดเงินจากออเดอร์ที่มีอยู่

### `[Choose · P0] F08-T02 — Pay Now`

- `F08-T02-01` กำหนดให้ชำระก่อนยืนยันหรือก่อนเริ่มทำ
- `F08-T02-02` สร้าง Payment intent
- `F08-T02-03` แสดงยอดและช่องทางที่รองรับ
- `F08-T02-04` Confirm การชำระก่อนเปลี่ยน Order state
- `F08-T02-05` รองรับ Failed, Pending, Paid และ Expired
- `F08-T02-06` ป้องกันการชำระซ้ำ
- `F08-T02-07` คืนสถานะให้ลูกค้าลองใหม่ได้อย่างปลอดภัย

### `[Choose · P0] F08-T03 — Pay Later`

- `F08-T03-01` สร้างยอดค้างชำระผูกกับ Order/Table session
- `F08-T03-02` อนุญาตเริ่มทำก่อนชำระตามนโยบายร้าน
- `F08-T03-03` แสดงยอดคงค้างแบบ Real-time
- `F08-T03-04` ป้องกันปิด Session เมื่อยังชำระไม่ครบ
- `F08-T03-05` ขอเช็กบิลและล็อกการสั่งเพิ่ม
- `F08-T03-06` อนุญาต Manager override พร้อมเหตุผล
- `F08-T03-07` แจ้ง Unpaid session ใน Closing control

### `[Core · P0] F08-T04 — Payment Method & Status Ledger`

- `F08-T04-01` บันทึก Cash, QR transfer, Card และช่องทางอื่น
- `F08-T04-02` แยก Payment attempt จาก Payment สำเร็จ
- `F08-T04-03` เก็บ Reference ของ Provider โดยไม่เก็บข้อมูลลับเกินจำเป็น
- `F08-T04-04` รองรับ Pending verification
- `F08-T04-05` เชื่อม Payment กับ Order, Bill และ Refund
- `F08-T04-06` Reconcile สถานะจาก Provider
- `F08-T04-07` แสดงยอด Paid, Refunded และ Outstanding

### `[Choose · P1] F08-T05 — Manual Transfer Verification`

- `F08-T05-01` แสดง QR หรือข้อมูลรับชำระ
- `F08-T05-02` อัปโหลดหลักฐานการโอน
- `F08-T05-03` แสดง Payment verification queue
- `F08-T05-04` อนุมัติหรือปฏิเสธพร้อมเหตุผล
- `F08-T05-05` ป้องกันใช้หลักฐานเดิมซ้ำตามกฎตรวจสอบ
- `F08-T05-06` แจ้งลูกค้าผลการตรวจสอบ
- `F08-T05-07` เก็บผู้ตรวจสอบและเวลา

### `[Choose · P1] F08-T06 — Split, Partial & Merge Payment`

- `F08-T06-01` แบ่งจ่ายตามรายการ
- `F08-T06-02` แบ่งจ่ายตามจำนวนเงิน
- `F08-T06-03` แบ่งจ่ายเท่า ๆ กันตามจำนวนคน
- `F08-T06-04` ใช้หลาย Payment method ในบิลเดียว
- `F08-T06-05` รวมหลาย Order หรือ Table ภายใต้กฎที่อนุญาต
- `F08-T06-06` แสดงยอดคงเหลือหลังแต่ละการจ่าย
- `F08-T06-07` ป้องกันยอดรวมจ่ายเกินโดยไม่ตั้งใจ

### `[Choose · P1] F08-T07 — Discount, Service Charge, Tax & Tips`

- `F08-T07-01` ใช้ส่วนลดเป็นจำนวนเงินหรือเปอร์เซ็นต์
- `F08-T07-02` จำกัดวงเงินตาม Role
- `F08-T07-03` คำนวณ Service charge
- `F08-T07-04` คำนวณภาษีตาม Configuration
- `F08-T07-05` รับ Tips และระบุการกระจายเมื่อเปิดใช้
- `F08-T07-06` กำหนดลำดับการคำนวณอย่างชัดเจน
- `F08-T07-07` เก็บ Calculation snapshot บนบิล

### `[Choose · P1] F08-T08 — Refund, Void & Adjustment`

- `F08-T08-01` Refund เต็มจำนวนหรือบางส่วน
- `F08-T08-02` Void Payment ที่ยังไม่ Settle ตามเงื่อนไข
- `F08-T08-03` เลือกเหตุผลและขออนุมัติ
- `F08-T08-04` เชื่อมกับรายการที่ยกเลิกและ Stock impact
- `F08-T08-05` บันทึก Provider response
- `F08-T08-06` ออกเอกสาร Adjustment/Credit note เมื่อเกี่ยวข้อง
- `F08-T08-07` ป้องกันคืนเงินเกินยอดที่รับจริง

### `[Choose · P1] F08-T09 — Receipt & Tax Document`

- `F08-T09-01` ออกใบเสร็จ
- `F08-T09-02` ส่งใบเสร็จแบบ Digital
- `F08-T09-03` พิมพ์ใบเสร็จ
- `F08-T09-04` รับข้อมูลสำหรับเอกสารภาษี
- `F08-T09-05` กำหนดเลขเอกสารและสถานะ
- `F08-T09-06` Reprint พร้อม Audit
- `F08-T09-07` Void และออกเอกสารแทนอย่างมี Version

### `[Choose · P1] F08-T10 — Cash Drawer & Shift Reconciliation`

- `F08-T10-01` เปิดกะพร้อมยอดเงินตั้งต้น
- `F08-T10-02` บันทึก Cash in/out พร้อมเหตุผล
- `F08-T10-03` นับเงินสดปลายกะ
- `F08-T10-04` เปรียบเทียบ Expected กับ Actual
- `F08-T10-05` บันทึกส่วนต่างและผู้อนุมัติ
- `F08-T10-06` ปิดกะและล็อกการแก้ไขทั่วไป
- `F08-T10-07` สรุปยอดตามช่องทางชำระ

## F09 — Takeaway, Pickup & Pre-order

### `[Choose · P0] F09-T01 — Immediate Takeaway`

- `F09-T01-01` เลือกรับกลับทันที
- `F09-T01-02` แสดงเวลารอโดยประมาณ
- `F09-T01-03` รับชื่อหรือข้อมูลระบุตัวลูกค้าเท่าที่จำเป็น
- `F09-T01-04` สร้าง Pickup number
- `F09-T01-05` แยก Queue จาก Dine-in
- `F09-T01-06` แจ้งเมื่อพร้อมรับ
- `F09-T01-07` Confirm ว่าลูกค้ารับแล้ว

### `[Choose · P1] F09-T02 — Scheduled Pre-order`

- `F09-T02-01` เลือกวันที่และเวลารับ
- `F09-T02-02` กำหนด Lead time ขั้นต่ำ
- `F09-T02-03` กำหนด Capacity ต่อ Time slot
- `F09-T02-04` ปิด Slot ที่เต็มหรืออยู่นอกเวลาทำการ
- `F09-T02-05` กำหนด Cut-off การแก้หรือยกเลิก
- `F09-T02-06` ส่งออเดอร์เข้าครัวตามเวลาเตรียม ไม่ใช่เวลาสั่งอย่างเดียว
- `F09-T02-07` แจ้งเตือนลูกค้าก่อนเวลารับ

### `[Choose · P1] F09-T03 — Pickup Queue & Handover`

- `F09-T03-01` แสดง Queue ที่กำลังเตรียมและพร้อมรับ
- `F09-T03-02` ค้นหาด้วยเลขออเดอร์ ชื่อ หรือเบอร์โทรตามสิทธิ์
- `F09-T03-03` Verify ผู้รับด้วยข้อมูลที่เหมาะสม
- `F09-T03-04` Mark Handed over
- `F09-T03-05` บันทึกเวลารอรับหลัง Ready
- `F09-T03-06` แจ้งเตือนรายการที่ไม่มีผู้มารับ

### `[Choose · P2] F09-T04 — Curbside or Pickup Point`

- `F09-T04-01` เลือกจุดรับสินค้า
- `F09-T04-02` ลูกค้าแจ้งว่าเดินทางถึงแล้ว
- `F09-T04-03` ระบุข้อมูลรถหรือจุดนัดหมายตามความจำเป็น
- `F09-T04-04` แจ้ง Staff ให้จัดส่งถึงจุดรับ
- `F09-T04-05` Confirm Handover
- `F09-T04-06` เก็บเวลา Arrival-to-handover

## F10 — Delivery Operations

### `[Choose · P1] F10-T01 — Delivery Address & Zone`

- `F10-T01-01` เพิ่มและเลือกที่อยู่จัดส่ง
- `F10-T01-02` ปักหมุดตำแหน่งพร้อมคำอธิบายเพิ่มเติม
- `F10-T01-03` ตรวจว่าอยู่ในพื้นที่ให้บริการ
- `F10-T01-04` กำหนด Zone และค่าจัดส่ง
- `F10-T01-05` กำหนดยอดขั้นต่ำหรือระยะทางสูงสุด
- `F10-T01-06` แจ้งเมื่ออยู่นอกพื้นที่ก่อน Checkout
- `F10-T01-07` แยก Billing address เมื่อจำเป็น

### `[Choose · P1] F10-T02 — Self-delivery Dispatch`

- `F10-T02-01` สร้าง Delivery task จากออเดอร์
- `F10-T02-02` มอบหมาย Rider/พนักงานส่ง
- `F10-T02-03` แสดง Ready for dispatch
- `F10-T02-04` เปลี่ยนสถานะ Assigned, Picked up, On the way และ Delivered
- `F10-T02-05` ส่งข้อมูลติดต่อที่จำเป็นให้ผู้ส่งตาม Permission
- `F10-T02-06` รองรับ Reassignment
- `F10-T02-07` บันทึกเวลาแต่ละขั้น

### `[Advanced · P2] F10-T03 — Route & Delivery Tracking`

- `F10-T03-01` แสดงแผนที่งานส่ง
- `F10-T03-02` จัดลำดับหลายจุดส่ง
- `F10-T03-03` ส่งสถานะหรือ ETA ให้ลูกค้า
- `F10-T03-04` บันทึก Proof of delivery
- `F10-T03-05` ระบุ Failed delivery reason
- `F10-T03-06` จำกัดการเปิดเผยตำแหน่งพนักงานตามนโยบาย

### `[Advanced · P2] F10-T04 — Third-party Delivery Integration`

- `F10-T04-01` รับออเดอร์จากแพลตฟอร์มภายนอก
- `F10-T04-02` Mapping เมนู Modifier และราคา
- `F10-T04-03` รวมออเดอร์เข้าสู่ Unified queue
- `F10-T04-04` Sync Accept, Reject และ Ready status
- `F10-T04-05` แสดง Commission และ Fee จากช่องทาง
- `F10-T04-06` จัดการ Mapping error และ Duplicate
- `F10-T04-07` Reconcile ยอดขายกับ Settlement ภายนอก

## F11 — Reservation, Waitlist & Seating

### `[Choose · P1] F11-T01 — Table Reservation`

- `F11-T01-01` เลือกวันที่ เวลา และจำนวนแขก
- `F11-T01-02` ตรวจ Availability ตาม Capacity และกฎร้าน
- `F11-T01-03` รับข้อมูลติดต่อและคำขอพิเศษ
- `F11-T01-04` สร้างสถานะ Requested หรือ Confirmed
- `F11-T01-05` ส่ง Confirmation
- `F11-T01-06` ให้ลูกค้าดูรายละเอียดผ่านลิงก์
- `F11-T01-07` ป้องกัน Overbooking ตามนโยบาย

### `[Choose · P1] F11-T02 — Reservation Management`

- `F11-T02-01` ดู Day/Timeline reservation view
- `F11-T02-02` Confirm, Edit, Reschedule และ Cancel
- `F11-T02-03` Assign โต๊ะล่วงหน้าหรือเมื่อมาถึง
- `F11-T02-04` Check-in ลูกค้า
- `F11-T02-05` Mark Seated, Completed และ No-show
- `F11-T02-06` บันทึกเหตุผลยกเลิก
- `F11-T02-07` เชื่อม Reservation ไป Table session

### `[Choose · P1] F11-T03 — Reservation Deposit & Policy`

- `F11-T03-01` กำหนดมัดจำคงที่ ต่อคน หรือเปอร์เซ็นต์
- `F11-T03-02` ระบุ Deadline การชำระ
- `F11-T03-03` ยืนยันการจองเมื่อชำระสำเร็จ
- `F11-T03-04` กำหนดนโยบายคืนหรือริบมัดจำ
- `F11-T03-05` นำมัดจำไปหักบิล
- `F11-T03-06` แสดงเงื่อนไขก่อนลูกค้าชำระ
- `F11-T03-07` เก็บการตัดสินใจกรณียกเว้นนโยบาย

### `[Choose · P1] F11-T04 — Walk-in Waitlist`

- `F11-T04-01` เพิ่มลูกค้าเข้าคิวรอโต๊ะ
- `F11-T04-02` บันทึกจำนวนคนและความต้องการที่นั่ง
- `F11-T04-03` แสดงลำดับและเวลารอโดยประมาณ
- `F11-T04-04` แจ้งเมื่อใกล้ถึงคิวหรือโต๊ะพร้อม
- `F11-T04-05` Confirm arrival ภายในเวลาที่กำหนด
- `F11-T04-06` Mark Seated, Cancelled หรือ No response
- `F11-T04-07` เชื่อม Waitlist ไป Table session

### `[Advanced · P2] F11-T05 — Capacity & Demand Control`

- `F11-T05-01` กำหนด Slot capacity ตามวันและช่วงเวลา
- `F11-T05-02` กำหนดระยะเวลาคาดการณ์ต่อ Party size
- `F11-T05-03` Block โต๊ะหรือโซน
- `F11-T05-04` รองรับ Event หรือ Private booking
- `F11-T05-05` คาดการณ์ No-show และ Demand เมื่อมีข้อมูลเพียงพอ
- `F11-T05-06` วิเคราะห์ Conversion จาก Waitlist เป็น Seated

## F12 — Inventory, Recipe, Procurement & Cost

### `[Choose · P1] F12-T01 — Ingredient & Stock Item Master`

- `F12-T01-01` สร้างวัตถุดิบและสินค้า
- `F12-T01-02` กำหนดหน่วยนับและ Conversion
- `F12-T01-03` กำหนด SKU, Barcode และหมวดหมู่
- `F12-T01-04` กำหนด Cost และ Supplier หลัก
- `F12-T01-05` กำหนด Par level และ Reorder point
- `F12-T01-06` เปิด ปิด หรือ Archive รายการ

### `[Choose · P1] F12-T02 — Recipe & Bill of Materials`

- `F12-T02-01` สร้างสูตรต่อเมนูและ Variant
- `F12-T02-02` ระบุปริมาณวัตถุดิบ
- `F12-T02-03` รองรับ Sub-recipe
- `F12-T02-04` คำนวณต้นทุนสูตร
- `F12-T02-05` กำหนด Yield และ Loss factor
- `F12-T02-06` เก็บ Version สูตรและ Effective date
- `F12-T02-07` จำกัดสิทธิ์การดูต้นทุนหรือสูตร

### `[Choose · P1] F12-T03 — Stock Movement & Deduction`

- `F12-T03-01` รับเข้า เบิกออก โอน และปรับยอด
- `F12-T03-02` ตัดวัตถุดิบจากรายการขาย
- `F12-T03-03` คืน Stock เมื่อยกเลิกภายใต้กฎที่กำหนด
- `F12-T03-04` ตัด Stock สำหรับ Remake/Waste อย่างถูกประเภท
- `F12-T03-05` เก็บผู้กระทำ เหตุผล และ Reference
- `F12-T03-06` แสดง On-hand, Reserved และ Available
- `F12-T03-07` ป้องกัน Stock movement ซ้ำจาก Retry

### `[Choose · P1] F12-T04 — Stock Count & Variance`

- `F12-T04-01` สร้างรอบนับ Stock
- `F12-T04-02` Freeze หรือ Snapshot ยอดตามนโยบาย
- `F12-T04-03` บันทึกยอดนับจริง
- `F12-T04-04` แสดงส่วนต่างและมูลค่า
- `F12-T04-05` ขออนุมัติ Adjustment
- `F12-T04-06` วิเคราะห์สาเหตุ Variance

### `[Choose · P1] F12-T05 — Waste, Spoilage & Expiry`

- `F12-T05-01` บันทึกของเสียและสาเหตุ
- `F12-T05-02` ผูก Waste กับวัตถุดิบ เมนู หรือ Remake
- `F12-T05-03` บันทึกปริมาณและมูลค่า
- `F12-T05-04` ติดตามวันหมดอายุเมื่อใช้ Lot
- `F12-T05-05` แจ้งรายการใกล้หมดอายุ
- `F12-T05-06` รายงาน Waste trend

### `[Choose · P2] F12-T06 — Supplier & Purchasing`

- `F12-T06-01` จัดการ Supplier
- `F12-T06-02` สร้าง Purchase request
- `F12-T06-03` อนุมัติคำขอซื้อ
- `F12-T06-04` สร้าง Purchase order
- `F12-T06-05` รับสินค้าและบันทึกส่วนต่าง
- `F12-T06-06` บันทึก Supplier invoice reference
- `F12-T06-07` วิเคราะห์ราคาและ Lead time ของ Supplier

### `[Advanced · P2] F12-T07 — Lot, Batch & Traceability`

- `F12-T07-01` บันทึก Lot/Batch และวันหมดอายุ
- `F12-T07-02` เลือก Lot ตอนรับเข้าและเบิกใช้
- `F12-T07-03` ใช้กฎ FIFO/FEFO
- `F12-T07-04` Trace จาก Supplier lot ไปเมนูหรือช่วงเวลาขาย
- `F12-T07-05` Block Lot ที่มีปัญหา
- `F12-T07-06` สนับสนุน Recall investigation

### `[Advanced · P2] F12-T08 — Food Cost & Margin Control`

- `F12-T08-01` คำนวณต้นทุนมาตรฐานต่อเมนู
- `F12-T08-02` คำนวณต้นทุนจริงจากราคาซื้อ
- `F12-T08-03` เปรียบเทียบ Food cost กับราคาขาย
- `F12-T08-04` แจ้ง Margin ต่ำกว่ากฎ
- `F12-T08-05` วิเคราะห์ผลกระทบเมื่อวัตถุดิบเปลี่ยนราคา
- `F12-T08-06` แยก Gross margin ตามเมนู หมวด และสาขา

## F13 — Customer, Promotion, Loyalty & Feedback

### `[Choose · P1] F13-T01 — Restaurant Customer Profile`

- `F13-T01-01` รวมข้อมูลติดต่อและประวัติการสั่ง
- `F13-T01-02` แสดงสาขาและช่องทางที่ใช้
- `F13-T01-03` เก็บ Preference ที่ลูกค้าให้ไว้
- `F13-T01-04` เพิ่ม Customer tag และ Internal note ตามสิทธิ์
- `F13-T01-05` แสดงยอดใช้จ่ายและความถี่
- `F13-T01-06` Merge ข้อมูลซ้ำโดยมี Audit

### `[Choose · P1] F13-T02 — Promotion Rule`

- `F13-T02-01` ส่วนลดทั้ง Order หรือเฉพาะรายการ
- `F13-T02-02` Buy X Get Y
- `F13-T02-03` Bundle price
- `F13-T02-04` ส่วนลดตามยอดขั้นต่ำ
- `F13-T02-05` กำหนดวัน เวลา ช่องทาง สาขา และกลุ่มลูกค้า
- `F13-T02-06` กำหนดจำนวนสิทธิ์และจำนวนครั้งต่อคน
- `F13-T02-07` กำหนดกฎการใช้ร่วมกับ Promotion อื่น
- `F13-T02-08` Preview ผลการคำนวณก่อนเปิดใช้

### `[Choose · P1] F13-T03 — Coupon & Redemption`

- `F13-T03-01` สร้าง Coupon code เดี่ยวหรือหลาย Code
- `F13-T03-02` ตรวจ Validity และ Eligibility
- `F13-T03-03` Reserve สิทธิ์ระหว่าง Checkout ตามเวลาที่กำหนด
- `F13-T03-04` บันทึก Redemption
- `F13-T03-05` คืนสิทธิ์เมื่อออเดอร์ล้มเหลวตามนโยบาย
- `F13-T03-06` ป้องกัน Code reuse เกินกำหนด

### `[Choose · P1] F13-T04 — Loyalty Points`

- `F13-T04-01` สมัครสมาชิก Loyalty
- `F13-T04-02` สะสมคะแนนตามยอดหรือกฎ
- `F13-T04-03` แลกคะแนนเป็น Reward
- `F13-T04-04` แสดงยอดคะแนนและประวัติ
- `F13-T04-05` กำหนดวันหมดอายุ
- `F13-T04-06` ปรับคะแนนโดยผู้มีสิทธิ์พร้อมเหตุผล
- `F13-T04-07` Reverse คะแนนเมื่อ Refund

### `[Choose · P2] F13-T05 — Membership Tier & Benefits`

- `F13-T05-01` สร้างระดับสมาชิก
- `F13-T05-02` กำหนดเงื่อนไขเลื่อนหรือลดระดับ
- `F13-T05-03` กำหนด Benefit ตาม Tier
- `F13-T05-04` แสดง Progress ไป Tier ถัดไป
- `F13-T05-05` กำหนดระยะเวลาประเมิน
- `F13-T05-06` แจ้งการเปลี่ยนระดับ

### `[Choose · P2] F13-T06 — Gift Card & Store Credit`

- `F13-T06-01` ออก Gift card หรือ Store credit
- `F13-T06-02` เติมและใช้ยอดคงเหลือ
- `F13-T06-03` แสดง Balance และประวัติ
- `F13-T06-04` จำกัดสาขาหรือวันหมดอายุ
- `F13-T06-05` ป้องกันใช้ยอดเกินหรือซ้ำ
- `F13-T06-06` แยก Accounting liability จาก Revenue

### `[Choose · P1] F13-T07 — Feedback & Service Recovery`

- `F13-T07-01` ขอคะแนนหลัง Completed order
- `F13-T07-02` รับความคิดเห็นระดับออเดอร์หรือรายการ
- `F13-T07-03` แยก Feedback ภายในจาก Review สาธารณะ
- `F13-T07-04` แจ้ง Manager เมื่อคะแนนต่ำ
- `F13-T07-05` เปิด Recovery task และติดตามการตอบกลับ
- `F13-T07-06` เชื่อมสาเหตุกับ Delay, Remake หรือ Staff action

### `[Advanced · P2] F13-T08 — Customer Segmentation & Campaign`

- `F13-T08-01` แบ่งกลุ่มตามความถี่ ยอดใช้จ่าย หรือช่วงไม่กลับมา
- `F13-T08-02` สร้าง Segment แบบ Dynamic
- `F13-T08-03` ส่ง Campaign ตาม Consent
- `F13-T08-04` วัด Delivery, Redemption และ Revenue attribution
- `F13-T08-05` จำกัดความถี่การสื่อสาร
- `F13-T08-06` Exclude ลูกค้าที่ถอน Consent

## F14 — Workforce & Labor Operations

### `[Choose · P1] F14-T01 — Staff Directory & Job Role`

- `F14-T01-01` เก็บข้อมูลพนักงานที่จำเป็นต่อการทำงาน
- `F14-T01-02` กำหนดตำแหน่งและสาขา
- `F14-T01-03` กำหนด Skill หรือ Station ที่ทำได้
- `F14-T01-04` กำหนด Role และ Permission
- `F14-T01-05` เปิด ระงับ หรือสิ้นสุดบัญชี
- `F14-T01-06` เก็บประวัติการเปลี่ยนตำแหน่งและสิทธิ์

### `[Choose · P1] F14-T02 — Shift Scheduling`

- `F14-T02-01` สร้างกะ
- `F14-T02-02` Assign พนักงานเข้ากะ
- `F14-T02-03` แสดงตารางรายวันและสัปดาห์
- `F14-T02-04` ตรวจเวลาชนกัน
- `F14-T02-05` จัดการวันหยุดและการลา
- `F14-T02-06` แจ้งตารางหรือการเปลี่ยนกะ

### `[Choose · P1] F14-T03 — Time & Attendance`

- `F14-T03-01` Clock in/out
- `F14-T03-02` บันทึก Break
- `F14-T03-03` จำกัดการลงเวลาตามสาขาหรืออุปกรณ์
- `F14-T03-04` ขอแก้ไขเวลาและอนุมัติ
- `F14-T03-05` แสดง Late, Early leave และ Overtime
- `F14-T03-06` Export ข้อมูลไป Payroll ภายนอก

### `[Choose · P2] F14-T04 — Tips & Service Distribution`

- `F14-T04-01` กำหนด Tip pool
- `F14-T04-02` แบ่งตามชั่วโมง Role หรือกฎร้าน
- `F14-T04-03` เชื่อม Tip กับ Shift
- `F14-T04-04` แสดงยอดก่อนอนุมัติ
- `F14-T04-05` ปรับยอดพร้อมเหตุผล
- `F14-T04-06` Export รายการจ่าย

### `[Advanced · P2] F14-T05 — Labor Planning & Performance`

- `F14-T05-01` เปรียบเทียบ Labor hours กับยอดขาย
- `F14-T05-02` วิเคราะห์ยอดขายต่อ Labor hour
- `F14-T05-03` คาดการณ์กำลังคนจาก Demand เมื่อข้อมูลเพียงพอ
- `F14-T05-04` แนะนำ Staffing gap โดยไม่จัดตารางอัตโนมัติแบบไร้การตรวจสอบ
- `F14-T05-05` วิเคราะห์ Training need จาก Exception
- `F14-T05-06` จำกัดการใช้ Metric เพื่อหลีกเลี่ยงการประเมินที่ไม่มีบริบท

## F15 — Dashboard, Reporting & Decision Support

### `[Core · P1] F15-T01 — Daily Operations Overview`

- `F15-T01-01` แสดงยอดขาย จำนวนออเดอร์ และยอดเฉลี่ยต่อออเดอร์
- `F15-T01-02` แสดงออเดอร์ตามสถานะ
- `F15-T01-03` แสดงโต๊ะหรือคิวที่ค้าง
- `F15-T01-04` แสดงยอดรับชำระและยอดค้าง
- `F15-T01-05` แสดง Exception เช่น Reject, Cancel, Refund และ Remake
- `F15-T01-06` Filter ตามสาขา ช่องทาง และช่วงเวลา

### `[Choose · P1] F15-T02 — Sales & Channel Analytics`

- `F15-T02-01` ยอดขายตามวัน เวลา สาขา และช่องทาง
- `F15-T02-02` Gross sales, Discount, Refund และ Net sales
- `F15-T02-03` Average order value
- `F15-T02-04` Payment method mix
- `F15-T02-05` Dine-in, Takeaway และ Delivery mix
- `F15-T02-06` เปรียบเทียบช่วงเวลากับ Baseline ที่เลือก

### `[Choose · P1] F15-T03 — Menu Engineering`

- `F15-T03-01` จำนวนขายและรายได้ต่อเมนู
- `F15-T03-02` Modifier และ Combo performance
- `F15-T03-03` Gross margin เมื่อมี Cost data
- `F15-T03-04` เมนูขายดี ขายช้า และ Sold-out frequency
- `F15-T03-05` วิเคราะห์ Cancellation และ Remake ต่อเมนู
- `F15-T03-06` แยกข้อมูลตามช่องทางและสาขา

### `[Choose · P1] F15-T04 — Kitchen & Service Performance`

- `F15-T04-01` Average acceptance และ preparation time
- `F15-T04-02` Ready-to-served time
- `F15-T04-03` SLA attainment
- `F15-T04-04` Station bottleneck
- `F15-T04-05` Remake rate และสาเหตุ
- `F15-T04-06` Table turn และ Wait time

### `[Choose · P2] F15-T05 — Customer & Retention Analytics`

- `F15-T05-01` New vs Returning customer
- `F15-T05-02` Purchase frequency
- `F15-T05-03` Repeat rate และ Cohort
- `F15-T05-04` Loyalty earn/burn
- `F15-T05-05` Promotion redemption และ Incremental view อย่างระมัดระวัง
- `F15-T05-06` Feedback trend

### `[Advanced · P2] F15-T06 — Forecast & Recommendation`

- `F15-T06-01` Forecast ยอดขายหรือจำนวนออเดอร์พร้อมช่วงความไม่แน่นอน
- `F15-T06-02` Forecast วัตถุดิบและ Staffing demand
- `F15-T06-03` แนะนำ Reorder หรือ Prep quantity
- `F15-T06-04` แสดงข้อมูลที่ใช้และความมั่นใจ
- `F15-T06-05` ให้ผู้ใช้ยืนยันก่อนเปลี่ยนแผนปฏิบัติงาน
- `F15-T06-06` ติดตาม Forecast error เพื่อปรับปรุง

## F16 — Product Administration, Devices & Integration

### `[Core · P0] F16-T01 — FoodFlow Configuration`

- `F16-T01-01` ตั้งค่า Ordering mode และ Workflow
- `F16-T01-02` ตั้งค่าเวลารับออเดอร์และ Cut-off
- `F16-T01-03` ตั้งค่า Service charge ภาษี และการปัดเศษ
- `F16-T01-04` ตั้งค่าเลข Order, Queue และเอกสาร
- `F16-T01-05` ตั้งค่า Cancellation, Refund และ Pay-later policy
- `F16-T01-06` Preview ผลกระทบก่อนเผยแพร่ Configuration

### `[Choose · P1] F16-T02 — Device & Station Management`

- `F16-T02-01` ลงทะเบียน POS, KDS, Printer และอุปกรณ์
- `F16-T02-02` ผูกอุปกรณ์กับสาขาและ Station
- `F16-T02-03` แสดง Online/Offline และ Last seen
- `F16-T02-04` ปิดสิทธิ์อุปกรณ์ที่สูญหาย
- `F16-T02-05` ทดสอบการเชื่อมต่อ
- `F16-T02-06` เก็บ Configuration version ของอุปกรณ์

### `[Advanced · P2] F16-T03 — Payment & Accounting Integration`

- `F16-T03-01` เชื่อม Payment provider
- `F16-T03-02` Mapping Transaction fee และ Settlement
- `F16-T03-03` Export ยอดขายและภาษีไปบัญชี
- `F16-T03-04` Mapping Chart of accounts
- `F16-T03-05` Reconcile Payment settlement
- `F16-T03-06` แสดงรายการ Integration error

### `[Advanced · P3] F16-T04 — Enterprise Menu & Branch Control`

- `F16-T04-01` สร้าง Master menu กลาง
- `F16-T04-02` Publish ราคาและเมนูไปหลายสาขา
- `F16-T04-03` อนุญาต Local override ตาม Policy
- `F16-T04-04` Schedule การเผยแพร่
- `F16-T04-05` Preview ความแตกต่างระหว่างสาขา
- `F16-T04-06` Roll back Configuration version

### `[Advanced · P3] F16-T05 — External Order & Commerce Integration`

- `F16-T05-01` เชื่อม Marketplace หรือ Ordering partner
- `F16-T05-02` Mapping Menu, Price และ Modifier
- `F16-T05-03` Sync Availability
- `F16-T05-04` รับ Order และส่ง Status
- `F16-T05-05` จัดการ Error queue
- `F16-T05-06` ตรวจยอดและ Fee รายช่องทาง
