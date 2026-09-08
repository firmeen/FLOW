# FLOW System Gap Matrix

Status: REBASELINE AUTHORITY

Legend: `PRODUCTION`, `FOUNDATION`, `PARTIAL`, `DEMO`, `MISSING`, `BLOCKED`.

`FOUNDATION` means the source/runtime boundary is durable but production-environment provisioning, operational hardening, or final go-live evidence is still outstanding. `PRODUCTION` is reserved for capabilities whose complete source and deployment gates are satisfied; this source-code rebaseline does not claim Production Supabase cutover.

| Capability | Required production state | Rebaseline source state | Remaining gap | Acceptance / next gate |
| --- | --- | --- | --- | --- |
| Auth.js internal login | Server-owned identity with bounded session | FOUNDATION | Production secret/MFA/recovery hardening | Auth integration + route E2E |
| Workspace/tenant/branch selection | Explicit trusted AccessContext | FOUNDATION | Broader role/workspace UX hardening | Resolver + permission matrix |
| RBAC | Permission checks at route and command boundaries | FOUNDATION | Complete later capability coverage | Permission freshness + browser route tests |
| RLS | Tenant/branch isolation on durable data | FOUNDATION | Audit each new production table/grant | pgTAP isolation matrix |
| Customer QR entry | Scoped non-staff capability | FOUNDATION | Production secret/environment provisioning | Capability E2E + deploy smoke |
| Customer storefront | Server snapshot rendered as source of truth | FOUNDATION | Production database/environment cutover | Durable browser acceptance |
| Customer cart | Durable cart is source of truth | FOUNDATION | Production database/environment cutover | Idempotent UI/API E2E + reload persistence |
| Customer submit/order history | Durable order only, capability-scoped history | FOUNDATION | Production database/environment cutover | UI -> DB -> staff queue E2E |
| Customer service request | Durable request command | DEMO | UI action still local/unimplemented | New command + customer/staff/cashier E2E |
| Staff order queue/detail | Branch-scoped durable queue | FOUNDATION | Production environment + continued UX/reliability hardening | Browser + DB integration |
| Staff decision | Transactional serialized durable command | FOUNDATION | Final race acceptance on PR head | One-winner race tests |
| Staff lifecycle | Transactional serialized durable command | FOUNDATION | Final race acceptance on PR head | One-winner race tests |
| Staff amendments/cancellation | Transactional serialized durable command | FOUNDATION | Final race/rollback acceptance on PR head | One-winner + rollback tests |
| Priority/defer/remake | Transactional serialized durable command | FOUNDATION | Final race/bounded-control acceptance on PR head | One-winner + bounded remake tests |
| Staff tables/service/menu | Durable server authority | DEMO | `useFoodFlow()` remains authority | New read/command planes |
| Kitchen board | Durable ticket authority | DEMO | `useFoodFlow()` remains authority | DB-backed queue + mutations |
| Cashier/POS | Durable bill/payment authority | DEMO | `useFoodFlow()` remains authority | Payment transaction + audit |
| Owner/admin dashboard | Durable aggregated reads | DEMO | `useFoodFlow()` remains authority | Tenant-scoped server query plane |
| Menu management | Durable menu mutation authority | DEMO/PARTIAL | Schema/read model exists; management UI mutates local state | Auth/RBAC/RLS command plane |
| Omise merchant payment | Provider-backed merchant lifecycle | MISSING | No production provider runtime | Webhook/idempotency/reconciliation |
| Stripe SaaS billing | Separate subscription lifecycle | MISSING | Feature flag only in application runtime | Billing service + webhook tests |
| Observability | Correlated structured request/command/event telemetry | PARTIAL | Limited command/request telemetry and no durable outbox | Correlation/logging acceptance |
| Background jobs | Durable retries/outbox for external effects | MISSING | No job authority | Retry/idempotency acceptance |
| Next.js production runtime | One canonical Vercel runtime | FOUNDATION | Environment/deployment verification | `npm run build` + Vercel preview/prod smoke |
| CI database coverage | DB gate on all DB-dependent source | FOUNDATION | Extend classification as new modules become durable | Workflow evidence |
| Browser acceptance | Required for production UX changes | FOUNDATION | Keep coverage current as capabilities cut over | Playwright gate |
| Delivery governance | Capability-sized work with explicit gates | FOUNDATION | Owner acceptance/merge of rebaseline | Rebaseline docs + required checks |
| Documentation authority | Current source truth separated from historical target/progression docs | FOUNDATION | Reconcile detailed legacy target snapshots incrementally | Root/hub authority links + drift review |
| Production Supabase | Dedicated verified FLOW schema/runtime database | BLOCKED | Deliberately not provisioned by source rebaseline | Backlog item 19 after full source acceptance |

## Severity order

1. Security, data isolation, concurrency and migration integrity.
2. Customer durable-runtime acceptance and production-environment readiness.
3. Operational durability for staff/kitchen/service/cashier.
4. Owner/admin authority and reporting.
5. External payments/billing and background processing.
6. Production provisioning, observability hardening and advanced product capabilities.

A visual screen is not considered implemented when its business authority remains `useFoodFlow()` or demo seed state. A schema table is not considered a production capability until reads, commands, authorization, isolation, UI and acceptance evidence are connected. A source-complete capability is not labelled `PRODUCTION` until its deployment/environment gates are also proven.
