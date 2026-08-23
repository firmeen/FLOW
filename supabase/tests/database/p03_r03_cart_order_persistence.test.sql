begin;

create extension if not exists pgtap with schema extensions;

select plan(36);

select ok(
  exists(select 1 from pg_roles where rolname = 'flow_customer_runtime'),
  'customer runtime role still exists'
);
select is(
  (select rolbypassrls from pg_roles where rolname = 'flow_customer_runtime'),
  false,
  'customer runtime still cannot bypass RLS'
);
select ok(
  not pg_has_role('flow_customer_runtime', 'flow_runtime', 'MEMBER'),
  'customer runtime cannot become staff runtime'
);

select ok(has_table_privilege('flow_customer_runtime', 'foodflow.carts', 'SELECT'), 'customer runtime can read owned carts');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.carts', 'INSERT'), 'customer runtime can create owned carts');
select ok(has_column_privilege('flow_customer_runtime', 'foodflow.carts', 'status', 'UPDATE'), 'customer runtime can transition cart status through the bounded column grant');
select ok(not has_column_privilege('flow_customer_runtime', 'foodflow.carts', 'tenant_id', 'UPDATE'), 'customer runtime cannot rewrite cart tenant ownership');
select ok(not has_column_privilege('flow_customer_runtime', 'foodflow.carts', 'customer_capability_id', 'UPDATE'), 'customer runtime cannot rewrite cart capability ownership');

select ok(has_table_privilege('flow_customer_runtime', 'foodflow.cart_items', 'SELECT'), 'customer runtime can read owned cart items');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.cart_items', 'INSERT'), 'customer runtime can insert owned cart items');
select ok(has_column_privilege('flow_customer_runtime', 'foodflow.cart_items', 'quantity', 'UPDATE'), 'customer runtime can update cart-item quantity');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.cart_items', 'DELETE'), 'customer runtime can remove owned cart items');
select ok(not has_column_privilege('flow_customer_runtime', 'foodflow.cart_items', 'cart_id', 'UPDATE'), 'customer runtime cannot move a cart item to another cart');

select ok(has_table_privilege('flow_customer_runtime', 'foodflow.cart_item_modifiers', 'SELECT'), 'customer runtime can read owned cart modifiers');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.cart_item_modifiers', 'INSERT'), 'customer runtime can insert owned cart modifiers');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.cart_item_modifiers', 'DELETE'), 'customer runtime can remove owned cart modifiers');

select ok(has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'SELECT'), 'customer runtime can read owned orders');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'INSERT'), 'customer runtime can persist a DRAFT order');
select ok(not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'), 'R03 does not grant customer order transition authority');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.order_items', 'INSERT'), 'customer runtime can persist DRAFT order item snapshots');
select ok(has_table_privilege('flow_customer_runtime', 'foodflow.order_item_modifiers', 'INSERT'), 'customer runtime can persist DRAFT order modifier snapshots');
select ok(not has_table_privilege('flow_customer_runtime', 'payments.payments', 'SELECT'), 'R03 does not broaden payment authority');
select ok(not has_table_privilege('flow_customer_runtime', 'foodflow.kitchen_tickets', 'INSERT'), 'R03 does not broaden kitchen authority');

select ok(
  has_function_privilege('flow_customer_runtime', 'private.current_customer_table_session_id()', 'EXECUTE'),
  'customer runtime can resolve transaction-local optional table-session scope'
);
select ok(
  exists(
    select 1 from information_schema.columns
    where table_schema = 'foodflow' and table_name = 'carts' and column_name = 'customer_capability_id'
  ),
  'carts have opaque capability ownership identifier'
);
select ok(
  exists(
    select 1 from information_schema.columns
    where table_schema = 'foodflow' and table_name = 'orders' and column_name = 'customer_capability_id'
  ),
  'orders have opaque capability ownership identifier'
);
select ok(
  exists(
    select 1 from information_schema.columns
    where table_schema = 'foodflow' and table_name = 'orders' and column_name = 'source_cart_id'
  ),
  'orders have explicit source cart relation'
);
select ok(
  exists(
    select 1 from pg_indexes
    where schemaname = 'foodflow' and tablename = 'orders' and indexname = 'orders_one_per_source_cart'
  ),
  'one-cart-one-order storage invariant has a unique partial index'
);
select ok(
  (select is_nullable = 'NO' from information_schema.columns where table_schema = 'foodflow' and table_name = 'cart_items' and column_name = 'unit_price_minor'),
  'cart item unit price snapshot is required'
);
select ok(
  (select is_nullable = 'NO' from information_schema.columns where table_schema = 'foodflow' and table_name = 'cart_items' and column_name = 'currency'),
  'cart item currency snapshot is required'
);
select ok(
  (select is_nullable = 'YES' from information_schema.columns where table_schema = 'foodflow' and table_name = 'orders' and column_name = 'table_session_id'),
  'DRAFT order persistence supports customer scope without an active table session'
);

set local role flow_customer_runtime;
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.restaurant_id', '00000000-0000-0000-0000-0000000000a2', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.table_id', '00000000-0000-0000-0000-0000000000a5', true);
select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000041', true);
select set_config('app.table_session_id', '', true);
select set_config('app.actor_id', '', true);

insert into foodflow.carts (
  id, tenant_id, branch_id, table_id, table_session_id, customer_capability_id, status
) values (
  '71000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-0000000000a5',
  null,
  '70000000-0000-4000-8000-000000000041',
  'DRAFT'
);

select extensions.is(
  (select count(*)::bigint from foodflow.carts where id = '71000000-0000-4000-8000-000000000001'),
  1::bigint,
  'own capability can read its cart'
);

select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000042', true);
select extensions.is(
  (select count(*)::bigint from foodflow.carts where id = '71000000-0000-4000-8000-000000000001'),
  0::bigint,
  'same table but another capability cannot read the cart'
);

select set_config('app.customer_capability_id', '70000000-0000-4000-8000-000000000041', true);
insert into foodflow.orders (
  id, tenant_id, restaurant_id, branch_id, table_id, table_session_id,
  source_cart_id, customer_capability_id, order_number, status,
  customer_status, subtotal_minor, currency, submission_key, submitted_at
) values (
  '72000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000a2',
  '00000000-0000-0000-0000-0000000000a3',
  '00000000-0000-0000-0000-0000000000a5',
  null,
  '71000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000041',
  'DRAFT-R03-001',
  'DRAFT',
  null,
  0,
  'THB',
  null,
  null
);

select extensions.is(
  (select count(*)::bigint from foodflow.orders where id = '72000000-0000-4000-8000-000000000001'),
  1::bigint,
  'own capability can persist and read a DRAFT order'
);

reset role;

select ok(
  exists(
    select 1 from pg_policies
    where schemaname = 'foodflow' and tablename = 'carts' and policyname = 'customer_runtime_cart_insert'
  ),
  'cart insert RLS policy is installed'
);
select ok(
  exists(
    select 1 from pg_policies
    where schemaname = 'foodflow' and tablename = 'orders' and policyname = 'customer_runtime_order_insert'
  ),
  'order insert RLS policy is installed'
);

select * from finish();
rollback;
