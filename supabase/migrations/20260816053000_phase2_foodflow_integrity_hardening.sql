alter table app.branch_settings
  drop constraint branch_settings_tenant_id_restaurant_id_fkey,
  drop constraint branch_settings_tenant_id_branch_id_fkey,
  add constraint branch_settings_branch_restaurant_fkey
    foreign key (tenant_id, restaurant_id, branch_id)
    references app.branches(tenant_id, restaurant_id, id)
    on delete cascade;

alter table foodflow.table_sessions
  drop constraint table_sessions_tenant_id_table_id_fkey,
  add constraint table_sessions_branch_table_fkey
    foreign key (tenant_id, branch_id, table_id)
    references foodflow.restaurant_tables(tenant_id, branch_id, id)
    on delete restrict;

alter table foodflow.carts
  drop constraint carts_tenant_id_table_id_fkey,
  drop constraint carts_tenant_id_table_session_id_fkey,
  add constraint carts_branch_table_fkey
    foreign key (tenant_id, branch_id, table_id)
    references foodflow.restaurant_tables(tenant_id, branch_id, id)
    on delete restrict,
  add constraint carts_branch_session_fkey
    foreign key (tenant_id, branch_id, table_session_id)
    references foodflow.table_sessions(tenant_id, branch_id, id)
    on delete restrict;

alter table foodflow.orders
  drop constraint orders_tenant_id_restaurant_id_fkey,
  drop constraint orders_tenant_id_branch_id_fkey,
  drop constraint orders_tenant_id_table_id_fkey,
  drop constraint orders_tenant_id_table_session_id_fkey,
  add constraint orders_branch_restaurant_fkey
    foreign key (tenant_id, restaurant_id, branch_id)
    references app.branches(tenant_id, restaurant_id, id)
    on delete restrict,
  add constraint orders_branch_table_fkey
    foreign key (tenant_id, branch_id, table_id)
    references foodflow.restaurant_tables(tenant_id, branch_id, id)
    on delete restrict,
  add constraint orders_branch_session_fkey
    foreign key (tenant_id, branch_id, table_session_id)
    references foodflow.table_sessions(tenant_id, branch_id, id)
    on delete restrict;

alter table foodflow.kitchen_tickets
  drop constraint kitchen_tickets_tenant_id_table_id_fkey,
  drop constraint kitchen_tickets_tenant_id_table_session_id_fkey,
  add constraint kitchen_tickets_branch_table_fkey
    foreign key (tenant_id, branch_id, table_id)
    references foodflow.restaurant_tables(tenant_id, branch_id, id)
    on delete restrict,
  add constraint kitchen_tickets_branch_session_fkey
    foreign key (tenant_id, branch_id, table_session_id)
    references foodflow.table_sessions(tenant_id, branch_id, id)
    on delete restrict;

alter table foodflow.service_requests
  drop constraint service_requests_tenant_id_table_id_fkey,
  drop constraint service_requests_tenant_id_table_session_id_fkey,
  add constraint service_requests_branch_table_fkey
    foreign key (tenant_id, branch_id, table_id)
    references foodflow.restaurant_tables(tenant_id, branch_id, id)
    on delete restrict,
  add constraint service_requests_branch_session_fkey
    foreign key (tenant_id, branch_id, table_session_id)
    references foodflow.table_sessions(tenant_id, branch_id, id)
    on delete restrict;

alter table payments.payments
  drop constraint payments_tenant_id_restaurant_id_fkey,
  drop constraint payments_tenant_id_branch_id_fkey,
  drop constraint payments_tenant_id_table_id_fkey,
  drop constraint payments_tenant_id_table_session_id_fkey,
  add constraint payments_branch_restaurant_fkey
    foreign key (tenant_id, restaurant_id, branch_id)
    references app.branches(tenant_id, restaurant_id, id)
    on delete restrict,
  add constraint payments_branch_table_fkey
    foreign key (tenant_id, branch_id, table_id)
    references foodflow.restaurant_tables(tenant_id, branch_id, id)
    on delete restrict,
  add constraint payments_branch_session_fkey
    foreign key (tenant_id, branch_id, table_session_id)
    references foodflow.table_sessions(tenant_id, branch_id, id)
    on delete restrict;

create index branch_settings_restaurant_idx on app.branch_settings (tenant_id, restaurant_id);
create index roles_tenant_idx on app.roles (tenant_id);
create index memberships_role_idx on app.memberships (tenant_id, role_id);
create index memberships_branch_idx on app.memberships (tenant_id, branch_id) where branch_id is not null;
create index menu_badges_restaurant_idx on foodflow.menu_badges (tenant_id, restaurant_id, active);
create index menu_availabilities_restaurant_idx on foodflow.menu_availabilities (tenant_id, restaurant_id, active);
create index menu_windows_availability_idx on foodflow.menu_availability_windows (tenant_id, availability_id, day_of_week, display_order);
create index menu_items_availability_idx on foodflow.menu_items (tenant_id, availability_id);
create index modifier_choices_group_idx on foodflow.modifier_choices (tenant_id, modifier_group_id, active, display_order);
create index menu_item_modifier_group_idx on foodflow.menu_item_modifier_groups (tenant_id, modifier_group_id);
create index menu_item_badge_idx on foodflow.menu_item_badges (tenant_id, badge_id);
create index carts_session_idx on foodflow.carts (tenant_id, table_session_id) where table_session_id is not null;
create index cart_items_menu_item_idx on foodflow.cart_items (tenant_id, menu_item_id);
create index cart_item_modifiers_item_idx on foodflow.cart_item_modifiers (tenant_id, cart_item_id);
create index order_items_menu_item_idx on foodflow.order_items (tenant_id, menu_item_id) where menu_item_id is not null;
create index order_item_modifiers_item_idx on foodflow.order_item_modifiers (tenant_id, order_item_id);
create index order_events_order_idx on foodflow.order_events (tenant_id, order_id, occurred_at);
create index kitchen_ticket_items_ticket_idx on foodflow.kitchen_ticket_items (tenant_id, ticket_id);
create index kitchen_ticket_items_order_item_idx on foodflow.kitchen_ticket_items (tenant_id, order_item_id);
create index service_requests_table_idx on foodflow.service_requests (tenant_id, table_id, requested_at);
create index payments_table_idx on payments.payments (tenant_id, table_id, recorded_at desc);
create index payment_events_payment_idx on payments.payment_events (tenant_id, payment_id, occurred_at);
