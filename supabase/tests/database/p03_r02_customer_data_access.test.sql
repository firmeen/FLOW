begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select ok(
  exists(select 1 from pg_roles where rolname = 'flow_customer_runtime'),
  'customer runtime role exists'
);
select is(
  (select rolcanlogin from pg_roles where rolname = 'flow_customer_runtime'),
  false,
  'customer runtime role is NOLOGIN'
);
select is(
  (select rolbypassrls from pg_roles where rolname = 'flow_customer_runtime'),
  false,
  'customer runtime role cannot bypass RLS'
);
select ok(
  has_schema_privilege('flow_customer_runtime', 'app', 'USAGE'),
  'customer runtime may use app schema for narrow reads'
);
select ok(
  has_schema_privilege('flow_customer_runtime', 'foodflow', 'USAGE'),
  'customer runtime may use foodflow schema for narrow reads'
);
select ok(
  has_schema_privilege('flow_customer_runtime', 'private', 'USAGE'),
  'customer runtime may resolve transaction-local scope helpers'
);
select ok(
  has_table_privilege('flow_customer_runtime', 'app.restaurants', 'SELECT'),
  'customer runtime may read RLS-scoped restaurant rows'
);
select ok(
  has_table_privilege('flow_customer_runtime', 'app.branches', 'SELECT'),
  'customer runtime may read RLS-scoped branch rows'
);
select ok(
  has_table_privilege('flow_customer_runtime', 'foodflow.restaurant_tables', 'SELECT'),
  'customer runtime may read only its RLS-scoped table row'
);
select ok(
  has_table_privilege('flow_customer_runtime', 'foodflow.menu_items', 'SELECT'),
  'customer runtime may read customer-safe menu rows'
);
select ok(
  has_table_privilege('flow_customer_runtime', 'foodflow.modifier_choices', 'SELECT'),
  'customer runtime may read customer-safe modifier choices'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'app.users', 'SELECT'),
  'customer runtime cannot read staff users'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'app.memberships', 'SELECT'),
  'customer runtime cannot read staff memberships'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'app.roles', 'SELECT'),
  'customer runtime cannot read staff roles'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.carts', 'TRUNCATE'),
  'later customer persistence rounds do not grant unrestricted cart destruction'
);
select ok(
  not has_column_privilege('flow_customer_runtime', 'foodflow.carts', 'tenant_id', 'UPDATE'),
  'later customer persistence rounds cannot rewrite cart tenant ownership'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'foodflow.orders', 'UPDATE'),
  'R03 persistence does not grant customer order transition authority'
);
select ok(
  not has_table_privilege('flow_customer_runtime', 'payments.payments', 'SELECT'),
  'customer runtime has no payment-table authority'
);
select ok(
  has_function_privilege('flow_customer_runtime', 'private.current_customer_restaurant_id()', 'EXECUTE'),
  'customer runtime can read only its transaction-local restaurant scope helper'
);
select ok(
  not pg_has_role('flow_customer_runtime', 'flow_runtime', 'MEMBER'),
  'customer runtime cannot become the internal staff runtime role'
);

select * from finish();
rollback;
