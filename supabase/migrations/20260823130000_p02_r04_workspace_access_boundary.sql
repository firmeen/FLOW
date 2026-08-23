-- P02/R04 actor-bound workspace discovery boundary.
-- Workspace selectors are never authority. This SECURITY DEFINER function derives
-- executable workspace options from the transaction-local authenticated actor.

create or replace function private.list_actor_workspaces()
returns table (
  membership_id uuid,
  tenant_id uuid,
  role_id uuid,
  authority_scope text,
  tenant_name text,
  branch_id uuid,
  branch_name text,
  branch_code text
)
language sql
stable
security definer
set search_path = pg_catalog, app, private
as $$
  with current_actor as (
    select u.id
    from app.users u
    where u.id = private.current_actor_id()
      and u.status = 'ACTIVE'
  )
  select
    m.id as membership_id,
    m.tenant_id,
    m.role_id,
    case when m.branch_id is null then 'TENANT' else 'BRANCH' end as authority_scope,
    organization.name as tenant_name,
    coalesce(exact_branch.id, tenant_branch.id) as branch_id,
    coalesce(exact_branch.name, tenant_branch.name) as branch_name,
    coalesce(exact_branch.code, tenant_branch.code) as branch_code
  from current_actor actor
  join app.memberships m
    on m.user_id = actor.id
   and m.status = 'ACTIVE'
  join app.organizations organization
    on organization.id = m.tenant_id
   and organization.status = 'ACTIVE'
  join app.roles role
    on role.id = m.role_id
   and role.tenant_id = m.tenant_id
  left join app.branches exact_branch
    on m.branch_id is not null
   and exact_branch.id = m.branch_id
   and exact_branch.tenant_id = m.tenant_id
  left join app.branches tenant_branch
    on m.branch_id is null
   and tenant_branch.tenant_id = m.tenant_id
  where m.branch_id is null or exact_branch.id is not null
  order by
    organization.name,
    m.tenant_id,
    coalesce(exact_branch.name, tenant_branch.name, ''),
    coalesce(exact_branch.id, tenant_branch.id),
    m.id
$$;

revoke all on function private.list_actor_workspaces() from public, anon, authenticated, flow_runtime;
grant execute on function private.list_actor_workspaces() to flow_identity;
