begin;

create extension if not exists pgtap with schema extensions;
grant usage on schema extensions to flow_identity;
grant execute on all functions in schema extensions to flow_identity;

select plan(16);

select ok(
  has_function_privilege('flow_identity', 'private.list_actor_workspaces()', 'EXECUTE'),
  'flow_identity may execute actor-bound workspace discovery'
);
select ok(
  not has_function_privilege('flow_runtime', 'private.list_actor_workspaces()', 'EXECUTE'),
  'flow_runtime cannot bypass AccessContext discovery boundary'
);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 2::bigint, 'tenant-wide owner sees exactly two Tenant A branch choices');
select is(
  (select string_agg(branch_id::text, ',' order by branch_id::text) from private.list_actor_workspaces()),
  '00000000-0000-0000-0000-0000000000a3,00000000-0000-0000-0000-0000000000ac',
  'tenant-wide owner sees only Branch A1 and A2'
);
select ok((select bool_and(authority_scope = 'TENANT') from private.list_actor_workspaces()), 'owner discovery preserves tenant-wide authority scope');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 1::bigint, 'Staff A1 sees one executable workspace');
select is((select branch_id::text from private.list_actor_workspaces()), '00000000-0000-0000-0000-0000000000a3', 'Staff A1 sees only Branch A1');
select is((select tenant_id::text from private.list_actor_workspaces()), '00000000-0000-0000-0000-0000000000a1', 'Staff A1 remains inside Tenant A');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000b1', true);
set local role flow_identity;
select is((select tenant_id::text from private.list_actor_workspaces()), '00000000-0000-0000-0000-0000000000b1', 'Tenant B staff discovers only Tenant B');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000ad', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 0::bigint, 'no-membership actor discovers zero workspaces');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a5', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 0::bigint, 'invited membership is not executable authority');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a6', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 0::bigint, 'suspended membership is not executable authority');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a7', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 0::bigint, 'revoked membership is not executable authority');
reset role;

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a4', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 0::bigint, 'suspended user cannot resolve workspace despite active membership');
reset role;

update app.memberships
set status = 'REVOKED'
where id = '60000000-0000-4000-8000-0000000000a2';
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
set local role flow_identity;
select is((select count(*)::bigint from private.list_actor_workspaces()), 0::bigint, 'revocation takes effect on the next discovery');
reset role;

update app.memberships
set status = 'ACTIVE', role_id = '50000000-0000-4000-8000-0000000000a1'
where id = '60000000-0000-4000-8000-0000000000a2';
set local role flow_identity;
select is((select role_id::text from private.list_actor_workspaces()), '50000000-0000-4000-8000-0000000000a1', 'role reassignment is visible on the next discovery');
reset role;

select * from finish();
rollback;
