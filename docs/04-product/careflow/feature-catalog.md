---
title: CareFlow Feature Catalog
document_id: CAREFLOW-CATALOG
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# CareFlow Feature Catalog

เอกสารนี้เป็น Source of truth ของ Feature Group, Feature Topic และ Individual Feature สำหรับ CareFlow. Bundle และเอกสารส่งมอบต้องอ้างรหัสจาก Catalog นี้

- [Recommended Feature Bundles](feature-bundles.md)
- [Catalog governance](../catalog-governance.md)

**Operating model:** Service Discovery → Booking/Queue → Check-in → Staff/Resource Fulfilment → Record → Checkout → Follow-up → Retention

**Primary roles:** Customer/Client, Reception, Service Provider, Therapist/Practitioner, Cashier, Manager, Owner, Clinical Admin

## C01 — Customer Entry & Service Catalog

### `[Core · P0] C01-T01 — Public Service Storefront`

- `C01-T01-01` เข้าหน้าธุรกิจผ่าน Public URL โดยไม่ต้อง Login
- `C01-T01-02` แสดงชื่อ สาขา ที่อยู่ เวลาเปิด และช่องทางติดต่อ
- `C01-T01-03` แสดงประเภทบริการที่เปิดรับ
- `C01-T01-04` แสดงสถานะเปิดรับ Booking หรือ Walk-in
- `C01-T01-05` ไม่เปิดเผยระบบ Staff/Admin
- `C01-T01-06` รองรับ Link ตรงไปบริการ พนักงาน หรือ Campaign

### `[Core · P0] C01-T02 — Service Catalog`

- `C01-T02-01` สร้างบริการและหมวดหมู่
- `C01-T02-02` กำหนดชื่อ คำอธิบาย รูปภาพ ราคา และระยะเวลา
- `C01-T02-03` ระบุสิ่งที่รวมและไม่รวม
- `C01-T02-04` ระบุข้อควรเตรียมและข้อจำกัดทั่วไป
- `C01-T02-05` เปิด ซ่อน หรือ Archive บริการ
- `C01-T02-06` กำหนดบริการตามสาขา
- `C01-T02-07` เรียงลำดับและ Featured service

### `[Choose · P1] C01-T03 — Service Variant & Add-on`

- `C01-T03-01` สร้าง Variant ตามระยะเวลา ระดับ หรือพื้นที่บริการ
- `C01-T03-02` กำหนดราคาและเวลาต่างกัน
- `C01-T03-03` สร้าง Add-on service
- `C01-T03-04` กำหนด Add-on ที่ใช้ร่วมกันได้
- `C01-T03-05` เพิ่ม Buffer หรือ Resource requirement จาก Add-on
- `C01-T03-06` คำนวณเวลารวมและราคารวมก่อน Booking

### `[Choose · P1] C01-T04 — Discovery, Search & Eligibility Information`

- `C01-T04-01` ค้นหาและ Filter บริการ
- `C01-T04-02` Filter ตามราคา ระยะเวลา พนักงาน หรือสาขา
- `C01-T04-03` แสดงบริการแนะนำหรือยอดนิยม
- `C01-T04-04` แสดงเงื่อนไขอายุหรือคุณสมบัติที่ร้านกำหนด
- `C01-T04-05` แสดงว่าต้อง Consultation, Deposit หรือ Consent หรือไม่
- `C01-T04-06` ป้องกันข้อความแนะนำที่ทำให้เข้าใจว่าเป็นการวินิจฉัยอัตโนมัติ

### `[Choose · P1] C01-T05 — Branch & Location Selection`

- `C01-T05-01` แสดงสาขาและบริการที่มี
- `C01-T05-02` ค้นหาตามพื้นที่
- `C01-T05-03` แสดงระยะทางเมื่อได้รับอนุญาต
- `C01-T05-04` แสดงเวลาว่างโดยสรุป
- `C01-T05-05` จดจำสาขาที่เลือกล่าสุด
- `C01-T05-06` เตือนเมื่อเปลี่ยนสาขาหลังเลือกบริการหรือเวลา

### `[Choose · P2] C01-T06 — Client Account Entry`

- `C01-T06-01` Booking แบบ Guest
- `C01-T06-02` สมัครสมาชิกและ Login
- `C01-T06-03` Verify เบอร์โทรหรือ Email
- `C01-T06-04` เชื่อม Guest booking กับบัญชี
- `C01-T06-05` ดูนัดหมาย ประวัติ และสิทธิของตน
- `C01-T06-06` จัดการผู้ติดตามหรือสมาชิกครอบครัวภายใต้ Permission ที่เหมาะสม

## C02 — Online Booking & Reservation Rules

### `[Core · P0] C02-T01 — Single-service Booking`

- `C02-T01-01` เลือกบริการ
- `C02-T01-02` เลือกสาขา วันที่ และเวลา
- `C02-T01-03` เลือกพนักงานหรือ Any available
- `C02-T01-04` ตรวจ Availability ก่อนยืนยัน
- `C02-T01-05` รับข้อมูลติดต่อที่จำเป็น
- `C02-T01-06` แสดงราคารวม ระยะเวลา และนโยบาย
- `C02-T01-07` สร้าง Requested หรือ Confirmed appointment
- `C02-T01-08` ป้องกัน Booking ซ้ำจากการกดหลายครั้ง

### `[Choose · P1] C02-T02 — Multi-service Booking`

- `C02-T02-01` เลือกหลายบริการใน Booking เดียว
- `C02-T02-02` จัดลำดับบริการ
- `C02-T02-03` คำนวณเวลา Staff และ Resource ต่อเนื่อง
- `C02-T02-04` รองรับพนักงานต่างคนในแต่ละบริการ
- `C02-T02-05` แสดง Timeline โดยรวมก่อนยืนยัน
- `C02-T02-06` ป้องกันช่องว่างหรือ Conflict ที่ไม่ตั้งใจ

### `[Choose · P1] C02-T03 — Group & Multi-person Booking`

- `C02-T03-01` จองหลายคนในรายการเดียว
- `C02-T03-02` ระบุบริการต่อคน
- `C02-T03-03` ตรวจ Capacity และ Resource พร้อมกัน
- `C02-T03-04` ระบุผู้ติดต่อหลัก
- `C02-T03-05` แยกข้อมูลและ Consent รายบุคคลเมื่อจำเป็น
- `C02-T03-06` คำนวณ Deposit และยอดรวม

