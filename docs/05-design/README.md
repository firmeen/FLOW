# FLOW Complete Feature Catalog

**ผลิตภัณฑ์:** FoodFlow · CareFlow · JobFlow  
**สถานะเอกสาร:** Product Strategy Baseline  
**ฉบับ:** 1.0 · 13 สิงหาคม 2026  
**วัตถุประสงค์:** กำหนดคลังความสามารถทั้งหมดของ FLOW ในโครงสร้างที่สามารถนำไปสร้าง Feature Bundle, Product Roadmap, Role & Permission, Page Inventory, UI Specification, API และ Test Case ต่อได้

---

## 1. วิธีอ่านเอกสาร

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

### 1.1 ความหมายของแต่ละระดับ

| ระดับ | ความหมาย | ใช้ตัดสินใจเรื่องใด |
|---|---|---|
| Product | Vertical product เช่น FoodFlow | ตลาดและ Operating Model หลัก |
| Feature Group | ขอบเขตความสามารถขนาดใหญ่ | Ownership, Architecture และ Roadmap |
| Feature Topic | หน่วยความสามารถที่เปิด–ปิดและนำไปจัด Bundle ได้ | Packaging, Entitlement และราคา |
| Individual Feature | พฤติกรรมย่อยที่ผู้ใช้หรือระบบทำได้ | Page, API, Permission และ Test Case |

### 1.2 ประเภทของ Feature Topic

| ป้าย | ความหมาย |
|---|---|
| `Core` | จำเป็นต่อ Product หรือ Workflow หลัก ปิดไม่ได้เมื่อเปิด Product นั้น |
| `Choose` | ร้านเลือกเปิดหรือไม่เปิดได้ตามรูปแบบการทำงาน |
| `Dependency` | ระบบเปิดให้อัตโนมัติเมื่อ Topic อื่นต้องพึ่งพา ไม่ควรขายแยก |
| `Advanced` | ต้องมีความพร้อมด้านข้อมูล กระบวนการ อุปกรณ์ หรือ Integration เพิ่ม |

### 1.3 ระดับความสำคัญเชิงผลิตภัณฑ์

| Priority | ความหมาย |
|---|---|
| `P0` | Minimum usable workflow — หากไม่มี Workflow หลักจะไม่สมบูรณ์หรือเสี่ยงต่อข้อมูลผิด |
| `P1` | Bundle-complete — ทำให้ Solution Bundle หลักใช้งานในร้านจริงได้ดี |
| `P2` | Growth & optimization — เพิ่มรายได้ ลดงานซ้ำ หรือยกระดับประสบการณ์ |
| `P3` | Scale & ecosystem — เหมาะกับหลายสาขา Automation ขั้นสูง หรือระบบภายนอก |

> Priority ไม่ได้แปลว่าทุก P0 ของทั้งสาม Product ต้องพัฒนาพร้อมกัน ควรเลือก Product Beachhead หนึ่งตัว แล้วทำ P0 ของ Workflow ที่ขายจริงให้จบตั้งแต่ Entry ถึง Completion ก่อน

### 1.4 กติกาการจัด Bundle

1. Bundle เลือกในระดับ **Feature Topic** ไม่ใช่เลือกปุ่มย่อยทีละปุ่ม
2. Topic ที่เป็น Dependency ต้องเปิดอัตโนมัติและแสดงเหตุผลให้ผู้ดูแลร้านทราบ
3. ร้านเริ่มจาก Bundle แนะนำ แล้วเพิ่ม–ลด `Choose` หรือ `Advanced` ได้ภายใต้ Dependency ที่ถูกต้อง
4. `Full` หมายถึงครอบคลุม Operating Model ไม่ได้หมายถึงเปิดทุก Topic โดยอัตโนมัติ เช่น ร้านเสริมสวยทั่วไปไม่ควรได้ Clinical Record เพียงเพราะซื้อ CareFlow Full Business
5. Feature Catalog คือ Product Universe ไม่ใช่ Commitment ว่าทุก Feature อยู่ใน MVP หรือรวมอยู่ในราคาเดียว

---

# 2. FLOW Shared Foundation

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

---

# 3. FoodFlow Complete Feature Catalog

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

---

# 4. FoodFlow Recommended Feature Bundles

Bundle ทั้งห้าชุดเป็น **Solution Preset** ไม่ใช่ Product ใหม่และไม่ใช่ลำดับราคาแบบตายตัว

## 4.1 FoodFlow Starter

**เหมาะกับ:** ร้านเล็กที่ต้องการเมนูดิจิทัล รับออเดอร์จาก QR และชำระก่อนเริ่มทำ

**Topic หลัก**

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

## 4.2 FoodFlow Dine-in

**เหมาะกับ:** ร้านนั่งรับประทานที่ลูกค้าสแกน QR โต๊ะ สั่งเพิ่มได้ และชำระตอนท้าย

**Topic หลัก**

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

## 4.3 FoodFlow Kitchen

**เหมาะกับ:** ร้านที่ต้องการยกระดับการรับ–กระจาย–ทำ–ปล่อยออเดอร์ในครัว โดยรับ Order จาก FoodFlow หรือระบบภายนอก

**Topic หลัก**

- `F04-T01–T07` Unified order control และ Exception
- `F06-T03` Serve confirmation
- `F07-T01–T05` KDS, Routing, Item status, Timer และ Expo
- `F07-T07` Recall/Remake
- `F16-T02` Device & station management
- `F15-T04` Kitchen performance
- Shared Assignment, SLA, Notification และ Audit

**Dependency สำคัญ:** ต้องมี Order source อย่างน้อยหนึ่งแหล่งและ Menu/Station mapping  
**ตัวเลือกแนะนำ:** `F07-T06` Course firing, `F07-T08` Kitchen printing, Third-party order integration

## 4.4 FoodFlow Full Restaurant

**เหมาะกับ:** ร้านบริการเต็มรูปแบบที่มีหน้าร้าน ครัว แคชเชียร์ การจอง และการบริหารหลายบทบาท

**Topic หลัก**

- `F01–F08` ทุก P0/P1 ที่ตรงกับ Operating model
- `F09` เมื่อมี Pickup/Pre-order
- `F11` Reservation, Deposit และ Waitlist
- `F12-T01–T05` Inventory, Recipe, Movement, Count และ Waste
- `F13-T01–T07` Customer, Promotion, Loyalty และ Feedback
- `F14-T01–T03` Staff, Schedule และ Attendance
- `F15-T01–T05` Operations, Sales, Menu, Kitchen และ Customer analytics
- `F16-T01–T03` Configuration, Devices และ Integration

**ไม่เปิดอัตโนมัติ:** Delivery, Lot traceability, Forecast, Enterprise branch control—เปิดเมื่อร้านมีความพร้อมจริง

## 4.5 FoodFlow Café

**เหมาะกับ:** คาเฟ่ เบเกอรี่ ร้านเครื่องดื่ม และ Quick-service ที่มี Modifier มาก รับ Order หน้าเคาน์เตอร์/ออนไลน์ และผลิตผ่าน KDS

**Topic หลัก**

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

---

# 5. CareFlow Complete Feature Catalog

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

---

# 6. CareFlow Recommended Feature Bundles

## 6.1 CareFlow Solo

**เหมาะกับ:** ผู้ให้บริการคนเดียวที่ต้องการหน้ารับจอง ปฏิทิน แจ้งเตือน และรับเงิน

- `C01-T01–T04` Storefront และ Service catalog
- `C02-T01, T04–T05, T07` Booking, Availability, Self-service change และ Policy
- `C03-T01, T04–T05` Calendar, Manual booking และ Block time
- `C04-T01–T02, T05` Status, Check-in และ Completion
- `C05-T01–T02` Provider และ Availability
- `C07-T01–T03` Client profile/history/preference
- `C10-T01–T02, T05` Checkout, Payment และ Receipt
- `C13-T01` Reminder
- `C15-T01` Daily overview

**ไม่ควรบังคับ:** Team scheduling, Commission, Resource, Clinical record และ Advanced marketing

## 6.2 CareFlow Team

**เหมาะกับ:** ร้านบริการหลายพนักงานที่ต้องจัดตาราง เลือกผู้ให้บริการ และกระจายงาน

- CareFlow Solo topics ที่เกี่ยวข้อง
- `C03-T02` Staff calendar
- `C05-T01–T06` Profile, Availability, Selection, Assignment, Shift และ Commission
- `C04-T03–T04` Walk-in/Hybrid queue เมื่อร้านรับลูกค้าหน้างาน
- `C13-T01–T03` Reminder, Operational notification และ Follow-up
- `C15-T02–T03` Revenue และ Utilization analytics

**ตัวเลือกแนะนำ:** Resource booking, Package, Loyalty และ Inventory

## 6.3 CareFlow Spa

**เหมาะกับ:** Spa/Wellness ที่มีหลายบริการ หลายพนักงาน ห้อง อุปกรณ์ Deposit และ Package

- `C01–C05` P0/P1 ที่ตรงกับร้าน
- `C06-T01–T04` Room/resource, Reservation, Cleaning และ Maintenance
- `C07-T01–T05` Client history, Preference, Alert และ Media ตาม Consent
- `C08-T01–T03` Intake, Consent และ Completion gate
- `C10` Checkout/Deposit/Refund
- `C11` Package, Membership และ Wallet
- `C12-T01–T03` Retail/Consumable inventory
- `C13–C15` Communication, CRM และ Analytics

**ไม่เปิดอัตโนมัติ:** Clinical record, Restricted clinical access และ Lot traceability หาก Operating model ไม่ต้องใช้

## 6.4 CareFlow Clinic

**เหมาะกับ:** Clinic/Med-spa หรือบริการที่ต้องมี Form, Consent, Treatment record และ Follow-up ภายใต้สิทธิ์เข้มงวด

- CareFlow Team/Spa topics ตาม Workflow จริง
- `C07-T04–T05` Alert และ Before/After media
- `C08-T01–T04` Forms, Consent, Gate และ Version/access
- `C09-T01–T05` Treatment, Plan, Progress, Restricted access และ Follow-up
- `C12-T02, T05` Material usage และ Lot traceability เมื่อจำเป็น
- `C16-T02` Sensitive data boundary
- Strong authentication, Re-authentication, Audit และ Retention controls

