begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.orders', 'UPDATE'),
  'customer entry role cannot mutate operational order decisions'
);

select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.order_events', 'INSERT'),
  'customer entry role cannot append staff decision evidence'
);

select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime cannot mutate operational order decisions'
);

select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.order_events', 'INSERT'),
  'customer runtime cannot append staff decision evidence'
);

select * from finish();
rollback;
