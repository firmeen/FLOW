# FLOW Rebaseline Backlog

Status: ORDERED IMPLEMENTATION AUTHORITY

The backlog is ordered by dependency and risk. Items are capability changes, not Phase/Round steps.

| Order | Capability change | Outcome | Gate |
| ---: | --- | --- | --- |
| 1 | Source authority + governance cutover | Rebaseline docs active; obsolete Phase/Round gate removed; canonical Next.js runtime declared | Repository/CI green |
| 2 | Shared operational-order concurrency boundary | Decision/lifecycle/exception/production commands share fail-fast per-order lock | All one-winner + rollback tests green |
| 3 | Identity scope reconciliation | Tenant-admin and branch operations have explicit correct AccessContext semantics | Permission + browser route matrix |
| 4 | CI database scope expansion | Identity/order server changes always exercise DB runtime and RLS quality | Workflow evidence |
| 5 | Customer storefront UI cutover | Customer page renders durable server storefront/menu, not demo store | Browser source marker + responsive E2E |
| 6 | Customer cart UI cutover | UI creates/updates/removes durable cart through idempotent commands | Replay-safe UI/API E2E |
| 7 | Customer order submit cutover | Customer send action creates one durable order visible to staff | Customer-to-staff E2E |
| 8 | Customer service request plane | Call staff/request bill persist to `foodflow.service_requests` | Customer/staff/cashier E2E |
| 9 | Staff table/service live plane | Non-order staff tabs stop reading `useFoodFlow()` | Branch-scoped DB/browser acceptance |
| 10 | Kitchen live plane | KDS reads/mutates durable kitchen tickets and order lifecycle | Kitchen concurrency + E2E |
| 11 | Cashier live plane | Bill/payment/void actions use durable payments schema | Money/audit/idempotency gates |
| 12 | Owner/admin live reads | Dashboard aggregates come from durable server data | Tenant-scope RBAC/RLS E2E |
| 13 | Menu management durable commands | Owner changes menu/configuration through authorized server mutations | Tenant/branch policy + RLS tests |
| 14 | Demo authority retirement | Remove production consumers of store/demo repositories; delete dead authority | Source-authority scanner green |
| 15 | Merchant payment provider | Omise sandbox payment/webhook/reconciliation | Provider acceptance |
| 16 | Session closure/receipt | Payment completion closes session and exposes durable receipt | End-to-end beachhead acceptance |
| 17 | Observability/outbox | Correlated structured events and retry-safe external effects | Failure/retry acceptance |
| 18 | SaaS billing | Stripe subscription lifecycle separated from merchant payments | Billing acceptance |
| 19 | Production Supabase provisioning | Apply the verified migration authority to dedicated Production project | Fresh bootstrap + secrets/deploy smoke |
| 20 | CareFlow/JobFlow expansion | Reuse Shared Foundation after FoodFlow beachhead is complete | Product-specific baseline |

## Current rebaseline PR scope

This source-code rebaseline PR is allowed to complete items 1–7 where the durable backend already exists, and to establish the architecture/gates required for the later items. Items requiring new financial/provider behavior or production infrastructure are not silently enabled as part of a source cleanup.

## Retirement rule

Legacy/demo code is deleted only after the last production consumer is cut over. Until then it must be clearly isolated and may not be labelled `Live` in production UI.
