begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select ok(
  exists(select 1 from pg_roles where rolname = 'flow_customer_entry'),
  'customer entry role exists'
);
select ok(
  has_schema_privilege('flow_customer_entry', 'private', 'USAGE'),
  'customer entry role may resolve approved private functions'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'app.users', 'SELECT'),
  'customer entry role cannot read staff users'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'app.memberships', 'SELECT'),
  'customer entry role cannot read staff memberships'
);
select ok(
  not has_table_privilege('flow_customer_entry', 'foodflow.restaurant_tables', 'SELECT'),
  'customer entry role cannot directly enumerate restaurant tables'
);
select ok(
  has_function_privilege('flow_customer_entry', 'private.resolve_customer_entry(text,text)', 'EXECUTE'),
  'customer entry role can execute only the public-entry resolver'
);
select ok(
  has_function_privilege('flow_customer_entry', 'private.validate_customer_capability_scope(uuid,uuid,uuid,uuid,uuid)', 'EXECUTE'),
  'customer entry role can execute capability scope validation'
);
select ok(
  not has_function_privilege('flow_customer_entry', 'private.list_actor_workspaces()', 'EXECUTE'),
  'customer entry role cannot execute staff workspace discovery'
);

select is(
  (select count(*)::bigint from private.resolve_customer_entry('restaurant-a', 'T-A1')),
  1::bigint,
  'active Restaurant A / Branch A1 / Table A1 resolves once'
);
select is(
  (select tenant_id::text from private.resolve_customer_entry('restaurant-a', 'T-A1')),
  '00000000-0000-0000-0000-0000000000a1',
  'entry resolution binds Tenant A server-side'
);
select is(
  (select branch_id::text from private.resolve_customer_entry('restaurant-a', 'T-A1')),
  '00000000-0000-0000-0000-0000000000a3',
  'entry resolution binds Branch A1 server-side'
);
select is(
  (select count(*)::bigint from private.resolve_customer_entry('restaurant-a', 'UNKNOWN')),
  0::bigint,
  'unknown table selector resolves nothing'
);
select is(
  (select count(*)::bigint from private.validate_customer_capability_scope(
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000a3',
    '00000000-0000-0000-0000-0000000000a5',
    null
  )),
  1::bigint,
  'exact tenant/restaurant/branch/table capability scope revalidates'
);
select is(
  (select count(*)::bigint from private.validate_customer_capability_scope(
    '00000000-0000-0000-0000-0000000000a1',
    '00000000-0000-0000-0000-0000000000a2',
    '00000000-0000-0000-0000-0000000000ac',
    '00000000-0000-0000-0000-0000000000a5',
    null
  )),
  0::bigint,
  'sibling branch substitution is denied'
);

update foodflow.restaurant_tables
set active = false
where id = '00000000-0000-0000-0000-0000000000a5';
select is(
  (select count(*)::bigint from private.resolve_customer_entry('restaurant-a', 'T-A1')),
  0::bigint,
  'inactive table revokes customer entry eligibility'
);
update foodflow.restaurant_tables
set active = true
where id = '00000000-0000-0000-0000-0000000000a5';

insert into foodflow.restaurant_tables (
  id, tenant_id, branch_id, code, label, seats, qr_code, display_order, active
) values (
  '70000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000ac',
  'T-A1',
  'Ambiguous Table',
  4,
  'test://ambiguous-entry',
  99,
  true
);
select is(
  (select count(*)::bigint from private.resolve_customer_entry('restaurant-a', 'T-A1')),
  0::bigint,
  'ambiguous same-restaurant selector fails closed instead of choosing a branch'
);
delete from foodflow.restaurant_tables
where id = '70000000-0000-4000-8000-000000000001';

select * from finish();
rollback;
