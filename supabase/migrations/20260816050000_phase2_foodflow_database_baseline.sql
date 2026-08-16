create schema app;
create schema foodflow;
create schema payments;
create schema audit;
create schema private;
create schema billing;
create schema careflow;
create schema jobflow;

revoke all on schema app, foodflow, payments, audit, private, billing, careflow, jobflow from public;
revoke all on schema app, foodflow, payments, audit, private, billing, careflow, jobflow from anon, authenticated;

do $$ begin
  create role flow_runtime nologin nobypassrls;
exception when duplicate_object then null;
end $$;

grant usage on schema app, foodflow, payments, audit to flow_runtime;

create function private.current_tenant_id() returns uuid
language sql stable
set search_path = pg_catalog
as $$ select nullif(current_setting('app.tenant_id', true), '')::uuid $$;

create function private.current_branch_id() returns uuid
language sql stable
set search_path = pg_catalog
as $$ select nullif(current_setting('app.branch_id', true), '')::uuid $$;

create function private.current_actor_id() returns uuid
language sql stable
set search_path = pg_catalog
as $$ select nullif(current_setting('app.actor_id', true), '')::uuid $$;

create function private.set_updated_at() returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.current_tenant_id() to flow_runtime;
grant execute on function private.current_branch_id() to flow_runtime;
grant execute on function private.current_actor_id() to flow_runtime;

create table app.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (btrim(name) <> ''),
  legal_name text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUSPENDED','CLOSED')),
  default_currency text not null check (default_currency ~ '^[A-Z]{3}$'),
  timezone text not null check (btrim(timezone) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create table app.restaurants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null check (btrim(name) <> ''),
  legal_name text,
  slug text not null check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  timezone text not null check (btrim(timezone) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, slug),
  foreign key (tenant_id) references app.organizations(id) on delete restrict
);

create table app.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  name text not null check (btrim(name) <> ''),
  code text not null check (btrim(code) <> ''),
  address_line1 text,
  address_line2 text,
  district text,
  city text,
  postal_code text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  phone text,
  email text,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, restaurant_id, id),
  unique (tenant_id, restaurant_id, code),
  foreign key (tenant_id) references app.organizations(id) on delete restrict,
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict
);

create table app.branch_opening_hours (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  day_of_week text not null check (day_of_week in ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
  is_closed boolean not null default false,
  start_time time,
  end_time time,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (tenant_id, branch_id, day_of_week, display_order),
  check ((is_closed and start_time is null and end_time is null) or (not is_closed and start_time is not null and end_time is not null)),
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete cascade
);

create table app.branch_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  branch_id uuid not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  timezone text not null check (btrim(timezone) <> ''),
  service_charge_enabled boolean not null default false,
  service_charge_bps integer not null default 0 check (service_charge_bps between 0 and 10000),
  vat_enabled boolean not null default false,
  vat_bps integer not null default 0 check (vat_bps between 0 and 10000),
  default_preparation_minutes integer not null default 0 check (default_preparation_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, branch_id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict,
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete cascade
);

create table app.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (btrim(display_name) <> ''),
  email text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INVITED','SUSPENDED','DEACTIVATED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index app_users_email_unique on app.users (lower(email)) where email is not null;

create table app.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid,
  code text not null check (btrim(code) <> ''),
  name text not null check (btrim(name) <> ''),
  system boolean not null default false,
  created_at timestamptz not null default now(),
  unique nulls not distinct (tenant_id, code),
  unique nulls not distinct (tenant_id, id),
  foreign key (tenant_id) references app.organizations(id) on delete restrict
);

create table app.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (btrim(code) <> ''),
  description text,
  created_at timestamptz not null default now()
);

