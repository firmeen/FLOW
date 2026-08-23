-- P03/R04 customer command submission primitive.
-- The customer runtime keeps no general UPDATE authority on orders. Submission is
-- exposed only through this exact owned DRAFT -> PENDING_CONFIRMATION transition.

create or replace function private.submit_customer_order(p_order_id uuid)
returns table (
  id uuid,
  order_number text,
  status text,
  customer_status text,
  submitted_at timestamptz,
  subtotal_minor bigint,
  currency text,
  source_cart_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_now timestamptz := clock_timestamp();
begin
  return query
  update foodflow.orders customer_order
  set
    status = 'PENDING_CONFIRMATION',
    customer_status = 'SENT',
    submitted_at = v_now,
    -- This schema-required value is an internal submission marker derived from the
    -- immutable order UUID. It is not the P03/R05 request idempotency/replay key.
    submission_key = 'order:' || customer_order.id::text,
    -- Display/reference only. Authorization continues to use the opaque order UUID
    -- plus customer ownership/RLS; the number is never an access credential.
    order_number = 'FF-' || upper(substr(replace(customer_order.id::text, '-', ''), 1, 12)),
    updated_at = v_now
  where customer_order.id = p_order_id
    and customer_order.status = 'DRAFT'
    and customer_order.customer_status is null
    and customer_order.submitted_at is null
    and customer_order.submission_key is null
    and customer_order.source_cart_id is not null
    and customer_order.tenant_id = private.current_tenant_id()
    and customer_order.restaurant_id = private.current_customer_restaurant_id()
    and customer_order.branch_id = private.current_branch_id()
    and customer_order.table_id = private.current_customer_table_id()
    and customer_order.customer_capability_id = private.current_customer_capability_id()
    and customer_order.table_session_id is not distinct from private.current_customer_table_session_id()
    and exists (
      select 1
      from foodflow.carts source_cart
      where source_cart.tenant_id = customer_order.tenant_id
        and source_cart.id = customer_order.source_cart_id
        and source_cart.branch_id = customer_order.branch_id
        and source_cart.table_id = customer_order.table_id
        and source_cart.customer_capability_id = customer_order.customer_capability_id
        and source_cart.table_session_id is not distinct from customer_order.table_session_id
        and source_cart.status = 'DRAFT'
    )
  returning
    customer_order.id,
    customer_order.order_number,
    customer_order.status,
    customer_order.customer_status,
    customer_order.submitted_at,
    customer_order.subtotal_minor,
    customer_order.currency,
    customer_order.source_cart_id;
end;
$$;

revoke all on function private.submit_customer_order(uuid)
  from public, anon, authenticated, flow_runtime, flow_identity, flow_authenticator, flow_customer_entry;
grant execute on function private.submit_customer_order(uuid) to flow_customer_runtime;

comment on function private.submit_customer_order(uuid) is
  'P03/R04 exact customer-owned DRAFT order submission transition. No arbitrary order UPDATE or operational status transition is exposed.';
