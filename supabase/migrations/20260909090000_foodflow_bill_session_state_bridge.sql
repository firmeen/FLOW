-- Keep the table-session financial lifecycle aligned with durable customer bill requests.
-- The trigger is deliberately narrow: CALL_STAFF never changes session state, and payment
-- collection remains the only authority that closes a session.

create or replace function private.sync_foodflow_bill_request_session_state()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, foodflow
as $$
begin
  if new.type <> 'REQUEST_BILL' then
    return new;
  end if;

  if new.status in ('OPEN', 'ACKNOWLEDGED') then
    update foodflow.table_sessions
    set status = 'BILL_REQUESTED', updated_at = now()
    where tenant_id = new.tenant_id
      and branch_id = new.branch_id
      and id = new.table_session_id
      and table_id = new.table_id
      and status = 'ACTIVE';
  elsif new.status = 'RESOLVED' then
    update foodflow.table_sessions
    set status = 'PAYMENT_PENDING', updated_at = now()
    where tenant_id = new.tenant_id
      and branch_id = new.branch_id
      and id = new.table_session_id
      and table_id = new.table_id
      and status = 'BILL_REQUESTED';
  elsif new.status = 'CANCELLED' then
    update foodflow.table_sessions session
    set status = 'ACTIVE', updated_at = now()
    where session.tenant_id = new.tenant_id
      and session.branch_id = new.branch_id
      and session.id = new.table_session_id
      and session.table_id = new.table_id
      and session.status = 'BILL_REQUESTED'
      and not exists (
        select 1
        from foodflow.service_requests request
        where request.tenant_id = new.tenant_id
          and request.table_session_id = new.table_session_id
          and request.type = 'REQUEST_BILL'
          and request.status in ('OPEN', 'ACKNOWLEDGED')
          and request.id <> new.id
      );
  end if;

  return new;
end;
$$;

revoke all on function private.sync_foodflow_bill_request_session_state() from public, anon, authenticated, flow_runtime, flow_customer_runtime;

drop trigger if exists sync_foodflow_bill_request_session_state on foodflow.service_requests;
create trigger sync_foodflow_bill_request_session_state
after insert or update of status on foodflow.service_requests
for each row
execute function private.sync_foodflow_bill_request_session_state();

comment on function private.sync_foodflow_bill_request_session_state() is
  'Bridges durable REQUEST_BILL service state into ACTIVE -> BILL_REQUESTED -> PAYMENT_PENDING table-session state without granting customer runtime direct session mutation authority.';
