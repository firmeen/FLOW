---
title: FLOW Architecture Security
document_id: FLOW-ARCH-SECURITY
status: proposed
owner: Security
last_reviewed: 2026-08-13
source_of_truth: true
---

# FLOW Architecture Security

Security baseline นี้ครอบคลุม Authentication, Tenant isolation, Payment, Sensitive data, Provider integration และ Platform operations ของ FoodFlow, CareFlow และ JobFlow

## Security objectives

1. ป้องกันการเข้าถึงข้อมูลข้าม Tenant, Branch, Customer, Booking, Order หรือ Job
2. ป้องกันการยึด Account/Session และการเพิ่มสิทธิ์โดยไม่ได้รับอนุญาต
3. ลด Payment/PCI scope และไม่ให้ข้อมูลบัตรผ่าน FLOW
4. รักษาความถูกต้องของ Financial, Entitlement และ Workflow transition
5. จำกัดการใช้ Sensitive CareFlow data, Workforce location และ Customer evidence ตามวัตถุประสงค์
6. ตรวจสอบย้อนหลังได้ว่าใคร ทำอะไร กับ Tenant/ข้อมูลใด จากเหตุการณ์ใด
7. ตรวจจับ/กู้คืนจาก Secret leak, Webhook failure, Provider outage และ Data incident ได้

## Identity and session

Auth.js เป็น Identity/Session authority เดียวใน Baseline

| Control | Requirement |
|---|---|
| Login | Prefer OAuth, Magic Link หรือ Passkey; Credentials ต้องมี password hashing/rate limit/recovery ที่ทบทวนแล้ว |
| MFA | Required for Platform Admin, Finance/refund, credential/settlement changes และ high-risk Owner action |
| Session | Secure, HTTP-only, SameSite cookie; rotation/revocation; short lifetime for privileged sessions |
| Account recovery | Strong identity verification, rate limit, notification และ audit |
| Step-up auth | Refund, payout/settlement, role elevation, API credential และ sensitive export |
| Service account | No shared human credential; scoped token, owner, expiry/rotation และ usage audit |

Temporary internal email/password implementation ต้องถือเป็น Prototype gate และถูกยกเลิกเมื่อ Auth.js พร้อม

## Authorization

ใช้ RBAC + Context/Attribute checks

- Role ให้ชุด Permission ไม่ใช่สิทธิ์เข้าถึงทุก Row
- Context รวม Tenant, Branch, Assignment, Ownership, Workflow state, Data class และ Purpose
- Owner ไม่ได้แปลว่าเข้าถึง Platform admin หรือ Provider secret
- Staff เข้าถึงเฉพาะ Branch/Assignment/Service scope
- Customer ใช้ scoped capability token/account และเห็นเฉพาะ Transaction ของตน
- Support access ใช้ Just-in-time grant พร้อม reason, approver, expiry และ audit
- UI hiding เป็น usability เท่านั้น; Server และ Database ต้อง enforce ซ้ำ

Permission ที่ต้องแยกอย่างน้อย

```text
billing.view · billing.manage
merchant_payment.view · merchant_payment.collect
merchant_payment.refund · merchant_payment.reconcile
customer_sensitive.view · customer_sensitive.export
workflow.configure · entitlement.configure
member.invite · role.manage
integration.configure · secret.rotate
support.impersonate · audit.view
```

## Tenant and database isolation

- Tenant-owned table มี `tenant_id NOT NULL`, Composite FK และ index
- Server resolve Tenant จาก verified Membership ไม่รับ `tenant_id` ใน Form เป็น authority
- Transaction ตั้ง local Actor/Tenant context; RLS enforce allow/deny
- RLS test มี negative cross-tenant ID guessing และ wrong-branch cases
- Supabase publishable key เปิดเผยได้เฉพาะ approved public feature; secret/service role server-only
- ห้ามใช้ `user_metadata` ที่ User แก้ได้เป็น authorization source
- Views ใช้ RLS-aware/security-invoker pattern หรือไม่ expose
- Privileged function อยู่ private schema, fixed search path, narrow execute grants และ explicit caller check
- Database owner/superuser ไม่ใช้ใน application request path

## Payment security

| Area | Control |
|---|---|
| Card data | Provider-hosted/tokenized collection; no PAN/CVV in FLOW server, DB, log, analytics or support |
| Purpose separation | Stripe Billing และ Omise Merchant credential/webhook/schema/role แยกกัน |
| Webhook | Verify using provider-supported mechanism, raw-body handling, deduplication, replay protection |
| Amount integrity | Server calculates expected amount; verify amount/currency/merchant/business reference before success |
| Idempotency | Stable key for create/refund; unique provider event; transition guard |
| Refund | Restricted permission + step-up auth + reason + approval threshold + audit |
| Reconciliation | Daily/defined cadence; alert on mismatch, stale pending, dead-letter and duplicate reference |
| Environment | Test/Live key and endpoint separated; Preview never uses Live key |

PCI-DSS scope ต้องให้ Security/Compliance ยืนยันจาก Integration จริง เอกสารนี้ตั้งเป้าลด Scope แต่ไม่ประกาศระดับ Compliance

## Sensitive-data classes

| Class | Examples | Additional controls |
|---|---|---|
| Public | Published menu/service description | Integrity, moderation, cache control |
| Internal | Staff note, schedule, stock | Tenant/role/branch scope |
| Confidential | Customer contact, order/booking/job history | Purpose, export restriction, masking, audit |
| Restricted | Care clinical/health data, before/after media, ID document | Explicit activation gate, least privilege, consent/legal basis, field/file access audit, short retention |
| Highly restricted | Payment secret, DB secret, OAuth client secret | Secret manager only, never application table/log |