### `[Core · P0] C02-T04 — Availability Search`

- `C02-T04-01` คำนวณจากเวลาทำการของสาขา
- `C02-T04-02` คำนวณจาก Staff schedule และ Skill
- `C02-T04-03` คำนวณจาก Resource และ Capacity
- `C02-T04-04` รวม Service duration และ Buffer
- `C02-T04-05` ตัด Block, Leave และ Existing appointment
- `C02-T04-06` Recheck slot ตอนยืนยันเพื่อป้องกันชนกัน
- `C02-T04-07` เสนอเวลาทางเลือกที่ใกล้เคียง

### `[Choose · P1] C02-T05 — Customer Reschedule & Cancellation`

- `C02-T05-01` เปิดรายละเอียดผ่าน Secure link หรือบัญชี
- `C02-T05-02` เลื่อนวัน เวลา พนักงาน หรือสาขาตาม Policy
- `C02-T05-03` ยกเลิกพร้อมเหตุผล
- `C02-T05-04` ตรวจ Cut-off และค่าธรรมเนียม
- `C02-T05-05` คำนวณผลต่อ Deposit
- `C02-T05-06` แจ้ง Staff และคืน Slot
- `C02-T05-07` เก็บประวัติทุกการเปลี่ยน

### `[Choose · P2] C02-T06 — Recurring Appointment`

- `C02-T06-01` สร้างนัดซ้ำตามสัปดาห์หรือเดือน
- `C02-T06-02` กำหนดจำนวนครั้งหรือวันสิ้นสุด
- `C02-T06-03` ตรวจ Availability ทุกครั้ง
- `C02-T06-04` แสดง Conflict และเสนอทางแก้
- `C02-T06-05` แก้เฉพาะครั้งหรือทั้ง Series
- `C02-T06-06` เชื่อมกับ Package/Plan เมื่อเกี่ยวข้อง

### `[Choose · P1] C02-T07 — Booking Policy & Deposit Gate`

- `C02-T07-01` กำหนด Lead time ขั้นต่ำและล่วงหน้าสูงสุด
- `C02-T07-02` กำหนด Cut-off การเลื่อนหรือยกเลิก
- `C02-T07-03` กำหนด Deposit ต่อบริการ กลุ่มลูกค้า หรือช่วงเวลา
- `C02-T07-04` Hold slot ระหว่างรอชำระตามเวลาที่จำกัด
- `C02-T07-05` ปล่อย Slot เมื่อ Payment หมดเวลา
- `C02-T07-06` แสดง Policy ก่อนยืนยัน
- `C02-T07-07` รองรับ Exception โดยผู้มีสิทธิ์พร้อมเหตุผล

### `[Advanced · P2] C02-T08 — Waitlist for Cancelled Slot`

- `C02-T08-01` ให้ลูกค้าเข้ารอ Slot ที่ต้องการ
- `C02-T08-02` ระบุช่วงเวลาและพนักงานที่ยอมรับได้
- `C02-T08-03` Match เมื่อมี Slot ว่าง
- `C02-T08-04` ส่ง Offer ตามลำดับหรือกลุ่มตามกฎ
- `C02-T08-05` Hold slot ชั่วคราวระหว่างตอบรับ
- `C02-T08-06` หมดอายุ Offer และส่งต่ออย่างเป็นธรรม

## C03 — Calendar & Schedule Workspace

### `[Core · P0] C03-T01 — Appointment Calendar`

- `C03-T01-01` แสดง Day, Week และ Agenda view
- `C03-T01-02` แสดง Appointment ตามเวลาและระยะเวลา
- `C03-T01-03` ใช้สถานะที่แยกแยะได้ด้วยสีและข้อความ
- `C03-T01-04` Filter ตามสาขา Staff, Service และ Status
- `C03-T01-05` เปิดรายละเอียดโดยไม่สูญเสียบริบทปฏิทิน
- `C03-T01-06` แสดง Conflict และ Unassigned appointment
- `C03-T01-07` รองรับ Timezone ที่กำหนด

### `[Choose · P1] C03-T02 — Staff Column Calendar`

- `C03-T02-01` แสดงตารางแยกตามพนักงาน
- `C03-T02-02` แสดงเวลาทำงาน Break และ Leave
- `C03-T02-03` ลากเพื่อย้ายเวลา/พนักงานภายใต้ Permission
- `C03-T02-04` ตรวจ Skill และ Schedule ก่อนย้าย
- `C03-T02-05` แสดง Utilization โดยไม่บดบัง Appointment
- `C03-T02-06` ซ่อนข้อมูลลูกค้าตาม Role

### `[Choose · P1] C03-T03 — Resource Calendar`

- `C03-T03-01` แสดงห้อง เตียง เก้าอี้ หรืออุปกรณ์เป็น Column
- `C03-T03-02` แสดง Booking และ Block
- `C03-T03-03` ตรวจ Capacity และ Maintenance
- `C03-T03-04` ย้าย Resource พร้อมตรวจ Conflict
- `C03-T03-05` Filter ตามประเภท Resource
- `C03-T03-06` แสดงเวลาทำความสะอาดหรือ Buffer

### `[Choose · P1] C03-T04 — Manual Booking & Walk-in Creation`

- `C03-T04-01` Reception สร้าง Appointment แทนลูกค้า
- `C03-T04-02` ค้นหา/สร้าง Customer
- `C03-T04-03` เลือก Service, Staff และ Resource
- `C03-T04-04` Override กฎบางอย่างโดย Role ที่อนุญาต
- `C03-T04-05` เก็บแหล่งที่มา Phone, Walk-in หรือ Staff-created
- `C03-T04-06` ส่ง Confirmation ให้ลูกค้า

### `[Choose · P1] C03-T05 — Block Time & Business Closure`

- `C03-T05-01` Block เวลา Staff
- `C03-T05-02` Block Resource
- `C03-T05-03` Block สาขาหรือช่วงเวลาพิเศษ
- `C03-T05-04` ระบุเหตุผลและผู้อนุมัติ
- `C03-T05-05` ตรวจ Appointment ที่ได้รับผลกระทบ
- `C03-T05-06` แจ้งผู้เกี่ยวข้องก่อนเผยแพร่การเปลี่ยน

