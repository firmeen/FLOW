# FLOW Roadmap

Status: REBASELINED DELIVERY ENTRY POINT

FLOW no longer uses the historical Phase/Round sequence as active implementation authority.

The current delivery roadmap is defined by the source-code rebaseline documents under:

- `docs/07-delivery/rebaseline/SYSTEM_CURRENT_STATE.md`
- `docs/07-delivery/rebaseline/SYSTEM_GAP_MATRIX.md`
- `docs/07-delivery/rebaseline/SYSTEM_DECISIONS.md`
- `docs/07-delivery/rebaseline/PRODUCT_BEACHHEAD.md`
- `docs/07-delivery/rebaseline/ARCHITECTURE_BASELINE.md`
- `docs/07-delivery/rebaseline/DELIVERY_POLICY.md`
- `docs/07-delivery/rebaseline/REBASELINE_BACKLOG.md`

## Current product beachhead

FoodFlow dine-in table ordering is the first end-to-end production beachhead. The target authority is:

`verified table entry -> live storefront -> durable cart -> durable order -> staff operational plane -> kitchen/service -> cashier/payment -> session closure/receipt`

The ordered implementation backlog is maintained in `docs/07-delivery/rebaseline/REBASELINE_BACKLOG.md`. Work is selected by capability dependency and acceptance evidence, not by PXX/RXX progression.

Historical Phase/Round files and migrations remain repository evidence and must not be rewritten solely to remove their historical naming.
