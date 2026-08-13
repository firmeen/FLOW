---
title: FLOW Shared Foundation Feature Catalog
document_id: FLOW-CORE-CATALOG
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# FLOW Shared Foundation Feature Catalog

Shared Foundation คือความสามารถกลางที่ FoodFlow, CareFlow และ JobFlow ใช้ร่วมกัน รายละเอียดในเอกสารนี้เป็น Source of truth ของ Topic รหัส `SXX`.

Shared Foundation เป็นความสามารถกลางที่ทั้งสาม Product ใช้ร่วมกัน เพื่อลดการสร้างระบบซ้ำและทำให้ร้านที่ใช้หลาย Product อยู่ภายใต้ธุรกิจเดียวกันได้

## S01 — Business, Branch & Workspace

### `[Core · P0] S01-T01 — Business Workspace`

- `S01-T01-01` สร้าง Workspace ของธุรกิจ
- `S01-T01-02` กำหนดชื่อธุรกิจ ชื่อทางการค้า โลโก้ และข้อมูลติดต่อ
- `S01-T01-03` กำหนดเจ้าของ Workspace
- `S01-T01-04` แยกข้อมูลระหว่างธุรกิจแบบ Tenant isolation
- `S01-T01-05` กำหนดสถานะ Active, Suspended และ Closed
- `S01-T01-06` บันทึกวันที่เริ่มใช้งานและแหล่งที่มาของลูกค้าธุรกิจ

### `[Core · P0] S01-T02 — Store or Branch Profile`

- `S01-T02-01` สร้างร้านหรือสาขา
- `S01-T02-02` กำหนดที่อยู่ พิกัด เบอร์โทร และช่องทางติดต่อ
- `S01-T02-03` กำหนดเวลาเปิด–ปิดแยกตามวัน
- `S01-T02-04` กำหนดวันหยุดและช่วงปิดพิเศษ
- `S01-T02-05` กำหนด Timezone ภาษา สกุลเงิน และรูปแบบวันที่
- `S01-T02-06` กำหนดสถานะเปิดรับลูกค้า หยุดรับชั่วคราว หรือปิดร้าน
- `S01-T02-07` แสดงข้อความประกาศเฉพาะสาขา

### `[Choose · P2] S01-T03 — Multi-branch Organization`

- `S01-T03-01` จัดกลุ่มหลายสาขาภายใต้ธุรกิจเดียว
- `S01-T03-02` ใช้ Configuration กลางหรือ Override รายสาขา
- `S01-T03-03` ย้ายพนักงานและกำหนดสิทธิ์ข้ามสาขา
- `S01-T03-04` กำหนดผู้จัดการระดับสาขาและระดับองค์กร
- `S01-T03-05` เปรียบเทียบข้อมูลระหว่างสาขา
- `S01-T03-06` กำหนด Data visibility ตามสาขา

## S02 — Identity, Authentication & Authorization

### `[Core · P0] S02-T01 — Owner Authentication`

- `S02-T01-01` Login และ Logout
- `S02-T01-02` ตั้งค่าและเปลี่ยนรหัสผ่าน
- `S02-T01-03` Forgot password และ Password reset
- `S02-T01-04` ตรวจสอบสถานะบัญชีก่อนอนุญาตเข้า Workspace
- `S02-T01-05` จัดการ Session และหมดอายุอัตโนมัติ
- `S02-T01-06` ยกเลิก Session จากอุปกรณ์อื่น

### `[Choose · P1] S02-T02 — Staff Authentication`

- `S02-T02-01` สร้างบัญชีพนักงาน
- `S02-T02-02` Login ด้วยบัญชีส่วนตัว
- `S02-T02-03` Login ด้วย PIN สำหรับอุปกรณ์ประจำร้าน
- `S02-T02-04` บังคับเปลี่ยน PIN หรือรหัสผ่านครั้งแรก
- `S02-T02-05` ระงับบัญชีเมื่อพนักงานออก
- `S02-T02-06` จำกัดอุปกรณ์หรือสาขาที่อนุญาต

### `[Core · P0] S02-T03 — Role-based Access Control`

- `S02-T03-01` สร้าง Role มาตรฐานของแต่ละ Product
- `S02-T03-02` กำหนด Permission สำหรับ View, Create, Update, Approve, Cancel และ Export
- `S02-T03-03` จำกัดข้อมูลการเงิน ข้อมูลลูกค้า และข้อมูลละเอียดอ่อน
- `S02-T03-04` ตรวจ Permission ทั้งหน้าเว็บและ Backend
- `S02-T03-05` ป้องกันการเข้าถึง Route โดยตรงเมื่อไม่มีสิทธิ์
- `S02-T03-06` รองรับ Custom role ในระดับ Advanced

