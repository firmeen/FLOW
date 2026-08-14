---
title: FoodFlow Pilot Bundle, Topic and Entitlement Matrix
document_id: FOODFLOW-SPEC-ENTITLEMENTS
status: proposed
owner: Product Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot Bundle, Topic and Entitlement Matrix

## Pilot bundle

The proposed pilot bundle code is `FOODFLOW_DINE_IN_PILOT_V1`. Publication creates an immutable entitlement version per organization. This code is a contract only; no entitlement resolver is implemented in the current application.

| Topic | Type | Pilot default | Required by | Hard dependencies | Command enforcement |
|---|---|---:|---|---|---|
| `S01-T01` Workspace | Core | On | All topics | None | Tenant must be active |
| `S01-T02` Branch profile | Core | On | All branch operations | `S01-T01` | Branch must be active and belong to tenant |
| `S02-T01` Owner auth | Core | On | Internal portal | `S01-T01` | Active account/session required |
| `S02-T02` Staff auth | Dependency | On | Staff/KDS/cashier | `S02-T01`, `S02-T03` | Active personal account/membership required |
| `S02-T03` RBAC | Core | On | All internal commands | `S01-T01` | Permission + tenant + branch scope required |
| `S03-T01` Workflow | Core | On | Order/kitchen/bill | `S02-T03`, `S07-T01` | Workflow version and expected aggregate version required |
| `S04-T01` Guest session | Core | On | Customer entry/order | `F01-T02` | Active guest capability required |
| `S05-T01` Notification | Core | On | Service/order/payment feedback | `S07-T01` | Durable notification + dedup key |
| `S07-T01` Audit | Core | On | Critical commands | `S01-T01` | State + audit written atomically |
| `S07-T02` Validation | Core | On | All APIs | None | Parsed schema + DB invariants |
| `S08-T01` Entitlement | Core | On | Optional topic decisions | `S01-T01`, `S07-T01` | Published version resolved server-side |
| `F01-T01` Direct entry | Core | On | Storefront | `S01-T02`, `F02-T01` | Public DTO only |
| `F01-T02` Secure QR | Core | On | Dine-in guest | `F05-T01` | Hashed token, purpose, expiry, revoke |
| `F02-T01` Menu catalog | Core | On | Storefront/order | `S01-T02` | Published menu version |
| `F02-T06` Availability | Core | On | Quote/submission | `F02-T01`, `S01-T02` | Revalidated on server |
| `F03-T01` Cart/quote | Core | On | Submission | `S04-T01`, `F02-T06` | Server quote/version/expiry |
| `F03-T02` Submission | Core | On | Order workflow | `F03-T01`, `F05-T02` | Stable operation ID + fingerprint |
| `F04-T01` Unified queue | Core | On | Staff operations | `F03-T02`, `S02-T03` | Branch-scoped query |
| `F04-T02` Acceptance | Core | On | Kitchen routing | `F04-T01`, `S03-T01` | `order.accept`/`order.reject` |
| `F04-T03` Lifecycle | Core | On | Fulfillment/billing | `S03-T01` | Versioned transition command |
| `F05-T01` Table/QR | Core | On | Dine-in | `S01-T02` | Tenant/branch/table invariant |
| `F05-T02` Table session | Core | On | Orders/pay later | `F05-T01`, `F04-T03` | Active-session and close invariants |
| `F07-T01` KDS | Choose | On | Pilot operations | `F04-T02`, `F07-T02` | `kitchen.view` and station scope |
| `F07-T02` Routing | Dependency | On | KDS | `F02-T01`, `F04-T02` | Complete station mapping |
| `F07-T03` Item status | Dependency | On | Readiness | `F07-T02`, `S03-T01` | Versioned item/ticket commands |
| `F08-T03` Pay later | Choose | On | Dine-in bill | `F04-T03`, `F05-T02`, `F08-T04`, `S02-T03` | Bill lock and close policy |
| `F08-T04` Payment ledger | Core | On | Pay later | `S07-T01`, `S02-T03` | Provider evidence + financial invariants |
| `F15-T01` Daily overview | Core | On | Owner dashboard | `F04-T03`, `F08-T04` | Read-only server projection |
| `F16-T01` Configuration | Core | On | Branch operation | `S08-T01`, `S07-T01` | Draft/preview/publish version |

## Entitlement version contract

Each published entitlement version contains:

- `organization_id`, version number, publication/effective timestamps, publisher actor, and superseded version;
- every resolved topic and whether it came from bundle, dependency, trial, or approved branch override;
- the dependency source and reason for any automatically enabled topic;
- a content fingerprint used to reject duplicate or changed publication requests;
- no mutable topic rows after publication.

Resolution order is organization status, active entitlement version, branch override, dependency closure, conflict validation, and emergency safety switch. A branch override may narrow access but may not bypass a hard dependency or security control.

## Safety switches

| Switch | Default | Relationship to entitlement |
|---|---:|---|
| `OMISE_MERCHANT_PAYMENTS_ENABLED` | `false` | Global emergency gate after `F08-T04` entitlement; both must allow |
| `STRIPE_BILLING_ENABLED` | `false` | FLOW SaaS Billing only; never gates FoodFlow order fulfillment directly |
| Cash/manual payment capability | Off | Database capability and permission, not an environment fallback |

## Disable/upgrade behavior

- Preview returns affected routes, commands, active records, dependencies, and operator warnings before publication.
- Disabling a topic prevents new commands at the server boundary while preserving read/export rules and historical data.
- Published versions are append-only. Rollback publishes a new version referencing the prior one.
- In-flight workflow records retain their workflow, price, and entitlement-version references where required for auditability.
- UI hiding is not enforcement; route, query, command, and database boundaries must independently deny.