create table app.role_permissions (
  role_id uuid not null references app.roles(id) on delete cascade,
  permission_id uuid not null references app.permissions(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table app.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid not null references app.users(id) on delete restrict,
  role_id uuid not null,
  branch_id uuid,
  status text not null default 'ACTIVE' check (status in ('INVITED','ACTIVE','SUSPENDED','REVOKED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id) references app.organizations(id) on delete restrict,
  foreign key (tenant_id, role_id) references app.roles(tenant_id, id) on delete restrict,
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict
);
create unique index memberships_active_scope_unique on app.memberships (tenant_id, user_id, role_id, coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)) where status in ('INVITED','ACTIVE');

create table foodflow.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  code text not null check (btrim(code) <> ''),
  label text not null check (btrim(label) <> ''),
  seats integer not null check (seats > 0),
  qr_code text not null check (btrim(qr_code) <> ''),
  display_order integer not null default 0 check (display_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, branch_id, id),
  unique (tenant_id, branch_id, code),
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict
);

create table foodflow.table_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  table_id uuid not null,
  session_number text not null check (btrim(session_number) <> ''),
  status text not null check (status in ('ACTIVE','BILL_REQUESTED','PAYMENT_PENDING','CLOSED')),
  guest_count integer not null default 1 check (guest_count > 0),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  customer_capability_digest text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, branch_id, id),
  unique (tenant_id, branch_id, session_number),
  check ((status = 'CLOSED' and closed_at is not null) or status <> 'CLOSED'),
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_id) references foodflow.restaurant_tables(tenant_id, id) on delete restrict
);
create unique index table_sessions_one_active_per_table on foodflow.table_sessions (tenant_id, table_id) where status in ('ACTIVE','BILL_REQUESTED','PAYMENT_PENDING');

create table foodflow.menu_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  name text not null check (btrim(name) <> ''),
  thai_name text,
  description text,
  cover_image_url text,
  display_order integer not null default 0 check (display_order >= 0),
  active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, restaurant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict
);

create table foodflow.menu_badges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  name text not null check (btrim(name) <> ''),
  color text not null,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, restaurant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict
);

create table foodflow.menu_availabilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  name text not null check (btrim(name) <> ''),
  type text not null check (type in ('ALWAYS','SCHEDULED')),
  timezone text not null check (btrim(timezone) <> ''),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, restaurant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict
);

create table foodflow.menu_availability_windows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  availability_id uuid not null,
  day_of_week text not null check (day_of_week in ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
  start_time time not null,
  end_time time not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (tenant_id, availability_id, day_of_week, display_order),
  foreign key (tenant_id, restaurant_id, availability_id) references foodflow.menu_availabilities(tenant_id, restaurant_id, id) on delete cascade
);

create table foodflow.modifier_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  name text not null check (btrim(name) <> ''),
  thai_name text,
  kind text not null check (kind in ('MODIFIER','ADD_ON')),
  required boolean not null default false,
  minimum_selections integer not null default 0 check (minimum_selections >= 0),
  maximum_selections integer not null default 1,
  active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, restaurant_id, id),
  check (maximum_selections >= minimum_selections),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict
);

create table foodflow.modifier_choices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  modifier_group_id uuid not null,
  name text not null check (btrim(name) <> ''),
  thai_name text,
  price_delta_minor bigint not null default 0,
  active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, modifier_group_id, id),
  unique (tenant_id, restaurant_id, modifier_group_id, id),
  foreign key (tenant_id, restaurant_id, modifier_group_id) references foodflow.modifier_groups(tenant_id, restaurant_id, id) on delete restrict
);

create table foodflow.menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  category_id uuid not null,
  availability_id uuid not null,
  name text not null check (btrim(name) <> ''),
  thai_name text,
  description text not null default '',
  thai_description text,
  image_url text,
  image_key text,
  base_price_minor bigint not null check (base_price_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  preparation_station text not null check (btrim(preparation_station) <> ''),
  estimated_preparation_minutes integer not null default 0 check (estimated_preparation_minutes >= 0),
  status text not null check (status in ('DRAFT','ACTIVE','SOLD_OUT','HIDDEN','ARCHIVED')),
  vegetarian boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, restaurant_id, id),
  foreign key (tenant_id, restaurant_id, category_id) references foodflow.menu_categories(tenant_id, restaurant_id, id) on delete restrict,
  foreign key (tenant_id, restaurant_id, availability_id) references foodflow.menu_availabilities(tenant_id, restaurant_id, id) on delete restrict
);