### `[Advanced · P2] C03-T06 — External Calendar Sync`

- `C03-T06-01` เชื่อม Calendar ภายนอก
- `C03-T06-02` Sync Appointment ออกไปโดยจำกัดข้อมูลลูกค้า
- `C03-T06-03` อ่าน Busy time จากภายนอก
- `C03-T06-04` ป้องกัน Loop และ Duplicate
- `C03-T06-05` แสดง Sync status และ Error
- `C03-T06-06` Disconnect โดยไม่ลบ Appointment หลักผิดพลาด

## C04 — Check-in, Walk-in Queue & Service Flow

### `[Core · P0] C04-T01 — Appointment Status Lifecycle`

- `C04-T01-01` Requested, Confirmed และ Rescheduled
- `C04-T01-02` Checked-in, Waiting และ In service
- `C04-T01-03` Completed, Cancelled และ No-show
- `C04-T01-04` กำหนด Transition และ Role
- `C04-T01-05` เก็บเวลาแต่ละสถานะ
- `C04-T01-06` แยกสถานะที่ลูกค้าเห็นจากสถานะภายใน
- `C04-T01-07` บังคับเหตุผลสำหรับ Cancel, No-show และ Reopen

### `[Choose · P1] C04-T02 — Customer Check-in`

- `C04-T02-01` Check-in โดย Reception
- `C04-T02-02` Self check-in ผ่าน Link หรือ QR
- `C04-T02-03` Verify Booking ด้วยข้อมูลที่เหมาะสม
- `C04-T02-04` ตรวจ Form, Consent และยอดค้างก่อนเข้าคิว
- `C04-T02-05` แจ้ง Staff ว่าลูกค้ามาถึง
- `C04-T02-06` บันทึก Arrival time

### `[Choose · P1] C04-T03 — Walk-in Queue`

- `C04-T03-01` เพิ่มลูกค้า Walk-in
- `C04-T03-02` เลือกบริการและพนักงานที่ต้องการ
- `C04-T03-03` ออก Queue number
- `C04-T03-04` แสดงเวลารอโดยประมาณ
- `C04-T03-05` เรียกคิว ข้ามคิว และเรียกซ้ำ
- `C04-T03-06` Mark Serving, Completed, Left และ Cancelled
- `C04-T03-07` เชื่อม Walk-in เป็น Appointment/Visit record

### `[Choose · P1] C04-T04 — Hybrid Queue Orchestration`

- `C04-T04-01` รวม Appointment และ Walk-in ใน Queue เดียว
- `C04-T04-02` รักษาเวลานัดโดยไม่ละเลย Walk-in
- `C04-T04-03` จัดลำดับตาม Service, Staff และ Priority policy
- `C04-T04-04` แสดงผลกระทบเมื่อ Insert งานด่วน
- `C04-T04-05` แจ้งลูกค้าเมื่อเวลารอเปลี่ยน
- `C04-T04-06` เก็บเหตุผลการเปลี่ยนลำดับ

### `[Choose · P1] C04-T05 — Service Start, Handover & Completion`

- `C04-T05-01` Assign ผู้ให้บริการ
- `C04-T05-02` Start service และจับเวลา
- `C04-T05-03` Pause พร้อมเหตุผล
- `C04-T05-04` Handover ไปพนักงานหรือ Resource ถัดไป
- `C04-T05-05` Complete service หลังผ่าน Required steps
- `C04-T05-06` ส่งรายการไป Checkout และ Follow-up

### `[Choose · P2] C04-T06 — Delay, No-show & Recovery`

- `C04-T06-01` แจ้ง Appointment ที่เลยเวลาแต่ยังไม่ Check-in
- `C04-T06-02` Mark Late หรือ No-show ตาม Policy
- `C04-T06-03` ส่ง Reminder/Recovery message ตาม Consent
- `C04-T06-04` บันทึกเหตุผลความล่าช้าฝั่งร้าน
- `C04-T06-05` เสนอ Reschedule หรือ Waitlist replacement
- `C04-T06-06` วิเคราะห์ No-show และ Delay pattern

## C05 — Staff, Skill, Schedule & Commission

### `[Choose · P0] C05-T01 — Service Provider Profile`

- `C05-T01-01` สร้างโปรไฟล์ผู้ให้บริการ
- `C05-T01-02` กำหนดชื่อแสดง รูป ประวัติ และภาษา
- `C05-T01-03` กำหนดบริการและ Skill ที่ทำได้
- `C05-T01-04` กำหนดสาขาที่ทำงาน
- `C05-T01-05` เปิดให้ลูกค้าเลือกหรือซ่อนจาก Public booking
- `C05-T01-06` เปิด ระงับ หรือ Archive โดยไม่ทำลายประวัติ

### `[Core · P0] C05-T02 — Staff Availability & Working Hours`

- `C05-T02-01` กำหนดเวลาทำงานประจำ
- `C05-T02-02` กำหนดตารางพิเศษรายวัน
- `C05-T02-03` กำหนด Break
- `C05-T02-04` บันทึก Leave และ Day off
- `C05-T02-05` กำหนดเวลาตามสาขา
- `C05-T02-06` ตรวจ Conflict กับ Appointment

### `[Choose · P1] C05-T03 — Customer Staff Selection`

- `C05-T03-01` แสดง Staff ที่ทำบริการได้
- `C05-T03-02` เลือกพนักงานเฉพาะหรือ Any available
- `C05-T03-03` แสดง Slot ตามพนักงาน
- `C05-T03-04` แสดงราคา/ระยะเวลาที่ต่างกันเมื่อร้านกำหนด
- `C05-T03-05` จดจำ Preferred staff เมื่อได้รับอนุญาต
- `C05-T03-06` แจ้งเมื่อพนักงานเดิมไม่ว่างและเสนอทางเลือก

### `[Choose · P1] C05-T04 — Assignment & Load Balancing`

- `C05-T04-01` Assign พนักงาน Manual
- `C05-T04-02` Auto-assign จาก Skill, Availability และ Workload
- `C05-T04-03` Reassign พร้อมแจ้งผู้เกี่ยวข้อง
- `C05-T04-04` แสดง Unassigned appointment
- `C05-T04-05` ป้องกัน Double-booking
- `C05-T04-06` ให้ Manager override พร้อมเหตุผล

