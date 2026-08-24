-- P03/R05 persistence-backed customer command idempotency and replay safety.
-- Internal request/replay state is private operational data and is exposed only
-- through two narrowly-scoped SECURITY DEFINER functions. It is intentionally
-- excluded from the generated application Database type surface.

create table private.customer_command_idempotency (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  customer_capability_id uuid not null,
  command text not null,
  key_digest text not null,
  request_fingerprint text not null,
  status text not null default 'IN_PROGRESS',
  response_status integer,
  response_version integer,
  response_body jsonb,
  resource_type text,
  resource_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  constraint customer_command_idempotency_command_check check (
    command in ('CART_ADD_ITEM', 'CART_UPDATE_ITEM', 'CART_REMOVE_ITEM', 'ORDER_SUBMIT')
  ),
  constraint customer_command_idempotency_key_digest_check check (
    key_digest ~ '^[0-9a-f]{64}$'
  ),
  constraint customer_command_idempotency_fingerprint_check check (
    request_fingerprint ~ '^[0-9a-f]{64}$'
  ),
  constraint customer_command_idempotency_status_check check (
    status in ('IN_PROGRESS', 'SUCCEEDED')
  ),
  constraint customer_command_idempotency_response_check check (
    (
      status = 'IN_PROGRESS'
      and response_status is null
      and response_version is null
      and response_body is null
      and resource_type is null
      and resource_id is null
    )
    or (
      status = 'SUCCEEDED'
      and response_status between 200 and 299
      and response_version = 1
      and response_body is not null
      and ((resource_type is null and resource_id is null) or (resource_type is not null and resource_id is not null))
    )
  ),
  constraint customer_command_idempotency_expiry_check check (expires_at > created_at),
  constraint customer_command_idempotency_scope_key_unique unique (
    tenant_id,
    branch_id,
    customer_capability_id,
    command,
    key_digest
  ),
  foreign key (tenant_id, branch_id)
    references app.branches(tenant_id, id)
    on delete restrict
);

create index customer_command_idempotency_expires_idx
  on private.customer_command_idempotency (expires_at, id);

alter table private.customer_command_idempotency enable row level security;

-- No application role receives direct table access. RLS therefore remains a
-- fail-closed defense if privileges are broadened accidentally in the future.
revoke all on table private.customer_command_idempotency
  from public, anon, authenticated, flow_runtime, flow_identity,
       flow_authenticator, flow_customer_entry, flow_customer_runtime;

