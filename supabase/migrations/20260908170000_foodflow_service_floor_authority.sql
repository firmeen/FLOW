-- Durable FoodFlow customer service-request and floor-operation authority.
-- Historical migrations remain immutable; this forward migration grants only the
-- minimum customer surface required for table-scoped service requests.

grant select on foodflow.table_sessions to flow_customer_runtime;
grant select, insert on foodflow.service_requests to flow_customer_runtime;

drop policy if exists customer_runtime_table_session_select on foodflow.table_sessions;
create policy customer_runtime_table_session_select on foodflow.table_sessions
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and id = private.current_customer_table_session_id()
);

-- Customer capability may see and create service requests only for its exact
-- tenant/branch/table/session. It never receives update/delete authority.
drop policy if exists customer_runtime_service_request_select on foodflow.service_requests;
create policy customer_runtime_service_request_select on foodflow.service_requests
for select to flow_customer_runtime
using (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and table_session_id = private.current_customer_table_session_id()
);

drop policy if exists customer_runtime_service_request_insert on foodflow.service_requests;
create policy customer_runtime_service_request_insert on foodflow.service_requests
for insert to flow_customer_runtime
with check (
  tenant_id = private.current_tenant_id()
  and branch_id = private.current_branch_id()
  and table_id = private.current_customer_table_id()
  and table_session_id = private.current_customer_table_session_id()
  and type in ('CALL_STAFF', 'REQUEST_BILL')
  and status = 'OPEN'
  and priority = 'NORMAL'
  and acknowledged_at is null
  and acknowledged_by is null
  and resolved_at is null
  and resolved_by is null
);

comment on policy customer_runtime_table_session_select on foodflow.table_sessions is
  'Customer capability can verify only its exact table-session context.';
comment on policy customer_runtime_service_request_select on foodflow.service_requests is
  'Customer capability can read service requests for its exact table session only.';
comment on policy customer_runtime_service_request_insert on foodflow.service_requests is
  'Customer capability can create only normal-priority CALL_STAFF or REQUEST_BILL requests for its exact table session.';