### `[Choose · P1] C05-T05 — Staff Shift & Attendance`

- `C05-T05-01` สร้างและ Publish กะ
- `C05-T05-02` Clock in/out และ Break
- `C05-T05-03` ขอเปลี่ยนกะหรือลา
- `C05-T05-04` อนุมัติคำขอ
- `C05-T05-05` เทียบ Scheduled กับ Actual hours
- `C05-T05-06` Export ไป Payroll

### `[Choose · P1] C05-T06 — Commission & Tips`

- `C05-T06-01` กำหนด Commission ตามบริการ สินค้า หรือพนักงาน
- `C05-T06-02` รองรับจำนวนคงที่ เปอร์เซ็นต์ หรือ Tier
- `C05-T06-03` กำหนด Credit เมื่อมีหลายพนักงาน
- `C05-T06-04` Reverse เมื่อ Refund หรือยกเลิก
- `C05-T06-05` บันทึก Tips รายพนักงานหรือ Tip pool
- `C05-T06-06` สรุปและอนุมัติก่อนจ่าย

### `[Advanced · P2] C05-T07 — Staff Performance & Development`

- `C05-T07-01` จำนวน Booking, Revenue และ Utilization
- `C05-T07-02` Rebooking และ Retention ตามพนักงาน
- `C05-T07-03` Punctuality และ Service duration variance
- `C05-T07-04` Feedback trend โดยมีปริมาณข้อมูลขั้นต่ำ
- `C05-T07-05` บันทึก Skill certification/expiry เมื่อร้านต้องใช้
- `C05-T07-06` ไม่ใช้ Metric เดียวเป็นข้อสรุปโดยปราศจากบริบท

## C06 — Room, Chair, Equipment & Capacity

### `[Choose · P1] C06-T01 — Resource Master`

- `C06-T01-01` สร้างห้อง เตียง เก้าอี้ อุปกรณ์ หรือ Resource pool
- `C06-T01-02` กำหนดประเภท Capacity และสาขา
- `C06-T01-03` กำหนดบริการที่ใช้ Resource ได้
- `C06-T01-04` เปิด ปิด หรือ Archive
- `C06-T01-05` กำหนดเวลาพร้อมใช้งาน
- `C06-T01-06` แนบรายละเอียดหรือคู่มือภายใน

### `[Dependency · P1] C06-T02 — Resource Reservation`

- `C06-T02-01` Reserve Resource พร้อม Appointment
- `C06-T02-02` ตรวจ Conflict และ Capacity
- `C06-T02-03` Assign อัตโนมัติหรือ Manual
- `C06-T02-04` Reassign เมื่อ Resource มีปัญหา
- `C06-T02-05` แสดง Resource บน Calendar
- `C06-T02-06` ปล่อย Resource เมื่อ Cancel

### `[Choose · P1] C06-T03 — Buffer, Cleaning & Turnaround`

- `C06-T03-01` กำหนด Buffer ก่อน/หลังบริการ
- `C06-T03-02` สร้าง Cleaning task
- `C06-T03-03` Mark Cleaning in progress/Ready
- `C06-T03-04` ป้องกัน Booking ระหว่าง Buffer
- `C06-T03-05` แจ้งเมื่อ Cleaning ล่าช้า
- `C06-T03-06` วิเคราะห์ Turnaround time

### `[Choose · P2] C06-T04 — Maintenance & Downtime`

- `C06-T04-01` Block Resource สำหรับ Maintenance
- `C06-T04-02` สร้างรอบบำรุงรักษา
- `C06-T04-03` แจ้ง Appointment ที่ได้รับผลกระทบ
- `C06-T04-04` ย้าย Resource หรือ Reschedule
- `C06-T04-05` บันทึกปัญหาและค่าใช้จ่าย
- `C06-T04-06` เก็บประวัติ Downtime

### `[Advanced · P2] C06-T05 — Capacity & Utilization Optimization`

- `C06-T05-01` กำหนด Capacity ตามช่วงเวลา
- `C06-T05-02` วิเคราะห์ Occupancy/Utilization
- `C06-T05-03` แสดง Unused capacity
- `C06-T05-04` แนะนำ Slot หรือ Promotion สำหรับช่วงว่าง
- `C06-T05-05` วิเคราะห์ Bottleneck ระหว่าง Staff กับ Resource
- `C06-T05-06` ให้ผู้จัดการยืนยันก่อนเปลี่ยน Capacity rule

## C07 — Client Profile, History & Preferences

### `[Core · P0] C07-T01 — Client Profile`

- `C07-T01-01` เก็บข้อมูลติดต่อและข้อมูลที่จำเป็นต่อบริการ
- `C07-T01-02` แสดง Booking และ Visit history
- `C07-T01-03` แสดง Package, Membership, Credit และยอดค้าง
- `C07-T01-04` เพิ่ม Tag และ Internal note ตาม Permission
- `C07-T01-05` แสดง Consent/Communication preference
- `C07-T01-06` Merge Duplicate profile พร้อม Audit
- `C07-T01-07` จำกัดการมองเห็นข้อมูลละเอียดอ่อน

### `[Choose · P1] C07-T02 — Service History`

- `C07-T02-01` บันทึกบริการ วันที่ สาขา และผู้ให้บริการ
- `C07-T02-02` บันทึก Variant/Add-on ที่ใช้
- `C07-T02-03` เชื่อม Payment, Product usage และ Follow-up
- `C07-T02-04` แสดง Timeline
- `C07-T02-05` สร้าง Booking ซ้ำจากประวัติ
- `C07-T02-06` แยกข้อมูลที่ลูกค้าเห็นและข้อมูลภายใน

### `[Choose · P1] C07-T03 — Client Preference & Personalization`

- `C07-T03-01` บันทึก Preferred staff
- `C07-T03-02` บันทึก Room, Service หรือ Style preference
- `C07-T03-03` บันทึก Communication preference
- `C07-T03-04` ให้ลูกค้าตรวจหรือแก้ข้อมูลที่เหมาะสม
- `C07-T03-05` แสดง Preference ให้ Staff ก่อนบริการ
- `C07-T03-06` ระบุแหล่งที่มาและวันที่อัปเดต

