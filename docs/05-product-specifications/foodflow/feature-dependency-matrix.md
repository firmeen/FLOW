---
title: FoodFlow Pilot Feature Dependency Matrix
document_id: FOODFLOW-SPEC-DEPENDENCIES
status: proposed
owner: Product Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot Feature Dependency Matrix

This contract limits the first production slice to the FoodFlow Dine-in Pilot. It is a dependency and release-order contract, not evidence that a capability is implemented.

## Status vocabulary

| Status | Meaning |
|---|---|
| `Demo` | A browser-local behavior exists and is useful only as a UI reference. |
| `Target` | The behavior is required but no passing production-path evidence exists. |
| `Implemented` | Server/database code exists but may not have passed all release gates. |
| `Tested` | The required automated tests passed against the intended runtime. |
| `Pilot-enabled` | Operations, secrets, provider sandbox, monitoring, and rollback gates also passed. |

Nothing in this document is currently `Pilot-enabled`.

## Dependency matrix

| Topic | Pilot capability | Hard requirements | Enforcement boundary | Current evidence | Required gate |
|---|---|---|---|---|---|
| `S01-T01` | Business workspace | None | Database tenant key, server resolver | One demo restaurant object | Two-tenant composite-FK and RLS tests pass |
| `S01-T02` | Branch profile/calendar | `S01-T01` | Database branch ownership, server calendar | Demo branch/settings | Wrong-branch denial and timezone tests pass |
| `S02-T01` | Owner authentication | `S01-T01` | Auth.js, account/session registry | Temporary shared email/password JWT | Auth.js login, revoke, expiry, reset-token tests pass |
| `S02-T02` | Staff authentication | `S02-T01`, `S02-T03` | Auth.js, active membership/device context | Same temporary internal account | Individual staff account and suspension tests pass |
| `S02-T03` | RBAC | `S01-T01`, `S02-T01` | Layout/query/command/database | Route authentication only | Permission and branch-scope negative tests pass |
| `S03-T01` | Versioned workflow | `S02-T03`, `S07-T01`, `S07-T02` | Domain command, optimistic version | One mixed client order status | Transition, stale-version, and replay tests pass |
| `S04-T01` | Guest customer/session | `S01-T02`, `F01-T02` | Server guest capability | Demo customer token in browser state | Guest ownership and other-table denial tests pass |
| `S05-T01` | Durable notification | `S01-T01`, `S07-T01` | Database + outbox worker | Toast/badge presentation only | Persistence, deduplication, retry tests pass |
| `S07-T01` | Audit log | `S01-T01`, trusted actor | Transactional append-only database record | Mutable browser audit array with actor fallbacks | Append-only and trusted-actor tests pass |
| `S07-T02` | Validation/errors | None | Request schema, domain rule, DB constraint | Ad-hoc client/domain checks | Unknown-field, constraint, and safe-error tests pass |
| `S08-T01` | Entitlement | `S01-T01`, `S07-T01` | Server route/query/command resolver | None | Published-version immutability and command denial tests pass |
| `F01-T01` | Direct storefront entry | `S01-T02`, `F02-T01`, `F02-T06` | Server public DTO | `/r/[restaurantSlug]/table/[tableCode]` demo | No internal data serialized; branch state resolved server-side |
| `F01-T02` | Secure QR entry | `S01-T02`, `F05-T01` | Hashed random token + guest cookie | Sequential table code in URL | Expiry, revoke, rotate, guessed-token tests pass |
| `F02-T01` | Menu catalog/version | `S01-T02`, `S07-T02` | Database/versioned publish | Browser-local catalog | Immutable published snapshot and branch-FK tests pass |
| `F02-T06` | Availability | `S01-T02`, `F02-T01` | Server query and checkout revalidation | Browser filters/settings | Overnight, cutoff, sold-out race tests pass |
| `F03-T01` | Cart and server quote | `S04-T01`, `F02-T01`, `F02-T06` | Guest-owned draft + server quote | Local cart and client totals | Price/modifier/expiry manipulation tests pass |
| `F03-T02` | Idempotent submission | `F03-T01`, `F05-T02`, `S07-T01` | Transactional command + unique key | Browser repository submission | Same operation returns same order; changed fingerprint rejects |
| `F04-T01` | Unified queue | `F03-T02`, `S02-T03` | Branch-scoped server query | Browser selector | Cross-tenant/branch queue denial tests pass |
| `F04-T02` | Acceptance/rejection | `F04-T01`, `S03-T01` | Versioned command | Client mutation | Concurrent acceptance and permission tests pass |
| `F04-T03` | Order lifecycle | `S03-T01`, `F04-T02` | Separate status axes + events | One mixed status field | All legal/illegal transition tests pass |
| `F05-T01` | Table registry | `S01-T02` | Composite tenant/branch ownership | Demo tables | Cross-tenant table reference fails in database |
| `F05-T02` | Table session | `F05-T01`, `S03-T01` | Database invariant + command | Browser session objects | One-active-session and close-invariant tests pass |
| `F07-T01` | Kitchen display | `F04-T02`, `F07-T02`, `S02-T03` | Branch/station-scoped query | Browser kitchen board | Unauthorized station and branch denial tests pass |
| `F07-T02` | Station routing | `F02-T01`, `F04-T02` | Acceptance transaction | One ticket per order in demo | Multi-station and missing-mapping tests pass |
| `F07-T03` | Item preparation state | `F07-T02`, `S03-T01` | Ticket/item commands | Client ticket mutation | Required-ticket readiness and remake-generation tests pass |
| `F08-T03` | Pay later/bill lock | `F05-T02`, `F04-T03`, `F08-T04` | Bill command + table invariant | Browser bill request | Post-lock order mutation and early-close tests deny |
| `F08-T04` | Payment ledger | `F08-T03`, `S02-T03`, `S07-T01` | Server ledger + Omise adapter | Immediate manual `RECORDED` payment | Verified evidence, allocation, refund, replay tests pass |
| `F15-T01` | Daily overview | `F04-T03`, `F08-T04` | Server reporting projection | Client selector metrics | Projection reconciles to ledger and order events |
| `F16-T01` | Versioned configuration | `S01-T02`, `S08-T01`, `S07-T01` | Draft/preview/publish command | Mutable browser settings | Published immutability and effective-time tests pass |

## Delivery order

1. Freeze the authentication, permission, workflow, API, event, and acceptance contracts in this directory.
2. Establish tenant/branch/RBAC/audit/outbox database foundations and negative tests.
3. Replace temporary internal authentication with Auth.js and bind the trusted actor to transaction context.
4. Cut customer menu, quote, guest session, and order submission to server/database authority.
5. Cut staff, kitchen, table, and bill workflows to versioned commands.
6. Enable Omise only after the provider-neutral ledger, webhook evidence, and reconciliation gates pass.
7. Move dashboard/configuration to server projections and published versions.

## Cutover rules

- Production routes must never fall back to `localStorage` operational state.
- Browser cart drafts may remain local, but prices, availability, discounts, taxes, totals, and acceptance are server authority.
- A topic is enabled only when its hard requirements and denial tests are also enabled.
- Payment emergency switches are independent from entitlement.
- Disabling a topic blocks new commands; it does not delete historical records.
- Stripe Billing is not a dependency of the FoodFlow order/payment pilot. Omise merchant payment must not import or reuse Stripe Billing credentials or ledgers.

