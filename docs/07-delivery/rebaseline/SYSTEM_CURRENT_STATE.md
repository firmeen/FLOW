# FLOW System Current State

Status: REBASELINE AUTHORITY

Rebaseline input: `b03a7bda9dcd8a36f1b274f25d19143ba43e09a4`

This document records the source state established by the source-code rebaseline PR, while retaining the post-R06 input SHA above for traceability. Historical Phase/Round documents remain evidence only; they are not current planning or progression authority.

## Runtime topology

FLOW still contains two implementation generations inside the same Next.js application, but their authority is now explicit:

1. The durable server plane under `src/modules/*` is the production authority for capabilities that have been cut over. It is backed by PostgreSQL/Supabase, Auth.js, transaction-scoped database roles, RBAC, RLS, customer capability, idempotent customer commands, and operational-order command services.
2. The legacy/demo plane under `src/store`, `src/services/repositories`, `src/domain`, and `src/data/demo` remains only for capabilities that have not yet received a durable replacement. It is not allowed to masquerade as live production state.

The rebaseline does not delete the legacy plane blindly. Each remaining capability is cut over to a durable server authority, verified, and only then may its demo authority be retired.

## Current capability truth

| Capability | Current authority after rebaseline PR | State |
| --- | --- | --- |
| Internal authentication | Auth.js Credentials + database credential boundary | Durable foundation |
| Workspace selection | Database membership/role/tenant/branch resolution | Durable foundation |
| RBAC | Database permission evaluation plus route/command guards | Durable foundation |
| Tenant/branch isolation | Transaction context + RLS | Durable foundation |
| Customer QR capability | Signed customer capability | Durable foundation |
| Customer storefront reads | PostgreSQL customer-data module rendered directly by the customer route | Durable source authority |
| Customer cart | PostgreSQL aggregate + idempotent customer HTTP commands | Durable source authority |
| Customer order submission/history | PostgreSQL order command + capability-scoped order read plane | Durable source authority |
| Staff order queue/detail | PostgreSQL operational-order read plane | Durable source authority |
| Staff order decisions/lifecycle/exceptions/production controls | PostgreSQL operational command plane + shared per-order fail-fast lock | Durable source authority; acceptance gate required |
| Staff non-order tabs | `useFoodFlow()` | Demo/local |
| Kitchen | `useFoodFlow()` | Demo/local |
| Cashier | `useFoodFlow()` | Demo/local |
| Admin/owner surfaces | `useFoodFlow()` | Demo/local |
| Menu configuration | Durable schema/read plane exists; production mutation UI remains local | Partial |
| Service requests | Durable schema exists; production UI/command plane remains local | Partial |
| Kitchen tickets | Durable schema exists; production UI/command plane remains local | Partial |
| Payments | Durable schema exists; production collection/void/reconciliation authority remains incomplete | Partial |
| Merchant payments | Provider boundary not production-enabled | Missing/blocked by implementation |
| SaaS billing | Feature flag only in current application runtime | Missing/blocked by implementation |

## Customer production path established by this rebaseline

The verified table route no longer hands production customer business state back to `useFoodFlow()`.

```text
QR/direct entry
→ signed customer capability
→ database storefront snapshot
→ durable responsive customer experience
→ durable table cart
→ idempotent item commands
→ replay-safe order submission
→ capability-scoped order history
→ durable staff order queue
```

The UI exposes explicit loading, empty, conflict, unavailable and persisted-state feedback. The staff-request control remains visibly unavailable rather than simulating a live request until the durable service-request command plane is implemented.

## Operational concurrency state

The post-R06 input allowed different operational mutation planes to observe/mutate the same order without one shared lock. Cross-plane races could therefore both succeed in sequence during overlapping requests.

The rebaseline adds one shared, tenant/branch/order-scoped `FOR UPDATE NOWAIT` lock inside the existing authorized transaction before mutable order state is observed by decision, lifecycle, exception/cancellation, or production-control commands.

Expected mapping:

- scoped row missing -> existing domain not-found;
- PostgreSQL `55P03` lock-not-available -> existing domain conflict;
- lock acquired -> command evaluates and mutates one serialized order state;
- event evidence remains transaction-atomic with the aggregate change.

The implementation is not declared accepted merely by its presence; the preserved one-winner race and rollback suites remain the acceptance authority.

## Database truth

The generated Kysely database contract contains the `app`, `foodflow`, `payments`, and `audit` schemas, including organizations, restaurants, branches, memberships, permissions, menu structures, carts, orders, order events, kitchen tickets, service requests, table sessions, payments, allocations, and payment events.

Historical migrations remain immutable evidence. Rebaseline work adds forward migrations for future schema corrections rather than rewriting an already-applied migration. The zero-byte first migration remains historical evidence until an explicit cleanup decision says otherwise.

## Security truth

Internal routes use Auth.js plus database-backed access context and permission checks. Authorized business transactions enter restricted database roles and set trusted transaction-local context. Customer commands use a separate signed capability and `flow_customer_runtime` boundary.

The management parent shell no longer forces branch selection for every management route; tenant-scoped `/admin` permission remains tenant-scoped while branch-bound routes continue to enforce branch authority at their own route/service boundary.

No client-supplied tenant, branch, actor, capability token payload, or UI role selection becomes authorization authority.

## Runtime and CI truth

Next.js on Vercel is the canonical production runtime. Default `npm run build` and `npm run start` now represent the Next.js path; Vinext remains explicit secondary tooling only.

Repository Integrity and Stable Quality Gates remain. The obsolete Phase/Round workflow is removed. Database-aware classification includes identity, customer-data and operational-order server changes. User-facing changes activate a Browser Acceptance job using local Supabase plus Playwright.

Local Supabase test credentials are derived at workflow runtime from the local CLI rather than committed as credential-looking literals.

## Documentation and governance truth

Root README, ROADMAP, CONTRIBUTING, SECURITY, the architecture hub, and the former Phase/Round directory entry points now point to or defer to the active rebaseline authority. Historical Phase/Round specifications, merge policy text and migrations remain preserved but no longer authorize progression.

Issue #87 is the master tracker. `docs/07-delivery/rebaseline/DELIVERY_POLICY.md` and `REBASELINE_BACKLOG.md` replace PXX/RXX progression with capability-sized delivery and explicit acceptance gates.

## Remaining source-authority split

The following production-looking surfaces still depend on demo/local state and are therefore explicitly **not** considered durable production capabilities yet:

- staff tables/service/ready/menu tabs;
- kitchen board;
- cashier/POS surface;
- owner/admin dashboard/configuration;
- customer call-staff/request-bill commands.

These remain ordered backlog items. Their UI/domain knowledge may be salvaged, but they must be connected to server/database authority before the corresponding demo mutation path can be retired.

## Rebaseline acceptance condition

This source-code rebaseline is accepted only when the final PR head has green applicable evidence for:

- Repository Integrity;
- dependency integrity;
- lint/typecheck/unit tests/canonical Next.js build;
- fresh local database reset and migration bootstrap;
- pgTAP/RLS/database lint/generated-type drift;
- database runtime integration including preserved operational race tests;
- browser acceptance including durable customer persistence and customer-to-staff handoff.

Production Supabase provisioning remains a later backlog item and is not implied by source-code acceptance.
