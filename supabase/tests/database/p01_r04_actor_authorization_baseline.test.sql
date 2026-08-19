begin;

create extension if not exists pgtap with schema extensions;

-- Test-only grants so pgTAP assertions can execute while current_role is the
-- same constrained role used by application transactions. The transaction is
-- rolled back at the end of this file.
grant usage on schema extensions to flow_runtime;
grant execute on all functions in schema extensions to flow_runtime;

select plan(46);

-- ---------------------------------------------------------------------------
-- Membership helper semantics
-- ---------------------------------------------------------------------------

select set_config('app.actor_id', '', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', null),
  false,
  'missing actor fails active membership'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', null),
  true,
  'tenant-wide actor passes tenant-level membership'
);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  true,
  'tenant-wide actor passes Branch A1 membership check'
);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'),
  true,
  'tenant-wide actor passes Branch A2 membership check'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', null),
  false,
  'branch-only actor does not become tenant-wide when target branch is null'
);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  true,
  'Branch A1 actor passes exact branch check'
);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'),
  false,
  'Branch A1 actor fails same-tenant Branch A2 check'
);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b3'),
  false,
  'Tenant A branch actor fails Tenant B membership check'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a4', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'suspended user fails membership authorization'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a5', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'invited membership fails authorization'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a6', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'suspended membership fails authorization'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a7', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'revoked membership fails authorization'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000b1', true);
select is(
  private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'Tenant B actor fails Tenant A membership check'
);

-- ---------------------------------------------------------------------------
-- Permission helper semantics
-- ---------------------------------------------------------------------------

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
select is(
  private.actor_has_permission('member.manage', '00000000-0000-0000-0000-0000000000a1', null),
  true,
  'manager fixture has member.manage tenant-wide'
);
select is(
  private.actor_has_permission('role.manage', '00000000-0000-0000-0000-0000000000a1', null),
  true,
  'manager fixture has role.manage tenant-wide'
);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', null),
  true,
  'manager fixture resolves assigned ordinary permission tenant-wide'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  true,
  'staff fixture resolves assigned permission on exact branch'
);
select is(
  private.actor_has_permission('member.manage', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'staff fixture lacks member.manage'
);
select is(
  private.actor_has_permission('role.manage', '00000000-0000-0000-0000-0000000000a1', null),
  false,
  'branch staff cannot resolve tenant-wide role.manage'
);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'),
  false,
  'staff permission fails on wrong same-tenant branch'
);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b3'),
  false,
  'staff permission fails across tenants'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a4', true);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'suspended user cannot resolve assigned permission'
);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a7', true);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'revoked membership cannot resolve assigned permission'
);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a5', true);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'invited membership cannot resolve assigned permission'
);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a6', true);
select is(
  private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'),
  false,
  'suspended membership cannot resolve assigned permission'
);

-- ---------------------------------------------------------------------------
-- Actual RLS relation behavior under flow_runtime
-- ---------------------------------------------------------------------------

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '', true);
select set_config('app.actor_id', '', true);
set local role flow_runtime;
select is(
  (select count(*)::bigint from app.branches),
  0::bigint,
  'actorless flow_runtime sees no actor-protected branches'
);
reset role;

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
set local role flow_runtime;
select is(
  (select count(*)::bigint from app.organizations where id = '00000000-0000-0000-0000-0000000000a1'),
  1::bigint,
  'tenant-wide actor sees Tenant A organization'
);
select is(
  (select count(*)::bigint from app.branches where tenant_id = '00000000-0000-0000-0000-0000000000a1'),
  2::bigint,
  'tenant-wide actor sees both Tenant A branches'
);
reset role;

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
set local role flow_runtime;
select is(
  (select count(*)::bigint from app.branches where tenant_id = '00000000-0000-0000-0000-0000000000a1'),
  1::bigint,
  'Branch A1 actor sees only one Tenant A branch'
);
select is(
  (select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'),
  1::bigint,
  'Branch A1 actor sees Branch A1'
);
select is(
  (select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000ac'),
  0::bigint,
  'Branch A1 actor cannot see Branch A2'
);
select is(
  (select count(*)::bigint from app.organizations where id = '00000000-0000-0000-0000-0000000000a1'),
  0::bigint,
  'Branch A1 actor does not gain tenant-wide organization access'
);
reset role;

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000b1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000b3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
set local role flow_runtime;
select is(
  (select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000b3'),
  0::bigint,
  'Tenant A actor cannot see Tenant B branch'
);
reset role;

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000b1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000b3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000b1', true);
set local role flow_runtime;
select is(
  (select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000b3'),
  1::bigint,
  'valid Tenant B branch actor sees Branch B1'
);
reset role;

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a4', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 0::bigint, 'suspended user is denied by actual RLS');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a5', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 0::bigint, 'invited membership is denied by actual RLS');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a6', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 0::bigint, 'suspended membership is denied by actual RLS');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a7', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 0::bigint, 'revoked membership is denied by actual RLS');
reset role;

-- ---------------------------------------------------------------------------
-- Authorization-control self-elevation denial
-- ---------------------------------------------------------------------------

select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
set local role flow_runtime;
select lives_ok(
  $$ update app.memberships
     set role_id = '50000000-0000-4000-8000-0000000000a1'
     where id = '60000000-0000-4000-8000-0000000000a2' $$,
  'ordinary staff self-role update is filtered instead of elevated'
);
reset role;
select is(
  (select role_id::text from app.memberships where id = '60000000-0000-4000-8000-0000000000a2'),
  '50000000-0000-4000-8000-0000000000a2',
  'ordinary staff cannot change its membership to manager role'
);

set local role flow_runtime;
select lives_ok(
  $$ update app.memberships
     set status = 'ACTIVE'
     where id = '60000000-0000-4000-8000-0000000000a7' $$,
  'ordinary staff revoked-membership update is filtered'
);
reset role;
select is(
  (select status from app.memberships where id = '60000000-0000-4000-8000-0000000000a7'),
  'REVOKED',
  'ordinary staff cannot reactivate a revoked membership'
);

set local role flow_runtime;
select throws_ok(
  $$ insert into app.memberships (id, tenant_id, user_id, role_id, branch_id, status)
     values (
       '60000000-0000-4000-8000-0000000000f1',
       '00000000-0000-0000-0000-0000000000a1',
       '30000000-0000-4000-8000-0000000000a2',
       '50000000-0000-4000-8000-0000000000a2',
       null,
       'ACTIVE'
     ) $$,
  '42501',
  null,
  'ordinary branch staff cannot create a tenant-wide membership for itself'
);
select throws_ok(
  $$ insert into app.roles (id, tenant_id, code, name, system)
     values (
       '50000000-0000-4000-8000-0000000000f1',
       '00000000-0000-0000-0000-0000000000a1',
       'R04_ESCALATION',
       'R04 Escalation',
       false
     ) $$,
  '42501',
  null,
  'ordinary staff cannot create a role for privilege escalation'
);
select lives_ok(
  $$ update app.roles
     set name = 'R04 Staff Escalated'
     where id = '50000000-0000-4000-8000-0000000000a2' $$,
  'ordinary staff role update is filtered'
);
reset role;
select is(
  (select name from app.roles where id = '50000000-0000-4000-8000-0000000000a2'),
  'R04 Staff',
  'ordinary staff cannot alter its role definition'
);

select * from finish();
rollback;
