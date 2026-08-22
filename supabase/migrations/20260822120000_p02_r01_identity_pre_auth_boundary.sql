-- P02/R01: identity determinism and least-privilege pre-authentication boundary.

-- Refuse to create an ambiguous login authority. No arbitrary duplicate winner is allowed.
do $$
begin
  if exists (
    select lower(btrim(email))
    from app.users
    where email is not null and btrim(email) <> ''
    group by lower(btrim(email))
    having count(*) > 1
  ) then
    raise exception 'P02/R01 normalized email collision detected';
  end if;
end
$$;

alter table app.users
  add column normalized_email text generated always as (
    case when email is null then null else lower(btrim(email)) end
  ) stored;

alter table app.users
  add constraint users_normalized_email_nonempty
  check (normalized_email is null or normalized_email <> '');

create unique index users_normalized_email_uidx
  on app.users (normalized_email)
  where normalized_email is not null;

do $$ begin
  create role flow_authenticator nologin nobypassrls nocreatedb nocreaterole noreplication;
exception when duplicate_object then null;
end $$;

grant usage on schema private to flow_authenticator;

create function private.lookup_login_credential(login_email text)
returns table (
  user_id uuid,
  normalized_email text,
  password_hash text,
  algorithm text,
  password_changed_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, app, private
as $$
  select u.id, u.normalized_email, c.password_hash, c.algorithm, c.password_changed_at
  from app.users u
  join private.user_credentials c on c.user_id = u.id
  where u.normalized_email = lower(btrim(login_email))
    and u.status = 'ACTIVE'
    and c.disabled_at is null
    and c.algorithm = 'scrypt-v1'
    and btrim(login_email) <> ''
  limit 1
$$;

create function private.get_login_throttle(subject_digest text, observed_at timestamptz default now())
returns table (
  failure_count integer,
  window_started_at timestamptz,
  blocked_until timestamptz,
  is_blocked boolean
)
language sql
stable
security definer
set search_path = pg_catalog, private
as $$
  select t.failure_count, t.window_started_at, t.blocked_until,
         coalesce(t.blocked_until > observed_at, false)
  from private.login_throttles t
  where t.subject_digest = get_login_throttle.subject_digest
$$;

create function private.record_login_failure(
  subject_digest text,
  observed_at timestamptz,
  failure_limit integer,
  window_seconds integer,
  block_seconds integer
)
returns table (
  failure_count integer,
  window_started_at timestamptz,
  blocked_until timestamptz,
  is_blocked boolean
)
language plpgsql
volatile
security definer
set search_path = pg_catalog, private
as $$
declare
  current_row private.login_throttles%rowtype;
  next_count integer;
  next_window timestamptz;
  next_block timestamptz;
begin
  if btrim(subject_digest) = '' or failure_limit < 1 or window_seconds < 1 or block_seconds < 1 then
    raise exception 'invalid login throttle input';
  end if;

  insert into private.login_throttles as t (
    subject_digest, failure_count, window_started_at, blocked_until, updated_at
  ) values (
    subject_digest, 1, observed_at,
    case when failure_limit <= 1 then observed_at + make_interval(secs => block_seconds) end,
    observed_at
  )
  on conflict (subject_digest) do update
  set
    failure_count = case
      when t.window_started_at + make_interval(secs => window_seconds) <= observed_at then 1
      else t.failure_count + 1
    end,
    window_started_at = case
      when t.window_started_at + make_interval(secs => window_seconds) <= observed_at then observed_at
      else t.window_started_at
    end,
    blocked_until = case
      when t.blocked_until is not null and t.blocked_until > observed_at then t.blocked_until
      when (case when t.window_started_at + make_interval(secs => window_seconds) <= observed_at then 1 else t.failure_count + 1 end) >= failure_limit
        then observed_at + make_interval(secs => block_seconds)
      else null
    end,
    updated_at = observed_at
  returning t.* into current_row;

  return query select current_row.failure_count, current_row.window_started_at,
    current_row.blocked_until, coalesce(current_row.blocked_until > observed_at, false);
end
$$;

create function private.clear_login_failures(subject_digest text)
returns void
language sql
volatile
security definer
set search_path = pg_catalog, private
as $$
  delete from private.login_throttles t where t.subject_digest = clear_login_failures.subject_digest
$$;

revoke all on function private.lookup_login_credential(text) from public, anon, authenticated, flow_runtime, flow_identity;
revoke all on function private.get_login_throttle(text, timestamptz) from public, anon, authenticated, flow_runtime, flow_identity;
revoke all on function private.record_login_failure(text, timestamptz, integer, integer, integer) from public, anon, authenticated, flow_runtime, flow_identity;
revoke all on function private.clear_login_failures(text) from public, anon, authenticated, flow_runtime, flow_identity;

grant execute on function private.lookup_login_credential(text) to flow_authenticator;
grant execute on function private.get_login_throttle(text, timestamptz) to flow_authenticator;
grant execute on function private.record_login_failure(text, timestamptz, integer, integer, integer) to flow_authenticator;
grant execute on function private.clear_login_failures(text) to flow_authenticator;

-- Explicitly preserve execute-only capability. The role must never read these tables directly.
revoke all on app.users, app.memberships from flow_authenticator;
revoke all on private.user_credentials, private.login_throttles from flow_authenticator;
