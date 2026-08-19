-- P01/R04 actor-aware authorization baseline recovery.
-- This migration is intentionally limited to membership/permission scope semantics
-- and the highest-risk authorization-control mutation surfaces.

create or replace function private.actor_has_active_membership(
  target_tenant_id uuid,
  target_branch_id uuid default null
)
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
      and (
        (target_branch_id is null and m.branch_id is null)
        or
        (target_branch_id is not null and (m.branch_id is null or m.branch_id = target_branch_id))
      )
  )
$$;

create or replace function private.actor_has_permission(
  permission_code text,
  target_tenant_id uuid,
  target_branch_id uuid default null
)
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
      and (
        (target_branch_id is null and m.branch_id is null)
        or
        (target_branch_id is not null and (m.branch_id is null or m.branch_id = target_branch_id))
      )
      and p.code = permission_code
  )
$$;

revoke all on function private.actor_has_active_membership(uuid, uuid) from public, anon, authenticated;
revoke all on function private.actor_has_permission(text, uuid, uuid) from public, anon, authenticated;
grant execute on function private.actor_has_active_membership(uuid, uuid) to flow_runtime, flow_identity;
grant execute on function private.actor_has_permission(text, uuid, uuid) to flow_runtime, flow_identity;

-- app.roles is a tenant-wide authorization-control surface. System/global role
-- semantics remain deferred, so runtime policies intentionally require tenant_id.
drop policy if exists tenant_actor_isolation on app.roles;
drop policy if exists roles_runtime_select on app.roles;
drop policy if exists roles_runtime_insert on app.roles;
drop policy if exists roles_runtime_update on app.roles;
drop policy if exists roles_runtime_delete on app.roles;

create policy roles_runtime_select on app.roles
for select to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('role.view', tenant_id, null)
);

create policy roles_runtime_insert on app.roles
for insert to flow_runtime
with check (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('role.manage', tenant_id, null)
);

create policy roles_runtime_update on app.roles
for update to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('role.manage', tenant_id, null)
)
with check (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('role.manage', tenant_id, null)
);

create policy roles_runtime_delete on app.roles
for delete to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('role.manage', tenant_id, null)
);

-- app.memberships may be tenant-wide (branch_id null) or branch-scoped. Reads
-- and writes therefore resolve permission at the row's exact scope.
drop policy if exists tenant_actor_isolation on app.memberships;
drop policy if exists memberships_runtime_select on app.memberships;
drop policy if exists memberships_runtime_insert on app.memberships;
drop policy if exists memberships_runtime_update on app.memberships;
drop policy if exists memberships_runtime_delete on app.memberships;

create policy memberships_runtime_select on app.memberships
for select to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.view', tenant_id, branch_id)
);

create policy memberships_runtime_insert on app.memberships
for insert to flow_runtime
with check (
  tenant_id = private.current_tenant_id()
  and (
    private.actor_has_permission('member.invite', tenant_id, branch_id)
    or private.actor_has_permission('member.manage', tenant_id, branch_id)
  )
);

create policy memberships_runtime_update on app.memberships
for update to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.manage', tenant_id, branch_id)
)
with check (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.manage', tenant_id, branch_id)
);

create policy memberships_runtime_delete on app.memberships
for delete to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.manage', tenant_id, branch_id)
);