**ขอบเขตเชิงกลยุทธ์:** ควรขายเป็น Clinical Extension หลังผ่าน Legal/Professional/Workflow validation แยก ไม่ควรอ้างว่าเป็นระบบเวชระเบียนเต็มรูปแบบจาก Feature list นี้เพียงอย่างเดียว

## 6.5 CareFlow Full Business

**เหมาะกับ:** ธุรกิจบริการครบวงจรที่มี Booking, Queue, Staff, Resource, POS, Package, CRM และหลายสาขา

- `C01–C08` P0/P1 ตาม Operating model
- `C10–C15` Checkout, Package, Inventory, Communication, CRM และ Analytics
- `C16-T01, T03–T04` Configuration, Integration และ Multi-branch
- เลือก `C09` เฉพาะธุรกิจที่มีเหตุผลด้านบริการและการกำกับข้อมูล

**หลักสำคัญ:** Full Business ไม่เท่ากับ Full Clinical; ขอบเขตข้อมูลต้องยึดตามความจำเป็น ไม่ใช่ระดับราคา

---

# 7. JobFlow Complete Feature Catalog

**Operating model:** Request/Lead → Intake → Inspect → Quote/Approve → Schedule/Assign → Execute → QC → Handover → Invoice/Collect → Warranty/Repeat  
**Primary roles:** Customer, Front Desk, Dispatcher, Technician, Field Worker, Warehouse, QC, Cashier, Manager, Owner

## J01 — Customer Request, Lead & Service Intake

### `[Core · P0] J01-T01 — Public Service Request`

- `J01-T01-01` เปิด Request form ผ่าน Public link
- `J01-T01-02` เลือกประเภทบริการหรือปัญหา
- `J01-T01-03` กรอกรายละเอียดและข้อมูลติดต่อ
- `J01-T01-04` อัปโหลดภาพ วิดีโอ หรือเอกสารตามข้อจำกัด
- `J01-T01-05` เลือกสาขาหรือพื้นที่บริการ
- `J01-T01-06` แสดงเงื่อนไขและสิ่งที่ต้องเตรียม
- `J01-T01-07` สร้าง Request number และ Confirmation
- `J01-T01-08` ป้องกัน Submit ซ้ำ

### `[Choose · P1] J01-T02 — Online Booking & Drop-off Appointment`

- `J01-T02-01` เลือกวันและเวลา Drop-off/Inspection
- `J01-T02-02` ตรวจ Capacity ของสาขาหรือทีม
- `J01-T02-03` กำหนด Lead time และ Cut-off
- `J01-T02-04` รับ Deposit เมื่อจำเป็น
- `J01-T02-05` Reschedule/Cancel ตาม Policy
- `J01-T02-06` ส่ง Reminder และสิ่งที่ต้องนำมา

### `[Choose · P1] J01-T03 — Walk-in & Counter Intake`

- `J01-T03-01` Front desk สร้าง Request/Job แทนลูกค้า
- `J01-T03-02` ค้นหาหรือสร้าง Customer
- `J01-T03-03` ค้นหาหรือสร้าง Asset/Item
- `J01-T03-04` บันทึกปัญหาและความคาดหวัง
- `J01-T03-05` ระบุของที่รับมาพร้อมกัน
- `J01-T03-06` พิมพ์หรือส่งใบรับงาน

### `[Choose · P1] J01-T04 — Pickup or Mail-in Intake Request`

- `J01-T04-01` ขอให้ร้านไปรับหรือส่งเข้ามาทางขนส่ง
- `J01-T04-02` เก็บที่อยู่และช่วงเวลา
- `J01-T04-03` สร้าง Pickup/Inbound tracking task
- `J01-T04-04` บันทึก Tracking number
- `J01-T04-05` เปลี่ยน Request เป็น Job เมื่อของถึง
- `J01-T04-06` แจ้งลูกค้าทุกขั้นสำคัญ

### `[Choose · P1] J01-T05 — Request Triage & Qualification`

- `J01-T05-01` จัดประเภท Request
- `J01-T05-02` ประเมิน Urgency และ Serviceability เบื้องต้น
- `J01-T05-03` ขอข้อมูลเพิ่ม
- `J01-T05-04` Assign ให้ Front desk/Dispatcher
- `J01-T05-05` Accept, Reject หรือ Convert to Job/Estimate
- `J01-T05-06` บันทึกเหตุผลและ Source
- `J01-T05-07` ติดตาม Response time

### `[Advanced · P2] J01-T06 — Lead Source & Sales Pipeline`

- `J01-T06-01` บันทึก Source, Campaign และ Referral
- `J01-T06-02` กำหนด Lead stage
- `J01-T06-03` Assign ผู้ติดตาม
- `J01-T06-04` สร้าง Follow-up task
- `J01-T06-05` Convert เป็น Customer, Quote หรือ Job
- `J01-T06-06` วิเคราะห์ Conversion และ Lost reason

## J02 — Customer, Site, Asset & Item Records

### `[Core · P0] J02-T01 — Customer & Account Profile`

- `J02-T01-01` เก็บข้อมูลติดต่อและที่อยู่อย่างเหมาะสม
- `J02-T01-02` แสดง Request, Quote, Job, Invoice และ Payment history
- `J02-T01-03` เพิ่ม Tag และ Internal note
- `J02-T01-04` บันทึก Communication preference
- `J02-T01-05` Merge Duplicate พร้อม Audit
- `J02-T01-06` รองรับ Individual และ Business customer

### `[Core · P0] J02-T02 — Asset or Service Item Record`

- `J02-T02-01` สร้างรถ อุปกรณ์ โทรศัพท์ เครื่องจักร เสื้อผ้า หรือ Item type
- `J02-T02-02` กำหนดยี่ห้อ รุ่น ปี สี และ Identifier ตามประเภท
- `J02-T02-03` บันทึก Serial, IMEI, VIN, Plate หรือ Internal asset code ตามความจำเป็น
- `J02-T02-04` แนบรูปและเอกสาร
- `J02-T02-05` เชื่อม Asset กับเจ้าของและ Site
- `J02-T02-06` แสดงประวัติงานและ Warranty
- `J02-T02-07` Transfer ownership พร้อมประวัติ

### `[Choose · P1] J02-T03 — Service Site & Property`

- `J02-T03-01` เก็บ Site/Property หลายแห่งต่อลูกค้า
- `J02-T03-02` เก็บที่อยู่ พิกัด Access instruction และ Contact
- `J02-T03-03` ระบุ Operating hours และข้อจำกัดเข้าพื้นที่
- `J02-T03-04` เชื่อม Asset/Equipment ภายใน Site
- `J02-T03-05` แสดง Site service history
- `J02-T03-06` จำกัดการเปิดเผย Access code ตาม Role

### `[Choose · P1] J02-T04 — Intake Accessories & Custody`

- `J02-T04-01` บันทึกอุปกรณ์หรือสิ่งของที่ส่งมาพร้อม Item
- `J02-T04-02` บันทึกจำนวนและสภาพ
- `J02-T04-03` ถ่ายภาพประกอบ
- `J02-T04-04` ระบุจุดจัดเก็บ
- `J02-T04-05` Confirm คืนของตอนส่งมอบ
- `J02-T04-06` เก็บ Chain-of-custody event

### `[Advanced · P2] J02-T05 — Asset Hierarchy & Component History`

- `J02-T05-01` สร้าง Parent/child asset
- `J02-T05-02` บันทึก Component และ Serial
- `J02-T05-03` ย้าย Component ระหว่าง Asset
- `J02-T05-04` แสดง Service history ระดับ Component
- `J02-T05-05` ติดตาม Meter/Usage reading
- `J02-T05-06` เชื่อม Maintenance schedule

## J03 — Job Ticket, Work Order & Status Control

### `[Core · P0] J03-T01 — Job Ticket Creation`

- `J03-T01-01` สร้าง Job number ที่ไม่ซ้ำ
- `J03-T01-02` เชื่อม Customer, Asset/Site และ Request
- `J03-T01-03` ระบุประเภทงาน ปัญหา และ Scope เริ่มต้น
- `J03-T01-04` กำหนด Priority, Due date และผู้รับผิดชอบ
- `J03-T01-05` บันทึก Source และผู้สร้าง
- `J03-T01-06` แนบไฟล์และหมายเหตุ
- `J03-T01-07` Duplicate/Repeat job โดยไม่ทับประวัติเดิม

### `[Choose · P1] J03-T02 — QR/Barcode Job Tag`

- `J03-T02-01` สร้าง QR/Barcode ต่อ Job หรือ Item
- `J03-T02-02` พิมพ์ Label
- `J03-T02-03` Scan เพื่อเปิด Job
- `J03-T02-04` Scan เพื่อเปลี่ยน Location/Stage ภายใต้ Permission
- `J03-T02-05` Rotate/Reprint โดยเก็บ Audit
- `J03-T02-06` ป้องกัน Tag ที่ยกเลิกเข้าถึงข้อมูล

### `[Core · P0] J03-T03 — Job Status Lifecycle`

- `J03-T03-01` Received และ Inspecting
- `J03-T03-02` Waiting estimate/approval/parts
- `J03-T03-03` Scheduled, Assigned และ In progress
- `J03-T03-04` On hold, QC และ Ready
- `J03-T03-05` Delivered, Completed และ Cancelled
- `J03-T03-06` กำหนด Transition และ Role
- `J03-T03-07` เก็บเวลา เหตุผล และสถานะที่ลูกค้าเห็น

### `[Choose · P1] J03-T04 — Priority, SLA & Delay Reason`

- `J03-T04-01` กำหนด Priority และ Service level
- `J03-T04-02` คำนวณ Target response/start/complete time
- `J03-T04-03` แสดง Near due และ Overdue
- `J03-T04-04` ระบุ Delay reason
- `J03-T04-05` Pause SLA ตามเหตุผลที่อนุญาต
- `J03-T04-06` Escalate งานค้าง
- `J03-T04-07` แจ้งลูกค้าเมื่อ ETA เปลี่ยน

### `[Choose · P1] J03-T05 — Job Hold, Cancel & Reopen`

