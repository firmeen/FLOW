do $$ begin
  create role flow_customer_entry nologin nobypassrls;
exception when duplicate_object then null;
end $$;

revoke all on schema app, foodflow, payments, audit, private from flow_customer_entry;
grant usage on schema private to flow_customer_entry;
revoke all on all tables in schema app, foodflow, payments, audit, private from flow_customer_entry;
revoke all on all functions in schema private from flow_customer_entry;

create or replace function private.resolve_customer_entry(
  p_restaurant_slug text,
  p_table_code text
)
returns table (
  tenant_id uuid,
  restaurant_id uuid,
  restaurant_slug text,
  restaurant_name text,
  branch_id uuid,
  branch_name text,
  table_id uuid,
  table_code text,
  table_label text,
  table_session_id uuid
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  with candidates as (
    select
      o.id as tenant_id,
      r.id as restaurant_id,
      r.slug as restaurant_slug,
      r.name as restaurant_name,
      b.id as branch_id,
      b.name as branch_name,
      t.id as table_id,
      t.code as table_code,
      t.label as table_label,
      s.id as table_session_id
    from app.organizations o
    join app.restaurants r
      on r.tenant_id = o.id
    join app.branches b
      on b.tenant_id = o.id
     and b.restaurant_id = r.id
    join foodflow.restaurant_tables t
      on t.tenant_id = o.id
     and t.branch_id = b.id
    left join lateral (
      select ts.id
      from foodflow.table_sessions ts
      where ts.tenant_id = o.id
        and ts.branch_id = b.id
        and ts.table_id = t.id
        and ts.status in ('ACTIVE', 'BILL_REQUESTED', 'PAYMENT_PENDING')
      order by ts.opened_at desc, ts.id
      limit 1
    ) s on true
    where o.status = 'ACTIVE'
      and b.is_open = true
      and t.active = true
      and r.slug = lower(btrim(p_restaurant_slug))
      and t.code = btrim(p_table_code)
  ), counted as (
    select candidates.*, count(*) over () as candidate_count
    from candidates
  )
  select
    counted.tenant_id,
    counted.restaurant_id,
    counted.restaurant_slug,
    counted.restaurant_name,
    counted.branch_id,
    counted.branch_name,
    counted.table_id,
    counted.table_code,
    counted.table_label,
    counted.table_session_id
  from counted
  where counted.candidate_count = 1
  limit 1
$$;

create or replace function private.validate_customer_capability_scope(
  p_tenant_id uuid,
  p_restaurant_id uuid,
  p_branch_id uuid,
  p_table_id uuid,
  p_table_session_id uuid
)
returns table (
  tenant_id uuid,
  restaurant_id uuid,
  restaurant_slug text,
  restaurant_name text,
  branch_id uuid,
  branch_name text,
  table_id uuid,
  table_code text,
  table_label text,
  table_session_id uuid
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    o.id as tenant_id,
    r.id as restaurant_id,
    r.slug as restaurant_slug,
    r.name as restaurant_name,
    b.id as branch_id,
    b.name as branch_name,
    t.id as table_id,
    t.code as table_code,
    t.label as table_label,
    p_table_session_id as table_session_id
  from app.organizations o
  join app.restaurants r
    on r.tenant_id = o.id
   and r.id = p_restaurant_id
  join app.branches b
    on b.tenant_id = o.id
   and b.restaurant_id = r.id
   and b.id = p_branch_id
  join foodflow.restaurant_tables t
    on t.tenant_id = o.id
   and t.branch_id = b.id
   and t.id = p_table_id
  where o.id = p_tenant_id
    and o.status = 'ACTIVE'
    and b.is_open = true
    and t.active = true
    and (
      (
        p_table_session_id is null
        and not exists (
          select 1
          from foodflow.table_sessions active_session
          where active_session.tenant_id = o.id
            and active_session.branch_id = b.id
            and active_session.table_id = t.id
            and active_session.status in ('ACTIVE', 'BILL_REQUESTED', 'PAYMENT_PENDING')
        )
      )
      or exists (
        select 1
        from foodflow.table_sessions ts
        where p_table_session_id is not null
          and ts.id = p_table_session_id
          and ts.tenant_id = o.id
          and ts.branch_id = b.id
          and ts.table_id = t.id
          and ts.status in ('ACTIVE', 'BILL_REQUESTED', 'PAYMENT_PENDING')
      )
    )
  limit 1
$$;

revoke all on function private.resolve_customer_entry(text, text) from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator;
revoke all on function private.validate_customer_capability_scope(uuid, uuid, uuid, uuid, uuid) from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator;
grant execute on function private.resolve_customer_entry(text, text) to flow_customer_entry;
grant execute on function private.validate_customer_capability_scope(uuid, uuid, uuid, uuid, uuid) to flow_customer_entry;

comment on role flow_customer_entry is 'Least-privilege P03 customer entry role. Direct table access is denied; only narrow customer entry functions are executable.';
comment on function private.resolve_customer_entry(text, text) is 'Resolve one unambiguous active restaurant/table public selector into narrow customer entry metadata.';
comment on function private.validate_customer_capability_scope(uuid, uuid, uuid, uuid, uuid) is 'Revalidate signed customer capability scope against current tenant, branch, table, and optional table-session state.';
