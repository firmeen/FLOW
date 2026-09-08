# FLOW

FLOW คือแพลตฟอร์มจัดการ Workflow สำหรับธุรกิจ SME ซึ่งเชื่อม Customer Entry, งานปฏิบัติการของพนักงาน, การชำระเงิน, ข้อมูลลูกค้า และการตัดสินใจของเจ้าของธุรกิจไว้ในระบบเดียว

Repository นี้เป็นทั้ง Source code และ Project knowledge base ของระบบ โดยพัฒนาเป็น Shared Platform ร่วมกับ Vertical Product 3 กลุ่ม

| Product | Operating model หลัก | ตัวอย่างธุรกิจ |
|---|---|---|
| **FoodFlow** | Order, kitchen, table, payment | ร้านอาหาร คาเฟ่ และร้านเครื่องดื่ม |
| **CareFlow** | Appointment, queue, staff, resource | ร้านเสริมสวย สปา คลินิก และบริการส่วนบุคคล |
| **JobFlow** | Intake, work order, execution, handover | ร้านซ่อม งานบริการภาคสนาม และเวิร์กช็อป |

## Product model

FLOW ใช้โครงสร้างผลิตภัณฑ์แบบ Shared Foundation + Configurable Vertical Product เพื่อให้ระบบ Authentication, Permission, Workflow, Customer, Notification, File, Audit และ Integration ใช้ซ้ำร่วมกันได้ ขณะที่ Workflow เฉพาะของ FoodFlow, CareFlow และ JobFlow ยังคงแยก Domain อย่างชัดเจน

```text
FLOW Platform
├── Shared Foundation
├── FoodFlow
├── CareFlow
└── JobFlow
```

## Current delivery authority

FLOW อยู่ในช่วง source-code rebaseline หลังการรวม operational order plane เข้าสู่ `main`. ระบบ Phase/Round เดิมเป็น historical evidence และไม่ใช่ progression authority สำหรับงานใหม่

ลำดับงานปัจจุบันใช้ capability dependency และ acceptance evidence จากเอกสาร rebaseline ภายใต้ `docs/07-delivery/rebaseline/` โดยมี **FoodFlow dine-in table ordering** เป็น production beachhead แรก:

```text
Verified table entry
→ Live storefront
→ Durable cart
→ Durable order
→ Staff operational plane
→ Kitchen / service
→ Cashier / payment
→ Session closure / receipt
```

Browser state ใช้สำหรับ interaction/cache เท่านั้น และต้องไม่เป็น authoritative business workflow state เมื่อ capability นั้นมี durable server/database plane แล้ว

## Documentation

### Rebaseline source of truth

- [System current state](docs/07-delivery/rebaseline/SYSTEM_CURRENT_STATE.md)
- [System gap matrix](docs/07-delivery/rebaseline/SYSTEM_GAP_MATRIX.md)
- [System decisions](docs/07-delivery/rebaseline/SYSTEM_DECISIONS.md)
- [Product beachhead](docs/07-delivery/rebaseline/PRODUCT_BEACHHEAD.md)
- [Architecture baseline](docs/07-delivery/rebaseline/ARCHITECTURE_BASELINE.md)
- [Delivery policy](docs/07-delivery/rebaseline/DELIVERY_POLICY.md)
- [Ordered rebaseline backlog](docs/07-delivery/rebaseline/REBASELINE_BACKLOG.md)

### Product and architecture knowledge

