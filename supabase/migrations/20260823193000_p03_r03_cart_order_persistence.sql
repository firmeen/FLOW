-- P03/R03 durable customer cart + order persistence foundation.
-- Reuse the existing FoodFlow tables and extend only the ownership/snapshot fields
-- required by the executable R03 contract. No historical migration is rewritten.

alter table foodflow.carts
  add column customer_capability_id uuid;

alter table foodflow.cart_items
  add column unit_price_minor bigint,
  add column currency text;

update foodflow.cart_items cart_item
set
  unit_price_minor = menu_item.base_price_minor,
  currency = menu_item.currency
from foodflow.menu_items menu_item
where menu_item.tenant_id = cart_item.tenant_id
  and menu_item.id = cart_item.menu_item_id
  and (cart_item.unit_price_minor is null or cart_item.currency is null);

alter table foodflow.cart_items
  alter column unit_price_minor set not null,
  alter column currency set not null,
  add constraint cart_items_unit_price_nonnegative check (unit_price_minor >= 0),
  add constraint cart_items_currency_format check (currency ~ '^[A-Z]{3}$');

alter table foodflow.cart_item_modifiers
  add column modifier_group_name text,
  add column modifier_choice_name text,
  add column price_delta_minor bigint;

update foodflow.cart_item_modifiers cart_modifier
set
  modifier_group_name = modifier_group.name,
  modifier_choice_name = modifier_choice.name,
  price_delta_minor = modifier_choice.price_delta_minor
from foodflow.modifier_choices modifier_choice
join foodflow.modifier_groups modifier_group
  on modifier_group.tenant_id = modifier_choice.tenant_id
 and modifier_group.id = modifier_choice.modifier_group_id
where modifier_choice.tenant_id = cart_modifier.tenant_id
  and modifier_choice.modifier_group_id = cart_modifier.modifier_group_id
  and modifier_choice.id = cart_modifier.modifier_choice_id
  and (
    cart_modifier.modifier_group_name is null
    or cart_modifier.modifier_choice_name is null
    or cart_modifier.price_delta_minor is null
  );

alter table foodflow.cart_item_modifiers
  alter column modifier_group_name set not null,
  alter column modifier_choice_name set not null,
  alter column price_delta_minor set not null,
  add constraint cart_item_modifiers_group_name_nonempty check (btrim(modifier_group_name) <> ''),
  add constraint cart_item_modifiers_choice_name_nonempty check (btrim(modifier_choice_name) <> '');

alter table foodflow.orders
  add column source_cart_id uuid,
  add column customer_capability_id uuid,
  alter column table_session_id drop not null,
  alter column customer_status drop not null,
  alter column submission_key drop not null,
  alter column submitted_at drop not null,
  add constraint orders_source_cart_fkey
    foreign key (tenant_id, source_cart_id)
    references foodflow.carts(tenant_id, id)
    on delete restrict,
  add constraint orders_submission_fields_consistent check (
    status = 'DRAFT'
    or (
      customer_status is not null
      and submission_key is not null
      and submitted_at is not null
    )
  );

create unique index orders_one_per_source_cart
  on foodflow.orders (tenant_id, source_cart_id)
  where source_cart_id is not null;

create index carts_customer_scope_idx
  on foodflow.carts (
    tenant_id,
    branch_id,
    table_id,
    customer_capability_id,
    status,
    updated_at desc
  )
  where customer_capability_id is not null;

create index orders_customer_scope_idx
  on foodflow.orders (
    tenant_id,
    branch_id,
    customer_capability_id,
    created_at desc,
    id
  )
  where customer_capability_id is not null;

create or replace function private.current_customer_table_session_id()
returns uuid
language sql
stable
set search_path = pg_catalog
as $$
  select nullif(current_setting('app.table_session_id', true), '')::uuid
$$;

revoke all on function private.current_customer_table_session_id()
  from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator, flow_customer_entry;
grant execute on function private.current_customer_table_session_id() to flow_customer_runtime;

create or replace function private.enforce_customer_cart_status_transition()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if old.status in ('SUBMITTED', 'ABANDONED') and new.status <> old.status then
    raise exception 'terminal cart status cannot transition';
  end if;

  if old.status = 'DRAFT' and new.status not in ('DRAFT', 'SUBMITTED', 'ABANDONED') then
    raise exception 'invalid cart status transition';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_customer_cart_status_transition()
  from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator, flow_customer_entry, flow_customer_runtime;

drop trigger if exists enforce_customer_cart_status_transition on foodflow.carts;
create trigger enforce_customer_cart_status_transition
before update of status on foodflow.carts
for each row execute function private.enforce_customer_cart_status_transition();

-- Customer runtime receives only the persistence surface needed by R03.
-- Owner columns are never update-granted; scope is derived from transaction-local context.
grant select, insert on foodflow.carts to flow_customer_runtime;
grant update (status, updated_at) on foodflow.carts to flow_customer_runtime;

grant select, insert, delete on foodflow.cart_items to flow_customer_runtime;
grant update (quantity, special_request, updated_at) on foodflow.cart_items to flow_customer_runtime;