### `[Choose · P1] C07-T04 — Alert, Allergy & Contraindication Note`

- `C07-T04-01` บันทึก Alert ที่เกี่ยวกับความปลอดภัยของบริการ
- `C07-T04-02` แยกระดับความสำคัญ
- `C07-T04-03` จำกัดผู้มีสิทธิ์ดูและแก้ไข
- `C07-T04-04` แสดงเตือนก่อนเริ่มบริการที่เกี่ยวข้อง
- `C07-T04-05` บังคับ Acknowledge Alert สำคัญ
- `C07-T04-06` เก็บผู้สร้าง แหล่งข้อมูล และ Version

### `[Choose · P2] C07-T05 — Before/After Media Library`

- `C07-T05-01` ถ่ายหรืออัปโหลดภาพก่อน–หลัง
- `C07-T05-02` ผูกกับ Visit, Service และผู้บันทึก
- `C07-T05-03` ขอ Consent แยกสำหรับการเก็บและการใช้ทางการตลาด
- `C07-T05-04` จำกัดการดู ดาวน์โหลด และ Export
- `C07-T05-05` เปรียบเทียบภาพตามเวลาโดยไม่แก้ไขต้นฉบับ
- `C07-T05-06` กำหนด Retention และการลบตามนโยบาย

## C08 — Forms, Consent & Document Workflow

### `[Choose · P1] C08-T01 — Intake & Consultation Form`

- `C08-T01-01` สร้าง Form template
- `C08-T01-02` รองรับ Text, Choice, Date, File และ Signature
- `C08-T01-03` กำหนด Required และ Conditional question
- `C08-T01-04` ส่ง Form ก่อน Appointment
- `C08-T01-05` แสดงสถานะ Not sent, Pending และ Completed
- `C08-T01-06` แจ้ง Reception เมื่อ Form ไม่ครบ
- `C08-T01-07` เก็บคำตอบเป็น Version ที่ผูกกับ Visit

### `[Choose · P1] C08-T02 — Consent & Waiver`

- `C08-T02-01` สร้าง Consent template ตามบริการ
- `C08-T02-02` แสดงข้อมูล ความเสี่ยง เงื่อนไข และทางเลือกตามที่ร้านกำหนด
- `C08-T02-03` ลงลายมือชื่อและวันเวลา
- `C08-T02-04` ผูกกับ Version เอกสาร
- `C08-T02-05` บังคับ Consent ที่ยังใช้ได้ก่อนเริ่มบริการ
- `C08-T02-06` รองรับการถอนหรือออก Version ใหม่
- `C08-T02-07` แยก Consent บริการจาก Consent การตลาด/ภาพ

### `[Choose · P1] C08-T03 — Form Assignment & Completion Gate`

- `C08-T03-01` Assign Form ตามบริการ ลูกค้า หรือเงื่อนไข
- `C08-T03-02` กำหนด Due time
- `C08-T03-03` ส่ง Reminder
- `C08-T03-04` ให้ Staff ช่วยกรอกโดยระบุผู้บันทึก
- `C08-T03-05` บังคับ Required form ก่อน Check-in/Start
- `C08-T03-06` Override พร้อมเหตุผลและ Permission

### `[Advanced · P2] C08-T04 — Document Version & Restricted Access`

- `C08-T04-01` เก็บ Version ของ Template และคำตอบ
- `C08-T04-02` แสดงว่าใครดูหรือ Export เอกสารสำคัญ
- `C08-T04-03` จำกัด Access ตาม Role และ Care relationship
- `C08-T04-04` Mask ข้อมูลในการ Preview บางบริบท
- `C08-T04-05` กำหนด Retention
- `C08-T04-06` Legal hold/Deletion workflow ตามนโยบายที่ธุรกิจกำหนด

## C09 — Treatment, Procedure & Clinical Extension

> กลุ่มนี้เป็น Extension สำหรับ Clinic/Med-spa หรือบริการที่ต้องบันทึกข้อมูลละเอียดอ่อน ไม่ควรเปิดอัตโนมัติให้ Salon/Spa ทั่วไป และไม่ควรถูกนำเสนอว่าแทนระบบเวชระเบียนหรือข้อกำหนดเฉพาะวิชาชีพโดยไม่มีการประเมินแยก

### `[Advanced · P1] C09-T01 — Treatment/Procedure Record`

- `C09-T01-01` สร้าง Record ต่อ Visit และ Procedure
- `C09-T01-02` บันทึกผู้ให้บริการ วันเวลา และสถานที่
- `C09-T01-03` บันทึก Assessment, Procedure note และ Outcome ตาม Template
- `C09-T01-04` บันทึก Product/Material/Device ที่ใช้
- `C09-T01-05` บันทึก Follow-up instruction
- `C09-T01-06` Sign/Lock Record หลังเสร็จ
- `C09-T01-07` Addendum โดยไม่แก้ต้นฉบับที่ Lock

### `[Advanced · P1] C09-T02 — Treatment Plan & Session Tracking`

- `C09-T02-01` สร้างแผนหลายครั้งหรือหลายขั้นตอน
- `C09-T02-02` กำหนดเป้าหมาย ระยะเวลา และผู้รับผิดชอบ
- `C09-T02-03` เชื่อม Session กับ Appointment
- `C09-T02-04` ติดตาม Completed, Remaining และ Missed session
- `C09-T02-05` ปรับแผนด้วย Version และเหตุผล
- `C09-T02-06` แสดงค่าใช้จ่าย/Package แยกจาก Record ทางวิชาชีพ

### `[Advanced · P1] C09-T03 — Measurement & Progress Tracking`

- `C09-T03-01` กำหนด Measurement template ตามบริการ
- `C09-T03-02` บันทึกค่าตามเวลาและผู้บันทึก
- `C09-T03-03` แสดงแนวโน้มโดยไม่สรุปผลเกินข้อมูล
- `C09-T03-04` แนบภาพหรือเอกสารประกอบ
- `C09-T03-05` Flag ค่าที่ต้องตรวจสอบตาม Rule ของธุรกิจ
- `C09-T03-06` ห้าม AI วินิจฉัยหรือเปลี่ยนแผนอัตโนมัติโดยไม่มีผู้เชี่ยวชาญ

### `[Advanced · P1] C09-T04 — Restricted Clinical Access & Audit`