- `J03-T05-01` Hold พร้อมเหตุผลและผู้รับผิดชอบถัดไป
- `J03-T05-02` Cancel พร้อมประเมินค่าใช้จ่ายและ Stock impact
- `J03-T05-03` Reopen งานที่ปิดแล้วโดย Permission สูง
- `J03-T05-04` สร้าง Follow-up/Rework แทนการแก้ประวัติผิดวิธี
- `J03-T05-05` แจ้งผู้เกี่ยวข้อง
- `J03-T05-06` เก็บ Audit และ Snapshot

### `[Advanced · P2] J03-T06 — Batch & Parent/Child Job`

- `J03-T06-01` รับหลาย Item ใน Job เดียว
- `J03-T06-02` สร้าง Sub-job ต่อ Item หรือ Site
- `J03-T06-03` รวม Status และยอดระดับ Parent
- `J03-T06-04` แยก Assignment และ Due date
- `J03-T06-05` Partial completion/handover
- `J03-T06-06` ป้องกันปิด Parent ก่อน Child ครบตามกฎ

## J04 — Inspection, Diagnostics & Evidence

### `[Choose · P0] J04-T01 — Intake Condition Checklist`

- `J04-T01-01` ใช้ Checklist ตาม Job/Asset type
- `J04-T01-02` บันทึกสภาพภายนอกและอุปกรณ์ที่มาด้วย
- `J04-T01-03` ถ่ายภาพหรือวิดีโอ
- `J04-T01-04` Mark Existing damage
- `J04-T01-05` ให้ลูกค้าตรวจและรับทราบ
- `J04-T01-06` ลงลายมือชื่อเมื่อจำเป็น
- `J04-T01-07` Lock Snapshot หลังรับงาน

### `[Choose · P1] J04-T02 — Diagnostic Workflow`

- `J04-T02-01` Assign ผู้ตรวจ
- `J04-T02-02` ใช้ Diagnostic checklist/template
- `J04-T02-03` บันทึกอาการ สาเหตุที่เป็นไปได้ และผลทดสอบ
- `J04-T02-04` ระบุเครื่องมือ/ค่าที่วัด
- `J04-T02-05` ขอข้อมูลหรืออนุมัติการตรวจเพิ่ม
- `J04-T02-06` สรุป Finding ไปสร้าง Estimate
- `J04-T02-07` แยก Observation จากข้อสรุป

### `[Choose · P1] J04-T03 — Photo, Video & Evidence Timeline`

- `J04-T03-01` แนบหลักฐานก่อน ระหว่าง และหลังงาน
- `J04-T03-02` บันทึกผู้ถ่าย เวลา และ Stage
- `J04-T03-03` ใส่ Caption/Annotation โดยไม่แก้ต้นฉบับ
- `J04-T03-04` เปรียบเทียบ Before/After
- `J04-T03-05` จำกัดไฟล์ที่ลูกค้าเห็น
- `J04-T03-06` กำหนด Retention และ Access

### `[Choose · P1] J04-T04 — Customer Acknowledgement`

- `J04-T04-01` แสดงสภาพและขอบเขตที่รับเข้ามา
- `J04-T04-02` แสดงข้อจำกัดการตรวจหรือความเสี่ยงที่ร้านกำหนด
- `J04-T04-03` รับลายมือชื่อ/การยืนยัน
- `J04-T04-04` ผูกกับ Version เอกสาร
- `J04-T04-05` ส่งสำเนาให้ลูกค้า
- `J04-T04-06` เก็บผู้ดำเนินการและเวลา

### `[Advanced · P2] J04-T05 — AI-assisted Inspection Support`

- `J04-T05-01` ช่วยจัดประเภทภาพหรือข้อสังเกตเมื่อ Model รองรับ
- `J04-T05-02` แสดง Confidence และข้อจำกัด
- `J04-T05-03` ให้ผู้ตรวจยืนยัน แก้ หรือปฏิเสธผล
- `J04-T05-04` ไม่อนุมัติราคา งาน หรือ Warranty อัตโนมัติจาก Model เพียงอย่างเดียว
- `J04-T05-05` เก็บ Human decision และ Feedback เพื่อประเมินคุณภาพ
- `J04-T05-06` Monitor Error/Bias/Drift ก่อนขยายการใช้

## J05 — Price Book, Estimate, Quote & Approval

### `[Choose · P0] J05-T01 — Service & Price Book`

- `J05-T01-01` สร้างบริการ ค่าแรง Part และ Fee
- `J05-T01-02` จัดหมวดหมู่และค้นหา
- `J05-T01-03` กำหนดราคาคงที่ ช่วงราคา หรือสูตร
- `J05-T01-04` กำหนดเวลามาตรฐานและ Skill requirement
- `J05-T01-05` กำหนดภาษีและต้นทุน
- `J05-T01-06` Version ราคาและ Effective date
- `J05-T01-07` จำกัดสิทธิ์แก้ราคา

### `[Choose · P0] J05-T02 — Estimate/Quotation Builder`

- `J05-T02-01` สร้าง Quote จาก Job/Inspection
- `J05-T02-02` เพิ่ม Labor, Part, Service และ Fee
- `J05-T02-03` แสดง Quantity, Unit price, Discount, Tax และ Total
- `J05-T02-04` เพิ่ม Scope, Exclusion, Terms และ Estimated timeline
- `J05-T02-05` บันทึก Draft และ Preview
- `J05-T02-06` ออกเลข Quote และส่งลูกค้า
- `J05-T02-07` Convert Quote ที่อนุมัติไป Job scope

### `[Choose · P1] J05-T03 — Good/Better/Best Options`

- `J05-T03-01` สร้างหลายทางเลือกใน Quote เดียว
- `J05-T03-02` ระบุความแตกต่าง ราคา และ Warranty
- `J05-T03-03` เลือกทางเลือกเดียวหรือหลายรายการตามกฎ
- `J05-T03-04` แสดงยอดตาม Selection
- `J05-T03-05` เก็บ Option ที่ลูกค้าเลือก
- `J05-T03-06` Convert เฉพาะ Scope ที่อนุมัติ

### `[Choose · P0] J05-T04 — Customer Quote Approval`

- `J05-T04-01` เปิด Quote ผ่าน Secure link/Portal
- `J05-T04-02` ดูรายละเอียดและเอกสาร
- `J05-T04-03` Approve, Reject หรือ Request changes
- `J05-T04-04` เลือก Option/Line item เมื่ออนุญาต
- `J05-T04-05` ลงลายมือชื่อหรือยืนยันตัวตน
- `J05-T04-06` แจ้งร้านทันทีเมื่อมีการตอบ
- `J05-T04-07` เก็บเวลา Version และหลักฐาน Approval

### `[Choose · P1] J05-T05 — Deposit & Approval Gate`

- `J05-T05-01` กำหนด Deposit ก่อนเริ่มงาน
- `J05-T05-02` คำนวณคงที่ เปอร์เซ็นต์ หรือจากรายการ
- `J05-T05-03` รับชำระพร้อม Approval
- `J05-T05-04` เปลี่ยนสถานะเมื่อ Approval และ Deposit ครบ
- `J05-T05-05` หมดอายุ Quote/Payment link ตามกฎ
- `J05-T05-06` แสดงเงื่อนไขคืน Deposit

### `[Choose · P1] J05-T06 — Quote Revision & Change Order`

- `J05-T06-01` สร้าง Revision โดยไม่เขียนทับ Version เดิม
- `J05-T06-02` แสดงรายการเพิ่ม ลด และผลต่างราคา
- `J05-T06-03` ส่งให้ลูกค้าอนุมัติใหม่
- `J05-T06-04` หยุดงานส่วนที่เกิน Scope จนอนุมัติ
- `J05-T06-05` เชื่อม Approved change ไป Job/Invoice
- `J05-T06-06` เก็บเหตุผลและผู้ร้องขอ

### `[Advanced · P2] J05-T07 — Cost, Margin & Approval Threshold`

- `J05-T07-01` คำนวณ Estimated labor/part cost
- `J05-T07-02` แสดง Gross margin ต่อ Quote
- `J05-T07-03` แจ้ง Margin ต่ำกว่า Threshold
- `J05-T07-04` ขอ Manager approval สำหรับ Discount/Price override
- `J05-T07-05` เปรียบเทียบ Estimated กับ Actual หลังจบงาน
- `J05-T07-06` จำกัด Cost visibility ตาม Role

## J06 — Scheduling, Dispatch & Route Planning

### `[Choose · P1] J06-T01 — Job Calendar & Schedule Board`

- `J06-T01-01` Day/Week/Agenda view
- `J06-T01-02` แสดง Job ตามเวลา Duration และ Status
- `J06-T01-03` Filter ตามทีม พนักงาน พื้นที่ และประเภทงาน
- `J06-T01-04` แสดง Unscheduled และ Unassigned jobs
- `J06-T01-05` ลากเพื่อเปลี่ยนวันเวลา/ผู้รับผิดชอบ
- `J06-T01-06` ตรวจ Conflict, Skill และ Capacity
- `J06-T01-07` แจ้งผู้เกี่ยวข้องเมื่อ Schedule เปลี่ยน

### `[Choose · P1] J06-T02 — Technician Dispatch`

- `J06-T02-01` Assign ทีม/Technician
- `J06-T02-02` แสดง Skill, Availability, Workload และพื้นที่
- `J06-T02-03` Dispatch งานพร้อมข้อมูลที่จำเป็น
- `J06-T02-04` Accept/Decline assignment พร้อมเหตุผล
- `J06-T02-05` Reassign และ Escalate
- `J06-T02-06` แสดง Acknowledgement status
- `J06-T02-07` เก็บ Dispatch history

### `[Choose · P1] J06-T03 — Capacity & Appointment Window`

- `J06-T03-01` กำหนด Time slot หรือ Arrival window
- `J06-T03-02` คำนวณ Duration จาก Price book/Job type
- `J06-T03-03` กำหนด Capacity ต่อทีม/สาขา
- `J06-T03-04` รวม Buffer และ Travel time
- `J06-T03-05` ป้องกัน Overbooking
- `J06-T03-06` เสนอ Slot ทางเลือก

### `[Choose · P1] J06-T04 — Map & Route View`

- `J06-T04-01` แสดง Job และ Technician บนแผนที่ตามสิทธิ์
- `J06-T04-02` แสดงลำดับการเยี่ยมงาน
- `J06-T04-03` คำนวณเวลาระหว่าง Site
- `J06-T04-04` เปลี่ยนลำดับ Manual
- `J06-T04-05` แสดง Late risk จากระยะทาง/ตาราง
- `J06-T04-06` ไม่เปิดเผยตำแหน่งนอกเวลาหรือเกินความจำเป็น