grant select, insert, delete on foodflow.cart_item_modifiers to flow_customer_runtime;

grant select, insert on foodflow.orders, foodflow.order_items, foodflow.order_item_modifiers
  to flow_customer_runtime;

-- Cart ownership is exact tenant/branch/table/capability scope, with table-session
-- matching null-safely. Customer writes are limited to active DRAFT carts.
drop policy if exists customer_runtime_cart_select on foodflow.carts;
create policy customer_runtime_cart_select on foodflow.carts
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and customer_capability_id = private.current_customer_capability_id()
  and table_session_id is not distinct from private.current_customer_table_session_id()
);

drop policy if exists customer_runtime_cart_insert on foodflow.carts;
create policy customer_runtime_cart_insert on foodflow.carts
for insert to flow_customer_runtime
with check (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and customer_capability_id = private.current_customer_capability_id()
  and table_session_id is not distinct from private.current_customer_table_session_id()
  and status = 'DRAFT'
);

drop policy if exists customer_runtime_cart_update on foodflow.carts;
create policy customer_runtime_cart_update on foodflow.carts
for update to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and customer_capability_id = private.current_customer_capability_id()
  and table_session_id is not distinct from private.current_customer_table_session_id()
)
with check (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and customer_capability_id = private.current_customer_capability_id()
  and table_session_id is not distinct from private.current_customer_table_session_id()
);

drop policy if exists customer_runtime_cart_item_select on foodflow.cart_items;
create policy customer_runtime_cart_item_select on foodflow.cart_items
for select to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.carts cart
    where cart.tenant_id = cart_items.tenant_id
      and cart.id = cart_items.cart_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
  )
);

drop policy if exists customer_runtime_cart_item_insert on foodflow.cart_items;
create policy customer_runtime_cart_item_insert on foodflow.cart_items
for insert to flow_customer_runtime
with check (
  exists (
    select 1
    from foodflow.carts cart
    where cart.tenant_id = cart_items.tenant_id
      and cart.id = cart_items.cart_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
      and cart.status = 'DRAFT'
  )
);

drop policy if exists customer_runtime_cart_item_update on foodflow.cart_items;
create policy customer_runtime_cart_item_update on foodflow.cart_items
for update to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.carts cart
    where cart.tenant_id = cart_items.tenant_id
      and cart.id = cart_items.cart_id
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.status = 'DRAFT'
  )
)
with check (
  exists (
    select 1
    from foodflow.carts cart
    where cart.tenant_id = cart_items.tenant_id
      and cart.id = cart_items.cart_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
      and cart.status = 'DRAFT'
  )
);

drop policy if exists customer_runtime_cart_item_delete on foodflow.cart_items;
create policy customer_runtime_cart_item_delete on foodflow.cart_items
for delete to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.carts cart
    where cart.tenant_id = cart_items.tenant_id
      and cart.id = cart_items.cart_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
      and cart.status = 'DRAFT'
  )
);

drop policy if exists customer_runtime_cart_modifier_select on foodflow.cart_item_modifiers;
create policy customer_runtime_cart_modifier_select on foodflow.cart_item_modifiers
for select to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.cart_items cart_item
    join foodflow.carts cart
      on cart.tenant_id = cart_item.tenant_id
     and cart.id = cart_item.cart_id
    where cart_item.tenant_id = cart_item_modifiers.tenant_id
      and cart_item.id = cart_item_modifiers.cart_item_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
  )
);

drop policy if exists customer_runtime_cart_modifier_insert on foodflow.cart_item_modifiers;
create policy customer_runtime_cart_modifier_insert on foodflow.cart_item_modifiers
for insert to flow_customer_runtime
with check (
  exists (
    select 1
    from foodflow.cart_items cart_item
    join foodflow.carts cart
      on cart.tenant_id = cart_item.tenant_id
     and cart.id = cart_item.cart_id
    where cart_item.tenant_id = cart_item_modifiers.tenant_id
      and cart_item.id = cart_item_modifiers.cart_item_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
      and cart.status = 'DRAFT'
  )
);

drop policy if exists customer_runtime_cart_modifier_delete on foodflow.cart_item_modifiers;
create policy customer_runtime_cart_modifier_delete on foodflow.cart_item_modifiers
for delete to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.cart_items cart_item
    join foodflow.carts cart
      on cart.tenant_id = cart_item.tenant_id
     and cart.id = cart_item.cart_id
    where cart_item.tenant_id = cart_item_modifiers.tenant_id
      and cart_item.id = cart_item_modifiers.cart_item_id
      and cart.tenant_id = private.current_tenant_id()
      and cart.branch_id = private.current_branch_id()
      and cart.table_id = private.current_customer_table_id()
      and cart.customer_capability_id = private.current_customer_capability_id()
      and cart.table_session_id is not distinct from private.current_customer_table_session_id()
      and cart.status = 'DRAFT'
  )
);