- `C09-T04-01` กำหนด Clinical role แยกจาก Reception/Cashier
- `C09-T04-02` จำกัดการดู Record ตามความสัมพันธ์กับ Visit
- `C09-T04-03` Re-authentication ก่อน Export หรือแก้ไขสำคัญ
- `C09-T04-04` Audit การดู สร้าง แก้ Addendum และ Export
- `C09-T04-05` ซ่อน Clinical note จาก Customer portal เว้นแต่ Policy อนุญาต
- `C09-T04-06` แยกข้อมูล Clinical จาก Marketing segment

### `[Advanced · P2] C09-T05 — Aftercare & Follow-up Workflow`

- `C09-T05-01` สร้าง Aftercare instruction จาก Template
- `C09-T05-02` ส่งให้ลูกค้าผ่าน Secure channel
- `C09-T05-03` นัด Follow-up
- `C09-T05-04` ส่งแบบประเมินหลังบริการ
- `C09-T05-05` Flag คำตอบที่ต้องให้ผู้มีคุณสมบัติตรวจ
- `C09-T05-06` บันทึกการติดต่อและ Outcome

## C10 — POS, Checkout, Payment & Refund

### `[Choose · P0] C10-T01 — Service Checkout & POS`

- `C10-T01-01` เปิด Checkout จาก Appointment/Visit
- `C10-T01-02` เพิ่มบริการ Add-on และสินค้า Retail
- `C10-T01-03` ใช้ Package, Membership, Gift card หรือ Credit
- `C10-T01-04` คำนวณส่วนลด ภาษี ค่าบริการ และ Tips
- `C10-T01-05` แบ่ง Revenue credit ให้พนักงาน
- `C10-T01-06` ตรวจยอดก่อนชำระ
- `C10-T01-07` ปิด Visit เมื่อผ่าน Completion rule

### `[Choose · P0] C10-T02 — Pay Now, Deposit & Balance`

- `C10-T02-01` รับชำระเต็มจำนวนตอนจองหรือ Checkout
- `C10-T02-02` รับ Deposit
- `C10-T02-03` แสดงยอด Deposit ที่รับและยอดคงเหลือ
- `C10-T02-04` นำ Deposit มาหักบิล
- `C10-T02-05` รองรับ Cash, QR, Card และ Payment link
- `C10-T02-06` ป้องกันชำระซ้ำ
- `C10-T02-07` Reconcile Payment status

### `[Choose · P1] C10-T03 — Partial, Split & Combined Payment`

- `C10-T03-01` แบ่งจ่ายหลายครั้ง
- `C10-T03-02` ใช้หลายช่องทางในบิลเดียว
- `C10-T03-03` แบ่งยอดระหว่างลูกค้าใน Group booking
- `C10-T03-04` แยกสินค้าและบริการในบิล
- `C10-T03-05` แสดงยอดคงค้าง
- `C10-T03-06` ป้องกันยอดชำระเกินโดยไม่ตั้งใจ

### `[Choose · P1] C10-T04 — Refund, Cancellation Fee & No-show Charge`

- `C10-T04-01` Refund เต็มหรือบางส่วน
- `C10-T04-02` ใช้นโยบาย Cancellation/No-show ที่ประกาศไว้
- `C10-T04-03` คืนเป็นช่องทางเดิมหรือ Store credit ตามกฎ
- `C10-T04-04` ขออนุมัติ Exception
- `C10-T04-05` Reverse Package usage, Points และ Commission อย่างถูกต้อง
- `C10-T04-06` เก็บเหตุผลและ Provider reference

### `[Choose · P1] C10-T05 — Receipt, Tax Document & Cash Closing`

- `C10-T05-01` ออกและส่งใบเสร็จ
- `C10-T05-02` รองรับข้อมูลเอกสารภาษีตาม Configuration
- `C10-T05-03` Reprint/Void พร้อม Audit
- `C10-T05-04` เปิดและปิดกะ Cashier
- `C10-T05-05` เทียบ Expected กับ Actual cash
- `C10-T05-06` สรุปยอดตามช่องทาง

## C11 — Packages, Membership, Wallet & Gift Card

### `[Choose · P1] C11-T01 — Service Package`

- `C11-T01-01` สร้าง Package หลายครั้งหรือหลายบริการ
- `C11-T01-02` กำหนดราคา จำนวนสิทธิ์ และอายุ
- `C11-T01-03` ขายและ Assign ให้ลูกค้า
- `C11-T01-04` ใช้สิทธิ์เมื่อ Completed service
- `C11-T01-05` แสดง Used, Remaining, Reserved และ Expired
- `C11-T01-06` ยกเลิก/คืนสิทธิ์เมื่อ Visit ถูกย้อนสถานะตาม Policy
- `C11-T01-07` แจ้งใกล้หมดอายุ

### `[Choose · P1] C11-T02 — Membership & Subscription`

- `C11-T02-01` สร้างแผนรายเดือนหรือรายปี
- `C11-T02-02` กำหนด Benefit, Included service และส่วนลด
- `C11-T02-03` เริ่ม ต่ออายุ Pause และ Cancel
- `C11-T02-04` เก็บสถานะ Active, Past due และ Expired
- `C11-T02-05` แจ้งต่ออายุและ Payment failure
- `C11-T02-06` จำกัด Benefit ตามสาขาหรือช่วงเวลา

### `[Choose · P1] C11-T03 — Client Wallet & Store Credit`

- `C11-T03-01` แสดง Package, Gift card, Credit และยอดคงเหลือ
- `C11-T03-02` เติมหรือปรับ Store credit ตาม Permission
- `C11-T03-03` ใช้ Credit ตอน Checkout
- `C11-T03-04` แสดง Transaction history
- `C11-T03-05` กำหนดวันหมดอายุ
- `C11-T03-06` ป้องกันยอดติดลบหรือใช้ซ้ำ

### `[Choose · P2] C11-T04 — Gift Card & Transfer Rule`

- `C11-T04-01` ขาย Physical/Digital gift card
- `C11-T04-02` ส่งให้ผู้รับ
- `C11-T04-03` Activate และ Redeem
- `C11-T04-04` ตรวจ Balance
- `C11-T04-05` กำหนดเงื่อนไขการโอนหรือคืน
- `C11-T04-06` ติดตาม Outstanding liability