create table foodflow.menu_item_modifier_groups (
  tenant_id uuid not null,
  restaurant_id uuid not null,
  menu_item_id uuid not null,
  modifier_group_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, menu_item_id, modifier_group_id),
  foreign key (tenant_id, restaurant_id, menu_item_id) references foodflow.menu_items(tenant_id, restaurant_id, id) on delete cascade,
  foreign key (tenant_id, restaurant_id, modifier_group_id) references foodflow.modifier_groups(tenant_id, restaurant_id, id) on delete restrict
);

create table foodflow.menu_item_badges (
  tenant_id uuid not null,
  restaurant_id uuid not null,
  menu_item_id uuid not null,
  badge_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, menu_item_id, badge_id),
  foreign key (tenant_id, restaurant_id, menu_item_id) references foodflow.menu_items(tenant_id, restaurant_id, id) on delete cascade,
  foreign key (tenant_id, restaurant_id, badge_id) references foodflow.menu_badges(tenant_id, restaurant_id, id) on delete restrict
);

create table foodflow.carts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  table_id uuid not null,
  table_session_id uuid,
  customer_capability_digest text,
  status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','ABANDONED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_id) references foodflow.restaurant_tables(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_session_id) references foodflow.table_sessions(tenant_id, id) on delete restrict
);

create table foodflow.cart_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  cart_id uuid not null,
  menu_item_id uuid not null,
  quantity integer not null check (quantity > 0),
  special_request text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, cart_id) references foodflow.carts(tenant_id, id) on delete cascade,
  foreign key (tenant_id, menu_item_id) references foodflow.menu_items(tenant_id, id) on delete restrict
);

create table foodflow.cart_item_modifiers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  cart_item_id uuid not null,
  modifier_group_id uuid not null,
  modifier_choice_id uuid not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, cart_item_id, modifier_choice_id),
  foreign key (tenant_id, cart_item_id) references foodflow.cart_items(tenant_id, id) on delete cascade,
  foreign key (tenant_id, modifier_group_id, modifier_choice_id) references foodflow.modifier_choices(tenant_id, modifier_group_id, id) on delete restrict
);

create table foodflow.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  branch_id uuid not null,
  table_id uuid not null,
  table_session_id uuid not null,
  order_number text not null check (btrim(order_number) <> ''),
  status text not null check (status in ('DRAFT','PENDING_CONFIRMATION','ACCEPTED','PREPARING','READY','SERVED','PAYMENT_PENDING','PAID','CLOSED','REJECTED','CANCELLED','CHANGED','REMAKE','VOIDED')),
  customer_status text not null check (customer_status in ('SENT','CONFIRMED','PREPARING','COMING_TO_TABLE','SERVED','REJECTED','CANCELLED')),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  customer_note text,
  submission_key text not null check (btrim(submission_key) <> ''),
  submitted_at timestamptz not null,
  accepted_at timestamptz,
  preparing_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz,
  paid_at timestamptz,
  closed_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  modified_by_staff uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, submission_key),
  unique (tenant_id, branch_id, order_number),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict,
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_id) references foodflow.restaurant_tables(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_session_id) references foodflow.table_sessions(tenant_id, id) on delete restrict,
  foreign key (modified_by_staff) references app.users(id) on delete set null
);

create table foodflow.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  order_id uuid not null,
  menu_item_id uuid,
  menu_item_name text not null,
  menu_item_thai_name text,
  quantity integer not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  line_total_minor bigint not null check (line_total_minor >= 0),
  special_request text,
  preparation_station text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, order_id) references foodflow.orders(tenant_id, id) on delete restrict,
  foreign key (tenant_id, menu_item_id) references foodflow.menu_items(tenant_id, id) on delete restrict
);

