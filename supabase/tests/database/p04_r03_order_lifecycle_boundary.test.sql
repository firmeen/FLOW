begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select has_column(
  'foodflow',
  'orders',
  'preparing_at',
  'orders retain durable preparing timestamp evidence'
);
select has_column(
  'foodflow',
  'orders',
  'ready_at',
  'orders retain durable ready timestamp evidence'
);
select has_column(
  'foodflow',
  'orders',
  'served_at',
  'orders retain durable served timestamp evidence'
);

select ok(
  exists (
    select 1
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'foodflow.orders'::regclass
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%status%PREPARING%READY%SERVED%'
  ),
  'persisted operational status constraint allows the R03 normal lifecycle states'
);
select ok(
  exists (
    select 1
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'foodflow.orders'::regclass
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%customer_status%PREPARING%COMING_TO_TABLE%SERVED%'
  ),
  'persisted customer status constraint allows the R03 customer mappings'
);

select ok(
  has_table_privilege('flow_runtime', 'foodflow.orders', 'UPDATE'),
  'internal runtime retains order update privilege behind authorization and RLS'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_events', 'INSERT'),
  'internal runtime can append lifecycle evidence'
);
select ok(
  not has_table_privilege('flow_runtime', 'foodflow.order_events', 'UPDATE'),
  'internal runtime cannot rewrite lifecycle evidence'
);
select ok(
  not has_table_privilege('flow_runtime', 'foodflow.order_events', 'DELETE'),
  'internal runtime cannot delete lifecycle evidence'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime cannot mutate operational lifecycle state'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.orders', 'UPDATE'),
  'customer entry role cannot mutate operational lifecycle state'
);
select ok(
  not has_table_privilege('anon', 'foodflow.orders', 'UPDATE'),
  'anon cannot mutate operational lifecycle state'
);
select ok(
  not has_table_privilege('authenticated', 'foodflow.orders', 'UPDATE'),
  'generic authenticated role cannot mutate operational lifecycle state'
);

insert into foodflow.orders (
  id,
  tenant_id,
  restaurant_id,
  branch_id,
  table_id,
  table_session_id,
  order_number,
  status,
  customer_status,
  subtotal_minor,
  currency,
  submission_key,
  submitted_at,
  accepted_at
)
values
  (
    '99000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a5',
    null,
    'P04-R03-DB-A1',
    'ACCEPTED',
    'CONFIRMED',
    10000,
    'THB',
    'p04-r03-db-a1',
    '2040-03-01T00:00:00Z'::timestamptz,
    '2040-03-01T00:00:01Z'::timestamptz
  ),
  (
    '99000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000ac',
    '00000000-0000-0000-0000-0000000000ad',
    null,
    'P04-R03-DB-A2',
    'ACCEPTED',
    'CONFIRMED',
    10000,
    'THB',
    'p04-r03-db-a2',
    '2040-03-01T00:00:00Z'::timestamptz,
    '2040-03-01T00:00:01Z'::timestamptz
  ),
  (
    '99000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-0000000000b1',
    '00000000-0000-0000-0000-0000000000b2',
    '00000000-0000-0000-0000-0000000000b3',
    '00000000-0000-0000-0000-0000000000b5',
    null,
    'P04-R03-DB-B1',
    'ACCEPTED',
    'CONFIRMED',
    10000,
    'THB',
    'p04-r03-db-b1',
    '2040-03-01T00:00:00Z'::timestamptz,
    '2040-03-01T00:00:01Z'::timestamptz
  );

grant usage on schema extensions to flow_runtime;
set local role flow_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);

with transitioned as (
  update foodflow.orders
  set
    status = 'PREPARING',
    customer_status = 'PREPARING',
    preparing_at = clock_timestamp()
  where tenant_id = private.current_tenant_id()
    and branch_id = private.current_branch_id()
    and id = '99000000-0000-4000-8000-000000000001'
    and status = 'ACCEPTED'
  returning id
)
select extensions.is(
  (select count(*)::bigint from transitioned),
  1::bigint,
  'own-branch runtime context can execute the legal conditional lifecycle update'
);

with attempted as (
  update foodflow.orders
  set status = 'PREPARING'
  where tenant_id = private.current_tenant_id()
    and branch_id = private.current_branch_id()
    and id = '99000000-0000-4000-8000-000000000002'
    and status = 'ACCEPTED'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'sibling-branch selector cannot mutate lifecycle state outside the active branch'
);

with attempted as (
  update foodflow.orders
  set status = 'PREPARING'
  where tenant_id = private.current_tenant_id()
    and branch_id = private.current_branch_id()
    and id = '99000000-0000-4000-8000-000000000003'
    and status = 'ACCEPTED'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'cross-tenant selector cannot mutate lifecycle state outside the active tenant'
);

reset role;

select * from finish();
rollback;