### `[Advanced · P2] J06-T05 — Route Optimization`

- `J06-T05-01` แนะนำลำดับงานหลายจุด
- `J06-T05-02` คำนึงถึง Appointment window, Priority, Skill และ Capacity
- `J06-T05-03` แสดงผลต่างระยะทาง/เวลา
- `J06-T05-04` ให้ Dispatcher ปรับและยืนยัน
- `J06-T05-05` Re-optimize เมื่อมีงานด่วนหรือยกเลิก
- `J06-T05-06` เก็บแผนเดิมและเหตุผลการเปลี่ยน

### `[Advanced · P2] J06-T06 — Emergency & Dynamic Dispatch`

- `J06-T06-01` สร้าง Emergency job
- `J06-T06-02` หา Technician ที่เหมาะและใกล้โดยคำนึงถึงงานเดิม
- `J06-T06-03` แสดงผลกระทบต่อ Schedule อื่น
- `J06-T06-04` ขออนุมัติย้ายงานเมื่อจำเป็น
- `J06-T06-05` แจ้งลูกค้าที่ได้รับผลกระทบ
- `J06-T06-06` วิเคราะห์ Emergency response time

## J07 — Technician Mobile & Field Execution

### `[Choose · P0] J07-T01 — My Jobs Workspace`

- `J07-T01-01` แสดงงานวันนี้และงานที่ได้รับมอบหมาย
- `J07-T01-02` แสดง Priority, เวลา, Site และ Contact ที่จำเป็น
- `J07-T01-03` เปิด Job detail, Scope, Asset และ History ตาม Permission
- `J07-T01-04` Accept งานและอัปเดตสถานะ
- `J07-T01-05` Filter งานค้าง/เสร็จ
- `J07-T01-06` ใช้งานบนมือถือแบบ Touch-friendly

### `[Choose · P1] J07-T02 — On My Way, Arrival & Geofence Evidence`

- `J07-T02-01` Mark On my way
- `J07-T02-02` ส่ง ETA/ข้อความให้ลูกค้า
- `J07-T02-03` Check-in เมื่อถึง Site
- `J07-T02-04` บันทึกเวลาและตำแหน่งเมื่อได้รับอนุญาต
- `J07-T02-05` แจ้งกรณีเข้า Site ไม่ได้
- `J07-T02-06` Check-out เมื่อออกจาก Site
- `J07-T02-07` จำกัดตำแหน่งตามวัตถุประสงค์และเวลางาน

### `[Choose · P1] J07-T03 — Mobile Work Form & Checklist`

- `J07-T03-01` แสดง Checklist ตาม Job type
- `J07-T03-02` บันทึก Text, Choice, Measurement และ Photo
- `J07-T03-03` บังคับ Required step ก่อน Complete
- `J07-T03-04` สร้าง Exception/Issue จาก Checklist
- `J07-T03-05` ลงชื่อผู้ทำและเวลา
- `J07-T03-06` Sync Draft เมื่อสัญญาณกลับมา

### `[Choose · P1] J07-T04 — Parts, Materials & Expense in Field`

- `J07-T04-01` เบิก Part/Material เข้างาน
- `J07-T04-02` Scan Barcode
- `J07-T04-03` เพิ่มรายการจาก Price book
- `J07-T04-04` บันทึกค่าใช้จ่ายและใบเสร็จ
- `J07-T04-05` ขออนุมัติค่าใช้จ่ายเกินวงเงิน
- `J07-T04-06` คืนวัสดุที่ไม่ใช้

### `[Choose · P1] J07-T05 — Field Estimate & Change Approval`

- `J07-T05-01` สร้างหรือแก้ Estimate หน้างาน
- `J07-T05-02` เพิ่ม Scope/Part ที่พบเพิ่มเติม
- `J07-T05-03` แสดงราคาและเงื่อนไขให้ลูกค้า
- `J07-T05-04` รับ Approval/Signature
- `J07-T05-05` รับ Deposit/Payment link เมื่อเปิดใช้
- `J07-T05-06` ห้ามเริ่ม Scope เพิ่มก่อน Approval ตาม Policy

### `[Choose · P1] J07-T06 — Completion Proof & Customer Signature`

- `J07-T06-01` ถ่ายภาพ/วิดีโอหลังงาน
- `J07-T06-02` แสดง Checklist และ Scope ที่เสร็จ
- `J07-T06-03` บันทึกข้อจำกัด/งานที่ยังเหลือ
- `J07-T06-04` ให้ลูกค้าตรวจรับและลงชื่อ
- `J07-T06-05` ส่งสำเนา Completion summary
- `J07-T06-06` ส่งไป Invoice/QC ตาม Workflow

### `[Advanced · P1] J07-T07 — Offline Field Mode`

- `J07-T07-01` Cache เฉพาะงานและข้อมูลที่ได้รับมอบหมาย
- `J07-T07-02` บันทึก Form, Note, Time และ Photo แบบ Offline
- `J07-T07-03` แสดงรายการรอ Sync
- `J07-T07-04` Sync ด้วย Idempotency
- `J07-T07-05` จัดการ Conflict อย่างโปร่งใส
- `J07-T07-06` ไม่อนุญาต Action เสี่ยงสูงแบบ Offline โดยไม่มีการออกแบบเฉพาะ

## J08 — Work Execution, Subtask, Time & Collaboration

### `[Core · P0] J08-T01 — Work Log & Internal Note`

- `J08-T01-01` บันทึกความคืบหน้า
- `J08-T01-02` แยก Internal note จาก Customer-visible update
- `J08-T01-03` แนบไฟล์/ภาพ
- `J08-T01-04` Mention ผู้ร่วมงาน
- `J08-T01-05` แสดง Timeline ตามเวลา
- `J08-T01-06` จำกัดการแก้ไข Note หลังระยะเวลาที่กำหนด

### `[Choose · P1] J08-T02 — Subtask & Checklist Execution`

- `J08-T02-01` สร้าง Subtask จาก Template
- `J08-T02-02` Assign คนหรือทีม
- `J08-T02-03` กำหนด Due time และ Dependency
- `J08-T02-04` Start/Pause/Complete
- `J08-T02-05` แนบหลักฐาน
- `J08-T02-06` ป้องกันปิด Job ก่อน Required subtask ครบ

### `[Choose · P1] J08-T03 — Labor Time Tracking`

- `J08-T03-01` Start/Stop timer ต่อ Job/Subtask
- `J08-T03-02` บันทึกเวลา Manual พร้อมเหตุผล
- `J08-T03-03` แยก Work, Travel, Wait และ Break
- `J08-T03-04` ป้องกัน Timer ซ้อนที่ผิดกฎ
- `J08-T03-05` อนุมัติ Timesheet
- `J08-T03-06` เชื่อม Actual labor cost

### `[Choose · P1] J08-T04 — Team Collaboration & Handover`

- `J08-T04-01` เพิ่มผู้ร่วมงานหลายคน
- `J08-T04-02` Handover ความรับผิดชอบพร้อมสรุป
- `J08-T04-03` ขอความช่วยเหลือหรือ Supervisor review
- `J08-T04-04` แสดง Pending decision
- `J08-T04-05` เก็บผู้รับมอบและเวลา
- `J08-T04-06` แจ้งทุกคนเมื่อ Scope/Status เปลี่ยน

### `[Choose · P2] J08-T05 — External Contractor/Subcontractor`

- `J08-T05-01` สร้าง Subcontract work order
- `J08-T05-02` กำหนด Scope, Cost และ Due date
- `J08-T05-03` แชร์เฉพาะข้อมูลที่จำเป็น
- `J08-T05-04` รับ Status และเอกสารกลับ
- `J08-T05-05` ตรวจรับและอนุมัติค่าใช้จ่าย
- `J08-T05-06` ไม่ให้ Subcontractor เห็น Margin/Customer data เกินสิทธิ์

## J09 — Parts, Inventory, Purchasing & Tools

### `[Choose · P1] J09-T01 — Part & Material Catalog`

- `J09-T01-01` สร้าง Part, Material และ Consumable
- `J09-T01-02` กำหนด SKU, Barcode, Serial/Lot และ Compatibility
- `J09-T01-03` กำหนด Cost, Price และ Tax
- `J09-T01-04` กำหนด Supplier และ Reorder point
- `J09-T01-05` กำหนด Substitute part
- `J09-T01-06` เปิด ปิด หรือ Archive

### `[Choose · P1] J09-T02 — Stock Location & Movement`

- `J09-T02-01` สร้าง Warehouse, Branch, Van และ Bin
- `J09-T02-02` รับเข้า โอน เบิก คืน และปรับยอด
- `J09-T02-03` แสดง On-hand, Reserved, Available และ In transit
- `J09-T02-04` Scan Barcode
- `J09-T02-05` เก็บ Reference, ผู้ทำ และเหตุผล
- `J09-T02-06` ป้องกัน Movement ซ้ำ

### `[Choose · P1] J09-T03 — Parts Reservation & Job Usage`

- `J09-T03-01` Reserve Part ให้ Quote/Job
- `J09-T03-02` Issue Part ตอนเริ่มใช้
- `J09-T03-03` บันทึก Quantity, Serial และ Technician
- `J09-T03-04` คืน Part ที่ไม่ได้ใช้
- `J09-T03-05` เปลี่ยน Substitute พร้อม Approval
- `J09-T03-06` เชื่อม Actual part cost และ Warranty

### `[Choose · P1] J09-T04 — Purchase Request & Order`

- `J09-T04-01` สร้าง Purchase request จาก Low stock/Job
- `J09-T04-02` อนุมัติและเลือก Supplier
- `J09-T04-03` สร้าง Purchase order
- `J09-T04-04` รับบางส่วนหรือทั้งหมด
- `J09-T04-05` เชื่อม Part ที่รับกับ Job reservation
- `J09-T04-06` บันทึกราคาและ Lead time variance

### `[Choose · P2] J09-T05 — Special Order & Backorder`

