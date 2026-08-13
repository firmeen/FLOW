---
title: JobFlow Feature Catalog
document_id: JOBFLOW-CATALOG
status: draft
owner: Product
last_reviewed: 2026-08-13
source_of_truth: true
---
# JobFlow Feature Catalog

เอกสารนี้เป็น Source of truth ของ Feature Group, Feature Topic และ Individual Feature สำหรับ JobFlow. Bundle และเอกสารส่งมอบต้องอ้างรหัสจาก Catalog นี้

- [Recommended Feature Bundles](feature-bundles.md)
- [Catalog governance](../catalog-governance.md)

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
