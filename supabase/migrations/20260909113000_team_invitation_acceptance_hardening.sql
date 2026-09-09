-- Harden invite acceptance around existing identities and disabled credentials.
-- Invitation bearer capability may add membership, but must never reactivate a disabled credential.

create or replace function private.accept_team_invitation(
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
  credential_disabled_at timestamptz;
  credential_found boolean := false;
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

  if not found then
    begin
      insert into app.users (display_name, email, status)
      values (invitation.display_name, invitation.email, 'ACTIVE')
      returning id into target_user_id;
    exception when unique_violation then
      select * into existing_user
      from app.users
      where normalized_email = invitation.normalized_email
      for update;
      if not found then return; end if;
      target_user_id := existing_user.id;
    end;
  else
    target_user_id := existing_user.id;
  end if;

  select * into existing_user from app.users where id = target_user_id for update;
  if existing_user.status in ('SUSPENDED', 'DEACTIVATED') then
    return;
  end if;

  if existing_user.status = 'INVITED' then
    update app.users
    set status = 'ACTIVE',
        display_name = invitation.display_name,
        updated_at = observed_at
    where id = target_user_id;
  end if;

  select credential.disabled_at
    into credential_disabled_at
  from private.user_credentials credential
  where credential.user_id = target_user_id;
  credential_found := found;

  if credential_found and credential_disabled_at is not null then
    -- A disabled credential is a stronger security signal than an invitation.
    -- Recovery/reactivation belongs to a dedicated identity-recovery authority.
    return;
  end if;

  if not credential_found then
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
    );
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
    jsonb_build_object(
      'membershipId', target_membership_id,
      'roleId', invitation.role_id,
      'existingCredential', credential_found
    ),
    null
  );

  return query
  select target_user_id, invitation.normalized_email, credential_found;
end
$$;