- `J09-T05-01` สั่ง Part เฉพาะ Job
- `J09-T05-02` เก็บ Deposit จากลูกค้าเมื่อ Policy กำหนด
- `J09-T05-03` แสดง Ordered, Shipped, Received และ Allocated
- `J09-T05-04` อัปเดต ETA ให้ Job/Customer
- `J09-T05-05` จัดการ Supplier delay หรือ Part unavailable
- `J09-T05-06` คืน/ยกเลิกตามเงื่อนไข

### `[Advanced · P2] J09-T06 — Serial, Lot & Warranty Claim`

- `J09-T06-01` Track Serial/Lot ตั้งแต่รับถึงใช้งาน
- `J09-T06-02` เชื่อม Serial กับ Asset และ Job
- `J09-T06-03` บันทึก Supplier warranty
- `J09-T06-04` สร้าง Warranty claim
- `J09-T06-05` Track Return/Replacement/Credit
- `J09-T06-06` Trace ประวัติ Part ทั้งหมด

### `[Advanced · P2] J09-T07 — Tool & Equipment Checkout`

- `J09-T07-01` สร้าง Tool/Equipment asset
- `J09-T07-02` Checkout ให้ Technician/Job
- `J09-T07-03` คืนและตรวจสภาพ
- `J09-T07-04` แจ้ง Overdue/Missing
- `J09-T07-05` Block เมื่อ Maintenance/Calibration หมดอายุ
- `J09-T07-06` แสดง Utilization และ Loss history

## J10 — Quality Control, Rework & Exception

### `[Choose · P1] J10-T01 — Quality Check Template`

- `J10-T01-01` สร้าง QC checklist ตาม Job type
- `J10-T01-02` กำหนด Required test และ Acceptance criteria
- `J10-T01-03` Assign QC ผู้ที่เหมาะสม
- `J10-T01-04` บันทึก Pass/Fail/Conditional pass
- `J10-T01-05` แนบ Measurement และ Evidence
- `J10-T01-06` Lock ผลเมื่อ Approved

### `[Choose · P1] J10-T02 — Final Inspection & Release Gate`

- `J10-T02-01` ส่ง Job เข้า QC
- `J10-T02-02` ตรวจ Scope, Part, Time และ Evidence
- `J10-T02-03` Approve Ready for handover
- `J10-T02-04` Reject กลับไป Rework
- `J10-T02-05` บังคับ QC ก่อนส่งมอบตาม Job type
- `J10-T02-06` บันทึกผู้ตรวจและเวลา

### `[Choose · P1] J10-T03 — Rework Management`

- `J10-T03-01` สร้าง Rework task/ticket จาก QC หรือ Complaint
- `J10-T03-02` ระบุสาเหตุและผู้รับผิดชอบ
- `J10-T03-03` แยก Cost/Labor ของ Rework
- `J10-T03-04` กำหนด Priority และ Due time
- `J10-T03-05` QC ซ้ำก่อน Release
- `J10-T03-06` เชื่อมกับ Job เดิมโดยไม่แก้ประวัติ

### `[Choose · P2] J10-T04 — Non-conformance & Root Cause`

- `J10-T04-01` จัดประเภท Defect/Failure
- `J10-T04-02` บันทึก Containment action
- `J10-T04-03` วิเคราะห์ Root cause
- `J10-T04-04` สร้าง Corrective action
- `J10-T04-05` Assign และติดตาม Due date
- `J10-T04-06` Verify effectiveness

### `[Advanced · P2] J10-T05 — Quality Analytics`

- `J10-T05-01` First-pass yield
- `J10-T05-02` QC fail และ Rework rate
- `J10-T05-03` Defect ตาม Job type, Part, Supplier และทีม
- `J10-T05-04` Cost of poor quality
- `J10-T05-05` Repeat failure ภายใน Warranty
- `J10-T05-06` Trend และ Corrective action effectiveness

## J11 — Customer Portal, Tracking & Communication

### `[Choose · P0] J11-T01 — Secure Customer Portal/Tracking Link`

- `J11-T01-01` เปิดดู Job ด้วย Secure link หรือ Account
- `J11-T01-02` แสดงเลขงาน Asset และสถานะที่ลูกค้าเข้าใจ
- `J11-T01-03` แสดง Timeline และ ETA ที่เผยแพร่ได้
- `J11-T01-04` แสดง Quote, Appointment, Invoice และเอกสารที่อนุญาต
- `J11-T01-05` ป้องกันเข้าถึง Job ของผู้อื่น
- `J11-T01-06` หมดอายุ/Revoke link เมื่อจำเป็น

### `[Choose · P1] J11-T02 — Status Notification`

- `J11-T02-01` แจ้งรับงาน
- `J11-T02-02` แจ้งรอข้อมูล/อนุมัติ/Part
- `J11-T02-03` แจ้งเริ่มงานและ Delay
- `J11-T02-04` แจ้งพร้อมรับ/ส่งมอบ
- `J11-T02-05` แจ้ง Completed และ Warranty
- `J11-T02-06` เก็บ Delivery status และ Preference

### `[Choose · P1] J11-T03 — Quote, Change & Payment Action Center`

- `J11-T03-01` ดูและอนุมัติ Quote
- `J11-T03-02` ขอแก้ไขหรือถามคำถาม
- `J11-T03-03` อนุมัติ Change order
- `J11-T03-04` ชำระ Deposit/Invoice
- `J11-T03-05` ดาวน์โหลดเอกสาร
- `J11-T03-06` แสดง Action ที่ค้างและ Deadline

### `[Choose · P1] J11-T04 — Two-way Job Communication`

- `J11-T04-01` ส่งข้อความผูกกับ Job
- `J11-T04-02` แนบรูปหรือเอกสาร
- `J11-T04-03` แยก Internal note จาก Customer conversation
- `J11-T04-04` Assign พนักงานผู้ตอบ
- `J11-T04-05` ใช้ Template และ Business hours
- `J11-T04-06` เก็บประวัติและ Read status

### `[Choose · P2] J11-T05 — Customer Self-service History`

- `J11-T05-01` ดู Request/Job เก่า
- `J11-T05-02` ดู Quote, Invoice, Payment และ Warranty
- `J11-T05-03` สร้าง Repeat request จาก Asset เดิม
- `J11-T05-04` จัดการ Appointment
- `J11-T05-05` อัปเดต Contact/Site ตาม Permission
- `J11-T05-06` ดาวน์โหลด Service history ที่อนุญาต

## J12 — Pickup, Delivery, Handover & Acceptance

### `[Choose · P1] J12-T01 — Ready for Pickup & Appointment`

- `J12-T01-01` Mark Ready for pickup
- `J12-T01-02` แจ้งลูกค้าพร้อมยอดคงเหลือและสิ่งที่ต้องนำมา
- `J12-T01-03` ให้เลือกเวลารับ
- `J12-T01-04` แสดง Pickup queue
- `J12-T01-05` แจ้งเตือนงานที่ค้างรับ
- `J12-T01-06` กำหนด Storage/Unclaimed policy

### `[Choose · P1] J12-T02 — Outbound Delivery`

- `J12-T02-01` สร้าง Delivery task
- `J12-T02-02` เลือกที่อยู่และช่วงเวลา
- `J12-T02-03` Assign ผู้ส่งหรือ Carrier
- `J12-T02-04` บันทึก Tracking number
- `J12-T02-05` แสดง Out for delivery/Delivered/Failed
- `J12-T02-06` Reattempt หรือ Return to branch

### `[Core · P1] J12-T03 — Handover Checklist`

- `J12-T03-01` ตรวจ Asset/Item และ Accessories
- `J12-T03-02` แสดง Scope ที่เสร็จและงานที่ไม่รวม
- `J12-T03-03` แสดงการทดสอบ/QC ที่เผยแพร่ได้
- `J12-T03-04` ส่งคำแนะนำการใช้งานหรือดูแล
- `J12-T03-05` ตรวจยอดชำระก่อนส่งมอบตาม Policy
- `J12-T03-06` บันทึกผู้ส่งมอบและผู้รับ

### `[Choose · P1] J12-T04 — Customer Acceptance & Proof of Delivery`

- `J12-T04-01` ให้ลูกค้าตรวจรับ
- `J12-T04-02` ลงลายมือชื่อ
- `J12-T04-03` ถ่ายภาพ Proof of delivery
- `J12-T04-04` บันทึกวันเวลาและสถานที่เมื่อเหมาะสม
- `J12-T04-05` ระบุข้อสงวน/ปัญหาที่พบตอนรับ
- `J12-T04-06` ส่งสำเนา Completion/Handover document

### `[Choose · P2] J12-T05 — Unclaimed Item & Storage Control`

- `J12-T05-01` กำหนดวันเริ่มค้างรับ
- `J12-T05-02` ส่ง Reminder ตามลำดับ
- `J12-T05-03` คำนวณ Storage fee เมื่อ Policy ระบุ
- `J12-T05-04` Escalate งานค้างนาน
- `J12-T05-05` บันทึกการติดต่อ
- `J12-T05-06` ไม่ดำเนินการกับทรัพย์สินนอกเหนือ Policy/กฎหมายที่ตรวจสอบแล้ว

## J13 — Invoice, Payment, Credit & Job Profitability

### `[Choose · P0] J13-T01 — Invoice Generation`

- `J13-T01-01` สร้าง Invoice จาก Quote/Actual job
- `J13-T01-02` แสดง Labor, Part, Service, Fee, Discount และ Tax
- `J13-T01-03` หัก Deposit และ Credit
- `J13-T01-04` ออกเลขและ Due date
- `J13-T01-05` ส่งหรือดาวน์โหลดเอกสาร
- `J13-T01-06` Lock Snapshot เมื่อออกแล้ว
- `J13-T01-07` Void/Replace ด้วย Version ที่ตรวจสอบได้

### `[Choose · P0] J13-T02 — Payment Collection`

- `J13-T02-01` รับ Cash, QR, Card, Transfer และ Payment link
- `J13-T02-02` เชื่อม Payment กับ Invoice/Job
- `J13-T02-03` แสดง Paid, Partial, Outstanding, Failed และ Refunded
- `J13-T02-04` ออก Receipt
- `J13-T02-05` Reconcile Payment provider
- `J13-T02-06` ป้องกัน Double payment

### `[Choose · P1] J13-T03 — Deposit, Milestone & Progress Billing`