## C12 — Retail & Consumable Inventory

### `[Choose · P1] C12-T01 — Product & Consumable Master`

- `C12-T01-01` สร้างสินค้า Retail และวัสดุใช้บริการ
- `C12-T01-02` กำหนด SKU, Barcode, หน่วย และหมวดหมู่
- `C12-T01-03` กำหนดราคาขาย ต้นทุน และภาษี
- `C12-T01-04` กำหนด Supplier และ Reorder point
- `C12-T01-05` เปิด ปิด หรือ Archive
- `C12-T01-06` จำกัดตามสาขา

### `[Choose · P1] C12-T02 — Service Consumption Recipe`

- `C12-T02-01` ผูกวัสดุและปริมาณกับบริการ
- `C12-T02-02` รองรับการใช้จริงต่างจากค่ามาตรฐาน
- `C12-T02-03` ตัด Stock เมื่อ Complete service
- `C12-T02-04` บันทึกผู้ใช้และ Visit
- `C12-T02-05` คืนหรือปรับเมื่อ Record ผิด
- `C12-T02-06` คำนวณ Consumable cost ต่อบริการ

### `[Choose · P1] C12-T03 — Stock Movement, Count & Alert`

- `C12-T03-01` รับเข้า เบิก ขาย โอน และปรับยอด
- `C12-T03-02` แสดง On-hand และ Available
- `C12-T03-03` แจ้ง Low stock
- `C12-T03-04` สร้างรอบนับ Stock
- `C12-T03-05` แสดง Variance และอนุมัติ Adjustment
- `C12-T03-06` เก็บ Movement history

### `[Choose · P2] C12-T04 — Supplier & Purchase Order`

- `C12-T04-01` จัดการ Supplier
- `C12-T04-02` Purchase request และ Approval
- `C12-T04-03` Purchase order
- `C12-T04-04` Goods receiving
- `C12-T04-05` บันทึกส่วนต่างจำนวนและราคา
- `C12-T04-06` วิเคราะห์ Lead time และ Spend

### `[Advanced · P2] C12-T05 — Lot, Batch & Expiry`

- `C12-T05-01` บันทึก Lot/Batch และวันหมดอายุ
- `C12-T05-02` เลือก Lot ตอนใช้กับ Visit
- `C12-T05-03` แจ้งใกล้หมดอายุ
- `C12-T05-04` ใช้ FEFO
- `C12-T05-05` Block/Recall Lot
- `C12-T05-06` Trace จาก Supplier ถึงลูกค้า/Visit ภายใต้สิทธิ์สูง

## C13 — Reminder, Communication & Follow-up

### `[Choose · P0] C13-T01 — Booking Confirmation & Reminder`

- `C13-T01-01` ส่ง Confirmation หลังจอง
- `C13-T01-02` ส่ง Reminder ตามเวลาที่กำหนด
- `C13-T01-03` ใส่วัน เวลา สถานที่ บริการ และการเตรียมตัว
- `C13-T01-04` ให้ยืนยันว่าจะมาเมื่อร้านเปิดใช้
- `C13-T01-05` เชื่อมไป Reschedule/Cancel อย่างปลอดภัย
- `C13-T01-06` เก็บ Delivery status

### `[Choose · P1] C13-T02 — Operational Notification`

- `C13-T02-01` แจ้ง Check-in, Queue และ Delay
- `C13-T02-02` แจ้งเปลี่ยน Staff, Room หรือเวลา
- `C13-T02-03` แจ้ง Cancel โดยร้าน
- `C13-T02-04` แจ้ง Payment/Deposit status
- `C13-T02-05` แจ้ง Package usage/expiry
- `C13-T02-06` หลีกเลี่ยงเปิดเผยข้อมูลละเอียดอ่อนในข้อความภายนอก

### `[Choose · P1] C13-T03 — Follow-up Workflow`

- `C13-T03-01` สร้าง Follow-up task จากบริการ
- `C13-T03-02` กำหนด Due date และผู้รับผิดชอบ
- `C13-T03-03` ส่งข้อความหรือแบบประเมิน
- `C13-T03-04` บันทึกผลการติดต่อ
- `C13-T03-05` Escalate คำตอบที่ต้องตรวจ
- `C13-T03-06` ปิด Task พร้อม Outcome

### `[Choose · P2] C13-T04 — Two-way Client Communication`

- `C13-T04-01` สนทนาผูกกับ Booking/Visit
- `C13-T04-02` แยก Internal note
- `C13-T04-03` แนบไฟล์ภายใต้ Policy
- `C13-T04-04` Assign การสนทนา
- `C13-T04-05` ใช้ Template reply
- `C13-T04-06` เก็บ Conversation history และ Consent

## C14 — CRM, Loyalty, Marketing & Reputation

### `[Choose · P1] C14-T01 — Client Segmentation`

- `C14-T01-01` แบ่งกลุ่มตามบริการ ความถี่ และยอดใช้จ่าย
- `C14-T01-02` แบ่ง New, Active, At-risk และ Lapsed
- `C14-T01-03` สร้าง Dynamic segment
- `C14-T01-04` Exclude ผู้ไม่ยินยอม Marketing
- `C14-T01-05` จำกัดไม่ให้ใช้ข้อมูล Clinical เป็น Segment โดยไม่มีฐานที่เหมาะสม
- `C14-T01-06` แสดงจำนวนและแนวโน้มของ Segment

### `[Choose · P1] C14-T02 — Loyalty & Referral`

- `C14-T02-01` สะสมและแลกคะแนน
- `C14-T02-02` Membership tier
- `C14-T02-03` Referral code/link
- `C14-T02-04` ให้ Reward เมื่อผ่านเงื่อนไขจริง
- `C14-T02-05` ป้องกัน Self-referral และ Abuse
- `C14-T02-06` Reverse Reward เมื่อ Transaction ถูกคืน

### `[Choose · P1] C14-T03 — Promotion & Campaign`

- `C14-T03-01` ส่วนลดบริการ สินค้า หรือ Package
- `C14-T03-02` Promotion ช่วงเวลาว่าง
- `C14-T03-03` Birthday/Anniversary offer ตาม Consent
- `C14-T03-04` กำหนด Eligibility, Limit และ Stacking
- `C14-T03-05` ส่ง Campaign ผ่านช่องทางที่อนุญาต
- `C14-T03-06` วัด Booking, Redemption และ Revenue