- [Architecture hub](docs/06-architecture/README.md)
- [Technology and application architecture](docs/06-architecture/application-architecture.md)
- [Payment architecture](docs/06-architecture/payment-architecture.md)
- [Data model and tenant isolation](docs/06-architecture/data-model.md)
- [Architecture security](docs/06-architecture/security.md)
- [Product documentation hub](docs/04-product/README.md)
- [Platform overview](docs/04-product/platform-overview.md)
- [FLOW Shared Foundation catalog](docs/04-product/flow-core/feature-catalog.md)
- [FoodFlow Product Hub](docs/04-product/foodflow/README.md) — overview, catalog, 5 bundles, comparison และ dependencies
- [CareFlow Product Hub](docs/04-product/careflow/README.md) — overview, catalog, 5 bundles, comparison และ sensitive-data gates
- [JobFlow Product Hub](docs/04-product/jobflow/README.md) — overview, catalog, 5 bundles, comparison และ workflow dependencies
- [Cross-product shared engines](docs/04-product/cross-product-shared-engines.md)
- [Product development strategy](docs/01-strategy/product-development-strategy.md)
- [Feature market-pattern validation](docs/03-research/validation-results/feature-market-validation.md)
- [Roadmap](ROADMAP.md)
- [Contributing guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

Historical Phase/Round specifications and migrations remain repository evidence. Do not rewrite them merely to remove historical naming.

## Target technology stack

ตารางนี้เป็น **Target Architecture** ไม่ใช่คำยืนยันว่าทุกส่วนติดตั้งใน Production แล้ว สถานะจริงของ code/runtime/data authority ต้องอ่านร่วมกับ [System current state](docs/07-delivery/rebaseline/SYSTEM_CURRENT_STATE.md) และ [Architecture baseline](docs/07-delivery/rebaseline/ARCHITECTURE_BASELINE.md)

| Layer | Technology | หน้าที่ |
|---|---|---|
| Web application | Next.js App Router + React | Customer, Staff, Owner และ Platform surfaces |
| Language | TypeScript | Contract ร่วมของ UI, Domain, API และ Integration |
| Authentication | Auth.js | Identity และ Session ของ Owner/Staff/Platform Admin |
| Database | Supabase Postgres | Multi-tenant operational data, billing state และ audit |
| Deployment | Vercel | Next.js runtime, preview และ production deployment |
| Styling | Tailwind CSS | Design token และ responsive layout |
| Components | shadcn/ui | Accessible component primitives ที่ปรับตาม FLOW Design System |
| SaaS billing | Stripe Billing | Subscription และ Invoice ที่ร้านจ่ายให้ FLOW |
| Merchant payment | Omise (Opn Payments) | เงินที่ลูกค้าจ่ายให้ร้านผ่านช่องทางในประเทศไทย |
| Analytics | Vercel Analytics + FLOW operational metrics | Web analytics แยกจาก Business/KPI data |
| Formatting | Prettier | รูปแบบ Source code และ Markdown ที่สม่ำเสมอ |

หลักการสำคัญคือแยก **FLOW SaaS Billing** ออกจาก **Merchant Payments** ทั้ง Account, Credential, Webhook, Ledger, Refund และ Reconciliation เพื่อไม่ให้เงินของ FLOW ปะปนกับเงินของร้านค้า

## Repository structure

```text
FLOW/
├── apps/                   # Deployable applications
├── docs/
│   ├── 00-governance/     # Ownership, policy and decision process
│   ├── 01-strategy/       # Vision, sequencing and product strategy
│   ├── 02-business/       # Business model and commercial material
│   ├── 03-research/       # Market, customer and validation evidence
│   ├── 04-product/        # Product catalogs, bundles, requirements and workflows
│   ├── 05-design/         # UX/UI foundations and design specifications
│   ├── 06-architecture/   # System, data and integration architecture
│   ├── 07-delivery/       # Rebaseline authority, backlog, release and delivery controls
│   ├── 08-operations/     # Runbooks and operating procedures
│   └── 09-meetings/       # Meeting records and decisions
├── CONTRIBUTING.md
├── ROADMAP.md
└── SECURITY.md
```

## Current product status

Feature Catalog เป็น **Product Universe และ Product Strategy Baseline** ไม่ใช่คำสัญญาว่าจะพัฒนาทุก Feature พร้อมกัน

FoodFlow เป็น beachhead ปัจจุบัน และงาน production ต้องปิด workflow แบบ end-to-end ตาม dependency ก่อนขยาย CareFlow หรือ JobFlow. Capability ใดที่ยังใช้ `useFoodFlow()` / demo state ต้องถือเป็น prototype หรือ partial implementation จนกว่าจะมี durable server authority และ acceptance evidence ครบ

ลำดับ implementation ที่ active อยู่ใน [Rebaseline Backlog](docs/07-delivery/rebaseline/REBASELINE_BACKLOG.md) เท่านั้น
