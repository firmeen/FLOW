do $$ begin
  create role flow_identity nologin nobypassrls;
exception when duplicate_object then null;
end $$;

grant usage on schema app, private to flow_identity;
grant execute on function private.current_actor_id() to flow_identity;

create table private.user_credentials (
  user_id uuid primary key references app.users(id) on delete cascade,
  password_hash text not null check (btrim(password_hash) <> ''),
  algorithm text not null default 'scrypt-v1' check (algorithm in ('scrypt-v1')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  password_changed_at timestamptz not null default now(),
  disabled_at timestamptz
);

create table private.login_throttles (
  subject_digest text primary key,
  failure_count integer not null default 0 check (failure_count >= 0),
  window_started_at timestamptz not null default now(),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

revoke all on private.user_credentials, private.login_throttles from public, anon, authenticated, flow_runtime, flow_identity;

alter table app.users enable row level security;
alter table app.users force row level security;
create policy identity_reads_self on app.users for select to flow_identity
  using (id = private.current_actor_id());

create policy identity_reads_own_memberships on app.memberships for select to flow_identity
  using (user_id = private.current_actor_id());

grant select on app.users, app.memberships, app.roles, app.permissions, app.role_permissions, app.branches, app.organizations to flow_identity;

create function private.actor_has_active_membership(target_tenant_id uuid, target_branch_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, app, private
as $$
  select exists (
    select 1
    from app.users u
    join app.memberships m on m.user_id = u.id
    where u.id = private.current_actor_id()
      and u.status = 'ACTIVE'
      and m.tenant_id = target_tenant_id
      and m.status = 'ACTIVE'
      and (target_branch_id is null or m.branch_id is null or m.branch_id = target_branch_id)
  )
$$;

create function private.actor_has_permission(permission_code text, target_tenant_id uuid, target_branch_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, app, private
as $$
  select exists (
    select 1
    from app.users u
    join app.memberships m on m.user_id = u.id
    join app.roles r on r.id = m.role_id and r.tenant_id = m.tenant_id
    join app.role_permissions rp on rp.role_id = r.id
    join app.permissions p on p.id = rp.permission_id
    where u.id = private.current_actor_id()
      and u.status = 'ACTIVE'
      and m.tenant_id = target_tenant_id
      and m.status = 'ACTIVE'
      and (target_branch_id is null or m.branch_id is null or m.branch_id = target_branch_id)
      and p.code = permission_code
  )
$$;

revoke all on function private.actor_has_active_membership(uuid, uuid) from public, anon, authenticated;
revoke all on function private.actor_has_permission(text, uuid, uuid) from public, anon, authenticated;
grant execute on function private.actor_has_active_membership(uuid, uuid) to flow_runtime, flow_identity;
grant execute on function private.actor_has_permission(text, uuid, uuid) to flow_runtime, flow_identity;

do $policies$
declare
  target record;
begin
  for target in
    select * from (values
      ('app','organizations', false),
      ('app','restaurants', false),
      ('app','branches', true),
      ('app','branch_opening_hours', true),
      ('app','branch_settings', true),
      ('app','roles', false),
      ('app','memberships', true),
      ('foodflow','restaurant_tables', true),
      ('foodflow','table_sessions', true),
      ('foodflow','menu_categories', false),
      ('foodflow','menu_badges', false),
      ('foodflow','menu_availabilities', false),
      ('foodflow','menu_availability_windows', false),
      ('foodflow','modifier_groups', false),
      ('foodflow','modifier_choices', false),
      ('foodflow','menu_items', false),
      ('foodflow','menu_item_modifier_groups', false),
      ('foodflow','menu_item_badges', false),
      ('foodflow','carts', true),
      ('foodflow','orders', true),
      ('foodflow','order_events', true),
      ('foodflow','kitchen_tickets', true),
      ('foodflow','service_requests', true),
      ('payments','payments', true),
      ('audit','events', true)
    ) as t(schema_name, table_name, branch_scoped)
  loop
    execute format('drop policy if exists tenant_isolation on %I.%I', target.schema_name, target.table_name);
    if target.branch_scoped then
      execute format(
        'create policy tenant_actor_isolation on %I.%I for all to flow_runtime using (tenant_id = private.current_tenant_id() and private.actor_has_active_membership(tenant_id, branch_id)) with check (tenant_id = private.current_tenant_id() and private.actor_has_active_membership(tenant_id, branch_id))',
        target.schema_name,
        target.table_name
      );
    else
      execute format(
        'create policy tenant_actor_isolation on %I.%I for all to flow_runtime using (tenant_id = private.current_tenant_id() and private.actor_has_active_membership(tenant_id, null)) with check (tenant_id = private.current_tenant_id() and private.actor_has_active_membership(tenant_id, null))',
        target.schema_name,
        target.table_name
      );
    end if;
  end loop;
end
$policies$;

-- Child tables without branch_id inherit actor/tenant scope through their parent rows.
drop policy if exists tenant_isolation on foodflow.cart_items;
create policy tenant_actor_isolation on foodflow.cart_items for all to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from foodflow.carts c where c.id = cart_id and c.tenant_id = tenant_id and private.actor_has_active_membership(c.tenant_id, c.branch_id))
)
with check (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from foodflow.carts c where c.id = cart_id and c.tenant_id = tenant_id and private.actor_has_active_membership(c.tenant_id, c.branch_id))
);

drop policy if exists tenant_isolation on foodflow.order_items;
create policy tenant_actor_isolation on foodflow.order_items for all to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from foodflow.orders o where o.id = order_id and o.tenant_id = tenant_id and private.actor_has_active_membership(o.tenant_id, o.branch_id))
)
with check (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from foodflow.orders o where o.id = order_id and o.tenant_id = tenant_id and private.actor_has_active_membership(o.tenant_id, o.branch_id))
);