create or replace function private.acquire_customer_command_idempotency(
  p_command text,
  p_key_digest text,
  p_request_fingerprint text
)
returns table (
  record_id uuid,
  acquisition text,
  response_status integer,
  response_version integer,
  response_body jsonb,
  resource_type text,
  resource_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
declare
  v_tenant_id uuid := private.current_tenant_id();
  v_branch_id uuid := private.current_branch_id();
  v_capability_id uuid := private.current_customer_capability_id();
  v_inserted_id uuid;
  v_record private.customer_command_idempotency%rowtype;
begin
  if v_tenant_id is null or v_branch_id is null or v_capability_id is null then
    raise exception 'customer command context is incomplete' using errcode = '42501';
  end if;

  if p_command not in ('CART_ADD_ITEM', 'CART_UPDATE_ITEM', 'CART_REMOVE_ITEM', 'ORDER_SUBMIT') then
    raise exception 'invalid customer command code' using errcode = '22023';
  end if;
  if p_key_digest is null or p_key_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid idempotency key digest' using errcode = '22023';
  end if;
  if p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid request fingerprint' using errcode = '22023';
  end if;

  insert into private.customer_command_idempotency (
    tenant_id,
    branch_id,
    customer_capability_id,
    command,
    key_digest,
    request_fingerprint
  ) values (
    v_tenant_id,
    v_branch_id,
    v_capability_id,
    p_command,
    p_key_digest,
    p_request_fingerprint
  )
  on conflict on constraint customer_command_idempotency_scope_key_unique do nothing
  returning id into v_inserted_id;

  if v_inserted_id is not null then
    return query
      select v_inserted_id, 'OWNER'::text, null::integer, null::integer,
             null::jsonb, null::text, null::uuid;
    return;
  end if;

  select record.*
  into v_record
  from private.customer_command_idempotency record
  where record.tenant_id = v_tenant_id
    and record.branch_id = v_branch_id
    and record.customer_capability_id = v_capability_id
    and record.command = p_command
    and record.key_digest = p_key_digest;

  if not found then
    raise exception 'customer idempotency acquisition unavailable' using errcode = '55000';
  end if;

  if v_record.request_fingerprint <> p_request_fingerprint then
    return query
      select v_record.id, 'MISMATCH'::text, null::integer, null::integer,
             null::jsonb, null::text, null::uuid;
    return;
  end if;

  if v_record.expires_at <= now() then
    return query
      select v_record.id, 'EXPIRED'::text, null::integer, null::integer,
             null::jsonb, null::text, null::uuid;
    return;
  end if;

  if v_record.status = 'SUCCEEDED' then
    return query
      select v_record.id, 'REPLAY'::text, v_record.response_status,
             v_record.response_version, v_record.response_body,
             v_record.resource_type, v_record.resource_id;
    return;
  end if;

  -- A committed IN_PROGRESS row is not expected with the one-transaction R05
  -- design. Returning it explicitly lets the service fail closed instead of
  -- executing a second mutation if an invariant is ever violated.
  return query
    select v_record.id, 'IN_PROGRESS'::text, null::integer, null::integer,
           null::jsonb, null::text, null::uuid;
end;
$$;

create or replace function private.complete_customer_command_idempotency(
  p_record_id uuid,
  p_response_status integer,
  p_response_version integer,
  p_response_body jsonb,
  p_resource_type text,
  p_resource_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
declare
  v_tenant_id uuid := private.current_tenant_id();
  v_branch_id uuid := private.current_branch_id();
  v_capability_id uuid := private.current_customer_capability_id();
  v_updated_id uuid;
begin
  if v_tenant_id is null or v_branch_id is null or v_capability_id is null then
    raise exception 'customer command context is incomplete' using errcode = '42501';
  end if;
  if p_response_status not between 200 and 299 or p_response_version <> 1 or p_response_body is null then
    raise exception 'invalid idempotency completion result' using errcode = '22023';
  end if;
  if (p_resource_type is null) <> (p_resource_id is null) then
    raise exception 'idempotency resource fields must be both null or both present' using errcode = '22023';
  end if;

  update private.customer_command_idempotency record
  set
    status = 'SUCCEEDED',
    response_status = p_response_status,
    response_version = p_response_version,
    response_body = p_response_body,
    resource_type = p_resource_type,
    resource_id = p_resource_id,
    updated_at = now()
  where record.id = p_record_id
    and record.tenant_id = v_tenant_id
    and record.branch_id = v_branch_id
    and record.customer_capability_id = v_capability_id
    and record.status = 'IN_PROGRESS'
  returning record.id into v_updated_id;

  return v_updated_id is not null;
end;
$$;

revoke all on function private.acquire_customer_command_idempotency(text, text, text)
  from public, anon, authenticated, flow_runtime, flow_identity,
       flow_authenticator, flow_customer_entry, flow_customer_runtime;
revoke all on function private.complete_customer_command_idempotency(uuid, integer, integer, jsonb, text, uuid)
  from public, anon, authenticated, flow_runtime, flow_identity,
       flow_authenticator, flow_customer_entry, flow_customer_runtime;

grant execute on function private.acquire_customer_command_idempotency(text, text, text)
  to flow_customer_runtime;
grant execute on function private.complete_customer_command_idempotency(uuid, integer, integer, jsonb, text, uuid)
  to flow_customer_runtime;

comment on table private.customer_command_idempotency is
  'P03/R05 scoped customer command request/replay records. Raw idempotency keys and bearer capability tokens are never stored.';
comment on function private.acquire_customer_command_idempotency(text, text, text) is
  'Atomically acquires a customer command request identity or returns its committed replay classification using transaction-local customer scope.';
comment on function private.complete_customer_command_idempotency(uuid, integer, integer, jsonb, text, uuid) is
  'Completes exactly one owned IN_PROGRESS customer idempotency record inside the same business transaction.';
