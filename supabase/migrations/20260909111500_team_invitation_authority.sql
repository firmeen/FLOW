-- Durable owner-managed team invitations. Raw bearer tokens are never persisted.

create table private.team_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.organizations(id) on delete cascade,
  email text not null check (btrim(email) <> ''),
  normalized_email text generated always as (lower(btrim(email))) stored,
  display_name text not null check (btrim(display_name) <> ''),
  role_id uuid not null,
  branch_id uuid,
  token_digest text not null unique check (token_digest ~ '^[a-f0-9]{64}$'),
  invited_by uuid not null references app.users(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, role_id) references app.roles(tenant_id, id) on delete restrict,
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict,
  check (expires_at > created_at),
  check (not (accepted_at is not null and revoked_at is not null))
);

create index team_invitations_tenant_created_idx
  on private.team_invitations (tenant_id, created_at desc);
create index team_invitations_tenant_email_idx
  on private.team_invitations (tenant_id, normalized_email);
create unique index team_invitations_one_pending_email
  on private.team_invitations (tenant_id, normalized_email)
  where accepted_at is null and revoked_at is null;

alter table private.team_invitations enable row level security;
alter table private.team_invitations force row level security;

revoke all on private.team_invitations from public, anon, authenticated, flow_identity, flow_authenticator;
grant select, insert, update on private.team_invitations to flow_runtime;

create policy team_invitation_read on private.team_invitations
for select to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.view', tenant_id, null)
);

create policy team_invitation_create on private.team_invitations
for insert to flow_runtime
with check (
  tenant_id = private.current_tenant_id()
  and invited_by = private.current_actor_id()
  and private.actor_has_permission('member.invite', tenant_id, null)
);

create policy team_invitation_update on private.team_invitations
for update to flow_runtime
using (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.invite', tenant_id, null)
)
with check (
  tenant_id = private.current_tenant_id()
  and private.actor_has_permission('member.invite', tenant_id, null)
);

create function private.lookup_team_invitation(
  invite_digest text,
  observed_at timestamptz default now()
)
returns table (
  invitation_id uuid,
  tenant_id uuid,
  tenant_name text,
  email text,
  display_name text,
  role_name text,
  branch_name text,
  expires_at timestamptz,
  is_active boolean
)
language sql
stable
security definer
set search_path = pg_catalog, app, private
as $$
  select
    invitation.id,
    invitation.tenant_id,
    organization.name,
    invitation.email,
    invitation.display_name,
    role.name,
    branch.name,
    invitation.expires_at,
    (
      invitation.accepted_at is null
      and invitation.revoked_at is null
      and invitation.expires_at > observed_at
    )
  from private.team_invitations invitation
  join app.organizations organization on organization.id = invitation.tenant_id
  join app.roles role
    on role.tenant_id = invitation.tenant_id
   and role.id = invitation.role_id
  left join app.branches branch
    on branch.tenant_id = invitation.tenant_id
   and branch.id = invitation.branch_id
  where invitation.token_digest = invite_digest
    and invite_digest ~ '^[a-f0-9]{64}$'
  limit 1
$$;

create function private.accept_team_invitation(
  invite_digest text,
  encoded_password text,
  observed_at timestamptz default now()
)
returns table (
  user_id uuid,
  normalized_email text,
  existing_credential boolean
)
language plpgsql
volatile
security definer
set search_path = pg_catalog, app, private, audit
as $$
declare
  invitation private.team_invitations%rowtype;
  existing_user app.users%rowtype;
  target_user_id uuid;
  target_membership_id uuid;
  already_has_credential boolean;
begin
  if invite_digest !~ '^[a-f0-9]{64}$'
     or encoded_password is null
     or encoded_password !~ '^scrypt-v1\$'
     or length(encoded_password) > 512 then
    return;
  end if;

  select * into invitation
  from private.team_invitations
  where token_digest = invite_digest
  for update;

  if not found
     or invitation.accepted_at is not null
     or invitation.revoked_at is not null
     or invitation.expires_at <= observed_at then
    return;
  end if;

  select * into existing_user
  from app.users
  where normalized_email = invitation.normalized_email
  for update;

  if found and existing_user.status in ('SUSPENDED', 'DEACTIVATED') then
    return;
  end if;

  if not found then
    insert into app.users (display_name, email, status)
    values (invitation.display_name, invitation.email, 'ACTIVE')
    returning id into target_user_id;
  else
    target_user_id := existing_user.id;
    if existing_user.status = 'INVITED' then
      update app.users
      set status = 'ACTIVE',
          display_name = invitation.display_name,
          updated_at = observed_at
      where id = target_user_id;
    end if;
  end if;

  select exists (
    select 1 from private.user_credentials credential
    where credential.user_id = target_user_id
      and credential.disabled_at is null
  ) into already_has_credential;

  if not already_has_credential then
    insert into private.user_credentials (
      user_id,
      password_hash,
      algorithm,
      password_changed_at
    ) values (
      target_user_id,
      encoded_password,
      'scrypt-v1',
      observed_at
    )
    on conflict (user_id) do update
      set password_hash = excluded.password_hash,
          algorithm = excluded.algorithm,
          password_changed_at = excluded.password_changed_at,
          disabled_at = null,
          updated_at = observed_at;
  end if;

  select membership.id into target_membership_id
  from app.memberships membership
  where membership.tenant_id = invitation.tenant_id
    and membership.user_id = target_user_id
    and membership.role_id = invitation.role_id
    and membership.branch_id is not distinct from invitation.branch_id
    and membership.status <> 'REVOKED'
  order by membership.created_at desc
  limit 1
  for update;

  if target_membership_id is null then
    insert into app.memberships (
      tenant_id,
      user_id,
      role_id,
      branch_id,
      status
    ) values (
      invitation.tenant_id,
      target_user_id,
      invitation.role_id,
      invitation.branch_id,
      'ACTIVE'
    ) returning id into target_membership_id;
  else
    update app.memberships
    set status = 'ACTIVE', updated_at = observed_at
    where id = target_membership_id;
  end if;

  update private.team_invitations
  set accepted_at = observed_at, updated_at = observed_at
  where id = invitation.id;

  insert into audit.events (
    tenant_id,
    branch_id,
    restaurant_id,
    actor_id,
    actor_name_snapshot,
    entity_type,
    entity_id,
    action,
    summary,
    reason,
    metadata,
    correlation_id
  ) values (
    invitation.tenant_id,
    invitation.branch_id,
    null,
    target_user_id,
    invitation.display_name,
    'TEAM_INVITATION',
    invitation.id,
    'TEAM_INVITATION_ACCEPTED',
    'Team invitation accepted',
    null,
    jsonb_build_object('membershipId', target_membership_id, 'roleId', invitation.role_id),
    null
  );

  return query
  select target_user_id, invitation.normalized_email, already_has_credential;
end
$$;

revoke all on function private.lookup_team_invitation(text, timestamptz)
  from public, anon, authenticated, flow_runtime, flow_identity;
revoke all on function private.accept_team_invitation(text, text, timestamptz)
  from public, anon, authenticated, flow_runtime, flow_identity;

grant execute on function private.lookup_team_invitation(text, timestamptz) to flow_authenticator;
grant execute on function private.accept_team_invitation(text, text, timestamptz) to flow_authenticator;