create table foodflow.order_item_modifiers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  order_item_id uuid not null,
  modifier_group_id uuid,
  modifier_group_name text not null,
  modifier_choice_id uuid,
  modifier_choice_name text not null,
  price_delta_minor bigint not null,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, order_item_id) references foodflow.order_items(tenant_id, id) on delete restrict
);

create table foodflow.order_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  order_id uuid not null,
  event_type text not null check (btrim(event_type) <> ''),
  from_status text,
  to_status text,
  actor_id uuid,
  reason text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  correlation_id text,
  foreign key (tenant_id, order_id) references foodflow.orders(tenant_id, id) on delete restrict,
  foreign key (actor_id) references app.users(id) on delete set null
);

create table foodflow.kitchen_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  order_id uuid not null,
  table_id uuid not null,
  table_session_id uuid not null,
  order_number_snapshot text not null,
  station text not null,
  status text not null check (status in ('NEW','PREPARING','READY','SERVED','PROBLEM','REMAKE','VOIDED')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ready_at timestamptz,
  served_at timestamptz,
  problem_note text,
  remake_count integer not null default 0 check (remake_count >= 0),
  unique (tenant_id, id),
  foreign key (tenant_id, order_id) references foodflow.orders(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_id) references foodflow.restaurant_tables(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_session_id) references foodflow.table_sessions(tenant_id, id) on delete restrict
);

create table foodflow.kitchen_ticket_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  ticket_id uuid not null,
  order_item_id uuid not null,
  quantity integer not null check (quantity > 0),
  foreign key (tenant_id, ticket_id) references foodflow.kitchen_tickets(tenant_id, id) on delete restrict,
  foreign key (tenant_id, order_item_id) references foodflow.order_items(tenant_id, id) on delete restrict
);

create table foodflow.service_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  branch_id uuid not null,
  table_id uuid not null,
  table_session_id uuid not null,
  type text not null check (type in ('CALL_STAFF','REQUEST_BILL')),
  status text not null check (status in ('OPEN','ACKNOWLEDGED','RESOLVED','CANCELLED')),
  note text,
  priority text not null default 'NORMAL' check (priority in ('NORMAL','HIGH')),
  requested_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at timestamptz,
  resolved_by uuid,
  unique (tenant_id, id),
  foreign key (tenant_id, table_id) references foodflow.restaurant_tables(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_session_id) references foodflow.table_sessions(tenant_id, id) on delete restrict,
  foreign key (acknowledged_by) references app.users(id) on delete set null,
  foreign key (resolved_by) references app.users(id) on delete set null
);
create unique index service_requests_active_dedupe on foodflow.service_requests (tenant_id, table_session_id, type) where status in ('OPEN','ACKNOWLEDGED');

create table payments.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid not null,
  branch_id uuid not null,
  table_id uuid not null,
  table_session_id uuid not null,
  reference text not null,
  method text not null check (method in ('CASH','THAI_QR','CARD_TERMINAL','BANK_TRANSFER','OTHER')),
  status text not null check (status in ('RECORDED','VOIDED')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  discount_type text not null check (discount_type in ('NONE','FIXED','PERCENT')),
  discount_value_minor bigint,
  discount_bps integer,
  discount_amount_minor bigint not null default 0 check (discount_amount_minor >= 0),
  discount_reason text,
  service_charge_enabled boolean not null,
  service_charge_bps integer not null check (service_charge_bps between 0 and 10000),
  service_charge_amount_minor bigint not null check (service_charge_amount_minor >= 0),
  vat_enabled boolean not null,
  vat_bps integer not null check (vat_bps between 0 and 10000),
  vat_amount_minor bigint not null check (vat_amount_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  recorded_at timestamptz not null,
  recorded_by uuid,
  voided_at timestamptz,
  voided_by uuid,
  void_reason text,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  unique (tenant_id, branch_id, reference),
  check (
    (discount_type = 'NONE' and discount_value_minor is null and discount_bps is null) or
    (discount_type = 'FIXED' and discount_value_minor is not null and discount_value_minor >= 0 and discount_bps is null) or
    (discount_type = 'PERCENT' and discount_value_minor is null and discount_bps between 0 and 10000)
  ),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict,
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_id) references foodflow.restaurant_tables(tenant_id, id) on delete restrict,
  foreign key (tenant_id, table_session_id) references foodflow.table_sessions(tenant_id, id) on delete restrict,
  foreign key (recorded_by) references app.users(id) on delete set null,
  foreign key (voided_by) references app.users(id) on delete set null
);

