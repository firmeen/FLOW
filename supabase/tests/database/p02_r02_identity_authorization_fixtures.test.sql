begin;

create extension if not exists pgtap with schema extensions;

grant usage on schema extensions to flow_runtime;
grant execute on all functions in schema extensions to flow_runtime;

select plan(52);

-- Deterministic identity and credential presence.
select is((select count(*)::bigint from app.users where email like '%@flow.test'), 13::bigint, 'R02 has thirteen synthetic identity fixtures');
select is((select count(distinct normalized_email)::bigint from app.users where email like '%@flow.test'), 13::bigint, 'R02 normalized emails are unique');
select ok(exists(select 1 from app.roles where id = '50000000-0000-4000-8000-0000000000a3' and code = 'KITCHEN'), 'kitchen role exists under Tenant A');
select ok(exists(select 1 from app.roles where id = '50000000-0000-4000-8000-0000000000a4' and code = 'CASHIER'), 'cashier role exists under Tenant A');
select is((select count(*)::bigint from private.user_credentials where user_id = '30000000-0000-4000-8000-0000000000a1'), 1::bigint, 'owner credential exists');
select ok((select disabled_at is null from private.user_credentials where user_id = '30000000-0000-4000-8000-0000000000a1'), 'owner credential is enabled');
select ok((select disabled_at is not null from private.user_credentials where user_id = '30000000-0000-4000-8000-0000000000aa'), 'disabled credential fixture is disabled');
select is((select count(*)::bigint from private.user_credentials where user_id = '30000000-0000-4000-8000-0000000000ab'), 0::bigint, 'no-credential fixture has no credential row');
select is((select count(*)::bigint from private.user_credentials where user_id = '30000000-0000-4000-8000-0000000000ad'), 1::bigint, 'no-membership fixture still has an enabled credential');

-- R01 pre-auth lookup semantics over R02 fixtures.
select is((select user_id::text from private.lookup_login_credential('owner.a@flow.test')), '30000000-0000-4000-8000-0000000000a1', 'owner email resolves deterministic credential candidate');
select is((select user_id::text from private.lookup_login_credential('  OWNER.A@FLOW.TEST  ')), '30000000-0000-4000-8000-0000000000a1', 'credential lookup uses canonical case and whitespace normalization');
select is((select count(*)::bigint from private.lookup_login_credential('suspended.a1@flow.test')), 0::bigint, 'suspended user is not an eligible credential candidate');
select is((select count(*)::bigint from private.lookup_login_credential('disabled.a1@flow.test')), 0::bigint, 'disabled credential is not an eligible credential candidate');
select is((select count(*)::bigint from private.lookup_login_credential('nocredential.a1@flow.test')), 0::bigint, 'missing credential returns no candidate');
select is((select count(*)::bigint from private.lookup_login_credential('unknown@flow.test')), 0::bigint, 'unknown email returns no credential candidate');

-- Membership scope matrix.
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', null), true, 'manager has tenant-wide Tenant A membership');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'staff A1 has exact Branch A1 membership');
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), false, 'staff A1 is denied Branch A2 membership');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a3', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), true, 'staff A2 has exact Branch A2 membership');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000b1', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b3'), true, 'Tenant B staff has exact Branch B1 membership');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000ad', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'credential-bearing no-membership actor has no authorization');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a8', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'kitchen actor has exact Branch A1 membership');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a9', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), true, 'cashier actor has exact Branch A2 membership');

-- Permission matrix.
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
select is(private.actor_has_permission('management.admin.access', '00000000-0000-0000-0000-0000000000a1', null), true, 'manager has management.admin.access');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'staff A1 has operations.staff.access on A1');
select is(private.actor_has_permission('role.manage', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'staff A1 cannot manage roles');
select is(private.actor_has_permission('order.view', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), false, 'staff A1 cannot use order.view on A2');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a8', true);
select is(private.actor_has_permission('kitchen.manage', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'kitchen A1 can manage kitchen on A1');
select is(private.actor_has_permission('operations.cashier.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'kitchen A1 has no cashier access');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a9', true);
select is(private.actor_has_permission('merchant_payment.collect', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), true, 'cashier A2 can collect merchant payments on A2');
select is(private.actor_has_permission('operations.kitchen.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), false, 'cashier A2 has no kitchen access');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000b1', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b3'), true, 'Tenant B staff has local staff permission');
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'Tenant B staff cannot resolve Tenant A staff permission');

-- Inactive states remain independent denial reasons.
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a5', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'invited membership denies authorization');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a6', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'suspended membership denies authorization');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a7', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'revoked membership denies authorization');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a4', true);
select is(private.actor_has_active_membership('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'suspended user denies authorization despite active membership');

-- Referential and credential safety invariants.
select is((select count(*)::bigint from app.memberships m join app.roles r on r.id = m.role_id where r.tenant_id is distinct from m.tenant_id), 0::bigint, 'membership role tenant always matches membership tenant');
select is((select count(*)::bigint from app.memberships m join app.branches b on b.id = m.branch_id where m.branch_id is not null and b.tenant_id <> m.tenant_id), 0::bigint, 'membership branch tenant always matches membership tenant');
select ok(not has_table_privilege('flow_authenticator', 'private.user_credentials', 'SELECT'), 'authenticator still cannot directly read credentials');
select ok(not has_table_privilege('flow_runtime', 'private.user_credentials', 'SELECT'), 'runtime still cannot directly read credentials');
select ok(not has_table_privilege('flow_identity', 'private.user_credentials', 'SELECT'), 'identity role still cannot directly read credentials');
select is((select count(*)::bigint from private.user_credentials where password_hash like 'flow-test-%'), 0::bigint, 'credential hashes do not contain plaintext test passwords');
select ok(exists(select 1 from app.memberships where user_id = '30000000-0000-4000-8000-0000000000aa' and status = 'ACTIVE'), 'disabled credential fixture keeps active membership to isolate credential denial');
select ok(exists(select 1 from app.memberships where user_id = '30000000-0000-4000-8000-0000000000ab' and status = 'ACTIVE'), 'no-credential fixture keeps active membership to isolate credential absence');
select is((select count(*)::bigint from app.memberships where user_id = '30000000-0000-4000-8000-0000000000ad'), 0::bigint, 'no-membership fixture has no membership row');

-- RLS behavior for new operational personas.
select set_config('app.tenant_id', '00000000-0000-0000-0000-0000000000a1', true);
select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a8', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 1::bigint, 'kitchen A1 sees Branch A1');
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000ac'), 0::bigint, 'kitchen A1 cannot see Branch A2');
reset role;

select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000ac', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a9', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000ac'), 1::bigint, 'cashier A2 sees Branch A2');
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 0::bigint, 'cashier A2 cannot see Branch A1');
reset role;

select set_config('app.branch_id', '00000000-0000-0000-0000-0000000000a3', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000ad', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where id = '00000000-0000-0000-0000-0000000000a3'), 0::bigint, 'no-membership credential actor sees no protected Branch A1 row');
reset role;

select set_config('app.branch_id', '', true);
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
set local role flow_runtime;
select is((select count(*)::bigint from app.branches where tenant_id = '00000000-0000-0000-0000-0000000000a1'), 2::bigint, 'tenant-wide manager sees both Tenant A branches');
reset role;

select * from finish();
rollback;
