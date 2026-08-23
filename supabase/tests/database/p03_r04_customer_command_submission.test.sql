begin;

create extension if not exists pgtap with schema extensions;

select plan(18);

select ok(
  to_regprocedure('private.submit_customer_order(uuid)') is not null,
  'narrow customer submission function exists'
);
select ok(
  has_function_privilege('flow_customer_runtime', 'private.submit_customer_order(uuid)', 'EXECUTE'),
  'customer runtime may execute the exact submission primitive'
);
select ok(
  not exists (
    select 1
    from information_schema.routine_privileges privilege
    where privilege.routine_schema = 'private'
      and privilege.routine_name = 'submit_customer_order'
      and privilege.grantee = 'PUBLIC'
      and privilege.privilege_type = 'EXECUTE'
  ),
  'public cannot execute customer submission'
);
select ok(
  not has_function_privilege('anon', 'private.submit_customer_order(uuid)', 'EXECUTE'),
  'anon cannot execute customer submission'
);
select ok(
  not has_function_privilege('authenticated', 'private.submit_customer_order(uuid)', 'EXECUTE'),
  'authenticated cannot execute customer submission'
);
select ok(
  not has_function_privilege('flow_customer_entry', 'private.submit_customer_order(uuid)', 'EXECUTE'),
  'customer entry role cannot execute customer submission'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'customer runtime still has no arbitrary order UPDATE authority'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'payments.payments', 'INSERT'),
  'customer command authority does not include payment insertion'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.kitchen_tickets', 'INSERT'),
  'customer command authority does not include kitchen insertion'
);

-- pgTAP harness access is test-only and is rolled back with this transaction.
grant usage on schema extensions to flow_customer_runtime;

set local role flow_customer_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.restaurant_id', '00000000-0000-0000-0000-0000000000a2', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.table_id', '00000000-0000-0000-0000-0000000000a5', true);
select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000061', true);
select set_config('app.table_session_id', '', true);
select set_config('app.actor_id', '', true);

insert into foodflow.carts (
  id, tenant_id, branch_id, table_id, customer_capability_id, status
) values
  ('73000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', '70000000-0000-4000-8000-000000000061', 'DRAFT'),
  ('73000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', '70000000-0000-4000-8000-000000000061', 'DRAFT');

insert into foodflow.orders (
  id, tenant_id, restaurant_id, branch_id, table_id, source_cart_id,
  customer_capability_id, order_number, status, customer_status,
  subtotal_minor, currency, submission_key, submitted_at
) values
  ('74000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', '73000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000061', 'DRAFT-1', 'DRAFT', null, 12500, 'THB', null, null),
  ('74000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', '73000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000061', 'DRAFT-2', 'DRAFT', null, 10000, 'THB', null, null);

select extensions.is(
  (select count(*)::bigint from private.submit_customer_order('74000000-0000-4000-8000-000000000001')),
  1::bigint,
  'owned DRAFT order transitions exactly once'
);
select extensions.is(
  (select status from foodflow.orders where id = '74000000-0000-4000-8000-000000000001'),
  'PENDING_CONFIRMATION'::text,
  'submission uses canonical initial order status'
);
select extensions.is(
  (select customer_status from foodflow.orders where id = '74000000-0000-4000-8000-000000000001'),
  'SENT'::text,
  'submission uses canonical initial customer status'
);
select extensions.ok(
  (select submitted_at is not null from foodflow.orders where id = '74000000-0000-4000-8000-000000000001'),
  'submission timestamp is server-set'
);
select extensions.ok(
  (select order_number ~ '^FF-[0-9A-F]{12}$' from foodflow.orders where id = '74000000-0000-4000-8000-000000000001'),
  'final display order number is deterministic and non-secret'
);
select extensions.is(
  (select submission_key from foodflow.orders where id = '74000000-0000-4000-8000-000000000001'),
  'order:74000000-0000-4000-8000-000000000001'::text,
  'schema-required internal submission marker derives from immutable order identity'
);
select extensions.is(
  (select status from foodflow.carts where id = '73000000-0000-4000-8000-000000000001'),
  'DRAFT'::text,
  'database primitive does not hide cart conversion outside command transaction orchestration'
);

select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000062', true);
select extensions.is(
  (select count(*)::bigint from private.submit_customer_order('74000000-0000-4000-8000-000000000002')),
  0::bigint,
  'another capability cannot submit the order'
);

reset role;
select is(
  (select status from foodflow.orders where id = '74000000-0000-4000-8000-000000000002'),
  'DRAFT'::text,
  'denied submission leaves the other order unchanged'
);

select * from finish();
rollback;