- `J13-T03-01` รับ Deposit ก่อนเริ่มงาน
- `J13-T03-02` สร้าง Payment schedule ตาม Milestone
- `J13-T03-03` ออก Invoice ตามเปอร์เซ็นต์หรือขอบเขตงาน
- `J13-T03-04` แสดง Billed, Paid และ Remaining contract value
- `J13-T03-05` Gate งานบางขั้นตาม Payment policy
- `J13-T03-06` ปรับ Schedule ด้วย Approval

### `[Choose · P1] J13-T04 — Customer Credit & Accounts Receivable`

- `J13-T04-01` กำหนด Credit term และ Limit
- `J13-T04-02` ขออนุมัติก่อนขายเชื่อ
- `J13-T04-03` แสดง Aging และ Overdue
- `J13-T04-04` ส่ง Payment reminder
- `J13-T04-05` บันทึก Collection note
- `J13-T04-06` Hold งานใหม่เมื่อเกิน Policy
- `J13-T04-07` รองรับ Business account หลาย Site

### `[Choose · P1] J13-T05 — Refund, Credit Note & Adjustment`

- `J13-T05-01` Refund เต็มหรือบางส่วน
- `J13-T05-02` ออก Credit note/Adjustment
- `J13-T05-03` ระบุเหตุผลและขออนุมัติ
- `J13-T05-04` เชื่อมกับ Part return, Warranty หรือ Scope change
- `J13-T05-05` Reverse Commission/Revenue อย่างถูกต้อง
- `J13-T05-06` ป้องกันคืนเกินยอดรับจริง

### `[Choose · P1] J13-T06 — Actual Job Costing & Profitability`

- `J13-T06-01` รวม Actual labor time/cost
- `J13-T06-02` รวม Part, Material, Travel และ Subcontract cost
- `J13-T06-03` เปรียบเทียบ Estimate กับ Actual
- `J13-T06-04` คำนวณ Revenue, Gross profit และ Margin
- `J13-T06-05` วิเคราะห์ Variance
- `J13-T06-06` จำกัด Cost/Margin visibility

### `[Advanced · P2] J13-T07 — Financing & Payment Plan Integration`

- `J13-T07-01` เสนอ Payment plan จาก Provider ภายนอก
- `J13-T07-02` แสดงเงื่อนไขของ Provider อย่างชัดเจน
- `J13-T07-03` รับ Approval status โดยไม่ตัดสินสินเชื่อเอง
- `J13-T07-04` เชื่อม Payout กับ Invoice
- `J13-T07-05` Reconcile Fee/Settlement
- `J13-T07-06` จัดการ Cancellation/Refund ตาม Contract ของ Provider

## J14 — Warranty, Maintenance & Service Contract

### `[Choose · P1] J14-T01 — Job & Part Warranty`

- `J14-T01-01` กำหนด Warranty ตามบริการ/Part
- `J14-T01-02` บันทึกวันเริ่ม สิ้นสุด และเงื่อนไข
- `J14-T01-03` แสดง Warranty ใน Handover document/Portal
- `J14-T01-04` เชื่อม Warranty กับ Asset, Job และ Serial
- `J14-T01-05` ตรวจ Eligibility เบื้องต้น
- `J14-T01-06` แจ้งข้อยกเว้นอย่างชัดเจน

### `[Choose · P1] J14-T02 — Warranty Claim Workflow`

- `J14-T02-01` สร้าง Claim จากงานเดิม
- `J14-T02-02` บันทึกอาการ หลักฐาน และวันที่
- `J14-T02-03` Inspect และตัดสิน Covered/Not covered โดยผู้มีสิทธิ์
- `J14-T02-04` สร้าง Warranty job/Rework
- `J14-T02-05` แยก Labor/Part cost ที่เรียกคืน Supplier ได้
- `J14-T02-06` เก็บ Outcome และเหตุผล

### `[Choose · P1] J14-T03 — Preventive Maintenance Schedule`

- `J14-T03-01` สร้าง Maintenance plan ตามเวลา Meter หรือ Usage
- `J14-T03-02` กำหนด Task/Checklist/Part
- `J14-T03-03` แจ้งเตือนก่อนถึงรอบ
- `J14-T03-04` สร้าง Request/Job จากรอบ
- `J14-T03-05` Reschedule และบันทึก Missed maintenance
- `J14-T03-06` แสดงประวัติ Compliance

### `[Choose · P2] J14-T04 — Service Contract & Recurring Work`

- `J14-T04-01` สร้าง Contract พร้อม Site/Asset/Scope
- `J14-T04-02` กำหนดรอบงานและ SLA
- `J14-T04-03` กำหนดราคาคงที่/รายครั้ง/ตาม Usage
- `J14-T04-04` สร้าง Recurring jobs
- `J14-T04-05` ติดตาม Entitlement และงานที่ใช้ไป
- `J14-T04-06` ต่ออายุ Pause และ Cancel Contract

### `[Advanced · P2] J14-T05 — Asset Health & Maintenance Intelligence`

- `J14-T05-01` รวม Failure และ Maintenance history
- `J14-T05-02` แสดง Repeat issue และ Downtime
- `J14-T05-03` Forecast รอบจาก Usage เมื่อข้อมูลเพียงพอ
- `J14-T05-04` แนะนำ Inspect/Replace พร้อมเหตุผล
- `J14-T05-05` ให้ผู้เชี่ยวชาญยืนยันก่อนสร้างงานหรือเปลี่ยนแผน
- `J14-T05-06` วัด False alert และผลของคำแนะนำ

## J15 — CRM, Sales, Feedback & Repeat Business

### `[Choose · P1] J15-T01 — Customer 360 & Communication Timeline`

- `J15-T01-01` รวม Request, Quote, Job, Invoice และ Payment
- `J15-T01-02` แสดง Asset/Site ทั้งหมด
- `J15-T01-03` แสดง Message, Call note และ Follow-up
- `J15-T01-04` แสดง Warranty/Contract
- `J15-T01-05` เพิ่ม Tag, Owner และ Internal note
- `J15-T01-06` จำกัด Financial/Cost data ตาม Role

### `[Choose · P1] J15-T02 — Follow-up & Task Automation`

- `J15-T02-01` สร้าง Follow-up จาก Quote ที่ยังไม่ตอบ
- `J15-T02-02` ติดตาม Invoice ค้าง
- `J15-T02-03` ติดตามหลังส่งมอบ
- `J15-T02-04` Assign เจ้าของและ Due date
- `J15-T02-05` ใช้ Template message ตาม Consent
- `J15-T02-06` ปิด Task พร้อม Outcome

### `[Choose · P1] J15-T03 — Feedback, Complaint & Service Recovery`

- `J15-T03-01` ขอ Rating หลัง Completed job
- `J15-T03-02` รับ Complaint ผูกกับ Job/Asset
- `J15-T03-03` จัดประเภท Severity และ Owner
- `J15-T03-04` สร้าง Recovery/Rework task
- `J15-T03-05` ติดตาม Response/Resolution time
- `J15-T03-06` ขอ Review สาธารณะโดยไม่บิดเบือน

### `[Choose · P2] J15-T04 — Campaign, Reminder & Repeat Job`

- `J15-T04-01` แบ่งกลุ่มตาม Asset, Service และรอบเวลา
- `J15-T04-02` ส่ง Maintenance/Inspection reminder
- `J15-T04-03` สร้าง Repeat request ด้วยข้อมูลเดิม
- `J15-T04-04` ส่ง Campaign ตาม Consent
- `J15-T04-05` จำกัด Frequency
- `J15-T04-06` วัด Conversion และ Revenue attribution

### `[Advanced · P2] J15-T05 — B2B Account & Opportunity Management`

- `J15-T05-01` จัดการ Company, Contact และ Site หลายแห่ง
- `J15-T05-02` สร้าง Opportunity/Pipeline
- `J15-T05-03` กำหนด Account owner และ Credit term
- `J15-T05-04` เชื่อม Quote/Contract หลายงาน
- `J15-T05-05` แสดง Revenue, Outstanding และ Service performance
- `J15-T05-06` จัดการ PO reference และ Billing contact

## J16 — Dashboard, Reporting & Operational Intelligence

### `[Core · P1] J16-T01 — Operations Command Center`

- `J16-T01-01` งานใหม่ รอตรวจ รออนุมัติ รอ Part กำลังทำ และพร้อมส่ง
- `J16-T01-02` งาน Unassigned, Near due และ Overdue
- `J16-T01-03` Technician workload
- `J16-T01-04` QC/Rework alert
- `J16-T01-05` ยอด Invoice, Payment และ Outstanding
- `J16-T01-06` Action queue ที่ต้องตัดสินใจ

### `[Choose · P1] J16-T02 — Job Flow & Turnaround Analytics`

- `J16-T02-01` Lead-to-job conversion
- `J16-T02-02` Intake-to-inspection time
- `J16-T02-03` Quote approval time
- `J16-T02-04` Waiting part/approval duration
- `J16-T02-05` Active work และ Total turnaround time
- `J16-T02-06` SLA attainment และ Bottleneck

### `[Choose · P1] J16-T03 — Revenue, Cost & Profitability Analytics`

- `J16-T03-01` Revenue ตาม Job type, Branch, Technician และ Customer
- `J16-T03-02` Labor/Part/Subcontract cost
- `J16-T03-03` Gross profit และ Margin
- `J16-T03-04` Estimate-to-actual variance
- `J16-T03-05` Discount, Refund และ Write-off
- `J16-T03-06` Accounts receivable aging

### `[Choose · P1] J16-T04 — Workforce & Utilization Analytics`

- `J16-T04-01` Scheduled vs Productive hours
- `J16-T04-02` Travel, Wait และ Rework time
- `J16-T04-03` Jobs completed และ First-time completion
- `J16-T04-04` Skill/Workload distribution
- `J16-T04-05` Overtime และ Capacity gap
- `J16-T04-06` ใช้ Metric ร่วมกับบริบทคุณภาพและความซับซ้อนของงาน

### `[Choose · P1] J16-T05 — Inventory & Supplier Analytics`

- `J16-T05-01` Stock value และ Turnover
- `J16-T05-02` Low stock/Backorder
- `J16-T05-03` Part usage และ Margin
- `J16-T05-04` Supplier price/lead-time variance
- `J16-T05-05` Warranty claim และ Failure rate
- `J16-T05-06` Dead/Slow-moving stock

### `[Advanced · P2] J16-T06 — Forecast & Recommendation`

