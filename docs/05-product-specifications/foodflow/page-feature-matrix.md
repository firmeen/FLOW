---
title: FoodFlow Pilot Page and Feature Matrix
document_id: FOODFLOW-SPEC-PAGE-FEATURES
status: proposed
owner: Product Architecture
last_reviewed: 2026-08-14
source_of_truth: true
---

# FoodFlow Pilot Page and Feature Matrix

| Page/surface | Topics | Required queries | Commands/actions | Minimum authorization | Current evidence |
|---|---|---|---|---|---|
| Launcher `/` | Demo entry only | Product-safe demo summary | Navigate | Public | Implemented demo; currently backed by global client state |
| Login `/login` | `S02-T01`, `S02-T02` | Session status | Sign in | Public/rate-limited | Temporary credential API; Auth.js target |
| Forgot/reset password | `S02-T01`, `S05-T01`, `S07-T01` | Token validity (generic) | Request/reset credential | Public capability | Target only |
| Customer table landing | `F01-T01`, `F01-T02`, `F05-T02` | Public branch/table state, guest session summary | Exchange QR, call staff | Secure QR/guest | Demo table code only |
| Customer menu | `F02-T01`, `F02-T06` | Published menu/public availability DTO | None | Guest/public branch context | Browser-local menu |
| Customer cart/quote | `F03-T01` | Server quote | Quote/requote | Active guest session | Client calculation only |
| Customer submit/order status | `F03-T02`, `F04-T03` | Guest-owned order projection | Submit order, retry | Guest bound to table session | Client repository only |
| Customer service/bill | `F05-T02`, `F08-T03`, `S05-T01` | Guest-owned session/outstanding projection | Call staff, request bill | Guest bound to table session | Client mutation only |
| Staff incoming orders | `F04-T01`, `F04-T02` | Branch order queue | Accept, reject, change | `order.view` + action permission | UI/client mutation |
| Staff tables | `F05-T01`, `F05-T02` | Branch table/session projection | Serve/acknowledge service | Branch membership + action permission | UI/client selector |
| Staff ready queue | `F04-T03`, `F07-T03` | Branch ready projection | Mark served | `order.serve` | UI/client mutation |
| Staff menu availability | `F02-T06` | Branch availability | Mark sold out/restore | `menu.manage` or scoped availability permission | UI/client mutation |
| Kitchen board | `F07-T01`, `F07-T02`, `F07-T03` | Assigned station tickets | Start, ready, problem, remake | `kitchen.view` + station/action permission | One-ticket client model |
| Cashier bill list | `F08-T03`, `F08-T04` | Locked bill/outstanding projection | Lock bill, create payment | `bill.view`, `bill.lock`, `payment.create` | Immediate manual payment demo |
| Cashier payment detail | `F08-T04` | Payment/attempt/allocation/refund projection | Retry action, refund, reconcile | Command-specific permission/step-up | Target ledger/provider flow |
| Admin overview | `F15-T01` | Server reporting projection | Filter only | `report.view` | Client-derived metrics |
| Admin menu management | `F02-T01`, `F02-T06` | Draft/published menu versions | Create/update/archive/publish | `menu.manage` | Mutable client catalog |
| Admin settings | `S01-T02`, `F16-T01` | Draft/published branch config | Draft/preview/publish | `configuration.manage/publish` | Mutable client settings |
| Admin audit | `S07-T01` | Scoped append-only audit search | Export when authorized | `audit.view` | Mutable client audit array |
| Admin staff/roles | `S02-T02`, `S02-T03` | Membership/role projection | Invite/suspend/assign role | `staff.manage`/`role.manage` | Target only |

## DTO ownership

- Pages consume purpose-specific DTOs; they do not receive database rows or provider payloads.
- Public menu DTOs contain display names, descriptions, images, prices, badges, and public availability only.
- Operational DTOs include aggregate `version` and permitted action descriptors so the UI can present conflicts without inferring authorization.
- Financial DTOs serialize minor-unit values as validated safe integers or decimal strings; JavaScript `bigint` is not serialized directly.
- Audit DTOs minimize before/after data and never contain credentials, tokens, full webhook bodies, or card data.

## Cutover acceptance

A page is not considered migrated until its read path is server-scoped, every mutation uses a validated command, authorization is rechecked on the server, the database enforces tenant/branch invariants, and production cannot fall back to the browser demo repository.