CareFlow “Clinic” หรือ Sensitive extension ห้ามเปิดจาก Full Business bundle โดยอัตโนมัติ ต้องผ่าน Data purpose, Permission, Form/Consent, Retention และ Security review

JobFlow Location/Lone-worker data เก็บเฉพาะ Job/Shift window และห้ามใช้ติดตามนอกเวลาหรือวัตถุประสงค์

## Application and API controls

- Validate input/output ด้วย typed schema; reject unknown/unsafe fields ตาม Contract
- CSRF protection สำหรับ cookie-authenticated mutation
- Rate limit ตาม Actor/IP/Tenant/operation โดยไม่ทำให้ Tenant หนึ่งกระทบทั้งหมด
- Parameterized query; ห้ามประกอบ SQL จาก untrusted input
- Security headers: CSP, HSTS, frame protection, MIME sniffing protection และ referrer policy
- File upload ตรวจ type/size/signature, random object path, malware scanning strategy และ signed access
- Customer/guest token high entropy, short-lived, purpose-bound และ revocable
- CORS allowlist เฉพาะ approved origins; webhook ไม่ใช้ browser CORS เป็น security control
- Error response ไม่เผย stack, secret, SQL, provider payload หรือ existence ของ cross-tenant record

## Secret management

| Secret | Storage | Rotation trigger |
|---|---|---|
| Auth.js secret/provider credential | Vercel server environment | Scheduled + leak/staff/provider change |
| Database URL/password | Server/CI secret store | Scheduled + leak/role change |
| Supabase secret/service key | Server-only secret store | Leak/privilege change/provider guidance |
| Stripe secret/webhook secret | Server-only; separate Test/Live | Leak, endpoint replacement, owner change |
| Omise secret key | Server-only; separate Test/Live | Leak, merchant/account change |

- Commit เฉพาะ `.env.example` ที่ไม่มีค่าจริง
- ห้ามส่ง Secret ผ่าน Issue, PR, Screenshot, Chat หรือ log
- Secret มี owner, purpose, environments, created/rotated timestamp และ runbook
- รองรับ Dual-secret overlap เมื่อ Provider อนุญาตเพื่อลด downtime
- Secret scan ทำงานก่อน merge และใน CI

## Logging and audit

Operational log ต้องมี correlation ID, tenant-safe identifier, actor type, operation, outcome, latency และ error class แต่ไม่บันทึก Secret/token/full sensitive payload

Immutable audit event สำหรับ

- Login/MFA/recovery/session revocation ที่สำคัญ
- Membership/Role/Permission change
- Bundle/Topic/Workflow/Entitlement publish
- Payment/refund/dispute/reconciliation transition
- Provider credential/webhook/configuration change
- Sensitive view/export/download และ support access
- Data retention/delete/legal-hold operation

Audit record ต้องมี `actor`, `tenant`, `purpose`, `target`, `before/after` ที่ลดข้อมูลละเอียด, `source_event`, timestamp และ correlation ID

## Threat scenarios and controls

| Scenario | Prevent | Detect/Recover |
|---|---|---|
| User guesses another tenant's Order ID | Server scope + composite FK + RLS | Denied-access metric/audit, security test |
| Forged payment callback | Provider verification + server retrieve | Webhook verification failure alert |
| Duplicate webhook/refund request | Unique event + idempotency key | Duplicate counter, replay-safe result |
| Staff refunds fraudulently | Restricted permission + step-up + threshold approval | Refund audit/reconciliation/anomaly alert |
| Secret committed to Git | Pre-commit/CI scanning, `.env` ignore | Revoke/rotate, history/incident review |
| CareFlow sensitive export | Activation gate, purpose/permission, watermark/signed URL | Export audit, alert, revoke link |
| Support views tenant data silently | JIT grant, reason, time-bound scope | Tenant-visible/internal audit and review |
| Provider outage | Timeout, retry budget, circuit breaker, pending state | Status page/alert, reconciliation/replay |

## Security testing gates

- Unit tests: permission and state guards
- Database tests: RLS allow/deny/cross-tenant/branch/deactivated membership
- API tests: auth bypass, IDOR/BOLA, CSRF, rate limit, validation and error leakage
- Payment tests: forged/duplicate/out-of-order webhook, amount mismatch, refund replay
- Secret scan and dependency vulnerability review
- File upload and signed URL abuse tests
- Privileged/support access expiry and audit tests
- Backup restore and incident tabletop before Production

## Incident minimum

1. Classify incident: Account, Tenant leak, Payment, Secret, Availability หรือ Data integrity
2. Contain: revoke session/key, disable integration/feature flag, isolate tenant/path
3. Preserve evidence: audit, provider event, deployment, DB log และ timeline
4. Assess affected tenant/data/amount/time and legal/provider notification obligation
5. Recover from known-good state and reconcile Payment/Entitlement/Workflow
6. Notify stakeholders ตาม Incident plan
7. Complete root cause, corrective action, regression test และ architecture update

## Production security checklist

- [ ] Auth.js + MFA/step-up policy implemented and temporary auth removed
- [ ] Permission matrix approved and enforced Server + RLS
- [ ] Cross-tenant/branch negative tests pass
- [ ] Live payment collection never exposes PAN/CVV to FLOW
- [ ] Stripe/Omise Test/Live credentials and webhooks separated
- [ ] Refund/reconciliation/audit controls pass
- [ ] CareFlow sensitive and Workforce location gates approved
- [ ] Secret scan, dependency scan and security headers pass
- [ ] Backup/PITR restore exercise and incident owners confirmed
- [ ] Privacy, retention, provider contract and legal review complete

## References

- [Auth.js security](https://authjs.dev/security)
- [Supabase production security](https://supabase.com/docs/guides/security/product-security)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Stripe webhook security](https://docs.stripe.com/webhooks)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