-- Customer order visibility/insertion remains capability-owned and DRAFT-only.
-- R04 will own submitted-state orchestration and any additional narrow update authority.
drop policy if exists customer_runtime_order_select on foodflow.orders;
create policy customer_runtime_order_select on foodflow.orders
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and customer_capability_id = private.current_customer_capability_id()
  and table_session_id is not distinct from private.current_customer_table_session_id()
);

drop policy if exists customer_runtime_order_insert on foodflow.orders;
create policy customer_runtime_order_insert on foodflow.orders
for insert to flow_customer_runtime
with check (
  tenant_id = private.current_tenant_id()
  and restaurant_id = private.current_customer_restaurant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and customer_capability_id = private.current_customer_capability_id()
  and table_session_id is not distinct from private.current_customer_table_session_id()
  and status = 'DRAFT'
  and customer_status is null
  and submission_key is null
  and submitted_at is null
  and (
    source_cart_id is null
    or exists (
      select 1
      from foodflow.carts cart
      where cart.tenant_id = orders.tenant_id
        and cart.id = orders.source_cart_id
        and cart.branch_id = orders.branch_id
        and cart.table_id = orders.table_id
        and cart.customer_capability_id = orders.customer_capability_id
        and cart.table_session_id is not distinct from orders.table_session_id
    )
  )
);

drop policy if exists customer_runtime_order_item_select on foodflow.order_items;
create policy customer_runtime_order_item_select on foodflow.order_items
for select to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.orders customer_order
    where customer_order.tenant_id = order_items.tenant_id
      and customer_order.id = order_items.order_id
      and customer_order.tenant_id = private.current_tenant_id()
      and customer_order.branch_id = private.current_branch_id()
      and customer_order.table_id = private.current_customer_table_id()
      and customer_order.customer_capability_id = private.current_customer_capability_id()
      and customer_order.table_session_id is not distinct from private.current_customer_table_session_id()
  )
);

drop policy if exists customer_runtime_order_item_insert on foodflow.order_items;
create policy customer_runtime_order_item_insert on foodflow.order_items
for insert to flow_customer_runtime
with check (
  exists (
    select 1
    from foodflow.orders customer_order
    where customer_order.tenant_id = order_items.tenant_id
      and customer_order.id = order_items.order_id
      and customer_order.tenant_id = private.current_tenant_id()
      and customer_order.branch_id = private.current_branch_id()
      and customer_order.table_id = private.current_customer_table_id()
      and customer_order.customer_capability_id = private.current_customer_capability_id()
      and customer_order.table_session_id is not distinct from private.current_customer_table_session_id()
      and customer_order.status = 'DRAFT'
  )
);

drop policy if exists customer_runtime_order_modifier_select on foodflow.order_item_modifiers;
create policy customer_runtime_order_modifier_select on foodflow.order_item_modifiers
for select to flow_customer_runtime
using (
  exists (
    select 1
    from foodflow.order_items order_item
    join foodflow.orders customer_order
      on customer_order.tenant_id = order_item.tenant_id
     and customer_order.id = order_item.order_id
    where order_item.tenant_id = order_item_modifiers.tenant_id
      and order_item.id = order_item_modifiers.order_item_id
      and customer_order.tenant_id = private.current_tenant_id()
      and customer_order.branch_id = private.current_branch_id()
      and customer_order.table_id = private.current_customer_table_id()
      and customer_order.customer_capability_id = private.current_customer_capability_id()
      and customer_order.table_session_id is not distinct from private.current_customer_table_session_id()
  )
);

drop policy if exists customer_runtime_order_modifier_insert on foodflow.order_item_modifiers;
create policy customer_runtime_order_modifier_insert on foodflow.order_item_modifiers
for insert to flow_customer_runtime
with check (
  exists (
    select 1
    from foodflow.order_items order_item
    join foodflow.orders customer_order
      on customer_order.tenant_id = order_item.tenant_id
     and customer_order.id = order_item.order_id
    where order_item.tenant_id = order_item_modifiers.tenant_id
      and order_item.id = order_item_modifiers.order_item_id
      and customer_order.tenant_id = private.current_tenant_id()
      and customer_order.branch_id = private.current_branch_id()
      and customer_order.table_id = private.current_customer_table_id()
      and customer_order.customer_capability_id = private.current_customer_capability_id()
      and customer_order.table_session_id is not distinct from private.current_customer_table_session_id()
      and customer_order.status = 'DRAFT'
  )
);

comment on column foodflow.carts.customer_capability_id is
  'Opaque signed-capability identifier used only for customer ownership. Bearer token material is never persisted.';
comment on column foodflow.cart_items.unit_price_minor is
  'Menu unit-price snapshot captured by the server when a cart line is persisted.';
comment on column foodflow.cart_items.currency is
  'Currency snapshot captured with the cart line price.';
comment on column foodflow.orders.source_cart_id is
  'Optional originating cart. Unique when present so one cart cannot persist multiple orders.';
comment on column foodflow.orders.customer_capability_id is
  'Opaque capability ownership identifier for customer-visible orders; not staff authority.';
comment on role flow_customer_runtime is
  'P03 customer data-plane role. R03 adds scope-bound cart writes and DRAFT order inserts only; no staff, payment, audit, kitchen, or submitted-order transition authority.';
