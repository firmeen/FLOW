-- P04/R04 controlled order exception defense-in-depth hardening.
-- The application command plane already applies exact tenant + branch + order
-- predicates and order.manage authorization. These restrictive policies ensure
-- the flow_runtime role also cannot cross the active branch when touching the
-- order aggregate, persisted item snapshots, modifier snapshots, or event evidence.
-- Existing tenant-isolation policies remain in place and are ANDed with these
-- restrictive branch policies.

create policy orders_runtime_branch_scope
on foodflow.orders
as restrictive
for all
to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
)
with check (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
);

create policy order_items_runtime_branch_scope
on foodflow.order_items
as restrictive
for all
to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and exists (
    select 1
    from foodflow.orders parent_order
    where parent_order.tenant_id = order_items.tenant_id
      and parent_order.id = order_items.order_id
      and parent_order.tenant_id = private.current_tenant_id()
      and parent_order.branch_id = private.current_branch_id()
  )
)
with check (
  tenant_id = private.current_tenant_id()
  and exists (
    select 1
    from foodflow.orders parent_order
    where parent_order.tenant_id = order_items.tenant_id
      and parent_order.id = order_items.order_id
      and parent_order.tenant_id = private.current_tenant_id()
      and parent_order.branch_id = private.current_branch_id()
  )
);

create policy order_item_modifiers_runtime_branch_scope
on foodflow.order_item_modifiers
as restrictive
for all
to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and exists (
    select 1
    from foodflow.order_items parent_item
    join foodflow.orders parent_order
      on parent_order.tenant_id = parent_item.tenant_id
     and parent_order.id = parent_item.order_id
    where parent_item.tenant_id = order_item_modifiers.tenant_id
      and parent_item.id = order_item_modifiers.order_item_id
      and parent_order.tenant_id = private.current_tenant_id()
      and parent_order.branch_id = private.current_branch_id()
  )
)
with check (
  tenant_id = private.current_tenant_id()
  and exists (
    select 1
    from foodflow.order_items parent_item
    join foodflow.orders parent_order
      on parent_order.tenant_id = parent_item.tenant_id
     and parent_order.id = parent_item.order_id
    where parent_item.tenant_id = order_item_modifiers.tenant_id
      and parent_item.id = order_item_modifiers.order_item_id
      and parent_order.tenant_id = private.current_tenant_id()
      and parent_order.branch_id = private.current_branch_id()
  )
);

create policy order_events_runtime_branch_scope
on foodflow.order_events
as restrictive
for all
to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and exists (
    select 1
    from foodflow.orders parent_order
    where parent_order.tenant_id = order_events.tenant_id
      and parent_order.id = order_events.order_id
      and parent_order.tenant_id = private.current_tenant_id()
      and parent_order.branch_id = private.current_branch_id()
  )
)
with check (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and exists (
    select 1
    from foodflow.orders parent_order
    where parent_order.tenant_id = order_events.tenant_id
      and parent_order.id = order_events.order_id
      and parent_order.tenant_id = private.current_tenant_id()
      and parent_order.branch_id = private.current_branch_id()
  )
);

comment on policy orders_runtime_branch_scope on foodflow.orders is
  'P04/R04 restrictive branch boundary for internal operational order access.';
comment on policy order_items_runtime_branch_scope on foodflow.order_items is
  'P04/R04 restrictive branch boundary inherited through the parent order.';
comment on policy order_item_modifiers_runtime_branch_scope on foodflow.order_item_modifiers is
  'P04/R04 restrictive branch boundary inherited through item and parent order.';
comment on policy order_events_runtime_branch_scope on foodflow.order_events is
  'P04/R04 restrictive branch boundary for append-oriented order event evidence.';
