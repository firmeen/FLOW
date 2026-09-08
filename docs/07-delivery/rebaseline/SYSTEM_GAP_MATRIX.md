# FLOW System Gap Matrix

Status: REBASELINE AUTHORITY

Legend: `PRODUCTION`, `FOUNDATION`, `PARTIAL`, `DEMO`, `MISSING`, `BLOCKED`.

| Capability | Required production state | Current state | Gap | Acceptance needed |
| --- | --- | --- | --- | --- |
| Auth.js internal login | Server-owned identity with bounded session | FOUNDATION | Production hardening and deployment secrets | Auth integration + route E2E |
| Workspace/tenant/branch selection | Explicit trusted AccessContext | FOUNDATION | Tenant-admin/branch semantics reconciliation | Resolver + permission matrix |
| RBAC | Permission checks at route and command boundaries | FOUNDATION | Complete capability coverage | Permission freshness tests |
| RLS | Tenant/branch isolation on durable data | FOUNDATION | Audit every production table/grant | pgTAP isolation matrix |
| Customer QR entry | Scoped non-staff capability | PRODUCTION foundation | Production secret provisioning | Capability E2E |
| Customer storefront | Server snapshot rendered as source of truth | PARTIAL | UI still reads demo store | Browser cutover acceptance |
| Customer cart | Durable cart is source of truth | PARTIAL | UI still mutates local cart | HTTP/UI idempotency acceptance |
| Customer submit order | Durable order only | PARTIAL | UI still submits local order | UI -> API -> staff queue E2E |
| Customer service request | Durable request command | DEMO | UI only local | New command + staff/cashier read |
| Staff order queue/detail | Branch-scoped durable queue | PRODUCTION foundation | Premium UX/reliability polish | Browser + DB integration |
| Staff decision | Transactional durable command | FOUNDATION | Cross-plane concurrency defect | One-winner race tests |
| Staff lifecycle | Transactional durable command | FOUNDATION | Cross-plane concurrency defect | One-winner race tests |
| Staff amendments/cancellation | Transactional durable command | FOUNDATION | Cross-plane concurrency defect | One-winner + rollback tests |
| Priority/defer/remake | Transactional durable command | FOUNDATION | Cross-plane concurrency defect | One-winner + bounded remake tests |
| Staff tables/service/menu | Durable server authority | DEMO | `useFoodFlow()` | New read/command planes |
| Kitchen board | Durable ticket authority | DEMO | `useFoodFlow()` | DB-backed queue + mutations |
| Cashier/POS | Durable bill/payment authority | DEMO | `useFoodFlow()` | Payment transaction + audit |
| Owner/admin dashboard | Durable aggregated reads | DEMO | `useFoodFlow()` | Server query plane |
| Menu management | Durable menu mutation authority | DEMO/PARTIAL | Schema exists, UI local | Auth/RBAC/RLS command plane |
| Omise merchant payment | Provider-backed payment lifecycle | MISSING | No production provider runtime | Webhook/idempotency/reconciliation |
| Stripe SaaS billing | Subscription lifecycle | MISSING | Feature flag only | Billing service + webhook tests |
| Observability | Structured request/command/event telemetry | PARTIAL | Limited application observability | Correlation/logging acceptance |
| Background jobs | Durable retries/outbox for external side effects | MISSING | No job authority | Retry/idempotency acceptance |
| Next.js production runtime | One canonical Vercel runtime | PARTIAL | Default scripts previously pointed at Vinext | Build/start contract |
| CI database coverage | DB gate on all DB-dependent source | PARTIAL | Operational/identity source not fully classified | Workflow scope tests |
| Browser acceptance | Required for production UX changes | PARTIAL | Playwright not in Stable Quality Gate | CI browser job |
| Delivery governance | Capability-sized work with explicit gates | BLOCKED by legacy governance | Phase/Round gate still active | New delivery policy |

## Severity order

1. Security, data isolation, concurrency, migration integrity.
2. Customer durable-runtime cutover.
3. Operational durability for staff/kitchen/service/cashier.
4. Owner/admin authority and reporting.
5. External payments/billing and background processing.
6. Optimization and advanced product capabilities.

A visual screen is not considered implemented when its authority remains `useFoodFlow()` or demo seed state. A schema table is not considered a production capability until reads, commands, authorization, isolation, browser integration, and acceptance evidence are connected.