- `J16-T06-01` Forecast Job volume ตามประเภท/พื้นที่
- `J16-T06-02` Forecast Technician capacity
- `J16-T06-03` Forecast Part demand
- `J16-T06-04` แนะนำ Schedule, Reorder หรือ Maintenance
- `J16-T06-05` แสดง Confidence และข้อจำกัด
- `J16-T06-06` ให้ผู้จัดการยืนยันและวัดผลคำแนะนำ

## J17 — Workforce, Permission & Safety

### `[Choose · P1] J17-T01 — Staff, Technician & Skill Directory`

- `J17-T01-01` สร้างพนักงาน ทีม และ Supervisor
- `J17-T01-02` กำหนด Skill, Service type และพื้นที่
- `J17-T01-03` กำหนดสาขาและเวลาทำงาน
- `J17-T01-04` กำหนด Role/Permission
- `J17-T01-05` เก็บ Certification/Expiry เมื่อจำเป็น
- `J17-T01-06` เปิด ระงับ และ Archive

### `[Choose · P1] J17-T02 — Shift, Attendance & Timesheet Approval`

- `J17-T02-01` สร้างกะและตาราง
- `J17-T02-02` Clock in/out และ Break
- `J17-T02-03` เชื่อม Job time กับ Timesheet
- `J17-T02-04` ขอแก้เวลา
- `J17-T02-05` Supervisor approve
- `J17-T02-06` Export Payroll

### `[Choose · P1] J17-T03 — Technician Commission & Incentive`

- `J17-T03-01` กำหนด Commission ตาม Labor, Part, Margin หรือ Job type
- `J17-T03-02` รองรับหลาย Technician
- `J17-T03-03` Hold Commission จน Payment/Return period ตาม Policy
- `J17-T03-04` Reverse เมื่อ Refund/Rework
- `J17-T03-05` แสดง Breakdown
- `J17-T03-06` อนุมัติและ Export

### `[Choose · P1] J17-T04 — Safety Checklist & Incident`

- `J17-T04-01` Pre-work safety checklist
- `J17-T04-02` บันทึก PPE/Permit requirement
- `J17-T04-03` Stop-work authority
- `J17-T04-04` รายงาน Incident/Near miss
- `J17-T04-05` Escalate และเก็บ Evidence
- `J17-T04-06` สร้าง Corrective action

### `[Advanced · P2] J17-T05 — Location, Privacy & Lone-worker Control`

- `J17-T05-01` แชร์ตำแหน่งเฉพาะระหว่างงานและตาม Consent/Policy
- `J17-T05-02` Check-in ความปลอดภัยตามเวลา
- `J17-T05-03` SOS/Escalation workflow
- `J17-T05-04` จำกัดผู้ดูตำแหน่งและ Retention
- `J17-T05-05` แจ้งพนักงานอย่างโปร่งใสว่าเก็บอะไรและเมื่อใด
- `J17-T05-06` ปิดการติดตามเมื่อจบกะ/งาน

## J18 — JobFlow Administration, Multi-branch & Integration

### `[Core · P0] J18-T01 — Job Type & Workflow Configuration`

- `J18-T01-01` สร้าง Job type และ Status flow
- `J18-T01-02` กำหนด Required field, Checklist และ Gate
- `J18-T01-03` กำหนด SLA, Priority และ Assignment rule
- `J18-T01-04` กำหนด Quote, Payment, QC และ Handover policy
- `J18-T01-05` กำหนดเลข Job/Quote/Invoice
- `J18-T01-06` Version และ Preview ก่อน Publish

### `[Choose · P1] J18-T02 — Template Administration`

- `J18-T02-01` Request form template
- `J18-T02-02` Inspection/Diagnostic checklist
- `J18-T02-03` Quote/Document template
- `J18-T02-04` Work/QC/Handover checklist
- `J18-T02-05` Notification template
- `J18-T02-06` Clone, Version และ Retire template

### `[Advanced · P2] J18-T03 — Accounting, Payment & Supplier Integration`

- `J18-T03-01` เชื่อม Payment provider
- `J18-T03-02` Export Invoice, Payment, Tax และ Cost
- `J18-T03-03` Mapping Customer, Product/Service และ Account
- `J18-T03-04` Sync Supplier/PO เมื่อเหมาะสม
- `J18-T03-05` Reconcile Settlement
- `J18-T03-06` Error queue และ Retry

### `[Advanced · P2] J18-T04 — Fleet, Telematics & Mapping Integration`

- `J18-T04-01` เชื่อม Vehicle/Technician location provider
- `J18-T04-02` รับ ETA, Mileage หรือ Vehicle status
- `J18-T04-03` จำกัดข้อมูลตามวัตถุประสงค์
- `J18-T04-04` แสดง Provider delay/error
- `J18-T04-05` ไม่ใช้ข้อมูลตำแหน่งนอก Policy
- `J18-T04-06` Disconnect และลบ Token อย่างปลอดภัย

### `[Advanced · P3] J18-T05 — Multi-branch, Warehouse & Territory`

- `J18-T05-01` จัดกลุ่มสาขา Warehouse และ Service territory
- `J18-T05-02` Routing Request ตามพื้นที่/Capacity
- `J18-T05-03` โอน Job/Part ระหว่างสาขา
- `J18-T05-04` กำหนด Price book และ Workflow กลาง/เฉพาะสาขา
- `J18-T05-05` Shared customer/asset history ตาม Data boundary
- `J18-T05-06` Consolidated reporting

### `[Advanced · P3] J18-T06 — API, Webhook & Partner Ecosystem`

- `J18-T06-01` API สำหรับ Request, Job, Status, Quote และ Invoice
- `J18-T06-02` Webhook ตาม Event
- `J18-T06-03` Scope credential ต่อ Partner
- `J18-T06-04` Mapping external ID
- `J18-T06-05` Idempotency, Retry และ Replay
- `J18-T06-06` Monitoring และ Audit

---

# 8. JobFlow Recommended Feature Bundles

## 8.1 JobFlow Starter

**เหมาะกับ:** ธุรกิจที่ต้องการเลิกใช้กระดาษ/แชตกระจัดกระจาย และเริ่มติดตามงานกับลูกค้า

- `J01-T01, T03, T05` Request, Counter intake และ Triage
- `J02-T01–T02` Customer/Asset
- `J03-T01, T03–T05` Job ticket, Status และ Exception
- `J08-T01` Work log
- `J11-T01–T02` Tracking portal และ Notification
- `J12-T03` Handover checklist
- `J15-T01–T03` Customer timeline, Follow-up และ Feedback
- `J16-T01` Operations command center

**ไม่ควรบังคับ:** Quote, Inventory, Dispatch, Payment และ Advanced QC หากธุรกิจยังไม่ต้องใช้

## 8.2 JobFlow Repair

**เหมาะกับ:** ร้านซ่อมโทรศัพท์ คอมพิวเตอร์ เครื่องใช้ไฟฟ้า และงานรับ Item เข้าร้าน

- JobFlow Starter topics
- `J02-T04` Accessories & custody
- `J03-T02` QR/Barcode tag
- `J04-T01–T04` Condition, Diagnostics, Evidence และ Acknowledgement
- `J05-T01–T06` Price book, Quote, Approval, Deposit และ Revision
- `J07-T01, T03–T06` Technician work, Checklist, Part, Change และ Completion proof
- `J09-T01–T03, T06` Parts, Stock, Usage และ Serial/Warranty
- `J10-T01–T03` QC และ Rework
- `J13-T01–T06` Invoice, Payment และ Job costing
- `J14-T01–T02` Warranty/Claim

**ตัวเลือกแนะนำ:** Mail-in, Pickup/Delivery, Customer portal history และ B2B account

## 8.3 JobFlow Workshop

**เหมาะกับ:** อู่รถ ศูนย์บริการ โรงซ่อม หรือ Workshop ที่มีช่องงาน ช่าง อะไหล่ Supplier และ QC

- JobFlow Repair topics ที่เกี่ยวข้อง
- `J02-T05` Asset/component hierarchy เมื่อจำเป็น
- `J06-T01–T03` Scheduling, Dispatch และ Capacity
- `J08-T02–T04` Subtask, Time และ Handover
- `J09-T01–T07` Parts, Warehouse, Procurement, Backorder, Serial และ Tools
- `J10-T01–T05` Full QC/Rework analytics
- `J14-T01–T05` Warranty/Maintenance/Contract
- `J16-T02–T05` Flow, Profit, Workforce และ Inventory analytics
- `J17-T01–T04` Workforce, Commission และ Safety

**Dependency สำคัญ:** Profit per job ต้องมี Actual labor + Part usage + Other cost + Invoice/payment ที่เชื่อม Reference เดียวกัน

## 8.4 JobFlow Field Service

**เหมาะกับ:** ช่างนอกสถานที่ บำรุงรักษา ติดตั้ง ตรวจสอบ และบริการหลาย Site

- `J01-T01–T02, T05` Request/Booking/Triage
- `J02-T01–T03` Customer, Asset และ Site
- `J03` Job control
- `J05` Price book/Estimate/Approval
- `J06-T01–T06` Schedule, Dispatch, Map และ Route
- `J07-T01–T07` Mobile execution, Location, Forms, Parts, Approval, Proof และ Offline
- `J08-T01–T05` Work, Time, Collaboration และ Subcontractor
- `J11–J14` Portal, Handover, Payment และ Maintenance
- `J17-T04–T05` Safety และ Lone-worker control

**ตัวเลือกแนะนำ:** Contract/Recurring work, Van stock, Route optimization และ Telematics integration

## 8.5 JobFlow Full Operation

**เหมาะกับ:** ธุรกิจบริการที่ต้องการ Workflow ครบตั้งแต่ Lead ถึง Contract, Multi-branch และ Profitability

- `J01–J18` เฉพาะ P0/P1 ที่ตรงกับ Operating model
- เพิ่ม P2/P3 ตามความพร้อมด้านข้อมูล ทีม และ Integration
- เปิด Repair-centric topics เมื่อรับ Item เข้าร้าน
- เปิด Field-centric topics เมื่อมี Dispatch/Site
- เปิด Contract/Maintenance เมื่อมีรายได้ประจำ

**หลักสำคัญ:** Full Operation ไม่ควรบังคับทั้ง Repair shop และ Field service ในร้านเดียว หากร้านไม่มีทั้งสอง Operating model