### `[Advanced · P2] S02-T04 — Strong Authentication & Access Policy`

- `S02-T04-01` Multi-factor authentication
- `S02-T04-02` กำหนด Password policy
- `S02-T04-03` จำกัด Session duration ตาม Role
- `S02-T04-04` แจ้งเตือน Login ผิดปกติ
- `S02-T04-05` บังคับ Re-authentication ก่อนทำรายการสำคัญ
- `S02-T04-06` Allowlist อุปกรณ์หรือเครือข่ายตามนโยบายธุรกิจ

## S03 — Workflow, Status & Task Engine

### `[Core · P0] S03-T01 — Workflow State Machine`

- `S03-T01-01` กำหนดสถานะหลักของ Order, Appointment และ Job
- `S03-T01-02` กำหนด Transition ที่อนุญาต
- `S03-T01-03` ตรวจ Role ที่มีสิทธิ์เปลี่ยนแต่ละสถานะ
- `S03-T01-04` ป้องกันการข้ามสถานะที่ผิดกฎ
- `S03-T01-05` เก็บเวลาเข้าและออกจากแต่ละสถานะ
- `S03-T01-06` บันทึกเหตุผลสำหรับ Cancel, Reject, Hold และ Reopen
- `S03-T01-07` รองรับสถานะระบบและสถานะที่แสดงต่อลูกค้าแยกกัน

### `[Dependency · P0] S03-T02 — Assignment & Ownership`

- `S03-T02-01` มอบหมายรายการให้พนักงาน ทีม หรือจุดปฏิบัติงาน
- `S03-T02-02` เปลี่ยนผู้รับผิดชอบ
- `S03-T02-03` แสดงรายการที่ยังไม่มีผู้รับผิดชอบ
- `S03-T02-04` เก็บประวัติการมอบหมาย
- `S03-T02-05` แจ้งผู้ได้รับมอบหมาย
- `S03-T02-06` ป้องกันการรับงานซ้ำพร้อมกัน

### `[Choose · P1] S03-T03 — Priority, SLA & Escalation`

- `S03-T03-01` กำหนดระดับความเร่งด่วน
- `S03-T03-02` กำหนดเวลาเป้าหมายตามประเภทงาน
- `S03-T03-03` แสดง Countdown หรือสถานะใกล้เกินเวลา
- `S03-T03-04` แจ้งเตือนเมื่อเกิน SLA
- `S03-T03-05` Escalate ไปยังหัวหน้าหรือผู้จัดการ
- `S03-T03-06` บันทึกเหตุผลของความล่าช้า

### `[Choose · P2] S03-T04 — Checklist & Subtask`

- `S03-T04-01` สร้าง Checklist template
- `S03-T04-02` เพิ่ม Subtask ในรายการหลัก
- `S03-T04-03` กำหนดผู้รับผิดชอบและ Due time ราย Subtask
- `S03-T04-04` บังคับทำข้อกำหนดก่อนเปลี่ยนสถานะ
- `S03-T04-05` แนบหลักฐานกับ Checklist item
- `S03-T04-06` คัดลอก Checklist ตามประเภทงาน

## S04 — Customer Identity, Consent & Relationship Base

### `[Dependency · P0] S04-T01 — Guest Customer Record`

- `S04-T01-01` สร้างข้อมูลลูกค้าแบบไม่ต้องสมัครสมาชิก
- `S04-T01-02` เก็บชื่อและช่องทางติดต่อเท่าที่ Workflow ต้องใช้
- `S04-T01-03` เชื่อมลูกค้ากับ Order, Appointment หรือ Job
- `S04-T01-04` ป้องกันการสร้างข้อมูลซ้ำตามกฎที่กำหนด
- `S04-T01-05` รองรับ Anonymous customer เมื่อไม่จำเป็นต้องระบุตัวตน

### `[Choose · P1] S04-T02 — Customer Account`

- `S04-T02-01` สมัครสมาชิก
- `S04-T02-02` Login ด้วยรหัสผ่านหรือ OTP
- `S04-T02-03` จัดการข้อมูลส่วนตัว
- `S04-T02-04` ดูประวัติของตนเอง
- `S04-T02-05` จัดการช่องทางรับการแจ้งเตือน
- `S04-T02-06` ขอปิดบัญชีหรือส่งคำขอเกี่ยวกับข้อมูล

