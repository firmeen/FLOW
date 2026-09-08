begin;

create extension if not exists pgtap with schema extensions;

select plan(27);

select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_priority_state_check'
  ),
  'priority current-state coherence constraint remains installed'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_defer_state_check'
  ),
  'defer current-state coherence constraint remains installed'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_remake_count_check'
  ),
  'remake count bound remains installed'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'foodflow.orders'::regclass
      and conname = 'orders_remake_evidence_check'
  ),
  'remake evidence coherence constraint remains installed'
);
select has_index(
  'foodflow',
  'orders',
  'orders_branch_production_rank_idx',
  'production queue ranking index survives the complete P04 migration chain'
);

select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.orders'::regclass
      and polname = 'orders_runtime_branch_scope'
      and not polpermissive
  ),
  'orders retain restrictive runtime branch scope'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_items'::regclass
      and polname = 'order_items_runtime_branch_scope'
      and not polpermissive
  ),
  'order items retain restrictive parent-order branch scope'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_item_modifiers'::regclass
      and polname = 'order_item_modifiers_runtime_branch_scope'
      and not polpermissive
  ),
  'order item modifiers retain restrictive inherited branch scope'
);
select ok(
  exists (
    select 1 from pg_policy
    where polrelid = 'foodflow.order_events'::regclass
      and polname = 'order_events_runtime_branch_scope'
      and not polpermissive
  ),
  'order events retain restrictive runtime branch scope'
);

select ok(
  has_table_privilege('flow_runtime', 'foodflow.orders', 'UPDATE'),
  'internal runtime retains order update privilege behind authorization and RLS'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_events', 'INSERT')
  and not has_table_privilege('flow_runtime', 'foodflow.order_events', 'UPDATE')
  and not has_table_privilege('flow_runtime', 'foodflow.order_events', 'DELETE'),
  'runtime may append but cannot rewrite or delete operational event evidence'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime cannot mutate staff operational order state'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.order_events', 'INSERT'),
  'customer runtime cannot forge staff operational event evidence'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.orders', 'UPDATE'),
  'customer entry role cannot mutate staff operational order state'
);
select ok(
  not has_table_privilege('anon', 'foodflow.orders', 'UPDATE')
  and not has_table_privilege('authenticated', 'foodflow.orders', 'UPDATE'),
  'generic public database roles cannot mutate operational orders'
);

insert into foodflow.orders (
  id, tenant_id, restaurant_id, branch_id, table_id, table_session_id,
  order_number, status, customer_status, subtotal_minor, currency,
  submission_key, submitted_at, accepted_at
)
values
  (
    'ce000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a5',
    null,
    'P04-R06-DB-A1', 'ACCEPTED', 'CONFIRMED', 10000, 'THB',
    'p04-r06-db-a1', '2040-06-01T00:00:00Z'::timestamptz,
    '2040-06-01T00:00:01Z'::timestamptz
  ),
  (
    'ce000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000ac',
    '00000000-0000-0000-0000-0000000000ad',
    null,
    'P04-R06-DB-A2', 'ACCEPTED', 'CONFIRMED', 10000, 'THB',
    'p04-r06-db-a2', '2040-06-01T00:00:00Z'::timestamptz,
    '2040-06-01T00:00:01Z'::timestamptz
  );

select throws_ok(
  $$update foodflow.orders set priority_code = 'CRITICAL' where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'unknown priority code is rejected'
);
select throws_ok(
  $$update foodflow.orders
    set priority_reason = 'WAIT_TIME', prioritized_at = clock_timestamp(), prioritized_by_staff = '30000000-0000-4000-8000-0000000000a2'
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'NORMAL priority cannot retain urgent current-state evidence'
);
select throws_ok(
  $$update foodflow.orders
    set priority_code = 'URGENT'
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'URGENT priority requires reason time and actor evidence'
);
select throws_ok(
  $$update foodflow.orders
    set defer_reason = 'CAPACITY'
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'defer reason cannot exist without current defer time and actor evidence'
);
select throws_ok(
  $$update foodflow.orders
    set defer_reason = 'CAPACITY',
        deferred_at = '2040-06-01T02:00:00Z'::timestamptz,
        deferred_until = '2040-06-01T01:00:00Z'::timestamptz,
        deferred_by_staff = '30000000-0000-4000-8000-0000000000a2'
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'deferred-until cannot precede deferred-at'
);
select throws_ok(
  $$update foodflow.orders
    set remake_count = 4,
        last_remake_reason = 'QUALITY_ISSUE',
        remake_requested_at = clock_timestamp(),
        remake_requested_by_staff = '30000000-0000-4000-8000-0000000000a2'
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'remake count cannot exceed the bounded maximum'
);
select throws_ok(
  $$update foodflow.orders
    set remake_count = 1
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23514',
  null,
  'positive remake count requires reason time and actor evidence'
);
select throws_ok(
  $$update foodflow.orders
    set priority_code = 'URGENT',
        priority_reason = 'WAIT_TIME',
        prioritized_at = clock_timestamp(),
        prioritized_by_staff = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
    where id = 'ce000000-0000-4000-8000-000000000001'$$,
  '23503',
  null,
  'current production-control actor must reference a real internal user'
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
  where id = 'ce000000-0000-4000-8000-000000000001'
  returning id
)
select extensions.is(
  (select count(*)::bigint from changed),
  1::bigint,
  'active-branch runtime can mutate its own production-control aggregate'
);

with attempted as (
  update foodflow.orders
  set priority_code = 'URGENT',
      priority_reason = 'WAIT_TIME',
      prioritized_at = clock_timestamp(),
      prioritized_by_staff = private.current_actor_id()
  where id = 'ce000000-0000-4000-8000-000000000002'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'restrictive branch RLS hides sibling-branch production-control mutation targets'
);

with inserted as (
  insert into foodflow.order_events (
    tenant_id, branch_id, order_id, event_type, from_status, to_status, actor_id, reason
  )
  values (
    private.current_tenant_id(),
    private.current_branch_id(),
    'ce000000-0000-4000-8000-000000000001',
    'ORDER_PRIORITY_SET',
    'ACCEPTED',
    'ACCEPTED',
    private.current_actor_id(),
    'WAIT_TIME'
  )
  returning id
)
select extensions.is(
  (select count(*)::bigint from inserted),
  1::bigint,
  'active-branch runtime can append evidence to its own order'
);

select throws_ok(
  $$insert into foodflow.order_events (
      tenant_id, branch_id, order_id, event_type, from_status, to_status, actor_id, reason
    ) values (
      '00000000-0000-0000-0000-0000000000a1',
      '00000000-0000-0000-0000-0000000000ac',
      'ce000000-0000-4000-8000-000000000002',
      'ORDER_PRIORITY_SET',
      'ACCEPTED',
      'ACCEPTED',
      '30000000-0000-4000-8000-0000000000a2',
      'WAIT_TIME'
    )$$,
  '42501',
  null,
  'active-branch runtime cannot forge event evidence for a sibling-branch order'
);

reset role;

select * from finish();
rollback;