---

# 9. Cross-product Shared Engines

เพื่อไม่ให้ FLOW กลายเป็นสามระบบที่แยกกัน ควรพัฒนา Engine กลางและให้แต่ละ Product กำหนด Configuration/Terminology ของตน

| Shared Engine | FoodFlow | CareFlow | JobFlow |
|---|---|---|---|
| Public Entry | Store/Menu link | Service/Booking link | Request/Tracking link |
| Workflow | Order | Appointment/Visit | Request/Job |
| Queue | Order/Table/Pickup | Walk-in/Service | Intake/Work backlog |
| Assignment | Waiter/Kitchen station | Staff/Room | Technician/Team/Workstation |
| Resource | Table/Station | Room/Chair/Equipment | Bay/Tool/Vehicle |
| Catalog | Menu/Modifier | Service/Add-on | Price book/Part |
| Payment Ledger | Order/Bill | Visit/Package | Quote/Invoice/Job |
| Customer | Diner/Member | Client | Customer/Account |
| Notification | Order/Ready | Booking/Reminder | Status/Approval/ETA |
| Evidence | Slip/Receipt | Form/Consent/Media | Inspection/Completion |
| Analytics | Sales/Kitchen | Booking/Utilization | Flow/Cost/Profit |

## 9.1 สิ่งที่ควรใช้โครงข้อมูลร่วมกัน

- Business, Branch, User, Role และ Permission
- Customer identity, Contact และ Consent preference
- Status event, Assignment, Checklist, Comment และ Attachment
- Payment attempt, Transaction, Refund และ Receipt reference
- Notification event, Template, Delivery status และ Preference
- Audit log, Export job, Integration credential และ Webhook delivery

## 9.2 สิ่งที่ไม่ควรบังคับให้เหมือนกันทั้งหมด

- Lifecycle: Order, Appointment และ Job มี Transition และ Exception คนละแบบ
- Catalog: Menu modifier, Service duration และ Part/Price book มีโครงสร้างเฉพาะ
- Resource: Table session, Treatment room และ Work bay มีความหมายต่างกัน
- Data boundary: Clinical note ต้องแยกจาก Restaurant preference และ Job note
- Revenue recognition/Cost: Package liability, Food recipe cost และ Job costing ไม่ใช่เรื่องเดียวกัน

---

# 10. Strategic Product Decisions

## 10.1 Catalog นี้ไม่เท่ากับ MVP

Catalog เป็น **Product option space** ส่วน MVP ต้องเลือก Complete workflow ที่เล็กที่สุด เช่น

```text
FoodFlow MVP
Customer QR → Menu → Cart → Submit → Staff/Kitchen → Status → Pay → Complete
```

การทำ Feature บางส่วนจากทุกกลุ่มพร้อมกันจะทำให้ Demo ดูกว้างแต่ร้านใช้งานจริงไม่ได้ จุดวัดความพร้อมควรเป็น “หนึ่งรายการเดินทางจากต้นจนจบโดยไม่ต้องใช้ระบบเงา” ไม่ใช่จำนวนหน้าเว็บ

## 10.2 Bundle คือ Preset ไม่ใช่ Code Fork

- ทุก Bundle ต้องทำงานบน Codebase และ Data model เดียวกัน
- ความแตกต่างเกิดจาก Entitlement, Configuration, Workflow template และ Role preset
- ห้ามสร้าง `FoodFlow Café app` แยกจาก `FoodFlow Dine-in app` หากไม่มีเหตุผลทางสถาปัตยกรรมที่ชัด
- ร้านเปลี่ยน Bundle แล้วข้อมูลเดิมต้องยังอยู่ และระบบต้องอธิบายผลของการปิด Topic

## 10.3 Topic คือหน่วยขายที่เล็กที่สุดที่เหมาะสม

ไม่ควรขายปุ่มย่อย เช่น “ปุ่ม Split bill” แยกเดี่ยว แต่ขาย Topic ที่แก้ปัญหาครบ เช่น `Split, Partial & Combined Payment` เพราะมีทั้ง UI, Rule, Ledger, Permission, Refund และ Report ที่ต้องเดินด้วยกัน

## 10.4 Dependency ต้องเป็น Machine-readable

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

## 10.5 Data Sensitivity ต้องไม่ถูกใช้เป็น Upsell แบบไร้เหตุผล

- CareFlow Clinical extension เปิดตามความจำเป็นของบริการ ไม่ใช่เพราะลูกค้าซื้อแพ็กเกจแพง
- Before/After media, Allergy, Consent และ Treatment record ต้องแยก Permission และ Retention
- JobFlow Location tracking ต้องทำเฉพาะเวลางานและวัตถุประสงค์ที่ประกาศ
- FoodFlow Payment evidence และ Customer history ต้องมี Access boundary เช่นกัน

## 10.6 Analytics ต้องพึ่ง Operational Discipline

- Dashboard P1 แสดง Fact จาก Transaction ที่เชื่อถือได้
- Forecast/Recommendation เป็น P2 เพราะต้องมี Historical data, Data quality และ Feedback loop
- อย่าเปิด “AI Recommendation” หากไม่มี Confidence, Human approval และการวัด Error
- Metric ของพนักงานต้องคำนึงถึงประเภทงาน ความซับซ้อน และคุณภาพ ไม่ใช้ความเร็วอย่างเดียว

## 10.7 Product Sequencing ที่แนะนำ

1. **Foundation:** Tenant, Branch, Auth, RBAC, Workflow, Audit และ Entitlement
2. **Beachhead workflow:** เลือกหนึ่ง Bundle ที่มีลูกค้าทดสอบจริง
3. **Operational depth:** Exception, Payment integrity, Notification และ Reporting
4. **Adjacent bundle:** Reuse Engine แล้วเพิ่ม Topic ที่ต่าง
5. **Second Product:** Reuse Shared Foundation แต่รักษา Domain model ที่จำเป็น
6. **Optimization:** Inventory, CRM, Advanced analytics และ Integration
7. **Scale:** Multi-branch, Ecosystem API, Automation และ Forecast

สำหรับบริบท FLOW ปัจจุบัน FoodFlow Dine-in หรือ FoodFlow Café เป็น Beachhead ที่เหมาะกว่าการพัฒนา Product ทั้งสามพร้อมกัน เพราะเห็น Customer-to-operation flow ชัดและใช้ Shared Engine ที่จะต่อยอดไป Queue, Appointment และ Job ได้

---

# 11. Definition of Ready สำหรับแตก Topic ไปเป็น UI/API

Feature Topic จะพร้อมเข้าสู่การออกแบบเมื่อมีข้อมูลครบอย่างน้อยดังนี้

| หัวข้อ | คำถามที่ต้องตอบ |
|---|---|
| Purpose | ปัญหาใครและ Outcome คืออะไร |
| Roles | ใครเห็น สร้าง แก้ อนุมัติ ยกเลิก และ Export ได้ |
| Entry | เข้ามาจาก Link, Navigation, Notification หรือ Workflow ใด |
| States | Loading, Empty, Draft, Active, Error, Cancelled และ Completed เป็นอย่างไร |
| Transition | สถานะเปลี่ยนได้โดยใครและภายใต้เงื่อนไขใด |
| Dependency | ต้องเปิด Topic/Integration/Device ใด |
| Data | Input, Output, Required field, Snapshot และ Retention |
| Financial impact | กระทบยอด Stock, Payment, Refund, Commission หรือ Report หรือไม่ |
| Notification | แจ้งใคร เมื่อไร ทางใด และถ้าส่งไม่สำเร็จทำอย่างไร |
| Audit | Action ใดต้องเก็บ Actor, Time, Before/After และ Reason |
| Responsive UI | Mobile, Tablet, Desktop และ Dedicated display ต่างกันอย่างไร |
| Acceptance | Test case ปกติ Exception Permission และ Concurrency คืออะไร |

---

# 12. ขั้นตอนเอกสารถัดไป

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

---

# 13. Market-pattern Validation

Catalog นี้ออกแบบจากเป้าหมายของ FLOW และตรวจเทียบความครอบคลุมกับรูปแบบความสามารถที่แพลตฟอร์มเฉพาะทางปัจจุบันใช้จริง เช่น

- Restaurant: [Square for Restaurants capabilities](https://squareup.com/us/en/restaurants/capabilities) และ [Square Kitchen Display System](https://squareup.com/us/en/point-of-sale/restaurants/kitchen-display-system) สะท้อนการเชื่อม POS, Online order, Delivery, KDS, Routing, Menu/Inventory และ Performance
- Care/Wellness: [Fresha business features](https://www.fresha.com/for-business/features) และ [Mindbody Booker](https://www.mindbodyonline.com/business/booker) ครอบคลุม Booking, Calendar, Reminder, Client profile, Form, Payment, Staff, Room/Equipment, Inventory และ Membership
- Job/Field Service: [Jobber client hub](https://help.getjobber.com/en/articles/what-do-your-clients-see-in-client-hub/), [Housecall Pro field-service CRM](https://www.housecallpro.com/features/field-service-crm-software/) และ [ServiceTitan field-service management](https://www.servicetitan.com/market/field-service-management-software) สะท้อน Request, Schedule/Dispatch, Quote approval, Client portal, Job execution, Invoice, Payment และ Customer communication
- Repair workflow: [RepairDesk repair-shop software](https://www.repairdesk.co/cell-phone-repair-shop-software/) สนับสนุนการแยก Repair ticketing, Inventory, POS, CRM, Quote, Invoice, Reporting และ Warranty-linked history

การตรวจเทียบนี้ใช้เพื่อค้นหา Capability gap ไม่ใช่เพื่อคัดลอก Product หรือบังคับให้ FLOW ต้องเท่ากับแพลตฟอร์มขนาดใหญ่ตั้งแต่รุ่นแรก

---

## สรุปหลักการหนึ่งประโยค

> FLOW ควรมี Catalog ที่กว้างพอให้เห็น Product Universe แต่ต้องขายและพัฒนาเป็น Topic ที่แก้ Workflow หนึ่งช่วงให้จบ โดยใช้ Bundle เป็นจุดเริ่มต้น ไม่ใช่ข้อจำกัดถาวร และใช้ Dependency ป้องกันไม่ให้ร้านประกอบระบบจน Workflow ขาดตอน