### `[Core · P0] S04-T03 — Consent & Communication Preference`

- `S04-T03-01` แยกการยอมรับเงื่อนไขบริการจากความยินยอมทางการตลาด
- `S04-T03-02` บันทึก Version ของข้อความที่ลูกค้ายอมรับ
- `S04-T03-03` บันทึกวันเวลา แหล่งที่มา และวิธีให้ความยินยอม
- `S04-T03-04` ถอนความยินยอมทางการตลาด
- `S04-T03-05` เลือกช่องทาง Email, SMS, LINE หรือ In-app
- `S04-T03-06` บังคับใช้ Preference ก่อนส่งการสื่อสารที่ไม่จำเป็นต่อบริการ

## S05 — Notification & Communication Engine

### `[Core · P0] S05-T01 — In-app Notification`

- `S05-T01-01` แจ้งเหตุการณ์สำคัญในระบบ
- `S05-T01-02` แสดงจำนวนรายการที่ยังไม่อ่าน
- `S05-T01-03` Mark as read
- `S05-T01-04` เชื่อม Notification ไปยังรายการต้นทาง
- `S05-T01-05` แยกความสำคัญ Information, Warning และ Critical
- `S05-T01-06` ป้องกันการแจ้งซ้ำโดยไม่จำเป็น

### `[Choose · P1] S05-T02 — External Notification Channels`

- `S05-T02-01` ส่ง Email
- `S05-T02-02` ส่ง SMS
- `S05-T02-03` ส่ง LINE หรือ Messaging integration
- `S05-T02-04` Push notification เมื่อรองรับ PWA/App
- `S05-T02-05` Fallback ไปช่องทางสำรองเมื่อส่งไม่สำเร็จ
- `S05-T02-06` เก็บ Delivery status

### `[Choose · P1] S05-T03 — Notification Template & Rule`

- `S05-T03-01` สร้าง Template ตามเหตุการณ์
- `S05-T03-02` ใช้ตัวแปรชื่อร้าน ลูกค้า เลขรายการ และเวลา
- `S05-T03-03` กำหนดผู้รับตาม Role หรือความสัมพันธ์กับรายการ
- `S05-T03-04` กำหนดเวลาส่งล่วงหน้าหรือหน่วงเวลา
- `S05-T03-05` เปิด–ปิด Template รายสาขา
- `S05-T03-06` Preview และส่งทดสอบ

### `[Advanced · P2] S05-T04 — Two-way Communication`

- `S05-T04-01` สนทนาระหว่างร้านกับลูกค้าผูกกับรายการ
- `S05-T04-02` เก็บ Message history
- `S05-T04-03` แยก Internal note จาก Customer-visible message
- `S05-T04-04` กำหนดเวลาทำการและ Auto-response
- `S05-T04-05` มอบหมายบทสนทนาให้พนักงาน
- `S05-T04-06` Flag ข้อความที่ต้องติดตาม

## S06 — Files, Documents & Evidence

### `[Dependency · P0] S06-T01 — File Attachment`

- `S06-T01-01` อัปโหลดรูปภาพและเอกสาร
- `S06-T01-02` ตรวจประเภทและขนาดไฟล์
- `S06-T01-03` แสดง Preview เมื่อรองรับ
- `S06-T01-04` ผูกไฟล์กับรายการและผู้ที่อัปโหลด
- `S06-T01-05` ลบหรือแทนที่ภายใต้ Permission
- `S06-T01-06` ป้องกันการเข้าถึงไฟล์ข้ามธุรกิจ

### `[Choose · P1] S06-T02 — Document Generation`

- `S06-T02-01` สร้างเอกสารจาก Template
- `S06-T02-02` กำหนดเลขเอกสาร
- `S06-T02-03` สร้าง PDF สำหรับดาวน์โหลดหรือส่งลูกค้า
- `S06-T02-04` เก็บ Snapshot ของเอกสารที่ออกแล้ว
- `S06-T02-05` รองรับสถานะ Draft, Issued, Voided และ Replaced
- `S06-T02-06` ปรับ Branding เอกสารตามร้าน

### `[Advanced · P2] S06-T03 — Digital Signature & Evidence Integrity`