drop policy if exists tenant_isolation on foodflow.kitchen_ticket_items;
create policy tenant_actor_isolation on foodflow.kitchen_ticket_items for all to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from foodflow.kitchen_tickets k where k.id = ticket_id and k.tenant_id = tenant_id and private.actor_has_active_membership(k.tenant_id, k.branch_id))
)
with check (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from foodflow.kitchen_tickets k where k.id = ticket_id and k.tenant_id = tenant_id and private.actor_has_active_membership(k.tenant_id, k.branch_id))
);

drop policy if exists tenant_isolation on payments.payment_allocations;
create policy tenant_actor_isolation on payments.payment_allocations for all to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from payments.payments p where p.id = payment_id and p.tenant_id = tenant_id and private.actor_has_active_membership(p.tenant_id, p.branch_id))
)
with check (
  tenant_id = private.current_tenant_id()
  and exists (select 1 from payments.payments p where p.id = payment_id and p.tenant_id = tenant_id and private.actor_has_active_membership(p.tenant_id, p.branch_id))
);

insert into app.permissions (id, code, description) values
('40000000-0000-0000-0000-000000000001','operations.staff.access','Access staff operations'),
('40000000-0000-0000-0000-000000000002','operations.kitchen.access','Access kitchen operations'),
('40000000-0000-0000-0000-000000000003','operations.cashier.access','Access cashier operations'),
('40000000-0000-0000-0000-000000000004','management.admin.access','Access owner/admin management'),
('40000000-0000-0000-0000-000000000005','order.view','View orders'),
('40000000-0000-0000-0000-000000000006','order.manage','Manage orders'),
('40000000-0000-0000-0000-000000000007','service.view','View service requests'),
('40000000-0000-0000-0000-000000000008','service.manage','Manage service requests'),
('40000000-0000-0000-0000-000000000009','kitchen.view','View kitchen workflow'),
('40000000-0000-0000-0000-000000000010','kitchen.manage','Manage kitchen workflow'),
('40000000-0000-0000-0000-000000000011','merchant_payment.view','View merchant payments'),
('40000000-0000-0000-0000-000000000012','merchant_payment.collect','Collect merchant payments'),
('40000000-0000-0000-0000-000000000013','merchant_payment.void','Void merchant payments'),
('40000000-0000-0000-0000-000000000014','menu.view','View menu configuration'),
('40000000-0000-0000-0000-000000000015','menu.manage','Manage menu configuration'),
('40000000-0000-0000-0000-000000000016','settings.view','View settings'),
('40000000-0000-0000-0000-000000000017','settings.manage','Manage settings'),
('40000000-0000-0000-0000-000000000018','member.view','View members'),
('40000000-0000-0000-0000-000000000019','member.invite','Invite members'),
('40000000-0000-0000-0000-000000000020','member.manage','Manage members'),
('40000000-0000-0000-0000-000000000021','role.view','View roles'),
('40000000-0000-0000-0000-000000000022','role.manage','Manage roles'),
('40000000-0000-0000-0000-000000000023','audit.view','View audit events')
on conflict (code) do update set description = excluded.description;
