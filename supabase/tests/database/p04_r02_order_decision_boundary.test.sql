begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select has_column(
  'foodflow',
  'orders',
  'accepted_at',
  'orders retain durable acceptance timestamp evidence'
);
select has_column(
  'foodflow',
  'orders',
  'rejected_at',
  'orders retain durable rejection timestamp evidence'
);
select has_column(
  'foodflow',
  'orders',
  'rejection_reason',
  'orders retain durable rejection reason evidence'
);
select has_column(
  'foodflow',
  'orders',
  'modified_by_staff',
  'orders retain the current staff mutation actor reference'
);
select has_column(
  'foodflow',
  'order_events',
  'event_type',
  'order event history records a bounded event type'
);
select has_column(
  'foodflow',
  'order_events',
  'from_status',
  'order event history records the decision source status'
);
select has_column(
  'foodflow',
  'order_events',
  'to_status',
  'order event history records the decision target status'
);
select has_column(
  'foodflow',
  'order_events',
  'actor_id',
  'order event history records durable actor evidence'
);
select has_column(
  'foodflow',
  'order_events',
  'reason',
  'order event history records durable rejection reason evidence'
);
select has_column(
  'foodflow',
  'order_events',
  'occurred_at',
  'order event history records a server-side decision timestamp'
);

select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_events', 'SELECT'),
  'internal runtime can read branch-scoped order event history'
);
select ok(
  has_table_privilege('flow_runtime', 'foodflow.order_events', 'INSERT'),
  'internal runtime can append order decision evidence'
);
select ok(
  not has_table_privilege('flow_runtime', 'foodflow.order_events', 'UPDATE'),
  'internal runtime cannot rewrite committed order decision evidence'
);
select ok(
  not has_table_privilege('flow_runtime', 'foodflow.order_events', 'DELETE'),
  'internal runtime cannot delete committed order decision evidence'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime cannot execute staff order decisions through direct order update'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.order_events', 'INSERT'),
  'customer runtime cannot append staff decision evidence'
);
select ok(
  not has_table_privilege('anon', 'foodflow.orders', 'UPDATE'),
  'anon cannot mutate operational order decisions'
);
select ok(
  not has_table_privilege('authenticated', 'foodflow.orders', 'UPDATE'),
  'authenticated Supabase role cannot mutate operational order decisions directly'
);

-- Synthetic rows prove the exact branch/tenant predicates remain effective under
-- the real internal runtime role and forced RLS. The whole test transaction rolls back.
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
  submitted_at
)
values
  (
    '94000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000ac',
    '00000000-0000-0000-0000-0000000000ad',
    null,
    'P04-R02-DB-A2',
    'PENDING_CONFIRMATION',
    'SENT',
    10000,
    'THB',
    'p04-r02-db-a2',
    '2040-02-01T00:00:00Z'::timestamptz
  ),
  (
    '94000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-0000000000b1',
    '00000000-0000-0000-0000-0000000000b2',
    '00000000-0000-0000-0000-0000000000b3',
    '00000000-0000-0000-0000-0000000000b5',
    null,
    'P04-R02-DB-B1',
    'PENDING_CONFIRMATION',
    'SENT',
    10000,
    'THB',
    'p04-r02-db-b1',
    '2040-02-01T00:00:00Z'::timestamptz
  );

grant usage on schema extensions to flow_runtime;
set local role flow_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);

with attempted as (
  update foodflow.orders
  set status = 'ACCEPTED'
  where tenant_id = private.current_tenant_id()
    and branch_id = private.current_branch_id()
    and id = '94000000-0000-4000-8000-000000000001'
    and status = 'PENDING_CONFIRMATION'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'sibling-branch selector cannot mutate an order outside the active branch'
);

with attempted as (
  update foodflow.orders
  set status = 'ACCEPTED'
  where tenant_id = private.current_tenant_id()
    and branch_id = private.current_branch_id()
    and id = '94000000-0000-4000-8000-000000000002'
    and status = 'PENDING_CONFIRMATION'
  returning id
)
select extensions.is(
  (select count(*)::bigint from attempted),
  0::bigint,
  'cross-tenant selector cannot mutate an order outside the active tenant'
);

reset role;

select * from finish();
rollback;
