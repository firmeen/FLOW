do $$ begin
  create role flow_customer_runtime nologin nobypassrls;
exception when duplicate_object then null;
end $$;

revoke all on schema app, foodflow, payments, audit, private from flow_customer_runtime;
grant usage on schema app, foodflow, private to flow_customer_runtime;
revoke all on all tables in schema app, foodflow, payments, audit, private from flow_customer_runtime;
revoke all on all functions in schema private from flow_customer_runtime;

create or replace function private.current_customer_restaurant_id()
returns uuid
language sql
stable
set search_path = pg_catalog
as $$
  select nullif(current_setting('app.restaurant_id', true), '')::uuid
$$;

create or replace function private.current_customer_table_id()
returns uuid
language sql
stable
set search_path = pg_catalog
as $$
  select nullif(current_setting('app.table_id', true), '')::uuid
$$;

create or replace function private.current_customer_capability_id()
returns uuid
language sql
stable
set search_path = pg_catalog
as $$
  select nullif(current_setting('app.customer_capability_id', true), '')::uuid
$$;

revoke all on function private.current_customer_restaurant_id() from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator, flow_customer_entry;
revoke all on function private.current_customer_table_id() from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator, flow_customer_entry;
revoke all on function private.current_customer_capability_id() from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator, flow_customer_entry;

grant execute on function private.current_tenant_id() to flow_customer_runtime;
grant execute on function private.current_branch_id() to flow_customer_runtime;
grant execute on function private.current_customer_restaurant_id() to flow_customer_runtime;
grant execute on function private.current_customer_table_id() to flow_customer_runtime;
grant execute on function private.current_customer_capability_id() to flow_customer_runtime;

grant select on app.restaurants, app.branches to flow_customer_runtime;
grant select on foodflow.restaurant_tables to flow_customer_runtime;
grant select on foodflow.menu_categories, foodflow.menu_badges, foodflow.menu_availabilities,
  foodflow.menu_availability_windows, foodflow.modifier_groups, foodflow.modifier_choices,
  foodflow.menu_items, foodflow.menu_item_modifier_groups, foodflow.menu_item_badges
  to flow_customer_runtime;

drop policy if exists customer_runtime_select on app.restaurants;
create policy customer_runtime_select on app.restaurants
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and id = private.current_customer_restaurant_id()
);

drop policy if exists customer_runtime_select on app.branches;
create policy customer_runtime_select on app.branches
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and restaurant_id = private.current_customer_restaurant_id()
  and id = private.current_branch_id()
);

drop policy if exists customer_runtime_select on foodflow.restaurant_tables;
create policy customer_runtime_select on foodflow.restaurant_tables
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and id = private.current_customer_table_id()
);

do $policies$
declare
  target record;
begin
  for target in
    select * from (values
      ('menu_categories'),
      ('menu_badges'),
      ('menu_availabilities'),
      ('menu_availability_windows'),
      ('modifier_groups'),
      ('modifier_choices'),
      ('menu_items'),
      ('menu_item_modifier_groups'),
      ('menu_item_badges')
    ) as t(table_name)
  loop
    execute format('drop policy if exists customer_runtime_select on foodflow.%I', target.table_name);
    execute format(
      'create policy customer_runtime_select on foodflow.%I for select to flow_customer_runtime using (tenant_id = private.current_tenant_id() and restaurant_id = private.current_customer_restaurant_id())',
      target.table_name
    );
  end loop;
end
$policies$;

comment on role flow_customer_runtime is 'P03 customer session data-plane role. Read-only and scope-bound; no staff, cart/order write, payment, audit, or credential authority.';
comment on function private.current_customer_restaurant_id() is 'Transaction-local restaurant scope for validated customer data-plane requests.';
comment on function private.current_customer_table_id() is 'Transaction-local table scope for validated customer data-plane requests.';
comment on function private.current_customer_capability_id() is 'Transaction-local customer capability correlation identifier; never a staff actor authority.';
