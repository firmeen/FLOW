begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
select is(private.actor_has_permission('management.admin.access', '00000000-0000-0000-0000-0000000000a1', null), true, 'owner A has tenant management access');
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'owner role is not implicitly treated as staff access');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a2', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'staff A1 has staff access on A1');
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), false, 'staff A1 has no staff access on sibling A2');
select is(private.actor_has_permission('operations.kitchen.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'staff A1 has no kitchen route capability');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a8', true);
select is(private.actor_has_permission('operations.kitchen.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'kitchen A1 has kitchen route capability');
select is(private.actor_has_permission('kitchen.manage', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), true, 'kitchen A1 has kitchen mutation capability');
select is(private.actor_has_permission('operations.cashier.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'kitchen A1 has no cashier capability');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a9', true);
select is(private.actor_has_permission('operations.cashier.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), true, 'cashier A2 has cashier route capability');
select is(private.actor_has_permission('merchant_payment.collect', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), true, 'cashier A2 has collect capability');
select is(private.actor_has_permission('merchant_payment.void', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), false, 'cashier A2 does not gain payment void implicitly');
select is(private.actor_has_permission('operations.kitchen.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000ac'), false, 'cashier A2 has no kitchen capability');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000b1', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000b3'), true, 'staff B1 has local Tenant B staff capability');
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'staff B1 cannot authorize Tenant A');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000ad', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'credential-bearing actor without membership has no capability');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a5', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'invited membership is not capability authority');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a6', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'suspended membership is not capability authority');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a7', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'revoked membership is not capability authority');
select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a4', true);
select is(private.actor_has_permission('operations.staff.access', '00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a3'), false, 'suspended user has no capability despite active membership');

select set_config('app.actor_id', '30000000-0000-4000-8000-0000000000a1', true);
select is(private.actor_has_permission('permission.that.does.not.exist', '00000000-0000-0000-0000-0000000000a1', null), false, 'unknown permission code never grants authority');

select * from finish();
rollback;