create table payments.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  payment_id uuid not null,
  order_id uuid not null,
  allocated_amount_minor bigint not null check (allocated_amount_minor >= 0),
  created_at timestamptz not null default now(),
  unique (tenant_id, payment_id, order_id),
  foreign key (tenant_id, payment_id) references payments.payments(tenant_id, id) on delete restrict,
  foreign key (tenant_id, order_id) references foodflow.orders(tenant_id, id) on delete restrict
);

create table payments.payment_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  payment_id uuid not null,
  event_type text not null check (btrim(event_type) <> ''),
  actor_id uuid,
  reason text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  correlation_id text,
  foreign key (tenant_id, payment_id) references payments.payments(tenant_id, id) on delete restrict,
  foreign key (actor_id) references app.users(id) on delete set null
);

create table audit.events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  restaurant_id uuid,
  branch_id uuid,
  actor_id uuid,
  actor_name_snapshot text,
  action text not null check (btrim(action) <> ''),
  entity_type text not null check (btrim(entity_type) <> ''),
  entity_id uuid,
  summary text not null,
  reason text,
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  correlation_id text,
  foreign key (tenant_id) references app.organizations(id) on delete restrict,
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete restrict,
  foreign key (tenant_id, branch_id) references app.branches(tenant_id, id) on delete restrict,
  foreign key (actor_id) references app.users(id) on delete set null
);

create index restaurants_tenant_idx on app.restaurants (tenant_id);
create index branches_tenant_restaurant_idx on app.branches (tenant_id, restaurant_id);
create index branch_hours_branch_idx on app.branch_opening_hours (tenant_id, branch_id, day_of_week, display_order);
create index memberships_user_idx on app.memberships (user_id, status);
create index restaurant_tables_branch_idx on foodflow.restaurant_tables (tenant_id, branch_id, active, display_order);
create index table_sessions_branch_status_idx on foodflow.table_sessions (tenant_id, branch_id, status, opened_at desc);
create index menu_categories_restaurant_idx on foodflow.menu_categories (tenant_id, restaurant_id, active, display_order);
create index modifier_groups_restaurant_idx on foodflow.modifier_groups (tenant_id, restaurant_id, active, display_order);
create index menu_items_restaurant_category_idx on foodflow.menu_items (tenant_id, restaurant_id, category_id, status, display_order);
create index carts_table_status_idx on foodflow.carts (tenant_id, table_id, status, updated_at desc);
create index cart_items_cart_idx on foodflow.cart_items (tenant_id, cart_id, created_at);
create index orders_session_idx on foodflow.orders (tenant_id, table_session_id, submitted_at desc);
create index orders_branch_status_idx on foodflow.orders (tenant_id, branch_id, status, submitted_at desc);
create index kitchen_tickets_queue_idx on foodflow.kitchen_tickets (tenant_id, branch_id, station, status, created_at);
create index service_requests_queue_idx on foodflow.service_requests (tenant_id, branch_id, status, requested_at);
create index payments_session_idx on payments.payments (tenant_id, table_session_id, recorded_at desc);
create index audit_events_tenant_time_idx on audit.events (tenant_id, occurred_at desc);

