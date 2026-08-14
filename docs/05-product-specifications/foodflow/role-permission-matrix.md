---
title: FoodFlow Pilot Role and Permission Matrix
document_id: FOODFLOW-SPEC-RBAC
status: proposed
owner: Security Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot Role and Permission Matrix

Roles are presets; permissions are the authorization contract. A role name alone never authorizes a route, query, or command.

## Scope rules

- Every internal decision requires an active account, non-revoked session, active organization, active membership, and allowed branch scope.
- `OWNER` and `MANAGER` are organization roles but still require an explicitly selected active branch for branch commands.
- `FLOOR_STAFF`, `KITCHEN_STAFF`, and `CASHIER` are restricted to membership branches and assignments.
- Customer guest capabilities are not internal roles and never grant internal permissions.
- Platform support is outside this pilot. Any future access requires a time-bound JIT grant, reason, approver, scope, and audit.
- Sensitive commands are checked in the route/layout, query or command handler, domain command, and RLS/database context as applicable.

## Permission matrix

`A` = allowed in assigned scope, `M` = allowed with manager/owner reason or approval, `-` = denied.

| Permission | OWNER | MANAGER | FLOOR_STAFF | KITCHEN_STAFF | CASHIER |
|---|:---:|:---:|:---:|:---:|:---:|
| `order.view` | A | A | A | A | A |
| `order.accept` | A | A | A | - | - |
| `order.reject` | A | A | A | - | - |
| `order.change` | A | A | A | - | - |
| `order.cancel` | A | A | M | - | - |
| `order.serve` | A | A | A | - | - |
| `kitchen.view` | A | A | - | A | - |
| `kitchen.start` | A | A | - | A | - |
| `kitchen.ready` | A | A | - | A | - |
| `kitchen.problem` | A | A | - | A | - |
| `kitchen.remake` | A | A | M | A | - |
| `service.view` | A | A | A | - | - |
| `service.manage` | A | A | A | - | - |
| `bill.view` | A | A | A | - | A |
| `bill.lock` | A | A | A | - | A |
| `payment.create` | A | A | - | - | A |
| `payment.refund` | M | M | - | - | M |
| `payment.reconcile` | A | A | - | - | A |
| `table.close` | A | A | - | - | A |
| `table.override_close` | M | M | - | - | - |
| `menu.view` | A | A | A | A | A |
| `menu.manage` | A | A | - | - | - |
| `configuration.manage` | A | A | - | - | - |
| `configuration.publish` | A | M | - | - | - |
| `staff.manage` | A | M | - | - | - |
| `role.manage` | A | - | - | - | - |
| `audit.view` | A | A | - | - | - |
| `report.view` | A | A | - | - | A |
| `entitlement.view` | A | A | - | - | - |
| `entitlement.manage` | A | - | - | - | - |

## Command-specific conditions

| Command | Additional authorization conditions |
|---|---|
| Accept/reject/change order | Order belongs to active tenant/branch; expected version matches; reason required for reject/change |
| Kitchen mutation | Ticket belongs to an assigned station and branch; expected ticket/item version matches |
| Serve order | All required tickets ready; actor is assigned to the branch |
| Lock bill | Table session active; no unresolved order-change exception; branch policy permits pay later |
| Create payment | Locked bill version and amount are server-derived; method capability active |
| Refund | Step-up authentication target; non-empty reason; amount within refundable balance; threshold approval where configured |
| Close table | Outstanding is zero and all required fulfillment is complete, unless authorized audited override |
| Publish config/entitlement | Draft validated; dependency impact preview acknowledged; publication creates immutable version |

## Route baseline

| Route | Minimum permission set |
|---|---|
| `/staff` | `order.view` plus `service.view`; individual actions use their command permission |
| `/kitchen` | `kitchen.view` plus station assignment |
| `/cashier` | `bill.view` and `payment.create` |
| `/admin` | `report.view`; each management panel checks its own permission |

Cross-role navigation does not grant permission. The current one-account session and role switcher are demo behavior and must not survive production cutover.

## Denial contract

Authorization denies with a stable code (`UNAUTHENTICATED`, `SESSION_REVOKED`, `TENANT_INACTIVE`, `MEMBERSHIP_INACTIVE`, `BRANCH_FORBIDDEN`, `PERMISSION_DENIED`, or `STEP_UP_REQUIRED`) and a correlation ID. Responses do not reveal whether an out-of-scope record exists. Every high-risk denial is observable without logging tokens or sensitive payloads.

