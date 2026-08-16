begin;

create extension if not exists pgtap with schema extensions;

select plan(26);

select has_schema('app', 'app schema exists');
select has_schema('foodflow', 'foodflow schema exists');
select has_schema('payments', 'payments schema exists');
select has_schema('audit', 'audit schema exists');
select has_schema('private', 'private schema exists');

select has_table('app', 'organizations', 'organizations table exists');
select has_table('foodflow', 'orders', 'orders table exists');
select has_table('foodflow', 'carts', 'carts table exists');
select has_table('foodflow', 'kitchen_tickets', 'kitchen tickets table exists');
select has_table('payments', 'payments', 'payments table exists');
select has_table('audit', 'events', 'audit events table exists');

select has_column('foodflow', 'orders', 'submission_key', 'orders have submission_key');
select has_column('foodflow', 'order_items', 'unit_price_minor', 'order items use minor-unit prices');
select has_column('foodflow', 'table_sessions', 'customer_capability_digest', 'table sessions store only capability digests');

select has_index('foodflow', 'table_sessions', 'table_sessions_one_active_per_table', 'one active session index exists');
select has_index('foodflow', 'service_requests', 'service_requests_active_dedupe', 'active service request dedupe exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'foodflow.orders'::regclass),
  'RLS enabled on orders'
);
select ok(
  (select relforcerowsecurity from pg_class where oid = 'foodflow.orders'::regclass),
  'RLS forced on orders'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'payments.payments'::regclass),
  'RLS enabled on payments'
);

select throws_ok(
  $$ insert into foodflow.menu_items (tenant_id, restaurant_id, category_id, availability_id, name, description, base_price_minor, currency, preparation_station, estimated_preparation_minutes, status, display_order)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-0000000000a7', 'Bad money', '', -1, 'THB', 'BAR', 1, 'ACTIVE', 1) $$,
  '23514',
  null,
  'negative menu price rejected'
);

select throws_ok(
  $$ insert into foodflow.menu_items (tenant_id, restaurant_id, category_id, availability_id, name, description, base_price_minor, currency, preparation_station, estimated_preparation_minutes, status, display_order)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a6', '00000000-0000-0000-0000-0000000000a7', 'Bad currency', '', 100, 'thb', 'BAR', 1, 'ACTIVE', 1) $$,
  '23514',
  null,
  'lowercase currency rejected'
);

select lives_ok(
  $$ insert into foodflow.carts (id, tenant_id, branch_id, table_id, status)
     values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', 'DRAFT');
     insert into foodflow.cart_items (tenant_id, cart_id, menu_item_id, quantity)
     values ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000aa', 1); $$,
  'draft cart can exist without required modifier completion'
);

select throws_ok(
  $$ insert into foodflow.cart_items (tenant_id, cart_id, menu_item_id, quantity)
     values ('00000000-0000-0000-0000-0000000000a1', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000aa', 0) $$,
  '23514',
  null,
  'zero cart quantity rejected'
);

insert into foodflow.table_sessions (id, tenant_id, branch_id, table_id, session_number, status, guest_count, opened_at)
values ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', 'TEST-A-1', 'ACTIVE', 1, now());

select throws_ok(
  $$ insert into foodflow.table_sessions (tenant_id, branch_id, table_id, session_number, status, guest_count, opened_at)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', 'TEST-A-2', 'ACTIVE', 1, now()) $$,
  '23505',
  null,
  'second active table session rejected'
);

update foodflow.table_sessions set status = 'CLOSED', closed_at = now() where id = '10000000-0000-0000-0000-000000000010';
select lives_ok(
  $$ insert into foodflow.table_sessions (tenant_id, branch_id, table_id, session_number, status, guest_count, opened_at)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', 'TEST-A-3', 'ACTIVE', 1, now()) $$,
  'new active session allowed after close'
);

select throws_ok(
  $$ insert into foodflow.orders (tenant_id, restaurant_id, branch_id, table_id, table_session_id, order_number, status, customer_status, subtotal_minor, currency, submission_key, submitted_at)
     select '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', id, 'O-1', 'PENDING_CONFIRMATION', 'SENT', 10000, 'THB', 'same-key', now()
     from foodflow.table_sessions where session_number = 'TEST-A-3';
     insert into foodflow.orders (tenant_id, restaurant_id, branch_id, table_id, table_session_id, order_number, status, customer_status, subtotal_minor, currency, submission_key, submitted_at)
     select '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000a3', '00000000-0000-0000-0000-0000000000a5', id, 'O-2', 'PENDING_CONFIRMATION', 'SENT', 10000, 'THB', 'same-key', now()
     from foodflow.table_sessions where session_number = 'TEST-A-3'; $$,
  '23505',
  null,
  'duplicate submission key rejected'
);

set local role flow_runtime;
select set_config('app.tenant_id', '', true);
select is((select count(*)::integer from foodflow.menu_items), 0, 'no tenant context sees no domain rows');
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select is((select count(*)::integer from foodflow.menu_items), 1, 'tenant A sees only tenant A menu rows');
select throws_ok(
  $$ insert into foodflow.menu_categories (tenant_id, restaurant_id, name, display_order)
     values ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b2', 'Cross tenant', 1) $$,
  '42501',
  null,
  'tenant A cannot insert tenant B row through RLS'
);
reset role;

select * from finish();
rollback;
