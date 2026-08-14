---
title: FoodFlow Pilot Navigation and Page Inventory
document_id: FOODFLOW-SPEC-NAVIGATION
status: proposed
owner: Product Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot Navigation and Page Inventory

## Route inventory

| Route | Current surface | Target audience/guard | Target data contract | Status |
|---|---|---|---|---|
| `/` | Demo experience launcher | Public evaluator entry; no operational dataset | Static/product-safe launcher summary | Demo exists; production data boundary target |
| `/login` | Temporary internal login | Public form; Auth.js session redirect | Identity form only | Temporary implementation |
| `/r/[restaurantSlug]/table/[tableCode]` | Customer table experience | Development fixture only after secure QR cutover | Demo data only in non-production | Demo exists; not authorization-safe |
| `/r/[businessSlug]/[branchSlug]/table/[qrToken]` | Not present | Public QR exchange to guest session | Public storefront DTO + guest-owned session/orders | Target |
| `/staff` | Orders/tables/service/ready/menu | Auth.js + active membership + branch + action permissions | Branch-scoped operational query DTOs | UI exists; server authority target |
| `/kitchen` | Kitchen board | Auth.js + `kitchen.view` + branch/station assignment | Station ticket DTOs | UI exists; server authority target |
| `/cashier` | Cashier/bill/payment | Auth.js + `bill.view`/`payment.create` | Bill/payment projections; no provider secrets | UI exists; ledger target |
| `/admin` | Owner dashboard/menu/settings/audit | Auth.js + panel-specific permissions | Server projections and versioned config | UI exists; server authority target |
| `/forgot-password` | Not present | Public, rate-limited | Recovery request only | Target; delivery provider unproven |
| `/reset-password` | Not present | One-use reset capability | Credential reset only | Target |
| `/api/auth/[...nextauth]` | Not present | Auth.js | Auth/session contract | Target |
| `/api/customer/*` | Not present | Guest session capability | Public/guest DTOs and commands | Target |
| `/api/operations/*` | Not present | Internal session + permission | Branch-scoped commands/queries | Target |
| `/api/management/*` | Not present | Owner/manager permission | Configuration/report/audit DTOs | Target |
| `/api/webhooks/omise/merchant-payments` | Not present | Provider verification | Durable redacted webhook evidence | Target |

## Navigation rules

- Customer pages never render links, menus, role switchers, counts, or identifiers from internal portals.
- Internal navigation shows only routes supported by the resolved membership, permission, entitlement, and branch context. Hidden navigation does not replace server authorization.
- A direct URL to a disallowed internal route returns login or a generic forbidden page; it never falls through to another role.
- The current role switcher and one-account cross-role access are development demo aids and must be disabled or removed before production cutover.
- Public QR failure uses one generic unavailable state for unknown, expired, revoked, wrong-purpose, or wrong-branch tokens.
- Customer logo/back navigation remains within the current table experience and never exposes the internal launcher.
- Query-string return paths are same-origin and allowlisted to internal route roots.
- Branch switching is a server-validated membership operation, not a query-string authority.

## Layout/data boundaries

| Boundary | Allowed providers/data | Forbidden data |
|---|---|---|
| Root layout | Theme, fonts, error/observability shell | Whole-restaurant store, orders, staff, payments, audit, kitchen tickets |
| Customer layout | Public storefront and guest-session DTOs | Cost/internal availability reason, other tables, staff, audit, merchant credentials |
| Operations layout | Auth/session summary, selected branch, permitted navigation | Other tenant/branch data, billing provider secrets |
| Management layout | Auth/session, scoped permissions/entitlements | Platform/other tenant data |

## Route outcome contract

| Condition | Outcome |
|---|---|
| No internal session | Redirect to `/login?next=<safe-path>` |
| Invalid/revoked/expired session | Revoke cookie/session and redirect to login |
| Authenticated but missing membership/permission | Generic forbidden surface with correlation ID |
| Tenant or branch suspended | Operational-unavailable surface; mutations denied |
| Guest token/session invalid | Generic table experience unavailable; no existence disclosure |
| Record outside scope | `NOT_FOUND_OR_FORBIDDEN`; same external response for absent and unauthorized |
| Stale aggregate | Conflict feedback and refresh action; no silent overwrite |

## Accessibility and resilience

Every route has a meaningful title, loading state, error boundary, keyboard-visible focus, and mobile layout. Mutating controls remain disabled while their operation is pending, preserve user-entered safe data on recoverable errors, and expose status changes through accessible live regions without relying on color alone.
