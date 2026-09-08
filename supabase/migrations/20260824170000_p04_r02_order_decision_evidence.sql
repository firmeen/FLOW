-- P04/R02 initial staff order decision evidence hardening.
-- Existing foodflow.orders decision columns and foodflow.order_events already
-- provide the required persistence shape. Keep lifecycle scope narrow and make
-- the existing event history append-only for the application runtime.

revoke update, delete on foodflow.order_events from flow_runtime;
grant select, insert on foodflow.order_events to flow_runtime;

comment on table foodflow.order_events is
  'Append-only operational order event history for application runtime. P04/R02 records the immutable initial ACCEPT/REJECT decision here while current order state remains on foodflow.orders.';
