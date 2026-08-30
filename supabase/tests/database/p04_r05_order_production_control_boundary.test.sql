begin;

create extension if not exists pgtap with schema extensions;

select plan(22);

select has_column('foodflow', 'orders', 'priority_code', 'orders persist bounded current priority');
select has_column('foodflow', 'orders', 'priority_reason', 'orders persist current priority reason');
select has_column('foodflow', 'orders', 'deferred_at', 'orders persist active defer timestamp');
select has_column('foodflow', 'orders', 'deferred_until', 'orders persist optional bounded defer horizon');
select has_column('foodflow', 'orders', 'defer_reason', 'orders persist current defer reason');
select has_column('foodflow', 'orders', 'remake_count', 'orders persist bounded remake count');
select has_column('foodflow', 'orders', 'last_remake_reason', 'orders persist last remake reason');
select has_index('foodflow', 'orders', 'orders_branch_production_rank_idx', 'queue has focused production ranking index');

select ok(
  has_table_privilege('flow_runtime', 'foodflow.orders', 'UPDATE'),
  'internal runtime retains controlled order mutation privilege behind authorization and RLS'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_events', 'INSERT')
  and not has_table_privilege('flow_runtime', 'foodflow.order_events', 'UPDATE')
  and not has_table_privilege('flow_runtime', 'foodflow.order_events', 'DELETE'),
  'internal runtime may append but cannot rewrite production control evidence'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime cannot mutate production controls'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.orders', 'UPDATE'),
  'customer entry role cannot mutate production controls'
);
select ok(
  not has_table_privilege('anon', 'foodflow.orders', 'UPDATE')
  and not has_table_privilege('authenticated', 'foodflow.orders', 'UPDATE'),
  'generic public roles cannot mutate production controls'
);

insert into foodflow.orders (
  id, tenant_id, restaurant_id, branch_id, table_id, table_session_id,
  order_number, status, customer_status, subtotal_minor, currency,
  submission_key, submitted_at, accepted_at
)
values
  (
    'bc000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a5',
    null,
    'P04-R05-DB-A1', 'ACCEPTED', 'CONFIRMED', 10000, 'THB',
    'p04-r05-db-a1', '2040-05-01T00:00:00Z'::timestamptz,
    '2040-05-01T00:00:01Z'::timestamptz
  ),
  (
    'bc000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000ac',
    '00000000-0000-0000-0000-0000000000ad',
    null,
    'P04-R05-DB-A2', 'ACCEPTED', 'CONFIRMED', 10000, 'THB',
    'p04-r05-db-a2', '2040-05-01T00:00:00Z'::timestamptz,
    '2040-05-01T00:00:01Z'::timestamptz
  );

select throws_ok(
  $$update foodflow.orders set priority_code = 'CRITICAL' where id = 'bc000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'invalid priority code is rejected by the database contract'
);

grant usage on schema extensions to flow_runtime;
set local role flow_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);

with changed as (
  update foodflow.orders
  set priority_code = 'URGENT',
      priority_reason = 'WAIT_TIME',
      prioritized_at = clock_timestamp(),
      prioritized_by_staff = private.current_actor_id()
  where id = 'bc000000-0000-4000-8000-000000000001'
  returning id
)
select extensions.is((select count(*)::bigint from changed), 1::bigint, 'correct branch can set bounded priority metadata');

with attempted as (
  update foodflow.orders
  set priority_code = 'URGENT',
      priority_reason = 'WAIT_TIME',
      prioritized_at = clock_timestamp(),
      prioritized_by_staff = private.current_actor_id()
  where id = 'bc000000-0000-4000-8000-000000000002'
  returning id
)
select extensions.is((select count(*)::bigint from attempted), 0::bigint, 'sibling branch cannot mutate production controls');

with changed as (
  update foodflow.orders
  set defer_reason = 'CAPACITY',
      deferred_at = clock_timestamp(),
      deferred_by_staff = private.current_actor_id()
  where id = 'bc000000-0000-4000-8000-000000000001'
  returning id
)
select extensions.is((select count(*)::bigint from changed), 1::bigint, 'correct branch can persist coherent defer metadata');

with changed as (
  update foodflow.orders
  set remake_count = 1,
      last_remake_reason = 'QUALITY_ISSUE',
      remake_requested_at = clock_timestamp(),
      remake_requested_by_staff = private.current_actor_id()
  where id = 'bc000000-0000-4000-8000-000000000001'
  returning id
)
select extensions.is((select count(*)::bigint from changed), 1::bigint, 'correct branch can persist bounded remake evidence');

reset role;

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_priority_state_check'
  ),
  'priority metadata has coherence constraint'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_defer_state_check'
  ),
  'defer metadata has coherence constraint'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_remake_count_check'
  ),
  'remake count has database bound'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.orders'::regclass
      and polname = 'orders_runtime_branch_scope'
      and not polpermissive
  ),
  'restrictive branch RLS remains active on order aggregate'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_events'::regclass
      and polname = 'order_events_runtime_branch_scope'
      and not polpermissive
  ),
  'restrictive branch RLS remains active on event evidence'
);

select * from finish();
rollback;