-- Shared canonical updated_at trigger.
create trigger organizations_set_updated_at before update on app.organizations for each row execute function private.set_updated_at();
create trigger restaurants_set_updated_at before update on app.restaurants for each row execute function private.set_updated_at();
create trigger branches_set_updated_at before update on app.branches for each row execute function private.set_updated_at();
create trigger branch_settings_set_updated_at before update on app.branch_settings for each row execute function private.set_updated_at();
create trigger users_set_updated_at before update on app.users for each row execute function private.set_updated_at();
create trigger memberships_set_updated_at before update on app.memberships for each row execute function private.set_updated_at();
create trigger restaurant_tables_set_updated_at before update on foodflow.restaurant_tables for each row execute function private.set_updated_at();
create trigger table_sessions_set_updated_at before update on foodflow.table_sessions for each row execute function private.set_updated_at();
create trigger menu_categories_set_updated_at before update on foodflow.menu_categories for each row execute function private.set_updated_at();
create trigger menu_badges_set_updated_at before update on foodflow.menu_badges for each row execute function private.set_updated_at();
create trigger menu_availabilities_set_updated_at before update on foodflow.menu_availabilities for each row execute function private.set_updated_at();
create trigger modifier_groups_set_updated_at before update on foodflow.modifier_groups for each row execute function private.set_updated_at();
create trigger modifier_choices_set_updated_at before update on foodflow.modifier_choices for each row execute function private.set_updated_at();
create trigger menu_items_set_updated_at before update on foodflow.menu_items for each row execute function private.set_updated_at();
create trigger carts_set_updated_at before update on foodflow.carts for each row execute function private.set_updated_at();
create trigger cart_items_set_updated_at before update on foodflow.cart_items for each row execute function private.set_updated_at();
create trigger orders_set_updated_at before update on foodflow.orders for each row execute function private.set_updated_at();

comment on column foodflow.table_sessions.customer_capability_digest is 'Digest of a future customer table-session capability. Raw capability tokens must never be stored.';
comment on table foodflow.order_items is 'Immutable order-time menu snapshot. Mutable menu data must not rewrite historical order facts.';
comment on table foodflow.order_item_modifiers is 'Immutable order-time modifier snapshot for historical display and financial correctness.';
comment on table audit.events is 'Append-oriented tenant audit history. Runtime mutation is intentionally restricted.';

-- Tenant-owned tables use RLS as a defense-in-depth baseline for the future server runtime.
do $rls$
declare
  target record;
begin
  for target in
    select * from (values
      ('app','organizations'),
      ('app','restaurants'),
      ('app','branches'),
      ('app','branch_opening_hours'),
      ('app','branch_settings'),
      ('app','roles'),
      ('app','memberships'),
      ('foodflow','restaurant_tables'),
      ('foodflow','table_sessions'),
      ('foodflow','menu_categories'),
      ('foodflow','menu_badges'),
      ('foodflow','menu_availabilities'),
      ('foodflow','menu_availability_windows'),
      ('foodflow','modifier_groups'),
      ('foodflow','modifier_choices'),
      ('foodflow','menu_items'),
      ('foodflow','menu_item_modifier_groups'),
      ('foodflow','menu_item_badges'),
      ('foodflow','carts'),
      ('foodflow','cart_items'),
      ('foodflow','cart_item_modifiers'),
      ('foodflow','orders'),
      ('foodflow','order_items'),
      ('foodflow','order_item_modifiers'),
      ('foodflow','order_events'),
      ('foodflow','kitchen_tickets'),
      ('foodflow','kitchen_ticket_items'),
      ('foodflow','service_requests'),
      ('payments','payments'),
      ('payments','payment_allocations'),
      ('payments','payment_events'),
      ('audit','events')
    ) as t(schema_name, table_name)
  loop
    execute format('alter table %I.%I enable row level security', target.schema_name, target.table_name);
    execute format('alter table %I.%I force row level security', target.schema_name, target.table_name);
    execute format(
      'create policy tenant_isolation on %I.%I for all to flow_runtime using (tenant_id = private.current_tenant_id()) with check (tenant_id = private.current_tenant_id())',
      target.schema_name,
      target.table_name
    );
  end loop;
end
$rls$;

grant select, insert, update, delete on all tables in schema app, foodflow, payments to flow_runtime;
revoke all on app.users, app.permissions, app.role_permissions from flow_runtime;
grant select, insert on audit.events to flow_runtime;
revoke update, delete on audit.events from flow_runtime;