- `S06-T03-01` ลงลายมือชื่อบนหน้าจอ
- `S06-T03-02` บันทึกผู้ลงนาม วันเวลา และบริบท
- `S06-T03-03` ผูกลายมือชื่อกับ Version เอกสาร
- `S06-T03-04` ป้องกันแก้ไขเอกสารหลังลงนามโดยไม่สร้าง Version ใหม่
- `S06-T03-05` เก็บหลักฐานการยอมรับหรือส่งมอบ
- `S06-T03-06` แสดงประวัติการเพิกถอนหรือแทนที่

## S07 — Audit, Data Quality & Export

### `[Core · P0] S07-T01 — Activity & Audit Log`

- `S07-T01-01` บันทึกผู้กระทำ เวลา และ Action
- `S07-T01-02` บันทึกค่าเดิมและค่าใหม่ของรายการสำคัญ
- `S07-T01-03` บันทึกการเปลี่ยนสถานะ การอนุมัติ การเงิน และสิทธิ์
- `S07-T01-04` ค้นหาและ Filter Log
- `S07-T01-05` จำกัดสิทธิ์การดู Log
- `S07-T01-06` ป้องกันผู้ใช้ทั่วไปแก้ไข Log

### `[Core · P1] S07-T02 — Data Validation & Quality Control`

- `S07-T02-01` ตรวจ Required fields
- `S07-T02-02` ตรวจรูปแบบข้อมูลและค่าที่อนุญาต
- `S07-T02-03` ป้องกันรายการซ้ำตาม Business key
- `S07-T02-04` แสดง Validation message ที่แก้ไขได้จริง
- `S07-T02-05` ตรวจ Referential integrity ระหว่างรายการ
- `S07-T02-06` แยก Error ที่ผู้ใช้แก้ได้จาก System error

### `[Choose · P1] S07-T03 — Data Export`

- `S07-T03-01` Export CSV หรือ Excel
- `S07-T03-02` Export ตาม Filter และช่วงวันที่
- `S07-T03-03` จำกัด Column ตาม Permission
- `S07-T03-04` Mask ข้อมูลละเอียดอ่อนเมื่อจำเป็น
- `S07-T03-05` บันทึกว่าใคร Export อะไร
- `S07-T03-06` รองรับ Export แบบ Background สำหรับข้อมูลขนาดใหญ่

## S08 — Configuration, Integration & Reliability

### `[Core · P0] S08-T01 — Module Entitlement & Feature Configuration`

- `S08-T01-01` เปิด–ปิด Feature Topic ตาม Package ของร้าน
- `S08-T01-02` ตรวจ Dependency ก่อนเปลี่ยน Configuration
- `S08-T01-03` แสดงผลกระทบก่อนปิด Topic
- `S08-T01-04` กำหนด Configuration ระดับธุรกิจและสาขา
- `S08-T01-05` บันทึกประวัติการเปลี่ยน Configuration
- `S08-T01-06` รองรับ Trial หรือ Feature preview โดยไม่ทำข้อมูลเสีย

### `[Choose · P2] S08-T02 — API & Webhook`

- `S08-T02-01` ออก API credential แยก Integration
- `S08-T02-02` จำกัด Scope ของ API
- `S08-T02-03` ส่ง Webhook ตามเหตุการณ์
- `S08-T02-04` ลงลายเซ็น Webhook และตรวจ Replay
- `S08-T02-05` Retry เมื่อปลายทางล้มเหลว
- `S08-T02-06` แสดง Delivery log และ Redelivery

### `[Advanced · P2] S08-T03 — Offline Resilience`

- `S08-T03-01` แสดงสถานะ Online/Offline
- `S08-T03-02` เก็บ Draft action ที่ยังส่งไม่สำเร็จ
- `S08-T03-03` Sync เมื่อกลับมา Online
- `S08-T03-04` ป้องกัน Action ซ้ำด้วย Idempotency
- `S08-T03-05` จัดการ Conflict เมื่อข้อมูลเปลี่ยนจากหลายอุปกรณ์
- `S08-T03-06` จำกัด Offline action สำหรับรายการเสี่ยง เช่น Refund หรือแก้สิทธิ์

### `[Advanced · P3] S08-T04 — Integration Monitoring`

- `S08-T04-01` แสดงสถานะ Integration
- `S08-T04-02` แจ้งเตือน Credential หมดอายุ
- `S08-T04-03` แสดง Error rate และรายการส่งไม่สำเร็จ
- `S08-T04-04` Pause และ Resume Integration
- `S08-T04-05` Replay ข้อมูลโดยไม่สร้างรายการซ้ำ
- `S08-T04-06` เก็บ Mapping version ระหว่างระบบ
