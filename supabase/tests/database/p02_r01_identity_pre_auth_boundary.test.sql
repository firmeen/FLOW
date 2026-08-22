begin;

select plan(16);

select ok(exists(select 1 from pg_roles where rolname = 'flow_authenticator'), 'flow_authenticator exists');
select ok(not (select rolcanlogin from pg_roles where rolname = 'flow_authenticator'), 'flow_authenticator cannot login');
select ok(not (select rolbypassrls from pg_roles where rolname = 'flow_authenticator'), 'flow_authenticator cannot bypass RLS');
select ok(not (select rolsuper from pg_roles where rolname = 'flow_authenticator'), 'flow_authenticator is not superuser');
select ok(not (select rolcreaterole from pg_roles where rolname = 'flow_authenticator'), 'flow_authenticator cannot create roles');
select ok(not (select rolcreatedb from pg_roles where rolname = 'flow_authenticator'), 'flow_authenticator cannot create databases');

select ok(has_function_privilege('flow_authenticator', 'private.lookup_login_credential(text)', 'EXECUTE'), 'authenticator can execute credential lookup');
select ok(has_function_privilege('flow_authenticator', 'private.record_login_failure(text,timestamptz,integer,integer,integer)', 'EXECUTE'), 'authenticator can record failures');
select ok(not has_function_privilege('flow_runtime', 'private.lookup_login_credential(text)', 'EXECUTE'), 'runtime cannot execute credential lookup');
select ok(not has_function_privilege('flow_identity', 'private.lookup_login_credential(text)', 'EXECUTE'), 'identity cannot execute credential lookup');
select ok(not has_table_privilege('flow_authenticator', 'app.users', 'SELECT'), 'authenticator cannot directly select users');
select ok(not has_table_privilege('flow_authenticator', 'app.memberships', 'SELECT'), 'authenticator cannot directly select memberships');
select ok(not has_table_privilege('flow_authenticator', 'private.user_credentials', 'SELECT'), 'authenticator cannot directly select credentials');
select ok(not has_table_privilege('flow_authenticator', 'private.login_throttles', 'SELECT'), 'authenticator cannot directly select throttles');
select ok(not has_table_privilege('flow_authenticator', 'foodflow.orders', 'SELECT'), 'authenticator cannot directly select orders');
select ok(not has_table_privilege('flow_authenticator', 'payments.payments', 'SELECT'), 'authenticator cannot directly select payments');

select * from finish();
rollback;
