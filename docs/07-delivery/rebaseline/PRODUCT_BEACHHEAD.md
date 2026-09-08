# FLOW Product Beachhead

Status: REBASELINE AUTHORITY

## Beachhead

The first production-complete FLOW workflow is **FoodFlow dine-in table ordering**.

The end-to-end slice is:

`QR table entry -> verified customer capability -> live storefront/menu -> durable cart -> replay-safe order submission -> staff durable queue -> accept/reject -> prepare -> ready -> served -> bill/payment -> session closure`.

This beachhead is selected because it exercises the Shared Platform foundations that every later vertical needs: tenant/branch isolation, role authority, public capability access, durable command processing, concurrency, audit evidence, operational queues, payments, and owner visibility.

## Required actors

- Customer — no account required; authority is the scoped table capability.
- Floor staff — branch-scoped staff operations.
- Kitchen — branch-scoped production operations.
- Cashier — branch-scoped payment operations.
- Owner/admin — tenant-scoped management and configuration.

## Completion standard

The beachhead is not complete because screens exist. It is complete only when one real order can move from QR entry through payment/session closure without relying on `useFoodFlow()`, demo seed mutations, browser-owned status transitions, or manual database intervention.

## UX quality bar

FoodFlow should feel calm, premium, and operationally obvious:

- Customer experience: hospitality-first, minimal decisions, strong menu photography, clear price/modifier hierarchy, persistent cart confidence, and explicit restaurant confirmation state.
- Staff experience: scan-first order cards, visible urgency/defer/remake state, low-friction primary actions, clear conflicts, and durable refresh behavior.
- Kitchen: glanceable lanes, station ownership, elapsed-time pressure without visual noise, and touch-safe actions.
- Cashier: session-first billing, immutable money evidence, obvious payment state, and guarded void/refund actions.
- Owner: dense but quiet operational visibility, not a decorative dashboard.

## Out of beachhead

CareFlow and JobFlow remain product targets but do not drive the first implementation sequence. Shared Foundation decisions must avoid FoodFlow-specific coupling where a reusable tenant, identity, permission, payment, audit, notification, or resource concept is clearly platform-wide.

Advanced FoodFlow capabilities such as loyalty, CRM automation, complex promotions, multi-location analytics, AI recommendations, and deep inventory optimization follow only after the beachhead is durable end to end.
