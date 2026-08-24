begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

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

select * from finish();
rollback;
