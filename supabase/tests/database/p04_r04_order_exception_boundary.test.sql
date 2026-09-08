begin;

create extension if not exists pgtap with schema extensions;

select plan(23);

select ok(
  exists (
    select 1
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'foodflow.orders'::regclass
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%status%'
      and position('CHANGED' in pg_get_constraintdef(constraint_row.oid)) > 0
      and position('CANCELLED' in pg_get_constraintdef(constraint_row.oid)) > 0
  ),
  'orders persisted status constraint supports CHANGED and CANCELLED'
);
select ok(
  exists (
    select 1
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'foodflow.orders'::regclass
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%customer_status%SENT%CANCELLED%'
  ),
  'orders customer status constraint supports review-pending SENT and CANCELLED'
);

select ok(
  has_table_privilege('flow_runtime', 'foodflow.orders', 'UPDATE'),
  'internal runtime retains order mutation privilege behind command authorization and RLS'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_items', 'UPDATE'),
  'internal runtime can update persisted order item snapshots behind RLS'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_items', 'DELETE'),
  'internal runtime can remove persisted order item snapshots behind RLS'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_item_modifiers', 'DELETE'),
  'internal runtime can remove modifier snapshots only as part of controlled item removal'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_events', 'INSERT'),
  'internal runtime can append exception evidence'
);
select ok(
  not has_table_privilege('flow_runtime', 'foodflow.order_events', 'UPDATE'),
  'internal runtime cannot rewrite exception evidence'
);
select ok(
  not has_table_privilege('flow_runtime', 'foodflow.order_events', 'DELETE'),
  'internal runtime cannot delete exception evidence'
);

select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime cannot mutate submitted operational orders'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.order_items', 'UPDATE'),
  'customer runtime cannot amend persisted order item snapshots'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.order_items', 'DELETE'),
  'customer runtime cannot remove persisted order item snapshots'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.order_events', 'INSERT'),
  'customer runtime cannot forge staff exception evidence'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.orders', 'UPDATE'),
  'customer entry role cannot mutate operational orders'
);
select ok(
  not has_table_privilege('anon', 'foodflow.orders', 'UPDATE')
  and not has_table_privilege('authenticated', 'foodflow.orders', 'UPDATE'),
  'generic public roles cannot mutate operational orders'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.orders'::regclass
      and polname = 'orders_runtime_branch_scope'
      and not polpermissive
  ),
  'orders carry a restrictive runtime branch policy'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_items'::regclass
      and polname = 'order_items_runtime_branch_scope'
      and not polpermissive
  ),
  'order items inherit a restrictive runtime branch policy through their parent order'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_item_modifiers'::regclass
      and polname = 'order_item_modifiers_runtime_branch_scope'
      and not polpermissive
  ),
  'order item modifiers inherit restrictive runtime branch scope'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_events'::regclass
      and polname = 'order_events_runtime_branch_scope'
      and not polpermissive
  ),
  'order events carry restrictive runtime branch scope'
);

insert into foodflow.orders (
  id, tenant_id, restaurant_id, branch_id, table_id, table_session_id,
  order_number, status, customer_status, subtotal_minor, currency,
  submission_key, submitted_at, accepted_at
)
values
  (
    'aa000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a5',
    null,
    'P04-R04-DB-A1', 'ACCEPTED', 'CONFIRMED', 10000, 'THB',
    'p04-r04-db-a1', '2040-04-01T00:00:00Z'::timestamptz,
    '2040-04-01T00:00:01Z'::timestamptz
  ),
  (
    'aa000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000ac',
    '00000000-0000-0000-0000-0000000000ad',
    null,
    'P04-R04-DB-A2', 'ACCEPTED', 'CONFIRMED', 10000, 'THB',
    'p04-r04-db-a2', '2040-04-01T00:00:00Z'::timestamptz,
    '2040-04-01T00:00:01Z'::timestamptz
  );

insert into foodflow.order_items (
  id, tenant_id, order_id, menu_item_id, menu_item_name, menu_item_thai_name,
  quantity, unit_price_minor, line_total_minor, special_request, preparation_station
)
values
  (
    'ab000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    'aa000000-0000-4000-8000-000000000001',
    null, 'A1 snapshot', null, 1, 10000, 10000, null, 'KITCHEN'
  ),
  (
    'ab000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    'aa000000-0000-4000-8000-000000000002',
    null, 'A2 snapshot', null, 1, 10000, 10000, null, 'KITCHEN'
  );

grant usage on schema extensions to flow_runtime;
set local role flow_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);

with amended as (
  update foodflow.orders
  set status = 'CHANGED', customer_status = 'SENT'
  where id = 'aa000000-0000-4000-8000-000000000001'
    and status = 'ACCEPTED'
  returning id
)
select extensions.is(
  (select count(*)::bigint from amended),
  1::bigint,
  'active-branch runtime can mutate its own eligible order aggregate'
);

with attempted as (
  update foodflow.orders
  set status = 'CANCELLED', customer_status = 'CANCELLED'
  where id = 'aa000000-0000-4000-8000-000000000002'
    and status = 'ACCEPTED'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'restrictive order RLS hides sibling-branch mutation targets'
);

with item_update as (
  update foodflow.order_items
  set special_request = 'R04 own branch edit'
  where id = 'ab000000-0000-4000-8000-000000000001'
  returning id
)
select extensions.is(
  (select count(*)::bigint from item_update),
  1::bigint,
  'active-branch runtime can mutate an item belonging to its own parent order'
);

with attempted as (
  update foodflow.order_items
  set special_request = 'cross branch attempt'
  where id = 'ab000000-0000-4000-8000-000000000002'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'restrictive child RLS hides sibling-branch order item mutation targets'
);

reset role;

select * from finish();
rollback;