### `[Choose · P1] C14-T04 — Feedback, Review & Recovery`

- `C14-T04-01` ส่ง Feedback request หลังบริการ
- `C14-T04-02` รับ Rating และ Comment
- `C14-T04-03` แจ้ง Manager เมื่อคะแนนต่ำ
- `C14-T04-04` เปิด Service recovery task
- `C14-T04-05` ขอ Review สาธารณะโดยไม่บังคับหรือบิดเบือน
- `C14-T04-06` วิเคราะห์ Feedback ตามบริการ สาขา และเวลา

### `[Advanced · P2] C14-T05 — Rebooking & Retention Automation`

- `C14-T05-01` แนะนำช่วง Rebooking จาก Service rule
- `C14-T05-02` ส่ง Reminder เมื่อถึงรอบ
- `C14-T05-03` เสนอ Staff/Service เดิม
- `C14-T05-04` สร้าง Win-back journey สำหรับลูกค้าที่หายไป
- `C14-T05-05` จำกัดความถี่การติดต่อ
- `C14-T05-06` วัด Rebooking conversion

## C15 — Dashboard, Reporting & Capacity Intelligence

### `[Core · P1] C15-T01 — Daily Operations Overview`

- `C15-T01-01` นัดวันนี้ แยก Confirmed, Checked-in, Waiting และ In service
- `C15-T01-02` Walk-in queue และเวลารอ
- `C15-T01-03` Unassigned หรือ Conflict
- `C15-T01-04` ยอดขาย ยอดรับ และยอดค้าง
- `C15-T01-05` Cancellation/No-show/Delay alert
- `C15-T01-06` Staff และ Resource availability

### `[Choose · P1] C15-T02 — Booking & Revenue Analytics`

- `C15-T02-01` Booking, Visit และ Revenue trend
- `C15-T02-02` Online vs Staff-created vs Walk-in
- `C15-T02-03` Average ticket และ Service mix
- `C15-T02-04` Deposit, Refund และ Outstanding
- `C15-T02-05` Package/Membership sales and redemption
- `C15-T02-06` เปรียบเทียบสาขาและช่วงเวลา

### `[Choose · P1] C15-T03 — Capacity, Staff & Resource Analytics`

- `C15-T03-01` Staff utilization
- `C15-T03-02` Resource utilization
- `C15-T03-03` Gap time และ Peak period
- `C15-T03-04` Service duration variance
- `C15-T03-05` Revenue per available hour
- `C15-T03-06` Bottleneck ระหว่าง Staff, Room และ Demand

### `[Choose · P1] C15-T04 — Cancellation, No-show & Retention Analytics`

- `C15-T04-01` Cancellation และ No-show rate
- `C15-T04-02` แยกตาม Lead time, Channel, Service และ Policy
- `C15-T04-03` Reschedule rate
- `C15-T04-04` Repeat visit และ Rebooking rate
- `C15-T04-05` Cohort retention
- `C15-T04-06` Package expiry และ Breakage

### `[Advanced · P2] C15-T05 — Forecast & Schedule Recommendation`

- `C15-T05-01` Forecast Demand ตามวัน เวลา และบริการ
- `C15-T05-02` แนะนำ Staffing/Resource coverage
- `C15-T05-03` แนะนำ Slot configuration
- `C15-T05-04` แสดง Confidence และปัจจัยที่ใช้
- `C15-T05-05` ให้ Manager อนุมัติก่อน Publish
- `C15-T05-06` วัด Forecast accuracy

## C16 — Care Administration, Privacy & Integration

### `[Core · P0] C16-T01 — Booking & Service Configuration`

- `C16-T01-01` ตั้งค่า Service duration, Buffer และ Capacity
- `C16-T01-02` ตั้งค่า Booking horizon และ Lead time
- `C16-T01-03` ตั้งค่า Cancellation, No-show และ Deposit policy
- `C16-T01-04` ตั้งค่า Status และ Completion gate
- `C16-T01-05` ตั้งค่าเลข Appointment, Visit และเอกสาร
- `C16-T01-06` Preview ผลกระทบก่อน Publish

### `[Core · P0] C16-T02 — Sensitive Data Boundary`

- `C16-T02-01` แยกข้อมูลติดต่อ การตลาด บริการ และ Clinical
- `C16-T02-02` จำกัด Role ตาม Need-to-know
- `C16-T02-03` ไม่ส่งรายละเอียดละเอียดอ่อนผ่าน Notification ทั่วไป
- `C16-T02-04` Audit การดู แก้ Export และลบ
- `C16-T02-05` กำหนด Retention ตามประเภทข้อมูลและนโยบายธุรกิจ
- `C16-T02-06` ป้องกันข้อมูล Clinical ถูกใช้ใน Marketing โดยอัตโนมัติ

### `[Advanced · P2] C16-T03 — Payment, Calendar & Accounting Integration`

- `C16-T03-01` เชื่อม Payment provider
- `C16-T03-02` เชื่อม External calendar
- `C16-T03-03` Export รายได้ ภาษี และ Commission
- `C16-T03-04` Mapping Service/Product ไปบัญชี
- `C16-T03-05` Reconcile Settlement
- `C16-T03-06` แสดง Integration error

### `[Advanced · P3] C16-T04 — Multi-branch Service Governance`

- `C16-T04-01` Master service catalog
- `C16-T04-02` Pricing และ Duration ระดับสาขา
- `C16-T04-03` Shared client identity พร้อม Data boundary
- `C16-T04-04` Staff ทำงานข้ามสาขา
- `C16-T04-05` Package/Membership ใช้ข้ามสาขาตามกฎ
- `C16-T04-06` Consolidated reporting

### `[Advanced · P3] C16-T05 — API, Partner & Marketplace Integration`

- `C16-T05-01` Booking widget/API
- `C16-T05-02` รับ Booking จาก Partner
- `C16-T05-03` Sync Availability โดยป้องกัน Overbooking
- `C16-T05-04` ส่ง Status และ Cancellation
- `C16-T05-05` Mapping Service/Staff/Branch
- `C16-T05-06` Reconcile Commission และ Error queue
