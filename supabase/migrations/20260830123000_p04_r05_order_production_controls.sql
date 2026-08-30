-- P04/R05 durable production-control state.
-- Priority and defer are current operational metadata; immutable history remains
-- in foodflow.order_events. REMAKE reuses the existing lifecycle status and a
-- bounded aggregate counter prevents unbounded remake loops.

alter table foodflow.orders
  add column priority_code text not null default 'NORMAL',
  add column priority_reason text,
  add column prioritized_at timestamptz,
  add column prioritized_by_staff uuid,
  add column defer_reason text,
  add column deferred_at timestamptz,
  add column deferred_until timestamptz,
  add column deferred_by_staff uuid,
  add column remake_count integer not null default 0,
  add column last_remake_reason text,
  add column remake_requested_at timestamptz,
  add column remake_requested_by_staff uuid;

alter table foodflow.orders
  add constraint orders_priority_code_check
    check (priority_code in ('NORMAL', 'URGENT')),
  add constraint orders_priority_reason_check
    check (
      priority_reason is null
      or priority_reason in (
        'CUSTOMER_ESCALATION',
        'SERVICE_RECOVERY',
        'WAIT_TIME',
        'MANAGER_OVERRIDE',
        'SAFETY_OR_QUALITY',
        'OTHER'
      )
    ),
  add constraint orders_priority_state_check
    check (
      (priority_code = 'NORMAL'
        and priority_reason is null
        and prioritized_at is null
        and prioritized_by_staff is null)
      or
      (priority_code = 'URGENT'
        and priority_reason is not null
        and prioritized_at is not null
        and prioritized_by_staff is not null)
    ),
  add constraint orders_defer_reason_check
    check (
      defer_reason is null
      or defer_reason in (
        'CAPACITY',
        'INGREDIENT_WAIT',
        'EQUIPMENT_ISSUE',
        'CUSTOMER_REQUEST',
        'STAFFING',
        'DEPENDENCY',
        'OTHER'
      )
    ),
  add constraint orders_defer_state_check
    check (
      (defer_reason is null
        and deferred_at is null
        and deferred_until is null
        and deferred_by_staff is null)
      or
      (defer_reason is not null
        and deferred_at is not null
        and deferred_by_staff is not null
        and (deferred_until is null or deferred_until >= deferred_at))
    ),
  add constraint orders_remake_count_check
    check (remake_count between 0 and 3),
  add constraint orders_remake_reason_check
    check (
      last_remake_reason is null
      or last_remake_reason in (
        'QUALITY_ISSUE',
        'WRONG_ITEM',
        'MISSING_COMPONENT',
        'TEMPERATURE',
        'DAMAGED_OR_SPILLED',
        'CUSTOMER_REQUEST',
        'STAFF_ERROR',
        'OTHER'
      )
    ),
  add constraint orders_remake_evidence_check
    check (
      (remake_count = 0
        and last_remake_reason is null
        and remake_requested_at is null
        and remake_requested_by_staff is null)
      or
      (remake_count > 0
        and last_remake_reason is not null
        and remake_requested_at is not null
        and remake_requested_by_staff is not null)
    ),
  add constraint orders_prioritized_by_staff_fkey
    foreign key (prioritized_by_staff) references app.users(id) on delete set null,
  add constraint orders_deferred_by_staff_fkey
    foreign key (deferred_by_staff) references app.users(id) on delete set null,
  add constraint orders_remake_requested_by_staff_fkey
    foreign key (remake_requested_by_staff) references app.users(id) on delete set null;

-- The queue now ranks non-deferred work before deferred work and urgent before
-- normal within that group. Keep the index focused on those exact server-owned
-- ordering dimensions plus the existing stable submitted_at/id tie-breaker.
create index orders_branch_production_rank_idx
  on foodflow.orders (
    tenant_id,
    branch_id,
    ((deferred_at is not null)),
    priority_code desc,
    submitted_at,
    id
  )
  where submitted_at is not null;

comment on column foodflow.orders.priority_code is
  'Current internal operational priority. NORMAL/URGENT only; history is in order_events.';
comment on column foodflow.orders.deferred_at is
  'Current active operational defer start. Null means the order is not currently deferred.';
comment on column foodflow.orders.remake_count is
  'Bounded number of successful P04/R05 remake requests for this order (maximum 3).';